/**
 * CompatibilityGauge Component
 * Circular score display for synastry compatibility
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface CompatibilityCategory {
  name: string;
  score: number;
  color?: string;
}

export interface CompatibilityGaugeProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  showCategories?: boolean;
  categories?: CompatibilityCategory[];
  animated?: boolean;
  'aria-label'?: string;
}

const SIZE_MAP = {
  sm: { width: 120, height: 120, strokeWidth: 8 },
  md: { width: 160, height: 160, strokeWidth: 10 },
  lg: { width: 200, height: 200, strokeWidth: 12 },
  xl: { width: 250, height: 250, strokeWidth: 14 },
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#22c55e'; // Green
  if (score >= 60) return '#3b82f6'; // Blue
  if (score >= 40) return '#fbbf24'; // Yellow
  return '#ef4444'; // Red
};

const getScoreLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Challenging';
  return 'Difficult';
};

const CompatibilityGauge: React.FC<CompatibilityGaugeProps> = ({
  score,
  size = 'lg',
  showLabel = true,
  showCategories = false,
  categories = [],
  animated = true,
  'aria-label': _ariaLabel,
}) => {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const { width, height, strokeWidth } = SIZE_MAP[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;
  const scoreColor = getScoreColor(displayScore);

  useEffect(() => {
    if (animated) {
      const duration = 1500;
      const steps = 60;
      const increment = score / steps;
      const stepDuration = duration / steps;

      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= score) {
          setDisplayScore(score);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.round(current));
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [score, animated]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Gauge */}
      <div className="relative" style={{ width, height }}>
        <svg width={width} height={height} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            fill="none"
            stroke="#2f2645"
            strokeWidth={strokeWidth}
          />

          {/* Progress circle with gradient */}
          <defs>
            <linearGradient id={`gauge-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={scoreColor} stopOpacity={0.6} />
              <stop offset="100%" stopColor={scoreColor} stopOpacity={1} />
            </linearGradient>
          </defs>

          <motion.circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            fill="none"
            stroke={`url(#gauge-gradient-${size})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`font-bold text-white ${size === 'xl' ? 'text-4xl' : size === 'lg' ? 'text-3xl' : 'text-2xl'}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {displayScore}
          </motion.span>
          {showLabel && (
            <span className="text-xs text-slate-400 mt-1">{getScoreLabel(displayScore)}</span>
          )}
        </div>
      </div>

      {/* Category breakdown */}
      {showCategories && categories.length > 0 && (
        <div className="w-full space-y-2">
          {categories.map((category, _index) => (
            <div key={category.name} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-24">{category.name}</span>
              <div className="flex-1 h-2 bg-surface-dark rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: category.color ?? getScoreColor(category.score) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${category.score}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <span className="text-xs text-white w-8 text-right">{category.score}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompatibilityGauge;
