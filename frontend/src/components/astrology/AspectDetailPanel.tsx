/**
 * AspectDetailPanel
 *
 * A slide-over panel (Sheet) that displays a detailed, structured interpretation
 * of a single planetary aspect. Contains all 11 sections as specified.
 *
 * Usage:
 *   <AspectDetailPanel
 *     aspect={{ planet1: 'Mars', planet2: 'Saturn', type: 'square', orb: 2.5, applying: true }}
 *     open={true}
 *     onClose={() => setselected(null)}
 *   />
 */

import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import {
  displayName,
  ASPECT_TYPE_INFO,
  PLANET_KEYWORDS,
  getOrbInterpretation,
  getApplyingSeparatingText,
  buildCoreMeaning,
  buildPsychologicalPattern,
  buildRealLifeExpression,
  buildBirthChartMeaning,
  buildTransitMeaning,
  buildConstructiveUse,
  buildBeginnerTip,
  buildInterpretationFormula,
} from './aspectInterpretations';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AspectDetailData {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying?: boolean;
}

export interface AspectDetailPanelProps {
  aspect: AspectDetailData | null;
  open: boolean;
  onClose: () => void;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  number,
  title,
  icon,
  children,
  accent = 'border-indigo-500/40',
}: {
  number: number;
  title: string;
  icon: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className={`border-l-2 ${accent} pl-4 py-2`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base" aria-hidden="true">{icon}</span>
        <h4 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
          {number}. {title}
        </h4>
      </div>
      <div className="text-sm text-slate-300 leading-relaxed">{children}</div>
    </div>
  );
}

// ─── Aspect symbol helper ─────────────────────────────────────────────────────

const ASPECT_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  conjunction: { symbol: '\u260C', color: '#fbbf24' },
  opposition: { symbol: '\u260D', color: '#ef4444' },
  trine: { symbol: '\u25B3', color: '#22c55e' },
  square: { symbol: '\u25A1', color: '#f87171' },
  sextile: { symbol: '\u2606', color: '#3b82f6' },
  quincunx: { symbol: '\u26B9', color: '#a78bfa' },
  semisextile: { symbol: '\u26B9', color: '#22d3ee' },
  semisquare: { symbol: '\u2220', color: '#fb923c' },
  sesquiquadrate: { symbol: '\u22C0', color: '#fb923c' },
  sesquisquare: { symbol: '\u22C0', color: '#fb923c' },
  quintile: { symbol: 'Q', color: '#2dd4bf' },
  biquintile: { symbol: 'bQ', color: '#2dd4bf' },
};

// ─── Nature badge variant ─────────────────────────────────────────────────────

function natureBadgeVariant(nature: string): 'success' | 'danger' | 'warning' | 'default' {
  switch (nature) {
    case 'harmonious':
      return 'success';
    case 'challenging':
      return 'danger';
    case 'dynamic':
      return 'warning';
    default:
      return 'default';
  }
}

function natureLabel(nature: string): string {
  switch (nature) {
    case 'harmonious':
      return 'Harmonious';
    case 'challenging':
      return 'Challenging';
    case 'dynamic':
      return 'Dynamic';
    default:
      return 'Neutral';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AspectDetailPanel: React.FC<AspectDetailPanelProps> = ({
  aspect,
  open,
  onClose,
}) => {
  if (!aspect) return null;

  const p1 = displayName(aspect.planet1);
  const p2 = displayName(aspect.planet2);
  const info = ASPECT_TYPE_INFO[aspect.type];
  const symbolInfo = ASPECT_SYMBOLS[aspect.type] ?? { symbol: '?', color: '#888' };
  const orbInfo = getOrbInterpretation(aspect.orb);

  const panelTitle = `${p1} ${symbolInfo.symbol} ${p2}`;
  const subtitle = `${info?.label ?? aspect.type}  |  Orb: ${aspect.orb.toFixed(2)}\u00B0`;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={panelTitle}
      size="xl"
      contentClassName="!p-0"
    >
      {/* ── Header area ──────────────────────────────────────────── */}
      <div className="px-6 pb-4 space-y-3">
        {/* Subtitle */}
        <p className="text-slate-400 text-sm">{subtitle}</p>

        {/* Quick badges */}
        <div className="flex flex-wrap gap-2">
          {/* Nature badge */}
          {info && (
            <Badge variant={natureBadgeVariant(info.nature)} size="sm">
              {natureLabel(info.nature)}
            </Badge>
          )}

          {/* Applying / Separating */}
          <Badge
            variant={aspect.applying ? 'success' : 'warning'}
            size="sm"
          >
            {aspect.applying ? 'Applying' : 'Separating'}
          </Badge>

          {/* Orb tightness */}
          <Badge variant="default" size="sm">
            {orbInfo.level}
          </Badge>

          {/* Planet keyword badges */}
          {(PLANET_KEYWORDS[p1] ?? []).slice(0, 2).map((kw) => (
            <Badge key={`p1-${kw}`} variant="primary" size="sm">
              {p1}: {kw}
            </Badge>
          ))}
          {(PLANET_KEYWORDS[p2] ?? []).slice(0, 2).map((kw) => (
            <Badge key={`p2-${kw}`} variant="primary" size="sm">
              {p2}: {kw}
            </Badge>
          ))}
        </div>
      </div>

      <hr className="border-white/10 mx-6" />

      {/* ── Sections ─────────────────────────────────────────────── */}
      <div className="px-6 py-5 space-y-6 max-h-[60vh] overflow-y-auto">

        {/* 1. Aspect Type */}
        <Section number={1} title="Aspect Type" icon="\u2694\uFE0F" accent="border-amber-500/50">
          <p>{info?.description ?? `The ${aspect.type} aspect.`}</p>
        </Section>

        {/* 2. Orb Meaning */}
        <Section number={2} title="Orb Meaning" icon="\uD83C\uDFAF" accent="border-blue-500/50">
          <p className="mb-1">
            <span className="font-medium text-slate-200">{orbInfo.level}</span>
            {' '}({aspect.orb.toFixed(2)}\u00B0 orb)
          </p>
          <p>{orbInfo.description}</p>
        </Section>

        {/* 3. Applying or Separating */}
        <Section number={3} title="Applying or Separating" icon="\uD83D\uDCC5" accent="border-emerald-500/50">
          <p>{getApplyingSeparatingText(!!aspect.applying, p1, p2, aspect.type)}</p>
        </Section>

        {/* 4. Core Meaning */}
        <Section number={4} title="Core Meaning" icon="\u2728" accent="border-purple-500/50">
          <p>{buildCoreMeaning(p1, aspect.type, p2)}</p>
        </Section>

        {/* 5. Psychological Pattern */}
        <Section number={5} title="Psychological Pattern" icon="\uD83E\uDDE0" accent="border-pink-500/50">
          <p>{buildPsychologicalPattern(p1, aspect.type, p2)}</p>
        </Section>

        {/* 6. Real-Life Expression */}
        <Section number={6} title="Real-Life Expression" icon="\uD83C\uDF0D" accent="border-cyan-500/50">
          <p>{buildRealLifeExpression(p1, aspect.type, p2)}</p>
        </Section>

        {/* 7. Birth Chart Meaning */}
        <Section number={7} title="Birth Chart Meaning" icon="\uD83D\uDCD6" accent="border-yellow-500/50">
          <p>{buildBirthChartMeaning(p1, aspect.type, p2)}</p>
        </Section>

        {/* 8. Transit Meaning */}
        <Section number={8} title="Transit Meaning" icon="\uD83D\uDE80" accent="border-orange-500/50">
          <p>{buildTransitMeaning(p1, aspect.type, p2)}</p>
        </Section>

        {/* 9. Constructive Use */}
        <Section number={9} title="Constructive Use" icon="\uD83D\uDEE1\uFE0F" accent="border-green-500/50">
          <p>{buildConstructiveUse(p1, aspect.type, p2)}</p>
        </Section>

        {/* 10. Beginner Tip */}
        <Section number={10} title="Beginner Tip" icon="\uD83D\uDCA1" accent="border-teal-500/50">
          <p>{buildBeginnerTip(p1, aspect.type, p2)}</p>
        </Section>

        {/* 11. Interpretation Formula */}
        <Section number={11} title="Interpretation Formula" icon="\uD83D\uDCDD" accent="border-indigo-500/50">
          <div className="bg-white/5 rounded-lg p-3 font-mono text-xs text-slate-200 leading-relaxed break-words">
            {buildInterpretationFormula(p1, aspect.type, p2)}
          </div>
        </Section>
      </div>
    </Modal>
  );
};

export default AspectDetailPanel;
