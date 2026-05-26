/**
 * Professional Natal Chart Wheel Component
 *
 * Layout (outside → inside):
 * 1. Zodiac ring: 12 colored 30° segments with zodiac symbols
 * 2. Degree tick marks around outer edge
 * 3. House lines extending from zodiac ring inward
 * 4. House numbers (Roman numerals) in the house ring area
 * 5. Planet symbols + degree labels between zodiac ring and inner circle (no overlap)
 * 6. Aspect lines inside the inner circle
 * 7. ASC/DSC/MC/IC angle markers on the outer ring
 */

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
  chiron: '⚷', northnode: '☊', southnode: '☋',
};

const PLANET_NAMES: Record<string, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
  chiron: 'Chiron', northnode: 'North Node', southnode: 'South Node',
};

const PLANET_COLORS_MAP: Record<string, string> = {};
for (const key of Object.keys(PLANET_SYMBOLS)) {
  const k = key.charAt(0).toUpperCase() + key.slice(1);
  PLANET_COLORS_MAP[key] = PLANET_COLORS[k as keyof typeof PLANET_COLORS] ?? '#C084FC';
}

const ASPECT_COLORS: Record<string, string> = {
  ...ASPECT_COLORS_TOKEN,
  'semi-sextile': '#888888',
  'semisextile': '#888888',
  square: '#FF6600',
  sextile: '#00BFFF',
  quincunx: '#9932CC',
  conjunction: '#FFD700',
  opposition: '#FF4444',
  trine: '#00FF88',
};

const ZODIAC_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const ZODIAC_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

const degToRad = (deg: number) => (deg * Math.PI) / 180;

const polar = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = degToRad(angleDeg - 90);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

// Get planet's ecliptic longitude from the data
function getPlanetLongitude(p: PlanetPosition): number {
  if (p.longitude !== undefined && p.longitude > 0) return p.longitude;
  // Fallback: compute from sign + degree + minute
  const signIdx = ZODIAC_NAMES.findIndex(n => n.toLowerCase() === p.sign?.toLowerCase());
  const signStart = signIdx >= 0 ? signIdx * 30 : 0;
  return signStart + (p.degree ?? 0) + (p.minute ?? 0) / 60 + (p.second ?? 0) / 3600;
}

// Get house cusp longitude
function getHouseLongitude(h: HouseCusp): number {
  if (h.cusp !== undefined && h.cusp > 0) return h.cusp;
  const signIdx = ZODIAC_NAMES.findIndex(n => n.toLowerCase() === h.sign?.toLowerCase());
  const signStart = signIdx >= 0 ? signIdx * 30 : 0;
  return signStart + (h.degree ?? 0) + (h.minute ?? 0) / 60 + (h.second ?? 0) / 3600;
}

// Resolve overlaps among planets: spread them so they don't overlap
function resolveOverlaps(planets: PlanetPosition[], radius: number, cx: number, cy: number, minGapDeg: number): { x: number; y: number; angle: number; planet: PlanetPosition }[] {
  const items = planets.map(p => {
    const lon = getPlanetLongitude(p);
    return { lon, planet: p };
  }).sort((a, b) => a.lon - b.lon);

  // Spread overlapping planets
  const spread: number[] = items.map(i => i.lon);
  const n = spread.length;
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 1; i < n; i++) {
      let gap = spread[i] - spread[i - 1];
      if (i === 0) gap = (spread[0] + 360) - spread[n - 1];
      if (gap < minGapDeg) {
        const shift = (minGapDeg - gap) / 2;
        spread[i] = (spread[i] + shift) % 360;
        spread[i - 1] = (spread[i - 1] - shift + 360) % 360;
      }
    }
  }

  return items.map((item, i) => {
    const pos = polar(cx, cy, radius, spread[i]);
    return { ...pos, angle: spread[i], planet: item.planet };
  });
}

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

  // Ring radii (from outside in)
  const outerEdge = size * 0.47;       // Outermost edge
  const zodiacOuter = outerEdge;
  const zodiacInner = size * 0.38;     // Inner edge of zodiac ring
  const planetOuter = zodiacInner - 2;
  const planetInner = size * 0.26;     // Planets sit between these
  const planetRadius = (planetOuter + planetInner) / 2;
  const houseLineOuter = zodiacInner;
  const houseLineInner = size * 0.22;  // House lines end here
  const innerCircle = houseLineInner;
  const aspectRadius = innerCircle * 0.85; // Aspects drawn inside
  const houseNumberRadius = (houseLineInner + innerCircle) / 2 + 4;

  // Ascendant from houses (house 1 cusp)
  const ascendant = data.houses.length > 0 ? getHouseLongitude(data.houses[0]) : 0;

  // The entire wheel is rotated so the ascendant is at the left (9 o'clock position)
  // In astrology, ASC is traditionally on the left. We rotate by (180 - ascendant) so ASC maps to 180°
  // which is the left side (9 o'clock) in SVG coordinates.
  const wheelRotation = 180 - ascendant;

  return (
    <div className="flex justify-center items-center">
      {/* Screen reader text */}
      <div className="sr-only" role="region" aria-label="Chart data in text format">
        <h2>Astrological Chart - Text Description</h2>
        <h3>Planetary Positions</h3>
        <ul>
          {planets.map((p) => {
            const name = PLANET_NAMES[p.planet] || p.planet;
            return (
              <li key={p.planet}>
                {name} in {p.sign} at {p.degree}°{p.minute}' in House {p.house}
                {p.retrograde && ' (retrograde)'}
              </li>
            );
          })}
        </ul>
        <h3>Aspects</h3>
        <ul>
          {data.aspects.map((a, i) => (
            <li key={i}>
              {PLANET_NAMES[a.planet1] || a.planet1} {a.type} {PLANET_NAMES[a.planet2] || a.planet2} ({a.degree}°{a.minute}')
            </li>
          ))}
        </ul>
        <h3>House Cusps</h3>
        <ul>
          {data.houses.map((h) => (
            <li key={h.house}>House {h.house}: {h.sign} {h.degree}°{h.minute}'</li>
          ))}
        </ul>
      </div>

      <svg
        role="img"
        aria-label={`Astrological chart wheel with ${planets.length} planets`}
        data-testid="chart-wheel"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full h-auto"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        <defs>
          {/* Gradient for zodiac ring background */}
          <radialGradient id="zodiac-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a1035" />
            <stop offset="100%" stopColor="#0d0a1a" />
          </radialGradient>
          {/* Glow filter for planets */}
          <filter id="planet-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main rotation group: ASC at 9 o'clock (left) */}
        <g transform={`rotate(${wheelRotation}, ${cx}, ${cy})`}>

          {/* === ZODIAC RING === */}
          {/* Background disc */}
          <circle cx={cx} cy={cy} r={zodiacOuter} fill="none" stroke="#2a1f4e" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={zodiacInner} fill="none" stroke="#2a1f4e" strokeWidth="1" />

          {ZODIAC_NAMES.map((name, index) => {
            const startAngle = index * 30;
            const endAngle = (index + 1) * 30;
            const midAngle = startAngle + 15;

            const s1 = polar(cx, cy, zodiacOuter, startAngle);
            const s2 = polar(cx, cy, zodiacOuter, endAngle);
            const e1 = polar(cx, cy, zodiacInner, startAngle);
            const e2 = polar(cx, cy, zodiacInner, endAngle);
            const labelPos = polar(cx, cy, (zodiacOuter + zodiacInner) / 2, midAngle);

            // Alternate colors for zodiac elements
            const bgColors = [
              '#1e1538', '#1a1230', '#1e1538', '#1a1230',
              '#1e1538', '#1a1230', '#1e1538', '#1a1230',
              '#1e1538', '#1a1230', '#1e1538', '#1a1230',
            ];
            const signColor = ZODIAC_COLORS[name as keyof typeof ZODIAC_COLORS] ?? '#9CA3AF';

            return (
              <g key={`zodiac-${name}`} aria-label={`${name.toLowerCase()} zodiac sign`}>
                <path
                  d={`M ${s1.x} ${s1.y} A ${zodiacOuter} ${zodiacOuter} 0 0 1 ${s2.x} ${s2.y} L ${e2.x} ${e2.y} A ${zodiacInner} ${zodiacInner} 0 0 0 ${e1.x} ${e1.y} Z`}
                  fill={bgColors[index]}
                  stroke="#3d2d6b"
                  strokeWidth="0.5"
                />
                {/* Zodiac symbol */}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={size * 0.038}
                  fill={signColor}
                  fontWeight="bold"
                  role="img"
                  aria-label={`${name.toLowerCase()} sign, symbol ${ZODIAC_SYMBOLS[index]}`}
                >
                  {ZODIAC_SYMBOLS[index]}
                </text>
              </g>
            );
          })}

          {/* === DEGREE TICK MARKS === */}
          {Array.from({ length: 360 }, (_, i) => {
            const isMajor = i % 30 === 0;
            const isMid = i % 10 === 0;
            if (!isMajor && !isMid && i % 5 !== 0) return null;
            const tickOuter = zodiacOuter;
            const tickInner = isMajor ? zodiacOuter - 6 : isMid ? zodiacOuter - 4 : zodiacOuter - 2;
            const p1 = polar(cx, cy, tickOuter, i);
            const p2 = polar(cx, cy, tickInner, i);
            return (
              <line
                key={`tick-${i}`}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke={isMajor ? '#6366F1' : '#3d2d6b'}
                strokeWidth={isMajor ? 1.5 : 0.5}
              />
            );
          })}

          {/* === HOUSE LINES === */}
          {data.houses.map((house) => {
            const angle = getHouseLongitude(house);
            const outer = polar(cx, cy, houseLineOuter, angle);
            const inner = polar(cx, cy, houseLineInner, angle);
            const isAngle = house.house === 1 || house.house === 4 || house.house === 7 || house.house === 10;

            return (
              <line
                key={`hline-${house.house}`}
                x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y}
                stroke={isAngle ? '#818CF8' : '#4a3d7a'}
                strokeWidth={isAngle ? 2 : 1}
                opacity={isAngle ? 1 : 0.6}
                aria-label={`House cusp ${house.house} in ${house.sign}`}
              />
            );
          })}

          {/* === HOUSE NUMBERS (Roman) === */}
          {data.houses.map((house, i) => {
            const nextHouse = data.houses[(i + 1) % data.houses.length];
            const angle1 = getHouseLongitude(house);
            const angle2 = getHouseLongitude(nextHouse);
            let midAngle = (angle1 + angle2) / 2;
            if (angle2 < angle1) midAngle = midAngle + 180;
            midAngle = midAngle % 360;
            const pos = polar(cx, cy, houseNumberRadius, midAngle);

            return (
              <text
                key={`hnum-${house.house}`}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={size * 0.028}
                fill="#6B7280"
                fontWeight="600"
                opacity={0.7}
              >
                {ROMAN[house.house - 1]}
              </text>
            );
          })}

          {/* === INNER CIRCLE (aspect area boundary) === */}
          <circle cx={cx} cy={cy} r={innerCircle} fill="none" stroke="#2a1f4e" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={aspectRadius} fill="none" stroke="#1a1035" strokeWidth="0.5" />

          {/* === ASPECT LINES (inside inner circle) === */}
          {data.aspects.map((aspect, index) => {
            const p1 = planets.find(p => p.planet === aspect.planet1);
            const p2 = planets.find(p => p.planet === aspect.planet2);
            if (!p1 || !p2) return null;

            const a1 = getPlanetLongitude(p1);
            const a2 = getPlanetLongitude(p2);
            const start = polar(cx, cy, aspectRadius, a1);
            const end = polar(cx, cy, aspectRadius, a2);

            const color = ASPECT_COLORS[aspect.type] || '#888';
            const isDashed = aspect.type === 'quincunx' || aspect.type === 'semi-sextile' || aspect.type === 'semisextile';
            const width = (aspect.type === 'conjunction' || aspect.type === 'opposition') ? 1.5 : 1;

            const p1Name = PLANET_NAMES[aspect.planet1] || aspect.planet1;
            const p2Name = PLANET_NAMES[aspect.planet2] || aspect.planet2;
            const label = `${p1Name} ${aspect.type} ${p2Name}, ${aspect.degree}°${aspect.minute}'`;

            return (
              <g
                key={`aspect-${index}`}
                onClick={interactive ? () => onAspectClick?.(aspect) : undefined}
                className={interactive ? 'cursor-pointer' : ''}
                role="img"
                aria-label={label}
                tabIndex={interactive ? 0 : undefined}
              >
                <line
                  x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                  stroke={color}
                  strokeWidth={width}
                  strokeDasharray={isDashed ? '4,2' : 'none'}
                  opacity={0.5}
                />
              </g>
            );
          })}

          {/* === PLANETS (between zodiac ring and inner circle) === */}
          {(() => {
            const placed = resolveOverlaps(planets, planetRadius, cx, cy, 8);
            return placed.map(({ x, y, angle, planet }) => {
              const info = PLANET_SYMBOLS[planet.planet];
              if (!info) return null;
              const color = PLANET_COLORS_MAP[planet.planet] || '#C084FC';
              const name = PLANET_NAMES[planet.planet] || planet.planet;
              const lon = getPlanetLongitude(planet);
              const signIdx = Math.floor(lon / 30);
              const degInSign = Math.floor(lon % 30);
              const signSymbol = ZODIAC_SYMBOLS[signIdx] || '';

              const retrogradeText = planet.retrograde ? ', retrograde' : '';
              const planetLabel = `${name} in ${planet.sign} at ${degInSign}° in House ${planet.house}${retrogradeText}`;

              // Degree label offset: put degree text slightly above/below planet
              const labelOffset = size * 0.03;
              const labelPos = polar(cx, cy, planetRadius + labelOffset, angle);
              // Push label radially outward from center
              const dx = labelPos.x - cx;
              const dy = labelPos.y - cy;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const ndx = dx / dist;
              const ndy = dy / dist;

              return (
                <g
                  key={`planet-${planet.planet}`}
                  data-testid={`planet-${planet.planet}`}
                  onClick={interactive ? () => onPlanetClick?.(planet.planet) : undefined}
                  className={interactive ? 'cursor-pointer' : ''}
                  role="img"
                  aria-label={planetLabel}
                  tabIndex={interactive ? 0 : undefined}
                  filter="url(#planet-glow)"
                >
                  {/* Planet circle background */}
                  <circle
                    cx={x} cy={y} r={size * 0.022}
                    fill={color}
                    stroke="#0d0a1a"
                    strokeWidth="1.5"
                    opacity={0.95}
                  />
                  {/* Planet symbol */}
                  <text
                    x={x} y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={size * 0.024}
                    fill="#FFFFFF"
                    fontWeight="bold"
                  >
                    {info}
                  </text>
                  {/* Retrograde indicator */}
                  {planet.retrograde && (
                    <text
                      x={x + size * 0.015} y={y - size * 0.015}
                      textAnchor="start"
                      dominantBaseline="central"
                      fontSize={size * 0.013}
                      fill="#FF6B6B"
                      fontWeight="bold"
                    >
                      R
                    </text>
                  )}
                  {/* Degree + sign label above planet */}
                  <text
                    x={x + ndx * size * 0.025}
                    y={y + ndy * size * 0.025}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={size * 0.016}
                    fill="#9CA3AF"
                    fontWeight="500"
                  >
                    {degInSign}°{signSymbol}
                  </text>
                </g>
              );
            });
          })()}

          {/* === ANGLE MARKERS (ASC, DSC, MC, IC) === */}
          {(() => {
            const angles: { label: string; house: number; color: string }[] = [
              { label: 'ASC', house: 1, color: '#FF6B6B' },
              { label: 'DSC', house: 7, color: '#6B9FFF' },
              { label: 'MC', house: 10, color: '#6BFF9F' },
              { label: 'IC', house: 4, color: '#FFB86B' },
            ];
            return angles.map(({ label, house, color }) => {
              const h = data.houses.find(h => h.house === house);
              if (!h) return null;
              const angle = getHouseLongitude(h);
              const pos = polar(cx, cy, zodiacOuter + 12, angle);
              return (
                <g key={`angle-${label}`}>
                  <text
                    x={pos.x} y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={size * 0.022}
                    fill={color}
                    fontWeight="bold"
                  >
                    {label}
                  </text>
                </g>
              );
            });
          })()}

        </g>{/* end rotation group */}

        {/* Center decoration */}
        <circle cx={cx} cy={cy} r={size * 0.015} fill="#1a1035" stroke="#6366F1" strokeWidth="1" />
      </svg>
    </div>
  );
}

// Legend component
export function ChartWheelLegend() {
  const legendPlanets = Object.entries(PLANET_SYMBOLS).filter(([k]) => !['chiron','northnode','southnode'].includes(k));
  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" role="region" aria-label="Chart legend">
      <div>
        <h4 className="font-semibold text-white mb-2">Aspects</h4>
        <ul className="space-y-1" role="list">
          <li className="flex items-center gap-2">
            <span className="text-lg" style={{ color: ASPECT_COLORS.conjunction }} aria-hidden="true">☌</span>
            <span className="text-slate-200">Conjunction (10°)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-lg" style={{ color: ASPECT_COLORS.opposition }} aria-hidden="true">☍</span>
            <span className="text-slate-200">Opposition (8°)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-lg" style={{ color: ASPECT_COLORS.trine }} aria-hidden="true">△</span>
            <span className="text-slate-200">Trine (8°)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-lg" style={{ color: ASPECT_COLORS.square }} aria-hidden="true">□</span>
            <span className="text-slate-200">Square (8°)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-lg" style={{ color: ASPECT_COLORS.sextile }} aria-hidden="true">⚹</span>
            <span className="text-slate-200">Sextile (6°)</span>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-white mb-2">Planets</h4>
        <ul className="space-y-1">
          {legendPlanets.slice(0, 5).map(([key, sym]) => (
            <li key={key} className="flex items-center gap-2">
              <span style={{ color: PLANET_COLORS_MAP[key] }} aria-hidden="true">{sym}</span>
              <span className="text-slate-200">{PLANET_NAMES[key]}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-white mb-2">&nbsp;</h4>
        <ul className="space-y-1" role="list">
          {legendPlanets.slice(5).map(([key, sym]) => (
            <li key={key} className="flex items-center gap-2">
              <span style={{ color: PLANET_COLORS_MAP[key] }} aria-hidden="true">{sym}</span>
              <span className="text-slate-200">{PLANET_NAMES[key]}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-white mb-2">Zodiac Signs</h4>
        <ul className="grid grid-cols-2 gap-x-2 gap-y-1" role="list">
          {ZODIAC_NAMES.map((name, i) => (
            <li key={name} className="flex items-center gap-1" aria-label={`${name.toLowerCase()} ${ZODIAC_SYMBOLS[i]}`}>
              <span aria-hidden="true">{ZODIAC_SYMBOLS[i]}</span>
              <span className="text-slate-200 text-xs">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
