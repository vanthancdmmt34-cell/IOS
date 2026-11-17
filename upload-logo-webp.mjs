#!/usr/bin/env node
// Upload logo LifeRivo dang WebP vao DB brand_assets (kind='logo').
// Giong upload-logo.mjs nhung mime='image/webp' (de PageSpeed khong bao
// dung dinh dang cu; WebP lossless nhe hon PNG 19%).
// Chay tren VPS: node /tmp/upload-logo-webp.mjs /tmp/liferivo-logo-header.webp
import fs from "node:fs";
import pg from "pg";
const file = process.argv[2];
if (!file) { console.error("usage: node upload-logo-webp.mjs <webp>"); process.exit(1); }
const buf = fs.readFileSync(file);
if (buf.length > 512 * 1024) { console.error("logo qua 512KB:", buf.length); process.exit(1); }
const env = {};
for (const line of fs.readFileSync("/root/hoc-lap-trinh-study/.env", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
}
const client = new pg.Client({
  host: env.PGHOST || "127.0.0.1",
  port: Number(env.PGPORT || 5432),
  user: env.PGUSER || "postgres",
  password: env.PGPASSWORD || "",
  database: env.PGDATABASE || "pylab_study",
});
await client.connect();
const r = await client.query(
  `INSERT INTO brand_assets (kind, mime, data, updated_at)
   VALUES ('logo', 'image/webp', $1, NOW())
   ON CONFLICT (kind) DO UPDATE SET mime = EXCLUDED.mime, data = EXCLUDED.data, updated_at = NOW()
   RETURNING kind, mime, octet_length(data) AS bytes, updated_at`,
  [buf]
);
console.log("OK brand_assets:", JSON.stringify(r.rows[0]));
await client.end();
