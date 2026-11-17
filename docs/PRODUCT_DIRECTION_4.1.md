# PythonLab 4.1 — Product Direction and Streamlining Plan

## Product Decision

**Model C: Combined Python Learning Platform and LMS.** PythonLab serves two user segments through a unified core experience:

1. Individual learners: learn Python from scratch, practice coding, take assessments, receive feedback, and track progress.
2. Teachers / organizations: manage classrooms, assign exercises, conduct tests, monitor students, and view reports.

Core principle: LMS capabilities must support learning without overshadowing the core Python learning experience.

## Preserved Scope

Do not remove modules or database tables for the following features: classrooms, teachers, students, family groups, licenses, plans, entitlements, AI Tutor, payments, certificates, badges, leaderboards, announcements, and administration. These form the foundational capabilities of the LMS; hiding menu items does not mean removing access rights or data.

Preserve all 44 chapters, 478 exercises, 44 chapter exams, the Docker Python runner, server-side grading, hidden tests, progress tracking, SEO pages, and existing migrations.

## Streamlined Navigation

The student navigation menu is grouped by user workflow rather than listing disconnected features:

- **Overview**: starting point, continue learning, pending assignments, and progress summary.
- **Learn Python**: Guided Lessons; 44-Chapter Python Curriculum; Learning Path.
- **Practice & Assessment**: Code Practice; Exams; AI Tutor; Announcements.
- **Classrooms & Teaching**: Teacher Dashboard, My Students, My Classrooms, Family (role-dependent).
- **Achievements**: Certificates, Badges & Levels, Leaderboard.
- **Account**: Profile, My Plan, Plans & Pricing.

Existing routes are preserved to maintain compatibility with bookmarks and links. Quick search (`Ctrl+K`) continues to find all sections and learning paths.

## Development Priorities

### P0 — Reliability Before Expansion

- Verify live SePay integration in staging: signature verification, payment amount, order code, duplicate webhook protection, and correct plan activation.
- Verify live Gemini integration: quotas, timeouts, provider errors, cost tracking, and AI blocking during exams.
- Load-test the code runner under concurrency; verify queue behavior, timeouts, CPU/RAM limits, and behavior when Docker stops.
- Test SQLite backup restoration and migration rollback.
- Audit role-based access control (`admin` / `teacher` / `student` / `parent`) across both APIs and UI views.

### P1 — Learning Quality Improvements

- [x] Recommend up to 3 previously attempted but unpassed exercises directly on the Overview page; filtered per user account.
- Submission history allowing learners to review submitted code, scores, error messages, and attempt counts.
- Centralized progress hub by chapter / lesson / skill; identify topics needing review.
- Consistent "Continue Learning" flow across Guided Lessons, the 44-Chapter Curriculum, and Learning Paths.
- Mistake review and supplementary topic-based practice exercises.
- AI Tutor receives minimal lesson context, prioritizing step-by-step hints and error explanations over giving away full solutions immediately.

### P2 — LMS Completion

- Transactional emails for account verification, password reset, order receipts, and renewal reminders (only after selecting an email provider).
- Assignment / test templates and readable progress reports for teachers.
- Parent progress viewing restricted to students who have explicitly granted sharing consent.
- Complete English content following the draft → review → publish workflow.

### Out of Scope for This Phase

- Do not add a second programming language.
- Do not build social networking features, group chat, livestreaming, or forums.
- Do not add new pricing tiers or commercial variants before gathering real usage data.
- Do not expand gamification in ways that create unhealthy competitive pressure.

## Acceptance Criteria

1. A newly registered user can identify their first lesson and start learning within at most 2 interactions.
2. Returning learners clearly see a "Continue Learning" button and their current progress status.
3. Every submission produces transparent grading feedback; score data cannot be tampered with from the browser.
4. Teachers can only access classrooms and students within their authorized scope.
5. Parents cannot view student code or passwords; progress sharing follows an explicit consent mechanism.
6. Duplicate webhooks never grant a subscription twice; webhooks with invalid signatures or mismatched amounts never activate a plan.
7. When the code runner or AI encounters an error, the system returns an understandable message and never loses the student's work.
8. Every schema change includes a corresponding migration, backup, rollback path, and automated test.

## Scope of Changes in This Streamlined Release

- Restructured student menu labels and groupings; added a direct entry point for AI Tutor.
- Updated `Ctrl+K` quick search to match the new navigation terminology.
- Added review recommendations on the Overview page based on unpassed submissions (no database migration required).
- No routes, APIs, modules, database tables, plans, or permissions were removed.
- No payment, AI, security, or user data configurations were modified.

This release is a safe navigation and product alignment upgrade; the P0/P1/P2 items represent the upcoming roadmap and should not be mistaken for already-implemented features.
