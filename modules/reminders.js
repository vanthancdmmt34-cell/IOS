// Nhắc luyện nói hằng ngày bằng thông báo trình duyệt (Web Push).
// Cần VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (và VAPID_SUBJECT dạng mailto:...). Thiếu khóa thì tắt hẳn.
// Mỗi 15 phút máy chủ kiểm tra: ai đăng ký, đúng giờ đã chọn (giờ Việt Nam), chưa đạt mục tiêu hôm nay
// và chưa được nhắc hôm nay thì gửi một thông báo.
import webpush from "web-push";

export const pushEnabled = () => !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

// Chỉ chấp nhận endpoint của dịch vụ push chính thức. Máy chủ gửi request tới endpoint này, nên không được nhận URL tùy ý (SSRF).
const PUSH_HOST = /^https:\/\/(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com|([a-z0-9-]+\.)?notify\.windows\.com)\/[\x21-\x7e]{1,500}$/i;
export const isPushEndpoint = (u) => PUSH_HOST.test(String(u || ""));
// Giới hạn số thiết bị nhận nhắc cho mỗi tài khoản.
export const MAX_SUBS_PER_USER = 5;
if (pushEnabled()) {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@example.com", process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
}

const vnDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const vnHour = () => Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", hour12: false }).format(new Date())) % 24;

export async function initReminders(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS push_subs (
    endpoint TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    goal INTEGER NOT NULL DEFAULT 10,
    hour INTEGER NOT NULL DEFAULT 20,
    last_sent TEXT NOT NULL DEFAULT ''
  )`).run();
  if (!pushEnabled()) return;
  // PM2 cluster: chỉ tiến trình đầu (instance 0) gửi nhắc, để không gửi trùng.
  const primary = !process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === "0";
  if (!primary) return;
  const tick = async () => {
    try {
      const h = vnHour(), today = vnDate();
      const subs = await db.prepare("SELECT * FROM push_subs WHERE hour = ? AND last_sent <> ?").all(h, today);
      for (const s of subs) {
        const n = Number((await db.prepare("SELECT COUNT(*) AS n FROM learning_activities WHERE user_id = ? AND activity_type IN ('lang_speak', 'lang_chat') AND activity_date = ?").get(s.user_id, today)).n) || 0;
        if (n >= Number(s.goal)) { await db.prepare("UPDATE push_subs SET last_sent = ? WHERE endpoint = ?").run(today, s.endpoint); continue; }
        const payload = JSON.stringify({ title: "Luyện nói hôm nay", body: `Bạn mới đạt ${n}/${s.goal} lượt. Luyện thêm vài câu nhé!`, url: "/app/ngoai-ngu" });
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 3600 });
          await db.prepare("UPDATE push_subs SET last_sent = ? WHERE endpoint = ?").run(today, s.endpoint);
        } catch (e) {
          // 404/410: người dùng đã thu hồi quyền hoặc gỡ trình duyệt. Xóa đăng ký.
          if (e && (e.statusCode === 404 || e.statusCode === 410)) await db.prepare("DELETE FROM push_subs WHERE endpoint = ?").run(s.endpoint);
          else console.error("[push]", e && e.statusCode, String(e && e.message).slice(0, 120));
        }
      }
    } catch (e) { console.error("[push] tick:", String(e && e.message).slice(0, 160)); }
  };
  setInterval(tick, 15 * 60 * 1000).unref?.();
}
