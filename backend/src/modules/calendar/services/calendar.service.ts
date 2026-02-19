/**
 * Calendar Service
 * Handles astrological event calculations including:
 * - Retrograde periods
 * - Eclipses
 * - Moon phases
 * - Seasonal ingresses
 * - Transit intensity scoring
 * - iCal generation
 */

import {
  Planet,
  MoonPhase,
  RetrogradePeriod,
  Eclipse,
  MoonPhaseEvent,
  AstrologicalEvent,
  AspectType,
} from '../models/calendar.model';

// Constants
const ZODIAC_SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];

// Exported for future use
export const ASPECT_ORBS = {
  conjunction: 10,
  opposition: 8,
  trine: 8,
  square: 8,
  sextile:6,
  quincunx: 3,
};

const PLANET_WEIGHTS = {
  sun: 3,
  moon: 3,
  mercury: 1,
  venus: 1,
  mars: 2,
  jupiter: 2,
  saturn: 3,
  uranus: 2,
  neptune: 1,
  pluto: 2,
};

const ASPECT_WEIGHTS = {
  conjunction: 4,
  opposition: 3,
  square: 2,
  trine: 1,
  sextile: 0,
  quincunx: 1,
};

/**
 * Calculate Julian Day from a Date object
 * Based on the algorithm by Jean Meeus
 */
export function calculateJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();

  let y = year;
  let m = month;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);

  const JD_day =
    Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;

  const JD_fraction = (hour + minute / 60 + second / 3600) / 24;

  return JD_day + JD_fraction;
}

/**
 * Normalize degree to 0-360 range
 */
export function normalizeDegree(degree: number): number {
  let normalized = degree % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  // Handle -0 case
  if (normalized === 0 && degree < 0) {
    return 0;
  }
  return normalized;
}

/**
 * Get zodiac sign from degree
 */
export function getZodiacSign(degree: number): string {
  const normalizedDegree = normalizeDegree(degree);
  const signIndex = Math.floor(normalizedDegree / 30);
  return ZODIAC_SIGNS[signIndex];
}

/**
 * Calculate moon phase for a given date
 * Returns phase name, illumination %, and zodiac position
 */
export function calculateMoonPhase(date: Date): MoonPhaseEvent {
  // Known reference: New moon on January 11, 2024 at 11:57 UTC
  // JD = 2460314.9979
  const referenceNewMoon = new Date('2024-01-11T11:57:00Z');
  const synodicMonth = 29.53058867; // Average lunar cycle in days

  const daysSinceReference = (date.getTime() - referenceNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const cycles = daysSinceReference / synodicMonth;
  const phaseProgress = cycles - Math.floor(cycles);

  let phase: MoonPhase;
  let illumination: number;

  if (phaseProgress < 0.03 || phaseProgress > 0.97) {
    phase = 'new';
    illumination = Math.abs(phaseProgress - 0) * 100;
    if (phaseProgress > 0.97) illumination = (1 - phaseProgress) * 100;
  } else if (phaseProgress < 0.22) {
    phase = 'waxing-crescent';
    illumination = phaseProgress * 100;
  } else if (phaseProgress < 0.28) {
    phase = 'first-quarter';
    illumination = phaseProgress * 100;
  } else if (phaseProgress < 0.47) {
    phase = 'waxing-gibbous';
    illumination = phaseProgress * 100;
  } else if (phaseProgress < 0.53) {
    phase = 'full';
    illumination = 100 - Math.abs(phaseProgress - 0.5) * 100;
  } else if (phaseProgress < 0.72) {
    phase = 'waning-gibbous';
    illumination = (1 - phaseProgress) * 100;
  } else if (phaseProgress < 0.78) {
    phase = 'last-quarter';
    illumination = (1 - phaseProgress) * 100;
  } else {
    phase = 'waning-crescent';
    illumination = (1 - phaseProgress) * 100;
  }

  illumination = Math.round(illumination);

  // Calculate moon's position (simplified - using mean anomaly)
  // For accurate positions, would need Swiss Ephemeris
  const moonLongitude = (phaseProgress * 360) % 360;
  const sign = getZodiacSign(moonLongitude);
  const degree = moonLongitude % 30;

  return {
    date,
    phase,
    sign,
    degree,
    illumination,
  };
}

/**
 * Get retrograde periods for a planet in a given year
 * Note: These are approximate dates. For production, use Swiss Ephemeris
 */
export function getRetrogradePeriod(planet: Planet, year: number): RetrogradePeriod[] {
  // Approximate retrograde periods based on synodic cycles
  // Mercury: 3-4 times per year, ~24 days each
  // Venus: every 18 months, ~40-42 days
  // Mars: every 26 months, ~60-80 days
  // Jupiter: once per year, ~120 days
  // Saturn: once per year, ~140 days
  // Outer planets: once per year, longer durations

  const retros: RetrogradePeriod[] = [];

  if (planet === 'mercury') {
    // Mercury goes retrograde 3-4 times per year
    const mercuryCycle = 116; // days between retrogrades
    const retroDuration = 24; // days
    const shadowDuration = 10; // days before/after

    const startDate = new Date(`${year}-01-01T00:00:00Z`);
    const jd = calculateJulianDay(startDate);

    // First Mercury retrograde of year (approximate)
    const offsetDays = ((jd - 2459946) % mercuryCycle); // Align with known retrograde
    const firstRetroStart = new Date(startDate.getTime() - offsetDays * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 4; i++) {
      const retroStart = new Date(
        firstRetroStart.getTime() + i * mercuryCycle * 24 * 60 * 60 * 1000
      );

      if (retroStart.getFullYear() === year) {
        const retroEnd = new Date(retroStart.getTime() + retroDuration * 24 * 60 * 60 * 1000);
        const shadowStart = new Date(
          retroStart.getTime() - shadowDuration * 24 * 60 * 60 * 1000
        );
        const shadowEnd = new Date(retroEnd.getTime() + shadowDuration * 24 * 60 * 60 * 1000);

        retros.push({
          planet: 'mercury',
          startDate: retroStart,
          endDate: retroEnd,
          shadowStartDate: shadowStart,
          shadowEndDate: shadowEnd,
        });
      }
    }
  } else if (planet === 'venus') {
    // Venus retrograde occurs every 18 months (584 days)
    // Last Venus retrograde started July 2023, next in 2025, then 2027
    const venusRetroYears = [2025, 2027];

    if (venusRetroYears.includes(year)) {
      const startMonth = year === 2025 ? 6 : 7;
      retros.push({
        planet: 'venus',
        startDate: new Date(`${year}-${String(startMonth).padStart(2, '0')}-15T00:00:00Z`),
        endDate: new Date(`${year}-${String(startMonth + 1).padStart(2, '0')}-25T00:00:00Z`),
        shadowStartDate: new Date(`${year}-${String(startMonth).padStart(2, '0')}-05T00:00:00Z`),
        shadowEndDate: new Date(`${year}-${String(startMonth + 2).padStart(2, '0')}-05T00:00:00Z`),
      });
    }
  } else if (planet === 'mars') {
    // Mars retrograde every 26 months
    // const marsRetroYears = [2024, 2026]; // Removed unused

    if (year === 2026) {
      retros.push({
        planet: 'mars',
        startDate: new Date('2026-12-06T00:00:00Z'),
        endDate: new Date('2027-02-23T00:00:00Z'),
        shadowStartDate: new Date('2026-10-25T00:00:00Z'),
        shadowEndDate: new Date('2027-04-15T00:00:00Z'),
      });
    }
  } else if (planet === 'jupiter') {
    // Jupiter goes retrograde once per year for ~4 months
    retros.push({
      planet: 'jupiter',
      startDate: new Date(`${year}-10-09T00:00:00Z`),
      endDate: new Date(`${year + 1}-02-04T00:00:00Z`),
    });
  } else if (planet === 'saturn') {
    // Saturn goes retrograde once per year for ~4.5 months
    retros.push({
      planet: 'saturn',
      startDate: new Date(`${year}-06-29T00:00:00Z`),
      endDate: new Date(`${year + 1}-01-02T00:00:00Z`),
    });
  } else if (planet === 'uranus') {
    retros.push({
      planet: 'uranus',
      startDate: new Date(`${year}-08-28T00:00:00Z`),
      endDate: new Date(`${year + 1}-01-26T00:00:00Z`),
    });
  } else if (planet === 'neptune') {
    retros.push({
      planet: 'neptune',
      startDate: new Date(`${year}-07-02T00:00:00Z`),
      endDate: new Date(`${year + 1}-01-03T00:00:00Z`),
    });
  } else if (planet === 'pluto') {
    retros.push({
      planet: 'pluto',
      startDate: new Date(`${year}-05-02T00:00:00Z`),
      endDate: new Date(`${year + 1}-01-11T00:00:00Z`),
    });
  }

  return retros;
}

/**
 * Get eclipses for a given year
 * Simplified calculation - for production use Swiss Ephemeris or NASA data
 */
export function getEclipses(year: number): Eclipse[] {
  const eclipses: Eclipse[] = [];

  // Simplified eclipse cycle (Metonic cycle: 19 years)
  // In reality, eclipse prediction requires complex calculations
  // This is a placeholder for demonstration

  const eclipseData = [
    // 2026 eclipses (approximate dates)
    {
      month: 2,
      day: 17,
      type: 'lunar' as const,
      magnitude: 0.95,
    },
    {
      month: 3,
      day: 3,
      type: 'solar' as const,
      magnitude: 0.98,
    },
    {
      month: 8,
      day: 7,
      type: 'lunar' as const,
      magnitude: 0.85,
    },
    {
      month: 8,
      day: 21,
      type: 'solar' as const,
      magnitude: 0.92,
    },
  ];

  eclipseData.forEach((eclipse, index) => {
    const date = new Date(`${year}-${String(eclipse.month).padStart(2, '0')}-${String(eclipse.day).padStart(2, '0')}T12:00:00Z`);
    const phase = calculateMoonPhase(date);

    eclipses.push({
      id: `eclipse_${year}_${index}`,
      eclipseType: eclipse.type,
      startDate: date,
      endDate: new Date(date.getTime() + 6 * 60 * 60 * 1000), // ~6 hours duration
      magnitude: eclipse.magnitude,
      visibility: [], // Would calculate based on geographic coordinates
      zodiacSign: phase.sign,
      degree: phase.degree,
    });
  });

  return eclipses;
}

/**
 * Calculate moon phases for a given month
 */
export function calculateMoonPhases(month: number, year: number): MoonPhaseEvent[] {
  const phases: MoonPhaseEvent[] = [];
  // const synodicMonth = 29.53058867; // days - removed unused
  const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00Z`);

  // Find first new moon of the month
  let currentDate = new Date(startDate);
  let phaseCount = 0;

  while (currentDate.getMonth() + 1 === month && phaseCount < 6) {
    const phase = calculateMoonPhase(currentDate);

    // Check if this is a major phase (new, first quarter, full, last quarter)
    if (
      phase.phase === 'new' ||
      phase.phase === 'first-quarter' ||
      phase.phase === 'full' ||
      phase.phase === 'last-quarter'
    ) {
      phases.push({
        date: new Date(currentDate),
        phase: phase.phase,
        sign: phase.sign,
        degree: phase.degree,
        illumination: phase.illumination,
      });

      phaseCount++;

      // Move to next major phase (~7.4 days)
      currentDate = new Date(currentDate.getTime() + 7.4 * 24 * 60 * 60 * 1000);
    } else {
      // Move forward by 12 hours to find next phase
      currentDate = new Date(currentDate.getTime() + 12 * 60 * 60 * 1000);
    }
  }

  return phases;
}

/**
 * Get seasonal ingresses (solstices and equinoxes) for a given year
 * Approximate dates - for production use accurate astronomical data
 */
export function getSeasonalIngresses(year: number): Array<{
  date: Date;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  type: 'equinox' | 'solstice';
  sign: string;
}> {
  // Approximate dates for Northern Hemisphere
  const ingresses = [
    {
      month: 3,
      day: 20,
      hour: 0,
      season: 'spring' as const,
      type: 'equinox' as const,
      sign: 'aries',
    },
    {
      month: 6,
      day: 21,
      hour: 0,
      season: 'summer' as const,
      type: 'solstice' as const,
      sign: 'cancer',
    },
    {
      month: 9,
      day: 22,
      hour: 0,
      season: 'autumn' as const,
      type: 'equinox' as const,
      sign: 'libra',
    },
    {
      month: 12,
      day: 21,
      hour: 0,
      season: 'winter' as const,
      type: 'solstice' as const,
      sign: 'capricorn',
    },
  ];

  return ingresses.map((ingress) => ({
    date: new Date(`${year}-${String(ingress.month).padStart(2, '0')}-${String(ingress.day).padStart(2, '0')}T${String(ingress.hour).padStart(2, '0')}:00:00Z`),
    season: ingress.season,
    type: ingress.type,
    sign: ingress.sign,
  }));
}

/**
 * Calculate transit intensity score (1-10)
 * Based on aspect type, planet importance, orb tightness, and applying vs separating
 */
export function calculateTransitIntensity(transit: {
  transitingPlanet: Planet;
  natalPlanet: Planet;
  aspectType: AspectType;
  orb: number;
  applying: boolean;
}): number {
  let score = 3; // Lower base score

  // Add aspect weight (reduced weights)
  score += ASPECT_WEIGHTS[transit.aspectType] * 0.5;

  // Add transiting planet importance (reduced weights)
  score += PLANET_WEIGHTS[transit.transitingPlanet] * 0.5;

  // Orb tightness bonus (closer = more intense)
  if (transit.orb < 1) {
    score += 1;
  } else if (transit.orb < 2) {
    score += 0.5;
  } else if (transit.orb > 5) {
    score -= 0.5;
  }

  // Applying vs separating (applying = more intense)
  if (transit.applying) {
    score += 0.5;
  }

  // Clamp to 1-10 range and round to integer
  return Math.max(1, Math.min(10, Math.round(score)));
}

/**
 * Generate iCal format from astrological events
 */
export function generateICalFormat(events: AstrologicalEvent[]): string {
  const iCal = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AstroSaaS//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach((event) => {
    const uid = event.id;
    const dtstamp = formatDateToICal(new Date());
    const dtstart = formatDateToICal(event.startDate);
    const dtend = event.endDate ? formatDateToICal(event.endDate) : dtstart;

    const summary = escapeICalText(event.eventName);
    const description = event.description
      ? escapeICalText(event.description + (event.advice ? '\n\nAdvice:\n' + event.advice.join('\n') : ''))
      : '';

    iCal.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${summary}`,
      description ? `DESCRIPTION:${description}` : '',
      'END:VEVENT'
    );
  });

  iCal.push('END:VCALENDAR');

  return iCal.filter((line) => line !== '').join('\r\n');
}

/**
 * Format date to iCal format (YYYYMMDDTHHmmssZ)
 */
function formatDateToICal(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  const second = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

/**
 * Escape special characters for iCal format
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/"/g, '\\"');
}

export default {
  calculateJulianDay,
  normalizeDegree,
  getZodiacSign,
  calculateMoonPhase,
  getRetrogradePeriod,
  getEclipses,
  calculateMoonPhases,
  getSeasonalIngresses,
  calculateTransitIntensity,
  generateICalFormat,
};
