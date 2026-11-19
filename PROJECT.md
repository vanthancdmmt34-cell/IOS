# Project: MyEvolve Study Homepage 8-Section Overhaul

> **Lưu ý (lỗi thời):** tài liệu này ghi lại một đợt thiết kế landing cũ (8 mục, môn lập trình, đường dẫn `#/`). Mã hiện tại dùng đường dẫn `/app/`, sáu ngôn ngữ và không còn môn lập trình. Báo cáo hiện hành: `docs/AUDIT_FULL_2026-11-19.md`.

## Architecture
- **Runtime**: Pure Node.js (`node:http`, Node >= 22) without Express.
- **SSR Pipeline**: `server.js` serves `public/index.html` on `GET /` with template token replacements (`__VERSION__`, `__SITE_NAME__`, etc.). Pre-rendered semantic 8 sections inside `<div id="root">` ensure server response contains `<section id="demoBox">`.
- **Client Hydration**: Native ES Modules in `public/js/main.js` and `public/js/landing.js`. Unauthenticated visitors hydrate the pre-rendered landing page without blanking `#root`.
- **Design Tokens**: Warm light yellow and gentle charcoal black palette in `public/css/theme.css` (`#F3F2EB`, `#FFFDF6`, `#F7EBC0`, `#1D1C27`), compiled into `public/css/bundle.min.css` via `tools/build-css.mjs`. Mobile-first 375px responsive layout.
- **Execution & API**: Public endpoint `POST /api/demo/run` handles live Python execution. Client-side quiz evaluation for Japanese demo. Registration modals via `openAuth("register")` in `#modalHost`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Warm Theme & Palette | Light yellow (`#F7EBC0`, `#E9C96A`) + gentle charcoal (`#1D1C27`), warm paper (`#F3F2EB`), no cold dark | M2 | R1 |
| 2 | Mobile-First 375px | Clean responsive layout without horizontal scroll at 375px | M2 | R1 |
| 3 | No Pre-S8 Auth Barrier | No registration modal or auth barrier before Section 8 (cards navigate directly) | M4 | R1, R4 |
| 4 | Section 1 Hero Rotator | H1 rotates every 2.8s across 6 subjects (tiếng Nhật, tiếng Anh, tiếng Trung, tiếng Hàn, tiếng Pháp, lập trình Python) with fade+slide-up | M3 | R2 |
| 5 | Section 1 Hero CTA & Mockup | Large black CTA scrolls to `#demoBox`; chip; subtext; right-hand mockup with 1 Python + 1 Japanese task | M3 | R2 |
| 6 | SSR `<section id="demoBox">` | Raw server HTTP response contains `<section id="demoBox">` with both interactive boxes pre-rendered | M1 | R3 |
| 7 | Section 2 Python Demo | Live editable code runner with `print("Hello")`, executing via `POST /api/demo/run` displaying real output | M3 | R3 |
| 8 | Section 2 Japanese Demo | "Ohayo" nghĩa là gì? with 4 interactive options, immediate feedback | M3 | R3 |
| 9 | Section 2 Conversion Modal | Popup on correct answer: "Bạn làm đúng rồi! Bạn có năng khiếu đấy. Tạo tài khoản để lưu tiến độ nhé?" + "Tạo tài khoản miễn phí" button | M3 | R3 |
| 10 | Section 3 Purpose Roadmaps | 3 roadmap cards (Học sinh 6-12, Sinh viên thực tập, Xuất khẩu Nhật/Hàn) auto-navigating to subjects | M4 | R4 |
| 11 | Section 4 9 Subjects Display | 2 groups (Lập trình: Python, C, C++, Java; Ngoại ngữ: Anh, Trung, Nhật, Hàn, Pháp), level + purpose, no per-card counts | M4 | R4 |
| 12 | Total Summary Line | Single summary line: "9 môn học · 1.881 bài tập có chấm" | M4 | R4 |
| 13 | Elimination of "0 học viên" | Total absence of string "0 học viên" anywhere on the page or templates | M1 | R4 |
| 14 | Section 5 3-Step Methodology | 3 steps (Book, Green Check, Yellow Spaced Repetition) + streak reminder | M4 | R5 |
| 15 | Section 6 Real Stories | 3 learner testimonials (An, Mai, Hùng) with letter avatars | M4 | R5 |
| 16 | Section 7 FAQ & Certification | 6 existing questions + 1 new question on platform certificate | M4 | R6 |
| 17 | Section 8 Final Conversion CTA | Sole mandatory registration CTA section with "Tạo tài khoản miễn phí" | M3 | R6 |
| 18 | Footer Clean Contacts | Display `study@liferivo.com` + Facebook + Threads; hide personal Gmail and Zalo | M1 | R6 |
| 19 | Metadata & og:image | `og:image` and `twitter:image` set to `https://study.liferivo.com/og-image.png` | M1 | R6 |
| 20 | Build Script & CI Verification | `"build"` script in `package.json` and automated verification test suite | M1, M5 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | SSR Shell, Layout & Metadata | `public/index.html`, `package.json`, metadata `og:image`, footer contacts, "0 học viên" removal | none | DONE (Verified: Gate PASS, 75/75 tests pass, 0 "0 học viên", SSR demoBox present) |
| M2 | Design Tokens & Responsive CSS | `public/css/theme.css`, `bundle.min.css`, mobile-first 375px styles, animations | M1 | DONE (Verified: Gate PASS, 100/100 tests pass, bundle synchronized) |
| M3 | Interactive Sections (S1, S2, S8) | `public/js/landing.js`, Hero rotator (2.8s), Section 2 Python runner, Japanese quiz, conversion popup, Section 8 CTA | M1, M2 | DONE (Verified: Gate PASS, 179/179 tests pass, genuine sandboxes, 0 '0 học viên') |
| M4 | Content Sections & Navigation (S3-S7) | `public/js/landing.js`, Section 3 roadmaps, Section 4 9 subjects, Section 5 3-steps, Section 6 stories, Section 7 FAQs | M1, M2 | IN_PROGRESS (sub_orch_m4: 81a383e9-1f6c-43d3-ab78-5fbef05673cc) |
| M5 | Final Verification & Adversarial Hardening | E2E test suite execution (Tiers 1-4) + Tier 5 adversarial testing & audit verification | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### SSR Shell ↔ Client Hydration
- Element IDs: `<section id="demoBox">`, `<div id="root">`, `<div id="modalHost">`, `<section id="hero">`.
- CodeMirror element in Section 2: Textarea / editor container `#demoPyEditor` with default content `print("Hello")`.
- Quiz container in Section 2: `#demoJaQuiz` with 4 option buttons with `data-opt` attributes.
- Result container: `#demoPyOutput` and `#demoJaMsg`.
- Conversion popup: Triggered via `openModal` mounting to `#modalHost`.

### Client Navigation ↔ SPA Router
- Subject cards link to hash routes: `#/hoc` (Python), `#/lap-trinh/:lang` (C, C++, Java), `#/ngoai-ngu/:lang` (en, zh, ja, ko, fr).
- Subject selection persists to `localStorage.setItem("pl:subject", id)` without intercepting with an auth barrier.

### API Contracts
- Python execution: `POST /api/demo/run` with JSON payload `{ code: string }`. Returns `{ status: "ok", output: string, errors: [] }`.

## Code Layout
- `public/index.html`: Base SSR HTML shell, meta tags (`og:image`), pre-rendered 8-section markup.
- `public/css/theme.css`: Core design tokens, warm paper styling, responsive mobile rules, rotator animations.
- `public/css/bundle.min.css`: Compiled CSS bundle generated via `tools/build-css.mjs`.
- `public/js/landing.js`: Landing page rendering and client hydration logic for all 8 sections.
- `public/js/main.js`: Client boot, router, and authentication check.
- `package.json`: Project manifest, scripts (`build`, `test`).
- `tests/`: Automated test suite for SSR, mobile responsiveness, and functionality.
