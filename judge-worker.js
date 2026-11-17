// Dedicated worker process: only this process is allowed to invoke the Docker runner.
import { initRunner, runCode, gradeCode, runnerInfo, engine as runnerEngine } from './runner/index.js';
import { JUDGE_QUEUE_NAME, JUDGE_QUEUE_PREFIX, judgeRedisConfigured, judgeRedisOptions } from './judge-queue.js';

// Worker executes locally and never sends requests back to the Judge API.
process.env.JUDGE_LOCAL_EXECUTION = 'true';

if (!judgeRedisConfigured()) {
  console.error('[judge-worker] Can JUDGE_REDIS_URL hoac REDIS_URL.');
  process.exit(1);
}

const concurrency = Math.max(1, Math.min(16, Number(process.env.JUDGE_WORKER_CONCURRENCY) || 2));
initRunner(console);
if (String(process.env.JUDGE_REQUIRE_DOCKER || 'true').toLowerCase() !== 'false' && runnerEngine() !== 'docker') {
  console.error('[judge-worker] RUNNER phải là docker và phải có Docker image sẵn sàng; từ chối chạy fallback interpreter trong chế độ production.');
  process.exit(1);
}
const { Worker } = await import('bullmq');
const worker = new Worker(JUDGE_QUEUE_NAME, async (job) => {
  const { op, payload } = job.data || {};
  if (!['run', 'grade'].includes(op) || !payload || typeof payload.code !== 'string') {
    throw new Error('Judge job không hợp lệ');
  }
  if (payload.code.length > 50000) throw new Error('Code vượt giới hạn 50 KB');
  if (op === 'run') return await runCode(payload.code, String(payload.stdin || '').slice(0, 20000));
  if (!payload.exercise || typeof payload.exercise !== 'object') throw new Error('Thiếu thông tin bài tập');
  return await gradeCode(payload.code, payload.exercise);
}, {
  connection: judgeRedisOptions({ worker: true }),
  prefix: JUDGE_QUEUE_PREFIX,
  concurrency,
  lockDuration: Math.max(15000, Number(process.env.JUDGE_JOB_LOCK_MS) || 60000),
  stalledInterval: Math.max(5000, Number(process.env.JUDGE_STALLED_INTERVAL_MS) || 30000),
  maxStalledCount: 2,
});

worker.on('ready', () => console.log(`[judge-worker] ready; queue=${JUDGE_QUEUE_NAME}; concurrency=${concurrency}; runner=${JSON.stringify(runnerInfo())}`));
worker.on('active', (job) => console.log(`[judge-worker] active ${job.id} (${job.data?.op})`));
worker.on('completed', (job) => console.log(`[judge-worker] completed ${job.id}`));
worker.on('failed', (job, err) => console.error(`[judge-worker] failed ${job?.id}: ${err?.message || err}`));
worker.on('error', (err) => console.error('[judge-worker] worker error:', err));
await worker.waitUntilReady();

let closing = false;
async function shutdown(signal) {
  if (closing) return;
  closing = true;
  console.log(`[judge-worker] ${signal}: draining active jobs...`);
  try { await worker.close(); process.exit(0); }
  catch (err) { console.error('[judge-worker] shutdown error:', err); process.exit(1); }
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => shutdown(signal));
