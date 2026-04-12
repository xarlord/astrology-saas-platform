/**
 * TransitChart Component Tests
 * Comprehensive tests for transit energy chart display
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/test-utils';
import TransitChart, { TransitChartProps, TransitDataPoint } from '../TransitChart';

// Mock Recharts components
vi.mock('recharts', () => ({
  LineChart: ({ children, data }: any) => (
    <div data-testid="line-chart" data-points={data?.length}>
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke }: any) => <div data-testid={`line-${dataKey}`} data-stroke={stroke} />,
  XAxis: ({ dataKey }: any) => <div data-testid={`x-axis-${dataKey}`} />,
  YAxis: ({ domain }: any) => <div data-testid="y-axis" data-domain={JSON.stringify(domain)} />,
  CartesianGrid: ({ strokeDasharray }: any) => (
    <div data-testid="cartesian-grid" data-dash={strokeDasharray} />
  ),
  Tooltip: ({ content }: any) => <div data-testid="tooltip">{content}</div>,
  ResponsiveContainer: ({ children, height }: any) => (
    <div
      data-testid="responsive-container"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {children}
    </div>
  ),
  ReferenceLine: ({ y, stroke }: any) => (
    <div data-testid={`reference-line-${y}`} data-stroke={stroke} />
  ),
  Dot: (props: any) => <circle data-testid="dot" {...props} />,
}));

// Helper to create mock transit data
const createMockData = (): TransitDataPoint[] => [
  {
    date: '2024-01-15',
    energy: 75,
  },
  {
    date: '2024-01-16',
    energy: 60,
  },
  {
    date: '2024-01-17',
    energy: 85,
    isMajorEvent: true,
    eventName: 'Jupiter Transit',
    eventDescription: 'Major expansion energy',
  },
  {
    date: '2024-01-18',
    energy: 45,
  },
  {
    date: '2024-01-19',
    energy: 30,
  },
];

const defaultProps: TransitChartProps = {
  data: createMockData(),
};

describe('TransitChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the chart container', () => {
      renderWithProviders(<TransitChart {...defaultProps} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render with default aria-label', () => {
      renderWithProviders(<TransitChart {...defaultProps} />);

      expect(screen.getByLabelText('Transit energy chart')).toBeInTheDocument();
    });

    it('should render with custom aria-label', () => {
      renderWithProviders(<TransitChart {...defaultProps} aria-label="Custom chart" />);

      expect(screen.getByLabelText('Custom chart')).toBeInTheDocument();
    });

    it('should render line chart with data points', () => {
      renderWithProviders(<TransitChart {...defaultProps} />);

      const chart = screen.getByTestId('line-chart');
      expect(chart).toHaveAttribute('data-points', '5');
    });

    it('should render energy line', () => {
      renderWithProviders(<TransitChart {...defaultProps} />);

      expect(screen.getByTestId('line-energy')).toBeInTheDocument();
    });

    it('should render x-axis with formatted dates', () => {
      renderWithProviders(<TransitChart {...defaultProps} />);

      expect(screen.getByTestId('x-axis-formattedDate')).toBeInTheDocument();
    });

    it('should render y-axis with domain 0-100', () => {
      renderWithProviders(<TransitChart {...defaultProps} />);

      const yAxis = screen.getByTestId('y-axis');
      expect(JSON.parse(yAxis.getAttribute('data-domain') || '[]')).toEqual([0, 100]);
    });
  });

  describe('Height Configuration', () => {
    it('should use default height of 300', () => {
      renderWithProviders(<TransitChart {...defaultProps} />);

      const container = screen.getByTestId('responsive-container');
      expect(container.style.height).toBe('300px');
    });

    it('should accept custom height', () => {
      renderWithProviders(<TransitChart {...defaultProps} height={400} />);

      const container = screen.getByTestId('responsive-container');
      expect(container.style.height).toBe('400px');
    });
  });

  describe('Grid Configuration', () => {
    it('should show grid by default', () => {
      renderWithProviders(<TransitChart {...defaultProps} />);

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    });

    it('should hide grid when showGrid is false', () => {
      renderWithProviders(<TransitChart {...defaultProps} showGrid={false} />);

      expect(screen.queryByTestId('cartesian-grid')).not.toBeInTheDocument();
    });
  });

  describe('Reference Lines', () => {
    it('should show reference lines by default', () => {
      renderWithProviders(<TransitChart {...defaultProps} />);

      expect(screen.getByTestId('reference-line-70')).toBeInTheDocument();
      expect(screen.getByTestId('reference-line-40')).toBeInTheDocument();
    });

    it('should hide reference lines when showReferenceLines is false', () => {
      renderWithProviders(<TransitChart {...defaultProps} showReferenceLines={false} />);

      expect(screen.queryByTestId('reference-line-70')).not.toBeInTheDocument();
      expect(screen.queryByTestId('reference-line-40')).not.toBeInTheDocument();
    });

    it('should show legend when reference lines are shown', () => {
      renderWithProviders(<TransitChart {...defaultProps} />);

      expect(screen.getByText('High Energy (70+)')).toBeInTheDocument();
      expect(screen.getByText('Medium (40-70)')).toBeInTheDocument();
      expect(screen.getByText(/Low/)).toBeInTheDocument();
    });

    it('should hide legend when reference lines are hidden', () => {
      renderWithProviders(<TransitChart {...defaultProps} showReferenceLines={false} />);

      expect(screen.queryByText('High Energy (70+)')).not.toBeInTheDocument();
    });
  });

  describe('Color Configuration', () => {
    it('should use default color', () => {
      renderWithProviders(<TransitChart {...defaultProps} />);

      const line = screen.getByTestId('line-energy');
      expect(line).toHaveAttribute('data-stroke', '#6b3de1');
    });

    it('should accept custom color', () => {
      renderWithProviders(<TransitChart {...defaultProps} color="#ff0000" />);

      const line = screen.getByTestId('line-energy');
      expect(line).toHaveAttribute('data-stroke', '#ff0000');
    });
  });

  describe('Data Point Click', () => {
    it('should accept onDataPointClick callback', () => {
      const onDataPointClick = vi.fn();
      renderWithProviders(<TransitChart {...defaultProps} onDataPointClick={onDataPointClick} />);

      // Chart should render with the callback
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Empty Data', () => {
    it('should handle empty data array', () => {
      renderWithProviders(<TransitChart data={[]} />);

      const chart = screen.getByTestId('line-chart');
      expect(chart).toHaveAttribute('data-points', '0');
    });

    it('should handle single data point', () => {
      renderWithProviders(<TransitChart data={[{ date: '2024-01-15', energy: 50 }]} />);

      const chart = screen.getByTestId('line-chart');
      expect(chart).toHaveAttribute('data-points', '1');
    });
  });

  describe('Major Event Data', () => {
    it('should render chart with major event data', () => {
      const dataWithEvents: TransitDataPoint[] = [
        {
          date: '2024-01-15',
          energy: 85,
          isMajorEvent: true,
          eventName: 'Saturn Return',
          eventDescription: 'Significant life changes',
        },
      ];

      renderWithProviders(<TransitChart data={dataWithEvents} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Legend Display', () => {
    it('should display correct legend labels', () => {
      renderWithProviders(<TransitChart {...defaultProps} />);

      expect(screen.getByText('High Energy (70+)')).toBeInTheDocument();
      expect(screen.getByText('Medium (40-70)')).toBeInTheDocument();
      expect(screen.getByText(/Low/)).toBeInTheDocument();
    });

    it('should have correct legend indicator colors', () => {
      renderWithProviders(<TransitChart {...defaultProps} />);

      const highEnergy = screen.getByText('High Energy (70+)').parentElement;
      expect(highEnergy?.querySelector('.bg-green-500')).toBeInTheDocument();

      const medium = screen.getByText('Medium (40-70)').parentElement;
      expect(medium?.querySelector('.bg-yellow-500')).toBeInTheDocument();

      const low = screen.getByText(/Low/).parentElement;
      expect(low?.querySelector('.bg-red-500')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should handle various date formats', () => {
      const dataWithDifferentDates: TransitDataPoint[] = [
        { date: '2024-01-01', energy: 50 },
        { date: '2024-06-15', energy: 60 },
        { date: '2024-12-31', energy: 70 },
      ];

      renderWithProviders(<TransitChart data={dataWithDifferentDates} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should handle ISO date strings', () => {
      const dataWithISODates: TransitDataPoint[] = [{ date: '2024-01-15T10:30:00Z', energy: 50 }];

      renderWithProviders(<TransitChart data={dataWithISODates} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Energy Value Range', () => {
    it('should handle energy values from 0-100', () => {
      const dataWithFullRange: TransitDataPoint[] = [
        { date: '2024-01-15', energy: 0 },
        { date: '2024-01-16', energy: 50 },
        { date: '2024-01-17', energy: 100 },
      ];

      renderWithProviders(<TransitChart data={dataWithFullRange} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should handle consistent energy values', () => {
      const dataWithSameEnergy: TransitDataPoint[] = [
        { date: '2024-01-15', energy: 50 },
        { date: '2024-01-16', energy: 50 },
        { date: '2024-01-17', energy: 50 },
      ];

      renderWithProviders(<TransitChart data={dataWithSameEnergy} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('should render tooltip component', () => {
      renderWithProviders(<TransitChart {...defaultProps} />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible container', () => {
      renderWithProviders(<TransitChart {...defaultProps} />);

      const container = screen.getByLabelText('Transit energy chart');
      expect(container).toBeInTheDocument();
    });

    it('should have proper role as image-like content', () => {
      renderWithProviders(<TransitChart {...defaultProps} />);

      // The chart container should be accessible
      const chartContainer = screen.getByLabelText('Transit energy chart');
      expect(chartContainer).toBeVisible();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined optional fields', () => {
      const dataWithNulls: TransitDataPoint[] = [
        {
          date: '2024-01-15',
          energy: 50,
          isMajorEvent: undefined,
          eventName: undefined,
          eventDescription: undefined,
        },
      ];

      renderWithProviders(<TransitChart data={dataWithNulls} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should handle large datasets', () => {
      const largeData: TransitDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        date: `2024-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
        energy: Math.random() * 100,
      }));

      renderWithProviders(<TransitChart data={largeData} />);

      const chart = screen.getByTestId('line-chart');
      expect(chart).toHaveAttribute('data-points', '100');
    });

    it('should handle negative energy values gracefully', () => {
      const dataWithNegative: TransitDataPoint[] = [
        { date: '2024-01-15', energy: -10 },
        { date: '2024-01-16', energy: 50 },
      ];

      // Should not throw
      expect(() => {
        renderWithProviders(<TransitChart data={dataWithNegative} />);
      }).not.toThrow();
    });

    it('should handle energy values over 100', () => {
      const dataWithHighValues: TransitDataPoint[] = [{ date: '2024-01-15', energy: 150 }];

      // Should not throw
      expect(() => {
        renderWithProviders(<TransitChart data={dataWithHighValues} />);
      }).not.toThrow();
    });
  });

  describe('Combined Options', () => {
    it('should render with all options disabled', () => {
      renderWithProviders(
        <TransitChart data={createMockData()} showGrid={false} showReferenceLines={false} />,
      );

      expect(screen.queryByTestId('cartesian-grid')).not.toBeInTheDocument();
      expect(screen.queryByTestId('reference-line-70')).not.toBeInTheDocument();
      expect(screen.queryByText('High Energy')).not.toBeInTheDocument();
    });

    it('should render with all custom options', () => {
      renderWithProviders(
        <TransitChart
          data={createMockData()}
          height={500}
          color="#00ff00"
          showGrid={true}
          showReferenceLines={true}
        />,
      );

      const container = screen.getByTestId('responsive-container');
      expect(container.style.height).toBe('500px');

      const line = screen.getByTestId('line-energy');
      expect(line).toHaveAttribute('data-stroke', '#00ff00');
    });
  });
});
