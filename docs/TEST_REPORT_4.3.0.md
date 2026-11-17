# Test report – PythonLab 4.3.0

Run environment: Node.js v22.16.0, Linux container, Docker Python image unavailable.

- Total tests: 180
- Passed: 138
- Failed: 39
- Skipped: 3 (Docker runner/security tests require Docker and `pylab-python:3.12`)

The 4.2.13 baseline recorded 137 passed, 39 failed and 3 skipped. The 4.3.0 migration test adds one passing test; aggregate failure and skip counts are unchanged. The existing 39 failures remain release blockers and must be triaged before production rollout. This run does not establish Docker sandbox security because Docker is unavailable in this environment.

Additional checks:
- `node --check server.js` – passed.
- `node --check db/migrations.js` – passed.
- `node --check runner/py-runner.js` – passed.
- New migration smoke test – passed; verified progress tables, legacy backfill and metadata columns.
- ZIP integrity (`unzip -t`) – passed.
