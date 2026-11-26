import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Grid3X3,
  Layers,
  Loader2,
  Package,
  Search,
  X,
} from 'lucide-react';
import CategoryCard from '@/components/shop/CategoryCard';
import SectionHeader from '@/components/home/SectionHeader';
import useRevealOnScroll from '@/hooks/useRevealOnScroll';
import { useGetPublicCategoriesQuery } from '@/services/categoriesApi';

export default function CategoriesPage() {
  const { ref: sectionRef, isVisible } = useRevealOnScroll();
  const [searchParams] = useSearchParams();
  const [categorySearch, setCategorySearch] = useState('');
  const { data, isLoading, isError } = useGetPublicCategoriesQuery();

  const categories = data?.data?.categories ?? [];
  const searchQuery = searchParams.get('q');
  const shopBase = searchQuery
    ? `/shop?q=${encodeURIComponent(searchQuery)}`
    : '/shop';

  const normalizedQuery = categorySearch.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) {
      return categories;
    }

    return categories.filter((category) => {
      const name = category.name?.toLowerCase() ?? '';
      const slug = category.slug?.toLowerCase().replace(/-/g, ' ') ?? '';
      return name.includes(normalizedQuery) || slug.includes(normalizedQuery);
    });
  }, [categories, normalizedQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <section className="relative overflow-hidden border-b border-slate-100 bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-solar-100/40 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-emerald-100/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <Link
            to={shopBase}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-solar-200 bg-white px-3.5 py-2 text-sm font-medium text-solar-700 shadow-sm transition hover:border-solar-300 hover:bg-solar-50"
          >
            <Package className="h-4 w-4" aria-hidden="true" />
            Browse All Products
          </Link>

          <div className="mt-5 max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-solar-600">
              <Grid3X3 className="h-3.5 w-3.5" aria-hidden="true" />
              Product Categories
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl lg:text-4xl">
                All Solar Categories
              </h1>
              {!isLoading && !isError && categories.length > 0 ? (
                <span className="inline-flex items-center rounded-full bg-solar-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                  {categories.length} categories
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-charcoal-light sm:text-base">
              Explore every product category — panels, inverters, batteries,
              accessories and complete solar solutions for every need.
            </p>
          </div>
        </div>
      </section>

      <section
        ref={sectionRef}
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
      >
        {isLoading ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-solar-600" />
            <p className="mt-3 text-sm text-charcoal-light">Loading categories...</p>
          </div>
        ) : isError ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/60 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <p className="mt-3 text-sm font-medium text-red-700">
              Unable to load categories right now.
            </p>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Layers className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-charcoal-light">
              Categories will appear here once added from the admin dashboard.
            </p>
            <Link
              to={shopBase}
              className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-solar-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-solar-700"
            >
              Visit Shop
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <SectionHeader
              eyebrow="Browse"
              title="Choose a Category"
              subtitle={`All ${categories.length} categories are listed below. Tap any category to view its products.`}
              className="max-w-xl"
            />

            <div className="mt-6 flex flex-col gap-3.5 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-700 sm:text-base">
                {normalizedQuery
                  ? `Showing ${filteredCategories.length} of ${categories.length} categories`
                  : `All Categories (${categories.length})`}
              </p>

              <div className="relative w-full sm:w-80 md:w-96 lg:w-[26rem]">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 sm:left-4"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setCategorySearch('');
                    }
                  }}
                  placeholder="Search category…"
                  aria-label="Search category"
                  className="h-12 w-full rounded-xl border border-slate-200/90 bg-white pl-11.5 pr-11.5 text-base text-slate-800 shadow-sm placeholder:text-slate-400 transition-all duration-200 hover:border-slate-300 focus:border-solar-500 focus:outline-none focus:ring-2 focus:ring-solar-500/20 sm:pl-12 sm:pr-12 sm:text-sm"
                />
                {categorySearch ? (
                  <button
                    type="button"
                    onClick={() => setCategorySearch('')}
                    aria-label="Clear category search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 active:scale-95 sm:right-2.5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 text-center sm:p-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <Search className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  No categories found
                </h3>
                <p className="mt-1.5 text-sm text-slate-500">
                  No categories match your search for &ldquo;{categorySearch.trim()}&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => setCategorySearch('')}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-solar-700 shadow-sm transition hover:bg-slate-50 hover:text-solar-800"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear search
                </button>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:gap-5">
                {filteredCategories.map((category, index) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    isVisible={isVisible}
                    revealDelay={80 + index * 60}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
