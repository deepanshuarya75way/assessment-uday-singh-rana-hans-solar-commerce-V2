const store = new Map();
const inflight = new Map();

export const getMemoryCached = async (key, ttlMs, loader) => {
  const now = Date.now();
  const cached = store.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  if (inflight.has(key)) {
    return inflight.get(key);
  }

  const pending = (async () => {
    const value = await loader();
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  })();

  inflight.set(key, pending);

  try {
    return await pending;
  } catch (error) {
    store.delete(key);
    throw error;
  } finally {
    if (inflight.get(key) === pending) {
      inflight.delete(key);
    }
  }
};

export const clearMemoryCache = (keyPrefix) => {
  if (!keyPrefix) {
    store.clear();
    inflight.clear();
    return;
  }

  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) {
      store.delete(key);
    }
  }

  for (const key of inflight.keys()) {
    if (key.startsWith(keyPrefix)) {
      inflight.delete(key);
    }
  }
};
