/* Hướng dẫn riêng cho từng môn: mở lần đầu khi người dùng vào môn, và mở lại từ tổng quan của môn.
   Chỉ liệt kê tính năng thật của môn đó, mỗi mục bấm được để vào đúng trang.
   Đã xem được lưu trên tài khoản (prefs.subjectTips). */
import {  } from "./core.js";
import { S, api, esc, icon } from "./core.js";

const T = (title, intro, features) => ({ title, intro, features });
const F = (ic, title, desc, href) => ({ ic, title, desc, href });

const LANG_COMMON = (id, name, { certLabel = "Chứng nhận", soundHref, soundTip, fieldsSample = "AI, marketing, tài chính, y tế…" } = {}) => [
  F("🎙️", "Luyện nói chấm từng từ", `Đọc to câu mẫu ${name}, máy chấm từng từ như karaoke. Cần micro.`, `/app/ngoai-ngu/luyen-noi/${id}`),
  F("🔤", "Phát âm từng âm khó", `${soundTip} Nghe mẫu, hướng dẫn chi tiết, có chế độ chậm 0.6x.`, soundHref || `/app/ngoai-ngu/luyen-noi/${id}?muc=phat-am`),
  F("💼", "Phỏng vấn AI · 30 ngành", `AI đóng vai nhà tuyển dụng ${name}: hỏi từng câu, sửa lỗi và nhận xét tổng kết (${fieldsSample}).`, `/app/ngoai-ngu/luyen-noi/${id}?muc=hoi-thoai`),
  F("🗂️", "Phỏng vấn thử có câu mẫu", `Trả lời phỏng vấn bằng ${name} rồi xem câu mẫu để tự đối chiếu.`, `/app/phong-van/${id}`),
  F("💬", "Hội thoại với AI", `Trò chuyện tình huống thực tế bằng ${name}, AI sửa câu ngay khi nói.`, `/app/ngoai-ngu/tro-chuyen/${id}`),
  F("🃏", "Ôn từ bằng thẻ", "Thẻ đến hạn tự hiện đúng lúc bạn sắp quên.", `/app/ngoai-ngu/on-tap/${id}`),
  F("🏅", certLabel, "Hoàn thành cấp để nhận chứng nhận của riêng cấp đó.", `/app/ngoai-ngu/chung-nhan-cua-toi/${id}`),
];

export const SUBJECT_TIPS = {
  en: T("Tiếng Anh", "Từ vựng, phát âm, nói và phỏng vấn AI, theo chuẩn CEFR từ A1 đến C1.", [
    F("📘", "Bài học theo cấp CEFR", "Từ vựng, ngữ pháp, bài đọc và bài nghe đi theo từng cấp A1 → C1.", "/app/ngoai-ngu/en"),
    ...LANG_COMMON("en", "tiếng Anh", {
      certLabel: "Chứng nhận CEFR",
      soundHref: "/app/ngoai-ngu/luyen-noi/en/phat-am/tu/th-vo-thanh",
      soundTip: "Ví dụ âm /θ/ trong think: hướng dẫn đặt lưỡi.",
    }),
  ]),
  zh: T("Tiếng Trung", "Phát âm thanh điệu, chữ Hán, luyện nói và phỏng vấn AI, theo từng cấp HSK.", [
    F("📘", "Bài học theo cấp HSK", "Từ vựng, chữ Hán, Pinyin và ngữ pháp đi theo từng cấp.", "/app/ngoai-ngu/zh"),
    ...LANG_COMMON("zh", "tiếng Trung", {
      certLabel: "Chứng nhận HSK",
      soundHref: "/app/ngoai-ngu/luyen-noi/zh/phat-am/tu/thanh-3",
      soundTip: "20 bài phát âm thanh điệu, biến điệu và âm zh/ch/sh.",
    }),
  ]),
  ja: T("Tiếng Nhật", "Hiragana, Katakana, Kanji, luyện nói và phỏng vấn AI, theo từng cấp JLPT.", [
    F("📘", "Bài học theo cấp JLPT", "Bảng chữ cái, từ vựng, chữ Hán và ngữ pháp N5 → N1.", "/app/ngoai-ngu/ja"),
    ...LANG_COMMON("ja", "tiếng Nhật", {
      certLabel: "Chứng nhận JLPT",
      soundHref: "/app/ngoai-ngu/luyen-noi/ja/phat-am/tu/xuc-am",
      soundTip: "20 bài trường âm, âm ngắt っ, cao độ và trợ từ.",
    }),
  ]),
  ko: T("Tiếng Hàn", "Hangul, phát âm nối âm, luyện nói và phỏng vấn AI, theo từng cấp TOPIK.", [
    F("📘", "Bài học theo cấp TOPIK", "Bảng chữ Hangul, từ vựng và ngữ pháp đi theo từng cấp.", "/app/ngoai-ngu/ko"),
    ...LANG_COMMON("ko", "tiếng Hàn", {
      certLabel: "Chứng nhận TOPIK",
      soundHref: "/app/ngoai-ngu/luyen-noi/ko/phat-am/tu/noi-am",
      soundTip: "20 bài nguyên âm đôi, phụ âm căng và quy tắc nối âm.",
    }),
  ]),
  fr: T("Tiếng Pháp", "Phát âm chuẩn Pháp, từ vựng, luyện nói và phỏng vấn AI, theo từng cấp DELF.", [
    F("📘", "Bài học theo cấp DELF", "Từ vựng, ngữ pháp, nối vần và bài đọc theo từng cấp.", "/app/ngoai-ngu/fr"),
    ...LANG_COMMON("fr", "tiếng Pháp", {
      certLabel: "Chứng nhận DELF",
      soundHref: "/app/ngoai-ngu/luyen-noi/fr/phat-am/tu/am-r",
      soundTip: "20 bài âm mũi, âm /ʁ/, phụ âm cuối câm và liaison.",
    }),
  ]),
  es: T("Tiếng Tây Ban Nha", "Phát âm chuẩn Tây Ban Nha, từ vựng, luyện nói và phỏng vấn AI, theo từng cấp DELE.", [
    F("📘", "Bài học theo cấp DELE", "Từ vựng, ngữ pháp, ghép câu và bài đọc từ A1 đến C1.", "/app/ngoai-ngu/es"),
    ...LANG_COMMON("es", "tiếng Tây Ban Nha", {
      certLabel: "Chứng nhận DELE",
      soundHref: "/app/ngoai-ngu/luyen-noi/es/phat-am/tu/am-enie",
      soundTip: "24 bài nguyên âm thuần, ñ, rr rung lưỡi, h câm và nối âm.",
    }),
  ]),
};

async function markSeen(id) {
  try {
    const subjectTips = { ...((S.prefs && S.prefs.subjectTips) || {}), [id]: true };
    const prefs = { ...(S.prefs || {}), subjectTips };
    await api("/api/prefs", "PUT", { prefs });
    S.prefs = prefs;
  } catch { /* lưu lỗi thì thôi, không chặn người dùng */ }
}

export function openSubjectTip(id) {
  const tip = SUBJECT_TIPS[id];
  if (!tip || document.querySelector(".gd")) return;
  // Từng bước: giới thiệu -> mỗi tính năng một bước -> hoàn thành
  const steps = [
    { ic: "🎯", title: tip.title, body: `<p>${esc(tip.intro)}</p><p class="gd-note">Có ${tip.features.length} tính năng cần biết. Bấm <b>Tiếp</b> để xem từng cái.</p>` },
    ...tip.features.map((f) => ({ ic: f.ic, title: f.title, body: `<p>${esc(f.desc)}</p><a class="gd-try" href="${esc(f.href)}" data-close>Mở tính năng này →</a>` })),
    { ic: "✅", title: "Hoàn thành", body: `<p>Bạn đã xem xong hướng dẫn môn <b>${esc(tip.title)}</b>. Hướng dẫn này sẽ không hiện lại.</p>`, last: true },
  ];
  let i = 0;
  const root = document.createElement("div");
  root.className = "gd gd-subject";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", `Hướng dẫn ${tip.title}`);
  root.innerHTML = `
    <div class="gd-card">
      <div class="gd-top"><span class="gd-count" id="gsCount"></span><button type="button" class="gd-skip" id="gsSkip">Bỏ qua</button></div>
      <div class="gd-stage" id="gsStage" aria-live="polite"></div>
      <div class="gd-dots" id="gsDots">${steps.map((_, k) => `<button type="button" class="gd-dot" data-k="${k}" aria-label="Bước ${k + 1}"></button>`).join("")}</div>
      <div class="gd-bar">
        <button type="button" class="gd-btn" id="gsBack">Quay lại</button>
        <button type="button" class="gd-btn gd-primary" id="gsNext"></button>
      </div>
    </div>`;
  document.body.appendChild(root);
  document.body.classList.add("gd-open");
  const stage = root.querySelector("#gsStage");
  const back = root.querySelector("#gsBack");
  const next = root.querySelector("#gsNext");
  const count = root.querySelector("#gsCount");
  const draw = (dir = 1) => {
    const st = steps[i];
    stage.innerHTML = `<div class="gd-slide" style="--dir:${dir}"><span class="gd-ic" aria-hidden="true">${st.ic}</span><h2>${esc(st.title)}</h2><div class="gd-body">${st.body}</div></div>`;
    count.textContent = `${tip.title} · ${i + 1} / ${steps.length}`;
    back.style.visibility = i === 0 ? "hidden" : "visible";
    next.innerHTML = st.last ? `${icon("check")}Hoàn thành` : `Tiếp ${icon("right")}`;
    root.querySelectorAll("#gsDots .gd-dot").forEach((d, k) => d.classList.toggle("on", k === i));
    stage.querySelectorAll("[data-close]").forEach((a) => a.addEventListener("click", () => close()));
  };
  const go = (k, dir) => { i = Math.max(0, Math.min(steps.length - 1, k)); draw(dir); };
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    document.removeEventListener("keydown", onKey);
    root.classList.add("gd-out");
    setTimeout(() => { root.remove(); document.body.classList.remove("gd-open"); }, 220);
    markSeen(id);
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight" && i < steps.length - 1) go(i + 1, 1);
    else if (e.key === "ArrowLeft" && i > 0) go(i - 1, -1);
  };
  document.addEventListener("keydown", onKey);
  root.querySelector("#gsSkip").addEventListener("click", close);
  back.addEventListener("click", () => go(i - 1, -1));
  next.addEventListener("click", () => { if (steps[i].last) close(); else go(i + 1, 1); });
  root.querySelector("#gsDots").addEventListener("click", (e) => { const d = e.target.closest(".gd-dot"); if (d) go(+d.dataset.k, +d.dataset.k > i ? 1 : -1); });
  let sx = null;
  stage.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (dx < -40 && i < steps.length - 1) go(i + 1, 1);
    else if (dx > 40 && i > 0) go(i - 1, -1);
  });
  draw(1);
  next.focus({ preventScroll: true });
}

// Gọi khi vào môn: chỉ tự mở lần đầu cho mỗi môn (đã xem thì không hiện lại)
export async function maybeOpenSubjectTip(id) {
  if (!SUBJECT_TIPS[id]) return;
  try {
    const seen = ((await api("/api/prefs")).prefs || {}).subjectTips || {};
    if (seen[id]) return;
  } catch { return; }
  // Nếu hướng dẫn chung đang mở, đợi nó đóng rồi mới hiện hướng dẫn môn (tối đa 10 phút)
  for (let k = 0; k < 2000 && document.querySelector(".gd:not(.gd-subject)"); k++) await new Promise((r) => setTimeout(r, 300));
  openSubjectTip(id);
}
