// Mini server-side Python interpreter + Vietnamese error checker.
// Supports: print, variable assignment, + - * / % **, comparisons, and/or/not, if/elif/else,
// for (range or list), while, list, dict, len/str/int/float/sum/range,
// function definitions (def + return), f-strings. Loop iteration limit prevents infinite loops.

// Convert curly quotes (pasted from Word/Zalo) to straight quotes, but ONLY when they act as
// string delimiters. Curly quotes inside a string opened with straight quotes are preserved.
export function normalizeQuotes(code) {
  const src = String(code || "");
  const OPEN_D = "“”", OPEN_S = "‘’";
  let out = "", q = null, curly = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === "\\" && i + 1 < src.length) { out += c + src[++i]; continue; }
      if (c === "\n") { q = null; curly = false; out += c; continue; }
      if (curly && ((q === '"' && OPEN_D.includes(c)) || (q === "'" && OPEN_S.includes(c)))) { out += q; q = null; curly = false; continue; }
      if (!curly && c === q) q = null;
      else if (curly && c === q) { q = null; curly = false; }
      out += c; continue;
    }
    if (c === "#") { const nl = src.indexOf("\n", i); const end = nl < 0 ? src.length : nl; out += src.slice(i, end); i = end - 1; continue; }
    if (OPEN_D.includes(c)) { out += '"'; q = '"'; curly = true; continue; }
    if (OPEN_S.includes(c)) { out += "'"; q = "'"; curly = true; continue; }
    if (c === '"' || c === "'") { q = c; curly = false; }
    out += c;
  }
  return out;
}

/** Allow whitespace before the trailing : on compound statement headers */
function normalizeColons(code) {
  return String(code || "")
    .split("\n")
    .map((line) => {
      // Only normalize lines ending with whitespace + :
      if (/^\s*(if|elif|else|for|while|def)\b/.test(line) || /:\s*$/.test(line.trimEnd())) {
        return line.replace(/\s*:\s*$/, ":");
      }
      return line;
    })
    .join("\n");
}

function stripInlineComments(code) {
  return String(code || "").split("\n").map((line) => {
    let q = null;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) { if (c === "\\") i++; else if (c === q) q = null; }
      else if (c === '"' || c === "'") q = c;
      else if (c === "#") return line.slice(0, i).trimEnd();
    }
    return line;
  }).join("\n");
}

function prepareCode(code) {
  return normalizeColons(stripInlineComments(normalizeQuotes(code)));
}

export class PyErr extends Error {
  constructor(line, message, hint) {
    super(message);
    this.line = line || 0;
    this.hint = hint || "";
  }
}

// ---------- Resource limits (anti-hang, anti-OOM) ----------
export const LIMITS = { steps: 20000, loop: 10000, seq: 200000, str: 1000000, out: 100000 };
function guardStr(s, lineNo) {
  if (typeof s === "string" && s.length > LIMITS.str) throw new PyErr(lineNo, "Chuỗi quá dài (quá 1 triệu ký tự)", "Chương trình đang tạo ra chuỗi khổng lồ. Kiểm tra vòng lặp nối chuỗi hoặc phép nhân chuỗi.");
  return s;
}
function guardSeq(a, lineNo) {
  if (a && a.length > LIMITS.seq) throw new PyErr(lineNo, "Danh sách quá lớn (quá 200.000 phần tử)", "Bài tập ở đây chỉ cần dữ liệu nhỏ. Kiểm tra range() hoặc phép nhân danh sách.");
  return a;
}

function indentOf(line) {
  const expanded = line.replace(/\t/g, "    ");
  const m = expanded.match(/^ */);
  return m ? m[0].length : 0;
}

// ---------- Expression tokenizer ----------
function tokenizeExpr(src, lineNo) {
  const toks = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === " " || ch === "\t") { i++; continue; }
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(src[i + 1] || ""))) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      const raw = src.slice(i, j);
      if ((raw.match(/\./g) || []).length > 1) throw new PyErr(lineNo, `Số không hợp lệ: ${raw}`, "Kiểm tra lại số bạn viết, ví dụ 3.5 chỉ có một dấu chấm.");
      toks.push({ type: "num", value: Number(raw) });
      i = j; continue;
    }
    if (ch === "f" && (src[i + 1] === '"' || src[i + 1] === "'")) {
      const quote = src[i + 1];
      let j = i + 2; let parts = []; let buf = "";
      while (j < src.length) {
        if (src[j] === "\\" && j + 1 < src.length) { buf += src[j + 1] === "n" ? "\n" : src[j + 1]; j += 2; continue; }
        if (src[j] === quote) break;
        if (src[j] === "{") {
          let depth = 0; let k = j; let expr = "";
          do { if (src[k] === "{") depth++; if (src[k] === "}") depth--; if (depth > 0) expr += src[k]; k++; } while (k < src.length && depth > 0);
          if (depth !== 0) throw new PyErr(lineNo, "f-string thiếu dấu }", "Mỗi { trong f-string phải có } đóng lại, ví dụ f\"{ten}\".");
          parts.push({ lit: buf }); buf = "";
          parts.push({ expr: expr.slice(1) });
          j = k; continue;
        }
        buf += src[j]; j++;
      }
      if (j >= src.length) throw new PyErr(lineNo, "Chuỗi f-string chưa đóng ngoặc kép", "Đóng ngoặc kép cuối chuỗi lại.");
      parts.push({ lit: buf });
      toks.push({ type: "fstring", parts });
      i = j + 1; continue;
    }
    if (ch === '"' || ch === "'") {
      const quote = ch; let j = i + 1; let out = "";
      while (j < src.length && src[j] !== quote) {
        if (src[j] === "\\" && j + 1 < src.length) {
          const e = src[j + 1];
          out += e === "n" ? "\n" : e === "t" ? "\t" : e;
          j += 2; continue;
        }
        out += src[j]; j++;
      }
      if (j >= src.length) throw new PyErr(lineNo, "Chuỗi chưa đóng ngoặc kép", "Mỗi chuỗi mở bằng dấu ngoặc kép phải có dấu đóng ở cuối.");
      toks.push({ type: "str", value: out });
      i = j + 1; continue;
    }
    if (/[\p{L}_]/u.test(ch)) {
      let j = i;
      while (j < src.length && /[\p{L}\p{N}\p{Mn}\p{Mc}_]/u.test(src[j])) j++;
      const w = src.slice(i, j);
      toks.push({ type: "name", value: w });
      i = j; continue;
    }
    const two = src.slice(i, i + 2);
    if (["**", "//", "==", "!=", "<=", ">="].includes(two)) { toks.push({ type: "op", value: two }); i += 2; continue; }
    if ("+-*/%<>()[],.:{}=".includes(ch)) { toks.push({ type: "op", value: ch }); i++; continue; }
    throw new PyErr(lineNo, `Ký tự lạ trong biểu thức: ${ch}`, "Xóa ký tự này hoặc kiểm tra lại cú pháp của dòng đó.");
  }
  toks.push({ type: "eof", value: "" });
  return toks;
}

// ---------- Expression parser + evaluator ----------
class ExprParser {
  constructor(toks, env, lineNo, run) {
    this.toks = toks; this.pos = 0; this.env = env; this.lineNo = lineNo; this.run = run;
  }
  peek() { return this.toks[this.pos]; }
  next() { return this.toks[this.pos++]; }
  expectOp(v) {
    const t = this.next();
    if (t.type !== "op" || t.value !== v) throw new PyErr(this.lineNo, `Thiếu dấu ${v} trong biểu thức`, "Kiểm tra lại dấu ngoặc và dấu phẩy của biểu thức.");
  }
  parse() {
    const v = this.parseOr();
    if (this.peek().type !== "eof") throw new PyErr(this.lineNo, "Biểu thức còn thừa ký tự ở cuối", "Xóa phần thừa ở cuối dòng hoặc thêm dấu ngoặc còn thiếu.");
    return v;
  }
  parseOr() {
    let v = this.parseAnd();
    while (this.peek().type === "name" && this.peek().value === "or") { this.next(); const r = this.parseAnd(); v = v ? v : r; }
    return v;
  }
  parseAnd() {
    let v = this.parseNot();
    while (this.peek().type === "name" && this.peek().value === "and") { this.next(); const r = this.parseNot(); v = v && r; }
    return v;
  }
  parseNot() {
    if (this.peek().type === "name" && this.peek().value === "not") { this.next(); return !this.parseNot(); }
    return this.parseCmp();
  }
  parseCmp() {
    let v = this.parseAdd();
    for (;;) {
      const t = this.peek();
      if (t.type === "op" && ["==", "!=", "<", "<=", ">", ">="].includes(t.value)) {
        this.next(); const r = this.parseAdd();
        if (t.value === "==") v = pyEq(v, r);
        else if (t.value === "!=") v = !pyEq(v, r);
        else if (t.value === "<") v = v < r;
        else if (t.value === "<=") v = v <= r;
        else if (t.value === ">") v = v > r;
        else v = v >= r;
      } else if (t.type === "name" && t.value === "in") {
        this.next(); const r = this.parseAdd();
        v = Array.isArray(r) ? r.some((x) => pyEq(x, v)) : isPlainObject(r) ? Object.prototype.hasOwnProperty.call(r, String(v)) : String(r).includes(String(v));
      } else break;
    }
    return v;
  }
  parseAdd() {
    let v = this.parseMul();
    for (;;) {
      const t = this.peek();
      if (t.type === "op" && (t.value === "+" || t.value === "-")) {
        this.next(); const r = this.parseMul();
        if (t.value === "+") {
          if (typeof v === "string" || typeof r === "string") v = guardStr(pyStr(v) + pyStr(r), this.lineNo);
          else if (Array.isArray(v) && Array.isArray(r)) v = guardSeq([...v, ...r], this.lineNo);
          else v = v + r;
        } else v = v - r;
      } else break;
    }
    return v;
  }
  parseMul() {
    let v = this.parsePow();
    for (;;) {
      const t = this.peek();
      if (t.type === "op" && (t.value === "*" || t.value === "/" || t.value === "//" || t.value === "%")) {
        this.next(); const r = this.parsePow();
        if (t.value === "*") {
          if (typeof v === "string" && typeof r === "number") { if (v.length * Math.max(0, r) > LIMITS.str) guardStr("x".repeat(LIMITS.str + 1), this.lineNo); v = r > 0 ? v.repeat(Math.floor(r)) : ""; }
          else if (typeof r === "string" && typeof v === "number") { if (r.length * Math.max(0, v) > LIMITS.str) guardStr("x".repeat(LIMITS.str + 1), this.lineNo); v = v > 0 ? r.repeat(Math.floor(v)) : ""; }
          else if (Array.isArray(v) && typeof r === "number") { if (v.length * Math.max(0, r) > LIMITS.seq) guardSeq({ length: LIMITS.seq + 1 }, this.lineNo); const o = []; for (let k = 0; k < r; k++) o.push(...v); v = o; }
          else v = v * r;
        }
        else if (t.value === "//") { if (r === 0) throw new PyErr(this.lineNo, "Chia lấy phần nguyên cho 0", "Số chia không được bằng 0."); v = Math.floor(v / r); }
        else if (t.value === "/") { if (r === 0) throw new PyErr(this.lineNo, "Chia cho 0", "Số chia không được bằng 0."); v = v / r; }
        else { if (r === 0) throw new PyErr(this.lineNo, "Chia lấy dư cho 0", "Số chia không được bằng 0."); v = ((v % r) + r) % r; }
      } else break;
    }
    return v;
  }
  parsePow() {
    const t0 = this.peek();
    if (t0.type === "op" && (t0.value === "-" || t0.value === "+")) {
      this.next(); const inner = this.parsePow();
      return t0.value === "-" ? -inner : inner;
    }
    let v = this.parsePostfix();
    if (this.peek().type === "op" && this.peek().value === "**") {
      this.next(); const r = this.parsePow(); v = Math.pow(v, r);
      if (!Number.isFinite(v)) throw new PyErr(this.lineNo, "Kết quả lũy thừa quá lớn", "Hãy dùng số nhỏ hơn cho phép tính **.");
    }
    return v;
  }
  parseUnary() {
    const t = this.peek();
    if (t.type === "op" && t.value === "-") { this.next(); return -this.parseMulOperandForUnary(); }
    if (t.type === "op" && t.value === "+") { this.next(); return this.parseUnary(); }
    return this.parsePostfix();
  }
  parsePostfix() {
    let v = this.parseAtom();
    for (;;) {
      const t = this.peek();
      if (t.type === "op" && t.value === "[") {
        this.next();
        // Slice: ds[a:b], ds[:b], ds[a:], ds[a:b:c] (strings/lists only)
        const isSlice = this.peek().type === "op" && this.peek().value === ":";
        let first = null; let hasFirst = false;
        if (!isSlice) { first = this.parseOr(); hasFirst = true; }
        if (this.peek().type === "op" && this.peek().value === ":") {
          this.next();
          let end = null;
          if (!(this.peek().type === "op" && (this.peek().value === "]" || this.peek().value === ":"))) end = this.parseOr();
          let step = 1;
          if (this.peek().type === "op" && this.peek().value === ":") { this.next(); step = this.parseOr(); }
          this.expectOp("]");
          if (typeof v !== "string" && !Array.isArray(v)) throw new PyErr(this.lineNo, "Cắt lát chỉ dùng cho chuỗi hoặc danh sách", "Từ điển dùng khóa, không dùng dấu hai chấm để cắt lát.");
          const n = v.length;
          let s = first === null ? (step > 0 ? 0 : n - 1) : (first < 0 ? Math.max(n + first, 0) : Math.min(first, n));
          let e = end === null ? (step > 0 ? n : -1) : (end < 0 ? Math.max(n + end, 0) : Math.min(end, n));
          if (typeof v === "string") { let out = ""; for (let i = s; step > 0 ? i < e : i > e; i += step) out += v[i]; v = out; }
          else { const out = []; for (let i = s; step > 0 ? i < e : i > e; i += step) out.push(v[i]); v = out; }
        } else {
          const idx = first; this.expectOp("]");
          if (typeof v === "string") {
            const j = idx < 0 ? v.length + idx : idx;
            if (j < 0 || j >= v.length) throw new PyErr(this.lineNo, `Chỉ số ${idx} vượt ngoài chuỗi`, "Chỉ số bắt đầu từ 0, chỉ số âm tính từ cuối, kiểm tra lại độ dài của chuỗi/danh sách.");
            v = v[j];
          } else if (Array.isArray(v)) {
            const j = idx < 0 ? v.length + idx : idx;
            if (j < 0 || j >= v.length) throw new PyErr(this.lineNo, `Chỉ số ${idx} vượt ngoài danh sách`, "Chỉ số bắt đầu từ 0, chỉ số âm tính từ cuối. Ví dụ danh sách 3 phần tử chỉ có chỉ số 0, 1, 2 hoặc -1.");
            v = v[j];
          } else if (isPlainObject(v)) {
          const key = String(idx);
          if (!Object.prototype.hasOwnProperty.call(v, key)) throw new PyErr(this.lineNo, `Từ điển không có khóa '${key}'`, "Kiểm tra lại tên khóa trong từ điển, ví dụ hs[\"ten\"] chỉ dùng khi từ điển có khóa \"ten\".");
          v = v[key];
        } else throw new PyErr(this.lineNo, "Không lấy chỉ số được từ giá trị này", "Chỉ danh sách, chuỗi và từ điển mới lấy được phần tử bằng [chỉ số/khóa].");
        }
      } else if (t.type === "op" && t.value === ".") {
        this.next(); const nameTok = this.next();
        if (nameTok.type !== "name") throw new PyErr(this.lineNo, "Sau dấu chấm phải là tên phương thức", "Ví dụ: ds.append(4).");
        const m = nameTok.value;
        if (this.peek().type === "op" && this.peek().value === "(") {
          this.next(); const args = this.parseArgs(); this.expectOp(")");
          if (Array.isArray(v) && m === "append") { v.push(args[0]); v = null; }
          else if (Array.isArray(v) && m === "pop") { const j = args.length ? (args[0] < 0 ? v.length + args[0] : args[0]) : v.length - 1; if (j < 0 || j >= v.length) throw new PyErr(this.lineNo, "pop() vượt ngoài danh sách", "Danh sách rỗng hoặc chỉ số pop không hợp lệ."); v = v.splice(j, 1)[0]; }
          else if (Array.isArray(v) && m === "remove") { const j = v.findIndex((x) => pyEq(x, args[0])); if (j < 0) throw new PyErr(this.lineNo, "remove(): giá trị không có trong danh sách", "Kiểm tra lại giá trị cần xóa có thật trong danh sách không."); v.splice(j, 1); v = null; }
          else if (Array.isArray(v) && m === "insert") { const j = Math.max(0, Math.min(args[0] < 0 ? v.length + args[0] : args[0], v.length)); v.splice(j, 0, args[1]); v = null; }
          else if (Array.isArray(v) && m === "sort") { v.sort((a, b) => (typeof a === "number" && typeof b === "number") ? a - b : String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0); v = null; }
          else if (Array.isArray(v) && m === "reverse") { v.reverse(); v = null; }
          else if (typeof v === "string" && m === "split") { v = args.length ? v.split(String(args[0])) : v.trim().split(/\s+/).filter((x) => x !== ""); }
          else if (typeof v === "string" && m === "strip") { v = v.trim(); }
          else if (typeof v === "string" && m === "lower") { v = v.toLowerCase(); }
          else if (typeof v === "string" && m === "upper") { v = v.toUpperCase(); }
          else if (typeof v === "string" && m === "replace") { v = guardStr(v.split(String(args[0])).join(String(args[1])), this.lineNo); }
          else if (typeof v === "string" && m === "join") { if (!Array.isArray(args[0])) throw new PyErr(this.lineNo, "join() cần một danh sách", "Ví dụ: \", \".join(ds)"); v = guardStr(args[0].map((x) => pyStr(x)).join(v), this.lineNo); }
          else if (typeof v === "string" && m === "count") { const sub = String(args[0]); v = sub === "" ? 0 : v.split(sub).length - 1; }
          else if (typeof v === "string" && m === "startswith") { v = v.startsWith(String(args[0])); }
          else if (typeof v === "string" && m === "endswith") { v = v.endsWith(String(args[0])); }
          else if (isPlainObject(v) && m === "get") { const k = String(args[0]); v = Object.prototype.hasOwnProperty.call(v, k) ? v[k] : (args.length > 1 ? args[1] : null); }
          else if (isPlainObject(v) && m === "keys") { v = Object.keys(v); }
          else if (isPlainObject(v) && m === "values") { v = Object.values(v); }
          else throw new PyErr(this.lineNo, `Không hỗ trợ phương thức .${m}()`, "Trong bài này chỉ cần dùng append() cho danh sách, hoặc len(), str(), int().");
        } else throw new PyErr(this.lineNo, "Thuộc tính này chưa được hỗ trợ", "Dùng hàm như len(ds) thay vì thuộc tính.");
      } else break;
    }
    return v;
  }
  parseArgs() {
    const args = [];
    if (this.peek().type === "op" && this.peek().value === ")") return args;
    for (;;) {
      // keyword arguments: name=value (used for print(..., sep=..., end=...))
      const t1 = this.toks[this.pos], t2 = this.toks[this.pos + 1];
      if (t1 && t2 && t1.type === "name" && t2.type === "op" && t2.value === "=") {
        this.pos += 2;
        if (!args.kw) args.kw = {};
        args.kw[t1.value] = this.parseOr();
      } else {
        if (args.kw) throw new PyErr(this.lineNo, "Tham số thường phải đứng trước tham số có tên", "Ví dụ đúng: print(a, b, end=\"\").");
        args.push(this.parseOr());
      }
      if (this.peek().type === "op" && this.peek().value === ",") { this.next(); continue; }
      break;
    }
    return args;
  }
  parseAtom() {
    const t = this.next();
    if (t.type === "num") return t.value;
    if (t.type === "str") return t.value;
    if (t.type === "fstring") {
      let out = "";
      for (const p of t.parts) {
        if (p.lit !== undefined) out += p.lit;
        else out += pyStr(this.run.evalExpr(p.expr, this.env, this.lineNo));
      }
      return out;
    }
    if (t.type === "op" && t.value === "(") {
      const v = this.parseOr(); this.expectOp(")"); return v;
    }
    if (t.type === "op" && t.value === "[") {
      const items = [];
      if (this.peek().type === "op" && this.peek().value === "]") { this.next(); return items; }
      for (;;) {
        items.push(this.parseOr());
        if (this.peek().type === "op" && this.peek().value === ",") { this.next(); continue; }
        break;
      }
      this.expectOp("]"); return items;
    }
    if (t.type === "op" && t.value === "{") {
      const obj = {};
      if (this.peek().type === "op" && this.peek().value === "}") { this.next(); return obj; }
      for (;;) {
        const key = this.parseOr();
        this.expectOp(":");
        const val = this.parseOr();
        obj[String(key)] = val;
        if (this.peek().type === "op" && this.peek().value === ",") { this.next(); if (this.peek().type === "op" && this.peek().value === "}") { this.next(); break; } continue; }
        break;
      }
      this.expectOp("}"); return obj;
    }
    if (t.type === "name") {
      if (t.value === "True") return true;
      if (t.value === "False") return false;
      if (t.value === "None") return null;
      if (this.peek().type === "op" && this.peek().value === "(") {
        this.next(); const args = this.parseArgs(); this.expectOp(")");
        return this.run.callBuiltinOrFunc(t.value, args, this.env, this.lineNo);
      }
      const v = this.run.lookup(this.env, t.value, this.lineNo);
      return v;
    }
    throw new PyErr(this.lineNo, "Biểu thức này chưa hiểu được", "Kiểm tra lại dấu ngoặc, dấu phẩy và tên biến trong biểu thức.");
  }
}

function isPlainObject(v) { return typeof v === "object" && v !== null && !Array.isArray(v); }
function pyRepr(v) {
  if (typeof v === "string") return "'" + v.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
  return pyStr(v);
}
export function pyStr(v) {
  if (v === null || v === undefined) return "None";
  if (typeof v === "boolean") return v ? "True" : "False";
  // List elements are printed using repr like real Python: ['B', 'C'] (previously printed [B, C]).
  if (Array.isArray(v)) return "[" + v.map(pyRepr).join(", ") + "]";
  if (isPlainObject(v)) return "{" + Object.entries(v).map(([k, val]) => pyRepr(k) + ": " + pyRepr(val)).join(", ") + "}";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(v);
  return String(v);
}
function pyEq(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => pyEq(x, b[i]));
  if (isPlainObject(a) && isPlainObject(b)) {
    const ka = Object.keys(a), kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && pyEq(a[k], b[k]));
  }
  return a === b;
}

// ---------- Program execution ----------
class LoopSignal { constructor(kind) { this.kind = kind; } }
class ReturnSignal { constructor(v) { this.value = v; } }

export class Runner {
  constructor(opts = {}) {
    this.buf = ""; this.steps = 0;
    this.stdin = String(opts.stdin ?? "").replace(/\r\n/g, "\n").split("\n");
    if (this.stdin.length && this.stdin[this.stdin.length - 1] === "") this.stdin.pop();
    this.inPos = 0;
  }
  write(text, lineNo) {
    this.buf += text;
    if (this.buf.length > LIMITS.out) throw new PyErr(lineNo, "Chương trình in ra quá nhiều (quá 100.000 ký tự)", "Kiểm tra vòng lặp có print bên trong, có thể nó chạy quá nhiều lần.");
  }
  get output() { return this.buf.endsWith("\n") ? this.buf.slice(0, -1) : this.buf; }
  lookup(env, name, lineNo) {
    for (let i = env.length - 1; i >= 0; i--) {
      if (Object.prototype.hasOwnProperty.call(env[i], name)) return env[i][name];
    }
    throw new PyErr(lineNo, `Biến "${name}" chưa được định nghĩa`, `Định nghĩa biến ${name} trước khi dùng, ví dụ ${name} = 5, và kiểm tra chính tả tên biến.`);
  }
  assign(env, name, value) { env[env.length - 1][name] = value; }
  evalExpr(src, env, lineNo) {
    const toks = tokenizeExpr(src, lineNo);
    return new ExprParser(toks, env, lineNo, this).parse();
  }
  callBuiltinOrFunc(name, args, env, lineNo) {
    // User-defined functions take precedence over built-ins (like Python: def max(...) shadows built-in max)
    if (!args.kw) {
    // User-defined functions: stored in special env entry __funcs
      for (let i = env.length - 1; i >= 0; i--) {
        const fns = env[i].__funcs;
        if (fns && fns[name]) {
          const fn = fns[name];
          if (args.length !== fn.params.length) throw new PyErr(lineNo, `Hàm ${name} cần ${fn.params.length} đối số`, `Gọi hàm đúng số đối số đã định nghĩa: ${name}(${fn.params.join(", ")}).`);
          const local = { __funcs: fns };
          fn.params.forEach((p, idx) => { local[p] = args[idx]; });
          try { this.execBlock(fn.block, [env[0], local]); } catch (e) { if (e instanceof ReturnSignal) return e.value; throw e; }
          return null;
        }
      }
    }
    const kw = args.kw || {};
    if (name !== "print" && args.kw) throw new PyErr(lineNo, `Hàm ${name}() chưa hỗ trợ tham số có tên`, "Chỉ print() hỗ trợ sep= và end=.");
    if (name === "print") {
      for (const k of Object.keys(kw)) if (k !== "sep" && k !== "end") throw new PyErr(lineNo, `print() không có tham số ${k}=`, "print() hỗ trợ sep= (ký tự ngăn cách) và end= (ký tự cuối dòng).");
      const sep = "sep" in kw ? pyStr(kw.sep) : " ";
      const end = "end" in kw ? pyStr(kw.end) : "\n";
      this.write(args.map(pyStr).join(sep) + end, lineNo);
      return null;
    }
    if (name === "input") {
      if (args.length) this.write(pyStr(args[0]), lineNo);
      if (this.inPos >= this.stdin.length) throw new PyErr(lineNo, "EOFError: hết dữ liệu đầu vào cho input()", "Chương trình gọi input() nhiều hơn số dòng dữ liệu. Ở Sân chơi hoặc ô Đầu vào, nhập mỗi giá trị trên một dòng.");
      return this.stdin[this.inPos++];
    }
    if (name === "abs") { if (typeof args[0] !== "number") throw new PyErr(lineNo, "abs() cần một số", "Ví dụ: abs(-5)."); return Math.abs(args[0]); }
    if (name === "max" || name === "min") {
      const list = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      if (!list.length) throw new PyErr(lineNo, `${name}() của danh sách rỗng`, "Danh sách phải có ít nhất một phần tử.");
      return list.reduce((a, b) => (name === "max" ? (b > a ? b : a) : (b < a ? b : a)));
    }
    if (name === "round") {
      if (typeof args[0] !== "number") throw new PyErr(lineNo, "round() cần một số", "Ví dụ: round(3.14159, 2).");
      const d = args.length > 1 ? args[1] : 0; const f = Math.pow(10, d);
      // banker's rounding (round half to even) like Python for exact .5 cases
      const x = args[0] * f, r = Math.round(x); const v = (Math.abs(x % 1) === 0.5 && r % 2 !== 0) ? r - 1 : r;
      return v / f;
    }
    if (name === "len") return typeof args[0] === "string" || Array.isArray(args[0]) ? args[0].length : isPlainObject(args[0]) ? Object.keys(args[0]).length : (() => { throw new PyErr(lineNo, "len() chỉ dùng cho chuỗi, danh sách hoặc từ điển", "Ví dụ: len(ds), len(hs), len(\"An\")."); })();
    if (name === "str") return pyStr(args[0]);
    if (name === "int") { const n = parseInt(args[0], 10); if (Number.isNaN(n)) throw new PyErr(lineNo, "Không đổi được thành số nguyên", "int() cần một số hoặc chuỗi số, ví dụ int(\"5\")."); return n; }
    if (name === "float") { const n = Number(args[0]); if (Number.isNaN(n)) throw new PyErr(lineNo, "Không đổi được thành số thực", "float() cần một số hoặc chuỗi số."); return n; }
    if (name === "range") {
      let start = 0, stop, step = 1;
      if (args.length === 1) stop = args[0];
      else if (args.length === 2) { start = args[0]; stop = args[1]; }
      else if (args.length === 3) { start = args[0]; stop = args[1]; step = args[2]; }
      else throw new PyErr(lineNo, "range() sai số lượng đối số", "Dùng range(n) hoặc range(bắt đầu, kết thúc).");
      if (![start, stop, step].every(Number.isInteger)) throw new PyErr(lineNo, "range() chỉ nhận số nguyên", "Ví dụ: range(1, 11). Nếu là kết quả phép chia, dùng // thay cho /.");
      if (step === 0) throw new PyErr(lineNo, "range() có bước nhảy bằng 0", "Bước nhảy (đối số thứ ba) phải khác 0.");
      const len = Math.max(0, Math.ceil((stop - start) / step));
      if (len > LIMITS.seq) throw new PyErr(lineNo, `range() quá lớn (${len.toLocaleString("vi-VN")} phần tử)`, "Bài tập ở đây chỉ cần dãy nhỏ, tối đa 200.000 phần tử.");
      const out = [];
      if (step > 0) for (let i = start; i < stop; i += step) out.push(i);
      else for (let i = start; i > stop; i += step) out.push(i);
      return out;
    }
    if (name === "sum") { if (!Array.isArray(args[0])) throw new PyErr(lineNo, "sum() cần một danh sách số", "Ví dụ: sum([1, 2, 3])."); return args[0].reduce((a, b) => a + b, 0); }
    throw new PyErr(lineNo, `Tên "${name}" chưa được định nghĩa`, `Kiểm tra chính tả tên hàm/biến, và định nghĩa hàm trước khi gọi.`);
  }
  execBlock(nodes, env) {
    for (const node of nodes) {
      this.steps++;
      if (this.steps > LIMITS.steps) throw new PyErr(node.line, "Chương trình chạy quá lâu (có thể vòng lặp vô hạn)", "Kiểm tra điều kiện dừng của vòng lặp while hoặc range của vòng lặp for.");
      if (node.kind === "assign") this.assign(env, node.name, this.evalExpr(node.expr, env, node.line));
      else if (node.kind === "subassign") {
        const base = this.lookup(env, node.name, node.line);
        const val = this.evalExpr(node.expr, env, node.line);
        if (node.indices) {
          let cur = base;
          for (let k = 0; k < node.indices.length - 1; k++) {
            const ix = this.evalExpr(node.indices[k], env, node.line);
            cur = isPlainObject(cur) ? cur[String(ix)] : cur[ix];
            if (cur === undefined) throw new PyErr(node.line, "Không gán được phần tử lồng nhau", "Kiểm tra lại chỉ số hàng và cột, chúng phải nằm trong bảng đã tạo.");
          }
          const last = this.evalExpr(node.indices[node.indices.length - 1], env, node.line);
          if (isPlainObject(cur)) cur[String(last)] = val;
          else if (Array.isArray(cur)) {
            if (!Number.isInteger(last) || last < 0 || last >= cur.length) throw new PyErr(node.line, `Chỉ số ${last} vượt ngoài danh sách`, "Chỉ số bắt đầu từ 0 và phải nhỏ hơn độ dài danh sách.");
            cur[last] = val;
          } else throw new PyErr(node.line, "Không gán được phần tử cho giá trị này", "Chỉ danh sách và từ điển mới gán được phần tử bằng [chỉ số/khóa].");
          continue;
        }
        const idx = this.evalExpr(node.index, env, node.line);
        if (isPlainObject(base)) base[String(idx)] = val;
        else if (Array.isArray(base)) {
          if (!Number.isInteger(idx) || idx < 0 || idx >= base.length) throw new PyErr(node.line, `Chỉ số ${idx} vượt ngoài danh sách`, "Chỉ số bắt đầu từ 0 và phải nhỏ hơn độ dài danh sách.");
          base[idx] = val;
        } else throw new PyErr(node.line, "Không gán được phần tử cho giá trị này", "Chỉ danh sách và từ điển mới gán được phần tử bằng [chỉ số/khóa].");
      }
      else if (node.kind === "augassign") {
        const cur = this.lookup(env, node.name, node.line);
        const r = this.evalExpr(node.expr, env, node.line);
        const v = node.op === "+=" ? (typeof cur === "string" || typeof r === "string" ? guardStr(pyStr(cur) + pyStr(r), node.line) : Array.isArray(cur) && Array.isArray(r) ? guardSeq([...cur, ...r], node.line) : cur + r)
          : node.op === "-=" ? cur - r : node.op === "*=" ? cur * r : cur / r;
        this.assign(env, node.name, v);
      } else if (node.kind === "expr") this.evalExpr(node.expr, env, node.line);
      else if (node.kind === "pass") { /* no-op */ }
      else if (node.kind === "break" || node.kind === "continue") throw new LoopSignal(node.kind);
      else if (node.kind === "return") throw new ReturnSignal(this.evalExpr(node.expr, env, node.line));
      else if (node.kind === "if") {
        let done = false;
        for (const br of node.branches) {
          if (br.cond === null || this.evalExpr(br.cond, env, node.line)) { this.execBlock(br.block, env); done = true; break; }
        }
        if (!done && node.elseBlock) this.execBlock(node.elseBlock, env);
      } else if (node.kind === "for") {
        const iter = this.evalExpr(node.iter, env, node.line);
        const items = Array.isArray(iter) ? iter : isPlainObject(iter) ? Object.keys(iter) : String(iter).split("");
        let count = 0;
        for (const item of items) {
          if (++count > LIMITS.loop) throw new PyErr(node.line, "Vòng lặp chạy quá nhiều lần", "Kiểm tra range() của vòng lặp.");
          this.assign(env, node.var, item);
          try { this.execBlock(node.block, env); } catch (e) { if (e instanceof LoopSignal) { if (e.kind === "break") break; continue; } throw e; }
        }
      } else if (node.kind === "while") {
        let count = 0;
        while (this.evalExpr(node.cond, env, node.line)) {
          if (++count > LIMITS.loop) throw new PyErr(node.line, "Vòng lặp while không dừng", "Trong vòng lặp phải có câu lệnh làm điều kiện sai dần đi, nếu không nó chạy mãi.");
          try { this.execBlock(node.block, env); } catch (e) { if (e instanceof LoopSignal) { if (e.kind === "break") break; continue; } throw e; }
        }
      } else if (node.kind === "def") {
        if (!env[env.length - 1].__funcs) env[env.length - 1].__funcs = {};
        env[env.length - 1].__funcs[node.name] = node;
      }
    }
  }
}

// ---------- Indentation-based block parser ----------
export function parseProgram(code) {
  const rawLines = code.split("\n").map((text, idx) => ({ text: text.replace(/\t/g, "    "), line: idx + 1 }));
  const lines = rawLines.filter((l) => l.text.trim() !== "" && !l.text.trim().startsWith("#"));
  let pos = 0;
  function parseBlock(minIndent) {
    const nodes = [];
    while (pos < lines.length) {
      const cur = lines[pos];
      const ind = indentOf(cur.text);
      if (ind < minIndent) break;
      if (ind > minIndent && nodes.length === 0) throw new PyErr(cur.line, "Thụt lề không đúng ở dòng này", "Dòng đầu tiên của một khối không được thụt lề thừa so với các dòng xung quanh.");
      if (ind > minIndent) break;
      const stripped = cur.text.trim();
      if (stripped.startsWith("if ") || stripped.startsWith("if(") || stripped === "if:") {
        const node = parseIf(ind);
        nodes.push(node);
        continue;
      }
      if (stripped.startsWith("for ")) { nodes.push(parseFor(ind)); continue; }
      if (stripped.startsWith("while ")) { nodes.push(parseWhile(ind)); continue; }
      if (stripped.startsWith("def ")) { nodes.push(parseDef(ind)); continue; }
      if (stripped.startsWith("elif ") || stripped === "else:" || stripped.startsWith("else:")) {
        throw new PyErr(cur.line, "elif/else đứng một mình không có if ở trên", "elif/else phải đi ngay sau khối if và thụt lề bằng với dòng if.");
      }
      nodes.push(parseSimple(cur));
      pos++;
    }
    return nodes;
  }
  function headerExpr(stripped, keyword) {
    // strip leading keyword and trailing :
    let rest = stripped.slice(keyword.length).trim();
    if (!rest.endsWith(":")) throw new PyErr(lines[pos].line, `Thiếu dấu : ở cuối dòng ${keyword}`, `Thêm dấu : vào cuối dòng ${keyword}, ví dụ: ${keyword} điều_kiện:`);
    return rest.slice(0, -1).trim();
  }
  function parseIf(ind) {
    const first = lines[pos];
    const branches = [];
    let elseBlock = null;
    let curLine = first;
    let kind = "if";
    while (true) {
      const stripped = curLine.text.trim();
      const cond = kind === "else" ? null : headerExpr(stripped, kind);
      pos++;
      if (pos >= lines.length || indentOf(lines[pos].text) <= ind) {
        throw new PyErr(curLine.line, "Thiếu khối lệnh thụt lề sau dòng này", "Sau dòng kết thúc bằng : phải có ít nhất một dòng thụt lề vào trong.");
      }
      const block = parseBlock(indentOf(lines[pos].text));
      branches.push({ cond, block });
      if (pos < lines.length && indentOf(lines[pos].text) === ind) {
        const nxt = lines[pos].text.trim();
        if (nxt.startsWith("elif ")) { curLine = lines[pos]; kind = "elif"; continue; }
        if (nxt === "else:" || nxt.startsWith("else:")) { curLine = lines[pos]; kind = "else"; pos++; if (pos >= lines.length || indentOf(lines[pos].text) <= ind) throw new PyErr(curLine.line, "Thiếu khối lệnh sau else:", "Sau else: phải có ít nhất một dòng thụt lề."); elseBlock = parseBlock(indentOf(lines[pos].text)); }
      }
      break;
    }
    return { kind: "if", branches, elseBlock, line: first.line };
  }
  function parseFor(ind) {
    const cur = lines[pos];
    const stripped = cur.text.trim();
    const m = stripped.match(/^for\s+([\p{L}_][\p{L}\p{N}\p{Mn}\p{Mc}_]*)\s+in\s+(.+?)\s*:$/u);
    if (!m) {
      if (!stripped.endsWith(":")) throw new PyErr(cur.line, "Thiếu dấu : ở cuối dòng for", "Viết đúng dạng: for bien in range(...): rồi thụt lề khối lệnh.");
      throw new PyErr(cur.line, "Dòng for chưa đúng dạng", "Viết đúng dạng: for bien in range(...): hoặc for bien in danh_sach:");
    }
    pos++;
    if (pos >= lines.length || indentOf(lines[pos].text) <= ind) throw new PyErr(cur.line, "Thiếu khối lệnh thụt lề sau dòng for", "Sau dòng for: phải có ít nhất một dòng thụt lề.");
    return { kind: "for", var: m[1], iter: m[2], block: parseBlock(indentOf(lines[pos].text)), line: cur.line };
  }
  function parseWhile(ind) {
    const cur = lines[pos];
    const cond = headerExpr(cur.text.trim(), "while");
    pos++;
    if (pos >= lines.length || indentOf(lines[pos].text) <= ind) throw new PyErr(cur.line, "Thiếu khối lệnh thụt lề sau dòng while", "Sau dòng while: phải có ít nhất một dòng thụt lề.");
    return { kind: "while", cond, block: parseBlock(indentOf(lines[pos].text)), line: cur.line };
  }
  function parseDef(ind) {
    const cur = lines[pos];
    const stripped = cur.text.trim();
    const m = stripped.match(/^def\s+([\p{L}_][\p{L}\p{N}\p{Mn}\p{Mc}_]*)\s*\(([^)]*)\)\s*:$/u);
    if (!m) {
      if (!stripped.endsWith(":")) throw new PyErr(cur.line, "Thiếu dấu : ở cuối dòng def", "Viết đúng dạng: def ten_ham(tham_so): rồi thụt lề thân hàm.");
      throw new PyErr(cur.line, "Dòng def chưa đúng dạng", "Viết đúng dạng: def ten_ham(a, b):");
    }
    const params = m[2].trim() ? m[2].split(",").map((s) => s.trim()) : [];
    pos++;
    if (pos >= lines.length || indentOf(lines[pos].text) <= ind) throw new PyErr(cur.line, "Thiếu thân hàm thụt lề sau dòng def", "Sau dòng def: phải có ít nhất một dòng thụt lề, thường là return ...");
    return { kind: "def", name: m[1], params, block: parseBlock(indentOf(lines[pos].text)), line: cur.line };
  }
  function parseSimple(cur) {
    const s = cur.text.trim();
    if (s.startsWith("return ")) return { kind: "return", expr: s.slice(7).trim(), line: cur.line };
    if (s === "return") return { kind: "return", expr: "None", line: cur.line };
    if (s === "pass") return { kind: "pass", line: cur.line };
    if (s === "break") return { kind: "break", line: cur.line };
    if (s === "continue") return { kind: "continue", line: cur.line };
    const aug = s.match(/^([\p{L}_][\p{L}\p{N}\p{Mn}\p{Mc}_]*)\s*(\+=|-=|\*=|\/=)\s*(.+)$/u);
    if (aug) return { kind: "augassign", name: aug[1], op: aug[2], expr: aug[3], line: cur.line };
    // Nested indexed assignment: table[i][j] = x  (index inside [..] may contain nested brackets)
    const nested = (() => {
      const nm = s.match(/^([\p{L}_][\p{L}\p{N}\p{Mn}\p{Mc}_]*)/u);
      if (!nm) return null;
      let p = nm[0].length; const idxs = [];
      while (s[p] === "[") {
        let depth = 0; let q = null; let j = p;
        for (; j < s.length; j++) {
          const ch = s[j];
          if (q) { if (ch === "\\") j++; else if (ch === q) q = null; }
          else if (ch === '"' || ch === "'") q = ch;
          else if (ch === "[") depth++;
          else if (ch === "]") { depth--; if (depth === 0) break; }
        }
        if (depth !== 0) return null;
        idxs.push(s.slice(p + 1, j).trim());
        p = j + 1;
      }
      if (idxs.length < 2) return null;
      const rest = s.slice(p);
      const eq = rest.match(/^\s*=(?!=)\s*(.+)$/);
      if (!eq) return null;
      return { kind: "subassign", name: nm[1], indices: idxs, expr: eq[1], line: cur.line };
    })();
    if (nested) return nested;
    const sub = s.match(/^([\p{L}_][\p{L}\p{N}\p{Mn}\p{Mc}_]*)\s*\[\s*(.+?)\s*\]\s*=(?!=)\s*(.+)$/u);
    if (sub) return { kind: "subassign", name: sub[1], index: sub[2], expr: sub[3], line: cur.line };
    const asg = s.match(/^([\p{L}_][\p{L}\p{N}\p{Mn}\p{Mc}_]*)\s*=(?!=)\s*(.+)$/u);
    if (asg) return { kind: "assign", name: asg[1], expr: asg[2], line: cur.line };
    return { kind: "expr", expr: s, line: cur.line };
  }
  const nodes = parseBlock(0);
  if (pos < lines.length) throw new PyErr(lines[pos].line, "Thụt lề không nhất quán", "Các dòng cùng một khối phải thụt lề bằng nhau.");
  return nodes;
}

export function runCode(code, opts = {}) {
  code = prepareCode(code);
  const nodes = parseProgram(code);
  const runner = new Runner(opts);
  const env = [{}];
  try { runner.execBlock(nodes, env); }
  catch (e) {
    // preserve output printed before the error, matching real Python
    if (e && typeof e === "object") e.output = runner.output;
    if (e instanceof RangeError) { const pe = new PyErr(0, "Chương trình gọi đệ quy quá sâu hoặc dùng quá nhiều bộ nhớ", "Kiểm tra điều kiện dừng của hàm đệ quy."); pe.output = runner.output; throw pe; }
    throw e;
  }
  return runner.output;
}

// ---------- Pre-execution syntax check ----------
function stripStrings(line) {
  return line.replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''");
}
export function precheck(code, exercise) {
  code = prepareCode(code);
  const errors = [];
  const lines = code.split("\n");
  lines.forEach((raw, idx) => {
    const lineNo = idx + 1;
    const s = raw.trim();
    if (!s || s.startsWith("#")) return;
    if (/\bPrint\s*\(/.test(s) || /\bPRINT\s*\(/.test(s)) {
      errors.push({ line: lineNo, message: "Bạn viết hoa Print ở dòng này.", fix: "Python phân biệt chữ hoa/thường. Sửa thành print (toàn chữ thường), ví dụ: print(\"Xin chào\")" });
    }
    if (/^(if|elif|else|for|while|def)\b/.test(s) && !s.endsWith(":")) {
      errors.push({ line: lineNo, message: `Dòng ${s.split(/\s|\(/)[0]} thiếu dấu : ở cuối.`, fix: "Thêm dấu : vào cuối dòng này, rồi thụt lề khối lệnh bên dưới." });
    }
    if (/^(if|elif|while)\b/.test(s)) {
      const noStr = stripStrings(s);
      let bad = false;
      for (let i = 0; i < noStr.length; i++) {
        if (noStr[i] === "=" && noStr[i - 1] !== "=" && noStr[i - 1] !== "!" && noStr[i - 1] !== "<" && noStr[i - 1] !== ">" && noStr[i + 1] !== "=") { bad = true; break; }
      }
      if (bad) errors.push({ line: lineNo, message: "Trong điều kiện bạn dùng = (dấu gán) thay vì == (dấu so sánh).", fix: "Muốn so sánh bằng nhau thì dùng ==, ví dụ: if diem == 80: . Dấu = chỉ dùng để gán giá trị cho biến." });
    }
    // String contains {..} without f- prefix (only flagged when exercise requires f-strings)
    if (exercise && exercise.require && exercise.require.includes("fstring")) {
      if (/(^|[^A-Za-z0-9_fF])"[^"]*\{[^}]*\}[^"]*"/.test(s) || /(^|[^A-Za-z0-9_fF])'[^']*\{[^}]*\}[^']*'/.test(s)) {
        errors.push({ line: lineNo, message: "Chuỗi có {…} nhưng thiếu chữ f ở trước dấu ngoặc kép.", fix: "Thêm chữ f trước dấu ngoặc kép, ví dụ: print(f\"Xin chào {ten}\"). Không có f thì Python in nguyên văn {ten}." });
      }
    }
  });
  // Missing indentation after a line ending with :
  for (let i = 0; i < lines.length; i++) {
    const s = lines[i].trim();
    if (!s || s.startsWith("#")) continue;
    if (/^(if|elif|else|for|while|def)\b/.test(s) && s.endsWith(":")) {
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === "") j++;
      if (j >= lines.length) { errors.push({ line: i + 1, message: "Sau dòng này chưa có khối lệnh nào.", fix: "Thêm ít nhất một dòng thụt lề bên dưới dòng kết thúc bằng :." }); break; }
      if (indentOf(lines[j]) <= indentOf(lines[i])) {
        errors.push({ line: j + 1, message: "Dòng này thiếu thụt lề so với khối lệnh ở trên.", fix: "Thụt lề dòng này vào trong (thêm 4 khoảng trắng ở đầu dòng) so với dòng if/for/def ở trên." });
      }
    }
  }
  return errors;
}

export const REQUIRE_LABEL = {
  print: "lệnh print",
  variable: "biến (gán giá trị rồi dùng biến đó)",
  fstring: "f-string (chữ f trước dấu ngoặc kép và {biến} bên trong)",
  if: "lệnh if/else",
  for: "vòng lặp for",
  range: "hàm range(...)",
  list: "danh sách [...]",
  function: "hàm định nghĩa bằng def và được gọi",
  dict: "từ điển {...} với khóa và giá trị",
  while: "vòng lặp while",
  string: "phương thức chuỗi (split/strip/lower/upper/replace/join)",
  pop: "phương thức pop() của danh sách",
  sort: "phương thức sort() của danh sách",
  slice: "cắt lát [a:b]",
  input: "hàm input() để đọc dữ liệu",
  return: "lệnh return trong hàm",
  try: "khối try/except",
  class: "lớp định nghĩa bằng class",
};
export function hasRequire(rawCode, req) {
  const code = (req === "fstring" || req === "dict") ? rawCode : blankStrings(rawCode);
  switch (req) {
    case "print": return /\bprint\s*\(/.test(code);
    case "while": return /\bwhile\b/.test(code);
    case "string": return /\.(split|strip|lower|upper|replace|join|count)\s*\(/.test(code);
    case "pop": return /\.pop\s*\(/.test(code);
    case "sort": return /\.sort\s*\(/.test(code);
    case "slice": return /\[[^\]]*:/.test(code);
    case "variable": return /(^|\n)\s*[\p{L}_][\p{L}\p{N}_]*\s*=(?!=)/u.test(code);
    case "fstring": return /\bf["']/.test(code);
    case "if": return /\bif\b/.test(code);
    case "for": return /\bfor\b.+\bin\b/.test(code);
    case "range": return /\brange\s*\(/.test(code);
    case "input": return /\binput\s*\(/.test(code);
    case "return": return /\breturn\b/.test(code);
    case "try": return /\btry\s*:/.test(code) && /\bexcept\b/.test(code);
    case "class": return /\bclass\s+[\p{L}_]/u.test(code);
    case "list": return /\[[^\]]+\]/.test(code);
    case "dict": return /\{[^}]*:/.test(code) || /=\s*\{\}/.test(code) || /\.get\s*\(/.test(code) || /\["[^"]+"\]\s*=/.test(code);
    case "function": {
      const m = code.match(/\bdef\s+([\p{L}_][\p{L}\p{N}_]*)\s*\(/u);
      if (!m) return false;
      const rest = code.replace(m[0], "");
      return new RegExp(`(?<![\\p{L}\\p{N}_])${m[1]}\\s*\\(`, "u").test(rest);
    }
    default: return true;
  }
}
export function looksHardcoded(code, expected, starter = "") {
  const exp = (expected || "").trim();
  // Do not flag programs with branches/loops/functions: a constant inside
  // print() may be a valid classification branch (e.g. printing 1 or 0).
  if (/\b(if|elif|else|for|while|def)\b/.test(code)) return false;
  // Also catch attempts to bypass the check by assigning a hardcoded answer to a variable and printing it.
  // Only applies to constant assignments printed directly; do not treat expressions/conditions
  // or variables computed from input data as hardcoded answers.
  const simpleAssignments = [...code.matchAll(/^\s*([A-Za-z_]\w*)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*$/gm)];
  const starterNames = new Set([...String(starter || "").matchAll(/^\s*([A-Za-z_]\w*)\s*=/gm)].map((m) => m[1]));
  const directPrints = [...code.matchAll(/print\s*\(\s*([A-Za-z_]\w*)\s*\)/g)].map((m) => m[1]);
  for (const m of simpleAssignments) {
    if (!directPrints.includes(m[1]) || starterNames.has(m[1])) continue;
    if (normalizeOutput(m[2]) === normalizeOutput(exp)) return true;
  }
  // Replacing a sample-input variable with a literal number inside a printed expression
  // (e.g. a + 3 instead of a + b) indicates hardcoding instead of using input data.
  const numericAssignments = simpleAssignments
    .filter((m) => /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(m[2]))
    .map((m) => ({ name: m[1], value: Number(m[2]) }));
  for (const m of code.matchAll(/print\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g)) {
    const expr = m[1];
    const identifiers = new Set(expr.match(/[A-Za-z_]\w*/g) || []);
    const literals = [...expr.matchAll(/(?<![\w.])[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?![\w.])/g)].map((x) => Number(x[0]));
    if (numericAssignments.some((a) => !identifiers.has(a.name) && literals.some((n) => n === a.value))) return true;
  }

  // Control structures, functions, or f-string expressions represent real computation;
  // do not conflate them with hardcoded answers.
  const hasStructure =
    /\bf["']/.test(code) ||
    /\brange\s*\(/.test(code);

  if (hasStructure) return false;
  if (!exp) return false;
  if (!exp.includes("\n")) {
    const esc = exp.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`print\\s*\\(\\s*(["'])${esc}\\1\\s*\\)`).test(code)) return true;
    if (/^\d+$/.test(exp) && new RegExp(`print\\s*\\(\\s*${exp}\\s*\\)`).test(code)) return true;
    return false;
  }
  const prints = [...code.matchAll(/print\s*\(\s*(["'])(.*?)\1\s*\)/g)].map((m) => m[2]);
  return prints.join("\n") === exp;
}

// ---------- Grading ----------
// Normalize output for comparison: unify newlines, strip TRAILING whitespace on each line
// (invisible on screen) and trailing blank lines. LEADING whitespace,
// line order, and content must all match.
export function normalizeOutput(s) {
  const lines = String(s ?? "").replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/[ \t]+$/, ""));
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n");
}
function firstDiff(got, exp) {
  const a = got.split("\n"), b = exp.split("\n");
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) return { line: i + 1, got: a[i], exp: b[i], gotLines: a.length, expLines: b.length };
  return null;
}
export function diffMessage(got, exp) {
  const d = firstDiff(got, exp);
  if (!d) return "";
  if (d.got === undefined) return `Còn thiếu từ dòng ${d.line}: chương trình in ${d.gotLines} dòng nhưng cần ${d.expLines} dòng.`;
  if (d.exp === undefined) return `Thừa từ dòng ${d.line}: chương trình in ${d.gotLines} dòng nhưng chỉ cần ${d.expLines} dòng.`;
  if (d.got.trim() === d.exp.trim()) return `Dòng ${d.line} lệch khoảng trắng ở đầu dòng.`;
  return `Dòng ${d.line} khác: bạn in ${JSON.stringify(d.got)}, cần ${JSON.stringify(d.exp)}.`;
}
// Strip string contents (keeping quote pairs) so technique checks are not fooled by text inside strings
function blankStrings(code) {
  let out = "", q = null;
  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    if (q) { if (c === "\\") { i++; continue; } if (c === q) { q = null; out += c; } else if (c === "\n") { q = null; out += c; } continue; }
    if (c === '"' || c === "'") { q = c; out += c; continue; }
    out += c;
  }
  return out;
}

function runOne(code, stdin) {
  try { return { ok: true, output: runCode(code, { stdin }) }; }
  catch (e) {
    if (e instanceof PyErr) return { ok: false, output: e.output || "", error: { line: e.line, message: e.message, fix: e.hint || "Kiểm tra lại dòng này: chính tả tên biến/hàm, dấu ngoặc và dấu hai chấm." } };
    return { ok: false, output: (e && e.output) || "", error: { line: 0, message: "Chương trình gặp lỗi không xác định.", fix: "Kiểm tra lại từng dòng, bắt đầu từ dòng đầu tiên." } };
  }
}

export function gradeCode(code, exercise) {
  code = prepareCode(code);
  const pre = precheck(code, exercise);
  if (pre.length > 0) return { passed: false, output: "", errors: pre };
  // Multiple test cases (teacher-created exercises with input): run each test, hiding data for hidden tests
  const tests = Array.isArray(exercise.tests) && exercise.tests.length ? exercise.tests : null;
  const first = runOne(code, tests ? tests[0].input : "");
  if (!first.ok) return { passed: false, output: first.output, errors: [first.error] };
  const output = first.output;
  const expected = normalizeOutput(tests ? tests[0].expected : exercise.expectedOutput || "");
  // Hardcoded answer: prints expected output directly while missing required technique
  const needsTechnique = (exercise.require || []).some((r) => r !== "print");
  if (!tests && needsTechnique && looksHardcoded(code, expected, exercise.starter || "")) {
    return { passed: false, output, errors: [{ line: 0, message: "Bạn đang gõ cứng đáp số thay vì làm đúng cách bài yêu cầu.", fix: "Đừng in thẳng kết quả. Hãy dùng biến / vòng lặp / hàm như đề bài yêu cầu để tính ra kết quả đó, rồi mới in ra." }] };
  }
  for (const req of exercise.require || []) {
    if (!hasRequire(code, req)) {
      return { passed: false, output, errors: [{ line: 0, message: `Bài này yêu cầu dùng ${REQUIRE_LABEL[req] || req}, nhưng bài làm của bạn chưa có.`, fix: "Thêm đúng kỹ thuật đó vào bài làm rồi chạy lại. Gợi ý sẽ mở sau lần nộp đầu tiên nếu bạn cần." }] };
    }
  }
  if (!tests) {
    const got = normalizeOutput(output);
    if (got !== expected) {
      return { passed: false, output, errors: [{ line: 0, message: `Kết quả chưa đúng. Bạn in ra: ${got === "" ? "(không có gì)" : JSON.stringify(got)}. Kết quả cần in: ${JSON.stringify(expected)}. ${diffMessage(got, expected)}`.trim(), fix: "So sánh từng dòng kết quả của bạn với kết quả cần in: kiểm tra giá trị biến, phép tính và thứ tự in." }] };
    }
    return { passed: true, output, errors: [], tests: { total: 1, passed: 1 } };
  }
  let passed = 0;
  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const r = i === 0 ? first : runOne(code, t.input);
    const label = t.hidden ? `test ẩn số ${i + 1}` : `test số ${i + 1}`;
    if (!r.ok) return { passed: false, output, errors: [{ ...r.error, message: `Lỗi ở ${label}: ${r.error.message}` }], tests: { total: tests.length, passed } };
    const got = normalizeOutput(r.output), exp = normalizeOutput(t.expected);
    if (got !== exp) {
      const msg = t.hidden
        ? `Chưa đúng ở ${label} (dữ liệu của test ẩn không được hiển thị). Đã đạt ${passed}/${tests.length} test.`
        : `Chưa đúng ở ${label}. Đầu vào: ${JSON.stringify(t.input || "")}. Bạn in ra: ${got === "" ? "(không có gì)" : JSON.stringify(got)}. Cần in: ${JSON.stringify(exp)}. ${diffMessage(got, exp)}`.trim();
      return { passed: false, output, errors: [{ line: 0, message: msg, fix: t.hidden ? "Thử thêm các trường hợp biên: số 0, số âm, dữ liệu rỗng, giá trị lớn nhất/nhỏ nhất." : "So sánh từng dòng với kết quả cần in." }], tests: { total: tests.length, passed } };
    }
    passed++;
  }
  return { passed: true, output, errors: [], tests: { total: tests.length, passed } };
}
