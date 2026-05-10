/**
 * CosmicWeatherWidget Component
 *
 * Animated "cosmic weather" display for the dashboard showing:
 * - Dynamic energy score with animated counter
 * - Weather-themed icons based on transit nature
 * - Background gradient that shifts based on dominant transit type
 * - Current major transit highlights
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

export interface TransitInfo {
  planet1: string;
  planet2: string;
  type: string;
  harmonious: boolean;
  intensity: number;
  description: string;
}

export interface CosmicWeatherWidgetProps {
  energyScore: number;
  transits: TransitInfo[];
  moonPhase?: string;
  moonSign?: string;
  className?: string;
  'aria-label'?: string;
}

type WeatherType = 'sunny' | 'stormy' | 'rainy' | 'windy' | 'starry';

const WEATHER_ICONS: Record<WeatherType, string> = {
  sunny: '☀️',
  stormy: '⛈️',
  rainy: '🌧️',
  windy: '💨',
  starry: '✨',
};

const WEATHER_GRADIENTS: Record<WeatherType, string> = {
  sunny: 'from-amber-900/40 via-orange-900/30 to-yellow-900/20',
  stormy: 'from-red-900/40 via-rose-900/30 to-orange-900/20',
  rainy: 'from-blue-900/40 via-indigo-900/30 to-purple-900/20',
  windy: 'from-cyan-900/40 via-sky-900/30 to-blue-900/20',
  starry: 'from-violet-900/40 via-purple-900/30 to-indigo-900/20',
};

const ENERGY_LABELS: Record<string, string> = {
  high: 'High Vitality',
  medium: 'Moderate Energy',
  low: 'Low Energy',
  critical: 'Critical Period',
};

function getEnergyLevel(score: number): string {
  if (score >= 80) return 'high';
  if (score >= 50) return 'medium';
  if (score >= 25) return 'low';
  return 'critical';
}

function getWeatherType(transits: TransitInfo[]): WeatherType {
  if (transits.length === 0) return 'starry';
  const harmonious = transits.filter((t) => t.harmonious).length;
  const challenging = transits.filter((t) => !t.harmonious).length;
  if (harmonious > challenging * 2) return 'sunny';
  if (challenging > harmonious * 2) return 'stormy';
  if (challenging > harmonious) return 'rainy';
  return 'windy';
}

export const CosmicWeatherWidget: React.FC<CosmicWeatherWidgetProps> = ({
  energyScore,
  transits,
  moonPhase,
  moonSign,
  className = '',
  'aria-label': ariaLabel = 'Cosmic weather forecast',
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const weatherType = useMemo(() => getWeatherType(transits), [transits]);
  const energyLevel = getEnergyLevel(energyScore);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = energyScore / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= energyScore) {
        setDisplayScore(energyScore);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [energyScore]);

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${WEATHER_GRADIENTS[weatherType]} border border-white/10 p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      data-testid="cosmic-weather-widget"
      aria-label={ariaLabel}
      role="region"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-white/20"
            style={{
              left: `${10 + (i * 37) % 90}%`,
              top: `${5 + (i * 53) % 90}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + (i % 3),
              repeat: Infinity,
              delay: (i * 0.3) % 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
            Cosmic Weather
          </h3>
          <span className="text-2xl" data-testid="weather-icon">
            {WEATHER_ICONS[weatherType]}
          </span>
        </div>

        {/* Energy Score */}
        <div className="text-center mb-4">
          <motion.div
            className="text-5xl font-bold text-white mb-1"
            data-testid="energy-score"
          >
            {displayScore}
          </motion.div>
          <div className="text-white/60 text-sm" data-testid="energy-label">
            {ENERGY_LABELS[energyLevel]}
          </div>
          <div className="text-white/40 text-xs mt-1">out of 100</div>
        </div>

        {/* Energy bar */}
        <div className="w-full h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: energyScore >= 70
                ? 'linear-gradient(90deg, #22c55e, #3b82f6)'
                : energyScore >= 40
                  ? 'linear-gradient(90deg, #fbbf24, #f97316)'
                  : 'linear-gradient(90deg, #ef4444, #f87171)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${energyScore}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>

        {/* Moon info */}
        {moonPhase && (
          <div className="text-center text-white/50 text-xs mb-3">
            🌙 {moonPhase} in {moonSign}
          </div>
        )}

        {/* Active transits */}
        {transits.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
              Active Transits
            </h4>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {transits.slice(0, 4).map((transit, i) => (
                <motion.div
                  key={`${transit.planet1}-${transit.planet2}`}
                  className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg ${
                    transit.harmonious ? 'bg-blue-500/10 text-blue-300' : 'bg-red-500/10 text-red-300'
                  }`}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <span className={`font-medium ${transit.harmonious ? 'text-blue-400' : 'text-red-400'}`}>
                    {transit.planet1} {transit.type} {transit.planet2}
                  </span>
                  <span className="text-white/30">
                    {transit.intensity}/10
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CosmicWeatherWidget;
