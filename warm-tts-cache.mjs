// warm-tts-cache.mjs — Nạp trước (warm) toàn bộ giọng đọc TTS vào data/tts-cache
// để người dùng bấm Nghe là phát ngay (cache hit), không phải chờ Gemini tạo.
// Chạy từ /root/hoc-lap-trinh-study:  node warm-tts-cache.mjs
// - Chỉ sinh câu CHƯA có trong cache (kiểm tra file trước). Chạy lại là an toàn (idempotent).
// - Chỉ dùng giọng mặc định nữ Kore. Không sửa code TTS, chỉ gọi API Gemini trực tiếp
//   theo đúng logic synthesize() trong modules/tts.js (hàm lõi không bị giới hạn per-user;
//   giới hạn per-user 90/phút và 300/ngày chỉ nằm ở ttsApi, không nằm ở synthesize).
// - Tôn trọng ngân sách hệ thống: tối đa 4500 câu mới (dưới trần 5000/ngày).
// - KHÔNG ghi API key ra log/chat.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import pg from "pg";

const ROOT = "/root/hoc-lap-trinh-study";
const DATA_DIR = path.join(ROOT, "data");
const CACHE_DIR = path.join(DATA_DIR, "tts-cache");
const LOG_FILE = path.join(ROOT, "data", "tts-warm.log");
const PROGRESS_FILE = path.join(ROOT, "data", "tts-warm-progress.json");
const MODEL = process.env.TTS_MODEL || "gemini-3.8-flash-lite-tts";
const BASE_URL = (process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com").replace(/\/+$/, "");
const VOICE = "Kore"; // giọng mặc định nữ
const MAX_CHARS = 400;
const MAX_NEW = 4500; // trần an toàn, dưới 5000/ngày toàn hệ
const PACE_MS = 1200; // giãn cách giữa 2 lần gọi Gemini
const LANG_NAME = { en: "English", zh: "Mandarin Chinese", ja: "Japanese", ko: "Korean", fr: "French", vi: "Vietnamese", es: "Spanish" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + "\n"); } catch {}
};
// Chuẩn hóa text Y HỆT server (tts.js): NFC + gộp khoảng trắng + trim
const normText = (s) => String(s || "").normalize("NFC").replace(/\s+/g, " ").trim();
const cacheFile = (lang, text) =>
  path.join(CACHE_DIR, crypto.createHash("sha256").update([MODEL, VOICE, lang, text].join("\n")).digest("hex") + ".wav");

// ---- Lấy GEMINI_API_KEY: giải mã từ DB như sysconfig.js làm ----
function readEnvFile() {
  const out = {};
  try {
    for (const line of fs.readFileSync(path.join(ROOT, ".env"), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
  return out;
}
async function getApiKey() {
  const envFile = readEnvFile();
  const key = fs.readFileSync(path.join(DATA_DIR, "secret.key")); // 32 byte
  const pool = new pg.Pool({
    host: envFile.PGHOST || "127.0.0.1",
    port: Number(envFile.PGPORT || 5432),
    user: envFile.PGUSER || "postgres",
    password: envFile.PGPASSWORD || "",
    database: envFile.PGDATABASE || "pylab_study",
  });
  const r = await pool.query("SELECT v FROM site_settings WHERE k = 'system'");
  await pool.end();
  const state = JSON.parse(r.rows[0].v);
  const enc = state.secrets && state.secrets.GEMINI_API_KEY;
  if (!enc) throw new Error("Khong tim thay secrets.GEMINI_API_KEY trong site_settings");
  const [iv, tag, ct] = String(enc).split(".").map((x) => Buffer.from(x, "base64"));
  const d = crypto.createDecipheriv("aes-256-gcm", key, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(ct), d.final()]).toString("utf8");
}

// ---- Sinh âm thanh: sao y synthesize() trong modules/tts.js ----
function wavFromPcm(pcm, rate = 24000) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}
function findAudio(node, depth = 0) {
  if (!node || typeof node !== "object" || depth > 8) return null;
  if (typeof node.data === "string" && node.data.length > 200 && (node.type === "audio" || /audio/i.test(String(node.mime_type || node.mimeType || "")))) return node;
  let last = null;
  for (const v of Array.isArray(node) ? node : Object.values(node)) { const hit = findAudio(v, depth + 1); if (hit) last = hit; }
  return last;
}
async function synthesize(apiKey, text, langId) {
  const body = {
    model: MODEL,
    input: [{ type: "user_input", content: [{ type: "text", text,
      annotations: [{ type: "speech_metadata", style: `Read exactly this text in ${LANG_NAME[langId] || "the language of the text"}, clearly and naturally at a moderate pace, like a language teacher modelling pronunciation.` }] }] }],
    response_format: { type: "audio" },
    generation_config: { speech_config: [{ voice: VOICE }] },
  };
  const res = await fetch(`${BASE_URL}/v1beta/interactions`, {
    method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000),
  });
  const raw = await res.text();
  let data = {}; try { data = JSON.parse(raw); } catch {}
  if (!res.ok) throw Object.assign(new Error(data?.error?.message || `HTTP ${res.status}`), { status: res.status });
  const a = findAudio(data);
  if (!a) throw new Error("Phan hoi khong co am thanh");
  const buf = Buffer.from(a.data, "base64");
  return buf.slice(0, 4).toString("latin1") === "RIFF" ? buf : wavFromPcm(buf);
}

// ---- Thu thập toàn bộ câu cần đọc ----
async function collect() {
  const map = new Map(); // key = lang + "\n" + text  -> { lang, text }
  const add = (lang, raw) => {
    const text = normText(raw);
    if (!text || text.length > MAX_CHARS) return;
    const k = lang + "\n" + text;
    if (!map.has(k)) map.set(k, { lang, text });
  };
  const langs = ["en", "zh", "ja", "ko", "fr", "es"];
  for (const f of langs) {
    const mod = await import(pathToFileURL(path.join(ROOT, "content", "lang", f + ".js")).href);
    const c = mod.default;
    for (const lv of c.levels || []) for (const u of lv.units || []) {
      for (const line of String(u.words || "").split("\n")) {
        const w = line.trim().split("|")[0].trim();
        if (w) add(f, w);
      }
      for (const s of u.sentences || []) {
        // zh/ja: câu nói bỏ hết khoảng trắng (đúng như languages.js sinh bài nói)
        const t = (f === "zh" || f === "ja") ? String(s[0] || "").replace(/\s+/g, "") : String(s[0] || "");
        if (t) add(f, t);
      }
    }
  }
  // File extra (en/zh/ja/ko/fr-extra.js): object keyed theo level id -> mảng unit
  for (const f of ["en", "zh", "ja", "ko", "fr"]) {
    try {
      const mod = await import(pathToFileURL(path.join(ROOT, "content", "lang", f + "-extra.js")).href);
      const ex = mod.default || {};
      for (const units of Object.values(ex)) for (const u of units || []) {
        for (const line of String(u.words || "").split("\n")) {
          const w = line.trim().split("|")[0].trim();
          if (w) add(f, w);
        }
        for (const s of u.sentences || []) {
          const t = (f === "zh" || f === "ja") ? String(s[0] || "").replace(/\s+/g, "") : String(s[0] || "");
          if (t) add(f, t);
        }
      }
    } catch { /* không có file extra thì bỏ qua */ }
  }
  // TOEIC (modules/toeic-bank.js) — tất cả tiếng Anh
  const tb = await import(pathToFileURL(path.join(ROOT, "modules", "toeic-bank.js")).href);
  for (const ps of Object.values(tb.PASSAGES || {})) {
    if (ps.kind === "text" || !Array.isArray(ps.lines)) continue; // đoạn đọc hiểu không có nút Nghe
    add("en", ps.lines.map((l) => String(l).replace(/^[WM]:\s*/, "")).join(" "));
  }
  for (const q of tb.QUESTIONS || []) {
    if (q.part === 1 && Array.isArray(q.options)) add("en", q.options.join(" "));
    if (q.part === 2) add("en", q.audio || q.q || "");
  }
  return [...map.values()];
}

// ---- Chạy chính ----
async function main() {
  const started = Date.now();
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const apiKey = await getApiKey();
  log(`Lay duoc API key (do dai ${apiKey.length}). Model=${MODEL}, voice=${VOICE}.`);
  const items = await collect();
  log(`Thu thap duoc ${items.length} cau duy nhat (lang+text).`);
  let cached = 0, created = 0, failed = 0, skippedLong = 0;
  const errors = [];
  const t0 = Date.now();
  for (let i = 0; i < items.length; i++) {
    const { lang, text } = items[i];
    const file = cacheFile(lang, text);
    if (fs.existsSync(file)) { cached++; continue; }
    if (created >= MAX_NEW) { log(`Dat tran an toan ${MAX_NEW} cau moi — dung lai.`); break; }
    let wav = null, lastErr = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try { wav = await synthesize(apiKey, text, lang); break; }
      catch (e) {
        lastErr = e;
        if (e.status === 429) { log(`429 o cau ${i + 1}, cho 30s roi thu lai (lan ${attempt}/3).`); await sleep(30000); }
        else break;
      }
    }
    if (!wav) {
      failed++;
      errors.push({ lang, text: text.slice(0, 80), err: String(lastErr && lastErr.message || lastErr).slice(0, 120) });
      log(`LOI cau ${i + 1} [${lang}] ${text.slice(0, 60)}... : ${String(lastErr && lastErr.message || lastErr).slice(0, 120)}`);
      // Het luot trong ngay (429): dung ca job de khoi thu vo ich cac cau sau.
      // Tien do da luu; chay lai ngay mai (hoac sau khi nang cap key) se tiep tuc.
      if (lastErr && lastErr.status === 429) {
        log(`Het luot TTS trong ngay (429) — dung job. Da tao ${created} cau moi, co san ${cached}, loi ${failed}.`);
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ at: new Date().toISOString(), scanned: i + 1, total: items.length, created, cached, failed, stoppedAt429: true }, null, 2));
        break;
      }
      continue;
    }
    await fs.promises.writeFile(file + ".tmp", wav);
    await fs.promises.rename(file + ".tmp", file);
    created++;
    if (created % 50 === 0) {
      const el = Math.round((Date.now() - t0) / 1000);
      log(`Tien do: ${i + 1}/${items.length} da duyet | moi tao ${created} | co san ${cached} | loi ${failed} | ${el}s`);
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ at: new Date().toISOString(), scanned: i + 1, total: items.length, created, cached, failed }, null, 2));
    }
    await sleep(PACE_MS);
  }
  const secs = Math.round((Date.now() - started) / 1000);
  const summary = { finishedAt: new Date().toISOString(), seconds: secs, total: items.length, cached, created, failed, errors: errors.slice(0, 30) };
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(summary, null, 2));
  log(`HOAN THANH trong ${secs}s (${(secs / 60).toFixed(1)} phut). Tong ${items.length} cau | co san ${cached} | moi tao ${created} | loi ${failed}.`);
  if (errors.length) log(`Loi dau tien: ${JSON.stringify(errors.slice(0, 5))}`);
}
main().catch((e) => { log(`FATAL: ${e.stack || e}`); process.exit(1); });
