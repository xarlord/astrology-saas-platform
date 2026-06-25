/**
 * Transit Calculation Service
 *
 * Pure astronomical/astrological calculation logic extracted from the transit
 * controller (issue #418). Controllers should only handle HTTP request/response;
 * business logic belongs here.
 *
 * Responsibilities:
 *   - Build transit planet positions from AstronomyEngineService
 *   - Calculate natal↔transit aspects
 *   - Compute moon phases
 *   - Score transit intensity
 */

import { AstronomyEngineService } from '../../shared/services/astronomyEngine.service';

// Module-level singleton of the real calculation engine
const astronomyEngine = new AstronomyEngineService();

// ---------------------------------------------------------------------------
// Aspect calculation constants
// ---------------------------------------------------------------------------

const ASPECT_ANGLES: Record<string, number> = {
  conjunction: 0,
  semisextile: 30,
  sextile: 60,
  square: 90,
  trine: 120,
  quincunx: 150,
  opposition: 180,
};

const ASPECT_ORBS: Record<string, number> = {
  conjunction: 10,
  opposition: 8,
  trine: 8,
  square: 6,
  sextile: 4,
  quincunx: 3,
  semisextile: 2,
};

// ---------------------------------------------------------------------------
// Types — kept compatible with the existing frontend contract
// ---------------------------------------------------------------------------

export type TransitPlanets = Record<
  string,
  {
    longitude: number;
    latitude?: number;
    speed?: number;
    retrograde?: boolean;
    sign?: string;
    degree?: number;
  }
>;

export interface TransitAspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying?: boolean;
}

export interface TransitResult {
  transitPlanets: TransitPlanets;
  aspects: TransitAspect[];
}

export interface TransitReading {
  date: string;
  transits: TransitAspect[];
}

export interface TransitForecastItem {
  date: string;
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying?: boolean;
  intensity: number;
}

export interface MoonPhase {
  phase:
    | 'new'
    | 'waxing-crescent'
    | 'first-quarter'
    | 'waxing-gibbous'
    | 'full'
    | 'waning-gibbous'
    | 'last-quarter'
    | 'waning-crescent';
  degrees: number;
  illumination: number;
}

// ---------------------------------------------------------------------------
// Core calculation functions
// ---------------------------------------------------------------------------

/**
 * Calculate transits by comparing natal planet positions (from stored chart
 * data) against current/transit planet positions (from AstronomyEngineService).
 *
 * The output shape matches what the old mock `swissEphemeris.calculateTransits`
 * returned, preserving the frontend contract.
 */
export function calculateTransitsWithEngine(params: {
  natalPlanets: TransitPlanets;
  transitDate: Date;
  latitude: number;
  longitude: number;
}): TransitResult {
  const { natalPlanets, transitDate, latitude, longitude } = params;

  // Get real transit planet positions from the engine
  const transitPositions = astronomyEngine.calculatePlanetaryPositions(
    transitDate,
    latitude,
    longitude,
  );

  // Also get Chiron and Lunar Nodes for completeness
  const chironPos = astronomyEngine.calculateChiron(transitDate);
  const lunarNodes = astronomyEngine.calculateLunarNodes(transitDate);

  // Build transitPlanets object with lowercase keys (legacy format)
  const transitPlanets: TransitPlanets = {};

  for (const [name, pos] of transitPositions) {
    transitPlanets[name.toLowerCase()] = {
      longitude: pos.longitude,
      latitude: pos.latitude,
      speed: pos.speed,
      retrograde: pos.isRetrograde,
      sign: pos.sign.toLowerCase(),
      degree: pos.degree,
    };
  }

  // Add Chiron
  transitPlanets['chiron'] = {
    longitude: chironPos.longitude,
    sign: chironPos.sign.toLowerCase(),
    degree: chironPos.degree,
    retrograde: chironPos.isRetrograde,
  };

  // Add lunar nodes
  transitPlanets['northnode'] = {
    longitude: lunarNodes.northNode.longitude,
    sign: lunarNodes.northNode.sign.toLowerCase(),
    degree: lunarNodes.northNode.degree,
  };
  transitPlanets['southnode'] = {
    longitude: lunarNodes.southNode.longitude,
    sign: lunarNodes.southNode.sign.toLowerCase(),
    degree: lunarNodes.southNode.degree,
  };

  // Calculate aspects between natal planets and transit planets
  const aspects: TransitAspect[] = [];

  for (const [natalName, natalPos] of Object.entries(natalPlanets)) {
    const natalLon = natalPos?.longitude;
    if (typeof natalLon !== 'number') continue;

    for (const [transitName, transitPos] of Object.entries(transitPlanets)) {
      // Skip self-aspects
      if (natalName === transitName) continue;

      const transitLon = transitPos.longitude;

      // Calculate angular distance
      let diff = Math.abs(natalLon - transitLon);
      if (diff > 180) diff = 360 - diff;

      // Check each aspect type
      for (const [type, angle] of Object.entries(ASPECT_ANGLES)) {
        const orb = ASPECT_ORBS[type] ?? 6;
        const deviation = Math.abs(diff - angle);

        if (deviation <= orb) {
          aspects.push({
            planet1: natalName,
            planet2: transitName,
            type,
            orb: Math.round(deviation * 100) / 100,
            applying: isApplying(natalLon, transitLon, diff, angle),
          });
          break; // Only one aspect per pair
        }
      }
    }
  }

  return { transitPlanets, aspects };
}

/**
 * Determine if an aspect is applying (tightening) or separating.
 * Simplified heuristic: if the angular distance is less than the target angle,
 * the transit planet is approaching the aspect.
 */
function isApplying(natalLon: number, transitLon: number, _actualDiff: number, targetAngle: number): boolean {
  // Simplified: we compare the raw distance to the target angle
  let diff = Math.abs(natalLon - transitLon);
  if (diff > 180) diff = 360 - diff;
  return diff < targetAngle;
}

/**
 * Calculate today's transit planets without requiring a natal chart.
 * Used for the ephemeris page when user has no chart yet.
 */
export async function calculateTransitPlanetsOnly(date: Date): Promise<TransitPlanets> {
  const positions = astronomyEngine.calculatePlanetaryPositions(date, 0, 0);
  const result: TransitPlanets = {};
  for (const [name, pos] of positions) {
    result[name] = {
      longitude: pos.longitude,
      latitude: pos.latitude,
      speed: pos.speed,
      retrograde: pos.isRetrograde,
      sign: pos.sign,
      degree: pos.degree,
    };
  }
  return result;
}

/**
 * Calculate the moon phase from ecliptic longitudes of the Moon and Sun.
 */
export function calculateMoonPhase(moonLong: number, sunLong: number): MoonPhase {
  let diff = moonLong - sunLong;
  if (diff < 0) diff += 360;

  const degrees = diff;

  let phase: string;
  let illumination: number;

  if (diff < 45) {
    phase = 'new';
    illumination = diff / 45;
  } else if (diff < 90) {
    phase = 'waxing-crescent';
    illumination = (diff - 45) / 45;
  } else if (diff < 135) {
    phase = 'first-quarter';
    illumination = (diff - 90) / 45;
  } else if (diff < 180) {
    phase = 'waxing-gibbous';
    illumination = (diff - 135) / 45;
  } else if (diff < 225) {
    phase = 'full';
    illumination = 1 - (diff - 180) / 45;
  } else if (diff < 270) {
    phase = 'waning-gibbous';
    illumination = 1 - (diff - 225) / 45;
  } else if (diff < 315) {
    phase = 'last-quarter';
    illumination = 1 - (diff - 270) / 45;
  } else {
    phase = 'waning-crescent';
    illumination = 1 - (diff - 315) / 45;
  }

  return {
    phase: phase as MoonPhase['phase'],
    degrees: Math.round(degrees * 100) / 100,
    illumination: Math.round(illumination * 100) / 100,
  };
}

/**
 * Score the intensity of a transit aspect based on its type, orb, and planet.
 */
export function calculateTransitIntensity(aspect: {
  type: string;
  orb: number;
  planet1: string;
}): number {
  // Base intensity on aspect type and orb
  const baseIntensity: Record<string, number> = {
    conjunction: 10,
    opposition: 9,
    square: 8,
    trine: 7,
    sextile: 5,
  };

  const orbFactor = 1 - aspect.orb / 10; // Tighter aspects are stronger
  const planetFactor = getPlanetIntensityFactor(aspect.planet1);

  return Math.round((baseIntensity[aspect.type] ?? 5) * orbFactor * planetFactor);
}

/**
 * Planet weight factor for intensity scoring (outer/social planets weigh more).
 */
function getPlanetIntensityFactor(planet: string): number {
  const factors: Record<string, number> = {
    sun: 1.0,
    moon: 0.9,
    mercury: 0.6,
    venus: 0.7,
    mars: 0.8,
    jupiter: 1.0,
    saturn: 1.0,
    uranus: 0.9,
    neptune: 0.9,
    pluto: 0.9,
  };

  return factors[planet] || 0.5;
}
