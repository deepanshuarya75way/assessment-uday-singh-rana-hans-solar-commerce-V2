/**
 * Local load test for public read endpoints.
 * Run server first, then: node scripts/load-test-public-api.js
 */
import rateLimiter from '../src/middleware/rateLimiter.js';
import express from 'express';
import { setPublicJsonCache } from '../src/utils/publicCache.js';

const app = express();
app.set('etag', false);
app.use(rateLimiter);

const sendJson = (res, payload) => {
  setPublicJsonCache(res);
  res.status(200).json(payload);
};

app.get('/api/v1/catalog/categories', (_req, res) =>
  sendJson(res, { success: true, data: { categories: [] } }),
);
app.get('/api/v1/catalog/products/featured', (_req, res) =>
  sendJson(res, { success: true, data: {} }),
);
app.get('/api/v1/homepage/banners', (_req, res) =>
  sendJson(res, { success: true, data: { banners: [] } }),
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runConcurrent = async (baseUrl, concurrency, durationMs) => {
  const paths = [
    '/api/v1/catalog/categories',
    '/api/v1/catalog/products/featured',
    '/api/v1/homepage/banners',
  ];

  const stats = {
    total: 0,
    success: 0,
    rateLimited: 0,
    errors: 0,
    latencies: [],
  };

  const startedAt = Date.now();
  let running = true;

  const worker = async () => {
    while (running) {
      const path = paths[stats.total % paths.length];
      const requestStartedAt = Date.now();

      try {
        const response = await fetch(`${baseUrl}${path}`);
        stats.latencies.push(Date.now() - requestStartedAt);
        stats.total += 1;

        if (response.status === 200) {
          stats.success += 1;
        } else if (response.status === 429) {
          stats.rateLimited += 1;
        } else {
          stats.errors += 1;
        }
      } catch {
        stats.total += 1;
        stats.errors += 1;
      }

      if (Date.now() - startedAt >= durationMs) {
        running = false;
        break;
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const sorted = stats.latencies.sort((a, b) => a - b);
  const percentile = (p) =>
    sorted.length > 0 ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : 0;

  return {
    concurrency,
    durationMs,
    total: stats.total,
    success: stats.success,
    rateLimited: stats.rateLimited,
    errors: stats.errors,
    rps: Number((stats.total / (durationMs / 1000)).toFixed(1)),
    avgMs:
      sorted.length > 0
        ? Number((sorted.reduce((sum, value) => sum + value, 0) / sorted.length).toFixed(1))
        : 0,
    p95Ms: percentile(0.95),
    p99Ms: percentile(0.99),
  };
};

const server = app.listen(0, async () => {
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const levels = [10, 50, 100, 250, 500, 1000];
  console.log('Public API load test (mock handlers, in-memory rate limiter)\n');

  for (const concurrency of levels) {
    const result = await runConcurrent(baseUrl, concurrency, 5000);
    console.log(
      `${String(concurrency).padStart(4)} users | ${result.rps} rps | avg ${result.avgMs}ms | p95 ${result.p95Ms}ms | p99 ${result.p99Ms}ms | 429=${result.rateLimited} err=${result.errors}`,
    );
    await sleep(250);
  }

  server.close();
});
