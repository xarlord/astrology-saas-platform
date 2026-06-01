/**
 * SynastryMergeAnimation Component
 * Two chart wheels merge with spinning animation.
 * Inter-chart aspects fire as glowing arcs.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AspectArc {
  id: string;
  planet1: string;
  planet2: string;
  aspectType: string;
  angle1: number; // position in degrees on person A's wheel
  angle2: number; // position in degrees on person B's wheel
  color: string;
  isHarmonious: boolean;
}

export interface SynastryMergeAnimationProps {
  /** Person A chart data */
  personA: {
    name: string;
    planets: { name: string; symbol: string; angle: number; color: string }[];
  };
  /** Person B chart data */
  personB: {
    name: string;
    planets: { name: string; symbol: string; angle: number; color: string }[];
  };
  /** Inter-chart aspect arcs */
  aspectArcs: AspectArc[];
  /** Compatibility score 0-100 */
  compatibilityScore: number;
  /** Whether to auto-play the merge animation */
  autoPlay?: boolean;
  /** Called when merge animation completes */
  onMergeComplete?: () => void;
  'aria-label'?: string;
}

type MergeState = 'side-by-side' | 'merging' | 'merged';

const SynastryMergeAnimation: React.FC<SynastryMergeAnimationProps> = ({
  personA,
  personB,
  aspectArcs,
  compatibilityScore,
  autoPlay = false,
  onMergeComplete,
  'aria-label': ariaLabel,
}) => {
  const [mergeState, setMergeState] = useState<MergeState>('side-by-side');

  const triggerMerge = (): void => {
    setMergeState('merging');
    setTimeout(() => {
      setMergeState('merged');
      onMergeComplete?.();
    }, 1200);
  };

  // Auto-play effect
  React.useEffect(() => {
    if (autoPlay && mergeState === 'side-by-side') {
      const timer = setTimeout(triggerMerge, 500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, mergeState]);

  // Calculate planet positions on wheel
  const getPlanetPos = (angle: number, radius: number): { x: number; y: number } => ({
    x: 50 + (radius * Math.cos((angle - 90) * (Math.PI / 180))),
    y: 50 + (radius * Math.sin((angle - 90) * (Math.PI / 180))),
  });

  const wheelRadius = 35;

  return (
    <div
      className="synastry-merge-animation"
      aria-label={ariaLabel ?? `Synastry merge: ${personA.name} and ${personB.name}`}
      style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}
    >
      {/* Merge trigger button */}
      {mergeState === 'side-by-side' && !autoPlay && (
        <motion.button
          type="button"
          onClick={triggerMerge}
          style={{
            display: 'block',
            margin: '0 auto 16px',
            padding: '10px 24px',
            borderRadius: '9999px',
            border: '1px solid rgba(139, 92, 246, 0.5)',
            background: 'rgba(139, 92, 246, 0.1)',
            color: '#c4b5fd',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
          whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
          whileTap={{ scale: 0.95 }}
        >
          ✨ Merge Charts
        </motion.button>
      )}

      {/* Animation area */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '50%' }}>
        <AnimatePresence mode="wait">
          {mergeState === 'side-by-side' && (
            <motion.div
              key="side-by-side"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Person A wheel */}
              <WheelSVG
                person={personA}
                radius={wheelRadius}
                label={personA.name}
                animate={{ x: 0, rotate: 0 }}
              />
              {/* Person B wheel */}
              <WheelSVG
                person={personB}
                radius={wheelRadius}
                label={personB.name}
                animate={{ x: 0, rotate: 0 }}
              />
            </motion.div>
          )}

          {mergeState === 'merging' && (
            <motion.div
              key="merging"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                style={{ position: 'relative' }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              >
                <WheelSVG
                  person={personA}
                  radius={wheelRadius * 0.8}
                  label={personA.name}
                  animate={{ x: 0, rotate: 0 }}
                />
              </motion.div>
              <motion.div
                style={{ position: 'relative', marginLeft: '-40%' }}
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              >
                <WheelSVG
                  person={personB}
                  radius={wheelRadius * 0.8}
                  label={personB.name}
                  animate={{ x: 0, rotate: 0 }}
                />
              </motion.div>
            </motion.div>
          )}

          {mergeState === 'merged' && (
            <motion.div
              key="merged"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Merged wheel with aspect arcs */}
              <svg
                viewBox="0 0 100 100"
                style={{ width: '80%', maxWidth: '300px' }}
                aria-hidden="true"
              >
                {/* Outer ring */}
                <circle
                  cx="50" cy="50" r="45"
                  fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="0.5"
                />
                {/* Inner ring */}
                <circle
                  cx="50" cy="50" r="30"
                  fill="none" stroke="rgba(96, 165, 250, 0.3)" strokeWidth="0.5"
                />

                {/* Person A planets (inner) */}
                {personA.planets.map((p, i) => {
                  const pos = getPlanetPos(p.angle, 30);
                  return (
                    <motion.circle
                      key={`a-${p.name}`}
                      cx={pos.x}
                      cy={pos.y}
                      r="2.5"
                      fill={p.color}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    />
                  );
                })}

                {/* Person B planets (outer) */}
                {personB.planets.map((p, i) => {
                  const pos = getPlanetPos(p.angle, 45);
                  return (
                    <motion.circle
                      key={`b-${p.name}`}
                      cx={pos.x}
                      cy={pos.y}
                      r="2"
                      fill={p.color}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.7 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                    />
                  );
                })}

                {/* Aspect arcs */}
                {aspectArcs.map((arc, i) => {
                  const pos1 = getPlanetPos(arc.angle1, 30);
                  const pos2 = getPlanetPos(arc.angle2, 45);
                  const midX = (pos1.x + pos2.x) / 2;
                  const midY = (pos1.y + pos2.y) / 2;
                  // Curve control point offset
                  const dx = pos2.x - pos1.x;
                  const dy = pos2.y - pos1.y;
                  const cx = midX + dy * 0.3;
                  const cy = midY - dx * 0.3;

                  return (
                    <motion.path
                      key={arc.id}
                      d={`M ${pos1.x} ${pos1.y} Q ${cx} ${cy} ${pos2.x} ${pos2.y}`}
                      fill="none"
                      stroke={arc.color}
                      strokeWidth="0.8"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.6 }}
                      transition={{ delay: i * 0.15 + 0.5, duration: 0.5 }}
                    />
                  );
                })}
              </svg>

              {/* Names */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '8px',
                fontSize: '0.8rem',
                color: '#94a3b8',
              }}>
                <span>{personA.name}</span>
                <span style={{ color: '#8b5cf6' }}>×</span>
                <span>{personB.name}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          State: {mergeState}
        </span>
      </div>
    </div>
  );
};

/** Internal wheel SVG component */
const WheelSVG: React.FC<{
  person: SynastryMergeAnimationProps['personA'];
  radius: number;
  label: string;
  animate: { x: number; rotate: number };
}> = ({ person, radius, label }) => {
  const getPos = (angle: number): { x: number; y: number } => ({
    x: 50 + (radius * Math.cos((angle - 90) * (Math.PI / 180))),
    y: 50 + (radius * Math.sin((angle - 90) * (Math.PI / 180))),
  });

  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 100 100" style={{ width: '120px' }} aria-hidden="true">
        <circle
          cx="50" cy="50" r={radius}
          fill="none" stroke="rgba(100,116,139,0.3)" strokeWidth="0.5"
        />
        {person.planets.map((p) => {
          const pos = getPos(p.angle);
          return (
            <g key={p.name}>
              <circle cx={pos.x} cy={pos.y} r="3" fill={p.color} />
              <text
                x={pos.x}
                y={pos.y - 5}
                textAnchor="middle"
                fontSize="4"
                fill="#e2e8f0"
              >
                {p.symbol}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
        {label}
      </div>
    </div>
  );
};

export default SynastryMergeAnimation;
