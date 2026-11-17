# PythonLab 4.2.3 Release Report

## Changes
- Renamed the navigation tab label from "Hỗ trợ học tập" (Learning Support) to "Hỗ trợ" (Support).
- Updated the breadcrumb and quick search item (Ctrl+K) consistently to "Hỗ trợ" (Support).
- Added the `life-buoy` SVG icon definition in `public/js/core.js`; the icon was previously referenced by the navigation menu but missing from the icon registry, causing it not to render.
- Preserved the `#/ho-tro` route, scenario-based support features, AI quotas, and Pro/Free entitlements.

## Testing
- `node --check`: `public/js/core.js`, `public/js/main.js`, `public/js/pages.js`, and `server.js` all passed.
- Pro/API support tests: 4/4 passed.
- Education and progress tests: 11/11 passed.
- Total related test suites executed: 15/15 passed.
- No migrations added; no database schema or data changes.

## Deployment
Extract the new release and replace the frontend/server source files following the standard procedure. Keep `.env`, the `data/` directory, database files, and PM2 configuration intact. Restart the application to load version `4.2.3`. No database migration is required.
