# PythonLab 4.5.0 – BullMQ / Redis and idempotency

## Process diagram

```text
Browser
  -> PythonLab Backend (session, CSRF, rate limit, SQLite submissions)
  -> Judge API (internal HTTP + Bearer token)
  -> BullMQ Queue (Redis)
  -> Standalone Judge Worker
  -> Docker Python Sandbox
```

The Backend does not connect to Redis and does not need the Docker socket. The Judge API only accepts internal requests, verifies the token, then enqueues. Only the Judge Worker process executes/grades code; grant Docker access to the worker, not to the web Backend. The Runner in the worker reads its configuration from the process environment variables; it does not read the Runner configuration stored separately in the Backend database. If the Backend/Judge/Worker share one env file, the runner module automatically locks the remote path in the two Judge processes to avoid calling back into the Judge API.

## Installation

1. Use Node.js 22 or later. Install dependencies in the app directory: `npm install` (BullMQ is pinned to `6.5.3` in `package.json`).
2. Run Redis 6.2+ or a Redis-compatible service. You can use `docker compose -f docker-compose.redis.yml up -d`; set a strong `REDIS_PASSWORD` in the `.env` file and bind Redis only to localhost/a private network.
3. Configure `JUDGE_REDIS_URL=redis://:MAT_KHAU@127.0.0.1:6379/0` in the env of the Judge API and Judge Worker. For TLS use `rediss://`.
4. Configure the same `JUDGE_SERVICE_TOKEN` on the Backend and Judge API; the token must be at least 24 characters, ideally a random string of 32 bytes or more.
5. Build the sandbox: `docker build -t pylab-python:3.12 runner/`.
6. Set `RUNNER=docker`, `RUNNER_IMAGE=pylab-python:3.12`, `JUDGE_REQUIRE_DOCKER=true` in the Judge Worker env. By default the worker refuses to start if Docker/the image is not available; it does not silently fall back to the interpreter.
7. Start the Judge Worker: `npm run start:judge-worker`.
8. Start the Judge API: `npm run start:judge`.
9. Backend: set `JUDGE_SERVICE_URL=http://127.0.0.1:4101`, `JUDGE_SERVICE_TOKEN` identical to the Judge API, and `JUDGE_REQUEST_TIMEOUT_MS=60000`.
10. Check with `npm run health:judge-queue`. The Judge API health shows mode `bullmq` and the number of waiting/active/completed/failed/delayed jobs.
11. Enable the services at the OS/PM2 level using the templates in `deploy/`; make sure the Backend is not granted access to the Docker socket.

## Queue configuration

- `JUDGE_REDIS_URL` or `REDIS_URL`: enables BullMQ mode. If Redis is configured but Redis/BullMQ is not working, the Judge API aborts startup (fail-closed) instead of silently running code inside the API process.
- `JUDGE_QUEUE_NAME`: queue name, default `pythonlab-judge`.
- `JUDGE_QUEUE_PREFIX`: Redis namespace, default `pylab`.
- `JUDGE_QUEUE_WAIT_MS`: how long the Judge API waits for a result, default 55 seconds.
- `JUDGE_JOB_ATTEMPTS`: maximum 1–4 retries when the processor throws an infrastructure error; default 2, exponential backoff 500ms.
- `JUDGE_WORKER_CONCURRENCY`: number of jobs each worker process handles concurrently, default 2.
- `JUDGE_JOB_LOCK_MS`: BullMQ lock duration, default 60 seconds.
- `JUDGE_STALLED_INTERVAL_MS`: stalled-job check interval, default 30 seconds.

Submission errors such as SyntaxError, wrong output, or timeout/RAM limits from the runner are returned as normal grading results and are not retried indefinitely. Retries are for processor/infrastructure errors. Run multiple workers as multiple processes/hosts with the same queue name and Redis URL.

## Redis operations and security

- Redis must not be exposed to the public Internet. Use password/ACL, a firewall, and TLS when traversing untrusted networks.
- Set `maxmemory-policy noeviction`; enable AOF and back up Redis data. Do not use the client `keyPrefix` because BullMQ manages its own prefix.
- BullMQ uses Redis to store job state; Redis needs appropriate persistence. Do not delete the Redis volume while jobs are still pending.
- The Worker process is the only component that needs Docker access in this design. An account with Docker access is equivalent to host administrator access; place the worker on a separate machine/VM, run sandbox hardening, and consider gVisor/Kata.
- Code and exercise data are stored in Redis while in job state. Restrict read access to Redis and the job result retention time.
- The queue can be inspected via the Judge API `GET /health` endpoint; this endpoint does not reveal code contents or tokens.

## Submission idempotency

The `POST /api/exercises/:id/submit` API supports an `Idempotency-Key` header (8–100 characters, letters/digits/hyphens/underscores), scoped per student account. The same key with the same exercise/code returns the stored response without creating a new attempt. Reusing a key for different content returns HTTP 409. The key and request hash are stored in SQLite with a unique partial index. Existing submission records are not modified; the new column is added via a migration with a pre-migration backup under the current mechanism.

The frontend should generate one UUID per click of Submit and keep that UUID when retrying the same request; do not reuse the UUID for a new submission. If no key is sent, the API still works compatibly but cannot guarantee deduplication across client retries.

## Compatibility mode

If `JUDGE_REDIS_URL`/`REDIS_URL` is not set, the Judge API stays in the 4.4.0-compatible local mode. This mode has no durable queue and should only be used for development/testing or small deployments with a conscious understanding of its limits. Do not treat this mode as BullMQ.

## Testing

Run `npm test`. New tests cover the idempotency migration, same-key replay, and conflicts when the same key is used with different content. Real Redis/BullMQ testing requires a running Redis; the real Python sandbox requires Docker Engine and the `pylab-python:3.12` image on the actual deployment machine.

## Test status for 4.5.0

Detailed test reports: `TEST_REPORT_4.5.0.md` and `RELEASE_REPORT_4.5.0.md`. The key test group passed 23/23; the full suite has 39 pre-existing failures, identical to the 4.4.0 baseline. Live Redis/BullMQ was not tested in the packaging environment because the npm registry did not resolve via DNS and there was no Redis daemon; run a smoke test following the steps above on the VPS before enabling production.
