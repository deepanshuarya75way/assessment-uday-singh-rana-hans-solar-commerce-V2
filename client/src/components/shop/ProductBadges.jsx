import { ShieldCheck, Zap } from 'lucide-react';
import { getEffectiveProductPricing } from '@/utils/format';
import { getGstPricing } from '../../utils/format';

export function ProductSaleBadge({
  saleDiscountPercent,
  label = 'Sale',
  size = 'sm',
}) {
  if (!saleDiscountPercent) {
    return null;
  }

  const isLarge = size === 'lg';

  const classes = isLarge
    ? 'px-3 py-1 text-sm rounded-full'
    : 'px-1.5 py-0.5 text-[9px] rounded-md sm:px-2.5 sm:py-1 sm:text-xs sm:rounded-full';

  const iconClasses = isLarge
    ? 'h-4 w-4'
    : 'h-2.5 w-2.5 sm:h-3 sm:w-3';

  return (
    <span
      className={`inline-flex items-center gap-0.5 sm:gap-1 bg-gradient-to-r from-amber-500 to-orange-500 font-bold uppercase tracking-tight sm:tracking-wide text-white shadow-xs sm:shadow-sm ${classes}`}
    >
      <Zap className={`${iconClasses} shrink-0`} />
      {isLarge ? (
        <span>
          {label} {saleDiscountPercent}% Off
        </span>
      ) : (
        <>
          <span className="sm:hidden">{saleDiscountPercent}% OFF</span>
          <span className="hidden sm:inline">
            {label} {saleDiscountPercent}% Off
          </span>
        </>
      )}
    </span>
  );
}

export function ProductSubsidyBadge({
  label = 'Government Subsidy',
  size = 'sm',
}) {
  const isLarge = size === 'lg';

  const classes = isLarge
    ? 'px-3 py-1 text-sm font-semibold tracking-normal rounded-full'
    : 'px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tight rounded-md sm:px-2.5 sm:py-1 sm:text-xs sm:tracking-wide sm:rounded-full';

  const iconClasses = isLarge
    ? 'h-4 w-4'
    : 'h-2.5 w-2.5 sm:h-3 sm:w-3';

  return (
    <span
      className={`inline-flex items-center gap-0.5 sm:gap-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xs sm:shadow-sm ring-1 ring-emerald-500/20 ${classes}`}
    >
      <ShieldCheck className={`${iconClasses} text-emerald-100 shrink-0`} />
      {isLarge ? (
        <span>{label}</span>
      ) : (
        <>
          <span className="sm:hidden">Govt Subsidy</span>
          <span className="hidden sm:inline">{label}</span>
        </>
      )}
    </span>
  );
}

export function ProductCardBadges({ product }) {
  const showSale = Boolean(product?.isOnSale && product?.saleDiscountPercent);
  const showSubsidy = Boolean(product?.isSubsidy || product?.isGovernmentSubsidy);

  if (!showSale && !showSubsidy) {
    return null;
  }

  const alignmentClass =
    showSubsidy && showSale
      ? 'justify-between'
      : showSale
        ? 'justify-end'
        : 'justify-start';

  return (
    <div
      className={`pointer-events-none absolute inset-x-1.5 top-1.5 z-10 flex items-start ${alignmentClass} sm:inset-x-3 sm:top-3 sm:justify-end sm:gap-2`}
    >
      {showSubsidy && <ProductSubsidyBadge label="Government Subsidy" />}
      {showSale && (
        <ProductSaleBadge saleDiscountPercent={product.saleDiscountPercent} />
      )}
    </div>
  );
}

export function ProductDetailBadges({ product }) {
  const pricing = getEffectiveProductPricing(product);
  const showSale = getGstPricing.discountPercent > 0;
  const showSubsidy = Boolean(product?.isSubsidy || product?.isGovernmentSubsidy);

  if (!showSale && !showSubsidy) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {showSubsidy && (
        <ProductSubsidyBadge
          label="Government Subsidy Product"
          size="lg"
        />
      )}
      {showSale && (
        <ProductSaleBadge
        saleDiscountPercent={pricing.discountPercent}
          label={pricing.promotionName || 'Sale'}
          size="lg"
        />
      )}
    </div>
  );
}
