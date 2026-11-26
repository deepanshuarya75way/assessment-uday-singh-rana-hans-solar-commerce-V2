/**
 * Verifies public JSON responses do not emit ETags.
 * Run: node scripts/verify-public-cache-headers.js
 */
import express from 'express';
import { setPublicJsonCache } from '../src/utils/publicCache.js';

const app = express();
app.set('etag', false);

app.get('/api/v1/catalog/categories', (_req, res) => {
  setPublicJsonCache(res);
  res.status(200).json({ success: true, data: { categories: [] } });
});

const server = app.listen(0, async () => {
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}/api/v1/catalog/categories`;

  const first = await fetch(url);
  const etag = first.headers.get('etag');
  const cacheControl = first.headers.get('cache-control');
  const body = await first.json();

  console.log('Status:', first.status);
  console.log('Cache-Control:', cacheControl);
  console.log('ETag:', etag ?? '(none)');
  console.log('Body:', body);

  const second = await fetch(url, {
    headers: etag ? { 'If-None-Match': etag } : {},
  });
  const secondBody = await second.text();

  console.log('Revalidate status:', second.status);
  console.log('Revalidate body length:', secondBody.length);

  server.close();

  const ok =
    first.status === 200 &&
    cacheControl?.includes('no-store') &&
    !etag &&
    second.status === 200 &&
    secondBody.length > 0;

  process.exit(ok ? 0 : 1);
});
