/**
 * Lunar Chart View Component Tests
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LunarChartView from '../LunarChartView';
import { LunarReturnChart } from '@services/lunarReturn.api';
import { vi } from 'vitest';

describe('LunarChartView', () => {
  const mockOnBack = vi.fn();

  const mockChart: LunarReturnChart = {
    returnDate: new Date('2026-02-15T00:00:00Z'),
    moonPosition: {
      sign: 'leo',
      degree: 15,
      minute: 30,
      second: 0,
    },
    moonPhase: 'waxing-gibbous',
    housePlacement: 5,
    aspects: [
      {
        planets: ['Moon', 'Sun'] as [string, string],
        type: 'conjunction',
        orb: 5.2,
        applying: true,
        interpretation: 'Your conscious and emotional nature are aligned',
      },
    ],
    theme: 'Creativity, Romance, and Self-Expression with Building Momentum',
    intensity: 7,
  };

  describe('Rendering', () => {
    it('should render chart header', () => {
      render(<LunarChartView chart={mockChart} onBack={mockOnBack} />);

      expect(screen.getByText('Lunar Return Chart')).toBeInTheDocument();
      expect(screen.getByText(/February.*15.*2026/)).toBeInTheDocument();
    });

    it('should render back button when onBack is provided', () => {
      render(<LunarChartView chart={mockChart} onBack={mockOnBack} />);

      const backButton = screen.getByText('← Back');
      expect(backButton).toBeInTheDocument();
    });

    it('should not render back button when onBack is not provided', () => {
      render(<LunarChartView chart={mockChart} />);

      expect(screen.queryByText('← Back')).not.toBeInTheDocument();
    });

    it('should call onBack when back button is clicked', async () => {
      render(<LunarChartView chart={mockChart} onBack={mockOnBack} />);

      const backButton = screen.getByText('← Back');
      userEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Chart Wheel Section', () => {
    it('should render chart wheel', () => {
      render(<LunarChartView chart={mockChart} onBack={mockOnBack} />);

      expect(screen.getByText('Chart Wheel')).toBeInTheDocument();
    });

    it('should display house placement', () => {
      render(<LunarChartView chart={mockChart} onBack={mockOnBack} />);

      expect(screen.getByText(/Moon in House 5/)).toBeInTheDocument();
    });

    it('should display house meaning', () => {
      render(<LunarChartView chart={mockChart} onBack={mockOnBack} />);

      expect(screen.getByText(/Creativity, romance, and self-expression/)).toBeInTheDocument();
    });
  });

  describe('Moon Position Card', () => {
    it('should render moon position details', () => {
      render(<LunarChartView chart={mockChart} onBack={mockOnBack} />);

      expect(screen.getByText('Moon Position')).toBeInTheDocument();
      expect(screen.getByText('leo')).toBeInTheDocument();
      expect(screen.getByText(/15.*30.*0/)).toBeInTheDocument();
    });

    it('should display moon phase', () => {
      render(<LunarChartView chart={mockChart} onBack={mockOnBack} />);

      expect(screen.getByText(/waxing gibbous/)).toBeInTheDocument();
    });
  });

  describe('Theme Card', () => {
    it('should render theme', () => {
      render(<LunarChartView chart={mockChart} onBack={mockOnBack} />);

      expect(screen.getByText('Monthly Theme')).toBeInTheDocument();
      expect(screen.getByText(mockChart.theme)).toBeInTheDocument();
    });

    it('should display intensity', () => {
      render(<LunarChartView chart={mockChart} onBack={mockOnBack} />);

      expect(screen.getByText('Intensity:')).toBeInTheDocument();
      expect(screen.getByText('7/10')).toBeInTheDocument();
    });
  });

  describe('Aspects Section', () => {
    it('should render aspects when present', () => {
      render(<LunarChartView chart={mockChart} onBack={mockOnBack} />);

      expect(screen.getByText('Lunar Aspects')).toBeInTheDocument();
      expect(screen.getByText('conjunction')).toBeInTheDocument();
      expect(screen.getByText('Moon — Sun')).toBeInTheDocument();
    });

    it('should display aspect orb', () => {
      render(<LunarChartView chart={mockChart} onBack={mockOnBack} />);

      expect(screen.getByText('5.2° orb')).toBeInTheDocument();
    });

    it('should display aspect interpretation', () => {
      render(<LunarChartView chart={mockChart} onBack={mockOnBack} />);

      expect(screen.getByText(/Your conscious and emotional nature are aligned/)).toBeInTheDocument();
    });

    it('should display applying badge', () => {
      render(<LunarChartView chart={mockChart} onBack={mockOnBack} />);

      expect(screen.getByText('Applying')).toBeInTheDocument();
    });
  });

  describe('No Aspects', () => {
    it('should display no aspects message when aspects array is empty', () => {
      const chartWithoutAspects: LunarReturnChart = {
        ...mockChart,
        aspects: [],
      };

      render(<LunarChartView chart={chartWithoutAspects} onBack={mockOnBack} />);

      expect(screen.getByText('No major aspects in this lunar return.')).toBeInTheDocument();
    });

    it('should display no aspects message when aspects is undefined', () => {
      const chartWithoutAspects: LunarReturnChart = {
        ...mockChart,
        aspects: undefined as any,
      };

      render(<LunarChartView chart={chartWithoutAspects} onBack={mockOnBack} />);

      expect(screen.getByText(/no aspects/i)).toBeInTheDocument();
    });
  });

  describe('Intensity Levels', () => {
    it('should display low intensity', () => {
      const lowIntensityChart: LunarReturnChart = {
        ...mockChart,
        intensity: 3,
      };

      render(<LunarChartView chart={lowIntensityChart} onBack={mockOnBack} />);

      expect(screen.getByText('3/10')).toBeInTheDocument();
    });

    it('should display extreme intensity', () => {
      const extremeIntensityChart: LunarReturnChart = {
        ...mockChart,
        intensity: 10,
      };

      render(<LunarChartView chart={extremeIntensityChart} onBack={mockOnBack} />);

      expect(screen.getByText('10/10')).toBeInTheDocument();
    });
  });

  describe('All Moon Phases', () => {
    const phases: Array<LunarReturnChart['moonPhase']> = [
      'new',
      'waxing-crescent',
      'first-quarter',
      'waxing-gibbous',
      'full',
      'waning-gibbous',
      'last-quarter',
      'waning-crescent',
    ];

    phases.forEach((phase) => {
      it(`should display ${phase} phase`, () => {
        const chartWithPhase: LunarReturnChart = {
          ...mockChart,
          moonPhase: phase,
        };

        render(<LunarChartView chart={chartWithPhase} onBack={mockOnBack} />);

        expect(screen.getByText(new RegExp(phase.replace('-', ' ')), 'i')).toBeInTheDocument();
      });
    });
  });
});
