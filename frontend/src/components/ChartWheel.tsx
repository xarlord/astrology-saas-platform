/**
 * Professional Natal Chart Wheel Component
 *
 * All text (zodiac symbols, planet labels, degree annotations, house numbers)
 * stays upright and never rotates with the wheel.
 *
 * Layout (outside → inside):
 * 1. Degree tick marks + degree labels on outer edge (upright)
 * 2. Zodiac ring: 12 segments with zodiac symbols + degree annotations (upright)
 * 3. House cusp lines, house numbers (1-12) outside ring (upright)
 * 4. Planet symbols between zodiac ring and inner circle (upright, no overlap)
 * 5. Aspect lines inside inner circle
 * 6. ASC/DSC/MC/IC angle markers (upright)
 */

import type { PlanetPosition, HouseCusp, Aspect, ChartData } from '../types/chart.types';
import { PLANET_COLORS, ASPECT_COLORS as ASPECT_COLORS_TOKEN, ZODIAC_COLORS } from '../utils/design-tokens';
export type { PlanetPosition, HouseCusp, Aspect, ChartData } from '../types/chart.types';

function normalizePlanets(planets: ChartData['planets']): PlanetPosition[] {
  if (Array.isArray(planets)) return planets;
  return Object.entries(planets).map(([name, p]) => ({
    planet: name, sign: p.sign, degree: p.degree, minute: p.minute,
    second: p.second ?? 0, house: p.house, retrograde: p.isRetrograde ?? false,
    latitude: p.latitude, longitude: p.longitude, speed: p.speed,
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
  ...ASPECT_COLORS_TOKEN, 'semi-sextile': '#888888', 'semisextile': '#888888',
  square: '#FF6600', sextile: '#00BFFF', quincunx: '#9932CC',
  conjunction: '#FFD700', opposition: '#FF4444', trine: '#00FF88',
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
  const si = ZODIAC_NAMES.findIndex(n => n.toLowerCase() === p.sign?.toLowerCase());
  return (si >= 0 ? si * 30 : 0) + (p.degree ?? 0) + (p.minute ?? 0) / 60 + (p.second ?? 0) / 3600;
}
function getHouseLongitude(h: HouseCusp): number {
  if (h.cusp !== undefined && h.cusp > 0) return h.cusp;
  const si = ZODIAC_NAMES.findIndex(n => n.toLowerCase() === h.sign?.toLowerCase());
  return (si >= 0 ? si * 30 : 0) + (h.degree ?? 0) + (h.minute ?? 0) / 60 + (h.second ?? 0) / 3600;
}

function resolveOverlaps(planets: PlanetPosition[], minGap: number) {
  const items = planets.map(p => ({ lon: getPlanetLongitude(p), planet: p })).sort((a, b) => a.lon - b.lon);
  const angles = items.map(i => i.lon);
  const n = angles.length;
  for (let pass = 0; pass < 5; pass++) {
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      let gap = angles[next] - angles[i];
      if (gap < 0) gap += 360;
      if (gap < minGap) {
        const shift = (minGap - gap) / 2;
        angles[i] = (angles[i] - shift + 360) % 360;
        angles[next] = (angles[next] + shift) % 360;
      }
    }
  }
  return items.map((item, i) => ({ angle: angles[i], planet: item.planet }));
}

/** Apply wheel rotation to an ecliptic longitude to get screen angle */
function toScreen(eclipticDeg: number, wheelRot: number): number {
  return (eclipticDeg + wheelRot) % 360;
}

export function ChartWheel({
  data, size = 600, interactive = true, onPlanetClick, onAspectClick,
}: ChartWheelProps) {
  const planets = normalizePlanets(data.planets);
  const cx = size / 2, cy = size / 2;

  // Ring radii
  const outerEdge = size * 0.46;
  const zodiacOuter = outerEdge;
  const zodiacInner = size * 0.35;
  const planetOuter = zodiacInner - 6;
  const planetInner = size * 0.24;
  const planetMid = (planetOuter + planetInner) / 2;
  const innerCircle = size * 0.22;
  const aspectRadius = innerCircle * 0.82;
  const labelRadius = outerEdge + 16;  // house numbers & angles
  const angleLabelRadius = outerEdge + 30; // ASC/DSC/MC/IC

  const ascendant = data.houses.length > 0 ? getHouseLongitude(data.houses[0]) : 0;
  const rot = 180 - ascendant; // ASC → 9 o'clock

  return (
    <div className="flex justify-center items-center">
      {/* Screen reader text */}
      <div className="sr-only" role="region" aria-label="Chart data">
        <h2>Natal Chart</h2>
        <h3>Planets</h3>
        <ul>{planets.map(p => <li key={p.planet}>{PLANET_NAMES[p.planet] || p.planet} in {p.sign} {p.degree}°{p.minute}'{p.retrograde ? ' R' : ''}</li>)}</ul>
        <h3>Houses</h3>
        <ul>{data.houses.map(h => <li key={h.house}>House {h.house}: {h.sign} {h.degree}°{p.minute}'</li>)}</ul>
      </div>

      <svg
        role="img" aria-label={`Natal chart wheel with ${planets.length} planets`}
        data-testid="chart-wheel" width={size} height={size}
        viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        <defs>
          <filter id="pglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ========== ROTATED GROUP: paths & lines only ========== */}
        <g transform={`rotate(${rot}, ${cx}, ${cy})`}>

          {/* Zodiac ring background */}
          <circle cx={cx} cy={cy} r={zodiacOuter} fill="none" stroke="#2a1f4e" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={zodiacInner} fill="none" stroke="#2a1f4e" strokeWidth="1" />

          {/* Zodiac segments (paths only, no text) */}
          {ZODIAC_NAMES.map((name, i) => {
            const sa = i * 30, ea = (i + 1) * 30;
            const s1 = polar(cx, cy, zodiacOuter, sa), s2 = polar(cx, cy, zodiacOuter, ea);
            const e1 = polar(cx, cy, zodiacInner, sa), e2 = polar(cx, cy, zodiacInner, ea);
            const bg = i % 2 === 0 ? '#1e1538' : '#16102a';
            return (
              <path key={`z${name}`}
                d={`M ${s1.x} ${s1.y} A ${zodiacOuter} ${zodiacOuter} 0 0 1 ${s2.x} ${s2.y} L ${e2.x} ${e2.y} A ${zodiacInner} ${zodiacInner} 0 0 0 ${e1.x} ${e1.y} Z`}
                fill={bg} stroke="#3d2d6b" strokeWidth="0.5" />
            );
          })}

          {/* Degree tick marks */}
          {Array.from({ length: 360 }, (_, i) => {
            const isSign = i % 30 === 0, is5 = i % 5 === 0;
            if (!isSign && !is5) return null;
            const len = isSign ? 8 : 4;
            const p1 = polar(cx, cy, zodiacOuter, i), p2 = polar(cx, cy, zodiacOuter - len, i);
            return <line key={`t${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={isSign ? '#818CF8' : '#3d2d6b'} strokeWidth={isSign ? 1.5 : 0.5} />;
          })}

          {/* House cusp lines */}
          {data.houses.map(house => {
            const angle = getHouseLongitude(house);
            const outer = polar(cx, cy, zodiacInner, angle);
            const inner = polar(cx, cy, innerCircle, angle);
            const isAngle = [1, 4, 7, 10].includes(house.house);
            return (
              <line key={`hl${house.house}`} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y}
                stroke={isAngle ? '#818CF8' : '#4a3d7a'}
                strokeWidth={isAngle ? 2.5 : 1} opacity={isAngle ? 1 : 0.5} />
            );
          })}

          {/* Inner circle */}
          <circle cx={cx} cy={cy} r={innerCircle} fill="none" stroke="#2a1f4e" strokeWidth="1" />

          {/* Aspect lines */}
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
                  stroke={color} strokeWidth={w} opacity={0.4}
                  strokeDasharray={isDashed ? '4,2' : 'none'} />
              </g>
            );
          })}
        </g>{/* end rotated group */}

        {/* ========== UPRIGHT TEXT (never rotated) ========== */}

        {/* Zodiac symbols + degree annotations — upright */}
        {ZODIAC_NAMES.map((name, i) => {
          const midEcliptic = i * 30 + 15; // midpoint of sign in ecliptic degrees
          const screenAngle = toScreen(midEcliptic, rot);
          const midR = (zodiacOuter + zodiacInner) / 2;
          const pos = polar(cx, cy, midR, screenAngle);
          const signColor = ZODIAC_COLORS[name as keyof typeof ZODIAC_COLORS] ?? '#9CA3AF';

          // Degree annotation at the start of the sign
          const startEcliptic = i * 30;
          const startScreen = toScreen(startEcliptic, rot);
          const degPos = polar(cx, cy, zodiacOuter - 14, startScreen);

          return (
            <g key={`zt-${name}`}>
              {/* Zodiac symbol */}
              <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.042} fill={signColor} fontWeight="bold">
                {ZODIAC_SYMBOLS[i]}
              </text>
              {/* Degree annotation at sign boundary */}
              <text x={degPos.x} y={degPos.y} textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.015} fill="#6B7280" fontWeight="500">
                {startEcliptic}°
              </text>
            </g>
          );
        })}

        {/* Planet symbols + degree labels — upright */}
        {(() => {
          const placed = resolveOverlaps(planets, 10);
          return placed.map(({ angle, planet }) => {
            const sym = PLANET_SYMBOLS[planet.planet];
            if (!sym) return null;
            const color = PLANET_COLORS_MAP[planet.planet] || '#C084FC';
            const lon = getPlanetLongitude(planet);
            const signIdx = Math.floor(lon / 30);
            const degInSign = Math.round(lon % 30);
            const signSym = ZODIAC_SYMBOLS[signIdx] || '';

            const screenAngle = toScreen(angle, rot);
            const pos = polar(cx, cy, planetMid, screenAngle);

            // Degree label: push radially outward
            const dx = pos.x - cx, dy = pos.y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = dx / dist, ny = dy / dist;
            const labelX = pos.x + nx * size * 0.028;
            const labelY = pos.y + ny * size * 0.028;

            return (
              <g key={`pl-${planet.planet}`}
                data-testid={`planet-${planet.planet}`}
                onClick={interactive ? () => onPlanetClick?.(planet.planet) : undefined}
                className={interactive ? 'cursor-pointer' : ''}
                role="img" aria-label={`${PLANET_NAMES[planet.planet]} in ${planet.sign} ${degInSign}°`}
                filter="url(#pglow)">
                <circle cx={pos.x} cy={pos.y} r={size * 0.02}
                  fill={color} stroke="#0d0a1a" strokeWidth="1.5" opacity={0.95} />
                <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
                  fontSize={size * 0.022} fill="#FFF" fontWeight="bold">{sym}</text>
                {planet.retrograde && (
                  <text x={pos.x + size * 0.015} y={pos.y - size * 0.015}
                    textAnchor="start" dominantBaseline="central"
                    fontSize={size * 0.012} fill="#FF6B6B" fontWeight="bold">R</text>
                )}
                {/* Degree + sign label (upright) */}
                <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="central"
                  fontSize={size * 0.014} fill="#9CA3AF" fontWeight="500">
                  {degInSign}°{signSym}
                </text>
              </g>
            );
          });
        })()}

        {/* House numbers (1-12) — upright, outside ring */}
        {data.houses.map((house, i) => {
          const nextHouse = data.houses[(i + 1) % data.houses.length];
          let midAngle = getHouseLongitude(house);
          let nextAngle = getHouseLongitude(nextHouse);
          if (nextAngle < midAngle) nextAngle += 360;
          midAngle = (midAngle + nextAngle) / 2;
          const screenAngle = toScreen(midAngle, rot);
          const pos = polar(cx, cy, labelRadius, screenAngle);
          return (
            <text key={`hn${house.house}`} x={pos.x} y={pos.y}
              textAnchor="middle" dominantBaseline="central"
              fontSize={size * 0.028} fill="#818CF8" fontWeight="700">
              {house.house}
            </text>
          );
        })}

        {/* Angle labels: ASC, DSC, MC, IC — upright */}
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
            const screenAngle = toScreen(getHouseLongitude(h), rot);
            const pos = polar(cx, cy, angleLabelRadius, screenAngle);
            return (
              <text key={`a-${label}`} x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.024} fill={color} fontWeight="bold">
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
        <ul className="space-y-1">
          <li className="flex items-center gap-2"><span className="text-lg" style={{ color: ASPECT_COLORS.conjunction }}>☌</span><span className="text-slate-200">Conjunction (10°)</span></li>
          <li className="flex items-center gap-2"><span className="text-lg" style={{ color: ASPECT_COLORS.opposition }}>☍</span><span className="text-slate-200">Opposition (8°)</span></li>
          <li className="flex items-center gap-2"><span className="text-lg" style={{ color: ASPECT_COLORS.trine }}>△</span><span className="text-slate-200">Trine (8°)</span></li>
          <li className="flex items-center gap-2"><span className="text-lg" style={{ color: ASPECT_COLORS.square }}>□</span><span className="text-slate-200">Square (8°)</span></li>
          <li className="flex items-center gap-2"><span className="text-lg" style={{ color: ASPECT_COLORS.sextile }}>⚹</span><span className="text-slate-200">Sextile (6°)</span></li>
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
        <ul className="space-y-1">
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
        <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
          {ZODIAC_NAMES.map((name, i) => (
            <li key={name} className="flex items-center gap-1">
              <span>{ZODIAC_SYMBOLS[i]}</span>
              <span className="text-slate-200 text-xs">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
