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
import LunarForecastView from '../LunarForecastView';
import * as lunarReturnApi from '@/services/lunarReturn.api';
import { vi } from 'vitest';

// Mock the API service
vi.mock('../../services/lunarReturn.api');

const mockGetLunarMonthForecast = lunarReturnApi.getLunarMonthForecast as any;

describe('LunarForecastView', () => {
  const mockOnBack = vi.fn();

  const mockForecast = {
    userId: 'user_1',
    returnDate: new Date('2026-02-15T00:00:00Z'),
    theme: 'Self-Discovery and New Beginnings with Fresh Intentions',
    intensity: 7,
    emotionalTheme: 'Initiating new projects with courage and authenticity',
    actionAdvice: [
      'Be bold and initiate new projects',
      'Express yourself authentically',
      'Practice self-assertion',
    ],
    keyDates: [
      {
        date: new Date('2026-02-15T00:00:00Z'),
        type: 'aspect-exact' as const,
        description: 'Lunar Return',
        significance: 'Your lunar return brings fresh energy',
      },
    ],
    predictions: [
      {
        category: 'relationships' as const,
        prediction: 'New connections are favored this month',
        likelihood: 8,
        advice: ['Be open to meeting new people', 'Express your feelings clearly'],
      },
    ],
    rituals: [
      {
        phase: 'new-moon' as const,
        title: 'Set Intentions',
        description: 'Create a sacred space to set your intentions',
        materials: ['Journal', 'Pen', 'Candle'],
        steps: ['Light a candle', 'Reflect on goals', 'Write intentions'],
      },
    ],
    journalPrompts: [
      'What seeds do I want to plant this lunar month?',
      'What new beginnings am I ready for?',
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLunarMonthForecast.mockResolvedValue(mockForecast);
  });

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      mockGetLunarMonthForecast.mockImplementation(() => new Promise(() => {}));

      render(<LunarForecastView onBack={mockOnBack} />);

      expect(screen.getByText('Loading forecast...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when API fails', async () => {
      const errorMessage = 'Failed to load forecast';
      mockGetLunarMonthForecast.mockRejectedValue({
        response: { data: { error: errorMessage } }
      });

      render(<LunarForecastView onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByText('Back')).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    it('should render forecast header', async () => {
      render(<LunarForecastView onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Lunar Month Forecast')).toBeInTheDocument();
        expect(screen.getByText(/February.*15.*2026/)).toBeInTheDocument();
      });
    });

    it('should render all tabs', async () => {
      render(<LunarForecastView onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Predictions')).toBeInTheDocument();
        expect(screen.getByText('Rituals')).toBeInTheDocument();
        expect(screen.getByText('Journal')).toBeInTheDocument();
      });
    });

    describe('Overview Tab', () => {
      it('should display theme card', async () => {
        render(<LunarForecastView onBack={mockOnBack} />);

        await waitFor(() => {
          expect(screen.getByText('Monthly Theme')).toBeInTheDocument();
          expect(screen.getByText(mockForecast.theme)).toBeInTheDocument();
        });
      });

      it('should display emotional theme', async () => {
        render(<LunarForecastView onBack={mockOnBack} />);

        await waitFor(() => {
          expect(screen.getByText('Emotional Focus')).toBeInTheDocument();
          expect(screen.getByText(mockForecast.emotionalTheme)).toBeInTheDocument();
        });
      });

      it('should display action advice', async () => {
        render(<LunarForecastView onBack={mockOnBack} />);

        await waitFor(() => {
          expect(screen.getByText('Actions to Take This Month')).toBeInTheDocument();
          expect(screen.getByText('Be bold and initiate new projects')).toBeInTheDocument();
        });
      });

      it('should display key dates', async () => {
        render(<LunarForecastView onBack={mockOnBack} />);

        await waitFor(() => {
          expect(screen.getByText('Key Dates')).toBeInTheDocument();
          expect(screen.getByText('Lunar Return')).toBeInTheDocument();
        });
      });
    });

    describe('Predictions Tab', () => {
      it('should display predictions when tab is clicked', async () => {
        render(<LunarForecastView onBack={mockOnBack} />);

        await waitFor(() => {
          const predictionsTab = screen.getByText('Predictions');
          userEvent.click(predictionsTab);
        });

        await waitFor(() => {
          expect(screen.getByText('Monthly Predictions')).toBeInTheDocument();
          expect(screen.getByText('relationships')).toBeInTheDocument();
        });
      });

      it('should display prediction likelihood', async () => {
        render(<LunarForecastView onBack={mockOnBack} />);

        await waitFor(() => {
          const predictionsTab = screen.getByText('Predictions');
          userEvent.click(predictionsTab);
        });

        await waitFor(() => {
          expect(screen.getByText('8/10')).toBeInTheDocument();
        });
      });
    });

    describe('Rituals Tab', () => {
      it('should display rituals when tab is clicked', async () => {
        render(<LunarForecastView onBack={mockOnBack} />);

        await waitFor(() => {
          const ritualsTab = screen.getByText('Rituals');
          userEvent.click(ritualsTab);
        });

        await waitFor(() => {
          expect(screen.getByText('Monthly Rituals')).toBeInTheDocument();
          expect(screen.getByText('Set Intentions')).toBeInTheDocument();
        });
      });

      it('should display ritual steps', async () => {
        render(<LunarForecastView onBack={mockOnBack} />);

        await waitFor(() => {
          const ritualsTab = screen.getByText('Rituals');
          userEvent.click(ritualsTab);
        });

        await waitFor(() => {
          expect(screen.getByText('Steps:')).toBeInTheDocument();
          expect(screen.getByText('Light a candle')).toBeInTheDocument();
        });
      });
    });

    describe('Journal Tab', () => {
      it('should display journal prompts when tab is clicked', async () => {
        render(<LunarForecastView onBack={mockOnBack} />);

        await waitFor(() => {
          const journalTab = screen.getByText('Journal');
          userEvent.click(journalTab);
        });

        await waitFor(() => {
          expect(screen.getByText('Journal Prompts')).toBeInTheDocument();
          expect(screen.getByText(mockForecast.journalPrompts[0])).toBeInTheDocument();
        });
      });
    });

    describe('Tab Navigation', () => {
      it('should switch between tabs', async () => {
        render(<LunarForecastView onBack={mockOnBack} />);

        await waitFor(() => {
          // Start on Overview tab
          expect(screen.getByText('Monthly Theme')).toBeInTheDocument();
        });

        const predictionsTab = screen.getByText('Predictions');
        userEvent.click(predictionsTab);

        await waitFor(() => {
          expect(screen.getByText('Monthly Predictions')).toBeInTheDocument();
        });

        const ritualsTab = screen.getByText('Rituals');
        userEvent.click(ritualsTab);

        await waitFor(() => {
          expect(screen.getByText('Monthly Rituals')).toBeInTheDocument();
        });
      });
    });

    describe('Back Button', () => {
      it('should call onBack when back button is clicked', async () => {
        render(<LunarForecastView onBack={mockOnBack} />);

        await waitFor(() => {
          const backButton = screen.getByText('← Back');
          userEvent.click(backButton);
          expect(mockOnBack).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  describe('Intensity Display', () => {
    it('should display correct intensity for high values', async () => {
      const highIntensityForecast = { ...mockForecast, intensity: 9 };
      mockGetLunarMonthForecast.mockResolvedValue(highIntensityForecast);

      render(<LunarForecastView onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('9/10')).toBeInTheDocument();
      });
    });

    it('should display correct intensity for low values', async () => {
      const lowIntensityForecast = { ...mockForecast, intensity: 3 };
      mockGetLunarMonthForecast.mockResolvedValue(lowIntensityForecast);

      render(<LunarForecastView onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('3/10')).toBeInTheDocument();
      });
    });
  });
});
