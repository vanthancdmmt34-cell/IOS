// 4.10.4 — Payment confirmation via Zalo.
// Outbound: when a learner clicks "I have transferred" (or SePay reports payment), the system POSTs a message
//   to the admin's Zalo bot (zaloWebhookUrl). The bot simply forwards the `text` field to your Zalo.
// Inbound: you message the bot "HT PL4Z2BW6"; the bot POSTs that exact text to /api/integrations/zalo with a secret token,
//   and the system activates the plan and returns `reply` for the bot to send back to you.
// Commands: HT <order code> (confirm) · HUY <order code> [reason] (reject) · DON (pending orders) · HELP.
import crypto from "node:crypto";
import { applyPayment, ORDER_CODE_RE } from "./membership.js";
import { notify } from "./notify.js";

const vnd = (n) => new Intl.NumberFormat("vi-VN").format(Number(n) || 0) + "đ";
const vnTime = (iso) => { try { return new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }).format(new Date(iso)); } catch { return iso; } };

export function zaloReady(S) { return !!(S.zaloEnabled && /^https?:\/\//i.test(String(S.zaloWebhookUrl || "")) && String(S.zaloSecret || "").length >= 16); }

export function secretOk(S, given) {
  const a = Buffer.from(String(S.zaloSecret || "")), b = Buffer.from(String(given || ""));
  return a.length >= 16 && a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function orderInfo(db, o) {
  const plan = await db.prepare("SELECT name FROM plans WHERE id = ?").get(o.plan_id);
  const u = await db.prepare("SELECT username, display_name FROM users WHERE id = ?").get(o.user_id);
  return { plan: plan ? plan.name : o.plan_id, user: u ? `${u.display_name || u.username} (@${u.username})` : `#${o.user_id}` };
}

/** Send message to Zalo bot (thu-ky-zalo /send). Never throws; returns result for logging / test-send feedback.
    Bot /send doi: header x-bot-secret (= N8N_INBOUND_SECRET, cung gia tri S.zaloSecret),
    body {threadId, message, threadType}. Chi can message text de forward vao DM cua Võ. */
export async function zaloPush(S, event, text, extra = {}) {
  if (!zaloReady(S)) return { ok: false, skipped: true };
  try {
    const r = await fetch(String(S.zaloWebhookUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bot-secret": String(S.zaloSecret), "User-Agent": "LifeRivo-ZaloPay/1.0" },
      body: JSON.stringify({ threadId: String(S.zaloAdminId || ""), message: text, threadType: "user" }),
      signal: AbortSignal.timeout(8000),
    });
    return { ok: r.ok, status: r.status };
  } catch (e) { return { ok: false, error: String(e.message || e).slice(0, 200) }; }
}

export async function pushOrderClaimed(db, S, o) {
  const i = await orderInfo(db, o);
  const text = `🧾 Đơn ${o.code} · ${i.plan} · ${vnd(o.amount_vnd)}\nHọc viên: ${i.user}\nĐã báo chuyển khoản lúc ${vnTime(o.claimed_at || new Date().toISOString())}.\n\nKiểm tra tài khoản ngân hàng, nếu đã nhận đủ tiền với nội dung ${o.code} thì trả lời:\nHT ${o.code}\nKhông thấy tiền thì trả lời: HUY ${o.code} <lý do>`;
  return zaloPush(S, "order_claimed", text, { order: { code: o.code, amount: o.amount_vnd, plan: i.plan, user: i.user } });
}
export async function pushOrderPaid(db, S, o, via) {
  const i = await orderInfo(db, o);
  return zaloPush(S, "order_paid", `✅ Đơn ${o.code} đã thanh toán (${via}) · ${i.plan} · ${vnd(o.amount_vnd)}\nHọc viên: ${i.user}`, { order: { code: o.code, amount: o.amount_vnd } });
}

/** Handle an admin command sent via Zalo. Returns { ok, reply }. */
export async function zaloCommand(db, S, rawText, { audit } = {}) {
  const text = String(rawText || "").trim().replace(/\s+/g, " ");
  const up = text.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/Đ/g, "D");
  const code = (up.match(ORDER_CODE_RE) || [])[0];
  const cmd = up.split(" ")[0];
  if (cmd === "DON" || cmd === "DS") {
    const rows = await db.prepare("SELECT * FROM orders WHERE status = 'pending' AND claimed_at IS NOT NULL ORDER BY claimed_at DESC LIMIT 10").all();
    if (!rows.length) return { ok: true, reply: "Không có đơn nào đang chờ xác nhận." };
    const lines = [];
    for (const o of rows) { const i = await orderInfo(db, o); lines.push(`• ${o.code} · ${vnd(o.amount_vnd)} · ${i.plan} · ${i.user}`); }
    return { ok: true, reply: `Đơn chờ xác nhận (${rows.length}):\n${lines.join("\n")}\n\nTrả lời HT <mã đơn> để kích hoạt.` };
  }
  if ((cmd === "HT" || cmd === "XN" || cmd === "OK") && code) {
    const o = await db.prepare("SELECT * FROM orders WHERE code = ?").get(code);
    if (!o) return { ok: false, reply: `Không có đơn ${code}.` };
    if (o.status === "paid") return { ok: true, reply: `Đơn ${code} đã được kích hoạt trước đó.` };
    const r = await applyPayment(db, { provider: "zalo", txnId: `zalo:${code}`, amount: o.amount_vnd, content: code, code, raw: { via: "zalo", text: text.slice(0, 200) } });
    if (r.duplicate) return { ok: false, reply: `Đơn ${code} đã được xác nhận qua Zalo trước đó.` };
    if (r.status !== "matched") return { ok: false, reply: `Không kích hoạt được đơn ${code}: ${{ canceled: "đơn đã bị hủy", expired: "đơn hết hạn quá 7 ngày", already_paid: "đơn đã thanh toán", amount: "số tiền không khớp" }[r.reason] || r.reason || r.status}.` };
    const i = await orderInfo(db, o);
    const exp = r.subscription && r.subscription.subscription && r.subscription.subscription.expiresAt;
    try { await notify(db, { userId: o.user_id, kind: "order_paid", title: `🎉 Đã kích hoạt ${i.plan}`, body: `Cảm ơn bạn! Đơn ${code} đã được xác nhận.${exp ? " Hạn dùng đến " + new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(exp)) + "." : ""}`, link: "/app/goi-cua-toi" }); } catch {}
    if (audit) audit(null, "order.zalo_confirm", "order:" + o.id, { code });
    return { ok: true, reply: `✅ Đã kích hoạt ${i.plan} cho ${i.user} (đơn ${code}, ${vnd(o.amount_vnd)}). Học viên đã nhận thông báo.` };
  }
  if ((cmd === "HUY" || cmd === "TC") && code) {
    const reason = text.replace(/^\S+\s+\S+\s*/, "").slice(0, 200) || "Chưa nhận được tiền";
    const o = await db.prepare("SELECT * FROM orders WHERE code = ?").get(code);
    if (!o) return { ok: false, reply: `Không có đơn ${code}.` };
    const info = await db.prepare("UPDATE orders SET status = 'canceled' WHERE id = ? AND status = 'pending'").run(o.id);
    if (!info.changes) return { ok: false, reply: `Đơn ${code} không còn ở trạng thái chờ (${o.status}).` };
    try { await notify(db, { userId: o.user_id, kind: "order_rejected", title: `Đơn ${code} chưa được xác nhận`, body: `Lý do: ${reason}. Nếu bạn đã chuyển tiền, hãy liên hệ hỗ trợ kèm mã đơn và mã giao dịch ngân hàng.`, link: "/app/goi-cua-toi" }); } catch {}
    if (audit) audit(null, "order.zalo_reject", "order:" + o.id, { code, reason });
    return { ok: true, reply: `Đã từ chối đơn ${code} (${reason}). Học viên đã được báo.` };
  }
  return { ok: false, reply: "Lệnh: HT <mã đơn> để kích hoạt · HUY <mã đơn> <lý do> để từ chối · DON để xem đơn đang chờ. Ví dụ: HT PL4Z2BW6" };
}
