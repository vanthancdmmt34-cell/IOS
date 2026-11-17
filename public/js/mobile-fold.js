/* Gập khối dài trên điện thoại: khối quá cao chỉ hiện một phần kèm nút "Xem thêm", bấm để mở rộng.
   Không gập khối có ô nhập liệu (form, input, textarea) để không làm khó bài tập và biểu mẫu.
   Chỉ bật trên màn hình ≤ 640px; trên máy tính không đổi gì. */
import { currentLang } from "./i18n.js";

const MOBILE = "(max-width: 640px)";
const TARGETS = ".lx-ai-insights, .lx-map, .lx-beginner-track, .lx-path, .lx-levels, .hm-plan-card, .hm-studio-grid, .hm-focus, section.sheet, section.hm-section, .sw-roadmap, .sw-picker-sec, .sw-companion-sec";
const FOLD_MIN = 580; // chỉ gập khi khối cao hơn mức thu gọn (520px) một đoạn, để không gập khối chỉ có vài dòng

const labels = () => (currentLang() === "en" ? { more: "Show more", less: "Show less" } : { more: "Xem thêm", less: "Thu gọn" });

export function foldLong(root) {
  // Trên giao diện Mobile mới, người dùng cuộn tự nhiên theo chiều dọc;
  // không cắt ngang bài học, bài tập, lộ trình, trò chơi hay danh sách khóa học bằng nút "Xem thêm".
  if (!root) return;
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
