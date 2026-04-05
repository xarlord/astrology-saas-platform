import React from 'react';
import { clsx } from 'clsx';
// Types
interface ChartPosition {
  name: string;
  sign: string;
  degree: number;
  retrograde?: boolean;
}

interface ChartData {
  name: string;
  positions: ChartPosition[];
  birthData?: {
    birthDate: string;
    birthPlace: string;
  };
  element?: string; // fire, earth, air, water
}

interface TikTokCardProps {
  chartData: ChartData;
  insightQuote: string;
  className?: string;
}

/**
 * TikTok Template - "Trending Transit"
 * Format: 1080 x 1920px (9:16)
 * Use case: Trending content - current planetary highlights
 */
export const TikTokCard: React.FC<TikTokCardProps> = ({ chartData, insightQuote, className }) => {
  // Extract planetary data
  const getPlanetSign = (planetName: string): ChartPosition | undefined => {
    return chartData.positions?.find((p) => p.name.toLowerCase() === planetName.toLowerCase());
  };

  // Get zodiac symbol
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

  const getZodiacSymbol = (sign: string): string => {
    return ZODIAC_SYMBOLS[sign.toLowerCase()] || '?';
  };

  // Planet colors
  const PLANET_COLORS: Record<string, string> = {
    sun: '#FFD700',
    moon: '#C0C0C0',
    mercury: '#95B9C7',
    venus: '#FF69B4',
    mars: '#EF4444',
    jupiter: '#FFA500',
    saturn: '#696969',
    uranus: '#4CC9F0',
    neptune: '#4361EE',
    pluto: '#7209B7',
  };

  // Element colors
  const ELEMENT_COLORS: Record<string, string> = {
    fire: '#EF4444',
    earth: '#10B981',
    air: '#3B82F6',
    water: '#6366F1',
  };

  // Get element color for a sign
  const _getElementColor = (sign: string): string => {
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    const waterSigns = ['cancer', 'scorpio', 'pisces'];

    const lowerSign = sign.toLowerCase();
    if (fireSigns.includes(lowerSign)) return ELEMENT_COLORS.fire;
    if (earthSigns.includes(lowerSign)) return ELEMENT_COLORS.earth;
    if (airSigns.includes(lowerSign)) return ELEMENT_COLORS.air;
    if (waterSigns.includes(lowerSign)) return ELEMENT_COLORS.water;
    return '#ffffff'; // fallback
  };

  // Current transit focus (using faster moving planets for trending content)
  const mercury = getPlanetSign('Mercury');
  const venus = getPlanetSign('Venus');
  const mars = getPlanetSign('Mars');
  const jupiter = getPlanetSign('Jupiter');
  const saturn = getPlanetSign('Saturn');

  return (
    <div
      className={clsx(
        'relative w-[1080px] h-[1920px] flex flex-col items-center justify-center px-4 py-6',
        className,
      )}
    >
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-[rgb(11,13,23)]">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(107,61,225,0.1)] via-[rgba(37,99,235,0.1)] to-[rgba(245,166,35,0.1)]" />
      </div>

      {/* Main Card Content */}
      <div className="relative flex flex-col items-center gap-6 w-full max-w-[20rem] z-10">
        {/* Logo - positioned for TikTok safe zone */}
        <div className="absolute top-[80px] left-1/2 -translate-x-1/2 text-xs">
          <span className="material-symbols-outlined text-[12px]">auto_awesome</span> AstroVerse
        </div>

        {/* Title - Trending Transit focus */}
        <p className="absolute top-[120px] left-1/2 -translate-x-1/2 text-center text-[20px] font-display text-primary">
          Trending Transit
        </p>

        {/* Current Planetary Highlights */}
        <div className="mt-[200px] space-y-4 w-[18rem]">
          {/* Mercury - Communication */}
          {mercury && (
            <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{
                  backgroundColor: `${PLANET_COLORS.mercury}33`,
                  color: PLANET_COLORS.mercury,
                }}
              >
                ☿
              </div>
              <div className="flex-1 space-y-1">
                <div className="font-medium text-white">Mercury</div>
                <div className="text-sm text-slate-400">
                  {getZodiacSymbol(mercury.sign)} {mercury.sign} {mercury.degree}°
                </div>
              </div>
            </div>
          )}

          {/* Venus - Love & Relationships */}
          {venus && (
            <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ backgroundColor: `${PLANET_COLORS.venus}33`, color: PLANET_COLORS.venus }}
              >
                ♀️
              </div>
              <div className="flex-1 space-y-1">
                <div className="font-medium text-white">Venus</div>
                <div className="text-sm text-slate-400">
                  {getZodiacSymbol(venus.sign)} {venus.sign} {venus.degree}°
                </div>
              </div>
            </div>
          )}

          {/* Mars - Energy & Action */}
          {mars && (
            <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ backgroundColor: `${PLANET_COLORS.mars}33`, color: PLANET_COLORS.mars }}
              >
                ♂️
              </div>
              <div className="flex-1 space-y-1">
                <div className="font-medium text-white">Mars</div>
                <div className="text-sm text-slate-400">
                  {getZodiacSymbol(mars.sign)} {mars.sign} {mars.degree}°
                </div>
              </div>
            </div>
          )}

          {/* Jupiter - Luck & Expansion */}
          {jupiter && (
            <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{
                  backgroundColor: `${PLANET_COLORS.jupiter}33`,
                  color: PLANET_COLORS.jupiter,
                }}
              >
                ♃
              </div>
              <div className="flex-1 space-y-1">
                <div className="font-medium text-white">Jupiter</div>
                <div className="text-sm text-slate-400">
                  {getZodiacSymbol(jupiter.sign)} {jupiter.sign} {jupiter.degree}°
                </div>
              </div>
            </div>
          )}

          {/* Saturn - Discipline & Structure */}
          {saturn && (
            <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{
                  backgroundColor: `${PLANET_COLORS.saturn}33`,
                  color: PLANET_COLORS.saturn,
                }}
              >
                ♄
              </div>
              <div className="flex-1 space-y-1">
                <div className="font-medium text-white">Saturn</div>
                <div className="text-sm text-slate-400">
                  {getZodiacSymbol(saturn.sign)} {saturn.sign} {saturn.degree}°
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Insight Quote - Trending Interpretation */}
        <p className="mt-6 text-[18px] italic text-amber-400 max-w-[80%] text-center leading-relaxed">
          {insightQuote}
        </p>

        {/* Footer with engagement prompt */}
        <div className="mt-auto space-y-2">
          <p className="text-[14px] text-white/60">Follow for daily cosmic updates</p>
          <p className="text-[12px] text-white/40">astroverse.app</p>
        </div>
      </div>
    </div>
  );
};

// Default export
export default TikTokCard;
