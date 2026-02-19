/**
 * Transit Controller
 * Handles transit calculations and forecasting
 */

import { Request, Response } from 'express';
import { AppError } from '../../../middleware/errorHandler';
import ChartModel from '../../charts/models/chart.model';
import { swissEphemeris } from '../../shared';
import { addDays, addMonths, addYears, differenceInDays } from 'date-fns';

/**
 * Calculate transits for date range
 */
export async function calculateTransits(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
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

  // Calculate transits for each day in range
  const transitReadings: any[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = differenceInDays(end, start);

  // Limit to 365 days for performance
  const maxDays = Math.min(daysDiff, 365);

  for (let i = 0; i <= maxDays; i++) {
    const transitDate = addDays(start, i);

    const transitData = swissEphemeris.calculateTransits({
      birthDate: new Date(chart.birth_date),
      transitDate,
      latitude: chart.birth_latitude,
      longitude: chart.birth_longitude,
    });

    // Filter for significant aspects only
    const majorAspects = transitData.aspects.filter(
      (a: any) => ['conjunction', 'opposition', 'trine', 'square'].includes(a.type) && a.orb <= 3
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
 */
export async function getTodayTransits(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  // Get user's primary chart (first natal chart)
  const charts = await ChartModel.findByUserId(userId, 1, 0);
  if (charts.length === 0) {
    throw new AppError('No charts found. Please create a natal chart first.', 404);
  }

  const chart = charts[0];

  if (!chart.calculated_data) {
    throw new AppError('Chart must be calculated first', 400);
  }

  const today = new Date();

  const transitData = swissEphemeris.calculateTransits({
    birthDate: new Date(chart.birth_date),
    transitDate: today,
    latitude: chart.birth_latitude,
    longitude: chart.birth_longitude,
  });

  // Get significant aspects
  const majorAspects = transitData.aspects.filter(
    (a: any) => ['conjunction', 'opposition', 'trine', 'square'].includes(a.type) && a.orb <= 3
  );

  // Calculate moon phase
  const moonPhase = calculateMoonPhase(transitData.transitPlanets.moon.longitude, transitData.transitPlanets.sun.longitude);

  res.status(200).json({
    success: true,
    data: {
      date: today.toISOString().split('T')[0],
      chart: {
        id: chart.id,
        name: chart.name,
      },
      majorAspects,
      moonPhase,
      transitPlanets: transitData.transitPlanets,
    },
  });
}

/**
 * Get transit calendar data
 */
export async function getTransitCalendar(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
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

  // Calculate transits for the month
  const calendarData: any[] = [];
  // const startDate = new Date(year, month - 1, 1); // Not used yet
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);

    const transitData = swissEphemeris.calculateTransits({
      birthDate: new Date(chart.birth_date),
      transitDate: date,
      latitude: chart.birth_latitude,
      longitude: chart.birth_longitude,
    });

    // Get major aspects
    const majorAspects = transitData.aspects.filter(
      (a: any) => ['conjunction', 'opposition', 'trine', 'square'].includes(a.type) && a.orb <= 2
    );

    // Moon phase
    const moonPhase = calculateMoonPhase(
      transitData.transitPlanets.moon.longitude,
      transitData.transitPlanets.sun.longitude
    );

    // Check for retrogrades
    const retrogrades = Object.entries(transitData.transitPlanets)
      .filter(([_, planet]: [string, any]) => planet.retrograde)
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
 * Get specific transit details
 */
export async function getTransitDetails(_req: Request, res: Response): Promise<void> {
  // const userId = _req.user!.id; // TODO: will be used for DB lookup
  // const { id } = _req.params; // Transit reading ID - TODO: will be used

  // TODO: Fetch specific transit reading from database
  // For now, calculate on-demand

  res.status(200).json({
    success: true,
    data: { transit: null },
  });
}

/**
 * Get transit forecast for duration
 */
export async function getTransitForecast(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
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

    const transitData = swissEphemeris.calculateTransits({
      birthDate: new Date(chart.birth_date),
      transitDate: date,
      latitude: chart.birth_latitude,
      longitude: chart.birth_longitude,
    });

    // Filter for outer planet aspects
    const outerPlanetAspects = transitData.aspects.filter(
      (a: any) => outerPlanets.includes(a.planet1) && a.orb <= 1
    );

    if (outerPlanetAspects.length > 0) {
      outerPlanetAspects.forEach((aspect: any) => {
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

// Helper functions

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

function calculateTransitIntensity(aspect: any): number {
  // Base intensity on aspect type and orb
  const baseIntensity: Record<string, number> = {
    conjunction: 10,
    opposition: 9,
    square: 8,
    trine: 7,
    sextile: 5,
  };

  const orbFactor = 1 - (aspect.orb / 10); // Tighter aspects are stronger
  const planetFactor = getPlanetIntensityFactor(aspect.transitPlanet);

  return Math.round(baseIntensity[aspect.aspect] * orbFactor * planetFactor);
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
