/**
 * Transit Report History
 *
 * Displays a list of past transit reports (up to 12 months).
 * Each entry shows month/year, generation date, and download button.
 * Older reports are separated into an archive section.
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../../hooks/useReports';
import type { Report } from '../../stores/reportStore';

// ============================================================================
// TYPES
// ============================================================================

interface TransitReportHistoryProps {
  /** Max recent reports to show before archiving */
  recentLimit?: number;
  /** Additional className */
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/** Format a report's created date as "Mon YYYY" */
function formatMonth(report: Report): string {
  const date = report.completedAt ?? report.createdAt;
  return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Format a date as "Mon DD, YYYY" */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ============================================================================
// COMPONENT
// ============================================================================

export const TransitReportHistory: React.FC<TransitReportHistoryProps> = ({
  recentLimit = 6,
  className = '',
}) => {
  const navigate = useNavigate();
  const { getCompletedReports, downloadReport } = useReports();

  const transitReports = useMemo(
    () => getCompletedReports().filter((r) => r.type === 'transit'),
    [getCompletedReports],
  );

  // Sort by date descending (newest first)
  const sorted = useMemo(
    () =>
      [...transitReports].sort((a, b) => {
        const dateA = new Date(a.completedAt ?? a.createdAt).getTime();
        const dateB = new Date(b.completedAt ?? b.createdAt).getTime();
        return dateB - dateA;
      }),
    [transitReports],
  );

  const recent = sorted.slice(0, recentLimit);
  const archive = sorted.slice(recentLimit);

  if (transitReports.length === 0) {
    return null;
  }

  const renderReportEntry = (report: Report) => (
    <div
      key={report.id}
      className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-b-0"
      data-testid={`report-history-${report.id}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-7 rounded-lg bg-[#6b3de1]/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[#6b3de1] text-[14px]">description</span>
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">{formatMonth(report)}</p>
          <p className="text-slate-500 text-xs">
            {formatDate(report.completedAt ?? report.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/reports/monthly-transit')}
          className="size-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          aria-label={`View ${formatMonth(report)} report`}
          data-testid={`view-report-${report.id}`}
        >
          <span className="material-symbols-outlined text-[16px]">visibility</span>
        </button>
        <button
          type="button"
          onClick={() => downloadReport(report)}
          className="size-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          aria-label={`Download ${formatMonth(report)} report`}
          data-testid={`download-report-${report.id}`}
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`bg-[#141627]/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 ${className}`}
      data-testid="transit-report-history"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">history</span>
          Report History
        </h3>
        <span className="text-xs text-slate-500">
          {transitReports.length} report{transitReports.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Recent reports */}
      <div>{recent.map(renderReportEntry)}</div>

      {/* Archived reports */}
      {archive.length > 0 && (
        <details className="mt-3">
          <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300 transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
            {archive.length} older report{archive.length !== 1 ? 's' : ''}
          </summary>
          <div className="mt-2">{archive.map(renderReportEntry)}</div>
        </details>
      )}
    </div>
  );
};

export default TransitReportHistory;
