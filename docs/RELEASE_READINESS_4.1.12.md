# Release Readiness – PythonLab 4.1.12

**Status: STAGING READY, PRODUCTION NOT YET VERIFIED.**

Passed checks: ZIP integrity; 98 JavaScript files with zero syntax errors; 25/25 API and learning path tests; smoke startup on a fresh database; migrations 018/020; upgrade from a 4.1.11 database preserving user accounts with pre-migration backup.

Not yet declared production-ready because: the full test suite still has 38 pre-existing failures (all present in 4.1.11), Playwright E2E tests could not be run, Docker and the Python runner image are unavailable in the test environment, and live credentials are not configured to verify Gemini, SePay, VPS, Nginx, or HTTPS.

## Pre-Public Checklist

- [ ] Reconcile or fix the 38 pre-existing test failures, or update the tests after verifying alignment with the current API contract.
- [ ] Run the full desktop and mobile E2E suite using Playwright on Chromium.
- [ ] Run the real Python sandbox using the `pylab-python:3.12` Docker image; confirm `/api/health` returns `runner.engine = python-docker`.
- [ ] Set `ADMIN_USERNAME`, and create and verify the admin account before opening public registration.
- [ ] Configure the HTTPS domain, `PUBLIC_URL`, Nginx, and PM2; verify Secure cookies over HTTPS.
- [ ] Test live Gemini integration, AI budget limits, and inline AI within exercises.
- [ ] Test live payment and webhook flows if SePay is enabled.
- [ ] Back up data and rehearse rollback; complete UAT across admin, teacher, and student roles.

Do not delete `data/` or `.env` during upgrades. Do not allow staging environments to overwrite production data.
