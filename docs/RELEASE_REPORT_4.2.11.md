# PythonLab 4.2.11 — Minimalist Footer Statistics

## UI Changes
- Removed separate statistics cards/blocks, the "CỘNG ĐỒNG PYTHONLAB" (PYTHONLAB COMMUNITY) heading, and the review score from the footer area.
- Displayed a single centered line in small text: "Lượt truy cập · Người đăng ký" (Visits · Registered Users), placed directly below the terms/policy link group and above the version line.
- Kept the Contact section (Facebook, Zalo, Threads) in its dedicated section above the footer.
- Eye and user icons are rendered as small inline icons with no card background, border, or shadow.
- The separator dot automatically hides when only one metric is enabled. Optimized for mobile and `prefers-reduced-motion`.

## Data
- Visits are read from the `site_stats.visits` counter.
- Registered users are counted from actual student accounts: `COUNT(*) FROM users WHERE role = 'student'`.
- `/api/stats` now additionally returns the `registered` field.
- Respects `showVisits` and `showStudentCount`.
- Student reviews/testimonials are not deleted; recent testimonials continue to render according to `showReviews`.

## Testing
- `node --check server.js` and `node --check public/js/landing.js`: passed.
- All JavaScript files in the repository: syntax check passed.
- `node --test tests/homepage-stats.test.js tests/progress-ui.test.js`: **9/9 passed**.
- Test server started cleanly; `/api/health` returned HTTP 200 and version `4.2.11`.
- `/api/stats` returned `registered: 0` on an empty database; after creating one admin and one student account, it returned `registered: 1`.
- Full test suite: **137 passed, 38 failed, 3 skipped**. Compared against 4.2.10, the exact same 38 baseline test names failed; zero new test regressions were introduced. Total test count decreased by 1 due to replacing the legacy card UI tests with inline metric line tests.
- Visual browser E2E tests were not run in this environment; desktop and mobile staging verification is still recommended before production deployment.

## Deployment
- No migrations or database schema changes.
- Back up `data/` and `.env`, replace source files, and restart the application while preserving existing data.
