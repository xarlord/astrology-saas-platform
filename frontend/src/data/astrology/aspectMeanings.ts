/**
 * Aspect Meaning Map
 *
 * Centralized, reusable aspect descriptions used across:
 *  - Natal Aspects
 *  - Transits
 *  - Compatibility / Synastry
 *  - Forecast
 *  - Solar Returns
 *  - Lunar Returns
 *
 * Re-exports the builder functions from aspectInterpretations.ts plus
 * adds the structured ASPECT_MEANINGS lookup.
 */

export {
  PLANET_FUNCTIONS,
  PLANET_KEYWORDS,
  ASPECT_TYPE_INFO,
  type AspectTypeInfo,
  getOrbInterpretation,
  getApplyingSeparatingText,
  displayName,
  buildCoreMeaning,
  buildPsychologicalPattern,
  buildRealLifeExpression,
  buildBirthChartMeaning,
  buildTransitMeaning,
  buildConstructiveUse,
  buildBeginnerTip,
  buildInterpretationFormula,
} from '../../components/astrology/aspectInterpretations';

// Re-export planet meanings for convenience
export {
  planetPointMeaningMap,
  getPlanetPointMeaning,
  getPlanetPointDisplayName,
  getPlanetPointSymbol,
  type PlanetPointMeaning,
} from './planetPointMeanings';

import {
  ASPECT_TYPE_INFO,
  type AspectTypeInfo,
  getOrbInterpretation,
  getApplyingSeparatingText,
  buildCoreMeaning,
  buildPsychologicalPattern,
  buildRealLifeExpression,
  buildBirthChartMeaning,
  buildConstructiveUse,
  buildBeginnerTip,
  buildInterpretationFormula,
} from '../../components/astrology/aspectInterpretations';
import { getPlanetPointMeaning, getPlanetPointDisplayName } from './planetPointMeanings';

// ─── Aspect symbol map ───────────────────────────────────────────────────────

export const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
  quincunx: '⚻',
  semisextile: '⚐',
  semisquare: '∠',
  sesquiquadrate: '⋱',
  quintile: 'Q',
  biquintile: '⋆',
  semiquintile: 'dego',
  septile: '⌇',
  novile: '☉',
};

// ─── Aspect nature color map ─────────────────────────────────────────────────

export const ASPECT_NATURE_COLORS: Record<string, string> = {
  harmonious: 'text-emerald-400',
  challenging: 'text-red-400',
  neutral: 'text-amber-400',
  dynamic: 'text-purple-400',
  creative: 'text-teal-400',
};

// ─── Synthesized interpretation for a single aspect row ───────────────────────

export interface AspectInterpretation {
  /** Planet 1 display name */
  p1Name: string;
  /** Planet 2 display name */
  p2Name: string;
  /** Planet 1 meaning data (if available) */
  p1Meaning: ReturnType<typeof getPlanetPointMeaning>;
  /** Planet 2 meaning data (if available) */
  p2Meaning: ReturnType<typeof getPlanetPointMeaning>;
  /** Aspect type info */
  aspectInfo: AspectTypeInfo | undefined;
  /** Aspect symbol */
  aspectSymbol: string;
  /** Orb interpretation */
  orbInfo: ReturnType<typeof getOrbInterpretation>;
  /** Applying/separating text */
  applyingText: string;
  /** Whether applying */
  isApplying: boolean;
  /** Core meaning paragraph */
  coreMeaning: string;
  /** Psychological pattern */
  psychologicalPattern: string;
  /** Real-life expression */
  realLifeExpression: string;
  /** Birth chart meaning */
  birthChartMeaning: string;
  /** Constructive use */
  constructiveUse: string;
  /** Beginner tip */
  beginnerTip: string;
  /** Interpretation formula */
  formula: string;
  /** Whether a specific combination has custom data (future use) */
  hasCustomInterpretation: boolean;
  /** Fallback message if meaning data is incomplete */
  fallbackMessage: string | null;
}

/**
 * Build a full synthesized interpretation for any aspect.
 * Combines planet 1 meaning + aspect meaning + planet 2 meaning + orb + applying status.
 */
export function synthesizeAspectInterpretation(
  planet1: string,
  aspectType: string,
  planet2: string,
  orb: number,
  applying: boolean,
): AspectInterpretation {
  const p1Name = getPlanetPointDisplayName(planet1);
  const p2Name = getPlanetPointDisplayName(planet2);
  const p1Meaning = getPlanetPointMeaning(planet1);
  const p2Meaning = getPlanetPointMeaning(planet2);
  const aspectInfo = ASPECT_TYPE_INFO[aspectType];
  const aspectSymbol = ASPECT_SYMBOLS[aspectType] ?? '';

  const orbInfo = getOrbInterpretation(orb);
  const applyingText = getApplyingSeparatingText(applying, p1Name, p2Name, aspectType);

  // Check if we have complete data
  const hasP1 = !!p1Meaning;
  const hasP2 = !!p2Meaning;
  const hasAspect = !!aspectInfo;
  const hasCustomInterpretation = false; // Future: per-combination custom interpretations
  const hasCompleteData = hasP1 && hasP2 && hasAspect;

  let fallbackMessage: string | null = null;
  if (!hasCompleteData) {
    const missing: string[] = [];
    if (!hasP1) missing.push(p1Name);
    if (!hasAspect) missing.push(aspectType);
    if (!hasP2) missing.push(p2Name);
    fallbackMessage =
      'Detailed interpretation is being prepared for this aspect. For now, use the general aspect guide below.';
  }

  return {
    p1Name,
    p2Name,
    p1Meaning,
    p2Meaning,
    aspectInfo,
    aspectSymbol,
    orbInfo,
    applyingText,
    isApplying: applying,
    coreMeaning: buildCoreMeaning(planet1, aspectType, planet2),
    psychologicalPattern: buildPsychologicalPattern(planet1, aspectType, planet2),
    realLifeExpression: buildRealLifeExpression(planet1, aspectType, planet2),
    birthChartMeaning: buildBirthChartMeaning(planet1, aspectType, planet2),
    constructiveUse: buildConstructiveUse(planet1, aspectType, planet2),
    beginnerTip: buildBeginnerTip(planet1, aspectType, planet2),
    formula: buildInterpretationFormula(planet1, aspectType, planet2),
    hasCustomInterpretation,
    fallbackMessage,
  };
}
