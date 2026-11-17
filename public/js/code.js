/* 4.10.0 — C, C++, Java programming courses: course page, theory, coding / bug-fix / quiz exercises */
import { S, api, esc, icon, toast, confirmBox, aiOn, aiAuto } from "./core.js";
import { currentLang } from "./i18n.js";
import { mountAiWidget, unmountAiWidget } from "./ai-widget.js";
import { getSubject, setSubject } from "./lang.js";

const EN = () => currentLang() === "en";
const T = (vi, en) => (EN() ? en : vi);
const CM_MODE = { c: "text/x-csrc", cpp: "text/x-c++src", java: "text/x-java" };
export const CODE_IDS = ["c", "cpp", "java"];

let CACHE = null;
export async function loadCode(force = false) {
  if (!CACHE || force) CACHE = await api("/api/code");
  return CACHE;
}
export function resetCodeCache() { CACHE = null; }

function withAi(ctx) {
  mountAiWidget().then(() => document.querySelector(".aiw")?.classList.add("lx-on")).catch(() => {});
  ctx.onLeave(() => { window.__plAiCtx = null; });
}
const scoreTag = (best, pass, attempts) => best >= pass ? `<span class="tag tag-la">✓ ${best}</span>` : attempts || best ? `<span class="tag">${best}</span>` : "";
const runnerOffNote = () => `<div class="pay-warn cx-off">⚠️ ${T("Máy này chưa chấm được C, C++ và Java. Bạn đọc đề được, nhưng nút Chạy và Nộp chưa chạy. Phần trắc nghiệm vẫn làm được.", "This server cannot grade C, C++ or Java yet. You can read the task, but Run and Submit do nothing. Quizzes still work.")}</div>`;

/* ---------- Course page ---------- */
export async function pageCodeCourse(main, [langId, levelId], query, ctx) {
  main.innerHTML = `<div class="skel" style="height:320px"></div>`;
  let d;
  try { d = await loadCode(true); } catch (e) { main.innerHTML = `<div class="sheet empty"><b>${esc(e.message)}</b></div>`; return; }
  if (!ctx.isCurrent()) return;
  const c = d.courses.find((x) => x.id === langId);
  if (!c) { main.innerHTML = `<div class="sheet empty"><b>${T("Không tìm thấy khóa học", "Course not found")}</b></div>`; return; }
  if (getSubject() !== c.id) setSubject(c.id);
  const lv = c.levels.find((l) => l.id === levelId) || c.levels.find((l) => l.pct < 100 && !l.locked) || c.levels[0];
  ctx.setCrumbs([[T("Trang chủ", "Home"), "#/"], [c.name, `#/lap-trinh/${c.id}`], [lv.title]]);
  window.__plAiCtx = { codeItem: `${c.id}-${lv.id}`, isTheory: true, langName: c.name, page: `${c.name} · ${lv.title}` };
  withAi(ctx);
  main.innerHTML = `
  <section class="cx-hero" style="--c:${esc(c.color)}">
    <div><span class="edu-eyebrow">${esc(c.framework)}</span><h1>${c.flag} ${esc(c.name)}</h1><p>${esc(c.desc)}</p>
      <div class="cx-hero-stats"><b>${c.done}/${c.total}</b> ${T("bài đã đạt", "passed")} · ${c.pct}% · <a class="btn btn-sm" href="#/phong-van/${c.id}">${T("Phỏng vấn thử", "Mock interview")}</a> · <button type="button" class="btn btn-sm" id="cxCourseAi">💬 ${T("Hỏi gia sư AI", "Ask AI Tutor")}</button></div></div>
    <div class="cx-hero-native" aria-hidden="true">${esc(c.native)}</div>
  </section>
  ${d.runner && !d.runner.ready ? runnerOffNote() : ""}
  <nav class="cx-levels">${c.levels.map((l) => `<a href="#/lap-trinh/${c.id}/${l.id}" class="${l.id === lv.id ? "on" : ""}"><b>${esc(l.title)}${l.locked ? " 🔒" : ""}</b><span>${l.done}/${l.total} · ${l.pct}%</span><i style="width:${l.pct}%"></i></a>`).join("")}</nav>
  ${lv.locked ? `<div class="sheet sheet-pad lx-pro-card"><div class="lx-pro-ico">🔒</div><h2>${T(`Cấp ${esc(lv.title)} dành cho thành viên Pro`, `${esc(lv.title)} is for Pro members`)}</h2><p>${T("Nâng cấp để mở toàn bộ bài học, bài tập và bài kiểm tra của cấp này.", "Upgrade to unlock every lesson, exercise and test in this level.")}</p><a class="btn btn-primary" href="#/bang-gia">${T("Xem gói Pro", "See Pro plans")}</a></div>` : `
  <div class="cx-units">${lv.units.map((u) => `<section class="sheet cx-unit">
      <div class="cx-unit-head"><b>${T("Bài", "Lesson")} ${u.no}: ${esc(u.title)}</b><a class="btn btn-sm" href="#/lap-trinh/ly-thuyet/${c.id}/${u.id}">📘 ${T("Lý thuyết", "Theory")}</a></div>
      <div class="cx-ex-list">${u.exercises.map((e) => `<a class="cx-ex" href="#/lap-trinh/bai/${e.id}"><span class="cx-ex-ico">${e.icon}</span><span class="t"><b>${esc(e.title)}</b><span>${esc(e.kindTitle)}${e.attempts ? ` · ${e.attempts} ${T("lần nộp", "submissions")}` : ""}</span></span>${scoreTag(e.best, e.pass, e.attempts)}</a>`).join("")}</div>
    </section>`).join("")}
    ${lv.test ? `<a class="lx-test sheet" href="#/lap-trinh/bai/${lv.test.id}"><span class="lx-ex-ico">🏁</span><span class="t"><b>${esc(lv.test.title)}</b><span>${T(`Đạt từ ${lv.test.pass} điểm`, `Pass at ${lv.test.pass}`)}</span></span>${scoreTag(lv.test.best, lv.test.pass, lv.test.attempts)}</a>` : ""}
  </div>`}`;
  main.querySelector("#cxCourseAi")?.addEventListener("click", () => {
    if (window.__plAiAsk) window.__plAiAsk(T(`Tóm tắt lộ trình và những kiến thức trọng tâm cần nắm ở cấp ${lv.title} của khóa ${c.name}.`, `Summarize the learning path and key concepts for ${lv.title} in ${c.name}.`));
  });
}

/* ---------- Theory ---------- */
export async function pageCodeTheory(main, [langId, unitId], query, ctx) {
  main.innerHTML = `<div class="skel" style="height:320px"></div>`;
  let d;
  try { d = await api(`/api/code/theory/${langId}/${unitId}`); } catch (e) { main.innerHTML = `<div class="sheet empty"><b>${esc(e.message)}</b>${e.status === 402 ? `<a class="btn btn-primary" href="#/bang-gia">${T("Xem gói Pro", "See Pro plans")}</a>` : ""}</div>`; return; }
  if (!ctx.isCurrent()) return;
  if (getSubject() !== d.lang) setSubject(d.lang);
  ctx.setCrumbs([[T("Trang chủ", "Home"), "#/"], [d.langName, `#/lap-trinh/${d.lang}`], [d.levelTitle, `#/lap-trinh/${d.lang}/${d.levelId}`], [T("Lý thuyết", "Theory")]]);
  window.__plAiCtx = { codeItem: `${d.lang}-theory-${d.unitId}`, isTheory: true, langName: d.langName, page: `${d.langName} · ${d.title}` };
  withAi(ctx);
  main.innerHTML = `<div class="cx-theory">
    <div class="page-head"><div><span class="edu-eyebrow">${d.flag} ${esc(d.langName)} · ${esc(d.levelTitle)}</span><h1>${T("Bài", "Lesson")} ${d.unitNo}: ${esc(d.title)}</h1></div></div>
    <section class="sheet sheet-pad"><h2>${T("Ý chính", "Key points")}</h2><ul class="cx-points">${d.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>
    <section class="sheet sheet-pad"><h2>${T(`Trong ${esc(d.short)}`, `In ${esc(d.short)}`)}</h2><p>${esc(d.note)}</p><pre class="cx-pre" data-cm="${esc(d.lang)}">${esc(d.example)}</pre>
      <div class="row" style="gap:8px;margin-top:14px;flex-wrap:wrap">
        <button class="btn" type="button" id="cxAskTheory">💬 ${T("Hỏi AI giải thích bài này", "Ask AI to explain this lesson")}</button>
        <button class="btn btn-ghost" type="button" id="cxAskExample">✨ ${T(`Cho thêm ví dụ ${esc(d.short)}`, `Give more ${esc(d.short)} examples`)}</button>
        <button class="btn btn-ghost" type="button" id="cxAskMistakes">⚠️ ${T("Các lỗi biên dịch hay gặp", "Common compile errors")}</button>
      </div>
    </section>
    <section class="sheet sheet-pad"><h2>${T("Luyện tập", "Practice")}</h2><div class="cx-ex-list">${d.exercises.map((e) => `<a class="cx-ex" href="#/lap-trinh/bai/${e.id}"><span class="cx-ex-ico">${e.icon}</span><span class="t"><b>${esc(e.title)}</b><span>${esc(e.kindTitle)}</span></span>${scoreTag(e.best, e.pass)}</a>`).join("")}</div></section>
  </div>`;
  highlight(main);
  main.querySelector("#cxAskTheory")?.addEventListener("click", () => {
    if (window.__plAiAsk) window.__plAiAsk(T(`Giải thích ngắn gọn nội dung và ví dụ của bài ${d.unitNo} (${d.title}) trong ${d.langName} cho người mới học.`, `Explain the key concepts and example of Lesson ${d.unitNo} (${d.title}) in ${d.langName} for a beginner.`));
  });
  main.querySelector("#cxAskExample")?.addEventListener("click", () => {
    if (window.__plAiAsk) window.__plAiAsk(T(`Cho mình thêm 2 ví dụ code ${d.short} áp dụng kiến thức bài «${d.title}», kèm giải thích từng dòng.`, `Give me 2 more ${d.short} code examples for "${d.title}", with line-by-line explanation.`));
  });
  main.querySelector("#cxAskMistakes")?.addEventListener("click", () => {
    if (window.__plAiAsk) window.__plAiAsk(T(`Những lỗi cú pháp và lỗi biên dịch thường gặp nhất khi học bài «${d.title}» trong ${d.short} là gì và cách tránh?`, `What are the most common syntax and compile errors in "${d.title}" in ${d.short}, and how do I avoid them?`));
  });
}

function highlight(root) {
  if (typeof CodeMirror === "undefined" || !CodeMirror.runMode) {
    // runMode unavailable: use read-only editor
    root.querySelectorAll("pre[data-cm]").forEach((pre) => {
      if (typeof CodeMirror === "undefined") return;
      const code = pre.textContent, lang = pre.dataset.cm;
      const host = document.createElement("div"); host.className = "cx-ro";
      pre.replaceWith(host);
      CodeMirror(host, { value: code, mode: CM_MODE[lang], readOnly: "nocursor", lineNumbers: false, theme: "pl", viewportMargin: Infinity });
    });
  }
}

/* ---------- Exercise workspace ---------- */
export async function pageCodeExercise(main, [exId], query, ctx) {
  main.innerHTML = `<div class="skel" style="height:420px"></div>`;
  let d;
  try { d = await api(`/api/code/ex/${encodeURIComponent(exId)}`); }
  catch (e) { main.innerHTML = `<div class="sheet empty"><b>${esc(e.message)}</b>${e.status === 402 ? `<a class="btn btn-primary" href="#/bang-gia">${T("Xem gói Pro", "See Pro plans")}</a>` : ""}</div>`; return; }
  if (!ctx.isCurrent()) return;
  const ex = d.exercise;
  if (getSubject() !== ex.lang) setSubject(ex.lang);
  ctx.setCrumbs([[T("Trang chủ", "Home"), "#/"], [ex.langName, `#/lap-trinh/${ex.lang}`], [ex.levelTitle, `#/lap-trinh/${ex.lang}/${ex.levelId}`], [ex.title]]);
  d.asg = /^\d+$/.test(String(query.asg || "")) ? Number(query.asg) : 0;
  if (ex.kind === "code" || ex.kind === "fix") return codeExercise(main, d, ctx);
  return quizExercise(main, d, ctx);
}

const asgBanner = (d) => d.asg ? `<div class="pay-warn lx-asg cx-asg">📌 <b>${T("Bài giao của lớp.", "Class assignment.")}</b> ${T("Mỗi lần nộp được ghi lại cho giáo viên.", "Every submission is recorded for your teacher.")} <span class="cx-asg-note"></span> <a href="#/lop">${T("Về lớp của tôi", "My classes")}</a></div>` : "";
const asgNote = (main, g) => {
  const el = main.querySelector(".cx-asg-note"); if (!el || !g || !g.assignment) return;
  el.textContent = g.assignment.error ? g.assignment.error : T(`Đã ghi lần nộp ${g.assignment.attemptNo} cho giáo viên${g.assignment.late ? " (nộp muộn)" : ""}.`, `Submission ${g.assignment.attemptNo} recorded${g.assignment.late ? " (late)" : ""}.`);
};
function head(ex, d) {
  return `${asgBanner(d)}<div class="page-head cx-head"><div><span class="edu-eyebrow">${ex.flag} ${esc(ex.langName)} · ${esc(ex.levelTitle)}${ex.unitTitle ? " · " + esc(ex.unitTitle) : ""}</span>
    <h1>${ex.icon} ${esc(ex.title)}</h1>
    <p>${esc(ex.kindTitle)} · ${T(`Đạt khi ${ex.kind === "code" || ex.kind === "fix" ? "qua tất cả test" : `từ ${ex.pass} điểm`}`, `Pass: ${ex.kind === "code" || ex.kind === "fix" ? "all tests" : `${ex.pass} points`}`)} · ${T("Điểm cao nhất", "Best")}: <b>${d.best}</b>${d.attempts ? ` · ${d.attempts} ${T("lần nộp", "submissions")}` : ""}</p></div>
    <div class="row">${d.prev ? `<a class="btn btn-sm" href="#/lap-trinh/bai/${d.prev}">←</a>` : ""}${d.next ? `<a class="btn btn-sm" href="#/lap-trinh/bai/${d.next}">${T("Bài sau", "Next")} →</a>` : ""}</div></div>`;
}

function codeExercise(main, d, ctx) {
  const ex = d.exercise;
  const KEY = `pl-code-draft-${ex.id}`;
  let draft = ""; try { draft = localStorage.getItem(KEY) || ""; } catch {}
  const initial = draft || ex.lastCode || ex.starter;
  let lastError = "", ed = null, solution = ex.solution;
  window.__plAiCtx = { codeItem: ex.id, langName: ex.langName, page: `${ex.langName} · ${ex.title}`, getCode: () => (ed ? ed.getValue() : ""), getError: () => lastError };
  withAi(ctx);
  main.innerHTML = `<div class="cx-ex-page">
    ${head(ex, d)}
    ${d.runner && !d.runner.ready ? runnerOffNote() : ""}
    <div class="cx-work">
      <section class="sheet cx-prompt">
        <h2>${T("Đề bài", "Task")}</h2>
        <div class="cx-prompt-text">${esc(ex.prompt).replace(/\n/g, "<br>")}</div>
        ${ex.samples.map((s, i) => `<div class="cx-sample"><div><b>${T("Ví dụ", "Example")} ${i + 1} · ${T("Nhập", "Input")}</b><pre>${esc(s.input)}</pre></div><div><b>${T("Kết quả", "Output")}</b><pre>${esc(s.output)}</pre></div></div>`).join("")}
        <p class="small muted">${T(`Bài có ${ex.testCount} bộ test (2 bộ đầu là ví dụ ở trên, còn lại là test ẩn). In đúng định dạng, không in thêm lời nhắc như "Nhap n:".`, `${ex.testCount} tests (the first 2 are the examples above, the rest are hidden). Print exactly the required format; don't print prompts like "Enter n:".`)}</p>
        ${ex.lang === "java" ? `<p class="small muted">☕ ${T("Lớp chính phải tên là Main.", "The main class must be named Main.")}</p>` : ""}
        <div id="cxSol"></div>
      </section>
      <section class="sheet cx-editor-card">
        <div class="cx-ed-bar"><b>main.${esc(ex.ext)}</b><span class="spacer"></span>
          <button class="btn btn-sm" id="cxReset" title="${T("Khôi phục code ban đầu", "Restore the starting code")}">${icon("reset")}${T("Đặt lại", "Reset")}</button>
          <button class="btn btn-sm btn-ghost" type="button" id="cxAiNote" ${aiOn() ? "" : "hidden"} title="${T("Phân tích code và gắn nhận xét ngay dưới dòng cần sửa", "Analyze code and attach notes directly below lines that need fixing")}">${icon("bulb")}${T("AI phân tích lỗi", "AI error analysis")}</button>
          <button class="btn btn-sm btn-ghost" type="button" id="cxAiHint" ${aiOn() ? "" : "hidden"} title="${T("Hỏi gia sư AI gợi ý hướng giải hoặc giải thích lỗi", "Ask the AI tutor for a hint or error explanation")}">💬 ${T("Hỏi AI", "Ask AI")}</button>
          <button class="btn btn-sm btn-run" id="cxRun" ${(d.runner && !d.runner.ready) ? "disabled" : ""}>${icon("play")}${T("Chạy thử", "Run")}</button>
          <button class="btn btn-sm btn-primary" id="cxSubmit" ${(d.runner && !d.runner.ready) ? "disabled" : ""}>${icon("check")}${T("Nộp bài", "Submit")}</button></div>
        <div id="cxEd" class="cx-ed"></div>
        <details class="cx-input" open><summary>${T("Dữ liệu nhập khi chạy thử", "Input for Run")}</summary><textarea id="cxIn" class="input" rows="3" spellcheck="false">${esc(ex.samples[0] ? ex.samples[0].input : "")}</textarea></details>
        <div id="cxOut" class="cx-out" hidden></div>
      </section>
    </div>
  </div>`;
  const host = main.querySelector("#cxEd");
  if (typeof CodeMirror !== "undefined") {
    let aiWidgets = [];
    const cm = CodeMirror(host, { value: initial, mode: CM_MODE[ex.lang], theme: "pl", lineNumbers: true, indentUnit: 4, tabSize: 4, indentWithTabs: false, matchBrackets: true, autoCloseBrackets: true, inputStyle: "textarea", spellcheck: false, autocorrect: false, autocapitalize: false,
      extraKeys: { Tab: (c) => (c.somethingSelected() ? c.indentSelection("add") : c.replaceSelection("    ", "end")), "Shift-Tab": (c) => c.indentSelection("subtract"), "Ctrl-Enter": () => run(), "Cmd-Enter": () => run(), "Shift-Ctrl-Enter": () => submit(), "Shift-Cmd-Enter": () => submit(), "Ctrl-/": "toggleComment", "Cmd-/": "toggleComment" } });
    const clearAiNotes = () => {
      aiWidgets.forEach((w) => w.clear());
      aiWidgets = [];
      for (let i = 0; i < cm.lineCount(); i++) cm.removeLineClass(i, "background", "cm-ai-note-line");
    };
    const setAiNotes = (notes) => {
      clearAiNotes();
      if (!Array.isArray(notes)) return;
      for (const n of notes) {
        const line = Number(n.line);
        const text = String(n.note || n.message || "").trim();
        if (!line || line < 1 || line > cm.lineCount() || !text) continue;
        const idx = line - 1;
        cm.addLineClass(idx, "background", "cm-ai-note-line");
        const el = document.createElement("div");
        el.className = "ai-line-note";
        el.innerHTML = `<span class="ai-line-note-ic" aria-hidden="true">✨</span><span class="ai-line-note-tx"></span>`;
        el.querySelector(".ai-line-note-tx").textContent = text;
        aiWidgets.push(cm.addLineWidget(idx, el, { coverGutter: false, noHScroll: true }));
      }
      const first = notes.find((n) => Number(n.line) >= 1);
      if (first) cm.scrollIntoView({ line: Number(first.line) - 1, ch: 0 }, 60);
    };
    ed = { getValue: () => cm.getValue(), setValue: (v) => { clearAiNotes(); cm.setValue(v); }, cm, clearAiNotes, setAiNotes };
    cm.on("change", () => {
      if (aiWidgets.length) clearAiNotes();
      try { localStorage.setItem(KEY, cm.getValue()); } catch {}
    });
    setTimeout(() => cm.refresh(), 50);
  } else {
    host.innerHTML = `<textarea class="input cx-ta" spellcheck="false"></textarea>`;
    const ta = host.querySelector("textarea"); ta.value = initial;
    const clearAiNotes = () => host.querySelectorAll(".ai-line-note-list").forEach((n) => n.remove());
    const setAiNotes = (notes) => {
      clearAiNotes();
      if (!Array.isArray(notes) || !notes.length) return;
      const box = document.createElement("div");
      box.className = "ai-line-note-list";
      box.innerHTML = notes.filter((n) => n && n.note).slice(0, 8).map((n) => `<div class="ai-line-note"><span class="ai-line-note-ic">✨</span><span class="ai-line-note-tx"><b>${T("Dòng", "Line")} ${Number(n.line) || "?"}:</b> ${esc(String(n.note))}</span></div>`).join("");
      host.appendChild(box);
    };
    ta.addEventListener("input", () => { clearAiNotes(); try { localStorage.setItem(KEY, ta.value); } catch {} });
    ed = { getValue: () => ta.value, setValue: (v) => { clearAiNotes(); ta.value = v; }, clearAiNotes, setAiNotes };
  }
  const out = main.querySelector("#cxOut");
  let aiNoteBusy = false;
  const applyAiNotes = async (reason = "", auto = false) => {
    if (!aiOn() || (auto && !aiAuto()) || aiNoteBusy) return;
    const code = ed.getValue();
    if (!code.trim()) return;
    aiNoteBusy = true;
    const btn = main.querySelector("#cxAiNote");
    if (btn) btn.disabled = true;
    try {
      const j = await api("/api/ai/ask", "POST", {
        mode: "inline_notes",
        question: reason || T("Chú thích các dòng cần sửa", "Annotate lines that need fixing"),
        code,
        error: lastError || "",
        codeItem: ex.id,
        page: `${ex.langName} · ${ex.title}`,
      });
      const notes = Array.isArray(j.notes) ? j.notes : [];
      if (ed.setAiNotes) ed.setAiNotes(notes);
      toast(notes.length ? T(`AI đã gắn ${notes.length} nhận xét ngay tại dòng code cần chú ý.`, `AI attached ${notes.length} inline notes to your code.`) : T("AI chưa phát hiện dòng cần sửa.", "AI found no lines needing changes."), notes.length ? "ok" : "info");
    } catch (e) {
      if (!auto) toast(e.message, "err");
    }
    aiNoteBusy = false;
    if (btn) btn.disabled = false;
  };
  main.querySelector("#cxAiNote")?.addEventListener("click", () => applyAiNotes());
  main.querySelector("#cxAiHint")?.addEventListener("click", () => {
    const q = lastError
      ? T(`Mình đang làm bài «${ex.title}» (${ex.langName}) và gặp lỗi:\n${lastError}\nHãy giải thích lỗi này và gợi ý cách sửa.`, `I'm working on "${ex.title}" (${ex.langName}) and got this error:\n${lastError}\nPlease explain the error and give a hint on how to fix it.`)
      : T(`Hãy gợi ý hướng suy nghĩ và thuật toán từng bước cho bài «${ex.title}» (${ex.langName}), không viết sẵn toàn bộ lời giải.`, `Give me a step-by-step hint for solving "${ex.title}" (${ex.langName}) without giving the full solution.`);
    if (window.__plAiAsk) window.__plAiAsk(q);
  });
  const showSol = () => {
    if (!solution) return;
    main.querySelector("#cxSol").innerHTML = `<details class="cx-solution"><summary>💡 ${T("Xem lời giải mẫu", "Show the model solution")}</summary><pre class="cx-pre" data-cm="${esc(ex.lang)}">${esc(solution)}</pre></details>`;
    highlight(main.querySelector("#cxSol"));
  };
  showSol();
  const busy = (on) => ["#cxRun", "#cxSubmit"].forEach((s) => { const b = main.querySelector(s); if (b) b.disabled = on; });

  async function run() {
    busy(true); out.hidden = false; out.innerHTML = `<span class="spin"></span> ${T("Đang biên dịch và chạy…", "Compiling and running…")}`;
    try {
      const r = await api("/api/code/run", "POST", { lang: ex.lang, code: ed.getValue(), input: main.querySelector("#cxIn").value });
      if (!r.ok) { lastError = r.error || ""; out.innerHTML = `<div class="cx-verdict bad">${r.stage === "compile" ? T("Lỗi biên dịch", "Compile error") : T("Lỗi", "Error")}</div><pre class="cx-err">${esc(r.error || "")}</pre>`; if (lastError) applyAiNotes(T("Giải thích lỗi biên dịch trên từng dòng", "Explain compile error on each line"), true); return; }
      lastError = r.status === "ok" ? "" : (r.stderr || r.status);
      if (lastError) applyAiNotes(T("Giải thích lỗi khi chạy thử trên từng dòng", "Explain runtime error on each line"), true);
      const st = r.status === "tle" ? T("Quá thời gian (chương trình chạy quá lâu hoặc lặp vô hạn)", "Time limit exceeded (too slow or an infinite loop)") : r.status === "rte" ? T(`Lỗi khi chạy (mã thoát ${r.code})`, `Runtime error (exit code ${r.code})`) : T(`Chạy xong trong ${r.ms} ms`, `Finished in ${r.ms} ms`);
      out.innerHTML = `<div class="cx-verdict ${r.status === "ok" ? "" : "bad"}">${st}</div><b class="small">${T("Kết quả in ra", "Output")}</b><pre>${esc(r.stdout || "")}</pre>${r.stderr ? `<b class="small">stderr</b><pre class="cx-err">${esc(r.stderr)}</pre>` : ""}`;
    } catch (e) { out.innerHTML = `<div class="cx-verdict bad">${esc(e.message)}</div>`; }
    finally { busy(false); }
  }
  async function submit() {
    busy(true); out.hidden = false; out.innerHTML = `<span class="spin"></span> ${T("Đang chấm…", "Grading…")}`;
    try {
      const g = await api(`/api/code/ex/${encodeURIComponent(ex.id)}/submit`, "POST", { code: ed.getValue(), asg: d.asg || undefined });
      asgNote(main, g);
      d.best = g.best; d.attempts = g.attempts; resetCodeCache();
      if (g.solution) { solution = g.solution; showSol(); }
      if (g.compileError) { lastError = g.compileError; out.innerHTML = `<div class="cx-verdict bad">${T("Lỗi biên dịch — chưa chấm được", "Compile error — not graded")}</div><pre class="cx-err">${esc(g.compileError)}</pre><p class="small muted">${T("Mở gia sư AI và chọn “Giải thích lỗi” nếu chưa hiểu thông báo lỗi.", "Open the AI tutor and ask it to explain the error if it's unclear.")}</p>`; toast(T("Lỗi biên dịch", "Compile error"), "err"); applyAiNotes(T("Giải thích lỗi biên dịch trên từng dòng", "Explain compile error on each line"), true); return; }
      if (g.error) { out.innerHTML = `<div class="cx-verdict bad">${esc(g.stage || "")}</div><pre class="cx-err">${esc(g.error)}</pre>`; return; }
      const fail = g.tests.find((t) => !t.ok);
      lastError = fail ? (fail.stderr || `${fail.verdict}: ${T("sai kết quả", "wrong output")}${fail.hidden ? "" : `\n${T("Nhập", "Input")}:\n${fail.input}\n${T("Cần in", "Expected")}:\n${fail.expected}\n${T("Bạn in", "Got")}:\n${fail.got}`}`) : "";
      if (g.passed && ed.clearAiNotes) ed.clearAiNotes();
      else if (!g.passed) applyAiNotes(T("Phân tích dòng cần sửa dựa trên kết quả chấm bài", "Analyze lines that need fixing based on grading results"), true);
      const V = { AC: ["✓", T("Đúng", "Accepted")], WA: ["✗", T("Sai kết quả", "Wrong answer")], TLE: ["⏱", T("Quá thời gian", "Time limit")], RTE: ["💥", T("Lỗi khi chạy", "Runtime error")] };
      out.innerHTML = `<div class="cx-verdict ${g.passed ? "ok" : "bad"}">${g.passed ? T("🎉 Chính xác! Qua tất cả test.", "🎉 Correct! All tests passed.") : T(`Qua ${g.right}/${g.total} test`, `Passed ${g.right}/${g.total} tests`)} · ${g.score} ${T("điểm", "points")}</div>
        <div class="cx-tests">${g.tests.map((t, i) => `<span class="cx-t ${t.ok ? "ok" : "no"}" title="${esc(V[t.verdict][1])}">${V[t.verdict][0]} ${T("Test", "Test")} ${i + 1}${t.hidden ? " 🔒" : ""}<small>${t.ms} ms</small></span>`).join("")}</div>
        ${fail && !fail.hidden ? `<div class="cx-diff"><div><b>${T("Nhập", "Input")}</b><pre>${esc(fail.input)}</pre></div><div><b>${T("Cần in", "Expected")}</b><pre>${esc(fail.expected)}</pre></div><div><b>${T("Bạn in", "Your output")}</b><pre>${esc(fail.got)}</pre></div></div>${fail.stderr ? `<pre class="cx-err">${esc(fail.stderr)}</pre>` : ""}` : fail ? `<p class="small muted">${T("Sai ở test ẩn: kiểm tra trường hợp biên (số âm, số 0, số rất lớn, chỉ một phần tử…).", "A hidden test failed: check edge cases (negatives, zero, very large values, a single element…).")}</p>` : ""}
        ${g.passed && d.next ? `<a class="btn btn-primary" href="#/lap-trinh/bai/${d.next}">${T("Bài tiếp theo", "Next exercise")} →</a>` : ""}`;
      toast(g.passed ? T("Chính xác!", "Correct!") : T(`${g.right}/${g.total} test đúng`, `${g.right}/${g.total} tests passed`), g.passed ? "ok" : "info");
      const h = main.querySelector(".cx-head p b"); if (h) h.textContent = g.best;
    } catch (e) {
      out.innerHTML = `<div class="cx-verdict bad">${esc(e.message)}</div>`;
    } finally { busy(false); }
  }
  main.querySelector("#cxRun").addEventListener("click", run);
  main.querySelector("#cxSubmit").addEventListener("click", submit);
  main.querySelector("#cxReset").addEventListener("click", async () => {
    if (!(await confirmBox(T("Đặt lại code?", "Reset code?"), T("Code đang viết sẽ bị thay bằng code ban đầu.", "Your current code will be replaced by the starting code."), T("Đặt lại", "Reset")))) return;
    ed.setValue(ex.starter); try { localStorage.removeItem(KEY); } catch {}
  });
}

function quizExercise(main, d, ctx) {
  const ex = d.exercise;
  window.__plAiCtx = { codeItem: ex.id, langName: ex.langName, page: `${ex.langName} · ${ex.title}` };
  withAi(ctx);
  const answers = ex.questions.map((q) => (q.type === "mcq" ? null : ""));
  let graded = null;
  const paint = () => {
    main.innerHTML = `<div class="cx-ex-page lx-ex-page">
      ${head(ex, d)}
      ${graded ? `<div class="lx-result ${graded.passed ? "ok" : "no"}"><div class="lx-score">${graded.score}<small>/100</small></div><div><b>${graded.passed ? T("Bạn đã đạt bài này!", "You passed!") : T("Chưa đạt, xem lại đáp án rồi làm lại nhé.", "Not passed yet — review and try again.")}</b><span>${graded.right}/${graded.total} ${T("câu đúng", "correct")}</span></div><div class="row"><button class="btn" id="cxRetry">${icon("reset")}${T("Làm lại", "Try again")}</button>${d.next ? `<a class="btn btn-primary" href="#/lap-trinh/bai/${d.next}">${T("Bài tiếp theo", "Next")} →</a>` : ""}</div></div>` : ""}
      <div class="lx-qs">${ex.questions.map((q, i) => {
        const r = graded ? graded.results[i] : null;
        const body = q.type === "mcq"
          ? `<div class="lx-opts">${q.options.map((o, k) => `<button type="button" class="lx-opt ${answers[i] === k ? "sel" : ""} ${r && o === r.correct ? "right" : ""} ${r && answers[i] === k && !r.ok ? "wrong" : ""}" data-q="${i}" data-k="${k}" ${graded ? "disabled" : ""}>${esc(o)}</button>`).join("")}</div>`
          : `<pre class="cx-pre" data-cm="${esc(ex.lang)}">${esc(q.code)}</pre><textarea class="input cx-pred" data-q="${i}" rows="2" spellcheck="false" placeholder="${T("Gõ chính xác những gì chương trình in ra", "Type exactly what the program prints")}" ${graded ? "disabled" : ""}>${esc(answers[i])}</textarea>`;
        const fb = r ? `<div class="lx-fb ${r.ok ? "ok" : "no"}">${r.ok ? T("✓ Đúng", "✓ Correct") : `✗ ${T("Đáp án", "Answer")}: <code>${esc(r.correct)}</code>`}${r.explain ? `<div class="small">${esc(r.explain)}</div>` : ""}${r.ok ? "" : `<button type="button" class="lx-ask-ai" data-ai="${i}">💬 ${T("Hỏi AI vì sao", "Ask AI why")}</button>`}</div>` : "";
        return `<div class="lx-q sheet ${r ? (r.ok ? "is-ok" : "is-no") : ""}"><div class="lx-q-head"><span class="lx-q-no">${i + 1}</span><div class="lx-q-text"><b>${esc(q.q)}</b></div></div>${body}${fb}</div>`;
      }).join("")}</div>
      ${graded ? "" : `<div class="lx-submit-bar"><span>${answers.filter((a) => a !== null && a !== "").length}/${ex.questions.length} ${T("câu đã trả lời", "answered")}</span><div class="row" style="gap:8px"><button type="button" class="btn" id="cxQuizAi">💬 ${T("Hỏi gia sư AI", "Ask AI Tutor")}</button><button class="btn btn-primary" id="cxQSubmit">${icon("check")}${T("Nộp bài", "Submit")}</button></div></div>`}
    </div>`;
    highlight(main);
    if (d.lastG) asgNote(main, d.lastG);
    main.querySelector("#cxQuizAi")?.addEventListener("click", () => {
      if (window.__plAiAsk) window.__plAiAsk(T(`Hãy nhắc lại ngắn gọn các kiến thức trọng tâm để làm bài «${ex.title}» (${ex.langName}).`, `Briefly review the key concepts needed for "${ex.title}" (${ex.langName}).`));
    });
    main.querySelectorAll("[data-ai]").forEach((b) => b.addEventListener("click", () => {
      if (!graded) return;
      const i = +b.dataset.ai, q = ex.questions[i], r = graded.results[i];
      const mine = q.type === "mcq" ? (q.options[answers[i]] ?? T("(bỏ trống)", "(blank)")) : (answers[i] || T("(bỏ trống)", "(blank)"));
      const msg = q.type === "mcq"
        ? T(`Câu ${i + 1}: "${q.q}". Mình chọn "${mine}" nhưng đáp án đúng là "${r.correct}". Giải thích giúp mình vì sao và cho ví dụ minh họa.`, `Question ${i + 1}: "${q.q}". I chose "${mine}" but the answer is "${r.correct}". Please explain why with a short example.`)
        : T(`Câu ${i + 1} (đoán kết quả in ra của đoạn code ${ex.short}):\n${q.code}\nMình đoán in ra "${mine}" nhưng kết quả đúng là "${r.correct}". Hãy giải thích từng bước chương trình chạy như thế nào.`, `Question ${i + 1} (predict output of ${ex.short} code):\n${q.code}\nI answered "${mine}" but the real output is "${r.correct}". Please trace how the program runs step by step.`);
      if (window.__plAiAsk) window.__plAiAsk(msg);
    }));
    main.querySelectorAll(".lx-opt[data-k]").forEach((b) => b.addEventListener("click", () => { answers[+b.dataset.q] = +b.dataset.k; const y = scrollY; paint(); scrollTo(0, y); }));
    main.querySelectorAll(".cx-pred").forEach((t) => t.addEventListener("input", () => { answers[+t.dataset.q] = t.value; const s = main.querySelector(".lx-submit-bar span"); if (s) s.textContent = `${answers.filter((a) => a !== null && a !== "").length}/${ex.questions.length} ${T("câu đã trả lời", "answered")}`; }));
    main.querySelector("#cxQSubmit")?.addEventListener("click", async () => {
      const empty = answers.filter((a) => a === null || a === "").length;
      if (empty && !(await confirmBox(T("Nộp bài?", "Submit?"), T(`Còn ${empty} câu chưa trả lời, sẽ tính là sai.`, `${empty} unanswered questions will count as wrong.`), T("Vẫn nộp", "Submit anyway")))) return;
      try { graded = await api(`/api/code/ex/${encodeURIComponent(ex.id)}/submit`, "POST", { answers, asg: d.asg || undefined }); d.lastG = graded; d.best = graded.best; d.attempts = graded.attempts; resetCodeCache(); paint(); scrollTo(0, 0); toast(graded.passed ? T(`Đạt ${graded.score} điểm!`, `${graded.score} points!`) : `${graded.score}`, graded.passed ? "ok" : "info"); }
      catch (e) { toast(e.message, "err"); }
    });
    main.querySelector("#cxRetry")?.addEventListener("click", () => { graded = null; answers.forEach((_, i) => { answers[i] = ex.questions[i].type === "mcq" ? null : ""; }); paint(); scrollTo(0, 0); });
  };
  paint();
}

/* ---------- Achievements: certificates, leaderboard, badges (4.10.3) ---------- */
const bar = (pct, color) => `<div class="lx-bar"><span style="width:${Math.max(0, Math.min(100, pct))}%;background:${esc(color || "var(--brand)")}"></span></div>`;
async function courseOf(langId) {
  const d = await loadCode(true);
  const c = d.courses.find((x) => x.id === langId);
  if (c && getSubject() !== c.id) setSubject(c.id);
  return { d, c };
}
const achHead = (c, title, sub) => `<div class="page-head"><div><span class="edu-eyebrow">${c.flag} ${esc(c.name)} · ${T("THÀNH TÍCH", "ACHIEVEMENTS")}</span><h1>${title}</h1><p>${sub}</p></div></div>`;
export async function pageCodeCertList(main, [langId], query, ctx) {
  const { c } = await courseOf(langId);
  if (!ctx.isCurrent()) return;
  if (!c) { main.innerHTML = `<div class="sheet empty">${T("Không tìm thấy khóa học.", "Course not found.")}</div>`; return; }
  ctx.setCrumbs([[T("Trang chủ", "Home"), "#/"], [c.name, `#/lap-trinh/${c.id}`], [T("Chứng nhận", "Certificates")]]);
  main.innerHTML = achHead(c, T(`Chứng nhận ${esc(c.name)}`, `${esc(c.name)} certificates`), T("Đạt toàn bộ bài tập, trắc nghiệm và bài kiểm tra của một cấp để nhận chứng nhận cấp đó.", "Pass every exercise, quiz and the level test to earn that level's certificate.")) +
  `<div class="lx-cert-list">${c.levels.map((l) => `<div class="sheet lx-cert-item ${l.pct === 100 ? "done" : ""}" style="--c:${esc(c.color)}">
    <div class="lx-cert-ico">${l.pct === 100 ? "🎓" : l.locked ? "🔒" : "📜"}</div>
    <div class="t"><b>${esc(l.title)}</b><span>${l.done}/${l.total} ${T("bài đạt", "passed")} · ${l.pct}%</span>${bar(l.pct, c.color)}</div>
    ${l.pct === 100 ? `<a class="btn btn-primary btn-sm" href="#/lap-trinh/chung-nhan/${c.id}/${l.id}">${T("Xem chứng nhận", "View certificate")}</a>` : l.locked ? `<a class="btn btn-sm" href="#/bang-gia">Pro</a>` : `<a class="btn btn-sm" href="#/lap-trinh/${c.id}/${l.id}">${T("Học tiếp", "Continue")}</a>`}
  </div>`).join("")}</div>`;
}
export async function pageCodeCertificate(main, [langId, levelId], query, ctx) {
  let d;
  try { d = await api(`/api/code/certificate/${langId}/${levelId}`); } catch (e) { main.innerHTML = `<div class="sheet empty">${esc(e.message)}</div>`; return; }
  if (!ctx.isCurrent()) return;
  ctx.setCrumbs([[T("Trang chủ", "Home"), "#/"], [d.course, `#/lap-trinh/${langId}`], [T(`Chứng nhận ${d.level}`, `${d.level} certificate`)]]);
  if (!d.ok) { main.innerHTML = `<div class="sheet sheet-pad lx-pro-card"><div class="lx-pro-ico">🎓</div><h2>${T(`Chưa đủ điều kiện nhận chứng nhận ${esc(d.level)}`, `Not yet eligible for the ${esc(d.level)} certificate`)}</h2><p>${T(`Cần đạt tất cả ${d.total} bài của cấp (đã đạt ${d.done}).`, `Pass all ${d.total} items of this level (${d.done} so far).`)}</p><a class="btn btn-primary" href="#/lap-trinh/${esc(langId)}/${esc(levelId)}">${T("Học tiếp", "Continue")}</a></div>`; return; }
  const dt = new Date(d.date || Date.now()).toLocaleDateString(EN() ? "en-GB" : "vi-VN");
  main.innerHTML = `<div class="lx-cert-wrap"><div class="lx-cert" style="--c:${esc(d.color)}">
    <div class="lx-cert-top">${esc((S.cfg && S.cfg.siteName) || "LifeRivo")}</div>
    <h1>${T("CHỨNG NHẬN HOÀN THÀNH", "CERTIFICATE OF COMPLETION")}</h1>
    <p>${T("Chứng nhận học viên", "This certifies that")}</p><div class="lx-cert-name">${esc(d.name)}</div>
    <p>${T("đã hoàn thành toàn bộ bài lập trình, trắc nghiệm và bài kiểm tra", "has completed every programming exercise, quiz and test of")}</p>
    <div class="lx-cert-course">${d.flag} ${esc(d.course)} · ${esc(d.level)}</div>
    <p class="small">${esc(d.framework)} · ${T("Điểm kiểm tra cấp độ", "Level test score")}: <b>${d.testScore}/100</b></p>
    <div class="lx-cert-foot"><span>${T("Ngày cấp", "Issued")}: ${esc(dt)}</span><span>${T("Mã", "ID")}: ${esc(d.code)}</span></div>
  </div><div class="row" style="justify-content:center;margin-top:14px"><button class="btn btn-primary" id="cxPrint">🖨 ${T("In / Lưu PDF", "Print / Save PDF")}</button></div></div>`;
  main.querySelector("#cxPrint").addEventListener("click", () => window.print());
}
export async function pageCodeLeaderboard(main, [langId], query, ctx) {
  const { c } = await courseOf(langId);
  if (!c) { main.innerHTML = `<div class="sheet empty">${T("Không tìm thấy khóa học.", "Course not found.")}</div>`; return; }
  const d = await api(`/api/code/leaderboard/${c.id}`);
  if (!ctx.isCurrent()) return;
  ctx.setCrumbs([[T("Trang chủ", "Home"), "#/"], [c.name, `#/lap-trinh/${c.id}`], [T("Xếp hạng", "Leaderboard")]]);
  main.innerHTML = achHead(c, T(`Bảng xếp hạng ${esc(c.name)}`, `${esc(c.name)} leaderboard`), T("Xếp theo số bài đã đạt, bằng nhau thì xét tổng điểm.", "Ranked by exercises passed, then total points.")) +
  `<div class="sheet lx-lb lx-lb-big">${d.top.length ? d.top.map((r) => `<div class="lx-lb-row ${r.me ? "me" : ""}"><span class="lx-lb-rank">${r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : r.rank}</span><b>${esc(r.name)}${r.me ? T(" (bạn)", " (you)") : ""}</b><span>${r.passed} ${T("bài đạt", "passed")}</span></div>`).join("") : `<div class="empty small muted" style="padding:16px">${T("Chưa có ai đạt bài nào. Hãy là người đầu tiên!", "Nobody has passed an exercise yet. Be the first!")}</div>`}</div>`;
}
export async function pageCodeBadges(main, [langId], query, ctx) {
  const { c } = await courseOf(langId);
  if (!c) { main.innerHTML = `<div class="sheet empty">${T("Không tìm thấy khóa học.", "Course not found.")}</div>`; return; }
  let streak = 0; try { const d = await api("/api/dashboard"); streak = (d && d.streak && (d.streak.longest || d.streak.current)) || 0; } catch {}
  if (!ctx.isCurrent()) return;
  ctx.setCrumbs([[T("Trang chủ", "Home"), "#/"], [c.name, `#/lap-trinh/${c.id}`], [T("Huy hiệu", "Badges")]]);
  const all = c.levels.flatMap((l) => l.units.flatMap((u) => u.exercises).concat(l.test ? [l.test] : []));
  const ok = (k) => all.filter((e) => e.kind === k && e.best >= e.pass).length;
  const firstTry = all.filter((e) => (e.kind === "code" || e.kind === "fix") && e.best >= e.pass && e.attempts === 1).length;
  const B = [
    ["🌱", T("Hello, World", "Hello, World"), T("Đạt bài lập trình đầu tiên", "Pass your first coding exercise"), ok("code") + ok("fix"), 1],
    ["💻", T("Lập trình viên", "Coder"), T("Đạt 10 bài viết chương trình", "Pass 10 coding exercises"), ok("code"), 10],
    ["🚀", T("Chiến binh code", "Code warrior"), T("Đạt 24 bài viết chương trình", "Pass 24 coding exercises"), ok("code"), 24],
    ["🐞", T("Thợ săn lỗi", "Bug hunter"), T("Sửa đúng 5 bài có lỗi", "Fix 5 buggy programs"), ok("fix"), 5],
    ["🎯", T("Một phát ăn ngay", "First try"), T("5 bài đạt ngay lần nộp đầu", "5 exercises passed on the first submission"), firstTry, 5],
    ["🧠", T("Đọc code siêu", "Code reader"), T("Đạt 6 bài trắc nghiệm và đoán kết quả", "Pass 6 quizzes"), ok("quiz"), 6],
    ["🏁", T("Vượt cấp", "Level up"), T("Đạt 1 bài kiểm tra cấp độ", "Pass a level test"), ok("test"), 1],
    ["🔥", T("Chuỗi 7 ngày", "7-day streak"), T("Học 7 ngày liên tiếp", "Study 7 days in a row"), streak, 7],
    ...c.levels.map((l) => ["🎓", T(`Hoàn thành ${l.title}`, `${l.title} complete`), T(`Đạt hết bài của cấp ${l.title}`, `Pass everything in ${l.title}`), l.done, l.total || 1]),
  ];
  const got = B.filter((b) => b[3] >= b[4]).length;
  main.innerHTML = achHead(c, T(`Huy hiệu ${esc(c.name)}`, `${esc(c.name)} badges`), T(`Đã đạt <b>${got}/${B.length}</b> huy hiệu.`, `<b>${got}/${B.length}</b> badges earned.`)) +
  `<div class="lx-badges">${B.map(([ic, t, dsc, v, need]) => { const okk = v >= need; return `<div class="sheet lx-badge ${okk ? "ok" : ""}" style="--c:${esc(c.color)}"><div class="lx-badge-ico">${ic}</div><b>${esc(t)}</b><span>${esc(dsc)}</span>${okk ? `<em>${T("Đã đạt", "Earned")}</em>` : `${bar(Math.round(Math.min(1, v / need) * 100), c.color)}<span class="small">${Math.min(v, need)}/${need}</span>`}</div>`; }).join("")}</div>`;
}
