// Dấu chấm chỉ vị trí cho mọi hàng ngang cuộn trong app (cấp độ, tab, chip, phân đoạn). Khi hàng bị tràn, thay thanh cuộn xám
// bằng một hàng chấm bên dưới; chấm đang sáng là mục đang hiển thị, bấm chấm để cuộn tới mục đó.
// Hàng không tràn (máy tính, màn hình rộng) thì không hiện chấm.
import { currentLang } from "./i18n.js";

const ROWS =".lx-levels, .tabs, .seg, .cat-seg, .sp-tabs, .sp-seg, .chips, .lx-rep-tabs, .lh-lang-tabs, .aiw-tabs, [data-hdots]";

function firstLeft(row) {
  const first = row.firstElementChild;
  return first ? first.offsetLeft : 0;
}

function activeIndex(row, items) {
  if (row.scrollLeft + row.clientWidth >= row.scrollWidth - 4) return items.length - 1;
  const base = firstLeft(row);
  let idx = 0;
  items.forEach((el, i) => { if (el.offsetLeft - base <= row.scrollLeft + 8) idx = i; });
  return idx;
}

function paintActive(row, dots) {
  const idx = activeIndex(row, [...row.children]);
  [...dots.children].forEach((b, i) => {
    b.classList.toggle("on", i === idx);
    if (i === idx) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
  });
}

function buildDots(row, dots, count) {
  dots.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `${currentLang() === "en" ? "Item" : "Mục"} ${i + 1}`);
    b.addEventListener("click", () => {
      const el = row.children[i];
      if (el) row.scrollTo({ left: el.offsetLeft - firstLeft(row), behavior: "smooth" });
    });
    dots.appendChild(b);
  }
}

function syncRow(row) {
  const count = row.children.length;
  const next = row.nextElementSibling;
  let dots = next && next.classList.contains("hdots") ? next : null;
  const overflow = count > 1 && row.scrollWidth > row.clientWidth + 4;
  if (!overflow) { if (dots) dots.hidden = true; return; }
  if (!dots) {
    dots = document.createElement("div");
    dots.className = "hdots";
    dots.setAttribute("aria-label", currentLang() === "en" ? "Position in row" : "Vị trí trong hàng");
    row.after(dots);
  }
  if (dots.children.length !== count) buildDots(row, dots, count);
  dots.hidden = false;
  if (!row.dataset.hdotsBound) {
    row.dataset.hdotsBound = "1";
    let raf = 0;
    row.addEventListener("scroll", () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const d = row.nextElementSibling;
        if (d && d.classList.contains("hdots")) paintActive(row, d);
      });
    }, { passive: true });
  }
  paintActive(row, dots);
}

function syncAll() {
  document.querySelectorAll(ROWS).forEach((row) => { if (row.getClientRects().length) syncRow(row); });
}

export function initHscrollDots() {
  let timer = 0;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(syncAll, 60); };
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("resize", schedule);
  schedule();
}
