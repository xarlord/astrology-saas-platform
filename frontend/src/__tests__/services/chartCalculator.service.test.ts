/**
 * Tests for Chart Calculator Service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ChartCalculator,
  chartCalculator,
  createChartCalculator,
} from '@/services/chartCalculator.service';
import {
  CalculatedChart,
  BirthDataInput,
  HouseSystem,
  DEFAULT_ORBS,
} from '@/utils/astrology/types';

describe('ChartCalculator Service', () => {
  const testBirthData: BirthDataInput = {
    date: new Date('1990-06-15T12:00:00Z'),
    time: '12:00',
    latitude: 40.7128, // New York
    longitude: -74.0060,
    timezone: 'America/New_York',
    houseSystem: 'placidus',
  };

  let calculator: ChartCalculator;

  beforeEach(() => {
    calculator = new ChartCalculator();
  });

  describe('Constructor', () => {
    it('should create calculator with default settings', () => {
      const calc = new ChartCalculator();
      expect(calc).toBeInstanceOf(ChartCalculator);
    });

    it('should create calculator with custom house system', () => {
      const calc = new ChartCalculator('koch');
      expect(calc).toBeInstanceOf(ChartCalculator);
    });

    it('should create calculator with custom orbs', () => {
      const customOrbs = { ...DEFAULT_ORBS, conjunction: 8 };
      const calc = new ChartCalculator('placidus', customOrbs);
      expect(calc).toBeInstanceOf(ChartCalculator);
    });
  });

  describe('calculateNatalChart', () => {
    it('should calculate complete natal chart', () => {
      const chart = calculator.calculateNatalChart(testBirthData);

      expect(chart).toHaveProperty('planets');
      expect(chart).toHaveProperty('houses');
      expect(chart).toHaveProperty('aspects');
      expect(chart).toHaveProperty('angles');
      expect(chart).toHaveProperty('elements');
      expect(chart).toHaveProperty('qualities');
      expect(chart).toHaveProperty('ascendant');
      expect(chart).toHaveProperty('midheaven');
    });

    it('should calculate 10 planets', () => {
      const chart = calculator.calculateNatalChart(testBirthData);
      expect(chart.planets).toHaveLength(10);
    });

    it('should calculate 12 houses', () => {
      const chart = calculator.calculateNatalChart(testBirthData);
      expect(chart.houses).toHaveLength(12);
    });

    it('should calculate 6 angles', () => {
      const chart = calculator.calculateNatalChart(testBirthData);
      expect(chart.angles).toHaveLength(6);
    });

    it('should assign houses to planets', () => {
      const chart = calculator.calculateNatalChart(testBirthData);

      for (const planet of chart.planets) {
        expect(planet.house).toBeDefined();
        expect(planet.house).toBeGreaterThanOrEqual(1);
        expect(planet.house).toBeLessThanOrEqual(12);
      }
    });

    it('should calculate aspects between planets', () => {
      const chart = calculator.calculateNatalChart(testBirthData);
      expect(chart.aspects.length).toBeGreaterThan(0);
    });

    it('should calculate element distribution', () => {
      const chart = calculator.calculateNatalChart(testBirthData);

      expect(chart.elements).toHaveProperty('fire');
      expect(chart.elements).toHaveProperty('earth');
      expect(chart.elements).toHaveProperty('air');
      expect(chart.elements).toHaveProperty('water');

      const total = chart.elements.fire + chart.elements.earth +
        chart.elements.air + chart.elements.water;
      expect(total).toBe(10); // Total planets
    });

    it('should calculate quality distribution', () => {
      const chart = calculator.calculateNatalChart(testBirthData);

      expect(chart.qualities).toHaveProperty('cardinal');
      expect(chart.qualities).toHaveProperty('fixed');
      expect(chart.qualities).toHaveProperty('mutable');

      const total = chart.qualities.cardinal + chart.qualities.fixed +
        chart.qualities.mutable;
      expect(total).toBe(10); // Total planets
    });

    it('should calculate valid ascendant', () => {
      const chart = calculator.calculateNatalChart(testBirthData);

      expect(chart.ascendant).toBeGreaterThanOrEqual(0);
      expect(chart.ascendant).toBeLessThan(360);
    });

    it('should calculate valid midheaven', () => {
      const chart = calculator.calculateNatalChart(testBirthData);

      expect(chart.midheaven).toBeGreaterThanOrEqual(0);
      expect(chart.midheaven).toBeLessThan(360);
    });

    it('should use specified house system', () => {
      const wholeSignCalc = new ChartCalculator('whole');
      // Pass birth data without houseSystem to use the calculator's default
      const chart = wholeSignCalc.calculateNatalChart({
        ...testBirthData,
        houseSystem: undefined,
      });

      // Whole sign houses start at 0 degrees of each sign
      for (const house of chart.houses) {
        expect(house.cusp % 30).toBe(0);
      }
    });
  });

  describe('calculateTransits', () => {
    let natalChart: CalculatedChart;

    beforeEach(() => {
      natalChart = calculator.calculateNatalChart(testBirthData);
    });

    it('should calculate transits for given date', () => {
      const transitDate = new Date('2024-06-15T12:00:00Z');
      const transits = calculator.calculateTransits(
        natalChart,
        transitDate,
        testBirthData.latitude,
        testBirthData.longitude
      );

      expect(transits).toHaveProperty('transitDate');
      expect(transits).toHaveProperty('natalPlanets');
      expect(transits).toHaveProperty('transitPlanets');
      expect(transits).toHaveProperty('aspects');
    });

    it('should have transit planets', () => {
      const transitDate = new Date();
      const transits = calculator.calculateTransits(
        natalChart,
        transitDate,
        testBirthData.latitude,
        testBirthData.longitude
      );

      expect(transits.transitPlanets.length).toBeGreaterThan(0);
    });

    it('should have aspects between transit and natal', () => {
      const transitDate = new Date();
      const transits = calculator.calculateTransits(
        natalChart,
        transitDate,
        testBirthData.latitude,
        testBirthData.longitude
      );

      // May or may not have aspects depending on positions
      expect(Array.isArray(transits.aspects)).toBe(true);
    });
  });

  describe('calculateSynastry', () => {
    let chart1: CalculatedChart;
    let chart2: CalculatedChart;

    beforeEach(() => {
      chart1 = calculator.calculateNatalChart({
        ...testBirthData,
        date: new Date('1990-06-15T12:00:00Z'),
      });

      chart2 = calculator.calculateNatalChart({
        ...testBirthData,
        date: new Date('1992-03-20T08:00:00Z'),
      });
    });

    it('should calculate synastry between two charts', () => {
      const synastry = calculator.calculateSynastry(chart1, chart2);

      expect(synastry).toHaveProperty('chart1');
      expect(synastry).toHaveProperty('chart2');
      expect(synastry).toHaveProperty('aspects');
      expect(synastry).toHaveProperty('compatibility');
    });

    it('should calculate compatibility scores', () => {
      const synastry = calculator.calculateSynastry(chart1, chart2);

      expect(synastry.compatibility).toHaveProperty('overall');
      expect(synastry.compatibility).toHaveProperty('romantic');
      expect(synastry.compatibility).toHaveProperty('communication');
      expect(synastry.compatibility).toHaveProperty('emotional');
      expect(synastry.compatibility).toHaveProperty('intellectual');
      expect(synastry.compatibility).toHaveProperty('values');
    });

    it('should return scores between 0-100', () => {
      const synastry = calculator.calculateSynastry(chart1, chart2);

      expect(synastry.compatibility.overall).toBeGreaterThanOrEqual(0);
      expect(synastry.compatibility.overall).toBeLessThanOrEqual(100);
      expect(synastry.compatibility.romantic).toBeGreaterThanOrEqual(0);
      expect(synastry.compatibility.romantic).toBeLessThanOrEqual(100);
    });

    it('should calculate aspects between charts', () => {
      const synastry = calculator.calculateSynastry(chart1, chart2);

      expect(Array.isArray(synastry.aspects)).toBe(true);
    });
  });

  describe('calculateSolarReturn', () => {
    let natalChart: CalculatedChart;

    beforeEach(() => {
      natalChart = calculator.calculateNatalChart(testBirthData);
    });

    it('should calculate solar return for specific year', () => {
      const year = 2024;
      const solarReturn = calculator.calculateSolarReturn(
        natalChart,
        year,
        testBirthData.latitude,
        testBirthData.longitude
      );

      expect(solarReturn).toHaveProperty('year', year);
      expect(solarReturn).toHaveProperty('returnDate');
      expect(solarReturn).toHaveProperty('chart');
      expect(solarReturn).toHaveProperty('themes');
    });

    it('should return returnDate as Date object', () => {
      const solarReturn = calculator.calculateSolarReturn(
        natalChart,
        2024,
        testBirthData.latitude,
        testBirthData.longitude
      );

      expect(solarReturn.returnDate).toBeInstanceOf(Date);
    });

    it('should return themes as array', () => {
      const solarReturn = calculator.calculateSolarReturn(
        natalChart,
        2024,
        testBirthData.latitude,
        testBirthData.longitude
      );

      expect(Array.isArray(solarReturn.themes)).toBe(true);
    });

    it('should have complete chart in solar return', () => {
      const solarReturn = calculator.calculateSolarReturn(
        natalChart,
        2024,
        testBirthData.latitude,
        testBirthData.longitude
      );

      expect(solarReturn.chart).toHaveProperty('planets');
      expect(solarReturn.chart).toHaveProperty('houses');
      expect(solarReturn.chart).toHaveProperty('aspects');
    });
  });

  describe('calculateLunarReturn', () => {
    let natalChart: CalculatedChart;

    beforeEach(() => {
      natalChart = calculator.calculateNatalChart(testBirthData);
    });

    it('should calculate lunar return for target date', () => {
      const targetDate = new Date('2024-06-01T12:00:00Z');
      const lunarReturn = calculator.calculateLunarReturn(
        natalChart,
        targetDate,
        testBirthData.latitude,
        testBirthData.longitude
      );

      expect(lunarReturn).toHaveProperty('returnDate');
      expect(lunarReturn).toHaveProperty('chart');
      expect(lunarReturn).toHaveProperty('theme');
      expect(lunarReturn).toHaveProperty('keyAreas');
    });

    it('should return theme as string', () => {
      const targetDate = new Date();
      const lunarReturn = calculator.calculateLunarReturn(
        natalChart,
        targetDate,
        testBirthData.latitude,
        testBirthData.longitude
      );

      expect(typeof lunarReturn.theme).toBe('string');
      expect(lunarReturn.theme.length).toBeGreaterThan(0);
    });

    it('should return keyAreas as array', () => {
      const targetDate = new Date();
      const lunarReturn = calculator.calculateLunarReturn(
        natalChart,
        targetDate,
        testBirthData.latitude,
        testBirthData.longitude
      );

      expect(Array.isArray(lunarReturn.keyAreas)).toBe(true);
    });
  });

  describe('calculateProgressedChart', () => {
    let natalChart: CalculatedChart;

    beforeEach(() => {
      natalChart = calculator.calculateNatalChart(testBirthData);
    });

    it('should calculate progressed chart', () => {
      const targetDate = new Date('2024-06-15T12:00:00Z');
      const progressed = calculator.calculateProgressedChart(
        natalChart,
        targetDate,
        testBirthData.date
      );

      expect(progressed).toHaveProperty('planets');
      expect(progressed).toHaveProperty('houses');
      expect(progressed).toHaveProperty('aspects');
      expect(progressed).toHaveProperty('angles');
    });

    it('should have progressed positions', () => {
      const targetDate = new Date('2024-06-15T12:00:00Z');
      const progressed = calculator.calculateProgressedChart(
        natalChart,
        targetDate,
        testBirthData.date
      );

      expect(progressed.planets.length).toBe(10);
    });
  });

  describe('calculateCompositeChart', () => {
    let chart1: CalculatedChart;
    let chart2: CalculatedChart;

    beforeEach(() => {
      chart1 = calculator.calculateNatalChart({
        ...testBirthData,
        date: new Date('1990-06-15T12:00:00Z'),
      });

      chart2 = calculator.calculateNatalChart({
        ...testBirthData,
        date: new Date('1992-03-20T08:00:00Z'),
      });
    });

    it('should calculate composite chart', () => {
      const composite = calculator.calculateCompositeChart(chart1, chart2);

      expect(composite).toHaveProperty('planets');
      expect(composite).toHaveProperty('houses');
      expect(composite).toHaveProperty('aspects');
      expect(composite).toHaveProperty('angles');
      expect(composite).toHaveProperty('ascendant');
      expect(composite).toHaveProperty('midheaven');
    });

    it('should have midpoint positions', () => {
      const composite = calculator.calculateCompositeChart(chart1, chart2);

      // Composite positions should be midpoints
      for (const planet of composite.planets) {
        expect(planet.longitude).toBeGreaterThanOrEqual(0);
        expect(planet.longitude).toBeLessThan(360);
      }
    });

    it('should have 10 planets', () => {
      const composite = calculator.calculateCompositeChart(chart1, chart2);
      expect(composite.planets).toHaveLength(10);
    });
  });

  describe('detectPatterns', () => {
    it('should detect aspect patterns in chart', () => {
      const chart = calculator.calculateNatalChart(testBirthData);
      const patterns = calculator.detectPatterns(chart);

      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should return pattern objects with descriptions', () => {
      const chart = calculator.calculateNatalChart(testBirthData);
      const patterns = calculator.detectPatterns(chart);

      for (const pattern of patterns) {
        expect(pattern).toHaveProperty('type');
        expect(pattern).toHaveProperty('planets');
        expect(pattern).toHaveProperty('description');
      }
    });
  });

  describe('Singleton Instance', () => {
    it('should export singleton instance', () => {
      expect(chartCalculator).toBeInstanceOf(ChartCalculator);
    });

    it('should use same instance', () => {
      const chart1 = chartCalculator.calculateNatalChart(testBirthData);
      const chart2 = chartCalculator.calculateNatalChart(testBirthData);

      // Same inputs should give same results
      expect(chart1.planets[0].longitude).toBe(chart2.planets[0].longitude);
    });
  });

  describe('Factory Function', () => {
    it('should create calculator with factory function', () => {
      const calc = createChartCalculator();
      expect(calc).toBeInstanceOf(ChartCalculator);
    });

    it('should create calculator with custom settings', () => {
      const calc = createChartCalculator('koch', { ...DEFAULT_ORBS, conjunction: 5 });
      expect(calc).toBeInstanceOf(ChartCalculator);
    });
  });

  describe('Edge Cases', () => {
    it('should handle birth at midnight', () => {
      const chart = calculator.calculateNatalChart({
        ...testBirthData,
        time: '00:00',
      });

      expect(chart).toBeDefined();
      expect(chart.planets).toHaveLength(10);
    });

    it('should handle birth at extreme latitude', () => {
      const chart = calculator.calculateNatalChart({
        ...testBirthData,
        latitude: 70,
      });

      expect(chart).toBeDefined();
      expect(chart.houses).toHaveLength(12);
    });

    it('should handle birth at equator', () => {
      const chart = calculator.calculateNatalChart({
        ...testBirthData,
        latitude: 0,
      });

      expect(chart).toBeDefined();
      expect(chart.houses).toHaveLength(12);
    });

    it('should handle all house systems', () => {
      const systems: HouseSystem[] = ['placidus', 'koch', 'whole', 'equal', 'porphyry'];

      for (const system of systems) {
        const calc = new ChartCalculator(system);
        const chart = calc.calculateNatalChart(testBirthData);
        expect(chart.houses).toHaveLength(12);
      }
    });

    it('should handle very old dates', () => {
      const chart = calculator.calculateNatalChart({
        ...testBirthData,
        date: new Date('1900-01-01T12:00:00Z'),
      });

      expect(chart).toBeDefined();
      expect(chart.planets).toHaveLength(10);
    });

    it('should handle future dates', () => {
      const chart = calculator.calculateNatalChart({
        ...testBirthData,
        date: new Date('2050-01-01T12:00:00Z'),
      });

      expect(chart).toBeDefined();
      expect(chart.planets).toHaveLength(10);
    });
  });

  describe('Performance', () => {
    it('should calculate natal chart quickly', () => {
      const start = performance.now();
      calculator.calculateNatalChart(testBirthData);
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should calculate synastry quickly', () => {
      const chart1 = calculator.calculateNatalChart(testBirthData);
      const chart2 = calculator.calculateNatalChart({
        ...testBirthData,
        date: new Date('1992-01-01'),
      });

      const start = performance.now();
      calculator.calculateSynastry(chart1, chart2);
      const end = performance.now();

      expect(end - start).toBeLessThan(50); // Should complete in under 50ms
    });
  });
});
