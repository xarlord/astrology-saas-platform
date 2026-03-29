/**
 * PDF Generation Service
 *
 * Client-side PDF generation using jspdf and html2canvas
 * Supports 5 report types: Natal, Transit, Synastry, Solar Return, Lunar Return
 *
 * @see docs/design/DESIGN_SPECIFICATIONS.md section 9
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type {
  CalculatedChart,
  TransitResponse,
  SynastryResponse,
  SolarReturnResponse,
  LunarReturnResponse,
  PlanetPosition,
  Aspect,
  House,
} from '../types/api.types';

// ============================================================================
// TYPES
// ============================================================================

export type ReportType = 'natal' | 'transit' | 'synastry' | 'solar-return' | 'lunar-return';

export interface PDFGenerationOptions {
  reportType: ReportType;
  title: string;
  subtitle?: string;
  includeChartImage?: boolean;
  chartElement?: HTMLElement | null;
  onProgress?: (progress: number) => void;
}

export interface NatalReportData {
  chart: CalculatedChart;
  personality?: {
    coreIdentity: string;
    emotionalNature: string;
    mentalStyle: string;
  };
}

export interface TransitReportData {
  transits: TransitResponse;
  chartName: string;
}

export interface SynastryReportData {
  synastry: SynastryResponse;
  person1Name: string;
  person2Name: string;
}

export interface SolarReturnReportData {
  solarReturn: SolarReturnResponse;
  chartName: string;
}

export interface LunarReturnReportData {
  lunarReturn: LunarReturnResponse;
  chartName: string;
}

export type ReportData =
  | NatalReportData
  | TransitReportData
  | SynastryReportData
  | SolarReturnReportData
  | LunarReturnReportData;

export interface PDFGenerationResult {
  success: boolean;
  blob?: Blob;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// A4 page dimensions in mm
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_TOP = 25;
const MARGIN_BOTTOM = 20;
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;

// Content area dimensions
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
// Note: CONTENT_HEIGHT is not currently used but kept for future use
// const CONTENT_HEIGHT = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;

// Cosmic theme colors (RGB values for PDF)
const COLORS = {
  cosmicPurple: [107, 61, 225] as [number, number, number],
  cosmicBlue: [37, 99, 235] as [number, number, number],
  accentGold: [245, 166, 35] as [number, number, number],
  darkBg: [11, 13, 23] as [number, number, number],
  textDark: [30, 30, 30] as [number, number, number],
  textLight: [100, 100, 100] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

// Font sizes in points
const FONT_SIZES = {
  title: 24,
  subtitle: 16,
  heading: 14,
  subheading: 12,
  body: 11,
  small: 9,
  footer: 8,
};

// Report type display names
const REPORT_TYPE_NAMES: Record<ReportType, string> = {
  natal: 'Natal Chart Report',
  transit: 'Transit Report',
  synastry: 'Synastry Report',
  'solar-return': 'Solar Return Report',
  'lunar-return': 'Lunar Return Report',
};

// ============================================================================
// PDF SERVICE CLASS
// ============================================================================

class PDFService {
  private doc: jsPDF | null = null;
  private currentY = MARGIN_TOP;

  /**
   * Ensure doc is not null before operations
   */
  private getDoc(): jsPDF {
    if (!this.doc) {
      throw new Error('PDF document not initialized');
    }
    return this.doc;
  }
  private pageNumber = 1;
  private totalPages = 1;

  /**
   * Generate a PDF report
   */
  async generateReport(
    options: PDFGenerationOptions,
    data: ReportData
  ): Promise<PDFGenerationResult> {
    try {
      this.doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      this.currentY = MARGIN_TOP;
      this.pageNumber = 1;

      // Set document properties
      this.getDoc().setProperties({
        title: options.title,
        subject: REPORT_TYPE_NAMES[options.reportType],
        creator: 'AstroVerse',
        keywords: 'astrology, natal chart, report',
      });

      // Report progress
      options.onProgress?.(5);

      // Add header
      this.addHeader(options);

      options.onProgress?.(10);

      // Add chart image if provided
      if (options.includeChartImage && options.chartElement) {
        await this.addChartImage(options.chartElement);
        options.onProgress?.(30);
      }

      // Add report content based on type
      switch (options.reportType) {
        case 'natal':
          this.addNatalReportContent(data as NatalReportData);
          break;
        case 'transit':
          this.addTransitReportContent(data as TransitReportData);
          break;
        case 'synastry':
          this.addSynastryReportContent(data as SynastryReportData);
          break;
        case 'solar-return':
          this.addSolarReturnReportContent(data as SolarReturnReportData);
          break;
        case 'lunar-return':
          this.addLunarReturnReportContent(data as LunarReturnReportData);
          break;
      }

      options.onProgress?.(90);

      // Add footer to all pages
      this.totalPages = this.getDoc().getNumberOfPages();
      for (let i = 1; i <= this.totalPages; i++) {
        this.getDoc().setPage(i);
        this.addFooter(i, this.totalPages);
      }

      options.onProgress?.(100);

      // Generate blob
      const blob = this.getDoc().output('blob');

      return {
        success: true,
        blob,
      };
    } catch (error) {
      console.error('PDF generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate PDF',
      };
    }
  }

  /**
   * Add header section
   */
  private addHeader(options: PDFGenerationOptions): void {
    const doc = this.getDoc();

    // Background gradient effect (simulated with rectangle)
    doc.setFillColor(...COLORS.darkBg);
    doc.rect(0, 0, PAGE_WIDTH, 40, 'F');

    // Logo area
    doc.setFillColor(...COLORS.cosmicPurple);
    doc.circle(MARGIN_LEFT + 8, 15, 5, 'F');

    // Title
    doc.setFontSize(FONT_SIZES.title);
    doc.setTextColor(...COLORS.white);
    doc.text('AstroVerse', MARGIN_LEFT + 18, 17);

    // Report type
    doc.setFontSize(FONT_SIZES.subtitle);
    doc.setTextColor(...COLORS.accentGold);
    doc.text(REPORT_TYPE_NAMES[options.reportType], MARGIN_LEFT, 32);

    // Custom title if provided
    if (options.subtitle) {
      doc.setFontSize(FONT_SIZES.body);
      doc.setTextColor(...COLORS.white);
      doc.text(options.subtitle, MARGIN_LEFT, 37);
    }

    this.currentY = 50;
  }

  /**
   * Add chart image from HTML element
   */
  private async addChartImage(element: HTMLElement): Promise<void> {
    const doc = this.getDoc();

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0B0D17',
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');

      // Calculate image dimensions to fit in content area
      const maxImgWidth = 80; // mm
      const maxImgHeight = 80; // mm

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(maxImgWidth / imgWidth, maxImgHeight / imgHeight);

      const finalWidth = imgWidth * ratio * 0.264583; // px to mm
      const finalHeight = imgHeight * ratio * 0.264583;

      // Center the image
      const x = MARGIN_LEFT + (CONTENT_WIDTH - finalWidth) / 2;

      doc.addImage(imgData, 'PNG', x, this.currentY, finalWidth, finalHeight);
      this.currentY += finalHeight + 10;
    } catch (error) {
      console.error('Failed to capture chart image:', error);
    }
  }

  /**
   * Add section heading
   */
  private addHeading(text: string): void {
    const doc = this.getDoc();

    this.checkPageBreak(15);

    doc.setFontSize(FONT_SIZES.heading);
    doc.setTextColor(...COLORS.cosmicPurple);
    doc.setFont('helvetica', 'bold');
    doc.text(text, MARGIN_LEFT, this.currentY);

    // Underline
    const textWidth = doc.getTextWidth(text);
    doc.setDrawColor(...COLORS.cosmicPurple);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_LEFT, this.currentY + 2, MARGIN_LEFT + textWidth, this.currentY + 2);

    this.currentY += 10;
    doc.setFont('helvetica', 'normal');
  }

  /**
   * Add body text
   */
  private addText(text: string, options?: { indent?: number; color?: [number, number, number] }): void {
    const doc = this.getDoc();

    const indent = options?.indent ?? 0;
    const color = options?.color ?? COLORS.textDark;

    doc.setFontSize(FONT_SIZES.body);
    doc.setTextColor(...color);

    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - indent) as string[];
    const lineHeight = 6;

    lines.forEach((line) => {
      this.checkPageBreak(lineHeight);
      doc.text(line, MARGIN_LEFT + indent, this.currentY);
      this.currentY += lineHeight;
    });

    this.currentY += 2;
  }

  /**
   * Add a key-value pair line
   */
  private addKeyValue(key: string, value: string): void {
    const doc = this.getDoc();

    this.checkPageBreak(8);

    doc.setFontSize(FONT_SIZES.body);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.cosmicBlue);
    doc.text(key + ':', MARGIN_LEFT, this.currentY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.textDark);

    const keyWidth = doc.getTextWidth(key + ': ');
    doc.text(value, MARGIN_LEFT + keyWidth, this.currentY);

    this.currentY += 7;
  }

  /**
   * Add bullet point
   */
  private addBullet(text: string): void {
    const doc = this.getDoc();

    this.checkPageBreak(8);

    // Bullet character
    doc.setFontSize(FONT_SIZES.body);
    doc.setTextColor(...COLORS.accentGold);
    doc.text('\u2022', MARGIN_LEFT + 3, this.currentY);

    // Text
    doc.setTextColor(...COLORS.textDark);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 10) as string[];
    lines.forEach((line, index) => {
      if (index > 0) this.checkPageBreak(6);
      doc.text(line, MARGIN_LEFT + 8, this.currentY + index * 6);
    });

    this.currentY += lines.length * 6 + 2;
  }

  /**
   * Add planet position table
   */
  private addPlanetTable(positions: PlanetPosition[]): void {
    const doc = this.getDoc();
    if (positions.length === 0) return;

    this.checkPageBreak(30);

    const colWidths = [35, 30, 25, 20, 20];
    const rowHeight = 7;
    const startX = MARGIN_LEFT;

    // Header
    doc.setFillColor(...COLORS.cosmicPurple);
    doc.rect(startX, this.currentY - 4, CONTENT_WIDTH, rowHeight, 'F');

    doc.setFontSize(FONT_SIZES.small);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.white);

    const headers = ['Planet', 'Sign', 'Degree', 'House', 'R'];
    let xPos = startX + 2;
    headers.forEach((header, i) => {
      doc.text(header, xPos, this.currentY);
      xPos += colWidths[i];
    });

    this.currentY += rowHeight;
    doc.setFont('helvetica', 'normal');

    // Rows (limit to prevent overflow)
    const maxRows = Math.min(positions.length, 15);
    for (let i = 0; i < maxRows; i++) {
      this.checkPageBreak(rowHeight);

      const pos = positions[i];

      // Alternate row background
      if (i % 2 === 0) {
        doc.setFillColor(245, 245, 250);
        doc.rect(startX, this.currentY - 4, CONTENT_WIDTH, rowHeight, 'F');
      }

      doc.setTextColor(...COLORS.textDark);
      doc.setFontSize(FONT_SIZES.small);

      xPos = startX + 2;
      const values = [
        pos.planet,
        pos.sign,
        `${pos.degree}\u00B0${pos.minute}'`,
        pos.house.toString(),
        pos.retrograde ? 'R' : '',
      ];

      values.forEach((value, j) => {
        doc.text(value, xPos, this.currentY);
        xPos += colWidths[j];
      });

      this.currentY += rowHeight;
    }

    this.currentY += 5;
  }

  /**
   * Add aspects table
   */
  private addAspectsTable(aspects: Aspect[]): void {
    const doc = this.getDoc();
    if (aspects.length === 0) return;

    this.checkPageBreak(30);

    const colWidths = [35, 30, 25, 20];
    const rowHeight = 7;
    const startX = MARGIN_LEFT;

    // Header
    doc.setFillColor(...COLORS.cosmicBlue);
    doc.rect(startX, this.currentY - 4, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');

    doc.setFontSize(FONT_SIZES.small);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.white);

    const headers = ['Planet 1', 'Planet 2', 'Aspect', 'Orb'];
    let xPos = startX + 2;
    headers.forEach((header, i) => {
      doc.text(header, xPos, this.currentY);
      xPos += colWidths[i];
    });

    this.currentY += rowHeight;
    doc.setFont('helvetica', 'normal');

    // Rows (limit to prevent overflow)
    const maxRows = Math.min(aspects.length, 10);
    for (let i = 0; i < maxRows; i++) {
      this.checkPageBreak(rowHeight);

      const aspect = aspects[i];

      // Alternate row background
      if (i % 2 === 0) {
        doc.setFillColor(240, 245, 255);
        doc.rect(startX, this.currentY - 4, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
      }

      doc.setTextColor(...COLORS.textDark);
      doc.setFontSize(FONT_SIZES.small);

      xPos = startX + 2;
      const planets = aspect.planets ?? [];
      const values = [
        planets[0] ?? '',
        planets[1] ?? '',
        aspect.type.charAt(0).toUpperCase() + aspect.type.slice(1),
        `${aspect.orb.toFixed(1)}\u00B0`,
      ];

      values.forEach((value, j) => {
        doc.text(value, xPos, this.currentY);
        xPos += colWidths[j];
      });

      this.currentY += rowHeight;
    }

    this.currentY += 5;
  }

  /**
   * Add houses summary
   */
  private addHousesSummary(houses: House[]): void {
    const _doc = this.getDoc();
    if (houses.length === 0) return;

    this.addHeading('House cusps');

    houses.forEach((house) => {
      this.addKeyValue(
        `House ${house.number}`,
        `${house.sign} ${house.cuspDegree}\u00B0${house.cuspMinute}'`
      );
    });
  }

  /**
   * Check if page break is needed
   */
  private checkPageBreak(neededHeight: number): void {
    const doc = this.getDoc();

    if (this.currentY + neededHeight > PAGE_HEIGHT - MARGIN_BOTTOM - 15) {
      doc.addPage();
      this.pageNumber++;
      this.currentY = MARGIN_TOP;
    }
  }

  /**
   * Add footer to page
   */
  private addFooter(currentPage: number, totalPages: number): void {
    const doc = this.getDoc();

    const footerY = PAGE_HEIGHT - 12;

    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_LEFT, footerY - 5, PAGE_WIDTH - MARGIN_RIGHT, footerY - 5);

    // Footer text
    doc.setFontSize(FONT_SIZES.footer);
    doc.setTextColor(...COLORS.textLight);

    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Left: Generated date
    doc.text(`Generated: ${generatedDate}`, MARGIN_LEFT, footerY);

    // Center: Copyright
    doc.text(
      '\u00A9 AstroVerse | www.astroverse.app',
      PAGE_WIDTH / 2,
      footerY,
      { align: 'center' }
    );

    // Right: Page number
    doc.text(
      `Page ${currentPage} of ${totalPages}`,
      PAGE_WIDTH - MARGIN_RIGHT,
      footerY,
      { align: 'right' }
    );
  }

  // ============================================================================
  // REPORT TYPE CONTENT GENERATORS
  // ============================================================================

  /**
   * Add natal report content
   */
  private addNatalReportContent(data: NatalReportData): void {
    const { chart, personality } = data;

    // Birth data section
    this.addHeading('Birth Information');
    this.addKeyValue('Name', chart.chart.name);
    this.addKeyValue('Date', chart.chart.birthData.birthDate);
    this.addKeyValue('Time', chart.chart.birthData.birthTime);
    this.addKeyValue('Location', chart.chart.birthData.birthPlace);
    this.addKeyValue('Coordinates', `${chart.chart.birthData.latitude.toFixed(4)}\u00B0, ${chart.chart.birthData.longitude.toFixed(4)}\u00B0`);

    // Chart angles
    if (chart.angles) {
      this.addHeading('Chart Angles');
      this.addKeyValue('Ascendant', `${chart.angles.ascendant.sign} ${chart.angles.ascendant.degree}\u00B0`);
      this.addKeyValue('Midheaven', `${chart.angles.midheaven.sign} ${chart.angles.midheaven.degree}\u00B0`);
      this.addKeyValue('Descendant', `${chart.angles.descendant.sign} ${chart.angles.descendant.degree}\u00B0`);
      this.addKeyValue('IC', `${chart.angles.ic.sign} ${chart.angles.ic.degree}\u00B0`);
    }

    // Planet positions
    if (chart.positions && chart.positions.length > 0) {
      this.addHeading('Planet Positions');
      this.addPlanetTable(chart.positions);
    }

    // Aspects
    if (chart.aspects && chart.aspects.length > 0) {
      this.addHeading('Major Aspects');
      this.addAspectsTable(chart.aspects);
    }

    // Houses
    if (chart.houses && chart.houses.length > 0) {
      this.addHousesSummary(chart.houses);
    }

    // Personality analysis
    if (personality) {
      this.addHeading('Personality Analysis');

      if (personality.coreIdentity) {
        this.addText('Core Identity:', { color: COLORS.cosmicPurple });
        this.addText(personality.coreIdentity);
      }

      if (personality.emotionalNature) {
        this.addText('Emotional Nature:', { color: COLORS.cosmicPurple });
        this.addText(personality.emotionalNature);
      }

      if (personality.mentalStyle) {
        this.addText('Mental Style:', { color: COLORS.cosmicPurple });
        this.addText(personality.mentalStyle);
      }
    }

    // Patterns
    if (chart.patterns && chart.patterns.length > 0) {
      this.addHeading('Aspect Patterns');
      chart.patterns.forEach((pattern) => {
        this.addBullet(`${pattern.type.replace('-', ' ').toUpperCase()} - Strength: ${pattern.strength}%`);
      });
    }
  }

  /**
   * Add transit report content
   */
  private addTransitReportContent(data: TransitReportData): void {
    const { transits, chartName } = data;

    this.addHeading('Transit Report');
    this.addKeyValue('Chart', chartName);
    this.addKeyValue('Period', `${transits.period.start} to ${transits.period.end}`);

    // Major transits
    if (transits.majorTransits && transits.majorTransits.length > 0) {
      this.addHeading('Major Transits');
      transits.majorTransits.forEach((transit) => {
        this.addBullet(`${transit.planet} ${transit.type} - ${transit.description}`);
        this.addText(`Peak: ${transit.peakDate} | Significance: ${transit.significance}`, { indent: 10, color: COLORS.textLight });
      });
    }

    // Daily transits summary
    if (transits.dailyTransits && transits.dailyTransits.length > 0) {
      this.addHeading('Daily Transit Highlights');
      const recentDays = transits.dailyTransits.slice(0, 7);
      recentDays.forEach((day) => {
        this.addKeyValue(day.date, day.mood.overall);
      });
    }

    // Lunar phases
    if (transits.lunarPhases && transits.lunarPhases.length > 0) {
      this.addHeading('Lunar Phases');
      transits.lunarPhases.slice(0, 8).forEach((phase) => {
        this.addBullet(`${phase.phase.replace('-', ' ')} in ${phase.sign} - ${phase.date}`);
      });
    }
  }

  /**
   * Add synastry report content
   */
  private addSynastryReportContent(data: SynastryReportData): void {
    const { synastry, person1Name, person2Name } = data;

    this.addHeading('Synastry Report');
    this.addKeyValue('Person 1', person1Name);
    this.addKeyValue('Person 2', person2Name);

    // Compatibility scores
    if (synastry.compatibilityAnalysis) {
      this.addHeading('Compatibility Analysis');
      const scores = synastry.compatibilityAnalysis;
      this.addKeyValue('Overall Score', `${scores.overallScore}%`);
      this.addKeyValue('Romantic', `${scores.romanticScore}%`);
      this.addKeyValue('Communication', `${scores.communicationScore}%`);
      this.addKeyValue('Emotional', `${scores.emotionalScore}%`);
      this.addKeyValue('Values', `${scores.valuesScore}%`);
      this.addKeyValue('Long-term Potential', `${scores.longTermPotential}%`);
    }

    // Strengths
    if (synastry.strengths && synastry.strengths.length > 0) {
      this.addHeading('Relationship Strengths');
      synastry.strengths.forEach((strength) => {
        this.addBullet(strength);
      });
    }

    // Challenges
    if (synastry.challenges && synastry.challenges.length > 0) {
      this.addHeading('Areas for Growth');
      synastry.challenges.forEach((challenge) => {
        this.addBullet(challenge);
      });
    }

    // Key aspects
    if (synastry.synastryAspects && synastry.synastryAspects.length > 0) {
      this.addHeading('Key Synastry Aspects');
      const majorAspects = synastry.synastryAspects.filter(a => a.significance === 'major').slice(0, 10);
      majorAspects.forEach((aspect) => {
        this.addBullet(`${aspect.planet1.planet} ${aspect.type} ${aspect.planet2.planet} - ${aspect.interpretation}`);
      });
    }

    // Recommendations
    if (synastry.recommendations && synastry.recommendations.length > 0) {
      this.addHeading('Recommendations');
      synastry.recommendations.forEach((rec) => {
        this.addBullet(rec);
      });
    }
  }

  /**
   * Add solar return report content
   */
  private addSolarReturnReportContent(data: SolarReturnReportData): void {
    const { solarReturn, chartName } = data;

    this.addHeading('Solar Return Report');
    this.addKeyValue('Chart', chartName);
    this.addKeyValue('Year', solarReturn.year.toString());
    this.addKeyValue('Return Date', solarReturn.returnDate);
    if (solarReturn.location) {
      this.addKeyValue('Location', solarReturn.location.placeName);
    }

    // Themes
    if (solarReturn.themes && solarReturn.themes.length > 0) {
      this.addHeading('Yearly Themes');
      solarReturn.themes.forEach((theme) => {
        this.addBullet(theme);
      });
    }

    // Analysis
    if (solarReturn.analysis) {
      this.addHeading('Year Ahead Analysis');
      if (solarReturn.analysis.overview) {
        this.addText(solarReturn.analysis.overview);
      }

      if (solarReturn.analysis.dominantThemes && solarReturn.analysis.dominantThemes.length > 0) {
        this.addText('Dominant Themes:', { color: COLORS.cosmicPurple });
        solarReturn.analysis.dominantThemes.forEach((theme) => {
          this.addBullet(theme);
        });
      }

      if (solarReturn.analysis.recommendations && solarReturn.analysis.recommendations.length > 0) {
        this.addText('Recommendations:', { color: COLORS.cosmicPurple });
        solarReturn.analysis.recommendations.forEach((rec) => {
          this.addBullet(rec);
        });
      }
    }

    // Key dates
    if (solarReturn.keyDates && solarReturn.keyDates.length > 0) {
      this.addHeading('Key Dates');
      solarReturn.keyDates.slice(0, 10).forEach((keyDate) => {
        this.addKeyValue(keyDate.date, keyDate.event);
        this.addText(keyDate.significance, { indent: 10, color: COLORS.textLight });
      });
    }
  }

  /**
   * Add lunar return report content
   */
  private addLunarReturnReportContent(data: LunarReturnReportData): void {
    const { lunarReturn, chartName } = data;

    this.addHeading('Lunar Return Report');
    this.addKeyValue('Chart', chartName);
    this.addKeyValue('Return Date', lunarReturn.returnDate);
    if (lunarReturn.location) {
      this.addKeyValue('Location', lunarReturn.location.placeName);
    }

    // Emotional themes
    if (lunarReturn.emotionalThemes && lunarReturn.emotionalThemes.length > 0) {
      this.addHeading('Emotional Themes This Month');
      lunarReturn.emotionalThemes.forEach((theme) => {
        this.addBullet(theme);
      });
    }

    // Analysis
    if (lunarReturn.analysis) {
      this.addHeading('Monthly Analysis');
      if (lunarReturn.analysis.emotionalOverview) {
        this.addText(lunarReturn.analysis.emotionalOverview);
      }

      if (lunarReturn.analysis.moodThemes && lunarReturn.analysis.moodThemes.length > 0) {
        this.addText('Mood Themes:', { color: COLORS.cosmicPurple });
        lunarReturn.analysis.moodThemes.forEach((theme) => {
          this.addBullet(theme);
        });
      }

      if (lunarReturn.analysis.focusAreas && lunarReturn.analysis.focusAreas.length > 0) {
        this.addText('Focus Areas:', { color: COLORS.cosmicPurple });
        lunarReturn.analysis.focusAreas.forEach((area) => {
          this.addBullet(area);
        });
      }

      if (lunarReturn.analysis.recommendations && lunarReturn.analysis.recommendations.length > 0) {
        this.addText('Recommendations:', { color: COLORS.cosmicPurple });
        lunarReturn.analysis.recommendations.forEach((rec) => {
          this.addBullet(rec);
        });
      }
    }
  }

  /**
   * Download PDF directly
   */
  downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Open print dialog for PDF
   */
  printPDF(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }
}

// Export singleton instance
export const pdfService = new PDFService();
export default pdfService;
