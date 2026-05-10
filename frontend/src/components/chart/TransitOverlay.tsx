/**
 * TransitOverlay Component
 *
 * Renders current planetary positions as a translucent outer ring on the chart wheel.
 * Shows conjunction flash animation when a transit planet hits a natal planet.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface TransitPlanet {
  name: string;
  longitude: number;
  sign: string;
  degree: number;
  retrograde: boolean;
}

interface NatalPlanet {
  name: string;
  longitude: number;
}

interface TransitOverlayProps {
  size: number;
  transitPlanets: TransitPlanet[];
  natalPlanets: NatalPlanet[];
  conjunctionOrb?: number;
}

/** Planet color mapping for element-based coloring */
const PLANET_COLORS: Record<string, string> = {
  Sun: '#FFD700',
  Moon: '#C0C0C0',
  Mercury: '#87CEEB',
  Venus: '#FF69B4',
  Mars: '#FF4500',
  Jupiter: '#FFA500',
  Saturn: '#8B4513',
  Uranus: '#00CED1',
  Neptune: '#4169E1',
  Pluto: '#8B0000',
  NorthNode: '#9370DB',
  Chiron: '#DAA520',
};

/** Check if two longitudes are within orb of conjunction */
function isConjunct(lon1: number, lon2: number, orb: number): boolean {
  const diff = Math.abs(lon1 - lon2);
  return Math.min(diff, 360 - diff) <= orb;
}

const TransitOverlay: React.FC<TransitOverlayProps> = ({
  size,
  transitPlanets,
  natalPlanets,
  conjunctionOrb = 2,
}) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size * 0.47; // Slightly outside the natal wheel
  const dotRadius = size * 0.018;

  // Calculate transit dot positions
  const transitDots = useMemo(
    () =>
      transitPlanets.map((planet) => {
        const angle = ((planet.longitude - 90) * Math.PI) / 180;
        const x = centerX + outerRadius * Math.cos(angle);
        const y = centerY + outerRadius * Math.sin(angle);
        const color = PLANET_COLORS[planet.name] ?? '#888';

        // Check for conjunctions with natal planets
        const conjunctWith = natalPlanets.filter((np) =>
          isConjunct(planet.longitude, np.longitude, conjunctionOrb),
        );

        return {
          ...planet,
          x,
          y,
          color,
          isConjunct: conjunctWith.length > 0,
          conjunctWith: conjunctWith.map((np) => np.name),
        };
      }),
    [transitPlanets, natalPlanets, centerX, centerY, outerRadius, conjunctionOrb],
  );

  return (
    <g data-testid="transit-overlay">
      {/* Outer ring — translucent dashed circle */}
      <circle
        data-testid="transit-outer-ring"
        cx={centerX}
        cy={centerY}
        r={outerRadius}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
        strokeDasharray="4 6"
      />

      {/* Transit planet dots */}
      {transitDots.map((planet) => (
        <g key={planet.name}>
          {/* Conjunction flash animation */}
          {planet.isConjunct && (
            <motion.circle
              data-testid={`conjunction-flash-${planet.name}`}
              cx={planet.x}
              cy={planet.y}
              r={dotRadius * 3}
              fill="none"
              stroke={planet.color}
              strokeWidth={1.5}
              initial={{ opacity: 0, r: dotRadius }}
              animate={{
                opacity: [0, 0.8, 0.3, 0.7, 0],
                r: [dotRadius, dotRadius * 4, dotRadius * 3, dotRadius * 5, dotRadius * 6],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* Transit dot */}
          <motion.circle
            data-testid={`transit-dot-${planet.name}`}
            cx={planet.x}
            cy={planet.y}
            r={dotRadius}
            fill={planet.color}
            opacity={0.6}
            aria-label={`Transit ${planet.name}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10, stiffness: 200 }}
          >
            <title>
              {planet.name} in {planet.sign} {planet.degree}°{planet.retrograde ? ' ℞' : ''}
              {planet.isConjunct ? ` — Conjunction with ${planet.conjunctWith.join(', ')}` : ''}
            </title>
          </motion.circle>

          {/* Retrograde symbol */}
          {planet.retrograde && (
            <text
              x={planet.x + dotRadius + 2}
              y={planet.y + 3}
              fill={planet.color}
              fontSize={8}
              opacity={0.8}
            >
              ℞
            </text>
          )}
        </g>
      ))}
    </g>
  );
};

export default TransitOverlay;
