# SECURITY_REPORT — Python Lab 3.0.0

Status: **[Tested]** automated test passes; **[Reviewed]** code inspected, no dedicated test yet; **[Unverified]** cannot be verified in the development environment.

## Running Student Code
| Control | Status |
|---|---|
| Code does not run in the web process; each execution uses a fresh Docker container removed after completion | [Tested] |
| No network (`--network none`): outbound connections fail | [Tested] `tests/runner.test.js` |
| Read-only root filesystem, only `/tmp` 8 MB `noexec` | [Tested] writing to `/etc` is denied |
| Host environment variables (API keys, webhook secrets) are not exposed | [Tested] |
| Runs as uid 65534 (nobody), all capabilities dropped, `no-new-privileges`, non-privileged, no mounts | [Tested] uid, [Reviewed] flags |
| Per-test time limit + container killed on total timeout | [Tested] infinite loop → timeout |
| 128 MB RAM limit (no swap) | [Tested] allocating 10⁹ elements → out of memory error |
| Process limit of 32 (prevents fork bombs), 64 KB output limit | [Tested] |
| Bounded queue; web server remains responsive under heavy code execution | [Tested] |

**Residual risk (important):** the Node process requires permission to invoke Docker. Membership in the `docker` group is equivalent to root on the host. Recommendation in DEPLOYMENT_GUIDE: run the application under a dedicated user, use rootless Docker, or restrict allowed commands via a socket proxy. Docker shares the host kernel; stronger isolation requires gVisor (`--runtime=runsc`) — [Unverified] in this environment.

## Payments
| Control | Status |
|---|---|
| Webhook verifies HMAC-SHA256 over `timestamp.raw_body` (constant-time comparison), ±300s window; or `Authorization: Apikey` | [Tested] missing/invalid/stale signature → 401, not activated |
| No secret configured → rejects all webhooks | [Reviewed] |
| Idempotency / duplicate prevention: UNIQUE(provider, txn_id) + `BEGIN IMMEDIATE` transaction | [Tested] duplicate delivery does not add extra days |
| Activates only when amount is sufficient and order code matches; underpayment, paid order, or canceled order → recorded as mismatch, not activated | [Tested] |
| Ignores outgoing transactions and transactions to accounts other than the configured account | [Tested] outgoing, [Reviewed] different account |
| Manual confirmation requires a bank transaction ID, prevents reuse, and writes an audit log; no screenshot-based activation path | [Tested] |
| Users cannot view other users' orders | [Tested] |
| Personal QR: student reporting "transferred" does not activate Pro, cannot cancel a reported order, and cannot report on behalf of another user's order; only an admin can confirm (with a transaction ID) or reject (with a reason) | [Tested] |
| Standards-compliant VietQR payload: matches 2 public sample payloads, standard CRC16; QR image decodes to the exact string | [Tested] |
| Live test with real SePay | [Unverified] — must be performed on staging |

## Free/Pro Entitlements & Administration
| Control | Status |
|---|---|
| Pro entitlement is computed on the server from the `subscriptions` table; client-side `localStorage`/cookies are never trusted | [Tested] Free user calling Pro lesson API, submitting Pro exercise, or accessing Pro quiz → 402 |
| Student calling the 7 `/api/admin/biz/*` APIs → 403; unauthenticated guest → 401 | [Tested] |
| CSRF protection on all new write operations | [Tested] |
| Revoking Pro takes effect immediately | [Tested] |
| Quiz answers, hidden tests, and reference solutions are never sent to the browser | [Tested] |
| XP is calculated solely from server-side grading results; no API accepts XP from the client | [Tested] XP is awarded only on the first passing submission |

## AI
| Control | Status |
|---|---|
| Gemini API key stored only in environment variables / encrypted server config; never exposed in HTML/API | [Tested] |
| Browser only calls `/api/ai/ask`; the server calls Gemini | [Tested] |
| Daily/monthly quotas by plan, per-minute anti-spam rate limit, input/output length limits, monthly cost cap | [Tested] quotas, anti-spam, length; [Reviewed] cost cap |
| Failed requests do not count toward user quotas | [Tested] |
| Users cannot read other users' conversations | [Tested] |
| Prompt injection: students may ask the AI for full solutions | Accepted risk: no secrets are leaked because prompts do not contain secrets, reference solutions, or hidden tests |

## Web Security
CSP `script-src 'self'`, `img-src 'self' data: blob:` (QR generated on the server, no external images loaded), `frame-ancestors 'none'`, HSTS over HTTPS, HttpOnly/SameSite cookies, scrypt password hashing, `no-store` on API responses. [Tested]

## Configuration & Secret Keys (3.2.0)
| Control | Status |
|---|---|
| Only admins can view/edit; CSRF enforced; student → 403, guest → 401 | [Tested] |
| Write-only secrets: API returns "configured" + last 4 characters, never the full value | [Tested] |
| AES-256-GCM encryption; master key stored in `DATA_DIR/secret.key` with mode 600 outside the database; `app.db` and backups downloaded from the admin panel do not contain the key | [Tested] |
| Changing/deleting secrets requires re-entering the admin password; wrong password logs `system.secret_denied` | [Tested] |
| Type and bounds validation on all values; blocks unknown image names, models, and URLs; no UI fields to modify the docker command, port, data directory, or Gemini endpoint URL | [Tested] 9 cases |
| Audit logs do not contain secret values | [Tested] |
Note: when migrating servers, copy `data/secret.key` along with `app.db`; otherwise secrets must be re-entered in the Admin panel.

## Other Residual Risks
- Rate-limit counters are stored in memory: they reset on restart and are accurate only when running a single process (PM2 `instances: 1`).
- Daily AI quotas are calculated in the server's timezone: set `TZ=Asia/Ho_Chi_Minh`.
- Two-factor authentication (2FA) is not yet implemented for admin accounts.
