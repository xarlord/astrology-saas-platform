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

interface LinkedInCardProps {
  chartData: ChartData;
  insightQuote: string;
  className?: string;
}

/**
 * LinkedIn Template - "Professional Profile"
 * Format: 1200 x 627px (1.91:1)
 * Use case: Professional sharing, career insights
 */
export const LinkedInCard: React.FC<LinkedInCardProps> = ({
  chartData,
  insightQuote,
  className,
}) => {
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

  return (
    <div className={clsx('relative w-[1200px] h-[627px] flex items-center px-6', className)}>
      {/* Background with diagonal gradient */}
      <div className="absolute inset-0 bg-[rgb(11,13,23)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(107,61,225,0.05)] to-[rgba(37,99,235,0.03)]" />
      </div>

      {/* Main Card Content */}
      <div className="relative flex flex-row items-center justify-between w-full z-10">
        {/* Left Side: Logo + Chart Wheel */}
        <div className="flex flex-row items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span> AstroVerse
          </div>

          {/* Chart Wheel */}
          <div className="relative w-[14rem] h-[14rem] flex-shrink-0">
            {/* Medium chart wheel */}
            <div className="w-full h-full rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
              <span className="text-2xl text-primary/60">&#9788;</span>
            </div>
          </div>

          {/* Sun Sign Hero */}
          {sun && (
            <div className="flex flex-col items-center space-y-2">
              <div
                className="w-10 h-10 flex items-center justify-center rounded-full"
                style={{ backgroundColor: `${PLANET_COLORS.sun}33`, color: PLANET_COLORS.sun }}
              >
                {getZodiacSymbol(sun.sign)}
              </div>
              <div className="text-center">
                <div className="font-bold text-[24px] text-white">{sun.sign}</div>
                <div className="text-[14px] text-slate-400">Sun Sign</div>
              </div>
            </div>
          )}
        </div>

        {/* Center: Moon + Rising + Element Balance */}
        <div className="flex flex-col items-center gap-4">
          {/* Moon & Rising */}
          <div className="flex space-x-6">
            {[moon, rising]
              .map((planet, index) => {
                if (!planet) return null;
                const planetColor = PLANET_COLORS[planet.name.toLowerCase()] || '#ffffff';
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-6 h-6 flex items-center justify-center rounded-full"
                      style={{ backgroundColor: `${planetColor}33`, color: planetColor }}
                    >
                      {getZodiacSymbol(planet.sign)}
                    </div>
                    <div className="text-center text-[14px] text-white">{planet.sign}</div>
                  </div>
                );
              })
              .filter(Boolean)}
          </div>

          {/* Element Balance Bars */}
          {chartData.element && (
            <div className="flex w-[18rem] space-x-2">
              {['fire', 'earth', 'air', 'water'].map((element) => {
                const isPrimary = element === chartData.element;
                const _width = isPrimary ? '4rem' : '2rem';
                return (
                  <div key={element} className="flex-1">
                    <div
                      className={`h-[6px] rounded-full bg-${ELEMENT_COLORS[element]}/${isPrimary ? '80' : '20'}`}
                    />
                    <div className="text-[10px] text-center mt-1">
                      {isPrimary ? element.charAt(0).toUpperCase() + element.slice(1) : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Quote + Footer */}
        <div className="flex flex-col items-center">
          {/* Quote */}
          <p className="mt-4 text-[16px] italic text-amber-400 max-w-[80%] text-center leading-relaxed">
            {insightQuote}
          </p>

          {/* Footer URL */}
          <p className="mt-auto text-[12px] text-white/40">astroverse.app</p>
        </div>
      </div>
    </div>
  );
};

// Default export
export default LinkedInCard;
