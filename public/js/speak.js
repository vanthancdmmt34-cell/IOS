/* 4.11.0 - Speaking Lab.
   - Read-along (vocabulary / sample sentences / paragraphs): listen to model audio, tap mic to read aloud, graded WORD BY WORD (green / yellow / red),
     scored on Accuracy - Completeness - Fluency, replay own recording, ask AI for pronunciation feedback.
   - Scenario-based AI conversation: speak or type, AI replies in character, corrects sentences, suggests next responses.
   Speech recognition uses the browser's Web Speech API (Chrome / Edge); the server grades and saves the highest score. */
import { setAppHash } from "./core.js";
import { S, api, esc, toast } from "./core.js";
import { currentLang } from "./i18n.js";
import { getSubject, setSubject } from "./lang.js";
import { speakText, stopSpeaking, voicePrefs, setVoicePrefs, aiVoiceAvailable, browserVoices } from "./voice.js";
import { mdLite, mdInline } from "./pro.js";
import EAR from "./speak-ear.js";
import { computeRms, createVadMonitor, createSrEndDetector, joinTranscript } from "./voice-vad.js";

const L = (vi, en) => (currentLang() === "en" ? en : vi);
const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const MOBILE = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const ls = { get: (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

/* ---------- Icons ---------- */
const P = {
  mic: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7"/>',
  stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="2.5" fill="currentColor"/>',
  vol: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.5a8 8 0 0 1 0 11"/>',
  ear: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.8"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.8"/>',
  left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
  spark: '<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  keys: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M7.5 14h9"/>',
  redo: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3.5v6h6"/>',
  word: '<path d="M4 7V5h16v2M12 5v14M9 19h6"/>',
  lines: '<path d="M4 6h16M4 11h16M4 16h10"/>',
  page: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  wave: '<path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11m0-1V4.5a1.5 1.5 0 0 1 3 0V10m0 0V5.5a1.5 1.5 0 0 1 3 0V12m0-2.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-2.7L3.5 14a1.5 1.5 0 0 1 2.4-1.8L7 13.5"/>',
  food: '<path d="M6 3v7a2 2 0 0 0 4 0V3M8 3v18M17 3c-2 1.5-3 4-3 7h3zm0 7v11"/>',
  bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  map: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.3"/>',
  plane: '<path d="M3 13.5 21 5l-4.5 15-4-6.5z"/><path d="m12.5 13.5 8.5-8.5"/>',
  code: '<path d="m8 8-4.5 4L8 16M16 8l4.5 4-4.5 4M13.5 5l-3 14"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0M16 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.5A6 6 0 0 1 21 20"/>',
  mega: '<path d="M4 10v4h3l8 4.5v-13L7 10zM18 9.5a3.5 3.5 0 0 1 0 5M8 14.5l1.2 5h2.3"/>',
  chart: '<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',
  cap: '<path d="m2.5 9 9.5-4.5L21.5 9 12 13.5z"/><path d="M6.5 11.5V16c1.5 1.5 3.5 2 5.5 2s4-.5 5.5-2v-4.5M21.5 9v5"/>',
  box: '<path d="m3.5 7.5 8.5-4 8.5 4v9l-8.5 4-8.5-4z"/><path d="m3.5 7.5 8.5 4 8.5-4M12 11.5v9"/>',
  pen: '<path d="m4 20 1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="m14.5 6.5 3 3"/>',
  flag: '<path d="M5 21V4M5 4.5h11l-2 4 2 4H5"/>',
  wavef: '<path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2"/>',
  bed: '<path d="M3 18V7M3 12h14a4 4 0 0 1 4 4v2M3 16h18"/><circle cx="7.5" cy="9.5" r="1.8"/>',
  brief: '<rect x="3" y="7.5" width="18" height="12" rx="2"/><path d="M9 7.5V5.5h6v2M3 13h18"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.5a4.3 4.3 0 0 1 7.5 2.3C19.5 15.4 12 20 12 20z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
  send: '<path d="M4 12 20 4l-6 16-3-7z"/>',
  lang: '<path d="M4 6h9M8.5 4v2c0 4-2 7-5 8.5M6 10c1 2.5 3.5 4.5 6.5 5"/><path d="m12.5 20 4-9 4 9M14 17h5"/>',
};
const I = (n, s = 20) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ""}</svg>`;
export const speakIcon = I;

/* ---------- Data ---------- */
const CACHE = {};
async function load(lang, force = false) {
  if (!CACHE[lang] || force) CACHE[lang] = await api(`/api/lang/speak/${encodeURIComponent(lang)}`);
  return CACHE[lang];
}
const tone = (s) => (s === undefined || s === null ? "none" : s >= 85 ? "g" : s >= 60 ? "y" : "r");
const chip = (s) => `<span class="sp-chip sp-${tone(s)}">${s === undefined || s === null ? "–" : s}</span>`;
const verdict = (s) => s >= 95 ? L("Xuất sắc!", "Excellent!") : s >= 85 ? L("Rất tốt!", "Great job!") : s >= 70 ? L("Khá tốt", "Good") : s >= 50 ? L("Cần luyện thêm", "Keep practising") : L("Thử lại nhé", "Try again");
function avgOf(d, items) {
  const xs = items.map((i) => d.best[i.k]).filter((x) => x !== undefined);
  return { n: xs.length, total: items.length, avg: xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null };
}
const ring = (score, size = "") => `<div class="sp-ring ${size} sp-${tone(score)}" style="--p:${score === null || score === undefined ? 0 : score}"><b>${score === null || score === undefined ? "–" : score}</b></div>`;

/* ---------- Model voice ---------- */
const stopSpeech = stopSpeaking;
function say(text, lang, opts = {}) { speakText(text, lang, opts); return true; }

/* ---------- Voice selector bar (4.13.0) ---------- */
function voiceBarHtml(d) {
  const p = voicePrefs(), ai = aiVoiceAvailable(), mode = ai ? p.mode : "browser";
  const list = browserVoices(d.speech);
  const cur = p.browser[d.lang] || (list[0] && list[0].name) || "";
  const seg = (on, attrs, label) => `<button type="button" class="${on ? "on" : ""}" aria-pressed="${on}" ${attrs}>${label}</button>`;
  return `<div class="sp-voice" id="spVoice">
    <span class="sp-voice-l">${I("vol", 17)}${L("Giọng đọc", "Voice")}</span>
    <div class="sp-seg">${ai ? seg(mode === "ai" && p.gender === "nu", 'data-voice="nu"', L("AI · giọng nữ", "AI · female")) + seg(mode === "ai" && p.gender === "nam", 'data-voice="nam"', L("AI · giọng nam", "AI · male")) : ""}${seg(mode === "browser", 'data-voice="browser"', L("Giọng của máy", "Device voice"))}</div>
    ${mode === "browser" && list.length > 1 ? `<select class="sp-select" id="spVoicePick" aria-label="${L("Chọn giọng của máy", "Choose a device voice")}">${list.slice(0, 12).map((v) => `<option value="${esc(v.name)}" ${v.name === cur ? "selected" : ""}>${esc(v.name.replace(/^(Microsoft|Google)\s+/, "").replace(/\s+-\s+.*$/, ""))}</option>`).join("")}</select>` : ""}
    <button type="button" class="btn btn-sm" data-voice-test>${I("vol", 15)}${L("Nghe thử", "Preview")}</button>
    <span class="sp-voice-n">${mode === "ai" ? L("Giọng AI tự nhiên, cần mạng; câu nghe lần đầu sẽ chậm một chút.", "Natural AI voice; needs a connection, the first play of a sentence is slightly slower.") : ai ? "" : L("Đang dùng giọng có sẵn của trình duyệt.", "Using your browser's built-in voice.")}</span>
  </div>`;
}
function bindVoiceBar(root, d) {
  const sample = (d.scenarios[0] && d.scenarios[0].open.t) || d.name;
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-voice]");
    if (b) { const v = b.dataset.voice; setVoicePrefs(v === "browser" ? { mode: "browser" } : { mode: "ai", gender: v }); const bar = root.querySelector("#spVoice"); if (bar) bar.outerHTML = voiceBarHtml(d); say(sample, d.speech); return; }
    if (e.target.closest("[data-voice-test]")) say(sample, d.speech);
  });
  root.addEventListener("change", (e) => {
    if (e.target.id !== "spVoicePick") return;
    const p = voicePrefs(); p.browser[d.lang] = e.target.value; setVoicePrefs({ browser: p.browser }); say(sample, d.speech);
  });
}

/* ---------- Audio recording + speech recognition ---------- */
const MIC_ERR = () => ({
  "not-allowed": L("Bạn chưa cho phép dùng micro. Bấm biểu tượng ổ khóa trên thanh địa chỉ → cho phép Micro, rồi thử lại.", "Microphone access is blocked. Click the lock icon in the address bar, allow the microphone, then try again."),
  "service-not-allowed": L("Trình duyệt chặn dịch vụ nhận giọng nói. Hãy dùng Chrome hoặc Edge bản mới.", "The browser blocked speech recognition. Please use a recent Chrome or Edge."),
  "audio-capture": L("Không tìm thấy micro. Kiểm tra micro đã cắm và được chọn trong cài đặt máy.", "No microphone found. Check that one is plugged in and selected."),
  network: L("Nhận giọng nói cần Internet. Kiểm tra mạng rồi thử lại.", "Speech recognition needs an Internet connection. Check your network and try again."),
  "no-speech": L("Không nghe thấy tiếng nói. Nói to, gần micro hơn và thử lại.", "No speech was heard. Speak louder, closer to the microphone, and try again."),
  "start": L("Micro đang bận (lần ghi trước chưa dừng hẳn). Đợi 1 giây rồi bấm lại.", "The microphone is busy (the previous recording had not stopped yet). Wait a second and tap again."),
  "language-not-supported": L("Trình duyệt chưa hỗ trợ nhận giọng nói cho ngôn ngữ này. Bạn có thể gõ câu vào ô.", "This browser cannot recognise this language yet. You can type the sentence instead."),
});
// Returns { stop(), abort(), done: Promise<{ text, alts, conf, ms, audioUrl, error }> }
// Server-side STT: thu am bang MediaRecorder roi gui len /api/lang/speak/stt de Gemini dich.
// Dung tren mobile thay cho Web Speech API (hay chet am tham sau lan dau tren iOS/Chrome mobile).
// Tra ve cung dang { stop, abort, done } nhu startCapture.
// Server-side STT: thu am bang MediaRecorder roi gui len /api/lang/speak/stt de Gemini dich.
// Dung tren mobile thay cho Web Speech API (hay chet am tham sau lan dau tren iOS/Chrome mobile).
// NGUYEN TAC: moi lan bam thu la mot vong doi sach — getUserMedia MOI, MediaRecorder MOI,
// chunks MOI, AudioContext MOI. Chi goi mr.stop() DUY NHAT 1 lan; DUY NHAT onstop giai phong.
// Log ngan [mic] de theo doi tren console.
const micLog = (...a) => { try { console.log("[mic]", ...a); } catch {} };
export function startServerCapture(lang, { onLevel, maxMs = 20000, silenceMs = 1300, noSpeechMs = 7500, record = true } = {}) {
  let stream = null, mr = null, ac = null, raf = 0, timer = 0, stopGuard = 0, vad = null;
  let stopped = false, aborted = false;
  const chunks = [];
  let audioUrl = "", error = "";
  let resolveWait = null;
  const waitStopped = new Promise((res) => { resolveWait = res; });
  // Tao AudioContext ngay trong su kien bam (iOS hay de suspended neu tao sau await).
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) {
    try {
      ac = new AC();
      if (ac.state === "suspended") ac.resume().catch(() => {});
    } catch { ac = null; }
  }
  const done = (async () => {
    // --- 1. Mo mic: getUserMedia chay DONG BO trong su kien bam (iOS chan neu qua setTimeout/await truoc do).
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      micLog("gum ok, track:", stream.getAudioTracks().map((t) => t.readyState + "/" + (t.enabled ? "on" : "off")).join(","));
    } catch (e) {
      if (ac) { try { await ac.close(); } catch {} ac = null; }
      error = (e && (e.name === "NotAllowedError" || e.name === "SecurityError")) ? "not-allowed" : "audio-capture";
      micLog("gum FAIL:", e && e.name, e && e.message);
      return { text: "", alts: [], conf: 0, ms: 0, audioUrl: "", error };
    }
    if (stopped || aborted) {
      try { stream.getTracks().forEach((t) => { try { t.stop(); } catch {} }); } catch {}
      if (ac) { try { await ac.close(); } catch {} ac = null; }
      return { text: "", alts: [], conf: 0, ms: 0, audioUrl: "", error: aborted ? "aborted" : "no-speech" };
    }
    // --- 2. Song am + VAD tu ngat: luon tao AnalyserNode khi co AudioContext (ke ca Chat AI khong truyen onLevel).
    if (ac) {
      try {
        if (ac.state === "suspended") {
          let resumeTimer = 0;
          try {
            await Promise.race([
              ac.resume().catch(() => {}),
              new Promise((r) => { resumeTimer = setTimeout(r, 250); }),
              waitStopped,
            ]);
          } finally { clearTimeout(resumeTimer); }
        }
        if (stopped || aborted) {
          try { stream.getTracks().forEach((t) => { try { t.stop(); } catch {} }); } catch {}
          try { await ac.close(); } catch {}
          ac = null;
          return { text: "", alts: [], conf: 0, ms: 0, audioUrl: "", error: aborted ? "aborted" : "no-speech" };
        }
        micLog("AudioContext:", ac.state);
        const an = ac.createAnalyser(); an.fftSize = 512;
        ac.createMediaStreamSource(stream).connect(an);
        const buf = new Uint8Array(an.fftSize);
        if (silenceMs > 0 || noSpeechMs > 0) {
          vad = createVadMonitor({
            silenceMs,
            noSpeechMs,
            onAutoStop: (reason) => {
              micLog("server vad stop:", reason);
              if (reason === "no-speech") error = "no-speech";
              requestStop();
            },
          });
        }
        const tick = () => {
          if (stopped || aborted) return;
          an.getByteTimeDomainData(buf);
          const rms = computeRms(buf);
          if (onLevel) onLevel(Math.min(1, rms * 3.2));
          if (vad && ac && ac.state !== "suspended") vad.process(rms, performance.now());
          if (!stopped && !aborted) raf = requestAnimationFrame(tick);
        };
        tick();
      } catch { try { ac.close().catch(() => {}); } catch {} ac = null; }
    }
    // --- 3. MediaRecorder MOI: 1 instance, 1 lan start, 1 lan stop. ondataavailable thu chunk.
    if (!window.MediaRecorder) {
      error = "no-recorder"; micLog("no MediaRecorder");
      cancelAnimationFrame(raf);
      if (vad) { vad.destroy(); vad = null; }
      stream.getTracks().forEach((t) => { try { t.stop(); } catch {} });
      if (ac) ac.close().catch(() => {});
      return { text: "", alts: [], conf: 0, ms: 0, audioUrl: "", error };
    }
    try { mr = new MediaRecorder(stream, { audioBitsPerSecond: 16000 }); }
    catch { try { mr = new MediaRecorder(stream); } catch (e) { error = "audio-capture"; micLog("MediaRecorder FAIL:", e && e.message); } }
    if (error) {
      cancelAnimationFrame(raf);
      if (vad) { vad.destroy(); vad = null; }
      stream.getTracks().forEach((t) => { try { t.stop(); } catch {} });
      if (ac) ac.close().catch(() => {});
      return { text: "", alts: [], conf: 0, ms: 0, audioUrl: "", error };
    }
    mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    mr.onstop = () => { micLog("onstop, chunks:", chunks.length); if (resolveWait) resolveWait(); };
    try { mr.start(250); micLog("recorder start, state:", mr.state, "mime:", mr.mimeType); }
    catch (e) { error = "audio-capture"; micLog("recorder start FAIL:", e && e.message); }
    if (error) {
      cancelAnimationFrame(raf);
      if (vad) { vad.destroy(); vad = null; }
      stream.getTracks().forEach((t) => { try { t.stop(); } catch {} });
      if (ac) ac.close().catch(() => {});
      return { text: "", alts: [], conf: 0, ms: 0, audioUrl: "", error };
    }
    // --- 4. Cho dung: het maxMs tu dung; VAD hoac bam dung thi requestStop() goi mr.stop() -> onstop -> resolveWait.
    timer = setTimeout(() => { micLog("maxMs, auto stop"); requestStop(); }, maxMs);
    await waitStopped;
    clearTimeout(timer); clearTimeout(stopGuard); cancelAnimationFrame(raf);
    if (vad) { vad.destroy(); vad = null; }
    // --- 5. Giai phong HOAN TOAN: dung TAT CA track, dong AudioContext. KHONG goi mr.stop() them lan nua.
    try { if (stream) stream.getTracks().forEach((t) => { try { t.stop(); } catch {} }); } catch {}
    if (ac) { try { await ac.close(); } catch {} }
    micLog("cleanup done, chunks:", chunks.length);
    // --- 6. Dich tren server.
    let text = "";
    if (chunks.length && !aborted && !error) {
      let blob = null;
      try {
        blob = new Blob(chunks, { type: (mr && mr.mimeType) || "audio/webm" });
      } catch (e) {
        error = "audio-capture";
        micLog("Blob FAIL:", e && e.message);
      }
      if (blob) {
        if (record !== false) {
          try { audioUrl = URL.createObjectURL(blob); } catch {}
        }
        micLog("audio blob:", blob.size, "bytes,", blob.type);
        try {
          const b64 = await new Promise((res, rej) => {
            const fr = new FileReader();
            fr.onload = () => res(String(fr.result).split(",")[1] || "");
            fr.onerror = () => rej(new Error("read"));
            fr.readAsDataURL(blob);
          });
          const r = await api("/api/lang/speak/stt", "POST", { audio: b64, mime: blob.type || "audio/webm", lang: String(lang || "en").slice(0, 5) }, { timeoutMs: 30000 });
          text = String((r && r.text) || "").trim();
          micLog("stt text:", JSON.stringify(text));
        } catch (e) { error = "stt"; micLog("stt FAIL:", e && e.message); }
      }
    } else if (!chunks.length) micLog("EMPTY recording (no chunks)");
    if (aborted && audioUrl) { try { URL.revokeObjectURL(audioUrl); } catch {} audioUrl = ""; }
    return { text, alts: [], conf: 0, ms: 0, audioUrl, error: aborted ? "aborted" : text ? "" : error || "no-speech" };
  })();
  function requestStop() {
    if (stopped) return;
    stopped = true;
    try {
      if (mr && mr.state === "recording") {
        mr.stop(); // onstop se chay -> resolveWait. Chi goi 1 lan duy nhat.
        // Bao hiem: neu onstop khong chay trong 1.5s (trinh duyet lac) thi giai phong tay, khong treo.
        stopGuard = setTimeout(() => { micLog("onstop guard: force resolve"); if (resolveWait) resolveWait(); }, 1500);
      } else if (resolveWait) resolveWait();
    } catch (e) { micLog("stop FAIL:", e && e.message); if (resolveWait) resolveWait(); }
  }
  return {
    stop() { requestStop(); },
    abort() { aborted = true; requestStop(); },
    done,
  };
}

// Thu am lien tuc va gui doan thu len server moi partialMs de hien chu gan thoi gian thuc.
// onPartial(text) duoc goi moi lan co chu moi; shouldStop(text) === true thi tu dung thu am.
export function startLiveCapture(lang, { onPartial, shouldStop, partialMs = 2500, maxMs = 15000, silenceMs = 1300, noSpeechMs = 7500 } = {}) {
  let stream = null, mr = null, halted = false, aborted = false, busy = false, resolveStopped = null;
  let ac = null, silenceTimer = 0, stopGuard = 0, vad = null, noSpeechStop = false, lastPartial = "";
  const stoppedP = new Promise((res) => { resolveStopped = res; });
  const chunks = [];
  // AudioContext tao ngay trong su kien bam (iOS hay de suspended neu tao sau await).
  const AC = window.AudioContext || window.webkitAudioContext;
  if ((silenceMs > 0 || noSpeechMs > 0) && AC) { try { ac = new AC(); if (ac.state === "suspended") ac.resume().catch(() => {}); } catch { ac = null; } }
  const b64Of = (blob) => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result).split(",")[1] || "");
    fr.onerror = () => rej(new Error("read"));
    fr.readAsDataURL(blob);
  });
  // Doan thu tu dau den gio (webm/mp4 chi co header o chunk dau, nen luon gui ca chuoi).
  const transcribe = async () => {
    if (!chunks.length || !mr) return "";
    const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" });
    const r = await api("/api/lang/speak/stt", "POST", { audio: await b64Of(blob), mime: blob.type || "audio/webm", lang: String(lang || "en").slice(0, 5) }, { timeoutMs: 30000 });
    return String((r && r.text) || "").trim();
  };
  const halt = () => {
    if (halted) return;
    halted = true;
    try {
      if (mr && mr.state !== "inactive") {
        mr.stop();
        stopGuard = setTimeout(() => { if (resolveStopped) resolveStopped(); }, 1500);
      } else resolveStopped();
    } catch { resolveStopped(); }
  };
  const done = (async () => {
    let maxT = 0, recErr = "";
    try {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      } catch (e) {
        return { text: "", alts: [], conf: 0, ms: 0, audioUrl: "", error: (e && (e.name === "NotAllowedError" || e.name === "SecurityError")) ? "not-allowed" : "audio-capture" };
      }
      if (halted || aborted) {
        return { text: "", alts: [], conf: 0, ms: 0, audioUrl: "", error: aborted ? "aborted" : "no-speech" };
      }
      // Do muc lang bang VAD thich ung: loc tap am va tu ngat khi im lang hoac khong co tieng noi.
      if (ac) {
        try {
          if (ac.state === "suspended") {
            let resumeTimer = 0;
            try {
              await Promise.race([
                ac.resume().catch(() => {}),
                new Promise((r) => { resumeTimer = setTimeout(r, 250); }),
                stoppedP,
              ]);
            } finally { clearTimeout(resumeTimer); }
          }
          if (halted || aborted) {
            return { text: "", alts: [], conf: 0, ms: 0, audioUrl: "", error: aborted ? "aborted" : "no-speech" };
          }
          const an = ac.createAnalyser(); an.fftSize = 512;
          ac.createMediaStreamSource(stream).connect(an);
          const buf = new Uint8Array(an.fftSize);
          vad = createVadMonitor({
            silenceMs,
            noSpeechMs,
            onAutoStop: (reason) => {
              micLog("live vad stop:", reason);
              if (reason === "no-speech") noSpeechStop = true;
              halt();
            },
          });
          silenceTimer = setInterval(() => {
            if (halted || aborted) return;
            if (ac && ac.state === "suspended") return;
            an.getByteTimeDomainData(buf);
            vad.process(computeRms(buf), performance.now());
          }, 50);
        } catch (e) { micLog("silence detect off:", e && e.message); }
      }
      try { mr = new MediaRecorder(stream, { audioBitsPerSecond: 16000 }); }
      catch { try { mr = new MediaRecorder(stream); } catch (e) { recErr = "audio-capture"; micLog("live MediaRecorder FAIL:", e && e.message); } }
      if (recErr) return { text: "", alts: [], conf: 0, ms: 0, audioUrl: "", error: recErr };
      mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      mr.onstop = () => resolveStopped();
      try { mr.start(500); }
      catch (e) { return { text: "", alts: [], conf: 0, ms: 0, audioUrl: "", error: "audio-capture" }; }
      maxT = setTimeout(halt, maxMs);
      // Vong lap nhan chu: moi partialMs gui doan thu len server, khong chong lan nhau.
      (async () => {
        while (!halted) {
          await Promise.race([new Promise((r) => setTimeout(r, partialMs)), stoppedP]);
          if (halted || busy) continue;
          busy = true;
          try {
            const t = await transcribe();
            if (t && !halted) { lastPartial = t; if (onPartial) onPartial(t); if (shouldStop && shouldStop(t)) halt(); }
          } catch (e) { micLog("partial stt FAIL:", e && e.message); }
          finally { busy = false; }
        }
      })();
      await stoppedP;
    } finally {
      clearTimeout(maxT); clearTimeout(stopGuard);
      clearInterval(silenceTimer); silenceTimer = 0;
      if (vad) { vad.destroy(); vad = null; }
      try { if (ac) ac.close().catch(() => {}); } catch {}
      try { if (stream) stream.getTracks().forEach((t) => { try { t.stop(); } catch {} }); } catch {}
    }
    if (aborted) return { text: "", alts: [], conf: 0, ms: 0, audioUrl: "", error: "aborted" };
    if (noSpeechStop && !lastPartial) return { text: "", alts: [], conf: 0, ms: 0, audioUrl: "", error: "no-speech" };
    let text = "", error = "";
    try { text = await transcribe(); } catch (e) { error = "stt"; micLog("final stt FAIL:", e && e.message); }
    return { text: text || lastPartial, alts: [], conf: 0, ms: 0, audioUrl: "", error: (text || lastPartial) ? "" : error || "no-speech" };
  })();
  return { stop() { halt(); }, abort() { aborted = true; halt(); }, done };
}

// Chrome/Windows can keep the mic busy for a moment after a session ends; a new session started
// right away opens but receives no audio. Enforce a short gap between desktop sessions.
let lastCapEnd = 0;
const COOL_MS = 2500;
// Ty le tu/cau mau da duoc nghe (dem trung lap). Dat 100% thi tu dung mic.
// CJK (Trung/Nhat/Han): dem theo ky tu; ngon ngu Latinh: dem theo tu. Giong coveredPct ben lang.js.
const normTxt = (t) => String(t || "").toLowerCase().normalize("NFC").replace(/[.,!?;:"'“”‘’()¿¡。、，！？：；「」・…\-]/g, " ").replace(/\s+/g, " ").trim();
const coveredPct = (heard, target) => {
  const T = normTxt(target);
  if (!T) return 0;
  const H = normTxt(heard);
  const cjk = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(T);
  if (cjk) {
    const hChars = [...H.replace(/ /g, "")], tChars = [...T.replace(/ /g, "")];
    if (!tChars.length) return 0;
    const pool = {};
    for (const ch of hChars) pool[ch] = (pool[ch] || 0) + 1;
    let m = 0;
    for (const ch of tChars) if (pool[ch] > 0) { m++; pool[ch]--; }
    return m / tChars.length;
  }
  const pool = {};
  for (const w of H.split(" ").filter(Boolean)) pool[w] = (pool[w] || 0) + 1;
  const tw = T.split(" ").filter(Boolean);
  let m = 0;
  for (const w of tw) if (pool[w] > 0) { m++; pool[w]--; }
  return tw.length ? m / tw.length : 0;
};

function startCapture(lang, { onInterim, onLevel, record = true, maxMs = 20000, target = "", silenceMs = 1300, noSpeechMs = 7500 } = {}) {
  // Mobile: Web Speech API hay chet sau lan dau (iOS/Chrome mobile) -> thu am roi dich tren server cho chac.
  if (MOBILE) return startServerCapture(lang, { onLevel, onInterim, maxMs, silenceMs, noSpeechMs, record, target });
  let rec = null, stream = null, mr = null, ac = null, raf = 0, timer = 0, stopTimer = 0, restartTimer = 0, retryTimer = 0, coolTimer = 0, resolveCooldown = null, resolveDone = null, aborted = false, wantStop = false;
  let rapidEnds = 0, recStartAt = 0, srStarted = false;
  let srDet = null, vad = null, vadReady = false, srHasSpeech = false;
  const chunks = [];
  let t0 = 0, t1 = 0, fin = "", inter = "", alts = [], conf = 0, error = "";
  const clearCooldown = () => {
    if (coolTimer) { clearTimeout(coolTimer); coolTimer = 0; }
    if (resolveCooldown) { const r = resolveCooldown; resolveCooldown = null; r(); }
  };
  const stopGracefully = () => {
    if (wantStop) return;
    wantStop = true;
    clearCooldown();
    const pend = restartTimer;
    clearTimeout(restartTimer); restartTimer = 0;
    clearTimeout(retryTimer); retryTimer = 0;
    if (srDet) { srDet.destroy(); srDet = null; }
    if (vad) { vad.destroy(); vad = null; }
    if (rec) {
      try { rec.stop(); } catch {}
      stopTimer = setTimeout(() => { if (resolveDone) resolveDone(); }, 600);
    } else if (resolveDone) {
      resolveDone();
    }
    if (pend && resolveDone) resolveDone();
  };
  const done = (async () => {
    let audioUrl = "";
    try {
      if (record && !MOBILE && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        } catch (e) {
          if (e && (e.name === "NotAllowedError" || e.name === "SecurityError")) error = "not-allowed";
          else if (e && e.name === "NotFoundError") error = "audio-capture";
          stream = null;
        }
        if (stream && (aborted || wantStop)) {
          return { text: "", alts: [], conf: 0, ms: 0, audioUrl: "", error: aborted ? "aborted" : "no-speech" };
        }
        if (stream) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (AC) {
            try {
              ac = new AC();
              const an = ac.createAnalyser(); an.fftSize = 512;
              ac.createMediaStreamSource(stream).connect(an);
              const buf = new Uint8Array(an.fftSize);
              if (silenceMs > 0 || noSpeechMs > 0) {
                vad = createVadMonitor({
                  silenceMs,
                  noSpeechMs,
                  onAutoStop: (reason) => {
                    if (aborted || wantStop) return;
                    if (reason === "no-speech" && (srHasSpeech || (fin || inter).trim())) return;
                    micLog("desktop vad stop:", reason);
                    if (reason === "no-speech") error = "no-speech";
                    stopGracefully();
                  },
                });
              }
              const tick = () => {
                if (aborted || wantStop) return;
                an.getByteTimeDomainData(buf);
                const rms = computeRms(buf);
                if (onLevel) onLevel(Math.min(1, rms * 3.2));
                if (vad && vadReady && ac && ac.state !== "suspended") vad.process(rms, performance.now());
                if (!aborted && !wantStop) raf = requestAnimationFrame(tick);
              };
              tick();
            } catch {
              cancelAnimationFrame(raf); raf = 0;
              if (vad) { vad.destroy(); vad = null; }
              if (ac) { try { ac.close().catch(() => {}); } catch {} ac = null; }
            }
          }
        }
      }
      if (!error && !aborted && !wantStop && lastCapEnd) {
        const wait = COOL_MS - (Date.now() - lastCapEnd);
        if (wait > 0) {
          micLog("cooldown ms:", wait);
          await new Promise((resolve) => {
            resolveCooldown = resolve;
            coolTimer = setTimeout(() => { coolTimer = 0; resolveCooldown = null; resolve(); }, wait);
          });
        }
      }
      if (!error && !aborted && !wantStop && stream && window.MediaRecorder) {
        try {
          mr = new MediaRecorder(stream);
          mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
          mr.start();
        } catch {
          mr = null;
          if (!ac && stream) {
            try { stream.getTracks().forEach((t) => { try { t.stop(); } catch {} }); } catch {}
            stream = null;
          }
        }
      }
      if (!error && !aborted && !wantStop) await new Promise((resolve) => {
        resolveDone = resolve;
        let finAcc = "";
        const FATAL = new Set(["not-allowed", "audio-capture", "network", "language-not-supported", "service-not-allowed"]);
        srDet = createSrEndDetector({
          postSpeechMs: silenceMs || 1400,
          speechEndMs: 650,
          noSpeechMs,
          onAutoStop: (reason) => {
            if (aborted || wantStop) return;
            micLog("sr end-detector stop:", reason);
            if (reason === "no-speech" && !(fin || inter).trim()) error = "no-speech";
            stopGracefully();
          },
        });
        vadReady = true;
        if (vad) vad.reset();
        const startRec = () => {
          if (aborted || wantStop) return resolve();
          // Tao MOI SpeechRecognition moi lan: dung lai cung instance sau onend hay loi am tham tren Chrome mobile (lan 2 khong thu).
          const r = new SR();
          rec = r;
          r.lang = lang; r.interimResults = true; r.maxAlternatives = 4; r.continuous = true;
          micLog("sr new session, lang:", lang, "t+", Date.now() - recStartAt);
          r.onstart = () => { micLog("sr onstart"); srDet && srDet.onStart(); };
          r.onaudiostart = () => micLog("sr audiostart");
          r.onaudioend = () => micLog("sr audioend");
          r.onspeechstart = () => { micLog("sr speechstart"); srHasSpeech = true; if (!t0) t0 = performance.now(); srDet && srDet.onSpeechStart(); };
          r.onspeechend = () => { micLog("sr speechend"); t1 = performance.now(); srDet && srDet.onSpeechEnd(); };
          r.onresult = (e) => {
            if (!t0) t0 = performance.now();
            t1 = performance.now();
            let f = "", it = "";
            for (const rr of e.results) {
              if (rr.isFinal) { f = joinTranscript(f, rr[0].transcript); if (rr[0].confidence) conf = rr[0].confidence; if (e.results.length === 1) alts = [...rr].slice(1).map((a) => a.transcript); }
              else it = joinTranscript(it, rr[0].transcript);
            }
            fin = joinTranscript(finAcc, f); inter = it;
            const combined = joinTranscript(fin, inter);
            if (combined) srHasSpeech = true;
            if (onInterim) onInterim(combined);
            if (srDet) srDet.onResult({ transcript: combined, isFinal: Boolean(f.trim()) && !it.trim(), hasInterim: Boolean(it.trim()) });
            // Doc du tu/cau mau thi tu dung ngay, khong doi het maxMs.
            if (target && combined && coveredPct(combined, target) >= 1) { stopGracefully(); }
          };
          r.onerror = (e) => { micLog("sr error:", e.error); if (e.error !== "aborted") error = e.error || "error"; };
          r.onend = () => {
            micLog("sr end, fin:", JSON.stringify(fin), "inter:", JSON.stringify(inter), "error:", error, "aborted:", aborted, "wantStop:", wantStop, "alive ms:", Date.now() - recStartAt);
            // continuous=true: phien nghe xuyen khoang ngung, chi ket thuc khi tu ngat het cau / bam dung / het maxMs / loi.
            // Khong tu mo phien moi — lan bam mic sau se mo phien HOAN TOAN MOI (startCapture moi).
            if (aborted || wantStop) return resolve();
            if (error && FATAL.has(error)) return resolve();
            // Phien ket thuc qua nhanh sau khi mo (<800ms) = dich vu tu choi/chet. Thu lai toi da 2 lan TRONG CUNG phien bam (khong deo phien cu).
            if (Date.now() - recStartAt < 800 && !fin.trim()) {
              if (++rapidEnds >= 3) { error = "start"; return resolve(); }
              finAcc = fin; error = "";
              restartTimer = setTimeout(() => {
                if (aborted || wantStop) return resolve();
                try { startRec(); } catch { return resolve(); }
              }, 150);
              return;
            }
            rapidEnds = 0;
            return resolve();
          };
          let tries = 0;
          const tryStart = () => {
            if (aborted || wantStop) return resolve();
            try { r.start(); recStartAt = Date.now(); srStarted = true; }
            catch (e) { if (++tries <= 2) retryTimer = setTimeout(tryStart, 400); else { error = "start"; resolve(); } }
          };
          tryStart();
        };
        timer = setTimeout(() => {
          micLog("maxMs, auto stop");
          stopGracefully();
        }, maxMs);
        startRec();
      });
    } finally {
      clearCooldown();
      clearTimeout(timer); clearTimeout(stopTimer); clearTimeout(restartTimer); clearTimeout(retryTimer); restartTimer = 0;
      cancelAnimationFrame(raf); raf = 0;
      if (srDet) { srDet.destroy(); srDet = null; }
      if (vad) { vad.destroy(); vad = null; }
      if (mr && mr.state !== "inactive") {
        await new Promise((r) => { const to = setTimeout(r, 800); mr.onstop = () => { clearTimeout(to); r(); }; try { mr.stop(); } catch { clearTimeout(to); r(); } });
      }
      if (stream) { try { stream.getTracks().forEach((t) => { try { t.stop(); } catch {} }); } catch {} stream = null; }
      if (ac) { try { ac.close().catch(() => {}); } catch {} ac = null; }
      if (record !== false && mr && chunks.length && !aborted) {
        try {
          audioUrl = URL.createObjectURL(new Blob(chunks, { type: mr.mimeType || "audio/webm" }));
        } catch {}
      }
    }
    if (srStarted) lastCapEnd = Date.now();
    const text = joinTranscript(fin, inter);
    return { text, alts, conf, ms: t0 && t1 > t0 ? Math.round(t1 - t0) : 0, audioUrl, error: aborted ? "aborted" : text ? "" : error || "no-speech" };
  })();
  return {
    stop() { stopGracefully(); },
    abort() {
      aborted = true;
      clearCooldown();
      clearTimeout(timer); clearTimeout(stopTimer);
      clearTimeout(restartTimer); restartTimer = 0;
      clearTimeout(retryTimer); retryTimer = 0;
      if (srDet) { srDet.destroy(); srDet = null; }
      if (vad) { vad.destroy(); vad = null; }
      try { rec && rec.abort(); } catch {}
      if (resolveDone) resolveDone();
    },
    done,
  };
}

/* ---------- Waveform ---------- */
function makeWave(canvas) {
  const N = 56, lv = new Array(N).fill(0);
  let live = false;
  const draw = () => {
    const dpr = window.devicePixelRatio || 1, w = canvas.clientWidth || 300, h = canvas.clientHeight || 52;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    const g = canvas.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    const cs = getComputedStyle(canvas);
    g.fillStyle = live ? cs.getPropertyValue("--c").trim() || "#5B3FD6" : cs.getPropertyValue("--line-2").trim() || "#C8CEDE";
    const step = w / N, bw = Math.max(2, step * 0.5);
    for (let i = 0; i < N; i++) {
      const bh = Math.max(3, lv[i] * (h - 6));
      const x = i * step + (step - bw) / 2, y = (h - bh) / 2;
      g.beginPath(); if (g.roundRect) g.roundRect(x, y, bw, bh, bw / 2); else g.rect(x, y, bw, bh); g.fill();
    }
  };
  draw();
  return {
    push(v) { lv.push(v); lv.shift(); draw(); },
    set(on) { live = on; if (!on) lv.fill(0); draw(); },
    redraw: draw,
  };
}

/* ---------- Tokenize text for highlighting / paced reading ---------- */
function splitClient(text, cjk, lang) {
  const out = [];
  if (cjk) { let sp = false; for (const ch of text) { if (/\s/.test(ch)) { sp = true; continue; } out.push({ t: ch, sp: sp && lang === "ko", s: "" }); sp = false; } return out; }
  text.split(/\s+/).filter(Boolean).forEach((w, i) => out.push({ t: w, sp: i > 0, s: "" }));
  return out;
}
function withOffsets(text, words) {
  let pos = 0;
  return words.map((w) => { const head = w.t.trim().split(/\s+/)[0] || w.t; const at = text.indexOf(head, pos); const off = at < 0 ? pos : at; pos = off + head.length; return { ...w, off }; });
}
const wordsHtml = (words) => words.map((w, i) => `${w.sp ? " " : ""}<span class="sp-w ${w.s ? "is-" + w.s : ""}" data-w="${i}" ${w.heard ? `title="${esc(L("Máy nghe thành", "Heard as"))}: ${esc(w.heard)}"` : ""}>${esc(w.t)}</span>`).join("");

const KIND = () => ({
  tu: { icon: "word", title: L("Từ vựng", "Words"), desc: L("Phát âm chuẩn từng từ, nghe và so với giọng mẫu.", "Pronounce each word, compare with the model voice.") },
  cau: { icon: "lines", title: L("Câu mẫu", "Sentences"), desc: L("Đọc theo cả câu: ngữ điệu, nối âm, tốc độ.", "Shadow full sentences: intonation, linking, pace.") },
  doan: { icon: "page", title: L("Đoạn văn", "Passage"), desc: L("Luyện đọc trôi chảy một đoạn văn, từng câu một.", "Read a passage aloud fluently, one sentence at a time.") },
});
const supportNote = () => !SR ? `<div class="sp-note warn">${I("mic", 18)}<span>${L("Trình duyệt này chưa hỗ trợ nhận giọng nói. Hãy mở bằng <b>Chrome</b> hoặc <b>Edge</b> để được chấm phát âm; bạn vẫn nghe mẫu và gõ lại câu được.", "This browser does not support speech recognition. Open the site in <b>Chrome</b> or <b>Edge</b> to get pronunciation scores; you can still listen and type.")}</span></div>` : !window.isSecureContext ? `<div class="sp-note warn">${I("lock", 18)}<span>${L("Micro chỉ dùng được khi trang chạy bằng https:// (hoặc localhost).", "The microphone only works over https:// (or localhost).")}</span></div>` : "";
const fail = (main, msg) => { main.innerHTML = `<div class="sheet sheet-pad empty"><b>${esc(msg)}</b><a class="btn" href="/app/">${L("Về trang chủ", "Back to home")}</a></div>`; };
const proCard = (lv) => `<div class="sheet sheet-pad sp-pro">${I("lock", 30)}<h2>${esc(lv.title)} ${L("dành cho thành viên Pro", "is for Pro members")}</h2><p>${L("Nâng cấp để luyện đọc theo và hội thoại AI ở mọi cấp độ.", "Upgrade to practise speaking and AI conversation at every level.")}</p><a class="btn btn-primary" href="/app/bang-gia">${L("Nâng cấp Pro", "Upgrade to Pro")}</a></div>`;

/* ---------- Chấm chi tiết (Gemini): hiển thị điểm từng từ, nhận xét từng từ và ngữ điệu ---------- */
const toB64 = (ab) => { const u = new Uint8Array(ab); let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const phonHtml = (a) => {
  if (!a) return "";
  const sc = a.scores || {};
  const chips = (a.words || []).map((w) => `<span class="sp-ph-w is-${w.s >= 85 ? "ok" : w.s >= 60 ? "mid" : "bad"}" title="${esc(w.tip || "")}">${esc(w.w)}<small>${w.s}${w.tip ? " · " + esc(w.tip) : ""}</small></span>`).join(" ");
  return `<div class="sp-assess">
    <div class="sp-assess-h">${L("Chấm chi tiết", "Detailed score")}: <b>${sc.pron ?? "–"}</b>
      ${sc.fluency != null ? ` · ${L("Trôi chảy", "Fluency")} ${sc.fluency}` : ""}</div>
    ${a.intonation ? `<p class="sp-assess-i">${L("Ngữ điệu", "Intonation")}: ${esc(a.intonation)}</p>` : ""}
    <div class="sp-ph">${chips}</div>
  </div>`;
};

/* ---------- Tiến độ: biểu đồ 7 ngày và danh sách mục cần luyện lại ---------- */
function progressCard(d, base) {
  const p = d.progress || { week: [], weak: [] };
  const max = Math.max(1, ...p.week.map((x) => x.n));
  const total = p.week.reduce((a, x) => a + x.n, 0);
  const bars = p.week.map((x) => `<div class="sp-bar-col" title="${esc(x.d)}: ${x.n}"><i style="height:${Math.max(4, Math.round((x.n / max) * 100))}%"></i><span>${x.n}</span></div>`).join("");
  const weak = p.weak.length
    ? `<ul class="sp-weak">${p.weak.map((w) => `<li><a href="${esc(base)}/${esc(w.lv)}/${esc(w.kind)}/${esc(w.u)}"><b class="lx-vi" lang="${esc(d.speech)}">${esc(w.t)}</b> <span class="muted">${esc(w.m || "")}</span></a> ${chip(w.s)}</li>`).join("")}</ul>`
    : `<p class="muted">${L("Chưa có mục nào dưới 85 điểm. Tiếp tục luyện nhé!", "No items below 85 yet. Keep going!")}</p>`;
  return `<section class="sheet sheet-pad sp-progress" id="spProgress">
    <div class="sp-goal-h"><b>${L("Tiến độ 7 ngày", "Last 7 days")}</b><span>${total} ${L("lượt luyện", "attempts")}</span></div>
    <div class="sp-bars">${bars}</div>
    <b class="sp-weak-h">${L("Cần luyện lại", "Practise again")}</b>
    ${weak}
  </section>`;
}

/* ---------- Nhắc luyện hằng ngày bằng thông báo trình duyệt ---------- */
const b64ToU8 = (s) => { const p = "=".repeat((4 - (s.length % 4)) % 4); const b = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(b, (c) => c.charCodeAt(0)); };
async function setReminder(d, on) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    toast(L("Trình duyệt này chưa hỗ trợ thông báo. Trên iPhone, hãy thêm trang vào màn hình chính rồi mở từ đó.", "This browser does not support notifications. On iPhone, add the page to your Home Screen and open it from there."), "info");
    return;
  }
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  if (!on) {
    const sub = await reg.pushManager.getSubscription();
    if (sub) { await api("/api/lang/speak/remind/off", "POST", { endpoint: sub.endpoint }); await sub.unsubscribe(); }
    ls.set("pl:speak:remind", "0");
  } else {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") { toast(L("Bạn chưa cho phép thông báo.", "Notifications are not allowed."), "err"); return; }
    const k = await api("/api/lang/speak/push-key");
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(k.key) });
    await api("/api/lang/speak/remind", "POST", { sub: sub.toJSON(), goal: Number(ls.get("pl:speak:goal", "10")) || 10, hour: 20 });
    ls.set("pl:speak:remind", "1");
    toast(L("Đã bật nhắc luyện lúc 20:00 mỗi ngày.", "Daily reminder is on at 20:00."), "info");
  }
  const old = document.querySelector("#spGoal"); if (old) old.outerHTML = goalCard(d);
}
// Đổi mục tiêu khi đã bật nhắc: gửi lại mục tiêu mới cho máy chủ.
async function syncReminderGoal(goal) {
  if (ls.get("pl:speak:remind", "0") !== "1" || !("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = reg && await reg.pushManager.getSubscription();
  if (sub) await api("/api/lang/speak/remind", "POST", { sub: sub.toJSON(), goal, hour: 20 });
}

/* ---------- Daily goal: count of practice attempts today (server), target chosen by the learner ---------- */
const GOALS = [5, 10, 20, 30];
const goalCard = (d) => {
  const goal = Number(ls.get("pl:speak:goal", "10")) || 10, done = Number(d.stats && d.stats.today) || 0;
  const pct = Math.min(100, Math.round((done / goal) * 100));
  return `<div class="sheet sheet-pad sp-goal" id="spGoal">
    <div class="sp-goal-h"><b>${L("Mục tiêu hôm nay", "Today's goal")}</b><span>${done}/${goal} ${L("lượt luyện", "attempts")}</span></div>
    <span class="sp-prog"><i style="width:${pct}%"></i></span>
    <div class="sp-goal-opts">${GOALS.map((n) => `<button type="button" class="sp-mini sp-goal-b ${n === goal ? "on" : ""}" data-goal="${n}" aria-pressed="${n === goal}">${n}</button>`).join("")}</div>
    ${done >= goal ? `<p class="sp-goal-ok">${I("check", 16)}${L("Bạn đã đạt mục tiêu hôm nay!", "You reached today's goal!")}</p>` : ""}
    ${d.pushEnabled ? `<button type="button" class="btn sp-remind" data-remind="${ls.get("pl:speak:remind", "0") === "1" ? "off" : "on"}">${I("heart", 15)}${ls.get("pl:speak:remind", "0") === "1" ? L("Tắt nhắc hằng ngày", "Turn off daily reminder") : L("Nhắc tôi mỗi ngày lúc 20:00", "Remind me daily at 20:00")}</button>` : ""}
  </div>`;
};

/* ---------- Ear training: listen to a word, pick which of a confusable pair it was ---------- */
function bindEar(main, d) {
  const box = document.createElement("section");
  box.className = "sp-sec"; box.id = "spEarBox";
  const holder = main.querySelector(".sp-sec") ? main.querySelector(".sp-tabs") : null;
  (holder ? holder.parentNode : main).insertBefore(box, holder ? holder.nextSibling : main.firstChild);
  const list = EAR[d.lang] || [];
  const st = { score: 0, n: 0, q: null, picked: null };
  const paint = () => {
    const q = st.q;
    let body = `<button type="button" class="btn btn-primary btn-lg" data-ear="next">${I("vol", 18)}${L("Bắt đầu", "Start")}</button>`;
    if (q) {
      const right = st.picked !== null && st.picked === q.target;
      body = `<div class="sp-ear-opts">${[0, 1].map((k) => `<button type="button" class="sp-ear-opt ${st.picked !== null ? (k === q.target ? "ok" : (k === st.picked ? "no" : "")) : ""}" data-ear="${k}" ${st.picked !== null ? "disabled" : ""}><b class="lx-vi" lang="${esc(d.speech)}">${esc(q.pair[k])}</b>${st.picked !== null ? `<span>${esc(q.pair[2 + k])}</span>` : ""}</button>`).join("")}</div>
        <div class="sp-ear-foot">
          ${st.picked === null ? `<button type="button" class="btn" data-ear="play">${I("vol", 16)}${L("Nghe lại", "Play again")}</button>`
            : `<span class="sp-ear-res ${right ? "ok" : "no"}">${right ? L("Đúng rồi!", "Correct!") : L(`Chưa đúng. Đáp án là “${q.pair[q.target]}”.`, `Not quite. The answer is “${q.pair[q.target]}”.`)}</span>
               <button type="button" class="btn btn-primary" data-ear="next">${L("Câu tiếp", "Next")}</button>`}
        </div>`;
    }
    box.innerHTML = `<div class="sp-sec-head"><h2>${L("Nghe và chọn từ đúng", "Listen and pick the word")}</h2><p>${L("Máy đọc một trong hai từ. Nghe kỹ rồi chọn từ bạn nghe được. Luyện tai trước khi luyện miệng.", "The app reads one of two words. Listen carefully and pick the one you heard. Train your ear before your mouth.")}</p></div>
      <div class="sheet sheet-pad sp-ear">
        <div class="sp-ear-top"><span class="sp-ear-score">${L("Đúng", "Correct")} ${st.score}/${st.n}</span></div>
        ${body}
      </div>`;
  };
  const next = () => {
    if (!list.length) return;
    const pair = list[Math.floor(Math.random() * list.length)];
    st.q = { pair, target: Math.random() < 0.5 ? 0 : 1 };
    st.picked = null;
    paint();
    say(pair[st.q.target], d.speech, { rate: 0.8 });
  };
  box.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ear]"); if (!b || !st.q && b.dataset.ear !== "next") return;
    const act = b.dataset.ear;
    if (act === "next") return next();
    if (act === "play") return say(st.q.pair[st.q.target], d.speech, { rate: 0.8 });
    if (st.picked !== null) return;
    st.picked = Number(act); st.n++;
    if (st.picked === st.q.target) st.score++;
    paint();
  });
  paint();
}

/* ================= Main page: Speaking Lab ================= */
export async function pageSpeakHub(main, [langId], query, ctx) {
  main.innerHTML = `<div class="lx-loading"><span class="spin"></span> ${L("Đang tải…", "Loading…")}</div>`;
  let d;
  try { d = await load(langId, true); } catch (e) { if (ctx.isCurrent()) fail(main, e.message); return; }
  if (!ctx.isCurrent()) return;
  if (getSubject() !== d.lang) setSubject(d.lang);
  ctx.setCrumbs([[d.name, `/app/ngoai-ngu/${d.lang}`], [query.muc === "hoi-thoai" ? L("Hội thoại AI", "AI Conversation") : L("Trung tâm luyện nói", "Speaking Lab")]]);
  const lvKey = `pl:speak:lv:${d.lang}`;
  const lv = d.levels.find((l) => l.id === query.cap) || d.levels.find((l) => l.id === ls.get(lvKey, "")) || d.levels[0];
  if (!lv) return fail(main, L("Khóa này chưa có nội dung luyện nói.", "This course has no speaking content yet."));
  ls.set(lvKey, lv.id);
  const base = `/app/ngoai-ngu/luyen-noi/${d.lang}`;
  const K = KIND();
  // 4.12.0: four sections of the speaking lab
  const TABS = [["giao-trinh", "page", L("Theo giáo trình", "By course")], ["chu-de", "chat", L("Luyện nói theo chủ đề", "Speaking topics")], ["phat-am", "wavef", L("Luyện phát âm", "Pronunciation")], ["hoi-thoai", "spark", L("Hội thoại và phỏng vấn", "Conversation and interviews")]];
  if ((EAR[d.lang] || []).length) TABS.splice(3, 0, ["phan-biet", "ear", L("Nghe phân biệt âm", "Ear training")]);
  const tab = TABS.some((t) => t[0] === query.muc) ? query.muc : "giao-trinh";
  const packCard = (kind, u) => {
    const items = kind === "chu-de" ? u.sentences : u.words, a = avgOf(d, items);
    return `<a class="sp-pack" href="${base}/${kind}/${kind === "chu-de" ? "cau" : "tu"}/${u.id}">
      <span class="sp-pack-no">${u.no}</span>
      <span class="sp-pack-t"><b>${esc(u.title)}</b><span class="lx-vi" lang="${esc(d.speech)}">${esc(items.slice(0, kind === "chu-de" ? 1 : 3).map((x) => x.t).join(kind === "chu-de" ? "" : " · "))}</span></span>
      <span class="sp-pack-foot"><span>${a.n}/${items.length} ${kind === "chu-de" ? L("câu", "sentences") : L("mục", "items")}</span>${chip(a.avg)}</span>
      <span class="sp-prog"><i style="width:${items.length ? Math.round((a.n / items.length) * 100) : 0}%"></i></span></a>`;
  };
  const allW = lv.units.flatMap((u) => u.words), allS = lv.units.flatMap((u) => u.sentences), allP = lv.passage ? lv.passage.sentences : [];
  // Recommended next lesson: first lesson with an item scoring below 85
  let cont = null;
  for (const u of lv.units) {
    if (u.sentences.some((x) => (d.best[x.k] ?? -1) < 85)) { cont = { href: `${base}/${lv.id}/cau/${u.id}`, label: `${L("Bài", "Lesson")} ${u.no} · ${K.cau.title}` }; break; }
    if (u.words.some((x) => (d.best[x.k] ?? -1) < 85)) { cont = { href: `${base}/${lv.id}/tu/${u.id}`, label: `${L("Bài", "Lesson")} ${u.no} · ${K.tu.title}` }; break; }
  }
  const modeCard = (kind, items, n) => {
    const a = avgOf(d, items);
    return `<a class="sp-mode" href="${base}/${lv.id}/${kind}">
      <span class="sp-mode-ico">${I(K[kind].icon, 22)}</span>
      <b>${K[kind].title}</b><span class="sp-mode-desc">${K[kind].desc}</span>
      <span class="sp-mode-foot"><span>${a.n}/${n} ${L("đã luyện", "practised")}</span>${chip(a.avg)}</span>
      <span class="sp-prog"><i style="width:${n ? Math.round((a.n / n) * 100) : 0}%"></i></span></a>`;
  };
  const lvShort = lv.code || lv.title.split(/[—·]/)[0].trim();
  const firstScene = d.scenarios && d.scenarios[0];
  const mobileHubHtml = tab === "hoi-thoai"
    ? `<section class="sp-m-coach" aria-label="Rivo AI Coach">
        <div class="sp-m-coach-head">
          <img class="sp-m-coach-img" src="/img/kit/chibi-owl.webp" width="68" height="68" alt="" loading="lazy" decoding="async">
          <div class="sp-m-coach-copy">
            <b>Rivo AI Coach</b>
            <span>${L("Đang sẵn sàng luyện tập", "Ready to practice")}</span>
          </div>
          <em class="sp-m-lv-pill">${esc(lvShort)}</em>
        </div>
        <div class="sp-m-scene-card">
          <h2>${L("Chọn tình huống hội thoại", "Pick a conversation scenario")}</h2>
          <div class="sp-m-scene-list">
            ${(d.scenarios || []).slice(0, 5).map((s) => `<a class="sp-m-scene-row" href="/app/ngoai-ngu/tro-chuyen/${d.lang}/${s.id}?cap=${lv.id}">
              <span class="sp-m-scene-ic">${I(s.icon, 20)}</span>
              <span class="sp-m-scene-txt"><b>${esc(s.title)}</b><small>${esc(s.desc)}</small></span>
              <span class="sp-m-arr" aria-hidden="true">›</span>
            </a>`).join("")}
          </div>
        </div>
        <div class="sp-m-goal-card">
          <b>🎯 ${L("Mục tiêu buổi học", "Session goal")}</b>
          <p>${L("Thực hành 5–7 lượt hội thoại và nhận góp ý sau mỗi câu.", "Practice 5–7 turns of conversation and get feedback after each sentence.")}</p>
        </div>
        ${firstScene ? `<a class="btn btn-primary btn-block sp-m-start" href="/app/ngoai-ngu/tro-chuyen/${d.lang}/${firstScene.id}?cap=${lv.id}">${L("Bắt đầu trò chuyện", "Start conversation")}</a>` : ""}
      </section>`
    : `<section class="sp-m-hub" aria-label="Speaking Lab">
        <h1>${L("Luyện nói mỗi ngày", "Practice speaking daily")}</h1>
        <p class="sp-m-sub">${L("Chọn cách luyện phù hợp với trình độ của bạn.", "Choose a practice mode that fits your level.")}</p>
        <div class="sp-m-lab-card">
          <div class="sp-m-lab-top">
            <img class="sp-m-lab-img" src="/img/kit/chibi-dragon.webp" width="76" height="76" alt="" loading="lazy" decoding="async">
            <div class="sp-m-lab-copy">
              <b>Speaking Lab</b>
              <span>${L("Nghe mẫu · Nói lại · Nhận góp ý", "Listen · Shadow · Get feedback")}</span>
            </div>
          </div>
          <a class="btn btn-primary btn-block" href="${cont ? cont.href : `${base}/${lv.id}/tu`}">${L("Bắt đầu luyện nói", "Start speaking")}</a>
        </div>
        <div class="sp-m-mode-list">
          <a class="sp-m-mode-row" href="${base}/${lv.id}/tu">
            <span class="sp-m-mode-ic">${I("mic", 22)}</span>
            <span class="sp-m-mode-txt"><b>${L("Luyện từng từ", "Practice words")}</b><small>${L("Nghe và nói từng từ", "Listen and pronounce each word")}</small></span>
            <span class="sp-m-arr" aria-hidden="true">›</span>
          </a>
          <a class="sp-m-mode-row" href="${base}/${lv.id}/cau">
            <span class="sp-m-mode-ic">${I("mic", 22)}</span>
            <span class="sp-m-mode-txt"><b>${L("Luyện câu", "Practice sentences")}</b><small>${L("Luyện ngữ điệu và nối âm", "Practice intonation and linking")}</small></span>
            <span class="sp-m-arr" aria-hidden="true">›</span>
          </a>
          <a class="sp-m-mode-row" href="${lv.passage ? `${base}/${lv.id}/doan` : `${base}?muc=chu-de`}">
            <span class="sp-m-mode-ic">${I("page", 22)}</span>
            <span class="sp-m-mode-txt"><b>${L("Luyện đoạn", "Practice passages")}</b><small>${L("Đọc đoạn văn hoàn chỉnh", "Read complete paragraphs")}</small></span>
            <span class="sp-m-arr" aria-hidden="true">›</span>
          </a>
          <a class="sp-m-mode-row" href="${base}?muc=hoi-thoai">
            <span class="sp-m-mode-ic">${I("spark", 22)}</span>
            <span class="sp-m-mode-txt"><b>${L("Hội thoại AI", "AI Conversation")}</b><small>${L("Thực hành tình huống thật", "Practice real-life scenarios")}</small></span>
            <span class="sp-m-arr" aria-hidden="true">›</span>
          </a>
        </div>
      </section>`;
  main.innerHTML = `
  <div class="sp" style="--c:${esc(d.color)}">
    ${mobileHubHtml}
    <section class="sp-hero">
      <div class="sp-hero-txt">
        <span class="sp-eyebrow">${d.flag} ${esc(d.name)} · ${L("PHÒNG LUYỆN NÓI", "SPEAKING STUDIO")}</span>
        <h1>${L("Đọc theo giọng mẫu, sửa từng từ", "Shadow the model voice, fix every word")}</h1>
        <p>${L("Nghe mẫu, bấm micro và đọc to. Máy chấm từng từ, cho điểm chính xác, đầy đủ và trôi chảy; bạn nghe lại giọng mình rồi luyện tới khi đạt.", "Listen, tap the microphone and read aloud. Each word is scored for accuracy, completeness and fluency; replay your own voice and practise until you get it.")}</p>
        <div class="sp-hero-cta">
          ${cont ? `<a class="btn btn-primary btn-lg" href="${cont.href}">${I("mic", 18)}${d.stats.practiced ? L("Luyện tiếp", "Continue") : L("Bắt đầu luyện", "Start practising")}: ${esc(cont.label)}</a>` : ""}
          <a class="btn btn-lg sp-ghost" href="${base}?muc=hoi-thoai">${I("chat", 18)}${L("Hội thoại và phỏng vấn AI", "AI conversation and interviews")}</a>
        </div>
      </div>
      <div class="sp-hero-stat">
        ${ring(d.stats.practiced ? d.stats.avg : null, "lg")}
        <span class="sp-hero-cap">${L("Điểm phát âm trung bình", "Average pronunciation score")}</span>
        <div class="sp-hero-nums"><div><b>${d.stats.practiced}</b><span>${L("mục đã luyện", "items practised")}</span></div><div><b>${d.stats.mastered}</b><span>${L("đạt từ 85", "scored 85+")}</span></div><div><b>${d.stats.attempts}</b><span>${L("lượt đọc", "attempts")}</span></div></div>
      </div>
    </section>
    ${goalCard(d)}
    ${progressCard(d, base)}
    ${supportNote()}
    ${voiceBarHtml(d)}
    <nav class="sp-tabs" role="tablist">${TABS.map((t) => `<a role="tab" aria-selected="${t[0] === tab}" href="${base}?muc=${t[0]}" class="${t[0] === tab ? "on" : ""}">${I(t[1], 17)}${t[2]}</a>`).join("")}</nav>
    ${tab !== "giao-trinh" ? "" : `<nav class="sp-levels" aria-label="${L("Cấp độ", "Level")}">${d.levels.map((l) => `<a href="${base}?cap=${l.id}" class="${l.id === lv.id ? "on" : ""}">${l.locked ? I("lock", 14) : ""}${esc(l.title)}</a>`).join("")}</nav>
    ${lv.locked ? proCard(lv) : `
    <section class="sp-sec">
      <div class="sp-sec-head"><h2>${L("Đọc theo", "Read along")} · ${esc(lv.title)}</h2><p>${esc(lv.desc)}</p></div>
      <div class="sp-modes">${modeCard("tu", allW, allW.length)}${modeCard("cau", allS, allS.length)}${lv.passage ? modeCard("doan", allP, allP.length) : ""}</div>
    </section>
    <section class="sp-sec">
      <div class="sp-sec-head"><h2>${L("Theo từng bài học", "By lesson")}</h2><p>${L("Điểm là trung bình điểm cao nhất của các mục bạn đã đọc.", "Scores are the average of your best attempts.")}</p></div>
      <div class="sp-units sheet">${lv.units.map((u) => { const aw = avgOf(d, u.words), as = avgOf(d, u.sentences); return `<div class="sp-unit">
        <span class="sp-unit-no">${u.no}</span><b class="sp-unit-t">${esc(u.title)}</b>
        <span class="sp-unit-act">
          ${u.words.length ? `<a class="sp-pill" href="${base}/${lv.id}/tu/${u.id}">${I("word", 15)}${u.words.length} ${L("từ", "words")}${chip(aw.avg)}</a>` : ""}
          ${u.sentences.length ? `<a class="sp-pill" href="${base}/${lv.id}/cau/${u.id}">${I("lines", 15)}${u.sentences.length} ${L("câu", "sentences")}${chip(as.avg)}</a>` : ""}
        </span></div>`; }).join("")}
        ${lv.passage ? `<div class="sp-unit"><span class="sp-unit-no">${I("page", 15)}</span><b class="sp-unit-t">${L("Đoạn văn", "Passage")}: ${esc(lv.passage.title)}</b><span class="sp-unit-act"><a class="sp-pill" href="${base}/${lv.id}/doan">${I("page", 15)}${allP.length} ${L("câu", "sentences")}${chip(avgOf(d, allP).avg)}</a></span></div>` : ""}
      </div>
    </section>`}`}
    ${tab !== "chu-de" ? "" : `<section class="sp-sec">
      <div class="sp-sec-head"><h2>${L("Luyện nói theo chủ đề", "Speaking topics")} · ${d.topics.length} ${L("bài", "lessons")}</h2><p>${L("Mỗi chủ đề gồm các câu giao tiếp thường dùng. Nghe mẫu, đọc theo cả câu, máy chấm từng từ.", "Each topic has everyday sentences. Listen, shadow the whole sentence and get every word scored.")}</p></div>
      <div class="sp-packs">${d.topics.map((u) => packCard("chu-de", u)).join("")}</div>
    </section>`}
    ${tab !== "phat-am" ? "" : `<section class="sp-sec">
      <div class="sp-sec-head"><h2>${L("Luyện phát âm", "Pronunciation")} · ${d.pron.length} ${L("bài", "lessons")}</h2><p>${L("Mỗi bài tập trung một âm hoặc một quy tắc phát âm người Việt hay sai, kèm mẹo đặt lưỡi, môi.", "Each lesson drills one sound or rule that Vietnamese learners often get wrong, with a tip on tongue and lip position.")}</p></div>
      <div class="sp-packs">${d.pron.map((u) => packCard("phat-am", u)).join("")}</div>
    </section>`}
    ${tab !== "hoi-thoai" ? "" : `<section class="sp-sec">
      <div class="sp-sec-head"><h2>${L("Phỏng vấn xin việc theo lĩnh vực", "Job interviews by field")} · ${d.interviews.length} ${L("ngành", "fields")}</h2><p>${L("AI đóng vai người phỏng vấn của đúng ngành: hỏi từng câu, sửa câu trả lời của bạn và nhận xét tổng kết sau khoảng 6 câu.", "The AI plays an interviewer from that field: one question at a time, corrections to your answers, and overall feedback after about 6 questions.")}</p></div>
      ${d.pro ? "" : `<p class="sp-note">${d.interviewFree && d.interviewFree.used ? L("Bạn đã dùng lượt phỏng vấn AI miễn phí. Nâng cấp Pro để phỏng vấn không giới hạn.", "You have used your free AI mock interview. Upgrade to Pro for unlimited mock interviews.") : L("Tài khoản Free được 1 buổi phỏng vấn AI miễn phí. Chọn một lĩnh vực bên dưới để bắt đầu.", "Free accounts get 1 free AI mock interview. Pick a field below to start.")}</p>`}
      <div class="sp-scenes">${d.interviews.map((s) => `<a class="sp-scene" href="/app/ngoai-ngu/tro-chuyen/${d.lang}/${s.id}?cap=${lv.id}"><span class="sp-scene-ico">${I(s.icon, 20)}</span><span><b>${esc(s.title)}</b><span>${esc(s.desc)}</span></span></a>`).join("")}</div>
    </section>
    <section class="sp-sec">
      <div class="sp-sec-head"><h2>${L("Hội thoại với AI", "Conversation with AI")}</h2><p>${L("Chọn một tình huống, nói hoặc gõ. AI đóng vai, sửa câu cho bạn và gợi ý câu tiếp theo.", "Pick a scene, speak or type. The AI plays a role, corrects you and suggests what to say next.")}</p></div>
      <div class="sp-scenes">${d.scenarios.map((s) => `<a class="sp-scene" href="/app/ngoai-ngu/tro-chuyen/${d.lang}/${s.id}?cap=${lv.id}"><span class="sp-scene-ico">${I(s.icon, 20)}</span><span><b>${esc(s.title)}</b><span>${esc(s.desc)}</span></span></a>`).join("")}</div>
    </section>`}
  </div>`;
  bindVoiceBar(main, d);
  if (tab === "phan-biet") bindEar(main, d);
  // #main được dùng lại giữa các trang: gỡ listener cũ để không bị chạy chồng nhiều lần.
  if (main._spGoalClick) main.removeEventListener("click", main._spGoalClick);
  main._spGoalClick = (e) => {
    const r = e.target.closest("[data-remind]");
    if (r) { setReminder(d, r.dataset.remind === "on").catch(() => toast(L("Chưa bật được nhắc. Thử lại sau.", "Could not set the reminder. Try again later."), "err")); return; }
    const g = e.target.closest("[data-goal]"); if (!g) return;
    ls.set("pl:speak:goal", g.dataset.goal);
    syncReminderGoal(Number(g.dataset.goal)).catch(() => {});
    const old = main.querySelector("#spGoal"); if (old) old.outerHTML = goalCard(d);
  };
  main.addEventListener("click", main._spGoalClick);
  ctx.onLeave(stopSpeech);
}

/* ================= Read-along room ================= */
export async function pageSpeakStudio(main, [langId, levelId, kind, unitId], query, ctx) {
  main.innerHTML = `<div class="lx-loading"><span class="spin"></span> ${L("Đang tải…", "Loading…")}</div>`;
  let d;
  try { d = await load(langId); } catch (e) { if (ctx.isCurrent()) fail(main, e.message); return; }
  if (!ctx.isCurrent()) return;
  if (getSubject() !== d.lang) setSubject(d.lang);
  const VIRT = { "chu-de": { id: "chu-de", title: L("Luyện nói theo chủ đề", "Speaking topics"), units: d.topics, passage: null }, "phat-am": { id: "phat-am", title: L("Luyện phát âm", "Pronunciation"), units: d.pron, passage: null } };
  const lv = VIRT[levelId] || d.levels.find((l) => l.id === levelId);
  const hub = VIRT[levelId] ? `/app/ngoai-ngu/luyen-noi/${d.lang}?muc=${levelId}` : `/app/ngoai-ngu/luyen-noi/${d.lang}?cap=${levelId}`;
  if (!lv) return fail(main, L("Không tìm thấy cấp độ.", "Level not found."));
  const K = KIND()[kind];
  ctx.setCrumbs([[d.name, hub], [L("Phòng luyện phát âm", "Pronunciation Studio")]]);
  if (lv.locked) { main.innerHTML = `<div class="sp" style="--c:${esc(d.color)}">${proCard(lv)}</div>`; return; }
  const unit = unitId ? lv.units.find((u) => u.id === unitId) : null;
  const tag = (u) => `${L("Bài", "Lesson")} ${u.no}: ${u.title}`;
  let items = kind === "doan" ? (lv.passage ? lv.passage.sentences.map((x) => ({ ...x, from: lv.passage.title })) : [])
    : (unit ? [unit] : lv.units).flatMap((u) => (kind === "tu" ? u.words : u.sentences).map((x) => ({ ...x, from: tag(u) })));
  const weakOnly = query.yeu === "1";
  if (weakOnly) items = items.filter((x) => (d.best[x.k] ?? -1) < 85);
  if (!items.length) { main.innerHTML = `<div class="sp" style="--c:${esc(d.color)}"><div class="sheet sheet-pad empty"><b>${weakOnly ? L("Không còn mục nào dưới 85 điểm. Tuyệt vời!", "Nothing left below 85. Well done!") : L("Bài này chưa có nội dung để luyện.", "Nothing to practise here yet.")}</b><a class="btn btn-primary" href="${hub}">${L("Về phòng luyện nói", "Back to the studio")}</a></div></div>`; return; }

  const st = { idx: 0, res: {}, audio: {}, slow: false, cap: null, busy: false, typing: false, readingAll: false, tips: {}, assess: {} };
  let wave = null, alive = true;
  const title = kind === "doan" ? lv.passage.title : unit ? tag(unit) : `${lv.title} · ${L("tất cả các bài", "all lessons")}`;
  const nextUnit = unit ? lv.units[lv.units.indexOf(unit) + 1] : null;
  const lvShort = lv.code || lv.title.split(/[—·]/)[0].trim();

  main.innerHTML = `
  <div class="sp sp-studio" style="--c:${esc(d.color)}">
    <div class="sp-m-studio-kicker"><span>${esc(K.title.toUpperCase())} · ${esc(lvShort.toUpperCase())}</span></div>
    <header class="sp-top">
      <a class="sp-back" href="${hub}" aria-label="${L("Về phòng luyện nói", "Back to the studio")}">${I("left", 20)}</a>
      <div class="sp-top-t"><b>${esc(title)}</b><span>${d.flag} ${esc(d.name)} · ${esc(lv.title)} · ${K.title}${weakOnly ? " · " + L("mục cần luyện lại", "items to redo") : ""}</span></div>
      <span class="sp-count" id="spCount"></span>
    </header>
    <div class="sp-dots" id="spDots" role="tablist"></div>
    ${unit && unit.tip ? `<div class="sp-note tip">${I("spark", 18)}<span><b>${L("Mẹo phát âm", "Pronunciation tip")}:</b> ${esc(unit.tip)}</span></div>` : ""}
    ${kind === "doan" ? `<article class="sheet sp-passage"><div class="sp-passage-head"><b>${esc(lv.passage.title)}</b><button type="button" class="btn btn-sm" id="spReadAll">${I("vol", 16)}<span>${L("Nghe cả đoạn", "Listen to all")}</span></button></div><p class="lx-vi" lang="${esc(d.speech)}" id="spPassage"></p></article>` : ""}
    <section class="sheet sp-card" id="spCard"></section>
    <div class="sheet sp-m-tip-card">
      <b>${L("Gợi ý phát âm", "Pronunciation tip")}</b>
      <p>${esc((unit && unit.tip) || L("Giữ âm đầu nhẹ, mở khẩu hình ở âm cuối và nói tự nhiên.", "Keep the initial sound clear, open your mouth naturally and speak at a steady pace."))}</p>
    </div>
    <button type="button" class="btn btn-primary btn-block sp-m-score-btn" data-act="mic">${L("Chấm phát âm", "Score pronunciation")}</button>
    <footer class="sp-nav">
      <button type="button" class="btn" id="spPrev">${I("left", 16)}${L("Trước", "Previous")}</button>
      <span class="sp-keys">${L("Phím tắt: Space thu âm · L nghe mẫu · ← →", "Shortcuts: Space record · L listen · ← →")}</span>
      <button type="button" class="btn btn-primary" id="spNext">${L("Tiếp", "Next")}${I("right", 16)}</button>
    </footer>
  </div>`;
  const $ = (s) => main.querySelector(s);
  const card = $("#spCard");

  function paintDots() {
    $("#spDots").innerHTML = items.map((x, i) => `<button type="button" role="tab" aria-selected="${i === st.idx}" class="sp-dot sp-${tone(d.best[x.k])} ${i === st.idx ? "on" : ""}" data-go="${i}" title="${esc(x.t)}${d.best[x.k] !== undefined ? " · " + d.best[x.k] : ""}"></button>`).join("");
    $("#spCount").textContent = st.idx < items.length ? `${st.idx + 1}/${items.length}` : `${items.length}/${items.length}`;
    $("#spPrev").disabled = st.idx === 0;
    $("#spNext").innerHTML = st.idx >= items.length ? `${L("Về phòng luyện", "Back to studio")}${I("right", 16)}` : st.idx === items.length - 1 ? `${L("Xem kết quả", "See results")}${I("right", 16)}` : `${L("Tiếp", "Next")}${I("right", 16)}`;
    const pg = $("#spPassage");
    if (pg) pg.innerHTML = items.map((x, i) => `<span class="sp-ps sp-${tone(d.best[x.k])} ${i === st.idx ? "cur" : ""}" data-go="${i}">${esc(x.t)}</span>`).join(d.cjk && d.lang !== "ko" ? "" : " ");
  }

  function paintCard() {
    if (st.idx >= items.length) return paintSummary();
    const it = items[st.idx], r = st.res[it.k];
    const words = withOffsets(it.t, r ? r.words : splitClient(it.t, d.cjk, d.lang));
    card.className = "sheet sp-card" + (kind === "tu" ? " is-word" : "");
    card.innerHTML = `
      <div class="sp-kind"><span>${I(K.icon, 15)}${esc(it.from)}</span>${d.best[it.k] !== undefined ? `<span class="sp-best">${L("Cao nhất", "Best")} ${chip(d.best[it.k])}</span>` : ""}</div>
      <div class="sp-text lx-vi" lang="${esc(d.speech)}" id="spText">${wordsHtml(words)}</div>
      ${it.r ? `<div class="sp-reading lx-vi">${esc(it.r)}</div>` : ""}
      ${it.m ? `<div class="sp-meaning lx-vi">${esc(it.m)}</div>` : ""}
      <button type="button" class="sp-listen-pill" data-act="listen">${I("vol", 16)}<span>${L("Nghe giọng mẫu", "Listen to model")}</span></button>
      <div class="sp-ctl">
        <button type="button" class="sp-round" data-act="listen" title="${L("Nghe mẫu (L)", "Listen (L)")}" aria-label="${L("Nghe mẫu", "Listen")}">${I("vol", 22)}</button>
        <button type="button" class="sp-round sp-txt ${st.slow ? "on" : ""}" data-act="slow" title="${L("Đọc chậm", "Slow speed")}" aria-pressed="${st.slow}">0.6×</button>
        <button type="button" class="sp-mic" data-act="mic" aria-label="${L("Thu âm", "Record")}">${I("mic", 30)}</button>
        <button type="button" class="sp-round" data-act="replay" ${st.audio[it.k] ? "" : "disabled"} title="${L("Nghe lại giọng của bạn", "Replay your voice")}" aria-label="${L("Nghe lại giọng của bạn", "Replay your voice")}">${I("ear", 22)}</button>
        <button type="button" class="sp-round ${st.typing ? "on" : ""}" data-act="type" title="${L("Không dùng được micro? Gõ lại câu", "No microphone? Type it instead")}" aria-label="${L("Gõ lại câu", "Type instead")}">${I("keys", 22)}</button>
      </div>
      <canvas class="sp-wave" id="spWave" aria-hidden="true"></canvas>
      <div class="sp-status" id="spStatus" aria-live="polite">${r ? "" : (SR || MOBILE) ? L("Chạm micro để đọc — tự dừng khi hết câu", "Tap the mic to speak — auto-stops after your sentence") : L("Nghe mẫu, rồi gõ lại câu để kiểm tra", "Listen, then type the sentence to check")}</div>
      <form class="sp-type" id="spType" ${st.typing || (!SR && !MOBILE) ? "" : "hidden"}><input class="input lx-vi" name="t" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${L("Gõ lại câu bạn vừa đọc", "Type what you said")}"><button class="btn btn-primary" type="submit">${L("Chấm", "Check")}</button></form>
      ${r ? resultHtml(it, r) : ""}`;
    wave = makeWave($("#spWave"));
  }

  function resultHtml(it, r) {
    const bad = r.words.filter((w) => w.s !== "ok");
    const bar = (label, v) => `<div class="sp-bar"><span>${label}</span><i><em class="sp-${tone(v)}" style="width:${v}%"></em></i><b>${v}</b></div>`;
    return `<div class="sp-result sp-${tone(r.score)}">
      <div class="sp-res-top">
        ${ring(r.score)}
        <div class="sp-res-main"><b class="sp-verdict">${verdict(r.score)}</b>
          ${bar(L("Chính xác", "Accuracy"), r.accuracy)}${bar(L("Đầy đủ", "Completeness"), r.completeness)}${bar(L("Trôi chảy", "Fluency"), r.fluency)}</div>
      </div>
      <div class="sp-heard"><span>${L("Máy nghe được", "Heard")}</span><q class="lx-vi" lang="${esc(d.speech)}">${esc(r.heard)}</q></div>
      ${bad.length ? `<ul class="sp-fixes">${bad.slice(0, 6).map((w) => `<li class="is-${w.s}"><button type="button" class="sp-mini" data-say="${esc(w.t.replace(/[.,!?;:。、，！？]+$/u, ""))}" aria-label="${L("Nghe từ này", "Hear this word")}">${I("vol", 15)}</button><b class="lx-vi">${esc(w.t)}</b><span>${w.s === "miss" ? L("chưa nghe thấy từ này", "this word was not heard") : `${L("máy nghe thành", "heard as")} “<span class="lx-vi">${esc(w.heard)}</span>”`}</span></li>`).join("")}</ul>` : `<div class="sp-allok">${I("check", 16)}${L("Máy nghe đúng tất cả các từ.", "Every word was recognised correctly.")}</div>`}
      ${phonHtml(st.assess[it.k])}
      <div class="sp-res-act">
        <button type="button" class="btn" data-act="mic2">${I("redo", 16)}${L("Đọc lại", "Try again")}</button>
        ${d.ai.enabled ? `<button type="button" class="btn" data-act="coach">${I("spark", 16)}${L("AI góp ý phát âm", "AI pronunciation tips")}</button>` : ""}
        ${st.idx < items.length - 1 ? `<button type="button" class="btn btn-primary" data-act="next">${L("Câu tiếp", "Next")}${I("right", 16)}</button>` : `<button type="button" class="btn btn-primary" data-act="next">${L("Xem kết quả", "See results")}${I("right", 16)}</button>`}
      </div>
      <div class="sp-tips" id="spTips" ${st.tips[it.k] ? "" : "hidden"}>${st.tips[it.k] || ""}</div>
    </div>`;
  }

  function paintSummary() {
    const done = items.filter((x) => st.res[x.k]);
    const all = avgOf(d, items);
    const weak = items.filter((x) => (d.best[x.k] ?? -1) < 85);
    const self = `/app/ngoai-ngu/luyen-noi/${d.lang}/${lv.id}/${kind}${unit ? "/" + unit.id : ""}`;
    card.className = "sheet sp-card sp-sum";
    card.innerHTML = `
      <div class="sp-sum-top">${ring(all.avg, "lg")}<div><h2>${all.avg === null ? L("Bạn chưa đọc mục nào", "You have not read anything yet") : verdict(all.avg)}</h2>
        <p>${L(`Lần này bạn đọc ${done.length}/${items.length} mục. Điểm trung bình (theo điểm cao nhất): ${all.avg ?? "–"}.`, `You read ${done.length}/${items.length} items this time. Average of best scores: ${all.avg ?? "–"}.`)}</p></div></div>
      <div class="sp-sum-list">${items.map((x, i) => `<button type="button" class="sp-sum-row" data-go="${i}"><span class="lx-vi" lang="${esc(d.speech)}">${esc(x.t)}</span>${chip(d.best[x.k])}</button>`).join("")}</div>
      <div class="sp-res-act">
        <a class="btn" href="${hub}">${L("Về phòng luyện nói", "Back to the studio")}</a>
        ${weak.length && !weakOnly ? `<a class="btn" href="${self}?yeu=1">${I("redo", 16)}${L(`Luyện lại ${weak.length} mục dưới 85`, `Redo ${weak.length} items below 85`)}</a>` : ""}
        ${nextUnit ? `<a class="btn btn-primary" href="/app/ngoai-ngu/luyen-noi/${d.lang}/${lv.id}/${kind}/${nextUnit.id}">${L("Bài tiếp theo", "Next lesson")}${I("right", 16)}</a>` : `<a class="btn btn-primary" href="/app/ngoai-ngu/tro-chuyen/${d.lang}?cap=${lv.id}">${I("chat", 16)}${L("Trò chuyện với AI", "Talk with AI")}</a>`}
      </div>`;
    wave = null;
  }

  function go(i) {
    if (st.cap) { st.cap.abort(); st.cap = null; }
    micUi(false);
    stopSpeech(); st.readingAll = false; syncReadAll();
    st.idx = Math.max(0, Math.min(items.length, i));
    paintDots(); paintCard();
  }
  const status = (t, cls = "") => { const el = $("#spStatus"); if (el) { el.textContent = t; el.className = "sp-status " + cls; } };
  function micUi(on) {
    const b = card.querySelector(".sp-mic");
    if (b) { b.classList.toggle("rec", on); b.innerHTML = on ? I("stop", 30) : I("mic", 30); b.setAttribute("aria-label", on ? L("Dừng thu", "Stop") : L("Thu âm", "Record")); }
    const sb = main.querySelector(".sp-m-score-btn");
    if (sb) {
      sb.classList.toggle("rec", on);
      sb.classList.toggle("btn-danger", on);
      sb.classList.toggle("btn-primary", !on);
      sb.textContent = on ? L("Dừng thu âm", "Stop recording") : L("Chấm phát âm", "Score pronunciation");
      sb.setAttribute("aria-pressed", String(on));
    }
    if (wave) wave.set(on);
    card.classList.toggle("is-rec", on);
  }

  function listen(text) {
    const it = items[st.idx]; if (!it) return;
    const el = $("#spText");
    const spans = el ? [...el.querySelectorAll(".sp-w")] : [];
    const words = withOffsets(it.t, st.res[it.k] ? st.res[it.k].words : splitClient(it.t, d.cjk, d.lang));
    const clear = () => spans.forEach((s) => s.classList.remove("on"));
    say(text || it.t, d.speech, {
      rate: st.slow ? 0.6 : 0.95,
      onBoundary: text ? null : (ci) => { let k = 0; words.forEach((w, i) => { if (w.off <= ci) k = i; }); clear(); if (spans[k]) spans[k].classList.add("on"); },
      onEnd: clear,
    });
  }

  async function record() {
    const it = items[st.idx]; if (!it || st.busy) return;
    if (st.cap) { st.cap.stop(); return; }
    if (!SR && !MOBILE) { st.typing = true; paintCard(); card.querySelector(".sp-type input")?.focus(); toast(L("Trình duyệt này chưa hỗ trợ nhận giọng nói. Hãy dùng Chrome / Edge, hoặc gõ lại câu.", "This browser cannot recognise speech. Use Chrome / Edge, or type the sentence."), "info"); return; }
    if (!window.isSecureContext) { toast(L("Micro chỉ dùng được khi trang chạy bằng https:// (hoặc localhost).", "The microphone only works over https:// (or localhost)."), "err"); return; }
    stopSpeech();
    const old = card.querySelector(".sp-result"); if (old) old.remove();
    card.querySelectorAll(".sp-w").forEach((s) => { s.className = "sp-w"; });
    micUi(true); status(L("Đang nghe… tự dừng khi dứt câu (hoặc bấm để dừng)", "Listening… auto-stops at sentence end (or tap to stop)"), "rec");
    const silenceMs = kind === "tu" ? 1000 : kind === "doan" ? 1800 : 1300;
    const cap = st.cap = startCapture(d.speech, { onInterim: (t) => status(t, "rec lx-vi"), onLevel: (v) => wave && wave.push(v), maxMs: kind === "doan" ? 30000 : 15000, silenceMs, noSpeechMs: 7500, target: it.t });
    let out;
    try { out = await cap.done; }
    catch (e) { micLog("capture crashed:", e && e.message); out = { text: "", alts: [], audioUrl: "", error: "start" }; }
    finally {
      if (st.cap === cap) st.cap = null;
      if (alive && items[st.idx] === it) micUi(false);
    }
    if (!alive || items[st.idx] !== it) { if (out && out.audioUrl) URL.revokeObjectURL(out.audioUrl); return; }
    if (out.error === "aborted") { if (out.audioUrl) URL.revokeObjectURL(out.audioUrl); return; }
    if (!out.text) { if (out.audioUrl) URL.revokeObjectURL(out.audioUrl); status(MIC_ERR()[out.error] || L("Không nghe rõ, thử lại nhé.", "Could not hear you clearly. Please try again."), "err"); return; }
    if (out.audioUrl) { if (st.audio[it.k]) URL.revokeObjectURL(st.audio[it.k]); st.audio[it.k] = out.audioUrl; }
    await grade(it, out);
  }
  // Chấm chi tiết (Azure): đổi bản thu sang WAV 16 kHz rồi gửi lên máy chủ. Chỉ chạy khi máy chủ đã bật.
  async function assessIt(it, audioUrl) {
    try {
      const blob = await (await fetch(audioUrl)).blob();
      const r = await api("/api/lang/speak/assess", "POST", { lang: d.lang, audio: toB64(await blob.arrayBuffer()), mime: blob.type || "audio/webm", reference: it.t }, { timeoutMs: 40000 });
      if (r && r.ok) { st.assess[it.k] = r; if (alive && items[st.idx] === it) paintCard(); }
    } catch (e) { /* Chấm chi tiết là phần thêm: lỗi thì vẫn hiện điểm cơ bản. */ }
  }
  async function grade(it, out) {
    st.busy = true; status(L("Đang chấm…", "Scoring…"));
    try {
      const r = await api("/api/lang/speak/score", "POST", { lang: d.lang, key: it.k, heard: out.text, alts: out.alts || [], conf: out.conf || 0, ms: out.ms || 0 });
      if (!alive) return;
      st.res[it.k] = r; d.best[it.k] = r.best; delete st.tips[it.k];
      if (d.pronAssess && out.audioUrl) assessIt(it, out.audioUrl);
      if (items[st.idx] === it) { paintDots(); paintCard(); card.querySelector(".sp-result")?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
    } catch (e) { status(e.message, "err"); }
    finally { st.busy = false; }
  }
  async function coach() {
    const it = items[st.idx], r = st.res[it.k]; if (!r) return;
    const box = $("#spTips"); if (!box) return;
    box.hidden = false; box.innerHTML = `<span class="spin"></span> ${L("AI đang phân tích…", "The AI is analysing…")}`;
    try {
      const j = await api("/api/lang/speak/coach", "POST", { lang: d.lang, key: it.k, heard: r.heard });
      st.tips[it.k] = `<div class="sp-tips-h">${I("spark", 15)}${L("Góp ý từ AI", "AI tips")}</div>${mdLite(j.tips)}`;
    } catch (e) { st.tips[it.k] = `<span class="err">${esc(e.message)}</span>`; }
    if (alive && items[st.idx] === it && $("#spTips")) $("#spTips").innerHTML = st.tips[it.k];
  }
  function replay() {
    const it = items[st.idx], url = it && st.audio[it.k]; if (!url) return;
    stopSpeech();
    const a = new Audio(url); a.play().catch(() => toast(L("Không phát được bản thu.", "Could not play the recording."), "err"));
  }
  function syncReadAll() { const b = $("#spReadAll"); if (b) b.querySelector("span").textContent = st.readingAll ? L("Dừng đọc", "Stop") : L("Nghe cả đoạn", "Listen to all"); const pg = $("#spPassage"); if (pg && !st.readingAll) pg.querySelectorAll(".reading").forEach((x) => x.classList.remove("reading")); }
  function readAll(i = 0) {
    const pg = $("#spPassage"); if (!pg || !st.readingAll || i >= items.length) { st.readingAll = false; syncReadAll(); return; }
    pg.querySelectorAll(".sp-ps").forEach((x, k) => x.classList.toggle("reading", k === i));
    say(items[i].t, d.speech, { rate: st.slow ? 0.6 : 0.95, onEnd: () => { if (alive && st.readingAll) readAll(i + 1); } });
  }

  main.addEventListener("click", (e) => {
    const g = e.target.closest("[data-go]"); if (g) { go(+g.dataset.go); return; }
    const sy = e.target.closest("[data-say]"); if (sy) { say(sy.dataset.say, d.speech, { rate: 0.75 }); return; }
    const w = e.target.closest(".sp-w"); if (w && !st.cap) { say(w.textContent.replace(/[.,!?;:。、，！？]+$/u, ""), d.speech, { rate: 0.8 }); return; }
    if (e.target.closest("#spPrev")) return go(st.idx - 1);
    if (e.target.closest("#spNext")) { if (st.idx >= items.length) setAppHash(hub); else go(st.idx + 1); return; }
    if (e.target.closest("#spReadAll")) { st.readingAll = !st.readingAll; syncReadAll(); if (st.readingAll) readAll(0); else stopSpeech(); return; }
    const a = e.target.closest("[data-act]"); if (!a) return;
    const act = a.dataset.act;
    if (act === "listen") listen();
    else if (act === "slow") { st.slow = !st.slow; a.classList.toggle("on", st.slow); a.setAttribute("aria-pressed", String(st.slow)); listen(); }
    else if (act === "mic" || act === "mic2") record();
    else if (act === "replay") replay();
    else if (act === "type") { st.typing = !st.typing; const f = $("#spType"); if (f) { f.hidden = !st.typing && !!SR; a.classList.toggle("on", st.typing); if (!f.hidden) f.querySelector("input").focus(); } }
    else if (act === "coach") coach();
    else if (act === "next") go(st.idx + 1);
  });
  main.addEventListener("submit", (e) => {
    const f = e.target.closest("#spType"); if (!f) return;
    e.preventDefault();
    const t = f.t.value.trim(), it = items[st.idx];
    if (t && it && !st.busy) grade(it, { text: t });
  });
  const onKey = (e) => {
    if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
    if (e.ctrlKey || e.metaKey || e.altKey || document.querySelector(".modal")) return;
    if (e.code === "Space") { e.preventDefault(); if (st.idx < items.length) record(); }
    else if (e.key === "ArrowRight") go(st.idx + 1);
    else if (e.key === "ArrowLeft") go(st.idx - 1);
    else if (e.key === "l" || e.key === "L") listen();
  };
  document.addEventListener("keydown", onKey);
  const onResize = () => wave && wave.redraw();
  window.addEventListener("resize", onResize);
  ctx.onLeave(() => {
    alive = false;
    document.removeEventListener("keydown", onKey); window.removeEventListener("resize", onResize);
    if (st.cap) st.cap.abort();
    stopSpeech();
    Object.values(st.audio).forEach((u) => URL.revokeObjectURL(u));
  });
  // Open at the first unpassed item
  const first = items.findIndex((x) => (d.best[x.k] ?? -1) < 85);
  st.idx = first < 0 ? 0 : first;
  paintDots(); paintCard();
}

/* ================= AI conversation ================= */
export async function pageSpeakChat(main, [langId, sceneId], query, ctx) {
  main.innerHTML = `<div class="lx-loading"><span class="spin"></span> ${L("Đang tải…", "Loading…")}</div>`;
  let d;
  try { d = await load(langId); } catch (e) { if (ctx.isCurrent()) fail(main, e.message); return; }
  if (!ctx.isCurrent()) return;
  if (getSubject() !== d.lang) setSubject(d.lang);
  const open = d.levels.filter((l) => !l.locked);
  const lvKey = `pl:speak:lv:${d.lang}`;
  let lv = open.find((l) => l.id === query.cap) || open.find((l) => l.id === ls.get(lvKey, "")) || open[0] || d.levels[0];
  const sc = d.scenarios.find((s) => s.id === sceneId) || (d.interviews || []).find((s) => s.id === sceneId) || d.scenarios[0];
  const hub = `/app/ngoai-ngu/luyen-noi/${d.lang}?cap=${lv.id}`;
  ctx.setCrumbs([[d.name, hub], [L("Màn hình chat AI", "AI Conversation")]]);

  const st = { msgs: [], busy: false, cap: null, showVi: ls.get("pl:speak:vi", "1") === "1", auto: ls.get("pl:speak:auto", "1") === "1", quota: d.ai.quota, hints: [] };
  let alive = true;
  const reset = () => { st.msgs = sc.open.t ? [{ role: "assistant", t: sc.open.t, r: sc.open.r, m: sc.open.m }] : []; st.hints = []; };
  reset();

  main.innerHTML = `
  <div class="sp sp-chat" style="--c:${esc(d.color)}">
    <div class="sp-chat-coach">
      <img class="sp-chat-coach-avatar" src="/img/kit/chibi-owl.webp" width="52" height="52" alt="" loading="lazy" decoding="async">
      <div class="sp-chat-coach-info">
        <b>Rivo · ${esc(d.name)} Coach</b>
        <span>${L("Tình huống", "Scenario")}: ${esc(sc.title)}</span>
      </div>
    </div>
    <header class="sp-top">
      <a class="sp-back" href="${hub}" aria-label="${L("Về phòng luyện nói", "Back to the studio")}">${I("left", 20)}</a>
      <span class="sp-scene-ico">${I(sc.icon, 20)}</span>
      <div class="sp-top-t"><b>${esc(sc.title)}</b><span>${d.flag} ${esc(d.name)} · ${esc(sc.desc)}</span></div>
      <div class="sp-chat-tools">
        <select class="sp-select" id="spLv" aria-label="${L("Cấp độ", "Level")}">${d.levels.map((l) => `<option value="${l.id}" ${l.id === lv.id ? "selected" : ""} ${l.locked ? "disabled" : ""}>${esc(l.title)}${l.locked ? " (Pro)" : ""}</option>`).join("")}</select>
        <button type="button" class="sp-tool ${st.showVi ? "on" : ""}" id="spVi" aria-pressed="${st.showVi}" title="${L("Bật/Tắt dịch", "Toggle translation")}">${I("lang", 18)}</button>
        <button type="button" class="sp-tool ${st.auto ? "on" : ""}" id="spAuto" aria-pressed="${st.auto}" title="${L("Tự đọc câu trả lời của AI", "Read AI replies aloud")}">${I("vol", 18)}</button>
        <button type="button" class="sp-tool" id="spReset" title="${L("Bắt đầu lại", "Start over")}">${I("redo", 18)}</button>
      </div>
    </header>
    ${d.ai.enabled ? "" : `<div class="sp-note warn">${I("spark", 18)}<span>${L("Trợ lý AI tạm thời chưa sẵn sàng nên chưa trả lời được. Bạn thử lại sau nhé.", "The AI assistant is temporarily unavailable, so it cannot reply right now. Please try again later.")}</span></div>`}
    <div class="sp-msgs" id="spMsgs" aria-live="polite"></div>
    <div class="sp-dock">
      <div class="sp-hints" id="spHints"></div>
      <form class="sp-chatbar" id="spForm">
        <button type="button" class="sp-mic sm" id="spMic" aria-label="${L("Nói", "Speak")}">${I("mic", 24)}</button>
        <input class="input lx-vi" name="q" id="spIn" maxlength="500" autocomplete="off" placeholder="${L(`Nói hoặc gõ bằng ${d.name}…`, `Speak or type in ${d.name}…`)}">
        <button class="btn btn-primary sp-send" type="submit" aria-label="${L("Gửi", "Send")}">${I("send", 18)}</button>
      </form>
      <p class="sp-quota" id="spQuota"></p>
    </div>
  </div>`;
  const $ = (s) => main.querySelector(s);
  const box = $("#spMsgs"), input = $("#spIn");

  const msgHtml = (m, i) => m.role === "assistant"
    ? `<div class="sp-msg ai"><span class="sp-av">${I("spark", 17)}</span><div class="sp-bub">
        <div class="sp-say lx-vi" lang="${esc(d.speech)}">${mdLite(m.t)}</div>
        ${m.r ? `<div class="sp-rd lx-vi">${mdLite(m.r)}</div>` : ""}
        ${m.m ? `<div class="sp-tr lx-vi" ${st.showVi ? "" : "hidden"}>${mdLite(m.m)}</div>` : ""}
        <div class="sp-bub-act"><button type="button" class="sp-mini" data-say="${i}" aria-label="${L("Nghe", "Listen")}">${I("vol", 15)}</button><button type="button" class="sp-mini sp-txt" data-slow="${i}" aria-label="${L("Nghe chậm", "Listen slowly")}">0.6×</button></div>
      </div></div>`
    : `<div class="sp-msg me"><div class="sp-bub"><p class="lx-vi">${esc(m.t)}</p></div></div>
       ${m.fix ? (m.fix.ok ? `<div class="sp-fix ok">${I("check", 15)}${L("Câu tự nhiên, tốt lắm!", "Natural sentence, well done!")}</div>` : `<div class="sp-fix no"><span class="sp-fix-h">${I("spark", 15)}${L("Nên nói", "Better")}</span><b class="lx-vi" lang="${esc(d.speech)}">${mdInline(m.fix.better)}</b><button type="button" class="sp-mini" data-sayfix="${i}" aria-label="${L("Nghe câu đúng", "Hear the correction")}">${I("vol", 15)}</button>${m.fix.note ? `<span class="sp-fix-n lx-vi">${mdInline(m.fix.note)}</span>` : ""}</div>`) : ""}`;
  function paint(scroll = true) {
    box.innerHTML = st.msgs.map(msgHtml).join("") + (st.busy ? `<div class="sp-msg ai"><span class="sp-av">${I("spark", 17)}</span><div class="sp-bub sp-typing"><i></i><i></i><i></i></div></div>` : "");
    $("#spHints").innerHTML = st.hints.length && !st.busy ? `<span class="sp-hints-l">${L("Gợi ý trả lời", "You could say")}</span>${st.hints.map((h, i) => `<button type="button" class="sp-hint lx-vi" data-hint="${i}">${mdInline(h)}</button>`).join("")}` : "";
    const q = st.quota;
    $("#spQuota").innerHTML = !d.ai.enabled || !q || !q.limits ? "" : q.allowed === false ? `<span class="err">${esc(q.reason)}</span> ${S.me && S.me.role !== "admin" ? `<a href="/app/bang-gia">${L("Nâng cấp Pro", "Upgrade to Pro")}</a>` : ""}` : L(`Còn ${q.remaining.day}/${q.limits.day} lượt AI hôm nay`, `${q.remaining.day}/${q.limits.day} AI turns left today`);
    if (scroll) requestAnimationFrame(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" }));
  }

  async function send(text) {
    text = String(text || "").trim();
    if (!text || st.busy) return;
    stopSpeech();
    const history = st.msgs.map((m) => ({ role: m.role, content: m.t }));
    const mine = { role: "user", t: text };
    st.msgs.push(mine); st.busy = true; st.hints = []; input.value = ""; paint();
    try {
      const r = await api("/api/lang/speak/chat", "POST", { lang: d.lang, level: lv.id, scenario: sc.id, history, message: text });
      if (!alive) return;
      mine.fix = r.fix;
      st.msgs.push({ role: "assistant", t: r.reply, r: r.reading, m: r.vi });
      st.hints = r.hints || []; st.quota = r.quota || st.quota;
      st.busy = false; paint();
      if (st.auto) say(r.reply, d.speech);
    } catch (e) {
      if (!alive) return;
      st.msgs.pop(); st.busy = false; input.value = text; paint(false);
      toast(e.message, "err", 6000);
      if (e.status === 402) st.quota = { ...(st.quota || {}), allowed: false, reason: e.message, limits: (st.quota && st.quota.limits) || { day: 0 }, remaining: { day: 0 } }, paint(false);
    }
  }
  function micUi(on) {
    const b = $("#spMic");
    b.classList.toggle("rec", on);
    b.innerHTML = on ? I("stop", 24) : I("mic", 24);
    b.setAttribute("aria-label", on ? L("Dừng thu", "Stop") : L("Nói", "Speak"));
  }
  async function talk() {
    if (st.busy) return;
    micLog("chat talk() pressed, busy:", st.busy, "cap active:", !!st.cap);
    if (st.cap) { st.cap.stop(); return; }
    if (!SR && !MOBILE) { toast(L("Trình duyệt này chưa hỗ trợ nhận giọng nói. Hãy dùng Chrome / Edge, hoặc gõ câu trả lời.", "This browser cannot recognise speech. Use Chrome / Edge, or type your answer."), "info"); input.focus(); return; }
    if (!window.isSecureContext) { toast(L("Micro chỉ dùng được khi trang chạy bằng https:// (hoặc localhost).", "The microphone only works over https:// (or localhost)."), "err"); return; }
    stopSpeech(); micUi(true); input.value = ""; input.placeholder = L("Đang nghe… tự dừng khi dứt câu", "Listening… auto-stops at sentence end");
    const cap = st.cap = startCapture(d.speech, { record: false, onInterim: (t) => { input.value = t; }, maxMs: 25000, silenceMs: 1400, noSpeechMs: 7500 });
    let out;
    try { out = await cap.done; }
    catch (e) { micLog("capture crashed:", e && e.message); out = { text: "", alts: [], error: "start" }; }
    finally { if (st.cap === cap) st.cap = null; }
    if (out && out.audioUrl) URL.revokeObjectURL(out.audioUrl);
    if (!alive) return;
    micUi(false); input.placeholder = L(`Nói hoặc gõ bằng ${d.name}…`, `Speak or type in ${d.name}…`);
    if (out.error === "aborted") return;
    if (!out.text) { toast(MIC_ERR()[out.error] || L("Không nghe rõ, thử lại nhé.", "Could not hear you clearly. Please try again."), out.error === "no-speech" ? "info" : "err"); return; }
    input.value = out.text;
    send(out.text);
  }

  main.addEventListener("click", (e) => {
    let b = e.target.closest("[data-say]"); if (b) return void say(st.msgs[+b.dataset.say].t, d.speech);
    b = e.target.closest("[data-slow]"); if (b) return void say(st.msgs[+b.dataset.slow].t, d.speech, { rate: 0.6 });
    b = e.target.closest("[data-sayfix]"); if (b) return void say(st.msgs[+b.dataset.sayfix].fix.better, d.speech, { rate: 0.85 });
    b = e.target.closest("[data-hint]"); if (b) { const h = st.hints[+b.dataset.hint]; input.value = h; input.focus(); say(h, d.speech, { rate: 0.85 }); return; }
    if (e.target.closest("#spMic")) return void talk();
    if (e.target.closest("#spVi")) { st.showVi = !st.showVi; ls.set("pl:speak:vi", st.showVi ? "1" : "0"); $("#spVi").classList.toggle("on", st.showVi); $("#spVi").setAttribute("aria-pressed", String(st.showVi)); paint(false); return; }
    if (e.target.closest("#spAuto")) { st.auto = !st.auto; ls.set("pl:speak:auto", st.auto ? "1" : "0"); $("#spAuto").classList.toggle("on", st.auto); $("#spAuto").setAttribute("aria-pressed", String(st.auto)); if (!st.auto) stopSpeech(); return; }
    if (e.target.closest("#spReset")) { if (st.cap) st.cap.abort(); stopSpeech(); st.busy = false; reset(); paint(false); return; }
  });
  $("#spForm").addEventListener("submit", (e) => { e.preventDefault(); send(input.value); });
  $("#spLv").addEventListener("change", (e) => { const n = d.levels.find((l) => l.id === e.target.value); if (n && !n.locked) { lv = n; ls.set(lvKey, lv.id); toast(L(`AI sẽ dùng từ ngữ cấp ${lv.title}.`, `The AI will now use ${lv.title} language.`), "info", 2500); } });
  ctx.onLeave(() => { alive = false; if (st.cap) st.cap.abort(); stopSpeech(); });
  paint(false);
}
