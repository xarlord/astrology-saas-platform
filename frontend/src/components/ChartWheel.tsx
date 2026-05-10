// import React from 'react';
// import { PlanetSymbol, AspectSymbol } from './';

import type { PlanetPosition, HouseCusp, Aspect, ChartData } from '../types/chart.types';
import { PLANET_COLORS, ASPECT_COLORS as ASPECT_COLORS_TOKEN, ZODIAC_COLORS } from '../utils/design-tokens';
export type { PlanetPosition, HouseCusp, Aspect, ChartData } from '../types/chart.types';

function normalizePlanets(planets: ChartData['planets']): PlanetPosition[] {
  if (Array.isArray(planets)) return planets;
  return Object.entries(planets).map(([name, p]) => ({
    planet: name,
    sign: p.sign,
    degree: p.degree,
    minute: p.minute,
    second: p.second ?? 0,
    house: p.house,
    retrograde: p.isRetrograde ?? false,
    latitude: p.latitude,
    longitude: p.longitude,
    speed: p.speed,
  }));
}

interface ChartWheelProps {
  data: ChartData;
  size?: number;
  interactive?: boolean;
  onPlanetClick?: (planet: string) => void;
  onAspectClick?: (aspect: Aspect) => void;
}

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
};

const PLANET_NAMES: Record<string, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
};

const PLANET_INFO: Record<string, { symbol: string; color: string; name: string }> = {};
for (const key of Object.keys(PLANET_SYMBOLS)) {
  const k = key.charAt(0).toUpperCase() + key.slice(1);
  PLANET_INFO[key] = {
    symbol: PLANET_SYMBOLS[key],
    color: PLANET_COLORS[k as keyof typeof PLANET_COLORS] ?? '#888888',
    name: PLANET_NAMES[key],
  };
}

const ASPECT_COLORS: Record<string, string> = {
  ...ASPECT_COLORS_TOKEN,
  'semi-sextile': '#888888',
  square: '#FF6600',
  sextile: '#00BFFF',
  quincunx: '#9932CC',
};

// Zodiac signs and colors
const ZODIAC_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const ZODIAC_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const ZODIAC_SIGNS = ZODIAC_NAMES.map((name, i) => ({
  name: name.toLowerCase(),
  symbol: ZODIAC_SYMBOLS[i],
  color: ZODIAC_COLORS[name as keyof typeof ZODIAC_COLORS] ?? '#6366F1',
}));

// Element-based muted colors for carved/etched zodiac segments
const ELEMENT_TINT: Record<string, string> = {
  fire: 'rgba(239, 68, 68, 0.08)',   // red-500 faint
  earth: 'rgba(34, 197, 94, 0.08)',   // green-500 faint
  air: 'rgba(56, 189, 248, 0.08)',    // sky-400 faint
  water: 'rgba(99, 102, 241, 0.08)',  // indigo-500 faint
};

const ZODIAC_ELEMENTS = [
  'fire','earth','air','water',
  'fire','earth','air','water',
  'fire','earth','air','water',
];

// Convert degrees to radians
const degToRad = (degrees: number) => (degrees * Math.PI) / 180;

// Get coordinates on a circle
const getCircleCoords = (cx: number, cy: number, radius: number, angle: number) => {
  const rad = degToRad(angle - 90); // -90 to start from top
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
};

export function ChartWheel({
  data,
  size = 600,
  interactive = true,
  onPlanetClick,
  onAspectClick,
}: ChartWheelProps) {
  const planets = normalizePlanets(data.planets);
  const cx = size / 2;
  const cy = size / 2;

  // Layout radii — outer planets band sits outside zodiac ring
  const outerRimRadius = size * 0.49;     // outermost edge of SVG
  const planetOuterRadius = size * 0.44;   // planet symbols sit here
  const zodiacOuterRadius = size * 0.36;   // zodiac ring outer edge
  const zodiacInnerRadius = size * 0.26;   // zodiac ring inner edge
  const aspectRadius = size * 0.20;        // aspect lines
  const houseLabelRadius = size * 0.15;    // house number labels
  const centerRadius = size * 0.07;        // center hub

  // Convert planet longitude to chart position (0-360)
  // Prefer absolute ecliptic longitude from backend; fall back to sign-based computation
  const ZODIAC_SIGN_NAMES = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
  const getPlanetAngle = (planet: PlanetPosition) => {
    if (planet.longitude != null && planet.longitude >= 0) {
      return planet.longitude % 360;
    }
    // Fallback: convert within-sign degree to absolute ecliptic longitude
    const signIdx = ZODIAC_SIGN_NAMES.indexOf(planet.sign.toLowerCase());
    const withinSign = planet.degree + planet.minute / 60 + planet.second / 3600;
    const absolute = signIdx >= 0 ? signIdx * 30 + withinSign : withinSign;
    return absolute % 360;
  };

  // Spread overlapping planets to avoid label collision on the outer rim
  const minPixelGap = 32;
  const minAngleGap = (minPixelGap / planetOuterRadius) * (180 / Math.PI);

  const sortedPlanets = [...planets]
    .map((p) => ({ ...p, _angle: getPlanetAngle(p) }))
    .sort((a, b) => a._angle - b._angle);

  // Iterative spreading: keep pushing until stable (max 5 rounds)
  for (let round = 0; round < 5; round++) {
    let changed = false;
    sortedPlanets.sort((a, b) => a._angle - b._angle);
    for (let i = 1; i < sortedPlanets.length; i++) {
      let gap = sortedPlanets[i]._angle - sortedPlanets[i - 1]._angle;
      if (gap < 0) gap += 360;
      if (gap < minAngleGap) {
        const shift = minAngleGap - gap;
        sortedPlanets[i] = { ...sortedPlanets[i], _angle: sortedPlanets[i]._angle + shift };
        changed = true;
      }
    }
    if (!changed) break;
  }

  // Wrap-around check
  if (sortedPlanets.length >= 2) {
    const last = sortedPlanets[sortedPlanets.length - 1];
    const first = sortedPlanets[0];
    const wrapGap = first._angle + 360 - last._angle;
    if (wrapGap < minAngleGap) {
      sortedPlanets[0] = {
        ...sortedPlanets[0],
        _angle: sortedPlanets[0]._angle + (minAngleGap - wrapGap),
      };
    }
  }

  const spreadAngleMap = new Map(
    sortedPlanets.map((p) => [p.planet, p._angle]),
  );

  // Convert house cusp to angle
  const getHouseAngle = (house: HouseCusp) => {
    const totalDegrees = house.degree + house.minute / 60 + house.second / 3600;
    return totalDegrees % 360;
  };

  // Generate accessible description
  const generateChartDescription = () => {
    const planetDescriptions = planets
      .map((p) => {
        const info = PLANET_INFO[p.planet];
        if (!info) return null;
        const retrogradeText = p.retrograde ? ' (retrograde)' : '';
        return `${info.name} in ${p.sign} at ${p.degree}°${p.minute}' in House ${p.house}${retrogradeText}`;
      })
      .filter(Boolean)
      .join('; ');

    const aspectDescriptions = data.aspects
      .map((a) => {
        const p1 = PLANET_INFO[a.planet1]?.name || a.planet1;
        const p2 = PLANET_INFO[a.planet2]?.name || a.planet2;
        return `${p1} ${a.type} ${p2} (${a.degree}°${a.minute}')`;
      })
      .join('; ');

    return `Astrological chart wheel showing ${planets.length} planets and ${data.aspects.length} aspects. ${planetDescriptions}. Aspects: ${aspectDescriptions}`;
  };

  // SVG filter IDs (unique to avoid collisions)
  const filterId = 'chart-carved-filter';

  return (
    <div className="flex justify-center items-center">
      {/* Hidden text-based alternative for screen readers */}
      <div className="sr-only" role="region" aria-label="Chart data in text format">
        <h2>Astrological Chart - Text Description</h2>
        <h3>Planetary Positions</h3>
        <ul>
          {planets.map((planet) => {
            const info = PLANET_INFO[planet.planet];
            if (!info) return null;
            return (
              <li key={planet.planet}>
                {info.name} in {planet.sign} at {planet.degree}°{planet.minute}' in House {planet.house}
                {planet.retrograde && ' (retrograde)'}
              </li>
            );
          })}
        </ul>
        <h3>Aspects</h3>
        <ul>
          {data.aspects.map((aspect, index) => {
            const p1 = PLANET_INFO[aspect.planet1]?.name || aspect.planet1;
            const p2 = PLANET_INFO[aspect.planet2]?.name || aspect.planet2;
            return (
              <li key={`text-aspect-${index}`}>
                {p1} {aspect.type} {p2} ({aspect.degree}°{aspect.minute}')
              </li>
            );
          })}
        </ul>
        <h3>House Cusps</h3>
        <ul>
          {data.houses.map((house) => (
            <li key={house.house}>
              House {house.house}: {house.sign} {house.degree}°{house.minute}'
            </li>
          ))}
        </ul>
      </div>

      <svg
        role="img"
        // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
        aria-label={`Astrological chart wheel with ${data.planets.length} planets`}
        aria-describedby={interactive ? 'chart-description' : undefined}
        data-testid="chart-wheel"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full h-auto"
      >
        {/* SVG filters for carved/etched text effect */}
        <defs>
          <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%">
            {/* Inner shadow — carved-in look */}
            <feComponentTransfer in="SourceAlpha">
              <feFuncA type="table" tableValues="1 0" />
            </feComponentTransfer>
            <feGaussianBlur stdDeviation="0.8" />
            <feOffset dx="0.5" dy="0.5" result="innerShadow" />
            <feFlood floodColor="#000000" floodOpacity="0.6" />
            <feComposite in2="innerShadow" operator="in" />
            <feComposite in2="SourceAlpha" operator="in" result="shadow" />
            {/* Light highlight — top-left */}
            <feComponentTransfer in="SourceAlpha">
              <feFuncA type="table" tableValues="0 1" />
            </feComponentTransfer>
            <feGaussianBlur stdDeviation="0.4" />
            <feOffset dx="-0.3" dy="-0.3" result="highlight" />
            <feFlood floodColor="#ffffff" floodOpacity="0.12" />
            <feComposite in2="highlight" operator="in" />
            <feComposite in2="SourceAlpha" operator="in" result="hl" />
            {/* Merge base + shadow + highlight */}
            <feMerge>
              <feMergeNode in="hl" />
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Radial gradient for background */}
          <radialGradient id="chart-bg-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0d0f1a" />
            <stop offset="70%" stopColor="#0a0c14" />
            <stop offset="100%" stopColor="#070810" />
          </radialGradient>
        </defs>

        {/* Hidden description element referenced by aria-describedby */}
        {interactive && (
          <desc id="chart-description">
            {generateChartDescription()}
          </desc>
        )}

        {/* Background disc */}
        <circle
          cx={cx}
          cy={cy}
          r={outerRimRadius}
          fill="url(#chart-bg-grad)"
          stroke="#1e1b3a"
          strokeWidth="2"
        />

        {/* ═══════════ ZODIAC RING — carved into background ═══════════ */}
        {ZODIAC_SIGNS.map((sign, index) => {
          const startAngle = index * 30;
          const endAngle = (index + 1) * 30;
          const midAngle = startAngle + 15;

          const start = getCircleCoords(cx, cy, zodiacOuterRadius, startAngle);
          const end = getCircleCoords(cx, cy, zodiacOuterRadius, endAngle);
          const innerStart = getCircleCoords(cx, cy, zodiacInnerRadius, startAngle);
          const innerEnd = getCircleCoords(cx, cy, zodiacInnerRadius, endAngle);
          const labelPos = getCircleCoords(cx, cy, (zodiacOuterRadius + zodiacInnerRadius) / 2, midAngle);

          const element = ZODIAC_ELEMENTS[index];
          const tint = ELEMENT_TINT[element] ?? 'rgba(255,255,255,0.04)';

          // Create path for zodiac segment
          const pathData = `
            M ${start.x} ${start.y}
            A ${zodiacOuterRadius} ${zodiacOuterRadius} 0 0 1 ${end.x} ${end.y}
            L ${innerEnd.x} ${innerEnd.y}
            A ${zodiacInnerRadius} ${zodiacInnerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}
            Z
          `;

          return (
            <g key={sign.name} aria-label={`${sign.name} zodiac sign`}>
              {/* Segment fill — faint element tint */}
              <path
                d={pathData}
                fill={tint}
                stroke="#1a1730"
                strokeWidth="0.5"
              />
              {/* Subtle dividing line between segments */}
              <line
                x1={start.x}
                y1={start.y}
                x2={innerStart.x}
                y2={innerStart.y}
                stroke="#1a1730"
                strokeWidth="0.5"
              />
              {/* Zodiac symbol — carved/etched */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={size * 0.045}
                fill="rgba(255,255,255,0.10)"
                fontWeight="bold"
                filter={`url(#${filterId})`}
                role="img"
                aria-label={`${sign.name} sign, symbol ${sign.symbol}`}
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

        {/* Zodiac ring border circles */}
        <circle
          cx={cx} cy={cy} r={zodiacOuterRadius}
          fill="none" stroke="#1e1b3a" strokeWidth="1.5"
        />
        <circle
          cx={cx} cy={cy} r={zodiacInnerRadius}
          fill="none" stroke="#1e1b3a" strokeWidth="1"
        />

        {/* ═══════════ HOUSE LINES ═══════════ */}
        {data.houses.map((house) => {
          const angle = getHouseAngle(house);
          const outer = getCircleCoords(cx, cy, zodiacInnerRadius, angle);
          const inner = getCircleCoords(cx, cy, centerRadius + 4, angle);

          return (
            <line
              key={house.house}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              stroke={house.house === 1 || house.house === 4 || house.house === 7 || house.house === 10
                ? 'rgba(255,255,255,0.18)'
                : 'rgba(255,255,255,0.07)'}
              strokeWidth={house.house === 1 ? 1.5 : 0.7}
              aria-label={`House cusp ${house.house} in ${house.sign}`}
            />
          );
        })}

        {/* ═══════════ HOUSE NUMBERS ═══════════ */}
        {data.houses.map((house) => {
          const nextHouse = data.houses.find((h) => h.house === (house.house % 12) + 1);
          if (!nextHouse) return null;

          const houseAngle = (getHouseAngle(house) + getHouseAngle(nextHouse)) / 2;
          const labelPos = getCircleCoords(cx, cy, houseLabelRadius, houseAngle);

          return (
            <text
              key={`house-${house.house}`}
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={size * 0.028}
              fill="rgba(255,255,255,0.12)"
              fontWeight="normal"
            >
              {house.house}
            </text>
          );
        })}

        {/* ═══════════ ASPECT LINES (inside the wheel) ═══════════ */}
        {data.aspects.map((aspect, index) => {
          const planet1 = planets.find((p) => p.planet === aspect.planet1);
          const planet2 = planets.find((p) => p.planet === aspect.planet2);

          if (!planet1 || !planet2) return null;

          const angle1 = spreadAngleMap.get(planet1.planet) ?? getPlanetAngle(planet1);
          const angle2 = spreadAngleMap.get(planet2.planet) ?? getPlanetAngle(planet2);

          const start = getCircleCoords(cx, cy, aspectRadius, angle1);
          const end = getCircleCoords(cx, cy, aspectRadius, angle2);

          const p1Name = PLANET_INFO[aspect.planet1]?.name || aspect.planet1;
          const p2Name = PLANET_INFO[aspect.planet2]?.name || aspect.planet2;
          const aspectLabel = `${p1Name} ${aspect.type} ${p2Name}, ${aspect.degree}°${aspect.minute}'`;

          return (
            <g
              key={`aspect-${index}`}
              onClick={interactive ? () => onAspectClick?.(aspect) : undefined}
              className={interactive ? 'cursor-pointer' : ''}
              style={{ opacity: 0.35 }}
              role="img"
              aria-label={aspectLabel}
              tabIndex={interactive ? 0 : undefined}
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onAspectClick?.(aspect);
                      }
                    }
                  : undefined
              }
            >
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={ASPECT_COLORS[aspect.type] || '#888'}
                strokeWidth={aspect.type === 'conjunction' || aspect.type === 'opposition' ? 1.2 : 0.8}
                strokeDasharray={aspect.type === 'quincunx' || aspect.type === 'semi-sextile' ? '3,2' : 'none'}
                aria-label={aspectLabel}
              />
            </g>
          );
        })}

        {/* ═══════════ PLANETS — outer periphery ═══════════ */}
        {planets.map((planet) => {
          const angle = spreadAngleMap.get(planet.planet) ?? getPlanetAngle(planet);
          const pos = getCircleCoords(cx, cy, planetOuterRadius, angle);
          const info = PLANET_INFO[planet.planet];

          if (!info) return null;

          // Tick line from zodiac edge to planet position
          const tickInner = getCircleCoords(cx, cy, zodiacOuterRadius, angle);
          const tickOuter = getCircleCoords(cx, cy, zodiacOuterRadius + 6, angle);

          const retrogradeText = planet.retrograde ? ', retrograde' : '';
          const planetLabel = `${info.name} in ${planet.sign} at ${planet.degree}°${planet.minute}' in House ${planet.house}${retrogradeText}`;

          const planetCircleR = size * 0.028;

          return (
            <g
              key={planet.planet}
              data-testid={`planet-${planet.planet}`}
              onClick={interactive ? () => onPlanetClick?.(planet.planet) : undefined}
              className={interactive ? 'cursor-pointer' : ''}
              role="img"
              aria-label={planetLabel}
              tabIndex={interactive ? 0 : undefined}
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onPlanetClick?.(planet.planet);
                      }
                    }
                  : undefined
              }
            >
              {/* Tick mark connecting zodiac ring to planet */}
              <line
                x1={tickInner.x}
                y1={tickInner.y}
                x2={tickOuter.x}
                y2={tickOuter.y}
                stroke={info.color}
                strokeWidth="1"
                opacity="0.4"
              />

              {/* Glow behind planet */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={planetCircleR + 4}
                fill={info.color}
                opacity="0.15"
              />

              {/* Planet disc */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={planetCircleR}
                fill="#0d0f1a"
                stroke={info.color}
                strokeWidth="1.5"
                aria-label={planetLabel}
              />

              {/* Planet symbol */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={size * 0.026}
                fill={info.color}
                fontWeight="bold"
                aria-label={`${info.symbol} ${planet.retrograde ? 'retrograde' : ''}`}
              >
                {info.symbol}
              </text>

              {/* Retrograde indicator */}
              {planet.retrograde && (
                <text
                  x={pos.x + planetCircleR + 2}
                  y={pos.y - planetCircleR + 2}
                  textAnchor="start"
                  fontSize={size * 0.016}
                  fill="#ef4444"
                  fontWeight="bold"
                  aria-label="retrograde"
                >
                  ℞
                </text>
              )}
            </g>
          );
        })}

        {/* ═══════════ CENTER HUB ═══════════ */}
        <circle
          cx={cx}
          cy={cy}
          r={centerRadius}
          fill="#0a0c14"
          stroke="#1e1b3a"
          strokeWidth="1"
        />
        <circle
          cx={cx}
          cy={cy}
          r={size * 0.015}
          fill="#1e1b3a"
          stroke="#2d2850"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
}

// Legend component — modern interactive icon cards with hover tooltips
const ASPECT_INFO: Record<string, { symbol: string; orb: string; meaning: string; nature: string }> = {
  conjunction:  { symbol: '☌', orb: '0-10°',  meaning: 'Planets merge energies; intensifies both.',    nature: 'Neutral' },
  opposition:   { symbol: '☍', orb: '0-8°',   meaning: 'Polarity and tension; awareness through contrast.', nature: 'Challenging' },
  trine:        { symbol: '△', orb: '0-8°',   meaning: 'Natural harmony and flow; talents and ease.',    nature: 'Harmonious' },
  square:       { symbol: '□', orb: '0-8°',   meaning: 'Friction driving growth; internal conflict.',    nature: 'Challenging' },
  sextile:      { symbol: '⚹', orb: '0-6°',   meaning: 'Opportunity and cooperation; requires effort.',  nature: 'Harmonious' },
  quincunx:     { symbol: '⚻', orb: '0-3°',   meaning: 'Adjustment needed; uneasy awareness.',           nature: 'Minor' },
  'semi-sextile': { symbol: '☵', orb: '0-2°', meaning: 'Slight unease; minor adjustment.',              nature: 'Minor' },
};

const PLANET_DESCRIPTIONS: Record<string, string> = {
  sun:     'Core identity, ego, vitality, willpower.',
  moon:    'Emotions, instincts, inner self, habits.',
  mercury: 'Communication, thought, intellect, logic.',
  venus:   'Love, beauty, values, pleasure, art.',
  mars:    'Energy, action, desire, courage, drive.',
  jupiter: 'Expansion, luck, philosophy, growth.',
  saturn:  'Structure, discipline, responsibility, karma.',
  uranus:  'Innovation, rebellion, freedom, change.',
  neptune: 'Dreams, intuition, spirituality, illusion.',
  pluto:   'Transformation, power, rebirth, depth.',
};

const NATURE_COLORS: Record<string, string> = {
  Harmonious: '#22C55E',
  Challenging: '#EF4444',
  Neutral: '#F59E0B',
  Minor: '#6B7280',
};

export function ChartWheelLegend() {
  return (
    <div className="mt-6 space-y-4" role="region" aria-label="Chart legend">

      {/* Aspects row */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Aspects</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ASPECT_INFO).map(([type, info]) => {
            const color = ASPECT_COLORS[type] ?? '#888';
            const natureColor = NATURE_COLORS[info.nature] ?? '#888';
            return (
              <div key={type} className="group relative">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                             bg-white/[0.03] border border-white/[0.06]
                             hover:bg-white/[0.07] hover:border-white/[0.12]
                             transition-all duration-200 cursor-default"
                >
                  <span className="text-lg" style={{ color }} aria-hidden="true">{info.symbol}</span>
                  <span className="text-xs font-medium text-slate-300 capitalize">{type}</span>
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: natureColor }}
                    title={info.nature}
                  />
                </div>
                {/* Hover tooltip */}
                <div
                  className="pointer-events-none absolute z-50 left-1/2 -translate-x-1/2
                             bottom-full mb-2 w-56 p-3 rounded-xl
                             bg-[#151823] border border-white/10 shadow-2xl shadow-black/60
                             opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                             transition-all duration-200"
                  role="tooltip"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl" style={{ color }}>{info.symbol}</span>
                    <span className="font-bold text-white capitalize">{type}</span>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full ml-auto"
                      style={{ backgroundColor: `${natureColor}20`, color: natureColor }}
                    >
                      {info.nature}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mb-1">Orb: {info.orb}</div>
                  <div className="text-xs text-slate-300 leading-relaxed">{info.meaning}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Planets row */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Planets</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PLANET_INFO).map(([key, info]) => {
            const desc = PLANET_DESCRIPTIONS[key] ?? 'Celestial body in the natal chart.';
            return (
              <div key={key} className="group relative">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                             bg-white/[0.03] border border-white/[0.06]
                             hover:bg-white/[0.07] hover:border-white/[0.12]
                             transition-all duration-200 cursor-default"
                >
                  <span className="text-lg" style={{ color: info.color }} aria-hidden="true">{info.symbol}</span>
                  <span className="text-xs font-medium text-slate-300">{info.name}</span>
                </div>
                {/* Hover tooltip */}
                <div
                  className="pointer-events-none absolute z-50 left-1/2 -translate-x-1/2
                             bottom-full mb-2 w-48 p-3 rounded-xl
                             bg-[#151823] border border-white/10 shadow-2xl shadow-black/60
                             opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                             transition-all duration-200"
                  role="tooltip"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl" style={{ color: info.color }}>{info.symbol}</span>
                    <span className="font-bold text-white">{info.name}</span>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed">{desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zodiac Signs row */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Zodiac Signs</h4>
        <div className="flex flex-wrap gap-1.5">
          {ZODIAC_SIGNS.map((sign) => {
            const idx = ZODIAC_NAMES.indexOf(sign.name.charAt(0).toUpperCase() + sign.name.slice(1));
            const el = ZODIAC_ELEMENTS[idx] ?? 'fire';
            const elColor = el === 'fire' ? '#EF4444' : el === 'earth' ? '#22C55E' : el === 'air' ? '#38BDF8' : '#6366F1';
            const elName = el.charAt(0).toUpperCase() + el.slice(1);
            return (
              <div key={sign.name} className="group relative">
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-md
                             bg-white/[0.03] border border-white/[0.06]
                             hover:bg-white/[0.07] hover:border-white/[0.12]
                             transition-all duration-200 cursor-default"
                >
                  <span className="text-lg" style={{ color: sign.color }} aria-hidden="true">{sign.symbol}</span>
                  <span className="text-[10px] font-medium text-slate-400 capitalize">{sign.name}</span>
                </div>
                {/* Hover tooltip */}
                <div
                  className="pointer-events-none absolute z-50 left-1/2 -translate-x-1/2
                             bottom-full mb-2 w-40 p-2.5 rounded-xl
                             bg-[#151823] border border-white/10 shadow-2xl shadow-black/60
                             opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                             transition-all duration-200"
                  role="tooltip"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" style={{ color: sign.color }}>{sign.symbol}</span>
                    <div>
                      <div className="font-bold text-white capitalize text-sm">{sign.name}</div>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: `${elColor}20`, color: elColor }}
                      >
                        {elName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
