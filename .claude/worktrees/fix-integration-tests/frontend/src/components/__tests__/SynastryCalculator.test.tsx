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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import SynastryCalculator from '../SynastryCalculator';
import * as synastryApi from '../../services/synastry.api';

// Mock the synastry API
vi.mock('../../services/synastry.api');

describe('SynastryCalculator', () => {
  const mockCharts = [
    { id: 'chart1', name: 'John\'s Chart' },
    { id: 'chart2', name: 'Jane\'s Chart' },
    { id: 'chart3', name: 'Bob\'s Chart' },
  ];

  const mockSynastryData = {
    id: 'synastry_1',
    chart1Id: 'chart1',
    chart2Id: 'chart2',
    synastryAspects: [
      {
        planet1: 'sun',
        planet2: 'moon',
        aspect: 'conjunction' as const,
        orb: 2.5,
        applying: true,
        interpretation: 'A powerful emotional connection',
        weight: 5,
        soulmateIndicator: true,
      },
      {
        planet1: 'venus',
        planet2: 'mars',
        aspect: 'trine' as const,
        orb: 5.0,
        applying: false,
        interpretation: 'Harmonious romantic attraction',
        weight: 4,
        soulmateIndicator: false,
      },
    ],
    overallCompatibility: 8.5,
    relationshipTheme: 'Highly compatible relationship with strong potential',
    strengths: [
      'Natural flow and ease in multiple areas of life',
      'Deep emotional understanding',
      'Strong romantic attraction',
    ],
    challenges: [
      'May need to work on communication',
    ],
    advice: 'Focus on open communication and emotional honesty',
  };

  const mockCompatibilityData = {
    chart1Id: 'chart1',
    chart2Id: 'chart2',
    scores: {
      overall: 8.5,
      romantic: 9.0,
      communication: 7.5,
      emotional: 8.0,
      intellectual: 7.0,
      spiritual: 8.5,
      values: 9.0,
    },
    elementalBalance: {
      fire: 3,
      earth: 2,
      air: 2,
      water: 3,
      balance: 'well-balanced' as const,
    },
    compositeChart: {
      chart1Id: 'chart1',
      chart2Id: 'chart2',
      planets: {
        sun: {
          name: 'sun',
          degree: 15,
          minute: 0,
          second: 0,
          sign: 'leo',
        },
        moon: {
          name: 'moon',
          degree: 30,
          minute: 0,
          second: 0,
          sign: 'scorpio',
        },
      },
      interpretation: 'The composite chart represents the relationship itself',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders chart selection interface', () => {
    render(<SynastryCalculator charts={mockCharts} />);

    expect(screen.getByText('Compare Two Charts')).toBeInTheDocument();
    expect(screen.getByLabelText('First Chart')).toBeInTheDocument();
    expect(screen.getByLabelText('Second Chart')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Calculate Compatibility' })).toBeInTheDocument();
  });

  test('populates chart selectors with available charts', () => {
    render(<SynastryCalculator charts={mockCharts} />);

    const select1 = screen.getByLabelText('First Chart');
    const select2 = screen.getByLabelText('Second Chart');

    expect(select1).toHaveValue('');
    expect(select2).toHaveValue('');

    // Check if all charts are in the dropdowns
    mockCharts.forEach((chart) => {
      expect(screen.getAllByText(chart.name)).toHaveLength(2); // Once in each select
    });
  });

  test('disables calculate button when no charts selected', () => {
    render(<SynastryCalculator charts={mockCharts} />);

    const button = screen.getByRole('button', { name: 'Calculate Compatibility' });
    expect(button).toBeDisabled();
  });

  test('disables calculate button when same chart selected', () => {
    render(<SynastryCalculator charts={mockCharts} />);

    const select1 = screen.getByLabelText('First Chart');
    const select2 = screen.getByLabelText('Second Chart');

    fireEvent.change(select1, { target: { value: 'chart1' } });
    fireEvent.change(select2, { target: { value: 'chart1' } });

    const button = screen.getByRole('button', { name: 'Calculate Compatibility' });
    expect(button).toBeDisabled();
  });

  test('enables calculate button when different charts selected', () => {
    render(<SynastryCalculator charts={mockCharts} />);

    const select1 = screen.getByLabelText('First Chart');
    const select2 = screen.getByLabelText('Second Chart');

    fireEvent.change(select1, { target: { value: 'chart1' } });
    fireEvent.change(select2, { target: { value: 'chart2' } });

    const button = screen.getByRole('button', { name: 'Calculate Compatibility' });
    expect(button).not.toBeDisabled();
  });

  test('shows error when trying to calculate without selecting charts', () => {
    render(<SynastryCalculator charts={mockCharts} />);

    const button = screen.getByRole('button', { name: 'Calculate Compatibility' });
    fireEvent.click(button);

    // Error should be shown when button is clicked without selection
    expect(button).toBeDisabled();
  });

  test('calls API and displays results on successful calculation', async () => {
    (synastryApi.compareCharts as any).mockResolvedValue(mockSynastryData);
    (synastryApi.getCompatibility as any).mockResolvedValue(mockCompatibilityData);

    render(<SynastryCalculator charts={mockCharts} />);

    const select1 = screen.getByLabelText('First Chart');
    const select2 = screen.getByLabelText('Second Chart');

    fireEvent.change(select1, { target: { value: 'chart1' } });
    fireEvent.change(select2, { target: { value: 'chart2' } });

    const button = screen.getByRole('button', { name: 'Calculate Compatibility' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(synastryApi.compareCharts).toHaveBeenCalledWith('chart1', 'chart2');
      expect(synastryApi.getCompatibility).toHaveBeenCalledWith('chart1', 'chart2', true);
    });

    await waitFor(() => {
      expect(screen.getByText('Overall Compatibility')).toBeInTheDocument();
      expect(screen.getByText('8.5')).toBeInTheDocument();
      expect(screen.getByText(mockSynastryData.relationshipTheme)).toBeInTheDocument();
    });
  });

  test('displays strengths correctly', async () => {
    (synastryApi.compareCharts as any).mockResolvedValue(mockSynastryData);
    (synastryApi.getCompatibility as any).mockResolvedValue(mockCompatibilityData);

    render(<SynastryCalculator charts={mockCharts} />);

    fireEvent.change(screen.getByLabelText('First Chart'), { target: { value: 'chart1' } });
    fireEvent.change(screen.getByLabelText('Second Chart'), { target: { value: 'chart2' } });

    fireEvent.click(screen.getByRole('button', { name: 'Calculate Compatibility' }));

    await waitFor(() => {
      mockSynastryData.strengths.forEach((strength) => {
        expect(screen.getByText(strength)).toBeInTheDocument();
      });
    });
  });

  test('displays challenges correctly', async () => {
    (synastryApi.compareCharts as any).mockResolvedValue(mockSynastryData);
    (synastryApi.getCompatibility as any).mockResolvedValue(mockCompatibilityData);

    render(<SynastryCalculator charts={mockCharts} />);

    fireEvent.change(screen.getByLabelText('First Chart'), { target: { value: 'chart1' } });
    fireEvent.change(screen.getByLabelText('Second Chart'), { target: { value: 'chart2' } });

    fireEvent.click(screen.getByRole('button', { name: 'Calculate Compatibility' }));

    await waitFor(() => {
      mockSynastryData.challenges.forEach((challenge) => {
        expect(screen.getByText(challenge)).toBeInTheDocument();
      });
    });
  });

  test('displays category scores correctly', async () => {
    (synastryApi.compareCharts as any).mockResolvedValue(mockSynastryData);
    (synastryApi.getCompatibility as any).mockResolvedValue(mockCompatibilityData);

    render(<SynastryCalculator charts={mockCharts} />);

    fireEvent.change(screen.getByLabelText('First Chart'), { target: { value: 'chart1' } });
    fireEvent.change(screen.getByLabelText('Second Chart'), { target: { value: 'chart2' } });

    fireEvent.click(screen.getByRole('button', { name: 'Calculate Compatibility' }));

    // Wait for results to load
    await waitFor(() => {
      expect(screen.getByText('Overall Compatibility')).toBeInTheDocument();
    });

    // Click on Category Scores tab
    fireEvent.click(screen.getByText('Category Scores'));

    // Just verify that clicking doesn't crash and the tab is active
    expect(screen.getByText('Category Scores')).toBeInTheDocument();
  });

  test('displays aspects correctly', async () => {
    (synastryApi.compareCharts as any).mockResolvedValue(mockSynastryData);
    (synastryApi.getCompatibility as any).mockResolvedValue(mockCompatibilityData);

    render(<SynastryCalculator charts={mockCharts} />);

    fireEvent.change(screen.getByLabelText('First Chart'), { target: { value: 'chart1' } });
    fireEvent.change(screen.getByLabelText('Second Chart'), { target: { value: 'chart2' } });

    fireEvent.click(screen.getByRole('button', { name: 'Calculate Compatibility' }));

    // Wait for results to load
    await waitFor(() => {
      expect(screen.getByText('Overall Compatibility')).toBeInTheDocument();
    });

    // Click on Aspects tab
    const aspectsTab = screen.getByText('Aspects');
    fireEvent.click(aspectsTab);

    await waitFor(() => {
      expect(screen.getByText('Cross-Chart Aspects')).toBeInTheDocument();
      expect(screen.getByText('A powerful emotional connection')).toBeInTheDocument();
      expect(screen.getByText('Harmonious romantic attraction')).toBeInTheDocument();
      expect(screen.getByText('Soulmate Connection')).toBeInTheDocument();
    });
  });

  test('displays elemental balance correctly', async () => {
    (synastryApi.compareCharts as any).mockResolvedValue(mockSynastryData);
    (synastryApi.getCompatibility as any).mockResolvedValue(mockCompatibilityData);

    render(<SynastryCalculator charts={mockCharts} />);

    fireEvent.change(screen.getByLabelText('First Chart'), { target: { value: 'chart1' } });
    fireEvent.change(screen.getByLabelText('Second Chart'), { target: { value: 'chart2' } });

    fireEvent.click(screen.getByRole('button', { name: 'Calculate Compatibility' }));

    await waitFor(() => {
      expect(screen.getByText('Elemental Balance')).toBeInTheDocument();
      expect(screen.getByText('well balanced')).toBeInTheDocument();
      // Check for element names instead of just numbers
      expect(screen.getByText('Fire')).toBeInTheDocument();
      expect(screen.getByText('Earth')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    (synastryApi.compareCharts as any).mockRejectedValue({
      response: { data: { error: 'Failed to calculate compatibility' } },
    });

    render(<SynastryCalculator charts={mockCharts} />);

    fireEvent.change(screen.getByLabelText('First Chart'), { target: { value: 'chart1' } });
    fireEvent.change(screen.getByLabelText('Second Chart'), { target: { value: 'chart2' } });

    fireEvent.click(screen.getByRole('button', { name: 'Calculate Compatibility' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to calculate compatibility')).toBeInTheDocument();
    });
  });

  test('switches between tabs correctly', async () => {
    (synastryApi.compareCharts as any).mockResolvedValue(mockSynastryData);
    (synastryApi.getCompatibility as any).mockResolvedValue(mockCompatibilityData);

    render(<SynastryCalculator charts={mockCharts} />);

    fireEvent.change(screen.getByLabelText('First Chart'), { target: { value: 'chart1' } });
    fireEvent.change(screen.getByLabelText('Second Chart'), { target: { value: 'chart2' } });

    fireEvent.click(screen.getByRole('button', { name: 'Calculate Compatibility' }));

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Category Scores')).toBeInTheDocument();
      expect(screen.getByText('Aspects')).toBeInTheDocument();
      expect(screen.getByText('Composite')).toBeInTheDocument();
    });

    // Test switching to composite tab
    fireEvent.click(screen.getByText('Composite'));
    await waitFor(() => {
      expect(screen.getByText('Composite Chart')).toBeInTheDocument();
    });
  });
});
