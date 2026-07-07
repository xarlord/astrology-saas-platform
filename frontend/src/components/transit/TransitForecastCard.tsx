/**
 * TransitForecastCard — Expandable transit forecast card
 *
 * Each card displays:
 * 1. Transit Title (Transiting Planet + Aspect + Natal Planet/Point)
 * 2. Date Range
 * 3. Peak Date
 * 4. Orb
 * 5. Status (Applying / Separating / Exact)
 * 6. Intensity Score
 * 7. Short Summary
 * 8. Expandable Detailed Interpretation:
 *    - Core Meaning
 *    - Psychological Pattern
 *    - Real-Life Expression
 *    - Best Practices
 *    - Challenges to Navigate
 *    - Reflection Question
 *    - Beginner Tip
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlanetSymbol } from '../PlanetSymbol';
import { AspectSymbol } from '../AspectSymbol';

// ============================================================================
// TYPES
// ============================================================================

export type TransitStatus = 'Applying' | 'Separating' | 'Exact';

export interface TransitInterpretationDetail {
  general: string;
  themes: string[];
  coreMeaning: string;
  psychologicalPattern: string;
  realLifeExpression: string;
  reflectionQuestion: string;
  beginnerTip: string;
  advice: {
    positive: string[];
    challenges: string[];
    suggestions: string[];
  };
}

export interface TransitForecastCardData {
  transitingPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
  applying: boolean;
  startDate: string;
  endDate: string;
  peakDate: string;
  intensity: number; // 1-10
  interpretation: TransitInterpretationDetail;
}

interface TransitForecastCardProps {
  transit: TransitForecastCardData;
  /** Start expanded */
  defaultExpanded?: boolean;
  /** Click handler — fired on the collapsed card header */
  onTransitClick?: (transit: TransitForecastCardData) => void;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatOrb(orb: number): string {
  const abs = Math.abs(orb);
  const degrees = Math.floor(abs);
  const minutes = Math.round((abs - degrees) * 60);
  return `${degrees}°${String(minutes).padStart(2, '0')}'`;
}

function getTransitStatus(transit: TransitForecastCardData): TransitStatus {
  if (Math.abs(transit.orb) <= 0.08) return 'Exact';
  return transit.applying ? 'Applying' : 'Separating';
}

function getIntensityColor(intensity: number): string {
  if (intensity >= 8) return '#EF4444';
  if (intensity >= 6) return '#F59E0B';
  if (intensity >= 4) return '#6366F1';
  return '#10B981';
}

function getIntensityLabel(intensity: number): string {
  if (intensity >= 9) return 'Peak';
  if (intensity >= 7) return 'High';
  if (intensity >= 5) return 'Moderate';
  if (intensity >= 3) return 'Mild';
  return 'Subtle';
}

function getStatusColor(status: TransitStatus): string {
  switch (status) {
    case 'Exact':
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    case 'Applying':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'Separating':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  }
}

function getStatusIcon(status: TransitStatus): string {
  switch (status) {
    case 'Exact':
      return 'target';
    case 'Applying':
      return 'trending_up';
    case 'Separating':
      return 'trending_down';
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export const TransitForecastCard: React.FC<TransitForecastCardProps> = ({
  transit,
  defaultExpanded = false,
  onTransitClick,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const status = getTransitStatus(transit);
  const intensityColor = getIntensityColor(transit.intensity);

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
    onTransitClick?.(transit);
  };

  const interp = transit.interpretation;

  return (
    <motion.div
      className={`
        rounded-2xl border overflow-hidden transition-all
        bg-cosmic-card/70 backdrop-blur-md
        ${expanded ? 'border-white/15 shadow-lg' : 'border-white/10 hover:border-white/20'}
        ${className}
      `}
      layout
    >
      {/* ── Collapsed Header ────────────────────────────────────── */}
      <button
        onClick={toggleExpand}
        className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-inset"
        aria-expanded={expanded}
        aria-label={`${transit.transitingPlanet} ${transit.aspect} ${transit.natalPlanet} — click to ${expanded ? 'collapse' : 'expand'} details`}
      >
        {/* Row 1: Planet symbols + Aspect + Intensity */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <PlanetSymbol planet={transit.transitingPlanet} size="md" />
            <AspectSymbol aspect={transit.aspect} size="md" />
            <PlanetSymbol planet={transit.natalPlanet} size="md" />
          </div>

          {/* Intensity Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: intensityColor }}
          >
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            {transit.intensity}/10
          </div>
        </div>

        {/* Row 2: Title */}
        <h4 className="text-white font-semibold text-sm mb-2">
          Transiting {transit.transitingPlanet} {transit.aspect} Natal {transit.natalPlanet}
        </h4>

        {/* Row 3: Metadata pills */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {/* Date Range */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-xs">
            <span className="material-symbols-outlined text-[12px]">date_range</span>
            {formatShortDate(transit.startDate)} – {formatShortDate(transit.endDate)}
          </span>

          {/* Peak Date */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-xs">
            <span className="material-symbols-outlined text-[12px]">today</span>
            Peak: {formatShortDate(transit.peakDate)}
          </span>

          {/* Orb */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-xs">
            <span className="material-symbols-outlined text-[12px]">radio_button_unchecked</span>
            Orb: {formatOrb(transit.orb)}
          </span>

          {/* Status */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${getStatusColor(status)}`}
          >
            <span className="material-symbols-outlined text-[12px]">{getStatusIcon(status)}</span>
            {status}
          </span>
        </div>

        {/* Row 4: Intensity bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>Intensity</span>
            <span>{getIntensityLabel(transit.intensity)}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${transit.intensity * 10}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ backgroundColor: intensityColor }}
            />
          </div>
        </div>

        {/* Row 5: Short Summary */}
        {interp.general && (
          <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
            {interp.general}
          </p>
        )}

        {/* Expand indicator */}
        <div className="flex items-center justify-center mt-2">
          <motion.span
            className="material-symbols-outlined text-slate-500 text-[18px]"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            expand_more
          </motion.span>
        </div>
      </button>

      {/* ── Expanded Detail ─────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
              {/* Themes Tags */}
              {interp.themes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {interp.themes.map((theme) => (
                    <span
                      key={`theme-${theme}`}
                      className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[11px] font-medium"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}

              {/* Core Meaning */}
              <DetailSection
                icon="auto_awesome"
                title="Core Meaning"
                accentColor="#6b3de1"
              >
                <p className="text-slate-200 text-xs leading-relaxed">
                  {interp.coreMeaning}
                </p>
              </DetailSection>

              {/* Psychological Pattern */}
              <DetailSection
                icon="psychology"
                title="Psychological Pattern"
                accentColor="#3b82f6"
              >
                <p className="text-slate-200 text-xs leading-relaxed">
                  {interp.psychologicalPattern}
                </p>
              </DetailSection>

              {/* Real-Life Expression */}
              <DetailSection
                icon="theater_comedy"
                title="Real-Life Expression"
                accentColor="#10b981"
              >
                <p className="text-slate-200 text-xs leading-relaxed">
                  {interp.realLifeExpression}
                </p>
              </DetailSection>

              {/* Best Practices + Challenges grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DetailSection
                  icon="check_circle"
                  title="Best Practices"
                  accentColor="#22c55e"
                >
                  <ul className="space-y-1.5">
                    {interp.advice.positive.map((item, i) => (
                      <li key={`positive-${i}`} className="flex items-start gap-2 text-xs text-slate-200">
                        <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </DetailSection>

                <DetailSection
                  icon="warning"
                  title="Challenges to Navigate"
                  accentColor="#f59e0b"
                >
                  <ul className="space-y-1.5">
                    {interp.advice.challenges.map((item, i) => (
                      <li key={`challenge-${i}`} className="flex items-start gap-2 text-xs text-slate-200">
                        <span className="text-amber-500 mt-0.5 shrink-0">!</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </DetailSection>
              </div>

              {/* Reflection Question */}
              {interp.reflectionQuestion && (
                <DetailSection
                  icon="help"
                  title="Reflection Question"
                  accentColor="#a855f7"
                >
                  <p className="text-slate-100 text-xs italic leading-relaxed">
                    &ldquo;{interp.reflectionQuestion}&rdquo;
                  </p>
                </DetailSection>
              )}

              {/* Beginner Tip */}
              {interp.beginnerTip && (
                <div className="bg-primary/5 border border-primary/15 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[16px] mt-0.5 shrink-0">
                      lightbulb
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70 block mb-1">
                        Beginner Tip
                      </span>
                      <p className="text-slate-200 text-xs leading-relaxed">
                        {interp.beginnerTip}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================================================
// DETAIL SECTION SUB-COMPONENT
// ============================================================================

interface DetailSectionProps {
  icon: string;
  title: string;
  accentColor: string;
  children: React.ReactNode;
}

function DetailSection({ icon, title, accentColor, children }: DetailSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className="material-symbols-outlined text-[14px]"
          style={{ color: accentColor }}
        >
          {icon}
        </span>
        <h5
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: accentColor }}
        >
          {title}
        </h5>
      </div>
      {children}
    </div>
  );
}

export default TransitForecastCard;
