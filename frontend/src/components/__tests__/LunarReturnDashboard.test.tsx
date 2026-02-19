/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Component Tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LunarReturnDashboard from '../LunarReturnDashboard';
import * as lunarReturnApi from '@/services/lunarReturn.api';
import { vi } from 'vitest';

// Mock the API service
vi.mock('../../services/lunarReturn.api');

const mockGetCurrentLunarReturn = lunarReturnApi.getCurrentLunarReturn as any;
const mockGetNextLunarReturn = lunarReturnApi.getNextLunarReturn as any;

describe('LunarReturnDashboard', () => {
  const mockOnChartClick = vi.fn();
  const mockOnForecastClick = vi.fn();
  const mockOnHistoryClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      mockGetCurrentLunarReturn.mockImplementation(() => new Promise(() => {}));
      mockGetNextLunarReturn.mockImplementation(() => new Promise(() => {}));

      render(
        <LunarReturnDashboard
          onChartClick={mockOnChartClick}
          onForecastClick={mockOnForecastClick}
          onHistoryClick={mockOnHistoryClick}
        />
      );

      expect(screen.getByText('Loading lunar return data...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when API fails', async () => {
      const errorMessage = 'Failed to load lunar return data';
      mockGetCurrentLunarReturn.mockRejectedValue({
        response: { data: { error: errorMessage } }
      });
      mockGetNextLunarReturn.mockRejectedValue({
        response: { data: { error: errorMessage } }
      });

      render(
        <LunarReturnDashboard
          onChartClick={mockOnChartClick}
          onForecastClick={mockOnForecastClick}
          onHistoryClick={mockOnHistoryClick}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      mockGetCurrentLunarReturn.mockRejectedValue(new Error('API Error'));
      mockGetNextLunarReturn.mockRejectedValue(new Error('API Error'));

      render(
        <LunarReturnDashboard
          onChartClick={mockOnChartClick}
          onForecastClick={mockOnForecastClick}
          onHistoryClick={mockOnHistoryClick}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    const mockCurrentReturn = {
      returnDate: new Date('2026-02-15T00:00:00Z'),
      daysUntil: 10,
    };

    const mockNextReturn = {
      nextReturn: new Date('2026-02-15T00:00:00Z'),
      natalMoon: {
        sign: 'leo',
        degree: 15,
        minute: 30,
        second: 0,
      },
    };

    beforeEach(() => {
      mockGetCurrentLunarReturn.mockResolvedValue(mockCurrentReturn);
      mockGetNextLunarReturn.mockResolvedValue(mockNextReturn);
    });

    it('should display dashboard header', async () => {
      render(
        <LunarReturnDashboard
          onChartClick={mockOnChartClick}
          onForecastClick={mockOnForecastClick}
          onHistoryClick={mockOnHistoryClick}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Lunar Return Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Your monthly emotional forecast')).toBeInTheDocument();
      });
    });

    it('should display countdown card', async () => {
      render(
        <LunarReturnDashboard
          onChartClick={mockOnChartClick}
          onForecastClick={mockOnForecastClick}
          onHistoryClick={mockOnHistoryClick}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Next Lunar Return')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('days until return')).toBeInTheDocument();
      });
    });

    it('should display natal moon information', async () => {
      render(
        <LunarReturnDashboard
          onChartClick={mockOnChartClick}
          onForecastClick={mockOnForecastClick}
          onHistoryClick={mockOnHistoryClick}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Your Natal Moon')).toBeInTheDocument();
        expect(screen.getByText('leo')).toBeInTheDocument();
        expect(screen.getByText(/15°/)).toBeInTheDocument();
      });
    });

    it('should display quick action buttons', async () => {
      render(
        <LunarReturnDashboard
          onChartClick={mockOnChartClick}
          onForecastClick={mockOnForecastClick}
          onHistoryClick={mockOnHistoryClick}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('View Monthly Forecast')).toBeInTheDocument();
        expect(screen.getByText('View Return Chart')).toBeInTheDocument();
        expect(screen.getByText('View History')).toBeInTheDocument();
      });
    });

    it('should call onForecastClick when forecast button is clicked', async () => {
      render(
        <LunarReturnDashboard
          onChartClick={mockOnChartClick}
          onForecastClick={mockOnForecastClick}
          onHistoryClick={mockOnHistoryClick}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('View Monthly Forecast')).toBeInTheDocument();
      });

      const forecastButton = screen.getByText('View Monthly Forecast');
      await userEvent.click(forecastButton);
      expect(mockOnForecastClick).toHaveBeenCalled();
    });

    it('should call onHistoryClick when history button is clicked', async () => {
      render(
        <LunarReturnDashboard
          onChartClick={mockOnChartClick}
          onForecastClick={mockOnForecastClick}
          onHistoryClick={mockOnHistoryClick}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('View History')).toBeInTheDocument();
      });

      const historyButton = screen.getByText('View History');
      await userEvent.click(historyButton);
      expect(mockOnHistoryClick).toHaveBeenCalled();
    });

    it('should display info section with educational content', async () => {
      render(
        <LunarReturnDashboard
          onChartClick={mockOnChartClick}
          onForecastClick={mockOnForecastClick}
          onHistoryClick={mockOnHistoryClick}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('About Lunar Returns')).toBeInTheDocument();
        expect(screen.getByText('Every 27.3 Days')).toBeInTheDocument();
        expect(screen.getByText('House Placement')).toBeInTheDocument();
        expect(screen.getByText('Moon Phase')).toBeInTheDocument();
        expect(screen.getByText('Intensity')).toBeInTheDocument();
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format return date correctly', async () => {
      const mockReturn = {
        returnDate: new Date('2026-02-15T00:00:00Z'),
        daysUntil: 10,
      };

      mockGetCurrentLunarReturn.mockResolvedValue(mockReturn);
      mockGetNextLunarReturn.mockResolvedValue({
        nextReturn: new Date('2026-02-15T00:00:00Z'),
        natalMoon: { sign: 'leo', degree: 15, minute: 30, second: 0 },
      });

      render(
        <LunarReturnDashboard
          onChartClick={mockOnChartClick}
          onForecastClick={mockOnForecastClick}
          onHistoryClick={mockOnHistoryClick}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/February.*15.*2026/)).toBeInTheDocument();
      });
    });
  });
});
