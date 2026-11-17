# DEVELOPMENT_PROGRESS — Status at 3.0.0 Handover

## Completed
All 7 requested phases (see DEVELOPMENT_ROADMAP.md), SEO, legal pages, and documentation.

## Added / Modified Files (Compared to 2.3.1)
- Added: `runner/` (Dockerfile, harness.py, py-runner.js, py-errors.js, index.js), `db/migrations.js`, `modules/` (api.js, membership.js, ai.js, seo.js), `lessons.js`, `public/js/pro.js`, `public/js/admin-biz.js`, `public/css/public.css`, `tools/migrate.js`, `tools/check-content-python.mjs`, `tools/check-lessons-python.mjs`, `tests/commerce.test.js`, `tests/runner.test.js`, `tests/e2e/pro.e2e.mjs`, `docs/*`.
- Modified: `server.js` (mounts new modules, migrations, readRaw, CSP, sitemap, SEO pages, settings audit log, VERSION 3.0.0), `settings.js` (2 settings groups), `interpreter.js` (list repr, new required-token checks), `curriculum.js` (15 expected outputs, Chapter 36), `public/js/main.js`, `pages.js`, `admin.js`, `core.js`, `landing.js`, `public/css/app.css`, `tests/api.test.js`, `tests/content.test.js`, `ecosystem.config.example.cjs`.

## Executed Tests
See TEST_REPORT.md: 72/72 (Docker), 69/69 + 3 skipped (interpreter), e2e 23 + 35 + 35, content verification 522/522 and 50/50.

## Remaining Issues / Limitations
- Live SePay and live Gemini have not been tested yet (requires staging).
- Email delivery is not yet implemented (renewal reminders are in-app only).
- The `docker` group is root-equivalent on the VPS.
- Rate limiting is in-memory and single-process.
- Legal policies are templates requiring website owner review and approval.

## Useful Commands
```bash
npm test                                                     # run tests (auto-detected runner)
RUNNER_IMAGE=pylab-python:3.12 npm test                      # run tests with real Python
node tests/e2e/pro.e2e.mjs                                   # requires Playwright
node tools/migrate.js status|up|down <id>
docker build -t pylab-python:3.12 runner/
```
