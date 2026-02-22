/**
 * Synastry API Service Tests
 * Testing synastry API service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  compareCharts,
  getCompatibility,
  generateCompatibilityReport,
  getSynastryReports,
  getSynastryReport,
  updateSynastryReport,
  deleteSynastryReport,
  createSynastryController,
  SynastryServiceError,
} from '../../services/synastry.api';
import {
  mockSynastryChart,
  createMockResponse,
  createMockError,
} from './utils';

// Mock the api module with hoisted mock
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Import after mock
import api from '../../services/api';

describe('synastry.api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('compareCharts', () => {
    it('should compare two charts and return synastry data', async () => {
      const mockResponse = createMockResponse(mockSynastryChart);
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await compareCharts('chart-1', 'chart-2');

      expect(api.post).toHaveBeenCalledWith(
        '/synastry/compare',
        { chart1Id: 'chart-1', chart2Id: 'chart-2' },
        { timeout: 60000 }
      );
      expect(result.chart1Id).toBe('chart-1');
      expect(result.chart2Id).toBe('chart-2');
      expect(result.overallCompatibility).toBe(85);
    });

    it('should use correct timeout for synastry calculations', async () => {
      const mockResponse = createMockResponse(mockSynastryChart);
      (api.post as any).mockResolvedValue(mockResponse);

      await compareCharts('chart-1', 'chart-2');

      expect(api.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({ timeout: 60000 })
      );
    });

    it('should throw SynastryServiceError on failure', async () => {
      const mockError = createMockError('Comparison failed', 500);
      (api.post as any).mockRejectedValue(mockError);

      await expect(compareCharts('chart-1', 'chart-2')).rejects.toThrow(SynastryServiceError);
    });

    it('should throw error with INVALID_RESPONSE code when no data', async () => {
      (api.post as any).mockResolvedValue({ data: null });

      await expect(compareCharts('chart-1', 'chart-2')).rejects.toThrow('Invalid response');
    });

    it('should mark timeout errors as retryable', async () => {
      const timeoutError = new Error('timeout exceeded');
      (api.post as any).mockRejectedValue(timeoutError);

      try {
        await compareCharts('chart-1', 'chart-2', 1); // Only 1 retry
      } catch (error) {
        expect(error).toBeInstanceOf(SynastryServiceError);
        expect((error as SynastryServiceError).retryable).toBe(true);
      }
    });

    it('should implement retry with exponential backoff', async () => {
      const mockError = new Error('ECONNABORTED');
      const mockResponse = createMockResponse(mockSynastryChart);

      (api.post as any)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockResponse);

      const result = await compareCharts('chart-1', 'chart-2', 2);

      expect(result).toBeDefined();
      expect(api.post).toHaveBeenCalledTimes(2);
    });

    it('should preserve SynastryServiceError on re-throw', async () => {
      const customError = new SynastryServiceError('Custom error', 'CUSTOM');
      (api.post as any).mockRejectedValue(customError);

      await expect(compareCharts('chart-1', 'chart-2')).rejects.toThrow('Custom error');
    });
  });

  describe('getCompatibility', () => {
    it('should get compatibility scores between two charts', async () => {
      const mockCompatibilityData = {
        chart1Id: 'chart-1',
        chart2Id: 'chart-2',
        scores: {
          overall: 85,
          romantic: 90,
          communication: 80,
          emotional: 88,
          intellectual: 75,
          spiritual: 70,
          values: 82,
        },
        elementalBalance: {
          fire: 25,
          earth: 25,
          air: 25,
          water: 25,
          balance: 'well-balanced' as const,
        },
      };
      const mockResponse = createMockResponse(mockCompatibilityData);
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await getCompatibility('chart-1', 'chart-2');

      expect(api.post).toHaveBeenCalledWith(
        '/synastry/compatibility',
        { chart1Id: 'chart-1', chart2Id: 'chart-2', includeComposite: false },
        expect.objectContaining({ timeout: 60000 })
      );
      expect(result.scores.overall).toBe(85);
    });

    it('should include composite chart when requested', async () => {
      const mockCompatibilityData = {
        chart1Id: 'chart-1',
        chart2Id: 'chart-2',
        scores: { overall: 85, romantic: 90, communication: 80, emotional: 88, intellectual: 75, spiritual: 70, values: 82 },
        elementalBalance: { fire: 25, earth: 25, air: 25, water: 25, balance: 'balanced' as const },
        compositeChart: {
          chart1Id: 'chart-1',
          chart2Id: 'chart-2',
          planets: {},
          interpretation: 'A harmonious blend of energies',
        },
      };
      const mockResponse = createMockResponse(mockCompatibilityData);
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await getCompatibility('chart-1', 'chart-2', true);

      expect(api.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ includeComposite: true }),
        expect.any(Object)
      );
      expect(result.compositeChart).toBeDefined();
    });

    it('should pass AbortSignal for cancellation', async () => {
      const mockResponse = createMockResponse({
        chart1Id: 'chart-1',
        chart2Id: 'chart-2',
        scores: { overall: 80, romantic: 80, communication: 80, emotional: 80, intellectual: 80, spiritual: 80, values: 80 },
        elementalBalance: { fire: 25, earth: 25, air: 25, water: 25, balance: 'balanced' as const },
      });
      (api.post as any).mockResolvedValue(mockResponse);

      const controller = new AbortController();
      await getCompatibility('chart-1', 'chart-2', false, controller.signal);

      expect(api.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({ signal: controller.signal })
      );
    });

    it('should throw SynastryServiceError on failure', async () => {
      const mockError = createMockError('Compatibility check failed', 500);
      (api.post as any).mockRejectedValue(mockError);

      await expect(getCompatibility('chart-1', 'chart-2')).rejects.toThrow(SynastryServiceError);
    });
  });

  describe('createSynastryController', () => {
    it('should create an AbortController', () => {
      const controller = createSynastryController();

      expect(controller).toBeInstanceOf(AbortController);
      expect(controller.signal).toBeDefined();
      expect(typeof controller.abort).toBe('function');
    });
  });

  describe('generateCompatibilityReport', () => {
    it('should generate full compatibility report', async () => {
      const synastryResponse = createMockResponse(mockSynastryChart);
      const compatibilityResponse = createMockResponse({
        chart1Id: 'chart-1',
        chart2Id: 'chart-2',
        scores: { overall: 85, romantic: 90, communication: 80, emotional: 88, intellectual: 75, spiritual: 70, values: 82 },
        elementalBalance: { fire: 25, earth: 25, air: 25, water: 25, balance: 'well-balanced' as const },
      });

      (api.post as any)
        .mockResolvedValueOnce(synastryResponse)
        .mockResolvedValueOnce(compatibilityResponse);

      const result = await generateCompatibilityReport('chart-1', 'chart-2');

      expect(result.user1Id).toBe('chart-1');
      expect(result.user2Id).toBe('chart-2');
      expect(result.scores.overall).toBe(85);
      expect(result.strengths).toEqual(['Deep emotional bond', 'Shared values']);
      expect(result.challenges).toEqual(['Need for independence']);
    });

    it('should fetch both synastry and compatibility in parallel', async () => {
      const synastryResponse = createMockResponse(mockSynastryChart);
      const compatibilityResponse = createMockResponse({
        chart1Id: 'chart-1',
        chart2Id: 'chart-2',
        scores: { overall: 85, romantic: 90, communication: 80, emotional: 88, intellectual: 75, spiritual: 70, values: 82 },
        elementalBalance: { fire: 25, earth: 25, air: 25, water: 25, balance: 'balanced' as const },
      });

      (api.post as any).mockResolvedValueOnce(synastryResponse)
        .mockResolvedValueOnce(compatibilityResponse);

      await generateCompatibilityReport('chart-1', 'chart-2');

      expect(api.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('getSynastryReports', () => {
    it('should fetch paginated synastry reports', async () => {
      const mockResponse = {
        data: {
          data: {
            reports: [mockSynastryChart],
            pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
          },
        },
      };
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await getSynastryReports(1, 10);

      expect(api.get).toHaveBeenCalledWith('/synastry/reports', {
        params: { page: 1, limit: 10 },
      });
      expect(result.reports).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
    });

    it('should use default pagination values', async () => {
      const mockResponse = {
        data: {
          data: {
            reports: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
          },
        },
      };
      (api.get as any).mockResolvedValue(mockResponse);

      await getSynastryReports();

      expect(api.get).toHaveBeenCalledWith('/synastry/reports', {
        params: { page: 1, limit: 10 },
      });
    });
  });

  describe('getSynastryReport', () => {
    it('should fetch a specific synastry report', async () => {
      const mockResponse = createMockResponse({
        ...mockSynastryChart,
        createdAt: '2024-01-01T00:00:00Z',
      });
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await getSynastryReport('synastry-123');

      expect(api.get).toHaveBeenCalledWith('/synastry/reports/synastry-123');
      expect(result.id).toBe('synastry-123');
    });

    it('should handle report not found', async () => {
      const mockError = createMockError('Report not found', 404);
      (api.get as any).mockRejectedValue(mockError);

      await expect(getSynastryReport('nonexistent')).rejects.toThrow();
    });
  });

  describe('updateSynastryReport', () => {
    it('should update synastry report notes', async () => {
      (api.patch as any).mockResolvedValue({ data: {} });

      await updateSynastryReport('synastry-123', {
        notes: 'Updated notes',
      });

      expect(api.patch).toHaveBeenCalledWith('/synastry/reports/synastry-123', {
        notes: 'Updated notes',
      });
    });

    it('should update favorite status', async () => {
      (api.patch as any).mockResolvedValue({ data: {} });

      await updateSynastryReport('synastry-123', {
        isFavorite: true,
      });

      expect(api.patch).toHaveBeenCalledWith('/synastry/reports/synastry-123', {
        isFavorite: true,
      });
    });

    it('should handle update errors', async () => {
      const mockError = createMockError('Update failed', 500);
      (api.patch as any).mockRejectedValue(mockError);

      await expect(
        updateSynastryReport('synastry-123', { notes: 'test' })
      ).rejects.toThrow();
    });
  });

  describe('deleteSynastryReport', () => {
    it('should delete a synastry report', async () => {
      (api.delete as any).mockResolvedValue({ data: {} });

      await deleteSynastryReport('synastry-123');

      expect(api.delete).toHaveBeenCalledWith('/synastry/reports/synastry-123');
    });

    it('should handle delete errors', async () => {
      const mockError = createMockError('Delete failed', 500);
      (api.delete as any).mockRejectedValue(mockError);

      await expect(deleteSynastryReport('synastry-123')).rejects.toThrow();
    });
  });

  describe('SynastryServiceError', () => {
    it('should create error with message and code', () => {
      const error = new SynastryServiceError('Test error', 'TEST_CODE');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('SynastryServiceError');
    });

    it('should create error with status code', () => {
      const error = new SynastryServiceError('Not found', 'NOT_FOUND', 404);

      expect(error.statusCode).toBe(404);
    });

    it('should create error with retryable flag', () => {
      const error = new SynastryServiceError('Timeout', 'TIMEOUT', undefined, true);

      expect(error.retryable).toBe(true);
    });

    it('should default retryable to false', () => {
      const error = new SynastryServiceError('Error', 'CODE');

      expect(error.retryable).toBe(false);
    });

    it('should be instance of Error', () => {
      const error = new SynastryServiceError('Test', 'CODE');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(SynastryServiceError);
    });
  });
});
