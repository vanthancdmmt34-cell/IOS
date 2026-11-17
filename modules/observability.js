// Metrics in-process: bounded cardinality, Prometheus text exposition, no external dependency.
import { monitorEventLoopDelay } from 'node:perf_hooks';

const BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
const MAX_SERIES = 250;
const clampLabel = (value, max = 80) => String(value || '').replace(/[\\"\n\r]/g, '_').slice(0, max);

export function normalizeMetricRoute(pathname = '/') {
  const p = String(pathname).split('?')[0];
  if (!p.startsWith('/api/')) return p === '/' ? '/' : (p.includes('.') ? '/static' : '/public');
  const safe = p.split('/').map((part, i) => {
    if (i === 0 || part === 'api' || !part) return part;
    if (/^\d+$/.test(part)) return ':id';
    if (/^[a-f0-9-]{24,}$/i.test(part)) return ':token';
    return part;
  }).join('/');
  return safe.length <= 120 ? safe : '/api/:other';
}

export class HttpMetrics {
  #series = new Map();
  #inflight = 0;
  #started = Date.now();
  #eventLoop = monitorEventLoopDelay({ resolution: 20 });
  constructor() { this.#eventLoop.enable(); }
  begin() { this.#inflight += 1; }
  record(method, route, status, durationSeconds) {
    this.#inflight = Math.max(0, this.#inflight - 1);
    const key = `${clampLabel(method, 12)}|${clampLabel(route, 120)}|${Number(status) || 0}`;
    let s = this.#series.get(key);
    if (!s) {
      if (this.#series.size >= MAX_SERIES) return;
      s = { method: clampLabel(method, 12), route: clampLabel(route, 120), status: String(Number(status) || 0), count: 0, sum: 0, buckets: BUCKETS.map(() => 0) };
      this.#series.set(key, s);
    }
    const d = Math.max(0, Number(durationSeconds) || 0);
    s.count += 1; s.sum += d;
    BUCKETS.forEach((b, i) => { if (d <= b) s.buckets[i] += 1; });
  }
  summary() {
    const mem = process.memoryUsage();
    let total = 0, sum = 0;
    for (const v of this.#series.values()) { total += v.count; sum += v.sum; }
    const lag = Number.isFinite(this.#eventLoop.mean) ? this.#eventLoop.mean / 1e9 : 0;
    return { uptimeSec: Math.max(0, (Date.now() - this.#started) / 1000), rss: mem.rss, heapUsed: mem.heapUsed, inflight: this.#inflight, eventLoopLagSec: lag, requestsTotal: total, avgLatencyMs: total ? (sum / total) * 1000 : 0 };
  }

  render() {
    const lines = [
      '# HELP liferivo_http_requests_total Total HTTP requests.',
      '# TYPE liferivo_http_requests_total counter',
    ];
    for (const s of this.#series.values()) lines.push(`liferivo_http_requests_total{method="${s.method}",route="${s.route}",status="${s.status}"} ${s.count}`);
    lines.push('# HELP liferivo_http_request_duration_seconds HTTP request latency in seconds.', '# TYPE liferivo_http_request_duration_seconds histogram');
    for (const s of this.#series.values()) {
      const labels = `method="${s.method}",route="${s.route}",status="${s.status}"`;
      BUCKETS.forEach((b, i) => lines.push(`liferivo_http_request_duration_seconds_bucket{${labels},le="${b}"} ${s.buckets[i]}`));
      lines.push(`liferivo_http_request_duration_seconds_bucket{${labels},le="+Inf"} ${s.count}`);
      lines.push(`liferivo_http_request_duration_seconds_sum{${labels}} ${s.sum.toFixed(6)}`);
      lines.push(`liferivo_http_request_duration_seconds_count{${labels}} ${s.count}`);
    }
    const mem = process.memoryUsage();
    const lag = Number.isFinite(this.#eventLoop.mean) ? this.#eventLoop.mean / 1e9 : 0;
    lines.push(
      '# HELP liferivo_process_uptime_seconds Process uptime in seconds.',
      '# TYPE liferivo_process_uptime_seconds gauge',
      `liferivo_process_uptime_seconds ${Math.max(0, (Date.now() - this.#started) / 1000).toFixed(3)}`,
      '# HELP liferivo_process_resident_memory_bytes Resident set size in bytes.',
      '# TYPE liferivo_process_resident_memory_bytes gauge',
      `liferivo_process_resident_memory_bytes ${mem.rss}`,
      '# HELP liferivo_process_heap_used_bytes V8 heap used in bytes.',
      '# TYPE liferivo_process_heap_used_bytes gauge',
      `liferivo_process_heap_used_bytes ${mem.heapUsed}`,
      '# HELP liferivo_http_inflight_requests Current in-flight HTTP requests.',
      '# TYPE liferivo_http_inflight_requests gauge',
      `liferivo_http_inflight_requests ${this.#inflight}`,
      '# HELP liferivo_event_loop_lag_seconds Mean event loop lag in seconds.',
      '# TYPE liferivo_event_loop_lag_seconds gauge',
      `liferivo_event_loop_lag_seconds ${lag.toFixed(6)}`,
      '',
    );
    return lines.join('\n');
  }
}
