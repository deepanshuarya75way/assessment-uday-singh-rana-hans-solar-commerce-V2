export const setPublicJsonCache = (res) => {
  // Public JSON is consumed by RTK Query/fetch, not browser document navigation.
  // Do not use HTTP revalidation (ETag/304) here — fetch clients cannot reliably
  // parse empty 304 bodies. Server-side memoryCache.js handles fast responses.
  res.set('Cache-Control', 'private, no-store');
};
