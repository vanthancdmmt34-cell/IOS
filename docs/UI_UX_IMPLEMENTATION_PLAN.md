# UI_UX_IMPLEMENTATION_PLAN — MyEvolve Study UI upgrade plan

Based on `docs/PROJECT_AUDIT.md`. Guiding principle throughout: **no changes to the API, database, or business logic**; no fake data;
no buttons without a working function. Anything that needs a new API or table goes in the "Proposals requiring backend" section at the end of this document and is not done yet.

## Technical constraints from the audit

- The app uses no framework and has no build step, so "components" are implemented as **shared CSS classes + JS helper functions**
  (`core.js`), not React/Vue components. No framework migration.
- Colors go through CSS variables. New design tokens are declared in one place (the `MyEvolve` block at the end of `public/css/ui-unified.css`) and every page inherits them.
- The current icon set is hand-drawn 24px stroke icons, in the same style as Lucide. Replacing them with the actual Lucide files requires downloading an external package, so this is **not done yet**;
  this phase keeps a single set and gradually removes emoji.
- There are no automated tests: each phase ends with manual testing per role, recorded in `docs/CHANGELOG.md`.

## Mapping requirements → existing features

| Requirement in the brief | Corresponding existing feature | Notes |
|---|---|---|
| Course discovery | Subject picker screen (`#/?chon=1`), Python curriculum (`#/hoc`) | 9 fixed subjects, no images, instructors, or duration |
| My courses | Per-subject overview (`#/`) | Per-subject progress already exists |
| Learning path | `#/lo-trinh`, `#/ke-hoach`, foreign-language level path | |
| Assignments, tests | Class assignments (`#/lop`), `#/kiem-tra`, level tests | |
| Achievements | Certificates, badges, leaderboard | |
| AI Study Assistant | `#/ai`, floating assistant, AI conversation and interview | |
| Classroom | Theory page + exercises; Python lessons (`#/bai-hoc/:id`) | No video |
| Teacher: classes, assignments, grading, reports | `#/giao-vien`, `#/giao-vien/lop/:id`, `#/giao-vien/hoc-vien` | No course management / lecture upload |
| Administration | `#/quan-tri` (multiple tabs), `#/quan-tri-ngoai-ngu` | |
| Schedule, Community, Notes, Video | **Not available** | See proposals at the end of the document |

## Phase 1 — Audit (done)

`docs/PROJECT_AUDIT.md`, this document.

## Phase 2 — Branding and design system

1. Default name **MyEvolve Study**, tagline *Learn today. Evolve tomorrow.*, primary color `#526BFF` — changed via default settings
   and the `LEGACY_DEFAULTS` mechanism (values an administrator has set manually are preserved).
2. Logo: SVG icon (ascending steps) + the wordmark **MyEvolve** and the label **STUDY**; uses `currentColor` so it works on both light and dark backgrounds. New favicon.
3. Inter font (supports Vietnamese), keeping JetBrains Mono for code.
4. Light / dark color tokens matching the required palette; declare missing variables (`--surface`, `--card`, `--muted`…) to eliminate hard-coded fallback colors.
5. Light / dark mode: `theme-init.js` reads the saved choice, falls back to the OS setting if none, and applies it before painting to avoid flashing; toggle button in the top bar and on the landing page.
6. Applied to every role via shared CSS classes: sidebar, top bar, buttons, cards, tables, forms, dialogs, focus states.

Deliberate deviation from the palette: Success / Warning / Danger colors used for **text** are one shade darker
(`#128A6C`, `#B4761A`, `#CF4651`) to meet WCAG AA contrast on white backgrounds; the original colors are still used for backgrounds and borders.

## Phase 3 — Students (partially done in 5.1.0)

Done: general dashboard, course catalog with search and filters, previous / next lesson navigation, copy button for AI answers, shared skeleton and empty / error states.
Remaining: course detail page, Python classroom, assignments, profile, full AI page. Details in docs/CHANGELOG.md.

Original plan:

- Account-level dashboard: greeting, today's goal, 4 metrics, continue learning, learning path, upcoming deadlines, AI, recent activity.
  Real data sources: `/api/dashboard`, `/api/lang`, `/api/code`, `/api/classes`, `/api/notifications`.
  "Total study time" **has no data**, so it is replaced by "number of lessons passed"; no made-up numbers.
- Course catalog: search and filters (group, free / Pro) running client-side on existing data.
- Course detail page, classroom (theory + exercises, previous / next navigation, lesson-list drawer on mobile).
- Assignments, profile, full AI page (copy answers, code highlighting).
- Unified skeleton, empty, and error states.

## Phase 4 — Teachers (not done)

Teacher dashboard (number of classes, number of students, submissions to grade, recent activity from the existing class API), class list, class page, assigning work, grading, reports.

## Phase 5 — Administration (not done)

Admin dashboard, unified data tables (search, filter, sort, paginate within the capabilities of the existing API), settings, reports.

## Phase 6 — Testing (not fully done)

Acceptance checklist from the brief, re-run per role at 1440 / 1280 / 1024 / 768 / 390 / 360 px, light and dark.
The project has no automated build / lint / test to run; E2E tests should be added before a real deployment.

## Proposals requiring backend (not implemented on our own)

| Feature | What is needed |
|---|---|
| Schedule | Schedule / event table, read-write API |
| Community, per-lesson discussion | Post and comment tables, moderation |
| Per-lesson notes | Notes table per user and lesson |
| Lecture videos, document upload | File storage, upload API, access control |
| Course cover image, instructor, duration | Add fields to courses |
| Total study time | Record study session time |
| Save light / dark preference per account | Add a field to `prefs` (currently stored in the browser) |
| Bulk actions in administration | List-based action API |
