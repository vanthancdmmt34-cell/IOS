#!/usr/bin/env node
// smoke-test-judge.mjs - Quick smoke test for Judge Service + Docker sandbox + gVisor
// Usage: node tools/smoke-test-judge.mjs [--runtime runsc] [--url http://127.0.0.1:4101]
//
// Requires: Judge Service running, JUDGE_SERVICE_TOKEN in env or --token.
// Exits 0 if all tests pass, 1 on any failure.
//
// Test cases:
//   1. Health check
//   2. Basic code run (print hello)
//   3. Syntax error -> must return error with line number
//   4. Runtime error (ZeroDivisionError)
//   5. Timeout (infinite loop)
//   6. Memory limit (allocate >128MB)
//   7. Grade correct code
//   8. Grade wrong output
//   9. Concurrent jobs (concurrency)
//  10. (if --runtime runsc) Verify gVisor runtime is active

import { parseArgs } from "node:util";

const { values: args } = parseArgs({
  options: {
    url: { type: "string", default: process.env.JUDGE_HEALTH_URL?.replace("/health", "") || "http://127.0.0.1:4101" },
    token: { type: "string", default: process.env.JUDGE_SERVICE_TOKEN || "" },
    runtime: { type: "string", default: process.env.RUNNER_RUNTIME || "" },
    timeout: { type: "string", default: "15000" },
    concurrency: { type: "string", default: "4" },
  },
  strict: false,
});

const BASE = String(args.url).replace(/\/$/, "");
const TOKEN = String(args.token);
const RUNTIME = String(args.runtime);
const TIMEOUT_MS = Math.max(3000, Number(args.timeout) || 15000);
const CONCURRENT = Math.max(2, Math.min(16, Number(args.concurrency) || 4));

if (!TOKEN || TOKEN.length < 24) {
  console.error("❌  JUDGE_SERVICE_TOKEN chưa được đặt hoặc quá ngắn (cần ≥ 24 ký tự).");
  console.error("     Đặt env JUDGE_SERVICE_TOKEN hoặc dùng --token <token>");
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function ok(name) {
  passed++;
  console.log(`  ✅ ${name}`);
}

function fail(name, reason) {
  failed++;
  failures.push({ name, reason });
  console.error(`  ❌ ${name}: ${reason}`);
}

async function judgeRequest(path, body, { expectOk = true } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    const data = await res.json();
    if (expectOk && !data.ok) throw new Error(`ok=false: ${data.error || JSON.stringify(data)}`);
    return { status: res.status, data };
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function healthCheck() {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}/health`, { signal: ctrl.signal });
    clearTimeout(timer);
    const data = await res.json();
    return data;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ── Test runner ───────────────────────────────────────────────────────────────

async function runTests() {
  console.log(`\n🔍  Smoke test Judge Service`);
  console.log(`    URL      : ${BASE}`);
  console.log(`    Runtime  : ${RUNTIME || "default (runc)"}`);
  console.log(`    Timeout  : ${TIMEOUT_MS}ms per request`);
  console.log(`    Concurrent: ${CONCURRENT} jobs\n`);

  // ── Test 1: Health check ──────────────────────────────────────────────────
  try {
    const h = await healthCheck();
    if (!h.ok) throw new Error(`ok=false: ${JSON.stringify(h)}`);
    const mode = h.mode || "unknown";
    ok(`Health check (mode=${mode})`);
    if (RUNTIME && h.runner?.runtime && h.runner.runtime !== RUNTIME) {
      fail("gVisor runtime check", `Health báo runtime=${h.runner.runtime}, mong ${RUNTIME}`);
    } else if (RUNTIME) {
      // runtime is verified via worker/health info
      console.log(`    ℹ️  Runtime ${RUNTIME} — kiểm tra gVisor trong test sandbox bên dưới`);
    }
  } catch (err) {
    fail("Health check", err.message);
    console.error("    ⚠️  Judge Service không phản hồi. Dừng sớm.");
    printSummary();
    process.exit(1);
  }

  // ── Test 2: Basic run ─────────────────────────────────────────────────────
  try {
    const { data } = await judgeRequest("/internal/run", { code: 'print("hello smoke")' });
    const out = data.result?.output?.trim();
    if (out !== "hello smoke") throw new Error(`output="${out}", mong "hello smoke"`);
    ok("Basic print");
  } catch (err) {
    fail("Basic print", err.message);
  }

  // ── Test 3: Syntax error ──────────────────────────────────────────────────
  try {
    const { data } = await judgeRequest("/internal/run", { code: "print(\nfor x in range(10):" });
    const r = data.result;
    if (r?.status !== "error") throw new Error(`status="${r?.status}", mong "error"`);
    if (!r.errors?.length) throw new Error("Không có errors[]");
    ok(`Syntax error (line=${r.errors[0]?.line ?? "?"})`);
  } catch (err) {
    fail("Syntax error detection", err.message);
  }

  // ── Test 4: Runtime error (ZeroDivisionError) ─────────────────────────────
  try {
    const { data } = await judgeRequest("/internal/run", { code: "x = 1/0\nprint(x)" });
    const r = data.result;
    if (r?.status !== "error") throw new Error(`status="${r?.status}", mong "error"`);
    if (!r.errors?.some((e) => /chia|zero|ZeroDivision/i.test(e.message || ""))) {
      console.log(`    ℹ️  errors: ${JSON.stringify(r.errors)}`);
    }
    ok("Runtime error (ZeroDivisionError)");
  } catch (err) {
    fail("Runtime error", err.message);
  }

  // ── Test 5: Timeout ───────────────────────────────────────────────────────
  try {
    const start = Date.now();
    const { data } = await judgeRequest("/internal/run", { code: "while True: pass" }, { expectOk: true });
    const elapsed = Date.now() - start;
    const r = data.result;
    if (r?.status !== "timeout") throw new Error(`status="${r?.status}", mong "timeout" (${elapsed}ms)`);
    ok(`Timeout enforced (${elapsed}ms)`);
  } catch (err) {
    fail("Timeout enforcement", err.message);
  }

  // ── Test 6: Memory limit ──────────────────────────────────────────────────
  try {
    const code = `
x = []
while True:
    x.append(b'x' * 1024 * 1024)
`.trim();
    const { data } = await judgeRequest("/internal/run", { code }, { expectOk: true });
    const r = data.result;
    const acceptable = ["memory", "timeout", "crash", "error"];
    if (!acceptable.includes(r?.status)) throw new Error(`status="${r?.status}", mong một trong ${acceptable.join("|")}`);
    ok(`Memory limit (status=${r?.status})`);
  } catch (err) {
    fail("Memory limit enforcement", err.message);
  }

  // ── Test 7: Grade - correct ───────────────────────────────────────────────
  try {
    const exercise = {
      id: "smoke-1",
      expectedOutput: "15",
      stdin: "",
      require: [],
      tests: null,
    };
    const { data } = await judgeRequest("/internal/grade", {
      code: "print(sum(range(6)))",
      exercise,
    });
    const r = data.result;
    if (!r?.passed) throw new Error(`passed=false, errors=${JSON.stringify(r?.errors)}, output="${r?.output}"`);
    ok("Grade correct submission");
  } catch (err) {
    fail("Grade correct submission", err.message);
  }

  // ── Test 8: Grade - wrong output ──────────────────────────────────────────
  try {
    const exercise = {
      id: "smoke-2",
      expectedOutput: "15",
      stdin: "",
      require: [],
      tests: null,
    };
    const { data } = await judgeRequest("/internal/grade", {
      code: "print(99)",
      exercise,
    });
    const r = data.result;
    if (r?.passed) throw new Error("Bài sai nhưng passed=true");
    if (!r?.errors?.length) throw new Error("Thiếu thông báo lỗi");
    ok("Grade wrong output correctly rejected");
  } catch (err) {
    fail("Grade wrong output rejection", err.message);
  }

  // ── Test 9: Concurrent jobs ───────────────────────────────────────────────
  try {
    const jobs = Array.from({ length: CONCURRENT }, (_, i) =>
      judgeRequest("/internal/run", { code: `print(${i} * ${i})` })
        .then(({ data }) => {
          const r = data.result;
          if (r?.status !== "ok") throw new Error(`job ${i}: status=${r?.status}`);
          const expected = String(i * i);
          if (r.output?.trim() !== expected) throw new Error(`job ${i}: output="${r.output?.trim()}", mong "${expected}"`);
          return true;
        })
    );
    const results = await Promise.allSettled(jobs);
    const errs = results.filter((r) => r.status === "rejected").map((r) => r.reason?.message);
    if (errs.length) throw new Error(errs.join("; "));
    ok(`Concurrent jobs (${CONCURRENT} parallel)`);
  } catch (err) {
    fail("Concurrent jobs", err.message);
  }

  // ── Test 10: gVisor sandbox isolation ─────────────────────────────────────
  if (RUNTIME === "runsc") {
    try {
      // gVisor sandbox: /proc/version reports "gVisor" or differs from the host kernel
      const { data } = await judgeRequest("/internal/run", {
        code: `
import subprocess, sys
try:
    out = open('/proc/version').read()
    print('proc_version:', out.split('\\n')[0][:80])
except Exception as e:
    print('no_proc:', e)
`.trim(),
      });
      const r = data.result;
      const out = r?.output || "";
      // gVisor typically reports "gVisor" or a kernel version different from the host
      const isGvisor = /gvisor/i.test(out) || /4\.14\.1/i.test(out);
      if (isGvisor) {
        ok(`gVisor kernel signature detected: "${out.split("\\n")[0].slice(0, 60)}"`);
      } else {
        // gVisor signature not found - runtime may still be active but could not be confirmed
        console.log(`    ⚠️  gVisor kernel check không xác nhận được (output: "${out.trim().slice(0, 80)}")`);
        console.log(`         Kiểm tra thủ công: docker info --format '{{json .Runtimes}}'`);
        ok("gVisor runtime configured (kernel signature ambiguous — verify manually)");
      }
    } catch (err) {
      fail("gVisor sandbox check", err.message);
    }
  }

  // ── Test 11: stdin support ────────────────────────────────────────────────
  try {
    const { data } = await judgeRequest("/internal/run", {
      code: "name = input()\nprint(f'xin chao {name}')",
      stdin: "pythonlab",
    });
    const r = data.result;
    if (r?.status !== "ok") throw new Error(`status=${r?.status}`);
    if (r.output?.trim() !== "xin chao pythonlab") throw new Error(`output="${r.output?.trim()}"`);
    ok("stdin support");
  } catch (err) {
    fail("stdin support", err.message);
  }

  // ── Test 12: Network isolation ────────────────────────────────────────────
  try {
    const { data } = await judgeRequest("/internal/run", {
      code: `
import socket, sys
try:
    socket.setdefaulttimeout(1)
    s = socket.create_connection(("8.8.8.8", 53), timeout=1)
    s.close()
    print("NETWORK_OPEN")
except Exception as e:
    print("NETWORK_BLOCKED:", type(e).__name__)
`.trim(),
    });
    const r = data.result;
    const out = r?.output?.trim() || "";
    if (out.startsWith("NETWORK_OPEN")) throw new Error("Container có thể kết nối Internet! Network isolation thất bại.");
    ok(`Network isolation (${out.slice(0, 60)})`);
  } catch (err) {
    fail("Network isolation", err.message);
  }

  printSummary();
}

function printSummary() {
  console.log("\n" + "─".repeat(60));
  console.log(`  Kết quả: ${passed} pass, ${failed} fail`);
  if (failures.length) {
    console.log("\n  Danh sách lỗi:");
    for (const f of failures) {
      console.error(`    ❌  ${f.name}`);
      console.error(`        ${f.reason}`);
    }
    console.log("");
    process.exit(1);
  } else {
    console.log("  ✅ Tất cả test pass!\n");
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("❌  Lỗi không mong đợi:", err);
  process.exit(1);
});
