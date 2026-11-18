/* LifeRivo Premium Component Design System (7-State Unified Mascot + Reusable Chibi Mascots + 17 UI Components)
   Uses official LifeRivo Mobile Chibi Kit (/img/kit/chibi-*.webp) and Clean White / Sky-Blue EdTech tokens */
import { esc, lineIcon } from "./core.js";

const TONE_MAP = {
  lavender: "#F3EFFF",
  pink: "#FFEBF2",
  mint: "#E6FAF1",
  sky: "#EAF4FB",
  cream: "#FFF9F0",
};

export const KIT_MASCOTS = {
  bunny: "/img/kit/chibi-bunny.webp",
  fox: "/img/kit/chibi-fox.webp",
  cat: "/img/kit/chibi-cat.webp",
  owl: "/img/kit/chibi-owl.webp",
  frog: "/img/kit/chibi-frog.webp",
  dragon: "/img/kit/chibi-dragon.webp",
};

const STATE_TO_KIT = {
  welcome: "bunny",
  learning: "fox",
  listening: "owl",
  speaking: "dragon",
  success: "cat",
  encouragement: "frog",
  encourage: "frog",
  achievement: "dragon",
  thinking: "owl",
  reminder: "bunny",
  tutor: "owl",
};

/* ---------- 1. Unified 7-State Rivo Mascot & Chibi Kit Components ---------- */
const MASCOT_STATES = {
  welcome: {
    bg: "#FFF4D6",
    kit: "bunny",
    mouth: `<path d="M40 50q4 4.2 8 0" stroke="#303047" stroke-width="2.3" stroke-linecap="round"/>`,
    eyes: "happy",
    extra: `<path d="M18 62c-5-8-1-16 5-13l5 10" fill="#FFD9C8" stroke="#303047" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M72 26c2.5-3 6 0 4 4-2 3-4 4-4 4s-2-1-4-4c-2-4 1.5-7 4-4z" fill="#FFB9D0" stroke="#303047" stroke-width="1.8"/>`,
  },
  learning: {
    bg: "#FFF0E5",
    kit: "fox",
    mouth: `<path d="M41 50q3 2.8 6 0" stroke="#303047" stroke-width="2.2" stroke-linecap="round"/>`,
    eyes: "happy",
    extra: `<rect x="27" y="65" width="34" height="17" rx="4" fill="#FFF9F0" stroke="#303047" stroke-width="2.2"/><path d="M44 66v15M32 71h8M48 71h8" stroke="#9B8AFB" stroke-width="2" stroke-linecap="round"/>`,
  },
  listening: {
    bg: "#F3EFFF",
    kit: "owl",
    mouth: `<circle cx="44" cy="50.5" r="2.2" fill="#FFB9D0" stroke="#303047" stroke-width="1.6"/>`,
    eyes: "happy",
    extra: `<path d="M19 44a25 25 0 0 1 50 0" stroke="#6D5CE8" stroke-width="4" stroke-linecap="round"/><rect x="13" y="37" width="8" height="15" rx="4" fill="#A8D8FF" stroke="#303047" stroke-width="2"/><rect x="67" y="37" width="8" height="15" rx="4" fill="#A8D8FF" stroke="#303047" stroke-width="2"/><path d="M72 22v9M72 22l6-2v8" stroke="#9B8AFB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="70" cy="31" r="2.4" fill="#9B8AFB"/><circle cx="76" cy="29" r="2.4" fill="#9B8AFB"/>`,
  },
  speaking: {
    talk: true,
    bg: "#EAF4FB",
    kit: "dragon",
    mouth: `<ellipse cx="44" cy="50.5" rx="3.4" ry="2.6" fill="#FF85A9" stroke="#303047" stroke-width="1.8"/>`,
    eyes: "sparkle",
    extra: `<rect x="63" y="48" width="9" height="15" rx="4.5" fill="#A8E6CF" stroke="#303047" stroke-width="2"/><path d="M67.5 63v10M63 73h9" stroke="#303047" stroke-width="2" stroke-linecap="round"/><path d="M76 48c2 2 2 7 0 9M80 45c3.5 4 3.5 11 0 15" stroke="#9B8AFB" stroke-width="2" stroke-linecap="round"/>`,
  },
  success: {
    bg: "#FFEBF2",
    kit: "cat",
    mouth: `<path d="M39 49.5c1.5 4.8 8.5 4.8 10 0z" fill="#FF85A9" stroke="#303047" stroke-width="1.8" stroke-linejoin="round"/>`,
    eyes: "joy",
    extra: `<path d="m17 24 2.2 4.5 5 .7-3.6 3.5.8 5-4.4-2.3-4.4 2.3.8-5-3.6-3.5 5-.7z" fill="#FDE047" stroke="#303047" stroke-width="1.7" stroke-linejoin="round"/><path d="m71 22 1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="#A8E6CF" stroke="#303047" stroke-width="1.7" stroke-linejoin="round"/>`,
  },
  encouragement: {
    bg: "#E9F8E5",
    kit: "frog",
    mouth: `<path d="M40 50.5q4 2.5 8 0" stroke="#303047" stroke-width="2.2" stroke-linecap="round"/>`,
    eyes: "happy",
    extra: `<path d="M71 34c-3.5-3.5-8 1-4.5 5.5l4.5 4.5 4.5-4.5c3.5-4.5-1-9-4.5-5.5z" fill="#FFB9D0" stroke="#303047" stroke-width="1.8" stroke-linejoin="round"/>`,
  },
  achievement: {
    bg: "#EAF4FB",
    kit: "dragon",
    mouth: `<path d="M39 49.5c1.5 4.5 8.5 4.5 10 0z" fill="#FF85A9" stroke="#303047" stroke-width="1.8" stroke-linejoin="round"/>`,
    eyes: "sparkle",
    extra: `<path d="m32 18 3.5-8 8.5 5 8.5-5 3.5 8z" fill="#FDE047" stroke="#303047" stroke-width="2" stroke-linejoin="round"/><path d="M62 56h12v7a6 6 0 0 1-12 0z" fill="#FDE047" stroke="#303047" stroke-width="2"/><path d="M68 69v6M64 75h8" stroke="#303047" stroke-width="2" stroke-linecap="round"/>`,
  },
  thinking: {
    bg: "#F3EFFF",
    kit: "owl",
    mouth: `<path d="M41 50q3 2 6 0" stroke="#303047" stroke-width="2.2" stroke-linecap="round"/>`,
    eyes: "happy",
    extra: "",
  },
  reminder: {
    bg: "#FFF4D6",
    kit: "bunny",
    mouth: `<path d="M40 50q4 4 8 0" stroke="#303047" stroke-width="2.2" stroke-linecap="round"/>`,
    eyes: "happy",
    extra: "",
  },
  tutor: {
    bg: "#F3EFFF",
    kit: "owl",
    mouth: `<path d="M40 50q4 3.5 8 0" stroke="#303047" stroke-width="2.2" stroke-linecap="round"/>`,
    eyes: "sparkle",
    extra: "",
  },
};

function chibiEyesSvg(kind) {
  if (kind === "joy") {
    return `<path d="M29 42q4-4.5 8 0M51 42q4-4.5 8 0" stroke="#303047" stroke-width="2.6" stroke-linecap="round"/>`;
  }
  if (kind === "sparkle") {
    return `<ellipse cx="33" cy="41.5" rx="4.2" ry="4.8" fill="#303047"/><ellipse cx="55" cy="41.5" rx="4.2" ry="4.8" fill="#303047"/><path d="m32 39.5 1 2 2 .8-2 .8-1 2-1-2-2-.8 2-.8z" fill="#FFFFFF"/><path d="m54 39.5 1 2 2 .8-2 .8-1 2-1-2-2-.8 2-.8z" fill="#FFFFFF"/>`;
  }
  return `<ellipse cx="33" cy="41.5" rx="4.1" ry="4.7" fill="#303047"/><ellipse cx="55" cy="41.5" rx="4.1" ry="4.7" fill="#303047"/><circle cx="31.5" cy="39.8" r="1.6" fill="#FFFFFF"/><circle cx="53.5" cy="39.8" r="1.6" fill="#FFFFFF"/><circle cx="34.4" cy="43.3" r=".8" fill="#FFFFFF"/><circle cx="56.4" cy="43.3" r=".8" fill="#FFFFFF"/>`;
}

export function ChibiMascot({ state = "welcome", kit = "", size = 88, caption = "", tone = "", circle = true, cls = "", svg = false } = {}) {
  const st = MASCOT_STATES[state] || MASCOT_STATES.welcome;
  const bg = tone ? (TONE_MAP[tone] || st.bg) : st.bg;
  const kitKey = kit && KIT_MASCOTS[kit] ? kit : (STATE_TO_KIT[state] || st.kit || "bunny");
  const src = KIT_MASCOTS[kitKey] || KIT_MASCOTS.bunny;

  if (svg) {
    const svgHtml = `<svg class="cm-svg chibi-ic cp-svg${st.talk ? " is-talking" : ""}" viewBox="0 0 88 88" width="${size}" height="${size}" fill="none" aria-hidden="true">
      <circle cx="44" cy="44" r="41" fill="${bg}"/>
      <g class="cp-body">
        <path d="M27 78c1-12 7-18 17-18s16 6 17 18z" fill="#FFB9D0" stroke="#303047" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M38 60v6l6 4 6-4v-6" fill="#FFF9F0" stroke="#303047" stroke-width="2" stroke-linejoin="round"/>
      </g>
      <g class="cp-head">
        <path d="M21 38c0-15 10-24 23-24s23 9 23 24c0 6-2 11-5 14H26c-3-3-5-8-5-14z" fill="#6E529C" stroke="#303047" stroke-width="2.2"/>
        <ellipse cx="44" cy="40" rx="20.5" ry="18.5" fill="#FFE8DB" stroke="#303047" stroke-width="2.2"/>
        <path d="M24 35c5-11 35-11 40 0-6-4-13-1-20-6-7 5-14 2-20 6z" fill="#7D5FB2" stroke="#303047" stroke-width="2" stroke-linejoin="round"/>
        <g class="cp-eyes">${chibiEyesSvg(st.eyes)}</g>
        <ellipse cx="26.5" cy="46.5" rx="3.4" ry="1.8" fill="#FFB9D0"/><ellipse cx="61.5" cy="46.5" rx="3.4" ry="1.8" fill="#FFB9D0"/>
        <g class="cp-mouth-smile">${st.mouth}</g>
        <ellipse class="cp-mouth-open" cx="44" cy="51" rx="3.4" ry="2.8" fill="#FF85A9" stroke="#303047" stroke-width="1.6"/>
      </g>
      ${st.extra}
    </svg>`;
    if (!caption) return `<span class="cm-wrap cm-${esc(state)}${cls ? " " + esc(cls) : ""}">${svgHtml}</span>`;
    return `<div class="cm-wrap cm-card cm-${esc(state)}${cls ? " " + esc(cls) : ""}">${svgHtml}<div class="cm-caption">${esc(caption)}</div></div>`;
  }

  const imgHtml = `<img class="cm-img cm-kit-${esc(kitKey)}${circle ? " is-circle" : ""}" src="${esc(src)}" width="${size}" height="${size}" style="--cm-size:${size}px;--cm-bg:${esc(bg)}" alt="" loading="lazy" decoding="async" aria-hidden="true">`;
  if (!caption) return `<span class="cm-wrap cm-${esc(state)} cm-kit${cls ? " " + esc(cls) : ""}" style="--cm-size:${size}px;--cm-bg:${esc(bg)}">${imgHtml}</span>`;
  return `<div class="cm-wrap cm-card cm-${esc(state)} cm-kit${cls ? " " + esc(cls) : ""}" style="--cm-size:${size}px;--cm-bg:${esc(bg)}">${imgHtml}<div class="cm-caption">${esc(caption)}</div></div>`;
}

/* Reusable Semantic Chibi Mascot Components (Part 6 Spec) */
export const MascotWelcome = (opts = {}) => ChibiMascot({ state: "welcome", kit: "bunny", size: 64, ...opts });
export const MascotLearning = (opts = {}) => ChibiMascot({ state: "learning", kit: "fox", size: 64, ...opts });
export const MascotSuccess = (opts = {}) => ChibiMascot({ state: "success", kit: "cat", size: 64, ...opts });
export const MascotThinking = (opts = {}) => ChibiMascot({ state: "thinking", kit: "owl", size: 64, ...opts });
export const MascotEncourage = (opts = {}) => ChibiMascot({ state: "encouragement", kit: "frog", size: 64, ...opts });
export const MascotReminder = (opts = {}) => ChibiMascot({ state: "reminder", kit: "bunny", size: 64, ...opts });
export const MascotTutor = (opts = {}) => ChibiMascot({ state: "tutor", kit: "owl", size: 64, ...opts });

/* Reusable Sky-Blue Hero Banner with Chibi Mascot (matches 08, 09, 12, 20, 30, 51) */
export const HeroBanner = ({ badge = "", title = "", subtitle = "", kit = "owl", size = 96, ctaHtml = "", cls = "" } = {}) => {
  const src = KIT_MASCOTS[kit] || KIT_MASCOTS.owl;
  return `<section class="lr-hero-banner${cls ? " " + esc(cls) : ""}">
    ${badge ? `<div class="lr-hero-pill"><span>${esc(badge)}</span></div>` : ""}
    <div class="lr-hero-body">
      <div class="lr-hero-copy">
        <h2>${esc(title)}</h2>
        ${subtitle ? `<p>${esc(subtitle)}</p>` : ""}
        ${ctaHtml ? `<div class="lr-hero-cta">${ctaHtml}</div>` : ""}
      </div>
      <div class="lr-hero-art">
        <img src="${esc(src)}" width="${size}" height="${size}" alt="" loading="lazy" decoding="async" aria-hidden="true">
      </div>
    </div>
  </section>`;
};

/* ---------- 2. Core UI Building Blocks (17 Design System Components) ---------- */
export const ProgressBar = ({ value = 0, color = "#9B8AFB", label = "" } = {}) => {
  const pct = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  return `<div class="cds-prog">${label ? `<div class="cds-prog-top"><span>${esc(label)}</span><b>${pct}%</b></div>` : ""}<div class="cds-prog-track"><i style="width:${pct}%;background:${esc(color)}"></i></div></div>`;
};

export const XPBadge = ({ xp = 0, label = "XP" } = {}) =>
  `<span class="cds-pill cds-xp">✨ <b>${Number(xp || 0).toLocaleString("vi-VN")}</b> <small>${esc(label)}</small></span>`;

export const StreakCounter = ({ days = 0, activeToday = false } = {}) =>
  `<span class="cds-pill cds-streak ${activeToday ? "on" : ""}">🔥 <b>${Number(days || 0)}</b> <small>ngày</small></span>`;

export const LevelBadge = ({ level = 1, title = "" } = {}) =>
  `<span class="cds-pill cds-level">⭐ LVL <b>${Number(level || 1)}</b>${title ? ` · <small>${esc(title)}</small>` : ""}</span>`;

export const LearningCard = ({ title = "", subtitle = "", badge = "", body = "", footer = "", tone = "lavender", cls = "" } = {}) =>
  `<section class="cds-card cds-tone-${esc(tone)} ${esc(cls)}">
    ${(title || badge) ? `<header class="cds-card-head"><div>${badge ? `<span class="cds-kicker">${esc(badge)}</span>` : ""}<h3>${esc(title)}</h3>${subtitle ? `<p>${esc(subtitle)}</p>` : ""}</div></header>` : ""}
    <div class="cds-card-body">${body}</div>
    ${footer ? `<footer class="cds-card-foot">${footer}</footer>` : ""}
  </section>`;

export const CourseCard = ({ href = "#", title = "", desc = "", flag = "", level = "", pct = 0, mascot = "", cta = "Học ngay" } = {}) =>
  `<a class="cds-course-card" href="${esc(href)}">
    <div class="cds-course-top"><span>${flag} ${esc(level)}</span>${mascot}</div>
    <b>${esc(title)}</b><p>${esc(desc)}</p>
    ${ProgressBar({ value: pct })}
    <span class="cds-cta-mini">${esc(cta)} →</span>
  </a>`;

export const LessonCard = ({ href = "#", title = "", meta = "", badge = "", done = false } = {}) =>
  `<a class="cds-lesson-card ${done ? "done" : ""}" href="${esc(href)}">
    <span class="cds-lesson-dot">${done ? "✓" : "•"}</span>
    <div class="cds-lesson-copy"><b>${esc(title)}</b>${meta ? `<small>${esc(meta)}</small>` : ""}</div>
    ${badge ? `<span class="cds-kicker">${esc(badge)}</span>` : ""}
  </a>`;

export const AchievementCard = ({ icon = "🏅", title = "", desc = "", value = 0, need = 1, color = "#9B8AFB", idx = 0 } = {}) => {
  const ok = value >= need;
  const pct = need ? Math.round(Math.min(1, value / need) * 100) : 100;
  return `<div class="cds-ach cds-ach-t${idx % 4} ${ok ? "ok" : ""}">
    <div class="cds-ach-ico">${icon}</div>
    <b>${esc(title)}</b><span>${esc(desc)}</span>
    <em class="cds-ach-done ${ok ? "is-ok" : "is-lock"}">${ok ? "Đã mở khóa" : "Chưa mở khóa"}</em>
    ${ok ? "" : ProgressBar({ value: pct, color })}
  </div>`;
};

// reward: nhãn thưởng chỉ hiện khi có giá trị thật; không truyền thì không hiện nhãn
export const DailyMission = ({ title = "", current = 0, target = 1, reward = "", href = "" } = {}) => {
  const done = current >= target;
  const inner = `<div class="cds-mission ${done ? "done" : ""}">
    <span class="cds-mission-ic">${done ? "✅" : "🎯"}</span>
    <div class="cds-mission-copy"><b>${esc(title)}</b><small>${Math.min(current, target)}/${target}</small></div>
    ${reward ? `<span class="cds-pill cds-xp">${esc(reward)}</span>` : ""}
  </div>`;
  return href ? `<a class="cds-mission-link" href="${esc(href)}">${inner}</a>` : inner;
};

export const GameCard = ({ id = "", title = "", desc = "", icon = "🎮", tag = "", best = 0, tint = "#F3EFFF" } = {}) =>
  `<button type="button" class="cds-game-card" data-game="${esc(id)}" style="--tint:${esc(tint)}">
    <div class="cds-game-top"><span class="cds-game-ico">${icon}</span><span class="cds-kicker">${esc(tag)}</span></div>
    <b>${esc(title)}</b><p>${esc(desc)}</p>
    <div class="cds-game-foot"><span>${best ? `Kỷ lục: ${best} điểm` : "Chưa chơi"}</span><em>Chơi ngay →</em></div>
  </button>`;

export const VocabularyFlashcard = ({ word = "", reading = "", meaning = "", example = "", flipped = false, fav = false } = {}) =>
  `<div class="cds-flashcard ${flipped ? "flip" : ""}">
    <div class="cds-flash-head"><span>${fav ? "⭐ Yêu thích" : "Từ vựng"}</span></div>
    <b class="cds-flash-word">${esc(word)}</b>
    ${reading ? `<div class="cds-flash-ipa">${esc(reading)}</div>` : ""}
    ${flipped ? `<div class="cds-flash-meaning">${esc(meaning)}</div>${example ? `<p class="cds-flash-ex">${esc(example)}</p>` : ""}` : `<small>Chạm thẻ để xem nghĩa & ví dụ</small>`}
  </div>`;

export const AudioPlayer = ({ text = "", lang = "en-US", label = "Nghe phát âm mẫu" } = {}) =>
  `<button type="button" class="btn btn-sm cds-audio-btn" data-say="${esc(text)}" data-lang="${esc(lang)}">${lineIcon("speaker", 16)}<span>${esc(label)}</span></button>`;

export const QuizOption = ({ text = "", attrs = "", cls = "", disabled = false } = {}) =>
  `<button type="button" class="cds-quiz-opt ${esc(cls)}" ${attrs} ${disabled ? "disabled" : ""}>${esc(text)}</button>`;

export const EmptyState = ({ title = "", message = "", ctaHref = "", ctaLabel = "" } = {}) =>
  `<div class="cds-empty">${ChibiMascot({ state: "encouragement", size: 78 })}<b>${esc(title)}</b><p>${esc(message)}</p>${ctaHref ? `<a class="btn btn-primary btn-sm" href="${esc(ctaHref)}">${esc(ctaLabel)}</a>` : ""}</div>`;

export const LoadingState = ({ label = "Đang tải…" } = {}) =>
  `<div class="cds-loading"><span class="spin"></span><span>${esc(label)}</span></div>`;

export function triggerConfetti() {
  if (typeof window === "undefined" || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
  const host = document.createElement("div");
  host.className = "cds-confetti";
  const colors = ["#9B8AFB", "#FFB9D0", "#A8E6CF", "#A8D8FF", "#FDE047"];
  host.innerHTML = Array.from({ length: 22 }, (_, i) => {
    const left = Math.round((i / 22) * 100) + ((i * 7) % 6);
    const delay = ((i % 5) * 60);
    return `<i style="left:${left}%;background:${colors[i % colors.length]};animation-delay:${delay}ms"></i>`;
  }).join("");
  document.body.appendChild(host);
  setTimeout(() => host.remove(), 1700);
}

export function SuccessModal({ title = "Xuất sắc!", body = "", xp = 0, ctaLabel = "Tiếp tục" } = {}) {
  triggerConfetti();
  const wrap = document.createElement("div");
  wrap.className = "cds-modal-wrap";
  wrap.innerHTML = `<div class="cds-modal" role="dialog" aria-modal="true">
    ${ChibiMascot({ state: "success", size: 96 })}
    <h3>${esc(title)}</h3>
    ${xp ? XPBadge({ xp, label: "XP nhận được" }) : ""}
    ${body ? `<p>${esc(body)}</p>` : ""}
    <button type="button" class="btn btn-primary" data-close-cds>${esc(ctaLabel)}</button>
  </div>`;
  wrap.addEventListener("click", (e) => {
    if (e.target === wrap || e.target.closest("[data-close-cds]")) wrap.remove();
  });
  document.body.appendChild(wrap);
}
