// Foreign language learning system - run with: node server.js (Node >= 22)
// Uses only built-in Node modules: node:http, node:sqlite, node:crypto, node:fs, node:path.
// SQLite mode has zero external runtime DB dependencies. Default port is 8082, override via PORT env var.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);
import { HttpMetrics, normalizeMetricRoute } from "./modules/observability.js";
import { DatabaseSync } from "node:sqlite";
import { sqliteAsync } from "./db/sqlite-async.js";
import { fileURLToPath } from "node:url";
import { PgDb } from "./db/pg.js";
import { migrate, migratePg } from "./db/migrations.js";
import { createModuleApi } from "./modules/api.js";
import { membership } from "./modules/membership.js";
import { grantSource } from "./modules/entitlements.js";
import { renderPublic, publicPaths } from "./modules/seo.js";
import { reqLang } from "./modules/reqlang.js";
import { ensureFeedbackTable, feedbackApi } from "./modules/feedback.js";
import { ensureGiftTable, giftApi } from "./modules/giftcodes.js";
import { petApi, withPetLock, ensurePetTable } from "./modules/pet.js";
import { petGamesApi, ensureGameTable } from "./modules/pet-games.js";
import { ensureEmailVerifyTables, emailVerifyApi } from "./modules/emailverify.js";
import { initSysConfig, sysGet } from "./modules/sysconfig.js";
import { initLanguages, langApi, langDailyReminders, langPublicSummary } from "./modules/languages.js";
import { initSpeaking, speakApi } from "./modules/speaking.js";
import { initToeic, toeicApi } from "./modules/toeic.js";
import { ttsApi } from "./modules/tts.js";
import { qrDataUrl } from "./modules/vietqr.js";
import { cleanEmail, maskEmail, mailConfigured, sendMail, otpMail } from "./modules/mailer.js";
import { SETTINGS_SCHEMA, SETTINGS_GROUPS, BRAND_COLORS, defaultSettings, cleanSettings, publicSettings, clientSettings } from "./settings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8082);
// Single source of truth for system version: only update here on each deploy.
// /api/health, /api/stats, page footer, and index.html ?v= query param all read from this constant.
const VERSION = "1.0.1"
const httpMetrics = new HttpMetrics();
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, "data");
// Listens on 127.0.0.1 by default (behind nginx proxy). Set HOST=0.0.0.0 to expose directly.
const HOST = process.env.HOST || "127.0.0.1";
// Public base URL used for canonical / sitemap (optional), e.g. https://study.liferivo.com
// 3.2.0: website URL configurable in Admin (preferred) or via environment variable
const publicUrl = () => String(sysGet("PUBLIC_URL") || "").replace(/\/+$/, "");
// Thẻ xác minh Google Search Console: đặt GOOGLE_SITE_VERIFICATION=<mã> trong môi trường. Không đặt thì không xuất thẻ.
const gsvMeta = () => { const v = String(process.env.GOOGLE_SITE_VERIFICATION || "").trim(); return /^[A-Za-z0-9_-]{10,100}$/.test(v) ? `<meta name="google-site-verification" content="${v}">` : ""; };
const DB_PATH = path.join(DATA_DIR, "app.db");
fs.mkdirSync(DATA_DIR, { recursive: true });

// Postgres mode: when PGDATABASE is set, use PgDb + schema-pg.sql and skip the entire
// SQLite block below (PRAGMA/DDL/SQLite migrations). Without PGDATABASE, keep the
// existing SQLite path unchanged - rollback only requires removing the env var + restarting.
const USE_PG = !!process.env.PGDATABASE;
const PGCONF = { host: process.env.PGHOST || "127.0.0.1", port: Number(process.env.PGPORT || 5432), user: process.env.PGUSER || "postgres", password: process.env.PGPASSWORD || "", database: process.env.PGDATABASE || "" };
let db;
if (USE_PG) {
  db = new PgDb(PGCONF);
  await migratePg(db, fs.readFileSync(path.join(__dirname, "schema-pg.sql"), "utf8"), console);
  // Custom exercises: language/type/quiz_json (trac nghiem ngoai ngu).
  // Idempotent - chay moi lan khoi dong; schema-pg.sql chi ap dung khi tao DB moi.
  try {
    await db.prepare("ALTER TABLE custom_exercises ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en'").run();
    await db.prepare("ALTER TABLE custom_exercises ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'quiz'").run();
    await db.prepare("ALTER TABLE custom_exercises ADD COLUMN IF NOT EXISTS quiz_json TEXT NOT NULL DEFAULT '[]'").run();
  } catch (e) { console.warn("[custom-ex] Không thêm được cột:", e.message); }
} else {
  db = new DatabaseSync(DB_PATH);
try {
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA busy_timeout = 8000");
  db.exec("PRAGMA synchronous = NORMAL");
  db.exec("PRAGMA foreign_keys = ON");
} catch (e) { console.warn("[db] pragma:", e.message); }
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  csrf_token TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS custom_exercises (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  starter TEXT NOT NULL DEFAULT '',
  expected_output TEXT NOT NULL DEFAULT '',
  sample TEXT NOT NULL DEFAULT '',
  require_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  type TEXT NOT NULL DEFAULT 'quiz',
  quiz_json TEXT NOT NULL DEFAULT '[]'
);
`);
db.exec(`
CREATE TABLE IF NOT EXISTS site_stats (k TEXT PRIMARY KEY, v INTEGER NOT NULL DEFAULT 0);
-- 4.8.0: funnel events (demo→register drop-off). Bảng nhẹ, không lưu PII.
-- event: demo_run | demo_run_ok | register_click | register_complete
-- session_id: fingerprint ẩn danh từ client (không phải session auth)
CREATE TABLE IF NOT EXISTS funnel_events (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  event     TEXT NOT NULL,
  session_id TEXT NOT NULL DEFAULT '',
  referrer  TEXT NOT NULL DEFAULT '',
  ts        TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ratings (
  user_id INTEGER PRIMARY KEY,
  stars INTEGER NOT NULL,
  comment TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`);
db.exec(`
CREATE TABLE IF NOT EXISTS user_prefs (user_id INTEGER PRIMARY KEY, data TEXT NOT NULL DEFAULT '{}', updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  pinned INTEGER NOT NULL DEFAULT 0,
  author_id INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
`);
// 2.3.0: indexes to speed up score and history queries (CREATE INDEX IF NOT EXISTS: safe, non-destructive)
db.exec(`
CREATE INDEX IF NOT EXISTS idx_sess_user ON sessions(user_id);
`);
// 4.8.0: index funnel events
db.exec(`
CREATE INDEX IF NOT EXISTS idx_funnel_event ON funnel_events(event, ts);
CREATE INDEX IF NOT EXISTS idx_funnel_session ON funnel_events(session_id, ts);
`);
// 2.2.0: system settings + account locking
db.exec("CREATE TABLE IF NOT EXISTS site_settings (k TEXT PRIMARY KEY, v TEXT NOT NULL)");
// 2.3.0: teacher-created exercises can have multiple tests (input + expected output, with hidden tests)
if (!db.prepare("PRAGMA table_info(custom_exercises)").all().some((c) => c.name === "tests_json")) db.exec("ALTER TABLE custom_exercises ADD COLUMN tests_json TEXT NOT NULL DEFAULT '[]'");
// Bài tập tùy chỉnh: trắc nghiệm ngoại ngữ (ngôn ngữ, loại bài, nội dung quiz)
if (!db.prepare("PRAGMA table_info(custom_exercises)").all().some((c) => c.name === "language")) db.exec("ALTER TABLE custom_exercises ADD COLUMN language TEXT NOT NULL DEFAULT 'en'");
if (!db.prepare("PRAGMA table_info(custom_exercises)").all().some((c) => c.name === "type")) db.exec("ALTER TABLE custom_exercises ADD COLUMN type TEXT NOT NULL DEFAULT 'quiz'");
if (!db.prepare("PRAGMA table_info(custom_exercises)").all().some((c) => c.name === "quiz_json")) db.exec("ALTER TABLE custom_exercises ADD COLUMN quiz_json TEXT NOT NULL DEFAULT '[]'");
if (!db.prepare("PRAGMA table_info(users)").all().some((c) => c.name === "disabled")) db.exec("ALTER TABLE users ADD COLUMN disabled INTEGER NOT NULL DEFAULT 0");
// 3.0.0: new tables (Pro plans, orders, AI, lessons...) via numbered migrations + rollback
migrate(db, console, DATA_DIR);
// 4.10.4: from here on, use the Postgres-compatible async interface (prepare returns Promise, with db.tx)
db = sqliteAsync(db);
} // end of SQLite branch (USE_PG = false)
// 4.0.12: verify critical schema after migration - fail early if DB is out of sync (e.g. missing entitlements column)
async function assertCriticalSchema(database) {
  const need = {
    entitlements: ["user_id", "feature", "source_type", "source_id", "status", "starts_at", "expires_at", "granted_by", "note", "created_at", "updated_at"],
    licenses: ["owner_id", "tier", "seats", "starts_at", "expires_at", "status", "source"],
    license_seats: ["license_id", "user_id", "status", "assigned_at"],
    users: ["username", "role", "password_hash", "lang"],
    classrooms: ["teacher_id", "name", "join_code", "status"],
    assignments: ["class_id", "kind", "title", "status"],
    notifications: ["user_id", "kind", "title", "created_at"],
  };
  const missing = [];
  for (const [table, cols] of Object.entries(need)) {
    let info;
    try {
      if (USE_PG) info = await database.prepare("SELECT column_name AS name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ?").all(table);
      else info = await database.prepare(`PRAGMA table_info(${table})`).all();
    } catch { missing.push(table + " (không có bảng)"); continue; }
    if (!info.length) { missing.push(table + " (không có bảng)"); continue; }
    const have = new Set(info.map((c) => c.name));
    for (const c of cols) if (!have.has(c)) missing.push(`${table}.${c}`);
  }
  if (missing.length) {
    console.error("[schema] Thiếu cột/bảng quan trọng:", missing.join(", "));
    console.error("[schema] Hãy chạy migration hoặc khôi phục bản sao CSDL tương thích.");
  } else {
    console.log("[schema] Đã kiểm tra các bảng quan trọng — OK");
  }
}
try { await assertCriticalSchema(db); } catch (err) { console.warn("[schema] Không kiểm tra được:", err.message); }

// ===== 4.0.1: system logo (stored in DB, included in backup files) =====
// Accept PNG / JPEG / WebP only (reject SVG as it may contain scripts). Check file magic bytes, max 512 KB.
const LOGO_MAX = 512 * 1024;
let LOGO = null; // { mime, data: Buffer, ver }
async function loadLogo() {
  const r = await db.prepare("SELECT mime, data, updated_at FROM brand_assets WHERE kind = 'logo'").get();
  LOGO = r ? { mime: r.mime, data: Buffer.from(r.data), ver: crypto.createHash("sha1").update(String(r.updated_at)).digest("hex").slice(0, 10) } : null;
}
await loadLogo();
function sniffImage(buf) {
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length > 12 && buf.subarray(0, 4).toString("latin1") === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  return null;
}
const brandInfo = () => (LOGO ? { logoUrl: `/brand/logo?v=${LOGO.ver}` } : { logoUrl: "" });
// 3.2.0: system configuration (AI keys, SePay, website...) editable in Admin
await initSysConfig(db, DATA_DIR);
await ensureFeedbackTable(db);
await ensureGiftTable(db);
await ensurePetTable(db);
await ensureGameTable(db);
await ensureEmailVerifyTables(db);
// Tên hiển thị cũ: viết hoa chữ cái đầu của mỗi từ (chạy lại nhiều lần vẫn an toàn)
for (const r of await db.prepare("SELECT id, display_name FROM users").all()) {
  const n = capName(r.display_name);
  if (n && n !== r.display_name) await db.prepare("UPDATE users SET display_name = ? WHERE id = ?").run(n, r.id);
}
let SETTINGS = defaultSettings();
let savedSettingsExist = false;
try { const r = await db.prepare("SELECT v FROM site_settings WHERE k = 'settings'").get(); if (r) { SETTINGS = { ...SETTINGS, ...JSON.parse(r.v) }; savedSettingsExist = true; } } catch {}
try {
  const { LEGACY_DEFAULTS } = await import("./settings.js");
  const fresh = defaultSettings(); let changed = false;
  for (const [k, olds] of Object.entries(LEGACY_DEFAULTS)) if (olds.includes(String(SETTINGS[k] || "").trim())) { SETTINGS[k] = fresh[k]; changed = true; }
  if (changed && savedSettingsExist) await db.prepare("INSERT INTO site_settings (k, v) VALUES ('settings', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").run(JSON.stringify(SETTINGS));
  if (changed) console.log("[settings] Đã đổi tên/khẩu hiệu mặc định cũ sang mặc định mới:", SETTINGS.siteName);
} catch (e) { console.warn("[settings] legacy:", e.message); }
async function saveSettings(v) { SETTINGS = v; await db.prepare("INSERT INTO site_settings (k, v) VALUES ('settings', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").run(JSON.stringify(v)); }
// Raise Pro quotas per 4.2.2 policy. Only bump old default values (40/600),
// leaving custom admin values untouched.
let proQuotaUpgraded = false;
if (Number(SETTINGS.aiProDaily) === 40) { SETTINGS.aiProDaily = 100; proQuotaUpgraded = true; }
if (Number(SETTINGS.aiProMonthly) === 600) { SETTINGS.aiProMonthly = 2000; proQuotaUpgraded = true; }
if (proQuotaUpgraded && savedSettingsExist) await saveSettings(SETTINGS);
try { const li = await initLanguages(db); console.log(`[lang] Ngoại ngữ: ${li.courses} khóa, ${li.exercises} bài`); } catch (e) { console.error("[lang] Khởi tạo lỗi:", e.message); }
try { await initSpeaking(db); } catch (e) { console.error("[speak] Khởi tạo lỗi:", e.message); }
try { const ti = await initToeic(db); console.log(`[toeic] Trung tâm TOEIC: ${ti.parts} Part, ${ti.questions} câu`); } catch (e) { console.error("[toeic] Khởi tạo lỗi:", e.message); }
// 4.10.4: new multi-subject Pro plan pricing; only update plans still at the old default price (untouched by admin)
try {
  for (const [id, oldP, newP] of [["pro_1m", 59000, 79000], ["pro_3m", 159000, 199000], ["pro_12m", 499000, 599000], ["family_12m", 1290000, 1190000]]) {
    await db.prepare("UPDATE plans SET price_vnd = ? WHERE id = ? AND price_vnd = ?").run(newP, id, oldP);
  }
} catch (e) { console.warn("[plans] cập nhật giá:", e.message); }
// Daily foreign language study reminder: check every 15 minutes, send at most once/day after the configured hour.
const langRemindTick = () => langDailyReminders(db).then((r) => { if (r && r.sent) console.log(`[lang] Đã gửi ${r.sent} lời nhắc học`); }).catch((e) => console.warn("[lang] nhắc học:", e.message));
setTimeout(langRemindTick, 60000).unref?.();
setInterval(langRemindTick, 15 * 60000).unref?.();
const hidden = (k) => new Set(SETTINGS[k] || []);
async function bump(k) { await db.prepare("INSERT INTO site_stats (k, v) VALUES (?, 1) ON CONFLICT(k) DO UPDATE SET v = site_stats.v + 1").run(k); }
async function statVal(k) { const r = await db.prepare("SELECT v FROM site_stats WHERE k = ?").get(k); return r ? r.v : 0; }
async function ratingSummary() {
  const s = await db.prepare("SELECT COUNT(*) AS n, AVG(stars) AS avg FROM ratings").get();
  const recent = (await db.prepare("SELECT r.stars, r.comment, r.updated_at, u.display_name FROM ratings r JOIN users u ON u.id = r.user_id WHERE r.comment != '' ORDER BY r.updated_at DESC LIMIT 20").all())
    .map((x) => ({ stars: x.stars, comment: x.comment, name: x.display_name, at: x.updated_at }));
  return { count: s.n, average: s.n ? Math.round(s.avg * 10) / 10 : 0, recent };
}
// Default exam settings (editable in Admin)

// ---------- Rate limiting ----------
// Only trust X-Forwarded-For when the request comes from localhost (nginx) to prevent IP spoofing.
function isLoopback(addr) { return addr === "127.0.0.1" || addr === "::1" || addr === "::ffff:127.0.0.1"; }
function clientIp(req) {
  const remote = req.socket.remoteAddress || "";
  if (isLoopback(remote) && req.headers["x-forwarded-for"]) return String(req.headers["x-forwarded-for"]).split(",")[0].trim();
  return remote;
}
function isHttps(req) { return isLoopback(req.socket.remoteAddress || "") && req.headers["x-forwarded-proto"] === "https"; }
const buckets = new Map();
// Count hits within the time window; returns true if limit EXCEEDED
function hit(key, max, windowMs, add = true) {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (add) arr.push(now);
  buckets.set(key, arr);
  return arr.length > max;
}
function clearHits(key) { buckets.delete(key); }
setInterval(() => { const now = Date.now(); for (const [k, v] of buckets) if (!v.some((t) => now - t < 3600000)) buckets.delete(k); }, 600000).unref();
function tooManyMsg(res, text) { sendJson(res, 429, { error: text || "Bạn thao tác quá nhanh. Hãy chờ một chút rồi thử lại." }); return true; }
function cookieFlags(req) {
  return "HttpOnly; Path=/; SameSite=Lax" + (isHttps(req) ? "; Secure" : "");
}
setInterval(async () => { try { await db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(nowIso()); } catch {} }, 3600000).unref();

const sessionDays = () => SETTINGS.sessionDays || 30;

function nowIso() { return new Date().toISOString(); }
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(pw, stored) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const calc = crypto.scryptSync(pw, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return calc.length === expected.length && crypto.timingSafeEqual(calc, expected);
}
function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  // API responses contain personal data: prevent browser/proxy caching
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body), "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(body);
}
function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k) out[k] = decodeURIComponent(rest.join("="));
  }
  return out;
}
// Ứng dụng iOS/Android đóng gói sẵn giao diện gọi API bằng header Authorization: Bearer <token>.
const NATIVE_ORIGINS = new Set(["capacitor://localhost", "https://localhost", "http://localhost"]);
function applyNativeCors(req, res) {
  const origin = String(req.headers.origin || "");
  if (!NATIVE_ORIGINS.has(origin)) return false;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type,X-Lang,X-CSRF-Token");
  res.setHeader("Access-Control-Max-Age", "600");
  return true;
}
async function getSession(req) {
  const cookies = parseCookies(req);
  const bearer = String(req.headers.authorization || "").match(/^Bearer\s+([a-f0-9]{64})$/i);
  const token = bearer ? bearer[1].toLowerCase() : cookies.hoc_session;
  if (!token) return null;
  const row = await db.prepare("SELECT s.*, u.id AS user_id, u.username, u.display_name, u.role, u.disabled, u.lang FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?").get(token);
  if (!row || row.disabled) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) { await db.prepare("DELETE FROM sessions WHERE token = ?").run(token); return null; }
  return row;
}
async function requireAuth(req, res) {
  const s = await getSession(req);
  if (!s) { sendJson(res, 401, { error: "Bạn chưa đăng nhập." }); return null; }
  return s;
}
function requireCsrf(req, sess) {
  const token = req.headers["x-csrf-token"];
  return token && token === sess.csrf_token;
}
function readBody(req, max = 200000) {
  return new Promise((resolve, reject) => {
    let data = "";
    let big = false;
    req.on("data", (c) => { if (big) return; data += c; if (data.length > max) { big = true; data = ""; } });
    req.on("end", () => {
      if (big) return resolve(null);
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch { resolve(null); }
    });
    req.on("error", reject);
  });
}
// Read raw request body string (webhook needs the exact raw string to verify HMAC signature)
function readRaw(req, max = 64000) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0; let big = false;
    req.on("data", (c) => { if (big) return; size += c.length; if (size > max) { big = true; return; } chunks.push(c); });
    req.on("end", () => resolve(big ? null : Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
function readBuf(req, max) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0; let big = false;
    req.on("data", (c) => { if (big) return; size += c.length; if (size > max) { big = true; return; } chunks.push(c); });
    req.on("end", () => resolve(big ? null : Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
const ROLES = ["admin", "teacher", "student", "parent"];
// Quên mật khẩu bằng OTP gửi về email
const OTP_MINUTES = 10;
const otpHash = (code, salt) => crypto.createHash("sha256").update(`${salt}:${code}`).digest("hex");
async function findUserForReset(ident) {
  const cols = "id, username, display_name, role, disabled, email, lang";
  if (ident.includes("@")) {
    const e = cleanEmail(ident);
    return e ? db.prepare(`SELECT ${cols} FROM users WHERE LOWER(email) = ?`).get(e) : null;
  }
  return db.prepare(`SELECT ${cols} FROM users WHERE LOWER(username) = LOWER(?)`).get(ident);
}
async function userEmail(id) {
  try { const r = await db.prepare("SELECT email FROM users WHERE id = ?").get(id); return (r && r.email) || ""; } catch { return ""; }
}
// Tên hiển thị: viết hoa chữ cái đầu của mỗi từ
function capName(v) { return String(v || "").trim().split(" ").filter(Boolean).map((w) => w.charAt(0).toLocaleUpperCase("vi") + w.slice(1)).join(" "); }
function publicUser(u) { return { id: u.id, username: u.username, displayName: capName(u.display_name) || u.username, role: u.role, lang: u.lang || "vi" }; }

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json", ".txt": "text/plain; charset=utf-8" };
// Static text assets are compressed (brotli, falling back to gzip). Results for files on disk are
// cached by path + mtime + size, so each asset is compressed once per change. HTML is rendered per
// request (placeholders), so it is compressed on the fly and never cached.
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".svg", ".txt", ".webmanifest"]);
const compressCache = new Map();
function compressStatic(req, filePath, ext, data) {
  if (!COMPRESSIBLE.has(ext) || data.length < 1024) return null;
  const accept = String(req.headers["accept-encoding"] || "");
  const encoding = /\bbr\b/.test(accept) ? "br" : /\bgzip\b/.test(accept) ? "gzip" : null;
  if (!encoding) return null;
  const run = () => (encoding === "br"
    ? zlib.brotliCompressSync(data, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: ext === ".html" ? 5 : 9, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: data.length } })
    : zlib.gzipSync(data, { level: 6 }));
  if (ext === ".html") return { encoding, body: run() };
  let key;
  try { const st = fs.statSync(filePath); key = `${encoding}:${filePath}:${st.mtimeMs}:${st.size}`; } catch { return { encoding, body: run() }; }
  let body = compressCache.get(key);
  if (!body) {
    body = run();
    if (compressCache.size > 500) compressCache.clear();
    compressCache.set(key, body);
  }
  return { encoding, body };
}


// SSR trang chu: tong quan cong khai dung chung cho /api/public/overview va HTML render san.
// (Khong co bang courses: mon hoc lay tu content files + so lieu dem tu Postgres.)
async function publicOverviewData(req) {
  const lang = reqLang(req, null);
  const languages = langPublicSummary(lang === "en");
  const students = (await db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'student'").get()).n;
  return {
    languages, programming: [],
    totals: { languages: languages.length, langExercises: languages.reduce((n, l) => n + l.exercises, 0), chapters: 0, exercises: 0, exams: 0, groups: 0, paths: 0, students },
    chapters: [], groups: [], paths: [],
  };
}

const escHtml = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmtNSSR = (n) => Number(n || 0).toLocaleString("vi-VN");

// Render HTML tinh cho trang chu (cung markup/class nhu landing.js de dung chung CSS).
// Day la HTML hien truoc khi JS chay (SEO + first paint); khi main.js boot,
// renderLanding() ve lai khung roi loadPublic() dien du lieu (lay tu JSON nhung san, khong fetch).
function renderHomeSSR(o, en) {
  const langs = o.languages || [];
  const item = (l) => `<button type="button" class="lp-hero-item" style="--c:${escHtml(l.color || "#5B3FD6")}" data-auth="register"><span class="lp-subj-flag">${l.flag}</span><span><b>${escHtml(l.name)}</b><small>${escHtml((l.levels || [])[0] || "")}</small></span></button>`;
  const card = (l) => `<button type="button" class="hv-subj" style="--c:${escHtml(l.color || "#5B3FD6")}" data-auth="register"><span class="hv-subj-cover"><span class="hv-subj-flag">${l.flag}</span></span><span class="hv-subj-body"><b>${escHtml(l.name)}</b><small>${fmtNSSR(l.exercises)} ${en ? "exercises" : "bài tập"}</small></span></button>`;
  return `<div class="ssr-home">`
    + `<section class="aw-wrap aw-hero-wrap" id="choi-thu"><div class="aw-hero">`
    + `<span class="aw-chip">${en ? "Languages · All in one" : "Ngoại ngữ · Tất cả trong một"}</span>`
    + `<h1>${en ? "Learn languages" : "Học ngoại ngữ"} <mark>${en ? "easily" : "thật dễ hiểu"}</mark></h1>`
    + `<p class="aw-lead">${en ? "English, Chinese, Japanese, Korean and French in one account, with speaking practice, pronunciation and AI mock interviews." : "Tiếng Anh, Trung, Nhật, Hàn, Pháp trong một tài khoản, với luyện nói, luyện phát âm và phỏng vấn thử bằng AI."}</p>`
    + `<div class="aw-cta"><button class="aw-pill dark lg" data-auth="register">${en ? "Start free" : "Bắt đầu học miễn phí"}</button></div>`
    + `<p class="aw-note">${en ? "Basic levels are free · No install · Works on phones" : "Miễn phí các cấp cơ bản · Không cần cài đặt · Dùng được trên điện thoại"}</p>`
    + `</div></section>`
    + `<section class="aw-sec aw-wrap" id="mon-hoc"><h2>${en ? "Languages" : "Ngoại ngữ"}</h2><p class="aw-sub">${en ? "Pick a language and start from the first lesson." : "Chọn một ngôn ngữ và bắt đầu từ bài đầu tiên."}</p>`
    + `<div class="lp-hero-grp"><div>${langs.map(item).join("")}</div></div>`
    + `<div>${langs.map(card).join("")}</div></section>`
    + `</div>`;
}

async function handleApi(req, res, url) {
  const method = req.method;
  const parts = url.pathname.split("/").filter(Boolean); // api, ...
  // Health: no login required
  if (method === "GET" && url.pathname === "/api/health") {
    let dbOk = false;
    try { dbOk = (await db.prepare("SELECT 1 AS ok").get())?.ok === 1; } catch {}
    return sendJson(res, dbOk ? 200 : 503, { ok: dbOk, app: "hoc-ngoai-ngu", version: VERSION });
  }

  // Registration / login
  if (method === "POST" && url.pathname === "/api/register") {
    const body = await readBody(req);
    if (body === null) return sendJson(res, 400, { error: "Dữ liệu gửi lên không hợp lệ." });
    const username = String(body.username || "").trim();
    const displayName = capName(String(body.displayName || username).trim().slice(0, 40)) || username;
    const password = String(body.password || "");
    if (hit("reg:" + clientIp(req), 40, 600000)) return tooManyMsg(res, "Có quá nhiều tài khoản được tạo từ mạng này trong 10 phút. Hãy chờ ít phút rồi thử lại.");
    const firstUser = (await db.prepare("SELECT COUNT(*) AS n FROM users").get()).n === 0;
    if (!firstUser && !SETTINGS.allowRegister) return sendJson(res, 403, { error: "Đăng ký tài khoản đang đóng. Hãy nhờ giáo viên tạo tài khoản cho bạn." });
    if (!firstUser && SETTINGS.registerCode && String(body.classCode || "").trim() !== SETTINGS.registerCode) return sendJson(res, 403, { error: "Mã lớp chưa đúng. Hãy hỏi giáo viên mã lớp." });
    if (!firstUser && SETTINGS.maintenance) return sendJson(res, 503, { error: SETTINGS.maintenanceText, maintenance: true });
    if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username)) return sendJson(res, 400, { error: "Tên đăng nhập chỉ gồm chữ, số, dấu _ . - và dài từ 3 đến 30 ký tự." });
    if (password.length < 6 || password.length > 128) return sendJson(res, 400, { error: "Mật khẩu cần từ 6 đến 128 ký tự." });
    const exists = await db.prepare("SELECT id FROM users WHERE LOWER(username) = LOWER(?)").get(username);
    if (exists) return sendJson(res, 400, { error: "Tên đăng nhập này đã có người dùng." });
    // Email khôi phục (không bắt buộc): dùng để nhận mã OTP khi quên mật khẩu.
    const rawEmail = String(body.email || "").trim();
    const email = cleanEmail(rawEmail);
    if (rawEmail && !email) return sendJson(res, 400, { error: "Email chưa đúng định dạng." });
    if (email && await db.prepare("SELECT id FROM users WHERE LOWER(email) = ?").get(email)) return sendJson(res, 400, { error: "Email này đã được dùng cho tài khoản khác." });
    const count = (await db.prepare("SELECT COUNT(*) AS n FROM users").get()).n;
    // 4.0: system administrator account (admin): ADMIN_USERNAME if set, otherwise the very first account.
    // Registrant chooses: student (default) or parent. Teacher role is granted upon purchasing a Teacher license or by an admin.
    const adminName = (process.env.ADMIN_USERNAME || "").toLowerCase();
    const picked = "student"; // 4.9.3: registration always creates a student; admins upgrade roles when needed
    const role = adminName ? (username.toLowerCase() === adminName ? "admin" : picked) : (count === 0 ? "admin" : picked);
    const lang = body.lang === "en" ? "en" : "vi";
    const createdAt = nowIso();
    const passHash = hashPassword(password);

    // 1) Create user - must succeed
    let userId;
    try {
      const info = await db.prepare("INSERT INTO users (username, display_name, password_hash, role, created_at, lang, email) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id")
        .run(username, displayName, passHash, role, createdAt, lang, email || null);
      userId = Number(info.lastInsertRowid);
    } catch (e) {
      if (/UNIQUE|unique/i.test(String(e && e.message))) return sendJson(res, 400, { error: /email/i.test(String(e.message)) ? "Email này đã được dùng cho tài khoản khác." : "Tên đăng nhập này đã có người dùng." });
      console.error("[register] insert user", e);
      return sendJson(res, 500, { error: "Lỗi máy chủ khi tạo tài khoản. Hãy thử lại sau vài giây." });
    }

    // 2) Đăng ký không kích hoạt Pro dùng thử. Học viên dùng Pro miễn phí 10 phút mỗi ngày hoặc nhập mã quà tặng trong trang Hồ sơ.
    // 3) Create login session immediately
    const token = crypto.randomBytes(32).toString("hex");
    const csrf = crypto.randomBytes(16).toString("hex");
    const exp = new Date(Date.now() + sessionDays() * 86400000).toISOString();
    try {
      await db.prepare("INSERT INTO sessions (token, user_id, csrf_token, created_at, expires_at) VALUES (?, ?, ?, ?, ?)").run(token, userId, csrf, nowIso(), exp);
    } catch (e) {
      console.error("[register] session", e);
      // User already created - still return 201, client logs in via form
      return sendJson(res, 201, { user: { id: userId, username, displayName, role, lang }, trial: null, csrfToken: null, needLogin: true });
    }
    res.setHeader("Set-Cookie", `hoc_session=${token}; ${cookieFlags(req)}; Max-Age=${sessionDays() * 86400}`);
    return sendJson(res, 201, { user: { id: userId, username, displayName, role, lang }, trial: null, csrfToken: csrf, token });
  }
  
if (method === "POST" && url.pathname === "/api/login") {
    const body = await readBody(req);
    if (body === null) return sendJson(res, 400, { error: "Dữ liệu gửi lên không hợp lệ." });
    const ip = clientIp(req), uname = String(body.username || "").trim().toLowerCase().slice(0, 40);
    // Only count FAILED login attempts: a whole classroom sharing one IP can still log in normally
    if (hit("lf:" + ip + ":" + uname, 8, 600000, false) || hit("lfip:" + ip, 80, 600000, false)) return tooManyMsg(res, "Bạn nhập sai quá nhiều lần. Hãy chờ khoảng 10 phút rồi thử lại.");
    const user = await db.prepare("SELECT * FROM users WHERE LOWER(username) = LOWER(?)").get(String(body.username || "").trim());
    if (!user || !verifyPassword(String(body.password || ""), user.password_hash)) {
      hit("lf:" + ip + ":" + uname, 8, 600000); hit("lfip:" + ip, 80, 600000);
      return sendJson(res, 401, { error: "Tên đăng nhập hoặc mật khẩu chưa đúng." });
    }
    clearHits("lf:" + ip + ":" + uname);
    if (user.disabled) return sendJson(res, 403, { error: "Tài khoản này đang bị khóa. Hãy liên hệ giáo viên." });
    if (SETTINGS.maintenance && user.role !== "admin") return sendJson(res, 503, { error: SETTINGS.maintenanceText, maintenance: true });
    const token = crypto.randomBytes(32).toString("hex");
    const csrf = crypto.randomBytes(16).toString("hex");
    const exp = new Date(Date.now() + sessionDays() * 86400000).toISOString();
    await db.prepare("INSERT INTO sessions (token, user_id, csrf_token, created_at, expires_at) VALUES (?, ?, ?, ?, ?)").run(token, user.id, csrf, nowIso(), exp);
    res.setHeader("Set-Cookie", `hoc_session=${token}; ${cookieFlags(req)}; Max-Age=${sessionDays() * 86400}`);
    return sendJson(res, 200, { user: publicUser(user), csrfToken: csrf, token });
  }
  if (method === "POST" && url.pathname === "/api/logout") {
    const sess = await getSession(req);
    if (sess) await db.prepare("DELETE FROM sessions WHERE token = ?").run(sess.token);
    res.setHeader("Set-Cookie", `hoc_session=; ${cookieFlags(req)}; Max-Age=0`);
    return sendJson(res, 200, { ok: true });
  }


  // ── Funnel tracking (4.8.0) ──────────────────────────────────────────────────
  // POST /api/funnel/event - no login required, stores no PII.
  // Body: { event: string, sessionId: string, referrer?: string }
  // Valid events: demo_run | demo_run_ok | register_click | register_complete
  if (method === "POST" && url.pathname === "/api/funnel/event") {
    const VALID_EVENTS = new Set(["demo_run", "demo_run_ok", "register_click", "register_complete"]);
    const body = await readBody(req);
    if (body === null) return sendJson(res, 400, { error: "Body không hợp lệ." });
    const event = String(body.event || "").trim().slice(0, 40);
    const sessionId = String(body.sessionId || "").trim().replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64);
    const referrer = String(body.referrer || "").trim().slice(0, 200);
    if (!VALID_EVENTS.has(event)) return sendJson(res, 400, { error: "event không hợp lệ." });
    if (!sessionId) return sendJson(res, 400, { error: "sessionId bắt buộc." });
    // Light rate-limit: prevent flooding from a single IP
    if (hit("funnel:" + clientIp(req), 120, 60000)) return sendJson(res, 429, { ok: false });
    try {
      await db.prepare("INSERT INTO funnel_events (event, session_id, referrer, ts) VALUES (?, ?, ?, ?)").run(event, sessionId, referrer, nowIso());
    } catch { /* ignore funnel write errors - do not affect UX */ }
    return sendJson(res, 200, { ok: true });
  }

  // GET /api/admin/funnel?days=14 - admin/teacher only. Funnel summary.
  if (method === "GET" && url.pathname === "/api/admin/funnel") {
    const sess = await requireAuth(req, res); if (!sess) return;
    if (!["admin", "teacher"].includes(sess.role)) return sendJson(res, 403, { error: "Chỉ admin/teacher." });
    const days = Math.max(1, Math.min(90, Number(url.searchParams.get("days") || 14)));
    const since = new Date(Date.now() - days * 86400000).toISOString();
    try {
      const rows = await db.prepare(`
        SELECT event, COUNT(*) AS cnt,
               COUNT(DISTINCT session_id) AS uniq
        FROM funnel_events
        WHERE ts >= ?
        GROUP BY event
        ORDER BY cnt DESC
      `).all(since);
      // Calculate drop-off rates: demo_run -> register_click -> register_complete
      const byEvent = Object.fromEntries(rows.map((r) => [r.event, { total: r.cnt, unique: r.uniq }]));
      const demoRun   = byEvent.demo_run?.unique || 0;
      const demoOk    = byEvent.demo_run_ok?.unique || 0;
      const regClick  = byEvent.register_click?.unique || 0;
      const regDone   = byEvent.register_complete?.unique || 0;
      const pct = (a, b) => b > 0 ? Math.round((a / b) * 1000) / 10 : null;
      return sendJson(res, 200, {
        days,
        since,
        events: byEvent,
        funnel: [
          { step: "demo_run",          unique: demoRun,  rate: null },
          { step: "demo_run_ok",       unique: demoOk,   rate: pct(demoOk, demoRun) },
          { step: "register_click",    unique: regClick, rate: pct(regClick, demoRun) },
          { step: "register_complete", unique: regDone,  rate: pct(regDone, regClick) },
        ],
      });
    } catch (e) {
      return sendJson(res, 500, { error: "Lỗi khi đọc funnel." });
    }
  }

  // Traffic counter (no login required): visits = every page load, visitors = unique browser (30-day cookie)
  if (method === "POST" && url.pathname === "/api/visit") {
    await bump("visits");
    const seen = parseCookies(req).hoc_visitor;
    if (!seen) { await bump("visitors"); res.setHeader("Set-Cookie", `hoc_visitor=1; ${cookieFlags(req)}; Max-Age=${30 * 86400}`); }
    return sendJson(res, 200, { visits: await statVal("visits"), visitors: await statVal("visitors") });
  }
  if (method === "GET" && url.pathname === "/api/stats") {
    const registered = (await db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'student'").get()).n;
    return sendJson(res, 200, { visits: await statVal("visits"), visitors: await statVal("visitors"), registered, ratings: await ratingSummary(), version: VERSION });
  }

  // 2.0.0: public overview for landing page (does not expose prompts or solutions)
  if (method === "GET" && url.pathname === "/api/public/overview") {
    return sendJson(res, 200, await publicOverviewData(req));
  }

  if (method === "GET" && url.pathname === "/api/public/config") return sendJson(res, 200, { config: { ...publicSettings(SETTINGS), ...brandInfo() }, version: VERSION });
  if (method === "GET" && url.pathname === "/api/public/qr") {
    const rawPath = String(url.searchParams.get("path") || "/tai-ung-dung");
    const safePath = /^\/(?:tai-ung-dung|download|app\/tai-ung-dung)?$/.test(rawPath) ? rawPath : "/tai-ung-dung";
    const reqBase = publicUrl() || `${isHttps(req) ? "https" : "http"}://${String(req.headers.host || "localhost").replace(/[^A-Za-z0-9.:-]/g, "")}`;
    const targetUrl = reqBase + safePath;
    return sendJson(res, 200, { url: targetUrl, qr: qrDataUrl(targetUrl) });
  }

  // ----- Forgot password (public, does not reveal whether user exists) -----
  if (method === "POST" && url.pathname === "/api/password/forgot") {
    const body = await readBody(req);
    if (body === null) return sendJson(res, 400, { error: "Dữ liệu không hợp lệ." });
    if (hit("pwforgot:" + clientIp(req), 8, 600000)) return tooManyMsg(res, "Bạn yêu cầu đặt lại mật khẩu quá nhiều lần. Hãy chờ khoảng 10 phút.");
    // Nhận tên đăng nhập HOẶC email khôi phục. Câu trả lời luôn giống nhau dù tài khoản có tồn tại hay không.
    const username = String(body.username || body.identifier || "").trim().slice(0, 254);
    const otpOn = mailConfigured();
    const generic = otpOn
      ? { ok: true, otp: true, message: `Nếu tài khoản tồn tại và có email, mã OTP đã được gửi về email đó. Mã có hiệu lực ${OTP_MINUTES} phút.` }
      : { ok: true, otp: false, message: "Chưa gửi được mã qua email. Hãy liên hệ giáo viên hoặc quản trị viên để được đặt lại mật khẩu." };
    if (!username) return sendJson(res, 200, generic);
    const u = await findUserForReset(username);
    if (!u || u.disabled || u.role === "admin") return sendJson(res, 200, generic);
    // Có email + đã cấu hình SMTP: gửi mã OTP 6 số (hiệu lực 10 phút, dùng một lần). Chỉ lưu bản băm của mã.
    if (otpOn && u.email) {
      if (hit("pwotp-send:" + u.id, 4, 600000)) return sendJson(res, 200, generic);
      const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
      const salt = crypto.randomBytes(8).toString("hex");
      const otpExp = new Date(Date.now() + OTP_MINUTES * 60000).toISOString();
      try {
        await db.prepare("DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL").run(u.id);
        await db.prepare("INSERT INTO password_resets (token, user_id, expires_at, created_at, created_ip) VALUES (?, ?, ?, ?, ?)").run(`otp:${u.id}:${salt}:${otpHash(code, salt)}`, u.id, otpExp, nowIso(), clientIp(req));
      } catch (e) {
        console.error("[password/forgot] otp", e.message);
        return sendJson(res, 200, generic);
      }
      // Không chờ gửi xong mới trả lời: thời gian phản hồi không để lộ tài khoản có email hay không.
      sendMail({ to: u.email, ...otpMail({ code, minutes: OTP_MINUTES, siteName: SETTINGS.siteName, username: u.username, lang: u.lang }) })
        .then(() => console.log(`[password/forgot] da gui OTP cho user=#${u.id} (${maskEmail(u.email)})`))
        .catch((e) => console.error(`[password/forgot] gui email that bai user=#${u.id}:`, e.message));
      return sendJson(res, 200, generic);
    }
    const token = crypto.randomBytes(24).toString("hex");
    const exp = new Date(Date.now() + 3600 * 1000).toISOString();
    try {
      await db.prepare("DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL").run(u.id);
      await db.prepare("INSERT INTO password_resets (token, user_id, expires_at, created_at, created_ip) VALUES (?, ?, ?, ?, ?)").run(token, u.id, exp, nowIso(), clientIp(req));
    } catch (e) {
      console.error("[password/forgot]", e.message);
      return sendJson(res, 200, generic);
    }
    // Save internal notification (visible if the user is logged in on another session)
    try {
      const { notify } = await import("./modules/notify.js");
      await notify(db, {
        userId: u.id,
        kind: "password_reset",
        title: "Yêu cầu đặt lại mật khẩu",
        body: "Có yêu cầu đặt lại mật khẩu cho tài khoản này. Nếu không phải bạn, hãy đổi mật khẩu ngay sau khi vào được hệ thống.",
        link: "/app/ca-nhan",
        payload: { resetTokenHint: token.slice(0, 6) + "…" },
      });
    } catch {}
    // Log token for admin/VPS support (never returned to client for security). Webhook receives full token if configured.
    console.log(`[password/forgot] user=#${u.id} @${u.username} token=${token} expires=${exp}`);
    try {
      const { deliverWebhook } = await import("./modules/notify.js");
      deliverWebhook({
        kind: "password_reset_token",
        userId: u.id,
        username: u.username,
        displayName: capName(u.display_name),
        title: "Đặt lại mật khẩu",
        body: `Token cho @${u.username}`,
        link: `/app/dat-lai-mat-khau?token=${token}`,
        payload: { token, expiresAt: exp },
        createdAt: nowIso(),
      }).catch(() => {});
    } catch {}
    // Dev/local: return token when NODE_ENV=development or ALLOW_RESET_TOKEN_IN_RESPONSE=1
    if (process.env.ALLOW_RESET_TOKEN_IN_RESPONSE === "1" || process.env.NODE_ENV === "development") {
      return sendJson(res, 200, { ...generic, devToken: token, resetPath: `/app/dat-lai-mat-khau?token=${token}` });
    }
    return sendJson(res, 200, generic);
  }
  // ----- Đặt lại mật khẩu bằng mã OTP gửi về email -----
  if (method === "POST" && url.pathname === "/api/password/reset-otp") {
    const body = await readBody(req);
    if (body === null) return sendJson(res, 400, { error: "Dữ liệu không hợp lệ." });
    if (hit("pwotp-ip:" + clientIp(req), 20, 600000)) return tooManyMsg(res, "Thử lại sau vài phút.");
    const ident = String(body.username || body.identifier || "").trim().slice(0, 254);
    const code = String(body.code || "").replace(/\s+/g, "");
    const newPassword = String(body.newPassword || "");
    const wrong = { error: "Mã OTP không đúng hoặc đã hết hạn. Hãy kiểm tra lại hoặc yêu cầu mã mới." };
    if (!/^\d{6}$/.test(code)) return sendJson(res, 400, { error: "Mã OTP gồm 6 chữ số." });
    if (newPassword.length < 6 || newPassword.length > 128) return sendJson(res, 400, { error: "Mật khẩu mới cần từ 6 đến 128 ký tự." });
    // Tối đa 5 lần thử cho mỗi tài khoản trong 10 phút: mã 6 số không dò được.
    if (hit("pwotp-try:" + ident.toLowerCase(), 5, 600000)) return tooManyMsg(res, "Bạn nhập sai mã quá nhiều lần. Hãy yêu cầu mã mới sau ít phút.");
    const u = ident ? await findUserForReset(ident) : null;
    if (!u || u.disabled || u.role === "admin") return sendJson(res, 400, wrong);
    let rows = [];
    try { rows = await db.prepare("SELECT token, expires_at FROM password_resets WHERE user_id = ? AND used_at IS NULL").all(u.id); } catch { rows = []; }
    const row = rows.find((r) => {
      const m = /^otp:(\d+):([0-9a-f]+):([0-9a-f]+)$/.exec(r.token || "");
      if (!m || Number(m[1]) !== u.id || Date.parse(r.expires_at) < Date.now()) return false;
      const a = Buffer.from(m[3], "hex"), b = Buffer.from(otpHash(code, m[2]), "hex");
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    });
    if (!row) return sendJson(res, 400, wrong);
    await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(newPassword), u.id);
    await db.prepare("UPDATE password_resets SET used_at = ? WHERE token = ?").run(nowIso(), row.token);
    await db.prepare("DELETE FROM sessions WHERE user_id = ?").run(u.id);
    try {
      const { notify } = await import("./modules/notify.js");
      await notify(db, { userId: u.id, kind: "password_changed", title: "Đã đổi mật khẩu", body: "Mật khẩu tài khoản vừa được đặt lại bằng mã OTP gửi về email.", link: "/app/ca-nhan" });
    } catch {}
    return sendJson(res, 200, { ok: true, username: u.username, message: "Đã đặt mật khẩu mới. Hãy đăng nhập." });
  }
  if (method === "POST" && url.pathname === "/api/password/reset") {
    const body = await readBody(req);
    if (body === null) return sendJson(res, 400, { error: "Dữ liệu không hợp lệ." });
    if (hit("pwreset:" + clientIp(req), 20, 600000)) return tooManyMsg(res, "Thử lại sau vài phút.");
    const token = String(body.token || "").trim();
    const newPassword = String(body.newPassword || "");
    if (!token || token.length < 16 || token.startsWith("otp:")) return sendJson(res, 400, { error: "Liên kết đặt lại không hợp lệ." });
    if (newPassword.length < 6 || newPassword.length > 128) return sendJson(res, 400, { error: "Mật khẩu mới cần từ 6 đến 128 ký tự." });
    let row;
    try {
      row = await db.prepare("SELECT * FROM password_resets WHERE token = ?").get(token);
    } catch (e) {
      return sendJson(res, 503, { error: "Chức năng đặt lại mật khẩu chưa sẵn sàng. Hãy khởi động lại máy chủ sau khi cập nhật." });
    }
    if (!row || row.used_at) return sendJson(res, 400, { error: "Liên kết đã dùng hoặc không tồn tại." });
    if (Date.parse(row.expires_at) < Date.now()) return sendJson(res, 400, { error: "Liên kết đã hết hạn. Hãy yêu cầu đặt lại mật khẩu mới." });
    const u = await db.prepare("SELECT id, username, role FROM users WHERE id = ?").get(row.user_id);
    if (!u || u.role === "admin") return sendJson(res, 400, { error: "Không thể đặt lại mật khẩu cho tài khoản này." });
    await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(newPassword), u.id);
    await db.prepare("UPDATE password_resets SET used_at = ? WHERE token = ?").run(nowIso(), token);
    await db.prepare("DELETE FROM sessions WHERE user_id = ?").run(u.id);
    try {
      const { notify } = await import("./modules/notify.js");
      await notify(db, { userId: u.id, kind: "password_changed", title: "Đã đổi mật khẩu", body: "Mật khẩu tài khoản vừa được đặt lại thành công.", link: "/app/dang-nhap" });
    } catch {}
    return sendJson(res, 200, { ok: true, username: u.username, message: "Đã đặt mật khẩu mới. Hãy đăng nhập." });
  }


  // Authentication required from here on
  const sess = await requireAuth(req, res);
  if (!sess) return;
  const user = { id: sess.user_id, username: sess.username, display_name: sess.display_name, role: sess.role, lang: sess.lang };
  if (SETTINGS.maintenance && user.role !== "admin" && url.pathname !== "/api/me") return sendJson(res, 503, { error: SETTINGS.maintenanceText, maintenance: true });
  // 4.0: "isTeacher" in legacy routes = system administrator (admin). Classroom teachers only have permissions in modules/classroom.js.
  const isTeacher = user.role === "admin";
  // 4.8.0: Foreign Languages (HSK, JLPT, DELF, CEFR, TOPIK) - server-side grading
  // 4.13.0: AI speech synthesis (with disk cache)
  if (await ttsApi({ req, res, url, method, user, sess, sendJson, readBody, requireCsrf, hit, settings: () => SETTINGS, dataDir: DATA_DIR })) return;
  // 4.11.0: Speaking Lab (word-by-word read-along grading, AI conversation) - must be mounted before langApi
  if (await speakApi({ db, req, res, url, method, user, sess, isAdmin: user.role === "admin", sendJson, readBody, requireCsrf, hit, nowIso, settings: () => SETTINGS, getPro: async () => !!(await membership(db, user)).pro, lang: reqLang(req, user) })) return;
  // Góp ý sản phẩm (tính năng, báo lỗi, ý kiến khác)
  if (await feedbackApi({ db, req, res, url, method, user, sess, sendJson, readBody, requireCsrf, hit, nowIso })) return;
  if (await giftApi({ db, req, res, url, method, user, sess, sendJson, readBody, requireCsrf, hit })) return;
  if (await petApi({ db, req, res, url, method, user, sess, sendJson, readBody, requireCsrf, hit })) return;
  if (await petGamesApi({ db, req, res, url, method, user, sess, sendJson, readBody, requireCsrf, hit, settings: () => SETTINGS, dataDir: DATA_DIR })) return;
  if (await emailVerifyApi({ db, req, res, url, method, user, sess, sendJson, readBody, requireCsrf, hit, siteName: SETTINGS.siteName })) return;
  if (await langApi({ db, req, res, url, method, user, sess, isAdmin: user.role === "admin", sendJson, readBody, requireCsrf, hit, nowIso, getPro: async () => !!(await membership(db, user)).pro, settings: () => SETTINGS, lang: reqLang(req, user) })) return;
  if (await toeicApi({ db, req, res, url, method, user, sess, sendJson, readBody, requireCsrf, hit, nowIso, lang: reqLang(req, user) })) return;

  if (method === "GET" && url.pathname === "/api/rating") {
    const mine = await db.prepare("SELECT stars, comment FROM ratings WHERE user_id = ?").get(user.id) || null;
    return sendJson(res, 200, { mine, summary: await ratingSummary() });
  }
  if (method === "POST" && url.pathname === "/api/rating") {
    if (!SETTINGS.ratingEnabled) return sendJson(res, 403, { error: "Chức năng đánh giá đang tắt." });
    const body = await readBody(req);
    if (body === null || !requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ, hãy tải lại trang." });
    const stars = Number(body.stars);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) return sendJson(res, 400, { error: "Hãy chọn từ 1 đến 5 sao." });
    const comment = String(body.comment || "").trim().slice(0, 500);
    const t = nowIso();
    await db.prepare("INSERT INTO ratings (user_id, stars, comment, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET stars = excluded.stars, comment = excluded.comment, updated_at = excluded.updated_at").run(user.id, stars, comment, t, t);
    return sendJson(res, 200, { ok: true, summary: await ratingSummary() });
  }
  
if (method === "POST" && url.pathname === "/api/password/change") {
    const body = await readBody(req);
    if (body === null || !requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ, hãy tải lại trang và đăng nhập lại." });
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    if (newPassword.length < 6 || newPassword.length > 128) return sendJson(res, 400, { error: "Mật khẩu mới cần từ 6 đến 128 ký tự." });
    const row = await db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
    if (!row || !verifyPassword(currentPassword, row.password_hash)) return sendJson(res, 401, { error: "Mật khẩu hiện tại chưa đúng." });
    await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(newPassword), user.id);
    // Log out all other sessions, keeping the current session
    await db.prepare("DELETE FROM sessions WHERE user_id = ? AND token != ?").run(user.id, sess.token);
    return sendJson(res, 200, { ok: true });
  }
  if (method === "GET" && url.pathname === "/api/me") {
    const b = {};
    let hasClass = false, hasFamily = false;
    try {
      hasClass = !!(
        (await db.prepare("SELECT 1 FROM class_members WHERE user_id = ? AND status = 'active' LIMIT 1").get(user.id))
        || (await db.prepare("SELECT 1 FROM classrooms WHERE teacher_id = ? AND status = 'active' LIMIT 1").get(user.id))
      );
    } catch {}
    try {
      hasFamily = user.role === "parent" || !!(
        (await db.prepare("SELECT 1 FROM family_members WHERE user_id = ? LIMIT 1").get(user.id))
        || (await db.prepare("SELECT 1 FROM family_groups WHERE owner_id = ? AND status = 'active' LIMIT 1").get(user.id))
      );
    } catch {}
    const mem = await membership(db, user);
    if (mem && (mem.planKind === "family" || mem.kind === "family" || mem.family)) hasFamily = true;
    return sendJson(res, 200, {
      user: { ...publicUser(user), email: await userEmail(user.id) }, membership: mem, csrfToken: sess.csrf_token, scores: b, complete: false,
      config: { ...clientSettings(SETTINGS), ...brandInfo() }, version: VERSION,
      maintenance: !!(SETTINGS.maintenance && !isTeacher),
      nav: { hasClass, hasFamily },
      otpEmail: mailConfigured(),
    });
  }
  // Email khôi phục: thêm / đổi / xóa. Bắt buộc nhập mật khẩu hiện tại để người lạ đang cầm máy không đổi được.
  if (method === "POST" && url.pathname === "/api/profile/email") {
    const body = await readBody(req);
    if (body === null || !requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ, hãy tải lại trang." });
    if (hit("email-set:" + user.id, 8, 600000)) return tooManyMsg(res);
    const raw = String(body.email || "").trim();
    const email = cleanEmail(raw);
    if (raw && !email) return sendJson(res, 400, { error: "Email chưa đúng định dạng." });
    const row = await db.prepare("SELECT password_hash FROM users WHERE id = ?").get(user.id);
    if (!row || !verifyPassword(String(body.currentPassword || ""), row.password_hash)) return sendJson(res, 400, { error: "Mật khẩu hiện tại chưa đúng." });
    if (email && await db.prepare("SELECT id FROM users WHERE LOWER(email) = ? AND id <> ?").get(email, user.id)) return sendJson(res, 400, { error: "Email này đã được dùng cho tài khoản khác." });
    try {
      await db.prepare("UPDATE users SET email = ? WHERE id = ?").run(email || null, user.id);
    } catch (e) {
      if (/UNIQUE|unique/i.test(String(e && e.message))) return sendJson(res, 400, { error: "Email này đã được dùng cho tài khoản khác." });
      throw e;
    }
    return sendJson(res, 200, { ok: true, email, message: email ? "Đã lưu email khôi phục." : "Đã xóa email khôi phục." });
  }
  // Tên hiển thị do quản trị viên đặt khi tạo tài khoản; học viên không tự đổi tên.
  if (method === "POST" && url.pathname === "/api/profile/name") {
    return sendJson(res, 403, { error: "Tên hiển thị do quản trị viên quản lý. Liên hệ quản trị viên nếu cần đổi." });
  }
  // 2.0.0: per-chapter exam status for the logged-in user
  // 2.0.0: own submission history for an exercise
  // 2.0.0: submission timestamps over the past year for the activity heatmap
  // 2.1.0: personal settings synced across devices (daily goal, bookmarks, notes)
  if (method === "GET" && url.pathname === "/api/prefs") {
    const r = await db.prepare("SELECT data FROM user_prefs WHERE user_id = ?").get(user.id);
    let data = {}; try { data = JSON.parse(r ? r.data : "{}") || {}; } catch {}
    return sendJson(res, 200, { prefs: data });
  }
  if (method === "PUT" && url.pathname === "/api/prefs") { return withPetLock(user.id, async () => {
    const body = await readBody(req);
    if (body === null || !requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ, hãy tải lại trang." });
    const p = body.prefs && typeof body.prefs === "object" ? body.prefs : {};
    // Giữ nguyên trạng thái bạn đồng hành nếu lần lưu này không gửi kèm (tránh ghi đè bằng giá trị mặc định)
    const prevRow = await db.prepare("SELECT data FROM user_prefs WHERE user_id = ?").get(user.id);
    let prevPet = null;
    let prevWords = null;
    try { const prevData = JSON.parse(prevRow ? prevRow.data : "{}"); prevPet = prevData.pet || null; prevWords = prevData.words || null; } catch {}
    const clean = {
      dailyGoal: Math.min(20, Math.max(1, Number(p.dailyGoal) || 3)),
      bookmarks: Array.isArray(p.bookmarks) ? p.bookmarks.map(String).filter((x) => /^[\w-]{1,40}$/.test(x)).slice(0, 300) : [],
      notes: {},
      lastPath: typeof p.lastPath === "string" && /^[\w-]{0,40}$/.test(p.lastPath) ? p.lastPath : "",
      goal: ["foundation", "exam", "job"].includes(p.goal) ? p.goal : "",
      pet: p.pet && typeof p.pet === "object" ? (() => {
        const q = p.pet;
        const int = (v, max) => Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));
        const days = {};
        if (q.studyDays && typeof q.studyDays === "object") for (const [k, v] of Object.entries(q.studyDays).slice(0, 60)) if (/^[a-z]{1,12}$/.test(k) && /^\d{4}-\d{2}-\d{2}$/.test(String(v))) days[k] = String(v);
        const aw = {};
        if (q.awarded && typeof q.awarded === "object") for (const k of Object.keys(q.awarded).slice(0, 800)) if (/^[\w:.-]{1,90}$/.test(k)) aw[k] = true;
        const dateRe = /^\d{4}-\d{2}-\d{2}$/;
        // Sao, tri thức và lượt chấm bài do máy chủ giữ (modules/pet.js): giữ giá trị cũ, không nhận từ trình duyệt
        const sp = prevPet || {};
        return { energy: q.energy === undefined ? 100 : int(q.energy, 100), energyAt: int(q.energyAt, 9e15), energyKey: dateRe.test(String(q.energyKey)) ? String(q.energyKey) : "", studyDays: days, awarded: aw, stars: Math.min(99999, Math.max(0, Math.round((Number(sp.stars) || 0) * 2) / 2)), knowledge: Math.min(100, Math.max(0, Math.round((Number(sp.knowledge) || 0) * 2) / 2)), daily: sp.daily || undefined, gameDay: sp.gameDay || undefined };
      })() : prevPet || undefined,
      words: Array.isArray(p.words) ? p.words.slice(0, 300).map((w) => ({ lang: String(w.lang || "").slice(0, 12), word: String(w.word || "").slice(0, 80), reading: String(w.reading || "").slice(0, 80), meaning: String(w.meaning || "").slice(0, 200), at: String(w.at || "").slice(0, 30) })).filter((w) => w.word) : (prevWords || undefined),
      companion: ["owl", "panda", "cat", "bunny", "fox", "dragon"].includes(p.companion) ? p.companion : "", // bạn đồng hành Chibi người dùng chọn
      goalPath: typeof p.goalPath === "string" && /^[\w-]{1,40}$/.test(p.goalPath) ? p.goalPath : "",
      seenBadges: Array.isArray(p.seenBadges) ? p.seenBadges.map(String).slice(0, 200) : [],
      subject: typeof p.subject === "string" && /^[a-z]{0,12}$/.test(p.subject) ? p.subject : "", // 4.9.5: currently active subject
      guideSeen: p.guideSeen === true, // hướng dẫn lần đầu đã được đóng (bỏ qua hoặc đã đọc)
      subjectTips: (() => { const o = {}; if (p.subjectTips && typeof p.subjectTips === "object") for (const [k, v] of Object.entries(p.subjectTips)) if (/^[a-z]{1,12}$/.test(k) && v === true) o[k] = true; return o; })(), // hướng dẫn riêng từng môn đã xem
    };
    if (p.notes && typeof p.notes === "object") {
      let n = 0;
      for (const [k, v] of Object.entries(p.notes)) {
        if (!/^[\w-]{1,40}$/.test(k) || typeof v !== "string" || !v.trim()) continue;
        clean.notes[k] = v.slice(0, 2000);
        if (++n >= 300) break;
      }
    }
    const json = JSON.stringify(clean);
    if (json.length > 150000) return sendJson(res, 400, { error: "Ghi chú quá dài." });
    await db.prepare("INSERT INTO user_prefs (user_id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at").run(user.id, json, nowIso());
    return sendJson(res, 200, { prefs: clean });
  }); }
  // 2.1.0: class notifications
  if (method === "GET" && url.pathname === "/api/announcements") {
    const rows = await db.prepare("SELECT a.id, a.title, a.body, a.pinned, a.created_at, u.display_name AS author FROM announcements a LEFT JOIN users u ON u.id = a.author_id ORDER BY a.pinned DESC, a.created_at DESC LIMIT 30").all();
    return sendJson(res, 200, { announcements: rows });
  }
  
  // Bài tập tùy chỉnh: xem đề trắc nghiệm (đáp án không gửi về trình duyệt trước khi nộp)
  // Exam: start attempt
  // Exam: submit attempt (server enforces deadline)
  // Admin
  if (parts[0] === "api" && parts[1] === "admin") {
    if (user.role !== "admin") return sendJson(res, 403, { error: "Bạn không có quyền truy cập trang này." });
    if (method === "GET" && url.pathname === "/api/admin/overview") {
      const users = await db.prepare("SELECT id, username, display_name, role, created_at, disabled, lang FROM users ORDER BY created_at ASC").all();
      const lastSubMap = Object.fromEntries((await db.prepare("SELECT user_id, MAX(created_at) AS t FROM assignment_submissions GROUP BY user_id").all()).map((r) => [r.user_id, r.t]));
      const xpMap = {};
      try {
        for (const r of await db.prepare("SELECT user_id, COALESCE(SUM(CASE WHEN best_score >= 80 THEN best_score ELSE 0 END), 0) AS xp, MAX(updated_at) AS t FROM lang_progress GROUP BY user_id").all()) {
          xpMap[r.user_id] = Number(r.xp) || 0;
          if (r.t && (!lastSubMap[r.user_id] || r.t > lastSubMap[r.user_id])) lastSubMap[r.user_id] = r.t;
        }
      } catch {}
      const sessMap = Object.fromEntries((await db.prepare("SELECT user_id, COUNT(*) AS n FROM sessions WHERE expires_at > ? GROUP BY user_id").all(nowIso())).map((r) => [r.user_id, r.n]));
      const students = await Promise.all(users.map(async (u) => ({
        ...publicUser(u),
        createdAt: u.created_at,
        disabled: !!u.disabled,
        total: xpMap[u.id] || 0,
        complete: false,
        lastActive: lastSubMap[u.id] || null,
        sessions: sessMap[u.id] || 0,
        lang: u.lang || "vi",
      })));
      const customExercises = await db.prepare("SELECT * FROM custom_exercises ORDER BY created_at DESC").all();
      const byRole = { admin: 0, teacher: 0, student: 0, parent: 0 };
      for (const u of users) byRole[u.role] = (byRole[u.role] || 0) + 1;
      return sendJson(res, 200, {
        students, customExercises,
        userCount: students.length,
        userStats: { total: users.length, byRole, locked: users.filter((u) => u.disabled).length, online: Object.keys(sessMap).length },
      });
    }

    if (method === "GET" && url.pathname === "/api/admin/monitoring") {
      const backend = httpMetrics.summary();
      const today = nowIso().slice(0, 10);
      const sevenAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const aiTotal = await db.prepare("SELECT COUNT(*) c, COALESCE(SUM(input_tokens),0) i, COALESCE(SUM(output_tokens),0) o, COALESCE(SUM(cost_usd_micro),0) cost, COALESCE(SUM(CASE WHEN ok=0 THEN 1 ELSE 0 END),0) failed FROM ai_usage").get();
      const aiToday = await db.prepare("SELECT COUNT(*) c, COALESCE(SUM(input_tokens),0) i, COALESCE(SUM(output_tokens),0) o, COALESCE(SUM(cost_usd_micro),0) cost FROM ai_usage WHERE substr(created_at,1,10) = ?").get(today);
      const ai7 = await db.prepare("SELECT COUNT(*) c, COALESCE(SUM(input_tokens),0) i, COALESCE(SUM(output_tokens),0) o, COALESCE(SUM(cost_usd_micro),0) cost FROM ai_usage WHERE created_at >= ?").get(sevenAgo);
      const aiByModel = await db.prepare("SELECT model, COUNT(*) c, COALESCE(SUM(input_tokens),0) i, COALESCE(SUM(output_tokens),0) o, COALESCE(SUM(cost_usd_micro),0) cost FROM ai_usage GROUP BY model ORDER BY cost DESC LIMIT 10").all();
      const users = (await db.prepare("SELECT COUNT(*) c FROM users").get()).c;
      const online = (await db.prepare("SELECT COUNT(DISTINCT user_id) c FROM sessions WHERE expires_at > ?").get(nowIso())).c;
      const alerts = [];
      if (backend.eventLoopLagSec > 0.5) alerts.push({ level: "warning", text: "Event loop lag " + backend.eventLoopLagSec.toFixed(2) + "s — máy chủ đang tải nặng." });
      if (aiTotal.failed > 0) alerts.push({ level: "info", text: "AI có " + aiTotal.failed + " lượt lỗi trong tổng " + aiTotal.c + " lượt." });
      return sendJson(res, 200, {
        backend,
        ai: { total: aiTotal, today: aiToday, last7d: ai7, byModel: aiByModel },
        db: { users, online },
        alerts, generatedAt: nowIso(),
      });
    }

    // Filtered user list (dedicated API, does not load all submissions)
    if (method === "GET" && url.pathname === "/api/admin/users") {
      const q = String(url.searchParams.get("q") || "").trim().toLowerCase();
      const role = String(url.searchParams.get("role") || "").trim();
      const status = String(url.searchParams.get("status") || "").trim(); // active|locked|all
      const limit = Math.min(2000, Math.max(1, Number(url.searchParams.get("limit")) || 500));
      let rows = await db.prepare("SELECT id, username, display_name, role, created_at, disabled, lang FROM users ORDER BY created_at DESC").all();
      if (role && ROLES.includes(role)) rows = rows.filter((u) => u.role === role);
      if (status === "locked") rows = rows.filter((u) => u.disabled);
      else if (status === "active") rows = rows.filter((u) => !u.disabled);
      if (q) rows = rows.filter((u) => u.username.toLowerCase().includes(q) || (u.display_name || "").toLowerCase().includes(q));
      rows = rows.slice(0, limit);
      const lastSubMap = Object.fromEntries((await db.prepare("SELECT user_id, MAX(created_at) AS t FROM assignment_submissions GROUP BY user_id").all()).map((r) => [r.user_id, r.t]));
      const xpMap = {};
      try {
        for (const r of await db.prepare("SELECT user_id, COALESCE(SUM(CASE WHEN best_score >= 80 THEN best_score ELSE 0 END), 0) AS xp, MAX(updated_at) AS t FROM lang_progress GROUP BY user_id").all()) {
          xpMap[r.user_id] = Number(r.xp) || 0;
          if (r.t && (!lastSubMap[r.user_id] || r.t > lastSubMap[r.user_id])) lastSubMap[r.user_id] = r.t;
        }
      } catch {}
      const sessMap = Object.fromEntries((await db.prepare("SELECT user_id, COUNT(*) AS n FROM sessions WHERE expires_at > ? GROUP BY user_id").all(nowIso())).map((r) => [r.user_id, r.n]));
      const list = await Promise.all(rows.map(async (u) => ({
        ...publicUser(u),
        createdAt: u.created_at,
        disabled: !!u.disabled,
        total: xpMap[u.id] || 0,
        complete: false,
        lastActive: lastSubMap[u.id] || null,
        sessions: sessMap[u.id] || 0,
        lang: u.lang || "vi",
      })));
      return sendJson(res, 200, { users: list, total: list.length });
    }

    // Bài tập tùy chỉnh: trắc nghiệm ngoại ngữ
    const LANG_SUBJECTS = ["en", "zh", "ja", "ko", "fr", "es"];
    const cleanQuiz = (arr) => (Array.isArray(arr) ? arr : []).slice(0, 20).map((q) => {
      const raw = (Array.isArray(q.options) ? q.options : []).map((o) => String(o ?? "").trim()).slice(0, 6);
      const ansRaw = Number(q.ans);
      const options = [];
      let ans = -1;
      raw.forEach((o, i) => { if (o) { if (i === ansRaw) ans = options.length; options.push(o); } });
      return { q: String(q.q ?? "").trim(), options, ans, explain: String(q.explain ?? "").trim().slice(0, 1000) };
    }).filter((q) => q.q && q.options.length >= 2 && q.ans >= 0 && q.ans < q.options.length);
    // ===== 2.2.0: system settings =====
    if (url.pathname === "/api/admin/brand/logo" && (method === "POST" || method === "DELETE")) {
      if (!requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." });
      if (hit("logo:" + user.id, 20, 600000)) return tooManyMsg(res, "Bạn thao tác quá nhiều lần. Hãy chờ ít phút.");
      if (method === "DELETE") {
        await db.prepare("DELETE FROM brand_assets WHERE kind = 'logo'").run();
        await db.prepare("INSERT INTO audit_logs (actor_id, action, target, detail, ip, created_at) VALUES (?, 'brand.logo_remove', 'logo', '{}', ?, ?)").run(user.id, clientIp(req), nowIso());
        await loadLogo();
        return sendJson(res, 200, { ok: true, ...brandInfo() });
      }
      const buf = await readBuf(req, LOGO_MAX);
      if (!buf || !buf.length) return sendJson(res, 400, { error: "Ảnh quá lớn (tối đa 512 KB) hoặc trống." });
      const mime = sniffImage(buf);
      if (!mime) return sendJson(res, 400, { error: "Chỉ nhận ảnh PNG, JPG hoặc WebP." });
      await db.prepare("INSERT INTO brand_assets (kind, mime, data, updated_by, updated_at) VALUES ('logo', ?, ?, ?, ?) ON CONFLICT(kind) DO UPDATE SET mime = excluded.mime, data = excluded.data, updated_by = excluded.updated_by, updated_at = excluded.updated_at").run(mime, buf, user.id, nowIso());
      await db.prepare("INSERT INTO audit_logs (actor_id, action, target, detail, ip, created_at) VALUES (?, 'brand.logo_upload', 'logo', ?, ?, ?)").run(user.id, JSON.stringify({ mime, bytes: buf.length }), clientIp(req), nowIso());
      await loadLogo();
      return sendJson(res, 200, { ok: true, ...brandInfo() });
    }
    if (method === "GET" && url.pathname === "/api/admin/settings") {
      return sendJson(res, 200, {
        values: SETTINGS, schema: SETTINGS_SCHEMA, groups: SETTINGS_GROUPS, brandColors: BRAND_COLORS,
        sources: {
          groups: [],
          paths: [],
          chapters: [],
          footerLinks: [["terms", "Điều khoản"], ["privacy", "Quyền riêng tư"], ["payment", "Thanh toán"], ["refund", "Hoàn tiền"], ["pricing", "Bảng giá"], ["membership", "Quy định gói thành viên"]],
        },
      });
    }
    if (method === "PUT" && url.pathname === "/api/admin/settings") {
      const body = await readBody(req);
      if (body === null || !requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." });
      const sources = { groups: [], paths: [], chapters: [], footerLinks: ["terms", "privacy", "payment", "refund", "pricing", "membership"] };
      const { value, errors } = cleanSettings(body.values || {}, SETTINGS, sources);
      if (errors.length) return sendJson(res, 400, { error: errors.join(" ") });
      const changed = Object.keys(value).filter((k) => JSON.stringify(value[k]) !== JSON.stringify(SETTINGS[k]));
      await saveSettings(value);
      if (changed.length) await db.prepare("INSERT INTO audit_logs (actor_id, action, target, detail, ip, created_at) VALUES (?, 'settings.update', 'settings', ?, ?, ?)").run(user.id, JSON.stringify({ keys: changed }), clientIp(req), nowIso());
      return sendJson(res, 200, { ok: true, values: SETTINGS });
    }
    // 4.10.4: preview payment QR code with the currently entered bank details (before saving)
    // 4.10.4: send a test message to the Zalo bot, and test HT/HUY/DON commands right from Admin
    if (method === "POST" && url.pathname === "/api/admin/zalo/test") {
      if (!requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." });
      const { zaloPush, zaloReady } = await import("./modules/zalo-pay.js");
      if (!zaloReady(SETTINGS)) return sendJson(res, 400, { error: "Bật tính năng, nhập URL bot (http/https) và mã bí mật (ít nhất 16 ký tự) rồi lưu trước." });
      const r = await zaloPush(SETTINGS, "test", `🔔 Tin thử từ ${SETTINGS.siteName}: kết nối Zalo hoạt động. Khi có đơn, bạn trả lời HT <mã đơn> để kích hoạt.`);
      return sendJson(res, r.ok ? 200 : 502, r.ok ? { ok: true, status: r.status } : { error: r.error ? "Không gọi được bot: " + r.error : `Bot trả về mã lỗi HTTP ${r.status}.` });
    }
    if (method === "POST" && url.pathname === "/api/admin/zalo/command") {
      const body = await readBody(req);
      if (body === null || !requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." });
      const { zaloCommand } = await import("./modules/zalo-pay.js");
      return sendJson(res, 200, await zaloCommand(db, SETTINGS, String(body.text || "")));
    }
    if (method === "GET" && url.pathname === "/api/admin/pay/preview") {
      const { bankQr, bankName } = await import("./modules/vietqr.js");
      const bin = String(url.searchParams.get("bin") || ""), acc = String(url.searchParams.get("acc") || "").replace(/\s+/g, "");
      const amount = Math.max(1000, Math.min(100000000, Number(url.searchParams.get("amount")) || 79000));
      if (!/^\d{6}$/.test(bin)) return sendJson(res, 400, { error: "Chọn ngân hàng." });
      if (!/^[A-Za-z0-9]{4,19}$/.test(acc)) return sendJson(res, 400, { error: "Số tài khoản chỉ gồm 4–19 chữ hoặc số, không dấu cách." });
      return sendJson(res, 200, { bank: bankName(bin), qr: bankQr({ bin, accountNo: acc, amount, content: "PLTEST01" }), amount, content: "PLTEST01" });
    }
    if (method === "POST" && url.pathname === "/api/admin/settings/reset") {
      if (!requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." });
      await saveSettings(defaultSettings());
      return sendJson(res, 200, { ok: true, values: SETTINGS });
    }

    // ===== 2.2.0: account management =====
    const createUser = async (u) => {
      const username = String(u.username || "").trim();
      const displayName = capName(String(u.displayName || username).trim().slice(0, 40)) || username;
      const password = String(u.password || "");
      const role = ROLES.includes(u.role) ? u.role : "student";
      if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username)) return `“${username}”: tên đăng nhập chỉ gồm chữ không dấu, số, dấu _ . - và dài 3 đến 30 ký tự.`;
      if (password.length < 6 || password.length > 128) return `“${username}”: mật khẩu cần từ 6 đến 128 ký tự.`;
      if (await db.prepare("SELECT id FROM users WHERE LOWER(username) = LOWER(?)").get(username)) return `“${username}”: tên đăng nhập đã có người dùng.`;
      await db.prepare("INSERT INTO users (username, display_name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)").run(username, displayName, hashPassword(password), role, nowIso());
      return null;
    };
    if (method === "POST" && url.pathname === "/api/admin/users") {
      const body = await readBody(req);
      if (body === null || !requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." });
      const err = await createUser(body);
      if (err) return sendJson(res, 400, { error: err });
      return sendJson(res, 200, { ok: true });
    }
    if (method === "POST" && url.pathname === "/api/admin/users/bulk") {
      const body = await readBody(req);
      if (body === null || !requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." });
      const rows = Array.isArray(body.users) ? body.users.slice(0, 500) : [];
      let created = 0; const errors = [];
      for (const r of rows) { const e = await createUser({ ...r, role: "student" }); if (e) errors.push(e); else created++; }
      return sendJson(res, 200, { ok: true, created, errors });
    }
    if (method === "PATCH" && parts[2] === "users" && parts[3] && !parts[4]) {
      const body = await readBody(req);
      if (body === null || !requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." });
      const target = await db.prepare("SELECT * FROM users WHERE id = ?").get(Number(parts[3]));
      if (!target) return sendJson(res, 404, { error: "Không tìm thấy tài khoản." });
      const self = target.id === user.id;
      if ("displayName" in body) {
        const n = capName(String(body.displayName || "").trim().slice(0, 40));
        if (n.length < 2) return sendJson(res, 400, { error: "Tên hiển thị cần ít nhất 2 ký tự." });
        await db.prepare("UPDATE users SET display_name = ? WHERE id = ?").run(n, target.id);
      }
      if ("role" in body) {
        const role = ROLES.includes(body.role) ? body.role : null;
        if (!role) return sendJson(res, 400, { error: "Vai trò không hợp lệ." });
        if (self && role !== "admin") return sendJson(res, 400, { error: "Không thể tự bỏ quyền quản trị của chính mình." });
        await db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, target.id);
        await db.prepare("INSERT INTO audit_logs (actor_id, action, target, detail, ip, created_at) VALUES (?, 'user.role', ?, ?, ?, ?)").run(user.id, "user:" + target.id, JSON.stringify({ from: target.role, to: role }), clientIp(req), nowIso());
      }
      if ("disabled" in body) {
        if (self) return sendJson(res, 400, { error: "Không thể tự khóa tài khoản của chính mình." });
        await db.prepare("UPDATE users SET disabled = ? WHERE id = ?").run(body.disabled ? 1 : 0, target.id);
        if (body.disabled) await db.prepare("DELETE FROM sessions WHERE user_id = ?").run(target.id);
      }
      return sendJson(res, 200, { ok: true });
    }
    if (method === "DELETE" && parts[2] === "users" && parts[3] && !parts[4]) {
      if (!requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." });
      const id = Number(parts[3]);
      if (id === user.id) return sendJson(res, 400, { error: "Không thể tự xóa tài khoản của chính mình." });
      const target = await db.prepare("SELECT * FROM users WHERE id = ?").get(id);
      if (!target) return sendJson(res, 404, { error: "Không tìm thấy tài khoản." });
      if (await db.prepare("SELECT 1 FROM classrooms WHERE teacher_id = ? LIMIT 1").get(id)) return sendJson(res, 400, { error: "Tài khoản này đang phụ trách lớp học. Hãy chuyển lớp cho giáo viên khác hoặc xóa lớp trước." });
      // Purge legacy tables (no foreign keys) and new tables (FOREIGN KEY CASCADE) in a single transaction
      try {
        await db.tx(async (t) => {
        for (const tb of ["sessions", "user_prefs", "ratings"]) await t.prepare(`DELETE FROM ${tb} WHERE user_id = ?`).run(id);
        await t.prepare("DELETE FROM users WHERE id = ?").run(id);
        await t.prepare("INSERT INTO audit_logs (actor_id, action, target, detail, ip, created_at) VALUES (?, 'user.delete', ?, ?, ?, ?)").run(user.id, "user:" + id, JSON.stringify({ username: target.username, role: target.role }), clientIp(req), nowIso());
        });
      } catch (e) { throw e; }
      return sendJson(res, 200, { ok: true });
    }

    // ===== 2.2.0: custom exercise editor =====
    if (method === "PUT" && parts[2] === "exercises" && parts[3]) {
      const body = await readBody(req);
      if (body === null || !requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." });
      const row = await db.prepare("SELECT * FROM custom_exercises WHERE id = ?").get(parts[3]);
      if (!row) return sendJson(res, 404, { error: "Không tìm thấy bài tập tùy chỉnh." });
      const language = String(body.language ?? row.language ?? "").toLowerCase();
      const type = String(body.type ?? row.type ?? "quiz").toLowerCase();
      if (![...LANG_SUBJECTS].includes(language)) return sendJson(res, 400, { error: "Ngôn ngữ không hợp lệ." });
      if (!["quiz"].includes(type)) return sendJson(res, 400, { error: "Loại bài không hợp lệ." });
      const chapterId = String(body.chapterId ?? row.chapter_id);
      if (type === "quiz") {
        if (!LANG_SUBJECTS.includes(language)) return sendJson(res, 400, { error: "Trắc nghiệm chỉ dành cho môn ngoại ngữ." });
        if (chapterId !== `${language}-custom`) return sendJson(res, 400, { error: "Chương không hợp lệ." });
      }
      const title = String(body.title ?? row.title).trim(), prompt = String(body.prompt ?? row.prompt).trim();
      if (!title || !prompt) return sendJson(res, 400, { error: "Thiếu tiêu đề hoặc đề bài." });
      const quiz = "quiz" in body ? cleanQuiz(body.quiz) : JSON.parse(row.quiz_json || "[]");
      if (!quiz.length) return sendJson(res, 400, { error: "Cần ít nhất 1 câu hỏi trắc nghiệm." });
      await db.prepare("UPDATE custom_exercises SET chapter_id = ?, title = ?, prompt = ?, starter = '', expected_output = '', sample = '', require_json = '[]', tests_json = '[]', language = ?, type = ?, quiz_json = ? WHERE id = ?").run(
        chapterId, title, prompt, language, type, JSON.stringify(quiz), row.id);
      return sendJson(res, 200, { ok: true });
    }

    // ===== 2.2.0: data backup =====
    if (method === "GET" && url.pathname === "/api/admin/backup") {
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      if (USE_PG) {
        // Postgres: pg_dump -Fc (requires postgresql-client on the server; fail clearly if binary is missing, never fail silently)
        const tmp = path.join(DATA_DIR, `backup-${Date.now()}.dump`);
        try {
          await execFileAsync("pg_dump", ["-Fc", "-h", PGCONF.host, "-p", String(PGCONF.port), "-U", PGCONF.user, "-d", PGCONF.database, "-f", tmp], { env: { ...process.env, PGPASSWORD: PGCONF.password } });
          const buf = fs.readFileSync(tmp);
          res.writeHead(200, { "Content-Type": "application/octet-stream", "Content-Length": buf.length, "Content-Disposition": `attachment; filename="liferivo-backup-${stamp}.dump"`, "Cache-Control": "no-store" });
          return res.end(buf);
        } catch (e) { return sendJson(res, 500, { error: "Không chạy được pg_dump trên máy chủ (cần cài postgresql-client): " + e.message }); }
        finally { try { fs.unlinkSync(tmp); } catch {} }
      }
      const tmp = path.join(DATA_DIR, `backup-${Date.now()}.db`);
      try {
        db.exec(`VACUUM INTO '${tmp.replace(/'/g, "''")}'`);
        const buf = fs.readFileSync(tmp);
        const name = `liferivo-backup-${stamp}.db`;
        res.writeHead(200, { "Content-Type": "application/octet-stream", "Content-Length": buf.length, "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "no-store" });
        return res.end(buf);
      } finally { try { fs.unlinkSync(tmp); } catch {} }
    }
    if (method === "GET" && url.pathname === "/api/admin/dbinfo") {
      const cnt = async (t) => (await db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get()).n;
      let size = 0; try { size = USE_PG ? (await db.prepare("SELECT pg_database_size(current_database()) AS n").get()).n : fs.statSync(DB_PATH).size; } catch {}
      return sendJson(res, 200, { engine: USE_PG ? "postgres" : "sqlite", size, users: await cnt("users"), customs: await cnt("custom_exercises"), announcements: await cnt("announcements"), sessions: await cnt("sessions"), version: VERSION, node: process.version });
    }
    if (method === "POST" && parts[2] === "announcements" && !parts[3]) {
      const body = await readBody(req);
      if (body === null || !requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." });
      const title = String(body.title || "").trim().slice(0, 160);
      const text = String(body.body || "").trim().slice(0, 4000);
      if (!title) return sendJson(res, 400, { error: "Thông báo cần có tiêu đề." });
      const info = await db.prepare("INSERT INTO announcements (title, body, pinned, author_id, created_at) VALUES (?, ?, ?, ?, ?) RETURNING id").run(title, text, body.pinned ? 1 : 0, user.id, nowIso());
      return sendJson(res, 200, { ok: true, id: Number(info.lastInsertRowid) });
    }
    if (method === "DELETE" && parts[2] === "announcements" && parts[3]) {
      if (!requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." });
      await db.prepare("DELETE FROM announcements WHERE id = ?").run(Number(parts[3]));
      return sendJson(res, 200, { ok: true });
    }
    if (method === "GET" && parts[2] === "users" && parts[3] && !parts[4]) {
      const target = await db.prepare("SELECT id, username, display_name, role, lang, disabled, created_at FROM users WHERE id = ?").get(Number(parts[3]));
      if (!target) return sendJson(res, 404, { error: "Không tìm thấy tài khoản." });
      return sendJson(res, 200, { user: { ...publicUser(target), disabled: !!target.disabled, createdAt: target.created_at }, scores: {}, complete: false, groups: [] });
    }
    if (method === "POST" && parts[2] === "users" && parts[4] === "reset-password") {
      const body = await readBody(req);
      if (body === null || !requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." });
      const newPassword = String(body.newPassword || "");
      if (newPassword.length < 6 || newPassword.length > 128) return sendJson(res, 400, { error: "Mật khẩu mới cần từ 6 đến 128 ký tự." });
      const targetId = Number(parts[3]);
      if (!Number.isFinite(targetId)) return sendJson(res, 400, { error: "Tài khoản không hợp lệ." });
      if (targetId === user.id) return sendJson(res, 400, { error: "Không dùng endpoint này để tự đổi mật khẩu của chính mình. Hãy dùng Đổi mật khẩu." });
      const target = await db.prepare("SELECT * FROM users WHERE id = ?").get(targetId);
      if (!target) return sendJson(res, 404, { error: "Không tìm thấy tài khoản." });
      // 4.0.1: admin can reset passwords for students, parents, and teachers (not other admins)
      if (target.role === "admin") return sendJson(res, 403, { error: "Không đặt lại mật khẩu cho tài khoản quản trị khác từ đây. Dùng tools/reset-password.js trên máy chủ." });
      await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(newPassword), targetId);
      await db.prepare("DELETE FROM sessions WHERE user_id = ?").run(targetId);
      return sendJson(res, 200, { ok: true, username: target.username });
    }
    // Log out all sessions of the user (without changing password)
    if (method === "POST" && parts[2] === "users" && parts[4] === "logout-sessions") {
      if (!requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." });
      const targetId = Number(parts[3]);
      if (!Number.isFinite(targetId)) return sendJson(res, 400, { error: "Tài khoản không hợp lệ." });
      const target = await db.prepare("SELECT id, username FROM users WHERE id = ?").get(targetId);
      if (!target) return sendJson(res, 404, { error: "Không tìm thấy tài khoản." });
      if (targetId === user.id) return sendJson(res, 400, { error: "Không đăng xuất phiên của chính mình từ đây. Hãy dùng Đăng xuất." });
      const n = (await db.prepare("DELETE FROM sessions WHERE user_id = ?").run(targetId)).changes;
      await db.prepare("INSERT INTO audit_logs (actor_id, action, target, detail, ip, created_at) VALUES (?, 'user.logout_sessions', ?, ?, ?, ?)").run(user.id, "user:" + targetId, JSON.stringify({ sessions: n }), clientIp(req), nowIso());
      return sendJson(res, 200, { ok: true, cleared: n });
    }
    // Quick-grant 7-day Pro trial
    if (method === "POST" && parts[2] === "exercises" && !parts[3]) {
      const body = await readBody(req);
      if (body === null || !requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." });
      const language = String(body.language || "").toLowerCase();
      const type = String(body.type || "quiz").toLowerCase();
      if (![...LANG_SUBJECTS].includes(language)) return sendJson(res, 400, { error: "Ngôn ngữ không hợp lệ." });
      if (!["quiz"].includes(type)) return sendJson(res, 400, { error: "Loại bài không hợp lệ." });
      const chapterId = String(body.chapterId || "");
      if (type === "quiz") {
        if (!LANG_SUBJECTS.includes(language)) return sendJson(res, 400, { error: "Trắc nghiệm chỉ dành cho môn ngoại ngữ." });
        if (chapterId !== `${language}-custom`) return sendJson(res, 400, { error: "Chương không hợp lệ." });
      }
      const title = String(body.title || "").trim();
      const prompt = String(body.prompt || "").trim();
      if (!title || !prompt) return sendJson(res, 400, { error: "Thiếu tiêu đề hoặc đề bài." });
      const id = "custom_" + crypto.randomBytes(4).toString("hex");
      const quiz = cleanQuiz(body.quiz);
      if (!quiz.length) return sendJson(res, 400, { error: "Cần ít nhất 1 câu hỏi trắc nghiệm (câu hỏi + ít nhất 2 lựa chọn + đáp án đúng)." });
      await db.prepare("INSERT INTO custom_exercises (id, chapter_id, title, prompt, starter, expected_output, sample, require_json, created_at, tests_json, language, type, quiz_json) VALUES (?, ?, ?, ?, '', '', '', '[]', ?, '[]', ?, ?, ?)").run(
        id, chapterId, title, prompt, nowIso(), language, type, JSON.stringify(quiz)
      );
      return sendJson(res, 200, { ok: true, id });
    }
    if (method === "DELETE" && parts[2] === "exercises" && parts[3]) {
      if (!requireCsrf(req, sess)) return sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." });
      await db.prepare("DELETE FROM custom_exercises WHERE id = ?").run(parts[3]);
      return sendJson(res, 200, { ok: true });
    }
  }
  return sendJson(res, 404, { error: "Không tìm thấy API này." });
}

// Security headers for pages and static files
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://www.googletagmanager.com https://cdn.jsdelivr.net 'wasm-unsafe-eval'", // jsDelivr: runtime Rive (bạn đồng hành); wasm-unsafe-eval: Rive dùng WebAssembly
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com",
  "media-src 'self' blob:", // replay own voice recording in Speaking Lab
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://cdn.jsdelivr.net",
  "object-src 'none'",
  "frame-src 'self' https://www.googletagmanager.com",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");
function SECURITY_HEADERS(req, cspNonce) {
  const csp = cspNonce ? CSP.replace("script-src 'self'", "script-src 'self' 'nonce-" + cspNonce + "'") : CSP;
  const h = { "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "same-origin", "Content-Security-Policy": csp, "Permissions-Policy": "camera=(), microphone=(self), geolocation=()", "Cross-Origin-Opener-Policy": "same-origin" };
  if (isHttps(req)) h["Strict-Transport-Security"] = "max-age=15552000";
  return h;
}

const server = http.createServer(async (req, res) => {
  const requestStarted = process.hrtime.bigint();
  httpMetrics.begin();
  let metricRoute = "/other";
  let metricRecorded = false;
  const recordMetrics = (status) => {
    if (metricRecorded) return;
    metricRecorded = true;
    const duration = Number(process.hrtime.bigint() - requestStarted) / 1e9;
    httpMetrics.record(req.method || "GET", metricRoute, status, duration);
  };
  res.once("finish", () => recordMetrics(res.statusCode));
  // Client disconnecting before response completes must be recorded (499),
  // otherwise the in-flight gauge will grow indefinitely on aborted requests.
  res.once("close", () => { if (!res.writableFinished) recordMetrics(499); });
  try {
    const url = new URL(req.url, "http://localhost");
    metricRoute = normalizeMetricRoute(url.pathname);
    if (url.pathname.startsWith("/api/") && applyNativeCors(req, res) && req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
    if (url.pathname === "/internal/metrics") {
      const token = String(process.env.METRICS_TOKEN || "");
      const supplied = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
      const tokenBytes = Buffer.from(token, "utf8");
      const suppliedBytes = Buffer.from(supplied, "utf8");
      const allowed = tokenBytes.length >= 24 && suppliedBytes.length === tokenBytes.length && crypto.timingSafeEqual(suppliedBytes, tokenBytes);
      if (!allowed) { res.writeHead(token ? 401 : 404, { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }); return res.end(); }
      const body = httpMetrics.render();
      res.writeHead(200, { "Content-Type": "text/plain; version=0.0.4; charset=utf-8", "Content-Length": Buffer.byteLength(body), "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
      return res.end(body);
    }
    if (url.pathname.startsWith("/api/")) {
      if (await moduleApi(req, res, url)) return;
      return await handleApi(req, res, url);
    }
    const base = publicUrl() || `${isHttps(req) ? "https" : "http"}://${String(req.headers.host || "localhost").replace(/[^A-Za-z0-9.:-]/g, "")}`;
    if (url.pathname === "/brand/logo") {
      if (!LOGO) { res.writeHead(404, SECURITY_HEADERS(req)); return res.end(); }
      res.writeHead(200, { ...SECURITY_HEADERS(req), "Content-Type": LOGO.mime, "Content-Length": LOGO.data.length, "Cache-Control": url.searchParams.get("v") === LOGO.ver ? "public, max-age=31536000, immutable" : "no-cache", "Content-Disposition": "inline" });
      return res.end(req.method === "HEAD" ? undefined : LOGO.data);
    }
    if (url.pathname === "/robots.txt") {
      const t = `User-agent: *\nAllow: /$\nDisallow: /api/\nSitemap: ${base}/sitemap.xml\n`;
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", ...SECURITY_HEADERS(req) }); return res.end(t);
    }
    if (url.pathname === "/sitemap.xml") {
      // lastmod: ngày bản triển khai gần nhất (file server.js), để Google biết nội dung có thay đổi.
      const lastmod = (() => { try { return fs.statSync(path.join(__dirname, "server.js")).mtime.toISOString().slice(0, 10); } catch { return new Date().toISOString().slice(0, 10); } })();
      const urls = ["/", ...(await publicPaths(db))].map((u) => `<url><loc>${base}${u}</loc><lastmod>${lastmod}</lastmod><changefreq>${u === "/" || u.endsWith("/lessons") ? "weekly" : "monthly"}</changefreq></url>`).join("");
      const t = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`;
      res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8", ...SECURITY_HEADERS(req) }); return res.end(t);
    }
    // 3.0.0: pre-rendered public pages for SEO (lessons, pricing, policies)
    if (req.method === "GET" && !path.extname(url.pathname)) {
      const cspNonce = crypto.randomBytes(16).toString("base64"); // nonce cho script inline (GA4) tren trang renderPublic
      const sess = await getSession(req);
      const html = await renderPublic(url.pathname, { base, S: { ...SETTINGS, ...brandInfo() }, db, version: VERSION, nonce: cspNonce, loggedIn: !!sess });
      if (html && html.redirect) {
        res.writeHead(html.status || 302, { Location: html.redirect + (url.search || ""), ...SECURITY_HEADERS(req, cspNonce), "Cache-Control": html.status === 301 ? "public, max-age=86400" : "no-cache" });
        return res.end();
      }
      if (html && html.status === 404) {
        const notFound = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404 — Không tìm thấy | LifeRivo Study</title><meta name="robots" content="noindex"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Mali:wght@700&family=Patrick+Hand&display=swap" rel="stylesheet"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;padding:20px;font-family:"Patrick Hand","Mali",cursive,sans-serif;font-size:18px;color:#1C1917;background-color:#FAF6EC;background-image:radial-gradient(#D1C7B3 1px,transparent 1px);background-size:24px 24px}.hw-card{max-width:560px;width:100%;padding:34px 30px;text-align:center;background:#FFFDF7;border:2.2px solid #1C1917;border-radius:22px 10px 24px 12px/11px 22px 12px 24px;box-shadow:5px 5px 0 #1C1917}.hw-code{display:inline-block;font:700 15px "Mali",cursive;padding:4px 14px;background:#FDE047;border:2px solid #1C1917;border-radius:10px 6px 12px 7px;box-shadow:2px 2px 0 #1C1917}h1{font-family:"Mali","Patrick Hand",cursive,sans-serif;font-weight:700;font-size:clamp(26px,5vw,34px);margin:16px 0 10px;line-height:1.2}p{margin:0 0 12px;color:#44403C;line-height:1.6}.hw-btn{display:inline-block;margin-top:8px;padding:10px 20px;font:700 17px "Mali",cursive;color:#1C1917;text-decoration:none;background:#FDE047;border:2px solid #1C1917;border-radius:14px 9px 16px 8px/8px 14px 9px 15px;box-shadow:3px 4px 0 #1C1917}.hw-btn:hover{background:#FEF9C3;transform:translate(-1px,-1px)}</style></head><body><main class="hw-card"><span class="hw-code">404</span><h1>Không tìm thấy trang</h1><p>Trang bạn tìm không còn tồn tại (nội dung lập trình đã được gỡ). Mời bạn khám phá các khóa ngoại ngữ của LifeRivo.</p><a class="hw-btn" href="/">Về trang chủ LifeRivo</a></main></body></html>`;
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8", "Content-Length": Buffer.byteLength(notFound), ...SECURITY_HEADERS(req, cspNonce), "Cache-Control": "no-cache" });
        return res.end(notFound);
      }
      if (html) {
        const buf = Buffer.from(html);
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Content-Length": buf.length, ...SECURITY_HEADERS(req, cspNonce), "Cache-Control": sess ? "private, no-cache" : "no-cache", ...(sess ? { Vary: "Cookie" } : {}) });
        return res.end(buf);
      }
    }
    let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
    filePath = path.normalize(path.join(__dirname, "public", filePath));
    if (!filePath.startsWith(path.join(__dirname, "public"))) { res.writeHead(403); return res.end("Forbidden"); }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) filePath = path.join(__dirname, "public", "index.html");
    const ext = path.extname(filePath);
    let data = fs.readFileSync(filePath);
    let cspNonce = null; // chi HTML moi co script inline (theme-init), nonce moi theo tung request
    const isHomePath = url.pathname === "/" || /^\/(?:vi|vn|en)\/?$/i.test(url.pathname);
    if (ext === ".html") {
      cspNonce = crypto.randomBytes(16).toString("base64");
      const reqUiLang = reqLang(req, null);
      const enHome = isHomePath && reqUiLang === "en";
      const desc = enHome
        ? `${SETTINGS.siteName}: learn English, Chinese, Japanese, Korean, French and Spanish with speaking feedback, 0.6x pronunciation, AI interviews and certificates.`
        : `${SETTINGS.siteName}: học ngoại ngữ (Anh, Trung, Nhật, Hàn, Pháp, Tây Ban Nha) bằng tiếng Việt. Luyện nói chấm từng từ, phát âm, phỏng vấn thử và chứng nhận.`;
      const escA = (x) => String(x).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      const canonicalPath = /^\/en\/?$/i.test(url.pathname) ? "/en" : /^\/(?:vi|vn)\/?$/i.test(url.pathname) ? "/vi" : "/";
      // Static links use content hash (editing file changes URL, no stale cache); other links keep __VERSION__ -> VERSION.
      let htmlText = data.toString("utf8");
      // Inline critical CSS (header+hero) de bo 1 request chan hien thi (PageSpeed).
      // CSP style-src co 'unsafe-inline' nen <style> inline duoc. Neu doc loi thi giu nguyen link.
      try {
        const critCss = fs.readFileSync(path.join(__dirname, "public", "css", "critical.min.css"), "utf8");
        htmlText = htmlText.replace('<link rel="stylesheet" href="/css/critical.min.css?v=__VERSION__">', `<style>${critCss}</style>`);
      } catch { /* giu nguyen link */ }
      htmlText = htmlText.replace(/\/[\w./-]+\.(?:js|css|png|svg|webp|ico)\?v=__VERSION__/g, (m) => {
        const fp = m.slice(1, m.indexOf("?v="));
        try {
          const h = crypto.createHash("sha256").update(fs.readFileSync(path.join(__dirname, "public", fp))).digest("hex").slice(0, 12);
          return `/${fp}?v=${h}`;
        } catch { return m; }
      });
      htmlText = htmlText.replaceAll("__VERSION__", VERSION)
        .replaceAll("__CANONICAL__", escA(base + canonicalPath)).replaceAll("__SITE_NAME__", escA(SETTINGS.siteName)).replaceAll("__SITE_DESC__", escA(desc)).replaceAll("__SITE_TAGLINE__", escA(SETTINGS.tagline)).replaceAll("__GSV_META__", gsvMeta()).replaceAll("__CSP_NONCE__", cspNonce);
      if (isHomePath) {
        htmlText = htmlText.replace('<html lang="vi"', `<html lang="${enHome ? "en" : "vi"}" data-lang="${enHome ? "en" : "vi"}"`);
        if (enHome) htmlText = htmlText.replace('<meta property="og:locale" content="vi_VN">', '<meta property="og:locale" content="en_US">');
        htmlText = htmlText.replace(
          `<link rel="canonical" href="${escA(base + canonicalPath)}">`,
          `<link rel="canonical" href="${escA(base + canonicalPath)}">\n  <link rel="alternate" hreflang="vi" href="${escA(base + "/vi")}">\n  <link rel="alternate" hreflang="en" href="${escA(base + "/en")}">\n  <link rel="alternate" hreflang="x-default" href="${escA(base + "/")}">`
        );
      }
      data = Buffer.from(htmlText);
      // SSR trang chu: render san HTML mon hoc + nhung JSON overview (khong doi JS fetch).
      // Ap dung cho "/" va cac nhanh ngon ngu "/vi", "/vn", "/en".
      if (isHomePath) {
        try {
          const o = await publicOverviewData(req);
          const en = enHome;
          // SEO head: tiêu đề + og:title + og:image (logo hệ thống).
          const seoTitle = en ? "LifeRivo Study - Life in Motion | Learn languages" : "LifeRivo Study - Life in Motion | Học ngoại ngữ";
          htmlText = htmlText.replace(/<title>[^<]*<\/title>/, `<title>${escHtml(seoTitle)}</title>`);
          htmlText = htmlText.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escHtml(seoTitle)}$2`);
          htmlText = htmlText.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escHtml(seoTitle)}$2`);
          const logoUrl = brandInfo().logoUrl;
          // Header trang chu (SPA): thay text bang anh logo (logoMode only = anh da co ten).
          if (logoUrl) htmlText = htmlText.replace('<span class="brand-text">LifeRivo</span>', `<img class="brand-logo only" src="${escHtml(logoUrl)}" alt="LifeRivo" width="194" height="62">`);
          const ssrJson = JSON.stringify(o).replace(/</g, "\\u003c");
          htmlText = htmlText
            .replace('<div id="root" aria-live="polite"></div>', `<div id="root" aria-live="polite">${renderHomeSSR(o, en)}</div>`)
            .replace("</body>", `<script id="ssr-overview" type="application/json">${ssrJson}</script>\n</body>`);
          data = Buffer.from(htmlText);
        } catch (e) { console.error("[ssr-home]", e); /* loi SSR -> giu vo rong nhu cu */ }
      }
    }
    // Split CSS: if ?v= matches current content hash, cache immutable for 1 year (editing file changes URL, no stale cache);
    // if ?v= is missing or mismatched, fall back to no-cache. JS, HTML, and vendor assets stay unchanged.
    const contentHash = crypto.createHash("sha256").update(data).digest("hex").slice(0, 12);
    let cacheControl = "public, max-age=86400";
    if (ext === ".html") cacheControl = "no-cache";
    else if (ext === ".js" || ext === ".css") {
      // ?v= = hash noi dung -> immutable 1 nam (doi file thi doi URL, khong sot cache cu). Vendor mac dinh 1 ngay, JS/CSS chinh mac dinh no-cache.
      if (url.searchParams.get("v") === contentHash) cacheControl = "public, max-age=31536000, immutable";
      else if (!filePath.includes(path.sep + "vendor" + path.sep)) cacheControl = "no-cache";
    }
    // ETag (yeu) = hash noi dung chua nen: trinh duyet gui If-None-Match thi tra 304 thay vi tai lai toan bo (nhat la JS/CSS dang no-cache).
    const etag = 'W/"' + contentHash + '"';
    if (typeof req.headers["if-none-match"] === "string" && req.headers["if-none-match"].includes(etag)) {
      res.writeHead(304, { ...SECURITY_HEADERS(req, cspNonce), "Cache-Control": cacheControl, ETag: etag, Vary: "Accept-Encoding" });
      return res.end();
    }
    const compressed = compressStatic(req, filePath, ext, data);
    const extraHeaders = compressed ? { "Content-Encoding": compressed.encoding, Vary: "Accept-Encoding" } : COMPRESSIBLE.has(ext) ? { Vary: "Accept-Encoding" } : {};
    if (compressed) data = compressed.body;
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Content-Length": data.length, ...SECURITY_HEADERS(req, cspNonce), "Cache-Control": cacheControl, ETag: etag, ...extraHeaders });
    res.end(data);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) sendJson(res, 500, { error: "Lỗi máy chủ, hãy thử lại." });
    else res.end();
  }
});
const moduleApi = createModuleApi({
  db, sendJson, getSession, requireCsrf, readBody, readRaw, hit, clientIp,
  hashPassword, settings: () => SETTINGS, publicUrl: () => publicUrl(), checkPassword: async (uid, pw) => { const u = await db.prepare("SELECT password_hash FROM users WHERE id = ?").get(uid); return !!u && verifyPassword(String(pw || ""), u.password_hash); },
});
server.listen(PORT, HOST, () => {
  console.log(`He thong hoc ngoai ngu ${VERSION} chay tai http://${HOST}:${PORT} (du lieu: ${DATA_DIR})`);
});
// Graceful shutdown on PM2 restart
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { server.close(); try { const p = db.close(); if (p && typeof p.catch === "function") p.catch(() => {}); } catch {} process.exit(0); });
