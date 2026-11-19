# Python Lab Audit, Bug-Fix, and Upgrade Report — v2.3.0

> **Lưu ý (lỗi thời):** báo cáo này mô tả phiên bản Python Lab v2.3.0 cũ, dùng SQLite và không còn đúng với mã hiện tại (đã bỏ lập trình, dùng PostgreSQL/SQLite, có trợ lý AI). Giữ lại để tham khảo lịch sử. Báo cáo hiện hành: `docs/AUDIT_FULL_2026-11-19.md`.

Date: 29/10/2026. Scope: v2.2.0 source code (the previous build from the same work session) and original v1.5.0 source code for comparison.
All conclusions below are based on the source code or actual test execution results. No operations were performed on the production server.

Status legend:
- **[Fixed + tested]** Fixed and verified by passing automated tests.
- **[Fixed, partially tested]** Fixed, but not exhaustively tested under all conditions.
- **[Checked, no issues found]** Reviewed and no issues detected.
- **[Unverifiable]** Cannot be verified in this environment.

---

## 1. Audited Architecture

| Component | Actual Implementation in Code |
|---|---|
| Server | `server.js`: Node.js ≥ 22, `node:http`, no framework, zero npm dependencies. Serves `/api/*` endpoints and static files from `public/`. |
| Database | SQLite via `node:sqlite` (`data/app.db`). Tables: users, sessions, submissions, exam_settings, exam_attempts, custom_exercises, site_stats, ratings, user_prefs, announcements, site_settings. |
| Python Runner | **Not real Python.** `interpreter.js` is a custom subset Python interpreter written in JavaScript running server-side. Does not use `eval`/`exec`/subprocesses. |
| Grader | `gradeCode` in `interpreter.js`: pre-run syntax/error check, code execution, required technique check, output matching. |
| Curriculum | `curriculum.js`: 44 chapters, 478 exercises, 44 exams, 7 groups, 10 learning paths. |
| Frontend | ES module SPA in `public/js/`, hash-based routing (`#/bai/c1e1`). CodeMirror 5.65.16 code editor (vendored in `public/vendor/`). |
| Markdown / LaTeX | **None.** The system does not use Markdown, MathJax, or KaTeX. Exercise prompts are plain text, HTML-escaped and highlighted for Python keywords via `formatPrompt`. |
| Authentication | Session cookie `hoc_session` (HttpOnly, SameSite=Lax, Secure on HTTPS), scrypt password hashing, CSRF token required for all write operations. |
| Deployment | PM2 + nginx reverse proxy to `127.0.0.1:8082`. |
| AI Tutor | **Not present** in the codebase; no AI provider configuration exists. |
| Git | The received project directory is **not a Git repository**, so `git status` was unavailable to track uncommitted changes. Added `.gitignore` in preparation for Git initialization. |

---

## 2. Discovered Bugs, Severity, and Root Causes

### P0: Critical, Security, and Core Functionality

| # | Bug | Root Cause | Status |
|---|---|---|---|
| P0-1 | **A 2-line snippet crashes the entire website.** Sending `x = range(100000000)` to the public code-run API (no login required) exhausts Node process memory and terminates the server (reproduced: heap out of memory). | `range()` allocates a full unbounded array; the interpreter runs in the same process as the web server. | [Fixed + tested] |
| P0-2 | Heavy code execution (loops processing large strings) **blocks the main event loop**: all other users must wait. | The interpreter runs synchronously inside the web server process, limiting only statement count rather than wall-clock execution time. | [Fixed + tested] |
| P0-3 | Exponentially growing strings or lists (doubling a string 30 times, `[0]*1000*1000`) cause memory spikes. | No size limits on strings or lists. | [Fixed + tested] |
| P0-4 | Brute-force rate limiting **counts successful logins**, shared across registration and login at 10 attempts / 5 minutes / IP. An entire classroom sharing one IP (school NAT) gets locked out after 10 logins. | Rate counter design flaw. | [Fixed + tested] |
| P0-5 | Client IP for brute-force protection is taken directly from the `X-Forwarded-For` header → an attacker spoofing the header bypasses rate limits. The server listens on all interfaces (`0.0.0.0`), so port 8082 can be called directly, bypassing nginx. | Unconditional trust in proxy headers; `server.listen(PORT)` omitted the host parameter. | [Fixed + tested] |
| P0-6 | No rate limit on code execution/submission: a single account can spam thousands of submissions (each storing up to 10 KB of code), bloating the database. | Missing rate limit. | [Fixed, partially tested] (rate limit works functionally; not load-tested at scale) |

### P1: Direct Impact on Learning Experience

| # | Bug | Root Cause | Status |
|---|---|---|---|
| P1-1 | **Typing Vietnamese on mobile drops accented characters.** Reproduced on emulated Android Chromium: lost characters in 6 out of 8 words ("Học sinh giỏi" (Good student) became "Hc sinh gii"), even when typing at human speed. Live v1.x also uses CodeMirror 5 with default settings and suffers from the same bug. | CodeMirror 5 defaults to `inputStyle: "contenteditable"` on mobile devices; this mode drops characters committed directly by mobile virtual keyboards. | [Fixed + tested] |
| P1-2 | Typing Vietnamese using composition-based IMEs (Telex/VNI via IME) on desktop: the error linter and autocomplete popup can trigger **mid-composition**. | The linter runs 450 ms after every change without checking whether an IME composition is active. | [Fixed + tested]. Note: on emulated Chromium, the older v2.2.0 did not reproduce the issue either; added official `compositionstart/compositionend` guards as a defensive layer. Not yet tested on physical Windows hardware with Unikey/EVKey. |
| P1-3 | **Curly quotes inside strings break programs.** `print("Anh nói “chào em”")` reports error `"Ký tự lạ"` (Unexpected character). | The normalization function replaces ALL curly quotes with straight quotes, including quotes inside string literals, prematurely terminating the string. | [Fixed + tested] |
| P1-4 | Vietnamese variable names (`điểm = 9`, valid in Python 3) fail with `"Ký tự lạ"` (Unexpected character). | The tokenizer only matched `[A-Za-z_]`. | [Fixed + tested] |
| P1-5 | `print(a, end="")` and `print(a, b, sep="-")` throw errors. Beginners use these frequently. | Keyword arguments were unsupported, and `=` was not recognized inside call expressions. | [Fixed + tested] |
| P1-6 | No `input()` / standard input support, making multi-test-case exercises impossible. | Missing feature. | [Fixed + tested] (added `input()` and the "Đầu vào" (Input) box) |
| P1-7 | A runtime error mid-program **discards all output printed prior to the error**. | The API returned `output: ""` whenever an error occurred. | [Fixed + tested] |
| P1-8 | The grader **trims leading whitespace from the entire output**, falsely marking ASCII-art exercises (star triangles) as PASS even when line 1 is missing leading spaces, while marking submissions as FAIL when lines have invisible trailing spaces. | Output comparison used `.trim()` on the whole string. | [Fixed + tested]. New rule: strip trailing whitespace on each line and trailing blank lines, while preserving leading whitespace, line order, and content. Re-ran all 522 sample solutions: zero regressions. |
| P1-9 | The required-technique check (e.g., "must use a `for` loop") is fooled when the word `"for"` appears inside a string literal like `print("for x in y")`. | Technique detection ran regexes against raw source code, including string literals. | [Fixed + tested] |
| P1-10 | Exercise prompts lose leading indentation when rendered (star triangle examples in prompts are left-aligned). | Newlines `\n` were converted to `<br>`, causing HTML to collapse consecutive spaces. | [Fixed + tested] (applied `white-space: pre-wrap`) |
| P1-11 | Exercise `c1e8` prompt states the result "sẽ ra 5.0" (will output 5.0), but the expected answer is `5`. | The interpreter does not distinguish `5.0` from integer `5` (known limitation). | [Fixed + tested]: updated prompt text and noted the difference from standard Python. |
| P1-12 | Chapter 30 theory example fails to run, even though the UI displays a "Chạy ví dụ" (Run example) button. | The example was written as prose ("Đoạn sai / Đoạn đúng" — Wrong snippet / Right snippet). | [Fixed + tested]: converted prose into comments and runnable Python code. |
| P1-13 | Chapter 18 theory consists of only a single sentence. | Missing content. | [Fixed]: added guidance on solving comprehensive exercises and common pitfalls. |
| P1-14 | Session expiration mid-session: pages only show generic error messages without prompting the user to log back in. | No centralized HTTP 401 handler. | [Fixed, partially tested]: shows a session-expired dialog and redirects to login while preserving code drafts. Automated tests cover the server side (expired session returns 401). |
| P1-15 | Two concurrent submission requests can receive the same attempt number; submitting an exam twice simultaneously can grade it twice. | Read-then-update state check was non-atomic. | [Fixed + tested] (exam endpoint returns HTTP 409 on duplicate concurrent submission) |
| P1-16 | Submission API responses include `expected` output even when unused by the UI, which would leak hidden test cases in the future. | Redundant response field. | [Fixed + tested] |

### P2: UI, Performance, and Usability

| # | Issue | Status |
|---|---|---|
| P2-1 | Missing `Content-Security-Policy`, `HSTS`, and `Permissions-Policy` headers; API responses returning private user data lack `Cache-Control: no-store`. | [Fixed + tested] |
| P2-2 | Missing `robots.txt`, `sitemap.xml`, canonical URL, and Open Graph tags; page title and meta description are hardcoded rather than using site settings. | [Fixed + tested] |
| P2-3 | Missing database indexes for per-user score and submission history queries. | [Fixed] (`CREATE INDEX IF NOT EXISTS`, non-destructive) |
| P2-4 | The "Tải lại" (Reload) button uses inline `onclick` (blocked by CSP). | [Fixed + tested] |
| P2-5 | Missing built-in functions `max`, `min`, `abs`, `round`; user-defined functions with the same name as built-ins should shadow built-ins as in Python. | [Fixed + tested] |
| P2-6 | The code runner UI does not visually distinguish Completed, Error, Time Limit Exceeded, and Memory Limit Exceeded states. | [Fixed + tested] |

### Checked, No Issues Found
- SQL injection: all queries use parameterized `?` placeholders. Table names interpolated in the account deletion API are hardcoded constants. **[Checked, no issues found]**
- IDOR: submission history, progress, and exam endpoints all filter by the session's `user_id`; admin APIs verify teacher/admin role. **[Tested]**
- XSS: all user- and teacher-supplied content passes through `esc()` before HTML insertion; tested with `<script>` and `<img onerror>`. **[Tested]**
- CSRF: all state-changing APIs require a session-matching `X-CSRF-Token` header; session cookies use `SameSite=Lax`. **[Tested]**
- Multiple-choice answers, expected outputs, and reference solutions are never sent to the browser before permitted. **[Tested]**
- Path traversal outside `public/` via `../` or `%2e%2e`: blocked. **[Tested]**
- XP is not double-counted on resubmission: total score uses the highest score per exercise; client-supplied `score` fields are ignored. **[Tested]**
- Server logs never record passwords or session tokens. **[Checked, no issues found]**
- Dependencies: zero npm runtime dependencies; CodeMirror 5.65.16 is the final 5.x release, vendored locally. **[Checked]**
- File uploads: the application has no file upload functionality. **[Checked]**
- All 522 reference solutions (478 exercises + 44 coding exam problems) grade as PASS; no duplicate IDs; all learning paths and groups reference valid exercises; multiple-choice answer indices are within bounds. **[Tested]**

---

## 3. Modified Files and Key Changes

| File | Changes |
|---|---|
| `interpreter.js` | Resource limits (`LIMITS`: 20,000 steps, 200,000 elements, 1M characters per string, 100,000 output characters); `range()` validates size, integer arguments, and non-zero step; curly-quote normalization only for string delimiters; Unicode variable identifiers; `print(sep=, end=)`; `input()` with stdin support; `max/min/abs/round`; user functions shadow built-ins; preserve partial output on runtime error; improved grader (`normalizeOutput`, pinpoints first mismatched line, multiple test cases, hidden test cases); technique check ignores string literal contents. |
| `run-pool.js` (new) | Worker thread pool for code execution: enforces time limit (default 3s), memory limit (96 MB/worker), and max queue size (200); terminates and respawns workers on timeout or OOM. |
| `run-worker.js` (new) | Worker entry point handling run and grade tasks. |
| `server.js` | Executes all code runs and grading inside worker threads; redesigned rate limiting; trusts `X-Forwarded-For` only from `127.0.0.1`; binds to `127.0.0.1` by default (`HOST` env var); `DATA_DIR` and `PUBLIC_URL` support; security headers; `Cache-Control: no-store` on API routes; `robots.txt`, `sitemap.xml`, canonical/OG tags; multi-test support for custom exercises (`tests_json` column); `POST /api/admin/exercises/check` endpoint; atomic exam submission lock; attempt counter incremented after grading; DB indexes; graceful shutdown on PM2 restart; `/api/health` reports runner pool status. |
| `curriculum.js` | Fixed exercise `c1e8` prompt, Chapter 30 runnable code example, and Chapter 18 theory content. |
| `public/js/editor.js` | Forced `inputStyle: "textarea"` across all devices; disabled `spellcheck`/`autocorrect`/`autocapitalize`; suppressed linter and autocomplete while IME composition is active. |
| `public/js/pages.js` | Added Stdin ("Đầu vào") input box on exercise and Playground pages; displays public test cases and hidden test count; execution status badges; transparent notice of interpreter limitations. |
| `public/js/admin.js` | Test case editor (stdin, expected output, hidden flag) for custom exercises; pre-save verification of reference solutions using the server grader. |
| `public/js/core.js` | `formatPrompt` preserves line breaks and leading whitespace; detects expired sessions (HTTP 401). |
| `public/js/main.js` | Session-expired modal dialog; removed inline `onclick` handlers. |
| `public/index.html`, `public/js/theme-init.js` | Extracted inline scripts to external file for strict CSP compliance; dynamic SEO meta tags populated from site settings. |
| `public/css/app.css` | Styles for test cases, stdin box, execution status badges, and `pre-wrap` exercise prompts. |
| `tests/*` (new) | 4 `node:test` suites + 1 Playwright browser E2E test suite. |
| `package.json` | Added `npm test` and `npm run test:e2e` scripts. |
| `.env.example`, `ecosystem.config.example.cjs`, `.gitignore` (new) | Example configuration files containing no secrets. |

---

## 4. Newly Implemented Features
1. Isolated worker thread pool for code execution with strict time, memory, and queue limits.
2. `input()` function + **Input** ("Đầu vào") box on both the exercise workspace and Playground pages.
3. Custom teacher-created exercises now support **multiple test cases** and **hidden test cases** (never sent to the browser or leaked in error messages). Teachers can test their reference solution against all test cases before saving.
4. `print(sep=, end=)`, `max`, `min`, `abs`, `round`, and Vietnamese Unicode variable names.
5. Detailed grading feedback pointing out the exact first mismatched line (missing line, extra line, or leading indentation mismatch).
6. Distinct execution status badges: Completed / Error / Time Limit Exceeded / Memory Limit Exceeded / Server Busy.
7. Session-expired modal notification preserving unsaved work.
8. Dynamic `robots.txt`, `sitemap.xml`, canonical links, and Open Graph metadata.

---

## 5. Test Results (Executed 29/10/2026 on Node 22.23)

| Test Suite | Command | Passed | Failed | Skipped |
|---|---|---|---|---|
| Interpreter & Grader (`tests/interpreter.test.js`) | `npm test` | 23 | 0 | 0 |
| Curriculum Content (`tests/content.test.js`) | `npm test` | 5 | 0 | 0 |
| Prompt Rendering & Linter (`tests/render.test.js`) | `npm test` | 9 | 0 | 0 |
| API Integration, Security & Auth (`tests/api.test.js`) | `npm test` | 18 | 0 | 0 |
| Browser UI E2E (`tests/e2e/ui.e2e.mjs`) | `npm run test:e2e` | 19 | 0 | 0 |
| **Total** | | **74** | **0** | 0 |

Transparent notes on the testing process:
- On the first run of the API test suite, 3 tests failed due to test setup issues: two tests reused an account that had just been temporarily locked by the preceding brute-force protection test (confirming the lockout mechanism worked), and one "heavy code" timeout test was not computationally heavy enough to exceed 1.5 seconds. Fixed the test cases without altering application logic to pass tests.
- On the first run of the UI E2E suite, 1 undo (`Ctrl+Z`) test failed because CodeMirror merges keystrokes typed within 1.25 seconds into a single undo history event (similar to VS Code). Adjusted the test to wait past the coalescing threshold.
- The Android mobile typing E2E test initially **failed** (dropped the character "ọ"). This reproduced the real bug P1-1 and passed after applying the code fix.
- No linter, type checker, or build step was run because the project is vanilla JavaScript with no build pipeline. Verified syntax on all JS files using `node --check`.

---

## 6. Resolved Vulnerabilities and Remaining Risks

**Resolved:** P0-1 through P0-6, P2-1, P1-15, P1-16 (see Section 2).

**Remaining Risks:**
- Worker threads isolate execution time and V8 heap memory, but still share the same OS process. This is acceptable because the custom JS interpreter **cannot** access the filesystem, network, or child processes: it only interprets a safe subset of Python with no `import`, `open`, or `eval`. If the platform migrates to real CPython in the future, code **must** be executed inside a dedicated sandbox (container or `nsjail`) with strict OS-level privilege restrictions.
- Session tokens are stored in plaintext in the `sessions` table. Anyone with read access to `app.db` could hijack active sessions. Session tokens should be hashed in a future release (with a migration path to avoid logging out active users).
- Login responses return slightly faster when a username does not exist, allowing username enumeration via timing analysis. Since the registration endpoint already reports when a username is taken, the practical risk is low.
- Database backup files downloaded from the Admin Data tab contain all user accounts (with scrypt-hashed passwords). Teachers/administrators must store backups securely.
- The `Content-Security-Policy` header still permits `style-src 'unsafe-inline'` because the UI and CodeMirror rely on inline `style` attributes. Script execution is strictly locked down to `'self'`.
- The leaderboard and admin overview pages compute per-user scores across multiple queries. This performs well for a few hundred students but has not been load-tested at large scale.

---

## 7. Limitations of the Python Runner and Grading System
- **This is a custom lightweight Python subset interpreter, not CPython.** The Playground UI now clearly states this for learners.
- Supported features: `print` (`sep`, `end`), `input`, variables (including Vietnamese Unicode identifiers), `+ - * / // % **`, comparisons, `and/or/not`, `in`, `if/elif/else`, `for`, `while`, `break/continue/pass`, `list`, `dict`, negative indexing, slicing, `def/return`, recursion, f-strings, `len/str/int/float/sum/range/max/min/abs/round`, and common string/list methods.
- Unsupported features: `tuple`, `set`, `try/except`, `class`, `import`/modules, file I/O, `lambda`, list comprehensions, default function arguments, and tuple unpacking/multiple assignment (`a, b = ...`).
- Behavioral differences from CPython: `10 / 2` prints `5` instead of `5.0`; `int("3.7")` returns `3` instead of raising a `ValueError`; error messages are friendly Vietnamese explanations rather than raw Python tracebacks.
- Per-run execution limits: 3 seconds (configurable via `RUN_TIMEOUT_MS`), 96 MB memory, 20,000 statements, 10,000 loop iterations, 200,000 collection elements, 1,000,000 characters per string, and 100,000 output characters.
- The 478 built-in curriculum exercises grade against a **single** expected output (since they take no stdin input, there is only one deterministic output). Multi-test and hidden-test grading is currently enabled for **teacher-created custom exercises**. Converting built-in exercises to multi-test format requires rewriting individual exercise prompts and solutions and was intentionally avoided as an unverified bulk change.
- When a student fails a built-in exercise, the expected output is displayed. This is an intentional pedagogical design choice for beginners, not an unintended data leak.

## Alignment with Requested Curriculum Topics (Part 3 of Specification)
Currently covered: first program, variables, arithmetic operators, `if/elif/else`, `for`/`while` loops, strings, lists, dictionaries, functions, basic variable scope, algorithms, data structures (simulated), OOP simulated via dictionaries, mini-projects, and AI thinking.
Not yet covered due to interpreter limitations: local environment setup, `tuple`/`set`, exception handling (`try/except`), modules/packages, file I/O, real `class`-based OOP, and APIs/JSON/databases. Adding these chapters requires either expanding the custom interpreter or migrating to sandboxed CPython (see Section 12).

---

## 8. Blocked Items
| Item | Reason | Next Step |
|---|---|---|
| Live verification on `study.liferivo.com` | The work environment has no network access to the production server, and destructive testing on production is prohibited by policy. | Deploy v2.3.0 to the VPS and run `npm run test:e2e` against a staging copy of the database. |
| Physical device testing with Unikey/EVKey on Windows and Laban Key/Gboard on mobile | Only headless/emulated Chromium was available (tested simulated IME composition, Unikey backspace replacement, and direct Android keyboard commits). | Perform manual testing on 1 Windows PC + 1 Android phone + 1 iPhone after deployment. |
| AI Tutor (Part 7) | The system has no existing AI feature, provider, or API key. Stub/fake features were not created. | Once an AI provider is chosen, configure the server-side API key via environment variables and add a per-user rate-limited endpoint. |
| Web Fonts | Google Fonts could not be loaded in the isolated test environment (network blocked); the UI fell back to system fonts. | Will load normally on the internet-connected VPS. |

---

## 9. Running Locally and Re-Running Tests
```bash
node --version            # requires >= 22
npm start                 # http://127.0.0.1:8082
npm test                  # 55 tests: runner, grader, content, rendering, API (uses a temporary DB, never touches data/)
npm i -D playwright && npx playwright install chromium   # only needed on dev machines
npm run test:e2e          # 19 browser UI tests, including Vietnamese input tests
```

## 10. Safe Deployment to the Existing VPS
```bash
cp /root/hoc-lap-trinh/data/app.db /root/hoc-lap-trinh-backup-$(date +%F).db
cd /root/hoc-lap-trinh
unzip -o /root/python-lab-v2.3.0.zip
node --version                         # must be >= 22
npm test                               # zero extra dependencies required, runs on a temporary DB
pm2 restart hoc-lap-trinh --update-env
curl -s http://127.0.0.1:8082/api/health   # "version":"2.3.0", "runner":{"isolated":true,...}
```
- On startup, the server automatically adds the `custom_exercises.tests_json` column (default `[]`) and 4 indexes using `IF NOT EXISTS`. Existing data is never deleted or altered. Tested upgrading directly from a v1.5.0 database: user scores and custom exercises remained intact.
- **Important behavioral change:** the server now binds only to `127.0.0.1` by default. nginx continues to work normally because it proxies to `127.0.0.1:8082`. Direct external access to `IP:8082` is now blocked; if direct access is ever required, set `HOST=0.0.0.0`.
- Rollback procedure in case of issues: run `pm2 stop hoc-lap-trinh`, copy the backup file back to `data/app.db`, extract the previous release zip, and run `pm2 start hoc-lap-trinh`.

## 11. New Environment Variables (All Optional — See `.env.example`)
| Variable | Default | Description |
|---|---|---|
| `HOST` | `127.0.0.1` | Listening host address. |
| `PUBLIC_URL` | derived from `Host` header | Base URL used for canonical links and sitemap, e.g., `https://study.liferivo.com`. |
| `DATA_DIR` | `./data` | Database directory path. |
| `RUN_WORKERS` | `2` | Number of parallel worker threads for running Python code. |
| `RUN_TIMEOUT_MS` | `3000` | Maximum execution time per run (in milliseconds). |
| `RUN_MEMORY_MB` | `96` | Maximum memory limit per code runner worker thread (in MB). |
(`PORT` and `ADMIN_USERNAME` remain unchanged.)

## 12. Remaining Backlog by Priority
1. **P1:** Manually test Vietnamese typing on physical Windows (Unikey, EVKey), Android (Gboard, Laban Key), and iOS devices after deployment.
2. **P1:** Hash session tokens in the `sessions` table with a graceful migration step so active users are not logged out.
3. **P1:** Gradually migrate built-in curriculum exercises to multi-test format (using `input()` and edge-case tests), chapter by chapter, running `npm test` after each batch.
4. **P2:** Expand the Python subset interpreter: `tuple`, `try/except`, multiple assignment, list comprehensions, and float formatting (`5.0`). Every addition must include unit tests and pass all 522 reference solutions.
5. **P2:** To teach file I/O, modules, external APIs, and full OOP: run real CPython inside an isolated sandbox (container or `nsjail`, network disabled, CPU/RAM/time limits enforced), dispatched through the worker queue (`run-pool.js`).
6. **P2:** Cache `bestScores` calculations for the leaderboard as student headcount grows, and perform load testing.
7. **P2:** Implement the AI Tutor once an AI provider and API key are provisioned (server-side key storage, per-user rate limiting, progressive hints before revealing full solutions).
