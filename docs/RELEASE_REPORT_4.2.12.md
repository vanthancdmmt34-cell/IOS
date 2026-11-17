# PythonLab 4.2.12 — Version Line Inline with Footer Statistics

## Changes
- Placed the "Phiên bản" (Version) label on the same row as the "Lượt truy cập · Người đăng ký" (Visits · Registered Users) line.
- The version text is bolded and right-aligned to the edge of the footer container.
- The statistics line remains centered on desktop; on mobile, statistics align left and the version aligns right on the same row to prevent text overlap.
- No changes to APIs, counter logic, the Contact section, or Terms/Privacy links.

## Testing
- JavaScript syntax check: `node --check server.js`, `node --check public/js/landing.js`.
- Footer tests: `node --test tests/homepage-stats.test.js`.
- Verified desktop and mobile CSS structure via static tests.
- Verified ZIP integrity after packaging.
- Visual browser testing was not available in this environment; verify desktop and mobile viewports on staging prior to production release.

## Deployment
- No database migration required. Keep `.env` and the `data/` directory intact, replace source files, and restart the application.
