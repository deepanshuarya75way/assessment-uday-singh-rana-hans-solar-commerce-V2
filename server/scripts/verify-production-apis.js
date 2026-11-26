const base = 'https://hans-ecommerse-2026.onrender.com';
const apis = [
  '/api/v1/homepage/banners',
  '/api/v1/catalog/categories',
  '/api/v1/catalog/products/featured',
];

const check = async (path) => {
  const started = Date.now();
  const response = await fetch(`${base}${path}`, { cache: 'no-store' });
  const elapsed = Date.now() - started;
  const text = await response.text();
  return {
    path,
    status: response.status,
    elapsed,
    size: text.length,
  };
};

const headImage = async (url) => {
  const started = Date.now();
  const response = await fetch(url, { method: 'HEAD' });
  return {
    url: url.slice(0, 90) + '...',
    status: response.status,
    elapsed: Date.now() - started,
    bytes: Number(response.headers.get('content-length') || 0),
    type: response.headers.get('content-type'),
  };
};

console.log('Production refresh test (12 rounds)\n');

for (let refresh = 1; refresh <= 12; refresh += 1) {
  const results = await Promise.all(apis.map(check));
  const failed = results.filter((r) => r.status >= 400);
  console.log(
    `Refresh ${refresh}: ${results.map((r) => `${r.path.split('/').pop()}=${r.status}(${r.elapsed}ms)`).join(' | ')}${failed.length ? ' *** FAIL ***' : ''}`,
  );
}

const bannerJson = await fetch(`${base}/api/v1/homepage/banners`, {
  cache: 'no-store',
}).then((r) => r.json());

const first = bannerJson?.data?.banners?.[0];
if (first) {
  console.log('\nFirst banner image delivery:');
  const targets = [
    ['mobile', first.mobileImageUrl || first.imageUrl],
    ['desktop', first.imageUrl],
  ];
  for (const [label, url] of targets) {
    const info = await headImage(url);
    console.log(
      `  ${label}: ${info.status} ${Math.round(info.bytes / 1024)}KB ${info.type} ${info.elapsed}ms`,
    );
  }
}
