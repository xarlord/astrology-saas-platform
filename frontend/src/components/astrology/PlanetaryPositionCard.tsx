/**
 * PlanetaryPositionCard Component
 * Display individual planet position with sign, degree, and house
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface PlanetaryPositionCardProps {
  planet: {
    name: string;
    symbol: string;
    sign: string;
    degree: number;
    minute: number;
    house: number;
    retrograde?: boolean;
    element?: 'fire' | 'earth' | 'air' | 'water';
  };
  size?: 'sm' | 'md' | 'lg';
  showHouse?: boolean;
  showRetrograde?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
}

const PLANET_COLORS: Record<string, string> = {
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

const ELEMENT_COLORS: Record<string, string> = {
  fire: '#ef4444',
  earth: '#22c55e',
  air: '#38bdf8',
  water: '#6366f1',
};

const PlanetaryPositionCard: React.FC<PlanetaryPositionCardProps> = ({
  planet,
  size = 'md',
  showHouse = true,
  showRetrograde = true,
  onClick,
  'aria-label': ariaLabel,
}) => {
  const planetColor = PLANET_COLORS[planet.name] || '#fff';
  const elementColor = planet.element ? ELEMENT_COLORS[planet.element] : '#94a3b8';

  const sizeClasses = {
    sm: 'p-3 text-xs',
    md: 'p-4 text-sm',
    lg: 'p-5 text-base',
  };

  const symbolSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <motion.div
      className={`bg-background-dark/50 border border-white/5 rounded-xl hover:border-primary/50 transition-all cursor-pointer group ${sizeClasses[size]}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label={ariaLabel ?? `${planet.name} in ${planet.sign}`}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Planet Symbol */}
          <div
            className="rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${planetColor}20`, color: planetColor }}
          >
            <span className={`material-symbols-outlined ${symbolSize[size]}`}>
              {planet.symbol}
            </span>
          </div>
          <span className="font-medium text-white">{planet.name}</span>
        </div>

        {/* Retrograde Badge */}
        {showRetrograde && planet.retrograde && (
          <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
            Rx
          </span>
        )}
      </div>

      {/* Sign and Position */}
      <div>
        <div className="flex items-center gap-2 text-white font-bold">
          <span style={{ color: elementColor }}>{planet.sign}</span>
          <span className="text-slate-400 font-mono">
            {planet.degree}° {planet.minute.toString().padStart(2, '0')}'
          </span>
        </div>
        {showHouse && (
          <div className="text-[10px] text-slate-500 mt-1">
            House {planet.house}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PlanetaryPositionCard;
