// Code runner worker pool: time limit, memory limit, queue. No external dependencies.
// Environment variables (optional):
//   RUN_WORKERS     number of parallel workers (default 2)
//   RUN_TIMEOUT_MS  max execution time per run (default 2000)
//   RUN_MEMORY_MB   max memory per worker (default 96)
import { Worker } from "node:worker_threads";

const SIZE = Math.max(1, Number(process.env.RUN_WORKERS) || 2);
export const TIMEOUT_MS = Math.max(500, Number(process.env.RUN_TIMEOUT_MS) || 2000);
const MEMORY_MB = Math.max(32, Number(process.env.RUN_MEMORY_MB) || 96);
const QUEUE_MAX = 200;
const WORKER_URL = new URL("./run-worker.js", import.meta.url);

let seq = 0;
const queue = [];
const slots = [];

function makeSlot() {
  const slot = { worker: null, job: null, timer: null, dead: false };
  const spawn = () => {
    slot.worker = new Worker(WORKER_URL, { resourceLimits: { maxOldGenerationSizeMb: MEMORY_MB, maxYoungGenerationSizeMb: 16, stackSizeMb: 4 } });
    slot.worker.on("message", (m) => {
      if (!slot.job || m.id !== slot.job.id) return;
      finish(slot, { status: m.ok ? "ok" : "error", ...m });
    });
    slot.worker.on("error", (err) => {
      const mem = err && (err.code === "ERR_WORKER_OUT_OF_MEMORY" || /memory/i.test(err.message || ""));
      if (slot.job) finish(slot, { status: mem ? "memory" : "crash" }, true);
    });
    slot.worker.on("exit", () => {
      if (slot.job) finish(slot, { status: slot.timedOut ? "timeout" : "crash" }, true);
      if (!slot.dead) { slot.timedOut = false; spawn(); pump(); }
    });
    slot.worker.unref();
  };
  spawn();
  return slot;
}

function finish(slot, res, workerGone = false) {
  const job = slot.job;
  if (!job) return;
  clearTimeout(slot.timer);
  slot.job = null;
  job.resolve(res);
  if (!workerGone) pump();
}

function pump() {
  for (const slot of slots) {
    if (slot.job || !queue.length || !slot.worker) continue;
    const job = queue.shift();
    slot.job = job;
    slot.timedOut = false;
    slot.timer = setTimeout(() => { slot.timedOut = true; slot.worker.terminate(); }, TIMEOUT_MS);
    slot.worker.postMessage(job.payload);
  }
}

export function startPool() {
  if (slots.length) return;
  for (let i = 0; i < SIZE; i++) slots.push(makeSlot());
}

// Returns { status: "ok" | "error" | "timeout" | "memory" | "crash" | "busy", output?, error?, result? }
export function execute(payload) {
  if (!slots.length) startPool();
  if (queue.length >= QUEUE_MAX) return Promise.resolve({ status: "busy" });
  return new Promise((resolve) => {
    const id = ++seq;
    queue.push({ id, payload: { ...payload, id }, resolve });
    pump();
  });
}

export function stopPool() {
  for (const s of slots) { s.dead = true; try { s.worker.terminate(); } catch {} }
  slots.length = 0;
}

// Friendly error messages for each abnormal status
export function statusError(status) {
  if (status === "timeout") return { line: 0, message: `Chương trình chạy quá ${TIMEOUT_MS / 1000} giây nên đã bị dừng (có thể là vòng lặp vô hạn hoặc tính toán quá nặng).`, fix: "Kiểm tra điều kiện dừng của vòng lặp while, range() của vòng for, và điều kiện dừng của hàm đệ quy." };
  if (status === "memory") return { line: 0, message: "Chương trình dùng quá nhiều bộ nhớ nên đã bị dừng.", fix: "Bài tập ở đây chỉ cần dữ liệu nhỏ. Kiểm tra các danh sách hoặc chuỗi đang phình to trong vòng lặp." };
  if (status === "busy") return { line: 0, message: "Máy chủ đang chấm quá nhiều bài cùng lúc.", fix: "Chờ vài giây rồi bấm lại." };
  return { line: 0, message: "Bộ chạy code gặp sự cố và đã tự khởi động lại.", fix: "Bấm chạy lại. Nếu lỗi lặp lại, báo cho giáo viên." };
}
