// Góp ý sản phẩm: học viên gửi góp ý tính năng, báo lỗi hoặc ý kiến khác; xem lại các góp ý đã gửi và trạng thái.
// Bảng tự tạo khi khởi động (CREATE TABLE IF NOT EXISTS, chạy được cả SQLite lẫn PostgreSQL).
import crypto from "node:crypto";

export const FEEDBACK_KINDS = ["feature", "bug", "other"];
export const FEEDBACK_STATUSES = ["new", "reviewing", "planned", "done", "declined"];

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

  // Danh sách góp ý cho quản trị viên
  if (method === "GET" && url.pathname === "/api/feedback") {
    if (user.role !== "admin") { sendJson(res, 403, { error: "Chỉ quản trị viên xem được góp ý." }); return true; }
    const rows = await db.prepare(`SELECT f.id, f.kind, f.subject, f.body, f.page, f.status, f.created_at, u.username
      FROM feedback f JOIN users u ON u.id = f.user_id ORDER BY f.created_at DESC LIMIT 200`).all();
    sendJson(res, 200, { items: rows });
    return true;
  }

  return false;
}
