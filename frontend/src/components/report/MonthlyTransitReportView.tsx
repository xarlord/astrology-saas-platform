/**
 * Monthly Transit Report View
 *
 * Wrapper page component for the Monthly Transit Report.
 * Provides AppLayout shell, page title via Helmet, sticky action bar
 * (Download PDF, Print, Share), and renders the report with mock data.
 */

import React, { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AppLayout } from '..';
import { Button } from '../ui/Button';
import MonthlyTransitReport, { MONTHLY_TRANSIT_MOCK_DATA } from './MonthlyTransitReport';

// ============================================================================
// COMPONENT
// ============================================================================

const MonthlyTransitReportView: React.FC = () => {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);

  /** Download the report element as a PDF via html2canvas */
  const handleDownloadPDF = useCallback(async () => {
    if (!reportRef.current) return;

    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      backgroundColor: '#0B0D17',
      logging: false,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');

    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: pdfHeight > 297 ? 'portrait' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(
      `monthly-transit-report-${MONTHLY_TRANSIT_MOCK_DATA.month.replace(' ', '-').toLowerCase()}.pdf`,
    );
  }, []);

  /** Open browser print dialog */
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  /** Share via Web Share API or copy URL fallback */
  const handleShare = useCallback(async () => {
    const shareData = {
      title: 'AstroVerse Monthly Transit Report',
      text: `Check out the ${MONTHLY_TRANSIT_MOCK_DATA.month} transit report on AstroVerse!`,
      url: window.location.href,
    };

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed — fall back to clipboard
        await navigator.clipboard.writeText(window.location.href);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  }, []);

  return (
    <AppLayout>
      <Helmet>
        <title>Monthly Transit Report &mdash; AstroVerse</title>
      </Helmet>

      <div className="min-h-screen bg-[#0B0D17]">
        {/* ── Sticky Action Bar ─────────────────────────────── */}
        <div className="sticky top-0 z-30 bg-[#0B0D17]/90 backdrop-blur-md border-b border-white/10">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
            {/* Back navigation */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  void handleDownloadPDF();
                }}
                leftIcon={<span className="material-symbols-outlined text-[16px]">download</span>}
              >
                Download PDF
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrint}
                leftIcon={<span className="material-symbols-outlined text-[16px]">print</span>}
              >
                Print
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  void handleShare();
                }}
                leftIcon={<span className="material-symbols-outlined text-[16px]">share</span>}
              >
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* ── Report Content ────────────────────────────────── */}
        <div className="flex justify-center py-10">
          <div ref={reportRef}>
            <MonthlyTransitReport
              month={MONTHLY_TRANSIT_MOCK_DATA.month}
              overview={MONTHLY_TRANSIT_MOCK_DATA.overview}
              keyDates={MONTHLY_TRANSIT_MOCK_DATA.keyDates}
              lifeAreas={MONTHLY_TRANSIT_MOCK_DATA.lifeAreas}
              isPremium={MONTHLY_TRANSIT_MOCK_DATA.isPremium}
              premiumCtaText={MONTHLY_TRANSIT_MOCK_DATA.premiumCtaText}
              onPremiumCta={() => {
                // In production this would navigate to the subscription page
                navigate('/subscription');
              }}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MonthlyTransitReportView;
