/* LifeRivo 4.0 — Admin: system-wide classrooms (assign teachers) and Teacher licenses (issue, revoke). */
import {  } from "./core.js";
import { api, esc, lineIcon as icon, fmtDate, toast, promptBox, openModal, $ } from "./core.js";

export async function lmsAdminPage(body) {
  body.innerHTML = `<div class="skel" style="height:260px"></div>`;
  let cl, li;
  try { [cl, li] = await Promise.all([api("/api/admin/classes"), api("/api/admin/licenses")]); }
  catch (e) { body.innerHTML = `<div class="sheet empty"><b>Không tải được</b>${esc(e.message)}</div>`; return; }
  const LST = { active: ["Còn hạn", "tag-la"], expired: ["Hết hạn", "tag-line"], revoked: ["Đã thu hồi", "tag-do"] };
  const CST = { active: ["Đang mở", "tag-la"], closed: ["Đã đóng", "tag-line"], archived: ["Lưu trữ", "tag-line"] };
  body.innerHTML = `
    <section class="sheet sheet-pad" style="margin-bottom:16px">
      <div class="sec-head"><div><h2>Giấy phép Teacher</h2><p>Giấy phép mua qua đơn hàng được cấp tự động. Cấp tay cho trường học/hợp đồng báo giá riêng (gói School).</p></div><button class="btn btn-primary btn-sm" id="grant">${icon("plus")}Cấp giấy phép</button></div>
      ${li.licenses.length ? `<div class="table-wrap" style="border:0"><table><thead><tr><th>Giáo viên</th><th>Mức</th><th class="num">Chỗ đã dùng</th><th>Hiệu lực</th><th>Nguồn</th><th>Trạng thái</th><th></th></tr></thead><tbody>
        ${li.licenses.map((l) => `<tr><td><b>${esc(l.displayName)}</b><br><span class="small muted">@${esc(l.username)}</span></td><td>${esc(l.tier)}</td><td class="num">${l.used}/${l.seats}</td><td class="small">${fmtDate(l.startsAt, false)} → ${fmtDate(l.expiresAt, false)}</td><td class="small">${l.source === "admin" ? "Cấp tay" : "Đơn hàng"}${l.note ? `<br><span class="muted">${esc(l.note)}</span>` : ""}</td><td><span class="tag ${LST[l.status][1]}">${LST[l.status][0]}</span></td>
          <td>${l.status === "active" ? `<button class="btn btn-xs btn-ghost" data-revoke="${l.id}" data-n="${esc(l.username)}">Thu hồi</button>` : ""}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Chưa có giấy phép nào.</p>`}
    </section>
    <section class="sheet sheet-pad">
      <div class="sec-head"><div><h2>Tất cả lớp học</h2><p>Quản trị viên xem và quản lý mọi lớp, phân công lại giáo viên phụ trách.</p></div><button class="btn btn-sm" id="newClass">${icon("plus")}Tạo lớp cho giáo viên</button></div>
      ${cl.classes.length ? `<div class="table-wrap" style="border:0"><table><thead><tr><th>Lớp</th><th>Giáo viên</th><th class="num">Học sinh</th><th>Mã</th><th>Trạng thái</th><th></th></tr></thead><tbody>
        ${cl.classes.map((c) => `<tr><td><a href="/app/giao-vien/lop/${c.id}"><b>${esc(c.name)}</b></a><br><span class="small muted">tạo ${fmtDate(c.createdAt, false)}</span></td><td>${esc(c.teacherName)}<br><span class="small muted">@${esc(c.teacherUsername)}</span></td><td class="num">${c.members}</td><td><code>${esc(c.joinCode)}</code></td><td><span class="tag ${CST[c.status][1]}">${CST[c.status][0]}</span></td>
          <td>${c.status !== "archived" ? `<button class="btn btn-xs" data-assign="${c.id}" data-teacher="${c.teacherId}">Đổi giáo viên</button>` : ""}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Chưa có lớp nào.</p>`}
    </section>`;
  const teacherOpts = (sel) => cl.teachers.map((t) => `<option value="${t.id}" ${t.id === sel ? "selected" : ""}>${esc(t.displayName)} (@${esc(t.username)}) · ${t.role === "admin" ? "quản trị" : "giáo viên"}</option>`).join("");
  $("#grant", body).addEventListener("click", () => {
    const m = openModal(`<h2>Cấp giấy phép Teacher</h2><form class="auth-form" data-f>
      <label class="field">Tên đăng nhập của giáo viên<input name="u" required autocomplete="off"><small>Tài khoản học viên/phụ huynh sẽ tự thành giáo viên.</small></label>
      <div class="grid-2"><label class="field">Số chỗ học sinh<input name="seats" type="number" min="1" max="5000" value="30" required></label><label class="field">Số tháng<input name="months" type="number" min="1" max="36" value="12" required></label></div>
      <label class="field">Lý do / số hợp đồng<input name="note" required minlength="3" maxlength="300" placeholder="Ví dụ: HĐ 12/2026 Trường THPT A"></label>
      <p class="form-msg err" data-m></p><div class="modal-actions"><button type="button" class="btn" data-close>Hủy</button><button class="btn btn-primary">Cấp giấy phép</button></div></form>`);
    m.el.querySelector("[data-f]").addEventListener("submit", async (e) => {
      e.preventDefault(); const f = e.target;
      try { await api("/api/admin/licenses", "POST", { username: f.u.value.trim(), seats: Number(f.seats.value), months: Number(f.months.value), note: f.note.value }); m.close(); toast("Đã cấp giấy phép.", "ok"); lmsAdminPage(body); }
      catch (err) { m.el.querySelector("[data-m]").textContent = err.message; }
    });
  });
  $("#newClass", body).addEventListener("click", () => {
    const m = openModal(`<h2>Tạo lớp cho giáo viên</h2><form class="auth-form" data-f><label class="field">Tên lớp<input name="name" required maxlength="80"></label><label class="field">Giáo viên phụ trách<select name="t">${teacherOpts()}</select></label>
      <p class="form-msg err" data-m></p><div class="modal-actions"><button type="button" class="btn" data-close>Hủy</button><button class="btn btn-primary">Tạo lớp</button></div></form>`);
    m.el.querySelector("[data-f]").addEventListener("submit", async (e) => {
      e.preventDefault();
      try { await api("/api/classes", "POST", { name: e.target.name.value, teacherId: Number(e.target.t.value) }); m.close(); toast("Đã tạo lớp.", "ok"); lmsAdminPage(body); }
      catch (err) { m.el.querySelector("[data-m]").textContent = err.message; }
    });
  });
  body.querySelectorAll("[data-assign]").forEach((b) => b.addEventListener("click", () => {
    const m = openModal(`<h2>Đổi giáo viên phụ trách</h2><form class="auth-form" data-f><label class="field">Giáo viên<select name="t">${teacherOpts(Number(b.dataset.teacher))}</select><small>Học sinh giữ chỗ theo giấy phép của giáo viên mới khi tham gia hoặc được duyệt sau này.</small></label>
      <p class="form-msg err" data-m></p><div class="modal-actions"><button type="button" class="btn" data-close>Hủy</button><button class="btn btn-primary">Lưu</button></div></form>`);
    m.el.querySelector("[data-f]").addEventListener("submit", async (e) => {
      e.preventDefault();
      try { await api(`/api/classes/${b.dataset.assign}`, "PUT", { teacherId: Number(e.target.t.value) }); m.close(); toast("Đã phân công.", "ok"); lmsAdminPage(body); }
      catch (err) { m.el.querySelector("[data-m]").textContent = err.message; }
    });
  }));
  body.querySelectorAll("[data-revoke]").forEach((b) => b.addEventListener("click", async () => {
    const note = await promptBox(`Thu hồi giấy phép của @${b.dataset.n}?`, "Giáo viên không tạo lớp mới được; học sinh trong lớp mất quyền Pro từ giấy phép này (Pro cá nhân/Family giữ nguyên). Ghi lý do:", { label: "Lý do", okLabel: "Thu hồi", validate: (v) => (v.trim().length >= 3 ? "" : "Ít nhất 3 ký tự") });
    if (!note) return;
    try { await api(`/api/admin/licenses/${b.dataset.revoke}/revoke`, "POST", { note }); toast("Đã thu hồi.", "ok"); lmsAdminPage(body); } catch (e) { toast(e.message, "err"); }
  }));
}
