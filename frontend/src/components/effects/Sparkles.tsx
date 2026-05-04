import { motion } from 'motion/react';
import { useMemo } from 'react';

interface SparklesProps {
  count?: number;
  className?: string;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

export function Sparkles({ count = 10, className = '' }: SparklesProps) {
  const sparkles = useMemo<Sparkle[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 2,
        delay: Math.random() * 3,
        duration: 1.5 + Math.random() * 2,
        opacity: 0.4 + Math.random() * 0.6,
      })),
    [count],
  );

  return (
    <span className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden="true">
      {sparkles.map((s) => (
        <motion.span
          key={s.id}
          className="absolute block rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: s.id % 3 === 0 ? '#c4b5fd' : '#fff',
            opacity: s.opacity,
          }}
          animate={{ scale: [0, 1, 0], opacity: [0, s.opacity, 0] }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </span>
  );
}
