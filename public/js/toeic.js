// Trung tâm TOEIC & luyện thi (môn Tiếng Anh): tổng quan, học theo Part, luyện từng Part,
// đề thi thử có giờ, kết quả và lịch sử. Dữ liệu và chấm điểm do máy chủ thực hiện (/api/toeic).
import { setAppHash } from "./core.js";
import { api, esc, icon, toast, fmtN } from "./core.js";
import { currentLang } from "./i18n.js";
import { speakText as voiceSpeak, stopSpeaking } from "./voice.js";
import { HeroBanner } from "./chibi-ds.js";

const EN = () => currentLang() === "en";
const T = (vi, en) => (EN() ? en : vi);
const pct = (n) => (n === null || n === undefined ? "—" : `${n}%`);
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// Đọc to bằng giọng AI Gemini (POST /api/tts, có cache); lỗi/hết lượt thì voice.js tự rơi về giọng trình duyệt.
function speakText(text) {
  try {
    const lines = Array.isArray(text) ? text : [text];
    const joined = lines.map((l) => String(l).replace(/^[WM]:\s*/, "")).join(" ").trim();
    if (!joined) return;
    voiceSpeak(joined, "en", { rate: 0.95 });
  } catch {}
}
const stopSpeech = () => { try { stopSpeaking(); } catch {} };

function nav(active, sub) {
  const items = [
    ["tong-quan", T("Tổng quan", "Overview"), "/app/toeic"],
    ["hoc", T("Học theo Part", "Learn by Part"), "/app/toeic/hoc"],
    ["luyen", T("Luyện từng Part", "Practice by Part"), "/app/toeic/luyen"],
    ["de", T("Đề thi thử", "Mock tests"), "/app/toeic/de"],
    ["lich-su", T("Lịch sử", "History"), "/app/toeic/lich-su"],
  ];
  return `<nav class="tabs" aria-label="${T("Trung tâm TOEIC", "TOEIC center")}">${items.map(([k, l, h]) => `<a href="${h}" class="${active === k ? "on" : ""}" ${active === k ? 'aria-current="page"' : ""}>${esc(l)}</a>`).join("")}</nav>`;
}
function head(eyebrow, title, sub, cls = "") {
  return `<div class="page-head edu-page-head ${cls}"><div><span class="edu-eyebrow">${esc(eyebrow)}</span><h1>${esc(title)}</h1><p>${esc(sub)}</p></div></div>`;
}

export async function pageToeic(main, [sub] = [], _q, ctx) {
  ctx.setCrumbs([[T("Học viên", "Student"), "/app/"], [T("Luyện thi TOEIC", "TOEIC Practice"), "/app/toeic"]]);
  ctx.onLeave && ctx.onLeave(() => stopSpeech());
  const parts = String(sub || "").split("/").filter(Boolean);
  const [a, b, c] = parts;
  main.innerHTML = `<div class="skel" style="height:260px"></div>`;
  try {
    if (!a || a === "tong-quan") return await viewOverview(main, ctx);
    if (a === "hoc" && !b) return await viewLessons(main, ctx);
    if (a === "hoc" && b) return await viewLesson(main, Number(b), ctx);
    if (a === "luyen" && !b) return await viewPracticeList(main, ctx);
    if (a === "luyen" && b) return await viewDrill(main, Number(b), ctx);
    if (a === "de" && !b) return await viewTests(main, ctx);
    if (a === "de" && b) return await viewExam(main, b, ctx);
    if (a === "ket" && b) return await viewResult(main, Number(b), ctx);
    if (a === "lich-su") return await viewHistory(main, ctx);
    main.innerHTML = `<div class="sheet sheet-pad empty"><b>${T("Không tìm thấy trang này", "Page not found")}</b><a class="btn" href="/app/toeic">${T("Về trung tâm TOEIC", "Back to TOEIC center")}</a></div>`;
  } catch (e) {
    if (!ctx.isCurrent()) return;
    main.innerHTML = `<div class="sheet sheet-pad empty"><b>${T("Không mở được trang này", "Could not open this page")}</b>${esc(e.message || "")}<br><button class="btn" data-reload>${T("Tải lại", "Reload")}</button></div>`;
    main.querySelector("[data-reload]")?.addEventListener("click", () => location.reload());
  }
}

// ---------- Tổng quan
async function viewOverview(main, ctx) {
  const d = await api("/api/toeic/overview");
  if (!ctx.isCurrent()) return;
  const sug = d.suggestion;
  const sugPart = d.parts.find((p) => p.n === sug.part);
  const lastTest = (d.tests || []).find((t) => t.last && t.last.score);
  const estScore = lastTest ? lastTest.last.score.total : d.totalDrillCorrect || 0;
  const firstMock = (d.tests && d.tests[0]) ? d.tests[0].id : "full-1";
  const heroHtml = HeroBanner({
    badge: "TOEIC PRACTICE",
    title: T("Chinh phục mục tiêu TOEIC", "Reach your TOEIC goal"),
    subtitle: T("Luyện từng phần, theo dõi điểm và tiến độ.", "Drill each Part, track your score and progress."),
    kit: "dragon",
    cls: "toeic-m-hero",
  });
  main.innerHTML = `${head("TOEIC & LUYỆN THI", T("Trung tâm luyện thi TOEIC", "TOEIC practice center"), T("Học theo từng Part, luyện từng phần, làm đề thi thử có giờ và xem kết quả chi tiết.", "Learn each Part, drill each section, sit timed mock tests and review your results."), "toeic-overview-head")}
  ${heroHtml}
  <div class="toeic-m-kpis">
    <div class="toeic-m-kpi"><b>${lastTest ? estScore : fmtN(d.questionCount)}</b><span>${lastTest ? T("Điểm gần nhất", "Latest score") : T("Câu trong ngân hàng", "Questions in bank")}</span></div>
    <div class="toeic-m-kpi"><b>${lastTest ? "750" : fmtN(d.totalDrillCorrect || 0)}</b><span>${lastTest ? T("Mục tiêu", "Target") : T("Câu đúng khi luyện", "Correct drill answers")}</span></div>
  </div>
  <section class="toeic-m-struct">
    <h2>${T("Cấu trúc bài thi", "Test Structure")}</h2>
    <div class="toeic-m-struct-list">
      <a class="toeic-m-struct-item" href="/app/toeic/luyen/1">
        <span class="toeic-m-struct-ico is-listen">🎧</span>
        <div class="toeic-m-struct-copy"><b>Listening Part 1–4</b><span>100 ${T("câu", "questions")}</span></div>
        <span class="toeic-m-struct-arr">›</span>
      </a>
      <a class="toeic-m-struct-item" href="/app/toeic/luyen/5">
        <span class="toeic-m-struct-ico is-read">📖</span>
        <div class="toeic-m-struct-copy"><b>Reading Part 5–7</b><span>100 ${T("câu", "questions")}</span></div>
        <span class="toeic-m-struct-arr">›</span>
      </a>
      <a class="toeic-m-struct-item" href="/app/toeic/de/${esc(firstMock)}">
        <span class="toeic-m-struct-ico is-mock">📝</span>
        <div class="toeic-m-struct-copy"><b>${T("Thi thử toàn đề", "Full Mock Test")}</b><span>120 ${T("phút", "min")}</span></div>
        <span class="toeic-m-struct-arr">›</span>
      </a>
    </div>
  </section>
  ${nav("tong-quan")}
  <section class="sheet sheet-pad toeic-suggest">
    <div><span class="tag tag-tim">${T("Gợi ý hôm nay", "Today's suggestion")}</span><h2>${esc(sugPart ? (EN() ? sugPart.titleEn : sugPart.title) : "")} · Part ${sug.part}</h2><p class="muted">${esc(sug.reason)}</p></div>
    <div class="row"><a class="btn btn-primary" href="/app/toeic/luyen/${sug.part}">${icon("play")}${T("Luyện Part", "Practise Part")} ${sug.part}</a><a class="btn" href="/app/toeic/hoc/${sug.part}">${icon("book")}${T("Xem bài học", "Read lesson")}</a></div>
  </section>
  <div class="toeic-stats">
    <div><b>${d.questionCount}</b><span>${T("câu trong ngân hàng", "questions in the bank")}</span></div>
    <div><b>${d.totalDrillCorrect}</b><span>${T("câu đúng khi luyện tập", "correct drill answers")}</span></div>
    <div><b>${d.tests.reduce((s, t) => s + t.attempts, 0)}</b><span>${T("lượt thi thử", "mock test attempts")}</span></div>
  </div>
  <section class="lx-sec"><div class="sec-head"><div><h2>${T("Các Part", "The Parts")}</h2><p>${T("Nghe: Part 1–4 · Đọc: Part 5–7", "Listening: Parts 1–4 · Reading: Parts 5–7")}</p></div></div>
    <div class="lx-grid">${d.parts.map((p) => partCard(p)).join("")}</div>
  </section>
  <section class="lx-sec"><div class="sec-head"><div><h2>${T("Đề thi thử", "Mock tests")}</h2><p>${esc(d.scaleNote)}</p></div></div>
    <div class="lx-grid">${d.tests.map((t) => `<a class="lx-card" href="/app/toeic/de/${t.id}"><span class="lx-card-ico">${icon("clock")}</span><b>${esc(EN() ? t.titleEn : t.title)}</b><span class="lx-card-sub">${t.count} ${T("câu", "questions")} · ${t.minutes} ${T("phút", "min")}</span><span class="lx-card-foot"><span>${t.attempts} ${T("lần thi", "attempts")}${t.last ? ` · ${T("ước tính", "est.")} ${t.last.score.total}` : ""}</span></span></a>`).join("")}</div>
  </section>`;
}
function partCard(p) {
  const bar = p.bestAccuracy || 0;
  return `<a class="lx-card toeic-part" href="/app/toeic/luyen/${p.n}">
    <span class="lx-card-ico toeic-no">${p.n}</span>
    <b>Part ${p.n} · ${esc(EN() ? p.titleEn : p.title)}</b>
    <span class="lx-card-sub">${esc(p.section === "listening" ? T("Nghe", "Listening") : T("Đọc", "Reading"))} · ${p.count} ${T("câu", "questions")}</span>
    <span class="toeic-bar" aria-label="${T("Tỉ lệ đúng tốt nhất", "Best accuracy")} ${bar}%"><i style="width:${bar}%"></i></span>
    <span class="lx-card-foot"><span>${T("Tốt nhất", "Best")}: ${pct(p.drillAttempts ? p.bestAccuracy : null)}</span><span>${p.lessonSeen ? T("Đã học", "Studied") : T("Chưa học", "Not studied")}</span></span>
  </a>`;
}

// ---------- Học theo Part
async function viewLessons(main, ctx) {
  const d = await api("/api/toeic/lessons");
  if (!ctx.isCurrent()) return;
  main.innerHTML = `${head("HỌC TOEIC", T("Học theo 7 Part", "Learn the 7 Parts"), T("Mỗi Part có mục tiêu, dạng bài, chiến lược, lỗi thường gặp và ví dụ mẫu.", "Each Part has goals, format, strategy, common traps and a worked example."))}
  ${nav("hoc")}
  <div class="lx-grid">${d.lessons.map((l) => `<a class="lx-card" href="/app/toeic/hoc/${l.part}"><span class="lx-card-ico toeic-no">${l.part}</span><b>${esc(l.title)}</b><span class="lx-card-sub">${esc(l.format)}</span><span class="lx-card-foot"><span>${T("Đọc bài học", "Read lesson")} →</span></span></a>`).join("")}</div>`;
}
async function viewLesson(main, n, ctx) {
  const d = await api("/api/toeic/lessons");
  if (!ctx.isCurrent()) return;
  const l = d.lessons.find((x) => x.part === n);
  if (!l) { main.innerHTML = `<div class="sheet sheet-pad empty"><b>${T("Không tìm thấy Part", "Part not found")}</b><a class="btn" href="/app/toeic/hoc">${T("Về danh sách", "Back")}</a></div>`; return; }
  const ex = l.example;
  main.innerHTML = `${head(`PART ${n}`, l.title, l.format)}
  ${nav("hoc")}
  <section class="sheet sheet-pad toeic-lesson">
    <h2>${T("Mục tiêu", "Goal")}</h2><p>${esc(l.goal)}</p>
    <h2>${T("Chiến lược", "Strategy")}</h2><ul>${l.strategy.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
    <h2>${T("Lỗi thường gặp", "Common traps")}</h2><ul>${l.traps.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
    <h2>${T("Ví dụ mẫu", "Worked example")}</h2>
    <div class="toeic-example"><p><b>${esc(ex.prompt)}</b></p>
      <div class="lx-opts">${ex.options.map((o, k) => `<button type="button" class="lx-opt" data-k="${k}">${esc(o)}</button>`).join("")}</div>
      <button type="button" class="btn btn-sm" id="exShow">${T("Xem đáp án", "Show answer")}</button>
      <p id="exOut" class="toeic-explain" hidden></p>
    </div>
  </section>
  <div class="row toeic-actions">
    <a class="btn btn-primary" href="/app/toeic/luyen/${n}">${icon("play")}${T("Luyện Part", "Practise Part")} ${n}</a>
    <button type="button" class="btn" id="markSeen">${icon("check")}${T("Đánh dấu đã học", "Mark as studied")}</button>
  </div>`;
  const opts = [...main.querySelectorAll(".lx-opt")];
  opts.forEach((b) => b.addEventListener("click", () => { opts.forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); }));
  main.querySelector("#exShow").addEventListener("click", () => {
    const out = main.querySelector("#exOut");
    opts.forEach((b, k) => b.classList.toggle("right", k === ex.answer));
    out.hidden = false;
    out.textContent = `${T("Đáp án đúng:", "Correct answer:")} ${ex.options[ex.answer]}. ${ex.explain}`;
  });
  main.querySelector("#markSeen").addEventListener("click", async () => {
    try { await api(`/api/toeic/lessons/${n}/seen`, "POST", {}); toast(T("Đã ghi nhận bài học.", "Lesson recorded.")); } catch (e) { toast(e.message, "err"); }
  });
}

// ---------- Luyện từng Part
async function viewPracticeList(main, ctx) {
  const d = await api("/api/toeic/overview");
  if (!ctx.isCurrent()) return;
  main.innerHTML = `${head("LUYỆN TẬP", T("Luyện từng Part", "Practice by Part"), T("Làm bộ câu của một Part, nộp bài để xem đáp án và giải thích.", "Work through one Part, submit to see answers and explanations."))}
  ${nav("luyen")}
  <div class="lx-grid">${d.parts.map((p) => partCard(p)).join("")}</div>`;
}
async function viewDrill(main, n, ctx) {
  const d = await api(`/api/toeic/drill/${n}`);
  if (!ctx.isCurrent()) return;
  const p = d.part;
  const answers = {};
  let started = Date.now();
  let timer = setInterval(() => { const el = main.querySelector("#drillClock"); if (el) el.textContent = mmss(Math.floor((Date.now() - started) / 1000)); }, 1000);
  ctx.onLeave && ctx.onLeave(() => clearInterval(timer));
  const passageBlock = (pid) => {
    const ps = d.passages[pid];
    if (!ps) return "";
    if (ps.kind === "text") return `<div class="toeic-passage"><p>${esc(ps.text)}</p></div>`;
    return `<div class="toeic-passage toeic-audio"><button type="button" class="btn btn-sm" data-speak="${esc(pid)}">${icon("play")}${T("Nghe đoạn hội thoại", "Play audio")}</button><div class="toeic-script" hidden>${ps.lines.map((x) => `<p>${esc(x)}</p>`).join("")}</div></div>`;
  };
  const shownPassages = new Set();
  const qHtml = d.questions.map((q, i) => {
    let pre = "";
    if (q.passage && !shownPassages.has(q.passage)) { shownPassages.add(q.passage); pre = passageBlock(q.passage); }
    const isListen = p.section === "listening";
    const stem = q.part === 1 ? `<div class="toeic-scene" aria-hidden="true">${esc(q.scene || "")}</div><button type="button" class="btn btn-sm" data-speak-opts="${i}">${icon("play")}${T("Nghe 4 phương án", "Play the 4 options")}</button>`
      : q.part === 2 ? `<button type="button" class="btn btn-sm" data-speak-q="${i}">${icon("play")}${T("Nghe câu hỏi", "Play question")}</button>`
      : q.part === 3 || q.part === 4 ? `<p><b>${esc(q.q)}</b></p>`
      : q.part === 5 ? `<p><b>${esc(q.prompt)}</b></p>`
      : q.part === 6 ? `<p class="muted">${esc(q.q || "")}</p>` : `<p><b>${esc(q.q || "")}</b></p>`;
    return `${pre}<div class="toeic-q" data-i="${i}" data-part="${q.part}">
      <div class="toeic-qno">${i + 1}</div>
      <div class="toeic-qbody">${isListen && q.part === 2 ? "" : ""}${stem}
      <div class="lx-opts">${q.options.map((o, k) => `<button type="button" class="lx-opt" data-q="${i}" data-k="${k}">${esc(o)}</button>`).join("")}</div>
      <div class="toeic-result" hidden></div></div></div>`;
  }).join("");
  main.innerHTML = `${head(`PART ${n}`, EN() ? p.titleEn : p.title, p.hint)}
  ${nav("luyen")}
  <div class="toeic-bar-top"><span>${p.count} ${T("câu", "questions")} · ${T("gợi ý", "suggested")} ${p.minutes} ${T("phút", "min")}</span><span class="tag" id="drillClock">00:00</span></div>
  <section class="toeic-drill">${qHtml}</section>
  <div class="row toeic-actions"><button type="button" class="btn btn-primary" id="drillSubmit">${icon("check")}${T("Nộp bài", "Submit")}</button><button type="button" class="btn" id="drillReset">${icon("reset")}${T("Làm lại", "Reset")}</button><a class="btn" href="/app/toeic/hoc/${n}">${icon("book")}${T("Xem bài học", "Read lesson")}</a></div>
  <div id="drillScore"></div>`;
  // Trình xử lý gắn lên phần tử vừa render (không gắn lên #main để tránh cộng dồn khi đổi trang)
  const box = main.querySelector(".toeic-drill");
  box.addEventListener("click", (e) => {
    const sp = e.target.closest("[data-speak]");
    if (sp) {
      const ps = d.passages[sp.dataset.speak];
      speakText(ps.lines);
      const sc = sp.parentElement.querySelector(".toeic-script"); if (sc) sc.hidden = false;
      return;
    }
    const so = e.target.closest("[data-speak-opts]");
    if (so) { const q = d.questions[Number(so.dataset.speakOpts)]; speakText(q.options); return; }
    const sq = e.target.closest("[data-speak-q]");
    if (sq) { const q = d.questions[Number(sq.dataset.speakQ)]; speakText(q.audio || q.q || ""); return; }
    const opt = e.target.closest(".lx-opt[data-q]");
    if (opt && !opt.disabled) {
      const qi = Number(opt.dataset.q), k = Number(opt.dataset.k);
      answers[d.questions[qi].id] = k;
      box.querySelectorAll(`.lx-opt[data-q="${qi}"]`).forEach((b) => b.classList.toggle("sel", b === opt));
    }
  });
  main.querySelector("#drillSubmit").addEventListener("click", async () => {
    try {
      const seconds = Math.floor((Date.now() - started) / 1000);
      const r = await api(`/api/toeic/drill/${n}/check`, "POST", { answers, seconds });
      clearInterval(timer);
      stopSpeech();
      const byId = new Map(r.results.map((x) => [x.id, x]));
      main.querySelectorAll(".toeic-q").forEach((el) => {
        const res = byId.get(d.questions[Number(el.dataset.i)].id);
        const box = el.querySelector(".toeic-result");
        el.querySelectorAll(".lx-opt").forEach((b) => { b.disabled = true; const k = Number(b.dataset.k); b.classList.toggle("right", k === res.answer); b.classList.toggle("wrong", res.chosen === k && !res.correct); });
        box.hidden = false;
        box.innerHTML = `<p class="${res.correct ? "toeic-ok" : "toeic-no-ok"}">${res.correct ? "✓ " + T("Đúng", "Correct") : "✗ " + T("Sai", "Wrong")}${res.chosen === null ? " · " + T("chưa chọn", "not answered") : ""}</p><p class="toeic-explain">${esc(res.explain)}</p>`;
      });
      main.querySelectorAll("[data-speak]").forEach((el) => { const sc = el.parentElement.querySelector(".toeic-script"); if (sc) sc.hidden = false; });
      main.querySelector("#drillScore").innerHTML = `<section class="sheet sheet-pad toeic-scorebox"><b>${T("Kết quả", "Result")}: ${r.correct}/${r.total} (${Math.round((r.correct / r.total) * 100)}%)</b><p class="muted">${T("Đã trả lời", "Answered")}: ${r.answered}/${r.total}</p></section>`;
      toast(T("Đã chấm bài.", "Graded."));
      main.querySelector("#drillScore").scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (e) { toast(e.message, "err"); }
  });
  main.querySelector("#drillReset").addEventListener("click", () => viewDrill(main, n, ctx));
}

// ---------- Đề thi thử
async function viewTests(main, ctx) {
  const d = await api("/api/toeic/tests");
  if (!ctx.isCurrent()) return;
  main.innerHTML = `${head("ĐỀ THI THỬ", T("Đề thi thử có giờ", "Timed mock tests"), T("Làm đề đủ 100 câu theo giờ, nộp bài để xem điểm ước tính và đáp án.", "Sit a full 100-question timed test, then review your estimated score and answers."))}
  ${nav("de")}
  <div class="lx-grid">${d.tests.map((t) => `<a class="lx-card" href="/app/toeic/de/${t.id}"><span class="lx-card-ico">${icon("clock")}</span><b>${esc(EN() ? t.titleEn : t.title)}</b><span class="lx-card-sub">${t.count} ${T("câu", "questions")} · ${t.minutes} ${T("phút", "min")}</span><span class="lx-card-foot"><span>${t.attempts} ${T("lần thi", "attempts")}</span></span></a>`).join("")}</div>
  <p class="muted toeic-note">${esc(d.scaleNote)}</p>`;
}
async function viewExam(main, id, ctx) {
  const d = await api(`/api/toeic/tests/${encodeURIComponent(id)}`);
  if (!ctx.isCurrent()) return;
  const total = d.minutes * 60;
  const key = `toeic:test:${id}`;
  const answers = (() => { try { return JSON.parse(sessionStorage.getItem(key) || "{}"); } catch { return {}; } })();
  const started = Date.now();
  let left = total;
  let timer = null;
  let submitted = false;
  const save = () => { try { sessionStorage.setItem(key, JSON.stringify(answers)); } catch {} };
  const shownPassages = new Set();
  const qHtml = d.questions.map((q, i) => {
    let pre = "";
    if (q.passage && !shownPassages.has(q.passage)) {
      shownPassages.add(q.passage);
      const ps = d.passages[q.passage];
      pre = ps.kind === "text" ? `<div class="toeic-passage"><p>${esc(ps.text)}</p></div>`
        : `<div class="toeic-passage toeic-audio"><button type="button" class="btn btn-sm" data-speak="${esc(q.passage)}">${icon("play")}${T("Nghe đoạn", "Play audio")}</button></div>`;
    }
    const stem = q.part === 1 ? `<div class="toeic-scene" aria-hidden="true">${esc(q.scene || "")}</div><button type="button" class="btn btn-sm" data-speak-opts="${i}">${icon("play")}${T("Nghe 4 phương án", "Play options")}</button>`
      : q.part === 2 ? `<button type="button" class="btn btn-sm" data-speak-q="${i}">${icon("play")}${T("Nghe câu hỏi", "Play question")}</button>`
      : q.part === 5 ? `<p><b>${esc(q.prompt)}</b></p>`
      : q.part === 6 ? `<p class="muted">${esc(q.q || "")}</p>` : `<p><b>${esc(q.q || "")}</b></p>`;
    const ph = i === 0 || d.questions[i - 1].part !== q.part ? `<h3 class="toeic-parthead">Part ${q.part} · ${esc(q.part <= 4 ? T("Nghe", "Listening") : T("Đọc", "Reading"))}</h3>` : "";
    return `${ph}${pre}<div class="toeic-q" data-i="${i}"><div class="toeic-qno">${i + 1}</div><div class="toeic-qbody">${stem}<div class="lx-opts">${q.options.map((o, k) => `<button type="button" class="lx-opt ${answers[q.id] === k ? "sel" : ""}" data-q="${i}" data-k="${k}">${esc(o)}</button>`).join("")}</div></div></div>`;
  }).join("");
  main.innerHTML = `${head("ĐỀ THI THỬ", d.test ? (EN() ? d.test.titleEn : d.test.title) : id, T(`Giờ thi ${d.minutes} phút. Đồng hồ chạy ngay khi mở đề.`, `Time limit ${d.minutes} min. The clock starts now.`))}
  ${nav("de")}
  <div class="toeic-timer-bar"><span>${T("Còn lại", "Time left")}: <b id="examClock">${mmss(left)}</b></span><span>${Object.keys(answers).length}/${d.questions.length} ${T("đã chọn", "answered")}</span></div>
  <section class="toeic-drill">${qHtml}</section>
  <div class="row toeic-actions"><button type="button" class="btn btn-primary" id="examSubmit">${icon("check")}${T("Nộp bài", "Submit test")}</button></div>`;
  const clock = () => { const el = main.querySelector("#examClock"); if (el) el.textContent = mmss(Math.max(0, left)); };
  const finish = async (auto) => {
    if (submitted) return;
    submitted = true;
    clearInterval(timer);
    stopSpeech();
    try {
      const seconds = Math.min(total, Math.floor((Date.now() - started) / 1000));
      const r = await api(`/api/toeic/tests/${encodeURIComponent(id)}/submit`, "POST", { answers, seconds });
      try { sessionStorage.removeItem(key); } catch {}
      if (auto) toast(T("Hết giờ, bài đã được nộp.", "Time is up. Your test was submitted."));
      setAppHash(`/app/toeic/ket/${r.id}`)
    } catch (e) { submitted = false; toast(e.message, "err"); }
  };
  timer = setInterval(() => { left = total - Math.floor((Date.now() - started) / 1000); clock(); if (left <= 0) finish(true); }, 1000);
  ctx.onLeave && ctx.onLeave(() => { clearInterval(timer); stopSpeech(); });
  const box = main.querySelector(".toeic-drill");
  box.addEventListener("click", (e) => {
    const sp = e.target.closest("[data-speak]");
    if (sp) { const ps = d.passages[sp.dataset.speak]; speakText(ps.lines); return; }
    const so = e.target.closest("[data-speak-opts]");
    if (so) { speakText(d.questions[Number(so.dataset.speakOpts)].options); return; }
    const sq = e.target.closest("[data-speak-q]");
    if (sq) { const q = d.questions[Number(sq.dataset.speakQ)]; speakText(q.audio || q.q || ""); return; }
    const opt = e.target.closest(".lx-opt[data-q]");
    if (opt) {
      const qi = Number(opt.dataset.q), k = Number(opt.dataset.k);
      answers[d.questions[qi].id] = k; save();
      box.querySelectorAll(`.lx-opt[data-q="${qi}"]`).forEach((b) => b.classList.toggle("sel", b === opt));
      const cnt = main.querySelector(".toeic-timer-bar span:last-child");
      if (cnt) cnt.textContent = `${Object.keys(answers).length}/${d.questions.length} ${T("đã chọn", "answered")}`;
    }
  });
  main.querySelector("#examSubmit").addEventListener("click", () => {
    const n = Object.keys(answers).length;
    if (n < d.questions.length && !confirm(T(`Bạn mới chọn ${n}/${d.questions.length} câu. Vẫn nộp bài?`, `You answered ${n}/${d.questions.length}. Submit anyway?`))) return;
    finish(false);
  });
}

// ---------- Kết quả đề thi
async function viewResult(main, id, ctx) {
  const d = await api(`/api/toeic/attempts/${id}`);
  if (!ctx.isCurrent()) return;
  const correctByPart = {};
  for (const r of d.results) { const p = r.part; correctByPart[p] = correctByPart[p] || { c: 0, t: 0 }; correctByPart[p].t += 1; if (r.correct) correctByPart[p].c += 1; }
  const lastPid = { value: null };
  const review = d.results.map((r, i) => {
    let pre = "";
    const q = r;
    const passageId = q.passage;
    void passageId;
    const item = `<div class="toeic-q toeic-rev ${r.correct ? "ok" : "bad"}"><div class="toeic-qno">${i + 1}</div><div class="toeic-qbody"><p>${r.correct ? "✓" : "✗"} ${esc(r.explain)}</p><div class="lx-opts">${r.options.map((o, k) => `<button type="button" class="lx-opt ${k === r.answer ? "right" : ""} ${r.chosen === k && !r.correct ? "wrong" : ""}" disabled>${esc(o)}</button>`).join("")}</div></div></div>`;
    if (lastPid.value !== r.part) { lastPid.value = r.part; pre = `<h3 class="toeic-parthead">Part ${r.part}</h3>`; }
    return pre + item;
  }).join("");
  const s = d.score || {};
  const dt = new Date(d.createdAt);
  main.innerHTML = `${head("KẾT QUẢ", T("Kết quả đề thi thử", "Mock test result"), T(`Nộp ngày ${dt.toLocaleDateString(EN() ? "en-GB" : "vi-VN")} · ${d.correct}/${d.total} câu đúng`, `Submitted ${dt.toLocaleDateString("en-GB")} · ${d.correct}/${d.total} correct`))}
  ${nav("de")}
  <section class="sheet sheet-pad toeic-score">
    <div><span class="toeic-big">${s.total ?? "—"}</span><span class="muted"> / 990 · ${T("ước tính", "estimated")}</span></div>
    <div class="toeic-stats"><div><b>${s.listening ?? "—"}</b><span>${T("Nghe (ước tính)", "Listening (est.)")} · ${s.listeningCorrect ?? 0}/${s.listeningTotal ?? 51}</span></div><div><b>${s.reading ?? "—"}</b><span>${T("Đọc (ước tính)", "Reading (est.)")} · ${s.readingCorrect ?? 0}/${s.readingTotal ?? 49}</span></div></div>
    <p class="muted">${esc(s.note || "")}</p>
    <div class="toeic-bypart">${Object.entries(correctByPart).map(([p, v]) => `<span class="tag">Part ${p}: ${v.c}/${v.t}</span>`).join("")}</div>
    <div class="row"><a class="btn btn-primary" href="/app/toeic/de/${esc(d.test_id)}">${icon("reset")}${T("Thi lại", "Retake")}</a><a class="btn" href="/app/toeic/lich-su">${icon("history")}${T("Lịch sử", "History")}</a></div>
  </section>
  <h2 class="toeic-reviewhead">${T("Xem lại đáp án", "Review answers")}</h2>
  <section class="toeic-drill">${review}</section>`;
}

// ---------- Lịch sử
async function viewHistory(main, ctx) {
  const d = await api("/api/toeic/history");
  if (!ctx.isCurrent()) return;
  main.innerHTML = `${head("LỊCH SỬ", T("Lịch sử luyện thi", "Practice history"), T("Tỉ lệ đúng theo từng Part và các lần làm đề.", "Accuracy per Part and every test you have sat."))}
  ${nav("lich-su")}
  <section class="lx-sec"><div class="sec-head"><div><h2>${T("Theo từng Part", "By Part")}</h2></div></div>
    <div class="lx-grid">${d.byPart.map((p) => `<div class="lx-card toeic-part"><span class="lx-card-ico toeic-no">${p.n}</span><b>Part ${p.n} · ${esc(EN() ? p.titleEn : p.title)}</b><span class="lx-card-sub">${p.attempts} ${T("lần luyện", "drills")}</span><span class="toeic-bar"><i style="width:${p.accuracy || 0}%"></i></span><span class="lx-card-foot"><span>${T("Tỉ lệ đúng", "Accuracy")}: ${pct(p.accuracy)}</span></span></div>`).join("")}</div>
  </section>
  <section class="lx-sec"><div class="sec-head"><div><h2>${T("Các lần làm gần đây", "Recent attempts")}</h2></div></div>
    ${d.attempts.length ? `<ul class="toeic-history">${d.attempts.map((a) => `<li>${a.kind === "test" ? `<a href="/app/toeic/ket/${a.id}">${icon("clock")} ${T("Đề thi thử", "Mock test")} · ${a.score ? a.score.total : "—"}/990</a>` : `<span>${icon("play")} Part ${a.part} · ${a.correct}/${a.total}</span>`}<small>${new Date(a.created_at).toLocaleString(EN() ? "en-GB" : "vi-VN")}</small></li>`).join("")}</ul>` : `<div class="sheet sheet-pad empty">${T("Chưa có lần làm nào.", "No attempts yet.")}</div>`}
  </section>`;
}
