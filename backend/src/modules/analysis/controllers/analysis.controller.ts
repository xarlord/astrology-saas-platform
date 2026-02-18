/**
 * Analysis Controller
 * Handles personality analysis and chart interpretation
 */

import { Request, Response } from 'express';
import { AppError } from '../../../middleware/errorHandler';
import { ChartModel, UserModel } from '../models';
import { swissEphemeris } from '../services';
import {
  generateCompletePersonalityAnalysis,
  generateTransitAnalysis,
} from '../services/interpretation.service';

/**
 * Get personality analysis for a chart
 */
export async function getPersonalityAnalysis(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
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

  const { planets, houses, aspects } = chart.calculated_data;

  // Use interpretation service to generate complete analysis
  const analysis = generateCompletePersonalityAnalysis({
    planets,
    houses,
    aspects,
  });

  res.status(200).json({
    success: true,
    data: { analysis },
  });
}

/**
 * Get aspect analysis
 */
export async function getAspectAnalysis(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { chartId } = req.params;

  const chart = await ChartModel.findByIdAndUserId(chartId, userId);
  if (!chart) {
    throw new AppError('Chart not found', 404);
  }

  if (!chart.calculated_data) {
    throw new AppError('Chart must be calculated first', 400);
  }

  const { aspects } = chart.calculated_data;

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
export async function getAspectPatterns(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { chartId } = req.params;

  const chart = await ChartModel.findByIdAndUserId(chartId, userId);
  if (!chart) {
    throw new AppError('Chart not found', 404);
  }

  if (!chart.calculated_data) {
    throw new AppError('Chart must be calculated first', 400);
  }

  const { planets, aspects } = chart.calculated_data;

  // Use interpretation service to detect patterns
  const analysis = generateCompletePersonalityAnalysis({
    planets,
    houses: chart.calculated_data.houses,
    aspects,
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
export async function getPlanetsInSigns(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { chartId } = req.params;

  const chart = await ChartModel.findByIdAndUserId(chartId, userId);
  if (!chart) {
    throw new AppError('Chart not found', 404);
  }

  if (!chart.calculated_data) {
    throw new AppError('Chart must be calculated first', 400);
  }

  const { planets } = chart.calculated_data;

  const planetsInSigns = buildPlanetsInSigns(planets);

  res.status(200).json({
    success: true,
    data: { planetsInSigns },
  });
}

/**
 * Get houses analysis
 */
export async function getHousesAnalysis(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { chartId } = req.params;

  const chart = await ChartModel.findByIdAndUserId(chartId, userId);
  if (!chart) {
    throw new AppError('Chart not found', 404);
  }

  if (!chart.calculated_data) {
    throw new AppError('Chart must be calculated first', 400);
  }

  const { planets, houses } = chart.calculated_data;

  const housesAnalysis = {
    houses: houses.houses,
    planetsInHouses: buildPlanetsInHouses(planets, houses),
    houseRulers: calculateHouseRulers(planets, houses),
    emptyHouses: identifyEmptyHouses(planets, houses),
    stelliums: identifyStelliums(planets, houses),
  };

  res.status(200).json({
    success: true,
    data: { housesAnalysis },
  });
}

// Helper functions

function buildOverview(planets: any) {
  const sun = planets.sun;
  const moon = planets.moon;
  const ascendant = 'ascendant'; // Would get from houses

  return {
    sunSign: {
      sign: sun.sign,
      position: sun.position,
      interpretation: `Your Sun in ${sun.sign} indicates your core identity and life purpose.`,
    },
    moonSign: {
      sign: moon.sign,
      position: moon.position,
      retrograde: moon.retrograde,
      interpretation: `Your Moon in ${moon.sign} reveals your emotional nature and inner needs.`,
    },
    ascendant: {
      // Would include ascendant sign
      interpretation: 'Your Rising sign influences your outer personality and first impressions.',
    },
  };
}

function buildPlanetsInSigns(planets: any) {
  return Object.entries(planets).map(([key, planet]: [string, any]) => ({
    planet: key,
    symbol: swissEphemeris.PLANET_SYMBOLS[key as keyof typeof swissEphemeris.PLANET_SYMBOLS] || key,
    sign: planet.sign,
    position: planet.position,
    retrograde: planet.retrograde,
    house: planet.house, // Would need to calculate
  }));
}

function buildPlanetsInHouses(planets: any, houses: any) {
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

function buildMajorAspects(aspects: any[]) {
  return aspects.filter(a =>
    ['conjunction', 'opposition', 'trine', 'square'].includes(a.aspect)
  ).slice(0, 10); // Top 10
}

function calculateDominantElements(planets: any) {
  const elements = { fire: 0, earth: 0, air: 0, water: 0 };

  Object.entries(planets).forEach(([key, planet]: [string, any]) => {
    const sign = planet.sign;
    if (['aries', 'leo', 'sagittarius'].includes(sign)) elements.fire++;
    else if (['taurus', 'virgo', 'capricorn'].includes(sign)) elements.earth++;
    else if (['gemini', 'libra', 'aquarius'].includes(sign)) elements.air++;
    else if (['cancer', 'scorpio', 'pisces'].includes(sign)) elements.water++;
  });

  return elements;
}

function identifyChartPattern(aspects: any[]) {
  // TODO: Implement T-Square, Grand Cross, Grand Trine, Yod detection
  return {
    hasGrandTrine: false,
    hasTSquare: false,
    hasGrandCross: false,
    hasYod: false,
    hasKite: false,
  };
}

function groupAspectsByType(aspects: any[]) {
  const grouped: Record<string, any[]> = {};

  aspects.forEach(aspect => {
    if (!grouped[aspect.aspect]) grouped[aspect.aspect] = [];
    grouped[aspect.aspect].push(aspect);
  });

  return grouped;
}

function buildAspectGrid(aspects: any[]) {
  // TODO: Build matrix grid of aspects between planets
  return {};
}

function getMajorAspects(aspects: any[]) {
  return aspects.filter(a => a.orb <= 3); // Tight orbs
}

function getHarmoniousAspects(aspects: any[]) {
  return aspects.filter(a => ['trine', 'sextile'].includes(a.aspect));
}

function getChallengingAspects(aspects: any[]) {
  return aspects.filter(a => ['square', 'opposition', 'quincunx'].includes(a.aspect));
}

function identifyPatterns(planets: any, aspects: any[]) {
  return {
    stelliums: [],
    grandTrines: [],
    tSquares: [],
    grandCrosses: [],
    yods: [],
    kites: [],
  };
}

function calculateHouseRulers(planets: any, houses: any) {
  // TODO: Calculate rulers of each house
  return {};
}

function identifyEmptyHouses(planets: any, houses: any) {
  const emptyHouses: number[] = [];
  // TODO: Identify houses with no planets
  return emptyHouses;
}

function identifyStelliums(planets: any, houses: any) {
  // TODO: Identify 3+ planets in same sign/house
  return [];
}
