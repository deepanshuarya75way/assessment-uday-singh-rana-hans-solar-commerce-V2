import { formatCurrency } from '@/utils/format';

export function GovernmentSubsidyInfoBox({ className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/30 p-4 sm:p-5 shadow-xs ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-sm text-white shadow-xs"
          aria-hidden="true"
        >
          🏛️
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-emerald-950 sm:text-base">
            Government Subsidy Eligible Product
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-emerald-900/80 sm:text-sm">
            This product is eligible for applicable government subsidy benefits under the PM Surya Ghar Yojana, subject to government eligibility criteria and applicable guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SubsidyPriceBreakdown({ subsidyPricing }) {
  const {
    originalPrice,
    hasNormalDiscount,
    normalDiscountAmount,
    normalDiscountPercent,
    PromotionName,
    priceAfterDiscount,
    subsidyDiscount,
    gstEnabled,
    gstPercentage,
    gstAmount,
    finalPrice,
    totalSavings,
  } = subsidyPricing;

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      {/* 1. PRODUCT PRICE SECTION */}
      <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Product Price
        </p>
      </div>

      <div className="space-y-2.5 px-4 py-3.5 sm:px-5 sm:py-4">
        {/* Actual Price */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-600">Actual Price</span>
          <span className="font-semibold tabular-nums text-slate-900">
            {formatCurrency(originalPrice)}
          </span>
        </div>

        {Boolean(gstEnabled) && (
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">
              GST ({gstPercentage}%)
            </span>
            <span className="font-semibold tabular-nums text-slate-900">
              {formatCurrency(gstAmount)}
            </span>
          </div>
        )}

        {/* Existing Normal Product Discount (if any) */}
        {hasNormalDiscount && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span>{promotionName || 'Product Discount'} </span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200/70">
                {normalDiscountPercent}% OFF
              </span>
            </span>
            <span className="font-semibold tabular-nums text-amber-700">
              - {formatCurrency(normalDiscountAmount)}
            </span>
          </div>
        )}

        {/* Price After Discount */}
        <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-2.5 text-sm">
          <span className="font-medium text-slate-700">Price After Discount</span>
          <span className="font-bold tabular-nums text-slate-800">
            {formatCurrency(priceAfterDiscount)}
          </span>
        </div>
      </div>

      {/* 2. GOVERNMENT SUBSIDY SECTION */}
      <div className="border-y border-emerald-200/80 bg-emerald-50/50 px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 sm:text-sm">
          <span aria-hidden="true">🏛️</span>
          <span>Government Subsidy</span>
        </div>

        <div className="mt-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700 sm:text-sm">
              Subsidy Benefit
            </span>
            <span className="text-base font-bold tabular-nums text-emerald-700 sm:text-lg">
              - {formatCurrency(subsidyDiscount)}
            </span>
          </div>

        </div>
      </div>

      {/* 3. FINAL PRICE AFTER SUBSIDY & GST */}
      <div className="bg-slate-50/80 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 sm:text-sm">
            Final Price
          </span>
          <span className="text-2xl font-extrabold tabular-nums tracking-tight text-solar-700 sm:text-3xl">
            {formatCurrency(finalPrice)}
          </span>
        </div>

        {/* Total Savings */}
        {totalSavings > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200/70 bg-emerald-100/60 px-3 py-2 text-xs font-semibold text-emerald-900 sm:text-sm">
            <span>Total Savings</span>
            <span className="font-bold tabular-nums text-emerald-800">
              {formatCurrency(totalSavings)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
