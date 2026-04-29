/**
 * useReports Hook
 *
 * Custom hook for report generation
 * Wraps the report store for easier use in components
 */

import { useCallback } from 'react';
import { useReportStore } from '../stores';
import type { ReportRequest, Report } from '../stores/reportStore';

export const useReports = () => {
  const {
    reports,
    activeReportId,
    isGenerating,
    setReport: _setReport,
    removeReport,
    setActiveReport,
    clearCompleted,
    clearAll,
    generateReport,
    retryReport,
    cancelReport,
  } = useReportStore();

  // Generate report wrapper
  const handleGenerateReport = useCallback(
    async (
      request: ReportRequest,
      options?: {
        onProgress?: (progress: number) => void;
        onComplete?: (report: Report) => void;
        onError?: (error: string) => void;
      },
    ): Promise<Report | null> => {
      try {
        const report = await generateReport(request, options);
        return report;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
        options?.onError?.(errorMessage);
        return null;
      }
    },
    [generateReport],
  );

  // Retry report wrapper
  const handleRetryReport = useCallback(
    async (id: string): Promise<Report | null> => {
      try {
        const report = await retryReport(id);
        return report;
      } catch {
        return null;
      }
    },
    [retryReport],
  );

  // Get report by ID
  const getReportById = useCallback(
    (id: string): Report | undefined => {
      return reports[id];
    },
    [reports],
  );

  // Get reports by type
  const getReportsByType = useCallback(
    (type: string): Report[] => {
      return Object.values(reports).filter((r) => r.type === type);
    },
    [reports],
  );

  // Get pending reports
  const getPendingReports = useCallback((): Report[] => {
    return Object.values(reports).filter(
      (r) => r.status === 'pending' || r.status === 'processing',
    );
  }, [reports]);

  // Get completed reports
  const getCompletedReports = useCallback((): Report[] => {
    return Object.values(reports).filter((r) => r.status === 'completed');
  }, [reports]);

  // Get failed reports
  const getFailedReports = useCallback((): Report[] => {
    return Object.values(reports).filter((r) => r.status === 'failed');
  }, [reports]);

  // Get active report
  const getActiveReport = useCallback((): Report | null => {
    if (!activeReportId) return null;
    return reports[activeReportId] || null;
  }, [activeReportId, reports]);

  // Download report
  const downloadReport = useCallback((report: Report): void => {
    if (!report.downloadUrl) return;

    const link = document.createElement('a');
    link.href = report.downloadUrl;
    link.download = `report-${report.type}-${report.id}.${report.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    // State
    reports: Object.values(reports),
    activeReport: getActiveReport(),
    activeReportId,
    isGenerating,

    // Methods
    generateReport: handleGenerateReport,
    retryReport: handleRetryReport,
    cancelReport,
    setActiveReport,
    removeReport,
    clearCompleted,
    clearAll,

    // Computed
    getReportById,
    getReportsByType,
    getPendingReports,
    getCompletedReports,
    getFailedReports,
    downloadReport,
  };
};

export default useReports;
