import { appHash } from "./core.js";
/* LifeRivo - Vietnamese/English bilingual UI.
   - Vietnamese is the source language (default). When EN is selected, all UI strings are translated via
     public/locales/en.json (+ admin overrides in DB), applied to dynamically rendered content as well (MutationObserver).
   - Strings with numbers are matched by pattern: "Submitted 3 times" -> pattern "Submitted {0} times".
   - DO NOT translate: user-entered text (pre, code, textarea, inputs), or regions with data-i18n="off".
   - Learning content (lessons, curriculum) is returned by the server in the user's language, approved translations only. */
const KEY = "pl-lang";
let LANG = "vi";
// true if the user clicked the VI/EN toggle during this session (used so that after login
// the profile language does not overwrite the choice just made on the landing page).
let explicitChoice = false;
export function wasLangExplicitlyChosen() { return explicitChoice; }
let DICT = null, PATTERNS = [], observer = null;
const SKIP = new Set(["SCRIPT", "STYLE", "PRE", "CODE", "TEXTAREA", "KBD", "SAMP"]);
const NUM = /\d+(?:[.,]\d+)*/g;

export function pathLang() {
  if (typeof location === "undefined") return "";
  const p = location.pathname || "/";
  if (/^\/en(?:\/|$)/i.test(p)) return "en";
  if (/^\/(?:vi|vn)(?:\/|$)/i.test(p)) return "vi";
  return "";
}
function syncLangPath(lang) {
  if (typeof location === "undefined" || typeof history === "undefined") return;
  const p = location.pathname || "/";
  if (!/^\/(?:(?:vi|vn|en)\/?)?$/i.test(p)) return;
  if (p === "/" && lang === "vi") return;
  const target = lang === "en" ? "/en" : "/vi";
  if (p.replace(/\/+$/, "") !== target) {
    try { history.replaceState(null, "", target + location.search + appHash()); } catch {}
  }
}
export function currentLang() { return LANG; }
export function initialLang(userLang) {
  const fromPath = pathLang();
  if (fromPath) {
    try { localStorage.setItem(KEY, fromPath); } catch {}
    return fromPath;
  }
  let saved = "";
  try { saved = localStorage.getItem(KEY) || ""; } catch {}
  // Lua chon ro rang o trang chu (localStorage) thang ngon ngu profile:
  // Võ chon EN ngoai roi dang nhap thi trong app phai la EN.
  if (saved === "en" || saved === "vi") return saved;
  return userLang === "en" || userLang === "vi" ? userLang : "vi";
}

const EXTRA_EN = {
  "Học tập & Nền tảng": "Learning & Platform",
  "Tiến độ": "Progress",
  "Học ngay": "Learn now",
  "Cổ vũ": "Cheer",
  "Gói & Chứng nhận": "Plan & Certificates",
};
async function loadDict() {
  if (DICT) return;
  try {
    const [base, over] = await Promise.all([
      fetch("/locales/en.json", { cache: "no-cache" }).then((r) => r.json()),
      fetch("/api/public/ui-translations?lang=en").then((r) => (r.ok ? r.json() : { items: {} })).catch(() => ({ items: {} })),
    ]);
    DICT = new Map(Object.entries({ ...EXTRA_EN, ...base.exact, ...(base.keys || {}), ...over.items }));
    PATTERNS = (base.patterns || []).map(([vi, en]) => {
      // "{0} tháng", "{0} bài tập"...: mẫu đếm đơn vị thì {0} đầu câu phải là SỐ. Nếu để (.+?) thì
      // "Thời gian và ngày tháng" bị dịch thành "Thời gian và ngày months" (nửa Việt nửa Anh).
      const c4 = vi.charAt(4);
      const unit = vi.startsWith("{0} ") && c4 !== c4.toUpperCase() && c4 === c4.toLowerCase();
      let first = true;
      // "{#0}" = chỗ số (chỉ khớp số). Dùng cho "Bài {#0}" để "Bài kiểm tra…" không bị dịch thành "Exercise kiểm tra…".
      const re = new RegExp("^" + vi.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{(#?)(\d+)\}/g, (_, hash) => { const numeric = hash || (unit && first); const g = numeric ? "(\\d[\\d.,]*)" : "(.+?)"; first = false; return g; }) + "$");
      return { re, en };
    });
  } catch { DICT = new Map(); }
}

// Translate 1 string (preserving leading/trailing whitespace). Returns null if no translation exists.
export function tr(text) {
  if (!DICT || LANG !== "en") return null;
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
  const core = m[2].replace(/\s+/g, " ");
  if (!core) return null;
  let out = DICT.get(core);
  if (out == null) {
    // numbered pattern: replace numbers with {0}, {1}...
    const nums = core.match(NUM);
    if (nums) { let i = 0; const key = core.replace(NUM, () => `{${i++}}`); const t = DICT.get(key); if (t != null) out = t.replace(/\{(\d+)\}/g, (_, k) => nums[Number(k)] ?? ""); }
  }
  // Phần được bắt trong mẫu (ví dụ tên gói "Dùng thử Pro 7 ngày") cũng được dịch nếu có sẵn trong từ điển.
  if (out == null) for (const p of PATTERNS) { const r = p.re.exec(core); if (r) { out = p.en.replace(/\{(\d+)\}/g, (_, k) => { const v = r[Number(k) + 1] ?? ""; return DICT.get(v.trim()) ?? v; }); break; } }
  return out == null ? null : m[1] + out + m[3];
}
// Translate string in JS (toast, confirm...) - falls back to Vietnamese if untranslated
export const t = (s) => (LANG === "en" ? tr(s) ?? s : s);
if (typeof window !== "undefined") {
  for (const fn of ["confirm", "prompt", "alert"]) {
    if (typeof window[fn] === "function") {
      const orig = window[fn].bind(window);
      window[fn] = (msg, ...rest) => orig(typeof msg === "string" ? t(msg) : msg, ...rest);
    }
  }
}
// Key-based translations used by modular pages; supports both named and positional placeholders.
export function tf(key, values = {}) {
  const template = t(key);
  return String(template).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) => {
    if (Object.prototype.hasOwnProperty.call(values, name)) return String(values[name]);
    return match;
  });
}

const ORIG = new WeakMap(); // text node -> original Vietnamese text (to switch back to VI without reloading)
function skip(el) {
  for (let e = el; e && e !== document.body; e = e.parentElement) {
    if (SKIP.has(e.tagName) || e.isContentEditable || (e.classList && e.classList.contains("te")) || (e.getAttribute && e.getAttribute("data-i18n") === "off")) return true;
  }
  return false;
}
function translateText(node) {
  const src = ORIG.has(node) ? ORIG.get(node) : node.nodeValue;
  if (!/[^\s\d.,:;!?·/()%+\-–—]/.test(src)) return;
  if (LANG !== "en") { if (ORIG.has(node) && node.nodeValue !== src) node.nodeValue = src; return; }
  const out = tr(src);
  if (out != null && out !== node.nodeValue) { ORIG.set(node, src); node.nodeValue = out; }
}
const ATTRS = ["placeholder", "title", "aria-label", "alt"];
function translateAttrs(el) {
  for (const a of ATTRS) {
    if (!el.hasAttribute(a)) continue;
    const k = "data-i18n-" + a;
    const src = el.getAttribute(k) ?? el.getAttribute(a);
    if (LANG !== "en") { if (el.hasAttribute(k)) { el.setAttribute(a, src); el.removeAttribute(k); } continue; }
    const out = tr(src);
    if (out != null) { if (!el.hasAttribute(k)) el.setAttribute(k, src); el.setAttribute(a, out); }
  }
  if (el.tagName === "INPUT" && (el.type === "submit" || el.type === "button") && el.value) { const out = LANG === "en" ? tr(el.value) : null; if (out) el.value = out; }
}
export function translateTree(root) {
  if (!root || (LANG !== "en" && !DICT)) return;
  if (root.nodeType === 3) { if (!skip(root.parentElement)) translateText(root); return; }
  if (root.nodeType !== 1) return;
  if (skip(root)) { if (root.tagName === "TEXTAREA" && !skip(root.parentElement)) translateAttrs(root); return; }
  translateAttrs(root);
  // Textarea inputs do not translate content, but still translate placeholder / title
  const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, { acceptNode: (n) => { if (n.nodeType === 1 && skip(n)) { if (n.tagName === "TEXTAREA" && !skip(n.parentElement)) translateAttrs(n); return NodeFilter.FILTER_REJECT; } return NodeFilter.FILTER_ACCEPT; } });
  for (let n = w.nextNode(); n; n = w.nextNode()) { if (n.nodeType === 3) translateText(n); else translateAttrs(n); }
}

let titleSrc = "";
function translateTitle() {
  if (LANG !== "en") { if (titleSrc) document.title = titleSrc; return; }
  // Tiêu đề có thể ngăn cách bằng " · " hoặc " | " (trang chủ dùng " | ")
  const parts = document.title.split(/( · | \| )/);
  const out = parts.map((p, i) => (i % 2 === 1 ? p : (tr(p) ?? p))).join("");
  if (out !== document.title) { titleSrc = document.title; document.title = out; }
}

export async function applyLang(lang) {
  LANG = lang === "en" ? "en" : "vi";
  document.documentElement.lang = LANG;
  document.documentElement.dataset.lang = LANG;
  try { localStorage.setItem(KEY, LANG); } catch {}
  syncLangPath(LANG);
  if (LANG === "en") await loadDict();
  translateTree(document.body);
  translateTitle();
  syncLangSwitchUI();
  if (!observer) {
    observer = new MutationObserver((muts) => {
      if (LANG !== "en") return;
      observer.disconnect();
      for (const m of muts) {
        if (m.type === "characterData") { if (!skip(m.target.parentElement)) { ORIG.delete(m.target); translateText(m.target); } }
        else if (m.type === "attributes") { if (!skip(m.target) || (m.target.tagName === "TEXTAREA" && !skip(m.target.parentElement))) translateAttrs(m.target); }
        else m.addedNodes.forEach((n) => translateTree(n));
      }
      translateTitle();
      observe();
    });
    observe();
  }
}
function observe() { observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS }); }

// Dat trang thai active cho MOI nut VI/EN tren trang theo ngon ngu hien tai
// (nut "on" = nen den #1D1C27, chu trang; nut thuong = trong suot, chu xam).
// Can thiet vi SSR HTML cung VI class="on" va renderLanding dung lai chuoi SSR,
// nen nut co the hien nguoc voi ngon ngu that neu khong dong bo lai.
export function syncLangSwitchUI() {
  document.querySelectorAll(".lang-switch [data-lang]").forEach((x) => {
    const on = x.dataset.lang === LANG;
    x.classList.toggle("on", on);
    x.setAttribute("aria-pressed", String(on));
  });
}

// VI / EN toggle button
export function langSwitchHtml() {
  return `<div class="lang-switch" role="group" aria-label="Ngôn ngữ / Language"><button type="button" data-lang="vi" class="${LANG === "vi" ? "on" : ""}" aria-pressed="${LANG === "vi"}">VI</button><button type="button" data-lang="en" class="${LANG === "en" ? "on" : ""}" aria-pressed="${LANG === "en"}">EN</button></div>`;
}
export function bindLangSwitch(root, onChange) {
  root.querySelectorAll(".lang-switch [data-lang]").forEach((b) => b.addEventListener("click", () => {
    const lang = b.dataset.lang === "en" ? "en" : "vi";
    if (lang === LANG) return;
    explicitChoice = true;
    // Lưu ngôn ngữ rồi điều hướng sang nhánh /vi hoặc /en ngay, giữ nguyên hash hiện tại.
    try { localStorage.setItem(KEY, lang); } catch {}
    const p = (typeof location !== "undefined" && location.pathname) || "/";
    if (/^\/(?:(?:vi|vn|en)\/?)?$/i.test(p)) {
      location.href = (lang === "en" ? "/en" : "/vi") + location.search + appHash();
      return;
    }
    applyLang(lang).catch(() => {});
    location.reload();
  }));
}
