// Verify foreign language content: every exercise's sample answer scores 100, empty submission scores 0, multiple-choice has no duplicate options.
// Run: node tools/verify-languages.mjs
import * as L from "../modules/languages.js";
await L.initLanguages({ prepare: () => ({ run: async () => {}, get: async () => null, all: async () => [] }) });
const C = L.langCatalog();
let bad = 0, n = 0;
for (const ex of C.exercises.values()) {
  n++;
  const perfect = ex.questions.map((q) => q.type === "mcq" ? q.ans : q.type === "text" ? q.accept[0] : q.type === "speak" ? q.target : q.ans.split(" "));
  if (L.gradeLang(ex, perfect).score !== 100) { bad++; console.log("Đáp án mẫu không đạt:", ex.id); }
  if (L.gradeLang(ex, []).score !== 0) { bad++; console.log("Bài bỏ trống vẫn có điểm:", ex.id); }
  for (const q of ex.questions) if (q.type === "mcq" && (q.ans < 0 || new Set(q.options).size !== q.options.length)) { bad++; console.log("Trắc nghiệm lỗi:", ex.id, q.q); }
}
for (const c of C.courses) for (const lv of c.levels) for (const u of lv.units) for (const g of u.grammar || []) if (!Array.isArray(g[1]) || g[2] < 0 || g[2] >= g[1].length) { bad++; console.log("Ngữ pháp lỗi:", c.id, lv.id, u.id, g[0]); }
console.log(`${C.courses.length} khóa · ${n} bài tập · ${bad ? bad + " lỗi" : "không có lỗi"}`);
process.exit(bad ? 1 : 0);
