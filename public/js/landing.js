/* LifeRivo - Landing Page & Client Hydration */
import { appHash, setAppHash } from "./core.js";
import { S, api, esc, icon, lineIcon, fmtN, openModal, animateCount, smoothScrollTo, store, cfg, siteName, brandHtml, themeBtnHtml } from "./core.js";
import { langSwitchHtml, bindLangSwitch, currentLang, syncLangSwitchUI, t } from "./i18n.js";

// ── Funnel tracking ─────────────────────────────────────────────────────────
const _funnelSessionId = (() => {
  const KEY = "lr-funnel-sid";
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch { return Math.random().toString(36).slice(2); }
})();

export function trackFunnel(event) {
  try {
    if (event === "register_click" && window.__plGA) window.__plGA("click_dang_ky");
    const referrer = (document.referrer || "").slice(0, 200);
    fetch("/api/funnel/event", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event, sessionId: _funnelSessionId, referrer }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* ignore */ }
}

// ── Official Social Channels (Strictly study@liferivo.com, Facebook, Threads) ─
const SOCIAL_CHANNELS = [
  {
    key: "facebookUrl", label: "Facebook", detail: "Theo dõi tin tức và hoạt động mới", className: "facebook",
    mark: `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="currentColor"/><path fill="#fff" d="M18.1 26V17.4h2.9l.45-3.35H18.1v-2.14c0-.97.27-1.63 1.67-1.63h1.79V7.29c-.31-.04-1.37-.13-2.61-.13-2.59 0-4.36 1.58-4.36 4.48v2.41h-2.93v3.35h2.93V26z"/></svg>`,
  },
  {
    key: "threadsUrl", label: "Threads", detail: "Cập nhật nhanh và trao đổi cùng cộng đồng", className: "threads",
    mark: `<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M22.8 13.3c-.8-4.3-3.4-6.5-7.2-6.5-5.1 0-8.1 3.5-8.1 9.2 0 6 3.3 9.5 8.5 9.5 4.5 0 7.4-2.5 7.4-6.3 0-3.4-2.3-5.5-5.9-5.5-2.5 0-4.2 1.2-4.2 3.1 0 1.6 1.1 2.7 2.8 2.7 2.1 0 3.6-1.7 3.6-4.4 0-2.4-1.1-4.2-3.1-5.2"/><path d="M17 15.1c3.1.1 5.6 1.2 7.5 3.1"/></svg>`,
  },
];

function safeSocialUrl(key) {
  const raw = String(cfg(key, "") || "").trim();
  if (!raw) return "";
  try {
    const u = new URL(raw);
    const hosts = {
      facebookUrl: ["facebook.com", "fb.com", "fb.me"],
      threadsUrl: ["threads.com", "threads.net"],
    }[key] || [];
    const host = u.hostname.toLowerCase();
    if (u.protocol !== "https:" || u.username || u.password || !hosts.some((d) => host === d || host.endsWith(`.${d}`))) return "";
    return u.href;
  } catch { return ""; }
}

function socialContactHtml() {
  const cards = SOCIAL_CHANNELS.map((c) => {
    const href = safeSocialUrl(c.key);
    const content = `<span class="lp-social-mark ${c.className}">${c.mark}</span><span class="lp-social-copy"><b>${c.label}</b><small>${c.detail}</small></span><span class="lp-social-arrow" aria-hidden="true">↗</span>`;
    return href
      ? `<a class="lp-social-card" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="Mở ${c.label} ở tab mới">${content}</a>`
      : "";
  }).join("");
  const configured = SOCIAL_CHANNELS.some((c) => !!safeSocialUrl(c.key));
  if (!configured) return "";
  return `<section class="lp-sec lp-contact" id="lien-he" aria-labelledby="lpContactTitle">
    <div class="lp-wrap">
      <div class="lp-sec-head"><h2 id="lpContactTitle">Kết nối với ${esc(siteName())}</h2><p>Theo dõi các kênh chính thức để cập nhật bài học, tính năng mới và nhận hỗ trợ.</p></div>
      <div class="lp-social-grid">${cards}</div>
    </div>
  </section>`;
}

// ── Section 1: Hero Rotator Configuration & Logic ─────────────────────────────
export const HERO_ROTATOR_SUBJECTS = [
  "tiếng Nhật",
  "tiếng Anh",
  "tiếng Trung",
  "tiếng Hàn",
  "tiếng Pháp",
  "tiếng Tây Ban Nha"
];
export const HERO_ROTATOR_INTERVAL_MS = 2800; // Exact 2.8s requirement

let heroRotTimer = null;
let heroSubjectIdx = 0;

// Đổi chữ trong tiêu đề: cuộn dọc mượt — chữ mới trượt lên từ dưới vào CÙNG LÚC
// chữ cũ trượt lên ra ngoài (cả hai 0.45s, easing mềm), nên ô chữ không bao giờ trống.
let rotSwapTimer = null;
function swapRotatorWord(host, word) {
  if (rotSwapTimer) { clearTimeout(rotSwapTimer); rotSwapTimer = null; }
  // Dọn chữ cũ đang mờ dở từ lần đổi trước (tránh đọng nhiều chữ).
  host.querySelectorAll(".rotator-word.out, .aw-rot-w.out").forEach((w) => w.remove());
  const current = host.querySelector(".rotator-word, .aw-rot-w");
  const span = document.createElement("span");
  span.className = "rotator-word aw-rot-w in";
  span.textContent = word;
  host.appendChild(span);
  const w = Math.ceil(span.getBoundingClientRect().width || span.offsetWidth) + 2;
  if (w > 2) host.style.width = w + "px";
  if (current) {
    current.classList.remove("in");
    current.classList.add("out");
    // Gỡ chữ cũ sau khi trượt hết ra ngoài (0.45s); chữ mới đã trượt vào sẵn nên không có khoảng trống.
    rotSwapTimer = setTimeout(() => { rotSwapTimer = null; current.remove(); }, 450);
  }
}
// Quay lại tab: chỉ giữ một chữ, không còn chữ đang trượt dở
function cleanRotator(host) {
  const words = [...host.querySelectorAll(".rotator-word, .aw-rot-w")];
  const keep = words.filter((w) => !w.classList.contains("out")).pop() || words.pop();
  words.forEach((w) => { if (w !== keep) w.remove(); });
  if (keep) {
    keep.classList.remove("out", "in");
    const w = Math.ceil(keep.getBoundingClientRect().width || keep.offsetWidth) + 2;
    if (w > 2) host.style.width = w + "px";
  }
}
let rotVisBound = false;

const reduceMotion = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Initializes the Section 1 Hero word rotator cycling every 2.8s across 6 subjects.
 * @param {HTMLElement|Document} root
 */
// Map slug trang khóa học -> tên môn hiển thị trong tiêu đề hero.
const COURSE_SUBJECT_BY_SLUG = {
  ja: "tiếng Nhật", "tieng-nhat": "tiếng Nhật",
  en: "tiếng Anh", "tieng-anh": "tiếng Anh",
  zh: "tiếng Trung", "tieng-trung": "tiếng Trung",
  ko: "tiếng Hàn", "tieng-han": "tiếng Hàn",
  fr: "tiếng Pháp", "tieng-phap": "tiếng Pháp",
  es: "tiếng Tây Ban Nha", "tieng-tay-ban-nha": "tiếng Tây Ban Nha",
};
function courseSubjectFromPath() {
  try {
    const m = (typeof location !== "undefined" ? location.pathname : "").match(/\/khoa-hoc\/([^/?#]+)/);
    if (!m) return null;
    return COURSE_SUBJECT_BY_SLUG[decodeURIComponent(m[1]).toLowerCase()] || null;
  } catch { return null; }
}

// SVG cờ quốc gia sắc nét trên mọi hệ điều hành (Windows không render emoji cờ).
const LANG_FLAG_SVG = {
  en: `<svg class="lang-flag-svg" viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#012169"/><path d="M0 0L24 16M24 0L0 16" stroke="#fff" stroke-width="3"/><path d="M0 0L24 16M24 0L0 16" stroke="#C8102E" stroke-width="1.4"/><path d="M12 0V16M0 8H24" stroke="#fff" stroke-width="5"/><path d="M12 0V16M0 8H24" stroke="#C8102E" stroke-width="3"/></svg>`,
  zh: `<svg class="lang-flag-svg" viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#DE2910"/><polygon points="5,2.3 5.8,4.7 8.3,4.7 6.3,6.1 7.1,8.5 5,7 2.9,8.5 3.7,6.1 1.7,4.7 4.2,4.7" fill="#FFDE00"/><circle cx="9.8" cy="2.5" r=".7" fill="#FFDE00"/><circle cx="11.2" cy="4.4" r=".7" fill="#FFDE00"/><circle cx="11.2" cy="6.8" r=".7" fill="#FFDE00"/><circle cx="9.8" cy="8.6" r=".7" fill="#FFDE00"/></svg>`,
  ja: `<svg class="lang-flag-svg" viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#fff"/><circle cx="12" cy="8" r="4.6" fill="#BC002D"/></svg>`,
  ko: `<svg class="lang-flag-svg" viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="16" fill="#fff"/><g transform="translate(12 8)"><path d="M-4,0 A4,4 0 0,1 4,0 A2,2 0 0,1 0,0 A2,2 0 0,0 -4,0 Z" fill="#CD2E3A"/><path d="M-4,0 A4,4 0 0,0 4,0 A2,2 0 0,0 0,0 A2,2 0 0,1 -4,0 Z" fill="#0047A0"/></g><path d="M4.2 3.2l2-1.8M5 4l2-1.8M5.8 4.8l2-1.8M17.8 12.8l2-1.8M17 12l2-1.8M16.2 11.2l2-1.8" stroke="#1D1C27" stroke-width="1" stroke-linecap="round"/></svg>`,
  fr: `<svg class="lang-flag-svg" viewBox="0 0 24 16" aria-hidden="true"><rect width="8" height="16" x="0" fill="#0055A4"/><rect width="8" height="16" x="8" fill="#fff"/><rect width="8" height="16" x="16" fill="#EF4135"/></svg>`,
  es: `<svg class="lang-flag-svg" viewBox="0 0 24 16" aria-hidden="true"><rect width="24" height="4" y="0" fill="#AA151B"/><rect width="24" height="8" y="4" fill="#F1BF00"/><rect width="24" height="4" y="12" fill="#AA151B"/><rect x="5" y="5.5" width="3" height="5" rx="1" fill="#AA151B" opacity=".85"/></svg>`,
};

// Mockup minh hoa dong bo theo mon tren tieu de xoay.
const HERO_LANG_MOCKUPS = {
  "tiếng Nhật": { code: "ja", flag: "🇯🇵", title: "Tiếng Nhật N5", q: "「おはよう」(Ohayo) nghĩa là gì?", phonetic: "Phiên âm: o-ha-yo · Giao tiếp buổi sáng", a: "Chào buổi sáng", tip: "✨ Gợi ý AI: Dùng với bạn bè & đồng nghiệp thân quen." },
  "tiếng Anh": { code: "en", flag: "🇬🇧", title: "Tiếng Anh A1", q: "\u201cGood morning\u201d nghĩa là gì?", phonetic: "Phiên âm: /gud mor-ning/ · Chào hỏi", a: "Chào buổi sáng", tip: "✨ Gợi ý AI: Nhấn trọng âm ở âm tiết đầu của morning." },
  "tiếng Trung": { code: "zh", flag: "🇨🇳", title: "Tiếng Trung HSK 1", q: "「你好」(Nǐ hǎo) nghĩa là gì?", phonetic: "Pinyin: nǐ hǎo (thanh 3 + thanh 3)", a: "Xin chào", tip: "✨ Gợi ý AI: Hai thanh 3 đi liền thì chữ đầu đọc thành thanh 2 (ní hǎo)." },
  "tiếng Hàn": { code: "ko", flag: "🇰🇷", title: "Tiếng Hàn TOPIK 1", q: "「안녕하세요」 nghĩa là gì?", phonetic: "Phiên âm: an-nyeong-ha-se-yo · Lịch sự", a: "Xin chào", tip: "✨ Gợi ý AI: Dùng kính ngữ -세요 khi chào người lớn tuổi hoặc đồng nghiệp." },
  "tiếng Pháp": { code: "fr", flag: "🇫🇷", title: "Tiếng Pháp A1", q: "« Bonjour » nghĩa là gì?", phonetic: "Phiên âm: bong-jua · Âm R nhẹ cuống họng", a: "Xin chào", tip: "✨ Gợi ý AI: Âm mũi \"on\" đọc tròn môi, không bật chữ n." },
  "tiếng Tây Ban Nha": { code: "es", flag: "🇪🇸", title: "Tiếng Tây Ban Nha A1", q: "« Buenos días » nghĩa là gì?", phonetic: "Phiên âm: bue-nos di-as · Giao tiếp", a: "Chào buổi sáng", tip: "✨ Gợi ý AI: Luôn phát âm rõ từng nguyên âm a-e-i-o-u." },
};
function syncHeroMockups(word) {
  const card = document.querySelector(".hero-mockup-row [data-hero-lang]");
  const m = HERO_LANG_MOCKUPS[word];
  if (!card || !m) return;
  const flag = card.querySelector(".mockup-flag");
  const title = card.querySelector(".mockup-title");
  const q = card.querySelector(".mockup-q");
  const phonetic = card.querySelector("[data-hero-phonetic]");
  const ans = card.querySelector(".mockup-opt span");
  const tip = card.querySelector("[data-hero-tip]");
  if (flag) flag.innerHTML = LANG_FLAG_SVG[m.code] || m.flag;
  if (title) title.textContent = m.title;
  if (q) q.textContent = m.q;
  if (phonetic) phonetic.textContent = m.phonetic;
  if (ans) ans.textContent = m.a;
  if (tip) tip.textContent = m.tip;
}

export function initHeroRotator(root = document) {
  const host = root.querySelector("#heroRotator")
    || root.querySelector(".hero-title .rotator")
    || root.querySelector(".rotator.aw-rot")
    || root.querySelector("#awRot");
  if (!host) return;

  if (heroRotTimer) {
    clearInterval(heroRotTimer);
    heroRotTimer = null;
  }

  // Font web chưa tải xong lúc đo lần đầu có thể làm width sai -> đo lại khi font sẵn sàng.
  if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (!document.body.contains(host)) return;
      const wEl = host.querySelector(".rotator-word, .aw-rot-w");
      if (wEl) {
        const w = Math.ceil(wEl.getBoundingClientRect().width || wEl.offsetWidth) + 2;
        if (w > 2) host.style.width = w + "px";
      }
    }).catch(() => {});
  }

  // Trang khóa học (/khoa-hoc/<slug>): cố định tiêu đề theo môn, không xoay.
  const pinned = courseSubjectFromPath();
  if (pinned) {
    const wordEl = host.querySelector(".rotator-word, .aw-rot-w");
    if (wordEl) wordEl.textContent = pinned;
    host.setAttribute("aria-label", pinned);
    syncHeroMockups(pinned);
    const pw = host.querySelector(".rotator-word, .aw-rot-w");
    if (pw) {
      const w = Math.ceil(pw.getBoundingClientRect().width || pw.offsetWidth) + 2;
      if (w > 2) host.style.width = w + "px";
    }
    return;
  }

  // Accessibility label covering all subject options
  host.setAttribute("aria-label", HERO_ROTATOR_SUBJECTS.join(", "));

  // Set initial width to avoid layout shift
  const initialWord = host.querySelector(".rotator-word, .aw-rot-w");
  if (initialWord) {
    const w = Math.ceil(initialWord.getBoundingClientRect().width || initialWord.offsetWidth) + 2;
    if (w > 2) host.style.width = w + "px";
  }

  if (reduceMotion()) return;

  heroSubjectIdx = 0;
  const cycle = () => {
    if (!document.body.contains(host)) {
      clearInterval(heroRotTimer);
      heroRotTimer = null;
      return;
    }

    if (document.hidden) return; // tab ẩn: không đổi chữ
    heroSubjectIdx = (heroSubjectIdx + 1) % HERO_ROTATOR_SUBJECTS.length;
    const nextWord = HERO_ROTATOR_SUBJECTS[heroSubjectIdx];

    swapRotatorWord(host, nextWord);
    syncHeroMockups(nextWord);
  };

  heroRotTimer = setInterval(cycle, HERO_ROTATOR_INTERVAL_MS);
  if (!rotVisBound && typeof document !== "undefined" && document.addEventListener) {
    rotVisBound = true;
    document.addEventListener("visibilitychange", () => {
      const h = document.querySelector("#heroRotator, .hero-title .rotator, .rotator.aw-rot, #awRot");
      if (!document.hidden && h) cleanRotator(h);
    });
  }
}

/**
 * Compatibility wrapper for legacy or alternate rotator callers.
 */
export function startRotator(root = document, names = null) {
  if (Array.isArray(names) && names.length) {
    const host = root.querySelector("#heroRotator")
      || root.querySelector(".hero-title .rotator")
      || root.querySelector(".rotator.aw-rot")
      || root.querySelector("#awRot");
    if (!host) return;
    if (heroRotTimer) clearInterval(heroRotTimer);
    let idx = 0;
    const cycle = () => {
      if (!document.body.contains(host)) {
        clearInterval(heroRotTimer);
        heroRotTimer = null;
        return;
      }
      const nextWord = names[idx % names.length];
      idx++;
      if (document.hidden) return;
      swapRotatorWord(host, nextWord);
    };
    heroRotTimer = setInterval(cycle, HERO_ROTATOR_INTERVAL_MS);
  } else {
    initHeroRotator(root);
  }
}

/**
 * Initializes Section 1 Hero CTA button smooth-scrolling to #demoBox.
 * @param {HTMLElement|Document} root
 */
export function initHeroCta(root = document) {
  const cta = root.querySelector("#heroCta")
    || root.querySelector('[data-scroll-to="#demoBox"]');
  if (!cta || cta.dataset.bound) return;
  cta.dataset.bound = "1";

  cta.addEventListener("click", (e) => {
    e.preventDefault();
    if (window.__plGA) window.__plGA("click_choi_thu_ngay");
    const target = document.getElementById("demoBox") || root.querySelector("#demoBox");
    if (target) {
      smoothScrollTo(target);
      if (window.history && history.pushState) {
        history.pushState(null, "", "#demoBox");
      } else {
        setAppHash("#demoBox");
      }
    }
  });
}

const CHIBI_DIALOGUES = {
  vi: [
    { reply: "Chào bạn! Rất vui được gặp bạn hôm nay ✨" },
    { reply: "Mình cùng luyện vài câu ngắn cực dễ hiểu nha 😊" },
    { reply: "Chỉ 5 phút mỗi ngày là bạn quen phản xạ ngay 💬" },
  ],
  en: [
    { reply: "Hello! Nice to meet you — ready to chat? ✨" },
    { reply: "I'm doing great! How is your day going? 😊" },
    { reply: "Just 5 minutes a day builds real confidence 💬" },
  ],
};

function getUiLocale() {
  const htmlLang = (typeof document !== "undefined" && (document.documentElement.dataset.lang || document.documentElement.lang)) || "";
  if (htmlLang.toLowerCase().startsWith("en")) return "en";
  if (typeof location !== "undefined" && /^\/en\b/i.test(location.pathname || "")) return "en";
  return "vi";
}

/**
 * Initializes animated text-bubble conversation synced with active UI language (VI speaks Vietnamese, EN speaks English).
 * @param {HTMLElement|Document} root
 */
export function initHeroSpeakingStage(root = document) {
  const stage = root.querySelector("#chibiSpeakStage");
  if (!stage || stage.dataset.speakBound === "1") return;
  stage.dataset.speakBound = "1";

  const figure = stage.querySelector("#chibiHeroFigure");
  const liveBox = stage.querySelector("#chibiLiveSpeech");
  const liveText = stage.querySelector("#chibiLiveText");
  const reduceMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let idx = 0;
  let typeTimer = 0;
  let cycleTimer = 0;
  let waitTimer = 0;

  const stopTimers = () => {
    clearInterval(typeTimer);
    clearTimeout(waitTimer);
  };

  const runDialogue = (index, manual = false) => {
    stopTimers();
    const list = CHIBI_DIALOGUES[getUiLocale()];
    idx = ((index % list.length) + list.length) % list.length;
    const item = list[idx];

    if (!liveText || reduceMotion) {
      if (liveText) liveText.textContent = item.reply;
      return;
    }

    if (figure) {
      figure.classList.add("is-talking");
      if (manual) {
        figure.classList.remove("is-react");
        void figure.offsetWidth;
        figure.classList.add("is-react");
        setTimeout(() => figure.classList.remove("is-react"), 650);
      }
    }

    if (liveBox) liveBox.classList.add("is-typing");
    liveText.textContent = "•••";
    waitTimer = setTimeout(() => {
      if (liveBox) liveBox.classList.remove("is-typing");
      let pos = 0;
      liveText.textContent = "";
      typeTimer = setInterval(() => {
        pos++;
        liveText.textContent = item.reply.slice(0, pos);
        if (pos >= item.reply.length) {
          clearInterval(typeTimer);
          setTimeout(() => figure?.classList.remove("is-talking"), 450);
        }
      }, 26);
    }, manual ? 200 : 340);
  };

  const scheduleAuto = () => {
    clearInterval(cycleTimer);
    if (reduceMotion) return;
    cycleTimer = setInterval(() => {
      if (!document.hidden && !stage.classList.contains("is-hover")) {
        runDialogue(idx + 1, false);
      }
    }, 5000);
  };

  runDialogue(0, false);
  scheduleAuto();

  if (typeof MutationObserver !== "undefined") {
    const obs = new MutationObserver(() => runDialogue(idx, false));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "data-lang"] });
  }

  stage.addEventListener("click", (e) => {
    if (e.target.closest("#chibiHeroFigure")) {
      runDialogue(idx + 1, true);
      scheduleAuto();
    }
  });

  figure?.addEventListener("mouseenter", () => {
    stage.classList.add("is-hover");
  });
  figure?.addEventListener("mouseleave", () => {
    stage.classList.remove("is-hover");
  });
}

/**
 * Hydrates all Section 1 Hero interactions.
 * @param {HTMLElement|Document} root
 */
export function initHero(root = document) {
  initHeroRotator(root);
  initHeroCta(root);
  initHeroSpeakingStage(root);
}


// ── Demo bài ngoại ngữ — khôi phục từ bản cũ, đã sửa dấu ':' ở 'Xếp loại' ──

const LANG_DEMOS = [
  { code: "en", label: "Tiếng Anh", flag: "🇬🇧", badge: "Tiếng Anh · Giao tiếp", phonetic: "Phát âm: /wea ar yu from/", speakText: "Where are you from?", speakLang: "en-US", q: "Chọn nghĩa đúng của câu: \u201cWhere are you from?\u201d", opts: ["Bạn đang ở đâu?", "Bạn đến từ đâu?", "Bạn đi đâu vậy?"], a: 1, why: "\u201cbe from\u201d nghĩa là đến từ (quê quán, quốc gia)." },
  { code: "zh", label: "Tiếng Trung", flag: "🇨🇳", badge: "Tiếng Trung · HSK 1", phonetic: "Pinyin: shuǐ (thanh 3)", speakText: "水", speakLang: "zh-CN", q: "Chữ \u300c水\u300d (shuǐ) nghĩa là gì?", opts: ["Nước", "Lửa", "Cây"], a: 0, why: "水 là nước; 火 là lửa; 木 là cây." },
  { code: "ja", label: "Tiếng Nhật", flag: "🇯🇵", badge: "Tiếng Nhật · N5", phonetic: "Phiên âm: a-ri-ga-to", speakText: "ありがとう", speakLang: "ja-JP", q: "\u300cありがとう\u300d (arigatou) nghĩa là gì?", opts: ["Xin chào", "Tạm biệt", "Cảm ơn"], a: 2, why: "ありがとう là lời cảm ơn; trang trọng hơn là ありがとうございます." },
  { code: "ko", label: "Tiếng Hàn", flag: "🇰🇷", badge: "Tiếng Hàn · TOPIK 1", phonetic: "Phiên âm: an-nyeong-ha-se-yo", speakText: "안녕하세요", speakLang: "ko-KR", q: "\u300c안녕하세요\u300d (annyeonghaseyo) dùng để làm gì?", opts: ["Chào hỏi", "Xin lỗi", "Chúc ngủ ngon"], a: 0, why: "안녕하세요 là câu chào lịch sự, dùng được cả ngày." },
  { code: "fr", label: "Tiếng Pháp", flag: "🇫🇷", badge: "Tiếng Pháp · A1", phonetic: "Phát âm: mehc-xi bo-cu", speakText: "Merci beaucoup", speakLang: "fr-FR", q: "Câu \u201cMerci beaucoup\u201d nghĩa là gì?", opts: ["Xin lỗi", "Cảm ơn rất nhiều", "Hẹn gặp lại"], a: 1, why: "Merci là cảm ơn; beaucoup nghĩa là rất nhiều." },
  { code: "es", label: "Tiếng Tây Ban Nha", flag: "🇪🇸", badge: "Tiếng Tây Ban Nha · A1", phonetic: "Phát âm: mu-chas gra-sias", speakText: "Muchas gracias", speakLang: "es-ES", q: "Câu \u201cMuchas gracias\u201d nghĩa là gì?", opts: ["Xin lỗi", "Cảm ơn rất nhiều", "Tạm biệt"], a: 1, why: "Muchas là nhiều; gracias nghĩa là cảm ơn." },
];

function speakDemoSample(text, lang, rate = 1, btn) {
  const startedAt = Date.now();
  const done = () => {
    if (!btn) return;
    const wait = Math.max(0, 3000 - (Date.now() - startedAt));
    setTimeout(() => { btn.classList.remove("is-playing"); if (btn.dataset.label) btn.textContent = btn.dataset.label; }, wait);
  };
  try {
    if (btn) {
      btn.classList.add("is-playing");
      btn.dataset.label = btn.textContent;
      btn.textContent = "\uD83D\uDD0A \u0110ang ph\u00E1t...";
    }
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (btn) { btn.textContent = "\u26A0\uFE0F Tr\u00ECnh duy\u1EC7t kh\u00F4ng h\u1ED7 tr\u1EE3 \u0111\u1ECDc"; setTimeout(done, 5000); }
      return false;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.onend = done; u.onerror = done;
    if (btn) setTimeout(done, 8000);
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    done();
    return false;
  }
}

let demoIdx = 0;
let demoRefreshFn = null; // goi lai demo hien tai khi doi ngon ngu
let _demoModalShown = false;

// ── Section 2: Demo 6 ngoại ngữ (#demoBox) ───────────────────────────────────────────
/**
 * Hydrates Section 2 demo 6 language tabs:
 * - 6 tab ngoại ngữ: nghe phát âm mẫu, chọn đáp án, chấm ngay trên trình duyệt.
 * - Hoàn thành hiện huy hiệu + confetti.
 * @param {HTMLElement|Document} root
 */
export function hydrateSection2Demo(root = document) {
  const demoBox = root.querySelector("#demoBox") || document.getElementById("demoBox");
  if (!demoBox) return;
  const TOTAL = LANG_DEMOS.length;
  const carousel = root.querySelector("#demoCarousel") || demoBox;
  const taskEl = root.querySelector("#demoTask");
  const progEl = root.querySelector("#demoProg");
  const dotsEl = root.querySelector("#demoDots");
  const prevBtn = root.querySelector("#demoPrev");
  const nextBtn = root.querySelector("#demoNext");
  const quizEl = root.querySelector("#demoQuiz");
  const optsEl = root.querySelector("#demoOpts");
  const msgEl = root.querySelector("#demoMsg");
  const badgeEl = root.querySelector("#demoLangBadge");
  const phoneticEl = root.querySelector("#demoPhonetic");
  const countEl = root.querySelector("#demoStepCount");
  const speakBtn = root.querySelector("#demoSpeakBtn");
  const slowBtn = root.querySelector("#demoSlowBtn");

  // Thanh tab 6 ngôn ngữ trực quan (giữ data-dot và role="tab")
  if (dotsEl) {
    dotsEl.innerHTML = LANG_DEMOS.map((d, k) =>
      `<button type="button" role="tab" class="demo-dot${k === 0 ? " on" : ""}" data-dot="${k}" aria-label="${esc(d.label)}" aria-selected="${k === 0}"><span class="demo-dot-flag" aria-hidden="true">${LANG_FLAG_SVG[d.code] || d.flag}</span><span class="demo-dot-lbl">${esc(d.label)}</span></button>`
    ).join("");
  }

  const setProg = (n) => { if (progEl) progEl.style.width = (n / TOTAL * 100) + "%"; };

  function showDemo(idx) {
    demoIdx = ((idx % TOTAL) + TOTAL) % TOTAL;
    dotsEl?.querySelectorAll("[data-dot]").forEach((d) => {
      const on = Number(d.dataset.dot) === demoIdx;
      d.classList.toggle("on", on);
      d.setAttribute("aria-selected", String(on));
    });
    setProg(demoIdx + 1);
    if (countEl) countEl.textContent = `${demoIdx + 1} / ${TOTAL}`;
    const d = LANG_DEMOS[demoIdx];
    if (quizEl) quizEl.hidden = false;
    if (badgeEl) badgeEl.innerHTML = `<span class="demo-badge-flag" aria-hidden="true">${LANG_FLAG_SVG[d.code] || d.flag}</span><span>${esc(d.badge)}</span>`;
    if (taskEl) taskEl.textContent = d.q;
    if (phoneticEl) phoneticEl.textContent = d.phonetic || "";
    if (msgEl) { msgEl.textContent = ""; msgEl.className = "aw-quiz-msg"; }
    if (optsEl) {
      optsEl.innerHTML = d.opts.map((o, k) => `<button type="button" data-opt="${k}">${esc(o)}</button>`).join("");
      optsEl.querySelectorAll("[data-opt]").forEach((ob) => ob.addEventListener("click", () => {
        const ok = Number(ob.dataset.opt) === d.a;
        optsEl.querySelectorAll("[data-opt]").forEach((x) => {
          x.disabled = true;
          if (Number(x.dataset.opt) === d.a) x.classList.add("ok");
        });
        if (!ok) ob.classList.add("bad");
        if (msgEl) {
          msgEl.className = "aw-quiz-msg " + (ok ? "ok" : "bad");
          msgEl.textContent = (ok ? "Chính xác! " : "Chưa đúng. ") + d.why;
        }
        if (ok) { trackFunnel("demo_run_ok"); confetti(ob); }
      }));
    }
    const stage = root.querySelector("#demoStage");
    if (stage) { stage.classList.remove("demo-anim"); void stage.offsetWidth; stage.classList.add("demo-anim"); }
  }

  // Delegation tren document: nut demo co the duoc ve lai sau hydrate nen
  // handler gan truc tiep de bi mat; delegation bat duoc nut du tao lai luc nao.
  if (!window.__plDemoSpeakBound) {
    window.__plDemoSpeakBound = true;
    document.addEventListener("click", (e) => {
      const b = e.target && e.target.closest ? e.target.closest("#demoSpeakBtn, #demoSlowBtn") : null;
      if (!b) return;
      const d = LANG_DEMOS[demoIdx];
      if (!d) return;
      if (b.id === "demoSpeakBtn") speakDemoSample(d.speakText, d.speakLang, 1, b);
      else speakDemoSample(d.speakText, d.speakLang, 0.6, b);
    });
  }

  // ── Tự cuộn carousel, đưa chuột vào (hover) hoặc focus thì dừng ──
  const DELAY = 6000;
  let timer = null;
  let hovering = false;
  let focused = false;
  const paused = () => hovering || focused;
  function startAuto() {
    stopAuto();
    timer = setInterval(() => { if (!paused()) showDemo(demoIdx + 1); }, DELAY);
  }
  function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
  carousel.addEventListener("mouseenter", () => { hovering = true; });
  carousel.addEventListener("mouseleave", () => { hovering = false; });
  carousel.addEventListener("focusin", () => { focused = true; });
  carousel.addEventListener("focusout", (e) => {
    if (!carousel.contains(e.relatedTarget)) focused = false;
  });
  const goTo = (k) => { showDemo(k); startAuto(); };
  prevBtn?.addEventListener("click", () => goTo(demoIdx - 1));
  nextBtn?.addEventListener("click", () => goTo(demoIdx + 1));
  dotsEl?.querySelectorAll("[data-dot]").forEach((d) =>
    d.addEventListener("click", () => goTo(Number(d.dataset.dot)))
  );

  demoRefreshFn = () => showDemo(demoIdx);
  showDemo(0);
  startAuto();
}


/**
 * Displays the praise conversion modal mounting to #modalHost when the learner completes
 * either sandbox correctly.
 */
export function showConversionModal() {
  setTimeout(() => {
    if (document.querySelector(".demo-success-dialog")) return;

    const praiseText = "Bạn làm đúng rồi! Bạn có năng khiếu đấy. Tạo tài khoản để lưu tiến độ nhé?";
    const tpl = document.getElementById("demoSuccessTpl");
    const html = tpl ? tpl.innerHTML : `
      <div class="demo-success-dialog" style="text-align:center;padding:16px 8px">
        <div style="font-size:36px;margin-bottom:8px">🎉</div>
        <p class="demo-success-msg" style="font-size:17px;font-weight:600;margin-bottom:20px;line-height:1.4">
          ${praiseText}
        </p>
        <button type="button" class="aw-pill dark lg" data-auth="register" style="width:100%;justify-content:center;">
          Tạo tài khoản miễn phí
        </button>
      </div>`;

    const m = openModal(html, { label: "Hoàn thành bài tập", cls: "conversion-modal demo-modal-dialog" });
    const regBtn = m.el.querySelector('[data-auth="register"]');
    if (regBtn) {
      regBtn.addEventListener("click", () => {
        m.close();
        trackFunnel("register_click");
        openAuth("register", authedCb);
      });
    }
  }, 450);
}

// ── Full 8-Section SSR Markup Template Builder ───────────────────────────────
export function buildLandingMarkup() {
  return `
  <div class="landing-page aw" id="landingPage">
    <!-- Top Hand-Drawn Sketchbook Menu + Pinned Mega-Menus + Mobile Drawer -->
    <header class="aw-top lp-top sketch-top" id="lpTop">
      <div class="aw-wrap aw-top-in">
        <a class="brand brand-os brand-sketch" href="/app/" aria-label="${esc(siteName())}, trang chủ">
            <span class="brand-lockup">
            <span class="brand-text">${esc(siteName())}</span>
          </span>
        </a>

        <nav class="aw-nav" aria-label="Điều hướng chính">
          <a href="#mon-hoc"><svg class="chibi-nav-ic" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M5 9 4 4l4 2.5M19 9l1-5-4 2.5" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.8" stroke-linejoin="round"/><ellipse cx="12" cy="13" rx="7.5" ry="6.2" fill="#FEF08A" stroke="#4A3728" stroke-width="1.8"/><circle cx="9.2" cy="12.6" r="1.1" fill="#4A3728"/><circle cx="14.8" cy="12.6" r="1.1" fill="#4A3728"/><ellipse cx="7.4" cy="14.4" rx="1.2" ry=".7" fill="#FDA4AF"/><ellipse cx="16.6" cy="14.4" rx="1.2" ry=".7" fill="#FDA4AF"/></svg>Khóa học</a>
          <a href="#cach-hoc"><svg class="chibi-nav-ic" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M5 8 4 3.5 8 6M19 8l1-4.5L16 6" fill="#DDD6FE" stroke="#4A3728" stroke-width="1.8" stroke-linejoin="round"/><ellipse cx="12" cy="13" rx="7.5" ry="6.2" fill="#DDD6FE" stroke="#4A3728" stroke-width="1.8"/><circle cx="9.2" cy="12.6" r="1.1" fill="#4A3728"/><circle cx="14.8" cy="12.6" r="1.1" fill="#4A3728"/><ellipse cx="7.4" cy="14.4" rx="1.2" ry=".7" fill="#FDA4AF"/><ellipse cx="16.6" cy="14.4" rx="1.2" ry=".7" fill="#FDA4AF"/></svg>Đồ nghề AI</a>
          <a href="#demoBox"><svg class="chibi-nav-ic" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><circle cx="7" cy="6.5" r="2.5" fill="#FDE68A" stroke="#4A3728" stroke-width="1.7"/><circle cx="17" cy="6.5" r="2.5" fill="#FDE68A" stroke="#4A3728" stroke-width="1.7"/><ellipse cx="12" cy="13" rx="7.5" ry="6.2" fill="#BBF7D0" stroke="#4A3728" stroke-width="1.8"/><circle cx="9.2" cy="12.6" r="1.1" fill="#4A3728"/><circle cx="14.8" cy="12.6" r="1.1" fill="#4A3728"/><ellipse cx="7.4" cy="14.4" rx="1.2" ry=".7" fill="#FDA4AF"/><ellipse cx="16.6" cy="14.4" rx="1.2" ry=".7" fill="#FDA4AF"/></svg>Chơi thử</a>
          <a href="#muc-dich"><svg class="chibi-nav-ic" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><ellipse cx="8.5" cy="5.5" rx="2" ry="4" fill="#FBCFE8" stroke="#4A3728" stroke-width="1.7"/><ellipse cx="15.5" cy="5.5" rx="2" ry="4" fill="#FBCFE8" stroke="#4A3728" stroke-width="1.7"/><ellipse cx="12" cy="13.5" rx="7.2" ry="6" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.8"/><circle cx="9.4" cy="13.2" r="1.1" fill="#4A3728"/><circle cx="14.6" cy="13.2" r="1.1" fill="#4A3728"/><ellipse cx="7.6" cy="15" rx="1.2" ry=".7" fill="#FDA4AF"/><ellipse cx="16.4" cy="15" rx="1.2" ry=".7" fill="#FDA4AF"/></svg>Lộ trình</a>
          <a href="/${currentLang()}/pricing"><svg class="chibi-nav-ic" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><circle cx="7" cy="6.5" r="2.5" fill="#4A3728"/><circle cx="17" cy="6.5" r="2.5" fill="#4A3728"/><ellipse cx="12" cy="13" rx="7.5" ry="6.2" fill="#BAE6FD" stroke="#4A3728" stroke-width="1.8"/><circle cx="9.2" cy="12.6" r="1.1" fill="#4A3728"/><circle cx="14.8" cy="12.6" r="1.1" fill="#4A3728"/><ellipse cx="7.4" cy="14.4" rx="1.2" ry=".7" fill="#FDA4AF"/><ellipse cx="16.6" cy="14.4" rx="1.2" ry=".7" fill="#FDA4AF"/></svg>Bảng giá</a>
          <a href="#hoi-dap"><svg class="chibi-nav-ic" viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><ellipse cx="12" cy="13" rx="7.5" ry="6.5" fill="#FED7AA" stroke="#4A3728" stroke-width="1.8"/><circle cx="9.2" cy="12.6" r="1.1" fill="#4A3728"/><circle cx="14.8" cy="12.6" r="1.1" fill="#4A3728"/><ellipse cx="7.4" cy="14.4" rx="1.2" ry=".7" fill="#FDA4AF"/><ellipse cx="16.6" cy="14.4" rx="1.2" ry=".7" fill="#FDA4AF"/></svg>Hỏi đáp</a>
        </nav>

        <span class="spacer"></span>

        <div class="aw-auth">
          ${langSwitchHtml()}
          <button type="button" class="aw-login-link" data-auth="login">Đăng nhập</button>
          <button type="button" class="aw-pill dark" data-auth="register">Bắt đầu ngay</button>
        </div>

        <button type="button" class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Mở menu điều hướng" aria-expanded="false" aria-controls="mobileDrawer">
          <span></span><span></span><span></span>
        </button>
      </div>

      <!-- Mobile Slide Drawer -->
      <div class="mobile-drawer" id="mobileDrawer" hidden>
        <div class="mobile-drawer-inner">
          <div class="mobile-drawer-links">
            <a href="#demoBox">🎯 Thử bài tương tác 6 ngoại ngữ</a>
            <a href="#muc-dich">🧭 Lộ trình theo mục tiêu</a>
            <a href="#mon-hoc">🌍 Chương trình 6 ngoại ngữ</a>
            <a href="#cach-hoc">⚡ Phương pháp 3 bước &amp; SRS</a>
            <a href="/${currentLang()}/pricing">💳 Bảng giá Free vs Pro</a>
            <a href="#hoi-dap">❓ Câu hỏi thường gặp</a>
          </div>
          <div class="mobile-drawer-langs">
            <a href="/app/ngoai-ngu/en" data-subj="en">Tiếng Anh</a>
            <a href="/app/ngoai-ngu/zh" data-subj="zh">Tiếng Trung</a>
            <a href="/app/ngoai-ngu/ja" data-subj="ja">Tiếng Nhật</a>
            <a href="/app/ngoai-ngu/ko" data-subj="ko">Tiếng Hàn</a>
            <a href="/app/ngoai-ngu/fr" data-subj="fr">Tiếng Pháp</a>
            <a href="/app/ngoai-ngu/es" data-subj="es">Tây Ban Nha</a>
          </div>
          <button type="button" class="aw-pill dark mobile-drawer-cta" data-auth="register">Tạo tài khoản miễn phí →</button>
        </div>
      </div>
    </header>

    <main id="main">
      <!-- Section 1: Hand-Drawn Sketchbook Desk Spread Hero (#hero) -->
      <section class="obs-hero sec-hero sketch-hero" id="hero">
        <div class="obs-hero-bg" aria-hidden="true"></div>
        <svg class="hero-doodle-stars" viewBox="0 0 120 80" width="108" height="72" fill="none" aria-hidden="true">
          <path d="M24 14l4 11 11 4-11 4-4 11-4-11-11-4 11-4 4-11Z" stroke="#D94F3D" stroke-width="2" stroke-linejoin="round" fill="#FDE047" opacity=".75"/>
          <path d="M78 46c3-8 10-8 14-1-3 8-10 8-14 1Z" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>
          <path d="M92 18c8-3 15 4 12 12" stroke="#1C1917" stroke-width="2" stroke-dasharray="4 4" stroke-linecap="round" opacity=".45"/>
        </svg>
        <div class="aw-wrap obs-hero-grid hero-container">
          <div class="hero-copy">
            <span class="obs-eyebrow hero-chip">
              <svg class="chibi-ic" viewBox="0 0 28 28" width="22" height="22" fill="none" aria-hidden="true">
                <path d="M6.6 10.6 5.8 4.4l5 3.1M21.4 10.6l.8-6.2-5 3.1" fill="#FFFDF9" stroke="#4A3728" stroke-width="2" stroke-linejoin="round"/>
                <rect x="5.4" y="6.8" width="17.2" height="14.2" rx="7.1" fill="#FFFDF9" stroke="#4A3728" stroke-width="2"/>
                <circle cx="10.4" cy="13.4" r="1.45" fill="#4A3728"/><circle cx="17.6" cy="13.4" r="1.45" fill="#4A3728"/>
                <circle cx="10" cy="12.9" r=".55" fill="#FFFDF9"/><circle cx="17.2" cy="12.9" r=".55" fill="#FFFDF9"/>
                <ellipse cx="8.3" cy="15.3" rx="1.4" ry=".75" fill="#FDA4AF"/><ellipse cx="19.7" cy="15.3" rx="1.4" ry=".75" fill="#FDA4AF"/>
                <path d="M12.5 15.2q.8.9 1.5 0 .7.9 1.5 0" stroke="#4A3728" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
              <span>Learn English Your Way · 6 Ngoại ngữ &amp; AI</span>
            </span>
            <h1 class="hero-title">
              Học <span class="rotator aw-rot" id="heroRotator"><span class="rotator-word aw-rot-w in">tiếng Nhật</span></span><br>
              <mark class="hero-highlight">
                <span>tự tin giao tiếp.</span>
                <svg class="sketch-underline-svg" viewBox="0 0 340 24" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M4 13c62-5 148-6 218-2 42 2 84 1 114-2" stroke="#FDE047" stroke-width="14" stroke-linecap="round" opacity=".88"/>
                  <path d="M6 18c85-6 212-5 326 1" stroke="#D94F3D" stroke-width="2.6" stroke-linecap="round" fill="none"/>
                </svg>
              </mark>
            </h1>
            <p class="aw-lead hero-sub">Mỗi bài chỉ vài phút, có lý thuyết ngắn, làm xong chấm ngay, sai đâu sửa đó. Không cần biết gì trước.</p>
            <div class="aw-cta hero-cta-wrap">
              <a href="#demoBox" class="aw-pill hero-btn-primary hero-cta-btn" id="heroCta" data-scroll-to="#demoBox">
                Chơi thử ngay - Không cần tài khoản
              </a>
              <a href="#mon-hoc" class="aw-pill hero-btn-glass hero-cta-sec" data-scroll-to="#mon-hoc">
                Xem 6 ngoại ngữ →
              </a>
              <svg class="hero-curved-arrow" viewBox="0 0 110 48" width="96" height="42" fill="none" aria-hidden="true">
                <path d="M6 34c26-22 62-22 92-4" stroke="#D94F3D" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="5 4"/>
                <path d="M89 20l11 10-14 4" stroke="#D94F3D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="aw-note hero-note">
              <svg class="icon-check" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
              <span>Miễn phí cấp cơ bản · Không cần cài đặt · Dùng được trên điện thoại</span>
            </p>
            <div class="obs-kpis hero-metrics" aria-label="Thông số nền tảng">
              <div class="hero-metric sticky-note s1"><b>6</b><span>Ngoại ngữ</span></div>
              <div class="hero-metric sticky-note s2"><b>2.340+</b><span>Bài tập có chấm</span></div>
              <div class="hero-metric sticky-note s3"><b>30 ngành</b><span>Phỏng vấn AI</span></div>
            </div>
            <div class="chibi-squad-bar" aria-label="Biệt đội 6 ngoại ngữ">
              <a href="/app/ngoai-ngu/en" class="chibi-squad-pill"><svg class="chibi-nav-ic" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><circle cx="6.5" cy="7.5" r="2.6" fill="#FDE68A" stroke="#4A3728" stroke-width="1.6"/><circle cx="17.5" cy="7.5" r="2.6" fill="#FDE68A" stroke="#4A3728" stroke-width="1.6"/><ellipse cx="12" cy="13.5" rx="7.5" ry="6.2" fill="#FDE68A" stroke="#4A3728" stroke-width="1.7"/><rect x="8.5" y="4" width="7" height="4.5" rx="2" fill="#4A3728"/><circle cx="9.4" cy="13.2" r="1.1" fill="#4A3728"/><circle cx="14.6" cy="13.2" r="1.1" fill="#4A3728"/><ellipse cx="7.4" cy="15" rx="1.2" ry=".7" fill="#FDA4AF"/><ellipse cx="16.6" cy="15" rx="1.2" ry=".7" fill="#FDA4AF"/></svg><span>Anh</span></a>
              <a href="/app/ngoai-ngu/zh" class="chibi-squad-pill"><svg class="chibi-nav-ic" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><circle cx="6.5" cy="7" r="2.6" fill="#4A3728"/><circle cx="17.5" cy="7" r="2.6" fill="#4A3728"/><ellipse cx="12" cy="13.5" rx="7.5" ry="6.2" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.7"/><circle cx="9.2" cy="13" r="1.9" fill="#4A3728"/><circle cx="14.8" cy="13" r="1.9" fill="#4A3728"/><circle cx="9.2" cy="12.8" r=".7" fill="#fff"/><circle cx="14.8" cy="12.8" r=".7" fill="#fff"/><ellipse cx="7.4" cy="15.2" rx="1.2" ry=".7" fill="#FDA4AF"/><ellipse cx="16.6" cy="15.2" rx="1.2" ry=".7" fill="#FDA4AF"/></svg><span>Trung</span></a>
              <a href="/app/ngoai-ngu/ja" class="chibi-squad-pill"><svg class="chibi-nav-ic" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="M5 9 4 4l4 2.5M19 9l1-5-4 2.5" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.7" stroke-linejoin="round"/><ellipse cx="12" cy="13.5" rx="7.5" ry="6.2" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.7"/><circle cx="9.4" cy="13.2" r="1.1" fill="#4A3728"/><circle cx="14.6" cy="13.2" r="1.1" fill="#4A3728"/><ellipse cx="7.4" cy="15" rx="1.2" ry=".7" fill="#FDA4AF"/><ellipse cx="16.6" cy="15" rx="1.2" ry=".7" fill="#FDA4AF"/></svg><span>Nhật</span></a>
              <a href="/app/ngoai-ngu/ko" class="chibi-squad-pill"><svg class="chibi-nav-ic" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><ellipse cx="8.5" cy="5.5" rx="2" ry="4" fill="#FBCFE8" stroke="#4A3728" stroke-width="1.6"/><ellipse cx="15.5" cy="5.5" rx="2" ry="4" fill="#FBCFE8" stroke="#4A3728" stroke-width="1.6"/><ellipse cx="12" cy="13.8" rx="7.2" ry="6" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.7"/><circle cx="9.4" cy="13.5" r="1.1" fill="#4A3728"/><circle cx="14.6" cy="13.5" r="1.1" fill="#4A3728"/><ellipse cx="7.6" cy="15.3" rx="1.2" ry=".7" fill="#FDA4AF"/><ellipse cx="16.4" cy="15.3" rx="1.2" ry=".7" fill="#FDA4AF"/></svg><span>Hàn</span></a>
              <a href="/app/ngoai-ngu/fr" class="chibi-squad-pill"><svg class="chibi-nav-ic" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="M5 9.5 4.2 5l4 2.4M19 9.5l.8-4.5-4 2.4" fill="#DDD6FE" stroke="#4A3728" stroke-width="1.7" stroke-linejoin="round"/><ellipse cx="12" cy="14" rx="7.3" ry="6" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.7"/><ellipse cx="13" cy="7.5" rx="5.5" ry="2.3" fill="#C4B5FD" stroke="#4A3728" stroke-width="1.5"/><circle cx="9.4" cy="13.6" r="1.1" fill="#4A3728"/><circle cx="14.6" cy="13.6" r="1.1" fill="#4A3728"/><ellipse cx="7.4" cy="15.3" rx="1.2" ry=".7" fill="#FDA4AF"/><ellipse cx="16.6" cy="15.3" rx="1.2" ry=".7" fill="#FDA4AF"/></svg><span>Pháp</span></a>
              <a href="/app/ngoai-ngu/es" class="chibi-squad-pill"><svg class="chibi-nav-ic" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><ellipse cx="12" cy="13.5" rx="7.4" ry="6.2" fill="#FEF08A" stroke="#4A3728" stroke-width="1.7"/><circle cx="9.4" cy="13" r="1.1" fill="#4A3728"/><circle cx="14.6" cy="13" r="1.1" fill="#4A3728"/><ellipse cx="7.5" cy="14.8" rx="1.2" ry=".7" fill="#FDA4AF"/><ellipse cx="16.5" cy="14.8" rx="1.2" ry=".7" fill="#FDA4AF"/><path d="m10.8 14.2 1.2 1.4 1.2-1.4z" fill="#FB923C"/></svg><span>TBN</span></a>
            </div>
          </div>

          <div class="hero-mockup-row os-studio-col chibi-pro-stage" aria-label="Gia sư trò chuyện">
            <div class="chibi-stage-canvas chibi-speak-stage" id="chibiSpeakStage">
              <span class="os-win-title" hidden>Sổ tay phác thảo</span>
              <div class="chibi-live-speech" id="chibiLiveSpeech" aria-live="polite">
                <span class="chibi-live-text" id="chibiLiveText">Chào bạn! Hôm nay mình học nhé ✨</span>
              </div>
              <button type="button" class="chibi-hero-figure is-talking" id="chibiHeroFigure" aria-label="Chạm để trò chuyện với cô giáo">
                <img class="chibi-hero-photo" src="/img/chibi/hero-tutor-speaking.webp" width="380" height="380" alt="Gia sư đang trò chuyện cùng học viên" />
              </button>
            </div>
          </div>

          <div class="hero-mockup-row chibi-dock-strip" aria-label="Mô phỏng phòng luyện nói và thẻ bài">
            <div class="os-window sketch-clipboard chibi-mini-dock">
              <div class="os-win-body">
                <div class="mockup-card os-speak-panel sketch-speak-box">
                  <div class="os-panel-head">
                    <span class="os-tag sketch-mic-label">
                      <svg class="chibi-ic" viewBox="0 0 28 28" width="26" height="26" fill="none" aria-hidden="true">
                        <circle cx="7.6" cy="7.4" r="3" fill="#4A3728"/><circle cx="20.4" cy="7.4" r="3" fill="#4A3728"/>
                        <rect x="5.4" y="6.8" width="17.2" height="14.2" rx="7.1" fill="#FFFDF9" stroke="#4A3728" stroke-width="2"/>
                        <circle cx="10.4" cy="13.4" r="1.45" fill="#4A3728"/><circle cx="17.6" cy="13.4" r="1.45" fill="#4A3728"/>
                        <circle cx="10" cy="12.9" r=".55" fill="#FFFDF9"/><circle cx="17.2" cy="12.9" r=".55" fill="#FFFDF9"/>
                        <ellipse cx="8.3" cy="15.3" rx="1.4" ry=".75" fill="#FDA4AF"/><ellipse cx="19.7" cy="15.3" rx="1.4" ry=".75" fill="#FDA4AF"/>
                        <rect x="17.5" y="16.4" width="5.4" height="8" rx="2.7" fill="#A7F3D0" stroke="#4A3728" stroke-width="1.6"/>
                      </svg>
                      <span>Phòng luyện nói AI</span>
                    </span>
                    <span class="badge-grade sketch-stamp">✓ 92 / 100 điểm</span>
                  </div>
                  <div class="mockup-karaoke" aria-label="Chấm phát âm từng từ">
                    <span class="kw ok">Good</span>
                    <span class="kw ok">morning,</span>
                    <span class="kw warn">everyone!</span>
                  </div>
                  <div class="os-wave-row">
                    <svg class="sketch-wave-svg" viewBox="0 0 220 30" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M2 15 Q 10 3, 18 15 T 34 15 Q 42 2, 50 15 T 66 15 Q 74 4, 82 15 T 98 15 Q 106 1, 114 15 T 130 15 Q 138 5, 146 15 T 162 15 Q 170 3, 178 15 T 194 15 Q 204 6, 216 15" fill="none" stroke="#2563EB" stroke-width="2.4" stroke-linecap="round"/>
                    </svg>
                    <span class="os-wave-note">Phát âm chuẩn · Nhấn âm rõ</span>
                  </div>
                </div>

                <div class="mockup-card os-lang-panel sketch-pinned-card" data-hero-lang>
                  <span class="sketch-tape" aria-hidden="true"></span>
                  <div class="mockup-head">
                    <span class="mockup-flag">${LANG_FLAG_SVG.ja}</span>
                    <span class="mockup-title">Tiếng Nhật N5</span>
                    <span class="mockup-level-pill">Bài đang xoay</span>
                  </div>
                  <div class="mockup-body">
                    <p class="mockup-q">「おはよう」(Ohayo) nghĩa là gì?</p>
                    <p class="mockup-phonetic" data-hero-phonetic>Phiên âm: o-ha-yo · Giao tiếp buổi sáng</p>
                    <div class="mockup-opt ok">
                      <span>Chào buổi sáng</span>
                      <span class="badge-grade">✓ Chính xác!</span>
                    </div>
                    <div class="mockup-ai-tip" data-hero-tip>✎ Gợi ý AI: Dùng với bạn bè &amp; đồng nghiệp thân quen.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 2: Split Workbench Sandbox (#demoBox) -->
      <section class="aw-sec sec-demo-band sec-demo" id="demoBox">
        <div class="aw-wrap">
          <div class="sec-head-split">
            <div>
              <span class="sec-chip">Trải nghiệm trực tiếp</span>
              <h2 class="sec-title">Thử 2 phút là biết mình học được.</h2>
            </div>
            <p class="sec-sub">Thử 6 ngoại ngữ ngay: nghe phát âm mẫu và trả lời nhanh. Không cần tài khoản.</p>
          </div>

          <div class="aw-try demo-carousel demo-workbench" id="demoCarousel">
            <aside class="demo-rail">
              <div class="demo-rail-head">
                <div class="demo-rail-title">
                  <b>Bài chơi thử.</b>
                  <small>6 bài ngoại ngữ, nghe mẫu &amp; chấm điểm tức thì</small>
                </div>
                <span class="demo-step-count" id="demoStepCount">1 / 6</span>
              </div>
              <div class="aw-try-prog"><i id="demoProg" style="width:16.67%"></i></div>
              <div class="demo-nav">
                <button type="button" class="demo-arrow" id="demoPrev" aria-label="Bài trước">‹</button>
                <div class="demo-dots" id="demoDots" role="tablist" aria-label="Chọn bài chơi thử"></div>
                <button type="button" class="demo-arrow" id="demoNext" aria-label="Bài tiếp">›</button>
              </div>
            </aside>

            <div class="aw-try-body" id="demoStage">
              <div class="demo-prompt-bar">
                <div class="demo-prompt-meta">
                  <span class="demo-lang-badge" id="demoLangBadge"><span class="demo-badge-flag" aria-hidden="true">${LANG_FLAG_SVG.en}</span><span>Tiếng Anh · Giao tiếp</span></span>
                  <p class="aw-try-task" id="demoTask"></p>
                  <p class="demo-phonetic" id="demoPhonetic"></p>
                </div>
                <div class="demo-audio-actions">
                  <button type="button" class="demo-audio-btn" id="demoSpeakBtn" aria-label="Nghe phát âm mẫu">${lineIcon("speaker", 15)} <span>Nghe mẫu</span></button>
                  <button type="button" class="demo-audio-btn slow" id="demoSlowBtn" aria-label="Nghe chậm 0.6x">🐢 0.6x</button>
                </div>
              </div>
              <div class="aw-quiz" id="demoQuiz" hidden><div class="aw-quiz-opts" id="demoOpts"></div><p class="aw-quiz-msg" id="demoMsg" aria-live="polite"></p></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 3: Pinned Corkboard & Sketch Illustrations (#muc-dich) -->
      <section class="aw-sec aw-wrap sec-muc-dich" id="muc-dich">
        <div class="sec-head-split">
          <div>
            <span class="sec-chip">Lộ trình cá nhân hóa</span>
            <h2 class="sec-title">Bạn là ai? Học gì cho đúng?</h2>
          </div>
          <p class="sec-sub">Lộ trình được thiết kế sẵn cho từng mục tiêu cụ thể, bấm vào để học ngay.</p>
        </div>

        <div class="purpose-bento-grid">
          <div class="purpose-card featured bento-main sketch-card">
            <span class="sketch-tape" aria-hidden="true"></span>
            <div class="bento-top-row">
              <div class="purpose-badge">🎓 Sinh viên &amp; đi làm</div>
              <span class="purpose-popular">Phổ biến nhất</span>
            </div>
            <div class="purpose-sketch-art" aria-hidden="true">
              <svg class="chibi-ic" viewBox="0 0 180 86" width="176" height="84" fill="none">
                <path d="M28 24 22 9l15 9M62 24 68 9 53 18" fill="#DDD6FE" stroke="#4A3728" stroke-width="2.4" stroke-linejoin="round"/>
                <ellipse cx="45" cy="40" rx="22" ry="18" fill="#DDD6FE" stroke="#4A3728" stroke-width="2.4"/>
                <circle cx="37" cy="39" r="3" fill="#4A3728"/><circle cx="53" cy="39" r="3" fill="#4A3728"/>
                <circle cx="35.8" cy="37.8" r="1.1" fill="#fff"/><circle cx="51.8" cy="37.8" r="1.1" fill="#fff"/>
                <ellipse cx="31" cy="44" rx="3.2" ry="1.7" fill="#FDA4AF"/><ellipse cx="59" cy="44" rx="3.2" ry="1.7" fill="#FDA4AF"/>
                <path d="m42 44 3 3 3-3" fill="#FDE047" stroke="#4A3728" stroke-width="1.8" stroke-linejoin="round"/>
                <ellipse cx="45" cy="64" rx="14" ry="11" fill="#FFFDF9" stroke="#4A3728" stroke-width="2.2"/>
                <path d="M84 18h76a12 12 0 0 1 12 12v18a12 12 0 0 1-12 12h-42l-12 11 3-11H84a12 12 0 0 1-12-12V30a12 12 0 0 1 12-12Z" fill="#FEF08A" stroke="#4A3728" stroke-width="2.4" stroke-linejoin="round"/>
                <circle cx="96" cy="39" r="3" fill="#F472B6"/><path d="M106 36h44M106 44h30" stroke="#4A3728" stroke-width="2.6" stroke-linecap="round"/>
              </svg>
            </div>
            <h3 class="purpose-card-title">Mình muốn luyện nói &amp; phỏng vấn</h3>
            <p class="purpose-suggest">Gợi ý: <strong>Luyện nói + Phỏng vấn AI 30 ngành</strong></p>
            <p class="purpose-detail">Luyện phát âm chậm 0.6x và phản xạ phỏng vấn xin việc theo 30 ngành với AI ở cả 6 ngoại ngữ.</p>
            <ul class="purpose-bullets">
              <li>Chấm phát âm từng từ như karaoke + tốc độ 0.6x</li>
              <li>Thực hành phỏng vấn AI theo 30 ngành nghề thực tế</li>
            </ul>
            <div class="bento-industry-strip" aria-hidden="true">
              <span>IT &amp; Phần mềm</span><span>Kinh doanh</span><span>Tài chính</span><span>Du lịch</span><span>+26 ngành</span>
            </div>
            <a href="/app/ngoai-ngu" class="aw-pill hero-btn-primary purpose-btn" data-goal="intern">Khám phá luyện nói &amp; AI →</a>
          </div>

          <div class="purpose-bento-side">
            <div class="purpose-card sketch-card">
              <span class="sketch-tape tape-sm" aria-hidden="true"></span>
              <div class="purpose-side-head">
                <div class="purpose-badge">🎒 Học sinh</div>
                <svg class="purpose-mini-doodle chibi-ic" viewBox="0 0 64 52" width="60" height="48" fill="none" aria-hidden="true">
                  <path d="M16 18 13 6l10 6M44 18l3-12-10 6" fill="#FFFDF9" stroke="#4A3728" stroke-width="2.2" stroke-linejoin="round"/>
                  <ellipse cx="30" cy="27" rx="16" ry="13" fill="#FFFDF9" stroke="#4A3728" stroke-width="2.2"/>
                  <circle cx="24" cy="26" r="2.2" fill="#4A3728"/><circle cx="36" cy="26" r="2.2" fill="#4A3728"/>
                  <circle cx="23.2" cy="25.2" r=".8" fill="#fff"/><circle cx="35.2" cy="25.2" r=".8" fill="#fff"/>
                  <ellipse cx="20" cy="30" rx="2.5" ry="1.3" fill="#FDA4AF"/><ellipse cx="40" cy="30" rx="2.5" ry="1.3" fill="#FDA4AF"/>
                  <rect x="18" y="36" width="24" height="12" rx="3" fill="#FEF08A" stroke="#4A3728" stroke-width="2"/>
                  <path d="M30 36v12" stroke="#4A3728" stroke-width="1.8"/>
                </svg>
              </div>
              <h3 class="purpose-card-title">Mình là học sinh lớp 6-12</h3>
              <p class="purpose-suggest">Gợi ý: <strong>Tiếng Anh A1 + luyện nói</strong></p>
              <p class="purpose-detail">Học tiếng Anh từ nền tảng, nói tự tin và đọc hiểu cho trường lớp.</p>
              <ul class="purpose-bullets">
                <li>Lý thuyết ngắn gọn, dễ nhớ theo từng chủ đề</li>
                <li>Luyện nghe &amp; phát âm chuẩn ngay trên trình duyệt</li>
              </ul>
              <a href="/app/ngoai-ngu/en" class="aw-pill ghost purpose-btn" data-goal="student">Học theo lộ trình học sinh →</a>
            </div>

            <div class="purpose-card sketch-card">
              <span class="sketch-tape tape-sm" aria-hidden="true"></span>
              <div class="purpose-side-head">
                <div class="purpose-badge">✈️ Xuất khẩu</div>
                <svg class="purpose-mini-doodle chibi-ic" viewBox="0 0 68 52" width="64" height="48" fill="none" aria-hidden="true">
                  <path d="M18 18 15 6l10 6M46 18l3-12-10 6" fill="#FED7AA" stroke="#4A3728" stroke-width="2.2" stroke-linejoin="round"/>
                  <ellipse cx="32" cy="27" rx="16" ry="13" fill="#FED7AA" stroke="#4A3728" stroke-width="2.2"/>
                  <ellipse cx="32" cy="31" rx="10" ry="7" fill="#FFFDF9"/>
                  <circle cx="26" cy="26" r="2.2" fill="#4A3728"/><circle cx="38" cy="26" r="2.2" fill="#4A3728"/>
                  <circle cx="25.2" cy="25.2" r=".8" fill="#fff"/><circle cx="37.2" cy="25.2" r=".8" fill="#fff"/>
                  <ellipse cx="21.5" cy="29.8" rx="2.5" ry="1.3" fill="#FDA4AF"/><ellipse cx="42.5" cy="29.8" rx="2.5" ry="1.3" fill="#FDA4AF"/>
                  <path d="m46 14 16-5-7 13-4-4z" fill="#BAE6FD" stroke="#4A3728" stroke-width="1.8" stroke-linejoin="round"/>
                  <rect x="20" y="38" width="24" height="8" rx="4" fill="#F9A8D4" stroke="#4A3728" stroke-width="1.8"/>
                </svg>
              </div>
              <h3 class="purpose-card-title">Mình muốn đi Nhật / Hàn làm việc</h3>
              <p class="purpose-suggest">Gợi ý: <strong>Nhật N5 hoặc Hàn TOPIK 1</strong></p>
              <p class="purpose-detail">Thuộc lòng từ vựng giao tiếp thực tế và ngữ pháp trọng tâm để vượt qua kỳ thi chứng chỉ.</p>
              <ul class="purpose-bullets">
                <li>Bảng chữ cái Hiragana, Katakana, Hangul từ con số 0</li>
                <li>Ôn tập giãn cách 1-3-7 ngày chống quên từ vựng</li>
              </ul>
              <a href="/app/ngoai-ngu/ja" class="aw-pill ghost purpose-btn" data-goal="work-abroad">Học theo lộ trình xuất khẩu →</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 4: 6 Hand-Drawn Illustrated Postage-Stamp Cards (#mon-hoc) -->
      <section class="aw-sec sec-mon-hoc sec-surface-band" id="mon-hoc">
        <div class="aw-wrap">
          <div class="sec-head-split">
            <div>
              <span class="sec-chip">Chương trình học</span>
              <h2 class="sec-title">Sáu ngoại ngữ, mỗi môn một lộ trình.</h2>
            </div>
            <p class="sec-sub">Phân loại rõ ràng theo nhu cầu, chọn môn để bắt đầu học ngay.</p>
          </div>

          <div class="subject-group">
            <div class="subject-grid">
              <a href="/app/ngoai-ngu/en" class="subj-card spine-en" data-subj="en">
                <svg class="subj-sketch-landmark chibi-mascot-corner" viewBox="0 0 72 72" width="70" height="70" fill="none" aria-hidden="true">
                  <circle cx="20" cy="24" r="7" fill="#FDE68A" stroke="#4A3728" stroke-width="2.2"/><circle cx="52" cy="24" r="7" fill="#FDE68A" stroke="#4A3728" stroke-width="2.2"/>
                  <ellipse cx="36" cy="36" rx="20" ry="17" fill="#FDE68A" stroke="#4A3728" stroke-width="2.3"/>
                  <rect x="24" y="10" width="24" height="14" rx="7" fill="#4A3728"/>
                  <rect x="26" y="21" width="20" height="4" rx="2" fill="#FDE047"/>
                  <circle cx="29" cy="36" r="2.6" fill="#4A3728"/><circle cx="43" cy="36" r="2.6" fill="#4A3728"/>
                  <circle cx="28" cy="35" r=".9" fill="#fff"/><circle cx="42" cy="35" r=".9" fill="#fff"/>
                  <ellipse cx="23.5" cy="40.5" rx="3.2" ry="1.7" fill="#FDA4AF"/><ellipse cx="48.5" cy="40.5" rx="3.2" ry="1.7" fill="#FDA4AF"/>
                  <path d="M33 41q1.5 1.8 3 0 1.5 1.8 3 0" stroke="#4A3728" stroke-width="1.9" stroke-linecap="round"/>
                  <path d="M22 52c0-4 6-6 14-6s14 2 14 6v8H22z" fill="#BAE6FD" stroke="#4A3728" stroke-width="2.2"/>
                </svg>
                <div class="subj-card-head"><span class="subj-flag">${LANG_FLAG_SVG.en}</span><span class="subj-level">A1 → C1</span></div>
                <h4 class="subj-name">Tiếng Anh</h4>
                <p class="subj-desc">Giao tiếp hằng ngày, ngữ pháp thực hành, tiếng Anh công sở và luyện thi TOEIC.</p>
                <div class="subj-skills"><span>Từ vựng</span><span>Luyện nói</span><span>AI 30 ngành</span></div>
                <span class="subj-enter">Vào học →</span>
              </a>
              <a href="/app/ngoai-ngu/zh" class="subj-card spine-zh" data-subj="zh">
                <svg class="subj-sketch-landmark chibi-mascot-corner" viewBox="0 0 72 72" width="70" height="70" fill="none" aria-hidden="true">
                  <circle cx="20" cy="20" r="7.5" fill="#4A3728"/><circle cx="52" cy="20" r="7.5" fill="#4A3728"/>
                  <ellipse cx="36" cy="36" rx="20" ry="17" fill="#FFFDF9" stroke="#4A3728" stroke-width="2.3"/>
                  <ellipse cx="28" cy="35" rx="4.5" ry="5.5" transform="rotate(-15 28 35)" fill="#4A3728"/><ellipse cx="44" cy="35" rx="4.5" ry="5.5" transform="rotate(15 44 35)" fill="#4A3728"/>
                  <circle cx="28.5" cy="34.5" r="1.4" fill="#fff"/><circle cx="43.5" cy="34.5" r="1.4" fill="#fff"/>
                  <ellipse cx="22.5" cy="41.5" rx="3.2" ry="1.7" fill="#FDA4AF"/><ellipse cx="49.5" cy="41.5" rx="3.2" ry="1.7" fill="#FDA4AF"/>
                  <path d="M33 41q1.5 1.8 3 0 1.5 1.8 3 0" stroke="#4A3728" stroke-width="1.9" stroke-linecap="round"/>
                  <circle cx="54" cy="52" r="8" fill="#FCA5A5" stroke="#4A3728" stroke-width="2"/><path d="M54 42v2M54 60v3" stroke="#FDE047" stroke-width="2.4" stroke-linecap="round"/>
                </svg>
                <div class="subj-card-head"><span class="subj-flag">${LANG_FLAG_SVG.zh}</span><span class="subj-level">HSK 1 → 5</span></div>
                <h4 class="subj-name">Tiếng Trung</h4>
                <p class="subj-desc">Nhận diện chữ Hán, phát âm chuẩn Pinyin và đàm thoại đời sống.</p>
                <div class="subj-skills"><span>Chữ Hán</span><span>Pinyin</span><span>Hội thoại AI</span></div>
                <span class="subj-enter">Vào học →</span>
              </a>
              <a href="/app/ngoai-ngu/ja" class="subj-card spine-ja" data-subj="ja">
                <svg class="subj-sketch-landmark chibi-mascot-corner" viewBox="0 0 72 72" width="70" height="70" fill="none" aria-hidden="true">
                  <path d="M18 28 15 11l14 8M54 28l3-17-14 8" fill="#FFFDF9" stroke="#4A3728" stroke-width="2.3" stroke-linejoin="round"/>
                  <ellipse cx="36" cy="36" rx="20" ry="17" fill="#FFFDF9" stroke="#4A3728" stroke-width="2.3"/>
                  <circle cx="29" cy="35" r="2.6" fill="#4A3728"/><circle cx="43" cy="35" r="2.6" fill="#4A3728"/>
                  <circle cx="28" cy="34" r=".9" fill="#fff"/><circle cx="42" cy="34" r=".9" fill="#fff"/>
                  <ellipse cx="23.5" cy="40" rx="3.2" ry="1.7" fill="#FDA4AF"/><ellipse cx="48.5" cy="40" rx="3.2" ry="1.7" fill="#FDA4AF"/>
                  <path d="M33 40.5q1.5 1.8 3 0 1.5 1.8 3 0" stroke="#4A3728" stroke-width="1.9" stroke-linecap="round"/>
                  <rect x="24" y="51" width="24" height="6" rx="3" fill="#FCA5A5" stroke="#4A3728" stroke-width="2"/>
                  <circle cx="36" cy="58" r="4.5" fill="#FDE047" stroke="#4A3728" stroke-width="2"/>
                </svg>
                <div class="subj-card-head"><span class="subj-flag">${LANG_FLAG_SVG.ja}</span><span class="subj-level">JLPT N5 → N1</span></div>
                <h4 class="subj-name">Tiếng Nhật</h4>
                <p class="subj-desc">Bảng chữ cái, từ vựng, ngữ pháp N5 và phản xạ hội thoại.</p>
                <div class="subj-skills"><span>Kana &amp; Kanji</span><span>Phát âm 0.6x</span><span>Phỏng vấn</span></div>
                <span class="subj-enter">Vào học →</span>
              </a>
              <a href="/app/ngoai-ngu/ko" class="subj-card spine-ko" data-subj="ko">
                <svg class="subj-sketch-landmark chibi-mascot-corner" viewBox="0 0 72 72" width="70" height="70" fill="none" aria-hidden="true">
                  <ellipse cx="25" cy="17" rx="5.5" ry="12" transform="rotate(-10 25 17)" fill="#FBCFE8" stroke="#4A3728" stroke-width="2.2"/><ellipse cx="47" cy="17" rx="5.5" ry="12" transform="rotate(10 47 17)" fill="#FBCFE8" stroke="#4A3728" stroke-width="2.2"/>
                  <ellipse cx="36" cy="38" rx="20" ry="17" fill="#FFFDF9" stroke="#4A3728" stroke-width="2.3"/>
                  <circle cx="29" cy="37" r="2.6" fill="#4A3728"/><circle cx="43" cy="37" r="2.6" fill="#4A3728"/>
                  <circle cx="28" cy="36" r=".9" fill="#fff"/><circle cx="42" cy="36" r=".9" fill="#fff"/>
                  <ellipse cx="23.5" cy="42" rx="3.2" ry="1.7" fill="#FDA4AF"/><ellipse cx="48.5" cy="42" rx="3.2" ry="1.7" fill="#FDA4AF"/>
                  <path d="M33 42.5q1.5 1.8 3 0 1.5 1.8 3 0" stroke="#4A3728" stroke-width="1.9" stroke-linecap="round"/>
                  <path d="M36 59c-5-4-9-8-6-11 2-2 5 0 6 2 1-2 4-4 6-2 3 3-1 7-6 11Z" fill="#F472B6" stroke="#4A3728" stroke-width="1.9"/>
                </svg>
                <div class="subj-card-head"><span class="subj-flag">${LANG_FLAG_SVG.ko}</span><span class="subj-level">TOPIK 1 → 5</span></div>
                <h4 class="subj-name">Tiếng Hàn</h4>
                <p class="subj-desc">Chữ Hangul, cấu trúc câu căn bản và giao tiếp trong công việc.</p>
                <div class="subj-skills"><span>Hangul</span><span>Nối âm</span><span>Công sở</span></div>
                <span class="subj-enter">Vào học →</span>
              </a>
              <a href="/app/ngoai-ngu/fr" class="subj-card spine-fr" data-subj="fr">
                <svg class="subj-sketch-landmark chibi-mascot-corner" viewBox="0 0 72 72" width="70" height="70" fill="none" aria-hidden="true">
                  <path d="M18 28 15 11l14 8M54 28l3-17-14 8" fill="#DDD6FE" stroke="#4A3728" stroke-width="2.3" stroke-linejoin="round"/>
                  <ellipse cx="36" cy="38" rx="20" ry="17" fill="#FFFDF9" stroke="#4A3728" stroke-width="2.3"/>
                  <ellipse cx="38" cy="20" rx="16" ry="7" transform="rotate(8 38 20)" fill="#C4B5FD" stroke="#4A3728" stroke-width="2.2"/>
                  <circle cx="29" cy="37" r="2.6" fill="#4A3728"/><circle cx="43" cy="37" r="2.6" fill="#4A3728"/>
                  <circle cx="28" cy="36" r=".9" fill="#fff"/><circle cx="42" cy="36" r=".9" fill="#fff"/>
                  <ellipse cx="23.5" cy="42" rx="3.2" ry="1.7" fill="#FDA4AF"/><ellipse cx="48.5" cy="42" rx="3.2" ry="1.7" fill="#FDA4AF"/>
                  <path d="M33 42.5q1.5 1.8 3 0 1.5 1.8 3 0" stroke="#4A3728" stroke-width="1.9" stroke-linecap="round"/>
                  <path d="M24 55c5-6 19-6 24 0" fill="#FDBA74" stroke="#4A3728" stroke-width="2.1" stroke-linecap="round"/>
                </svg>
                <div class="subj-card-head"><span class="subj-flag">${LANG_FLAG_SVG.fr}</span><span class="subj-level">DELF A1 → B2</span></div>
                <h4 class="subj-name">Tiếng Pháp</h4>
                <p class="subj-desc">Phát âm chuẩn Pháp, chia động từ và các mẫu câu đối thoại thường nhật.</p>
                <div class="subj-skills"><span>Phát âm R Pháp</span><span>Ngữ pháp</span><span>Đối thoại</span></div>
                <span class="subj-enter">Vào học →</span>
              </a>
              <a href="/app/ngoai-ngu/es" class="subj-card spine-es" data-subj="es">
                <svg class="subj-sketch-landmark chibi-mascot-corner" viewBox="0 0 72 72" width="70" height="70" fill="none" aria-hidden="true">
                  <path d="M33 17c-2-5 3-7 5-3 2-4 7-2 4 3" fill="#FEF08A" stroke="#4A3728" stroke-width="2.1" stroke-linecap="round"/>
                  <ellipse cx="36" cy="37" rx="20" ry="18" fill="#FEF08A" stroke="#4A3728" stroke-width="2.3"/>
                  <circle cx="29" cy="35" r="2.6" fill="#4A3728"/><circle cx="43" cy="35" r="2.6" fill="#4A3728"/>
                  <circle cx="28" cy="34" r=".9" fill="#fff"/><circle cx="42" cy="34" r=".9" fill="#fff"/>
                  <ellipse cx="23.5" cy="40" rx="3.2" ry="1.7" fill="#FDA4AF"/><ellipse cx="48.5" cy="40" rx="3.2" ry="1.7" fill="#FDA4AF"/>
                  <path d="m33 39 3 4 3-4z" fill="#FB923C" stroke="#4A3728" stroke-width="1.8" stroke-linejoin="round"/>
                  <path d="m26 53 10 4 10-4v6l-10-4-10 4z" fill="#F472B6" stroke="#4A3728" stroke-width="1.8" stroke-linejoin="round"/>
                </svg>
                <div class="subj-card-head"><span class="subj-flag">${LANG_FLAG_SVG.es}</span><span class="subj-level">DELE A1 → C1</span></div>
                <h4 class="subj-name">Tiếng Tây Ban Nha</h4>
                <p class="subj-desc">Phân biệt ser/estar, chia động từ, phát âm chuẩn và giao tiếp hằng ngày.</p>
                <div class="subj-skills"><span>Ser / Estar</span><span>Âm RR</span><span>Giao tiếp</span></div>
                <span class="subj-enter">Vào học →</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 5: Dark Obsidian Connected 3-Step Timeline (#cach-hoc) -->
      <section class="aw-sec sec-dark-band sec-cach-hoc" id="cach-hoc">
        <div class="aw-wrap">
          <div class="sec-head-split dark">
            <div>
              <span class="sec-chip">Phương pháp ghi nhớ</span>
              <h2 class="sec-title">Học như nào? Chỉ 3 bước.</h2>
            </div>
            <p class="sec-sub">Phương pháp tinh gọn giúp bạn tiếp thu nhanh và giữ kiến thức trong trí nhớ dài hạn.</p>
          </div>
          <div class="steps-grid">
            <div class="step-card">
              <div class="step-top">
                <span class="step-badge">Bước 1</span>
                <span class="step-num" aria-hidden="true">01</span>
              </div>
              <div class="step-icon">
                <svg class="chibi-ic" viewBox="0 0 28 28" width="40" height="40" fill="none" aria-hidden="true">
                  <path d="M6.6 10.6 5.8 4.4l5 3.1M21.4 10.6l.8-6.2-5 3.1" fill="#FFFDF9" stroke="#4A3728" stroke-width="1.9" stroke-linejoin="round"/>
                  <rect x="5.4" y="6.8" width="17.2" height="14.2" rx="7.1" fill="#FFFDF9" stroke="#4A3728" stroke-width="2"/>
                  <circle cx="10.4" cy="13.4" r="1.45" fill="#4A3728"/><circle cx="17.6" cy="13.4" r="1.45" fill="#4A3728"/>
                  <circle cx="10" cy="12.9" r=".55" fill="#FFFDF9"/><circle cx="17.2" cy="12.9" r=".55" fill="#FFFDF9"/>
                  <ellipse cx="8.3" cy="15.3" rx="1.4" ry=".75" fill="#FDA4AF"/><ellipse cx="19.7" cy="15.3" rx="1.4" ry=".75" fill="#FDA4AF"/>
                  <path d="M12.5 15.2q.8.9 1.5 0 .7.9 1.5 0" stroke="#4A3728" stroke-width="1.4" stroke-linecap="round"/>
                  <rect x="8.2" y="19.2" width="11.6" height="6.4" rx="2" fill="#FEF08A" stroke="#4A3728" stroke-width="1.7"/>
                  <path d="M14 19.4v6" stroke="#4A3728" stroke-width="1.5"/>
                </svg>
              </div>
              <h3 class="step-title">Học lý thuyết ngắn 2 phút</h3>
              <p class="step-desc">Đọc nội dung chắt lọc, đi thẳng vào bản chất vấn đề kèm ví dụ trực quan dễ hiểu.</p>
              <div class="step-preview"><span>📖 Ngữ pháp + 2 ví dụ thực tế</span></div>
            </div>
            <div class="step-card">
              <div class="step-top">
                <span class="step-badge">Bước 2</span>
                <span class="step-num" aria-hidden="true">02</span>
              </div>
              <div class="step-icon step-icon-green">
                <svg class="chibi-ic" viewBox="0 0 28 28" width="40" height="40" fill="none" aria-hidden="true">
                  <circle cx="7.6" cy="7.4" r="3" fill="#FDE68A" stroke="#4A3728" stroke-width="1.9"/><circle cx="20.4" cy="7.4" r="3" fill="#FDE68A" stroke="#4A3728" stroke-width="1.9"/>
                  <rect x="5.4" y="6.8" width="17.2" height="14.2" rx="7.1" fill="#FDE68A" stroke="#4A3728" stroke-width="2"/>
                  <circle cx="10.4" cy="13.4" r="1.45" fill="#4A3728"/><circle cx="17.6" cy="13.4" r="1.45" fill="#4A3728"/>
                  <circle cx="10" cy="12.9" r=".55" fill="#FFFDF9"/><circle cx="17.2" cy="12.9" r=".55" fill="#FFFDF9"/>
                  <ellipse cx="8.3" cy="15.3" rx="1.4" ry=".75" fill="#FDA4AF"/><ellipse cx="19.7" cy="15.3" rx="1.4" ry=".75" fill="#FDA4AF"/>
                  <path d="M12.5 15.2q.8.9 1.5 0 .7.9 1.5 0" stroke="#4A3728" stroke-width="1.4" stroke-linecap="round"/>
                  <circle cx="20.2" cy="21" r="4.4" fill="#BBF7D0" stroke="#4A3728" stroke-width="1.6"/>
                  <path d="m18.2 21 1.4 1.5 2.7-2.8" stroke="#4A3728" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3 class="step-title">Làm bài, chấm ngay</h3>
              <p class="step-desc">Tự tay trả lời, luyện nói hoặc chọn đáp án, hệ thống chấm tự động và chỉ ra điểm sai để sửa ngay.</p>
              <div class="step-preview ok"><span>✓ Chấm từng từ · Giải thích chi tiết</span></div>
            </div>
            <div class="step-card step-card-featured">
              <div class="step-top">
                <span class="step-badge badge-gold">Bước 3 · Độc quyền</span>
                <span class="step-num" aria-hidden="true">03</span>
              </div>
              <div class="step-icon step-icon-yellow">
                <svg class="chibi-ic" viewBox="0 0 28 28" width="40" height="40" fill="none" aria-hidden="true">
                  <ellipse cx="9.2" cy="5.8" rx="2.6" ry="5" transform="rotate(-10 9.2 5.8)" fill="#FBCFE8" stroke="#4A3728" stroke-width="1.9"/><ellipse cx="18.8" cy="5.8" rx="2.6" ry="5" transform="rotate(10 18.8 5.8)" fill="#FBCFE8" stroke="#4A3728" stroke-width="1.9"/>
                  <rect x="5.4" y="6.8" width="17.2" height="14.2" rx="7.1" fill="#FFFDF9" stroke="#4A3728" stroke-width="2"/>
                  <circle cx="10.4" cy="13.4" r="1.45" fill="#4A3728"/><circle cx="17.6" cy="13.4" r="1.45" fill="#4A3728"/>
                  <circle cx="10" cy="12.9" r=".55" fill="#FFFDF9"/><circle cx="17.2" cy="12.9" r=".55" fill="#FFFDF9"/>
                  <ellipse cx="8.3" cy="15.3" rx="1.4" ry=".75" fill="#FDA4AF"/><ellipse cx="19.7" cy="15.3" rx="1.4" ry=".75" fill="#FDA4AF"/>
                  <path d="M12.5 15.2q.8.9 1.5 0 .7.9 1.5 0" stroke="#4A3728" stroke-width="1.4" stroke-linecap="round"/>
                  <circle cx="20.2" cy="21" r="4.3" fill="#FEF08A" stroke="#4A3728" stroke-width="1.6"/>
                  <path d="M20.2 18.8v2.4l1.6 1" stroke="#4A3728" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <h3 class="step-title">Ôn tập giãn cách, không quên</h3>
              <p class="step-desc">Thuật toán hẹn giờ nhắc bạn làm lại những câu hay sai sau 1, 3 và 7 ngày để nhớ mãi.</p>
              <div class="step-srs-pills" aria-hidden="true"><span>Ngày 1</span><span>→</span><span>Ngày 3</span><span>→</span><span>Ngày 7</span></div>
            </div>
          </div>
          <div class="dark-steps-foot">
            <p class="streak-text">✨ Mỗi ngày 1 bài ngắn là đủ để giữ chuỗi ngày học.</p>
            <a href="#demoBox" class="aw-pill hero-btn-primary" data-scroll-to="#demoBox">Bắt đầu bài học 2 phút đầu tiên →</a>
          </div>
        </div>
      </section>

      <!-- Section 6b: Stories (#cau-chuyen) -->
      <section class="aw-sec sec-surface-band sec-cau-chuyen" id="cau-chuyen" hidden>
        <div class="aw-wrap">
          <div class="sec-head-split">
            <div>
              <span class="sec-chip">Góc trải nghiệm</span>
              <h2 class="sec-title">Người như bạn cũng học được.</h2>
            </div>
            <p class="sec-sub">Chọn lộ trình cho người giống bạn - Học từng bước nhỏ mỗi ngày cùng LifeRivo.</p>
          </div>
          <p class="stories-note" id="storiesNote">Các câu chuyện này là minh họa, chưa phải đánh giá thật của học viên.</p>
          <div class="stories-grid">
            <div class="story-card">
              <span class="sketch-tape tape-sm" aria-hidden="true"></span>
              <div class="story-header">
                <div class="story-avatar av1" aria-hidden="true"><svg class="chibi-ic" viewBox="0 0 36 36" width="36" height="36" fill="none"><circle cx="18" cy="18" r="10.5" fill="#FFF7EB" stroke="#4A3728" stroke-width="2"/><path d="M8.5 14c2.5-5 16.5-5 19 0-3-1-16-1-19 0z" fill="#4A3728"/><path d="M9 10l9-4 9 4-9 4z" fill="#FDE047" stroke="#4A3728" stroke-width="1.7" stroke-linejoin="round"/><circle cx="14.2" cy="18.2" r="1.4" fill="#4A3728"/><circle cx="21.8" cy="18.2" r="1.4" fill="#4A3728"/><circle cx="13.7" cy="17.7" r=".55" fill="#fff"/><circle cx="21.3" cy="17.7" r=".55" fill="#fff"/><ellipse cx="12" cy="20.5" rx="1.6" ry=".85" fill="#FDA4AF"/><ellipse cx="24" cy="20.5" rx="1.6" ry=".85" fill="#FDA4AF"/><path d="M16.2 21q1.8 1.5 3.6 0" stroke="#4A3728" stroke-width="1.5" stroke-linecap="round"/><path d="M10.5 32c1.2-3.5 4.2-5 7.5-5s6.3 1.5 7.5 5z" fill="#BAE6FD" stroke="#4A3728" stroke-width="1.8"/></svg></div>
                <div class="story-meta">
                  <h3 class="story-name">An, học sinh lớp 11 ở Phú Yên</h3>
                  <span class="story-tag">Khóa học: Tiếng Anh A1</span>
                </div>
              </div>
              <p class="story-goal"><strong>Mục tiêu:</strong> <span>Sau 30 ngày tự tin giới thiệu bản thân bằng tiếng Anh</span></p>
              <blockquote class="story-quote">
                "Mình muốn sau 30 ngày tự tin giới thiệu bản thân bằng tiếng Anh."
              </blockquote>
            </div>
            <div class="story-card">
              <span class="sketch-tape tape-sm" aria-hidden="true"></span>
              <div class="story-header">
                <div class="story-avatar av2" aria-hidden="true"><svg class="chibi-ic" viewBox="0 0 36 36" width="36" height="36" fill="none"><path d="M7.5 18a10.5 10.5 0 0 1 21 0" stroke="#F472B6" stroke-width="3" stroke-linecap="round"/><rect x="5" y="15" width="4" height="7" rx="2" fill="#FBCFE8" stroke="#4A3728" stroke-width="1.6"/><rect x="27" y="15" width="4" height="7" rx="2" fill="#FBCFE8" stroke="#4A3728" stroke-width="1.6"/><circle cx="18" cy="18" r="10" fill="#FFF7EB" stroke="#4A3728" stroke-width="2"/><circle cx="14.2" cy="18.2" r="1.4" fill="#4A3728"/><circle cx="21.8" cy="18.2" r="1.4" fill="#4A3728"/><circle cx="13.7" cy="17.7" r=".55" fill="#fff"/><circle cx="21.3" cy="17.7" r=".55" fill="#fff"/><ellipse cx="12" cy="20.5" rx="1.6" ry=".85" fill="#FDA4AF"/><ellipse cx="24" cy="20.5" rx="1.6" ry=".85" fill="#FDA4AF"/><path d="M16.2 21q1.8 1.5 3.6 0" stroke="#4A3728" stroke-width="1.5" stroke-linecap="round"/><path d="M10.5 32c1.2-3.5 4.2-5 7.5-5s6.3 1.5 7.5 5z" fill="#FBCFE8" stroke="#4A3728" stroke-width="1.8"/></svg></div>
                <div class="story-meta">
                  <h3 class="story-name">Mai, sinh viên năm 2</h3>
                  <span class="story-tag">Khóa học: Tiếng Anh giao tiếp &amp; AI</span>
                </div>
              </div>
              <p class="story-goal"><strong>Mục tiêu:</strong> <span>Luyện nói với AI mỗi tối 10 phút để phỏng vấn thực tập</span></p>
              <blockquote class="story-quote">
                "Mình muốn luyện nói với AI mỗi tối 10 phút để phỏng vấn thực tập."
              </blockquote>
            </div>
            <div class="story-card">
              <span class="sketch-tape tape-sm" aria-hidden="true"></span>
              <div class="story-header">
                <div class="story-avatar av3" aria-hidden="true"><svg class="chibi-ic" viewBox="0 0 36 36" width="36" height="36" fill="none"><path d="M9 14 7.5 6.5 14 10M27 14 28.5 6.5 22 10" fill="#FED7AA" stroke="#4A3728" stroke-width="1.9" stroke-linejoin="round"/><ellipse cx="18" cy="19" rx="10" ry="9" fill="#FED7AA" stroke="#4A3728" stroke-width="2"/><ellipse cx="18" cy="21" rx="7" ry="5.5" fill="#FFFDF9"/><circle cx="14.2" cy="18.2" r="1.4" fill="#4A3728"/><circle cx="21.8" cy="18.2" r="1.4" fill="#4A3728"/><circle cx="13.7" cy="17.7" r=".55" fill="#fff"/><circle cx="21.3" cy="17.7" r=".55" fill="#fff"/><ellipse cx="11.6" cy="20.4" rx="1.5" ry=".8" fill="#FDA4AF"/><ellipse cx="24.4" cy="20.4" rx="1.5" ry=".8" fill="#FDA4AF"/><path d="M16 21q1 1.1 2 0 1 1.1 2 0" stroke="#4A3728" stroke-width="1.4" stroke-linecap="round"/><rect x="11" y="26.5" width="14" height="4.5" rx="2" fill="#F9A8D4" stroke="#4A3728" stroke-width="1.6"/></svg></div>
                <div class="story-meta">
                  <h3 class="story-name">Hùng, muốn đi Nhật</h3>
                  <span class="story-tag">Khóa học: Tiếng Nhật N5</span>
                </div>
              </div>
              <p class="story-goal"><strong>Mục tiêu:</strong> <span>Sau 3 tháng thuộc 100 từ N5</span></p>
              <blockquote class="story-quote">
                "Mình muốn sau 3 tháng thuộc 100 từ N5."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing Split Matrix (#link-gia) -->
      <section class="aw-sec aw-wrap sec-link-gia" id="link-gia">
        <div class="aw-link-box pricing-split">
          <div class="pricing-split-intro">
            <span class="sec-chip">Minh bạch chi phí</span>
            <h2 class="aw-link-lead">Học miễn phí, nâng cấp khi cần</h2>
            <p class="pricing-banner-sub">Toàn bộ giáo trình 6 ngoại ngữ đều miễn phí. Nâng cấp Pro khi muốn luyện phỏng vấn AI chuyên sâu không giới hạn.</p>
            <p class="aw-link-sub"><a class="aw-pill dark lg" href="/${currentLang()}/pricing">Xem bảng giá →</a></p>
          </div>
          <div class="pricing-compare-mini">
            <div class="pcm-col">
              <span class="pcm-tier">Nền tảng</span>
              <b>Free · 0đ</b>
              <span>6 ngoại ngữ · 3 lượt AI/ngày · Chứng nhận nền tảng</span>
            </div>
            <div class="pcm-col pro">
              <span class="pcm-tier">Nâng cao</span>
              <b>Pro ✨</b>
              <span>100 lượt AI/ngày · Phỏng vấn AI 30 ngành · Báo cáo chi tiết</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 7: Sticky Split FAQ (#hoi-dap) -->
      <section class="aw-sec aw-wrap sec-hoi-dap" id="hoi-dap">
        <div class="faq-split-layout">
          <div class="faq-split-aside">
            <span class="sec-chip">Giải đáp thắc mắc</span>
            <h2 class="sec-title">Hỏi đáp</h2>
            <p class="sec-sub">Những thắc mắc phổ biến nhất của người mới bắt đầu học.</p>
            <a href="mailto:study@liferivo.com" class="faq-support-link">Cần hỗ trợ thêm? Email study@liferivo.com →</a>
            <svg class="faq-sketch-doodle chibi-ic" viewBox="0 0 120 88" width="116" height="84" fill="none" aria-hidden="true">
              <path d="M28 24 22 9l15 9M62 24 68 9 53 18" fill="#FEF08A" stroke="#4A3728" stroke-width="2.4" stroke-linejoin="round"/>
              <ellipse cx="45" cy="42" rx="22" ry="18" fill="#FEF08A" stroke="#4A3728" stroke-width="2.4"/>
              <circle cx="36.5" cy="41" r="6" fill="#FFFDF9" stroke="#4A3728" stroke-width="2"/>
              <circle cx="53.5" cy="41" r="6" fill="#FFFDF9" stroke="#4A3728" stroke-width="2"/>
              <line x1="42.5" y1="41" x2="47.5" y2="41" stroke="#4A3728" stroke-width="2"/>
              <circle cx="36.5" cy="41" r="2.2" fill="#4A3728"/><circle cx="53.5" cy="41" r="2.2" fill="#4A3728"/>
              <ellipse cx="29" cy="48" rx="3" ry="1.6" fill="#FDA4AF"/><ellipse cx="61" cy="48" rx="3" ry="1.6" fill="#FDA4AF"/>
              <path d="m42 47 3 3 3-3" fill="#FB923C" stroke="#4A3728" stroke-width="1.7" stroke-linejoin="round"/>
              <ellipse cx="45" cy="67" rx="14" ry="10" fill="#BAE6FD" stroke="#4A3728" stroke-width="2.2"/>
              <circle cx="92" cy="24" r="14" fill="#FCE7F3" stroke="#4A3728" stroke-width="2.2"/>
              <path d="M88 21c0-3 8-3 8 1 0 2.5-4 3-4 5.5M92 31v.8" stroke="#4A3728" stroke-width="2.4" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="faq-list aw-faq">
            <details class="faq-item">
              <summary class="faq-summary">Có miễn phí không?</summary>
              <div class="faq-answer">
                <p>Tạo tài khoản và học miễn phí toàn bộ nội dung 6 ngoại ngữ, cùng bài kiểm tra và chứng nhận. Chỉ trợ lý AI và phỏng vấn AI là tính năng Pro: gói Free có 3 lượt hỏi AI mỗi ngày và 1 buổi phỏng vấn AI miễn phí; gói Pro có 100 lượt hỏi AI mỗi ngày, phỏng vấn AI không giới hạn và báo cáo học tập chi tiết.</p>
              </div>
            </details>
            <details class="faq-item">
              <summary class="faq-summary">Bắt đầu như thế nào?</summary>
              <div class="faq-answer">
                <p>Tạo tài khoản, chọn một môn và bắt đầu từ bài đầu tiên. Đổi môn được bất cứ lúc nào, tiến độ từng môn lưu riêng.</p>
              </div>
            </details>
            <details class="faq-item">
              <summary class="faq-summary">Dùng điện thoại được không?</summary>
              <div class="faq-answer">
                <p>Được. Nền tảng tương thích hoàn toàn với trình duyệt trên điện thoại và máy tính bảng mà không cần cài đặt ứng dụng.</p>
              </div>
            </details>
            <details class="faq-item">
              <summary class="faq-summary">Mỗi ngày học bao lâu?</summary>
              <div class="faq-answer">
                <p>Một bài ngắn mỗi ngày là đủ để giữ chuỗi ngày học. Mỗi bài thường chỉ mất vài phút.</p>
              </div>
            </details>
            <details class="faq-item">
              <summary class="faq-summary">Mất gốc bắt đầu từ đâu?</summary>
              <div class="faq-answer">
                <p>Mỗi môn bắt đầu từ bài đầu tiên của cấp thấp nhất, có lý thuyết ngắn trước mỗi bài.</p>
              </div>
            </details>
            <details class="faq-item">
              <summary class="faq-summary">Dữ liệu có an toàn không?</summary>
              <div class="faq-answer">
                <p>Mật khẩu được băm một chiều, không lưu mật khẩu gốc. Tiến độ học tập của bạn được lưu trữ an toàn. Chúng tôi dùng Google Analytics để thống kê lượt truy cập ẩn danh, không thu thập mật khẩu hay nội dung chat riêng tư.</p>
              </div>
            </details>
            <details class="faq-item">
              <summary class="faq-summary">Chứng nhận trên web có phải chứng chỉ quốc tế không?</summary>
              <div class="faq-answer">
                <p>Không. Đây là chứng nhận hoàn thành khóa học trên nền tảng LifeRivo, không phải chứng chỉ quốc tế.</p>
              </div>
            </details>
            <details class="faq-item">
              <summary class="faq-summary">Gói Pro gồm những gì?</summary>
              <div class="faq-answer">
                <p>Gói Pro mở thêm trợ lý AI 100 lượt hỏi mỗi ngày, phỏng vấn AI không giới hạn và báo cáo học tập chi tiết. Liên hệ để nâng cấp. Xem chi tiết tại <a href="/${currentLang()}/pricing">Bảng giá</a>.</p>
              </div>
            </details>
            <details class="faq-item">
              <summary class="faq-summary">Quên mật khẩu thì làm sao?</summary>
              <div class="faq-answer">
                <p>Bấm “Quên mật khẩu?” ở ô đăng nhập rồi nhập tên đăng nhập để gửi yêu cầu đặt lại mật khẩu.</p>
              </div>
            </details>
            <details class="faq-item">
              <summary class="faq-summary">Có cần tài khoản để học thử không?</summary>
              <div class="faq-answer">
                <p>Không. Mục “Chơi thử” trên trang chủ cho bạn làm thử câu hỏi ngoại ngữ ngay mà không cần đăng nhập. Muốn lưu tiến độ thì tạo tài khoản miễn phí.</p>
              </div>
            </details>
            <details class="faq-item">
              <summary class="faq-summary">Trợ lý AI giúp học như thế nào?</summary>
              <div class="faq-answer">
                <p>Trợ lý AI giải thích bài, gợi ý khi bạn bí và nhận xét câu trả lời của bạn. Tài khoản miễn phí có 3 lượt hỏi mỗi ngày; gói Pro có 100 lượt mỗi ngày, phỏng vấn AI không giới hạn và báo cáo học tập chi tiết.</p>
              </div>
            </details>
            <details class="faq-item">
              <summary class="faq-summary">Học ngoại ngữ có luyện nói không?</summary>
              <div class="faq-answer">
                <p>Có. Mỗi bài ngoại ngữ đều có phần Luyện nói để bạn tập nói vào micro và nghe lại giọng của mình.</p>
              </div>
            </details>
          </div>
        </div>
      </section>

      <!-- Section 8: Obsidian Indigo Final CTA (#chot-cuoi) -->
      <section class="aw-sec aw-wrap sec-chot-cuoi" id="chot-cuoi">
        <div class="cta-box text-center">
          <svg class="chibi-ic" style="margin:0 auto 10px" viewBox="0 0 110 72" width="104" height="68" fill="none" aria-hidden="true">
            <path d="M36 28 31 10l14 9M74 28l5-18-14 9" fill="#FFFDF9" stroke="#4A3728" stroke-width="2.4" stroke-linejoin="round"/>
            <ellipse cx="55" cy="39" rx="24" ry="20" fill="#FFFDF9" stroke="#4A3728" stroke-width="2.4"/>
            <circle cx="46" cy="37" r="3.4" fill="#4A3728"/><circle cx="64" cy="37" r="3.4" fill="#4A3728"/>
            <circle cx="44.8" cy="35.6" r="1.3" fill="#fff"/><circle cx="62.8" cy="35.6" r="1.3" fill="#fff"/>
            <ellipse cx="39" cy="43" rx="3.8" ry="2" fill="#FDA4AF"/><ellipse cx="71" cy="43" rx="3.8" ry="2" fill="#FDA4AF"/>
            <path d="M51 43q2 2.4 4 0 2 2.4 4 0" stroke="#4A3728" stroke-width="2" stroke-linecap="round"/>
            <circle cx="20" cy="40" r="8" fill="#FDE047" stroke="#4A3728" stroke-width="2.2"/>
            <circle cx="90" cy="40" r="8" fill="#F9A8D4" stroke="#4A3728" stroke-width="2.2"/>
          </svg>
          <span class="cta-badge">Bắt đầu hành trình</span>
          <h2 class="cta-title">Sẵn sàng bắt đầu?</h2>
          <p class="cta-sub">Tạo tài khoản, chọn môn, vào học ngay. Miễn phí cấp cơ bản.</p>
          <div class="cta-actions">
            <button type="button" class="aw-pill hero-btn-primary lg cta-register-btn" data-auth="register">
              Tạo tài khoản miễn phí
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- Clean Multi-Column Obsidian Footer (#lpFoot) -->
    <footer class="aw-foot lp-footer site-footer" id="lpFoot">
      <div class="aw-wrap footer-grid">
        <div class="aw-foot-l footer-info">
          <p class="footer-brand"><strong>${esc(siteName())} · Life in Motion</strong></p>
          <p class="dim footer-tagline">${esc(currentLang() === "en" ? (cfg("footerTextEn") || "A platform for learning foreign languages.") : (cfg("footerText") || "Nền tảng học ngoại ngữ bằng tiếng Việt."))}</p>
          <p class="dim footer-note">Chứng nhận trên nền tảng không phải chứng chỉ quốc tế.</p>
          <div class="clean-contacts footer-contact">
            <span>Liên hệ:</span>
            <a href="mailto:study@liferivo.com">study@liferivo.com</a>
          </div>
          <div class="footer-social">
            <a class="footer-social-btn" href="https://www.facebook.com/Try.To.Wins" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a class="footer-social-btn" href="https://www.threads.com/@alonewolfvn_" target="_blank" rel="noopener noreferrer">Threads</a>
          </div>
        </div>
        <nav class="aw-foot-nav footer-col footer-nav" aria-label="Pháp lý">
          <h4>Pháp lý</h4>
          ${[["terms", "Điều khoản sử dụng"], ["privacy", "Chính sách bảo mật"], ["payment", "Chính sách thanh toán"], ["refund", "Chính sách hoàn tiền"], ["membership", "Quy định gói thành viên"]].filter(([k]) => !(cfg("hiddenFooterLinks", []) || []).includes(k)).map(([k, l]) => `<a href="/${currentLang()}/${k}">${l}</a>`).join("")}
        </nav>
      </div>
      <div class="aw-wrap footer-bottom">
        <p class="dim footer-copy">© 2026 ${esc(siteName())}. All rights reserved.</p>
      </div>
    </footer>
  </div>`;
}

// ── In-place SSR Hydration & Client Boot Architecture ────────────────────────
let _ssrLandingHtml = "";
if (typeof document !== "undefined") {
  const existingLanding = document.getElementById("landingPage") || document.getElementById("demoBox");
  if (existingLanding) {
    const rootEl = document.getElementById("root");
    if (rootEl) {
      _ssrLandingHtml = rootEl.innerHTML;
    }
  }
}

/**
 * Hydrates all interactive behaviors in-place on existing pre-rendered SSR markup.
 * @param {HTMLElement} root
 * @param {Function} onAuthed
 */
export function hydrateLanding(root = document, onAuthed = null) {
  if (onAuthed) authedCb = onAuthed;
  // SSR HTML cung VI class="on" — dong bo lai nut theo ngon ngu hien tai
  syncLangSwitchUI();
  // SSR footer cung /vi/ (server khong doc duoc localStorage) — viet lai theo ngon ngu hien tai
  {
    const _lang = currentLang();
    const _hiddenFoot = new Set(cfg("hiddenFooterLinks", []) || []);
    root.querySelectorAll(".aw-foot-nav a[href], .aw-faq a[href], .aw-nav a[href], .mobile-drawer a[href], #link-gia a[href]").forEach((a) => {
      const m = a.getAttribute("href").match(/^\/(vi|en)\/(terms|privacy|payment|refund|membership|pricing)$/);
      if (!m) return;
      if (_hiddenFoot.has(m[2])) { a.remove(); return; }
      a.setAttribute("href", `/${_lang}/${m[2]}`);
    });
  }

  // 0. Mega-menu & Mobile navigation drawer
  {
    const dds = [...root.querySelectorAll(".nav-dd")];
    const closeAllDd = (except = null) => {
      dds.forEach((dd) => {
        if (dd === except) return;
        const btn = dd.querySelector(".nav-dd-trigger");
        const panel = dd.querySelector(".nav-dd-panel");
        dd.classList.remove("open");
        if (btn) btn.setAttribute("aria-expanded", "false");
        if (panel) panel.hidden = true;
      });
    };
    dds.forEach((dd) => {
      const btn = dd.querySelector(".nav-dd-trigger");
      const panel = dd.querySelector(".nav-dd-panel");
      if (!btn || !panel || btn.dataset.menuBound) return;
      btn.dataset.menuBound = "1";
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const willOpen = panel.hidden;
        closeAllDd(willOpen ? dd : null);
        dd.classList.toggle("open", willOpen);
        btn.setAttribute("aria-expanded", String(willOpen));
        panel.hidden = !willOpen;
      });
      panel.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          const s = link.dataset.subj;
          if (s) { try { localStorage.setItem("pl:subject", s); } catch {} }
          closeAllDd();
        });
      });
    });

    const mBtn = root.querySelector("#mobileMenuBtn");
    const mDrawer = root.querySelector("#mobileDrawer");
    const closeDrawer = () => {
      if (!mBtn || !mDrawer) return;
      mDrawer.hidden = true;
      mBtn.classList.remove("open");
      mBtn.setAttribute("aria-expanded", "false");
    };
    if (mBtn && mDrawer && !mBtn.dataset.drawerBound) {
      mBtn.dataset.drawerBound = "1";
      mBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const willOpen = mDrawer.hidden;
        closeAllDd();
        mDrawer.hidden = !willOpen;
        mBtn.classList.toggle("open", willOpen);
        mBtn.setAttribute("aria-expanded", String(willOpen));
      });
      mDrawer.querySelectorAll("a, button").forEach((el) => {
        el.addEventListener("click", () => {
          const s = el.dataset.subj;
          if (s) { try { localStorage.setItem("pl:subject", s); } catch {} }
          closeDrawer();
        });
      });
    }
    if (!document.body.dataset.lpMenuOutsideBound) {
      document.body.dataset.lpMenuOutsideBound = "1";
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".nav-dd")) {
          document.querySelectorAll(".nav-dd.open").forEach((dd) => {
            dd.classList.remove("open");
            dd.querySelector(".nav-dd-trigger")?.setAttribute("aria-expanded", "false");
            const p = dd.querySelector(".nav-dd-panel");
            if (p) p.hidden = true;
          });
        }
        if (!e.target.closest("#lpTop")) {
          const b = document.getElementById("mobileMenuBtn");
          const d = document.getElementById("mobileDrawer");
          if (b && d && !d.hidden) {
            d.hidden = true;
            b.classList.remove("open");
            b.setAttribute("aria-expanded", "false");
          }
        }
      });
      // Cuộn trang (kể cả khung cuộn bên trong) thì tự đóng các menu thả xuống của thanh trên,
      // để menu "Khóa học" / "Đồ nghề AI" không còn nằm lơ lửng trên nội dung khi đã cuộn đi.
      const closeOpenDropdowns = () => {
        document.querySelectorAll(".nav-dd.open").forEach((dd) => {
          dd.classList.remove("open");
          dd.querySelector(".nav-dd-trigger")?.setAttribute("aria-expanded", "false");
          const p = dd.querySelector(".nav-dd-panel");
          if (p) p.hidden = true;
        });
      };
      document.addEventListener("scroll", closeOpenDropdowns, { capture: true, passive: true });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          document.querySelectorAll(".nav-dd.open").forEach((dd) => {
            dd.classList.remove("open");
            dd.querySelector(".nav-dd-trigger")?.setAttribute("aria-expanded", "false");
            const p = dd.querySelector(".nav-dd-panel");
            if (p) p.hidden = true;
          });
          const b = document.getElementById("mobileMenuBtn");
          const d = document.getElementById("mobileDrawer");
          if (b && d && !d.hidden) {
            d.hidden = true;
            b.classList.remove("open");
            b.setAttribute("aria-expanded", "false");
          }
        }
      });
    }
  }

  // 1. Header auth buttons
  root.querySelectorAll(".aw-top [data-auth], #lpTop [data-auth]").forEach((b) => {
    if (b.dataset.bound) return;
    b.dataset.bound = "1";
    b.addEventListener("click", () => {
      if (b.dataset.auth === "register") trackFunnel("register_click");
      openAuth(b.dataset.auth, onAuthed);
    });
  });

  // 1b. Thu gon nut Dang ky o header: cham vao cum nut thi bung/thu (thiet bi cam ung).
  // Desktop dung :hover/:focus-within bang CSS. Chi chan cu cham dau tien khi cum
  // dang thu gon (de bung nut Dang ky ra); cham lan 2 thi nut chay binh thuong.
  // Nut VI/EN khong bi chan de doi ngon ngu van chay ngay.
  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(hover: none)").matches) {
    root.querySelectorAll(".aw-auth").forEach((box) => {
      if (box.dataset.collapseBound) return;
      box.dataset.collapseBound = "1";
      box.addEventListener("click", (e) => {
        if (box.classList.contains("is-open")) return;
        if (e.target.closest(".lang-switch")) return;
        e.preventDefault();
        e.stopPropagation();
        box.classList.add("is-open");
      }, true);
    });
    if (!document.body.dataset.authCollapseBound) {
      document.body.dataset.authCollapseBound = "1";
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".aw-auth")) {
          document.querySelectorAll(".aw-auth.is-open").forEach((b) => b.classList.remove("is-open"));
        }
      });
    }
  }

  // 2. Smooth scrolling for internal anchor links
  root.querySelectorAll('a[href^="#"], [data-scroll-to], [data-scroll]').forEach((a) => {
    if (a.dataset.scrollBound) return;
    a.dataset.scrollBound = "1";
    a.addEventListener("click", (e) => {
      const targetSelector = a.dataset.scrollTo || a.getAttribute("href");
      // Chỉ cuộn tới phần trên trang (#mon-hoc…); địa chỉ trong app (#/ngoai-ngu…) để trình duyệt tự đổi
      if (targetSelector && /^#[A-Za-z][\w-]*$/.test(targetSelector)) {
        const targetEl = document.querySelector(targetSelector);
        if (targetEl) {
          e.preventDefault();
          smoothScrollTo(targetEl);
          if (window.history && history.pushState) {
            history.pushState(null, "", targetSelector);
          } else {
            setAppHash(targetSelector);
          }
        }
      }
    });
  });

  // 3. Section 1: Hero Rotator & CTA
  initHero(root);

  // 4. Section 2: demo bài luyện
  hydrateSection2Demo(root);

  // 4b. Section 3 & Section 4: Auto-select subject on roadmap / subject card click
  const goalSubjectMap = { student: "en", intern: "en", "work-abroad": "ja" };
  root.querySelectorAll(".purpose-card").forEach((card) => {
    if (card.dataset.bound) return;
    card.dataset.bound = "1";
    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      const btn = card.querySelector(".purpose-btn[data-goal]");
      const goal = btn ? btn.dataset.goal : "";
      const subj = goalSubjectMap[goal] || "en";
      try { localStorage.setItem("pl:subject", subj); } catch {}
      if (!e.target.closest("a") && btn && btn.getAttribute("href")) {
        setAppHash(btn.getAttribute("href"));
      }
    });
  });
  root.querySelectorAll(".subj-card[data-subj]").forEach((card) => {
    if (card.dataset.bound) return;
    card.dataset.bound = "1";
    card.addEventListener("click", () => {
      try { localStorage.setItem("pl:subject", card.dataset.subj); } catch {}
    });
  });

  // 5. Section 8: Final Conversion CTA
  const s8Btn = root.querySelector("#chot-cuoi .cta-register-btn")
    || root.querySelector('#chot-cuoi [data-auth="register"]');
  if (s8Btn && !s8Btn.dataset.bound) {
    s8Btn.dataset.bound = "1";
    s8Btn.addEventListener("click", () => {
      trackFunnel("register_click");
      openAuth("register", onAuthed);
    });
  }

  // 6. Header sticky shadow on scroll
  const top = root.querySelector("#lpTop");
  if (top && !top.dataset.bound) {
    top.dataset.bound = "1";
    window.addEventListener("scroll", () => top.classList.toggle("scrolled", window.scrollY > 8), { passive: true });
  }

  // 7. Language switch handler
  bindLangSwitch(root, () => { loadPublic(root, true); demoRefreshFn?.(); mountMobileLanding(root, onAuthed, true); });

  // 7b. Dedicated Mobile Logged-out Homepage (<= 760px)
  mountMobileLanding(root, onAuthed);

  // 8. Hash routing triggers
  if (appHash() === "/app/dang-nhap") openAuth("login", onAuthed);
  if (appHash() === "/app/dang-ky") openAuth("register", onAuthed);
  // Khach vao thang bang link sau (#/bang-gia tu /vi/pricing, bookmark...): hashchange khong chay
  // luc tai trang nen xu ly hash ban dau tai day — giu dich, mo hop tao tai khoan; dang ky xong
  // app tu vao dung trang do (qua pl:after-auth trong enterApp). Giong handler hashchange o main.js.
  if (/^\/app\/[a-z]/.test(appHash()) && !/^\/app\/(dang|dat-lai-mat-khau)/.test(appHash())) {
    try { sessionStorage.setItem("pl:after-auth", appHash()); } catch {}
    history.replaceState(null, "", location.pathname + location.search);
    openAuth("register", onAuthed);
  }
  if (/^#[a-z][\w-]*$/.test(appHash())) {
    const id = appHash();
    setTimeout(() => smoothScrollTo(document.querySelector(id)), 260);
  }

  // 9. Load public metrics & animations
  loadPublic(root);
  initFx(root);
}

/**
 * Dedicated mobile-first logged-out homepage rendered inside #landingPage.
 * Hidden on desktop (> 760px) via CSS; gives mobile visitors a focused,
 * self-contained white + sky-blue + Chibi overview with live mini-quiz & dock.
 */
function mountMobileLanding(root = document, onAuthed, force = false) {
  const lp = root.querySelector("#landingPage") || document.getElementById("landingPage");
  if (!lp) return;
  let box = lp.querySelector("#lpMobileHome");
  if (box && !force) return;
  const en = currentLang() === "en";
  const langs = [
    { id: "en", name: en ? "English" : "Tiếng Anh", lvl: "CEFR A1–C1", kit: "owl", tone: "is-sky", idx: 0 },
    { id: "zh", name: en ? "Chinese" : "Tiếng Trung", lvl: "HSK 1–6", kit: "dragon", tone: "is-peach", idx: 1 },
    { id: "ja", name: en ? "Japanese" : "Tiếng Nhật", lvl: "JLPT N5–N1", kit: "cat", tone: "is-pink", idx: 2 },
    { id: "ko", name: en ? "Korean" : "Tiếng Hàn", lvl: "TOPIK 1–6", kit: "fox", tone: "is-lavender", idx: 3 },
    { id: "fr", name: en ? "French" : "Tiếng Pháp", lvl: "DELF A1–C1", kit: "bunny", tone: "is-mint", idx: 4 },
    { id: "es", name: en ? "Spanish" : "Tây Ban Nha", lvl: "DELE A1–C1", kit: "frog", tone: "is-gold", idx: 5 },
  ];
  const dockSvg = {
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c.7 4 2.8 6.1 6.8 6.8-4 .7-6.1 2.8-6.8 6.8-.7-4-2.8-6.1-6.8-6.8 4-.7 6.1-2.8 6.8-6.8z"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 16.8 6.2 19.9l1.1-6.5L2.6 8.8l6.5-.9z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    brief: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  };
  const html = `
    <div class="lp-m-home" id="lpMobileHome">
      <section class="lp-m-hero">
        <div class="lp-m-hero-pill">${en ? "6 LANGUAGES · AI SPEAKING COACH" : "6 NGOẠI NGỮ · CHẤM PHÁT ÂM AI"}</div>
        <div class="lp-m-hero-body">
          <div class="lp-m-hero-copy">
            <h1>${en ? "Speak foreign languages with confidence." : "Học ngoại ngữ tự tin giao tiếp mỗi ngày."}</h1>
            <p>${en ? "5-minute lessons, instant AI pronunciation scoring, and smart SRS review." : "Bài học ngắn 5 phút, AI chấm phát âm từng từ và nhắc ôn thông minh."}</p>
          </div>
          <img class="lp-m-hero-art" src="/img/chibi/hero-tutor.webp" alt="LifeRivo Tutor" width="96" height="96" loading="eager" decoding="sync" />
        </div>
        <div class="lp-m-hero-actions">
          <button type="button" class="lp-m-btn-primary" data-m-auth="register">${en ? "Start free now" : "Tạo tài khoản miễn phí"}</button>
          <a class="lp-m-btn-ghost" href="#lpMobileDemo">${en ? "Try 30s quiz" : "Chơi thử 30s →"}</a>
        </div>
      </section>

      <div class="lp-m-kpis" aria-label="${en ? "Key numbers" : "Điểm nổi bật"}">
        <div class="lp-m-kpi is-blue"><b>6</b><span>${en ? "Languages" : "Ngoại ngữ"}</span></div>
        <div class="lp-m-kpi is-green"><b>2.790+</b><span>${en ? "Exercises" : "Bài tập chấm"}</span></div>
        <div class="lp-m-kpi is-purple"><b>30+</b><span>${en ? "AI Interviews" : "Ngành AI"}</span></div>
      </div>

      <section class="lp-m-card" id="lpMobileDemo" aria-label="${en ? "Try a quick exercise" : "Thử bài học 30 giây"}">
        <div class="lp-m-sec-head">
          <h2>⚡ ${en ? "Try 30s interactive quiz" : "Chơi thử 30 giây không cần đăng ký"}</h2>
          <span class="lp-m-pill-tag">${en ? "Free" : "Miễn phí"}</span>
        </div>
        <div class="lp-m-demo-tabs" id="lpMDemoTabs" role="tablist">
          ${LANG_DEMOS.map((d, i) => `<button type="button" role="tab" class="lp-m-dtab${i === 0 ? " on" : ""}" data-mdemo="${i}" aria-selected="${i === 0}">${LANG_FLAG_SVG[d.code] || d.flag}<span>${esc(d.label.replace(/^Tiếng\s+/i, ""))}</span></button>`).join("")}
        </div>
        <div class="lp-m-demo-stage" id="lpMDemoStage"></div>
      </section>

      <section class="lp-m-sec" id="lpMobileLangs">
        <div class="lp-m-sec-head">
          <h2>🌍 ${en ? "Choose a language" : "Chọn ngoại ngữ muốn học"}</h2>
          <button type="button" class="lp-m-link-btn" data-m-auth="register">${en ? "Sign up →" : "Học ngay →"}</button>
        </div>
        <div class="lp-m-lang-grid">
          ${langs.map((l) => `
            <button type="button" class="lp-m-lang-card ${l.tone}" data-m-pick-lang="${l.id}" data-m-pick-idx="${l.idx}">
              <img src="/img/kit/chibi-${l.kit}.webp" alt="" width="44" height="44" loading="lazy" />
              <div>
                <div class="lp-m-lang-name">${LANG_FLAG_SVG[l.id] || ""}<b>${esc(l.name)}</b></div>
                <small>${esc(l.lvl)}</small>
              </div>
            </button>`).join("")}
        </div>
      </section>

      <section class="lp-m-sec">
        <div class="lp-m-sec-head">
          <h2>✨ ${en ? "Everything you need to progress" : "Công cụ học tập hiện đại"}</h2>
        </div>
        <div class="lp-m-feat-grid">
          <div class="lp-m-feat is-sky"><span class="lp-m-feat-ic">${dockSvg.mic}</span><b>${en ? "AI Speaking Score" : "Chấm phát âm AI"}</b><span>${en ? "Word-by-word feedback & 0.6x slow audio" : "Nghe chậm 0.6x & chấm từng từ"}</span></div>
          <div class="lp-m-feat is-lavender"><span class="lp-m-feat-ic">${dockSvg.chat}</span><b>${en ? "2-Way AI Roleplay" : "Hội thoại AI 2 chiều"}</b><span>${en ? "Real situations & instant grammar fixes" : "Nhập vai tình huống & sửa câu"}</span></div>
          <div class="lp-m-feat is-mint"><span class="lp-m-feat-ic">${dockSvg.clock}</span><b>${en ? "Smart SRS Review" : "Nhắc ôn SRS 1-3-7"}</b><span>${en ? "Never forget learned vocabulary" : "Nhắc đúng lúc trước khi quên từ"}</span></div>
          <div class="lp-m-feat is-peach"><span class="lp-m-feat-ic">${dockSvg.brief}</span><b>${en ? "TOEIC & Interviews" : "TOEIC & 30 ngành"}</b><span>${en ? "7 TOEIC Parts & job interview prep" : "7 Part TOEIC & phỏng vấn việc"}</span></div>
        </div>
      </section>

      <section class="lp-m-card lp-m-steps-card">
        <div class="lp-m-sec-head">
          <h2>🧭 ${en ? "4 steps from beginner" : "Lộ trình 4 bước từ con số 0"}</h2>
        </div>
        <ol class="lp-m-steps">
          <li><b>${en ? "Start with sounds" : "Làm quen bảng chữ cái & phát âm"}</b><span>${en ? "Listen at 0.6x speed and repeat clearly" : "Nghe giọng chuẩn chậm 0.6x và đọc lại từng âm"}</span></li>
          <li><b>${en ? "5-min word & grammar" : "Bài ngắn 5 phút mỗi ngày"}</b><span>${en ? "Short theory, instant auto-graded practice" : "Từ vựng, mẫu câu ngắn kèm chấm tự động"}</span></li>
          <li><b>${en ? "Speak with AI Coach" : "Luyện nói & hội thoại AI"}</b><span>${en ? "Practice dialogues and 30 career tracks" : "Trò chuyện AI & phỏng vấn 30 ngành nghề"}</span></li>
          <li><b>${en ? "SRS & Certificates" : "Ôn SRS & nhận chứng nhận"}</b><span>${en ? "Keep your streak and unlock rewards" : "Giữ chuỗi ngày học & đổi huy hiệu"}</span></li>
        </ol>
      </section>

      <section class="lp-m-cta-card">
        <div>
          <b>${en ? "Free forever for foundational courses" : "Miễn phí trọn đời cấp cơ bản"}</b>
          <p>${en ? "Create an account in 10 seconds to save your progress across all 6 languages." : "Tạo tài khoản trong 10 giây để lưu tiến độ học, bảng từ vựng và nhận cổ vũ mỗi ngày."}</p>
        </div>
        <div class="lp-m-cta-btns">
          <button type="button" class="lp-m-btn-primary" data-m-auth="register">${en ? "Create free account" : "Tạo tài khoản miễn phí"}</button>
          <button type="button" class="lp-m-btn-outline" data-m-auth="login">${en ? "Already have an account? Sign in" : "Đã có tài khoản? Đăng nhập"}</button>
        </div>
        <div class="lp-m-foot-links">
          <a href="/${en ? "en" : "vi"}/pricing">${en ? "Pricing Free vs Pro" : "Bảng giá Free vs Pro"}</a>
          <span>·</span>
          <a href="mailto:study@liferivo.com">study@liferivo.com</a>
        </div>
      </section>

      <nav class="lp-m-dock" aria-label="${en ? "Quick navigation" : "Điều hướng nhanh"}">
        <a href="#lpMobileLangs" class="lp-m-dock-it"><span class="lp-m-dock-ic">${dockSvg.globe}</span><span>${en ? "Courses" : "Ngoại ngữ"}</span></a>
        <a href="#lpMobileDemo" class="lp-m-dock-it"><span class="lp-m-dock-ic">${dockSvg.bolt}</span><span>${en ? "Try Quiz" : "Chơi thử"}</span></a>
        <button type="button" class="lp-m-dock-it is-center" data-m-auth="register"><span class="lp-m-dock-ic">${dockSvg.play}</span><span>${en ? "Start" : "Học ngay"}</span></button>
        <a href="/${en ? "en" : "vi"}/pricing" class="lp-m-dock-it"><span class="lp-m-dock-ic">${dockSvg.tag}</span><span>${en ? "Pricing" : "Bảng giá"}</span></a>
        <button type="button" class="lp-m-dock-it" data-m-auth="login"><span class="lp-m-dock-ic">${dockSvg.user}</span><span>${en ? "Sign in" : "Đăng nhập"}</span></button>
      </nav>
    </div>`;

  if (!box) {
    box = document.createElement("div");
    lp.appendChild(box);
    box.outerHTML = html;
    box = lp.querySelector("#lpMobileHome");
  } else {
    box.outerHTML = html;
    box = lp.querySelector("#lpMobileHome");
  }

  let mDemoIdx = 0;
  const stage = box.querySelector("#lpMDemoStage");
  const paintMDemo = (idx) => {
    mDemoIdx = ((idx % LANG_DEMOS.length) + LANG_DEMOS.length) % LANG_DEMOS.length;
    box.querySelectorAll("[data-mdemo]").forEach((t) => {
      const on = Number(t.dataset.mdemo) === mDemoIdx;
      t.classList.toggle("on", on);
      t.setAttribute("aria-selected", String(on));
    });
    const d = LANG_DEMOS[mDemoIdx];
    stage.innerHTML = `
      <div class="lp-m-demo-q">
        <div class="lp-m-demo-top">
          <span class="lp-m-demo-badge">${LANG_FLAG_SVG[d.code] || d.flag} ${esc(d.badge)}</span>
          <div class="lp-m-demo-audio">
            <button type="button" class="lp-m-say-btn" data-msay="1">${lineIcon("speaker", 15)} <span>${en ? "Listen" : "Nghe mẫu"}</span></button>
            <button type="button" class="lp-m-say-btn" data-msay="0.6">🐢 0.6x</button>
          </div>
        </div>
        <b>${esc(d.q)}</b>
        ${d.phonetic ? `<small>${esc(d.phonetic)}</small>` : ""}
      </div>
      <div class="lp-m-demo-opts">
        ${d.opts.map((o, k) => `<button type="button" class="lp-m-opt" data-mopt="${k}"><em>${String.fromCharCode(65 + k)}</em><span>${esc(o)}</span></button>`).join("")}
      </div>
      <div class="lp-m-demo-msg" id="lpMDemoMsg" hidden></div>`;
    stage.querySelectorAll("[data-msay]").forEach((b) => b.addEventListener("click", () => {
      speakDemoSample(d.speakText, d.speakLang, Number(b.dataset.msay) || 1, b);
    }));
    stage.querySelectorAll("[data-mopt]").forEach((ob) => ob.addEventListener("click", () => {
      const ok = Number(ob.dataset.mopt) === d.a;
      stage.querySelectorAll("[data-mopt]").forEach((x) => {
        x.disabled = true;
        if (Number(x.dataset.mopt) === d.a) x.classList.add("is-ok");
      });
      if (!ok) ob.classList.add("is-bad");
      const msg = stage.querySelector("#lpMDemoMsg");
      if (msg) {
        msg.hidden = false;
        msg.className = `lp-m-demo-msg ${ok ? "is-ok" : "is-bad"}`;
        msg.innerHTML = `<span>${ok ? (en ? "Correct! " : "Chính xác! ") : (en ? "Not quite. " : "Chưa đúng. ")}${esc(d.why)}</span>${ok ? `<button type="button" class="lp-m-demo-reg" data-m-auth="register">${en ? "Save progress →" : "Lưu tiến độ học →"}</button>` : ""}`;
        msg.querySelector("[data-m-auth]")?.addEventListener("click", () => { trackFunnel("register_click"); openAuth("register", onAuthed || authedCb); });
      }
      if (ok) { trackFunnel("demo_run_ok"); confetti(ob); }
    }));
  };
  paintMDemo(0);

  box.querySelectorAll("[data-mdemo]").forEach((b) => b.addEventListener("click", () => paintMDemo(Number(b.dataset.mdemo))));
  box.querySelectorAll("[data-m-pick-lang]").forEach((b) => b.addEventListener("click", () => {
    try { localStorage.setItem("pl:subject", b.dataset.mPickLang); } catch {}
    paintMDemo(Number(b.dataset.mPickIdx || 0));
    smoothScrollTo(box.querySelector("#lpMobileDemo"));
  }));
  box.querySelectorAll("[data-m-auth]").forEach((b) => b.addEventListener("click", () => {
    const mMode = b.dataset.mAuth === "register" ? "register" : "login";
    if (mMode === "register") trackFunnel("register_click");
    openAuth(mMode, onAuthed || authedCb);
  }));
  box.querySelectorAll('a[href^="#lpMobile"]').forEach((a) => a.addEventListener("click", (e) => {
    const tgt = box.querySelector(a.getAttribute("href"));
    if (tgt) { e.preventDefault(); smoothScrollTo(tgt); }
  }));
}

/**
 * Main entry point for landing page.
 * Hydrates pre-rendered DOM in-place without blanking or clearing root.innerHTML,
 * or renders full 8-section SSR layout if root is empty.
 * @param {HTMLElement} root
 * @param {Function} onAuthed
 */
export function renderLanding(root, onAuthed) {
  if (onAuthed) authedCb = onAuthed;

  let landingPage = root.querySelector("#landingPage") || root.querySelector("#demoBox");
  if (!landingPage) {
    if (_ssrLandingHtml) {
      root.innerHTML = _ssrLandingHtml;
    } else {
      root.innerHTML = buildLandingMarkup();
    }
  }

  hydrateLanding(root, onAuthed);
}

// ── Public Overview & Statistics ─────────────────────────────────────────────
async function loadPublic(root, onlyContent = false) {
  try {
    // SSR: dung du lieu server nhung san trong HTML (khong fetch); neu khong co thi fetch nhu cu.
    let o = null;
    try { const ssrEl = document.getElementById("ssr-overview"); if (ssrEl && ssrEl.textContent) o = JSON.parse(ssrEl.textContent); } catch {}
    if (!o) o = await api("/api/public/overview");
    const langs = o.languages || [];
    const en = currentLang() === "en";
    const all = [...langs];
    const totals = { ...o.totals, langEx: langs.reduce((n, l) => n + (l.exercises || 0), 0), subjects: all.length, allExercises: all.reduce((n, l) => n + (l.exercises || 0), 0), allTests: (o.totals.exams || 0) + langs.reduce((n, l) => n + l.levels.length * 2, 0) };
    root.querySelectorAll("[data-k]").forEach((b) => {
      if (b.dataset.k === "students") return; // strictly omit students counter
      if (onlyContent) b.textContent = fmtN(totals[b.dataset.k] || 0); else animateCount(b, totals[b.dataset.k] || 0, 900);
    });

    initHeroRotator(root);
    if (onlyContent) return;
  } catch { /* keep default numbers */ }

  // Stats + visit chay nen: khong chan render trang chu (LCP). Ve roi moi dien version + danh gia.
  try {
    if (!sessionStorage.getItem("py-lab-visit")) {
      try { sessionStorage.setItem("py-lab-visit", "1"); } catch {}
      api("/api/visit", "POST", {}).catch(() => {});
    }
  } catch {}
  api("/api/stats").then((s) => {
    if (!root.isConnected) return;
    try {
    const ver = root.querySelector("#lpVer");
    if (ver && s.version) ver.textContent = t(`Phiên bản ${s.version}`);
    // Đánh giá học viên: chỉ hiện số liệu thật từ máy chủ. Chưa có đánh giá nào thì khối này vẫn ẩn
    // (không hiện điểm mẫu hay đánh giá mẫu).
    try {
      const rk = root.querySelector("#lpRank");
      const sec = root.querySelector("#xep-hang");
      const count = (s.ratings && s.ratings.count) || 0;
      const avg = Number((s.ratings && s.ratings.average) || 0);
      const rec = ((s.ratings && s.ratings.recent) || []).filter((r) => r.comment);
      if (rk && sec && count > 0 && avg > 0) {
        const star = (n) => { const k = Math.max(0, Math.min(5, Math.round(n || 0))); return "★".repeat(k) + "☆".repeat(5 - k); };
        const cardHtml = (r, hidden) => `<article class="rk-card"${hidden ? ' aria-hidden="true"' : ""}><div class="rk-stars" aria-label="${esc(String(r.stars))}/5">${star(r.stars)}</div><p class="rk-text">${esc(r.comment)}</p><b class="rk-name">${esc(r.name || "")}</b></article>`;
        // Nhân đôi thẻ để cuộn vô tận liền mạch (bản sao aria-hidden, không đọc 2 lần).
        const dupCards = (items) => items.map((r) => cardHtml(r, false)).join("") + items.map((r) => cardHtml(r, true)).join("");
        const sub = sec.querySelector(".sec-sub");
        rk.innerHTML = `<div class="rk-score"><b>${esc(avg.toFixed(1))}</b><div class="rk-score-stars" aria-label="${esc(avg.toFixed(1))}/5">${star(avg)}</div><span>/5 trung bình từ ${count} đánh giá</span></div>`
          + (rec.length ? `<div class="rk-track" tabindex="0"><div class="rk-grid">${dupCards(rec)}</div></div>` : "");
        if (sub) sub.textContent = "Điểm trung bình từ đánh giá thật của học viên.";
        sec.hidden = false;
        if (rec.length) startRankScroll(rk.querySelector(".rk-track"));
      }
    } catch {}
    // Testimonials: 3 muc An/Mai/Hung trong HTML la noi dung ao lam cho tam.
    // Khi co tu 10 danh gia that co binh luan (ratings.recent) thi tu doi sang danh gia that.
    try {
      const rec = (s.ratings && s.ratings.recent) || [];
      if (rec.length >= 10) {
        const storySec = root.querySelector("#cau-chuyen"); if (storySec) storySec.hidden = false; // chỉ hiện khi có đánh giá thật
        const nt = root.querySelector("#storiesNote"); if (nt) nt.remove();
        const grid = root.querySelector(".stories-grid");
        if (grid) {
          const star = (n) => "★".repeat(Math.max(0, Math.min(5, n || 0))) + "☆".repeat(5 - Math.max(0, Math.min(5, n || 0)));
          grid.innerHTML = rec.slice(0, 6).map((r) => {
            const initial = (r.name || "?").trim().charAt(0).toUpperCase();
            return `<div class="story-card"><div class="story-header"><div class="story-avatar" aria-hidden="true">${esc(initial)}</div><div class="story-meta"><h3 class="story-name">${esc(r.name || "")}</h3><span class="story-tag">${esc(star(r.stars))}</span></div></div><blockquote class="story-quote">&ldquo;${esc(r.comment || "")}&rdquo;</blockquote></div>`;
          }).join("");
        }
      }
    } catch {}
    } catch {}
  }).catch(() => {});
}

// ── Login / Registration Modal Architecture ──────────────────────────────────
let authedCb = null;

export function openAuth(mode = "login", onAuthed) {
  if (onAuthed) authedCb = onAuthed;
  const allowReg = cfg("allowRegister", true) !== false;
  let reg = mode === "register" && allowReg;
  const en = currentLang() === "en";
  document.body.classList.add("auth-open");
  const m = openModal(`
    <header class="lp-auth-top">
      <button type="button" class="lp-auth-brand" data-close aria-label="${en ? "Back to homepage" : "Quay lại trang chủ"}">
        <span class="lp-auth-back" aria-hidden="true">←</span>
        <span class="lp-auth-word">life<b>rivo</b></span>
      </button>
      <button type="button" class="lp-auth-help" data-auth-help>${en ? "Help" : "Trợ giúp"}</button>
    </header>
    <div class="lp-auth-help-note" data-help-note hidden>
      ${en ? "Need help logging in? Tap <b>Forgot password?</b> below or email <b>study@liferivo.com</b>." : "Cần hỗ trợ? Chọn <b>Quên mật khẩu?</b> bên dưới hoặc gửi email về <b>study@liferivo.com</b>."}
    </div>
    <div class="lp-auth-body">
      <div class="lp-auth-mascot">
        <img data-mascot src="/img/kit/chibi-owl.webp" alt="Mascot" width="48" height="48" loading="eager" decoding="sync" />
      </div>
      <div class="lp-auth-head">
        <h2 data-title></h2>
        <p class="lead" data-lead></p>
      </div>
      <div class="lp-auth-card">
        <div data-auth-view="login">
          <form class="auth-form" method="post" action="/app/dang-nhap" autocomplete="on" novalidate>
            <label class="field" data-reg>
              <span class="lp-field-lbl">${en ? "FULL NAME" : "HỌ VÀ TÊN"}</span>
              <input name="n" autocomplete="name" maxlength="40" placeholder="${en ? "Full name" : "Họ và tên"}">
            </label>
            <label class="field" data-reg>
              <span class="lp-field-lbl">${en ? "EMAIL (OPTIONAL)" : "EMAIL"}</span>
              <input name="e" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" maxlength="254" placeholder="${en ? "Email (optional)" : "Email (không bắt buộc)"}">
            </label>
            ${cfg("registerCodeRequired") ? `<label class="field" data-reg><span class="lp-field-lbl">${en ? "CLASS CODE" : "MÃ LỚP"}</span><input name="code" autocomplete="off" maxlength="40" placeholder="${en ? "Class code from teacher" : "Mã lớp (giáo viên cung cấp)"}"></label>` : ""}
            <label class="field">
              <span class="lp-field-lbl" data-u-lbl>${en ? "ACCOUNT" : "TÀI KHOẢN"}</span>
              <input name="u" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="30" required placeholder="${en ? "Username" : "Tên đăng nhập"}">
            </label>
            <label class="field">
              <span class="lp-field-lbl">${en ? "PASSWORD" : "MẬT KHẨU"}</span>
              <span class="pass-wrap"><input name="p" type="password" autocomplete="current-password" maxlength="128" required placeholder="••••••••••••"><button type="button" data-eye aria-pressed="false">${en ? "Show" : "Hiện"}</button></span>
            </label>
            <label class="field" data-reg>
              <span class="lp-field-lbl">${en ? "CONFIRM PASSWORD" : "NHẬP LẠI MẬT KHẨU"}</span>
              <input name="p2" type="password" autocomplete="new-password" maxlength="128" placeholder="${en ? "Confirm password" : "Nhập lại mật khẩu"}">
            </label>
            <div class="auth-meta-row" data-login-only>
              <label class="check auth-remember">
                <input type="checkbox" name="remember" checked>
                <span>${en ? "Remember me" : "Ghi nhớ đăng nhập"}</span>
              </label>
              <button type="button" class="linkish auth-forgot-link" data-forgot>${en ? "Forgot password?" : "Quên mật khẩu?"}</button>
            </div>
            <p class="form-msg" role="alert" data-msg></p>
            <button class="btn btn-primary btn-lg btn-block" data-submit></button>
            <p class="lp-auth-terms" data-reg>${en ? "By signing up, you agree to the terms of use." : "Bằng cách đăng ký, bạn đồng ý với điều khoản sử dụng."}</p>
            ${allowReg ? `<div class="lp-auth-switch"><span data-switch-q></span> <button type="button" class="lp-auth-switch-btn" data-m="register"></button></div>` : `<p class="small muted" data-login-only style="margin:6px 0 0;text-align:center">Chưa có tài khoản? Giáo viên sẽ tạo tài khoản cho bạn.</p>`}
          </form>
        </div>
        <div data-auth-view="forgot" hidden>
          <form class="auth-form" data-forgot-form novalidate>
            <label class="field">
              <span class="lp-field-lbl">${en ? "USERNAME OR EMAIL" : "TÊN ĐĂNG NHẬP HOẶC EMAIL"}</span>
              <input name="forgotUser" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="254" required placeholder="${en ? "Registered username or email" : "Tên đăng nhập hoặc email đã đăng ký"}">
            </label>
            <p class="form-msg" data-forgot-msg role="status" aria-live="polite"></p>
            <button type="submit" class="btn btn-primary btn-lg btn-block" data-forgot-go>Gửi mã OTP</button>
            <p class="auth-links"><button type="button" class="linkish" data-back-login>← Quay lại đăng nhập</button></p>
          </form>
          <form class="auth-form" data-otp-form novalidate hidden>
            <p class="small muted" data-otp-note>Mã OTP gồm 6 số đã được gửi về email của tài khoản (nếu tài khoản có email). Mã có hiệu lực 10 phút.</p>
            <label class="field">
              <span class="lp-field-lbl">MÃ OTP (6 SỐ)</span>
              <input name="otp" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]*" maxlength="6" required placeholder="000000">
            </label>
            <label class="field">
              <span class="lp-field-lbl">MẬT KHẨU MỚI</span>
              <input name="np" type="password" autocomplete="new-password" minlength="6" maxlength="128" required placeholder="••••••••">
            </label>
            <label class="field">
              <span class="lp-field-lbl">NHẬP LẠI MẬT KHẨU MỚI</span>
              <input name="np2" type="password" autocomplete="new-password" minlength="6" maxlength="128" required placeholder="••••••••">
            </label>
            <p class="form-msg" data-otp-msg role="status" aria-live="polite"></p>
            <button type="submit" class="btn btn-primary btn-lg btn-block" data-otp-go>Đặt mật khẩu mới</button>
            <p class="auth-links"><button type="button" class="linkish" data-otp-resend>Gửi lại mã</button> · <button type="button" class="linkish" data-back-login2>← Quay lại đăng nhập</button></p>
          </form>
        </div>
      </div>
    </div>`, { label: "Đăng nhập", cls: "auth-compact lp-auth-sheet", onClose: () => { document.body.classList.remove("auth-open"); const ae = document.activeElement; if (ae && ae.closest && ae.closest(".aw-auth")) ae.blur(); } });

  const el = m.el;
  const paint = () => {
    const isEn = currentLang() === "en";
    el.querySelector(".lp-auth-sheet")?.classList.toggle("is-reg", reg);
    const mascotImg = el.querySelector("[data-mascot]");
    if (mascotImg) {
      mascotImg.src = reg ? "/img/kit/chibi-fox.webp" : "/img/kit/chibi-owl.webp";
      mascotImg.alt = reg ? "Rusty" : "Pippa";
    }
    el.querySelectorAll("[data-reg]").forEach((x) => {
      x.style.display = reg ? "" : "none";
      x.querySelectorAll("input, select, textarea").forEach((inp) => { inp.disabled = !reg; });
    });
    el.querySelectorAll("[data-login-only]").forEach((x) => { x.style.display = reg ? "none" : ""; });
    const uLbl = el.querySelector("[data-u-lbl]");
    const uInp = el.querySelector("[name=u]");
    const pInp = el.querySelector("[name=p]");
    if (uLbl) uLbl.textContent = reg ? (isEn ? "USERNAME" : "TÊN ĐĂNG NHẬP") : (isEn ? "ACCOUNT" : "TÀI KHOẢN");
    if (uInp) uInp.placeholder = isEn ? "Username" : "Tên đăng nhập";
    if (pInp) {
      pInp.placeholder = reg ? (isEn ? "Password (min 6 chars)" : "Mật khẩu") : "••••••••••••";
      pInp.setAttribute("autocomplete", reg ? "new-password" : "current-password");
    }
    const remSpan = el.querySelector(".auth-remember span");
    if (remSpan) remSpan.textContent = isEn ? "Remember me" : "Ghi nhớ đăng nhập";
    el.querySelector("[data-title]").textContent = reg
      ? (isEn ? "Create LifeRivo account" : "Tạo tài khoản LifeRivo")
      : (isEn ? "Welcome back!" : "Chào mừng trở lại!");
    el.querySelector("[data-lead]").textContent = reg
      ? (isEn ? "Start with a learning path tailored for you." : "Bắt đầu với một lộ trình phù hợp với bạn.")
      : (isEn ? "Continue your language learning journey." : "Tiếp tục hành trình học ngoại ngữ của bạn.");
    el.querySelector("[data-submit]").textContent = reg
      ? (isEn ? "Create account" : "Tạo tài khoản")
      : (isEn ? "Sign in" : "Đăng nhập");
    const sq = el.querySelector("[data-switch-q]");
    const sb = el.querySelector("[data-m]");
    if (sq) sq.textContent = reg ? (isEn ? "Already have an account?" : "Đã có tài khoản?") : (isEn ? "Don't have an account?" : "Chưa có tài khoản?");
    if (sb) {
      sb.dataset.m = reg ? "login" : "register";
      sb.textContent = reg ? (isEn ? "Sign in now" : "Đăng nhập ngay") : (isEn ? "Sign up now" : "Đăng ký ngay");
    }
    el.querySelector("[data-msg]").textContent = "";
  };
  paint();

  el.querySelector("[data-auth-help]")?.addEventListener("click", () => {
    const note = el.querySelector("[data-help-note]");
    if (note) note.hidden = !note.hidden;
  });

  el.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => {
    reg = b.dataset.m === "register" && allowReg;
    const loginView = el.querySelector('[data-auth-view="login"]');
    const forgotView = el.querySelector('[data-auth-view="forgot"]');
    if (loginView) loginView.hidden = false;
    if (forgotView) forgotView.hidden = true;
    paint();
    el.querySelector(reg ? "[name=n]" : "[name=u]")?.focus();
  }));

  el.querySelector("[data-eye]").addEventListener("click", (e) => {
    const inp = el.querySelector("[name=p]");
    const show = inp.type === "password";
    inp.type = show ? "text" : "password";
    e.target.textContent = show ? "Ẩn" : "Hiện";
    e.target.setAttribute("aria-pressed", String(show));
  });

  const showAuthView = (name) => {
    el.querySelectorAll("[data-auth-view]").forEach((v) => { v.hidden = v.getAttribute("data-auth-view") !== name; });
    if (name === "forgot") {
      el.querySelector("[data-title]").textContent = t("Quên mật khẩu");
      el.querySelector("[data-lead]").textContent = t("Nhập tên đăng nhập hoặc email đã lưu trong hồ sơ để nhận mã OTP.");
      otpStep(false);
      const fu = el.querySelector("[name=forgotUser]");
      if (fu && !fu.value) fu.value = el.querySelector("[name=u]")?.value || "";
      setTimeout(() => fu?.focus(), 40);
    } else {
      paint();
    }
  };

  // Bước 2 của quên mật khẩu: nhập mã OTP + mật khẩu mới
  const otpStep = (on) => {
    const f1 = el.querySelector("[data-forgot-form]"), f2 = el.querySelector("[data-otp-form]");
    if (f1) f1.hidden = on;
    if (f2) f2.hidden = !on;
    if (on) {
      el.querySelector("[data-title]").textContent = t("Nhập mã OTP");
      el.querySelector("[data-lead]").textContent = "";
      const m2 = el.querySelector("[data-otp-msg]"); if (m2) { m2.textContent = ""; m2.className = "form-msg"; }
      setTimeout(() => el.querySelector("[name=otp]")?.focus(), 40);
    }
  };
  const requestOtp = async (msg, btn) => {
    const u = (el.querySelector("[name=forgotUser]")?.value || "").trim();
    if (!u) { msg.textContent = t("Nhập tên đăng nhập hoặc email."); msg.className = "form-msg err"; return false; }
    msg.textContent = t("Đang gửi…"); msg.className = "form-msg";
    if (btn) btn.disabled = true;
    try {
      const j = await api("/api/password/forgot", "POST", { username: u });
      msg.textContent = t(j.message || "");
      msg.className = j.otp ? "form-msg ok" : "form-msg";
      return !!j.otp;
    } catch (err) {
      msg.textContent = err.message;
      msg.className = "form-msg err";
      return false;
    } finally {
      if (btn) btn.disabled = false;
    }
  };

  el.querySelector("[data-forgot]")?.addEventListener("click", () => showAuthView("forgot"));
  el.querySelector("[data-back-login]")?.addEventListener("click", () => showAuthView("login"));
  el.querySelector("[data-back-login2]")?.addEventListener("click", () => showAuthView("login"));
  el.querySelector("[data-otp-resend]")?.addEventListener("click", (e) => requestOtp(el.querySelector("[data-otp-msg]"), e.currentTarget));
  el.querySelector("[name=otp]")?.addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D+/g, "").slice(0, 6); });
  el.querySelector("[data-otp-form]")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = el.querySelector("[data-otp-msg]");
    const btn = el.querySelector("[data-otp-go]");
    const fail = (x) => { msg.textContent = x; msg.className = "form-msg err"; };
    const u = (el.querySelector("[name=forgotUser]")?.value || "").trim();
    const code = (el.querySelector("[name=otp]")?.value || "").trim();
    const np = el.querySelector("[name=np]")?.value || "";
    if (!/^\d{6}$/.test(code)) return fail(t("Mã OTP gồm 6 chữ số."));
    if (np.length < 6 || np.length > 128) return fail(t("Mật khẩu mới cần từ 6 đến 128 ký tự."));
    if (np !== (el.querySelector("[name=np2]")?.value || "")) return fail(t("Hai lần nhập mật khẩu mới chưa khớp."));
    btn.disabled = true;
    try {
      const j = await api("/api/password/reset-otp", "POST", { username: u, code, newPassword: np });
      e.target.reset();
      showAuthView("login");
      if (j.username) el.querySelector("[name=u]").value = j.username;
      const lm = el.querySelector("[data-msg]");
      lm.textContent = t(j.message || "Đã đặt mật khẩu mới. Hãy đăng nhập.");
      lm.className = "form-msg ok";
      el.querySelector("[name=p]")?.focus();
    } catch (err) {
      fail(err.message);
    }
    btn.disabled = false;
  });

  el.querySelector("[data-forgot-form]")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = el.querySelector("[data-forgot-msg]");
    const btn = el.querySelector("[data-forgot-go]");
    // Máy chủ đã gửi mã (hoặc trả lời chung chung khi không có tài khoản): chuyển sang bước nhập mã.
    if (await requestOtp(msg, btn)) otpStep(true);
  });

  const last = store.get("py-lab-last-user");
  if (last && !reg) el.querySelector("[name=u]").value = last;
  if (!reg && navigator.credentials && navigator.credentials.get) {
    navigator.credentials.get({ password: true, mediation: "silent" }).then((cred) => {
      if (cred && cred.type === "password" && !reg) {
        const ui = el.querySelector("[name=u]");
        const pi = el.querySelector("[name=p]");
        if (ui && !ui.value && cred.id) ui.value = cred.id;
        if (pi && !pi.value && cred.password) pi.value = cred.password;
      }
    }).catch(() => {});
  }
  setTimeout(() => el.querySelector(reg ? "[name=n]" : (last ? "[name=p]" : "[name=u]")).focus(), 40);

  el.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const u = el.querySelector("[name=u]").value.trim();
    const p = el.querySelector("[name=p]").value;
    const p2 = el.querySelector("[name=p2]")?.value || "";
    const n = el.querySelector("[name=n]").value.trim();
    const remember = reg || !!el.querySelector("[name=remember]")?.checked;
    const msg = el.querySelector("[data-msg]");
    const btn = el.querySelector("[data-submit]");
    const fail = (t) => { msg.textContent = t; msg.className = "form-msg err"; };
    if (!u || !p) return fail(t("Hãy nhập tên đăng nhập và mật khẩu."));
    if (reg && !/^[A-Za-z0-9_.-]{3,30}$/.test(u)) return fail(t("Tên đăng nhập gồm 3 đến 30 ký tự: chữ không dấu, số, dấu _ . -"));
    if (reg && p.length < 6) return fail(t("Mật khẩu cần tối thiểu 6 ký tự."));
    if (reg && p !== p2) return fail(t("Hai lần nhập mật khẩu chưa khớp."));
    { const em = (el.querySelector("[name=e]")?.value || "").trim(); if (reg && em && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) return fail(t("Email chưa đúng định dạng.")); }
    btn.disabled = true;
    btn.innerHTML = '<span class="spin"></span>' + (reg ? "Đang tạo tài khoản" : "Đang đăng nhập");
    try {
      const j = await api(reg ? "/api/register" : "/api/login", "POST", reg ? { username: u, password: p, displayName: n || u, email: (el.querySelector("[name=e]")?.value || "").trim(), classCode: (el.querySelector("[name=code]") || {}).value || "", accountType: (el.querySelector("[name=acct]") || {}).value || "student", lang: currentLang() } : { username: u, password: p });
      S.csrf = j.csrfToken;
      if (remember) store.set("py-lab-last-user", u); else store.del("py-lab-last-user");
      if (remember && window.PasswordCredential && navigator.credentials && navigator.credentials.store) {
        try {
          const cred = new window.PasswordCredential({ id: u, password: p, name: n || (j.user && j.user.displayName) || u });
          navigator.credentials.store(cred).catch(() => {});
        } catch {}
      }
      if (reg) {
        trackFunnel("register_complete");
        try {
          const demoDraft = store.get("pl:demo-draft") || "";
          const playKey = `pl:play:${u}`;
          if (demoDraft.trim() && !store.get(playKey)) {
            store.set(playKey, demoDraft);
            try { sessionStorage.setItem("pl:just-imported", "1"); } catch {}
          }
          store.del("pl:demo-ok-count");
          store.del("pl:demo-prompt-dismissed");
        } catch {}
      }
      m.close();
      if (appHash().startsWith("/app/dang")) setAppHash("/app/");
      if (authedCb) authedCb(reg);
    } catch (err) {
      fail(err.message);
      btn.disabled = false;
      btn.textContent = reg ? "Tạo tài khoản và vào học" : "Đăng nhập";
    }
  });
}

// ── UI Effects: Scroll reveal, tilt & confetti ───────────────────────────────
export function initFx(root = document) {
  const aw = root.querySelector(".aw") || document.querySelector(".aw");
  if (!aw) return;
  aw.classList.add("fx-ready");

  const groups = [
    [".sec-hero, .hero-chip, .hero-title, .hero-sub, .hero-cta-wrap, .hero-note, .hero-mockup-row", 90],
    [".sec-head, .sec-title, .sec-sub", 80],
    [".purpose-card", 70],
    [".subj-card", 60],
    [".step-card", 80],
    [".story-card", 80],
    [".faq-item", 50],
    [".cta-box", 80],
  ];
  const items = [];
  groups.forEach(([sel, step]) => {
    const list = [...aw.querySelectorAll(sel)];
    list.forEach((el, i) => { el.classList.add("rv"); el.style.setProperty("--d", `${(i % 8) * step}ms`); items.push(el); });
  });

  if (reduceMotion() || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }), { threshold: 0.01, rootMargin: "160px 0px 160px 0px" });
    items.forEach((el) => io.observe(el));
    const sweep = () => items.forEach((el) => {
      if (!el.classList.contains("in") && el.getBoundingClientRect().top < innerHeight * 1.15) {
        el.classList.add("in");
      }
    });
    let sweepRaf = 0;
    const onScrollSweep = () => {
      if (sweepRaf) return;
      sweepRaf = requestAnimationFrame(() => { sweepRaf = 0; sweep(); });
    };
    requestAnimationFrame(sweep);
    setTimeout(sweep, 400);
    window.addEventListener("scroll", onScrollSweep, { passive: true });
  }

  // Page scroll progress bar if present
  const bar = root.querySelector("#awProg");
  if (bar) {
    let ticking = false;
    const paint = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(paint);
      }
    }, { passive: true });
    paint();
  }
}

export function confetti(from) {
  if (!from || reduceMotion()) return;
  const r = from.getBoundingClientRect();
  const colors = ["#F9D976", "#5468D4", "#E6E0F8", "#9DD6B5", "#F1A9C4", "#1D1C27"];
  const host = document.createElement("div");
  host.className = "aw-confetti";
  host.style.left = `${r.left + r.width / 2}px`;
  host.style.top = `${r.top + r.height / 2}px`;
  for (let i = 0; i < 26; i++) {
    const p = document.createElement("i");
    const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 90;
    p.style.setProperty("--x", `${Math.cos(a) * d}px`);
    p.style.setProperty("--y", `${Math.sin(a) * d - 60}px`);
    p.style.setProperty("--r", `${Math.random() * 540 - 270}deg`);
    p.style.background = colors[i % colors.length];
    host.appendChild(p);
  }
  document.body.appendChild(host);
  setTimeout(() => host.remove(), 1200);
}

// Cuộn tự động từ trái sang phải (nội dung chạy sang phải, quay lại đầu khi hết). Tạm dừng khi rê chuột hoặc có tiêu điểm.
// Tắt khi người dùng bật giảm chuyển động. Người dùng vẫn cuộn tay được.
function startRankScroll(track) {
  if (!track || (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
  let paused = false, last = 0;
  const pause = () => { paused = true; };
  const resume = () => { paused = false; };
  track.addEventListener("pointerenter", pause);
  track.addEventListener("pointerleave", resume);
  track.addEventListener("pointerdown", pause);
  track.addEventListener("touchstart", pause, { passive: true });
  track.addEventListener("focusin", pause);
  track.addEventListener("focusout", resume);
  // Rong 1 bo the (the da nhan doi): do bang khoang cach giua the dau tien
  // cua bo goc va the dau tien cua ban sao -> tru dung moc nay thi vong lap
  // vo hinh (khong nhay ve 0). Hieu 2 vi tri khong phu thuoc scrollLeft.
  let loopW = 0;
  const measure = () => {
    const cards = track.querySelectorAll(".rk-card");
    if (cards.length >= 2) {
      const n = cards.length / 2;
      const w = cards[n].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
      if (w > 0) loopW = w;
    }
    if (!loopW || loopW <= 0) loopW = track.scrollWidth / 2;
  };
  measure();
  const frame = (now) => {
    if (!track.isConnected) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    const max = track.scrollWidth - track.clientWidth;
    if (!paused && max > 0) {
      // Cuon tu phai sang trai: noi dung troi sang trai, the moi vao tu ben phai.
      track.scrollLeft += 28 * dt;
      if (loopW > 0 && track.scrollLeft >= loopW) track.scrollLeft -= loopW;
      else if (track.scrollLeft >= max) track.scrollLeft = 0;
    }
    requestAnimationFrame(frame);
  };
  track.scrollLeft = 0;
  requestAnimationFrame(frame);
}
