import { Router } from 'express';
import {
  getAdminVisitorAnalyticsHandler,
  getAdminVisitorGeographyHandler,
} from '../controllers/analyticsController.js';
import { protectAdmin } from '../middleware/protectAdmin.js';

const router = Router();

router.use(protectAdmin);
router.get('/visitors', getAdminVisitorAnalyticsHandler);
router.get('/visitors/geography', getAdminVisitorGeographyHandler);

export default router;
