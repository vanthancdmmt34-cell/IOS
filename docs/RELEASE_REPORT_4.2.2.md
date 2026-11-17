# PythonLab 4.2.2 Release Report

Test date: 2026-11-01  
Objective: Add advanced Pro content, increase Pro AI quotas, and complete the learning support center.

## 1. New Pro Content

- Stage 3: Pro Algorithm Challenges.
- `l11`: Algorithm Challenges with Lists.
- `l12`: Data Analysis and Statistics.
- `l13`: Numeric Algorithms and String Processing.
- Each lesson includes 3 practice exercises (9 new practice exercises total), learning objectives, explanations, quizzes, and hidden tests.
- System totals: 13 guided lessons; 7 Pro-exclusive lessons (4 previous Pro lessons + 3 new lessons). The existing 44-chapter Python curriculum and 478 exercises remain unchanged.
- Server-side entitlement checks on the API: verified that a Pro account can fetch `l11` (HTTP 200), while a Free account is denied (HTTP 402) and sees locked lessons in the Free catalog.
- The API never sends reference solutions or hidden tests to students.

## 2. AI Quotas

| Plan | Previous | New Default |
|---|---:|---:|
| Free / day | 3 | 3 |
| Free / month | 30 | 30 |
| Pro / day | 40 | 100 |
| Pro / month | 600 | 2,000 |

Existing configurations storing the exact previous default values (40/600) are automatically upgraded to 100/2,000 on server startup. Custom configurations remain untouched. These user quotas remain subject to the system-wide monthly AI budget cap, which defaults to 10 USD and is not automatically increased in this release.

## 3. Learning Support Center

- Added route/menu `#/ho-tro` and the help center page.
- Scenario-based guidance: not understanding a lesson, unsure about weak areas, unsure what to study next, or needing a teacher to review a submission.
- Includes FAQs for wrong code output, syntax/runtime errors, Pro entitlements, exhausted AI quotas, and unreflected progress.
- Displays AI status and remaining quota; guides learners to include the lesson name, exercise ID, error screenshot, and steps already tried when reaching out for help.
- Does not introduce a separate AI Chat that duplicates the inline AI code annotations in the exercise workspace.

## 4. Technical Bug Fixes

- Fixed a trailing comma after lesson `l10` that created an `undefined` element in the `LESSONS` array, which could cause server errors when opening `l11`/`l12`/`l13` via the API.
- Updated Stage 3 declarations, Pro benefits, plan descriptions, and the content test suite.
- No schema migrations added; the quota upgrade updates existing settings records.

## 5. Testing

| Check | Result |
|---|---:|
| Focused tests (Pro, AI quota, help, learning path, progress, i18n) | 26/26 passed |
| 9 new Pro practice exercises executed with Python 3 | 28/28 sample cases passed |
| JavaScript syntax check | 15 files passed |
| Full `npm test` suite | 125 passed, 38 failed, 3 skipped |

The 38 failures in the full suite were already present in the 4.2.1 baseline; total failures did not increase in this release. The skipped tests require Docker and the Python runner image to verify containerized execution. Sample testing for the new Pro exercises used local Python 3, which does not replace verifying the production Docker sandbox.

## 6. Configuration and Operations Requirements

- Requires Node.js >= 22.
- Requires a valid Gemini API key configured in the admin panel for live AI functionality.
- User usage quotas do not guarantee AI availability if the system-wide AI budget is exhausted, the key/model is invalid, or the provider enforces rate limits.
- Staging verification is recommended before public release. Back up `data/app.db`, `.env`, and secret keys before replacing source files.
- Playwright browser E2E tests and production Docker sandbox checks were not executed in this audit environment.
