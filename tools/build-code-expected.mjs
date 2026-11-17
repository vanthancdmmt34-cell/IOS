// Generate content/code/expected.json by running C, C++, and Java reference solutions against each test suite.
// Required: all 3 solutions must produce identical output; bug-fix starter code must fail at least 1 test.
// Run: CODE_RUNNER=local node tools/build-code-expected.mjs   (requires gcc, g++, javac on the machine)
import fs from "node:fs";
import { PROBLEMS } from "../content/code/problems.js";
import C from "../content/code/sol-c.js";
import CPP from "../content/code/sol-cpp.js";
import JAVA from "../content/code/sol-java.js";
import { runCode } from "../modules/code-runner.js";
import { PREDICT } from "../content/code/theory.js";

const SOL = { c: C, cpp: CPP, java: JAVA };
const norm = (s) => String(s).replace(/\r/g, "").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");
const out = {};
let bad = 0;
for (const p of PROBLEMS) {
  const res = {};
  for (const lang of ["c", "cpp", "java"]) {
    const s = SOL[lang][p.id];
    if (!s || !s.sol) { console.error(`THIẾU lời giải ${lang} cho ${p.id}`); bad++; continue; }
    if (p.kind === "fix" && !s.bug) { console.error(`THIẾU code lỗi ${lang} cho ${p.id}`); bad++; }
    const r = await runCode({ lang, code: s.sol, tests: p.tests, tlMs: 4000 });
    if (!r.ok) { console.error(`${lang} ${p.id} lỗi:`, r.error); bad++; continue; }
    res[lang] = r.results.map((x) => (x.status === "ok" ? norm(x.stdout) : `!${x.status}`));
  }
  const langs = Object.keys(res);
  for (const l of langs) if (JSON.stringify(res[l]) !== JSON.stringify(res[langs[0]])) {
    console.error(`KHÁC NHAU ${p.id}: ${langs[0]}=${JSON.stringify(res[langs[0]])} ${l}=${JSON.stringify(res[l])}`); bad++;
  }
  if (res.c && res.c.some((x) => x.startsWith("!"))) { console.error(`LỜI GIẢI LỖI ${p.id}`, res.c); bad++; }
  out[p.id] = res.c || res.cpp;
  if (p.kind === "fix") for (const lang of ["c", "cpp", "java"]) {
    const s = SOL[lang][p.id]; if (!s || !s.bug) continue;
    const r = await runCode({ lang, code: s.bug, tests: p.tests, tlMs: 4000 });
    const got = r.ok ? r.results.map((x) => (x.status === "ok" ? norm(x.stdout) : `!${x.status}`)) : null;
    if (got && JSON.stringify(got) === JSON.stringify(out[p.id])) { console.error(`CODE LỖI VẪN ĐÚNG HẾT: ${lang} ${p.id}`); bad++; }
    if (!r.ok) { console.error(`CODE LỖI KHÔNG BIÊN DỊCH ĐƯỢC: ${lang} ${p.id}`, r.error.slice(0, 200)); bad++; }
  }
  process.stdout.write(".");
}
for (const [lang, units] of Object.entries(PREDICT)) for (const [u, progs] of Object.entries(units)) for (const [i, code] of progs.entries()) {
  const r = await runCode({ lang, code, tests: [""], tlMs: 4000 });
  if (!r.ok || r.results[0].status !== "ok") { console.error(`ĐOÁN KẾT QUẢ LỖI ${lang} bài ${u} câu ${i}:`, r.error || r.results[0]); bad++; continue; }
  out[`predict:${lang}:${u}:${i}`] = norm(r.results[0].stdout);
  process.stdout.write("+");
}
fs.writeFileSync(new URL("../content/code/expected.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(`\n${PROBLEMS.length} bài · ${bad ? bad + " LỖI" : "không có lỗi"}`);
process.exit(bad ? 1 : 0);
