// Free / Pro membership: plans, subscriptions, expiry, entitlements. ALL Pro permission checks run on the server.
import crypto from "node:crypto";
import { grantSource, summary, expireEntitlements, revokeUserSources } from "./entitlements.js";
import { issueLicense, expireLicenses } from "./licenses.js";
import { issueFamily, expireFamilies } from "./family.js";

const now = () => new Date().toISOString();
const addMonths = (iso, m) => { const d = new Date(iso); d.setUTCMonth(d.getUTCMonth() + m); return d.toISOString(); };

export async function listPlans(db, { all = false, kind = null } = {}) {
  const where = [all ? "" : "active = 1", kind ? "kind = ?" : ""].filter(Boolean);
  const rows = await db.prepare(`SELECT id, name, name_en AS \"nameEn\", kind, seats, quote_only AS \"quoteOnly\", months, price_vnd AS \"priceVnd\", active, sort FROM plans ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY sort, months`).all(...(kind ? [kind] : []));
  return rows.map((p) => ({ ...p, active: !!p.active, quoteOnly: !!p.quoteOnly, perMonth: Math.round(p.priceVnd / p.months) }));
}

// Current membership status: aggregated from entitlements (all sources). Admins always have full access.
export async function membership(db, user) {
  if (!user) return { tier: "free", pro: false, sources: [] };
  const sm = await summary(db, user);
  const t = now();
  const sub = await db.prepare("SELECT s.*, p.name AS plan_name FROM subscriptions s LEFT JOIN plans p ON p.id = s.plan_id WHERE s.user_id = ? AND s.status IN ('active','canceled') AND s.starts_at <= ? AND s.expires_at > ? ORDER BY s.expires_at DESC LIMIT 1").get(user.id, t, t);
  const personalUntil = sm.sources.filter((x) => x.type === "personal" || x.type === "admin_grant").reduce((m, x) => (x.expiresAt > m ? x.expiresAt : m), "");
  if (user.role === "admin" && !sm.sources.length) return { tier: "pro", pro: true, staff: true, planName: "Quản trị", expiresAt: null, features: sm.features, sources: [] };
  if (sm.features.pro) {
    const top = sm.sources[0] || {};
    return {
      tier: "pro", pro: true, staff: user.role === "admin" && !sm.sources.length,
      planName: sub ? sub.plan_name || "Pro" : top.label || "Pro", planId: sub ? sub.plan_id : null,
      expiresAt: sm.proUntil, personalExpiresAt: personalUntil || null,
      renewReminder: sub ? !!sub.renew_reminder : false, canceled: sub ? sub.status === "canceled" : false,
      source: top.type, features: sm.features, sources: sm.sources,
    };
  }
  return { tier: "free", pro: false, features: sm.features, sources: [] };
}

export const isPro = async (db, user) => (await membership(db, user)).pro;

// Add Pro time (chained after current expiry date if still active). Call inside a transaction.
export async function grantPro(db, { userId, planId, months, source, orderId = null, note = "" }) {
  const t = now();
  const last = await db.prepare("SELECT MAX(expires_at) AS e FROM subscriptions WHERE user_id = ? AND status IN ('active','canceled') AND expires_at > ?").get(userId, t);
  // Pro trial is also a personal entitlement. When purchasing during a trial,
  // chain the new plan after the trial expiry instead of losing remaining trial days.
  const entitlementLast = await db.prepare(`SELECT MAX(expires_at) AS e FROM entitlements
    WHERE user_id = ? AND feature = 'pro' AND status = 'active'
      AND source_type IN ('personal','admin_grant') AND expires_at > ?
      AND (source_id IS NULL OR source_id NOT LIKE 'daily:%')`).get(userId, t);
  const candidates = [last?.e, entitlementLast?.e].filter((v) => v && v > t).sort();
  const start = candidates.at(-1) || t;
  const end = addMonths(start, months);
  const info = await db.prepare("INSERT INTO subscriptions (user_id, plan_id, status, starts_at, expires_at, renew_reminder, source, order_id, note, created_at) VALUES (?, ?, 'active', ?, ?, 1, ?, ?, ?, ?) RETURNING id")
    .run(userId, planId, start, end, source, orderId, String(note).slice(0, 300), t);
  const id = Number(info.lastInsertRowid);
  // 4.0: each Pro period is a separate entitlement source (personal / admin grant)
  await grantSource(db, { userId, sourceType: source === "admin" ? "admin_grant" : "personal", sourceId: id, startsAt: start, expiresAt: end, note: note || (orderId ? "Đơn #" + orderId : "") });
  return { id, startsAt: start, expiresAt: end };
}

// Revoke personal / admin-granted Pro (DOES NOT touch class or family entitlements)
export async function revokePersonalPro(db, userId, actorId, note) {
  const n = (await db.prepare("UPDATE subscriptions SET status = 'revoked', note = COALESCE(note, '') || ? WHERE user_id = ? AND status IN ('active','canceled') AND expires_at > ?").run(" | Thu hồi: " + String(note).slice(0, 200), userId, now())).changes;
  await revokeUserSources(db, userId, ["personal", "admin_grant"], actorId, note);
  return n;
}

// Grant entitlements by plan type when an order is paid (webhook, manual confirmation, transaction match). Call inside a transaction.
export async function fulfillOrder(db, order, provider = "order") {
  const plan = await db.prepare("SELECT * FROM plans WHERE id = ?").get(order.plan_id) || { months: 1, kind: "pro", seats: 1 };
  if (plan.kind === "family") return { kind: "family", group: await issueFamily(db, { ownerId: order.user_id, seats: plan.seats, months: plan.months }) };
  if (plan.kind === "teacher") return { kind: "teacher", license: await issueLicense(db, { ownerId: order.user_id, seats: plan.seats, months: plan.months, orderId: order.id }) };
  return { kind: "pro", subscription: await grantPro(db, { userId: order.user_id, planId: order.plan_id, months: plan.months, source: provider === "manual" ? "manual" : "order", orderId: order.id }) };
}

// Mark expired subscriptions (periodic job). Only updates status for reporting; Pro access expires automatically via expires_at.
export async function expireSubscriptions(db) {
  const t = now();
  const a = (await db.prepare("UPDATE subscriptions SET status = 'expired' WHERE status IN ('active','canceled') AND expires_at <= ?").run(t)).changes;
  // Orders where the learner reported "transfer completed" (personal QR) do not auto-expire: wait for admin reconciliation
  const b = (await db.prepare("UPDATE orders SET status = 'expired' WHERE status = 'pending' AND expires_at <= ?").run(t)).changes;
  return { subscriptions: a, orders: b, entitlements: await expireEntitlements(db), licenses: await expireLicenses(db), families: await expireFamilies(db) };
}

// Order code: PL + 6 easy-to-read/type characters for bank transfer memos (no 0/O, 1/I).
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export async function newOrderCode(db) {
  for (let i = 0; i < 20; i++) {
    const b = crypto.randomBytes(6);
    const code = "PL" + [...b].map((x) => ALPHA[x % ALPHA.length]).join("");
    if (!(await db.prepare("SELECT 1 FROM orders WHERE code = ?").get(code))) return code;
  }
  throw new Error("Không tạo được mã đơn");
}
export const ORDER_CODE_RE = /PL[A-HJ-NP-Z2-9]{6}/;

export async function createOrder(db, { userId, planId, expireHours = 24 }) {
  const plan = await db.prepare("SELECT * FROM plans WHERE id = ? AND active = 1").get(planId);
  if (!plan) return { error: "Gói không tồn tại hoặc đã ngừng bán." };
  if (plan.quote_only || !(plan.price_vnd > 0)) return { error: "Gói này cần liên hệ để nhận báo giá." };
  const t = now();
  // Reuse existing pending order for the same plan (avoid creating duplicate orders on multiple clicks)
  const open = await db.prepare("SELECT * FROM orders WHERE user_id = ? AND plan_id = ? AND status = 'pending' AND expires_at > ? ORDER BY id DESC LIMIT 1").get(userId, planId, t);
  if (open) return { order: open };
  const pending = (await db.prepare("SELECT COUNT(*) AS n FROM orders WHERE user_id = ? AND status = 'pending' AND expires_at > ?").get(userId, t)).n;
  if (pending >= 3) return { error: "Bạn đang có 3 đơn chờ thanh toán. Hãy thanh toán hoặc hủy bớt đơn cũ." };
  const code = await newOrderCode(db);
  const exp = new Date(Date.now() + expireHours * 3600000).toISOString();
  const info = await db.prepare("INSERT INTO orders (code, user_id, plan_id, amount_vnd, status, created_at, expires_at) VALUES (?, ?, ?, ?, 'pending', ?, ?) RETURNING id").run(code, userId, planId, plan.price_vnd, t, exp);
  return { order: await db.prepare("SELECT * FROM orders WHERE id = ?").get(Number(info.lastInsertRowid)) };
}

export function publicOrder(o, plan) {
  if (!o) return null;
  return { id: o.id, code: o.code, planId: o.plan_id, planName: plan ? plan.name : o.plan_id, amountVnd: o.amount_vnd, status: o.status, createdAt: o.created_at, expiresAt: o.expires_at, paidAt: o.paid_at, claimedAt: o.claimed_at || null };
}

// Process 1 verified bank transaction (from SePay webhook or manual reconciliation).
// Idempotent: (provider, txnId) is unique; duplicate transaction -> return previous result without re-activating.
export async function applyPayment(db, { provider, txnId, amount, content, code, raw, transferType = "in" }) {
  const t = now();
  // Each transaction runs inside 1 Postgres transaction: early returns inside
  // will commit (matching COMMIT before each return in the legacy SQLite version).
  return db.tx(async (tx) => {
    const dup = await tx.prepare("SELECT * FROM payments WHERE provider = ? AND provider_txn_id = ?").get(provider, String(txnId));
    if (dup) return { duplicate: true, payment: dup };
    const ins = async (status, orderId, note) => tx.prepare("INSERT INTO payments (provider, provider_txn_id, order_id, amount_vnd, content, status, note, raw_json, received_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id")
      .run(provider, String(txnId), orderId, Math.round(Number(amount) || 0), String(content || "").slice(0, 500), status, note, JSON.stringify(raw || {}).slice(0, 4000), t);
    if (transferType !== "in") { await ins("ignored", null, transferType === "out" ? "Giao dịch tiền ra" : "Giao dịch vào tài khoản khác tài khoản nhận tiền đã cấu hình"); return { status: "ignored" }; }
    const found = String(code || "").toUpperCase().match(ORDER_CODE_RE) || String(content || "").toUpperCase().match(ORDER_CODE_RE);
    const order = found ? await tx.prepare("SELECT * FROM orders WHERE code = ?").get(found[0]) : null;
    if (!order) { await ins("unmatched", null, found ? "Mã đơn không tồn tại" : "Nội dung chuyển khoản không có mã đơn"); return { status: "unmatched" }; }
    if (order.status === "paid") { await ins("mismatch", order.id, "Đơn đã thanh toán trước đó (chuyển trùng?)"); return { status: "mismatch", reason: "already_paid" }; }
    if (order.status === "canceled") { await ins("mismatch", order.id, "Đơn đã bị hủy"); return { status: "mismatch", reason: "canceled" }; }
    if (Math.round(Number(amount)) < order.amount_vnd) { await ins("mismatch", order.id, `Chuyển thiếu: nhận ${amount}, cần ${order.amount_vnd}`); return { status: "mismatch", reason: "amount" }; }
    if (order.status === "expired" && Date.now() - Date.parse(order.expires_at) > 7 * 86400000) { await ins("mismatch", order.id, "Đơn đã hết hạn quá 7 ngày"); return { status: "mismatch", reason: "expired" }; }
    const pay = await ins("matched", order.id, "");
    const plan = await tx.prepare("SELECT * FROM plans WHERE id = ?").get(order.plan_id);
    await tx.prepare("UPDATE orders SET status = 'paid', paid_at = ?, payment_id = ? WHERE id = ? AND status IN ('pending','expired')").run(t, Number(pay.lastInsertRowid), order.id);
    const sub = await fulfillOrder(tx, order, provider);
    return { status: "matched", orderId: order.id, userId: order.user_id, subscription: sub };
  });
}

export function verifySepay(req, rawBody, { secret, apiKey, maxSkewSec = 300 }) {
  const safeEq = (a, b) => { const x = Buffer.from(String(a)); const y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
  if (secret) {
    const sig = String(req.headers["x-sepay-signature"] || "");
    const ts = String(req.headers["x-sepay-timestamp"] || "");
    if (!sig || !/^\d+$/.test(ts)) return { ok: false, reason: "Thiếu chữ ký" };
    if (Math.abs(Date.now() / 1000 - Number(ts)) > maxSkewSec) return { ok: false, reason: "Chữ ký quá cũ" };
    const expected = "sha256=" + crypto.createHmac("sha256", secret).update(ts + "." + rawBody).digest("hex");
    return safeEq(sig, expected) ? { ok: true, method: "hmac" } : { ok: false, reason: "Sai chữ ký" };
  }
  if (apiKey) {
    const h = String(req.headers.authorization || "");
    return safeEq(h, "Apikey " + apiKey) ? { ok: true, method: "apikey" } : { ok: false, reason: "Sai API key" };
  }
  return { ok: false, reason: "Chưa cấu hình SEPAY_WEBHOOK_SECRET hoặc SEPAY_API_KEY" };
}
