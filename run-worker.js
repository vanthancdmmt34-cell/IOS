// Worker thread executing student code, isolated from the web process.
// If code hangs or exhausts memory, only this worker is terminated and recreated; the web server keeps running normally.
import { parentPort } from "node:worker_threads";
import { runCode, gradeCode, PyErr } from "./interpreter.js";

parentPort.on("message", (job) => {
  const { id, op } = job;
  try {
    if (op === "run") {
      const output = runCode(job.code, { stdin: job.stdin || "" });
      parentPort.postMessage({ id, ok: true, output });
    } else if (op === "grade") {
      parentPort.postMessage({ id, ok: true, result: gradeCode(job.code, job.exercise) });
    } else {
      parentPort.postMessage({ id, ok: false, error: { line: 0, message: "Yêu cầu không hợp lệ.", fix: "" } });
    }
  } catch (e) {
    if (e instanceof PyErr) parentPort.postMessage({ id, ok: false, output: e.output || "", error: { line: e.line, message: e.message, fix: e.hint || "" } });
    else parentPort.postMessage({ id, ok: false, output: (e && e.output) || "", error: { line: 0, message: e instanceof RangeError ? "Chương trình gọi đệ quy quá sâu hoặc dùng quá nhiều bộ nhớ." : "Chương trình gặp lỗi không xác định.", fix: "Kiểm tra lại từng dòng, bắt đầu từ dòng đầu tiên." } });
  }
});
