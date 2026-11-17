// Shared BullMQ configuration for Judge API and Judge Worker.
// Redis URL must be on a private network; do not use ioredis keyPrefix.
export const JUDGE_QUEUE_NAME = process.env.JUDGE_QUEUE_NAME || 'pythonlab-judge';
export const JUDGE_QUEUE_PREFIX = process.env.JUDGE_QUEUE_PREFIX || 'pylab';

export function judgeRedisConfigured() {
  return !!String(process.env.JUDGE_REDIS_URL || process.env.REDIS_URL || '').trim();
}

export function judgeRedisOptions({ worker = false } = {}) {
  const raw = String(process.env.JUDGE_REDIS_URL || process.env.REDIS_URL || '').trim();
  if (!raw) throw new Error('Thiếu JUDGE_REDIS_URL hoặc REDIS_URL');
  let url;
  try { url = new URL(raw); } catch { throw new Error('JUDGE_REDIS_URL không hợp lệ'); }
  if (!['redis:', 'rediss:'].includes(url.protocol)) throw new Error('JUDGE_REDIS_URL chỉ hỗ trợ redis:// hoặc rediss://');
  const dbText = url.pathname.replace(/^\//, '');
  const db = dbText ? Number(dbText) : 0;
  if (!Number.isInteger(db) || db < 0) throw new Error('Redis database index không hợp lệ');
  const options = {
    host: url.hostname,
    port: Number(url.port || 6379),
    db,
    maxRetriesPerRequest: worker ? null : 2,
    enableReadyCheck: true,
    connectTimeout: Math.max(1000, Math.min(15000, Number(process.env.JUDGE_REDIS_CONNECT_TIMEOUT_MS) || 5000)),
  };
  if (url.username) options.username = decodeURIComponent(url.username);
  if (url.password) options.password = decodeURIComponent(url.password);
  if (url.protocol === 'rediss:') options.tls = { servername: url.hostname };
  return options;
}

export async function createJudgeQueue() {
  const { Queue, QueueEvents } = await import('bullmq');
  const connection = judgeRedisOptions();
  const queue = new Queue(JUDGE_QUEUE_NAME, {
    connection,
    prefix: JUDGE_QUEUE_PREFIX,
    defaultJobOptions: {
      attempts: Math.max(1, Math.min(4, Number(process.env.JUDGE_JOB_ATTEMPTS) || 2)),
      backoff: { type: 'exponential', delay: 500 },
      removeOnComplete: { age: 600, count: 2000 },
      removeOnFail: { age: 86400, count: 5000 },
    },
  });
  const events = new QueueEvents(JUDGE_QUEUE_NAME, { connection: judgeRedisOptions({ worker: true }), prefix: JUDGE_QUEUE_PREFIX });
  await Promise.all([queue.waitUntilReady(), events.waitUntilReady()]);
  return { queue, events };
}

/** Render bounded-cardinality Prometheus metrics for the Judge queue. */
export function renderJudgeQueueMetrics(counts = {}, { concurrency = 2, warningDepth = 100 } = {}) {
  const states = ['waiting', 'active', 'completed', 'failed', 'delayed', 'paused'];
  const normalized = Object.fromEntries(states.map((state) => [state, Math.max(0, Math.floor(Number(counts[state]) || 0))]));
  const waiting = normalized.waiting + normalized.delayed;
  const pressure = waiting >= Math.max(1, Number(warningDepth) || 100) ? 1 : 0;
  const lines = [
    '# HELP pythonlab_judge_queue_jobs Number of BullMQ jobs by state.',
    '# TYPE pythonlab_judge_queue_jobs gauge',
    ...states.map((state) => `pythonlab_judge_queue_jobs{state="${state}"} ${normalized[state]}`),
    '# HELP pythonlab_judge_queue_waiting_total Waiting plus delayed jobs.',
    '# TYPE pythonlab_judge_queue_waiting_total gauge',
    `pythonlab_judge_queue_waiting_total ${waiting}`,
    '# HELP pythonlab_judge_queue_pressure Queue backlog warning threshold reached.',
    '# TYPE pythonlab_judge_queue_pressure gauge',
    `pythonlab_judge_queue_pressure ${pressure}`,
    '# HELP pythonlab_judge_worker_concurrency_target Configured BullMQ worker concurrency.',
    '# TYPE pythonlab_judge_worker_concurrency_target gauge',
    `pythonlab_judge_worker_concurrency_target ${Math.max(1, Math.min(16, Math.floor(Number(concurrency) || 2)))}`,
    '',
  ];
  return lines.join('\n');
}
