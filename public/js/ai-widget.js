/* LifeRivo — Floating AI assistant across all pages (after login).
   - 3 roles: Tutor (learner), English Tutor (English conversation), Teaching Assistant (licensed teachers / admins only).
     Role list is fetched from server (/api/ai/status), and server re-verifies permissions on every question.
   - Plan-based quotas (enforced by server). During exams: locked and completely hidden on the exam page.
   - Minimal context: current page name; exercise ID and code are only sent when the learner checks "Include code". */
import { appHash } from "./core.js";
import { S, api, esc, icon, sketchIcon, toast, cfg, copyBtnHtml } from "./core.js";
import { mdLite } from "./pro.js";
import { currentLang } from "./i18n.js";

const P_LABEL = { student: "Gia sư", native: "Gia sư Rivo", english: "English Tutor", teacher: "Trợ giảng" };
const P_HINT = {
  student: "Gợi ý cách nghĩ, chỉ lỗi theo dòng; không làm bài thay bạn.",
  english: "Learn English in simple words. Ask about grammar, vocabulary or pronunciation.",
  native: "Trò chuyện với Rivo — trả lời bằng ngôn ngữ đang học, kèm nghĩa tiếng Việt cho từ khó.",
  teacher: "Gợi ý đề bài, tiêu chí chấm, nhận xét, kế hoạch buổi học.",
};
const QUICK = {
  student: [["hint", "Gợi ý bài này", true], ["explain_error", "Giải thích lỗi", true], ["review", "Nhận xét bài viết", true], ["next", "Nên học gì tiếp", false]],
  english: [["hint", "Give me a hint", true], ["explain_error", "Explain my error", true], ["ask", "How do I use this naturally?", false]],
  native: [["ask", "Bắt đầu trò chuyện với mình nhé", false], ["ask", "Cho mình 5 câu giao tiếp hay dùng", false], ["ask", "Sửa lỗi cho mình nhé", false]],
  teacher: [["ask", "Gợi ý 3 bài luyện từ vựng cho người mới", false], ["ask", "Tiêu chí chấm bài viết (thang 10)", false], ["ask", "Kế hoạch buổi học 45 phút về ngữ pháp", false]],
};
// Môn đang chọn ở thanh trên cùng (pl:subject) — widget nổi hiện trên mọi trang nên gợi ý/lời chào mặc định phải theo môn đó, không cố định theo một môn.
function curSubj() { let v = ""; try { v = localStorage.getItem("pl:subject") || ""; } catch {} if (!v && S.prefs && S.prefs.subject) v = S.prefs.subject; return v; }
const LANG_SUBJ_VI = { en: "Tiếng Anh", zh: "Tiếng Trung", ja: "Tiếng Nhật", ko: "Tiếng Hàn", fr: "Tiếng Pháp", es: "Tiếng Tây Ban Nha" };
const LANG_SUBJ_EN = { en: "English", zh: "Chinese", ja: "Japanese", ko: "Korean", fr: "French", es: "Spanish" };
// Pages where floating assistant is hidden: full AI page, scenario AI chat, active exam, print view
const HIDE = [/^ai(\/|$)/, /^ngoai-ngu\/tro-chuyen\//, /^thi\//, /^kiem-tra-lop\//, /^in-bao-cao\//];

let el = null, st = null, persona = "student";
const LANG_QUICK = ["Giải thích ngữ pháp bài này", "Cho mình thêm ví dụ", "Mẹo nhớ từ vựng bài này", "Hướng dẫn phát âm các từ khó"];
const LESSON_QUICK = ["Giải thích bài học này dễ hiểu hơn", "Cho thêm ví dụ thực tế", "Giải thích ngữ pháp và lỗi thường gặp", "Tóm tắt ý chính cần nhớ"];
const CHAPTER_QUICK = ["Tóm tắt kiến thức chương này", "Cho ví dụ minh họa dễ hiểu", "Các lỗi hay gặp trong chương này", "Gợi ý cách làm bài tập chương này"];

// Other pages can open the assistant and immediately ask a question (e.g. "Ask AI why" button after grading)
window.__plAiAsk = async (q) => {
  if (!el) await mountAiWidget();
  if (!el) { toast("Trợ lý AI tạm thời chưa sẵn sàng.", "info"); return; }
  el.hidden = false;
  const panel = el.querySelector(".aiw-panel");
  if (panel.hidden) el.querySelector(".aiw-fab").click();
  else draw();
  if (q) setTimeout(() => ask("ask", q), 220);
};
const conv = {};

export async function mountAiWidget() {
  if (el) { el.classList.add("lx-on"); aiWidgetRoute(appHash().replace(/^\/app\/?/, "").split("?")[0]); return; }
  if (!S.me || cfg("aiEnabled", true) === false) return;
  try { st = await api("/api/ai/status"); } catch { return; }
  if (!st.enabled || !st.configured) return; // hide button if no AI features are available
  el = document.createElement("div");
  el.className = "aiw lx-on";
  el.innerHTML = `<button class="aiw-fab" type="button" aria-expanded="false" aria-controls="aiwPanel" title="AI Agent">${sketchIcon("sparkle", 'width="22" height="22"')}<span class="aiw-fab-label">AI Agent</span><span class="sr">Hỏi AI Agent</span></button>
    <section class="aiw-panel" id="aiwPanel" role="dialog" aria-label="Trợ lý AI" hidden>
      <header class="aiw-head"><b>Trợ lý AI</b><div class="aiw-tabs" role="tablist"></div><button class="icon-btn aiw-x" type="button" aria-label="Đóng">${icon("x")}</button></header>
      <p class="aiw-hint small muted"></p>
      <div class="ai-msgs aiw-msgs" aria-live="polite"></div>
      <div class="aiw-quick chips"></div>
      <label class="check small aiw-code" hidden><input type="checkbox" checked> Gửi kèm bài đang viết</label>
      <form class="aiw-form"><textarea name="q" rows="2" maxlength="1000" placeholder="Gõ câu hỏi…"></textarea><button class="aiw-send" type="submit" aria-label="Gửi">${icon("bulb")}</button></form>
      <p class="aiw-quota small muted"></p>
    </section>`;
  document.body.appendChild(el);
  const fab = el.querySelector(".aiw-fab"), panel = el.querySelector(".aiw-panel");
  const open = async (on) => {
    panel.hidden = !on; fab.setAttribute("aria-expanded", String(on)); el.classList.toggle("open", on);
    if (on) { try { st = await api("/api/ai/status"); } catch {} draw(); el.querySelector("textarea").focus(); }
  };
  fab.addEventListener("click", () => open(panel.hidden));
  el.querySelector(".aiw-x").addEventListener("click", () => open(false));
  panel.addEventListener("keydown", (e) => { if (e.key === "Escape") { open(false); fab.focus(); } });
  el.querySelector(".aiw-form").addEventListener("submit", (e) => { e.preventDefault(); const q = e.target.q.value.trim(); if (!q) return; e.target.q.value = ""; ask("ask", q); });
  el.querySelector("textarea").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); el.querySelector(".aiw-form").requestSubmit(); } });
  aiWidgetRoute(appHash().replace(/^\/app\/?/, "").split("?")[0]);
}

export function unmountAiWidget() { if (el) { el.remove(); el = null; } }

// Called on every page change: hide on exam workspace / full AI page
export function aiWidgetRoute(path) {
  if (!el) return;
  const hide = HIDE.some((r) => r.test(path));
  el.hidden = hide;
  if (hide) { el.querySelector(".aiw-panel").hidden = true; el.classList.remove("open"); }
  else if (el.classList.contains("open")) setTimeout(() => el && draw(), 400); // new page may change context (code currently being written)
}

function draw() {
  const personas = (st && st.personas) || ["student"];
  if (!personas.includes(persona)) persona = personas[0];
  el.querySelector(".aiw-tabs").innerHTML = personas.map((p) => `<button type="button" role="tab" aria-selected="${p === persona}" class="${p === persona ? "on" : ""}" data-p="${p}">${P_LABEL[p]}</button>`).join("");
  el.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { persona = b.dataset.p; draw(); }));
  el.querySelector(".aiw-hint").textContent = P_HINT[persona];
  const ctx = window.__plAiCtx || null;
  const _subj = curSubj();
  const _langVi = LANG_SUBJ_VI[_subj] || "";
  const _langEn = LANG_SUBJ_EN[_subj] || "";
  if (!ctx && _langEn && persona === "english") el.querySelector(".aiw-hint").textContent = `Learn ${_langEn} — ask about words, grammar, or pronunciation.`;
  const lock = !!(st && st.examLock);
  el.querySelector(".aiw-code").hidden = !(ctx && ctx.getCode) || persona === "teacher";
  // Gợi ý nhanh theo ngữ cảnh: ngoại ngữ, bài học, chương
  const bindCustomChips = (list, attr) => {
    el.querySelector(".aiw-quick").innerHTML = lock ? "" : list.map((l, i) => `<button type="button" class="chip" data-${attr}="${i}">${esc(l)}</button>`).join("");
    el.querySelectorAll(`[data-${attr}]`).forEach((b) => b.addEventListener("click", () => ask("ask", list[Number(b.dataset[attr])])));
  };
  if (ctx && ctx.langItem && persona !== "teacher") {
    el.querySelector(".aiw-hint").textContent = "Gia sư ngoại ngữ: giải thích quy tắc, cho ví dụ, mẹo nhớ — bám theo bài bạn đang học.";
    bindCustomChips(LANG_QUICK, "lq");
  } else if (ctx && ctx.lessonId && !ctx.getCode && persona !== "teacher") {
    el.querySelector(".aiw-hint").textContent = "Gia sư bài học: giải thích khái niệm, ví dụ và câu hỏi trong bài đang mở.";
    bindCustomChips(LESSON_QUICK, "lsq");
  } else if (ctx && ctx.focusChapterId && !ctx.getCode && persona !== "teacher") {
    el.querySelector(".aiw-hint").textContent = "Gia sư chương học: tóm tắt lý thuyết, giải thích ví dụ và định hướng làm bài tập.";
    bindCustomChips(CHAPTER_QUICK, "chq");
  } else {
    let qList = QUICK[persona].filter(([, , needCtx]) => !needCtx || (ctx && (ctx.exerciseId || ctx.assignmentId || ctx.getCode)));
    if (!ctx && _langEn && persona === "english") qList = [["hint", "Give me a hint", true], ["explain_error", "Explain my error", true], ["ask", "Give me 5 useful phrases for beginners", false]];
    el.querySelector(".aiw-quick").innerHTML = lock ? "" : qList.map(([m, l], i) => `<button type="button" class="chip" data-q="${i}">${esc(l)}</button>`).join("");
    el.querySelectorAll("[data-q]").forEach((b) => b.addEventListener("click", () => { const [m, l] = qList[Number(b.dataset.q)]; ask(m, m === "ask" ? l : "", l); }));
  }
  const msgs = el.querySelector(".aiw-msgs");
  const ck = persona + ":" + ((ctx && ctx.langItem && String(ctx.langItem).split("-")[0]) || (ctx && ctx.lessonId ? "lesson:" + ctx.lessonId : ctx && ctx.focusChapterId ? "ch:" + ctx.focusChapterId : "py"));
  const c = conv[ck] || (conv[ck] = { id: null, html: "" });
  const langHello = ctx && ctx.langItem && persona !== "teacher"
    ? `Chào bạn! Mình là gia sư ${esc(ctx.langName || "ngoại ngữ")}. Hỏi mình về từ vựng, ngữ pháp hay cách phát âm của bài này nhé.`
    : ctx && (ctx.lessonId || ctx.focusChapterId) && persona !== "teacher"
        ? `Chào bạn! Mình đang theo dõi nội dung <b>${esc(ctx.page || "bài học này")}</b>. Bạn muốn giải thích phần nào hay cần thêm ví dụ?`
        : "";
  msgs.innerHTML = lock ? `<div class="msg assistant"><b>AI tạm khóa</b><br>Bạn đang làm bài kiểm tra. AI mở lại sau khi bạn nộp bài.</div>` : c.html || `<div class="msg assistant">${langHello ? langHello : persona === "english" ? (_langEn ? `Hi! I'm your ${_langEn} tutor. Ask me about words, grammar, or pronunciation.` : "Hi! I'm your English tutor. Ask me anything about English.") : persona === "teacher" ? "Chào thầy/cô! Mình có thể gợi ý đề bài, tiêu chí chấm hoặc kế hoạch buổi học." : persona === "native" ? `Chào bạn! Mình là Rivo. Cứ trò chuyện bằng ${_langVi || "ngôn ngữ đang học"} nhé — mình sẽ kèm nghĩa tiếng Việt cho từ khó.` : (_langVi ? `Chào bạn! Mình là gia sư ${_langVi}. Bạn đang vướng ở đâu?` : "Chào bạn! Mình là gia sư ngoại ngữ. Bạn đang vướng ở đâu?")}</div>`;
  msgs.scrollTop = msgs.scrollHeight;
  el.querySelector("textarea").disabled = lock; el.querySelector(".aiw-form button").disabled = lock;
  quota(st);
  // Chi hien cac mau san khi cuoc tro chuyen nay chua co tin nhan nao.
  el.querySelector(".aiw-quick").style.display = c.html ? "none" : "";
}
function quota(q) {
  const box = el.querySelector(".aiw-quota");
  if (!q || !q.limits) { box.textContent = ""; return; }
  box.innerHTML = q.allowed === false ? `<span class="err">${esc(q.reason)}</span>${!q.pro && !(S.me && S.me.role === "admin") ? ` <a href="/bang-gia">Nâng cấp Pro</a>` : ""}` : `Còn ${q.remaining.day}/${q.limits.day} lượt hôm nay`;
}

async function ask(mode, question, label = "") {
  if (window.__plGA) window.__plGA("chat_ai_gui_tin_nhan"); // chi ten event, KHONG gui noi dung chat
  // Da hoi roi thi an cac mau san de khoi che noi dung tra loi.
  el.querySelector(".aiw-quick").style.display = "none";
  const ctx = window.__plAiCtx || null;
  const withCode = ctx && ctx.getCode && persona !== "teacher" && el.querySelector(".aiw-code input").checked;
  const code = withCode ? String(ctx.getCode() || "") : "";
  // Always grab the latest error if present — ties AI to the error the learner is currently facing
  const error = ctx && ctx.getError ? String(ctx.getError() || "") : "";
  if (mode === "explain_error" && !error) { toast(persona === "english" ? "No error yet. Check or submit your answer first." : "Chưa có lỗi nào. Hãy kiểm tra hoặc nộp bài trước.", "info"); return; }
  // Automatically switch to error explanation mode when an error exists and user asks a free-form question
  if (mode === "ask" && error && withCode) mode = "explain_error";
  const ck = persona + ":" + ((ctx && ctx.langItem && String(ctx.langItem).split("-")[0]) || (ctx && ctx.lessonId ? "lesson:" + ctx.lessonId : ctx && ctx.focusChapterId ? "ch:" + ctx.focusChapterId : "py"));
  const c = conv[ck] || (conv[ck] = { id: null, html: "" });
  const msgs = el.querySelector(".aiw-msgs");
  if (!c.html) msgs.innerHTML = "";
  const add = (role, html) => { const d = document.createElement("div"); d.className = "msg " + role; d.innerHTML = html; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; };
  add("user", esc(question || label || mode));
  const wait = add("assistant", `<span class="typing"><i></i><i></i><i></i></span>`);
  try {
    const page = (document.title || "").split(" · ")[0].slice(0, 80);
    const r = await api("/api/ai/ask", "POST", {
      persona, mode, question, code, error,
      // Always send the currently open exercise/lesson/chapter/assignment so AI has accurate lesson context
      exerciseId: ctx && ctx.exerciseId || undefined,
      lessonId: ctx && ctx.lessonId || undefined,
      focusChapterId: ctx && ctx.focusChapterId || undefined,
      assignmentId: ctx && ctx.assignmentId || undefined,
      langItem: ctx && ctx.langItem || undefined,
      page: (ctx && ctx.page) || page,
      conversationId: c.id,
    });
    c.id = r.conversationId; wait.innerHTML = mdLite(r.answer) + copyBtnHtml(); st = { ...st, ...r.quota }; quota(st);
  } catch (e) {
    wait.innerHTML = `<span class="err">${esc(e.message)}</span>`;
    if (e.status === 423) { st = { ...st, examLock: true }; draw(); }
  }
  c.html = msgs.innerHTML;
}
