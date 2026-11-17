// Xác thực email bằng mã 6 số, rồi tự gửi mã Pro 7 ngày qua email. Mỗi địa chỉ (gmail: bỏ dấu chấm và "+...")
// chỉ nhận một lần, dù đăng ký nhiều tài khoản. Chạy máy chủ thật với CSDL tạm và SMTP giả trên máy.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { canonicalEmail } from "../modules/emailverify.js";

const mails = [];
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
// Nội dung text/plain (base64) của thư
function textOf(raw) {
  const m = /Content-Type: text\/plain[\s\S]*?\r\n\r\n([A-Za-z0-9+/=\r\n]+?)\r\n--/.exec(raw);
  return Buffer.from((m ? m[1] : "").replace(/\s+/g, ""), "base64").toString("utf8");
}
const sixDigit = (t) => (/\b(\d{6})\b/.exec(t) || [])[1] || "";
const giftIn = (t) => (/\b([A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4})\b/.exec(t) || [])[1] || "";
const waitMail = async (n) => {
  for (let i = 0; i < 80 && mails.length < n; i++) await new Promise((r) => setTimeout(r, 25));
  return mails[n - 1];
};

describe("khóa địa chỉ email", () => {
  it("gmail: bỏ dấu chấm và phần sau dấu +, các địa chỉ khác giữ nguyên", () => {
    assert.equal(canonicalEmail("ban.hoc+1@gmail.com"), "banhoc@gmail.com");
    assert.equal(canonicalEmail("B.an.Hoc@GoogleMail.com"), "banhoc@gmail.com");
    assert.equal(canonicalEmail("ban.hoc@yahoo.com"), "ban.hoc@yahoo.com");
  });
});

describe("xác thực email và mã Pro 7 ngày qua email", () => {
  let srv, smtp, dir, first, second, third;
  const cookieOf = (r) => (/hoc_session=([^;,]+)/.exec(r.headers["set-cookie"] || "") || [])[1] || "";
  const call = (p, { method = "GET", body, cookie = "", csrf = "" } = {}) => srv.fetch(p, {
    method,
    headers: { "content-type": "application/json", ...(cookie ? { cookie: `hoc_session=${cookie}` } : {}), ...(csrf ? { "x-csrf-token": csrf } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, headers: r.headers, json: await r.json().catch(() => ({})) }));

  before(async () => {
    smtp = fakeSmtp();
    await new Promise((r) => smtp.listen(0, "127.0.0.1", r));
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "study-emailv-"));
    Object.assign(process.env, {
      DATA_DIR: dir, SMTP_HOST: "127.0.0.1", SMTP_PORT: String(smtp.address().port), SMTP_SECURE: "0",
      SMTP_ALLOW_INSECURE: "1", SMTP_FROM: "no-reply@example.com", SMTP_USER: "", SMTP_PASS: "",
    });
    const { getTestServer } = await import("./helpers/test-server.mjs");
    srv = await getTestServer();
    await call("/api/register", { method: "POST", body: { username: "ev_admin", password: "matkhau-quan-tri" } });
    first = await call("/api/register", { method: "POST", body: { username: "ev_hv1", password: "matkhau-hv-1" } });
    second = await call("/api/register", { method: "POST", body: { username: "ev_hv2", password: "matkhau-hv-2" } });
    third = await call("/api/register", { method: "POST", body: { username: "ev_hv3", password: "matkhau-hv-3" } });
    assert.equal(first.status, 201);
  });
  after(async () => { try { await srv.close(); } catch {} smtp.close(); });

  const ctx = (r, pw) => ({ cookie: cookieOf(r), csrf: r.json.csrfToken, pw });
  const setEmail = async (r, pw, email) => call("/api/profile/email", { method: "POST", body: { email, currentPassword: pw }, cookie: cookieOf(r), csrf: r.json.csrfToken });

  it("chưa có email thì không gửi được mã xác thực", async () => {
    const r = await call("/api/me/email/send-code", { method: "POST", body: {}, cookie: cookieOf(first), csrf: first.json.csrfToken });
    assert.equal(r.status, 400);
  });

  it("gửi mã 6 số tới email, nhập sai thì không xác thực, nhập đúng thì nhận mã Pro 7 ngày", async () => {
    assert.equal((await setEmail(first, "matkhau-hv-1", "ban.hoc+1@gmail.com")).status, 200);
    const sent = await call("/api/me/email/send-code", { method: "POST", body: {}, cookie: cookieOf(first), csrf: first.json.csrfToken });
    assert.equal(sent.status, 200);
    const verifyMail = await waitMail(1);
    const code = sixDigit(textOf(verifyMail.data));
    assert.match(code, /^\d{6}$/);

    const wrong = await call("/api/me/email/confirm", { method: "POST", body: { code: code === "000000" ? "111111" : "000000" }, cookie: cookieOf(first), csrf: first.json.csrfToken });
    assert.equal(wrong.status, 400);
    assert.equal((await call("/api/me/email/status", { cookie: cookieOf(first) })).json.verified, false);

    const ok = await call("/api/me/email/confirm", { method: "POST", body: { code }, cookie: cookieOf(first), csrf: first.json.csrfToken });
    assert.equal(ok.status, 200);
    assert.equal(ok.json.gift, "sent");

    const giftMail = await waitMail(2);
    assert.equal(giftMail.rcpt, "ban.hoc+1@gmail.com");
    const gift = giftIn(textOf(giftMail.data));
    assert.match(gift, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);

    globalThis.__welcomeGift = gift;
  });

  it("đăng ký tài khoản khác với cùng hộp thư gmail thì không nhận thêm mã Pro", async () => {
    assert.equal((await setEmail(second, "matkhau-hv-2", "b.an.hoc@googlemail.com")).status, 200);
    const before = mails.length;
    await call("/api/me/email/send-code", { method: "POST", body: {}, cookie: cookieOf(second), csrf: second.json.csrfToken });
    const code = sixDigit(textOf((await waitMail(before + 1)).data));
    const ok = await call("/api/me/email/confirm", { method: "POST", body: { code }, cookie: cookieOf(second), csrf: second.json.csrfToken });
    assert.equal(ok.status, 200);
    assert.equal(ok.json.gift, "already");
    await new Promise((r) => setTimeout(r, 300));
    const newGiftMails = mails.slice(before + 1).filter((m) => giftIn(textOf(m.data)));
    assert.equal(newGiftMails.length, 0, "không gửi mã Pro thứ hai cho cùng hộp thư");
  });

  it("gửi lại mã Pro qua email dùng đúng mã cũ, không tạo mã mới; dùng xong thì không gửi lại được", async () => {
    const before = mails.length;
    const r = await call("/api/me/email/resend-gift", { method: "POST", body: {}, cookie: cookieOf(first), csrf: first.json.csrfToken });
    assert.equal(r.status, 200);
    assert.equal(r.json.gift, "resent");
    const resent = await waitMail(before + 1);
    assert.equal(resent.rcpt, "ban.hoc+1@gmail.com");
    const g = giftIn(textOf(resent.data));
    assert.equal(g, globalThis.__welcomeGift, "gửi lại đúng mã cũ");

    // Mã nhận qua email nhập được trên Hồ sơ, cho 7 ngày Pro, rồi bị xóa khỏi kho
    const red = await call("/api/me/gift", { method: "POST", body: { code: g }, cookie: cookieOf(first), csrf: first.json.csrfToken });
    assert.equal(red.status, 200);
    assert.equal(red.json.days, 7);
    const again = await call("/api/me/email/resend-gift", { method: "POST", body: {}, cookie: cookieOf(first), csrf: first.json.csrfToken });
    assert.equal(again.status, 400);
    assert.equal(again.json.error, "Mã Pro đã được sử dụng, không gửi lại được.");
  });

  it("mã xác thực không dùng lại được và không xác thực khi chưa gửi mã", async () => {
    const r = await call("/api/me/email/confirm", { method: "POST", body: { code: "123456" }, cookie: cookieOf(third), csrf: third.json.csrfToken });
    assert.equal(r.status, 400);
    const st = await call("/api/me/email/status", { cookie: cookieOf(third) });
    assert.equal(st.json.verified, false);
  });
});
