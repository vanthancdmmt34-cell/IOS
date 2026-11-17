// Merge tools/i18n/*.tsv files (vi<TAB>en), patterns.tsv.p, and keys.json into public/locales/en.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(ROOT, "tools/i18n");
const outPath = path.join(ROOT, "public/locales/en.json");
const existing = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, "utf8")) : {};

const exact = { ...(existing.exact || {}) };
let bad = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".tsv")).sort()) {
  for (const line of fs.readFileSync(path.join(dir, f), "utf8").split("\n")) {
    if (!line.trim()) continue;
    const i = line.indexOf("\t");
    if (i < 0) { console.error("Missing TAB:", f, line); bad++; continue; }
    const vi = line.slice(0, i).trim(), en = line.slice(i + 1).replace(/\r$/, "");
    const a = (vi.match(/\{\d+\}/g) || []).sort().join(), b = (en.match(/\{\d+\}/g) || []).sort().join();
    if (new Set(vi.match(/\{\d+\}/g)).size !== new Set(en.match(/\{\d+\}/g) || []).size && !(a && b)) {
      console.error("Placeholder mismatch:", vi, "=>", en);
      bad++;
    }
    exact[vi] = en;
  }
}

const patMap = new Map((existing.patterns || []).map(([k, v]) => [k, v]));
const pf = path.join(dir, "patterns.tsv.p");
if (fs.existsSync(pf)) {
  for (const line of fs.readFileSync(pf, "utf8").split("\n")) {
    const i = line.indexOf("\t");
    if (i > 0) patMap.set(line.slice(0, i).trim(), line.slice(i + 1).replace(/\r$/, ""));
  }
}
const patterns = [...patMap.entries()];

const kf = path.join(dir, "keys.json");
const keys = {
  ...(existing.keys || {}),
  ...(fs.existsSync(kf) ? JSON.parse(fs.readFileSync(kf, "utf8")) : {}),
};

const out = { exact, patterns, keys };
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
console.log(`en.json: ${Object.keys(exact).length} exact strings, ${patterns.length} patterns, ${Object.keys(keys).length} keys${bad ? `, ${bad} warnings` : ""}`);
