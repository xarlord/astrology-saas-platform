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
import { HouseCusp, Aspect } from '../../../types/chart';

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
    })) as unknown as HouseCusp[],
    aspects: (aspects || []) as unknown as Aspect[],
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

  const { aspects } = chart.calculated_data as { aspects: Aspect[] };

  const aspectAnalysis = {
    chartId: chart.id,
    aspectsByType: groupAspectsByType(aspects as unknown as AspectData[]),
    aspectGrid: buildAspectGrid(aspects as unknown as AspectData[]),
    majorAspects: getMajorAspects(aspects as unknown as AspectData[]),
    harmonicAspects: getHarmoniousAspects(aspects as unknown as AspectData[]),
    challengingAspects: getChallengingAspects(aspects as unknown as AspectData[]),
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
    houses: housesArray as unknown as HouseCusp[],
    aspects: (aspects || []) as unknown as Aspect[],
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

  const { planets, houses } = chart.calculated_data as {
    planets: Record<string, PlanetCalcData>;
    houses: { houses: HouseCalcData[] };
  };

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

function buildAspectGrid(aspects: AspectData[]) {
  // Collect all unique planet names
  const planetSet = new Set<string>();
  aspects.forEach(a => {
    planetSet.add(a.planet1);
    planetSet.add(a.planet2);
  });
  const planetList = Array.from(planetSet).sort();

  // Build a nested map: grid[planet1][planet2] = aspect type or null
  const grid: Record<string, Record<string, string | null>> = {};
  for (const p of planetList) {
    grid[p] = {};
    for (const q of planetList) {
      grid[p][q] = null;
    }
  }

  aspects.forEach(a => {
    grid[a.planet1][a.planet2] = a.aspect;
    grid[a.planet2][a.planet1] = a.aspect; // symmetrical
  });

  return { planets: planetList, grid };
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

/**
 * Calculate the ruling planet of each house based on the sign on its cusp.
 * For each house: sign on cusp → ruling planet → where that planet sits in the chart.
 */
function calculateHouseRulers(planets: Record<string, PlanetCalcData>, houses: { houses: HouseCalcData[] }) {
  const ZODIAC_RULERS: Record<string, string> = {
    aries: 'mars', taurus: 'venus', gemini: 'mercury', cancer: 'moon',
    leo: 'sun', virgo: 'mercury', libra: 'venus', scorpio: 'pluto',
    sagittarius: 'jupiter', capricorn: 'saturn', aquarius: 'uranus', pisces: 'neptune',
  };

  const rulerOf: Record<string, string[]> = {};
  for (const [sign, ruler] of Object.entries(ZODIAC_RULERS)) {
    if (!rulerOf[ruler]) rulerOf[ruler] = [];
    rulerOf[ruler].push(sign);
  }

  const result: Record<number, {
    signOnCusp: string;
    ruler: string;
    rulerInHouse: number | null;
    rulerInSign: string | null;
  }> = {};

  const planetKeys = Object.keys(planets);

  houses.houses.forEach((h, i) => {
    const houseNum = i + 1;
    const cuspSign = getZodiacSign(h.cusp);
    const ruler = ZODIAC_RULERS[cuspSign];

    let rulerInHouse: number | null = null;
    let rulerInSign: string | null = null;

    if (ruler && planets[ruler]) {
      const rulerData = planets[ruler];
      rulerInSign = rulerData.sign;
      rulerInHouse = findHouseForPosition(rulerData.longitude, houses.houses);
    } else if (ruler) {
      // Ruling planet not in the calculated planets set (e.g., outer planets omitted)
      // Try a case-insensitive match
      const matchedKey = planetKeys.find(k => k.toLowerCase() === ruler.toLowerCase());
      if (matchedKey) {
        rulerInSign = planets[matchedKey].sign;
        rulerInHouse = findHouseForPosition(planets[matchedKey].longitude, houses.houses);
      }
    }

    result[houseNum] = {
      signOnCusp: cuspSign,
      ruler,
      rulerInHouse,
      rulerInSign,
    };
  });

  return result;
}

/**
 * Identify houses that contain no natal planets.
 */
function identifyEmptyHouses(planets: Record<string, PlanetCalcData>, houses: { houses: HouseCalcData[] }) {
  const emptyHouses: number[] = [];

  // Build a set of occupied house numbers
  const occupiedHouses = new Set<number>();
  for (const planet of Object.values(planets)) {
    const houseNum = findHouseForPosition(planet.longitude, houses.houses);
    occupiedHouses.add(houseNum);
  }

  for (let i = 1; i <= 12; i++) {
    if (!occupiedHouses.has(i)) {
      emptyHouses.push(i);
    }
  }

  return emptyHouses;
}

interface Stellium {
  type: 'sign' | 'house';
  sign?: string;
  house?: number;
  planets: string[];
}

/**
 * Identify stelliums — 3+ planets in the same sign or house.
 */
function identifyStelliums(planets: Record<string, PlanetCalcData>, houses: { houses: HouseCalcData[] }): Stellium[] {
  const stelliums: Stellium[] = [];
  const STELLIUM_THRESHOLD = 3;

  // Group planets by sign
  const signGroups: Record<string, string[]> = {};
  for (const [key, data] of Object.entries(planets)) {
    const sign = data.sign;
    if (!signGroups[sign]) signGroups[sign] = [];
    signGroups[sign].push(key);
  }

  for (const [sign, planetList] of Object.entries(signGroups)) {
    if (planetList.length >= STELLIUM_THRESHOLD) {
      stelliums.push({ type: 'sign', sign, planets: planetList });
    }
  }

  // Group planets by house
  const houseGroups: Record<number, string[]> = {};
  for (const [key, data] of Object.entries(planets)) {
    const houseNum = findHouseForPosition(data.longitude, houses.houses);
    if (!houseGroups[houseNum]) houseGroups[houseNum] = [];
    houseGroups[houseNum].push(key);
  }

  for (const [house, planetList] of Object.entries(houseGroups)) {
    if (planetList.length >= STELLIUM_THRESHOLD) {
      stelliums.push({ type: 'house', house: Number(house), planets: planetList });
    }
  }

  return stelliums;
}
