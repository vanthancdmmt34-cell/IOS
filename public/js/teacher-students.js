/* LifeRivo 4.0.1 - Management branches:
   - Teacher: "My students" - students in classes taught + accounts created by the teacher. Create accounts (single / bulk),
     add to class, reset password, lock (only own created accounts), view progress, export CSV.
   - Admin: "Teachers" tab - create teacher accounts with license, view each teacher's classes and students,
     lock / unlock, reset password, grant license, transfer classes + students to another teacher.
   The server enforces permissions on all APIs; the UI only shows buttons the user is allowed to use. */
import {  } from "./core.js";
import { S, api, esc, lineIcon as icon, fmtN, fmtDate, timeAgo, toast, openModal, confirmBox, $ } from "./core.js";

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
function download(name, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
}
// Newly created accounts / new password table: shown ONLY ONCE, with copy and print buttons
function credentialsModal(title, rows, note) {
  const text = rows.map((r) => `${r.displayName || r.username}\t${r.username}\t${r.password || "(mật khẩu bạn đã nhập)"}`).join("\n");
  const m = openModal(`<h2>${esc(title)}</h2>
    <p class="small muted">${esc(note || "Mật khẩu chỉ hiện một lần. Hãy sao chép hoặc in và đưa cho học viên; học viên nên đổi mật khẩu sau khi đăng nhập.")}</p>
    <div class="table-wrap" id="credTbl"><table><thead><tr><th>Họ tên</th><th>Tên đăng nhập</th><th>Mật khẩu</th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td>${esc(r.displayName || "")}</td><td><code>${esc(r.username)}</code></td><td><code>${esc(r.password || "(mật khẩu bạn đã nhập)")}</code></td></tr>`).join("")}</tbody></table></div>
    <div class="modal-actions"><button class="btn" data-copy>${icon("copy")}Sao chép</button><button class="btn" data-print>${icon("print")}In</button><button class="btn btn-primary" data-close>Xong</button></div>`, { cls: "wide" });
  m.el.querySelector("[data-copy]").addEventListener("click", async () => { try { await navigator.clipboard.writeText(text); toast("Đã sao chép.", "ok"); } catch { toast("Trình duyệt chặn sao chép, hãy bôi đen bảng để chép.", "err"); } });
  m.el.querySelector("[data-print]").addEventListener("click", () => {
    const w = window.open("", "_blank", "noopener=no,width=800,height=600"); if (!w) return;
    w.document.write(`<!doctype html><meta charset="utf-8"><title>${esc(title)}</title><style>body{font:14px system-ui;padding:24px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:6px 8px;text-align:left}code{font-size:14px}</style><h2>${esc(title)}</h2>${m.el.querySelector("#credTbl").innerHTML}<script>print()<\/script>`);
    w.document.close();
  });
}

/* =================== TEACHER: MY STUDENTS =================== */
export async function pageMyStudents(main, _p, _q, ctx) {
  ctx.setCrumbs([["Giáo viên", "/app/giao-vien"], ["Học viên của tôi"]]);
  main.innerHTML = `<div class="skel" style="height:300px"></div>`;
  let j;
  try { j = await api("/api/teacher/students"); } catch (e) { main.innerHTML = `<div class="sheet sheet-pad empty"><b>Không mở được</b>${esc(e.message)}</div>`; return; }
  if (!ctx.isCurrent()) return;
  const L = j.license;
  let q = "", cls = "", only = "";
  main.innerHTML = `
    <div class="page-head"><div><h1>Học viên của tôi</h1><p>Theo dõi hoạt động và kết quả của từng học viên.</p></div>
      <div class="row" style="gap:8px">${j.canCreate ? `<button class="btn btn-primary" id="mkStu">${icon("plus")}Tạo tài khoản học viên</button>` : `<a class="btn btn-primary" href="/app/bang-gia?goi=teacher">Mua / gia hạn giấy phép</a>`}<button class="btn" id="csv">${icon("download")}Xuất CSV</button></div></div>
    ${L ? `<div class="pay-warn" style="margin:0 0 14px">${L.licenses.length ? `Giấy phép: đã dùng <b>${L.used}/${L.seats}</b> chỗ. Học viên được thêm vào lớp mới chiếm chỗ; tạo tài khoản không kèm lớp thì chưa chiếm chỗ.` : "Bạn chưa có giấy phép còn hạn: chưa tạo được tài khoản học viên."}</div>` : ""}
    <div class="stats biz-stats">
      <div><b>${fmtN(j.students.length)}</b><span>Học viên</span></div>
      <div><b>${fmtN(j.students.filter((s) => s.managed).length)}</b><span>Tài khoản bạn tạo</span></div>
      <div><b>${fmtN(j.students.filter((s) => s.lastActive && Date.now() - Date.parse(s.lastActive) < 7 * 86400000).length)}</b><span>Học trong 7 ngày</span></div>
      <div><b>${fmtN(j.students.filter((s) => !s.classes.length).length)}</b><span>Chưa vào lớp nào</span></div>
    </div>
    <section class="sheet sheet-pad" style="margin-top:16px">
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <input class="input" id="q" placeholder="🔍 Tìm học viên..." style="flex:1;min-width:200px">
        <select class="input" id="cls" style="max-width:220px"><option value="">Mọi lớp</option><option value="-">Chưa vào lớp</option>${j.classes.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select>
        <select class="input" id="only" style="max-width:200px"><option value="">Mọi tài khoản</option><option value="mine">Do tôi tạo</option><option value="self">Tự đăng ký</option></select>
      </div>
      <div class="table-wrap" style="border:0"><table><thead><tr><th>Học viên</th><th>Lớp</th><th class="num">Bài đã đạt</th><th>Hoạt động gần nhất</th><th>Tài khoản</th><th></th></tr></thead><tbody id="rows"></tbody></table></div>
    </section>`;
  const filtered = () => j.students.filter((s) => {
    if (q && !(s.displayName + " " + s.username).toLowerCase().includes(q)) return false;
    if (cls === "-" && s.classes.length) return false;
    if (cls && cls !== "-" && !s.classes.some((c) => String(c.id) === cls)) return false;
    if (only === "mine" && !s.managed) return false;
    if (only === "self" && s.managed) return false;
    return true;
  });
  const ST = { active: "", pending: " (chờ duyệt)", suspended: " (tạm khóa)" };
  const kits = ["cat", "fox", "bunny", "dragon", "owl", "frog"];
  const draw = () => {
    const rows = filtered();
    $("#rows", main).innerHTML = rows.map((s, idx) => {
      const recent = s.lastActive && Date.now() - Date.parse(s.lastActive) < 3 * 86400000;
      return `<tr>
      <td><div class="tc-m-stu-cell"><img class="tc-m-stu-av" src="/img/kit/chibi-${kits[idx % kits.length]}.webp" alt="" width="40" height="40" loading="lazy" /><div><b>${esc(s.displayName)}</b><br><span class="small muted">@${esc(s.username)}</span></div></div></td>
      <td class="small">${s.classes.map((c) => `<a href="/app/giao-vien/lop/${c.id}">${esc(c.name)}</a>${ST[c.status] || ""}`).join(", ") || `<span class="muted">Chưa vào lớp</span>`}</td>
      <td class="num">${fmtN(s.solved)}</td>
      <td class="small">${s.lastActive ? timeAgo(s.lastActive) : "—"}</td>
      <td>${s.disabled ? `<span class="tag tag-do">Đã khóa</span>` : recent ? `<span class="tag tag-la">Tốt</span>` : `<span class="tag tag-cam">Cần nhắc</span>`}</td>
      <td><select class="input input-sm" data-act="${s.id}" aria-label="Thao tác với ${esc(s.displayName)}"><option value="">Thao tác…</option><option value="view">Xem tiến độ</option>${j.classes.length ? `<option value="add">Thêm vào lớp</option>` : ""}${s.managed ? `<option value="pw">Đặt lại mật khẩu</option><option value="rename">Sửa tên</option><option value="${s.disabled ? "unlock" : "lock"}">${s.disabled ? "Mở khóa" : "Khóa tài khoản"}</option>` : ""}</select></td></tr>`;
    }).join("") || `<tr><td colspan="6" class="muted">${j.students.length ? "Không có học viên khớp bộ lọc." : "Chưa có học viên. Tạo tài khoản hoặc gửi mã lớp cho học sinh."}</td></tr>`;
    main.querySelectorAll("[data-act]").forEach((sel) => sel.addEventListener("change", () => { const v = sel.value; sel.value = ""; act(j.students.find((x) => String(x.id) === sel.dataset.act), v); }));
  };
  const reload = () => pageMyStudents(main, _p, _q, ctx);
  async function act(s, v) {
    if (v === "view") return studentModal(s.id);
    if (v === "add") {
      const m = openModal(`<h2>Thêm ${esc(s.displayName)} vào lớp</h2><form class="auth-form" data-f><label class="field">Lớp<select name="c">${j.classes.filter((c) => c.status === "active" && !s.classes.some((x) => x.id === c.id)).map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select><small>Học viên chiếm một chỗ trong giấy phép (nếu chưa chiếm).</small></label><p class="form-msg err" data-m></p><div class="modal-actions"><button type="button" class="btn" data-close>Hủy</button><button class="btn btn-primary">Thêm</button></div></form>`);
      m.el.querySelector("[data-f]").addEventListener("submit", async (e) => {
        e.preventDefault(); const cid = e.target.c.value; if (!cid) return;
        try { const r = await api(`/api/classes/${cid}/members`, "POST", { usernames: [s.username] }); const x = r.results[0]; if (x.error) throw new Error(x.error); m.close(); toast("Đã thêm vào lớp.", "ok"); reload(); }
        catch (err) { m.el.querySelector("[data-m]").textContent = err.message; }
      });
      return;
    }
    if (v === "pw") {
      if (!(await confirmBox(`Đặt lại mật khẩu cho @${s.username}?`, "Hệ thống tạo mật khẩu mới và đăng xuất học viên khỏi mọi thiết bị.", "Đặt lại"))) return;
      try { const r = await api(`/api/teacher/students/${s.id}/password`, "POST", {}); credentialsModal("Mật khẩu mới", [{ ...s, password: r.password }]); } catch (e) { toast(e.message, "err"); }
      return;
    }
    if (v === "rename") {
      const m = openModal(`<h2>Sửa tên hiển thị</h2><form class="auth-form" data-f><label class="field">Họ tên<input name="n" value="${esc(s.displayName)}" maxlength="40" required></label><p class="form-msg err" data-m></p><div class="modal-actions"><button type="button" class="btn" data-close>Hủy</button><button class="btn btn-primary">Lưu</button></div></form>`);
      m.el.querySelector("[data-f]").addEventListener("submit", async (e) => { e.preventDefault(); try { await api(`/api/teacher/students/${s.id}`, "PUT", { displayName: e.target.n.value }); m.close(); toast("Đã lưu.", "ok"); reload(); } catch (err) { m.el.querySelector("[data-m]").textContent = err.message; } });
      return;
    }
    if (v === "lock" || v === "unlock") {
      if (v === "lock" && !(await confirmBox(`Khóa tài khoản @${s.username}?`, "Học viên bị đăng xuất và không đăng nhập được cho tới khi bạn mở khóa. Bài làm vẫn giữ nguyên.", "Khóa"))) return;
      try { await api(`/api/teacher/students/${s.id}/lock`, "POST", { disabled: v === "lock" }); toast(v === "lock" ? "Đã khóa." : "Đã mở khóa.", "ok"); reload(); } catch (e) { toast(e.message, "err"); }
    }
  }
  let tmr;
  $("#q", main).addEventListener("input", (e) => { clearTimeout(tmr); tmr = setTimeout(() => { q = e.target.value.trim().toLowerCase(); draw(); }, 150); });
  $("#cls", main).addEventListener("change", (e) => { cls = e.target.value; draw(); });
  $("#only", main).addEventListener("change", (e) => { only = e.target.value; draw(); });
  $("#csv", main).addEventListener("click", () => {
    const rows = [["Họ tên", "Tên đăng nhập", "Lớp", "Bài đã đạt", "Hoạt động gần nhất", "Tài khoản"], ...filtered().map((s) => [s.displayName, s.username, s.classes.map((c) => c.name).join("; "), s.solved, s.lastActive || "", s.disabled ? "Đã khóa" : s.managed ? "Do tôi tạo" : "Tự đăng ký"])];
    download("hoc-vien-cua-toi.csv", rows.map((r) => r.map(csvCell).join(",")).join("\r\n"));
  });
  $("#mkStu", main)?.addEventListener("click", () => createStudents(j, reload));
  draw();
}

function createStudents(j, done) {
  const m = openModal(`<h2>Tạo tài khoản học viên</h2>
    <form class="auth-form" data-f>
      <label class="field">Đưa vào lớp<select name="c"><option value="">Không đưa vào lớp (chưa chiếm chỗ giấy phép)</option>${j.classes.filter((c) => c.status === "active").map((c) => `<option value="${c.id}" selected>${esc(c.name)}</option>`).join("")}</select></label>
      <label class="field">Danh sách học viên<textarea name="list" rows="8" required placeholder="Mỗi dòng một học viên: tên đăng nhập, Họ tên, mật khẩu (không bắt buộc)&#10;an.nguyen, Nguyễn Văn An&#10;binh.tran, Trần Thị Bình, matkhau123"></textarea>
        <small>Tối đa 100 dòng. Bỏ trống mật khẩu thì hệ thống tự tạo mật khẩu 8 ký tự. Tên đăng nhập: chữ không dấu, số, dấu _ . -</small></label>
      <p class="form-msg err" data-m></p>
      <div class="modal-actions"><button type="button" class="btn" data-close>Hủy</button><button class="btn btn-primary">Tạo tài khoản</button></div>
    </form>`, { cls: "wide" });
  m.el.querySelector("[data-f]").addEventListener("submit", async (e) => {
    e.preventDefault();
    const accounts = e.target.list.value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => { const [username, displayName, password] = l.split(/[,;\t]/).map((x) => (x || "").trim()); return { username, displayName, password }; });
    if (!accounts.length) return;
    const btn = e.target.querySelector(".btn-primary"); btn.disabled = true;
    try {
      const r = await api("/api/teacher/students", "POST", { classId: e.target.c.value ? Number(e.target.c.value) : null, accounts });
      const okRows = r.results.filter((x) => x.ok), bad = r.results.filter((x) => x.error);
      m.close();
      if (okRows.length) credentialsModal(`Đã tạo ${okRows.length} tài khoản`, okRows, bad.length ? `${bad.length} dòng không tạo được: ${bad.map((x) => `${x.username || "(trống)"}: ${x.error}`).join(" · ")}. Mật khẩu chỉ hiện một lần.` : "");
      else toast("Không tạo được tài khoản nào: " + bad.map((x) => `${x.username || "(trống)"}: ${x.error}`).join(" · "), "err", 8000);
      done();
    } catch (err) { m.el.querySelector("[data-m]").textContent = err.message; btn.disabled = false; }
  });
}

async function studentModal(id) {
  let s;
  try { s = (await api(`/api/teacher/students/${id}`)).student; } catch (e) { return toast(e.message, "err"); }
  openModal(`<h2>${esc(s.displayName)} <span class="small muted">@${esc(s.username)}</span></h2>
    <div class="stats biz-stats" style="margin:8px 0 12px"><div><b>${fmtN(s.xp)}</b><span>Điểm tích lũy</span></div><div><b>${fmtN(s.solved)}</b><span>Bài đã đạt</span></div><div><b>${fmtN(s.lessonsDone)}</b><span>Bài học hoàn thành</span></div><div><b>${s.lastActive ? timeAgo(s.lastActive) : "—"}</b><span>Hoạt động gần nhất</span></div></div>
    <p class="small"><b>Lớp:</b> ${s.classes.map((c) => `<a href="/app/giao-vien/lop/${c.id}" data-close>${esc(c.name)}</a>`).join(", ") || "chưa vào lớp"}</p>
    <h3 style="margin-top:12px">Bài được giao</h3>
    ${s.assignments.length ? `<div class="table-wrap"><table><thead><tr><th>Bài</th><th>Lớp</th><th>Hạn</th><th>Trạng thái</th><th class="num">Điểm</th></tr></thead><tbody>${s.assignments.map((a) => `<tr><td>${esc(a.title)}</td><td class="small">${esc(a.className || "")}</td><td class="small">${a.dueAt ? fmtDate(a.dueAt) : "—"}</td><td class="small">${a.state.passed ? (a.state.late ? "Đạt (nộp muộn)" : "Đạt") : a.state.attempts ? `Đã nộp ${a.state.attempts} lần` : a.dueAt && Date.parse(a.dueAt) < Date.now() ? "Quá hạn chưa nộp" : "Chưa nộp"}</td><td class="num">${a.state && a.state.score != null ? a.state.score : "—"}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Chưa có bài giao.</p>`}
    <h3 style="margin-top:12px">Bài tập luyện gần đây</h3>
    ${s.recent.length ? `<div class="table-wrap" style="border:0"><table><thead><tr><th>Bài</th><th class="num">Điểm</th><th>Thời gian</th></tr></thead><tbody>${s.recent.map((r) => `<tr><td><code>${esc(r.exerciseId)}</code></td><td class="num">${r.score}/${r.maxScore}</td><td class="small">${timeAgo(r.createdAt)}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Chưa nộp bài luyện nào.</p>`}
    <div class="modal-actions"><button class="btn btn-primary" data-close>Đóng</button></div>`, { cls: "wide" });
}

/* =================== ADMIN: TEACHERS =================== */
export async function teachersAdminPage(body) {
  body.innerHTML = `<div class="skel" style="height:260px"></div>`;
  let j;
  try { j = await api("/api/admin/teachers"); } catch (e) { body.innerHTML = `<div class="sheet empty"><b>Không tải được</b>${esc(e.message)}</div>`; return; }
  const T = j.teachers;
  const now = Date.now();
  const licTag = (t) => !t.seats ? (t.role === "admin" ? `<span class="tag tag-line">Quản trị (không cần giấy phép)</span>` : `<span class="tag tag-do">Chưa có / hết hạn</span>`) : `<span class="tag ${Date.parse(t.licenseExpiresAt) - now < 14 * 86400000 ? "tag-cam" : "tag-la"}">${t.used}/${t.seats} chỗ · đến ${fmtDate(t.licenseExpiresAt, false)}</span>`;
  body.innerHTML = `
    <section class="sheet sheet-pad">
      <div class="sec-head"><div><h2>Giáo viên</h2><p>Mỗi giáo viên tự quản lý học viên và lớp của mình (Trang giáo viên → Học viên của tôi). Ở đây quản trị viên tạo tài khoản giáo viên, cấp giấy phép, xem lớp và học viên của từng người, khóa tài khoản, chuyển lớp khi giáo viên nghỉ.</p></div>
        <button class="btn btn-primary btn-sm" id="mkT">${icon("plus")}Tạo tài khoản giáo viên</button></div>
      <div class="stats biz-stats" style="margin:6px 0 12px">
        <div><b>${fmtN(T.filter((t) => t.role === "teacher").length)}</b><span>Giáo viên</span></div>
        <div><b>${fmtN(T.filter((t) => t.role === "teacher" && t.seats).length)}</b><span>Có giấy phép còn hạn</span></div>
        <div><b>${fmtN(T.reduce((a, t) => a + t.classes, 0))}</b><span>Lớp đang mở</span></div>
        <div><b>${fmtN(T.reduce((a, t) => a + t.students, 0))}</b><span>Học sinh trong lớp</span></div>
      </div>
      <input class="input" id="tq" placeholder="Tìm giáo viên" style="max-width:320px;margin-bottom:10px">
      <div class="table-wrap" style="border:0"><table><thead><tr><th>Giáo viên</th><th>Giấy phép</th><th class="num">Lớp</th><th class="num">Học sinh</th><th class="num">TK đã tạo</th><th>Đăng nhập gần nhất</th><th></th></tr></thead><tbody id="trows"></tbody></table></div>
    </section>`;
  const draw = (q = "") => {
    $("#trows", body).innerHTML = T.filter((t) => !q || (t.displayName + " " + t.username).toLowerCase().includes(q)).map((t) => `<tr>
      <td><b>${esc(t.displayName)}</b>${t.disabled ? ` <span class="tag tag-do">Đã khóa</span>` : ""}<br><span class="small muted">@${esc(t.username)}${t.role === "admin" ? " · quản trị" : ""}</span></td>
      <td>${licTag(t)}</td><td class="num">${t.classes}</td><td class="num">${t.students}</td><td class="num">${t.accounts}</td>
      <td class="small">${t.lastLogin ? timeAgo(t.lastLogin) : "—"}</td>
      <td><select class="input input-sm" data-t="${t.id}" aria-label="Thao tác với ${esc(t.displayName)}"><option value="">Thao tác…</option><option value="view">Xem lớp và học viên</option>${t.role === "teacher" ? `<option value="lic">Cấp / gia hạn giấy phép</option><option value="pw">Đặt lại mật khẩu</option><option value="${t.disabled ? "unlock" : "lock"}">${t.disabled ? "Mở khóa" : "Khóa tài khoản"}</option>` : ""}${t.classes || t.accounts ? `<option value="transfer">Chuyển lớp và học viên sang GV khác</option>` : ""}</select></td></tr>`).join("") || `<tr><td colspan="7" class="muted">Chưa có giáo viên. Vào Quản trị → Tài khoản, chọn người dùng và đổi vai trò thành Giáo viên.</td></tr>`;
    body.querySelectorAll("[data-t]").forEach((sel) => sel.addEventListener("change", () => { const v = sel.value; sel.value = ""; tAct(T.find((x) => String(x.id) === sel.dataset.t), v); }));
  };
  const reload = () => teachersAdminPage(body);
  async function tAct(t, v) {
    if (v === "view") return teacherDetail(t);
    if (v === "lic") {
      const m = openModal(`<h2>Cấp giấy phép cho ${esc(t.displayName)}</h2><form class="auth-form" data-f>
        <div class="grid-2"><label class="field">Số chỗ học sinh<input name="seats" type="number" min="1" max="5000" value="${t.seats || 30}" required></label><label class="field">Số tháng<input name="months" type="number" min="1" max="36" value="12" required></label></div>
        <label class="field">Lý do / số hợp đồng<input name="note" required minlength="3" maxlength="300"></label><small class="muted">Cùng số chỗ với giấy phép đang có thì được cộng nối tiếp thời hạn.</small>
        <p class="form-msg err" data-m></p><div class="modal-actions"><button type="button" class="btn" data-close>Hủy</button><button class="btn btn-primary">Cấp giấy phép</button></div></form>`);
      m.el.querySelector("[data-f]").addEventListener("submit", async (e) => { e.preventDefault(); const f = e.target; try { await api("/api/admin/licenses", "POST", { username: t.username, seats: Number(f.seats.value), months: Number(f.months.value), note: f.note.value }); m.close(); toast("Đã cấp giấy phép.", "ok"); reload(); } catch (err) { m.el.querySelector("[data-m]").textContent = err.message; } });
      return;
    }
    if (v === "pw") {
      const m = openModal(`<h2>Đặt lại mật khẩu @${esc(t.username)}</h2><form class="auth-form" data-f><label class="field">Mật khẩu mới<input name="p" type="text" minlength="6" maxlength="128" required autocomplete="off"></label><p class="form-msg err" data-m></p><div class="modal-actions"><button type="button" class="btn" data-close>Hủy</button><button class="btn btn-primary">Đặt lại</button></div></form>`);
      m.el.querySelector("[data-f]").addEventListener("submit", async (e) => { e.preventDefault(); try { await api(`/api/admin/users/${t.id}/reset-password`, "POST", { newPassword: e.target.p.value }); m.close(); toast("Đã đặt lại mật khẩu.", "ok"); } catch (err) { m.el.querySelector("[data-m]").textContent = err.message; } });
      return;
    }
    if (v === "lock" || v === "unlock") {
      if (v === "lock" && !(await confirmBox(`Khóa tài khoản @${t.username}?`, "Giáo viên bị đăng xuất và không đăng nhập được. Lớp học và học sinh vẫn giữ nguyên; nên chuyển lớp cho giáo viên khác nếu giáo viên nghỉ.", "Khóa"))) return;
      try { await api(`/api/admin/users/${t.id}`, "PUT", { disabled: v === "lock" }); toast(v === "lock" ? "Đã khóa." : "Đã mở khóa.", "ok"); reload(); } catch (e) { toast(e.message, "err"); }
      return;
    }
    if (v === "transfer") {
      const others = T.filter((x) => x.id !== t.id && !x.disabled);
      const m = openModal(`<h2>Chuyển lớp và học viên của ${esc(t.displayName)}</h2><form class="auth-form" data-f>
        <label class="field">Giáo viên nhận<select name="to">${others.map((x) => `<option value="${x.id}">${esc(x.displayName)} (@${esc(x.username)}) · ${x.seats ? `còn ${Math.max(0, x.seats - x.used)} chỗ` : x.role === "admin" ? "quản trị" : "chưa có giấy phép"}</option>`).join("")}</select>
        <small>Chuyển ${t.classes} lớp đang mở, ${t.accounts} tài khoản do giáo viên này tạo. Học sinh chiếm chỗ trong giấy phép giáo viên nhận; không đủ chỗ thì hệ thống từ chối và không đổi gì. Bài làm, điểm giữ nguyên.</small></label>
        <p class="form-msg err" data-m></p><div class="modal-actions"><button type="button" class="btn" data-close>Hủy</button><button class="btn btn-primary">Chuyển</button></div></form>`);
      m.el.querySelector("[data-f]").addEventListener("submit", async (e) => { e.preventDefault(); try { const r = await api(`/api/admin/teachers/${t.id}/transfer`, "POST", { toTeacherId: Number(e.target.to.value) }); m.close(); toast(`Đã chuyển ${r.classes} lớp, ${r.students} học sinh, ${r.accounts} tài khoản.`, "ok"); reload(); } catch (err) { m.el.querySelector("[data-m]").textContent = err.message; } });
    }
  }
  let tmr; $("#tq", body).addEventListener("input", (e) => { clearTimeout(tmr); tmr = setTimeout(() => draw(e.target.value.trim().toLowerCase()), 150); });
  $("#mkT", body).addEventListener("click", () => {
    const m = openModal(`<h2>Tạo tài khoản giáo viên</h2><form class="auth-form" data-f>
      <div class="grid-2"><label class="field">Tên đăng nhập<input name="u" required minlength="3" maxlength="30" autocomplete="off"></label><label class="field">Họ tên<input name="n" maxlength="40"></label></div>
      <label class="field">Mật khẩu<input name="p" type="text" maxlength="128" autocomplete="off" placeholder="Để trống: hệ thống tự tạo"></label>
      <fieldset class="field" style="border:1px solid var(--line);border-radius:10px;padding:10px"><legend class="small">Giấy phép (không bắt buộc)</legend>
        <div class="grid-2"><label class="field">Số chỗ học sinh<input name="seats" type="number" min="0" max="5000" value="30"></label><label class="field">Số tháng<input name="months" type="number" min="0" max="36" value="12"></label></div>
        <label class="field">Lý do / số hợp đồng<input name="note" maxlength="300" placeholder="Ví dụ: HĐ 12/2026 Trường THPT A"></label><small class="muted">Số chỗ = 0 thì chỉ tạo tài khoản; giáo viên cần giấy phép mới tạo được lớp.</small></fieldset>
      <p class="form-msg err" data-m></p><div class="modal-actions"><button type="button" class="btn" data-close>Hủy</button><button class="btn btn-primary">Tạo</button></div></form>`);
    m.el.querySelector("[data-f]").addEventListener("submit", async (e) => {
      e.preventDefault(); const f = e.target;
      try {
        const r = await api("/api/admin/teachers", "POST", { username: f.u.value.trim(), displayName: f.n.value.trim(), password: f.p.value, seats: Number(f.seats.value) || 0, months: Number(f.months.value) || 0, note: f.note.value });
        m.close(); credentialsModal("Đã tạo tài khoản giáo viên", [{ username: f.u.value.trim(), displayName: f.n.value.trim(), password: r.password || f.p.value }], "Gửi thông tin đăng nhập cho giáo viên; nên đổi mật khẩu sau lần đăng nhập đầu."); reload();
      } catch (err) { m.el.querySelector("[data-m]").textContent = err.message; }
    });
  });
  draw();
}

async function teacherDetail(t) {
  let d;
  try { d = await api(`/api/admin/teachers/${t.id}`); } catch (e) { return toast(e.message, "err"); }
  const CST = { active: "Đang mở", closed: "Đã đóng", archived: "Lưu trữ" };
  openModal(`<h2>${esc(t.displayName)} <span class="small muted">@${esc(t.username)}</span></h2>
    <h3 style="margin-top:10px">Lớp (${d.classes.length})</h3>
    ${d.classes.length ? `<ul class="list">${d.classes.map((c) => `<li><a class="list-row" href="/app/giao-vien/lop/${c.id}" data-close><span class="t"><b>${esc(c.name)}</b><span>${CST[c.status] || c.status} · ${c.members} học sinh · mã <code>${esc(c.joinCode)}</code></span></span></a></li>`).join("")}</ul>` : `<p class="muted">Chưa có lớp.</p>`}
    <h3 style="margin-top:12px">Học viên (${d.students.length})</h3>
    ${d.students.length ? `<div class="table-wrap" style="max-height:40vh;overflow:auto"><table><thead><tr><th>Học viên</th><th>Lớp</th><th class="num">Bài đạt</th><th>Hoạt động</th><th>Tài khoản</th></tr></thead><tbody>${d.students.map((s) => `<tr><td>${esc(s.displayName)}<br><span class="small muted">@${esc(s.username)}</span></td><td class="small">${s.classes.map((c) => esc(c.name)).join(", ") || "—"}</td><td class="num">${s.solved}</td><td class="small">${s.lastActive ? timeAgo(s.lastActive) : "—"}</td><td class="small">${s.disabled ? "Đã khóa" : s.managed ? "Do GV tạo" : "Tự đăng ký"}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Chưa có học viên.</p>`}
    <div class="modal-actions"><button class="btn btn-primary" data-close>Đóng</button></div>`, { cls: "wide" });
}
