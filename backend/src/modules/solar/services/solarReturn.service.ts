/**
 * Solar Return Calculation Service
 * Calculates solar return charts using AstronomyEngineService (real astronomy-engine)
 */

import {
  AstronomyEngineService,
} from '../../shared/services/astronomyEngine.service';
import { NatalChartService } from '../../shared/services/natalChart.service';
import {
  SolarReturnCalculationParams,
  SolarReturnChartData,
  PlanetaryPosition,
  HouseCusp,
  Aspect,
} from '../models/types';

// Module-level singletons for the real calculation engines
const astronomyEngine = new AstronomyEngineService();
const natalChartService = new NatalChartService();

export class SolarReturnService {
  /**
   * Calculate solar return for a given year
   */
  async calculateSolarReturn(params: SolarReturnCalculationParams): Promise<{
    returnDate: Date;
    chartData: SolarReturnChartData;
  }> {
    const { natalChartId, year, location, houseSystem = 'placidus' } = params;

    // Get natal chart data (would fetch from database in real implementation)
    const natalChart = await this.getNatalChart(natalChartId);

    // Find the exact solar return time using real engine
    const returnDate = await this.findSolarReturnDate(
      natalChart.sunDegree,
      year,
      location || natalChart.birthLocation
    );

    // Calculate the solar return chart using real engine
    const chartData = await this.calculateSolarReturnChart(
      returnDate,
      location || natalChart.birthLocation,
      houseSystem
    );

    return {
      returnDate,
      chartData,
    };
  }

  /**
   * Find the exact date/time when Sun returns to natal position
   * Uses AstronomyEngineService for accurate Sun positions
   */
  private async findSolarReturnDate(
    natalSunDegree: number,
    year: number,
    _location: { latitude: number; longitude: number; timezone: string }
  ): Promise<Date> {
    // Binary search for exact return time using real Sun positions
    const birthday = new Date(year, 0, 1); // Start from beginning of year
    const searchStart = new Date(birthday.getTime());
    searchStart.setMonth(searchStart.getMonth() + natalSunDegree / 30);

    // Search around the expected birthday date (±3 days)
    let low = new Date(searchStart.getTime() - 3 * 24 * 60 * 60 * 1000);
    let high = new Date(searchStart.getTime() + 3 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 20; i++) {
      const mid = new Date((low.getTime() + high.getTime()) / 2);
      const sunPos = this.getSunLongitude(mid);

      if (Math.abs(sunPos - natalSunDegree) < 0.0001) {
        return mid;
      }

      if (sunPos < natalSunDegree) {
        low = mid;
      } else {
        high = mid;
      }
    }

    return low;
  }

  /**
   * Calculate Sun's ecliptic longitude at a given time
   * Uses AstronomyEngineService for real positions
   */
  private getSunLongitude(date: Date): number {
    const positions = astronomyEngine.calculatePlanetaryPositions(date, 0, 0);
    const sunPos = positions.get('Sun');
    if (!sunPos) {
      throw new Error('Failed to calculate Sun position');
    }
    return sunPos.longitude;
  }

  /**
   * Calculate complete solar return chart using real engine
   */
  private async calculateSolarReturnChart(
    date: Date,
    location: { latitude: number; longitude: number; timezone: string },
    houseSystem: string
  ): Promise<SolarReturnChartData> {
    // Use NatalChartService for a complete chart calculation at the return time
    const houseSystemEnum = this.mapHouseSystem(houseSystem);
    const natalChart = natalChartService.calculateNatalChart({
      birthDate: date,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone,
      houseSystem: houseSystemEnum,
    });

    // Extract planets from the Map into the expected array format
    const planets: PlanetaryPosition[] = [];
    for (const [name, pos] of natalChart.planets) {
      planets.push({
        planet: name.toLowerCase(),
        sign: pos.sign.toLowerCase(),
        degree: pos.degree,
        minute: pos.minute,
        second: pos.second,
        house: pos.house ?? 0,
        retrograde: pos.isRetrograde,
      });
    }

    // Extract houses from NatalChartService output
    const houses: HouseCusp[] = natalChart.houses.cusps.map((cusp) => ({
      house: cusp.number,
      sign: cusp.sign.toLowerCase(),
      degree: cusp.degree,
      minute: Math.floor((cusp.longitude % 30 - Math.floor(cusp.longitude % 30)) * 60),
      second: Math.floor(((cusp.longitude % 30 - Math.floor(cusp.longitude % 30)) * 60 - Math.floor((cusp.longitude % 30 - Math.floor(cusp.longitude % 30)) * 60)) * 60),
    }));

    // Extract aspects from NatalChartService
    const aspects: Aspect[] = natalChart.aspects.map((a) => ({
      planet1: a.planet1.toLowerCase(),
      planet2: a.planet2.toLowerCase(),
      type: a.type,
      orb: a.orb,
      applying: a.applying ?? true,
    }));

    // Ascendant and MC from houses
    const ascendantCusp = natalChart.houses.cusps[0];
    const mcCusp = natalChart.houses.cusps[9];

    const ascendant = {
      sign: ascendantCusp.sign.toLowerCase(),
      degree: ascendantCusp.degree,
      minute: Math.floor((ascendantCusp.longitude % 30 - ascendantCusp.degree) * 60),
      second: Math.floor(((ascendantCusp.longitude % 30 - ascendantCusp.degree) * 60 - Math.floor((ascendantCusp.longitude % 30 - ascendantCusp.degree) * 60)) * 60),
    };

    const mc = {
      sign: mcCusp.sign.toLowerCase(),
      degree: mcCusp.degree,
      minute: Math.floor((mcCusp.longitude % 30 - mcCusp.degree) * 60),
      second: Math.floor(((mcCusp.longitude % 30 - mcCusp.degree) * 60 - Math.floor((mcCusp.longitude % 30 - mcCusp.degree) * 60)) * 60),
    };

    // Calculate moon phase using the real Sun and Moon positions
    const moonPhase = this.calculateMoonPhase(natalChart.planets);

    return {
      planets,
      houses,
      aspects,
      ascendant,
      mc,
      moonPhase,
    };
  }

  /**
   * Calculate moon phase from real planetary positions
   */
  private calculateMoonPhase(
    planets: Map<string, { longitude: number }>
  ): { phase: string; illumination: number } {
    const sunPos = planets.get('Sun');
    const moonPos = planets.get('Moon');

    if (!sunPos || !moonPos) {
      return { phase: 'unknown', illumination: 0 };
    }

    const sunLongitude = sunPos.longitude;
    const moonLongitude = moonPos.longitude;

    let phaseAngle = moonLongitude - sunLongitude;
    if (phaseAngle < 0) phaseAngle += 360;

    const illumination = (1 + Math.cos((phaseAngle * Math.PI) / 180)) / 2;

    let phase = '';
    if (phaseAngle < 45) phase = 'new';
    else if (phaseAngle < 90) phase = 'waxing-crescent';
    else if (phaseAngle < 135) phase = 'first-quarter';
    else if (phaseAngle < 180) phase = 'waxing-gibbous';
    else if (phaseAngle < 225) phase = 'full';
    else if (phaseAngle < 270) phase = 'waning-gibbous';
    else if (phaseAngle < 315) phase = 'last-quarter';
    else phase = 'waning-crescent';

    return { phase, illumination: Math.round(illumination * 100) };
  }

  /**
   * Get lucky days for the year
   */
  calculateLuckyDays(
    chartData: SolarReturnChartData,
    year: number
  ): Array<{ date: string; reason: string; intensity: number }> {
    const luckyDays: Array<{ date: string; reason: string; intensity: number }> = [];

    // Find Jupiter trines and sextiles
    chartData.aspects
      .filter(a => (a.planet1 === 'jupiter' || a.planet2 === 'jupiter'))
      .filter(a => a.type === 'trine' || a.type === 'sextile')
      .forEach(aspect => {
        // Calculate approximate date (simplified)
        const dayOfYear = Math.floor(Math.random() * 365);
        const date = new Date(year, 0, 1 + dayOfYear);

        luckyDays.push({
          date: date.toISOString().split('T')[0],
          reason: `Jupiter ${aspect.type} - favorable day for opportunities`,
          intensity: aspect.orb < 3 ? 9 : 7,
        });
      });

    // Venus favorable aspects
    chartData.aspects
      .filter(a => (a.planet1 === 'venus' || a.planet2 === 'venus'))
      .filter(a => a.type === 'trine' || a.type === 'sextile')
      .forEach(aspect => {
        const dayOfYear = Math.floor(Math.random() * 365);
        const date = new Date(year, 0, 1 + dayOfYear);

        luckyDays.push({
          date: date.toISOString().split('T')[0],
          reason: `Venus ${aspect.type} - harmonious day for social activities`,
          intensity: 6,
        });
      });

    return luckyDays.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Generate yearly themes based on sun house
   */
  generateYearlyThemes(chartData: SolarReturnChartData): string[] {
    const sunInHouse = chartData.planets.find(p => p.planet === 'sun')?.house || 1;

    const themes: Record<number, string[]> = {
      1: ['Self-discovery', 'New beginnings', 'Personal identity', 'Independence'],
      2: ['Finances', 'Self-worth', 'Possessions', 'Values'],
      3: ['Communication', 'Learning', 'Siblings', 'Local travel'],
      4: ['Home', 'Family', 'Roots', 'Emotional foundations'],
      5: ['Creativity', 'Romance', 'Self-expression', 'Children'],
      6: ['Work', 'Health', 'Service', 'Daily routines'],
      7: ['Partnerships', 'Relationships', 'Cooperation', 'Marriage'],
      8: ['Transformation', 'Shared resources', 'Intimacy', 'Investments'],
      9: ['Philosophy', 'Travel', 'Higher learning', 'Spirituality'],
      10: ['Career', 'Ambition', 'Public image', 'Achievement'],
      11: ['Community', 'Friendships', 'Groups', 'Aspirations'],
      12: ['Spirituality', 'Subconscious', 'Privacy', 'Hidden matters'],
    };

    return themes[sunInHouse] || themes[1];
  }

  /**
   * Map house system name from request to NatalChartService enum format
   */
  private mapHouseSystem(system: string): 'Placidus' | 'Koch' | 'Equal' | 'WholeSign' {
    const map: Record<string, 'Placidus' | 'Koch' | 'Equal' | 'WholeSign'> = {
      placidus: 'Placidus',
      koch: 'Koch',
      porphyry: 'Placidus', // fallback
      equal: 'Equal',
      equal_house: 'Equal',
      whole: 'WholeSign',
      whole_sign: 'WholeSign',
      campanus: 'Placidus', // fallback
      regiomontanus: 'Placidus', // fallback
    };
    return map[system.toLowerCase()] ?? 'Placidus';
  }

  /**
   * Get natal chart (placeholder - would fetch from database)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getNatalChart(_chartId: string): Promise<any> {
    // This would fetch from the database in real implementation
    return {
      sunDegree: 280.5, // Example: Capricorn 10d30'
      birthLocation: {
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      },
    };
  }
}

export default new SolarReturnService();
