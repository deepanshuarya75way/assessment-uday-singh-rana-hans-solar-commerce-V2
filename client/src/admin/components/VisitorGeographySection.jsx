import { useMemo, useState } from 'react';
import {
  ChevronRight,
  Earth,
  Globe2,
  Loader2,
  MapPin,
  Users,
} from 'lucide-react';
import StatCard from '@/admin/components/ui/StatCard';
import { useGetAdminVisitorGeographyQuery } from '@/services/analyticsApi';

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '3m', label: '3 Months' },
  { id: '1y', label: '1 Year' },
  { id: 'overall', label: 'Overall' },
];

const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');

const formatPercent = (value) => {
  const amount = Number(value || 0);
  return Number.isInteger(amount) ? `${amount}%` : `${amount.toFixed(1)}%`;
};

function DistributionChart({ items, onSelect }) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const width = `${Math.max((item.count / max) * 100, item.count > 0 ? 4 : 0)}%`;
        const interactive = item.drillable;

        const content = (
          <>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-slate-800">{item.name}</span>
              <span className="shrink-0 tabular-nums text-slate-500">
                {formatCount(item.count)} · {formatPercent(item.percent)}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  item.name === 'Other' || item.name === 'Unknown'
                    ? 'bg-slate-400'
                    : 'bg-amber-500'
                }`}
                style={{ width }}
              />
            </div>
          </>
        );

        return (
          <li key={item.name}>
            {interactive ? (
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="w-full rounded-xl p-1 text-left transition hover:bg-amber-50/80"
              >
                {content}
              </button>
            ) : (
              <div className="p-1">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function VisitorGeographySection() {
  const [period, setPeriod] = useState('overall');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');

  const queryArg = useMemo(
    () => ({
      period,
      ...(country ? { country } : {}),
      ...(region ? { region } : {}),
    }),
    [country, period, region],
  );

  const { data, isLoading, isError, isFetching, refetch } =
    useGetAdminVisitorGeographyQuery(queryArg, {
      refetchOnMountOrArgChange: true,
      pollingInterval: 30_000,
    });

  const geography = data?.data?.geography;
  const summary = geography?.summary;
  const breakdown = geography?.breakdown;
  const items = breakdown?.items ?? [];
  const breadcrumb = geography?.breadcrumb ?? [];

  const handlePeriodChange = (nextPeriod) => {
    setPeriod(nextPeriod);
  };

  const handleBreadcrumb = (crumb) => {
    setCountry(crumb.country || '');
    setRegion(crumb.region || '');
  };

  const handleSelectItem = (item) => {
    if (!item?.drillable) {
      return;
    }

    if (!country) {
      setCountry(item.name);
      setRegion('');
      return;
    }

    if (!region) {
      setRegion(item.name);
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Visitor Geography</h2>
          <p className="mt-1 text-sm text-slate-500">
            Unique visitor locations from live site tracking. City-level values are
            estimated from IP geolocation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((option) => {
            const selected = option.id === period;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handlePeriodChange(option.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  selected
                    ? 'bg-amber-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:text-amber-800'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && !geography ? (
        <div className="flex items-center justify-center px-5 py-12">
          <Loader2 className="h-7 w-7 animate-spin text-amber-600" />
        </div>
      ) : isError ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-red-600">
            Unable to load visitor geography. Please try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 text-sm font-semibold text-amber-700 hover:text-amber-800"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Total unique visitors"
              value={formatCount(summary?.total)}
              icon={Users}
              variant="blue"
            />
            <StatCard
              title="India visitors"
              value={formatCount(summary?.india)}
              icon={MapPin}
              variant="emerald"
            />
            <StatCard
              title="Outside India"
              value={formatCount(summary?.outsideIndia)}
              icon={Earth}
              variant="orange"
            />
            <StatCard
              title="India share"
              value={formatPercent(summary?.indiaPercent)}
              icon={Globe2}
              variant="amber"
            />
            <StatCard
              title="Outside-India share"
              value={formatPercent(summary?.outsideIndiaPercent)}
              icon={Globe2}
              variant="blue"
            />
          </div>

          {summary?.unknown > 0 && (
            <p className="mt-3 text-xs text-slate-400">
              {formatCount(summary.unknown)} visitors ({formatPercent(summary.unknownPercent)})
              do not yet have a resolved location.
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-1 text-sm">
            {breadcrumb.map((crumb, index) => {
              const isLast = index === breadcrumb.length - 1;
              return (
                <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                  {index > 0 && (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  )}
                  {isLast ? (
                    <span className="font-semibold text-slate-900">{crumb.label}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBreadcrumb(crumb)}
                      className="font-medium text-amber-700 hover:text-amber-800"
                    >
                      {crumb.label}
                    </button>
                  )}
                </span>
              );
            })}
            {isFetching && geography ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin text-amber-500" />
            ) : null}
          </div>

          {summary?.total === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center text-sm text-slate-500">
              No unique visitors recorded for this period yet.
            </div>
          ) : items.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center text-sm text-slate-500">
              No location breakdown is available for this selection.
            </div>
          ) : (
            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-slate-900">
                  {breakdown?.title || 'Location distribution'}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {breakdown?.level === 'country'
                    ? 'Click a country to drill down. India opens state-level data.'
                    : breakdown?.level === 'region'
                      ? country === 'India'
                        ? 'Click a state to see estimated city-level visitors.'
                        : 'State / region distribution for the selected country.'
                      : 'Estimated city-level distribution for the selected state.'}
                </p>
                <div className="mt-4">
                  <DistributionChart items={items} onSelect={handleSelectItem} />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">
                        {breakdown?.level === 'country'
                          ? 'Country'
                          : breakdown?.level === 'region'
                            ? 'State'
                            : 'City'}
                      </th>
                      <th className="px-4 py-3 text-right">Unique visitors</th>
                      <th className="px-4 py-3 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <tr key={`row-${item.name}`} className="bg-white">
                        <td className="px-4 py-3">
                          {item.drillable ? (
                            <button
                              type="button"
                              onClick={() => handleSelectItem(item)}
                              className="font-medium text-amber-700 hover:text-amber-800"
                            >
                              {item.name}
                            </button>
                          ) : (
                            <span className="font-medium text-slate-800">{item.name}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                          {formatCount(item.count)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                          {formatPercent(item.percent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
