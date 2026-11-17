/* LifeRivo 3.4 - Teacher license: view own license, grant/revoke student Pro seats. */
import {  } from "./core.js";
import { S, api, esc, icon, fmtN, fmtDate, toast, confirmBox, promptBox, $ } from "./core.js";
import { t, tf } from "./i18n.js";

const vnd = (n) => fmtN(n) + "đ";

export async function pageLicenses(main, _p, _q, ctx) {
  if (S.me.role !== "teacher" && S.me.role !== "admin") {
    main.innerHTML = `<div class="sheet empty"><b>${t("lc.teachers-only")}</b>${t("lc.teachers-only-sub")}</div>`;
    return;
  }
  ctx.setCrumbs([[t("nav.licenses")]]);
  main.innerHTML = `<div class="skel" style="height:260px"></div>`;
  let j;
  try { j = await api("/api/billing/licenses/me"); } catch (e) { main.innerHTML = `<div class="sheet empty"><b>${t("lc.load-fail")}</b>${esc(e.message)}</div>`; return; }
  if (!ctx.isCurrent()) return;
  const lics = j.licenses || [];
  main.innerHTML = `
    <div class="page-head"><div><h1>${t("nav.licenses")}</h1><p>${t("lc.lead")}</p></div>
      <a class="btn btn-primary" href="/app/bang-gia">${icon("star")}${t("lc.buy-renew")}</a></div>
    ${lics.length ? lics.map((l) => `
      <section class="sheet sheet-pad" style="margin-bottom:16px">
        <div class="sec-head"><div><h2>${esc(l.planName)}</h2><p>${l.status === "active" ? `<span class="tag tag-la">${t("lc.active")}</span>` : l.status === "expired" ? `<span class="tag tag-line">${t("lc.expired")}</span>` : `<span class="tag tag-do">${t("lc.revoked")}</span>`} · ${t("pr.expires")} ${fmtDate(l.expiresAt, false)} · ${tf("lc.seats-used", { used: l.seatsUsed, total: l.seatsTotal })}</p></div>
        ${l.status === "active" ? `<button class="btn btn-primary" data-grant="${l.id}">${t("lc.grant")}</button>` : ""}</div>
        ${l.students.length ? `<div class="table-wrap" style="border:0"><table><thead><tr><th>${t("cl.student")}</th><th>${t("lc.granted-from")}</th><th>${t("pr.expires")}</th><th></th></tr></thead><tbody>
          ${l.students.map((s) => `<tr><td><b>${esc(s.displayName)}</b><br><span class="small muted">@${esc(s.username)}</span></td><td class="small nowrap">${fmtDate(s.startsAt, false)}</td><td class="small nowrap">${fmtDate(s.expiresAt, false)}</td><td class="num"><button class="btn btn-sm btn-ghost" data-rev="${l.id}" data-ent="${s.entitlementId}" data-name="${esc(s.username)}">${t("lc.revoke")}</button></td></tr>`).join("")}</tbody></table></div>`
        : `<p class="muted">${t("lc.none-granted")}</p>`}
      </section>`).join("") : `<div class="sheet sheet-pad empty"><b>${t("lc.none")}</b>${t("lc.none-sub")}</div>`}
    <p class="small muted">${t("lc.class-note")}</p>`;
  main.querySelectorAll("[data-grant]").forEach((b) => b.addEventListener("click", async () => {
    const username = await promptBox(t("lc.grant"), t("lc.grant-sub"), { label: t("cl.username"), validate: (v) => (v.trim().length >= 3 ? "" : t("cl.min-3")) });
    if (!username) return;
    try { await api(`/api/billing/licenses/${b.dataset.grant}/students`, "POST", { username: username.trim() }); toast(tf("lc.granted", { name: username.trim() }), "ok"); pageLicenses(main, _p, _q, ctx); }
    catch (e) { toast(e.message, "err", 5000); }
  }));
  main.querySelectorAll("[data-rev]").forEach((b) => b.addEventListener("click", async () => {
    if (!(await confirmBox(t("lc.revoke-q"), tf("lc.revoke-warn", { name: b.dataset.name }), t("lc.revoke")))) return;
    try { await api(`/api/billing/licenses/${b.dataset.rev}/revoke-student`, "POST", { entitlementId: Number(b.dataset.ent), note: t("lc.revoked-by-teacher") }); toast(t("lc.revoked-ok"), "ok"); pageLicenses(main, _p, _q, ctx); }
    catch (e) { toast(e.message, "err"); }
  }));
}
