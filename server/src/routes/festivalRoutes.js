import { Router } from 'express';
import {
  getPublicActiveFestivalHandler,
  getPublicFestivalProductsHandler,
} from '../controllers/festivalController.js';

const router = Router();

router.get('/active', getPublicActiveFestivalHandler);
router.get('/:id/products', getPublicFestivalProductsHandler);

export default router;
