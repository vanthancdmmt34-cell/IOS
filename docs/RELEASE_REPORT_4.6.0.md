# PythonLab 4.6.0 — Rubrics, Observability, and SQLite Operations

Release date: 2026-11-02  
Baseline: PythonLab 4.5.0 — BullMQ & Idempotency

## Implemented Scope

### Judge and Code Execution Safety
- In production mode, the Judge Service now refuses to start by default if Docker and the Python runner image are not ready (`JUDGE_REQUIRE_DOCKER=true`). This eliminates scenarios where the Judge Service silently falls back to the host interpreter while being relied upon as a sandbox boundary.
- The BullMQ Worker continues to verify Docker readiness before accepting jobs.
- The Health API accurately reports `isolated=false` when the Backend uses the compatibility interpreter. Worker threads protect the event loop from blocking but do not provide an OS security boundary.
- The grading engine detects additional cases where input variables are replaced with hardcoded constants in expressions, while still allowing valid conditional classification branches.

### LMS / Assessment
- Completed the criterion-based rubric schema for assignments: criteria, maximum points, ordering, per-criterion scores, feedback comments, grader ID, and grading timestamp.
- APIs allow teachers to create rubrics, students to view criteria, and teachers to grade individual items; total score is computed server-side and requires all criteria to be graded.
- Teacher reports display rubric status, total score, and criterion breakdown; students can access only their own rubric results.
- Added default topic-based learning objectives for any chapter with fewer than 2 objectives while preserving custom-authored objectives where present.
- Preserved the `classes` view alias for backward compatibility with legacy schema names; `classrooms` remains the primary runtime table.

### System Observability and Maintenance
- Added `/internal/metrics` exporting Prometheus text format: request counters, latency histograms, inflight requests, uptime, RSS, heap usage, and event-loop lag.
- Metrics require a Bearer token of at least 24 characters; the endpoint returns 404 when unconfigured and 401 when presented with an invalid token.
- Normalized route labels and capped time-series count to prevent unbounded cardinality growth.
- Client-aborted requests prior to completion are recorded with status 499 and properly decrement the inflight gauge.
- Added SQLite maintenance commands: `check`, `checkpoint`, and `backup`. Backups use `VACUUM INTO`, verify integrity via `quick_check`, enforce `0600` file permissions, and rotate archives according to retention settings.
- Added sample systemd service and timer units for automated daily backups.

## Explicitly Out of Scope / Not Yet Completed
- PostgreSQL is not yet integrated. The Backend currently uses synchronous `node:sqlite` and SQLite-specific SQL/PRAGMA statements across multiple modules; switching databases cannot be done merely by setting `DATABASE_URL` and requires a phased repository abstraction and migration effort.
- Pre-warmed Docker containers are not implemented; the runner still creates a fresh container per execution.
- gVisor and Kata Containers have not been configured or tested.
- Current metrics cover Backend HTTP and process metrics only. BullMQ queue depth, worker saturation, AI budget burn, container CPU/memory usage, and alert rules are not yet consolidated into a unified dashboard.
- End-to-end Redis/BullMQ queueing and the Docker sandbox must be smoke-tested on a VPS with live Redis and Docker daemons.
- Existing learning dashboard flows, streaks, leaderboards, and career paths require a dedicated UX/product iteration; this release does not claim completion of the full learner-retention roadmap.

## Key Configuration Settings
- `JUDGE_REQUIRE_DOCKER=true` is the safe default for the Judge Service and Worker; set it to `false` only in isolated development environments when intentionally accepting host interpreter fallback.
- `METRICS_TOKEN` must be a random secret of at least 24 characters.
- `BACKUP_DIR` and `BACKUP_RETENTION_DAYS` can be configured in the systemd or PM2 environment.

See also `OPERATIONS_4.6.0.md` and `TEST_REPORT_4.6.0.md`.
