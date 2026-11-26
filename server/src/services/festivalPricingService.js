import prisma from '../config/prisma.js';
import { getMemoryCached } from '../utils/memoryCache.js';
import { CACHE_KEYS } from '../utils/cacheKeys.js';

const ACTIVE_FESTIVAL_CACHE_MS = 60_000;

export const findActiveFestival = async () => {
  return getMemoryCached(CACHE_KEYS.ACTIVE_FESTIVAL, ACTIVE_FESTIVAL_CACHE_MS, async () => {
    const now = new Date();

    return prisma.festival.findFirst({
      where: {
        isEnabled: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      orderBy: [{ priority: 'desc' }, { startsAt: 'desc' }],
    });
  });
};
