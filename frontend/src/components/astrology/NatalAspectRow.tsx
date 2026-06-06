/**
 * NatalAspectRow — Interactive expandable aspect row
 *
 * Features:
 *  - Click row to expand educational explanation
 *  - Only one row expanded at a time (accordion)
 *  - Info icon visual affordance + cursor pointer + hover state
 *  - Mobile: rows transform into stacked cards
 *  - Synthesized interpretation: planet1 + aspect + planet2 + orb + applying
 *  - Fallback message when meaning data is missing
 *  - Reusable data from centralized aspectMeanings + planetPointMeanings
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  synthesizeAspectInterpretation,
  ASPECT_NATURE_COLORS,
  type AspectInterpretation,
} from '../../data/astrology/aspectMeanings';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NatalAspectData {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying: boolean;
}

export interface NatalAspectRowProps {
  aspects: NatalAspectData[];
  title?: string;
  className?: string;
}

// ─── Chevron icon ────────────────────────────────────────────────────────────

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ─── Info icon ───────────────────────────────────────────────────────────────

function InfoIcon() {
  return (
    <svg
      className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

// ─── Orb strength bar ────────────────────────────────────────────────────────

function OrbStrengthBar({ orb }: { orb: number }) {
  // Inverse: lower orb = stronger. Max 10° = weakest, 0° = strongest.
  const strength = Math.max(0, Math.min(100, (1 - orb / 10) * 100));
  const color =
    orb < 1 ? 'bg-emerald-400' : orb < 3 ? 'bg-green-400' : orb < 5 ? 'bg-yellow-400' : orb < 8 ? 'bg-orange-400' : 'bg-red-400';

  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${strength}%` }} />
      </div>
      <span className="text-[10px] text-slate-500">{strength > 80 ? 'Strong' : strength > 50 ? 'Moderate' : 'Wide'}</span>
    </div>
  );
}

// ─── Expanded explanation panel ──────────────────────────────────────────────

function AspectExplanation({ interp }: { interp: AspectInterpretation }) {
  const sections = [
    {
      title: 'Core Meaning',
      content: interp.coreMeaning,
      icon: '✦',
    },
    {
      title: 'Psychological Pattern',
      content: interp.psychologicalPattern,
      icon: '🧠',
    },
    {
      title: 'In Daily Life',
      content: interp.realLifeExpression,
      icon: '🌟',
    },
    {
      title: 'In Your Birth Chart',
      content: interp.birthChartMeaning,
      icon: '📜',
    },
    {
      title: 'How to Work With It',
      content: interp.constructiveUse,
      icon: '⚡',
    },
  ];

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="px-4 pb-4 pt-2 border-t border-white/10">
        {/* Orb strength + Applying/Separating */}
        <div className="flex flex-wrap gap-4 mb-4 mt-2">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider">Orb Strength</span>
            <div className="mt-1">
              <span className="text-sm text-slate-300">{interp.orbInfo.level}</span>
              <OrbStrengthBar orb={0} />
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider">Status</span>
            <div className="mt-1">
              <span className={`text-sm font-medium ${interp.isApplying ? 'text-emerald-400' : 'text-amber-400'}`}>
                {interp.isApplying ? '↑ Applying' : '↓ Separating'}
              </span>
            </div>
          </div>
          {interp.aspectInfo && (
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Nature</span>
              <div className="mt-1">
                <span className={`text-sm font-medium ${ASPECT_NATURE_COLORS[interp.aspectInfo.nature] ?? 'text-slate-300'}`}>
                  {interp.aspectInfo.nature.charAt(0).toUpperCase() + interp.aspectInfo.nature.slice(1)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Fallback message */}
        {interp.fallbackMessage && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200 text-sm">
            {interp.fallbackMessage}
          </div>
        )}

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>{s.icon}</span> {s.title}
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>

        {/* Formula */}
        <div className="mt-4 p-3 bg-white/5 rounded-lg">
          <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-1">Interpretation Formula</h4>
          <p className="text-xs text-slate-400 font-mono">{interp.formula}</p>
        </div>

        {/* Beginner tip */}
        <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-slate-300 leading-relaxed">{interp.beginnerTip}</p>
        </div>

        {/* Planet details */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {interp.p1Meaning && (
            <div className="p-3 bg-white/5 rounded-lg">
              <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                {interp.p1Meaning.symbol} {interp.p1Name}
              </h4>
              <p className="text-xs text-slate-400">{interp.p1Meaning.coreFunction}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {interp.p1Meaning.keywords.map((k) => (
                  <span key={k} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-slate-400">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
          {interp.p2Meaning && (
            <div className="p-3 bg-white/5 rounded-lg">
              <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                {interp.p2Meaning.symbol} {interp.p2Name}
              </h4>
              <p className="text-xs text-slate-400">{interp.p2Meaning.coreFunction}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {interp.p2Meaning.keywords.map((k) => (
                  <span key={k} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-slate-400">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Desktop row ─────────────────────────────────────────────────────────────

function DesktopAspectRow({
  aspect,
  isExpanded,
  onToggle,
}: {
  aspect: NatalAspectData;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const interp = synthesizeAspectInterpretation(aspect.planet1, aspect.type, aspect.planet2, aspect.orb, aspect.applying);

  const orbDeg = Math.floor(aspect.orb);
  const orbMin = Math.floor((aspect.orb - orbDeg) * 60 + 0.5);
  const natureColor = interp.aspectInfo
    ? ASPECT_NATURE_COLORS[interp.aspectInfo.nature] ?? ''
    : '';

  return (
    <>
      <tr
        onClick={onToggle}
        className={`
          border-b border-white/5 cursor-pointer transition-all duration-200
          hover:bg-white/[0.07]
          ${isExpanded ? 'bg-white/[0.05]' : ''}
          group
        `}
        role="button"
        aria-expanded={isExpanded}
        aria-label={`${interp.p1Name} ${interp.aspectSymbol} ${interp.p2Name} — click to ${isExpanded ? 'close' : 'view meaning'}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <td className="py-2.5 px-2 font-medium">
          <div className="flex items-center gap-1.5">
            {interp.p1Meaning && <span className="text-base">{interp.p1Meaning.symbol}</span>}
            {interp.p1Name}
          </div>
        </td>
        <td className="py-2.5 px-2">
          <div className="flex items-center gap-1.5">
            <span className={`text-base ${natureColor}`}>{interp.aspectSymbol}</span>
            <span className="text-slate-300 capitalize">{aspect.type}</span>
          </div>
        </td>
        <td className="py-2.5 px-2 font-medium">
          <div className="flex items-center gap-1.5">
            {interp.p2Meaning && <span className="text-base">{interp.p2Meaning.symbol}</span>}
            {interp.p2Name}
          </div>
        </td>
        <td className="py-2.5 px-2 text-right text-slate-400">
          {orbDeg}°{orbMin}'
        </td>
        <td className="py-2.5 px-2 text-right">
          <span className={`text-sm font-medium ${aspect.applying ? 'text-emerald-400' : 'text-amber-400'}`}>
            {aspect.applying ? 'Applying' : 'Separating'}
          </span>
        </td>
        <td className="py-2.5 px-2 text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-slate-500 group-hover:text-primary transition-colors hidden sm:inline">
              {isExpanded ? 'Hide' : 'View Meaning'}
            </span>
            <InfoIcon />
            <ChevronIcon expanded={isExpanded} />
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="p-0">
            <AspectExplanation interp={interp} />
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Mobile card ─────────────────────────────────────────────────────────────

function MobileAspectCard({
  aspect,
  isExpanded,
  onToggle,
}: {
  aspect: NatalAspectData;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const interp = synthesizeAspectInterpretation(aspect.planet1, aspect.type, aspect.planet2, aspect.orb, aspect.applying);

  const orbDeg = Math.floor(aspect.orb);
  const orbMin = Math.floor((aspect.orb - orbDeg) * 60 + 0.5);
  const natureColor = interp.aspectInfo
    ? ASPECT_NATURE_COLORS[interp.aspectInfo.nature] ?? ''
    : '';

  return (
    <div
      className={`
        border border-white/10 rounded-xl overflow-hidden transition-all duration-200
        ${isExpanded ? 'bg-white/[0.05]' : 'bg-white/[0.02] hover:bg-white/[0.05]'}
      `}
      role="button"
      aria-expanded={isExpanded}
      aria-label={`${interp.p1Name} ${interp.aspectSymbol} ${interp.p2Name} — click to ${isExpanded ? 'close' : 'view meaning'}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {/* Card header — always visible */}
      <div className="p-3 cursor-pointer" onClick={onToggle}>
        {/* Planet 1 → Aspect → Planet 2 */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 font-medium">
            {interp.p1Meaning && <span className="text-lg">{interp.p1Meaning.symbol}</span>}
            <span>{interp.p1Name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-lg ${natureColor}`}>{interp.aspectSymbol}</span>
            <span className="text-slate-400 text-sm capitalize">{aspect.type}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            {interp.p2Meaning && <span className="text-lg">{interp.p2Meaning.symbol}</span>}
            <span>{interp.p2Name}</span>
          </div>
        </div>

        {/* Orb + Applying/Separating + View Meaning */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Orb: {orbDeg}°{orbMin}'</span>
            <span className={aspect.applying ? 'text-emerald-400' : 'text-amber-400'}>
              {aspect.applying ? '↑ Applying' : '↓ Separating'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-primary">{isExpanded ? 'Hide' : 'View Meaning'}</span>
            <ChevronIcon expanded={isExpanded} />
          </div>
        </div>
      </div>

      {/* Expanded explanation */}
      <AnimatePresence>
        {isExpanded && <AspectExplanation interp={interp} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function NatalAspectRow({ aspects, title = 'Natal Aspects', className = '' }: NatalAspectRowProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }, []);

  const sortedAspects = [...aspects].sort((a, b) => a.orb - b.orb);

  return (
    <div className={`bg-cosmic-card-solid border border-white/15 rounded-2xl p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-4">
        {title}{' '}
        <span className="text-slate-400 font-normal text-base">({sortedAspects.length})</span>
      </h2>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/20 text-slate-400">
              <th className="text-left py-2 px-2">Point 1</th>
              <th className="text-left py-2 px-2">Aspect</th>
              <th className="text-left py-2 px-2">Point 2</th>
              <th className="text-right py-2 px-2">Orb</th>
              <th className="text-right py-2 px-2">Type</th>
              <th className="text-right py-2 px-2 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {sortedAspects.map((aspect, i) => (
              <DesktopAspectRow
                key={`${aspect.planet1}-${aspect.type}-${aspect.planet2}-${i}`}
                aspect={aspect}
                isExpanded={expandedIndex === i}
                onToggle={() => handleToggle(i)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden space-y-3">
        {sortedAspects.map((aspect, i) => (
          <MobileAspectCard
            key={`${aspect.planet1}-${aspect.type}-${aspect.planet2}-${i}`}
            aspect={aspect}
            isExpanded={expandedIndex === i}
            onToggle={() => handleToggle(i)}
          />
        ))}
      </div>
    </div>
  );
}
