// Quét tĩnh mã giao diện: liệt kê đoạn chữ tiếng Việt CHƯA có bản dịch tiếng Anh.
// Bổ trợ cho i18n-harvest.mjs (cần trình duyệt thật): không cần chạy máy chủ.
//   node tools/i18n-scan.mjs                 -> in số chuỗi thiếu theo từng tệp
//   node tools/i18n-scan.mjs --list          -> in toàn bộ chuỗi thiếu
//   node tools/i18n-scan.mjs --list home.js  -> chỉ một tệp
// Cách làm: lấy nội dung chuỗi/template trong public/js/*.js, tách theo ${...} và thẻ HTML,
// rồi tra đúng như i18n.js (khớp nguyên văn, khớp theo số {0}, mẫu câu) và luật của lang-en.js.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JS = path.join(ROOT, "public", "js");
const VI = /[ăâđêôơưàảãáạằẳẵắặầẩẫấậèẻẽéẹềểễếệìỉĩíịòỏõóọồổỗốộờởỡớợùủũúụừửữứựỳỷỹýỵ]/i;
const NUM = /\d+(?:[.,]\d+)*/g;
// Tệp chỉ chứa dữ liệu bài học / bảng dịch, không phải chữ giao diện.
const SKIP_FILES = new Set(["lang-en.js", "msg-en.js", "admin-i18n.js", "interview-bank.js", "interview-bank-more.js", "flags.js"]);

const dict = JSON.parse(fs.readFileSync(path.join(ROOT, "public", "locales", "en.json"), "utf8"));
const EXACT = new Map(Object.entries({ ...dict.exact, ...(dict.keys || {}) }));
const PATTERNS = (dict.patterns || []).map(([vi]) => {
  const c4 = vi.charAt(4);
  const unit = vi.startsWith("{0} ") && c4 !== c4.toUpperCase() && c4 === c4.toLowerCase();
  let first = true;
  return new RegExp("^" + vi.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{(\d+)\}/g, () => { const g = unit && first ? "(\\d[\\d.,]*)" : "(.+?)"; first = false; return g; }) + "$");
});
let RULES = [];
try { RULES = (await import("../public/js/lang-en.js").catch(() => ({}))).RULES || []; } catch {}

function covered(s) {
  if (EXACT.has(s)) return true;
  const nums = s.match(NUM);
  if (nums) { let i = 0; if (EXACT.has(s.replace(NUM, () => `{${i++}}`))) return true; }
  if (PATTERNS.some((re) => re.test(s))) return true;
  return RULES.some(([re]) => re.test(s));
}

// Lấy nội dung các chuỗi "..." '...' `...` (bỏ chú thích).
function literals(src) {
  const out = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "/") { i = src.indexOf("\n", i); if (i < 0) break; continue; }
    if (c === "/" && src[i + 1] === "*") { i = src.indexOf("*/", i + 2); if (i < 0) break; i += 2; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c && src[j] !== "\n") { if (src[j] === "\\") j++; j++; }
      out.push(src.slice(i + 1, j));
      i = j + 1;
      continue;
    }
    if (c === "`") {
      // template: thay ${...} (có lồng nhau) bằng dấu ngăn, phần lồng bên trong được quét đệ quy
      let j = i + 1, buf = "";
      while (j < n && src[j] !== "`") {
        if (src[j] === "\\") { buf += src[j + 1] === "n" ? " " : src[j + 1]; j += 2; continue; }
        if (src[j] === "$" && src[j + 1] === "{") {
          let d = 1, k = j + 2;
          while (k < n && d > 0) {
            if (src[k] === "`") { // template lồng: nhảy qua, nhưng vẫn quét nội dung của nó
              let m = k + 1, dd = 0;
              while (m < n && (src[m] !== "`" || dd > 0)) { if (src[m] === "\\") m++; else if (src[m] === "$" && src[m + 1] === "{") dd++; else if (src[m] === "}" && dd > 0) dd--; m++; }
              k = m + 1;
              continue;
            }
            if (src[k] === "{") d++; else if (src[k] === "}") d--;
            k++;
          }
          out.push(...literals(src.slice(j + 2, k - 1)));
          buf += "\u0001";
          j = k;
          continue;
        }
        buf += src[j++];
      }
      out.push(buf);
      i = j + 1;
      continue;
    }
    i++;
  }
  return out;
}

function fragments(lit) {
  const res = [];
  // giá trị thuộc tính cần dịch
  for (const m of lit.matchAll(/(?:placeholder|title|aria-label|alt)="([^"\u0001]*)"/g)) res.push(m[1]);
  const text = lit.replace(/<(script|style|pre|code)[\s\S]*?<\/\1>/g, "\u0001").replace(/<[^>]*>/g, "\u0001");
  for (const part of text.split("\u0001")) res.push(part);
  return res.map((s) => s.replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()).filter((s) => s && VI.test(s) && !/^[#./][\w/-]*$/.test(s));
}

const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const list = process.argv.includes("--list");
let total = 0;
for (const f of fs.readdirSync(JS).filter((x) => x.endsWith(".js") && !x.endsWith(".min.js") && !SKIP_FILES.has(x)).sort()) {
  if (only.length && !only.includes(f)) continue;
  const miss = new Set();
  for (const lit of literals(fs.readFileSync(path.join(JS, f), "utf8"))) for (const s of fragments(lit)) if (!covered(s)) miss.add(s);
  if (!miss.size) continue;
  total += miss.size;
  console.log(`${f}: ${miss.size}`);
  if (list) for (const s of miss) console.log("  " + s);
}
console.log(`Tổng: ${total} đoạn chưa có bản dịch`);
