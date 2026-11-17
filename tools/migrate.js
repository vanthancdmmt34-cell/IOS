// Database migration manager (SQLite):
//   node tools/migrate.js status          show applied / pending migrations
//   node tools/migrate.js up              apply pending migrations (server also runs this on startup)
//   node tools/migrate.js down <id>       roll back 1 migration (BACK UP data/app.db FIRST!)
// Uses DATA_DIR like the server (default ./data).
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { MIGRATIONS, migrate, rollback } from "../db/migrations.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(root, "data");
const [cmd, id] = process.argv.slice(2);

const db = new DatabaseSync(path.join(dataDir, "app.db"));
db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
const done = new Map(db.prepare("SELECT id, applied_at FROM schema_migrations").all().map((r) => [r.id, r.applied_at]));
if (cmd === "up") { console.log(migrate(db).length ? "Xong." : "Không có migration mới."); }
else if (cmd === "down") { if (!id) { console.error("Cần id migration."); process.exit(1); } rollback(db, id); console.log("Đã hoàn tác", id); }
else for (const m of MIGRATIONS) console.log(done.has(m.id) ? "✔" : "✗", m.id, done.get(m.id) || "(chưa áp dụng)", "-", m.note);
