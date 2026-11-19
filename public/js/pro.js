import { currentLang } from "./i18n.js";
/* LifeRivo 3.0 - Structured lessons, Pro plan, VietQR payment, Rivo.
   All entitlements (Pro, AI quota, grading, XP) are decided by the server; this page only renders them. */
import {  } from "./core.js";
import { S, api, esc, icon, fmtN, fmtDate, toast, openModal, confirmBox, $, cfg, copyBtnHtml, aiOn, aiAuto } from "./core.js";

const vnd = (n) => fmtN(n) + "đ";

/* ---------- Lightweight Markdown for AI responses (pre-escaped) ---------- */
// Định dạng câu trả lời của AI (Markdown gọn) thành HTML an toàn: đoạn, danh sách số và gạch đầu dòng,
// đậm/nghiêng, mã, liên kết http(s), bảng, đường kẻ. Chữ được escape trước nên không chèn được HTML.
// Định dạng câu trả lời của AI (Markdown gọn) thành HTML an toàn: đoạn, danh sách số và gạch đầu dòng,
// đậm/nghiêng, mã, liên kết http(s), bảng, đường kẻ, khối mã. Chữ được escape trước nên không chèn được HTML.
const inlineMd = (x) => esc(x)
  .replace(/`([^`\n]+)`/g, "<code>$1</code>")
  .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  .replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>")
  .replace(/__([^_\n]+)__/g, "<b>$1</b>")
  .replace(/(^|[^*\w])\*([^*\n]+)\*/g, "$1<i>$2</i>")
  .replace(/(^|[^\w])_([^_\n]+)_(?!\w)/g, "$1<i>$2</i>");
// Định dạng một dòng (nhãn, nút, gợi ý): không tạo đoạn, bỏ dấu tiêu đề, dấu rào và xuống dòng
export function mdInline(text) {
  return inlineMd(String(text || "").replace(/\r\n?/g, "\n").replace(/```/g, "").replace(/^\s*#{1,6}\s+/gm, "").replace(/\s*\n\s*/g, " ").trim());
}
export function mdLite(text) {
  const htmlBlocks = []; // khối HTML đã dựng (khối mã, bảng, danh sách, đường kẻ): không bọc trong <p>
  let s = String(text || "").replace(/\r\n?/g, "\n");
  // Khối mã ```...``` thành khối riêng; dấu rào lẻ còn sót bị bỏ
  s = s.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, _l, code) => {
    htmlBlocks.push(`<pre class="code-view">${esc(code.replace(/\n$/, ""))}</pre>`);
    return `\n\u0003${htmlBlocks.length - 1}\u0003\n`;
  });
  s = s.replace(/^```[\w-]*\s*$/gm, "").replace(/```/g, "");
  const lines = s.split("\n");
  const out = [];
  const keep = (html) => { htmlBlocks.push(html); out.push(`\u0003${htmlBlocks.length - 1}\u0003`); };
  const BUL = /^\s*[-*•]\s+/, NUM = /^\s*\d+[.)]\s+/;
  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (t.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) { rows.push(lines[i]); i++; }
      const isSep = (r) => /-/.test(r) && /^[\|\s:\-]+$/.test(r.trim());
      const head = rows[0];
      let body = rows.slice(1);
      if (body.length && isSep(body[0])) body = body.slice(1);
      if (rows.length >= 2 && body.length) {
        const cell = (r, tag) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => `<${tag}>${inlineMd(c.trim())}</${tag}>`).join("");
        keep(`<div class="md-scroll"><table class="md-table"><thead><tr>${cell(head, "th")}</tr></thead><tbody>${body.map((r) => `<tr>${cell(r, "td")}</tr>`).join("")}</tbody></table></div>`);
      } else {
        rows.forEach((r) => out.push(inlineMd(r)));
      }
      continue;
    }
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(t)) { keep("<hr>"); i++; continue; }
    if (BUL.test(lines[i]) || NUM.test(lines[i])) {
      const ordered = NUM.test(lines[i]);
      const re = ordered ? NUM : BUL;
      const items = [];
      while (i < lines.length && re.test(lines[i])) { items.push(inlineMd(lines[i].replace(re, "").trim())); i++; }
      const tag = ordered ? "ol" : "ul";
      keep(`<${tag} class="md-list">${items.map((x) => `<li>${x}</li>`).join("")}</${tag}>`);
      continue;
    }
    const h = lines[i].match(/^\s*#{1,6}\s+(.+)$/);
    if (h) { keep(`<p class="md-h">${inlineMd(h[1].trim())}</p>`); i++; continue; }
    out.push(inlineMd(lines[i]));
    i++;
  }
  let res = out.join("\n").split(/\n{2,}/).map((p) => {
    const t = p.trim();
    if (!t) return "";
    const segs = t.split(/(\u0003\d+\u0003)/g).filter((x) => x !== "");
    return segs.map((x) => {
      if (/^\u0003\d+\u0003$/.test(x)) return x;
      const body = x.replace(/\n/g, "<br>").replace(/^(?:<br>)+/, "").replace(/(?:<br>)+$/, "").trim();
      return body ? `<p>${body}</p>` : "";
    }).join("");
  }).join("");
  return res.replace(/\u0003(\d+)\u0003/g, (_, n) => htmlBlocks[Number(n)]);
}
const paras = (t) => String(t || "").split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");

function proBadge() { return `<span class="tag tag-pro">PRO</span>`; }
function upsell(title, text) {
  return `<section class="sheet sheet-pad upsell"><div class="upsell-ic">${icon("star")}</div><div><h2>${esc(title)}</h2><p class="muted">${esc(text)}</p>
    <div class="row" style="margin-top:12px"><a class="btn btn-primary" href="/app/bang-gia">${icon("star")}Xem gói Pro</a><a class="btn" href="/app/ngoai-ngu">Về danh sách bài học</a></div></div></section>`;
}

/* =================== LESSON LIST =================== */
const chapterTitle = (title) => String(title || "").replace(/^Chương\s*\d+\s*:\s*/i, "");

const LessonsIndex = (all, l) => all.indexOf(l);

/* =================== SINGLE LESSON =================== */
/* =================== PRICING & PAYMENT =================== */
export async function pagePricing(main, _p, _q, ctx) {
  ctx.setCrumbs([["Học viên", "/app/"], ["Bảng giá Pro"]]);
  main.innerHTML = `<div class="skel" style="height:360px"></div>`;
  const [pl, me] = await Promise.all([api("/api/billing/plans"), api("/api/billing/me")]);
  if (!ctx.isCurrent()) return;
  const mem = me.membership;
  const kind = ["pro", "family", "teacher"].includes(_q.goi) ? _q.goi : "pro";
  const plans = pl.plans.filter((p) => (p.kind || "pro") === kind);
  const base = plans.find((p) => p.months === 1);
  const pending = me.orders.filter((o) => o.status === "pending" && (o.claimedAt || Date.parse(o.expiresAt) > Date.now()));
  const BENEFITS = {
    pro: pl.benefits,
    family: ["4 tài khoản riêng, mỗi người một tiến độ", "Mọi thành viên có đầy đủ quyền Pro", "Chủ gói mời / xóa thành viên", "Xem tiến độ của thành viên đã đồng ý chia sẻ"],
    teacher: ["Tạo và quản lý nhiều lớp", "Học sinh trong lớp được quyền Pro trong thời hạn giấy phép", "Giao bài, kiểm tra, chấm tự động và chấm tay", "Báo cáo tiến độ, xuất Excel / PDF", "AI hỗ trợ giảng dạy"],
  };
  const card = (p) => {
    const save = base && p.months > 1 ? Math.round((1 - p.priceVnd / (base.priceVnd * p.months)) * 100) : 0;
    const best = kind === "pro" ? p.months === 12 : kind === "family" ? p.months === 12 : p.seats === 30;
    return `<div class="plan-card ${best ? "best" : ""}">${best ? `<span class="plan-flag">${kind === "teacher" ? "Phổ biến" : "Tiết kiệm nhất"}</span>` : ""}<h3>${esc(p.name)}</h3>
      ${p.quoteOnly ? `<div class="price">Liên hệ</div><p class="small muted">${kind === "teacher" ? "Báo giá theo số học sinh" : "Liên hệ để nâng cấp"}</p>` : `<div class="price">${vnd(p.priceVnd)}</div><p class="small muted">${kind === "teacher" ? `${p.seats} học sinh · ${p.months} tháng` : p.months > 1 ? `≈ ${vnd(p.perMonth)}/tháng${save > 0 ? ` · tiết kiệm ${save}%` : ""}` : "Thanh toán theo tháng"}</p>`}
      <ul>${BENEFITS[kind].map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
      ${p.quoteOnly ? `<button class="btn" data-quote="${esc(p.name)}">${icon("send")}Liên hệ nâng cấp</button>` : `<button class="btn btn-primary" data-buy="${esc(p.id)}">${icon("star")}Chọn gói</button>`}</div>`;
  };
  const curPerksHtml = `
    <div class="plan-m-perks">
      <h2>Quyền lợi hiện tại</h2>
      <div class="plan-m-perk"><span class="plan-m-ico is-blue">📘</span><div><b>Bài học cơ bản</b><span>Truy cập các bài mở miễn phí</span></div></div>
      <div class="plan-m-perk"><span class="plan-m-ico is-green">📊</span><div><b>Theo dõi tiến độ</b><span>Lưu kết quả và lịch sử học tập</span></div></div>
      <div class="plan-m-perk"><span class="plan-m-ico is-orange">💬</span><div><b>Hỗ trợ</b><span>Liên hệ khi cần nâng cấp hoặc gia hạn</span></div></div>
    </div>`;
  main.innerHTML = `
    <div class="page-head"><div><h1>Bảng giá</h1><p>Học nền tảng miễn phí mãi mãi. Chọn gói phù hợp khi cần thêm.</p></div></div>
    <nav class="tabs" style="margin-bottom:16px">${[["pro", "Cá nhân (Pro)"], ["family", "Gia đình (Family)"], ["teacher", "Giáo viên (Teacher)"]].map(([k, l]) => `<a href="/app/bang-gia?goi=${k}" class="${k === kind ? "on" : ""}">${l}</a>`).join("")}</nav>
    ${mem.pro && kind === "pro" ? `<div class="req" style="margin-bottom:16px"><b>Bạn đang có quyền ${esc(mem.planName || "Pro")}</b>${mem.staff ? "Tài khoản quản trị luôn có quyền Pro để xem trước nội dung." : `Hạn dùng đến ${fmtDate(mem.expiresAt, false)}${(mem.sources || []).length ? ` (nguồn: ${(mem.sources || []).map((x) => esc(x.label)).join(", ")})` : ""}. Mua thêm Pro cá nhân được cộng nối tiếp và không phụ thuộc lớp học hay gói gia đình.`}</div>` : ""}
    ${!pl.enabled ? `<div class="sheet sheet-pad plan-m-card">
      <div class="plan-m-top"><span class="lx-ex-pill">${mem.pro ? "PRO" : "FREE"}</span><span class="plan-m-active">Đang hoạt động</span></div>
      <h2>${mem.pro ? esc(mem.planName || "Gói Pro") : "Gói Free"}</h2>
      <p class="muted">Hiện chưa mở bán gói mới. Bạn vẫn học được toàn bộ nội dung miễn phí.</p>
      <a class="btn btn-primary btn-block" href="/app/ngoai-ngu">Vào khóa học</a>
    </div>${curPerksHtml}` : !plans.length ? `<div class="sheet sheet-pad empty"><b>Chưa có gói loại này</b>Quản trị viên chưa mở bán.</div>${curPerksHtml}` : `
    ${kind === "pro" ? proLayout(pl, mem, plans) : `    <div class="plan-grid">
      ${kind === "pro" ? `<div class="plan-card free"><h3>Free</h3><div class="price">0đ</div><ul>
        <li>Toàn bộ 6 ngoại ngữ, mọi cấp độ</li><li>Bài kiểm tra và chứng nhận hoàn thành</li><li>Rivo ${cfg("aiEnabled", true) ? "giới hạn lượt mỗi ngày" : "(đang tắt)"}</li></ul>
        <button class="btn" disabled>${mem.pro ? "Gói cơ bản" : "Đang dùng"}</button></div>` : ""}
      ${plans.map(card).join("")}
    </div>`}${curPerksHtml}`}
    ${pending.length ? `<section class="sheet sheet-pad" style="margin-top:16px"><h2>Đơn đang chờ thanh toán</h2>${pending.map((o) => `<div class="row order-row"><b>${esc(o.code)}</b><span>${esc(o.planName)}</span><span>${vnd(o.amountVnd)}</span>${o.claimedAt ? `<span class="tag tag-cam">Đã báo chuyển, chờ xác nhận</span>` : `<span class="small muted">hết hạn ${fmtDate(o.expiresAt)}</span>`}<span class="spacer"></span><button class="btn btn-sm btn-primary" data-resume="${o.id}">${o.claimedAt ? "Xem" : "Thanh toán"}</button>${o.claimedAt ? "" : `<button class="btn btn-sm btn-ghost" data-cancel="${o.id}">Hủy</button>`}</div>`).join("")}</section>` : ""}
    <section class="sheet sheet-pad faq" style="margin-top:16px"><h2>Câu hỏi thường gặp</h2>
      <details><summary>Thanh toán thế nào?</summary><p>${cfg("payMode", "manual") === "sepay"
        ? "Chuyển khoản ngân hàng bằng mã QR (VietQR). Hệ thống nhận thông báo từ ngân hàng và tự kích hoạt Pro trong khoảng 1 đến 3 phút khi số tiền và mã đơn khớp. Không cần gửi ảnh chụp màn hình."
        : `Quét mã QR (VietQR) bằng app ngân hàng bất kỳ, chuyển đúng số tiền và nội dung là mã đơn, rồi bấm “Tôi đã chuyển khoản”. Quản trị viên đối chiếu tài khoản và kích hoạt Pro. ${esc(cfg("manualConfirmNote", ""))} Không cần gửi ảnh chụp màn hình.`}</p></details>
      <details><summary>Có tự động trừ tiền gia hạn không?</summary><p>Không. Chuyển khoản không tự trừ tiền. Gần hết hạn bạn sẽ được nhắc; muốn tiếp tục thì mua thêm, thời gian được cộng nối tiếp.</p></details>
      <details><summary>Chuyển khoản rồi mà chưa được kích hoạt?</summary><p>Kiểm tra bạn đã ghi đúng nội dung chuyển khoản (mã đơn) và đủ số tiền. Sau 15 phút vẫn chưa được, hãy liên hệ ${esc(pl.support || "quản trị viên")} kèm mã đơn và mã giao dịch ngân hàng.</p></details>
      <details><summary>Có hoàn tiền không?</summary><p>Xem <a href="/${currentLang()}/refund">Chính sách hoàn tiền</a>, <a href="/${currentLang()}/terms">Điều khoản sử dụng</a> và <a href="/${currentLang()}/payment">Chính sách thanh toán</a>.</p></details>
    </section>`;
  main.querySelectorAll("[data-buy]").forEach((b) => b.addEventListener("click", async () => {
    b.disabled = true;
    try { const r = await api("/api/billing/orders", "POST", { planId: b.dataset.buy }); checkout(r, ctx, () => (kind === "pro" ? pagePricing(main, _p, _q, ctx) : location.reload())); }
    catch (e) { toast(e.message, "err"); }
    b.disabled = false;
  }));
  main.querySelectorAll("[data-quote]").forEach((b) => b.addEventListener("click", () => openModal(`<h2>Liên hệ nâng cấp ${esc(b.dataset.quote)}</h2><p>Liên hệ ${esc(pl.support || "quản trị viên")} để nâng cấp gói. Sau khi thống nhất, quản trị viên cấp quyền trực tiếp cho tài khoản của bạn.</p>`)));
  main.querySelectorAll("[data-resume]").forEach((b) => b.addEventListener("click", async () => { try { checkout(await api(`/api/billing/orders/${b.dataset.resume}`), ctx, () => pagePricing(main, _p, _q, ctx)); } catch (e) { toast(e.message, "err"); } }));
  main.querySelectorAll("[data-cancel]").forEach((b) => b.addEventListener("click", async () => {
    if (!(await confirmBox("Hủy đơn này?", "Nếu bạn đã chuyển khoản cho đơn này thì đừng hủy, hãy chờ hệ thống kích hoạt.", "Hủy đơn", true))) return;
    try { await api(`/api/billing/orders/${b.dataset.cancel}/cancel`, "POST", {}); pagePricing(main, _p, _q, ctx); } catch (e) { toast(e.message, "err"); }
  }));
}

// Bố cục bảng giá Pro: lợi ích, chọn thời hạn, so sánh Miễn phí và Pro. Số liệu lấy từ máy chủ (pl.benefits).
function proLayout(pl, mem, plans) {
  const b0 = (pl.benefits && pl.benefits[0]) || "";
  const b1 = (pl.benefits && pl.benefits[1]) || "";
  const proAi = (b0.match(/(\d+)\s*lượt hỏi/) || [])[1] || "100";
  const freeAi = (b0.match(/được\s*(\d+)\s*lượt/) || [])[1] || "3";
  const freeInt = b1.match(/được\s*(\d+)\s*buổi/);
  const sorted = [...plans].sort((x, y) => x.months - y.months);
  const base = sorted.find((p) => p.months === 1);
  const benefitCards = [
    ["✨", "Hỏi AI nhiều hơn", `${proAi} lượt mỗi ngày, thay vì ${freeAi} lượt. Hỏi bài, nhờ gợi ý khi bí và nhận xét bài viết.`],
    ["💼", "Phỏng vấn có nhận xét", "Nói câu trả lời trước, rồi xin AI chỉ ra chỗ đúng và chỗ còn thiếu. Không giới hạn số buổi."],
    ["📊", "Biết mình yếu ở đâu", "Báo cáo tỉ lệ đạt, bài hay sai và kỹ năng còn yếu để ôn đúng chỗ."],
  ];
  const rows = [
    ["Bài 6 ngoại ngữ", "Đầy đủ", "Đầy đủ"],
    ["Bài kiểm tra và chứng nhận hoàn thành", "Có", "Có"],
    ["Trợ lý AI hỏi bài", `${freeAi} lượt mỗi ngày`, `${proAi} lượt mỗi ngày`],
    ["Phỏng vấn có nhận xét AI", freeInt ? `${freeInt[1]} buổi miễn phí` : "Không", "Không giới hạn"],
    ["Báo cáo học tập chi tiết", "Không", "Có"],
  ];
  const planCard = (p) => {
    const best = p.months === 12;
    const save = base && p.months > 1 ? Math.round((1 - p.priceVnd / (base.priceVnd * p.months)) * 100) : 0;
    const perMonth = Math.round(p.priceVnd / p.months);
    return `<article class="pz-plan${best ? " best" : ""}">
      ${best ? `<span class="pz-flag">Tiết kiệm nhất</span>` : ""}
      <h3>${esc(p.name)}</h3>
      <div class="pz-price"><b>${vnd(p.priceVnd)}</b><span>${p.months === 1 ? "mỗi tháng" : `khoảng ${vnd(perMonth)} mỗi tháng`}</span></div>
      ${save > 0 ? `<p class="pz-save">Rẻ hơn ${save}% so với mua từng tháng</p>` : `<p class="pz-save pz-muted">Thử trước, không ràng buộc</p>`}
      <button class="btn ${best ? "btn-primary" : ""} pz-cta" data-buy="${esc(p.id)}">${icon("star")}Nâng cấp bằng gói này</button>
      <p class="pz-note">Thanh toán một lần. Không tự gia hạn.</p>
    </article>`;
  };
  return `
    <section class="pz-hero">
      <div>
        <span class="pz-eyebrow">Gói Pro</span>
        <h2>Học nhanh hơn, có trợ lý AI đi cùng</h2>
        <p>Học miễn phí mãi mãi vẫn có. Pro dành cho bạn muốn hỏi AI nhiều hơn, luyện phỏng vấn có nhận xét và biết chính xác mình đang yếu ở đâu.</p>
      </div>
      ${mem.pro ? "" : `<a class="pz-hero-link" href="/app/?chon=1">Học thử miễn phí trước →</a>`}
    </section>
    <div class="pz-benefits">${benefitCards.map(([i, t, d]) => `<article class="pz-ben"><span class="pz-ben-ic" aria-hidden="true">${i}</span><b>${esc(t)}</b><p>${esc(d)}</p></article>`).join("")}</div>
    <h2 class="pz-h">Chọn thời hạn</h2>
    <div class="pz-plans">${sorted.map(planCard).join("")}</div>
    <h2 class="pz-h">So sánh Miễn phí và Pro</h2>
    <div class="pz-table-wrap"><table class="pz-table"><thead><tr><th scope="col"></th><th scope="col">Miễn phí</th><th scope="col" class="pz-pro-col">Pro</th></tr></thead>
      <tbody>${rows.map(([a, b, c]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td><td class="pz-pro-col">${esc(c)}</td></tr>`).join("")}</tbody></table></div>`;
}

function checkout(r, ctx, onDone) {
  const o = r.order, p = r.pay;
  const manual = r.mode !== "sepay";
  if (!p) { toast(o.status === "paid" ? "Đơn này đã thanh toán." : "Đơn đã hết hạn hoặc bị hủy. Hãy tạo đơn mới.", "info"); return; }
  const copy = (v) => `<button class="btn btn-xs btn-ghost" data-copy="${esc(v)}" aria-label="Sao chép">${icon("copy", 'width="13" height="13"')}</button>`;
  const waitText = () => manual
    ? (o.claimedAt ? `${icon("clock")} Đã báo chuyển khoản lúc ${fmtDate(o.claimedAt)}. Quản trị viên đang kiểm tra tài khoản. ${esc(p.confirmNote || "")}` : "")
    : `<span class="spin"></span> Đang chờ tiền về…`;
  const m = openModal(`
    <h2>Thanh toán ${esc(o.planName || "")}</h2>
    <div class="checkout">
      <div class="qr-box">${p.qrImage ? `<img src="${p.qrImage}" alt="Mã QR chuyển khoản ${esc(o.code)}" width="240" height="240">` : `<p class="form-msg err">Chưa tạo được mã QR, hãy chuyển khoản theo thông tin bên cạnh.</p>`}<p class="small muted">Mở app ngân hàng, chọn quét QR. Số tiền và nội dung đã điền sẵn (chuẩn VietQR, quét được bằng mọi app ngân hàng).</p></div>
      <dl class="pay-info">
        <dt>Ngân hàng</dt><dd>${esc(p.bank)}</dd>
        <dt>Số tài khoản</dt><dd><b>${esc(p.accountNo)}</b> ${copy(p.accountNo)}</dd>
        <dt>Chủ tài khoản</dt><dd>${esc(p.accountName || "")}</dd>
        <dt>Số tiền</dt><dd><b>${vnd(p.amount)}</b> ${copy(String(p.amount))}</dd>
        <dt>Nội dung</dt><dd><b class="pay-code">${esc(p.content)}</b> ${copy(p.content)}</dd>
      </dl>
    </div>
    <div class="pay-warn">Ghi <b>đúng nội dung ${esc(p.content)}</b> và chuyển <b>đủ ${vnd(p.amount)}</b>. ${manual
      ? "Chuyển xong, bấm <b>Tôi đã chuyển khoản</b> để quản trị viên kiểm tra và kích hoạt Pro. Không cần gửi ảnh chụp màn hình."
      : `Hệ thống tự kích hoạt khi tiền về, thường trong 1 đến 3 phút. Đơn hết hạn lúc ${fmtDate(o.expiresAt)}.`}</div>
    ${manual && !o.claimedAt ? `<div class="row" style="margin-top:12px"><button class="btn btn-primary" id="claimBtn">${icon("check")}Tôi đã chuyển khoản</button><span class="small muted">Đơn giữ đến ${fmtDate(o.expiresAt)}</span></div>` : ""}
    <p class="pay-status" id="payStatus">${waitText()}</p>`, { cls: "wide", label: "Thanh toán" });
  m.el.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => { navigator.clipboard?.writeText(b.dataset.copy).then(() => toast("Đã sao chép.", "ok")).catch(() => {}); }));
  m.el.querySelector("#claimBtn")?.addEventListener("click", async (e) => {
    const b = e.currentTarget; b.disabled = true;
    try {
      const j = await api(`/api/billing/orders/${o.id}/claim`, "POST", {});
      o.claimedAt = j.order.claimedAt; b.parentElement.remove();
      m.el.querySelector("#payStatus").innerHTML = waitText();
      toast("Đã báo quản trị viên. Pro sẽ được kích hoạt sau khi kiểm tra.", "ok", 5000);
      if (!started) { started = true; setTimeout(poll, 15000); }
    } catch (err) { toast(err.message, "err"); b.disabled = false; }
  });
  let stop = false, n = 0, started = false;
  const poll = async () => {
    if (stop || !document.body.contains(m.el)) return;
    n++;
    try {
      const s = await api(`/api/billing/orders/${o.id}`);
      if (s.order.status === "paid") {
        const el = m.el.querySelector("#payStatus");
        el.innerHTML = `${icon("check")} Đã nhận thanh toán. Pro có hiệu lực đến ${fmtDate(s.membership.expiresAt, false)}.`; el.classList.add("ok");
        toast("Kích hoạt Pro thành công. Cảm ơn bạn!", "ok", 5000);
        stop = true; setTimeout(() => { m.close(); onDone && onDone(); }, 2500); return;
      }
      if (s.order.status !== "pending") { m.el.querySelector("#payStatus").textContent = "Đơn đã bị hủy hoặc hết hạn. Nếu bạn đã chuyển tiền, hãy liên hệ hỗ trợ kèm mã đơn."; stop = true; return; }
    } catch (e) {}
    if (n < 240) setTimeout(poll, manual ? 30000 : n < 60 ? 5000 : 15000);
    else if (!manual) m.el.querySelector("#payStatus").textContent = "Chưa nhận được thanh toán. Nếu đã chuyển, hãy tải lại trang sau ít phút hoặc liên hệ hỗ trợ kèm mã đơn.";
  };
  // SePay: poll immediately. Personal QR: only poll after the student confirms transfer.
  if (!manual || o.claimedAt) { started = true; setTimeout(poll, manual ? 15000 : 4000); }
  ctx.onLeave(() => { stop = true; });
}

/* =================== MY PLAN =================== */
export async function pageMyPlan(main, _p, _q, ctx) {
  ctx.setCrumbs([["Học viên", "/app/"], ["Gói của tôi"]]);
  main.innerHTML = `<div class="skel" style="height:300px"></div>`;
  const me = await api("/api/billing/me");
  if (!ctx.isCurrent()) return;
  const m = me.membership;
  const ORDER_ST = { pending: ["Chờ thanh toán", "tag-cam"], paid: ["Đã thanh toán", "tag-la"], expired: ["Hết hạn", "tag-line"], canceled: ["Đã hủy", "tag-line"] };
  const SUB_ST = { active: "Đang hiệu lực", canceled: "Đã tắt nhắc gia hạn", expired: "Đã hết hạn", revoked: "Đã thu hồi" };
  main.innerHTML = `
    <div class="page-head"><div><h1>Gói của tôi</h1><p>Trạng thái thành viên, lịch sử đơn hàng và gia hạn.</p></div></div>
    <section class="sheet sheet-pad plan-m-card" style="margin-bottom:16px">
      <div class="plan-m-top">
        <span class="lx-ex-pill">${m.pro ? "PRO" : "FREE"}</span>
        <span class="plan-m-active">Đang hoạt động</span>
      </div>
      <div class="row" style="gap:14px;align-items:flex-start">
        <div class="plan-now ${m.pro ? "pro" : ""}">${m.pro ? "PRO" : "FREE"}</div>
        <div style="flex:1;min-width:220px">
          <h2>${m.pro ? esc(m.planName || "Gói Pro") : "Gói Free"}</h2>
          <p class="muted">${m.staff ? "Tài khoản quản trị có quyền Pro để xem trước nội dung." : m.pro ? `${m.source === "trial" ? "Bạn đang dùng thử Pro miễn phí. Còn " : "Hiệu lực đến "}<b>${fmtDate(m.expiresAt, false)}</b> (${Math.max(0, Math.ceil((Date.parse(m.expiresAt) - Date.now()) / 86400000))} ngày nữa).` : "Bạn đang dùng gói miễn phí."}</p>
          ${m.pro && !m.staff ? `<label class="switch-row"><input type="checkbox" id="remind" ${m.renewReminder ? "checked" : ""}> Nhắc tôi gia hạn khi sắp hết hạn</label><p class="small muted">Thanh toán bằng chuyển khoản nên không có tự động trừ tiền. Tắt nhắc gia hạn tương đương hủy gia hạn; quyền Pro vẫn dùng đến hết hạn.</p>` : ""}
        </div>
        <a class="btn btn-primary" href="/app/bang-gia">${icon("star")}${m.pro && !m.staff ? "Gia hạn" : "Xem bảng giá"}</a>
      </div>
    </section>
    <div class="plan-m-perks" style="margin-bottom:16px">
      <h2>Quyền lợi hiện tại</h2>
      <div class="plan-m-perk"><span class="plan-m-ico is-blue">📘</span><div><b>Bài học cơ bản</b><span>Truy cập các bài mở miễn phí</span></div></div>
      <div class="plan-m-perk"><span class="plan-m-ico is-green">📊</span><div><b>Theo dõi tiến độ</b><span>Lưu kết quả và lịch sử học tập</span></div></div>
      <div class="plan-m-perk"><span class="plan-m-ico is-orange">💬</span><div><b>Hỗ trợ</b><span>Liên hệ khi cần nâng cấp hoặc gia hạn</span></div></div>
    </div>
    <section class="sheet sheet-pad"><h2>Lịch sử đơn hàng</h2>
      ${me.orders.length ? `<div class="table-wrap" style="border:0"><table><thead><tr><th>Mã đơn</th><th>Gói</th><th class="num">Số tiền</th><th>Trạng thái</th><th>Tạo lúc</th><th>Thanh toán lúc</th></tr></thead><tbody>
        ${me.orders.map((o) => `<tr><td><b>${esc(o.code)}</b></td><td>${esc(o.planName)}</td><td class="num">${vnd(o.amountVnd)}</td><td>${o.status === "pending" && o.claimedAt ? `<span class="tag tag-cam">Chờ quản trị xác nhận</span>` : `<span class="tag ${ORDER_ST[o.status][1]}">${ORDER_ST[o.status][0]}</span>`}</td><td>${fmtDate(o.createdAt)}</td><td>${o.paidAt ? fmtDate(o.paidAt) : ""}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Chưa có đơn hàng nào.</p>`}
      ${me.subscriptions.length ? `<h3 style="margin-top:16px">Các kỳ thành viên</h3><ul class="plain">${me.subscriptions.map((s) => `<li>${esc(s.plan_name || "Pro")} · ${fmtDate(s.starts_at, false)} → ${fmtDate(s.expires_at, false)} · ${SUB_ST[s.status] || s.status}${s.source === "admin" ? " · được tặng" : ""}</li>`).join("")}</ul>` : ""}
    </section>`;
  $("#remind", main)?.addEventListener("change", async (e) => {
    try { await api("/api/billing/reminder", "POST", { on: e.target.checked }); toast(e.target.checked ? "Đã bật nhắc gia hạn." : "Đã hủy gia hạn. Pro vẫn dùng đến hết hạn.", "ok"); }
    catch (err) { toast(err.message, "err"); e.target.checked = !e.target.checked; }
  });
}

/* =================== AI TUTOR =================== */
const MODE_LABEL = { ask: "Hỏi tự do", explain_error: "Giải thích lỗi", review: "Nhận xét bài làm", hint: "Gợi ý bài tập", exercise: "Thêm bài luyện", next: "Nên học gì tiếp" };
function quotaLine(q) {
  if (!q || !q.limits) return "";
  return `Còn ${q.remaining.day}/${q.limits.day} lượt hôm nay · ${q.remaining.month}/${q.limits.month} lượt tháng này`;
}
export async function pageAi(main, [convId], _q, ctx) {
  ctx.setCrumbs([["Học viên", "/app/"], ["AI Tutor"]]);
  main.innerHTML = `<div class="skel" style="height:360px"></div>`;
  let st, convRes;
  try {
    [st, convRes] = await Promise.all([
      api("/api/ai/status"),
      api("/api/ai/conversations").catch(() => ({ conversations: [] })),
    ]);
  } catch (e) {
    main.innerHTML = `<div class="sheet empty"><b>Không mở được Rivo</b><p>${esc(e.message)}</p></div>`;
    return;
  }
  if (!ctx.isCurrent()) return;
  if (!st.enabled || !st.configured) {
    main.innerHTML = `<div class="sheet empty" style="padding:48px 20px"><b>Trợ lý AI tạm thời chưa sẵn sàng</b><p class="muted">Bạn thử lại sau nhé.</p></div>`;
    return;
  }
  const SUBJECTS = [
    ["en", "🇬🇧 Tiếng Anh", { langItem: "en", langName: "Tiếng Anh", page: "Hội thoại AI · Tiếng Anh" }, ["Phân biệt các thì hiện tại trong tiếng Anh", "Mẹo nhớ từ vựng tiếng Anh lâu quên", "Cách phát âm đuôi -ed và -s/-es", "Luyện hội thoại giao tiếp tiếng Anh hằng ngày"]],
    ["zh", "🇨🇳 Tiếng Trung", { langItem: "zh", langName: "Tiếng Trung", page: "Hội thoại AI · Tiếng Trung" }, ["Quy tắc biến điệu thanh 3 trong tiếng Trung", "Cách dùng trợ từ 了 (le) và 的 (de)", "Mẹo nhớ chữ Hán HSK 1–2 theo bộ thủ", "Các câu giao tiếp tiếng Trung thông dụng"]],
    ["ja", "🇯🇵 Tiếng Nhật", { langItem: "ja", langName: "Tiếng Nhật", page: "Hội thoại AI · Tiếng Nhật" }, ["Phân biệt trợ từ は (wa), が (ga), を (o)", "Cách chia thể ます (masu) và て (te)", "Mẹo học bảng chữ Hiragana và Katakana", "Các mẫu câu giao tiếp JLPT N5"]],
    ["ko", "🇰🇷 Tiếng Hàn", { langItem: "ko", langName: "Tiếng Hàn", page: "Hội thoại AI · Tiếng Hàn" }, ["Cách ghép âm bảng chữ cái Hangul", "Phân biệt tiểu từ 은/는 và 이/가", "Cách chia đuôi câu lịch sự -아요/-어요", "Từ vựng và mẫu câu TOPIK I cơ bản"]],
    ["fr", "🇫🇷 Tiếng Pháp", { langItem: "fr", langName: "Tiếng Pháp", page: "Hội thoại AI · Tiếng Pháp" }, ["Cách chia động từ nhóm 1 (-er) trong tiếng Pháp", "Phân biệt mạo từ xác định le, la, les và un, une", "Quy tắc nối âm (liaison) và phát âm tiếng Pháp", "Mẫu câu giao tiếp DELF A1 cơ bản"]],
    ["es", "🇪🇸 Tiếng Tây Ban Nha", { langItem: "es", langName: "Tiếng Tây Ban Nha", page: "Hội thoại AI · Tiếng Tây Ban Nha" }, ["Phân biệt động từ ser và estar trong tiếng Tây Ban Nha", "Cách chia động từ đuôi -ar, -er, -ir ở hiện tại", "Quy tắc phát âm h câm, ñ, r và rr rung lưỡi", "Mẫu câu giao tiếp DELE A1 cơ bản"]],
  ];
  // Khởi đầu theo môn ngoại ngữ đang chọn ở thanh trên cùng (pl:subject); mặc định tiếng Anh.
  let _selSubj = "";
  try { _selSubj = localStorage.getItem("pl:subject") || ""; } catch {}
  if (!_selSubj && S.prefs && S.prefs.subject) _selSubj = S.prefs.subject;
  let curSubj = SUBJECTS.some((x) => x[0] === _selSubj) ? _selSubj : "en";
  let curConvId = convId ? Number(convId) : null;
  let convList = convRes.conversations || [];
  let persona = "student";
  const personas = st.personas || ["student"];
  const P_LABEL = { student: "Gia sư Việt", native: "Gia sư bản ngữ", english: "English Tutor", teacher: "Trợ giảng" };

  main.innerHTML = `
    <div class="ai-m-top">
      <div class="sp-m-coach-head">
        <img class="sp-m-coach-img" src="/img/kit/chibi-owl.webp" width="68" height="68" alt="" loading="lazy" decoding="async">
        <div class="sp-m-coach-copy">
          <b>Rivo AI Tutor</b>
          <span>Trợ lý học tập của bạn</span>
        </div>
        <em class="sp-m-lv-pill">AI</em>
      </div>
      <div class="ai-m-welcome">
        <h2>Hôm nay bạn muốn học gì?</h2>
        <p>Hỏi về bài học, nhờ giải thích lỗi sai hoặc luyện giao tiếp.</p>
      </div>
      <div class="ai-m-quick">
        <h3>Gợi ý nhanh</h3>
        <div class="sp-m-mode-list">
          <button type="button" class="sp-m-mode-row" data-ai-quick="Hãy giải thích các lỗi ngữ pháp và từ vựng thường gặp trong bài đang học.">
            <span class="sp-m-mode-ic">✨</span>
            <span class="sp-m-mode-txt"><b>Giải thích lỗi sai</b><small>Hiểu vì sao đáp án chưa đúng</small></span>
            <span class="sp-m-arr" aria-hidden="true">›</span>
          </button>
          <button type="button" class="sp-m-mode-row" data-ai-quick="Hãy đóng vai người bản ngữ để luyện hội thoại giao tiếp hằng ngày với mình.">
            <span class="sp-m-mode-ic">🎙️</span>
            <span class="sp-m-mode-txt"><b>Luyện hội thoại</b><small>Thực hành tình huống giao tiếp</small></span>
            <span class="sp-m-arr" aria-hidden="true">›</span>
          </button>
          <button type="button" class="sp-m-mode-row" data-ai-quick="Hãy lập kế hoạch học tập chia mục tiêu thành các nhiệm vụ nhỏ mỗi ngày.">
            <span class="sp-m-mode-ic">🗺️</span>
            <span class="sp-m-mode-txt"><b>Lập kế hoạch học</b><small>Chia mục tiêu thành nhiệm vụ nhỏ</small></span>
            <span class="sp-m-arr" aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    </div>
    <div class="page-head"><div><span class="edu-eyebrow">TRỢ LÝ HỌC TẬP ĐA MÔN</span><h1>Hội thoại Rivo</h1><p>Chọn ngoại ngữ bạn đang học — gia sư AI sẽ giải thích ngữ pháp, sửa câu sai, gợi ý bài tập và luyện giao tiếp theo đúng giáo trình.</p></div></div>
    <div class="ch-layout">
      <div class="stack">
        <section class="sheet sheet-pad">
          <div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px">
            <div class="chips" id="aiSubjTabs">${SUBJECTS.map(([k, label]) => `<button type="button" class="chip ${k === curSubj ? "on" : ""}" data-subj="${k}">${label}</button>`).join("")}</div>
            ${personas.length > 1 ? `<div class="tabs" id="aiPersonaTabs">${personas.map((p) => `<button type="button" class="${p === persona ? "on" : ""}" data-p="${p}">${P_LABEL[p] || p}</button>`).join("")}</div>` : ""}
          </div>
          <div class="chips" id="aiQuickChips" style="margin-bottom:12px"></div>
          <div class="ai-msgs" id="aiChatMsgs" style="min-height:280px;max-height:480px;overflow:auto;padding:8px 0;display:flex;flex-direction:column;gap:8px" aria-live="polite"></div>
          <form id="aiChatForm" class="ai-inline-form" style="margin-top:12px">
            <textarea name="q" rows="2" maxlength="2000" placeholder="Nhập câu hỏi của bạn..."></textarea>
            <button class="btn btn-primary" type="submit">${icon("send")}Gửi</button>
          </form>
          <p class="small muted" id="aiChatQuota" style="margin-top:8px">${quotaLine(st)}</p>
        </section>
      </div>
      <aside class="stack">
        <section class="sheet sheet-pad">
          <div class="row" style="justify-content:space-between"><h3>Cuộc trò chuyện</h3><button type="button" class="btn btn-sm" id="aiNewConv">+ Mới</button></div>
          <div id="aiConvList" style="margin-top:10px"></div>
        </section>
      </aside>
    </div>`;

  const msgsEl = $("#aiChatMsgs", main);
  const quickEl = $("#aiQuickChips", main);
  const convListEl = $("#aiConvList", main);

  const paintGreeting = () => {
    const sub = SUBJECTS.find((x) => x[0] === curSubj) || SUBJECTS[0];
    msgsEl.innerHTML = `<div class="msg assistant">Chào bạn! Mình đang ở chế độ hỗ trợ <b>${esc(sub[1])}</b>. Bạn có thể bấm một gợi ý phía trên hoặc nhập câu hỏi bất kỳ nhé.</div>`;
  };
  const paintQuick = () => {
    const sub = SUBJECTS.find((x) => x[0] === curSubj) || SUBJECTS[0];
    quickEl.innerHTML = sub[3].map((q, i) => `<button type="button" class="chip" data-q="${i}">${esc(q)}</button>`).join("");
    quickEl.querySelectorAll("[data-q]").forEach((b) => b.addEventListener("click", () => sendQuestion(sub[3][Number(b.dataset.q)])));
  };
  const paintConvs = () => {
    convListEl.innerHTML = convList.length
      ? `<ul class="list">${convList.slice(0, 15).map((c) => `<li class="list-row ${c.id === curConvId ? "on" : ""}" style="cursor:pointer" data-cid="${c.id}"><span class="t"><b>${esc(c.title || "Hội thoại")}</b></span><button type="button" class="icon-btn" data-del-cid="${c.id}" title="Xóa" aria-label="Xóa">${icon("trash")}</button></li>`).join("")}</ul>`
      : `<p class="small muted">Chưa có cuộc trò chuyện nào được lưu.</p>`;
    convListEl.querySelectorAll("[data-cid]").forEach((li) => li.addEventListener("click", async (e) => {
      if (e.target.closest("[data-del-cid]")) return;
      const cid = Number(li.dataset.cid);
      try {
        const r = await api(`/api/ai/conversations/${cid}`);
        curConvId = cid;
        paintConvs();
        msgsEl.innerHTML = (r.messages || []).map((m) => `<div class="msg ${m.role}">${m.role === "assistant" ? mdLite(m.content) + copyBtnHtml() : esc(m.content)}</div>`).join("");
        msgsEl.scrollTop = msgsEl.scrollHeight;
      } catch (err) { toast(err.message, "err"); }
    }));
    convListEl.querySelectorAll("[data-del-cid]").forEach((btn) => btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const cid = Number(btn.dataset.delCid);
      try {
        await api(`/api/ai/conversations/${cid}`, "DELETE");
        convList = convList.filter((x) => x.id !== cid);
        if (curConvId === cid) { curConvId = null; paintGreeting(); }
        paintConvs();
      } catch (err) { toast(err.message, "err"); }
    }));
  };

  async function sendQuestion(question) {
    if (!question.trim()) return;
    const sub = SUBJECTS.find((x) => x[0] === curSubj) || SUBJECTS[0];
    const u = document.createElement("div"); u.className = "msg user"; u.textContent = question; msgsEl.appendChild(u);
    const a = document.createElement("div"); a.className = "msg assistant"; a.innerHTML = `<span class="typing"><i></i><i></i><i></i></span>`; msgsEl.appendChild(a);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    const btn = main.querySelector('#aiChatForm [type="submit"]');
    if (btn) btn.disabled = true;
    try {
      const r = await api("/api/ai/ask", "POST", {
        persona,
        mode: "ask",
        question,
        ...sub[2],
        conversationId: curConvId,
      });
      curConvId = r.conversationId;
      a.innerHTML = mdLite(r.answer) + copyBtnHtml();
      $("#aiChatQuota", main).textContent = quotaLine(r.quota);
      const updated = await api("/api/ai/conversations").catch(() => null);
      if (updated && updated.conversations) { convList = updated.conversations; paintConvs(); }
    } catch (err) {
      a.textContent = err.message;
      a.classList.add("err");
    } finally {
      if (btn) btn.disabled = false;
      msgsEl.scrollTop = msgsEl.scrollHeight;
    }
  }

  $("#aiSubjTabs", main)?.addEventListener("click", (e) => {
    const b = e.target.closest("[data-subj]"); if (!b) return;
    curSubj = b.dataset.subj;
    curConvId = null;
    main.querySelectorAll("[data-subj]").forEach((x) => x.classList.toggle("on", x.dataset.subj === curSubj));
    paintQuick();
    paintGreeting();
    paintConvs();
  });
  $("#aiPersonaTabs", main)?.addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]"); if (!b) return;
    persona = b.dataset.p;
    main.querySelectorAll("[data-p]").forEach((x) => x.classList.toggle("on", x.dataset.p === persona));
  });
  $("#aiNewConv", main)?.addEventListener("click", () => { curConvId = null; paintGreeting(); paintConvs(); });
  main.querySelectorAll("[data-ai-quick]").forEach((b) => b.addEventListener("click", () => sendQuestion(b.dataset.aiQuick)));
  $("#aiChatForm", main)?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = e.currentTarget.q.value.trim();
    if (!q) return;
    e.currentTarget.q.value = "";
    sendQuestion(q);
  });
  paintQuick();
  paintGreeting();
  paintConvs();
  if (curConvId) {
    const hit = convListEl.querySelector(`[data-cid="${curConvId}"]`);
    if (hit) hit.click();
  }
}
export async function openAiInline(host, { exerciseId, lessonId, focusChapterId, assignmentId, langItem, getCode, getError, page } = {}) {
  if (!host) return;
  const old = host.querySelector(":scope > .ai-inline");
  if (old) { old.hidden = !old.hidden; if (!old.hidden) old.querySelector("textarea")?.focus(); return; }
  let st;
  try { st = await api("/api/ai/status"); } catch (e) { return toast(e.message, "err"); }
  if (!st.enabled || !st.configured) return toast(!st.enabled ? "Rivo đang tắt." : "Rivo chưa được cấu hình.", "info");
  const panel = document.createElement("section");
  panel.className = "ai-inline";
  panel.innerHTML = `<div class="ai-inline-head"><div class="ai-inline-title">${icon("bot")}<b>Hỗ trợ AI</b><span class="small muted">Theo nội dung bài này</span></div><button type="button" class="btn btn-ghost btn-sm" data-close-ai aria-label="Thu gọn">Thu gọn</button></div>
    <div class="chips ai-inline-prompts">${(getCode ? [["hint","Gợi ý"],["explain_error","Giải thích lỗi"],["review","Nhận xét bài làm"]] : [["ask","Giải thích bài"],["exercise","Ví dụ dễ hiểu"],["next","Ôn tiếp"]]).map(([m,l]) => `<button type="button" class="chip" data-ai-mode="${m}">${l}</button>`).join("")}</div>
    <div class="ai-msgs ai-inline-messages" data-ai-messages aria-live="polite"><div class="msg assistant">Bạn đang vướng ở phần nào? Mình sẽ hướng dẫn dựa trên nội dung và tiến độ học của bạn.</div></div>
    <form data-ai-form class="ai-inline-form"><textarea name="question" rows="1" maxlength="1000" placeholder="Nhập câu hỏi…"></textarea><button class="btn btn-primary btn-sm" type="submit" aria-label="Gửi">${icon("send")}</button></form>
    <p class="small muted ai-inline-quota" data-ai-quota>${st.remaining?.day ?? ""}/${st.limits?.day ?? ""} lượt hôm nay · ${st.remaining?.month ?? ""}/${st.limits?.month ?? ""} lượt tháng này</p>`;
  host.appendChild(panel);
  panel.querySelector("[data-close-ai]").addEventListener("click", () => { panel.hidden = true; });
  let conversationId = null;
  const msgs = panel.querySelector("[data-ai-messages]");
  const ask = async (mode, question = "") => {
    const code = getCode ? String(getCode() || "") : "";
    const error = getError ? String(getError() || "") : "";
    if (mode === "explain_error" && !error) return toast("Chưa có lỗi nào. Hãy kiểm tra hoặc nộp bài trước.", "info");
    const user = document.createElement("div"); user.className = "msg user"; user.textContent = question || ({hint:"Gợi ý cho bài này",explain_error:"Giải thích lỗi",review:"Nhận xét bài làm",exercise:"Cho ví dụ dễ hiểu",next:"Ôn kiến thức tiếp theo"}[mode] || "Giải thích bài này"); msgs.appendChild(user);
    const answer = document.createElement("div"); answer.className = "msg assistant"; answer.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>'; msgs.appendChild(answer); msgs.scrollTop = msgs.scrollHeight;
    const submit = panel.querySelector('[type="submit"]'); submit.disabled = true;
    try {
      const r = await api("/api/ai/ask", "POST", { mode, question, code, error, exerciseId, lessonId, focusChapterId, assignmentId, langItem, page, conversationId });
      conversationId = r.conversationId; answer.innerHTML = mdLite(r.answer) + copyBtnHtml();
      panel.querySelector("[data-ai-quota]").textContent = `Còn ${r.quota.remaining.day}/${r.quota.limits.day} lượt hôm nay · ${r.quota.remaining.month}/${r.quota.limits.month} lượt tháng này`;
    } catch (e) { answer.textContent = e.message; answer.classList.add("err"); }
    finally { submit.disabled = false; msgs.scrollTop = msgs.scrollHeight; }
  };
  panel.querySelectorAll("[data-ai-mode]").forEach((b) => b.addEventListener("click", () => ask(b.dataset.aiMode)));
  panel.querySelector("[data-ai-form]").addEventListener("submit", (e) => { e.preventDefault(); const q = e.currentTarget.question.value.trim(); if (!q) return; e.currentTarget.question.value = ""; ask("ask", q); });
  panel.querySelector("textarea")?.focus();
}

// Modal-style AI prompt is kept for backward compatibility with older chat flows.
export async function openAiModal({ exerciseId, lessonId, assignmentId, getCode, getError, page } = {}) {
  let st;
  try { st = await api("/api/ai/status"); } catch (e) { return toast(e.message, "err"); }
  if (!st.enabled || !st.configured) return toast(!st.enabled ? "Rivo đang tắt." : "Rivo chưa được cấu hình.", "info");
  let conv = null;
  const m = openModal(`<h2>${icon("bulb", 'width="20" height="20" style="vertical-align:-3px"')} Hỏi Rivo</h2>
    <p class="small muted">AI gợi ý cách nghĩ, không đưa ngay lời giải. ${getCode ? "Bài làm trong khung soạn sẽ được gửi kèm." : ""}</p>
    <div class="chips">${(getCode ? ["hint", "explain_error", "review"] : ["ask", "exercise"]).map((k) => `<button class="chip" data-quick="${k}">${MODE_LABEL[k]}</button>`).join("")}</div>
    <div class="ai-msgs modal-msgs" id="mMsgs"></div>
    <form id="mForm" class="row" style="margin-top:8px;flex-wrap:nowrap"><input name="q" maxlength="1000" placeholder="Hoặc gõ câu hỏi của bạn…" style="flex:1"><button class="btn btn-primary" type="submit">${icon("send")}</button></form>
    <p class="small muted" id="mQuota">${quota(st)}</p>`, { cls: "wide", label: "Hỏi Rivo" });
  function quota(q) { return q.allowed === false ? `<span class="form-msg err">${esc(q.reason)}</span>${!st.pro ? ` <a href="/app/bang-gia" data-close>Nâng cấp Pro</a>` : ""}` : quotaLine(q); }
  const box = m.el.querySelector("#mMsgs");
  const add = (role, html) => { const d = document.createElement("div"); d.className = "msg " + role; d.innerHTML = html; box.appendChild(d); box.scrollTop = box.scrollHeight; return d; };
  const ask = async (mode, question) => {
    const code = getCode ? getCode() : "";
    const error = getError ? getError() : "";
    if (mode === "explain_error" && !error) { toast("Chưa có lỗi nào. Hãy kiểm tra hoặc nộp bài trước.", "info"); return; }
    add("user", esc(question || MODE_LABEL[mode]));
    const wait = add("assistant", `<span class="typing"><i></i><i></i><i></i></span>`);
    try {
      const r = await api("/api/ai/ask", "POST", { mode, question, code, error, exerciseId, lessonId, assignmentId, page, conversationId: conv });
      conv = r.conversationId; wait.innerHTML = mdLite(r.answer); m.el.querySelector("#mQuota").innerHTML = quota(r.quota);
    } catch (e) { wait.innerHTML = `<span class="form-msg err">${esc(e.message)}</span>`; }
  };
  m.el.querySelectorAll("[data-quick]").forEach((b) => b.addEventListener("click", () => ask(b.dataset.quick, "")));
  m.el.querySelector("#mForm").addEventListener("submit", (e) => { e.preventDefault(); const q = e.target.q.value.trim(); if (!q) return; e.target.q.value = ""; ask("ask", q); });
}

/* =================== OVERVIEW CARDS =================== */
export async function proDashCard(host) {
  let d;
  try { d = await api("/api/dashboard"); } catch (e) { return; }
  const m = d.membership;
  const daysLeft = m.pro && m.expiresAt ? Math.ceil((Date.parse(m.expiresAt) - Date.now()) / 86400000) : null;
  const remind = !m.staff && m.renewReminder && daysLeft !== null && daysLeft <= 7
    ? `<div class="pay-warn" style="margin:0 0 12px">Gói Pro của bạn còn ${daysLeft} ngày (đến ${fmtDate(m.expiresAt, false)}). <a href="/app/bang-gia">Gia hạn</a> để không bị gián đoạn, thời gian được cộng nối tiếp. <a href="/app/goi-cua-toi">Tắt nhắc</a></div>` : "";
  host.innerHTML = `${remind}<section class="sheet sheet-pad pro-dash">
    <div class="pro-dash-grid">
      <div><small>Gói</small><b>${m.pro ? esc(m.planName || "Pro") : "Free"}</b><span class="small muted">${m.pro && m.expiresAt ? "đến " + fmtDate(m.expiresAt, false) : m.pro ? "" : `<a href="/app/bang-gia">Nâng cấp Pro</a>`}</span></div>
      <div><small>Bài học</small><b>${d.lessons.done}/${d.lessons.total}</b><span class="small muted">${d.lessons.next ? `Tiếp: <a href="/app/ngoai-ngu">${esc(d.lessons.next.title)}</a>` : "Đã học hết bài mở được"}</span></div>
      <div><small>XP từ bài học</small><b>${fmtN(d.xp.lessons)}</b><span class="small muted">Bài tập: ${fmtN(d.xp.exercises)} XP</span></div>
      <div><small>Rivo</small><b>${d.ai.enabled ? `${d.ai.remaining.day}/${d.ai.limits.day}` : "Tắt"}</b><span class="small muted">${d.ai.enabled ? `lượt còn hôm nay · ${d.ai.remaining.month}/${d.ai.limits.month} lượt tháng này` : ""}</span></div>
    </div>
    ${d.report ? `<div class="pro-report"><b>Báo cáo Pro</b><span class="small">Tỷ lệ nộp đạt: ${d.report.passRate}% trên ${fmtN(d.report.submissions)} lần nộp.${d.report.struggling.length ? ` Bài cần ôn: ${d.report.struggling.map((s) => `<a href="/app/ngoai-ngu/bai/${esc(s.exercise_id)}">${esc(s.exercise_id)}</a> (${s.tries} lần)`).join(", ")}.` : ""}</span></div>` : ""}
  </section>`;
}

/* =================== 4.10.2: IN-PLACE PLAN PURCHASE MODAL ===================
   Opened from anywhere ("Upgrade to Pro" menu, "View Pro plans" button on locked levels...): pick category -> pick plan ->
   create order -> show QR code right inside the modal without leaving the current study page. */
const BUY_BENEFITS = {
  family: ["4 tài khoản riêng, mỗi người một tiến độ", "Mọi thành viên có đầy đủ quyền Pro", "Chủ gói mời / xóa thành viên", "Xem tiến độ thành viên đã đồng ý chia sẻ"],
  teacher: ["Tạo và quản lý nhiều lớp", "Học sinh trong lớp có quyền Pro trong thời hạn giấy phép", "Giao bài, kiểm tra, chấm tự động", "Báo cáo tiến độ, xuất Excel / PDF", "AI hỗ trợ giảng dạy"],
};
let buyOpen = false;
export async function openBuyModal(kind = "pro") {
  if (buyOpen) return;
  buyOpen = true;
  let pl, me;
  try { [pl, me] = await Promise.all([api("/api/billing/plans"), api("/api/billing/me")]); }
  catch (e) { buyOpen = false; toast(e.message, "err"); return; }
  const mem = me.membership || {};
  const leaveFns = [];
  const onPop = () => { while (leaveFns.length) { try { leaveFns.pop()(); } catch {} } };
  window.addEventListener("popstate", onPop, { once: true });
  const m = openModal(`<div class="buy" id="buyBox"></div>`, { cls: "wide buy-modal", label: "Nâng cấp", onClose: () => { buyOpen = false; window.removeEventListener("popstate", onPop); onPop(); } });
  const box = m.el.querySelector("#buyBox");
  const fakeCtx = { onLeave: (fn) => leaveFns.push(fn) };
  const paint = () => {
    const plans = pl.plans.filter((p) => (p.kind || "pro") === kind);
    const base = plans.find((p) => p.months === 1);
    const benefits = kind === "pro" ? pl.benefits : BUY_BENEFITS[kind];
    const bestId = (plans.find((p) => (kind === "teacher" ? p.seats === 30 : p.months === 12)) || {}).id;
    box.innerHTML = `
      <div class="buy-head"><h2>${kind === "pro" ? "⭐ Nâng cấp Pro" : kind === "family" ? "👨‍👩‍👧 Gói Gia đình" : "🏫 Gói Giáo viên"}</h2>
        <p class="muted">Thanh toán bằng chuyển khoản QR, kích hoạt ngay khi tiền về. Không tự gia hạn.</p></div>
      <nav class="seg buy-tabs">${[["pro", "Cá nhân"], ["family", "Gia đình"], ["teacher", "Giáo viên"]].map(([k, l]) => `<button type="button" data-kind="${k}" class="${k === kind ? "on" : ""}">${l}</button>`).join("")}</nav>
      ${mem.pro && kind === "pro" && !mem.staff ? `<div class="buy-note">✅ Bạn đang có <b>${esc(mem.planName || "Pro")}</b> đến ${fmtDate(mem.expiresAt, false)}. Mua thêm sẽ được cộng nối tiếp.</div>` : ""}
      ${!pl.enabled ? `<div class="sheet sheet-pad empty"><b>Hiện chưa mở bán</b>Bạn vẫn học được toàn bộ nội dung miễn phí.</div>` : !plans.length ? `<div class="sheet sheet-pad empty"><b>Chưa có gói loại này</b></div>` : `
      <div class="buy-grid">
        <ul class="buy-benefits">${benefits.map((b) => `<li>${icon("check", 'width="15" height="15"')}<span>${esc(b)}</span></li>`).join("")}</ul>
        <div class="buy-plans">${plans.map((p) => {
          const save = base && p.months > 1 && !p.quoteOnly ? Math.round((1 - p.priceVnd / (base.priceVnd * p.months)) * 100) : 0;
          return `<button type="button" class="buy-plan ${p.id === bestId ? "best" : ""}" ${p.quoteOnly ? `data-quote="${esc(p.name)}"` : `data-buy="${esc(p.id)}"`}>
            ${p.id === bestId ? `<span class="buy-flag">${kind === "teacher" ? "Phổ biến" : "Tiết kiệm nhất"}</span>` : ""}
            <span class="buy-name">${esc(currentLang() === "en" && p.nameEn ? p.nameEn : p.name)}</span>
            <span class="buy-price">${p.quoteOnly ? (currentLang() === "en" ? "Contact" : "Liên hệ") : vnd(p.priceVnd)}</span>
            <span class="buy-sub">${(() => { const en = currentLang() === "en"; if (p.quoteOnly) return kind === "teacher" ? (en ? "Quote based on student count" : "Báo giá theo số học sinh") : (en ? "Contact to upgrade" : "Liên hệ để nâng cấp"); if (kind === "teacher") return `${p.seats} ${en ? "students" : "học sinh"} · ${p.months} ${en ? (p.months > 1 ? "months" : "month") : "tháng"}`; if (p.months > 1) return `≈ ${vnd(p.perMonth)}${en ? "/month" : "/tháng"}${save > 0 ? ` · ${en ? `save ${save}%` : `tiết kiệm ${save}%`}` : ""}`; return en ? "Flexible, billed monthly" : "Linh hoạt theo tháng"; })()}</span>
            <span class="btn btn-primary btn-sm">${p.quoteOnly ? (currentLang() === "en" ? "Contact to upgrade" : "Liên hệ nâng cấp") : (currentLang() === "en" ? "Buy now" : "Mua ngay")}</span>
          </button>`;
        }).join("")}</div>
      </div>`}
      <p class="small muted buy-foot">Có câu hỏi? ${pl.support ? `Liên hệ ${esc(pl.support)}. ` : ""}<a href="/${currentLang()}/refund">Chính sách hoàn tiền</a> · <a href="/${currentLang()}/payment">Chính sách thanh toán</a></p>`;
    box.querySelectorAll("[data-kind]").forEach((b) => b.addEventListener("click", () => { kind = b.dataset.kind; paint(); }));
    box.querySelectorAll("[data-quote]").forEach((b) => b.addEventListener("click", () => toast(`Liên hệ ${pl.support || "quản trị viên"} để nâng cấp ${b.dataset.quote}.`, "info", 6000)));
    box.querySelectorAll("[data-buy]").forEach((b) => b.addEventListener("click", async () => {
      b.disabled = true; b.classList.add("busy");
      try {
        const r = await api("/api/billing/orders", "POST", { planId: b.dataset.buy });
        m.close();
        checkout(r, fakeCtx, () => location.reload());
      } catch (e) { toast(e.message, "err"); b.disabled = false; b.classList.remove("busy"); }
    }));
  };
  paint();
}
