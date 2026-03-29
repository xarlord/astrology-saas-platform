/**
 * PDFReportGenerator Component Tests
 *
 * Tests for the PDF report generator UI component
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  CalculatedChart,
  TransitResponse,
  SynastryResponse,
  SolarReturnResponse,
  LunarReturnResponse,
} from '../../types/api.types';

// Create mock functions
const mockGenerateReport = vi.fn().mockResolvedValue({ success: true, blob: new Blob() });
const mockDownloadReport = vi.fn();
const mockPrintReport = vi.fn();
const mockClearError = vi.fn();
const mockReset = vi.fn();

// Mock the usePDFGeneration hook
vi.mock('../../hooks/usePDFGeneration', () => ({
  usePDFGeneration: () => ({
    isGenerating: false,
    progress: 0,
    error: null,
    lastGeneratedBlob: null,
    generateReport: mockGenerateReport,
    downloadReport: mockDownloadReport,
    printReport: mockPrintReport,
    clearError: mockClearError,
    reset: mockReset,
  }),
  getReportTypeName: (type: string) => {
    const names: Record<string, string> = {
      natal: 'Natal Chart Report',
      transit: 'Transit Report',
      synastry: 'Synastry Report',
      'solar-return': 'Solar Return Report',
      'lunar-return': 'Lunar Return Report',
    };
    return names[type] || type;
  },
  getExpectedPageCount: (type: string) => {
    const counts: Record<string, string> = {
      natal: '5-10 pages',
      transit: '3-5 pages',
      synastry: '8-12 pages',
      'solar-return': '4-6 pages',
      'lunar-return': '2-3 pages',
    };
    return counts[type] || '3-5 pages';
  },
  generateReportFilename: (type: string, name?: string) => {
    const date = new Date().toISOString().split('T')[0];
    const namePart = name ? `-${name.toLowerCase().replace(/\s+/g, '-')}` : '';
    return `astroverse-${type}${namePart}-${date}.pdf`;
  },
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Import after mocks
import PDFReportGenerator from '../../components/report/PDFReportGenerator';

// ============================================================================
// TEST DATA
// ============================================================================

const createMockChart = (): CalculatedChart => ({
  chart: {
    id: 'chart-1',
    userId: 'user-1',
    name: 'Test Chart',
    type: 'natal',
    birthData: {
      name: 'Test Person',
      birthDate: '1990-01-15',
      birthTime: '14:30',
      birthPlace: 'New York, NY',
      latitude: 40.7128,
      longitude: -74.006,
      timezone: 'America/New_York',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDefault: true,
  },
  positions: [
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
  ],
  aspects: [],
  houses: [],
  angles: {
    ascendant: { sign: 'Aries', degree: 15, minute: 30, second: 0, exactDegree: 15.5 },
    midheaven: { sign: 'Capricorn', degree: 10, minute: 0, second: 0, exactDegree: 10 },
    descendant: { sign: 'Libra', degree: 15, minute: 30, second: 0, exactDegree: 15.5 },
    ic: { sign: 'Cancer', degree: 10, minute: 0, second: 0, exactDegree: 10 },
  },
  patterns: [],
});

const createMockTransits = (): TransitResponse => ({
  chartId: 'chart-1',
  period: { start: '2024-01-01', end: '2024-12-31' },
  dailyTransits: [],
  majorTransits: [],
  lunarPhases: [],
});

const createMockSynastry = (): SynastryResponse => ({
  id: 'synastry-1',
  chart1: createMockChart().chart,
  chart2: { ...createMockChart().chart, id: 'chart-2' },
  compositeChart: createMockChart(),
  synastryAspects: [],
  compatibilityAnalysis: {
    overallScore: 85,
    romanticScore: 90,
    communicationScore: 80,
    emotionalScore: 85,
    valuesScore: 88,
    longTermPotential: 82,
    keyFactors: [],
  },
  relationshipDynamics: [],
  strengths: [],
  challenges: [],
  recommendations: [],
  generatedAt: '2024-01-01T00:00:00Z',
});

const createMockSolarReturn = (): SolarReturnResponse => ({
  id: 'solar-1',
  chartId: 'chart-1',
  year: 2024,
  returnDate: '2024-01-15',
  solarReturnChart: createMockChart(),
  analysis: {
    overview: 'Test overview',
    dominantThemes: [],
    houseEmphasis: [],
    majorAspects: [],
    recommendations: [],
  },
  themes: [],
  keyDates: [],
  createdAt: '2024-01-01T00:00:00Z',
});

const createMockLunarReturn = (): LunarReturnResponse => ({
  id: 'lunar-1',
  chartId: 'chart-1',
  returnDate: '2024-01-20',
  lunarReturnChart: createMockChart(),
  analysis: {
    emotionalOverview: 'Test overview',
    moodThemes: [],
    focusAreas: [],
    houseEmphasis: [],
    aspects: [],
    recommendations: [],
  },
  emotionalThemes: [],
  createdAt: '2024-01-01T00:00:00Z',
});

// ============================================================================
// TESTS
// ============================================================================

describe('PDFReportGenerator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component with title', () => {
      render(<PDFReportGenerator chart={createMockChart()} />);
      expect(screen.getByText('Generate PDF Report')).toBeInTheDocument();
    });

    it('should render report type selector', () => {
      render(<PDFReportGenerator chart={createMockChart()} />);
      expect(screen.getByText('Report Type')).toBeInTheDocument();
    });

    it('should render generate button', () => {
      render(<PDFReportGenerator chart={createMockChart()} />);
      expect(screen.getByText('Generate Report')).toBeInTheDocument();
    });

    it('should render preview and print buttons', () => {
      render(<PDFReportGenerator chart={createMockChart()} />);
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText('Print')).toBeInTheDocument();
    });
  });

  describe('Report Type Selection', () => {
    it('should show available report types when dropdown is clicked', async () => {
      const user = userEvent.setup();
      render(<PDFReportGenerator chart={createMockChart()} />);

      // Find button containing natal chart report text
      const buttons = screen.getAllByRole('button');
      const dropdownButton = buttons.find(btn => btn.textContent?.includes('Natal Chart Report'));
      expect(dropdownButton).toBeDefined();
      await user.click(dropdownButton!);

      expect(screen.getByText('Transit Report')).toBeInTheDocument();
      expect(screen.getByText('Synastry Report')).toBeInTheDocument();
    });

    it('should disable unavailable report types', async () => {
      const user = userEvent.setup();
      render(<PDFReportGenerator chart={createMockChart()} />);

      const buttons = screen.getAllByRole('button');
      const dropdownButton = buttons.find(btn => btn.textContent?.includes('Natal Chart Report'));
      await user.click(dropdownButton!);

      // Transit should be disabled since no transit data provided
      const transitOption = screen.getByText('Transit Report').closest('button');
      expect(transitOption).toBeDisabled();
    });

    it('should enable report types when data is provided', async () => {
      const user = userEvent.setup();
      render(
        <PDFReportGenerator
          chart={createMockChart()}
          transits={createMockTransits()}
        />
      );

      const buttons = screen.getAllByRole('button');
      const dropdownButton = buttons.find(btn => btn.textContent?.includes('Natal Chart Report'));
      await user.click(dropdownButton!);

      const transitOption = screen.getByText('Transit Report').closest('button');
      expect(transitOption).not.toBeDisabled();
    });

    it('should change selected report type', async () => {
      const user = userEvent.setup();
      render(
        <PDFReportGenerator
          chart={createMockChart()}
          transits={createMockTransits()}
        />
      );

      const buttons = screen.getAllByRole('button');
      const dropdownButton = buttons.find(btn => btn.textContent?.includes('Natal Chart Report'));
      await user.click(dropdownButton!);

      const transitOption = screen.getByText('Transit Report').closest('button');
      await user.click(transitOption!);

      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('Report Generation', () => {
    it('should call generateReport when generate button is clicked', async () => {
      const user = userEvent.setup();
      render(<PDFReportGenerator chart={createMockChart()} />);

      const generateButton = screen.getByText('Generate Report');
      await user.click(generateButton);

      expect(mockGenerateReport).toHaveBeenCalled();
    });
  });

  describe('All Report Types', () => {
    it('should render with transit data', () => {
      render(
        <PDFReportGenerator
          transits={createMockTransits()}
          chartName="Test Transit"
          defaultReportType="transit"
        />
      );
      expect(screen.getByText('Generate PDF Report')).toBeInTheDocument();
    });

    it('should render with synastry data', () => {
      render(
        <PDFReportGenerator
          synastry={createMockSynastry()}
          person1Name="Alice"
          person2Name="Bob"
          defaultReportType="synastry"
        />
      );
      expect(screen.getByText('Generate PDF Report')).toBeInTheDocument();
    });

    it('should render with solar return data', () => {
      render(
        <PDFReportGenerator
          solarReturn={createMockSolarReturn()}
          chartName="Test Solar"
          defaultReportType="solar-return"
        />
      );
      expect(screen.getByText('Generate PDF Report')).toBeInTheDocument();
    });

    it('should render with lunar return data', () => {
      render(
        <PDFReportGenerator
          lunarReturn={createMockLunarReturn()}
          chartName="Test Lunar"
          defaultReportType="lunar-return"
        />
      );
      expect(screen.getByText('Generate PDF Report')).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <PDFReportGenerator chart={createMockChart()} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should not show preview when showPreview is false', () => {
      render(<PDFReportGenerator chart={createMockChart()} showPreview={false} />);
      expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    });
  });
});
