# PythonLab 4.2.6 — Homepage Statistics

## Changes
- Moved visit count and user reviews out of the small footer text into two community statistics cards right below the main hero section.
- The visits card features an eye icon, a soft blue background, and a subtle count-up animation.
- The reviews card features a star icon, average rating out of 5, star fill color matching the average score, and total review count.
- When no reviews exist yet, displays a dash and the message "Chưa có đánh giá" (No reviews yet) instead of fabricating a score.
- Metrics are fetched from `/api/stats` and continue to respect the `showVisits` and `showReviews` settings.
- Responsive layout: two columns on desktop/tablet, stacked vertically on small mobile screens; respects `prefers-reduced-motion`.
- Updated server version to `4.2.6`; no database schema or API changes.

## Testing
- New homepage statistics tests: **4/4 passed**.
- Related progress and version tests: **4/4 passed**.
- JavaScript syntax check: **70/70 files passed**.
- Full test suite: **176 tests, 135 passed, 38 failed, 3 skipped**. The failure count remains unchanged from the 4.2.5 baseline (38 failures); all 4 new tests passed. Pre-existing failures belong to other test groups unrelated to the statistics UI update.
- Verified ZIP integrity; confirmed no `.env`, database files, API keys, or secrets are bundled.

## Deployment
- Back up `.env` and the `data/` directory before updating.
- Extract the new source files while preserving existing configuration and data, then restart the application.
- No database migration required.
