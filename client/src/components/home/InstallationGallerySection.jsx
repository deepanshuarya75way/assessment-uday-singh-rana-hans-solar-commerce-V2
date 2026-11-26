import { useState, useEffect, useCallback } from 'react';
import { BadgeCheck, ChevronLeft, ChevronRight, Eye, Home, Sparkles, X } from 'lucide-react';
import SectionHeader from '@/components/home/SectionHeader';
import useRevealOnScroll from '@/hooks/useRevealOnScroll';
import { installationGalleryImages } from '@/constants/homeContent';
import { useSiteMediaQuery } from '@/context/SiteDataContext';
import { lockBodyScroll, unlockBodyScroll } from '@/utils/bodyScrollLock';

// Layout classes engineered for 11 items:
// On Mobile (2 cols): Item 0 is 2-col featured hero; items 1-10 form 5 perfect 2-col rows.
// On Desktop (4 cols): Row 1-2: Item 0 (2x2) + Items 1-4 (1x1); Row 3: Items 5-8 (1x1); Row 4: Items 9-10 (2x1 each).
// Every cell is filled cleanly with zero blanks or orphan gaps.
const getCardLayoutClass = (index) => {
  if (index === 0) {
    return 'col-span-2 sm:col-span-2 sm:row-span-2 aspect-[16/10] sm:aspect-auto';
  }
  if (index === 9 || index === 10) {
    return 'col-span-1 sm:col-span-2 aspect-[4/3] sm:aspect-[16/9]';
  }
  return 'col-span-1 aspect-[4/3]';
};

export default function InstallationGallerySection() {
  const { ref: sectionRef, isVisible } = useRevealOnScroll();
  const { data: siteMediaResponse } = useSiteMediaQuery();
  const galleryImages =
    siteMediaResponse?.data?.gallery ?? installationGalleryImages;

  const [activeImageIndex, setActiveImageIndex] = useState(null);

  const openLightbox = (index) => {
    setActiveImageIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setActiveImageIndex(null);
  }, []);

  const showNext = useCallback(() => {
    setActiveImageIndex((prev) =>
      prev !== null ? (prev + 1) % galleryImages.length : 0
    );
  }, [galleryImages.length]);

  const showPrev = useCallback(() => {
    setActiveImageIndex((prev) =>
      prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : 0
    );
  }, [galleryImages.length]);

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    if (activeImageIndex === null) {
      return undefined;
    }

    lockBodyScroll();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        showNext();
      } else if (e.key === 'ArrowLeft') {
        showPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unlockBodyScroll();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeImageIndex, closeLightbox, showNext, showPrev]);

  return (
    <section
      ref={sectionRef}
      id="installation-gallery-section"
      className="bg-white py-7 sm:py-11 lg:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`reveal-up ${isVisible ? 'is-visible' : ''}`}>
          <SectionHeader
            eyebrow="Real Installations & Happy Customers"
            title="Trusted Solar Rooftops Across North India"
            subtitle="Explore genuine government subsidy rooftop installations delivered with top-tier solar equipment and expert engineering."
            icon={BadgeCheck}
            align="center"
            className="mx-auto"
          />
        </div>

        {/* Highlight Stats Card */}
        <div
          className={`reveal-up mt-8 overflow-hidden rounded-3xl border border-solar-100/80 bg-gradient-to-br from-solar-50/80 via-white to-emerald-50/40 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:mt-10 sm:p-8 lg:p-9 ${isVisible ? 'is-visible' : ''}`}
          style={{ animationDelay: '80ms' }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-solar-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-solar-700 shadow-sm">
                <Home className="h-3.5 w-3.5" />
                Verified Rooftop Deployments
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                800+ Subsidy Sets Installed in Homes
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600 sm:text-base lg:text-lg">
                Over 800 residential families are successfully receiving Central &amp; State government solar subsidy benefits with HANS Solar.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-6 border-t border-solar-100/80 pt-6 sm:gap-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              {[
                { value: '800+', label: 'Installations' },
                { value: '₹78,000', label: 'Max Subsidy' },
                { value: '100%', label: 'Subsidy Support' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl font-bold tabular-nums text-solar-700 sm:text-2xl lg:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery Bento Grid */}
        <div
          className={`reveal-up mt-8 grid grid-cols-2 gap-2.5 sm:mt-10 sm:grid-cols-4 sm:gap-3.5 lg:gap-4 ${isVisible ? 'is-visible' : ''}`}
          style={{ animationDelay: '140ms' }}
        >
          {galleryImages.map((image, index) => (
            <figure
              key={image.src}
              onClick={() => openLightbox(index)}
              className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-solar-300 hover:shadow-[0_14px_34px_rgba(15,23,42,0.12)] cursor-pointer ${getCardLayoutClass(
                index
              )}`}
            >
              <div className="relative h-full w-full overflow-hidden">
                <img
                  src={image.src}
                  alt={image.alt || `HANS Solar installation ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />

                {/* Subtle vignette and hover label */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:flex sm:items-end sm:p-3.5">
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-md backdrop-blur-sm">
                    <Eye className="h-3.5 w-3.5 text-solar-600" />
                    <span>View Project</span>
                  </span>
                </div>

                {/* Featured Badge for the main image */}
                {index === 0 && (
                  <div className="absolute left-3 top-3 z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white shadow-md backdrop-blur-sm ring-1 ring-white/20">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span>Featured Installation</span>
                    </span>
                  </div>
                )}
              </div>
            </figure>
          ))}
        </div>
      </div>

      {/* Lightweight Accessible Lightbox Modal */}
      {activeImageIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-3 sm:p-6 backdrop-blur-md animate-fadeIn"
          onClick={closeLightbox}
        >
          <div
            className="relative flex max-h-[94vh] max-w-5xl flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="flex w-full items-center justify-between px-2 pb-3 text-white">
              <span className="text-xs font-medium text-slate-300 sm:text-sm">
                Photo {activeImageIndex + 1} of {galleryImages.length}
              </span>
              <button
                type="button"
                aria-label="Close image modal"
                onClick={closeLightbox}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-solar-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main Image View */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-black/40">
              <img
                src={galleryImages[activeImageIndex].src}
                alt={
                  galleryImages[activeImageIndex].alt ||
                  `HANS Solar installation ${activeImageIndex + 1}`
                }
                className="max-h-[75vh] w-auto max-w-[92vw] object-contain"
              />
            </div>

            {/* Bottom Caption & Controls */}
            <div className="mt-3 flex w-full items-center justify-between px-2 text-white">
              <p className="truncate text-xs text-slate-300 sm:text-sm font-medium">
                {galleryImages[activeImageIndex].alt ||
                  `HANS Solar Subsidy Installation ${activeImageIndex + 1}`}
              </p>

              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={showPrev}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-solar-500"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={showNext}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-solar-500"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
