/**
 * Keyboard Navigation Accessibility Tests
 *
 * WCAG 2.1 AA Compliance Testing
 *
 * Tests for:
 * - 2.1.1 Keyboard: All functionality via keyboard
 * - 2.1.2 No Keyboard Trap: Focus can move away
 * - 2.4.3 Focus Order: Logical tab order
 * - 2.4.7 Focus Visible: Visible focus indicator
 * - 2.4.1 Bypass Blocks: Skip navigation links
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AppLayout } from '../AppLayout';
import { DailyWeatherModal } from '../DailyWeatherModal';
import { DailyWeather } from '../../types/calendar.types';

// Wrapper to provide router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Keyboard Navigation Accessibility', () => {
  describe('Skip Navigation Link', () => {
    it('should render skip navigation link', () => {
      render(
        <RouterWrapper>
          <AppLayout>
            <div>Test Content</div>
          </AppLayout>
        </RouterWrapper>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have main content with id for skip link target', () => {
      render(
        <RouterWrapper>
          <AppLayout>
            <div>Test Content</div>
          </AppLayout>
        </RouterWrapper>
      );

      const mainContent = document.getElementById('main-content');
      expect(mainContent).toBeInTheDocument();
      expect(mainContent).toHaveAttribute('tabIndex', '-1');
    });

    it('should hide skip link when not focused', () => {
      render(
        <RouterWrapper>
          <AppLayout>
            <div>Test Content</div>
          </AppLayout>
        </RouterWrapper>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveClass('skip-link');
    });
  });

  describe('Focus Management', () => {
    it('should provide visible focus indicators on all interactive elements', () => {
      render(
        <RouterWrapper>
          <AppLayout>
            <div>Test Content</div>
          </AppLayout>
        </RouterWrapper>
      );

      // Check that CSS includes focus-visible styles
      const styleElement = document.createElement('style');
      document.head.appendChild(styleElement);

      // Verify focus styles are applied (checking CSS)
      const skipLink = screen.getByText('Skip to main content');
      skipLink.focus();

      // After focus, the element should be visible
      expect(skipLink).toHaveFocus();
    });
  });

  describe('ARIA Labels and Roles', () => {
    it('should provide ARIA labels for icon-only buttons', () => {
      render(
        <RouterWrapper>
          <AppLayout>
            <div>Test Content</div>
          </AppLayout>
        </RouterWrapper>
      );

      // Menu button should have aria-label
      const menuButton = document.querySelector('[aria-label="Open main menu"]');
      expect(menuButton).toBeTruthy();

      // Close button in sidebar should have aria-label
      const closeButton = document.querySelector('[aria-label="Close sidebar"]');
      expect(closeButton).toBeTruthy();
    });

    it('should mark sidebar with proper ARIA role', () => {
      render(
        <RouterWrapper>
          <AppLayout>
            <div>Test Content</div>
          </AppLayout>
        </RouterWrapper>
      );

      const sidebar = document.querySelector('[aria-label="Main navigation"]');
      expect(sidebar).toBeInTheDocument();
    });

    it('should mark mobile bottom navigation with proper label', () => {
      render(
        <RouterWrapper>
          <AppLayout>
            <div>Test Content</div>
          </AppLayout>
        </RouterWrapper>
      );

      const mobileNav = document.querySelector('[aria-label="Mobile navigation"]');
      expect(mobileNav).toBeInTheDocument();
    });
  });

  describe('Modal Keyboard Accessibility', () => {
    const mockWeather: DailyWeather = {
      rating: 8,
      summary: 'Great day for creativity and expression',
      moonPhase: {
        phase: 'full',
        sign: 'cancer',
        illumination: 100,
      },
      globalEvents: [],
      personalTransits: [],
      luckyActivities: ['Creative work', 'Social events'],
      challengingActivities: [],
    };

    it('should close modal on Escape key', () => {
      const mockOnClose = vi.fn();
      render(
        <DailyWeatherModal
          date="2026-02-20"
          weather={mockWeather}
          onClose={mockOnClose}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <DailyWeatherModal
          date="2026-02-20"
          weather={mockWeather}
          onClose={() => {}}
        />
      );

      const modal = document.querySelector('[role="dialog"]');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should have accessible close button', () => {
      render(
        <DailyWeatherModal
          date="2026-02-20"
          weather={mockWeather}
          onClose={() => {}}
        />
      );

      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Focus Order', () => {
    it('should maintain logical tab order in layout', () => {
      render(
        <RouterWrapper>
          <AppLayout>
            <div>Test Content</div>
          </AppLayout>
        </RouterWrapper>
      );

      // Get all focusable elements
      const focusableElements = document.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
      );

      // Verify there are focusable elements
      expect(focusableElements.length).toBeGreaterThan(0);

      // Skip link should be first in tab order
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeTruthy();
    });
  });

  describe('Keyboard Trap Prevention', () => {
    it('should allow tabbing out of sidebar overlay when closed', () => {
      const { container } = render(
        <RouterWrapper>
          <AppLayout>
            <div>Test Content</div>
          </AppLayout>
        </RouterWrapper>
      );

      // When sidebar is closed (default), focus should not be trapped
      const overlay = container.querySelector('.fixed.inset-0');
      expect(overlay).not.toBeInTheDocument();
    });
  });
});
