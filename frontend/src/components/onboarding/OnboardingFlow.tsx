/**
 * OnboardingFlow Component
 *
 * Cinematic first-time experience: birthday → location → chart reveal.
 * Starfield background, step transitions with slide animations.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingFlowProps {
  onComplete: (data: { birthday: string; birthtime: string; location: string }) => void;
}

const STEPS = ['birthday', 'location', 'reveal'] as const;
type Step = (typeof STEPS)[number];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [birthday, setBirthday] = useState('');
  const [birthtime, setBirthtime] = useState('12:00');
  const [location, setLocation] = useState('');

  const currentStep: Step = STEPS[stepIndex];

  const goNext = useCallback(() => {
    if (stepIndex < STEPS.length - 1) {
      setDirection(1);
      setStepIndex((i) => i + 1);
    }
  }, [stepIndex]);

  const goPrev = useCallback(() => {
    if (stepIndex > 0) {
      setDirection(-1);
      setStepIndex((i) => i - 1);
    }
  }, [stepIndex]);

  const handleFinish = useCallback(() => {
    onComplete({ birthday, birthtime, location });
  }, [onComplete, birthday, birthtime, location]);

  const handleAutoDetect = useCallback(() => {
    // Try browser geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`);
        },
        () => {
          // Fallback: use timezone
          setLocation(Intl.DateTimeFormat().resolvedOptions().timeZone);
        },
      );
    } else {
      setLocation(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, []);

  return (
    <div data-testid="onboarding-flow" className="relative w-full max-w-md mx-auto min-h-[500px]">
      {/* Progress Bar */}
      <div data-testid="onboarding-progress" className="flex gap-2 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= stepIndex ? 'bg-primary' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Step Counter */}
      <p className="text-center text-sm text-slate-400 mb-4">
        {stepIndex + 1} / {STEPS.length}
      </p>

      {/* Step Content */}
      <AnimatePresence mode="wait" custom={direction}>
        {currentStep === 'birthday' && (
          <motion.div
            key="birthday"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            data-testid="step-birthday"
            className="flex flex-col gap-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">When were you born?</h2>
              <p className="text-slate-400 text-sm">The stars need to know your birthday</p>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Birth Date</label>
              <input
                data-testid="birthday-input"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Birth Time (approx)</label>
              <input
                data-testid="birthtime-input"
                type="time"
                value={birthtime}
                onChange={(e) => setBirthtime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </motion.div>
        )}

        {currentStep === 'location' && (
          <motion.div
            key="location"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            data-testid="step-location"
            className="flex flex-col gap-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Where were you born?</h2>
              <p className="text-slate-400 text-sm">Location matters for your Rising sign</p>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Birth Place</label>
              <input
                data-testid="location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country or coordinates"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-white/20"
              />
            </div>
            <button
              data-testid="auto-detect-btn"
              onClick={handleAutoDetect}
              className="px-4 py-2 text-sm rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors border border-white/10"
            >
              📍 Auto-detect my location
            </button>
          </motion.div>
        )}

        {currentStep === 'reveal' && (
          <motion.div
            key="reveal"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            data-testid="step-reveal"
            className="flex flex-col gap-6 text-center"
          >
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Your cosmic blueprint is ready</h2>
              <p className="text-slate-400 text-sm">
                We&apos;ve calculated your unique astrological profile
              </p>
            </div>
            <div className="py-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-4xl mb-4">
                ✨
              </div>
              <p className="text-lg text-white/80">
                {birthday ? new Date(birthday + 'T12:00').toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                }) : 'Your special day'}
              </p>
              {location && <p className="text-sm text-slate-400 mt-1">{location}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {stepIndex > 0 ? (
          <button
            data-testid="prev-step-btn"
            onClick={goPrev}
            className="px-6 py-3 rounded-xl text-white/60 hover:text-white transition-colors"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        {stepIndex < STEPS.length - 1 ? (
          <button
            data-testid="next-step-btn"
            onClick={goNext}
            className="px-8 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-[0_4px_14px_rgba(107,61,225,0.4)]"
          >
            Next →
          </button>
        ) : (
          <button
            data-testid="finish-btn"
            onClick={handleFinish}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-bold hover:opacity-90 transition-opacity shadow-[0_4px_20px_rgba(107,61,225,0.5)]"
          >
            Reveal My Chart ✨
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
