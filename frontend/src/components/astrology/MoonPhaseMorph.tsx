/**
 * MoonPhaseMorph Component
 * Smooth 3D-looking moon that morphs through phases as you scroll.
 * Current phase with ambient glow and ritual guidance.
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MoonPhaseType } from './MoonPhaseCard';

export interface MoonPhaseMorphProps {
  /** Phase value 0-1 where 0=new, 0.5=full, 1=new again */
  phase: number;
  /** Size in pixels */
  size?: number;
  /** Whether to show the phase name label */
  showLabel?: boolean;
  /** Whether to show ritual/intention guidance */
  showGuidance?: boolean;
  /** Whether to show crater texture overlay */
  showTexture?: boolean;
  /** Called when moon is clicked for guidance */
  onPhaseClick?: (phase: MoonPhaseType, guidance: string) => void;
  'aria-label'?: string;
}

/** Map phase value (0-1) to named phase type */
export function getPhaseName(phaseValue: number): MoonPhaseType {
  const p = ((phaseValue % 1) + 1) % 1;
  if (p < 0.0625 || p >= 0.9375) return 'new';
  if (p < 0.1875) return 'waxing-crescent';
  if (p < 0.3125) return 'first-quarter';
  if (p < 0.4375) return 'waxing-gibbous';
  if (p < 0.5625) return 'full';
  if (p < 0.6875) return 'waning-gibbous';
  if (p < 0.8125) return 'last-quarter';
  return 'waning-crescent';
}

/** Phase guidance for rituals/intentions */
export const PHASE_GUIDANCE: Record<MoonPhaseType, string> = {
  new: 'Set intentions. Plant seeds for new beginnings.',
  'waxing-crescent': 'Take first steps. Nurture your intentions.',
  'first-quarter': 'Take action. Overcome challenges.',
  'waxing-gibbous': 'Refine and adjust. Trust the process.',
  full: 'Celebrate and release. Harvest what you\'ve built.',
  'waning-gibbous': 'Share wisdom. Express gratitude.',
  'last-quarter': 'Let go. Release what no longer serves you.',
  'waning-crescent': 'Rest and reflect. Prepare for renewal.',
};

/** Illumination percentage (0-100) from phase value */
export function getIllumination(phaseValue: number): number {
  return Math.round((1 - Math.cos(2 * Math.PI * phaseValue)) / 2 * 100);
}

const MoonPhaseMorph: React.FC<MoonPhaseMorphProps> = ({
  phase,
  size = 120,
  showLabel = true,
  showGuidance = false,
  showTexture = true,
  onPhaseClick,
  'aria-label': ariaLabel,
}) => {
  const phaseName = useMemo(() => getPhaseName(phase), [phase]);
  const illumination = useMemo(() => getIllumination(phase), [phase]);
  const guidance = PHASE_GUIDANCE[phaseName];

  // Calculate moon shadow position for 3D morph effect
  // phase 0 = new (dark), 0.5 = full (lit)
  const shadowOffset = useMemo(() => {
    const p = ((phase % 1) + 1) % 1;
    // Shadow moves from right to left as phase progresses
    return Math.cos(p * 2 * Math.PI) * 50;
  }, [phase]);

  // Glow color and intensity based on phase
  const glowColor = useMemo(() => {
    if (illumination > 80) return 'rgba(251, 191, 36, 0.6)';
    if (illumination > 50) return 'rgba(251, 191, 36, 0.35)';
    if (illumination > 20) return 'rgba(200, 200, 220, 0.2)';
    return 'rgba(100, 100, 120, 0.1)';
  }, [illumination]);

  const glowSize = useMemo(() => {
    return Math.max(4, (illumination / 100) * 30);
  }, [illumination]);

  // Crater positions for texture (deterministic)
  const craters = useMemo(() => [
    { cx: 35, cy: 30, r: 8 },
    { cx: 55, cy: 50, r: 12 },
    { cx: 40, cy: 65, r: 6 },
    { cx: 65, cy: 35, r: 9 },
    { cx: 30, cy: 55, r: 5 },
    { cx: 50, cy: 40, r: 7 },
  ], []);

  return (
    <motion.div
      className="moon-phase-morph"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        cursor: onPhaseClick ? 'pointer' : 'default',
      }}
      onClick={() => onPhaseClick?.(phaseName, guidance)}
      role={onPhaseClick ? 'button' : undefined}
      tabIndex={onPhaseClick ? 0 : undefined}
      aria-label={ariaLabel ?? `Moon phase: ${phaseName}, ${illumination}% illuminated`}
      whileHover={onPhaseClick ? { scale: 1.05 } : undefined}
      whileTap={onPhaseClick ? { scale: 0.97 } : undefined}
    >
      {/* Moon sphere */}
      <motion.div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 0 ${glowSize}px ${glowColor}, inset -4px -2px 8px rgba(0,0,0,0.3)`,
          background: '#1a1a2e',
        }}
        animate={{
          boxShadow: [
            `0 0 ${glowSize}px ${glowColor}, inset -4px -2px 8px rgba(0,0,0,0.3)`,
            `0 0 ${glowSize + 4}px ${glowColor}, inset -4px -2px 8px rgba(0,0,0,0.3)`,
            `0 0 ${glowSize}px ${glowColor}, inset -4px -2px 8px rgba(0,0,0,0.3)`,
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Illuminated surface */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `radial-gradient(circle at ${50 + shadowOffset}% 50%, #f5f0d0 0%, #d4c878 40%, #b8a84e 70%, transparent 100%)`,
          }}
          animate={{
            background: `radial-gradient(circle at ${50 + shadowOffset}% 50%, #f5f0d0 0%, #d4c878 40%, #b8a84e 70%, transparent 100%)`,
          }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />

        {/* Crater texture overlay */}
        {showTexture && (
          <svg
            viewBox="0 0 100 100"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0.15,
            }}
            aria-hidden="true"
          >
            {craters.map((crater, i) => (
              <circle
                key={i}
                cx={crater.cx}
                cy={crater.cy}
                r={crater.r}
                fill="none"
                stroke="rgba(0,0,0,0.5)"
                strokeWidth="1"
              />
            ))}
          </svg>
        )}
      </motion.div>

      {/* Phase label */}
      <AnimatePresence mode="wait">
        {showLabel && (
          <motion.div
            key={phaseName}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3 }}
            style={{
              textAlign: 'center',
              color: '#e2e8f0',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            <div style={{ textTransform: 'capitalize' }}>
              {phaseName.replace(/-/g, ' ')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {illumination}% illuminated
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ritual guidance */}
      <AnimatePresence mode="wait">
        {showGuidance && (
          <motion.div
            key={`guidance-${phaseName}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              textAlign: 'center',
              color: '#cbd5e1',
              fontSize: '0.75rem',
              fontStyle: 'italic',
              maxWidth: size * 1.5,
              lineHeight: 1.4,
            }}
          >
            {guidance}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MoonPhaseMorph;
