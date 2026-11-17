// Teacher licenses (Teacher Starter/Standard/School) and student seats — 4.0.0.
// Each student joining a teacher's class occupies 1 seat in that teacher's active license
// (1 student across multiple classes of the same teacher only takes 1 seat). Seat reservation runs inside BEGIN IMMEDIATE
// so concurrent joins cannot exceed the seat limit.
import { grantSource, revokeSource, syncSourceExpiry } from "./entitlements.js";
import { notify } from "./notify.js";

const now = () => new Date().toISOString();
const addMonths = (iso, m) => { const d = new Date(iso); d.setUTCMonth(d.getUTCMonth() + m); return d.toISOString(); };
export const TIER_OF_SEATS = (seats) => (seats <= 10 ? "starter" : seats <= 30 ? "standard" : "school");

// Create or renew a license. Same seat count + still active -> extend consecutively; otherwise -> new license.
// Call INSIDE the caller's transaction.
export async function issueLicense(db, { ownerId, seats, months, source = "order", orderId = null, note = "", actorId = null }) {
  const t = now();
  const cur = await db.prepare("SELECT * FROM licenses WHERE owner_id = ? AND seats = ? AND status = 'active' AND expires_at > ? ORDER BY expires_at DESC LIMIT 1").get(ownerId, seats, t);
  let lic;
  if (cur) {
    const exp = addMonths(cur.expires_at, months);
    await db.prepare("UPDATE licenses SET expires_at = ? WHERE id = ?").run(exp, cur.id);
    lic = { ...cur, expires_at: exp };
    // extend expiry for all seats currently in use under this license
    for (const s of await db.prepare("SELECT id FROM license_seats WHERE license_id = ? AND status = 'active'").all(cur.id)) await syncSourceExpiry(db, "license_seat", s.id, exp);
    await syncSourceExpiry(db, "license_owner", cur.id, exp);
  } else {
    const exp = addMonths(t, months);
    const info = await db.prepare("INSERT INTO licenses (owner_id, tier, seats, starts_at, expires_at, status, source, order_id, note, created_at) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?) RETURNING id")
      .run(ownerId, TIER_OF_SEATS(seats), seats, t, exp, source, orderId, String(note).slice(0, 300), t);
    lic = await db.prepare("SELECT * FROM licenses WHERE id = ?").get(Number(info.lastInsertRowid));
    await grantSource(db, { userId: ownerId, sourceType: "license_owner", sourceId: lic.id, startsAt: t, expiresAt: exp, grantedBy: actorId, note: "Giấy phép " + lic.tier });
  }
  // License buyer becomes a teacher (if currently a student/parent)
  // 4.9.3: do not auto-upgrade to teacher role on license purchase; admin upgrades manually.
  try {
    await notify(db, {
      userId: ownerId,
      kind: "license_issued",
      title: "Đã cấp giấy phép Teacher",
      body: `${seats} chỗ · ${months} tháng` + (note ? ` · ${String(note).slice(0, 80)}` : ""),
      link: "/app/giao-vien",
      payload: { licenseId: lic.id, seats, months },
    });
  } catch {}

  // New license after expiry: re-allocate seats for students in the teacher's open classes (up to available seats)
  if (!cur) {
    const students = await db.prepare("SELECT DISTINCT m.user_id, m.joined_at FROM class_members m JOIN classrooms c ON c.id = m.class_id WHERE c.teacher_id = ? AND c.status = 'active' AND m.status = 'active' ORDER BY m.joined_at").all(ownerId);
    for (const st of students) await allocateSeat(db, { teacherId: ownerId, userId: st.user_id });
  }
  return lic;
}

export async function activeLicenses(db, ownerId) {
  const t = now();
  return await db.prepare(`SELECT l.*, (SELECT COUNT(*) FROM license_seats s WHERE s.license_id = l.id AND s.status = 'active') AS used
    FROM licenses l WHERE l.owner_id = ? AND l.status = 'active' AND l.expires_at > ? ORDER BY l.expires_at DESC`).all(ownerId, t);
}
export async function licenseSummary(db, ownerId) {
  const list = await activeLicenses(db, ownerId);
  return { licenses: list.map((l) => ({ id: l.id, tier: l.tier, seats: l.seats, used: l.used, expiresAt: l.expires_at })), seats: list.reduce((a, l) => a + l.seats, 0), used: list.reduce((a, l) => a + l.used, 0) };
}

// Reserve a seat for a student in the teacher's license. Returns { ok, seatId } or { ok:false, reason }.
// Must be called INSIDE a BEGIN IMMEDIATE transaction.
export async function allocateSeat(db, { teacherId, userId }) {
  const t = now();
  const lic = await activeLicenses(db, teacherId);
  if (!lic.length) return { ok: false, reason: "no_license" };
  const held = await db.prepare(`SELECT s.* FROM license_seats s JOIN licenses l ON l.id = s.license_id WHERE l.owner_id = ? AND s.user_id = ? AND s.status = 'active' AND l.status = 'active' AND l.expires_at > ?`).get(teacherId, userId, t);
  if (held) return { ok: true, seatId: held.id, reused: true };
  const free = lic.find((l) => l.used < l.seats);
  if (!free) return { ok: false, reason: "full" };
  const old = await db.prepare("SELECT id FROM license_seats WHERE license_id = ? AND user_id = ?").get(free.id, userId);
  let seatId;
  if (old) { await db.prepare("UPDATE license_seats SET status = 'active', assigned_at = ?, released_at = NULL WHERE id = ?").run(t, old.id); seatId = old.id; }
  else seatId = Number((await db.prepare("INSERT INTO license_seats (license_id, user_id, status, assigned_at) VALUES (?, ?, 'active', ?) RETURNING id").run(free.id, userId, t)).lastInsertRowid);
  await grantSource(db, { userId, sourceType: "license_seat", sourceId: seatId, startsAt: t, expiresAt: free.expires_at, grantedBy: teacherId, note: "Chỗ học trong giấy phép #" + free.id });
  return { ok: true, seatId };
}

// Release seat when the student is no longer in any active class of this teacher. Only revokes entitlement from that seat.
export async function releaseSeatIfUnused(db, { teacherId, userId, actorId = null, reason = "" }) {
  const still = await db.prepare("SELECT 1 FROM class_members m JOIN classrooms c ON c.id = m.class_id WHERE c.teacher_id = ? AND m.user_id = ? AND m.status IN ('active','suspended') AND c.status = 'active' LIMIT 1").get(teacherId, userId);
  if (still) return 0;
  const seats = await db.prepare("SELECT s.id FROM license_seats s JOIN licenses l ON l.id = s.license_id WHERE l.owner_id = ? AND s.user_id = ? AND s.status = 'active'").all(teacherId, userId);
  for (const s of seats) {
    await db.prepare("UPDATE license_seats SET status = 'released', released_at = ? WHERE id = ?").run(now(), s.id);
    await revokeSource(db, { userId, sourceType: "license_seat", sourceId: s.id, actorId, reason: reason || "Rời lớp" });
  }
  return seats.length;
}

export async function expireLicenses(db) {
  return (await db.prepare("UPDATE licenses SET status = 'expired' WHERE status = 'active' AND expires_at <= ?").run(now())).changes;
}
