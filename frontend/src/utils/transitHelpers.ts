/**
 * Shared transit helper functions
 *
 * Pure utility functions extracted from TransitPage, TodayTransitsPage,
 * and ForecastPage to avoid duplication.
 */

import type {
  Transit,
  TransitHighlight,
  TransitCalendarDay,
} from '../components/TransitDashboard';
import type { TransitReading } from '../services/transit.service';

/** The shape of a single transit entry inside a TransitReading. */
type TransitEntry = NonNullable<TransitReading['transits']>[number];

/**
 * Map a raw TransitReading transit to a Transit object expected by
 * TransitDashboard.
 */
export function mapReadingToTransit(
  r: TransitEntry,
  reading: TransitReading,
): Transit {
  return {
    transitingPlanet: r.transitPlanet,
    natalPlanet: r.natalPlanet,
    type: r.aspect,
    orb: r.orb,
    applying: r.orb > 0,
    startDate: reading.date,
    endDate: reading.date,
    peakDate: reading.date,
    intensity: Math.max(1, Math.min(10, Math.round(10 - Math.abs(r.orb)))),
    interpretation: {
      general: `${r.transitPlanet} ${r.aspect} ${r.natalPlanet}`,
      themes: [],
      advice: { positive: [], challenges: [], suggestions: [] },
    },
  };
}

/**
 * Derive highlights from today's reading -- the most intense transits
 * are treated as highlights.
 */
export function deriveHighlights(reading: TransitReading | undefined): TransitHighlight[] {
  if (!reading) return [];

  return (reading.transits ?? [])
    .filter((t) => Math.abs(t.orb) <= 2)
    .map((t) => ({
      type: 'major-transit' as const,
      title: `${t.transitPlanet} ${t.aspect} ${t.natalPlanet}`,
      date: reading.date,
      description: `${t.transitPlanet} forms a ${t.aspect} with your natal ${t.natalPlanet}`,
      intensity: Math.max(1, Math.min(10, Math.round(10 - Math.abs(t.orb)))),
    }));
}

/**
 * Build TransitCalendarDay[] from a TransitReading[] for a given month/year.
 */
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

/**
 * Build a single-day TransitCalendarDay[] from today's reading.
 */
export function buildSingleCalendarDay(
  reading: TransitReading | undefined,
): TransitCalendarDay[] {
  if (!reading) return [];

  const dateStr = reading.date.split('T')[0];
  const transits: Transit[] = (reading.transits ?? []).map((t) => mapReadingToTransit(t, reading));

  return [
    {
      date: dateStr ?? reading.date,
      hasMajorTransit: (reading.transits ?? []).some((t) => Math.abs(t.orb) <= 2),
      hasMoonPhase: false,
      hasEclipse: false,
      transits,
    },
  ];
}
