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

interface TwitterCardProps {
  chartData: ChartData;
  insightQuote: string;
  className?: string;
}

/**
 * Twitter/X Card - "Cosmic Identity"
 * Format: 1200 x 675px (16:9)
 * Use case: Compact horizontal share for timeline scrolling
 */
export const TwitterCard: React.FC<TwitterCardProps> = ({ chartData, insightQuote, className }) => {
  // Extract Big 3 (Sun, Moon, Rising/Ascendant)
  const getPlanetSign = (planetName: string): ChartPosition | undefined => {
    return chartData.positions?.find((p) => p.name.toLowerCase() === planetName.toLowerCase());
  };

  const sun = getPlanetSign('Sun');
  const moon = getPlanetSign('Moon');
  const rising = getPlanetSign('Ascendant') ?? getPlanetSign('Rising');

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
    venus: '#FF69B4',
    mars: '#EF4444',
    jupiter: '#FFA500',
    saturn: '#696969',
  };

  // Element colors
  const ELEMENT_COLORS: Record<string, string> = {
    fire: '#EF4444',
    earth: '#10B981',
    air: '#3B82F6',
    water: '#6366F1',
  };

  // Get element color for a sign
  const getElementColor = (sign: string): string => {
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

  return (
    <div className={clsx('relative w-[1200px] h-[675px] flex items-center px-6', className)}>
      {/* Background with left-to-right gradient */}
      <div className="absolute inset-0 bg-[rgb(11,13,23)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[rgb(11,13,23)] to-[rgb(21,23,37)]" />
      </div>

      {/* Main Card Content */}
      <div className="relative flex flex-row items-center justify-between w-full z-10">
        {/* Left Side: Chart Wheel + Big 3 */}
        <div className="flex flex-row items-start gap-8">
          {/* Chart Wheel */}
          <div className="relative w-[16rem] h-[16rem] flex-shrink-0">
            {/* Compact chart wheel */}
            <div className="w-full h-full rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
              <span className="text-2xl text-primary/60">&#9788;</span>
            </div>
          </div>

          {/* Big 3 List */}
          <div className="space-y-3">
            {[sun, moon, rising]
              .map((planet, index) => {
                if (!planet) return null;
                const planetColor = PLANET_COLORS[planet.name.toLowerCase()] || '#ffffff';
                const elementColor = getElementColor(planet.sign);
                return (
                  <div key={index} className="flex items-center gap-3">
                    {/* Planet Symbol with Element Badge */}
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 flex items-center justify-center rounded-full"
                        style={{ backgroundColor: `${planetColor}33`, color: planetColor }}
                      >
                        {getZodiacSymbol(planet.sign)}
                      </div>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: elementColor }}
                      />
                    </div>
                    {/* Sign Info */}
                    <div className="text-left">
                      <div className="font-medium text-[28px] text-white">{planet.sign}</div>
                      <div className="flex items-center gap-1 text-[14px] text-slate-400">
                        {getZodiacSymbol(planet.sign)} {planet.degree}°
                      </div>
                    </div>
                  </div>
                );
              })
              .filter(Boolean)}
          </div>
        </div>

        {/* Right Side: Quote/Insight */}
        <div className="flex-1 text-center">
          {/* Quote/Insight */}
          <p className="mt-4 text-[16px] italic text-slate-400 max-w-[600px]">
            {insightQuote}
          </p>

          {/* Footer */}
          <div className="mt-auto flex justify-between items-center pt-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AstroVerse
            </div>
            {/* URL */}
            <p className="text-[12px] text-white/40">astroverse.app</p>
          </div>
        </div>
      </div>

      {/* Dividers */}
      <div className="absolute inset-0">
        {/* Vertical divider */}
        <div className="left-[80px] top-[264px] h-[160px] w-[1px] bg-white/8" />
        {/* Horizontal divider */}
        <div className="top-[256px] left-[80px] w-[320px] h-[1px] bg-white/8" />
      </div>
    </div>
  );
};

// Default export
export default TwitterCard;
