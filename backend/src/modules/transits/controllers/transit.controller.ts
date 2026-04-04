/**
 * Transit Controller
 * Handles transit calculations and forecasting
 *
 * Uses the real AstronomyEngineService for planetary positions and
 * calculates aspects between natal and transit positions.
 */

import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth';
import { AppError } from '../../../utils/appError';
import ChartModel from '../../charts/models/chart.model';
import { AstronomyEngineService } from '../../shared/services/astronomyEngine.service';
import { addDays, addMonths, addYears, differenceInDays } from 'date-fns';
import knex from '../../../config/database';

// Module-level singleton of the real calculation engine
const astronomyEngine = new AstronomyEngineService();

// ---------------------------------------------------------------------------
// Aspect calculation constants (shared with NatalChartService pattern)
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
// Transit calculation adapter
// ---------------------------------------------------------------------------

interface TransitResult {
  transitPlanets: Record<string, { longitude: number; latitude?: number; speed?: number; retrograde?: boolean; sign?: string; degree?: number }>;
  aspects: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
    applying?: boolean;
  }>;
}

/**
 * Calculate transits by comparing natal planet positions (from stored chart
 * data) against current/transit planet positions (from AstronomyEngineService).
 *
 * The output shape matches what the old mock `astronomyEngine.calculateTransits`
 * returned, preserving the frontend contract.
 */
function calculateTransitsWithEngine(params: {
  natalPlanets: Record<string, any>;
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
  const transitPlanets: TransitResult['transitPlanets'] = {};

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
  const aspects: TransitResult['aspects'] = [];

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

// ---------------------------------------------------------------------------
// Controller functions
// ---------------------------------------------------------------------------

/**
 * Calculate transits for date range
 */
export async function calculateTransits(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;
  const { chartId, startDate, endDate } = req.body;

  // Get chart
  const chart = await ChartModel.findByIdAndUserId(chartId, userId);
  if (!chart) {
    throw new AppError('Chart not found', 404);
  }

  // Ensure chart is calculated
  if (!chart.calculated_data) {
    throw new AppError('Chart must be calculated first', 400);
  }

  // Get natal planets from stored chart data
  const natalPlanets = (chart.calculated_data as any).planets ?? {};

  // Calculate transits for each day in range
  const transitReadings: any[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = differenceInDays(end, start);

  // Limit to 365 days for performance
  const maxDays = Math.min(daysDiff, 365);

  for (let i = 0; i <= maxDays; i++) {
    const transitDate = addDays(start, i);

    const transitData = calculateTransitsWithEngine({
      natalPlanets,
      transitDate,
      latitude: chart.birth_latitude,
      longitude: chart.birth_longitude,
    });

    // Filter for significant aspects only
    const majorAspects = transitData.aspects.filter(
      (a) => ['conjunction', 'opposition', 'trine', 'square'].includes(a.type) && a.orb <= 3
    );

    if (majorAspects.length > 0) {
      transitReadings.push({
        date: transitDate.toISOString().split('T')[0],
        transits: majorAspects,
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      chartId,
      startDate,
      endDate,
      transitReadings,
      count: transitReadings.length,
    },
  });
}

/**
 * Get today's transits
 * With authentication: returns personalized transits based on user's chart
 * Without authentication: returns general planetary positions and moon phase
 */
export async function getTodayTransits(req: Request, res: Response): Promise<void> {
  const today = new Date();
  const _user = (req as any).user;

  // If user is authenticated, try to get personalized transits
  if (_user?.id) {
    try {
      const charts = await ChartModel.findByUserId(_user.id, 1, 0);
      if (charts.length > 0 && charts[0].calculated_data) {
        const chart = charts[0];
        const natalPlanets = (chart.calculated_data as any).planets ?? {};

        const transitData = calculateTransitsWithEngine({
          natalPlanets,
          transitDate: today,
          latitude: chart.birth_latitude,
          longitude: chart.birth_longitude,
        });

        const majorAspects = transitData.aspects.filter(
          (a) => ['conjunction', 'opposition', 'trine', 'square'].includes(a.type) && a.orb <= 3
        );

        const moonPhase = calculateMoonPhase(
          transitData.transitPlanets.moon?.longitude ?? 0,
          transitData.transitPlanets.sun?.longitude ?? 0
        );

        res.status(200).json({
          success: true,
          data: {
            date: today.toISOString().split('T')[0],
            chart: { id: chart.id, name: chart.name },
            majorAspects,
            moonPhase,
            transitPlanets: transitData.transitPlanets,
            energyLevel: Math.min(100, 50 + majorAspects.length * 10),
          },
        });
        return;
      }
    } catch (error) {
      // Fall through to general transits on error
    }
  }

  // Return general transit data (no chart required)
  const generalTransits = astronomyEngine.getDailyTransits(today);

  const moonPhase = calculateMoonPhase(
    generalTransits.moon.longitude,
    generalTransits.sun.longitude
  );

  // Calculate general planetary aspects (without natal chart)
  const generalAspects = calculateGeneralAspects(generalTransits);

  res.status(200).json({
    success: true,
    data: {
      date: today.toISOString().split('T')[0],
      chart: null,
      majorAspects: generalAspects,
      moonPhase,
      transitPlanets: generalTransits,
      energyLevel: 50,
      isGeneral: true,
    },
  });
}

/**
 * Calculate general aspects between transiting planets
 */
function calculateGeneralAspects(planets: any): any[] {
  const aspects: any[] = [];
  const planetList = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const aspectTypes = [
    { type: 'conjunction', angle: 0, orb: 8 },
    { type: 'opposition', angle: 180, orb: 8 },
    { type: 'trine', angle: 120, orb: 6 },
    { type: 'square', angle: 90, orb: 6 },
  ];

  for (let i = 0; i < planetList.length; i++) {
    for (let j = i + 1; j < planetList.length; j++) {
      const p1 = planets[planetList[i]];
      const p2 = planets[planetList[j]];
      if (!p1 || !p2) continue;

      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;

      for (const aspectType of aspectTypes) {
        if (Math.abs(diff - aspectType.angle) <= aspectType.orb) {
          aspects.push({
            planet1: planetList[i],
            planet2: planetList[j],
            type: aspectType.type,
            orb: Math.abs(diff - aspectType.angle),
          });
          break;
        }
      }
    }
  }

  return aspects.slice(0, 10); // Limit to 10 aspects
}

/**
 * Get transit calendar data
 */
export async function getTransitCalendar(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();

  // Get user's primary chart
  const charts = await ChartModel.findByUserId(userId, 1, 0);
  if (charts.length === 0) {
    throw new AppError('No charts found', 404);
  }

  const chart = charts[0];
  if (!chart.calculated_data) {
    throw new AppError('Chart must be calculated first', 400);
  }

  const natalPlanets = (chart.calculated_data as any).planets ?? {};

  // Calculate transits for the month
  const calendarData: any[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);

    const transitData = calculateTransitsWithEngine({
      natalPlanets,
      transitDate: date,
      latitude: chart.birth_latitude,
      longitude: chart.birth_longitude,
    });

    // Get major aspects
    const majorAspects = transitData.aspects.filter(
      (a) => ['conjunction', 'opposition', 'trine', 'square'].includes(a.type) && a.orb <= 2
    );

    // Moon phase
    const moonPhase = calculateMoonPhase(
      transitData.transitPlanets.moon?.longitude ?? 0,
      transitData.transitPlanets.sun?.longitude ?? 0
    );

    // Check for retrogrades
    const retrogrades = Object.entries(transitData.transitPlanets)
      .filter(([_, planet]) => planet.retrograde)
      .map(([key, _]) => key);

    if (majorAspects.length > 0 || moonPhase.phase === 'full' || moonPhase.phase === 'new' || retrogrades.length > 0) {
      calendarData.push({
        date: date.toISOString().split('T')[0],
        day,
        aspects: majorAspects,
        moonPhase,
        retrogrades,
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      month,
      year,
      calendarData,
    },
  });
}

/**
 * Get specific transit details by reading ID
 */
export async function getTransitDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;
  const { id } = req.params;

  if (!id) {
    throw new AppError('Transit reading ID is required', 400);
  }

  const reading = await knex('transit_readings')
    .where({ id, user_id: userId })
    .first();

  if (!reading) {
    throw new AppError('Transit reading not found', 404);
  }

  const transitData = typeof reading.transit_data === 'string'
    ? JSON.parse(reading.transit_data)
    : reading.transit_data;

  res.status(200).json({
    success: true,
    data: {
      id: reading.id,
      chartId: reading.chart_id,
      startDate: reading.start_date,
      endDate: reading.end_date,
      transitData,
      moonPhases: reading.moon_phases
        ? (typeof reading.moon_phases === 'string'
          ? JSON.parse(reading.moon_phases)
          : reading.moon_phases)
        : null,
      createdAt: reading.created_at,
      updatedAt: reading.updated_at,
    },
  });
}

/**
 * Get transit forecast for duration
 */
export async function getTransitForecast(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;
  const { duration = 'month' } = req.query; // 'week', 'month', 'quarter', 'year'

  // Get user's primary chart
  const charts = await ChartModel.findByUserId(userId, 1, 0);
  if (charts.length === 0) {
    throw new AppError('No charts found', 404);
  }

  const chart = charts[0];
  if (!chart.calculated_data) {
    throw new AppError('Chart must be calculated first', 400);
  }

  const natalPlanets = (chart.calculated_data as any).planets ?? {};

  const now = new Date();
  let endDate = now;

  // Set end date based on duration
  switch (duration) {
    case 'week':
      endDate = addDays(now, 7);
      break;
    case 'month':
      endDate = addMonths(now, 1);
      break;
    case 'quarter':
      endDate = addMonths(now, 3);
      break;
    case 'year':
      endDate = addYears(now, 1);
      break;
  }

  // Calculate significant transits (outer planets only for longer periods)
  const outerPlanets = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const transitForecast: any[] = [];

  const daysDiff = differenceInDays(endDate, now);
  const maxDays = Math.min(daysDiff, 365);

  for (let i = 0; i <= maxDays; i++) {
    const date = addDays(now, i);

    const transitData = calculateTransitsWithEngine({
      natalPlanets,
      transitDate: date,
      latitude: chart.birth_latitude,
      longitude: chart.birth_longitude,
    });

    // Filter for outer planet aspects
    const outerPlanetAspects = transitData.aspects.filter(
      (a) => outerPlanets.includes(a.planet1) || outerPlanets.includes(a.planet2)
    );

    // Further filter for tighter orbs
    const tightAspects = outerPlanetAspects.filter((a) => a.orb <= 1);

    if (tightAspects.length > 0) {
      tightAspects.forEach((aspect) => {
        transitForecast.push({
          date: date.toISOString().split('T')[0],
          ...aspect,
          intensity: calculateTransitIntensity(aspect),
        });
      });
    }
  }

  // Group by aspect type
  const groupedByType = transitForecast.reduce((acc, item) => {
    const key = item.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  res.status(200).json({
    success: true,
    data: {
      chart: { id: chart.id, name: chart.name },
      duration,
      startDate: now.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      groupedByType,
      forecast: transitForecast.slice(0, 50), // Limit to 50
    },
  });
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function calculateMoonPhase(moonLong: number, sunLong: number): {
  phase: 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';
  degrees: number;
  illumination: number;
} {
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
    phase: phase as any,
    degrees: Math.round(degrees * 100) / 100,
    illumination: Math.round(illumination * 100) / 100,
  };
}

function calculateTransitIntensity(aspect: { type: string; orb: number; planet1: string; planet2: string }): number {
  // Base intensity on aspect type and orb
  const baseIntensity: Record<string, number> = {
    conjunction: 10,
    opposition: 9,
    square: 8,
    trine: 7,
    sextile: 5,
  };

  const orbFactor = 1 - (aspect.orb / 10); // Tighter aspects are stronger
  const planetFactor = getPlanetIntensityFactor(aspect.planet1);

  return Math.round((baseIntensity[aspect.type] ?? 5) * orbFactor * planetFactor);
}

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
