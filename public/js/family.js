/* LifeRivo 4.0 - Family plan: plan owner manages members, members accept invites and choose whether to share progress. */
import {  } from "./core.js";
import { S, api, esc, icon, fmtN, fmtDate, timeAgo, toast, openModal, confirmBox, $ } from "./core.js";

export async function pageFamily(main, _p, _q, ctx) {
  ctx.setCrumbs([["Lớp học", "/app/lop"], ["Gia đình / phụ huynh"]]);
  main.innerHTML = `<div class="skel" style="height:260px"></div>`;
  const j = await api("/api/family");
  if (!ctx.isCurrent()) return;
  const g = j.group;
  const invites = j.memberships.filter((x) => x.status === "invited");
  const mine = j.memberships.find((x) => x.status === "active" && !x.isOwner);
  const ST = { invited: ["Đã mời, chờ đồng ý", "tag-cam"], active: ["Đang học", "tag-la"] };
  const featMember = (g && g.members && g.members[0]) || mine || { displayName: S.me ? S.me.displayName : "Học viên", username: S.me ? S.me.username : "user", status: "active" };
  main.innerHTML = `
    <div class="fam-m-head">
      <h1>Theo dõi hành trình học</h1>
      <p>Kết nối với học viên trong gia đình.</p>
    </div>
    <div class="sheet sheet-pad fam-m-card">
      <div class="fam-m-member">
        <img class="fam-m-av" src="/img/kit/chibi-cat.webp" alt="" width="64" height="64" />
        <div class="fam-m-info">
          <b>${esc(featMember.displayName || featMember.ownerName || "Học viên")}</b>
          <span>@${esc(featMember.username || featMember.ownerUsername || "liferivo")} · Học viên</span>
        </div>
        <span class="lx-ex-pill">Đang học</span>
      </div>
      <div class="cl-m-kpis" style="margin-top:12px">
        <div class="cl-m-kpi"><b>${g ? fmtN(g.members.filter((m) => m.status === "active").length) : mine ? "1" : "0"}</b><span>Thành viên đang học</span></div>
        <div class="cl-m-kpi"><b>${g ? `${g.seats} chỗ` : "Family"}</b><span>Quyền lợi nhóm</span></div>
      </div>
    </div>
    <div class="page-head"><div><h1>Gói Family</h1><p>Mỗi thành viên có tài khoản và tiến độ riêng, đều được quyền Pro. Chủ gói chỉ xem tiến độ của người đã bật chia sẻ, không bao giờ thấy mật khẩu hay mã đăng nhập của thành viên.</p></div></div>
    ${invites.map((x) => `<section class="sheet sheet-pad invite-card"><b>${esc(x.ownerName)} (@${esc(x.ownerUsername)}) mời bạn vào gói Family</b><p class="small muted">Bạn sẽ có quyền Pro đến ${fmtDate(x.expiresAt, false)}.</p>
      <label class="check"><input type="checkbox" data-share="${x.groupId}" checked> Cho chủ gói xem tiến độ học của tôi (điểm, số bài đã làm, ngày học)</label>
      <div class="row" style="margin-top:8px"><button class="btn btn-primary btn-sm" data-accept="${x.groupId}">Đồng ý tham gia</button><button class="btn btn-ghost btn-sm" data-decline="${x.groupId}">Từ chối</button></div></section>`).join("")}
    ${mine ? `<section class="sheet sheet-pad" style="margin-bottom:14px"><h2>Bạn đang ở gói Family của ${esc(mine.ownerName)}</h2><p class="small muted">Hiệu lực đến ${fmtDate(mine.expiresAt, false)}.</p>
      <label class="switch-row"><input type="checkbox" id="share" ${mine.shareProgress ? "checked" : ""}> Cho chủ gói xem tiến độ học của tôi</label>
      <button class="btn btn-ghost btn-sm" id="leave" style="margin-top:8px">${icon("logout")}Rời gói</button></section>` : ""}
    ${g ? `<section class="sheet sheet-pad">
      <div class="sec-head"><div><h2>Gói của tôi</h2><p>${g.active ? `Hiệu lực đến <b>${fmtDate(g.expiresAt, false)}</b>` : "<b>Đã hết hạn</b>"} · ${g.members.filter((m) => m.status === "active").length + g.members.filter((m) => m.status === "invited").length}/${g.seats} chỗ</p></div><a class="btn btn-sm" href="/app/bang-gia?goi=family">${icon("star")}Gia hạn</a></div>
      <div class="table-wrap" style="border:0"><table><thead><tr><th>Thành viên</th><th>Trạng thái</th><th>Chia sẻ tiến độ</th><th></th></tr></thead><tbody>
        ${g.members.map((m, idx) => `<tr><td><div class="tc-m-stu-cell"><img class="tc-m-stu-av" src="/img/kit/chibi-${["cat", "fox", "bunny", "owl"][idx % 4]}.webp" alt="" width="40" height="40" loading="lazy" /><div><b>${esc(m.displayName)}</b>${m.isOwner ? ` <span class="tag tag-tim">Chủ gói</span>` : ""}<br><span class="small muted">@${esc(m.username)}</span></div></div></td><td><span class="tag ${ST[m.status][1]}">${ST[m.status][0]}</span></td><td>${m.status === "active" ? (m.shareProgress ? "Có" : "Không") : "—"}</td>
          <td class="nowrap">${m.status === "active" && (m.shareProgress || m.isOwner) ? `<button class="btn btn-xs" data-prog="${m.id}">Xem tiến độ</button>` : ""}${m.isOwner ? "" : ` <button class="btn btn-xs btn-ghost" data-rm="${m.id}" data-n="${esc(m.displayName)}">${m.status === "invited" ? "Hủy lời mời" : "Xóa"}</button>`}</td></tr>`).join("")}
      </tbody></table></div>
      ${g.active ? `<form id="inv" class="row" style="gap:8px;margin-top:12px"><label class="field" style="flex:1;min-width:200px;margin:0">Mời thành viên (tên đăng nhập)<input name="u" maxlength="30" placeholder="Thành viên cần tự tạo tài khoản trước" autocomplete="off"></label><button class="btn btn-primary" style="align-self:flex-end">${icon("plus")}Mời</button></form><p class="form-msg err" id="invMsg"></p>` : ""}
    </section>` : !mine && !invites.length ? `<div class="sheet sheet-pad empty"><b>Bạn chưa có gói Family</b>Một gói cho 4 tài khoản, ai cũng có Pro và tiến độ riêng.<div style="margin-top:12px"><a class="btn btn-primary" href="/app/bang-gia?goi=family">${icon("star")}Xem gói Family</a></div></div>` : ""}
    <div class="fam-m-recent">
      <h2>Hoạt động gần đây</h2>
      <a class="cl-m-qrow" href="/app/ngoai-ngu"><span class="cl-m-qico">✓</span><div class="cl-m-qcopy"><b>Tiến độ bài học</b><span>Xem các bài học và cấp độ đang theo học</span></div><span class="cl-m-qarr">›</span></a>
      <a class="cl-m-qrow" href="/app/thong-bao"><span class="cl-m-qico">🔔</span><div class="cl-m-qcopy"><b>Thông báo mới</b><span>Cập nhật thông báo học tập và lớp học</span></div><span class="cl-m-qarr">›</span></a>
    </div>`;

  if (main._famAc) main._famAc.abort();
  const famAc = new AbortController();
  main._famAc = famAc;
  ctx?.onLeave?.(() => famAc.abort());
  main.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-accept],[data-decline],[data-rm],[data-prog],#leave"); if (!b) return;
    try {
      if (b.dataset.accept || b.dataset.decline) {
        const gid = Number(b.dataset.accept || b.dataset.decline);
        await api("/api/family/respond", "POST", { groupId: gid, accept: !!b.dataset.accept, shareProgress: !!main.querySelector(`[data-share="${gid}"]`)?.checked });
        toast(b.dataset.accept ? "Đã tham gia gói Family. Bạn có quyền Pro." : "Đã từ chối lời mời.", "ok"); return pageFamily(main, _p, _q, ctx);
      }
      if (b.dataset.rm) { if (!(await confirmBox(`Xóa ${b.dataset.n} khỏi gói?`, "Thành viên mất quyền Pro từ gói Family (Pro tự mua hoặc từ lớp học vẫn giữ). Dữ liệu học của họ không bị xóa.", "Xóa", true))) return; await api(`/api/family/members/${b.dataset.rm}/remove`, "POST", {}); toast("Đã xóa.", "ok"); return pageFamily(main, _p, _q, ctx); }
      if (b.id === "leave") { if (!(await confirmBox("Rời gói Family?", "Bạn mất quyền Pro từ gói này.", "Rời gói", true))) return; await api("/api/family/leave", "POST", {}); return pageFamily(main, _p, _q, ctx); }
      if (b.dataset.prog) {
        const p = await api(`/api/family/members/${b.dataset.prog}/progress`);
        openModal(`<h2>Tiến độ của ${esc(p.member.displayName)}</h2><div class="stats" style="margin-top:12px"><div><b>${fmtN(p.xp)}</b><span>XP</span></div><div><b>${p.solved}</b><span>Bài đã đạt</span></div><div><b>${p.examsPassed}</b><span>Bài kiểm tra đạt</span></div><div><b>${p.lessonsDone}</b><span>Bài học xong</span></div></div>
          <p>Hoạt động gần nhất: ${p.lastActive ? timeAgo(p.lastActive) : "chưa có"}.</p><p class="small muted">7 ngày qua: ${p.week.map((d) => `${d.d.slice(5)}: ${d.n} lần nộp`).join(" · ") || "chưa học"}.</p>`);
      }
    } catch (err) { toast(err.message, "err"); }
  }, { signal: famAc.signal });
  $("#share", main)?.addEventListener("change", async (e) => { try { await api("/api/family/share", "POST", { on: e.target.checked }); toast("Đã lưu.", "ok"); } catch (err) { toast(err.message, "err"); } });
  $("#inv", main)?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try { await api("/api/family/invite", "POST", { username: e.target.u.value.trim() }); toast("Đã gửi lời mời. Thành viên vào mục Gia đình để đồng ý.", "ok", 4500); pageFamily(main, _p, _q, ctx); }
    catch (err) { $("#invMsg", main).textContent = err.message; }
  });
}
