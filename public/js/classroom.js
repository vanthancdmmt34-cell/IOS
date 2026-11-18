/* LifeRivo 4.0 — Classrooms: students (my classes, assigned exercises, class exams) and teachers
   (overview, class management, members, assignments, exams, grading, reports, Excel/PDF export).
   All permissions are enforced by the server; the UI only hides actions the user cannot perform. */
import { setAppHash } from "./core.js";
import { S, api, esc, icon, fmtN, fmtDate, timeAgo, toast, openModal, confirmBox, promptBox, $, cfg, avatar, aiOn, aiAuto } from "./core.js";
import { openAiInline } from "./pro.js";
import { HeroBanner } from "./chibi-ds.js";

const isMgr = () => S.me && (S.me.role === "teacher" || S.me.role === "admin");
const due = (iso) => (iso ? `${Date.parse(iso) < Date.now() ? "Đã hết hạn" : "Hạn"} ${fmtDate(iso)}` : "Không hạn nộp");
const scoreTag = (st) => st.score != null ? `<span class="stamp sm" title="Điểm">${st.score}</span>` : st.passed ? `<span class="tag tag-la">Đạt</span>` : st.attempts ? `<span class="tag tag-cam">Chưa đạt</span>` : `<span class="tag tag-line">Chưa làm</span>`;
const MEMBER_ST = { active: ["Đang học", "tag-la"], pending: ["Chờ duyệt", "tag-cam"], suspended: ["Tạm khóa", "tag-do"] };
const diag = (errors) => (errors || []).map((e) => `<div class="diag"><b>${e.line ? "Dòng " + e.line : "Kết quả"}</b><div class="msg">${esc(e.message)}</div>${e.fix ? `<div class="fix">${esc(e.fix)}</div>` : ""}</div>`).join("");
const empty = (title, text, action = "") => `<div class="sheet sheet-pad empty"><b>${esc(title)}</b>${esc(text)}${action ? `<div style="margin-top:12px">${action}</div>` : ""}</div>`;

/* =================== STUDENT: MY CLASSES =================== */
export async function pageMyClasses(main, _p, query, ctx) {
  ctx.setCrumbs([["Lớp học", "/app/lop"], ["Lớp của tôi"]]);
  main.innerHTML = `<div class="skel" style="height:240px"></div>`;
  const j = await api("/api/classes");
  if (!ctx.isCurrent()) return;
  const ST = { active: ["Đang học", "tag-la"], pending: ["Chờ giáo viên duyệt", "tag-cam"], suspended: ["Đang bị tạm khóa", "tag-do"] };
  const teaching = Array.isArray(j.teaching) ? j.teaching : [];
  const joined = Array.isArray(j.joined) ? j.joined : [];
  const mgr = isMgr();
  const firstClass = joined[0];
  const teachingCards = teaching.length
    ? `<div class="class-grid">${teaching.map((c) => `<a class="class-card" href="/app/giao-vien/lop/${c.id}"><div class="cl-m-card-top"><span class="lx-ex-pill">${c.status === "active" ? "ĐANG DẠY" : "ĐÃ ĐÓNG"}</span><span class="cl-m-code">${c.joinCode ? `Mã lớp: ${esc(c.joinCode)}` : ""}</span></div><b>${esc(c.name)}</b>${c.joinCode ? `<span class="small muted">Mã lớp: <code>${esc(c.joinCode)}</code></span>` : ""}${c.description ? `<span class="small">${esc(c.description)}</span>` : ""}<span class="tag ${c.status === "active" ? "tag-la" : "tag-line"}" style="margin-top:auto;align-self:flex-start">${c.status === "active" ? "Đang hoạt động" : "Đã đóng"}</span></a>`).join("")}</div>`
    : empty("Chưa có lớp giảng dạy nào", "Tạo lớp mới tại trang Giáo viên để lấy mã lớp gửi học viên.", '<a class="btn btn-primary" href="/app/giao-vien">Về trang Giáo viên</a>');
  const joinedCards = joined.length
    ? `<div class="class-grid">${joined.map((c) => `<a class="class-card" href="/app/lop/${c.id}"><div class="cl-m-card-top"><span class="lx-ex-pill">${c.myStatus === "active" ? "ĐANG THAM GIA" : esc(ST[c.myStatus][0])}</span><span class="cl-m-code">${c.joinCode ? `Mã lớp: ${esc(c.joinCode)}` : ""}</span></div><b>${esc(c.name)}</b><span class="small muted">Giáo viên: ${esc(c.teacherName)}${c.members ? ` · ${c.members} học viên` : ""}</span>${c.description ? `<span class="small">${esc(c.description)}</span>` : ""}<span class="tag ${ST[c.myStatus][1]}" style="margin-top:auto;align-self:flex-start">${ST[c.myStatus][0]}</span>${c.status !== "active" ? `<span class="small muted">Lớp đã đóng</span>` : ""}</a>`).join("")}</div>`
    : empty("Bạn chưa tham gia lớp nào", "Nhập mã lớp ở dưới, hoặc mở liên kết mời giáo viên gửi.");
  const joinFormHtml = `
    <form id="joinF" class="row" style="gap:10px"><label class="field" style="flex:1;min-width:200px;margin:0">Mã lớp<input name="code" maxlength="12" placeholder="Ví dụ: K7M3PQR" autocomplete="off" style="text-transform:uppercase" value="${esc(query.ma || "")}"></label>
      <button class="btn btn-primary" style="align-self:flex-end">${icon("plus")}Tham gia lớp bằng mã</button></form>
    <p class="form-msg err" id="joinMsg"></p>`;
  main.innerHTML = `
    <div class="cl-m-head">
      <h1>Lớp học của bạn</h1>
      <p>${mgr ? "Quản lý lớp đang dạy, bài tập và tiến độ học viên." : "Theo dõi lớp, giáo viên và bài tập được giao."}</p>
    </div>
    <div class="page-head"><div><h1>Lớp của tôi</h1><p>${mgr ? "Danh sách lớp bạn phụ trách giảng dạy." : "Tham gia lớp bằng mã do giáo viên gửi. Học trong lớp có giấy phép của giáo viên thì bạn được dùng quyền Pro trong thời gian học."}</p></div>
      ${mgr ? `<a class="btn" href="/app/giao-vien">${icon("settings")}Trang giáo viên</a>` : ""}</div>
    ${mgr ? `
      <section style="margin-bottom:16px">
        ${joined.length ? `<h2 style="margin:0 0 10px">Lớp tôi đang dạy</h2>` : ""}
        ${teachingCards}
      </section>
      ${joined.length ? `<section style="margin-bottom:16px"><h2 style="margin:0 0 10px">Lớp đang tham gia</h2>${joinedCards}</section>` : ""}
      <div class="cl-m-quick">
        <a class="cl-m-qrow" href="/app/giao-vien/bai-tap"><span class="cl-m-qico">📘</span><div class="cl-m-qcopy"><b>Bài tập và bài kiểm tra</b><span>Giao bài và tạo đề cho lớp</span></div><span class="cl-m-qarr">›</span></a>
        <a class="cl-m-qrow" href="/app/giao-vien/tien-do"><span class="cl-m-qico">📊</span><div class="cl-m-qcopy"><b>Chấm và theo dõi tiến độ</b><span>Xem điểm và học viên cần hỗ trợ</span></div><span class="cl-m-qarr">›</span></a>
        <a class="cl-m-qrow" href="/app/thong-bao"><span class="cl-m-qico">🔔</span><div class="cl-m-qcopy"><b>Thông báo lớp</b><span>Tin nhắn và nhắc nhở</span></div><span class="cl-m-qarr">›</span></a>
      </div>
      <details class="sheet sheet-pad cl-m-join-sec" style="margin-top:14px">
        <summary style="cursor:pointer;font-weight:700">Tham gia lớp khác bằng mã</summary>
        <div style="margin-top:12px">${joinFormHtml}</div>
      </details>
    ` : `
      ${joinedCards}
      <div class="cl-m-quick">
        <a class="cl-m-qrow" href="${firstClass ? `/app/lop/${firstClass.id}` : "/app/ngoai-ngu"}"><span class="cl-m-qico">📘</span><div class="cl-m-qcopy"><b>Bài tập được giao</b><span>${firstClass ? `Xem bài tập lớp ${esc(firstClass.name)}` : "Xem bài tập đang mở"}</span></div><span class="cl-m-qarr">›</span></a>
        <a class="cl-m-qrow" href="/app/thong-bao"><span class="cl-m-qico">🔔</span><div class="cl-m-qcopy"><b>Thông báo lớp</b><span>Tin nhắn và nhắc nhở từ giáo viên</span></div><span class="cl-m-qarr">›</span></a>
      </div>
      <section class="sheet sheet-pad cl-m-join-sec" style="margin-top:14px">
        ${joinFormHtml}
      </section>
    `}`;
  $("#joinF", main)?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = e.target.code.value.trim();
    if (!code) return;
    try { const r = await api("/api/classes/join", "POST", { code }); toast(r.status === "pending" ? `Đã gửi yêu cầu vào lớp ${r.name}. Chờ giáo viên duyệt.` : `Đã vào lớp ${r.name}.`, "ok", 4500); setAppHash(`/app/lop/${r.classId}`) }
    catch (err) { $("#joinMsg", main).textContent = err.message; }
  });
}

export async function pageJoinLink(main, [token], _q, ctx) {
  ctx.setCrumbs([["Tham gia lớp"]]);
  main.innerHTML = `<div class="sheet sheet-pad empty"><span class="spin"></span> Đang tham gia lớp…</div>`;
  try { const r = await api("/api/classes/join", "POST", { token }); toast(r.status === "pending" ? "Đã gửi yêu cầu, chờ giáo viên duyệt." : `Đã vào lớp ${r.name}.`, "ok"); location.replace(`/app/lop/${r.classId}`); }
  catch (e) { main.innerHTML = empty("Không tham gia được", e.message, `<a class="btn" href="/app/lop">Về Lớp của tôi</a>`); }
}

export async function pageClass(main, [id], _q, ctx) {
  ctx.setCrumbs([["Lớp học", "/app/lop"], ["Chi tiết lớp học"]]);
  main.innerHTML = `<div class="skel" style="height:300px"></div>`;
  let j;
  try { j = await api(`/api/classes/${id}`); } catch (e) { main.innerHTML = empty("Không mở được lớp", e.message, `<a class="btn" href="/app/lop">Về Lớp của tôi</a>`); return; }
  if (!ctx.isCurrent()) return;
  if (j.manage) { location.replace(`/app/giao-vien/lop/${id}`); return; }
  ctx.setCrumbs([["Lớp học", "/app/lop"], [j.class.name]]);
  const pend = j.myStatus !== "active";
  const doneAsg = (j.assignments || []).filter((a) => a.mine && (a.mine.passed || a.mine.attempts > 0)).length;
  const totalAsg = (j.assignments || []).length;
  const pctClass = totalAsg ? Math.round((doneAsg / totalAsg) * 100) : 100;
  const heroHtml = HeroBanner({
    badge: j.class.joinCode || "LỚP HỌC",
    title: j.class.name,
    subtitle: `Giáo viên ${j.class.teacherName}${j.class.description ? " · " + j.class.description : ""}`,
    kit: "fox",
    cls: "cl-m-hero",
  });
  main.innerHTML = `
    ${heroHtml}
    <div class="cl-m-kpis">
      <div class="cl-m-kpi"><b>${fmtN(totalAsg)}</b><span>Bài được giao</span></div>
      <div class="cl-m-kpi"><b>${pctClass}%</b><span>Tiến độ lớp</span></div>
    </div>
    <div class="page-head"><div><h1>${esc(j.class.name)}</h1><p>Giáo viên: ${esc(j.class.teacherName)}${j.class.description ? " · " + esc(j.class.description) : ""}</p></div>
      <button class="btn btn-ghost" id="leave">${icon("logout")}Rời lớp</button></div>
    ${pend ? empty(j.myStatus === "pending" ? "Đang chờ giáo viên duyệt" : "Bạn đang bị tạm khóa trong lớp", j.myStatus === "pending" ? "Khi được duyệt, bài được giao sẽ hiện ở đây." : "Liên hệ giáo viên để được mở lại.") : `
    <div class="two-col">
      <section class="sheet sheet-pad"><h2>Bài tập lớp</h2>
        ${j.assignments.length ? `<ul class="list">${j.assignments.map((a) => `<li><a class="list-row" href="/app/bai-giao/${a.id}">${scoreTag(a.mine)}<span class="t"><b>${esc(a.title)}</b><span>${due(a.dueAt)}${a.mine.attempts ? ` · đã nộp ${a.mine.attempts} lần` : ""}${a.mine.feedback ? " · có nhận xét" : ""}${a.status === "closed" ? " · đã đóng" : ""}</span></span>${icon("right")}</a></li>`).join("")}</ul>` : `<p class="muted">Chưa có bài nào.</p>`}
      </section>
      <section class="sheet sheet-pad"><h2>Bài kiểm tra</h2>
        ${j.tests.length ? `<ul class="list">${j.tests.map((t) => `<li><a class="list-row" href="/app/kiem-tra-lop/${t.id}"><span class="ico-box">${icon("clock")}</span><span class="t"><b>${esc(t.title)}</b><span>${t.durationMin} phút · ${t.doing ? "Đang làm" : t.attempts ? `Đã làm ${t.attempts}/${t.maxAttempts} lần${t.best != null ? `, cao nhất ${t.best}/${t.maxScore}` : ""}` : `Chưa làm (${t.maxAttempts} lượt)`}${t.dueAt ? " · " + due(t.dueAt) : ""}</span></span>${icon("right")}</a></li>`).join("")}</ul>` : `<p class="muted">Chưa có bài kiểm tra.</p>`}
      </section>
    </div>`}`;
  $("#leave", main).addEventListener("click", async () => {
    if (!(await confirmBox("Rời lớp này?", "Bạn sẽ không thấy bài được giao nữa. Quyền Pro có từ lớp này (nếu có) sẽ hết; Pro bạn tự mua hoặc từ gói Family vẫn giữ nguyên. Bài đã nộp vẫn được lưu.", "Rời lớp", true))) return;
    try { await api(`/api/classes/${id}/leave`, "POST", {}); toast("Đã rời lớp.", "ok"); setAppHash("/app/lop") } catch (e) { toast(e.message, "err"); }
  });
}

/* =================== ASSIGNED EXERCISES (student workspace / teacher grading) =================== */
function teacherAssignment(main, j, ctx) {
  const a = j.assignment;
  ctx.setCrumbs([["Giáo viên", "/app/giao-vien"], ["Lớp", `/app/giao-vien/lop/${a.classId}?tab=bai-tap`], [a.title]]);
  const byUser = {};
  for (const s of j.submissions) (byUser[s.userId] = byUser[s.userId] || []).push(s);
  main.innerHTML = `
    <div class="page-head"><div><h1>${esc(a.title)}</h1><p>${due(a.dueAt)} · ${a.targetAll ? "Giao cả lớp" : "Giao cho một số học sinh"} · ${a.status === "published" ? "Đang mở" : "Đã đóng"}</p></div>
      <div class="row">
        <button class="btn" id="xlsx">${icon("download")}Xuất điểm Excel</button>
        <button class="btn" id="toggle">${a.status === "published" ? "Đóng bài" : "Mở lại"}</button>
        <button class="btn btn-ghost" id="del">${icon("trash")}Xóa</button>
      </div></div>
    <details class="sheet sheet-pad" style="margin-bottom:14px"><summary><b>Đề bài</b></summary><div class="prompt" style="margin-top:10px">${esc(j.exercise.prompt || "")}</div>${j.exercise.sample ? `<p class="small muted">Đáp án mẫu:</p><pre class="code-view">${esc(j.exercise.sample)}</pre>` : ""}</details>
    <section class="sheet sheet-pad"><h2>Bài nộp (${Object.keys(byUser).length} học sinh)</h2>
      ${Object.keys(byUser).length ? Object.values(byUser).map((subs) => { const s = subs[0]; return `<details class="hist-item"><summary>${avatar(s.displayName, s.username)}<span><b>${esc(s.displayName)}</b><br><span class="small muted">${subs.length} lần · lần cuối ${timeAgo(s.createdAt)}${s.late ? " · muộn" : ""}</span></span><span class="spacer"></span>${s.manualScore != null ? `<span class="stamp sm">${s.manualScore}</span>` : subs.some((x) => x.passed) ? `<span class="tag tag-la">Đã chấm: đạt</span>` : `<span class="tag tag-do">Máy chấm: chưa đạt</span>`}</summary>
        <pre class="code-view">${esc(s.code)}</pre>${s.output ? `<p class="small muted">Kết quả chạy:</p><pre class="out-view">${esc(s.output)}</pre>` : ""}
        <form class="grade-f row" data-sid="${s.id}" style="gap:8px;align-items:flex-end"><label class="field" style="margin:0;width:120px">Điểm (0–10)<input name="score" type="number" min="0" max="10" step="0.5" value="${s.manualScore ?? ""}" placeholder="${s.passed ? "10" : "0"}"></label>
          <label class="field" style="margin:0;flex:1;min-width:200px">Nhận xét<input name="fb" maxlength="3000" value="${esc(s.feedback || "")}" placeholder="Ví dụ: Đúng, nên đặt tên biến rõ nghĩa hơn"></label><button class="btn btn-primary btn-sm">Lưu</button></form></details>`; }).join("") : `<p class="muted">Chưa có học sinh nào nộp.</p>`}
    </section>`;
  main.querySelectorAll(".grade-f").forEach((f) => f.addEventListener("submit", async (e) => {
    e.preventDefault();
    try { await api(`/api/submissions/${f.dataset.sid}/grade`, "POST", { manualScore: f.score.value === "" ? null : Number(f.score.value), feedback: f.fb.value }); toast("Đã lưu điểm và nhận xét.", "ok"); } catch (err) { toast(err.message, "err"); }
  }));
  $("#xlsx", main)?.addEventListener("click", async () => {
    try {
      const res = await fetch(`/api/assignments/${a.id}/grades.xlsx`, { credentials: "same-origin" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Không xuất được file.");
      const url = URL.createObjectURL(await res.blob());
      const name = `diem-${String(a.title || a.id).replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 40)}.xlsx`;
      const link = Object.assign(document.createElement("a"), { href: url, download: name });
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast("Đã tải file điểm.", "ok");
    } catch (e) { toast(e.message, "err"); }
  });
  $("#toggle", main).addEventListener("click", async () => { try { await api(`/api/assignments/${a.id}/${a.status === "published" ? "close" : "reopen"}`, "POST", {}); pageAssignment(main, [a.id], {}, ctx); } catch (e) { toast(e.message, "err"); } });
  $("#del", main).addEventListener("click", async () => { if (!(await confirmBox("Xóa bài giao này?", "Học sinh không còn thấy bài. Bài nộp vẫn lưu trong hệ thống.", "Xóa", true))) return; await api(`/api/assignments/${a.id}`, "DELETE"); setAppHash(`/app/giao-vien/lop/${a.classId}?tab=bai-tap`) });
}

/* =================== CLASS EXAMS =================== */
export async function pageClassTest(main, [id], _q, ctx) {
  ctx.setCrumbs([["Lớp học", "/app/lop"], ["Kiểm tra lớp học"]]);
  main.innerHTML = `<div class="skel" style="height:300px"></div>`;
  let j;
  try { j = await api(`/api/tests/${id}`); } catch (e) { main.innerHTML = empty("Không mở được bài kiểm tra", e.message); return; }
  if (!ctx.isCurrent()) return;
  const t = j.test;
  if (j.manage) {
    ctx.setCrumbs([["Giáo viên", "/app/giao-vien"], ["Lớp", `/app/giao-vien/lop/${t.classId}?tab=kiem-tra`], [t.title]]);
    main.innerHTML = `<div class="page-head"><div><h1>${esc(t.title)}</h1><p>${t.durationMin} phút · ${t.maxAttempts} lượt · ${t.shuffle ? "trộn câu" : "không trộn"}${t.dueAt ? " · " + due(t.dueAt) : ""}</p></div>
      <div class="row"><button class="btn" id="toggle">${t.status === "published" ? "Đóng bài" : "Mở lại"}</button><button class="btn btn-ghost" id="del">${icon("trash")}Xóa</button></div></div>
      <div class="two-col"><section class="sheet sheet-pad"><h2>Câu hỏi (${j.questions.length})</h2><ol class="walk">${j.questions.map((q) => `<li><b>${q.points} điểm</b> · ${q.type === "mcq" ? `${esc(q.q)}<br><span class="small muted">Đáp án: ${esc(q.options[q.answer])}</span>` : `Câu tự luận: ${esc(q.title)}`}</li>`).join("")}</ol></section>
      <section class="sheet sheet-pad"><h2>Lượt làm bài</h2>${j.attempts.length ? `<div class="table-wrap" style="border:0"><table><thead><tr><th>Học sinh</th><th>Nộp lúc</th><th class="num">Điểm</th></tr></thead><tbody>${j.attempts.map((x) => `<tr><td>${esc(x.displayName)}</td><td>${x.submittedAt ? fmtDate(x.submittedAt) : "Đang làm"}${x.status === "late" ? " (muộn)" : ""}</td><td class="num">${x.score != null ? `${x.score}/${x.maxScore}` : ""}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Chưa có ai làm.</p>`}</section></div>`;
    $("#toggle", main).addEventListener("click", async () => { await api(`/api/tests/${t.id}/${t.status === "published" ? "close" : "reopen"}`, "POST", {}); pageClassTest(main, [id], {}, ctx); });
    $("#del", main).addEventListener("click", async () => { if (!(await confirmBox("Xóa bài kiểm tra?", "Học sinh không còn thấy bài. Kết quả đã làm vẫn lưu.", "Xóa", true))) return; await api(`/api/tests/${t.id}`, "DELETE"); setAppHash(`/app/giao-vien/lop/${t.classId}?tab=kiem-tra`) });
    return;
  }
  ctx.setCrumbs([["Lớp học", "/app/lop"], ["Kiểm tra lớp học"]]);
  const used = j.attempts.length, doing = j.attempts.find((x) => x.status === "doing" && Date.parse(x.endsAt) > Date.now());
  main.innerHTML = `<div class="cl-test-intro" style="max-width:720px">
    <span class="lx-ex-pill">BÀI KIỂM TRA</span>
    <h1>${esc(t.title)}</h1>
    <p class="lead">${j.questionCount} câu · ${t.durationMin} phút · ${t.maxAttempts} lượt làm${t.dueAt ? " · " + due(t.dueAt) : ""}</p>
    <div class="cl-m-kpis">
      <div class="cl-m-kpi"><b>${j.questionCount}</b><span>Câu hỏi</span></div>
      <div class="cl-m-kpi"><b>${t.durationMin} phút</b><span>Thời gian</span></div>
    </div>
    <div class="sheet sheet-pad">
      <h2>Yêu cầu</h2>
      <p class="muted">${esc(t.instructions || "Hoàn thành bài kiểm tra và gửi kết quả trước thời hạn. Trong lúc làm bài, trợ lý AI sẽ tạm khóa.")}</p>
      <div class="cl-m-req-row"><span>Hạn nộp</span><b>${t.dueAt ? fmtDate(t.dueAt, false) : "Không giới hạn"}</b></div>
      <div class="cl-m-req-row"><span>Trạng thái</span><span class="tag ${used ? "tag-la" : "tag-cam"}">${doing ? "Đang làm" : used ? `Đã làm ${used}/${t.maxAttempts}` : "Chưa nộp"}</span></div>
      ${j.attempts.filter((x) => x.status !== "doing").map((x, i) => `<p>Lượt ${i + 1}: <b>${x.score}/${x.maxScore}</b> · ${fmtDate(x.submittedAt)}${x.status === "late" ? " (muộn)" : ""}</p>`).join("")}
      ${t.status === "published" && (doing || used < t.maxAttempts) ? `<button class="btn btn-primary btn-block" id="start" style="margin-top:12px">${icon("play")}${doing ? "Tiếp tục làm bài" : "Bắt đầu làm bài"}</button>` : `<p class="muted">${used >= t.maxAttempts ? "Bạn đã dùng hết lượt làm bài." : "Bài kiểm tra đã đóng."}</p>`}
    </div>
  </div>`;
  $("#start", main)?.addEventListener("click", async () => {
    if (!doing && !(await confirmBox("Bắt đầu làm bài?", `Đồng hồ ${t.durationMin} phút bắt đầu chạy ngay và không dừng lại khi bạn rời trang.`, "Bắt đầu"))) return;
    try { takeTest(main, await api(`/api/tests/${id}/start`, "POST", {}), ctx); } catch (e) { toast(e.message, "err"); }
  });
}

/* =================== TEACHER: OVERVIEW =================== */
export async function pageTeacher(main, _p, _q, ctx) {
  ctx.setCrumbs([["Giáo viên", "/app/giao-vien"], ["Dashboard giáo viên"]]);
  main.innerHTML = `<div class="skel" style="height:300px"></div>`;
  let j;
  try { j = await api("/api/teacher/overview"); } catch (e) { main.innerHTML = empty("Trang dành cho giáo viên", e.message, `<a class="btn btn-primary" href="/app/bang-gia?goi=teacher">Xem gói Teacher</a>`); return; }
  if (!ctx.isCurrent()) return;
  const L = j.license;
  const firstCls = j.classes && j.classes[0];
  main.innerHTML = `
    <div class="tc-m-head">
      <div class="tc-m-greet">
        <img src="/img/kit/chibi-owl.webp" alt="" width="44" height="44" loading="lazy" />
        <div>
          <h1>Xin chào, Giáo viên</h1>
          <p>Tổng quan lớp và hoạt động học viên.</p>
        </div>
      </div>
      <span class="lx-ex-pill">Teacher</span>
    </div>
    <div class="page-head"><div><h1>Trang giáo viên</h1><p>Quản lý lớp, giao bài, kiểm tra và theo dõi tiến độ học sinh.</p></div>
      <a class="btn" href="/app/giao-vien/hoc-vien">${icon("user")}Học viên của tôi</a>
      ${j.canCreate ? `<button class="btn btn-primary" id="newClass">${icon("plus")}Tạo lớp</button>` : `<a class="btn btn-primary" href="/app/bang-gia?goi=teacher">${icon("star")}Mua / gia hạn giấy phép</a>`}</div>
    ${L ? `<div class="pay-warn" style="margin:0 0 14px">${L.licenses.length ? `Giấy phép: đã dùng <b>${L.used}/${L.seats}</b> chỗ học sinh · ${L.licenses.map((l) => `${esc(l.tier)} ${l.seats} chỗ đến ${fmtDate(l.expiresAt, false)}`).join(" · ")}` : `Giấy phép Teacher của bạn đã hết hạn. Lớp cũ vẫn xem được nhưng học sinh không còn quyền Pro từ lớp và bạn không tạo được lớp mới.`}</div>` : ""}
    <div class="stats biz-stats tc-m-stats">
      <div><b>${fmtN(j.stats.classes)}</b><span>Lớp đang dạy</span></div><div><b>${fmtN(j.stats.students)}</b><span>Học viên</span></div>
      <div><b>${fmtN(j.stats.assignments)}</b><span>Bài đã giao</span></div><div><b>${j.stats.avgScore != null ? j.stats.avgScore : fmtN(j.stats.missing)}</b><span>${j.stats.avgScore != null ? "Điểm TB bài tập" : "Bài quá hạn"}</span></div>
      <div class="tc-stat-desk"><b>${j.stats.avgScore ?? "—"}</b><span>Điểm TB bài tập</span></div><div class="tc-stat-desk"><b>${L ? fmtN(Math.max(0, L.seats - L.used)) : "∞"}</b><span>Chỗ giấy phép còn lại</span></div>
    </div>
    ${!j.classes.length && j.canCreate ? `<section class="sheet sheet-pad tc-m-steps" style="margin-bottom:16px">
      <h2 style="margin:0 0 10px">Bắt đầu trong 3 bước</h2>
      <ol class="small tc-step-list">
        <li><b>Tạo lớp</b> — đặt tên lớp, lấy mã/join link gửi học sinh.</li>
        <li><b>Thêm học viên</b> — học sinh tự vào bằng mã, hoặc bạn tạo tài khoản tại <a href="/app/giao-vien/hoc-vien">Học viên của tôi</a>.</li>
        <li><b>Giao bài</b> — vào lớp → tab Bài tập → giao bài có sẵn hoặc tự soạn.</li>
      </ol>
      <button class="btn btn-primary" id="newClassTop">${icon("plus")}Tạo lớp đầu tiên</button>
    </section>` : ""}
    <div class="tc-m-actions">
      <h2>Công việc cần xử lý</h2>
      <a class="tc-m-act" href="${firstCls ? `/app/giao-vien/lop/${firstCls.id}?tab=bai-tap` : "/app/giao-vien/hoc-vien"}"><span class="tc-m-ico">📝</span><div class="tc-m-copy"><b>Bài tập và chấm điểm</b><span>${fmtN(j.stats.assignments)} bài đã giao trong các lớp</span></div><span class="tc-m-arr">›</span></a>
      <a class="tc-m-act" href="${firstCls ? `/app/giao-vien/lop/${firstCls.id}?tab=bao-cao` : "/app/giao-vien/hoc-vien"}"><span class="tc-m-ico">👥</span><div class="tc-m-copy"><b>Học viên cần hỗ trợ</b><span>${fmtN(j.needSupport.length)} học viên cần chú ý</span></div><span class="tc-m-arr">›</span></a>
      <a class="tc-m-act" href="/app/giao-vien/hoc-vien"><span class="tc-m-ico">🏫</span><div class="tc-m-copy"><b>Quản lý học viên</b><span>Danh sách ${fmtN(j.stats.students)} học viên đang phụ trách</span></div><span class="tc-m-arr">›</span></a>
      ${j.canCreate ? `<button type="button" class="tc-m-act" id="newClassM"><span class="tc-m-ico">✨</span><div class="tc-m-copy"><b>Tạo lớp / Giao bài tập</b><span>Tạo lớp mới hoặc giao bài cho lớp</span></div><span class="tc-m-arr">›</span></button>` : ""}
    </div>
    <div class="two-col" style="margin-top:16px">
      <section class="sheet sheet-pad"><h2>Lớp của tôi</h2>
        ${j.classes.length ? `<div class="class-grid">${j.classes.map((c) => `<a class="class-card" href="/app/giao-vien/lop/${c.id}"><b>${esc(c.name)}</b><span class="small muted">Mã lớp: <code>${esc(c.joinCode)}</code></span><span class="small">${c.members} học sinh${c.pending ? ` · <b>${c.pending} chờ duyệt</b>` : ""}</span>${c.status !== "active" ? `<span class="tag tag-line" style="align-self:flex-start">Đã đóng</span>` : ""}</a>`).join("")}</div>` : `<p class="muted">Chưa có lớp nào.${j.canCreate ? " Hãy tạo lớp ở nút phía trên." : ""}</p>`}
      </section>
      <section class="sheet sheet-pad"><h2>Học sinh cần hỗ trợ</h2>
        ${j.needSupport.length ? `<ul class="list">${j.needSupport.map((s) => `<li><a class="list-row" href="/app/giao-vien/lop/${s.classId}?tab=bao-cao"><span class="t"><b>${esc(s.displayName)}</b><span>${esc(s.className)} · hoàn thành ${s.completion}%${s.avgScore != null ? ` · điểm TB ${s.avgScore}` : ""}${s.missing ? ` · ${s.missing} bài quá hạn` : ""}</span></span></a></li>`).join("")}</ul>` : `<p class="muted">${j.classes.length ? "Chưa có học sinh nào cần chú ý." : "Sau khi có lớp và bài giao, học sinh yếu sẽ hiện ở đây."}</p>`}
        <p class="small muted" style="margin-top:8px">Cần hỗ trợ: hoàn thành dưới 50%, điểm TB dưới 5 hoặc từ 2 bài quá hạn.</p>
      </section>
    </div>`;
  const openNew = () => classForm(null, (c) => { setAppHash(`/app/giao-vien/lop/${c.id}`) });
  $("#newClass", main)?.addEventListener("click", openNew);
  $("#newClassTop", main)?.addEventListener("click", openNew);
  $("#newClassM", main)?.addEventListener("click", openNew);
}

function classForm(c, done) {
  const v = c || { name: "", description: "", maxMembers: 0, requireApproval: false, startsOn: null, endsOn: null };
  const d = (x) => (x ? String(x).slice(0, 10) : "");
  const m = openModal(`<h2>${c ? "Sửa lớp" : "Tạo lớp"}</h2><form class="auth-form" data-f>
    <label class="field">Tên lớp<input name="name" maxlength="80" required value="${esc(v.name)}" placeholder="Ví dụ: Lớp 10A1 - Học kỳ 1"></label>
    <label class="field">Mô tả<input name="description" maxlength="1000" value="${esc(v.description || "")}"></label>
    <div class="grid-2"><label class="field">Ngày bắt đầu<input name="startsOn" type="date" value="${d(v.startsOn)}"></label><label class="field">Ngày kết thúc<input name="endsOn" type="date" value="${d(v.endsOn)}"></label></div>
    <label class="field">Giới hạn thành viên<input name="maxMembers" type="number" min="0" max="1000" value="${v.maxMembers || 0}"><small>0 = không giới hạn (vẫn bị giới hạn bởi số chỗ trong giấy phép).</small></label>
    <label class="check"><input type="checkbox" name="requireApproval" ${v.requireApproval ? "checked" : ""}> Học sinh vào bằng mã/link phải chờ tôi duyệt</label>
    <p class="form-msg err" data-m></p>
    <div class="modal-actions"><button type="button" class="btn" data-close>Hủy</button><button class="btn btn-primary">${c ? "Lưu" : "Tạo lớp"}</button></div></form>`);
  m.el.querySelector("[data-f]").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const body = { name: f.name.value, description: f.description.value, startsOn: f.startsOn.value || null, endsOn: f.endsOn.value || null, maxMembers: Number(f.maxMembers.value || 0), requireApproval: f.requireApproval.checked };
    try { const r = await api(c ? `/api/classes/${c.id}` : "/api/classes", c ? "PUT" : "POST", body); m.close(); toast(c ? "Đã lưu." : "Đã tạo lớp.", "ok"); done(r.class); }
    catch (err) { m.el.querySelector("[data-m]").textContent = err.message; }
  });
}

/* =================== TEACHER: SINGLE CLASS =================== */
const TABS = [["thanh-vien", "Thành viên"], ["bai-tap", "Bài tập"], ["kiem-tra", "Kiểm tra"], ["bao-cao", "Báo cáo"], ["ngoai-ngu", "Ngoại ngữ"], ["cai-dat", "Cài đặt lớp"]];
export async function pageTeacherClass(main, [id], query, ctx) {
  const tab = TABS.some((t) => t[0] === query.tab) ? query.tab : "thanh-vien";
  ctx.setCrumbs([["Giáo viên", "/app/giao-vien"], ["Quản lý lớp và bài tập"]]);
  main.innerHTML = `<div class="skel" style="height:300px"></div>`;
  let j;
  try { j = await api(`/api/classes/${id}`); } catch (e) { main.innerHTML = empty("Không mở được lớp", e.message, `<a class="btn" href="/app/giao-vien">Về trang giáo viên</a>`); return; }
  if (!ctx.isCurrent()) return;
  if (!j.manage) { location.replace(`/app/lop/${id}`); return; }
  const c = j.class;
  ctx.setCrumbs([["Giáo viên", "/app/giao-vien"], ["Quản lý lớp và bài tập"]]);
  const actMembers = j.members.filter((x) => x.status === "active").length;
  main.innerHTML = `
    <div class="page-head"><div><h1>${esc(c.name)}</h1><p>Mã lớp <code class="join-code">${esc(c.joinCode)}</code> · ${actMembers} học sinh${c.status !== "active" ? " · <b>Đã đóng</b>" : ""}${S.me.role === "admin" && c.teacherId !== S.me.id ? ` · Giáo viên: ${esc(c.teacherName)}` : ""}</p></div></div>
    <div class="cl-m-kpis">
      <div class="cl-m-kpi"><b>${fmtN(actMembers)}</b><span>Học viên</span></div>
      <div class="cl-m-kpi"><b>${fmtN((j.assignments || []).length || (j.invites || []).length)}</b><span>Bài giao / lời mời</span></div>
    </div>
    <nav class="tabs">${TABS.map(([k, l]) => `<a href="/app/giao-vien/lop/${id}?tab=${k}" class="${k === tab ? "on" : ""}">${l}</a>`).join("")}</nav>
    <div id="tb"></div>`;
  const host = $("#tb", main);
  const reload = () => pageTeacherClass(main, [id], { tab }, ctx);
  ({ "thanh-vien": membersTab, "bai-tap": assignmentsTab, "kiem-tra": testsTab, "bao-cao": reportTab, "ngoai-ngu": (host) => import("./lang.js").then((m) => m.langClassReport(host, id)), "cai-dat": settingsTab })[tab](host, j, reload, ctx);
}

function membersTab(host, j, reload) {
  const c = j.class, link = (t) => `${location.origin}/app/tham-gia/${t}`;
  const kits = ["cat", "fox", "bunny", "dragon", "owl", "frog"];
  host.innerHTML = `
    <div class="two-col">
      <section class="sheet sheet-pad"><h2>Thành viên</h2>
        ${j.members.length ? `<div class="table-wrap" style="border:0"><table><thead><tr><th>Học sinh</th><th>Trạng thái</th><th>Vào lớp</th><th></th></tr></thead><tbody>${j.members.map((m, idx) => `<tr>
          <td><div class="tc-m-stu-cell"><img class="tc-m-stu-av" src="/img/kit/chibi-${kits[idx % kits.length]}.webp" alt="" width="40" height="40" loading="lazy" /><div><a href="#" data-st="${m.userId}"><b>${esc(m.displayName)}</b></a><br><span class="small muted">@${esc(m.username)}</span></div></div></td><td><span class="tag ${MEMBER_ST[m.status][1]}">${MEMBER_ST[m.status][0]}</span></td><td class="small">${fmtDate(m.joinedAt, false)}</td>
          <td class="nowrap">${m.status === "pending" ? `<button class="btn btn-xs btn-primary" data-act="approve" data-u="${m.userId}">Duyệt</button> <button class="btn btn-xs btn-ghost" data-act="reject" data-u="${m.userId}">Từ chối</button>` : `${m.status === "active" ? `<button class="btn btn-xs" data-act="suspend" data-u="${m.userId}">Tạm khóa</button>` : `<button class="btn btn-xs" data-act="unsuspend" data-u="${m.userId}">Mở khóa</button>`} <button class="btn btn-xs btn-ghost" data-act="remove" data-u="${m.userId}" data-n="${esc(m.displayName)}">Xóa khỏi lớp</button>`}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Chưa có học sinh. Gửi mã lớp hoặc liên kết mời bên cạnh.</p>`}
      </section>
      <section>
        <div class="sheet sheet-pad" style="margin-bottom:14px"><h2>Mời học sinh</h2>
          <p class="small muted">Gửi mã lớp để học sinh nhập ở mục <b>Lớp của tôi</b>.</p>
          <div class="row" style="margin:8px 0"><code class="mono-box">${esc(c.joinCode)}</code><button class="btn btn-sm" data-copy="${esc(c.joinCode)}">${icon("copy")}Sao chép</button><button class="btn btn-sm btn-ghost" id="newCode">Đổi mã</button></div>
          <h3 style="margin-top:12px">Liên kết mời</h3>
          ${j.invites.map((v) => `<div class="row" style="margin:6px 0;flex-wrap:nowrap"><code class="mono-box small">${esc(link(v.token))}</code><button class="btn btn-xs" data-copy="${esc(link(v.token))}">${icon("copy")}</button><button class="btn btn-xs btn-ghost" data-delinv="${esc(v.token)}">${icon("trash")}</button></div><p class="small muted">Đã dùng ${v.uses}${v.maxUses ? "/" + v.maxUses : ""} lượt${v.expiresAt ? " · hết hạn " + fmtDate(v.expiresAt) : ""}</p>`).join("") || `<p class="small muted">Chưa có liên kết.</p>`}
          <button class="btn btn-sm" id="newInv">${icon("plus")}Tạo liên kết (7 ngày)</button></div>
        <div class="sheet sheet-pad"><h2>Thêm trực tiếp</h2><p class="small muted">Nhập tên đăng nhập của học sinh đã có tài khoản, mỗi dòng một người.</p>
          <textarea class="input" id="addU" rows="4" placeholder="an.nguyen&#10;binh.tran"></textarea><button class="btn btn-sm btn-primary" id="addBtn" style="margin-top:8px">Thêm vào lớp</button><div id="addRes" class="small"></div></div>
        ${j.license ? `<p class="small muted" style="margin-top:10px">Giấy phép: ${j.license.used}/${j.license.seats} chỗ đã dùng. Một học sinh ở nhiều lớp của bạn chỉ tính 1 chỗ.</p>` : ""}
      </section>
    </div>`;
  host.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-act],[data-copy],[data-delinv],[data-st],#newCode,#newInv,#addBtn"); if (!b) return;
    e.preventDefault();
    if (b.dataset.copy) return navigator.clipboard?.writeText(b.dataset.copy).then(() => toast("Đã sao chép.", "ok")).catch(() => {});
    if (b.dataset.st) return studentModal(c.id, b.dataset.st);
    try {
      if (b.dataset.act) {
        if (b.dataset.act === "remove" && !(await confirmBox(`Xóa ${b.dataset.n} khỏi lớp?`, "Học sinh mất quyền Pro có từ lớp này (nếu không còn ở lớp nào khác của bạn). Bài đã nộp vẫn lưu.", "Xóa khỏi lớp", true))) return;
        await api(`/api/classes/${c.id}/members/${b.dataset.u}`, "POST", { action: b.dataset.act }); toast("Đã cập nhật.", "ok"); return reload();
      }
      if (b.dataset.delinv) { await api(`/api/classes/${c.id}/invites/${b.dataset.delinv}`, "DELETE"); return reload(); }
      if (b.id === "newCode") { if (!(await confirmBox("Đổi mã lớp?", "Mã cũ sẽ không dùng được nữa. Học sinh đã trong lớp không bị ảnh hưởng.", "Đổi mã"))) return; await api(`/api/classes/${c.id}/code`, "POST", {}); return reload(); }
      if (b.id === "newInv") { await api(`/api/classes/${c.id}/invites`, "POST", { expiresDays: 7 }); return reload(); }
      if (b.id === "addBtn") {
        const names = $("#addU", host).value.split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean);
        if (!names.length) return;
        const r = await api(`/api/classes/${c.id}/members`, "POST", { usernames: names });
        $("#addRes", host).innerHTML = r.results.map((x) => `<div>${esc(x.username)}: ${x.ok ? "đã thêm" : `<span class="form-msg err">${esc(x.error)}</span>`}</div>`).join("");
        if (r.results.some((x) => x.ok)) setTimeout(reload, 1500);
      }
    } catch (err) { toast(err.message, "err", 5000); }
  });
}

async function studentModal(classId, uid) {
  let j; try { j = await api(`/api/classes/${classId}/students/${uid}`); } catch (e) { return toast(e.message, "err"); }
  openModal(`<h2>${esc(j.student.displayName)}</h2><p class="muted">@${esc(j.student.username)} · ${fmtN(j.xp)} XP · ${j.solved} bài thư viện đã đạt · ${j.lessonsDone} bài học hoàn thành</p>
    <h3 style="margin-top:12px">Bài được giao</h3><ul class="list">${j.assignments.map((a) => `<li class="list-row" style="cursor:default">${scoreTag(a.state)}<span class="t"><b>${esc(a.title)}</b><span>${a.state.attempts} lần nộp${a.state.late ? " · muộn" : ""}</span></span></li>`).join("") || "<li class='muted'>Chưa có.</li>"}</ul>
    <h3 style="margin-top:12px">Lịch sử nộp gần đây</h3><ul class="list">${j.submissions.slice(0, 15).map((s) => `<li class="list-row" style="cursor:default"><span class="t"><b>${esc(s.title)} · lần ${s.attempt_no}</b><span>${fmtDate(s.created_at)} · ${s.passed ? "đạt" : "chưa đạt"}${s.manual_score != null ? ` · điểm ${s.manual_score}` : ""}</span></span></li>`).join("") || "<li class='muted'>Chưa có.</li>"}</ul>`, { cls: "wide" });
}

async function assignmentsTab(host, j, reload) {
  const c = j.class;
  const list = (await api(`/api/classes/${c.id}/assignments`)).assignments;
  host.innerHTML = `<div class="row" style="margin-bottom:12px"><button class="btn btn-primary" id="newA" ${c.status !== "active" ? "disabled" : ""}>${icon("plus")}Giao bài mới</button></div>
    ${list.length ? `<div class="table-wrap"><table><thead><tr><th>Bài</th><th>Hạn nộp</th><th class="num">Đã nộp</th><th class="num">Đạt</th><th>Trạng thái</th><th></th></tr></thead><tbody>${list.map((a) => `<tr><td><a href="/app/bai-giao/${a.id}"><b>${esc(a.title)}</b></a><br><span class="small muted">${a.kind === "exercise" ? "Thư viện " + esc(a.refId) : a.langItem ? "Ngoại ngữ · " + esc(a.langItem) : "Bài tự soạn"}${a.targetAll ? "" : " · giao riêng"}</span></td><td class="small">${a.dueAt ? fmtDate(a.dueAt) : "—"}</td><td class="num">${a.submitted}/${a.targets}</td><td class="num">${a.passed}</td><td>${a.status === "published" ? `<span class="tag tag-la">Đang mở</span>` : `<span class="tag tag-line">Đã đóng</span>`}</td><td><button type="button" class="btn btn-ghost btn-sm" data-xlsx="${a.id}" title="Xuất điểm Excel">${icon("download")}</button></td></tr>`).join("")}</tbody></table></div>` : empty("Chưa giao bài nào", "Chọn bài từ thư viện hoặc tự soạn đề có chấm tự động.")}`;
  host.querySelectorAll("[data-xlsx]").forEach((b) => b.addEventListener("click", async () => {
    const id = b.dataset.xlsx;
    try {
      const res = await fetch(`/api/assignments/${id}/grades.xlsx`, { credentials: "same-origin" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Không xuất được file.");
      const url = URL.createObjectURL(await res.blob());
      const a = Object.assign(document.createElement("a"), { href: url, download: `diem-bai-${id}.xlsx` });
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast("Đã tải file điểm.", "ok");
    } catch (e) { toast(e.message, "err"); }
  }));
  $("#newA", host).addEventListener("click", () => assignmentForm(j, reload));
}

async function testsTab(host, j, reload) {
  const c = j.class;
  const list = (await api(`/api/classes/${c.id}/tests`)).tests;
  host.innerHTML = `<div class="row" style="margin-bottom:12px"><button class="btn btn-primary" id="newT" ${c.status !== "active" ? "disabled" : ""}>${icon("plus")}Tạo bài kiểm tra</button></div>
    ${list.length ? `<div class="table-wrap"><table><thead><tr><th>Bài kiểm tra</th><th class="num">Câu</th><th>Thời gian</th><th>Hạn</th><th class="num">Đã làm</th><th>Trạng thái</th></tr></thead><tbody>${list.map((t) => `<tr><td><a href="/app/kiem-tra-lop/${t.id}"><b>${esc(t.title)}</b></a></td><td class="num">${t.questions}</td><td>${t.durationMin} phút · ${t.maxAttempts} lượt</td><td class="small">${t.dueAt ? fmtDate(t.dueAt) : "—"}</td><td class="num">${t.takers}</td><td>${t.status === "published" ? `<span class="tag tag-la">Đang mở</span>` : `<span class="tag tag-line">Đã đóng</span>`}</td></tr>`).join("")}</tbody></table></div>` : empty("Chưa có bài kiểm tra", "Tạo bài kiểm tra trắc nghiệm và câu hỏi luyện tập cho lớp.")}`;
  $("#newT", host).addEventListener("click", () => testForm(j, reload));
}

async function reportTab(host, j) {
  const r = await api(`/api/classes/${j.class.id}/report`);
  const s = r.summary || {};
  host.innerHTML = `
    <div class="stats biz-stats" style="margin-bottom:14px">
      <div><b>${fmtN(s.students || 0)}</b><span>Học sinh</span></div>
      <div><b>${s.completion != null ? s.completion + "%" : "—"}</b><span>Hoàn thành TB</span></div>
      <div><b>${s.avgScore ?? "—"}</b><span>Điểm TB bài tập</span></div>
      <div><b>${fmtN(s.needsSupport || 0)}</b><span>Cần hỗ trợ</span></div>
    </div>
    <div class="row" style="margin-bottom:12px"><button class="btn" id="xlsx">${icon("download")}Xuất Excel</button><a class="btn" href="/app/in-bao-cao/${j.class.id}" target="_blank" rel="noopener">${icon("print")}Bản in / Lưu PDF</a>
      <span class="small muted">Bấm tên học sinh để xem chi tiết nộp bài.</span></div>
    ${(r.weakTopics || []).length ? `<section class="sheet sheet-pad" style="margin-bottom:14px"><h3 style="margin:0 0 8px">Chủ đề cả lớp cần củng cố</h3><p class="small muted" style="margin:0 0 10px">Tổng hợp từ bài thực hành có dữ liệu; không tính học sinh chưa làm bài là yếu.</p><div style="display:grid;gap:9px">${r.weakTopics.slice(0,6).map((t) => `<div><div class="row" style="justify-content:space-between"><b>${esc(t.chapterTitle)}</b><span class="small muted">${t.averageMastery}% · ${t.students} học viên</span></div><div class="bar thin"><i style="width:${t.averageMastery}%"></i></div></div>`).join("")}</div></section>` : ""}
    ${reportTable(r)}`;
  $("#xlsx", host).addEventListener("click", async () => {
    try {
      const res = await fetch(`/api/classes/${j.class.id}/report.xlsx`, { credentials: "same-origin" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Không xuất được file.");
      const url = URL.createObjectURL(await res.blob());
      const a = Object.assign(document.createElement("a"), { href: url, download: `bao-cao-${j.class.name.replace(/[^\p{L}\p{N}]+/gu, "-")}.xlsx` });
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) { toast(e.message, "err"); }
  });
  host.querySelectorAll("[data-st]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); studentModal(j.class.id, a.dataset.st); }));
}
function reportTable(r) {
  return r.rows.length ? `<div class="table-wrap"><table class="report"><thead><tr><th>Học sinh</th><th class="num">Bài làm</th><th class="num">Hoàn thành</th><th class="num">Điểm TB</th><th class="num">KT TB</th><th class="num">Đầu vào</th><th class="num">Cuối tuần</th><th>Quá hạn chưa làm</th><th>Chương còn yếu</th><th></th></tr></thead><tbody>
    ${r.rows.map((x) => `<tr class="${x.needsSupport ? "need" : ""}"><td><a href="#" data-st="${x.userId}"><b>${esc(x.displayName)}</b></a><br><span class="small muted">@${esc(x.username)}</span></td><td class="num">${x.assignmentsDone}/${x.assignmentsTotal}</td><td class="num">${x.completion}%</td><td class="num">${x.avgScore ?? "—"}</td><td class="num">${x.testAvg ?? "—"}</td><td class="num">${x.learningProgress?.entrancePercent == null ? "—" : x.learningProgress.entrancePercent + "%"}</td><td class="num">${x.learningProgress?.weeklyPercent == null ? "—" : `${x.learningProgress.weeklyPercent}%${x.learningProgress.change == null ? "" : ` (${x.learningProgress.change > 0 ? "+" : ""}${x.learningProgress.change})`}`}</td><td class="small">${esc(x.missing.join(", ")) || "—"}</td><td class="small">${esc(x.weakChapters.join(", ")) || "—"}</td><td>${x.needsSupport ? `<span class="tag tag-cam">Cần hỗ trợ</span>` : ""}</td></tr>`).join("")}</tbody></table></div>` : empty("Chưa có dữ liệu", "Báo cáo hiện khi lớp có học sinh và bài được giao.");
}

export async function pagePrintReport(main, [id], _q, ctx) {
  ctx.setCrumbs([["Báo cáo lớp"]]);
  const r = await api(`/api/classes/${id}/report`);
  document.body.classList.add("print-mode");
  ctx.onLeave(() => document.body.classList.remove("print-mode"));
  main.innerHTML = `<div class="print-sheet"><div class="no-print row" style="margin-bottom:12px"><button class="btn btn-primary" id="pr">${icon("print")}In / Lưu PDF</button><span class="small muted">Trong hộp thoại in, chọn "Lưu dưới dạng PDF".</span></div>
    <h1>Báo cáo lớp ${esc(r.class.name)}</h1><p>Ngày xuất: ${fmtDate(new Date().toISOString())} · ${r.summary.students} học sinh · hoàn thành TB ${r.summary.completion}% · điểm TB ${r.summary.avgScore ?? "—"}</p>
    ${reportTable(r)}<p class="small muted">${esc(cfg("siteName", "LifeRivo"))}</p></div>`;
  $("#pr", main).addEventListener("click", () => window.print());
}

function settingsTab(host, j, reload) {
  const c = j.class;
  host.innerHTML = `<section class="sheet sheet-pad" style="max-width:640px">
    <p><b>Tên:</b> ${esc(c.name)}<br><b>Mô tả:</b> ${esc(c.description || "—")}<br><b>Thời gian:</b> ${c.startsOn ? fmtDate(c.startsOn, false) : "—"} → ${c.endsOn ? fmtDate(c.endsOn, false) : "—"}<br><b>Giới hạn:</b> ${c.maxMembers || "không"} · ${c.requireApproval ? "phải duyệt" : "vào thẳng"}</p>
    <div class="row" style="margin-top:12px"><button class="btn" id="edit">${icon("settings")}Sửa thông tin</button>
      <button class="btn" id="close">${c.status === "active" ? "Đóng lớp" : "Mở lại lớp"}</button><button class="btn btn-ghost" id="del" style="color:var(--do)">${icon("trash")}Xóa lớp</button></div>
    <p class="small muted" style="margin-top:10px">Đóng lớp: học sinh vẫn xem được kết quả nhưng không nộp bài mới, chỗ giấy phép được trả lại. Xóa lớp đã có bài nộp: lớp chỉ được lưu trữ (ẩn), dữ liệu học tập giữ nguyên.</p></section>`;
  $("#edit", host).addEventListener("click", () => classForm(c, reload));
  $("#close", host).addEventListener("click", async () => { try { await api(`/api/classes/${c.id}/${c.status === "active" ? "close" : "reopen"}`, "POST", {}); reload(); } catch (e) { toast(e.message, "err"); } });
  $("#del", host).addEventListener("click", async () => {
    const v = await promptBox("Xóa lớp?", `Gõ đúng tên lớp “${c.name}” để xác nhận.`, { label: "Tên lớp", okLabel: "Xóa lớp", validate: (x) => (x.trim() !== c.name ? "Tên chưa khớp." : "") });
    if (v == null) return;
    try { const r = await api(`/api/classes/${c.id}`, "DELETE"); toast(r.archived ? "Lớp có dữ liệu nên đã được lưu trữ." : "Đã xóa lớp.", "ok"); setAppHash("/app/giao-vien") } catch (e) { toast(e.message, "err"); }
  });
}

export async function pageAssignment(main, [id], _q, ctx) {
  ctx.setCrumbs([["Lớp học", "/app/lop"], ["Bài tập lớp / kiểm tra"]]);
  main.innerHTML = `<div class="skel" style="height:320px"></div>`;
  let j;
  try { j = await api(`/api/assignments/${id}`); } catch (e) { main.innerHTML = empty("Không mở được bài", e.message); return; }
  if (!ctx.isCurrent()) return;
  if (j.manage) return teacherAssignment(main, j, ctx);
  // Bài ngoại ngữ: mở không gian luyện ngoại ngữ, kết quả tự ghi vào bài giao
  if (j.assignment && j.assignment.langItem) { location.replace(`/app/ngoai-ngu/bai/${j.assignment.langItem}?asg=${j.assignment.id}`); return; }
  const a = j.assignment, ex = j.exercise || {};
  ctx.setCrumbs([["Lớp học", "/app/lop"], ["Bài tập lớp / kiểm tra"]]);
  const open = a.status === "published";
  const paintMine = (list) => {
    $("#mine", main).innerHTML = list.length ? `<ul class="list">${list.map((s) => `<li class="list-row" style="cursor:default"><span>Lần ${esc(String(s.attemptNo))}${s.late ? " · nộp muộn" : ""}</span>${s.manualScore != null ? `<span class="stamp sm">${esc(String(s.manualScore))}</span>` : `<span class="small muted">Chờ giáo viên chấm</span>`}${s.feedback ? `<p class="small">${esc(s.feedback)}</p>` : ""}</li>`).join("")}</ul>` : `<p class="small muted">Chưa có lần nộp nào.</p>`;
  };
  main.innerHTML = `
    <div class="cl-test-intro">
      <span class="lx-ex-pill">BÀI TẬP ĐƯỢC GIAO</span>
      <h1>${esc(a.title)}</h1>
      <p class="small muted">${due(a.dueAt)}${a.maxAttempts ? ` · tối đa ${a.maxAttempts} lần nộp` : ""}${a.allowResubmit ? "" : " · chỉ nộp 1 lần"}</p>
      <div class="sheet sheet-pad" style="margin-top:10px">
        <h2>Yêu cầu</h2>
        <p class="muted">${esc(a.instructions || "Hoàn thành bài tập và gửi kết quả trước thời hạn. Bạn có thể làm lại theo số lần cho phép.")}</p>
        <div class="cl-m-req-row"><span>Hạn nộp</span><b>${a.dueAt ? fmtDate(a.dueAt, false) : "Không giới hạn"}</b></div>
        <div class="cl-m-req-row"><span>Trạng thái</span><span id="stTag">${scoreTag(j.state)}</span></div>
      </div>
    </div>
    <section class="sheet sheet-pad" style="margin-top:12px"><div class="prompt">${esc(ex.prompt || "")}</div></section>
    <section class="sheet sheet-pad" style="margin-top:12px">
      <label class="field">Bài làm của bạn<textarea id="ans" rows="10" maxlength="20000" ${open ? "" : "disabled"}></textarea></label>
      <div class="row" style="margin-top:10px"><button class="btn btn-primary" id="sub" ${open ? "" : "disabled"}>${icon("send")}Nộp bài</button><button class="btn btn-ghost" id="aiBtn" ${aiOn() ? "" : "hidden"} title="Hỏi Rivo về bài này">💬 AI hỗ trợ</button></div>
      <p class="form-msg" id="subMsg" role="status"></p>
    </section>
    <h3 style="margin-top:16px">Các lần nộp</h3><div id="mine"></div>`;
  paintMine(j.mine || []);
  const ans = $("#ans", main);
  if (j.mine && j.mine[0] && j.mine[0].code) ans.value = j.mine[0].code;
  const submit = async () => {
    const b = $("#sub", main); if (b.disabled) return;
    const msg = $("#subMsg", main);
    const text = ans.value.trim();
    if (!text) { msg.textContent = "Bạn chưa viết bài làm."; msg.className = "form-msg err"; return; }
    b.disabled = true;
    try {
      const r = await api(`/api/assignments/${id}/submit`, "POST", { code: text });
      msg.textContent = `Đã nộp bài${r.late ? " (sau hạn)" : ""}. Giáo viên sẽ chấm bài.`; msg.className = "form-msg ok";
      if (r.state) $("#stTag", main).innerHTML = scoreTag(r.state);
      const fresh = await api(`/api/assignments/${id}`); paintMine(fresh.mine || []);
    } catch (e) { msg.textContent = e.message; msg.className = "form-msg err"; }
    b.disabled = !open;
  };
  $("#sub", main).addEventListener("click", submit);
  const aiOpts = { assignmentId: Number(id), getCode: () => ans.value, page: "Bài giao: " + a.title };
  $("#aiBtn", main)?.addEventListener("click", () => openAiInline(ans.closest("section"), aiOpts));
  window.__plAiCtx = { ...aiOpts };
  ctx.onLeave(() => { window.__plAiCtx = null; });
}

async function assignmentForm(j, reload) {
  const members = j.members.filter((m) => m.status === "active");
  const m = openModal(`<h2>Giao bài mới</h2><form class="auth-form" data-f>
    <div class="chips" style="margin-bottom:8px"><button type="button" class="chip on" data-k="custom">Tự soạn đề</button><button type="button" class="chip" data-k="lang">Ngoại ngữ</button></div>
    <div data-pane="lang" hidden><div class="grid-2"><label class="field">Ngôn ngữ<select name="lc"></select></label><label class="field">Cấp độ<select name="ll"></select></label></div>
      <label class="field">Bài tập<select name="le"></select></label><small class="muted">Học viên làm bài ở trang ngoại ngữ; điểm tự ghi vào bài giao.</small></div>
    <div data-pane="custom"><label class="field">Tiêu đề<input name="title" maxlength="150"></label><label class="field">Đề bài<textarea name="prompt" rows="5" maxlength="5000"></textarea></label></div>
    <label class="field">Hướng dẫn thêm cho học sinh<textarea name="instructions" rows="2" maxlength="3000"></textarea></label>
    <div class="grid-2"><label class="field">Hạn nộp<input name="due" type="datetime-local"></label><label class="field">Số lần nộp tối đa<input name="max" type="number" min="0" max="100" value="0"><small>0 = không giới hạn</small></label></div>
    <label class="check"><input type="checkbox" name="resub" checked> Cho phép nộp lại</label>
    <label class="field">Giao cho<select name="target"><option value="all">Cả lớp</option><option value="some">Chọn học sinh</option></select></label>
    <div data-who hidden class="multi">${members.map((x) => `<label class="check"><input type="checkbox" value="${x.userId}"> ${esc(x.displayName)}</label>`).join("") || "<p class='muted small'>Lớp chưa có học sinh.</p>"}</div>
    <p class="form-msg err" data-m></p>
    <div class="modal-actions"><button type="button" class="btn" data-close>Hủy</button><button class="btn btn-primary">Giao bài</button></div></form>`, { cls: "wide" });
  let kind = "custom";
  const f = m.el.querySelector("[data-f]");
  m.el.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { kind = b.dataset.k; m.el.querySelectorAll("[data-k]").forEach((x) => x.classList.toggle("on", x === b)); m.el.querySelectorAll("[data-pane]").forEach((p) => (p.hidden = p.dataset.pane !== kind)); }));
  f.target.addEventListener("change", () => { m.el.querySelector("[data-who]").hidden = f.target.value !== "some"; });
  let LANG = null;
  const fillLang = async () => {
    if (!LANG) { try { LANG = (await api("/api/lang")).courses; } catch { LANG = []; } f.lc.innerHTML = LANG.map((c) => `<option value="${c.id}">${c.flag} ${esc(c.name)}</option>`).join(""); }
    const c = LANG.find((x) => x.id === f.lc.value) || LANG[0]; if (!c) return;
    if (!c.levels.some((l) => l.id === f.ll.value) || f.ll.dataset.c !== c.id) { f.ll.innerHTML = c.levels.map((l) => `<option value="${l.id}">${esc(l.title)}</option>`).join(""); f.ll.dataset.c = c.id; }
    const lv = c.levels.find((l) => l.id === f.ll.value) || c.levels[0];
    f.le.innerHTML = lv.units.map((u) => `<optgroup label="Bài ${esc(u.id)}: ${esc(u.title)}">${u.exercises.map((e) => `<option value="${e.id}">${esc(e.kindTitle || e.title)} (${e.count} câu)</option>`).join("")}</optgroup>`).join("") + (lv.test ? `<option value="${lv.test.id}">🏁 ${esc(lv.test.title)}</option>` : "");
  };
  m.el.querySelector('[data-k="lang"]').addEventListener("click", fillLang);
  f.lc.addEventListener("change", fillLang); f.ll.addEventListener("change", fillLang);
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = { kind, instructions: f.instructions.value, dueAt: f.due.value ? new Date(f.due.value).toISOString() : null, maxAttempts: Number(f.max.value || 0), allowResubmit: f.resub.checked, targetAll: f.target.value === "all", userIds: [...m.el.querySelectorAll("[data-who] input:checked")].map((x) => Number(x.value)) };
    if (kind === "lang") { if (!f.le.value) { m.el.querySelector("[data-m]").textContent = "Chọn bài ngoại ngữ."; return; } body.langItem = f.le.value; }
    else {
      if (!f.title.value.trim()) { m.el.querySelector("[data-m]").textContent = "Nhập tiêu đề bài."; return; }
      if (!f.prompt.value.trim()) { m.el.querySelector("[data-m]").textContent = "Nhập đề bài."; return; }
      Object.assign(body, { title: f.title.value, prompt: f.prompt.value });
    }
    try { await api(`/api/classes/${j.class.id}/assignments`, "POST", body); m.close(); toast("Đã giao bài.", "ok"); reload(); }
    catch (err) { m.el.querySelector("[data-m]").textContent = err.message; }
  });
}


async function testForm(j, reload) {
  const picked = [];
  const m = openModal(`<h2>Tạo bài kiểm tra</h2><form class="auth-form" data-f>
    <label class="field">Tên bài kiểm tra<input name="title" maxlength="150" required placeholder="Ví dụ: Kiểm tra 15 phút - từ vựng"></label>
    <div class="grid-2"><label class="field">Thời gian (phút)<input name="dur" type="number" min="1" max="600" value="15"></label><label class="field">Số lượt làm<input name="att" type="number" min="1" max="20" value="1"></label></div>
    <div class="grid-2"><label class="field">Mở lúc<input name="open" type="datetime-local"></label><label class="field">Hạn nộp<input name="due" type="datetime-local"></label></div>
    <label class="check"><input type="checkbox" name="shuffle" checked> Trộn thứ tự câu hỏi</label>
    <h3 style="margin-top:12px">Câu hỏi đã thêm: <span data-count>0</span></h3><ol data-picked class="small"></ol>
    <details open><summary class="small">Thêm câu trắc nghiệm</summary>
      <label class="field">Câu hỏi<input name="cq"></label>
      <label class="field">Các lựa chọn (mỗi dòng một)<textarea name="copts" rows="3"></textarea></label>
      <label class="field">Đáp án đúng (số thứ tự lựa chọn)<input name="cans" type="number" min="1" max="6"></label>
      <button type="button" class="btn btn-sm" data-addc>Thêm câu</button>
    </details>
    <p class="form-msg err" data-m></p>
    <div class="modal-actions"><button type="button" class="btn" data-close>Hủy</button><button class="btn btn-primary">Tạo bài kiểm tra</button></div></form>`, { cls: "wide" });
  const f = m.el.querySelector("[data-f]");
  const paint = () => { m.el.querySelector("[data-count]").textContent = picked.length; m.el.querySelector("[data-picked]").innerHTML = picked.map((p, i) => `<li>${esc(p.label)} <button type="button" class="btn btn-ghost btn-sm" data-rm="${i}">Xóa</button></li>`).join(""); };
  m.el.querySelector("[data-addc]").addEventListener("click", () => {
    const opts = f.copts.value.split("\n").map((x) => x.trim()).filter(Boolean), ans = Number(f.cans.value) - 1;
    if (!f.cq.value.trim() || opts.length < 2 || !(ans >= 0 && ans < opts.length)) return toast("Câu hỏi cần nội dung, ít nhất 2 lựa chọn và đáp án đúng hợp lệ.", "err");
    picked.push({ type: "mcq", q: f.cq.value.trim(), options: opts, answer: ans, label: f.cq.value.trim(), points: 1 }); f.cq.value = f.copts.value = f.cans.value = ""; paint();
  });
  m.el.querySelector("[data-picked]").addEventListener("click", (e) => { const b = e.target.closest("[data-rm]"); if (b) { picked.splice(Number(b.dataset.rm), 1); paint(); } });
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const iso = (v) => (v ? new Date(v).toISOString() : null);
    try { await api(`/api/classes/${j.class.id}/tests`, "POST", { title: f.title.value, durationMin: Number(f.dur.value), maxAttempts: Number(f.att.value), openAt: iso(f.open.value), dueAt: iso(f.due.value), shuffle: f.shuffle.checked, questions: picked.map(({ label, ...q }) => q) }); m.close(); toast("Đã tạo bài kiểm tra.", "ok"); reload(); }
    catch (err) { m.el.querySelector("[data-m]").textContent = err.message; }
  });
}


function takeTest(main, s, ctx) {
  const total = Math.max(1, s.questions.length);
  let idx = 0;
  const initLeft = Math.max(0, Math.floor((Date.parse(s.endsAt) - Date.now()) / 1000));
  const initTxt = `${String(Math.floor(initLeft / 60)).padStart(2, "0")}:${String(initLeft % 60).padStart(2, "0")}`;
  main.innerHTML = `
    <div class="lx-ex-top-meta cl-test-meta">
      <div class="lx-ex-top-row">
        <span class="lx-ex-pill">BÀI KIỂM TRA</span>
        <span class="lx-ex-cnt" id="clTestCnt">Câu 1/${total}</span>
      </div>
      <div class="lx-ex-prog"><i id="clTestProg" style="width:${Math.round((1 / total) * 100)}%"></i></div>
    </div>
    <div class="cl-m-kpis">
      <div class="cl-m-kpi"><b id="timerKpi">${initTxt}</b><span>Thời gian còn lại</span></div>
      <div class="cl-m-kpi"><b>${total} câu</b><span>Tổng số câu</span></div>
    </div>
    <div class="test-head sheet sheet-pad"><b>${esc(s.test.title)}</b><span class="spacer"></span><span class="timer" id="timer">${initTxt}</span><button class="btn btn-primary btn-sm" id="submitT">Nộp bài</button></div>
    <form id="tf">${s.questions.map((q, i) => `<section class="sheet sheet-pad q-block ${i === 0 ? "is-active" : ""}" data-q-idx="${i}"><p class="kicker">Câu ${i + 1} · ${q.points} điểm</p>
      <p><b>${esc(q.q)}</b></p><div class="cl-test-opts">${q.options.map((o, k) => `<label class="check cl-test-opt"><input type="radio" name="q${q.id}" value="${k}"><span class="lx-opt-let">${String.fromCharCode(65 + k)}</span><span>${esc(o)}</span></label>`).join("")}</div>
    </section>`).join("")}
      <div class="cl-test-m-foot">
        <span class="cl-test-m-note">Bài kiểm tra lớp · Không có trợ giúp AI</span>
        <button type="button" class="btn btn-primary cl-test-m-next" id="clTestNextBtn">${total > 1 ? "Tiếp theo" : "Nộp bài"}</button>
      </div>
    </form>`;
  let done = false;
  const end = Date.parse(s.endsAt);
  const blocks = [...main.querySelectorAll("#tf .q-block")];
  const cntEl = $("#clTestCnt", main);
  const progEl = $("#clTestProg", main);
  const nextBtn = $("#clTestNextBtn", main);
  const syncStep = () => {
    blocks.forEach((b, bi) => b.classList.toggle("is-active", bi === idx));
    if (cntEl) cntEl.textContent = `Câu ${idx + 1}/${total}`;
    if (progEl) progEl.style.width = `${Math.round(((idx + 1) / total) * 100)}%`;
    if (nextBtn) nextBtn.textContent = idx < total - 1 ? "Tiếp theo" : "Nộp bài";
  };
  syncStep();
  const submit = async (auto = false) => {
    if (done) return; done = true;
    const answers = {};
    for (const q of s.questions) { const c = main.querySelector(`input[name="q${q.id}"]:checked`); if (c) answers[q.id] = Number(c.value); }
    try {
      const r = await api(`/api/tests/${s.test.id}/submit`, "POST", { attemptId: s.attemptId, answers });
      clearInterval(tick);
      main.innerHTML = `<div class="sheet sheet-pad" style="max-width:720px"><h1>${auto ? "Hết giờ — đã nộp bài" : "Đã nộp bài"}</h1><p class="lead">Điểm: <b>${r.score}/${r.maxScore}</b></p>
        ${r.detail ? `<ol>${r.detail.map((d) => `<li>${d.correct ? "Đúng" : "Sai"}</li>`).join("")}</ol>` : `<p class="muted">Chi tiết đúng/sai hiện sau hạn nộp của bài kiểm tra.</p>`}</div>`;
    } catch (e) { done = false; toast(e.message, "err"); }
  };
  const confirmSubmit = async () => {
    if (await confirmBox("Nộp bài?", "Sau khi nộp không sửa được.", "Nộp bài")) submit();
  };
  nextBtn?.addEventListener("click", () => {
    if (idx < total - 1) {
      idx += 1;
      syncStep();
    } else {
      confirmSubmit();
    }
  });
  const tick = setInterval(() => {
    const left = Math.max(0, Math.floor((end - Date.now()) / 1000));
    const el = document.getElementById("timer"); if (!el) return clearInterval(tick);
    const txt = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
    el.textContent = txt;
    const kpiEl = document.getElementById("timerKpi");
    if (kpiEl) kpiEl.textContent = txt;
    el.classList.toggle("warn", left < 60);
    if (!left) submit(true);
  }, 1000);
  ctx.onLeave(() => clearInterval(tick));
  $("#submitT", main).addEventListener("click", confirmSubmit);
}

/* =================== TEACHER: ASSIGNMENTS & PROGRESS ROUTES =================== */
export async function pageTeacherAssignments(main, _p, query, ctx) {
  ctx.setCrumbs([["Giáo viên", "/app/giao-vien"], ["Bài tập và bài kiểm tra"]]);
  main.innerHTML = `<div class="skel" style="height:260px"></div>`;
  let j;
  try { j = await api("/api/teacher/overview"); } catch (e) { main.innerHTML = empty("Trang dành cho giáo viên", e.message, `<a class="btn btn-primary" href="/app/bang-gia?goi=teacher">Xem gói Teacher</a>`); return; }
  if (!ctx.isCurrent()) return;
  const classes = Array.isArray(j.classes) ? j.classes : [];
  if (!classes.length) {
    main.innerHTML = `<div class="page-head"><div><h1>Bài tập và bài kiểm tra</h1><p>Giao bài tập và tạo đề kiểm tra cho lớp học.</p></div></div>
      ${empty("Chưa có lớp nào", "Hãy tạo lớp đầu tiên trong trang Giáo viên trước khi giao bài hoặc tạo kiểm tra.", '<a class="btn btn-primary" href="/app/giao-vien">Về trang Giáo viên</a>')}`;
    return;
  }
  const activeCls = classes.find((c) => String(c.id) === String(query.lop)) || classes[0];
  const activeTab = query.tab === "kiem-tra" ? "kiem-tra" : "bai-tap";
  main.innerHTML = `
    <div class="page-head">
      <div><h1>Bài tập và bài kiểm tra</h1><p>${esc(activeCls.name)} · Mã lớp <code class="join-code">${esc(activeCls.joinCode)}</code></p></div>
      <a class="btn" href="/app/giao-vien/lop/${activeCls.id}?tab=${activeTab}">Mở trang lớp</a>
    </div>
    ${classes.length > 1 ? `<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:12px">${classes.map((c) => `<a class="btn btn-sm${c.id === activeCls.id ? " btn-primary" : ""}" href="/app/giao-vien/bai-tap?lop=${c.id}&tab=${activeTab}">${esc(c.name)}</a>`).join("")}</div>` : ""}
    <nav class="tabs">
      <a href="/app/giao-vien/bai-tap?lop=${activeCls.id}&tab=bai-tap" class="${activeTab === "bai-tap" ? "on" : ""}">Bài tập</a>
      <a href="/app/giao-vien/bai-tap?lop=${activeCls.id}&tab=kiem-tra" class="${activeTab === "kiem-tra" ? "on" : ""}">Bài kiểm tra</a>
    </nav>
    <div id="tcAsgHost"><div class="skel" style="height:180px"></div></div>`;
  let clsJson;
  try { clsJson = await api(`/api/classes/${activeCls.id}`); } catch (e) { $("#tcAsgHost", main).innerHTML = empty("Không tải được dữ liệu lớp", e.message); return; }
  if (!ctx.isCurrent()) return;
  const host = $("#tcAsgHost", main);
  const reload = () => pageTeacherAssignments(main, [], { lop: String(activeCls.id), tab: activeTab }, ctx);
  if (activeTab === "kiem-tra") await testsTab(host, clsJson, reload);
  else await assignmentsTab(host, clsJson, reload);
}

export async function pageTeacherProgress(main, _p, query, ctx) {
  ctx.setCrumbs([["Giáo viên", "/app/giao-vien"], ["Chấm và theo dõi tiến độ"]]);
  main.innerHTML = `<div class="skel" style="height:260px"></div>`;
  let j;
  try { j = await api("/api/teacher/overview"); } catch (e) { main.innerHTML = empty("Trang dành cho giáo viên", e.message, `<a class="btn btn-primary" href="/app/bang-gia?goi=teacher">Xem gói Teacher</a>`); return; }
  if (!ctx.isCurrent()) return;
  const classes = Array.isArray(j.classes) ? j.classes : [];
  if (!classes.length) {
    main.innerHTML = `<div class="page-head"><div><h1>Chấm và theo dõi tiến độ</h1><p>Theo dõi mức hoàn thành, điểm số và học viên cần hỗ trợ.</p></div></div>
      ${empty("Chưa có lớp nào", "Khi có lớp và bài giao, báo cáo tiến độ học viên sẽ hiện tại đây.", '<a class="btn btn-primary" href="/app/giao-vien">Về trang Giáo viên</a>')}`;
    return;
  }
  const activeCls = classes.find((c) => String(c.id) === String(query.lop)) || classes[0];
  const needSupport = Array.isArray(j.needSupport) ? j.needSupport : [];
  main.innerHTML = `
    <div class="page-head">
      <div><h1>Chấm và theo dõi tiến độ</h1><p>${esc(activeCls.name)} · Mã lớp <code class="join-code">${esc(activeCls.joinCode)}</code></p></div>
      <a class="btn" href="/app/giao-vien/lop/${activeCls.id}?tab=bao-cao">Mở trang lớp</a>
    </div>
    ${classes.length > 1 ? `<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:12px">${classes.map((c) => `<a class="btn btn-sm${c.id === activeCls.id ? " btn-primary" : ""}" href="/app/giao-vien/tien-do?lop=${c.id}">${esc(c.name)}</a>`).join("")}</div>` : ""}
    <div id="tcProgHost"><div class="skel" style="height:200px"></div></div>
    ${needSupport.length ? `<section class="sheet sheet-pad" style="margin-top:16px"><h2>Học sinh cần hỗ trợ</h2><ul class="list">${needSupport.map((s) => `<li><a class="list-row" href="/app/giao-vien/lop/${s.classId}?tab=bao-cao"><span class="t"><b>${esc(s.displayName)}</b><span>${esc(s.className)} · hoàn thành ${s.completion}%${s.avgScore != null ? ` · điểm TB ${s.avgScore}` : ""}${s.missing ? ` · ${s.missing} bài quá hạn` : ""}</span></span></a></li>`).join("")}</ul></section>` : ""}`;
  let clsJson;
  try { clsJson = await api(`/api/classes/${activeCls.id}`); } catch (e) { $("#tcProgHost", main).innerHTML = empty("Không tải được báo cáo lớp", e.message); return; }
  if (!ctx.isCurrent()) return;
  await reportTab($("#tcProgHost", main), clsJson);
}
