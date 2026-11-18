import { currentLang } from "./i18n.js";
import { trServerMsg } from "./msg-en.js";
/* LifeRivo 2.0 — shared core: state, API, utilities, toast, modal */

export const S = {
  me: null,
  csrf: "",
  scores: null,
  chapters: [],
  groups: [],
  paths: [],
  topics: [],
  chapters: [], groups: [], paths: [], // dữ liệu bài tập đã gỡ: giữ rỗng để các hàm dùng chung không lỗi
  exams: null, // exam state per chapter
  prefs: null, // personal settings synced with server
  cfg: {}, // system settings configured by teacher
  version: "",
  ai: null, // /api/ai/status: enabled, configured, allowed
  loaded: false,
};
// AI buttons and automatic notes only when the server has a working tutor.
// `allowed === false` means the feature exists but this account is out of quota.
export function aiOn() { return !!(S.ai && S.ai.enabled && S.ai.configured); }
export function aiAuto() { return aiOn() && S.ai.allowed !== false; }
export async function refreshAiStatus() {
  try { S.ai = await api("/api/ai/status"); }
  catch { S.ai = { enabled: false, configured: false, allowed: false }; }
}

export function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export async function api(path, method = "GET", body, options = {}) {
  let r;
  // Timeout mac dinh 35s: neu may chu khong tra loi (AI cham/treo) thi bao loi ro rang thay vi quay vong tron mai.
  const timeoutMs = options.timeoutMs || 35000;
  const signal = options.signal || (typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(timeoutMs) : undefined);
  try {
    r = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-Lang": currentLang(), ...(S.csrf ? { "X-CSRF-Token": S.csrf } : {}), ...(options.headers || {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...(signal ? { signal } : {}),
    });
  } catch (e) {
    if (e && (e.name === "AbortError" || e.name === "TimeoutError")) {
      throw new Error(trServerMsg("Máy chủ phản hồi chậm quá (hết thời gian chờ). Bạn thử gửi lại nhé.", currentLang()));
    }
    throw new Error(trServerMsg("Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.", currentLang()));
  }
  const j = await r.json().catch(() => ({ error: "Máy chủ trả về dữ liệu không đọc được." }));
  if (!r.ok) {
    if (r.status === 503 && j.maintenance) window.dispatchEvent(new Event("pl:maintenance"));
    if (r.status === 401 && S.me && !/\/api\/(login|register)$/.test(path)) window.dispatchEvent(new Event("pl:session-expired"));
    const err = new Error(trServerMsg(j.error || "Có lỗi xảy ra.", currentLang()));
    err.status = r.status;
    throw err;
  }
  return j;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Display locale follows selected language: English numbers/dates use en-US format,
// Vietnamese keeps vi-VN (currency unchanged: vnd() still appends "d" as before).
export const loc = () => (currentLang() === "en" ? "en-US" : "vi-VN");
// Translate server messages to EN when EN is selected (msg-en.js returns
// the original string if no translation exists, so it is safe to call on any string).
export function trMsg(m) { return trServerMsg(m, currentLang()); }
export function fmtN(n) { return Number(n || 0).toLocaleString(loc()); }
export function fmtDate(iso, withTime = true) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(loc(), withTime
    ? { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "2-digit", year: "numeric" });
}
export function timeAgo(iso) {
  const t = new Date(iso).getTime();
  if (!t) return "";
  const s = Math.round((Date.now() - t) / 1000);
  const en = currentLang() === "en";
  if (s < 60) return en ? "just now" : "vừa xong";
  const m = Math.floor(s / 60);
  if (s < 3600) return en ? (m === 1 ? "1 min ago" : m + " min ago") : m + " phút trước";
  const h = Math.floor(s / 3600);
  if (s < 86400) return en ? (h === 1 ? "1 hour ago" : h + " hours ago") : h + " giờ trước";
  const d = Math.floor(s / 86400);
  if (s < 86400 * 7) return en ? (d === 1 ? "1 day ago" : d + " days ago") : d + " ngày trước";
  return fmtDate(iso, false);
}
export function initials(name) {
  const parts = String(name || "?").trim().split(/\s+/);
  const a = parts[parts.length - 1] || "?";
  return (a[0] || "?").toUpperCase();
}
const AV_COLORS = ["#5B3FD6", "#0E7C86", "#C2410C", "#1D6FD1", "#9D2B8C", "#3F7D20", "#B4232F", "#6B4E16"];
export function avatarColor(seed) {
  let h = 0; for (const ch of String(seed || "")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AV_COLORS[h % AV_COLORS.length];
}
export function avatar(name, seed) {
  return `<span class="avatar" style="background:${avatarColor(seed || name)}" aria-hidden="true">${esc(initials(name))}</span>`;
}

/* ---------- Icons (stroke, 24px) ---------- */
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  route: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H16a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h7.5"/>',
  flask: '<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  settings: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  send: '<path d="M4 12 20 4l-6 16-3-7z"/><path d="m11 13 9-9"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v6h6"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  logout: '<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4M6 12h11"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  print: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  sparkle: '<path d="M12 2c.8 4.8 3.2 7.2 8 8-4.8.8-7.2 3.2-8 8-.8-4.8-3.2-7.2-8-8 4.8-.8 7.2-3.2 8-8z"/>',
  file: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/>',
  lesson: '<path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v6h6M12 8v4l3 2"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  chart: '<path d="M4 19V5M4 19h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 19a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 19c1.5-2.2 3.8-3.2 5.5-3.2"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M6 3v16"/>',
  edit: '<path d="M4 20h4l10-10-4-4L4 16z"/><path d="m12 6 4 4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  database: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  sliders: '<path d="M4 8h10M18 8h2M4 16h4M12 16h8"/><circle cx="16" cy="8" r="2"/><circle cx="10" cy="16" r="2"/>',
  keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h0M10 10h0M14 10h0M18 10h0M7 14h10"/>',
  "life-buoy": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24m0-14.14-4.24 4.24m-5.66 5.66-4.24 4.24"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  command: '<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3z"/>',
  translate: '<path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1"/><path d="m22 22-5-10-5 10M14 18h6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z"/>',
  "external-link": '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/>',
  "book-open": '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  bot: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9.5 13h.01M14.5 13h.01M10 16h4"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
  "cat-learn": '<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M6 3v16"/>',
  "cat-achieve": '<path d="M6 4h12v5a6 6 0 0 1-12 0z"/><path d="M6 6H3v2a3 3 0 0 0 3 3M18 6h3v2a3 3 0 0 1-3 3M12 15v5M8 20h8"/>',
  "cat-acct": '<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  "cat-admin": '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
};
// Biểu tượng nét đơn, không có nhân vật: dùng ở thanh trên để giao diện gọn
export function lineIcon(name, extra = "") {
  return `<svg class="line-ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${P[name] || ""}</svg>`;
}
export function icon(name, extra = "") {
  if (typeof document !== "undefined" && document.body?.classList.contains("ax-on")) {
    return lineIcon(name, extra);
  }
  if (SKETCH_ICONS[name]) {
    return `<svg class="sk-ic chibi-ic" width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true" ${extra}>${SKETCH_ICONS[name]}</svg>`;
  }
  return `<svg class="chibi-ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${P[name] || ""}</svg>`;
}

/* Cel-shaded Multi-Species 2D Chibi Character Engine (18 species x 6 moods x 7 hats)
   Zero repeated clones: distinct ears/hair, expressions, accessories & props! */
const CHIBI_EYES = (mood = "happy", x1 = 11.6, x2 = 20.4, y = 15.4) => {
  if (mood === "wink") {
    return `<ellipse cx="${x1}" cy="${y}" rx="1.75" ry="2.05" fill="#4A3728"/><ellipse cx="${x1}" cy="${y + .7}" rx="1.15" ry=".75" fill="#8D6346"/><circle cx="${x1 - .5}" cy="${y - .75}" r=".78" fill="#FFFDF9"/><path d="M${x2 - 2} ${y + .3}q2-2.2 4 0" stroke="#4A3728" stroke-width="1.8" stroke-linecap="round"/>`;
  }
  if (mood === "joy") {
    return `<path d="M${x1 - 2} ${y + .5}q2-2.3 4 0" stroke="#4A3728" stroke-width="1.85" stroke-linecap="round"/><path d="M${x2 - 2} ${y + .5}q2-2.3 4 0" stroke="#4A3728" stroke-width="1.85" stroke-linecap="round"/>`;
  }
  if (mood === "sparkle") {
    return `<path d="m${x1} ${y - 2.3} .7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" fill="#4A3728"/><circle cx="${x1 - .4}" cy="${y - .6}" r=".55" fill="#FFFDF9"/><path d="m${x2} ${y - 2.3} .7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" fill="#4A3728"/><circle cx="${x2 - .4}" cy="${y - .6}" r=".55" fill="#FFFDF9"/>`;
  }
  if (mood === "glasses") {
    return `<circle cx="${x1}" cy="${y}" r="3.1" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.5"/><circle cx="${x2}" cy="${y}" r="3.1" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.5"/><path d="M${x1 + 3.1} ${y}h${x2 - x1 - 6.2}" stroke="#4A3728" stroke-width="1.4"/><circle cx="${x1}" cy="${y + .1}" r="1.35" fill="#4A3728"/><circle cx="${x2}" cy="${y + .1}" r="1.35" fill="#4A3728"/><circle cx="${x1 - .5}" cy="${y - .5}" r=".55" fill="#FFFDF9"/><circle cx="${x2 - .5}" cy="${y - .5}" r=".55" fill="#FFFDF9"/>`;
  }
  if (mood === "cool") {
    return `<rect x="${x1 - 3.2}" y="${y - 1.9}" width="6.2" height="3.8" rx="1.4" fill="#4A3728"/><rect x="${x2 - 3}" y="${y - 1.9}" width="6.2" height="3.8" rx="1.4" fill="#4A3728"/><path d="M${x1 + 3} ${y - .4}h${x2 - x1 - 6}" stroke="#4A3728" stroke-width="1.5"/><path d="M${x1 - 1.6} ${y - .8}l2 1.8" stroke="#FFFDF9" stroke-width="1" stroke-linecap="round"/><path d="M${x2 - 1.4} ${y - .8}l2 1.8" stroke="#FFFDF9" stroke-width="1" stroke-linecap="round"/>`;
  }
  return `<ellipse cx="${x1}" cy="${y}" rx="1.75" ry="2.05" fill="#4A3728"/><ellipse cx="${x1}" cy="${y + .7}" rx="1.15" ry=".75" fill="#8D6346"/><circle cx="${x1 - .5}" cy="${y - .75}" r=".78" fill="#FFFDF9"/><circle cx="${x1 + .55}" cy="${y + .65}" r=".38" fill="#FFFDF9"/><ellipse cx="${x2}" cy="${y}" rx="1.75" ry="2.05" fill="#4A3728"/><ellipse cx="${x2}" cy="${y + .7}" rx="1.15" ry=".75" fill="#8D6346"/><circle cx="${x2 - .5}" cy="${y - .75}" r=".78" fill="#FFFDF9"/><circle cx="${x2 + .55}" cy="${y + .65}" r=".38" fill="#FFFDF9"/>`;
};

const CHIBI_HAT = (hat = "") => {
  if (hat === "crown") return `<path d="m11.2 7.2 1.3-3.8 3.5 2.3 3.5-2.3 1.3 3.8z" fill="#FACC15" stroke="#4A3728" stroke-width="1.5" stroke-linejoin="round"/>`;
  if (hat === "grad") return `<path d="m8.2 7.4 7.8-3.6 7.8 3.6-7.8 3.6z" fill="#4A3728" stroke="#4A3728" stroke-width="1.3" stroke-linejoin="round"/><path d="M22.5 8v3.6" stroke="#FACC15" stroke-width="1.5" stroke-linecap="round"/>`;
  if (hat === "beret") return `<ellipse cx="17" cy="6.6" rx="7.6" ry="3.2" transform="rotate(8 17 6.6)" fill="#F472B6" stroke="#4A3728" stroke-width="1.6"/><path d="M17.5 3.4V2" stroke="#4A3728" stroke-width="1.6" stroke-linecap="round"/>`;
  if (hat === "bow") return `<path d="m16 6.8-4-2.2v4.4zm0 0 4-2.2v4.4z" fill="#F472B6" stroke="#4A3728" stroke-width="1.4" stroke-linejoin="round"/><circle cx="16" cy="6.8" r="1.4" fill="#FEF08A" stroke="#4A3728" stroke-width="1.2"/>`;
  if (hat === "headset") return `<path d="M5.4 15.2a10.6 10.6 0 0 1 21.2 0" stroke="#7C3AED" stroke-width="2.3" stroke-linecap="round"/><rect x="3.4" y="12.5" width="3.4" height="6" rx="1.6" fill="#DDD6FE" stroke="#4A3728" stroke-width="1.5"/><rect x="25.2" y="12.5" width="3.4" height="6" rx="1.6" fill="#DDD6FE" stroke="#4A3728" stroke-width="1.5"/>`;
  if (hat === "leaf") return `<path d="M16 6.4V3.4" stroke="#4A3728" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="18.6" cy="3.6" rx="2.8" ry="1.4" transform="rotate(-18 18.6 3.6)" fill="#4ADE80" stroke="#4A3728" stroke-width="1.4"/>`;
  if (hat === "halo") return `<ellipse cx="16" cy="3.8" rx="5.5" ry="1.6" stroke="#FACC15" stroke-width="1.8"/>`;
  return "";
};

const CHIBI_FACE = (fill, species = "cat", prop = "", suit = "#FFE4EC", mood = "happy", hat = "") => {
  const ears = species === "bunny"
    ? `<ellipse cx="10.2" cy="6.6" rx="3" ry="6" transform="rotate(-12 10.2 6.6)" fill="${fill}" stroke="#4A3728" stroke-width="2"/><ellipse cx="21.8" cy="6.6" rx="3" ry="6" transform="rotate(12 21.8 6.6)" fill="${fill}" stroke="#4A3728" stroke-width="2"/><ellipse cx="10.2" cy="7.2" rx="1.35" ry="3.4" transform="rotate(-12 10.2 7.2)" fill="#FBCFE8"/><ellipse cx="21.8" cy="7.2" rx="1.35" ry="3.4" transform="rotate(12 21.8 7.2)" fill="#FBCFE8"/>`
    : species === "lopbunny"
    ? `<ellipse cx="5.2" cy="14.5" rx="2.6" ry="5.6" transform="rotate(16 5.2 14.5)" fill="${fill}" stroke="#4A3728" stroke-width="1.9"/><ellipse cx="26.8" cy="14.5" rx="2.6" ry="5.6" transform="rotate(-16 26.8 14.5)" fill="${fill}" stroke="#4A3728" stroke-width="1.9"/>`
    : species === "bear" || species === "polar"
    ? `<circle cx="8.2" cy="8.2" r="3.6" fill="${fill}" stroke="#4A3728" stroke-width="2"/><circle cx="23.8" cy="8.2" r="3.6" fill="${fill}" stroke="#4A3728" stroke-width="2"/><circle cx="8.2" cy="8.2" r="1.7" fill="${species === "polar" ? "#BAE6FD" : "#FDBA74"}"/><circle cx="23.8" cy="8.2" r="1.7" fill="${species === "polar" ? "#BAE6FD" : "#FDBA74"}"/>`
    : species === "panda"
    ? `<circle cx="8.2" cy="8.2" r="3.6" fill="#4A3728"/><circle cx="23.8" cy="8.2" r="3.6" fill="#4A3728"/>`
    : species === "chick"
    ? `<path d="M14.5 6.4c-1.1-2.8 1.4-4.2 2.5-1.8 1-1.9 3.2-.7 1.8 2" fill="${fill}" stroke="#4A3728" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`
    : species === "owl"
    ? `<path d="M6.8 10.2 5.2 4.8l5 2.4M25.2 10.2l1.6-5.4-5 2.4" fill="${fill}" stroke="#4A3728" stroke-width="2" stroke-linejoin="round"/>`
    : species === "fox" || species === "shiba"
    ? `<path d="M7.2 12.2 5.6 4.2l6.2 4M24.8 12.2l1.6-8-6.2 4" fill="${species === "fox" ? "#FB923C" : fill}" stroke="#4A3728" stroke-width="2" stroke-linejoin="round"/><path d="M8.1 10.2 7.2 6.5l3.2 2M23.9 10.2l.9-3.7-3.2 2" fill="#FEF08A"/>`
    : species === "frog"
    ? `<circle cx="10.2" cy="7.5" r="3.4" fill="${fill}" stroke="#4A3728" stroke-width="2"/><circle cx="21.8" cy="7.5" r="3.4" fill="${fill}" stroke="#4A3728" stroke-width="2"/>`
    : species === "piggy"
    ? `<path d="M6.8 11.4 5.5 5.4l5.2 3M25.2 11.4l1.3-6-5.2 3" fill="#F9A8D4" stroke="#4A3728" stroke-width="2" stroke-linejoin="round"/>`
    : species === "dino"
    ? `<path d="m11.5 6.8 2-3 2 2.4 2-2.6 2 3.2" fill="#FDE047" stroke="#4A3728" stroke-width="1.8" stroke-linejoin="round"/>`
    : species === "unicorn"
    ? `<path d="m14.2 6.6 1.8-4.8 1.8 4.8z" fill="#FACC15" stroke="#4A3728" stroke-width="1.6" stroke-linejoin="round"/><path d="M7 11.4 6 5.6l4.8 3M25 11.4l1-5.8-4.8 3" fill="${fill}" stroke="#4A3728" stroke-width="1.9" stroke-linejoin="round"/><circle cx="11.5" cy="7.6" r="2" fill="#F9A8D4"/>`
    : species === "girl"
    ? `<circle cx="7.4" cy="7.8" r="3.3" fill="#4A3728"/><circle cx="24.6" cy="7.8" r="3.3" fill="#4A3728"/><circle cx="7.4" cy="9.6" r="1.2" fill="#F472B6"/><circle cx="24.6" cy="9.6" r="1.2" fill="#F472B6"/>`
    : species === "boy" || species === "penguin"
    ? ``
    : `<path d="M7.4 12.2 6.4 4.6l5.6 3.6M24.6 12.2l1-7.6-5.6 3.6" fill="${species === "calico" ? "#FDBA74" : fill}" stroke="#4A3728" stroke-width="2" stroke-linejoin="round"/><path d="M8.2 10.4 7.7 6.7l3 2M23.8 10.4l.5-3.7-3 2" fill="#FBCFE8"/>`;

  const faceDecor = species === "panda"
    ? `<ellipse cx="11.6" cy="15.3" rx="3" ry="3.4" transform="rotate(-14 11.6 15.3)" fill="#4A3728"/><ellipse cx="20.4" cy="15.3" rx="3" ry="3.4" transform="rotate(14 20.4 15.3)" fill="#4A3728"/><circle cx="11.8" cy="15" r="1.2" fill="#FFFDF9"/><circle cx="20.2" cy="15" r="1.2" fill="#FFFDF9"/>`
    : species === "frog"
    ? `<circle cx="10.2" cy="7.5" r="1.4" fill="#4A3728"/><circle cx="21.8" cy="7.5" r="1.4" fill="#4A3728"/><circle cx="9.8" cy="7" r=".55" fill="#fff"/><circle cx="21.4" cy="7" r=".55" fill="#fff"/>`
    : species === "calico"
    ? `<path d="M18.5 7.4c3.6 1.2 6.2 3.8 6.4 7-2.8 0-5.2-1.8-6.4-7z" fill="#FDBA74" opacity=".9"/>${CHIBI_EYES(mood)}`
    : species === "penguin"
    ? `<path d="M7.2 17c0-5 4-8.2 8.8-8.2s8.8 3.2 8.8 8.2c0 3.4-3.2 6.4-8.8 6.4S7.2 20.4 7.2 17z" fill="#FFFDF9"/>${CHIBI_EYES(mood)}`
    : species === "girl" || species === "boy"
    ? `<path d="M6.2 13.8c2-5.4 17.6-5.4 19.6 0-3-2-6.2-.5-9.8-2.2-3.6 1.7-6.8.2-9.8 2.2z" fill="#4A3728"/>${CHIBI_EYES(mood)}`
    : CHIBI_EYES(mood);

  const snout = species === "bear" || species === "polar" || species === "shiba" || species === "fox"
    ? `<ellipse cx="16" cy="18.2" rx="4.2" ry="2.7" fill="#FFFDF9"/><path d="M15.1 17.1q.9-.8 1.8 0-.9 1.1-1.8 0z" fill="#4A3728"/>`
    : species === "piggy"
    ? `<ellipse cx="16" cy="17.8" rx="3.3" ry="2.2" fill="#F472B6" stroke="#4A3728" stroke-width="1.3"/><circle cx="14.9" cy="17.8" r=".6" fill="#4A3728"/><circle cx="17.1" cy="17.8" r=".6" fill="#4A3728"/>`
    : species === "chick" || species === "owl" || species === "penguin"
    ? `<path d="m14.4 16.8 1.6 2.1 1.6-2.1z" fill="#FB923C" stroke="#4A3728" stroke-width="1.3" stroke-linejoin="round"/>`
    : ``;

  const mouth = (species === "chick" || species === "owl" || species === "penguin" || species === "piggy")
    ? ""
    : mood === "joy"
    ? `<path d="M14 18.2c.6 1.8 3.4 1.8 4 0z" fill="#F472B6" stroke="#4A3728" stroke-width="1.3" stroke-linejoin="round"/>`
    : `<path d="M14.3 18q.85 1 1.7 0 .85 1 1.7 0" stroke="#4A3728" stroke-width="1.5" stroke-linecap="round"/>`;

  const body = species === "ghost"
    ? `<path d="M6.4 15.8C6.4 9.5 10.6 6.4 16 6.4s9.6 3.1 9.6 9.4v10.8l-2.6-2-2.4 2-2.6-2-2 2-2.6-2-2.4 2-2.6-2z" fill="${fill}" stroke="#4A3728" stroke-width="2.1" stroke-linejoin="round"/>`
    : `<path d="M9 28.5c.4-4.2 3.2-6.2 7-6.2s6.6 2 7 6.2z" fill="${suit}" stroke="#4A3728" stroke-width="2" stroke-linejoin="round"/><path d="M5.4 16.4C5.4 9.8 10 6.4 16 6.4s10.6 3.4 10.6 10c0 5-4.3 7.6-10.6 7.6S5.4 21.4 5.4 16.4Z" fill="${fill}" stroke="#4A3728" stroke-width="2.1"/>`;

  return `${ears}${body}
    <path d="M10.4 9.5c2.8-1.4 8.4-1.4 11.2 0" stroke="#FFFDF9" stroke-width="2.2" stroke-linecap="round" opacity=".78"/>
    ${CHIBI_HAT(hat)}${snout}${faceDecor}
    <ellipse cx="8.6" cy="17.8" rx="1.9" ry="1" fill="#FDA4AF" opacity=".92"/><ellipse cx="23.4" cy="17.8" rx="1.9" ry="1" fill="#FDA4AF" opacity=".92"/>
    ${mouth}
    <circle cx="8.6" cy="24.5" r="2.1" fill="${fill}" stroke="#4A3728" stroke-width="1.6"/>
    <circle cx="23.4" cy="24.5" r="2.1" fill="${fill}" stroke="#4A3728" stroke-width="1.6"/>${prop}`;
};
const SKETCH_ICONS = {
  "cat-learn": CHIBI_FACE("#FFFDF9", "calico", '<rect x="9" y="21.5" width="14" height="7.8" rx="2.4" fill="#FEF08A" stroke="#4A3728" stroke-width="1.8"/><path d="M16 21.7v7.4M11.4 24.4h2.5M18.1 24.4h2.5" stroke="#4A3728" stroke-width="1.4" stroke-linecap="round"/>', "#BAE6FD", "sparkle", "beret"),
  "cat-achieve": CHIBI_FACE("#FDE68A", "bear", '<path d="M16 20 17.5 23l3.3.5-2.4 2.3.6 3.3L16 27.6 13 29.1l.6-3.3-2.4-2.3 3.3-.5z" fill="#FACC15" stroke="#4A3728" stroke-width="1.6" stroke-linejoin="round"/>', "#FBCFE8", "joy", "crown"),
  "cat-acct": CHIBI_FACE("#FED7AA", "shiba", '<rect x="17.2" y="20.5" width="11" height="8" rx="2.5" fill="#BAE6FD" stroke="#4A3728" stroke-width="1.7"/><path d="M19.8 24.5h5.8" stroke="#4A3728" stroke-width="1.5" stroke-linecap="round"/>', "#DCFCE7", "wink"),
  "cat-admin": CHIBI_FACE("#FCE7F3", "lopbunny", '<circle cx="23.5" cy="24" r="4.6" fill="#DDD6FE" stroke="#4A3728" stroke-width="1.7"/><circle cx="23.5" cy="24" r="1.6" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.4"/>', "#FEF08A", "happy", "bow"),
  home: CHIBI_FACE("#FFFDF9", "cat", '<path d="m16 1.8 4 4.2h-8z" fill="#F472B6" stroke="#4A3728" stroke-width="1.6" stroke-linejoin="round"/><rect x="12.6" y="22.5" width="6.8" height="6.2" rx="2" fill="#FDE047" stroke="#4A3728" stroke-width="1.6"/>', "#FBCFE8", "joy", "leaf"),
  route: CHIBI_FACE("#FFFDF9", "fox", '<path d="M22.2 17.5v11.5" stroke="#4A3728" stroke-width="1.8" stroke-linecap="round"/><path d="M22.2 17.8l7.2 2.8-7.2 3z" fill="#BAE6FD" stroke="#4A3728" stroke-width="1.6" stroke-linejoin="round"/>', "#DCFCE7", "wink"),
  flag: CHIBI_FACE("#FEF08A", "chick", '<path d="M23 16.5v13" stroke="#4A3728" stroke-width="1.8" stroke-linecap="round"/><path d="M23 16.8h6.8l-2 2.6 2 2.6H23z" fill="#F472B6" stroke="#4A3728" stroke-width="1.6" stroke-linejoin="round"/>', "#BAE6FD", "joy"),
  mic: CHIBI_FACE("#FFFDF9", "panda", '<rect x="20.4" y="18.2" width="6.2" height="9.4" rx="3.1" fill="#A7F3D0" stroke="#4A3728" stroke-width="1.7"/><path d="M23.5 27.6v2.2" stroke="#4A3728" stroke-width="1.7" stroke-linecap="round"/>', "#DDD6FE", "joy", "headset"),
  play: CHIBI_FACE("#BBF7D0", "dino", '<circle cx="23.2" cy="24" r="5" fill="#FDE047" stroke="#4A3728" stroke-width="1.7"/><path d="M21.8 21.8v4.4l3.8-2.2z" fill="#4A3728"/>', "#FBCFE8", "wink"),
  history: CHIBI_FACE("#EDE9FE", "owl", '<circle cx="23.4" cy="24" r="4.8" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.7"/><path d="M23.4 21.4v2.8l1.8 1" stroke="#4A3728" stroke-width="1.6" stroke-linecap="round"/>', "#FEF08A", "glasses"),
  bulb: CHIBI_FACE("#FEF08A", "owl", '<circle cx="24.4" cy="7.2" r="3" fill="#FDE047" stroke="#4A3728" stroke-width="1.6"/><path d="M24.4 2.2v1.2M28.6 7.2h-1.2" stroke="#F472B6" stroke-width="1.6" stroke-linecap="round"/>', "#FBCFE8", "sparkle"),
  briefcase: CHIBI_FACE("#94A3B8", "penguin", '<rect x="17" y="21.5" width="11.2" height="7.6" rx="2.4" fill="#FDBA74" stroke="#4A3728" stroke-width="1.7"/><path d="M20.2 21.5v-1.6h4.8v1.6" stroke="#4A3728" stroke-width="1.6"/>', "#BAE6FD", "cool"),
  globe: CHIBI_FACE("#E0F2FE", "polar", '<circle cx="23.4" cy="23.8" r="5" fill="#7DD3FC" stroke="#4A3728" stroke-width="1.7"/><path d="M18.6 23.8h9.6M23.4 19v9.6" stroke="#4A3728" stroke-width="1.4"/>', "#FEF08A", "happy"),
  bell: CHIBI_FACE("#F9A8D4", "piggy", '<path d="M20.2 25.8v-3a3.4 3.4 0 0 1 6.8 0v3l1.2 1.6H19z" fill="#FDE047" stroke="#4A3728" stroke-width="1.6" stroke-linejoin="round"/>', "#FEF08A", "joy"),
  award: CHIBI_FACE("#FFFDF9", "unicorn", '<circle cx="23.2" cy="22.4" r="4.6" fill="#FDE047" stroke="#4A3728" stroke-width="1.7"/><path d="m21.2 26.2-1 4 3-1.4 3 1.4-1-4" fill="#F472B6" stroke="#4A3728" stroke-width="1.5"/>', "#BAE6FD", "sparkle"),
  trophy: CHIBI_FACE("#FDE68A", "bear", '<path d="M19.4 20h7.4v3.8a3.7 3.7 0 0 1-7.4 0z" fill="#FACC15" stroke="#4A3728" stroke-width="1.7"/><path d="M23.1 27.4v2M20.6 29.4h5" stroke="#4A3728" stroke-width="1.7" stroke-linecap="round"/>', "#DCFCE7", "joy", "crown"),
  star: CHIBI_FACE("#FEF9C3", "unicorn", '<path d="m23.5 18.8 1.3 2.6 2.8.4-2 2 .5 2.8-2.6-1.3-2.6 1.3.5-2.8-2-2 2.8-.4z" fill="#FDE047" stroke="#4A3728" stroke-width="1.6" stroke-linejoin="round"/>', "#DDD6FE", "sparkle"),
  sparkle: CHIBI_FACE("#FCE7F3", "girl", '<path d="M24.6 3.5c.5 2.4 1.6 3.6 4 4-2.4.5-3.6 1.6-4 4-.5-2.4-1.6-3.6-4-4 2.4-.5 3.6-1.6 4-4z" fill="#FDE047" stroke="#4A3728" stroke-width="1.5"/>', "#DDD6FE", "sparkle", "bow"),
  user: CHIBI_FACE("#FFEDD5", "boy", '<circle cx="16" cy="26.5" r="2.2" fill="#F472B6" stroke="#4A3728" stroke-width="1.5"/>', "#BAE6FD", "happy"),
  key: CHIBI_FACE("#FDBA74", "fox", '<circle cx="20.4" cy="24.5" r="3" fill="#FACC15" stroke="#4A3728" stroke-width="1.6"/><path d="M23.4 24.5h5.2M26.8 24.5v2.2" stroke="#4A3728" stroke-width="1.7" stroke-linecap="round"/>', "#FBCFE8", "wink"),
  book: CHIBI_FACE("#BBF7D0", "frog", '<rect x="9" y="21.5" width="14" height="7.8" rx="2.4" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.8"/><path d="M16 21.7v7.4" stroke="#4A3728" stroke-width="1.6"/>', "#FEF08A", "happy", "leaf"),
  lesson: CHIBI_FACE("#FFEDD5", "girl", '<rect x="9" y="21.5" width="14" height="7.8" rx="2.4" fill="#FEF08A" stroke="#4A3728" stroke-width="1.8"/><path d="M16 21.7v7.4" stroke="#4A3728" stroke-width="1.6"/>', "#FBCFE8", "happy", "grad"),
  users: CHIBI_FACE("#E0F2FE", "bunny", '<circle cx="24.8" cy="24" r="4.1" fill="#FBCFE8" stroke="#4A3728" stroke-width="1.6"/><circle cx="23.7" cy="23.5" r=".7" fill="#4A3728"/><circle cx="25.9" cy="23.5" r=".7" fill="#4A3728"/>', "#FEF08A", "joy"),
  settings: CHIBI_FACE("#EDE9FE", "lopbunny", '<circle cx="23.4" cy="24" r="4.6" fill="#FEF08A" stroke="#4A3728" stroke-width="1.7"/><circle cx="23.4" cy="24" r="1.6" fill="#4A3728"/>', "#BAE6FD", "glasses"),
  "life-buoy": CHIBI_FACE("#FED7AA", "shiba", '<circle cx="23.4" cy="24" r="4.8" fill="#FDA4AF" stroke="#4A3728" stroke-width="1.7"/><circle cx="23.4" cy="24" r="1.9" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.5"/>', "#BAE6FD", "wink"),
  grid: CHIBI_FACE("#FFFDF9", "calico", '<rect x="18.6" y="20.4" width="4.5" height="4.5" rx="1.4" fill="#FEF08A" stroke="#4A3728" stroke-width="1.5"/><rect x="24" y="20.4" width="4.5" height="4.5" rx="1.4" fill="#BAE6FD" stroke="#4A3728" stroke-width="1.5"/><rect x="18.6" y="25.6" width="4.5" height="4.5" rx="1.4" fill="#BBF7D0" stroke="#4A3728" stroke-width="1.5"/><rect x="24" y="25.6" width="4.5" height="4.5" rx="1.4" fill="#FBCFE8" stroke="#4A3728" stroke-width="1.5"/>', "#DDD6FE", "joy"),
  check: CHIBI_FACE("#A7F3D0", "frog", '<circle cx="23.4" cy="24" r="4.8" fill="#4ADE80" stroke="#4A3728" stroke-width="1.7"/><path d="m21.3 24 1.5 1.6 2.8-3" stroke="#4A3728" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>', "#FEF08A", "joy"),
  clock: CHIBI_FACE("#FFFDF9", "ghost", '<circle cx="23.4" cy="24" r="4.8" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.7"/><path d="M23.4 21.8v2.4l1.8 1" stroke="#4A3728" stroke-width="1.6" stroke-linecap="round"/>', "#FBCFE8", "wink"),
  chart: CHIBI_FACE("#94A3B8", "penguin", '<rect x="18.2" y="20.6" width="9.8" height="8" rx="2" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.6"/><path d="M20.8 26.6v-2.4M23.1 26.6v-3.8M25.4 26.6v-1.8" stroke="#4A3728" stroke-width="1.6" stroke-linecap="round"/>', "#FEF08A", "happy"),
  search: CHIBI_FACE("#FFFDF9", "boy", '<circle cx="22.8" cy="23.2" r="3.9" fill="#BAE6FD" stroke="#4A3728" stroke-width="1.7"/><path d="m25.8 26.2 2.8 2.8" stroke="#4A3728" stroke-width="2" stroke-linecap="round"/>', "#FCE7F3", "glasses"),
  lock: CHIBI_FACE("#FEF08A", "panda", '<rect x="18.8" y="22.8" width="9" height="6.4" rx="2" fill="#F9A8D4" stroke="#4A3728" stroke-width="1.6"/><path d="M20.6 22.8V21a2.7 2.7 0 0 1 5.4 0v1.8" stroke="#4A3728" stroke-width="1.6"/>', "#BAE6FD", "cool"),
  file: CHIBI_FACE("#BBF7D0", "dino", '<rect x="18.8" y="20.4" width="8.6" height="9.2" rx="2" fill="#FEF08A" stroke="#4A3728" stroke-width="1.6"/>', "#FBCFE8", "happy"),
  flask: CHIBI_FACE("#DCFCE7", "frog", '<path d="M21.5 18.5h4l2.8 9.2a1.2 1.2 0 0 1-1.1 1.6h-7.4a1.2 1.2 0 0 1-1.1-1.6z" fill="#A7F3D0" stroke="#4A3728" stroke-width="1.6"/>', "#FEF08A", "sparkle"),
  sun: CHIBI_FACE("#FEF08A", "chick", '<circle cx="24" cy="7" r="3" fill="#FACC15" stroke="#4A3728" stroke-width="1.5"/>', "#FFE4EC", "joy", "halo"),
  moon: CHIBI_FACE("#EDE9FE", "ghost", '<path d="M26 5.5a3.5 3.5 0 1 0 3.2 4.8A2.8 2.8 0 0 1 26 5.5z" fill="#FDE047" stroke="#4A3728" stroke-width="1.5"/>', "#BAE6FD", "happy"),
  menu: CHIBI_FACE("#FFFDF9", "polar", '<rect x="19" y="20.6" width="9" height="8" rx="2.4" fill="#FEF08A" stroke="#4A3728" stroke-width="1.5"/><path d="M21 23.2h5M21 25.8h5" stroke="#4A3728" stroke-width="1.5" stroke-linecap="round"/>', "#FCE7F3", "happy"),
  logout: CHIBI_FACE("#FED7AA", "shiba", '<path d="M20 24.5h7.5m-2.5-2.5 2.5 2.5-2.5 2.5" stroke="#4A3728" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>', "#FCE7F3", "wink"),
  edit: CHIBI_FACE("#FCE7F3", "lopbunny", '<path d="m20 27.5 6.8-6.8 2.2 2.2-6.8 6.8-2.8.6z" fill="#FDE047" stroke="#4A3728" stroke-width="1.5" stroke-linejoin="round"/>', "#BAE6FD", "happy", "beret"),
  send: CHIBI_FACE("#FBCFE8", "piggy", '<path d="m19 23.5 9.5-3.5-3.2 9.2-2-3.7z" fill="#BAE6FD" stroke="#4A3728" stroke-width="1.5" stroke-linejoin="round"/>', "#FEF08A", "joy"),
  copy: CHIBI_FACE("#E0F2FE", "penguin", '<rect x="19" y="20.5" width="7" height="7" rx="1.6" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.5"/><rect x="21.5" y="22.8" width="7" height="7" rx="1.6" fill="#FEF08A" stroke="#4A3728" stroke-width="1.5"/>', "#FBCFE8", "happy"),
  download: CHIBI_FACE("#FFFDF9", "polar", '<path d="M23.5 19.5v7.5m-2.8-2.6 2.8 2.8 2.8-2.8" stroke="#4A3728" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>', "#BAE6FD", "joy"),
  print: CHIBI_FACE("#FEF08A", "fox", '<rect x="18.6" y="21.5" width="9.8" height="6.8" rx="1.8" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.5"/>', "#DCFCE7", "happy"),
  reset: CHIBI_FACE("#BBF7D0", "dino", '<path d="M20.5 24.5a4 4 0 1 1 1.2 2.8m-2.4-2.8h2.5" stroke="#4A3728" stroke-width="1.7" stroke-linecap="round"/>', "#FEF08A", "wink"),
  eye: CHIBI_FACE("#EDE9FE", "owl", '<ellipse cx="23.5" cy="24" rx="4.5" ry="2.8" fill="#BAE6FD" stroke="#4A3728" stroke-width="1.5"/><circle cx="23.5" cy="24" r="1.2" fill="#4A3728"/>', "#FBCFE8", "sparkle"),
  trash: CHIBI_FACE("#FFFDF9", "ghost", '<rect x="19.6" y="21.2" width="7.8" height="7.8" rx="1.8" fill="#FDA4AF" stroke="#4A3728" stroke-width="1.5"/>', "#DDD6FE", "calm"),
  keyboard: CHIBI_FACE("#BBF7D0", "dino", '<rect x="18" y="22.5" width="11" height="6.2" rx="1.8" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.5"/>', "#BAE6FD", "cool"),
  database: CHIBI_FACE("#E0F2FE", "polar", '<ellipse cx="23.5" cy="21.5" rx="4.5" ry="2" fill="#BAE6FD" stroke="#4A3728" stroke-width="1.5"/><path d="M19 21.5v5.8c0 1.1 2 2 4.5 2s4.5-.9 4.5-2v-5.8" stroke="#4A3728" stroke-width="1.5"/>', "#FEF08A", "glasses"),
  sliders: CHIBI_FACE("#FCE7F3", "frog", '<path d="M19 22h9M19 26.5h9" stroke="#4A3728" stroke-width="1.6" stroke-linecap="round"/><circle cx="22" cy="22" r="1.5" fill="#FDE047" stroke="#4A3728" stroke-width="1.2"/><circle cx="25.5" cy="26.5" r="1.5" fill="#F472B6" stroke="#4A3728" stroke-width="1.2"/>', "#BAE6FD", "happy"),
};
export function sketchIcon(name, extra = "") {
  if (SKETCH_ICONS[name]) {
    const dim = /\bwidth=/.test(extra) ? "" : 'width="22" height="22" ';
    return `<svg class="sk-ic chibi-ic" ${dim}viewBox="0 0 32 32" fill="none" aria-hidden="true" ${extra}>${SKETCH_ICONS[name]}</svg>`;
  }
  return icon(name, extra);
}

/* Studio-Rendered 2D Chibi Animal Companions (Image 1 & Image 3 style) */
export const CHIBI_PETS = {
  dragon: { img: "/img/chibi/pet-dragon.webp", name: "Finn", tier: "Huyền thoại", subj: "es" },
  cat: { img: "/img/chibi/pet-cat.webp", name: "Mimi", tier: "Nhanh nhẹn", subj: "ja" },
  fox: { img: "/img/chibi/pet-fox.webp", name: "Rusty", tier: "Tinh anh", subj: "fr" },
  bunny: { img: "/img/chibi/pet-bunny.webp", name: "Bonnie", tier: "Đáng yêu", subj: "ko" },
  panda: { img: "/img/chibi/pet-panda.webp", name: "Leo", tier: "Điềm tĩnh", subj: "zh" },
  owl: { img: "/img/chibi/pet-owl.webp", name: "Pippa", tier: "Thông thái", subj: "en" },
};
const SUBJ_TO_PET = { en: "owl", zh: "panda", ja: "cat", ko: "bunny", fr: "fox", es: "dragon" };
export function subjectMascotSvg(id, size = 76) {
  const key = CHIBI_PETS[id] ? id : (SUBJ_TO_PET[id] || "dragon");
  const p = CHIBI_PETS[key];
  return `<img class="chibi-pet-photo" src="${p.img}" width="${size}" height="${size}" alt="${esc(p.name)}" loading="lazy">`;
}

/* ---------- Toast ---------- */
export function toast(msg, kind = "info", ms = 3200) {
  const host = document.getElementById("toasts");
  if (!host) return;
  const el = document.createElement("div");
  el.className = "toast " + kind;
  el.innerHTML = `<i>${kind === "ok" ? "✓" : kind === "err" ? "!" : "i"}</i><div>${esc(msg)}</div>`;
  host.appendChild(el);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 260); }, ms);
}

/* ---------- Modal ---------- */
let modalStack = [];
export function openModal(html, opts = {}) {
  const host = document.getElementById("modalHost");
  const wrap = document.createElement("div");
  wrap.className = "modal-wrap";
  wrap.innerHTML = `<div class="modal-bg"></div>
    <div class="modal ${opts.cls || ""}" role="dialog" aria-modal="true" ${opts.label ? `aria-label="${esc(opts.label)}"` : ""}>
      ${opts.noClose ? "" : `<button class="icon-btn modal-x" data-close aria-label="Đóng">${icon("x")}</button>`}
      ${html}
    </div>`;
  const prevFocus = document.activeElement;
  const close = (val) => {
    wrap.remove();
    modalStack = modalStack.filter((m) => m !== api_);
    document.body.style.overflow = modalStack.length ? "hidden" : "";
    if (prevFocus && prevFocus.focus) try { prevFocus.focus(); } catch (e) {}
    if (opts.onClose) opts.onClose(val);
  };
  const api_ = { el: wrap, close };
  wrap.querySelector(".modal-bg").addEventListener("click", () => { if (!opts.sticky) close(); });
  wrap.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); });
  host.appendChild(wrap);
  modalStack.push(api_);
  document.body.style.overflow = "hidden";
  setTimeout(() => {
    const f = wrap.querySelector("[autofocus], input, select, textarea, button.btn-primary") || wrap.querySelector("button");
    if (f) f.focus();
  }, 30);
  return api_;
}
export function closeTopModal() {
  const m = modalStack[modalStack.length - 1];
  if (m) { m.close(); return true; }
  return false;
}
export function confirmBox(title, text, okLabel = "Đồng ý", danger = false) {
  return new Promise((resolve) => {
    let done = false;
    const m = openModal(`<h2>${esc(title)}</h2><p class="lead">${esc(text)}</p>
      <div class="modal-actions"><button class="btn" data-close>Hủy</button>
      <button class="btn ${danger ? "btn-danger" : "btn-primary"}" data-ok>${esc(okLabel)}</button></div>`,
      { onClose: () => { if (!done) resolve(false); } });
    m.el.querySelector("[data-ok]").addEventListener("click", () => { done = true; m.close(); resolve(true); });
    setTimeout(() => m.el.querySelector("[data-ok]").focus(), 40);
  });
}
export function promptBox(title, text, { label = "", type = "text", okLabel = "Lưu", validate } = {}) {
  return new Promise((resolve) => {
    let done = false;
    const m = openModal(`<h2>${esc(title)}</h2>${text ? `<p class="lead">${esc(text)}</p>` : ""}
      <form class="auth-form" data-f>
        <label class="field">${esc(label)}<input type="${type}" autofocus data-v autocomplete="off"></label>
        <p class="form-msg err" data-m></p>
        <div class="modal-actions" style="margin-top:0"><button type="button" class="btn" data-close>Hủy</button>
        <button class="btn btn-primary">${esc(okLabel)}</button></div>
      </form>`, { onClose: () => { if (!done) resolve(null); } });
    m.el.querySelector("[data-f]").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = m.el.querySelector("[data-v]").value;
      const err = validate ? validate(v) : "";
      if (err) { m.el.querySelector("[data-m]").textContent = err; return; }
      done = true; m.close(); resolve(v);
    });
  });
}

/* ---------- Theme ---------- */
const THEME_KEY = "me:theme";
export function currentTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
export function toggleTheme() {
  const t = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
  return t;
}
// Shared light / dark toggle button (app topbar, landing page); a single handler manages clicks everywhere.
// Nút sáng / tối: bấm là đổi cả giao diện (toàn bộ CSS đọc cùng một thuộc tính data-theme trên <html>).
export const themeBtnHtml = () => `<button type="button" class="theme-btn" data-theme-toggle aria-label="Đổi giao diện sáng / tối" title="Đổi giao diện sáng / tối"><span class="t-moon">${icon("moon")}</span><span class="t-sun">${icon("sun")}</span><span class="theme-btn-txt"><b class="tt-dark">Chế độ tối</b><b class="tt-light">Chế độ sáng</b></span></button>`;
if (typeof document !== "undefined") document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest("[data-theme-toggle]")) toggleTheme(); });

/* ---------- Shared components (5.1.0) ---------- */
// Loading skeleton placeholder: kind = hero | card | block | line
export function skeleton(kind = "block") { return `<div class="sk sk-${kind}" aria-hidden="true"></div>`; }
// Empty state: icon + title + description + action (button HTML, optional)
export function emptyState(ic, title, text = "", action = "") {
  return `<div class="state state-empty"><span class="state-ico">${icon(ic)}</span><b>${esc(title)}</b>${text ? `<p>${esc(text)}</p>` : ""}${action}</div>`;
}
// Error state with Retry button (attaches event to [data-retry])
export function errorState(msg, retry = true) {
  return `<div class="state state-error" role="alert"><span class="state-ico">${icon("x")}</span><b>Không tải được dữ liệu</b><p>${esc(msg || "")}</p>${retry ? `<button type="button" class="btn" data-retry>${icon("reset")}Thử lại</button>` : ""}</div>`;
}
// Copy AI response button: placed inside .msg, clicking copies the text content of that .msg
export const copyBtnHtml = () => `<button type="button" class="msg-copy" data-copy-msg aria-label="Sao chép câu trả lời" title="Sao chép câu trả lời">${icon("copy")}</button>`;
if (typeof document !== "undefined") document.addEventListener("click", async (e) => {
  const b = e.target.closest && e.target.closest("[data-copy-msg]");
  if (!b) return;
  const box = b.closest(".msg"); if (!box) return;
  const clone = box.cloneNode(true); clone.querySelectorAll("[data-copy-msg]").forEach((x) => x.remove());
  try { await navigator.clipboard.writeText(clone.innerText.trim()); toast("Đã sao chép câu trả lời.", "ok", 1800); }
  catch { toast("Trình duyệt không cho sao chép tự động. Hãy bôi đen rồi sao chép.", "info"); }
});

/* ---------- Safe storage ---------- */
export const store = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
};

/* ---------- Progress / learning data ---------- */
export function best(id) { return (S.scores && S.scores.exerciseBest && S.scores.exerciseBest[id]) || 0; }
export function isDone(id) { return best(id) > 0; }
export function groupProgress(g) {
  const ex = S.chapters.filter((c) => g.chapters.includes(c.id)).flatMap((c) => c.exercises);
  const done = ex.filter((e) => isDone(e.id)).length;
  return { done, total: ex.length, pct: ex.length ? Math.round((done / ex.length) * 100) : 0 };
}
export function chapterNum(c) { const m = /^c(\d+)/.exec(c.id); return m ? Number(m[1]) : 0; }
export function chapterShort(c) { return String(c.title || "").replace(/^Chương\s*\d+\s*:\s*/i, ""); }
export function findEx(id) {
  for (const c of S.chapters) {
    const i = (c.exercises || []).findIndex((e) => e.id === id);
    if (i >= 0) return { ex: c.exercises[i], chapter: c, index: i };
  }
  return null;
}
export function chapterStats(c) {
  const list = c.exercises || [];
  const done = list.filter((e) => isDone(e.id)).length;
  return { done, total: list.length, pct: list.length ? Math.round((done / list.length) * 100) : 0 };
}
export function totalStats() {
  let done = 0, total = 0;
  for (const c of S.chapters) for (const e of c.exercises || []) { total++; if (isDone(e.id)) done++; }
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}
/* Sequential lock (UI guidance only, not enforced by server):
   - Within a chapter: first item is always open, subsequent items unlock when the preceding item is passed.
   - Within a learning path: first item is open, subsequent items unlock when the preceding path item is passed. */
export function isUnlocked(id, pathId) {
  if (S.me && S.me.role === "admin") return true;
  if (S.cfg && S.cfg.lockMode === "none") return true;
  if (pathId) {
    const p = S.paths.find((x) => x.id === pathId);
    if (p) {
      const i = p.exerciseIds.indexOf(id);
      if (i >= 0) return i === 0 || isDone(p.exerciseIds[i - 1]) || isDone(id);
    }
  }
  const f = findEx(id);
  if (!f) return false;
  if (f.index === 0 || isDone(id)) return true;
  return isDone(f.chapter.exercises[f.index - 1].id);
}
export function nextOpenInChapter(c) {
  return (c.exercises || []).find((e) => !isDone(e.id) && isUnlocked(e.id)) || null;
}
export function pathStats(p) {
  const done = p.exerciseIds.filter(isDone).length;
  return { done, total: p.exerciseIds.length, pct: p.exerciseIds.length ? Math.round((done / p.exerciseIds.length) * 100) : 0 };
}

/* ---------- Score sync ---------- */
const listeners = new Set();
export function onScores(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function setScores(sc) { S.scores = sc; listeners.forEach((f) => { try { f(sc); } catch (e) {} }); }
export async function refreshScores() {
  return null; // bảng điểm bài tập đã gỡ khỏi hệ thống
}
export async function loadExams(force = false) {
  if (!S.exams || force) S.exams = {}; // bài kiểm tra theo chương đã gỡ khỏi hệ thống
  return S.exams;
}

export function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
export function animateCount(el, to, ms = 700) {
  if (!el) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = fmtN(to); return; }
  const st = performance.now();
  const step = (now) => { const t = Math.min(1, (now - st) / ms); el.textContent = fmtN(Math.round(to * (1 - Math.pow(1 - t, 3)))); if (t < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
let _smoothScrollRaf = 0;
let _smoothScrollCleanup = null;
export function smoothScrollTo(targetOrY, opts = {}) {
  const offset = opts.offset ?? 76;
  const isNum = typeof targetOrY === "number";
  if (!isNum && !targetOrY) return;
  const rawY = isNum ? targetOrY : targetOrY.getBoundingClientRect().top + window.scrollY - offset;
  const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const endY = Math.max(0, Math.min(maxY, rawY));
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, endY);
    return;
  }
  if (_smoothScrollRaf) { cancelAnimationFrame(_smoothScrollRaf); _smoothScrollRaf = 0; }
  if (_smoothScrollCleanup) { _smoothScrollCleanup(); _smoothScrollCleanup = null; }
  const startY = window.scrollY;
  const dist = endY - startY;
  if (Math.abs(dist) < 2) { window.scrollTo(0, endY); return; }
  const dur = opts.duration || Math.min(960, Math.max(520, 400 + Math.abs(dist) * 0.26));
  const ease = (t) => (t < 0.5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2);
  const t0 = performance.now();
  const cancel = () => {
    if (_smoothScrollRaf) { cancelAnimationFrame(_smoothScrollRaf); _smoothScrollRaf = 0; }
    if (_smoothScrollCleanup) { _smoothScrollCleanup(); _smoothScrollCleanup = null; }
  };
  const cleanup = () => {
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchstart", cancel);
  };
  _smoothScrollCleanup = cleanup;
  window.addEventListener("wheel", cancel, { passive: true, once: true });
  window.addEventListener("touchstart", cancel, { passive: true, once: true });
  const step = (now) => {
    const t = Math.min(1, (now - t0) / dur);
    window.scrollTo(0, startY + dist * ease(t));
    if (t < 1) _smoothScrollRaf = requestAnimationFrame(step);
    else cancel();
  };
  _smoothScrollRaf = requestAnimationFrame(step);
}

/* ---------- System configuration ---------- */
// Read a setting, falling back to default when an older server has not returned it
export function cfg(key, def) { const v = S.cfg ? S.cfg[key] : undefined; return v === undefined ? def : v; }
// 4.0: "isTeacher" in the legacy UI = system administrator (admin). Classroom teacher: isClassTeacher().
export const isTeacher = () => !!(S.me && S.me.role === "admin");
export const isAdmin = () => !!(S.me && S.me.role === "admin");
export const isClassTeacher = () => !!(S.me && (S.me.role === "teacher" || S.me.role === "admin"));
export const ROLE_LABEL = { admin: "Quản trị", teacher: "Giáo viên", student: "Học viên", parent: "Phụ huynh" };
const ROLE_LABEL_EN = { admin: "Admin", teacher: "Teacher", student: "Learner", parent: "Parent" };
export const roleLabel = (r) => (currentLang() === "en" ? ROLE_LABEL_EN[r] : ROLE_LABEL[r]) || r;
export function applyBrand(c) {
  if (!c) return;
  const root = document.documentElement;
  if ("logoUrl" in c) setFavicon();
  if (c.brand) { root.style.setProperty("--brand", c.brand[1]); root.style.setProperty("--brand-deep", c.brand[2]); const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", c.brand[1]); }
}
export const siteName = () => cfg("siteName", "LifeRivo") || "LifeRivo";
export const brandInitials = () => { const w = String(siteName()).trim().split(/\s+/).filter(Boolean); return (w.length > 1 ? w[0][0] + w[1][0] : (w[0] || "H").slice(0, 2)).toUpperCase(); };
// 4.0.1: logo uploaded in Admin (if any); "Logo only" hides the name (still kept for screen readers)
export const brandHtml = () => {
  const logo = cfg("logoUrl", "");
  if (!logo) { // Cute 2D Chibi Mochi Cat mascot emblem + site wordmark
    const m = /^(.*\S)\s+(study)$/i.exec(siteName());
    return `<svg class="me-mark chibi-logo" viewBox="0 0 36 36" aria-hidden="true"><rect width="36" height="36" rx="12" fill="#FEF08A" stroke="#4A3728" stroke-width="2.2"/><path d="M9.5 16.5 8 7.5l6.5 4.2M26.5 16.5 28 7.5l-6.5 4.2" fill="#FFFDF9" stroke="#4A3728" stroke-width="2" stroke-linejoin="round"/><ellipse cx="18" cy="20.5" rx="10.2" ry="8.8" fill="#FFFDF9" stroke="#4A3728" stroke-width="2"/><circle cx="13.8" cy="19.6" r="1.6" fill="#4A3728"/><circle cx="22.2" cy="19.6" r="1.6" fill="#4A3728"/><circle cx="13.2" cy="19" r=".6" fill="#fff"/><circle cx="21.6" cy="19" r=".6" fill="#fff"/><ellipse cx="11.2" cy="22" rx="1.6" ry=".9" fill="#FDA4AF"/><ellipse cx="24.8" cy="22" rx="1.6" ry=".9" fill="#FDA4AF"/><path d="M16.2 22q.9 1.1 1.8 0 .9 1.1 1.8 0" stroke="#4A3728" stroke-width="1.6" stroke-linecap="round"/><circle cx="29" cy="7.5" r="2.2" fill="#F9A8D4" stroke="#4A3728" stroke-width="1.5"/></svg><span class="me-word"><b>${esc(m ? m[1] : siteName())}</b>${m ? "<i>STUDY</i>" : ""}</span>`;
  }
  const only = cfg("logoMode", "with_name") === "only";
  return `<img class="brand-logo${only ? " only" : ""}" src="${esc(logo)}" alt="${only ? esc(siteName()) : ""}">${only ? "" : esc(siteName())}`;
};
export function refreshBrand() {
  document.querySelectorAll(".brand").forEach((el) => { el.innerHTML = brandHtml(); });
  setFavicon();
}
function setFavicon() {
  const logo = cfg("logoUrl", "");
  let link = document.querySelector('link[rel="icon"]');
  if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
  // Favicon rieng (LR vuong); khong dung logo header (anh ngang) lam favicon.
  link.href = logo ? "/favicon.png" : "/favicon.svg";
  link.type = logo ? "image/png" : "image/svg+xml";
}

// Nhãn gói Pro cạnh tên: Pro tháng màu vàng, Pro dùng thử (mã tặng, lượt miễn phí, thử nghiệm) màu xanh, Pro trọn đời ghi "Premium".
const PRO_TRIAL_TYPES = ["trial", "daily", "gift"];
export function proBadgeHtml(mem) {
  if (!mem || !mem.pro || mem.staff) return "";
  const lifetime = !mem.expiresAt || Date.parse(mem.expiresAt) - Date.now() > 50 * 365 * 86400000;
  if (lifetime) return '<span class="pro-badge pro-badge-premium" title="Premium trọn đời">Premium</span>';
  const src = mem.sources || [];
  const trialOnly = src.length > 0 && src.every((x) => PRO_TRIAL_TYPES.includes(x.type));
  return trialOnly
    ? '<span class="pro-badge pro-badge-trial" title="Pro dùng thử">Pro</span>'
    : '<span class="pro-badge pro-badge-pro" title="Pro">Pro</span>';
}
// Vẽ lại mọi chỗ có nhãn gói (theo S.membership hiện tại)
export function paintProBadges() {
  document.querySelectorAll("[data-pro-slot]").forEach((el) => { el.innerHTML = proBadgeHtml(S.membership); });
}

/* ---------- Đường dẫn ứng dụng: /app/<trang>?<truy vấn>, không dùng dấu # ----------
   appHash(): đường dẫn hiện tại của ứng dụng ("/app/..."); ngoài /app thì trả về neo trang chủ (#cach-hoc).
   setAppHash(u): chuyển trang bằng history.pushState, không tải lại. Nhận "/app/...", "#/..." (dạng cũ) hoặc "#neo".
   Mọi thay đổi trang đều phát sự kiện popstate để bộ định tuyến chạy lại. */
export const APP_PREFIX = "/app";
export function appHash() {
  const p = location.pathname;
  if (p === APP_PREFIX || p.startsWith(APP_PREFIX + "/")) return (p.replace(/\/+$/, "") || APP_PREFIX) + location.search;
  return location.hash;
}
function toAppUrl(u) {
  if (u.startsWith("#/")) return APP_PREFIX + "/" + u.slice(2).replace(/^\/+/, "");
  if (u.startsWith(APP_PREFIX)) return u;
  return APP_PREFIX + "/" + u.replace(/^\/+/, "");
}
export function setAppHash(u) {
  const s = String(u || "");
  if (s.startsWith("#") && !s.startsWith("#/")) { location.hash = s; return; } // neo trên trang chủ
  history.pushState(null, "", toAppUrl(s));
  window.dispatchEvent(new PopStateEvent("popstate"));
}
// Đường dẫn cũ dạng "/#/trang" (link đã gửi, email): chuyển sang đường dẫn sạch ngay khi mở
(function migrateLegacyHash() {
  try {
    if (location.hash.startsWith("#/")) {
      const extra = location.search && !location.hash.includes("?") ? location.search : "";
      history.replaceState(null, "", toAppUrl(location.hash) + extra);
    }
  } catch {}
})();
