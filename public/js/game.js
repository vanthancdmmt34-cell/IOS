/* LifeRivo 2.1 - levels, badges, daily goals, personal settings, celebrations */
import { S, api, esc, icon, openModal, toast, findEx, chapterStats, debounce, fmtN } from "./core.js";

/* ---------- Mascot ---------- */
export function mascot(mood = "happy", size = 96) {
  const eyes = mood === "think"
    ? `<circle cx="47" cy="40" r="4.2" fill="#1A2035"/><circle cx="67" cy="40" r="4.2" fill="#1A2035"/><path d="M40 31l12 3M74 31l-12 3" stroke="#1A2035" stroke-width="3" stroke-linecap="round"/>`
    : mood === "sleep"
      ? `<path d="M42 41q5 4 10 0M62 41q5 4 10 0" stroke="#1A2035" stroke-width="3" fill="none" stroke-linecap="round"/>`
      : `<circle cx="47" cy="40" r="6" fill="#fff"/><circle cx="67" cy="40" r="6" fill="#fff"/><circle cx="48.5" cy="41" r="3.4" fill="#1A2035"/><circle cx="68.5" cy="41" r="3.4" fill="#1A2035"/><circle cx="49.6" cy="39.6" r="1.1" fill="#fff"/><circle cx="69.6" cy="39.6" r="1.1" fill="#fff"/>`;
  const mouth = mood === "cheer" ? `<path d="M50 52q7 9 14 0z" fill="#B4232F"/>` : mood === "think" ? `<path d="M52 54h10" stroke="#1A2035" stroke-width="3" stroke-linecap="round"/>` : `<path d="M50 52q7 6 14 0" stroke="#1A2035" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const arms = mood === "cheer" ? `<path d="M20 50q-8-14 2-22M94 50q8-14-2-22" stroke="#5B3FD6" stroke-width="7" fill="none" stroke-linecap="round"/>` : "";
  return `<svg class="mascot ${mood}" width="${size}" height="${size}" viewBox="0 0 114 114" aria-hidden="true">
    <ellipse cx="57" cy="106" rx="34" ry="5" fill="rgba(26,32,53,.10)"/>
    <path d="M24 92c0-14 14-18 33-18s33 4 33 18c0 9-15 12-33 12s-33-3-33-12z" fill="#5B3FD6"/>
    <path d="M36 92c0-7 9-9 21-9s21 2 21 9-9 7-21 7-21 0-21-7z" fill="#FFD84D"/>
    <path d="M36 80c0-30 4-58 21-58s21 28 21 58" fill="#6B4FE6"/>
    ${arms}
    <ellipse cx="57" cy="44" rx="27" ry="24" fill="#6B4FE6"/>
    <ellipse cx="57" cy="56" rx="15" ry="8" fill="#FFD84D"/>
    <circle cx="38" cy="52" r="4" fill="#FF8FA3" opacity=".7"/><circle cx="76" cy="52" r="4" fill="#FF8FA3" opacity=".7"/>
    ${eyes}${mouth}
    <path d="M57 20c-3-7 2-12 8-11" stroke="#138A5A" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="68" cy="10" rx="6" ry="3.5" fill="#2DBE7E" transform="rotate(-25 68 10)"/>
  </svg>`;
}

/* ---------- Levels ---------- */
export const LEVELS = [
  [0, "Hạt giống"], [40, "Mầm xanh"], [100, "Lá non"], [200, "Tập sự"], [350, "Học trò"], [550, "Chăm chỉ"], [800, "Thành thạo"],
  [1100, "Vững vàng"], [1500, "Giỏi giang"], [2000, "Xuất sắc"], [2700, "Chuyên gia"], [3600, "Bậc thầy"], [4800, "Huyền thoại"],
];
export function levelOf(xp) {
  let i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
  const cur = LEVELS[i][0], nxt = LEVELS[i + 1] ? LEVELS[i + 1][0] : null;
  return { n: i + 1, name: LEVELS[i][1], cur, next: nxt, pct: nxt ? Math.round(((xp - cur) / (nxt - cur)) * 100) : 100, toNext: nxt ? nxt - xp : 0 };
}

/* ---------- Activity ---------- */
export const G = { events: [], loadedAt: 0 };
export function dayKey(d) { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; }
export async function loadActivity(force = false) {
  if (!force && G.loadedAt && Date.now() - G.loadedAt < 15000) return G.events;
  G.events = []; G.loadedAt = Date.now(); // lịch sử hoạt động theo bài đã gỡ khỏi hệ thống
  return G.events;
}
export function activityStats(events = G.events) {
  const all = {}, ok = {};
  let night = 0, early = 0;
  for (const [t, f] of events) {
    const k = dayKey(t); all[k] = (all[k] || 0) + 1; if (f) ok[k] = (ok[k] || 0) + 1;
    const h = new Date(t).getHours(); if (h >= 22 || h < 4) night++; if (h >= 4 && h < 7) early++;
  }
  // current streak
  let streak = 0; const d = new Date();
  if (!all[dayKey(d)]) d.setDate(d.getDate() - 1);
  while (all[dayKey(d)]) { streak++; d.setDate(d.getDate() - 1); }
  // longest streak
  const keys = Object.keys(all).sort(); let best = 0, run = 0, prev = null;
  for (const k of keys) { const t = new Date(k + "T00:00:00"); run = prev && (t - prev) === 86400000 ? run + 1 : 1; best = Math.max(best, run); prev = t; }
  const today = ok[dayKey(new Date())] || 0;
  const maxDay = Math.max(0, ...Object.values(all));
  return { all, ok, streak, bestStreak: best, today, night, early, maxDay, days: keys.length };
}

/* ---------- Personal settings (synced with server) ---------- */
export async function loadPrefs() {
  if (S.prefs) return S.prefs;
  try { S.prefs = (await api("/api/prefs")).prefs || {}; } catch (e) { S.prefs = {}; }
  S.prefs.dailyGoal = S.prefs.dailyGoal || (S.cfg && S.cfg.defaultDailyGoal) || 3; S.prefs.bookmarks = S.prefs.bookmarks || []; S.prefs.notes = S.prefs.notes || {}; S.prefs.seenBadges = S.prefs.seenBadges || []; S.prefs.goal = S.prefs.goal || ""; S.prefs.goalPath = S.prefs.goalPath || "";
  return S.prefs;
}
const pushPrefs = debounce(async () => { try { await api("/api/prefs", "PUT", { prefs: S.prefs }); } catch (e) { toast("Chưa lưu được cài đặt: " + e.message, "err"); } }, 700);
export function savePrefs(patch) { Object.assign(S.prefs, patch); pushPrefs(); }
export function isBookmarked(id) { return (S.prefs && S.prefs.bookmarks || []).includes(id); }
export function toggleBookmark(id) {
  const b = new Set(S.prefs.bookmarks || []);
  if (b.has(id)) b.delete(id); else b.add(id);
  savePrefs({ bookmarks: [...b] });
  return b.has(id);
}

/* ---------- Badges ---------- */
const examsOk = () => Object.values(S.scores.examBest || {}).filter((v) => v > 0).length;

export const BADGES = [
  { id: "exam1", ic: "📝", c: "#5B3FD6", t: "Vượt cửa thi", d: "Đạt một bài kiểm tra chương", p: () => [examsOk(), 1] },
  { id: "exam20", ic: "🏅", c: "#B86E00", t: "Điểm tuyệt đối", d: "Đạt 20/20 một bài kiểm tra", p: () => [Object.values(S.scores.examBest || {}).filter((v) => v >= 20).length, 1] },
  { id: "exam10", ic: "🎖️", c: "#1D6FD1", t: "Mười bài thi", d: "Đạt 10 bài kiểm tra chương", p: () => [examsOk(), 10] },
  { id: "streak3", ic: "🔥", c: "#E8590C", t: "Ba ngày liền", d: "Học 3 ngày liên tiếp", p: (a) => [a.bestStreak, 3] },
  { id: "streak7", ic: "⚡", c: "#E8590C", t: "Một tuần bền bỉ", d: "Học 7 ngày liên tiếp", p: (a) => [a.bestStreak, 7] },
  { id: "streak30", ic: "🌋", c: "#B4232F", t: "Một tháng không nghỉ", d: "Học 30 ngày liên tiếp", p: (a) => [a.bestStreak, 30] },
  { id: "busy", ic: "🚀", c: "#0E7C86", t: "Ngày năng suất", d: "Nộp 10 lần trong một ngày", p: (a) => [a.maxDay, 10] },
  { id: "owl", ic: "🦉", c: "#3F3D8F", t: "Cú đêm", d: "Nộp bài sau 22 giờ", p: (a) => [a.night, 1] },
  { id: "bird", ic: "🐦", c: "#2DBE7E", t: "Chim sớm", d: "Nộp bài trước 7 giờ sáng", p: (a) => [a.early, 1] },
];
export function badgeState(acts = activityStats()) {
  return BADGES.map((b) => { const [cur, goal] = b.p(acts); return { ...b, cur: Math.min(cur, goal), goal, ok: cur >= goal }; });
}
export function badgeHtml(b, size = "") {
  return `<div class="badge ${b.ok ? "ok" : ""} ${size}" style="--bc:${b.c}" title="${esc(b.d)}">
    <span class="medal" aria-hidden="true">${b.ic}</span><b>${esc(b.t)}</b><span>${b.ok ? esc(b.d) : `${b.cur}/${b.goal} · ${esc(b.d)}`}</span>
    ${b.ok ? "" : `<i class="bprog"><i style="width:${Math.round(b.cur / b.goal * 100)}%"></i></i>`}
  </div>`;
}
/* Newly earned badges not yet seen by the user */
export function newBadges(acts) {
  const seen = new Set(S.prefs.seenBadges || []);
  return badgeState(acts).filter((b) => b.ok && !seen.has(b.id));
}
export function markBadgesSeen(list) {
  if (!list.length) return;
  savePrefs({ seenBadges: [...new Set([...(S.prefs.seenBadges || []), ...list.map((b) => b.id)])] });
}

/* ---------- Celebrations ---------- */
export function confetti(host) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = document.createElement("canvas");
  cv.className = "confetti";
  host.appendChild(cv);
  const r = host.getBoundingClientRect();
  const W = cv.width = r.width * devicePixelRatio, H = cv.height = r.height * devicePixelRatio;
  const ctx = cv.getContext("2d");
  const colors = ["#5B3FD6", "#FFD84D", "#2DBE7E", "#FF6B7A", "#1D6FD1", "#E8590C"];
  const ps = Array.from({ length: 110 }, () => ({ x: W / 2 + (Math.random() - .5) * W * .3, y: H * .35, vx: (Math.random() - .5) * 18 * devicePixelRatio, vy: (-Math.random() * 16 - 6) * devicePixelRatio, s: (4 + Math.random() * 6) * devicePixelRatio, c: colors[(Math.random() * colors.length) | 0], a: Math.random() * 6, va: (Math.random() - .5) * .4 }));
  let frame = 0;
  const step = () => {
    ctx.clearRect(0, 0, W, H);
    for (const p of ps) { p.vy += .55 * devicePixelRatio; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); }
    if (++frame < 150) requestAnimationFrame(step); else cv.remove();
  };
  requestAnimationFrame(step);
}

export function celebrate({ title, sub, xpBefore, xpAfter, badges = [], actions = "" }) {
  const lb = levelOf(xpBefore), la = levelOf(xpAfter);
  const up = la.n > lb.n;
  const m = openModal(`
    <div class="celebrate">
      <div class="cel-mascot">${mascot("cheer", 120)}</div>
      <h2>${esc(up ? `Lên cấp ${la.n}: ${la.name}!` : title)}</h2>
      <p class="lead">${esc(up ? title + ". " + (sub || "") : sub || "")}</p>
      ${xpAfter > xpBefore ? `<div class="cel-xp"><span class="xp-pill">+${fmtN(xpAfter - xpBefore)} XP</span><span class="muted small">Tổng ${fmtN(xpAfter)} XP</span></div>` : ""}
      <div class="lvl-bar" style="margin-top:12px"><div class="lvl-meta"><b>Cấp ${la.n} · ${esc(la.name)}</b><span>${la.next ? `còn ${fmtN(la.toNext)} XP lên cấp ${la.n + 1}` : "Cấp cao nhất"}</span></div><div class="bar"><i style="width:${la.pct}%"></i></div></div>
      ${badges.length ? `<div class="cel-badges"><p class="small muted">Huy hiệu mới</p><div class="badges">${badges.map((b) => badgeHtml({ ...b, ok: true }, "sm")).join("")}</div></div>` : ""}
      <div class="modal-actions" style="justify-content:center">${actions || `<button class="btn btn-primary" data-close>Tiếp tục</button>`}</div>
    </div>`, { cls: "cel-modal", label: "Chúc mừng" });
  confetti(m.el.querySelector(".modal"));
  markBadgesSeen(badges);
  return m;
}

/* ---------- Daily goal ring ---------- */
export function goalRing(done, goal, size = 92) {
  const pct = Math.min(1, done / Math.max(1, goal));
  const r = size / 2 - 7, c = 2 * Math.PI * r;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="goal-ring" aria-label="Mục tiêu hôm nay ${done}/${goal}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--paper-3)" stroke-width="9"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${pct >= 1 ? "var(--la)" : "var(--cam)"}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" transform="rotate(-90 ${size / 2} ${size / 2})" style="transition:stroke-dashoffset .8s"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-weight="800" font-size="${size * .24}" fill="var(--ink)">${Math.min(done, 99)}/${goal}</text>
  </svg>`;
}
export { icon };
