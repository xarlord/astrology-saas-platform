/**
 * PlanetaryPositionCard — modern interactive card for a planet in the natal chart.
 * Shows planet symbol, sign, degree, house, element, and hover details.
 */

import type { PlanetPosition } from '../types/chart.types';
import { PLANET_COLORS, ZODIAC_COLORS } from '../utils/design-tokens';

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  north_node: '☊', south_node: '☋', chiron: '⚷', lilith: '⚒',
};

const PLANET_NAMES: Record<string, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
  north_node: 'North Node', south_node: 'South Node', chiron: 'Chiron', lilith: 'Lilith',
};

const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍',
  libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

const ZODIAC_ELEMENTS: Record<string, { element: string; quality: string; color: string }> = {
  aries:       { element: 'Fire',  quality: 'Cardinal',   color: '#EF4444' },
  taurus:      { element: 'Earth', quality: 'Fixed',      color: '#22C55E' },
  gemini:      { element: 'Air',   quality: 'Mutable',    color: '#38BDF8' },
  cancer:      { element: 'Water', quality: 'Cardinal',   color: '#6366F1' },
  leo:         { element: 'Fire',  quality: 'Fixed',      color: '#EF4444' },
  virgo:       { element: 'Earth', quality: 'Mutable',    color: '#22C55E' },
  libra:       { element: 'Air',   quality: 'Cardinal',   color: '#38BDF8' },
  scorpio:     { element: 'Water', quality: 'Fixed',      color: '#6366F1' },
  sagittarius: { element: 'Fire',  quality: 'Mutable',    color: '#EF4444' },
  capricorn:   { element: 'Earth', quality: 'Cardinal',   color: '#22C55E' },
  aquarius:    { element: 'Air',   quality: 'Fixed',      color: '#38BDF8' },
  pisces:      { element: 'Water', quality: 'Mutable',    color: '#6366F1' },
};

const ELEMENT_BG: Record<string, string> = {
  Fire: 'rgba(239, 68, 68, 0.10)',
  Earth: 'rgba(34, 197, 94, 0.10)',
  Air: 'rgba(56, 189, 248, 0.10)',
  Water: 'rgba(99, 102, 241, 0.10)',
};

interface PlanetaryPositionCardProps {
  planet: PlanetPosition;
}

export function PlanetaryPositionCard({ planet }: PlanetaryPositionCardProps) {
  const key = planet.planet.toLowerCase();
  const symbol = PLANET_SYMBOLS[key] ?? '●';
  const name = PLANET_NAMES[key] ?? planet.planet;
  const planetColor = (PLANET_COLORS as Record<string, string>)[name] ?? '#A0AEC0';

  const signKey = planet.sign.toLowerCase();
  const signSymbol = ZODIAC_SYMBOLS[signKey] ?? '?';
  const signColor = (ZODIAC_COLORS as Record<string, string>)[name] ?? '#6366F1';
  const signMeta = ZODIAC_ELEMENTS[signKey];
  const element = signMeta?.element ?? '';
  const quality = signMeta?.quality ?? '';
  const elementColor = signMeta?.color ?? '#888';
  const elementBg = ELEMENT_BG[element] ?? 'rgba(255,255,255,0.04)';

  const degreeStr = `${planet.degree}°${String(planet.minute).padStart(2, '0')}'`;

  return (
    <div className="group relative">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl
                   bg-white/[0.03] border border-white/[0.06]
                   hover:bg-white/[0.07] hover:border-white/[0.12]
                   transition-all duration-200 cursor-default"
      >
        {/* Planet icon circle */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
          style={{
            backgroundColor: `${planetColor}18`,
            color: planetColor,
            border: `1.5px solid ${planetColor}44`,
          }}
        >
          {symbol}
        </div>

        {/* Planet info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">{name}</span>
            {planet.retrograde && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full
                           bg-red-500/15 text-red-400 border border-red-500/20"
              >
                ℞ RETRO
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {/* Sign badge */}
            <span
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${elementColor}15`,
                color: elementColor,
                border: `1px solid ${elementColor}22`,
              }}
            >
              <span className="text-sm">{signSymbol}</span>
              {planet.sign}
            </span>
            {/* Degree */}
            <span className="text-xs text-slate-400 font-mono">{degreeStr}</span>
          </div>
        </div>

        {/* House badge */}
        <div className="flex-shrink-0 text-right">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">House</div>
          <div className="text-lg font-bold text-white/60">{planet.house}</div>
        </div>
      </div>

      {/* Hover tooltip — detailed reference */}
      <div
        className="pointer-events-none absolute z-50 left-1/2 -translate-x-1/2
                   bottom-full mb-2 w-64 p-4 rounded-xl
                   bg-[#151823] border border-white/10 shadow-2xl shadow-black/60
                   opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                   transition-all duration-200"
        role="tooltip"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl" style={{ color: planetColor }}>{symbol}</span>
          <div>
            <div className="font-bold text-white">{name}</div>
            <div className="text-xs text-slate-400">{element} · {quality}</div>
          </div>
        </div>
        <div className="text-xs text-slate-300 leading-relaxed space-y-1">
          <div>
            <span className="text-slate-500">Position:</span>{' '}
            {signSymbol} {planet.sign} {degreeStr}
          </div>
          <div>
            <span className="text-slate-500">Longitude:</span>{' '}
            {planet.longitude?.toFixed(2) ?? '—'}°
          </div>
          <div>
            <span className="text-slate-500">House:</span> {planet.house}
          </div>
          {planet.latitude != null && (
            <div>
              <span className="text-slate-500">Latitude:</span> {planet.latitude.toFixed(2)}°
            </div>
          )}
          {planet.speed != null && (
            <div>
              <span className="text-slate-500">Speed:</span> {planet.speed.toFixed(2)}°/day
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * HouseCuspCard — compact modern card for a house cusp.
 */
interface HouseCuspCardProps {
  house: {
    house: number;
    sign: string;
    degree: number;
    minute: number;
    second?: number;
  };
  isAngular?: boolean;
}

export function HouseCuspCard({ house, isAngular = false }: HouseCuspCardProps) {
  const signKey = house.sign.toLowerCase();
  const signSymbol = ZODIAC_SYMBOLS[signKey] ?? '?';
  const signMeta = ZODIAC_ELEMENTS[signKey];
  const elementColor = signMeta?.color ?? '#888';
  const element = signMeta?.element ?? '';

  const degreeStr = `${house.degree}°${String(house.minute).padStart(2, '0')}'`;

  const angularHouses = [1, 4, 7, 10];
  const isAngularHouse = isAngular || angularHouses.includes(house.house);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                  ${isAngularHouse
                    ? 'bg-white/[0.06] border border-white/[0.10]'
                    : 'bg-white/[0.02] border border-transparent'}
                  transition-all duration-150`}
    >
      {/* House number */}
      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold
                        ${isAngularHouse ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-500'}`}>
        {house.house}
      </span>

      {/* Sign */}
      <span
        className="inline-flex items-center gap-1 text-xs font-medium"
        style={{ color: elementColor }}
      >
        <span className="text-base">{signSymbol}</span>
        <span className="capitalize">{house.sign}</span>
      </span>

      {/* Degree */}
      <span className="ml-auto text-xs text-slate-500 font-mono">{degreeStr}</span>

      {/* Element dot */}
      {element && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: elementColor }}
          title={element}
        />
      )}
    </div>
  );
}
