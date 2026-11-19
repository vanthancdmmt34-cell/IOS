/* LifeRivo 2.0 — admin panel for teachers */
import {  } from "./core.js";
import { bizPage } from "./admin-biz.js";
import { giftCodesAdminPage } from "./admin-gift.js";
import { adminShell, dashPage } from "./admin-dash.js";
import { systemPage } from "./admin-system.js";
import { lmsAdminPage } from "./admin-lms.js";
import { i18nAdminPage } from "./admin-i18n.js";
import { teachersAdminPage } from "./teacher-students.js";
import { pageLangAdmin } from "./lang.js";
import { roleLabel, cfg, refreshBrand } from "./core.js";
import { S, api, esc, lineIcon as icon, avatar, fmtN, fmtDate, timeAgo, toast, openModal, confirmBox, promptBox, findEx, chapterNum, chapterShort, $ } from "./core.js";

// Admin feature groups — unified 5-pillar architecture across desktop sidebar, sub-nav, and mobile dock
const ADMIN_GROUPS = [
  { id: "overview", label: "Tổng quan", items: [
    ["tong-quan", "Bảng điều khiển", "chart", "Việc cần xử lý và tình hình học tập"],
  ] },
  { id: "people", label: "Người dùng", items: [
    ["hoc-vien", "Tài khoản người dùng", "user", "Học viên, phụ huynh, khóa tài khoản, đặt lại mật khẩu"],
    ["giao-vien", "Giáo viên", "users", "Tài khoản và giấy phép giáo viên"],
    ["lop-giay-phep", "Lớp học và giấy phép", "book", "Lớp học và giấy phép Teacher"],
  ] },
  { id: "content", label: "Nội dung", items: [
    ["ngoai-ngu", "Khóa ngoại ngữ", "globe", "Quản lý nội dung ngoại ngữ"],
    ["song-ngu", "Bản dịch giao diện", "translate", "Song ngữ Việt và Anh"],
    ["thong-bao", "Thông báo", "bell", "Gửi thông báo tới học viên"],
    ["gop-y", "Góp ý & Đánh giá", "chat", "Góp ý sản phẩm và đánh giá sao của học viên"],
  ] },
  { id: "biz", label: "Kinh doanh", items: [
    ["kinh-doanh", "Doanh thu và gói Pro", "star", "Đơn hàng, thanh toán, thống kê AI"],
    ["ma-qua-tang", "Mã quà tặng Pro", "gift", "Tạo mã ngẫu nhiên, theo dõi mã đã dùng"],
  ] },
  { id: "system", label: "Hệ thống", items: [
    ["cai-dat", "Cài đặt chung", "sliders", "Đăng ký, bảo trì, thương hiệu"],
    ["he-thong", "Thanh toán, AI, máy chủ", "settings", "SePay, Gemini, website"],
    ["du-lieu", "Dữ liệu và sao lưu", "database", "Sao lưu, xuất, bảo trì cơ sở dữ liệu"],
    ["giam-sat", "Giám sát", "chart", "Số liệu hệ thống, chi phí AI, cảnh báo"],
  ] },
];
const TABS = ADMIN_GROUPS.flatMap((g) => g.items.filter(([k]) => !k.startsWith("#")).map(([k, l]) => [k, l]));
const TAB_META = Object.fromEntries(ADMIN_GROUPS.flatMap((g) => g.items.map(([k, l, ic, d]) => [k, { label: l, icon: ic, desc: d, group: g.label, groupId: g.id }])));

/* ---------- Bài tập tùy chỉnh: trắc nghiệm ngoại ngữ ---------- */
let DATA = null;


async function monitorPage(body) {
  body.innerHTML = `<div class="skel" style="height:260px"></div>`;
  let d;
  try { d = await api("/api/admin/monitoring"); }
  catch (e) { body.innerHTML = `<div class="sheet empty"><b>Không tải được số liệu giám sát</b>${esc(e.message)}</div>`; return; }
  const fmtMB = (b) => (b / 1048576).toFixed(0) + " MB";
  const fmtUSD = (micro) => "$" + (micro / 1000000).toFixed(4);
  const alertHtml = d.alerts.length ? d.alerts.map((a) => `<div class="sheet" style="margin-bottom:10px;border-left:4px solid ${a.level === "critical" ? "#dc2626" : a.level === "warning" ? "#d97706" : "#2563eb"}"><b>${a.level === "critical" ? "Nghiêm trọng" : a.level === "warning" ? "Cảnh báo" : "Thông tin"}:</b> ${esc(a.text)}</div>`).join("") : `<div class="sheet" style="margin-bottom:10px"><b>Không có cảnh báo.</b> Hệ thống đang chạy bình thường.</div>`;
  body.innerHTML = `
    <div style="margin-bottom:12px"><h2 style="margin:0">Giám sát hệ thống</h2><p class="small muted" style="margin:4px 0 0">Số liệu trực tiếp lúc ${esc(d.generatedAt)} · bấm "Tải lại Số liệu" để cập nhật.</p></div>
    ${alertHtml}
    <section class="sheet sheet-pad">
      <h3 style="margin-top:0">Backend</h3>
      <div class="stats biz-stats" style="margin-bottom:14px">
        <div><b>${fmtN(Math.round(d.backend.uptimeSec / 60))} phút</b><span>Uptime</span></div>
        <div><b>${fmtMB(d.backend.rss)}</b><span>RAM RSS</span></div>
        <div><b>${fmtMB(d.backend.heapUsed)}</b><span>Heap</span></div>
        <div><b>${fmtN(d.backend.inflight)}</b><span>Đang xử lý</span></div>
        <div><b>${fmtN(d.backend.requestsTotal)}</b><span>Tổng request</span></div>
        <div><b>${d.backend.avgLatencyMs.toFixed(1)} ms</b><span>Độ trễ trung bình</span></div>
        <div><b>${(d.backend.eventLoopLagSec * 1000).toFixed(1)} ms</b><span>Event loop lag</span></div>
      </div>
      <h3>Cơ sở dữ liệu</h3>
      <div class="stats biz-stats" style="margin-bottom:14px">
        <div><b>${fmtN(d.db.users)}</b><span>Người dùng</span></div>
        <div><b>${fmtN(d.db.online)}</b><span>Đang online</span></div>
      </div>
      <h3>Chi phí AI</h3>
      <div class="stats biz-stats" style="margin-bottom:14px">
        <div><b>${fmtUSD(d.ai.total.cost)}</b><span>Tổng chi phí</span></div>
        <div><b>${fmtN(d.ai.total.i + d.ai.total.o)}</b><span>Tổng token</span></div>
        <div><b>${fmtN(d.ai.total.c)}</b><span>Tổng lượt</span></div>
        <div><b>${fmtN(d.ai.total.failed)}</b><span>Lượt lỗi</span></div>
        <div><b>${fmtUSD(d.ai.today.cost)}</b><span>Chi phí AI hôm nay</span></div>
        <div><b>${fmtUSD(d.ai.last7d.cost)}</b><span>7 ngày</span></div>
        <div><b>Bình thường</b><span>Trạng thái dịch vụ</span></div>
      </div>
      ${d.ai.byModel.length ? `<div class="table-wrap" style="border:0"><table><thead><tr><th>Model</th><th class="num">Lượt</th><th class="num">Token vào</th><th class="num">Token ra</th><th class="num">Chi phí</th></tr></thead><tbody>${d.ai.byModel.map((m) => `<tr><td><code>${esc(m.model || "(trống)")}</code></td><td class="num">${fmtN(m.c)}</td><td class="num">${fmtN(m.i)}</td><td class="num">${fmtN(m.o)}</td><td class="num">${fmtUSD(m.cost)}</td></tr>`).join("")}</tbody></table></div>` : ""}
    </section>`;
}

const langAdminPage = (body, ctx) => pageLangAdmin(body, [], {}, ctx);

export async function pageAdmin(main, [tab = "tong-quan", uid], _q, ctx) {
  if (S.me.role !== "admin") { main.innerHTML = `<div class="sheet empty"><b>Bạn không có quyền vào trang này</b>Chỉ tài khoản quản trị viên mới vào được.</div>`; return; }
  if (!TABS.some((t) => t[0] === tab)) tab = "tong-quan";
  const meta = TAB_META[tab] || { label: tab, group: "Quản trị" };
  ctx.setCrumbs([["Quản trị", "/app/quan-tri"], [meta.group, `/app/quan-tri/${tab}`], [uid ? "Hồ sơ người dùng" : meta.label]]);
  const content = adminShell(main, { tab, groups: ADMIN_GROUPS, ctx });
  const reload = async () => { DATA = null; await pageAdmin(main, [tab, uid], _q, ctx); toast("Đã tải lại số liệu.", "ok"); };
  const isDash = tab === "tong-quan";
  const curGroup = ADMIN_GROUPS.find((g) => g.items.some(([k]) => k === tab)) || ADMIN_GROUPS[0];
  const subnavHtml = !isDash && curGroup && curGroup.items.length > 1
    ? `<nav class="ad-subnav" aria-label="Phân mục ${esc(curGroup.label)}">${curGroup.items.map(([k, l, ic]) => `<a href="/app/quan-tri/${k}" class="ad-subnav-it ${k === tab ? "on" : ""}">${icon(ic || "file")}<span>${esc(l)}</span></a>`).join("")}</nav>`
    : "";
  content.innerHTML = isDash ? `<div id="admBody"><div class="skel" style="height:420px"></div></div>` : `
    ${subnavHtml}
    <div class="ax-head">
      <div><h1>${esc(uid ? "Hồ sơ người dùng" : meta.label)}</h1><p>${esc(meta.group)}${meta.desc ? " · " + esc(meta.desc) : ""}</p></div>
      <button class="ax-ghost" id="admReload" type="button">${icon("reset")}Tải lại số liệu</button>
    </div>
    <div id="admBody"><div class="skel" style="height:260px"></div></div>`;
  $("#admReload", main)?.addEventListener("click", reload);

  const body = $("#admBody", main);
  try {
    if (!DATA) DATA = await api("/api/admin/overview");
  } catch (e) { body.innerHTML = `<div class="sheet empty"><b>Không tải được dữ liệu quản trị</b>${esc(e.message)}</div>`; return; }
  if (!ctx.isCurrent()) return;
  if (tab === "hoc-vien" && uid) return studentDetail(body, Number(uid), ctx);
  if (isDash) return dashPage(body, DATA, { onReload: reload });
  ({ "tong-quan": overview, "hoc-vien": students, "thong-bao": notices, "gop-y": feedbackAdminPage, "giao-vien": teachersAdminPage, "lop-giay-phep": lmsAdminPage, "song-ngu": i18nAdminPage, "kinh-doanh": bizPage, "ma-qua-tang": giftCodesAdminPage,"he-thong": systemPage, "cai-dat": settingsPage, "du-lieu": dataPage, "giam-sat": monitorPage, "ngoai-ngu": langAdminPage })[tab](body, ctx);
}

/* ---------- Overview ---------- */
/* ---------- Learners ---------- */
function students(body) {
  const all = DATA.students || [];
  const stats = DATA.userStats || {};
  const byRole = stats.byRole || {};
  const prevSq = body.querySelector("#sq");
  let q = prevSq ? prevSq.value : "",
    sort = body.querySelector("#ss")?.value || "new",
    role = body.querySelector("#sr")?.value || "all",
    status = body.querySelector("#st")?.value || "all";
  body.innerHTML = `
    <div class="stats biz-stats" style="margin-bottom:14px">
      <div><b>${fmtN(stats.total ?? all.length)}</b><span>Tổng tài khoản</span></div>
      <div><b>${fmtN(byRole.student || 0)}</b><span>Học viên</span></div>
      <div><b>${fmtN(byRole.teacher || 0)}</b><span>Giáo viên</span></div>
      <div><b>${fmtN(byRole.parent || 0)}</b><span>Phụ huynh</span></div>
      <div><b>${fmtN(byRole.admin || 0)}</b><span>Quản trị</span></div>
      <div><b>${fmtN(stats.locked || all.filter((u) => u.disabled).length)}</b><span>Đã khóa</span></div>
      <div><b>${fmtN(stats.online || all.filter((u) => (u.sessions || 0) > 0).length)}</b><span>Đang có phiên</span></div>
    </div>
    <div class="toolbar">
      <input class="input" type="search" id="sq" placeholder="Tìm tên hoặc username" aria-label="Tìm người dùng">
      <select class="select" id="sr" aria-label="Vai trò">
        <option value="all">Mọi vai trò</option>
        <option value="student">Học viên</option>
        <option value="teacher">Giáo viên</option>
        <option value="parent">Phụ huynh</option>
        <option value="admin">Quản trị</option>
      </select>
      <select class="select" id="st" aria-label="Trạng thái">
        <option value="all">Mọi trạng thái</option>
        <option value="active">Đang mở</option>
        <option value="locked">Đã khóa</option>
      </select>
      <select class="select" id="ss" aria-label="Sắp xếp">
        <option value="new">Mới đăng ký</option>
        <option value="xp">XP cao nhất</option>
        <option value="name">Tên A → Z</option>
        <option value="active">Hoạt động gần nhất</option>
      </select>
      <span style="flex:1"></span>
      <button class="btn btn-primary" id="addU">${icon("plus")}Thêm tài khoản</button>
      <button class="btn" id="bulkU">${icon("file")}Nhập danh sách</button>
      <button class="btn" id="csv">${icon("download")}Xuất CSV</button>
    </div>
    <p class="small muted" id="ucount" style="margin:0 0 8px"></p>
    <div class="table-wrap"><table class="stack-m"><thead><tr>
      <th>Người dùng</th><th>Vai trò</th><th>Đăng ký</th><th>Hoạt động</th><th class="num">Phiên</th><th class="num">XP</th><th>Trạng thái</th><th></th>
    </tr></thead><tbody id="sb"></tbody></table></div>`;

  const paint = () => {
    const nq = q.toLowerCase();
    let rows = all.filter((s) => {
      if (role !== "all" && s.role !== role) return false;
      if (status === "locked" && !s.disabled) return false;
      if (status === "active" && s.disabled) return false;
      if (nq && !String(s.displayName || "").toLowerCase().includes(nq) && !String(s.username || "").toLowerCase().includes(nq)) return false;
      return true;
    });
    rows.sort((a, b) => {
      if (sort === "xp") return (b.total || 0) - (a.total || 0);
      if (sort === "name") return String(a.displayName).localeCompare(String(b.displayName), "vi");
      if (sort === "active") return String(b.lastActive || "").localeCompare(String(a.lastActive || ""));
      return String(b.createdAt).localeCompare(String(a.createdAt));
    });
    $("#ucount", body).textContent = `${rows.length} tài khoản khớp bộ lọc`;
    $("#sb", body).innerHTML = rows.map((s) => `<tr>
      <td><a class="row" style="gap:10px;flex-wrap:nowrap;color:inherit;text-decoration:none" href="/app/quan-tri/hoc-vien/${s.id}">
        ${avatar(s.displayName, s.username)}
        <span><b>${esc(s.displayName)}</b>${s.id === S.me.id ? ` <span class="tag tag-tim">Bạn</span>` : ""}
        <br><span class="small muted">@${esc(s.username)}</span></span></a></td>
      <td data-label="Vai trò">${s.role === "student" ? "Học viên" : `<span class="tag ${s.role === "admin" ? "tag-do" : s.role === "teacher" ? "tag-tim" : "tag-line"}">${esc(roleLabel(s.role))}</span>`}</td>
      <td class="nowrap small" data-label="Đăng ký">${fmtDate(s.createdAt, false)}</td>
      <td class="nowrap small" data-label="Hoạt động">${s.lastActive ? timeAgo(s.lastActive) : `<span class="muted">—</span>`}</td>
      <td class="num" data-label="Phiên">${s.sessions || 0}</td>
      <td class="num" data-label="XP"><b>${fmtN(s.total)}</b></td>
      <td data-label="Trạng thái">${s.disabled ? `<span class="tag tag-off">Đã khóa</span>` : `<span class="tag tag-la">Đang mở</span>`}</td>
      <td class="num nowrap"><a class="btn btn-sm" href="/app/quan-tri/hoc-vien/${s.id}">Xem</a>
        <button class="btn btn-sm btn-ghost" data-act="${s.id}">Thao tác…</button></td></tr>`).join("")
      || `<tr><td colspan="8"><div class="empty"><b>Không có ai khớp</b></div></td></tr>`;
    body.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => userActions(all.find((x) => String(x.id) === b.dataset.act), () => students(body))));
  };
  $("#addU", body).addEventListener("click", () => addUser(() => students(body)));
  $("#bulkU", body).addEventListener("click", () => bulkUsers(() => students(body)));
  if (q) $("#sq", body).value = q;
  if (role !== "all") $("#sr", body).value = role;
  if (status !== "all") $("#st", body).value = status;
  if (sort !== "new") $("#ss", body).value = sort;
  $("#sq", body).addEventListener("input", (e) => { q = e.target.value; paint(); });
  $("#sr", body).addEventListener("change", (e) => { role = e.target.value; paint(); });
  $("#st", body).addEventListener("change", (e) => { status = e.target.value; paint(); });
  $("#ss", body).addEventListener("change", (e) => { sort = e.target.value; paint(); });
  $("#csv", body).addEventListener("click", () => {
    const lines = [["username", "ten_hien_thi", "vai_tro", "trang_thai", "ngay_dang_ky", "hoat_dong_gan_nhat", "phien", "xp", "chung_nhan"]].concat(
      all.map((s) => [s.username, s.displayName, s.role, s.disabled ? "khoa" : "mo", s.createdAt, s.lastActive || "", s.sessions || 0, s.total, s.complete ? "co" : "chua"])
    );
    const csv = "\ufeff" + lines.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `nguoi-dung-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  paint();
}

async function resetPw(s) {
  const v = await promptBox(`Đặt lại mật khẩu cho ${s.displayName}`, "Học viên sẽ bị đăng xuất khỏi mọi thiết bị và phải đăng nhập lại bằng mật khẩu mới.",
    { label: "Mật khẩu mới (6 đến 128 ký tự)", type: "text", okLabel: "Đặt lại mật khẩu", validate: (x) => x.length < 6 || x.length > 128 ? "Mật khẩu mới cần từ 6 đến 128 ký tự." : "" });
  if (v == null) return;
  try { await api(`/api/admin/users/${s.id}/reset-password`, "POST", { newPassword: v }); toast(`Đã đặt lại mật khẩu cho @${s.username}.`, "ok"); }
  catch (e) { toast(e.message, "err"); }
}

/* ---------- Submissions ---------- */
/* ---------- Custom exercises ---------- */
/* ---------- Class announcements ---------- */
async function notices(body) {
  let list = [];
  try { list = (await api("/api/announcements")).announcements || []; } catch (e) {}
  body.innerHTML = `<div class="two-col">
    <section class="sheet sheet-pad"><h2>Gửi thông báo cho cả lớp</h2><p class="small muted" style="margin-top:4px">Học viên thấy thông báo ngay trên trang Tổng quan và trang Thông báo lớp.</p>
      <form class="auth-form" id="anf">
        <label class="field">Tiêu đề<input name="t" maxlength="160" placeholder="Ví dụ: Thứ Sáu kiểm tra chương 5" required></label>
        <label class="field">Nội dung<textarea name="b" rows="5" maxlength="4000" placeholder="Nội dung chi tiết (không bắt buộc)"></textarea></label>
        <label class="check"><input type="checkbox" name="pin">Ghim lên đầu</label>
        <div class="row"><button class="btn btn-primary">${icon("send")}Gửi thông báo</button></div>
      </form></section>
    <section class="sheet sheet-pad"><div class="sec-head"><h2>Đã gửi</h2><span class="tag">${list.length}</span></div>
      ${list.length ? `<ul class="list">${list.map((a) => `<li><div class="list-row"><span aria-hidden="true">${a.pinned ? "📌" : "📣"}</span><span class="t"><b>${esc(a.title)}</b><span>${fmtDate(a.created_at)}</span></span><button class="btn btn-sm btn-danger" data-del="${a.id}" aria-label="Xóa thông báo">${icon("trash")}</button></div></li>`).join("")}</ul>` : `<div class="empty"><b>Chưa gửi thông báo nào</b></div>`}
    </section></div>`;
  $("#anf", body).addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    try { await api("/api/admin/announcements", "POST", { title: f.t.value, body: f.b.value, pinned: f.pin.checked }); toast("Đã gửi thông báo.", "ok"); notices(body); }
    catch (err) { toast(err.message, "err"); }
  });
  body.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", async () => {
    if (!(await confirmBox("Xóa thông báo?", "Học viên sẽ không còn thấy thông báo này.", "Xóa", true))) return;
    try { await api(`/api/admin/announcements/${b.dataset.del}`, "DELETE", {}); toast("Đã xóa.", "ok"); notices(body); } catch (err) { toast(err.message, "err"); }
  }));
}

/* ---------- 2.2: account management ---------- */
async function refreshData(after) { DATA = await api("/api/admin/overview"); after && after(); }
function genPass() { const c = "abcdefghjkmnpqrstuvwxyz23456789"; let p = ""; for (let i = 0; i < 8; i++) p += c[Math.floor(Math.random() * c.length)]; return p; }

function addUser(after) {
  const m = openModal(`<h2>Thêm tài khoản</h2><p class="lead">Tạo sẵn tài khoản rồi đưa tên đăng nhập và mật khẩu cho học viên.</p>
    <form class="auth-form" data-f>
      <label class="field">Tên đăng nhập<input class="input" name="u" maxlength="30" autocomplete="off" required><small>3 đến 30 ký tự: chữ không dấu, số, dấu _ . -</small></label>
      <label class="field">Tên hiển thị<input class="input" name="n" maxlength="40" placeholder="Ví dụ: Nguyễn Văn An"></label>
      <label class="field">Mật khẩu<input class="input" name="p" maxlength="128" value="${genPass()}" autocomplete="off" required><small>Đã tạo sẵn mật khẩu ngẫu nhiên, bạn có thể đổi.</small></label>
      <label class="field">Vai trò<select class="select" name="r"><option value="student">Học viên</option><option value="parent">Phụ huynh</option><option value="teacher">Giáo viên (cần thêm giấy phép để tạo lớp)</option><option value="admin">Quản trị hệ thống</option></select></label>
      <p class="form-msg err" data-m></p>
      <div class="modal-actions" style="margin-top:0"><button type="button" class="btn" data-close>Hủy</button><button class="btn btn-primary">Tạo tài khoản</button></div>
    </form>`);
  m.el.querySelector("[data-f]").addEventListener("submit", async (e) => {
    e.preventDefault(); const f = e.target;
    try {
      await api("/api/admin/users", "POST", { username: f.u.value.trim(), displayName: f.n.value.trim(), password: f.p.value, role: f.r.value });
      m.close(); toast(`Đã tạo tài khoản @${f.u.value.trim()} với mật khẩu ${f.p.value}`, "ok", 8000); refreshData(after);
    } catch (err) { m.el.querySelector("[data-m]").textContent = err.message; }
  });
}

function bulkUsers(after) {
  const m = openModal(`<h2>Nhập danh sách học viên</h2>
    <p class="lead">Mỗi dòng một học viên theo dạng <code class="ic">tên_đăng_nhập, Tên hiển thị, mật khẩu</code>. Bỏ trống mật khẩu thì hệ tự tạo. Có thể dán thẳng từ Excel (cột cách nhau bằng dấu phẩy hoặc Tab).</p>
    <form class="auth-form" data-f>
      <label class="field">Danh sách<textarea name="t" rows="9" class="code" spellcheck="false" placeholder="an.nguyen, Nguyễn Văn An, matkhau1&#10;binh.tran, Trần Thị Bình"></textarea></label>
      <p class="form-msg" data-m></p>
      <div class="modal-actions" style="margin-top:0"><button type="button" class="btn" data-close>Đóng</button><button class="btn btn-primary">Tạo tài khoản</button></div>
    </form>
    <div data-out></div>`, { cls: "wide" });
  m.el.querySelector("[data-f]").addEventListener("submit", async (e) => {
    e.preventDefault();
    const rows = e.target.t.value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => l.split(/\t|,/).map((x) => x.trim()))
      .filter((c) => c[0] && !/^(username|ten_dang_nhap|tên đăng nhập)$/i.test(c[0])).map((c) => ({ username: c[0], displayName: c[1] || c[0], password: c[2] || genPass() }));
    const msg = m.el.querySelector("[data-m]");
    if (!rows.length) { msg.textContent = "Chưa có dòng nào."; msg.className = "form-msg err"; return; }
    try {
      const r = await api("/api/admin/users/bulk", "POST", { users: rows });
      msg.textContent = `Đã tạo ${r.created}/${rows.length} tài khoản.`; msg.className = "form-msg " + (r.errors.length ? "err" : "ok");
      const ok = rows.filter((x) => !r.errors.some((er) => er.includes(`“${x.username}”`)));
      m.el.querySelector("[data-out]").innerHTML = `${r.errors.length ? `<div class="req" style="border-color:var(--do)"><b>Không tạo được</b>${r.errors.map((x) => esc(x)).join("<br>")}</div>` : ""}
        ${ok.length ? `<div class="sec-head" style="margin-top:16px"><h3>Tài khoản đã tạo</h3><button class="btn btn-sm" data-dl>${icon("download")}Tải danh sách mật khẩu (CSV)</button></div>
        <div class="table-wrap"><table><thead><tr><th>Tên đăng nhập</th><th>Tên hiển thị</th><th>Mật khẩu</th></tr></thead><tbody>${ok.map((x) => `<tr><td>${esc(x.username)}</td><td>${esc(x.displayName)}</td><td class="mono">${esc(x.password)}</td></tr>`).join("")}</tbody></table></div>` : ""}`;
      m.el.querySelector("[data-dl]")?.addEventListener("click", () => {
        const csv = "﻿" + [["ten_dang_nhap", "ten_hien_thi", "mat_khau"], ...ok.map((x) => [x.username, x.displayName, x.password])].map((r2) => r2.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
        const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = "tai-khoan-moi.csv"; a.click();
      });
      refreshData(after);
    } catch (err) { msg.textContent = err.message; msg.className = "form-msg err"; }
  });
}

function userActions(u, after) {
  const self = u.id === S.me.id;
  const patch = async (body, msg) => {
    try {
      await api(`/api/admin/users/${u.id}`, "PATCH", body);
      toast(msg, "ok");
      m.close();
      await refreshData(after);
    } catch (e) { toast(e.message, "err"); }
  };
  const m = openModal(`<div class="row" style="gap:12px;flex-wrap:nowrap">${avatar(u.displayName, u.username)}<div><h2>${esc(u.displayName)}</h2><p class="muted">@${esc(u.username)} · ${esc(roleLabel(u.role))}${u.disabled ? " · đang bị khóa" : ""}${u.sessions ? ` · ${u.sessions} phiên đăng nhập` : ""}</p></div></div>
    <ul class="list" style="margin-top:14px">
      <li><button class="list-row btn-ghost" style="width:100%;border:0;background:none;cursor:pointer;text-align:left" data-a="name"><span class="ico-box">${icon("user")}</span><span class="t"><b>Đổi tên hiển thị</b><span>Tên hiện trên bảng xếp hạng và chứng nhận</span></span></button></li>
      <li><button class="list-row" style="width:100%;border:0;background:none;cursor:pointer;text-align:left" data-a="pw"><span class="ico-box">${icon("key")}</span><span class="t"><b>Đặt lại mật khẩu</b><span>Đăng xuất khỏi mọi thiết bị, bắt đăng nhập lại</span></span></button></li>
      ${self ? "" : `<li><button class="list-row" style="width:100%;border:0;background:none;cursor:pointer;text-align:left" data-a="sessions"><span class="ico-box">${icon("logout")}</span><span class="t"><b>Đăng xuất mọi phiên</b><span>Thu hồi cookie đăng nhập trên mọi máy (không đổi mật khẩu)</span></span></button></li>`}
      ${self ? "" : `<li><button class="list-row" style="width:100%;border:0;background:none;cursor:pointer;text-align:left" data-a="role"><span class="ico-box">${icon("settings")}</span><span class="t"><b>Đổi vai trò</b><span>Hiện là ${esc(roleLabel(u.role))}. Quản trị có toàn quyền; giáo viên quản lý lớp của mình.</span></span></button></li>`}
      ${self ? "" : `<li><button class="list-row" style="width:100%;border:0;background:none;cursor:pointer;text-align:left" data-a="lock"><span class="ico-box">${icon("lock")}</span><span class="t"><b>${u.disabled ? "Mở khóa tài khoản" : "Khóa tài khoản"}</b><span>${u.disabled ? "Cho phép đăng nhập lại" : "Chặn đăng nhập ngay"}</span></span></button></li>`}
      ${self ? "" : `<li><button class="list-row" style="width:100%;border:0;background:none;cursor:pointer;text-align:left;color:var(--do)" data-a="del"><span class="ico-box">${icon("trash")}</span><span class="t"><b>Xóa vĩnh viễn</b><span>Xóa bài nộp, phiên, ghi chú của tài khoản này</span></span></button></li>`}
    </ul>
    <div class="modal-actions"><button class="btn" data-close>Đóng</button></div>`);
  m.el.querySelector('[data-a="name"]')?.addEventListener("click", async () => {
    const v = await promptBox("Đổi tên hiển thị", "", { label: "Tên mới", okLabel: "Lưu", value: u.displayName, validate: (x) => x.trim().length < 2 ? "Tên cần ít nhất 2 ký tự." : "" });
    if (v != null) patch({ displayName: v.trim() }, "Đã đổi tên.");
  });
  m.el.querySelector('[data-a="pw"]')?.addEventListener("click", () => { m.close(); resetPw(u); });
  m.el.querySelector('[data-a="sessions"]')?.addEventListener("click", async () => {
    if (!(await confirmBox("Đăng xuất mọi phiên?", `@${u.username} sẽ phải đăng nhập lại trên mọi thiết bị.`, "Đăng xuất", true))) return;
    try {
      const r = await api(`/api/admin/users/${u.id}/logout-sessions`, "POST", {});
      toast(`Đã xóa ${r.cleared || 0} phiên đăng nhập.`, "ok");
      m.close();
      await refreshData(after);
    } catch (e) { toast(e.message, "err"); }
  });
  m.el.querySelector('[data-a="role"]')?.addEventListener("click", async () => {
    m.close();
    const r = openModal(`<h2>Đổi vai trò @${esc(u.username)}</h2><div class="list" style="margin-top:12px">${["student", "parent", "teacher", "admin"].map((k) => `<label class="check" style="padding:8px 0"><input type="radio" name="rr" value="${k}" ${k === u.role ? "checked" : ""}> <b>${esc(roleLabel(k))}</b> <span class="small muted">${{ student: "Học, làm bài, tham gia lớp", parent: "Quản lý gói Family, xem tiến độ được chia sẻ", teacher: "Quản lý lớp của mình (cần giấy phép Teacher còn hạn để tạo lớp)", admin: "Toàn quyền: tài khoản, doanh thu, khóa AI, cài đặt" }[k]}</span></label>`).join("")}</div>
      <div class="modal-actions"><button class="btn" data-close>Hủy</button><button class="btn btn-primary" data-ok>Lưu</button></div>`);
    r.el.querySelector("[data-ok]").addEventListener("click", async () => {
      const v = r.el.querySelector("input[name=rr]:checked").value;
      if (v === u.role) return r.close();
      if (v === "admin" && !(await confirmBox("Cấp quyền quản trị?", `@${u.username} sẽ xem được mọi dữ liệu, doanh thu, đổi khóa AI và mọi cài đặt.`, "Cấp quyền", true))) return;
      r.close();
      try {
        await api(`/api/admin/users/${u.id}`, "PATCH", { role: v });
        toast("Đã đổi vai trò.", "ok");
        await refreshData(after);
      } catch (e) { toast(e.message, "err"); }
    });
  });
  m.el.querySelector('[data-a="lock"]')?.addEventListener("click", () => patch({ disabled: !u.disabled }, u.disabled ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản."));
  m.el.querySelector('[data-a="del"]')?.addEventListener("click", async () => {
    const v = await promptBox("Xóa tài khoản vĩnh viễn?", `Gõ đúng tên đăng nhập “${u.username}” để xác nhận. Mọi bài nộp, bài thi, ghi chú của tài khoản này sẽ bị xóa.`, { label: "Tên đăng nhập", okLabel: "Xóa vĩnh viễn", validate: (x) => x.trim() !== u.username ? "Tên đăng nhập chưa khớp." : "" });
    if (v == null) return;
    try { await api(`/api/admin/users/${u.id}`, "DELETE", {}); toast(`Đã xóa @${u.username}.`, "ok"); m.close(); await refreshData(after); } catch (e) { toast(e.message, "err"); }
  });
}

/* ---------- 2.2: System settings ---------- */
// ===== 4.0.1: system logo =====
function logoBox() {
  const url = cfg("logoUrl", "");
  return `<div class="set-row" data-row="logo"><div class="lbl"><b>Logo</b><span>Ảnh PNG, JPG hoặc WebP, tối đa 512 KB (ảnh lớn được tự thu nhỏ). Hiện ở góc trên, trang giới thiệu, trang công khai, chứng nhận và biểu tượng tab. Nên dùng ảnh vuông hoặc ngang, nền trong suốt.</span></div>
    <div class="logo-box"><div class="logo-prev" id="logoPrev">${url ? `<img src="${esc(url)}" alt="Logo hiện tại">` : `<span class="brand-mark">LR</span><span class="small muted">Đang dùng logo mặc định</span>`}</div>
      <div class="row" style="gap:8px;flex-wrap:wrap"><label class="btn btn-sm">${icon("download")}Chọn ảnh…<input type="file" id="logoFile" accept="image/png,image/jpeg,image/webp" hidden></label>
      ${url ? `<button class="btn btn-sm btn-ghost" id="logoDel" type="button">${icon("trash")}Dùng logo mặc định</button>` : ""}</div><p class="form-msg err" id="logoMsg"></p></div></div>`;
}
// Resize image in browser (max 512 px) then send as binary
async function shrinkLogo(file) {
  const img = await new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => fail(new Error("Không đọc được ảnh.")); i.src = URL.createObjectURL(file); });
  const k = Math.min(1, 512 / Math.max(img.naturalWidth, img.naturalHeight));
  if (k === 1 && file.size <= 512 * 1024) return file;
  const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  for (const [t, q] of [["image/png"], ["image/webp", 0.9], ["image/jpeg", 0.85]]) {
    const b = await new Promise((ok) => c.toBlob(ok, t, q));
    if (b && b.size <= 512 * 1024) return b;
  }
  throw new Error("Ảnh vẫn quá lớn sau khi thu nhỏ. Hãy chọn ảnh khác.");
}
function bindLogo(body, ctx) {
  const msg = () => $("#logoMsg", body);
  const after = (r) => { S.cfg.logoUrl = r.logoUrl; refreshBrand(); toast(r.logoUrl ? "Đã cập nhật logo." : "Đã quay về logo mặc định.", "ok"); settingsPage(body, ctx); };
  $("#logoFile", body)?.addEventListener("change", async (e) => {
    const f = e.target.files[0]; if (!f) return;
    msg().textContent = "";
    if (!/^image\/(png|jpeg|webp)$/.test(f.type)) { msg().textContent = "Chỉ nhận ảnh PNG, JPG hoặc WebP."; return; }
    try {
      const blob = await shrinkLogo(f);
      const r = await fetch("/api/admin/brand/logo", { method: "POST", credentials: "same-origin", headers: { "Content-Type": blob.type || f.type, "X-CSRF-Token": S.csrf }, body: blob });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Không tải lên được.");
      after(j);
    } catch (err) { msg().textContent = err.message; }
  });
  $("#logoDel", body)?.addEventListener("click", async () => {
    try { after(await api("/api/admin/brand/logo", "DELETE")); } catch (err) { msg().textContent = err.message; }
  });
}

async function settingsPage(body, ctx) {
  if (body._stAc) body._stAc.abort();
  const stAc = new AbortController();
  body._stAc = stAc;
  ctx?.onLeave?.(() => stAc.abort());
  body.innerHTML = `<div class="skel" style="height:300px"></div>`;
  let d;
  try { d = await api("/api/admin/settings"); } catch (e) { body.innerHTML = `<div class="sheet empty"><b>Không tải được cài đặt</b>${esc(e.message)}</div>`; return; }
  const saved = JSON.parse(JSON.stringify(d.values));
  const cur = JSON.parse(JSON.stringify(d.values));
  const fieldHtml = (f) => {
    const v = cur[f.key];
    const id = `st-${f.key}`;
    let ctl = "";
    if (f.type === "bool") ctl = `<label class="switch"><input type="checkbox" id="${id}" data-k="${f.key}" ${v ? "checked" : ""}><i></i><span>${v ? "Đang bật" : "Đang tắt"}</span></label>`;
    else if (f.type === "number") ctl = `<input class="input" type="number" id="${id}" data-k="${f.key}" min="${f.min}" max="${f.max}" value="${esc(v)}" style="max-width:160px">`;
    else if (f.type === "textarea") ctl = `<textarea class="input" id="${id}" data-k="${f.key}" rows="3" maxlength="${f.max || 400}">${esc(v)}</textarea>`;
    else if (f.type === "url") ctl = `<input class="input" type="url" inputmode="url" autocomplete="url" id="${id}" data-k="${f.key}" maxlength="${f.max || 400}" value="${esc(v)}" placeholder="https://...">`;
    else if (f.type === "select") ctl = `<div class="row" style="gap:8px;flex-wrap:nowrap">${f.key === "brandColor" ? `<span class="swatch" data-sw style="background:${(d.brandColors[v] || [])[1]};width:28px;height:28px;border-radius:8px"></span>` : ""}<select class="select" id="${id}" data-k="${f.key}">${f.options.map(([k, l]) => `<option value="${esc(k)}" ${k === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></div>`;
    else if (f.type === "multi") ctl = `<div class="multi" data-multi="${f.key}">${(d.sources[f.source] || []).map(([k, l]) => `<label class="check"><input type="checkbox" value="${esc(k)}" ${(v || []).includes(k) ? "checked" : ""}>${esc(l)}</label>`).join("")}</div>`;
    else ctl = `<input class="input" id="${id}" data-k="${f.key}" maxlength="${f.max || 400}" value="${esc(v)}">`;
    return `<div class="set-row" data-row="${f.key}"><label class="lbl" for="${id}"><b>${esc(f.label)}</b>${f.help ? `<span>${esc(f.help)}</span>` : ""}</label><div>${ctl}</div></div>`;
  };
  // 3.2.0: billing and AI settings moved to dedicated "Billing, AI & System" tab
  d.groups = d.groups.filter(([g]) => g !== "commerce" && g !== "ai");
  body.innerHTML = `
    <div class="pay-warn" style="margin:0 0 12px">Tài khoản nhận tiền, gói Pro, khóa và hạn mức AI, địa chỉ website nằm ở tab <a href="/app/quan-tri/he-thong"><b>Thanh toán, AI, hệ thống</b></a>.</div>
    <div class="set-layout">
      <nav class="set-nav" aria-label="Nhóm cài đặt">${d.groups.map(([g, t]) => `<a href="#st-${g}" data-jump="${g}">${esc(t)}</a>`).join("")}</nav>
      <div>
        ${d.groups.map(([g, t, help]) => `<section class="sheet sheet-pad set-group" id="st-${g}" style="margin-bottom:16px">
          <h2>${esc(t)}</h2><p class="small muted" style="margin-top:4px">${esc(help)}</p>
          ${g === "general" ? logoBox() : ""}
          ${d.schema.filter((f) => f.group === g).map(fieldHtml).join("")}
        </section>`).join("")}
        <div class="save-bar"><span id="chg" class="small muted">Chưa có thay đổi.</span><span style="flex:1"></span>
          <button class="btn btn-ghost" id="stReset">Khôi phục mặc định</button><button class="btn" id="stUndo" disabled>Hoàn tác</button><button class="btn btn-primary" id="stSave" disabled>${icon("check")}Lưu cài đặt</button></div>
      </div>
    </div>`;
  bindLogo(body, ctx);
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const changed = () => d.schema.filter((f) => !same(cur[f.key], saved[f.key]));
  const paint = () => {
    const ch = changed();
    body.querySelectorAll("[data-row]").forEach((r) => r.classList.toggle("changed", ch.some((f) => f.key === r.dataset.row)));
    $("#chg", body).textContent = ch.length ? `${ch.length} cài đặt chưa lưu: ${ch.slice(0, 3).map((f) => f.label).join(", ")}${ch.length > 3 ? "…" : ""}` : "Chưa có thay đổi.";
    $("#stSave", body).disabled = !ch.length; $("#stUndo", body).disabled = !ch.length;
  };
  body.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset.k) {
      const f = d.schema.find((x) => x.key === el.dataset.k);
      cur[f.key] = f.type === "bool" ? el.checked : f.type === "number" ? Number(el.value) : el.value;
      if (f.type === "bool") el.parentElement.querySelector("span").textContent = el.checked ? "Đang bật" : "Đang tắt";
      if (f.key === "brandColor") { body.querySelector("[data-sw]").style.background = (d.brandColors[el.value] || [])[1]; document.documentElement.style.setProperty("--brand", d.brandColors[el.value][1]); document.documentElement.style.setProperty("--brand-deep", d.brandColors[el.value][2]); }
    }
    const mul = el.closest("[data-multi]");
    if (mul) cur[mul.dataset.multi] = [...mul.querySelectorAll("input:checked")].map((x) => x.value);
    paint();
  }, { signal: stAc.signal });
  body.querySelectorAll("[data-jump]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); $(`#st-${a.dataset.jump}`, body).scrollIntoView({ behavior: "smooth", block: "start" }); }));
  $("#stUndo", body).addEventListener("click", () => { settingsPage(body, ctx); window.dispatchEvent(new Event("pl:brand-reset")); });
  $("#stSave", body).addEventListener("click", async () => {
    const btn = $("#stSave", body); btn.disabled = true;
    try {
      await api("/api/admin/settings", "PUT", { values: cur });
      Object.assign(saved, JSON.parse(JSON.stringify(cur)));
      paint();
      toast("Đã lưu cài đặt. Thay đổi có hiệu lực ngay cho mọi người.", "ok");
      window.dispatchEvent(new Event("pl:config-changed"));
    } catch (e) { toast(e.message, "err", 6000); btn.disabled = false; }
  });
  $("#stReset", body).addEventListener("click", async () => {
    if (!(await confirmBox("Khôi phục cài đặt mặc định?", "Mọi cài đặt trong trang này quay về như lúc mới cài. Tài khoản, điểm, bài tập và lịch thi không bị ảnh hưởng.", "Khôi phục", true))) return;
    try { await api("/api/admin/settings/reset", "POST", {}); toast("Đã khôi phục mặc định.", "ok"); window.dispatchEvent(new Event("pl:config-changed")); settingsPage(body, ctx); } catch (e) { toast(e.message, "err"); }
  });
  const guard = (e) => { if (!body.isConnected) return; if (changed().length) { e.preventDefault(); e.returnValue = ""; } };
  window.addEventListener("beforeunload", guard, { signal: stAc.signal });
  window.addEventListener("popstate", () => stAc.abort(), { once: true, signal: stAc.signal });
}

/* ---------- 2.2: Data and backups ---------- */

// Tổng quan quản trị: số liệu tài khoản và học viên (bài tập/bài thi đã gỡ khỏi hệ thống)
function overview(body) {
  const st = DATA.students.filter((s) => s.role === "student");
  const now = Date.now();
  const active7 = st.filter((s) => s.lastActive && now - new Date(s.lastActive).getTime() < 7 * 86400000).length;
  const days = [];
  for (let i = 13; i >= 0; i--) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i); days.push(d); }
  const perDay = days.map((d) => st.filter((s) => { const t = new Date(s.createdAt); return t >= d && t < new Date(d.getTime() + 86400000); }).length);
  const mx = Math.max(1, ...perDay);
  const us = DATA.userStats || { total: 0, online: 0, byRole: {} };
  body.innerHTML = `
    <div class="kpis">
      <div class="kpi"><b>${fmtN(us.total)}</b><span>Tài khoản</span></div>
      <div class="kpi"><b>${fmtN(st.length)}</b><span>Học viên</span></div>
      <div class="kpi"><b>${fmtN(active7)}</b><span>Học viên hoạt động 7 ngày</span></div>
      <div class="kpi"><b>${fmtN(us.online)}</b><span>Đang đăng nhập</span></div>
    </div>
    <section class="sheet sheet-pad">
      <div class="sec-head"><div><h2>Học viên mới 14 ngày qua</h2><p>Mỗi cột là một ngày, tính theo giờ trên máy bạn.</p></div></div>
      <div class="bar-chart">${perDay.map((v, i) => `<div style="height:${Math.max(2, v / mx * 100)}%" title="${days[i].toLocaleDateString("vi-VN")}: ${v} học viên mới"></div>`).join("")}</div>
      <div class="bar-axis"><span>${days[0].toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}</span><span>Hôm nay</span></div>
    </section>`;
}

// Hồ sơ học viên: thông tin tài khoản và đặt lại mật khẩu
async function studentDetail(body, uid, ctx) {
  body.innerHTML = `<div class="skel" style="height:260px"></div>`;
  let j;
  try { j = await api(`/api/admin/users/${uid}`); } catch (e) { body.innerHTML = `<div class="sheet empty"><b>Không mở được hồ sơ</b>${esc(e.message)}</div>`; return; }
  if (!ctx.isCurrent()) return;
  const u = j.user;
  body.innerHTML = `
    <div class="row" style="margin-bottom:16px"><a class="btn btn-sm" href="/app/quan-tri/hoc-vien">${icon("left")}Danh sách học viên</a></div>
    <section class="sheet sheet-pad" style="margin-bottom:16px"><div class="row" style="gap:16px">${avatar(u.displayName, u.username)}
      <div style="flex:1"><h2>${esc(u.displayName)}</h2><p class="muted">@${esc(u.username)} · đăng ký ${fmtDate(u.createdAt, false)}</p></div>
      ${u.role === "student" ? `<button class="btn" id="rp">${icon("key")}Đặt lại mật khẩu</button>` : ""}</div></section>
    <div class="two-col">
      <section class="sheet sheet-pad"><h2>Gói và lớp</h2><p class="small muted" style="margin-top:4px">Vai trò: ${esc(u.role)} · Trạng thái: ${u.disabled ? "Đã khóa" : "Đang hoạt động"}</p></section>
    </div>`;
  body.querySelector("#rp")?.addEventListener("click", () => resetPw(u));
}

// Dữ liệu và sao lưu: bản sao lưu cơ sở dữ liệu và thông tin hệ thống
async function dataPage(body) {
  let i = {};
  try { i = await api("/api/admin/dbinfo"); } catch (e) {}
  const mb = (n) => (n / 1048576).toFixed(n > 1048576 * 10 ? 0 : 2) + " MB";
  body.innerHTML = `
    <div class="kpis">
      <div class="kpi"><b>${fmtN(i.users)}</b><span>Tài khoản</span></div>
      <div class="kpi"><b>${mb(i.size || 0)}</b><span>Dung lượng dữ liệu</span></div>
    </div>
    <div class="two-col">
      <section class="sheet sheet-pad">
        <h2>Sao lưu</h2>
        <p class="small muted" style="margin-top:4px">Tải về một bản sao đầy đủ của cơ sở dữ liệu (tài khoản, lớp học, cài đặt). Nên tải mỗi tuần và trước mỗi lần cập nhật.</p>
        <div class="row" style="margin-top:14px"><a class="btn btn-primary" href="/api/admin/backup" download>${icon("download")}Tải bản sao lưu (.db)</a></div>
        <h3 style="margin-top:22px">Khôi phục từ bản sao lưu</h3>
        <p class="small muted" style="margin-top:4px">Vì lý do an toàn, khôi phục chỉ làm trên VPS: dừng app, chép file sao lưu đè lên <code class="ic">data/app.db</code>, chạy lại.</p>
      </section>
      <section class="sheet sheet-pad">
        <h2>Hệ thống</h2>
        <dl class="exam-meta"><div><dt>Phiên bản</dt><dd>${esc(i.version || "")}</dd></div><div><dt>Node.js</dt><dd>${esc(i.node || "")}</dd></div><div><dt>Phiên đăng nhập đang lưu</dt><dd>${fmtN(i.sessions)}</dd></div></dl>
      </section>
    </div>`;
}

// Góp ý & Đánh giá sao của học viên
async function feedbackAdminPage(body, ctx) {
  body.innerHTML = `<div class="skel" style="height:260px"></div>`;
  let data;
  try {
    data = await api("/api/feedback");
  } catch (e) {
    body.innerHTML = `<div class="sheet empty"><b>Không tải được góp ý &amp; đánh giá</b>${esc(e.message)}</div>`;
    return;
  }
  if (!ctx.isCurrent()) return;

  const STATUS_META = {
    new: { label: "Đã nhận", tag: "tag-cam" },
    reviewing: { label: "Đang xem xét", tag: "tag-tim" },
    planned: { label: "Đã lên kế hoạch", tag: "tag-tim" },
    done: { label: "Đã hoàn thành", tag: "tag-la" },
    declined: { label: "Chưa thực hiện", tag: "tag-do" },
  };
  const KIND_LABEL = { feature: "Tính năng", bug: "Báo lỗi", other: "Khác" };
  const items = Array.isArray(data.items) ? data.items : [];
  const ratings = Array.isArray(data.ratings) ? data.ratings : [];
  const ratingSummary = data.ratingSummary || { count: ratings.length, average: 0, byStars: {} };
  const initialCounts = () => {
    const c = { new: 0, reviewing: 0, planned: 0, done: 0, declined: 0, total: items.length };
    for (const x of items) if (c[x.status] !== undefined) c[x.status]++;
    return c;
  };
  const counts = data.counts ? {
    new: Number(data.counts.new) || 0,
    reviewing: Number(data.counts.reviewing) || 0,
    planned: Number(data.counts.planned) || 0,
    done: Number(data.counts.done) || 0,
    declined: Number(data.counts.declined) || 0,
    total: Number(data.counts.total) || items.length,
  } : initialCounts();
  let subTab = "feedback";
  let fStatus = "all";
  let fKind = "all";
  let fQ = "";
  let rStar = "all";

  const renderStatsHtml = () => {
    const pendingN = (counts.new || 0) + (counts.reviewing || 0);
    const activeN = (counts.planned || 0) + (counts.done || 0);
    const totalR = Number(ratingSummary.count) || 0;
    return `
      <div><b>${fmtN(counts.total || items.length)}</b><span>Tổng góp ý</span></div>
      <div><b>${fmtN(pendingN)}</b><span>Chờ xử lý</span></div>
      <div><b>${fmtN(activeN)}</b><span>Lên kế hoạch / xong</span></div>
      <div><b>${ratingSummary.average || 0}/5 ★</b><span>${fmtN(totalR)} lượt đánh giá</span></div>`;
  };

  const renderFeedbackBody = () => {
    const box = body.querySelector("#fbBody");
    if (!box) return;
    const filteredFb = items.filter((x) => {
      if (fStatus !== "all" && x.status !== fStatus) return false;
      if (fKind !== "all" && x.kind !== fKind) return false;
      if (fQ) {
        const needle = fQ.toLowerCase();
        const hay = `${x.subject || ""} ${x.body || ""} ${x.username || ""} ${x.displayName || ""} ${x.page || ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    box.innerHTML = filteredFb.length ? `
      <div class="table-wrap" style="border:0">
        <table>
          <thead>
            <tr>
              <th>Người gửi</th>
              <th>Loại</th>
              <th>Nội dung</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${filteredFb.map((x) => {
              const sm = STATUS_META[x.status] || { label: x.status, tag: "tag-tim" };
              const sender = x.displayName ? `${esc(x.displayName)} <small class="muted">@${esc(x.username || "")}</small>` : `@${esc(x.username || "?")}`;
              return `<tr>
                <td>${sender}</td>
                <td><span class="tag">${esc(KIND_LABEL[x.kind] || x.kind)}</span></td>
                <td style="min-width:260px">
                  ${x.subject ? `<b>${esc(x.subject)}</b><br>` : ""}
                  <span>${esc(x.body || "")}</span>
                  ${x.page ? `<br><small class="muted">Trang: <code>${esc(x.page)}</code></small>` : ""}
                </td>
                <td><span title="${esc(fmtDate(x.created_at))}">${esc(timeAgo(x.created_at))}</span></td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                    <span class="tag ${sm.tag}">${esc(sm.label)}</span>
                    <select class="select" data-fb-id="${esc(x.id)}" aria-label="Cập nhật trạng thái góp ý">
                      ${Object.entries(STATUS_META).map(([k, m]) => `<option value="${k}" ${x.status === k ? "selected" : ""}>${esc(m.label)}</option>`).join("")}
                    </select>
                  </div>
                </td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    ` : `<div class="empty"><b>Không có góp ý phù hợp</b>Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</div>`;

    box.querySelectorAll("[data-fb-id]").forEach((sel) => sel.addEventListener("change", async () => {
      const id = sel.dataset.fbId;
      const nextStatus = sel.value;
      const prevItem = items.find((x) => x.id === id);
      const prevStatus = prevItem ? prevItem.status : "";
      sel.disabled = true;
      try {
        const res = await api(`/api/feedback/${encodeURIComponent(id)}`, "PATCH", { status: nextStatus });
        const applied = res.status || nextStatus;
        if (prevItem) prevItem.status = applied;
        if (prevStatus && prevStatus !== applied) {
          if (counts[prevStatus] !== undefined) counts[prevStatus] = Math.max(0, (counts[prevStatus] || 0) - 1);
          if (counts[applied] !== undefined) counts[applied] = (counts[applied] || 0) + 1;
        }
        const statsEl = body.querySelector("#fbStats");
        if (statsEl) statsEl.innerHTML = renderStatsHtml();
        const statusSel = body.querySelector("#fbStatus");
        if (statusSel) {
          for (const [k, m] of Object.entries(STATUS_META)) {
            const opt = statusSel.querySelector(`option[value="${k}"]`);
            if (opt) opt.textContent = `${m.label} (${fmtN(counts[k] || 0)})`;
          }
        }
        toast(res.changed ? "Đã cập nhật trạng thái và gửi thông báo cho học viên." : "Trạng thái không thay đổi.", "ok");
        renderFeedbackBody();
      } catch (err) {
        sel.value = prevStatus;
        sel.disabled = false;
        toast(err.message || "Không cập nhật được trạng thái.", "err");
      }
    }));
  };

  const draw = () => {
    const filteredRatings = ratings.filter((r) => rStar === "all" || Number(r.stars) === Number(rStar));
    const byStars = ratingSummary.byStars || {};
    const totalR = Number(ratingSummary.count) || 0;

    body.innerHTML = `
      <div class="stats biz-stats" id="fbStats" style="margin-bottom:14px">${renderStatsHtml()}</div>
      <div class="tabs" style="margin-bottom:14px">
        <button type="button" class="${subTab === "feedback" ? "on" : ""}" data-fb-tab="feedback">Góp ý học viên (${fmtN(counts.total || items.length)})</button>
        <button type="button" class="${subTab === "ratings" ? "on" : ""}" data-fb-tab="ratings">Đánh giá sao (${fmtN(totalR || ratings.length)})</button>
      </div>
      ${subTab === "feedback" ? `
        <section class="sheet sheet-pad">
          <div class="toolbar" style="margin-bottom:12px;gap:8px;flex-wrap:wrap">
            <input class="input" id="fbSearch" type="search" placeholder="Tìm tiêu đề, nội dung, người gửi..." value="${esc(fQ)}" style="min-width:220px;flex:1">
            <select class="select" id="fbStatus">
              <option value="all" ${fStatus === "all" ? "selected" : ""}>Tất cả trạng thái</option>
              ${Object.entries(STATUS_META).map(([k, m]) => `<option value="${k}" ${fStatus === k ? "selected" : ""}>${esc(m.label)} (${fmtN(counts[k] || 0)})</option>`).join("")}
            </select>
            <select class="select" id="fbKind">
              <option value="all" ${fKind === "all" ? "selected" : ""}>Tất cả loại</option>
              ${Object.entries(KIND_LABEL).map(([k, lbl]) => `<option value="${k}" ${fKind === k ? "selected" : ""}>${esc(lbl)}</option>`).join("")}
            </select>
          </div>
          <div id="fbBody"></div>
        </section>
      ` : `
        <section class="sheet sheet-pad">
          <div class="row" style="gap:16px;align-items:center;margin-bottom:14px;flex-wrap:wrap">
            <div>
              <h2 style="margin:0">${ratingSummary.average || 0} / 5 ★</h2>
              <p class="small muted" style="margin:2px 0 0">${fmtN(totalR)} đánh giá từ học viên</p>
            </div>
            <div class="chips" style="flex:1">
              <button type="button" class="chip ${rStar === "all" ? "on" : ""}" data-r-star="all">Tất cả (${fmtN(totalR)})</button>
              ${[5, 4, 3, 2, 1].map((st) => `<button type="button" class="chip ${String(rStar) === String(st) ? "on" : ""}" data-r-star="${st}">${st} ★ (${fmtN(byStars[st] || 0)})</button>`).join("")}
            </div>
          </div>
          ${filteredRatings.length ? `
            <div class="table-wrap" style="border:0">
              <table>
                <thead><tr><th>Học viên</th><th>Số sao</th><th>Nhận xét</th><th>Cập nhật</th></tr></thead>
                <tbody>
                  ${filteredRatings.map((r) => `<tr>
                    <td>${r.displayName ? `${esc(r.displayName)} <small class="muted">@${esc(r.username || "")}</small>` : `@${esc(r.username || "?")}`}</td>
                    <td><b>${"★".repeat(Math.max(1, Math.min(5, Number(r.stars) || 0)))}</b> <small class="muted">(${Number(r.stars) || 0}/5)</small></td>
                    <td>${r.comment ? esc(r.comment) : `<span class="muted">(Không có nhận xét)</span>`}</td>
                    <td><span title="${esc(fmtDate(r.updatedAt))}">${esc(timeAgo(r.updatedAt))}</span></td>
                  </tr>`).join("")}
                </tbody>
              </table>
            </div>
          ` : `<div class="empty"><b>Chưa có đánh giá nào</b>Khi học viên đánh giá sao trong mục Hồ sơ, danh sách sẽ hiện tại đây.</div>`}
        </section>
      `}`;

    body.querySelectorAll("[data-fb-tab]").forEach((btn) => btn.addEventListener("click", () => {
      subTab = btn.dataset.fbTab;
      draw();
    }));
    if (subTab === "feedback") {
      body.querySelector("#fbStatus")?.addEventListener("change", (e) => { fStatus = e.target.value; renderFeedbackBody(); });
      body.querySelector("#fbKind")?.addEventListener("change", (e) => { fKind = e.target.value; renderFeedbackBody(); });
      body.querySelector("#fbSearch")?.addEventListener("input", (e) => { fQ = e.target.value; renderFeedbackBody(); });
      renderFeedbackBody();
    } else {
      body.querySelectorAll("[data-r-star]").forEach((btn) => btn.addEventListener("click", () => {
        rStar = btn.dataset.rStar;
        draw();
      }));
    }
  };

  draw();
}
