import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Grid3X3, Package, ShoppingBag, Sparkles, Sun } from 'lucide-react';
import CategoryDescription from '@/components/shop/CategoryDescription';

export default function CategoryHero({ category, festival, productCount }) {
  const [failedImageUrl, setFailedImageUrl] = useState(null);

  if (festival) {
    return (
      <section className="relative overflow-hidden border-b border-solar-100 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900">
        <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-solar-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-solar-100 backdrop-blur-sm transition hover:bg-white/10 sm:text-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Back to Home
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-solar-100 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-solar-300" />
              {festival.name}
            </span>
            {productCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-solar-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm shadow-solar-600/20">
                <Sun className="h-3.5 w-3.5" />
                {productCount} deal{productCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <h1 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-white sm:mt-4 sm:text-3xl lg:text-4xl lg:leading-tight">
            {festival.title}
          </h1>
          {festival.description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-300 sm:mt-3 sm:text-base lg:text-lg">
              {festival.description}
            </p>
          )}
        </div>
      </section>
    );
  }

  if (!category) {
    return (
      <section className="relative overflow-hidden border-b border-solar-100 bg-gradient-to-br from-solar-50 via-white to-emerald-50/60">
        <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-solar-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-solar-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-solar-700 shadow-sm">
              <ShoppingBag className="h-3.5 w-3.5" />
              HANS Solar Shop
            </span>
            {productCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-solar-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm shadow-solar-600/20">
                <Sun className="h-3.5 w-3.5" />
                {productCount} products
              </span>
            )}
          </div>
          <h1 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-charcoal sm:mt-4 sm:text-3xl lg:text-4xl lg:leading-tight">
            Premium Solar Products
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-charcoal-light sm:mt-3 sm:text-base lg:text-lg">
            Browse panels, inverters, batteries and complete solar solutions for
            homes, businesses and industries.
          </p>
        </div>
      </section>
    );
  }

  const hasValidImage =
    Boolean(category.image) && failedImageUrl !== category.image;

  return (
    <section className="relative overflow-hidden border-b border-slate-200/90 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/30">
      <div
        className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-solar-200/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-emerald-200/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
        {/* Navigation Breadcrumb Pills */}
        <div className="mb-3.5 flex flex-wrap items-center gap-2 sm:mb-4">
          <Link
            to="/shop"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-solar-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-solar-700 shadow-2xs backdrop-blur-sm transition hover:border-solar-300 hover:bg-solar-50 sm:text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            All Products
          </Link>
          <Link
            to="/shop/categories"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs backdrop-blur-sm transition hover:border-solar-200 hover:text-solar-700 sm:text-sm"
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            Categories
          </Link>
          {productCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-solar-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-2xs sm:text-xs">
              <Package className="h-3.5 w-3.5" />
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </span>
          )}
        </div>

        {/* Cohesive Category Introduction Section: Left Content + Right Image on Desktop, Stacked on Mobile */}
        <div className="category-section-enter overflow-hidden rounded-2xl border border-slate-200/85 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 items-center gap-6 sm:gap-7 lg:grid-cols-12 lg:gap-10 xl:gap-12">
            {/* LEFT COLUMN: Category Header & Description (58% on desktop) */}
            <div
              className={`min-w-0 flex flex-col justify-center ${
                hasValidImage ? 'lg:col-span-7' : 'lg:col-span-12 max-w-3xl'
              }`}
            >
              <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-solar-200/90 bg-solar-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-solar-700">
                <Grid3X3 className="h-3 w-3 text-solar-600" aria-hidden="true" />
                Category
              </div>

              <h1 className="mt-2.5 text-2xl font-bold tracking-tight text-slate-900 sm:mt-3 sm:text-3xl lg:text-4xl lg:leading-tight">
                {category.name}
              </h1>

              {category.description ? (
                <div className="mt-3.5 sm:mt-4">
                  <CategoryDescription description={category.description} />
                </div>
              ) : null}
            </div>

            {/* RIGHT COLUMN: Large Complete Category Image Showcase (42% on desktop) */}
            {hasValidImage ? (
              <div className="w-full lg:col-span-5">
                <div className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200/85 bg-gradient-to-b from-slate-50/90 via-white to-slate-100/50 p-3 shadow-2xs transition-all duration-300 hover:border-solar-300/80 hover:shadow-md sm:rounded-2xl sm:p-4 lg:p-5">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="max-h-[260px] w-full rounded-lg object-contain transition-transform duration-500 ease-out group-hover:scale-[1.015] sm:max-h-[340px] sm:rounded-xl lg:max-h-[380px]"
                    loading="eager"
                    onError={() => setFailedImageUrl(category.image)}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5 sm:rounded-2xl"
                    aria-hidden="true"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
