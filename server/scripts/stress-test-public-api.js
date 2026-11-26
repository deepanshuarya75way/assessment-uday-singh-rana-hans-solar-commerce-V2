/**
 * Verifies homepage refresh traffic no longer trips rate limiters.
 * Run: node scripts/stress-test-public-api.js
 */
import express from 'express';
import cors from 'cors';
import rateLimiter from '../src/middleware/rateLimiter.js';
import { setPublicJsonCache } from '../src/utils/publicCache.js';

const app = express();

app.set('trust proxy', 1);
app.set('etag', false);
app.use(
  cors({
    origin: 'https://store.hanssolar.in',
    credentials: true,
  }),
);
app.use(rateLimiter);

const sendPublicJson = (res, payload) => {
  setPublicJsonCache(res);
  res.status(200).json(payload);
};

app.get('/api/v1/catalog/categories', (_req, res) =>
  sendPublicJson(res, { success: true, data: { categories: [] } }),
);
app.get('/api/v1/site/media', (_req, res) =>
  sendPublicJson(res, { success: true, data: { media: [] } }),
);
app.get('/api/v1/homepage/banners', (_req, res) =>
  sendPublicJson(res, { success: true, data: { banners: [] } }),
);
app.get('/api/v1/festivals/active', (_req, res) =>
  sendPublicJson(res, { success: true, data: { festival: null } }),
);
app.get('/api/v1/catalog/products/featured', (_req, res) =>
  sendPublicJson(res, { success: true, data: {} }),
);
app.post('/api/v1/analytics/visit', (_req, res) =>
  res.status(200).json({ success: true }),
);

const server = app.listen(0, async () => {
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  const origin = 'https://store.hanssolar.in';

  const endpoints = [
    { method: 'GET', path: '/api/v1/catalog/categories' },
    { method: 'GET', path: '/api/v1/site/media' },
    { method: 'GET', path: '/api/v1/homepage/banners' },
    { method: 'GET', path: '/api/v1/festivals/active' },
    { method: 'GET', path: '/api/v1/catalog/products/featured' },
    { method: 'POST', path: '/api/v1/analytics/visit' },
  ];

  const requestEndpoint = async (endpoint, withAuth = false) => {
    const headers = {
      Origin: origin,
      'Content-Type': 'application/json',
    };

    if (withAuth) {
      headers.Authorization = 'Bearer test-token';
    }

    if (endpoint.method === 'OPTIONS') {
      headers['Access-Control-Request-Method'] = endpoint.actualMethod;
      headers['Access-Control-Request-Headers'] = 'authorization,content-type';
    }

    const response = await fetch(`${base}${endpoint.path}`, {
      method: endpoint.method,
      headers,
      body: endpoint.method === 'POST' ? '{}' : undefined,
    });

    return response.status;
  };

  const simulateRefresh = async (refreshNumber, withAuth = false) => {
    const statuses = [];

    for (const endpoint of endpoints) {
      if (withAuth || endpoint.method === 'POST') {
        statuses.push(
          await requestEndpoint(
            {
              method: 'OPTIONS',
              path: endpoint.path,
              actualMethod: endpoint.method,
            },
            withAuth,
          ),
        );
      }

      statuses.push(await requestEndpoint(endpoint, withAuth));
    }

    const failed = statuses.filter((status) => status === 429);
    if (failed.length > 0) {
      console.log(`Refresh ${refreshNumber}: FAILED (${failed.length} x 429)`);
      return false;
    }

    return true;
  };

  let passed = 0;
  const targetRefreshes = 50;

  for (let refresh = 1; refresh <= targetRefreshes; refresh += 1) {
    const ok = await simulateRefresh(refresh, true);
    if (!ok) {
      console.log(`Stopped at refresh ${refresh} with admin Authorization header`);
      break;
    }
    passed += 1;
  }

  console.log(`Passed ${passed}/${targetRefreshes} refreshes with auth header + CORS preflight`);

  server.close();
  process.exit(passed === targetRefreshes ? 0 : 1);
});
