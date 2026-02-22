/**
 * Report Service
 *
 * Handles all report generation API calls
 * Supports PDF and JSON report formats
 */

import api from './api';
import type {
  ReportRequest,
  ReportResponse,
  ApiResponse,
} from '../types/api.types';

export class ReportService {
  private readonly baseUrl = '/reports';

  /**
   * Generate a new report
   */
  async generateReport(request: ReportRequest): Promise<ReportResponse> {
    try {
      const response = await api.post<ApiResponse<ReportResponse>>(
        this.baseUrl,
        request
      );

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to generate report');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate report');
    }
  }

  /**
   * Get report status
   */
  async getReportStatus(reportId: string): Promise<ReportResponse> {
    try {
      const response = await api.get<ApiResponse<ReportResponse>>(
        `${this.baseUrl}/${reportId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to get report status');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get report status');
    }
  }

  /**
   * Download report file
   * Returns blob for direct download
   */
  async downloadReport(reportId: string): Promise<Blob> {
    try {
      const response = await api.get<Blob>(
        `${this.baseUrl}/${reportId}/download`,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to download report');
    }
  }

  /**
   * Delete a report
   */
  async deleteReport(reportId: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<void>>(
        `${this.baseUrl}/${reportId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to delete report');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete report');
    }
  }

  /**
   * List all reports for current user
   */
  async listReports(): Promise<ReportResponse[]> {
    try {
      const response = await api.get<ApiResponse<ReportResponse[]>>(
        this.baseUrl
      );

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to list reports');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to list reports');
    }
  }

  /**
   * Retry a failed report generation
   */
  async retryReport(reportId: string): Promise<ReportResponse> {
    try {
      const response = await api.post<ApiResponse<ReportResponse>>(
        `${this.baseUrl}/${reportId}/retry`
      );

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to retry report');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to retry report');
    }
  }
}

// Export singleton instance
export const reportService = new ReportService();
export default reportService;
