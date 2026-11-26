import { Router } from 'express';
import {
  getFeaturedProductsHandler,
  getPublicProductByIdHandler,
  getPublicProductsHandler,
  searchPublicProductsHandler,
} from '../controllers/productController.js';
import {
  getPublicCategoriesHandler,
  getPublicCategoryBySlugHandler,
} from '../controllers/categoryController.js';

const router = Router();

router.get('/categories', getPublicCategoriesHandler);
router.get('/categories/:slug', getPublicCategoryBySlugHandler);
router.get('/products/featured', getFeaturedProductsHandler);
router.get('/products/search', searchPublicProductsHandler);
router.get('/products', getPublicProductsHandler);
router.get('/products/:id', getPublicProductByIdHandler);

export default router;
