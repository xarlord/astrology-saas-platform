/**
 * Transit Report Card
 *
 * Dashboard card for Monthly Transit Report.
 * - Premium/Pro users: generate report, loading spinner, download PDF, view full report.
 * - Free-tier users: locked card with upgrade CTA.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useReports } from '../../hooks/useReports';
import { Button } from '../ui/Button';

// ============================================================================
// TYPES
// ============================================================================

interface TransitReportCardProps {
  /** Additional className */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const TransitReportCard: React.FC<TransitReportCardProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { hasAtLeastPlan } = useAuth();
  const { generateReport, isGenerating, getCompletedReports, downloadReport } = useReports();

  const isPremiumUser = hasAtLeastPlan('basic');
  const completedTransitReports = getCompletedReports().filter((r) => r.type === 'transit');
  const latestReport = completedTransitReports[0];

  const handleGenerate = async () => {
    const now = new Date();
    const report = await generateReport({
      type: 'transit',
      format: 'pdf',
      startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
      includeAnalysis: true,
      includeCharts: true,
      includeAspects: true,
    });

    if (report) {
      downloadReport(report);
    }
  };

  const handleViewReport = () => {
    navigate('/reports/monthly-transit');
  };

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  // ── Free-tier upsell card ─────────────────────────────────────────
  if (!isPremiumUser) {
    return (
      <motion.div
        className={`bg-[#141627]/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 ${className}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        data-testid="transit-report-upsell-card"
      >
        {/* Locked icon overlay */}
        <div className="relative mb-4">
          <div className="flex items-center justify-center h-28 bg-[#0B0D17] rounded-xl border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6b3de1]/5 to-transparent" />
            <div className="relative flex flex-col items-center gap-2">
              <div className="size-12 rounded-full bg-[#6b3de1]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#6b3de1] text-xl">lock</span>
              </div>
              <span className="text-slate-400 text-xs">Premium Feature</span>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#6b3de1] text-[20px]">auto_stories</span>
          Monthly Transit Report
        </h3>

        <p className="text-slate-400 text-sm mb-4 leading-relaxed">
          Get personalized monthly transit forecasts with key dates, life area breakdowns, and
          timing recommendations.
        </p>

        {/* Sample preview hint */}
        <div className="bg-[#0B0D17] rounded-lg p-3 mb-4 border border-white/5">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="material-symbols-outlined text-[14px]">preview</span>
            Preview includes:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Key Dates', 'Love & Career', 'Health', 'Growth'].map((tag) => (
              <span
                key={tag}
                className="bg-[#1e2136] px-2 py-0.5 rounded text-[10px] text-slate-400 border border-white/5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={handleUpgrade}
          data-testid="upgrade-for-report-button"
        >
          <span className="flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">star</span>
            Upgrade to Premium
          </span>
        </Button>
      </motion.div>
    );
  }

  // ── Premium user card ─────────────────────────────────────────────
  return (
    <motion.div
      className={`bg-[#141627]/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 ${className}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      data-testid="transit-report-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[#6b3de1] text-[20px]">auto_stories</span>
          Monthly Report
        </h3>
        <span className="bg-[#6b3de1]/20 text-[#6b3de1] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
          Premium
        </span>
      </div>

      {/* Current month label */}
      <p className="text-slate-400 text-sm mb-4">
        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </p>

      {/* Generating state */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-6 gap-3">
          <div className="size-10 rounded-full border-2 border-[#6b3de1]/30 border-t-[#6b3de1] animate-spin" />
          <p className="text-slate-400 text-sm">Generating your report...</p>
        </div>
      )}

      {/* Report ready state */}
      {!isGenerating && latestReport && (
        <div className="space-y-3">
          <div className="bg-[#0B0D17] rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">
                  check_circle
                </span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Report Ready</p>
                <p className="text-slate-500 text-xs">
                  {latestReport.completedAt
                    ? new Date(latestReport.completedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Today'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleViewReport}
                className="flex-1"
                data-testid="view-report-button"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  View Report
                </span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => downloadReport(latestReport)}
                data-testid="download-report-button"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
              </Button>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => {
              void handleGenerate();
            }}
            disabled={isGenerating}
            data-testid="regenerate-report-button"
          >
            <span className="flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Regenerate
            </span>
          </Button>
        </div>
      )}

      {/* No report yet - generate CTA */}
      {!isGenerating && !latestReport && (
        <div className="flex flex-col items-center justify-center py-4 gap-4">
          <div className="size-14 rounded-full bg-[#6b3de1]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#6b3de1] text-2xl">summarize</span>
          </div>

          <p className="text-slate-400 text-sm text-center">
            Generate your personalized monthly transit forecast with key dates and insights.
          </p>

          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => {
              void handleGenerate();
            }}
            disabled={isGenerating}
            data-testid="generate-report-button"
          >
            <span className="flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              Generate Report
            </span>
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default TransitReportCard;
