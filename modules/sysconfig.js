// System configuration editable in Admin panel (3.2.0): AI key, model, pricing, cost cap,
// SePay key, website URL.
// Priority order: value set in Admin  >  environment variable  >  code default.
// Secret keys are encrypted with AES-256-GCM before saving to DB; the encryption key lives in
// DATA_DIR/secret.key (mode 600), NOT in the DB, so .db backup files never leak secrets.
// Secrets are write-only and never returned to the browser (only returns "configured" + last 4 characters).
//
// Intentionally NOT editable in Admin: PORT, HOST, DATA_DIR (needed at startup),
// GEMINI_BASE_URL
// (changing URL = leaking AI key to an external server).
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const SYS_GROUPS = [
  ["ai", "Rivo: kết nối Google Gemini", "Khóa API lấy ở Google AI Studio (aistudio.google.com → Get API key). Đơn giá dùng để tính chi phí trong báo cáo; kiểm tra lại ở trang giá Gemini khi đổi model."],
  ["pay", "Thanh toán tự động SePay", "Chỉ cần khi chọn cách xác nhận \"Tự động qua SePay\". Dùng QR tài khoản cá nhân thì để trống."],
  ["site", "Website", "Địa chỉ chính thức dùng cho liên kết chuẩn (canonical), sitemap, chia sẻ mạng xã hội."],
  ["mail", "Gửi email (SMTP)", "Máy chủ gửi email xác thực và mã đặt lại mật khẩu. Điền xong bấm Lưu rồi thử quên mật khẩu để kiểm tra."],
];

export const SYS_FIELDS = [
  { key: "AI_PROVIDER", group: "ai", type: "select", label: "Nhà cung cấp AI", options: [["gemini", "Google Gemini"], ["disabled", "Tắt hẳn kết nối AI"]], def: "gemini" },
  { key: "GEMINI_API_KEY", group: "ai", type: "secret", label: "Khóa API Gemini", help: "Dán nguyên khóa lấy từ Google AI Studio: dạng mới AQ.Ab… hoặc dạng cũ AIza…, không thêm dấu cách. Chỉ máy chủ dùng, không bao giờ gửi xuống trình duyệt.", pattern: /^[A-Za-z0-9._\-]{20,300}$/ },
  { key: "ASSEMBLYAI_API_KEY", group: "ai", type: "secret", label: "Khóa API AssemblyAI", help: "Dán nguyên khóa lấy từ AssemblyAI dashboard (assemblyai.com → API Keys). Chỉ dùng cho giọng đọc mẫu Anh/Pháp/Tây Ban Nha (TTS-1). Chỉ máy chủ dùng, không bao giờ gửi xuống trình duyệt.", pattern: /^[A-Za-z0-9]{20,100}$/ },
  { key: "ASSEMBLYAI_API_KEY_2", group: "ai", type: "secret", label: "Khóa API AssemblyAI dự phòng", help: "Tạo thêm 1 key nữa ở AssemblyAI dashboard (API Keys → Create) rồi dán vào đây. Khi key chính lỗi (sai key, hết lượt) thì hệ tự đổi sang key này. Để trống nếu chỉ dùng 1 key.", pattern: /^[A-Za-z0-9]{20,100}$/ },
  { key: "AI_MODEL", group: "ai", type: "text", label: "Model chính", def: "gemini-3.1-flash-lite", help: "Ví dụ: gemini-3.1-flash-lite, gemini-2.5-flash-lite. Nếu lỗi model, thử gemini-2.5-flash-lite.", pattern: /^[a-z0-9][a-z0-9.\-]{2,60}$/ },
  { key: "AI_FALLBACK_MODEL", group: "ai", type: "text", label: "Model dự phòng", def: "", help: "Dùng khi model chính lỗi. Để trống nếu không cần.", pattern: /^([a-z0-9][a-z0-9.\-]{2,60})?$/ },
  { key: "AI_PRICE_INPUT_PER_M", group: "ai", type: "decimal", label: "Giá token đầu vào (USD / 1 triệu token)", def: "0.25", min: 0, max: 100 },
  { key: "AI_PRICE_OUTPUT_PER_M", group: "ai", type: "decimal", label: "Giá token đầu ra (USD / 1 triệu token)", def: "1.5", min: 0, max: 500 },
  { key: "AI_MONTHLY_BUDGET_USD", group: "ai", type: "decimal", label: "Trần chi phí AI mỗi tháng (USD)", def: "10", min: 0, max: 100000, help: "Chạm trần thì AI tạm dừng tới đầu tháng sau. 1 USD ≈ 25.000đ." },
  { key: "AI_TIMEOUT_MS", group: "ai", type: "number", label: "Thời gian chờ AI tối đa (ms)", def: "25000", min: 3000, max: 120000 },

  { key: "SEPAY_WEBHOOK_SECRET", group: "pay", type: "secret", label: "Khóa bí mật HMAC của webhook SePay", help: "Chọn kiểu xác thực HMAC-SHA256 khi tạo webhook ở SePay và dán đúng khóa đó vào đây (khuyên dùng).", pattern: /^\S{8,200}$/ },
  { key: "SEPAY_API_KEY", group: "pay", type: "secret", label: "API key của webhook SePay", help: "Chỉ dùng nếu chọn kiểu xác thực API Key thay cho HMAC.", pattern: /^\S{8,200}$/ },


  { key: "PUBLIC_URL", group: "site", type: "text", label: "Địa chỉ website", def: "", help: "Ví dụ https://study.liferivo.com (không có / ở cuối).", pattern: /^(https?:\/\/[A-Za-z0-9.\-]+(:\d{1,5})?)?$/ },
  { key: "SMTP_HOST", group: "mail", type: "text", label: "Máy chủ SMTP", help: "Ví dụ: mail9234.maychuemail.com. Để trống = chưa bật gửi email.", pattern: /^([a-zA-Z0-9.-]{1,120})?$/ },
  { key: "SMTP_PORT", group: "mail", type: "number", label: "Cổng SMTP", def: "465", min: 1, max: 65535, help: "465 = TLS ngay từ đầu; 587 = STARTTLS." },
  { key: "SMTP_USER", group: "mail", type: "text", label: "Tài khoản SMTP", help: "Ví dụ: info@liferivo.com.", pattern: /^([^\s]{1,150})?$/ },
  { key: "SMTP_PASS", group: "mail", type: "secret", label: "Mật khẩu SMTP", help: "Mật khẩu hộp thư gửi mail. Chỉ máy chủ dùng, không bao giờ gửi xuống trình duyệt.", pattern: /^[^\r\n]{1,200}$/ },
  { key: "SMTP_FROM", group: "mail", type: "text", label: "Địa chỉ người gửi", help: "Để trống = dùng tài khoản SMTP. Ví dụ: info@liferivo.com.", pattern: /^([^\s]{1,150})?$/ },
  { key: "SMTP_FROM_NAME", group: "mail", type: "text", label: "Tên người gửi", help: "Để trống = tên trang. Ví dụ: LifeRivo Study." },
];
const FIELD = Object.fromEntries(SYS_FIELDS.map((f) => [f.key, f]));

let DB = null, KEY = null, STATE = { values: {}, secrets: {} };
const cache = {}; // decrypted secret value, kept in memory only

function loadKey(dataDir) {
  const p = path.join(dataDir, "secret.key");
  try { const k = fs.readFileSync(p); if (k.length === 32) return k; } catch {}
  const k = crypto.randomBytes(32);
  fs.writeFileSync(p, k, { mode: 0o600 });
  return k;
}
const enc = (s) => { const iv = crypto.randomBytes(12); const c = crypto.createCipheriv("aes-256-gcm", KEY, iv); const ct = Buffer.concat([c.update(String(s), "utf8"), c.final()]); return [iv, c.getAuthTag(), ct].map((b) => b.toString("base64")).join("."); };
const dec = (s) => { const [iv, tag, ct] = String(s).split(".").map((x) => Buffer.from(x, "base64")); const d = crypto.createDecipheriv("aes-256-gcm", KEY, iv); d.setAuthTag(tag); return Buffer.concat([d.update(ct), d.final()]).toString("utf8"); };

export async function initSysConfig(db, dataDir, log = console) {
  DB = db; KEY = loadKey(dataDir);
  try { const r = await db.prepare("SELECT v FROM site_settings WHERE k = 'system'").get(); if (r) STATE = { values: {}, secrets: {}, ...JSON.parse(r.v) }; } catch {}
  for (const [k, v] of Object.entries(STATE.secrets || {})) {
    try { cache[k] = dec(v); } catch { log.error(`[cấu hình] Không giải mã được ${k} (file secret.key đã đổi?). Hãy nhập lại trong Quản trị.`); }
  }
}
async function persist() { await DB.prepare("INSERT INTO site_settings (k, v) VALUES ('system', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").run(JSON.stringify(STATE)); }

// Read effective value: Admin > environment variable > undefined (caller supplies default)
export function sysGet(key) {
  const f = FIELD[key];
  if (f && f.type === "secret") { if (cache[key]) return cache[key]; }
  else if (f && STATE.values[key] !== undefined && STATE.values[key] !== "") return String(STATE.values[key]);
  const e = process.env[key];
  return e !== undefined && e !== "" ? e : undefined;
}
const sourceOf = (key) => {
  const f = FIELD[key];
  if (f.type === "secret" ? !!cache[key] : (STATE.values[key] !== undefined && STATE.values[key] !== "")) return "admin";
  return process.env[key] ? "env" : "default";
};

// For Admin page: excludes secret values
export function sysPublicView() {
  return {
    groups: SYS_GROUPS,
    fields: SYS_FIELDS.map((f) => {
      const o = { key: f.key, group: f.group, type: f.type, label: f.label, help: f.help || "", options: f.options, min: f.min, max: f.max, def: f.def ?? "", source: sourceOf(f.key) };
      if (f.type === "secret") { const v = sysGet(f.key); o.isSet = !!v; o.hint = v ? "…" + v.slice(-4) : ""; }
      else { o.value = STATE.values[f.key] ?? ""; o.effective = sysGet(f.key) ?? f.def ?? ""; }
      return o;
    }),
  };
}

// Save changes. values: { KEY: "value" | "" (clear, revert to env var/default) }, secrets: { KEY: "new key" | null (delete) }
// Returns { errors, changed: [keys] }
export async function sysUpdate({ values = {}, secrets = {} }) {
  const errors = [], changed = [];
  const next = { values: { ...STATE.values }, secrets: { ...STATE.secrets } };
  const nextCache = { ...cache };
  for (const [k, raw] of Object.entries(values || {})) {
    const f = FIELD[k];
    if (!f || f.type === "secret") { errors.push(`Không có mục cấu hình ${k}.`); continue; }
    let v = String(raw ?? "").trim();
    if (f.key === "PUBLIC_URL") v = v.replace(/\/+$/, "");
    if (v === "") { if (next.values[k] !== undefined) { delete next.values[k]; changed.push(k); } continue; }
    if (f.type === "select" && !f.options.some(([o]) => o === v)) { errors.push(`${f.label}: lựa chọn không hợp lệ.`); continue; }
    if (f.type === "number" || f.type === "decimal") {
      const n = Number(v);
      if (!Number.isFinite(n) || n < f.min || n > f.max || (f.type === "number" && !Number.isInteger(n))) { errors.push(`${f.label}: cần ${f.type === "number" ? "số nguyên " : ""}từ ${f.min} đến ${f.max}.`); continue; }
    }
    if (f.pattern && !f.pattern.test(v)) { errors.push(`${f.label}: giá trị không hợp lệ.`); continue; }
    if (next.values[k] !== v) { next.values[k] = v; changed.push(k); }
  }
  for (const [k, raw] of Object.entries(secrets || {})) {
    const f = FIELD[k];
    if (!f || f.type !== "secret") { errors.push(`Không có khóa bí mật ${k}.`); continue; }
    if (raw === null) { if (next.secrets[k] !== undefined) { delete next.secrets[k]; delete nextCache[k]; changed.push(k); } continue; }
    const v = String(raw).trim();
    if (!v) continue;
    if (f.pattern && !f.pattern.test(v)) { errors.push(`${f.label}: không đúng định dạng.`); continue; }
    next.secrets[k] = enc(v); nextCache[k] = v; changed.push(k);
  }
  if (errors.length) return { errors, changed: [] };
  STATE = next;
  for (const k of Object.keys(cache)) delete cache[k];
  Object.assign(cache, nextCache);
  await persist();
  return { errors, changed };
}
