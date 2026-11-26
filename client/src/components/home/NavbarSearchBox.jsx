import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, SearchX } from 'lucide-react';
import ProductSearchInput from '@/components/shop/ProductSearchInput';
import {
  prefetchProductDetailPage,
  usePrefetchPublicProductById,
  useSearchPublicProductsQuery,
} from '@/services/productsApi';
import { normalizeSearchQuery } from '@/utils/productSearch';

function NavbarSearchSuggestions({ results, isLoading, query, onSelect, onPrefetchProduct }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
      <div className="max-h-[min(20rem,50vh)] overflow-y-auto overscroll-contain">
        {isLoading ? (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-solar-600" />
            Searching products...
          </div>
        ) : results.length === 0 ? (
          <div className="px-4 py-4 text-center">
            <SearchX className="mx-auto h-7 w-7 text-slate-300" />
            <p className="mt-2 text-sm font-medium text-slate-700">
              No products found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              No matches for &ldquo;{query}&rdquo;
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {results.map((product) => (
              <li key={product.id}>
                <Link
                  to={`/shop/product/${product.id}`}
                  onPointerEnter={() => onPrefetchProduct?.(product.id)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onPrefetchProduct?.(product.id);
                  }}
                  onClick={onSelect}
                  className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-solar-50/80"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800">
                      {product.name}
                    </p>
                    {product.category?.name ? (
                      <p className="truncate text-xs text-slate-500">
                        {product.category.name}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function NavbarSearchBox({
  id,
  value,
  onChange,
  onSubmit,
  onClear,
  variant = 'desktop',
  className = '',
  onClose,
}) {
  const [focused, setFocused] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const containerRef = useRef(null);
  const prefetchProductById = usePrefetchPublicProductById();

  const prefetchProductDetail = (productId) => {
    if (!productId) {
      return;
    }

    prefetchProductDetailPage();
    prefetchProductById(productId);
  };

  const isDesktop = variant === 'desktop';
  const normalizedQuery = normalizeSearchQuery(value);
  const isExpanded = isDesktop && (focused || normalizedQuery.length > 0);
  const showSuggestions = focused && normalizedQuery.length > 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(normalizedQuery);
    }, normalizedQuery ? 200 : 0);

    return () => clearTimeout(timer);
  }, [normalizedQuery]);

  const shouldFetch = showSuggestions && debouncedQuery.length > 0;

  const {
    data: searchData,
    isLoading: searchLoading,
    isFetching: searchFetching,
  } = useSearchPublicProductsQuery(
    { q: debouncedQuery, limit: 8 },
    { skip: !shouldFetch },
  );

  const results = shouldFetch ? (searchData?.data?.products ?? []) : [];
  const isLoading = shouldFetch && (searchLoading || searchFetching);

  useEffect(() => {
    if (!focused) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setFocused(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setFocused(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [focused]);

  const handleSelect = () => {
    setFocused(false);
    onClose?.();
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${isDesktop ? 'z-[60] transition-[width] duration-300 ease-out' : ''} ${
        isDesktop
          ? isExpanded
            ? 'w-[26rem] 2xl:w-[28rem]'
            : 'w-44 2xl:w-52'
          : 'w-full'
      } ${className}`}
    >
      <div
        className={
          isDesktop && isExpanded
            ? 'overflow-visible rounded-2xl border border-slate-200/90 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]'
            : ''
        }
      >
        <ProductSearchInput
          id={id}
          value={value}
          onChange={onChange}
          onSubmit={() => {
            onSubmit?.();
            setFocused(false);
            onClose?.();
          }}
          onClear={onClear}
          onFocus={() => setFocused(true)}
          size="compact"
          placeholder="Search products..."
          inputClassName={
            isDesktop && isExpanded
              ? 'h-11 rounded-t-2xl rounded-b-none border-0 shadow-none focus:border-transparent focus:ring-0'
              : ''
          }
        />
      </div>

      {showSuggestions && isDesktop && (
        <div className="absolute left-0 right-0 top-full z-[60] pt-1">
          <NavbarSearchSuggestions
            results={results}
            isLoading={isLoading}
            query={normalizedQuery}
            onSelect={handleSelect}
            onPrefetchProduct={prefetchProductDetail}
          />
        </div>
      )}

      {showSuggestions && !isDesktop && (
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.1)]">
          <div className="max-h-[min(16rem,45vh)] overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-solar-600" />
                Searching products...
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-4 text-center">
                <SearchX className="mx-auto h-7 w-7 text-slate-300" />
                <p className="mt-2 text-sm font-medium text-slate-700">
                  No products found
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      to={`/shop/product/${product.id}`}
                      onPointerEnter={() => prefetchProductDetail(product.id)}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        prefetchProductDetail(product.id);
                      }}
                      onClick={handleSelect}
                      className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-solar-50/80"
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800">
                          {product.name}
                        </p>
                        {product.category?.name ? (
                          <p className="truncate text-xs text-slate-500">
                            {product.category.name}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
