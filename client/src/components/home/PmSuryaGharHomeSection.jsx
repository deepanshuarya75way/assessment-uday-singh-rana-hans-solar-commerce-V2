import {
  ArrowRight,
  BadgeCheck,
  Gift,
  Info,
  Leaf,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import useRevealOnScroll from '@/hooks/useRevealOnScroll';
import {
  pmSuryaGharHomeCompany,
  pmSuryaGharHomeDisclaimer,
  pmSuryaGharHomeSubsidyCards,
} from '@/constants/pmSuryaGharContent';

const formatIndianCurrency = (value) =>
  new Intl.NumberFormat('en-IN').format(value);

const BRAND_NAME_LINES = [
  'HANS SOLAR',
  'RENEWABLE ENERGY INDIA PVT. LTD.',
];

const INTRO_COPY =
  'Install rooftop solar with an authorized partner and claim eligible central government subsidy on your home system — with end-to-end guidance from system selection to installation support.';

const DESKTOP_ECO_TAG = 'CLEAN ENERGY | BRIGHTER TOMORROW';
const DESKTOP_TAGLINE = 'Your Trusted Solar Partner for a Greener India';
const DESKTOP_VENDOR_SUBTEXT = 'Government Approved Rooftop Solar Partner';
const DESKTOP_IMAGE_SCRIPT = 'Clean Energy Brighter Tomorrow';
const DESKTOP_IMAGE_BADGE = '20,000+ परिवारों का भरोसा';
const DESKTOP_IMAGE_FEATURES = [
  { label: 'End-to-End Support', icon: Settings },
  { label: 'Expert Guidance', icon: UserRound },
  { label: 'Quality Installation', icon: ShieldCheck },
];

function BrandTrustHeaderMobile({ isVisible }) {
  return (
    <header
      className={`reveal-up overflow-hidden rounded-b-2xl border border-t-0 border-slate-200/80 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)] lg:hidden ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="border-b border-solar-100/70 bg-gradient-to-br from-solar-50/85 via-white to-emerald-50/35 px-4 py-3.5">
        <h2
          id="pm-surya-ghar-home-heading"
          className="text-pretty text-left"
        >
          <span className="block text-[1.125rem] font-extrabold leading-[1.15] tracking-[-0.01em] text-[#0a2340] sm:text-[1.1875rem]">
            {BRAND_NAME_LINES[0]}
          </span>
          <span className="mt-1 block text-[0.8125rem] font-bold leading-snug tracking-[0.005em] text-[#163456] sm:text-[0.875rem]">
            {BRAND_NAME_LINES[1]}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-[#f8fbf9] p-2.5">
        <div className="flex min-w-0 items-start gap-2 rounded-xl border border-slate-200/80 bg-white px-2.5 py-2 shadow-sm">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-solar-600 text-white">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase leading-tight tracking-[0.04em] text-[#0f2744]">
              {pmSuryaGharHomeCompany.vendorScheme.toUpperCase()}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase leading-tight tracking-[0.06em] text-solar-700">
              {pmSuryaGharHomeCompany.vendorBadge}
              <BadgeCheck className="h-3 w-3 shrink-0 text-solar-600" aria-hidden="true" />
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-start gap-2 rounded-xl border border-slate-200/80 bg-white px-2.5 py-2 shadow-sm">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-solar-50 text-solar-700">
            <Users className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-bold tabular-nums leading-none text-solar-700">
              {pmSuryaGharHomeCompany.trustStat}
            </p>
            <p className="mt-1 text-[9px] font-semibold leading-snug text-slate-600">
              {pmSuryaGharHomeCompany.trustLabel}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

function SubsidyAmountCard({ card }) {
  const amountDisplay = `${card.amountPrefix}${formatIndianCurrency(card.amountValue)}`;
  const showsUpToPrefix = card.amountPrefix.startsWith('Up to');

  return (
    <article
      className={`flex min-w-0 flex-col rounded-2xl border bg-white shadow-[0_4px_14px_rgba(15,23,42,0.05)] max-lg:items-center max-lg:p-2.5 max-lg:text-center lg:rounded-xl lg:p-4 lg:shadow-sm lg:sm:p-5 ${
        card.highlighted
          ? 'border-solar-200 max-lg:ring-1 max-lg:ring-solar-100 lg:border-solar-300/80 lg:ring-1 lg:ring-solar-200/60'
          : 'border-solar-100 max-lg:border-slate-200/90 lg:border-slate-200/90'
      }`}
    >
      <p className="text-[10px] font-medium text-slate-500 max-lg:leading-tight lg:text-[11px] lg:font-semibold lg:uppercase lg:tracking-[0.14em] lg:sm:text-xs">
        {card.capacity}
      </p>
      {showsUpToPrefix ? (
        <div className="mt-1 max-lg:flex max-lg:flex-col max-lg:items-center lg:contents">
          <span className="text-[9px] font-medium leading-none text-slate-500 lg:hidden">
            Up to
          </span>
          <p className="text-base font-bold tabular-nums leading-tight text-solar-700 max-lg:tracking-tight lg:mt-2 lg:text-2xl lg:text-slate-900 lg:sm:text-[1.65rem]">
            <span className="lg:hidden">
              ₹{formatIndianCurrency(card.amountValue)}
            </span>
            <span className="hidden lg:inline">{amountDisplay}</span>
          </p>
        </div>
      ) : (
        <p className="mt-1 text-base font-bold tabular-nums leading-tight text-solar-700 max-lg:tracking-tight lg:mt-2 lg:text-2xl lg:text-slate-900 lg:sm:text-[1.65rem]">
          {amountDisplay}
        </p>
      )}
      <p className="mt-1.5 hidden text-xs font-medium text-solar-800 lg:block lg:sm:text-sm">
        {card.label}
      </p>
      {card.badge ? (
        <span className="mt-3 hidden w-fit rounded-md bg-solar-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-solar-800 ring-1 ring-solar-100 lg:inline-flex lg:sm:text-[11px]">
          {card.badge}
        </span>
      ) : null}
    </article>
  );
}

function DesktopSubsidyAmountCard({ card }) {
  const showsUpToPrefix = card.amountPrefix.startsWith('Up to');

  return (
    <article
      className={`flex min-w-0 flex-col rounded-2xl border bg-white px-5 py-4 shadow-[0_4px_16px_rgba(15,23,42,0.05)] ${
        card.highlighted
          ? 'border-solar-200 ring-1 ring-solar-100'
          : 'border-slate-200/90'
      }`}
    >
      <p className="text-sm font-medium text-slate-500">
        {card.capacity}
        {showsUpToPrefix ? (
          <span className="font-normal text-slate-400"> Up to</span>
        ) : null}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums leading-none text-solar-700 xl:text-[1.75rem]">
        ₹{formatIndianCurrency(card.amountValue)}
      </p>
    </article>
  );
}

function DesktopSubsidyLayout({ isVisible }) {
  return (
    <div
      className={`reveal-up hidden lg:block ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white shadow-[0_18px_52px_rgba(15,23,42,0.08)]">
        <div className="grid grid-cols-[1.06fr_0.94fr] items-stretch gap-7 p-8 xl:gap-9 xl:p-10 2xl:gap-10 2xl:p-11">
          <div className="flex flex-col gap-4 xl:gap-[1.125rem]">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-solar-200/80 bg-solar-50/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-solar-800">
              <Leaf className="h-4 w-4 text-solar-600" aria-hidden="true" />
              {DESKTOP_ECO_TAG}
            </span>

            <h2 className="text-[clamp(1.75rem,2.5vw,2.5rem)] font-bold leading-[1.12] tracking-tight text-[#0f2744]">
              {BRAND_NAME_LINES.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>

            <p className="text-lg font-medium text-slate-500">
              {DESKTOP_TAGLINE}
            </p>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex min-w-0 items-start gap-3.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-[0_4px_16px_rgba(15,23,42,0.05)]">
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-solar-600 text-white">
                  <BadgeCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase leading-tight tracking-[0.04em] text-[#0f2744]">
                    {pmSuryaGharHomeCompany.vendorScheme.toUpperCase()}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.06em] text-solar-700">
                    {pmSuryaGharHomeCompany.vendorBadge}
                    <BadgeCheck className="h-4 w-4 shrink-0 text-solar-600" aria-hidden="true" />
                  </p>
                  <p className="mt-1.5 text-xs leading-snug text-slate-500">
                    {DESKTOP_VENDOR_SUBTEXT}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-start gap-3.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-[0_4px_16px_rgba(15,23,42,0.05)]">
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-solar-50 text-solar-700">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-3xl font-bold tabular-nums leading-none text-solar-700 xl:text-[2rem]">
                    {pmSuryaGharHomeCompany.trustStat}
                  </p>
                  <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-600">
                    {pmSuryaGharHomeCompany.trustLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3.5">
              {pmSuryaGharHomeSubsidyCards.map((card) => (
                <DesktopSubsidyAmountCard key={card.capacity} card={card} />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3.5">
              <Button
                to="/subsidy/pm-surya-ghar"
                size="lg"
                className="min-h-[52px] rounded-full px-8 text-lg font-semibold shadow-md shadow-solar-600/15"
              >
                Check Subsidy Eligibility
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                to="/shop"
                variant="secondary"
                size="lg"
                className="min-h-[52px] rounded-full border-solar-600 bg-white px-8 text-lg font-semibold text-solar-700"
              >
                View Solar Sets
              </Button>
            </div>

            <div className="flex items-start gap-2 pt-0.5">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                aria-hidden="true"
              />
              <p className="text-xs leading-relaxed text-slate-500">
                {pmSuryaGharHomeDisclaimer}
              </p>
            </div>
          </div>

          <div className="relative h-full min-h-0">
            <picture>
              <source srcSet="/new.webp" type="image/webp" />
              <img
                src="/new.jpg"
                alt="Happy family with rooftop solar installation by HANS Solar Energy"
                className="subsidy-hero-image h-full min-h-full w-full rounded-2xl object-cover object-center shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
                fetchPriority="low"
                decoding="async"
                loading="lazy"
              />
            </picture>

            <p className="pointer-events-none absolute left-5 top-5 max-w-[200px] font-serif text-[1.5rem] italic leading-tight text-solar-800/90 xl:text-[1.65rem]">
              {DESKTOP_IMAGE_SCRIPT}
            </p>

            <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-[#1d4f91] px-4 py-2 text-center text-xs font-bold leading-tight text-white ring-2 ring-white/90">
              {DESKTOP_IMAGE_BADGE}
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-stretch justify-around gap-2 rounded-b-2xl border-t border-white/80 bg-white/95 px-4 py-4 backdrop-blur-sm">
              {DESKTOP_IMAGE_FEATURES.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-solar-50 text-solar-700 ring-1 ring-solar-100">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold leading-tight text-slate-700">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PmSuryaGharHomeSection() {
  const { ref: sectionRef, isVisible } = useRevealOnScroll();

  return (
    <section
      ref={sectionRef}
      aria-labelledby="pm-surya-ghar-home-heading"
      className="relative overflow-x-hidden border-b border-slate-200/80 bg-[#eef6f1] py-4 pt-0 lg:border-b-slate-200/80 lg:bg-gradient-to-b lg:from-[#eef6f1] lg:via-[#f5faf7] lg:to-white lg:py-5 lg:pt-5 xl:py-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(22,163,74,0.06),transparent_55%)] lg:bg-[radial-gradient(ellipse_at_top,rgba(22,163,74,0.05),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:hidden">
        <BrandTrustHeaderMobile isVisible={isVisible} />

        <div className="mt-3 grid items-start gap-3">
          <div
            className={`reveal-up mx-auto w-full max-w-xl ${isVisible ? 'is-visible' : ''}`}
            style={{ animationDelay: '80ms' }}
          >
            <picture>
              <source srcSet="/new.webp" type="image/webp" />
              <img
                src="/new.jpg"
                alt="Happy family with rooftop solar installation by HANS Solar Energy"
                className={`subsidy-hero-image aspect-[16/10] w-full rounded-2xl object-cover object-[center_38%] shadow-[0_8px_24px_rgba(15,23,42,0.1)] max-lg:shadow-[0_10px_28px_rgba(15,23,42,0.12)] ${isVisible ? 'is-visible' : 'opacity-0'}`}
                fetchPriority="low"
                decoding="async"
                loading="lazy"
              />
            </picture>
          </div>

          <div
            className={`reveal-up flex flex-col ${isVisible ? 'is-visible' : ''}`}
            style={{ animationDelay: '120ms' }}
          >
            <div className="flex items-start gap-3 rounded-2xl border border-solar-100/90 bg-gradient-to-r from-solar-50/95 via-white to-emerald-50/30 px-3.5 py-3 shadow-sm max-lg:shadow-[0_4px_14px_rgba(15,23,42,0.04)]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-solar-600 text-white shadow-sm">
                <Gift className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="min-w-0 text-sm font-semibold leading-snug text-[#0f2744]">
                {INTRO_COPY}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 max-lg:mt-3">
              {pmSuryaGharHomeSubsidyCards.map((card) => (
                <SubsidyAmountCard key={card.capacity} card={card} />
              ))}
            </div>

            <div className="mt-3 flex flex-col gap-2.5 max-lg:mt-4">
              <Button
                to="/subsidy/pm-surya-ghar"
                size="lg"
                className="min-h-[48px] w-full rounded-xl px-6 text-[15px] font-semibold shadow-md shadow-solar-600/20 max-lg:rounded-2xl"
              >
                Check Subsidy Eligibility
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                to="/shop"
                variant="secondary"
                size="lg"
                className="min-h-[48px] w-full rounded-xl border-solar-600 px-6 text-[15px] font-semibold text-solar-700 max-lg:rounded-2xl max-lg:bg-white"
              >
                View Solar Sets
              </Button>
            </div>

            <div className="mt-3 flex items-start gap-2 max-lg:mt-3.5">
              <Info
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
                aria-hidden="true"
              />
              <p className="text-[10px] leading-relaxed text-slate-500 max-lg:text-slate-600">
                {pmSuryaGharHomeDisclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto hidden w-full max-w-[min(96rem,calc(100vw-2.5rem))] px-4 lg:block xl:px-5">
        <DesktopSubsidyLayout isVisible={isVisible} />
      </div>
    </section>
  );
}
