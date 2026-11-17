/* LifeRivo 3.5 — Classrooms: teachers create classes, add students, attach licenses; students join via class code. */
import { setAppHash } from "./core.js";
import { S, api, esc, icon, fmtDate, toast, confirmBox, promptBox } from "./core.js";
import { t, tf } from "./i18n.js";

export async function pageClasses(main, params, _q, ctx) {
  const id = params[0] ? Number(params[0]) : null;
  if (id) { await pageClassDetail(main, id, ctx); return; }
  ctx.setCrumbs([[t("nav.classes")]]);
  main.innerHTML = `<div class="skel" style="height:260px"></div>`;
  let j;
  try { j = await api("/api/classes/me"); } catch (e) { main.innerHTML = `<div class="sheet empty"><b>${t("cl.load-fail")}</b>${esc(e.message)}</div>`; return; }
  if (!ctx.isCurrent()) return;
  const classes = j.classes || [];
  const staff = S.me.role === "teacher" || S.me.role === "admin";
  main.innerHTML = `
    <div class="page-head"><div><h1>${t("nav.classes")}</h1><p>${staff ? t("cl.teacher-lead") : t("cl.student-lead")}</p></div>
      ${staff ? `<button class="btn btn-primary" id="newCls">${icon("plus")}${t("cl.create")}</button>` : `<button class="btn btn-primary" id="joinCls">${t("cl.join")}</button>`}</div>
    ${classes.length ? classes.map((c) => `
      <a class="sheet sheet-pad card-link" href="/app/lop-hoc/${c.id}" style="margin-bottom:12px;display:block">
        <div class="sec-head"><div><h2>${esc(c.name)}</h2><p>${t("cl.teacher")}: ${esc(c.teacherDisplay || c.teacherUsername || "")} · ${tf("cl.members-n", { n: c.memberCount })} · ${c.status === "active" ? t("cl.active") : t("cl.archived")}${c.licenseName ? ` · ${t("cl.lic")}: ${esc(c.licenseName)}` : " · " + t("cl.no-lic")}</p></div><span class="tag">${esc(c.code)}</span></div>
        ${c.description ? `<p class="small muted">${esc(c.description)}</p>` : ""}
      </a>`).join("") : `<div class="sheet sheet-pad empty"><b>${staff ? t("cl.no-classes-t") : t("cl.no-classes-s")}</b>${staff ? t("cl.no-classes-t-sub") : t("cl.no-classes-s-sub")}</div>`}`;
  const newBtn = main.querySelector("#newCls");
  if (newBtn) newBtn.addEventListener("click", async () => {
    let lics = [];
    try { lics = (await api("/api/billing/licenses/me")).licenses.filter((l) => l.status === "active"); } catch {}
    const name = await promptBox(t("cl.create-title"), t("cl.create-sub"), { label: t("cl.name"), validate: (v) => (v.trim().length >= 2 ? "" : t("cl.min-2")) });
    if (!name) return;
    try {
      const r = await api("/api/classes", "POST", { name: name.trim(), licenseId: lics.length ? lics[0].id : null });
      toast(tf("cl.created-code", { code: r.class.code }), "ok", 5000);
      setAppHash(`/app/lop-hoc/${r.class.id}`)
    } catch (e) { toast(e.message, "err"); }
  });
  const joinBtn = main.querySelector("#joinCls");
  if (joinBtn) joinBtn.addEventListener("click", async () => {
    const code = await promptBox(t("cl.join"), t("cl.join-sub"), { label: t("cl.code"), validate: (v) => (v.trim().length >= 4 ? "" : t("cl.enter-code")) });
    if (!code) return;
    try { const r = await api("/api/classes/join", "POST", { code: code.trim() }); toast(r.entitlementError ? tf("cl.joined-no-pro", { err: r.entitlementError }) : t("cl.joined"), r.entitlementError ? "info" : "ok", 5000); pageClasses(main, params, _q, ctx); }
    catch (e) { toast(e.message, "err"); }
  });
}

async function pageClassDetail(main, id, ctx) {
  ctx.setCrumbs([[t("nav.classes"), "/app/lop-hoc"], [t("cl.detail")]]);
  main.innerHTML = `<div class="skel" style="height:260px"></div>`;
  let j;
  try { j = await api(`/api/classes/${id}`); } catch (e) { main.innerHTML = `<div class="sheet empty"><b>${t("cl.open-fail")}</b>${esc(e.message)}</div>`; return; }
  if (!ctx.isCurrent()) return;
  const c = j.class, members = j.members || [];
  const staff = S.me.role === "admin" || (S.me.role === "teacher" && c.teacherId === S.me.id);
  main.innerHTML = `
    <div class="page-head"><div><h1>${esc(c.name)}</h1><p>${t("cl.teacher")}: ${esc(c.teacherDisplay || c.teacherUsername || "")} · ${t("cl.code")}: <b>${esc(c.code)}</b> · ${c.status === "active" ? t("cl.active") : t("cl.archived")}${c.licenseName ? ` · ${t("cl.lic")}: ${esc(c.licenseName)} (${t("pr.expires")} ${fmtDate(c.licenseExpiresAt, false)})` : " · " + t("cl.no-lic")}</p>${c.description ? `<p class="small muted">${esc(c.description)}</p>` : ""}</div>
      ${staff ? `<div class="row"><button class="btn" id="addMem">${t("cl.add-student")}</button><button class="btn" id="licBtn">${c.licenseId ? t("cl.unlink-lic") : t("cl.link-lic")}</button><button class="btn btn-ghost" id="archBtn">${c.status === "active" ? t("cl.archive") : t("cl.restore")}</button></div>` : ""}</div>
    <section class="sheet sheet-pad"><h2>${t("cl.students")} (${members.length})</h2>
      ${staff ? (members.length ? `<div class="table-wrap" style="border:0"><table><thead><tr><th>${t("cl.student")}</th><th>${t("cl.joined-at")}</th><th></th></tr></thead><tbody>
        ${members.map((m) => `<tr><td><b>${esc(m.displayName)}</b><br><span class="small muted">@${esc(m.username)}</span></td><td class="small nowrap">${fmtDate(m.joinedAt, false)}</td><td class="num"><button class="btn btn-sm btn-ghost" data-rm="${m.userId}" data-name="${esc(m.username)}">${t("cl.remove")}</button></td></tr>`).join("")}</tbody></table></div>`
      : `<p class="muted">${t("cl.no-students")} <b>${esc(c.code)}</b> ${t("cl.no-students-2")}</p>`) : `<p class="muted">${t("cl.you-joined")} ${c.licenseName ? t("cl.you-pro") : t("cl.no-auto-pro")}</p>`}
    </section>`;
  if (!staff) return;
  main.querySelector("#addMem").addEventListener("click", async () => {
    const username = await promptBox(t("cl.add-title"), t("cl.add-sub"), { label: t("cl.username"), validate: (v) => (v.trim().length >= 3 ? "" : t("cl.min-3")) });
    if (!username) return;
    try { const r = await api(`/api/classes/${id}/members`, "POST", { username: username.trim() }); toast(r.entitlementError ? tf("cl.added-no-pro", { err: r.entitlementError }) : t("cl.added"), r.entitlementError ? "info" : "ok", 5000); pageClassDetail(main, id, ctx); }
    catch (e) { toast(e.message, "err"); }
  });
  main.querySelectorAll("[data-rm]").forEach((b) => b.addEventListener("click", async () => {
    if (!(await confirmBox(t("cl.remove-q"), tf("cl.remove-warn", { name: b.dataset.name }), t("cl.remove")))) return;
    try { await api(`/api/classes/${id}/members/${b.dataset.rm}`, "DELETE", {}); toast(t("cl.removed"), "ok"); pageClassDetail(main, id, ctx); }
    catch (e) { toast(e.message, "err"); }
  }));
  main.querySelector("#licBtn").addEventListener("click", async () => {
    if (c.licenseId) {
      if (!(await confirmBox(t("cl.unlink-q"), t("cl.unlink-warn"), t("cl.unlink-lic")))) return;
      try { await api(`/api/classes/${id}/license`, "POST", { licenseId: null }); toast(t("cl.unlinked"), "ok"); pageClassDetail(main, id, ctx); } catch (e) { toast(e.message, "err"); }
      return;
    }
    let lics = [];
    try { lics = (await api("/api/billing/licenses/me")).licenses.filter((l) => l.status === "active"); } catch {}
    if (!lics.length) { toast(t("cl.no-active-lic"), "info"); return; }
    try {
      const r = await api(`/api/classes/${id}/license`, "POST", { licenseId: lics[0].id });
      toast(r.failed.length ? tf("cl.linked-partial", { ok: r.granted.length, fail: r.failed.length }) : t("cl.linked"), r.failed.length ? "info" : "ok", 5000);
      pageClassDetail(main, id, ctx);
    } catch (e) { toast(e.message, "err"); }
  });
  main.querySelector("#archBtn").addEventListener("click", async () => {
    const act = c.status === "active" ? "archive" : "restore";
    if (act === "archive" && !(await confirmBox(t("cl.archive-q"), t("cl.archive-warn"), t("cl.archive")))) return;
    try { await api(`/api/classes/${id}/${act}`, "POST", {}); toast(act === "archive" ? t("cl.archived-ok") : t("cl.restored-ok"), "ok"); pageClassDetail(main, id, ctx); }
    catch (e) { toast(e.message, "err"); }
  });
}
