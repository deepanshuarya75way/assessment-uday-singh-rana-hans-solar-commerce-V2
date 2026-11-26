import rateLimit from 'express-rate-limit';

const rateLimitMessage = {
  success: false,
  message: 'Too many requests, please try again later',
};

const skipOptions = (req) => req.method === 'OPTIONS';

const isPublicReadPath = (path) =>
  !path.startsWith('/api/v1/admin/') &&
  (path.startsWith('/api/v1/catalog/') ||
    path.startsWith('/api/v1/homepage/') ||
    path.startsWith('/api/v1/festivals/') ||
    path.startsWith('/api/v1/site/'));

const isPublicReadRequest = (req) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return false;
  }

  const path = req.path || req.url || '';
  return isPublicReadPath(path);
};

/** Generous limit for public catalog/homepage reads (~85 full homepage loads / 15 min). */
export const publicReadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => skipOptions(req) || !isPublicReadRequest(req),
  message: rateLimitMessage,
});

/** Default limit for writes, analytics, and non-public routes. */
export const sensitiveApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => skipOptions(req) || isPublicReadRequest(req),
  message: rateLimitMessage,
});

/** Analytics POST endpoints — one visit per page, allow refresh bursts. */
export const analyticsRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOptions,
  message: rateLimitMessage,
});

/** Applied globally — runs both tiered limiters in sequence. */
const rateLimiter = (req, res, next) => {
  if (skipOptions(req)) {
    next();
    return;
  }

  publicReadRateLimiter(req, res, (publicErr) => {
    if (publicErr) {
      next(publicErr);
      return;
    }

    sensitiveApiRateLimiter(req, res, next);
  });
};

export default rateLimiter;
