# SECURITY_CHECKLIST — Before Enabling Pro Sales in Production

## Server
- [ ] Back up `data/app.db` and `data/secret.key` before every update (see `DATABASE_MIGRATION_GUIDE.md`).
- [ ] `HOST=127.0.0.1` (default). Only nginx is exposed; the firewall blocks port 8082.
- [ ] `TZ=Asia/Ho_Chi_Minh` (the daily AI quota uses server time).
- [ ] `NODE_ENV` is not `development` and `ALLOW_RESET_TOKEN_IN_RESPONSE` is not `1`. Otherwise password-reset tokens are returned in API responses.
- [ ] PM2 runs `instances: 1` (rate limits are kept in memory).
- [ ] HTTPS is enabled and nginx forwards `X-Forwarded-Proto` and `X-Forwarded-For`.
- [ ] The process runs under a dedicated non-root user.
- [ ] `METRICS_TOKEN` is set to a long random value, and `/internal/metrics` is reachable only from loopback or the internal network.

## Secrets
- [ ] Enter Gemini, AssemblyAI, SePay and SMTP secrets in Admin (stored encrypted), or in the PM2 config file with mode 600. Never commit them to Git.
- [ ] Back up `data/secret.key` together with `data/app.db`. If the key file is lost, every secret must be entered again.
- [ ] Use a strong admin password. Changing a secret key requires re-entering the admin password.
- [ ] Restrict the Google AI Studio key and set a spending limit in Google Cloud Billing.
- [ ] Set `AI_MONTHLY_BUDGET_USD` to match your budget.

## Payments
- [ ] Fill in bank name, account number, account holder name, support contact and business entity name in Admin.
- [ ] For SePay, use HMAC-SHA256 with `SEPAY_WEBHOOK_SECRET` (or an API key). Webhook URL: `https://<domain>/api/pay/sepay/webhook`.
- [ ] Without a configured secret or API key, every webhook is rejected.
- [ ] Make one small live transaction. Confirm the order becomes paid and the audit log records it.
- [ ] Replay the same webhook. It must not add duplicate subscription days.
- [ ] Have a legal professional review the policy pages before launching sales.

## Email
- [ ] Configure SMTP and test "forgot password". Leave `SMTP_HOST` empty to turn email off.
- [ ] Email verification codes accept at most 5 wrong attempts.

## Operations
- [ ] Daily: resolve "No order code" and "Mismatch" bank transactions.
- [ ] Weekly: review AI costs and the audit log.
- [ ] Back up the database regularly (`npm run db:backup`, or the timer in `deploy/`).
- [ ] Review admin accounts (Admin → Students, filter by role).

## Before deployment
- [ ] `npm test` passes.
