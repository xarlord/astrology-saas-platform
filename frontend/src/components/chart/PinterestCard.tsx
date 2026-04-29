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

interface PinterestCardProps {
  chartData: ChartData;
  insightQuote: string;
  className?: string;
}

/**
 * Pinterest Template - "Birth Chart Deep Dive"
 * Format: 1000 x 1500px (2:3)
 * Use case: Detailed vertical share for Pinterest boards
 */
export const PinterestCard: React.FC<PinterestCardProps> = ({
  chartData,
  insightQuote: _insightQuote,
  className,
}) => {
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

  // Extract key planets for the Pinterest template
  const sun = getPlanetSign('Sun');
  const moon = getPlanetSign('Moon');
  const rising = getPlanetSign('Ascendant') ?? getPlanetSign('Rising');
  const mercury = getPlanetSign('Mercury');
  const venus = getPlanetSign('Venus');
  const mars = getPlanetSign('Mars');
  const jupiter = getPlanetSign('Jupiter');
  const saturn = getPlanetSign('Saturn');

  return (
    <div
      className={clsx(
        'relative w-[1000px] h-[1500px] flex flex-col items-center justify-center px-6',
        className,
      )}
    >
      {/* Background with top-corner radial glow */}
      <div className="absolute inset-0 bg-[rgb(11,13,23)]">
        {/* Top-left radial glow */}
        <div className="absolute top-[-200px] left-[-200px] w-[400px] h-[400px] rounded-full bg-[rgba(107,61,225,0.1)]" />
      </div>

      {/* Main Card Content */}
      <div className="relative flex flex-col items-center gap-8 w-full max-w-[24rem] z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span> AstroVerse
          </div>
          <p className="text-[24px] font-bold text-white">Your Birth Chart</p>
        </div>

        {/* Chart Wheel */}
        <div className="relative w-[20rem] h-[20rem]">
          {/* Detailed chart wheel */}
          <div className="w-full h-full rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
            <span className="text-2xl text-primary/60">&#9788;</span>
          </div>
        </div>

        {/* Big 3 Section */}
        <div className="flex items-center gap-6 text-center">
          {[sun, moon, rising]
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
                  <div className="text-center">
                    <div className="font-medium text-[18px] text-white">{planet.sign}</div>
                    <div className="text-[12px] text-slate-400">
                      {getZodiacSymbol(planet.sign)} {planet.degree}°
                    </div>
                  </div>
                </div>
              );
            })
            .filter(Boolean)}
        </div>

        {/* Keywords for each planet */}
        <div className="space-y-4 text-center">
          {[sun, moon, rising]
            .map((planet, index) => {
              if (!planet) return null;
              // Simple keyword mapping based on planet
              const keywords: Record<string, string> = {
                sun: 'Creative, bold, warm',
                moon: 'Intuitive, dreamy',
                rising: 'Intense, magnetic',
              };
              const planetName = ['sun', 'moon', 'rising'][index];
              return (
                <p key={index} className="text-[14px] text-slate-400 max-w-[80%]">
                  {keywords[planetName]}
                </p>
              );
            })
            .filter(Boolean)}
        </div>

        {/* Additional Placements Grid */}
        <div className="w-[24rem] grid grid-cols-2 gap-4 mt-6">
          {[mercury, venus, mars, jupiter, saturn]
            .map((planet, index) => {
              if (!planet) return null;
              const planetColor = PLANET_COLORS[planet.name.toLowerCase()] || '#ffffff';
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                >
                  <div
                    className="w-5 h-5 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: `${planetColor}33`, color: planetColor }}
                  >
                    {getZodiacSymbol(planet.sign)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-white">{planet.name}</div>
                    <div className="text-sm text-slate-400">
                      {getZodiacSymbol(planet.sign)} {planet.sign} {planet.degree}°
                    </div>
                  </div>
                </div>
              );
            })
            .filter(Boolean)}
        </div>

        {/* Footer */}
        <p className="mt-auto text-[14px] text-white/40">astroverse.app</p>
      </div>
    </div>
  );
};

// Default export
export default PinterestCard;
