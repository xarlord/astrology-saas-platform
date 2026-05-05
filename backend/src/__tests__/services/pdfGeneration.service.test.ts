/**
 * Tests for PDF Generation Service
 *
 * Strategy: Puppeteer is mocked entirely since it requires a browser binary.
 * We test the HTML generation logic, browser lifecycle, PDF options,
 * and utility methods through a combination of:
 * - Private method access via (service as any) for HTML generation
 * - Mocked puppeteer for browser/page interactions
 * - Environment variable manipulation for sandbox configuration
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

// ---------------------------------------------------------------------------
// Mock puppeteer BEFORE importing the service under test
// ---------------------------------------------------------------------------

const mockPage = {
  setContent: jest.fn(),
  pdf: jest.fn(),
  close: jest.fn(),
};

const mockBrowser = {
  newPage: jest.fn(),
  close: jest.fn(),
  isConnected: jest.fn(),
};

jest.mock('puppeteer', () => ({
  __esModule: true,
  default: {
    launch: jest.fn(),
  },
}));

import { PDFGenerationService } from '../../modules/shared/services/pdfGeneration.service';
import type {
  ChartData,
  NatalChartData,
  SynastryChartData,
  SolarReturnChartData,
  TransitChartData,
  PDFGenerationOptions,
  PlanetPosition,
  HouseCusp,
  AspectData,
  ElementalDistribution,
  ModalityDistribution,
} from '../../modules/shared/services/pdfGeneration.service';

// ---------------------------------------------------------------------------
// Test data factories
// ---------------------------------------------------------------------------

function makePlanetPosition(overrides: Partial<PlanetPosition> = {}): PlanetPosition {
  return {
    name: 'Sun',
    symbol: 'Sun',
    longitude: 45.5,
    sign: 'taurus',
    degree: 15,
    retrograde: false,
    house: 1,
    ...overrides,
  };
}

function makeHouseCusp(overrides: Partial<HouseCusp> = {}): HouseCusp {
  return {
    number: 1,
    sign: 'aries',
    degree: 0,
    ...overrides,
  };
}

function makeAspectData(overrides: Partial<AspectData> = {}): AspectData {
  return {
    planet1: 'Sun',
    planet2: 'Moon',
    type: 'conjunction',
    angle: 0,
    orb: 2.5,
    applying: true,
    ...overrides,
  };
}

function makeElements(overrides: Partial<ElementalDistribution> = {}): ElementalDistribution {
  return { fire: 3, earth: 2, air: 4, water: 1, ...overrides };
}

function makeModalities(overrides: Partial<ModalityDistribution> = {}): ModalityDistribution {
  return { cardinal: 2, fixed: 4, mutable: 4, ...overrides };
}

function makeNatalChartData(overrides: Partial<NatalChartData> = {}): NatalChartData {
  return {
    name: 'John Doe',
    birthDate: '1990-01-15',
    birthTime: '14:30',
    birthLocation: 'New York, NY',
    planets: {
      Sun: makePlanetPosition({
        name: 'Sun',
        symbol: 'Sun',
        sign: 'capricorn',
        degree: 25,
        house: 9,
      }),
      Moon: makePlanetPosition({
        name: 'Moon',
        symbol: 'Moon',
        sign: 'pisces',
        degree: 10,
        house: 11,
      }),
      Mercury: makePlanetPosition({
        name: 'Mercury',
        symbol: 'Mercury',
        sign: 'sagittarius',
        degree: 5,
        house: 8,
        retrograde: true,
      }),
    },
    houses: [
      makeHouseCusp({ number: 1, sign: 'aries', degree: 0 }),
      makeHouseCusp({ number: 2, sign: 'taurus', degree: 30 }),
    ],
    aspects: [
      makeAspectData({ planet1: 'Sun', planet2: 'Moon', type: 'conjunction', orb: 3.2 }),
      makeAspectData({ planet1: 'Mercury', planet2: 'Venus', type: 'trine', orb: 1.5 }),
    ],
    elements: makeElements(),
    modalities: makeModalities(),
    ...overrides,
  };
}

function makeSynastryChartData(overrides: Partial<SynastryChartData> = {}): SynastryChartData {
  return {
    person1: { name: 'Alice', birthDate: '1990-05-10' },
    person2: { name: 'Bob', birthDate: '1988-11-22' },
    overallScore: 78,
    romanticScore: 82,
    communicationScore: 70,
    emotionalScore: 75,
    valuesScore: 65,
    aspects: [makeAspectData({ planet1: 'Venus', planet2: 'Mars', type: 'opposition', orb: 4.0 })],
    strengths: ['Strong emotional bond', 'Good communication'],
    challenges: ['Different values on money'],
    ...overrides,
  };
}

function makeSolarReturnChartData(
  overrides: Partial<SolarReturnChartData> = {},
): SolarReturnChartData {
  return {
    name: 'Jane Smith',
    birthDate: '1985-03-20',
    returnYear: 2025,
    returnDate: '2025-03-20T08:00:00Z',
    planets: {
      Sun: makePlanetPosition({ name: 'Sun', sign: 'aries', degree: 0 }),
    },
    houses: [makeHouseCusp()],
    themes: ['Career growth', 'New relationships'],
    keyDates: [
      { date: '2025-06-15', event: 'Jupiter transit' },
      { date: '2025-09-01', event: 'Saturn return' },
    ],
    ...overrides,
  };
}

function makeTransitChartData(overrides: Partial<TransitChartData> = {}): TransitChartData {
  return {
    date: '2025-04-01',
    transitingPlanets: {
      Saturn: makePlanetPosition({ name: 'Saturn', sign: 'pisces', degree: 15 }),
    },
    aspects: [makeAspectData()],
    highlights: ['Saturn square natal Sun'],
    ...overrides,
  };
}

function makeNatalChart(overrides: Partial<ChartData> = {}): ChartData {
  return {
    type: 'natal',
    title: 'Natal Chart Report',
    generatedAt: new Date('2025-04-01T12:00:00Z'),
    data: makeNatalChartData(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Helper to re-apply mock implementations after resetMocks clears them
// ---------------------------------------------------------------------------
function setupMockImplementations(): void {
  mockPage.setContent.mockResolvedValue(undefined);
  mockPage.pdf.mockResolvedValue(Buffer.from('pdf-content'));
  mockPage.close.mockResolvedValue(undefined);
  mockBrowser.newPage.mockResolvedValue(mockPage);
  mockBrowser.close.mockResolvedValue(undefined);
  mockBrowser.isConnected.mockReturnValue(true);

  const puppeteer = require('puppeteer');
  puppeteer.default.launch.mockResolvedValue(mockBrowser);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PDFGenerationService', () => {
  let service: PDFGenerationService;

  beforeEach(() => {
    setupMockImplementations();
    service = new PDFGenerationService();
  });

  afterEach(async () => {
    // Ensure browser is cleaned up after each test
    await service.close();
  });

  // =========================================================================
  // Utility: capitalize()
  // =========================================================================
  describe('capitalize()', () => {
    it('should capitalize a lowercase string', () => {
      expect((service as any).capitalize('hello')).toBe('Hello');
    });

    it('should capitalize an uppercase string to title case', () => {
      expect((service as any).capitalize('HELLO')).toBe('Hello');
    });

    it('should capitalize a mixed case string', () => {
      expect((service as any).capitalize('hELLO')).toBe('Hello');
    });

    it('should return empty string for empty input', () => {
      expect((service as any).capitalize('')).toBe('');
    });

    it('should handle a single character', () => {
      expect((service as any).capitalize('a')).toBe('A');
    });

    it('should handle already capitalized string', () => {
      expect((service as any).capitalize('Capricorn')).toBe('Capricorn');
    });
  });

  // =========================================================================
  // Utility: getBaseStyles()
  // =========================================================================
  describe('getBaseStyles()', () => {
    it('should return a non-empty CSS string', () => {
      const styles = (service as any).getBaseStyles();
      expect(typeof styles).toBe('string');
      expect(styles.length).toBeGreaterThan(100);
    });

    it('should contain key CSS selectors', () => {
      const styles = (service as any).getBaseStyles();
      expect(styles).toContain('body');
      expect(styles).toContain('.chart-header');
      expect(styles).toContain('.section');
      expect(styles).toContain('table');
      expect(styles).toContain('.element');
      expect(styles).toContain('.score-card');
    });

    it('should include the AstroVerse brand color', () => {
      const styles = (service as any).getBaseStyles();
      expect(styles).toContain('#6b3de1');
    });

    it('should include print media query', () => {
      const styles = (service as any).getBaseStyles();
      expect(styles).toContain('@media print');
    });

    it('should include font-family declaration', () => {
      const styles = (service as any).getBaseStyles();
      expect(styles).toContain('font-family');
    });
  });

  // =========================================================================
  // Utility: getDefaultHeader()
  // =========================================================================
  describe('getDefaultHeader()', () => {
    it('should include the chart title', () => {
      const chartData = makeNatalChart({ title: 'My Special Chart' });
      const header = (service as any).getDefaultHeader(chartData);
      expect(header).toContain('My Special Chart');
    });

    it('should include AstroVerse branding', () => {
      const chartData = makeNatalChart();
      const header = (service as any).getDefaultHeader(chartData);
      expect(header).toContain('AstroVerse');
    });

    it('should contain inline styles', () => {
      const chartData = makeNatalChart();
      const header = (service as any).getDefaultHeader(chartData);
      expect(header).toContain('font-size');
      expect(header).toContain('text-align');
    });
  });

  // =========================================================================
  // Utility: getDefaultFooter()
  // =========================================================================
  describe('getDefaultFooter()', () => {
    it('should include page number placeholders', () => {
      const footer = (service as any).getDefaultFooter();
      expect(footer).toContain('pageNumber');
      expect(footer).toContain('totalPages');
    });

    it('should include AstroVerse branding', () => {
      const footer = (service as any).getDefaultFooter();
      expect(footer).toContain('AstroVerse');
    });

    it('should contain inline styles', () => {
      const footer = (service as any).getDefaultFooter();
      expect(footer).toContain('font-size');
      expect(footer).toContain('text-align');
    });
  });

  // =========================================================================
  // HTML Generation: generateNatalChartHTML()
  // =========================================================================
  describe('generateNatalChartHTML()', () => {
    it('should produce a valid HTML document', () => {
      const styles = (service as any).getBaseStyles();
      const chartData = makeNatalChart({ data: makeNatalChartData() });
      const html = (service as any).generateNatalChartHTML(chartData, styles);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('</html>');
    });

    it('should include the person name in the header', () => {
      const styles = (service as any).getBaseStyles();
      const chartData = makeNatalChart({ data: makeNatalChartData({ name: 'Test Person' }) });
      const html = (service as any).generateNatalChartHTML(chartData, styles);

      expect(html).toContain('Test Person');
    });

    it('should include birth date, time, and location', () => {
      const styles = (service as any).getBaseStyles();
      const chartData = makeNatalChart({
        data: makeNatalChartData({
          birthDate: '1995-07-20',
          birthTime: '09:15',
          birthLocation: 'Los Angeles, CA',
        }),
      });
      const html = (service as any).generateNatalChartHTML(chartData, styles);

      expect(html).toContain('1995-07-20');
      expect(html).toContain('09:15');
      expect(html).toContain('Los Angeles, CA');
    });

    it('should include planet names in the planetary positions table', () => {
      const styles = (service as any).getBaseStyles();
      const chartData = makeNatalChart({ data: makeNatalChartData() });
      const html = (service as any).generateNatalChartHTML(chartData, styles);

      expect(html).toContain('Sun');
      expect(html).toContain('Moon');
      expect(html).toContain('Mercury');
    });

    it('should include zodiac symbols for planet signs', () => {
      const styles = (service as any).getBaseStyles();
      const chartData = makeNatalChart({
        data: makeNatalChartData({
          planets: {
            Sun: makePlanetPosition({ name: 'Sun', sign: 'taurus' }),
          },
          aspects: [],
        }),
      });
      const html = (service as any).generateNatalChartHTML(chartData, styles);

      // ZODIAC_SYMBOLS['taurus'] === '\u2649'
      expect(html).toContain('\u2649');
    });

    it('should display retrograde indicator for retrograde planets', () => {
      const styles = (service as any).getBaseStyles();
      const chartData = makeNatalChart({
        data: makeNatalChartData({
          planets: {
            Mercury: makePlanetPosition({
              name: 'Mercury',
              symbol: 'Mercury',
              sign: 'sagittarius',
              degree: 5,
              retrograde: true,
            }),
          },
        }),
      });
      const html = (service as any).generateNatalChartHTML(chartData, styles);

      // Retrograde column should show 'R'
      expect(html).toMatch(/<td>R<\/td>/);
    });

    it('should display dash for planets without a house', () => {
      const styles = (service as any).getBaseStyles();
      const chartData = makeNatalChart({
        data: makeNatalChartData({
          planets: {
            Sun: makePlanetPosition({ name: 'Sun', house: undefined as any }),
          },
          aspects: [],
        }),
      });
      const html = (service as any).generateNatalChartHTML(chartData, styles);

      // House column should show '-' when house is undefined
      expect(html).toMatch(/<td>-<\/td>/);
    });

    it('should not show R for non-retrograde planets', () => {
      const styles = (service as any).getBaseStyles();
      const chartData = makeNatalChart({
        data: makeNatalChartData({
          planets: {
            Sun: makePlanetPosition({ name: 'Sun', retrograde: false }),
          },
          aspects: [],
        }),
      });
      const html = (service as any).generateNatalChartHTML(chartData, styles);

      // Non-retrograde should have empty cell, not 'R'
      const retrogradeCells = html.match(/<td>R<\/td>/g);
      expect(retrogradeCells).toBeNull();
    });

    it('should render elemental balance section', () => {
      const styles = (service as any).getBaseStyles();
      const chartData = makeNatalChart({
        data: makeNatalChartData({ elements: { fire: 5, earth: 3, air: 1, water: 2 } }),
      });
      const html = (service as any).generateNatalChartHTML(chartData, styles);

      expect(html).toContain('Elemental Balance');
      expect(html).toContain('>5<'); // fire count
      expect(html).toContain('>3<'); // earth count
      expect(html).toContain('>1<'); // air count
      expect(html).toContain('>2<'); // water count
    });

    it('should render aspects table when aspects are present', () => {
      const styles = (service as any).getBaseStyles();
      const chartData = makeNatalChart({
        data: makeNatalChartData({
          aspects: [
            makeAspectData({ planet1: 'Sun', planet2: 'Moon', type: 'conjunction', orb: 3.2 }),
          ],
        }),
      });
      const html = (service as any).generateNatalChartHTML(chartData, styles);

      expect(html).toContain('Major Aspects');
      expect(html).toContain('Sun');
      expect(html).toContain('Moon');
      expect(html).toContain('Conjunction');
    });

    it('should omit aspects section when aspects array is empty', () => {
      const styles = (service as any).getBaseStyles();
      const chartData = makeNatalChart({
        data: makeNatalChartData({ aspects: [] }),
      });
      const html = (service as any).generateNatalChartHTML(chartData, styles);

      expect(html).not.toContain('Major Aspects');
    });

    it('should limit aspects to 15', () => {
      const styles = (service as any).getBaseStyles();
      const manyAspects = Array.from({ length: 20 }, (_, i) =>
        makeAspectData({ planet1: 'Sun', planet2: `Planet${i}`, type: 'conjunction', orb: i }),
      );
      const chartData = makeNatalChart({
        data: makeNatalChartData({ aspects: manyAspects }),
      });
      const html = (service as any).generateNatalChartHTML(chartData, styles);

      // Count the <tr> rows inside the aspect tbody (each aspect creates one)
      const matches = html.match(/<td>Sun<\/td>/g);
      expect(matches).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(matches!.length).toBe(15);
    });

    it('should include the disclaimer footer', () => {
      const styles = (service as any).getBaseStyles();
      const chartData = makeNatalChart({ data: makeNatalChartData() });
      const html = (service as any).generateNatalChartHTML(chartData, styles);

      expect(html).toContain('entertainment purposes only');
      expect(html).toContain('AstroVerse');
    });

    it('should include the title tag with the chart name', () => {
      const styles = (service as any).getBaseStyles();
      const chartData = makeNatalChart({ data: makeNatalChartData({ name: 'Jane' }) });
      const html = (service as any).generateNatalChartHTML(chartData, styles);

      expect(html).toContain('<title>Natal Chart - Jane</title>');
    });
  });

  // =========================================================================
  // HTML Generation: generateSynastryHTML()
  // =========================================================================
  describe('generateSynastryHTML()', () => {
    it('should produce a valid HTML document', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'synastry',
        title: 'Synastry Report',
        generatedAt: new Date(),
        data: makeSynastryChartData(),
      };
      const html = (service as any).generateSynastryHTML(chartData, styles);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('should display both person names in the header', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'synastry',
        title: 'Synastry Report',
        generatedAt: new Date(),
        data: makeSynastryChartData({
          person1: { name: 'Alice', birthDate: '1990-01-01' },
          person2: { name: 'Bob', birthDate: '1992-02-02' },
        }),
      };
      const html = (service as any).generateSynastryHTML(chartData, styles);

      expect(html).toContain('Alice');
      expect(html).toContain('Bob');
    });

    it('should display birth dates for both persons', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'synastry',
        title: 'Synastry Report',
        generatedAt: new Date(),
        data: makeSynastryChartData({
          person1: { name: 'A', birthDate: '1990-01-01' },
          person2: { name: 'B', birthDate: '1992-02-02' },
        }),
      };
      const html = (service as any).generateSynastryHTML(chartData, styles);

      expect(html).toContain('1990-01-01');
      expect(html).toContain('1992-02-02');
    });

    it('should render all compatibility scores', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'synastry',
        title: 'Synastry Report',
        generatedAt: new Date(),
        data: makeSynastryChartData({
          overallScore: 78,
          romanticScore: 82,
          communicationScore: 70,
          emotionalScore: 75,
          valuesScore: 65,
        }),
      };
      const html = (service as any).generateSynastryHTML(chartData, styles);

      expect(html).toContain('>78<');
      expect(html).toContain('>82<');
      expect(html).toContain('>70<');
      expect(html).toContain('>75<');
      expect(html).toContain('>65<');
    });

    it('should render score labels', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'synastry',
        title: 'Synastry Report',
        generatedAt: new Date(),
        data: makeSynastryChartData(),
      };
      const html = (service as any).generateSynastryHTML(chartData, styles);

      expect(html).toContain('Overall');
      expect(html).toContain('Romantic');
      expect(html).toContain('Communication');
      expect(html).toContain('Emotional');
      expect(html).toContain('Values');
    });

    it('should render strengths list', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'synastry',
        title: 'Synastry Report',
        generatedAt: new Date(),
        data: makeSynastryChartData({
          strengths: ['Deep trust', 'Shared humor'],
        }),
      };
      const html = (service as any).generateSynastryHTML(chartData, styles);

      expect(html).toContain('Relationship Strengths');
      expect(html).toContain('Deep trust');
      expect(html).toContain('Shared humor');
    });

    it('should render challenges list', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'synastry',
        title: 'Synastry Report',
        generatedAt: new Date(),
        data: makeSynastryChartData({
          challenges: ['Communication gap', 'Different spending habits'],
        }),
      };
      const html = (service as any).generateSynastryHTML(chartData, styles);

      expect(html).toContain('Areas for Growth');
      expect(html).toContain('Communication gap');
      expect(html).toContain('Different spending habits');
    });

    it('should render aspects table when aspects are present', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'synastry',
        title: 'Synastry Report',
        generatedAt: new Date(),
        data: makeSynastryChartData({
          aspects: [
            {
              planet1: 'Venus',
              planet2: 'Mars',
              type: 'opposition',
              angle: 180,
              orb: 4.0,
              harmonious: false,
            } as any,
          ],
        }),
      };
      const html = (service as any).generateSynastryHTML(chartData, styles);

      expect(html).toContain('Key Synastry Aspects');
      expect(html).toContain('Venus');
      expect(html).toContain('Mars');
    });

    it('should omit aspects section when aspects array is empty', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'synastry',
        title: 'Synastry Report',
        generatedAt: new Date(),
        data: makeSynastryChartData({ aspects: [] }),
      };
      const html = (service as any).generateSynastryHTML(chartData, styles);

      expect(html).not.toContain('Key Synastry Aspects');
    });

    it('should include disclaimer in footer', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'synastry',
        title: 'Synastry Report',
        generatedAt: new Date(),
        data: makeSynastryChartData(),
      };
      const html = (service as any).generateSynastryHTML(chartData, styles);

      expect(html).toContain('entertainment purposes only');
    });

    it('should handle aspects with object planet1/planet2 properties', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'synastry',
        title: 'Synastry Report',
        generatedAt: new Date(),
        data: makeSynastryChartData({
          aspects: [
            {
              planet1: 'Jupiter',
              planet2: 'Neptune',
              type: 'trine',
              angle: 120,
              orb: 2.0,
              harmonious: true,
            } as any,
          ],
        }),
      };
      const html = (service as any).generateSynastryHTML(chartData, styles);

      expect(html).toContain('Jupiter');
      expect(html).toContain('Neptune');
    });
  });

  // =========================================================================
  // HTML Generation: generateSolarReturnHTML()
  // =========================================================================
  describe('generateSolarReturnHTML()', () => {
    it('should produce a valid HTML document', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'solar-return',
        title: 'Solar Return 2025',
        generatedAt: new Date(),
        data: makeSolarReturnChartData(),
      };
      const html = (service as any).generateSolarReturnHTML(chartData, styles);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('should display the return year in the header', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'solar-return',
        title: 'Solar Return 2025',
        generatedAt: new Date(),
        data: makeSolarReturnChartData({ returnYear: 2025 }),
      };
      const html = (service as any).generateSolarReturnHTML(chartData, styles);

      expect(html).toContain('2025');
    });

    it('should display person name and birth date', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'solar-return',
        title: 'Solar Return 2025',
        generatedAt: new Date(),
        data: makeSolarReturnChartData({ name: 'Test User', birthDate: '1985-03-20' }),
      };
      const html = (service as any).generateSolarReturnHTML(chartData, styles);

      expect(html).toContain('Test User');
      expect(html).toContain('1985-03-20');
    });

    it('should display the return date', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'solar-return',
        title: 'Solar Return 2025',
        generatedAt: new Date(),
        data: makeSolarReturnChartData({ returnDate: '2025-03-20T08:00:00Z' }),
      };
      const html = (service as any).generateSolarReturnHTML(chartData, styles);

      expect(html).toContain('2025-03-20T08:00:00Z');
    });

    it('should render yearly themes', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'solar-return',
        title: 'Solar Return 2025',
        generatedAt: new Date(),
        data: makeSolarReturnChartData({
          themes: ['Career breakthrough', 'Spiritual growth'],
        }),
      };
      const html = (service as any).generateSolarReturnHTML(chartData, styles);

      expect(html).toContain('Yearly Themes');
      expect(html).toContain('Career breakthrough');
      expect(html).toContain('Spiritual growth');
    });

    it('should render key dates table', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'solar-return',
        title: 'Solar Return 2025',
        generatedAt: new Date(),
        data: makeSolarReturnChartData({
          keyDates: [
            { date: '2025-06-15', event: 'Jupiter enters Cancer' },
            { date: '2025-10-01', event: 'Solar Eclipse' },
          ],
        }),
      };
      const html = (service as any).generateSolarReturnHTML(chartData, styles);

      expect(html).toContain('Key Dates');
      expect(html).toContain('2025-06-15');
      expect(html).toContain('Jupiter enters Cancer');
      expect(html).toContain('2025-10-01');
      expect(html).toContain('Solar Eclipse');
    });

    it('should include disclaimer in footer', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'solar-return',
        title: 'Solar Return 2025',
        generatedAt: new Date(),
        data: makeSolarReturnChartData(),
      };
      const html = (service as any).generateSolarReturnHTML(chartData, styles);

      expect(html).toContain('entertainment purposes only');
    });

    it('should include the title tag with return year', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'solar-return',
        title: 'Solar Return 2025',
        generatedAt: new Date(),
        data: makeSolarReturnChartData({ returnYear: 2025 }),
      };
      const html = (service as any).generateSolarReturnHTML(chartData, styles);

      expect(html).toContain('<title>Solar Return 2025</title>');
    });
  });

  // =========================================================================
  // HTML Generation: generateGenericChartHTML()
  // =========================================================================
  describe('generateGenericChartHTML()', () => {
    it('should produce a valid HTML document', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'transit',
        title: 'Transit Chart',
        generatedAt: new Date('2025-06-01'),
        data: makeTransitChartData(),
      };
      const html = (service as any).generateGenericChartHTML(chartData, styles);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('should include the chart title in an h1 tag', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'transit',
        title: 'Monthly Transit Overview',
        generatedAt: new Date(),
        data: makeTransitChartData(),
      };
      const html = (service as any).generateGenericChartHTML(chartData, styles);

      expect(html).toContain('<h1>Monthly Transit Overview</h1>');
    });

    it('should include the generatedAt date', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'transit',
        title: 'Test',
        generatedAt: new Date('2025-06-15T10:30:00Z'),
        data: makeTransitChartData(),
      };
      const html = (service as any).generateGenericChartHTML(chartData, styles);

      expect(html).toContain('Generated:');
    });

    it('should include a JSON representation of the data', () => {
      const styles = (service as any).getBaseStyles();
      const transitData = makeTransitChartData();
      const chartData: ChartData = {
        type: 'transit',
        title: 'Test',
        generatedAt: new Date(),
        data: transitData,
      };
      const html = (service as any).generateGenericChartHTML(chartData, styles);

      expect(html).toContain('<pre>');
      expect(html).toContain('Saturn');
    });

    it('should include the AstroVerse footer', () => {
      const styles = (service as any).getBaseStyles();
      const chartData: ChartData = {
        type: 'lunar-return',
        title: 'Lunar Return',
        generatedAt: new Date(),
        data: makeTransitChartData(),
      };
      const html = (service as any).generateGenericChartHTML(chartData, styles);

      expect(html).toContain('AstroVerse');
    });
  });

  // =========================================================================
  // HTML Generation: generateChartHTML() dispatching
  // =========================================================================
  describe('generateChartHTML() dispatching', () => {
    it('should dispatch to natal chart HTML for type "natal"', () => {
      const chartData = makeNatalChart();
      const html = (service as any).generateChartHTML(chartData);

      expect(html).toContain('Natal Chart Report');
    });

    it('should dispatch to synastry HTML for type "synastry"', () => {
      const chartData: ChartData = {
        type: 'synastry',
        title: 'Synastry Report',
        generatedAt: new Date(),
        data: makeSynastryChartData(),
      };
      const html = (service as any).generateChartHTML(chartData);

      expect(html).toContain('Synastry Report');
      expect(html).toContain('Compatibility Scores');
    });

    it('should dispatch to solar return HTML for type "solar-return"', () => {
      const chartData: ChartData = {
        type: 'solar-return',
        title: 'Solar Return 2025',
        generatedAt: new Date(),
        data: makeSolarReturnChartData(),
      };
      const html = (service as any).generateChartHTML(chartData);

      expect(html).toContain('Solar Return Report');
    });

    it('should fall back to generic HTML for type "transit"', () => {
      const chartData: ChartData = {
        type: 'transit',
        title: 'Transit Report',
        generatedAt: new Date(),
        data: makeTransitChartData(),
      };
      const html = (service as any).generateChartHTML(chartData);

      expect(html).toContain('<pre>');
    });

    it('should fall back to generic HTML for type "lunar-return"', () => {
      const chartData: ChartData = {
        type: 'lunar-return',
        title: 'Lunar Return Report',
        generatedAt: new Date(),
        data: makeTransitChartData(),
      };
      const html = (service as any).generateChartHTML(chartData);

      expect(html).toContain('<pre>');
    });
  });

  // =========================================================================
  // Browser Lifecycle: getBrowser()
  // =========================================================================
  describe('getBrowser()', () => {
    it('should launch a browser on first call', async () => {
      const puppeteer = require('puppeteer');
      const browser = await (service as any).getBrowser();

      expect(puppeteer.default.launch).toHaveBeenCalledTimes(1);
      expect(browser).toBe(mockBrowser);
    });

    it('should reuse the same browser on subsequent calls (singleton)', async () => {
      const puppeteer = require('puppeteer');
      const browser1 = await (service as any).getBrowser();
      const browser2 = await (service as any).getBrowser();

      expect(puppeteer.default.launch).toHaveBeenCalledTimes(1);
      expect(browser1).toBe(browser2);
    });

    it('should add --no-sandbox and --disable-setuid-sandbox when PUPPETEER_NO_SANDBOX=true', async () => {
      const puppeteer = require('puppeteer');
      process.env.PUPPETEER_NO_SANDBOX = 'true';
      delete process.env.RUNNING_IN_DOCKER;
      delete process.env.NODE_ENV;

      try {
        await (service as any).getBrowser();

        const launchCall = (puppeteer.default.launch as jest.Mock).mock.calls[0][0];
        expect(launchCall.args).toContain('--no-sandbox');
        expect(launchCall.args).toContain('--disable-setuid-sandbox');
      } finally {
        delete process.env.PUPPETEER_NO_SANDBOX;
      }
    });

    it('should add sandbox-disabling args in production when PUPPETEER_NO_SANDBOX is not false', async () => {
      const puppeteer = require('puppeteer');
      process.env.NODE_ENV = 'production';
      delete process.env.PUPPETEER_NO_SANDBOX;
      delete process.env.RUNNING_IN_DOCKER;

      try {
        await (service as any).getBrowser();

        const launchCall = (puppeteer.default.launch as jest.Mock).mock.calls[0][0];
        expect(launchCall.args).toContain('--no-sandbox');
      } finally {
        delete process.env.NODE_ENV;
      }
    });

    it('should NOT disable sandbox in production when PUPPETEER_NO_SANDBOX is false', async () => {
      const puppeteer = require('puppeteer');
      process.env.NODE_ENV = 'production';
      process.env.PUPPETEER_NO_SANDBOX = 'false';
      delete process.env.RUNNING_IN_DOCKER;

      try {
        await (service as any).getBrowser();

        const launchCall = (puppeteer.default.launch as jest.Mock).mock.calls[0][0];
        expect(launchCall.args).not.toContain('--no-sandbox');
      } finally {
        delete process.env.NODE_ENV;
        delete process.env.PUPPETEER_NO_SANDBOX;
      }
    });

    it('should add --single-process when RUNNING_IN_DOCKER=true', async () => {
      const puppeteer = require('puppeteer');
      process.env.RUNNING_IN_DOCKER = 'true';
      delete process.env.PUPPETEER_NO_SANDBOX;
      delete process.env.NODE_ENV;

      try {
        await (service as any).getBrowser();

        const launchCall = (puppeteer.default.launch as jest.Mock).mock.calls[0][0];
        expect(launchCall.args).toContain('--single-process');
      } finally {
        delete process.env.RUNNING_IN_DOCKER;
      }
    });

    it('should always include common stability args', async () => {
      const puppeteer = require('puppeteer');
      delete process.env.PUPPETEER_NO_SANDBOX;
      delete process.env.NODE_ENV;
      delete process.env.RUNNING_IN_DOCKER;

      await (service as any).getBrowser();

      const launchCall = (puppeteer.default.launch as jest.Mock).mock.calls[0][0];
      expect(launchCall.args).toContain('--disable-dev-shm-usage');
      expect(launchCall.args).toContain('--disable-gpu');
      expect(launchCall.args).toContain('--no-first-run');
      expect(launchCall.args).toContain('--no-zygote');
    });

    it('should use PUPPETEER_EXECUTABLE_PATH when set', async () => {
      const puppeteer = require('puppeteer');
      process.env.PUPPETEER_EXECUTABLE_PATH = '/usr/bin/chromium';
      delete process.env.PUPPETEER_NO_SANDBOX;
      delete process.env.NODE_ENV;
      delete process.env.RUNNING_IN_DOCKER;

      try {
        await (service as any).getBrowser();

        const launchCall = (puppeteer.default.launch as jest.Mock).mock.calls[0][0];
        expect(launchCall.executablePath).toBe('/usr/bin/chromium');
      } finally {
        delete process.env.PUPPETEER_EXECUTABLE_PATH;
      }
    });

    it('should pass undefined for executablePath when PUPPETEER_EXECUTABLE_PATH is not set', async () => {
      const puppeteer = require('puppeteer');
      delete process.env.PUPPETEER_EXECUTABLE_PATH;
      delete process.env.PUPPETEER_NO_SANDBOX;
      delete process.env.NODE_ENV;
      delete process.env.RUNNING_IN_DOCKER;

      await (service as any).getBrowser();

      const launchCall = (puppeteer.default.launch as jest.Mock).mock.calls[0][0];
      expect(launchCall.executablePath).toBeUndefined();
    });

    it('should launch in headless mode', async () => {
      const puppeteer = require('puppeteer');
      await (service as any).getBrowser();

      const launchCall = (puppeteer.default.launch as jest.Mock).mock.calls[0][0];
      expect(launchCall.headless).toBe(true);
    });

    it('should add --single-process when sandbox is disabled', async () => {
      const puppeteer = require('puppeteer');
      process.env.PUPPETEER_NO_SANDBOX = 'true';
      delete process.env.RUNNING_IN_DOCKER;
      delete process.env.NODE_ENV;

      try {
        await (service as any).getBrowser();

        const launchCall = (puppeteer.default.launch as jest.Mock).mock.calls[0][0];
        expect(launchCall.args).toContain('--single-process');
      } finally {
        delete process.env.PUPPETEER_NO_SANDBOX;
      }
    });

    it('should return the existing browserPromise when browser is disconnected but promise is set', async () => {
      // First launch sets browserPromise
      const browser1 = await (service as any).getBrowser();
      const puppeteer = require('puppeteer');
      expect(puppeteer.default.launch).toHaveBeenCalledTimes(1);

      // Simulate disconnected browser but promise is still cached
      mockBrowser.isConnected.mockReturnValue(false);

      // getBrowser returns the existing browserPromise without relaunching
      const browser2 = await (service as any).getBrowser();
      expect(puppeteer.default.launch).toHaveBeenCalledTimes(1); // still only 1
      expect(browser2).toBe(browser1);
    });
  });

  // =========================================================================
  // Browser Lifecycle: close()
  // =========================================================================
  describe('close()', () => {
    it('should close the browser and set internal references to null', async () => {
      await (service as any).getBrowser();
      await service.close();

      expect(mockBrowser.close).toHaveBeenCalledTimes(1);
      expect((service as any).browser).toBeNull();
      expect((service as any).browserPromise).toBeNull();
    });

    it('should be safe to call when no browser was created', async () => {
      // Should not throw
      await service.close();
      expect(mockBrowser.close).not.toHaveBeenCalled();
    });

    it('should allow a new browser to be launched after close', async () => {
      const puppeteer = require('puppeteer');
      await (service as any).getBrowser();
      await service.close();

      setupMockImplementations(); // re-apply for the second launch
      await (service as any).getBrowser();

      expect(puppeteer.default.launch).toHaveBeenCalledTimes(2);
    });
  });

  // =========================================================================
  // PDF Generation: generateChartPDF()
  // =========================================================================
  describe('generateChartPDF()', () => {
    it('should generate a PDF Buffer from chart data', async () => {
      const chartData = makeNatalChart();
      const result = await service.generateChartPDF(chartData);

      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should create a new page and set HTML content', async () => {
      const chartData = makeNatalChart();
      await service.generateChartPDF(chartData);

      expect(mockBrowser.newPage).toHaveBeenCalledTimes(1);
      expect(mockPage.setContent).toHaveBeenCalledTimes(1);
    });

    it('should pass waitUntil networkidle0 and timeout to setContent', async () => {
      const chartData = makeNatalChart();
      await service.generateChartPDF(chartData);

      expect(mockPage.setContent).toHaveBeenCalledWith(expect.any(String), {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });
    });

    it('should use A4 format by default', async () => {
      const chartData = makeNatalChart();
      await service.generateChartPDF(chartData);

      const pdfCall = (mockPage.pdf as jest.Mock).mock.calls[0][0];
      expect(pdfCall.format).toBe('A4');
    });

    it('should use Letter format when specified in options', async () => {
      const chartData = makeNatalChart();
      await service.generateChartPDF(chartData, { format: 'Letter' });

      const pdfCall = (mockPage.pdf as jest.Mock).mock.calls[0][0];
      expect(pdfCall.format).toBe('Letter');
    });

    it('should default to portrait orientation', async () => {
      const chartData = makeNatalChart();
      await service.generateChartPDF(chartData);

      const pdfCall = (mockPage.pdf as jest.Mock).mock.calls[0][0];
      expect(pdfCall.landscape).toBe(false);
    });

    it('should use landscape orientation when specified', async () => {
      const chartData = makeNatalChart();
      await service.generateChartPDF(chartData, { landscape: true });

      const pdfCall = (mockPage.pdf as jest.Mock).mock.calls[0][0];
      expect(pdfCall.landscape).toBe(true);
    });

    it('should default printBackground to true', async () => {
      const chartData = makeNatalChart();
      await service.generateChartPDF(chartData);

      const pdfCall = (mockPage.pdf as jest.Mock).mock.calls[0][0];
      expect(pdfCall.printBackground).toBe(true);
    });

    it('should respect printBackground=false option', async () => {
      const chartData = makeNatalChart();
      await service.generateChartPDF(chartData, { printBackground: false });

      const pdfCall = (mockPage.pdf as jest.Mock).mock.calls[0][0];
      expect(pdfCall.printBackground).toBe(false);
    });

    it('should use default margins when none provided', async () => {
      const chartData = makeNatalChart();
      await service.generateChartPDF(chartData);

      const pdfCall = (mockPage.pdf as jest.Mock).mock.calls[0][0];
      expect(pdfCall.margin).toEqual({
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm',
      });
    });

    it('should apply custom margins', async () => {
      const chartData = makeNatalChart();
      await service.generateChartPDF(chartData, {
        margin: { top: '10mm', bottom: '10mm', left: '5mm', right: '5mm' },
      });

      const pdfCall = (mockPage.pdf as jest.Mock).mock.calls[0][0];
      expect(pdfCall.margin).toEqual({
        top: '10mm',
        bottom: '10mm',
        left: '5mm',
        right: '5mm',
      });
    });

    it('should not include header/footer when displayHeaderFooter is not set', async () => {
      const chartData = makeNatalChart();
      await service.generateChartPDF(chartData);

      const pdfCall = (mockPage.pdf as jest.Mock).mock.calls[0][0];
      expect(pdfCall.displayHeaderFooter).toBeUndefined();
      expect(pdfCall.headerTemplate).toBeUndefined();
      expect(pdfCall.footerTemplate).toBeUndefined();
    });

    it('should include header and footer when displayHeaderFooter is true', async () => {
      const chartData = makeNatalChart();
      await service.generateChartPDF(chartData, { displayHeaderFooter: true });

      const pdfCall = (mockPage.pdf as jest.Mock).mock.calls[0][0];
      expect(pdfCall.displayHeaderFooter).toBe(true);
      expect(pdfCall.headerTemplate).toContain('AstroVerse');
      expect(pdfCall.footerTemplate).toContain('pageNumber');
    });

    it('should use custom header/footer templates when provided', async () => {
      const chartData = makeNatalChart();
      const options: PDFGenerationOptions = {
        displayHeaderFooter: true,
        headerTemplate: '<div>Custom Header</div>',
        footerTemplate: '<div>Custom Footer</div>',
      };
      await service.generateChartPDF(chartData, options);

      const pdfCall = (mockPage.pdf as jest.Mock).mock.calls[0][0];
      expect(pdfCall.headerTemplate).toBe('<div>Custom Header</div>');
      expect(pdfCall.footerTemplate).toBe('<div>Custom Footer</div>');
    });

    it('should close the page in the finally block even if pdf generation fails', async () => {
      const chartData = makeNatalChart();
      mockPage.pdf.mockRejectedValueOnce(new Error('PDF failed'));

      await expect(service.generateChartPDF(chartData)).rejects.toThrow('PDF failed');
      expect(mockPage.close).toHaveBeenCalledTimes(1);
    });

    it('should close the page in the finally block on success', async () => {
      const chartData = makeNatalChart();
      await service.generateChartPDF(chartData);

      expect(mockPage.close).toHaveBeenCalledTimes(1);
    });

    it('should handle partial margin overrides using defaults for missing values', async () => {
      const chartData = makeNatalChart();
      await service.generateChartPDF(chartData, {
        margin: { top: '5mm' },
      });

      const pdfCall = (mockPage.pdf as jest.Mock).mock.calls[0][0];
      expect(pdfCall.margin).toEqual({
        top: '5mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm',
      });
    });
  });
});
