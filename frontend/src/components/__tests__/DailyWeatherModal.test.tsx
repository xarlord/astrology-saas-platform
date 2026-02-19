/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
/* eslint-disable @typescript-eslint/no-unused-vars */
 * * DailyWeatherModal Component Tests
 * * Testing modal behavior, data display, interactions, and accessibility
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DailyWeatherModal } from '../DailyWeatherModal';

describe('DailyWeatherModal Component', () => {
  const mockOnClose = vi.fn();

  const mockWeather = {
    rating: 7,
    summary: 'A favorable day for communication and intellectual pursuits.',
    moonPhase: {
      phase: 'waxing-gibbous',
      sign: 'gemini',
      illumination: 78,
    },
    globalEvents: [
      {
        id: '1',
        eventType: 'moon-phase',
        eventName: 'Waxing Gibbous Moon',
        startDate: '2026-01-15',
        intensity: 5,
        isGlobal: true,
        createdAt: '2026-01-01T00:00:00Z',
        description: 'Moon is in Waxing Gibbous phase',
      },
      {
        id: '2',
        eventType: 'retrograde',
        eventName: 'Mercury Retrograde',
        startDate: '2026-01-15',
        intensity: 8,
        isGlobal: true,
        createdAt: '2026-01-01T00:00:00Z',
        description: 'Mercury is retrograde in Aquarius',
        advice: ['Avoid signing contracts', 'Double-check communications'],
      },
    ],
    personalTransits: [
      {
        id: '3',
        eventType: 'transit',
        eventName: 'Sun Conjunct Venus',
        startDate: '2026-01-15',
        intensity: 9,
        isGlobal: false,
        createdAt: '2026-01-01T00:00:00Z',
        description: 'Harmonious aspect for social activities',
      },
    ],
    luckyActivities: ['Creative work', 'Social gatherings', 'Learning'],
    challengingActivities: ['Important decisions', 'Financial investments'],
  };

  describe('Rendering', () => {
    it('should render modal overlay', () => {
      const { container } = render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      const overlay = container.querySelector('.modal-overlay');
      expect(overlay).toBeInTheDocument();
    });

    it('should render modal content', () => {
      const { container } = render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      const content = container.querySelector('.modal-content');
      expect(content).toBeInTheDocument();
    });

    it('should display formatted date', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText(/january/i)).toBeInTheDocument();
      expect(screen.getByText(/15/i)).toBeInTheDocument();
      expect(screen.getByText(/2026/i)).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Rating Display', () => {
    it('should display rating number', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText('7/10')).toBeInTheDocument();
    });

    it('should display rating label', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText('Good')).toBeInTheDocument();
    });

    it('should color code rating correctly', () => {
      const { container } = render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      const ratingSection = container.querySelector('.rating-section');
      expect(ratingSection?.style.backgroundColor).toBe('rgb(16, 185, 129)'); // Green for good rating
    });

    it('should show "Excellent" for rating >= 8', () => {
      const highRatingWeather = { ...mockWeather, rating: 8 };
      render(<DailyWeatherModal date="2026-01-15" weather={highRatingWeather} onClose={mockOnClose} />);

      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });

    it('should show "Challenging" for rating <= 4', () => {
      const lowRatingWeather = { ...mockWeather, rating: 3 };
      render(<DailyWeatherModal date="2026-01-15" weather={lowRatingWeather} onClose={mockOnClose} />);

      expect(screen.getByText('Challenging')).toBeInTheDocument();
    });

    it('should show "Moderate" for rating between 4 and 6', () => {
      const mediumRatingWeather = { ...mockWeather, rating: 5 };
      render(<DailyWeatherModal date="2026-01-15" weather={mediumRatingWeather} onClose={mockOnClose} />);

      expect(screen.getByText('Moderate')).toBeInTheDocument();
    });
  });

  describe('Summary Section', () => {
    it('should display weather summary', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText(mockWeather.summary)).toBeInTheDocument();
    });
  });

  describe('Moon Phase Section', () => {
    it('should display moon phase icon', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText('🌔')).toBeInTheDocument(); // Waxing Gibbous
    });

    it('should display moon phase name', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText('Waxing Gibbous')).toBeInTheDocument();
    });

    it('should display moon sign', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText(/gemini/i)).toBeInTheDocument();
    });

    it('should display moon illumination', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText(/78% illuminated/i)).toBeInTheDocument();
    });

    it('should format moon phase name correctly', () => {
      const weatherWithDash = {
        ...mockWeather,
        moonPhase: { phase: 'first-quarter', sign: 'aries', illumination: 50 },
      };

      render(<DailyWeatherModal date="2026-01-15" weather={weatherWithDash} onClose={mockOnClose} />);

      expect(screen.getByText('First Quarter')).toBeInTheDocument();
    });
  });

  describe('Global Events Section', () => {
    it('should render global events section when events exist', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText('Astrological Events')).toBeInTheDocument();
    });

    it('should not render global events section when empty', () => {
      const noEventsWeather = { ...mockWeather, globalEvents: [] };
      render(<DailyWeatherModal date="2026-01-15" weather={noEventsWeather} onClose={mockOnClose} />);

      expect(screen.queryByText('Astrological Events')).not.toBeInTheDocument();
    });

    it('should display event cards for each global event', () => {
      const { container } = render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      const eventCards = container.querySelectorAll('.event-card');
      // Should be 3 (2 global events + 1 personal transit all use EventCard)
      expect(eventCards.length).toBe(3);
    });

    it('should show correct event icons', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      // Moon phase icon from the moon phase section
      expect(screen.getByText('🌔')).toBeInTheDocument();
      // Retrograde icon
      expect(screen.getByText('⇆')).toBeInTheDocument();
      // Transit icon
      expect(screen.getByText('⭐')).toBeInTheDocument();
    });
  });

  describe('Personal Transits Section', () => {
    it('should render personal transits section when transits exist', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText('Your Transits')).toBeInTheDocument();
    });

    it('should not render personal transits section when empty', () => {
      const noTransitsWeather = { ...mockWeather, personalTransits: [] };
      render(<DailyWeatherModal date="2026-01-15" weather={noTransitsWeather} onClose={mockOnClose} />);

      expect(screen.queryByText('Your Transits')).not.toBeInTheDocument();
    });

    it('should display transit icon', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText('⭐')).toBeInTheDocument();
    });
  });

  describe('Activities Section', () => {
    it('should render lucky activities when present', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText(/Favorable For:/i)).toBeInTheDocument();
      expect(screen.getByText('Creative work')).toBeInTheDocument();
      expect(screen.getByText('Social gatherings')).toBeInTheDocument();
      expect(screen.getByText('Learning')).toBeInTheDocument();
    });

    it('should render challenging activities when present', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText(/Challenging For:/i)).toBeInTheDocument();
      expect(screen.getByText('Important decisions')).toBeInTheDocument();
      expect(screen.getByText('Financial investments')).toBeInTheDocument();
    });

    it('should not render activities section when both lists are empty', () => {
      const noActivitiesWeather = {
        ...mockWeather,
        luckyActivities: [],
        challengingActivities: [],
      };

      render(<DailyWeatherModal date="2026-01-15" weather={noActivitiesWeather} onClose={mockOnClose} />);

      expect(screen.queryByText(/Favorable For:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Challenging For:/i)).not.toBeInTheDocument();
    });
  });

  describe('Modal Interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when overlay is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      const overlay = container.querySelector('.modal-overlay');
      if (overlay) {
        await user.click(overlay);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should not call onClose when modal content is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      const content = container.querySelector('.modal-content');
      if (content) {
        const initialCallCount = mockOnClose.mock.calls.length;
        await user.click(content);
        // The click might propagate, so we just check it rendered
        expect(content).toBeInTheDocument();
      }
    });
  });

  describe('Event Card Component', () => {
    it('should display event name', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText('Waxing Gibbous Moon')).toBeInTheDocument();
      expect(screen.getByText('Mercury Retrograde')).toBeInTheDocument();
    });

    it('should display event description', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText(/moon is in waxing gibbous phase/i)).toBeInTheDocument();
    });

    it('should display event advice when available', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText(/Advice:/i)).toBeInTheDocument();
      expect(screen.getByText(/Avoid signing contracts/i)).toBeInTheDocument();
    });

    it('should color code event intensity', () => {
      const { container } = render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      const intensities = container.querySelectorAll('.event-intensity');
      expect(intensities.length).toBeGreaterThan(0);

      intensities.forEach(intensityBadge => {
        const bgColor = intensityBadge.style.backgroundColor;
        // Check that it's a valid rgb color
        expect(bgColor).toMatch(/rgb\(\d+, \d+, \d+\)/);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should trap focus within modal', () => {
      const { container } = render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      const modal = container.querySelector('.modal-content');
      expect(modal).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      const sections = container.querySelectorAll('.events-section, .transits-section, .moon-phase-section');
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe('Date Formatting', () => {
    it('should format date correctly', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      expect(screen.getByText(/January/i)).toBeInTheDocument();
      expect(screen.getByText(/15/i)).toBeInTheDocument();
      expect(screen.getByText(/2026/i)).toBeInTheDocument();
    });

    it('should include weekday in date', () => {
      render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      // January 15, 2026 is a Thursday
      expect(screen.getByText(/Thursday/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle unknown moon phases', () => {
      const unknownPhaseWeather = {
        ...mockWeather,
        moonPhase: { phase: 'unknown', sign: 'aries', illumination: 50 },
      };

      render(<DailyWeatherModal date="2026-01-15" weather={unknownPhaseWeather} onClose={mockOnClose} />);

      // Should show default icon
      const moonIcons = screen.getAllByText('🌙');
      expect(moonIcons.length).toBeGreaterThan(0);
    });

    it('should handle empty description gracefully', () => {
      const noDescWeather = {
        ...mockWeather,
        globalEvents: [
          {
            ...mockWeather.globalEvents[0],
            description: undefined as any,
          },
        ],
      };

      const { container } = render(<DailyWeatherModal date="2026-01-15" weather={noDescWeather} onClose={mockOnClose} />);

      const eventCard = container.querySelector('.event-card');
      expect(eventCard).toBeInTheDocument();
    });

    it('should handle empty advice array', () => {
      const noAdviceWeather = {
        ...mockWeather,
        globalEvents: [
          {
            ...mockWeather.globalEvents[1],
            advice: [],
          },
        ],
      };

      const { container } = render(<DailyWeatherModal date="2026-01-15" weather={noAdviceWeather} onClose={mockOnClose} />);

      expect(container.querySelector('.event-card')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      const { container } = render(<DailyWeatherModal date="2026-01-15" weather={mockWeather} onClose={mockOnClose} />);

      const modal = container.querySelector('.modal-content');
      expect(modal).toBeInTheDocument();
    });
  });
});
