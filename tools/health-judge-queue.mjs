const base = String(process.env.JUDGE_SERVICE_URL || 'http://127.0.0.1:4101').replace(/\/$/, '');
try {
  const response = await fetch(`${base}/health`, { signal: AbortSignal.timeout(5000), cache: 'no-store' });
  const body = await response.json();
  console.log(JSON.stringify(body, null, 2));
  if (!response.ok || !body.ok) process.exitCode = 1;
  if (body.mode === 'bullmq' && body.queueCounts?.failed > 0) console.warn('[health] Có job failed; kiểm tra log Judge Worker.');
  if (body.queuePressure === 'high') console.warn('[health] Queue đang có backlog cao; kiểm tra worker concurrency, Docker và Redis.');
} catch (error) {
  console.error('[health] Không kết nối được Judge API:', error.message);
  process.exitCode = 1;
}
