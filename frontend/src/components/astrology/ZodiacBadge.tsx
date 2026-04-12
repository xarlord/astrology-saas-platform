/**
 * ZodiacBadge Component
 * Display zodiac sign with icon and element color coding
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface ZodiacBadgeProps {
  sign: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showIcon?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
}

const ZODIAC_DATA: Record<
  string,
  { symbol: string; element: 'fire' | 'earth' | 'air' | 'water'; color: string }
> = {
  Aries: { symbol: '♈', element: 'fire', color: '#ef4444' },
  Taurus: { symbol: '♉', element: 'earth', color: '#22c55e' },
  Gemini: { symbol: '♊', element: 'air', color: '#38bdf8' },
  Cancer: { symbol: '♋', element: 'water', color: '#6366f1' },
  Leo: { symbol: '♌', element: 'fire', color: '#ef4444' },
  Virgo: { symbol: '♍', element: 'earth', color: '#22c55e' },
  Libra: { symbol: '♎', element: 'air', color: '#38bdf8' },
  Scorpio: { symbol: '♏', element: 'water', color: '#6366f1' },
  Sagittarius: { symbol: '♐', element: 'fire', color: '#ef4444' },
  Capricorn: { symbol: '♑', element: 'earth', color: '#22c55e' },
  Aquarius: { symbol: '♒', element: 'air', color: '#38bdf8' },
  Pisces: { symbol: '♓', element: 'water', color: '#6366f1' },
};

const SIZE_CLASSES = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-3 py-1.5 text-sm gap-1.5',
  lg: 'px-4 py-2 text-base gap-2',
};

const ICON_SIZE = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const ZodiacBadge: React.FC<ZodiacBadgeProps> = ({
  sign,
  size = 'md',
  showName = true,
  showIcon = true,
  clickable = false,
  onClick,
  'aria-label': ariaLabel,
}) => {
  const zodiacInfo = ZODIAC_DATA[sign] ?? { symbol: '?', element: 'air', color: '#94a3b8' };

  const badge = (
    <motion.span
      className={`
        inline-flex items-center rounded-lg border font-medium
        ${SIZE_CLASSES[size]}
        ${clickable ? 'cursor-pointer hover:scale-105' : ''}
      `}
      style={{
        backgroundColor: `${zodiacInfo.color}20`,
        borderColor: `${zodiacInfo.color}40`,
        color: zodiacInfo.color,
      }}
      onClick={clickable ? onClick : undefined}
      whileHover={clickable ? { scale: 1.05 } : {}}
      whileTap={clickable ? { scale: 0.95 } : {}}
      aria-label={ariaLabel ?? `${sign} ${zodiacInfo.element} sign`}
    >
      {showIcon && <span className={ICON_SIZE[size]}>{zodiacInfo.symbol}</span>}
      {showName && <span>{sign}</span>}
    </motion.span>
  );

  return badge;
};

export default ZodiacBadge;
