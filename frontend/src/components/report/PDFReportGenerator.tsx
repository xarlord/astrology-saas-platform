/**
 * PDF Report Generator Component
 *
 * Provides UI for generating, previewing, downloading, and printing PDF reports
 * Supports 5 report types: Natal, Transit, Synastry, Solar Return, Lunar Return
 *
 * @see docs/design/DESIGN_SPECIFICATIONS.md section 9
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import {
  usePDFGeneration,
  getReportTypeName,
  generateReportFilename,
} from '../../hooks/usePDFGeneration';
import pdfService, {
  type ReportType,
  type ReportData,
  type PDFGenerationOptions,
  type NatalReportData,
  type TransitReportData,
  type SynastryReportData,
  type SolarReturnReportData,
  type LunarReturnReportData,
} from '../../services/pdf.service';
import type {
  CalculatedChart,
  TransitResponse,
  SynastryResponse,
  SolarReturnResponse,
  LunarReturnResponse,
} from '../../types/api.types';

// ============================================================================
// TYPES
// ============================================================================

export interface PDFReportGeneratorProps {
  // Report data
  chart?: CalculatedChart;
  transits?: TransitResponse;
  synastry?: SynastryResponse;
  solarReturn?: SolarReturnResponse;
  lunarReturn?: LunarReturnResponse;

  // Chart element for image capture
  chartElementId?: string;

  // Additional info
  chartName?: string;
  person1Name?: string;
  person2Name?: string;

  // Callbacks
  onGenerateComplete?: (blob: Blob) => void;
  onError?: (error: string) => void;

  // UI customization
  className?: string;
  defaultReportType?: ReportType;
  showPreview?: boolean;
}

interface ReportTypeOption {
  value: ReportType;
  label: string;
  description: string;
  pages: string;
  icon: string;
  available: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const REPORT_TYPE_OPTIONS: ReportTypeOption[] = [
  {
    value: 'natal',
    label: 'Natal Chart Report',
    description: 'Complete birth chart analysis with personality insights',
    pages: '5-10 pages',
    icon: '\u2600',
    available: true,
  },
  {
    value: 'transit',
    label: 'Transit Report',
    description: 'Current planetary influences and upcoming transits',
    pages: '3-5 pages',
    icon: '\u21C4',
    available: true,
  },
  {
    value: 'synastry',
    label: 'Synastry Report',
    description: 'Relationship compatibility analysis between two charts',
    pages: '8-12 pages',
    icon: '\u2665',
    available: true,
  },
  {
    value: 'solar-return',
    label: 'Solar Return Report',
    description: 'Yearly forecast based on your solar return chart',
    pages: '4-6 pages',
    icon: '\u2609',
    available: true,
  },
  {
    value: 'lunar-return',
    label: 'Lunar Return Report',
    description: 'Monthly emotional themes based on your lunar return',
    pages: '2-3 pages',
    icon: '\u263D',
    available: true,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

const PDFReportGenerator: React.FC<PDFReportGeneratorProps> = ({
  chart,
  transits,
  synastry,
  solarReturn,
  lunarReturn,
  chartElementId,
  chartName = 'Untitled Chart',
  person1Name = 'Person 1',
  person2Name = 'Person 2',
  onGenerateComplete,
  onError,
  className = '',
  defaultReportType = 'natal',
  showPreview = true,
}) => {
  // State
  const [selectedReportType, setSelectedReportType] = useState<ReportType>(defaultReportType);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hook
  const { isGenerating, progress, error, lastGeneratedBlob, generateReport, clearError, reset } =
    usePDFGeneration();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Get available report types based on provided data
  const getAvailableReportTypes = useCallback((): ReportTypeOption[] => {
    return REPORT_TYPE_OPTIONS.map((option) => {
      let available = false;

      switch (option.value) {
        case 'natal':
          available = !!chart;
          break;
        case 'transit':
          available = !!transits;
          break;
        case 'synastry':
          available = !!synastry;
          break;
        case 'solar-return':
          available = !!solarReturn;
          break;
        case 'lunar-return':
          available = !!lunarReturn;
          break;
      }

      return { ...option, available };
    });
  }, [chart, transits, synastry, solarReturn, lunarReturn]);

  // Prepare report data based on selected type
  const prepareReportData = useCallback((): ReportData | null => {
    switch (selectedReportType) {
      case 'natal':
        if (!chart) return null;
        return {
          chart,
          personality: {
            coreIdentity:
              'Your core identity is shaped by the placement of your Sun sign and its aspects to other planets.',
            emotionalNature:
              'Your emotional nature is influenced by your Moon sign and its house placement.',
            mentalStyle: "Your mental style is reflected by Mercury's position in your chart.",
          },
        } as NatalReportData;

      case 'transit':
        if (!transits) return null;
        return {
          transits,
          chartName,
        } as TransitReportData;

      case 'synastry':
        if (!synastry) return null;
        return {
          synastry,
          person1Name,
          person2Name,
        } as SynastryReportData;

      case 'solar-return':
        if (!solarReturn) return null;
        return {
          solarReturn,
          chartName,
        } as SolarReturnReportData;

      case 'lunar-return':
        if (!lunarReturn) return null;
        return {
          lunarReturn,
          chartName,
        } as LunarReturnReportData;

      default:
        return null;
    }
  }, [
    selectedReportType,
    chart,
    transits,
    synastry,
    solarReturn,
    lunarReturn,
    chartName,
    person1Name,
    person2Name,
  ]);

  // Handle generate report
  const handleGenerateReport = useCallback(async () => {
    const data = prepareReportData();
    if (!data) {
      const errorMsg = `No data available for ${selectedReportType} report`;
      onError?.(errorMsg);
      return;
    }

    // Get chart element for image capture
    const chartElement = chartElementId ? document.getElementById(chartElementId) : null;

    const options: PDFGenerationOptions = {
      reportType: selectedReportType,
      title: chartName,
      subtitle: getReportTypeName(selectedReportType),
      includeChartImage: !!chartElement,
      chartElement,
    };

    const result = await generateReport(options, data);

    if (result.success && result.blob) {
      onGenerateComplete?.(result.blob);
    } else if (result.error) {
      onError?.(result.error);
    }
  }, [
    prepareReportData,
    selectedReportType,
    chartName,
    chartElementId,
    generateReport,
    onGenerateComplete,
    onError,
  ]);

  // Handle preview
  const handlePreview = useCallback(() => {
    if (!lastGeneratedBlob) {
      void handleGenerateReport();
      return;
    }

    const url = URL.createObjectURL(lastGeneratedBlob);
    setPreviewUrl(url);
    setShowPreviewModal(true);
  }, [lastGeneratedBlob, handleGenerateReport]);

  // Handle download
  const handleDownload = useCallback(() => {
    if (!lastGeneratedBlob) {
      // Generate first, then download
      const data = prepareReportData();
      if (!data) return;

      const chartElement = chartElementId ? document.getElementById(chartElementId) : null;

      const options: PDFGenerationOptions = {
        reportType: selectedReportType,
        title: chartName,
        subtitle: getReportTypeName(selectedReportType),
        includeChartImage: !!chartElement,
        chartElement,
      };

      void generateReport(options, data).then((result) => {
        if (result.success && result.blob) {
          const filename = generateReportFilename(selectedReportType, chartName);
          pdfService.downloadPDF(result.blob, filename);
        }
      });
    } else {
      const filename = generateReportFilename(selectedReportType, chartName);
      pdfService.downloadPDF(lastGeneratedBlob, filename);
    }
  }, [
    lastGeneratedBlob,
    prepareReportData,
    selectedReportType,
    chartName,
    chartElementId,
    generateReport,
  ]);

  // Handle print
  const handlePrint = useCallback(() => {
    if (!lastGeneratedBlob) {
      // Generate first, then print
      const data = prepareReportData();
      if (!data) return;

      const chartElement = chartElementId ? document.getElementById(chartElementId) : null;

      const options: PDFGenerationOptions = {
        reportType: selectedReportType,
        title: chartName,
        subtitle: getReportTypeName(selectedReportType),
        includeChartImage: !!chartElement,
        chartElement,
      };

      void generateReport(options, data).then((result) => {
        if (result.success && result.blob) {
          pdfService.printPDF(result.blob);
        }
      });
    } else {
      pdfService.printPDF(lastGeneratedBlob);
    }
  }, [
    lastGeneratedBlob,
    prepareReportData,
    selectedReportType,
    chartName,
    chartElementId,
    generateReport,
  ]);

  // Get selected report type info
  const selectedTypeInfo = REPORT_TYPE_OPTIONS.find((t) => t.value === selectedReportType);

  return (
    <div
      className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-primary/30 ${className}`}
      data-testid="pdf-report-generator"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/20 rounded-lg">
          <span className="material-symbols-outlined text-[20px] text-primary">description</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Generate PDF Report</h3>
          <p className="text-sm text-slate-400">
            Create a downloadable PDF of your astrological report
          </p>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">Report Type</label>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-surface-dark border border-white/10 rounded-lg text-white hover:border-primary/50 transition-colors"
            data-testid="pdf-type-dropdown-trigger"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{selectedTypeInfo?.icon}</span>
              <div className="text-left">
                <p className="font-medium">{selectedTypeInfo?.label}</p>
                <p className="text-xs text-slate-400">{selectedTypeInfo?.pages}</p>
              </div>
            </div>
            <span
              className={`material-symbols-outlined text-[20px] text-slate-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`}
            >expand_more</span>
          </button>

          <AnimatePresence>
            {isTypeDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 mt-2 w-full bg-surface-dark border border-white/10 rounded-lg shadow-lg overflow-hidden"
              data-testid="pdf-type-dropdown-menu"
              >
                {getAvailableReportTypes().map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={!option.available}
                    onClick={() => {
                      if (option.available) {
                        setSelectedReportType(option.value);
                        setIsTypeDropdownOpen(false);
                        reset();
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      option.available
                        ? 'hover:bg-white/5 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    } ${selectedReportType === option.value ? 'bg-primary/10' : ''}`}
                    data-testid={`pdf-type-option-${option.value}`}
                  >
                    <span className="text-lg">{option.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-white">{option.label}</p>
                      <p className="text-xs text-slate-400">{option.description}</p>
                    </div>
                    <span className="text-xs text-slate-500">{option.pages}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="mb-6" data-testid="pdf-progress-section">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Generating report...</span>
            <span className="text-sm text-primary font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-purple-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3" data-testid="pdf-error-message">
          <span className="material-symbols-outlined text-[20px] text-red-400 flex-shrink-0 mt-0.5">error_outline</span>
          <div className="flex-1">
            <p className="text-sm text-red-400">{error}</p>
            <button
              type="button"
              onClick={clearError}
              className="text-xs text-red-300 hover:text-red-200 mt-1 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {lastGeneratedBlob && !isGenerating && !error && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3" data-testid="pdf-success-message">
          <span className="material-symbols-outlined text-[20px] text-green-400">check_circle</span>
          <p className="text-sm text-green-400">Report generated successfully!</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Generate Button */}
        <Button
          variant="primary"
          fullWidth
          onClick={() => {
            void handleGenerateReport();
          }}
          disabled={isGenerating}
          data-testid="pdf-generate-button"
          leftIcon={
            isGenerating ? (
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[16px]">download</span>
            )
          }
        >
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          {showPreview && (
            <Button
              variant="secondary"
              fullWidth
              onClick={handlePreview}
              disabled={isGenerating}
              leftIcon={<span className="material-symbols-outlined text-[16px]">visibility</span>}
              data-testid="pdf-preview-button"
            >
              Preview
            </Button>
          )}

          <Button
            variant="secondary"
            fullWidth
            onClick={handlePrint}
            disabled={isGenerating || !lastGeneratedBlob}
            leftIcon={<span className="material-symbols-outlined text-[16px]">print</span>}
            data-testid="pdf-print-button"
          >
            Print
          </Button>
        </div>

        {/* Download Button (appears after generation) */}
        {lastGeneratedBlob && (
          <Button
            variant="secondary"
            fullWidth
            onClick={handleDownload}
            disabled={isGenerating}
            leftIcon={<span className="material-symbols-outlined text-[16px]">download</span>}
            data-testid="pdf-download-button"
            className="border-green-500/50 text-green-400 hover:bg-green-500/10"
          >
            Download PDF
          </Button>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-dark rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
            data-testid="pdf-preview-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Report Preview</h3>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">cancel</span>
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] rounded-lg border border-white/10"
                  title="PDF Preview"
                />
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-white/10">
                <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleDownload();
                    setShowPreviewModal(false);
                  }}
                  leftIcon={<span className="material-symbols-outlined text-[16px]">download</span>}
                >
                  Download PDF
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PDFReportGenerator;
