/**
 * Shared transit helper functions
 *
 * Pure utility functions extracted from TransitPage, TodayTransitsPage,
 * and ForecastPage to avoid duplication.
 *
 * Uses synthesizeAspectInterpretation from aspectMeanings for rich
 * psychological, real-life, and constructive-use interpretations.
 */

import type {
  Transit,
  TransitHighlight,
  TransitCalendarDay,
} from '../components/TransitDashboard';
import type { TransitReading } from '../services/transit.service';
import {
  synthesizeAspectInterpretation,
  getOrbInterpretation,
  getApplyingSeparatingText,
  getPlanetPointMeaning,
  displayName,
  ASPECT_TYPE_INFO,
} from '../data/astrology/aspectMeanings';

/** The shape of a single transit entry inside a TransitReading. */
type TransitEntry = NonNullable<TransitReading['transits']>[number];

// ---------------------------------------------------------------------------
// Structured interpretation output — consumed by TransitDetailModal
// ---------------------------------------------------------------------------

export interface TransitInterpretationOutput {
  /** Header title e.g. "Transiting Mars square Natal Moon" */
  header: string;
  /** Date range details */
  dateSection: {
    formattedStart: string;
    formattedEnd: string;
    formattedPeak: string;
  };
  /** Transiting planet info */
  transitingPlanetSection: {
    symbol: string;
    name: string;
    meaning: string;
    keywords: string[];
  };
  /** Aspect info */
  aspectSection: {
    label: string;
    nature: string;
    description: string;
  };
  /** Natal planet info */
  natalPlanetSection: {
    symbol: string;
    name: string;
    meaning: string;
    keywords: string[];
  };
  /** Orb strength */
  orbSection: {
    level: string;
    description: string;
  };
  /** Applying / separating status */
  statusSection: {
    isApplying: boolean;
    label: string;
    text: string;
  };
  /** House synthesis (only if available) */
  houseSection: {
    available: boolean;
    synthesis: string | null;
  };
  /** Main synthesis paragraph */
  synthesis: string;
  /** Real-life manifestations */
  manifestations: string[];
  /** Constructive approach */
  advice: string;
  /** Beginner-friendly summary */
  beginnerSummary: string;
  /** Legacy fields for backwards compatibility */
  general: string;
  themes: string[];
  coreMeaning: string;
  psychologicalPattern: string;
  realLifeExpression: string;
  reflectionQuestion: string;
  beginnerTip: string;
}

// ---------------------------------------------------------------------------
// Planet speed data (average daily motion in degrees)
// Used to estimate transit duration windows.
// ---------------------------------------------------------------------------

const PLANET_DAILY_SPEED: Record<string, number> = {
  sun: 1.0,
  moon: 13.2,
  mercury: 1.4,
  venus: 1.2,
  mars: 0.72,
  jupiter: 0.083,
  saturn: 0.034,
  uranus: 0.012,
  neptune: 0.006,
  pluto: 0.004,
  chiron: 0.009,
  northnode: 0.053,
  southnode: 0.053,
};

const ACTIVE_ORB: Record<string, number> = {
  conjunction: 10,
  opposition: 8,
  trine: 8,
  square: 6,
  sextile: 4,
  quincunx: 3,
  semisextile: 2,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatShortDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function estimateTransitWindow(params: {
  transitingPlanet: string;
  aspect: string;
  orb: number;
  currentDate: string;
  applying: boolean;
}): { startDate: string; peakDate: string; endDate: string } {
  const { transitingPlanet, aspect, orb, currentDate, applying } = params;
  const speed = PLANET_DAILY_SPEED[transitingPlanet.toLowerCase()] ?? 0.5;
  const maxOrb = ACTIVE_ORB[aspect] ?? 6;
  const current = new Date(currentDate);
  const daysToPeak = Math.abs(orb) / speed;
  const daysFromPeakToLeave = maxOrb / speed;

  const peakDate = new Date(current);
  peakDate.setDate(peakDate.getDate() + Math.round(daysToPeak));

  let startDate = new Date(current);
  let endDate = new Date(current);

  if (applying) {
    startDate = new Date(current);
    endDate = new Date(peakDate);
    endDate.setDate(endDate.getDate() + Math.round(daysFromPeakToLeave));
  } else {
    startDate = new Date(peakDate);
    startDate.setDate(startDate.getDate() - Math.round(daysFromPeakToLeave));
    endDate = new Date(current);
    endDate.setDate(endDate.getDate() + Math.round((maxOrb - Math.abs(orb)) / speed));
  }

  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { startDate: fmt(startDate), peakDate: fmt(peakDate), endDate: fmt(endDate) };
}

function buildReflectionQuestion(p1Name: string, p2Name: string, aspectType: string): string {
  const questions: Record<string, string> = {
    conjunction: `How are ${p1Name} and ${p2Name} merging in your life right now? Where do you feel their combined energy most strongly?`,
    opposition: `Where are you feeling torn between ${p1Name} themes and ${p2Name} needs? What would it look like to honor both sides?`,
    trine: `What natural gifts are you taking for granted right now? How could you more actively use the flow between ${p1Name} and ${p2Name}?`,
    square: `What tension between ${p1Name} and ${p2Name} is asking to be resolved? What action is this friction pushing you toward?`,
    sextile: `What opportunity is presenting itself through the connection between ${p1Name} and ${p2Name}? Are you reaching for it?`,
    quincunx: `What feels slightly off between your ${p1Name} needs and ${p2Name} instincts? What small adjustment could bring more alignment?`,
  };
  return questions[aspectType] ?? `How are ${p1Name} and ${p2Name} interacting in your life right now?`;
}

function buildManifestations(
  p1Name: string,
  p2Name: string,
  aspectType: string,
  p1Meaning: ReturnType<typeof getPlanetPointMeaning>,
  p2Meaning: ReturnType<typeof getPlanetPointMeaning>,
): string[] {
  const manifestations: string[] = [];

  if (p1Meaning) {
    manifestations.push(`${p1Name} transit theme: ${p1Meaning.inTransit}`);
  }
  if (p2Meaning) {
    manifestations.push(`${p2Name} natal theme: ${p2Meaning.inBirthChart}`);
  }

  const aspectInfo = ASPECT_TYPE_INFO[aspectType];
  if (aspectInfo) {
    manifestations.push(`This ${aspectInfo.label} aspect brings ${aspectInfo.dynamic}.`);
  }

  if (p1Meaning?.healthyExpression) {
    manifestations.push(`Positive expression: ${p1Meaning.healthyExpression}`);
  }
  if (p1Meaning?.difficultExpression) {
    manifestations.push(`Watch for shadow: ${p1Meaning.difficultExpression}`);
  }

  return manifestations;
}

function calculateTransitIntensity(aspectType: string, orb: number, planet: string): number {
  const baseIntensity: Record<string, number> = {
    conjunction: 10, opposition: 9, square: 8, trine: 7,
    sextile: 5, quincunx: 6, semisextile: 3,
  };
  const base = baseIntensity[aspectType] ?? 5;
  const orbFactor = 1 - Math.abs(orb) / 10;
  const planetFactor = getPlanetIntensityFactor(planet);
  return Math.max(1, Math.min(10, Math.round(base * orbFactor * planetFactor)));
}

function getPlanetIntensityFactor(planet: string): number {
  const factors: Record<string, number> = {
    pluto: 1.0, saturn: 1.0, uranus: 0.95, neptune: 0.95,
    jupiter: 0.9, sun: 0.85, mars: 0.8, moon: 0.75,
    venus: 0.7, mercury: 0.65, chiron: 0.85, northnode: 0.7, southnode: 0.7,
  };
  return factors[planet.toLowerCase()] ?? 0.5;
}

// ---------------------------------------------------------------------------
// Main mapping function
// ---------------------------------------------------------------------------

/**
 * Map a raw TransitReading transit to a Transit object expected by
 * TransitDashboard. Uses synthesizeAspectInterpretation for rich
 * psychological meaning, real-life expression, constructive use, etc.
 */
export function mapReadingToTransit(
  r: TransitEntry,
  reading: TransitReading,
): Transit {
  const transitingPlanet = r.transitPlanet;
  const natalPlanet = r.natalPlanet;
  const aspectType = r.aspect;
  const orb = r.orb;
  const applying = orb > 0;

  // Get rich interpretation from the aspect interpretation engine
  const synth = synthesizeAspectInterpretation(
    transitingPlanet, aspectType, natalPlanet, Math.abs(orb), applying,
  );

  // Transit window estimation
  const window = estimateTransitWindow({
    transitingPlanet, aspect: aspectType, orb,
    currentDate: reading.date, applying,
  });

  // Planet meaning lookups
  const p1Meaning = getPlanetPointMeaning(transitingPlanet);
  const p2Meaning = getPlanetPointMeaning(natalPlanet);

  // Orb interpretation
  const orbInfo = getOrbInterpretation(Math.abs(orb));

  // Applying/separating text
  const statusText = getApplyingSeparatingText(
    applying, synth.p1Name, synth.p2Name, aspectType,
  );

  // Derive themes
  const themes: string[] = [
    ...(p1Meaning?.keywords ?? []),
    ...(synth.aspectInfo?.dynamic ? [synth.aspectInfo.dynamic] : []),
    ...(p2Meaning?.keywords ?? []),
  ].slice(0, 6);

  // Advice arrays
  const positive: string[] = [];
  const challenges: string[] = [];
  const suggestions: string[] = [];

  if (synth.constructiveUse) positive.push(synth.constructiveUse);
  if (p1Meaning?.healthyExpression) positive.push(`Healthy expression: ${p1Meaning.healthyExpression}`);

  if (p1Meaning?.difficultExpression) challenges.push(`Watch for: ${p1Meaning.difficultExpression}`);
  if (p2Meaning?.difficultExpression) challenges.push(`Shadow side: ${p2Meaning.difficultExpression}`);

  if (synth.realLifeExpression) suggestions.push(synth.realLifeExpression);
  if (synth.beginnerTip) suggestions.push(synth.beginnerTip);

  const intensity = calculateTransitIntensity(aspectType, orb, transitingPlanet);
  const reflectionQuestion = buildReflectionQuestion(synth.p1Name, synth.p2Name, aspectType);

  // Build the full structured output for the detail modal
  const structured: TransitInterpretationOutput = {
    header: `Transiting ${synth.p1Name} ${synth.aspectSymbol} Natal ${synth.p2Name}`,
    dateSection: {
      formattedStart: formatShortDate(window.startDate),
      formattedEnd: formatShortDate(window.endDate),
      formattedPeak: formatShortDate(window.peakDate),
    },
    transitingPlanetSection: {
      symbol: p1Meaning?.symbol ?? '',
      name: synth.p1Name,
      meaning: p1Meaning?.description ?? synth.p1Meaning?.coreFunction ?? `The transiting planet ${synth.p1Name}.`,
      keywords: p1Meaning?.keywords ?? [],
    },
    aspectSection: {
      label: synth.aspectInfo?.label ?? aspectType,
      nature: synth.aspectInfo?.nature ?? 'neutral',
      description: synth.aspectInfo?.description ?? `The ${aspectType} aspect.`,
    },
    natalPlanetSection: {
      symbol: p2Meaning?.symbol ?? '',
      name: synth.p2Name,
      meaning: p2Meaning?.description ?? synth.p2Meaning?.coreFunction ?? `The natal planet ${synth.p2Name}.`,
      keywords: p2Meaning?.keywords ?? [],
    },
    orbSection: {
      level: orbInfo.level,
      description: orbInfo.description,
    },
    statusSection: {
      isApplying: applying,
      label: applying ? 'Applying (Building)' : 'Separating (Fading)',
      text: statusText,
    },
    houseSection: {
      available: false,
      synthesis: null,
    },
    synthesis: synth.coreMeaning,
    manifestations: buildManifestations(synth.p1Name, synth.p2Name, aspectType, p1Meaning, p2Meaning),
    advice: synth.constructiveUse,
    beginnerSummary: synth.beginnerTip,
    // Legacy fields
    general: synth.coreMeaning,
    themes,
    coreMeaning: synth.coreMeaning,
    psychologicalPattern: synth.psychologicalPattern,
    realLifeExpression: synth.realLifeExpression,
    reflectionQuestion,
    beginnerTip: synth.beginnerTip,
  };

  return {
    transitingPlanet,
    natalPlanet,
    type: aspectType,
    orb: Math.abs(orb),
    applying,
    startDate: window.startDate,
    endDate: window.endDate,
    peakDate: window.peakDate,
    intensity,
    interpretation: {
      general: synth.coreMeaning,
      themes,
      coreMeaning: synth.coreMeaning,
      psychologicalPattern: synth.psychologicalPattern,
      realLifeExpression: synth.realLifeExpression,
      reflectionQuestion,
      beginnerTip: synth.beginnerTip,
      advice: { positive, challenges, suggestions },
      _structured: structured,
    },
  };
}

// ---------------------------------------------------------------------------
// Highlights
// ---------------------------------------------------------------------------

export function deriveHighlights(reading: TransitReading | undefined): TransitHighlight[] {
  if (!reading) return [];

  const OUTER_PLANETS = new Set(['saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'north_node', 'south_node']);
  const LUMINARIES = new Set(['sun', 'moon']);

  function classifyTransit(planet: string): 'major-transit' | 'minor-transit' | 'personal-transit' {
    const p = planet.toLowerCase();
    if (OUTER_PLANETS.has(p)) return 'major-transit';
    if (LUMINARIES.has(p)) return 'personal-transit';
    return 'minor-transit';
  }

  return (reading.transits ?? [])
    .filter((t) => Math.abs(t.orb) <= 3)
    .map((t) => {
      const synth = synthesizeAspectInterpretation(
        t.transitPlanet, t.aspect, t.natalPlanet, Math.abs(t.orb), t.orb > 0,
      );
      return {
        type: classifyTransit(t.transitPlanet) as TransitHighlight['type'],
        title: `${synth.p1Name} ${synth.aspectSymbol} ${synth.p2Name}`,
        date: reading.date,
        description: synth.coreMeaning,
        intensity: Math.max(1, Math.min(10, Math.round(10 - Math.abs(t.orb)))),
        color: synth.aspectInfo?.color,
      };
    });
}

// ---------------------------------------------------------------------------
// Calendar builders
// ---------------------------------------------------------------------------

export function buildCalendarDays(
  readings: TransitReading[],
  year: number,
  month: number,
): TransitCalendarDay[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const readingByDate = new Map<string, TransitReading>();
  for (const r of readings) {
    const key = r.date.split('T')[0];
    if (key) readingByDate.set(key, r);
  }

  const days: TransitCalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const reading = readingByDate.get(dateStr);
    days.push({
      date: dateStr,
      hasMajorTransit: reading ? (reading.transits ?? []).some((t) => Math.abs(t.orb) <= 2) : false,
      hasMoonPhase: false,
      hasEclipse: false,
      transits: reading ? (reading.transits ?? []).map((t) => mapReadingToTransit(t, reading)) : undefined,
    });
  }
  return days;
}

export function buildSingleCalendarDay(
  reading: TransitReading | undefined,
): TransitCalendarDay[] {
  if (!reading) return [];
  const dateStr = reading.date.split('T')[0];
  const transits: Transit[] = (reading.transits ?? []).map((t) => mapReadingToTransit(t, reading));
  return [{
    date: dateStr ?? reading.date,
    hasMajorTransit: (reading.transits ?? []).some((t) => Math.abs(t.orb) <= 2),
    hasMoonPhase: false,
    hasEclipse: false,
    transits,
  }];
}
