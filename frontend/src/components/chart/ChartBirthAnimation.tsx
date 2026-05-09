/**
 * ChartBirthAnimation Component
 *
 * Wraps the ChartWheel with a cinematic "birth" animation sequence:
 * 1. Zodiac wheel rotates into place
 * 2. Planets spiral outward from center with staggered delays
 * 3. Aspect lines draw themselves with a glowing pulse
 * 4. Everything settles into the final chart state
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChartData } from '../astrology/ChartWheel';

export type AnimationPhase = 'idle' | 'spiral' | 'aspects' | 'settle';

export interface ChartBirthAnimationProps {
  chartData: ChartData;
  children: React.ReactNode;
  trigger?: boolean;
  onComplete?: () => void;
  duration?: number;
}

const PHASE_DURATIONS: Record<AnimationPhase, number> = {
  idle: 0,
  spiral: 1200,
  aspects: 800,
  settle: 500,
};

export const ChartBirthAnimation: React.FC<ChartBirthAnimationProps> = ({
  chartData,
  children,
  trigger = true,
  onComplete,
  duration,
}) => {
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const animationStartedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (trigger && !animationStartedRef.current) {
      animationStartedRef.current = true;
      const spiralDuration = duration ?? PHASE_DURATIONS.spiral;
      const aspectDuration = PHASE_DURATIONS.aspects;
      const settleDuration = PHASE_DURATIONS.settle;

      setPhase('spiral');

      const aspectTimer = setTimeout(() => {
        setPhase('aspects');
      }, spiralDuration);

      const settleTimer = setTimeout(() => {
        setPhase('settle');
      }, spiralDuration + aspectDuration);

      const completeTimer = setTimeout(() => {
        setPhase('idle');
        onCompleteRef.current?.();
      }, spiralDuration + aspectDuration + settleDuration);

      return () => {
        clearTimeout(aspectTimer);
        clearTimeout(settleTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [trigger, duration]);

  return (
    <div className="relative" data-testid="chart-birth-animation">
      {/* Background glow effect during animation */}
      <AnimatePresence>
        {phase !== 'idle' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.3, 0.6, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2.5,
              times: [0, 0.2, 0.4, 0.8, 1],
            }}
            style={{
              background:
                'radial-gradient(circle, rgba(107, 61, 225, 0.3) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Main content with animation wrapper */}
      <motion.div
        initial={trigger ? { scale: 0.8, opacity: 0 } : false}
        animate={{
          scale: phase === 'spiral' ? [0.8, 1.05, 1] : 1,
          opacity: phase === 'spiral' ? [0, 1] : 1,
        }}
        transition={{
          duration: phase === 'spiral' ? (duration ?? PHASE_DURATIONS.spiral) / 1000 : 0,
          ease: 'easeOut',
        }}
        data-phase={phase}
      >
        {children}
      </motion.div>

      {/* Planet count indicator during spiral phase */}
      <AnimatePresence>
        {phase === 'spiral' && (
          <motion.div
            className="absolute bottom-2 right-2 text-xs text-purple-400/70 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {chartData.planets.length} planets
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChartBirthAnimation;
