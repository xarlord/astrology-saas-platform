/**
 * Chart Controller
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth';
import { AppError } from '../../../middleware/errorHandler';
import { ChartModel } from '../models';
import { NatalChartService } from '../../shared/services/natalChart.service';
import type { NatalChart } from '../../shared/services/natalChart.service';

const natalChartService = new NatalChartService();

/**
 * Map house_system value from the database (lowercase) to NatalChartService
 * enum format (PascalCase).
 */
function toHouseSystemEnum(value: string | undefined): 'Placidus' | 'Koch' | 'Equal' | 'WholeSign' {
  const map: Record<string, 'Placidus' | 'Koch' | 'Equal' | 'WholeSign'> = {
    placidus: 'Placidus',
    koch: 'Koch',
    equal: 'Equal',
    equal_house: 'Equal',
    whole_sign: 'WholeSign',
    wholesign: 'WholeSign',
  };
  return map[(value ?? 'placidus').toLowerCase()] ?? 'Placidus';
}

/**
 * Adapt NatalChartService output to the response shape previously produced
 * by the mock swissEphemeris service, so the frontend contract is preserved.
 */
function adaptNatalChart(chart: NatalChart): Record<string, unknown> {
  // Convert Map<string, PlanetaryPosition> to a plain object keyed by
  // lowercase planet names (matching the old swissEphemeris output).
  const planetsObj: Record<string, unknown> = {};
  for (const [name, pos] of chart.planets) {
    planetsObj[name.toLowerCase()] = {
      longitude: pos.longitude,
      latitude: pos.latitude,
      speed: pos.speed,
      sign: pos.sign.toLowerCase(),
      degree: pos.degree,
      minute: pos.minute,
      second: pos.second,
      isRetrograde: pos.isRetrograde,
      house: pos.house,
      ...(pos.distance !== undefined ? { distance: pos.distance } : {}),
    };
  }

  // Add Chiron and lunar nodes if present
  if (chart.chiron) {
    planetsObj['chiron'] = {
      longitude: chart.chiron.longitude,
      sign: chart.chiron.sign.toLowerCase(),
      degree: chart.chiron.degree,
      isRetrograde: chart.chiron.isRetrograde,
    };
  }
  if (chart.lunarNodes) {
    planetsObj['northnode'] = {
      longitude: chart.lunarNodes.northNode.longitude,
      sign: chart.lunarNodes.northNode.sign.toLowerCase(),
      degree: chart.lunarNodes.northNode.degree,
    };
    planetsObj['southnode'] = {
      longitude: chart.lunarNodes.southNode.longitude,
      sign: chart.lunarNodes.southNode.sign.toLowerCase(),
      degree: chart.lunarNodes.southNode.degree,
    };
  }

  // Convert houses to the legacy array-of-objects format
  const housesArr = chart.houses.cusps.map((cusp, i) => {
    const nextCusp = chart.houses.cusps[(i + 1) % 12];
    let size = nextCusp.longitude - cusp.longitude;
    if (size <= 0) size += 360;
    return { cusp: cusp.longitude, size };
  });

  return {
    jd: chart.julianDay,
    localSiderealTime: chart.localSiderealTime,
    planets: planetsObj,
    houses: housesArr,
    ascendant: chart.houses.ascendant,
    midheaven: chart.houses.midheaven,
    aspects: chart.aspects.map((a) => ({
      planet1: a.planet1.toLowerCase(),
      planet2: a.planet2.toLowerCase(),
      type: a.type,
      orb: a.orb,
      exact: a.exact,
      ...(a.applying !== undefined ? { applying: a.applying } : {}),
      harmonious: a.harmonious,
    })),
    elements: chart.elements,
    modalities: chart.modalities,
  };
}

/**
 * Create new chart
 */
export async function createChart(req: AuthenticatedRequest, res: Response): Promise<void> {
  const {
    name,
    type = 'natal',
    birth_date,
    birth_time,
    birth_time_unknown = false,
    birth_place_name,
    birth_latitude,
    birth_longitude,
    birth_timezone,
    house_system = 'placidus',
    zodiac = 'tropical',
    sidereal_mode,
  } = req.body;

  // Validate required fields
  if (!name || !birth_date || !birth_place_name || birth_latitude === undefined || birth_longitude === undefined || !birth_timezone) {
    throw new AppError('Missing required fields', 400);
  }

  // Create chart
  const chart = await ChartModel.create({
    user_id: req.user.id,
    name,
    type,
    birth_date: new Date(birth_date),
    birth_time: birth_time || '12:00:00',
    birth_time_unknown,
    birth_place_name,
    birth_latitude,
    birth_longitude,
    birth_timezone,
    house_system,
    zodiac,
    sidereal_mode,
  });

  res.status(201).json({
    success: true,
    data: { chart },
  });
}

/**
 * Get all user's charts
 */
export async function getUserCharts(req: AuthenticatedRequest, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const charts = await ChartModel.findByUserId(req.user.id, limit, offset);
  const count = await ChartModel.countByUserId(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      charts,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    },
  });
}

/**
 * Get specific chart
 */
export async function getChart(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const chart = await ChartModel.findByIdAndUserId(id, req.user.id);

  if (!chart) {
    throw new AppError('Chart not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { chart },
  });
}

/**
 * Update chart
 */
export async function updateChart(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const { name, house_system, zodiac, sidereal_mode } = req.body;

  const chart = await ChartModel.update(id, req.user.id, {
    name,
    house_system,
    zodiac,
    sidereal_mode,
  });

  if (!chart) {
    throw new AppError('Chart not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { chart },
  });
}

/**
 * Delete chart
 */
export async function deleteChart(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const deleted = await ChartModel.softDelete(id, req.user.id);

  if (!deleted) {
    throw new AppError('Chart not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Chart deleted successfully',
  });
}

/**
 * Calculate chart
 */
export async function calculateChart(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const chart = await ChartModel.findByIdAndUserId(id, req.user.id);

  if (!chart) {
    throw new AppError('Chart not found', 404);
  }

  // If already calculated, return cached data
  if (chart.calculated_data) {
    res.status(200).json({
      success: true,
      data: { chart },
    });
    return;
  }

  // Calculate natal chart using real astronomy engine
  const natalChart = natalChartService.calculateNatalChart({
    birthDate: new Date(chart.birth_date),
    birthTime: chart.birth_time,
    latitude: chart.birth_latitude,
    longitude: chart.birth_longitude,
    location: chart.birth_place_name,
    timezone: chart.birth_timezone,
    houseSystem: toHouseSystemEnum(chart.house_system),
  });

  // Adapt to the legacy response shape expected by the frontend
  const calculatedData = adaptNatalChart(natalChart);

  // Update chart with calculated data
  const updatedChart = await ChartModel.updateCalculatedData(id, req.user.id, calculatedData);

  res.status(200).json({
    success: true,
    data: { chart: updatedChart },
  });
}
