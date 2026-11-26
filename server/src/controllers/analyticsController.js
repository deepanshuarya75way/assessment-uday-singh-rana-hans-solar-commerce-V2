import catchAsync from '../utils/catchAsync.js';
import {
  getVisitorAnalytics,
  getVisitorGeography,
  recordProductView,
  recordSiteVisit,
} from '../services/analyticsService.js';

export const recordSiteVisitHandler = catchAsync(async (req, res) => {
  await recordSiteVisit(req, res);

  res.status(200).json({
    success: true,
    data: { recorded: true },
  });
});

export const recordProductViewHandler = catchAsync(async (req, res) => {
  await recordProductView(req, res, req.params.productId);

  res.status(200).json({
    success: true,
    data: { recorded: true },
  });
});

export const getAdminVisitorAnalyticsHandler = catchAsync(async (_req, res) => {
  const stats = await getVisitorAnalytics();

  res.status(200).json({
    success: true,
    data: { stats },
  });
});

export const getAdminVisitorGeographyHandler = catchAsync(async (req, res) => {
  const geography = await getVisitorGeography({
    period: req.query.period || 'overall',
    country: req.query.country,
    region: req.query.region,
  });

  res.status(200).json({
    success: true,
    data: { geography },
  });
});
