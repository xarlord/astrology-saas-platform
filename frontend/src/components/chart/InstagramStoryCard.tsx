import React from 'react';
import { clsx } from 'clsx';
import { Sparkles } from 'lucide-react';

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

interface InstagramStoryCardProps {
  chartData: ChartData;
  insightQuote: string;
  className?: string;
}

/**
 * Instagram Story Template - "Big 3 Reveal"
 * Format: 1080 x 1920px (9:16)
 */
export const InstagramStoryCard: React.FC<InstagramStoryCardProps> = ({
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
    <div
      className={clsx(
        'relative w-[1080px] h-[1920px] flex flex-col items-center justify-center px-4 py-6',
        className,
      )}
    >
      {/* Background with gradient glow */}
      <div className="absolute inset-0 bg-[rgb(11,13,23)]">
        {/* Subtle radial gradient glow */}
        <div className="absolute inset-0 bg-gradient-radial from-[rgba(107,61,225,0.15)] to-transparent" />
      </div>

      {/* Main Card Content */}
      <div className="relative flex flex-col items-center gap-4 w-full max-w-[20rem] z-10">
        {/* Logo */}
        <div className="absolute top-[120px] left-1/2 -translate-x-1/2 text-xs">
          <Sparkles className="w-3 h-3" /> AstroVerse
        </div>

        {/* Tagline */}
        <p className="absolute top-[160px] left-1/2 -translate-x-1/2 text-center text-[14px] font-body text-primary-light">
          Written in the Stars
        </p>

        {/* Chart Wheel */}
        <div className="mt-[200px] w-[16rem] h-[16rem]">
          {/* Simplified chart wheel placeholder */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full h-full rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
              <span className="text-2xl text-primary/60">&#9788;</span>
            </div>
          </div>
        </div>

        {/* Big 3 Horizontal */}
        <div className="flex space-x-3">
          {[sun, moon, rising]
            .map((planet, index) => {
              if (!planet) return null;
              const planetColor = PLANET_COLORS[planet.name.toLowerCase()] || '#ffffff';
              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-5 h-5 flex items-center justify-center text-lg"
                    style={{ color: planetColor }}
                  >
                    {getZodiacSymbol(planet.sign)}
                  </div>
                  <div className="text-xs font-medium text-white">{planet.sign}</div>
                  <div className="w-px h-5 bg-primary/20" />
                </div>
              );
            })
            .filter(Boolean)}
        </div>

        {/* Big 3 Cards with Glass Effect */}
        <div className="flex space-x-3 mt-6">
          {[sun, moon, rising]
            .map((planet, index) => {
              if (!planet) return null;
              const planetColor = PLANET_COLORS[planet.name.toLowerCase()] || '#ffffff';
              const _elementColor = getElementColor(planet.sign);
              return (
                <div key={index} className="relative flex flex-col items-center">
                  {/* Glass Card Background */}
                  <div className="w-[10rem] h-[4rem] bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center gap-3 p-2">
                    {/* Planet Symbol */}
                    <div
                      className="w-6 h-6 flex items-center justify-center rounded-full"
                      style={{
                        backgroundColor: `${planetColor}33`,
                        color: planetColor,
                        fontSize: '1.25rem',
                      }}
                    >
                      {getZodiacSymbol(planet.sign)}
                    </div>
                    {/* Sign Info */}
                    <div className="flex flex-col items-start text-left">
                      <div className="font-medium text-white">{planet.sign}</div>
                      <div className="text-[12px] text-slate-400">{planet.degree}°</div>
                    </div>
                  </div>
                  {/* Optional degree indicator */}
                  {!index && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              );
            })
            .filter(Boolean)}
        </div>

        {/* Insight Quote */}
        <p className="mt-8 text-[16px] italic text-amber-400 max-w-[80%] text-center leading-relaxed">
          {insightQuote}
        </p>

        {/* Footer URL */}
        <p className="mt-auto text-[12px] text-white/40">astroverse.app</p>
      </div>
    </div>
  );
};

// Default export
export default InstagramStoryCard;
