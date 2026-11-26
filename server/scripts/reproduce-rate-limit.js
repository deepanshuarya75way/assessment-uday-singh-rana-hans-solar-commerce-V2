/**
 * Simulates one homepage refresh worth of API traffic (including CORS preflight).
 * Run: node scripts/reproduce-rate-limit.js
 */
import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

const app = express();

app.set('trust proxy', 1);

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

app.use(
  cors({
    origin: 'https://store.hanssolar.in',
    credentials: true,
  }),
);
app.use(rateLimiter);

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/api/v1/catalog/categories', (_req, res) =>
  res.status(200).json({ success: true, data: { categories: [] } }),
);
app.get('/api/v1/site/media', (_req, res) =>
  res.status(200).json({ success: true, data: { media: [] } }),
);
app.get('/api/v1/homepage/banners', (_req, res) =>
  res.status(200).json({ success: true, data: { banners: [] } }),
);
app.get('/api/v1/festivals/active', (_req, res) =>
  res.status(200).json({ success: true, data: { festival: null } }),
);
app.get('/api/v1/catalog/products/featured', (_req, res) =>
  res.status(200).json({ success: true, data: {} }),
);
app.post('/api/v1/analytics/visit', (_req, res) =>
  res.status(200).json({ success: true }),
);

const server = app.listen(0, async () => {
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  const origin = 'https://store.hanssolar.in';

  const homepageEndpoints = [
    { method: 'GET', path: '/health' },
    { method: 'GET', path: '/api/v1/catalog/categories' },
    { method: 'GET', path: '/api/v1/site/media' },
    { method: 'GET', path: '/api/v1/homepage/banners' },
    { method: 'GET', path: '/api/v1/festivals/active' },
    { method: 'GET', path: '/api/v1/catalog/products/featured' },
    { method: 'POST', path: '/api/v1/analytics/visit' },
  ];

  const requestOnce = async (endpoint) => {
    const headers = {
      Origin: origin,
      'Content-Type': 'application/json',
    };

    if (endpoint.method === 'OPTIONS') {
      headers['Access-Control-Request-Method'] = endpoint.actualMethod;
      headers['Access-Control-Request-Headers'] = 'content-type';
    }

    const response = await fetch(`${base}${endpoint.path}`, {
      method: endpoint.method,
      headers,
      body: endpoint.method === 'POST' ? '{}' : undefined,
    });

    return response.status;
  };

  const simulateRefresh = async (refreshNumber) => {
    const statuses = [];

    for (const endpoint of homepageEndpoints) {
      if (endpoint.method !== 'GET' && endpoint.path !== '/health') {
        const preflightStatus = await requestOnce({
          method: 'OPTIONS',
          path: endpoint.path,
          actualMethod: endpoint.method,
        });
        statuses.push({ type: 'OPTIONS', path: endpoint.path, status: preflightStatus });
      }

      const status = await requestOnce(endpoint);
      statuses.push({ type: endpoint.method, path: endpoint.path, status });
    }

    const failed = statuses.filter((entry) => entry.status === 429);
    console.log(
      `Refresh ${refreshNumber}: ${statuses.length} server hits, ${failed.length} rate-limited`,
    );

    if (failed.length > 0) {
      console.log('  First failures:', failed.slice(0, 3));
    }

    return failed.length;
  };

  let totalHits = 0;
  for (let refresh = 1; refresh <= 10; refresh += 1) {
    const failures = await simulateRefresh(refresh);
    totalHits += homepageEndpoints.length + 1; // approx
    if (failures > 0) {
      console.log(`\nRate limit triggered on refresh ${refresh}`);
      break;
    }
  }

  server.close();
});
