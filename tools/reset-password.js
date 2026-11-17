// Password recovery utility when a teacher forgets their password and has no active session.
// Run directly on the VPS only; NEVER serve over HTTP, NEVER place inside public/.
// Usage (run from the project root directory, e.g. /root/hoc-ngoai-ngu):
//   node tools/reset-password.js <username> <new-password>
// New password: 6-128 characters. The script does not echo the password to the terminal.
// After running, that account will be logged out of all existing sessions.
import crypto from "node:crypto";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { sqliteAsync } from "../db/sqlite-async.js";

const [username, newPassword] = process.argv.slice(2);
if (!username || !newPassword) {
  console.error("Cach dung: node tools/reset-password.js <ten-dang-nhap> <mat-khau-moi>");
  process.exit(1);
}
if (newPassword.length < 6 || newPassword.length > 128) {
  console.error("Mat khau moi can tu 6 den 128 ky tu.");
  process.exit(1);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(root, "data");
const rawDb = new DatabaseSync(path.join(dataDir, "app.db"));
const db = sqliteAsync(rawDb);
try {
  const user = await db.prepare("SELECT * FROM users WHERE LOWER(username) = LOWER(?)").get(username);
  if (!user) {
    console.error("Khong tim thay tai khoan:", username);
    process.exitCode = 1;
  } else {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(newPassword, salt, 64).toString("hex");
    await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(`${salt}:${hash}`, user.id);
    await db.prepare("DELETE FROM sessions WHERE user_id = ?").run(user.id);
    console.log(`Da dat lai mat khau va dang xuat moi phien cua @${user.username}.`);
  }
} finally {
  rawDb.close();
}
