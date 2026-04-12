/**
 * AspectGrid Component
 * Matrix table showing aspects between planets
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface AspectGridData {
  planet1: string;
  planet2: string;
  aspect: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx' | null;
  orb?: number;
  applying?: boolean;
}

export interface AspectGridProps {
  planets: string[];
  aspects: AspectGridData[];
  showOrbs?: boolean;
  interactive?: boolean;
  onAspectClick?: (aspect: AspectGridData) => void;
  'aria-label'?: string;
}

const ASPECT_SYMBOLS: Record<string, { symbol: string; color: string; label: string }> = {
  conjunction: { symbol: '☌', color: '#fbbf24', label: 'Conjunction' },
  opposition: { symbol: '☍', color: '#ef4444', label: 'Opposition' },
  trine: { symbol: '△', color: '#3b82f6', label: 'Trine' },
  square: { symbol: '□', color: '#f87171', label: 'Square' },
  sextile: { symbol: '⚹', color: '#22c55e', label: 'Sextile' },
  quincunx: { symbol: '⚺', color: '#a78bfa', label: 'Quincunx' },
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
};

const AspectGrid: React.FC<AspectGridProps> = ({
  planets,
  aspects,
  showOrbs = false,
  interactive = true,
  onAspectClick,
  'aria-label': ariaLabel = 'Aspect grid showing planetary aspects',
}) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Create aspect matrix
  const getAspect = (planet1: string, planet2: string): AspectGridData | null => {
    if (planet1 === planet2) return null;
    return (
      aspects.find(
        (a) =>
          (a.planet1 === planet1 && a.planet2 === planet2) ||
          (a.planet1 === planet2 && a.planet2 === planet1),
      ) ?? null
    );
  };

  return (
    <div className="overflow-x-auto">
      <motion.table
        className="w-full border-collapse"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        aria-label={ariaLabel}
      >
        <thead>
          <tr>
            <th className="p-2"></th>
            {planets.map((planet) => (
              <th
                key={planet}
                className="p-2 text-xs text-slate-400 font-medium rotate-45 whitespace-nowrap"
                style={{ height: '60px' }}
              >
                <div className="transform rotate-0">
                  <span className="mr-1">{PLANET_SYMBOLS[planet] ?? planet[0]}</span>
                  {planet}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {planets.map((planet1) => (
            <tr key={planet1}>
              <th className="p-2 text-xs text-slate-400 font-medium">
                <span className="mr-1">{PLANET_SYMBOLS[planet1] || planet1[0]}</span>
                {planet1}
              </th>
              {planets.map((planet2) => {
                const aspect = getAspect(planet1, planet2);
                const cellKey = `${planet1}-${planet2}`;
                const isHovered = hoveredCell === cellKey;

                if (planet1 === planet2) {
                  return (
                    <td
                      key={planet2}
                      className="p-2 text-center border border-white/5 bg-surface-dark/50"
                    >
                      <span className="text-slate-600 text-xs">—</span>
                    </td>
                  );
                }

                const aspectInfo = aspect?.aspect ? ASPECT_SYMBOLS[aspect.aspect] : null;

                return (
                  <td
                    key={planet2}
                    className={`
                      p-2 text-center border border-white/5 cursor-pointer
                      transition-all
                      ${interactive ? 'hover:bg-white/10' : ''}
                      ${isHovered ? 'bg-white/10' : ''}
                    `}
                    onClick={() => interactive && aspect && onAspectClick?.(aspect)}
                    onMouseEnter={() => setHoveredCell(cellKey)}
                    onMouseLeave={() => setHoveredCell(null)}
                    aria-label={`${planet1} to ${planet2}: ${aspectInfo?.label ?? 'No aspect'}`}
                  >
                    {aspectInfo ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-lg" style={{ color: aspectInfo.color }}>
                          {aspectInfo.symbol}
                        </span>
                        {showOrbs && aspect?.orb !== undefined && (
                          <span className="text-[9px] text-slate-500">{aspect.orb}°</span>
                        )}
                        {aspect?.applying && <span className="text-[8px] text-green-400">A</span>}
                      </div>
                    ) : (
                      <span className="text-slate-700 text-sm">·</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </motion.table>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {Object.entries(ASPECT_SYMBOLS).map(([key, { symbol, color, label }]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="text-base" style={{ color }}>
              {symbol}
            </span>
            <span className="text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AspectGrid;
