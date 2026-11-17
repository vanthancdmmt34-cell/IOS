// Run REAL Python code inside an isolated Docker container; each run/submission uses a fresh container.
// Limits: no network, read-only rootfs, user nobody, all capabilities dropped, no-new-privileges,
// CPU/RAM/pids/file size/open files, per-test and total timeouts,
// output volume limit. Never pass host environment variables or mount host directories into the container.
//
// Environment variables:
//   RUNNER            docker | interpreter | auto (default auto: use Docker if Docker + image are available)
//   RUNNER_IMAGE      Python image (default pylab-python:3.12, built from runner/Dockerfile)
//   RUNNER_DOCKER     docker binary command (default "docker")
//   RUN_WORKERS       max concurrent containers (default 2)
//   RUN_TIMEOUT_MS    max time per test in ms (default 3000)
//   RUN_MEMORY_MB     max RAM per container in MB (default 64)
//   RUN_CPUS          max CPUs per container (default 0.5)
//   RUN_PREWARM       number of pre-warmed containers on startup (default 0 = off; recommended 2-4)
//                     Pre-warming reduces first-request latency by starting "warm idle" containers ahead of time.
//                     Each container is used only once and then replaced, guaranteeing isolation boundaries.
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import crypto from "node:crypto";
import { sysGet } from "../modules/sysconfig.js";

const HARNESS = fs.readFileSync(new URL("./harness.py", import.meta.url), "utf8");
const DOCKER = process.env.RUNNER_DOCKER || "docker";
const selectedRuntime = () => String(process.env.RUNNER_RUNTIME || "").trim();
export function dockerRuntimeArgs(runtime = selectedRuntime()) {
  const name = String(runtime || "").trim();
  if (!name) return [];
  if (!/^[A-Za-z0-9_.-]{1,64}$/.test(name)) throw new Error("RUNNER_RUNTIME không hợp lệ.");
  return ["--runtime", name];
}
// Read on every run: changes in Admin take effect immediately (priority: Admin > env vars > defaults)
export const image = () => sysGet("RUNNER_IMAGE") || "pylab-python:3.12";
// numpy: code co import numpy -> dung image khoa hoc (co numpy 2.2.6 o /opt/pylibs), bo qua warm pool.
const SCI_IMAGE = "pylab-python-sci:3.12";
const needsNumpy = (code) => /(?:^|[;\n])\s*(?:import\s+numpy\b|from\s+numpy\b)/.test(String(code || ""));
const slots = () => Math.min(16, Math.max(1, Number(sysGet("RUN_WORKERS")) || 2));
export const testTimeoutMs = () => Math.min(20000, Math.max(500, Number(sysGet("RUN_TIMEOUT_MS")) || 3000));
const memoryMb = () => Math.min(1024, Math.max(32, Number(sysGet("RUN_MEMORY_MB")) || 64));
const cpus = () => String(Math.min(8, Math.max(0.1, Number(sysGet("RUN_CPUS")) || 0.5)));
const OUTPUT_LIMIT = 64 * 1024;
const QUEUE_MAX = 200;
const MAX_TESTS = 30;

let running = 0;
const queue = [];

// ── Pre-warm pool (medium-term) ───────────────────────────────────────────────
// Keep N started containers ready; each is used once then discarded -> no state reuse.
// A warm idle container waits on stdin; when a new job arrives, use a ready container instead of waiting for
// Docker pull + init. When the pool is empty, automatically spawn a new container as usual (non-blocking).
//
// Each warm entry: { child, stdoutChunks, stderrChunks, ready, name }
// "ready" = container started successfully (PID seen from harness), ready to accept a stdin job.

const prewarmPool = [];
const PREWARM_SIZE = () => Math.min(8, Math.max(0, Number(sysGet("RUN_PREWARM") || process.env.RUN_PREWARM || 2)));
let _prewarmEnabled = false;

/**
 * Start 1 warm container and add it to the pool.
 * The container runs harness.py waiting on stdin; consumes no CPU until a job arrives.
 */
function spawnWarmContainer() {
  const name = "pylab-warm-" + crypto.randomBytes(8).toString("hex");
  const child = spawn(DOCKER, dockerArgs(name), { stdio: ["pipe", "pipe", "pipe"] });
  const entry = { child, name, stdoutChunks: [], stderrChunks: [], ready: false, done: false };

  child.stdout.on("data", (d) => {
    if (entry.done) return;
    if (entry.stdoutChunks.length < 200) entry.stdoutChunks.push(d);
    // Harness signals readiness by printing "__warm_ready__\n" on stderr when idle
    // (does not rely on stdout to avoid mixing with student output)
    if (!entry.ready) entry.ready = true;
  });
  child.stderr.on("data", (d) => {
    if (entry.done) return;
    if (entry.stderrChunks.length < 20) entry.stderrChunks.push(d);
    const text = d.toString();
    if (!entry.ready && text.includes("__warm_ready__")) entry.ready = true;
  });
  // Harness does not print a ready signal (it just reads stdin and runs), so treat the container
  // as ready if it is still alive after 1.5s: by then Python has finished starting and is
  // waiting on stdin. If the container dies before 1.5s (e.g. bad Docker flag), done = true
  // so it will not be falsely marked ready.
  setTimeout(() => { if (!entry.done) entry.ready = true; }, 1500);
  child.on("error", () => { entry.done = true; removeFromPool(entry); });
  child.on("close", () => { entry.done = true; removeFromPool(entry); });

  prewarmPool.push(entry);
  return entry;
}

function removeFromPool(entry) {
  const idx = prewarmPool.indexOf(entry);
  if (idx >= 0) prewarmPool.splice(idx, 1);
}

/**
 * Take 1 ready warm container from the pool. Returns null if the pool is empty / not ready.
 * After taking one, automatically replenishes 1 new container if below target.
 */
function acquireWarmContainer() {
  const idx = prewarmPool.findIndex((e) => !e.done && e.ready);
  if (idx < 0) return null;
  const entry = prewarmPool.splice(idx, 1)[0];
  // Replenish pool asynchronously
  if (_prewarmEnabled && prewarmPool.filter((e) => !e.done).length < PREWARM_SIZE()) {
    setTimeout(spawnWarmContainer, 200);
  }
  return entry;
}

/**
 * Initialize the pre-warm pool. Called once after Docker is confirmed ready.
 */
export function startPrewarm(size = PREWARM_SIZE()) {
  if (size <= 0) return;
  _prewarmEnabled = true;
  for (let i = 0; i < size; i++) {
    // Stagger startups to avoid I/O spikes on boot
    setTimeout(spawnWarmContainer, i * 400);
  }
}

/** Stats for health/metrics */
export function prewarmStats() {
  return {
    enabled: _prewarmEnabled,
    poolSize: PREWARM_SIZE(),
    total: prewarmPool.length,
    ready: prewarmPool.filter((e) => !e.done && e.ready).length,
    pending: prewarmPool.filter((e) => !e.done && !e.ready).length,
  };
}

// Check if Docker + image are available (called at startup). Does not throw.
export function dockerAvailable() {
  try {
    execFileSync(DOCKER, ["image", "inspect", image()], { stdio: "ignore", timeout: 15000 });
    const runtime = selectedRuntime();
    if (runtime) {
      // Only accept runtimes registered with the Docker daemon; never silently fall back to runc.
      dockerRuntimeArgs(runtime);
      const output = execFileSync(DOCKER, ["info", "--format", "{{json .Runtimes}}"], { encoding: "utf8", timeout: 15000, stdio: ["ignore", "pipe", "ignore"] });
      const runtimes = JSON.parse(output || "{}");
      if (!runtimes || !Object.prototype.hasOwnProperty.call(runtimes, runtime)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function dockerArgs(name, code) {
  return [
    "run", "--rm", "-i", "--name", name,
    ...dockerRuntimeArgs(),
    "--network", "none",
    "--read-only",
    "--tmpfs", "/tmp:rw,noexec,nosuid,nodev,size=16m",
    "--ipc", "private",
    "--shm-size", "8m",
    "--user", "65534:65534",
    "--cap-drop", "ALL",
    "--security-opt", "no-new-privileges",
    "--pids-limit", "32",
    "--memory", memoryMb() + "m", "--memory-swap", memoryMb() + "m",
    "--cpus", cpus(),
    "--ulimit", "fsize=1048576:1048576",
    "--ulimit", "nofile=64:64",
    "--ulimit", "nproc=32:32",
    "--ulimit", "core=0:0",
    "--workdir", "/tmp",
    "--env", "PYTHONIOENCODING=utf-8",
    "--env", "PYTHONDONTWRITEBYTECODE=1",
    "--log-driver", "none",
    needsNumpy(code) ? SCI_IMAGE : image(),
    "python3", "-I", "-S", "-B", "-c", HARNESS,
  ];
}

function runContainer(code, inputs) {
  return new Promise((resolve) => {
    // Try taking a warm container from the pool first; spawn a fresh one if none is available.
    const warm = needsNumpy(code) ? null : acquireWarmContainer();
    const name = warm ? warm.name : "pylab-run-" + crypto.randomBytes(8).toString("hex");
    const wall = Math.min(60000, 1000 + testTimeoutMs() * inputs.length);
    const child = warm ? warm.child : spawn(DOCKER, dockerArgs(name, code), { stdio: ["pipe", "pipe", "pipe"] });
    let out = "", err = "", done = false;
    const finish = (r) => { if (done) return; done = true; clearTimeout(timer); resolve(r); };
    const timer = setTimeout(() => {
      // Total timeout exceeded: kill the container (not just the docker CLI process)
      try { execFileSync(DOCKER, ["kill", name], { stdio: "ignore", timeout: 10000 }); } catch {}
      child.kill("SIGKILL");
      finish({ status: "timeout" });
    }, wall);
    child.stdout.on("data", (d) => { if (out.length < OUTPUT_LIMIT * (inputs.length + 1) * 2) out += d; });
    child.stderr.on("data", (d) => { if (err.length < 4000) err += d; });
    child.on("error", () => finish({ status: "crash", detail: "docker" }));
    child.on("close", (codeExit) => {
      const line = out.trim().split("\n").pop() || "";
      try {
        return finish({ status: "ok", data: JSON.parse(line) });
      } catch {
        // 137 = killed due to out-of-memory (OOM) or forcibly stopped
        if (codeExit === 137) return finish({ status: "memory" });
        return finish({ status: "crash", detail: err.slice(0, 300) });
      }
    });
    child.stdin.on("error", () => {});
    child.stdin.end(JSON.stringify({ code, inputs, limit: OUTPUT_LIMIT, per_test_s: testTimeoutMs() / 1000 }) + "\n");
  });
}

function pump() {
  while (running < slots() && queue.length) {
    const job = queue.shift();
    running++;
    runContainer(job.code, job.inputs).then((r) => { running--; job.resolve(r); pump(); });
  }
}

// Run code against a list of inputs. Returns:
//   { status: "ok", compileError? , results?: [{ok, output, error}] } or { status: "timeout"|"memory"|"busy"|"crash" }
export function runMany(code, inputs) {
  const list = (inputs && inputs.length ? inputs : [""]).slice(0, MAX_TESTS).map((s) => String(s ?? "").slice(0, 20000));
  if (queue.length >= QUEUE_MAX) return Promise.resolve({ status: "busy" });
  return new Promise((resolve) => {
    queue.push({ code: String(code || ""), inputs: list, resolve });
    pump();
  }).then((r) => {
    if (r.status !== "ok") return r;
    if (r.data.compile_error) return { status: "ok", compileError: r.data.compile_error };
    return { status: "ok", results: r.data.results || [] };
  });
}

export function runnerStats() {
  return { running, queued: queue.length, slots: slots(), image: image(), runtime: selectedRuntime() || "default", memoryMb: memoryMb(), cpus: Number(cpus()), prewarm: prewarmStats() };
}
