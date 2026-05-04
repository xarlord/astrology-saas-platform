/**
 * Monthly Transit Report Service
 * Calculates and returns 30-day transit summaries for premium users
 *
 * CHI-123: Backend API endpoint for monthly transit reports
 */

import { AstronomyEngineService } from '../../shared/services/astronomyEngine.service';
import ChartModel from '../../charts/models/chart.model';

export interface TransitDay {
  date: string; // YYYY-MM-DD
  sun: {
    sign: string;
    degree: number;
    house?: number;
  };
  moon: {
    sign: string;
    degree: number;
    phase?: string;
    house?: number;
  };
  mercury: {
    sign: string;
    degree: number;
    retrograde: boolean;
    house?: number;
  };
  venus: {
    sign: string;
    degree: number;
    retrograde: boolean;
    house?: number;
  };
  mars: {
    sign: string;
    degree: number;
    retrograde: boolean;
    house?: number;
  };
  keyAspects?: Array<{
    planets: string[];
    type: string;
    degree: number;
  }>;
}

export interface MonthlyTransitReport {
  userId: string;
  month: string; // YYYY-MM
  natalChart: {
    id: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
  };
  dailyTransits: TransitDay[];
  summary: {
    keyThemes: string[];
    majorTransits: Array<{
      planet: string;
      sign: string;
      startDate: string;
      endDate: string;
      influence: string;
    }>;
    retrogrades: Array<{
      planet: string;
      startDate: string;
      endDate: string;
      sign: string;
    }>;
  };
  generatedAt: string;
}

/**
 * Generate a monthly transit report for a user
 * @param userId - User ID
 * @param month - Month in YYYY-MM format (defaults to current month)
 * @returns Monthly transit report
 */
export async function generateMonthlyTransitReport(
  userId: string,
  month?: string,
): Promise<MonthlyTransitReport> {
  // Get user's primary natal chart
  const charts = await ChartModel.findByUserId(userId);
  const chart = charts[0]; // Get the first (primary) chart
  if (!chart) {
    throw new Error('No natal chart found. Please create a natal chart first.');
  }

  // Parse month or use current month
  const targetMonth = month || new Date().toISOString().slice(0, 7);
  const [year, monthNum] = targetMonth.split('-').map(Number);

  // Validate month format
  if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
    throw new Error('Invalid month format. Use YYYY-MM.');
  }

  // Calculate last day of month
  const lastDay = new Date(year, monthNum, 0, 23, 59, 59);

  // Generate daily transits for each day in the month
  const dailyTransits: TransitDay[] = [];
  const astronomyService = new AstronomyEngineService();

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const currentDate = new Date(year, monthNum - 1, day, 12, 0, 0);

    // Get planetary positions for this date
    const positions = astronomyService.calculatePlanetaryPositions(
      currentDate,
      chart.birth_latitude,
      chart.birth_longitude,
    );

    const sun = positions.get('Sun');
    const moon = positions.get('Moon');
    const mercury = positions.get('Mercury');
    const venus = positions.get('Venus');
    const mars = positions.get('Mars');

    if (!sun || !moon || !mercury || !venus || !mars) {
      continue; // Skip if any key planet is missing
    }

    // Calculate house positions (simplified - would need full chart calculation)
    const sunHouse = calculateHousePosition(
      sun.longitude,
      chart.birth_latitude,
      chart.birth_longitude,
      currentDate,
    );
    const moonHouse = calculateHousePosition(
      moon.longitude,
      chart.birth_latitude,
      chart.birth_longitude,
      currentDate,
    );
    const mercuryHouse = calculateHousePosition(
      mercury.longitude,
      chart.birth_latitude,
      chart.birth_longitude,
      currentDate,
    );
    const venusHouse = calculateHousePosition(
      venus.longitude,
      chart.birth_latitude,
      chart.birth_longitude,
      currentDate,
    );
    const marsHouse = calculateHousePosition(
      mars.longitude,
      chart.birth_latitude,
      chart.birth_longitude,
      currentDate,
    );

    // Calculate key aspects for this day
    const keyAspects = calculateKeyAspects(positions, chart);

    dailyTransits.push({
      date: currentDate.toISOString().slice(0, 10),
      sun: {
        sign: sun.sign,
        degree: sun.degree,
        house: sunHouse,
      },
      moon: {
        sign: moon.sign,
        degree: moon.degree,
        house: moonHouse,
      },
      mercury: {
        sign: mercury.sign,
        degree: mercury.degree,
        retrograde: mercury.isRetrograde,
        house: mercuryHouse,
      },
      venus: {
        sign: venus.sign,
        degree: venus.degree,
        retrograde: venus.isRetrograde,
        house: venusHouse,
      },
      mars: {
        sign: mars.sign,
        degree: mars.degree,
        retrograde: mars.isRetrograde,
        house: marsHouse,
      },
      keyAspects,
    });
  }

  // Generate summary
  const summary = generateMonthlySummary(dailyTransits);

  return {
    userId,
    month: targetMonth,
    natalChart: {
      id: chart.id,
      birthDate: chart.birth_date.toISOString().slice(0, 10),
      birthTime: chart.birth_time,
      birthPlace: chart.birth_place_name,
    },
    dailyTransits,
    summary,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate house position for a planet
 * Simplified calculation based on Placidus houses
 */
function calculateHousePosition(
  planetLongitude: number,
  _birthLatitude: number,
  birthLongitude: number,
  date: Date,
): number {
  // Simplified house calculation (would use full Placidus in production)
  // This is a basic approximation
  const localSiderealTime = (date.getTime() / 1000 / 86400 + birthLongitude / 15) % 24;
  const house = Math.floor((localSiderealTime + planetLongitude / 15) % 12) + 1;
  return house;
}

/**
 * Calculate key aspects for a given date
 */
function calculateKeyAspects(
  transits: Map<string, any>,
  natalChart: any,
): Array<{ planets: string[]; type: string; degree: number }> {
  const aspects: Array<{ planets: string[]; type: string; degree: number }> = [];

  // Get natal positions (simplified - would need full natal chart data)
  const natalSun = natalChart.sunLongitude || 0;
  const natalMoon = natalChart.moonLongitude || 0;

  // Check transit aspects to natal planets
  const transitSun = transits.get('Sun');
  const transitMoon = transits.get('Moon');

  if (transitSun && natalSun) {
    const aspect = getAspect(transitSun.longitude, natalSun);
    if (aspect) {
      aspects.push({
        planets: ['Transit Sun', 'Natal Sun'],
        type: aspect.type,
        degree: aspect.degree,
      });
    }
  }

  if (transitMoon && natalMoon) {
    const aspect = getAspect(transitMoon.longitude, natalMoon);
    if (aspect) {
      aspects.push({
        planets: ['Transit Moon', 'Natal Moon'],
        type: aspect.type,
        degree: aspect.degree,
      });
    }
  }

  return aspects;
}

/**
 * Determine aspect between two planets
 */
function getAspect(
  longitude1: number,
  longitude2: number,
): { type: string; degree: number } | null {
  const diff = Math.abs(longitude1 - longitude2);
  const normalizedDiff = diff > 180 ? 360 - diff : diff;

  // Major aspects (within 3° orb)
  const aspects = [
    { type: 'Conjunction', degree: 0, orb: 3 },
    { type: 'Opposition', degree: 180, orb: 3 },
    { type: 'Trine', degree: 120, orb: 3 },
    { type: 'Square', degree: 90, orb: 3 },
    { type: 'Sextile', degree: 60, orb: 3 },
  ];

  for (const aspect of aspects) {
    if (Math.abs(normalizedDiff - aspect.degree) <= aspect.orb) {
      return {
        type: aspect.type,
        degree: Math.round(normalizedDiff * 10) / 10,
      };
    }
  }

  return null;
}

/**
 * Generate monthly summary from daily transits
 */
function generateMonthlySummary(dailyTransits: TransitDay[]): MonthlyTransitReport['summary'] {
  const keyThemes: string[] = [];
  const majorTransits: MonthlyTransitReport['summary']['majorTransits'] = [];
  const retrogrades: MonthlyTransitReport['summary']['retrogrades'] = [];

  // Analyze patterns in daily transits
  const mercuryRetrograde = dailyTransits.filter((d) => d.mercury.retrograde);
  const venusRetrograde = dailyTransits.filter((d) => d.venus.retrograde);
  const marsRetrograde = dailyTransits.filter((d) => d.mars.retrograde);

  // Track retrograde periods
  if (mercuryRetrograde.length > 0) {
    retrogrades.push({
      planet: 'Mercury',
      startDate: mercuryRetrograde[0].date,
      endDate: mercuryRetrograde[mercuryRetrograde.length - 1].date,
      sign: mercuryRetrograde[0].mercury.sign,
    });
    keyThemes.push('Mercury retrograde: Review communications, technology, and travel plans');
  }

  if (venusRetrograde.length > 0) {
    retrogrades.push({
      planet: 'Venus',
      startDate: venusRetrograde[0].date,
      endDate: venusRetrograde[venusRetrograde.length - 1].date,
      sign: venusRetrograde[0].venus.sign,
    });
    keyThemes.push('Venus retrograde: Reevaluate relationships and finances');
  }

  if (marsRetrograde.length > 0) {
    retrogrades.push({
      planet: 'Mars',
      startDate: marsRetrograde[0].date,
      endDate: marsRetrograde[marsRetrograde.length - 1].date,
      sign: marsRetrograde[0].mars.sign,
    });
    keyThemes.push('Mars retrograde: Channel energy carefully, avoid conflicts');
  }

  // Identify major transits (simplified)
  const sunTransit = dailyTransits[0]?.sun;
  if (sunTransit) {
    majorTransits.push({
      planet: 'Sun',
      sign: sunTransit.sign,
      startDate: dailyTransits[0].date,
      endDate: dailyTransits[dailyTransits.length - 1].date,
      influence: `Focus on ${sunTransit.sign.toLowerCase()} themes: identity, vitality, and self-expression`,
    });
  }

  return {
    keyThemes,
    majorTransits,
    retrogrades,
  };
}
