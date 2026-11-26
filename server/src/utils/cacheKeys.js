import { clearMemoryCache } from './memoryCache.js';

export const CACHE_KEYS = {
  PUBLIC_CATEGORIES: 'public-categories',
  PUBLIC_FEATURED_PRODUCTS: 'public-featured-products',
  PUBLIC_HOMEPAGE_BANNERS: 'public-homepage-banners',
  PUBLIC_SITE_MEDIA: 'public-site-media',
  ACTIVE_FESTIVAL: 'active-festival',
  PUBLIC_ACTIVE_FESTIVAL: 'public-active-festival',
  PUBLIC_PRODUCT: 'public-product:',
};

export const invalidatePublicCatalog = () => {
  clearMemoryCache(CACHE_KEYS.PUBLIC_CATEGORIES);
  clearMemoryCache(CACHE_KEYS.PUBLIC_FEATURED_PRODUCTS);
  clearMemoryCache(CACHE_KEYS.PUBLIC_ACTIVE_FESTIVAL);
};

export const invalidatePublicProducts = () => {
  clearMemoryCache(CACHE_KEYS.PUBLIC_FEATURED_PRODUCTS);
  clearMemoryCache(CACHE_KEYS.PUBLIC_ACTIVE_FESTIVAL);
  clearMemoryCache(CACHE_KEYS.PUBLIC_PRODUCT);
};
