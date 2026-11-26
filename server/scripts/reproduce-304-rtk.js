/**
 * Tests Express ETag 304 behavior with fetch (same as RTK Query fetchBaseQuery).
 * Run: node scripts/reproduce-304-rtk.js
 */
import express from 'express';

const app = express();

app.get('/api/test', (_req, res) => {
  res.set('Cache-Control', 'no-cache, must-revalidate');
  res.status(200).json({ success: true, data: { items: [1, 2, 3] } });
});

const server = app.listen(0, async () => {
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}/api/test`;

  const first = await fetch(url);
  const firstBody = await first.text();
  const etag = first.headers.get('etag');

  console.log('First request:', first.status, 'ETag:', etag);
  console.log('First body length:', firstBody.length);

  const second = await fetch(url, {
    headers: etag ? { 'If-None-Match': etag } : {},
  });

  let secondBody = '';
  try {
    secondBody = await second.text();
  } catch (error) {
    secondBody = `[read error: ${error.message}]`;
  }

  console.log('Second request (revalidate):', second.status);
  console.log('Second body length:', secondBody.length);
  console.log('Second body:', secondBody || '(empty)');

  let parsed = null;
  try {
    parsed = secondBody ? JSON.parse(secondBody) : null;
  } catch (error) {
    console.log('JSON parse failed:', error.message);
  }

  console.log('Parsed JSON:', parsed);

  server.close();
});
