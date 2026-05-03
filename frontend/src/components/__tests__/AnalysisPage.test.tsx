/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../__tests__/test-utils';
import { AnalysisPage } from '../../pages/AnalysisPage';

// Mock the store so AppLayout's useAuth doesn't crash
vi.mock('../../store', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: '1', name: 'Test', email: 'test@test.com' },
    isAuthenticated: true,
    logout: vi.fn(),
  })),
  useChartsStore: vi.fn(() => ({
    charts: [],
    currentChart: null,
    pagination: null,
    fetchCharts: vi.fn(),
    fetchChart: vi.fn(),
    createChart: vi.fn(),
    updateChart: vi.fn(),
    deleteChart: vi.fn(),
    calculateChart: vi.fn(),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  })),
}));

// Mock useChartAnalysis hook specifically
vi.mock('../../hooks', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, any>;
  return {
    ...actual,
    useChartAnalysis: vi.fn(),
  };
});

// Mock react-router-dom useParams and useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ chartId: 'test-chart-123' }),
  };
});

// Mock AI components since they have their own hooks
vi.mock('../../components/AIInterpretationToggle', () => ({
  AIInterpretationToggle: () => <div data-testid="ai-toggle">AI Toggle</div>,
}));

vi.mock('../../components/AIInterpretationDisplay', () => ({
  AIInterpretationDisplay: ({ interpretation }: any) => (
    <div data-testid="ai-display">AI Display: {interpretation?.ai ? 'Active' : 'Inactive'}</div>
  ),
}));

// Mock PersonalityAnalysis component
vi.mock('../../components/PersonalityAnalysis', () => ({
  PersonalityAnalysis: ({ data }: any) => (
    <div data-testid="personality-analysis">
      <span>Personality Analysis</span>
      <span>{data?.overview?.sunSign?.general}</span>
      <span>{data?.overview?.moonSign?.general}</span>
      <span>{data?.overview?.ascendantSign?.general}</span>
    </div>
  ),
}));

import { useChartAnalysis } from '../../hooks';

describe('AnalysisPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useChartAnalysis as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<AnalysisPage />);

      expect(screen.getByText('Personality Analysis')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      (useChartAnalysis as any).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<AnalysisPage />);

      expect(screen.getByText('Personality Analysis')).toBeInTheDocument();
    });

    it('shows error state when data fetch fails', () => {
      (useChartAnalysis as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch analysis'),
      });

      renderWithProviders(<AnalysisPage />);

      expect(screen.getByText('Failed to load analysis')).toBeInTheDocument();
      // getErrorMessage falls back to the provided string when error has no response.data.error.message
      expect(screen.getByText('Unable to load personality analysis. Please try again.')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
    });

    it('shows no chart data state when analysis is null', () => {
      (useChartAnalysis as any).mockReturnValue({
        data: { analysis: null },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<AnalysisPage />);

      expect(screen.getByText('No chart data available')).toBeInTheDocument();
      expect(screen.getByText('Unable to load personality analysis. Please create a chart first.')).toBeInTheDocument();
      expect(screen.getByText('Create Chart')).toBeInTheDocument();
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
    });

    it('shows analysis content when data is available', () => {
      const mockAnalysis = {
        chartId: 'test-chart-123',
        chartName: 'Test Chart',
        overview: {
          sunSign: { sign: 'Capricorn', degree: 15.5 },
          moonSign: { sign: 'Scorpio', degree: 22.3 },
          ascendant: { sign: 'Libra', degree: 10.0 },
        },
        planetsInSigns: [
          { planet: 'Mercury', sign: 'Sagittarius', degree: 5.0, house: 3 },
          { planet: 'Venus', sign: 'Aquarius', degree: 18.2, house: 4 },
        ],
        majorAspects: [
          { planet1: 'Sun', planet2: 'Moon', aspect: 'square', orb: 2.5 },
        ],
        chartPattern: {
          name: 'T-Square',
          description: 'A dynamic T-Square pattern involving the Sun, Moon, and Mars.',
        },
      };

      (useChartAnalysis as any).mockReturnValue({
        data: { analysis: mockAnalysis },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<AnalysisPage />);

      expect(screen.getByTestId('personality-analysis')).toBeInTheDocument();
      expect(screen.getByTestId('ai-toggle')).toBeInTheDocument();
    });

    it('passes correct chartId to useChartAnalysis', () => {
      renderWithProviders(<AnalysisPage />);

      expect(useChartAnalysis).toHaveBeenCalledWith('test-chart-123');
    });

    it('handles analysis without chart pattern gracefully', () => {
      const mockAnalysis = {
        chartId: 'test-chart-123',
        chartName: 'Test Chart',
        overview: {
          sunSign: { sign: 'Aries', degree: 10.0 },
          moonSign: { sign: 'Taurus', degree: 20.0 },
          ascendant: { sign: 'Gemini', degree: 5.0 },
        },
        planetsInSigns: [],
        majorAspects: [],
        chartPattern: null,
      };

      (useChartAnalysis as any).mockReturnValue({
        data: { analysis: mockAnalysis },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<AnalysisPage />);

      expect(screen.getByTestId('personality-analysis')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates to dashboard when Back to Dashboard is clicked in error state', () => {
      (useChartAnalysis as any).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Test error'),
      });

      renderWithProviders(<AnalysisPage />);

      screen.getByText('Back to Dashboard').click();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('navigates to create chart when Create Chart is clicked in no-data state', () => {
      (useChartAnalysis as any).mockReturnValue({
        data: { analysis: null },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<AnalysisPage />);

      screen.getByText('Create Chart').click();
      expect(mockNavigate).toHaveBeenCalledWith('/charts/new');
    });
  });
});
