/* Python Lab — frontend app + CodeMirror IDE */
let ME = null, CSRF = "", CHAPTERS = [], GROUPS = [], PATHS = [], TOPICS = [], SCORES = null, activeGroup = "all", activePath = null, activeTopic = null;
let EXAM_TIMER = null, EXAM_END = 0, CURRENT_EXAM = null;
const editors = {}; // id -> CodeMirror instance
let sampleTargetId = null;

const QUICK_KEYS = [
  { label: "Tab", insert: "    " },
  { label: ":", insert: ":" },
  { label: '""', insert: '""', cursor: -1 },
  { label: "()", insert: "()", cursor: -1 },
  { label: "=", insert: " = " },
  { label: ">=", insert: " >= " },
  { label: "<=", insert: " <= " },
  { label: "==", insert: " == " },
  { label: "if", insert: "if  :", cursor: -2 },
  { label: "else:", insert: "else:\n    " },
  { label: "print()", insert: "print()", cursor: -1 },
  { label: "for", insert: "for i in range():", cursor: -2 },
];

const PY_HINTS = [
  { text: "print()", displayText: "print() — in ra màn hình", cursor: -1 },
  { text: "range()", displayText: "range() — dãy số", cursor: -1 },
  { text: "len()", displayText: "len() — độ dài", cursor: -1 },
  { text: "int()", displayText: "int() — chuyển số nguyên", cursor: -1 },
  { text: "str()", displayText: "str() — chuyển chuỗi", cursor: -1 },
  { text: "input()", displayText: "input() — nhập từ bàn phím", cursor: -1 },
  { text: "float()", displayText: "float() — số thực", cursor: -1 },
  { text: "sum()", displayText: "sum() — tổng danh sách", cursor: -1 },
  { text: "if  :", displayText: "if … : — điều kiện", cursor: -2 },
  { text: "elif  :", displayText: "elif … : — điều kiện khác", cursor: -2 },
  { text: "else:\n    ", displayText: "else: — ngược lại", cursor: 0 },
  { text: "for i in range():", displayText: "for i in range(): — vòng lặp", cursor: -2 },
  { text: "while  :", displayText: "while … : — lặp điều kiện", cursor: -2 },
  { text: "def ():", displayText: "def …(): — định nghĩa hàm", cursor: -3 },
  { text: "return ", displayText: "return — trả về", cursor: 0 },
];

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function api(path, method, body, options = {}) {
  const r = await fetch(path, {
    method: method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(CSRF ? { "X-CSRF-Token": CSRF } : {}),
      ...(options.headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({ error: "Lỗi kết nối máy chủ." }));
  if (!r.ok) throw new Error(j.error || "Có lỗi xảy ra.");
  return j;
}

/* ---------- Theme ---------- */
function initTheme() {
  const saved = localStorage.getItem("py-lab-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
  document.getElementById("themeToggle")?.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", cur);
    localStorage.setItem("py-lab-theme", cur);
  });
}

/* ---------- CodeMirror helpers ---------- */
function pythonHint(cm) {
  const cur = cm.getCursor();
  const token = cm.getTokenAt(cur);
  const start = token.start;
  const end = cur.ch;
  const word = token.string.slice(0, end - start).toLowerCase();
  if (!word || word.length < 1) return;
  const list = PY_HINTS.filter((h) => h.text.toLowerCase().startsWith(word) || (h.displayText || "").toLowerCase().includes(word));
  if (!list.length) return;
  return {
    list: list.map((h) => ({
      text: h.text,
      displayText: h.displayText || h.text,
      hint: (cm, data, completion) => {
        const from = completion.from || data.from;
        const to = completion.to || data.to;
        cm.replaceRange(h.text, from, to);
        if (h.cursor) {
          const after = cm.getCursor();
          cm.setCursor({ line: after.line, ch: after.ch + h.cursor });
        }
      },
    })),
    from: CodeMirror.Pos(cur.line, start),
    to: CodeMirror.Pos(cur.line, end),
  };
}


/* ---------- Live Syntax Linter (real-time) ---------- */
const STRUCT_KW = /^(if|elif|else|for|while|def|class|try|except)\b/;
const FUNC_CALL_NO_PAREN = /\b(print|range|input|len|int|str|float|sum)\s+["']/;

function stripLineComment(line) {
  // naive: remove # comment outside strings
  let out = "", inS = null, i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (inS) {
      if (ch === "\\" && i + 1 < line.length) { out += ch + line[i+1]; i += 2; continue; }
      out += ch;
      if (ch === inS) inS = null;
      i++; continue;
    }
    if (ch === '"' || ch === "'") { inS = ch; out += ch; i++; continue; }
    if (ch === "#") break;
    out += ch; i++;
  }
  return out;
}

function countQuotes(s) {
  let dq = 0, sq = 0, i = 0;
  while (i < s.length) {
    if (s[i] === "\\" && i + 1 < s.length) { i += 2; continue; }
    if (s[i] === '"') dq++;
    else if (s[i] === "'") sq++;
    i++;
  }
  return { dq, sq };
}

function countParensOutsideStrings(s) {
  let open = 0, close = 0, inS = null, i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (inS) {
      if (ch === "\\" && i + 1 < s.length) { i += 2; continue; }
      if (ch === inS) inS = null;
      i++; continue;
    }
    if (ch === '"' || ch === "'") { inS = ch; i++; continue; }
    if (ch === "(") open++;
    else if (ch === ")") close++;
    i++;
  }
  return { open, close };
}

/**
 * Analyze one line of Python-like code for beginner mistakes.
 * Returns array of issue objects: { line (1-based), type, message, fixLabel, applyFix(cm, lineIdx) }
 */
function lintLine(rawLine, lineNo, prevEndsWithColon, prevIndent) {
  const issues = [];
  const bare = stripLineComment(rawLine);
  const trimmed = bare.trim();
  if (!trimmed) return issues;

  // 1. Missing colon after structure keyword
  if (STRUCT_KW.test(trimmed) && !trimmed.endsWith(":")) {
    // allow "else if" style? no — still needs colon
    const kw = (trimmed.match(STRUCT_KW) || ["?"])[1] || trimmed.split(/\s/)[0];
    issues.push({
      line: lineNo,
      type: "colon",
      ch: bare.length, // end of line
      message: `⚠️ Dòng ${lineNo}: Bạn đang thiếu dấu hai chấm \`:\` ở cuối câu lệnh \`${kw}\`. Trong Python, sau \`if\`, \`else\`, \`for\`, \`while\`, \`def\` bắt buộc phải có dấu \`:\` để mở khối lệnh.`,
      fixLabel: `➕ Điền dấu : vào dòng ${lineNo}`,
      applyFix: (cm, idx) => {
        const line = cm.getLine(idx);
        const end = line.length;
        // insert before trailing whitespace
        const m = line.match(/^(.*?)(\s*)$/);
        const insertAt = m ? m[1].length : end;
        cm.replaceRange(":", { line: idx, ch: insertAt }, { line: idx, ch: insertAt });
        cm.setCursor({ line: idx, ch: insertAt + 1 });
        cm.focus();
      },
    });
  }

  // 2. Unbalanced parentheses / print without parens
  const { open, close } = countParensOutsideStrings(bare);
  if (open !== close) {
    const missing = open > close ? ")" : "(";
    issues.push({
      line: lineNo,
      type: "paren",
      ch: bare.length,
      message: `⚠️ Dòng ${lineNo}: Bạn đang thiếu dấu ${missing === ")" ? "đóng ngoặc \`)\`" : "mở ngoặc \`(\`"}. Hãy kiểm tra lại cặp ngoặc tròn ở lệnh \`print(...)\` nhé!`,
      fixLabel: `➕ Điền dấu ${missing} vào dòng ${lineNo}`,
      applyFix: (cm, idx) => {
        const line = cm.getLine(idx);
        if (missing === ")") {
          const m = line.match(/^(.*?)(\s*)$/);
          const insertAt = m ? m[1].length : line.length;
          cm.replaceRange(")", { line: idx, ch: insertAt }, { line: idx, ch: insertAt });
          cm.setCursor({ line: idx, ch: insertAt + 1 });
        } else {
          // try after function name
          const fn = line.match(/\b(print|range|input|len|int|str|float|sum)\b/);
          if (fn) {
            const pos = line.indexOf(fn[0]) + fn[0].length;
            cm.replaceRange("(", { line: idx, ch: pos }, { line: idx, ch: pos });
            cm.setCursor({ line: idx, ch: pos + 1 });
          } else {
            cm.replaceRange("(", { line: idx, ch: 0 }, { line: idx, ch: 0 });
          }
        }
        cm.focus();
      },
    });
  }
  // print "x" without parens (Python 2 style)
  if (FUNC_CALL_NO_PAREN.test(trimmed) || /\bprint\s+"/.test(trimmed) || /\bprint\s+'/.test(trimmed)) {
    issues.push({
      line: lineNo,
      type: "paren",
      ch: 0,
      message: `⚠️ Dòng ${lineNo}: Trong Python 3, \`print\` phải có ngoặc tròn: viết \`print("...")\` thay vì \`print "..."\`.`,
      fixLabel: `➕ Thêm ngoặc () cho print ở dòng ${lineNo}`,
      applyFix: (cm, idx) => {
        let line = cm.getLine(idx);
        line = line.replace(/\b(print|range|input|len|int|str|float|sum)\s+/, "$1(");
        // close at end if not closed
        const { open: o, close: c } = countParensOutsideStrings(line);
        if (o > c) {
          const m = line.match(/^(.*?)(\s*)$/);
          line = (m ? m[1] : line) + ")" + (m ? m[2] : "");
        }
        cm.replaceRange(line, { line: idx, ch: 0 }, { line: idx, ch: cm.getLine(idx).length });
        cm.focus();
      },
    });
  }

  // 3. Unclosed quotes
  const { dq, sq } = countQuotes(bare);
  if (dq % 2 === 1 || sq % 2 === 1) {
    const q = dq % 2 === 1 ? '"' : "'";
    issues.push({
      line: lineNo,
      type: "quote",
      ch: bare.length,
      message: `⚠️ Dòng ${lineNo}: Chuỗi văn bản chưa được đóng. Bạn đang thiếu dấu nháy ${q === '"' ? "kép" : "đơn"} \`${q}\` ở cuối chữ.`,
      fixLabel: `➕ Điền dấu ${q} vào dòng ${lineNo}`,
      applyFix: (cm, idx) => {
        const line = cm.getLine(idx);
        const m = line.match(/^(.*?)(\s*)$/);
        const insertAt = m ? m[1].length : line.length;
        cm.replaceRange(q, { line: idx, ch: insertAt }, { line: idx, ch: insertAt });
        cm.setCursor({ line: idx, ch: insertAt + 1 });
        cm.focus();
      },
    });
  }

  // 4. Single = in if/elif/while condition
  if (/^(if|elif|while)\b/.test(trimmed)) {
    const noStr = bare.replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''");
    let bad = false;
    for (let i = 0; i < noStr.length; i++) {
      if (
        noStr[i] === "=" &&
        noStr[i - 1] !== "=" &&
        noStr[i - 1] !== "!" &&
        noStr[i - 1] !== "<" &&
        noStr[i - 1] !== ">" &&
        noStr[i + 1] !== "="
      ) {
        bad = true;
        break;
      }
    }
    if (bad) {
      issues.push({
        line: lineNo,
        type: "assign-eq",
        ch: 0,
        message: `⚠️ Dòng ${lineNo}: Trong câu điều kiện \`if\`, để so sánh bằng nhau bạn phải dùng 2 dấu bằng \`==\` (hoặc \`>=\`, \`<=\`), còn 1 dấu \`=\` chỉ dùng để gán giá trị thôi.`,
        fixLabel: `➕ Đổi = thành == ở dòng ${lineNo}`,
        applyFix: (cm, idx) => {
          let line = cm.getLine(idx);
          // replace lone = with == inside condition (before :)
          const colon = line.lastIndexOf(":");
          const head = colon >= 0 ? line.slice(0, colon) : line;
          const tail = colon >= 0 ? line.slice(colon) : "";
          const fixed = head.replace(/([^=!<>])=(?!=)/g, "$1==") + tail;
          cm.replaceRange(fixed, { line: idx, ch: 0 }, { line: idx, ch: line.length });
          cm.focus();
        },
      });
    }
  }

  // 5. Missing indent after previous line ending with :
  if (prevEndsWithColon) {
    const indent = (rawLine.match(/^ */) || [""])[0].length;
    if (indent <= prevIndent && trimmed) {
      issues.push({
        line: lineNo,
        type: "indent",
        ch: 0,
        message: `⚠️ Dòng ${lineNo}: Dòng này nằm bên trong khối lệnh của dòng ${lineNo - 1}, bạn cần bấm phím \`Tab\` (hoặc thụt vào 4 dấu cách) ở đầu dòng nhé!`,
        fixLabel: `➕ Thụt lề 4 cách dòng ${lineNo}`,
        applyFix: (cm, idx) => {
          const line = cm.getLine(idx);
          const need = prevIndent + 4 - (line.match(/^ */)[0].length);
          if (need > 0) {
            cm.replaceRange(" ".repeat(need), { line: idx, ch: 0 }, { line: idx, ch: 0 });
          }
          cm.setCursor({ line: idx, ch: prevIndent + 4 });
          cm.focus();
        },
      });
    }
  }

  return issues;
}

function lintCode(code) {
  const lines = String(code || "").split("\n");
  const all = [];
  let prevColon = false;
  let prevIndent = 0;
  for (let i = 0; i < lines.length; i++) {
    const issues = lintLine(lines[i], i + 1, prevColon, prevIndent);
    all.push(...issues);
    const bare = stripLineComment(lines[i]).trimEnd();
    prevColon = bare.endsWith(":");
    prevIndent = (lines[i].match(/^ */) || [""])[0].length;
  }
  // keep first issue per line (priority order already in lintLine)
  const byLine = new Map();
  for (const iss of all) {
    if (!byLine.has(iss.line)) byLine.set(iss.line, iss);
  }
  return [...byLine.values()];
}

const lintTimers = {};
const lintMarks = {}; // editorId -> markers[]

function clearLintMarks(editorId) {
  const marks = lintMarks[editorId] || [];
  marks.forEach((m) => m.clear && m.clear());
  lintMarks[editorId] = [];
  const cm = editors[editorId];
  if (cm) {
    for (let i = 0; i < cm.lineCount(); i++) {
      cm.removeLineClass(i, "wrap", "cm-lint-line");
      cm.removeLineClass(i, "background", "cm-lint-bg");
    }
  }
}

function showLintBanner(editorId, issues) {
  const banner =
    document.getElementById("lint-" + editorId) ||
    document.getElementById("lint-code-" + editorId) ||
    document.getElementById("lint-" + resolveEditorKey(editorId));
  if (!banner) return;
  if (!issues.length) {
    banner.className = "lint-banner";
    banner.innerHTML = "";
    banner.style.display = "none";
    return;
  }
  banner.style.display = "block";
  banner.className = "lint-banner open";
  banner.innerHTML = issues
    .slice(0, 3)
    .map((iss, i) => {
      const fixId = `fix-${editorId}-${iss.line}-${iss.type}`;
      return `<div class="lint-item">
        <div class="lint-msg">${esc(iss.message)}</div>
        <button type="button" class="btn btn-sm lint-fix-btn" data-editor="${esc(editorId)}" data-line="${iss.line}" data-type="${esc(iss.type)}" id="${fixId}">${esc(iss.fixLabel)}</button>
      </div>`;
    })
    .join("");
  banner.querySelectorAll(".lint-fix-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const eid = btn.getAttribute("data-editor");
      const line = Number(btn.getAttribute("data-line"));
      const type = btn.getAttribute("data-type");
      const cm = resolveEditor(eid);
      if (!cm) return;
      const issues2 = lintCode(cm.getValue());
      const iss = issues2.find((x) => x.line === line && x.type === type) || issues2.find((x) => x.line === line);
      if (iss && iss.applyFix) {
        iss.applyFix(cm, line - 1);
        // re-lint after fix
        setTimeout(() => runLiveLint(eid), 50);
      }
    });
  });
}

function applyLintMarks(editorId, issues) {
  clearLintMarks(editorId);
  const cm = resolveEditor(editorId);
  const key = resolveEditorKey(editorId);
  if (!cm) return;
  const marks = [];
  issues.forEach((iss) => {
    const idx = iss.line - 1;
    if (idx < 0 || idx >= cm.lineCount()) return;
    cm.addLineClass(idx, "wrap", "cm-lint-line");
    cm.addLineClass(idx, "background", "cm-lint-bg");
    const lineText = cm.getLine(idx) || "";
    const from = { line: idx, ch: 0 };
    const to = { line: idx, ch: lineText.length };
    const mark = cm.markText(from, to, {
      className: "cm-lint-wave",
      title: iss.message.replace(/⚠️\s*/, ""),
    });
    marks.push(mark);
  });
  lintMarks[key] = marks;
}

function runLiveLint(editorId) {
  const cm = resolveEditor(editorId);
  if (!cm) return;
  const issues = lintCode(cm.getValue());
  applyLintMarks(editorId, issues);
  showLintBanner(editorId, issues);
  return issues;
}

function scheduleLiveLint(editorId) {
  clearTimeout(lintTimers[editorId]);
  lintTimers[editorId] = setTimeout(() => runLiveLint(editorId), 400);
}

function attachLiveLint(editorId, cm) {
  if (!cm) return;
  cm.on("change", () => scheduleLiveLint(editorId));
  // initial
  setTimeout(() => runLiveLint(editorId), 100);
}



function ideWindowFor(editorKey) {
  const candidates = [
    document.getElementById(editorKey),
    document.getElementById("code-" + editorKey),
  ].filter(Boolean);
  for (const node of candidates) {
    const win = node.closest(".ide-window");
    if (win) return win;
  }
  const cm = editors[editorKey] || editors["code-" + editorKey];
  if (cm) {
    try {
      const wrap = cm.getWrapperElement();
      if (wrap) return wrap.closest(".ide-window");
    } catch (e) {}
  }
  return null;
}

function setIdeRunning(editorKey, running) {
  const win = ideWindowFor(editorKey);
  if (!win) return;
  win.classList.toggle("is-running", !!running);
  let overlay = win.querySelector(".ide-loading");
  if (running) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "ide-loading";
      overlay.innerHTML = `
        <div class="ide-loading-card">
          <div class="ide-loading-spinner"></div>
          <div class="ide-loading-text">
            <strong>Đang chạy code…</strong>
            <span class="ide-loading-dots"><i></i><i></i><i></i></span>
          </div>
          <div class="ide-loading-bar"><span></span></div>
        </div>`;
      win.appendChild(overlay);
    }
    void overlay.offsetWidth;
    overlay.classList.add("show");
  } else if (overlay) {
    overlay.classList.remove("show");
    const remove = () => {
      if (overlay && !overlay.classList.contains("show")) overlay.remove();
    };
    overlay.addEventListener("transitionend", remove, { once: true });
    setTimeout(remove, 400);
  }
}

function flashTerminal(termBodyEl, kind) {
  if (!termBodyEl) return;
  const term = termBodyEl.closest(".terminal");
  termBodyEl.classList.remove("is-updating");
  void termBodyEl.offsetWidth;
  termBodyEl.classList.add("is-updating");
  if (term) {
    term.classList.remove("is-flash", "has-success", "has-error");
    void term.offsetWidth;
    term.classList.add("is-flash");
    if (kind === "ok") term.classList.add("has-success");
    if (kind === "err") term.classList.add("has-error");
  }
}

function bindIdeFocus(cm, editorKey) {
  if (!cm) return;
  cm.on("focus", () => {
    const win = ideWindowFor(editorKey);
    if (win) win.classList.add("is-focused");
  });
  cm.on("blur", () => {
    const win = ideWindowFor(editorKey);
    if (win) win.classList.remove("is-focused");
  });
}

function createEditor(textarea, opts = {}) {
  if (typeof CodeMirror === "undefined") return null;
  const cm = CodeMirror.fromTextArea(textarea, {
    mode: "python",
    theme: "material-darker",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    lineWrapping: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    extraKeys: {
      Tab: (cm) => {
        if (cm.somethingSelected()) cm.indentSelection("add");
        else cm.replaceSelection("    ", "end");
      },
      "Ctrl-Space": "autocomplete",
      Enter: (cm) => {
        const cur = cm.getCursor();
        const line = cm.getLine(cur.line);
        const trimmed = line.trimEnd();
        CodeMirror.commands.newlineAndIndent(cm);
        if (trimmed.endsWith(":")) {
          const indent = line.match(/^\s*/)[0];
          cm.replaceSelection(indent + "    ", "end");
        }
      },
    },
    hintOptions: { hint: pythonHint, completeSingle: false },
  });
  cm.on("inputRead", (cm, change) => {
    if (cm.display && cm.display.input && cm.display.input.composing) return;
    if (change.origin === "+compose" || change.origin === "*compose") return;
    if (!change.text || !change.text[0]) return;
    if (/^[a-zA-Z_]$/.test(change.text[0])) {
      CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
    }
  });
  const inputEl = cm.getInputField && cm.getInputField();
  if (inputEl) {
    inputEl.addEventListener("compositionstart", () => { cm.state._imeComposing = true; });
    inputEl.addEventListener("compositionend", () => {
      cm.state._imeComposing = false;
      if (typeof scheduleLiveLint === "function" && opts.editorId) scheduleLiveLint(opts.editorId);
    });
  }
  if (opts.minHeight) cm.getWrapperElement().style.minHeight = opts.minHeight;
  if (opts.editorId) attachLiveLint(opts.editorId, cm);
  return cm;
}

function resolveEditor(id) {
  if (!id) return null;
  if (editors[id]) return editors[id];
  if (editors["code-" + id]) return editors["code-" + id];
  const ta = document.getElementById(id) || document.getElementById("code-" + id);
  if (ta && ta.id && editors[ta.id]) return editors[ta.id];
  return null;
}
function resolveEditorKey(id) {
  if (!id) return id;
  if (editors[id]) return id;
  if (editors["code-" + id]) return "code-" + id;
  const ta = document.getElementById(id) || document.getElementById("code-" + id);
  if (ta && ta.id && editors[ta.id]) return ta.id;
  return id.startsWith("code-") || id === "playCode" || id === "demoCode" ? id : "code-" + id;
}
function getCode(id) {
  const cm = resolveEditor(id);
  if (cm) return cm.getValue();
  const el = document.getElementById("code-" + id) || document.getElementById(id);
  return el ? el.value : "";
}
function setCode(id, value) {
  const cm = resolveEditor(id);
  if (cm) { cm.setValue(value); cm.refresh(); return; }
  const el = document.getElementById("code-" + id) || document.getElementById(id);
  if (el) el.value = value;
}

function buildQuickbar(container, editorId) {
  if (!container) return;
  container.innerHTML = "";
  QUICK_KEYS.forEach((k) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "qb-btn";
    b.textContent = k.label;
    b.addEventListener("click", () => {
      const cm = resolveEditor(editorId);
      if (cm) {
        const cur = cm.getCursor();
        cm.replaceSelection(k.insert);
        if (k.cursor) {
          const after = cm.getCursor();
          cm.setCursor({ line: after.line, ch: after.ch + k.cursor });
        }
        cm.focus();
      } else {
        const ta = document.getElementById("code-" + editorId) || document.getElementById(editorId);
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const v = ta.value;
        ta.value = v.slice(0, start) + k.insert + v.slice(end);
        const pos = start + k.insert.length + (k.cursor || 0);
        ta.selectionStart = ta.selectionEnd = pos;
        ta.focus();
      }
    });
    container.appendChild(b);
  });
}

/* ---------- Auth ---------- */
function showAuth(mode) {
  mode = mode === "register" ? "register" : "login";
  window._authMode = mode;
  const reg = mode === "register";
  const set = (id, fn) => { const el = document.getElementById(id); if (el) fn(el); };
  set("tabLogin", (el) => { el.className = "ax-tab" + (reg ? "" : " active"); el.setAttribute("aria-selected", String(!reg)); });
  set("tabRegister", (el) => { el.className = "ax-tab" + (reg ? " active" : ""); el.setAttribute("aria-selected", String(reg)); });
  set("nameLabel", (el) => { el.style.display = reg ? "flex" : "none"; });
  set("userHint", (el) => { el.style.display = reg ? "block" : "none"; });
  set("passHint", (el) => { el.style.display = reg ? "block" : "none"; });
  set("authPass", (el) => el.setAttribute("autocomplete", reg ? "new-password" : "current-password"));
  set("authTitle", (el) => { el.textContent = reg ? "Tạo tài khoản" : "Chào mừng trở lại"; });
  set("authLead", (el) => { el.textContent = reg ? "Đăng ký tài khoản để dùng thử Pro và AI miễn phí trong 7 ngày. Không cần thanh toán." : "Đăng nhập để lưu tiến độ và tiếp tục lộ trình học."; });
  set("authSubmitBtn", (el) => { el.textContent = reg ? "Đăng ký & dùng thử miễn phí 7 ngày" : "Đăng nhập"; });
  set("authMsg", (el) => { el.textContent = ""; el.className = "ax-msg"; });
}
window._authMode = "login";

async function doAuth() {
  const u = document.getElementById("authUser").value.trim();
  const p = document.getElementById("authPass").value;
  const name = document.getElementById("authName").value.trim();
  const msg = document.getElementById("authMsg");
  const btn = document.getElementById("authSubmitBtn");
  const reg = window._authMode === "register";
  const fail = (t) => { msg.textContent = t; msg.className = "ax-msg err"; };
  if (!u || !p) return fail("Nhập tên đăng nhập và mật khẩu.");
  if (reg && !/^[A-Za-z0-9_.-]{3,30}$/.test(u)) return fail("Tên đăng nhập gồm 3 đến 30 ký tự: chữ không dấu, số, dấu _ . -");
  if (reg && p.length < 6) return fail("Mật khẩu cần tối thiểu 6 ký tự.");
  btn.disabled = true;
  msg.textContent = ""; msg.className = "ax-msg";
  try {
    const j = await api(reg ? "/api/register" : "/api/login", "POST",
      reg ? { username: u, password: p, displayName: name || u } : { username: u, password: p });
    CSRF = j.csrfToken;
    document.getElementById("authPass").value = "";
    await loadMe();
  } catch (e) {
    fail(e.message);
  } finally {
    btn.disabled = false;
  }
}

async function loadMe() {
  let j;
  try { j = await api("/api/me"); } catch (e) { showGuest(); return; }
  try {
    ME = j.user;
    CSRF = j.csrfToken;
    SCORES = j.scores;
    closeAuthPanel();
    const landing = document.getElementById("landingView");
    if (landing) landing.style.display = "none";
    document.getElementById("appView").style.display = "block";
    document.getElementById("progressWrap").style.display = "block";
    document.getElementById("xpBadge").style.display = "flex";
    document.getElementById("userBox").innerHTML =
      esc(ME.displayName) +
      ' <button class="btn btn-sm" onclick="logout()">Đăng xuất</button>';
    document.getElementById("adminNav").style.display =
      ME.role === "teacher" ? "inline-flex" : "none";
    updateScoreBar(j);
    const cur = await api("/api/curriculum");
    CHAPTERS = cur.chapters; GROUPS = cur.groups || GROUPS; PATHS = cur.paths || PATHS; TOPICS = cur.topics || TOPICS;
    GROUPS = cur.groups || [];
    renderRoadmap();
    renderHome();
    showView("home", document.querySelector('.navbtn[data-view="home"]'));
    // playground editor
    const playTa = document.getElementById("playCode");
    if (playTa && !editors.playCode) {
      editors.playCode = createEditor(playTa, { minHeight: "180px", editorId: "playCode" });
      buildQuickbar(document.getElementById("playQuickbar"), "playCode");
    }
  } catch (e) {
    console.error(e);
    showGuest();
    const msg = document.getElementById("authMsg");
    if (msg) { msg.textContent = "Đăng nhập được nhưng không tải được giáo trình: " + e.message; msg.className = "ax-msg err"; }
  }
}

function showGuest() {
  ME = null;
  const landing = document.getElementById("landingView");
  if (landing) landing.style.display = "block";
  document.getElementById("appView").style.display = "none";
  document.getElementById("progressWrap").style.display = "none";
  document.getElementById("xpBadge").style.display = "none";
  document.getElementById("userBox").innerHTML = "";
  initLandingDemo();
}


/* ---------- Progress bar animation ---------- */
function animateProgressBar(el, toPct, opts = {}) {
  if (!el) return;
  const duration = opts.duration || 900;
  const from = opts.from != null ? opts.from : 0;
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    el.style.width = toPct + "%";
    return;
  }
  // restart transition from current/from
  el.style.transition = "none";
  el.style.width = from + "%";
  void el.offsetWidth;
  el.style.transition = `width ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
  el.style.width = toPct + "%";
  // milestone
  if (toPct >= 25 && [25, 50, 75, 100].some((m) => from < m && toPct >= m)) {
    el.classList.remove("milestone");
    void el.offsetWidth;
    el.classList.add("milestone");
  }
}

function animateNumber(el, toVal, opts = {}) {
  if (!el) return;
  const duration = opts.duration || 800;
  const suffix = opts.suffix != null ? opts.suffix : "";
  const from = opts.from != null ? opts.from : 0;
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    el.textContent = toVal + suffix;
    return;
  }
  const start = performance.now();
  const diff = toVal - from;
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const v = Math.round(from + diff * eased);
    el.textContent = v + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function animateAllProgressIn(root) {
  const scope = root || document;
  scope.querySelectorAll(".progress-fill").forEach((fill, i) => {
    const target = parseFloat(fill.dataset.target || fill.style.width) || 0;
    const w = String(fill.style.width || "0").replace("%", "");
    const numeric = parseFloat(fill.dataset.target != null ? fill.dataset.target : w) || 0;
    fill.dataset.target = String(numeric);
    setTimeout(() => animateProgressBar(fill, numeric, { from: 0, duration: 900 + i * 40 }), 40 + i * 30);
  });
}

function updateScoreBar(j) {
  if (j && j.scores) SCORES = j.scores;
  const total = SCORES ? SCORES.total : 0;
  const pts = document.getElementById("totalPoints");
  const prev = pts ? pts.textContent : "";
  if (pts) {
    pts.textContent = total;
    if (String(prev) !== String(total) && prev !== "") {
      const badge = document.getElementById("xpBadge");
      if (badge) {
        badge.classList.remove("pulse");
        void badge.offsetWidth;
        badge.classList.add("pulse");
      }
    }
  }
  // progress: count completed exercises
  let done = 0, totalEx = 0;
  if (CHAPTERS && SCORES) {
    CHAPTERS.forEach((c) => {
      (c.exercises || []).forEach((e) => {
        totalEx++;
        if (SCORES.exerciseBest && (SCORES.exerciseBest[e.id] || 0) > 0) done++;
      });
    });
  }
  // 1.2.3: totalEx = 0 before curriculum finishes loading (old bug: showed 0/0 even when XP existed).
  // Hide the progress bar instead of showing 0/0; show it again once real data is loaded.
  const wrapEl = document.getElementById("progressWrap");
  if (!totalEx) {
    if (wrapEl) wrapEl.style.display = "none";
    return;
  }
  if (wrapEl) wrapEl.style.display = "block";
  const pct = Math.round((done / totalEx) * 100);
  const pctEl = document.getElementById("progressPct");
  const fillEl = document.getElementById("progressFill");
  const prevPct = pctEl ? parseInt(String(pctEl.textContent).replace("%", ""), 10) || 0 : 0;
  if (pctEl) animateNumber(pctEl, pct, { from: prevPct, suffix: "%", duration: 700 });
  if (fillEl) {
    fillEl.dataset.target = String(pct);
    animateProgressBar(fillEl, pct, { from: prevPct, duration: 900 });
  }
  const label = document.getElementById("progressLabel");
  if (label) label.textContent = done + "/" + totalEx + " bài";
}

async function logout() {
  try { await api("/api/logout", "POST", {}); } catch (e) {}
  ME = null; CSRF = "";
  location.reload();
}

function showView(name, btn) {
  document.querySelectorAll(".navbtn").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  for (const v of ["home", "roadmap", "playground", "leaderboard", "rating", "certificate", "admin", "password"]) {
    const el = document.getElementById("view-" + v);
    if (!el) continue;
    if (v === name) {
      el.style.display = "block";
      el.classList.remove("view");
      void el.offsetWidth;
      el.classList.add("view");
    } else {
      el.style.display = "none";
    }
  }
  if (name === "home") renderHome();
  if (name === "leaderboard") loadLeaderboard();
  if (name === "rating") loadRating();
  if (name === "certificate") loadCertificate();
  if (name === "admin") loadAdmin();
  if (name === "playground" && editors.playCode) {
    setTimeout(() => editors.playCode.refresh(), 50);
  }
}



/* ---------- Student Home Dashboard ---------- */
function renderHome() {
  const el = document.getElementById("view-home");
  if (!el || !ME) return;

  let done = 0, totalEx = 0, nextEx = null;
  const chapterStats = [];
  (CHAPTERS || []).forEach((c) => {
    let cDone = 0;
    const list = c.exercises || [];
    list.forEach((e) => {
      totalEx++;
      const best = SCORES && SCORES.exerciseBest ? (SCORES.exerciseBest[e.id] || 0) : 0;
      if (best > 0) { done++; cDone++; }
      else if (!nextEx && isExerciseUnlocked(e.id)) nextEx = { ...e, chapterTitle: c.title };
    });
    chapterStats.push({
      id: c.id, title: c.title, done: cDone, total: list.length,
      pct: list.length ? Math.round((cDone / list.length) * 100) : 0,
    });
  });
  const pct = totalEx ? Math.round((done / totalEx) * 100) : 0;
  const totalXp = SCORES ? (SCORES.total || 0) : 0;
  const exXp = SCORES ? (SCORES.exerciseTotal || 0) : 0;
  const examXp = SCORES ? (SCORES.examTotal || 0) : 0;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  el.innerHTML = `
  <section class="uh-hero">
    <div class="uh-hero-text">
      <p class="uh-greet">${greet}, <strong>${esc(ME.displayName)}</strong></p>
      <h1>Tiếp tục học Python</h1>
      <p class="uh-lead">Hoàn thành <strong>${done}/${totalEx}</strong> bài · <strong>${pct}%</strong> lộ trình</p>
      <div class="uh-actions">
        ${nextEx
          ? `<button class="btn btn-primary btn-lg" onclick="continueLearning()">▶ ${esc(nextEx.title)}</button>`
          : `<button class="btn btn-primary btn-lg" onclick="showView('roadmap', document.querySelector('.navbtn[data-view=roadmap]'))">📚 Lộ trình</button>`}
        <button class="btn btn-lg hl-btn-outline" onclick="showView('playground', document.querySelector('.navbtn[data-view=playground]'))">Playground</button>
      </div>
    </div>
    <div class="uh-ring-wrap">
      <div class="home-ring" id="homeRing" style="--p:0">
        <div class="home-ring-inner">
          <span class="home-ring-pct" id="homeRingPct">0%</span>
          <span class="home-ring-lbl">hoàn thành</span>
        </div>
      </div>
    </div>
  </section>

  <section class="uh-stats">
    <div class="uh-stat"><b>${totalXp}</b><span>XP</span></div>
    <div class="uh-stat"><b>${exXp}</b><span>Bài tập</span></div>
    <div class="uh-stat"><b>${examXp}</b><span>Kiểm tra</span></div>
    <div class="uh-stat"><b>${done}</b><span>Đã đạt</span></div>
  </section>

  <section class="card uh-block">
    <div class="uh-block-head">
      <h2>Lộ trình gợi ý</h2>
      <button class="btn btn-sm" onclick="showView('roadmap', document.querySelector('.navbtn[data-view=roadmap]'))">Tất cả</button>
    </div>
    <div class="path-cards">
      ${(PATHS || []).slice(0, 4).map((p) => {
        const pDone = (p.exerciseIds || []).filter((id) => SCORES && SCORES.exerciseBest && (SCORES.exerciseBest[id] || 0) > 0).length;
        const pTotal = (p.exerciseIds || []).length;
        const pPct = pTotal ? Math.round((pDone / pTotal) * 100) : 0;
        return `<button class="path-card" style="--gc:${p.color}" onclick="activePath='${p.id}';activeGroup='all';showView('roadmap', document.querySelector('.navbtn[data-view=roadmap]'))">
          <span class="path-card-ico">${p.icon}</span>
          <div class="path-card-body">
            <strong>${esc(p.title)}</strong>
            <span class="muted path-card-sub">${esc(p.subtitle || "")}</span>
            <div class="path-card-foot">
              <div class="progress-track"><div class="progress-fill" data-target="${pPct}" style="width:0%"></div></div>
              <span class="muted" style="font-size:12px">${pDone}/${pTotal} bài · ${pPct}%</span>
            </div>
          </div>
        </button>`;
      }).join("")}
    </div>
  </section>

  <section class="card uh-block">
    <div class="uh-block-head"><h2>Tiến độ chương</h2></div>
    <div class="chapter-progress-list">
      ${chapterStats.slice(0, 6).map((c) => `
        <div class="chapter-progress-item" onclick="showView('roadmap', document.querySelector('.navbtn[data-view=roadmap]'))">
          <div class="cp-top"><span class="cp-title">${esc(c.title)}</span><span class="cp-meta">${c.done}/${c.total} · ${c.pct}%</span></div>
          <div class="progress-track"><div class="progress-fill" data-target="${c.pct}" style="width:0%"></div></div>
        </div>`).join("")}
    </div>
    <div style="margin-top:14px"><button class="btn btn-sm" onclick="showView('roadmap', document.querySelector('.navbtn[data-view=roadmap]'))">Xem tất cả chương →</button></div>
  </section>

  <section class="card uh-block">
    <div class="uh-block-head"><h2>Truy cập nhanh</h2></div>
    <div class="quick-grid">
      <button class="quick-tile" onclick="showView('roadmap', document.querySelector('.navbtn[data-view=roadmap]'))"><span>📚</span>Lộ trình</button>
      <button class="quick-tile" onclick="showView('playground', document.querySelector('.navbtn[data-view=playground]'))"><span>🧪</span>Playground</button>
      <button class="quick-tile" onclick="showView('leaderboard', document.querySelector('.navbtn[data-view=leaderboard]'))"><span>🏆</span>Xếp hạng</button>
      <button class="quick-tile" onclick="showView('certificate', document.querySelector('.navbtn[data-view=certificate]'))"><span>📜</span>Chứng nhận</button>
      ${ME.role === "teacher" ? `<button class="quick-tile admin-tile" onclick="showView('admin', document.querySelector('.navbtn[data-view=admin]'))"><span>⚙️</span>Bảng điều khiển</button>` : ""}
    </div>
  </section>`;

  // 1.2.3: sync header after real CHAPTERS + SCORES are loaded (fixes 0/0 bug right after login)
  if (typeof updateScoreBar === "function") updateScoreBar({ scores: SCORES });
  requestAnimationFrame(() => {
    const ring = document.getElementById("homeRing");
    const ringPct = document.getElementById("homeRingPct");
    if (ring) {
      const startT = performance.now();
      const dur = 900;
      const target = pct;
      function tick(now) {
        const t = Math.min(1, (now - startT) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        const v = Math.round(target * eased);
        ring.style.setProperty("--p", v);
        if (ringPct) ringPct.textContent = v + "%";
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    if (typeof animateAllProgressIn === "function") animateAllProgressIn(el);
  });
}


function continueLearning() {
  showView("roadmap", document.querySelector('.navbtn[data-view="roadmap"]'));
  // scroll to first unlocked incomplete
  setTimeout(() => {
    const all = getOrderedExerciseIds();
    for (const id of all) {
      const best = SCORES && SCORES.exerciseBest ? (SCORES.exerciseBest[id] || 0) : 0;
      if (best <= 0 && isExerciseUnlocked(id)) {
        const node = document.getElementById("ex-" + id);
        if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
        break;
      }
    }
  }, 100);
}

/* ---------- Sequential unlock ---------- */
function getOrderedExerciseIds() {
  if (activePath) {
    const p = (PATHS || []).find((x) => x.id === activePath);
    if (p && p.exerciseIds && p.exerciseIds.length) return p.exerciseIds.slice();
  }
  const all = [];
  CHAPTERS.forEach((c) => (c.exercises || []).forEach((e) => all.push(e.id)));
  return all;
}

function isExerciseUnlocked(exerciseId) {
  const all = getOrderedExerciseIds();
  const idx = all.indexOf(exerciseId);
  if (idx < 0) {
    // not in current path filter — if filtering by path, lock outsiders
    if (activePath) return false;
    return true;
  }
  if (idx === 0) return true;
  const prevId = all[idx - 1];
  const best = SCORES && SCORES.exerciseBest ? (SCORES.exerciseBest[prevId] || 0) : 0;
  return best > 0;
}

function findExerciseLocal(id) {
  for (const c of CHAPTERS || []) {
    const e = (c.exercises || []).find((x) => x.id === id);
    if (e) return { exercise: e, chapter: c };
  }
  return null;
}

function isExerciseDone(exerciseId) {
  return !!(SCORES && SCORES.exerciseBest && (SCORES.exerciseBest[exerciseId] || 0) > 0);
}

function buildUnlockedExerciseHtml(e, opts = {}) {
  const best = SCORES && SCORES.exerciseBest ? (SCORES.exerciseBest[e.id] || 0) : 0;
  const doneEx = best > 0;
  const dayLabel = opts.dayLabel || "";
  const chapterNote = opts.chapterTitle
    ? `<p class="muted" style="margin:0 0 8px">Thuộc: ${esc(opts.chapterTitle)}</p>`
    : "";
  const titlePrefix = dayLabel ? `<span class="day-badge">${esc(dayLabel)}</span> ` : "";
  return `<div class="exercise" id="ex-${e.id}">
    <div class="ex-head">
      <h3>${titlePrefix}${esc(e.title)} ${doneEx ? "✅" : ""}</h3>
      <span class="pill ${doneEx ? "pill-ok" : ""}" data-pill-for="${e.id}">${doneEx ? best + " XP" : "Chưa đạt"}</span>
    </div>
    ${chapterNote}
    <div class="prompt">${formatPrompt(e.prompt)}</div>
    <div class="ide-window">
      <div class="ide-titlebar">
        <div class="traffic"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
        <span class="ide-filename">${e.id}.py</span>
      </div>
      <div class="quickbar" id="qb-${e.id}"></div>
      <textarea id="code-${e.id}" class="code-area">${esc(e.starter || "")}</textarea>
      <div class="terminal"><div class="terminal-label">Output</div><pre id="out-${e.id}" class="terminal-body"></pre></div>
    </div>
    <div class="lint-banner" id="lint-code-${e.id}" style="display:none"></div>
    <div class="sticky-actions">
      <button class="btn btn-primary" onclick="runExercise('${e.id}')">▶ Chạy &amp; Kiểm tra</button>
      <button class="btn" onclick="showSample('${e.id}')">Đáp án mẫu</button>
    </div>
    <div id="fb-${e.id}" class="feedback" style="display:none"></div>
  </div>`;
}
function mountExerciseEditor(exerciseId) {
  const ta = document.getElementById("code-" + exerciseId);
  if (!ta) return null;
  const key = "code-" + exerciseId;
  if (editors[key]) { try { editors[key].refresh(); } catch (e) {} return editors[key]; }
  editors[key] = createEditor(ta, { minHeight: "160px", editorId: key });
  buildQuickbar(document.getElementById("qb-" + exerciseId), key);
  return editors[key];
}
function focusExerciseEditor(exerciseId) {
  const cm = resolveEditor(exerciseId);
  if (!cm) return;
  try {
    cm.focus();
    const last = cm.lineCount() - 1;
    cm.setCursor({ line: last, ch: (cm.getLine(last) || "").length });
    cm.refresh();
  } catch (e) {}
}
function highlightExerciseCard(exerciseId) {
  const el = document.getElementById("ex-" + exerciseId);
  if (!el) return;
  el.classList.remove("exercise-flash");
  void el.offsetWidth;
  el.classList.add("exercise-flash");
  setTimeout(() => el.classList.remove("exercise-flash"), 1400);
}
function ensureNextExerciseReady(fromId) {
  const order = getOrderedExerciseIds();
  const idx = order.indexOf(fromId);
  if (idx < 0 || idx >= order.length - 1) return null;
  const nextId = order[idx + 1];
  if (!isExerciseUnlocked(nextId)) return null;
  let host = document.getElementById("ex-" + nextId);
  if (!host) return nextId;
  if (host.classList.contains("exercise-locked") || !host.querySelector(".ide-window")) {
    const found = findExerciseLocal(nextId);
    if (found) {
      let dayLabel = "";
      if (activePath) {
        const p = (PATHS || []).find((x) => x.id === activePath);
        dayLabel = p && p.days ? "Ngày " + (idx + 2) : "Bài " + (idx + 2);
      }
      host.outerHTML = buildUnlockedExerciseHtml(found.exercise, {
        dayLabel,
        chapterTitle: activePath ? found.chapter.title : "",
      });
      mountExerciseEditor(nextId);
    }
  } else mountExerciseEditor(nextId);
  return nextId;
}
function softUpdateAfterGrade(id, bestScore) {
  const host = document.getElementById("ex-" + id);
  if (host) {
    const pill = host.querySelector(".pill, [data-pill-for]");
    if (pill) { pill.classList.add("pill-ok"); pill.textContent = (bestScore || 0) + " XP"; }
    const h3 = host.querySelector(".ex-head h3");
    if (h3 && !h3.textContent.includes("✅")) h3.insertAdjacentText("beforeend", " ✅");
    host.classList.remove("exercise-locked");
  }
  ensureNextExerciseReady(id);
}


/* ---------- Highlight keywords in prompts ---------- */
function formatPrompt(text) {
  // Unicode-safe: never highlight single letters (JS \b breaks on non-ASCII words)
  let s = esc(text).replace(/\n/g, "<br>");
  const tokens = [
    "print", "range", "input", "len", "int", "str", "float", "sum",
    "elif", "else", "while", "return", "True", "False", "None",
    "append", "f-string", "fstring",
    "diem", "tuoi", "ten", "gia", "so_luong", "tong", "nums", "arr", "lst",
    "score", "age", "name", "price", "count", "total", "text", "msg",
    "if", "for", "def", "and", "or", "not", "in", "list",
  ];
  tokens.sort((a, b) => b.length - a.length);
  for (const w of tokens) {
    const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let re;
    try {
      re = new RegExp("(?<![\\p{L}\\p{N}_])(" + escaped + ")(?![\\p{L}\\p{N}_])", "gu");
    } catch (err) {
      re = new RegExp("(?<![A-Za-z0-9_À-ỹ])(" + escaped + ")(?![A-Za-z0-9_À-ỹ])", "g");
    }
    s = s.replace(re, '<code class="inline-code">$1</code>');
  }
  s = s.replace(/(&gt;=|&lt;=|==|!=|&gt;|&lt;)/g, '<code class="inline-code">$1</code>');
  return s;
}

/* ---------- Roadmap ---------- */
function renderRoadmap() {
  const el = document.getElementById("view-roadmap");
  if (!el) return;

  const pathChips = [
    `<button type="button" class="group-chip ${!activePath ? "active" : ""}" onclick="setPathFilter(null)">Lộ trình đầy đủ</button>`,
    ...(PATHS || []).map((p) =>
      `<button type="button" class="group-chip ${activePath === p.id ? "active" : ""}" style="--gc:${p.color}" onclick="setPathFilter('${p.id}')">${p.icon} ${esc(p.title)}</button>`
    ),
  ].join("");

  const groupChips = activePath ? "" : [
    `<button type="button" class="group-chip ${activeGroup === "all" ? "active" : ""}" onclick="setGroupFilter('all')">Nhóm: Tất cả</button>`,
    ...(GROUPS || []).map((g) =>
      `<button type="button" class="group-chip ${activeGroup === g.id ? "active" : ""}" style="--gc:${g.color}" onclick="setGroupFilter('${g.id}')">${g.icon} ${esc(g.title)}</button>`
    ),
  ].join("");

  const topicChips = [
    `<button type="button" class="topic-chip ${!activeTopic ? "active" : ""}" onclick="setTopicFilter(null)">Chủ đề: Tất cả</button>`,
    ...(TOPICS || []).map((t) =>
      `<button type="button" class="topic-chip ${activeTopic === t.id ? "active" : ""}" onclick="setTopicFilter('${t.id}')">${esc(t.label)}</button>`
    ),
  ].join("");

  // PATH MODE: flat ordered list of exercises
  if (activePath) {
    const p = (PATHS || []).find((x) => x.id === activePath);
    if (!p) { activePath = null; return renderRoadmap(); }
    let ids = p.exerciseIds.slice();
    if (activeTopic) {
      const topic = (TOPICS || []).find((t) => t.id === activeTopic);
      if (topic) {
        ids = ids.filter((id) => {
          const found = findExerciseLocal(id);
          if (!found) return false;
          const req = found.exercise.require || [];
          return topic.match.some((m) => req.includes(m));
        });
      }
    }
    let done = 0;
    ids.forEach((id) => {
      if (SCORES && SCORES.exerciseBest && (SCORES.exerciseBest[id] || 0) > 0) done++;
    });
    const pct = ids.length ? Math.round((done / ids.length) * 100) : 0;

    let weekHtml = "";
    if (p.weeks) {
      weekHtml = `<div class="path-weeks">${Object.entries(p.weeks).map(([wname, wids]) => {
        const wd = wids.filter((id) => SCORES && SCORES.exerciseBest && (SCORES.exerciseBest[id] || 0) > 0).length;
        return `<div class="path-week"><strong>${esc(wname)}</strong><span>${wd}/${wids.length}</span></div>`;
      }).join("")}</div>`;
    }

    const items = ids.map((id, i) => {
      const found = findExerciseLocal(id);
      if (!found) return "";
      const e = found.exercise;
      const unlocked = isExerciseUnlocked(id);
      const best = SCORES && SCORES.exerciseBest ? (SCORES.exerciseBest[id] || 0) : 0;
      const doneEx = best > 0;
      const dayLabel = p.days ? `Ngày ${i + 1}` : `Bài ${i + 1}`;
      if (!unlocked) {
        return `<div class="exercise exercise-locked" id="ex-${e.id}">
          <div class="ex-head"><h3><span class="day-badge">${dayLabel}</span> ${esc(e.title)}</h3><span class="pill">🔒 Khóa</span></div>
          <p class="muted">Hoàn thành bài trước trong lộ trình này để mở.</p>
        </div>`;
      }
      return `<div class="exercise" id="ex-${e.id}">
        <div class="ex-head">
          <h3><span class="day-badge">${dayLabel}</span> ${esc(e.title)} ${doneEx ? "✅" : ""}</h3>
          <span class="pill ${doneEx ? "pill-ok" : ""}">${doneEx ? best + " XP" : "Chưa đạt"}</span>
        </div>
        <p class="muted" style="margin:0 0 8px">Thuộc: ${esc(found.chapter.title)}</p>
        <div class="prompt">${formatPrompt(e.prompt)}</div>
        <div class="ide-window">
          <div class="ide-titlebar">
            <div class="traffic"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
            <span class="ide-filename">${e.id}.py</span>
          </div>
          <div class="quickbar" id="qb-${e.id}"></div>
          <textarea id="code-${e.id}" class="code-area">${esc(e.starter || "")}</textarea>
          <div class="terminal"><div class="terminal-label">Output</div><pre id="out-${e.id}" class="terminal-body"></pre></div>
        </div>
        <div class="lint-banner" id="lint-code-${e.id}" style="display:none"></div>
        <div class="sticky-actions">
          <button class="btn btn-primary" onclick="runExercise('${e.id}')">▶ Chạy &amp; Kiểm tra</button>
          <button class="btn" onclick="showSample('${e.id}')">Đáp án mẫu</button>
        </div>
        <div id="fb-${e.id}" class="feedback" style="display:none"></div>
      </div>`;
    }).join("");

    el.innerHTML = `
      <div class="roadmap-toolbar">
        <div class="group-chips">${pathChips}</div>
        <div class="topic-chips">${topicChips}</div>
      </div>
      <div class="group-banner" style="--gc:${p.color}">
        <span class="group-banner-ico">${p.icon}</span>
        <div style="flex:1">
          <strong>${esc(p.title)}</strong>
          <p class="muted">${esc(p.subtitle || "")}</p>
          <div class="progress-track" style="margin-top:10px"><div class="progress-fill" data-target="${pct}" style="width:0%"></div></div>
          <p class="muted" style="margin-top:6px">${done}/${ids.length} bài · ${pct}%</p>
          ${weekHtml}
        </div>
      </div>
      ${items}
    `;

    setTimeout(() => {
      ids.forEach((id) => {
        if (!isExerciseUnlocked(id)) return;
        const ta = document.getElementById("code-" + id);
        if (ta && !editors["code-" + id]) {
          editors["code-" + id] = createEditor(ta, { minHeight: "160px", editorId: "code-" + id });
          buildQuickbar(document.getElementById("qb-" + id), "code-" + id);
        }
      });
      animateAllProgressIn(el);
    }, 30);
    return;
  }

  // FULL / GROUP MODE
  let list = CHAPTERS || [];
  if (activeGroup && activeGroup !== "all") {
    const g = (GROUPS || []).find((x) => x.id === activeGroup);
    if (g) list = list.filter((c) => g.chapters.includes(c.id));
  }

  const groupBanner = (activeGroup !== "all")
    ? (() => {
        const g = (GROUPS || []).find((x) => x.id === activeGroup);
        return g ? `<div class="group-banner" style="--gc:${g.color}"><span class="group-banner-ico">${g.icon}</span><div><strong>${esc(g.title)}</strong><p class="muted">${esc(g.subtitle || "")}</p></div></div>` : "";
      })()
    : `<div class="group-banner all"><span class="group-banner-ico">📚</span><div><strong>Lộ trình Python đầy đủ</strong><p class="muted">Chọn <b>Python 30 ngày</b> / <b>Ôn thi 4 tuần</b> hoặc lọc theo chủ đề phía trên.</p></div></div>`;

  const body = list.map((c) => {
    let exercises = (c.exercises || []).slice();
    if (activeTopic) {
      const topic = (TOPICS || []).find((t) => t.id === activeTopic);
      if (topic) {
        exercises = exercises.filter((e) => {
          const req = e.require || [];
          return topic.match.some((m) => req.includes(m));
        });
      }
    }
    if (!exercises.length) return "";

    let done = 0;
    exercises.forEach((e) => {
      if (SCORES && SCORES.exerciseBest && (SCORES.exerciseBest[e.id] || 0) > 0) done++;
    });
    const pct = exercises.length ? Math.round((done / exercises.length) * 100) : 0;
    let statusClass = "status-locked", statusText = "Chưa mở";
    if (done === exercises.length && exercises.length) { statusClass = "status-done"; statusText = "Hoàn thành"; }
    else if (done > 0 || (exercises[0] && isExerciseUnlocked(exercises[0].id))) { statusClass = "status-current"; statusText = "Đang học"; }

    let tag = "";
    (GROUPS || []).forEach((g) => {
      if (g.chapters.includes(c.id)) tag = `<span class="chapter-group-tag" style="--gc:${g.color}">${g.icon} ${esc(g.title)}</span>`;
    });

    const exHtml = exercises.map((e) => {
      const unlocked = isExerciseUnlocked(e.id);
      const best = SCORES && SCORES.exerciseBest ? (SCORES.exerciseBest[e.id] || 0) : 0;
      const doneEx = best > 0;
      if (!unlocked) {
        return `<div class="exercise exercise-locked" id="ex-${e.id}">
          <div class="ex-head"><h3>${esc(e.title)}</h3><span class="pill">🔒 Khóa</span></div>
          <p class="muted">Hoàn thành bài trước để mở bài này.</p>
        </div>`;
      }
      return `<div class="exercise" id="ex-${e.id}">
        <div class="ex-head">
          <h3>${esc(e.title)} ${doneEx ? "✅" : ""}</h3>
          <span class="pill ${doneEx ? "pill-ok" : ""}">${doneEx ? best + " XP" : "Chưa đạt"}</span>
        </div>
        <div class="prompt">${formatPrompt(e.prompt)}</div>
        <div class="ide-window">
          <div class="ide-titlebar">
            <div class="traffic"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
            <span class="ide-filename">${e.id}.py</span>
          </div>
          <div class="quickbar" id="qb-${e.id}"></div>
          <textarea id="code-${e.id}" class="code-area">${esc(e.starter || "")}</textarea>
          <div class="terminal"><div class="terminal-label">Output</div><pre id="out-${e.id}" class="terminal-body"></pre></div>
        </div>
        <div class="lint-banner" id="lint-code-${e.id}" style="display:none"></div>
        <div class="sticky-actions">
          <button class="btn btn-primary" onclick="runExercise('${e.id}')">▶ Chạy &amp; Kiểm tra</button>
          <button class="btn" onclick="showSample('${e.id}')">Đáp án mẫu</button>
        </div>
        <div id="fb-${e.id}" class="feedback" style="display:none"></div>
      </div>`;
    }).join("");

    return `<section class="card chapter-card" id="chapter-${c.id}">
      <div class="chapter-header">
        <div>
          ${tag}
          <h2>${esc(c.title)}</h2>
          <p class="muted">${done}/${exercises.length} bài · ${pct}%</p>
        </div>
        <span class="chapter-status ${statusClass}">${statusText}</span>
      </div>
      <div class="progress-track chapter-progress"><div class="progress-fill" data-target="${pct}" style="width:0%"></div></div>
      <details class="theory-box"><summary>Lý thuyết &amp; ví dụ</summary>
        <p>${esc(c.theory || "")}</p>
        <pre class="code-block">${esc(c.example || "")}</pre>
      </details>
      ${exHtml}
    </section>`;
  }).join("");

  el.innerHTML = `
    <div class="roadmap-toolbar">
      <div class="group-chips">${pathChips}</div>
      <div class="group-chips" style="margin-top:8px">${groupChips}</div>
      <div class="topic-chips">${topicChips}</div>
    </div>
    ${groupBanner}
    ${body || '<div class="card"><p class="muted">Không có bài phù hợp bộ lọc.</p></div>'}
  `;

  setTimeout(() => {
    list.forEach((c) => {
      (c.exercises || []).forEach((e) => {
        if (activeTopic) {
          const topic = (TOPICS || []).find((t) => t.id === activeTopic);
          const req = e.require || [];
          if (topic && !topic.match.some((m) => req.includes(m))) return;
        }
        if (!isExerciseUnlocked(e.id)) return;
        const ta = document.getElementById("code-" + e.id);
        if (ta && !editors["code-" + e.id]) {
          editors["code-" + e.id] = createEditor(ta, { minHeight: "160px", editorId: "code-" + e.id });
          buildQuickbar(document.getElementById("qb-" + e.id), "code-" + e.id);
        }
      });
    });
    animateAllProgressIn(el);
  }, 30);
}

function setGroupFilter(id) {
  activeGroup = id || "all";
  activePath = null;
  renderRoadmap();
}

function setPathFilter(id) {
  activePath = id || null;
  if (id) activeGroup = "all";
  renderRoadmap();
}

function setTopicFilter(id) {
  activeTopic = id || null;
  renderRoadmap();
}


function resetCode(id) {
  for (const c of CHAPTERS) {
    const e = c.exercises.find((x) => x.id === id);
    if (e) {
      setCode(id, e.starter || "");
      const _fb = document.getElementById("fb-" + id) || document.getElementById("res-" + id);
      if (_fb) { _fb.innerHTML = ""; _fb.style.display = "none"; }
      const out = document.getElementById("out-" + id);
      if (out) out.textContent = "";
      clearLintMarks(id);
      showLintBanner(id, []);
      setTimeout(() => runLiveLint(id), 80);
      return;
    }
  }
}

function renderErrors(errors) {
  if (!errors || !errors.length) return "";
  return errors
    .map(
      (e) => `<div class="diag-row">
      <div class="diag-cause">
        <div class="label">Nguyên nhân / Dòng lỗi</div>
        <div>${e.line ? "Dòng " + e.line + ": " : ""}${esc(e.message)}</div>
      </div>
      ${e.fix ? `<div class="diag-hint"><div class="label">💡 Gợi ý sửa nhanh</div><div>${esc(e.fix)}</div></div>` : ""}
    </div>`
    )
    .join("");
}

async function submitExercise(id) {
  if (!isExerciseUnlocked(id)) {
    alert("Bạn cần hoàn thành bài trước đó trước khi làm bài này.");
    return;
  }
  const code = getCode(id);
  const retryMap = window.__plSubmitRetryKeys || (window.__plSubmitRetryKeys = new Map());
  const pending = retryMap.get(id);
  const requestKey = pending && pending.code === code
    ? pending.key
    : (crypto.randomUUID ? crypto.randomUUID() : `pl-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`);
  retryMap.set(id, { code, key: requestKey });
  const box = document.getElementById("fb-" + id) || document.getElementById("res-" + id);
  const btn = document.getElementById("btn-" + id) || document.querySelector(`#ex-${id} .btn-primary`);
  const outEl = document.getElementById("out-" + id);
  const liveIssues = runLiveLint(id) || [];
  setIdeRunning(id, true);
  setIdeRunning("code-" + id, true);
  if (btn) {
    btn.classList.add("loading");
    btn.innerHTML = '<span class="spinner"></span> Đang chấm...';
  }
  if (box) { box.style.display = "block"; box.innerHTML = ""; }
  try {
    const j = await api("/api/exercises/" + id + "/submit", "POST", { code }, { headers: { "Idempotency-Key": requestKey } });
    retryMap.delete(id);
    if (outEl) {
      outEl.textContent = j.output || "";
      flashTerminal(outEl, j.passed ? "ok" : "err");
    }
    if (j.passed) {
      if (box) box.innerHTML = `<div class="feedback feedback-success">
        <div class="fb-title">✓ Chính xác! +${j.score} điểm</div>
        <div style="font-size:13px;color:var(--muted)">Lần nộp ${j.attemptNo} · hệ số ${j.percent}% · Điểm cao nhất: ${j.bestScore}/10 · Tổng: ${j.totalPoints} XP</div>
        <div class="fb-actions"><button class="btn btn-primary" onclick="scrollNext('${id}')">Bài tiếp theo ➔</button></div>
      </div>`;
    } else {
      if (box) box.innerHTML = `<div class="feedback feedback-error">
        <div style="font-weight:600;margin-bottom:10px;color:var(--text-2)">Chưa đạt (lần nộp ${j.attemptNo})</div>
        ${renderErrors(j.errors)}
      </div>`;
    }
    SCORES = {
      exerciseBest: { ...(SCORES ? SCORES.exerciseBest : {}), [id]: j.bestScore },
      examBest: SCORES ? SCORES.examBest : {},
      exerciseTotal: SCORES ? (SCORES.exerciseTotal || 0) : 0,
      examTotal: SCORES ? (SCORES.examTotal || 0) : 0,
      total: j.totalPoints,
    };
    if (document.getElementById("totalPoints")) document.getElementById("totalPoints").textContent = j.totalPoints;
    updateScoreBar({ scores: SCORES });
    SCORES.exerciseTotal = SCORES.exerciseTotal || 0;
    SCORES.examTotal = SCORES.examTotal || 0;
    api("/api/progress").then((prog) => {
      if (prog && prog.scores) { SCORES = prog.scores; updateScoreBar({ scores: SCORES }); }
    }).catch(() => {});
    if (j.passed || j.bestScore > 0) {
      softUpdateAfterGrade(id, j.bestScore);
    }
  } catch (e) {
    if (box) box.innerHTML = `<div class="feedback feedback-error"><div class="diag-cause">${esc(e.message)}</div></div>`;
  } finally {
    setIdeRunning(id, false);
    setIdeRunning("code-" + id, false);
    if (btn) {
      btn.classList.remove("loading");
      btn.innerHTML = "▶ Chạy & Kiểm tra";
    }
  }
}

async function runExercise(id) {
  return submitExercise(id);
}

function scrollNext(fromId) {
  const nextId = ensureNextExerciseReady(fromId);
  if (!nextId) {
    const box = document.getElementById("fb-" + fromId);
    if (box) {
      const note = document.createElement("p");
      note.className = "muted";
      note.style.marginTop = "8px";
      note.textContent = "Bạn đã hết bài trong lộ trình này.";
      box.appendChild(note);
    }
    return;
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const next = document.getElementById("ex-" + nextId);
      if (!next) return;
      const topbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--topbar-h")) || 64;
      const y = next.getBoundingClientRect().top + window.scrollY - topbarH - 12;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      highlightExerciseCard(nextId);
      setTimeout(() => { mountExerciseEditor(nextId); focusExerciseEditor(nextId); }, 380);
    });
  });
}

/* ---------- Sample drawer ---------- */
async function showSample(id) {
  sampleTargetId = id;
  try {
    const j = await api("/api/exercises/" + id + "/sample");
    document.getElementById("drawerCode").textContent = j.sample || "";
    document.getElementById("sampleDrawer").classList.add("open");
    document.getElementById("drawerBackdrop").classList.add("open");
  } catch (e) {
    alert(e.message);
  }
}
function closeDrawer() {
  document.getElementById("sampleDrawer").classList.remove("open");
  document.getElementById("drawerBackdrop").classList.remove("open");
}
document.getElementById("copySampleBtn")?.addEventListener("click", () => {
  const code = document.getElementById("drawerCode").textContent;
  if (sampleTargetId && code) {
    setCode(sampleTargetId, code);
    closeDrawer();
  }
});

/* ---------- Playground ---------- */
async function runPlayground() {
  const code = getCode("playCode");
  setIdeRunning("playCode", true);
  try {
    const j = await api("/api/run", "POST", { code });
    const out = document.getElementById("playOut");
    if (out) {
      out.textContent = j.output || "(không in ra gì)";
      flashTerminal(out, (j.errors && j.errors.length) ? "err" : "ok");
    }
    document.getElementById("playErr").innerHTML = renderErrors(j.errors);
  } catch (e) {
    document.getElementById("playErr").innerHTML =
      `<div class="feedback feedback-error"><div class="diag-cause">${esc(e.message)}</div></div>`;
  } finally {
    setIdeRunning("playCode", false);
  }
}

/* ---------- Exam ---------- */
async function startExam(chapterId) {
  const box = document.getElementById("exam-" + chapterId);
  box.innerHTML = "Đang mở bài...";
  try {
    const j = await api("/api/exams/" + chapterId + "/start", "POST", {});
    CURRENT_EXAM = { chapterId, attemptId: j.attemptId, codePrompt: j.codePrompt };
    EXAM_END = new Date(j.endsAt).getTime();
    if (EXAM_TIMER) clearInterval(EXAM_TIMER);
    const mcq = j.questions
      .map(
        (q, qi) =>
          `<div style="margin:12px 0"><p><b>Câu ${qi + 1}:</b> ${esc(q.q)}</p>${q.options
            .map(
              (o, oi) =>
                `<label style="display:block;margin:4px 0"><input type="radio" name="mcq-${q.id}" value="${oi}"> ${esc(o)}</label>`
            )
            .join("")}</div>`
      )
      .join("");
    box.innerHTML = `<p class="countdown" id="countdown"></p>
      <p class="muted">Thời lượng: ${j.durationMinutes} phút.</p>
      ${mcq}
      <p><b>Bài viết code:</b> ${esc(j.codePrompt)}</p>
      <div class="ide-window" style="margin:12px 0">
        <div class="ide-titlebar">
          <div class="traffic"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
          <span class="ide-filename">exam.py</span>
        </div>
        <textarea id="exam-code-${chapterId}" class="code-area"></textarea>
      </div>
      <button class="btn btn-primary" onclick="submitExam('${chapterId}')">Nộp bài kiểm tra</button>
      <div id="exam-res-${chapterId}"></div>`;
    const ta = document.getElementById("exam-code-" + chapterId);
    if (ta) editors["exam-" + chapterId] = createEditor(ta, { editorId: "exam-" + chapterId });
    const tick = () => {
      const left = Math.max(0, EXAM_END - Date.now());
      const m = Math.floor(left / 60000),
        s = Math.floor((left % 60000) / 1000);
      const cd = document.getElementById("countdown");
      if (cd) cd.textContent = "Còn lại: " + m + " phút " + String(s).padStart(2, "0") + " giây";
      if (left <= 0 && EXAM_TIMER) clearInterval(EXAM_TIMER);
    };
    tick();
    EXAM_TIMER = setInterval(tick, 1000);
  } catch (e) {
    box.innerHTML = `<p class="msg err">${esc(e.message)}</p>`;
  }
}

async function submitExam(chapterId) {
  const answers = {};
  document
    .querySelectorAll("#exam-" + chapterId + " input[type=radio]:checked")
    .forEach((r) => {
      answers[r.name.replace("mcq-", "")] = Number(r.value);
    });
  const code = getCode("exam-" + chapterId) || (document.getElementById("exam-code-" + chapterId)?.value || "");
  const box = document.getElementById("exam-res-" + chapterId);
  box.innerHTML = "Đang chấm...";
  try {
    const j = await api("/api/exams/" + chapterId + "/submit", "POST", {
      attemptId: CURRENT_EXAM.attemptId,
      answers,
      code,
    });
    if (EXAM_TIMER) clearInterval(EXAM_TIMER);
    if (j.late) {
      box.innerHTML = `<p class="msg err">⛔ Nộp quá hạn (${esc(j.lateReason)}) nên bài này tính 0 điểm.</p>`;
    } else {
      box.innerHTML = `<div class="feedback feedback-success">
        <div class="fb-title">Đã nộp · ${j.score}/${j.maxScore} điểm</div>
        <div style="font-size:13px">Trắc nghiệm: ${j.mcqScore} · Code: ${j.codeScore} · Tổng điểm: ${j.totalPoints}</div>
      </div>`;
    }
    const me = await api("/api/me");
    SCORES = me.scores;
    updateScoreBar(me);
  } catch (e) {
    box.innerHTML = `<p class="msg err">${esc(e.message)}</p>`;
  }
}

/* ---------- Leaderboard / Certificate / Admin ---------- */
async function loadLeaderboard() {
  const body = document.getElementById("leaderBody");
  body.innerHTML = "Đang tải...";
  try {
    const j = await api("/api/leaderboard");
    const rows = j.leaderboard || j.rows || [];
    if (!rows.length) {
      body.innerHTML = "<p class='muted'>Chưa có dữ liệu xếp hạng. Hãy làm bài để xuất hiện trên bảng vàng!</p>";
      return;
    }
    body.innerHTML =
      "<table><thead><tr><th>#</th><th>Học viên</th><th>XP</th></tr></thead><tbody>" +
      rows
        .map(
          (r, i) =>
            `<tr><td>${i + 1}</td><td>${esc(r.displayName || r.username)}</td><td><b>${r.total != null ? r.total : 0}</b></td></tr>`
        )
        .join("") +
      "</tbody></table>";
  } catch (e) {
    body.innerHTML = `<p class="msg err">${esc(e.message)}</p>`;
  }
}

async function loadCertificate() {
  const body = document.getElementById("certBody");
  body.innerHTML = "Đang tải...";
  try {
    const j = await api("/api/certificate");
    const total = j.originalTotal != null ? j.originalTotal : (j.total != null ? j.total : (SCORES && SCORES.total) || 0);
    const exT = j.originalExerciseTotal != null ? j.originalExerciseTotal : 0;
    const examT = j.originalExamTotal != null ? j.originalExamTotal : 0;
    const groups = Array.isArray(j.groups) ? j.groups : [];
    const groupsHtml = groups.length ? `<div class="card" style="margin-top:16px"><h3>Chứng nhận theo nhóm</h3>
      <p class="muted">Mỗi nhóm tính riêng: chỉ cần hoàn thành nhóm đó là đạt chứng nhận nhóm đó, không cần làm hết toàn bộ chương trình. Bài tập tùy chỉnh do giáo viên thêm sau không tính vào chứng nhận.</p>
      <table><thead><tr><th>Nhóm</th><th>Bài tập</th><th>Bài thi</th><th>Trạng thái</th></tr></thead><tbody>
      ${groups.map((g) => `<tr><td><strong>${esc(g.title)}</strong><br><span class="muted">${esc(g.subtitle || "")}</span></td><td>${g.exercisesDone}/${g.exercisesTotal}</td><td>${g.examsDone}/${g.examsTotal}</td><td>${g.complete ? "✓ Đã hoàn thành" : "— Chưa hoàn thành"}</td></tr>`).join("")}
      </tbody></table></div>` : `<p class="muted">Chưa có dữ liệu nhóm. Hãy tải lại trang.</p>`;
    if (j.eligible) {
      body.innerHTML = `<div class="cert-card">
        <div class="cert-badge">🎓</div>
        <h2>Chứng nhận hoàn thành toàn bộ</h2>
        <p class="cert-name">Chúc mừng <strong>${esc(ME.displayName)}</strong>!</p>
        <p>Bạn đã hoàn thành chương trình <strong>Python Lab</strong> — Học Python từ con số 0 (tất cả bài tập gốc và bài thi gốc).</p>
        <div class="cert-stats">
          <div><span class="cert-num">${total}</span><span class="cert-lbl">Tổng XP (bài gốc)</span></div>
          <div><span class="cert-num">${exT}</span><span class="cert-lbl">Bài tập</span></div>
          <div><span class="cert-num">${examT}</span><span class="cert-lbl">Kiểm tra</span></div>
        </div>
      </div>` + groupsHtml;
    } else {
      body.innerHTML = `<div class="card">
        <p>Hoàn thành <strong>tất cả bài tập gốc</strong> và <strong>bài kiểm tra cuối chương gốc</strong> để nhận chứng nhận toàn bộ. Ngoài ra, mỗi nhóm bên dưới có chứng nhận riêng khi bạn hoàn thành nhóm đó.</p>
        <div class="cert-stats" style="margin-top:16px">
          <div><span class="cert-num">${total}</span><span class="cert-lbl">XP hiện có (bài gốc)</span></div>
          <div><span class="cert-num">${exT}</span><span class="cert-lbl">Điểm bài tập</span></div>
          <div><span class="cert-num">${examT}</span><span class="cert-lbl">Điểm kiểm tra</span></div>
        </div>
        <p class="muted" style="margin-top:12px">Bài tập tùy chỉnh do giáo viên thêm sau không tính vào chứng nhận, để người đã hoàn thành không bị mất chứng nhận.</p>
      </div>` + groupsHtml;
    }
  } catch (e) {
    body.innerHTML = `<p class="msg err">${esc(e.message)}</p>`;
  }
}

async function changePassword() {
  const msg = document.getElementById("pwMsg");
  const cur = document.getElementById("pwCurrent")?.value || "";
  const nw = document.getElementById("pwNew")?.value || "";
  const cf = document.getElementById("pwConfirm")?.value || "";
  if (nw.length < 6 || nw.length > 128) { if (msg) msg.textContent = "Mật khẩu mới cần từ 6 đến 128 ký tự."; return; }
  if (nw !== cf) { if (msg) msg.textContent = "Mật khẩu mới nhập lại chưa khớp."; return; }
  try {
    await api("/api/password/change", "POST", { currentPassword: cur, newPassword: nw });
    if (msg) msg.textContent = "Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất.";
    const f = (id) => document.getElementById(id);
    if (f("pwCurrent")) f("pwCurrent").value = "";
    if (f("pwNew")) f("pwNew").value = "";
    if (f("pwConfirm")) f("pwConfirm").value = "";
  } catch (e) { if (msg) msg.textContent = e.message; }
}

async function adminResetPassword(userId, username) {
  const nw = window.prompt(`Nhập mật khẩu mới cho học viên ${username} (từ 6 đến 128 ký tự):`);
  if (nw === null) return;
  if (nw.length < 6 || nw.length > 128) { alert("Mật khẩu mới cần từ 6 đến 128 ký tự."); return; }
  try {
    await api(`/api/admin/users/${userId}/reset-password`, "POST", { newPassword: nw });
    alert(`Đã đặt lại mật khẩu cho ${username}. Học viên cần đăng nhập lại bằng mật khẩu mới.`);
  } catch (e) { alert(e.message); }
}

/* ---------- Admin: topic templates for new exercises ---------- */
const EXERCISE_TOPIC_TEMPLATES = [
  {
    id: "print",
    label: "print / In ra",
    icon: "🖨️",
    color: "#6D5EF6",
    hint: "In chuỗi, số, nhiều dòng",
    require: "print",
    chapterHint: "c1",
    title: "Bài: In thông báo",
    prompt: "Dùng print để in đúng một dòng: Xin chao Python",
    starter: "",
    expected: "Xin chao Python",
    sample: "print(\"Xin chao Python\")",
  },
  {
    id: "variable",
    label: "Biến & phép tính",
    icon: "🔢",
    color: "#0D9488",
    hint: "Gán biến, +, -, *, /",
    require: "variable",
    chapterHint: "c2",
    title: "Bài: Tính tổng hai số",
    prompt: "Cho a = 12, b = 8. In tổng a + b.",
    starter: "a = 12\nb = 8",
    expected: "20",
    sample: "a = 12\nb = 8\nprint(a + b)",
  },
  {
    id: "if",
    label: "if / else",
    icon: "🔀",
    color: "#2563EB",
    hint: "Điều kiện, xếp loại",
    require: "if",
    chapterHint: "c4",
    title: "Bài: Kiểm tra đạt",
    prompt: "diem = 6. Nếu diem >= 5 in Dat, ngược lại in Chua dat.",
    starter: "diem = 6",
    expected: "Dat",
    sample: "diem = 6\nif diem >= 5:\n    print(\"Dat\")\nelse:\n    print(\"Chua dat\")",
  },
  {
    id: "for",
    label: "for / range",
    icon: "🔁",
    color: "#D97706",
    hint: "Lặp, tổng dãy, in dãy",
    require: "for, range",
    chapterHint: "c5",
    title: "Bài: In dãy số",
    prompt: "Dùng for in các số 1, 2, 3, 4, 5 mỗi số một dòng.",
    starter: "",
    expected: "1\n2\n3\n4\n5",
    sample: "for i in range(1, 6):\n    print(i)",
  },
  {
    id: "while",
    label: "while",
    icon: "⏳",
    color: "#7C3AED",
    hint: "Lặp theo điều kiện",
    require: "print",
    chapterHint: "c6",
    title: "Bài: Đếm ngược",
    prompt: "n = 3. Dùng while in 3, 2, 1 mỗi dòng (mỗi lần n giảm 1).",
    starter: "n = 3",
    expected: "3\n2\n1",
    sample: "n = 3\nwhile n > 0:\n    print(n)\n    n = n - 1",
  },
  {
    id: "list",
    label: "List",
    icon: "📋",
    color: "#DB2777",
    hint: "Duyệt, tổng, lọc list",
    require: "list, for",
    chapterHint: "c7",
    title: "Bài: Tổng list",
    prompt: "nums = [2, 4, 6]. In tổng các phần tử.",
    starter: "nums = [2, 4, 6]",
    expected: "12",
    sample: "nums = [2, 4, 6]\nprint(sum(nums))",
  },
  {
    id: "string",
    label: "Chuỗi / f-string",
    icon: "✍️",
    color: "#059669",
    hint: "Nối chuỗi, f-string, len",
    require: "fstring",
    chapterHint: "c3",
    title: "Bài: Giới thiệu tên",
    prompt: "ten = \"An\". In dòng: Toi la An (dùng f-string).",
    starter: "ten = \"An\"",
    expected: "Toi la An",
    sample: "ten = \"An\"\nprint(f\"Toi la {ten}\")",
  },
  {
    id: "function",
    label: "Hàm def",
    icon: "🧩",
    color: "#4F46E5",
    hint: "Viết hàm, return",
    require: "function",
    chapterHint: "c8",
    title: "Bài: Hàm nhân đôi",
    prompt: "Viết hàm double(x) trả về 2*x. In double(9).",
    starter: "def double(x):",
    expected: "18",
    sample: "def double(x):\n    return 2 * x\n\nprint(double(9))",
  },
  {
    id: "algo",
    label: "Thuật toán nhẹ",
    icon: "🧠",
    color: "#DC2626",
    hint: "Đếm, ước, đảo số…",
    require: "for, range, if",
    chapterHint: "c14",
    title: "Bài: Đếm ước",
    prompt: "n = 12. Đếm số ước của n và in ra.",
    starter: "n = 12\ndem = 0",
    expected: "6",
    sample: "n = 12\ndem = 0\nfor i in range(1, n + 1):\n    if n % i == 0:\n        dem += 1\nprint(dem)",
  },
  {
    id: "blank",
    label: "Form trống",
    icon: "📄",
    color: "#64748B",
    hint: "Tự soạn toàn bộ",
    require: "",
    chapterHint: "",
    title: "",
    prompt: "",
    starter: "",
    expected: "",
    sample: "",
  },
];

function applyTopicTemplate(topicId) {
  const t = EXERCISE_TOPIC_TEMPLATES.find((x) => x.id === topicId);
  if (!t) return;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set("ax-topic-label", t.label + " " + t.icon);
  set("ax-title", t.title);
  set("ax-prompt", t.prompt);
  set("ax-starter", t.starter);
  set("ax-expected", t.expected);
  set("ax-sample", t.sample);
  set("ax-require", t.require);
  if (t.chapterHint) {
    const sel = document.getElementById("ax-chapter");
    if (sel) {
      const opt = [...sel.options].find((o) => o.value === t.chapterHint);
      if (opt) sel.value = t.chapterHint;
    }
  }
  document.querySelectorAll(".topic-create-btn").forEach((b) => b.classList.remove("active"));
  const btn = document.querySelector(`.topic-create-btn[onclick*="'${topicId}'"]`);
  if (btn) btn.classList.add("active");
  const msg = document.getElementById("ax-msg");
  if (msg) {
    msg.textContent = topicId === "blank"
      ? "Form trống — hãy điền đề bài."
      : "Đã áp dụng mẫu chủ đề «" + t.label + "». Chỉnh sửa rồi bấm Lưu.";
    msg.className = "msg ok";
  }
  document.getElementById("ax-title")?.focus();
}

function clearExerciseForm() {
  ["ax-topic-label","ax-title","ax-prompt","ax-starter","ax-expected","ax-sample","ax-require"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.querySelectorAll(".topic-create-btn").forEach((b) => b.classList.remove("active"));
  const prev = document.getElementById("ax-preview");
  if (prev) { prev.style.display = "none"; prev.textContent = ""; }
  const msg = document.getElementById("ax-msg");
  if (msg) { msg.textContent = ""; msg.className = "msg"; }
}

async function previewSampleRun() {
  const prev = document.getElementById("ax-preview");
  const sample = document.getElementById("ax-sample")?.value || "";
  const expected = document.getElementById("ax-expected")?.value || "";
  if (!sample.trim()) {
    if (prev) { prev.style.display = "block"; prev.textContent = "Chưa có đáp án mẫu để chạy."; }
    return;
  }
  try {
    const j = await api("/api/demo/run", "POST", { code: sample });
    let out = (j.output != null && j.output !== "") ? j.output : "";
    if (j.errors && j.errors.length) {
      out += (out ? "\n" : "") + j.errors.map((e) => "⚠️ " + e.message).join("\n");
    }
    const match = (out || "").replace(/\s+$/,"") === (expected || "").replace(/\s+$/,"");
    if (prev) {
      prev.style.display = "block";
      prev.textContent = "Output:\n" + (out || "(không in gì)") + "\n\n" +
        (expected ? ("Expected:\n" + expected + "\n\n" + (match ? "✅ Khớp expectedOutput" : "❌ Chưa khớp expectedOutput")) : "");
    }
  } catch (e) {
    if (prev) { prev.style.display = "block"; prev.textContent = "Lỗi: " + e.message; }
  }
}

function isoToLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
async function loadAdmin() {
  const el = document.getElementById("view-admin");
  el.innerHTML = "<div class='card'><h2>Bảng điều khiển</h2><p class='muted'>Đang tải...</p></div>";
  try {
    const j = await api("/api/admin/overview");
    const students = j.students || [];
    const settings = j.settings || j.examSettings || [];
    const subs = j.submissions || [];
    const customs = j.customExercises || [];

    let html = `
    <div class="admin-home-header card">
      <div>
        <p class="home-greet">Bảng điều khiển</p>
        <h1>Xin chào, ${esc(ME.displayName)}</h1>
        <p class="muted">Quản lý học viên, bài tập, điểm số và kỳ kiểm tra.</p>
      </div>
      <div class="admin-home-actions">
        <button class="btn btn-primary" onclick="document.getElementById('admin-create-exercise')?.scrollIntoView({behavior:'smooth'})">➕ Tạo bài theo chủ đề</button>
        <button class="btn" onclick="showView('home', document.querySelector('.navbtn[data-view=home]'))">🏠 Về trang chủ HV</button>
      </div>
    </div>
    <div class="admin-grid">
      <div class="card admin-stat"><div class="stat-num">${students.length}</div><div class="stat-lbl">Tài khoản</div></div>
      <div class="card admin-stat"><div class="stat-num">${subs.length}</div><div class="stat-lbl">Bài nộp (gần đây)</div></div>
      <div class="card admin-stat"><div class="stat-num">${customs.length}</div><div class="stat-lbl">Bài tập tùy chỉnh</div></div>
      <div class="card admin-stat"><div class="stat-num">${settings.length}</div><div class="stat-lbl">Chương thi</div></div>
    </div>`;

    html += `<div class="card"><h2>Học viên & điểm</h2>
      <table><thead><tr><th>Tên</th><th>Username</th><th>Vai trò</th><th>XP</th><th>Hoàn thành</th><th></th></tr></thead><tbody>
      ${students.map((s) => `<tr>
        <td>${esc(s.displayName)}</td><td>${esc(s.username)}</td>
        <td>${esc(s.role)}</td><td><b>${s.total != null ? s.total : 0}</b></td>
        <td>${s.complete ? "✓" : "—"}</td>
        <td>${s.role === "student" ? `<button class="btn btn-sm" onclick="adminResetPassword(${s.id}, '${esc(s.username).replace(/'/g, "\\'")}')">Đặt lại MK</button>` : ""}</td></tr>`).join("")}
      </tbody></table></div>`;

    html += `<div class="card"><h2>Cài đặt bài kiểm tra</h2>
      <p class="muted">Để trống giờ mở / hạn nộp nghĩa là không giới hạn. Giờ nhập theo giờ trên trình duyệt của giáo viên. Nộp sau hạn nộp hoặc quá thời lượng sẽ bị 0 điểm (máy chủ tự kiểm tra).</p>
      <table><thead><tr><th>Chương</th><th>Giờ mở</th><th>Hạn nộp</th><th>Thời lượng (phút)</th><th>Cho làm lại</th><th></th></tr></thead><tbody>
      ${settings.map((s) => {
        const cid = s.chapter_id || s.chapterId;
        const openVal = isoToLocalInput(s.open_at);
        const deadVal = isoToLocalInput(s.deadline);
        return `<tr>
          <td>${esc(cid)}</td>
          <td><input type="datetime-local" id="open-${esc(cid)}" value="${esc(openVal)}"></td>
          <td><input type="datetime-local" id="dead-${esc(cid)}" value="${esc(deadVal)}"></td>
          <td><input type="number" id="dur-${esc(cid)}" value="${s.duration_minutes || 15}" min="1" max="180" style="width:80px"></td>
          <td><input type="checkbox" id="retake-${esc(cid)}" ${s.allow_retake ? "checked" : ""}></td>
          <td><button class="btn btn-sm btn-primary" onclick="saveExamSettings('${esc(cid)}')">Lưu</button></td>
        </tr>`;
      }).join("")}
      </tbody></table></div>`;

    html += `<div class="card" id="admin-create-exercise">
      <h2>➕ Tạo bài tập mới theo chủ đề</h2>
      <p class="muted">Chọn chủ đề để tự điền mẫu đề + require, rồi chỉnh sửa và lưu. Bài xuất hiện cuối chương đã chọn.</p>

      <div class="topic-create-grid" id="topic-create-grid">
        ${EXERCISE_TOPIC_TEMPLATES.map((t) => `
          <button type="button" class="topic-create-btn" style="--gc:${t.color}" onclick="applyTopicTemplate('${t.id}')">
            <span class="topic-create-ico">${t.icon}</span>
            <strong>${esc(t.label)}</strong>
            <span class="muted">${esc(t.hint)}</span>
          </button>`).join("")}
      </div>

      <div class="admin-form" style="margin-top:18px">
        <div class="admin-form-row">
          <label class="field">Chủ đề đang chọn
            <input id="ax-topic-label" readonly placeholder="Chưa chọn — bấm nút chủ đề phía trên">
          </label>
          <label class="field">Chương
            <select id="ax-chapter">${(CHAPTERS || []).map((c) => `<option value="${esc(c.id)}">${esc(c.title)}</option>`).join("")}</select>
          </label>
        </div>
        <label class="field">Tiêu đề <input id="ax-title" placeholder="Bài x.y: Tên bài"></label>
        <label class="field">Đề bài (prompt) <textarea id="ax-prompt" rows="3" placeholder="Mô tả yêu cầu cho học sinh..."></textarea></label>
        <div class="admin-form-row">
          <label class="field">Code khởi đầu (starter) <textarea id="ax-starter" rows="3" class="code-area" style="min-height:72px"></textarea></label>
          <label class="field">Kết quả mong đợi (expectedOutput) <textarea id="ax-expected" rows="3" placeholder="Đúng từng dòng output"></textarea></label>
        </div>
        <label class="field">Đáp án mẫu (sample) <textarea id="ax-sample" rows="5" class="code-area" style="min-height:110px"></textarea></label>
        <label class="field">Yêu cầu kỹ thuật (require)
          <input id="ax-require" placeholder="print, if, for, variable, list, function, range">
        </label>
        <div class="admin-form-actions">
          <button class="btn btn-primary btn-lg" onclick="adminAddExercise()">💾 Lưu bài tập mới</button>
          <button class="btn" type="button" onclick="clearExerciseForm()">Xóa form</button>
          <button class="btn" type="button" onclick="previewSampleRun()">▶ Thử đáp án mẫu</button>
        </div>
        <p id="ax-msg" class="msg"></p>
        <pre id="ax-preview" class="terminal-body" style="display:none;margin-top:10px;padding:12px;border-radius:12px;background:var(--code-bg);color:#E2E8F0"></pre>
      </div>
    </div>`;

    if (customs.length) {
      html += `<div class="card"><h2>Bài tập tùy chỉnh đã thêm</h2>
        <table><thead><tr><th>ID</th><th>Chương</th><th>Tiêu đề</th><th></th></tr></thead><tbody>
        ${customs.map((e) => `<tr>
          <td><code>${esc(e.id)}</code></td>
          <td>${esc(e.chapter_id)}</td>
          <td>${esc(e.title)}</td>
          <td><button class="btn btn-sm" onclick="adminDeleteExercise('${esc(e.id)}')">Xóa</button></td>
        </tr>`).join("")}
        </tbody></table></div>`;
    }

    html += `<div class="card"><h2>Bài nộp gần đây</h2>
      <table><thead><tr><th>User</th><th>Bài</th><th>Điểm</th><th>Lần</th><th>Thời gian</th><th>Code đã nộp</th></tr></thead><tbody>
      ${subs.slice(0, 30).map((s) => `<tr>
        <td>${esc(s.username)}</td><td>${esc(s.exercise_id)}</td>
        <td>${s.score}/${s.max_score}</td><td>${s.attempt_no}</td>
        <td>${esc((s.created_at || "").slice(0, 19).replace("T", " "))}</td>
        <td><details><summary>Xem code</summary><pre style="white-space:pre-wrap;max-width:420px">${esc(s.code || "")}</pre></details></td>
      </tr>`).join("")}
      </tbody></table></div>`;

    el.innerHTML = html;
  } catch (e) {
    el.innerHTML = `<div class="card"><p class="msg err">${esc(e.message)}</p></div>`;
  }
}

async function saveExamSettings(chapterId) {
  const duration = Number(document.getElementById("dur-" + chapterId)?.value || 15);
  const allowRetake = !!(document.getElementById("retake-" + chapterId)?.checked);
  const openRaw = document.getElementById("open-" + chapterId)?.value || "";
  const deadRaw = document.getElementById("dead-" + chapterId)?.value || "";
  const openAt = openRaw ? new Date(openRaw).toISOString() : null;
  const deadline = deadRaw ? new Date(deadRaw).toISOString() : null;
  try {
    await api("/api/admin/exams/" + chapterId + "/settings", "POST", { durationMinutes: duration, allowRetake, openAt, deadline });
    alert("Đã lưu cài đặt cho " + chapterId);
  } catch (e) {
    alert(e.message);
  }
}

async function adminAddExercise() {
  const msg = document.getElementById("ax-msg");
  const title = document.getElementById("ax-title").value.trim();
  const prompt = document.getElementById("ax-prompt").value.trim();
  const expected = document.getElementById("ax-expected").value;
  const sample = document.getElementById("ax-sample").value;
  if (!title || !prompt) {
    msg.textContent = "Cần nhập tiêu đề và đề bài.";
    msg.className = "msg err";
    return;
  }
  if (!expected && !sample) {
    msg.textContent = "Nên có expectedOutput hoặc sample để chấm bài.";
    msg.className = "msg err";
    return;
  }
  const body = {
    chapterId: document.getElementById("ax-chapter").value,
    title,
    prompt,
    starter: document.getElementById("ax-starter").value,
    expectedOutput: expected,
    sample,
    require: document.getElementById("ax-require").value.split(",").map((s) => s.trim()).filter(Boolean),
  };
  try {
    msg.textContent = "Đang lưu...";
    msg.className = "msg";
    await api("/api/admin/exercises", "POST", body);
    msg.textContent = "Đã thêm bài tập thành công!";
    msg.className = "msg ok";
    const cur = await api("/api/curriculum");
    CHAPTERS = cur.chapters; GROUPS = cur.groups || GROUPS; PATHS = cur.paths || PATHS; TOPICS = cur.topics || TOPICS;
    loadAdmin();
    setTimeout(() => document.getElementById("admin-create-exercise")?.scrollIntoView({ behavior: "smooth" }), 200);
  } catch (e) {
    msg.textContent = e.message;
    msg.className = "msg err";
  }
}

async function adminDeleteExercise(id) {
  if (!confirm("Xóa bài " + id + "?")) return;
  try {
    await api("/api/admin/exercises/" + id, "DELETE", {});
    loadAdmin();
    const cur = await api("/api/curriculum");
    CHAPTERS = cur.chapters; GROUPS = cur.groups || GROUPS; PATHS = cur.paths || PATHS; TOPICS = cur.topics || TOPICS;
  } catch (e) {
    alert(e.message);
  }
}


/* ---------- Landing / Demo ---------- */
const DEMO_PROMPTS = [
  'print("Xin chào")\nprint("Python Lab")',
  'a = 5\nb = 3\nprint(a + b)',
  'diem = 85\nif diem >= 80:\n    print("Giỏi")\nelse:\n    print("Chưa giỏi")',
  'for i in range(1, 6):\n    print(i)',
];

function showLandingDemo() { initLandingDemo(); }
function initLandingDemo() {
  const ta = document.getElementById("demoCode");
  if (ta && !editors.demoCode) {
    editors.demoCode = createEditor(ta, { editorId: "demoCode", minHeight: "140px" });
    buildQuickbar(document.getElementById("demoQuickbar"), "demoCode");
  } else if (editors.demoCode) {
    editors.demoCode.refresh();
  }
}

function loadDemoPrompt(i) {
  const code = DEMO_PROMPTS[i] || DEMO_PROMPTS[0];
  initLandingDemo();
  setCode("demoCode", code);
}

async function runDemo() {
  const code = getCode("demoCode");
  setIdeRunning("demoCode", true);
  try {
    const r = await fetch("/api/demo/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const j = await r.json();
    let out = (j.output != null && j.output !== "") ? j.output : "";
    if (j.errors && j.errors.length) {
      out += (out ? "\n" : "") + j.errors.map((e) => "⚠️ " + e.message).join("\n");
    }
    const el = document.getElementById("demoOut");
    if (el) {
      el.textContent = out || "(không in ra gì)";
      flashTerminal(el, (j.errors && j.errors.length) ? "err" : "ok");
    }
  } catch (e) {
    const el = document.getElementById("demoOut");
    if (el) el.textContent = "Lỗi kết nối: " + e.message;
  } finally {
    setIdeRunning("demoCode", false);
  }
}

function showAuthPanel(mode) {
  const auth = document.getElementById("authView");
  if (auth) {
    auth.style.display = "flex";
    auth.setAttribute("aria-hidden", "false");
    document.body.classList.add("auth-open");
  }
  showAuth(mode || "login");
  setTimeout(() => document.getElementById("authUser")?.focus(), 80);
}

function closeAuthPanel() {
  const auth = document.getElementById("authView");
  if (auth) {
    auth.style.display = "none";
    auth.setAttribute("aria-hidden", "true");
  }
  document.body.classList.remove("auth-open");
}

document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAuthPanel(); });
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "passToggle") {
    const inp = document.getElementById("authPass");
    const show = inp.type === "password";
    inp.type = show ? "text" : "password";
    e.target.textContent = show ? "Ẩn" : "Hiện";
    e.target.setAttribute("aria-pressed", String(show));
    e.target.setAttribute("aria-label", show ? "Ẩn mật khẩu" : "Hiện mật khẩu");
  }
});

const LP_QUOTES = [
  ["Điều quan trọng là đừng ngừng đặt câu hỏi.", "Albert Einstein · Tò mò"],
  ["Chúng ta là những gì mình làm lặp đi lặp lại. Giỏi giang là một thói quen.", "Will Durant · Luyện tập"],
  ["Giáo dục là vũ khí mạnh nhất để thay đổi thế giới.", "Nelson Mandela · Mục đích"],
];
function pickTopic(t) { const i = document.getElementById("topicInput"); if (i) { i.value = t; i.focus(); } }
(function rotateQuotes() {
  let n = 0;
  const show = (first) => {
    const f = document.getElementById("lpQuote"); if (!f) return;
    const apply = () => {
      f.querySelector("blockquote").textContent = "“" + LP_QUOTES[n][0] + "”";
      f.querySelector("figcaption").textContent = LP_QUOTES[n][1];
      n = (n + 1) % LP_QUOTES.length;
      f.classList.remove("swap");
    };
    if (first) apply(); else { f.classList.add("swap"); setTimeout(apply, 380); }
  };
  show(true);
  if (!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) setInterval(() => show(false), 7000);
})();

/* ---------- Homepage effects ---------- */
(function lpEffects() {
  const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bar = document.getElementById("topbar");
  const pb = document.createElement("div"); pb.id = "scrollBar"; document.body.appendChild(pb);
  window.addEventListener("scroll", () => { const h = document.documentElement.scrollHeight - innerHeight; pb.style.width = (h > 0 ? scrollY / h * 100 : 0) + "%"; }, { passive: true });
  document.addEventListener("pointermove", (e) => { const c = e.target.closest && e.target.closest(".lp-course"); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px"); });
  window.addEventListener("scroll", () => bar && bar.classList.toggle("scrolled", window.scrollY > 8), { passive: true });
  // typing effect in the "I want to learn..." input
  const inp = document.getElementById("topicInput");
  if (inp && !reduced) {
    const words = ["vòng lặp for…", "hàm và return…", "danh sách (list)…", "if / else…", "chuỗi và f-string…"];
    let w = 0, c = 0, del = false;
    const tick = () => {
      if (document.activeElement === inp || inp.value) { setTimeout(tick, 800); return; }
      const word = words[w];
      c += del ? -1 : 1;
      inp.placeholder = word.slice(0, c);
      let t = del ? 35 : 80;
      if (!del && c === word.length) { del = true; t = 1400; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; t = 300; }
      setTimeout(tick, t);
    };
    tick();
  }
  // fade in on scroll + count up numbers
  const land = document.getElementById("landingView");
  if (!land || reduced || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("js-reveal");
  const items = land.querySelectorAll(".lp-head,.lp-try,.lp-courses li,.lp-why,.lp-steps li,.lp-stats,.lp-faq,.lp-review");
  items.forEach((el) => { const sib = el.parentElement ? [...el.parentElement.children].indexOf(el) % 6 : 0; el.style.setProperty("--i", Math.min(sib, 8)); });
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in"); io.unobserve(e.target);
    if (e.target.classList.contains("lp-stats")) e.target.querySelectorAll("b").forEach((b) => animateNumber(b, Number(b.dataset.n || b.textContent), { duration: 1200 }));
  }), { threshold: 0.15 });
  items.forEach((el) => io.observe(el));
  land.querySelectorAll(".lp-stats b").forEach((b) => { b.dataset.n = b.textContent; b.textContent = "0"; });
})();

/* ---------- Visits + ratings ---------- */
const fmtN = (n) => Number(n || 0).toLocaleString("vi-VN");
const starsText = (n) => "★".repeat(n) + "☆".repeat(5 - n);
function renderLandingStats(s) {
  const meta = document.getElementById("lpMeta");
  if (meta) {
    const r = s.ratings || {};
    meta.innerHTML = `<span>👁 <b>${fmtN(s.visits)}</b> lượt truy cập</span>` +
      (r.count ? `<span>⭐ <b>${r.average}</b>/5 từ ${fmtN(r.count)} đánh giá</span>` : "<span>Chưa có đánh giá nào</span>");
  }
  const list = document.getElementById("lpReviewList"), sec = document.getElementById("lpReviews");
  if (list && sec) {
    const rec = (s.ratings && s.ratings.recent) || [];
    sec.style.display = rec.length ? "block" : "none";
    list.innerHTML = rec.map((x) => `<figure class="lp-review"><div class="lp-rstars" aria-label="${x.stars} sao">${starsText(x.stars)}</div><blockquote>${esc(x.comment)}</blockquote><figcaption>${esc(x.name)}</figcaption></figure>`).join("");
  }
}
async function initSiteStats() {
  try {
    let s;
    if (!sessionStorage.getItem("py-lab-visit")) { s = await api("/api/visit", "POST", {}); sessionStorage.setItem("py-lab-visit", "1"); const full = await api("/api/stats"); s = full; }
    else s = await api("/api/stats");
    renderLandingStats(s);
  } catch (e) { /* ignore, does not affect page */ }
}
let pickedStars = 0;
function paintStars(n) {
  document.querySelectorAll("#starPick button").forEach((b, i) => { b.classList.toggle("on", i < n); b.setAttribute("aria-checked", String(i + 1 === n)); });
}
async function loadRating() {
  const box = document.getElementById("starPick");
  if (box && !box.children.length) {
    for (let i = 1; i <= 5; i++) {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = "★"; b.setAttribute("role", "radio"); b.setAttribute("aria-label", i + " sao");
      b.addEventListener("click", () => { pickedStars = i; paintStars(i); });
      b.addEventListener("mouseenter", () => paintStars(i));
      b.addEventListener("mouseleave", () => paintStars(pickedStars));
      box.appendChild(b);
    }
  }
  try {
    const j = await api("/api/rating");
    if (j.mine) { pickedStars = j.mine.stars; document.getElementById("rateComment").value = j.mine.comment || ""; }
    paintStars(pickedStars);
    const s = j.summary;
    document.getElementById("rateSummary").innerHTML = s.count ? `Trung bình <b>${s.average}</b>/5 từ ${fmtN(s.count)} đánh giá` : "Hãy là người đánh giá đầu tiên.";
  } catch (e) { document.getElementById("rateMsg").textContent = e.message; }
}
async function submitRating() {
  const msg = document.getElementById("rateMsg");
  if (!pickedStars) { msg.textContent = "Hãy chọn số sao trước."; return; }
  try {
    await api("/api/rating", "POST", { stars: pickedStars, comment: document.getElementById("rateComment").value });
    msg.textContent = "Cảm ơn bạn, đánh giá đã được lưu.";
    loadRating();
  } catch (e) { msg.textContent = e.message; }
}
initSiteStats();

function goHome() {
  if (ME) {
    showView("home", document.querySelector('.navbtn[data-view="home"]'));
  } else {
    const landing = document.getElementById("landingView");
    if (landing) landing.style.display = "block";
    closeAuthPanel();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/* ---------- Boot ---------- */
initTheme();
loadMe();
