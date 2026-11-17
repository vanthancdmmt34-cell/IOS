# PythonLab 4.7.0 — Queue Metrics, Sandbox Runtime, and LMS Reliability

Source release date: 2026-11-02  
Baseline: PythonLab 4.6.1 / Judge Service 4.4.0 / BullMQ 4.5.0

## Implemented Scope

### Judge Queue and Monitoring
- Added a dedicated Prometheus exposition endpoint for the Judge Queue at `/internal/metrics`, protected by `JUDGE_METRICS_TOKEN` (Bearer token, minimum 24 characters).
- Exported metrics include job counts by state (`waiting`, `active`, `completed`, `failed`, `delayed`, `paused`), total backlog, queue pressure flag, and target concurrency.
- Metric cardinality is strictly bounded by job state; usernames, user IDs, job IDs, and exercise IDs are never exported as labels.
- Judge `/health` now returns `queuePressure`, and the queue health CLI warns on high backlog or failed jobs.

### Sandbox Runtime
- Added optional `RUNNER_RUNTIME` configuration to select a registered Docker runtime such as gVisor's `runsc`.
- The runner inspects both the container image and the requested runtime via the Docker daemon before reporting Docker as ready.
- Misconfigured or missing runtimes never silently fall back to the default runtime; a production Judge with `JUDGE_REQUIRE_DOCKER=true` refuses to start.
- The Backend no longer assumes a remote Judge is isolated without runtime verification; `isolated` is reported as `null` when only remote service reachability is known.

### LMS / Assignments
- The assignment creation API accepts both `refId` (current contract) and `exerciseId` (legacy payload compatibility).
- Added UTF-8 BOM CSV export alongside XLSX for assignment grade reports.
- Students can read only their own submissions; only teachers managing the classroom can view reports, grade submissions, or export data. Out-of-scope resources return HTTP 404.
- Updated tests to target `/api/classes/:id/report` and match the current student response contract.

### Code Quality
- Unified version across Backend and package metadata: `4.7.0`.
- Completed JavaScript syntax checks across all `.js` files in the project.
- Full test suite: **193 tests, 190 passed, 0 failed, 3 skipped**.

## Testing and Verification Scope

- Executed `node --test tests/*.test.js` on Node.js 22.16.0: 193 tests, 190 passed, 0 failed, 3 skipped.
- The 3 skipped tests cover live Python container execution, sandbox timeout/RAM/network enforcement, and containerized hidden tests because the build environment lacks a Docker daemon and the `pylab-python:3.12` image.
- Unit tests for gVisor runtime configuration and queue metrics generation passed.
- Unit tests for Redis URL parsing, auth/TLS options, and queue metrics passed.
- No live Redis daemon in the build environment: end-to-end BullMQ job flow, reconnection, stalled-job recovery, and retries against a live Redis instance remain to be verified on staging/VPS.
- No live Docker daemon in the build environment: container execution, `runsc`/Kata runtime behavior, and host-level security boundaries remain to be verified on a real host.

## Remaining Items Not Yet Completed

1. **PostgreSQL:** Not yet integrated. The Backend relies on synchronous `node:sqlite` and SQLite-specific SQL/PRAGMA statements; migrating requires refactoring the repository layer and translating queries/migrations rather than simply adding `DATABASE_URL`.
2. **Docker Pre-Warming:** Not yet implemented. Reusing stateful containers risks leaking files or processes across student submissions. A clean sandbox reset/namespace mechanism or immutable snapshot design is required before optimizing cold starts.
3. **Live gVisor/Kata Verification:** Runtime selection and daemon validation are implemented in code, but have not yet been installed and benchmarked on a production VPS.
4. **Full-Stack Monitoring:** Backend HTTP/process metrics and queue metrics are implemented; per-container CPU/RAM metrics, real-time AI spend tracking, alert rules, and pre-built dashboards are still pending.
5. **Product Retention:** Progress dashboards, submission history, weak-chapter detection, and 7-day study plans are in place; opt-in leaderboards, weekly goals/reminders, and career-track roadmaps are scheduled for a future product/UX cycle.
6. **Production Verification:** Live Redis/BullMQ queueing, Docker sandbox execution, backup restoration, and gVisor runtime must be smoke-tested on staging/VPS before opening to real student traffic.

## Deployment Recommendations

- Do not overwrite production directly before backing up and verifying the database.
- Install dependencies with `npm install`, build the runner image, and run the Judge API and Worker as separate processes.
- Keep `JUDGE_REQUIRE_DOCKER=true`; set `RUNNER_RUNTIME=runsc` only after verifying that the Docker daemon recognizes the runtime.
- Provision distinct secrets for `JUDGE_SERVICE_TOKEN`, `JUDGE_METRICS_TOKEN`, `METRICS_TOKEN`, and the Redis password; never use sample values in production.
- Review `docs/OPERATIONS_4.7.0.md` prior to deployment.
