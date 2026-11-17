# PythonLab 4.1.12 Test and Release Readiness Report

Test date: 2026-11-01. Test environment: Node.js 22.16.0, Linux container.

## Release Conclusion

**Not yet ready for 100% public production sign-off.** The new build passed server startup, core API, learning path, fresh installation migration, and 4.1.11 database upgrade checks. However, the full project test suite still has 38 failing tests carried over from 4.1.11; the test environment lacks Docker and Playwright; and live Gemini keys, payment credentials, and a production VPS/domain were not available to verify external integrations.

The build can be deployed to **staging** for UAT once environment variables are configured. Only open to the public after all items under "Required VPS Verification Before Public Launch" are completed.

## Executed Test Results

| Category | Result |
|---|---|
| ZIP archive integrity check | Passed, no compression errors |
| `node --check` across all JS/MJS/CJS files | 100/100 passed |
| API + learning path + inline AI + migration tests (`api.test.js`, `learning.test.js`, `learning-api.test.js`, `ai-inline-release.test.js`, `migration-release.test.js`) | 27/27 passed |
| Full test suite on 4.1.12 | 151 total: 110 passed, 38 failed, 3 skipped |
| Full test suite on 4.1.11 (baseline comparison) | 143 total: 102 passed, 38 failed, 3 skipped |
| Server startup with an empty database | Passed; `/`, `/api/public/config`, `/api/stats` return HTTP 200; `/api/health` reports `4.1.12` |
| Fresh database migrations | Passed; migrations 018 and 020 create their respective tables and indexes |
| Database upgrade from 4.1.11 | Passed; existing accounts preserved; new migrations applied; pre-migration backup file created |
| Desktop/mobile browser E2E tests | Not run: Playwright is not installed |
| Real Python 3 sandbox execution | Not run: environment lacks Docker / Python runner image |
| Live Gemini / live SePay integration | Not tested: production API keys and integration accounts are unavailable |

## Comparison of the 38 Pre-existing Test Failures

The list of failing test names in 4.1.12 is identical to 4.1.11; no new test failures were introduced in this upgrade. Several failing tests assert outdated contracts—for example, expecting legacy migration IDs or expecting the AI endpoint to use a `teacher` parameter / HTTP 403, whereas current code uses `persona` and locks AI during exams with HTTP 423. Nevertheless, because those tests still fail, they are not counted as verified. Affected test groups include authorization/classrooms, AI, entitlements/payments, translations, and P0/grader checks.

Failing tests were not skipped or altered to manufacture a false green build.

## Fixes Applied During Release Verification

Moved migration `2026_11_01_020_ai_inline_penalty` back into the `MIGRATIONS` array; added regression tests for migration ordering/indexing and an integration test for inline AI using a mocked Gemini provider (annotates the exact line, does not create a chat thread, and blocks requests during active exams). Previously, this migration had been mistakenly placed inside the `applied` result variable, creating a risk that fresh installations would not create `ai_inline_uses` at startup. After the fix, fresh installations were verified to create `ai_inline_uses`, `idx_ai_inline_user`, and the learning path tables; upgrading from 4.1.11 preserved user data and created a pre-migration backup.

## Required VPS Verification Before Public Launch

1. Use Node.js 22 or newer; set `HOST=127.0.0.1`, match `PORT` with Nginx, configure a persistent `DATA_DIR`, and set `PUBLIC_URL` to the real HTTPS domain.
2. Ensure the administrator account is created securely. For a fresh installation, set `ADMIN_USERNAME` to the system owner's username and register that account before opening public registration; if unset, the first registered account will be granted `admin` privileges.
3. Install Docker Engine, build the `pylab-python:3.12` image from `runner/`, verify `python3 -c "print('ok')"` inside a container, and confirm the server reports `runner.engine = python-docker`. Do not treat the fallback JS interpreter as a full substitute for Python 3.
4. Install Playwright and Chromium in a dedicated test environment, run the desktop/mobile E2E suite, and resolve any failures before release.
5. Configure and verify `GEMINI_API_KEY`, the Gemini model name, and budget caps. Perform a live inline AI code annotation request and confirm the API key remains strictly server-side.
6. If automated payments are enabled, configure SePay and verify the webhook with a live test transaction; if not yet verified, keep manual payment confirmation enabled.
7. Back up `data/` and `.env`; test the upgrade on staging, verify admin/student/teacher login, exercise submission, grading, placement assessment, 7-day learning path, weekly review, and classroom reports before promoting to production.

**Verification scope limitation:** this audit did not have access to the production VPS/domain, `.env`, live Gemini/SePay credentials, or production database. Therefore, this report does not certify that the live deployment is ready for public launch.
