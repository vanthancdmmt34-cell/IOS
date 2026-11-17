/* Gập khối dài trên điện thoại: khối quá cao chỉ hiện một phần kèm nút "Xem thêm", bấm để mở rộng.
   Không gập khối có ô nhập liệu (form, input, textarea) để không làm khó bài tập và biểu mẫu.
   Chỉ bật trên màn hình ≤ 640px; trên máy tính không đổi gì. */
import { currentLang } from "./i18n.js";

const MOBILE = "(max-width: 640px)";
const TARGETS = ".lx-ai-insights, .lx-map, .lx-beginner-track, .lx-path, .lx-levels, .hm-plan-card, .hm-studio-grid, .hm-focus, section.sheet, section.hm-section, .sw-roadmap, .sw-picker-sec, .sw-companion-sec";
const FOLD_MIN = 580; // chỉ gập khi khối cao hơn mức thu gọn (520px) một đoạn, để không gập khối chỉ có vài dòng

const labels = () => (currentLang() === "en" ? { more: "Show more", less: "Show less" } : { more: "Xem thêm", less: "Thu gọn" });

export function foldLong(root) {
  if (!root || !window.matchMedia || !window.matchMedia(MOBILE).matches) return;
  // Khối đã nêu tên, cộng các khối con cấp 1–2 của trang (theo thứ tự xuất hiện: khối cha trước khối con)
  const cands = [...new Set([...root.querySelectorAll(TARGETS), ...root.querySelectorAll(":scope > *, :scope > div > *")])]
    .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  cands.forEach((el) => {
    if (el.dataset.fold === "1" || el.classList.contains("is-open")) return; // khối đã mở thì không gập lại
    if (el.closest(".pl-fold")) return; // đã nằm trong khối gập khác
    if (el.closest(".ob")) return; // luồng thiết lập lần đầu (welcome.js) luôn hiện đủ lựa chọn và nút bấm
    // Chọn bạn đồng hành và chọn ngôn ngữ bắt đầu luôn hiện (không nằm sau "Xem thêm"), kể cả khi khối cha chứa chúng
    if (el.matches(".sw-companion-sec, .sw-picker-sec, .cp-picker") || el.querySelector(".cp-picker, .sw-companion-sec")) return;
    // Thẻ ôn tập, danh sách đến hạn, đoạn văn đọc hiểu, mục tiêu và khóa học của trang chủ luôn hiện (nội dung chính)
    if (el.matches(".lx-flash, .lx-due-list, .lx-passage, .hm-daily, .hm-courses") || el.querySelector(".lx-flash, .lx-due-list, .lx-passage, .hm-daily, .hm-courses")) return;
    // Khối thống kê (AI Insights) có ô chọn kỳ hạn nhưng không phải bài tập: vẫn gập được
    if (!el.matches(".lx-ai-insights") && el.querySelector("input, textarea, select, form, [contenteditable]")) return;
    if (el.offsetParent === null) return; // đang ẩn: đo sau
    if (el.getBoundingClientRect().height < FOLD_MIN) return;
    el.dataset.fold = "1";
    el.classList.add("pl-fold");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pl-fold-btn";
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = labels().more;
    btn.addEventListener("click", () => {
      const open = el.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? labels().less : labels().more;
    });
    el.after(btn);
  });
}

let started = false;
export function startMobileFold(main) {
  if (started || !main || typeof MutationObserver === "undefined") return;
  started = true;
  let timer = null;
  const run = () => { clearTimeout(timer); timer = setTimeout(() => foldLong(main), 220); };
  // Bỏ qua thay đổi do chính nút "Xem thêm" gây ra (đổi chữ nút) để không gập lại khối vừa mở
  new MutationObserver((muts) => {
    if (muts.length && muts.every((m) => m.target && m.target.closest && m.target.closest(".pl-fold-btn"))) return;
    run();
  }).observe(main, { childList: true, subtree: true });
  window.addEventListener("resize", run);
  run();
}
