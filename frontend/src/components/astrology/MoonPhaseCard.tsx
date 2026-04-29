/**
 * MoonPhaseCard Component
 * Visual display of current moon phase with illumination and sign
 */

import React from 'react';
import { motion } from 'framer-motion';

export type MoonPhaseType =
  | 'new'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent';

export interface MoonPhaseCardProps {
  phase: MoonPhaseType;
  illumination: number; // 0-100
  sign: string;
  degree?: number;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
  'aria-label'?: string;
}

// SVG moon phase icons (replacing emoji for consistent rendering and theming)
const MoonIcon: React.FC<{ phase: MoonPhaseType; className?: string; color?: string }> = ({
  phase,
  className = '',
  color,
}) => {
  const iconColor = color ?? '#fbbf24';

  const svgPaths: Record<MoonPhaseType, JSX.Element> = {
    new: <circle cx="24" cy="24" r="20" fill="none" stroke={iconColor} strokeWidth="2" />,
    'waxing-crescent': <path d="M24 4 A20 20 0 0 1 24 44 A14 14 0 0 0 24 4" fill={iconColor} />,
    'first-quarter': <path d="M24 4 L24 44 A20 20 0 0 1 24 4" fill={iconColor} />,
    'waxing-gibbous': <path d="M24 4 A20 20 0 0 1 24 44 A6 6 0 0 1 24 4" fill={iconColor} />,
    full: <circle cx="24" cy="24" r="20" fill={iconColor} />,
    'waning-gibbous': <path d="M24 4 A20 20 0 0 0 24 44 A6 6 0 0 0 24 4" fill={iconColor} />,
    'last-quarter': <path d="M24 4 L24 44 A20 20 0 0 0 24 4" fill={iconColor} />,
    'waning-crescent': <path d="M24 4 A20 20 0 0 0 24 44 A14 14 0 0 1 24 4" fill={iconColor} />,
  };

  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {svgPaths[phase]}
    </svg>
  );
};

const MOON_PHASE_CONFIG: Record<MoonPhaseType, { label: string; color: string }> = {
  new: { label: 'New Moon', color: '#64748b' },
  'waxing-crescent': { label: 'Waxing Crescent', color: '#60a5fa' },
  'first-quarter': { label: 'First Quarter', color: '#93c5fd' },
  'waxing-gibbous': { label: 'Waxing Gibbous', color: '#bfdbfe' },
  full: { label: 'Full Moon', color: '#fbbf24' },
  'waning-gibbous': { label: 'Waning Gibbous', color: '#bfdbfe' },
  'last-quarter': { label: 'Last Quarter', color: '#93c5fd' },
  'waning-crescent': { label: 'Waning Crescent', color: '#60a5fa' },
};

const getElementColor = (sign: string): string => {
  const fire = ['Aries', 'Leo', 'Sagittarius'];
  const earth = ['Taurus', 'Virgo', 'Capricorn'];
  const air = ['Gemini', 'Libra', 'Aquarius'];
  const water = ['Cancer', 'Scorpio', 'Pisces'];

  if (fire.includes(sign)) return '#ef4444';
  if (earth.includes(sign)) return '#22c55e';
  if (air.includes(sign)) return '#38bdf8';
  if (water.includes(sign)) return '#6366f1';
  return '#94a3b8';
};

const MoonPhaseCard: React.FC<MoonPhaseCardProps> = ({
  phase,
  illumination,
  sign,
  degree,
  size = 'md',
  showAnimation = true,
  'aria-label': ariaLabel,
}) => {
  const config = MOON_PHASE_CONFIG[phase];
  const elementColor = getElementColor(sign);

  const sizeClasses = {
    sm: 'w-32 h-40',
    md: 'w-48 h-56',
    lg: 'w-64 h-72',
  };

  return (
    <motion.div
      className={`bg-surface-dark border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-between ${sizeClasses[size]}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      role="article"
      aria-label={ariaLabel ?? `${config.label} in ${sign}`}
    >
      {/* Moon Icon - SVG instead of emoji for consistent rendering */}
      <motion.div
        className="relative"
        animate={showAnimation ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-24 h-24 md:w-28 md:h-28 filter drop-shadow-lg">
          <MoonIcon phase={phase} color={config.color} className="w-full h-full" />
        </div>

        {/* Glow effect for full moon */}
        {phase === 'full' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-yellow-400/20 blur-xl"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Phase Info */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-white">{config.label}</h3>

        {/* Illumination */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl font-bold text-white">{illumination}%</span>
          <span className="text-xs text-slate-400 uppercase tracking-wide">Illuminated</span>
        </div>

        {/* Zodiac Sign */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border"
          style={{ backgroundColor: `${elementColor}20`, borderColor: elementColor }}
        >
          <span className="text-sm font-medium" style={{ color: elementColor }}>
            {sign}
          </span>
          {degree !== undefined && <span className="text-xs text-slate-400">{degree}°</span>}
        </div>
      </div>
    </motion.div>
  );
};

export default MoonPhaseCard;
