# PythonLab 4.4.0 – Standalone Judge Service

## Changes
- Added `judge-service.js`: a dedicated internal HTTP process for code execution and grading tasks.
- The Backend can delegate `runCode` and `gradeCode` to the Judge Service via `JUDGE_SERVICE_URL`.
- Includes Bearer token authentication, request size limits, code length validation, client-side timeouts, and `no-store` response headers.
- The health endpoint `GET /health` returns only service/runner status and never exposes tokens.
- When `JUDGE_SERVICE_URL` is not configured, the existing local execution path is preserved for backward compatibility.

## Running as a Separate Process
1. Build the sandbox image: `docker build -t pylab-python:3.12 runner/`.
2. Generate a random token of at least 32 characters. Use the same token in both processes.
3. Start the Judge Service: `JUDGE_SERVICE_TOKEN='...' JUDGE_HOST=127.0.0.1 JUDGE_PORT=4101 RUNNER=docker npm run start:judge`.
4. Configure `JUDGE_SERVICE_URL=http://127.0.0.1:4101` and `JUDGE_SERVICE_TOKEN='...'` in the Backend process and restart it.
5. Verify `GET http://127.0.0.1:4101/health` and the Backend's `/api/health`.

Sample configuration files are available at `.env.judge.example` and `deploy/pythonlab-judge.service.example` (systemd unit).

## Security & Operations Notes
- Bind the Judge Service only to loopback or a private network; never expose port 4101 to the public Internet.
- The token must match between Backend and Judge, be kept secret, and differ across environments. Never commit real `.env` files.
- The Judge Service still requires Docker Engine and permission to invoke Docker in order to run the real Python sandbox. Do not mount the Docker socket into the Backend container/process; grant Docker access only to the Judge process on its dedicated host.
- The Docker sandbox restricts network, filesystem, user, capabilities, PIDs, RAM, CPU, ulimits, and execution time. This does not provide VM-level isolation; consider gVisor or Kata Containers for multi-tenant or high-risk environments.
- If the Judge Service becomes unreachable, requests fail closed with a clear error rather than silently falling back to executing code inside the Backend web process.

## Out of Scope in 4.4.0
- Distributed Redis/BullMQ queues, cross-instance idempotency, and pre-warmed worker pools are not enabled in this version.
- SQLite is not automatically migrated to PostgreSQL. Migration, backup/restore tooling, and rehearsal on a data copy are required before switching production databases.
- The Docker sandbox must be tested on the target deployment VPS (with the Docker daemon and Python image installed). Because the current build environment lacks Docker, live Docker sandbox tests are skipped.
