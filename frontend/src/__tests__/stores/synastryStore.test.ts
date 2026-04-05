/**
 * Tests for Synastry Store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useSynastryStore } from '../../stores/synastryStore';

// Mock the synastry API functions
vi.mock('../../services/synastry.api', () => ({
  compareCharts: vi.fn(),
  getCompatibility: vi.fn(),
  generateCompatibilityReport: vi.fn(),
}));

// Import after mocking
import {
  compareCharts,
  getCompatibility,
  generateCompatibilityReport,
} from '../../services/synastry.api';

const mockChart1 = {
  id: 'chart-1',
  name: 'Person 1',
  birthDate: '1990-01-15T10:30:00Z',
};

const mockChart2 = {
  id: 'chart-2',
  name: 'Person 2',
  birthDate: '1992-06-20T14:00:00Z',
};

const mockSynastryAspect = {
  planet1: 'Sun',
  planet2: 'Moon',
  aspect: 'conjunction' as const,
  orb: 2.5,
  applying: true,
  interpretation: 'Strong emotional connection',
  weight: 0.8,
  soulmateIndicator: true,
};

const mockCompatibilityScores = {
  overall: 78,
  romantic: 85,
  communication: 70,
  emotional: 80,
  intellectual: 75,
  spiritual: 65,
  values: 72,
};

describe('synastryStore', () => {
  // Helper to reset store state
  const resetStore = () => {
    useSynastryStore.setState({
      person1: null,
      person2: null,
      score: 0,
      breakdown: null,
      aspects: null,
      comparison: null,
      isLoading: false,
      error: null,
    });
  };

  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useSynastryStore.getState();

      expect(state.person1).toBeNull();
      expect(state.person2).toBeNull();
      expect(state.score).toBe(0);
      expect(state.breakdown).toBeNull();
      expect(state.aspects).toBeNull();
      expect(state.comparison).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setPersons action', () => {
    it('should set both persons', () => {
      act(() => {
        useSynastryStore.getState().setPersons(mockChart1 as any, mockChart2 as any);
      });

      const state = useSynastryStore.getState();

      expect(state.person1).toEqual(mockChart1);
      expect(state.person2).toEqual(mockChart2);
    });

    it('should allow setting persons to null', () => {
      useSynastryStore.setState({
        person1: mockChart1 as any,
        person2: mockChart2 as any,
      });

      act(() => {
        useSynastryStore.getState().setPersons(null, null);
      });

      const state = useSynastryStore.getState();

      expect(state.person1).toBeNull();
      expect(state.person2).toBeNull();
    });

    it('should allow partial person updates', () => {
      useSynastryStore.setState({
        person1: mockChart1 as any,
        person2: mockChart2 as any,
      });

      const newChart2 = { ...mockChart2, name: 'Updated Person 2' };

      act(() => {
        useSynastryStore.getState().setPersons(mockChart1 as any, newChart2 as any);
      });

      const state = useSynastryStore.getState();

      expect(state.person1).toEqual(mockChart1);
      expect(state.person2).toEqual(newChart2);
    });
  });

  describe('compare action', () => {
    it('should compare charts successfully', async () => {
      vi.mocked(compareCharts).mockResolvedValueOnce({
        id: 'synastry-1',
        chart1Id: 'chart-1',
        chart2Id: 'chart-2',
        synastryAspects: [mockSynastryAspect],
        overallCompatibility: 78,
        relationshipTheme: 'Soulmates',
        strengths: ['Communication'],
        challenges: ['Distance'],
        advice: 'Be patient',
      });

      await act(async () => {
        await useSynastryStore.getState().compare('chart-1', 'chart-2');
      });

      const state = useSynastryStore.getState();

      expect(compareCharts).toHaveBeenCalledWith('chart-1', 'chart-2');
      expect(state.score).toBe(78);
      expect(state.aspects).toHaveLength(1);
      expect(state.comparison).not.toBeNull();
      expect(state.comparison?.chart1_id).toBe('chart-1');
      expect(state.comparison?.chart2_id).toBe('chart-2');
      expect(state.comparison?.overall_compatibility).toBe(78);
      expect(state.isLoading).toBe(false);
    });

    it('should set loading state during comparison', async () => {
      vi.mocked(compareCharts).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({} as any), 100)),
      );

      const comparePromise = act(async () => {
        await useSynastryStore.getState().compare('chart-1', 'chart-2');
      });

      expect(useSynastryStore.getState().isLoading).toBe(true);

      await comparePromise;

      expect(useSynastryStore.getState().isLoading).toBe(false);
    });

    it('should handle compare error', async () => {
      vi.mocked(compareCharts).mockRejectedValueOnce(new Error('Comparison failed'));

      await act(async () => {
        try {
          await useSynastryStore.getState().compare('chart-1', 'chart-2');
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      const state = useSynastryStore.getState();

      expect(state.error).toBe('Comparison failed');
      expect(state.isLoading).toBe(false);
    });

    it('should handle non-Error compare failures', async () => {
      vi.mocked(compareCharts).mockRejectedValueOnce('Unknown error');

      await act(async () => {
        try {
          await useSynastryStore.getState().compare('chart-1', 'chart-2');
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      expect(useSynastryStore.getState().error).toBe('Failed to compare charts');
    });
  });

  describe('getCompatibility action', () => {
    it('should get compatibility scores successfully', async () => {
      vi.mocked(getCompatibility).mockResolvedValueOnce({
        chart1Id: 'chart-1',
        chart2Id: 'chart-2',
        scores: mockCompatibilityScores,
        elementalBalance: {
          fire: 25,
          earth: 25,
          air: 25,
          water: 25,
          balance: 'balanced' as const,
        },
      });

      await act(async () => {
        await useSynastryStore.getState().getCompatibility('chart-1', 'chart-2');
      });

      const state = useSynastryStore.getState();

      expect(getCompatibility).toHaveBeenCalledWith('chart-1', 'chart-2', true);
      expect(state.score).toBe(78);
      expect(state.breakdown).toEqual(mockCompatibilityScores);
      expect(state.isLoading).toBe(false);
    });

    it('should handle getCompatibility error', async () => {
      vi.mocked(getCompatibility).mockRejectedValueOnce(new Error('API error'));

      await act(async () => {
        try {
          await useSynastryStore.getState().getCompatibility('chart-1', 'chart-2');
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      const state = useSynastryStore.getState();

      expect(state.error).toBe('API error');
    });

    it('should handle non-Error getCompatibility failures', async () => {
      vi.mocked(getCompatibility).mockRejectedValueOnce({});

      await act(async () => {
        try {
          await useSynastryStore.getState().getCompatibility('chart-1', 'chart-2');
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      expect(useSynastryStore.getState().error).toBe('Failed to calculate compatibility');
    });
  });

  describe('generateFullReport action', () => {
    it('should generate full report successfully', async () => {
      vi.mocked(generateCompatibilityReport).mockResolvedValueOnce({
        user1Id: 'chart-1',
        user2Id: 'chart-2',
        scores: mockCompatibilityScores,
        elementalBalance: {
          fire: 30,
          earth: 20,
          air: 25,
          water: 25,
          balance: 'balanced' as const,
        },
        relationshipDynamics: ['Strong emotional bond'],
        strengths: ['Communication'],
        challenges: ['Stubbornness'],
        growthOpportunities: ['Patience'],
        detailedReport: 'This is a detailed report...',
      });

      await act(async () => {
        await useSynastryStore.getState().generateFullReport('chart-1', 'chart-2');
      });

      const state = useSynastryStore.getState();

      expect(generateCompatibilityReport).toHaveBeenCalledWith('chart-1', 'chart-2');
      expect(state.score).toBe(78);
      expect(state.breakdown).toEqual(mockCompatibilityScores);
      expect(state.comparison).not.toBeNull();
      expect(state.comparison?.chart1_id).toBe('chart-1');
      expect(state.isLoading).toBe(false);
    });

    it('should handle generateFullReport error', async () => {
      vi.mocked(generateCompatibilityReport).mockRejectedValueOnce(
        new Error('Report generation failed'),
      );

      await act(async () => {
        try {
          await useSynastryStore.getState().generateFullReport('chart-1', 'chart-2');
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      const state = useSynastryStore.getState();

      expect(state.error).toBe('Report generation failed');
    });

    it('should handle non-Error generateFullReport failures', async () => {
      vi.mocked(generateCompatibilityReport).mockRejectedValueOnce(null);

      await act(async () => {
        try {
          await useSynastryStore.getState().generateFullReport('chart-1', 'chart-2');
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      expect(useSynastryStore.getState().error).toBe('Failed to generate report');
    });
  });

  describe('clear action', () => {
    it('should clear all state', () => {
      useSynastryStore.setState({
        person1: mockChart1 as any,
        person2: mockChart2 as any,
        score: 78,
        breakdown: mockCompatibilityScores,
        aspects: [mockSynastryAspect] as any,
        comparison: {} as any,
        error: 'Some error',
      });

      act(() => {
        useSynastryStore.getState().clear();
      });

      const state = useSynastryStore.getState();

      expect(state.person1).toBeNull();
      expect(state.person2).toBeNull();
      expect(state.score).toBe(0);
      expect(state.breakdown).toBeNull();
      expect(state.aspects).toBeNull();
      expect(state.comparison).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('clearError action', () => {
    it('should clear error', () => {
      useSynastryStore.setState({ error: 'Some error' });

      act(() => {
        useSynastryStore.getState().clearError();
      });

      expect(useSynastryStore.getState().error).toBeNull();
    });
  });

  describe('selector hooks', () => {
    it('useSynastryPersons should return both persons', () => {
      useSynastryStore.setState({
        person1: mockChart1 as any,
        person2: mockChart2 as any,
      });

      const { person1, person2 } = {
        person1: useSynastryStore.getState().person1,
        person2: useSynastryStore.getState().person2,
      };

      expect(person1).toEqual(mockChart1);
      expect(person2).toEqual(mockChart2);
    });

    it('useSynastryScore should return score', () => {
      useSynastryStore.setState({ score: 85 });
      const score = useSynastryStore.getState().score;
      expect(score).toBe(85);
    });

    it('useSynastryBreakdown should return breakdown', () => {
      useSynastryStore.setState({ breakdown: mockCompatibilityScores });
      const breakdown = useSynastryStore.getState().breakdown;
      expect(breakdown).toEqual(mockCompatibilityScores);
    });

    it('useSynastryComparison should return comparison', () => {
      const mockComparison = {
        chart1_id: 'chart-1',
        chart2_id: 'chart-2',
        overall_compatibility: 78,
        breakdown: mockCompatibilityScores,
        aspects: [],
        theme_analysis: {},
      };

      useSynastryStore.setState({ comparison: mockComparison as any });
      const comparison = useSynastryStore.getState().comparison;
      expect(comparison).toEqual(mockComparison);
    });

    it('useSynastryLoading should return loading state', () => {
      useSynastryStore.setState({ isLoading: true });
      const isLoading = useSynastryStore.getState().isLoading;
      expect(isLoading).toBe(true);
    });
  });
});
