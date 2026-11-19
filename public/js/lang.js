/* 4.8.0 - Categorized learning home + Foreign Languages (HSK, JLPT, DELF, CEFR, TOPIK).
   Exercise workflow: open -> solve -> submit -> server grades -> save best score. */
import {  } from "./core.js";
import { S, api, esc, icon, lineIcon, sketchIcon, subjectMascotSvg, fmtN, toast, totalStats, confirmBox, emptyState, groupProgress, setScores } from "./core.js";
import { ChibiMascot, HeroBanner, AchievementCard, triggerConfetti } from "./chibi-ds.js";
import { savePrefs } from "./game.js";
import "./lang-en.js";
import { currentLang } from "./i18n.js";
import { STANDARD_ROADMAP, ROADMAP_HEAD, roadmapStep } from "./roadmap-std.js";
import { companionSvg, activeCompanionId } from "./companion.js";
import { onExerciseSubmitted, petState, petView, refreshPet } from "./pet-state.js";
import { isWordSaved, toggleWord } from "./notebook.js";
// Chuỗi giao diện cho khối tổng quan khóa học: tiếng Việt mặc định, tiếng Anh khi người học chọn English
const tx = (vi, en) => (currentLang() === "en" ? en : vi);
import { mountAiWidget } from "./ai-widget.js";
import { mdLite } from "./pro.js";
import { speakText, bestVoice as pickVoice } from "./voice.js";
import { startLiveCapture } from "./speak.js";
import { createSrEndDetector, joinTranscript } from "./voice-vad.js";
import { mountCatScrollDock } from "./cat-dock.js";
// iPhone/Android: Web Speech API hay kẹt từ câu thứ 2, nên thu âm và nhận dạng trên server.
const MOBILE_UA = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
// Floating AI assistant is enabled across all learning pages
function withAi(ctx) { mountAiWidget().then(() => document.querySelector(".aiw")?.classList.add("lx-on")).catch(() => {}); ctx.onLeave(() => { window.__plAiCtx = null; }); }

let CACHE = null;
async function loadLang(force = false) {
  if (!CACHE || force) CACHE = await api("/api/lang");
  paintLangSide();
  return CACHE;
}
// "Learning progress" bar at bottom of menu: when studying a foreign language, count exercises of that subject
export function paintLangSide() {
  const s = getSubject();
  if (!s || !CACHE) return false;
  const c = CACHE.courses.find((x) => x.id === s);
  const lv = document.getElementById("sbLv"), xp = document.getElementById("sbXp"), bar = document.getElementById("sbBar");
  if (!c || !lv || !xp || !bar) return false;
  lv.textContent = `Tiến độ ${c.name}`; lv.title = `${c.done}/${c.total} bài đã đạt`;
  xp.textContent = `${fmtN(c.done)}/${fmtN(c.total)} bài`;
  const coursePct = Math.max(0, Math.min(100, c.pct || 0));
  bar.style.width = coursePct + "%";
  const pet = petState();
  const goal = Math.min(20, Math.max(1, Number(S.prefs && S.prefs.dailyGoal) || 3));
  const lessonsToday = pet.daily?.lessons || 0;
  const todayGoalPct = lessonsToday > 0 ? Math.min(100, Math.round((lessonsToday / goal) * 100)) : coursePct;
  const ring = document.getElementById("sbTodayRing");
  const txt = document.getElementById("sbTodayPct");
  const metaSpan = ring?.querySelector(".sb-ring-meta span");
  if (ring) ring.style.setProperty("--pct", String(todayGoalPct));
  if (txt) txt.textContent = `${todayGoalPct}%`;
  if (metaSpan) {
    metaSpan.textContent = lessonsToday > 0
      ? `${fmtN(lessonsToday)}/${fmtN(goal)} bài · ⭐ ${fmtN(pet.stars)}`
      : c.done > 0
        ? `${fmtN(c.done)}/${fmtN(c.total)} bài đạt · ⭐ ${fmtN(pet.stars)}`
        : "Làm bài để nhận ⭐";
  }
  return true;
}
export async function refreshLangSide() {
  const s = getSubject(); if (!s) return false;
  try {
    await Promise.all([
      loadLang(!CACHE),
      !petView() ? refreshPet() : Promise.resolve(),
    ]);
  } catch {}
  return paintLangSide();
}

/* ---------- Speech synthesis (browser) ----------
   Pick the best available system voice (prefer Natural/Neural/Google/Online matching language and locale).
   Clicking the same sentence again within 5 seconds speaks slower so each sound is clear. */
export const bestVoice = pickVoice; // 4.13.0: moved to voice.js (AI voice + device voice), keep legacy name for other callers
let lastSay = { text: "", at: 0 };
function speak(text, lang) {
  if (!text) return false;
  const slow = lastSay.text === text && Date.now() - lastSay.at < 5000;
  lastSay = { text, at: slow ? 0 : Date.now() };
  if (slow) toast(tx("Đọc chậm", "Slow speed"), "info", 1200);
  speakText(text, lang, { rate: slow ? 0.6 : 0.95 });
  return true;
}
const sayBtn = (text, lang) => text ? `<button type="button" class="lx-say" data-say="${esc(text)}" data-lang="${esc(lang)}" title="${tx("Nghe đọc (bấm lần nữa để nghe chậm)", "Listen (tap again for slow speed)")}" aria-label="${tx("Nghe đọc", "Listen")}">${lineIcon("speaker", 15)}</button>` : "";
function bindSay(root, ctx) {
  if (!root || root.dataset.sayBound || root.closest?.("[data-say-bound]")) return;
  root.dataset.sayBound = "1";
  lastSay = { text: "", at: 0 };
  const onClick = (e) => {
    const b = e.target.closest("[data-say][data-lang]");
    if (!b || !root.contains(b)) return;
    e.preventDefault();
    if (!speak(b.dataset.say, b.dataset.lang)) toast(tx("Trình duyệt này chưa hỗ trợ giọng đọc.", "Speech synthesis is not supported in this browser."), "info");
  };
  root.addEventListener("click", onClick);
  ctx?.onLeave?.(() => {
    root.removeEventListener("click", onClick);
    delete root.dataset.sayBound;
    lastSay = { text: "", at: 0 };
  });
}

/* Two-tone hand-drawn sketchbook icons for foreign language exercises & cards */
const LP = {
  vol: '<path d="M4.2 9.5v5h3.4l4.4 4V5.5l-4.4 4z" fill="#BAE6FD" stroke="#1C1917" stroke-width="1.8" stroke-linejoin="round"/><path d="M15.4 9.2a4 4 0 0 1 0 5.6M18 6.8a7.4 7.4 0 0 1 0 10.4" stroke="#1C1917" stroke-width="1.8" stroke-linecap="round"/>',
  lock: '<rect x="5" y="10.8" width="14" height="10" rx="2.6" fill="#FEF08A" stroke="#1C1917" stroke-width="1.9"/><path d="M8.2 10.8V7.6a3.8 3.8 0 0 1 7.6 0v3.2" stroke="#1C1917" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="15.8" r="1.4" fill="#1C1917"/>',
  cards: '<rect x="6.8" y="4.5" width="13" height="13.5" rx="2.6" fill="#FED7AA" stroke="#1C1917" stroke-width="1.8"/><rect x="3.8" y="7.2" width="12.5" height="13" rx="2.6" fill="#FEF9C3" stroke="#1C1917" stroke-width="1.9"/><path d="M7 11.6h6M7 15h4.2" stroke="#1C1917" stroke-width="1.7" stroke-linecap="round"/>',
  cap: '<path d="m2.8 9.2 9.2-4.4 9.2 4.4-9.2 4.4z" fill="#FDE047" stroke="#1C1917" stroke-width="1.9" stroke-linejoin="round"/><path d="M6.8 11.5v4.3c1.6 1.5 3.4 2.1 5.2 2.1s3.6-.6 5.2-2.1v-4.3M20.6 9.6v5.2" stroke="#1C1917" stroke-width="1.8" stroke-linecap="round"/>',
  book: '<path d="M12 6.8c-2-1.5-4.4-2-7.8-2v12.8c3.4 0 5.8.5 7.8 2 2-1.5 4.4-2 7.8-2V4.8c-3.4 0-5.8.5-7.8 2z" fill="#BBF7D0" stroke="#1C1917" stroke-width="1.9" stroke-linejoin="round"/><path d="M12 6.8v12.8M6.6 9.5h3.2M6.6 12.6h2.8M14.4 9.5h3.2" stroke="#1C1917" stroke-width="1.6" stroke-linecap="round"/>',
  keys: '<rect x="2.8" y="6.2" width="18.4" height="11.8" rx="3" fill="#FEF08A" stroke="#1C1917" stroke-width="1.9"/><path d="M6.6 10.2h.2M10.2 10.2h.2M13.8 10.2h.2M17.4 10.2h.2M7.6 14.2h8.8" stroke="#1C1917" stroke-width="2" stroke-linecap="round"/>',
  puzzle: '<path d="M8.5 5h3a2 2 0 1 1 3.8 0h3.7v3.8a2 2 0 1 0 0 3.8V19h-4.4a2 2 0 1 0-3.8 0H5v-4.8a2 2 0 1 0 0-3.8V5z" fill="#BAE6FD" stroke="#1C1917" stroke-width="1.8" stroke-linejoin="round"/>',
  link: '<rect x="3.5" y="9" width="8.5" height="6" rx="3" fill="#FBCFE8" stroke="#1C1917" stroke-width="1.8"/><rect x="12" y="9" width="8.5" height="6" rx="3" fill="#FEF08A" stroke="#1C1917" stroke-width="1.8"/><path d="M9.5 12h5" stroke="#1C1917" stroke-width="2" stroke-linecap="round"/>',
  ear: '<path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2" stroke="#1C1917" stroke-width="2" stroke-linecap="round"/><rect x="3.2" y="13.5" width="4.5" height="6.5" rx="2" fill="#BAE6FD" stroke="#1C1917" stroke-width="1.8"/><rect x="16.3" y="13.5" width="4.5" height="6.5" rx="2" fill="#FDE047" stroke="#1C1917" stroke-width="1.8"/>',
  mic: '<rect x="8.6" y="3.2" width="6.8" height="10.8" rx="3.4" fill="#A7F3D0" stroke="#1C1917" stroke-width="1.9"/><path d="M5.5 11.2a6.5 6.5 0 0 0 13 0M12 17.8v3M8.5 21h7" stroke="#1C1917" stroke-width="1.9" stroke-linecap="round"/>',
  flag: '<path d="M5.5 20.8V4.2" stroke="#1C1917" stroke-width="2.1" stroke-linecap="round"/><path d="M5.8 4.8h11.6l-2.3 3.9 2.3 3.9H5.8z" fill="#FCA5A5" stroke="#1C1917" stroke-width="1.8" stroke-linejoin="round"/>',
  page: '<path d="M6 3.5h8.2l3.8 3.8v13.2H6z" fill="#FFFDF7" stroke="#1C1917" stroke-width="1.9" stroke-linejoin="round"/><path d="M14.2 3.5v3.8H18" fill="#FEF08A" stroke="#1C1917" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 11.8h6M9 15.6h5" stroke="#1C1917" stroke-width="1.7" stroke-linecap="round"/>',
  pen: '<path d="m4.5 19.5 1.1-4.2L16.5 4.4a2.1 2.1 0 0 1 3 3L8.6 18.4z" fill="#FDE047" stroke="#1C1917" stroke-width="1.9" stroke-linejoin="round"/><path d="m14.2 6.7 3 3" stroke="#1C1917" stroke-width="1.8"/>',
  ruler: '<path d="M3.5 16.5 16.5 3.5l4 4L7.5 20.5z" fill="#FED7AA" stroke="#1C1917" stroke-width="1.8" stroke-linejoin="round"/><path d="m7.5 12.5 1.5 1.5M10.5 9.5l1.5 1.5M13.5 6.5 15 8" stroke="#1C1917" stroke-width="1.6"/>',
  chat: '<path d="M4.5 5.4c0-.8.7-1.4 1.5-1.4h12c.8 0 1.5.6 1.5 1.4v9c0 .8-.7 1.4-1.5 1.4h-7.2L6.6 19v-3.2H6c-.8 0-1.5-.6-1.5-1.4z" fill="#FEF08A" stroke="#1C1917" stroke-width="1.9" stroke-linejoin="round"/><path d="M8.8 8.7h6.4M8.8 11.8h4.2" stroke="#1C1917" stroke-width="1.7" stroke-linecap="round"/>',
  print: '<path d="M7 8V3.5h10V8" fill="#FFFDF7" stroke="#1C1917" stroke-width="1.8"/><rect x="4.5" y="8" width="15" height="9" rx="1.8" fill="#BAE6FD" stroke="#1C1917" stroke-width="1.8"/><rect x="7" y="14" width="10" height="6.5" rx="1" fill="#FFFDF7" stroke="#1C1917" stroke-width="1.8"/>',
  pin: '<path d="M9 3.5h6l-1 6 3 3.5H7l3-3.5zM12 13v7.5" fill="#FCA5A5" stroke="#1C1917" stroke-width="1.8" stroke-linejoin="round"/>',
  stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="2.5" fill="#FCA5A5" stroke="#1C1917" stroke-width="1.8"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5" stroke="#1C1917" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  spark: '<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z" fill="#FDE047" stroke="#1C1917" stroke-width="1.7" stroke-linejoin="round"/><path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" fill="#F9A8D4" stroke="#1C1917" stroke-width="1.3"/>',
  down: '<path d="m6 9 6 6 6-6" stroke="#1C1917" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
};
const li = (n, s = 20) => `<svg class="lx-ic sk-ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" aria-hidden="true">${LP[n] || LP.page}</svg>`;
const KIND_IC = { nghia: "book", doc: "keys", "ngu-phap": "puzzle", "ghep-cau": "link", nghe: "ear", noi: "mic", "kiem-tra": "flag", "doc-hieu": "page", "luyen-thi": "pen" };
const kindIco = (k) => li(KIND_IC[k] || "page");

const pctBar = (pct, color) => `<span class="bar lx-bar"><i style="width:${Math.max(0, Math.min(100, pct))}%;${color ? `background:${color}` : ""}"></i></span>`;
const scoreTag = (best, pass) => best >= pass ? `<span class="tag tag-la">${icon("check")}${best}</span>` : best > 0 ? `<span class="tag tag-tim">${best}</span>` : `<span class="tag tag-line">Chưa làm</span>`;

function proCard(main, msg) {
  main.innerHTML = `<div class="sheet sheet-pad lx-pro-card"><div class="lx-pro-ico">${li("lock", 34)}</div><h2>Nội dung dành cho thành viên Pro</h2><p>${esc(msg || "Cấp độ này dành cho thành viên Pro.")}</p><div class="row" style="justify-content:center"><a class="btn btn-primary" href="/app/bang-gia">Nâng cấp Pro</a><a class="btn" href="/app/">Về trang chủ</a></div></div>`;
}
async function apiOrPro(main, path) {
  try { return await api(path); } catch (e) { if (e.status === 402) { proCard(main, e.message); return null; } throw e; }
}

/* ---------- Selected subject (saved in browser) ---------- */
const SUBJ_KEY = "pl:subject";
const VALID_SUBJECTS = new Set(["en", "zh", "ja", "ko", "fr", "es"]);
export function getSubject() {
  let v = "";
  try { v = localStorage.getItem(SUBJ_KEY) || ""; } catch {}
  if (!v) v = (S.prefs && S.prefs.subject) || "";
  return VALID_SUBJECTS.has(v) ? v : "";
}
export function setSubject(v) {
  const old = getSubject();
  try { v ? localStorage.setItem(SUBJ_KEY, v) : localStorage.removeItem(SUBJ_KEY); } catch {}
  if (S.prefs && (S.prefs.subject || "") !== (v || "")) savePrefs({ subject: v || "" }); // saved per account
  paintSubjectPill();
  if (old !== (v || "")) setTimeout(() => window.dispatchEvent(new Event("pl:subject")), 0);
}
// "Foreign Languages" menu item: when studying a language, link straight to that course using the subject name.
export function subjectNav(it) {
  const s = getSubject();
  if (!s) return it;
  const MAP = { "chung-nhan": "chung-nhan-cua-toi", "xep-hang": "xep-hang", "huy-hieu": "huy-hieu" };
  if (MAP[it[0]]) return [it[0], it[1], it[2], it[3], it[4], `/app/ngoai-ngu/${MAP[it[0]]}/${s}`];
  const info = subjectInfo(s);
  return ["ngoai-ngu", it[1], info ? info.name : it[2], it[3], it[4], `/app/ngoai-ngu/${s}`];
}
export function subjectInfo(id) {
  if (!id) return null;
  const c = CACHE && CACHE.courses.find((x) => x.id === id);
  const F = { en: ["Tiếng Anh", "🇬🇧", "#0EA5E9"], zh: ["Tiếng Trung", "🇨🇳", "#DC2626"], ja: ["Tiếng Nhật", "🇯🇵", "#BE185D"], ko: ["Tiếng Hàn", "🇰🇷", "#7C3AED"], fr: ["Tiếng Pháp", "🇫🇷", "#2563EB"], es: ["Tiếng Tây Ban Nha", "🇪🇸", "#EA580C"] }[id];
  return c || (F ? { id, name: F[0], flag: F[1], color: F[2] } : { id, name: id, flag: "📚", color: "#5B3FD6" });
}
// Topbar button: shows current subject, click to switch subjects.
export function paintSubjectPill() {
  const bar = document.querySelector(".topbar");
  if (!bar) return;
  let el = document.getElementById("subjPill");
  if (!el) {
    el = document.createElement("a");
    el.id = "subjPill"; el.className = "lx-subj"; el.href = "/app/chon-mon";
    const spacer = bar.querySelector(".spacer");
    bar.insertBefore(el, spacer ? spacer.nextSibling : null);
  }
  const info = subjectInfo(getSubject());
  el.style.setProperty("--c", info ? info.color : "#5B3FD6");
  el.innerHTML = info ? `<span>${info.flag}</span><b>${esc(info.name)}</b><em>Đổi môn</em>` : `<span>📚</span><b>Chọn môn học</b>`;
  el.title = currentLang() === "en" ? "Switch subject" : "Đổi nội dung học";
}

/* ---------- Home page ---------- */
export async function pageHome(main, params, query, ctx) {
  ctx.setCrumbs([["Trang chủ"]]);
  main.innerHTML = `<div class="lx-loading"><span class="spin"></span> Đang tải…</div>`;
  let lang;
  try { lang = await loadLang(true); } catch (e) { lang = { courses: [], pass: 80, kinds: {} }; toast(e.message, "err"); }
  if (!ctx.isCurrent()) return;
  if (query.mon) {
    const ok = lang.courses.some((c) => c.id === query.mon);
    if (ok) setSubject(query.mon);
    try { history.replaceState(null, "", "/app/mon-hoc"); } catch {}
  }
  paintSubjectPill();
  let subj = getSubject();
  if (query.chon || !subj) return pagePicker(main, lang, query, ctx);
  const c = lang.courses.find((x) => x.id === subj);
  if (!c) { setSubject(""); return pagePicker(main, lang, query, ctx); }
  return focusLanguage(main, lang, c, ctx);
}

/* Subject selection screen */
function pagePicker(main, lang, query, ctx) {
  document.body.classList.add("lx-picker");
  const topnav = document.querySelector(".main > .topnav");
  if (topnav) topnav.hidden = true;
  if (ctx && ctx.onLeave) ctx.onLeave(() => {
    document.body.classList.remove("lx-picker");
    const tn = document.querySelector(".main > .topnav");
    if (tn) tn.hidden = false;
  });
  // 5.1.0: course catalog - search, filter by category and status, sort; all run on already-loaded data without extra API calls.
  const py = totalStats();
  const groups = S.groups || [];
  const cur = getSubject();
  const hello = S.me ? esc(S.me.displayName) : "bạn";
  const short = (t) => t.replace(/^(JLPT|CEFR|DELF|DALF|TOPIK|DELE|HSK)\s*/, "");
  const items = [
    ...lang.courses.map((c) => ({ id: c.id, group: "ngoai-ngu", name: c.name, native: c.native, flag: c.flag, color: c.color, meta: c.framework, levels: c.levels.map((l) => short(l.title)), done: c.done, total: c.total, pct: c.pct, pro: c.levels.filter((l) => l.pro).length })),
  ];
  const st = { q: "", group: ["ngoai-ngu"].includes(query.nhom) ? query.nhom : "tat-ca", status: "tat-ca", sort: "mac-dinh" };
  const plain = (s) => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
  const card = (c) => `<a class="lx-pick cat-card ${cur === c.id ? "is-cur" : ""}" href="/app/?mon=${c.id}" style="--c:${esc(c.color)}">
      <span class="cat-top"><span class="cat-flag">${c.flag}</span>${cur === c.id ? `<em class="lx-pick-cur">Đang học</em>` : ""}${c.pro ? `<span class="tag tag-line">${c.pro} cấp Pro</span>` : ""}</span>
      <span class="lx-pick-body"><b>${esc(c.name)}</b><span>${esc(c.meta)}</span>
        ${c.levels.length ? `<span class="cat-levels">${c.levels.map((l) => `<i>${esc(l)}</i>`).join("")}</span>` : ""}
        <span class="lx-card-foot"><span>${fmtN(c.done)}/${fmtN(c.total)} bài đạt · ${c.pct}%</span>${pctBar(c.pct, c.color)}</span></span>
      <span class="btn btn-primary btn-sm">${c.done ? "Tiếp tục học" : "Bắt đầu học"}</span>
    </a>`;
  main.innerHTML = `
  <section class="lx-hero lx-hero-pick">
    <div>
      <span class="edu-eyebrow">LIFERIVO</span>
      <h1>Chào ${hello}, bạn muốn học gì?</h1>
      <p>Chọn một môn để trang tổng quan tập trung vào môn đó. Bạn có thể đổi môn bất cứ lúc nào bằng nút <b>Đổi môn</b> trên thanh trên cùng; tiến độ các môn luôn được giữ nguyên.</p>
    </div>
  </section>
  <div class="cat-bar">
    <label class="cat-search">${icon("search")}<input type="search" id="catQ" placeholder="Tìm khóa học…" aria-label="Tìm khóa học" autocomplete="off"></label>
    <div class="cat-seg" role="group" aria-label="Nhóm môn">${[["tat-ca", "Tất cả"], ["ngoai-ngu", "Ngoại ngữ"]].map(([k, l]) => `<button type="button" data-group="${k}" class="${st.group === k ? "on" : ""}" aria-pressed="${st.group === k}">${l}</button>`).join("")}</div>
    <select class="input cat-select" id="catStatus" aria-label="Lọc theo trạng thái"><option value="tat-ca">Mọi trạng thái</option><option value="dang-hoc">Đang học</option><option value="chua">Chưa bắt đầu</option><option value="xong">Đã hoàn thành</option></select>
    <select class="input cat-select" id="catSort" aria-label="Sắp xếp"><option value="mac-dinh">Sắp xếp: mặc định</option><option value="tien-do">Tiến độ cao nhất</option><option value="ten">Tên A–Z</option></select>
  </div>
  <p class="cat-count small muted" id="catCount" aria-live="polite"></p>
  <div class="lx-pick-grid" id="catGrid"></div>`;
  const toDockTopic = (c) => ({
    flag: c.flag,
    title: c.name,
    sub: c.done ? `${c.meta} · ${fmtN(c.done)}/${fmtN(c.total)} bài đạt` : `${c.meta} · Bắt đầu học`,
  });
  let pickerDock = null;
  const paintGrid = () => {
    let list = items.filter((c) => st.group === "tat-ca" || c.group === st.group)
      .filter((c) => st.status === "tat-ca" || (st.status === "dang-hoc" ? c.done > 0 && c.pct < 100 : st.status === "chua" ? c.done === 0 : c.pct === 100))
      .filter((c) => !st.q || plain(`${c.name} ${c.native} ${c.meta} ${c.levels.join(" ")}`).includes(plain(st.q)));
    if (st.sort === "tien-do") list = list.slice().sort((a, b) => b.pct - a.pct);
    else if (st.sort === "ten") list = list.slice().sort((a, b) => a.name.localeCompare(b.name, "vi"));
    main.querySelector("#catCount").textContent = `${list.length}/${items.length} khóa học`;
    main.querySelector("#catGrid").innerHTML = list.length ? list.map(card).join("") : `<div class="cat-empty">${emptyState("search", "Không tìm thấy khóa học phù hợp", "Thử từ khóa khác hoặc bỏ bớt bộ lọc.")}</div>`;
    if (pickerDock && list.length) pickerDock.setTopics(list.map(toDockTopic), 0);
  };
  main.querySelector("#catQ").addEventListener("input", (e) => { st.q = e.target.value.trim(); paintGrid(); });
  main.querySelector("#catStatus").addEventListener("change", (e) => { st.status = e.target.value; paintGrid(); });
  main.querySelector("#catSort").addEventListener("change", (e) => { st.sort = e.target.value; paintGrid(); });
  main.querySelectorAll("[data-group]").forEach((b) => b.addEventListener("click", () => { st.group = b.dataset.group; main.querySelectorAll("[data-group]").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", String(x === b)); }); paintGrid(); }));
  paintGrid();

  if (items.length) {
    const curIdx = Math.max(0, items.findIndex((c) => c.id === cur));
    pickerDock = mountCatScrollDock({
      host: main,
      topics: items.map(toDockTopic),
      initialIndex: curIdx,
      kicker: "Danh mục ngoại ngữ",
      hint: "Bấm để mèo lật môn",
      ariaLabel: "Mèo lật trang danh mục ngoại ngữ",
      extraClass: "in-picker",
      autoCycleMs: 4000,
    });
    if (ctx && ctx.onLeave && pickerDock) ctx.onLeave(() => pickerDock.destroy());
  }
}


/* Evidence-based learning insights card for the focused language overview. */
function languageInsightsHtml(insight, plan = null, report = null, history = null, historyDays = 30) {
  const performance = insight.performance || {};
  const vocabulary = insight.vocabulary || {};
  const progress = insight.courseProgress || {};
  const focus = [...(insight.weaknesses || []), ...(insight.watchSkills || [])].slice(0, 2);
  const recommendations = (insight.recommendations || []).slice(0, 3);
  const sampleExercises = Number(performance.sampleExercises) || 0;
  const activityMap = new Map((Array.isArray(insight.activity) ? insight.activity : []).map((item) => [String(item.date), Math.max(0, Number(item.count) || 0)]));
  const todayIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const anchorDate = new Date(`${todayIso}T12:00:00Z`);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(anchorDate);
    date.setUTCDate(date.getUTCDate() - (6 - index));
    const iso = date.toISOString().slice(0, 10);
    return {
      iso,
      count: activityMap.get(iso) || 0,
      label: date.toLocaleDateString(currentLang() === "en" ? "en-GB" : "vi-VN", { weekday: "short", timeZone: "UTC" }),
    };
  });
  const activityTotal = days.reduce((sum, day) => sum + day.count, 0);
  const activeDays = days.filter((day) => day.count > 0).length;
  const maxActivity = Math.max(1, ...days.map((day) => day.count));
  const metric = (label, value, hint, symbol) => `<div class="lx-ai-metric"><span class="lx-ai-metric-symbol">${icon(symbol)}</span><span class="lx-ai-metric-label">${label}</span><b>${value}</b><small>${hint}</small></div>`;
  const chartBars = days.map((day) => {
    const height = day.count ? Math.max(10, Math.round((day.count / maxActivity) * 100)) : 4;
    return `<div class="lx-ai-day" title="${esc(day.iso)} · ${fmtN(day.count)} ${tx("lượt học", "learning actions")}" aria-label="${esc(day.iso)}: ${fmtN(day.count)} ${tx("lượt học", "learning actions")}"><div class="lx-ai-day-bar"><i style="height:${height}%"></i></div><span>${esc(day.label)}</span></div>`;
  }).join("");
  const skillsHtml = focus.length ? focus.map((item) => {
    const score = Math.max(0, Math.min(100, Number(item.averageRecent) || 0));
    const isWeak = item.status === "needs_review";
    return `<article class="lx-ai-skill ${isWeak ? "is-weak" : "is-watch"}">
      <div class="lx-ai-skill-top"><span class="lx-ai-skill-icon">${icon("book")}</span><div class="lx-ai-skill-title"><b>${esc(item.title)}</b><small>${fmtN(item.exerciseCount)} ${tx("bài đã có kết quả", "scored exercises")}</small></div><strong>${fmtN(score)}%</strong></div>
      <div class="lx-ai-track" role="progressbar" aria-label="${esc(item.title)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${score}"><i style="width:${score}%"></i></div>
      <p>${isWeak ? tx("Nhóm kỹ năng này đang dưới ngưỡng đạt. Hãy luyện thêm trước khi chuyển sang nội dung mới.", "This skill group is below the pass threshold. Practise it before moving to new content.") : tx("Đây là tín hiệu ban đầu. Cần thêm kết quả để xác nhận xu hướng.", "This is an early signal. More results are needed to confirm the trend.")}</p>
    </article>`;
  }).join("") : `<div class="lx-ai-empty-state"><span>${icon("sparkle")}</span><b>${sampleExercises < 3 ? tx("Hãy học thêm để AI hiểu cách bạn học", "Keep learning so AI can understand your study patterns") : tx("Bạn đang theo dõi tốt các kỹ năng", "Your tracked skills are currently on track")}</b><p>${esc(insight.dataSufficiency?.message || tx("Khi có đủ kết quả, LifeRivo sẽ chỉ ra nhóm kỹ năng cần ưu tiên.", "Once there is enough evidence, LifeRivo will identify the skills to focus on."))}</p></div>`;
  const speaking = insight.speaking || {};
  const speakingScore = speaking.averageRecent == null ? null : Math.max(0, Math.min(100, Number(speaking.averageRecent) || 0));
  const speakingStatus = speaking.status === "needs_review" ? tx("Cần củng cố", "Needs practice") : speaking.status === "watch" ? tx("Theo dõi thêm", "Keep tracking") : speaking.status === "on_track" ? tx("Đang ổn", "On track") : tx("Chưa đủ dữ liệu", "Not enough data");
  const speakingHtml = `<article class="lx-ai-speaking-card ${speaking.status === "needs_review" ? "is-weak" : ""}"><div class="lx-ai-speaking-top"><span class="lx-ai-skill-icon">${icon("mic")}</span><div><b>${tx("Luyện nói", "Speaking practice")}</b><small>${fmtN(speaking.sampleItems || 0)} ${tx("mục đã chấm", "scored items")} · ${fmtN(speaking.attempts || 0)} ${tx("lượt", "attempts")}</small></div><strong>${speakingScore == null ? "—" : `${fmtN(speakingScore)}%`}</strong></div><p>${speakingScore == null ? tx("Khi bạn luyện nói và có ít nhất 3 mục được chấm, LifeRivo sẽ phân tích kết quả.", "After at least 3 scored speaking items, LifeRivo can analyse the results.") : `${speakingStatus}. ${tx("Điểm dựa trên độ khớp câu/từ được hệ thống ghi nhận, không phải phân tích âm vị chuyên sâu.", "This score reflects system-recorded word/sentence matching, not detailed phoneme analysis.")}`}</p>${speaking.sampleItems > 0 ? `<a class="lx-ai-speaking-link" href="/app/ngoai-ngu/luyen-noi/${encodeURIComponent(String(insight.lang || "en"))}">${tx("Mở phòng luyện nói", "Open speaking studio")} ${icon("right")}</a>` : ""}</article>`;
  const reportText = String(report?.reportText || "").trim();
  const reportHtml = `<section class="lx-ai-report-panel"><div class="lx-ai-report-head"><div><span class="lx-ai-section-kicker">${tx("AI LEARNING ANALYST", "AI LEARNING ANALYST")}</span><h3>${tx("Báo cáo học tập cá nhân", "Personal learning report")}</h3><p>${tx("AI nhận xét dựa trên dữ liệu của riêng khóa ngoại ngữ này.", "AI analysis based only on this foreign-language course data.")}</p></div><div class="lx-ai-report-actions"><button type="button" class="btn btn-primary btn-sm" data-generate-report>${reportText ? tx("Làm mới báo cáo", "Refresh report") : tx("Tạo báo cáo AI", "Generate AI report")}</button>${reportText ? `<button type="button" class="btn btn-sm" data-print-report>${tx("In / Lưu PDF", "Print / Save PDF")}</button>` : ""}</div></div>${reportText ? `<div class="lx-ai-report-body">${mdLite(reportText)}</div><small class="lx-ai-report-meta">${tx("Hoạt động 7 ngày", "7-day activity period")}: ${esc(report.periodStart || "")} – ${esc(report.periodEnd || "")} · ${tx("Điểm bài và tiến độ là ảnh chụp hiện tại", "Exercise scores and progress are current snapshots")} · ${report.createdAt ? esc(new Date(report.createdAt).toLocaleString(currentLang() === "en" ? "en-GB" : "vi-VN")) : ""}</small>` : `<div class="lx-ai-report-empty">${tx("Chưa có báo cáo AI. Tạo báo cáo để nhận nhận xét về điểm mạnh, nội dung cần củng cố và kế hoạch tuần tới.", "No AI report yet. Generate one to review strengths, areas to improve and a plan for next week.")}</div>`}</section>`;
  const recommendationHtml = recommendations.length ? recommendations.map((item, index) => `<a class="lx-ai-recommend" href="${esc(item.href)}"><span class="lx-ai-recommend-number">0${index + 1}</span><span class="lx-ai-recommend-copy"><b>${esc(item.title)}</b><small>${esc(item.description)}</small><em>${fmtN(item.estimatedMinutes)} ${tx("phút dự kiến", "min estimated")}</em></span>${icon("right")}</a>`).join("") : `<p class="lx-ai-empty">${tx("Hoàn thành thêm bài học hoặc ôn tập để nhận đề xuất phù hợp.", "Complete more lessons or reviews to receive tailored recommendations.")}</p>`;
  const rhythm = insight.learningRhythm || {};
  const dropOff = insight.dropOffRisk || {};
  const riskLabel = dropOff.level === "high" ? tx("Nguy cơ gián đoạn cao", "High interruption risk") : dropOff.level === "elevated" ? tx("Có dấu hiệu chậm nhịp", "Elevated interruption signals") : dropOff.level === "low" ? tx("Nhịp học ổn định", "Learning rhythm steady") : tx("Chưa đủ dữ liệu", "Not enough data");
  const rhythmClass = dropOff.level === "high" ? "is-risk" : dropOff.level === "elevated" ? "is-watch" : "is-steady";
  const rhythmReasons = (dropOff.reasons || rhythm.reasons || []).slice(0, 2);
  const rhythmHtml = `<section class="lx-ai-rhythm ${rhythmClass}"><div class="lx-ai-rhythm-icon">${icon("history")}</div><div class="lx-ai-rhythm-copy"><span class="lx-ai-section-kicker">${tx("NHỊP HỌC & DẤU HIỆU GIÁN ĐOẠN", "LEARNING RHYTHM & INTERRUPTION SIGNALS")}</span><b>${riskLabel}</b><p>${esc(rhythm.message || tx("LifeRivo theo dõi hoạt động của riêng khóa ngoại ngữ này.", "LifeRivo tracks activity for this language course only."))}</p>${rhythmReasons.length ? `<small>${rhythmReasons.map(esc).join(" · ")}</small>` : ""}<small>${tx("Chỉ báo theo quy tắc hoạt động, không phải dự báo ML hoặc đánh giá tâm lý.", "Rule-based activity indicator, not an ML prediction or psychological assessment.")}</small></div>${dropOff.score == null ? `<span class="lx-ai-rhythm-score">—</span>` : `<span class="lx-ai-rhythm-score">${fmtN(dropOff.score)}<small>/100</small></span>`}</section>`;
  const learningScore = insight.learningScore || {};
  const scoreValue = learningScore.score == null ? null : Math.max(0, Math.min(100, Number(learningScore.score) || 0));
  const scoreStatus = ({ focus_needed: tx("Cần củng cố", "Needs reinforcement"), building: tx("Đang xây nền", "Building foundations"), steady_progress: tx("Tiến bộ ổn định", "Steady progress"), strong_progress: tx("Duy trì tốt", "Strong progress") })[learningScore.status] || tx("Chưa đủ dữ liệu", "Not enough data");
  const scoreConfidence = learningScore.confidence === "high" ? tx("Độ tin cậy: cao", "Confidence: high") : learningScore.confidence === "medium" ? tx("Độ tin cậy: trung bình", "Confidence: medium") : tx("Chưa đủ bằng chứng để tính", "Not enough evidence to score");
  const scoreLabels = {
    accuracy: tx("Kết quả bài tập", "Exercise accuracy"),
    speaking_practice: tx("Độ khớp câu/từ khi luyện nói", "Speaking sentence/word match"),
    pronunciation: tx("Phát âm (ước lượng AI)", "Pronunciation (AI estimate)"),
    review_progress: tx("Tiến độ ôn từ", "Vocabulary review progress"),
    consistency: tx("Độ đều đặn", "Consistency"),
    course_progress: tx("Hoàn thành khóa", "Course completion"),
  };
  const scoreComponents = Array.isArray(learningScore.components) ? learningScore.components : [];
  const scoreBars = scoreComponents.map((component) => {
    const value = Math.max(0, Math.min(100, Number(component.score) || 0));
    return `<div class="lx-ai-score-component"><div><span>${esc(scoreLabels[component.key] || component.key)}</span><b>${fmtN(value)}%</b></div><i><em style="width:${value}%"></em></i></div>`;
  }).join("");
  const learningScoreHtml = `<section class="lx-ai-score-card"><div class="lx-ai-score-main"><div class="lx-ai-score-ring ${scoreValue == null ? "is-empty" : ""}" style="--score:${scoreValue == null ? 0 : scoreValue}"><span>${scoreValue == null ? "—" : fmtN(scoreValue)}<small>${scoreValue == null ? "" : "/100"}</small></span></div><div class="lx-ai-score-copy"><span class="lx-ai-section-kicker">${tx("CHỈ SỐ TIẾN BỘ HỌC TẬP", "LEARNING PROGRESS INDEX")}</span><b>${scoreStatus}</b><p>${scoreValue == null ? tx("Cần thêm kết quả bài tập, lịch ôn từ hoặc hoạt động học trong khóa này để tính chỉ số.", "More exercise results, vocabulary review records or study activity are needed to calculate this index.") : tx("Chỉ số tổng hợp nội bộ từ dữ liệu của khóa ngoại ngữ đang mở.", "An internal score calculated from the currently selected language course data.")}</p><small class="lx-ai-score-confidence">${scoreConfidence}</small></div></div>${scoreBars ? `<div class="lx-ai-score-breakdown">${scoreBars}</div>` : ""}<small class="lx-ai-score-note">${esc(learningScore.note || tx("Không phải điểm CEFR hoặc chứng chỉ năng lực. Thành phần chưa đủ dữ liệu sẽ không được tính.", "Not a CEFR score or proficiency certificate. Components without enough evidence are excluded."))}</small></section>`;
  const radarItems = Array.isArray(insight.skillRadar) ? insight.skillRadar : [];
  const radarSize = 320, radarCenter = 160, radarRadius = 86;
  const radarPoint = (index, radius) => {
    const angle = (-90 + index * 360 / Math.max(1, radarItems.length)) * Math.PI / 180;
    return [radarCenter + Math.cos(angle) * radius, radarCenter + Math.sin(angle) * radius];
  };
  const radarGrid = [25, 50, 75, 100].map((level) => `<polygon points="${radarItems.map((_, index) => radarPoint(index, radarRadius * level / 100).map((n) => n.toFixed(1)).join(",")).join(" ")}" />`).join("");
  const radarAxes = radarItems.map((item, index) => { const [x, y] = radarPoint(index, radarRadius); return `<line x1="${radarCenter}" y1="${radarCenter}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" />`; }).join("");
  const radarDots = radarItems.map((item, index) => {
    if (item.score == null || !item.enoughData) return "";
    const [x, y] = radarPoint(index, radarRadius * Math.max(0, Math.min(100, Number(item.score) || 0)) / 100);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5"><title>${esc(item.label)}: ${fmtN(item.score)}% · ${fmtN(item.sampleCount || 0)} ${tx("mẫu", "samples")}</title></circle>`;
  }).join("");
  const radarLabelsByKey = {
    vocabulary: tx("Từ vựng", "Vocabulary"), grammar: tx("Ngữ pháp", "Grammar"), listening: tx("Nghe", "Listening"),
    reading: tx("Đọc hiểu", "Reading"), writing: tx("Viết", "Writing"), speaking: tx("Luyện nói", "Speaking"), pronunciation: tx("Phát âm", "Pronunciation"),
  };
  const radarLabels = radarItems.map((item, index) => {
    const [x, y] = radarPoint(index, radarRadius + 30);
    const anchor = x < radarCenter - 10 ? "end" : x > radarCenter + 10 ? "start" : "middle";
    const label = radarLabelsByKey[item.key] || item.label;
    return `<text x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="${anchor}">${esc(label)} ${item.score == null || !item.enoughData ? "—" : `${fmtN(item.score)}%`}</text>`;
  }).join("");
  const radarAvailable = radarItems.filter((item) => item.score != null && item.enoughData).length;
  const radarHtml = `<section class="lx-ai-panel lx-ai-radar-panel"><div class="lx-ai-panel-head"><div><span class="lx-ai-section-kicker">${tx("BẢN ĐỒ NĂNG LỰC", "SKILL RADAR")}</span><h3>${tx("Hồ sơ kỹ năng ngoại ngữ", "Language skill profile")}</h3><p>${tx("Chỉ số có đủ mẫu mới được hiển thị; mục thiếu dữ liệu được để trống.", "Only skills with enough samples are scored; insufficient data remains blank.")}</p></div><span class="lx-ai-panel-icon">${icon("chart")}</span></div><div class="lx-ai-radar-layout"><svg class="lx-ai-radar-svg" viewBox="0 0 ${radarSize} ${radarSize}" role="img" aria-label="${tx("Biểu đồ radar kỹ năng ngoại ngữ", "Foreign-language skill radar chart")}"><g class="lx-ai-radar-grid">${radarGrid}${radarAxes}</g><g class="lx-ai-radar-dots">${radarDots}</g>${radarLabels}</svg><div class="lx-ai-radar-legend"><b>${radarAvailable}/${radarItems.length} ${tx("kỹ năng đủ dữ liệu", "skills with sufficient data")}</b><small>${tx("Cần ít nhất 3 kết quả phù hợp cho mỗi nhóm. Điểm luyện nói và phát âm là hai phép chấm khác nhau.", "At least 3 relevant results are required per skill. Speaking and pronunciation are separate scoring signals.")}</small></div></div></section>`;
  const memory = vocabulary.memory || {};
  const repeatWords = Array.isArray(memory.repeatMistakeWords) ? memory.repeatMistakeWords.slice(0, 5) : [];
  const vocabularyMemoryHtml = `<section class="lx-ai-panel lx-ai-memory-panel"><div class="lx-ai-panel-head"><div><span class="lx-ai-section-kicker">${tx("SMART VOCABULARY MEMORY", "SMART VOCABULARY MEMORY")}</span><h3>${tx("Theo dõi các lượt ôn từ", "Vocabulary review history")}</h3><p>${tx("Dựa trên kết quả ôn đã lưu trong 30 ngày gần đây.", "Based on recorded review attempts over the last 30 days.")}</p></div><span class="lx-ai-panel-icon">${icon("book")}</span></div><div class="lx-ai-memory-stats"><div><b>${fmtN(memory.reviews30d || 0)}</b><small>${tx("lượt ôn", "reviews")}</small></div><div><b>${memory.successRate30d == null ? "—" : `${fmtN(memory.successRate30d)}%`}</b><small>${tx("tỷ lệ đúng", "correct rate")}</small></div><div><b>${fmtN(memory.uniqueWordsReviewed30d || 0)}</b><small>${tx("từ đã ôn", "words reviewed")}</small></div></div>${repeatWords.length ? `<div class="lx-ai-memory-words"><b>${tx("Từ đã có ít nhất 2 lượt ôn sai", "Words with at least 2 incorrect reviews")}</b><div>${repeatWords.map((word) => `<span>${esc(word.word)} <small>×${fmtN(word.mistakes)}</small></span>`).join("")}</div></div>` : `<p class="lx-ai-empty">${tx("Chưa có từ nào được ghi nhận sai lặp lại. Hãy tiếp tục ôn tập để tích lũy dữ liệu.", "No repeated vocabulary mistakes have been recorded yet. Keep reviewing to build a history.")}</p>`}<small class="lx-ai-score-note">${esc(memory.note || "")}</small><div class="row" style="gap:12px;flex-wrap:wrap"><a class="lx-ai-speaking-link" href="/app/ngoai-ngu/on-tap/${encodeURIComponent(String(insight.lang || "en"))}">${tx("Mở kho ôn từ", "Open vocabulary review")} ${icon("right")}</a><a class="lx-ai-speaking-link" href="/app/ngoai-ngu/on-tap/${encodeURIComponent(String(insight.lang || "en"))}?mode=mistakes">${tx("Ôn từ hay sai", "Review mistakes")} ${icon("right")}</a></div></section>`;
  const pronunciation = insight.pronunciation || {};
  const pronunciationHtml = `<section class="lx-ai-panel lx-ai-pron-panel"><div class="lx-ai-panel-head"><div><span class="lx-ai-section-kicker">${tx("AI PRONUNCIATION COACH", "AI PRONUNCIATION COACH")}</span><h3>${tx("Theo dõi phát âm", "Pronunciation assessment")}</h3><p>${tx("Điểm ước lượng từ mô hình phân tích âm thanh; không phải phép đo âm vị chuẩn hóa.", "Model-estimated audio scores; not standardized phoneme measurements.")}</p></div><span class="lx-ai-panel-icon">${icon("mic")}</span></div><div class="lx-ai-pron-stats"><div><b>${pronunciation.averageAccuracy == null ? "—" : `${fmtN(pronunciation.averageAccuracy)}%`}</b><small>${tx("độ chính xác ước lượng", "estimated accuracy")}</small></div><div><b>${pronunciation.averageFluency == null ? "—" : `${fmtN(pronunciation.averageFluency)}%`}</b><small>${tx("độ trôi chảy ước lượng", "estimated fluency")}</small></div><div><b>${fmtN(pronunciation.sampleCount || 0)}</b><small>${tx("lượt chấm", "assessments")}</small></div></div><p class="lx-ai-pron-note">${pronunciation.sampleCount ? tx("Mỗi lượt chỉ lưu điểm và góp ý theo từ; tệp âm thanh không được lưu trong lịch sử.", "Only scores and word-level feedback are retained; audio files are not stored in history.") : tx("Hãy thực hiện ít nhất 3 lượt chấm phát âm để LifeRivo bắt đầu tổng hợp xu hướng.", "Complete at least 3 pronunciation assessments to start tracking a trend.")}</p>${Array.isArray(pronunciation.wordIssues) && pronunciation.wordIssues.length ? `<div class="lx-ai-pron-issues"><b>${tx("Từ có góp ý lặp lại", "Words with repeated feedback")}</b>${pronunciation.wordIssues.slice(0, 4).map((item) => `<div><span>${esc(item.word)} <small>${fmtN(item.averageScore)}% · ${fmtN(item.sampleCount)} ${tx("mẫu", "samples")}</small></span>${item.tip ? `<small>${esc(item.tip)}</small>` : ""}</div>`).join("")}</div>` : ""}<a class="lx-ai-speaking-link" href="/app/ngoai-ngu/luyen-noi/${encodeURIComponent(String(insight.lang || "en"))}?muc=phat-am">${tx("Mở AI Pronunciation Coach", "Open AI Pronunciation Coach")} ${icon("right")}</a></section>`;
  const historyPoints = (Array.isArray(history?.points) ? history.points : []).filter((point) => point.learningScore != null && Number.isFinite(Number(point.learningScore)));
  const histW = 560, histH = 168, histPad = { l: 28, r: 16, t: 14, b: 28 };
  const histX = (index) => histPad.l + (historyPoints.length <= 1 ? 0 : index * (histW - histPad.l - histPad.r) / (historyPoints.length - 1));
  const histY = (score) => histPad.t + (100 - Math.max(0, Math.min(100, Number(score) || 0))) / 100 * (histH - histPad.t - histPad.b);
  const historyLine = historyPoints.map((point, index) => `${histX(index).toFixed(1)},${histY(point.learningScore).toFixed(1)}`).join(" ");
  const historyDots = historyPoints.map((point, index) => `<circle cx="${histX(index).toFixed(1)}" cy="${histY(point.learningScore).toFixed(1)}" r="3.5"><title>${esc(point.date)}: ${fmtN(point.learningScore)}/100</title></circle>`).join("");
  const historyHtml = `<section class="lx-ai-panel lx-ai-history-panel"><div class="lx-ai-panel-head"><div><span class="lx-ai-section-kicker">${tx("TIẾN BỘ DÀI HẠN", "LONG-TERM PROGRESS")}</span><h3>${tx("Lịch sử 30–90 ngày", "30–90 day history")}</h3><p>${tx("Mỗi điểm là ảnh chụp Learning Progress Index đã được ghi nhận trong ngày.", "Each point is a daily snapshot of the Learning Progress Index.")}</p></div><div class="lx-ai-history-range"><button type="button" data-history-days="30" class="${Number(historyDays) === 30 ? "active" : ""}">30 ${tx("ngày", "days")}</button><button type="button" data-history-days="90" class="${Number(historyDays) === 90 ? "active" : ""}">90 ${tx("ngày", "days")}</button></div></div>${historyPoints.length >= 2 ? `<div class="lx-ai-history-chart"><svg viewBox="0 0 ${histW} ${histH}" role="img" aria-label="${tx("Lịch sử chỉ số tiến bộ", "Learning progress history")}"><g class="lx-ai-history-grid"><line x1="${histPad.l}" y1="${histY(100)}" x2="${histW - histPad.r}" y2="${histY(100)}"/><line x1="${histPad.l}" y1="${histY(50)}" x2="${histW - histPad.r}" y2="${histY(50)}"/><line x1="${histPad.l}" y1="${histY(0)}" x2="${histW - histPad.r}" y2="${histY(0)}"/></g><polyline points="${historyLine}" fill="none"/><g class="lx-ai-history-dots">${historyDots}</g><text x="${histPad.l}" y="${histH - 7}">${esc(historyPoints[0].date)}</text><text x="${histW - histPad.r}" y="${histH - 7}" text-anchor="end">${esc(historyPoints.at(-1).date)}</text></svg></div><div class="lx-ai-history-meta"><b>${historyPoints.length}</b> ${tx("ngày có đủ dữ liệu để tính chỉ số", "days with sufficient data for a score")}</div>` : `<div class="lx-ai-history-empty"><b>${tx("Đang tích lũy lịch sử tiến bộ", "Building your progress history")}</b><p>${esc(history?.message || tx("Cần ít nhất hai ngày có đủ dữ liệu để vẽ xu hướng. Lịch sử bắt đầu từ khi tính năng được bật.", "At least two days with sufficient data are needed to show a trend. History begins when this feature is enabled."))}</p></div>`}</section>`;
  const planDays = Array.isArray(plan?.days) ? plan.days : [];
  const planAdaptation = String(plan?.adaptation?.rationale || "").trim();
  const planAdaptationHtml = planAdaptation ? `<div class="lx-ai-plan-adaptation"><b>${tx("Vì sao kế hoạch được điều chỉnh?", "Why this plan was adapted")}</b><p>${esc(planAdaptation)}</p></div>` : "";
  const planHtml = plan ? `<div class="lx-ai-plan-progress"><div><b>${fmtN(plan.completedItems || 0)}/${fmtN(plan.totalItems || 0)}</b><span>${tx("nhiệm vụ đã hoàn thành", "tasks completed")}</span></div><strong>${fmtN(plan.progressPercent || 0)}%</strong><div class="lx-ai-plan-track"><i style="width:${Math.max(0, Math.min(100, Number(plan.progressPercent) || 0))}%"></i></div></div>${planAdaptationHtml}<div class="lx-ai-plan-days">${planDays.map((day) => `<article class="lx-ai-plan-day"><div class="lx-ai-plan-day-head"><b>${tx("Ngày", "Day")} ${fmtN(day.dayNo)}</b><small>${esc(day.date || "")}</small></div>${(day.tasks || []).map((task) => `<div class="lx-ai-plan-task ${task.status === "completed" ? "is-done" : ""}"><a href="${esc(task.href)}"><b>${esc(task.title)}</b><small>${esc(task.description)}</small><em>${fmtN(task.estimatedMinutes)} ${tx("phút", "min")}</em></a><button type="button" class="lx-ai-plan-check" data-plan-item="${esc(task.id)}" data-status="${task.status === "completed" ? "pending" : "completed"}" aria-label="${task.status === "completed" ? tx("Đánh dấu chưa hoàn thành", "Mark incomplete") : tx("Đánh dấu hoàn thành", "Mark complete")}" aria-pressed="${task.status === "completed" ? "true" : "false"}">${task.status === "completed" ? icon("check") : "○"}</button></div>`).join("")}</article>`).join("")}</div>` : `<div class="lx-ai-plan-empty"><div><b>${tx("Chưa có kế hoạch cá nhân", "No personal plan yet")}</b><p>${tx("Tạo kế hoạch 7 ngày từ tiến độ, nội dung cần ôn và thời lượng bạn chọn.", "Generate a 7-day plan from your progress, review needs and preferred daily time.")}</p></div></div>`;

  return `<div class="lx-ai-insights-card">
    <header class="lx-ai-insights-head">
      <div class="lx-ai-title-group"><span class="lx-ai-eyebrow"><span class="lx-ai-pulse"></span>${tx("TRỢ LÝ HỌC TẬP CÁ NHÂN", "PERSONAL LEARNING ASSISTANT")}</span><h2>AI Learning Insights</h2><p>${tx("Hiểu tiến độ, nhận diện nội dung cần củng cố và chọn bước học tiếp theo.", "Understand your progress, spot areas to strengthen and choose your next learning step.")}</p></div>
      <span class="lx-ai-mark" aria-hidden="true">${icon("sparkle")}</span>
    </header>
    ${learningScoreHtml}
    <div class="lx-ai-metrics">
      ${metric(tx("Điểm kết quả theo bài", "Latest score by exercise"), performance.recentAverage == null ? "—" : `${fmtN(performance.recentAverage)}%`, tx(`${fmtN(sampleExercises)} bài có kết quả`, `${fmtN(sampleExercises)} exercises with results`), "chart")}
      ${metric(tx("Điểm luyện nói", "Speaking practice"), speakingScore == null ? "—" : `${fmtN(speakingScore)}%`, tx(`${fmtN(speaking.sampleItems || 0)} mục đã chấm`, `${fmtN(speaking.sampleItems || 0)} items scored`), "mic")}
      ${metric(tx("Từ đến hạn ôn", "Words due for review"), fmtN(vocabulary.due || 0), tx(`${fmtN(vocabulary.tracked || 0)} từ đang theo dõi`, `${fmtN(vocabulary.tracked || 0)} words tracked`), "book")}
      ${metric(tx("Tiến độ khóa học", "Course progress"), `${fmtN(progress.percent || 0)}%`, tx(`${fmtN(progress.completed || 0)}/${fmtN(progress.total || 0)} bài đạt`, `${fmtN(progress.completed || 0)}/${fmtN(progress.total || 0)} passed`), "chart")}
    </div>
    ${reportHtml}
    <div class="lx-ai-insights-grid lx-ai-insights-grid-wide">
      ${radarHtml}
      ${historyHtml}
      ${vocabularyMemoryHtml}
      ${pronunciationHtml}
      <section class="lx-ai-panel lx-ai-focus-panel">
        <div class="lx-ai-panel-head"><div><span class="lx-ai-section-kicker">${tx("PHÂN TÍCH KỸ NĂNG", "SKILL ANALYSIS")}</span><h3>${tx("Nội dung nên tập trung", "Areas to focus on")}</h3></div><span class="lx-ai-panel-icon">${icon("chart")}</span></div>
        <div class="lx-ai-skills-list">${skillsHtml}${speakingHtml}</div>
      </section>
      <section class="lx-ai-panel lx-ai-activity-panel">
        <div class="lx-ai-panel-head"><div><span class="lx-ai-section-kicker">${tx("NHỊP HỌC TẬP", "LEARNING RHYTHM")}</span><h3>${tx("Hoạt động 7 ngày", "Activity · last 7 days")}</h3></div><span class="lx-ai-panel-icon">${icon("history")}</span></div>
        <div class="lx-ai-activity-summary"><b>${fmtN(activityTotal)}</b><span>${tx("lượt học trong tuần", "learning actions this week")}</span><em>${activeDays}/7 ${tx("ngày có học", "active days")}</em></div>
        <div class="lx-ai-chart" role="img" aria-label="${tx("Biểu đồ số lượt học trong 7 ngày gần đây", "Chart of learning actions over the last 7 days")}">${chartBars}</div>
        <p class="lx-ai-chart-note">${tx("Mỗi cột thể hiện số lượt hoạt động học được ghi nhận trong ngày, không phải thời gian học.", "Each bar shows recorded learning actions for the day, not study time.")}</p>
      </section>
    </div>
    ${rhythmHtml}
    <section class="lx-ai-plan-panel">
      <div class="lx-ai-panel-head"><div><span class="lx-ai-section-kicker">${tx("LỘ TRÌNH CÁ NHÂN", "PERSONAL STUDY PATH")}</span><h3>${tx("Kế hoạch học 7 ngày", "Your 7-day study plan")}</h3><p>${tx("Chỉ gồm hoạt động của khóa ngoại ngữ đang mở.", "Only activities from the currently selected language course.")}</p></div><div class="lx-ai-plan-actions"><select data-plan-goal aria-label="${tx("Thời lượng học mỗi ngày", "Daily study goal")}"><option value="15" ${Number(plan?.dailyGoalMinutes) === 15 ? "selected" : ""}>15 ${tx("phút/ngày", "min/day")}</option><option value="25" ${!plan || Number(plan.dailyGoalMinutes) === 25 ? "selected" : ""}>25 ${tx("phút/ngày", "min/day")}</option><option value="40" ${Number(plan?.dailyGoalMinutes) === 40 ? "selected" : ""}>40 ${tx("phút/ngày", "min/day")}</option><option value="60" ${Number(plan?.dailyGoalMinutes) === 60 ? "selected" : ""}>60 ${tx("phút/ngày", "min/day")}</option></select><button type="button" class="btn btn-primary btn-sm" data-generate-plan>${plan ? tx("Điều chỉnh theo tiến độ mới", "Adapt to new progress") : tx("Tạo kế hoạch", "Create plan")}</button></div></div>
      ${planHtml}
    </section>
    <section class="lx-ai-recommendations">
      <div class="lx-ai-panel-head"><div><span class="lx-ai-section-kicker">${tx("BƯỚC TIẾP THEO", "NEXT STEPS")}</span><h3>${tx("Gợi ý dành cho bạn", "Recommended for you")}</h3></div><span class="lx-ai-recommend-count">${fmtN(recommendations.length)} ${tx("gợi ý", "suggestions")}</span></div>
      <div class="lx-ai-recommend-grid">${recommendationHtml}</div>
    </section>
    <footer class="lx-ai-footer"><span>${icon("check")} ${tx("Phân tích dựa trên dữ liệu học tập đã ghi nhận.", "Analysis is based on recorded learning activity.")}</span><a class="lx-ai-coach-link" href="/app/ngoai-ngu/tro-chuyen/${encodeURIComponent(String(insight.lang || "en"))}">${tx("Trao đổi với AI Coach", "Talk to AI Coach")} ${icon("right")}</a></footer>
  </div>`;
}

/* Focused overview: a foreign language */
// Thẻ từ đến hạn ôn (tối đa 20 thẻ, từ /api/lang/review): dùng để đánh dấu cấp "Cần ôn" trong lộ trình
async function reviewCardsOf(langId) {
  try { const r = await api(`/api/lang/review/${encodeURIComponent(langId)}`); return Array.isArray(r.cards) ? r.cards : []; } catch { return []; }
}
// Trạng thái một cấp (chặng) của lộ trình, chỉ tính từ dữ liệu thật của khóa học.
// locked: cấp Pro · na: cấp chưa có bài nào (chưa triển khai) · review: có từ đến hạn ôn · done: đạt 100% · cur: đang học / tiếp theo · todo: chưa bắt đầu
function stageInfo(l, isCur, dueCount) {
  if (l.locked) return { key: "locked", label: tx("Khóa · Pro", "Locked · Pro") };
  if (!(l.total > 0)) return { key: "na", label: tx("Chưa triển khai", "Not available yet") };
  if (dueCount > 0) return { key: "review", label: tx(`Cần ôn · ${dueCount} từ`, `Review · ${dueCount} words`) };
  if (l.pct >= 100) return { key: "done", label: tx("Hoàn thành", "Completed") };
  if (l.done > 0) return { key: "cur", label: tx("Đang học", "In progress") };
  if (isCur) return { key: "cur", label: tx("Tiếp theo", "Up next") };
  return { key: "todo", label: tx("Chưa bắt đầu", "Not started") };
}
async function focusLanguage(main, data, c, ctx) {
  ctx.setCrumbs([[tx("Học viên", "Student"), `/app/${c.id}`], [tx("Lộ trình học", "Learning Roadmap")]]);
  // Chỉ gọi thẻ ôn khi có từ đến hạn; không có thì không cấp nào bị đánh dấu cần ôn
  const reviewCards = c.review && c.review.due > 0 ? await reviewCardsOf(c.id) : [];
  if (!ctx.isCurrent()) return;
  const lv = c.levels.find((l) => l.pct < 100) || c.levels[c.levels.length - 1];
  const lvIdx = Math.max(0, c.levels.indexOf(lv));
  // Chang hien tai = unit dau tien chua hoan thanh (tien do tinh theo unit, khong theo tong khoa).
  let curUnit = null, curUnitNo = 1, curUnitDone = 0, curUnitTotal = 0, curUnitPct = 0;
  {
    let gNo = 0, found = false;
    for (const l of c.levels) {
      for (const u of l.units) {
        gNo++;
        const tot = (u.exercises || []).length;
        const dn = (u.exercises || []).filter((e) => (e.best || 0) >= data.pass).length;
        if (!found) { curUnit = u; curUnitNo = gNo; curUnitDone = dn; curUnitTotal = tot; curUnitPct = tot ? Math.round((dn / tot) * 100) : 0; }
        if (dn < tot) { found = true; break; }
      }
      if (found) break;
    }
  }
  window.__plAiCtx = { langItem: lv ? `${c.id}-${lv.id}` : c.id, langName: c.name, page: `${c.name} · ${lv ? lv.title : ""}` };
  withAi(ctx);
  const all = c.levels.flatMap((l) => l.units.flatMap((u) => u.exercises.map((e) => ({ ...e, l, u }))).concat((l.readings || (l.reading ? [l.reading] : [])).map((r) => ({ ...r, kind: "doc-hieu", kindTitle: r.title, l, u: { title: "Đọc hiểu", id: "" } }))).concat(l.test ? [{ ...l.test, kind: "kiem-tra", kindTitle: l.test.title, l, u: { title: "Kiểm tra cấp độ", id: "" } }] : []));
  const next = all.find((e) => e.attempts > 0 && e.best < data.pass) || all.find((e) => e.best < data.pass);
  const words = c.levels.reduce((s, l) => s + l.units.reduce((t, u) => t + ((u.exercises.find((e) => e.kind === "nghia") || {}).best >= data.pass ? u.words : 0), 0), 0);
  const tries = all.reduce((s, e) => s + (e.attempts || 0), 0);
  const recent = all.filter((e) => e.attempts > 0).slice(-4).reverse();
  // Lộ trình chuẩn 4 bước (cùng nguồn với màn chọn môn): trạng thái và đường dẫn tính theo tiến độ của môn này
  const rmEn = currentLang() === "en", RH = ROADMAP_HEAD[rmEn ? "en" : "vi"];
  const begState = [
    c.done === 0 ? "cur" : "done",
    c.done > 0 && c.pct < 50 ? "cur" : c.pct >= 50 ? "done" : "",
    c.pct >= 50 && c.pct < 100 ? "cur" : c.pct >= 100 ? "done" : "",
    c.review && c.review.due > 0 ? "cur" : c.pct >= 100 ? "done" : "",
  ];
  const begHref = [
    next ? `/app/ngoai-ngu/bai/${next.id}` : `/app/ngoai-ngu/${c.id}`,
    lv ? `/app/ngoai-ngu/${c.id}/${lv.id}` : `/app/ngoai-ngu/${c.id}`,
    `/app/ngoai-ngu/luyen-noi/${c.id}`,
    c.pct >= 100 ? `/app/ngoai-ngu/chung-nhan-cua-toi/${c.id}` : `/app/ngoai-ngu/on-tap/${c.id}`,
  ];
  // Lộ trình cấp độ: trạng thái từng cấp và tóm tắt khóa. Mọi số lấy từ /api/lang và thẻ ôn thật, không ước lượng.
  const dueByLevel = {};
  for (const card of reviewCards) if (card.level) dueByLevel[card.level] = (dueByLevel[card.level] || 0) + 1;
  const pathHtml = c.levels.map((l, i) => {
    const info = stageInfo(l, l.id === lv.id, dueByLevel[l.title] || 0);
    const stepPct = Math.max(0, Math.min(100, Number(l.pct) || 0));
    const countTxt = info.key === "na" ? tx("Chưa có bài học", "No lessons yet")
      : info.key === "locked" ? tx("Mở với Pro", "Unlock with Pro")
      : `${fmtN(l.done)}/${fmtN(l.total)} ${tx("bài đạt", "passed")} · ${fmtN((l.units || []).length)} ${tx("chặng", "stages")}`;
    const dot = info.key === "done" ? "✓" : info.key === "locked" ? li("lock", 14) : info.key === "na" ? "–" : i + 1;
    const body = `<span class="lx-step-top"><span class="lx-step-dot">${dot}</span><small>${esc(info.label)}</small></span><b>${esc(l.title)}</b><span class="lx-step-count">${esc(countTxt)}</span><span class="lx-step-progress"><i style="width:${stepPct}%"></i></span>`;
    const cls = `lx-step lx-step-premium ${info.key}`;
    return info.key === "na"
      ? `<div class="${cls}" aria-disabled="true">${body}</div>`
      : `<a href="/app/ngoai-ngu/${c.id}/${l.id}" class="${cls}">${body}</a>`;
  }).join("");
  const naCount = c.levels.filter((l) => !(l.total > 0)).length;
  const nextLink = next
    ? `<a class="btn btn-primary lx-path-next" href="/app/ngoai-ngu/bai/${next.id}">${icon("play")}<span>${tx("Bài tiếp theo", "Next lesson")}</span>${icon("right")}</a>`
    : `<span class="tag tag-la">${icon("check")}${tx("Đã đạt hết bài của khóa", "All lessons passed")}</span>`;
  const reviewNote = c.review && c.review.due > reviewCards.length
    ? `<p class="lx-path-note">${tx(`Đánh dấu cấp cần ôn dựa trên ${fmtN(reviewCards.length)}/${fmtN(c.review.due)} từ đến hạn đầu tiên.`, `Review marks use the first ${fmtN(reviewCards.length)} of ${fmtN(c.review.due)} due words.`)}</p>`
    : "";
  const pathSummary = `<div class="lx-path-summary" aria-label="${tx("Tóm tắt lộ trình", "Roadmap summary")}">
      <div><b>${fmtN(c.total || 0)}</b><span>${tx("tổng bài học", "total lessons")}</span></div>
      <div><b>${fmtN(c.done || 0)}</b><span>${tx("bài đã đạt", "completed")}</span></div>
      <div><b>${fmtN(c.pct || 0)}%</b><span>${tx("hoàn thành", "complete")}</span></div>
      ${naCount ? `<div class="lx-path-na"><b>${fmtN(naCount)}</b><span>${tx("cấp chưa triển khai", "levels not available yet")}</span></div>` : ""}
      <div class="lx-path-next-wrap">${nextLink}</div>
    </div>${reviewNote}`;
  const rmHeroBadge = `${c.name.toUpperCase()} · ${lv ? (lv.code || lv.title.split(/[—·]/)[0].trim()) : c.framework}`;
  const rmHeroHtml = HeroBanner({
    badge: rmHeroBadge,
    title: tx("Lộ trình từ nền tảng đến tự tin giao tiếp", "From foundation to confident communication"),
    subtitle: tx(`${c.levels.length} giai đoạn · học theo nhịp độ của bạn`, `${c.levels.length} stages · learn at your own pace`),
    kit: "owl",
    cls: "lx-roadmap-hero",
  });
  const rmLangStrip = (data.courses || []).length ? `
    <nav class="hm-lang-strip" aria-label="${tx("Chuyển nhanh ngoại ngữ", "Quick language switch")}">
      ${(data.courses || []).map((courseItem) => {
        const isCur = courseItem.id === c.id;
        return `<a class="hm-lang-chip${isCur ? " on" : ""}" href="/app/?mon=${esc(courseItem.id)}">
          <span class="hm-lang-chip-flag">${courseItem.flag}</span>
          <b>${esc(courseItem.name.replace(/^Tiếng\s+/i, ""))}</b>
          <em>${courseItem.pct || 0}%</em>
        </a>`;
      }).join("")}
    </nav>` : "";
  const stepCtaLabels = [
    tx("Học phát âm →", "Basics →"),
    tx("Làm bài từ vựng →", "Words →"),
    tx("Luyện nói AI →", "Speaking →"),
    tx("Ôn tập SRS →", "Review →"),
  ];
  const stepTones = ["is-blue", "is-purple", "is-green", "is-amber"];
  main.innerHTML = `
  ${rmLangStrip}
  ${rmHeroHtml}
  <section class="lx-sec lx-beginner-track" aria-label="${esc(RH.title)}">
    <div class="sec-head lx-beg-head"><div><h2>${sketchIcon("route")} ${esc(RH.title)}</h2><p>${esc(RH.desc)}</p></div><span class="lx-beg-total">${fmtN(c.pct || 0)}% ${tx("tổng quan", "overall")}</span></div>
    <ol class="lx-beg-steps">
      ${STANDARD_ROADMAP.map((st, i) => {
        const s = roadmapStep(st, rmEn);
        const state = begState[i];
        const label = state === "cur" ? tx("Đang học", "In progress") : state === "done" ? tx("Hoàn thành", "Completed") : tx("Sẵn sàng", "Ready");
        const stepPct = state === "done" ? 100 : state === "cur" ? Math.max(18, Math.min(92, Number(c.pct) || 40)) : 8;
        return `<li class="lx-beg-item ${state || "todo"}"><span class="lx-beg-dot" aria-hidden="true"></span><a class="lx-beg-step ${state}" href="${begHref[i]}">
          <span class="lx-beg-ic ${stepTones[i] || "is-blue"}">${sketchIcon(st.ic)}</span>
          <div class="lx-beg-body">
            <div class="lx-beg-top"><b>${i + 1}. ${esc(s.title)}</b><em class="lx-beg-pill ${state || "todo"}">${label}</em></div>
            <span>${esc(s.desc)}</span>
            <div class="lx-beg-meta-row">
              <div class="lx-beg-bar"><i style="width:${stepPct}%"></i></div>
              <span class="lx-beg-cta">${esc(stepCtaLabels[i] || tx("Mở →", "Open →"))}</span>
            </div>
          </div>
        </a></li>`;
      }).join("")}
    </ol>
  </section>
  <section class="rv-buddy" id="rvBuddy" aria-label="${tx("Trợ lý Rivo", "Rivo assistant")}">
    <div class="rv-buddy-face" id="rvFace">${companionSvg(activeCompanionId(c.id), 96)}</div>
    <div class="rv-buddy-talk">
      <div class="rv-buddy-name"><b>Rivo</b><span>${tx("bạn học đồng hành", "your study buddy")}</span></div>
      <p class="rv-buddy-bubble" id="rvSay" aria-live="polite"></p>
      <div class="rv-buddy-replies" id="rvReplies"></div>
    </div>
    <button type="button" class="rv-buddy-voice" id="rvVoice" aria-pressed="false" hidden title="${tx("Bật / tắt giọng đọc", "Toggle voice")}">${li("vol", 16)}<span>${tx("Nghe Rivo nói", "Hear Rivo")}</span></button>
  </section>
  <div class="lx-hero-row lx-hero-row-premium">
    <section class="lx-focus-hero lx-focus-hero-premium" style="--c:${esc(c.color)}">
      <div class="lx-focus-main">
        <div class="lx-focus-top"><span class="edu-eyebrow">${tx("Đang học", "Learning")} · ${esc(c.framework)}</span><a class="btn btn-sm lx-switch" href="/app/chon-mon">${icon("reset")}${tx("Đổi môn học", "Switch subject")}</a></div>
        <h1><span class="lx-hero-flag">${c.flag}</span> ${esc(c.name)}</h1>
        <p class="lx-hero-current">${tx("Cấp hiện tại", "Current level")}: <b>${esc(lv ? lv.title : "")}</b>${lv && lv.desc ? " · " + esc(lv.desc) : ""}</p>
        <div class="lx-hero-course-progress"><div><span>${tx("Tiến độ toàn khóa", "Overall course progress")}</span><b>${fmtN(c.pct || 0)}%</b></div>${pctBar(c.pct || 0, c.color)}<small>${fmtN(c.done || 0)}/${fmtN(c.total || 0)} ${tx("bài đã đạt", "exercises passed")}</small></div>
        ${next ? `<div class="lx-hero-next-label">${tx("BÀI HỌC TIẾP THEO", "UP NEXT")}</div><a class="btn btn-primary btn-lg lx-hero-continue" href="/app/ngoai-ngu/bai/${next.id}">${icon("play")}<span>${next.attempts ? tx("Học tiếp", "Continue learning") : tx("Bắt đầu học", "Start learning")} <small>${esc(next.l.title)} · ${esc(next.u.title)} · ${esc(next.kindTitle || next.title)}</small></span>${icon("right")}</a>` : `<span class="tag tag-la">${icon("check")}${tx("Bạn đã hoàn thành toàn bộ khóa!", "You have completed the whole course!")}</span>`}
      </div>
      <div class="lx-focus-native">${companionSvg(activeCompanionId(c.id), 84)}</div>
    </section>
    <div class="lx-kpis lx-kpis-premium" aria-label="${tx("Tiến độ hiện tại", "Current progress")}">
      <div class="lx-kpi-stage"><span class="lx-kpi-icon">${icon("chart")}</span><div><b>${curUnitPct}%</b><span>${tx("Chặng hiện tại", "Current stage")}</span></div><small>${tx(`Chặng ${curUnitNo}: ${curUnit ? curUnit.title : ""}`, `Stage ${curUnitNo}: ${curUnit ? curUnit.title : ""}`)}</small>${pctBar(curUnitPct, c.color)}</div>
      <div class="lx-kpi-completed"><span class="lx-kpi-icon">${icon("check")}</span><div><b>${curUnitDone}/${curUnitTotal}</b><span>${tx("Bài đã đạt", "Passed in this stage")}</span></div><small>${tx("Trong chặng đang học", "In your current stage")}</small></div>
      <div class="lx-kpi-vocab"><span class="lx-kpi-icon">${icon("book")}</span><div><b>${fmtN(words)}</b><span>${tx("Từ vựng đã thuộc", "Words mastered")}</span></div><small>${tx("Dựa trên bài từ vựng đạt", "Based on passed vocabulary exercises")}</small></div>
      <div class="lx-kpi-streak"><span class="lx-kpi-icon">${icon("star")}</span><div><b id="lxStreak">–</b><span>${tx("Chuỗi ngày học", "Learning streak")}</span></div><small>${tx("Duy trì thói quen mỗi ngày", "Build a daily habit")}</small></div>
    </div>
  </div>
  <section class="lx-sec lx-ai-insights" id="lxAiInsights" hidden aria-live="polite"></section>
  <section class="lx-sec lx-sec-path"><div class="sec-head"><div><h2>${tx("Lộ trình cấp độ", "Level path")}</h2><p>${tx("Chọn cấp độ phù hợp hoặc học tuần tự từ cơ bản đến nâng cao.", "Pick the level that fits you, or go in order from basics to advanced.")}</p></div><a class="btn btn-sm" href="/app/ngoai-ngu/${c.id}">${tx("Xem toàn bộ khóa", "View full course")}</a></div>
    ${pathSummary}
    <div class="lx-path lx-path-premium">${pathHtml}</div>
    ${c.levels.some((l) => l.pct === 100) ? `<div class="lx-certs">${c.levels.filter((l) => l.pct === 100).map((l) => `<a class="btn btn-sm" href="/app/ngoai-ngu/chung-nhan/${c.id}/${l.id}">${li("cap", 15)}${tx("Chứng nhận", "Certificate")} ${esc(l.title)}</a>`).join("")}</div>` : ""}
  </section>
  <section class="lx-sec lx-sec-tools">
    <div class="sec-head"><div><h2>${tx("Luyện tập nhanh", "Quick practice")}</h2><p>${tx(`Rèn kỹ năng bổ trợ cho ${esc(c.name)}.`, `Build supporting skills for ${esc(c.name)}.`)}</p></div></div>
    <div class="lx-skills lx-skills-bar lx-practice-grid" style="--c:${esc(c.color)}">
      ${c.id === "en" ? `<a class="lx-skill lx-practice-card" data-category="exam" href="/app/toeic">
        <span class="lx-practice-category">${tx("Luyện thi", "Exam prep")}</span><span class="lx-skill-ico">${sketchIcon("flag", 'width="24" height="24"')}</span>
        <span class="t"><b>${tx("TOEIC & Luyện thi", "TOEIC & mock tests")}</b><span>${tx("Học theo 7 Part, luyện từng phần, đề thi thử có giờ", "Learn the 7 Parts, drill each section, timed mock tests")}</span></span><span class="lx-practice-arrow">${icon("right")}</span>
      </a>` : ""}
      <a class="lx-skill lx-practice-card" data-category="speaking" href="/app/ngoai-ngu/luyen-noi/${c.id}">
        <span class="lx-practice-category">${tx("Giao tiếp", "Communication")}</span><span class="lx-skill-ico">${sketchIcon("mic", 'width="24" height="24"')}</span>
        <span class="t"><b>${tx("Phòng luyện nói", "Speaking studio")}</b><span>${tx("Đọc theo giọng mẫu, máy chấm từng từ", "Shadow the model voice; every word is scored")}</span></span><span class="lx-practice-arrow">${icon("right")}</span>
      </a>
      <a class="lx-skill lx-practice-card" data-category="games" href="/app/tro-choi/${c.id}">
        <span class="lx-practice-category">${tx("Giải trí học tập", "Mini Games")}</span><span class="lx-skill-ico">${sketchIcon("sparkle", 'width="24" height="24"')}</span>
        <span class="t"><b>${tx("6 Mini Games", "6 Mini Games")}</b><span>${tx("Ghép từ, đố vui, xếp câu, nghe nhanh, đua tốc độ & đánh vần", "Match, Quiz, Sentence Builder, Listening, Race & Spelling")}</span></span><span class="lx-practice-arrow">${icon("right")}</span>
      </a>
      <a class="lx-skill lx-practice-card" data-category="ai" href="/app/ngoai-ngu/tro-chuyen/${c.id}">
        <span class="lx-practice-category">${tx("AI đồng hành", "AI powered")}</span><span class="lx-skill-ico">${sketchIcon("bulb", 'width="24" height="24"')}</span>
        <span class="t"><b>${tx("Trò chuyện với AI", "Chat with AI")}</b><span>${tx("Hội thoại theo tình huống &amp; sửa câu", "Scenario conversations &amp; sentence fixes")}</span></span><span class="lx-practice-arrow">${icon("right")}</span>
      </a>
      <a class="lx-skill lx-practice-card" data-category="career" href="/app/ngoai-ngu/luyen-noi/${c.id}?muc=hoi-thoai">
        <span class="lx-practice-category">${tx("Nghề nghiệp", "Career")}</span><span class="lx-skill-ico">${sketchIcon("briefcase", 'width="24" height="24"')}</span>
        <span class="t"><b>${tx("Phỏng vấn AI · 30 ngành", "AI interviews · 30 fields")}</b><span>${tx("Thực hành trả lời phỏng vấn theo ngành", "Practise interview answers by field")}</span></span><span class="lx-practice-arrow">${icon("right")}</span>
      </a>
      <a class="lx-review lx-practice-card ${c.review && c.review.due ? "has" : ""}" data-category="review" href="/app/ngoai-ngu/on-tap/${c.id}">
        <span class="lx-practice-category">${tx("Củng cố kiến thức", "Review & retain")}</span><span class="lx-skill-ico">${sketchIcon("play", 'width="24" height="24"')}</span>
        <span class="t"><b>${c.review && c.review.due ? tx(`Ôn tập hôm nay: ${c.review.due} từ`, `Review today: ${c.review.due} words`) : tx("Ôn tập từ vựng", "Vocabulary review")}</b><span>${c.review && c.review.total ? tx(`Đang theo dõi ${c.review.total} từ cần ôn`, `Tracking ${c.review.total} words to review`) : tx("Làm bài từ vựng để theo dõi", "Do vocabulary exercises to start tracking")}</span></span>
        <span class="lx-practice-action">${c.review && c.review.due ? tx("Ôn ngay", "Review now") : tx("Mở", "Open")} ${icon("right")}</span>
      </a>
      <a class="lx-review lx-practice-card ${c.review && c.review.mistakes ? "has" : ""}" data-category="mistakes" href="/app/ngoai-ngu/on-tap/${c.id}?mode=mistakes">
        <span class="lx-practice-category">${tx("Ôn lỗi sai", "Mistakes drill")}</span><span class="lx-skill-ico">${sketchIcon("flag", 'width="24" height="24"')}</span>
        <span class="t"><b>${c.review && c.review.mistakes ? tx(`Ôn câu / từ hay sai (${c.review.mistakes})`, `Review mistakes (${c.review.mistakes})`) : tx("Ôn câu / từ hay sai", "Review mistakes")}</b><span>${tx("Tập trung lại các từ từng sai và câu hay nhầm", "Focus on missed words and tricky questions")}</span></span>
        <span class="lx-practice-action">${tx("Ôn ngay", "Practice")} ${icon("right")}</span>
      </a>
    </div>
  </section>
  ${lv ? `<section class="lx-sec lx-sec-lessons"><details class="lx-fold lx-fold-lessons"><summary><span>${esc(lv.title)} — ${tx("Danh sách bài học", "Lessons")}</span><small>${lv.done}/${lv.total} ${tx("bài đạt", "passed")}</small></summary>${levelBody(lv, data)}</details></section>` : ""}
  <section class="lx-sec lx-bottom-folds" aria-label="${tx("Bảng xếp hạng và hoạt động gần đây", "Leaderboard and recent activity")}">
    <details class="lx-fold"><summary><span>${tx("Xếp hạng", "Ranking")} ${esc(c.name)}</span><small>${tx("Theo số bài đạt", "By lessons passed")}</small></summary><div class="sheet lx-lb" id="lxLb"><div class="lx-loading"><span class="spin"></span></div></div></details>
    ${recent.length ? `<details class="lx-fold"><summary><span>${tx("Làm gần đây", "Recent")}</span><small>${recent.length} ${tx("bài gần nhất", "most recent lessons")}</small></summary><div class="lx-ex-list">${recent.map((e) => `<a class="lx-ex" href="/app/ngoai-ngu/bai/${e.id}"><span class="lx-ex-ico">${kindIco(e.kind)}</span><span class="t"><b>${esc(e.kindTitle || e.title)}</b><span>${esc(e.l.title)} · ${esc(e.u.title)}</span></span>${scoreTag(e.best, data.pass)}</a>`).join("")}</div></details>` : ""}
  </section>`;
  bindUnitSpans(main);
  {
    const heroRow = main.querySelector(".lx-hero-row"), lessons = main.querySelector(".lx-sec-lessons"), insights = main.querySelector("#lxAiInsights");
    if (heroRow && lessons) heroRow.after(lessons);
    if (insights) main.append(insights);
  }
  mountBuddy(main, { c, lv, next, curUnit, curUnitNo, curUnitDone, curUnitTotal, pass: data.pass }, ctx);
  Promise.all([
    api(`/api/lang/insights/${encodeURIComponent(c.id)}`),
    api(`/api/lang/insights/${encodeURIComponent(c.id)}/plan`),
    api(`/api/lang/insights/${encodeURIComponent(c.id)}/report`).catch(() => ({ report: null })),
    api(`/api/lang/insights/${encodeURIComponent(c.id)}/history?days=30`).catch(() => ({ points: [], message: tx("Chưa có lịch sử tiến bộ.", "No progress history yet.") })),
  ]).then(([payload, planPayload, reportPayload, historyPayload]) => {
    if (!ctx.isCurrent()) return;
    const host = main.querySelector("#lxAiInsights");
    if (!host || !payload || !payload.insights) return;
    let insightData = payload.insights;
    let planData = planPayload?.plan || null;
    let reportData = reportPayload?.report || null;
    let historyData = historyPayload || { points: [], message: "" };
    let historyRange = 30;
    const streakEl = main.querySelector("#lxStreak");
    if (streakEl) streakEl.textContent = String(insightData.streak?.current || 0);
    const render = () => { host.innerHTML = languageInsightsHtml(insightData, planData, reportData, historyData, historyRange); host.hidden = false; };
    render();
    host.addEventListener("click", async (event) => {
      const createButton = event.target.closest("[data-generate-plan]");
      const reportButton = event.target.closest("[data-generate-report]");
      const taskButton = event.target.closest("[data-plan-item]");
      const historyButton = event.target.closest("[data-history-days]");
      const printButton = event.target.closest("[data-print-report]");
      if (!createButton && !reportButton && !taskButton && !historyButton && !printButton) return;
      const button = createButton || reportButton || taskButton || historyButton || printButton;
      if (historyButton) {
        const days = Number(historyButton.dataset.historyDays) === 90 ? 90 : 30;
        historyRange = days;
        button.disabled = true;
        try {
          historyData = await api(`/api/lang/insights/${encodeURIComponent(c.id)}/history?days=${days}`);
          render();
        } catch (error) {
          toast(error.message || tx("Không tải được lịch sử tiến bộ.", "Could not load progress history."), "err");
          button.disabled = false;
        }
        return;
      }
      if (printButton) {
        const printWindow = window.open("", "_blank");
        if (!printWindow) { toast(tx("Trình duyệt đang chặn cửa sổ in. Hãy cho phép pop-up rồi thử lại.", "The browser blocked the print window. Allow pop-ups and try again."), "err"); return; }
        const reportBody = String(reportData?.reportText || "");
        const reportTitle = tx(`Báo cáo học tập ${c.name}`, `${c.name} learning report`);
        const score = insightData.learningScore || {};
        const scoreCard = `<div class="kpis"><div><small>${tx("Chỉ số tiến bộ", "Learning progress index")}</small><b>${score.score == null ? "—" : `${fmtN(score.score)}/100`}</b></div><div><small>${tx("Tiến độ khóa", "Course progress")}</small><b>${fmtN(insightData.courseProgress?.percent || 0)}%</b></div><div><small>${tx("Lượt ôn 30 ngày", "Reviews · 30 days")}</small><b>${fmtN(insightData.vocabulary?.memory?.reviews30d || 0)}</b></div><div><small>${tx("Hoạt động tuần", "Weekly activity")}</small><b>${fmtN((insightData.activity || []).reduce((sum, item) => sum + (Number(item.count) || 0), 0))}</b></div></div>`;
        const skillRows = (insightData.skillRadar || []).map((item) => `<tr><td>${esc(item.label)}</td><td>${item.score == null || !item.enoughData ? tx("Chưa đủ dữ liệu", "Insufficient data") : `${fmtN(item.score)}%`}</td><td>${fmtN(item.sampleCount || 0)}</td></tr>`).join("");
        const scoreSummary = `<section class="summary"><h2>${tx("Tóm tắt dữ liệu hiện tại", "Current learning snapshot")}</h2>${scoreCard}<table><thead><tr><th>${tx("Kỹ năng", "Skill")}</th><th>${tx("Kết quả", "Result")}</th><th>${tx("Mẫu", "Samples")}</th></tr></thead><tbody>${skillRows}</tbody></table></section>`;
        const printHtml = `<!doctype html><html lang="${currentLang() === "en" ? "en" : "vi"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(reportTitle)}</title><style>@page{size:A4;margin:16mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#24211e;line-height:1.6;max-width:800px;margin:0 auto;padding:20px}header{border-bottom:2px solid #24211e;padding-bottom:14px;margin-bottom:18px}h1{font-size:24px;margin:4px 0}h2{font-size:16px;margin:0 0 10px}small,.muted{color:#706b65}.summary{margin:18px 0 22px}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0 14px}.kpis>div{border:1px solid #ded8cc;border-radius:8px;padding:9px}.kpis small,.kpis b{display:block}.kpis b{font-size:18px;margin-top:3px}.summary table{width:100%;border-collapse:collapse;font-size:12px}.summary th,.summary td{padding:7px 9px;border-bottom:1px solid #e8e4dc;text-align:left}.report{font-size:14px;white-space:normal;overflow-wrap:anywhere}.footer{border-top:1px solid #ddd;margin-top:28px;padding-top:10px;font-size:11px;color:#706b65}@media print{body{padding:0}.kpis{break-inside:avoid}}</style></head><body><header><b>LIFERIVO · LEARNING ANALYST</b><h1>${esc(reportTitle)}</h1><small>${esc(reportData?.periodStart || "")} – ${esc(reportData?.periodEnd || "")} · ${esc(reportData?.createdAt || "")}</small></header>${scoreSummary}<main class="report"><h2>${tx("Nhận xét và kế hoạch của AI", "AI analysis and learning plan")}</h2>${esc(reportBody).replace(/\r?\n/g, "<br>")}</main><div class="footer">${tx("Báo cáo được tạo từ dữ liệu học tập của riêng khóa ngoại ngữ này. Chỉ số nội bộ không phải điểm CEFR; các mục thiếu dữ liệu được để trống.", "This report uses data from this language course only. Internal indicators are not CEFR scores; fields without evidence are left blank.")}</div><script>window.addEventListener('load',()=>window.print());</script></body></html>`;
        printWindow.document.open(); printWindow.document.write(printHtml); printWindow.document.close();
        return;
      }
      if (button.disabled) return;
      button.disabled = true;
      try {
        if (reportButton) {
          const result = await api(`/api/lang/insights/${encodeURIComponent(c.id)}/report`, "POST", reportData ? { refresh: true } : {});
          reportData = result.report || null;
          toast(tx("Đã tạo báo cáo học tập AI.", "Your AI learning report is ready."), "ok");
        } else if (createButton) {
          const goal = Number(host.querySelector("[data-plan-goal]")?.value || 25);
          const result = await api(`/api/lang/insights/${encodeURIComponent(c.id)}/plan`, "POST", { dailyGoalMinutes: goal });
          planData = result.plan || null;
          toast(tx("Đã điều chỉnh kế hoạch theo tiến độ hiện tại.", "Your plan has been adapted to your current progress."), "ok");
        } else {
          const itemId = taskButton.dataset.planItem;
          const status = taskButton.dataset.status === "completed" ? "completed" : "pending";
          const result = await api(`/api/lang/insights/${encodeURIComponent(c.id)}/plan/items/${encodeURIComponent(itemId)}`, "PATCH", { status });
          planData = result.plan || null;
        }
        render();
      } catch (error) {
        toast(error.message || tx("Không thể cập nhật kế hoạch.", "Could not update the plan."), "err");
        button.disabled = false;
      }
    });
  }).catch(() => {});
  api(`/api/lang/leaderboard/${c.id}`).then((d) => {
    const el = main.querySelector("#lxLb"); if (!el) return;
    el.innerHTML = d.top.length ? d.top.map((r) => `<div class="lx-lb-row ${r.me ? "me" : ""}"><span class="lx-lb-rank">${r.rank <= 3 ? `<i class="lx-medal m${r.rank}">${r.rank}</i>` : r.rank}</span><b>${esc(r.name)}${r.me ? tx(" (bạn)", " (you)") : ""}</b><span>${r.passed} ${tx("bài đạt", "passed")}</span></div>`).join("") : `<div class="empty small muted" style="padding:14px">${tx("Chưa có ai đạt bài nào. Hãy là người đầu tiên!", "Nobody has passed a lesson yet. Be the first!")}</div>`;
  }).catch(() => {});
}

/* ---------- Rivo: trợ lý trò chuyện ở trang chính ----------
   Mọi câu Rivo nói đều dựng từ dữ liệu thật của người học (bài kế tiếp, số từ đến hạn ôn, tiến độ chặng).
   Câu hỏi tự do được chuyển cho trợ lý AI của hệ thống (window.__plAiAsk), không trả lời giả. */
function mountBuddy(main, { c, lv, next, curUnit, curUnitNo, curUnitDone, curUnitTotal, pass }, ctx) {
  const sayEl = main.querySelector("#rvSay"), repliesEl = main.querySelector("#rvReplies"), faceEl = main.querySelector("#rvFace"), voiceBtn = main.querySelector("#rvVoice");
  if (!sayEl || !repliesEl) return;
  const first = String((S.me && (S.me.displayName || S.me.username)) || "").trim().split(/\s+/).pop() || tx("bạn", "there");
  const due = Number((c.review && c.review.due) || 0);
  const hour = new Date().getHours();
  const hello = hour < 11 ? tx("Chào buổi sáng", "Good morning") : hour < 14 ? tx("Chào buổi trưa", "Good afternoon") : hour < 18 ? tx("Chào buổi chiều", "Good afternoon") : tx("Chào buổi tối", "Good evening");
  const nextHref = next ? `/app/ngoai-ngu/bai/${next.id}` : "";
  const nextName = next ? `${next.u.title} · ${next.kindTitle || next.title}` : "";
  const started = (c.done || 0) > 0 || !!(next && next.attempts > 0);
  // Chỉ mời hỏi tự do khi trợ lý AI của hệ thống thật sự sẵn sàng (đã cấu hình và được bật)
  let aiOn = !!document.querySelector(".aiw");
  const R = {
    go: next ? { label: started ? tx("Học tiếp bài đang dở", "Continue my lesson") : tx("Bắt đầu bài đầu tiên", "Start my first lesson"), href: nextHref, primary: true } : null,
    today: { label: tx("Hôm nay mình nên học gì?", "What should I study today?"), to: "today" },
    how: { label: tx("Mình mới học, bắt đầu thế nào?", "I am new. How do I start?"), to: "how" },
    review: { label: tx(`Ôn ${due} từ đến hạn`, `Review ${due} due words`), href: `/app/ngoai-ngu/on-tap/${c.id}` },
    speak: { label: tx("Luyện nói thử", "Try speaking"), href: `/app/ngoai-ngu/luyen-noi/${c.id}` },
    theory: curUnit && curUnit.exercises && curUnit.exercises[0] ? { label: tx("Xem lý thuyết trước", "Read the theory first"), href: `/app/ngoai-ngu/ly-thuyet/${curUnit.exercises[0].id.split("-").slice(0, 2).join("/")}/${curUnit.id}` } : null,
    ask: { label: tx("Hỏi Rivo câu khác", "Ask Rivo something else"), ask: true },
    back: { label: tx("Quay lại", "Back"), to: "hello" },
  };
  const LINES = {
    hello: {
      state: "welcome",
      text: !next ? tx(`${hello}, ${first}! Bạn đã hoàn thành toàn bộ khóa ${c.name}. Mình cùng ôn lại để nhớ lâu nhé.`, `${hello}, ${first}! You have finished the whole ${c.name} course. Time to review and keep it fresh.`)
        : started ? tx(`${hello}, ${first}! Mừng bạn quay lại. Bạn đang ở chặng ${curUnitNo}: ${curUnit ? curUnit.title : ""} (${curUnitDone}/${curUnitTotal} bài đạt). Học tiếp nhé?`, `${hello}, ${first}! Welcome back. You are on stage ${curUnitNo}: ${curUnit ? curUnit.title : ""} (${curUnitDone}/${curUnitTotal} passed). Shall we continue?`)
        : tx(`${hello}, ${first}! Mình là Rivo, bạn học của bạn. Bạn chưa cần biết gì về ${c.name} cả: mỗi bài chỉ vài phút, mình sẽ dẫn từng bước.`, `${hello}, ${first}! I am Rivo, your study buddy. You do not need to know any ${c.name} yet: each lesson takes a few minutes and I will guide you step by step.`),
      replies: [R.go, due > 0 ? R.review : null, R.today, started ? null : R.how, R.ask],
    },
    today: {
      state: "learning",
      text: !next ? tx(`Hôm nay bạn nên ôn lại từ vựng${due > 0 ? `: có ${due} từ đến hạn` : ""}, rồi luyện nói vài câu để giữ phản xạ.`, `Today, review your vocabulary${due > 0 ? `: ${due} words are due` : ""}, then practise speaking a few sentences.`)
        : tx(`Gợi ý hôm nay: ${due > 0 ? `ôn ${due} từ đến hạn trước, rồi ` : ""}làm bài "${nextName}" (${lv ? lv.title : ""}). Đạt từ ${pass} điểm là qua bài.`, `Plan for today: ${due > 0 ? `review ${due} due words first, then ` : ""}do "${nextName}" (${lv ? lv.title : ""}). Score ${pass}+ to pass.`),
      replies: [R.go, due > 0 ? R.review : null, R.speak, R.back],
    },
    how: {
      state: "encouragement",
      text: tx("Rất đơn giản, chỉ 3 bước: 1) Đọc lý thuyết ngắn và nghe phát âm. 2) Làm bài tập, máy chấm ngay và chỉ chỗ sai. 3) Ôn lại từ vựng khi mình nhắc. Sai không sao cả, bạn làm lại bao nhiêu lần cũng được.", "It is simple, just 3 steps: 1) Read the short theory and listen to the pronunciation. 2) Do the exercise; it is graded instantly and shows what went wrong. 3) Review words when I remind you. Mistakes are fine: you can retry as often as you like."),
      replies: [R.theory, R.go, R.back],
    },
  };
  const reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const synth = window.speechSynthesis;
  let voiceOn = false, timer = 0;
  try { voiceOn = localStorage.getItem("me:buddyVoice") === "1"; } catch {}
  const stopVoice = () => { try { if (synth) synth.cancel(); } catch {} };
  const speakNow = (text) => {
    if (!voiceOn || !synth || typeof SpeechSynthesisUtterance === "undefined") return;
    stopVoice();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = currentLang() === "en" ? "en-US" : "vi-VN";
    const v = pickVoice(u.lang); if (v) u.voice = v;
    u.rate = 0.98;
    try { synth.speak(u); } catch {}
  };
  const show = (key, speakIt = true) => {
    const line = LINES[key] || LINES.hello;
    clearInterval(timer);
    // Bạn đồng hành đã chọn nói câu này: miệng chuyển động trong lúc chữ hiện ra
    const talkOn = !reduce;
    if (faceEl) {
      faceEl.innerHTML = companionSvg(activeCompanionId(c.id), 96, { talk: talkOn });
      const svgEl = faceEl.querySelector("svg");
      if (svgEl && talkOn) setTimeout(() => svgEl.classList.remove("is-talking"), Math.min(7000, 900 + line.text.length * 42));
    }
    repliesEl.innerHTML = "";
    const renderReplies = () => {
      repliesEl.innerHTML = line.replies.filter((r) => r && (!r.ask || aiOn)).map((r) => r.href
        ? `<a class="rv-reply ${r.primary ? "primary" : ""}" href="${r.href}">${esc(r.label)}</a>`
        : `<button type="button" class="rv-reply" ${r.ask ? "data-ask" : `data-to="${r.to}"`}>${esc(r.label)}</button>`).join("");
    };
    if (reduce) { sayEl.textContent = line.text; renderReplies(); }
    else {
      let i = 0; sayEl.textContent = ""; sayEl.classList.add("typing");
      timer = setInterval(() => {
        i += 2; sayEl.textContent = line.text.slice(0, i);
        if (i >= line.text.length) { clearInterval(timer); sayEl.classList.remove("typing"); renderReplies(); }
      }, 16);
    }
    if (speakIt) speakNow(line.text);
  };
  repliesEl.addEventListener("click", (ev) => {
    const b = ev.target.closest("button.rv-reply"); if (!b) return;
    if (b.hasAttribute("data-ask")) { stopVoice(); window.__plAiAsk(""); return; }
    curKey = LINES[b.dataset.to] ? b.dataset.to : "hello";
    show(curKey);
  });
  if (voiceBtn && synth && typeof SpeechSynthesisUtterance !== "undefined") {
    voiceBtn.hidden = false;
    const sync = () => { voiceBtn.setAttribute("aria-pressed", String(voiceOn)); voiceBtn.classList.toggle("on", voiceOn); };
    sync();
    voiceBtn.addEventListener("click", () => {
      voiceOn = !voiceOn;
      try { localStorage.setItem("me:buddyVoice", voiceOn ? "1" : "0"); } catch {}
      sync();
      if (voiceOn) speakNow(sayEl.textContent); else stopVoice();
    });
  }
  ctx.onLeave(() => { clearInterval(timer); stopVoice(); });
  // Trình duyệt chặn giọng đọc khi chưa có thao tác: câu chào đầu chỉ hiện chữ
  let curKey = "hello";
  const show0 = show;
  const showKey = (k, sp) => { curKey = LINES[k] ? k : "hello"; show0(curKey, sp); };
  showKey("hello", false);
  mountAiWidget().then(() => {
    const ready = !!document.querySelector(".aiw");
    if (ready !== aiOn && main.contains(sayEl)) { aiOn = ready; if (curKey === "hello" && !sayEl.classList.contains("typing")) showKey("hello", false); }
  }).catch(() => {});
}

function bindUnitSpans(root) {
  const grid = root.querySelector(".lx-units");
  if (!grid) return;
  const sync = () => {
    const units = [...grid.querySelectorAll(":scope > details.lx-unit")];
    units.forEach((u) => u.classList.remove("lx-unit-span"));
    let run = [];
    const flush = () => { if (run.length % 2 === 1) run[run.length - 1].classList.add("lx-unit-span"); run = []; };
    for (const u of units) {
      if (u.open) flush();
      else run.push(u);
    }
    flush();
  };
  grid.addEventListener("toggle", sync, true);
  sync();
}

function continueItem(lang) {
  for (const c of lang.courses) for (const l of c.levels) for (const u of l.units) for (const e of u.exercises) {
    if (e.attempts > 0 && e.best < lang.pass) return { href: `/app/ngoai-ngu/bai/${e.id}`, title: `${c.name} · ${l.title} · ${e.title}` };
  }
  return null;
}

// Bộ lọc chương theo trạng thái: tất cả / chưa làm / đang học / đã xong
function chapterFilterHtml() {
  const opts = [["all", tx("Tất cả", "All")], ["new", tx("Chưa làm", "Not started")], ["started", tx("Đang học", "In progress")], ["done", tx("Đã xong", "Done")]];
  return `<div class="lx-chapter-filter" role="group" aria-label="${tx("Lọc chương", "Filter chapters")}">${opts.map(([k, t], i) => `<button type="button" class="chip${i === 0 ? " on" : ""}" data-cf="${k}" aria-pressed="${i === 0}">${t}</button>`).join("")}</div>`;
}
document.addEventListener("click", (e) => {
  const cf = e.target.closest && e.target.closest(".lx-chapter-filter [data-cf]");
  if (cf) {
    const bar = cf.closest(".lx-chapter-filter");
    const list = bar && bar.nextElementSibling;
    if (!list) return;
    list.dataset.cf = cf.dataset.cf;
    bar.querySelectorAll("[data-cf]").forEach((b) => { const on = b === cf; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
    return;
  }
  const sw = e.target.closest && e.target.closest(".lx-save-word");
  if (sw) {
    const saved = toggleWord({ lang: sw.dataset.l, word: sw.dataset.w, reading: sw.dataset.r, meaning: sw.dataset.m });
    sw.setAttribute("aria-pressed", String(saved));
    sw.textContent = (saved ? "★ " : "☆ ") + (saved ? tx("Đã lưu", "Saved") : tx("Lưu từ", "Save"));
    toast(saved ? tx("Đã lưu vào sổ tay từ vựng.", "Saved to your vocabulary notebook.") : tx("Đã bỏ lưu từ.", "Removed from your notebook."), "ok");
  }
});
function levelBody(lv, data) {
  if (lv.locked) return `<div class="sheet sheet-pad lx-pro-card"><div class="lx-pro-ico">${li("lock", 34)}</div><h2>${esc(lv.title)} ${tx("dành cho thành viên Pro", "is for Pro members")}</h2><p>${tx(`${lv.units.length} bài học · ${lv.total} bài tập tự chấm, có lý thuyết, luyện nghe, luyện nói và gia sư AI.`, `${lv.units.length} lessons · ${lv.total} auto-graded exercises, with theory, listening, speaking and an AI tutor.`)}</p><a class="btn btn-primary" href="/app/bang-gia">${tx("Nâng cấp Pro", "Upgrade to Pro")}</a></div>`;
  // 4.11.1: each lesson is an expandable row (with progress); expands the first incomplete lesson by default.
  const openUnit = lv.units.find((u) => u.exercises.some((e) => e.best < data.pass)) || lv.units[0];
  const curMapUnit = lv.units.find((u) => u.exercises.some((e) => e.best < data.pass)) || null;
  const isMob = typeof window !== "undefined" && window.innerWidth <= 760;
  return `${chapterFilterHtml()}<div class="lx-units lx-map" data-cf="all">
      ${lv.units.map((u, ui) => { const n = u.exercises.length, done = u.exercises.filter((e) => e.best >= data.pass).length, full = n > 0 && done === n, cur = u === curMapUnit; return `<details class="lx-unit sheet ${full ? "is-done" : ""} ${cur ? "is-cur" : ""} ${!full && done === 0 ? "is-new" : ""} ${!full && done > 0 ? "is-started" : ""}" ${!isMob && u === openUnit ? "open" : ""}>
        <summary class="lx-unit-head">
          <span class="lx-map-state">${tx(`Chặng ${ui + 1}`, `Stage ${ui + 1}`)} · ${full ? tx("Đã xong", "Done") : cur ? tx("Bạn đang ở đây", "You are here") : done > 0 ? tx("Đã bắt đầu", "Started") : tx("Sắp tới", "Up next")}</span>
          ${cur ? `<span class="lx-map-here" aria-hidden="true">${ChibiMascot({ state: "learning", size: 46 })}</span>` : ""}
          <span class="lx-unit-mascot" aria-hidden="true">${ChibiMascot({ state: full ? "achievement" : cur ? "learning" : "welcome", size: 48 })}</span>
          <span class="lx-unit-no">${full ? li("check", 16) : esc(u.no || u.id)}</span>
          <span class="lx-unit-t"><b>${esc(u.title)}</b><span>${u.words ? tx(`${u.words} từ vựng · `, `${u.words} words · `) : tx("Luyện ghép câu · ", "Sentence building · ")}${n} ${tx("bài tập", "exercises")}${u.custom ? tx(" · bổ sung", " · extra") : ""}</span></span>
          <span class="lx-unit-prog"><b>${done}/${n}</b><em class="lx-unit-pct">${n ? Math.round((done / n) * 100) : 0}%</em>${pctBar(n ? Math.round((done / n) * 100) : 0)}</span>
          <span class="lx-unit-chev">${li("down", 18)}</span>
        </summary>
        <div class="lx-ex-list"><a class="lx-ex lx-ex-theory" href="/app/ngoai-ngu/ly-thuyet/${(u.exercises[0] || {}).id ? u.exercises[0].id.split("-").slice(0, 2).join("/") : ""}/${esc(u.id)}"><span class="lx-ex-ico">${li("book")}</span><span class="t"><b>${tx("Lý thuyết", "Theory")}</b><span>${u.words ? tx("Từ vựng · quy tắc · mẫu câu", "Vocabulary · rules · sample sentences") : tx("Mẫu câu ghép · nghe trước", "Sentence patterns · listen first")}</span></span><span class="tag tag-line">${tx("Học trước", "Study first")}</span></a>${u.exercises.map((e) => `<a class="lx-ex" href="/app/ngoai-ngu/bai/${e.id}">
          <span class="lx-ex-ico">${kindIco(e.kind)}</span>
          <span class="t"><b>${esc(e.kindTitle || e.title)}</b><span>${e.count} ${tx("câu", "questions")}${e.attempts ? tx(` · ${e.attempts} lần nộp`, ` · ${e.attempts} submissions`) : ""}</span></span>
          ${scoreTag(e.best, data.pass)}
        </a>`).join("")}</div>
      </details>`; }).join("")}
      ${lv.test ? `<a class="lx-map-goal ${lv.test.best >= data.pass ? "is-done" : ""}" href="/app/ngoai-ngu/bai/${lv.test.id}"><span class="lx-map-goal-ico">${ChibiMascot({ state: lv.test.best >= data.pass ? "achievement" : "success", size: 54 })}</span><span class="t"><small>${tx("Đích đến của cấp này", "Goal of this level")}</small><b>${esc(lv.test.title)}</b><span>${tx(`Đạt từ ${data.pass} điểm và hoàn thành các bài để nhận chứng nhận ${lv.title}.`, `Score ${data.pass}+ and finish the lessons to earn the ${lv.title} certificate.`)}</span></span>${icon("right")}</a>` : ""}
    </div>
    <div class="lx-tests">
      <a class="lx-test sheet" href="/app/ngoai-ngu/luyen-noi/${lv.lang}?cap=${lv.id}"><span class="lx-ex-ico">${li("mic")}</span><span class="t"><b>${tx("Phòng luyện nói", "Speaking studio")}</b><span>${tx("Đọc theo từ, câu, đoạn văn của cấp này · chấm từng từ · trò chuyện với AI", "Read words, sentences and passages at this level · every word scored · chat with AI")}</span></span></a>
      ${["zh", "ja", "ko"].includes(lv.lang) ? `<a class="lx-test sheet lx-writecard" href="/app/ngoai-ngu/luyen-viet/${lv.lang}/${lv.id}"><span class="lx-ex-ico">${li("pen")}</span><span class="t"><b>${tx("Luyện viết chữ", "Handwriting practice")}</b><span>${tx("Tô chữ trong khung, máy chấm độ khớp với hình chữ", "Trace characters in the frame; the scorer checks how well they match")}</span></span></a>` : ""}
      ${(lv.readings || (lv.reading ? [lv.reading] : [])).map((rd) => `<a class="lx-test sheet lx-reading" href="/app/ngoai-ngu/bai/${rd.id}"><span class="lx-ex-ico">${li("page")}</span><span class="t"><b>${esc(rd.title)}</b><span>${tx(`Đọc một đoạn văn và trả lời ${rd.count} câu hỏi`, `Read a passage and answer ${rd.count} questions`)}</span></span>${scoreTag(rd.best, data.pass)}</a>`).join("")}
      ${lv.test ? `<a class="lx-test sheet" href="/app/ngoai-ngu/bai/${lv.test.id}"><span class="lx-ex-ico">${li("flag")}</span><span class="t"><b>${esc(lv.test.title)}</b><span>${tx(`${lv.test.count} câu tổng hợp · đạt từ ${data.pass} điểm`, `${lv.test.count} mixed questions · pass at ${data.pass}+`)}</span></span>${scoreTag(lv.test.best, data.pass)}</a>` : ""}
      ${(lv.exams || []).length ? `<h3 class="lx-sec-h">${tx("Luyện thi", "Practice tests")}</h3>` : ""}
      ${(lv.exams || []).map((x) => `<a class="lx-test sheet lx-exam" href="/app/ngoai-ngu/bai/${x.id}"><span class="lx-ex-ico">${li("pen")}</span><span class="t"><b>${esc(x.title)}</b><span>${tx(`${x.count} câu (từ vựng + ngữ pháp) · khoảng ${x.timeMinutes} phút · đạt từ ${data.pass} điểm`, `${x.count} questions (vocabulary + grammar) · about ${x.timeMinutes} min · pass at ${data.pass}+`)}</span></span>${scoreTag(x.best, data.pass)}</a>`).join("")}
    </div>`;
}

/* ---------- Foreign language course page ---------- */
export async function pageLangCourse(main, [langId, levelId], query, ctx) {
  const data = await loadLang(true);
  if (!ctx.isCurrent()) return;
  const c = data.courses.find((x) => x.id === langId);
  if (!c) { main.innerHTML = `<div class="sheet empty"><b>Không tìm thấy khóa học</b><a href="/app/">Về trang chủ</a></div>`; return; }
  if (getSubject() !== c.id) setSubject(c.id);
  const lv = c.levels.find((l) => l.id === levelId) || c.levels.find((l) => l.pct < 100) || c.levels[0];
  ctx.setCrumbs([[c.name, `/app/${c.id}`], [tx("Danh sách khóa học / cấp độ", "Courses & Levels")]]);
  if (!lv) { main.innerHTML = `<div class="sheet empty">Khóa này chưa có cấp độ nào.</div>`; return; }
  window.__plAiCtx = { langItem: `${c.id}-${lv.id}`, langName: c.name, page: `${c.name} · ${lv.title}` };
  withAi(ctx);
  const firstUnit = lv.units && lv.units[0];
  const stageBannerHtml = HeroBanner({
    title: `${tx("Chặng", "Stage")} 1 · ${firstUnit ? firstUnit.title : lv.title}`,
    subtitle: lv.desc || c.desc || tx("Chào hỏi, giới thiệu bản thân và sinh hoạt hằng ngày.", "Greetings, self-introduction and daily life."),
    kit: "fox",
    cls: "lx-course-stage-banner",
  });
  main.innerHTML = `
  <div class="lx-course-m-head">
    <div>
      <h1>${esc(c.name)} ${esc(lv.code || lv.title.split(/[—·]/)[0].trim())}</h1>
      <p>${esc(lv.desc || `${tx("Khóa học nền tảng", "Foundation course")} · ${(lv.units || []).length} ${tx("chủ đề", "topics")}`)}</p>
    </div>
    <span class="lx-course-pct-pill">${fmtN(lv.pct || 0)}%</span>
  </div>
  <section class="lx-hero lx-hero-sm" style="--c:${esc(c.color)}">
    <div><span class="edu-eyebrow">${esc(c.framework)} · ${c.levels.length} CẤP ĐỘ</span>
      <h1>${c.flag} ${esc(c.name)} <small>${esc(c.native)}</small></h1><p>${esc(c.desc)}</p>
      <div class="edu-route-progress">${pctBar(c.pct, c.color)}<b>${c.done}/${c.total} bài · ${c.pct}%</b>
        <button class="btn btn-sm" type="button" id="lxCourseAi" style="margin-left:auto">💬 Hỏi gia sư AI</button>
      </div>
    </div>
  </section>
  <nav class="lx-levels">${c.levels.map((l) => `<a href="/app/ngoai-ngu/${c.id}/${l.id}" class="${l.id === lv.id ? "on" : ""}"><b>${l.locked ? li("lock", 13) + " " : ""}${esc(l.title)}</b><span>${l.done}/${l.total}</span>${l.hidden ? `<em>ẩn</em>` : ""}</a>`).join("")}</nav>
  ${stageBannerHtml}
  <section class="lx-sec lx-course-units-sec">
    <div class="sec-head"><div><h2>${tx("Các bài học", "Lessons")}</h2><p>${esc(lv.title)}${lv.desc ? " · " + esc(lv.desc) : ""}</p></div><span class="tag tag-tim">${lv.done}/${lv.total} bài đạt · ${lv.pct}%</span></div>
    ${levelBody(lv, data)}
  </section>`;
  bindUnitSpans(main);
  main.querySelector("#lxCourseAi")?.addEventListener("click", () => {
    if (window.__plAiAsk) window.__plAiAsk(`Mình đang học ${c.name} cấp ${lv.title}. Hãy gợi ý lộ trình học hiệu quả và các chủ điểm quan trọng nhất ở cấp này.`);
  });
}

/* ---------- Flashcard review & mistakes drill ---------- */
export async function pageLangReview(page, [langId], query, ctx) {
  page.innerHTML = ""; const main = document.createElement("div"); page.appendChild(main);
  bindSay(main, ctx);
  let mode = query && query.mode === "mistakes" ? "mistakes" : "due";
  let d = await api(`/api/lang/review/${langId}${mode === "mistakes" ? "?mode=mistakes" : ""}`);
  if (!ctx.isCurrent()) return;
  if (getSubject() !== d.lang) setSubject(d.lang);
  window.__plAiCtx = { langItem: `${d.lang}-review`, langName: d.langName, page: `${d.langName} · Ôn tập từ vựng` };
  withAi(ctx);
  const updateCrumbs = () => ctx.setCrumbs([[d.langName, `/app/ngoai-ngu/${d.lang}`], [mode === "mistakes" ? tx("Ôn câu / từ hay sai", "Review mistakes") : tx("Ôn tập SRS", "SRS Review")]]);
  updateCrumbs();
  let i = 0, flipped = false, good = 0, onlyFav = false;
  const favKey = `pl:fav:${d.lang}`;
  const getFavs = () => { try { return new Set(JSON.parse(localStorage.getItem(favKey) || "[]")); } catch { return new Set(); } };
  const toggleFav = (w) => {
    const s = getFavs();
    if (s.has(w)) s.delete(w); else s.add(w);
    try { localStorage.setItem(favKey, JSON.stringify([...s])); } catch {}
    return s.has(w);
  };
  const modeTabsHtml = () => `<div class="tabs lx-rev-modes" role="tablist" aria-label="${tx("Chế độ ôn tập", "Review mode")}" style="margin:12px 0">
    <button type="button" role="tab" aria-selected="${mode === "due"}" class="${mode === "due" ? "on" : ""}" data-rev-mode="due">${tx("Đến hạn SRS", "SRS Due")} (${fmtN(d.due || 0)})</button>
    <button type="button" role="tab" aria-selected="${mode === "mistakes"}" class="${mode === "mistakes" ? "on" : ""}" data-rev-mode="mistakes">${tx("Từ & câu hay sai", "Frequent mistakes")} (${fmtN(d.mistakes || 0)})</button>
  </div>`;
  const hardQuestionsHtml = () => {
    const list = mode === "mistakes" && Array.isArray(d.hardQuestions) ? d.hardQuestions : [];
    if (!list.length) return "";
    return `<section class="sheet sheet-pad lx-hard-q" style="margin-top:16px" aria-labelledby="lxHardQTitle">
      <div class="sec-head" style="margin-bottom:10px">
        <div>
          <h2 id="lxHardQTitle">${tx("Câu hỏi hay sai trong khóa học", "Frequently missed course questions")}</h2>
          <p class="small muted">${tx("Tổng hợp từ thống kê trả lời sai của khóa học để bạn luyện lại.", "Aggregated from course question error stats so you can re-practice.")}</p>
        </div>
      </div>
      <div class="stack" style="gap:10px">
        ${list.map((hq) => `<article class="sheet sheet-pad" style="padding:14px">
          <div class="row" style="justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px">
            <small class="muted">${esc(hq.title || "")}</small>
            <span class="tag tag-do">${tx(`sai ${fmtN(hq.wrongPct)}%`, `${fmtN(hq.wrongPct)}% wrong`)} · ${fmtN(hq.wrong)}/${fmtN(hq.answered)}</span>
          </div>
          <div class="row" style="align-items:center;gap:8px;margin-bottom:8px">
            <b style="flex:1">${esc(hq.q || "")}</b>
            ${hq.say ? sayBtn(hq.say, d.speech) : ""}
          </div>
          <div class="row" style="justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
            <details style="flex:1;min-width:200px">
              <summary class="small" style="cursor:pointer;font-weight:700">${tx("Xem đáp án & giải thích", "Show answer & explanation")}</summary>
              <div class="small" style="margin-top:6px">
                ${hq.answer ? `<div><b>${tx("Đáp án:", "Answer:")}</b> ${esc(hq.answer)}</div>` : ""}
                ${hq.explain ? `<div class="muted" style="margin-top:2px">${esc(hq.explain)}</div>` : ""}
              </div>
            </details>
            <a class="btn btn-sm btn-primary" href="/app/ngoai-ngu/bai/${esc(hq.itemId)}">${tx("Luyện lại bài này", "Retry lesson")} →</a>
          </div>
        </article>`).join("")}
      </div>
    </section>`;
  };
  const bindModes = () => {
    main.querySelectorAll("[data-rev-mode]").forEach((btn) => btn.addEventListener("click", async () => {
      const nextMode = btn.dataset.revMode === "mistakes" ? "mistakes" : "due";
      if (nextMode === mode) return;
      mode = nextMode;
      try {
        history.replaceState(null, "", `/app/ngoai-ngu/on-tap/${d.lang}${mode === "mistakes" ? "?mode=mistakes" : ""}`);
      } catch {}
      btn.disabled = true;
      try {
        d = await api(`/api/lang/review/${d.lang}${mode === "mistakes" ? "?mode=mistakes" : ""}`);
      } catch (e) { toast(e.message, "err"); btn.disabled = false; return; }
      if (!ctx.isCurrent()) return;
      i = 0; flipped = false; good = 0; onlyFav = false;
      updateCrumbs();
      paint();
    }));
  };
  const paint = () => {
    const favs = getFavs();
    const allCards = Array.isArray(d.cards) ? d.cards : [];
    const cards = onlyFav ? allCards.filter((x) => favs.has(x.word)) : allCards;
    const attnCount = cards.filter((x) => x.wrong > 0).length || favs.size;
    const headTitle = mode === "mistakes" ? tx("Ôn câu & từ hay sai", "Review frequent mistakes") : tx("Ôn tập hôm nay", "Today's Review");
    const headSub = mode === "mistakes"
      ? tx("Tập trung lại các từ từng sai và câu hay nhầm.", "Focus on words you missed and tricky course questions.")
      : tx("Nhắc lại đúng lúc để ghi nhớ lâu hơn.", "Review at the right moment for long-term retention.");
    const hqHtml = hardQuestionsHtml();
    if (!cards.length || i >= cards.length) {
      const emptyTitle = cards.length
        ? (mode === "mistakes"
          ? tx(`Xong lượt ôn từ hay sai: nhớ ${good}/${cards.length} từ`, `Finished mistake review: remembered ${good}/${cards.length} words`)
          : tx(`Xong lượt ôn: nhớ ${good}/${cards.length} từ`, `Review complete: remembered ${good}/${cards.length} words`))
        : onlyFav
          ? tx("Chưa có từ yêu thích nào trong lượt ôn này", "No favorite words in this review session")
          : (mode === "mistakes" ? tx("Chưa có từ hay sai nào được ghi nhận", "No frequent mistakes recorded yet") : tx("Hôm nay không có từ nào cần ôn", "No words due for review today"));
      const emptyDesc = cards.length
        ? tx("Từ chưa nhớ sẽ được nhắc lại ngay lần ôn sau; từ đã nhớ sẽ giãn dần 1, 3, 7, 14, 30 ngày.", "Words you missed will reappear next session; remembered words space out over 1, 3, 7, 14, 30 days.")
        : (mode === "mistakes"
          ? tx("Khi bạn trả lời nhầm từ vựng trong bài tập hoặc thẻ ghi nhớ, từ đó sẽ tự động xuất hiện tại đây.", "When you miss vocabulary in exercises or flashcards, those words will automatically appear here.")
          : tx("Làm thêm bài từ vựng, nghe hoặc bấm ★ yêu thích từ để luyện riêng.", "Try more vocabulary or listening lessons, or ★ star words to practice them separately."));
      main.innerHTML = `<div class="lx-ex-page">
        <div class="lx-rev-m-head">
          <h1>${headTitle}</h1>
          <p>${headSub}</p>
          <div class="lx-rev-kpis">
            <div class="lx-rev-kpi"><b>${fmtN(Math.max(0, cards.length - i))}</b><span>${mode === "mistakes" ? tx("Từ hay sai", "Mistake words") : tx("Từ đến hạn", "Words due")}</span></div>
            <div class="lx-rev-kpi"><b>${fmtN(mode === "mistakes" ? (d.hardQuestions?.length || 0) : attnCount)}</b><span>${mode === "mistakes" ? tx("Câu hay sai", "Hard questions") : tx("Từ cần chú ý", "Needs attention")}</span></div>
          </div>
          ${modeTabsHtml()}
        </div>
        <div class="sheet sheet-pad lx-pro-card">${ChibiMascot({ state: cards.length ? "achievement" : "welcome", size: 88 })}<h2>${emptyTitle}</h2><p>${emptyDesc}</p><div class="row" style="justify-content:center"><a class="btn btn-primary" href="/app/${esc(d.lang)}">${tx("Về trang môn học", "Back to subject")}</a>${onlyFav ? `<button class="btn" id="lxShowAll">${tx("Xem tất cả", "Show all")}</button>` : cards.length ? `<button class="btn" id="lxAgain">${tx("Ôn tiếp", "Review again")}</button>` : (mode === "due" && (d.mistakes || 0) > 0 ? `<button class="btn" data-rev-mode="mistakes">${tx(`Ôn ${fmtN(d.mistakes)} từ hay sai`, `Review ${fmtN(d.mistakes)} mistakes`)}</button>` : "")}</div></div>
        ${hqHtml}
      </div>`;
      bindModes();
      main.querySelector("#lxAgain")?.addEventListener("click", () => pageLangReview(page, [langId], { ...query, mode }, ctx));
      main.querySelector("#lxShowAll")?.addEventListener("click", () => { onlyFav = false; i = 0; paint(); });
      return;
    }
    const c = cards[i];
    const isFav = favs.has(c.word);
    const estMin = Math.max(1, Math.ceil((cards.length - i) * 0.5));
    main.innerHTML = `<div class="lx-ex-page lx-review-page">
      <div class="lx-rev-m-head">
        <h1>${headTitle}</h1>
        <p>${headSub}</p>
        <div class="lx-rev-kpis">
          <div class="lx-rev-kpi"><b>${fmtN(cards.length - i)}</b><span>${mode === "mistakes" ? tx("Từ hay sai", "Mistake words") : tx("Từ đến hạn", "Words due")}</span></div>
          <div class="lx-rev-kpi"><b>${fmtN(mode === "mistakes" ? (d.hardQuestions?.length || 0) : attnCount)}</b><span>${mode === "mistakes" ? tx("Câu hay sai", "Hard questions") : tx("Từ cần chú ý", "Needs attention")}</span></div>
        </div>
        ${modeTabsHtml()}
      </div>
      <div class="page-head"><div><span class="edu-eyebrow">${d.flag} ${esc(d.langName)} · ${mode === "mistakes" ? tx("ÔN TỪ HAY SAI", "FREQUENT MISTAKES") : tx("ÔN TẬP SRS", "SRS REVIEW")}</span><h1>${tx(`Thẻ ${i + 1}/${cards.length}`, `Card ${i + 1}/${cards.length}`)}</h1><p>${tx("Nhớ nghĩa trước, rồi bấm lật thẻ để kiểm tra. Bấm ★ để lưu từ yêu thích.", "Recall the meaning first, then flip to check. Click ★ to save favorites.")}</p></div><div class="row">${favs.size ? `<button type="button" class="btn btn-sm ${onlyFav ? "btn-primary" : ""}" id="lxFavFilter">${tx(`★ Yêu thích (${favs.size})`, `★ Favorites (${favs.size})`)}</button>` : ""}${ChibiMascot({ state: flipped ? "learning" : "welcome", size: 70 })}</div></div>
      <div class="lx-flash ${flipped ? "flip" : ""}" style="--c:${esc(d.color)}" tabindex="0" role="button" aria-label="${tx("Lật thẻ", "Flip card")}">
        <div class="lx-flash-top">
          <span class="lx-ex-pill">${tx("TỪ VỰNG", "VOCABULARY")} · ${i + 1}/${cards.length}</span>
          <span class="lx-ex-cnt">${tx("Còn", "Left")} ${estMin} ${tx("phút", "min")}</span>
        </div>
        <button type="button" class="lx-fav-btn ${isFav ? "on" : ""}" data-fav="${esc(c.word)}" title="${tx("Đánh dấu từ yêu thích", "Toggle favorite")}" aria-label="${tx("Đánh dấu từ yêu thích", "Toggle favorite")}">${isFav ? "★" : "☆"}</button>
        <div class="lx-flash-word">${esc(c.word)} ${sayBtn(c.word, d.speech)}</div>
        ${c.reading ? `<div class="lx-flash-reading">${esc(c.reading)}</div>` : ""}
        ${flipped ? `<div class="lx-flash-back"><b class="lx-vi">${esc(c.meaning)}</b><span class="small muted">${esc(c.level)} · ${esc(c.unit)}${c.wrong ? ` · ${tx(`đã sai ${c.wrong} lần`, `missed ${c.wrong}x`)}` : ""}</span></div>` : `<div class="muted small lx-flash-hint">${tx("Chạm để xem nghĩa", "Tap to reveal meaning")}</div>`}
        <button type="button" class="btn btn-primary btn-block lx-flash-reveal" data-flip-btn>${flipped ? tx("Ẩn đáp án", "Hide answer") : tx("Hiện đáp án", "Show answer")}</button>
      </div>
      <div class="row lx-flash-actions" ${flipped ? "" : "hidden"}><button class="btn" data-r="0">${tx("Chưa nhớ", "Not yet")}</button><button class="btn btn-primary" data-r="1">${tx("Nhớ rồi", "Got it")}</button><button class="btn" type="button" id="lxAskWord">${tx("💬 Hỏi AI mẹo nhớ & ví dụ", "💬 Ask AI for memory tips & examples")}</button></div>
      <details class="lx-due-list" open>
        <summary><span>${mode === "mistakes" ? tx("Danh sách từ hay sai", "Frequent mistakes list") : tx("Danh sách đến hạn", "Due words list")}</span><b>${cards.length - i} ${tx("còn lại", "left")}</b></summary>
        <ol>${cards.map((x, idx) => `<li><button type="button" class="lx-due-row ${idx === i ? "on" : ""}" data-go="${idx}"${idx === i ? ' aria-current="true"' : ""}><span class="lx-due-no">${idx + 1}</span><span class="lx-due-t"><b>${esc(x.word)}</b><small>${esc(x.meaning)}</small></span>${x.wrong ? `<em>${tx(`sai ${x.wrong}`, `${x.wrong} wrong`)}</em>` : ""}</button></li>`).join("")}</ol>
      </details>
      ${hqHtml}
    </div>`;
    bindModes();
    main.querySelector("#lxFavFilter")?.addEventListener("click", () => { onlyFav = !onlyFav; i = 0; flipped = false; paint(); });
    main.querySelector("[data-fav]")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const added = toggleFav(c.word);
      toast(added ? tx(`Đã thêm "${c.word}" vào yêu thích ★`, `Added "${c.word}" to favorites ★`) : tx(`Đã bỏ "${c.word}" khỏi yêu thích`, `Removed "${c.word}" from favorites`), "info");
      paint();
    });
    main.querySelector("#lxAskWord")?.addEventListener("click", () => {
      if (window.__plAiAsk) window.__plAiAsk(`Từ vựng ${d.langName}: "${c.word}"${c.reading ? ` (${c.reading})` : ""} nghĩa là "${c.meaning}". Hãy cho mình mẹo nhớ nhanh (chiết tự/gốc từ/liên tưởng) và 2 câu ví dụ ngắn dễ nhớ.`);
    });
    const flashEl = main.querySelector(".lx-flash");
    const doFlip = (e) => {
      if (e.target.closest("[data-say],[data-fav]")) return;
      flipped = !flipped;
      paint();
    };
    flashEl.addEventListener("click", doFlip);
    flashEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); doFlip(e); }
    });
    main.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => {
      i = +b.dataset.go; flipped = false; paint();
    }));
    main.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", async () => {
      const ok = b.dataset.r === "1";
      try { await api("/api/lang/review", "POST", { lang: d.lang, word: c.word, ok }); } catch (e) { toast(e.message, "err"); return; }
      if (ok) good++;
      i++; flipped = false; CACHE = null; paint();
    }));
  };
  paint();
}

/* ---------- Level completion certificate ---------- */
export async function pageLangCertificate(main, [langId, levelId], query, ctx) {
  const d = await api(`/api/lang/certificate/${langId}/${levelId}`);
  if (!ctx.isCurrent()) return;
  ctx.setCrumbs([["Trang chủ", "/app/"], [d.course, `/app/ngoai-ngu/${langId}`], [`Chứng nhận ${d.level}`]]);
  if (!d.ok) { main.innerHTML = `<div class="sheet sheet-pad lx-pro-card"><div class="lx-pro-ico">${li("cap", 34)}</div><h2>Chưa đủ điều kiện nhận chứng nhận ${esc(d.level)}</h2><p>Cần đạt tất cả ${d.total} bài của cấp (đã đạt ${d.done}).</p><a class="btn btn-primary" href="/app/ngoai-ngu/${langId}/${levelId}">Học tiếp</a></div>`; return; }
  const dt = d.date ? new Date(d.date).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN");
  main.innerHTML = `<div class="lx-cert-wrap"><div class="lx-cert" style="--c:${esc(d.color)}">
    <div class="lx-cert-top">${esc(S.cfg && S.cfg.siteName || "LifeRivo")}</div>
    <h1>CHỨNG NHẬN HOÀN THÀNH</h1>
    <p>Chứng nhận học viên</p><div class="lx-cert-name">${esc(d.name)}</div>
    <p>đã hoàn thành toàn bộ bài học và bài kiểm tra</p>
    <div class="lx-cert-course">${d.flag} ${esc(d.course)} · ${esc(d.level)}</div>
    <p class="small">Theo khung ${esc(d.framework)} · Điểm kiểm tra cấp độ: <b>${d.testScore}/100</b></p>
    <div class="lx-cert-foot"><span>Ngày cấp: ${esc(dt)}</span><span>Mã: ${esc(d.code)}</span></div>
  </div><div class="row" style="justify-content:center;margin-top:14px"><button class="btn btn-primary" id="lxPrint">${li("print", 16)}In / Lưu PDF</button></div></div>`;
  main.querySelector("#lxPrint").addEventListener("click", () => window.print());
}

/* ---------- Foreign language achievements (certificates, leaderboard, badges) ---------- */
async function courseOf(langId, ctx) {
  const data = await loadLang(true);
  const c = data.courses.find((x) => x.id === langId);
  if (c && getSubject() !== c.id) setSubject(c.id);
  return { data, c };
}
export async function pageLangCertList(main, [langId], query, ctx) {
  const { c } = await courseOf(langId, ctx);
  if (!ctx.isCurrent()) return;
  if (!c) { main.innerHTML = `<div class="sheet empty">Không tìm thấy khóa học.</div>`; return; }
  ctx.setCrumbs([[c.name, `/app/ngoai-ngu/${c.id}`], [tx("Chứng nhận", "Certificates")]]);
  const featLv = c.levels.find((l) => l.pct === 100) || c.levels[0];
  const nextLv = c.levels.find((l) => l.pct < 100 && !l.locked) || c.levels[1] || c.levels[0];
  const featCode = String(featLv?.id || featLv?.code || "A1").replace(/^cefr\s+/i, "").trim().toUpperCase();
  main.innerHTML = `<div class="page-head lx-cert-m-head"><div><span class="edu-eyebrow">${c.flag} ${esc(c.name)} · THÀNH TÍCH</span><h1>${tx("Chứng nhận của bạn", "Your certificates")}</h1><p>${tx("Mỗi chứng nhận đánh dấu một cấp độ bạn đã hoàn thành.", "Each certificate marks a completed level.")}</p></div></div>
  ${featLv ? `<div class="lx-cert-featured">
    <div class="lx-cert-feat-ico">🎖️</div>
    <h2>${tx("Chứng nhận", "Certificate")} ${esc(featCode)}</h2>
    <p>${esc(c.name)} · ${featLv.pct === 100 ? tx("Hoàn thành cấp độ", "Level completed") : `${featLv.done}/${featLv.total} ${tx("bài đạt", "lessons passed")} · ${featLv.pct}%`}</p>
    <span class="lx-cert-feat-tag ${featLv.pct === 100 ? "is-done" : ""}">${featLv.pct === 100 ? tx("Đã đạt", "Earned") : tx("Đang học", "In progress")}</span>
    <a class="btn btn-primary btn-block lx-cert-feat-btn" href="${featLv.pct === 100 ? `/app/ngoai-ngu/chung-nhan/${c.id}/${featLv.id}` : `/app/ngoai-ngu/${c.id}/${featLv.id}`}">${featLv.pct === 100 ? tx("Xem chứng nhận", "View certificate") : tx("Học tiếp", "Continue learning")}</a>
  </div>` : ""}
  ${nextLv && nextLv !== featLv ? `<div class="sheet sheet-pad lx-cert-next">
    <b>${tx("Tiến độ cấp độ tiếp theo", "Next level progress")}</b>
    <p>${esc(c.name)} ${esc(nextLv.title)} · ${tx("Đã hoàn thành", "Completed")} ${nextLv.pct}%</p>
    ${pctBar(nextLv.pct, "#3F97D3")}
  </div>` : ""}
  <div class="lx-cert-list">${c.levels.map((l) => `<div class="sheet lx-cert-item ${l.pct === 100 ? "done" : ""}" style="--c:${esc(c.color)}">
    <div class="lx-cert-ico">${li(l.pct === 100 ? "cap" : l.locked ? "lock" : "page", 26)}</div>
    <div class="t"><b>${esc(l.title)}</b><span>${l.done}/${l.total} bài đạt · ${l.pct}%</span>${pctBar(l.pct, c.color)}</div>
    ${l.pct === 100 ? `<a class="btn btn-primary btn-sm" href="/app/ngoai-ngu/chung-nhan/${c.id}/${l.id}">Xem chứng nhận</a>` : l.locked ? `<a class="btn btn-sm" href="/app/bang-gia">Pro</a>` : `<a class="btn btn-sm" href="/app/ngoai-ngu/${c.id}/${l.id}">Học tiếp</a>`}
  </div>`).join("")}</div>`;
}
export async function pageLangLeaderboard(main, [langId], query, ctx) {
  const { c } = await courseOf(langId, ctx);
  if (!c) { main.innerHTML = `<div class="sheet empty">Không tìm thấy khóa học.</div>`; return; }
  const d = await api(`/api/lang/leaderboard/${c.id}`);
  if (!ctx.isCurrent()) return;
  ctx.setCrumbs([[c.name, `/app/ngoai-ngu/${c.id}`], [tx("Xếp hạng", "Leaderboard")]]);
  const meRow = d.top.find((r) => r.me);
  const myRank = meRow ? meRow.rank : d.myRank || (d.top.length + 1);
  const kits = ["owl", "fox", "cat", "bunny", "frog", "dragon"];
  main.innerHTML = `<div class="page-head"><div><span class="edu-eyebrow">${c.flag} ${esc(c.name)} · THÀNH TÍCH</span><h1>Bảng xếp hạng ${esc(c.name)}</h1><p>Xếp theo số bài đã đạt (từ ${CACHE ? CACHE.pass : 80} điểm), bằng nhau thì xét tổng điểm.</p></div></div>
  <div class="lx-lb-hero">
    <span class="lx-lb-hero-ico">🏆</span>
    <div>
      <b>${tx(`Tuần này bạn đang ở hạng #${myRank}`, `You are ranked #${myRank} this week`)}</b>
      <span>${tx("Tiếp tục học để tăng điểm XP.", "Keep learning to earn more XP.")}</span>
    </div>
  </div>
  <div class="sheet lx-lb lx-lb-big">${d.top.length ? d.top.map((r, idx) => { const xp = Number(r.points) || (Number(r.passed) || 1) * 100; return `<div class="lx-lb-row ${r.me ? "me" : ""}"><span class="lx-lb-rank">${r.rank <= 3 ? `<i class="lx-medal m${r.rank}">#${r.rank}</i>` : `#${r.rank}`}</span><img class="lx-lb-av" src="/img/kit/chibi-${r.me ? "bunny" : kits[idx % kits.length]}.webp" alt="" width="38" height="38" loading="lazy" /><b>${esc(r.name)}${r.me ? " (bạn)" : ""}</b><span class="lx-lb-xp">${xp} XP</span></div>`; }).join("") : `<div class="empty small muted" style="padding:16px">Chưa có ai đạt bài nào. Hãy là người đầu tiên!</div>`}</div>`;
}
export async function pageLangBadges(main, [langId], query, ctx) {
  const { data, c } = await courseOf(langId, ctx);
  if (!c) { main.innerHTML = `<div class="sheet empty">Không tìm thấy khóa học.</div>`; return; }
  let streak = 0; try { const d = await api(`/api/lang/insights/${encodeURIComponent(c.id)}`); streak = Math.max(Number(d?.insights?.streak?.longest) || 0, Number(d?.insights?.streak?.current) || 0); } catch {}
  if (!ctx.isCurrent()) return;
  ctx.setCrumbs([[c.name, `/app/ngoai-ngu/${c.id}`], [tx("Huy hiệu", "Badges")]]);
  const all = c.levels.flatMap((l) => l.units.flatMap((u) => u.exercises));
  const passed = (k) => all.filter((e) => e.kind === k && e.best >= data.pass).length;
  const words = c.levels.reduce((s, l) => s + l.units.reduce((t, u) => t + ((u.exercises.find((e) => e.kind === "nghia") || {}).best >= data.pass ? u.words : 0), 0), 0);
  const perfect = all.filter((e) => e.best === 100).length;
  const B = [
    ["🔥", "Chuỗi 7 ngày", "Học liên tục 7 ngày", streak, 7],
    ["📚", "100 từ vựng", "Hoàn thành 100 từ", words, 100],
    ["🎤", "Tự tin phát âm", "Luyện nói 10 bài", passed("noi"), 10],
    ["⭐", "Chinh phục cấp độ", "Đạt hết bài của 1 cấp", c.levels[0] ? c.levels[0].done : c.done, c.levels[0] ? (c.levels[0].total || 1) : 10],
    ["🌱", "Bước đầu tiên", "Đạt bài đầu tiên", c.done, 1],
    ["🏅", "Bền bỉ", "Đạt 50 bài", c.done, 50],
    ["🔤", "Vốn từ 50", "Thuộc 50 từ vựng", words, 50],
    ["🎧", "Đôi tai thính", "Đạt 5 bài luyện nghe", passed("nghe"), 5],
    ["🧩", "Vững ngữ pháp", "Đạt 10 bài ngữ pháp", passed("ngu-phap"), 10],
    ["💯", "Hoàn hảo", "10 bài đạt 100 điểm", perfect, 10],
    ["🃏", "Ôn đều tay", "Theo dõi 30 từ trong thẻ ôn tập", c.review ? c.review.total : 0, 30],
    ["🌋", "Chuỗi 30 ngày", "Học 30 ngày liên tiếp", streak, 30],
    ...c.levels.map((l) => ["🎓", `Hoàn thành ${l.title}`, `Đạt hết bài của ${l.title}`, l.done, l.total || 1]),
  ];
  const got = B.filter((b) => b[3] >= b[4]).length;
  main.innerHTML = `<div class="page-head lx-badge-m-head"><div><span class="edu-eyebrow">${c.flag} ${esc(c.name)} · THÀNH TÍCH</span><h1>${tx("Huy hiệu của bạn", "Your badges")}</h1><p>${tx("Đã đạt", "Unlocked")} <b>${got}/${B.length}</b> ${tx("huy hiệu", "badges")}.</p></div>${ChibiMascot({ state: "achievement", size: 80 })}</div>
  <div class="lx-badges">${B.map(([ic, t, d, v, need], idx) => AchievementCard({ icon: ic, title: t, desc: d, value: v, need, color: c.color, idx })).join("")}</div>`;
}

/* ---------- Lesson theory page ---------- */
export async function pageLangTheory(page, [langId, levelId, unitId], query, ctx) {
  page.innerHTML = "";
  const main = document.createElement("div"); page.appendChild(main);
  const d = await apiOrPro(main, `/api/lang/theory/${langId}/${levelId}/${encodeURIComponent(unitId)}`);
  if (!d) return;
  if (!ctx.isCurrent()) return;
  const t = d.theory;
  if (getSubject() !== t.lang) setSubject(t.lang);
  window.__plAiCtx = { langItem: `${t.lang}-${t.levelId}-u${t.unitId}`, langName: t.langName, page: `${t.langName} · ${t.levelTitle} · Lý thuyết bài ${t.unitNo || t.unitId}` };
  withAi(ctx);
  ctx.setCrumbs([[t.langName, `/app/ngoai-ngu/${t.lang}/${t.levelId}`], [tx("Chi tiết bài học", "Lesson Detail")]]);
  const firstEx = d.exercises && d.exercises[0];
  const unitNumStr = String(t.unitNo || t.unitId).padStart(2, "0");
  main.innerHTML = `
  <div class="lx-ex-page lx-theory">
    <div class="lx-th-hero">
      <span class="lx-th-kicker">${tx("BÀI", "LESSON")} ${esc(unitNumStr)} · ${tx("TỪ VỰNG", "VOCABULARY")}</span>
      <h1>${esc(t.unitTitle)}</h1>
      <p class="lx-th-sub">${esc(t.basics && t.basics[0] ? t.basics[0] : tx("Đọc và nghe từ vựng, mẫu câu trước khi làm bài luyện tập.", "Read and listen to the words and sample sentences before practising."))}</p>
    </div>
    <div class="page-head"><div><span class="edu-eyebrow">${t.flag} ${esc(t.langName)} · ${esc(t.levelTitle)} · LÝ THUYẾT</span>
      <h1>Bài ${esc(t.unitNo || t.unitId)}: ${esc(t.unitTitle)}</h1><p>Đọc và nghe trước, rồi làm 4 dạng bài tập bên dưới. Có thắc mắc, bấm <b>Hỏi AI</b> — gia sư biết bạn đang học bài này.</p></div>${ChibiMascot({ state: "learning", size: 78 })}</div>
    ${t.words.length ? `<section class="sheet lx-box lx-vocab-sec"><h2>${li("book")}Từ vựng (${t.words.length})</h2>
      <table class="lx-vocab"><thead><tr><th>Từ</th>${t.typeMode === "word" ? "" : `<th>${esc(t.readingLabel)}</th>`}<th>Nghĩa</th><th></th></tr></thead><tbody>
      ${t.words.map((w) => `<tr><td class="lx-w">${esc(w.word)}</td>${t.typeMode === "word" ? "" : `<td class="lx-ipa"><span class="lx-ipa-pill">${esc(w.reading)}</span></td>`}<td class="lx-vi">${esc(w.meaning)}</td><td><button type="button" class="lx-say-pill" data-say="${esc(w.word)}" data-lang="${esc(t.speech)}">▶ ${tx("Nghe mẫu", "Listen")}</button> ${sayBtn(w.word, t.speech)} <button type="button" class="btn btn-sm lx-save-word" data-w="${esc(w.word)}" data-r="${esc(w.reading || "")}" data-m="${esc(w.meaning || "")}" data-l="${esc(t.lang)}" aria-pressed="${isWordSaved(t.lang, w.word)}">${isWordSaved(t.lang, w.word) ? "★" : "☆"} ${isWordSaved(t.lang, w.word) ? tx("Đã lưu", "Saved") : tx("Lưu từ", "Save")}</button></td></tr>`).join("")}</tbody></table>
    </section>` : ""}
    ${t.sentences.length ? `<section class="sheet lx-box lx-sent-sec"><h2>${li("chat")}Mẫu câu</h2>${t.sentences.map((x) => `<div class="lx-sent"><div><b>${esc(x.text)}</b><span class="lx-vi">${esc(x.meaning)}</span><button type="button" class="lx-say-sent" data-say="${esc(x.text)}" data-lang="${esc(t.speech)}">🔊 ${tx("Nghe câu mẫu", "Listen to sentence")}</button></div>${sayBtn(x.text, t.speech)}</div>`).join("")}</section>` : ""}
    <details class="sheet lx-box"><summary><b>${li("ruler")}Quy tắc nền tảng của ${esc(t.langName)}</b></summary><ul>${t.basics.map((b) => `<li>${esc(b)}</li>`).join("")}</ul></details>
    ${t.rules.length ? `<section class="sheet lx-box lx-note-card"><h2>💡 ${tx("Ghi nhớ", "Key notes")}</h2><ol class="lx-rules">${t.rules.map((r) => `<li>${esc(r)}</li>`).join("")}</ol></section>` : `<section class="sheet lx-box lx-note-card"><h2>💡 ${tx("Ghi nhớ", "Key notes")}</h2><p class="lx-note-p">${esc(t.basics && t.basics[1] ? t.basics[1] : tx("Nghe phát âm mẫu rồi lặp lại to, rõ từng từ trước khi làm bài tập.", "Listen to the model pronunciation and repeat aloud before starting the exercise."))}</p></section>`}
    ${firstEx ? `<div class="lx-th-cta-wrap"><a class="btn btn-primary btn-block lx-th-cta" href="/app/ngoai-ngu/bai/${esc(firstEx.id)}">${tx("Làm bài luyện tập", "Start exercise")} →</a></div>` : ""}
    <section class="lx-box"><div class="row lx-theory-actions"><button class="btn" id="lxAskRule">${li("chat", 16)}Hỏi AI giải thích bài này</button>${t.words.length ? `<button class="btn" type="button" id="lxAskVocab">${li("book", 16)}Mẹo nhớ từ vựng bài này</button><a class="btn" href="/app/ngoai-ngu/luyen-noi/${t.lang}/${t.levelId}/tu/${esc(t.unitId)}">${li("mic", 16)}Luyện đọc từ vựng bài này</a>` : ""}${t.sentences.length ? `<a class="btn" href="/app/ngoai-ngu/luyen-noi/${t.lang}/${t.levelId}/cau/${esc(t.unitId)}">${li("mic", 16)}Đọc theo mẫu câu</a>` : ""}</div>
      <h2>Luyện tập</h2><div class="lx-ex-list">${d.exercises.map((e) => `<a class="lx-ex" href="/app/ngoai-ngu/bai/${e.id}"><span class="t"><b>${esc(e.kindTitle)}</b><span>${e.count} câu</span></span><span class="tag tag-tim">Làm bài →</span></a>`).join("")}</div></section>
  </div>`;
  bindSay(main, ctx);
  main.querySelector("#lxAskRule").addEventListener("click", () => { if (window.__plAiAsk) window.__plAiAsk("Giải thích ngắn gọn các quy tắc ngữ pháp của bài này, mỗi quy tắc cho 2 ví dụ."); else toast("Trợ lý AI tạm thời chưa sẵn sàng.", "info"); });
  main.querySelector("#lxAskVocab")?.addEventListener("click", () => { if (window.__plAiAsk) window.__plAiAsk("Cho mình mẹo nhớ nhanh các từ vựng trong bài này (nhóm từ, chiết tự hoặc từ ghép hay đi kèm) và đặt câu ngắn ứng dụng."); else toast("Trợ lý AI tạm thời chưa sẵn sàng.", "info"); });
}

/* ---------- Special character keyboard ---------- */
const KEYS = {
  zh: ["ā", "á", "ǎ", "à", "ē", "é", "ě", "è", "ī", "í", "ǐ", "ì", "ō", "ó", "ǒ", "ò", "ū", "ú", "ǔ", "ù", "ü", "ǘ", "ǚ", "ǜ"],
  fr: ["é", "è", "ê", "ë", "à", "â", "ç", "î", "ï", "ô", "û", "ù", "œ", "’"],
  en: [],
  ja: ["ā", "ī", "ū", "ē", "ō"],
  ko: ["ŏ", "ŭ"],
  es: ["á", "é", "í", "ó", "ú", "ü", "ñ", "¿", "¡"],
};
function keyboardHtml(lang) {
  const k = KEYS[lang] || [];
  return k.length ? `<div class="lx-kbd" aria-label="Bàn phím ký tự">${k.map((c) => `<button type="button" data-ch="${c}" tabindex="-1">${c}</button>`).join("")}</div>` : "";
}
function bindKeyboard(root) {
  let last = null;
  root.addEventListener("focusin", (e) => { if (e.target.matches("input.lx-input")) last = e.target; });
  root.addEventListener("mousedown", (e) => { if (e.target.closest("[data-ch]")) e.preventDefault(); });
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ch]"); if (!b) return;
    const inp = last && document.body.contains(last) && !last.disabled ? last : root.querySelector("input.lx-input:not([disabled])");
    if (!inp) return;
    const st = inp.selectionStart ?? inp.value.length, en = inp.selectionEnd ?? inp.value.length;
    inp.value = inp.value.slice(0, st) + b.dataset.ch + inp.value.slice(en);
    inp.focus(); inp.setSelectionRange(st + 1, st + 1);
    inp.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

/* ---------- Exercise workspace ---------- */
export async function pageLangExercise(page, [exId], query, ctx) {
  // Attach events to this page's own container so they do not leak into other exercises on navigation.
  page.innerHTML = "";
  const main = document.createElement("div");
  page.appendChild(main);
  const data = await apiOrPro(main, `/api/lang/ex/${encodeURIComponent(exId)}`);
  if (!data) return;
  if (!ctx.isCurrent()) return;
  const ex = data.exercise;
  if (getSubject() !== ex.lang) setSubject(ex.lang);
  const asgId = /^\d+$/.test(String(query.asg || "")) ? Number(query.asg) : 0;
  let asgNote = "";
  window.__plAiCtx = { langItem: ex.id, langName: ex.langName, page: `${ex.langName} · ${ex.levelTitle} · ${ex.title}` };
  withAi(ctx);
  ctx.setCrumbs([[ex.langName, `/app/ngoai-ngu/${ex.lang}/${ex.levelId}`], [tx("Bài tập tương tác", "Interactive Exercise")]]);
  const answers = ex.questions.map((q) => q.type === "order" ? [] : q.type === "mcq" ? null : "");
  // Đề luyện thi: đếm ngược theo số phút của đề và tự nộp khi hết giờ. Mốc bắt đầu lưu trong sessionStorage,
  // nên tải lại trang không làm mất thời gian. Đây là kiểm soát phía trình duyệt: máy chủ chỉ chấm bài đã nộp.
  const isExam = ex.kind === "luyen-thi" && ex.timeMinutes > 0;
  const EXAM_KEY = `lxexam:${ex.id}`;
  let examEnd = 0, examTick = 0;
  const stopExamClock = () => { if (examTick) clearInterval(examTick); examTick = 0; try { sessionStorage.removeItem(EXAM_KEY); } catch {} };
  const examTickFn = () => {
    const left = Math.max(0, examEnd - Date.now());
    const el = main.querySelector("#lxTimer");
    if (el) { el.textContent = `Còn ${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, "0")}`; el.classList.toggle("warn", left <= 120000); }
    if (left <= 0 && examTick) { clearInterval(examTick); examTick = 0; submit(true); }
  };
  const startExamClock = () => {
    if (!isExam) return;
    const total = ex.timeMinutes * 60000;
    let start = 0;
    try { start = Number(sessionStorage.getItem(EXAM_KEY) || 0); } catch {}
    if (!start || start > Date.now() || Date.now() - start > total + 60000) { start = Date.now(); try { sessionStorage.setItem(EXAM_KEY, String(start)); } catch {} }
    examEnd = start + total;
    if (!examTick) examTick = setInterval(examTickFn, 1000);
    examTickFn();
  };
  ctx.onLeave(() => { if (examTick) clearInterval(examTick); examTick = 0; });
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recIdx = -1, rec = null, recDet = null, recTimer = 0, recEndTimer = 0, recServer = false;
  ctx.onLeave(() => {
    if (recDet) { recDet.destroy(); recDet = null; }
    clearTimeout(recTimer); recTimer = 0;
    clearTimeout(recEndTimer); recEndTimer = 0;
    try { rec && rec.abort(); } catch {}
  });
  // Quick client-side comparison for immediate similarity feedback (server still grades officially).
  const norm = (t) => String(t || "").toLowerCase().normalize("NFC").replace(/[.,!?;:"'“”‘’()¿¡。、，！？：；「」・…\-]/g, " ").replace(/\s+/g, " ").trim();
  const simil = (a, b) => {
    const cjk = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(b);
    const A = cjk ? [...norm(a).replace(/ /g, "")] : norm(a).split(" "), B = cjk ? [...norm(b).replace(/ /g, "")] : norm(b).split(" ");
    if (!B.length) return 0;
    const d = Array.from({ length: A.length + 1 }, (_, i) => [i, ...Array(B.length).fill(0)]);
    for (let j = 1; j <= B.length; j++) d[0][j] = j;
    for (let i = 1; i <= A.length; i++) for (let j = 1; j <= B.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
    return Math.max(0, 1 - d[A.length][B.length] / Math.max(A.length, B.length));
  };
  const live = {};
  const ERR = { "not-allowed": "Bạn chưa cho phép dùng micro. Bấm biểu tượng ổ khóa trên thanh địa chỉ → cho phép Micro, rồi thử lại.", "service-not-allowed": "Trình duyệt chặn dịch vụ nhận giọng nói. Hãy dùng Chrome/Edge bản mới.", "audio-capture": "Không tìm thấy micro. Kiểm tra micro đã cắm và được chọn trong cài đặt máy.", "network": "Nhận giọng nói cần Internet (Chrome gửi âm thanh lên máy chủ nhận dạng). Kiểm tra mạng rồi thử lại.", "no-speech": "Không nghe thấy tiếng nói. Nói to, gần micro hơn và thử lại.", "language-not-supported": "Trình duyệt chưa hỗ trợ nhận giọng nói cho ngôn ngữ này. Bạn có thể gõ câu vào ô." };
  // Tỷ lệ từ của câu mẫu đã được nghe (đếm trùng lặp). Đạt 100% thì tự dừng.
  const coveredPct = (heard, target) => {
    const T = norm(target);
    if (!T) return 0;
    const H = norm(heard);
    if (/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(T)) {
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
  // Trên điện thoại: thu âm, gửi lên server mỗi ~2,5 giây để hiện chữ gần thời gian thực, tự dừng khi dứt câu hoặc đủ từ.
  function listenServer(i) {
    if (recIdx === i) { endRec(); return; }
    if (rec) { const old = rec; finishRec(old); try { old.abort ? old.abort() : old.stop(); } catch {} }
    const target = ex.questions[i].say || ex.questions[i].q;
    const cap = startLiveCapture(ex.speech, {
      maxMs: 20000,
      partialMs: 2500,
      silenceMs: 1300,
      noSpeechMs: 7500,
      onPartial: (t) => {
        if (rec !== cap) return;
        live[i] = t;
        const inp = main.querySelector(`.lx-speak-in[data-q="${i}"]`);
        if (inp) inp.value = t;
      },
      shouldStop: (t) => coveredPct(t, target) >= 1,
    });
    rec = cap; recServer = true; recIdx = i; live[i] = ""; paintKeep();
    clearTimeout(recTimer); recTimer = setTimeout(endRec, 22000);
    cap.done.then((out) => {
      if (rec !== cap) return;
      if (out.text) answers[i] = out.text;
      else if (out.error && out.error !== "aborted") toast(ERR[out.error] || "Không nghe rõ, thử lại nhé.", out.error === "no-speech" ? "info" : "err");
      finishRec(cap);
    });
  }
  function listen(i) {
    if (MOBILE_UA) return listenServer(i);
    if (!SR) { toast("Trình duyệt này chưa hỗ trợ nhận giọng nói. Hãy dùng Chrome/Edge, hoặc gõ lại câu.", "info"); return; }
    if (!window.isSecureContext) { toast("Micro chỉ dùng được khi trang chạy bằng https:// (hoặc localhost).", "err"); return; }
    if (recIdx === i) { endRec(); return; }
    if (rec) { const old = rec; finishRec(old); try { old.abort(); } catch {} }
    rec = new SR(); rec.lang = ex.speech; rec.interimResults = true; rec.maxAlternatives = 3; rec.continuous = true;
    const r = rec;
    const target = ex.questions[i].say || ex.questions[i].q;
    const det = createSrEndDetector({
      postSpeechMs: 1300,
      speechEndMs: 650,
      noSpeechMs: 7500,
      onAutoStop: (reason) => {
        if (rec !== r) return;
        if (reason === "no-speech" && !live[i] && !answers[i]) toast(ERR["no-speech"], "info");
        endRec();
      },
    });
    recDet = det;
    recIdx = i; live[i] = ""; paintKeep();
    clearTimeout(recTimer); recTimer = setTimeout(endRec, 15000);
    r.onstart = () => det.onStart();
    r.onspeechstart = () => det.onSpeechStart();
    r.onspeechend = () => det.onSpeechEnd();
    r.onresult = (e) => {
      let finTxt = "", interTxt = "";
      for (const res of e.results) {
        if (res.isFinal) finTxt = joinTranscript(finTxt, res[0].transcript);
        else interTxt = joinTranscript(interTxt, res[0].transcript);
      }
      const txt = joinTranscript(finTxt, interTxt);
      const hasInterim = Boolean(interTxt.trim());
      const isFinal = Boolean(finTxt.trim()) && !hasInterim;
      if (isFinal) {
        // Pick the recognition alternative closest to the target sentence among the browser's candidates.
        const last = e.results[e.results.length - 1];
        let best = txt;
        if (e.results.length === 1) for (const alt of last) if (simil(alt.transcript, target) > simil(best, target)) best = alt.transcript;
        answers[i] = best.trim(); live[i] = "";
        const inp = main.querySelector(`.lx-speak-in[data-q="${i}"]`);
        if (inp) inp.value = answers[i];
      } else {
        live[i] = txt;
        const inp = main.querySelector(`.lx-speak-in[data-q="${i}"]`);
        if (inp) inp.value = txt;
      }
      det.onResult({ transcript: txt, isFinal, hasInterim });
      // Đã đọc đủ các từ của câu mẫu thì tự dừng (chạy trên cả interim lẫn final).
      if (txt && coveredPct(txt, target) >= 1) endRec();
    };
    r.onerror = (e) => { if (e.error !== "aborted") toast(ERR[e.error] || "Không nghe rõ, thử lại nhé.", e.error === "no-speech" ? "info" : "err"); };
    r.onend = () => finishRec(r);
    try { r.start(); } catch (err) { finishRec(r); toast("Không bật được micro: " + err.message, "err"); }
  }
  // Dọn trạng thái ghi âm. iOS Safari đôi khi không gọi onend, nên hàm này tự reset để nút không bị kẹt ở "Đang nghe".
  function finishRec(r) {
    if (rec !== r) return;
    const i = recIdx;
    clearTimeout(recTimer); recTimer = 0;
    clearTimeout(recEndTimer); recEndTimer = 0;
    if (recDet) { recDet.destroy(); recDet = null; }
    if (i >= 0 && live[i] && live[i].trim()) answers[i] = live[i].trim();
    if (i >= 0) live[i] = "";
    rec = null; recIdx = -1; recServer = false; paintKeep();
  }
  function endRec() {
    const r = rec; if (!r) return;
    if (recDet) { recDet.destroy(); recDet = null; }
    try { r.stop(); } catch {}
    // Thu trên server: đợi kết quả nhận dạng; Web Speech: tự dọn sau 1,5 giây nếu không có onend.
    if (!recServer) {
      clearTimeout(recEndTimer);
      recEndTimer = setTimeout(() => finishRec(r), 1500);
    }
  }
  const meter = (q, i) => {
    if (!answers[i] || graded) return "";
    const p = Math.round(simil(answers[i], q.say || q.q) * 100);
    return `<div class="lx-meter ${p >= 75 ? "ok" : "no"}"><span style="width:${p}%"></span><b>Giống câu mẫu ${p}%</b> ${p >= 75 ? "· tốt, có thể nộp" : "· thử đọc lại chậm và rõ hơn"}</div>`;
  };
  let graded = null;

  const qHtml = (q, i) => {
    const r = graded ? graded.results[i] : null;
    let body = "";
    if (q.type === "mcq") body = `<div class="lx-opts ${q.options.every((o) => String(o).length <= 16) ? "lx-opts-short" : ""}">${q.options.map((o, k) => `<button type="button" class="lx-vi lx-opt ${answers[i] === k ? "sel" : ""} ${r && o === r.correct ? "right" : ""} ${r && answers[i] === k && !r.ok ? "wrong" : ""}" data-q="${i}" data-k="${k}" ${graded ? "disabled" : ""}><span class="lx-opt-let" aria-hidden="true">${["A", "B", "C", "D", "E", "F"][k] || (k + 1)}</span><span class="lx-opt-txt">${esc(o)}</span></button>`).join("")}</div>`;
    else if (q.type === "text") body = `<input class="input lx-input" data-q="${i}" value="${esc(answers[i])}" placeholder="Nhập câu trả lời" autocomplete="off" autocapitalize="off" spellcheck="false" ${graded ? "disabled" : ""}>`;
    else if (q.type === "speak") {
      body = `<div class="lx-speak">
        <button type="button" class="btn ${recIdx === i ? "btn-danger" : "btn-primary"} lx-mic" data-mic="${i}" ${graded ? "disabled" : ""}>${recIdx === i ? li("stop", 16) + "Đang nghe… (Dừng)" : answers[i] ? li("mic", 16) + "Đọc lại" : li("mic", 16) + "Bấm và đọc to câu"}</button>
        ${recIdx === i ? `<span class="muted small lx-mic-hint">Tự ngắt khi dứt câu</span>` : ""}
        <input class="input lx-input lx-speak-in" data-q="${i}" value="${esc(answers[i])}" placeholder="Câu máy nghe được (có thể gõ nếu không có micro)" autocomplete="off" ${graded ? "disabled" : ""}>
        ${meter(q, i)}
      </div>`;
    }
    else {
      const used = answers[i];
      const left = q.tokens.map((t, k) => ({ t, k })).filter((x) => !used.includes(x.k));
      body = `<div class="lx-line" data-q="${i}">${used.length ? used.map((k, pos) => `<button type="button" class="lx-vi lx-tok" data-q="${i}" data-pos="${pos}" ${graded ? "disabled" : ""}>${esc(q.tokens[k])}</button>`).join("") : `<span class="muted small">Bấm các từ bên dưới theo đúng thứ tự</span>`}</div>
        <div class="lx-bank">${left.map((x) => `<button type="button" class="lx-vi lx-tok" data-q="${i}" data-k="${x.k}" ${graded ? "disabled" : ""}>${esc(x.t)}</button>`).join("")}</div>`;
    }
    const fb = r ? `<div class="lx-fb ${r.ok ? "ok" : "no"}">${r.ok ? "✓ Đúng" : `✗ Đáp án: <b class="lx-vi">${esc(r.correct)}</b>`} ${sayBtn(r.say, ex.speech)}${r.explain ? `<div class="small">${esc(r.explain)}</div>` : ""}${q.type === "speak" ? `<button type="button" class="lx-ask-ai" data-ai="${i}">${li("chat", 15)}AI nhận xét phát âm</button>` : r.ok ? "" : `<button type="button" class="lx-ask-ai" data-ai="${i}">${li("chat", 15)}Hỏi AI vì sao</button>`}</div>` : "";
    const qKicker = q.type === "mcq" ? tx("CHỌN ĐÁP ÁN ĐÚNG", "CHOOSE THE RIGHT ANSWER") : q.type === "order" ? tx("GHÉP CÂU ĐÚNG", "BUILD THE SENTENCE") : q.type === "speak" ? tx("LUYỆN PHÁT ÂM", "SPEAKING") : tx("ĐIỀN ĐÁP ÁN", "TYPE THE ANSWER");
    return `<div class="lx-q sheet ${r ? (r.ok ? "is-ok" : "is-no") : ""}" id="lxq${i}">
      <div class="lx-q-kicker">${qKicker} · ${tx("CÂU", "Q")} ${i + 1}</div>
      <div class="lx-q-head"><span class="lx-q-no">${i + 1}</span><div class="lx-q-text lx-vi">${q.listen ? `<button type="button" class="lx-listen" data-say="${esc(q.say)}" data-lang="${esc(ex.speech)}">${lineIcon("speaker", 17)}<span>Nghe</span></button> <span class="muted small">${esc(q.q)}</span>` : `<b>${esc(q.q)}</b> ${sayBtn(q.say, ex.speech)}${q.sub ? `<div class="muted small">${esc(q.sub)}</div>` : ""}`}</div></div>
      ${body}${fb}</div>`;
  };

  const paint = () => {
    const doneN = answers.filter((a) => Array.isArray(a) ? a.length : a !== null && a !== "").length;
    const exMascotState = graded
      ? (graded.passed ? "success" : "encouragement")
      : (ex.kind === "nghe" ? "listening" : ex.kind === "noi" ? "speaking" : "learning");
    const progPct = ex.questions.length ? Math.round((Math.max(1, doneN) / ex.questions.length) * 100) : 0;
    main.innerHTML = `
    <div class="lx-ex-page">
      <div class="lx-ex-top-meta">
        <div class="lx-ex-top-row">
          <span class="lx-ex-pill">${esc((ex.unitId ? `BÀI ${String(ex.unitId).padStart(2, "0")}` : ex.levelTitle).toUpperCase())}</span>
          <span class="lx-ex-cnt">${tx("Câu", "Question")} ${doneN || 1}/${ex.questions.length}</span>
        </div>
        <div class="lx-ex-prog"><i style="width:${progPct}%"></i></div>
      </div>
      <div class="page-head"><div><span class="edu-eyebrow">${ex.flag} ${esc(ex.langName)} · ${esc(ex.levelTitle)}${ex.unitTitle ? " · " + esc(ex.unitTitle) : ""}</span>
        <h1>${esc(ex.title)}</h1>
        <p>${ex.kind === "nghe" ? "Bấm nút Nghe (nghe lại bao nhiêu lần cũng được) rồi chọn từ bạn nghe thấy." : ex.kind === "noi" ? "Bấm loa để nghe mẫu, rồi bấm micro và đọc to. Máy so câu bạn nói với câu mẫu, giống từ 75% là đúng. Nên dùng Chrome hoặc Edge." : ex.kind === "doc" ? esc(ex.hint) : ex.kind === "doc-hieu" ? "Đọc đoạn văn (có thể bấm loa để nghe), rồi trả lời các câu hỏi." : ex.kind === "ghep-cau" ? "Ghép các từ thành câu đúng với nghĩa tiếng Việt." : "Chọn đáp án đúng cho mỗi câu."} ${isExam ? `Thời gian làm bài ${ex.timeMinutes} phút. ` : ""}Đạt từ ${ex.pass} điểm. Điểm cao nhất: <b>${data.best}</b>${data.attempts ? ` · đã nộp ${data.attempts} lần` : ""}.</p></div>${ChibiMascot({ state: exMascotState, size: 78 })}</div>
      <nav class="lx-roomnav" aria-label="Điều hướng bài">${data.prev ? `<a class="btn btn-sm" href="/app/ngoai-ngu/bai/${data.prev}">${icon("left")}Bài trước</a>` : `<span></span>`}<span class="lx-roomnav-mid">${ex.unitId ? `<a href="/app/ngoai-ngu/ly-thuyet/${ex.lang}/${ex.levelId}/${esc(ex.unitId)}">Lý thuyết</a>` : ""}<a href="/app/ngoai-ngu/${ex.lang}/${ex.levelId}">Danh sách bài</a><button type="button" class="btn btn-sm" id="lxAskTutor">💬 Hỏi gia sư AI</button></span>${data.next ? `<a class="btn btn-sm" href="/app/ngoai-ngu/bai/${data.next}">Bài sau${icon("right")}</a>` : `<span></span>`}</nav>
      ${asgId ? `<div class="pay-warn lx-asg">${li("pin", 16)} <b>Bài giao của lớp.</b> Kết quả lần nộp sẽ gửi cho giáo viên.${asgNote ? " " + esc(asgNote) : ""} <a href="/app/lop">Về lớp của tôi</a></div>` : ""}
      ${graded ? `<div class="lx-result ${graded.passed ? "ok" : "no"}"><div class="lx-score">${graded.score}<small>/100</small></div>
        <div><b>${graded.passed ? "Chúc mừng, bạn đã đạt bài này!" : "Chưa đạt, xem lại đáp án và làm lại nhé."}</b><span>${graded.right}/${graded.total} câu đúng · điểm cao nhất ${graded.best} · ${graded.starsEarned > 0 ? `+${String(graded.starsEarned).replace(".", ",")} ★` : graded.starsEarned < 0 ? `${String(graded.starsEarned).replace(".", ",")} ★` : "không đổi sao"} · năng lượng còn <b>${petState().energy}</b>/100</span></div>
        <div class="row">${graded.best < 100 ? `<button class="btn" id="lxRetry">${icon("reset")}Làm lại</button>` : ""}${data.next ? `<a class="btn btn-primary" href="/app/ngoai-ngu/bai/${data.next}">Bài tiếp theo →</a>` : `<a class="btn btn-primary" href="/app/ngoai-ngu/${ex.lang}/${ex.levelId}">Về cấp độ</a>`}</div></div>` : ""}
      ${ex.passage ? `<article class="sheet lx-passage"><div class="lx-passage-head"><b>${li("page", 16)} ${esc(ex.unitTitle || "")}</b> ${sayBtn(ex.passage, ex.speech)}</div><p class="lx-vi" lang="${esc(ex.speech)}">${esc(ex.passage)}</p></article>` : ""}
      <div class="lx-qs">${ex.questions.map(qHtml).join("")}</div>
      ${graded ? "" : (data.best >= 100 && !asgId) ? `<div class="pay-warn lx-locked">✅ Bài này đã đạt 100% nên không làm lại.</div>` : `<div class="lx-submit-bar">${ex.questions.some((q) => q.type === "text" || q.type === "speak") ? keyboardHtml(ex.lang) : ""}<span>${doneN}/${ex.questions.length} câu đã trả lời</span><span class="lx-energy" title="Mỗi lần nộp bài trừ 3 năng lượng. Năng lượng hồi 2 mỗi 30 phút, tối đa 100.">🍀 Năng lượng <b>${petState().energy}</b>/100 · nộp bài −3</span>${isExam ? `<b class="lx-timer" id="lxTimer">--:--</b>` : ""}<button class="btn btn-primary" id="lxSubmit">${icon("check")}${tx("Kiểm tra đáp án", "Check answers")}</button></div>`}
    </div>`;
    const sub = main.querySelector("#lxSubmit");
    if (sub) sub.addEventListener("click", () => submit(false));
    const re = main.querySelector("#lxRetry");
    if (re) re.addEventListener("click", () => { graded = null; answers.forEach((a, i) => { answers[i] = ex.questions[i].type === "order" ? [] : ex.questions[i].type === "mcq" ? null : ""; }); paint(); startExamClock(); window.scrollTo(0, 0); });
    main.querySelector("#lxAskTutor")?.addEventListener("click", () => {
      if (window.__plAiAsk) window.__plAiAsk(`Mình đang làm bài "${ex.title}" (${ex.langName} · ${ex.levelTitle}). Hãy tóm tắt kiến thức cần nhớ và mẹo làm dạng bài này.`);
    });
  };

  async function submit(auto = false) {
    if (graded) return;
    const empty = answers.filter((a) => Array.isArray(a) ? !a.length : a === null || a === "").length;
    if (!auto && empty && !(await confirmBox("Nộp bài?", `Còn ${empty} câu chưa trả lời. Câu bỏ trống sẽ tính là sai.`, "Vẫn nộp"))) return;
    const btn = main.querySelector("#lxSubmit");
    if (btn) { btn.disabled = true; btn.textContent = "Đang chấm…"; }
    try {
      const payload = answers.map((a, i) => ex.questions[i].type === "order" ? a.map((k) => ex.questions[i].tokens[k]) : a);
      graded = await api(`/api/lang/ex/${encodeURIComponent(ex.id)}/submit`, "POST", { answers: payload, asg: asgId || undefined });
      stopExamClock();
      if (graded.assignment) asgNote = graded.assignment.error ? graded.assignment.error : `Đã ghi lần nộp ${graded.assignment.attemptNo} cho giáo viên${graded.assignment.late ? " (nộp muộn)" : ""}.`;
      data.best = graded.best; data.attempts = graded.attempts;
      CACHE = null;
      await onExerciseSubmitted().catch(() => {});
      refreshLangSide().catch(() => {});
      try { setScores(S.scores || {}); } catch {}
      paint(); window.scrollTo(0, 0);
      if (graded.passed) triggerConfetti();
      const starBonus = Number(graded.starsEarned) > 0 ? ` (+${graded.starsEarned} ⭐)` : "";
      toast(graded.passed ? `Đạt ${graded.score} điểm${starBonus}!` : `${graded.score} điểm — chưa đạt${starBonus}`, graded.passed ? "ok" : "info");
      if (auto) toast("Hết giờ, bài đã được nộp tự động.", "info");
    } catch (e) {
      toast(e.message, "err");
      if (btn) { btn.disabled = false; btn.innerHTML = `${icon("check")}${tx("Kiểm tra đáp án", "Check answers")}`; }
    }
  }

  main.addEventListener("click", (e) => {
    const ai = e.target.closest("[data-ai]");
    if (ai && graded) {
      const i = +ai.dataset.ai, q = ex.questions[i], r = graded.results[i];
      const mine = q.type === "mcq" ? (q.options[answers[i]] ?? "(bỏ trống)") : q.type === "order" ? answers[i].map((k) => q.tokens[k]).join(" ") || "(bỏ trống)" : answers[i] || "(bỏ trống)";
      const msg = q.type === "speak"
        ? `Mình luyện nói câu mẫu "${q.q}" (${q.sub}). Máy nhận dạng giọng nói nghe được: "${answers[i] || "(không nghe được)"}". Hãy so sánh, chỉ ra từ/âm mình có thể đã phát âm sai, cách đặt lưỡi/khẩu hình hoặc thanh điệu/trọng âm đúng, và 1 mẹo luyện.`
        : `Câu ${i + 1}: "${q.listen ? "(câu nghe)" : q.q}". Mình trả lời "${mine}" nhưng đáp án là "${r.correct}". Giải thích giúp mình vì sao và cho thêm ví dụ tương tự.`;
      if (window.__plAiAsk) window.__plAiAsk(msg);
      else toast("Trợ lý AI tạm thời chưa sẵn sàng.", "info");
      return;
    }
    if (graded) return;
    const mic = e.target.closest("[data-mic]");
    if (mic) { if (recIdx === +mic.dataset.mic) endRec(); else listen(+mic.dataset.mic); return; }
    const o = e.target.closest(".lx-opt");
    if (o) { answers[+o.dataset.q] = +o.dataset.k; paintKeep(); return; }
    const t = e.target.closest(".lx-tok");
    if (t) {
      const i = +t.dataset.q;
      if (t.dataset.k !== undefined) answers[i].push(+t.dataset.k);
      else answers[i].splice(+t.dataset.pos, 1);
      paintKeep();
    }
  });
  main.addEventListener("input", (e) => {
    const inp = e.target.closest(".lx-input");
    if (inp) { answers[+inp.dataset.q] = inp.value; const s = main.querySelector(".lx-submit-bar span"); if (s) s.textContent = `${answers.filter((a) => Array.isArray(a) ? a.length : a !== null && a !== "").length}/${ex.questions.length} câu đã trả lời`; }
  });
  main.addEventListener("keydown", (e) => {
    const inp = e.target.closest(".lx-input");
    if (inp && e.key === "Enter") { e.preventDefault(); const all = [...main.querySelectorAll(".lx-input")]; const n = all[all.indexOf(inp) + 1]; if (n) n.focus(); else main.querySelector("#lxSubmit")?.focus(); }
  });
  bindSay(main, ctx);
  bindKeyboard(main);
  function paintKeep() { const y = window.scrollY; paint(); window.scrollTo(0, y); }
  paint();
  startExamClock();
}

/* ---------- Foreign language administration ---------- */
export async function pageLangAdmin(main, params, query, ctx) {
  // Render trong khung quan tri (adminShell) qua pageAdmin: pageAdmin da chan
  // quyen admin + dat crumbs + ve ax-head, nen khong lam lai o day.
  const d = await api("/api/admin/lang");
  if (!ctx.isCurrent()) return;
  const hidden = new Set(d.hidden);
  const EN = currentLang() === "en";
  const sample = EN
    ? JSON.stringify({ id: "5", title: "New lesson title", words: "word|reading|meaning\nword 2|reading|meaning\nword 3|reading|meaning\nword 4|reading|meaning", grammar: [["Question ___", ["A", "B", "C", "D"], 0, "Explanation"]], sentences: [["words separated by spaces", "Vietnamese meaning"]] }, null, 2)
    : JSON.stringify({ id: "5", title: "Tên bài mới", words: "từ|phiên âm|nghĩa\ntừ 2|phiên âm|nghĩa\ntừ 3|phiên âm|nghĩa\ntừ 4|phiên âm|nghĩa", grammar: [["Câu hỏi ___", ["A", "B", "C", "D"], 0, "Giải thích"]], sentences: [["các từ cách nhau dấu cách", "Nghĩa tiếng Việt"]] }, null, 2);
  const customRows = [];
  for (const [lang, lv] of Object.entries(d.extraUnits || {})) for (const [level, units] of Object.entries(lv)) for (const u of units) customRows.push({ lang, level, u });
  main.innerHTML = `
  <section class="lx-sec"><div class="sec-head"><div><h2>Khóa học và cấp độ</h2><p>Bỏ chọn để ẩn với học viên (quản trị viên vẫn thấy để xem trước).</p></div><button class="btn btn-primary" id="lxSaveHidden">Lưu hiển thị</button></div>
    <div class="lx-admin-grid">${d.courses.map((c) => `<div class="sheet lx-admin-card" style="--c:${esc(c.color)}">
      <label class="lx-admin-title"><input type="checkbox" data-h="${c.id}" ${hidden.has(c.id) ? "" : "checked"}> <b>${c.flag} ${esc(c.name)}</b> <span class="muted small">${esc(c.framework)}</span></label>
      <div class="lx-admin-stats"><span><b>${c.stats.learners}</b> học viên</span><span><b>${c.stats.attempts}</b> lượt nộp</span><span><b>${c.stats.passed}</b> bài đạt</span><span><b>${c.stats.avg}</b> điểm TB</span></div>
      <div class="lx-admin-levels">${c.levels.map((l) => `<label><input type="checkbox" data-h="${c.id}:${l.id}" ${hidden.has(c.id + ":" + l.id) ? "" : "checked"}> ${esc(l.title)} <span class="muted small">${l.units.length} bài · ${l.total} phần</span></label>`).join("")}</div>
    </div>`).join("")}</div>
  </section>
  <section class="lx-sec"><div class="sec-head"><div><h2>Câu học viên hay sai</h2><p>Câu có tỉ lệ sai cao (ít nhất 3 lượt trả lời). Xem lại đề, đáp án hoặc bổ sung lý thuyết cho bài đó.</p></div></div>
    <div class="sheet">${d.hard && d.hard.length ? `<div class="table-wrap"><table><thead><tr><th>Bài</th><th>Câu hỏi</th><th>Đáp án</th><th class="num">Lượt</th><th class="num">Sai</th></tr></thead><tbody>${d.hard.map((h) => `<tr><td class="small"><a href="/app/ngoai-ngu/bai/${esc(h.item)}">${esc(h.lang)} · ${esc(h.level)} · ${esc(h.title)}</a></td><td>${esc(h.q)}</td><td>${esc(h.answer)}</td><td class="num">${h.answered}</td><td class="num"><b class="${h.wrongPct >= 60 ? "err" : ""}">${h.wrongPct}%</b></td></tr>`).join("")}</tbody></table></div>` : `<p class="muted small" style="padding:14px">Chưa đủ dữ liệu. Thống kê xuất hiện khi mỗi câu có ít nhất 3 lượt trả lời.</p>`}</div>
  </section>
  <section class="lx-sec"><div class="sec-head"><div><h2>Nhắc học hằng ngày</h2><p>Mỗi ngày sau 19h (giờ Việt Nam), hệ thống tự gửi thông báo cho học viên đã học trong 14 ngày qua nhưng hôm nay chưa học. Nếu đã cấu hình NOTIFY_WEBHOOK_URL, lời nhắc được gửi tiếp sang Zalo/email. Đổi giờ bằng LANG_REMIND_HOUR, tắt bằng LANG_REMIND=0.</p></div><button class="btn" id="lxRemindNow">Gửi lời nhắc ngay</button></div></section>
  <section class="lx-sec"><div class="sec-head"><div><h2>Phân quyền Pro</h2><p>Chọn từ cấp nào trở lên chỉ dành cho thành viên Pro. Cấp thấp hơn miễn phí.</p></div><button class="btn btn-primary" id="lxSavePro">Lưu phân quyền</button></div>
    <div class="sheet sheet-pad lx-pro-grid">${d.courses.map((c) => `<label>${c.flag} <b>${esc(c.name)}</b><select class="select" data-pro="${c.id}"><option value="-1" ${d.proFrom[c.id] === -1 ? "selected" : ""}>Miễn phí toàn bộ</option>${c.levels.map((l, i) => `<option value="${i}" ${d.proFrom[c.id] === i ? "selected" : ""}>Pro từ ${esc(l.title)}</option>`).join("")}</select></label>`).join("")}</div>
  </section>
  <section class="lx-sec"><div class="sec-head"><div><h2>Nhập từ vựng hàng loạt (CSV)</h2><p>Mỗi dòng: <code>${EN ? "word,reading,meaning" : "từ,phiên âm,nghĩa"}</code> (Anh/Pháp: <code>${EN ? "word,meaning" : "từ,nghĩa"}</code>). Hệ thống tự chia mỗi 8 từ thành một bài học mới ở cuối cấp đã chọn.</p></div></div>
    <div class="sheet sheet-pad lx-admin-form">
      <div class="row"><select class="select" id="csvLang">${d.courses.map((c) => `<option value="${c.id}">${c.flag} ${esc(c.name)}</option>`).join("")}</select><select class="select" id="csvLevel"></select><input class="input" id="csvTitle" placeholder="Tên chủ đề (vd: Từ vựng HSK 1)" value="Từ vựng bổ sung"></div>
      <input type="file" id="csvFile" accept=".csv,.txt" class="input">
      <textarea class="input lx-json" id="csvText" rows="8" placeholder="你好,nǐ hǎo,${EN ? "hello" : "xin chào"}&#10;谢谢,xièxie,${EN ? "thank you" : "cảm ơn"}"></textarea>
      <button class="btn btn-primary" id="csvGo">Nhập và tạo bài học</button><div class="small muted" id="csvMsg"></div>
    </div>
  </section>
  <section class="lx-sec"><div class="sec-head"><div><h2>Bổ sung bài học</h2><p>Bài mới được thêm vào cuối cấp độ, tự sinh 4 dạng bài tập và chấm tự động. Dùng lại mã bài để sửa bài đã bổ sung.</p></div></div>
    <div class="sheet sheet-pad lx-admin-form">
      <div class="row"><select class="select" id="lxLang">${d.courses.map((c) => `<option value="${c.id}">${c.flag} ${esc(c.name)}</option>`).join("")}</select>
      <select class="select" id="lxLevel"></select></div>
      <textarea class="input lx-json" id="lxJson" rows="14" spellcheck="false">${esc(sample)}</textarea>
      <p class="small muted">${EN ? 'words: one per line "word|reading|meaning" (English/French: "word|meaning"), at least 4 words · grammar: [question, [4 options], answer index from 0, explanation] · sentences: [sentence with words separated by spaces, meaning].' : 'words: mỗi dòng "từ|phiên âm|nghĩa" (Anh/Pháp: "từ|nghĩa"), ít nhất 4 từ · grammar: [câu, [4 lựa chọn], vị trí đáp án tính từ 0, giải thích] · sentences: [câu có các từ cách nhau bằng dấu cách, nghĩa].'}</p>
      <button class="btn btn-primary" id="lxAddUnit">Lưu bài học</button>
    </div>
    ${customRows.length ? `<div class="sheet lx-custom-list">${customRows.map((r) => `<div class="lx-custom-row"><span><b>${esc(r.lang)} · ${esc(r.level)} · Bài ${esc(r.u.id)}</b> ${esc(r.u.title)}</span><span class="row"><button class="btn btn-sm" data-edit="${esc(r.lang)}|${esc(r.level)}|${esc(r.u.id)}">Sửa</button><button class="btn btn-sm" data-del="${esc(r.lang)}/${esc(r.level)}/${esc(r.u.id)}">Xóa</button></span></div>`).join("")}</div>` : ""}
  </section>`;
  main.querySelector("#lxRemindNow").addEventListener("click", async () => {
    try { const r = await api("/api/admin/lang/remind-now", "POST", {}); toast(`Đã gửi ${r.sent || 0} lời nhắc (kiểm tra ${r.checked || 0} học viên).`, "ok"); } catch (e) { toast(e.message, "err"); }
  });
  main.querySelector("#lxSavePro").addEventListener("click", async () => {
    const proFrom = Object.fromEntries([...main.querySelectorAll("[data-pro]")].map((x) => [x.dataset.pro, Number(x.value)]));
    try { await api("/api/admin/lang/pro", "PUT", { proFrom }); CACHE = null; toast("Đã lưu phân quyền Pro.", "ok"); } catch (e) { toast(e.message, "err"); }
  });
  const csvLang = main.querySelector("#csvLang"), csvLevel = main.querySelector("#csvLevel");
  const fillCsvLv = () => { const c = d.courses.find((x) => x.id === csvLang.value); csvLevel.innerHTML = c.levels.map((l) => `<option value="${l.id}">${esc(l.title)}</option>`).join(""); };
  csvLang.addEventListener("change", fillCsvLv); fillCsvLv();
  main.querySelector("#csvFile").addEventListener("change", async (e) => { const f = e.target.files[0]; if (f) main.querySelector("#csvText").value = await f.text(); });
  main.querySelector("#csvGo").addEventListener("click", async () => {
    const rows = main.querySelector("#csvText").value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => l.split(/[,\t;|]/).map((x) => x.trim().replace(/^"|"$/g, ""))).filter((r) => r.length >= 2 && r[0]);
    const c = d.courses.find((x) => x.id === csvLang.value), lv = c.levels.find((l) => l.id === csvLevel.value);
    const used = new Set(lv.units.map((u) => String(u.id)));
    const chunks = []; for (let i = 0; i < rows.length; i += 8) chunks.push(rows.slice(i, i + 8));
    if (!chunks.length) return toast("Chưa có dòng hợp lệ.", "err");
    if (chunks[chunks.length - 1].length < 4 && chunks.length > 1) { const last = chunks.pop(); chunks[chunks.length - 1].push(...last); }
    if (chunks[0].length < 4) return toast("Cần ít nhất 4 từ.", "err");
    let next = 1, made = 0; const msg = main.querySelector("#csvMsg");
    for (const [k, ch] of chunks.entries()) {
      while (used.has(String(next))) next++;
      used.add(String(next));
      const words = ch.map((r) => r.length >= 3 ? `${r[0]}|${r[1]}|${r[2]}` : `${r[0]}|${r[1]}`).join("\n");
      try { await api("/api/admin/lang/units", "POST", { lang: c.id, level: lv.id, unit: { id: String(next), title: `${main.querySelector("#csvTitle").value || "Từ vựng"} ${chunks.length > 1 ? k + 1 : ""}`.trim(), words, grammar: [], sentences: [] } }); made++; msg.textContent = `Đã tạo ${made}/${chunks.length} bài…`; }
      catch (e) { msg.textContent = `Lỗi ở bài ${k + 1}: ${e.message}`; return; }
    }
    CACHE = null; toast(`Đã tạo ${made} bài học từ ${rows.length} từ.`, "ok"); pageLangAdmin(main, params, query, ctx);
  });
  const lvSel = main.querySelector("#lxLevel"), langSel = main.querySelector("#lxLang");
  const fillLv = () => { const c = d.courses.find((x) => x.id === langSel.value); lvSel.innerHTML = c.levels.map((l) => `<option value="${l.id}">${esc(l.title)}</option>`).join(""); };
  langSel.addEventListener("change", fillLv); fillLv();
  main.querySelector("#lxSaveHidden").addEventListener("click", async () => {
    const h = [...main.querySelectorAll("[data-h]")].filter((x) => !x.checked).map((x) => x.dataset.h);
    try { await api("/api/admin/lang/hidden", "PUT", { hidden: h }); CACHE = null; toast("Đã lưu hiển thị.", "ok"); } catch (e) { toast(e.message, "err"); }
  });
  main.querySelector("#lxAddUnit").addEventListener("click", async () => {
    let unit;
    try { unit = JSON.parse(main.querySelector("#lxJson").value); } catch { return toast("JSON chưa đúng cú pháp.", "err"); }
    try { await api("/api/admin/lang/units", "POST", { lang: langSel.value, level: lvSel.value, unit }); CACHE = null; toast("Đã lưu bài học.", "ok"); pageLangAdmin(main, params, query, ctx); } catch (e) { toast(e.message, "err"); }
  });
  main.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", async () => {
    if (!(await confirmBox("Xóa bài bổ sung?", "Điểm học viên đã làm bài này vẫn được giữ trong cơ sở dữ liệu.", "Xóa", true))) return;
    try { await api("/api/admin/lang/units/" + b.dataset.del, "DELETE"); CACHE = null; toast("Đã xóa.", "ok"); pageLangAdmin(main, params, query, ctx); } catch (e) { toast(e.message, "err"); }
  }));
  main.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => {
    const [lang, level, id] = b.dataset.edit.split("|");
    const u = d.extraUnits[lang][level].find((x) => x.id === id);
    langSel.value = lang; fillLv(); lvSel.value = level;
    main.querySelector("#lxJson").value = JSON.stringify(u, null, 2);
    main.querySelector("#lxJson").scrollIntoView({ behavior: "smooth", block: "center" });
  }));
}

/* ---------- Class foreign language report (tab in teacher page) ---------- */
export async function langClassReport(host, classId) {
  host.innerHTML = `<div class="sheet"><p class="muted">Đang tải…</p></div>`;
  let j;
  try { j = await api(`/api/lang/class/${classId}/report`); } catch (e) { host.innerHTML = `<div class="sheet"><p>${esc(e.message)}</p></div>`; return; }
  if (!j.students.length) { host.innerHTML = `<div class="sheet lx-report"><p class="muted">Lớp chưa có học viên.</p></div>`; return; }
  if (!j.langs.length) { host.innerHTML = `<div class="sheet lx-report"><p class="muted">Học viên trong lớp chưa làm bài ngoại ngữ nào.</p></div>`; return; }
  let cur = j.langs[0].id;
  const KN = ["nghia", "doc", "ngu-phap", "ghep-cau", "nghe", "noi", "doc-hieu"];
  const cls = (v) => v == null ? "" : v >= 80 ? "ok" : v >= 50 ? "mid" : "low";
  const paint = () => {
    const list = j.students.map((s) => ({ s, L: s.langs[cur] })).sort((a, b) => (b.L ? b.L.passed : -1) - (a.L ? a.L.passed : -1));
    const active = list.filter((x) => x.L);
    const avg = active.length ? Math.round(active.reduce((t, x) => t + x.L.avg, 0) / active.length) : 0;
    const kindAvg = (k) => { const v = active.map((x) => x.L.kinds[k]).filter((v) => v != null); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null; };
    host.innerHTML = `<div class="lx-report">
      <div class="lx-rep-tabs">${j.langs.map((l) => `<button type="button" class="chip ${l.id === cur ? "on" : ""}" data-l="${l.id}">${l.flag} ${esc(l.name)}</button>`).join("")}</div>
      <div class="lx-rep-cards">
        <div class="sheet"><b>${active.length}/${j.students.length}</b><span>học viên đã học</span></div>
        <div class="sheet"><b>${avg}</b><span>điểm trung bình</span></div>
        ${KN.map((k) => { const v = kindAvg(k); return v == null ? "" : `<div class="sheet lx-k-${cls(v)}"><b>${v}</b><span>${esc((j.kinds[k] || {}).title || k)}</span></div>`; }).join("")}
      </div>
      <div class="sheet"><h3>Tiến độ từng học viên</h3><div class="table-wrap"><table class="table lx-rep-table">
        <thead><tr><th>Học viên</th><th>Cấp đã đạt</th><th>Bài đạt</th><th>Điểm TB</th>${KN.map((k) => `<th>${esc((j.kinds[k] || {}).icon || "")} ${esc((j.kinds[k] || {}).title || k)}</th>`).join("")}<th>Hoạt động gần nhất</th></tr></thead>
        <tbody>${list.map(({ s, L }) => `<tr><td><b>${esc(s.name)}</b></td>${L ? `<td>${esc(L.level || "—")}</td><td>${L.passed}/${L.total}<div class="lx-bar"><span style="width:${Math.round(L.passed / Math.max(1, L.total) * 100)}%"></span></div></td><td class="lx-c-${cls(L.avg)}">${L.avg}</td>${KN.map((k) => `<td class="lx-c-${cls(L.kinds[k])}">${L.kinds[k] ?? "—"}</td>`).join("")}<td class="small muted">${s.last ? esc(new Date(s.last).toLocaleString("vi-VN")) : "—"}</td>` : `<td colspan="${4 + KN.length}" class="muted small">Chưa làm bài nào</td>`}</tr>`).join("")}</tbody></table></div></div>
      <div class="sheet"><h3>Bài cả lớp hay sai</h3>${j.weak.filter((w) => w.id.startsWith(cur + "-")).length ? `<ul class="lx-weak">${j.weak.filter((w) => w.id.startsWith(cur + "-")).map((w) => `<li><a href="/app/ngoai-ngu/bai/${esc(w.id)}">${esc(w.title)}</a><span class="small muted">${w.fail}/${w.tried} chưa đạt · TB ${w.avg}</span></li>`).join("")}</ul>` : `<p class="muted small">Chưa có bài nào nhiều học viên chưa đạt.</p>`}</div>
      <p class="small muted">Điểm là điểm cao nhất mỗi bài; đạt từ ${j.pass} điểm. Xanh ≥ 80, vàng 50–79, đỏ &lt; 50.</p>
    </div>`;
    host.querySelectorAll("[data-l]").forEach((b) => b.addEventListener("click", () => { cur = b.dataset.l; paint(); }));
  };
  paint();
}

/* ---------- Hanzi / Kana / Hangul handwriting practice (4.9.14) ----------
   Students trace over a faint guide character on the canvas; the grader compares ink strokes against the glyph (coverage + accuracy).
   Stroke order is not graded (requires separate stroke data); this is free practice and does not count toward course scores. */
export async function pageLangWrite(page, [langId, levelId], query, ctx) {
  page.innerHTML = "";
  const main = document.createElement("div");
  page.appendChild(main);
  main.innerHTML = `<div class="skel" style="height:300px"></div>`;
  let d;
  try { d = await api(`/api/lang/write/${langId}/${levelId}`); } catch (e) { if (ctx.isCurrent()) main.innerHTML = `<div class="sheet empty"><b>Không mở được trang này</b><p>${esc(e.message)}</p><a class="btn" href="/app/ngoai-ngu/${esc(langId)}">Về khóa học</a></div>`; return; }
  if (!ctx.isCurrent()) return;
  bindSay(main, ctx);
  if (getSubject() !== d.lang) setSubject(d.lang);
  window.__plAiCtx = { langItem: `${d.lang}-${d.level.id}`, langName: d.name, page: `${d.name} · Luyện viết ${d.level.title}` };
  withAi(ctx);
  ctx.setCrumbs([[d.name, `/app/ngoai-ngu/${d.lang}/${d.level.id}`], [tx("Luyện viết chữ", "Handwriting Practice")]]);
  const KEY = `pl-write-${d.lang}-${d.level.id}`;
  let best = {}; try { best = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch {}
  let idx = Math.max(0, d.chars.findIndex((c) => !(best[c.ch] >= 70)));
  const FONT = d.lang === "ko" ? `"Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif` : d.lang === "ja" ? `"Noto Sans JP","Yu Gothic","Hiragino Sans","Noto Sans CJK JP",sans-serif` : `"Noto Sans SC","Microsoft YaHei","PingFang SC","Noto Sans CJK SC",sans-serif`;
  const SIZE = 300, INK = 14;
  let strokes = [], cur = null, showGuide = true, result = null;
  const paint = () => {
    const c = d.chars[idx];
    const done = d.chars.filter((x) => best[x.ch] >= 70).length;
    main.innerHTML = `<div class="lx-write">
      <div class="lx-th-hero">
        <span class="lx-th-kicker">${esc(d.name.toUpperCase())} · ${esc(d.level.title.toUpperCase())}</span>
        <h1>${tx("Luyện viết", "Practice writing")} ${esc(c.ch)}</h1>
        <p class="lx-th-sub">${tx("Quan sát chữ mẫu, sau đó luyện viết theo mẫu.", "Observe the model character, then trace and write in the practice box.")}</p>
      </div>
      <div class="page-head"><div><span class="edu-eyebrow">${d.flag} ${esc(d.name)} · ${esc(d.level.title)}</span><h1>Luyện viết</h1>
        <p>Tô theo chữ mờ trong khung, rồi bấm <b>Chấm</b>. Máy so nét bạn viết với hình chữ (không chấm thứ tự nét). Đạt từ 70 điểm. Đã đạt ${done}/${d.chars.length} chữ.</p></div></div>
      <div class="lx-write-grid">
        <div class="sheet lx-write-pad">
          <div class="lx-write-info"><span class="lx-write-ch lx-vi" lang="${esc(d.speech)}">${esc(c.ch)}</span><div><b class="lx-vi">${esc(c.word)}</b>${c.reading ? ` <span class="muted lx-vi">${esc(c.reading)}</span>` : ""} ${sayBtn(c.word, d.speech)}<div class="small muted lx-vi">${esc(c.meaning)}</div></div></div>
          <h3 class="lx-write-sec-h">${tx("Khu vực luyện viết", "Writing area")}</h3>
          <div class="lx-canvas-wrap"><canvas id="lxCv" width="${SIZE}" height="${SIZE}" aria-label="Khung luyện viết"></canvas></div>
          ${result ? `<div class="lx-meter ${result.score >= 70 ? "ok" : "no"}"><span style="width:${result.score}%"></span><b>${result.score} điểm</b> · phủ chữ ${result.cov}% · nét đúng chỗ ${result.prec}%</div>` : ""}
          <div class="row lx-write-btns">
            <button class="btn" id="lxPrev" ${idx ? "" : "disabled"}>← Chữ trước</button>
            <button class="btn" id="lxClear">↺ Xóa nét</button>
            <button class="btn" id="lxUndo">Hoàn tác nét</button>
            <label class="small"><input type="checkbox" id="lxGuide" ${showGuide ? "checked" : ""}> Hiện chữ mờ</label>
            <button class="btn" type="button" id="lxAskChar">▶ Hướng dẫn AI</button>
            <button class="btn" id="lxNext" ${idx < d.chars.length - 1 ? "" : "disabled"}>Chữ sau →</button>
            <button class="btn btn-primary btn-block" id="lxCheck">${tx("Kiểm tra chữ viết", "Check handwriting")}</button>
          </div>
        </div>
        <div class="sheet lx-write-list">${d.chars.map((x, i) => `<button type="button" class="lx-wc lx-vi ${i === idx ? "on" : ""} ${best[x.ch] >= 70 ? "ok" : best[x.ch] ? "try" : ""}" data-i="${i}" title="${esc(x.meaning)}">${esc(x.ch)}</button>`).join("")}</div>
      </div></div>`;
    const cv = main.querySelector("#lxCv"), g = cv.getContext("2d");
    const draw = () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      g.clearRect(0, 0, SIZE, SIZE);
      g.strokeStyle = isDark ? "#334155" : "#d9dde5"; g.lineWidth = 1; g.setLineDash([6, 6]);
      g.beginPath(); g.moveTo(SIZE / 2, 0); g.lineTo(SIZE / 2, SIZE); g.moveTo(0, SIZE / 2); g.lineTo(SIZE, SIZE / 2); g.moveTo(0, 0); g.lineTo(SIZE, SIZE); g.moveTo(SIZE, 0); g.lineTo(0, SIZE); g.stroke(); g.setLineDash([]);
      if (showGuide) glyph(g, c.ch, isDark ? "rgba(125,211,252,.22)" : "rgba(91,63,214,.16)");
      g.strokeStyle = isDark ? "#F1F5F9" : "#1f2937"; g.lineWidth = INK; g.lineCap = "round"; g.lineJoin = "round";
      for (const s of strokes.concat(cur ? [cur] : [])) path(g, s);
    };
    draw();
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * SIZE / r.width, (e.clientY - r.top) * SIZE / r.height]; };
    cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); cur = [pos(e)]; result = null; draw(); });
    cv.addEventListener("pointermove", (e) => { if (!cur) return; cur.push(pos(e)); draw(); });
    const end = () => { if (cur && cur.length) strokes.push(cur.length > 1 ? cur : [cur[0], [cur[0][0] + 0.5, cur[0][1]]]); cur = null; draw(); };
    cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
    const go = (i) => { idx = i; strokes = []; result = null; paint(); };
    main.querySelector("#lxPrev").onclick = () => go(idx - 1);
    main.querySelector("#lxNext").onclick = () => go(idx + 1);
    main.querySelector("#lxClear").onclick = () => { strokes = []; result = null; paint(); };
    main.querySelector("#lxUndo").onclick = () => { strokes.pop(); result = null; paint(); };
    main.querySelector("#lxGuide").onchange = (e) => { showGuide = e.target.checked; draw(); };
    main.querySelector("#lxAskChar")?.addEventListener("click", () => {
      if (window.__plAiAsk) window.__plAiAsk(`Mình đang luyện viết chữ "${c.ch}" (trong từ "${c.word}"${c.reading ? ` - ${c.reading}` : ""}, nghĩa: "${c.meaning}"). Hãy giải thích cấu tạo bộ thủ/nét viết, thứ tự viết chuẩn và mẹo nhớ nhanh chữ này.`);
    });
    main.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => go(+b.dataset.i)));
    main.querySelector("#lxCheck").onclick = () => {
      if (!strokes.length) { toast("Hãy viết chữ vào khung trước.", "info"); return; }
      result = score(c.ch);
      if (!best[c.ch] || result.score > best[c.ch]) { best[c.ch] = result.score; try { localStorage.setItem(KEY, JSON.stringify(best)); } catch {} }
      toast(result.score >= 70 ? `Đạt ${result.score} điểm!` : `${result.score} điểm — viết lại cho đầy nét hơn nhé`, result.score >= 70 ? "ok" : "info");
      paint();
    };
  };
  function glyph(g, ch, color, outline = 0) {
    g.save(); g.fillStyle = color; g.strokeStyle = color; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `500 ${Math.round(SIZE * 0.8)}px ${FONT}`;
    g.fillText(ch, SIZE / 2, SIZE / 2 + SIZE * 0.03);
    if (outline) { g.lineWidth = outline; g.lineJoin = "round"; g.strokeText(ch, SIZE / 2, SIZE / 2 + SIZE * 0.03); }
    g.restore();
  }
  function path(g, s) { g.beginPath(); g.moveTo(s[0][0], s[0][1]); for (const p of s.slice(1)) g.lineTo(p[0], p[1]); g.stroke(); }
  function layer(fn) { const cv = document.createElement("canvas"); cv.width = cv.height = SIZE; const g = cv.getContext("2d"); fn(g); return g.getImageData(0, 0, SIZE, SIZE).data; }
  function score(ch) {
    const G = layer((g) => glyph(g, ch, "#000"));
    const GD = layer((g) => glyph(g, ch, "#000", 22));
    const ink = (w) => layer((g) => { g.strokeStyle = "#000"; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; strokes.forEach((s) => path(g, s)); });
    const I = ink(INK), ID = ink(34);
    let gN = 0, gHit = 0, iN = 0, iHit = 0;
    for (let k = 3; k < G.length; k += 4) {
      if (G[k] > 100) { gN++; if (ID[k] > 100) gHit++; }
      if (I[k] > 100) { iN++; if (GD[k] > 100) iHit++; }
    }
    const cov = gN ? gHit / gN : 0, prec = iN ? iHit / iN : 0;
    return { cov: Math.round(cov * 100), prec: Math.round(prec * 100), score: Math.round(100 * Math.min(1, 0.6 * cov + 0.4 * prec) * (prec < 0.5 ? prec / 0.5 : 1)) };
  }
  paint();
}
