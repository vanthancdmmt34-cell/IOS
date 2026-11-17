# PythonLab Architecture 2.0 – implementation and rollout

## What is already present in 4.2.13
- Node.js modular-monolith API and browser frontend.
- SQLite WAL, `busy_timeout=8000`, foreign keys and `synchronous=NORMAL`.
- `submissions` records graded attempts; `lesson_progress` and learning-plan tables already exist.
- Runner abstraction with an in-process worker-thread pool for the JS interpreter.
- Docker runner with a bounded in-process queue, CPU/RAM/PID/ulimit limits, no network, read-only root filesystem, non-root user, dropped capabilities and timeout.
- Public guest demo endpoint `/api/demo/run`, already rate-limited by client IP and limited to 5,000 code characters.

## Changes included in 4.3.0
- Added migration `2026_11_01_030_learning_progress_and_judge_metadata`.
- Added `exercise_progress`, `user_progress`, `user_streaks` and `learning_activities` tables with indexes and foreign keys.
- Backfilled `exercise_progress` from existing `submissions`; no existing submission rows are deleted.
- Added optional judge metadata columns to `submissions` (`runtime_ms`, `memory_kb`, `queue_wait_ms`, `judge_version`).
- Exercise submission numbering and persistence are now enclosed in a short `BEGIN IMMEDIATE` transaction to avoid duplicate attempt numbers under concurrent submissions.
- Successful/failed submissions update exercise progress, course aggregate progress, activity history and daily streak in the same short transaction.
- Tightened Docker sandbox defaults with explicit default seccomp profile, private IPC, no core dumps and a hardened temporary filesystem.

## Target architecture (next rollout stage; not enabled by this release)
The current Docker runner still creates one container per execution and its queue is in-process. A process restart loses queued, not-yet-started jobs. This release does **not** claim Redis durability, a separate Judge Service, container pooling or pre-warming.

Target flow:

1. API validates user, exercise, CSRF, quota and idempotency key.
2. API creates a `submission_jobs` record and enqueues a job in Redis/BullMQ.
3. A separately supervised Judge Service consumes jobs and starts sandbox execution.
4. Worker persists status/result using idempotent updates keyed by `job_id`.
5. Browser polls a status endpoint or subscribes using SSE.

Recommended service boundaries:
- `web-api`: authentication, courses, users, LMS and public API.
- `judge-api`: private job intake/status interface; never exposes Docker socket to web-api.
- `judge-worker`: Redis consumer and sandbox supervisor.
- `redis`: durable queue with persistence and memory policy configured for queue workloads.
- `postgres`: long-term shared relational database when multiple API/Judge processes need concurrent writes.

## Production security requirements for Judge
- Prefer gVisor or Kata Containers for untrusted public code; Docker alone shares the host kernel.
- Do not mount the Docker socket into the web API container.
- Run the Judge worker under a dedicated OS account with minimal Docker permissions.
- Enforce CPU, memory, pids, file-size, open-file, wall-clock and output limits.
- Disable outbound network and deny access to host/internal metadata services.
- Never mount application secrets, database files, source tree or host directories into student sandboxes.
- Use a per-job scratch directory and destroy it after completion.
- Test timeout, memory exhaustion, fork bomb, output flood, path traversal and attempted network access before public rollout.

## Database rollout
1. Stop writes or put the app in maintenance mode.
2. Take a verified copy of `data/app.db` and its WAL state (prefer SQLite backup/VACUUM INTO, not copying only the main DB while active).
3. Deploy the new application; migration runner creates a pre-migration backup automatically when it detects existing users.
4. Verify `schema_migrations` contains the new migration ID.
5. Compare counts in `submissions` and `exercise_progress` and inspect sample user progress.
6. Keep the previous release and backup until rollback is confirmed.

SQLite WAL improves reader/writer coexistence but still permits only one writer at a time. Keep write transactions short; never hold a transaction while executing code, calling Gemini or waiting on a queue. Move to PostgreSQL before horizontally scaling API writers.

## Operational gates before enabling Redis/Judge split
- Redis queue persistence and restart recovery verified.
- Duplicate job delivery is safe (idempotent result writes).
- Worker crash and stalled-job recovery tested.
- API remains responsive while Judge is stopped or saturated.
- Load test at 10/30/50 concurrent users on the actual VPS; publish measured p50/p95 queue wait and execution latency.
- Verify production sandbox isolation on the actual kernel/runtime. Do not treat interpreter fallback as a secure sandbox for arbitrary public code.
