import { getMemoryCached } from './memoryCache.js';

const GEO_SUCCESS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const GEO_LOOKUP_TIMEOUT_MS = 8000;

const PRIVATE_IPV4 =
  /^(127\.|10\.|192\.168\.|169\.254\.|0\.|255\.|(172\.(1[6-9]|2\d|3[0-1])\.))/;

const CLIENT_IP_HEADERS = [
  'cf-connecting-ip',
  'true-client-ip',
  'x-real-ip',
  'x-vercel-forwarded-for',
  'x-forwarded-for',
  'x-client-ip',
  'fly-client-ip',
];

const countryDisplayNames = new Intl.DisplayNames(['en'], { type: 'region' });

export const normalizeIp = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  let ip = value.trim();

  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }

  if (ip.startsWith('[') && ip.includes(']')) {
    ip = ip.slice(1, ip.indexOf(']'));
  }

  const ipv4WithPort = ip.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  if (ipv4WithPort) {
    ip = ipv4WithPort[1];
  }

  return ip;
};

const splitForwardedAddresses = (value) =>
  String(value)
    .split(',')
    .map((part) => normalizeIp(part))
    .filter(Boolean);

export const isPrivateOrLocalIp = (ip) => {
  if (!ip) {
    return true;
  }

  const normalized = normalizeIp(ip).toLowerCase();

  if (
    normalized === '::1' ||
    normalized === 'localhost' ||
    normalized === '::' ||
    normalized === '0:0:0:0:0:0:0:1'
  ) {
    return true;
  }

  if (PRIVATE_IPV4.test(normalized)) {
    return true;
  }

  if (
    normalized.startsWith('fe80:') ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd')
  ) {
    return true;
  }

  return false;
};

const firstPublicIp = (candidates) => {
  for (const candidate of candidates) {
    if (candidate && !isPrivateOrLocalIp(candidate)) {
      return candidate;
    }
  }

  return '';
};

export const getClientIp = (req) => {
  const headerCandidates = [];

  for (const header of CLIENT_IP_HEADERS) {
    const raw = req.headers[header];
    if (!raw) {
      continue;
    }

    if (Array.isArray(raw)) {
      for (const entry of raw) {
        headerCandidates.push(...splitForwardedAddresses(entry));
      }
    } else {
      headerCandidates.push(...splitForwardedAddresses(raw));
    }
  }

  headerCandidates.push(
    normalizeIp(req.ip || ''),
    normalizeIp(req.socket?.remoteAddress || ''),
  );

  return firstPublicIp(headerCandidates) || headerCandidates.find(Boolean) || '';
};

const countryNameFromCode = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) {
    return null;
  }

  try {
    return countryDisplayNames.of(countryCode.toUpperCase()) || null;
  } catch {
    return null;
  }
};

const normalizeGeoResult = (payload) => {
  if (!payload) {
    return null;
  }

  const countryCode = String(payload.countryCode || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 2);

  const country =
    String(payload.country || '').trim() || countryNameFromCode(countryCode);

  if (!country && !countryCode) {
    return null;
  }

  return {
    country: country || null,
    countryCode: countryCode || null,
    region: String(payload.region || '').trim() || null,
    city: String(payload.city || '').trim() || null,
  };
};

const fetchJsonWithTimeout = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEO_LOOKUP_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

export const lookupGeoByIp = async (ip) => {
  if (isPrivateOrLocalIp(ip)) {
    return null;
  }

  const encodedIp = encodeURIComponent(ip);

  const resolveOrReject = async (loader) => {
    const geo = await loader();
    if (!geo) {
      throw new Error('geo-miss');
    }
    return geo;
  };

  try {
    return await Promise.any([
      resolveOrReject(async () => {
        const ipwho = await fetchJsonWithTimeout(`https://ipwho.is/${encodedIp}`);
        if (ipwho?.success !== false && (ipwho?.country || ipwho?.country_code)) {
          return normalizeGeoResult({
            country: ipwho.country,
            countryCode: ipwho.country_code,
            region: ipwho.region,
            city: ipwho.city,
          });
        }
        return null;
      }),
      resolveOrReject(async () => {
        const ipApiCom = await fetchJsonWithTimeout(
          `http://ip-api.com/json/${encodedIp}?fields=status,country,countryCode,regionName,city`,
        );
        if (ipApiCom?.status === 'success' && (ipApiCom.country || ipApiCom.countryCode)) {
          return normalizeGeoResult({
            country: ipApiCom.country,
            countryCode: ipApiCom.countryCode,
            region: ipApiCom.regionName,
            city: ipApiCom.city,
          });
        }
        return null;
      }),
    ]);
  } catch {
    const ipapi = await fetchJsonWithTimeout(`https://ipapi.co/${encodedIp}/json/`);

    if (ipapi && !ipapi.error && (ipapi.country_name || ipapi.country)) {
      return normalizeGeoResult({
        country: ipapi.country_name,
        countryCode: ipapi.country,
        region: ipapi.region,
        city: ipapi.city,
      });
    }

    return null;
  }
};

export const lookupCachedGeoByIp = async (ip) => {
  if (isPrivateOrLocalIp(ip)) {
    return null;
  }

  try {
    return await getMemoryCached(`geo-ip:${ip}`, GEO_SUCCESS_CACHE_TTL_MS, async () => {
      const geo = await lookupGeoByIp(ip);
      if (!geo) {
        throw new Error('geo-lookup-miss');
      }
      return geo;
    });
  } catch {
    return null;
  }
};

export const lookupGeoFromRequest = async (req) => {
  const ip = getClientIp(req);
  const lookedUp = await lookupCachedGeoByIp(ip);

  if (lookedUp) {
    return lookedUp;
  }

  const headerCountry = String(req.headers['cf-ipcountry'] || '')
    .trim()
    .toUpperCase();
  const headerCity = String(req.headers['cf-ipcity'] || '').trim();
  const headerRegion = String(
    req.headers['cf-region'] || req.headers['cf-ipregion'] || '',
  ).trim();

  if (headerCountry && headerCountry !== 'XX' && headerCountry !== 'T1') {
    return normalizeGeoResult({
      country: countryNameFromCode(headerCountry),
      countryCode: headerCountry,
      region: headerRegion,
      city: headerCity,
    });
  }

  return null;
};
