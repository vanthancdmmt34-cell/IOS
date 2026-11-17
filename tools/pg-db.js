// Postgres connection helper for tool scripts (used once production has migrated to PG).
// Configured via standard pg driver environment variables:
//   PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE (required).
import { PgDb } from "../db/pg.js";

export function openPgDb() {
  if (!process.env.PGDATABASE) {
    console.error("[tools] Chua dat PGDATABASE (kem theo PGHOST/PGPORT/PGUSER/PGPASSWORD).");
    process.exit(2);
  }
  return new PgDb({
    host: process.env.PGHOST || "127.0.0.1",
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || undefined,
    database: process.env.PGDATABASE,
  });
}
