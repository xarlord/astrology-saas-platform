/**
 * Tests for Monthly Transit Report Service
 * CHI-123: Backend API endpoint for monthly transit reports
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { generateMonthlyTransitReport } from './monthlyTransit.service';
import ChartModel from '../../charts/models/chart.model';
import { AstronomyEngineService } from '../../shared/services/astronomyEngine.service';

// Mock dependencies
jest.mock('../../charts/models/chart.model');
jest.mock('../../shared/services/astronomyEngine.service');

describe('MonthlyTransitReport Service', () => {
  const mockUserId = 'user-123';
  const mockMonth = '2026-04';

  // Mock chart data
  const mockChart = {
    id: 'chart-123',
    user_id: mockUserId,
    birth_date: new Date('1990-01-15'),
    birth_time: '10:30:00',
    birth_place_name: 'New York, NY',
    birth_latitude: 40.7128,
    birth_longitude: -74.006,
    sunLongitude: 295.5,
    moonLongitude: 45.2,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock AstronomyEngineService instance
    const mockPositions = new Map();
    mockPositions.set('Sun', {
      sign: 'Aries',
      degree: 15.5,
      longitude: 15.5,
      isRetrograde: false,
    });
    mockPositions.set('Moon', {
      sign: 'Taurus',
      degree: 23.2,
      longitude: 53.2,
      isRetrograde: false,
    });
    mockPositions.set('Mercury', {
      sign: 'Aries',
      degree: 5.8,
      longitude: 5.8,
      isRetrograde: false,
    });
    mockPositions.set('Venus', {
      sign: 'Pisces',
      degree: 28.1,
      longitude: 358.1,
      isRetrograde: false,
    });
    mockPositions.set('Mars', {
      sign: 'Gemini',
      degree: 12.3,
      longitude: 72.3,
      isRetrograde: false,
    });

    (AstronomyEngineService as jest.MockedClass<typeof AstronomyEngineService>).mockImplementation(
      () => {
        return {
          calculatePlanetaryPositions: jest.fn(() => mockPositions),
        } as any;
      },
    );
  });

  // ===== Happy Path =====

  describe('generateMonthlyTransitReport', () => {
    it('should generate complete monthly report for valid user and month', async () => {
      // Given
      const charts = [mockChart];
      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);

      // When
      const result = await generateMonthlyTransitReport(mockUserId, mockMonth);

      // Then
      expect(result).toBeDefined();
      expect(result.userId).toBe(mockUserId);
      expect(result.month).toBe(mockMonth);
      expect(result.natalChart.id).toBe(mockChart.id);
      expect(result.natalChart.birthDate).toBe('1990-01-15');
      expect(result.natalChart.birthTime).toBe('10:30:00');
      expect(result.natalChart.birthPlace).toBe('New York, NY');
      expect(result.dailyTransits).toBeDefined();
      expect(Array.isArray(result.dailyTransits)).toBe(true);
      expect(result.summary).toBeDefined();
      expect(result.summary.keyThemes).toBeDefined();
      expect(Array.isArray(result.summary.keyThemes)).toBe(true);
      expect(result.summary.majorTransits).toBeDefined();
      expect(Array.isArray(result.summary.majorTransits)).toBe(true);
      expect(result.summary.retrogrades).toBeDefined();
      expect(Array.isArray(result.summary.retrogrades)).toBe(true);
      expect(result.generatedAt).toBeDefined();
    });

    it('should use current month when no month parameter provided', async () => {
      // Given
      const charts = [mockChart];
      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);
      const currentMonth = new Date().toISOString().slice(0, 7);

      // When
      const result = await generateMonthlyTransitReport(mockUserId);

      // Then
      expect(result.month).toBe(currentMonth);
    });

    it('should generate daily transits for all days in the month', async () => {
      // Given
      const charts = [mockChart];
      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);

      // When
      const result = await generateMonthlyTransitReport(mockUserId, '2026-04');

      // Then
      expect(result.dailyTransits.length).toBe(30);
    });
  });

  // ===== Error Cases =====

  describe('generateMonthlyTransitReport - Error Cases', () => {
    it('should throw error when user has no natal chart', async () => {
      // Given
      (ChartModel.findByUserId as jest.Mock).mockResolvedValue([]);

      // When & Then
      await expect(generateMonthlyTransitReport(mockUserId, mockMonth)).rejects.toThrow(
        'No natal chart found. Please create a natal chart first.',
      );
    });

    it('should throw error for invalid month format', async () => {
      // Given
      const charts = [mockChart];
      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);

      // When & Then
      await expect(generateMonthlyTransitReport(mockUserId, 'invalid')).rejects.toThrow(
        'Invalid month format. Use YYYY-MM.',
      );
    });

    it('should throw error for month out of range', async () => {
      // Given
      const charts = [mockChart];
      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);

      // When & Then
      await expect(generateMonthlyTransitReport(mockUserId, '2026-13')).rejects.toThrow(
        'Invalid month format. Use YYYY-MM.',
      );
    });
  });

  // ===== Edge Cases =====

  describe('generateMonthlyTransitReport - Edge Cases', () => {
    it('should handle leap year February', async () => {
      // Given
      const charts = [mockChart];
      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);

      // When
      const result = await generateMonthlyTransitReport(mockUserId, '2024-02');

      // Then
      expect(result.dailyTransits.length).toBe(29);
    });

    it('should handle non-leap year February', async () => {
      // Given
      const charts = [mockChart];
      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);

      // When
      const result = await generateMonthlyTransitReport(mockUserId, '2025-02');

      // Then
      expect(result.dailyTransits.length).toBe(28);
    });

    it('should handle user with multiple charts', async () => {
      // Given
      const charts = [mockChart, { ...mockChart, id: 'chart-456' }];
      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);

      // When
      const result = await generateMonthlyTransitReport(mockUserId, mockMonth);

      // Then
      expect(result.natalChart.id).toBe(mockChart.id);
    });
  });

  // ===== Data Structure Validation =====

  describe('generateMonthlyTransitReport - Data Structure', () => {
    it('should return valid MonthlyTransitReport interface', async () => {
      // Given
      const charts = [mockChart];
      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);

      // When
      const result = await generateMonthlyTransitReport(mockUserId, mockMonth);

      // Then
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('month');
      expect(result).toHaveProperty('natalChart');
      expect(result).toHaveProperty('dailyTransits');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('generatedAt');
    });

    it('should maintain consistent date formats', async () => {
      // Given
      const charts = [mockChart];
      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);

      // When
      const result = await generateMonthlyTransitReport(mockUserId, mockMonth);

      // Then
      result.dailyTransits.forEach((day) => {
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should ensure all planet degrees are numbers', async () => {
      // Given
      const charts = [mockChart];
      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);

      // When
      const result = await generateMonthlyTransitReport(mockUserId, mockMonth);

      // Then
      result.dailyTransits.forEach((day) => {
        expect(typeof day.sun.degree).toBe('number');
        expect(typeof day.moon.degree).toBe('number');
        expect(typeof day.mercury.degree).toBe('number');
        expect(typeof day.venus.degree).toBe('number');
        expect(typeof day.mars.degree).toBe('number');
      });
    });

    it('should ensure all retrograde flags are booleans', async () => {
      // Given
      const charts = [mockChart];
      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(charts);

      // When
      const result = await generateMonthlyTransitReport(mockUserId, mockMonth);

      // Then
      result.dailyTransits.forEach((day) => {
        expect(typeof day.mercury.retrograde).toBe('boolean');
        expect(typeof day.venus.retrograde).toBe('boolean');
        expect(typeof day.mars.retrograde).toBe('boolean');
      });
    });
  });
});
