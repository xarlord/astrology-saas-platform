/**
 * NotFoundPage Component Tests
 *
 * Comprehensive tests for the 404 Not Found page
 * Covers: rendering, navigation, icons, accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

// Mock PublicPageLayout before importing the page
vi.mock('../../components/PublicPageLayout', () => ({
  PublicPageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Import after mocks
import { NotFoundPage } from '../../pages/NotFoundPage';

// Helper to render with router
const renderWithProviders = (initialRoute = '/nonexistent') => {
  return render(
    createElement(MemoryRouter, { initialEntries: [initialRoute] }, createElement(NotFoundPage)),
  );
};

describe('NotFoundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders();
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    });

    it('should render the heading as h1', () => {
      renderWithProviders();
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Page Not Found');
    });

    it('should render the descriptive message', () => {
      renderWithProviders();
      expect(screen.getByText(/doesn't exist or has been moved/i)).toBeInTheDocument();
    });

    it('should render the explore_off icon', () => {
      renderWithProviders();
      const icon = screen.getByText('explore_off', { selector: 'span' });
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should render Go Home link', () => {
      renderWithProviders();
      const goHomeLink = screen.getByText('Go Home');
      expect(goHomeLink).toBeInTheDocument();
      expect(goHomeLink.closest('a')).toHaveAttribute('href', '/');
    });

    it('should render Dashboard link', () => {
      renderWithProviders();
      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink.closest('a')).toHaveAttribute('href', '/dashboard');
    });

    it('should have home icon on Go Home link', () => {
      renderWithProviders();
      const homeIcon = screen.getByText('home', { selector: 'span' });
      expect(homeIcon).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have centered layout', () => {
      renderWithProviders();
      const container = document.querySelector('.min-h-\\[80vh\\]');
      expect(container).toBeInTheDocument();
    });

    it('should have primary color on Go Home link', () => {
      renderWithProviders();
      const goHomeLink = screen.getByText('Go Home').closest('a');
      expect(goHomeLink?.className).toContain('bg-primary');
    });

    it('should have border styling on Dashboard link', () => {
      renderWithProviders();
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink?.className).toContain('border');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders();
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent('Page Not Found');
    });

    it('should have clickable navigation links', () => {
      renderWithProviders();
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(2);
    });
  });
});
