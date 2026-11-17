# Test report – PythonLab 4.5.0

## Focused tests

Command:

```bash
node --test tests/api.test.js tests/architecture-2.test.js tests/judge-queue.test.js
```

Result: **23 passed, 0 failed**. Includes idempotent replay, conflict on reused key with changed payload, migration columns/index, and Redis URL parsing/TLS options.

## Full suite comparison

| Build | Tests | Pass | Fail | Skipped |
|---|---:|---:|---:|---:|
| 4.4.0 baseline | 180 | 138 | 39 | 3 |
| 4.5.0 | 183 | 141 | 39 | 3 |

The 39 failing test names are identical between both runs. Three tests were added for the Redis queue configuration and all pass. Three Docker-specific tests are skipped when Docker/image is unavailable.

## What is not verified here

- Live Redis connection, BullMQ job persistence/recovery and multi-worker distribution (npm install was blocked by DNS `EAI_AGAIN`; no Redis service is available).
- Docker sandbox runtime and resource limits (no Docker daemon/image in the build environment).
- Full regression pass: 39 existing unrelated failures remain and need separate remediation.
