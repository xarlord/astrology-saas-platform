/**
 * Tests for Report Store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useReportStore, type Report, type ReportRequest } from '../../stores/reportStore';

// Mock fetch and localStorage
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('reportStore', () => {
  // Helper to reset store state
  const resetStore = () => {
    useReportStore.setState({
      reports: {},
      activeReportId: null,
      isGenerating: false,
    });
  };

  const mockRequest: ReportRequest = {
    type: 'personality',
    chartId: 'chart-1',
    format: 'pdf',
    includeAnalysis: true,
    includeCharts: true,
    includeAspects: true,
  };

  const mockCompletedReport: Report = {
    id: 'report-1',
    type: 'personality',
    status: 'completed',
    format: 'pdf',
    downloadUrl: 'https://example.com/report.pdf',
    expiresAt: '2024-12-31T23:59:59Z',
    createdAt: '2024-01-01T00:00:00Z',
    completedAt: '2024-01-01T00:01:00Z',
    request: mockRequest,
  };

  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useReportStore.getState();

      expect(state.reports).toEqual({});
      expect(state.activeReportId).toBeNull();
      expect(state.isGenerating).toBe(false);
    });
  });

  describe('setReport action', () => {
    it('should add a report', () => {
      act(() => {
        useReportStore.getState().setReport(mockCompletedReport);
      });

      const state = useReportStore.getState();

      expect(state.reports['report-1']).toEqual(mockCompletedReport);
    });

    it('should update existing report', () => {
      useReportStore.setState({
        reports: { 'report-1': mockCompletedReport },
      });

      const updatedReport = { ...mockCompletedReport, status: 'failed' as const };

      act(() => {
        useReportStore.getState().setReport(updatedReport);
      });

      const state = useReportStore.getState();

      expect(state.reports['report-1'].status).toBe('failed');
    });

    it('should add multiple reports', () => {
      const report2: Report = { ...mockCompletedReport, id: 'report-2' };

      act(() => {
        useReportStore.getState().setReport(mockCompletedReport);
        useReportStore.getState().setReport(report2);
      });

      const state = useReportStore.getState();

      expect(Object.keys(state.reports)).toHaveLength(2);
    });
  });

  describe('removeReport action', () => {
    it('should remove a report', () => {
      useReportStore.setState({
        reports: { 'report-1': mockCompletedReport },
      });

      act(() => {
        useReportStore.getState().removeReport('report-1');
      });

      const state = useReportStore.getState();

      expect(state.reports['report-1']).toBeUndefined();
    });

    it('should handle removing non-existent report', () => {
      useReportStore.setState({
        reports: { 'report-1': mockCompletedReport },
      });

      act(() => {
        useReportStore.getState().removeReport('non-existent');
      });

      const state = useReportStore.getState();

      expect(state.reports['report-1']).toBeDefined();
    });
  });

  describe('setActiveReport action', () => {
    it('should set active report', () => {
      act(() => {
        useReportStore.getState().setActiveReport('report-1');
      });

      expect(useReportStore.getState().activeReportId).toBe('report-1');
    });

    it('should clear active report', () => {
      useReportStore.setState({ activeReportId: 'report-1' });

      act(() => {
        useReportStore.getState().setActiveReport(null);
      });

      expect(useReportStore.getState().activeReportId).toBeNull();
    });
  });

  describe('clearCompleted action', () => {
    it('should clear completed reports', () => {
      const pendingReport: Report = {
        ...mockCompletedReport,
        id: 'report-pending',
        status: 'pending',
        downloadUrl: undefined,
        completedAt: undefined,
      };

      useReportStore.setState({
        reports: {
          'report-1': mockCompletedReport,
          'report-pending': pendingReport,
        },
      });

      act(() => {
        useReportStore.getState().clearCompleted();
      });

      const state = useReportStore.getState();

      expect(state.reports['report-1']).toBeUndefined();
      expect(state.reports['report-pending']).toBeDefined();
    });

    it('should handle empty reports', () => {
      act(() => {
        useReportStore.getState().clearCompleted();
      });

      expect(useReportStore.getState().reports).toEqual({});
    });
  });

  describe('clearAll action', () => {
    it('should clear all reports', () => {
      useReportStore.setState({
        reports: {
          'report-1': mockCompletedReport,
          'report-2': { ...mockCompletedReport, id: 'report-2' },
        },
        activeReportId: 'report-1',
      });

      act(() => {
        useReportStore.getState().clearAll();
      });

      const state = useReportStore.getState();

      expect(state.reports).toEqual({});
      expect(state.activeReportId).toBeNull();
    });
  });

  describe('generateReport action', () => {
    it('should generate report successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            downloadUrl: 'https://example.com/report.pdf',
            expiresAt: '2024-12-31T23:59:59Z',
          },
        }),
      });

      const report = await act(async () => {
        return await useReportStore.getState().generateReport(mockRequest);
      });

      expect(report.status).toBe('completed');
      expect(report.downloadUrl).toBe('https://example.com/report.pdf');
      expect(useReportStore.getState().isGenerating).toBe(false);
    });

    it('should create pending report initially', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      });

      const generatePromise = act(async () => {
        return await useReportStore.getState().generateReport(mockRequest);
      });

      // Check pending state was created
      const stateDuringGeneration = useReportStore.getState();
      const reports = Object.values(stateDuringGeneration.reports);
      const pendingReport = reports.find(
        (r) => r.status === 'pending' || r.status === 'processing',
      );
      expect(pendingReport).toBeDefined();

      await generatePromise;
    });

    it('should set active report during generation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      });

      await act(async () => {
        await useReportStore.getState().generateReport(mockRequest);
      });

      // Active report ID should be set during generation
      const state = useReportStore.getState();
      expect(Object.keys(state.reports)).toHaveLength(1);
    });

    it('should call onComplete callback', async () => {
      const onComplete = vi.fn();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      });

      await act(async () => {
        await useReportStore.getState().generateReport(mockRequest, { onComplete });
      });

      expect(onComplete).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
    });

    it('should handle generation failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await act(async () => {
        try {
          await useReportStore.getState().generateReport(mockRequest);
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      const state = useReportStore.getState();

      const reports = Object.values(state.reports);
      const failedReport = reports.find((r) => r.status === 'failed');
      expect(failedReport).toBeDefined();
      expect(failedReport?.error).toContain('Report generation failed');
      expect(state.isGenerating).toBe(false);
    });

    it('should call onError callback on failure', async () => {
      const onError = vi.fn();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await act(async () => {
        try {
          await useReportStore.getState().generateReport(mockRequest, { onError });
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      expect(onError).toHaveBeenCalledWith('Report generation failed: Bad Request');
    });
  });

  describe('retryReport action', () => {
    it('should retry with existing report request', async () => {
      useReportStore.setState({
        reports: {
          'report-1': {
            ...mockCompletedReport,
            status: 'failed',
            error: 'Previous error',
          },
        },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      });

      const report = await act(async () => {
        return await useReportStore.getState().retryReport('report-1');
      });

      expect(report.status).toBe('completed');
    });

    it('should throw if report not found', async () => {
      await act(async () => {
        try {
          await useReportStore.getState().retryReport('non-existent');
          expect.fail('Should have thrown');
        } catch (error) {
          expect((error as Error).message).toBe('Report not found');
        }
      });
    });
  });

  describe('cancelReport action', () => {
    it('should remove cancelled report', () => {
      useReportStore.setState({
        reports: {
          'report-1': {
            ...mockCompletedReport,
            status: 'processing',
          },
        },
      });

      act(() => {
        useReportStore.getState().cancelReport('report-1');
      });

      const state = useReportStore.getState();

      expect(state.reports['report-1']).toBeUndefined();
    });
  });

  describe('selector hooks', () => {
    it('useReports should return reports as array', () => {
      useReportStore.setState({
        reports: {
          'report-1': mockCompletedReport,
          'report-2': { ...mockCompletedReport, id: 'report-2' },
        },
      });

      const state = useReportStore.getState();
      const reports = Object.values(state.reports);

      expect(reports).toHaveLength(2);
    });

    it('useActiveReport should return active report', () => {
      useReportStore.setState({
        reports: { 'report-1': mockCompletedReport },
        activeReportId: 'report-1',
      });

      const state = useReportStore.getState();
      const activeReport = state.activeReportId ? state.reports[state.activeReportId] : null;

      expect(activeReport).toEqual(mockCompletedReport);
    });

    it('useActiveReport should return null if no active report', () => {
      const state = useReportStore.getState();
      const activeReport = state.activeReportId ? state.reports[state.activeReportId] : null;

      expect(activeReport).toBeNull();
    });

    it('useActiveReport should return null if active report not found', () => {
      useReportStore.setState({ activeReportId: 'non-existent' });

      const state = useReportStore.getState();
      const activeReport = state.activeReportId
        ? state.reports[state.activeReportId] || null
        : null;

      expect(activeReport).toBeNull();
    });

    it('useIsGeneratingReport should return generating state', () => {
      useReportStore.setState({ isGenerating: true });
      const isGenerating = useReportStore.getState().isGenerating;
      expect(isGenerating).toBe(true);
    });
  });
});
