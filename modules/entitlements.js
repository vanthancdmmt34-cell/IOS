// Multi-source learning entitlements — 4.0.0.
// Each entitlement is 1 row: user, feature, grant source (personal / admin grant / class license seat /
// license owner / family), source ID, start, expiry, status. Effective entitlement = at least 1 row
// that is active, started, and not expired. Revoking 1 source DOES NOT affect other sources.
// Every API checks permissions via can() / summary() on the server.

const now = () => new Date().toISOString();
export const FEATURES = {
  pro: "Nội dung Pro (trợ lý AI, phỏng vấn AI không giới hạn, luyện phát âm và báo cáo chi tiết)",
  ai_pro: "Hạn mức Rivo của gói Pro",
  class_create: "Tạo và quản lý lớp học",
  ai_teacher: "AI hỗ trợ giảng dạy",
};
// Features provided by each source
const SOURCE_FEATURES = {
  personal: ["pro", "ai_pro"],
  admin_grant: ["pro", "ai_pro"],
  family: ["pro", "ai_pro"],
  license_seat: ["pro", "ai_pro"],
  license_owner: ["pro", "ai_pro", "class_create", "ai_teacher"],
};
export const SOURCE_LABEL = { trial: "Dùng thử Pro 7 ngày", gift: "Mã quà tặng", daily: "Pro miễn phí hôm nay", personal: "Pro cá nhân", admin_grant: "Quản trị tặng", family: "Gói Family", license_seat: "Lớp học (giấy phép giáo viên)", license_owner: "Giấy phép Teacher" };

async function audit(db, actorId, action, target, detail) {
  await db.prepare("INSERT INTO audit_logs (actor_id, action, target, detail, ip, created_at) VALUES (?, ?, ?, ?, '', ?)").run(actorId ?? null, action, target, JSON.stringify(detail || {}), now());
}

// Grant entitlements from 1 source (1 row per feature of that source). If an active row exists, update its expiry.
export async function grantSource(db, { userId, sourceType, sourceId, startsAt, expiresAt, grantedBy = null, note = "" }) {
  const t = now();
  const feats = SOURCE_FEATURES[sourceType];
  if (!feats) throw new Error("Nguồn quyền không hợp lệ: " + sourceType);
  const legacySource = sourceType === "admin_grant" ? "admin"
    : sourceType === "license_seat" ? "license"
    : sourceType === "license_owner" ? "license_owner"
    : sourceType === "family" ? "family"
    : "personal";
  const sid = sourceId == null ? null : String(sourceId);
  let cols;
  try { cols = new Set((await db.prepare("SELECT column_name AS name FROM information_schema.columns WHERE table_name = 'entitlements'").all()).map((c) => c.name)); }
  catch { cols = new Set((await db.prepare("PRAGMA table_info(entitlements)").all()).map((c) => c.name)); }
  const has = (c) => cols.has(c);
  for (const f of feats) {
    let ex = null;
    try {
      if (has("source_type")) {
        ex = await db.prepare("SELECT id FROM entitlements WHERE user_id = ? AND feature = ? AND source_type = ? AND source_id IS NOT DISTINCT FROM ? AND status = 'active'").get(userId, f, sourceType, sid);
      } else {
        ex = await db.prepare("SELECT id FROM entitlements WHERE user_id = ? AND feature = ? AND source = ? AND source_id IS NOT DISTINCT FROM ? AND status = 'active'").get(userId, f, legacySource, sid);
      }
    } catch {}
    if (ex) {
      try {
        if (has("updated_at")) await db.prepare("UPDATE entitlements SET expires_at = ?, updated_at = ? WHERE id = ?").run(expiresAt, t, ex.id);
        else await db.prepare("UPDATE entitlements SET expires_at = ? WHERE id = ?").run(expiresAt, ex.id);
      } catch {}
      continue;
    }
    // Build INSERT based on actual columns present in DB
    const fields = ["user_id", "feature"];
    const values = [userId, f];
    if (has("source")) { fields.push("source"); values.push(legacySource); }
    if (has("source_type")) { fields.push("source_type"); values.push(sourceType); }
    if (has("source_id")) { fields.push("source_id"); values.push(sid); }
    fields.push("starts_at", "expires_at", "status");
    values.push(startsAt || t, expiresAt, "active");
    if (has("granted_by")) { fields.push("granted_by"); values.push(grantedBy); }
    if (has("note")) { fields.push("note"); values.push(String(note).slice(0, 300)); }
    if (has("created_at")) { fields.push("created_at"); values.push(t); }
    if (has("updated_at")) { fields.push("updated_at"); values.push(t); }
    const ph = fields.map(() => "?").join(", ");
    await db.prepare(`INSERT INTO entitlements (${fields.join(", ")}) VALUES (${ph})`).run(...values);
  }
  try { await audit(db, grantedBy, "entitlement.grant", "user:" + userId, { sourceType, sourceId, expiresAt }); } catch {}
}

// Revoke entitlements from a specific source (e.g. student leaves class) — only that source.
export async function revokeSource(db, { userId = null, sourceType, sourceId, actorId = null, reason = "" }) {
  const info = userId == null
    ? await db.prepare("UPDATE entitlements SET status = 'revoked', updated_at = ?, note = COALESCE(note, '') || ? WHERE source_type = ? AND source_id IS NOT DISTINCT FROM ? AND status = 'active'").run(now(), reason ? " | " + reason : "", sourceType, sourceId ?? null)
    : await db.prepare("UPDATE entitlements SET status = 'revoked', updated_at = ?, note = COALESCE(note, '') || ? WHERE user_id = ? AND source_type = ? AND source_id IS NOT DISTINCT FROM ? AND status = 'active'").run(now(), reason ? " | " + reason : "", userId, sourceType, sourceId ?? null);
  if (info.changes) await audit(db, actorId, "entitlement.revoke", userId ? "user:" + userId : `${sourceType}:${sourceId}`, { sourceType, sourceId, reason, rows: info.changes });
  return info.changes;
}
// Revoke all entitlements matching source types for a user (e.g. admin revokes personal Pro)
export async function revokeUserSources(db, userId, sourceTypes, actorId, reason) {
  const ph = sourceTypes.map(() => "?").join(",");
  const n = (await db.prepare(`UPDATE entitlements SET status = 'revoked', updated_at = ?, note = COALESCE(note, '') || ? WHERE user_id = ? AND source_type IN (${ph}) AND status = 'active'`).run(now(), " | " + reason, userId, ...sourceTypes)).changes;
  if (n) await audit(db, actorId, "entitlement.revoke", "user:" + userId, { sourceTypes, reason, rows: n });
  return n;
}
// Update expiry for all entitlements of a source (e.g. license / family renewal)
export async function syncSourceExpiry(db, sourceType, sourceId, expiresAt) {
  return (await db.prepare("UPDATE entitlements SET expires_at = ?, updated_at = ? WHERE source_type = ? AND source_id = ? AND status = 'active'").run(expiresAt, now(), sourceType, sourceId)).changes;
}

const ACTIVE = "status = 'active' AND starts_at <= ? AND (expires_at IS NULL OR expires_at > ?)";

// Centralized permission check. System admins have all permissions.
export async function can(db, user, feature) {
  if (!user) return false;
  if (user.role === "admin") return true;
  const t = now();
  return !!(await db.prepare(`SELECT 1 FROM entitlements WHERE user_id = ? AND feature = ? AND ${ACTIVE} LIMIT 1`).get(user.id, feature, t, t));
}

// Entitlement summary for UI / API (no sensitive data)
export async function summary(db, user) {
  if (!user) return { features: {}, sources: [] };
  const t = now();
  const rows = await db.prepare(`SELECT feature, source_type, source_id, starts_at, expires_at FROM entitlements WHERE user_id = ? AND ${ACTIVE} ORDER BY expires_at DESC`).all(user.id, t, t);
  const features = {};
  for (const k of Object.keys(FEATURES)) features[k] = user.role === "admin";
  const srcMap = new Map();
  for (const r of rows) {
    features[r.feature] = true;
    const key = r.source_type + ":" + r.source_id;
    if (!srcMap.has(key)) {
      const sid = String(r.source_id || "");
      const type = r.source_type !== "personal" ? r.source_type
        : sid.startsWith("trial:") ? "trial"
        : sid.startsWith("gift:") ? "gift"
        : sid.startsWith("daily:") ? "daily"
        : "personal";
      srcMap.set(key, { type, label: SOURCE_LABEL[type] || SOURCE_LABEL[r.source_type], sourceId: r.source_id, startsAt: r.starts_at, expiresAt: r.expires_at });
    }
  }
  const sources = [...srcMap.values()];
  let proUntil = rows.filter((r) => r.feature === "pro").reduce((m, r) => (!m || (r.expires_at && r.expires_at > m) ? r.expires_at : m), null);
  // Consecutive purchased periods (starting seamlessly in the future) are added to the displayed expiry date
  if (proUntil) {
    const future = await db.prepare("SELECT starts_at, expires_at FROM entitlements WHERE user_id = ? AND feature = 'pro' AND status = 'active' AND starts_at > ? ORDER BY starts_at").all(user.id, t);
    for (const f of future) if (f.starts_at <= proUntil && f.expires_at > proUntil) proUntil = f.expires_at;
  }
  return { features, sources, proUntil };
}

export async function expireEntitlements(db) {
  const t = now();
  return (await db.prepare("UPDATE entitlements SET status = 'expired', updated_at = ? WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at <= ?").run(t, t)).changes;
}

// Used by tools/promote-admin.js — admins are granted all permissions by role in can(),
// this function only syncs entitlement notes (not required at runtime).
export function syncRoleEntitlement(db, userId, role) {
  if (role !== "admin" && role !== "teacher") return 0;
  // Admins do not need entitlement rows; teachers need license_owner from issueLicense.
  return 0;
}
