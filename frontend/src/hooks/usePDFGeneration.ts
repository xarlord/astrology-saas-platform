/**
 * usePDFGeneration Hook
 *
 * Custom hook for PDF report generation with progress tracking and error handling
 *
 * @see docs/design/DESIGN_SPECIFICATIONS.md section 9
 */

import { useState, useCallback, useRef } from 'react';
import pdfService, {
  type PDFGenerationOptions,
  type PDFGenerationResult,
  type ReportData,
  type ReportType,
} from '../services/pdf.service';

// ============================================================================
// TYPES
// ============================================================================

export interface PDFGenerationState {
  isGenerating: boolean;
  progress: number;
  error: string | null;
  lastGeneratedBlob: Blob | null;
}

export interface UsePDFGenerationReturn {
  // State
  isGenerating: boolean;
  progress: number;
  error: string | null;
  lastGeneratedBlob: Blob | null;

  // Actions
  generateReport: (
    options: PDFGenerationOptions,
    data: ReportData
  ) => Promise<PDFGenerationResult>;
  downloadReport: (filename?: string) => void;
  printReport: () => void;
  clearError: () => void;
  reset: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function usePDFGeneration(): UsePDFGenerationReturn {
  const [state, setState] = useState<PDFGenerationState>({
    isGenerating: false,
    progress: 0,
    error: null,
    lastGeneratedBlob: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Generate a PDF report
   */
  const generateReport = useCallback(
    async (
      options: PDFGenerationOptions,
      data: ReportData
    ): Promise<PDFGenerationResult> => {
      // Cancel any ongoing generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setState((prev) => ({
        ...prev,
        isGenerating: true,
        progress: 0,
        error: null,
      }));

      try {
        const result = await pdfService.generateReport(
          {
            ...options,
            onProgress: (progress) => {
              setState((prev) => ({ ...prev, progress }));
              options.onProgress?.(progress);
            },
          },
          data
        );

        if (result.success && result.blob) {
          setState((prev) => ({
            ...prev,
            isGenerating: false,
            progress: 100,
            lastGeneratedBlob: result.blob!,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            isGenerating: false,
            progress: 0,
            error: result.error ?? 'Failed to generate PDF',
          }));
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';

        setState((prev) => ({
          ...prev,
          isGenerating: false,
          progress: 0,
          error: errorMessage,
        }));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    []
  );

  /**
   * Download the last generated report
   */
  const downloadReport = useCallback(
    (filename?: string) => {
      if (!state.lastGeneratedBlob) {
        setState((prev) => ({
          ...prev,
          error: 'No report available to download. Generate a report first.',
        }));
        return;
      }

      const defaultFilename = `astroverse-report-${new Date()
        .toISOString()
        .split('T')[0]}.pdf`;

      pdfService.downloadPDF(state.lastGeneratedBlob, filename ?? defaultFilename);
    },
    [state.lastGeneratedBlob]
  );

  /**
   * Print the last generated report
   */
  const printReport = useCallback(() => {
    if (!state.lastGeneratedBlob) {
      setState((prev) => ({
        ...prev,
        error: 'No report available to print. Generate a report first.',
      }));
      return;
    }

    pdfService.printPDF(state.lastGeneratedBlob);
  }, [state.lastGeneratedBlob]);

  /**
   * Clear any error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      isGenerating: false,
      progress: 0,
      error: null,
      lastGeneratedBlob: null,
    });
  }, []);

  return {
    isGenerating: state.isGenerating,
    progress: state.progress,
    error: state.error,
    lastGeneratedBlob: state.lastGeneratedBlob,
    generateReport,
    downloadReport,
    printReport,
    clearError,
    reset,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get display name for report type
 */
export function getReportTypeName(type: ReportType): string {
  const names: Record<ReportType, string> = {
    natal: 'Natal Chart Report',
    transit: 'Transit Report',
    synastry: 'Synastry Report',
    'solar-return': 'Solar Return Report',
    'lunar-return': 'Lunar Return Report',
  };
  return names[type];
}

/**
 * Get expected page count for report type
 */
export function getExpectedPageCount(type: ReportType): string {
  const counts: Record<ReportType, string> = {
    natal: '5-10 pages',
    transit: '3-5 pages',
    synastry: '8-12 pages',
    'solar-return': '4-6 pages',
    'lunar-return': '2-3 pages',
  };
  return counts[type];
}

/**
 * Generate default filename for report
 */
export function generateReportFilename(
  type: ReportType,
  chartName?: string
): string {
  const date = new Date().toISOString().split('T')[0];
  // Remove special characters and replace spaces with dashes
  const sanitizedName = chartName
    ? chartName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and dashes
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
        .replace(/^-|-$/g, '') // Remove leading/trailing dashes
    : '';
  const namePart = sanitizedName ? `-${sanitizedName}` : '';
  return `astroverse-${type}${namePart}-${date}.pdf`;
}

export default usePDFGeneration;
