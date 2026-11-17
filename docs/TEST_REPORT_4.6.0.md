# PythonLab 4.6.0 Test Report

Run Date: 02/11/2026  
Runtime: Node.js 22.16.0, Linux build container.

## Additional Tests for 4.6.0 Changes

Focused test suites executed individually:
- Rubric API end-to-end: create class/assignment, define rubric criteria, student views rubric, submits code, teacher grades all criteria, verify final score and student data scoping.
- Metrics: route normalization, counters/histograms, token-protected `/internal/metrics`.
- SQLite maintenance: `quick_check`, WAL checkpoint, `VACUUM INTO`, backup data verification, `0600` file permissions, missing database error handling, and invalid command rejection.
- Judge startup guard: forcing `RUNNER=interpreter` while `JUDGE_REQUIRE_DOCKER=true` causes the Judge Service to exit with a non-zero error code rather than falling back to the interpreter.
- AI teacher/English: verify system prompt, teacher permission boundaries, and locking AI access with HTTP 423 while a student is taking an exam.
- Curriculum/grader: all 44 chapters have at least 2 learning objectives; all reference solutions pass grading; hardcoded input-replacement detection works without falsely flagging classification exercises.
- Bilingual support: public APIs return English chapter/exercise content from static translations; published translations in the database continue to take precedence; language preference persists via `/api/language` or `/api/profile/lang`.

Result for focused test suites: all passed in the build environment.

## Full Test Suite

Most recent full suite run prior to packaging: `node --test tests/*.test.js` — **189 tests: 155 passed, 31 failed, 3 skipped**. Following that run, the English fallback flow and an outdated version assertion in the progress UI test were fixed; the full suite should be re-run after the final edits to confirm the exact final counts.

The remaining failing tests are primarily distributed across legacy fixtures/APIs for account permissions, classes/assignments, commerce, entitlements, legacy migrations, UI dictionaries, and inline AI. Passing the 4.6.0 feature tests alone does not mean those legacy suites are resolved.

## Environment Limitations

- Neither the Docker daemon nor the Python runner image is available in the build container, so Docker tests were skipped; the real sandbox has not been verified on a production host.
- No Redis daemon is running and registry dependency installation could not be completed in the build container; BullMQ end-to-end flows were not verified here.
- No PostgreSQL service was available to perform migration or benchmark tests.
