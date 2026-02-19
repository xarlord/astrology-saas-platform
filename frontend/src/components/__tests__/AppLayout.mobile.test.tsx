/**
 * Test suite for Mobile Bottom Navigation Active States
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../AppLayout';

// Mock the auth hook
vi.mock('../hooks', () => ({
  useAuth: () => ({
    user: { name: 'Test User', id: '123' },
    logout: vi.fn(),
  }),
}));

describe('Mobile Bottom Navigation Active States', () => {
  const renderWithRouter = (ui: React.ReactElement, initialEntries = ['/']) => {
    return render(
      <BrowserRouter initialEntries={initialEntries}>
        {ui}
      </BrowserRouter>
    );
  };

  describe('Active Route Detection', () => {
    it('should highlight Home as active on root path', () => {
      renderWithRouter(<AppLayout>Test Content</AppLayout>, ['/']);

      const homeLink = screen.getByLabelText('Home');
      expect(homeLink).toHaveAttribute('aria-current', 'page');
    });

    it('should highlight Charts as active on /charts path', () => {
      renderWithRouter(<AppLayout>Test Content</AppLayout>, ['/charts']);

      const chartsLink = screen.getByLabelText('Charts');
      expect(chartsLink).toHaveAttribute('aria-current', 'page');
    });

    it('should highlight Transits as active on /transits path', () => {
      renderWithRouter(<AppLayout>Test Content</AppLayout>, ['/transits']);

      const transitsLink = screen.getByLabelText('Transits');
      expect(transitsLink).toHaveAttribute('aria-current', 'page');
    });

    it('should highlight Learn as active on /learn path', () => {
      renderWithRouter(<AppLayout>Test Content</AppLayout>, ['/learn']);

      const learnLink = screen.getByLabelText('Learn');
      expect(learnLink).toHaveAttribute('aria-current', 'page');
    });

    it('should highlight Profile as active on /profile path', () => {
      renderWithRouter(<AppLayout>Test Content</AppLayout>, ['/profile']);

      const profileLink = screen.getByLabelText('Profile');
      expect(profileLink).toHaveAttribute('aria-current', 'page');
    });

    it('should match sub-routes (e.g., /charts/natal should highlight Charts)', () => {
      renderWithRouter(<AppLayout>Test Content</AppLayout>, ['/charts/natal']);

      const chartsLink = screen.getByLabelText('Charts');
      expect(chartsLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Visual Feedback', () => {
    it('should render active indicator bar for active route', () => {
      const { container } = renderWithRouter(<AppLayout>Test Content</AppLayout>, ['/']);

      // Check for the active indicator bar (rounded bar at top)
      const activeBars = container.querySelectorAll('.bg-indigo-600.h-0\\.5');
      expect(activeBars.length).toBeGreaterThan(0);
    });

    it('should apply active styling to icon container', () => {
      const { container } = renderWithRouter(<AppLayout>Test Content</AppLayout>, ['/']);

      // Active icon container should have indigo background
      const activeContainer = container.querySelector('.bg-indigo-100');
      expect(activeContainer).toBeInTheDocument();
    });

    it('should apply active styling to label text', () => {
      const { container } = renderWithRouter(<AppLayout>Test Content</AppLayout>, ['/']);

      // Active label should have indigo color
      const activeLabel = container.querySelector('.text-indigo-600');
      expect(activeLabel).toBeInTheDocument();
    });
  });

  describe('Touch Target Requirements', () => {
    it('should have minimum 44px touch targets', () => {
      const { container } = renderWithRouter(<AppLayout>Test Content</AppLayout>);

      // Icon containers should have min-w and min-h of 44px
      const iconContainers = container.querySelectorAll('[style*="min-width: 44px"]');
      expect(iconContainers.length).toBeGreaterThan(0);
    });

    it('should have minimum 56px height for navigation items', () => {
      const { container } = renderWithRouter(<AppLayout>Test Content</AppLayout>);

      // Navigation items should have min-h-14 (56px)
      const navItems = container.querySelectorAll('.min-h-\\[56px\\]');
      expect(navItems.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on navigation', () => {
      const { container } = renderWithRouter(<AppLayout>Test Content</AppLayout>);

      const nav = container.querySelector('[aria-label="Mobile navigation"]');
      expect(nav).toBeInTheDocument();
    });

    it('should have aria-label on each nav item', () => {
      renderWithRouter(<AppLayout>Test Content</AppLayout>);

      expect(screen.getByLabelText('Home')).toBeInTheDocument();
      expect(screen.getByLabelText('Charts')).toBeInTheDocument();
      expect(screen.getByLabelText('Transits')).toBeInTheDocument();
      expect(screen.getByLabelText('Learn')).toBeInTheDocument();
      expect(screen.getByLabelText('Profile')).toBeInTheDocument();
    });

    it('should have aria-current="page" on active item', () => {
      renderWithRouter(<AppLayout>Test Content</AppLayout>, ['/charts']);

      const chartsLink = screen.getByLabelText('Charts');
      expect(chartsLink).toHaveAttribute('aria-current', 'page');
    });

    it('should not have aria-current on inactive items', () => {
      renderWithRouter(<AppLayout>Test Content</AppLayout>, ['/charts']);

      const homeLink = screen.getByLabelText('Home');
      expect(homeLink).not.toHaveAttribute('aria-current');
    });
  });

  describe('Interactive States', () => {
    it('should have group hover styling', () => {
      const { container } = renderWithRouter(<AppLayout>Test Content</AppLayout>);

      // Items should have group class for hover states
      const groups = container.querySelectorAll('.group');
      expect(groups.length).toBeGreaterThan(0);
    });

    it('should have active scale effect', () => {
      const { container } = renderWithRouter(<AppLayout>Test Content</AppLayout>);

      // Items should have active:scale-95 class
      const activeElements = container.querySelectorAll('.active\\:scale-95');
      expect(activeElements.length).toBeGreaterThan(0);
    });

    it('should have transition classes for smooth animations', () => {
      const { container } = renderWithRouter(<AppLayout>Test Content</AppLayout>);

      // Items should have transition-all
      const transitions = container.querySelectorAll('.transition-all');
      expect(transitions.length).toBeGreaterThan(0);
    });
  });

  describe('Safe Area Support', () => {
    it('should have safe area inset for bottom padding', () => {
      const { container } = renderWithRouter(<AppLayout>Test Content</AppLayout>);

      // Navigation should have padding-bottom style
      const nav = container.querySelector('[style*="padding-bottom"]');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode active state styling', () => {
      const { container } = renderWithRouter(<AppLayout>Test Content</AppLayout>);

      // Should have dark mode classes
      const darkModeClasses = container.querySelectorAll('.dark\\:bg-indigo-900\\/30');
      expect(darkModeClasses.length).toBeGreaterThan(0);
    });

    it('should have dark mode active indicator', () => {
      const { container } = renderWithRouter(<AppLayout>Test Content</AppLayout>);

      // Active bar should have dark mode color
      const darkModeBar = container.querySelectorAll('.dark\\:bg-indigo-400');
      expect(darkModeBar.length).toBeGreaterThan(0);
    });
  });
});
