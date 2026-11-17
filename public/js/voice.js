/* 4.13.0 - Shared speech synthesis for foreign languages.
   Prefers server AI voice (POST /api/tts, cached); on error, quota exhaustion, or if disabled, falls back to built-in
   browser voices (Web Speech API), picking the most natural voice available. Learners can choose female / male or
   a specific device voice; preference is saved in the browser. */
import { S, cfg, toast } from "./core.js";
import { currentLang } from "./i18n.js";

const L = (vi, en) => (currentLang() === "en" ? en : vi);
const KEY = "pl:voice";
const DEF = { mode: "ai", gender: "nu", browser: {} };
let prefs = (() => { try { return { ...DEF, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return { ...DEF }; } })();
if (!prefs.browser || typeof prefs.browser !== "object") prefs.browser = {};
export const voicePrefs = () => ({ ...prefs, browser: { ...prefs.browser } });
export function setVoicePrefs(p) { prefs = { ...prefs, ...p }; try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch {} }

/* ---------- Browser voices ---------- */
let VOICES = [];
const loadVoices = () => { try { VOICES = speechSynthesis.getVoices() || []; } catch { VOICES = []; } };
if (typeof window !== "undefined" && "speechSynthesis" in window) { loadVoices(); try { speechSynthesis.addEventListener("voiceschanged", loadVoices); } catch {} }
const rank = (v, want) => {
  const l = (v.lang || "").replace("_", "-").toLowerCase(), base = want.slice(0, 2);
  if (!l.startsWith(base)) return -1;
  let r = l === want ? 50 : 20;
  if (/natural|neural|online|premium|enhanced|wavenet/i.test(v.name)) r += 30;
  if (/google/i.test(v.name)) r += 20;
  if (v.localService === false) r += 5;
  if (/compact|eloquence|novelty/i.test(v.name)) r -= 25;
  return r;
};
// List of device voices for a language, best voice first
export function browserVoices(lang) {
  if (!VOICES.length) loadVoices();
  const want = String(lang || "").replace("_", "-").toLowerCase();
  return VOICES.map((v) => ({ v, r: rank(v, want) })).filter((x) => x.r >= 0).sort((a, b) => b.r - a.r).map((x) => x.v);
}
export function bestVoice(lang) {
  const list = browserVoices(lang);
  const picked = prefs.browser[String(lang).slice(0, 2)];
  return list.find((v) => v.name === picked) || list[0] || null;
}

/* ---------- Word timings (karaoke) ---------- */
// Map tung tu AssemblyAI {w,s,e} (ms) ve vi tri ky tu trong text, de onBoundary nhan charIndex chinh xac.
// Giong withOffsets() ben speak.js: tim tung tu theo thu tu xuat hien.
function wordOffsets(text, aaiWords) {
  let pos = 0;
  return (aaiWords || []).map(({ w, s, e }) => {
    const head = String(w || "").trim().split(/\s+/)[0] || String(w || "");
    const at = head ? text.indexOf(head, pos) : -1;
    const off = at < 0 ? pos : at;
    pos = off + head.length;
    return { off, s: Number(s) || 0, e: Number(e) || 0 };
  });
}

/* ---------- Server AI voice ---------- */
let aiOff = false; // server reported disabled / out of quota: stop calling for the rest of this session
export const aiVoiceAvailable = () => !!S.me && cfg("ttsEnabled", true) !== false && !aiOff;
const mem = new Map(); // key -> {url, words} (keeps last 80 utterances)
async function aiAudioUrl(text, langId) {
  const k = `${prefs.gender}|${langId}|${text}`;
  if (mem.has(k)) return mem.get(k);
  const r = await fetch("/api/tts", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", ...(S.csrf ? { "X-CSRF-Token": S.csrf } : {}) }, body: JSON.stringify({ text, lang: langId, voice: prefs.gender }) });
  if (!r.ok) { let j = {}; try { j = await r.json(); } catch {} if (j.off || r.status === 401 || r.status === 404 || r.status === 429) aiOff = true; throw new Error(j.error || "tts"); }
  let words = null;
  try { const h = r.headers.get("X-Word-Timings"); if (h) words = JSON.parse(h); } catch {}
  const url = URL.createObjectURL(await r.blob());
  const entry = { url, words: Array.isArray(words) && words.length ? words : null };
  mem.set(k, entry);
  if (mem.size > 80) { const old = mem.keys().next().value; const o = mem.get(old); if (o) URL.revokeObjectURL(o.url); mem.delete(old); }
  return entry;
}

/* ---------- Playback ---------- */
let token = 0, audio = null;
export function stopSpeaking() {
  token++;
  if (audio) { try { audio.pause(); } catch {} audio = null; }
  try { speechSynthesis.cancel(); } catch {}
}
function speakBrowser(text, lang, rate, onBoundary, finish) {
  if (!("speechSynthesis" in window)) { toast(L("Trình duyệt này chưa hỗ trợ giọng đọc.", "This browser has no speech synthesis."), "info"); return finish(); }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; u.rate = rate;
  const v = bestVoice(lang);
  if (v) u.voice = v;
  else if (!speakBrowser.warned) { speakBrowser.warned = true; toast(L("Máy chưa cài giọng đọc cho ngôn ngữ này. Cài thêm giọng trong cài đặt hệ điều hành, hoặc dùng Chrome / Edge.", "No voice is installed for this language. Add one in your system settings, or use Chrome / Edge."), "info", 6000); }
  if (onBoundary) u.onboundary = (e) => onBoundary(e.charIndex);
  u.onend = u.onerror = finish;
  speechSynthesis.speak(u);
}
// rate: 1 = normal, ~0.6 = slow. onBoundary(charIndex) highlights text in sync with speech.
export async function speakText(text, lang, { rate = 0.95, onBoundary, onEnd } = {}) {
  text = String(text || "").trim();
  stopSpeaking();
  const my = token;
  let done = false;
  const finish = () => { if (!done) { done = true; if (onEnd && my === token) onEnd(); } };
  if (!text) return finish();
  if (prefs.mode !== "browser" && aiVoiceAvailable() && text.length <= 400) {
    try {
      const { url, words } = await aiAudioUrl(text, String(lang || "en").slice(0, 2).toLowerCase());
      if (my !== token) return;
      const a = audio = new Audio(url);
      a.playbackRate = rate >= 0.9 ? 1 : Math.max(0.7, rate + 0.12);
      let iv = null;
      const stopIv = () => { if (iv) { clearInterval(iv); iv = null; } };
      if (onBoundary && words && words.length) {
        // Timings that tu AssemblyAI: map currentTime (ms) -> tu dang doc -> charIndex. Poll 50ms cho khop.
        const timed = wordOffsets(text, words);
        let lastK = -1;
        const tick = () => {
          if (my !== token || !audio || audio !== a) { stopIv(); return; }
          const ms = (a.currentTime || 0) * 1000;
          let k = -1;
          for (let i = 0; i < timed.length; i++) { if (ms >= timed[i].s) k = i; else break; }
          if (k !== lastK) { lastK = k; if (k >= 0) onBoundary(timed[k].off); }
        };
        iv = setInterval(tick, 50);
        const doneIv = () => { stopIv(); finish(); };
        a.onended = a.onerror = doneIv;
      } else {
        if (onBoundary) a.ontimeupdate = () => { if (a.duration) onBoundary(Math.floor((text.length * a.currentTime) / a.duration)); };
        a.onended = a.onerror = finish;
      }
      await a.play();
      return;
    } catch { if (my !== token) return; audio = null; }
  }
  speakBrowser(text, lang, rate, onBoundary, finish);
}
