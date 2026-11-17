// Xác thực email và mã Pro 7 ngày tặng qua email.
// - Học viên gửi mã 6 số tới email khôi phục, nhập đúng thì email được xác thực.
// - Sau khi xác thực, hệ thống tự tạo một mã Pro 7 ngày và gửi qua email. Mỗi địa chỉ email chỉ nhận một lần,
//   kể cả khi đăng ký nhiều tài khoản (gmail: bỏ dấu chấm và phần "+..." khi so sánh).
// - Gói Pro theo tháng vẫn phải mua; mã này không thay thế gói mua.
// Bảng tự tạo khi khởi động (CREATE TABLE IF NOT EXISTS, chạy được cả SQLite lẫn PostgreSQL).
import crypto from "node:crypto";
import { cleanEmail, mailConfigured, sendMail, verifyEmailMail, proGiftMail } from "./mailer.js";
import { createGiftCodes } from "./giftcodes.js";

export const VERIFY_MINUTES = 10;
export const WELCOME_DAYS = 7;
const MAX_ATTEMPTS = 5;

const sha = (salt, code) => crypto.createHash("sha256").update(`${salt}:${code}`).digest("hex");

// Khóa so sánh cho một địa chỉ: cùng hộp thư gmail thì coi là một.
export function canonicalEmail(raw) {
  const e = cleanEmail(raw);
  if (!e) return "";
  const [local, domain] = e.split("@");
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return local.split("+")[0].replace(/\./g, "") + "@gmail.com";
  }
  return e;
}

export async function ensureEmailVerifyTables(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS email_verifications (
    user_id INTEGER PRIMARY KEY,
    email TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS email_verified (
    user_id INTEGER PRIMARY KEY,
    email TEXT NOT NULL,
    verified_at TEXT NOT NULL
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS email_welcome_grants (
    canon_email TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    gift_code TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`).run();
}

async function verifiedRow(db, user) {
  const r = await db.prepare("SELECT email FROM email_verified WHERE user_id = ?").get(user.id);
  const cur = cleanEmail(user.email || "");
  return !!(r && cur && r.email === cur);
}

// Gửi mã Pro 7 ngày cho email vừa xác thực (mỗi địa chỉ một lần). Trả về trạng thái để giao diện báo đúng.
async function issueWelcomeGift(db, user, email, now = new Date().toISOString()) {
  const canon = canonicalEmail(email);
  const existing = await db.prepare("SELECT gift_code FROM email_welcome_grants WHERE canon_email = ?").get(canon);
  if (existing) return { status: "already" };
  if (!mailConfigured()) return { status: "mail_off" };
  const [code] = await createGiftCodes(db, { id: user.id }, { count: 1, days: WELCOME_DAYS, note: "Tặng khi xác thực email" });
  await db.prepare("INSERT INTO email_welcome_grants (canon_email, email, user_id, gift_code, created_at) VALUES (?, ?, ?, ?, ?)").run(canon, email, user.id, code, now);
  sendMail({ to: email, ...proGiftMail({ code, days: WELCOME_DAYS, siteName: user.siteName, username: user.username, lang: user.lang }) })
    .catch((e) => console.error("[email] gửi mã Pro thất bại:", e.message));
  return { status: "sent" };
}

// Trả về true nếu đã xử lý đường dẫn /api/me/email/*
export async function emailVerifyApi({ db, req, res, url, method, user: sessUser, sess, sendJson, readBody, requireCsrf, hit, siteName }) {
  if (!url.pathname.startsWith("/api/me/email/")) return false;
  const p = url.pathname;
  // Đọc lại email và ngôn ngữ từ CSDL: phiên đăng nhập không mang sẵn các trường này.
  const row0 = await db.prepare("SELECT username, email, lang FROM users WHERE id = ?").get(sessUser.id);
  if (!row0) { sendJson(res, 401, { error: "Phiên đăng nhập đã hết." }); return true; }
  const user = { id: sessUser.id, role: sessUser.role, username: row0.username, email: row0.email || "", lang: row0.lang || "vi" };
  const ctx = { lang: user.lang };

  if (method === "GET" && p === "/api/me/email/status") {
    const email = cleanEmail(user.email || "");
    const verified = await verifiedRow(db, user);
    const grant = email ? await db.prepare("SELECT 1 FROM email_welcome_grants WHERE canon_email = ?").get(canonicalEmail(email)) : null;
    sendJson(res, 200, { email, verified, giftSent: !!grant, mailOn: mailConfigured() });
    return true;
  }

  if (method === "POST" && (p === "/api/me/email/send-code" || p === "/api/me/email/confirm" || p === "/api/me/email/resend-gift")) {
    const body = await readBody(req);
    if (body === null || !requireCsrf(req, sess)) { sendJson(res, 403, { error: "Phiên làm việc không hợp lệ, hãy tải lại trang." }); return true; }
    const email = cleanEmail(user.email || "");
    if (!email) { sendJson(res, 400, { error: "Hãy thêm email khôi phục trước khi xác thực." }); return true; }

    if (p === "/api/me/email/send-code") {
      if (await verifiedRow(db, user)) { sendJson(res, 200, { ok: true, verified: true }); return true; }
      if (!mailConfigured()) { sendJson(res, 503, { error: "Chưa gửi được mã qua email. Hãy liên hệ quản trị viên." }); return true; }
      if (hit("emailv-send:" + user.id, 4, 600000)) { sendJson(res, 429, { error: "Bạn đã yêu cầu mã nhiều lần. Thử lại sau vài phút." }); return true; }
      const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
      const salt = crypto.randomBytes(8).toString("hex");
      const exp = new Date(Date.now() + VERIFY_MINUTES * 60000).toISOString();
      await db.prepare("DELETE FROM email_verifications WHERE user_id = ?").run(user.id);
      await db.prepare("INSERT INTO email_verifications (user_id, email, code_hash, salt, expires_at, attempts, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)").run(user.id, email, sha(salt, code), salt, exp, new Date().toISOString());
      sendMail({ to: email, ...verifyEmailMail({ code, minutes: VERIFY_MINUTES, siteName, username: user.username, lang: ctx.lang }) })
        .catch((e) => console.error("[email] gửi mã xác thực thất bại:", e.message));
      sendJson(res, 200, { ok: true, message: `Đã gửi mã 6 số tới email. Mã có hiệu lực ${VERIFY_MINUTES} phút.` });
      return true;
    }

    if (p === "/api/me/email/confirm") {
      const code = String(body.code || "").trim();
      if (!/^\d{6}$/.test(code)) { sendJson(res, 400, { error: "Mã xác thực gồm 6 chữ số." }); return true; }
      if (hit("emailv-try:" + user.id, 20, 600000)) { sendJson(res, 429, { error: "Bạn nhập sai mã quá nhiều lần. Hãy yêu cầu mã mới sau ít phút." }); return true; }
      const row = await db.prepare("SELECT * FROM email_verifications WHERE user_id = ?").get(user.id);
      if (!row || row.email !== email || row.expires_at <= new Date().toISOString() || row.attempts >= MAX_ATTEMPTS) {
        sendJson(res, 400, { error: "Mã không đúng hoặc đã hết hạn. Hãy yêu cầu mã mới." }); return true;
      }
      const a = Buffer.from(sha(row.salt, code), "hex"), b = Buffer.from(row.code_hash, "hex");
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        await db.prepare("UPDATE email_verifications SET attempts = attempts + 1 WHERE user_id = ?").run(user.id);
        sendJson(res, 400, { error: "Mã không đúng hoặc đã hết hạn. Hãy yêu cầu mã mới." }); return true;
      }
      await db.prepare("DELETE FROM email_verifications WHERE user_id = ?").run(user.id);
      await db.prepare("DELETE FROM email_verified WHERE user_id = ?").run(user.id);
      await db.prepare("INSERT INTO email_verified (user_id, email, verified_at) VALUES (?, ?, ?)").run(user.id, email, new Date().toISOString());
      const gift = await issueWelcomeGift(db, { ...user, siteName, lang: ctx.lang }, email);
      sendJson(res, 200, { ok: true, verified: true, gift: gift.status });
      return true;
    }

    if (p === "/api/me/email/resend-gift") {
      if (!(await verifiedRow(db, user))) { sendJson(res, 400, { error: "Hãy xác thực email trước." }); return true; }
      if (hit("emailv-gift:" + user.id, 3, 600000)) { sendJson(res, 429, { error: "Bạn yêu cầu gửi lại nhiều lần. Thử lại sau vài phút." }); return true; }
      if (!mailConfigured()) { sendJson(res, 503, { error: "Chưa gửi được mã qua email. Hãy liên hệ quản trị viên." }); return true; }
      const g = await db.prepare("SELECT gift_code FROM email_welcome_grants WHERE canon_email = ?").get(canonicalEmail(email));
      if (g) {
        // Mã đã được dùng thì không còn trong kho: không gửi lại mã đã hết hiệu lực.
        const stillThere = await db.prepare("SELECT 1 FROM gift_codes WHERE code = ?").get(g.gift_code);
        if (!stillThere) { sendJson(res, 400, { error: "Mã Pro đã được sử dụng, không gửi lại được." }); return true; }
        sendMail({ to: email, ...proGiftMail({ code: g.gift_code, days: WELCOME_DAYS, siteName, username: user.username, lang: ctx.lang }) })
          .catch((e) => console.error("[email] gửi lại mã Pro thất bại:", e.message));
        sendJson(res, 200, { ok: true, gift: "resent" });
        return true;
      }
      const gift = await issueWelcomeGift(db, { ...user, siteName, lang: ctx.lang }, email);
      sendJson(res, 200, { ok: true, gift: gift.status });
      return true;
    }
  }
  return false;
}
