/**
 * Verifies failed loader results are not cached.
 * Run: node scripts/verify-memory-cache-errors.js
 */
import { getMemoryCached, clearMemoryCache } from '../src/utils/memoryCache.js';

clearMemoryCache();

let attempts = 0;

const loader = async () => {
  attempts += 1;
  throw new Error('db unavailable');
};

let failures = 0;

for (let i = 0; i < 3; i += 1) {
  try {
    await getMemoryCached('test-key', 60_000, loader);
  } catch {
    failures += 1;
  }
}

console.log('Loader attempts:', attempts);
console.log('Expected: 3 (no cached rejection)');

clearMemoryCache();
process.exit(attempts === 3 ? 0 : 1);
