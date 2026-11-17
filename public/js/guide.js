/* Hướng dẫn lần đầu sau khi đăng nhập: các bước ngắn về cách học, miễn phí có gì, Pro có gì.
   Có thể bỏ qua bất cứ lúc nào. Đóng bằng bất kỳ cách nào đều ghi nhớ trên tài khoản (prefs.guideSeen),
   nên không hiện lại. Mở lại bất cứ lúc nào từ menu tài khoản. Nội dung và giá lấy từ máy chủ. */
import { S, api, esc, icon, fmtN } from "./core.js";

const money = (n) => fmtN(n) + "đ";

async function loadPlans() {
  try { return await api("/api/billing/plans"); } catch { return null; }
}

function parseBenefits(pl) {
  const b0 = (pl && pl.benefits && pl.benefits[0]) || "";
  const b1 = (pl && pl.benefits && pl.benefits[1]) || "";
  return {
    proAi: (b0.match(/(\d+)\s*lượt hỏi/) || [])[1] || "100",
    freeAi: (b0.match(/được\s*(\d+)\s*lượt/) || [])[1] || "3",
    freeInt: (b1.match(/được\s*(\d+)\s*buổi/) || [])[1] || "1",
  };
}

function slides(pl) {
  const b = parseBenefits(pl);
  const pro1 = pl && pl.plans ? pl.plans.filter((p) => (p.kind || "pro") === "pro").sort((a, b) => a.months - b.months)[0] : null;
  const priceTxt = pro1 ? `từ ${money(pro1.priceVnd)} mỗi tháng` : "";
  return [
    { ic: "👋", title: "Chào bạn đến LifeRivo", body: `
        <p>Học ngoại ngữ bằng tiếng Việt. Mỗi bài khoảng <b>10 phút</b>.</p>
        <ul class="gd-list">
          <li>Đọc phần lý thuyết ngắn.</li>
          <li>Làm bài và nộp để máy chấm ngay.</li>
          <li>Sai ở đâu, máy chỉ ra đúng dòng và cách sửa.</li>
        </ul>` },
    { ic: "🗺️", title: "Cách học mỗi ngày", body: `
        <ol class="gd-steps">
          <li><b>Chọn môn.</b> Bấm <i>Đổi môn</i> ở thanh trên cùng.</li>
          <li><b>Làm từng bài.</b> Mỗi bài một chủ đề nhỏ, đi theo thứ tự.</li>
          <li><b>Học tiếp.</b> Nút <i>Học tiếp</i> đưa bạn về đúng bài đang dở, bài làm nháp vẫn còn.</li>
        </ol>` },
    { ic: "🧭", title: "Mỗi môn có hướng dẫn riêng", body: `
        <p>Khi bạn chọn một môn, LifeRivo sẽ giới thiệu <b>đúng các tính năng của môn đó</b>, ví dụ:</p>
        <ul class="gd-list">
          <li>Tiếng Anh: luyện nói chấm từng từ, luyện phát âm, phỏng vấn thử.</li>
        </ul>
        <p class="gd-note">Bạn có thể mở lại hướng dẫn của từng môn ở trang tổng quan môn đó.</p>` },
    { ic: "🎁", title: "Miễn phí có gì", body: `
        <p>Học miễn phí, không cần thẻ. Bạn có:</p>
        <ul class="gd-list">
          <li>5 ngoại ngữ: Anh, Trung, Nhật, Hàn, Pháp.</li>
          <li>Bài kiểm tra và chứng nhận hoàn thành.</li>
          <li>Trợ lý AI hỏi bài <b>${esc(b.freeAi)} lượt mỗi ngày</b>.</li>
          <li>Phỏng vấn thử <b>${esc(b.freeInt)} buổi</b> miễn phí.</li>
        </ul>` },
    { ic: "⭐", title: "Gói Pro giúp gì", body: `
        <p>Pro không mở thêm bài học. Pro giúp bạn <b>hỏi AI nhiều hơn</b> và <b>biết mình yếu ở đâu</b>:</p>
        <ul class="gd-list">
          <li>Trợ lý AI <b>${esc(b.proAi)} lượt mỗi ngày</b>.</li>
          <li>Phỏng vấn không giới hạn, có nhận xét câu trả lời của bạn.</li>
          <li>Báo cáo học tập chi tiết: bài hay sai, kỹ năng còn yếu.</li>
        </ul>
        <p class="gd-note">${priceTxt ? `Gói Pro ${priceTxt}. ` : ""}Bạn không cần Pro để học. Nâng cấp khi muốn nhiều hơn.</p>` },
    { ic: "🚀", title: "Sẵn sàng rồi", body: `
        <p>Chọn môn bạn muốn học để bắt đầu. Bạn có thể xem lại hướng dẫn này bất cứ lúc nào trong menu tài khoản.</p>` },
  ];
}

async function markSeen() {
  try {
    const prefs = { ...(S.prefs || {}), guideSeen: true };
    await api("/api/prefs", "PUT", { prefs });
    S.prefs = prefs;
  } catch { /* không chặn người dùng nếu lưu lỗi */ }
}

export async function openGuide({ force = false } = {}) {
  if (document.querySelector(".gd")) return;
  if (!force) {
    try {
      const seen = (await api("/api/prefs")).prefs || {};
      if (seen.guideSeen) { S.prefs = { ...(S.prefs || {}), ...seen }; return; }
    } catch { return; }
  }
  const pl = await loadPlans();
  const list = slides(pl);
  let i = 0;
  const root = document.createElement("div");
  root.className = "gd";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", "Hướng dẫn LifeRivo");
  root.innerHTML = `
    <div class="gd-card">
      <div class="gd-top">
        <span class="gd-count" id="gdCount"></span>
        <button type="button" class="gd-skip" id="gdSkip">Bỏ qua</button>
      </div>
      <div class="gd-stage" id="gdStage" aria-live="polite"></div>
      <div class="gd-dots" id="gdDots" role="tablist" aria-label="Các bước hướng dẫn"></div>
      <div class="gd-bar">
        <button type="button" class="gd-btn" id="gdBack">Quay lại</button>
        <button type="button" class="gd-btn gd-primary" id="gdNext"></button>
      </div>
    </div>`;
  document.body.appendChild(root);
  document.body.classList.add("gd-open");

  const stage = root.querySelector("#gdStage");
  const dots = root.querySelector("#gdDots");
  const back = root.querySelector("#gdBack");
  const next = root.querySelector("#gdNext");
  const count = root.querySelector("#gdCount");
  dots.innerHTML = list.map((_, k) => `<button type="button" class="gd-dot" data-k="${k}" aria-label="Bước ${k + 1}"></button>`).join("");

  const draw = (dir = 1) => {
    const s = list[i];
    stage.innerHTML = `<div class="gd-slide" style="--dir:${dir}"><span class="gd-ic" aria-hidden="true">${s.ic}</span><h2>${esc(s.title)}</h2><div class="gd-body">${s.body}</div></div>`;
    count.textContent = `Bước ${i + 1} / ${list.length}`;
    back.disabled = i === 0;
    back.style.visibility = i === 0 ? "hidden" : "visible";
    next.innerHTML = i === list.length - 1 ? `${icon("play")}Bắt đầu học` : `Tiếp ${icon("right")}`;
    dots.querySelectorAll(".gd-dot").forEach((d, k) => d.classList.toggle("on", k === i));
  };
  const go = (k, dir) => { i = Math.max(0, Math.min(list.length - 1, k)); draw(dir); };
  let closed = false;
  const close = async () => {
    if (closed) return;
    closed = true;
    document.removeEventListener("keydown", onKey);
    root.classList.add("gd-out");
    setTimeout(() => { root.remove(); document.body.classList.remove("gd-open"); }, 220);
    await markSeen();
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") { if (i < list.length - 1) go(i + 1, 1); }
    else if (e.key === "ArrowLeft") { if (i > 0) go(i - 1, -1); }
  };
  document.addEventListener("keydown", onKey);
  root.querySelector("#gdSkip").addEventListener("click", () => close());
  back.addEventListener("click", () => go(i - 1, -1));
  next.addEventListener("click", () => { if (i === list.length - 1) close(); else go(i + 1, 1); });
  dots.addEventListener("click", (e) => { const d = e.target.closest(".gd-dot"); if (d) go(+d.dataset.k, +d.dataset.k > i ? 1 : -1); });

  // Vuốt trên điện thoại
  let sx = null;
  stage.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (dx < -40 && i < list.length - 1) go(i + 1, 1);
    else if (dx > 40 && i > 0) go(i - 1, -1);
  });

  draw(1);
  next.focus({ preventScroll: true });
}
