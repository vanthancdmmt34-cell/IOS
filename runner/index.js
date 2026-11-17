// Code runner facade: selects real Python (Docker) or fallback JS interpreter.
// Server only calls runCode / gradeCode here, never calling individual runners directly.
import { execute as runInterp, startPool, statusError, TIMEOUT_MS } from "../run-pool.js";
import { randomUUID } from "node:crypto";
import { dockerAvailable, runMany, runnerStats, testTimeoutMs, image, startPrewarm } from "./py-runner.js";
import { sysGet } from "../modules/sysconfig.js";
import { translatePyError, statusErrorPy } from "./py-errors.js";
import { normalizeQuotes, normalizeOutput, hasRequire, looksHardcoded, diffMessage, precheck, REQUIRE_LABEL } from "../interpreter.js";

let ENGINE = "interpreter";

// When JUDGE_SERVICE_URL is configured, the Backend API dispatches jobs over HTTP to the standalone
// Judge process. If unconfigured, it stays in local mode for backward compatibility with older deployments.
const judgeUrl = () => process.env.JUDGE_LOCAL_EXECUTION === "true" ? "" : String(process.env.JUDGE_SERVICE_URL || "").trim().replace(/\/$/, "");
const judgeToken = () => String(process.env.JUDGE_SERVICE_TOKEN || "");
const judgeTimeoutMs = () => Math.max(1000, Math.min(60000, Number(process.env.JUDGE_REQUEST_TIMEOUT_MS) || 60000));
async function remoteJudge(op, payload, requestId = "") {
  const base = judgeUrl();
  if (!base) return null;
  const controller = new AbortController();
  const rid = /^[A-Za-z0-9_-]{8,100}$/.test(String(requestId)) ? String(requestId) : randomUUID();
  const timer = setTimeout(() => controller.abort(), judgeTimeoutMs());
  try {
    const response = await fetch(`${base}/internal/${op}`, {
      method: "POST", headers: { "content-type": "application/json", "x-request-id": rid, ...(judgeToken() ? { authorization: `Bearer ${judgeToken()}` } : {}) },
      body: JSON.stringify(payload), signal: controller.signal,
    });
    if (!response.ok) {
      if (response.status === 429) {
        let info = {};
        try { info = await response.json(); } catch {}
        const err = new Error(info.error || "Máy chấm đang bận, thử lại sau ít giây.");
        err.status = 429; err.retryAfterSec = Number(info.retryAfterSec) || 0; err.position = Number(info.position) || 0;
        throw err;
      }
      throw new Error(`Judge Service trả về HTTP ${response.status}`);
    }
    const data = await response.json();
    if (!data || data.ok !== true) throw new Error("Judge Service trả về dữ liệu không hợp lệ");
    return data.result;
  } catch (error) {
    // 429 busy errors must preserve their status so the upper layer returns 429 to the frontend,
    // rather than wrapping them as a generic connection error.
    if (error && error.status === 429) throw error;
    const detail = error?.name === "AbortError" ? "hết thời gian chờ" : (error?.message || "không kết nối được");
    throw new Error(`Không thể kết nối Judge Service (${detail}). Tác vụ đã được dừng an toàn; vui lòng thử lại.`);
  } finally { clearTimeout(timer); }
}

export function initRunner(log = console, opts = {}) {
  const want = (sysGet("RUNNER") || "auto").toLowerCase();
  if (want === "interpreter") ENGINE = "interpreter";
  else if (dockerAvailable()) ENGINE = "docker";
  else {
    ENGINE = "interpreter";
    if (want === "docker") log.error(`[runner] RUNNER=docker nhưng không dùng được Docker hoặc chưa có image ${image()}. Tạm dùng bộ thông dịch JS. Xem DEPLOYMENT_GUIDE.md.`);
    else log.warn(`[runner] Chưa có Docker/image ${image()}: dùng bộ thông dịch JS (chỉ hỗ trợ một phần Python).`);
  }
  if (ENGINE === "interpreter") startPool();
  // Pre-warm: only the process that directly executes code keeps warm containers.
  // - judge-worker (JUDGE_LOCAL_EXECUTION=true): keeps pool.
  // - app running locally (no JUDGE_SERVICE_URL): keeps pool.
  // - app connected to remote-judge: does not keep pool (code runs on judge-worker).
  // RUN_PREWARM defaults to 2; set 0 to disable; opts.prewarm === false to disable individually.
  const allowPrewarm = opts.prewarm !== false && (process.env.JUDGE_LOCAL_EXECUTION === "true" || !judgeUrl());
  if (ENGINE === "docker" && allowPrewarm) startPrewarm();
  return ENGINE;
}
export const engine = () => ENGINE;
// Re-select runner engine (after changing config in Admin or building a new image). Returns the new engine.
export function reinitRunner(log = console) { return initRunner(log); }
export function runnerInfo() {
  // Backend cannot directly verify the Judge's Docker/runtime from within this process.
  // `null` means unknown; avoid claiming isolated sandbox if Judge is running in compatibility mode.
  if (judgeUrl()) return { engine: "remote-judge", isolated: null, isolation: "reported-by-judge-service", service: judgeUrl(), timeoutMs: judgeTimeoutMs() };
  return ENGINE === "docker"
    ? { engine: "python-docker", isolated: true, timeoutMs: testTimeoutMs(), ...runnerStats() }
    : { engine: "interpreter", isolated: false, mode: "compatibility-fallback", timeoutMs: TIMEOUT_MS };
}

// Syntax error: if the Vietnamese error linter catches the exact line, use its explanation.
function friendlyCompile(code, ce) {
  const t = translatePyError(ce);
  const pre = precheck(code, {}).find((e) => e.line === t.line);
  if (pre && /SyntaxError|IndentationError/.test(ce.type)) return { line: t.line, message: `${pre.message} (Python báo: ${ce.type}: ${ce.message})`, fix: pre.fix };
  return t;
}

// ---- Trial run ----
export async function runCode(code, stdin, requestId) {
  if (judgeUrl()) return await remoteJudge("run", { code: String(code || ""), stdin: String(stdin || "").slice(0, 20000) }, requestId);
  if (ENGINE === "interpreter") {
    const r = await runInterp({ op: "run", code, stdin: String(stdin || "").slice(0, 20000) });
    if (r.status === "ok") return { status: "ok", output: r.output, errors: [] };
    if (r.status === "error") return { status: "error", output: r.output || "", errors: [r.error] };
    return { status: r.status, output: "", errors: [statusError(r.status)] };
  }
  const src = normalizeQuotes(code);
  const r = await runMany(src, [String(stdin || "")]);
  if (r.status !== "ok") return { status: r.status, output: "", errors: [statusErrorPy(r.status, testTimeoutMs())] };
  if (r.compileError) return { status: "error", output: "", errors: [friendlyCompile(src, r.compileError)] };
  const one = r.results[0] || { ok: false, output: "", error: { type: "Error" } };
  // Match legacy interpreter: strip the trailing newline from print
  const out = String(one.output || "").replace(/\n$/, "");
  if (one.ok) return { status: "ok", output: out, errors: [] };
  return { status: one.error && one.error.type === "Timeout" ? "timeout" : "error", output: out, errors: [translatePyError(one.error)] };
}

// The JS interpreter does not distinguish float/int (prints 5 instead of 5.0). Expected answers follow
// real Python; when running on the JS interpreter, accept the shortened form "5" for "5.0".
export function relaxFloat(s) { return String(s ?? "").replace(/(?<![\d.])(\d+)\.0(?!\d)/g, "$1"); }
function relaxForInterpreter(ex) {
  if (!ex) return ex;
  return { ...ex, expectedOutput: relaxFloat(ex.expectedOutput), tests: Array.isArray(ex.tests) ? ex.tests.map((t) => ({ ...t, expected: relaxFloat(t.expected) })) : ex.tests };
}

// ---- Grading ----
// Same rules as the legacy grader (gradeCode): required techniques, anti-hardcoding,
// output matching (trim trailing whitespace per line), multiple tests, hidden tests without leaking data.
export async function gradeCode(code, exercise, requestId) {
  if (judgeUrl()) return await remoteJudge("grade", { code: String(code || ""), exercise }, requestId);
  if (ENGINE === "interpreter") {
    let r = await runInterp({ op: "grade", code, exercise });
    if (r.status === "ok" && !r.result.passed) {
      const r2 = await runInterp({ op: "grade", code, exercise: relaxForInterpreter(exercise) });
      if (r2.status === "ok" && r2.result.passed) r = r2;
    }
    if (r.status === "ok") return r.result;
    if (r.status === "error") return { passed: false, output: r.output || "", errors: [r.error] };
    return { passed: false, output: "", errors: [statusError(r.status)], status: r.status };
  }
  const src = normalizeQuotes(code);
  const tests = Array.isArray(exercise.tests) && exercise.tests.length ? exercise.tests : null;
  const inputs = tests ? tests.map((t) => String(t.input || "")) : [String(exercise.stdin || "")];
  const r = await runMany(src, inputs);
  if (r.status !== "ok") return { passed: false, output: "", errors: [statusErrorPy(r.status, testTimeoutMs())], status: r.status };
  if (r.compileError) return { passed: false, output: "", errors: [friendlyCompile(src, r.compileError)] };
  const res = r.results;
  const first = res[0];
  const output = first ? first.output : "";
  if (!first.ok) return { passed: false, output, errors: [translatePyError(first.error)] };
  const expected = normalizeOutput(tests ? tests[0].expected : exercise.expectedOutput || "");
  const needsTechnique = (exercise.require || []).some((x) => x !== "print");
  if (!tests && needsTechnique && looksHardcoded(src, expected, exercise.starter || "")) {
    return { passed: false, output, errors: [{ line: 0, message: "Bạn đang gõ cứng đáp số thay vì làm đúng cách bài yêu cầu.", fix: "Đừng in thẳng kết quả. Hãy dùng biến / vòng lặp / hàm như đề bài yêu cầu để tính ra kết quả đó, rồi mới in ra." }] };
  }
  for (const req of exercise.require || []) {
    if (!hasRequire(src, req)) return { passed: false, output, errors: [{ line: 0, message: `Bài này yêu cầu dùng ${REQUIRE_LABEL[req] || req}, nhưng bài làm của bạn chưa có.`, fix: "Thêm đúng kỹ thuật đó vào bài làm rồi chạy lại." }] };
  }
  if (!tests) {
    const got = normalizeOutput(output);
    if (got !== expected) return { passed: false, output, errors: [{ line: 0, message: `Kết quả chưa đúng. Bạn in ra: ${got === "" ? "(không có gì)" : JSON.stringify(got)}. Kết quả cần in: ${JSON.stringify(expected)}. ${diffMessage(got, expected)}`.trim(), fix: "So sánh từng dòng kết quả của bạn với kết quả cần in: kiểm tra giá trị biến, phép tính và thứ tự in." }] };
    return { passed: true, output, errors: [], tests: { total: 1, passed: 1 } };
  }
  let passed = 0;
  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const one = res[i];
    const label = t.hidden ? `test ẩn số ${i + 1}` : `test số ${i + 1}`;
    if (!one || !one.ok) {
      const e = translatePyError(one ? one.error : { type: "Error" });
      return { passed: false, output, errors: [{ ...e, line: t.hidden ? 0 : e.line, message: `Lỗi ở ${label}: ${e.message}` }], tests: { total: tests.length, passed } };
    }
    const got = normalizeOutput(one.output), exp = normalizeOutput(t.expected);
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
