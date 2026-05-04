/**
 * Report Service Tests
 * Comprehensive tests for report generation API calls
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reportService } from '../../services/report.service';
import type { ReportRequest, ReportResponse, ApiResponse } from '../../types/api.types';
import { setupLocalStorageMock } from './utils';

// Helper to create mock axios response
const createMockResponse = <T>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
});

// Mock the api module
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../../services/api';

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('reportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupLocalStorageMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateReport', () => {
    const mockRequest: ReportRequest = {
      type: 'personality',
      chartId: 'chart-1',
      format: 'pdf',
      includeAnalysis: true,
      includeCharts: true,
      includeAspects: true,
    };

    const mockResponse: ReportResponse = {
      id: 'report-1',
      type: 'personality',
      status: 'processing',
      format: 'pdf',
      createdAt: '2024-01-15T00:00:00Z',
    };

    it('should generate a new report', async () => {
      const response: ApiResponse<ReportResponse> = { success: true, data: mockResponse };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      const result = await reportService.generateReport(mockRequest);

      expect(mockApi.post).toHaveBeenCalledWith('/reports', mockRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should generate a transit report with date range', async () => {
      const transitRequest: ReportRequest = {
        ...mockRequest,
        type: 'transit',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
      };
      const transitResponse = { ...mockResponse, type: 'transit' as const };
      const response: ApiResponse<ReportResponse> = { success: true, data: transitResponse };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      const result = await reportService.generateReport(transitRequest);

      expect(result.type).toBe('transit');
    });

    it('should generate a synastry report with two charts', async () => {
      const synastryRequest: ReportRequest = {
        ...mockRequest,
        type: 'synastry',
        chart2Id: 'chart-2',
      };
      const response: ApiResponse<ReportResponse> = {
        success: true,
        data: { ...mockResponse, type: 'synastry' as const },
      };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      const result = await reportService.generateReport(synastryRequest);

      expect(mockApi.post).toHaveBeenCalledWith('/reports', synastryRequest);
      expect(result.type).toBe('synastry');
    });

    it('should generate a solar return report with year', async () => {
      const solarRequest: ReportRequest = {
        ...mockRequest,
        type: 'solar-return',
        year: 2024,
      };
      const response: ApiResponse<ReportResponse> = {
        success: true,
        data: { ...mockResponse, type: 'solar-return' as const },
      };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      const result = await reportService.generateReport(solarRequest);

      expect(result.type).toBe('solar-return');
    });

    it('should handle error with error field', async () => {
      const response: ApiResponse<ReportResponse> = {
        success: false,
        data: mockResponse,
        error: 'Report generation failed',
      };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      await expect(reportService.generateReport(mockRequest)).rejects.toThrow(
        'Report generation failed',
      );
    });

    it('should handle error without error field', async () => {
      const response: ApiResponse<ReportResponse> = { success: false, data: mockResponse };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      await expect(reportService.generateReport(mockRequest)).rejects.toThrow(
        'Failed to generate report',
      );
    });

    it('should handle non-Error thrown', async () => {
      mockApi.post.mockRejectedValueOnce('Network error');

      await expect(reportService.generateReport(mockRequest)).rejects.toThrow(
        'Failed to generate report',
      );
    });
  });

  describe('getReportStatus', () => {
    const mockResponse: ReportResponse = {
      id: 'report-1',
      type: 'personality',
      status: 'completed',
      format: 'pdf',
      downloadUrl: 'https://example.com/report.pdf',
      expiresAt: '2024-02-15T00:00:00Z',
      createdAt: '2024-01-15T00:00:00Z',
      completedAt: '2024-01-15T00:05:00Z',
    };

    it('should get report status by ID', async () => {
      const response: ApiResponse<ReportResponse> = { success: true, data: mockResponse };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await reportService.getReportStatus('report-1');

      expect(mockApi.get).toHaveBeenCalledWith('/reports/report-1');
      expect(result.status).toBe('completed');
    });

    it('should return pending status for processing report', async () => {
      const pendingResponse = {
        ...mockResponse,
        status: 'pending' as const,
        downloadUrl: undefined,
      };
      const response: ApiResponse<ReportResponse> = { success: true, data: pendingResponse };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await reportService.getReportStatus('report-1');

      expect(result.status).toBe('pending');
    });

    it('should return failed status for failed report', async () => {
      const failedResponse = {
        ...mockResponse,
        status: 'failed' as const,
        error: 'Generation failed',
      };
      const response: ApiResponse<ReportResponse> = { success: true, data: failedResponse };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await reportService.getReportStatus('report-1');

      expect(result.status).toBe('failed');
    });

    it('should handle error when getting status', async () => {
      const response: ApiResponse<ReportResponse> = {
        success: false,
        data: mockResponse,
        error: 'Report not found',
      };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      await expect(reportService.getReportStatus('invalid-id')).rejects.toThrow('Report not found');
    });
  });

  describe('downloadReport', () => {
    it('should download report as blob', async () => {
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
      mockApi.get.mockResolvedValueOnce({ data: mockBlob, status: 200 });

      const result = await reportService.downloadReport('report-1');

      expect(mockApi.get).toHaveBeenCalledWith('/reports/report-1/download', {
        responseType: 'blob',
      });
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle download error', async () => {
      const error = new Error('Download failed');
      mockApi.get.mockRejectedValueOnce(error);

      await expect(reportService.downloadReport('report-1')).rejects.toThrow('Download failed');
    });

    it('should handle non-Error thrown during download', async () => {
      mockApi.get.mockRejectedValueOnce('Network error');

      await expect(reportService.downloadReport('report-1')).rejects.toThrow(
        'Failed to download report',
      );
    });
  });

  describe('deleteReport', () => {
    it('should delete a report successfully', async () => {
      const response: ApiResponse<void> = { success: true, data: undefined as unknown as void };
      mockApi.delete.mockResolvedValueOnce(createMockResponse(response));

      await reportService.deleteReport('report-1');

      expect(mockApi.delete).toHaveBeenCalledWith('/reports/report-1');
    });

    it('should handle delete error with error field', async () => {
      const response: ApiResponse<void> = {
        success: false,
        data: undefined as unknown as void,
        error: 'Cannot delete report',
      };
      mockApi.delete.mockResolvedValueOnce(createMockResponse(response));

      await expect(reportService.deleteReport('report-1')).rejects.toThrow('Cannot delete report');
    });

    it('should handle delete error without error field', async () => {
      const response: ApiResponse<void> = { success: false, data: undefined as unknown as void };
      mockApi.delete.mockResolvedValueOnce(createMockResponse(response));

      await expect(reportService.deleteReport('report-1')).rejects.toThrow(
        'Failed to delete report',
      );
    });

    it('should handle non-Error thrown during delete', async () => {
      mockApi.delete.mockRejectedValueOnce('Network error');

      await expect(reportService.deleteReport('report-1')).rejects.toThrow(
        'Failed to delete report',
      );
    });
  });

  describe('listReports', () => {
    const mockReports: ReportResponse[] = [
      {
        id: 'report-1',
        type: 'personality',
        status: 'completed',
        format: 'pdf',
        downloadUrl: 'https://example.com/report1.pdf',
        createdAt: '2024-01-10T00:00:00Z',
      },
      {
        id: 'report-2',
        type: 'transit',
        status: 'completed',
        format: 'pdf',
        downloadUrl: 'https://example.com/report2.pdf',
        createdAt: '2024-01-15T00:00:00Z',
      },
    ];

    it('should list all reports for current user', async () => {
      const response: ApiResponse<ReportResponse[]> = { success: true, data: mockReports };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await reportService.listReports();

      expect(mockApi.get).toHaveBeenCalledWith('/reports');
      expect(result).toEqual(mockReports);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no reports', async () => {
      const response: ApiResponse<ReportResponse[]> = { success: true, data: [] };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await reportService.listReports();

      expect(result).toEqual([]);
    });

    it('should handle error when listing reports', async () => {
      const response: ApiResponse<ReportResponse[]> = {
        success: false,
        data: [],
        error: 'Unauthorized',
      };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      await expect(reportService.listReports()).rejects.toThrow('Unauthorized');
    });

    it('should handle non-Error thrown', async () => {
      mockApi.get.mockRejectedValueOnce('Network error');

      await expect(reportService.listReports()).rejects.toThrow('Failed to list reports');
    });
  });

  describe('retryReport', () => {
    const mockResponse: ReportResponse = {
      id: 'report-1',
      type: 'personality',
      status: 'processing',
      format: 'pdf',
      createdAt: '2024-01-15T00:00:00Z',
    };

    it('should retry a failed report', async () => {
      const response: ApiResponse<ReportResponse> = { success: true, data: mockResponse };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      const result = await reportService.retryReport('report-1');

      expect(mockApi.post).toHaveBeenCalledWith('/reports/report-1/retry');
      expect(result.status).toBe('processing');
    });

    it('should handle retry error with error field', async () => {
      const response: ApiResponse<ReportResponse> = {
        success: false,
        data: mockResponse,
        error: 'Cannot retry report',
      };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      await expect(reportService.retryReport('report-1')).rejects.toThrow('Cannot retry report');
    });

    it('should handle retry error without error field', async () => {
      const response: ApiResponse<ReportResponse> = { success: false, data: mockResponse };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      await expect(reportService.retryReport('report-1')).rejects.toThrow('Failed to retry report');
    });

    it('should handle non-Error thrown during retry', async () => {
      mockApi.post.mockRejectedValueOnce('Network error');

      await expect(reportService.retryReport('report-1')).rejects.toThrow('Failed to retry report');
    });
  });
});
