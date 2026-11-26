import crypto from 'crypto';
import prisma from '../config/prisma.js';
import config from '../config/index.js';
import ApiError from '../utils/ApiError.js';
import { verifyAdminToken } from '../utils/jwt.js';
import { lookupCachedGeoByIp, getClientIp, isPrivateOrLocalIp } from '../utils/geoLocation.js';

export const VISITOR_COOKIE = 'hs_vid';
const COOKIE_MAX_AGE_MS = 365 * 2 * 24 * 60 * 60 * 1000;

const getVisitDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const getMonthStartKey = (date = new Date()) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-01`;

const getWeekStartKey = (date = new Date()) => {
  const weekStart = new Date(date);
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);
  return getVisitDateKey(weekStart);
};

const setVisitorCookie = (res, visitorKey) => {
  res.cookie(VISITOR_COOKIE, visitorKey, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
  });
};

const resolveAuthenticatedAdmin = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyAdminToken(token);

    if (decoded.role !== 'admin' || decoded.stage !== 'authenticated') {
      return null;
    }

    return prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true },
    });
  } catch {
    return null;
  }
};

const GEOGRAPHY_PERIODS = {
  today: { label: 'Today', days: 0 },
  '7d': { label: '7 Days', days: 6 },
  '30d': { label: '30 Days', days: 29 },
  '3m': { label: '3 Months', days: 89 },
  '1y': { label: '1 Year', days: 364 },
  overall: { label: 'Overall', days: null },
};
const MAJOR_BREAKDOWN_LIMIT = 8;
const ID_QUERY_CHUNK = 4000;
const UNKNOWN_LOCATION_LABEL = 'Unknown';
const OTHER_LOCATION_LABEL = 'Other';

const addUtcDays = (date, days) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const shouldLookupVisitorLocation = (visitor) => {
  if (visitor.country || visitor.countryCode) {
    return false;
  }

  return true;
};

const resolveGeoIp = (requestIp, storedIp) => {
  if (requestIp && !isPrivateOrLocalIp(requestIp)) {
    return requestIp;
  }

  if (storedIp && !isPrivateOrLocalIp(storedIp)) {
    return storedIp;
  }

  return '';
};

const applyVisitorLocation = async (req, visitor) => {
  const requestIp = getClientIp(req);
  const geoIp = resolveGeoIp(requestIp, visitor.ip);
  const data = {};

  if (requestIp && requestIp !== visitor.ip) {
    data.ip = requestIp;
  }

  if (shouldLookupVisitorLocation(visitor) && geoIp) {
    const geo = await lookupCachedGeoByIp(geoIp);

    if (geo) {
      if (geo.country) {
        data.country = geo.country;
      }
      if (geo.countryCode) {
        data.countryCode = geo.countryCode;
      }
      if (geo.region) {
        data.region = geo.region;
      }
      if (geo.city) {
        data.city = geo.city;
      }
      data.locationLookedUpAt = new Date();
    }
  }

  if (Object.keys(data).length === 0) {
    return;
  }

  await prisma.visitor.update({
    where: { id: visitor.id },
    data,
  });
};

const upsertTrackedVisitor = async (req, res) => {
  let visitorKey = req.cookies[VISITOR_COOKIE];

  if (!visitorKey || typeof visitorKey !== 'string') {
    visitorKey = crypto.randomUUID();
    setVisitorCookie(res, visitorKey);
  }

  const admin = await resolveAuthenticatedAdmin(req);
  const clientIp = getClientIp(req) || null;

  const visitor = await prisma.visitor.upsert({
    where: { visitorKey },
    create: {
      visitorKey,
      adminId: admin?.id ?? null,
      name: admin?.name ?? null,
      ...(clientIp ? { ip: clientIp } : {}),
    },
    update: {
      lastSeenAt: new Date(),
      ...(clientIp ? { ip: clientIp } : {}),
      ...(admin
        ? {
            adminId: admin.id,
            name: admin.name,
          }
        : {}),
    },
  });

  try {
    await applyVisitorLocation(req, visitor);
  } catch {
    // Geolocation must not block or reverse visit recording.
  }

  return visitor;
};

const isIndiaLocation = (country, countryCode) =>
  countryCode === 'IN' || String(country || '').toLowerCase() === 'india';

const percentOf = (count, total) => {
  if (!total) {
    return 0;
  }

  return Math.round((count / total) * 1000) / 10;
};

const toBreakdownItems = (rows, total, { drillable } = {}) => {
  const sorted = [...rows].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
  const major = sorted.slice(0, MAJOR_BREAKDOWN_LIMIT);
  const remainder = sorted.slice(MAJOR_BREAKDOWN_LIMIT);
  const otherCount = remainder.reduce((sum, row) => sum + row.count, 0);

  const items = major.map((row) => ({
    name: row.name,
    count: row.count,
    percent: percentOf(row.count, total),
    drillable: Boolean(drillable) && row.name !== UNKNOWN_LOCATION_LABEL,
  }));

  if (otherCount > 0) {
    items.push({
      name: OTHER_LOCATION_LABEL,
      count: otherCount,
      percent: percentOf(otherCount, total),
      drillable: false,
    });
  }

  return items;
};

const chunkIds = (ids) => {
  const chunks = [];
  for (let index = 0; index < ids.length; index += ID_QUERY_CHUNK) {
    chunks.push(ids.slice(index, index + ID_QUERY_CHUNK));
  }
  return chunks;
};

const getVisitorIdsForPeriod = async (period) => {
  if (period === 'overall') {
    return null;
  }

  const now = new Date();
  const today = getVisitDateKey(now);
  const start =
    period === 'today'
      ? today
      : getVisitDateKey(addUtcDays(now, -GEOGRAPHY_PERIODS[period].days));

  const groups = await prisma.visitorDailyVisit.groupBy({
    by: ['visitorId'],
    where:
      period === 'today'
        ? { visitDate: today }
        : { visitDate: { gte: start } },
  });

  return groups.map((group) => group.visitorId);
};

const loadVisitorLocations = async (visitorIds, extraWhere = {}) => {
  const select = {
    country: true,
    countryCode: true,
    region: true,
    city: true,
  };

  if (!visitorIds) {
    return prisma.visitor.findMany({
      where: extraWhere,
      select,
    });
  }

  if (visitorIds.length === 0) {
    return [];
  }

  const rows = [];
  for (const ids of chunkIds(visitorIds)) {
    const chunkRows = await prisma.visitor.findMany({
      where: { id: { in: ids }, ...extraWhere },
      select,
    });
    rows.push(...chunkRows);
  }
  return rows;
};

const aggregateByKey = (visitors, getKey) => {
  const counts = new Map();

  for (const visitor of visitors) {
    const name = getKey(visitor) || UNKNOWN_LOCATION_LABEL;
    counts.set(name, (counts.get(name) || 0) + 1);
  }

  return [...counts.entries()].map(([name, count]) => ({ name, count }));
};

export const recordSiteVisit = async (req, res) => {
  const visitor = await upsertTrackedVisitor(req, res);

  const visitDate = getVisitDateKey();

  await prisma.visitorDailyVisit.upsert({
    where: {
      visitorId_visitDate: {
        visitorId: visitor.id,
        visitDate,
      },
    },
    create: {
      visitorId: visitor.id,
      visitDate,
    },
    update: {},
  });

  return { recorded: true };
};

export const recordProductView = async (req, res, productId) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
    select: { id: true },
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const visitor = await upsertTrackedVisitor(req, res);

  const visitDate = getVisitDateKey();

  await prisma.visitorDailyVisit.upsert({
    where: {
      visitorId_visitDate: {
        visitorId: visitor.id,
        visitDate,
      },
    },
    create: {
      visitorId: visitor.id,
      visitDate,
    },
    update: {},
  });

  await prisma.productView.upsert({
    where: {
      visitorId_productId: {
        visitorId: visitor.id,
        productId: product.id,
      },
    },
    create: {
      visitorId: visitor.id,
      productId: product.id,
    },
    update: {},
  });

  return { recorded: true };
};

export const getVisitorAnalytics = async () => {
  const now = new Date();
  const today = getVisitDateKey(now);
  const weekStart = getWeekStartKey(now);
  const monthStart = getMonthStartKey(now);

  const [daily, weeklyGroups, monthlyGroups, overall] = await Promise.all([
    prisma.visitorDailyVisit.count({
      where: { visitDate: today },
    }),
    prisma.visitorDailyVisit.groupBy({
      by: ['visitorId'],
      where: { visitDate: { gte: weekStart } },
    }),
    prisma.visitorDailyVisit.groupBy({
      by: ['visitorId'],
      where: { visitDate: { gte: monthStart } },
    }),
    prisma.visitor.count(),
  ]);

  return {
    daily,
    weekly: weeklyGroups.length,
    monthly: monthlyGroups.length,
    overall,
  };
};

export const getVisitorGeography = async ({
  period = 'overall',
  country,
  region,
} = {}) => {
  if (!GEOGRAPHY_PERIODS[period]) {
    throw new ApiError(400, 'Invalid geography period');
  }

  const selectedCountry = String(country || '').trim();
  const selectedRegion = String(region || '').trim();

  const visitorIds = await getVisitorIdsForPeriod(period);
  const visitors = await loadVisitorLocations(visitorIds);
  const total = visitors.length;

  let india = 0;
  let outsideIndia = 0;
  let unknown = 0;

  for (const visitor of visitors) {
    if (isIndiaLocation(visitor.country, visitor.countryCode)) {
      india += 1;
    } else if (!visitor.country && !visitor.countryCode) {
      unknown += 1;
    } else {
      outsideIndia += 1;
    }
  }

  const breadcrumb = [{ label: 'Overall', country: '', region: '' }];
  let level = 'country';
  let scoped = visitors;
  let chartTitle = 'Country-wise unique visitors';
  let drillable = true;

  if (selectedCountry) {
    scoped = visitors.filter((visitor) => {
      const name = visitor.country || UNKNOWN_LOCATION_LABEL;
      return name === selectedCountry || (selectedCountry === 'India' && isIndiaLocation(visitor.country, visitor.countryCode));
    });
    breadcrumb.push({
      label: selectedCountry,
      country: selectedCountry,
      region: '',
    });
    level = 'region';
    chartTitle = 'State-wise unique visitors';
    drillable = selectedCountry === 'India';
  }

  if (selectedCountry && selectedRegion) {
    scoped = scoped.filter(
      (visitor) => (visitor.region || UNKNOWN_LOCATION_LABEL) === selectedRegion,
    );
    breadcrumb.push({
      label: selectedRegion,
      country: selectedCountry,
      region: selectedRegion,
    });
    level = 'city';
    chartTitle = 'City-wise unique visitors';
    drillable = false;
  }

  const scopedTotal = scoped.length;
  const getKey =
    level === 'country'
      ? (visitor) => visitor.country
      : level === 'region'
        ? (visitor) => visitor.region
        : (visitor) => visitor.city;

  const items = toBreakdownItems(aggregateByKey(scoped, getKey), scopedTotal, {
    drillable: drillable && level !== 'city',
  });

  if (level === 'region' && selectedCountry !== 'India') {
    for (const item of items) {
      item.drillable = false;
    }
  }

  return {
    period,
    periodLabel: GEOGRAPHY_PERIODS[period].label,
    filters: {
      country: selectedCountry || null,
      region: selectedRegion || null,
    },
    summary: {
      total,
      india,
      outsideIndia,
      unknown,
      indiaPercent: percentOf(india, total),
      outsideIndiaPercent: percentOf(outsideIndia, total),
      unknownPercent: percentOf(unknown, total),
    },
    breakdown: {
      level,
      title: chartTitle,
      total: scopedTotal,
      items,
    },
    breadcrumb,
  };
};
