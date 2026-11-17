// Quên mật khẩu bằng mã OTP gửi về email: chạy máy chủ thật với CSDL tạm và một máy chủ SMTP giả trên máy.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { cleanEmail, maskEmail, mailConfig, mailConfigured } from "../modules/mailer.js";

const mails = [];
let waiter = null;
function fakeSmtp() {
  return net.createServer((sock) => {
    let buf = "", inData = false, data = "", rcpt = "";
    sock.write("220 test ESMTP\r\n");
    sock.on("data", (c) => {
      buf += c.toString("utf8");
      for (;;) {
        if (inData) {
          const end = buf.indexOf("\r\n.\r\n");
          if (end < 0) return;
          data = buf.slice(0, end); buf = buf.slice(end + 5); inData = false;
          mails.push({ rcpt, data });
          if (waiter) { waiter(); waiter = null; }
          sock.write("250 queued\r\n");
          continue;
        }
        const i = buf.indexOf("\r\n");
        if (i < 0) return;
        const line = buf.slice(0, i); buf = buf.slice(i + 2);
        if (/^EHLO/i.test(line)) sock.write("250-test\r\n250 OK\r\n");
        else if (/^RCPT TO:<(.+)>/i.test(line)) { rcpt = /<(.+)>/.exec(line)[1]; sock.write("250 ok\r\n"); }
        else if (/^DATA/i.test(line)) { inData = true; sock.write("354 go\r\n"); }
        else if (/^QUIT/i.test(line)) { sock.write("221 bye\r\n"); sock.end(); }
        else sock.write("250 ok\r\n");
      }
    });
    sock.on("error", () => {});
  });
}
const nextMail = () => new Promise((res, rej) => {
  if (mails.length) return res();
  const t = setTimeout(() => rej(new Error("Không nhận được email OTP")), 8000);
  waiter = () => { clearTimeout(t); res(); };
});
// Lấy mã 6 số trong phần text/plain (base64) của thư.
function codeFrom(raw) {
  const m = /Content-Type: text\/plain[\s\S]*?\r\n\r\n([A-Za-z0-9+/=\r\n]+?)\r\n--/.exec(raw);
  const text = Buffer.from((m ? m[1] : "").replace(/\s+/g, ""), "base64").toString("utf8");
  return (/\b(\d{6})\b/.exec(text) || [])[1] || "";
}

describe("mailer helpers", () => {
  it("validates and masks email addresses", () => {
    assert.equal(cleanEmail("  An.Nguyen@Example.COM "), "an.nguyen@example.com");
    assert.equal(cleanEmail("khong-phai-email"), "");
    assert.equal(cleanEmail("a@b"), "");
    assert.equal(cleanEmail("a b@c.com"), "");
    assert.equal(cleanEmail("x@y.com\r\nBcc: z@z.com"), "");
    assert.equal(maskEmail("annguyen@example.com"), "an***@example.com");
  });
  it("is off until SMTP_HOST is set", () => {
    assert.equal(mailConfigured({}), false);
    assert.equal(mailConfigured({ SMTP_HOST: "smtp.example.com", SMTP_USER: "bot@example.com" }), true);
    assert.equal(mailConfig({ SMTP_HOST: "h", SMTP_PORT: "587" }).secure, false);
    assert.equal(mailConfig({ SMTP_HOST: "h" }).secure, true);
  });
});

describe("forgot password with email OTP", () => {
  let srv, smtp, dir, api;
  const admin = "otp_admin", user = "otp_user", email = "otp.user@example.com";
  before(async () => {
    smtp = fakeSmtp();
    await new Promise((r) => smtp.listen(0, "127.0.0.1", r));
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "study-otp-"));
    Object.assign(process.env, {
      DATA_DIR: dir, SMTP_HOST: "127.0.0.1", SMTP_PORT: String(smtp.address().port), SMTP_SECURE: "0",
      SMTP_ALLOW_INSECURE: "1", SMTP_FROM: "no-reply@example.com", SMTP_USER: "", SMTP_PASS: "",
    });
    const { getTestServer } = await import("./helpers/test-server.mjs");
    srv = await getTestServer();
    api = async (p, body) => { const r = await srv.fetch(p, { method: "POST", body }); return { status: r.status, json: await r.json() }; };
    // Tài khoản đầu tiên là quản trị; tài khoản thứ hai là học viên có email.
    assert.equal((await api("/api/register", { username: admin, password: "matkhau-quan-tri" })).status, 201);
    const r = await api("/api/register", { username: user, password: "matkhau-cu-123", email });
    assert.equal(r.status, 201);
  });
  after(async () => {
    try { await srv.close(); } catch {}
    try { smtp.close(); } catch {}
    setTimeout(() => process.exit(0), 200).unref();
  });

  it("rejects a malformed or duplicate email at sign-up", async () => {
    assert.equal((await api("/api/register", { username: "otp_bad", password: "123456", email: "sai-dinh-dang" })).status, 400);
    assert.equal((await api("/api/register", { username: "otp_dup", password: "123456", email })).status, 400);
  });

  it("answers the same for unknown accounts and sends nothing", async () => {
    const a = await api("/api/password/forgot", { username: "khong_ton_tai_xyz" });
    const b = await api("/api/password/forgot", { username: user });
    assert.equal(a.status, 200);
    assert.deepEqual(a.json, b.json);
    assert.equal(a.json.otp, true);
    await nextMail();
    assert.equal(mails.length, 1);
    assert.equal(mails[0].rcpt, email);
  });

  it("resets the password with the emailed code, once", async () => {
    const code = codeFrom(mails[0].data);
    assert.match(code, /^\d{6}$/);
    const wrongCode = code === "000000" ? "000001" : "000000";
    assert.equal((await api("/api/password/reset-otp", { username: user, code: wrongCode, newPassword: "matkhau-moi-456" })).status, 400);
    // Mã OTP không dùng được ở đường đặt lại bằng liên kết.
    assert.equal((await api("/api/password/reset", { token: "otp:2:aaaaaaaaaaaaaaaa:" + code, newPassword: "matkhau-moi-456" })).status, 400);
    const ok = await api("/api/password/reset-otp", { username: email, code, newPassword: "matkhau-moi-456" });
    assert.equal(ok.status, 200);
    assert.equal(ok.json.username, user);
    assert.equal((await api("/api/login", { username: user, password: "matkhau-cu-123" })).status >= 400, true);
    assert.equal((await api("/api/login", { username: user, password: "matkhau-moi-456" })).status, 200);
    assert.equal((await api("/api/password/reset-otp", { username: user, code, newPassword: "matkhau-khac-789" })).status, 400);
  });

  it("locks out after too many wrong codes", async () => {
    await api("/api/password/forgot", { username: user });
    let last = 0;
    for (let i = 0; i < 6; i++) last = (await api("/api/password/reset-otp", { username: user, code: "999999", newPassword: "matkhau-moi-456" })).status;
    assert.equal(last, 429);
  });
});
