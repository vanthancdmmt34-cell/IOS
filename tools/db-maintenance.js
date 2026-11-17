// SQLite maintenance: integrity check, WAL checkpoint and online-consistent VACUUM INTO backup.
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const backupDir = path.resolve(process.env.BACKUP_DIR || path.join(path.resolve(process.env.DATA_DIR || './data'), 'backups'));
const retentionDays = Math.max(1, Math.min(365, Number(process.env.BACKUP_RETENTION_DAYS) || 14));
const command = process.argv[2] || 'check';


const dataDir = path.resolve(process.env.DATA_DIR || './data');
const dbPath = path.resolve(process.env.DB_PATH || path.join(dataDir, 'app.db'));
const quote = (s) => String(s).replace(/'/g, "''");

if (!fs.existsSync(dbPath)) {
  console.error(`[db-maintenance] Không tìm thấy database: ${dbPath}`);
  process.exit(2);
}

const db = new DatabaseSync(dbPath, { readOnly: command === 'check' });
try {
  db.exec('PRAGMA busy_timeout = 10000');
  if (command === 'check') {
    const rows = db.prepare('PRAGMA quick_check').all();
    const healthy = rows.length === 1 && String(rows[0].quick_check).toLowerCase() === 'ok';
    console.log(JSON.stringify({ ok: healthy, database: dbPath, check: rows }, null, 2));
    if (!healthy) process.exitCode = 1;
  } else if (command === 'checkpoint') {
    const result = db.prepare('PRAGMA wal_checkpoint(PASSIVE)').get();
    console.log(JSON.stringify({ ok: true, database: dbPath, checkpoint: result }, null, 2));
  } else if (command === 'backup') {
    fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const destination = path.join(backupDir, `liferivo-${stamp}.sqlite`);
    db.exec(`VACUUM INTO '${quote(destination)}'`);
    fs.chmodSync(destination, 0o600);
    const check = new DatabaseSync(destination, { readOnly: true });
    const integrity = check.prepare('PRAGMA quick_check').all();
    check.close();
    if (integrity.length !== 1 || String(integrity[0].quick_check).toLowerCase() !== 'ok') {
      fs.rmSync(destination, { force: true });
      throw new Error('Bản sao lưu không vượt qua quick_check; đã xóa bản sao lỗi.');
    }
    const cutoff = Date.now() - retentionDays * 86400000;
    let removed = 0;
    for (const name of fs.readdirSync(backupDir)) {
      if (!/^liferivo-\d{4}-\d{2}-\d{2}T.*\.sqlite$/.test(name)) continue;
      const file = path.join(backupDir, name);
      try { if (fs.statSync(file).mtimeMs < cutoff) { fs.rmSync(file); removed += 1; } } catch {}
    }
    console.log(JSON.stringify({ ok: true, backup: destination, bytes: fs.statSync(destination).size, retentionDays, removedOldBackups: removed }, null, 2));
  } else {
    console.error('Dùng: node tools/db-maintenance.js [check|checkpoint|backup]');
    process.exitCode = 2;
  }
} catch (error) {
  console.error('[db-maintenance]', error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
