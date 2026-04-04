/**
 * Monthly Transit Report Layout Component
 *
 * A4-style visual layout for monthly transit report PDF export.
 * Renders a printable report with header, overview, key dates,
 * life area breakdowns, premium upsell, and footer.
 *
 * Captured by html2canvas for PDF generation.
 */

import React from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface MonthlyTransitReportProps {
  /** Month and year */
  month: string; // e.g., "April 2026"
  /** Overview text */
  overview: string;
  /** Key dates */
  keyDates: Array<{ date: string; title: string; description: string }>;
  /** Life area breakdowns */
  lifeAreas: Array<{
    icon: string;
    name: string;
    favorability: number; // 0-100
    description: string;
    bestDays: string;
  }>;
  /** Whether to show premium upsell section */
  isPremium?: boolean;
  /** Premium upsell CTA text */
  premiumCtaText?: string;
  /** On premium CTA click */
  onPremiumCta?: () => void;
  /** Additional className */
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/** Returns a bar color class based on favorability score */
function getBarColor(favorability: number): string {
  if (favorability >= 75) return 'bg-emerald-400';
  if (favorability >= 50) return 'bg-amber-400';
  return 'bg-red-400';
}

/** Returns a text color class based on favorability score */
function getBarTextColor(favorability: number): string {
  if (favorability >= 75) return 'text-emerald-400';
  if (favorability >= 50) return 'text-amber-400';
  return 'text-red-400';
}

// ============================================================================
// MOCK DATA
// ============================================================================

export const MONTHLY_TRANSIT_MOCK_DATA: MonthlyTransitReportProps = {
  month: 'April 2026',
  overview:
    'April brings transformative energy with Pluto\u2019s retrograde station and the Jupiter\u2013Uranus conjunction marking a pivotal month for growth and change. Mercury clears its post-retrograde shadow by mid-month, unlocking smoother communication and decision-making.',
  keyDates: [
    {
      date: 'Apr 3',
      title: 'Venus enters Pisces',
      description: 'heightened romance & art',
    },
    {
      date: 'Apr 10',
      title: 'Mercury retrograde ends',
      description: 'communication clears',
    },
    {
      date: 'Apr 18',
      title: 'Full Moon in Libra',
      description: 'relationships highlighted',
    },
    {
      date: 'Apr 26',
      title: 'Jupiter \u25B7 Gemini',
      description: 'expansion of ideas',
    },
  ],
  lifeAreas: [
    {
      icon: '\uD83D\uDC95',
      name: 'Love & Relationships',
      favorability: 85,
      description: 'Venus in Pisces brings dreamy romantic energy and deeper emotional connections.',
      bestDays: 'Apr 3, 12, 21',
    },
    {
      icon: '\uD83D\uDCBC',
      name: 'Career & Finances',
      favorability: 72,
      description: 'Saturn demands discipline but rewards consistent effort with tangible progress.',
      bestDays: 'Apr 8, 15, 22',
    },
    {
      icon: '\uD83E\uDDE0',
      name: 'Personal Growth',
      favorability: 90,
      description: 'Jupiter\u2013Uranus conjunction fuels breakthrough insights and sudden inspiration.',
      bestDays: 'Apr 5, 14, 26',
    },
    {
      icon: '\uD83C\uDFE5',
      name: 'Health & Wellness',
      favorability: 78,
      description: 'Mars in Gemini keeps energy high \u2014 prioritize rest to avoid burnout.',
      bestDays: 'Apr 2, 11, 19',
    },
  ],
  isPremium: false,
  premiumCtaText: 'Upgrade to Premium',
};

// ============================================================================
// COMPONENT
// ============================================================================

export const MonthlyTransitReport: React.FC<MonthlyTransitReportProps> = ({
  month,
  overview,
  keyDates,
  lifeAreas,
  isPremium = false,
  premiumCtaText = 'Upgrade to Premium',
  onPremiumCta,
  className = '',
}) => {
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className={`w-[794px] min-h-[1123px] bg-[#0B0D17] text-white font-sans ${className}`}
    >
      {/* ── Header Band ──────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#6b3de1] to-indigo-600 p-8">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white/80 text-sm tracking-widest uppercase">
            &#10024; AstroVerse
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white leading-tight">
          Monthly Transit Report
        </h1>

        {/* Month / Year */}
        <p className="text-white/70 text-base mt-1">{month}</p>
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="px-10 py-8 space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Overview</h2>
          <div className="h-px bg-white/10 mb-3" />
          <p className="text-slate-300 text-sm leading-relaxed">{overview}</p>
        </section>

        {/* Key Dates */}
        <section>
          <div className="bg-[#141627] rounded-xl p-6 border border-white/5">
            <h2 className="text-lg font-semibold text-white mb-4">
              Key Dates
            </h2>

            <div className="space-y-0">
              {keyDates.map((kd, idx) => (
                <div
                  key={kd.date}
                  className={`flex gap-4 py-3 ${
                    idx < keyDates.length - 1
                      ? 'border-b border-white/5'
                      : ''
                  } ${idx % 2 !== 0 ? 'bg-[#141627]' : ''}`}
                >
                  {/* Date column */}
                  <span className="w-16 shrink-0 text-sm font-semibold text-[#6b3de1]">
                    {kd.date}
                  </span>

                  {/* Description column */}
                  <div className="min-w-0">
                    <span className="text-sm text-white font-medium">
                      {kd.title}
                    </span>
                    <span className="text-slate-400 text-sm">
                      {' '}&#8212; {kd.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Life Area Breakdown */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">
            Life Area Breakdown
          </h2>
          <div className="h-px bg-white/10 mb-5" />

          <div className="space-y-5">
            {lifeAreas.map((area) => (
              <div
                key={area.name}
                className="bg-[#141627] rounded-xl p-5 border border-white/5"
              >
                {/* Name row with bar */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="text-base">{area.icon}</span>
                    {area.name}
                  </span>

                  {/* Favorability bar */}
                  <div className="flex items-center gap-3 w-48">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getBarColor(area.favorability)}`}
                        style={{ width: `${area.favorability}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-bold w-8 text-right ${getBarTextColor(area.favorability)}`}
                    >
                      {area.favorability}%
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed">
                  {area.description}
                </p>

                {/* Best days */}
                <p className="text-xs text-slate-500 mt-1.5">
                  Best days:{' '}
                  <span className="text-slate-400">{area.bestDays}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Premium Upsell (free users only) */}
        {!isPremium && (
          <section>
            <div className="border-2 border-dashed border-[#6b3de1]/40 rounded-xl p-6 text-center">
              <h3 className="text-base font-semibold text-white mb-2 flex items-center justify-center gap-2">
                <span className="text-yellow-400">&#11088;</span>
                Premium Insights
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto mb-4">
                Unlock personalized transits to your natal chart, timing
                recommendations, and detailed life area analysis&hellip;
              </p>
              <button
                type="button"
                onClick={onPremiumCta}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#6b3de1] hover:bg-[#5a2fd4] text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {premiumCtaText}
                <span className="text-white/70">&rarr;</span>
              </button>
            </div>
          </section>
        )}

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Footer */}
        <footer className="flex items-center justify-between text-xs text-slate-500 pt-2 pb-4">
          <span>
            &#10024; AstroVerse &middot; Monthly Transit Report
          </span>
          <span>
            Generated {generatedDate} &middot; astroverse.com
          </span>
        </footer>
      </div>
    </div>
  );
};

export default MonthlyTransitReport;
