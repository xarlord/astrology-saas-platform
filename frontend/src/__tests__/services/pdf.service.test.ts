/**
 * PDF Service Tests
 *
 * Tests for client-side PDF generation functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import pdfService, {
  type PDFGenerationOptions,
  type NatalReportData,
  type TransitReportData,
  type SynastryReportData,
  type SolarReturnReportData,
  type LunarReturnReportData,
} from '../../services/pdf.service';
import type {
  CalculatedChart,
  Chart,
  BirthData,
  PlanetPosition,
  Aspect,
  House,
  ChartAngles,
  ZodiacPosition,
  TransitResponse,
  SynastryResponse,
  SolarReturnResponse,
  LunarReturnResponse,
} from '../../types/api.types';

// Mock jspdf
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    setProperties: vi.fn(),
    setFillColor: vi.fn(),
    rect: vi.fn(),
    circle: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    getTextWidth: vi.fn().mockReturnValue(50),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    line: vi.fn(),
    splitTextToSize: vi.fn().mockReturnValue(['test line']),
    addImage: vi.fn(),
    addPage: vi.fn(),
    getNumberOfPages: vi.fn().mockReturnValue(1),
    setPage: vi.fn(),
    output: vi.fn().mockReturnValue(new Blob(['pdf content'], { type: 'application/pdf' })),
    get currentPage(): number { return 1; },
    internal: {
      pageSize: { width: 210, height: 297 },
    },
  })),
}));

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mock'),
    width: 400,
    height: 400,
  }),
}));

// ============================================================================
// TEST DATA
// ============================================================================

const createMockBirthData = (): BirthData => ({
  name: 'Test Person',
  birthDate: '1990-01-15',
  birthTime: '14:30',
  birthPlace: 'New York, NY, USA',
  latitude: 40.7128,
  longitude: -74.006,
  timezone: 'America/New_York',
});

const createMockChart = (): Chart => ({
  id: 'chart-1',
  userId: 'user-1',
  name: 'Test Chart',
  type: 'natal',
  birthData: createMockBirthData(),
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isDefault: true,
});

const createMockZodiacPosition = (): ZodiacPosition => ({
  sign: 'Aries',
  degree: 15,
  minute: 30,
  second: 0,
  exactDegree: 15.5,
});

const createMockAngles = (): ChartAngles => ({
  ascendant: createMockZodiacPosition(),
  midheaven: { ...createMockZodiacPosition(), sign: 'Capricorn' },
  descendant: { ...createMockZodiacPosition(), sign: 'Libra' },
  ic: { ...createMockZodiacPosition(), sign: 'Cancer' },
});

const createMockPositions = (): PlanetPosition[] => [
  {
    planet: 'Sun',
    sign: 'Aquarius',
    degree: 25,
    minute: 10,
    second: 0,
    house: 11,
    retrograde: false,
    element: 'air',
    quality: 'fixed',
  },
  {
    planet: 'Moon',
    sign: 'Pisces',
    degree: 8,
    minute: 45,
    second: 0,
    house: 12,
    retrograde: false,
    element: 'water',
    quality: 'mutable',
  },
  {
    planet: 'Mercury',
    sign: 'Capricorn',
    degree: 5,
    minute: 20,
    second: 0,
    house: 10,
    retrograde: true,
    element: 'earth',
    quality: 'cardinal',
  },
];

const createMockAspects = (): Aspect[] => [
  {
    id: 'aspect-1',
    planets: ['Sun', 'Moon'],
    type: 'trine',
    degree: 120,
    minute: 0,
    orb: 2.5,
    applying: true,
    dignities: {
      rulership: 0,
      exaltation: 0,
      detriment: 0,
      fall: 0,
      triplicity: 0,
      terms: 0,
      face: 0,
    },
  },
];

const createMockHouses = (): House[] => [
  { number: 1, sign: 'Aries', cuspDegree: 15, cuspMinute: 30, planets: [] },
  { number: 2, sign: 'Taurus', cuspDegree: 45, cuspMinute: 15, planets: ['Venus'] },
];

const createMockCalculatedChart = (): CalculatedChart => ({
  chart: createMockChart(),
  positions: createMockPositions(),
  aspects: createMockAspects(),
  houses: createMockHouses(),
  angles: createMockAngles(),
  patterns: [],
});

const createMockNatalReportData = (): NatalReportData => ({
  chart: createMockCalculatedChart(),
  personality: {
    coreIdentity: 'You are a unique individual with strong Aquarian traits.',
    emotionalNature: 'Your Moon in Pisces gives you deep emotional sensitivity.',
    mentalStyle: 'Mercury in Capricorn provides practical and structured thinking.',
  },
});

// ============================================================================
// TESTS
// ============================================================================

describe('PDF Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateReport', () => {
    it('should generate a natal report successfully', async () => {
      const options: PDFGenerationOptions = {
        reportType: 'natal',
        title: 'Test Report',
        subtitle: 'Natal Chart Analysis',
      };

      const data = createMockNatalReportData();

      const result = await pdfService.generateReport(options, data);

      expect(result.success).toBe(true);
      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.error).toBeUndefined();
    });

    it('should call progress callback during generation', async () => {
      const progressCallback = vi.fn();

      const options: PDFGenerationOptions = {
        reportType: 'natal',
        title: 'Test Report',
        onProgress: progressCallback,
      };

      const data = createMockNatalReportData();

      await pdfService.generateReport(options, data);

      expect(progressCallback).toHaveBeenCalled();
      expect(progressCallback).toHaveBeenLastCalledWith(100);
    });

    it('should include chart image when chartElement is provided', async () => {
      const mockElement = document.createElement('div');
      mockElement.id = 'test-chart';
      document.body.appendChild(mockElement);

      const options: PDFGenerationOptions = {
        reportType: 'natal',
        title: 'Test Report',
        includeChartImage: true,
        chartElement: mockElement,
      };

      const data = createMockNatalReportData();

      const result = await pdfService.generateReport(options, data);

      expect(result.success).toBe(true);

      document.body.removeChild(mockElement);
    });

    it('should handle generation without personality analysis', async () => {
      const options: PDFGenerationOptions = {
        reportType: 'natal',
        title: 'Test Report',
      };

      const data: NatalReportData = {
        chart: createMockCalculatedChart(),
      };

      const result = await pdfService.generateReport(options, data);

      expect(result.success).toBe(true);
    });
  });

  describe('Transit Report Generation', () => {
    it('should generate a transit report successfully', async () => {
      const transitData: TransitResponse = {
        chartId: 'chart-1',
        period: {
          start: '2024-01-01',
          end: '2024-12-31',
        },
        dailyTransits: [
          {
            date: '2024-01-15',
            aspects: [],
            mood: {
              overall: 'Energetic',
              energy: 'high',
              focus: ['career', 'relationships'],
            },
            keyEvents: [],
          },
        ],
        majorTransits: [
          {
            planet: 'Saturn',
            type: 'Conjunction',
            startDate: '2024-01-01',
            endDate: '2024-03-01',
            peakDate: '2024-02-01',
            aspects: [],
            significance: 'major',
            description: 'Saturn conjunct natal Sun',
          },
        ],
        lunarPhases: [],
      };

      const options: PDFGenerationOptions = {
        reportType: 'transit',
        title: 'Transit Report',
      };

      const data: TransitReportData = {
        transits: transitData,
        chartName: 'Test Chart',
      };

      const result = await pdfService.generateReport(options, data);

      expect(result.success).toBe(true);
    });
  });

  describe('Synastry Report Generation', () => {
    it('should generate a synastry report successfully', async () => {
      const synastryData: SynastryResponse = {
        id: 'synastry-1',
        chart1: createMockChart(),
        chart2: { ...createMockChart(), id: 'chart-2', name: 'Partner Chart' },
        compositeChart: createMockCalculatedChart(),
        synastryAspects: [
          {
            planet1: { planet: 'Sun', chart: '1' },
            planet2: { planet: 'Moon', chart: '2' },
            type: 'conjunction',
            degree: 0,
            orb: 2.0,
            influence: 'harmonious',
            significance: 'major',
            interpretation: 'Strong emotional connection',
          },
        ],
        compatibilityAnalysis: {
          overallScore: 85,
          romanticScore: 90,
          communicationScore: 80,
          emotionalScore: 85,
          valuesScore: 88,
          longTermPotential: 82,
          keyFactors: ['Sun-Moon connection', 'Venus-Mars harmony'],
        },
        relationshipDynamics: [],
        strengths: ['Strong communication', 'Shared values'],
        challenges: ['Different approaches to money'],
        recommendations: ['Practice patience', 'Communicate openly'],
        generatedAt: '2024-01-01T00:00:00Z',
      };

      const options: PDFGenerationOptions = {
        reportType: 'synastry',
        title: 'Synastry Report',
      };

      const data: SynastryReportData = {
        synastry: synastryData,
        person1Name: 'Person A',
        person2Name: 'Person B',
      };

      const result = await pdfService.generateReport(options, data);

      expect(result.success).toBe(true);
    });
  });

  describe('Solar Return Report Generation', () => {
    it('should generate a solar return report successfully', async () => {
      const solarReturnData: SolarReturnResponse = {
        id: 'solar-1',
        chartId: 'chart-1',
        year: 2024,
        returnDate: '2024-01-15',
        location: {
          latitude: 40.7128,
          longitude: -74.006,
          placeName: 'New York, NY',
        },
        solarReturnChart: createMockCalculatedChart(),
        analysis: {
          overview: 'A year of growth and transformation',
          dominantThemes: ['Career advancement', 'Personal development'],
          houseEmphasis: [10, 1, 4],
          majorAspects: [],
          recommendations: ['Focus on goals', 'Take calculated risks'],
        },
        themes: ['Transformation', 'Growth', 'Success'],
        keyDates: [
          {
            date: '2024-04-15',
            event: 'Jupiter return',
            significance: 'Major expansion period',
            activatedHouses: [10, 1],
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
      };

      const options: PDFGenerationOptions = {
        reportType: 'solar-return',
        title: 'Solar Return Report',
      };

      const data: SolarReturnReportData = {
        solarReturn: solarReturnData,
        chartName: 'Test Chart',
      };

      const result = await pdfService.generateReport(options, data);

      expect(result.success).toBe(true);
    });
  });

  describe('Lunar Return Report Generation', () => {
    it('should generate a lunar return report successfully', async () => {
      const lunarReturnData: LunarReturnResponse = {
        id: 'lunar-1',
        chartId: 'chart-1',
        returnDate: '2024-01-20',
        location: {
          latitude: 40.7128,
          longitude: -74.006,
          placeName: 'New York, NY',
        },
        lunarReturnChart: createMockCalculatedChart(),
        analysis: {
          emotionalOverview: 'A month of emotional introspection',
          moodThemes: ['Reflective', 'Creative', 'Intuitive'],
          focusAreas: ['Home', 'Family', 'Inner work'],
          houseEmphasis: [4, 12],
          aspects: [],
          recommendations: ['Journal regularly', 'Spend time near water'],
        },
        emotionalThemes: ['Nurturing', 'Self-care', 'Healing'],
        createdAt: '2024-01-01T00:00:00Z',
      };

      const options: PDFGenerationOptions = {
        reportType: 'lunar-return',
        title: 'Lunar Return Report',
      };

      const data: LunarReturnReportData = {
        lunarReturn: lunarReturnData,
        chartName: 'Test Chart',
      };

      const result = await pdfService.generateReport(options, data);

      expect(result.success).toBe(true);
    });
  });

  describe('downloadPDF', () => {
    it('should trigger download with correct filename', () => {
      const blob = new Blob(['test'], { type: 'application/pdf' });
      const createObjectURL = vi.fn().mockReturnValue('blob:test-url');
      const revokeObjectURL = vi.fn();

      URL.createObjectURL = createObjectURL;
      URL.revokeObjectURL = revokeObjectURL;

      // Mock createElement and appendChild
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLAnchorElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as HTMLAnchorElement);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as HTMLAnchorElement);

      pdfService.downloadPDF(blob, 'test-report.pdf');

      expect(mockLink.download).toBe('test-report.pdf');
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('printPDF', () => {
    it('should open print window with PDF', () => {
      const blob = new Blob(['test'], { type: 'application/pdf' });
      const createObjectURL = vi.fn().mockReturnValue('blob:test-url');

      URL.createObjectURL = createObjectURL;

      const mockWindow = {
        onload: null as (() => void) | null,
        print: vi.fn(),
      };
      vi.spyOn(window, 'open').mockReturnValue(mockWindow as unknown as Window);

      pdfService.printPDF(blob);

      expect(window.open).toHaveBeenCalledWith('blob:test-url', '_blank');
    });
  });
});
