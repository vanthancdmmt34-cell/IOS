# DATABASE_DESIGN — Python Lab 3.0.0

SQLite `data/app.db`, `PRAGMA foreign_keys = ON`. Existing tables remain unchanged. New tables are created via migrations (see `db/migrations.js`).

## Existing Tables (Unchanged Schema)
`users`, `sessions`, `submissions`, `exam_settings`, `custom_exercises`, `exam_attempts`, `site_stats`, `ratings`, `user_prefs`, `announcements`, `site_settings`.
Only change: added `users.email TEXT NULL` + a partial unique index (`WHERE email IS NOT NULL AND email <> ''`) to prepare for future email login; not yet used.

## New Tables

| Table | Keys / Constraints | Purpose |
|---|---|---|
| `schema_migrations(id PK, applied_at)` | | Tracks applied migrations. |
| `plans(id PK, name, months>0, price_vnd>=0, active, sort, created_at)` | | Subscription plans. Defaults: `pro_1m` (59,000 VND), `pro_3m` (159,000 VND), `pro_12m` (499,000 VND). |
| `subscriptions(id, user_id FK users CASCADE, plan_id FK plans, status ∈ active/canceled/expired/revoked, starts_at, expires_at, renew_reminder, source ∈ order/manual/admin, order_id FK orders SET NULL, note, created_at)` | `idx(user_id, expires_at)` | Individual membership periods. `canceled` = renewal reminders disabled, but access remains active until `expires_at`. |
| `orders(id, code UNIQUE, user_id FK CASCADE, plan_id FK, amount_vnd, status ∈ pending/paid/expired/canceled, created_at, expires_at, paid_at, payment_id)` | `idx(user_id, created_at)`, `idx(status, created_at)` | Purchase orders. Price is locked in when the order is created. |
| `payments(id, provider, provider_txn_id, order_id FK SET NULL, amount_vnd, content, status ∈ matched/unmatched/mismatch/ignored/manual, note, raw_json, received_at)` | **UNIQUE(provider, provider_txn_id)** | All incoming payment transactions (including unmatched ones) for reconciliation and idempotency. |
| `ai_conversations(id, user_id FK CASCADE, title, exercise_id, created_at, updated_at)` | `idx(user_id, updated_at)` | AI conversation history. |
| `ai_messages(id, conversation_id FK CASCADE, role ∈ user/assistant, content, created_at)` | `idx(conversation_id, id)` | Individual messages within an AI conversation. |
| `ai_usage(id, user_id FK SET NULL, model, mode, input_tokens, output_tokens, cost_usd_micro, ok, error, created_at)` | `idx(user_id, created_at)`, `idx(created_at)` | Tracks request counts, tokens, and cost (integer micro-USD). |
| `lesson_progress(user_id FK CASCADE, lesson_id, quiz_score, quiz_total, completed_at, updated_at)` | `PK(user_id, lesson_id)` | Highest quiz score and completion timestamp per lesson. |
| `lesson_practice(user_id FK CASCADE, lesson_id, exercise_id, passed, attempts, code, first_passed_at, updated_at)` | `PK(user_id, exercise_id)` | In-lesson practice exercise progress. |
| `audit_logs(id, actor_id, action, target, detail, ip, created_at)` | `idx(created_at)` | Audit log: `order.create`/`cancel`, `payment.matched`/`assign`, `order.manual_confirm`, `pro.grant`/`revoke`, `plan.update`, `settings.update`, `subscription.*`, `webhook.rejected`. |

Also added index `idx_sub_ex ON submissions(exercise_id)` for statistics queries.

## Conventions
- Timestamps are stored as ISO 8601 UTC strings.
- Currency amounts are stored as integer VND; AI costs are stored as integer micro-USD to avoid floating-point rounding errors.
- User deletion: learning progress, orders, and subscriptions cascade on delete (`CASCADE`); bank transactions are retained with `order_id = NULL` for accounting reconciliation; `ai_usage.user_id` is set to `NULL`.
