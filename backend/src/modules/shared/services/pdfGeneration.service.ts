/**
 * PDF Generation Service
 *
 * @requirement FINDING-002
 * @description Server-side PDF generation using Puppeteer
 * @license MIT (puppeteer)
 */

import puppeteer, { Browser, PDFOptions } from 'puppeteer';

/**
 * HTML-escape user-controlled strings to prevent XSS in PDF generation.
 * Covers: & < > " '
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Planet position interface
export interface PlanetPosition {
  name: string;
  symbol: string;
  longitude: number;
  latitude?: number;
  sign: string;
  degree: number;
  minute?: number;
  retrograde?: boolean;
  house?: number;
}

// House interface
export interface HouseCusp {
  number: number;
  sign: string;
  degree: number;
  ruler?: string;
}

// Aspect interface
export interface AspectData {
  planet1: string;
  planet2: string;
  type: string;
  angle: number;
  orb: number;
  applying?: boolean;
  harmonious?: boolean;
}

// Synastry aspect can have planet as string or object with .planet property
export interface SynastryAspectData {
  planet1: string | { planet: string };
  planet2: string | { planet: string };
  type: string;
  harmonious?: boolean;
}

// Elemental distribution
export interface ElementalDistribution {
  fire: number;
  earth: number;
  air: number;
  water: number;
}

// Modality distribution
export interface ModalityDistribution {
  cardinal: number;
  fixed: number;
  mutable: number;
}

export interface ChartData {
  type: 'natal' | 'synastry' | 'solar-return' | 'lunar-return' | 'transit';
  title: string;
  generatedAt: Date;
  data: NatalChartData | SynastryChartData | SolarReturnChartData | TransitChartData;
}

export interface NatalChartData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  planets: Record<string, PlanetPosition>;
  houses: HouseCusp[];
  aspects: AspectData[];
  elements: ElementalDistribution;
  modalities: ModalityDistribution;
  ascendant?: PlanetPosition;
  midheaven?: PlanetPosition;
}

export interface SynastryChartData {
  person1: { name: string; birthDate: string };
  person2: { name: string; birthDate: string };
  overallScore: number;
  romanticScore: number;
  communicationScore: number;
  emotionalScore: number;
  valuesScore: number;
  aspects: AspectData[];
  strengths: string[];
  challenges: string[];
}

export interface SolarReturnChartData {
  name: string;
  birthDate: string;
  returnYear: number;
  returnDate: string;
  planets: Record<string, PlanetPosition>;
  houses: HouseCusp[];
  themes: string[];
  keyDates: { date: string; event: string }[];
}

export interface TransitChartData {
  date: string;
  transitingPlanets: Record<string, PlanetPosition>;
  aspects: AspectData[];
  highlights: string[];
}

export interface NatalChartPDFData extends ChartData {
  type: 'natal';
  data: NatalChartData;
}

export interface SynastryPDFData extends ChartData {
  type: 'synastry';
  data: SynastryChartData;
}

export interface SolarReturnPDFData extends ChartData {
  type: 'solar-return';
  data: SolarReturnChartData;
}

export interface PDFGenerationOptions {
  format?: 'A4' | 'Letter';
  landscape?: boolean;
  margin?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  printBackground?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  displayHeaderFooter?: boolean;
}

// Planet symbols
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  Chiron: '⚷',
  NorthNode: '☊',
  SouthNode: '☋',
};

// Zodiac symbols
const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

// Aspect symbols
const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
  quincunx: '⚻',
};

export class PDFGenerationService {
  private browser: Browser | null = null;
  private browserPromise: Promise<Browser> | null = null;

  /**
   * Get or create browser instance (singleton pattern for performance)
   *
   * Sandbox configuration:
   * - PUPPETEER_NO_SANDBOX=true: Disables sandbox (required for Docker/root environments)
   * - PUPPETEER_NO_SANDBOX=false or unset: Enables sandbox (recommended for security)
   *
   * @see https://pptr.dev/guides/docker
   */
  private async getBrowser(): Promise<Browser> {
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }

    if (this.browserPromise) {
      return this.browserPromise;
    }

    // Environment-based sandbox configuration
    const noSandbox = process.env.PUPPETEER_NO_SANDBOX === 'true';
    const isProduction = process.env.NODE_ENV === 'production';
    const isDocker = process.env.RUNNING_IN_DOCKER === 'true';

    // Determine if sandbox should be disabled
    // Disable in Docker or production environments by default, unless explicitly enabled
    const shouldDisableSandbox =
      noSandbox || (isProduction && process.env.PUPPETEER_NO_SANDBOX !== 'false');

    const browserArgs: string[] = [];

    if (shouldDisableSandbox) {
      browserArgs.push('--no-sandbox', '--disable-setuid-sandbox');
    }

    // Common args for stability
    browserArgs.push('--disable-dev-shm-usage', '--disable-gpu', '--no-first-run', '--no-zygote');

    // Single process only in containerized environments
    if (isDocker || shouldDisableSandbox) {
      browserArgs.push('--single-process');
    }

    this.browserPromise = puppeteer.launch({
      headless: true,
      args: browserArgs,
      // Use system Chromium in Docker if available
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });

    this.browser = await this.browserPromise;
    if (!this.browser) {
      throw new Error('Failed to launch browser');
    }
    return this.browser;
  }

  /**
   * Generate PDF from chart data
   */
  async generateChartPDF(
    chartData: ChartData,
    options: PDFGenerationOptions = {},
  ): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Generate HTML content based on chart type
      const html = this.generateChartHTML(chartData);

      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // PDF options
      const pdfOptions: PDFOptions = {
        format: options.format || 'A4',
        landscape: options.landscape || false,
        printBackground: options.printBackground ?? true,
        margin: {
          top: options.margin?.top || '20mm',
          bottom: options.margin?.bottom || '20mm',
          left: options.margin?.left || '15mm',
          right: options.margin?.right || '15mm',
        },
      };

      if (options.displayHeaderFooter) {
        pdfOptions.displayHeaderFooter = true;
        pdfOptions.headerTemplate = options.headerTemplate || this.getDefaultHeader(chartData);
        pdfOptions.footerTemplate = options.footerTemplate || this.getDefaultFooter();
      }

      // Generate PDF
      const pdfBuffer = await page.pdf(pdfOptions);

      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }

  /**
   * Generate HTML content based on chart type
   */
  private generateChartHTML(chartData: ChartData): string {
    const baseStyles = this.getBaseStyles();

    switch (chartData.type) {
      case 'natal':
        return this.generateNatalChartHTML(chartData as NatalChartPDFData, baseStyles);
      case 'synastry':
        return this.generateSynastryHTML(chartData as SynastryPDFData, baseStyles);
      case 'solar-return':
        return this.generateSolarReturnHTML(chartData as SolarReturnPDFData, baseStyles);
      default:
        return this.generateGenericChartHTML(chartData, baseStyles);
    }
  }

  /**
   * Generate Natal Chart PDF HTML
   */
  private generateNatalChartHTML(data: NatalChartPDFData, styles: string): string {
    const { data: chart } = data;
    const planets = Object.entries(chart.planets);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Natal Chart - ${escapeHtml(chart.name)}</title>
  <style>${styles}</style>
</head>
<body>
  <div class="document">
    <header class="chart-header">
      <h1>Natal Chart Report</h1>
      <h2>${escapeHtml(chart.name)}</h2>
      <p class="birth-info">
        Born: ${escapeHtml(chart.birthDate)} at ${escapeHtml(chart.birthTime)}<br>
        Location: ${escapeHtml(chart.birthLocation)}
      </p>
    </header>

    <section class="section">
      <h3>Planetary Positions</h3>
      <table class="planet-table">
        <thead>
          <tr>
            <th>Planet</th>
            <th>Sign</th>
            <th>Degree</th>
            <th>House</th>
            <th>Retrograde</th>
          </tr>
        </thead>
        <tbody>
          ${planets
            .map(
              ([name, pos]: [string, PlanetPosition]) => `
            <tr>
              <td><span class="symbol">${PLANET_SYMBOLS[name] || ''}</span> ${escapeHtml(name)}</td>
              <td><span class="symbol">${ZODIAC_SYMBOLS[pos.sign] || ''}</span> ${escapeHtml(this.capitalize(pos.sign))}</td>
              <td>${pos.degree}° ${pos.minute || 0}'</td>
              <td>${pos.house || '-'}</td>
              <td>${pos.retrograde ? 'R' : ''}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </section>

    <section class="section">
      <h3>Elemental Balance</h3>
      <div class="elements-grid">
        <div class="element fire">
          <span class="symbol">🔥</span>
          <span class="label">Fire</span>
          <span class="count">${chart.elements.fire}</span>
        </div>
        <div class="element earth">
          <span class="symbol">🌍</span>
          <span class="label">Earth</span>
          <span class="count">${chart.elements.earth}</span>
        </div>
        <div class="element air">
          <span class="symbol">💨</span>
          <span class="label">Air</span>
          <span class="count">${chart.elements.air}</span>
        </div>
        <div class="element water">
          <span class="symbol">💧</span>
          <span class="label">Water</span>
          <span class="count">${chart.elements.water}</span>
        </div>
      </div>
    </section>

    ${
      chart.aspects.length > 0
        ? `
    <section class="section">
      <h3>Major Aspects</h3>
      <table class="aspect-table">
        <thead>
          <tr>
            <th>Planet 1</th>
            <th>Aspect</th>
            <th>Planet 2</th>
            <th>Orb</th>
          </tr>
        </thead>
        <tbody>
          ${chart.aspects
            .slice(0, 15)
            .map(
              (aspect: AspectData) => `
            <tr>
              <td>${escapeHtml(this.capitalize(aspect.planet1))}</td>
              <td class="aspect-type ${aspect.harmonious ? 'harmonious' : 'challenging'}">
                ${ASPECT_SYMBOLS[aspect.type] || ''} ${escapeHtml(this.capitalize(aspect.type))}
              </td>
              <td>${escapeHtml(this.capitalize(aspect.planet2))}</td>
              <td>${aspect.orb.toFixed(1)}°</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </section>
    `
        : ''
    }

    <footer class="chart-footer">
      <p>Generated by AstroVerse on ${new Date().toLocaleDateString()}</p>
      <p class="disclaimer">This report is for entertainment purposes only.</p>
    </footer>
  </div>
</body>
</html>`;
  }

  /**
   * Generate Synastry Report PDF HTML
   */
  private generateSynastryHTML(data: SynastryPDFData, styles: string): string {
    const { data: synastry } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Synastry Report</title>
  <style>${styles}</style>
</head>
<body>
  <div class="document">
    <header class="chart-header">
      <h1>Synastry Report</h1>
      <h2>${escapeHtml(synastry.person1.name)} & ${escapeHtml(synastry.person2.name)}</h2>
      <p class="birth-info">
        ${escapeHtml(synastry.person1.name)}: ${escapeHtml(synastry.person1.birthDate)}<br>
        ${escapeHtml(synastry.person2.name)}: ${escapeHtml(synastry.person2.birthDate)}
      </p>
    </header>

    <section class="section">
      <h3>Compatibility Scores</h3>
      <div class="scores-grid">
        <div class="score-card overall">
          <div class="score-circle">
            <span class="score-value">${synastry.overallScore}</span>
            <span class="score-label">Overall</span>
          </div>
        </div>
        <div class="score-card">
          <div class="score-circle">
            <span class="score-value">${synastry.romanticScore}</span>
            <span class="score-label">Romantic</span>
          </div>
        </div>
        <div class="score-card">
          <div class="score-circle">
            <span class="score-value">${synastry.communicationScore}</span>
            <span class="score-label">Communication</span>
          </div>
        </div>
        <div class="score-card">
          <div class="score-circle">
            <span class="score-value">${synastry.emotionalScore}</span>
            <span class="score-label">Emotional</span>
          </div>
        </div>
        <div class="score-card">
          <div class="score-circle">
            <span class="score-value">${synastry.valuesScore}</span>
            <span class="score-label">Values</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h3>Relationship Strengths</h3>
      <ul class="strengths-list">
        ${synastry.strengths.map((s: string) => `<li>✓ ${escapeHtml(s)}</li>`).join('')}
      </ul>
    </section>

    <section class="section">
      <h3>Areas for Growth</h3>
      <ul class="challenges-list">
        ${synastry.challenges.map((c: string) => `<li>• ${escapeHtml(c)}</li>`).join('')}
      </ul>
    </section>

    ${
      synastry.aspects.length > 0
        ? `
    <section class="section">
      <h3>Key Synastry Aspects</h3>
      <table class="aspect-table">
        <thead>
          <tr>
            <th>Planet 1</th>
            <th>Aspect</th>
            <th>Planet 2</th>
            <th>Harmonious</th>
          </tr>
        </thead>
        <tbody>
          ${synastry.aspects
            .slice(0, 15)
            .map(
              (aspect: SynastryAspectData) => `
            <tr>
              <td>${escapeHtml(this.capitalize(typeof aspect.planet1 === 'object' ? aspect.planet1.planet : aspect.planet1))}</td>
              <td class="aspect-type ${aspect.harmonious ? 'harmonious' : 'challenging'}">
                ${ASPECT_SYMBOLS[aspect.type] || ''} ${escapeHtml(this.capitalize(aspect.type))}
              </td>
              <td>${escapeHtml(this.capitalize(typeof aspect.planet2 === 'object' ? aspect.planet2.planet : aspect.planet2))}</td>
              <td>${aspect.harmonious ? '✓' : ''}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </section>
    `
        : ''
    }

    <footer class="chart-footer">
      <p>Generated by AstroVerse on ${new Date().toLocaleDateString()}</p>
      <p class="disclaimer">This report is for entertainment purposes only.</p>
    </footer>
  </div>
</body>
</html>`;
  }

  /**
   * Generate Solar Return Report PDF HTML
   */
  private generateSolarReturnHTML(data: SolarReturnPDFData, styles: string): string {
    const { data: solar } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solar Return ${solar.returnYear}</title>
  <style>${styles}</style>
</head>
<body>
  <div class="document">
    <header class="chart-header">
      <h1>Solar Return Report</h1>
      <h2>${solar.returnYear}</h2>
      <p class="birth-info">
        For: ${escapeHtml(solar.name)}<br>
        Birth Date: ${escapeHtml(solar.birthDate)}<br>
        Return Date: ${escapeHtml(solar.returnDate)}
      </p>
    </header>

    <section class="section">
      <h3>Yearly Themes</h3>
      <ul class="themes-list">
        ${solar.themes.map((t: string) => `<li>★ ${escapeHtml(t)}</li>`).join('')}
      </ul>
    </section>

    <section class="section">
      <h3>Key Dates</h3>
      <table class="dates-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Event</th>
          </tr>
        </thead>
        <tbody>
          ${solar.keyDates
            .map(
              (kd: { date: string; event: string }) => `
            <tr>
              <td>${escapeHtml(kd.date)}</td>
              <td>${escapeHtml(kd.event)}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </section>

    <footer class="chart-footer">
      <p>Generated by AstroVerse on ${new Date().toLocaleDateString()}</p>
      <p class="disclaimer">This report is for entertainment purposes only.</p>
    </footer>
  </div>
</body>
</html>`;
  }

  /**
   * Generate generic chart HTML
   */
  private generateGenericChartHTML(data: ChartData, styles: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.title)}</title>
  <style>${styles}</style>
</head>
<body>
  <div class="document">
    <header class="chart-header">
      <h1>${escapeHtml(data.title)}</h1>
      <p class="birth-info">Generated: ${data.generatedAt.toLocaleString()}</p>
    </header>

    <section class="section">
      <pre>${escapeHtml(JSON.stringify(data.data, null, 2))}</pre>
    </section>

    <footer class="chart-footer">
      <p>Generated by AstroVerse</p>
    </footer>
  </div>
</body>
</html>`;
  }

  /**
   * Base CSS styles for PDFs
   */
  private getBaseStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #1a1a2e;
        background: #ffffff;
      }

      .document {
        max-width: 100%;
        padding: 10mm;
      }

      .chart-header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #6b3de1;
      }

      .chart-header h1 {
        font-size: 24pt;
        color: #6b3de1;
        margin-bottom: 10px;
      }

      .chart-header h2 {
        font-size: 18pt;
        color: #333;
        margin-bottom: 10px;
      }

      .birth-info {
        font-size: 10pt;
        color: #666;
      }

      .section {
        margin-bottom: 25px;
        page-break-inside: avoid;
      }

      .section h3 {
        font-size: 14pt;
        color: #6b3de1;
        margin-bottom: 15px;
        padding-bottom: 5px;
        border-bottom: 1px solid #e0e0e0;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
      }

      th, td {
        padding: 8px 12px;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      th {
        background-color: #f5f5f5;
        font-weight: 600;
        color: #333;
      }

      tr:hover {
        background-color: #fafafa;
      }

      .symbol {
        font-size: 14pt;
      }

      .elements-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        margin-top: 10px;
      }

      .element {
        text-align: center;
        padding: 15px;
        border-radius: 8px;
        background: #f9f9f9;
      }

      .element.fire { background: #fff3e0; }
      .element.earth { background: #e8f5e9; }
      .element.air { background: #e3f2fd; }
      .element.water { background: #e0f7fa; }

      .element .symbol {
        font-size: 24pt;
        display: block;
        margin-bottom: 5px;
      }

      .element .label {
        display: block;
        font-weight: 600;
        margin-bottom: 5px;
      }

      .element .count {
        font-size: 18pt;
        color: #6b3de1;
        font-weight: bold;
      }

      .scores-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 10px;
        margin-top: 15px;
      }

      .score-card {
        text-align: center;
        padding: 15px 10px;
        background: #f9f9f9;
        border-radius: 8px;
      }

      .score-card.overall {
        background: linear-gradient(135deg, #6b3de1 0%, #9c6ade 100%);
        color: white;
      }

      .score-circle {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .score-value {
        font-size: 24pt;
        font-weight: bold;
      }

      .score-label {
        font-size: 9pt;
        text-transform: uppercase;
        margin-top: 5px;
      }

      .aspect-type.harmonious {
        color: #4caf50;
      }

      .aspect-type.challenging {
        color: #f44336;
      }

      .strengths-list, .challenges-list, .themes-list {
        list-style: none;
        padding-left: 0;
      }

      .strengths-list li, .challenges-list li, .themes-list li {
        padding: 8px 0;
        border-bottom: 1px solid #eee;
      }

      .chart-footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
        text-align: center;
        font-size: 9pt;
        color: #666;
      }

      .disclaimer {
        font-style: italic;
        margin-top: 10px;
        color: #999;
      }

      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .section { page-break-inside: avoid; }
      }
    `;
  }

  /**
   * Default header template
   */
  private getDefaultHeader(chartData: ChartData): string {
    return `
      <div style="font-size: 9px; padding: 5px 20px; width: 100%; text-align: center; color: #666;">
        <span>AstroVerse - ${escapeHtml(chartData.title)}</span>
      </div>
    `;
  }

  /**
   * Default footer template
   */
  private getDefaultFooter(): string {
    return `
      <div style="font-size: 9px; padding: 5px 20px; width: 100%; text-align: center; color: #666;">
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        <span style="margin-left: 20px;">Generated by AstroVerse</span>
      </div>
    `;
  }

  /**
   * Capitalize first letter
   */
  private capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Close browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.browserPromise = null;
    }
  }
}

export default PDFGenerationService;
