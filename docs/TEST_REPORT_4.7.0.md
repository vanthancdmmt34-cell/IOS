# PythonLab 4.7.0 Test Report

Run Date: 02/11/2026  
Runtime: Node.js 22.16.0, Linux build container.

## Full Test Suite

Command:

```bash
node --test tests/*.test.js
```

Final result: **193 tests — 190 pass, 0 fail, 3 skip** (exit code 0).

The three skipped tests:
- Real Python execution: floats, `class`, `try/except`, standard library, and `input()`.
- Sandbox isolation: network disabled, read-only filesystem, loop/RAM/output limits.
- Docker-based grading and hidden tests.

All three require a running Docker daemon and the `pylab-python:3.12` image, neither of which is available in the build container.

## Focused Verification

- LMS Assignments: class creation, student/teacher authorization, built-in exercise alias `exerciseId`, auto-grading, manual grading, targeted member-group assignments, class reports, CSV/XLSX export, and blocking exports from student accounts.
- Judge Queue: Redis URL parsing, username/password, TLS, database index, and fail-closed behavior on invalid URLs.
- Queue Metrics: counts by state, backlog, pressure threshold, target concurrency, and fixed label cardinality.
- Docker Runtime: valid `runsc`/runtime flags are passed through as CLI arguments; invalid runtime strings are rejected.
- Runner Status: a remote Judge is not marked `isolated=true` until the Backend has verified health and runtime status from the remote service.
- Progress UI: progress/activity/learning-state payloads, empty states, mobile layout, and version checks.

## Syntax Check

Ran `node --check` across all `.js` files in the project (excluding `node_modules`): zero syntax errors found.

## Unverifiable in the Build Environment

- BullMQ + Redis end-to-end execution, reconnection, retries, stalled job recovery, and queue saturation.
- Live Docker sandbox runtime and CPU/RAM/PID/network isolation enforcement.
- Live gVisor/Kata runtime execution.
- Multi-worker concurrent load benchmarking.
- PostgreSQL migration and restore rehearsal.

The items above require a staging/VPS environment equipped with Redis, Docker, and (if used) gVisor/Kata. Unit tests for queue metrics and runtime argument parsing must not be treated as a substitute for live infrastructure testing.
