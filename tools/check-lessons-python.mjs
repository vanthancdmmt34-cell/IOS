// Verify structured lessons (lessons.js) using REAL Python:
//  - every practice exercise's reference solution must pass ALL tests (including hidden tests)
//  - starter code MUST NOT pass (prevents "free points" exercises)
//  - lesson examples must print the exact output shown in the lesson
//   RUNNER_IMAGE=... node tools/check-lessons-python.mjs
import { LESSONS } from "../lessons.js";
import { initRunner, gradeCode, runCode, engine } from "../runner/index.js";

initRunner();
if (engine() !== "docker") { console.error("Cần Docker + image Python."); process.exit(2); }
const bad = [];
let n = 0;
for (const l of LESSONS) {
  const ex = await runCode(l.example.code, l.example.input || "");
  n++;
  if (ex.status !== "ok" || ex.output.replace(/\s+$/, "") !== l.example.output) bad.push(`${l.id} ví dụ: in ra ${JSON.stringify(ex.output)} ${JSON.stringify(ex.errors)} cần ${JSON.stringify(l.example.output)}`);
  for (const p of l.practice) {
    n += 2;
    const r = await gradeCode(p.sample, p);
    if (!r.passed) bad.push(`${p.id} đáp án mẫu: ${r.errors[0] && r.errors[0].message}`);
    const s = await gradeCode(p.starter || "", p);
    if (s.passed) bad.push(`${p.id} starter đã qua test (phải không qua)`);
  }
}
console.log(`Đã kiểm tra ${n} mục của ${LESSONS.length} bài học bằng Python thật: ${bad.length} lỗi.`);
for (const b of bad) console.log("-", b);
process.exit(bad.length ? 1 : 0);
