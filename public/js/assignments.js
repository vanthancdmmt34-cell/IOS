/* Python Lab 3.6 — Assigned exercises: teachers assign by class / by student, manual grading, reports, file export. */
import { S, api, esc, icon, fmtDate, toast, confirmBox, promptBox } from "./core.js";
import { t, tf } from "./i18n.js";

const statusLabel = (s) => s === "graded" ? t("as.graded") : s === "submitted" ? t("as.submitted") : t("as.not-submitted");

export async function pageAssignments(main, params, _q, ctx) {
  const id = params[0] ? Number(params[0]) : null;
  if (id) { await pageAssignmentDetail(main, id, ctx); return; }
  ctx.setCrumbs([[t("nav.assignments")]]);
  main.innerHTML = `<div class="skel" style="height:260px"></div>`;
  let j;
  try { j = await api("/api/assignments/me"); } catch (e) { main.innerHTML = `<div class="sheet empty"><b>${t("as.load-fail")}</b>${esc(e.message)}</div>`; return; }
  if (!ctx.isCurrent()) return;
  const list = j.assignments || [];
  const staff = S.me.role === "teacher" || S.me.role === "admin";
  main.innerHTML = `
    <div class="page-head"><div><h1>${t("nav.assignments")}</h1><p>${staff ? t("as.teacher-lead") : t("as.student-lead")}</p></div>
      ${staff ? `<button class="btn btn-primary" id="newAsn">${icon("plus")}${t("as.new")}</button>` : ""}</div>
    ${list.length ? list.map((a) => `
      <a class="sheet sheet-pad card-link" href="#/bai-tap-giao/${a.id}" style="margin-bottom:12px;display:block">
        <div class="sec-head"><div><h2>${esc(a.title)}</h2><p>${a.targetType === "class" ? `${t("as.class")}: ${esc(a.className || "")}` : t("as.individual")}${a.exerciseId ? ` · ${t("as.built-in")}: ${esc(a.exerciseId)}` : " · " + t("as.custom")}${a.dueAt ? ` · ${t("as.due")}: ${fmtDate(a.dueAt, false)}` : " · " + t("as.no-due")} · ${t("as.scale")} ${a.maxScore} ${t("as.points")}</p></div></div>
        ${a.description ? `<p class="small muted">${esc(a.description)}</p>` : ""}
      </a>`).join("") : `<div class="sheet sheet-pad empty"><b>${staff ? t("as.none-t") : t("as.none-s")}</b></div>`}`;
  const btn = main.querySelector("#newAsn");
  if (btn) btn.addEventListener("click", async () => {
    const title = await promptBox(t("as.new"), t("as.title-sub"), { label: t("as.title"), validate: (v) => (v.trim().length >= 2 ? "" : t("cl.min-2")) });
    if (!title) return;
    const exerciseId = await promptBox(t("as.builtin-title"), t("as.builtin-sub"), { label: t("as.builtin-id") });
    if (exerciseId === null) return;
    try {
      const classes = (await api("/api/classes/me")).classes.filter((c) => c.status === "active");
      const classId = classes.length ? classes[0].id : null;
      if (!classId) { toast(t("as.need-class"), "info"); return; }
      const r = await api("/api/assignments", "POST", { title: title.trim(), targetType: "class", classId, exerciseId: exerciseId.trim() || null, maxScore: 10 });
      toast(t("as.assigned"), "ok"); location.hash = `#/bai-tap-giao/${r.assignment.id}`
    } catch (e) { toast(e.message, "err"); }
  });
}

async function pageAssignmentDetail(main, id, ctx) {
  ctx.setCrumbs([[t("nav.assignments"), "#/bai-tap-giao"], [t("as.detail")]]);
  main.innerHTML = `<div class="skel" style="height:260px"></div>`;
  let j;
  try { j = await api(`/api/assignments/${id}`); } catch (e) { main.innerHTML = `<div class="sheet empty"><b>${t("as.open-fail")}</b>${esc(e.message)}</div>`; return; }
  if (!ctx.isCurrent()) return;
  const a = j.assignment, rep = j.report;
  const rubric = j.rubric || [];
  const staff = S.me.role === "admin" || a.teacherId === S.me.id;
  const mine = rep.rows.find((r) => r.studentId === S.me.id);
  const rubricHtml = rubric.length ? `<ul>${rubric.map((c) => `<li>${esc(c.title)} — ${t("as.max")} ${c.maxScore} ${t("as.points")}</li>`).join("")}</ul><p class="small muted">${tf("as.rubric-total", { sum: rubric.reduce((s, c) => s + c.maxScore, 0), max: a.maxScore })}</p>` : `<p class="small muted">${t("as.no-rubric")}</p>`;
  main.innerHTML = `
    <div class="page-head"><div><h1>${esc(a.title)}</h1><p>${a.targetType === "class" ? `${t("as.class")}: ${esc(a.className || "")}` : t("as.individual")}${a.exerciseId ? ` · ${t("as.built-in")}: ${esc(a.exerciseId)} (${t("as.auto-score")})` : " · " + t("as.custom")}${a.dueAt ? ` · ${t("as.due")}: ${fmtDate(a.dueAt, false)}` : ""} · ${t("as.scale")} ${a.maxScore} ${t("as.points")}</p>${a.description ? `<p>${esc(a.description)}</p>` : ""}</div>
      ${staff ? `<div class="row"><a class="btn" href="/api/assignments/${a.id}/export?format=csv">${t("as.export-csv")}</a><a class="btn" href="/api/assignments/${a.id}/export?format=xlsx">${t("as.export-xlsx")}</a></div>` : ""}</div>
    ${staff ? `<section class="sheet sheet-pad" style="margin-bottom:16px"><div class="sec-head"><h2>${t("as.rubric")}</h2><button class="btn btn-sm" id="rubricBtn">${t("as.set-rubric")}</button></div>${rubricHtml}</section>` : ""}
    ${!staff && rubric.length ? `<section class="sheet sheet-pad" style="margin-bottom:16px"><h2>${t("as.rubric-this")}</h2>${rubricHtml}</section>` : ""}
    ${!staff && mine ? `<section class="sheet sheet-pad" style="margin-bottom:16px"><h2>${t("as.your-sub")}</h2><p>${t("pg.status")}: <b>${statusLabel(mine.status)}</b>${mine.score !== null ? ` · ${t("as.score")}: <b>${mine.score}/${a.maxScore}</b>` : ""}${mine.late ? " · <b>" + t("as.late") + "</b>" : ""}${mine.overdue ? " · <b>" + t("as.overdue") + "</b>" : ""}</p>${(mine.rubricScores || []).length ? `<p class="small">${t("as.by-criteria")}: ${(mine.rubricScores || []).map((x) => `${esc(x.title)} ${x.score === null ? "—" : x.score}/${x.maxScore}`).join(" · ")}</p>` : ""}${mine.comment ? `<p>${t("as.teacher-comment")}: ${esc(mine.comment)}</p>` : ""}
      ${!a.exerciseId && mine.status !== "graded" ? `<button class="btn btn-primary" id="submitBtn">${t("as.submit-answer")}</button>` : ""}</section>` : ""}
    ${staff ? `<section class="sheet sheet-pad"><h2>${tf("as.report", { sub: rep.summary.submitted, total: rep.summary.total, graded: rep.summary.graded, avg: rep.summary.avgScore !== null ? tf("as.avg", { avg: rep.summary.avgScore }) : "" })}</h2>
      <div class="table-wrap" style="border:0"><table><thead><tr><th>${t("cl.student")}</th><th>${t("pg.status")}</th><th>${t("as.score")}</th><th>${t("as.submitted-at")}</th><th>${t("as.comment")}</th><th></th></tr></thead><tbody>
      ${rep.rows.map((r) => `<tr><td><b>${esc(r.displayName)}</b><br><span class="small muted">@${esc(r.username)}</span></td><td>${statusLabel(r.status)}${r.late ? " · " + t("as.late-short") : ""}${r.overdue ? " · " + t("as.overdue-short") : ""}</td><td>${r.score !== null ? `${r.score}/${a.maxScore}` : "—"}${(r.rubricScores || []).length ? `<br><span class="small muted">${r.rubricScores.map((x) => `${esc(x.title)} ${x.score === null ? "—" : x.score}/${x.maxScore}`).join(" · ")}</span>` : ""}</td><td class="small nowrap">${r.submittedAt ? fmtDate(r.submittedAt, false) : "—"}</td><td class="small">${esc(r.comment)}</td><td><button class="btn btn-sm btn-primary" data-grade="${r.studentId}" data-name="${esc(r.username)}">${t("as.grade")}</button></td></tr>`).join("")}</tbody></table></div></section>` : ""}`;
  const rubricBtn = main.querySelector("#rubricBtn");
  if (rubricBtn) rubricBtn.addEventListener("click", async () => {
    const text = await promptBox(t("as.set-rubric"), tf("as.rubric-sub", { max: a.maxScore }), { label: t("as.criteria"), validate: (v) => (v.trim().length >= 2 ? "" : t("as.criteria-min")) });
    if (!text) return;
    const criteria = [];
    for (const line of text.split("\n")) {
      const [title, max] = line.split("|").map((x) => x.trim());
      if (!title) continue;
      const maxScore = Number(max);
      if (!Number.isFinite(maxScore) || maxScore <= 0) { toast(tf("as.line-no-max", { line }), "err"); return; }
      criteria.push({ title, maxScore });
    }
    if (!criteria.length) { toast(t("as.no-valid-criteria"), "err"); return; }
    try { await api(`/api/assignments/${id}/rubric`, "POST", { criteria }); toast(t("as.rubric-saved"), "ok"); pageAssignmentDetail(main, id, ctx); }
    catch (e) { toast(e.message, "err"); }
  });
  const subBtn = main.querySelector("#submitBtn");
  if (subBtn) subBtn.addEventListener("click", async () => {
    const answer = await promptBox(t("as.submit-answer"), t("as.answer-sub"), { label: t("as.answer"), validate: (v) => (v.trim().length >= 1 ? "" : t("as.answer-min")) });
    if (!answer) return;
    try { await api(`/api/assignments/${id}/submit`, "POST", { answer }); toast(t("as.submitted-ok"), "ok"); pageAssignmentDetail(main, id, ctx); }
    catch (e) { toast(e.message, "err"); }
  });
  main.querySelectorAll("[data-grade]").forEach((b) => b.addEventListener("click", async () => {
    let rubricScores = null;
    let manualScore = null;
    if (rubric.length) {
      rubricScores = [];
      for (const c of rubric) {
        const v = await promptBox(tf("as.grade-for", { name: b.dataset.name, title: c.title }), tf("as.enter-score-range", { max: c.maxScore }), { label: `${c.title} (${t("as.max")} ${c.maxScore})` });
        if (v === null) return;
        const n = Number(v);
        if (!Number.isFinite(n) || n < 0 || n > c.maxScore) { toast(tf("as.criteria-range", { title: c.title, max: c.maxScore }), "err"); return; }
        rubricScores.push({ criterionId: c.id, score: n });
      }
      const total = rubricScores.reduce((s, x) => s + x.score, 0);
      const ok = await confirmBox(tf("as.grade-for-name", { name: b.dataset.name }), tf("as.rubric-total-confirm", { total, max: a.maxScore }));
      if (!ok) return;
    } else {
      const score = await promptBox(tf("as.grade-for-name", { name: b.dataset.name }), tf("as.enter-score-range-blank", { max: a.maxScore }), { label: t("as.score") });
      if (score === null) return;
      manualScore = score.trim() === "" ? null : Number(score);
    }
    const comment = await promptBox(t("as.comment"), t("as.comment-sub"), { label: t("as.comment") });
    if (comment === null) return;
    try { await api(`/api/assignments/${id}/grade`, "POST", rubricScores ? { studentId: Number(b.dataset.grade), rubricScores, comment: comment.trim() } : { studentId: Number(b.dataset.grade), manualScore, comment: comment.trim() }); toast(t("as.graded-ok"), "ok"); pageAssignmentDetail(main, id, ctx); }
    catch (e) { toast(e.message, "err"); }
  }));
}
