# Release Readiness — PythonLab 4.2.0

## Completed Scope
- Student dashboard centered around learning content and competency.
- Unified course and learning path cards; removed the zig-zag layout.
- Clearly distinguished the 44-chapter curriculum from the 10 in-depth guided lessons.
- Added chapter-level learning objectives and a 3-step study guide.
- Enforced a consistent light theme throughout the app, including the terminal/output panel.
- Adjusted responsive CSS across learning pages.

## Release Decision
- **Staging:** Ready for staging deployment after backing up data and preserving `.env` and `data/`.
- **Wide Production/Public Release:** Not yet verified. See `TEST_REPORT_4.2.0.md` — 38 baseline test failures remain, browser E2E tests have not been run, and live Docker runner / Gemini integrations have not been verified.

## Pre-Public Requirements
1. Resolve or document with evidence the 38 baseline test failures.
2. Install Playwright in the CI environment and run desktop and mobile E2E tests.
3. Verify on staging with student, teacher, and admin accounts.
4. Configure and verify `python-docker`, the Gemini API key, and all enabled integrations.
5. Verify backup/restore and rollback procedures.
