/**
 * Professional Natal Chart Wheel Component
 *
 * All text stays upright — never rotates with the wheel.
 * ASC at LEFT (9 o'clock), houses progress COUNTER-CLOCKWISE.
 *
 * Layout (outside → inside):
 * 1. House numbers (1-12) + angle labels (ASC/DSC/MC/IC) — outermost, upright
 * 2. Degree tick marks + degree labels on outer edge
 * 3. Zodiac ring: 12 colored 30° segments with zodiac symbols (upright)
 * 4. House cusp lines extending inward
 * 5. Planet symbols between zodiac ring and inner circle (upright, no overlap)
 * 6. Aspect lines inside inner circle
 */

import type { PlanetPosition, HouseCusp, Aspect, ChartData } from '../types/chart.types';
import { PLANET_COLORS, ASPECT_COLORS as ASPECT_COLORS_TOKEN, ZODIAC_COLORS } from '../utils/design-tokens';
import { PLANET_SYMBOLS_LOWER as BASE_PLANET_SYMBOLS } from '../utils/astrology/planetPosition';
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
  ...BASE_PLANET_SYMBOLS,
  asc: '\u2191', dsc: '\u2193', mc: '\u2297', ic: '\u2258',
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

/** Convert polar (angle in SVG coords: 0°=TOP, CW) to Cartesian */
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

/**
 * All drawing is done in screen space (no CSS rotate on a group).
 * toScreen converts an ecliptic longitude to a screen angle.
 *
 * SVG polar: 0°=TOP, 90°=RIGHT, 180°=BOTTOM, 270°=LEFT.
 *
 * Traditional chart layout:
 *   ASC at LEFT (270°), houses progress CCW (upward from left).
 *   toScreen(ASC) = 270°  →  rot = 270 - ASC
 *   toScreen(H2_ecl) = toScreen(ASC_ecl + 30) = 270 - 30 = 240° (UPPER-LEFT) ✓ CCW
 */
function toScreen(eclipticDeg: number, wheelRot: number): number {
  return ((wheelRot - eclipticDeg) % 360 + 360) % 360;
}

/** Spread overlapping angles apart so labels don't collide */
function spreadAngles(angles: number[], minGapDeg: number): number[] {
  const result = [...angles];
  const n = result.length;
  for (let pass = 0; pass < 8; pass++) {
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      let gap = result[next] - result[i];
      if (gap < 0) gap += 360;
      if (gap < minGapDeg) {
        const shift = (minGapDeg - gap) / 2;
        result[i] = (result[i] - shift + 360) % 360;
        result[next] = (result[next] + shift) % 360;
      }
    }
  }
  return result;
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

export function ChartWheel({
  data, size = 720, interactive = true, onPlanetClick, onAspectClick,
}: ChartWheelProps) {
  const planets = normalizePlanets(data.planets);

  const pad = 28;
  const totalSize = size + pad * 2;
  const cx = totalSize / 2, cy = totalSize / 2;

  const outerEdge = size * 0.46;
  const zodiacOuter = outerEdge;
  const zodiacInner = size * 0.37;
  const planetOuter = zodiacInner - 8;
  const planetInner = size * 0.24;
  const planetMid = (planetOuter + planetInner) / 2;
  const innerCircle = size * 0.22;
  const aspectRadius = innerCircle * 0.82;

  const houseNumRadius = outerEdge + 16;
  const angleRingRadius = innerCircle + size * 0.02; // one ring inside inner circle

  const ascendant = data.houses.length > 0 ? getHouseLongitude(data.houses[0]) : 0;
  const ascSignIndex = Math.floor(ascendant / 30);
  const _ascSignStart = ascSignIndex * 30;
  // toScreen(ecl, rot) = (rot - ecl). For ASC at 270°(LEFT): rot = 270 + ASC.
  const rot = 270 + ascendant;

  // House midpoints for number placement
  const houseMidAngles = data.houses.map((_, i) => {
    const signStart = ((ascSignIndex + i) % 12) * 30;
    return toScreen(signStart + 15, rot);
  });
  const spreadHouseAngles = spreadAngles(houseMidAngles, 22);

  // Helper: draw zodiac arc segment from startAngle to endAngle at radius r
  const _zodiacArc = (r: number, startA: number, endA: number, sweep: 0 | 1 = 1) => {
    const p1 = polar(cx, cy, r, startA);
    const p2 = polar(cx, cy, r, endA);
    return { p1, p2, d: `A ${r} ${r} 0 0 ${sweep} ${p2.x} ${p2.y}` };
  };

  return (
    <div className="flex justify-center items-center">
      <div className="sr-only" role="region" aria-label="Chart data">
        <h2>Natal Chart</h2>
        <h3>Planets</h3>
        <ul>{planets.map(p => <li key={p.planet}>{PLANET_NAMES[p.planet] || p.planet} in {p.sign} {p.degree}°{p.minute}'{p.retrograde ? ' R' : ''}</li>)}</ul>
        <h3>Houses</h3>
        <ul>{data.houses.map(h => <li key={h.house}>House {h.house}: {h.sign} {h.degree}°{h.minute}'</li>)}</ul>
      </div>

      <svg
        role="img" aria-label={`Natal chart wheel with ${planets.length} planets`}
        data-testid="chart-wheel"
        viewBox={`0 0 ${totalSize} ${totalSize}`} className="w-full h-auto"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        <defs>
          <filter id="pglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ALL drawing in screen space — no CSS rotate group */}

        {/* Zodiac ring circles */}
        <circle cx={cx} cy={cy} r={zodiacOuter} fill="none" stroke="#2a1f4e" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={zodiacInner} fill="none" stroke="#2a1f4e" strokeWidth="1" />

        {/* Zodiac segment fills — drawn using toScreen for angles */}
        {ZODIAC_NAMES.map((name, i) => {
          const eclStart = i * 30;
          const eclEnd = (i + 1) * 30;
          const scrStart = toScreen(eclStart, rot);
          const scrEnd = toScreen(eclEnd, rot);
          const outer1 = polar(cx, cy, zodiacOuter, scrStart);
          const outer2 = polar(cx, cy, zodiacOuter, scrEnd);
          const inner2 = polar(cx, cy, zodiacInner, scrEnd);
          const inner1 = polar(cx, cy, zodiacInner, scrStart);
          const bg = i % 2 === 0 ? '#1e1538' : '#16102a';
          return (
            <path key={`z${name}`}
              d={`M ${outer1.x} ${outer1.y} A ${zodiacOuter} ${zodiacOuter} 0 0 0 ${outer2.x} ${outer2.y} L ${inner2.x} ${inner2.y} A ${zodiacInner} ${zodiacInner} 0 0 1 ${inner1.x} ${inner1.y} Z`}
              fill={bg} stroke="#3d2d6b" strokeWidth="0.5" />
          );
        })}

        {/* Degree tick marks */}
        {Array.from({ length: 72 }, (_, i) => {
          const ecl = i * 5;
          const scr = toScreen(ecl, rot);
          const isSign = ecl % 30 === 0;
          const len = isSign ? 8 : 4;
          const p1 = polar(cx, cy, zodiacOuter, scr);
          const p2 = polar(cx, cy, zodiacOuter - len, scr);
          return <line key={`t${ecl}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={isSign ? '#818CF8' : '#3d2d6b'} strokeWidth={isSign ? 1.5 : 0.5} />;
        })}

        {/* Inner circle */}
        <circle cx={cx} cy={cy} r={innerCircle} fill="none" stroke="#2a1f4e" strokeWidth="1" />

        {/* House cusp lines — drawn AFTER inner circle so they appear on top */}
        {data.houses.map((house, i) => {
          const signStart = ((ascSignIndex + i) % 12) * 30;
          const scr = toScreen(signStart, rot);
          const outer = polar(cx, cy, zodiacInner, scr);
          const inner = polar(cx, cy, innerCircle, scr);
          const isAngle = [1, 4, 7, 10].includes(house.house);
          return (
            <line key={`hl${house.house}`} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y}
              stroke={isAngle ? '#818CF8' : '#6d5faa'}
              strokeWidth={isAngle ? 2 : 1} opacity={isAngle ? 0.9 : 0.6} />
          );
        })}

        {/* Aspect lines — inside the inner circle */}
        {data.aspects.map((aspect, idx) => {
          const p1 = planets.find(p => p.planet === aspect.planet1);
          const p2 = planets.find(p => p.planet === aspect.planet2);
          if (!p1 || !p2) return null;
          const scr1 = toScreen(getPlanetLongitude(p1), rot);
          const scr2 = toScreen(getPlanetLongitude(p2), rot);
          const inner1 = polar(cx, cy, aspectRadius, scr1);
          const inner2 = polar(cx, cy, aspectRadius, scr2);
          const color = ASPECT_COLORS[aspect.type] || '#888';
          const isDashed = ['quincunx', 'semi-sextile', 'semisextile'].includes(aspect.type);
          const w = ['conjunction', 'opposition'].includes(aspect.type) ? 1.5 : 1;
          return (
            <g key={`as${idx}`}
              onClick={interactive ? () => onAspectClick?.(aspect) : undefined}
              className={interactive ? 'cursor-pointer' : ''}
              role="img" aria-label={`${PLANET_NAMES[aspect.planet1] || aspect.planet1} ${aspect.type} ${PLANET_NAMES[aspect.planet2] || aspect.planet2}`}>
              {/* Main aspect line across the inner circle */}
              <line x1={inner1.x} y1={inner1.y} x2={inner2.x} y2={inner2.y}
                stroke={color} strokeWidth={w} opacity={0.5}
                strokeDasharray={isDashed ? '4,2' : 'none'} />
            </g>
          );
        })}

        {/* ========== UPRIGHT TEXT ========== */}

        {/* Zodiac symbols — at their exact ecliptic start degree */}
        {ZODIAC_NAMES.map((name, i) => {
          const exactEcl = i * 30; // e.g. Aquarius = 300°
          const exactScr = toScreen(exactEcl, rot);
          const symbolR = zodiacOuter - size * 0.035;
          const pos = polar(cx, cy, symbolR, exactScr);
          const signColor = ZODIAC_COLORS[name as keyof typeof ZODIAC_COLORS] ?? '#9CA3AF';

          return (
            <text key={`zt-${name}`} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
              fontSize={size * 0.035} fill={signColor} fontWeight="bold">
              {ZODIAC_SYMBOLS[i]}
            </text>
          );
        })}

        {/* Planet symbols */}
        {(() => {
          const placed = resolveOverlaps(planets, 14);
          return placed.map(({ angle, planet }) => {
            const sym = PLANET_SYMBOLS[planet.planet];
            if (!sym) return null;
            const color = PLANET_COLORS_MAP[planet.planet] || '#C084FC';
            const lon = getPlanetLongitude(planet);
            const signIdx = Math.floor(lon / 30);
            const rawDeg = lon % 30;
            const degInSign = planet.degree ?? Math.floor(rawDeg);
            const _minInSign = planet.minute ?? Math.floor((rawDeg - Math.floor(rawDeg)) * 60 + 0.5);
            const signSym = ZODIAC_SYMBOLS[signIdx] || '';

            const scr = toScreen(angle, rot);
            const pos = polar(cx, cy, planetMid, scr);

            const dx = pos.x - cx, dy = pos.y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = dx / dist, ny = dy / dist;
            const labelX = pos.x + nx * size * 0.038;
            const labelY = pos.y + ny * size * 0.038;

            return (
              <g key={`pl-${planet.planet}`}
                data-testid={`planet-${planet.planet}`}
                onClick={interactive ? () => onPlanetClick?.(planet.planet) : undefined}
                className={interactive ? 'cursor-pointer' : ''}
                role="img" aria-label={`${PLANET_NAMES[planet.planet]} in ${planet.sign} ${degInSign}°`}
                filter="url(#pglow)">
                <circle cx={pos.x} cy={pos.y} r={size * 0.018}
                  fill={color} stroke="#0d0a1a" strokeWidth="1.5" opacity={0.95} />
                <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
                  fontSize={size * 0.02} fill="#FFF" fontWeight="bold">{sym}</text>
                {planet.retrograde && (
                  <text x={pos.x + size * 0.013} y={pos.y - size * 0.013}
                    textAnchor="start" dominantBaseline="central"
                    fontSize={size * 0.011} fill="#FF6B6B" fontWeight="bold">R</text>
                )}
                <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="central"
                  fontSize={size * 0.011} fill="#9CA3AF" fontWeight="500">
                  {degInSign}°{signSym}
                </text>
              </g>
            );
          });
        })()}

        {/* House numbers */}
        {data.houses.map((house, i) => {
          const scr = spreadHouseAngles[i];
          const pos = polar(cx, cy, houseNumRadius, scr);
          return (
            <text key={`hn${house.house}`} x={pos.x} y={pos.y}
              textAnchor="middle" dominantBaseline="central"
              fontSize={size * 0.032} fill="#818CF8" fontWeight="700">
              {house.house}
            </text>
          );
        })}

        {/* Angle labels — icons one ring inside the inner circle */}
        {(() => {
          const mcLon = data.midheaven ?? ((ascSignIndex + 9) % 12) * 30;
          const ascHouse = data.houses[0];
          const ascDeg = ascHouse?.degree ?? Math.floor(ascendant % 30);
          const ascMin = ascHouse?.minute ?? Math.floor(((ascendant % 30) - ascDeg) * 60 + 0.5);
          const dscLon = (ascendant + 180) % 360;
          const dscSignIdx = Math.floor(dscLon / 30) % 12;
          const dscDeg = Math.floor(dscLon % 30);
          const dscMin = Math.floor(((dscLon % 30) - dscDeg) * 60 + 0.5);
          const icLon = (mcLon + 180) % 360;
          const mcSignIdx = Math.floor(mcLon / 30) % 12;
          const mcDeg = Math.floor(mcLon % 30);
          const mcMin = Math.floor(((mcLon % 30) - mcDeg) * 60 + 0.5);
          const icSignIdx = Math.floor(icLon / 30) % 12;
          const icDeg = Math.floor(icLon % 30);
          const icMin = Math.floor(((icLon % 30) - icDeg) * 60 + 0.5);
          const ascSignIdx = Math.floor(ascendant / 30) % 12;

          const angles: { key: string; label: string; lon: number; deg: number; min: number; signIdx: number; color: string }[] = [
            { key: 'asc', label: 'ASC', lon: ascendant, deg: ascDeg, min: ascMin, signIdx: ascSignIdx, color: '#FF6B6B' },
            { key: 'dsc', label: 'DSC', lon: dscLon, deg: dscDeg, min: dscMin, signIdx: dscSignIdx, color: '#6B9FFF' },
            { key: 'mc', label: 'MC', lon: mcLon, deg: mcDeg, min: mcMin, signIdx: mcSignIdx, color: '#6BFF9F' },
            { key: 'ic', label: 'IC', lon: icLon, deg: icDeg, min: icMin, signIdx: icSignIdx, color: '#FFB86B' },
          ];
          return angles.map(({ key, label, lon, deg, min, signIdx, color }) => {
            const scr = toScreen(lon, rot);
            // Place at angleRingRadius — one ring inside inner circle
            const pos = polar(cx, cy, angleRingRadius, scr);
            const signSym = ZODIAC_SYMBOLS[signIdx] || '';
            const sym = PLANET_SYMBOLS[key] || label;
            // Offset label radially inward from icon
            const dx = pos.x - cx, dy = pos.y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = dx / dist, ny = dy / dist;
            const labelX = pos.x - nx * size * 0.025;
            const labelY = pos.y - ny * size * 0.025;
            return (
              <g key={`a-${label}`}>
                {/* Icon circle one ring inside inner circle */}
                <circle cx={pos.x} cy={pos.y} r={size * 0.022}
                  fill={color} stroke="#0d0a1a" strokeWidth="1.5" opacity={0.95} />
                <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
                  fontSize={size * 0.02} fill="#FFF" fontWeight="bold">{sym}</text>
                {/* Degree label radially inward from icon */}
                <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="central"
                  fontSize={size * 0.013} fill={color} fontWeight="600">
                  {label} {deg}°{String(min).padStart(2, '0')}'{signSym}
                </text>
              </g>
            );
          });
        })()}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={size * 0.01} fill="#1a1035" stroke="#6366F1" strokeWidth="1" />
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
