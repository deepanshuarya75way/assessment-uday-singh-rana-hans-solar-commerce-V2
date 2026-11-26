import { Router } from 'express';
import { analyticsRateLimiter } from '../middleware/rateLimiter.js';
import {
  recordProductViewHandler,
  recordSiteVisitHandler,
} from '../controllers/analyticsController.js';

const router = Router();

router.use(analyticsRateLimiter);
router.post('/visit', recordSiteVisitHandler);
router.post('/products/:productId/view', recordProductViewHandler);

export default router;
