/**
 * Transit Controller
 * Handles transit calculations and forecasting
 *
 * Uses the real AstronomyEngineService for planetary positions and
 * calculates aspects between natal and transit positions.
 *
 * Calculation logic lives in `services/transitCalculation.service.ts` (#418).
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth';
import { AppError } from '../../../utils/appError';
import ChartModel, { Chart } from '../../charts/models/chart.model';
import { addDays, addMonths, addYears, differenceInDays } from 'date-fns';
import knex from '../../../config/database';
import {
  calculateTransitsWithEngine,
  calculateTransitPlanetsOnly,
  calculateMoonPhase,
  calculateTransitIntensity,
  type TransitPlanets,
  type TransitResult,
  type TransitForecastItem,
} from '../services/transitCalculation.service';

/**
 * Find the user's first chart that has calculated data.
 * Accepts optional chartId query param to target a specific chart.
 */
async function findCalculatedChart(userId: string, chartId?: string) {
  if (chartId) {
    const chart = await ChartModel.findByIdAndUserId(chartId, userId);
    if (!chart) throw new AppError('Chart not found', 404);
    if (!chart.calculated_data) throw new AppError('Chart must be calculated first', 400);
    return chart;
  }

  // Find first chart with calculated_data
  const charts = await ChartModel.findByUserId(userId);
  const calculated = charts.find((c: Chart) => c.calculated_data != null);
  if (!calculated) {
    if (charts.length === 0) throw new AppError('No charts found. Please create a natal chart first.', 404);
    throw new AppError('Chart must be calculated first', 400);
  }
  return calculated;
}

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
  const natalPlanets =
    (chart.calculated_data as Record<string, unknown>).planets as TransitPlanets ?? {};

  // Calculate transits for each day in range
  const transitReadings: Array<{ date: string; transits: TransitResult['aspects'] }> = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = differenceInDays(end, start);

  // Limit to 365 days, sample at intervals for long ranges
  const cappedDays = Math.min(daysDiff, 365);
  const sampleInterval = cappedDays > 90 ? 7 : cappedDays > 30 ? 3 : 1;

  for (let i = 0; i <= cappedDays; i += sampleInterval) {
    const transitDate = addDays(start, i);

    const transitData = calculateTransitsWithEngine({
      natalPlanets,
      transitDate,
      latitude: Number(chart.birth_latitude),
      longitude: Number(chart.birth_longitude),
    });

    // Filter for significant aspects only
    const majorAspects = transitData.aspects.filter(
      (a) => ['conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx'].includes(a.type) && a.orb <= 8,
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
export async function getTodayTransits(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Authentication required', 401);
  }

  // Try to find a calculated chart; return empty data if user has none yet
  const chartId = req.query.chartId as string | undefined;
  let chart: Awaited<ReturnType<typeof findCalculatedChart>> | null = null;
  try {
    chart = await findCalculatedChart(userId, chartId);
  } catch {
    // User has no calculated chart — return empty ephemeris data
    const today = new Date();
    const emptyTransitPlanets = await calculateTransitPlanetsOnly(today);
    res.status(200).json({
      success: true,
      data: {
        date: today.toISOString().split('T')[0],
        chart: null,
        majorAspects: [],
        moonPhase: calculateMoonPhase(
          emptyTransitPlanets.moon?.longitude ?? 0,
          emptyTransitPlanets.sun?.longitude ?? 0,
        ),
        transitPlanets: emptyTransitPlanets,
      },
    });
    return;
  }

  const natalPlanets =
    (chart.calculated_data as Record<string, unknown>).planets as TransitPlanets ?? {};
  const today = new Date();

  const transitData = calculateTransitsWithEngine({
    natalPlanets,
    transitDate: today,
    latitude: Number(chart.birth_latitude),
    longitude: Number(chart.birth_longitude),
  });

  // Get significant aspects
  const majorAspects = transitData.aspects.filter(
    (a) => ['conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx'].includes(a.type) && a.orb <= 8,
  );

  // Calculate moon phase
  const moonPhase = calculateMoonPhase(
    transitData.transitPlanets.moon?.longitude ?? 0,
    transitData.transitPlanets.sun?.longitude ?? 0,
  );

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
export async function getTransitCalendar(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;
  // Query params validated by validateQuery(transitCalendarQuerySchema) middleware
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  const year = Number(req.query.year) || new Date().getFullYear();

  const chart = await findCalculatedChart(userId, req.query.chartId as string | undefined);

  const natalPlanets =
    (chart.calculated_data as Record<string, unknown>).planets as TransitPlanets ?? {};

  // Calculate transits for the month
  const calendarData: Array<{
    date: string;
    day: number;
    aspects: TransitResult['aspects'];
    moonPhase: ReturnType<typeof calculateMoonPhase>;
    retrogrades: string[];
  }> = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);

    const transitData = calculateTransitsWithEngine({
      natalPlanets,
      transitDate: date,
      latitude: Number(chart.birth_latitude),
      longitude: Number(chart.birth_longitude),
    });

    // Get major aspects
    const majorAspects = transitData.aspects.filter(
      (a) => ['conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx'].includes(a.type) && a.orb <= 8,
    );

    // Moon phase
    const moonPhase = calculateMoonPhase(
      transitData.transitPlanets.moon?.longitude ?? 0,
      transitData.transitPlanets.sun?.longitude ?? 0,
    );

    // Check for retrogrades
    const retrogrades = Object.entries(transitData.transitPlanets)
      .filter(([, planet]) => planet.retrograde)
      .map(([key]) => key);

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
export async function getTransitDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;
  const { id } = req.params;

  const reading = await knex('transit_readings')
    .where({ id, user_id: userId })
    .first();

  if (!reading) {
    throw new AppError('Transit reading not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      transit: {
        id: reading.id,
        userId: reading.user_id,
        chartId: reading.chart_id,
        startDate: reading.start_date,
        endDate: reading.end_date,
        transitData:
          typeof reading.transit_data === 'string'
            ? JSON.parse(reading.transit_data)
            : reading.transit_data,
        moonPhases:
          typeof reading.moon_phases === 'string'
            ? JSON.parse(reading.moon_phases)
            : reading.moon_phases,
        createdAt: reading.created_at,
      },
    },
  });
}

/**
 * Get transit forecast for duration
 */
export async function getTransitForecast(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;
  // Query params validated by validateQuery(transitForecastQuerySchema) middleware
  const { duration = 'month' } = req.query; // 'week', 'month', 'quarter', 'year'

  const chart = await findCalculatedChart(userId, req.query.chartId as string | undefined);

  const natalPlanets =
    (chart.calculated_data as Record<string, unknown>).planets as TransitPlanets ?? {};

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
    default:
      endDate = addMonths(now, 1); // default to 1 month for invalid duration values
  }

  // Calculate significant transits (outer planets only for longer periods)
  const outerPlanets = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const transitForecast: TransitForecastItem[] = [];

  const daysDiff = differenceInDays(endDate, now);

  // Sample at intervals for long durations to avoid O(365) calculations
  const sampleInterval = duration === 'year' ? 7 : duration === 'quarter' ? 3 : 1;
  const cappedDays = Math.min(daysDiff, 365);

  for (let i = 0; i <= cappedDays; i += sampleInterval) {
    const date = addDays(now, i);

    const transitData = calculateTransitsWithEngine({
      natalPlanets,
      transitDate: date,
      latitude: Number(chart.birth_latitude),
      longitude: Number(chart.birth_longitude),
    });

    // Filter for outer planet aspects
    const outerPlanetAspects = transitData.aspects.filter(
      (a) => outerPlanets.includes(a.planet1) || outerPlanets.includes(a.planet2),
    );

    // Further filter for tighter orbs
    const tightAspects = outerPlanetAspects.filter((a) => a.orb <= 3);

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
  }, {} as Record<string, TransitForecastItem[]>);

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
