/**
 * ShareableChartCard Component
 *
 * Renders visually stunning social media share cards for natal charts.
 * Supports multiple size variants (Instagram Story, Twitter, Pinterest, Square)
 * and dark/light themes. Uses forwardRef for html2canvas capture.
 *
 * Features:
 * - Cosmic gradient backgrounds with decorative star dots
 * - Element-colored Big Three zodiac badges
 * - Responsive aspect ratio layouts per platform
 * - Branding footer with tagline
 * - Preview grid component for size selection
 */

import React, { useMemo } from 'react';
import { clsx } from 'clsx';
import { Sparkles } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CardSize = 'instagram-story' | 'twitter' | 'pinterest' | 'square' | 'compact-card';

export interface ShareableChartCardProps {
  /** Person's name */
  name: string;
  /** Sun sign name (e.g., "Leo") */
  sunSign: string;
  /** Moon sign name */
  moonSign: string;
  /** Rising sign name */
  risingSign: string;
  /** Birth date formatted string */
  birthDate?: string;
  /** Card size variant */
  size?: CardSize;
  /** Optional chart wheel SVG to render */
  chartWheelSvg?: React.ReactNode;
  /** Variant theme */
  variant?: 'dark' | 'light';
  /** Additional className */
  className?: string;
}

export interface ShareableChartCardRef extends HTMLDivElement {}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CARD_SIZES: Record<CardSize, { width: number; height: number; aspectRatio: string; label: string }> = {
  'instagram-story': { width: 1080, height: 1920, aspectRatio: '9/16', label: 'Big 3 Reveal' },
  twitter:           { width: 1200, height: 675, aspectRatio: '16/9', label: 'Cosmic Identity' },
  pinterest:         { width: 1000, height: 1500, aspectRatio: '2/3',  label: 'Birth Chart Deep Dive' },
  square:            { width: 1080, height: 1080, aspectRatio: '1/1',  label: 'Elemental Identity' },
  'compact-card':    { width: 800, height: 418, aspectRatio: '2/1', label: 'Daily Insight' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ZODIAC_SYMBOLS: Record<string, string> = {
  aries:       '\u2648',  // ♈
  taurus:      '\u2649',  // ♉
  gemini:      '\u264A',  // ♊
  cancer:      '\u264B',  // ♋
  leo:         '\u264C',  // ♌
  virgo:       '\u264D',  // ♍
  libra:       '\u264E',  // ♎
  scorpio:     '\u264F',  // ♏
  sagittarius: '\u2650',  // ♐
  capricorn:   '\u2651',  // ♑
  aquarius:    '\u2652',  // ♒
  pisces:      '\u2653',  // ♓
};

export function getZodiacSymbol(sign: string): string {
  return ZODIAC_SYMBOLS[sign.toLowerCase()] ?? '?';
}

type ElementInfo = { element: string; colorClass: string; bgClass: string; borderClass: string };

const FIRE_SIGNS  = new Set(['aries', 'leo', 'sagittarius']);
const EARTH_SIGNS = new Set(['taurus', 'virgo', 'capricorn']);
const AIR_SIGNS   = new Set(['gemini', 'libra', 'aquarius']);
const WATER_SIGNS = new Set(['cancer', 'scorpio', 'pisces']);

export function getElementForSign(sign: string): ElementInfo {
  const key = sign.toLowerCase();

  if (FIRE_SIGNS.has(key)) {
    return {
      element: 'Fire',
      colorClass: 'text-orange-400',
      bgClass: 'bg-orange-400/15',
      borderClass: 'border-orange-400/30',
    };
  }
  if (EARTH_SIGNS.has(key)) {
    return {
      element: 'Earth',
      colorClass: 'text-green-400',
      bgClass: 'bg-green-400/15',
      borderClass: 'border-green-400/30',
    };
  }
  if (AIR_SIGNS.has(key)) {
    return {
      element: 'Air',
      colorClass: 'text-blue-400',
      bgClass: 'bg-blue-400/15',
      borderClass: 'border-blue-400/30',
    };
  }
  if (WATER_SIGNS.has(key)) {
    return {
      element: 'Water',
      colorClass: 'text-indigo-400',
      bgClass: 'bg-indigo-400/15',
      borderClass: 'border-indigo-400/30',
    };
  }

  // Fallback
  return {
    element: 'Unknown',
    colorClass: 'text-slate-400',
    bgClass: 'bg-slate-400/15',
    borderClass: 'border-slate-400/30',
  };
}

// ---------------------------------------------------------------------------
// Decorative star dots (deterministic via seed)
// ---------------------------------------------------------------------------

interface StarDot {
  id: number;
  left: string;
  top: string;
  size: number;
  opacity: number;
}

function generateStars(count: number, seed: number): StarDot[] {
  const stars: StarDot[] = [];
  // Simple deterministic pseudo-random based on seed
  let s = seed;
  const rand = () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };

  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      left: `${rand() * 100}%`,
      top: `${rand() * 100}%`,
      size: rand() < 0.15 ? 3 : rand() < 0.4 ? 2 : 1,
      opacity: 0.08 + rand() * 0.18,
    });
  }
  return stars;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** A single Big Three badge with element-colored styling */
function ZodiacBadge({
  sign,
  label,
  large = false,
}: {
  sign: string;
  label: string;
  large?: boolean;
}) {
  const symbol = getZodiacSymbol(sign);
  const { colorClass, bgClass, borderClass } = getElementForSign(sign);

  return (
    <div
      className={clsx(
        'flex flex-col items-center rounded-xl border',
        large ? 'px-4 py-3' : 'px-3 py-2',
        bgClass,
        borderClass,
      )}
    >
      <span className={clsx(large ? 'text-2xl' : 'text-lg', colorClass)}>{symbol}</span>
      <span
        className={clsx(
          large ? 'text-sm mt-1' : 'text-xs mt-0.5',
          'font-semibold text-white leading-tight',
        )}
      >
        {sign.length > 6 ? sign.slice(0, 5) + '.' : sign}
      </span>
      <span
        className={clsx(
          'text-[10px] uppercase font-bold tracking-wider mt-0.5',
          large ? 'text-slate-400' : 'text-slate-500',
        )}
      >
        {label}
      </span>
    </div>
  );
}

/** Decorative divider with a diamond/star in the center */
function DecorativeDivider() {
  return (
    <div className="flex items-center gap-3 px-6">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <span className="text-primary text-xs">&#10022;</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

/** Branding footer */
function BrandFooter({ variant }: { variant: 'dark' | 'light' }) {
  const isDark = variant === 'dark';
  return (
    <div className="text-center">
      <p className={clsx('text-sm font-semibold', isDark ? 'text-primary' : 'text-violet-600')}>
        <Sparkles className="w-4 h-4" />
        AstroVerse
      </p>
      <p className={clsx('text-[10px] mt-0.5', isDark ? 'text-slate-500' : 'text-slate-400')}>
        Discover Your Cosmic Blueprint
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layout variants
// ---------------------------------------------------------------------------

/** Portrait layout (instagram-story, pinterest, square) */
function PortraitLayout({
  name,
  sunSign,
  moonSign,
  risingSign,
  birthDate,
  chartWheelSvg,
  variant = 'dark',
}: Omit<ShareableChartCardProps, 'size' | 'className'>) {
  const isDark = variant === 'dark';
  return (
    <div className="flex flex-col items-center justify-between h-full w-full px-5 py-6 text-center">
      {/* Chart Wheel */}
      <div className="flex-shrink-0 w-1/2 max-w-[220px] aspect-square relative">
        {chartWheelSvg ? (
          <div className="w-full h-full flex items-center justify-center">
            {chartWheelSvg}
          </div>
        ) : (
          <div
            className={clsx(
              'w-full h-full rounded-full border flex items-center justify-center',
              isDark ? 'border-white/10 bg-white/5' : 'border-violet-200 bg-violet-50',
            )}
          >
            <span
              className={clsx(
                'text-4xl',
                isDark ? 'text-primary/60' : 'text-violet-300',
              )}
            >
              &#9788;
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <h2
        className={clsx(
          'text-2xl font-bold mt-4',
          isDark ? 'text-white' : 'text-slate-900',
        )}
      >
        {name.toUpperCase()}
      </h2>

      {/* Big Three badges */}
      <div className="flex items-center gap-3 mt-4">
        <ZodiacBadge sign={sunSign} label="Sun" large />
        <ZodiacBadge sign={moonSign} label="Moon" large />
        <ZodiacBadge sign={risingSign} label="Asc" large />
      </div>

      {/* Birth date */}
      {birthDate && (
        <p className={clsx('text-sm mt-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
          {birthDate}
        </p>
      )}

      {/* Divider */}
      <div className="mt-4 w-full">
        <DecorativeDivider />
      </div>

      {/* Brand */}
      <div className="mt-3">
        <BrandFooter variant={variant} />
      </div>
    </div>
  );
}

/** Landscape layout (twitter) */
function LandscapeLayout({
  name,
  sunSign,
  moonSign,
  risingSign,
  birthDate,
  chartWheelSvg,
  variant = 'dark',
}: Omit<ShareableChartCardProps, 'size' | 'className'>) {
  const isDark = variant === 'dark';

  const sunSymbol   = getZodiacSymbol(sunSign);
  const moonSymbol  = getZodiacSymbol(moonSign);
  const risingSymbol = getZodiacSymbol(risingSign);

  const sunEl   = getElementForSign(sunSign);
  const moonEl  = getElementForSign(moonSign);
  const risingEl = getElementForSign(risingSign);

  return (
    <div className="flex items-center h-full w-full px-6 py-4 gap-5">
      {/* Chart Wheel (left) */}
      <div className="flex-shrink-0 w-[120px] h-[120px] relative">
        {chartWheelSvg ? (
          <div className="w-full h-full flex items-center justify-center">
            {chartWheelSvg}
          </div>
        ) : (
          <div
            className={clsx(
              'w-full h-full rounded-full border flex items-center justify-center',
              isDark ? 'border-white/10 bg-white/5' : 'border-violet-200 bg-violet-50',
            )}
          >
            <span className={clsx('text-3xl', isDark ? 'text-primary/60' : 'text-violet-300')}>
              &#9788;
            </span>
          </div>
        )}
      </div>

      {/* Info (right) */}
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <h2
          className={clsx(
            'text-xl font-bold truncate',
            isDark ? 'text-white' : 'text-slate-900',
          )}
        >
          {name.toUpperCase()}
        </h2>

        {birthDate && (
          <p className={clsx('text-xs mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
            {birthDate}
          </p>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
          {/* Sun */}
          <span className={clsx('text-sm', sunEl.colorClass)}>
            {sunSymbol} Sun in {sunSign}
          </span>
          <span className={clsx('text-sm', moonEl.colorClass)}>
            {moonSymbol} Moon in {moonSign}
          </span>
        </div>
        <div className="mt-1">
          <span className={clsx('text-sm', risingEl.colorClass)}>
            {risingSymbol} {risingSign} Rising
          </span>
        </div>
      </div>

      {/* Branding bottom-right */}
      <div className="absolute bottom-3 right-5">
        <p className={clsx('text-[10px]', isDark ? 'text-slate-500' : 'text-slate-400')}>
          <Sparkles className="w-2.5 h-2.5" />
          AstroVerse &mdash; Discover Your Blueprint
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const ShareableChartCard = React.forwardRef<ShareableChartCardRef, ShareableChartCardProps>(
  function ShareableChartCard(
    {
      name,
      sunSign,
      moonSign,
      risingSign,
      birthDate,
      size = 'instagram-story',
      chartWheelSvg,
      variant = 'dark',
      className,
    },
    ref,
  ) {
    const isDark = variant === 'dark';
    const isLandscape = size === 'twitter';
    const { aspectRatio } = CARD_SIZES[size];

    // Generate star decorations (stable per name)
    const stars = useMemo(() => {
      let seed = 42;
      for (let i = 0; i < name.length; i++) {
        seed = ((seed << 5) - seed + name.charCodeAt(i)) | 0;
      }
      return generateStars(isLandscape ? 18 : 30, Math.abs(seed));
    }, [name, isLandscape]);

    return (
      <div
        ref={ref}
        className={clsx(
          'relative overflow-hidden rounded-2xl select-none',
          isDark
            ? 'bg-gradient-to-br from-[#0B0D17] via-[#111127] to-[#1a1040]'
            : 'bg-gradient-to-br from-violet-50 via-white to-indigo-50',
          className,
        )}
        style={{ aspectRatio }}
      >
        {/* Decorative stars */}
        {isDark &&
          stars.map((star) => (
            <span
              key={star.id}
              className="absolute rounded-full bg-white pointer-events-none"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
              }}
            />
          ))}

        {/* Ambient glow (dark only) */}
        {isDark && (
          <div
            className="absolute pointer-events-none"
            style={{
              width: '60%',
              height: '60%',
              top: '10%',
              left: '20%',
              background: 'radial-gradient(circle, rgba(107,61,225,0.12) 0%, transparent 70%)',
            }}
          />
        )}

        {/* Content */}
        {isLandscape ? (
          <LandscapeLayout
            name={name}
            sunSign={sunSign}
            moonSign={moonSign}
            risingSign={risingSign}
            birthDate={birthDate}
            chartWheelSvg={chartWheelSvg}
            variant={variant}
          />
        ) : (
          <PortraitLayout
            name={name}
            sunSign={sunSign}
            moonSign={moonSign}
            risingSign={risingSign}
            birthDate={birthDate}
            chartWheelSvg={chartWheelSvg}
            variant={variant}
          />
        )}
      </div>
    );
  },
);

ShareableChartCard.displayName = 'ShareableChartCard';

export default ShareableChartCard;

// ---------------------------------------------------------------------------
// Preview grid component
// ---------------------------------------------------------------------------

export interface ShareableChartCardPreviewProps {
  /** Props to pass to every card preview */
  cardProps: Omit<ShareableChartCardProps, 'size' | 'className'>;
  /** Currently selected size */
  selectedSize?: CardSize;
  /** Callback when a size is selected */
  onSelectSize?: (size: CardSize) => void;
  /** Additional className */
  className?: string;
}

const SIZE_ORDER: CardSize[] = ['instagram-story', 'twitter', 'pinterest', 'square', 'compact-card'];

export const ShareableChartCardPreview: React.FC<ShareableChartCardPreviewProps> = ({
  cardProps,
  selectedSize,
  onSelectSize,
  className,
}) => {
  return (
    <div className={clsx('grid grid-cols-2 gap-6', className)}>
      {SIZE_ORDER.map((size) => {
        const meta = CARD_SIZES[size];
        const isSelected = selectedSize === size;

        return (
          <button
            key={size}
            type="button"
            onClick={() => onSelectSize?.(size)}
            className={clsx(
              'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              isSelected
                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-600',
            )}
            aria-pressed={isSelected}
            aria-label={`${meta.label} (${meta.width}x${meta.height})`}
          >
            {/* Miniature card preview */}
            <div
              className="w-full flex justify-center"
              style={{ maxHeight: '260px' }}
            >
              <ShareableChartCard
                {...cardProps}
                size={size}
                className="w-full max-w-[280px]"
              />
            </div>

            {/* Label */}
            <span className="text-xs text-slate-400 font-medium">{meta.label}</span>
            <span className="text-[10px] text-slate-600">
              {meta.width} &times; {meta.height}
            </span>
          </button>
        );
      })}
    </div>
  );
};

ShareableChartCardPreview.displayName = 'ShareableChartCardPreview';
