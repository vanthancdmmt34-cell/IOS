// Góp ý sản phẩm: học viên gửi góp ý tính năng, báo lỗi hoặc ý kiến khác; xem lại các góp ý đã gửi và trạng thái.
// Bảng tự tạo khi khởi động (CREATE TABLE IF NOT EXISTS, chạy được cả SQLite lẫn PostgreSQL).
import crypto from "node:crypto";
import { notify } from "./notify.js";

export const FEEDBACK_KINDS = ["feature", "bug", "other"];
export const FEEDBACK_STATUSES = ["new", "reviewing", "planned", "done", "declined"];
const STATUS_LABELS = {
  new: "Đã nhận",
  reviewing: "Đang xem xét",
  planned: "Đã lên kế hoạch",
  done: "Đã hoàn thành",
  declined: "Chưa thực hiện",
};

export async function ensureFeedbackTable(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    kind TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL,
    page TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id, created_at)").run();
}

// Trả về true nếu đã xử lý đường dẫn /api/feedback*
export async function feedbackApi({ db, req, res, url, method, user, sess, sendJson, readBody, requireCsrf, hit, nowIso }) {
  if (!url.pathname.startsWith("/api/feedback")) return false;

  // Gửi góp ý
  if (method === "POST" && url.pathname === "/api/feedback") {
    const body = await readBody(req);
    if (body === null || !requireCsrf(req, sess)) { sendJson(res, 403, { error: "Phiên làm việc không hợp lệ, hãy tải lại trang." }); return true; }
    const kind = FEEDBACK_KINDS.includes(body.kind) ? body.kind : "other";
    const subject = String(body.subject || "").trim().slice(0, 120);
    const text = String(body.body || "").trim();
    const page = String(body.page || "").replace(/[^\w\/#?=&.\-]/g, "").slice(0, 200);
    if (text.length < 10) { sendJson(res, 400, { error: "Góp ý cần ít nhất 10 ký tự để chúng tôi hiểu rõ." }); return true; }
    if (text.length > 2000) { sendJson(res, 400, { error: "Góp ý quá dài (tối đa 2000 ký tự)." }); return true; }
    if (hit(`feedback:${user.id}`, 10, 60 * 60 * 1000)) { sendJson(res, 429, { error: "Bạn đã gửi nhiều góp ý trong giờ qua. Thử lại sau nhé." }); return true; }
    const id = crypto.randomUUID();
    await db.prepare("INSERT INTO feedback (id, user_id, kind, subject, body, page, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'new', ?)")
      .run(id, user.id, kind, subject, text, page, nowIso());
    sendJson(res, 200, { ok: true, id });
    return true;
  }

  // Góp ý của chính học viên (mới nhất trước)
  if (method === "GET" && url.pathname === "/api/feedback/mine") {
    const rows = await db.prepare("SELECT id, kind, subject, body, status, created_at FROM feedback WHERE user_id = ? ORDER BY created_at DESC LIMIT 30").all(user.id);
    sendJson(res, 200, { items: rows });
    return true;
  }

  // Danh sách góp ý & đánh giá sao cho quản trị viên
  if (method === "GET" && url.pathname === "/api/feedback") {
    if (user.role !== "admin") { sendJson(res, 403, { error: "Chỉ quản trị viên xem được góp ý." }); return true; }
    const rows = await db.prepare(`SELECT f.id, f.user_id AS "userId", f.kind, f.subject, f.body, f.page, f.status, f.created_at, u.username, u.display_name AS "displayName"
      FROM feedback f LEFT JOIN users u ON u.id = f.user_id ORDER BY f.created_at DESC LIMIT 200`).all();
    const countRows = await db.prepare("SELECT status, COUNT(*) AS n FROM feedback GROUP BY status").all();
    const counts = { new: 0, reviewing: 0, planned: 0, done: 0, declined: 0, total: 0 };
    for (const r of countRows) {
      const n = Number(r.n) || 0;
      if (FEEDBACK_STATUSES.includes(r.status)) counts[r.status] = n;
      counts.total += n;
    }
    const ratings = await db.prepare(`SELECT r.user_id AS "userId", r.stars, r.comment, r.created_at AS "createdAt", r.updated_at AS "updatedAt", u.username, u.display_name AS "displayName"
      FROM ratings r LEFT JOIN users u ON u.id = r.user_id ORDER BY r.updated_at DESC LIMIT 200`).all();
    const starRows = await db.prepare("SELECT stars, COUNT(*) AS n FROM ratings GROUP BY stars").all();
    const byStars = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let rCount = 0, rSum = 0;
    for (const s of starRows) {
      const star = Number(s.stars), n = Number(s.n) || 0;
      if (star >= 1 && star <= 5) byStars[star] = n;
      rCount += n;
      rSum += star * n;
    }
    const ratingSummary = { count: rCount, average: rCount ? Math.round((rSum / rCount) * 10) / 10 : 0, byStars };
    sendJson(res, 200, { items: rows, ratings, ratingSummary, counts });
    return true;
  }

  // Cập nhật trạng thái góp ý (admin + CSRF) và gửi thông báo cho học viên khi thay đổi
  const fm = /^\/api\/feedback\/([^/]+)$/.exec(url.pathname);
  if (method === "PATCH" && fm && fm[1] !== "mine") {
    if (user.role !== "admin") { sendJson(res, 403, { error: "Chỉ quản trị viên mới cập nhật được góp ý." }); return true; }
    const body = await readBody(req);
    if (body === null || !requireCsrf(req, sess)) { sendJson(res, 403, { error: "Phiên làm việc không hợp lệ, hãy tải lại trang." }); return true; }
    if (typeof body.status !== "string") { sendJson(res, 400, { error: "Trạng thái góp ý không hợp lệ." }); return true; }
    const status = body.status.trim();
    if (!FEEDBACK_STATUSES.includes(status)) { sendJson(res, 400, { error: "Trạng thái góp ý không hợp lệ." }); return true; }
    const id = fm[1];
    let row = await db.prepare("SELECT id, user_id, subject, status FROM feedback WHERE id = ?").get(id);
    if (!row) { sendJson(res, 404, { error: "Không tìm thấy góp ý." }); return true; }
    let changed = false;
    let prevStatus = row.status;
    if (row.status !== status) {
      let upd = await db.prepare("UPDATE feedback SET status = ? WHERE id = ? AND status = ?").run(status, id, row.status);
      if (Number(upd?.changes) === 0) {
        row = await db.prepare("SELECT id, user_id, subject, status FROM feedback WHERE id = ?").get(id);
        if (!row) { sendJson(res, 404, { error: "Không tìm thấy góp ý." }); return true; }
        prevStatus = row.status;
        if (row.status !== status) {
          upd = await db.prepare("UPDATE feedback SET status = ? WHERE id = ? AND status = ?").run(status, id, row.status);
        }
      }
      changed = Number(upd?.changes) === 1;
    }
    if (changed && row.user_id) {
      const label = STATUS_LABELS[status] || status;
      await notify(db, {
        userId: row.user_id,
        kind: "feedback_status",
        title: `Góp ý của bạn: ${label}`,
        body: row.subject ? `«${row.subject}» đã chuyển sang trạng thái ${label}.` : `Góp ý của bạn đã chuyển sang trạng thái ${label}.`,
        link: "/app/ca-nhan",
        payload: { feedbackId: id, status, prevStatus },
      }).catch(() => {});
    }
    sendJson(res, 200, { ok: true, id, status, changed });
    return true;
  }

  return false;
}
