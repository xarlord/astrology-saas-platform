/**
 * ElementalBalance Component
 * Display the balance of fire, earth, air, and water elements
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface ElementalBalanceProps {
  fire: number; // 0-100
  earth: number; // 0-100
  air: number; // 0-100
  water: number; // 0-100
  orientation?: 'horizontal' | 'vertical';
  showPercentage?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  'aria-label'?: string;
}

const ELEMENT_DATA = {
  fire: {
    name: 'Fire',
    icon: '🔥',
    color: '#ef4444',
    description: 'Passion, energy, initiative',
  },
  earth: {
    name: 'Earth',
    icon: '🌍',
    color: '#22c55e',
    description: 'Stability, practicality, grounding',
  },
  air: {
    name: 'Air',
    icon: '💨',
    color: '#38bdf8',
    description: 'Intellect, communication, ideas',
  },
  water: {
    name: 'Water',
    icon: '💧',
    color: '#6366f1',
    description: 'Emotion, intuition, sensitivity',
  },
};

const ElementalBalance: React.FC<ElementalBalanceProps> = ({
  fire,
  earth,
  air,
  water,
  orientation = 'vertical',
  showPercentage = true,
  showLabels = true,
  animated = true,
  'aria-label': ariaLabel = 'Elemental balance chart',
}) => {
  const elements = [
    { key: 'fire' as const, value: fire },
    { key: 'earth' as const, value: earth },
    { key: 'air' as const, value: air },
    { key: 'water' as const, value: water },
  ];

  const isVertical = orientation === 'vertical';

  return (
    <div
      className={`flex gap-4 ${isVertical ? 'flex-col' : 'flex-row flex-wrap justify-center'}`}
      role="progressbar"
      aria-label={ariaLabel}
    >
      {elements.map(({ key, value }) => {
        const element = ELEMENT_DATA[key];
        const isDominant = value === Math.max(fire, earth, air, water);

        return (
          <motion.div
            key={key}
            className={`
              flex ${isVertical ? 'flex-row items-center gap-3' : 'flex-col items-center gap-2'}
              ${isDominant ? 'flex-1' : ''}
            `}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: elements.findIndex((e) => e.key === key) * 0.1 }}
          >
            {/* Icon */}
            <div
              className={`
                flex items-center justify-center rounded-lg
                ${isVertical ? 'w-12 h-12 text-2xl' : 'w-10 h-10 text-xl'}
                ${isDominant ? 'ring-2 ring-offset-2 ring-offset-background-dark' : ''}
              `}
              style={
                {
                  backgroundColor: `${element.color}20`,
                  '--tw-ring-color': element.color,
                } as React.CSSProperties
              }
            >
              {element.icon}
            </div>

            {/* Bar */}
            <div
              className={`
                bg-surface-dark rounded-full overflow-hidden border border-white/10
                ${isVertical ? 'flex-1 h-4 min-w-[120px]' : 'w-48 h-3'}
              `}
            >
              <motion.div
                className="h-full rounded-full relative"
                style={{ backgroundColor: element.color }}
                initial={{ width: animated ? 0 : `${value}%` }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
              </motion.div>
            </div>

            {/* Label and percentage */}
            <div
              className={`
                flex ${isVertical ? 'flex-col' : 'flex-row items-center gap-2'}
                ${isVertical ? 'min-w-[60px]' : ''}
              `}
            >
              {showLabels && (
                <span
                  className={`
                    font-medium text-white
                    ${isVertical ? 'text-sm' : 'text-xs'}
                  `}
                >
                  {element.name}
                </span>
              )}
              {showPercentage && (
                <span
                  className={`
                    font-bold
                    ${isVertical ? 'text-lg' : 'text-sm'}
                  `}
                  style={{ color: element.color }}
                >
                  {value}%
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ElementalBalance;
