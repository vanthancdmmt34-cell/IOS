// db/sqlite-async.js — 4.9.12: wraps node:sqlite in a db/pg.js-compatible interface
// (prepare().get/all/run return Promises, with tx(fn)), so all code written for PostgreSQL
// (await, .catch, db.tx, GREATEST/LEAST) also runs when PGDATABASE is not set.
// Trước phiên bản này, chế độ SQLite lỗi ở lớp học và thanh toán.
const fixSql = (sql) => String(sql)
  .replace(/\bGREATEST\s*\(/gi, "MAX(")
  .replace(/\bLEAST\s*\(/gi, "MIN(");

const P = (fn) => { try { return Promise.resolve(fn()); } catch (e) { return Promise.reject(e); } };

export function sqliteAsync(raw) {
  let txQueue = Promise.resolve();
  let inTx = 0;
  const wrapStmt = (st) => ({
    get: (...a) => P(() => st.get(...a)),
    all: (...a) => P(() => st.all(...a)),
    run: (...a) => P(() => st.run(...a)),
    iterate: (...a) => st.iterate(...a),
  });
  const api = {
    raw,
    isSqlite: true,
    prepare: (sql) => wrapStmt(raw.prepare(fixSql(sql))),
    exec: (sql) => raw.exec(fixSql(sql)),
    close: () => raw.close(),
    // Transactions: SQLite has only 1 connection, so transactions are queued (no overlapping BEGIN).
    // Nested calls inside an active transaction run directly (without issuing another BEGIN).
    async tx(fn) {
      if (inTx) return fn(api);
      const prev = txQueue;
      let release;
      txQueue = new Promise((r) => { release = r; });
      await prev;
      inTx++;
      raw.exec("BEGIN IMMEDIATE");
      try {
        const out = await fn(api);
        raw.exec("COMMIT");
        return out;
      } catch (e) {
        try { raw.exec("ROLLBACK"); } catch {}
        throw e;
      } finally {
        inTx--;
        release();
      }
    },
    async query(sql) { raw.exec(fixSql(sql)); return { rows: [] }; },
  };
  return api;
}
