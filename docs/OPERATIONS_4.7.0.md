# PythonLab 4.7.0 Operations Guide

## 1. Database Verification and SQLite Backup

Run from the application directory as the same user that owns the `data` directory:

```bash
npm run db:check
npm run db:checkpoint
npm run db:backup
```

Backups are stored in `data/backups/` by default with file permissions `0600` and retained for 14 days. You can customize `BACKUP_DIR` and `BACKUP_RETENTION_DAYS`. The tool uses `VACUUM INTO` followed by `PRAGMA quick_check` verification; corrupted backups are automatically deleted.

To restore: enable maintenance mode, stop the Backend and all database writer processes, make a separate backup of the current `data` directory, replace `app.db` with a verified backup while preserving `secret.key` and the `uploads` directory, then restart the service and check `/api/health`. Never overwrite the database while any process is running.

## 2. Judge API, Worker, and Redis

In production, separate the Backend, Judge API, and Judge Worker into distinct processes. The Backend does not need access to the Docker socket; only the Judge Worker requires permission to invoke Docker. Use `.env.judge.example` as an environment template, but generate unique tokens and passwords on the production server.

```bash
# Redis
 docker compose -f docker-compose.redis.yml up -d

# Build runner image
 docker build -t pylab-python:3.12 runner/

# Start Judge API and Worker via systemd/PM2
npm run start:judge
npm run start:judge-worker
```

Configure `JUDGE_SERVICE_URL`, `JUDGE_SERVICE_TOKEN`, `JUDGE_REDIS_URL`, `JUDGE_REQUIRE_DOCKER=true`, and `RUNNER=docker`. Redis should run on a private network with password authentication, AOF persistence, and `maxmemory-policy noeviction`; never expose the Redis port to the public Internet. Monitor `/health` on loopback and run `npm run health:judge-queue`.

Redis/BullMQ will not fall back to the local runner when Redis is configured but unavailable; the Judge API stops fail-closed.

## 3. Docker Sandbox and gVisor

Each execution creates an isolated Docker container with networking disabled, a read-only root filesystem, an unprivileged user, dropped capabilities, `no-new-privileges`, default seccomp profile, PID/CPU/RAM/ulimit/output/time limits, and a dedicated tmpfs. Running containers are never shared across students.

To enable gVisor, install `runsc` and register the runtime with Docker first, then verify:

```bash
docker info --format '{{json .Runtimes}}'
```

Next, set `RUNNER_RUNTIME=runsc` for both the Judge API and Worker. The application verifies that the runtime is registered in the Docker daemon; if it is missing or invalid, the Docker runner is treated as unavailable and the production Judge refuses to start. Do not set this variable before the runtime is installed and verified.

Kata Containers can also be used if the corresponding runtime is registered in the Docker daemon, but must be tested separately on target infrastructure. This build has not been verified with live gVisor/Kata execution.

## 4. Prometheus Metrics

### Backend

Set `METRICS_TOKEN` to at least 24 characters and scrape:

```bash
curl -H 'Authorization: Bearer <METRICS_TOKEN>' http://127.0.0.1:8082/internal/metrics
```

Metrics include request count, latency histogram, inflight requests, uptime, RSS, heap usage, and event-loop lag. Route cardinality is bounded; user IDs and query strings are never exported.

### Judge Queue

Set `JUDGE_METRICS_TOKEN` to at least 24 characters and scrape:

```bash
curl -H 'Authorization: Bearer <JUDGE_METRICS_TOKEN>' http://127.0.0.1:4101/internal/metrics
```

Queue metrics include waiting, active, completed, failed, delayed, paused, backlog warning status, and target concurrency. The default backlog warning threshold is 100 jobs and can be overridden via `JUDGE_QUEUE_WARN_WAITING`. Metrics endpoints must only be bound to loopback or a private network; never expose them to the public Internet.

## 5. Pre-Production Verification Checklist

- Run `npm test` and `npm run db:check`.
- On a staging host with Docker: run a passing solution, a syntax error, a runtime timeout, a memory limit test, an output limit test, and multiple concurrent jobs.
- On a staging host with Redis: verify Redis reconnection, retry/backoff, stalled job recovery, job deduplication, and queue saturation behavior.
- If using gVisor/Kata: check `docker info`, run the sandbox test suite under that runtime, and benchmark performance before rolling out to all learners.
- Perform periodic restore rehearsals from backups; creating a backup file successfully does not replace verifying the full recovery procedure.
- Configure dashboards and alerts for queue backlog, failed jobs, worker offline status, Redis unavailability, request latency, CPU/RAM usage, and AI budget consumption.

## 6. Known Limitations

- PostgreSQL is not yet integrated. The Backend still relies on synchronous `node:sqlite` and SQLite-specific queries/PRAGMAs across multiple modules; an asynchronous repository/API refactor is required before migrating database engines.
- Docker container pre-warm pooling is not enabled. Creating a fresh container per execution provides stronger isolation guarantees; shared containers must not be used without reliable filesystem and process namespace reset.
- Metrics cover Backend HTTP/process health and the Judge queue, but do not yet include per-container CPU/RAM metrics, real-time AI cost telemetry, or pre-packaged alert rules/dashboards.
- Redis/BullMQ and gVisor require live smoke testing on staging/VPS; the build environment does not have a daemon available for end-to-end verification.
- Opt-in leaderboards, weekly goals/reminders, and the full career track system still require a dedicated product/UX iteration.
