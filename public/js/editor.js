/* Python Lab 2.0 - code editor (CodeMirror 5) + live error hints for beginners */
import { esc, icon } from "./core.js";

/* Lazy-load CodeMirror 5 (core + modes/addons) on demand. The <script> tags were
   removed from index.html so the landing page does not download CodeMirror until
   the demo (or the app) actually needs it. Cached after the first call. */
const CM_FILES = [
  "/vendor/codemirror/codemirror.min.js",
  "/vendor/codemirror/python.min.js",
  "/vendor/codemirror/clike.min.js",
  "/vendor/codemirror/closebrackets.min.js",
  "/vendor/codemirror/matchbrackets.min.js",
  "/vendor/codemirror/show-hint.min.js",
  "/vendor/codemirror/active-line.min.js",
  "/vendor/codemirror/comment.min.js",
];
let _cmPromise = null;
export function ensureCodeMirror() {
  if (typeof window !== "undefined" && window.CodeMirror) return Promise.resolve();
  if (_cmPromise) return _cmPromise;
  const load = (src) => new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src; s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Khong tai duoc " + src));
    document.head.appendChild(s);
  });
  // Core first (addons register on window.CodeMirror), then the rest in parallel.
  _cmPromise = load(CM_FILES[0]).then(() => Promise.all(CM_FILES.slice(1).map(load)));
  return _cmPromise;
}

const HINTS = [
  ["print()", "print() — in ra màn hình", -1],
  ["range()", "range() — dãy số", -1],
  ["len()", "len() — độ dài", -1],
  ["int()", "int() — đổi sang số nguyên", -1],
  ["str()", "str() — đổi sang chuỗi", -1],
  ["float()", "float() — số thực", -1],
  ["sum()", "sum() — tổng một list", -1],
  ["append()", "append() — thêm vào cuối list", -1],
  ["if  :", "if … : — điều kiện", -2],
  ["elif  :", "elif … : — điều kiện khác", -2],
  ["else:", "else: — ngược lại", 0],
  ["for i in range():", "for … in range(): — vòng lặp", -2],
  ["while  :", "while … : — lặp theo điều kiện", -2],
  ["def ():", "def …(): — định nghĩa hàm", -3],
  ["return ", "return — trả về giá trị", 0],
  ["True", "True — đúng", 0],
  ["False", "False — sai", 0],
];

function pyHint(cm) {
  const cur = cm.getCursor();
  const tok = cm.getTokenAt(cur);
  if (tok.type === "string" || tok.type === "comment") return;
  const word = tok.string.slice(0, cur.ch - tok.start);
  if (!/^[A-Za-z_]\w*$/.test(word)) return;
  const lw = word.toLowerCase();
  const list = HINTS.filter(([t]) => t.toLowerCase().startsWith(lw) && t.replace(/[(): ]/g, "") !== word);
  if (!list.length) return;
  return {
    list: list.map(([text, displayText, back]) => ({
      text, displayText,
      hint: (cm2, data) => {
        cm2.replaceRange(text, data.from, data.to);
        if (back) { const c = cm2.getCursor(); cm2.setCursor({ line: c.line, ch: c.ch + back }); }
      },
    })),
    from: CodeMirror.Pos(cur.line, tok.start),
    to: CodeMirror.Pos(cur.line, cur.ch),
  };
}

export const QUICK_KEYS = [
  ["Tab", "    "], [":", ":"], ['""', '""', -1], ["()", "()", -1], ["[]", "[]", -1], ["=", " = "], ["==", " == "],
  [">=", " >= "], ["<=", " <= "], ["!=", " != "], ["print()", "print()", -1], ["if", "if  :", -2], ["else:", "else:\n"],
  ["for", "for i in range():", -2], ["while", "while  :", -2], ["def", "def ():", -3], ["f\"\"", 'f""', -1], ["{}", "{}", -1],
];

/* ---------- Select editor by device ----------
   Phones/tablets (touch screen, no mouse) use the browser's native textarea:
   CodeMirror 5 in "textarea" mode on mobile has virtual keyboard bugs (iPhone does not open the keyboard
   when tapping the code box, Gboard predictive text duplicates/drops characters, hold-to-select/paste fails).
   Users can switch back and forth; the choice is saved per browser. */
const MODE_KEY = "pl-editor-mode";
export function isTouchDevice() {
  try { return window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches; }
  catch { return false; }
}
export function editorMode() {
  let m = "";
  try { m = localStorage.getItem(MODE_KEY) || ""; } catch {}
  if (m === "simple" || m === "full") return m;
  return isTouchDevice() ? "simple" : "full";
}
function setEditorMode(m) { try { localStorage.setItem(MODE_KEY, m); } catch {} }

function modeSwitch(host, current, opts, rebuild) {
  if (!isTouchDevice() && current === "full") return null;
  const bar = document.createElement("div");
  bar.className = "ed-mode";
  bar.innerHTML = current === "simple"
    ? `<span>Trình soạn cho điện thoại</span><button type="button">Dùng trình soạn đầy đủ</button>`
    : `<span>Gõ khó trên điện thoại?</span><button type="button">Dùng trình soạn cho điện thoại</button>`;
  bar.querySelector("button").addEventListener("click", () => rebuild(current === "simple" ? "full" : "simple"));
  return bar;
}

export function createEditor(host, opts = {}) {
  // Shared wrapper: switching editor mode rebuilds the interior while preserving the current code.
  let inner = null;
  const api = {};
  const build = (mode, value) => {
    host.innerHTML = "";
    host.classList.toggle("ed-simple", mode === "simple");
    const area = document.createElement("div");
    area.className = "ed-area";
    host.appendChild(area);
    inner = mode === "simple" ? createTouchEditor(area, { ...opts, value }) : createCmEditor(area, { ...opts, value });
    const sw = modeSwitch(host, mode, opts, (m) => { setEditorMode(m); const v = inner.getValue(); build(m, v); inner.focusEnd(); });
    if (sw) host.appendChild(sw);
    Object.assign(api, inner, { mode });
  };
  build(editorMode(), opts.value || "");
  return new Proxy(api, { get: (t, k) => (k in t ? t[k] : inner[k]) });
}

/* ---------- Mobile editor: native <textarea> + line numbers ---------- */
function createTouchEditor(host, opts = {}) {
  host.innerHTML = `<div class="te"><div class="te-gutter" aria-hidden="true"></div><textarea class="te-input" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Soạn code Python"></textarea></div>`;
  const ta = host.querySelector("textarea");
  const gutter = host.querySelector(".te-gutter");
  ta.value = opts.value || "";
  if (opts.readOnly) ta.readOnly = true;
  let issues = [];
  let errLine = null;
  let composing = false;
  let lt;

  const lines = () => ta.value.split("\n");
  const posToIndex = (pos) => {
    const ls = lines();
    let idx = 0;
    for (let i = 0; i < Math.min(pos.line, ls.length); i++) idx += ls[i].length + 1;
    return idx + Math.min(pos.ch, (ls[pos.line] || "").length);
  };
  const indexToPos = (idx) => {
    const before = ta.value.slice(0, idx).split("\n");
    return { line: before.length - 1, ch: before[before.length - 1].length };
  };
  // Insert text via execCommand to preserve Undo (Ctrl+Z / shake); fall back to setRangeText on older browsers.
  const insertAt = (text, start, end) => {
    ta.focus();
    ta.setSelectionRange(start, end);
    let ok = false;
    try { ok = document.execCommand("insertText", false, text); } catch {}
    if (!ok) { ta.setRangeText(text, start, end, "end"); ta.dispatchEvent(new Event("input", { bubbles: true })); }
  };
  // Emulate a few CodeMirror methods so the live linter's "Quick fix" buttons work with both.
  const cmLike = {
    getLine: (i) => lines()[i] ?? "",
    lineCount: () => lines().length,
    getValue: () => ta.value,
    getCursor: () => indexToPos(ta.selectionStart),
    setCursor: (pos) => { const i = posToIndex(pos); ta.focus(); ta.setSelectionRange(i, i); },
    replaceRange: (text, from, to) => { const a = posToIndex(from); const b = to ? posToIndex(to) : a; insertAt(text, a, b); },
    somethingSelected: () => ta.selectionStart !== ta.selectionEnd,
    focus: () => ta.focus(),
  };

  const paintGutter = () => {
    const n = lines().length;
    const bad = new Set(issues.map((x) => x.line));
    let html = "";
    for (let i = 1; i <= n; i++) html += `<div class="${bad.has(i) ? "warn" : ""}${errLine === i ? " err" : ""}">${i}</div>`;
    gutter.innerHTML = html;
    gutter.scrollTop = ta.scrollTop;
  };
  const runLint = () => {
    if (composing) { clearTimeout(lt); lt = setTimeout(runLint, 450); return; }
    issues = opts.lint === false ? [] : lintCode(ta.value);
    paintGutter();
    if (opts.onLint) opts.onLint(issues);
  };

  ta.addEventListener("compositionstart", () => { composing = true; });
  ta.addEventListener("compositionend", () => { composing = false; clearTimeout(lt); lt = setTimeout(runLint, 450); });
  ta.addEventListener("scroll", () => { gutter.scrollTop = ta.scrollTop; });
  ta.addEventListener("input", () => {
    if (lines().length !== gutter.childElementCount) paintGutter();
    if (errLine != null) { errLine = null; paintGutter(); }
    clearTimeout(lt); lt = setTimeout(runLint, 450);
    if (opts.onChange) opts.onChange(ta.value);
  });
  // Auto-indent on newline like the full editor (add 4 spaces after a line ending with ":").
  const newline = () => {
    const s = ta.selectionStart;
    const lineStart = ta.value.lastIndexOf("\n", s - 1) + 1;
    const line = ta.value.slice(lineStart, s);
    let ind = (line.match(/^ */) || [""])[0];
    if (stripComment(line).trimEnd().endsWith(":")) ind += "    ";
    insertAt("\n" + ind, s, ta.selectionEnd);
  };
  ta.addEventListener("beforeinput", (e) => {
    if (composing || e.isComposing) return;
    if (e.inputType === "insertLineBreak" || e.inputType === "insertParagraph") { e.preventDefault(); newline(); }
  });
  ta.addEventListener("keydown", (e) => {
    if (e.isComposing) return;
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); (e.shiftKey ? opts.onSubmit : opts.onRun)?.(); return; }
    if (e.key === "Tab" && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      if (e.shiftKey) {
        const s = ta.selectionStart; const ls = ta.value.lastIndexOf("\n", s - 1) + 1;
        const n = (ta.value.slice(ls).match(/^ {1,4}/) || [""])[0].length;
        if (n) insertAt("", ls, ls + n);
      } else insertAt("    ", ta.selectionStart, ta.selectionEnd);
    }
  });
  paintGutter();
  setTimeout(runLint, 60);

  return {
    cm: null,
    getValue: () => ta.value,
    setValue: (v) => { ta.value = v || ""; errLine = null; paintGutter(); runLint(); },
    // Do not auto-open the keyboard when opening the page on mobile (it covers the prompt); only place the cursor.
    focus: () => ta.focus(),
    focusEnd: () => { const i = ta.value.length; try { ta.setSelectionRange(i, i); } catch {} },
    refresh: () => paintGutter(),
    issues: () => issues,
    relint: runLint,
    insert(text, back) {
      const s = ta.selectionStart;
      insertAt(text, s, ta.selectionEnd);
      if (back) { const i = s + text.length + back; ta.setSelectionRange(i, i); }
    },
    markError(line) {
      if (!line || line < 1 || line > lines().length) return;
      errLine = line;
      paintGutter();
      const lh = parseFloat(getComputedStyle(ta).lineHeight) || 24;
      ta.scrollTop = Math.max(0, (line - 3) * lh);
    },
    applyFix(iss) { iss.fix(cmLike, iss.line - 1); setTimeout(runLint, 30); },
    clearAiNotes() {
      host.querySelectorAll(".ai-line-note-list").forEach((n) => n.remove());
    },
    setAiNotes(notes) {
      this.clearAiNotes();
      if (!Array.isArray(notes) || !notes.length) return;
      const box = document.createElement("div");
      box.className = "ai-line-note-list";
      box.innerHTML = notes.filter((n) => n && n.note).slice(0, 12).map((n) =>
        `<div class="ai-line-note"><span class="ai-line-note-ic">✨</span><span class="ai-line-note-tx"><b>Dòng ${Number(n.line) || "?"}:</b> ${esc(String(n.note))}</span></div>`
      ).join("");
      host.appendChild(box);
    },
  };
}

function createCmEditor(host, opts = {}) {
  if (typeof CodeMirror === "undefined") {
    host.innerHTML = `<textarea class="input" style="height:100%;font-family:var(--mono)">${esc(opts.value || "")}</textarea>`;
    const ta = host.querySelector("textarea");
    return { getValue: () => ta.value, setValue: (v) => { ta.value = v; }, focus: () => ta.focus(), refresh() {}, cm: null, on() {}, issues: () => [] };
  }
  const cm = CodeMirror(host, {
    value: opts.value || "",
    mode: "python",
    theme: "pl",
    lineNumbers: true,
    indentUnit: 4, tabSize: 4, indentWithTabs: false,
    lineWrapping: opts.wrap !== false,
    matchBrackets: true,
    autoCloseBrackets: true,
    styleActiveLine: true,
    gutters: ["lint-gutter", "CodeMirror-linenumbers"],
    readOnly: !!opts.readOnly,
    // Force "textarea" on all devices: "contenteditable" mode (the mobile default)
    // drops accented Vietnamese characters when the keyboard commits text directly (reproduced: 6/8 words lost).
    inputStyle: "textarea",
    spellcheck: false, autocorrect: false, autocapitalize: false,
    extraKeys: {
      Tab: (c) => { if (c.somethingSelected()) c.indentSelection("add"); else c.replaceSelection("    ", "end"); },
      "Shift-Tab": (c) => c.indentSelection("subtract"),
      "Ctrl-Space": "autocomplete",
      "Ctrl-/": "toggleComment", "Cmd-/": "toggleComment",
      "Ctrl-Enter": () => opts.onRun && opts.onRun(), "Cmd-Enter": () => opts.onRun && opts.onRun(),
      "Shift-Ctrl-Enter": () => opts.onSubmit && opts.onSubmit(), "Shift-Cmd-Enter": () => opts.onSubmit && opts.onSubmit(),
      Enter: (c) => {
        const cur = c.getCursor();
        const line = c.getLine(cur.line);
        const before = line.slice(0, cur.ch).trimEnd();
        CodeMirror.commands.newlineAndIndent(c);
        if (before.endsWith(":")) {
          const ind = (line.match(/^\s*/) || [""])[0];
          const now = c.getLine(c.getCursor().line);
          const curInd = (now.match(/^\s*/) || [""])[0];
          const want = ind + "    ";
          if (curInd.length < want.length) c.replaceSelection(want.slice(curInd.length), "end");
        }
      },
    },
    hintOptions: { hint: pyHint, completeSingle: false },
  });
  // Vietnamese IME (Telex/VNI): while composing diacritics, do not touch the content
  // or decorate the active line, otherwise accented characters will be duplicated or lost.
  let composing = false;
  const inputEl = cm.getInputField();
  inputEl.addEventListener("compositionstart", () => { composing = true; });
  inputEl.addEventListener("compositionend", () => { composing = false; clearTimeout(lt); lt = setTimeout(runLint, 450); });
  cm.on("inputRead", (c, ch) => {
    if (composing || (ch.origin && /compose/.test(ch.origin))) return;
    if (ch.text && /^[A-Za-z_]$/.test(ch.text[0])) c.showHint({ completeSingle: false });
  });

  let issues = [];
  let marks = [];
  let aiWidgets = [];
  let lt;
  const runLint = () => {
    if (composing) { clearTimeout(lt); lt = setTimeout(runLint, 450); return; }
    marks.forEach((m) => m.clear()); marks = [];
    cm.clearGutter("lint-gutter");
    for (let i = 0; i < cm.lineCount(); i++) cm.removeLineClass(i, "background", "cm-lint-bg");
    issues = opts.lint === false ? [] : lintCode(cm.getValue());
    for (const iss of issues) {
      const idx = iss.line - 1;
      if (idx < 0 || idx >= cm.lineCount()) continue;
      const dot = document.createElement("div");
      dot.className = "lint-dot"; dot.title = iss.message;
      cm.setGutterMarker(idx, "lint-gutter", dot);
      cm.addLineClass(idx, "background", "cm-lint-bg");
      const len = cm.getLine(idx).length;
      if (len) marks.push(cm.markText({ line: idx, ch: (cm.getLine(idx).match(/^\s*/) || [""])[0].length }, { line: idx, ch: len }, { className: "cm-lint-wave", title: iss.message }));
    }
    if (opts.onLint) opts.onLint(issues);
  };
  let errLine = null;
  cm.on("change", () => {
    clearTimeout(lt); lt = setTimeout(runLint, 450);
    if (errLine != null && !composing) { cm.removeLineClass(errLine, "background", "cm-err-line"); errLine = null; }
    // Clear AI annotations when the user edits code (prevents line drift)
    if (aiWidgets && aiWidgets.length && !composing) {
      aiWidgets.forEach((w) => w.clear()); aiWidgets = [];
      for (let i = 0; i < cm.lineCount(); i++) cm.removeLineClass(i, "background", "cm-ai-note-line");
    }
    if (opts.onChange) opts.onChange(cm.getValue());
  });
  setTimeout(runLint, 60);

  return {
    cm,
    getValue: () => cm.getValue(),
    setValue: (v) => { cm.setValue(v || ""); cm.clearHistory(); },
    focus: () => { cm.focus(); },
    focusEnd: () => { const l = cm.lineCount() - 1; cm.focus(); cm.setCursor({ line: l, ch: cm.getLine(l).length }); },
    refresh: () => cm.refresh(),
    issues: () => issues,
    relint: runLint,
    insert(text, back) {
      cm.replaceSelection(text);
      if (back) { const c = cm.getCursor(); cm.setCursor({ line: c.line, ch: c.ch + back }); }
      cm.focus();
    },
    markError(line) {
      if (errLine != null) cm.removeLineClass(errLine, "background", "cm-err-line");
      if (!line || line < 1 || line > cm.lineCount()) return;
      errLine = line - 1;
      cm.addLineClass(errLine, "background", "cm-err-line");
      cm.scrollIntoView({ line: errLine, ch: 0 }, 80);
    },
    applyFix(iss) { iss.fix(cm, iss.line - 1); cm.focus(); setTimeout(runLint, 30); },
    // AI annotation right below the code line
    clearAiNotes() {
      (aiWidgets || []).forEach((w) => w.clear());
      aiWidgets = [];
      for (let i = 0; i < cm.lineCount(); i++) cm.removeLineClass(i, "background", "cm-ai-note-line");
    },
    setAiNotes(notes) {
      this.clearAiNotes();
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
    },
  };
}

export function quickbar(ed) {
  const wrap = document.createElement("div");
  wrap.className = "quick";
  wrap.setAttribute("aria-label", "Phím chèn nhanh");
  QUICK_KEYS.forEach(([label, text, back]) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = label;
    // Do not steal focus from the code editor (keeps the virtual keyboard open on mobile).
    b.addEventListener("pointerdown", (e) => e.preventDefault());
    b.addEventListener("mousedown", (e) => e.preventDefault());
    b.addEventListener("click", () => ed.insert(text, back));
    wrap.appendChild(b);
  });
  return wrap;
}

/* ---------- Live error linter ---------- */
const STRUCT = /^(if|elif|else|for|while|def|class|try|except)\b/;
function stripComment(line) {
  let out = "", q = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { out += c; if (c === "\\" && i + 1 < line.length) { out += line[++i]; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; out += c; continue; }
    if (c === "#") break;
    out += c;
  }
  return out;
}
function parenCount(s) {
  let o = 0, c = 0, q = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) { if (ch === "\\") { i++; continue; } if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'") { q = ch; continue; }
    if (ch === "(") o++; else if (ch === ")") c++;
  }
  return { o, c };
}
function quoteOdd(s) {
  let d = 0, sg = 0, q = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "\\") { i++; continue; }
    if (q) { if (ch === q) { q = null; if (ch === '"') d++; else sg++; } continue; }
    if (ch === '"' || ch === "'") { q = ch; if (ch === '"') d++; else sg++; }
  }
  return q;
}
const endInsert = (ch) => (cm, idx) => {
  const line = cm.getLine(idx);
  const at = line.replace(/\s+$/, "").length;
  cm.replaceRange(ch, { line: idx, ch: at });
  cm.setCursor({ line: idx, ch: at + ch.length });
};

export function lintCode(code) {
  const lines = String(code || "").split("\n");
  const out = [];
  let prevColon = false, prevIndent = 0;
  lines.forEach((raw, i) => {
    const n = i + 1;
    const bare = stripComment(raw);
    const t = bare.trim();
    const found = [];
    if (t) {
      const kw = (t.match(STRUCT) || [])[1];
      if (/^Print\s*\(/.test(t) || /^(If|For|While|Def|Else|Elif)\b/.test(t)) {
        const w = t.match(/^\w+/)[0];
        found.push({ type: "case", message: `Python phân biệt chữ hoa, chữ thường: viết "${w.toLowerCase()}" chứ không phải "${w}".`, label: `Đổi thành ${w.toLowerCase()}`,
          fix: (cm, idx) => { const l = cm.getLine(idx); cm.replaceRange(l.replace(w, w.toLowerCase()), { line: idx, ch: 0 }, { line: idx, ch: l.length }); } });
      }
      if (kw && !t.endsWith(":")) {
        found.push({ type: "colon", message: `Thiếu dấu hai chấm ":" ở cuối dòng ${kw}. Sau if, elif, else, for, while, def luôn phải có ":" để mở khối lệnh.`, label: `Thêm ":" vào dòng ${n}`, fix: endInsert(":") });
      }
      const q = quoteOdd(bare);
      if (q) found.push({ type: "quote", message: `Chuỗi chưa được đóng: thiếu dấu nháy ${q === '"' ? "kép" : "đơn"} ${q} ở cuối.`, label: `Thêm ${q} vào dòng ${n}`,
        fix: (cm, idx) => { const l = cm.getLine(idx); const p = parenCount(l); let at = l.replace(/\s+$/, "").length; if (p.o > p.c && l.trimEnd().endsWith(")")) at -= 1; if (l.trimEnd().endsWith(":")) at -= 1; cm.replaceRange(q, { line: idx, ch: at }); } });
      if (/\bprint\s+["'\w]/.test(t) && !/\bprint\s*\(/.test(t)) {
        found.push({ type: "print2", message: `Trong Python 3, print cần ngoặc tròn: viết print("...") thay vì print "...".`, label: "Thêm ngoặc cho print",
          fix: (cm, idx) => { let l = cm.getLine(idx); l = l.replace(/\bprint\s+/, "print(").replace(/\s*$/, ")"); cm.replaceRange(l, { line: idx, ch: 0 }, { line: idx, ch: cm.getLine(idx).length }); } });
      } else if (!q) {
        const p = parenCount(bare);
        if (p.o > p.c) found.push({ type: "paren", message: `Thiếu dấu đóng ngoặc ")" (mở ${p.o}, đóng ${p.c}).`, label: `Thêm ")" vào dòng ${n}`,
          fix: (cm, idx) => { const l = cm.getLine(idx); let at = l.replace(/\s+$/, "").length; if (l.trimEnd().endsWith(":")) at -= 1; cm.replaceRange(")".repeat(p.o - p.c), { line: idx, ch: at }); } });
        else if (p.c > p.o) found.push({ type: "paren", message: `Thừa dấu đóng ngoặc ")" hoặc thiếu dấu mở "(".`, label: "Xem lại cặp ngoặc", fix: (cm, idx) => cm.setCursor({ line: idx, ch: cm.getLine(idx).length }) });
      }
      if (/^(if|elif|while)\b/.test(t)) {
        const ns = bare.replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''");
        let bad = false;
        for (let k = 0; k < ns.length; k++) if (ns[k] === "=" && !"=!<>".includes(ns[k - 1]) && ns[k + 1] !== "=") { bad = true; break; }
        if (bad) found.push({ type: "eq", message: `Trong điều kiện, so sánh bằng dùng hai dấu "==". Một dấu "=" chỉ dùng để gán giá trị.`, label: `Đổi = thành == ở dòng ${n}`,
          fix: (cm, idx) => { const l = cm.getLine(idx); const c = l.lastIndexOf(":"); const h = c >= 0 ? l.slice(0, c) : l; cm.replaceRange(h.replace(/([^=!<>])=(?!=)/g, "$1==") + (c >= 0 ? l.slice(c) : ""), { line: idx, ch: 0 }, { line: idx, ch: l.length }); } });
      }
      if (prevColon) {
        const ind = (raw.match(/^ */) || [""])[0].length;
        if (ind <= prevIndent) found.push({ type: "indent", message: `Dòng này phải thụt vào 4 dấu cách vì nằm trong khối lệnh của dòng ${n - 1} (dòng kết thúc bằng ":").`, label: `Thụt lề dòng ${n}`,
          fix: (cm, idx) => { const cur = (cm.getLine(idx).match(/^ */) || [""])[0].length; const need = prevIndentAt(cm, idx) + 4 - cur; if (need > 0) cm.replaceRange(" ".repeat(need), { line: idx, ch: 0 }); } });
      }
      if (/\t/.test(raw.match(/^\s*/)[0])) found.push({ type: "tab", message: "Dòng này thụt lề bằng ký tự Tab. Nên dùng 4 dấu cách để tránh lỗi lệch lề.", label: "Đổi Tab thành dấu cách",
        fix: (cm, idx) => { const l = cm.getLine(idx); cm.replaceRange(l.replace(/^\s*/, (m) => m.replace(/\t/g, "    ")), { line: idx, ch: 0 }, { line: idx, ch: l.length }); } });
    }
    if (found.length) out.push({ line: n, ...found[0] });
    if (t) { prevColon = bare.trimEnd().endsWith(":"); prevIndent = (raw.match(/^ */) || [""])[0].length; }
  });
  return out;
}
function prevIndentAt(cm, idx) {
  for (let i = idx - 1; i >= 0; i--) { const l = cm.getLine(i); if (l.trim()) return (l.match(/^ */) || [""])[0].length; }
  return 0;
}

export function renderLintList(issues, max = 4) {
  if (!issues.length) return "";
  return issues.slice(0, max).map((iss, k) => `<div class="diag warn">
      <b>Dòng ${iss.line}</b><div class="msg">${esc(iss.message)}</div>
      <button class="btn btn-sm" data-fix="${k}">${icon("bulb")}${esc(iss.label)}</button>
    </div>`).join("") + (issues.length > max ? `<p class="ph">…và ${issues.length - max} gợi ý khác.</p>` : "");
}
