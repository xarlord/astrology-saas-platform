/**
 * ShareableChartCard Component
 *
 * Compact card layout for daily insight sharing (800x418).
 * Displays Big Three signs, chart wheel, and cosmic insight.
 */

import React from 'react';
import { clsx } from 'clsx';

// ============================================================================
// TYPES
// ============================================================================

export interface ShareableChartCardProps {
  /** Person's name */
  name: string;
  /** Sun sign */
  sunSign: string;
  /** Moon sign */
  moonSign: string;
  /** Rising/Ascendant sign */
  risingSign: string;
  /** Birth date string */
  birthDate?: string;
  /** Optional chart wheel SVG */
  chartWheelSvg?: React.ReactNode;
  /** Color variant */
  variant?: 'dark' | 'light';
  /** Card size */
  size?: 'compact' | 'full';
  /** Additional className */
  className?: string;
}

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

function getZodiacSymbol(sign: string): string {
  return ZODIAC_SYMBOLS[sign.toLowerCase()] ?? '⚪';
}

// ============================================================================
// COMPONENT
// ============================================================================

/** Compact Card - Daily Insight (800x418) */
function CompactCardLayout({
  name,
  sunSign,
  moonSign,
  risingSign,
  chartWheelSvg,
  variant = 'dark',
}: Omit<ShareableChartCardProps, 'size' | 'className'>) {
  const isDark = variant === 'dark';
  return (
    <div
      className="flex h-full w-full items-center justify-center px-4 py-6"
      data-testid="shareable-chart-compact-card"
    >
      {/* Main Card */}
      <div className="relative flex flex-col items-center gap-4 w-full max-w-[20rem]">
        {/* Logo */}
        <div className="absolute top-3 left-3 text-xs">
          <span className="material-symbols-outlined text-[12px]">auto_awesome</span> AstroVerse
        </div>

        {/* Chart Wheel */}
        <div className="w-[4.5rem] h-[4.5rem] mt-4">
          {chartWheelSvg ? (
            <div className="w-full h-full flex items-center justify-center">{chartWheelSvg}</div>
          ) : (
            <div
              className={clsx(
                'w-full h-full rounded-full border flex items-center justify-center',
                isDark ? 'border-white/10 bg-white/5' : 'border-violet-200 bg-violet-50',
              )}
            >
              <span className={clsx('text-2xl', isDark ? 'text-primary/60' : 'text-violet-300')}>
                &#9788;
              </span>
            </div>
          )}
        </div>

        {/* Big 3 Horizontal */}
        <div className="flex space-x-3">
          {[
            { sign: sunSign, symbol: getZodiacSymbol(sunSign) },
            { sign: moonSign, symbol: getZodiacSymbol(moonSign) },
            { sign: risingSign, symbol: getZodiacSymbol(risingSign) },
          ].map(({ sign, symbol }) => (
            <div key={sign} className="flex flex-col items-center">
              <div className="w-5 h-5 flex items-center justify-center text-lg">{symbol}</div>
              <div className="text-xs font-medium">{sign}</div>
            </div>
          ))}
        </div>

        {/* Name and Insight */}
        <div className="text-center space-y-1">
          <div className="font-bold text-white">{name}</div>
          <p className="text-[12px] italic text-slate-400">"Today's cosmic energy supports"</p>
          <p className="text-[12px] font-medium text-primary">{sunSign} energy</p>
        </div>

        {/* Footer */}
        <div className="mt-4 text-[10px] text-center text-slate-500">
          astroverse.app &bull; daily insight
        </div>
      </div>
    </div>
  );
}

const ShareableChartCard: React.FC<ShareableChartCardProps> = ({
  size = 'compact',
  className = '',
  ...props
}) => {
  if (size === 'compact') {
    return (
      <div className={className}>
        <CompactCardLayout {...props} />
      </div>
    );
  }

  // Full size fallback — same layout, wider container
  return (
    <div className={`max-w-2xl ${className}`}>
      <CompactCardLayout {...props} />
    </div>
  );
};

export default ShareableChartCard;
