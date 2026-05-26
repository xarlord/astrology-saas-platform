/**
 * Professional Natal Chart Wheel Component
 *
 * Layout (outside → inside):
 * 1. Degree tick marks on outer edge
 * 2. Zodiac ring: 12 colored 30° segments with zodiac symbols
 * 3. House cusp lines extending inward, house numbers (1-12) at outer ring
 * 4. Planet symbols between zodiac ring and inner circle (no overlap)
 * 5. Aspect lines inside the inner circle
 * 6. ASC/DSC/MC/IC angle markers
 *
 * Convention: Top of circle = 10/11 house boundary (MC region).
 * ASC at left (9 o'clock).
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

const degToRad = (deg: number) => (deg * Math.PI) / 180;

const polar = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = degToRad(angleDeg - 90);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

function getPlanetLongitude(p: PlanetPosition): number {
  if (p.longitude !== undefined && p.longitude > 0) return p.longitude;
  const signIdx = ZODIAC_NAMES.findIndex(n => n.toLowerCase() === p.sign?.toLowerCase());
  const signStart = signIdx >= 0 ? signIdx * 30 : 0;
  return signStart + (p.degree ?? 0) + (p.minute ?? 0) / 60 + (p.second ?? 0) / 3600;
}

function getHouseLongitude(h: HouseCusp): number {
  if (h.cusp !== undefined && h.cusp > 0) return h.cusp;
  const signIdx = ZODIAC_NAMES.findIndex(n => n.toLowerCase() === h.sign?.toLowerCase());
  const signStart = signIdx >= 0 ? signIdx * 30 : 0;
  return signStart + (h.degree ?? 0) + (h.minute ?? 0) / 60 + (h.second ?? 0) / 3600;
}

// Spread overlapping planets apart so symbols don't overlap
function resolveOverlaps(
  planets: PlanetPosition[],
  minGapDeg: number,
): { angle: number; planet: PlanetPosition }[] {
  const items = planets.map(p => ({ lon: getPlanetLongitude(p), planet: p }))
    .sort((a, b) => a.lon - b.lon);

  const angles = items.map(i => i.lon);
  const n = angles.length;
  // Iterative spreading
  for (let pass = 0; pass < 5; pass++) {
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      let gap = angles[next] - angles[i];
      if (gap < 0) gap += 360;
      if (gap < minGapDeg) {
        const shift = (minGapDeg - gap) / 2;
        angles[i] = (angles[i] - shift + 360) % 360;
        angles[next] = (angles[next] + shift) % 360;
      }
    }
  }

  return items.map((item, i) => ({ angle: angles[i], planet: item.planet }));
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

  // Ring radii (outside → inside) — with generous spacing
  const outerEdge = size * 0.48;         // Outermost boundary
  const tickOuter = outerEdge;
  const zodiacOuter = outerEdge - 8;     // Zodiac ring outer
  const zodiacInner = size * 0.37;       // Zodiac ring inner
  const planetOuter = zodiacInner - 4;   // Planet zone outer
  const planetInner = size * 0.27;       // Planet zone inner
  const planetRadius = (planetOuter + planetInner) / 2;
  const houseLineOuter = zodiacInner;
  const houseLineInner = size * 0.24;    // House lines stop here
  const innerCircle = houseLineInner;    // Inner boundary (aspect area)
  const aspectRadius = innerCircle * 0.82;
  const houseLabelRadius = outerEdge + 14; // House numbers OUTSIDE the ring

  // Ascendant = house 1 cusp
  const ascendant = data.houses.length > 0 ? getHouseLongitude(data.houses[0]) : 0;

  // Rotation: ASC at left (9 o'clock = 180° in SVG coords)
  const wheelRotation = 180 - ascendant;

  // Calculate MC (house 10 cusp) for angle labels
  const mcHouse = data.houses.find(h => h.house === 10);
  const mcLongitude = mcHouse ? getHouseLongitude(mcHouse) : undefined;

  // Compute house boundaries for placing numbers
  const houseAngles = data.houses.map(h => getHouseLongitude(h));

  return (
    <div className="flex justify-center items-center">
      {/* Screen reader text */}
      <div className="sr-only" role="region" aria-label="Chart data in text format">
        <h2>Astrological Chart</h2>
        <h3>Planets</h3>
        <ul>
          {planets.map(p => {
            const name = PLANET_NAMES[p.planet] || p.planet;
            return <li key={p.planet}>{name} in {p.sign} {p.degree}°{p.minute}' House {p.house}{p.retrograde ? ' (R)' : ''}</li>;
          })}
        </ul>
        <h3>Houses</h3>
        <ul>
          {data.houses.map(h => <li key={h.house}>House {h.house}: {h.sign} {h.degree}°{h.minute}'</li>)}
        </ul>
        <h3>Aspects</h3>
        <ul>
          {data.aspects.map((a, i) => <li key={i}>{PLANET_NAMES[a.planet1] || a.planet1} {a.type} {PLANET_NAMES[a.planet2] || a.planet2}</li>)}
        </ul>
      </div>

      <svg
        role="img"
        aria-label={`Natal chart wheel with ${planets.length} planets`}
        data-testid="chart-wheel"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full h-auto"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        <defs>
          <filter id="pglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ===== ROTATION GROUP: ASC at 9 o'clock ===== */}
        <g transform={`rotate(${wheelRotation}, ${cx}, ${cy})`}>

          {/* === OUTER BOUNDARY CIRCLE === */}
          <circle cx={cx} cy={cy} r={zodiacOuter} fill="none" stroke="#2a1f4e" strokeWidth="1.5" />

          {/* === DEGREE TICK MARKS === */}
          {Array.from({ length: 360 }, (_, i) => {
            const isSign = i % 30 === 0;
            const is5 = i % 5 === 0;
            if (!isSign && !is5) return null;
            const len = isSign ? 8 : 4;
            const p1 = polar(cx, cy, tickOuter, i);
            const p2 = polar(cx, cy, tickOuter - len, i);
            return (
              <line key={`t${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke={isSign ? '#818CF8' : '#3d2d6b'} strokeWidth={isSign ? 1.5 : 0.5} />
            );
          })}

          {/* === ZODIAC RING === */}
          <circle cx={cx} cy={cy} r={zodiacInner} fill="none" stroke="#2a1f4e" strokeWidth="1" />

          {ZODIAC_NAMES.map((name, i) => {
            const sa = i * 30, ea = (i + 1) * 30, ma = sa + 15;
            const s1 = polar(cx, cy, zodiacOuter, sa), s2 = polar(cx, cy, zodiacOuter, ea);
            const e1 = polar(cx, cy, zodiacInner, sa), e2 = polar(cx, cy, zodiacInner, ea);
            const lp = polar(cx, cy, (zodiacOuter + zodiacInner) / 2, ma);
            const bg = i % 2 === 0 ? '#1e1538' : '#16102a';
            const sc = ZODIAC_COLORS[name as keyof typeof ZODIAC_COLORS] ?? '#9CA3AF';

            return (
              <g key={`z${name}`} aria-label={`${name.toLowerCase()} zodiac sign`}>
                <path d={`M ${s1.x} ${s1.y} A ${zodiacOuter} ${zodiacOuter} 0 0 1 ${s2.x} ${s2.y} L ${e2.x} ${e2.y} A ${zodiacInner} ${zodiacInner} 0 0 0 ${e1.x} ${e1.y} Z`}
                  fill={bg} stroke="#3d2d6b" strokeWidth="0.5" />
                <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central"
                  fontSize={size * 0.04} fill={sc} fontWeight="bold">{ZODIAC_SYMBOLS[i]}</text>
              </g>
            );
          })}

          {/* === HOUSE CUSP LINES === */}
          {data.houses.map((house) => {
            const angle = getHouseLongitude(house);
            const outer = polar(cx, cy, houseLineOuter, angle);
            const inner = polar(cx, cy, houseLineInner, angle);
            const isAngle = [1, 4, 7, 10].includes(house.house);
            return (
              <line key={`hl${house.house}`} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y}
                stroke={isAngle ? '#818CF8' : '#4a3d7a'}
                strokeWidth={isAngle ? 2.5 : 1} opacity={isAngle ? 1 : 0.5} />
            );
          })}

          {/* === INNER CIRCLE === */}
          <circle cx={cx} cy={cy} r={innerCircle} fill="none" stroke="#2a1f4e" strokeWidth="1" />

          {/* === ASPECT LINES (inside inner circle) === */}
          {data.aspects.map((aspect, idx) => {
            const p1 = planets.find(p => p.planet === aspect.planet1);
            const p2 = planets.find(p => p.planet === aspect.planet2);
            if (!p1 || !p2) return null;
            const a1 = getPlanetLongitude(p1), a2 = getPlanetLongitude(p2);
            const s = polar(cx, cy, aspectRadius, a1), e = polar(cx, cy, aspectRadius, a2);
            const color = ASPECT_COLORS[aspect.type] || '#888';
            const isDashed = ['quincunx', 'semi-sextile', 'semisextile'].includes(aspect.type);
            const w = ['conjunction', 'opposition'].includes(aspect.type) ? 1.5 : 1;
            return (
              <g key={`as${idx}`}
                onClick={interactive ? () => onAspectClick?.(aspect) : undefined}
                className={interactive ? 'cursor-pointer' : ''}
                role="img" aria-label={`${PLANET_NAMES[aspect.planet1] || aspect.planet1} ${aspect.type} ${PLANET_NAMES[aspect.planet2] || aspect.planet2}`}>
                <line x1={s.x} y1={s.y} x2={e.x} y2={e.y}
                  stroke={color} strokeWidth={w} opacity={0.45}
                  strokeDasharray={isDashed ? '4,2' : 'none'} />
              </g>
            );
          })}

          {/* === PLANETS (between zodiac ring and inner circle) === */}
          {(() => {
            const placed = resolveOverlaps(planets, 10); // 10° minimum gap
            return placed.map(({ angle, planet }) => {
              const sym = PLANET_SYMBOLS[planet.planet];
              if (!sym) return null;
              const color = PLANET_COLORS_MAP[planet.planet] || '#C084FC';
              const lon = getPlanetLongitude(planet);
              const signIdx = Math.floor(lon / 30);
              const degInSign = Math.round(lon % 30);
              const signSym = ZODIAC_SYMBOLS[signIdx] || '';

              const pos = polar(cx, cy, planetRadius, angle);

              // Degree label: push radially outward from center
              const labelR = planetRadius + size * 0.028;
              const labelPos = polar(cx, cy, labelR, angle);
              const dx = labelPos.x - cx, dy = labelPos.y - cy;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const nx = dx / dist, ny = dy / dist;

              return (
                <g key={`pl-${planet.planet}`}
                  data-testid={`planet-${planet.planet}`}
                  onClick={interactive ? () => onPlanetClick?.(planet.planet) : undefined}
                  className={interactive ? 'cursor-pointer' : ''}
                  role="img"
                  aria-label={`${PLANET_NAMES[planet.planet] || planet.planet} in ${planet.sign} ${degInSign}°`}
                  filter="url(#pglow)">
                  <circle cx={pos.x} cy={pos.y} r={size * 0.02}
                    fill={color} stroke="#0d0a1a" strokeWidth="1.5" opacity={0.95} />
                  <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
                    fontSize={size * 0.022} fill="#FFF" fontWeight="bold">{sym}</text>
                  {planet.retrograde && (
                    <text x={pos.x + size * 0.014} y={pos.y - size * 0.014}
                      textAnchor="start" dominantBaseline="central"
                      fontSize={size * 0.012} fill="#FF6B6B" fontWeight="bold">R</text>
                  )}
                  {/* Degree + sign label outside planet */}
                  <text x={pos.x + nx * size * 0.022} y={pos.y + ny * size * 0.022}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize={size * 0.014} fill="#9CA3AF" fontWeight="500">
                    {degInSign}°{signSym}
                  </text>
                </g>
              );
            });
          })()}

        </g>{/* end rotation group */}

        {/* === HOUSE NUMBERS (OUTSIDE wheel, in fixed position — not rotating) === */}
        {/* These stay fixed so top = between house 10 and 11 */}
        {(() => {
          // We need the house midpoints in the *rotated* coordinate system
          // so we manually apply the rotation to each midpoint angle
          return data.houses.map((house, i) => {
            const nextHouse = data.houses[(i + 1) % data.houses.length];
            let midAngle = getHouseLongitude(house);
            let nextAngle = getHouseLongitude(nextHouse);
            // Handle wrap-around
            if (nextAngle < midAngle) nextAngle += 360;
            midAngle = (midAngle + nextAngle) / 2;
            // Apply wheel rotation
            midAngle = (midAngle + wheelRotation) % 360;

            const pos = polar(cx, cy, houseLabelRadius, midAngle);
            return (
              <text key={`hn${house.house}`}
                x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.026} fill="#818CF8" fontWeight="700">
                {house.house}
              </text>
            );
          });
        })()}

        {/* === ANGLE LABELS (fixed position, outside ring) === */}
        {(() => {
          const angles: { label: string; house: number; color: string }[] = [
            { label: 'ASC', house: 1, color: '#FF6B6B' },
            { label: 'DSC', house: 7, color: '#6B9FFF' },
            { label: 'MC', house: 10, color: '#6BFF9F' },
            { label: 'IC', house: 4, color: '#FFB86B' },
          ];
          return angles.map(({ label, house, color }) => {
            const h = data.houses.find(x => x.house === house);
            if (!h) return null;
            let angle = getHouseLongitude(h);
            angle = (angle + wheelRotation) % 360;
            const pos = polar(cx, cy, houseLabelRadius + 14, angle);
            return (
              <text key={`a-${label}`} x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.022} fill={color} fontWeight="bold">
                {label}
              </text>
            );
          });
        })()}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={size * 0.012} fill="#1a1035" stroke="#6366F1" strokeWidth="1" />
      </svg>
    </div>
  );
}

export function ChartWheelLegend() {
  const legendPlanets = Object.entries(PLANET_SYMBOLS).filter(([k]) => !['chiron','northnode','southnode'].includes(k));
  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" role="region" aria-label="Chart legend">
      <div>
        <h4 className="font-semibold text-white mb-2">Aspects</h4>
        <ul className="space-y-1" role="list">
          <li className="flex items-center gap-2">
            <span className="text-lg" style={{ color: ASPECT_COLORS.conjunction }}>☌</span>
            <span className="text-slate-200">Conjunction (10°)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-lg" style={{ color: ASPECT_COLORS.opposition }}>☍</span>
            <span className="text-slate-200">Opposition (8°)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-lg" style={{ color: ASPECT_COLORS.trine }}>△</span>
            <span className="text-slate-200">Trine (8°)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-lg" style={{ color: ASPECT_COLORS.square }}>□</span>
            <span className="text-slate-200">Square (8°)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-lg" style={{ color: ASPECT_COLORS.sextile }}>⚹</span>
            <span className="text-slate-200">Sextile (6°)</span>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-white mb-2">Planets</h4>
        <ul className="space-y-1">
          {legendPlanets.slice(0, 5).map(([key, sym]) => (
            <li key={key} className="flex items-center gap-2">
              <span style={{ color: PLANET_COLORS_MAP[key] }}>{sym}</span>
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
              <span style={{ color: PLANET_COLORS_MAP[key] }}>{sym}</span>
              <span className="text-slate-200">{PLANET_NAMES[key]}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-white mb-2">Zodiac Signs</h4>
        <ul className="grid grid-cols-2 gap-x-2 gap-y-1" role="list">
          {ZODIAC_NAMES.map((name, i) => (
            <li key={name} className="flex items-center gap-1">
              <span aria-hidden="true">{ZODIAC_SYMBOLS[i]}</span>
              <span className="text-slate-200 text-xs">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
