import { useState } from 'react';
import { ArrowRight, Play, Youtube } from 'lucide-react';
import useRevealOnScroll from '@/hooks/useRevealOnScroll';
import { aboutUsContent, aboutUsVideo } from '@/constants/homeContent';
import { useSiteMediaQuery } from '@/context/SiteDataContext';

function AboutUsVideo({ isVisible }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { youtubeId, title, sectionTitle, sectionDescription } = aboutUsVideo;
  const thumbnailUrl = `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;

  return (
    <div
      className={`about-video-panel reveal-up ${isVisible ? 'is-visible' : ''}`}
      style={{ animationDelay: '140ms' }}
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)] sm:rounded-3xl">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-solar-50/30 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white shadow-sm">
              <Youtube className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                {sectionTitle}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {sectionDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="aspect-video w-full overflow-hidden rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.1)] sm:rounded-2xl">
            {isPlaying ? (
              <iframe
                title={title}
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="group relative block h-full w-full cursor-pointer"
                aria-label={`Play ${title}`}
              >
                <img
                  src={thumbnailUrl}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.src = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-slate-900/5" />

                <span className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-4">
                  <span className="about-play-btn flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-solar-700 shadow-xl ring-4 ring-white/25 transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16">
                    <Play className="ml-0.5 h-6 w-6 fill-current sm:h-7 sm:w-7" />
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhyChooseUs() {
  const { ref: sectionRef, isVisible } = useRevealOnScroll();
  const { data: siteMediaResponse } = useSiteMediaQuery();
  const logoSrc = siteMediaResponse?.data?.logo ?? '/logo.jpg';
  const [logoError, setLogoError] = useState(false);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="about-us-heading"
      className="overflow-x-hidden border-b border-slate-100 bg-white py-7 sm:py-10 lg:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-6 sm:gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <div
            className={`reveal-up ${isVisible ? 'is-visible' : ''}`}
            style={{ animationDelay: '60ms' }}
          >
            <div className="flex items-center gap-3">
              {!logoError ? (
                <img
                  src={logoSrc}
                  alt=""
                  className="h-9 w-auto max-w-[110px] object-contain sm:h-10"
                  onError={() => setLogoError(true)}
                />
              ) : null}
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-600">
                About HANS Solar Energy
              </p>
            </div>

            <h2
              id="about-us-heading"
              className="mt-4 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl lg:text-[2.5rem] lg:leading-tight"
            >
              {aboutUsContent.title}
            </h2>

            <div className="mt-4 flex items-center gap-2.5" aria-hidden="true">
              <span className="h-px w-10 bg-solar-500/80" />
              <span className="h-1.5 w-1.5 rounded-full bg-solar-500" />
              <span className="h-px w-6 bg-solar-500/40" />
            </div>

            <div className="mt-7 space-y-5 text-base leading-relaxed text-charcoal-light sm:text-[17px] sm:leading-8">
              {aboutUsContent.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-6 border-t border-slate-100 pt-6">
              <div>
                <p className="text-2xl font-bold tabular-nums text-solar-700 sm:text-3xl">
                  800+
                </p>
                <p className="mt-1 text-sm font-medium text-charcoal-light">
                  Subsidy installations completed
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-charcoal">Bulandshahr, UP</p>
                <p className="mt-1 text-sm text-charcoal-light">
                  Corporate office &amp; North India support
                </p>
              </div>
            </div>

            <a
              href={aboutUsVideo.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="about-youtube-cta mt-6 inline-flex min-h-[44px] items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-red-200 hover:bg-red-50/50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 sm:mt-7"
            >
              <Youtube className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
              {aboutUsVideo.ctaLabel}
              <ArrowRight className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
            </a>
          </div>

          <AboutUsVideo isVisible={isVisible} />
        </div>
      </div>
    </section>
  );
}
