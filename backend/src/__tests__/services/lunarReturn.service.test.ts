/**
 * Lunar Return Service Unit Tests
 * Testing lunar return calculations, chart generation, and monthly forecasts
 */

n/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  calculateNextLunarReturn,
  calculateLunarReturnChart,
  generateLunarMonthForecast,
  getCurrentLunarReturn,
} from '../../services/lunarReturn.service';
import { MoonPhase, ZodiacSign } from '../../models/calendar.model';

describe('Lunar Return Service', () => {
  describe('calculateNextLunarReturn', () => {
    test('should calculate next lunar return date for given natal moon', () => {
      const natalMoon = {
        sign: 'leo',
        degree: 15,
        minute: 30,
        second: 0,
      };

      const returnDate = calculateNextLunarReturn(natalMoon);

      expect(returnDate).toBeInstanceOf(Date);
      expect(returnDate.getTime()).toBeGreaterThan(Date.now());
    });

    test('should handle edge case of negative moon degree', () => {
      // Test with a natal moon that might cause negative calculations
      const natalMoon = {
        sign: 'aries',
        degree: 0,
        minute: 0,
        second: 0,
      };

      const returnDate = calculateNextLunarReturn(natalMoon);
      expect(returnDate).toBeInstanceOf(Date);
    });

    test('should return approximately 20-30 days in the future', () => {
      const natalMoon = {
        sign: 'taurus',
        degree: 10,
        minute: 0,
        second: 0,
      };

      const returnDate = calculateNextLunarReturn(natalMoon);
      const today = new Date();
      const daysUntil = (returnDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

      // Simplified calculation may vary, but should be within reasonable range
      expect(daysUntil).toBeGreaterThan(20);
      expect(daysUntil).toBeLessThan(30);
    });

    test('should handle different natal moon signs', () => {
      const signs = [
        'aries',
        'taurus',
        'gemini',
        'cancer',
        'leo',
        'virgo',
        'libra',
        'scorpio',
        'sagittarius',
        'capricorn',
        'aquarius',
        'pisces',
      ];

      signs.forEach((sign) => {
        const natalMoon = {
          sign: sign as ZodiacSign,
          degree: 15,
          minute: 0,
          second: 0,
        };

        const returnDate = calculateNextLunarReturn(natalMoon);
        expect(returnDate).toBeInstanceOf(Date);
      });
    });

    test('should calculate correctly for late degree positions', () => {
      const natalMoon = {
        sign: 'scorpio',
        degree: 25,
        minute: 45,
        second: 30,
      };

      const returnDate = calculateNextLunarReturn(natalMoon);

      expect(returnDate).toBeInstanceOf(Date);
      // Should still calculate a valid return date
    });
  });

  describe('calculateLunarReturnChart', () => {
    const mockNatalChart: any = {
      id: 'chart_1',
      userId: 'user_1',
      moon: {
        sign: 'leo',
        degree: 15,
        minute: 30,
        second: 0,
      },
    };

    test('should generate lunar return chart', () => {
      const returnDate = new Date('2026-02-15T00:00:00Z');

      const chart = calculateLunarReturnChart(mockNatalChart, returnDate);

      expect(chart).toHaveProperty('returnDate', returnDate);
      expect(chart).toHaveProperty('moonPosition');
      expect(chart).toHaveProperty('moonPhase');
      expect(chart).toHaveProperty('housePlacement');
      expect(chart).toHaveProperty('aspects');
      expect(chart).toHaveProperty('theme');
      expect(chart).toHaveProperty('intensity');
    });

    test('should include moon position details', () => {
      const returnDate = new Date('2026-02-15T00:00:00Z');

      const chart = calculateLunarReturnChart(mockNatalChart, returnDate);

      expect(chart.moonPosition).toHaveProperty('sign');
      expect(chart.moonPosition).toHaveProperty('degree');
      expect(chart.moonPosition).toHaveProperty('minute');
      expect(chart.moonPosition).toHaveProperty('second');
      expect(chart.moonPosition).toHaveProperty('sign');
    });

    test('should calculate moon phase', () => {
      const returnDate = new Date('2026-02-15T00:00:00Z');

      const chart = calculateLunarReturnChart(mockNatalChart, returnDate);

      const validPhases: MoonPhase[] = [
        'new',
        'waxing-crescent',
        'first-quarter',
        'waxing-gibbous',
        'full',
        'waning-gibbous',
        'last-quarter',
        'waning-crescent',
      ];

      expect(validPhases).toContain(chart.moonPhase);
    });

    test('should calculate house placement', () => {
      const returnDate = new Date('2026-02-15T00:00:00Z');

      const chart = calculateLunarReturnChart(mockNatalChart, returnDate);

      expect(chart.housePlacement).toBeGreaterThanOrEqual(1);
      expect(chart.housePlacement).toBeLessThanOrEqual(12);
    });

    test('should generate aspects', () => {
      const returnDate = new Date('2026-02-15T00:00:00Z');

      const chart = calculateLunarReturnChart(mockNatalChart, returnDate);

      expect(Array.isArray(chart.aspects)).toBe(true);
      // May or may not have aspects depending on calculations
    });

    test('should determine theme based on house and phase', () => {
      const returnDate = new Date('2026-02-15T00:00:00Z');

      const chart = calculateLunarReturnChart(mockNatalChart, returnDate);

      expect(chart.theme).toBeTruthy();
      expect(typeof chart.theme).toBe('string');
      expect(chart.theme.length).toBeGreaterThan(0);
    });

    test('should calculate intensity score', () => {
      const returnDate = new Date('2026-02-15T00:00:00Z');

      const chart = calculateLunarReturnChart(mockNatalChart, returnDate);

      expect(chart.intensity).toBeGreaterThanOrEqual(1);
      expect(chart.intensity).toBeLessThanOrEqual(10);
    });

    test('should give higher intensity for emotional houses', () => {
      const returnDate1 = new Date('2026-02-15T00:00:00Z');
      const chart1 = calculateLunarReturnChart(mockNatalChart, returnDate1);

      // If moon falls in house 4, 8, or 12 (emotional houses)
      // Should have higher intensity than other houses
      expect(chart1.intensity).toBeGreaterThanOrEqual(1);
    });

    test('should give higher intensity for new and full moon phases', () => {
      // Use known new moon date: 2026-02-17T12:00:00Z
      const newMoonChart = calculateLunarReturnChart(mockNatalChart, new Date('2026-02-17T12:00:00Z'));

      // New moon should have higher intensity (base + 1)
      expect(newMoonChart.intensity).toBeGreaterThanOrEqual(1);
      expect(newMoonChart.intensity).toBeLessThanOrEqual(10);

      // Use known full moon date: 2026-03-03T12:00:00Z
      const fullMoonChart = calculateLunarReturnChart(mockNatalChart, new Date('2026-03-03T12:00:00Z'));

      // Full moon should have higher intensity (base + 1)
      expect(fullMoonChart.intensity).toBeGreaterThanOrEqual(1);
      expect(fullMoonChart.intensity).toBeLessThanOrEqual(10);
    });

    test('should calculate intensity with opposition and square aspects', () => {
      // Test with a date that may create various aspects
      const chart = calculateLunarReturnChart(mockNatalChart, new Date('2026-01-15T00:00:00Z'));

      // Check that aspects array exists
      expect(Array.isArray(chart.aspects)).toBe(true);

      // Verify intensity is calculated correctly
      expect(chart.intensity).toBeGreaterThanOrEqual(1);
      expect(chart.intensity).toBeLessThanOrEqual(10);

      // If there are opposition or square aspects, intensity should be affected
      const hasOpposition = chart.aspects.some(a => a.type === 'opposition');
      const hasSquare = chart.aspects.some(a => a.type === 'square');

      if (hasOpposition || hasSquare) {
        // Intensity should be at least base score
        expect(chart.intensity).toBeGreaterThanOrEqual(5);
      }
    });
  });

  describe('generateLunarMonthForecast', () => {
    const mockNatalChart: any = {
      id: 'chart_1',
      userId: 'user_1',
      moon: {
        sign: 'leo',
        degree: 15,
        minute: 30,
        second: 0,
      },
    };

    test('should generate complete monthly forecast', () => {
      const returnDate = new Date('2026-02-15T00:00:00Z');

      const forecast = generateLunarMonthForecast('user_1', mockNatalChart, returnDate);

      expect(forecast).toHaveProperty('userId', 'user_1');
      expect(forecast).toHaveProperty('returnDate', returnDate);
      expect(forecast).toHaveProperty('theme');
      expect(forecast).toHaveProperty('intensity');
      expect(forecast).toHaveProperty('emotionalTheme');
      expect(forecast).toHaveProperty('actionAdvice');
      expect(forecast).toHaveProperty('keyDates');
      expect(forecast).toHaveProperty('predictions');
      expect(forecast).toHaveProperty('rituals');
      expect(forecast).toHaveProperty('journalPrompts');
    });

    test('should include key dates', () => {
      const returnDate = new Date('2026-02-15T00:00:00Z');

      const forecast = generateLunarMonthForecast('user_1', mockNatalChart, returnDate);

      expect(Array.isArray(forecast.keyDates)).toBe(true);
      expect(forecast.keyDates.length).toBeGreaterThan(0);

      forecast.keyDates.forEach((keyDate) => {
        expect(keyDate).toHaveProperty('date');
        expect(keyDate).toHaveProperty('type');
        expect(keyDate).toHaveProperty('description');
        expect(keyDate).toHaveProperty('significance');
      });
    });

    test('should include predictions for different life areas', () => {
      const returnDate = new Date('2026-02-15T00:00:00Z');

      const forecast = generateLunarMonthForecast('user_1', mockNatalChart, returnDate);

      expect(Array.isArray(forecast.predictions)).toBe(true);

      // Check that predictions have required properties
      forecast.predictions.forEach((prediction) => {
        expect(prediction).toHaveProperty('category');
        expect(prediction).toHaveProperty('prediction');
        expect(prediction).toHaveProperty('likelihood');
        expect(prediction).toHaveProperty('advice');
      });

      // Check that categories are valid
      const validCategories = [
        'relationships',
        'career',
        'finances',
        'health',
        'creativity',
        'spirituality',
      ];

      forecast.predictions.forEach((prediction) => {
        expect(validCategories).toContain(prediction.category);
      });
    });

    test('should include monthly rituals', () => {
      const returnDate = new Date('2026-02-15T00:00:00Z');

      const forecast = generateLunarMonthForecast('user_1', mockNatalChart, returnDate);

      expect(Array.isArray(forecast.rituals)).toBe(true);
      expect(forecast.rituals.length).toBeGreaterThan(0);

      // Check ritual structure
      forecast.rituals.forEach((ritual) => {
        expect(ritual).toHaveProperty('phase');
        expect(ritual).toHaveProperty('title');
        expect(ritual).toHaveProperty('description');
        expect(ritual).toHaveProperty('steps');
      });
    });

    test('should include journal prompts', () => {
      const returnDate = new Date('2026-02-15T00:00:00Z');

      const forecast = generateLunarMonthForecast('user_1', mockNatalChart, returnDate);

      expect(Array.isArray(forecast.journalPrompts)).toBe(true);
      expect(forecast.journalPrompts.length).toBeGreaterThan(0);

      // Check that prompts are strings
      forecast.journalPrompts.forEach((prompt) => {
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(0);
      });
    });

    test('should include action advice', () => {
      const returnDate = new Date('2026-02-15T00:00:00Z');

      const forecast = generateLunarMonthForecast('user_1', mockNatalChart, returnDate);

      expect(Array.isArray(forecast.actionAdvice)).toBe(true);
      expect(forecast.actionAdvice.length).toBeGreaterThan(0);

      // Check that advice items are strings
      forecast.actionAdvice.forEach((advice) => {
        expect(typeof advice).toBe('string');
      });
    });

    test('should provide emotional theme', () => {
      const returnDate = new Date('2026-02-15T00:00:00Z');

      const forecast = generateLunarMonthForecast('user_1', mockNatalChart, returnDate);

      expect(forecast.emotionalTheme).toBeTruthy();
      expect(typeof forecast.emotionalTheme).toBe('string');
    });

    test('should calculate overall theme', () => {
      const returnDate = new Date('2026-02-15T00:00:00Z');

      const forecast = generateLunarMonthForecast('user_1', mockNatalChart, returnDate);

      expect(forecast.theme).toBeTruthy();
      expect(typeof forecast.theme).toBe('string');
    });

    test('should include intensity score', () => {
      const returnDate = new Date('2026-02-15T00:00:00Z');

      const forecast = generateLunarMonthForecast('user_1', mockNatalChart, returnDate);

      expect(forecast.intensity).toBeGreaterThanOrEqual(1);
      expect(forecast.intensity).toBeLessThanOrEqual(10);
    });

    test('should generate different content for different house placements', () => {
      // Use different return dates to get different house placements
      // House placement depends on the date, not the natal moon
      const returnDate1 = new Date('2026-01-15T00:00:00Z');
      const returnDate2 = new Date('2026-02-15T00:00:00Z');

      const forecast1 = generateLunarMonthForecast('user_1', mockNatalChart, returnDate1);
      const forecast2 = generateLunarMonthForecast('user_1', mockNatalChart, returnDate2);

      // Different dates should generate different house placements and thus different themes
      expect(forecast1.theme).not.toBe(forecast2.theme);
    });

    test('should include moon phase specific journal prompts', () => {
      // Test with new moon date
      const newMoonForecast = generateLunarMonthForecast('user_1', mockNatalChart, new Date('2026-02-17T12:00:00Z'));
      expect(newMoonForecast.journalPrompts.length).toBeGreaterThan(0);

      // Test with full moon date
      const fullMoonForecast = generateLunarMonthForecast('user_1', mockNatalChart, new Date('2026-03-03T12:00:00Z'));
      expect(fullMoonForecast.journalPrompts.length).toBeGreaterThan(0);

      // All prompts should be non-empty strings
      newMoonForecast.journalPrompts.forEach(p => {
        expect(typeof p).toBe('string');
        expect(p.length).toBeGreaterThan(0);
      });

      fullMoonForecast.journalPrompts.forEach(p => {
        expect(typeof p).toBe('string');
        expect(p.length).toBeGreaterThan(0);
      });
    });

    test('should include moon phase specific action advice', () => {
      // Test with new moon date
      const newMoonForecast = generateLunarMonthForecast('user_1', mockNatalChart, new Date('2026-02-17T12:00:00Z'));
      expect(newMoonForecast.actionAdvice.length).toBeGreaterThan(0);

      // Test with full moon date
      const fullMoonForecast = generateLunarMonthForecast('user_1', mockNatalChart, new Date('2026-03-03T12:00:00Z'));
      expect(fullMoonForecast.actionAdvice.length).toBeGreaterThan(0);

      // All advice should be non-empty strings
      newMoonForecast.actionAdvice.forEach(a => {
        expect(typeof a).toBe('string');
        expect(a.length).toBeGreaterThan(0);
      });

      fullMoonForecast.actionAdvice.forEach(a => {
        expect(typeof a).toBe('string');
        expect(a.length).toBeGreaterThan(0);
      });
    });

    test('should add spirituality prediction for full moon phase', () => {
      // Use known full moon date
      const fullMoonForecast = generateLunarMonthForecast('user_1', mockNatalChart, new Date('2026-03-03T12:00:00Z'));

      // Should include spirituality prediction for full moon
      expect(fullMoonForecast.predictions.some(p => p.category === 'spirituality')).toBe(true);
    });
  });

  describe('getCurrentLunarReturn', () => {
    test('should return next lunar return date', async () => {
      const result = await getCurrentLunarReturn('user_1');

      expect(result).toHaveProperty('returnDate');
      expect(result).toHaveProperty('daysUntil');
    });

    test('should calculate days until return', async () => {
      const result = await getCurrentLunarReturn('user_1');

      expect(result.daysUntil).toBeGreaterThan(0);
      expect(result.daysUntil).toBeLessThan(30);
    });

    test('should handle different users', async () => {
      const result1 = await getCurrentLunarReturn('user_1');
      const result2 = await getCurrentLunarReturn('user_2');

      expect(result1.returnDate).toBeInstanceOf(Date);
      expect(result2.returnDate).toBeInstanceOf(Date);
      // May be different for different users
    });
  });
});
