import { AlertCircle, RefreshCw } from 'lucide-react';

export default function SectionQueryError({
  message = 'Unable to load this section.',
  onRetry,
  compact = false,
}) {
  return (
    <div
      className={
        compact
          ? 'rounded-xl border border-red-100 bg-red-50/50 px-4 py-3 text-center'
          : 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'
      }
    >
      <div
        className={
          compact
            ? ''
            : 'rounded-2xl border border-red-100 bg-red-50/50 px-5 py-6 text-center'
        }
      >
        <AlertCircle
          className={`mx-auto text-red-500 ${compact ? 'h-5 w-5' : 'h-6 w-6'}`}
          aria-hidden
        />
        <p
          className={`font-medium text-slate-700 ${compact ? 'mt-1.5 text-xs' : 'mt-2 text-sm'}`}
        >
          {message}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={`inline-flex items-center gap-1.5 rounded-lg bg-white font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 ${
              compact ? 'mt-2 px-2.5 py-1 text-[11px]' : 'mt-3 px-3 py-1.5 text-xs'
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
