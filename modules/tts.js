// 4.13.0 — AI Voice (Gemini TTS) for foreign language courses.
// 5.1.9 — AssemblyAI TTS-1 for sample voice (en/fr/es); Gemini kept for zh/ja/ko (AssemblyAI has no zh/ja/ko voices).
// Browser calls POST /api/tts { text, lang, voice } and receives a WAV file; on error or if unconfigured, the browser
// automatically falls back to the device's built-in speech synthesis (Web Speech API).
// - Each phrase is generated only once: cached in <DATA_DIR>/tts-cache by hash (model + voice + lang + text).
// - Shares Rivo's GEMINI_API_KEY. Enforces a daily cap on NEW phrases per account and system-wide
//   (cached phrases do not count), since TTS cost is not tracked in the token-based AI cost cap.
// API: Gemini Interactions API (https://aistudio.google.com/docs/speech-generation), returns 24 kHz mono 16-bit audio/wav.
// ttsClip() là phần dùng chung: /api/tts và trò chơi nghe/chính tả (máy chủ tự phát âm từ đáp án, trình duyệt không nhận chữ).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { sysGet } from "./sysconfig.js";

const env = (k, d) => { const v = sysGet(k); return v !== undefined && v !== "" ? v : d; };
const LANG_NAME = { en: "English", zh: "Mandarin Chinese", ja: "Japanese", ko: "Korean", fr: "French", vi: "Vietnamese", es: "Spanish", de: "German", it: "Italian", pt: "Portuguese" };
// Voices selectable by learners (other voices can be set by admin in "Default voice" setting)
export const TTS_VOICES = { nu: "Kore", nam: "Puck" };
// AssemblyAI TTS-1 speaks only en/es/fr/de/it/pt — use it for en/fr/es sample voice; zh/ja/ko stay on Gemini.
const ASSEMBLY_LANG = { en: "english", fr: "french", es: "spanish", de: "german", it: "italian", pt: "portuguese" };
const assemblyKeys = () => [String(env("ASSEMBLYAI_API_KEY", "") || "").trim(), String(env("ASSEMBLYAI_API_KEY_2", "") || "").trim()].filter(Boolean);
const assemblyKey = () => assemblyKeys()[0] || "";
const MAX_CHARS = 400;

const dayKey = () => new Date().toISOString().slice(0, 10);
// AUDIT P2-8: hạn mức TTS lưu trong DB (site_stats) nên không mất khi khởi động lại hay khi chạy nhiều tiến trình.
async function incCount(db, k) {
  await db.prepare("INSERT INTO site_stats (k, v) VALUES (?, 1) ON CONFLICT(k) DO UPDATE SET v = site_stats.v + 1").run(k);
  const r = await db.prepare("SELECT v FROM site_stats WHERE k = ?").get(k);
  return Number(r && r.v) || 0;
}
let lastPrune = "";
async function pruneOldCounts(db) {
  const today = dayKey();
  if (lastPrune === today) return;
  lastPrune = today;
  const cutoff = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
  try { await db.prepare("DELETE FROM site_stats WHERE k LIKE 'tts:%' AND k < ?").run(`tts:${cutoff}`); } catch { /* không dọn được thì bỏ qua */ }
}
async function bump(db, userId, limits) {
  const day = dayKey();
  await pruneOldCounts(db);
  // Đếm người dùng trước: người đã hết lượt không làm tốn hạn mức chung của hệ thống
  const u = await incCount(db, `tts:${day}:u:${userId}`);
  if (u > limits.user) return "user";
  const sys = await incCount(db, `tts:${day}:sys`);
  if (sys > limits.system) return "system";
  return "";
}

function wavFromPcm(pcm, rate = 24000) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}
// Locate audio block in response (steps[].content[] with type "audio"), in case response structure shifts slightly.
function findAudio(node, depth = 0) {
  if (!node || typeof node !== "object" || depth > 8) return null;
  if (typeof node.data === "string" && node.data.length > 200 && (node.type === "audio" || /audio/i.test(String(node.mime_type || node.mimeType || "")))) return node;
  let last = null;
  for (const v of Array.isArray(node) ? node : Object.values(node)) { const hit = findAudio(v, depth + 1); if (hit) last = hit; }
  return last;
}

export function ttsConfigured() {
  return env("AI_PROVIDER", "gemini") !== "disabled" && (!!String(env("GEMINI_API_KEY", "") || "").trim() || !!assemblyKey());
}
export const ttsModel = () => env("TTS_MODEL", "gemini-3.8-flash-lite-tts");

async function synthesize(text, langId, voice) {
  const key = String(env("GEMINI_API_KEY", "") || "").trim();
  const base = String(env("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com") || "").replace(/\/+$/, "");
  const body = {
    model: ttsModel(),
    input: [{ type: "user_input", content: [{ type: "text", text,
      // Short all-Kanji/Hanzi words are easily misidentified between Japanese and Chinese, so specify the target language explicitly.
      annotations: [{ type: "speech_metadata", style: `Read exactly this text in ${LANG_NAME[langId] || "the language of the text"}, clearly and naturally at a moderate pace, like a language teacher modelling pronunciation.` }] }] }],
    response_format: { type: "audio" },
    generation_config: { speech_config: [{ voice }] },
  };
  const res = await fetch(`${base}/v1beta/interactions`, {
    method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify(body),
    signal: AbortSignal.timeout(Number(env("AI_TIMEOUT_MS", 25000))),
  });
  const raw = await res.text();
  let data = {}; try { data = JSON.parse(raw); } catch {}
  if (!res.ok) throw Object.assign(new Error(data?.error?.message || `HTTP ${res.status}`), { status: res.status });
  const a = findAudio(data);
  if (!a) throw new Error("Phản hồi không có âm thanh");
  const buf = Buffer.from(a.data, "base64");
  return buf.slice(0, 4).toString("latin1") === "RIFF" ? buf : wavFromPcm(buf);
}

// AssemblyAI TTS-1 native HTTP API: POST https://tts.us.assemblyai.com/v1/speech
// Auth: Authorization header = raw API key (NOT Bearer). Body: { text, model_id, language }.
// Response: raw PCM 24 kHz mono 16-bit (rate in X-TTS-Sample-Rate) — wrap to WAV like Gemini PCM.
async function synthesizeAssembly(text, langId) {
  const keys = assemblyKeys();
  let lastErr = null;
  for (const k of keys) {
    const res = await fetch("https://tts.us.assemblyai.com/v1/speech", {
      method: "POST",
      headers: { Authorization: k, "Content-Type": "application/json" },
      body: JSON.stringify({ text, model_id: "assemblyai-tts-1", language: ASSEMBLY_LANG[langId] }),
      signal: AbortSignal.timeout(Number(env("AI_TIMEOUT_MS", 25000))),
    });
    const buf = Buffer.from(await res.arrayBuffer());
    if (res.ok) {
      if (buf.slice(0, 4).toString("latin1") === "RIFF") return buf;
      const rate = Number(res.headers.get("X-TTS-Sample-Rate")) || 24000;
      return wavFromPcm(buf, rate);
    }
    let msg = `HTTP ${res.status}`;
    try { const d = JSON.parse(buf.toString("utf-8")); msg = d.detail || d.error || d.message || msg; } catch {}
    lastErr = Object.assign(new Error(String(msg).slice(0, 160)), { status: res.status });
    // Chi doi key khi loi xac thuc/het luot; loi khac (400, 500...) thi dung ngay.
    if (![401, 403, 429].includes(res.status)) break;
    console.error("[tts] AssemblyAI key loi", res.status, "— thu key du phong");
  }
  throw lastErr || new Error("Không tạo được giọng đọc AssemblyAI");
}


// AssemblyAI /v1/speech/events (SSE): tra audio PCM + WordBoundaries (word, start, end ms).
// Dung 1 call lay ca audio lan timings karaoke. Loi thi nem de caller fallback ve /v1/speech.
function parseEventsSse(sseText) {
  const pcmChunks = [];
  let words = [];
  for (const block of sseText.split("\n\n")) {
    const lines = block.split("\n");
    let ev = "", dataStr = "";
    for (const line of lines) {
      if (line.startsWith("event:")) ev = line.slice(6).trim();
      else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
    }
    if (!dataStr) continue;
    let data = {};
    try { data = JSON.parse(dataStr); } catch { continue; }
    if (ev === "Audio" && data.audio) pcmChunks.push(Buffer.from(data.audio, "base64"));
    else if (ev === "WordBoundaries" && Array.isArray(data.words)) words = data.words;
  }
  return { pcm: Buffer.concat(pcmChunks), words };
}
async function synthesizeAssemblyEvents(text, langId) {
  const keys = assemblyKeys();
  let lastErr = null;
  for (const k of keys) {
    const res = await fetch("https://tts.us.assemblyai.com/v1/speech/events", {
      method: "POST",
      headers: { Authorization: k, "Content-Type": "application/json" },
      body: JSON.stringify({ text, model_id: "assemblyai-tts-1", language: ASSEMBLY_LANG[langId] }),
      signal: AbortSignal.timeout(Number(env("AI_TIMEOUT_MS", 25000))),
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const d = JSON.parse(await res.text()); msg = d.detail || d.error || d.message || msg; } catch {}
      lastErr = Object.assign(new Error(String(msg).slice(0, 160)), { status: res.status });
      if (![401, 403, 429].includes(res.status)) break;
      console.error("[tts] AssemblyAI events key loi", res.status, "— thu key du phong");
      continue;
    }
    const { pcm, words } = parseEventsSse(await res.text());
    if (!pcm.length) { lastErr = new Error("Events khong co audio"); break; }
    const rate = Number(res.headers.get("X-TTS-Sample-Rate")) || 24000;
    const wav = pcm.slice(0, 4).toString("latin1") === "RIFF" ? pcm : wavFromPcm(pcm, rate);
    return { wav, words: (words || []).map((w) => ({ w: String(w.word || ""), s: Number(w.start) || 0, e: Number(w.end) || 0 })).filter((x) => x.w) };
  }
  throw lastErr || new Error("Không tạo được giọng đọc AssemblyAI (events)");
}

// Tạo (hoặc lấy từ bộ nhớ đệm) giọng đọc WAV cho một câu. Dùng chung cho /api/tts và trò chơi nghe/chính tả.
// Ném lỗi có status; off = true nếu không nên thử lại trong phiên này.
export async function ttsClip({ db, text, lang, voiceKey, userId, settings, dataDir }) {
  const S = settings();
  if (S.ttsEnabled === false || !ttsConfigured()) throw Object.assign(new Error("Giọng đọc tạm thời chưa sẵn sàng."), { status: 503, off: true });
  const langId = Object.keys(LANG_NAME).includes(lang) ? lang : "en";
  const t = String(text || "").normalize("NFC").replace(/\s+/g, " ").trim();
  if (!t || t.length > MAX_CHARS) throw Object.assign(new Error("Câu cần đọc trống hoặc quá dài."), { status: 400 });
  const admin = String(S.ttsVoice || "").trim();
  const voice = TTS_VOICES[voiceKey] || (/^[A-Za-z]{2,30}$/.test(admin) ? admin : TTS_VOICES.nu);
  // en/fr/es -> AssemblyAI (neu co key), neu khong thi roi ve Gemini; zh/ja/ko luon Gemini.
  const useAssembly = !!ASSEMBLY_LANG[langId] && !!assemblyKey();
  const cacheModel = useAssembly ? "assemblyai-tts-1" : ttsModel();
  const cacheVoice = useAssembly ? "aai-default" : voice;
  const dir = path.join(dataDir, "tts-cache");
  const base = crypto.createHash("sha256").update([cacheModel, cacheVoice, langId, t].join("\n")).digest("hex");
  const file = path.join(dir, base + ".wav");
  const wordsFile = path.join(dir, base + ".words.json");
  let wav = null, words = null;
  try { wav = await fs.promises.readFile(file); } catch {}
  try { words = JSON.parse(await fs.promises.readFile(wordsFile, "utf-8")); } catch { words = null; }
  if (!wav) {
    const over = await bump(db, userId, { user: Number(S.ttsUserDaily) || 300, system: Number(S.ttsSystemDaily) || 5000 });
    if (over) throw Object.assign(new Error("Đã hết lượt tạo giọng đọc AI hôm nay."), { status: 429, off: true });
    try {
      if (useAssembly) {
        try {
          const r = await synthesizeAssemblyEvents(t, langId);
          wav = r.wav; words = r.words && r.words.length ? r.words : null;
        } catch (e) {
          console.error("[tts] events loi, fallback /v1/speech:", String(e.message).slice(0, 120));
          wav = await synthesizeAssembly(t, langId); words = null;
        }
      } else {
        wav = await synthesize(t, langId, voice);
      }
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.writeFile(file + ".tmp", wav); await fs.promises.rename(file + ".tmp", file);
      if (words) { try { await fs.promises.writeFile(wordsFile + ".tmp", JSON.stringify(words)); await fs.promises.rename(wordsFile + ".tmp", wordsFile); } catch {} }
    } catch (e) {
      console.error("[tts]", e.status || "", String(e.message).slice(0, 160));
      // 4xx on key / model: tell browser not to retry for the rest of this session
      throw Object.assign(new Error("Không tạo được giọng đọc AI."), { status: 502, off: [400, 401, 403, 404].includes(e.status) });
    }
  }
  // Audio cu da cache nhung chua co timings: tao timings ngay lan nay (1 lan, roi cache).
  if (wav && useAssembly && !words) {
    try {
      const r = await synthesizeAssemblyEvents(t, langId);
      words = r.words && r.words.length ? r.words : null;
      if (words) { try { await fs.promises.writeFile(wordsFile + ".tmp", JSON.stringify(words)); await fs.promises.rename(wordsFile + ".tmp", wordsFile); } catch {} }
    } catch (e) { /* khong co timings thi frontend dung uoc luong */ }
  }
  return { wav, words };
}

export async function ttsApi(ctx) {
  const { db, req, res, url, method, user, sess, sendJson, readBody, requireCsrf, hit, settings, dataDir } = ctx;
  if (url.pathname !== "/api/tts") return false;
  if (method !== "POST") { sendJson(res, 405, { error: "Phương thức không hỗ trợ." }); return true; }
  const body = await readBody(req);
  if (body === null || !requireCsrf(req, sess)) { sendJson(res, 403, { error: "Phiên làm việc không hợp lệ." }); return true; }
  if (hit("tts:u" + user.id, 90, 60000)) { sendJson(res, 429, { error: "Bạn nghe quá nhanh, chờ một chút nhé." }); return true; }
  try {
    const { wav, words } = await ttsClip({ db, text: body.text, lang: body.lang, voiceKey: body.voice, userId: user.id, settings, dataDir });
    const headers = { "Content-Type": "audio/wav", "Content-Length": wav.length, "Cache-Control": "private, max-age=604800", "X-Content-Type-Options": "nosniff" };
    if (words && words.length) { try { headers["X-Word-Timings"] = JSON.stringify(words); } catch {} }
    res.writeHead(200, headers);
    res.end(wav);
  } catch (e) {
    sendJson(res, e.status || 502, { error: e.message, off: !!e.off });
  }
  return true;
}
