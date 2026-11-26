import {
  BatteryCharging,
  Landmark,
  Layers,
  ShieldCheck,
  Sun,
  Users,
  Zap,
} from 'lucide-react';
import SectionHeader from '@/components/home/SectionHeader';
import useRevealOnScroll from '@/hooks/useRevealOnScroll';
import { trustFeatures } from '@/constants/homeContent';

const iconMap = {
  Sun,
  Zap,
  BatteryCharging,
  Layers,
};

const companyStats = [
  {
    value: '800+',
    label: 'Solar Installations',
    detail: 'Subsidy sets installed in homes',
    icon: Sun,
  },
  {
    value: '20,000+',
    label: 'Happy Families',
    detail: 'Trusted for clean solar energy',
    icon: Users,
  },
  {
    value: '₹78,000',
    label: 'Max Govt Subsidy',
    detail: 'PM Surya Ghar scheme benefit',
    icon: Landmark,
  },
  {
    value: '100%',
    label: 'End-to-End Support',
    detail: 'DISCOM net-metering & subsidy',
    icon: ShieldCheck,
  },
];

export default function FeatureSection() {
  const { ref: sectionRef, isVisible } = useRevealOnScroll();

  return (
    <section
      ref={sectionRef}
      className="border-y border-slate-100 bg-slate-50/70 py-7 sm:py-10 lg:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`reveal-up ${isVisible ? 'is-visible' : ''}`}>
          <SectionHeader
            eyebrow="Credibility & Experience"
            title="HANS Solar at a Glance"
            subtitle="Verified residential scale, genuine government subsidies, and end-to-end solar engineering."
            align="center"
            showAccent
          />
        </div>

        {/* 4 Core Credibility Metrics: Clean 2x2 grid on mobile, 4 columns on desktop */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {companyStats.map(({ value, label, detail, icon: Icon }, index) => (
            <article
              key={label}
              style={{ animationDelay: `${80 + index * 60}ms` }}
              className={`reveal-up group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-solar-300 hover:shadow-md sm:p-5 sm:hover:-translate-y-1 ${
                isVisible ? 'is-visible' : ''
              }`}
            >
              {/* Top Accent Bar */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-solar-500 to-emerald-500 opacity-80 transition-opacity group-hover:opacity-100" />

              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-solar-50 text-solar-700 ring-1 ring-solar-100/80 transition-colors group-hover:bg-solar-600 group-hover:text-white sm:mb-3 sm:h-10 sm:w-10 sm:rounded-xl">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              </div>

              <p className="text-xl font-extrabold tabular-nums tracking-tight text-slate-900 transition-colors group-hover:text-solar-700 sm:text-2xl lg:text-3xl">
                {value}
              </p>

              <h3 className="mt-0.5 text-xs font-bold text-slate-800 sm:mt-1 sm:text-sm">
                {label}
              </h3>

              <p className="mt-0.5 text-[10px] leading-tight text-slate-500 sm:text-xs sm:leading-relaxed">
                {detail}
              </p>
            </article>
          ))}
        </div>

        {/* Supporting Solutions Strip */}
        <div className="mt-6 border-t border-slate-200/60 pt-5 sm:mt-8 sm:pt-6">
          <p className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
            Complete Solar Solutions &amp; Equipment
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:mt-4 sm:grid-cols-4 sm:gap-3">
            {trustFeatures.map(({ title, description, icon }, index) => {
              const Icon = iconMap[icon];
              return (
                <div
                  key={title}
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                  className={`reveal-up flex items-start gap-2 rounded-xl border border-slate-200/70 bg-white/90 p-2.5 shadow-xs transition-colors hover:border-solar-200 hover:bg-white sm:gap-3 sm:p-3.5 ${
                    isVisible ? 'is-visible' : ''
                  }`}
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-solar-50 text-solar-600 ring-1 ring-solar-100/70 sm:h-7 sm:w-7">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold leading-tight text-slate-800 sm:text-sm">
                      {title}
                    </h4>
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-slate-500 sm:text-xs sm:leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
