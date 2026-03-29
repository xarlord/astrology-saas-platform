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

const MOON_PHASE_CONFIG: Record<MoonPhaseType, { icon: string; label: string; color: string }> = {
  'new': { icon: '🌑', label: 'New Moon', color: '#1e293b' },
  'waxing-crescent': { icon: '🌒', label: 'Waxing Crescent', color: '#3b82f6' },
  'first-quarter': { icon: '🌓', label: 'First Quarter', color: '#60a5fa' },
  'waxing-gibbous': { icon: '🌔', label: 'Waxing Gibbous', color: '#93c5fd' },
  'full': { icon: '🌕', label: 'Full Moon', color: '#fbbf24' },
  'waning-gibbous': { icon: '🌖', label: 'Waning Gibbous', color: '#93c5fd' },
  'last-quarter': { icon: '🌗', label: 'Last Quarter', color: '#60a5fa' },
  'waning-crescent': { icon: '🌘', label: 'Waning Crescent', color: '#3b82f6' },
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
      {/* Moon Icon */}
      <motion.div
        className="relative"
        animate={showAnimation ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="text-6xl md:text-7xl filter drop-shadow-lg"
          style={{ color: config.color }}
        >
          {config.icon}
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
          {degree !== undefined && (
            <span className="text-xs text-slate-400">{degree}°</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MoonPhaseCard;
