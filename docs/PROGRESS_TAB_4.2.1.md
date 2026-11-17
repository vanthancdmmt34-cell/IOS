# PythonLab 4.2.1 — Learning Progress Tab

## Objective
Redesign the **"Tiến độ học tập"** (Learning Progress) tab into a dedicated learning dashboard: helping students understand what they have learned, their recent practice cadence, skill assessment results, and which chapter to continue next.

## UI Changes

### Overview
- Overview card showing overall curriculum completion percentage and a continue-learning button.
- Four key metrics: passed exercises, completed/in-progress chapters, submission pass rate, and submitted assessments.
- 7-day bar chart comparing total practice submissions against passed submissions.
- Baseline (initial) and most recent skill assessment results; displays changes in percentage points without attaching an up/down trend indicator when scores are equal.
- Chapter-by-chapter progress map showing passed exercises, completion rate, and status.
- Shortlist of exercises that need reinforcement.

### Learning History
- Replaced the old horizontal table with a chronological submission list showing pass/retry status, score, chapter, attempt count, and timestamp.
- Includes an empty state with a direct link back to the curriculum.

### Improvement Suggestions
- Renamed the tab label from `"AI ngữ cảnh"` (Contextual AI) to `"Gợi ý cải thiện"` (Improvement Suggestions).
- Prioritizes attempted but unpassed exercises, with direct links to open each exercise.
- Displays 7-day study plan progress and an entry point to the skill assessment.

## Data & Compatibility
- No new database tables, migrations, or API endpoints added.
- Uses existing APIs scoped strictly to the currently logged-in account: `/api/progress`, `/api/activity`, `/api/learning/state`.
- No changes to grading algorithms, historical data, permissions, or database records.
- Uses real metrics from the API; does not fabricate dummy data to fill charts. When there is no activity yet, an onboarding empty state is shown.
- Consistent light-theme styling with mobile responsive breakpoints.

## Testing
- 4/4 new tests in `tests/progress-ui.test.js` passed.
- 18/18 focused tests passed: progress UI, education experience, assessment/study plan, and inline AI.
- All JavaScript files in `public/js`, `modules`, and `server.js` passed `node --check`.
- Full test suite: 162 tests, 121 passed, 38 failed, 3 skipped. The previous 4.2.0 baseline had 158 tests, 117 passed, 38 failed, 3 skipped; no new regressions were introduced in the full suite. Pre-existing failures were outside the scope of this tab redesign.
- Not yet verified in a real browser on desktop/mobile in the current environment; the new UI tests verify structure and responsive rules in source code and do not replace visual E2E testing.

## Upgrade Notes
This is a backward-compatible frontend/API release with no database migrations. As with any release, back up `data/app.db` and `.env` before deploying. After restarting, verify that `/api/health` returns `version: 4.2.1`.
