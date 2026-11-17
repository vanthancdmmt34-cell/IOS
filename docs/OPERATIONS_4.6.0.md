# PythonLab 4.6.0 Operations Guide

## 1. Database Verification

Run from the application directory as the same user that owns the `data` directory:

```bash
npm run db:check
npm run db:checkpoint
```

`db:check` runs `PRAGMA quick_check`. `db:checkpoint` instructs SQLite to checkpoint the WAL in `PASSIVE` mode; if concurrent writers are active, inspect the returned output before evaluating completion.

## 2. Creating and Verifying Backups

```bash
npm run db:backup
```

By default, backup files are stored in `data/backups/` with permissions `0600` and retained for 14 days. You can customize these settings:

```bash
BACKUP_DIR=/var/backups/pythonlab BACKUP_RETENTION_DAYS=30 npm run db:backup
```

The script uses `VACUUM INTO` to create a consistent snapshot, then opens the snapshot in read-only mode and runs `quick_check`. Corrupted backups are deleted automatically.

To restore: put the application into maintenance mode, stop the Backend and any database writer processes, make a separate backup of the current `data` directory, replace `app.db` with the verified backup file while preserving `secret.key` and uploaded files, then restart the server and check `/api/health`. Never overwrite the database while any process is running.

## 3. Configuring Metrics

Add the following to the Backend environment:

```bash
METRICS_TOKEN=REPLACE_WITH_RANDOM_STRING_AT_LEAST_32_CHARS
```

Scrape the internal endpoint:

```bash
curl -H 'Authorization: Bearer <METRICS_TOKEN>' http://127.0.0.1:8082/internal/metrics
```

Do not expose this endpoint directly to the public Internet. Restrict scraping to localhost or a private network. Exported metrics include request count, latency histogram, inflight requests, uptime, RSS, heap usage, and event-loop lag. Metrics do not include URL query strings or specific user IDs.

## 4. Automated Backups with systemd

Copy `deploy/pythonlab-db-backup.service.example` and `deploy/pythonlab-db-backup.timer.example` into `/etc/systemd/system/`, adjust `User`, `Group`, `WorkingDirectory`, `EnvironmentFile`, and `ReadWritePaths` to match your server, and run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now pythonlab-db-backup.timer
sudo systemctl list-timers pythonlab-db-backup.timer
sudo systemctl start pythonlab-db-backup.service
sudo journalctl -u pythonlab-db-backup.service -n 100 --no-pager
```

Ensure the service user has write permissions to `data/backups` (or `BACKUP_DIR`).

## 5. Secure Judge Service

In production, set `JUDGE_REQUIRE_DOCKER=true` and `RUNNER=docker`, build the runner image from `runner/Dockerfile`, and run the Judge API and Worker as separate processes. If Docker or the runner image is unavailable, the Judge process refuses to start. Never set `JUDGE_REQUIRE_DOCKER=false` in an environment that executes untrusted code.

Redis/BullMQ must run on a private network with authentication enabled, appropriate AOF persistence, and `maxmemory-policy=noeviction`; never expose the Redis port to the public Internet. The Backend does not need access to the Docker socket; only the Judge Worker requires permission to control Docker.

## 6. Remaining Checks Required on VPS

- Verify `docker info` and `docker image inspect pylab-python:3.12`, and run at least one passing submission, one runtime error, one timeout, and one parallel job batch.
- Verify Redis reconnection, stalled job recovery, retries, and queue saturation handling.
- Test starting the Judge Service with `JUDGE_REQUIRE_DOCKER=true` and confirm that no fallback interpreter is used.
- Perform a restore rehearsal from a backup into a staging environment; a successfully created backup file is not a substitute for periodic recovery testing.
- Configure Prometheus/Grafana/alerting in your operations stack; this release provides the exposition endpoint only.

## 7. Dedicated Judge Queue Metrics

Set `JUDGE_METRICS_TOKEN` (a random string of at least 24 characters) in the Judge API environment. Prometheus scrapes `http://127.0.0.1:4101/internal/metrics` with the header `Authorization: Bearer <JUDGE_METRICS_TOKEN>`. The endpoint exports only job counts by state, total waiting + delayed jobs, backlog warning status, and target concurrency; it never exports exercise IDs, user IDs, or job IDs. Set `JUDGE_QUEUE_WARN_WAITING` to adjust the warning threshold (default 100). Never expose this endpoint to the public Internet.
