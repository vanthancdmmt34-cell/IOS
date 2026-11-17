// Run student C / C++ / Java submissions (4.10.0).
// Security: by default ONLY runs inside an isolated Docker container (no network, read-only, user nobody,
// drop all capabilities, RAM/CPU/process/time limits). A fresh container is spawned per submission.
//
// Environment variables:
//   CODE_RUNNER        auto | docker | local | off   (default auto = use Docker if Docker + image available, otherwise off)
//                      local: run directly via gcc/g++/javac on host — for testing ONLY, NOT secure.
//   CODE_RUNNER_IMAGE  image (default pylab-cc:1, build: docker build -t pylab-cc:1 runner/cc/)
//   CODE_RUN_WORKERS   max concurrent runs (default 2)
//   CODE_RUN_MEMORY_MB RAM per container in MB (default 384)
import { spawn, execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

const HARNESS_PATH = new URL("../runner/cc/harness.py", import.meta.url);
const HARNESS = fs.readFileSync(HARNESS_PATH, "utf8");
const DOCKER = process.env.RUNNER_DOCKER || "docker";
const IMAGE = () => process.env.CODE_RUNNER_IMAGE || "pylab-cc:1";
const WORKERS = () => Math.min(8, Math.max(1, Number(process.env.CODE_RUN_WORKERS) || 2));
const MEM = () => Math.min(2048, Math.max(128, Number(process.env.CODE_RUN_MEMORY_MB) || 384));

let MODE = null; // "docker" | "local" | "off"
export function codeRunnerMode() {
  if (MODE) return MODE;
  const want = String(process.env.CODE_RUNNER || "auto").toLowerCase();
  if (want === "off") return (MODE = "off");
  if (want === "local") return (MODE = "local");
  try { execFileSync(DOCKER, ["image", "inspect", IMAGE()], { stdio: "ignore", timeout: 15000 }); MODE = "docker"; }
  catch { MODE = want === "docker" ? "docker" : "off"; }
  return MODE;
}
export function codeRunnerInfo() {
  const m = codeRunnerMode();
  return { mode: m, image: IMAGE(), ready: m !== "off" };
}

let running = 0;
const queue = [];
function slot() { return new Promise((r) => { if (running < WORKERS()) { running++; r(); } else queue.push(r); }); }
function release() { const n = queue.shift(); if (n) n(); else running--; }

function dockerArgs(name, lang) {
  return [
    "run", "--rm", "-i", "--name", name,
    "--network", "none", "--read-only",
    "--tmpfs", "/tmp:rw,exec,nosuid,nodev,size=96m",
    "--ipc", "private", "--user", "65534:65534",
    "--cap-drop", "ALL", "--security-opt", "no-new-privileges",
    "--pids-limit", lang === "java" ? "96" : "32",
    "--memory", MEM() + "m", "--memory-swap", MEM() + "m",
    "--cpus", "1",
    "--ulimit", "fsize=8388608:8388608", "--ulimit", "nofile=128:128", "--ulimit", "core=0:0",
    "--workdir", "/tmp", "--env", "HOME=/tmp", "--log-driver", "none",
    IMAGE(), "python3", "-I", "-S", "-B", "/opt/harness.py",
  ];
}

/** tests: array of input strings. Returns { ok, stage?, error?, results?[] } */
export async function runCode({ lang, code, tests, tlMs = 2000 }) {
  const mode = codeRunnerMode();
  if (mode === "off") return { ok: false, stage: "setup", error: "RUNNER_OFF" };
  if (!["c", "cpp", "java"].includes(lang)) return { ok: false, stage: "setup", error: "Ngôn ngữ không hỗ trợ." };
  await slot();
  try {
    const payload = JSON.stringify({ lang, code: String(code || "").slice(0, 100000), tests: (tests || []).slice(0, 30), tl: tlMs });
    const total = 30000 + (tests || []).length * tlMs * (lang === "java" ? 3 : 1);
    const name = "pylab-cc-" + crypto.randomBytes(6).toString("hex");
    const [cmd, args] = mode === "docker" ? [DOCKER, dockerArgs(name, lang)] : ["python3", ["-I", "-S", "-B", "-c", HARNESS]];
    return await new Promise((resolve) => {
      const child = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"], env: mode === "local" ? { PATH: process.env.PATH, HOME: "/tmp", LANG: "C.UTF-8" } : process.env });
      let out = "", err = "";
      const timer = setTimeout(() => { try { child.kill("SIGKILL"); } catch {} if (mode === "docker") spawn(DOCKER, ["rm", "-f", name], { stdio: "ignore" }); resolve({ ok: false, stage: "run", error: "Hết thời gian chấm." }); }, total);
      child.stdout.on("data", (d) => { if (out.length < 4e6) out += d; });
      child.stderr.on("data", (d) => { if (err.length < 1e5) err += d; });
      child.on("error", (e) => { clearTimeout(timer); resolve({ ok: false, stage: "setup", error: "Không khởi động được trình chấm: " + e.message }); });
      child.on("close", () => {
        clearTimeout(timer);
        try { resolve(JSON.parse(out.trim().split("\n").pop())); }
        catch { resolve({ ok: false, stage: "setup", error: "Trình chấm lỗi: " + (err || out).slice(0, 500) }); }
      });
      child.stdin.end(payload);
    });
  } finally { release(); }
}
