// Builds public/css/critical.min.css: the CSS for the above-the-fold landing content
// (header + hero only). Inlined by nothing — it is a small render-blocking stylesheet;
// the full landing.min.css loads async (data-async-css) after it.
//   node tools/build-critical-css.mjs          -> writes critical.min.css
//   node tools/build-critical-css.mjs --check  -> exits 1 if critical.min.css is stale
// Re-run after ANY change to the header/hero (public/index.html, landing.js, core.js,
// i18n.js) or to the CSS sources. Same conservative rule filter as build-landing-css.mjs.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { minifyCss } from "./build-css.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CSS_DIR = path.join(ROOT, "public", "css");
const OUT = path.join(CSS_DIR, "critical.min.css");
const SOURCES = ["app.css", "ui-unified.css", "speak.css", "theme.css", "chibi-ui.css"];

const usedClass = new Set(), usedId = new Set(), usedTag = new Set();
function scanHtml(html) {
  for (const m of html.matchAll(/class="([^"]+)"/g))
    for (const c of m[1].split(/\s+/)) if (/^[A-Za-z_][\w-]*$/.test(c)) usedClass.add(c);
  for (const m of html.matchAll(/id="([^"]+)"/g)) if (/^[A-Za-z_][\w-]*$/.test(m[1])) usedId.add(m[1]);
  for (const m of html.matchAll(/<([a-z][a-z0-9]*)\b/g)) usedTag.add(m[1]);
}
// Above the fold = everything from <body> to </header> (includes the .skip link, which
// sits BEFORE <header> and must be hidden from the first paint) + hero (#hero ... up to #demoBox)
const indexHtml = fs.readFileSync(path.join(ROOT, "public", "index.html"), "utf8");
{
  const hStart = indexHtml.indexOf("<body");
  const hEnd = indexHtml.indexOf("</header>");
  const heroStart = indexHtml.indexOf('id="hero"');
  const demoStart = indexHtml.indexOf('id="demoBox"');
  if (hStart >= 0 && hEnd > hStart) scanHtml(indexHtml.slice(hStart, hEnd));
  if (heroStart >= 0 && demoStart > heroStart) scanHtml(indexHtml.slice(heroStart, demoStart));
}
// NOTE: do NOT scan landing.js/core.js/i18n.js here — their class="..." pulls in modal,
// demo and app components that are NOT above the fold and would bloat critical CSS.
// Only the classes that appear in the header/hero HTML itself (plus the few dynamic
// classes the header/hero JS toggles on those elements).
usedClass.add("brand-logo"); usedClass.add("only"); // SSR-injected logo
usedClass.add("skip"); // accessibility link, must be hidden (left:-999px) from first paint
usedClass.add("boot"); usedClass.add("spin");

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
export function buildCritical() {
  const parts = SOURCES.map((f) => filterCss(fs.readFileSync(path.join(CSS_DIR, f), "utf8")));
  const header = `/* critical.min.css: generated by tools/build-critical-css.mjs (header+hero subset of ${SOURCES.join(", ")}). Do not edit. */\n`;
  return header + minifyCss(parts.join("\n")) + "\n";
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const built = buildCritical();
  if (process.argv.includes("--check")) {
    // So sánh sau khi chuẩn hóa xuống dòng: Windows (core.autocrlf=true) ghi CRLF, nội dung vẫn đúng
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8").replace(/\r\n/g, "\n") : "";
    if (cur !== built) { console.error("critical.min.css is stale: run node tools/build-critical-css.mjs"); process.exit(1); }
    console.log("critical.min.css is up to date");
  } else {
    fs.writeFileSync(OUT, built);
    console.log(`critical.min.css: ${(built.length / 1024).toFixed(1)} KB`);
  }
}
