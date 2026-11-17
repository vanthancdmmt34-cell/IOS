// Mã quà tặng Pro và Pro miễn phí 10 phút mỗi ngày.
// - Mã quà tặng: admin tạo ngẫu nhiên; mỗi mã dùng được một lần; mỗi tài khoản chỉ đang dùng một mã tại một thời điểm (không cộng dồn).
// - Pro miễn phí: tài khoản chưa có Pro được dùng 10 phút mỗi ngày; làm mới lúc 5:00 sáng (giờ Việt Nam), không cộng dồn.
// Quyền lợi được ghi vào entitlements (nguồn personal, source_id "gift:<mã>" hoặc "daily:<ngày>"), nên kiểm tra quyền dùng chung với các nguồn khác.
// Bảng tự tạo khi khởi động (CREATE TABLE IF NOT EXISTS, chạy được cả SQLite lẫn PostgreSQL).
import crypto from "node:crypto";
import { grantSource, can } from "./entitlements.js";

export const DAILY_PRO_MINUTES = 10;
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // bỏ 0/O, 1/I để dễ đọc và gõ
const CODE_RE = /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
const DAY = 86400000;

export async function ensureGiftTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS gift_codes (
    code TEXT PRIMARY KEY,
    days INTEGER NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    created_by INTEGER,
    created_at TEXT NOT NULL,
    redeemed_by INTEGER,
    redeemed_at TEXT
  )`).run();
  // Mỗi tài khoản chỉ dùng được một mã trong đời. Lưu theo tài khoản để mã đã dùng được xóa khỏi gift_codes.
  await db.prepare(`CREATE TABLE IF NOT EXISTS gift_redemptions (
    user_id INTEGER PRIMARY KEY,
    code TEXT NOT NULL,
    redeemed_at TEXT NOT NULL
  )`).run();
}

// Khóa ngày theo giờ Việt Nam, đổi lúc 5:00 sáng (UTC+7) = 22:00 UTC.
export function dailyKey(nowMs = Date.now()) {
  return new Date(nowMs + 2 * 3600000).toISOString().slice(0, 10);
}
// Lần làm mới kế tiếp của khóa ngày: 5:00 sáng giờ Việt Nam.
export function nextResetIso(key) {
  return new Date(Date.parse(key + "T00:00:00Z") + 22 * 3600000).toISOString();
}
// Thời điểm bắt đầu chu kỳ hiện tại (5:00 sáng giờ Việt Nam), để đếm hoạt động "hôm nay" theo cùng mốc với mục tiêu.
export function cycleStartIso(nowMs = Date.now()) {
  return new Date(Date.parse(dailyKey(nowMs) + "T00:00:00Z") - 2 * 3600000).toISOString();
}

export function normalizeGiftCode(raw) {
  const s = String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (s.length !== 12) return null;
  const code = `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}`;
  return CODE_RE.test(code) ? code : null;
}

function randomCode() {
  const b = crypto.randomBytes(12);
  const chars = [...b].map((x) => ALPHA[x % ALPHA.length]).join("");
  return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
}

// Mã quà tặng đang còn hạn trên tài khoản (nếu có)
async function activeGift(db, userId, t) {
  return db.prepare("SELECT expires_at FROM entitlements WHERE user_id = ? AND source_type = 'personal' AND source_id LIKE 'gift:%' AND status = 'active' AND expires_at > ? ORDER BY expires_at DESC LIMIT 1").get(userId, t);
}

export async function proAccessStatus(db, user, nowMs = Date.now()) {
  const t = new Date(nowMs).toISOString();
  const key = dailyKey(nowMs);
  const daily = await db.prepare("SELECT expires_at FROM entitlements WHERE user_id = ? AND source_type = 'personal' AND source_id = ? LIMIT 1").get(user.id, "daily:" + key);
  const gift = await activeGift(db, user.id, t);
  const paid = user.role === "admin" ? true : await can(db, user, "pro");
  const dailyActive = !!(daily && daily.expires_at > t);
  return {
    pro: paid || dailyActive || !!gift,
    gift: { active: !!gift, expiresAt: gift ? gift.expires_at : null },
    daily: {
      minutes: DAILY_PRO_MINUTES,
      claimedToday: !!daily,
      activeUntil: dailyActive ? daily.expires_at : null,
      canClaim: !daily && !paid,
      resetAt: nextResetIso(key),
    },
  };
}

export async function claimDailyPro(db, user, nowMs = Date.now()) {
  const key = dailyKey(nowMs);
  const used = await db.prepare("SELECT 1 FROM entitlements WHERE user_id = ? AND source_type = 'personal' AND source_id = ? LIMIT 1").get(user.id, "daily:" + key);
  if (used) return { error: "Hôm nay bạn đã dùng lượt Pro miễn phí. Lượt mới có lúc 5:00 sáng mai." };
  if (user.role === "admin" || await can(db, user, "pro")) return { error: "Bạn đang có Pro nên chưa cần lượt miễn phí." };
  const start = new Date(nowMs).toISOString();
  const end = new Date(nowMs + DAILY_PRO_MINUTES * 60000).toISOString();
  await grantSource(db, { userId: user.id, sourceType: "personal", sourceId: "daily:" + key, startsAt: start, expiresAt: end, note: `Pro miễn phí ${DAILY_PRO_MINUTES} phút ngày ${key}` });
  return { ok: true, expiresAt: end, resetAt: nextResetIso(key) };
}

export async function redeemGift(db, user, rawCode, nowMs = Date.now()) {
  const code = normalizeGiftCode(rawCode);
  if (!code) return { error: "Mã không đúng định dạng. Mã có dạng XXXX-XXXX-XXXX." };
  const t = new Date(nowMs).toISOString();
  if (await db.prepare("SELECT 1 FROM gift_redemptions WHERE user_id = ?").get(user.id)) return { error: "Mỗi tài khoản chỉ dùng được một mã quà tặng." };
  const row = await db.prepare("SELECT days FROM gift_codes WHERE code = ?").get(code);
  if (!row) return { error: "Mã không tồn tại hoặc đã được sử dụng." };
  // Ghi nhận tài khoản trước: hai lần gửi cùng lúc chỉ một lần được ghi.
  try { await db.prepare("INSERT INTO gift_redemptions (user_id, code, redeemed_at) VALUES (?, ?, ?)").run(user.id, code, t); }
  catch { return { error: "Mỗi tài khoản chỉ dùng được một mã quà tặng." }; }
  // Dùng xong thì xóa mã khỏi kho, không giữ lại trên hệ thống.
  const removed = (await db.prepare("DELETE FROM gift_codes WHERE code = ?").run(code)).changes;
  if (!removed) { await db.prepare("DELETE FROM gift_redemptions WHERE user_id = ?").run(user.id); return { error: "Mã này vừa được sử dụng." }; }
  const expiresAt = new Date(nowMs + row.days * DAY).toISOString();
  await grantSource(db, { userId: user.id, sourceType: "personal", sourceId: "gift:" + code, startsAt: t, expiresAt, note: "Mã quà tặng " + row.days + " ngày" });
  return { ok: true, days: row.days, expiresAt };
}

export async function createGiftCodes(db, admin, { count, days, note }, nowMs = Date.now()) {
  const created = new Date(nowMs).toISOString();
  const codes = [];
  while (codes.length < count) {
    const code = randomCode();
    if (codes.includes(code) || await db.prepare("SELECT 1 FROM gift_codes WHERE code = ?").get(code)) continue;
    await db.prepare("INSERT INTO gift_codes (code, days, note, created_by, created_at) VALUES (?, ?, ?, ?, ?)").run(code, days, String(note || "").slice(0, 120), admin.id, created);
    codes.push(code);
  }
  return codes;
}

// Trả về true nếu đã xử lý đường dẫn /api/me/pro-access, /api/me/daily-pro, /api/me/gift, /api/admin/gift-codes
export async function giftApi({ db, req, res, url, method, user, sess, sendJson, readBody, requireCsrf, hit }) {
  const p = url.pathname;
  if (!p.startsWith("/api/me/") && !p.startsWith("/api/admin/gift-codes")) return false;

  if (method === "GET" && p === "/api/me/pro-access") {
    sendJson(res, 200, await proAccessStatus(db, user));
    return true;
  }

  if (method === "POST" && (p === "/api/me/daily-pro" || p === "/api/me/gift")) {
    const body = await readBody(req);
    if (body === null || !requireCsrf(req, sess)) { sendJson(res, 403, { error: "Phiên làm việc không hợp lệ, hãy tải lại trang." }); return true; }
    if (hit(`prokey:${user.id}`, 20, 60 * 60 * 1000)) { sendJson(res, 429, { error: "Bạn thử quá nhiều lần. Thử lại sau ít phút nhé." }); return true; }
    const r = p === "/api/me/daily-pro" ? await claimDailyPro(db, user) : await redeemGift(db, user, body.code);
    if (r.error) { sendJson(res, 400, { error: r.error }); return true; }
    sendJson(res, 200, { ...r, status: await proAccessStatus(db, user) });
    return true;
  }

  if (p === "/api/admin/gift-codes") {
    if (user.role !== "admin") { sendJson(res, 403, { error: "Chỉ quản trị viên quản lý mã quà tặng." }); return true; }
    if (method === "GET") {
      const rows = await db.prepare("SELECT code, days, note, created_at FROM gift_codes ORDER BY created_at DESC LIMIT 300").all();
      sendJson(res, 200, { items: rows });
      return true;
    }
    if (method === "POST") {
      const body = await readBody(req);
      if (body === null || !requireCsrf(req, sess)) { sendJson(res, 403, { error: "Phiên làm việc không hợp lệ, hãy tải lại trang." }); return true; }
      const count = Math.floor(Number(body.count));
      const days = Math.floor(Number(body.days));
      if (!(count >= 1 && count <= 200)) { sendJson(res, 400, { error: "Số mã cần tạo từ 1 đến 200." }); return true; }
      if (!(days >= 1 && days <= 365)) { sendJson(res, 400, { error: "Số ngày Pro từ 1 đến 365." }); return true; }
      const codes = await createGiftCodes(db, user, { count, days, note: body.note });
      sendJson(res, 200, { ok: true, codes, days });
      return true;
    }
  }
  return false;
}
