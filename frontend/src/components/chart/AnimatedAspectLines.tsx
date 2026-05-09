/**
 * AnimatedAspectLines Component
 *
 * Renders aspect lines between planets with glow intensity based on orb tightness.
 * Tight orbs (0-1°) pulse brightly, wider orbs glow softly.
 * Color-coded: harmonious=blue/green, challenging=red/orange, neutral=gold/purple.
 * Clickable for aspect interpretation.
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

export interface AspectLineData {
  id: string;
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';
  degree: number;
  orb: number;
  applying: boolean;
}

export interface PlanetPositionData {
  name: string;
  x: number;
  y: number;
}

export interface AnimatedAspectLinesProps {
  aspects: AspectLineData[];
  planetPositions: PlanetPositionData[];
  size?: number;
  interactive?: boolean;
  onAspectClick?: (aspect: AspectLineData) => void;
  animated?: boolean;
}

const ASPECT_COLORS: Record<string, string> = {
  conjunction: '#fbbf24',
  opposition: '#ef4444',
  trine: '#3b82f6',
  square: '#f87171',
  sextile: '#22c55e',
  quincunx: '#a78bfa',
};

const ASPECT_GLOW: Record<string, number> = {
  conjunction: 3,
  opposition: 3,
  trine: 2,
  square: 2,
  sextile: 1.5,
  quincunx: 1.5,
};

function getOrbIntensity(orb: number): number {
  if (orb <= 1) return 1;
  if (orb <= 3) return 0.7;
  if (orb <= 5) return 0.5;
  return 0.3;
}

function shouldPulse(orb: number): boolean {
  return orb <= 1;
}

export const AnimatedAspectLines: React.FC<AnimatedAspectLinesProps> = ({
  aspects,
  planetPositions,
  size: _size,
  interactive = true,
  onAspectClick,
  animated = true,
}) => {
  const [hoveredAspect, setHoveredAspect] = useState<string | null>(null);

  const lines = useMemo(() => {
    return aspects
      .map((aspect) => {
        const p1 = planetPositions.find((p) => p.name === aspect.planet1);
        const p2 = planetPositions.find((p) => p.name === aspect.planet2);
        if (!p1 || !p2) return null;

        return {
          ...aspect,
          x1: p1.x,
          y1: p1.y,
          x2: p2.x,
          y2: p2.y,
          color: ASPECT_COLORS[aspect.type],
          intensity: getOrbIntensity(aspect.orb),
          pulse: shouldPulse(aspect.orb),
          glowRadius: ASPECT_GLOW[aspect.type],
        };
      })
      .filter((line): line is NonNullable<typeof line> => line !== null);
  }, [aspects, planetPositions]);

  return (
    <g data-testid="animated-aspect-lines">
      {/* SVG glow filter */}
      <defs>
        <filter id="aspect-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="aspect-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {lines.map((line) => {
        const isHovered = hoveredAspect === line.id;
        const filterId = line.pulse && animated ? 'aspect-glow-strong' : 'aspect-glow';

        const lineElement = (
          <line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.color}
            strokeWidth={isHovered ? 2.5 : line.applying ? 1.5 : 1}
            strokeDasharray={line.type === 'quincunx' ? '4 2' : undefined}
            opacity={isHovered ? 1 : line.intensity * 0.8}
            filter={`url(#${filterId})`}
          />
        );

        if (line.pulse && animated) {
          return (
            <motion.g
              key={`pulse-${line.id}`}
              animate={{ opacity: [line.intensity * 0.6, line.intensity, line.intensity * 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className={interactive ? 'cursor-pointer' : ''}
              onClick={() => interactive && onAspectClick?.(line)}
              onMouseEnter={() => setHoveredAspect(line.id)}
              onMouseLeave={() => setHoveredAspect(null)}
            >
              {lineElement}
            </motion.g>
          );
        }

        return (
          <g
            key={line.id}
            className={interactive ? 'cursor-pointer' : ''}
            onClick={() => interactive && onAspectClick?.(line)}
            onMouseEnter={() => setHoveredAspect(line.id)}
            onMouseLeave={() => setHoveredAspect(null)}
          >
            {lineElement}
          </g>
        );
      })}
    </g>
  );
};

export default AnimatedAspectLines;
