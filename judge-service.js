// Judge API: accepts internal jobs and enqueues them in BullMQ when Redis is configured.
// When Redis is not configured, keep 4.4.0-compatible local mode (do not auto-fallback if Redis is enabled but disconnects).
import http from 'node:http';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { initRunner, runCode, gradeCode, runnerInfo, engine as runnerEngine } from './runner/index.js';
import { createJudgeQueue, judgeRedisConfigured, JUDGE_QUEUE_NAME, renderJudgeQueueMetrics } from './judge-queue.js';

// Prevent the runner from calling back into JUDGE_SERVICE_URL when sharing an env file with the Backend.
process.env.JUDGE_LOCAL_EXECUTION = 'true';

const HOST = process.env.JUDGE_HOST || '127.0.0.1';
const PORT = Math.max(1, Math.min(65535, Number(process.env.JUDGE_PORT) || 4101));
const TOKEN = String(process.env.JUDGE_SERVICE_TOKEN || '');
const MAX_BODY = Math.max(1024, Math.min(1024 * 1024, Number(process.env.JUDGE_MAX_BODY_BYTES) || 256 * 1024));
const QUEUE_WAIT_MS = Math.max(1000, Math.min(120000, Number(process.env.JUDGE_QUEUE_WAIT_MS) || 55000));
const METRICS_TOKEN = String(process.env.JUDGE_METRICS_TOKEN || '');
const QUEUE_WARN_WAITING = Math.max(1, Math.min(100000, Number(process.env.JUDGE_QUEUE_WARN_WAITING) || 100));
const WORKER_CONCURRENCY = Math.max(1, Math.min(16, Number(process.env.JUDGE_WORKER_CONCURRENCY) || 2));
const USE_QUEUE = judgeRedisConfigured();
if (!TOKEN || TOKEN.length < 24) {
  console.error('[judge] JUDGE_SERVICE_TOKEN phải có ít nhất 24 ký tự.');
  process.exit(1);
}

let queue = null;
let events = null;
if (USE_QUEUE) {
  try {
    ({ queue, events } = await createJudgeQueue());
    console.log(`[judge] BullMQ enabled; queue=${JUDGE_QUEUE_NAME}`);
  } catch (err) {
    console.error('[judge] Redis/BullMQ không sẵn sàng; dừng fail-closed:', err?.message || err);
    process.exit(1);
  }
} else {
  initRunner(console);
  if (String(process.env.JUDGE_REQUIRE_DOCKER || 'true').toLowerCase() !== 'false' && runnerEngine() !== 'docker') {
    console.error('[judge] JUDGE_REQUIRE_DOCKER=true nhưng Docker/image không sẵn sàng; từ chối khởi động, không chạy fallback interpreter.');
    process.exit(1);
  }
  console.warn('[judge] Redis chưa cấu hình: đang dùng chế độ local tương thích (không phải hàng đợi bền vững).');
}

// Backpressure (batch 1): estimate processing rate from recently completed jobs to
// reject early when the queue is too long, instead of making users wait 55s before timing out.
// Default throughput at startup: each worker averages 1 job / 2s.
const BP_STARTED_AT = Date.now();
const BP_COMPLETIONS = [];
const BP_MAX_WAIT_SEC = Math.max(10, Math.min(120, Number(process.env.JUDGE_BP_MAX_WAIT_SEC) || 45));
const BP_MAX_WAITING = Math.max(100, Math.min(5000, Number(process.env.JUDGE_BP_MAX_WAITING) || 1000));
if (events) events.on('completed', () => {
  const now = Date.now();
  BP_COMPLETIONS.push(now);
  while (BP_COMPLETIONS.length && BP_COMPLETIONS[0] < now - 60000) BP_COMPLETIONS.shift();
});
function bpEstimateWaitSec(position) {
  const now = Date.now();
  while (BP_COMPLETIONS.length && BP_COMPLETIONS[0] < now - 60000) BP_COMPLETIONS.shift();
  const uptimeSec = (now - BP_STARTED_AT) / 1000;
  let rate;
  if (BP_COMPLETIONS.length >= 5) rate = BP_COMPLETIONS.length / 60;
  else if (uptimeSec < 90) rate = WORKER_CONCURRENCY / 2;
  else rate = BP_COMPLETIONS.length > 0 ? BP_COMPLETIONS.length / 60 : 1 / 30;
  return Math.max(1, Math.ceil(position / rate));
}
async function bpCheck() {
  let counts;
  try { counts = await queue.getJobCounts('waiting', 'active'); }
  catch { return null; } // Fail-open: on Redis read errors, let the main handler report the failure.
  const waiting = Number(counts.waiting || 0), active = Number(counts.active || 0);
  const position = waiting + active;
  const waitSec = bpEstimateWaitSec(position);
  if (waiting >= BP_MAX_WAITING || waitSec > BP_MAX_WAIT_SEC) {
    return { position, waiting, retryAfterSec: waitSec, error: `Máy chấm đang bận, còn khoảng ${position} lượt trước bạn. Thử lại sau khoảng ${waitSec} giây.` };
  }
  return null;
}

function send(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(data),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  res.end(data);
}
async function readBody(req) {
  let size = 0; const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error('Payload quá lớn'), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }
  catch { throw Object.assign(new Error('JSON không hợp lệ'), { status: 400 }); }
}
function requestId(req) {
  const incoming = String(req.headers['x-request-id'] || '').trim();
  return /^[A-Za-z0-9_-]{8,100}$/.test(incoming) ? incoming : randomUUID();
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/internal/metrics') {
    const supplied = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const a = Buffer.from(METRICS_TOKEN, 'utf8'), b = Buffer.from(supplied, 'utf8');
    const allowed = a.length >= 24 && a.length === b.length && timingSafeEqual(a, b);
    if (!allowed) return send(res, METRICS_TOKEN.length >= 24 ? 401 : 404, { ok: false, error: 'Not found' });
    if (!queue) return send(res, 503, { ok: false, error: 'BullMQ/Redis chưa được bật.' });
    try {
      const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused');
      const body = renderJudgeQueueMetrics(counts, { concurrency: WORKER_CONCURRENCY, warningDepth: QUEUE_WARN_WAITING });
      res.writeHead(200, { 'content-type': 'text/plain; version=0.0.4; charset=utf-8', 'content-length': Buffer.byteLength(body), 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
      return res.end(body);
    } catch { return send(res, 503, { ok: false, error: 'Không đọc được trạng thái Redis/BullMQ.' }); }
  }
  if (req.method === 'GET' && req.url === '/health') {
    let counts = null;
    if (queue) {
      try { counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'); }
      catch { return send(res, 503, { ok: false, service: 'pythonlab-judge', mode: 'bullmq', queue: JUDGE_QUEUE_NAME, redis: 'unavailable' }); }
    }
    return send(res, 200, {
      ok: true,
      service: 'pythonlab-judge',
      mode: queue ? 'bullmq' : 'local-compatibility',
      queue: queue ? JUDGE_QUEUE_NAME : null,
      queueCounts: counts,
      queuePressure: counts ? ((Number(counts.waiting || 0) + Number(counts.delayed || 0)) >= QUEUE_WARN_WAITING ? 'high' : 'normal') : null,
      runner: queue ? 'delegated-to-judge-worker' : runnerInfo(),
    });
  }
  if (req.method !== 'POST' || !['/internal/run', '/internal/grade'].includes(req.url)) return send(res, 404, { ok: false, error: 'Not found' });
  if (req.headers.authorization !== `Bearer ${TOKEN}`) return send(res, 401, { ok: false, error: 'Unauthorized' });
  try {
    const body = await readBody(req);
    if (typeof body.code !== 'string' || body.code.length > 50000) return send(res, 400, { ok: false, error: 'Code không hợp lệ hoặc vượt 50 KB' });
    const op = req.url.endsWith('/run') ? 'run' : 'grade';
    if (op === 'grade' && (!body.exercise || typeof body.exercise !== 'object')) return send(res, 400, { ok: false, error: 'Thiếu thông tin bài tập' });
    let result;
    if (queue) {
      const id = requestId(req);
      const bp = await bpCheck();
      if (bp) return send(res, 429, { ok: false, error: bp.error, retryAfterSec: bp.retryAfterSec, position: bp.position, waiting: bp.waiting });
      const job = await queue.add(op, { op, payload: body }, { jobId: `${op}-${id}` });
      result = await job.waitUntilFinished(events, QUEUE_WAIT_MS);
    } else {
      result = op === 'run'
        ? await runCode(body.code, String(body.stdin || '').slice(0, 20000))
        : await gradeCode(body.code, body.exercise);
    }
    return send(res, 200, { ok: true, result });
  } catch (error) {
    const timedOut = /timed out|timeout/i.test(error?.message || '') || error?.name === 'TimeoutError';
    const status = error.status || (timedOut ? 504 : queue ? 503 : 500);
    return send(res, status, { ok: false, error: timedOut ? 'Hết thời gian chờ hàng đợi chấm bài. Tác vụ có thể vẫn đang được xử lý.' : (error.message || 'Judge error') });
  }
});

server.listen(PORT, HOST, () => console.log(`[judge] API listening on http://${HOST}:${PORT}; mode=${queue ? 'bullmq' : 'local-compatibility'}`));
let closing = false;
async function shutdown(signal) {
  if (closing) return;
  closing = true;
  console.log(`[judge] ${signal}: closing HTTP and queue connections...`);
  server.close(async () => {
    try { if (events) await events.close(); if (queue) await queue.close(); process.exit(0); }
    catch (err) { console.error('[judge] shutdown error:', err); process.exit(1); }
  });
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => shutdown(signal));
