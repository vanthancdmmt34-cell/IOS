// In-app notifications + optional webhook (4.0.16).
// NOTIFY_WEBHOOK_URL: POST JSON for each notification (Make.com / n8n / Zalo gateway).
// NOTIFY_WEBHOOK_SECRET: sent in the X-Notify-Secret header.

const nowIso = () => new Date().toISOString();

export function webhookConfig() {
  return {
    url: String(process.env.NOTIFY_WEBHOOK_URL || "").trim(),
    secret: String(process.env.NOTIFY_WEBHOOK_SECRET || "").trim(),
    enabled: !!String(process.env.NOTIFY_WEBHOOK_URL || "").trim(),
  };
}

export async function deliverWebhook(payload) {
  const { url, secret } = webhookConfig();
  if (!url) return { ok: false, skipped: true, reason: "NOTIFY_WEBHOOK_URL chưa cấu hình" };
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "HocLapTrinh-Notify/4.0",
        ...(secret ? { "X-Notify-Secret": secret } : {}),
      },
      body: JSON.stringify({
        event: "notification",
        sentAt: nowIso(),
        ...payload,
      }),
      signal: AbortSignal.timeout(8000),
    });
    const text = await r.text().catch(() => "");
    return { ok: r.ok, status: r.status, body: String(text).slice(0, 500) };
  } catch (e) {
    return { ok: false, error: String(e.message || e).slice(0, 300) };
  }
}

export async function notify(db, { userId, kind = "info", title, body = "", link = "", payload = {} }) {
  if (!userId || !title) return null;
  const t = nowIso();
  const info = await db.prepare(
    "INSERT INTO notifications (user_id, kind, title, body, link, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id"
  ).run(
    userId,
    String(kind).slice(0, 40),
    String(title).slice(0, 200),
    String(body).slice(0, 2000),
    String(link || "").slice(0, 300),
    JSON.stringify(payload || {}),
    t
  );
  const id = Number(info.lastInsertRowid);
  let username = null, displayName = null, email = null;
  try {
    const u = await db.prepare("SELECT username, display_name, email FROM users WHERE id = ?").get(userId);
    if (u) { username = u.username; displayName = u.display_name; email = u.email || null; }
  } catch {
    try {
      const u = await db.prepare("SELECT username, display_name FROM users WHERE id = ?").get(userId);
      if (u) { username = u.username; displayName = u.display_name; }
    } catch {}
  }
  // Fire-and-forget webhook
  deliverWebhook({
    id, userId, username, displayName, email,
    kind, title, body, link, payload, createdAt: t,
  }).catch(() => {});
  return id;
}

export async function notifyMany(db, userIds, opts) {
  const ids = [...new Set((userIds || []).filter(Boolean))];
  const out = [];
  for (const userId of ids) { const id = await notify(db, { ...opts, userId }); if (id) out.push(id); }
  return out;
}

export async function listNotifications(db, userId, { limit = 30, unreadOnly = false } = {}) {
  const lim = Math.min(Math.max(Number(limit) || 30, 1), 100);
  if (unreadOnly) {
    return await db.prepare(
      "SELECT id, kind, title, body, link, read_at AS \"readAt\", created_at AS \"createdAt\" FROM notifications WHERE user_id = ? AND read_at IS NULL ORDER BY id DESC LIMIT ?"
    ).all(userId, lim);
  }
  return await db.prepare(
    "SELECT id, kind, title, body, link, read_at AS \"readAt\", created_at AS \"createdAt\" FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT ?"
  ).all(userId, lim);
}

export async function unreadCount(db, userId) {
  return (await db.prepare("SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read_at IS NULL").get(userId)).n;
}

export async function markRead(db, userId, id) {
  return (await db.prepare("UPDATE notifications SET read_at = ? WHERE id = ? AND user_id = ? AND read_at IS NULL").run(nowIso(), id, userId)).changes;
}

export async function markAllRead(db, userId) {
  return (await db.prepare("UPDATE notifications SET read_at = ? WHERE user_id = ? AND read_at IS NULL").run(nowIso(), userId)).changes;
}

export async function maybeRemindProExpiry(db, user, membership) {
  if (!user || !membership?.pro || membership.staff || !membership.expiresAt) return;
  // Lượt Pro miễn phí trong ngày không phải gói cần gia hạn: không nhắc.
  if (Array.isArray(membership.sources) && membership.sources.length && membership.sources.every((x) => x.type === "daily")) return;
  const exp = Date.parse(membership.expiresAt);
  if (!Number.isFinite(exp)) return;
  const days = Math.ceil((exp - Date.now()) / 86400000);
  if (days > 7 || days < 0) return;
  const since = new Date(Date.now() - 86400000).toISOString();
  const recent = await db.prepare(
    "SELECT 1 FROM notifications WHERE user_id = ? AND kind = 'pro_expiry' AND created_at >= ? LIMIT 1"
  ).get(user.id, since);
  if (recent) return;
  await notify(db, {
    userId: user.id,
    kind: "pro_expiry",
    title: days <= 1 ? "Gói Pro sắp hết hạn trong hôm nay" : `Gói Pro còn khoảng ${days} ngày`,
    body: "Gia hạn để giữ Rivo và toàn bộ bài học Pro.",
    link: "/app/bang-gia",
    payload: { expiresAt: membership.expiresAt, days },
  });
}
