/**
 * ChartWheel Component
 * SVG-based astrological chart wheel with planetary positions, aspects, and zodiac signs
 */

import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

// Types
export interface Planet {
  name: string;
  symbol: string;
  degree: number;
  minute: number;
  sign: string;
  house: number;
  retrograde: boolean;
  element: 'fire' | 'earth' | 'air' | 'water';
}

export interface Aspect {
  id: string;
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';
  degree: number;
  orb: number;
  applying: boolean;
}

export interface House {
  number: number;
  cuspDegree: number;
  cuspMinute: number;
  sign: string;
}

export interface ChartAngles {
  ascendant: { degree: number; sign: string };
  midheaven: { degree: number; sign: string };
  descendant: { degree: number; sign: string };
  ic: { degree: number; sign: string };
}

export interface ChartData {
  planets: Planet[];
  aspects: Aspect[];
  houses: House[];
  angles: ChartAngles;
}

export interface ChartWheelProps {
  chartData: ChartData;
  size?: number;
  interactive?: boolean;
  enableZoom?: boolean;
  onPlanetClick?: (planet: Planet) => void;
  onAspectClick?: (aspect: Aspect) => void;
  'aria-label'?: string;
}

// Zodiac symbols and colors
const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', element: 'fire' },
  { name: 'Taurus', symbol: '♉', element: 'earth' },
  { name: 'Gemini', symbol: '♊', element: 'air' },
  { name: 'Cancer', symbol: '♋', element: 'water' },
  { name: 'Leo', symbol: '♌', element: 'fire' },
  { name: 'Virgo', symbol: '♍', element: 'earth' },
  { name: 'Libra', symbol: '♎', element: 'air' },
  { name: 'Scorpio', symbol: '♏', element: 'water' },
  { name: 'Sagittarius', symbol: '♐', element: 'fire' },
  { name: 'Capricorn', symbol: '♑', element: 'earth' },
  { name: 'Aquarius', symbol: '♒', element: 'air' },
  { name: 'Pisces', symbol: '♓', element: 'water' },
];

const ELEMENT_COLORS = {
  fire: '#ef4444',
  earth: '#22c55e',
  air: '#38bdf8',
  water: '#6366f1',
};

const ASPECT_COLORS = {
  conjunction: '#fbbf24',
  opposition: '#ef4444',
  trine: '#3b82f6',
  square: '#f87171',
  sextile: '#22c55e',
  quincunx: '#a78bfa',
};

const PLANET_COLORS = {
  Sun: '#fbbf24',
  Moon: '#e2e8f0',
  Mercury: '#a5b4fc',
  Venus: '#f472b6',
  Mars: '#ef4444',
  Jupiter: '#f97316',
  Saturn: '#71717a',
  Uranus: '#22d3ee',
  Neptune: '#3b82f6',
  Pluto: '#8b5cf6',
};

const ChartWheel: React.FC<ChartWheelProps> = ({
  chartData,
  size = 500,
  interactive = true,
  enableZoom = false,
  onPlanetClick,
  onAspectClick,
  'aria-label': ariaLabel = 'Astrological chart wheel',
}) => {
  const [zoom, setZoom] = useState(1);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [focusedPlanet, setFocusedPlanet] = useState<number>(-1);
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate planet positions on the wheel
  const planetPositions = useMemo(() => {
    return chartData.planets.map((planet) => {
      const degree = planet.degree + planet.minute / 60;
      const radians = ((degree - 90) * Math.PI) / 180;
      const radius = size * 0.25;
      const x = size / 2 + radius * Math.cos(radians);
      const y = size / 2 + radius * Math.sin(radians);
      return { ...planet, x, y, radians };
    });
  }, [chartData.planets, size]);

  // Calculate aspect lines
  const aspectLines = useMemo(() => {
    return chartData.aspects.map((aspect) => {
      const planet1 = planetPositions.find((p) => p.name === aspect.planet1);
      const planet2 = planetPositions.find((p) => p.name === aspect.planet2);
      if (!planet1 || !planet2) return null;
      return {
        ...aspect,
        x1: planet1.x,
        y1: planet1.y,
        x2: planet2.x,
        y2: planet2.y,
      } as const;
    }).filter((aspect): aspect is NonNullable<typeof aspect> => aspect !== null);
  }, [chartData.aspects, planetPositions]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!interactive) return;

    switch (e.key) {
      case 'ArrowRight':
        setFocusedPlanet((prev) => (prev + 1) % chartData.planets.length);
        break;
      case 'ArrowLeft':
        setFocusedPlanet((prev) => (prev - 1 + chartData.planets.length) % chartData.planets.length);
        break;
      case 'Enter':
      case ' ':
        if (focusedPlanet >= 0 && onPlanetClick) {
          e.preventDefault();
          onPlanetClick(chartData.planets[focusedPlanet]);
        }
        break;
    }
  };

  // Zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (!enableZoom) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 3));
  };

  return (
    <motion.div
      className="relative inline-block"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{ width: size, height: size }}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        aria-label={ariaLabel}
        role="img"
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
      >
        <g transform={`scale(${zoom})`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 5}
            fill="transparent"
            stroke="#2f2645"
            strokeWidth="2"
          />

          {/* Zodiac ring */}
          {ZODIAC_SIGNS.map((sign, index) => {
            const startAngle = index * 30;
            const endAngle = startAngle + 30;
            const startRad = ((startAngle - 90) * Math.PI) / 180;
            const endRad = ((endAngle - 90) * Math.PI) / 180;
            const outerR = size / 2 - 10;
            const innerR = size / 2 - 40;

            // Calculate arc path
            const x1 = size / 2 + outerR * Math.cos(startRad);
            const y1 = size / 2 + outerR * Math.sin(startRad);
            const x2 = size / 2 + outerR * Math.cos(endRad);
            const y2 = size / 2 + outerR * Math.sin(endRad);
            const x3 = size / 2 + innerR * Math.cos(endRad);
            const y3 = size / 2 + innerR * Math.sin(endRad);
            const x4 = size / 2 + innerR * Math.cos(startRad);
            const y4 = size / 2 + innerR * Math.sin(startRad);

            const pathData = `M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 0 0 ${x4} ${y4} Z`;

            return (
              <g key={sign.name}>
                <path
                  d={pathData}
                  fill={ELEMENT_COLORS[sign.element as keyof typeof ELEMENT_COLORS]}
                  fillOpacity={0.15}
                  stroke={ELEMENT_COLORS[sign.element as keyof typeof ELEMENT_COLORS]}
                  strokeWidth="0.5"
                />
                {/* Zodiac symbol */}
                <text
                  x={size / 2 + (size / 2 - 25) * Math.cos(((startAngle + 15 - 90) * Math.PI) / 180)}
                  y={size / 2 + (size / 2 - 25) * Math.sin(((startAngle + 15 - 90) * Math.PI) / 180)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={14}
                  fill={ELEMENT_COLORS[sign.element as keyof typeof ELEMENT_COLORS]}
                  className="select-none"
                >
                  {sign.symbol}
                </text>
              </g>
            );
          })}

          {/* House divisions */}
          {chartData.houses.map((house) => {
            const degree = house.cuspDegree + house.cuspMinute / 60;
            const radians = ((degree - 90) * Math.PI) / 180;
            const x1 = size / 2 + (size / 2 - 45) * Math.cos(radians);
            const y1 = size / 2 + (size / 2 - 45) * Math.sin(radians);
            const x2 = size / 2 + 40 * Math.cos(radians);
            const y2 = size / 2 + 40 * Math.sin(radians);

            return (
              <line
                key={house.number}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            );
          })}

          {/* Aspect lines */}
          <g opacity="0.6">
            {aspectLines.map((aspect) =>
              aspect ? (
                <line
                  key={aspect.id}
                  x1={aspect.x1}
                  y1={aspect.y1}
                  x2={aspect.x2}
                  y2={aspect.y2}
                  stroke={ASPECT_COLORS[aspect.type]}
                  strokeWidth={aspect.applying ? 1.5 : 1}
                  strokeDasharray={aspect.type === 'quincunx' ? '4 2' : undefined}
                  className={interactive ? 'cursor-pointer hover:opacity-100' : ''}
                  opacity={hoveredPlanet && (aspect.planet1 === hoveredPlanet || aspect.planet2 === hoveredPlanet) ? 1 : 0.4}
                  onClick={() => interactive && onAspectClick?.(aspect)}
                />
              ) : null
            )}
          </g>

          {/* Planets */}
          {planetPositions.map((planet, index) => {
            const isHovered = hoveredPlanet === planet.name;
            const isFocused = focusedPlanet === index;

            return (
              <g
                key={planet.name}
                className={interactive ? 'cursor-pointer' : ''}
                onClick={() => interactive && onPlanetClick?.(planet)}
                onMouseEnter={() => setHoveredPlanet(planet.name)}
                onMouseLeave={() => setHoveredPlanet(null)}
                tabIndex={interactive ? 0 : undefined}
                aria-label={`${planet.name} in ${planet.sign} at ${planet.degree}°${planet.minute}'`}
              >
                {/* Planet glow */}
                {isHovered && (
                  <circle
                    cx={planet.x}
                    cy={planet.y}
                    r={18}
                    fill={PLANET_COLORS[planet.name as keyof typeof PLANET_COLORS] || '#fff'}
                    fillOpacity={0.2}
                  />
                )}

                {/* Focus ring */}
                {isFocused && (
                  <circle
                    cx={planet.x}
                    cy={planet.y}
                    r={16}
                    fill="none"
                    stroke="#6b3de1"
                    strokeWidth="2"
                  />
                )}

                {/* Planet circle */}
                <circle
                  cx={planet.x}
                  cy={planet.y}
                  r={14}
                  fill="#141627"
                  stroke={PLANET_COLORS[planet.name as keyof typeof PLANET_COLORS] || '#fff'}
                  strokeWidth={isHovered ? 2 : 1.5}
                />

                {/* Planet symbol */}
                <text
                  x={planet.x}
                  y={planet.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={12}
                  fill={PLANET_COLORS[planet.name as keyof typeof PLANET_COLORS] || '#fff'}
                  className="select-none"
                >
                  {planet.symbol}
                </text>

                {/* Retrograde indicator */}
                {planet.retrograde && (
                  <text
                    x={planet.x + 10}
                    y={planet.y - 10}
                    fontSize={10}
                    fill="#ef4444"
                    className="select-none"
                  >
                    Rx
                  </text>
                )}
              </g>
            );
          })}

          {/* Ascendant and Midheaven markers */}
          {chartData.angles && (
            <>
              {/* Ascendant */}
              <g>
                <line
                  x1={size / 2}
                  y1={size / 2}
                  x2={size / 2 + (size / 2 - 50) * Math.cos(((chartData.angles.ascendant.degree - 90) * Math.PI) / 180)}
                  y2={size / 2 + (size / 2 - 50) * Math.sin(((chartData.angles.ascendant.degree - 90) * Math.PI) / 180)}
                  stroke="#fbbf24"
                  strokeWidth="2"
                />
                <text
                  x={size / 2 + (size / 2 - 60) * Math.cos(((chartData.angles.ascendant.degree - 90) * Math.PI) / 180)}
                  y={size / 2 + (size / 2 - 60) * Math.sin(((chartData.angles.ascendant.degree - 90) * Math.PI) / 180)}
                  fontSize={11}
                  fill="#fbbf24"
                  className="select-none"
                >
                  ASC
                </text>
              </g>

              {/* Midheaven */}
              <g>
                <line
                  x1={size / 2}
                  y1={size / 2}
                  x2={size / 2 + (size / 2 - 50) * Math.cos(((chartData.angles.midheaven.degree - 90) * Math.PI) / 180)}
                  y2={size / 2 + (size / 2 - 50) * Math.sin(((chartData.angles.midheaven.degree - 90) * Math.PI) / 180)}
                  stroke="#fbbf24"
                  strokeWidth="2"
                />
                <text
                  x={size / 2 + (size / 2 - 60) * Math.cos(((chartData.angles.midheaven.degree - 90) * Math.PI) / 180)}
                  y={size / 2 + (size / 2 - 60) * Math.sin(((chartData.angles.midheaven.degree - 90) * Math.PI) / 180)}
                  fontSize={11}
                  fill="#fbbf24"
                  className="select-none"
                >
                  MC
                </text>
              </g>
            </>
          )}

          {/* Center hub */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={30}
            fill="#0B0D17"
            stroke="#2f2645"
            strokeWidth="1"
          />
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredPlanet && interactive && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card-dark border border-white/10 px-3 py-1 rounded-lg text-xs whitespace-nowrap shadow-lg z-50">
          {hoveredPlanet}
        </div>
      )}
    </motion.div>
  );
};

export default ChartWheel;
