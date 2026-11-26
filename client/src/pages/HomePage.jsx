import { lazy, Suspense } from 'react';
import Hero from '@/components/home/Hero';
import MovingSubsidyAnnouncement from '@/components/home/MovingSubsidyAnnouncement';
import SectionErrorBoundary from '@/components/common/SectionErrorBoundary';

const PmSuryaGharHomeSection = lazy(
  () => import('@/components/home/PmSuryaGharHomeSection'),
);
const FestivalSaleSection = lazy(
  () => import('@/components/home/FestivalSaleSection'),
);
const WhyChooseUs = lazy(() => import('@/components/home/WhyChooseUs'));
const FeaturedProductsSection = lazy(
  () => import('@/components/home/FeaturedProductsSection'),
);
const ProductShowcase = lazy(() => import('@/components/home/ProductShowcase'));
const FeatureSection = lazy(() => import('@/components/home/FeatureSection'));
const InstallationGallerySection = lazy(
  () => import('@/components/home/InstallationGallerySection'),
);
const CorporateOfficeSection = lazy(
  () => import('@/components/home/CorporateOfficeSection'),
);

function LazySection({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

export default function HomePage() {
  return (
    <>
      <SectionErrorBoundary name="banners">
        <Hero />
      </SectionErrorBoundary>
      <MovingSubsidyAnnouncement />
      <LazySection>
        <SectionErrorBoundary name="PM Surya Ghar">
          <PmSuryaGharHomeSection />
        </SectionErrorBoundary>
      </LazySection>
      <LazySection>
        <SectionErrorBoundary name="festival offers">
          <FestivalSaleSection />
        </SectionErrorBoundary>
      </LazySection>
      <LazySection>
        <SectionErrorBoundary name="Why Choose Us">
          <WhyChooseUs />
        </SectionErrorBoundary>
      </LazySection>
      <LazySection>
        <SectionErrorBoundary name="featured products">
          <FeaturedProductsSection section="all" />
        </SectionErrorBoundary>
      </LazySection>
      <LazySection>
        <SectionErrorBoundary name="categories">
          <ProductShowcase />
        </SectionErrorBoundary>
      </LazySection>
      <LazySection>
        <FeatureSection />
      </LazySection>
      <LazySection>
        <SectionErrorBoundary name="installation gallery">
          <InstallationGallerySection />
        </SectionErrorBoundary>
      </LazySection>
      <LazySection>
        <CorporateOfficeSection />
      </LazySection>
    </>
  );
}
