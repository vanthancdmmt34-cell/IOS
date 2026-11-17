# TEST_REPORT — Python Lab 4.0.1

## Version 4.0.1 (30/10/2026)
- Automated tests (Docker): **114 passed, 0 failed** — added `tests/teachers.test.js` (6 tests): admin creates a teacher account with a license, teachers cannot access teacher management; teacher creates student accounts and enrolls them in a class (consumes seats, rejects account creation when out of seats); teachers only see their own students (other teachers receive 404, students receive 403); teachers can only reset passwords / lock accounts they created themselves (self-registered accounts return 403); transferring classes + students to another teacher (seats transfer accurately, rejected if the target teacher lacks seats); custom logo restricted to admin, rejects SVG and images > 512 KB, serves with proper image MIME type + `nosniff`, and displays in configuration and public pages.
- UI End-to-End (Chromium): `ui` 23, `mobile` 35, `pro` 45, `lms` 39, `i18n` 32, **`teachers` 10 (new)** — all passed. Fixed an existing bug uncovered during testing: the Payment, AI & System tab wrote the "Re-check code runner" result into a view that the user had already navigated away from.
- Real database upgrade from 4.0.0 → 4.0.1: migration 014 adds columns / tables while preserving all existing accounts.

## Version 4.0.0

Environment: Linux, Node 22+, Docker Engine with locally built Python image (`pylab-python:local`), Chromium + Playwright, local mock Gemini server (no external network calls). Test date: 30/10/2026. All results below are from actual test executions against the packaged source code.

## 1. Automated Tests (`npm test`)
| Code Runner | Result |
|---|---|
| Real Python (Docker) — `RUNNER_IMAGE=pylab-python:local npm test` | **108 passed, 0 failed, 0 skipped** |

| File | Tests | Key Coverage |
|---|---|---|
| `api.test.js` | 18 | login, CSRF, code run/grading, chapter tests, administration (first account becomes admin) |
| `commerce.test.js` | 14 | plans, orders, VietQR, SePay webhook, AI, bilingual SEO + 301 redirects |
| `lms.test.js` (new) | 17 | roles, entitlements, licenses, classes, assignments, class exams, Excel export, Family plan, role-based AI quotas, webhook logs, 3-role AI assistant |
| `i18n.test.js` (new) | 9 | UI dictionary coverage ≥ 98% and parameter matching, profile language preference, reviewed content translations, AI drafts never auto-published, code blocks never translated, permissions, `/en` SEO |
| `interpreter.test.js`, `render.test.js`, `content.test.js`, `runner.test.js`, `sysconfig.test.js`, `vietqr.test.js` | 23 + 9 + 5 + 4 + 6 + 3 | same as previous releases |

## 2. 14 Acceptance Criteria
| # | Criterion | Test Coverage | Result |
|---|---|---|---|
| 1 | Free users cannot call Pro APIs | `lms` TC1, `commerce` 2 | Passed |
| 2 | Joining a valid class grants Pro access | `lms` TC2 + TC8 | Passed |
| 3 | Leaving a class only revokes class-granted entitlements | `lms` TC4 + TC3 | Passed |
| 4 | Personal Pro access remains intact | `lms` TC4 + TC3, Family | Passed |
| 5 | Expired teacher license expires class entitlements | `lms` TC5 | Passed |
| 6 | Teachers cannot access other teachers' classes | `lms` TC6 (404) + blocked from `/api/admin/*` | Passed |
| 7 | Students cannot view other students' submissions | `lms` TC7 | Passed |
| 8 | License seat limit cannot be exceeded | `lms` TC2 + TC8 (transactional lock) | Passed |
| 9 | VI/EN interfaces render accurately | `i18n` (9 tests) + `e2e/i18n` (32 checks) | Passed |
| 10 | AI quotas enforced per plan | `lms` TC10, AI assistant; `commerce` AI | Passed |
| 11 | Webhooks with invalid signatures are rejected | `lms` TC11/12, `commerce` 5 | Passed |
| 12 | Duplicate webhooks do not grant duplicate entitlements | `lms` TC11/12, `commerce` 6 | Passed |
| 13 | No legacy data loss | Real database upgrade 3.2.1 → 4.0.0 (Section 4) | Passed |
| 14 | Existing learning features continue to work | All legacy tests + `ui`, `mobile`, `pro` e2e | Passed |

## 3. UI End-to-End Tests (Real Chromium)
| Suite | Result |
|---|---|
| `tests/e2e/ui.e2e.mjs` | 23 passed, 0 failed |
| `tests/e2e/mobile.e2e.mjs` (iPhone 13, Pixel 7) | 35 passed, 0 failed |
| `tests/e2e/pro.e2e.mjs` | 45 passed, 0 failed |
| `tests/e2e/lms.e2e.mjs` (new) | 39 passed, 0 failed — teacher creates class, student joins via code, assignment creation, submission, manual grading, timed class exam, AI locked during exam, class reports + Excel + print view, Family plan, admin class/license management, role-based navigation menu, no horizontal overflow on mobile |
| `tests/e2e/i18n.e2e.mjs` (new) | 32 passed, 0 failed — guest selects EN and preference persists across reloads, registration saves `lang=en`, navigation menu and dashboard contain no leftover Vietnamese UI strings, approved lessons render in English / unapproved lessons fall back to Vietnamese, code is never translated, AI assistant (role-based modes, Q&A, remaining quota counter, hidden during exams, locked on restricted pages), admin translation review (cannot publish without checking confirmation box), webhook logs, `/en` SEO pages, mobile layout |

Screenshots: `tests/e2e/shots/` (20–28: classroom workflows, 30–35: bilingual UI and AI assistant).

UI dictionary coverage: `tools/i18n-harvest.mjs` launches a real browser across 5 user roles, collecting 1,365 Vietnamese strings rendered on screen and in API error messages; only 3 strings lack dedicated dictionary entries (the `noscript` fallback tag and 2 error message prefixes already handled by parameterized patterns).

## 4. Real Database Upgrade and Rollback
- Database created by **version 3.2.1** (containing an admin account + a student account with exercise submissions and a 3-month complimentary Pro grant) → upgraded to 4.0.0: 10 new migrations applied, `app.db.truoc-migrate-*` automatic backup created, user count / submissions / Pro periods unchanged; legacy admin logs in with the `admin` role; student retains all 5 score records and active Pro status (source: complimentary admin grant).
- Rolled back migrations 013 → 004 using `tools/migrate.js down` and started version 3.2.1 against the same database: admin reverted to `teacher`, student retained all scores and Pro access.

## 5. Not Yet Verified (Requires Staging)
- Live webhooks from **real SePay** and API calls to **real Gemini** (the development environment lacks live credentials and outbound internet access is blocked). Verified against local mock servers implementing the exact wire formats.
- AI translation quality across all 44 curriculum chapters: requires a live Gemini API key to generate drafts, followed by human administrator review.
- Load testing with multiple classes / concurrent students taking exams simultaneously.

---
_Reports from previous releases (3.x) are preserved below for reference._

## Version 3.x

Environment: Linux, Node 22+, Docker Engine with locally built Python image (`pylab-python:local`, using Python 3.13 because Docker Hub was unreachable from the development environment; production uses `python:3.12-slim` per `runner/Dockerfile`), Chromium + Playwright. Test date: 30/10/2026. All results below are from actual test runs.

## 1. Automated Tests (`npm test`, Temporary Database)
| Code Runner | Result |
|---|---|
| Real Python (Docker) — `RUNNER_IMAGE=pylab-python:local npm test` | **82 passed, 0 failed, 0 skipped** (version 3.2.0) |
| JS Interpreter — `RUNNER=interpreter npm test` | **79 passed, 0 failed, 3 skipped** (3 Docker-specific tests) |

Version 3.2.0 added `tests/sysconfig.test.js` (6 tests: access control, write-only secret keys, password confirmation, encryption + backup files do not leak keys, invalid values rejected, immediate hot-reload for AI model / website URL / SePay secret, audit logs omit sensitive values). Additional Docker verification: changing execution timeout to 1000 ms in Admin → a 2-second sleep script is terminated; changing to 5000 ms → script completes without restarting the server.

Version 3.1.0 added `tests/vietqr.test.js` (3 tests: matches 2 public reference VietQR payloads, standard CRC16 checksum, rejects invalid inputs) and 1 personal QR workflow test in `commerce.test.js`. Generated QR images were decoded using OpenCV and verified to match the exact VietQR payload string.

Test suites: `api.test.js` (login, CSRF, run/grade, chapter tests, legacy admin), `content.test.js`, `interpreter.test.js`, `render.test.js`, `runner.test.js` (real Python + sandbox), and **`commerce.test.js` (new, 13 tests)**:
1. Database migrations create tables and seed 3 plans with accurate prices.
2. Lessons: guests viewing the catalog cannot see solutions; hidden test cases are stripped from client responses; Free users calling Pro lessons / Pro quizzes / Pro practice exercises receive HTTP 402.
3. Server-side lesson grading: hardcoded outputs are rejected, XP is awarded only on the first completion, lesson completion requires passing all criteria, missing CSRF token returns HTTP 403.
4. Orders: unconfigured receiving bank account returns HTTP 503; order codes match expected format; QR code encodes exact amount; clicking checkout again reuses the pending order; users cannot view other users' orders.
5. Webhook security: missing signature, invalid signature, or signature timestamp older than 1 hour returns HTTP 401 and does not activate Pro.
6. Webhook processing: underpayment does not activate Pro; exact payment (with lowercase order code in transfer description) activates Pro; duplicate webhook delivery does not add extra days and creates only 1 membership period; Pro unlocks lessons + progress reports; outgoing bank transactions are marked `ignored`; transactions without an order code are marked `unmatched`.
7. Purchasing an additional 3-month plan while already active extends the expiration date consecutively by 89–92 days.
8. Students calling the 7 business administration APIs receive HTTP 403, guests receive HTTP 401; self-granting Pro or modifying plan prices returns HTTP 403.
9. Business administration: revenue calculation equals 218,000 VND matching seeded data; manual confirmation without a bank transaction ID returns HTTP 400, with a valid ID activates Pro; revoking Pro requires a reason; complimentary Pro grant works; plan prices < 1,000 VND are rejected; audit log records all 7 action types.
10. AI Tutor via mock Gemini server: API key sent in the proper header, system prompt enforces the no-direct-solution rule, multi-turn conversation context is preserved, upstream provider error returns HTTP 502 without deducting quota, Free tier exhausting 3 requests returns HTTP 402, users cannot read other users' conversations, Pro tier allows 100 requests, cost calculation equals 550 micro-USD/request matching the pricing formula.
11. Security: API keys and webhook secrets are never leaked in HTML or API responses; CSP allows QR images.
12. SEO: `<title>`, canonical URL, JSON-LD structured data, Pro lessons do not leak gated content, 7 public landing/policy pages, `sitemap.xml`, unknown routes fall back to SPA shell.
13. AI rate limiting: a Pro account sending 8 rapid requests receives `200×6, 429×2`.

## 2. Content Validation with Real Python
| Tool | Result |
|---|---|
| `tools/check-content-python.mjs` — 478 exercises + 44 chapter exams | **522/522 reference solutions passed** (after fixing 15 reference solutions) |
| `tools/check-lessons-python.mjs` — 10 lessons: examples print expected output, reference solutions pass all tests (including hidden tests), starter code FAILS | **50 items checked, 0 errors** |

## 3. UI End-to-End Tests (Real Chromium)
| Suite | Result |
|---|---|
| `tests/e2e/ui.e2e.mjs` (Docker) | 23 passed, 0 failed |
| `tests/e2e/mobile.e2e.mjs` iPhone 13 + Pixel 7 (Docker) | 35 passed, 0 failed |
| **`tests/e2e/pro.e2e.mjs` (Docker, version 3.1.0)** | **45 passed, 0 failed** (added 6 checks for the system configuration tab: saving receiving bank account, saving AI key with password confirmation, testing AI connection, checking code runner; personal QR workflow: student reports transfer → admin enters bank transaction ID in UI → student page automatically transitions to Payment Received) |

`pro.e2e.mjs` coverage: dashboard summary cards; 10 lessons (4 locked for Free); lesson view renders all 10 sections; running code examples; submitting practice exercises; hardcoded output rejected; 3/3 quiz questions; Pro lesson displays upgrade prompt; Ask AI inside exercises; AI page tracks remaining quota; pricing page displays all 4 plan cards with accurate prices; checkout displays order code + QR code with accurate amount/description; HMAC-signed webhook automatically transitions checkout page to "Payment Received"; Pro lesson unlocked; My Plan page; disabling renewal reminders; Business admin shows 59,000 VND revenue and all 7 sub-sections; settings page includes new configuration groups; mobile viewport: 4 pages have no horizontal overflow, mobile code editor supports typing and submitting exercises; SEO pages; policy pages pull contact info from settings; homepage links to policy pages; zero console errors across all 3 user roles. Screenshots saved in `tests/e2e/shots/`.

## 4. Real Database Upgrade
Database created by version 2.3.0 (containing user accounts and a 10-point exercise submission) → upgraded to 3.0.0: 2 migrations applied, account and submission counts unchanged, login and scores intact. `migrate.js` up → down → up executed cleanly on a temporary database.

## 5. Not Yet Verified (Requires Staging)
- Live webhooks from **real SePay** (the development environment has no SePay account and cannot receive inbound internet webhooks). Payload format and signature verification strictly follow official SePay documentation.
- Calling **real Gemini** (no API key in development, outbound network blocked). Tested against a local mock server implementing the exact `generateContent` schema.
- Live QR image rendering from `qr.sepay.vn` (outbound network blocked; generated URLs were verified to contain exact query parameters).
- Official `python:3.12-slim` image from Docker Hub (tested against an equivalent local Python 3.13 image).
- Concurrent multi-user code execution load testing.
