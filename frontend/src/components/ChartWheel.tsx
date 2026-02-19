// import React from 'react';
// import { PlanetSymbol, AspectSymbol } from './';

// Types based on findings.md data models
export interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number;
  minute: number;
  second: number;
  house: number;
  retrograde: boolean;
  latitude: number;
  longitude: number;
  speed: number;
}

export interface HouseCusp {
  house: number;
  sign: string;
  degree: number;
  minute: number;
  second: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx' | 'semi-sextile';
  degree: number;
  minute: number;
  orb: number;
  applying: boolean;
  separating: boolean;
}

export interface ChartData {
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
}

interface ChartWheelProps {
  data: ChartData;
  size?: number;
  interactive?: boolean;
  onPlanetClick?: (planet: string) => void;
  onAspectClick?: (aspect: Aspect) => void;
}

// Planet symbols and colors from findings.md
const PLANET_INFO: Record<string, { symbol: string; color: string; name: string }> = {
  sun: { symbol: '☉', color: '#FFD700', name: 'Sun' },
  moon: { symbol: '☽', color: '#C0C0C0', name: 'Moon' },
  mercury: { symbol: '☿', color: '#8B4513', name: 'Mercury' },
  venus: { symbol: '♀', color: '#FF69B4', name: 'Venus' },
  mars: { symbol: '♂', color: '#FF0000', name: 'Mars' },
  jupiter: { symbol: '♃', color: '#FFA500', name: 'Jupiter' },
  saturn: { symbol: '♄', color: '#696969', name: 'Saturn' },
  uranus: { symbol: '♅', color: '#40E0D0', name: 'Uranus' },
  neptune: { symbol: '♆', color: '#4169E1', name: 'Neptune' },
  pluto: { symbol: '♇', color: '#8B0000', name: 'Pluto' },
};

// Aspect colors from findings.md
const ASPECT_COLORS: Record<string, string> = {
  conjunction: '#FF0000',
  opposition: '#FF0000',
  trine: '#00FF00',
  square: '#FF6600',
  sextile: '#00BFFF',
  quincunx: '#9932CC',
  'semi-sextile': '#888888',
};

// Zodiac signs and colors
const ZODIAC_SIGNS = [
  { name: 'aries', symbol: '♈', color: '#EF4444' },
  { name: 'taurus', symbol: '♉', color: '#10B981' },
  { name: 'gemini', symbol: '♊', color: '#3B82F6' },
  { name: 'cancer', symbol: '♋', color: '#6366F1' },
  { name: 'leo', symbol: '♌', color: '#EF4444' },
  { name: 'virgo', symbol: '♍', color: '#10B981' },
  { name: 'libra', symbol: '♎', color: '#3B82F6' },
  { name: 'scorpio', symbol: '♏', color: '#6366F1' },
  { name: 'sagittarius', symbol: '♐', color: '#EF4444' },
  { name: 'capricorn', symbol: '♑', color: '#10B981' },
  { name: 'aquarius', symbol: '♒', color: '#3B82F6' },
  { name: 'pisces', symbol: '♓', color: '#6366F1' },
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
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.25;
  const aspectRadius = size * 0.38;

  // Convert planet longitude to chart position (0-360)
  const getPlanetAngle = (planet: PlanetPosition) => {
    const totalDegrees = planet.degree + planet.minute / 60 + planet.second / 3600;
    return totalDegrees % 360;
  };

  // Convert house cusp to angle
  const getHouseAngle = (house: HouseCusp) => {
    const totalDegrees = house.degree + house.minute / 60 + house.second / 3600;
    return totalDegrees % 360;
  };

  // Generate accessible description
  const generateChartDescription = () => {
    const planetDescriptions = data.planets
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

    return `Astrological chart wheel showing ${data.planets.length} planets and ${data.aspects.length} aspects. ${planetDescriptions}. Aspects: ${aspectDescriptions}`;
  };

  return (
    <div className="flex justify-center items-center">
      {/* Hidden text-based alternative for screen readers */}
      <div className="sr-only" role="region" aria-label="Chart data in text format">
        <h2>Astrological Chart - Text Description</h2>
        <h3>Planetary Positions</h3>
        <ul>
          {data.planets.map((planet) => {
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
        aria-label={`Astrological chart wheel with ${data.planets.length} planets`}
        aria-describedby={interactive ? 'chart-description' : undefined}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full h-auto"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {/* Hidden description element referenced by aria-describedby */}
        {interactive && (
          <desc id="chart-description">
            {generateChartDescription()}
          </desc>
        )}
        {/* Background circle */}
        <circle
          cx={cx}
          cy={cy}
          r={outerRadius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="2"
          className="dark:stroke-gray-700"
        />

        {/* Zodiac wheel - 12 segments */}
        {ZODIAC_SIGNS.map((sign, index) => {
          const startAngle = index * 30;
          const endAngle = (index + 1) * 30;
          const midAngle = startAngle + 15;

          const start = getCircleCoords(cx, cy, outerRadius, startAngle);
          const end = getCircleCoords(cx, cy, outerRadius, endAngle);
          const innerStart = getCircleCoords(cx, cy, innerRadius, startAngle);
          const innerEnd = getCircleCoords(cx, cy, innerRadius, endAngle);
          const labelPos = getCircleCoords(cx, cy, (outerRadius + innerRadius) / 2, midAngle);

          // Create path for zodiac segment
          const largeArcFlag = 0;
          const pathData = `
            M ${start.x} ${start.y}
            A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
            L ${innerEnd.x} ${innerEnd.y}
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}
            Z
          `;

          return (
            <g key={sign.name} aria-label={`${sign.name} zodiac sign`}>
              {/* Zodiac segment */}
              <path
                d={pathData}
                fill={index % 2 === 0 ? '#F9FAFB' : '#FFFFFF'}
                stroke="#D1D5DB"
                strokeWidth="1"
                className="dark:fill-gray-800 dark:stroke-gray-600"
              />
              {/* Zodiac symbol */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={size * 0.035}
                fill={sign.color}
                fontWeight="bold"
                role="img"
                aria-label={`${sign.name} sign, symbol ${sign.symbol}`}
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

        {/* House lines */}
        {data.houses.map((house) => {
          const angle = getHouseAngle(house);
          const outer = getCircleCoords(cx, cy, outerRadius, angle);
          const inner = getCircleCoords(cx, cy, innerRadius, angle);

          return (
            <line
              key={house.house}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              stroke="#9CA3AF"
              strokeWidth={house.house === 1 ? 2 : 1}
              className="dark:stroke-gray-500"
              aria-label={`House cusp ${house.house} in ${house.sign}`}
            />
          );
        })}

        {/* House numbers */}
        {data.houses.map((house) => {
          // Position house number in the middle of the house
          const nextHouse = data.houses.find((h) => h.house === (house.house % 12) + 1);
          if (!nextHouse) return null;

          const houseAngle = (getHouseAngle(house) + getHouseAngle(nextHouse)) / 2;
          const labelPos = getCircleCoords(cx, cy, innerRadius * 0.75, houseAngle);

          return (
            <text
              key={`house-${house.house}`}
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={size * 0.025}
              fill="#6B7280"
              className="dark:fill-gray-400"
            >
              {house.house}
            </text>
          );
        })}

        {/* Aspect lines (inside the wheel) */}
        {data.aspects.map((aspect, index) => {
          const planet1 = data.planets.find((p) => p.planet === aspect.planet1);
          const planet2 = data.planets.find((p) => p.planet === aspect.planet2);

          if (!planet1 || !planet2) return null;

          const angle1 = getPlanetAngle(planet1);
          const angle2 = getPlanetAngle(planet2);

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
              style={{ opacity: 0.6 }}
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
                strokeWidth={aspect.type === 'conjunction' || aspect.type === 'opposition' ? 2 : 1.5}
                strokeDasharray={aspect.type === 'quincunx' || aspect.type === 'semi-sextile' ? '4,2' : 'none'}
                aria-label={aspectLabel}
              />
            </g>
          );
        })}

        {/* Planets */}
        {data.planets.map((planet) => {
          const angle = getPlanetAngle(planet);
          const pos = getCircleCoords(cx, cy, (outerRadius + innerRadius) / 2, angle);
          const info = PLANET_INFO[planet.planet];

          if (!info) return null;

          const retrogradeText = planet.retrograde ? ', retrograde' : '';
          const planetLabel = `${info.name} in ${planet.sign} at ${planet.degree}°${planet.minute}' in House ${planet.house}${retrogradeText}`;

          return (
            <g
              key={planet.planet}
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
              {/* Planet background circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={size * 0.035}
                fill={info.color}
                stroke="#FFFFFF"
                strokeWidth="2"
                className="dark:stroke-gray-900"
                opacity={0.9}
                aria-label={planetLabel}
              />
              {/* Planet symbol */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={size * 0.03}
                fill="#FFFFFF"
                fontWeight="bold"
                aria-label={`${info.symbol} ${planet.retrograde ? 'retrograde' : ''}`}
              >
                {info.symbol}
              </text>
              {/* Retrograde indicator */}
              {planet.retrograde && (
                <text
                  x={pos.x}
                  y={pos.y + size * 0.03}
                  textAnchor="middle"
                  fontSize={size * 0.02}
                  fill="#FFFFFF"
                  fontWeight="bold"
                  aria-label="retrograde"
                >
                  Rx
                </text>
              )}
            </g>
          );
        })}

        {/* Center point */}
        <circle
          cx={cx}
          cy={cy}
          r={size * 0.02}
          fill="#6366F1"
          className="dark:fill-indigo-400"
        />
      </svg>
    </div>
  );
}

// Legend component
export function ChartWheelLegend() {
  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" role="region" aria-label="Chart legend">
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Aspects</h4>
        <ul className="space-y-1" role="list">
          <li className="flex items-center gap-2">
            <span className="text-lg" style={{ color: ASPECT_COLORS.conjunction }} aria-hidden="true">☌</span>
            <span className="text-gray-600 dark:text-gray-400">
              <span className="sr-only">Conjunction symbol</span>
              Conjunction (10°)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-lg" style={{ color: ASPECT_COLORS.opposition }} aria-hidden="true">☍</span>
            <span className="text-gray-600 dark:text-gray-400">
              <span className="sr-only">Opposition symbol</span>
              Opposition (8°)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-lg" style={{ color: ASPECT_COLORS.trine }} aria-hidden="true">△</span>
            <span className="text-gray-600 dark:text-gray-400">
              <span className="sr-only">Trine symbol</span>
              Trine (8°)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-lg" style={{ color: ASPECT_COLORS.square }} aria-hidden="true">□</span>
            <span className="text-gray-600 dark:text-gray-400">
              <span className="sr-only">Square symbol</span>
              Square (8°)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-lg" style={{ color: ASPECT_COLORS.sextile }} aria-hidden="true">⚹</span>
            <span className="text-gray-600 dark:text-gray-400">
              <span className="sr-only">Sextile symbol</span>
              Sextile (6°)
            </span>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Planets</h4>
        <ul className="space-y-1" role="list">
          {Object.entries(PLANET_INFO).slice(0, 5).map(([key, info]) => (
            <li key={key} className="flex items-center gap-2">
              <span style={{ color: info.color }} aria-hidden="true">{info.symbol}</span>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="sr-only">{info.name} symbol</span>
                {info.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">&nbsp;</h4>
        <ul className="space-y-1" role="list">
          {Object.entries(PLANET_INFO).slice(5).map(([key, info]) => (
            <li key={key} className="flex items-center gap-2">
              <span style={{ color: info.color }} aria-hidden="true">{info.symbol}</span>
              <span className="text-gray-600 dark:text-gray-400">
                <span className="sr-only">{info.name} symbol</span>
                {info.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Zodiac Signs</h4>
        <div className="grid grid-cols-4 gap-1" role="list" aria-label="Zodiac signs">
          {ZODIAC_SIGNS.map((sign) => (
            <span key={sign.name} style={{ color: sign.color }} className="text-lg" aria-label={`${sign.name} ${sign.symbol}`}>
              {sign.symbol}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
