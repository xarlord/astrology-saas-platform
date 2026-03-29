/**
 * EnergyMeter Component
 * Circular progress gauge for displaying cosmic energy levels
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface EnergyMeterProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  showValue?: boolean;
  color?: string;
  gradient?: boolean;
  'aria-label'?: string;
}

const SIZE_MAP = {
  sm: 80,
  md: 128,
  lg: 180,
  xl: 250,
};

const STROKE_WIDTH_MAP = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
};

const EnergyMeter: React.FC<EnergyMeterProps> = ({
  value,
  size = 'md',
  label,
  showValue = true,
  color,
  gradient: _gradient = true,
  'aria-label': ariaLabel = `Energy meter: ${value}%`,
}) => {
  const circleSize = SIZE_MAP[size];
  const strokeWidth = STROKE_WIDTH_MAP[size];
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  // Determine color based on value
  const getColor = () => {
    if (color) return color;
    if (value >= 70) return '#22c55e'; // Green for high
    if (value >= 40) return '#fbbf24'; // Yellow for medium
    return '#ef4444'; // Red for low
  };

  const meterColor = getColor();

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <svg width={circleSize} height={circleSize} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          fill="none"
          stroke="#2f2645"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          fill="none"
          stroke={meterColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <motion.span
            className="text-2xl font-bold text-white"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {value}
          </motion.span>
        )}
        <span className="text-[10px] uppercase tracking-widest text-slate-400">
          {label ?? 'Energy'}
        </span>
      </div>
    </div>
  );
};

export default EnergyMeter;
