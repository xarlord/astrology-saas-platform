/**
 * PlanetDeepDiveCard Component
 *
 * Full-screen card that shows detailed information about a selected planet:
 * - Sign placement, house placement, degree
 * - Aspects to other planets
 * - AI-generated interpretation
 * - Element-themed gradient background
 *
 * Animated entrance: planet zooms up with particle burst effect.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PlanetAspectInfo {
  planet: string;
  type: string;
  orb: number;
  harmonious: boolean;
}

export interface PlanetInfo {
  name: string;
  symbol: string;
  degree: number;
  minute: number;
  sign: string;
  house: number;
  element: 'fire' | 'earth' | 'air' | 'water';
  retrograde: boolean;
  aspects: PlanetAspectInfo[];
  interpretation?: string;
}

export interface PlanetDeepDiveCardProps {
  planet: PlanetInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onGetInterpretation?: (planetName: string) => Promise<string>;
}

const ELEMENT_GRADIENTS: Record<string, string> = {
  fire: 'from-red-900/80 via-orange-900/60 to-amber-900/40',
  earth: 'from-green-900/80 via-emerald-900/60 to-teal-900/40',
  air: 'from-blue-900/80 via-sky-900/60 to-cyan-900/40',
  water: 'from-indigo-900/80 via-purple-900/60 to-violet-900/40',
};

const ELEMENT_ICONS: Record<string, string> = {
  fire: '🔥',
  earth: '🌍',
  air: '💨',
  water: '💧',
};

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
  quincunx: '⚺',
};

export const PlanetDeepDiveCard: React.FC<PlanetDeepDiveCardProps> = ({
  planet,
  isOpen,
  onClose,
  onGetInterpretation,
}) => {
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);

  const handleGetInterpretation = async () => {
    if (!planet || !onGetInterpretation) return;
    setIsLoadingInterpretation(true);
    try {
      const text = await onGetInterpretation(planet.name);
      setInterpretation(text);
    } catch {
      setInterpretation('Unable to generate interpretation at this time.');
    } finally {
      setIsLoadingInterpretation(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && planet && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            data-testid="deep-dive-backdrop"
          />

          {/* Card */}
          <motion.div
            className={`fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto rounded-2xl bg-gradient-to-br ${ELEMENT_GRADIENTS[planet.element]} border border-white/10 shadow-2xl z-50 overflow-hidden`}
            initial={{ scale: 0.3, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.3, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            data-testid="deep-dive-card"
            role="dialog"
            aria-label={`${planet.name} in ${planet.sign} details`}
          >
            {/* Particle burst decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 8 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-white/30"
                  style={{
                    left: '50%',
                    top: '40%',
                  }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos((i * Math.PI) / 4) * 200,
                    y: Math.sin((i * Math.PI) / 4) * 200,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                />
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
              aria-label="Close planet details"
              data-testid="deep-dive-close"
            >
              ✕
            </button>

            <div className="p-6">
              {/* Planet Header */}
              <div className="text-center mb-6">
                <motion.div
                  className="text-5xl mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  {planet.symbol}
                </motion.div>
                <h2 className="text-2xl font-bold text-white">{planet.name}</h2>
                <p className="text-white/70">
                  {ELEMENT_ICONS[planet.element]} {planet.element.charAt(0).toUpperCase() + planet.element.slice(1)} Planet
                </p>
              </div>

              {/* Placement Info */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/50 uppercase tracking-wider">Sign</div>
                  <div className="text-lg font-semibold text-white">{planet.sign}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/50 uppercase tracking-wider">House</div>
                  <div className="text-lg font-semibold text-white">{planet.house}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/50 uppercase tracking-wider">Degree</div>
                  <div className="text-lg font-semibold text-white">
                    {planet.degree}°{planet.minute}&apos;
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/50 uppercase tracking-wider">Motion</div>
                  <div className="text-lg font-semibold text-white">
                    {planet.retrograde ? '℞ Retrograde' : 'Direct'}
                  </div>
                </div>
              </div>

              {/* Aspects */}
              {planet.aspects.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                    Aspects
                  </h3>
                  <div className="space-y-2">
                    {planet.aspects.map((aspect, i) => (
                      <motion.div
                        key={`${aspect.planet}-${aspect.type}`}
                        className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                      >
                        <span className="text-white/80">
                          {ASPECT_SYMBOLS[aspect.type] || '?'} {aspect.type} {aspect.planet}
                        </span>
                        <span className="text-white/50 text-sm">
                          {aspect.orb.toFixed(1)}° orb
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Interpretation */}
              <div className="mb-4">
                {interpretation ? (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                      AI Interpretation
                    </h3>
                    <p className="text-white/90 text-sm leading-relaxed">{interpretation}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => void handleGetInterpretation()}
                    disabled={isLoadingInterpretation}
                    className="w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors disabled:opacity-50"
                    data-testid="get-interpretation-btn"
                  >
                    {isLoadingInterpretation ? 'Generating...' : '✨ Get AI Interpretation'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PlanetDeepDiveCard;
