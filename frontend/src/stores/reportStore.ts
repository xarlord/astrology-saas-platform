/**
 * Report Store
 *
 * Manages report generation state and tracking
 * Handles PDF reports, their status, and download URLs
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ReportType = 'personality' | 'transit' | 'synastry' | 'solar-return' | 'lunar-return';
export type ReportFormat = 'pdf' | 'json';
export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ReportRequest {
  type: ReportType;
  chartId?: string;
  chart2Id?: string; // for synastry
  startDate?: string;
  endDate?: string;
  year?: number;
  format: ReportFormat;
  includeAnalysis: boolean;
  includeCharts: boolean;
  includeAspects: boolean;
}

export interface Report {
  id: string;
  type: ReportType;
  status: ReportStatus;
  format: ReportFormat;
  downloadUrl?: string;
  expiresAt?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
  request: ReportRequest;
}

export interface ReportGenerationOptions {
  onProgress?: (progress: number) => void;
  onComplete?: (report: Report) => void;
  onError?: (error: string) => void;
}

interface ReportState {
  reports: Record<string, Report>;
  activeReportId: string | null;
  isGenerating: boolean;

  // Actions
  setReport: (report: Report) => void;
  removeReport: (id: string) => void;
  setActiveReport: (id: string | null) => void;
  clearCompleted: () => void;
  clearAll: () => void;

  // Report generation
  generateReport: (request: ReportRequest, options?: ReportGenerationOptions) => Promise<Report>;
  retryReport: (id: string) => Promise<Report>;
  cancelReport: (id: string) => void;
}

export const useReportStore = create<ReportState>()(
  devtools(
    (set, get) => ({
      reports: {},
      activeReportId: null,
      isGenerating: false,

      setReport: (report) => {
        set((state) => ({
          reports: {
            ...state.reports,
            [report.id]: report,
          },
        }));
      },

      removeReport: (id) => {
        set((state) => {
          const newReports = { ...state.reports };
          delete newReports[id];
          return { reports: newReports };
        });
      },

      setActiveReport: (id) => {
        set({ activeReportId: id });
      },

      clearCompleted: () => {
        set((state) => {
          const newReports = { ...state.reports };
          Object.entries(newReports).forEach(([id, report]) => {
            if (report.status === 'completed') {
              delete newReports[id];
            }
          });
          return { reports: newReports };
        });
      },

      clearAll: () => {
        set({ reports: {}, activeReportId: null });
      },

      generateReport: async (request, options) => {
        const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create pending report
        const pendingReport: Report = {
          id: reportId,
          type: request.type,
          status: 'pending',
          format: request.format,
          createdAt: new Date().toISOString(),
          request,
        };

        get().setReport(pendingReport);
        set({ isGenerating: true, activeReportId: reportId });

        try {
          // Update to processing
          get().setReport({
            ...pendingReport,
            status: 'processing',
          });

          // Call API to generate report
          const response = await fetch('/api/v1/reports', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify(request),
          });

          if (!response.ok) {
            throw new Error(`Report generation failed: ${response.statusText}`);
          }

          const data = (await response.json()) as {
            data: { downloadUrl?: string; expiresAt?: string };
          };

          // Update with completed report
          const completedReport: Report = {
            ...pendingReport,
            status: 'completed',
            downloadUrl: data.data.downloadUrl,
            expiresAt: data.data.expiresAt,
            completedAt: new Date().toISOString(),
          };

          get().setReport(completedReport);
          set({ isGenerating: false });

          options?.onComplete?.(completedReport);
          return completedReport;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          // Update with failed status
          const failedReport: Report = {
            ...pendingReport,
            status: 'failed',
            error: errorMessage,
          };

          get().setReport(failedReport);
          set({ isGenerating: false });

          options?.onError?.(errorMessage);
          throw error;
        }
      },

      retryReport: async (id) => {
        const report = get().reports[id];
        if (!report) {
          throw new Error('Report not found');
        }

        return get().generateReport(report.request);
      },

      cancelReport: (id) => {
        // In a real implementation, you would call an API endpoint to cancel
        // For now, just remove from state
        get().removeReport(id);
      },
    }),
    {
      name: 'ReportStore',
    },
  ),
);

// Selector hooks for optimized re-renders
export const useReports = () => useReportStore((state) => Object.values(state.reports));
export const useActiveReport = () =>
  useReportStore((state) => {
    if (!state.activeReportId) return null;
    return state.reports[state.activeReportId] || null;
  });
export const useIsGeneratingReport = () => useReportStore((state) => state.isGenerating);

export default useReportStore;
