// Builds public/css/landing.min.css: the subset of the app stylesheets the public
// landing page actually uses (render-blocking CSS). The full bundle (bundle.min.css)
// is loaded on demand when the user enters the app (see main.js enterApp).
//   node tools/build-landing-css.mjs          -> writes landing.min.css
//   node tools/build-landing-css.mjs --check  -> exits 1 if landing.min.css is stale
// Re-run after ANY change to the landing page (public/index.html, landing.js, core.js,
// i18n.js) or to the CSS sources. The source files stay the place to edit.
// Method: keep a CSS rule when any class/id/tag in its selector appears on the
// landing page (SSR HTML + landing/core/i18n templates + dynamic classList ops).
// Conservative: a rule is kept when in doubt (e.g. no class/id, or an unknown
// selector), so the risk is a slightly larger file, never a missing style.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { minifyCss } from "./build-css.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CSS_DIR = path.join(ROOT, "public", "css");
const OUT = path.join(CSS_DIR, "landing.min.css");
const SOURCES = ["app.css", "ui-unified.css", "speak.css", "theme.css", "chibi-ui.css", "download.css"];

const usedClass = new Set(), usedId = new Set(), usedTag = new Set();
function scanHtml(html) {
  for (const m of html.matchAll(/class="([^"]+)"/g))
    for (const c of m[1].split(/\s+/)) if (/^[A-Za-z_][\w-]*$/.test(c)) usedClass.add(c);
  for (const m of html.matchAll(/id="([^"]+)"/g)) if (/^[A-Za-z_][\w-]*$/.test(m[1])) usedId.add(m[1]);
  for (const m of html.matchAll(/<([a-z][a-z0-9]*)\b/g)) usedTag.add(m[1]);
}
scanHtml(fs.readFileSync(path.join(ROOT, "public", "index.html"), "utf8"));
for (const f of ["public/js/landing.js", "public/js/download.js", "public/js/core.js", "public/js/i18n.js"]) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  for (const m of src.matchAll(/class="([^"]+)"/g))
    for (const c of m[1].split(/\s+/)) if (/^[A-Za-z_][\w-]*$/.test(c)) usedClass.add(c);
  for (const m of src.matchAll(/classList\.(?:add|remove|toggle|contains)\(["']([A-Za-z_][\w-]*)["']/g)) usedClass.add(m[1]);
  for (const m of src.matchAll(/\.className\s*=\s*["']([^"']+)["']/g))
    for (const c of m[1].split(/\s+/)) if (/^[A-Za-z_][\w-]*$/.test(c)) usedClass.add(c);
}
// SSR-injected (not in public/index.html): the brand logo <img class="brand-logo only">
// comes from the DB (brand_assets) at request time.
usedClass.add("brand-logo"); usedClass.add("only");
// Boot screen (main.js) + toast/modal host + Chibi UI state classes
usedClass.add("boot"); usedClass.add("spin");
usedClass.add("chibi-pop");

function parseRules(css) {
  const rules = [];
  let i = 0; const n = css.length;
  while (i < n) {
    while (i < n) {
      if (/\s/.test(css[i])) { i++; continue; }
      if (css[i] === "/" && css[i + 1] === "*") { const e = css.indexOf("*/", i + 2); i = e < 0 ? n : e + 2; continue; }
      break;
    }
    if (i >= n) break;
    let depth = 0, inStr = null, sel = "";
    while (i < n) {
      const ch = css[i];
      if (inStr) { sel += ch; if (ch === inStr) inStr = null; i++; continue; }
      if (ch === '"' || ch === "'") { inStr = ch; sel += ch; i++; continue; }
      if (ch === "{") { depth = 1; i++; break; }
      if (ch === "}" || ch === ";") { i++; break; }
      sel += ch; i++;
    }
    sel = sel.trim();
    if (!sel || depth === 0) continue;
    let body = "", inStr2 = null;
    while (i < n && depth > 0) {
      const ch = css[i];
      if (inStr2) { body += ch; if (ch === inStr2) inStr2 = null; i++; continue; }
      if (ch === '"' || ch === "'") { inStr2 = ch; body += ch; i++; continue; }
      if (ch === "{") depth++;
      if (ch === "}") { depth--; if (depth === 0) { i++; break; } }
      body += ch; i++;
    }
    rules.push({ sel, body });
  }
  return rules;
}
function selectorUses(sel) {
  const s = sel.replace(/::?[a-zA-Z-]+(\([^)]*\))?/g, " ");
  const classes = [...s.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((m) => m[1]);
  const ids = [...s.matchAll(/#([A-Za-z_][\w-]*)/g)].map((m) => m[1]);
  const tags = [...s.matchAll(/(^|[\s>+~])([a-z][a-z0-9]*)/gi)].map((m) => m[2].toLowerCase());
  return { classes, ids, tags };
}
function keepRule(r) {
  const sel = r.sel.trim();
  if (/^@(font-face|keyframes|import|charset)/.test(sel)) return true;
  if (/^:root\b/.test(sel) || sel === "*" || sel === "html" || sel === "body" || sel.startsWith("html ") || sel.startsWith("body ")) return true;
  if (/^@(media|supports|layer)/.test(sel)) return parseRules(r.body).some(keepRule);
  const { classes, ids, tags } = selectorUses(sel);
  if (classes.length === 0 && ids.length === 0) {
    if (tags.length === 0) return true;
    return tags.some((t) => usedTag.has(t));
  }
  if (classes.some((c) => usedClass.has(c))) return true;
  if (ids.some((id) => usedId.has(id))) return true;
  return false;
}
function filterCss(css) {
  const out = [];
  for (const r of parseRules(css)) {
    if (/^@(media|supports|layer)/.test(r.sel.trim())) {
      const inner = parseRules(r.body).filter(keepRule);
      if (inner.length) out.push(r.sel + "{" + inner.map((x) => x.sel + "{" + x.body + "}").join("\n") + "}");
    } else if (keepRule(r)) {
      out.push(r.sel + "{" + r.body + "}");
    }
  }
  return out.join("\n");
}
export function buildLanding() {
  const parts = SOURCES.map((f) => filterCss(fs.readFileSync(path.join(CSS_DIR, f), "utf8")));
  const header = `/* landing.min.css: generated by tools/build-landing-css.mjs (landing subset of ${SOURCES.join(", ")}). Do not edit. */\n`;
  return header + minifyCss(parts.join("\n")) + "\n";
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const built = buildLanding();
  if (process.argv.includes("--check")) {
    // So sánh sau khi chuẩn hóa xuống dòng: Windows (core.autocrlf=true) ghi CRLF, nội dung vẫn đúng
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8").replace(/\r\n/g, "\n") : "";
    if (cur !== built) { console.error("landing.min.css is stale: run node tools/build-landing-css.mjs"); process.exit(1); }
    console.log("landing.min.css is up to date");
  } else {
    fs.writeFileSync(OUT, built);
    console.log(`landing.min.css: ${(built.length / 1024).toFixed(1)} KB`);
  }
}
