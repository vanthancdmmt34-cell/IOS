// Builds minified JS for the study site (PageSpeed: minify JS + smaller payload).
//   node tools/build-js.mjs          -> writes *.min.js next to each source
//   node tools/build-js.mjs --check  -> exits 1 if any *.min.js is stale
// The source files stay the place to edit; re-run this script after any JS change
// and after a vendor redeploy (the vendor package ships unminified JS).
// Minification uses terser (install once: npm install --no-save terser).
// Import specifiers between app modules are rewritten from ./X.js to ./X.min.js
// so the minified entry (main.min.js) loads minified modules. Vendor scripts
// are classic scripts and have no imports to rewrite.
// KEEP A COPY OF THIS FILE OUTSIDE THE REPO (tools/ is vendor and a redeploy
// wipes it). The workspace copy is the source of truth.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
let minify = null;
try {
  ({ minify } = await import("terser"));
} catch {
  console.warn("[build-js] Terser is not installed; generated module output will remain valid JavaScript but will not be minified. Optionally run npm install --no-save terser when registry access is available to enable minification.");
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP_DIR = path.join(ROOT, "public", "js");
const CHECK = process.argv.includes("--check");
const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
const onlyFiles = onlyArg ? new Set(onlyArg.slice("--only=".length).split(",").map((item) => item.trim()).filter(Boolean)) : null;

function listJs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".js") && !f.endsWith(".min.js"))
    .sort();
}

// Rewrite relative imports of app modules (./X.js -> ./X.min.js) so minified
// modules load each other. Only rewrites when the target is a module we minify.
// Keeps an optional ?query (e.g. ./speak.js?v=20261113c) on the rewritten path.
function rewriteImports(src, appSet) {
  const fixStatic = (m, q, p, query) => {
    const name = p.split("/").pop() + ".js";
    return appSet.has(name) ? `from ${q}./${p}.min.js${query || ""}${q}` : m;
  };
  const fixDynamic = (m, q, p, query) => {
    const name = p.split("/").pop() + ".js";
    return appSet.has(name) ? `import(${q}./${p}.min.js${query || ""}${q})` : m;
  };
  src = src.replace(/\bfrom\s+(['"])\.\/([\w./-]+?)\.js(\?[^'"]*)?\1/g, fixStatic);
  // Import chỉ để chạy (import "./lang-en.js") cũng phải trỏ sang bản .min, nếu không module sẽ có
  // hai bản i18n riêng (một bản min, một bản gốc) và bản gốc luôn ở trạng thái tiếng Việt.
  src = src.replace(/\bimport\s+(['"])\.\/([\w./-]+?)\.js(\?[^'"]*)?\1/g, (m, q, p, query) => {
    const name = p.split("/").pop() + ".js";
    return appSet.has(name) ? `import ${q}./${p}.min.js${query || ""}${q}` : m;
  });
  src = src.replace(/\bimport\(\s*(['"])\.\/([\w./-]+?)\.js(\?[^'"]*)?\1\s*\)/g, fixDynamic);
  return src;
}

async function buildOne(srcPath, outPath, isModule, appSet) {
  const src = fs.readFileSync(srcPath, "utf8");
  const rewritten = isModule ? rewriteImports(src, appSet) : src;
  if (!minify) return { code: rewritten, origBytes: Buffer.byteLength(src, "utf8"), minified: false };
  const res = await minify(rewritten, {
    module: isModule,
    compress: { passes: 2 },
    mangle: true,
    format: { comments: false },
  });
  if (res.error) throw new Error(`${srcPath}: ${res.error}`);
  return { code: res.code, origBytes: Buffer.byteLength(src, "utf8"), minified: true };
}

const allAppFiles = listJs(APP_DIR);
const appFiles = onlyFiles ? allAppFiles.filter((file) => onlyFiles.has(file)) : allAppFiles;
if (onlyFiles && appFiles.length !== onlyFiles.size) {
  const missing = [...onlyFiles].filter((file) => !allAppFiles.includes(file));
  throw new Error(`Unknown --only file(s): ${missing.join(", ")}`);
}
const appSet = new Set(allAppFiles);
let totalOrig = 0, totalMin = 0, count = 0, stale = [];

for (const f of appFiles) {
  const srcPath = path.join(APP_DIR, f);
  const outPath = path.join(APP_DIR, f.replace(/\.js$/, ".min.js"));
  const { code, origBytes } = await buildOne(srcPath, outPath, true, appSet);
  totalOrig += origBytes; totalMin += Buffer.byteLength(code, "utf8"); count++;
  if (CHECK) {
    if (!fs.existsSync(outPath) || fs.readFileSync(outPath, "utf8") !== code) stale.push(outPath);
  } else {
    fs.writeFileSync(outPath, code);
  }
}

if (CHECK) {
  if (stale.length) {
    console.log(`STALE: ${stale.length} file(s) need rebuild:`);
    for (const s of stale) console.log("  " + s);
    process.exit(1);
  }
  console.log(`OK: ${count} file(s) up to date.`);
} else {
  const saved = totalOrig - totalMin;
  const pct = totalOrig ? Math.round((saved / totalOrig) * 100) : 0;
  if (minify) console.log(`Minified ${count} file(s): ${totalOrig} -> ${totalMin} bytes (saved ${saved}, ${pct}%).`);
  else console.log(`Generated ${count} valid JavaScript module file(s) without minification: ${totalOrig} -> ${totalMin} bytes.`);
}
