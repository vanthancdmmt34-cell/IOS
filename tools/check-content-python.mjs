// Verify all curriculum reference solutions using REAL Python (Docker runner):
//   node tools/check-content-python.mjs [--json out.json]
// Any exercise whose solution does not match "Expected output" is printed so content can be fixed.
import fs from "node:fs";
import { CHAPTERS } from "../curriculum.js";
import { initRunner, gradeCode, engine } from "../runner/index.js";

initRunner();
if (engine() !== "docker") { console.error("Cần Docker + image Python (xem DEPLOYMENT_GUIDE.md)."); process.exit(2); }
const items = [];
for (const c of CHAPTERS) {
  for (const e of c.exercises) items.push({ id: e.id, ex: e });
  if (c.exam && c.exam.code) items.push({ id: c.id + ":exam", ex: c.exam.code });
}
const bad = [];
let i = 0;
const work = async () => {
  while (i < items.length) {
    const it = items[i++];
    const r = await gradeCode(it.ex.sample || "", it.ex);
    if (!r.passed) bad.push({ id: it.id, error: r.errors && r.errors[0] && r.errors[0].message, output: r.output });
  }
};
await Promise.all([work(), work(), work(), work()]);
console.log(`Đã kiểm tra ${items.length} đáp án mẫu bằng Python thật: ${items.length - bad.length} đúng, ${bad.length} sai.`);
for (const b of bad) console.log("-", b.id, "|", String(b.error).slice(0, 300));
const j = process.argv.indexOf("--json");
if (j > 0) fs.writeFileSync(process.argv[j + 1], JSON.stringify(bad, null, 2));
process.exit(bad.length ? 1 : 0);
