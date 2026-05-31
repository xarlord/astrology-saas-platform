/**
 * Analysis Controller
 * Handles personality analysis and chart interpretation
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth';
import { AppError } from '../../../utils/appError';
import { ChartModel } from '../models';
import { swissEphemeris } from '../../shared';
import {
  generateCompletePersonalityAnalysis,
} from '../services/interpretation.service';

interface PlanetCalcData {
  longitude: number;
  latitude: number;
  speed: number;
  sign: string;
  house?: number;
  position?: number;
  retrograde?: boolean;
}

interface HouseCalcData {
  cusp: number;
}

interface HouseOutput {
  house: number;
  cusp: number;
  sign: string;
}

interface AspectData {
  aspect: string;
  planet1: string;
  planet2: string;
  orb: number;
  type?: string;
}

/**
 * Helper: Convert degree to zodiac sign
 */
function getZodiacSign(degree: number): string {
  const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  const normalizedDegree = ((degree % 360) + 360) % 360;
  return signs[Math.floor(normalizedDegree / 30)];
}

/**
 * Get personality analysis for a chart
 */
export async function getPersonalityAnalysis(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;
  const { chartId } = req.params;

  // Get chart
  const chart = await ChartModel.findByIdAndUserId(chartId, userId);
  if (!chart) {
    throw new AppError('Chart not found', 404);
  }

  // Ensure chart is calculated
  if (!chart.calculated_data) {
    throw new AppError('Chart must be calculated first', 400);
  }

  const { planets, houses, aspects } = chart.calculated_data as {
    planets: Record<string, PlanetCalcData>;
    houses: { houses: HouseCalcData[] } | HouseCalcData[];
    aspects: AspectData[];
  };
  const houseArray = (houses as { houses?: HouseCalcData[] }).houses || houses as HouseCalcData[]; // Handle both formats

  // Helper function to convert decimal degrees to DMS
  const longitudeToDMS = (longitude: number) => {
    const degrees = Math.floor(longitude);
    const minutesFloat = (longitude - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = Math.round((minutesFloat - minutes) * 60);
    return { degree: degrees, minute: minutes, second: seconds };
  };

  // Convert planets object to array format for interpretation service
  const planetsArray = Object.entries(planets).map(([planet, data]: [string, PlanetCalcData]) => {
    const dms = longitudeToDMS(data.longitude);
    return {
      planet,
      sign: data.sign,
      longitude: data.longitude,
      latitude: data.latitude,
      speed: data.speed,
      ...dms, // degree, minute, second
      retrograde: data.speed < 0, // Negative speed indicates retrograde
      house: houseArray.findIndex((h: HouseCalcData) => {
        // Simple house calculation based on longitude
        const houseSize = 30;
        return h.cusp <= data.longitude && data.longitude < h.cusp + houseSize;
      }) + 1,
    };
  });

  // Use interpretation service to generate complete analysis
  const analysis = generateCompletePersonalityAnalysis({
    planets: planetsArray,
    houses: houseArray.map((h: HouseCalcData, i: number) => ({
      house: i + 1,
      cusp: h.cusp,
      sign: getZodiacSign(h.cusp),
    })),
    aspects: aspects || [],
  });

  res.status(200).json({
    success: true,
    data: { analysis },
  });
}

/**
 * Get aspect analysis
 */
export async function getAspectAnalysis(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;
  const { chartId } = req.params;

  const chart = await ChartModel.findByIdAndUserId(chartId, userId);
  if (!chart) {
    throw new AppError('Chart not found', 404);
  }

  if (!chart.calculated_data) {
    throw new AppError('Chart must be calculated first', 400);
  }

  const { aspects } = chart.calculated_data as {
    planets: Record<string, PlanetCalcData>;
    houses: { houses: HouseCalcData[] } | HouseCalcData[];
    aspects: AspectData[];
  };

  const aspectAnalysis = {
    chartId: chart.id,
    aspectsByType: groupAspectsByType(aspects),
    aspectGrid: buildAspectGrid(aspects),
    majorAspects: getMajorAspects(aspects),
    harmonicAspects: getHarmoniousAspects(aspects),
    challengingAspects: getChallengingAspects(aspects),
  };

  res.status(200).json({
    success: true,
    data: { aspectAnalysis },
  });
}

/**
 * Get aspect patterns (Grand Trine, T-Square, etc.)
 */
export async function getAspectPatterns(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;
  const { chartId } = req.params;

  const chart = await ChartModel.findByIdAndUserId(chartId, userId);
  if (!chart) {
    throw new AppError('Chart not found', 404);
  }

  if (!chart.calculated_data) {
    throw new AppError('Chart must be calculated first', 400);
  }

  const { planets, houses, aspects } = chart.calculated_data as {
    planets: Record<string, PlanetCalcData>;
    houses: { houses: HouseCalcData[] } | HouseCalcData[];
    aspects: AspectData[];
  };
  const houseArray = (houses as { houses?: HouseCalcData[] }).houses || houses as HouseCalcData[]; // Handle both formats

  // Convert planets object to array format for interpretation service
  const planetsArray = Object.entries(planets).map(([planet, data]: [string, PlanetCalcData]) => {
    const longitude = data.longitude ?? 0;
    const absLon = Math.abs(longitude) % 360;
    const totalDegrees = absLon;
    const degrees = Math.floor(totalDegrees);
    const minutesFloat = (totalDegrees - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = Math.floor((minutesFloat - minutes) * 60);

    return {
      planet,
      sign: data.sign,
      degree: degrees,
      minute: minutes,
      second: seconds,
      house: data.house ?? 1,
      longitude,
      latitude: data.latitude ?? 0,
      speed: data.speed ?? 0,
      retrograde: (data.speed ?? 0) < 0,
    };
  });

  const housesArray: HouseOutput[] = houseArray.map((h: HouseCalcData, i: number) => ({
    house: i + 1,
    cusp: h.cusp,
    sign: getZodiacSign(h.cusp),
  }));

  // Use interpretation service to detect patterns
  const analysis = generateCompletePersonalityAnalysis({
    planets: planetsArray,
    houses: housesArray,
    aspects: aspects || [],
  });

  const patterns = analysis.patterns;

  res.status(200).json({
    success: true,
    data: { patterns },
  });
}

/**
 * Get planets in signs analysis
 */
export async function getPlanetsInSigns(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;
  const { chartId } = req.params;

  const chart = await ChartModel.findByIdAndUserId(chartId, userId);
  if (!chart) {
    throw new AppError('Chart not found', 404);
  }

  if (!chart.calculated_data) {
    throw new AppError('Chart must be calculated first', 400);
  }

  const { planets } = chart.calculated_data as { planets: Record<string, PlanetCalcData> };

  const planetsInSigns = buildPlanetsInSigns(planets);

  res.status(200).json({
    success: true,
    data: { planetsInSigns },
  });
}

/**
 * Get houses analysis
 */
export async function getHousesAnalysis(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;
  const { chartId } = req.params;

  const chart = await ChartModel.findByIdAndUserId(chartId, userId);
  if (!chart) {
    throw new AppError('Chart not found', 404);
  }

  if (!chart.calculated_data) {
    throw new AppError('Chart must be calculated first', 400);
  }

  const raw = chart.calculated_data as Record<string, unknown>;
  const planets = (raw.planets ?? {}) as Record<string, PlanetCalcData>;
  const rawHouses = raw.houses;
  const houseArray: HouseCalcData[] = Array.isArray(rawHouses)
    ? rawHouses
    : (rawHouses as { houses?: HouseCalcData[] })?.houses ?? [];
  const houses = { houses: houseArray };

  const housesAnalysis = {
    houses: houseArray,
    planetsInHouses: buildPlanetsInHouses(planets, houses),
    houseRulers: {},        // TODO: implement house ruler calculation
    emptyHouses: [] as number[],  // TODO: implement empty house identification
    stelliums: [] as unknown[],   // TODO: implement stellium detection
  };

  res.status(200).json({
    success: true,
    data: { housesAnalysis },
  });
}

// Helper functions

function buildPlanetsInSigns(planets: Record<string, PlanetCalcData>) {
  return Object.entries(planets).map(([key, planet]: [string, PlanetCalcData]) => ({
    planet: key,
    symbol: swissEphemeris.PLANET_SYMBOLS[key as keyof typeof swissEphemeris.PLANET_SYMBOLS] || key,
    sign: planet.sign,
    position: planet.position,
    retrograde: planet.retrograde,
    house: planet.house, // Would need to calculate
  }));
}

function buildPlanetsInHouses(planets: Record<string, PlanetCalcData>, houses: { houses: HouseCalcData[] }) {
  const planetHousePositions: Record<string, number> = {};

  // For each planet, determine which house it's in
  Object.keys(planets).forEach(planetKey => {
    const planet = planets[planetKey];
    const houseNum = findHouseForPosition(planet.longitude, houses.houses);
    planetHousePositions[planetKey] = houseNum;
  });

  return planetHousePositions;
}

function findHouseForPosition(longitude: number, houseCusps: Array<{cusp: number}>): number {
  for (let i = 0; i < houseCusps.length; i++) {
    const currentCusp = houseCusps[i].cusp;
    const nextCusp = houseCusps[(i + 1) % 12].cusp;

    if (currentCusp < nextCusp) {
      if (longitude >= currentCusp && longitude < nextCusp) return i + 1;
    } else {
      // House crosses 0°
      if (longitude >= currentCusp || longitude < nextCusp) return i + 1;
    }
  }
  return 1; // Default
}

function groupAspectsByType(aspects: AspectData[]) {
  const grouped: Record<string, AspectData[]> = {};

  aspects.forEach(aspect => {
    if (!grouped[aspect.aspect]) grouped[aspect.aspect] = [];
    grouped[aspect.aspect].push(aspect);
  });

  return grouped;
}

function buildAspectGrid(_aspects: AspectData[]) {
  // TODO: Build matrix grid of aspects between planets
  return {};
}

function getMajorAspects(_aspects: AspectData[]) {
  return _aspects.filter(a => a.orb <= 3); // Tight orbs
}

function getHarmoniousAspects(_aspects: AspectData[]) {
  return _aspects.filter(a => ['trine', 'sextile'].includes(a.aspect));
}

function getChallengingAspects(_aspects: AspectData[]) {
  return _aspects.filter(a => ['square', 'opposition', 'quincunx'].includes(a.aspect));
}
