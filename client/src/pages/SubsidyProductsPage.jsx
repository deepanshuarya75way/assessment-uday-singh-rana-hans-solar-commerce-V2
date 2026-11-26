import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  HelpCircle,
  IndianRupee,
  Loader2,
  PackageOpen,
  SearchX,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import ProductSearchInput from '@/components/shop/ProductSearchInput';
import useProductSearch from '@/hooks/useProductSearch';
import { useGetPublicCategoriesQuery } from '@/services/categoriesApi';
import { useGetPublicProductsQuery } from '@/services/productsApi';
import { useEnquiryModal } from '@/context/EnquiryModalContext';
import { filterProductsBySearch, normalizeSearchQuery } from '@/utils/productSearch';

export default function SubsidyProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'all';
  const { openEnquiryModal } = useEnquiryModal();

  const {
    query: searchQuery,
    inputValue,
    handleChange,
    handleSubmit,
    clearSearch,
    hasQuery,
  } = useProductSearch();

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useGetPublicProductsQuery({ subsidy: true });

  const { data: categoriesData } = useGetPublicCategoriesQuery();

  const allProducts = useMemo(() => {
    const raw = productsData?.data?.products ?? [];
    return raw.filter((p) => p.isSubsidy || p.isGovernmentSubsidy);
  }, [productsData]);

  const categories = categoriesData?.data?.categories ?? [];

  // Filter products by selected category pill
  const categoryFiltered = useMemo(() => {
    if (selectedCategory === 'all') {
      return allProducts;
    }
    return allProducts.filter(
      (product) =>
        product.category?.slug === selectedCategory ||
        product.categoryId === selectedCategory,
    );
  }, [allProducts, selectedCategory]);

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    return filterProductsBySearch(categoryFiltered, searchQuery);
  }, [categoryFiltered, searchQuery]);

  const normalizedSearch = normalizeSearchQuery(searchQuery);

  const handleCategoryChange = (slug) => {
    const params = new URLSearchParams(searchParams);
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    setSearchParams(params);
  };

  const handleOpenSubsidyEnquiry = () => {
    openEnquiryModal({
      enquiryType: 'subsidy',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden border-b border-emerald-100/80 bg-gradient-to-b from-emerald-900 via-emerald-800 to-slate-900 text-white">
        {/* Background decorative solar accents */}
        <div className="pointer-events-none absolute inset-0 opacity-15">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-400 blur-3xl" />
          <div className="absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-amber-400 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-200 backdrop-blur-md sm:text-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span>Government Subsidy Eligible</span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Government Subsidy <span className="bg-gradient-to-r from-emerald-200 via-teal-100 to-amber-200 bg-clip-text text-transparent">Solar Products</span>
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-emerald-100/90 sm:text-base lg:text-lg">
              Explore MNRE-approved solar modules, on-grid inverters, and rooftop systems eligible for PM Surya Ghar: Muft Bijli Yojana with direct financial subsidies up to <strong className="text-white">₹78,000+</strong> deposited straight to your bank account.
            </p>

            {/* Feature Highlights Grid */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
                <IndianRupee className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-medium text-slate-200 sm:text-sm">Up to ₹78,000 Subsidy</span>
              </div>
              <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
                <Zap className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-medium text-slate-200 sm:text-sm">Direct DBT in Bank</span>
              </div>
              <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                <span className="text-xs font-medium text-slate-200 sm:text-sm">HANS End-to-End Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Controls Container: Search & Category Filter Pills */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Box */}
            <div className="w-full md:max-w-md">
              <ProductSearchInput
                id="subsidy-products-search"
                value={inputValue}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onClear={clearSearch}
                placeholder="Search subsidy eligible products…"
              />
            </div>

            {/* Quick Consultation Button */}
            <button
              type="button"
              onClick={handleOpenSubsidyEnquiry}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 sm:text-sm"
            >
              <Sparkles className="h-4 w-4 text-emerald-200" />
              Claim Subsidy Consultation
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
              Category:
            </span>
            <button
              type="button"
              onClick={() => handleCategoryChange('all')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Subsidy Products ({allProducts.length})
            </button>

            {categories.map((cat) => {
              const count = allProducts.filter(
                (p) => p.category?.slug === cat.slug || p.categoryId === cat.id,
              ).length;

              if (count === 0) return null;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                    selectedCategory === cat.slug
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Info Header */}
        <div className="mt-6 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              {selectedCategory === 'all'
                ? 'All Government Subsidy Products'
                : categories.find((c) => c.slug === selectedCategory)?.name || 'Subsidy Products'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Each product qualifies for central or state subsidy programs when installed through HANS Solar.
            </p>
          </div>

          {!productsLoading && !productsError && filteredProducts.length > 0 && (
            <p className="text-xs font-medium text-slate-500 sm:text-sm">
              {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} found
            </p>
          )}
        </div>

        {/* Product Cards Grid */}
        {productsLoading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="mt-3 text-sm font-medium text-slate-600">
              Loading government subsidy products…
            </p>
          </div>
        ) : productsError ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <h3 className="mt-3 text-base font-bold text-slate-900">
              Unable to load subsidy products
            </h3>
            <p className="mt-1 text-sm text-red-700">
              There was a temporary problem fetching products. Please try again.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            {hasQuery ? (
              <>
                <SearchX className="h-10 w-10 text-slate-300" />
                <h3 className="mt-3 text-base font-bold text-slate-800">
                  No subsidy products match &ldquo;{normalizedSearch}&rdquo;
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try searching for solar panels, on-grid inverters, or clear your query.
                </p>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <PackageOpen className="h-10 w-10 text-slate-300" />
                <h3 className="mt-3 text-base font-bold text-slate-800">
                  No subsidy products found in this category
                </h3>
                <p className="mt-1 max-w-md text-sm text-slate-500">
                  Products marked with Government Subsidy status in the admin dashboard will automatically appear here.
                </p>
                {selectedCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('all')}
                    className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    View all subsidy products
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="shop"
                showKeySpecs={true}
                maxKeySpecs={3}
              />
            ))}
          </div>
        )}

        {/* Subsidy Process & Guidance Card */}
        <section className="mt-12 rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <HelpCircle className="h-4 w-4" />
                <span>How to Avail Government Subsidy</span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                Ready to save up to ₹78,000 on your solar installation?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Under PM Surya Ghar Muft Bijli Yojana, residential rooftop systems get direct financial subsidies. HANS Solar takes care of site assessment, DISCOM net-metering approvals, MNRE portal registration, and subsidy paperwork.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">
                    1
                  </span>
                  <p className="mt-2 text-sm font-semibold text-slate-800">Select Equipment</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Choose subsidy-approved solar panels and inverters.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">
                    2
                  </span>
                  <p className="mt-2 text-sm font-semibold text-slate-800">Free Site Survey</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Our technical engineers visit your roof and plan optimal setup.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">
                    3
                  </span>
                  <p className="mt-2 text-sm font-semibold text-slate-800">Direct DBT Subsidy</p>
                  <p className="mt-1 text-xs text-slate-500">
                    After commissioning & net-metering, subsidy is credited to your bank.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 shrink-0 sm:flex-row lg:flex-col">
              <button
                type="button"
                onClick={handleOpenSubsidyEnquiry}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
              >
                <span>Book FREE Site Survey</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                to="/subsidy/pm-surya-ghar"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <FileText className="h-4 w-4 text-emerald-600" />
                <span>PM Surya Ghar Guide</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
