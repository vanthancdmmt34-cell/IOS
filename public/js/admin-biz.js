/* LifeRivo 3.0 — Business admin: real analytics, orders, transactions, plans, memberships, AI, audit logs */
import { appHash } from "./core.js";
import { api, esc, lineIcon as icon, fmtN, fmtDate, toast, promptBox, confirmBox, openModal, $ } from "./core.js";

const vnd = (n) => fmtN(n) + "đ";
const SUB = [["thong-ke", "Thống kê"], ["don-hang", "Đơn hàng"], ["thanh-vien", "Thành viên Pro"], ["goi", "Gói và giá"], ["giao-dich", "Giao dịch ngân hàng"], ["thanh-toan", "Tài khoản nhận tiền"], ["ai", "Chi phí AI"], ["webhook", "Nhật ký webhook"], ["nhat-ky", "Nhật ký"]];
const ORDER_ST = { pending: ["Chờ thanh toán", "tag-cam"], paid: ["Đã thanh toán", "tag-la"], expired: ["Hết hạn", "tag-line"], canceled: ["Đã hủy", "tag-line"] };
const PAY_ST = { matched: ["Khớp, đã kích hoạt", "tag-la"], manual: ["Gán tay", "tag-tim"], unmatched: ["Không có mã đơn", "tag-do"], mismatch: ["Lệch (thiếu tiền/đơn cũ)", "tag-cam"], ignored: ["Bỏ qua (tiền ra)", "tag-line"] };

// Badge "chờ xác nhận" trên tab Đơn hàng: cập nhật lại sau mỗi lần xác nhận/hủy,
// và trả về chữ "Đơn hàng" thuần khi không còn đơn nào chờ (tránh số cũ còn treo).
async function refreshBizBadge() {
  try {
    const st = await api("/api/admin/biz/stats?days=1");
    const chip = document.querySelector("[data-sub=don-hang]");
    if (!chip) return;
    chip.innerHTML = st.claimedPending
      ? `Đơn hàng <span class="badge-n">${st.claimedPending} chờ xác nhận</span>`
      : "Đơn hàng";
  } catch { /* giữ nguyên badge cũ khi không tải được số liệu */ }
}

export async function bizPage(body, ctx) {
  let sub = new URLSearchParams(appHash().split("?")[1] || "").get("sub") || "thong-ke";
  if (!SUB.some(([k]) => k === sub)) sub = "thong-ke";
  body.innerHTML = `<div class="chips" id="bizTabs" style="margin-bottom:14px">${SUB.map(([k, l]) => `<button class="chip ${k === sub ? "on" : ""}" data-sub="${k}">${l}</button>`).join("")}</div><div id="bizBody"></div>`;
  const host = $("#bizBody", body);
  const show = async () => {
    body.querySelectorAll("[data-sub]").forEach((b) => b.classList.toggle("on", b.dataset.sub === sub));
    host.innerHTML = `<div class="skel" style="height:220px"></div>`;
    try { await ({ "thanh-toan": paySettings, "thong-ke": stats, "don-hang": orders, "giao-dich": payments, "thanh-vien": members, goi: plans, ai: aiUsage, webhook: webhookLog, "nhat-ky": auditLog })[sub](host, show); }
    catch (e) { host.innerHTML = `<div class="sheet empty"><b>Không tải được</b>${esc(e.message)}</div>`; }
  };
  body.querySelectorAll("[data-sub]").forEach((b) => b.addEventListener("click", () => { sub = b.dataset.sub; show(); }));
  show();
  // Count orders where learner reported bank transfer, awaiting confirmation (personal QR)
  refreshBizBadge();
}

let days = 30;
async function stats(host) {
  const s = await api(`/api/admin/biz/stats?days=${days}`);
  const maxV = Math.max(1, ...s.revenue.daily.map((d) => d.v));
  host.innerHTML = `
    <div class="row" style="margin-bottom:12px"><label class="small">Khoảng thời gian <select id="days">${[[1, "Hôm nay (24 giờ)"], [7, "7 ngày"], [30, "30 ngày"], [90, "90 ngày"], [365, "1 năm"]].map(([v, l]) => `<option value="${v}" ${v === days ? "selected" : ""}>${l}</option>`).join("")}</select></label>
      <span class="small muted">Số liệu lấy trực tiếp từ cơ sở dữ liệu, không ước lượng.</span></div>
    <div class="stats biz-stats">
      <div><b>${vnd(s.revenue.vnd)}</b><span>Doanh thu (${s.revenue.orders} đơn đã thanh toán)</span></div>
      <div><b>${fmtN(s.users.pro)}</b><span>Học viên đang Pro / ${fmtN(s.users.total)}</span></div>
      <div><b>${s.conversion.rate}%</b><span>Tỷ lệ chuyển đổi (${fmtN(s.conversion.payers)} người từng trả phí)</span></div>
      <div><b>${fmtN(s.users.new)}</b><span>Học viên mới</span></div>
      <div><b>${fmtN(s.users.active)}</b><span>Học viên có nộp bài</span></div>
      <div><b>${fmtN(s.revenue.ordersCreated)}</b><span>Đơn được tạo</span></div>
      <div><b>${fmtN(s.claimedPending)}</b><span>Đơn học viên báo đã chuyển, chờ bạn xác nhận</span></div>
      <div><b>${fmtN(s.ai.requests)}</b><span>Lượt hỏi AI (${fmtN(s.ai.failed)} lỗi)</span></div>
      <div><b>$${s.ai.costUsd.toFixed(3)}</b><span>Chi phí AI trong kỳ</span></div>
      <div><b>${fmtN(s.lessons.completed)}</b><span>Lượt hoàn thành bài học</span></div>
    </div>
    ${s.lms ? `<h2 style="margin:18px 0 8px;font-size:17px">Lớp học và gói</h2><div class="stats biz-stats">
      <div><b>${fmtN(s.lms.classesOpen)}</b><span>Lớp đang mở</span></div>
      <div><b>${fmtN(s.lms.students)}</b><span>Học sinh trong lớp</span></div>
      <div><b>${fmtN(s.lms.licensesActive)}</b><span>Giấy phép Teacher còn hạn</span></div>
      <div><b>${fmtN(s.lms.seatsUsed)}/${fmtN(s.lms.seatsTotal)}</b><span>Chỗ giấy phép đã dùng</span></div>
      <div><b>${fmtN(s.lms.familiesActive)}</b><span>Gói Family còn hạn</span></div>
      <div><b>${fmtN(s.lms.submissions)}</b><span>Bài giao đã nộp trong kỳ</span></div>
      <div><b>${fmtN(s.roles.admin || 0)}</b><span>Quản trị</span></div>
      <div><b>${fmtN(s.roles.teacher || 0)}</b><span>Giáo viên</span></div>
      <div><b>${fmtN(s.roles.student || 0)}</b><span>Học viên</span></div>
      <div><b>${fmtN(s.roles.parent || 0)}</b><span>Phụ huynh</span></div>
    </div>` : ""}
    <div class="two-col" style="margin-top:16px">
      <section class="sheet sheet-pad"><h2>Doanh thu theo ngày</h2>
        ${s.revenue.daily.length ? `<div class="bars">${s.revenue.daily.map((d) => `<div class="bar-row"><span class="small">${esc(d.d)}</span><div class="bar"><i style="width:${Math.round((d.v / maxV) * 100)}%"></i></div><b class="small">${vnd(d.v)}</b></div>`).join("")}</div>` : `<p class="muted">Chưa có doanh thu trong kỳ.</p>`}
        ${s.revenue.byPlan.length ? `<div class="table-wrap" style="border:0;margin-top:10px"><table><thead><tr><th>Gói</th><th class="num">Đơn</th><th class="num">Doanh thu</th></tr></thead><tbody>${s.revenue.byPlan.map((p) => `<tr><td>${esc(p.plan_id)}</td><td class="num">${p.n}</td><td class="num">${vnd(p.v)}</td></tr>`).join("")}</tbody></table></div>` : ""}
      </section>
      <section class="sheet sheet-pad"><h2>Giao dịch ngân hàng</h2>
        ${s.payments.length ? `<div class="table-wrap" style="border:0"><table><thead><tr><th>Trạng thái</th><th class="num">Giao dịch</th><th class="num">Số tiền</th></tr></thead><tbody>${s.payments.map((p) => `<tr><td><span class="tag ${(PAY_ST[p.status] || [, "tag-line"])[1]}">${(PAY_ST[p.status] || [p.status])[0]}</span></td><td class="num">${p.n}</td><td class="num">${vnd(p.v)}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Chưa có giao dịch.</p>`}
        <h3 style="margin-top:14px">AI tháng này</h3><dl class="exam-meta"><div><dt>Đã dùng</dt><dd>$${s.ai.monthCostUsd.toFixed(3)} / trần $${s.ai.monthBudgetUsd}</dd></div><div><dt>Model</dt><dd>${esc(s.ai.model)}</dd></div><div><dt>Trạng thái</dt><dd>${s.ai.configured ? "Đã cấu hình" : "<b>Chưa cấu hình khóa</b>"}</dd></div></dl>
      </section>
    </div>`;
  $("#days", host).addEventListener("change", (e) => { days = Number(e.target.value); stats(host); });
}

async function orders(host, reload) {
  const st = host.dataset.st || "";
  const q = host.dataset.q || "";
  const j = await api(`/api/admin/biz/orders?status=${encodeURIComponent(st)}&q=${encodeURIComponent(q)}`);
  host.innerHTML = `
    <div class="row" style="margin-bottom:10px"><select class="select" id="st"><option value="">Mọi trạng thái</option><option value="claimed" ${st === "claimed" ? "selected" : ""}>Học viên báo đã chuyển</option>${Object.entries(ORDER_ST).map(([k, v]) => `<option value="${k}" ${k === st ? "selected" : ""}>${v[0]}</option>`).join("")}</select>
      <input class="input" id="q" placeholder="Mã đơn hoặc tên đăng nhập" value="${esc(q)}"><button class="btn btn-sm" id="go">${icon("search")}Lọc</button></div>
    <div class="table-wrap"><table><thead><tr><th>Mã đơn</th><th>Học viên</th><th>Gói</th><th class="num">Số tiền</th><th>Trạng thái</th><th>Tạo lúc</th><th>Thanh toán</th><th></th></tr></thead><tbody>
      ${j.orders.map((o) => `<tr><td><b>${esc(o.code)}</b></td><td>${esc(o.displayName)}<br><span class="small muted">@${esc(o.username)}</span></td><td>${esc(o.planName)}</td><td class="num">${vnd(o.amountVnd)}</td>
        <td>${o.status === "pending" && o.claimedAt ? `<span class="tag tag-cam">Báo đã chuyển</span><br><span class="small muted">${fmtDate(o.claimedAt)}</span>` : `<span class="tag ${ORDER_ST[o.status][1]}">${ORDER_ST[o.status][0]}</span>`}</td><td>${fmtDate(o.createdAt)}</td><td>${o.paidAt ? fmtDate(o.paidAt) : ""}</td>
        <td>${o.status === "pending" ? `<button class="btn btn-xs btn-ghost" data-reject="${o.id}" data-code="${esc(o.code)}">Không thấy tiền</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="8" class="muted">Không có đơn.</td></tr>`}
    </tbody></table></div>
    <p class="small muted" style="margin-top:8px">Xác nhận đơn qua Zalo: khi học viên báo đã chuyển, hệ thống tự gửi tin về Zalo của bạn. Mở app ngân hàng kiểm tra giao dịch có <b>đúng nội dung mã đơn</b> và <b>đủ số tiền</b>, rồi trả lời tin Zalo: <b>HT &lt;mã đơn&gt;</b> để kích hoạt, <b>HUY &lt;mã đơn&gt; &lt;lý do&gt;</b> để hủy. Không kích hoạt chỉ dựa vào ảnh chụp màn hình. Mọi thao tác được ghi nhật ký.</p>`;
  $("#go", host).addEventListener("click", () => { host.dataset.st = $("#st", host).value; host.dataset.q = $("#q", host).value.trim(); orders(host, reload); });
  host.querySelectorAll("[data-reject]").forEach((b) => b.addEventListener("click", async () => {
    const note = await promptBox(`Không thấy tiền cho đơn ${b.dataset.code}?`, "Đơn sẽ bị hủy và học viên thấy trạng thái Đã hủy. Chỉ làm khi đã kiểm tra kỹ sao kê. Ghi lý do:", { label: "Lý do", okLabel: "Hủy đơn", validate: (v) => (v.trim().length >= 3 ? "" : "Ít nhất 3 ký tự") });
    if (!note) return;
    try { await api(`/api/admin/biz/orders/${b.dataset.reject}/reject`, "POST", { note }); toast("Đã hủy đơn.", "ok"); orders(host, reload); refreshBizBadge(); }
    catch (e) { toast(e.message, "err"); }
  }));
}

async function payments(host) {
  const st = host.dataset.st || "";
  const j = await api(`/api/admin/biz/payments?status=${encodeURIComponent(st)}`);
  host.innerHTML = `
    <div class="row" style="margin-bottom:10px"><select class="select" id="st"><option value="">Mọi trạng thái</option>${Object.entries(PAY_ST).map(([k, v]) => `<option value="${k}" ${k === st ? "selected" : ""}>${v[0]}</option>`).join("")}</select>
      <span class="small muted">Giao dịch do SePay gửi về qua webhook đã xác thực chữ ký. Giao dịch gửi trùng bị bỏ qua tự động.</span></div>
    <div class="table-wrap"><table><thead><tr><th>Mã GD</th><th>Nguồn</th><th class="num">Số tiền</th><th>Nội dung</th><th>Đơn</th><th>Trạng thái</th><th>Nhận lúc</th><th></th></tr></thead><tbody>
      ${j.payments.map((p) => `<tr><td class="small">${esc(p.txnId)}</td><td>${esc(p.provider)}</td><td class="num">${vnd(p.amountVnd)}</td><td class="small" style="max-width:260px">${esc(p.content)}</td><td>${esc(p.orderCode || "")}</td>
        <td><span class="tag ${(PAY_ST[p.status] || [, "tag-line"])[1]}">${(PAY_ST[p.status] || [p.status])[0]}</span>${p.note ? `<br><span class="small muted">${esc(p.note)}</span>` : ""}</td><td>${fmtDate(p.receivedAt)}</td>
        <td>${["unmatched", "mismatch"].includes(p.status) ? `<button class="btn btn-xs" data-assign="${p.id}">Gán vào đơn</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="8" class="muted">Chưa có giao dịch.</td></tr>`}
    </tbody></table></div>`;
  $("#st", host).addEventListener("change", (e) => { host.dataset.st = e.target.value; payments(host); });
  host.querySelectorAll("[data-assign]").forEach((b) => b.addEventListener("click", async () => {
    const code = await promptBox("Gán giao dịch vào đơn", "Dùng khi học viên ghi sai nội dung chuyển khoản. Nhập mã đơn (PL…) của học viên đó.", { label: "Mã đơn", validate: (v) => (/^PL[A-Z0-9]{6}$/i.test(v.trim()) ? "" : "Mã đơn dạng PLxxxxxx") });
    if (!code) return;
    try { await api(`/api/admin/biz/payments/${b.dataset.assign}/assign`, "POST", { orderCode: code.trim() }); toast("Đã gán và kích hoạt Pro.", "ok"); payments(host); }
    catch (e) { toast(e.message, "err", 5000); }
  }));
}

async function members(host) {
  const q = host.dataset.q || "";
  const j = await api(`/api/admin/biz/users?q=${encodeURIComponent(q)}`);
  host.innerHTML = `
    <div class="row" style="margin-bottom:10px"><input class="input" id="q" placeholder="Tìm tên đăng nhập / tên" value="${esc(q)}"><button class="btn btn-sm" id="go">${icon("search")}Tìm</button></div>
    <div class="table-wrap"><table><thead><tr><th>Người dùng</th><th>Vai trò</th><th>Gói</th><th>Hết hạn</th><th></th></tr></thead><tbody>
      ${j.users.map((u) => `<tr><td>${esc(u.displayName)}<br><span class="small muted">@${esc(u.username)}</span></td><td>${({ admin: "Quản trị", teacher: "Giáo viên", student: "Học viên", parent: "Phụ huynh" })[u.role] || u.role}</td>
        <td>${u.membership.pro ? `<span class="tag tag-pro">PRO</span>${(u.membership.sources || []).length ? ` <span class="small muted">${(u.membership.sources || []).map((x) => esc(x.label)).join(", ")}</span>` : ""}` : "Free"}</td><td>${u.membership.expiresAt ? fmtDate(u.membership.expiresAt, false) : ""}</td>
        <td>${u.role === "admin" ? "" : `${u.membership.pro ? ` <button class="btn btn-xs btn-ghost" data-revoke="${u.id}" data-name="${esc(u.username)}">Thu hồi</button>` : ""}`}</td></tr>`).join("") || `<tr><td colspan="5" class="muted">Không tìm thấy.</td></tr>`}
    </tbody></table></div>`;
  $("#go", host).addEventListener("click", () => { host.dataset.q = $("#q", host).value.trim(); members(host); });
  host.querySelectorAll("[data-revoke]").forEach((b) => b.addEventListener("click", async () => {
    const note = await promptBox(`Thu hồi Pro của @${b.dataset.name}`, "Học viên mất quyền Pro ngay. Ghi lý do (ví dụ: đã hoàn tiền).", { label: "Lý do", validate: (v) => (v.trim().length >= 3 ? "" : "Ít nhất 3 ký tự") });
    if (!note) return;
    try { await api(`/api/admin/biz/users/${b.dataset.revoke}/revoke`, "POST", { note }); toast("Đã thu hồi.", "ok"); members(host); } catch (e) { toast(e.message, "err"); }
  }));
}

async function plans(host) {
  const j = await api("/api/admin/biz/plans");
  const KIND = { pro: "Pro cá nhân", family: "Family", teacher: "Teacher" };
  host.innerHTML = `<div class="row" style="margin-bottom:10px"><button class="btn btn-primary btn-sm" id="newPlan">${icon("plus")}Thêm gói</button><span class="small muted">Giá, số tháng, số chỗ đều chỉnh ở đây, không có giá nào viết cứng trong mã.</span></div>
  <div class="table-wrap"><table><thead><tr><th>Mã</th><th>Loại</th><th>Tên (VI)</th><th>Tên (EN)</th><th class="num">Tháng</th><th class="num">Chỗ</th><th>Giá (đồng)</th><th>Báo giá</th><th>Đang bán</th><th></th></tr></thead><tbody>
    ${j.plans.map((p) => `<tr data-plan="${esc(p.id)}"><td class="small">${esc(p.id)}</td><td>${KIND[p.kind] || esc(p.kind)}</td><td><input class="input" name="name" value="${esc(p.name)}" maxlength="80"></td><td><input class="input" name="nameEn" value="${esc(p.nameEn || "")}" maxlength="80"></td>
      <td><input class="input" name="months" type="number" min="1" max="36" value="${p.months}" style="width:64px"></td><td><input class="input" name="seats" type="number" min="1" max="5000" value="${p.seats}" style="width:72px" ${p.kind === "pro" ? "disabled" : ""}></td>
      <td><input class="input" name="price" type="number" min="0" step="1000" value="${p.priceVnd}" style="width:120px"></td><td><input name="quote" type="checkbox" ${p.quoteOnly ? "checked" : ""}></td><td><input name="active" type="checkbox" ${p.active ? "checked" : ""}></td><td><button class="btn btn-xs btn-primary" data-save>Lưu</button></td></tr>`).join("")}
  </tbody></table></div><p class="small muted" style="margin-top:8px">Đổi giá chỉ áp dụng cho đơn tạo sau đó; đơn đang chờ giữ giá cũ. Gói "Báo giá" không bán trực tiếp, người dùng được hướng dẫn liên hệ. Mọi thay đổi được ghi nhật ký.</p>`;
  host.querySelectorAll("[data-save]").forEach((b) => b.addEventListener("click", async () => {
    const tr = b.closest("tr"), v = (n) => tr.querySelector(`[name=${n}]`);
    const body = { name: v("name").value, nameEn: v("nameEn").value, months: Number(v("months").value), priceVnd: Number(v("price").value), quoteOnly: v("quote").checked, active: v("active").checked };
    if (!v("seats").disabled) body.seats = Number(v("seats").value);
    if (!(await confirmBox("Lưu thay đổi gói?", body.quoteOnly ? "Gói chuyển sang chế độ báo giá." : `Giá mới: ${vnd(body.priceVnd)}.`, "Lưu"))) return;
    try { await api(`/api/admin/biz/plans/${tr.dataset.plan}`, "POST", body); toast("Đã lưu.", "ok"); plans(host); } catch (e) { toast(e.message, "err"); }
  }));
  $("#newPlan", host).addEventListener("click", () => {
    const m = openModal(`<h2>Thêm gói</h2><form class="auth-form" data-f>
      <div class="grid-2"><label class="field">Mã gói<input name="id" required pattern="[a-z0-9_]{3,40}" placeholder="vd: pro_6m"></label><label class="field">Loại<select name="kind"><option value="pro">Pro cá nhân</option><option value="family">Family</option><option value="teacher">Teacher</option></select></label></div>
      <div class="grid-2"><label class="field">Tên (tiếng Việt)<input name="name" required maxlength="80"></label><label class="field">Tên (tiếng Anh)<input name="nameEn" maxlength="80"></label></div>
      <div class="grid-2"><label class="field">Số tháng<input name="months" type="number" min="1" max="36" value="1" required></label><label class="field">Số chỗ (Family/Teacher)<input name="seats" type="number" min="1" max="5000" value="1"></label></div>
      <label class="field">Giá (đồng)<input name="price" type="number" min="0" step="1000" value="0"></label><label class="check"><input type="checkbox" name="quote"> Chỉ báo giá (không bán trực tiếp)</label>
      <p class="form-msg err" data-m></p><div class="modal-actions"><button type="button" class="btn" data-close>Hủy</button><button class="btn btn-primary">Thêm</button></div></form>`);
    m.el.querySelector("[data-f]").addEventListener("submit", async (e) => {
      e.preventDefault(); const f = e.target;
      try { await api("/api/admin/biz/plans", "POST", { id: f.id.value.trim(), kind: f.kind.value, name: f.name.value, nameEn: f.nameEn.value, months: Number(f.months.value), seats: Number(f.seats.value), priceVnd: Number(f.price.value), quoteOnly: f.quote.checked }); m.close(); toast("Đã thêm gói.", "ok"); plans(host); }
      catch (err) { m.el.querySelector("[data-m]").textContent = err.message; }
    });
  });
}

async function aiUsage(host) {
  const j = await api(`/api/admin/biz/ai-usage?days=${days}`);
  const t0 = j.totals || {};
  const month = j.month || {};
  const maxDay = Math.max(1, ...(j.byDay || []).map((d) => d.requests || 0));
  const usd = (m) => "$" + ((Number(m) || 0) / 1e6).toFixed(4);
  const monthPct = Math.max(0, Number(month.usedPct) || 0);
  const now = new Date();
  const daysElapsed = Math.max(1, now.getDate());
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedMonthCost = (Number(month.costUsd) || 0) / daysElapsed * daysInMonth;
  const averageRequestCost = Number(t0.requests) > 0 ? (Number(t0.costMicro) || 0) / Number(t0.requests) : 0;
  const errorRate = Number(t0.requests) > 0 ? (Number(t0.failed) || 0) / Number(t0.requests) * 100 : 0;
  const budgetState = monthPct >= 100 ? ["Đã chạm/vượt ngân sách tháng", "tag-do"] : monthPct >= 85 ? ["Sắp chạm ngân sách tháng", "tag-cam"] : monthPct >= 70 ? ["Theo dõi mức sử dụng ngân sách", "tag-tim"] : ["Trong ngưỡng ngân sách", "tag-la"];
  host.innerHTML = `
    <div class="row" style="margin-bottom:12px;align-items:center">
      <p class="small muted" style="margin:0;flex:1">${days} ngày gần nhất · Model <b>${esc(j.model)}</b> · ${j.configured ? "đã cấu hình" : "chưa có khóa API"}</p>
      <button class="btn btn-sm" id="aiXlsx">${icon("download")}Xuất Excel chi tiết</button>
    </div>
    <div class="stats biz-stats" style="margin-bottom:14px">
      <div><b>${fmtN(t0.requests || 0)}</b><span>Lượt gọi</span></div>
      <div><b>${fmtN(t0.ok || 0)}</b><span>Thành công</span></div>
      <div><b>${fmtN(t0.failed || 0)}</b><span>Lỗi</span></div>
      <div><b>${fmtN((t0.inputTokens || 0) + (t0.outputTokens || 0))}</b><span>Tổng token</span></div>
      <div><b>${usd(t0.costMicro)}</b><span>Chi phí kỳ này</span></div>
      <div><b>$${(month.costUsd || 0).toFixed(2)} / $${(month.budgetUsd || 0).toFixed(0)}</b><span>Ngân sách tháng (${month.usedPct || 0}%)</span></div>
    </div>
    ${month.budgetUsd ? `<div class="sheet sheet-pad" style="margin:-2px 0 16px"><div class="row" style="justify-content:space-between;align-items:center"><b><span class="tag ${budgetState[1]}">${budgetState[0]}</span></b><span class="small muted">${monthPct.toFixed(1)}% ngân sách</span></div><div class="bar thin" style="margin:10px 0 8px"><i style="width:${Math.min(100, monthPct)}%;background:${monthPct >= 85 ? "var(--do)" : "var(--tim)"}"></i></div><div class="small muted">Chi phí dự phóng hết tháng: <b>${usd(projectedMonthCost * 1e6)}</b> · Ước tính tuyến tính từ ${daysElapsed}/${daysInMonth} ngày đã qua, không phải số chi thực tế.</div></div>` : ""}
    <div class="stats biz-stats" style="margin-bottom:14px"><div><b>${usd(averageRequestCost * 1e6)}</b><span>Chi phí trung bình / lượt</span></div><div><b>${errorRate.toFixed(1)}%</b><span>Tỷ lệ yêu cầu lỗi</span></div></div>
    <div class="two-col">
      <section class="sheet sheet-pad"><h2>Theo người dùng</h2>
        <div class="table-wrap" style="border:0"><table><thead><tr><th>Người dùng</th><th>Vai trò</th><th class="num">Lượt</th><th class="num">Lỗi</th><th class="num">Token vào/ra</th><th class="num">Chi phí</th></tr></thead><tbody>
        ${(j.byUser || []).map((u) => `<tr><td><b>${esc(u.displayName || u.username || "(đã xóa)")}</b><br><span class="small muted">@${esc(u.username || "")}</span></td><td class="small">${esc(u.role || "")}</td><td class="num">${u.requests}</td><td class="num">${u.failed}</td><td class="num">${fmtN(u.inputTokens)}/${fmtN(u.outputTokens)}</td><td class="num">${usd(u.costMicro)}</td></tr>`).join("") || `<tr><td colspan="6" class="muted">Chưa có lượt nào.</td></tr>`}
        </tbody>${(j.byUser || []).length ? `<tfoot><tr><td><b>Tổng</b></td><td></td><td class="num"><b>${fmtN(t0.requests || 0)}</b></td><td class="num"><b>${fmtN(t0.failed || 0)}</b></td><td class="num"><b>${fmtN(t0.inputTokens || 0)}/${fmtN(t0.outputTokens || 0)}</b></td><td class="num"><b>${usd(t0.costMicro)}</b></td></tr></tfoot>` : ""}</table></div>
      </section>
      <section class="sheet sheet-pad">
        <h2>Theo ngày</h2>
        <div style="display:grid;gap:10px">${(j.byDay || []).map((d) => {
          const pct = Math.round(((d.requests || 0) / maxDay) * 100);
          return `<div><div class="row" style="justify-content:space-between;align-items:baseline;margin-bottom:4px"><b class="small">${esc(d.d)}</b><span class="small"><b>${d.requests} lượt</b> · <span class="muted">${usd(d.costMicro)}</span></span></div>
            <div class="bar" style="height:8px"><i style="width:${pct}%"></i></div></div>`;
        }).join("") || "<p class='muted'>Chưa có.</p>"}</div>
        <h2 style="margin-top:18px">Theo chế độ (mode)</h2>
        <div class="table-wrap" style="border:0"><table><thead><tr><th>Chế độ</th><th class="num">Lượt</th><th class="num">Chi phí</th><th class="num">Tỉ lệ</th></tr></thead><tbody>
        ${(j.byMode || []).map((m) => `<tr><td><code>${esc(m.mode)}</code></td><td class="num">${m.requests}</td><td class="num">${usd(m.costMicro)}</td><td class="num">${t0.requests ? Math.round((m.requests / t0.requests) * 100) : 0}%</td></tr>`).join("") || `<tr><td colspan="4" class="muted">Chưa có.</td></tr>`}
        </tbody></table></div>
        <h2 style="margin-top:18px">Theo model</h2>
        <div class="table-wrap" style="border:0"><table><thead><tr><th>Model</th><th class="num">Lượt</th><th class="num">Chi phí</th><th class="num">Tỉ lệ</th></tr></thead><tbody>
        ${(j.byModel || []).map((m) => `<tr><td><code>${esc(m.model)}</code></td><td class="num">${m.requests}</td><td class="num">${usd(m.costMicro)}</td><td class="num">${t0.requests ? Math.round((m.requests / t0.requests) * 100) : 0}%</td></tr>`).join("") || `<tr><td colspan="4" class="muted">Chưa có.</td></tr>`}
        </tbody></table></div>
        ${(j.errors || []).length ? `<h2 style="margin-top:18px">Lỗi gần đây</h2><div style="display:grid;gap:8px">${j.errors.map((e) => `<div style="border:1px solid var(--line);border-radius:8px;padding:8px 10px"><div class="small"><b>${fmtDate(e.at)}</b> · <code>${esc(e.model)}</code>${e.mode ? ` · <code>${esc(e.mode)}</code>` : ""}</div><div class="small muted" style="margin-top:2px;word-break:break-word;overflow-wrap:anywhere">${esc(e.error)}</div></div>`).join("")}</div>` : ""}
      </section>
    </div>`;
  $("#aiXlsx", host)?.addEventListener("click", async () => {
    try {
      const res = await fetch(`/api/admin/biz/ai-usage.xlsx?days=${days}`, { credentials: "same-origin" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Không xuất được.");
      const url = URL.createObjectURL(await res.blob());
      const a = Object.assign(document.createElement("a"), { href: url, download: `ai-usage-${days}d.xlsx` });
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast("Đã tải thống kê AI.", "ok");
    } catch (e) { toast(e.message, "err"); }
  });
}

const WH = { matched: ["Khớp, đã kích hoạt", "tag-la"], duplicate: ["Trùng, bỏ qua", "tag-line"], rejected: ["Từ chối (chữ ký)", "tag-do"], unmatched: ["Không có mã đơn", "tag-do"], mismatch: ["Lệch số tiền/đơn", "tag-cam"], ignored: ["Bỏ qua", "tag-line"], bad_request: ["Dữ liệu lỗi", "tag-do"] };
async function webhookLog(host) {
  let filter = "";
  const draw = async () => {
    const j = await api(`/api/admin/biz/payment-events?limit=200${filter ? "&result=" + encodeURIComponent(filter) : ""}`);
    const tag = (r) => { const [k, why] = String(r || "").split(":"); const t = WH[k] || [k || "—", "tag-line"]; return `<span class="tag ${t[1]}">${esc(t[0])}</span>${why ? `<br><span class="small muted">${esc(why)}</span>` : ""}`; };
    host.innerHTML = `<p class="small muted">Mọi lần SePay (hoặc bất kỳ ai) gọi địa chỉ webhook đều được ghi lại, kể cả lần bị từ chối vì sai chữ ký. Giao dịch trùng không cộng quyền hai lần. Chỉ quản trị viên xem được.</p>
      <div class="chips" style="margin:8px 0 12px"><button class="chip ${!filter ? "on" : ""}" data-r="">Tất cả</button>${j.counts.map((c) => `<button class="chip ${filter === c.result ? "on" : ""}" data-r="${esc(c.result)}">${esc((WH[String(c.result).split(":")[0]] || [c.result])[0])}${String(c.result).includes(":") ? " (" + esc(c.result.split(":")[1]) + ")" : ""} · ${c.n}</button>`).join("")}</div>
      <div class="table-wrap"><table><thead><tr><th>Thời gian</th><th>Kết quả</th><th>Chữ ký</th><th>Mã GD</th><th>Lý do</th><th>IP</th><th></th></tr></thead><tbody>
      ${j.events.map((e) => `<tr><td class="small">${fmtDate(e.createdAt)}</td><td>${tag(e.result)}</td><td>${e.verified ? `<span class="tag tag-la">Hợp lệ</span>` : `<span class="tag tag-do">Không hợp lệ</span>`}</td><td class="small"><code>${esc(e.txnId || "—")}</code></td><td class="small">${esc(e.reason || "")}</td><td class="small">${esc(e.ip)}</td><td><button class="btn btn-xs btn-ghost" data-body="${e.id}">Dữ liệu</button></td></tr>`).join("") || `<tr><td colspan="7" class="muted">Chưa có lần gọi nào.</td></tr>`}
      </tbody></table></div>`;
    host.querySelectorAll("[data-r]").forEach((b) => b.addEventListener("click", () => { filter = b.dataset.r; draw(); }));
    host.querySelectorAll("[data-body]").forEach((b) => b.addEventListener("click", () => { const e = j.events.find((x) => String(x.id) === b.dataset.body); let t = e.body; try { t = JSON.stringify(JSON.parse(e.body), null, 2); } catch {} openModal(`<h2>Dữ liệu webhook #${e.id}</h2><pre class="code-view" style="max-height:60vh;overflow:auto">${esc(t)}</pre><div class="modal-actions"><button class="btn" data-close>Đóng</button></div>`); }));
  };
  await draw();
}

async function auditLog(host) {
  const j = await api("/api/admin/biz/audit?limit=200");
  host.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Thời gian</th><th>Người thực hiện</th><th>Hành động</th><th>Đối tượng</th><th>Chi tiết</th><th>IP</th></tr></thead><tbody>
    ${j.logs.map((l) => `<tr><td>${fmtDate(l.createdAt)}</td><td>${esc(l.actor || (l.actorId ? "#" + l.actorId : "Hệ thống"))}</td><td><code>${esc(l.action)}</code></td><td>${esc(l.target)}</td><td class="small" style="max-width:320px;word-break:break-word">${esc(l.detail)}</td><td class="small">${esc(l.ip)}</td></tr>`).join("") || `<tr><td colspan="6" class="muted">Chưa có.</td></tr>`}
  </tbody></table></div>`;
}

/* ---------- 4.10.2: Payment receiving account (account number, bank, verification method) ---------- */
async function paySettings(host, show) {
  const d = await api("/api/admin/settings");
  const v = d.values, f = (k) => d.schema.find((x) => x.key === k) || {};
  const banks = (f("payBank").options || []).filter(([k]) => k);
  const ready = !!(v.payBank && v.payAccountNo && v.payAccountName);
  const plans = (await api("/api/billing/plans")).plans || [];
  host.innerHTML = `
  <div class="pay-admin">
    <div class="${ready ? "req" : "pay-warn"}" style="margin-bottom:14px">${ready
      ? `✅ <b>Đang nhận tiền vào ${esc(banks.find(([k]) => k === v.payBank)?.[1] || v.payBank)} · ${esc(v.payAccountNo)} · ${esc(v.payAccountName)}</b>. Học viên bấm mua sẽ thấy mã QR có sẵn số tiền và mã đơn.`
      : `⚠️ <b>Chưa nhập đủ tài khoản nhận tiền.</b> Học viên chưa thể thanh toán cho tới khi bạn điền ngân hàng, số tài khoản và tên chủ tài khoản bên dưới.`}</div>
    <div class="two-col pay-admin-grid">
      <section class="sheet sheet-pad">
        <h2>Tài khoản nhận tiền</h2>
        <form id="payForm" class="pay-form" autocomplete="off">
          <label class="field"><span>Ngân hàng</span><select class="select" name="payBank"><option value="">Chọn ngân hàng</option>${banks.map(([k, l]) => `<option value="${esc(k)}" ${k === v.payBank ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>
          <label class="field"><span>Số tài khoản</span><input class="input" name="payAccountNo" value="${esc(v.payAccountNo || "")}" inputmode="numeric" maxlength="19" placeholder="Ví dụ: 0123456789"><small>Chỉ chữ và số, không dấu cách. Có thể là tài khoản cá nhân.</small></label>
          <label class="field"><span>Tên chủ tài khoản</span><input class="input" name="payAccountName" value="${esc(v.payAccountName || "")}" maxlength="80" placeholder="NGUYEN VAN A"><small>Viết đúng như trên app ngân hàng (thường in hoa, không dấu).</small></label>
          <label class="field"><span>Cách xác nhận thanh toán</span><select class="select" name="payMode">${(f("payMode").options || []).map(([k, l]) => `<option value="${esc(k)}" ${k === v.payMode ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>
          <label class="field"><span>Thời gian xác nhận hiển thị cho học viên</span><input class="input" name="manualConfirmNote" value="${esc(v.manualConfirmNote || "")}" maxlength="${f("manualConfirmNote").max || 160}"></label>
          <div class="row" style="gap:12px">
            <label class="field" style="flex:1"><span>Đơn hết hạn sau (giờ)</span><input class="input" type="number" name="orderExpireHours" min="1" max="168" value="${esc(v.orderExpireHours)}"></label>
            <label class="field" style="flex:2"><span>Liên hệ hỗ trợ thanh toán</span><input class="input" name="supportContact" value="${esc(v.supportContact || "")}" maxlength="120" placeholder="Zalo 09xx… hoặc email"></label>
          </div>
          <label class="check"><input type="checkbox" name="proEnabled" ${v.proEnabled ? "checked" : ""}> Đang mở bán gói Pro</label>
          <div class="row" style="margin-top:12px"><button class="btn btn-primary" type="submit">${icon("check")}Lưu tài khoản nhận tiền</button><span class="form-msg" id="payMsg"></span></div>
        </form>
      </section>
      <section class="sheet sheet-pad pay-preview">
        <h2>Xem trước mã QR</h2>
        <p class="small muted">Mã thử với số tiền 49.000đ và nội dung PLTEST01. Quét bằng app ngân hàng để kiểm tra đúng tên chủ tài khoản (không cần chuyển tiền).</p>
        <div id="payQr" class="qr-box"><p class="muted small">Nhập ngân hàng và số tài khoản để xem mã.</p></div>
      </section>
    </div>
    <section class="sheet sheet-pad zalo-box" style="margin-top:14px">
      <div class="row"><h2 style="margin:0">💬 Báo đơn và xác nhận qua Zalo</h2><span class="spacer"></span>${v.zaloEnabled && v.zaloWebhookUrl && (v.zaloSecret || "").length >= 16 ? `<span class="tag tag-la">Đang bật</span>` : `<span class="tag tag-line">Chưa bật</span>`}</div>
      <p class="small muted">Khi học viên bấm “Tôi đã chuyển khoản”, hệ thống gửi đơn tới bot Zalo của bạn. Bạn kiểm tra tài khoản rồi nhắn cho bot <b>HT &lt;mã đơn&gt;</b> là gói được kích hoạt ngay; <b>HUY &lt;mã đơn&gt; &lt;lý do&gt;</b> để từ chối; <b>DON</b> để xem đơn đang chờ.</p>
      <form id="zaloForm" class="pay-form" autocomplete="off">
        <label class="check"><input type="checkbox" name="zaloEnabled" ${v.zaloEnabled ? "checked" : ""}> Bật báo đơn qua Zalo</label>
        <label class="field"><span>Địa chỉ bot Zalo nhận tin (URL)</span><input class="input" name="zaloWebhookUrl" value="${esc(v.zaloWebhookUrl || "")}" maxlength="300" placeholder="https://bot-zalo-cua-ban.vn/liferivo/don-hang"><small>Bot nhận POST JSON có trường <code>text</code> (tin cần gửi) và <code>to</code> (ID Zalo bên dưới), kèm header <code>X-PL-Secret</code>.</small></label>
        <div class="row" style="gap:12px">
          <label class="field" style="flex:1"><span>ID Zalo của bạn (tùy bot)</span><input class="input" name="zaloAdminId" value="${esc(v.zaloAdminId || "")}" maxlength="120" placeholder="ID người nhận / nhóm"><small>Nếu nhập, chỉ lệnh có trường <code>from</code> trùng ID này mới được chấp nhận.</small></label>
          <label class="field" style="flex:1"><span>Mã bí mật dùng chung</span><span class="row" style="gap:6px"><input class="input mono" name="zaloSecret" value="${esc(v.zaloSecret || "")}" maxlength="128" style="flex:1"><button type="button" class="btn btn-sm" id="zaloGen">Tạo mã</button></span><small>Ít nhất 16 ký tự. Dán mã này vào cấu hình bot.</small></label>
        </div>
        <label class="field"><span>Địa chỉ bot gửi lệnh HT về (dán vào bot)</span><span class="row" style="gap:6px"><input class="input mono" readonly value="${esc(location.origin)}/api/integrations/zalo" style="flex:1"><button type="button" class="btn btn-sm" data-copy="${esc(location.origin)}/api/integrations/zalo">${icon("copy")}Chép</button></span></label>
        <div class="row" style="margin-top:6px;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" type="submit">${icon("check")}Lưu cài đặt Zalo</button><button type="button" class="btn" id="zaloTest">🔔 Gửi tin thử tới Zalo</button><span class="form-msg" id="zaloMsg"></span></div>
      </form>
      <div class="zalo-try"><b class="small">Thử lệnh ngay tại đây (giống khi nhắn cho bot)</b>
        <div class="row" style="gap:6px;margin-top:6px"><input class="input mono" id="zaloCmd" placeholder="DON  hoặc  HT PL4Z2BW6" style="flex:1"><button class="btn btn-sm" id="zaloRun">Chạy</button></div>
        <pre class="zalo-reply" id="zaloReply" hidden></pre></div>
    </section>
    <section class="sheet sheet-pad" style="margin-top:14px">
      <div class="row"><h2 style="margin:0">Giá đang bán</h2><span class="spacer"></span><button class="btn btn-sm" id="goPlans">${icon("settings")}Sửa gói và giá</button></div>
      <div class="table-wrap" style="margin-top:8px"><table><thead><tr><th>Gói</th><th>Loại</th><th class="num">Thời hạn</th><th class="num">Giá</th></tr></thead>
      <tbody>${plans.map((p) => `<tr><td>${esc(p.name)}</td><td>${esc({ pro: "Cá nhân", family: "Gia đình", teacher: "Giáo viên" }[p.kind || "pro"] || p.kind)}</td><td class="num">${p.months} tháng</td><td class="num"><b>${p.quoteOnly ? "Liên hệ" : vnd(p.priceVnd)}</b></td></tr>`).join("")}</tbody></table></div>
    </section>
  </div>`;
  const form = $("#payForm", host), qr = $("#payQr", host);
  let t;
  const preview = () => {
    clearTimeout(t);
    t = setTimeout(async () => {
      const bin = form.payBank.value, acc = form.payAccountNo.value.trim();
      if (!bin || !acc) { qr.innerHTML = `<p class="muted small">Nhập ngân hàng và số tài khoản để xem mã.</p>`; return; }
      try {
        const r = await api(`/api/admin/pay/preview?bin=${encodeURIComponent(bin)}&acc=${encodeURIComponent(acc)}`);
        qr.innerHTML = r.qr ? `<img src="${r.qr}" width="220" height="220" alt="Mã QR thử"><p class="small"><b>${esc(r.bank)}</b> · ${esc(acc)}<br>${esc(form.payAccountName.value || "")}</p>` : `<p class="form-msg err">Không tạo được mã.</p>`;
      } catch (e) { qr.innerHTML = `<p class="form-msg err">${esc(e.message)}</p>`; }
    }, 350);
  };
  form.addEventListener("input", preview); form.addEventListener("change", preview); preview();
  form.payAccountNo.addEventListener("input", () => { const c = form.payAccountNo.selectionStart; form.payAccountNo.value = form.payAccountNo.value.replace(/\s+/g, ""); try { form.payAccountNo.setSelectionRange(c, c); } catch {} });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("#payMsg", host);
    const values = { payBank: form.payBank.value, payAccountNo: form.payAccountNo.value.trim(), payAccountName: form.payAccountName.value.trim(), payMode: form.payMode.value, manualConfirmNote: form.manualConfirmNote.value.trim(), orderExpireHours: Number(form.orderExpireHours.value), supportContact: form.supportContact.value.trim(), proEnabled: form.proEnabled.checked };
    if (values.payAccountNo && !/^[A-Za-z0-9]{4,19}$/.test(values.payAccountNo)) { msg.className = "form-msg err"; msg.textContent = "Số tài khoản chỉ gồm 4–19 chữ hoặc số."; return; }
    try { await api("/api/admin/settings", "PUT", { values }); toast("Đã lưu tài khoản nhận tiền.", "ok"); show(); }
    catch (err) { msg.className = "form-msg err"; msg.textContent = err.message; }
  });
  const zf = $("#zaloForm", host), zm = $("#zaloMsg", host);
  $("#zaloGen", host).addEventListener("click", () => { const b = new Uint8Array(24); crypto.getRandomValues(b); zf.zaloSecret.value = [...b].map((x) => x.toString(16).padStart(2, "0")).join(""); });
  host.querySelectorAll(".zalo-box [data-copy]").forEach((b) => b.addEventListener("click", () => navigator.clipboard?.writeText(b.dataset.copy).then(() => toast("Đã chép.", "ok"))));
  zf.addEventListener("submit", async (e) => {
    e.preventDefault();
    const values = { zaloEnabled: zf.zaloEnabled.checked, zaloWebhookUrl: zf.zaloWebhookUrl.value.trim(), zaloAdminId: zf.zaloAdminId.value.trim(), zaloSecret: zf.zaloSecret.value.trim() };
    if (values.zaloEnabled && !/^https?:\/\//i.test(values.zaloWebhookUrl)) { zm.className = "form-msg err"; zm.textContent = "URL bot phải bắt đầu bằng http:// hoặc https://"; return; }
    if (values.zaloEnabled && values.zaloSecret.length < 16) { zm.className = "form-msg err"; zm.textContent = "Mã bí mật cần ít nhất 16 ký tự (bấm Tạo mã)."; return; }
    try { await api("/api/admin/settings", "PUT", { values }); toast("Đã lưu cài đặt Zalo.", "ok"); show(); } catch (err) { zm.className = "form-msg err"; zm.textContent = err.message; }
  });
  $("#zaloTest", host).addEventListener("click", async () => {
    zm.className = "form-msg"; zm.textContent = "Đang gửi…";
    try { await api("/api/admin/zalo/test", "POST", {}); zm.className = "form-msg ok"; zm.textContent = "Bot đã nhận tin thử. Kiểm tra Zalo của bạn."; } catch (err) { zm.className = "form-msg err"; zm.textContent = err.message; }
  });
  const runCmd = async () => {
    const out = $("#zaloReply", host); out.hidden = false; out.textContent = "…";
    try { const r = await api("/api/admin/zalo/command", "POST", { text: $("#zaloCmd", host).value }); out.textContent = r.reply; out.classList.toggle("err", !r.ok); } catch (err) { out.textContent = err.message; }
  };
  $("#zaloRun", host).addEventListener("click", runCmd);
  $("#zaloCmd", host).addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); runCmd(); } });
  $("#goPlans", host).addEventListener("click", () => document.querySelector('#bizTabs [data-sub="goi"]')?.click());
}
