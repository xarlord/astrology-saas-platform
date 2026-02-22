/**
 * Tests for useReports Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReports } from '../../hooks/useReports';
import type { Report, ReportRequest } from '../../stores/reportStore';

// Mock report data
const mockReportRequest: ReportRequest = {
  type: 'personality',
  chartId: 'chart-1',
  format: 'pdf',
  includeAnalysis: true,
  includeCharts: true,
  includeAspects: true,
};

const mockPendingReport: Report = {
  id: 'report-1',
  type: 'personality',
  status: 'pending',
  format: 'pdf',
  createdAt: '2024-01-01T00:00:00Z',
  request: mockReportRequest,
};

const mockProcessingReport: Report = {
  id: 'report-2',
  type: 'transit',
  status: 'processing',
  format: 'pdf',
  createdAt: '2024-01-02T00:00:00Z',
  request: { ...mockReportRequest, type: 'transit' },
};

const mockCompletedReport: Report = {
  id: 'report-3',
  type: 'synastry',
  status: 'completed',
  format: 'pdf',
  downloadUrl: 'https://example.com/reports/report-3.pdf',
  expiresAt: '2024-02-01T00:00:00Z',
  createdAt: '2024-01-03T00:00:00Z',
  completedAt: '2024-01-03T00:05:00Z',
  request: { ...mockReportRequest, type: 'synastry', chart2Id: 'chart-2' },
};

const mockFailedReport: Report = {
  id: 'report-4',
  type: 'solar-return',
  status: 'failed',
  format: 'json',
  error: 'Generation failed: Server error',
  createdAt: '2024-01-04T00:00:00Z',
  request: { ...mockReportRequest, type: 'solar-return', year: 2024 },
};

// Mock the report store
const mockReportStore = {
  reports: {} as Record<string, Report>,
  activeReportId: null as string | null,
  isGenerating: false,
  setReport: vi.fn(),
  removeReport: vi.fn(),
  setActiveReport: vi.fn(),
  clearCompleted: vi.fn(),
  clearAll: vi.fn(),
  generateReport: vi.fn(),
  retryReport: vi.fn(),
  cancelReport: vi.fn(),
};

vi.mock('../../stores', () => ({
  useReportStore: vi.fn((selector?: (state: typeof mockReportStore) => unknown) => {
    if (selector) {
      return selector(mockReportStore);
    }
    return mockReportStore;
  }),
}));

describe('useReports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReportStore.reports = {};
    mockReportStore.activeReportId = null;
    mockReportStore.isGenerating = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return reports as empty array initially', () => {
      const { result } = renderHook(() => useReports());

      expect(result.current.reports).toEqual([]);
      expect(result.current.activeReport).toBeNull();
      expect(result.current.activeReportId).toBeNull();
      expect(result.current.isGenerating).toBe(false);
    });

    it('should return all expected properties', () => {
      const { result } = renderHook(() => useReports());

      // State
      expect(result.current).toHaveProperty('reports');
      expect(result.current).toHaveProperty('activeReport');
      expect(result.current).toHaveProperty('activeReportId');
      expect(result.current).toHaveProperty('isGenerating');

      // Methods
      expect(typeof result.current.generateReport).toBe('function');
      expect(typeof result.current.retryReport).toBe('function');
      expect(typeof result.current.cancelReport).toBe('function');
      expect(typeof result.current.setActiveReport).toBe('function');
      expect(typeof result.current.removeReport).toBe('function');
      expect(typeof result.current.clearCompleted).toBe('function');
      expect(typeof result.current.clearAll).toBe('function');

      // Computed
      expect(typeof result.current.getReportById).toBe('function');
      expect(typeof result.current.getReportsByType).toBe('function');
      expect(typeof result.current.getPendingReports).toBe('function');
      expect(typeof result.current.getCompletedReports).toBe('function');
      expect(typeof result.current.getFailedReports).toBe('function');
      expect(typeof result.current.downloadReport).toBe('function');
    });
  });

  describe('generateReport', () => {
    it('should call store generateReport and return report on success', async () => {
      mockReportStore.generateReport.mockResolvedValueOnce(mockCompletedReport);

      const { result } = renderHook(() => useReports());

      let generatedReport: Report | null | undefined;
      await act(async () => {
        generatedReport = await result.current.generateReport(mockReportRequest);
      });

      expect(mockReportStore.generateReport).toHaveBeenCalledWith(mockReportRequest, undefined);
      expect(generatedReport).toEqual(mockCompletedReport);
    });

    it('should pass options to generateReport', async () => {
      mockReportStore.generateReport.mockResolvedValueOnce(mockCompletedReport);

      const options = {
        onProgress: vi.fn(),
        onComplete: vi.fn(),
        onError: vi.fn(),
      };

      const { result } = renderHook(() => useReports());

      await act(async () => {
        await result.current.generateReport(mockReportRequest, options);
      });

      expect(mockReportStore.generateReport).toHaveBeenCalledWith(mockReportRequest, options);
    });

    it('should return null on generateReport failure', async () => {
      mockReportStore.generateReport.mockRejectedValueOnce(new Error('Generation failed'));

      const { result } = renderHook(() => useReports());

      let generatedReport: Report | null | undefined;
      await act(async () => {
        generatedReport = await result.current.generateReport(mockReportRequest);
      });

      expect(generatedReport).toBeNull();
    });

    it('should call onError callback on failure', async () => {
      mockReportStore.generateReport.mockRejectedValueOnce(new Error('Generation failed'));

      const onError = vi.fn();
      const { result } = renderHook(() => useReports());

      await act(async () => {
        await result.current.generateReport(mockReportRequest, { onError });
      });

      expect(onError).toHaveBeenCalledWith('Generation failed');
    });

    it('should handle non-Error thrown values', async () => {
      mockReportStore.generateReport.mockRejectedValueOnce('String error');

      const onError = vi.fn();
      const { result } = renderHook(() => useReports());

      await act(async () => {
        await result.current.generateReport(mockReportRequest, { onError });
      });

      expect(onError).toHaveBeenCalledWith('Failed to generate report');
    });
  });

  describe('retryReport', () => {
    it('should call store retryReport and return report on success', async () => {
      mockReportStore.retryReport.mockResolvedValueOnce(mockCompletedReport);

      const { result } = renderHook(() => useReports());

      let retriedReport: Report | null | undefined;
      await act(async () => {
        retriedReport = await result.current.retryReport('report-4');
      });

      expect(mockReportStore.retryReport).toHaveBeenCalledWith('report-4');
      expect(retriedReport).toEqual(mockCompletedReport);
    });

    it('should return null on retryReport failure', async () => {
      mockReportStore.retryReport.mockRejectedValueOnce(new Error('Retry failed'));

      const { result } = renderHook(() => useReports());

      let retriedReport: Report | null | undefined;
      await act(async () => {
        retriedReport = await result.current.retryReport('report-4');
      });

      expect(retriedReport).toBeNull();
    });
  });

  describe('getReportById', () => {
    it('should return report by id', () => {
      mockReportStore.reports = {
        'report-1': mockPendingReport,
        'report-3': mockCompletedReport,
      };

      const { result } = renderHook(() => useReports());

      expect(result.current.getReportById('report-1')).toEqual(mockPendingReport);
      expect(result.current.getReportById('report-3')).toEqual(mockCompletedReport);
    });

    it('should return undefined for non-existent report', () => {
      const { result } = renderHook(() => useReports());

      expect(result.current.getReportById('non-existent')).toBeUndefined();
    });
  });

  describe('getReportsByType', () => {
    it('should filter reports by type', () => {
      mockReportStore.reports = {
        'report-1': mockPendingReport, // personality
        'report-2': mockProcessingReport, // transit
        'report-3': mockCompletedReport, // synastry
      };

      const { result } = renderHook(() => useReports());

      const personalityReports = result.current.getReportsByType('personality');
      expect(personalityReports).toHaveLength(1);
      expect(personalityReports[0].id).toBe('report-1');

      const transitReports = result.current.getReportsByType('transit');
      expect(transitReports).toHaveLength(1);
      expect(transitReports[0].id).toBe('report-2');
    });

    it('should return empty array when no reports match type', () => {
      mockReportStore.reports = {
        'report-1': mockPendingReport,
      };

      const { result } = renderHook(() => useReports());

      expect(result.current.getReportsByType('solar-return')).toEqual([]);
    });

    it('should return empty array when no reports exist', () => {
      const { result } = renderHook(() => useReports());

      expect(result.current.getReportsByType('personality')).toEqual([]);
    });
  });

  describe('getPendingReports', () => {
    it('should return pending and processing reports', () => {
      mockReportStore.reports = {
        'report-1': mockPendingReport, // pending
        'report-2': mockProcessingReport, // processing
        'report-3': mockCompletedReport, // completed
        'report-4': mockFailedReport, // failed
      };

      const { result } = renderHook(() => useReports());

      const pendingReports = result.current.getPendingReports();
      expect(pendingReports).toHaveLength(2);
      expect(pendingReports.map((r) => r.id)).toContain('report-1');
      expect(pendingReports.map((r) => r.id)).toContain('report-2');
    });

    it('should return empty array when no pending reports', () => {
      mockReportStore.reports = {
        'report-3': mockCompletedReport,
        'report-4': mockFailedReport,
      };

      const { result } = renderHook(() => useReports());

      expect(result.current.getPendingReports()).toEqual([]);
    });
  });

  describe('getCompletedReports', () => {
    it('should return completed reports', () => {
      mockReportStore.reports = {
        'report-1': mockPendingReport,
        'report-2': mockProcessingReport,
        'report-3': mockCompletedReport,
        'report-4': mockFailedReport,
      };

      const { result } = renderHook(() => useReports());

      const completedReports = result.current.getCompletedReports();
      expect(completedReports).toHaveLength(1);
      expect(completedReports[0].id).toBe('report-3');
    });

    it('should return empty array when no completed reports', () => {
      mockReportStore.reports = {
        'report-1': mockPendingReport,
      };

      const { result } = renderHook(() => useReports());

      expect(result.current.getCompletedReports()).toEqual([]);
    });
  });

  describe('getFailedReports', () => {
    it('should return failed reports', () => {
      mockReportStore.reports = {
        'report-1': mockPendingReport,
        'report-3': mockCompletedReport,
        'report-4': mockFailedReport,
      };

      const { result } = renderHook(() => useReports());

      const failedReports = result.current.getFailedReports();
      expect(failedReports).toHaveLength(1);
      expect(failedReports[0].id).toBe('report-4');
    });

    it('should return empty array when no failed reports', () => {
      mockReportStore.reports = {
        'report-3': mockCompletedReport,
      };

      const { result } = renderHook(() => useReports());

      expect(result.current.getFailedReports()).toEqual([]);
    });
  });

  describe('getActiveReport', () => {
    it('should return active report when set', () => {
      mockReportStore.reports = {
        'report-3': mockCompletedReport,
      };
      mockReportStore.activeReportId = 'report-3';

      const { result } = renderHook(() => useReports());

      expect(result.current.activeReport).toEqual(mockCompletedReport);
    });

    it('should return null when no active report id', () => {
      mockReportStore.activeReportId = null;

      const { result } = renderHook(() => useReports());

      expect(result.current.activeReport).toBeNull();
    });

    it('should return null when active report id does not exist', () => {
      mockReportStore.reports = {};
      mockReportStore.activeReportId = 'non-existent';

      const { result } = renderHook(() => useReports());

      expect(result.current.activeReport).toBeNull();
    });
  });

  describe('downloadReport', () => {
    it('should create download link with correct properties', () => {
      // Render hook first before mocking
      const { result } = renderHook(() => useReports());

      // Create a mock link element
      const mockClick = vi.fn();
      const mockLink = {
        _href: '',
        _download: '',
        click: mockClick,
        get href() { return this._href; },
        set href(v) { this._href = v; },
        get download() { return this._download; },
        set download(v) { this._download = v; },
      };

      // Store original createElement
      const originalCreateElement = document.createElement.bind(document);

      // Track calls
      let createdElement: string | null = null;
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        createdElement = tagName;
        if (tagName === 'a') {
          return mockLink as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tagName);
      });

      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue(null as unknown as Node);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue(null as unknown as Node);

      act(() => {
        result.current.downloadReport(mockCompletedReport);
      });

      expect(createdElement).toBe('a');
      expect(mockLink._href).toBe('https://example.com/reports/report-3.pdf');
      expect(mockLink._download).toBe('report-synastry-report-3.pdf');
      expect(mockClick).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('should not download if report has no downloadUrl', () => {
      // Render hook first before mocking
      const { result } = renderHook(() => useReports());

      const mockClick = vi.fn();
      const mockLink = {
        _href: '',
        _download: '',
        click: mockClick,
        get href() { return this._href; },
        set href(v) { this._href = v; },
        get download() { return this._download; },
        set download(v) { this._download = v; },
      };

      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockLink as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tagName);
      });

      const reportWithoutUrl: Report = {
        ...mockPendingReport,
        downloadUrl: undefined,
      };

      act(() => {
        result.current.downloadReport(reportWithoutUrl);
      });

      expect(mockClick).not.toHaveBeenCalled();

      createElementSpy.mockRestore();
    });

    it('should handle different report formats', () => {
      // Render hook first before mocking
      const { result } = renderHook(() => useReports());

      const mockClick = vi.fn();
      const mockLink = {
        _href: '',
        _download: '',
        click: mockClick,
        get href() { return this._href; },
        set href(v) { this._href = v; },
        get download() { return this._download; },
        set download(v) { this._download = v; },
      };

      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockLink as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tagName);
      });

      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue(null as unknown as Node);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue(null as unknown as Node);

      const jsonReport: Report = {
        ...mockCompletedReport,
        format: 'json',
        downloadUrl: 'https://example.com/reports/report.json',
      };

      act(() => {
        result.current.downloadReport(jsonReport);
      });

      expect(mockLink._download).toContain('.json');

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });

  describe('utility methods', () => {
    it('should expose cancelReport from store', () => {
      const { result } = renderHook(() => useReports());

      act(() => {
        result.current.cancelReport('report-1');
      });

      expect(mockReportStore.cancelReport).toHaveBeenCalledWith('report-1');
    });

    it('should expose setActiveReport from store', () => {
      const { result } = renderHook(() => useReports());

      act(() => {
        result.current.setActiveReport('report-1');
      });

      expect(mockReportStore.setActiveReport).toHaveBeenCalledWith('report-1');
    });

    it('should expose removeReport from store', () => {
      const { result } = renderHook(() => useReports());

      act(() => {
        result.current.removeReport('report-1');
      });

      expect(mockReportStore.removeReport).toHaveBeenCalledWith('report-1');
    });

    it('should expose clearCompleted from store', () => {
      const { result } = renderHook(() => useReports());

      act(() => {
        result.current.clearCompleted();
      });

      expect(mockReportStore.clearCompleted).toHaveBeenCalled();
    });

    it('should expose clearAll from store', () => {
      const { result } = renderHook(() => useReports());

      act(() => {
        result.current.clearAll();
      });

      expect(mockReportStore.clearAll).toHaveBeenCalled();
    });
  });

  describe('reports state', () => {
    it('should return reports as array', () => {
      mockReportStore.reports = {
        'report-1': mockPendingReport,
        'report-3': mockCompletedReport,
      };

      const { result } = renderHook(() => useReports());

      expect(result.current.reports).toHaveLength(2);
      expect(result.current.reports.map((r) => r.id)).toContain('report-1');
      expect(result.current.reports.map((r) => r.id)).toContain('report-3');
    });

    it('should reflect isGenerating state', () => {
      mockReportStore.isGenerating = true;

      const { result } = renderHook(() => useReports());

      expect(result.current.isGenerating).toBe(true);
    });

    it('should reflect activeReportId state', () => {
      mockReportStore.activeReportId = 'report-1';

      const { result } = renderHook(() => useReports());

      expect(result.current.activeReportId).toBe('report-1');
    });
  });
});
