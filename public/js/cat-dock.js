import { esc, smoothScrollTo } from "./core.js";
import { currentLang } from "./i18n.js";

const reduceMotion = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const CAT_SVG = `
<svg class="cat-svg" viewBox="0 0 140 84" width="140" height="84" fill="none">
  <path class="cat-tail" d="M24 58 C 10 56, 6 38, 18 30 C 24 26, 28 32, 24 38" stroke="#E08E45" stroke-width="9" stroke-linecap="round" fill="none"/>
  <path class="cat-tail-line" d="M24 58 C 10 56, 6 38, 18 30 C 24 26, 28 32, 24 38" stroke="#1D1C27" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <ellipse cx="34" cy="64" rx="8.5" ry="5" fill="#FFFDF6" stroke="#1D1C27" stroke-width="2.3"/>
  <path class="cat-body" d="M28 60 C 26 38, 50 32, 76 34 C 94 35, 106 42, 108 58 C 108 64, 96 66, 70 66 C 46 66, 30 65, 28 60 Z" fill="#F9C784" stroke="#1D1C27" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M74 65 C 88 65, 102 63, 104 54 C 96 48, 82 50, 74 65 Z" fill="#FFFDF6"/>
  <path d="M46 37 C 50 43, 55 43, 59 35" stroke="#E08E45" stroke-width="4" stroke-linecap="round"/>
  <path d="M62 34 C 65 40, 70 40, 73 34" stroke="#E08E45" stroke-width="4" stroke-linecap="round"/>
  <g class="cat-ears">
    <path d="M84 30 L 80 12 L 96 22 Z" fill="#F9C784" stroke="#1D1C27" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M85 26 L 83 16 L 92 22 Z" fill="#F4A6B8"/>
    <path d="M104 22 L 118 11 L 116 30 Z" fill="#E08E45" stroke="#1D1C27" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M107 22 L 115 16 L 114 26 Z" fill="#F4A6B8"/>
  </g>
  <ellipse cx="100" cy="36" rx="20" ry="17" fill="#FFFDF6" stroke="#1D1C27" stroke-width="2.5"/>
  <path d="M83 29 C 89 19, 108 18, 117 28 C 110 25, 103 27, 100 32 C 96 26, 89 25, 83 29 Z" fill="#F9C784"/>
  <g class="cat-eyes">
    <ellipse cx="92" cy="36" rx="2.6" ry="3.2" fill="#1D1C27"/>
    <circle cx="91.2" cy="34.8" r="1" fill="#fff"/>
    <ellipse cx="108" cy="36" rx="2.6" ry="3.2" fill="#1D1C27"/>
    <circle cx="107.2" cy="34.8" r="1" fill="#fff"/>
  </g>
  <ellipse cx="86" cy="41" rx="3.2" ry="1.8" fill="#F4A6B8" opacity=".65"/>
  <ellipse cx="114" cy="41" rx="3.2" ry="1.8" fill="#F4A6B8" opacity=".65"/>
  <path d="M98 40 L 102 40 L 100 42.5 Z" fill="#F4A6B8"/>
  <path d="M96 44 Q 98 46.5 100 44 Q 102 46.5 104 44" stroke="#1D1C27" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M77 37 L 85 38 M76 41 L 85 41 M115 38 L 123 37 M115 41 L 124 41" stroke="#1D1C27" stroke-width="1.5" stroke-linecap="round"/>
  <ellipse cx="86" cy="64" rx="7.2" ry="4.6" fill="#FFFDF6" stroke="#1D1C27" stroke-width="2.2"/>
  <g class="cat-front-paw">
    <path d="M97 62 C 101.5 59.5, 109 60, 111.5 64 C 112 67, 109 69, 104 68.5 C 99.5 68, 97 65.5, 97 62 Z" fill="#FFFDF6" stroke="#1D1C27" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M106.5 65.5 L 108 67.6 M109 63.6 L 110.6 65.5" stroke="#1D1C27" stroke-width="1.3" stroke-linecap="round"/>
  </g>
</svg>`;

function pageMarkup(topic, kickerText) {
  if (!topic) return "";
  return `<span class="cat-page-kicker">${esc(kickerText)}</span>`
    + `<strong class="cat-page-title"><span class="cat-page-flag" aria-hidden="true">${topic.flag || "📘"}</span><span>${esc(topic.title || "")}</span></strong>`
    + `<small class="cat-page-sub">${esc(topic.sub || "")}</small>`;
}

export function mountCatScrollDock({
  host,
  topics = [],
  initialIndex = 0,
  kicker,
  hint,
  ariaLabel,
  extraClass = "",
  onFlip = null,
  autoCycleMs = 0,
  trackWindowScroll = true,
} = {}) {
  if (!host || !topics.length) return null;
  const en = currentLang() === "en";
  const kickerText = kicker || (en ? "Study topic" : "Nội dung cần học");
  const hintText = hint || (en ? "Tap to flip page" : "Bấm để mèo lật trang");
  const labelText = ariaLabel || (en ? "Cat page-flipper for study topics" : "Mèo lật trang tiêu đề nội dung học");

  let list = topics.slice();
  let curIdx = ((initialIndex % list.length) + list.length) % list.length;

  const existing = host.querySelector("#catScrollDock");
  if (existing) existing.remove();

  const dock = document.createElement("aside");
  dock.id = "catScrollDock";
  dock.className = extraClass ? `cat-scroll-dock ${extraClass}` : "cat-scroll-dock";
  dock.setAttribute("aria-label", labelText);
  dock.innerHTML = `
    <button type="button" class="cat-dock-cat" id="catOpenBtn" aria-expanded="false" aria-label="${en ? "Open or close the cat page-flipper" : "Mở hoặc thu gọn mèo lật trang"}">${CAT_SVG}</button>
    <div class="cat-scroll-book">
      <div class="cat-scroll-bar" aria-hidden="true"><i id="catScrollProg"></i></div>
      <button type="button" class="cat-flip-btn" id="catFlipBtn" aria-label="${esc(labelText)}">
        <div class="cat-page-stage">
          <div class="cat-page-card" id="catPageCurrent">${pageMarkup(list[curIdx], kickerText)}</div>
          <div class="cat-page-leaf" id="catPageLeaf" aria-hidden="true"></div>
        </div>
        <span class="cat-page-curl" aria-hidden="true"></span>
      </button>
      <div class="cat-dock-foot">
        <span class="cat-dock-hint">${esc(hintText)}</span>
        <button type="button" class="cat-top-btn" id="catTopBtn" aria-label="${en ? "Scroll to top" : "Cuộn lên đầu trang"}" title="${en ? "Back to top" : "Lên đầu trang"}" hidden>↑</button>
      </div>
    </div>
  `;
  host.appendChild(dock);

  const pageCur = dock.querySelector("#catPageCurrent");
  const pageLeaf = dock.querySelector("#catPageLeaf");
  const flipBtn = dock.querySelector("#catFlipBtn");
  const topBtn = dock.querySelector("#catTopBtn");
  const progEl = dock.querySelector("#catScrollProg");

  let flipTimer = null;
  let autoTimer = null;
  let paused = false;

  const flipTo = (nextIdx, tapOnly = false) => {
    if (!document.body.contains(dock) || !list.length) return;
    const normalized = ((nextIdx % list.length) + list.length) % list.length;
    const nextTopic = list[normalized];
    if (flipTimer) {
      clearTimeout(flipTimer);
      flipTimer = null;
      dock.classList.remove("is-flipping");
      if (pageLeaf) pageLeaf.classList.remove("is-turning");
    }
    if (!tapOnly && pageLeaf && pageCur && normalized !== curIdx && !reduceMotion()) {
      pageLeaf.innerHTML = pageCur.innerHTML;
      pageCur.innerHTML = pageMarkup(nextTopic, kickerText);
      curIdx = normalized;
      void pageLeaf.offsetWidth;
      dock.classList.add("is-flipping");
      pageLeaf.classList.add("is-turning");
      flipTimer = setTimeout(() => {
        dock.classList.remove("is-flipping");
        pageLeaf.classList.remove("is-turning");
        pageLeaf.innerHTML = "";
        flipTimer = null;
      }, 960);
    } else {
      curIdx = normalized;
      if (pageCur) pageCur.innerHTML = pageMarkup(nextTopic, kickerText);
      if (!reduceMotion()) {
        dock.classList.add("is-flipping");
        flipTimer = setTimeout(() => {
          dock.classList.remove("is-flipping");
          flipTimer = null;
        }, 900);
      }
    }
  };

  const stepNext = (source = "auto") => {
    const nextIdx = (curIdx + 1) % list.length;
    if (onFlip) {
      onFlip(list[nextIdx], nextIdx, source, flipTo);
    } else {
      flipTo(nextIdx, list.length <= 1);
    }
  };

  flipBtn.addEventListener("click", () => stepNext("click"));
  topBtn.addEventListener("click", () => smoothScrollTo(0, { duration: 760 }));

  // Trên điện thoại chỉ hiện con mèo; chạm mèo để mở/thu sách trang, khỏi che nội dung học
  const openBtn = dock.querySelector("#catOpenBtn");
  openBtn.addEventListener("click", () => {
    const open = dock.classList.toggle("is-open");
    openBtn.setAttribute("aria-expanded", String(open));
  });

  dock.addEventListener("pointerenter", () => { paused = true; });
  dock.addEventListener("pointerleave", () => { paused = false; });

  let ticking = false;
  let lastBucket = Math.floor(window.scrollY / 520);
  let lastScrollFlip = 0;

  const updateScroll = () => {
    ticking = false;
    if (!document.body.contains(dock)) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.max(0, Math.min(100, (window.scrollY / max) * 100)) : 0;
    if (progEl) progEl.style.width = `${pct.toFixed(1)}%`;
    if (topBtn) topBtn.hidden = window.scrollY < 240;

    const bucket = Math.floor(window.scrollY / 520);
    const now = Date.now();
    if (bucket !== lastBucket) {
      lastBucket = bucket;
      if (!reduceMotion() && now - lastScrollFlip > 1400) {
        lastScrollFlip = now;
        stepNext("scroll");
      }
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScroll);
    }
  };
  if (trackWindowScroll) {
    window.addEventListener("scroll", onScroll, { passive: true });
    updateScroll();
  }

  if (autoCycleMs > 0 && !reduceMotion() && list.length > 1) {
    autoTimer = setInterval(() => {
      if (!document.body.contains(dock)) {
        clearInterval(autoTimer);
        autoTimer = null;
        return;
      }
      if (!paused && !document.hidden) stepNext("auto");
    }, autoCycleMs);
  }

  return {
    flipTo,
    setProgress(pct) {
      if (progEl) progEl.style.width = `${Math.max(0, Math.min(100, Number(pct) || 0)).toFixed(1)}%`;
    },
    setTopics(newTopics, keepIdx = 0) {
      if (!Array.isArray(newTopics) || !newTopics.length) return;
      list = newTopics.slice();
      curIdx = ((keepIdx % list.length) + list.length) % list.length;
      if (pageCur) pageCur.innerHTML = pageMarkup(list[curIdx], kickerText);
    },
    destroy() {
      if (flipTimer) clearTimeout(flipTimer);
      if (autoTimer) clearInterval(autoTimer);
      window.removeEventListener("scroll", onScroll);
      dock.remove();
    },
  };
}
