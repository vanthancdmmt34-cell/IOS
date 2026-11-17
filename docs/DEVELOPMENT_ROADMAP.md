# DEVELOPMENT_ROADMAP — Python Lab

## Completed in 3.0.0 (7 Phases)
| Phase | Content | Status |
|---|---|---|
| 1. Audit + Bug Fixes | Real Python runner, fixed 15 incorrect expected outputs, reversible migrations, audit logs | Done |
| 2. Core Learning | 10-part deep-dive lessons, server-graded practice with hidden tests, quick quizzes, progress tracking, overview cards, server-side XP | Done |
| 3. Free/Pro | Plans, sequential membership period stacking, server-side entitlement checks, My Plan page, renewal reminder opt-out | Done |
| 4. AI Tutor | Server-side Gemini integration, 6 modes, plan-based quotas, anti-spam, token/cost tracking, chat history | Done |
| 5. Payments | Orders, order codes, VietQR, SePay HMAC/API key webhook, deduplication, manual confirmation with reconciliation | Done (live SePay not yet tested) |
| 6. Administration | Real revenue/conversion/AI analytics, orders, transactions, mismatched transaction assignment, plans & pricing, grant/revoke Pro, logs | Done |
| 7. Testing + Release | 72 API/unit tests, 93 UI checks, 522 + 50 solutions verified against real Python, documentation | Done |
| SEO + Legal | Pre-rendered lesson/pricing pages, schema.org, sitemap, 5 policy pages | Done (policies require website owner/legal review) |

## Recommended Next Steps (in Priority Order)
1. **Staging with live SePay + live Gemini** (1 session): configure the webhook, make a small real transfer, verify plan activation; ask the AI several questions and reconcile costs in the admin panel against Google AI Studio.
2. **Email** (via SMTP or a service like Resend/Brevo): payment confirmation, renewal reminder 7 days before expiration, self-service password reset. Currently, renewal reminders are only shown in-app.
3. **Additional Lessons**: Stage 2 currently has 4 lessons; add files, modules, list comprehensions, and recursion; Stage 3 (mini-projects, algorithms).
4. **Hidden Tests for the 478 Existing Exercises**: use `tools/check-content-python.mjs` to generate and verify new test suites against real Python.
5. **E-invoicing / E-commerce Website Notification** as required by regulations once revenue grows (requires legal consultation).
6. Two-factor authentication (2FA) for admins; separate the `admin` role from `teacher`.
7. For high concurrent user loads: increase `RUN_WORKERS`, move code execution to a dedicated runner host, and use gVisor.

## Estimated Monthly Operating Budget (300,000–800,000 VND/month)
| Item | Estimate |
|---|---|
| VPS 2 vCPU / 4 GB (sufficient for Node + 2 concurrent Docker containers) | 150,000–300,000 VND |
| Gemini `gemini-3.1-flash-lite` ($0.25/1M input tokens, $1.50/1M output tokens). One turn ~1,500 input + 400 output tokens ≈ $0.000975. 20,000 turns/month ≈ $19.50 ≈ 500,000 VND | Set `AI_MONTHLY_BUDGET_USD` to cap spending |
| SePay plan matching transaction volume | Per SePay pricing |
| Domain name | ~25,000 VND/month (amortized) |

Gemini pricing is from https://ai.google.dev/gemini-api/docs/pricing (accessed 30/10/2026); verify current rates before deployment.
