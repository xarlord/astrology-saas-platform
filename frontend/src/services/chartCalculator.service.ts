/**
 * Chart Calculator Service
 * Comprehensive chart calculation methods for the AstroVerse platform
 */

import {
  // Types
  CalculatedChart,
  PlanetData,
  HouseData,
  AspectData,
  AngleData,
  BirthDataInput,
  TransitData,
  SynastryData,
  SolarReturnData,
  LunarReturnData,
  CompatibilityScore,
  AspectPattern,
  HouseSystem,
  Element,
  Quality,
  ZodiacSign,
  ZODIAC_ELEMENTS,
  ZODIAC_QUALITIES,
  ZODIAC_SIGNS,
  DEFAULT_ORBS,
  OrbConfig,
} from '../utils/astrology/types';

// Planet Position utilities
import {
  calculateAllPlanetPositions,
  assignPlanetsToHouses,
  normalizeAngle,
  dateToJulianDay,
} from '../utils/astrology/planetPosition';

// Aspect utilities
import {
  calculateNatalAspects,
  calculateAspects,
  detectAspectPatterns,
} from '../utils/astrology/aspects';

// House utilities
import {
  calculateLST,
  calculateHouses,
  calculateAscendant as calcAsc,
  calculateMC as calcMC,
} from '../utils/astrology/houses';

// Angle utilities
import { calculateAngles } from '../utils/astrology/angles';

/**
 * Chart Calculator Service
 * Provides comprehensive chart calculation capabilities
 */
export class ChartCalculator {
  private orbs: OrbConfig;
  private houseSystem: HouseSystem;

  constructor(houseSystem: HouseSystem = 'placidus', orbs: OrbConfig = DEFAULT_ORBS) {
    this.houseSystem = houseSystem;
    this.orbs = orbs;
  }

  /**
   * Calculate a complete natal chart
   */
  calculateNatalChart(input: BirthDataInput): CalculatedChart {
    // Calculate planet positions
    const planets = calculateAllPlanetPositions(
      input.date,
      input.time,
      input.latitude,
      input.longitude,
    );

    // Calculate Julian Day
    const [hours, minutes] = input.time.split(':').map(Number);
    const dateTime = new Date(input.date);
    dateTime.setUTCHours(hours, minutes, 0, 0);
    const jd = dateToJulianDay(dateTime);

    // Calculate Local Sidereal Time
    const lst = calculateLST(jd, input.longitude);

    // Calculate houses
    const houses = calculateHouses(lst, input.latitude, input.houseSystem ?? this.houseSystem);

    // Assign planets to houses
    const planetsWithHouses = assignPlanetsToHouses(planets, houses);

    // Calculate aspects
    const aspects = calculateNatalAspects(planetsWithHouses, this.orbs, false);

    // Calculate angles
    const angles = calculateAngles(input.date, input.time, input.latitude, input.longitude);

    // Get ascendant and midheaven
    const ascendant = calcAsc(lst, input.latitude);
    const midheaven = calcMC(lst);

    // Calculate element and quality distribution
    const elements = this.calculateElementDistribution(planetsWithHouses);
    const qualities = this.calculateQualityDistribution(planetsWithHouses);

    return {
      planets: planetsWithHouses,
      houses,
      aspects,
      angles,
      elements,
      qualities,
      ascendant,
      midheaven,
    };
  }

  /**
   * Calculate transit chart (transits to natal)
   */
  calculateTransits(
    natalChart: CalculatedChart,
    transitDate: Date,
    latitude: number,
    longitude: number,
  ): TransitData {
    // Calculate transit planet positions
    const transitTime = '12:00'; // Use noon for transit calculations
    const transitPlanets = calculateAllPlanetPositions(
      transitDate,
      transitTime,
      latitude,
      longitude,
    );

    // Calculate aspects between transit planets and natal planets
    const aspects = calculateAspects(transitPlanets, natalChart.planets, this.orbs, false);

    return {
      transitDate,
      natalPlanets: natalChart.planets,
      transitPlanets,
      aspects,
    };
  }

  /**
   * Calculate synastry between two charts
   */
  calculateSynastry(chart1: CalculatedChart, chart2: CalculatedChart): SynastryData {
    // Calculate aspects between charts
    const aspects = calculateAspects(chart1.planets, chart2.planets, this.orbs, false);

    // Calculate compatibility scores
    const compatibility = this.calculateCompatibility(chart1, chart2, aspects);

    return {
      chart1,
      chart2,
      aspects,
      compatibility,
    };
  }

  /**
   * Calculate solar return chart for a specific year
   */
  calculateSolarReturn(
    natalChart: CalculatedChart,
    year: number,
    latitude: number,
    longitude: number,
  ): SolarReturnData {
    // Find the solar return date (when Sun returns to natal position)
    const returnDate = this.findSolarReturnDate(natalChart, year, longitude);

    // Calculate the solar return chart
    const chart = this.calculateNatalChart({
      date: returnDate,
      time: '12:00',
      latitude,
      longitude,
      timezone: 'UTC',
      houseSystem: this.houseSystem,
    });

    // Determine themes based on house placements
    const themes = this.determineSolarReturnThemes(chart);

    return {
      year,
      returnDate,
      chart,
      themes,
    };
  }

  /**
   * Calculate lunar return chart
   */
  calculateLunarReturn(
    natalChart: CalculatedChart,
    targetDate: Date,
    latitude: number,
    longitude: number,
  ): LunarReturnData {
    // Find the lunar return date (when Moon returns to natal position)
    const returnDate = this.findLunarReturnDate(natalChart, targetDate, longitude);

    // Calculate the lunar return chart
    const chart = this.calculateNatalChart({
      date: returnDate,
      time: '12:00',
      latitude,
      longitude,
      timezone: 'UTC',
      houseSystem: this.houseSystem,
    });

    // Determine theme and key areas
    const theme = this.determineLunarReturnTheme(chart);
    const keyAreas = this.determineLunarReturnKeyAreas(chart);

    return {
      returnDate,
      chart,
      theme,
      keyAreas,
    };
  }

  /**
   * Calculate progressed chart
   */
  calculateProgressedChart(
    natalChart: CalculatedChart,
    targetDate: Date,
    birthDate: Date,
  ): CalculatedChart {
    // Calculate progression date (day-for-a-year)
    const daysToProgress = this.calculateYearsDifference(birthDate, targetDate);
    const progressedDate = new Date(birthDate);
    progressedDate.setDate(progressedDate.getDate() + daysToProgress);

    // Use natal location for progressed chart
    // In a real implementation, we would get this from natalChart
    const latitude = 40.7128; // Default to NYC
    const longitude = -74.006;

    // Calculate progressed chart
    const progressedChart = this.calculateNatalChart({
      date: progressedDate,
      time: '12:00',
      latitude,
      longitude,
      timezone: 'UTC',
      houseSystem: this.houseSystem,
    });

    return progressedChart;
  }

  /**
   * Calculate composite chart (for relationships)
   */
  calculateCompositeChart(chart1: CalculatedChart, chart2: CalculatedChart): CalculatedChart {
    // Calculate midpoint positions for all planets
    const compositePlanets: PlanetData[] = chart1.planets.map((p1, index) => {
      const p2 = chart2.planets[index];
      const midLongitude = this.calculateMidpoint(p1.longitude, p2.longitude);

      return {
        name: p1.name,
        longitude: midLongitude,
        latitude: (p1.latitude + p2.latitude) / 2,
        speed: (p1.speed + p2.speed) / 2,
        retrograde: p1.retrograde || p2.retrograde,
        sign: this.getZodiacSignFromLongitude(midLongitude),
        degree: midLongitude % 30,
        house: undefined,
      };
    });

    // Calculate composite houses
    const ascendantMid = this.calculateMidpoint(chart1.ascendant, chart2.ascendant);
    const mcMid = this.calculateMidpoint(chart1.midheaven, chart2.midheaven);

    // Generate composite houses based on midpoint ascendant
    const compositeHouses: HouseData[] = [];
    for (let i = 0; i < 12; i++) {
      const cusp = normalizeAngle(ascendantMid + i * 30);
      compositeHouses.push({
        number: i + 1,
        cusp,
        sign: this.getZodiacSignFromLongitude(cusp),
        degree: cusp % 30,
      });
    }

    // Assign planets to houses
    const planetsWithHouses = assignPlanetsToHouses(compositePlanets, compositeHouses);

    // Calculate aspects
    const aspects = calculateNatalAspects(planetsWithHouses, this.orbs, false);

    // Calculate angles
    const angles: AngleData[] = [
      {
        name: 'Ascendant',
        longitude: ascendantMid,
        latitude: 0,
        sign: this.getZodiacSignFromLongitude(ascendantMid),
        degree: ascendantMid % 30,
        house: 1,
      },
      {
        name: 'MC',
        longitude: mcMid,
        latitude: 0,
        sign: this.getZodiacSignFromLongitude(mcMid),
        degree: mcMid % 30,
        house: 10,
      },
    ];

    return {
      planets: planetsWithHouses,
      houses: compositeHouses,
      aspects,
      angles,
      elements: this.calculateElementDistribution(planetsWithHouses),
      qualities: this.calculateQualityDistribution(planetsWithHouses),
      ascendant: ascendantMid,
      midheaven: mcMid,
    };
  }

  /**
   * Detect aspect patterns in a chart
   */
  detectPatterns(chart: CalculatedChart): AspectPattern[] {
    return detectAspectPatterns(chart.planets, chart.aspects, 8);
  }

  // ===========================================
  // PRIVATE HELPER METHODS
  // ===========================================

  /**
   * Calculate element distribution
   */
  private calculateElementDistribution(planets: PlanetData[]): Record<Element, number> {
    const elements: Record<Element, number> = {
      fire: 0,
      earth: 0,
      air: 0,
      water: 0,
    };

    for (const planet of planets) {
      const element = this.getElementFromSign(planet.sign);
      if (element) {
        elements[element]++;
      }
    }

    return elements;
  }

  /**
   * Calculate quality distribution
   */
  private calculateQualityDistribution(planets: PlanetData[]): Record<Quality, number> {
    const qualities: Record<Quality, number> = {
      cardinal: 0,
      fixed: 0,
      mutable: 0,
    };

    for (const planet of planets) {
      const quality = this.getQualityFromSign(planet.sign);
      if (quality) {
        qualities[quality]++;
      }
    }

    return qualities;
  }

  /**
   * Get element from sign
   */
  private getElementFromSign(sign: ZodiacSign): Element | null {
    for (const [element, signs] of Object.entries(ZODIAC_ELEMENTS) as [
      Element,
      readonly ZodiacSign[],
    ][]) {
      if ((signs as readonly string[]).includes(sign)) {
        return element;
      }
    }
    return null;
  }

  /**
   * Get quality from sign
   */
  private getQualityFromSign(sign: ZodiacSign): Quality | null {
    for (const [quality, signs] of Object.entries(ZODIAC_QUALITIES) as [
      Quality,
      readonly ZodiacSign[],
    ][]) {
      if ((signs as readonly string[]).includes(sign)) {
        return quality;
      }
    }
    return null;
  }

  /**
   * Get zodiac sign from longitude
   */
  private getZodiacSignFromLongitude(longitude: number): ZodiacSign {
    const index = Math.floor(normalizeAngle(longitude) / 30) % 12;
    return ZODIAC_SIGNS[index];
  }

  /**
   * Calculate midpoint between two longitudes
   */
  private calculateMidpoint(long1: number, long2: number): number {
    let mid = (long1 + long2) / 2;
    // Handle antiscia (shortest arc)
    if (Math.abs(long1 - long2) > 180) {
      mid = normalizeAngle(mid + 180);
    }
    return normalizeAngle(mid);
  }

  /**
   * Calculate years between two dates
   */
  private calculateYearsDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(diffYears);
  }

  /**
   * Find solar return date
   */
  private findSolarReturnDate(natalChart: CalculatedChart, year: number, _longitude: number): Date {
    // Find the natal Sun position
    const natalSun = natalChart.planets.find((p) => p.name === 'Sun');
    if (!natalSun) {
      return new Date(year, 5, 21); // Default to June 21
    }

    // Approximate solar return date
    // The Sun moves about 1 degree per day
    const natalDegree = natalSun.longitude;
    const baseDate = new Date(year, 2, 20); // Spring equinox approx
    const daysToAdd = natalDegree; // 1 degree = 1 day approximately

    return new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  }

  /**
   * Find lunar return date
   */
  private findLunarReturnDate(
    natalChart: CalculatedChart,
    targetDate: Date,
    _longitude: number,
  ): Date {
    // Find the natal Moon position
    const natalMoon = natalChart.planets.find((p) => p.name === 'Moon');
    if (!natalMoon) {
      return targetDate;
    }

    // Moon returns to same position every ~27.3 days
    const _natalDegree = natalMoon.longitude;

    // Approximate lunar return
    const lunarCycle = 27.3 * 24 * 60 * 60 * 1000; // milliseconds
    const moonPhase = (targetDate.getTime() / lunarCycle) % 1;
    const daysToReturn = (1 - moonPhase) * 27.3;

    return new Date(targetDate.getTime() + daysToReturn * 24 * 60 * 60 * 1000);
  }

  /**
   * Calculate compatibility score between two charts
   */
  private calculateCompatibility(
    chart1: CalculatedChart,
    chart2: CalculatedChart,
    aspects: AspectData[],
  ): CompatibilityScore {
    let totalScore = 50; // Base score

    // Analyze aspects
    for (const aspect of aspects) {
      const aspectScore = this.getAspectScore(aspect);
      totalScore += aspectScore;
    }

    // Element compatibility
    const elementScore = this.calculateElementCompatibility(chart1.elements, chart2.elements);
    totalScore += elementScore;

    // Normalize to 0-100
    totalScore = Math.max(0, Math.min(100, totalScore));

    return {
      overall: Math.round(totalScore),
      romantic: this.calculateRomanticScore(aspects),
      communication: this.calculateCommunicationScore(aspects),
      emotional: this.calculateEmotionalScore(aspects),
      intellectual: this.calculateIntellectualScore(aspects),
      values: this.calculateValuesScore(chart1, chart2),
    };
  }

  /**
   * Get score for an aspect
   */
  private getAspectScore(aspect: AspectData): number {
    const scores: Record<string, number> = {
      conjunction: aspect.orb < 3 ? 8 : 5,
      opposition: aspect.orb < 3 ? -3 : -1,
      trine: aspect.orb < 3 ? 10 : 7,
      square: aspect.orb < 3 ? -5 : -3,
      sextile: aspect.orb < 3 ? 6 : 4,
      quincunx: -2,
    };

    return scores[aspect.type] || 0;
  }

  /**
   * Calculate element compatibility
   */
  private calculateElementCompatibility(
    elements1: Record<Element, number>,
    elements2: Record<Element, number>,
  ): number {
    // Compatible elements: fire-air, earth-water
    const fireAir = (elements1.fire + elements1.air) * (elements2.fire + elements2.air);
    const earthWater = (elements1.earth + elements1.water) * (elements2.earth + elements2.water);

    return Math.min(10, (fireAir + earthWater) / 10);
  }

  /**
   * Calculate romantic compatibility score
   */
  private calculateRomanticScore(aspects: AspectData[]): number {
    let score = 50;

    for (const aspect of aspects) {
      const isRomanticPlanet = (p: string) => ['Venus', 'Mars', 'Moon', 'Sun'].includes(p);

      if (isRomanticPlanet(aspect.planet1) || isRomanticPlanet(aspect.planet2)) {
        if (aspect.type === 'trine' || aspect.type === 'sextile') {
          score += 5;
        } else if (aspect.type === 'square' || aspect.type === 'opposition') {
          score -= 3;
        }
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate communication compatibility score
   */
  private calculateCommunicationScore(aspects: AspectData[]): number {
    let score = 50;

    for (const aspect of aspects) {
      const isCommPlanet = (p: string) => ['Mercury', 'Jupiter', 'Gemini'].includes(p);

      if (isCommPlanet(aspect.planet1) || isCommPlanet(aspect.planet2)) {
        if (aspect.type === 'trine' || aspect.type === 'sextile') {
          score += 5;
        } else if (aspect.type === 'square' || aspect.type === 'opposition') {
          score -= 3;
        }
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate emotional compatibility score
   */
  private calculateEmotionalScore(aspects: AspectData[]): number {
    let score = 50;

    for (const aspect of aspects) {
      const isEmotionalPlanet = (p: string) => ['Moon', 'Venus', 'Neptune', 'Cancer'].includes(p);

      if (isEmotionalPlanet(aspect.planet1) || isEmotionalPlanet(aspect.planet2)) {
        if (aspect.type === 'trine' || aspect.type === 'sextile') {
          score += 5;
        } else if (aspect.type === 'square' || aspect.type === 'opposition') {
          score -= 3;
        }
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate intellectual compatibility score
   */
  private calculateIntellectualScore(aspects: AspectData[]): number {
    let score = 50;

    for (const aspect of aspects) {
      const isIntelPlanet = (p: string) => ['Mercury', 'Uranus', 'Aquarius'].includes(p);

      if (isIntelPlanet(aspect.planet1) || isIntelPlanet(aspect.planet2)) {
        if (aspect.type === 'trine' || aspect.type === 'sextile') {
          score += 5;
        } else if (aspect.type === 'square' || aspect.type === 'opposition') {
          score -= 3;
        }
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate values compatibility score
   */
  private calculateValuesScore(chart1: CalculatedChart, chart2: CalculatedChart): number {
    // Compare element distributions
    const elements1 = chart1.elements;
    const elements2 = chart2.elements;

    let similarity = 0;
    let total = 0;

    for (const element of ['fire', 'earth', 'air', 'water'] as Element[]) {
      const diff = Math.abs(elements1[element] - elements2[element]);
      similarity += 10 - diff * 2;
      total += 10;
    }

    return Math.round((similarity / total) * 100);
  }

  /**
   * Determine solar return themes
   */
  private determineSolarReturnThemes(chart: CalculatedChart): string[] {
    const themes: string[] = [];

    // Check house emphasis
    const houseCounts: Record<number, number> = {};
    for (const planet of chart.planets) {
      if (planet.house) {
        houseCounts[planet.house] = (houseCounts[planet.house] || 0) + 1;
      }
    }

    // Find emphasized houses
    for (const [house, count] of Object.entries(houseCounts)) {
      if (count >= 2) {
        themes.push(this.getHouseTheme(parseInt(house)));
      }
    }

    // Check element emphasis
    const elements = chart.elements;
    if (elements.fire >= 3) themes.push('Self-expression and initiative');
    if (elements.earth >= 3) themes.push('Material security and practicality');
    if (elements.air >= 3) themes.push('Communication and relationships');
    if (elements.water >= 3) themes.push('Emotional depth and intuition');

    return themes.slice(0, 3);
  }

  /**
   * Get theme for a house
   */
  private getHouseTheme(house: number): string {
    const themes: Record<number, string> = {
      1: 'Personal identity and new beginnings',
      2: 'Financial matters and self-worth',
      3: 'Communication and learning',
      4: 'Home, family, and emotional foundations',
      5: 'Creativity, romance, and self-expression',
      6: 'Work, health, and daily routines',
      7: 'Partnerships and relationships',
      8: 'Transformation and shared resources',
      9: 'Expansion, travel, and philosophy',
      10: 'Career and public reputation',
      11: 'Social networks and aspirations',
      12: 'Spirituality and inner work',
    };
    return themes[house] || '';
  }

  /**
   * Determine lunar return theme
   */
  private determineLunarReturnTheme(chart: CalculatedChart): string {
    const moon = chart.planets.find((p) => p.name === 'Moon');
    if (!moon) return 'Emotional renewal';

    const signThemes: Record<string, string> = {
      Aries: 'Emotional courage and new beginnings',
      Taurus: 'Emotional security and comfort',
      Gemini: 'Emotional communication and curiosity',
      Cancer: 'Emotional nurturing and home focus',
      Leo: 'Emotional expression and creativity',
      Virgo: 'Emotional analysis and service',
      Libra: 'Emotional balance and relationships',
      Scorpio: 'Emotional transformation and depth',
      Sagittarius: 'Emotional expansion and adventure',
      Capricorn: 'Emotional responsibility and structure',
      Aquarius: 'Emotional freedom and innovation',
      Pisces: 'Emotional sensitivity and compassion',
    };

    return signThemes[moon.sign] || 'Emotional renewal';
  }

  /**
   * Determine lunar return key areas
   */
  private determineLunarReturnKeyAreas(chart: CalculatedChart): string[] {
    const areas: string[] = [];

    // Check Moon's house
    const moon = chart.planets.find((p) => p.name === 'Moon');
    if (moon?.house) {
      const houseAreas: Record<number, string[]> = {
        1: ['Self-image', 'Personal goals', 'Physical appearance'],
        2: ['Finances', 'Values', 'Possessions'],
        3: ['Communication', 'Siblings', 'Learning'],
        4: ['Home', 'Family', 'Inner self'],
        5: ['Creativity', 'Romance', 'Children'],
        6: ['Health', 'Work', 'Daily routine'],
        7: ['Relationships', 'Partnerships', 'Open enemies'],
        8: ['Transformation', 'Shared resources', 'Intimacy'],
        9: ['Travel', 'Philosophy', 'Higher learning'],
        10: ['Career', 'Public image', 'Authority'],
        11: ['Friends', 'Groups', 'Hopes and dreams'],
        12: ['Spirituality', 'Hidden matters', 'Subconscious'],
      };
      areas.push(...(houseAreas[moon.house] || []));
    }

    return areas.slice(0, 3);
  }
}

// Export singleton instance
export const chartCalculator = new ChartCalculator();

// Export factory function for custom configurations
export function createChartCalculator(
  houseSystem: HouseSystem = 'placidus',
  orbs: OrbConfig = DEFAULT_ORBS,
): ChartCalculator {
  return new ChartCalculator(houseSystem, orbs);
}

export default chartCalculator;
