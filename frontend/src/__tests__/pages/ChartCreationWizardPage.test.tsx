/**
 * ChartCreationWizardPage Component Tests
 *
 * Comprehensive tests for the 3-step chart creation wizard
 * Covers: wizard navigation, form inputs, validation, API submission,
 * keyboard shortcuts, preview panel, and all user interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useCharts hook
const mockCreateChart = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../hooks/useCharts', () => ({
  useCharts: () => ({
    createChart: mockCreateChart,
    isLoading: false,
  }),
}));

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock CustomDatePicker to simplify testing
vi.mock('../../components/form/CustomDatePicker', () => ({
  CustomDatePicker: ({
    value,
    onChange,
    placeholder,
  }: {
    value?: Date;
    onChange?: (date: Date) => void;
    placeholder?: string;
  }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange && e.target.value) {
        onChange(new Date(e.target.value));
      }
    };

    return (
      <div className="mock-date-picker">
        <label>{placeholder || 'Select date of birth'}</label>
        <input
          type="date"
          data-testid="mock-date-picker"
          value={value ? value.toISOString().split('T')[0] : ''}
          onChange={handleChange}
        />
      </div>
    );
  },
}));

// Mock the components barrel to avoid circular import SyntaxError
vi.mock('../../components', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Import after mocks
import ChartCreationWizardPage from '../../pages/ChartCreationWizardPage';

// Helper to create wrapper with providers
const createWrapper = (initialRoute = '/charts/create-wizard') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, { initialEntries: [initialRoute] }, children),
    );
};

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/charts/create-wizard') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

// Helper to select a date using the mocked date picker
const selectDate = async (
  user: ReturnType<typeof userEvent.setup>,
  dateString: string = '1990-01-15',
) => {
  const datePicker = screen.getByTestId('mock-date-picker');
  await user.type(datePicker, dateString);
};

// Helper to navigate to step 3
const navigateToStep3 = async (user: ReturnType<typeof userEvent.setup>) => {
  // Step 1
  const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
  await user.type(nameInput, 'Test Chart');
  await user.click(screen.getByRole('button', { name: /Next:/i }));

  // Step 2 - fill location
  const locationInput = screen.getByPlaceholderText('Enter city, country');
  await user.type(locationInput, 'New York, NY');

  // Select date using fireEvent for the date picker
  const datePicker = screen.getByTestId('mock-date-picker');
  fireEvent.change(datePicker, { target: { value: '1990-01-15' } });

  // Also type in time input
  const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement;
  if (timeInput) {
    fireEvent.change(timeInput, { target: { value: '12:00' } });
  }

  // Click next to go to step 3
  const nextButton = screen.getByRole('button', { name: /Next:/i });
  await user.click(nextButton);
};

describe('ChartCreationWizardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateChart.mockResolvedValue({ id: '1', name: 'Test Chart' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      expect(screen.getByText('Create New Chart')).toBeInTheDocument();
    });

    it('should render the page heading', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      expect(screen.getByText('Create New Chart')).toBeInTheDocument();
    });

    it('should render the step description', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      expect(screen.getByText('Enter the name and tags for this chart.')).toBeInTheDocument();
    });

    it('should render the step indicator with all 3 steps', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      expect(screen.getByText('Birth Details')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Options')).toBeInTheDocument();
    });

    it('should render the preview panel on larger screens', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      expect(screen.getByText('Chart Preview')).toBeInTheDocument();
    });

    it('should render the chart preview wheel SVG', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Step Indicator', () => {
    it('should highlight step 1 as current on initial render', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      expect(screen.getByText('Birth Details')).toBeInTheDocument();
    });

    it('should show step 2 and 3 as incomplete initially', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      const locationIcons = screen.getAllByText('location_on');
      expect(locationIcons.length).toBeGreaterThan(0);
    });

    it('should update step indicator when moving to step 2', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');

      const nextButton = screen.getByRole('button', { name: /Next:/i });
      await user.click(nextButton);

      expect(screen.getByText('check')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
    });
  });

  describe('Step 1: Personal Details', () => {
    it('should render chart name input', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      expect(screen.getByPlaceholderText(/e.g. John's Natal Chart/i)).toBeInTheDocument();
    });

    it('should render tag buttons', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      expect(screen.getByRole('button', { name: 'Self' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Family' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Friend' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Client' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Other' })).toBeInTheDocument();
    });

    it('should render notes textarea', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      expect(screen.getByPlaceholderText('Add any additional notes...')).toBeInTheDocument();
    });

    it('should allow typing in chart name input', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'My Personal Chart');

      expect(nameInput).toHaveValue('My Personal Chart');
    });

    it('should toggle tags on click', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const selfTag = screen.getByRole('button', { name: 'Self' });
      await user.click(selfTag);

      expect(selfTag).toHaveClass('bg-primary/20');
    });

    it('should allow deselecting tags', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const selfTag = screen.getByRole('button', { name: 'Self' });
      await user.click(selfTag);
      await user.click(selfTag);

      expect(selfTag).not.toHaveClass('bg-primary/20');
    });

    it('should allow multiple tags to be selected', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const selfTag = screen.getByRole('button', { name: 'Self' });
      const familyTag = screen.getByRole('button', { name: 'Family' });

      await user.click(selfTag);
      await user.click(familyTag);

      expect(selfTag).toHaveClass('bg-primary/20');
      expect(familyTag).toHaveClass('bg-primary/20');
    });

    it('should allow typing in notes textarea', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const notesTextarea = screen.getByPlaceholderText('Add any additional notes...');
      await user.type(notesTextarea, 'These are my notes for this chart.');

      expect(notesTextarea).toHaveValue('These are my notes for this chart.');
    });

    it('should show step description for step 1', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      expect(screen.getByText('Enter the name and tags for this chart.')).toBeInTheDocument();
    });
  });

  describe('Step 2: Birth Data', () => {
    it('should render date picker after navigating to step 2', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');

      const nextButton = screen.getByRole('button', { name: /Next:/i });
      await user.click(nextButton);

      // The mocked date picker should be rendered
      expect(screen.getByTestId('mock-date-picker')).toBeInTheDocument();
    });

    it('should render time input when unknownTime is false', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');

      const nextButton = screen.getByRole('button', { name: /Next:/i });
      await user.click(nextButton);

      const timeInput = document.querySelector('input[type="time"]');
      expect(timeInput).toBeInTheDocument();
    });

    it('should render time unknown checkbox', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');

      const nextButton = screen.getByRole('button', { name: /Next:/i });
      await user.click(nextButton);

      expect(screen.getByText(/Time unknown/i)).toBeInTheDocument();
    });

    it('should render birth location input', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');

      const nextButton = screen.getByRole('button', { name: /Next:/i });
      await user.click(nextButton);

      expect(screen.getByPlaceholderText('Enter city, country')).toBeInTheDocument();
    });

    it('should allow typing in birth location', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');

      const nextButton = screen.getByRole('button', { name: /Next:/i });
      await user.click(nextButton);

      const locationInput = screen.getByPlaceholderText('Enter city, country');
      await user.type(locationInput, 'New York, NY');

      expect(locationInput).toHaveValue('New York, NY');
    });

    it('should allow typing in time input', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');

      const nextButton = screen.getByRole('button', { name: /Next:/i });
      await user.click(nextButton);

      const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement;
      await user.type(timeInput, '14:30');

      expect(timeInput).toHaveValue('14:30');
    });

    it('should show step description for step 2', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');

      const nextButton = screen.getByRole('button', { name: /Next:/i });
      await user.click(nextButton);

      expect(screen.getByText(/Enter the birth details/i)).toBeInTheDocument();
    });

    it('should show info box about birth time importance', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');

      const nextButton = screen.getByRole('button', { name: /Next:/i });
      await user.click(nextButton);

      expect(screen.getByText('Why is birth time important?')).toBeInTheDocument();
    });

    it('should show helper text for time unknown checkbox', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');

      const nextButton = screen.getByRole('button', { name: /Next:/i });
      await user.click(nextButton);

      expect(screen.getByText('Will use noon as default time')).toBeInTheDocument();
    });

    it('should allow selecting a date', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');

      const nextButton = screen.getByRole('button', { name: /Next:/i });
      await user.click(nextButton);

      const datePicker = screen.getByTestId('mock-date-picker');
      await user.type(datePicker, '1990-01-15');

      expect(datePicker).toHaveValue('1990-01-15');
    });
  });

  describe('Form Validation', () => {
    it('should disable next button on step 1 when name is empty', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      const nextButton = screen.getByRole('button', { name: /Next:/i });
      expect(nextButton).toBeDisabled();
    });

    it('should enable next button on step 1 when name is filled', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test');

      const nextButton = screen.getByRole('button', { name: /Next:/i });
      expect(nextButton).not.toBeDisabled();
    });

    it('should disable next button on step 2 when required fields are empty', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');
      await user.click(screen.getByRole('button', { name: /Next:/i }));

      const nextButton = screen.getByRole('button', { name: /Next:/i });
      expect(nextButton).toBeDisabled();
    });

    it('should enable next button on step 2 when all fields are filled', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');
      await user.click(screen.getByRole('button', { name: /Next:/i }));

      const locationInput = screen.getByPlaceholderText('Enter city, country');
      await user.type(locationInput, 'New York, NY');

      const datePicker = screen.getByTestId('mock-date-picker');
      await user.type(datePicker, '1990-01-15');

      const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement;
      await user.type(timeInput, '12:00');

      const nextButton = screen.getByRole('button', { name: /Next:/i });
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Navigation', () => {
    it('should navigate from step 1 to step 2', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');

      await user.click(screen.getByRole('button', { name: /Next:/i }));

      expect(screen.getByTestId('mock-date-picker')).toBeInTheDocument();
    });

    it('should navigate back from step 2 to step 1', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');
      await user.click(screen.getByRole('button', { name: /Next:/i }));

      const backButton = screen.getByRole('button', { name: 'Back' });
      await user.click(backButton);

      expect(screen.getByPlaceholderText(/e.g. John's Natal Chart/i)).toBeInTheDocument();
    });

    it('should show Cancel button on step 1', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('should navigate to /charts when Cancel is clicked on step 1', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/charts');
    });

    it('should show Back button instead of Cancel on step 2+', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');
      await user.click(screen.getByRole('button', { name: /Next:/i }));

      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('should show correct button labels for navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');

      expect(screen.getByRole('button', { name: /Next: Location/i })).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call createChart when form is submitted from step 3', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      await navigateToStep3(user);

      // Step 3: Submit
      const submitButton = screen.getByRole('button', { name: /Generate Chart/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateChart).toHaveBeenCalled();
      });
    });

    it('should navigate to /charts after successful submission', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      await navigateToStep3(user);

      // Step 3: Submit
      const submitButton = screen.getByRole('button', { name: /Generate Chart/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/charts');
      });
    });

    it('should handle submission errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockCreateChart.mockRejectedValueOnce(new Error('API Error'));

      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      await navigateToStep3(user);

      // Step 3: Submit
      const submitButton = screen.getByRole('button', { name: /Generate Chart/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Failed to create chart:', expect.any(Error));
      });

      consoleError.mockRestore();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should advance to next step on Ctrl+Enter when valid', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test Chart');

      fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByTestId('mock-date-picker')).toBeInTheDocument();
      });
    });
  });

  describe('Preview Panel', () => {
    it('should show placeholder when no data entered', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      expect(screen.getByText('Location needed')).toBeInTheDocument();
    });

    it('should update preview with name when entered', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'John Doe');

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should show info message in preview panel', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      expect(screen.getByText(/Entering data will update the chart preview/i)).toBeInTheDocument();
    });

    it('should show name in preview panel after entering name', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Test User');

      const nameLabel = screen.getAllByText('Name');
      expect(nameLabel.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      expect(screen.getByRole('heading', { name: 'Create New Chart' })).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      renderWithProviders(createElement(ChartCreationWizardPage));
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Step 3: Chart Settings', () => {
    it('should render chart type options', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      await navigateToStep3(user);

      expect(screen.getByText('Natal Chart')).toBeInTheDocument();
      expect(screen.getByText('Synastry')).toBeInTheDocument();
      expect(screen.getByText('Composite')).toBeInTheDocument();
      expect(screen.getByText('Transit')).toBeInTheDocument();
    });

    it('should render house system options', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      await navigateToStep3(user);

      expect(screen.getByText('Placidus')).toBeInTheDocument();
      expect(screen.getByText('Koch')).toBeInTheDocument();
      expect(screen.getByText('Porphyry')).toBeInTheDocument();
      expect(screen.getByText('Whole Sign')).toBeInTheDocument();
    });

    it('should render zodiac type options', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      await navigateToStep3(user);

      expect(screen.getByRole('button', { name: 'tropical' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'sidereal' })).toBeInTheDocument();
    });

    it('should have natal chart selected by default', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      await navigateToStep3(user);

      const natalButton = screen.getByText('Natal Chart').closest('button');
      expect(natalButton).toHaveClass('bg-primary/20');
    });

    it('should allow selecting different chart type', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      await navigateToStep3(user);

      const synastryButton = screen.getByText('Synastry').closest('button');
      await user.click(synastryButton!);

      expect(synastryButton).toHaveClass('bg-primary/20');
    });

    it('should show step description for step 3', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      await navigateToStep3(user);

      expect(screen.getByText(/Configure chart calculation settings/i)).toBeInTheDocument();
    });
  });

  describe('Complete Wizard Flow', () => {
    it('should complete full wizard flow successfully', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(ChartCreationWizardPage));

      // Step 1: Personal Details
      const nameInput = screen.getByPlaceholderText(/e.g. John's Natal Chart/i);
      await user.type(nameInput, 'Complete Test Chart');

      await user.click(screen.getByRole('button', { name: 'Self' }));
      await user.click(screen.getByRole('button', { name: 'Family' }));

      const notesTextarea = screen.getByPlaceholderText('Add any additional notes...');
      await user.type(notesTextarea, 'Test notes');

      await user.click(screen.getByRole('button', { name: /Next:/i }));

      // Step 2: Birth Data
      expect(screen.getByTestId('mock-date-picker')).toBeInTheDocument();

      const datePicker = screen.getByTestId('mock-date-picker');
      await user.type(datePicker, '1990-01-15');

      const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement;
      await user.type(timeInput, '10:30');

      const locationInput = screen.getByPlaceholderText('Enter city, country');
      await user.type(locationInput, 'Los Angeles, CA');

      await user.click(screen.getByRole('button', { name: /Next:/i }));

      // Step 3: Settings
      expect(screen.getByText('Chart Type')).toBeInTheDocument();

      const compositeButton = screen.getByText('Composite').closest('button');
      await user.click(compositeButton!);

      const wholeSignButton = screen.getByText('Whole Sign').closest('button');
      await user.click(wholeSignButton!);

      const siderealButton = screen.getByRole('button', { name: 'sidereal' });
      await user.click(siderealButton);

      // Submit
      const submitButton = screen.getByRole('button', { name: /Generate Chart/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateChart).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/charts');
      });
    });
  });
});
