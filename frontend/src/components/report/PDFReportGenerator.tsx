     1|/**
     2| * PDF Report Generator Component
     3| *
     4| * Provides UI for generating, previewing, downloading, and printing PDF reports
     5| * Supports 5 report types: Natal, Transit, Synastry, Solar Return, Lunar Return
     6| *
     7| * @see docs/design/DESIGN_SPECIFICATIONS.md section 9
     8| */
     9|
    10|import React, { useState, useRef, useCallback, useEffect } from 'react';
    11|import { motion, AnimatePresence } from 'framer-motion';
    12|import { Button } from '../ui/Button';
    13|import {
    14|  usePDFGeneration,
    15|  getReportTypeName,
    16|  generateReportFilename,
    17|} from '../../hooks/usePDFGeneration';
    18|import pdfService, {
    19|  type ReportType,
    20|  type ReportData,
    21|  type PDFGenerationOptions,
    22|  type NatalReportData,
    23|  type TransitReportData,
    24|  type SynastryReportData,
    25|  type SolarReturnReportData,
    26|  type LunarReturnReportData,
    27|} from '../../services/pdf.service';
    28|import type {
    29|  CalculatedChart,
    30|  TransitResponse,
    31|  SynastryResponse,
    32|  SolarReturnResponse,
    33|  LunarReturnResponse,
    34|} from '../../types/api.types';
    35|
    36|// ============================================================================
    37|// TYPES
    38|// ============================================================================
    39|
    40|export interface PDFReportGeneratorProps {
    41|  // Report data
    42|  chart?: CalculatedChart;
    43|  transits?: TransitResponse;
    44|  synastry?: SynastryResponse;
    45|  solarReturn?: SolarReturnResponse;
    46|  lunarReturn?: LunarReturnResponse;
    47|
    48|  // Chart element for image capture
    49|  chartElementId?: string;
    50|
    51|  // Additional info
    52|  chartName?: string;
    53|  person1Name?: string;
    54|  person2Name?: string;
    55|
    56|  // Callbacks
    57|  onGenerateComplete?: (blob: Blob) => void;
    58|  onError?: (error: string) => void;
    59|
    60|  // UI customization
    61|  className?: string;
    62|  defaultReportType?: ReportType;
    63|  showPreview?: boolean;
    64|}
    65|
    66|interface ReportTypeOption {
    67|  value: ReportType;
    68|  label: string;
    69|  description: string;
    70|  pages: string;
    71|  icon: string;
    72|  available: boolean;
    73|}
    74|
    75|// ============================================================================
    76|// CONSTANTS
    77|// ============================================================================
    78|
    79|const REPORT_TYPE_OPTIONS: ReportTypeOption[] = [
    80|  {
    81|    value: 'natal',
    82|    label: 'Natal Chart Report',
    83|    description: 'Complete birth chart analysis with personality insights',
    84|    pages: '5-10 pages',
    85|    icon: '\u2600',
    86|    available: true,
    87|  },
    88|  {
    89|    value: 'transit',
    90|    label: 'Transit Report',
    91|    description: 'Current planetary influences and upcoming transits',
    92|    pages: '3-5 pages',
    93|    icon: '\u21C4',
    94|    available: true,
    95|  },
    96|  {
    97|    value: 'synastry',
    98|    label: 'Synastry Report',
    99|    description: 'Relationship compatibility analysis between two charts',
   100|    pages: '8-12 pages',
   101|    icon: '\u2665',
   102|    available: true,
   103|  },
   104|  {
   105|    value: 'solar-return',
   106|    label: 'Solar Return Report',
   107|    description: 'Yearly forecast based on your solar return chart',
   108|    pages: '4-6 pages',
   109|    icon: '\u2609',
   110|    available: true,
   111|  },
   112|  {
   113|    value: 'lunar-return',
   114|    label: 'Lunar Return Report',
   115|    description: 'Monthly emotional themes based on your lunar return',
   116|    pages: '2-3 pages',
   117|    icon: '\u263D',
   118|    available: true,
   119|  },
   120|];
   121|
   122|// ============================================================================
   123|// COMPONENT
   124|// ============================================================================
   125|
   126|const PDFReportGenerator: React.FC<PDFReportGeneratorProps> = ({
   127|  chart,
   128|  transits,
   129|  synastry,
   130|  solarReturn,
   131|  lunarReturn,
   132|  chartElementId,
   133|  chartName = 'Untitled Chart',
   134|  person1Name = 'Person 1',
   135|  person2Name = 'Person 2',
   136|  onGenerateComplete,
   137|  onError,
   138|  className = '',
   139|  defaultReportType = 'natal',
   140|  showPreview = true,
   141|}) => {
   142|  // State
   143|  const [selectedReportType, setSelectedReportType] = useState<ReportType>(defaultReportType);
   144|  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
   145|  const [showPreviewModal, setShowPreviewModal] = useState(false);
   146|  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
   147|
   148|  // Refs
   149|  const dropdownRef = useRef<HTMLDivElement>(null);
   150|
   151|  // Hook
   152|  const { isGenerating, progress, error, lastGeneratedBlob, generateReport, clearError, reset } =
   153|    usePDFGeneration();
   154|
   155|  // Close dropdown on outside click
   156|  useEffect(() => {
   157|    const handleClickOutside = (event: MouseEvent) => {
   158|      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
   159|        setIsTypeDropdownOpen(false);
   160|      }
   161|    };
   162|
   163|    document.addEventListener('mousedown', handleClickOutside);
   164|    return () => document.removeEventListener('mousedown', handleClickOutside);
   165|  }, []);
   166|
   167|  // Cleanup preview URL on unmount
   168|  useEffect(() => {
   169|    return () => {
   170|      if (previewUrl) {
   171|        URL.revokeObjectURL(previewUrl);
   172|      }
   173|    };
   174|  }, [previewUrl]);
   175|
   176|  // Get available report types based on provided data
   177|  const getAvailableReportTypes = useCallback((): ReportTypeOption[] => {
   178|    return REPORT_TYPE_OPTIONS.map((option) => {
   179|      let available = false;
   180|
   181|      switch (option.value) {
   182|        case 'natal':
   183|          available = !!chart;
   184|          break;
   185|        case 'transit':
   186|          available = !!transits;
   187|          break;
   188|        case 'synastry':
   189|          available = !!synastry;
   190|          break;
   191|        case 'solar-return':
   192|          available = !!solarReturn;
   193|          break;
   194|        case 'lunar-return':
   195|          available = !!lunarReturn;
   196|          break;
   197|      }
   198|
   199|      return { ...option, available };
     default:
       break;
   200|    });
   201|  }, [chart, transits, synastry, solarReturn, lunarReturn]);
   202|
   203|  // Prepare report data based on selected type
   204|  const prepareReportData = useCallback((): ReportData | null => {
   205|    switch (selectedReportType) {
   206|      case 'natal':
   207|        if (!chart) return null;
   208|        return {
   209|          chart,
   210|          personality: {
   211|            coreIdentity:
   212|              'Your core identity is shaped by the placement of your Sun sign and its aspects to other planets.',
   213|            emotionalNature:
   214|              'Your emotional nature is influenced by your Moon sign and its house placement.',
   215|            mentalStyle: "Your mental style is reflected by Mercury's position in your chart.",
   216|          },
   217|        } as NatalReportData;
   218|
   219|      case 'transit':
   220|        if (!transits) return null;
   221|        return {
   222|          transits,
   223|          chartName,
   224|        } as TransitReportData;
   225|
   226|      case 'synastry':
   227|        if (!synastry) return null;
   228|        return {
   229|          synastry,
   230|          person1Name,
   231|          person2Name,
   232|        } as SynastryReportData;
   233|
   234|      case 'solar-return':
   235|        if (!solarReturn) return null;
   236|        return {
   237|          solarReturn,
   238|          chartName,
   239|        } as SolarReturnReportData;
   240|
   241|      case 'lunar-return':
   242|        if (!lunarReturn) return null;
   243|        return {
   244|          lunarReturn,
   245|          chartName,
   246|        } as LunarReturnReportData;
   247|
   248|      default:
   249|        return null;
   250|    }
   251|  }, [
   252|    selectedReportType,
   253|    chart,
   254|    transits,
   255|    synastry,
   256|    solarReturn,
   257|    lunarReturn,
   258|    chartName,
   259|    person1Name,
   260|    person2Name,
   261|  ]);
   262|
   263|  // Handle generate report
   264|  const handleGenerateReport = useCallback(async () => {
   265|    const data = prepareReportData();
   266|    if (!data) {
   267|      const errorMsg = `No data available for ${selectedReportType} report`;
   268|      onError?.(errorMsg);
   269|      return;
   270|    }
   271|
   272|    // Get chart element for image capture
   273|    const chartElement = chartElementId ? document.getElementById(chartElementId) : null;
   274|
   275|    const options: PDFGenerationOptions = {
   276|      reportType: selectedReportType,
   277|      title: chartName,
   278|      subtitle: getReportTypeName(selectedReportType),
   279|      includeChartImage: !!chartElement,
   280|      chartElement,
   281|    };
   282|
   283|    const result = await generateReport(options, data);
   284|
   285|    if (result.success && result.blob) {
   286|      onGenerateComplete?.(result.blob);
   287|    } else if (result.error) {
   288|      onError?.(result.error);
   289|    }
   290|  }, [
   291|    prepareReportData,
   292|    selectedReportType,
   293|    chartName,
   294|    chartElementId,
   295|    generateReport,
   296|    onGenerateComplete,
   297|    onError,
   298|  ]);
   299|
   300|  // Handle preview
   301|  const handlePreview = useCallback(() => {
   302|    if (!lastGeneratedBlob) {
   303|      void handleGenerateReport();
   304|      return;
   305|    }
   306|
   307|    const url = URL.createObjectURL(lastGeneratedBlob);
   308|    setPreviewUrl(url);
   309|    setShowPreviewModal(true);
   310|  }, [lastGeneratedBlob, handleGenerateReport]);
   311|
   312|  // Handle download
   313|  const handleDownload = useCallback(() => {
   314|    if (!lastGeneratedBlob) {
   315|      // Generate first, then download
   316|      const data = prepareReportData();
   317|      if (!data) return;
   318|
   319|      const chartElement = chartElementId ? document.getElementById(chartElementId) : null;
   320|
   321|      const options: PDFGenerationOptions = {
   322|        reportType: selectedReportType,
   323|        title: chartName,
   324|        subtitle: getReportTypeName(selectedReportType),
   325|        includeChartImage: !!chartElement,
   326|        chartElement,
   327|      };
   328|
   329|      void generateReport(options, data).then((result) => {
   330|        if (result.success && result.blob) {
   331|          const filename = generateReportFilename(selectedReportType, chartName);
   332|          pdfService.downloadPDF(result.blob, filename);
   333|        }
   334|      });
   335|    } else {
   336|      const filename = generateReportFilename(selectedReportType, chartName);
   337|      pdfService.downloadPDF(lastGeneratedBlob, filename);
   338|    }
   339|  }, [
   340|    lastGeneratedBlob,
   341|    prepareReportData,
   342|    selectedReportType,
   343|    chartName,
   344|    chartElementId,
   345|    generateReport,
   346|  ]);
   347|
   348|  // Handle print
   349|  const handlePrint = useCallback(() => {
   350|    if (!lastGeneratedBlob) {
   351|      // Generate first, then print
   352|      const data = prepareReportData();
   353|      if (!data) return;
   354|
   355|      const chartElement = chartElementId ? document.getElementById(chartElementId) : null;
   356|
   357|      const options: PDFGenerationOptions = {
   358|        reportType: selectedReportType,
   359|        title: chartName,
   360|        subtitle: getReportTypeName(selectedReportType),
   361|        includeChartImage: !!chartElement,
   362|        chartElement,
   363|      };
   364|
   365|      void generateReport(options, data).then((result) => {
   366|        if (result.success && result.blob) {
   367|          pdfService.printPDF(result.blob);
   368|        }
   369|      });
   370|    } else {
   371|      pdfService.printPDF(lastGeneratedBlob);
   372|    }
   373|  }, [
   374|    lastGeneratedBlob,
   375|    prepareReportData,
   376|    selectedReportType,
   377|    chartName,
   378|    chartElementId,
   379|    generateReport,
   380|  ]);
   381|
   382|  // Get selected report type info
   383|  const selectedTypeInfo = REPORT_TYPE_OPTIONS.find((t) => t.value === selectedReportType);
   384|
   385|  return (
   386|    <div
   387|      className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-primary/30 ${className}`}
   388|      data-testid="pdf-report-generator"
   389|    >
   390|      {/* Header */}
   391|      <div className="flex items-center gap-3 mb-6">
   392|        <div className="p-2 bg-primary/20 rounded-lg">
   393|          <span className="material-symbols-outlined text-[20px] text-primary">description</span>
   394|        </div>
   395|        <div>
   396|          <h3 className="text-lg font-semibold text-white">Generate PDF Report</h3>
   397|          <p className="text-sm text-slate-400">
   398|            Create a downloadable PDF of your astrological report
   399|          </p>
   400|        </div>
   401|      </div>
   402|
   403|      {/* Report Type Selector */}
   404|      <div className="mb-6">
   405|        <label className="block text-sm font-medium text-slate-300 mb-2">Report Type</label>
   406|        <div className="relative" ref={dropdownRef}>
   407|          <button
   408|            type="button"
   409|            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
   410|            className="w-full flex items-center justify-between px-4 py-3 bg-surface-dark border border-white/10 rounded-lg text-white hover:border-primary/50 transition-colors"
   411|            data-testid="pdf-type-dropdown-trigger"
   412|          >
   413|            <div className="flex items-center gap-3">
   414|              <span className="text-lg">{selectedTypeInfo?.icon}</span>
   415|              <div className="text-left">
   416|                <p className="font-medium">{selectedTypeInfo?.label}</p>
   417|                <p className="text-xs text-slate-400">{selectedTypeInfo?.pages}</p>
   418|              </div>
   419|            </div>
   420|            <span
   421|              className={`material-symbols-outlined text-[20px] text-slate-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`}
   422|            >
   423|              expand_more
   424|            </span>
   425|          </button>
   426|
   427|          <AnimatePresence>
   428|            {isTypeDropdownOpen && (
   429|              <motion.div
   430|                initial={{ opacity: 0, y: -10 }}
   431|                animate={{ opacity: 1, y: 0 }}
   432|                exit={{ opacity: 0, y: -10 }}
   433|                className="absolute z-10 mt-2 w-full bg-surface-dark border border-white/10 rounded-lg shadow-lg overflow-hidden"
   434|                data-testid="pdf-type-dropdown-menu"
   435|              >
   436|                {getAvailableReportTypes().map((option) => (
   437|                  <button
   438|                    key={option.value}
   439|                    type="button"
   440|                    disabled={!option.available}
   441|                    onClick={() => {
   442|                      if (option.available) {
   443|                        setSelectedReportType(option.value);
   444|                        setIsTypeDropdownOpen(false);
   445|                        reset();
   446|                      }
   447|                    }}
   448|                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
   449|                      option.available
   450|                        ? 'hover:bg-white/5 cursor-pointer'
   451|                        : 'opacity-50 cursor-not-allowed'
   452|                    } ${selectedReportType === option.value ? 'bg-primary/10' : ''}`}
   453|                    data-testid={`pdf-type-option-${option.value}`}
   454|                  >
   455|                    <span className="text-lg">{option.icon}</span>
   456|                    <div className="flex-1">
   457|                      <p className="font-medium text-white">{option.label}</p>
   458|                      <p className="text-xs text-slate-400">{option.description}</p>
   459|                    </div>
   460|                    <span className="text-xs text-slate-500">{option.pages}</span>
   461|                  </button>
   462|                ))}
   463|              </motion.div>
   464|            )}
   465|          </AnimatePresence>
   466|        </div>
   467|      </div>
   468|
   469|      {/* Progress Bar */}
   470|      {isGenerating && (
   471|        <div className="mb-6" data-testid="pdf-progress-section">
   472|          <div className="flex items-center justify-between mb-2">
   473|            <span className="text-sm text-slate-300">Generating report...</span>
   474|            <span className="text-sm text-primary font-medium">{progress}%</span>
   475|          </div>
   476|          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
   477|            <motion.div
   478|              className="h-full bg-gradient-to-r from-primary to-purple-400"
   479|              initial={{ width: 0 }}
   480|              animate={{ width: `${progress}%` }}
   481|              transition={{ duration: 0.3 }}
   482|            />
   483|          </div>
   484|        </div>
   485|      )}
   486|
   487|      {/* Error Message */}
   488|      {error && (
   489|        <div
   490|          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
   491|          data-testid="pdf-error-message"
   492|        >
   493|          <span className="material-symbols-outlined text-[20px] text-red-400 flex-shrink-0 mt-0.5">
   494|            error_outline
   495|          </span>
   496|          <div className="flex-1">
   497|            <p className="text-sm text-red-400">{error}</p>
   498|            <button
   499|              type="button"
   500|              onClick={clearError}
   501|