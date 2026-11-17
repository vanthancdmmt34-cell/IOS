# PythonLab 4.3.0 – Data foundation and runner hardening

## Included
- New normalized progress/streak/activity tables.
- Backfill of existing exercise submission history into `exercise_progress`.
- Submission attempt numbering + persistence serialized in a short SQLite write transaction.
- Docker sandbox hardening: explicit default seccomp, private IPC, no core dumps and hardened tmpfs.
- Architecture 2.0 rollout and migration guide.

## Existing capabilities retained
- Guest demo is already public and rate-limited; no login is required to run a short demo.
- Existing course progress dashboard and leaderboard remain in place.
- Existing Docker runner queue remains bounded and in-process.

## Not included / not yet production-ready
- Redis/BullMQ durable queue.
- Independently deployed Judge Service and worker process.
- Reusable pre-warmed container pool.
- PostgreSQL migration.
- New onboarding funnel analytics and full goal-based learning-path UI.

These require coordinated API, frontend, deployment and infrastructure changes. They are documented as the next rollout stage rather than represented as completed functionality.

## Test note
Run `npm test` on the deployment build. The source baseline currently contains unrelated failing tests; compare failures against the 4.2.13 baseline before release. Docker sandbox tests are skipped when Docker/image `pylab-python:3.12` is unavailable. Do not deploy public arbitrary-code execution with the interpreter fallback as if it were a security sandbox.
