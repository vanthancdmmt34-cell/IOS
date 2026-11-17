// Test 1 cau TTS voi model hien tai (doc TTS_MODEL tu .env) — chi goi 1 lan.
// Dinh dang generateContent (Gemini 2.5 TTS). Lay key tu Postgres site_settings k='system'.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import pg from "pg";

const ROOT = "/root/hoc-lap-trinh-study";
const DATA_DIR = path.join(ROOT, "data");
function readEnvFile() {
  const out = {};
  for (const line of fs.readFileSync(path.join(ROOT, ".env"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
const envFile = readEnvFile();
const key = fs.readFileSync(path.join(DATA_DIR, "secret.key"));
const pool = new pg.Pool({ host: envFile.PGHOST || "127.0.0.1", port: Number(envFile.PGPORT || 5432), user: envFile.PGUSER || "postgres", password: envFile.PGPASSWORD || "", database: envFile.PGDATABASE || "pylab_study" });
const r = await pool.query("SELECT v FROM site_settings WHERE k = 'system'");
await pool.end();
const state = JSON.parse(r.rows[0].v);
const enc = state.secrets && state.secrets.GEMINI_API_KEY;
if (!enc) { console.log("KHONG TIM THAY KEY"); process.exit(1); }
const [iv, tag, ct] = String(enc).split(".").map((x) => Buffer.from(x, "base64"));
const d = crypto.createDecipheriv("aes-256-gcm", key, iv);
d.setAuthTag(tag);
const apiKey = Buffer.concat([d.update(ct), d.final()]).toString("utf8");
const hash = crypto.createHash("sha256").update(apiKey).digest("hex").slice(0, 12);
console.log("Key hien tai: do dai:", apiKey.length, "| hash:", hash, "| 4 ky tu cuoi:", apiKey.slice(-4));

const MODEL = process.env.TTS_MODEL || envFile.TTS_MODEL || "gemini-2.5-flash-preview-tts";
const VOICE = "Kore";
const BASE_URL = "https://generativelanguage.googleapis.com";
const text = "The quick brown fox jumps over the lazy dog.";
const body = {
  contents: [{ parts: [{ text }] }],
  generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
};
const t0 = Date.now();
try {
  const res = await fetch(`${BASE_URL}/v1beta/models/${MODEL}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify(body), signal: AbortSignal.timeout(25000) });
  const raw = await res.text();
  let data = {}; try { data = JSON.parse(raw); } catch {}
  console.log("Model:", MODEL, "| HTTP:", res.status, "| thoi gian:", ((Date.now() - t0) / 1000).toFixed(1) + "s");
  if (!res.ok) { console.log("LOI:", String(data?.error?.message || raw).slice(0, 200)); }
  else { console.log("THANH CONG: tra ve am thanh, do dai phan hoi:", raw.length, "ky tu"); }
} catch (e) { console.log("LOI goi API:", String(e.message || e).slice(0, 160)); }
