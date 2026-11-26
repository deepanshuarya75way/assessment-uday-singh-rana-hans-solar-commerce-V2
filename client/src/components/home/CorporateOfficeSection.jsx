import { Building2, ExternalLink, MapPin, Navigation } from 'lucide-react';
import Button from '@/components/ui/Button';
import SectionHeader from '@/components/home/SectionHeader';
import useRevealOnScroll from '@/hooks/useRevealOnScroll';
import { corporateOffice } from '@/constants/homeContent';

export default function CorporateOfficeSection() {
  const { ref: sectionRef, isVisible } = useRevealOnScroll();

  return (
    <section
      ref={sectionRef}
      id="corporate-office-section"
      className="border-t border-slate-100 bg-slate-50/70 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`reveal-up ${isVisible ? 'is-visible' : ''}`}>
          <SectionHeader
            eyebrow="Our Office"
            title="Visit Our Corporate Office"
            subtitle="Meet our team in Bulandshahr for product guidance, subsidy support and solar consultations."
            align="center"
            className="mx-auto"
          />
        </div>

        <div
          className={`reveal-up mt-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_40px_rgba(15,23,42,0.06)] sm:mt-10 ${isVisible ? 'is-visible' : ''}`}
          style={{ animationDelay: '90ms' }}
        >
          <div className="grid lg:grid-cols-2">
            {/* Office Details Column */}
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-solar-50 text-solar-700 ring-1 ring-solar-100">
                  <Building2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-solar-50 px-2.5 py-0.5 text-xs font-bold text-solar-700 ring-1 ring-solar-200/80">
                    ☀️ HANS SOLAR ♻️
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">North India Head Office</p>
                </div>
              </div>

              <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                HANS Solar Corporate Office
              </h3>

              {/* Clickable Address Card — clicking opens exact Google Maps destination */}
              <a
                href={corporateOffice.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Click to open HANS SOLAR on Google Maps"
                className="group mt-5 block rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 sm:p-5 transition-all duration-200 hover:border-solar-300 hover:bg-solar-50/60 hover:shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-solar-600 shadow-sm ring-1 ring-slate-200/60 transition-colors group-hover:bg-solar-600 group-hover:text-white">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
                    <p className="font-semibold text-slate-900">
                      1st Floor, Balaji Complex,
                    </p>
                    <p className="text-slate-600">
                      Near Purana Roadways Bus Stand,
                    </p>
                    <p className="text-slate-600">
                      Bulandshahr 203001, UP 🇮🇳
                    </p>
                    <p className="text-xs text-slate-500">
                      Bulandshahr, Uttar Pradesh 203001
                    </p>
                    <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-solar-700 transition-colors group-hover:text-solar-800">
                      <span>Open in Google Maps</span>
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </a>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  href={corporateOffice.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  className="w-full rounded-xl sm:w-auto shadow-sm shadow-solar-600/20"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </Button>
              </div>
            </div>

            {/* Interactive Responsive Map Column */}
            <div className="relative h-[280px] sm:h-[340px] lg:h-full min-h-[280px] lg:min-h-[420px] border-t border-slate-100 bg-slate-100 lg:border-l lg:border-t-0">
              {/* Floating Quick Action Badge */}
              <a
                href={corporateOffice.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-md backdrop-blur-sm ring-1 ring-slate-900/10 transition-all hover:bg-white hover:text-solar-700 hover:shadow-lg"
              >
                <MapPin className="h-3.5 w-3.5 text-solar-600" />
                <span>Open in Google Maps</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>

              <iframe
                title="HANS Solar corporate office location"
                src={corporateOffice.embedUrl}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
