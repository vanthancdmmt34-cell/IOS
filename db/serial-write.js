// serial-write.js — funnels all DB mutations through a single async queue.
// Eliminates SQLITE_BUSY races without touching busy_timeout or any table schema.
// Usage:  import { serialWrite } from './db/serial-write.js';
//         const result = await serialWrite(() => db.prepare('INSERT ...').run(...));
let _queue = Promise.resolve();

/**
 * Run `fn` (a synchronous SQLite mutation) after every previously-queued write
 * has finished.  Returns a Promise that resolves with fn's return value.
 *
 * fn() executes inside the serialised chain, so only one mutation is
 * in-flight at any given moment — no SQLITE_BUSY contention on WAL writers.
 */
export function serialWrite(fn) {
  const result = _queue.then(() => fn());
  // Swallow errors in the chain tail so one failure never stalls the queue.
  _queue = result.then(() => {}, () => {});
  return result;
}
