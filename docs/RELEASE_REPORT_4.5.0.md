# PythonLab 4.5.0 – Release Report

Package date: 2026-11-02.

## Upgrade Scope

- Added optional BullMQ/Redis queueing for the Judge API, running the Judge Worker as a separate process.
- Judge API enqueues `run`/`grade` jobs and awaits results via `QueueEvents`; the Worker processes jobs with bounded concurrency and graceful shutdown.
- Misconfigured or unavailable Redis when queueing is enabled causes the Judge API to fail closed rather than silently falling back to local code execution.
- The Worker requires the Docker runner by default and refuses to start if the runner falls back to the host interpreter.
- The submission API supports `Idempotency-Key`, hashes request payloads, and stores responses for replay; reusing the same key with different code returns HTTP 409.
- Database migration adds `idempotency_key`, `request_hash`, and `response_json` columns along with a per-user unique partial index while preserving existing submissions.
- The frontend retains the idempotency key when retrying the same request and generates a fresh key for new submissions.

## Test Results

| Scope | 4.4.0 Baseline | 4.5.0 |
|---|---:|---:|
| Total tests | 180 | 183 |
| Passed | 138 | 141 |
| Failed | 39 | 39 |
| Skipped | 3 | 3 |

- New and related focused test suites: **23/23 passed**.
- Node.js syntax check (`node --check`) across Backend, Runner, Judge API, Worker, migrations, health tool, and frontend JavaScript: passed.
- The 39 failing tests in 4.5.0 match the exact 39 failures from the 4.4.0 baseline; this upgrade introduced zero new test failures. Baseline failures currently reside in permissions/classrooms, i18n, AI, payments/entitlements, rubrics, and progress UI.
- 3 Docker tests were skipped because the packaging environment does not have Docker Engine or the Python runner image installed.

## Verification Limitations in the Packaging Environment

- `bullmq` could not be installed from npm in this environment due to DNS resolution failure against `registry.npmjs.org` (`EAI_AGAIN`). Consequently, **live end-to-end Redis/BullMQ execution could not be run** during this packaging session. `bullmq` is pinned to `6.5.3` in `package.json`; run `npm install` on an Internet-connected deployment host.
- Neither Redis nor the Docker daemon is available in the packaging environment. Perform a Redis queue smoke test and verify Python Docker sandbox execution on the VPS before opening public code submissions.
- The full test suite still has 39 baseline failures. Version 4.5.0 should not be considered to have passed the full regression suite or be production-ready solely on the basis of the new test group.

## Prerequisites for Enabling the Queue on a VPS

1. Install dependencies with `npm install`.
2. Run a private Redis instance with a strong password, AOF persistence enabled, and `maxmemory-policy noeviction`.
3. Configure identical `JUDGE_REDIS_URL`, `JUDGE_QUEUE_NAME`, and `JUDGE_QUEUE_PREFIX` values for both the Judge API and Worker.
4. Configure a matching `JUDGE_SERVICE_TOKEN` on both the Backend and Judge API.
5. Build the `pylab-python:3.12` image and configure the Worker with `RUNNER=docker` and `JUDGE_REQUIRE_DOCKER=true`.
6. Start the Judge Worker, then the Judge API, then the Backend; verify `GET /health` and `npm run health:judge-queue`.
7. Test submitting an exercise, retrying with the same `Idempotency-Key`, reusing the key with modified code, and confirming SQLite records only a single submission.

See detailed procedures in [`JUDGE_QUEUE_4.5.0.md`](./JUDGE_QUEUE_4.5.0.md).
