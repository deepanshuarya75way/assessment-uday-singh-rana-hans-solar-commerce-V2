import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import HomePage from '@/pages/HomePage';

// Lazy load admin routes completely (isolating TipTap, XLSX, and all admin components)
const AdminRoutes = lazy(() => import('@/admin/routes/AdminRoutes'));

// Lazy load secondary public pages
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'));
const ShopPage = lazy(() => import('@/pages/ShopPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const QuotePage = lazy(() => import('@/pages/QuotePage'));
const SolarCalculatorPage = lazy(() => import('@/pages/SolarCalculatorPage'));
const PlaceholderPage = lazy(() => import('@/pages/PlaceholderPage'));
const DistributorPage = lazy(() => import('@/pages/DistributorPage'));
const LearnPage = lazy(() => import('@/pages/LearnPage'));
const SubsidyPage = lazy(() => import('@/pages/SubsidyPage'));

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-solar-200 border-t-solar-600" />
        <span className="text-xs font-medium text-slate-500">Loading...</span>
      </div>
    </div>
  );
}

const placeholder = (title, description, ctaLabel, ctaPath) => (
  <PlaceholderPage
    title={title}
    description={description}
    ctaLabel={ctaLabel}
    ctaPath={ctaPath}
  />
);

/**
 * Application route definitions.
 *
 * Public routes: home (immediate), shop, contact, learn, etc.
 * Admin routes: /admin/* (lazy-loaded dashboard section)
 */
export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop/product/:id" element={<ProductDetailPage />} />
          <Route path="/shop/categories" element={<CategoriesPage />} />
          <Route path="/shop/:category" element={<ShopPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/quote" element={<QuotePage />} />
          <Route path="/solar" element={<SolarCalculatorPage />} />
          <Route path="/distributor" element={<DistributorPage />} />
          <Route path="/learn/:topic" element={<LearnPage />} />
          <Route path="/subsidy/:topic" element={<SubsidyPage />} />
          <Route
            path="/subsidy-products"
            element={<Navigate to="/subsidy/products" replace />}
          />
          <Route
            path="/privacy-policy"
            element={placeholder(
              'Privacy Policy',
              'Our privacy policy content will be published here.',
            )}
          />
          <Route
            path="/terms-and-conditions"
            element={placeholder(
              'Terms & Conditions',
              'Our terms and conditions content will be published here.',
            )}
          />
        </Route>

        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </Suspense>
  );
}
