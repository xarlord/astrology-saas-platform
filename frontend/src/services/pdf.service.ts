     1|/**
     2| * PDF Generation Service
     3| *
     4| * Client-side PDF generation using jspdf and html2canvas
     5| * Supports 5 report types: Natal, Transit, Synastry, Solar Return, Lunar Return
     6| *
     7| * @see docs/design/DESIGN_SPECIFICATIONS.md section 9
     8| */
     9|
    10|import { jsPDF } from 'jspdf';
    11|import html2canvas from 'html2canvas';
    12|import type {
    13|  CalculatedChart,
    14|  TransitResponse,
    15|  SynastryResponse,
    16|  SolarReturnResponse,
    17|  LunarReturnResponse,
    18|  PlanetPosition,
    19|  Aspect,
    20|  House,
    21|} from '../types/api.types';
    22|
    23|// ============================================================================
    24|// TYPES
    25|// ============================================================================
    26|
    27|export type ReportType = 'natal' | 'transit' | 'synastry' | 'solar-return' | 'lunar-return';
    28|
    29|export interface PDFGenerationOptions {
    30|  reportType: ReportType;
    31|  title: string;
    32|  subtitle?: string;
    33|  includeChartImage?: boolean;
    34|  chartElement?: HTMLElement | null;
    35|  onProgress?: (progress: number) => void;
    36|}
    37|
    38|export interface NatalReportData {
    39|  chart: CalculatedChart;
    40|  personality?: {
    41|    coreIdentity: string;
    42|    emotionalNature: string;
    43|    mentalStyle: string;
    44|  };
    45|}
    46|
    47|export interface TransitReportData {
    48|  transits: TransitResponse;
    49|  chartName: string;
    50|}
    51|
    52|export interface SynastryReportData {
    53|  synastry: SynastryResponse;
    54|  person1Name: string;
    55|  person2Name: string;
    56|}
    57|
    58|export interface SolarReturnReportData {
    59|  solarReturn: SolarReturnResponse;
    60|  chartName: string;
    61|}
    62|
    63|export interface LunarReturnReportData {
    64|  lunarReturn: LunarReturnResponse;
    65|  chartName: string;
    66|}
    67|
    68|export type ReportData =
    69|  | NatalReportData
    70|  | TransitReportData
    71|  | SynastryReportData
    72|  | SolarReturnReportData
    73|  | LunarReturnReportData;
    74|
    75|export interface PDFGenerationResult {
    76|  success: boolean;
    77|  blob?: Blob;
    78|  error?: string;
    79|}
    80|
    81|// ============================================================================
    82|// CONSTANTS
    83|// ============================================================================
    84|
    85|// A4 page dimensions in mm
    86|const PAGE_WIDTH = 210;
    87|const PAGE_HEIGHT = 297;
    88|const MARGIN_TOP = 25;
    89|const MARGIN_BOTTOM = 20;
    90|const MARGIN_LEFT = 20;
    91|const MARGIN_RIGHT = 20;
    92|
    93|// Content area dimensions
    94|const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
    95|// Note: CONTENT_HEIGHT is not currently used but kept for future use
    96|// const CONTENT_HEIGHT = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;
    97|
    98|// Cosmic theme colors (RGB values for PDF)
    99|const COLORS = {
   100|  cosmicPurple: [107, 61, 225] as [number, number, number],
   101|  cosmicBlue: [37, 99, 235] as [number, number, number],
   102|  accentGold: [245, 166, 35] as [number, number, number],
   103|  darkBg: [11, 13, 23] as [number, number, number],
   104|  textDark: [30, 30, 30] as [number, number, number],
   105|  textLight: [100, 100, 100] as [number, number, number],
   106|  white: [255, 255, 255] as [number, number, number],
   107|};
   108|
   109|// Font sizes in points
   110|const FONT_SIZES = {
   111|  title: 24,
   112|  subtitle: 16,
   113|  heading: 14,
   114|  subheading: 12,
   115|  body: 11,
   116|  small: 9,
   117|  footer: 8,
   118|};
   119|
   120|// Report type display names
   121|const REPORT_TYPE_NAMES: Record<ReportType, string> = {
   122|  natal: 'Natal Chart Report',
   123|  transit: 'Transit Report',
   124|  synastry: 'Synastry Report',
   125|  'solar-return': 'Solar Return Report',
   126|  'lunar-return': 'Lunar Return Report',
   127|};
   128|
   129|// ============================================================================
   130|// PDF SERVICE CLASS
   131|// ============================================================================
   132|
   133|class PDFService {
   134|  private doc: jsPDF | null = null;
   135|  private currentY = MARGIN_TOP;
   136|
   137|  /**
   138|   * Ensure doc is not null before operations
   139|   */
   140|  private getDoc(): jsPDF {
   141|    if (!this.doc) {
   142|      throw new Error('PDF document not initialized');
   143|    }
   144|    return this.doc;
   145|  }
   146|  private pageNumber = 1;
   147|  private totalPages = 1;
   148|
   149|  /**
   150|   * Generate a PDF report
   151|   */
   152|  async generateReport(
   153|    options: PDFGenerationOptions,
   154|    data: ReportData,
   155|  ): Promise<PDFGenerationResult> {
   156|    try {
   157|      this.doc = new jsPDF({
   158|        orientation: 'portrait',
   159|        unit: 'mm',
   160|        format: 'a4',
   161|      });
   162|
   163|      this.currentY = MARGIN_TOP;
   164|      this.pageNumber = 1;
   165|
   166|      // Set document properties
   167|      this.getDoc().setProperties({
   168|        title: options.title,
   169|        subject: REPORT_TYPE_NAMES[options.reportType],
   170|        creator: 'AstroVerse',
   171|        keywords: 'astrology, natal chart, report',
   172|      });
   173|
   174|      // Report progress
   175|      options.onProgress?.(5);
   176|
   177|      // Add header
   178|      this.addHeader(options);
   179|
   180|      options.onProgress?.(10);
   181|
   182|      // Add chart image if provided
   183|      if (options.includeChartImage && options.chartElement) {
   184|        await this.addChartImage(options.chartElement);
   185|        options.onProgress?.(30);
   186|      }
   187|
   188|      // Add report content based on type
   189|      switch (options.reportType) {
   190|        case 'natal':
   191|          this.addNatalReportContent(data as NatalReportData);
   192|          break;
   193|        case 'transit':
   194|          this.addTransitReportContent(data as TransitReportData);
   195|          break;
   196|        case 'synastry':
   197|          this.addSynastryReportContent(data as SynastryReportData);
   198|          break;
   199|        case 'solar-return':
   200|          this.addSolarReturnReportContent(data as SolarReturnReportData);
   201|          break;
   202|        case 'lunar-return':
   203|          this.addLunarReturnReportContent(data as LunarReturnReportData);
   204|          break;
   205|      }
   206|
   207|      options.onProgress?.(90);
   208|
   209|      // Add footer to all pages
   210|      this.totalPages = this.getDoc().getNumberOfPages();
   211|      for (let i = 1; i <= this.totalPages; i++) {
   212|        this.getDoc().setPage(i);
   213|        this.addFooter(i, this.totalPages);
   214|      }
   215|
   216|      options.onProgress?.(100);
   217|
   218|      // Generate blob
   219|      const blob = this.getDoc().output('blob');
   220|
   221|      return {
   222|        success: true,
   223|        blob,
   224|      };
   225|    } catch (error) {
   226|      console.error('PDF generation error:', error);
   227|      return {
   228|        success: false,
   229|        error: error instanceof Error ? error.message : 'Failed to generate PDF',
   230|      };
     default:
       break;
   231|    }
   232|  }
   233|
   234|  /**
   235|   * Add header section
   236|   */
   237|  private addHeader(options: PDFGenerationOptions): void {
   238|    const doc = this.getDoc();
   239|
   240|    // Background gradient effect (simulated with rectangle)
   241|    doc.setFillColor(...COLORS.darkBg);
   242|    doc.rect(0, 0, PAGE_WIDTH, 40, 'F');
   243|
   244|    // Logo area
   245|    doc.setFillColor(...COLORS.cosmicPurple);
   246|    doc.circle(MARGIN_LEFT + 8, 15, 5, 'F');
   247|
   248|    // Title
   249|    doc.setFontSize(FONT_SIZES.title);
   250|    doc.setTextColor(...COLORS.white);
   251|    doc.text('AstroVerse', MARGIN_LEFT + 18, 17);
   252|
   253|    // Report type
   254|    doc.setFontSize(FONT_SIZES.subtitle);
   255|    doc.setTextColor(...COLORS.accentGold);
   256|    doc.text(REPORT_TYPE_NAMES[options.reportType], MARGIN_LEFT, 32);
   257|
   258|    // Custom title if provided
   259|    if (options.subtitle) {
   260|      doc.setFontSize(FONT_SIZES.body);
   261|      doc.setTextColor(...COLORS.white);
   262|      doc.text(options.subtitle, MARGIN_LEFT, 37);
   263|    }
   264|
   265|    this.currentY = 50;
   266|  }
   267|
   268|  /**
   269|   * Add chart image from HTML element
   270|   */
   271|  private async addChartImage(element: HTMLElement): Promise<void> {
   272|    const doc = this.getDoc();
   273|
   274|    try {
   275|      const canvas = await html2canvas(element, {
   276|        scale: 2,
   277|        backgroundColor: '#0B0D17',
   278|        logging: false,
   279|        useCORS: true,
   280|      });
   281|
   282|      const imgData = canvas.toDataURL('image/png');
   283|
   284|      // Calculate image dimensions to fit in content area
   285|      const maxImgWidth = 80; // mm
   286|      const maxImgHeight = 80; // mm
   287|
   288|      const imgWidth = canvas.width;
   289|      const imgHeight = canvas.height;
   290|      const ratio = Math.min(maxImgWidth / imgWidth, maxImgHeight / imgHeight);
   291|
   292|      const finalWidth = imgWidth * ratio * 0.264583; // px to mm
   293|      const finalHeight = imgHeight * ratio * 0.264583;
   294|
   295|      // Center the image
   296|      const x = MARGIN_LEFT + (CONTENT_WIDTH - finalWidth) / 2;
   297|
   298|      doc.addImage(imgData, 'PNG', x, this.currentY, finalWidth, finalHeight);
   299|      this.currentY += finalHeight + 10;
   300|    } catch (error) {
   301|      console.error('Failed to capture chart image:', error);
   302|    }
   303|  }
   304|
   305|  /**
   306|   * Add section heading
   307|   */
   308|  private addHeading(text: string): void {
   309|    const doc = this.getDoc();
   310|
   311|    this.checkPageBreak(15);
   312|
   313|    doc.setFontSize(FONT_SIZES.heading);
   314|    doc.setTextColor(...COLORS.cosmicPurple);
   315|    doc.setFont('helvetica', 'bold');
   316|    doc.text(text, MARGIN_LEFT, this.currentY);
   317|
   318|    // Underline
   319|    const textWidth = doc.getTextWidth(text);
   320|    doc.setDrawColor(...COLORS.cosmicPurple);
   321|    doc.setLineWidth(0.5);
   322|    doc.line(MARGIN_LEFT, this.currentY + 2, MARGIN_LEFT + textWidth, this.currentY + 2);
   323|
   324|    this.currentY += 10;
   325|    doc.setFont('helvetica', 'normal');
   326|  }
   327|
   328|  /**
   329|   * Add body text
   330|   */
   331|  private addText(
   332|    text: string,
   333|    options?: { indent?: number; color?: [number, number, number] },
   334|  ): void {
   335|    const doc = this.getDoc();
   336|
   337|    const indent = options?.indent ?? 0;
   338|    const color = options?.color ?? COLORS.textDark;
   339|
   340|    doc.setFontSize(FONT_SIZES.body);
   341|    doc.setTextColor(...color);
   342|
   343|    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - indent) as string[];
   344|    const lineHeight = 6;
   345|
   346|    lines.forEach((line) => {
   347|      this.checkPageBreak(lineHeight);
   348|      doc.text(line, MARGIN_LEFT + indent, this.currentY);
   349|      this.currentY += lineHeight;
   350|    });
   351|
   352|    this.currentY += 2;
   353|  }
   354|
   355|  /**
   356|   * Add a key-value pair line
   357|   */
   358|  private addKeyValue(key: string, value: string): void {
   359|    const doc = this.getDoc();
   360|
   361|    this.checkPageBreak(8);
   362|
   363|    doc.setFontSize(FONT_SIZES.body);
   364|    doc.setFont('helvetica', 'bold');
   365|    doc.setTextColor(...COLORS.cosmicBlue);
   366|    doc.text(key + ':', MARGIN_LEFT, this.currentY);
   367|
   368|    doc.setFont('helvetica', 'normal');
   369|    doc.setTextColor(...COLORS.textDark);
   370|
   371|    const keyWidth = doc.getTextWidth(key + ': ');
   372|    doc.text(value, MARGIN_LEFT + keyWidth, this.currentY);
   373|
   374|    this.currentY += 7;
   375|  }
   376|
   377|  /**
   378|   * Add bullet point
   379|   */
   380|  private addBullet(text: string): void {
   381|    const doc = this.getDoc();
   382|
   383|    this.checkPageBreak(8);
   384|
   385|    // Bullet character
   386|    doc.setFontSize(FONT_SIZES.body);
   387|    doc.setTextColor(...COLORS.accentGold);
   388|    doc.text('\u2022', MARGIN_LEFT + 3, this.currentY);
   389|
   390|    // Text
   391|    doc.setTextColor(...COLORS.textDark);
   392|    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 10) as string[];
   393|    lines.forEach((line, index) => {
   394|      if (index > 0) this.checkPageBreak(6);
   395|      doc.text(line, MARGIN_LEFT + 8, this.currentY + index * 6);
   396|    });
   397|
   398|    this.currentY += lines.length * 6 + 2;
   399|  }
   400|
   401|  /**
   402|   * Add planet position table
   403|   */
   404|  private addPlanetTable(positions: PlanetPosition[]): void {
   405|    const doc = this.getDoc();
   406|    if (positions.length === 0) return;
   407|
   408|    this.checkPageBreak(30);
   409|
   410|    const colWidths = [35, 30, 25, 20, 20];
   411|    const rowHeight = 7;
   412|    const startX = MARGIN_LEFT;
   413|
   414|    // Header
   415|    doc.setFillColor(...COLORS.cosmicPurple);
   416|    doc.rect(startX, this.currentY - 4, CONTENT_WIDTH, rowHeight, 'F');
   417|
   418|    doc.setFontSize(FONT_SIZES.small);
   419|    doc.setFont('helvetica', 'bold');
   420|    doc.setTextColor(...COLORS.white);
   421|
   422|    const headers = ['Planet', 'Sign', 'Degree', 'House', 'R'];
   423|    let xPos = startX + 2;
   424|    headers.forEach((header, i) => {
   425|      doc.text(header, xPos, this.currentY);
   426|      xPos += colWidths[i];
   427|    });
   428|
   429|    this.currentY += rowHeight;
   430|    doc.setFont('helvetica', 'normal');
   431|
   432|    // Rows (limit to prevent overflow)
   433|    const maxRows = Math.min(positions.length, 15);
   434|    for (let i = 0; i < maxRows; i++) {
   435|      this.checkPageBreak(rowHeight);
   436|
   437|      const pos = positions[i];
   438|
   439|      // Alternate row background
   440|      if (i % 2 === 0) {
   441|        doc.setFillColor(245, 245, 250);
   442|        doc.rect(startX, this.currentY - 4, CONTENT_WIDTH, rowHeight, 'F');
   443|      }
   444|
   445|      doc.setTextColor(...COLORS.textDark);
   446|      doc.setFontSize(FONT_SIZES.small);
   447|
   448|      xPos = startX + 2;
   449|      const values = [
   450|        pos.planet,
   451|        pos.sign,
   452|        `${pos.degree}\u00B0${pos.minute}'`,
   453|        pos.house.toString(),
   454|        pos.retrograde ? 'R' : '',
   455|      ];
   456|
   457|      values.forEach((value, j) => {
   458|        doc.text(value, xPos, this.currentY);
   459|        xPos += colWidths[j];
   460|      });
   461|
   462|      this.currentY += rowHeight;
   463|    }
   464|
   465|    this.currentY += 5;
   466|  }
   467|
   468|  /**
   469|   * Add aspects table
   470|   */
   471|  private addAspectsTable(aspects: Aspect[]): void {
   472|    const doc = this.getDoc();
   473|    if (aspects.length === 0) return;
   474|
   475|    this.checkPageBreak(30);
   476|
   477|    const colWidths = [35, 30, 25, 20];
   478|    const rowHeight = 7;
   479|    const startX = MARGIN_LEFT;
   480|
   481|    // Header
   482|    doc.setFillColor(...COLORS.cosmicBlue);
   483|    doc.rect(
   484|      startX,
   485|      this.currentY - 4,
   486|      colWidths.reduce((a, b) => a + b, 0),
   487|      rowHeight,
   488|      'F',
   489|    );
   490|
   491|    doc.setFontSize(FONT_SIZES.small);
   492|    doc.setFont('helvetica', 'bold');
   493|    doc.setTextColor(...COLORS.white);
   494|
   495|    const headers = ['Planet 1', 'Planet 2', 'Aspect', 'Orb'];
   496|    let xPos = startX + 2;
   497|    headers.forEach((header, i) => {
   498|      doc.text(header, xPos, this.currentY);
   499|      xPos += colWidths[i];
   500|    });
   501|