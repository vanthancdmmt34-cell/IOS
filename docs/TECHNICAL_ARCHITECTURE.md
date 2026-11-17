# TECHNICAL_ARCHITECTURE — Python Lab 3.0.0

## Overview

```
Browser (SPA hash route + pre-rendered SEO pages)
        │ HTTPS
      nginx ──► Node.js server.js (127.0.0.1:8082, 1 process, PM2)
                 ├─ modules/api.js        lessons, dashboard, Pro, orders, SePay webhook, AI, business admin
                 ├─ handleApi (legacy)    login, exercises, exams, leaderboard, class admin, settings
                 ├─ modules/seo.js        /bai-hoc, /bai-hoc/:slug, /bang-gia, 5 policy pages, sitemap
                 ├─ runner/               student code execution
                 │    ├─ py-runner.js  ──► docker run (python:3.12-slim, no network, read-only, 128 MB, 0.5 CPU)
                 │    └─ run-pool.js   ──► worker thread JS interpreter (fallback when Docker is unavailable)
                 ├─ modules/ai.js     ──► Google Gemini API (generateContent), server-side only
                 └─ SQLite data/app.db  (db/migrations.js)
SePay ──webhook (HMAC or API key)──► POST /api/pay/sepay/webhook
```

Core principles: zero external npm runtime dependencies; no framework replacement; all authorization checks enforced on the server.

## Request Handling Order

1. `/api/*` → `moduleApi` (`modules/api.js`). Returns `true` if handled; otherwise falls through to the legacy `handleApi`.
2. Extensionless paths → `renderPublic` (`modules/seo.js`); if unmatched, serves the SPA `index.html`.
3. Static files in `public/`.

## Code Runner (`runner/`)

- `runner/index.js` selects the execution engine at startup: `RUNNER=auto` uses Docker if the image is available, falling back to the JS interpreter otherwise.
- Each run/grade invocation spawns 1 container via `docker run --rm -i` with `--network none --read-only --tmpfs /tmp:rw,noexec,nosuid,size=8m --user 65534:65534 --cap-drop ALL --security-opt no-new-privileges --pids-limit 32 --memory 128m --memory-swap 128m --cpus 0.5 --ulimit fsize,nofile,nproc --log-driver none`. No host directories are mounted, and no host environment variables are passed.
- `runner/harness.py` reads JSON `{code, inputs[], limit, per_test_s}` from stdin, executes each test case in a fresh globals dictionary, enforces per-test timeouts (`SIGALRM`) and output length limits, and returns JSON.
- Queue: `RUN_WORKERS` concurrent containers (default 2), up to 200 queued requests; excess requests immediately return a busy status.
- Python errors are translated into Vietnamese (`runner/py-errors.js`) while preserving the original Python error message.
- Grading preserves existing rules: required coding techniques, anti-hardcoding checks, multiple test cases, and hidden tests that do not leak test data.

## Membership and Payments (`modules/membership.js`)

- Pro entitlement = an existing record in `subscriptions` with status `active` or `canceled` where `starts_at <= now < expires_at`. Entitlement expires automatically without relying on a cron job. The hourly background job only updates status flags for reporting.
- Renewing while still active: the new subscription period starts at the latest existing `expires_at` timestamp (stacked sequentially).
- Orders: code format `PL` + 6 unambiguous characters (excluding `0`/`O`/`1`/`I`), expiring after `orderExpireHours`. Clicking purchase multiple times reuses an existing pending order; maximum 3 pending orders per user.
- `applyPayment` runs inside a `BEGIN IMMEDIATE` transaction: prevents duplicates via `UNIQUE(provider, provider_txn_id)`; outgoing transfer → `ignored`; missing order code → `unmatched`; underpayment / already paid / canceled / expired over 7 days ago → `mismatch`; valid match → marks order `paid` + grants Pro within the same transaction.
- The webhook endpoint returns `{"success": true}` with HTTP 200 for every request with a valid signature (including duplicates) so SePay does not retry delivery.

## AI Tutor (`modules/ai.js`)

- Each AI provider is a function in the `providers` map (currently `gemini`); adding or switching providers only requires implementing `{system, messages, maxOutputTokens, model} → {text, inputTokens, outputTokens}`.
- Primary model `AI_MODEL`, fallback model `AI_FALLBACK_MODEL`.
- Quotas are counted from the `ai_usage` table (successful requests only): daily and monthly limits depend on the user's plan. Failed requests are not counted against quotas.
- Anti-spam rate limits: 6 requests/minute/account, 20 requests/minute/IP. Input and output length limits are configurable in Settings. System-wide monthly cost cap controlled by `AI_MONTHLY_BUDGET_USD`.
- Exercise context is loaded on the server by `exerciseId` rather than trusting problem descriptions sent by the browser. The system prompt instructs the model to provide step-by-step hints rather than giving away a complete solution immediately.

## Guided Lessons (`lessons.js`)

10 lessons, each with 10 sections. Quiz answers, hidden tests, and reference solutions remain strictly on the server. Lesson completion requires passing all practice exercises + answering ≥ 2/3 of quiz questions correctly. Lesson XP is recalculated from the database on each update (10 XP per practice exercise passed for the first time, 10 XP for a perfect quiz score, 20 XP upon lesson completion); no API allows the browser to award XP directly.

## Frontend

`public/js/pro.js` (guided lessons, pricing page, checkout, my plan, AI Tutor), `public/js/admin-biz.js` (Business admin tab), `public/css/public.css` (SEO pages). CSP enforces `script-src 'self'` and allows `img-src https://qr.sepay.vn` for QR images.
