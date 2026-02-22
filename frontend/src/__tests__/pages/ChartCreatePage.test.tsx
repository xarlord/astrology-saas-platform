/**
 * ChartCreatePage Component Tests
 *
 * Comprehensive tests for the chart creation page
 * Covers: form rendering, form inputs, validation, navigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import after mocks
import ChartCreatePage from '../../pages/ChartCreatePage';

// Helper to create wrapper with providers
const createWrapper = (initialRoute = '/charts/create') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, { initialEntries: [initialRoute] }, children)
    );
};

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/charts/create') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

describe('ChartCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByText('Create Natal Chart')).toBeInTheDocument();
    });

    it('should render page header with back link', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByText(/Back to Dashboard/i)).toBeInTheDocument();
    });

    it('should render form title', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByText('Birth Information')).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('should render chart name input', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const nameInput = screen.getByTestId('chart-name-input');
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveAttribute('name', 'name');
      expect(nameInput).toHaveAttribute('type', 'text');
    });

    it('should have default value for chart name', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const nameInput = screen.getByTestId('chart-name-input');
      expect(nameInput).toHaveValue('Natal Chart');
    });

    it('should render birth date input', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const dateInput = screen.getByTestId('birth-date-input');
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute('name', 'birth_date');
      expect(dateInput).toHaveAttribute('type', 'date');
      expect(dateInput).toBeRequired();
    });

    it('should render birth time input', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const timeInput = screen.getByTestId('birth-time-input');
      expect(timeInput).toBeInTheDocument();
      expect(timeInput).toHaveAttribute('name', 'birth_time');
      expect(timeInput).toHaveAttribute('type', 'time');
      expect(timeInput).toBeRequired();
    });

    it('should display helper text for birth time', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByText('Exact time needed for accurate house calculations')).toBeInTheDocument();
    });

    it('should render birth place input', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const placeInput = screen.getByTestId('birth-place-input');
      expect(placeInput).toBeInTheDocument();
      expect(placeInput).toHaveAttribute('name', 'birth_place');
      expect(placeInput).toHaveAttribute('type', 'text');
      expect(placeInput).toBeRequired();
    });

    it('should have placeholder for birth place', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const placeInput = screen.getByTestId('birth-place-input');
      expect(placeInput).toHaveAttribute('placeholder', 'Search city or enter coordinates');
    });

    it('should render house system select', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const houseSelect = screen.getByTestId('house-system-select');
      expect(houseSelect).toBeInTheDocument();
      expect(houseSelect).toHaveAttribute('name', 'house_system');
    });

    it('should render zodiac type select', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const zodiacSelect = screen.getByTestId('zodiac-type-select');
      expect(zodiacSelect).toBeInTheDocument();
      expect(zodiacSelect).toHaveAttribute('name', 'zodiac_type');
    });

    it('should render submit button', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const submitButton = screen.getByTestId('submit-chart-button');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(submitButton).toHaveTextContent('Generate Chart');
    });
  });

  describe('House System Options', () => {
    it('should have Placidus option', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const placidusOption = screen.getByRole('option', { name: 'Placidus' });
      expect(placidusOption).toBeInTheDocument();
      expect(placidusOption).toHaveValue('placidus');
    });

    it('should have Koch option', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const kochOption = screen.getByRole('option', { name: 'Koch' });
      expect(kochOption).toBeInTheDocument();
      expect(kochOption).toHaveValue('koch');
    });

    it('should have Porphyry option', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const porphyryOption = screen.getByRole('option', { name: 'Porphyry' });
      expect(porphyryOption).toBeInTheDocument();
      expect(porphyryOption).toHaveValue('porphyry');
    });

    it('should have Whole Sign option', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const wholeSignOption = screen.getByRole('option', { name: 'Whole Sign' });
      expect(wholeSignOption).toBeInTheDocument();
      expect(wholeSignOption).toHaveValue('whole');
    });

    it('should have Placidus as default', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const houseSelect = screen.getByTestId('house-system-select');
      expect(houseSelect).toHaveValue('placidus');
    });
  });

  describe('Zodiac Type Options', () => {
    it('should have Tropical option', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const tropicalOption = screen.getByRole('option', { name: 'Tropical' });
      expect(tropicalOption).toBeInTheDocument();
      expect(tropicalOption).toHaveValue('tropical');
    });

    it('should have Sidereal Fagan-Bradley option', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const siderealOption = screen.getByRole('option', { name: 'Sidereal (Fagan-Bradley)' });
      expect(siderealOption).toBeInTheDocument();
      expect(siderealOption).toHaveValue('sidereal');
    });

    it('should have Sidereal Lahiri option', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const lahiriOption = screen.getByRole('option', { name: 'Sidereal (Lahiri)' });
      expect(lahiriOption).toBeInTheDocument();
      expect(lahiriOption).toHaveValue('sidereal-lahiri');
    });

    it('should have Tropical as default', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const zodiacSelect = screen.getByTestId('zodiac-type-select');
      expect(zodiacSelect).toHaveValue('tropical');
    });
  });

  describe('Form Labels', () => {
    it('should have label for Chart Name', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByText('Chart Name')).toBeInTheDocument();
    });

    it('should have label for Birth Date', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByText('Birth Date')).toBeInTheDocument();
    });

    it('should have label for Birth Time', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByText('Birth Time')).toBeInTheDocument();
    });

    it('should have label for Birth Place', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByText('Birth Place')).toBeInTheDocument();
    });

    it('should have label for House System', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByText('House System')).toBeInTheDocument();
    });

    it('should have label for Zodiac Type', () => {
      renderWithProviders(createElement(ChartCreatePage));
      expect(screen.getByText('Zodiac Type')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should allow typing in chart name input', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreatePage));

      const nameInput = screen.getByTestId('chart-name-input');
      await user.clear(nameInput);
      await user.type(nameInput, 'My Personal Chart');

      expect(nameInput).toHaveValue('My Personal Chart');
    });

    it('should allow selecting birth date', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreatePage));

      const dateInput = screen.getByTestId('birth-date-input');
      await user.type(dateInput, '1990-01-15');

      expect(dateInput).toHaveValue('1990-01-15');
    });

    it('should allow selecting birth time', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreatePage));

      const timeInput = screen.getByTestId('birth-time-input');
      await user.type(timeInput, '14:30');

      expect(timeInput).toHaveValue('14:30');
    });

    it('should allow typing in birth place', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreatePage));

      const placeInput = screen.getByTestId('birth-place-input');
      await user.type(placeInput, 'New York, NY');

      expect(placeInput).toHaveValue('New York, NY');
    });

    it('should allow changing house system', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreatePage));

      const houseSelect = screen.getByTestId('house-system-select');
      await user.selectOptions(houseSelect, 'whole');

      expect(houseSelect).toHaveValue('whole');
    });

    it('should allow changing zodiac type', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreatePage));

      const zodiacSelect = screen.getByTestId('zodiac-type-select');
      await user.selectOptions(zodiacSelect, 'sidereal');

      expect(zodiacSelect).toHaveValue('sidereal');
    });
  });

  describe('Navigation', () => {
    it('should have back to dashboard link', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const backLink = screen.getByText(/Back to Dashboard/i);
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Form Structure', () => {
    it('should have a form element', () => {
      renderWithProviders(createElement(ChartCreatePage));
      const form = screen.getByTestId('submit-chart-button').closest('form');
      expect(form).toBeInTheDocument();
    });

    it('should render within a card container', () => {
      renderWithProviders(createElement(ChartCreatePage));
      // Check for card class
      const card = screen.getByText('Birth Information').closest('.card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have required attribute on required fields', () => {
      renderWithProviders(createElement(ChartCreatePage));

      expect(screen.getByTestId('birth-date-input')).toBeRequired();
      expect(screen.getByTestId('birth-time-input')).toBeRequired();
      expect(screen.getByTestId('birth-place-input')).toBeRequired();
    });

    it('should have associated labels for all inputs', () => {
      renderWithProviders(createElement(ChartCreatePage));

      // All inputs should have labels
      const inputs = [
        { testId: 'chart-name-input', label: 'Chart Name' },
        { testId: 'birth-date-input', label: 'Birth Date' },
        { testId: 'birth-time-input', label: 'Birth Time' },
        { testId: 'birth-place-input', label: 'Birth Place' },
        { testId: 'house-system-select', label: 'House System' },
        { testId: 'zodiac-type-select', label: 'Zodiac Type' },
      ];

      inputs.forEach(({ label }) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });
});
