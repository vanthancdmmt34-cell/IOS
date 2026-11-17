# PROJECT_AUDIT — Source Code Audit Prior to MyEvolve Study UI Upgrade

Audit date: 11/11/2026 · Source version: 4.15.0 · Scope: entire project directory (read-only).
The lists of pages, APIs, and database tables below were extracted automatically from the source code; a `?` in the Method column means the extractor could not determine the HTTP method on the same line (refer to the handler file for details).

## 1. Current Architecture

| Category | Current Status |
|---|---|
| Frontend | Vanilla JavaScript SPA (ES modules), no framework, no build step. Each page is a `pageXxx(main, params, query, ctx)` function that renders HTML via template strings. |
| Routing | Hash router in `public/js/main.js` (`ROUTES` table, 57 route patterns). |
| Backend | Node.js 22+, native `node:http`, single entry file `server.js` (~1,900 lines) + `modules/*.js`. No Express. |
| Database | SQLite (`node:sqlite`, default, `data/app.db`) or PostgreSQL when `PGDATABASE` is set. 60 tables. |
| Authentication | Server-side sessions stored in the `sessions` table, `hoc_session` cookie (HttpOnly). No JWT. All state-changing requests require the `X-CSRF-Token` header. |
| Authorization | `users.role` column: `student`, `parent`, `teacher`, `admin`. Plan entitlements (Pro, Family, Teacher) managed via `modules/entitlements.js`. The server enforces permissions on every API endpoint; the UI only toggles visibility. |
| Code Grading | Python: JS interpreter or Docker (Judge Service, optional BullMQ queue). C/C++/Java: Docker. Foreign languages: graded server-side. |
| AI | Google Gemini via `modules/ai.js` (AI tutor), `modules/speaking.js` (conversation, interview, pronunciation coaching), and `modules/tts.js` (text-to-speech). |
| UI Internationalization | Vietnamese is the source language; English is translated client-side using the `public/locales/en.json` dictionary and `public/js/lang-en.js` rules. |
| CSS | `app.css` (117 KB) → `ui-unified.css` (override layer, ~120 KB) → `speak.css`. Public SSR pages use `public.css`. Colors are defined via CSS custom properties (`--paper`, `--ink`, `--tim`, etc.). |
| Dark Mode | Dark mode color variables exist in CSS, but `theme-init.js` and `core.js` currently **force light mode**; there is no theme toggle button yet. |
| Build / Lint / Test | No build step, no linter configuration. `package.json` defines `npm test`, but the **`tests/` directory does not exist** in the current repository. |

Largest frontend files:

| File | Size |
|---|---|
| public/js/pages.js | 141 KB |
| public/css/app.css | 114 KB |
| public/css/ui-unified.css | 112 KB |
| public/js/lang.js | 81 KB |
| public/js/admin.js | 76 KB |
| public/js/classroom.js | 61 KB |
| public/js/speak.js | 56 KB |
| public/js/pro.js | 52 KB |
| public/js/landing.js | 41 KB |
| public/js/admin-biz.js | 40 KB |
| public/js/code.js | 31 KB |
| public/js/teacher-students.js | 28 KB |
| public/js/main.js | 27 KB |
| public/js/msg-en.js | 27 KB |

## 2. Page Inventory (Extracted from `ROUTES`)

Pre-login views: landing page (`public/js/landing.js`), login / registration modals, and server-rendered public SEO pages (`modules/seo.js`): `/vi|en/lessons`, `/vi|en/lessons/:slug`, `/vi|en/pricing`, `/vi|en/terms|privacy|payment|refund|membership`.

| Route Pattern | Area | Page Function | Roles Visible in Menu |
|---|---|---|---|
| `#/` | Home / Subject Overview | `pageHome` | all authenticated users |
| `#/tong-quan` | Python Overview | `pageDashboard` | all authenticated users |
| `#/ngoai-ngu` | Foreign Languages | `pageHome` | all authenticated users |
| `#/ngoai-ngu/bai/([\w-]+)` | Foreign Languages | `pageLangExercise` | all authenticated users |
| `#/lap-trinh/(c|cpp|java)(?:/([\w-]+))?` | C/C++/Java Programming | `pageCodeCourse` | all authenticated users |
| `#/lap-trinh/bai/([\w-]+)` | C/C++/Java Programming | `pageCodeExercise` | all authenticated users |
| `#/lap-trinh/chung-nhan-cua-toi/(c|cpp|java)` | Certificates | `pageCodeCertList` | all authenticated users |
| `#/lap-trinh/chung-nhan/(c|cpp|java)/([\w-]+)` | Certificates | `pageCodeCertificate` | all authenticated users |
| `#/lap-trinh/xep-hang/(c|cpp|java)` | Leaderboard | `pageCodeLeaderboard` | all authenticated users |
| `#/lap-trinh/huy-hieu/(c|cpp|java)` | Badges | `pageCodeBadges` | all authenticated users |
| `#/lap-trinh/ly-thuyet/(c|cpp|java)/(\d+)` | C/C++/Java Programming | `pageCodeTheory` | all authenticated users |
| `#/ngoai-ngu/luyen-viet/(zh|ja|ko)/([\w-]+)` | Foreign Languages | `pageLangWrite` | all authenticated users |
| `#/ngoai-ngu/luyen-noi/([a-z]+)` | Foreign Languages | `pageSpeakHub` | all authenticated users |
| `#/ngoai-ngu/luyen-noi/([a-z]+)/([\w-]+)/(tu|cau|doan)(?:/([\w-]+))?` | Foreign Languages | `pageSpeakStudio` | all authenticated users |
| `#/ngoai-ngu/tro-chuyen/([a-z]+)(?:/([\w-]+))?` | Foreign Languages | `pageSpeakChat` | all authenticated users |
| `#/ngoai-ngu/on-tap/([a-z]+)` | Foreign Languages | `pageLangReview` | all authenticated users |
| `#/ngoai-ngu/chung-nhan-cua-toi/([a-z]+)` | Certificates | `pageLangCertList` | all authenticated users |
| `#/ngoai-ngu/xep-hang/([a-z]+)` | Leaderboard | `pageLangLeaderboard` | all authenticated users |
| `#/ngoai-ngu/huy-hieu/([a-z]+)` | Badges | `pageLangBadges` | all authenticated users |
| `#/ngoai-ngu/chung-nhan/([a-z]+)/([\w-]+)` | Foreign Languages | `pageLangCertificate` | all authenticated users |
| `#/ngoai-ngu/ly-thuyet/([a-z]+)/([\w-]+)/([\w-]+)` | Foreign Languages | `pageLangTheory` | all authenticated users |
| `#/ngoai-ngu/([a-z]+)(?:/([\w-]+))?` | Foreign Languages | `pageLangCourse` | all authenticated users |
| `#/quan-tri-ngoai-ngu` | Administration | `pageLangAdmin` | admin |
| `#/hoc` | Python Curriculum | `pageCatalog` | all authenticated users |
| `#/hoc/nhom/([\w-]+)` | Python Curriculum | `pageCatalog` | all authenticated users |
| `#/chuong/([\w-]+)` | Python Curriculum | `pageChapter` | all authenticated users |
| `#/bai/([\w-]+)` | Python Curriculum | `pageExercise` | all authenticated users |
| `#/lo-trinh` | Learning Paths | `pagePaths` | all authenticated users |
| `#/lo-trinh/([\w-]+)` | Learning Paths | `pagePath` | all authenticated users |
| `#/kiem-tra` | Exams | `pageExams` | all authenticated users |
| `#/thi/([\w-]+)` | Exams | `pageExam` | all authenticated users |
| `#/san-choi` | Code Playground | `pagePlayground` | all authenticated users |
| `#/xep-hang` | Leaderboard | `pageLeaderboard` | all authenticated users |
| `#/chung-nhan` | Certificates | `pageCertificate` | all authenticated users |
| `#/ca-nhan` | Profile | `pageProfile` | all authenticated users |
| `#/tien-do` | Progress | `pageLearningProgress` | all authenticated users |
| `#/huy-hieu` | Badges | `pageBadges` | all authenticated users |
| `#/thong-bao` | Notifications | `pageNotices` | all authenticated users |
| `#/dat-lai-mat-khau` | Reset Password | `pageResetPassword` | all authenticated users |
| `#/bai-hoc` | Python Lessons | `pageLessons` | all authenticated users |
| `#/ke-hoach` | Personal Learning Plan | `pageLearningCenter` | all authenticated users |
| `#/ho-tro` | Help & Support | `pageLearningHelp` | all authenticated users |
| `#/bai-hoc/([\w-]+)` | Python Lessons | `pageLesson` | all authenticated users |
| `#/bang-gia` | Pricing | `pagePricing` | all authenticated users |
| `#/goi-cua-toi` | My Plan | `pageMyPlan` | all authenticated users |
| `#/ai(?:/(\d+))?` | AI Tutor | `pageAi` | all authenticated users |
| `#/lop` | Classrooms (Student) | `pageMyClasses` | all authenticated users |
| `#/lop/(\d+)` | Classrooms (Student) | `pageClass` | all authenticated users |
| `#/tham-gia/([\w-]+)` | Classrooms (Student) | `pageJoinLink` | all authenticated users |
| `#/bai-giao/(\d+)` | Classrooms (Student) | `pageAssignment` | all authenticated users |
| `#/kiem-tra-lop/(\d+)` | Classrooms (Student) | `pageClassTest` | all authenticated users |
| `#/giao-vien` | Teacher Portal | `pageTeacher` | teacher, admin |
| `#/giao-vien/hoc-vien` | Teacher Portal | `pageMyStudents` | teacher, admin |
| `#/giao-vien/lop/(\d+)` | Teacher Portal | `pageTeacherClass` | teacher, admin |
| `#/in-bao-cao/(\d+)` | Teacher Portal | `pagePrintReport` | teacher, admin |
| `#/gia-dinh` | Family Plan | `pageFamily` | parent, Family plan owner, admin |
| `#/quan-tri(?:/([\w-]+))?(?:/(\d+))?` | Administration | `pageAdmin` | admin |

## 3. Active Features

- **Accounts**: registration, login, logout, password reset, user profile, UI language selection.
- **Python Programming**: 44 chapters, 478 auto-graded exercises, staged interactive lessons, learning paths, personalized study plans, code playground, chapter exams, certificates, badges, leaderboard.
- **C, C++, and Java Programming**: 3 levels × 4 lessons each, code exercises graded against test suites (requires Docker), quizzes, certificates.
- **Foreign Languages** (English, Chinese, Japanese, Korean, French; 5 levels each): grammar/theory, 6 exercise types, reading comprehension, level exams, spaced-repetition flashcard review, character writing practice (CJK), Speaking Studio (curriculum, 20 topics, 20 pronunciation drills), AI conversation and interview roleplay, AI text-to-speech voices.
- **AI**: contextual exercise tutor, inline line-by-line error explanations, plan-based usage quotas.
- **Classrooms**: teachers create classes, invite students via code / link, assign work (Python, foreign languages, C/C++/Java, custom problems), run class tests, grade with rubrics, view reports, export CSV/XLSX; students complete assigned work.
- **Family**: Family plan management, member invitations, progress viewing when shared by members.
- **Commerce**: pricing page, orders, VietQR, SePay webhook integration, Zalo confirmation, Teacher seat licenses.
- **Administration**: user management, system settings, content management, UI translation editor, business/billing analytics, AI usage monitoring, language course management, database backup.
- **Notifications**, daily study reminders, and learning streaks.

Features not present in the codebase (mentioned in the UI upgrade specification): video lectures, study calendar/schedule, community / discussion forums, per-lesson personal notes, course thumbnail images, course instructor profiles, course duration metadata, total study time tracking, lecture material uploads, and bulk actions in admin tables.
Because these features require new backend APIs or database tables, they are documented as proposals in `UI_UX_IMPLEMENTATION_PLAN.md` rather than implemented directly.

## 4. API Inventory (162 Extracted Method + Path Pairs)

**/api/activity** (1)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/activity` | server.js |

**/api/admin** (55)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/admin/backup` | server.js |
| GET | `/api/admin/biz/ai-usage` | modules/api.js |
| GET | `/api/admin/biz/ai-usage.xlsx` | modules/api.js |
| GET | `/api/admin/biz/audit` | modules/api.js |
| GET | `/api/admin/biz/orders` | modules/api.js |
| POST | `/api/admin/biz/orders/:id/confirm` | modules/api.js |
| POST | `/api/admin/biz/orders/:id/reject` | modules/api.js |
| GET | `/api/admin/biz/payment-events` | modules/api.js |
| GET | `/api/admin/biz/payments` | modules/api.js |
| POST | `/api/admin/biz/payments/:id/assign` | modules/api.js |
| GET | `/api/admin/biz/plans` | modules/api.js |
| POST | `/api/admin/biz/plans` | modules/api.js |
| POST | `/api/admin/biz/plans/:id` | modules/api.js |
| GET | `/api/admin/biz/stats` | modules/api.js |
| GET | `/api/admin/biz/users` | modules/api.js |
| POST | `/api/admin/biz/users/:id/(grant|revoke)` | modules/api.js |
| POST | `/api/admin/brand/logo` | server.js |
| GET | `/api/admin/classes` | modules/classroom.js |
| GET | `/api/admin/dbinfo` | server.js |
| POST | `/api/admin/exams/bulk` | server.js |
| POST | `/api/admin/exercises/check` | server.js |
| GET | `/api/admin/export/submissions` | server.js |
| GET | `/api/admin/funnel` | server.js |
| GET | `/api/admin/i18n/content` | modules/api.js |
| ? | `/api/admin/i18n/content/(lesson|chapter)/:id(?:/(publish|unpublish|ai-draft))?` | modules/api.js |
| GET | `/api/admin/i18n/ui` | modules/api.js |
| PUT | `/api/admin/i18n/ui` | modules/api.js |
| GET | `/api/admin/lang` | modules/languages.js |
| PUT | `/api/admin/lang/hidden` | modules/languages.js |
| PUT | `/api/admin/lang/pro` | modules/languages.js |
| POST | `/api/admin/lang/remind-now` | modules/languages.js |
| POST | `/api/admin/lang/units` | modules/languages.js |
| DELETE | `/api/admin/lang/units/(w+)/(w+)/:id` | modules/languages.js |
| GET | `/api/admin/licenses` | modules/classroom.js |
| POST | `/api/admin/licenses` | modules/classroom.js |
| POST | `/api/admin/licenses/:id/revoke` | modules/classroom.js |
| GET | `/api/admin/monitoring` | server.js |
| ? | `/api/admin/notify-test` | modules/api.js |
| GET | `/api/admin/overview` | server.js |
| GET | `/api/admin/pay/preview` | server.js |
| GET | `/api/admin/settings` | server.js |
| PUT | `/api/admin/settings` | server.js |
| POST | `/api/admin/settings/reset` | server.js |
| GET | `/api/admin/system` | modules/api.js |
| PUT | `/api/admin/system` | modules/api.js |
| POST | `/api/admin/system/test-ai` | modules/api.js |
| POST | `/api/admin/system/test-runner` | modules/api.js |
| GET | `/api/admin/teachers` | modules/classroom.js |
| POST | `/api/admin/teachers` | modules/classroom.js |
| ? | `/api/admin/teachers/:id(/transfer)?` | modules/classroom.js |
| GET | `/api/admin/users` | server.js |
| POST | `/api/admin/users` | server.js |
| POST | `/api/admin/users/bulk` | server.js |
| POST | `/api/admin/zalo/command` | server.js |
| POST | `/api/admin/zalo/test` | server.js |

**/api/ai** (4)

| Method | Path | Handler File |
|---|---|---|
| POST | `/api/ai/ask` | modules/api.js |
| GET | `/api/ai/conversations` | modules/api.js |
| ? | `/api/ai/conversations/:id` | modules/api.js |
| GET | `/api/ai/status` | modules/api.js |

**/api/announcements** (1)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/announcements` | server.js |

**/api/assignments** (2)

| Method | Path | Handler File |
|---|---|---|
| POST | `/api/assignments` | modules/classroom.js |
| ? | `/api/assignments/:id(/.*)?` | modules/classroom.js |

**/api/billing** (10)

| Method | Path | Handler File |
|---|---|---|
| POST | `/api/billing/licenses/:id/revoke-student` | modules/api.js |
| POST | `/api/billing/licenses/:id/students` | modules/api.js |
| GET | `/api/billing/licenses/me` | modules/api.js |
| GET | `/api/billing/me` | modules/api.js |
| POST | `/api/billing/orders` | modules/api.js |
| GET | `/api/billing/orders/:id` | modules/api.js |
| POST | `/api/billing/orders/:id/cancel` | modules/api.js |
| POST | `/api/billing/orders/:id/claim` | modules/api.js |
| GET | `/api/billing/plans` | modules/api.js |
| POST | `/api/billing/reminder` | modules/api.js |

**/api/certificate** (1)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/certificate` | server.js |

**/api/classes** (4)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/classes` | modules/classroom.js |
| POST | `/api/classes` | modules/classroom.js |
| ? | `/api/classes/:id(/.*)?` | modules/classroom.js |
| POST | `/api/classes/join` | modules/classroom.js |

**/api/code** (7)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/code` | modules/codecourses.js |
| GET | `/api/code/certificate/(c|cpp|java)/:id` | modules/codecourses.js |
| GET | `/api/code/ex/:id` | modules/codecourses.js |
| POST | `/api/code/ex/:id/submit` | modules/codecourses.js |
| GET | `/api/code/leaderboard/(c|cpp|java)` | modules/codecourses.js |
| POST | `/api/code/run` | modules/codecourses.js |
| GET | `/api/code/theory/(c|cpp|java)/:id` | modules/codecourses.js |

**/api/curriculum** (1)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/curriculum` | server.js |

**/api/dashboard** (2)

| Method | Path | Handler File |
|---|---|---|
| ? | `/api/dashboard` | modules/api.js |
| GET | `/api/dashboard` | modules/api.js |

**/api/demo** (1)

| Method | Path | Handler File |
|---|---|---|
| POST | `/api/demo/run` | server.js |

**/api/exams** (1)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/exams` | server.js |

**/api/family** (7)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/family` | modules/classroom.js |
| POST | `/api/family/invite` | modules/classroom.js |
| POST | `/api/family/leave` | modules/classroom.js |
| GET | `/api/family/members/:id/progress` | modules/classroom.js |
| POST | `/api/family/members/:id/remove` | modules/classroom.js |
| POST | `/api/family/respond` | modules/classroom.js |
| POST | `/api/family/share` | modules/classroom.js |

**/api/funnel** (1)

| Method | Path | Handler File |
|---|---|---|
| POST | `/api/funnel/event` | server.js |

**/api/health** (1)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/health` | server.js |

**/api/integrations** (1)

| Method | Path | Handler File |
|---|---|---|
| POST | `/api/integrations/zalo` | modules/api.js |

**/api/lang** (14)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/lang` | modules/languages.js |
| GET | `/api/lang/certificate/:id/:id` | modules/languages.js |
| GET | `/api/lang/class/:id/report` | modules/languages.js |
| GET | `/api/lang/ex/:id` | modules/languages.js |
| POST | `/api/lang/ex/:id/submit` | modules/languages.js |
| GET | `/api/lang/leaderboard/:id` | modules/languages.js |
| POST | `/api/lang/review` | modules/languages.js |
| GET | `/api/lang/review/:id` | modules/languages.js |
| GET | `/api/lang/speak/:id` | modules/speaking.js |
| POST | `/api/lang/speak/chat` | modules/speaking.js |
| POST | `/api/lang/speak/coach` | modules/speaking.js |
| POST | `/api/lang/speak/score` | modules/speaking.js |
| GET | `/api/lang/theory/:id/:id/:id` | modules/languages.js |
| GET | `/api/lang/write/(zh|ja|ko)/:id` | modules/languages.js |

**/api/language** (2)

| Method | Path | Handler File |
|---|---|---|
| ? | `/api/language` | modules/api.js |
| PUT | `/api/language` | modules/api.js |

**/api/leaderboard** (1)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/leaderboard` | server.js |

**/api/learning** (6)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/learning/assessment/:id` | modules/api.js |
| POST | `/api/learning/assessment/:id/save` | modules/api.js |
| POST | `/api/learning/assessment/:id/submit` | modules/api.js |
| POST | `/api/learning/assessment/start` | modules/api.js |
| POST | `/api/learning/plan/day/:id` | modules/api.js |
| GET | `/api/learning/state` | modules/api.js |

**/api/lessons** (4)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/lessons` | modules/api.js |
| GET | `/api/lessons/:id` | modules/api.js |
| POST | `/api/lessons/:id/practice/:id` | modules/api.js |
| POST | `/api/lessons/:id/quiz` | modules/api.js |

**/api/login** (1)

| Method | Path | Handler File |
|---|---|---|
| POST | `/api/login` | server.js |

**/api/logout** (1)

| Method | Path | Handler File |
|---|---|---|
| POST | `/api/logout` | server.js |

**/api/me** (3)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/me` | server.js |
| ? | `/api/me/entitlements` | modules/api.js |
| GET | `/api/me/entitlements` | modules/api.js |

**/api/notifications** (3)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/notifications` | modules/api.js |
| POST | `/api/notifications/:id/read` | modules/api.js |
| POST | `/api/notifications/read-all` | modules/api.js |

**/api/password** (3)

| Method | Path | Handler File |
|---|---|---|
| POST | `/api/password/change` | server.js |
| POST | `/api/password/forgot` | server.js |
| POST | `/api/password/reset` | server.js |

**/api/pay** (1)

| Method | Path | Handler File |
|---|---|---|
| POST | `/api/pay/sepay/webhook` | modules/api.js |

**/api/prefs** (2)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/prefs` | server.js |
| PUT | `/api/prefs` | server.js |

**/api/profile** (3)

| Method | Path | Handler File |
|---|---|---|
| ? | `/api/profile/lang` | modules/api.js |
| PUT | `/api/profile/lang` | modules/api.js |
| POST | `/api/profile/name` | server.js |

**/api/progress** (1)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/progress` | server.js |

**/api/public** (3)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/public/config` | server.js |
| GET | `/api/public/overview` | server.js |
| GET | `/api/public/ui-translations` | modules/api.js |

**/api/rating** (2)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/rating` | server.js |
| POST | `/api/rating` | server.js |

**/api/register** (1)

| Method | Path | Handler File |
|---|---|---|
| POST | `/api/register` | server.js |

**/api/run** (2)

| Method | Path | Handler File |
|---|---|---|
| POST | `/api/run` | server.js |
| POST | `/api/run/guest` | server.js |

**/api/stats** (1)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/stats` | server.js |

**/api/submissions** (1)

| Method | Path | Handler File |
|---|---|---|
| POST | `/api/submissions/:id/grade` | modules/classroom.js |

**/api/teacher** (5)

| Method | Path | Handler File |
|---|---|---|
| GET | `/api/teacher/bank` | modules/classroom.js |
| GET | `/api/teacher/overview` | modules/classroom.js |
| GET | `/api/teacher/students` | modules/classroom.js |
| POST | `/api/teacher/students` | modules/classroom.js |
| ? | `/api/teacher/students/:id(/password|/lock)?` | modules/classroom.js |

**/api/tests** (1)

| Method | Path | Handler File |
|---|---|---|
| ? | `/api/tests/:id(/.*)?` | modules/classroom.js |

**/api/visit** (1)

| Method | Path | Handler File |
|---|---|---|
| POST | `/api/visit` | server.js |

Database tables (60): `ai_conversations`, `ai_inline_uses`, `ai_messages`, `ai_usage`, `announcements`, `assignment_rubric_scores`, `assignment_rubrics`, `assignment_submissions`, `assignment_targets`, `assignments`, `audit_logs`, `brand_assets`, `class_invites`, `class_members`, `class_test_attempts`, `class_test_questions`, `class_tests`, `classrooms`, `code_progress`, `content_translations`, `custom_exercises`, `entitlements`, `exam_attempts`, `exam_settings`, `exercise_progress`, `family_groups`, `family_members`, `funnel_events`, `lang_progress`, `lang_qstats`, `lang_speak`, `lang_srs`, `learning_activities`, `learning_assessments`, `learning_plan_days`, `learning_plans`, `lesson_practice`, `lesson_progress`, `license_seats`, `licenses`, `notifications`, `orders`, `password_resets`, `payment_events`, `payments`, `plan_features`, `plans`, `ratings`, `run_cache`, `schema_migrations`, `sessions`, `site_settings`, `site_stats`, `submissions`, `subscriptions`, `ui_translations`, `user_prefs`, `user_progress`, `user_streaks`, `users`.

## 5. Permission Matrix

| Area | Guest | student | parent | teacher | admin |
|---|---|---|---|---|---|
| Landing page, pricing, legal policies | yes | yes | yes | yes | yes |
| Python, foreign languages, C/C++/Java (free tiers) | – | yes | yes | yes | yes |
| Advanced levels, Pro lessons | – | by plan | by plan | by plan | yes |
| AI (tutor, conversation, interview) | – | by quota | by quota | by quota | yes |
| My classes, assigned work | – | yes | yes | yes | yes |
| Teacher portal, my students, assignments, grading, reports | – | – | – | yes (own classes) | yes |
| Teacher AI assistant | – | – | – | with active license | yes |
| Family portal | – | when in family plan | yes | when in family plan | yes |
| System, business, and language administration | – | – | – | – | yes |

The first registered account in the system (or the username matching `ADMIN_USERNAME`) is granted the `admin` role. All authorization checks are enforced server-side (`server.js`, `modules/api.js`, `modules/classroom.js`); navigation menu filtering in `main.js` is purely visual.

## 6. Reusable UI Components

There is no external component library; "components" consist of CSS classes combined with helper functions in `public/js/core.js`:
`.btn` (+ `-primary`, `-ghost`, `-danger`, `-sm`, `-lg`), `.icon-btn`, `.sheet`, `.tag`, `.chip`, `.bar`, `.input`, `.field`, `.modal` (`openModal`, `confirmBox`, `promptBox`),
`toast()`, `avatar()`, `icon()` (custom 24px stroke icon set matching Lucide style), `.empty`, `.spin`, `.page-head`, `.sec-head`, `.table`, `.steps`, `.faq`.
Foreign language pages additionally use `.lx-*`, the Speaking Studio uses `.sp-*`, and the landing page uses `.lpn-*`.

## 7. Areas Requiring Redesign

1. **Branding**: update product name, logo, color palette, and typography to MyEvolve Study.
2. **Light / Dark Mode**: remove forced light mode, add a theme toggle button, and audit hardcoded color values.
3. **Student Dashboard**: currently each subject has its own overview page; there is no unified cross-subject account dashboard.
4. **Course Catalog**: the subject selection screen lacks search and filtering controls.
5. **Teacher and Admin Portals**: dense tables and forms; missing role-specific overview dashboards.
6. **Full-Page AI Workspace** (`#/ai`): missing copy-code buttons and syntax highlighting inside responses.
7. **Loading / Empty / Error States**: inconsistent across views; no skeleton loaders yet.

## 8. Upgrade Risks

| Risk | Severity | Mitigation |
|---|---|---|
| No automated test suite | High | Perform manual role-based verification after each phase and record results in `CHANGELOG.md`. |
| Multi-layered CSS overrides (~240 KB) with many hardcoded colors | High | Update colors strictly via CSS variables; append version-tagged override rules rather than making scattered edits. |
| Client-side English translation relies on exact Vietnamese source string matching | Medium | Whenever a Vietnamese UI string is modified, update its corresponding entry in the translation dictionary. |
| Dark mode was previously disabled intentionally | Medium | Audit every major view in dark mode before enabling OS-preference or user-toggled dark mode. |
| Brand name and colors are persisted in the database | Low | Use the existing `LEGACY_DEFAULTS` mechanism so only unmodified legacy defaults are automatically upgraded. |
| Live production deployment at `study.liferivo.com` | – | All changes are performed strictly on the local source tree; nothing is deployed automatically. |
