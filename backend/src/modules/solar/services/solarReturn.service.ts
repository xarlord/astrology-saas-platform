/**
 * Solar Return Calculation Service
 * Calculates solar return charts using Swiss Ephemeris
 */

import { swisseph } from 'swisseph';
import {
  SolarReturnCalculationParams,
  SolarReturnChartData,
  PlanetaryPosition,
  HouseCusp,
  Aspect,
  HouseCusp as HouseCuspType,
} from '../models/types';
// import solarReturnModel from '../models/solarReturn.model';

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

    // Find the exact solar return time
    const returnDate = await this.findSolarReturnDate(
      natalChart.sunDegree,
      year,
      location || natalChart.birthLocation
    );

    // Calculate the solar return chart
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
   */
  private async findSolarReturnDate(
    natalSunDegree: number,
    year: number,
    _location: { latitude: number; longitude: number; timezone: string }
  ): Promise<Date> {
    // Initialize Swiss Ephemeris
    swisseph.swe_set_ephe_path('');

    // Search around the birthday (±3 days)
    const birthday = new Date(year, 0, 1); // Start from beginning of year
    const searchStart = new Date(birthday.getTime());
    searchStart.setMonth(searchStart.getMonth() + natalSunDegree / 30);

    // Binary search for exact return time
    let low = new Date(searchStart.getTime() - 3 * 24 * 60 * 60 * 1000);
    let high = new Date(searchStart.getTime() + 3 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 20; i++) {
      const mid = new Date((low.getTime() + high.getTime()) / 2);
      const sunPos = await this.calculateSunPosition(mid, _location);

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
   * Calculate Sun position at a given time
   */
  private async calculateSunPosition(
    date: Date,
    _location: { latitude: number; longitude: number }
  ): Promise<number> {
    const julianDay = this.dateToJulianDay(date);
    const flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SIDEREAL;

    const result = swisseph.swe_calc_ut(
      julianDay,
      swisseph.SE_SUN,
      flags
    ) as [number, number, number, number];

    const xx = result[0]; // longitude
    const error = result[1]; // error code

    if (error !== 0) {
      throw new Error(`Failed to calculate Sun position: ${error}`);
    }

    return xx; // Longitude in degrees
  }

  /**
   * Calculate complete solar return chart
   */
  private async calculateSolarReturnChart(
    date: Date,
    location: { latitude: number; longitude: number; timezone: string },
    houseSystem: string
  ): Promise<SolarReturnChartData> {
    const julianDay = this.dateToJulianDay(date);
    const flags = swisseph.SEFLG_SWIEPH;

    // Calculate planetary positions
    const planets: PlanetaryPosition[] = [];
    const planetIds = [
      swisseph.SE_SUN,
      swisseph.SE_MOON,
      swisseph.SE_MERCURY,
      swisseph.SE_VENUS,
      swisseph.SE_MARS,
      swisseph.SE_JUPITER,
      swisseph.SE_SATURN,
      swisseph.SE_URANUS,
      swisseph.SE_NEPTUNE,
      swisseph.SE_PLUTO,
    ];

    for (const planetId of planetIds) {
      const result = swisseph.swe_calc_ut(julianDay, planetId, flags) as [number, number, number, number];

      const error = result[1]; // error code

      if (error === 0) {
        const longitude = result[0];
        const sign = this.degreeToSign(longitude);
        const degree = longitude % 30;

        planets.push({
          planet: this.getPlanetName(planetId),
          sign,
          degree: Math.floor(degree),
          minute: Math.floor((degree % 1) * 60),
          second: Math.floor(((degree % 1) * 60 % 1) * 60),
          house: 0, // Will be calculated after houses
          retrograde: result[3] < 0, // Speed < 0 means retrograde
        });
      }
    }

    // Calculate houses
    const houseSystemId = this.getHouseSystemId(houseSystem);
    const housesResult = swisseph.swe_houses(
      julianDay,
      location.latitude,
      location.longitude,
      houseSystemId
    ) as [number[], number, number];

    const houses: HouseCusp[] = housesResult[0].map((cusp, index) => ({
      house: index + 1,
      sign: this.degreeToSign(cusp),
      degree: Math.floor(cusp % 30),
      minute: Math.floor((cusp % 30 % 1) * 60),
      second: Math.floor(((cusp % 30 % 1) * 60 % 1) * 60),
    }));

    // Assign planets to houses
    planets.forEach(planet => {
      const planetDegree = this.signToDegree(planet.sign, planet.degree);
      planet.house = this.getHouseForPlanet(planetDegree, houses);
    });

    // Calculate aspects
    const aspects = this.calculateAspects(planets);

    // Calculate Ascendant and MC
    const ascendant = {
      sign: this.degreeToSign(housesResult[0][0]),
      degree: Math.floor(housesResult[0][0] % 30),
      minute: Math.floor((housesResult[0][0] % 30 % 1) * 60),
      second: Math.floor(((housesResult[0][0] % 30 % 1) * 60 % 1) * 60),
    };

    const mc = {
      sign: this.degreeToSign(housesResult[0][9]),
      degree: Math.floor(housesResult[0][9] % 30),
      minute: Math.floor((housesResult[0][9] % 30 % 1) * 60),
      second: Math.floor(((housesResult[0][9] % 30 % 1) * 60 % 1) * 60),
    };

    // Calculate moon phase
    const moonPhase = this.calculateMoonPhase(julianDay);

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
   * Calculate aspects between planets
   */
  private calculateAspects(planets: PlanetaryPosition[]): Aspect[] {
    const aspects: Aspect[] = [];
    const aspectTypes = [
      { type: 'conjunction', angle: 0, orb: 10 },
      { type: 'opposition', angle: 180, orb: 8 },
      { type: 'trine', angle: 120, orb: 8 },
      { type: 'square', angle: 90, orb: 8 },
      { type: 'sextile', angle: 60, orb: 6 },
    ];

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];

        // Calculate angular distance
        const pos1 = this.signToDegree(planet1.sign, planet1.degree);
        const pos2 = this.signToDegree(planet2.sign, planet2.degree);
        let distance = Math.abs(pos1 - pos2);

        if (distance > 180) {
          distance = 360 - distance;
        }

        // Check for aspects
        for (const aspectType of aspectTypes) {
          if (Math.abs(distance - aspectType.angle) <= aspectType.orb) {
            aspects.push({
              planet1: planet1.planet,
              planet2: planet2.planet,
              type: aspectType.type,
              orb: Math.abs(distance - aspectType.angle),
              applying: this.isApplying(pos1, pos2, aspectType.angle),
            });
            break;
          }
        }
      }
    }

    return aspects;
  }

  /**
   * Calculate moon phase
   */
  private calculateMoonPhase(julianDay: number): {
    phase: string;
    illumination: number;
  } {
    const sunResult = swisseph.swe_calc_ut(julianDay, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH) as [number, number, number, number];
    const moonResult = swisseph.swe_calc_ut(julianDay, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH) as [number, number, number, number];

    const sunLongitude = sunResult[0];
    const moonLongitude = moonResult[0];

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
   * Helper: Convert date to Julian Day
   */
  private dateToJulianDay(date: Date): number {
    return swisseph.swe_julday(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours() + date.getMinutes() / 60
    );
  }

  /**
   * Helper: Degree to sign
   */
  private degreeToSign(degree: number): string {
    const signs = [
      'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];
    const signIndex = Math.floor(degree / 30) % 12;
    return signs[signIndex];
  }

  /**
   * Helper: Sign and degree to absolute degree
   */
  private signToDegree(sign: string, degree: number): number {
    const signs = [
      'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];
    const signIndex = signs.indexOf(sign);
    return signIndex * 30 + degree;
  }

  /**
   * Helper: Get planet name from Swiss Ephemeris ID
   */
  private getPlanetName(planetId: number): string {
    const names: Record<number, string> = {
      [swisseph.SE_SUN]: 'sun',
      [swisseph.SE_MOON]: 'moon',
      [swisseph.SE_MERCURY]: 'mercury',
      [swisseph.SE_VENUS]: 'venus',
      [swisseph.SE_MARS]: 'mars',
      [swisseph.SE_JUPITER]: 'jupiter',
      [swisseph.SE_SATURN]: 'saturn',
      [swisseph.SE_URANUS]: 'uranus',
      [swisseph.SE_NEPTUNE]: 'neptune',
      [swisseph.SE_PLUTO]: 'pluto',
    };
    return names[planetId] || 'unknown';
  }

  /**
   * Helper: Get house system ID from name
   */
  private getHouseSystemId(system: string): string {
    const systems: Record<string, string> = {
      'placidus': 'P',
      'koch': 'K',
      'porphyry': 'O',
      'equal': 'A',
      'whole': 'W',
      'campanus': 'C',
      'regiomontanus': 'R',
    };
    return systems[system] || 'P';
  }

  /**
   * Helper: Get house for a planet
   */
  private getHouseForPlanet(planetDegree: number, houses: HouseCuspType[]): number {
    for (let i = 0; i < houses.length - 1; i++) {
      const houseStart = this.signToDegree(houses[i].sign, houses[i].degree);
      const houseEnd = this.signToDegree(houses[(i + 1) % 12].sign, houses[(i + 1) % 12].degree);

      if (planetDegree >= houseStart && planetDegree < houseEnd) {
        return i + 1;
      }
    }
    return 12;
  }

  /**
   * Helper: Check if aspect is applying
   */
  private isApplying(pos1: number, pos2: number, aspectAngle: number): boolean {
    const distance = Math.abs(pos1 - pos2);
    return distance < aspectAngle;
  }

  /**
   * Get natal chart (placeholder - would fetch from database)
   */
  private async getNatalChart(_chartId: string): Promise<any> {
    // This would fetch from the database in real implementation
    return {
      sunDegree: 280.5, // Example: Capricorn 10°30'
      birthLocation: {
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      },
    };
  }
}

export default new SolarReturnService();
