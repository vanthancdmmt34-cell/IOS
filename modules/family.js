// Family Plan — 4.0.0. Plan owner (parent) has a family group, invites members by username,
// and members accept to join. Every active member (including the owner) gets Pro from source "family".
// Owner can only view progress of members who enabled "share progress"; never sees passwords or sensitive data.
import { grantSource, revokeSource, syncSourceExpiry } from "./entitlements.js";

const now = () => new Date().toISOString();
const addMonths = (iso, m) => { const d = new Date(iso); d.setUTCMonth(d.getUTCMonth() + m); return d.toISOString(); };

// Purchase / renew family plan. Call INSIDE a transaction.
export async function issueFamily(db, { ownerId, seats, months, actorId = null }) {
  const t = now();
  let g = await db.prepare("SELECT * FROM family_groups WHERE owner_id = ?").get(ownerId);
  if (g) {
    const base = g.status === "active" && g.expires_at > t ? g.expires_at : t;
    const exp = addMonths(base, months);
    await db.prepare("UPDATE family_groups SET expires_at = ?, status = 'active', seats = CASE WHEN seats >= ? THEN seats ELSE ? END, starts_at = CASE WHEN status = 'active' AND expires_at > ? THEN starts_at ELSE ? END WHERE id = ?").run(exp, seats, seats, t, t, g.id);
    g = await db.prepare("SELECT * FROM family_groups WHERE id = ?").get(g.id);
  } else {
    const info = await db.prepare("INSERT INTO family_groups (owner_id, seats, starts_at, expires_at, status, created_at) VALUES (?, ?, ?, ?, 'active', ?) RETURNING id").run(ownerId, seats, t, addMonths(t, months), t);
    g = await db.prepare("SELECT * FROM family_groups WHERE id = ?").get(Number(info.lastInsertRowid));
    await db.prepare("INSERT INTO family_members (group_id, user_id, status, share_progress, invited_at, joined_at) VALUES (?, ?, 'active', 1, ?, ?) ON CONFLICT (group_id, user_id) DO NOTHING").run(g.id, ownerId, t, t);
  }
  // Grant/renew entitlements for all active members (including the owner)
  for (const m of await db.prepare("SELECT * FROM family_members WHERE group_id = ? AND status = 'active'").all(g.id)) {
    await grantSource(db, { userId: m.user_id, sourceType: "family", sourceId: m.id, startsAt: t, expiresAt: g.expires_at, grantedBy: actorId, note: "Gói Family #" + g.id });
  }
  return g;
}

export async function familyOf(db, ownerId) {
  const g = await db.prepare("SELECT * FROM family_groups WHERE owner_id = ?").get(ownerId);
  if (!g) return null;
  const members = await db.prepare("SELECT m.id, m.user_id, m.status, m.share_progress, m.invited_at, m.joined_at, u.username, u.display_name FROM family_members m JOIN users u ON u.id = m.user_id WHERE m.group_id = ? AND m.status IN ('invited','active') ORDER BY m.id").all(g.id);
  return { id: g.id, seats: g.seats, startsAt: g.starts_at, expiresAt: g.expires_at, active: g.status === "active" && g.expires_at > now(), members };
}

export async function inviteMember(db, { ownerId, username }) {
  const g = await db.prepare("SELECT * FROM family_groups WHERE owner_id = ? AND status = 'active' AND expires_at > ?").get(ownerId, now());
  if (!g) return { error: "Bạn chưa có gói Family còn hạn." };
  const u = await db.prepare("SELECT id, role FROM users WHERE LOWER(username) = LOWER(?) AND disabled = 0").get(String(username || "").trim());
  if (!u) return { error: "Không tìm thấy tài khoản này. Thành viên cần tự đăng ký tài khoản trước." };
  if (u.id === ownerId) return { error: "Bạn đã là thành viên của gói." };
  const other = await db.prepare("SELECT 1 FROM family_members m JOIN family_groups g ON g.id = m.group_id WHERE m.user_id = ? AND m.status = 'active' AND g.id <> ? AND g.status = 'active' AND g.expires_at > ?").get(u.id, g.id, now());
  if (other) return { error: "Tài khoản này đang ở một gói Family khác." };
  const used = (await db.prepare("SELECT COUNT(*) AS n FROM family_members WHERE group_id = ? AND status IN ('invited','active')").get(g.id)).n;
  const ex = await db.prepare("SELECT * FROM family_members WHERE group_id = ? AND user_id = ?").get(g.id, u.id);
  if (ex && (ex.status === "active" || ex.status === "invited")) return { error: "Tài khoản này đã được mời hoặc đã ở trong gói." };
  if (used >= g.seats) return { error: `Gói đã đủ ${g.seats} thành viên. Hãy xóa bớt thành viên trước.` };
  if (ex) await db.prepare("UPDATE family_members SET status = 'invited', share_progress = 0, invited_at = ?, joined_at = NULL WHERE id = ?").run(now(), ex.id);
  else await db.prepare("INSERT INTO family_members (group_id, user_id, status, invited_at) VALUES (?, ?, 'invited', ?)").run(g.id, u.id, now());
  return { ok: true };
}

// Member responds to an invite. Reserve seat inside a transaction to avoid exceeding max members.
export async function respondInvite(db, { userId, groupId, accept, shareProgress = false }) {
  const m = await db.prepare("SELECT m.*, g.expires_at, g.status AS gstatus, g.seats FROM family_members m JOIN family_groups g ON g.id = m.group_id WHERE m.group_id = ? AND m.user_id = ? AND m.status = 'invited'").get(groupId, userId);
  if (!m) return { error: "Không có lời mời này." };
  if (!accept) { await db.prepare("UPDATE family_members SET status = 'declined' WHERE id = ?").run(m.id); return { ok: true }; }
  if (m.gstatus !== "active" || m.expires_at <= now()) return { error: "Gói Family này đã hết hạn." };
  const active = (await db.prepare("SELECT COUNT(*) AS n FROM family_members WHERE group_id = ? AND status = 'active'").get(groupId)).n;
  if (active >= m.seats) return { error: "Gói đã đủ thành viên." };
  await db.prepare("UPDATE family_members SET status = 'active', joined_at = ?, share_progress = ? WHERE id = ?").run(now(), shareProgress ? 1 : 0, m.id);
  await grantSource(db, { userId, sourceType: "family", sourceId: m.id, startsAt: now(), expiresAt: m.expires_at, note: "Gói Family #" + groupId });
  return { ok: true };
}

export async function removeMember(db, { ownerId, memberId, actorId }) {
  const g = await db.prepare("SELECT * FROM family_groups WHERE owner_id = ?").get(ownerId);
  if (!g) return { error: "Bạn không có gói Family." };
  const m = await db.prepare("SELECT * FROM family_members WHERE id = ? AND group_id = ?").get(Number(memberId), g.id);
  if (!m || !["invited", "active"].includes(m.status)) return { error: "Không có thành viên này." };
  if (m.user_id === ownerId) return { error: "Không thể xóa chủ gói." };
  await db.prepare("UPDATE family_members SET status = 'removed' WHERE id = ?").run(m.id);
  await revokeSource(db, { userId: m.user_id, sourceType: "family", sourceId: m.id, actorId, reason: "Rời gói Family" });
  return { ok: true };
}

export async function leaveFamily(db, { userId }) {
  const m = await db.prepare("SELECT m.*, g.owner_id FROM family_members m JOIN family_groups g ON g.id = m.group_id WHERE m.user_id = ? AND m.status = 'active'").get(userId);
  if (!m) return { error: "Bạn không ở gói Family nào." };
  if (m.owner_id === userId) return { error: "Chủ gói không thể rời gói." };
  await db.prepare("UPDATE family_members SET status = 'removed' WHERE id = ?").run(m.id);
  await revokeSource(db, { userId, sourceType: "family", sourceId: m.id, actorId: userId, reason: "Tự rời gói Family" });
  return { ok: true };
}

export async function myFamilyMembership(db, userId) {
  return await db.prepare("SELECT m.id, m.group_id AS \"groupId\", m.status, m.share_progress AS \"shareProgress\", g.expires_at AS \"expiresAt\", u.display_name AS \"ownerName\", u.username AS \"ownerUsername\", g.owner_id = ? AS \"isOwner\" FROM family_members m JOIN family_groups g ON g.id = m.group_id JOIN users u ON u.id = g.owner_id WHERE m.user_id = ? AND m.status IN ('invited','active') ORDER BY m.id DESC").all(userId, userId);
}

export async function expireFamilies(db) {
  return (await db.prepare("UPDATE family_groups SET status = 'expired' WHERE status = 'active' AND expires_at <= ?").run(now())).changes;
}
// used on renewal (syncSourceExpiry is called via issueFamily -> grantSource updates expiry)
export { syncSourceExpiry };
