import { PhoneCall } from 'lucide-react';
import { contactInfo } from '@/constants/homeContent';

function TickerItem() {
  return (
    <div className="inline-flex items-center gap-2.5 px-3 sm:gap-3.5 sm:px-6 text-xs sm:text-sm font-medium tracking-wide">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-300/80 text-[11px] shadow-xs">
        ☀️
      </span>

      <span className="font-semibold text-slate-800">
        Get Solar Government Subsidy Benefits Now
      </span>

      <span className="text-solar-600 font-bold select-none">—</span>

      <span className="inline-flex items-center rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[11.5px] sm:text-xs font-bold text-white shadow-xs">
        Subsidy Benefits Are Closing Soon!
      </span>

      <a
        href={`tel:+91${contactInfo.phone}`}
        className="inline-flex items-center gap-1.5 rounded-full bg-solar-600 px-3 py-0.5 text-[11.5px] sm:text-xs font-semibold text-white shadow-xs transition-colors hover:bg-solar-700"
      >
        <PhoneCall className="h-3 w-3 text-white shrink-0" aria-hidden="true" />
        <span>Call Now &amp; Book Your Subsidy</span>
      </a>

      <span className="mx-2 sm:mx-3 text-solar-400/80 font-bold select-none">✦</span>
    </div>
  );
}

export default function MovingSubsidyAnnouncement() {
  // 4 items per set ensures wide screen full coverage; 2 sets ensure seamless -50% to 0% left-to-right looping
  const items = [1, 2, 3, 4];

  return (
    <section
      aria-label="Government Solar Subsidy Announcement"
      className="relative w-full overflow-hidden border-y border-solar-200/90 bg-gradient-to-r from-solar-50/95 via-amber-50/60 to-emerald-50/95 py-2 sm:py-2.5 shadow-[0_2px_10px_rgba(22,163,74,0.06)]"
    >
      {/* Edge gradient fades matching the light solar background */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-solar-50 to-transparent sm:w-20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-emerald-50 to-transparent sm:w-20"
        aria-hidden="true"
      />

      {/* Ticker track running strictly LEFT TO RIGHT */}
      <div className="flex w-full overflow-hidden">
        <div className="animate-ticker-ltr">
          {/* First set of items */}
          <div className="flex shrink-0 items-center">
            {items.map((i) => (
              <TickerItem key={`a-${i}`} />
            ))}
          </div>
          {/* Second identical set of items for seamless loop */}
          <div className="flex shrink-0 items-center" aria-hidden="true">
            {items.map((i) => (
              <TickerItem key={`b-${i}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

