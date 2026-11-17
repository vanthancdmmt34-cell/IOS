// db/pg.js — real Postgres data access layer for the migrated edition.
// Surface matches node:sqlite (prepare/get/all/run) but asynchronous.
// Conventions:
//  - Placeholders are still written as '?' in SQL; the adapter translates them to $1, $2...
//    (ignoring '?' inside '...' strings, "..." identifiers, comments, and $$...$$).
//  - BIGINT columns return Number (via OID 20 type parser). App IDs are all small
//    so this is safe; if any ID exceeds Number.MAX_SAFE_INTEGER, this must be changed.
//  - INSERTs that need the new ID must include 'RETURNING id'; run() populates lastInsertRowid
//    from that id column. Do not use lastval() since the Pool rotates connections.
//  - Transactions: use tx(fn) with a dedicated client, never db.exec BEGIN
//    (SQLite style) because the Pool does not guarantee the same connection.
//  - serialWritePg: sequential queue for writes that must avoid races (equivalent to
//    db/serial-write.js in the SQLite edition).
import pg from "pg";

const { Pool, types } = pg;
types.setTypeParser(20, (v) => Number(v));
// SUM(bigint) returns numeric (OID 1700) as a string unless cast; convert to Number
// (app costs and counts are small enough to fit safely).
types.setTypeParser(1700, (v) => Number(v));

export function translatePlaceholders(sql) {
  let out = "", n = 0, i = 0;
  const s = String(sql);
  while (i < s.length) {
    const ch = s[i];
    if (ch === "'") {
      let j = i + 1;
      while (j < s.length) {
        if (s[j] === "'") {
          if (s[j + 1] === "'") { j += 2; continue; }
          break;
        }
        j++;
      }
      out += s.slice(i, j + 1); i = j + 1; continue;
    }
    if (ch === '"') {
      let j = i + 1;
      while (j < s.length) {
        if (s[j] === '"') {
          if (s[j + 1] === '"') { j += 2; continue; }
          break;
        }
        j++;
      }
      out += s.slice(i, j + 1); i = j + 1; continue;
    }
    if (ch === "-" && s[i + 1] === "-") {
      const j = s.indexOf("\n", i);
      out += s.slice(i, j === -1 ? s.length : j); i = j === -1 ? s.length : j; continue;
    }
    if (ch === "/" && s[i + 1] === "*") {
      const j = s.indexOf("*/", i + 2);
      out += s.slice(i, j === -1 ? s.length : j + 2); i = j === -1 ? s.length : j + 2; continue;
    }
    if (ch === "$") {
      const m = /^\$[A-Za-z_][A-Za-z0-9_]*\$/.exec(s.slice(i));
      if (m) {
        const tag = m[0];
        const j = s.indexOf(tag, i + tag.length);
        out += s.slice(i, j === -1 ? s.length : j + tag.length); i = j === -1 ? s.length : j + tag.length; continue;
      }
    }
    if (ch === "?") { out += `$${++n}`; i++; continue; }
    out += ch; i++;
  }
  return out;
}

function makeStmt(client, sql) {
  const text = translatePlaceholders(sql);
  return {
    async get(...params) {
      const r = await client.query(text, params);
      return r.rows[0] ?? undefined;
    },
    async all(...params) {
      const r = await client.query(text, params);
      return r.rows;
    },
    async run(...params) {
      const r = await client.query(text, params);
      const first = r.rows && r.rows[0];
      return {
        changes: r.rowCount ?? 0,
        lastInsertRowid: first && first.id !== undefined ? Number(first.id) : null,
      };
    },
  };
}

export class PgDb {
  constructor(config) {
    this.pool = new Pool(config);
  }
  prepare(sql) {
    return makeStmt(this.pool, sql);
  }
  async query(sql, params = []) {
    return this.pool.query(translatePlaceholders(sql), params);
  }
  // fn receives a db wrapper bound to a single connection for the duration of the transaction.
  async tx(fn) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const r = await fn({ prepare: (sql) => makeStmt(client, sql), query: (sql, params = []) => client.query(translatePlaceholders(sql), params) });
      await client.query("COMMIT");
      return r;
    } catch (e) {
      try { await client.query("ROLLBACK"); } catch {}
      throw e;
    } finally {
      client.release();
    }
  }
  async close() { await this.pool.end(); }
}

let _queue = Promise.resolve();
export function serialWritePg(fn) {
  const r = _queue.then(fn);
  _queue = r.then(() => {}, () => {});
  return r;
}
