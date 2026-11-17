# AUDIT_REPORT — Python Lab Pre-3.0.0 Assessment

Date: 2026-10-30. Target: Python Lab 2.3.1 source code (https://study.liferivo.com). All findings are based on source code inspection and local testing in a development environment. No actions were performed on the production server.

## 1. Technical Baseline (Version 2.3.1)

| Component | Current State |
|---|---|
| Server | `server.js` (~1,000 lines), Node.js ≥ 22, built-in `node:http`, no web framework, zero npm dependencies. |
| Database | SQLite `data/app.db` via `node:sqlite`. 11 tables: `users`, `sessions`, `submissions`, `exam_settings`, `custom_exercises`, `exam_attempts`, `site_stats`, `ratings`, `user_prefs`, `announcements`, `site_settings`. Schema changes are applied via scattered `ALTER TABLE` statements in `server.js` with no migration tracking table and no rollback support. |
| Code Execution | **Not real Python**: `interpreter.js` is a custom JS interpreter supporting a subset of Python inside a worker thread. Does not support `class`, `try`/`except`, `import`, `tuple`, `set`, `lambda`, or file I/O. Does not distinguish `5` from `5.0`, and prints string lists without quotes (`[A, B]` instead of `['A', 'B']`). |
| Grading | Enforces pedagogical rules (required techniques, anti-hardcoding checks, hidden tests for teacher-created exercises). The 478 built-in exercises have only 1 expected output each and no hidden tests. |
| Content | 44 chapters, 478 exercises, 44 chapter exams. Chapter theory is very brief (~400 characters) without structured multi-part lessons. |
| Roles | `student`, `teacher` (`teacher` acts as administrator). |
| Commerce | **None**: no plans, no orders, no payment processing, no Free/Pro tier separation. |
| AI | **None**. |
| SEO | SPA with hash routing; only the home page is indexed; sitemap contains only `/`. No legal/policy pages. |
| Email | No SMTP integration; password resets require contacting a teacher. |

## 2. Identified Issues

| # | Severity | Issue | Resolution in 3.0.0 |
|---|---|---|---|
| A1 | High | Code runner is not real Python; learners writing valid Python (`class`, `try`, `import`) receive errors. | Added a real Python 3.12 runner inside isolated per-run Docker containers. Retained the JS interpreter as a fallback. |
| A2 | High | 15 expected outputs in the curriculum **differ from real Python** (`c1e8`, `c2e4`, `c9e10`, `c10e4`, `c11e5/7/8/9/11/12`, `c12e4` print `5` instead of `5.0`; `c33e4/9/10`, `c37e3` print lists without quotes). Switching to real Python would mark correct student solutions wrong. | Corrected expected outputs to match real Python; verified all 522 reference solutions with `tools/check-content-python.mjs` (522/522 pass). |
| A3 | Medium | Chapter 36 theory states "the system does not support real class syntax yet". | Updated the introduction and linked to the new OOP lesson. |
| A4 | Medium | No numbered migrations or rollback mechanism. | Added `db/migrations.js` + `tools/migrate.js` (`status`/`up`/`down`). |
| A5 | Medium | No audit log for administrative actions. | Added `audit_logs` table recording all payment, entitlement, and settings changes. |
| A6 | Low | Sitemap only includes the home page; no public content pages. | Added server-rendered lesson, pricing, and policy pages included in the sitemap. |
| A7 | Low | `interpreter.js` prints string list elements without quotes. | Updated `pyStr` to format list elements using `pyRepr`. |

Previous P0/P1 security vulnerabilities were resolved in 2.3.0 (see `BAO-CAO-KIEM-TOAN.md`); re-verified: CSRF protection on all write endpoints, HttpOnly cookies, scrypt password hashing, login rate limiting, trusting `X-Forwarded-For` from loopback only, and CSP headers. No regressions found.

## 3. Preserved Functionality

All 44 chapters, exams, certificates, leaderboards, badges, playground, the 2.3.1 mobile code editor, all admin settings, and all existing user data are preserved intact. Neither the framework nor the core system was rewritten. New modules reside in `modules/` and `runner/` and are invoked ahead of the legacy API handler.
