/**
 * usePDFGeneration Hook Tests
 *
 * Tests for PDF generation hook functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Use vi.hoisted to create mock functions before the mock is registered
const { mockGenerateReport, mockDownloadPDF, mockPrintPDF } = vi.hoisted(() => ({
  mockGenerateReport: vi.fn(),
  mockDownloadPDF: vi.fn(),
  mockPrintPDF: vi.fn(),
}));

// Mock the PDF service
vi.mock('../../services/pdf.service', () => ({
  default: {
    generateReport: mockGenerateReport,
    downloadPDF: mockDownloadPDF,
    printPDF: mockPrintPDF,
  },
}));

// Import after mock
import {
  usePDFGeneration,
  getReportTypeName,
  getExpectedPageCount,
  generateReportFilename,
} from '../../hooks/usePDFGeneration';
import type { ReportType } from '../../services/pdf.service';

// ============================================================================
// TESTS
// ============================================================================

describe('usePDFGeneration Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => usePDFGeneration());

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.progress).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.lastGeneratedBlob).toBeNull();
    });
  });

  describe('generateReport', () => {
    it('should update progress during generation', async () => {
      const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
      mockGenerateReport.mockImplementation(async (options) => {
        options.onProgress?.(25);
        options.onProgress?.(50);
        options.onProgress?.(100);
        return { success: true, blob: mockBlob };
      });

      const { result } = renderHook(() => usePDFGeneration());

      await act(async () => {
        await result.current.generateReport(
          { reportType: 'natal', title: 'Test' },
          {} as any
        );
      });

      expect(result.current.progress).toBe(100);
      expect(result.current.lastGeneratedBlob).toBe(mockBlob);
    });

    it('should handle generation errors', async () => {
      mockGenerateReport.mockResolvedValue({
        success: false,
        error: 'Generation failed',
      });

      const { result } = renderHook(() => usePDFGeneration());

      await act(async () => {
        await result.current.generateReport(
          { reportType: 'natal', title: 'Test' },
          {} as any
        );
      });

      expect(result.current.error).toBe('Generation failed');
      expect(result.current.lastGeneratedBlob).toBeNull();
    });

    it('should handle exceptions during generation', async () => {
      mockGenerateReport.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => usePDFGeneration());

      const result_data = await act(async () => {
        return result.current.generateReport(
          { reportType: 'natal', title: 'Test' },
          {} as any
        );
      });

      expect(result_data.success).toBe(false);
      expect(result_data.error).toBe('Network error');
    });

    it('should call onProgress callback from options', async () => {
      const progressCallback = vi.fn();
      mockGenerateReport.mockImplementation(async (options) => {
        options.onProgress?.(50);
        return { success: true, blob: new Blob() };
      });

      const { result } = renderHook(() => usePDFGeneration());

      await act(async () => {
        await result.current.generateReport(
          { reportType: 'natal', title: 'Test', onProgress: progressCallback },
          {} as any
        );
      });

      expect(progressCallback).toHaveBeenCalledWith(50);
    });
  });

  describe('downloadReport', () => {
    it('should download report with default filename', async () => {
      const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
      mockGenerateReport.mockResolvedValue({ success: true, blob: mockBlob });

      const { result } = renderHook(() => usePDFGeneration());

      // First generate a report
      await act(async () => {
        await result.current.generateReport(
          { reportType: 'natal', title: 'Test' },
          {} as any
        );
      });

      // Then download
      act(() => {
        result.current.downloadReport();
      });

      expect(mockDownloadPDF).toHaveBeenCalledWith(mockBlob, expect.stringContaining('astroverse-report'));
    });

    it('should download report with custom filename', async () => {
      const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
      mockGenerateReport.mockResolvedValue({ success: true, blob: mockBlob });

      const { result } = renderHook(() => usePDFGeneration());

      await act(async () => {
        await result.current.generateReport(
          { reportType: 'natal', title: 'Test' },
          {} as any
        );
      });

      act(() => {
        result.current.downloadReport('custom-report.pdf');
      });

      expect(mockDownloadPDF).toHaveBeenCalledWith(mockBlob, 'custom-report.pdf');
    });

    it('should show error when no blob available', () => {
      const { result } = renderHook(() => usePDFGeneration());

      act(() => {
        result.current.downloadReport();
      });

      expect(result.current.error).toContain('No report available');
    });
  });

  describe('printReport', () => {
    it('should print report when blob exists', async () => {
      const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
      mockGenerateReport.mockResolvedValue({ success: true, blob: mockBlob });

      const { result } = renderHook(() => usePDFGeneration());

      await act(async () => {
        await result.current.generateReport(
          { reportType: 'natal', title: 'Test' },
          {} as any
        );
      });

      act(() => {
        result.current.printReport();
      });

      expect(mockPrintPDF).toHaveBeenCalledWith(mockBlob);
    });

    it('should show error when no blob available for printing', () => {
      const { result } = renderHook(() => usePDFGeneration());

      act(() => {
        result.current.printReport();
      });

      expect(result.current.error).toContain('No report available');
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      mockGenerateReport.mockResolvedValue({
        success: false,
        error: 'Test error',
      });

      const { result } = renderHook(() => usePDFGeneration());

      await act(async () => {
        await result.current.generateReport(
          { reportType: 'natal', title: 'Test' },
          {} as any
        );
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
      mockGenerateReport.mockResolvedValue({ success: true, blob: mockBlob });

      const { result } = renderHook(() => usePDFGeneration());

      await act(async () => {
        await result.current.generateReport(
          { reportType: 'natal', title: 'Test' },
          {} as any
        );
      });

      expect(result.current.progress).toBe(100);
      expect(result.current.lastGeneratedBlob).toBe(mockBlob);

      act(() => {
        result.current.reset();
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.progress).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.lastGeneratedBlob).toBeNull();
    });
  });
});

describe('Utility Functions', () => {
  describe('getReportTypeName', () => {
    it('should return correct display names for all report types', () => {
      expect(getReportTypeName('natal')).toBe('Natal Chart Report');
      expect(getReportTypeName('transit')).toBe('Transit Report');
      expect(getReportTypeName('synastry')).toBe('Synastry Report');
      expect(getReportTypeName('solar-return')).toBe('Solar Return Report');
      expect(getReportTypeName('lunar-return')).toBe('Lunar Return Report');
    });
  });

  describe('getExpectedPageCount', () => {
    it('should return correct page ranges for all report types', () => {
      expect(getExpectedPageCount('natal')).toBe('5-10 pages');
      expect(getExpectedPageCount('transit')).toBe('3-5 pages');
      expect(getExpectedPageCount('synastry')).toBe('8-12 pages');
      expect(getExpectedPageCount('solar-return')).toBe('4-6 pages');
      expect(getExpectedPageCount('lunar-return')).toBe('2-3 pages');
    });
  });

  describe('generateReportFilename', () => {
    it('should generate filename with date', () => {
      const filename = generateReportFilename('natal');
      expect(filename).toContain('astroverse-natal');
      expect(filename).toContain(new Date().toISOString().split('T')[0]);
      expect(filename).toMatch(/\.pdf$/);
    });

    it('should include chart name when provided', () => {
      const filename = generateReportFilename('natal', 'My Birth Chart');
      expect(filename).toContain('my-birth-chart');
    });

    it('should handle special characters in chart name', () => {
      const filename = generateReportFilename('natal', "John's Chart!@#$%");
      expect(filename).not.toContain("'");
      expect(filename).not.toContain('!');
      expect(filename).not.toContain('@');
      expect(filename).not.toContain('#');
      expect(filename).not.toContain('$');
      expect(filename).not.toContain('%');
    });

    it('should work for all report types', () => {
      const types: ReportType[] = ['natal', 'transit', 'synastry', 'solar-return', 'lunar-return'];
      types.forEach((type) => {
        const filename = generateReportFilename(type);
        expect(filename).toContain(type);
        expect(filename).toMatch(/\.pdf$/);
      });
    });
  });
});
