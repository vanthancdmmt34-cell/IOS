// Gửi email qua SMTP bằng node:net / node:tls (không thêm thư viện ngoài).
// Dùng cho mã OTP đặt lại mật khẩu. Cấu hình bằng biến môi trường:
//   SMTP_HOST      máy chủ SMTP (vd: smtp.gmail.com). Không đặt = chưa bật gửi email.
//   SMTP_PORT      mặc định 465 (TLS ngay) ; 587 = STARTTLS
//   SMTP_SECURE    "1" = TLS ngay từ đầu (mặc định bật khi cổng là 465)
//   SMTP_USER      tài khoản đăng nhập SMTP
//   SMTP_PASS      mật khẩu / mật khẩu ứng dụng
//   SMTP_FROM      địa chỉ người gửi (mặc định = SMTP_USER)
//   SMTP_FROM_NAME tên người gửi (mặc định = tên trang)
//   SMTP_ALLOW_INSECURE "1" = cho phép gửi không mã hóa (chỉ dùng khi thử trên máy cá nhân)
import net from "node:net";
import tls from "node:tls";
import { sysGet } from "./sysconfig.js";
import os from "node:os";
import crypto from "node:crypto";

const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

// Chuẩn hóa email người dùng nhập: trả "" nếu sai định dạng.
export function cleanEmail(v) {
  const s = String(v || "").trim().toLowerCase();
  if (!s || s.length > 254 || !EMAIL_RE.test(s)) return "";
  return s;
}

// Che bớt email khi hiển thị: an***@gmail.com
export function maskEmail(v) {
  const s = String(v || "");
  const i = s.indexOf("@");
  if (i < 1) return "";
  const name = s.slice(0, i);
  return name.slice(0, Math.min(2, name.length)) + "***" + s.slice(i);
}

// Đọc cấu hình: giá trị trong Quản trị (sysconfig) > biến môi trường > mặc định.
// Nhờ vậy Võ dán mật khẩu SMTP trong Quản trị mà không cần sửa .env.
const sysOr = (key, envVal) => {
  const v = sysGet(key);
  return v !== undefined && v !== "" ? v : envVal;
};
export function mailConfig(env = process.env) {
  const host = String(sysOr("SMTP_HOST", env.SMTP_HOST) || "").trim();
  const port = Number(sysOr("SMTP_PORT", env.SMTP_PORT) || 465);
  const secRaw = sysOr("SMTP_SECURE", env.SMTP_SECURE);
  const secure = secRaw != null && secRaw !== "" ? /^(1|true|yes)$/i.test(String(secRaw)) : port === 465;
  const user = String(sysOr("SMTP_USER", env.SMTP_USER) || "").trim();
  const from = cleanEmail(sysOr("SMTP_FROM", env.SMTP_FROM) || user);
  return {
    host, port, secure, user, pass: String(sysOr("SMTP_PASS", env.SMTP_PASS) || ""), from,
    fromName: String(sysOr("SMTP_FROM_NAME", env.SMTP_FROM_NAME) || "").replace(/[\r\n"]/g, "").trim(),
    allowInsecure: /^(1|true|yes)$/i.test(String(sysOr("SMTP_ALLOW_INSECURE", env.SMTP_ALLOW_INSECURE) || "")),
  };
}
export function mailConfigured(env = process.env) {
  const c = mailConfig(env);
  return !!(c.host && c.from);
}

const b64 = (s) => Buffer.from(String(s), "utf8").toString("base64");
const encWord = (s) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`);
const wrap76 = (s) => s.replace(/.{1,76}/g, "$&\r\n").trimEnd();

function buildMessage({ from, fromName, to, subject, text, html }) {
  const host = from.split("@")[1] || os.hostname();
  const head = [
    `From: ${fromName ? `${encWord(fromName).replace(/[<>]/g, "")} <${from}>` : from}`,
    `To: ${to}`,
    `Subject: ${encWord(String(subject || "").replace(/[\r\n]+/g, " ").slice(0, 200))}`,
    `Date: ${new Date().toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: <${crypto.randomBytes(12).toString("hex")}@${host}>`,
    "MIME-Version: 1.0",
  ];
  const part = (type, body) => `Content-Type: ${type}; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${wrap76(b64(body))}`;
  let body;
  if (html) {
    const bd = "b_" + crypto.randomBytes(9).toString("hex");
    head.push(`Content-Type: multipart/alternative; boundary="${bd}"`);
    body = `--${bd}\r\n${part("text/plain", text || "")}\r\n--${bd}\r\n${part("text/html", html)}\r\n--${bd}--`;
  } else {
    body = part("text/plain", text || "");
    return head.join("\r\n") + "\r\n" + body;
  }
  return head.join("\r\n") + "\r\n\r\n" + body;
}

// Hội thoại SMTP tối thiểu: EHLO, STARTTLS (nếu cần), AUTH PLAIN/LOGIN, MAIL, RCPT, DATA.
export function sendMail({ to, subject, text, html }, cfg = mailConfig()) {
  const rcpt = cleanEmail(to);
  if (!cfg.host || !cfg.from) return Promise.reject(new Error("SMTP chưa được cấu hình."));
  if (!rcpt) return Promise.reject(new Error("Địa chỉ email nhận không hợp lệ."));
  return new Promise((resolve, reject) => {
    let sock, buf = "", waiting = null, done = false, encrypted = !!cfg.secure;
    const finish = (err, val) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { sock && sock.destroy(); } catch {}
      err ? reject(err) : resolve(val);
    };
    const timer = setTimeout(() => finish(new Error("SMTP quá thời gian chờ.")), 20000);
    const onData = (chunk) => {
      buf += chunk.toString("utf8");
      for (;;) {
        // Một phản hồi kết thúc bằng dòng "NNN <text>" (dòng "NNN-..." là còn tiếp).
        const m = /^(?:\d{3}-[^\r\n]*\r?\n)*(\d{3})(?: [^\r\n]*)?\r?\n/.exec(buf);
        if (!m) return;
        const resp = buf.slice(0, m[0].length);
        buf = buf.slice(m[0].length);
        const w = waiting;
        waiting = null;
        if (w) w({ code: Number(m[1]), text: resp });
      }
    };
    const attach = (s) => {
      sock = s;
      s.on("data", onData);
      s.on("error", (e) => finish(new Error("SMTP lỗi kết nối: " + e.message)));
      s.on("close", () => finish(new Error("SMTP đóng kết nối sớm.")));
    };
    const read = () => new Promise((r) => { waiting = r; });
    const cmd = async (line, ok) => {
      if (line != null) sock.write(line + "\r\n");
      const r = await read();
      if (!ok.includes(r.code)) throw new Error(`SMTP ${r.code}: ${r.text.trim().split(/\r?\n/).pop().slice(0, 160)}`);
      return r;
    };
    const run = async () => {
      await cmd(null, [220]);
      const name = os.hostname().replace(/[^A-Za-z0-9.-]/g, "") || "localhost";
      let ehlo = await cmd(`EHLO ${name}`, [250]);
      if (!encrypted && /STARTTLS/i.test(ehlo.text)) {
        await cmd("STARTTLS", [220]);
        const plain = sock;
        plain.removeAllListeners("data");
        plain.removeAllListeners("error");
        plain.removeAllListeners("close");
        await new Promise((res, rej) => {
          const t = tls.connect({ socket: plain, servername: cfg.host }, res);
          t.once("error", rej);
          attach(t);
        });
        encrypted = true;
        ehlo = await cmd(`EHLO ${name}`, [250]);
      }
      if (!encrypted && !cfg.allowInsecure) throw new Error("Máy chủ SMTP không hỗ trợ mã hóa (TLS). Đặt SMTP_ALLOW_INSECURE=1 nếu chỉ thử trên máy cá nhân.");
      if (cfg.user) {
        if (/AUTH[^\r\n]*\bPLAIN\b/i.test(ehlo.text) || !/AUTH[^\r\n]*\bLOGIN\b/i.test(ehlo.text)) {
          await cmd("AUTH PLAIN " + b64(`\u0000${cfg.user}\u0000${cfg.pass}`), [235]);
        } else {
          await cmd("AUTH LOGIN", [334]);
          await cmd(b64(cfg.user), [334]);
          await cmd(b64(cfg.pass), [235]);
        }
      }
      await cmd(`MAIL FROM:<${cfg.from}>`, [250]);
      await cmd(`RCPT TO:<${rcpt}>`, [250, 251]);
      await cmd("DATA", [354]);
      const msg = buildMessage({ from: cfg.from, fromName: cfg.fromName, to: rcpt, subject, text, html })
        .replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
      const r = await cmd(msg + "\r\n.", [250]);
      try { sock.write("QUIT\r\n"); } catch {}
      return r.text.trim();
    };
    const start = () => run().then((v) => finish(null, v), (e) => finish(e));
    try {
      if (cfg.secure) attach(tls.connect({ host: cfg.host, port: cfg.port, servername: cfg.host }, start));
      else attach(net.connect({ host: cfg.host, port: cfg.port }, start));
    } catch (e) { finish(e); }
  });
}

// Nội dung email mã khôi phục mật khẩu (tiếng Việt hoặc tiếng Anh theo ngôn ngữ tài khoản).
export function otpMail({ code, minutes, siteName, username, lang }) {
  const en = lang === "en";
  const site = String(siteName || "LifeRivo");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const subject = en ? `${code} is your ${site} password recovery code` : `${code} là mã khôi phục mật khẩu ${site}`;
  const lines = en
    ? [`Hello @${username},`, "", `Your password recovery code is: ${code}`, `It is valid for ${minutes} minutes and can be used once.`, "", "If you did not request this, ignore this email. Your password stays the same.", "", site]
    : [`Chào @${username},`, "", `Mã khôi phục mật khẩu của bạn là: ${code}`, `Mã có hiệu lực ${minutes} phút và chỉ dùng được một lần.`, "", "Nếu bạn không yêu cầu, hãy bỏ qua email này. Mật khẩu của bạn vẫn giữ nguyên.", "", site];
  const html = `<div style="font-family:'Nunito','Be Vietnam Pro',Arial,Helvetica,sans-serif;max-width:460px;margin:0 auto;padding:24px;color:#303047;background:#FAF9FF;border-radius:18px">
<h2 style="margin:0 0 12px;font-size:20px;color:#4B39BF">${esc(site)}</h2>
<p style="margin:0 0 12px">${esc(lines[0])}</p>
<p style="margin:0 0 8px">${en ? "Your password recovery code:" : "Mã khôi phục mật khẩu của bạn:"}</p>
<p style="margin:0 0 14px;font-size:32px;font-weight:800;letter-spacing:6px;background:#F3EFFF;color:#4B39BF;border:1px solid #DFD8FC;border-radius:14px;padding:14px 18px;text-align:center">${esc(code)}</p>
<p style="margin:0 0 12px">${esc(lines[3])}</p>
<p style="margin:0;color:#6E6D87;font-size:13px">${esc(lines[5])}</p>
</div>`;
  return { subject, text: lines.join("\n"), html };
}

// Email kích hoạt: mã 6 số để kích hoạt email của học viên (tiếng Việt hoặc tiếng Anh theo ngôn ngữ tài khoản).
export function verifyEmailMail({ code, minutes, siteName, username, lang }) {
  const en = lang === "en";
  const site = String(siteName || "LifeRivo");
  const subject = en ? `${code} is your ${site} activation code` : `${code} là mã kích hoạt email ${site}`;
  const lines = en
    ? [`Hello @${username},`, "", `Your activation code is: ${code}`, `It is valid for ${minutes} minutes and can be used once.`, "", "If you did not ask for this, ignore this email.", "", site]
    : [`Chào @${username},`, "", `Mã kích hoạt email của bạn là: ${code}`, `Mã có hiệu lực ${minutes} phút và chỉ dùng được một lần.`, "", "Nếu bạn không yêu cầu, hãy bỏ qua email này.", "", site];
  const html = `<div style="font-family:'Nunito','Be Vietnam Pro',Arial,Helvetica,sans-serif;max-width:460px;margin:0 auto;padding:24px;color:#303047;background:#FAF9FF;border-radius:18px">
<h2 style="margin:0 0 12px;font-size:20px;color:#4B39BF">${site}</h2>
<p style="margin:0 0 12px">${lines[0]}</p>
<p style="margin:0 0 8px">${en ? "Your activation code:" : "Mã kích hoạt email của bạn:"}</p>
<p style="margin:0 0 14px;font-size:32px;font-weight:800;letter-spacing:6px;background:#F3EFFF;color:#4B39BF;border:1px solid #DFD8FC;border-radius:14px;padding:14px 18px;text-align:center">${code}</p>
<p style="margin:0;color:#6E6D87;font-size:13px">${lines[3]}</p>
</div>`;
  return { subject, text: lines.join("\n"), html };
}

// Email tặng mã Pro 7 ngày sau khi xác thực email (mỗi địa chỉ chỉ nhận một lần).
export function proGiftMail({ code, days, siteName, username, lang }) {
  const en = lang === "en";
  const site = String(siteName || "LifeRivo");
  const subject = en ? `Your ${days}-day Pro gift code from ${site}` : `Mã Pro ${days} ngày từ ${site} dành cho bạn`;
  const lines = en
    ? [`Hello @${username},`, "", `Thank you for verifying your email. Here is your ${days}-day Pro gift code:`, code, "", `Enter it in your profile page under "Pro and gift codes" to activate Pro. The code can be used once.`, "", site]
    : [`Chào @${username},`, "", `Cảm ơn bạn đã xác thực email. Đây là mã Pro ${days} ngày của bạn:`, code, "", `Nhập mã vào mục "Pro và mã quà tặng" trong trang Hồ sơ để kích hoạt Pro. Mã chỉ dùng được một lần.`, "", site];
  const html = `<div style="font-family:'Nunito','Be Vietnam Pro',Arial,Helvetica,sans-serif;max-width:460px;margin:0 auto;padding:24px;color:#303047;background:#FAF9FF;border-radius:18px">
<h2 style="margin:0 0 12px;font-size:20px;color:#4B39BF">${site}</h2>
<p style="margin:0 0 12px">${lines[0]}</p>
<p style="margin:0 0 12px">${lines[2]}</p>
<p style="margin:0 0 14px;font-size:26px;font-weight:800;letter-spacing:3px;background:#F3EFFF;color:#4B39BF;border:1px solid #DFD8FC;border-radius:14px;padding:14px 18px;text-align:center;font-family:'Nunito','Be Vietnam Pro',Arial,sans-serif">${code}</p>
<p style="margin:0;color:#6E6D87;font-size:13px">${lines[4]}</p>
</div>`;
  return { subject, text: lines.join("\n"), html };
}
