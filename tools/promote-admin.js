// Emergency admin role recovery when locked out:
//   node tools/promote-admin.js <username>
// Grants admin role to 1 account, syncs entitlement role/pro, and prints remaining admin count.
// Run ON THE VPS, then run `pm2 restart hoc-ngoai-ngu` so existing sessions pick up the new role.
// Does not accept passwords or print sensitive data.
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { sqliteAsync } from "../db/sqlite-async.js";
import { syncRoleEntitlement } from "../modules/entitlements.js";

const username = process.argv[2];
if (!username) { console.error("Dùng: node tools/promote-admin.js <username>"); process.exit(1); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(root, "data");
const rawDb = new DatabaseSync(path.join(dataDir, "app.db"));
const db = sqliteAsync(rawDb);
try {
  const user = await db.prepare("SELECT * FROM users WHERE LOWER(username) = LOWER(?)").get(username);
  if (!user) { console.error("Không có tài khoản:", username); process.exitCode = 1; }
  else {
    await db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(user.id);
    await syncRoleEntitlement(db, user.id, "admin");
    const admins = (await db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'").get()).n;
    console.log(`Đã đặt @${user.username} thành quản trị viên. Tổng số quản trị viên hiện tại: ${admins}.`);
  }
} finally {
  rawDb.close();
}
