/**
 * ShareableChartCard Component
 *
 * Generates beautifully designed shareable card images for natal charts.
 * Supports 5 templates: Instagram Story (9:16), Twitter (16:9), Pinterest (2:3),
 * Square (1:1), and Daily Insight (800x418).
 *
 * Features:
 * - Big Three signs with degree display
 * - AI-generated insight quotes with gold accent
 * - Element balance visualization (Square template)
 * - Additional placements grid (Pinterest template)
 * - Mini chart wheel placeholder
 * - Cosmic dark theme with glassmorphism
 */

import React from 'react';
import { clsx } from 'clsx';

// ============================================================================
// TYPES
// ============================================================================

export interface ElementBalance {
  fire: number;
  earth: number;
  air: number;
  water: number;
}

export interface Placement {
  planet: string;
  sign: string;
  degree?: number;
}

export interface ShareableChartCardProps {
  /** Person's name */
  name: string;
  /** Sun sign */
  sunSign: string;
  /** Moon sign */
  moonSign: string;
  /** Rising/Ascendant sign */
  risingSign: string;
  /** Sun degree (0-359) */
  sunDegree?: number;
  /** Moon degree (0-359) */
  moonDegree?: number;
  /** Rising degree (0-359) */
  risingDegree?: number;
  /** Birth date string */
  birthDate?: string;
  /** Optional chart wheel SVG */
  chartWheelSvg?: React.ReactNode;
  /** AI-generated insight quote */
  insightQuote?: string;
  /** Element distribution for elemental identity template */
  elements?: ElementBalance;
  /** Additional placements (Venus, Mars, Jupiter, Saturn) */
  additionalPlacements?: Placement[];
  /** Color variant */
  variant?: 'dark' | 'light';
  /** Card template */
  template?: 'instagram-story' | 'twitter' | 'pinterest' | 'square' | 'daily-insight';
  /** Additional className */
  className?: string;
}

// ============================================================================
// CARD SIZES
// ============================================================================

const CARD_SIZES = {
  'instagram-story': { width: 1080, height: 1920, aspectRatio: '9/16' },
  'twitter': { width: 1200, height: 675, aspectRatio: '16/9' },
  'pinterest': { width: 1000, height: 1500, aspectRatio: '2/3' },
  'square': { width: 1080, height: 1080, aspectRatio: '1/1' },
  'daily-insight': { width: 800, height: 418, aspectRatio: '1.91/1' },
} as const;

// ============================================================================
// HELPERS
// ============================================================================

const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

const ELEMENT_COLORS: Record<keyof ElementBalance, string> = {
  fire: 'bg-gradient-to-r from-orange-500 to-red-500',
  earth: 'bg-gradient-to-r from-green-600 to-emerald-500',
  air: 'bg-gradient-to-r from-sky-400 to-cyan-400',
  water: 'bg-gradient-to-r from-blue-500 to-indigo-500',
};

const ELEMENT_ICONS: Record<keyof ElementBalance, string> = {
  fire: 'local_fire_department',
  earth: 'terrain',
  air: 'air',
  water: 'water_drop',
};

function getZodiacSymbol(sign: string): string {
  return ZODIAC_SYMBOLS[sign.toLowerCase()] ?? '⚪';
}

function formatDegree(degree?: number): string {
  if (degree === undefined) return '';
  return `${degree}°`;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Zodiac badge with sign symbol and optional degree */
function ZodiacBadge({
  sign,
  symbol,
  degree,
  label,
  variant = 'dark',
}: {
  sign: string;
  symbol: string;
  degree?: number;
  label: string;
  variant?: 'dark' | 'light';
}) {
  const isDark = variant === 'dark';

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center rounded-xl px-4 py-2 min-w-[80px]',
        isDark
          ? 'bg-gradient-to-br from-[#141627]/80 to-[#1a1d3a]/80 backdrop-blur-md border border-white/10'
          : 'bg-white/90 backdrop-blur-sm border border-violet-200',
      )}
    >
      <div className="text-3xl mb-1">{symbol}</div>
      <div
        className={clsx(
          'text-sm font-bold uppercase tracking-wide',
          isDark ? 'text-white' : 'text-violet-900',
        )}
      >
        {sign}
      </div>
      {degree !== undefined && (
        <div
          className={clsx(
            'text-xs font-medium mt-0.5',
            isDark ? 'text-purple-400' : 'text-purple-600',
          )}
        >
          {degree}°
        </div>
      )}
      <div
        className={clsx(
          'text-[10px] uppercase tracking-wider mt-1',
          isDark ? 'text-gray-500' : 'text-gray-400',
        )}
      >
        {label}
      </div>
    </div>
  );
}

/** Element balance bars for Elemental Identity template */
function ElementBalance({
  elements,
  variant = 'dark',
}: {
  elements: ElementBalance;
  variant?: 'dark' | 'light';
}) {
  const isDark = variant === 'dark';
  const total = elements.fire + elements.earth + elements.air + elements.water;
  const maxVal = Math.max(elements.fire, elements.earth, elements.air, elements.water);

  const elementEntries: Array<{ key: keyof ElementBalance; label: string }> = [
    { key: 'fire', label: 'Fire' },
    { key: 'earth', label: 'Earth' },
    { key: 'air', label: 'Air' },
    { key: 'water', label: 'Water' },
  ];

  return (
    <div className="w-full space-y-2">
      {elementEntries.map(({ key, label }) => {
        const percentage = Math.round((elements[key] / total) * 100);
        const barWidth = (elements[key] / maxVal) * 100;

        return (
          <div key={key} className="flex items-center gap-2">
            {/* Icon */}
            <span
              className={clsx(
                'material-symbols-outlined text-[16px] flex-shrink-0',
                isDark ? 'text-gray-400' : 'text-gray-500',
              )}
            >
              {ELEMENT_ICONS[key]}
            </span>
            {/* Label */}
            <span
              className={clsx(
                'text-xs font-medium w-16 flex-shrink-0',
                isDark ? 'text-gray-300' : 'text-gray-600',
              )}
            >
              {label}
            </span>
            {/* Bar */}
            <div
              className={clsx(
                'flex-1 h-2 rounded-full overflow-hidden',
                isDark ? 'bg-white/10' : 'bg-gray-200',
              )}
            >
              <div
                className={clsx('h-full rounded-full', ELEMENT_COLORS[key])}
                style={{ width: `${barWidth}%` }}
              />
            </div>
            {/* Percentage */}
            <span
              className={clsx(
                'text-xs font-bold w-8 text-right flex-shrink-0',
                isDark ? 'text-white' : 'text-gray-700',
              )}
            >
              {percentage}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Additional placements grid for Pinterest template */
function AdditionalPlacements({
  placements,
  variant = 'dark',
}: {
  placements: Placement[];
  variant?: 'dark' | 'light';
}) {
  const isDark = variant === 'dark';

  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      {placements.map((placement) => (
        <div
          key={placement.planet}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            isDark
              ? 'bg-white/5 border border-white/10'
              : 'bg-violet-50 border border-violet-200',
          )}
        >
          <span className="text-lg" role="img" aria-hidden="true">
            {getZodiacSymbol(placement.sign)}
          </span>
          <div className="flex-1 min-w-0">
            <div
              className={clsx(
                'text-xs font-medium truncate',
                isDark ? 'text-white' : 'text-violet-900',
              )}
            >
              {placement.planet}
            </div>
            <div
              className={clsx(
                'text-[10px] uppercase truncate',
                isDark ? 'text-gray-400' : 'text-gray-500',
              )}
            >
              {placement.sign}
              {placement.degree !== undefined && ` ${placement.degree}°`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Insight quote with gold accent */
function InsightQuote({
  quote,
  variant = 'dark',
}: {
  quote: string;
  variant?: 'dark' | 'light';
}) {
  const isDark = variant === 'dark';

  return (
    <div
      className={clsx(
        'text-center px-4 py-2 rounded-lg',
        isDark
          ? 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20'
          : 'bg-amber-50 border border-amber-200',
      )}
    >
      <span
        className={clsx(
          'material-symbols-outlined text-[20px] mb-1 block',
          isDark ? 'text-amber-400' : 'text-amber-600',
        )}
      >
        format_quote
      </span>
      <p
        className={clsx(
          'text-sm italic font-light leading-relaxed',
          isDark ? 'text-amber-200' : 'text-amber-800',
        )}
      >
        {quote}
      </p>
    </div>
  );
}

// ============================================================================
// TEMPLATE LAYOUTS
// ============================================================================

/** Instagram Story Template (9:16) */
function InstagramStoryLayout({
  name,
  sunSign,
  moonSign,
  risingSign,
  sunDegree,
  moonDegree,
  risingDegree,
  chartWheelSvg,
  insightQuote,
  variant = 'dark',
}: Omit<ShareableChartCardProps, 'template' | 'className' | 'elements' | 'additionalPlacements'>) {
  const isDark = variant === 'dark';

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center h-full w-full p-8 relative overflow-hidden',
        isDark
          ? 'bg-gradient-to-br from-[#0B0D17] via-[#141627] to-[#1a1d3a]'
          : 'bg-gradient-to-br from-violet-100 via-purple-50 to-pink-50',
      )}
    >
      {/* Decorative stars */}
      <div className="absolute top-12 left-12">
        <span className="material-symbols-outlined text-[32px] text-purple-500/20">star</span>
      </div>
      <div className="absolute top-24 right-16">
        <span className="material-symbols-outlined text-[24px] text-amber-500/20">star</span>
      </div>
      <div className="absolute bottom-32 left-20">
        <span className="material-symbols-outlined text-[28px] text-purple-500/20">star</span>
      </div>

      {/* Logo */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <span className="material-symbols-outlined text-[24px] text-purple-400">auto_awesome</span>
        <span
          className={clsx(
            'text-sm font-bold tracking-wider',
            isDark ? 'text-white/80' : 'text-purple-900',
          )}
        >
          ASTROVERSE
        </span>
      </div>

      {/* Chart Wheel */}
      <div className="w-64 h-64 mb-8 relative">
        {chartWheelSvg ? (
          <div className="w-full h-full flex items-center justify-center">{chartWheelSvg}</div>
        ) : (
          <div
            className={clsx(
              'w-full h-full rounded-full border-4 flex items-center justify-center relative',
              isDark ? 'border-purple-500/30 bg-purple-500/5' : 'border-purple-400 bg-purple-100',
            )}
          >
            {/* Zodiac ring placeholder */}
            <div className="absolute inset-2 rounded-full border border-dashed border-white/20" />
            <span className={clsx('text-6xl', isDark ? 'text-purple-400/40' : 'text-purple-400')}>
              &#9788;
            </span>
          </div>
        )}
      </div>

      {/* Big Three Cards */}
      <div className="flex gap-4 mb-6">
        <ZodiacBadge
          sign={sunSign}
          symbol={getZodiacSymbol(sunSign)}
          degree={sunDegree}
          label="Sun"
          variant={variant}
        />
        <ZodiacBadge
          sign={moonSign}
          symbol={getZodiacSymbol(moonSign)}
          degree={moonDegree}
          label="Moon"
          variant={variant}
        />
        <ZodiacBadge
          sign={risingSign}
          symbol={getZodiacSymbol(risingSign)}
          degree={risingDegree}
          label="Rising"
          variant={variant}
        />
      </div>

      {/* Name */}
      <h2
        className={clsx(
          'text-3xl font-bold mb-3 text-center',
          isDark ? 'text-white' : 'text-purple-900',
        )}
      >
        {name}
      </h2>

      {/* Insight Quote */}
      {insightQuote && <InsightQuote quote={insightQuote} variant={variant} />}

      {/* Tagline */}
      <div
        className={clsx(
          'mt-auto pt-6 text-sm font-medium tracking-widest uppercase',
          isDark ? 'text-purple-400' : 'text-purple-600',
        )}
      >
        Written in the Stars
      </div>

      {/* Footer */}
      <div
        className={clsx('absolute bottom-4 text-[10px]', isDark ? 'text-gray-600' : 'text-gray-400')}
      >
        astroverse.app
      </div>
    </div>
  );
}

/** Twitter/Header Card Template (16:9) */
function TwitterLayout({
  name,
  sunSign,
  moonSign,
  risingSign,
  sunDegree,
  moonDegree,
  risingDegree,
  chartWheelSvg,
  insightQuote,
  variant = 'dark',
}: Omit<ShareableChartCardProps, 'template' | 'className' | 'elements' | 'additionalPlacements'>) {
  const isDark = variant === 'dark';

  return (
    <div
      className={clsx(
        'flex items-center justify-between h-full w-full px-12 py-8 relative',
        isDark
          ? 'bg-gradient-to-br from-[#0B0D17] via-[#141627] to-[#1a1d3a]'
          : 'bg-gradient-to-r from-violet-100 to-purple-50',
      )}
    >
      {/* Left: Big Three */}
      <div className="flex-1">
        <h2
          className={clsx('text-4xl font-bold mb-8', isDark ? 'text-white' : 'text-purple-900')}
        >
          {name}
        </h2>
        <div className="flex gap-3 mb-6">
          <ZodiacBadge
            sign={sunSign}
            symbol={getZodiacSymbol(sunSign)}
            degree={sunDegree}
            label="Sun"
            variant={variant}
          />
          <ZodiacBadge
            sign={moonSign}
            symbol={getZodiacSymbol(moonSign)}
            degree={moonDegree}
            label="Moon"
            variant={variant}
          />
          <ZodiacBadge
            sign={risingSign}
            symbol={getZodiacSymbol(risingSign)}
            degree={risingDegree}
            label="Rising"
            variant={variant}
          />
        </div>
        {insightQuote && (
          <div className="max-w-md">
            <InsightQuote quote={insightQuote} variant={variant} />
          </div>
        )}
      </div>

      {/* Right: Chart Wheel */}
      <div className="w-48 h-48 flex-shrink-0 ml-8">
        {chartWheelSvg ? (
          <div className="w-full h-full flex items-center justify-center">{chartWheelSvg}</div>
        ) : (
          <div
            className={clsx(
              'w-full h-full rounded-full border-4 flex items-center justify-center',
              isDark ? 'border-purple-500/30 bg-purple-500/5' : 'border-purple-400 bg-purple-100',
            )}
          >
            <span className={clsx('text-4xl', isDark ? 'text-purple-400/40' : 'text-purple-400')}>
              &#9788;
            </span>
          </div>
        )}
      </div>

      {/* Logo */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px] text-purple-400">auto_awesome</span>
        <span className={clsx('text-xs font-medium', isDark ? 'text-gray-500' : 'text-gray-400')}>
          astroverse.app
        </span>
      </div>
    </div>
  );
}

/** Pinterest Template (2:3) with additional placements */
function PinterestLayout({
  name,
  sunSign,
  moonSign,
  risingSign,
  sunDegree,
  moonDegree,
  risingDegree,
  chartWheelSvg,
  insightQuote,
  additionalPlacements,
  variant = 'dark',
}: Omit<ShareableChartCardProps, 'template' | 'className' | 'elements'>) {
  const isDark = variant === 'dark';

  return (
    <div
      className={clsx(
        'flex flex-col items-center h-full w-full p-8 relative',
        isDark
          ? 'bg-gradient-to-br from-[#0B0D17] via-[#141627] to-[#1a1d3a]'
          : 'bg-gradient-to-br from-violet-100 via-purple-50 to-pink-50',
      )}
    >
      {/* Logo */}
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-purple-400">auto_awesome</span>
          <span className={clsx('text-sm font-bold', isDark ? 'text-white' : 'text-purple-900')}>
            ASTROVERSE
          </span>
        </div>
      </div>

      {/* Chart Wheel */}
      <div className="w-56 h-56 mb-6">
        {chartWheelSvg ? (
          <div className="w-full h-full flex items-center justify-center">{chartWheelSvg}</div>
        ) : (
          <div
            className={clsx(
              'w-full h-full rounded-full border-4 flex items-center justify-center',
              isDark ? 'border-purple-500/30 bg-purple-500/5' : 'border-purple-400 bg-purple-100',
            )}
          >
            <span className={clsx('text-5xl', isDark ? 'text-purple-400/40' : 'text-purple-400')}>
              &#9788;
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <h2
        className={clsx('text-2xl font-bold mb-4', isDark ? 'text-white' : 'text-purple-900')}
      >
        {name}
      </h2>

      {/* Big Three */}
      <div className="flex gap-3 mb-4">
        <ZodiacBadge
          sign={sunSign}
          symbol={getZodiacSymbol(sunSign)}
          degree={sunDegree}
          label="Sun"
          variant={variant}
        />
        <ZodiacBadge
          sign={moonSign}
          symbol={getZodiacSymbol(moonSign)}
          degree={moonDegree}
          label="Moon"
          variant={variant}
        />
        <ZodiacBadge
          sign={risingSign}
          symbol={getZodiacSymbol(risingSign)}
          degree={risingDegree}
          label="Rising"
          variant={variant}
        />
      </div>

      {/* Divider */}
      <div
        className={clsx(
          'w-full h-px my-4 border-t border-dashed',
          isDark ? 'border-white/20' : 'border-purple-300',
        )}
      />

      {/* Insight Quote */}
      {insightQuote && <InsightQuote quote={insightQuote} variant={variant} />}

      {/* Additional Placements */}
      {additionalPlacements && additionalPlacements.length > 0 && (
        <div className="w-full mt-4">
          <div
            className={clsx(
              'text-xs font-semibold uppercase tracking-wider mb-2 text-center',
              isDark ? 'text-gray-400' : 'text-gray-500',
            )}
          >
            Full Chart
          </div>
          <AdditionalPlacements placements={additionalPlacements} variant={variant} />
        </div>
      )}

      {/* Footer */}
      <div
        className={clsx('mt-auto pt-4 text-[10px]', isDark ? 'text-gray-600' : 'text-gray-400')}
      >
        astroverse.app &bull; birth chart
      </div>
    </div>
  );
}

/** Square Template (1:1) with element balance */
function SquareLayout({
  name,
  sunSign,
  moonSign,
  risingSign,
  sunDegree,
  moonDegree,
  risingDegree,
  chartWheelSvg,
  elements,
  variant = 'dark',
}: Omit<ShareableChartCardProps, 'template' | 'className' | 'insightQuote' | 'additionalPlacements'>) {
  const isDark = variant === 'dark';

  return (
    <div
      className={clsx(
        'flex h-full w-full p-8 relative overflow-hidden',
        isDark
          ? 'bg-gradient-to-br from-[#0B0D17] via-[#141627] to-[#1a1d3a]'
          : 'bg-gradient-to-br from-violet-100 to-purple-50',
      )}
    >
      {/* Left: Chart Wheel + Sun Sign */}
      <div className="flex-1 flex flex-col items-center justify-center pr-4">
        <div className="w-40 h-40 mb-4">
          {chartWheelSvg ? (
            <div className="w-full h-full flex items-center justify-center">{chartWheelSvg}</div>
          ) : (
            <div
              className={clsx(
                'w-full h-full rounded-full border-4 flex items-center justify-center',
                isDark ? 'border-purple-500/30 bg-purple-500/5' : 'border-purple-400 bg-purple-100',
              )}
            >
              <span className={clsx('text-4xl', isDark ? 'text-purple-400/40' : 'text-purple-400')}>
                &#9788;
              </span>
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="text-5xl mb-2">{getZodiacSymbol(sunSign)}</div>
          <div
            className={clsx('text-lg font-bold uppercase', isDark ? 'text-white' : 'text-purple-900')}
          >
            {sunSign}
          </div>
          {sunDegree !== undefined && (
            <div className={clsx('text-sm text-purple-400')}>{sunDegree}°</div>
          )}
        </div>
      </div>

      {/* Right: Info */}
      <div className="flex-1 flex flex-col justify-center pl-4">
        {/* Logo */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="material-symbols-outlined text-[16px] text-purple-400">auto_awesome</span>
          <span className={clsx('text-xs font-bold', isDark ? 'text-white/80' : 'text-purple-900')}>
            ASTROVERSE
          </span>
        </div>

        {/* Name */}
        <h2 className={clsx('text-xl font-bold mb-4', isDark ? 'text-white' : 'text-purple-900')}>
          {name}
        </h2>

        {/* Moon + Rising */}
        <div className="flex gap-2 mb-4">
          <div
            className={clsx(
              'flex-1 text-center px-2 py-1.5 rounded-lg',
              isDark ? 'bg-white/5' : 'bg-violet-100',
            )}
          >
            <div className="text-xl">{getZodiacSymbol(moonSign)}</div>
            <div className={clsx('text-xs font-medium', isDark ? 'text-gray-300' : 'text-gray-600')}>
              {moonSign}
            </div>
            {moonDegree !== undefined && (
              <div className={clsx('text-[10px] text-purple-400')}>{moonDegree}°</div>
            )}
          </div>
          <div
            className={clsx(
              'flex-1 text-center px-2 py-1.5 rounded-lg',
              isDark ? 'bg-white/5' : 'bg-violet-100',
            )}
          >
            <div className="text-xl">{getZodiacSymbol(risingSign)}</div>
            <div className={clsx('text-xs font-medium', isDark ? 'text-gray-300' : 'text-gray-600')}>
              {risingSign}
            </div>
            {risingDegree !== undefined && (
              <div className={clsx('text-[10px] text-purple-400')}>{risingDegree}°</div>
            )}
          </div>
        </div>

        {/* Element Balance */}
        {elements && <ElementBalance elements={elements} variant={variant} />}

        {/* Footer */}
        <div
          className={clsx('mt-auto pt-2 text-[10px]', isDark ? 'text-gray-600' : 'text-gray-400')}
        >
          astroverse.app
        </div>
      </div>
    </div>
  );
}

/** Daily Insight Compact Card (800x418) */
function DailyInsightLayout({
  name,
  sunSign,
  moonSign,
  risingSign,
  sunDegree,
  chartWheelSvg,
  insightQuote,
  variant = 'dark',
}: Omit<ShareableChartCardProps, 'template' | 'className' | 'elements' | 'additionalPlacements' | 'moonDegree' | 'risingDegree'>) {
  const isDark = variant === 'dark';

  return (
    <div
      className={clsx(
        'flex h-full w-full items-center px-6 py-4 relative overflow-hidden',
        isDark
          ? 'bg-gradient-to-br from-[#0B0D17] via-[#141627] to-[#1a1d3a]'
          : 'bg-gradient-to-r from-violet-100 to-purple-50',
      )}
    >
      {/* Left: Sign Block */}
      <div className="flex-shrink-0 pr-6 border-r border-dashed">
        <div className="text-center">
          <div className="text-5xl mb-1">{getZodiacSymbol(sunSign)}</div>
          <div
            className={clsx('text-lg font-bold uppercase', isDark ? 'text-white' : 'text-purple-900')}
          >
            {sunSign}
          </div>
          {sunDegree !== undefined && (
            <div className={clsx('text-sm text-purple-400')}>{sunDegree}°</div>
          )}
        </div>
      </div>

      {/* Center: Content */}
      <div className="flex-1 px-6">
        {/* Logo + Name */}
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[14px] text-purple-400">auto_awesome</span>
          <span className={clsx('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-500')}>
            {name}
          </span>
        </div>

        {/* Big Three Stack */}
        <div className="flex gap-3 mb-2">
          <div className="flex items-center gap-1">
            <span className="text-lg">{getZodiacSymbol(sunSign)}</span>
            <span className={clsx('text-xs font-medium', isDark ? 'text-gray-300' : 'text-gray-600')}>
              Sun
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg">{getZodiacSymbol(moonSign)}</span>
            <span className={clsx('text-xs font-medium', isDark ? 'text-gray-300' : 'text-gray-600')}>
              Moon
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg">{getZodiacSymbol(risingSign)}</span>
            <span className={clsx('text-xs font-medium', isDark ? 'text-gray-300' : 'text-gray-600')}>
              Rising
            </span>
          </div>
        </div>

        {/* Insight Quote */}
        {insightQuote ? (
          <p
            className={clsx(
              'text-sm italic text-purple-400 truncate',
              isDark ? 'text-purple-300' : 'text-purple-600',
            )}
          >
            "{insightQuote}"
          </p>
        ) : (
          <p className={clsx('text-sm italic text-gray-500')}>
            Today's cosmic energy supports your {sunSign} nature
          </p>
        )}
      </div>

      {/* Right: Mini Wheel */}
      <div className="flex-shrink-0 w-20 h-20">
        {chartWheelSvg ? (
          <div className="w-full h-full flex items-center justify-center">{chartWheelSvg}</div>
        ) : (
          <div
            className={clsx(
              'w-full h-full rounded-full border-2 flex items-center justify-center',
              isDark ? 'border-purple-500/30 bg-purple-500/5' : 'border-purple-400 bg-purple-100',
            )}
          >
            <span className={clsx('text-xl', isDark ? 'text-purple-400/40' : 'text-purple-400')}>
              &#9788;
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={clsx('absolute bottom-2 right-4 text-[9px]', isDark ? 'text-gray-600' : 'text-gray-400')}
      >
        astroverse.app
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ShareableChartCard: React.FC<ShareableChartCardProps> = ({
  template = 'instagram-story',
  variant = 'dark',
  className = '',
  ...props
}) => {
  const containerStyle = {
    aspectRatio: CARD_SIZES[template].aspectRatio,
  };

  return (
    <div
      className={className}
      style={containerStyle}
      data-testid={`shareable-chart-${template}`}
    >
      {template === 'instagram-story' && <InstagramStoryLayout {...props} variant={variant} />}
      {template === 'twitter' && <TwitterLayout {...props} variant={variant} />}
      {template === 'pinterest' && <PinterestLayout {...props} variant={variant} />}
      {template === 'square' && <SquareLayout {...props} variant={variant} />}
      {template === 'daily-insight' && <DailyInsightLayout {...props} variant={variant} />}
    </div>
  );
};

export default ShareableChartCard;
export { CARD_SIZES, ZodiacBadge, ElementBalance, AdditionalPlacements, InsightQuote };
