/**
 * PersonSelector Component Tests
 * Comprehensive tests for synastry person selection
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/test-utils';
import PersonSelector, { PersonSelectorProps, Chart } from '../PersonSelector';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    button: ({ children, onClick, className, ...props }: any) => (
      <button onClick={onClick} className={className} {...props}>
        {children}
      </button>
    ),
  },
}));

// Helper to create mock charts
const createMockCharts = (): Chart[] => [
  {
    id: 'chart-1',
    name: 'John Doe',
    birthDate: '1990-01-15',
    birthTime: '14:30',
    birthPlace: 'New York, NY',
    sunSign: 'Capricorn',
    moonSign: 'Scorpio',
    ascendantSign: 'Libra',
  },
  {
    id: 'chart-2',
    name: 'Jane Smith',
    birthDate: '1992-06-20',
    birthTime: '08:00',
    birthPlace: 'Los Angeles, CA',
    sunSign: 'Gemini',
    moonSign: 'Pisces',
    ascendantSign: 'Virgo',
  },
  {
    id: 'chart-3',
    name: 'Alex Johnson',
    birthDate: '1985-11-30',
    birthTime: '20:15',
    birthPlace: 'Chicago, IL',
    sunSign: 'Sagittarius',
    moonSign: 'Leo',
    ascendantSign: 'Cancer',
  },
];

const defaultProps: PersonSelectorProps = {
  charts: createMockCharts(),
  chart1Id: 'chart-1',
  chart2Id: 'chart-2',
  onChart1Change: vi.fn(),
  onChart2Change: vi.fn(),
};

describe('PersonSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render both person cards', () => {
      renderWithProviders(<PersonSelector {...defaultProps} />);

      expect(screen.getByLabelText('Select person 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Select person 2')).toBeInTheDocument();
    });

    it('should render with custom aria-label', () => {
      renderWithProviders(<PersonSelector {...defaultProps} aria-label="Custom selector" />);

      expect(screen.getByLabelText('Custom selector')).toBeInTheDocument();
    });

    it('should use default aria-label when not provided', () => {
      renderWithProviders(<PersonSelector {...defaultProps} />);

      expect(screen.getByLabelText('Person selector for synastry comparison')).toBeInTheDocument();
    });
  });

  describe('Person Card Display', () => {
    it('should display chart name when selected', () => {
      renderWithProviders(<PersonSelector {...defaultProps} />);

      // Use getAllByText since names appear in both the h3 heading and the select options
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
    });

    it('should display formatted birth date', () => {
      renderWithProviders(<PersonSelector {...defaultProps} />);

      expect(screen.getByText(/Jan 15, 1990/)).toBeInTheDocument();
      expect(screen.getByText(/Jun 20, 1992/)).toBeInTheDocument();
    });

    it('should display birth time when available', () => {
      renderWithProviders(<PersonSelector {...defaultProps} />);

      expect(screen.getByText(/14:30/)).toBeInTheDocument();
      expect(screen.getByText(/08:00/)).toBeInTheDocument();
    });

    it('should display birth place when available', () => {
      renderWithProviders(<PersonSelector {...defaultProps} />);

      expect(screen.getByText(/New York, NY/)).toBeInTheDocument();
      expect(screen.getByText(/Los Angeles, CA/)).toBeInTheDocument();
    });

    it('should display sun sign badge', () => {
      renderWithProviders(<PersonSelector {...defaultProps} />);

      const sunBadges = screen.getAllByText(/Capricorn|Gemini/);
      expect(sunBadges.length).toBeGreaterThanOrEqual(2);
    });

    it('should display moon sign badge', () => {
      renderWithProviders(<PersonSelector {...defaultProps} />);

      expect(screen.getByText('Scorpio')).toBeInTheDocument();
      expect(screen.getByText('Pisces')).toBeInTheDocument();
    });

    it('should display ascendant sign badge', () => {
      renderWithProviders(<PersonSelector {...defaultProps} />);

      expect(screen.getByText('Libra')).toBeInTheDocument();
      expect(screen.getByText('Virgo')).toBeInTheDocument();
    });

    it('should show avatar with first letter of name', () => {
      renderWithProviders(<PersonSelector {...defaultProps} />);

      // Both John Doe and Jane Smith start with 'J', so there should be two 'J' avatars
      const avatars = screen.getAllByText('J');
      expect(avatars.length).toBe(2);
    });

    it('should handle missing birth data gracefully', () => {
      const charts: Chart[] = [
        {
          id: 'chart-1',
          name: 'Test Person',
        },
      ];

      renderWithProviders(
        <PersonSelector
          charts={charts}
          chart1Id="chart-1"
          chart2Id=""
          onChart1Change={vi.fn()}
          onChart2Change={vi.fn()}
        />,
      );

      // Name appears in both h3 and option - check it exists
      expect(screen.getAllByText('Test Person').length).toBeGreaterThan(0);
      // Should not throw when birthDate is missing
    });
  });

  describe('Chart Selection', () => {
    it('should have options for all charts in dropdowns', () => {
      renderWithProviders(<PersonSelector {...defaultProps} />);

      const select1 = screen.getByLabelText('Select person 1') as HTMLSelectElement;
      const options = select1.querySelectorAll('option');

      // Should have default option + 3 charts
      expect(options.length).toBe(4);
    });

    it('should have default "Select a chart..." option', () => {
      renderWithProviders(<PersonSelector {...defaultProps} />);

      const select1 = screen.getByLabelText('Select person 1') as HTMLSelectElement;
      expect(select1.querySelector('option[value=""]')?.textContent).toBe('Select a chart...');
    });

    it('should pre-select chart1Id', () => {
      renderWithProviders(<PersonSelector {...defaultProps} />);

      const select1 = screen.getByLabelText('Select person 1') as HTMLSelectElement;
      expect(select1.value).toBe('chart-1');
    });

    it('should pre-select chart2Id', () => {
      renderWithProviders(<PersonSelector {...defaultProps} />);

      const select2 = screen.getByLabelText('Select person 2') as HTMLSelectElement;
      expect(select2.value).toBe('chart-2');
    });

    it('should call onChart1Change when person 1 selection changes', () => {
      const onChart1Change = vi.fn();
      renderWithProviders(<PersonSelector {...defaultProps} onChart1Change={onChart1Change} />);

      const select1 = screen.getByLabelText('Select person 1');
      fireEvent.change(select1, { target: { value: 'chart-3' } });

      expect(onChart1Change).toHaveBeenCalledWith('chart-3');
    });

    it('should call onChart2Change when person 2 selection changes', () => {
      const onChart2Change = vi.fn();
      renderWithProviders(<PersonSelector {...defaultProps} onChart2Change={onChart2Change} />);

      const select2 = screen.getByLabelText('Select person 2');
      fireEvent.change(select2, { target: { value: 'chart-3' } });

      expect(onChart2Change).toHaveBeenCalledWith('chart-3');
    });
  });

  describe('Empty State', () => {
    it('should show person icon when no chart selected', () => {
      renderWithProviders(
        <PersonSelector
          charts={createMockCharts()}
          chart1Id=""
          chart2Id=""
          onChart1Change={vi.fn()}
          onChart2Change={vi.fn()}
        />,
      );

      // Should show the person icon placeholder
      const personIcons = screen.getAllByText('person');
      expect(personIcons.length).toBe(2);
    });

    it('should show "create new chart" link when onCreateNew is provided', () => {
      const onCreateNew = vi.fn();
      renderWithProviders(
        <PersonSelector
          charts={createMockCharts()}
          chart1Id=""
          chart2Id="chart-2"
          onChart1Change={vi.fn()}
          onChart2Change={vi.fn()}
          onCreateNew={onCreateNew}
        />,
      );

      expect(screen.getByText('Or create new chart')).toBeInTheDocument();
    });

    it('should not show "create new chart" link when chart is selected', () => {
      renderWithProviders(<PersonSelector {...defaultProps} />);

      expect(screen.queryByText('Or create new chart')).not.toBeInTheDocument();
    });

    it('should call onCreateNew when clicked', () => {
      const onCreateNew = vi.fn();
      renderWithProviders(
        <PersonSelector
          charts={createMockCharts()}
          chart1Id=""
          chart2Id="chart-2"
          onChart1Change={vi.fn()}
          onChart2Change={vi.fn()}
          onCreateNew={onCreateNew}
        />,
      );

      fireEvent.click(screen.getByText('Or create new chart'));
      expect(onCreateNew).toHaveBeenCalled();
    });
  });

  describe('Swap Button', () => {
    it('should show swap button when onSwap is provided', () => {
      const onSwap = vi.fn();
      renderWithProviders(<PersonSelector {...defaultProps} onSwap={onSwap} />);

      expect(screen.getByLabelText('Swap persons')).toBeInTheDocument();
    });

    it('should not show swap button when onSwap is not provided', () => {
      renderWithProviders(<PersonSelector {...defaultProps} onSwap={undefined} />);

      expect(screen.queryByLabelText('Swap persons')).not.toBeInTheDocument();
    });

    it('should call onSwap when clicked', () => {
      const onSwap = vi.fn();
      renderWithProviders(<PersonSelector {...defaultProps} onSwap={onSwap} />);

      fireEvent.click(screen.getByLabelText('Swap persons'));
      expect(onSwap).toHaveBeenCalled();
    });
  });

  describe('Avatar Colors', () => {
    it('should assign different colors based on chart index', () => {
      const charts = createMockCharts();
      renderWithProviders(<PersonSelector {...defaultProps} charts={charts} />);

      // Check that avatar divs exist with gradient classes
      const avatars = document.querySelectorAll('.rounded-full.bg-gradient-to-br');
      expect(avatars.length).toBe(2);
    });
  });

  describe('Missing Sign Data', () => {
    it('should not show sun sign badge when missing', () => {
      const charts: Chart[] = [
        {
          id: 'chart-1',
          name: 'Test Person',
          birthDate: '1990-01-15',
          moonSign: 'Scorpio',
          ascendantSign: 'Libra',
        },
        {
          id: 'chart-2',
          name: 'Test Person 2',
          sunSign: 'Gemini',
          moonSign: 'Pisces',
          ascendantSign: 'Virgo',
        },
      ];

      renderWithProviders(
        <PersonSelector
          charts={charts}
          chart1Id="chart-1"
          chart2Id="chart-2"
          onChart1Change={vi.fn()}
          onChart2Change={vi.fn()}
        />,
      );

      // Should only show one sun sign badge (for chart-2 which has sunSign)
      const sunBadges = screen.getAllByText('light_mode');
      expect(sunBadges.length).toBe(1);
    });

    it('should not show moon sign badge when missing', () => {
      const charts: Chart[] = [
        {
          id: 'chart-1',
          name: 'Test Person',
          birthDate: '1990-01-15',
          sunSign: 'Capricorn',
          ascendantSign: 'Libra',
        },
        {
          id: 'chart-2',
          name: 'Test Person 2',
          sunSign: 'Gemini',
          moonSign: 'Pisces',
          ascendantSign: 'Virgo',
        },
      ];

      renderWithProviders(
        <PersonSelector
          charts={charts}
          chart1Id="chart-1"
          chart2Id="chart-2"
          onChart1Change={vi.fn()}
          onChart2Change={vi.fn()}
        />,
      );

      const moonBadges = screen.getAllByText('dark_mode');
      expect(moonBadges.length).toBe(1); // Only chart-2 has moon sign
    });

    it('should not show ascendant badge when missing', () => {
      const charts: Chart[] = [
        {
          id: 'chart-1',
          name: 'Test Person',
          birthDate: '1990-01-15',
          sunSign: 'Capricorn',
          moonSign: 'Scorpio',
        },
        {
          id: 'chart-2',
          name: 'Test Person 2',
          sunSign: 'Gemini',
          moonSign: 'Pisces',
          ascendantSign: 'Virgo',
        },
      ];

      renderWithProviders(
        <PersonSelector
          charts={charts}
          chart1Id="chart-1"
          chart2Id="chart-2"
          onChart1Change={vi.fn()}
          onChart2Change={vi.fn()}
        />,
      );

      const ascendantBadges = screen.getAllByText('arrow_upward');
      expect(ascendantBadges.length).toBe(1); // Only chart-2 has ascendant
    });
  });

  describe('Accessibility', () => {
    it('should have accessible select elements', () => {
      renderWithProviders(<PersonSelector {...defaultProps} />);

      expect(screen.getByLabelText('Select person 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Select person 2')).toBeInTheDocument();
    });

    it('should have accessible swap button', () => {
      const onSwap = vi.fn();
      renderWithProviders(<PersonSelector {...defaultProps} onSwap={onSwap} />);

      expect(screen.getByLabelText('Swap persons')).toBeInTheDocument();
    });

    it('should have accessible create new link', () => {
      const onCreateNew = vi.fn();
      renderWithProviders(
        <PersonSelector
          charts={createMockCharts()}
          chart1Id=""
          chart2Id=""
          onChart1Change={vi.fn()}
          onChart2Change={vi.fn()}
          onCreateNew={onCreateNew}
        />,
      );

      // The link should be accessible - there are two "create new chart" links (one for each empty person card)
      const createNewLinks = screen.getAllByText('Or create new chart');
      expect(createNewLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty charts array', () => {
      renderWithProviders(
        <PersonSelector
          charts={[]}
          chart1Id=""
          chart2Id=""
          onChart1Change={vi.fn()}
          onChart2Change={vi.fn()}
        />,
      );

      // Should still render both selectors
      expect(screen.getByLabelText('Select person 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Select person 2')).toBeInTheDocument();
    });

    it('should handle invalid chart IDs', () => {
      renderWithProviders(
        <PersonSelector
          charts={createMockCharts()}
          chart1Id="invalid-id"
          chart2Id="another-invalid"
          onChart1Change={vi.fn()}
          onChart2Change={vi.fn()}
        />,
      );

      // Should show person placeholders for invalid IDs
      const personIcons = screen.getAllByText('person');
      expect(personIcons.length).toBe(2);
    });

    it('should handle same chart selected for both persons', () => {
      renderWithProviders(
        <PersonSelector
          charts={createMockCharts()}
          chart1Id="chart-1"
          chart2Id="chart-1"
          onChart1Change={vi.fn()}
          onChart2Change={vi.fn()}
        />,
      );

      // Should show the same chart for both - name appears in h3 AND option elements
      // 2 person cards * (1 h3 + 2 options) = 4 occurrences
      const johnNames = screen.getAllByText('John Doe');
      expect(johnNames.length).toBe(4);
    });
  });
});
