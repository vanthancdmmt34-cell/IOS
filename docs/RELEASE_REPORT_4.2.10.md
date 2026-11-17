# PythonLab 4.2.10 — Footer legal links and centered statistics

## Changes
- Moved the community statistics block (visits and learner rating) into the footer, immediately after the legal/policy navigation links (including Terms).
- Centered the statistics heading and both compact statistic cards.
- Moved the version label below the statistics, at the bottom of the footer.
- Kept the contact/social section above the footer and preserved Facebook, Zalo, Threads links and their configuration.
- No database schema, API, or environment changes.

## Verification
- `node --check public/js/landing.js`: passed.
- `node --check server.js`: passed.
- Focused tests: `node --test tests/homepage-stats.test.js tests/contact-landing.test.js` — 13 passed, 0 failed.
- Full suite: 179 tests; 137 passed, 39 failed, 3 skipped. The full suite is not clean; failures include pre-existing account/AI/migration/commerce/entitlement areas. This release only changes landing-page markup/CSS and the version constant. Do not treat this as a production-readiness certification.
- ZIP integrity checked after packaging.

## Deployment
No migration required. Back up `data/` and `.env`; preserve both when replacing application files and restart the Node service.
