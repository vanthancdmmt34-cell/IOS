# AUDIT — Python Lab 3.2.1 before upgrading to a bilingual LMS (4.0)

Date: 30/10/2026. Scope: the entire 3.2.1 source (commit `932cd5b`). Code was only read and check commands were run; **no code has been changed yet**.

---

## 1. Current architecture

| Layer | Reality |
|---|---|
| Server | Node.js ≥ 22, `node:http`, **no framework, no npm dependencies** (only vendored `qrcode-generator`, MIT). 1 PM2 process, nginx in front, listening on `127.0.0.1:8082`. |
| API routing | `server.js` (1,045 lines) contains the old `handleApi`: ~45 routes (login, exercises, chapter tests, leaderboard, class administration, settings). `modules/api.js` (547 lines) runs **before** `handleApi`: lessons, dashboard, Pro, orders, SePay webhook, AI, business administration, system configuration. This is already an early modular monolith. |
| Database | SQLite `data/app.db` (`node:sqlite`). 11 legacy tables created with `CREATE TABLE IF NOT EXISTS` in `server.js` (no FKs); 12 new tables via `db/migrations.js` (3 numbered migrations, with `down`, with FKs). |
| Code execution | `runner/`: Python 3.12 in Docker, 1 container per run (no network, read-only, uid 65534, CPU/RAM/PID/time/output limits). Fallback: a JS interpreter in a worker thread. **The web process calls the `docker` CLI directly.** |
| Frontend | ES module SPA, hash routing (`#/bai/c1e1`), 11 JS files (~3,900 lines), 1,294 lines of CSS, light/dark. Server-rendered SEO pages (`modules/seo.js`): `/bai-hoc/*`, `/bang-gia`, 5 policy pages. |
| Content | `curriculum.js`: 44 chapters, 478 exercises, 44 tests (88 multiple-choice questions), ~72,000 Vietnamese characters. `lessons.js`: 10 lessons with 10 parts each (6 Free, 4 Pro). |
| Authentication | `hoc_session` cookie HttpOnly/SameSite, scrypt, per-session CSRF token, in-memory rate limiting. |
| Configuration | `settings.js` (display settings) + `modules/sysconfig.js` (AES-GCM-encrypted AI/SePay keys, runner limits, URLs). |
| Testing | 82 `node:test` tests (API, content, runner, commerce, configuration), 3 Playwright e2e suites (23 + 35 + 45 checks). |

## 2. What can be kept as is

- The entire existing learning experience: 44 chapters, grading (required techniques, hidden tests), chapter tests, certificates, leaderboard, badges, playground, mobile editor.
- The Docker Python runner and its sandbox limits.
- 10-part lessons, AI Tutor (provider/quota/cost core), payments (orders, VietQR QR generated on the server, HMAC webhook, deduplication, manual reconciliation), system configuration with encrypted keys.
- The numbered migration system + rollback, `audit_logs`, SEO pages, strict CSP.

## 3. Issues found (must be fixed before or during 4.0)

| # | Severity | Issue | Evidence | Backward-compatible fix |
|---|---|---|---|---|
| A1 | **High** | **The `teacher` role is currently a system-wide administrator.** All `/api/admin/*`, `/api/admin/biz/*` and `/api/admin/system` APIs only check `role === "teacher"`. If the Teacher plan were sold as things stand, a teacher who buys it would get full access: revenue, AI keys, other people's accounts. | `server.js:721`, `modules/api.js:226` | Add an `admin` role; a migration converts existing `teacher` accounts to `admin` (they are currently acting as administrators). From then on `teacher` only has rights over licensed classes. Document this clearly in the upgrade guide. |
| A2 | **High** | **AI is not blocked while a student is taking a test.** A student can open the AI in another tab and send the question/code. | `aiAsk` does not check `exam_attempts.status = 'doing'` | The server refuses (or only allows general syntax explanations, accepting no code/questions) while an attempt is open — applies to the new class tests as well. |
| A3 | High | Pro access is currently computed **only from the `subscriptions` table + the "teacher is always Pro" rule**. There is no concept of an access source (personal / class / family), so "leaving a class only removes class-granted access" is impossible. | `modules/membership.js:13-24` | An `entitlements` table with `source_type/source_id`; `membership()` becomes an aggregating function; a migration copies each active `subscriptions` row into a `source=personal` entitlement. Keep the `subscriptions` table as purchase history. |
| A4 | Medium | The test schedule (`exam_settings`), custom exercises, announcements and leaderboard are all **system-wide** — not tied to a class. | Tables have no `class_id` | Keep them as the "system default class"; per-class data goes into new tables (`assignments`, `class_tests`, `class_announcements`). Legacy behavior is unchanged. |
| A5 | Medium | Legacy tables have no foreign keys: deleting a user leaves orphaned `submissions`, `exam_attempts`, `user_prefs`, `ratings`. | `server.js:818` `DELETE FROM users` | Delete in a transaction together with the legacy tables; new tables use FK `ON DELETE CASCADE`. Do not change the structure of the legacy tables. |
| A6 | Medium | The webhook only logs when a request is rejected; there is no raw webhook event table. | `modules/api.js` webhook | A `payment_events` table records every call (verified or not, result, transaction ID), without storing secret headers. |
| A7 | Medium | The web process is allowed to call Docker (the `docker` group ≈ root). | `runner/py-runner.js` | Proposal (separate, optional phase): split out a `runner-daemon` running as its own user; the web process calls it over a Unix socket with a fixed "run code" API — the web process no longer has Docker access. |
| A8 | Low | Rate limits are stored in memory and lost on restart; only correct with a single process. | `server.js` `hit()` | Keep (1 process). Note it in the documentation; AI usage and license limits are counted in the database, so they are unaffected. |
| A9 | Low | There is no email system (no SMTP). The "bilingual email" requirement has no foundation yet. | — | Bilingual in-app notifications first; email is a later phase (requires you to choose a mail delivery service). |
| A10 | Info | Hash routing → `/vi/lessons/...` URLs can only apply to **server-rendered public pages** (SEO). Inside the app it remains hash routes + a VI/EN button. | `public/js/main.js` | SEO pages: `/vi/...` and `/en/...` + `hreflang` + canonical. Old `/bai-hoc/...` URLs redirect 301 to `/vi/...`. |

## 4. Bilingual workload (realistic estimate)

| Group | Count |
|---|---|
| Vietnamese UI strings in `public/js` | ~2,300 strings (rough count based on accented characters) |
| API error messages in `server.js` + `modules/` | ~150 messages |
| 44-chapter curriculum | ~72,000 characters, 478 exercise prompts, 88 multiple-choice questions |
| Lessons | 10 lessons × 10 parts |
| Policy pages | 5 pages |

Proposal: an i18n framework (`public/locales/vi.json`, `en.json`, a `t()` function on both client and server, a `users.lang` field) + a `content_translations` table with a `draft → reviewed → published` status. English translations of content can be drafted by AI and are **only shown once an administrator approves them**. Python code, variable names, and expected inputs/outputs stay unchanged (not translated); only exercise prompts, explanations, and reader-facing comments are translated.

## 5. Modules to add

| Module | Main content |
|---|---|
| `entitlements` | Multi-source access table, a centralized `can(user, feature)` function, `GET /api/me/entitlements`, grant/revoke log. |
| `licenses` | Teacher plans (Starter 10 / Standard 30 / School 100), `license_seats` reserved inside a transaction, expiry → class-granted access expires. |
| `family` | Family plan with 4 seats, the plan owner invites/removes members, members opt in to sharing progress. |
| `classrooms` | Classes, join codes, invite links, approve/suspend/remove members, multiple classes per student, close/archive classes. |
| `assignments` | Assign from the library (478 exercises + lessons + teacher-created exercises), to the whole class or individual students, due dates, resubmission, automatic grading + manual grading/feedback. |
| `class-tests` | Teacher-selected questions, duration, due date, number of attempts, question shuffling, automatic grading, history. |
| `reports` | Progress, average score, completion rate, unfinished work, weak chapters; Excel export (self-generated .xlsx, no external library) and PDF (print-optimized page + the browser's Print → Save as PDF). |
| `i18n` | As in section 4. |
| `ai-tutor` (extended) | Site-wide floating widget, 3 modes Student / Teacher / English Tutor, minimal page context, blocked during tests, quotas based on entitlements, enabled/disabled per plan. |
| `admin` (separated permissions) | Dedicated `admin` role, management of plans/prices/plan features (`plan_features`), licenses, bilingual content. |

## 6. Planned migrations (additions only, no deleting/modifying existing data)

| ID | Content |
|---|---|
| `004_roles_admin` | Add the `admin` and `parent` role values; convert existing `teacher` → `admin` (keeping a copy of the old role in `audit_logs` for undo). `users.lang` (default `vi`). |
| `005_entitlements` | `entitlements` (user_id, feature, source_type ∈ personal/class/family/admin_grant/staff, source_id, starts_at, expires_at, status, granted_by), `plan_features`; copy active `subscriptions` → `personal` entitlements. |
| `006_plans_v2` | `plans` gains `kind` (pro/family/teacher), `seats`, `quote_only`; seed Family and 3 Teacher tiers (prices configurable). |
| `007_licenses` | `licenses`, `license_seats` (UNIQUE license_id + user_id), FK to orders. |
| `008_family` | `family_groups`, `family_members` (invite/active/removed, `share_progress`). |
| `009_classrooms` | `classrooms`, `class_members`, `class_invites`. |
| `010_assignments` | `assignments`, `assignment_targets`, `assignment_submissions` (machine score, manual score, feedback). |
| `011_class_tests` | `class_tests`, `class_test_questions`, `class_test_attempts`. |
| `012_i18n` | `content_translations` (content_type, content_id, lang, field, text, status, reviewed_by), `ui_translations` (UI string overrides). |
| `013_payment_events` | Raw webhook log. |

Each migration runs in a transaction and has a `down`; before running, the server automatically backs up `app.db` as `app.db.pre-<id>` (new addition).

## 7. Compatibility risks

1. **Converting the teacher role → admin (A1):** current administrator accounts can still log in and keep all their existing rights. The only risk: if you have a `teacher` account that is *not* an administrator (a real teacher), it will become admin. You need to confirm the list before migrating (section 9).
2. **Pro access moving to entitlements:** legacy data is copied in the same transaction; a test compares every user's Pro status before/after the migration.
3. **Bilingual SPA with ~2,300 strings:** replace strings screen by screen, one group per commit, rerunning e2e after each group to avoid breaking the UI.
4. **SEO URLs changing to `/vi/...`:** keep 301 redirects from the old URLs so rankings are not lost.
5. **Workload:** this is a large body of work (estimated 8 phases, ~25–30 commits). Done sequentially, each phase with its own tests and zip package so you can deploy part by part.

## 8. Commit-by-commit implementation plan

| Phase | Commit | Accompanying acceptance tests |
|---|---|---|
| 0 | Automatic database backup before migrations; fix A2 (block AI during tests); fix A5 (clean user deletion) | test that AI is blocked during tests; deleting a user leaves no orphaned rows |
| 1 | `004_roles_admin` + separate admin/teacher permissions in all old and new APIs | Teacher calling any `/api/admin/*` → 403 (criterion 6) |
| 1 | `005_entitlements` + centralized `can()`, replacing `membership()` | Criteria 1, 4; Pro status identical before/after migration (13) |
| 2 | `006_plans_v2` + `007_licenses` + buying/renewing Teacher licenses through the existing orders | Criteria 5, 8 (exceeding seat count is rejected, seats reserved in a transaction) |
| 2 | `008_family` + invite/remove members, family-based Pro | Members get Pro; leaving the family only removes family-granted access |
| 3 | `009_classrooms` + Teacher Dashboard (overview, classes, invite codes/links, approval, suspension) | Criteria 2, 3, 6 |
| 4 | `010_assignments` + assign/submit/grade/feedback | Criterion 7 (cannot view other people's submissions), IDOR |
| 4 | `011_class_tests` + reports + Excel/PDF export | Automatic grading, attempt limits, xlsx file opens |
| 5 | i18n framework + VI/EN UI screen by screen + `users.lang` | Criterion 9 (e2e runs in both languages) |
| 5 | `012_i18n` + content translation workflow with review + SEO pages `/vi` `/en` + hreflang | Unapproved drafts are not shown |
| 6 | Floating AI widget + 3 modes + page context + entitlement-based access | Criterion 10; no data leaks beyond scope |
| 7 | `013_payment_events` + webhook review (receiving account required, raw log) | Criteria 11, 12 |
| 8 | Admin Dashboard: plans/features/prices, licenses, bilingual content, users with 4 roles | Full regression (14) |
| (optional) | Split runner-daemon out of the web process (A7) | Web process no longer has Docker access |

## 9. Decisions needed from you before starting

1. Are **all existing `teacher` accounts** administrators (to be converted to `admin`)? Or are there real teachers who should stay `teacher`?
2. **Family plan prices** (4 members) for 1 month / 3 months / 1 year? Defaults can be used and edited later in Admin.
3. Do **students in a licensed class** get full Pro, or Pro only for teacher-assigned content? (Proposal: full Pro for the duration of the license.)
4. **Translating content into English:** use AI to draft all 478 exercises + 10 lessons for you to review gradually, or translate only the UI + lessons first?
5. **PDF reports:** accept "print-optimized page → Print → Save as PDF" (keeping no external library dependency), or is a directly downloadable PDF required (which would mean vendoring a PDF library + a Vietnamese font)?
6. **Payments:** keep both modes (personal QR with manual confirmation and automatic SePay) as in 3.2.1?
