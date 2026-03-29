/**
 * Tests for useSynastry Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSynastry } from '../../hooks/useSynastry';
import type { Chart, BirthData } from '../../services/api.types';

// Mock chart data
const mockBirthData: BirthData = {
  name: 'Test Person 1',
  birth_date: '1990-01-15',
  birth_time: '12:00',
  birth_place_name: 'New York, NY',
  birth_latitude: 40.7128,
  birth_longitude: -74.006,
  birth_timezone: 'America/New_York',
};

const mockChart1: Chart = {
  id: 'chart-1',
  user_id: 'user-1',
  name: 'Person 1 Chart',
  type: 'natal',
  birth_data: mockBirthData,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockChart2: Chart = {
  id: 'chart-2',
  user_id: 'user-1',
  name: 'Person 2 Chart',
  type: 'natal',
  birth_data: {
    ...mockBirthData,
    name: 'Test Person 2',
    birth_date: '1992-06-20',
  },
  created_at: '2024-01-02T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
};

const mockBreakdown = {
  romantic: 75,
  communication: 65,
  values: 80,
  emotional: 70,
  intellectual: 60,
  spiritual: 55,
  overall: 68,
};

const mockAspects = [
  {
    planet1: { planet: 'Sun', chart: '1' as const },
    planet2: { planet: 'Moon', chart: '2' as const },
    type: 'conjunction' as const,
    degree: 2,
    orb: 3,
    influence: 'harmonious',
    significance: 'major',
    interpretation: 'Strong emotional connection',
  },
];

const mockComparison = {
  chart1_id: 'chart-1',
  chart2_id: 'chart-2',
  overall_compatibility: 75,
  breakdown: mockBreakdown,
  aspects: [],
  theme_analysis: {
    romantic: 'Strong romantic potential',
    communication: 'Good mental rapport',
  },
};

// Mock the synastry store
const mockSynastryStore = {
  person1: null as Chart | null,
  person2: null as Chart | null,
  score: 0,
  breakdown: null as typeof mockBreakdown | null,
  aspects: null as typeof mockAspects | null,
  comparison: null as typeof mockComparison | null,
  isLoading: false,
  error: null as string | null,
  setPersons: vi.fn(),
  compare: vi.fn(),
  getCompatibility: vi.fn(),
  generateFullReport: vi.fn(),
  clear: vi.fn(),
  clearError: vi.fn(),
};

vi.mock('../../stores', () => ({
  useSynastryStore: vi.fn((selector?: (state: typeof mockSynastryStore) => unknown) => {
    if (selector) {
      return selector(mockSynastryStore);
    }
    return mockSynastryStore;
  }),
}));

describe('useSynastry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSynastryStore.person1 = null;
    mockSynastryStore.person2 = null;
    mockSynastryStore.score = 0;
    mockSynastryStore.breakdown = null;
    mockSynastryStore.aspects = null;
    mockSynastryStore.comparison = null;
    mockSynastryStore.isLoading = false;
    mockSynastryStore.error = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return synastry state from store', () => {
      const { result } = renderHook(() => useSynastry());

      expect(result.current.person1).toBeNull();
      expect(result.current.person2).toBeNull();
      expect(result.current.score).toBe(0);
      expect(result.current.breakdown).toBeNull();
      expect(result.current.aspects).toBeNull();
      expect(result.current.comparison).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return all expected properties', () => {
      const { result } = renderHook(() => useSynastry());

      // State
      expect(result.current).toHaveProperty('person1');
      expect(result.current).toHaveProperty('person2');
      expect(result.current).toHaveProperty('score');
      expect(result.current).toHaveProperty('breakdown');
      expect(result.current).toHaveProperty('comparison');
      expect(result.current).toHaveProperty('aspects');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');

      // Methods
      expect(typeof result.current.setPersons).toBe('function');
      expect(typeof result.current.compare).toBe('function');
      expect(typeof result.current.getCompatibility).toBe('function');
      expect(typeof result.current.generateFullReport).toBe('function');
      expect(typeof result.current.clear).toBe('function');
      expect(typeof result.current.clearError).toBe('function');

      // Computed
      expect(typeof result.current.getScoreLabel).toBe('function');
      expect(typeof result.current.getScoreColor).toBe('function');
      expect(typeof result.current.getCompatibilityLevel).toBe('function');
      expect(typeof result.current.getHighestArea).toBe('function');
      expect(typeof result.current.getLowestArea).toBe('function');
      expect(typeof result.current.isReady).toBe('function');
    });
  });

  describe('setPersons', () => {
    it('should call store setPersons', () => {
      const { result } = renderHook(() => useSynastry());

      act(() => {
        result.current.setPersons(mockChart1, mockChart2);
      });

      expect(mockSynastryStore.setPersons).toHaveBeenCalledWith(mockChart1, mockChart2);
    });

    it('should allow setting null values', () => {
      const { result } = renderHook(() => useSynastry());

      act(() => {
        result.current.setPersons(null, null);
      });

      expect(mockSynastryStore.setPersons).toHaveBeenCalledWith(null, null);
    });

    it('should allow setting only one person', () => {
      const { result } = renderHook(() => useSynastry());

      act(() => {
        result.current.setPersons(mockChart1, null);
      });

      expect(mockSynastryStore.setPersons).toHaveBeenCalledWith(mockChart1, null);
    });
  });

  describe('compare', () => {
    it('should call store compare and return true on success', async () => {
      mockSynastryStore.compare.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useSynastry());

      let compareResult: boolean | undefined;
      await act(async () => {
        compareResult = await result.current.compare('chart-1', 'chart-2');
      });

      expect(mockSynastryStore.compare).toHaveBeenCalledWith('chart-1', 'chart-2');
      expect(compareResult).toBe(true);
    });

    it('should return false on compare failure', async () => {
      mockSynastryStore.compare.mockRejectedValueOnce(new Error('Compare failed'));

      const { result } = renderHook(() => useSynastry());

      let compareResult: boolean | undefined;
      await act(async () => {
        compareResult = await result.current.compare('chart-1', 'chart-2');
      });

      expect(compareResult).toBe(false);
    });
  });

  describe('getCompatibility', () => {
    it('should call store getCompatibility and return true on success', async () => {
      mockSynastryStore.getCompatibility.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useSynastry());

      let compatResult: boolean | undefined;
      await act(async () => {
        compatResult = await result.current.getCompatibility('chart-1', 'chart-2');
      });

      expect(mockSynastryStore.getCompatibility).toHaveBeenCalledWith('chart-1', 'chart-2');
      expect(compatResult).toBe(true);
    });

    it('should return false on getCompatibility failure', async () => {
      mockSynastryStore.getCompatibility.mockRejectedValueOnce(new Error('Failed'));

      const { result } = renderHook(() => useSynastry());

      let compatResult: boolean | undefined;
      await act(async () => {
        compatResult = await result.current.getCompatibility('chart-1', 'chart-2');
      });

      expect(compatResult).toBe(false);
    });
  });

  describe('generateFullReport', () => {
    it('should call store generateFullReport and return true on success', async () => {
      mockSynastryStore.generateFullReport.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useSynastry());

      let reportResult: boolean | undefined;
      await act(async () => {
        reportResult = await result.current.generateFullReport('chart-1', 'chart-2');
      });

      expect(mockSynastryStore.generateFullReport).toHaveBeenCalledWith('chart-1', 'chart-2');
      expect(reportResult).toBe(true);
    });

    it('should return false on generateFullReport failure', async () => {
      mockSynastryStore.generateFullReport.mockRejectedValueOnce(new Error('Report failed'));

      const { result } = renderHook(() => useSynastry());

      let reportResult: boolean | undefined;
      await act(async () => {
        reportResult = await result.current.generateFullReport('chart-1', 'chart-2');
      });

      expect(reportResult).toBe(false);
    });
  });

  describe('getScoreLabel', () => {
    it('should return "Excellent" for score >= 80', () => {
      mockSynastryStore.score = 85;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getScoreLabel()).toBe('Excellent');
    });

    it('should return "Excellent" for score exactly 80', () => {
      mockSynastryStore.score = 80;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getScoreLabel()).toBe('Excellent');
    });

    it('should return "Good" for score >= 60', () => {
      mockSynastryStore.score = 65;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getScoreLabel()).toBe('Good');
    });

    it('should return "Moderate" for score >= 40', () => {
      mockSynastryStore.score = 45;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getScoreLabel()).toBe('Moderate');
    });

    it('should return "Challenging" for score >= 20', () => {
      mockSynastryStore.score = 25;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getScoreLabel()).toBe('Challenging');
    });

    it('should return "Difficult" for score < 20', () => {
      mockSynastryStore.score = 15;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getScoreLabel()).toBe('Difficult');
    });

    it('should return "Difficult" for score 0', () => {
      mockSynastryStore.score = 0;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getScoreLabel()).toBe('Difficult');
    });
  });

  describe('getScoreColor', () => {
    it('should return "green" for score >= 80', () => {
      mockSynastryStore.score = 85;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getScoreColor()).toBe('green');
    });

    it('should return "blue" for score >= 60', () => {
      mockSynastryStore.score = 65;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getScoreColor()).toBe('blue');
    });

    it('should return "yellow" for score >= 40', () => {
      mockSynastryStore.score = 45;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getScoreColor()).toBe('yellow');
    });

    it('should return "orange" for score >= 20', () => {
      mockSynastryStore.score = 25;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getScoreColor()).toBe('orange');
    });

    it('should return "red" for score < 20', () => {
      mockSynastryStore.score = 15;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getScoreColor()).toBe('red');
    });
  });

  describe('getCompatibilityLevel', () => {
    it('should return "high" for score >= 60', () => {
      mockSynastryStore.score = 65;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getCompatibilityLevel()).toBe('high');
    });

    it('should return "high" for score exactly 60', () => {
      mockSynastryStore.score = 60;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getCompatibilityLevel()).toBe('high');
    });

    it('should return "medium" for score >= 40', () => {
      mockSynastryStore.score = 45;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getCompatibilityLevel()).toBe('medium');
    });

    it('should return "low" for score < 40', () => {
      mockSynastryStore.score = 35;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getCompatibilityLevel()).toBe('low');
    });
  });

  describe('getHighestArea', () => {
    it('should return the area with highest score', () => {
      mockSynastryStore.breakdown = {
        romantic: 75,
        communication: 65,
        values: 80,
        emotional: 70,
        intellectual: 60,
        spiritual: 55,
        overall: 68,
      };

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getHighestArea()).toBe('Values');
    });

    it('should return null when no breakdown exists', () => {
      mockSynastryStore.breakdown = null;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getHighestArea()).toBeNull();
    });

    it('should correctly identify romantic as highest', () => {
      mockSynastryStore.breakdown = {
        romantic: 95,
        communication: 65,
        values: 80,
        emotional: 70,
        intellectual: 60,
        spiritual: 55,
        overall: 68,
      };

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getHighestArea()).toBe('Romance');
    });
  });

  describe('getLowestArea', () => {
    it('should return the area with lowest score', () => {
      mockSynastryStore.breakdown = {
        romantic: 75,
        communication: 65,
        values: 80,
        emotional: 70,
        intellectual: 60,
        spiritual: 55,
        overall: 68,
      };

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getLowestArea()).toBe('Intellectual');
    });

    it('should return null when no breakdown exists', () => {
      mockSynastryStore.breakdown = null;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getLowestArea()).toBeNull();
    });

    it('should correctly identify emotional as lowest', () => {
      mockSynastryStore.breakdown = {
        romantic: 75,
        communication: 65,
        values: 80,
        emotional: 30,
        intellectual: 60,
        spiritual: 55,
        overall: 68,
      };

      const { result } = renderHook(() => useSynastry());

      expect(result.current.getLowestArea()).toBe('Emotional');
    });
  });

  describe('isReady', () => {
    it('should return true when both persons are set', () => {
      mockSynastryStore.person1 = mockChart1;
      mockSynastryStore.person2 = mockChart2;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.isReady()).toBe(true);
    });

    it('should return false when only person1 is set', () => {
      mockSynastryStore.person1 = mockChart1;
      mockSynastryStore.person2 = null;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.isReady()).toBe(false);
    });

    it('should return false when only person2 is set', () => {
      mockSynastryStore.person1 = null;
      mockSynastryStore.person2 = mockChart2;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.isReady()).toBe(false);
    });

    it('should return false when no persons are set', () => {
      mockSynastryStore.person1 = null;
      mockSynastryStore.person2 = null;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.isReady()).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should expose clear from store', () => {
      const { result } = renderHook(() => useSynastry());

      act(() => {
        result.current.clear();
      });

      expect(mockSynastryStore.clear).toHaveBeenCalled();
    });

    it('should expose clearError from store', () => {
      const { result } = renderHook(() => useSynastry());

      act(() => {
        result.current.clearError();
      });

      expect(mockSynastryStore.clearError).toHaveBeenCalled();
    });
  });

  describe('state updates', () => {
    it('should reflect updated person1 from store', () => {
      mockSynastryStore.person1 = mockChart1;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.person1).toEqual(mockChart1);
    });

    it('should reflect updated person2 from store', () => {
      mockSynastryStore.person2 = mockChart2;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.person2).toEqual(mockChart2);
    });

    it('should reflect updated score from store', () => {
      mockSynastryStore.score = 75;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.score).toBe(75);
    });

    it('should reflect updated breakdown from store', () => {
      mockSynastryStore.breakdown = mockBreakdown;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.breakdown).toEqual(mockBreakdown);
    });

    it('should reflect updated comparison from store', () => {
      mockSynastryStore.comparison = mockComparison;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.comparison).toEqual(mockComparison);
    });

    it('should reflect updated aspects from store', () => {
      mockSynastryStore.aspects = mockAspects;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.aspects).toEqual(mockAspects);
    });

    it('should reflect loading state from store', () => {
      mockSynastryStore.isLoading = true;

      const { result } = renderHook(() => useSynastry());

      expect(result.current.isLoading).toBe(true);
    });

    it('should reflect error state from store', () => {
      mockSynastryStore.error = 'Comparison failed';

      const { result } = renderHook(() => useSynastry());

      expect(result.current.error).toBe('Comparison failed');
    });
  });
});
