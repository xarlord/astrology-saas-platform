/**
 * NotFoundPage Component Tests
 *
 * Tests for the 404 Not Found page
 * Covers: rendering, navigation links, icons, accessibility, layout
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => createElement('div', props, children),
    header: ({ children, ...props }: any) => createElement('header', props, children),
    span: ({ children, ...props }: any) => createElement('span', props, children),
  },
}));

// Import after mocks
import { NotFoundPage } from '../../pages/NotFoundPage';

// Helper to create wrapper with providers
const createWrapper = (initialRoute = '/nonexistent') => {
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
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/nonexistent') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

describe('NotFoundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(NotFoundPage));
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    });

    it('should render the "Page Not Found" heading', () => {
      renderWithProviders(createElement(NotFoundPage));
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Page Not Found');
    });

    it('should render the descriptive message', () => {
      renderWithProviders(createElement(NotFoundPage));
      expect(
        screen.getByText(/The page you're looking for doesn't exist or has been moved/i),
      ).toBeInTheDocument();
    });

    it('should render the explore_off icon', () => {
      renderWithProviders(createElement(NotFoundPage));
      expect(screen.getByText('explore_off')).toBeInTheDocument();
    });

    it('should render the "Go Home" link', () => {
      renderWithProviders(createElement(NotFoundPage));
      expect(screen.getByText('Go Home')).toBeInTheDocument();
    });

    it('should render the "Dashboard" link', () => {
      renderWithProviders(createElement(NotFoundPage));
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should have a link pointing to home', () => {
      renderWithProviders(createElement(NotFoundPage));
      const homeLink = screen.getByText('Go Home').closest('a');
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should have a link pointing to dashboard', () => {
      renderWithProviders(createElement(NotFoundPage));
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

    it('should have a home icon on the Go Home link', () => {
      renderWithProviders(createElement(NotFoundPage));
      const goHomeLink = screen.getByText('Go Home').closest('a');
      const icon = goHomeLink?.querySelector('.material-symbols-outlined');
      expect(icon).toHaveTextContent('home');
    });

    it('should render the Go Home and Dashboard links as inline-flex items', () => {
      renderWithProviders(createElement(NotFoundPage));
      const goHomeLink = screen.getByText('Go Home').closest('a');
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(goHomeLink?.className).toContain('inline-flex');
      expect(dashboardLink?.className).toContain('inline-flex');
    });
  });

  describe('Icons', () => {
    it('should render the explore_off Material Symbol icon', () => {
      renderWithProviders(createElement(NotFoundPage));
      const icons = screen.getAllByText('explore_off');
      expect(icons.length).toBeGreaterThanOrEqual(1);
    });

    it('should render the home Material Symbol icon', () => {
      renderWithProviders(createElement(NotFoundPage));
      expect(screen.getByText('home')).toBeInTheDocument();
    });

    it('should have material-symbols-outlined class on icons', () => {
      renderWithProviders(createElement(NotFoundPage));
      const materialIcons = document.querySelectorAll('.material-symbols-outlined');
      expect(materialIcons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should have min-h-screen class on the outer container', () => {
      renderWithProviders(createElement(NotFoundPage));
      const container = document.querySelector('.min-h-screen');
      expect(container).toBeInTheDocument();
    });

    it('should have text-center alignment on the content area', () => {
      renderWithProviders(createElement(NotFoundPage));
      const centered = document.querySelector('.text-center');
      expect(centered).toBeInTheDocument();
    });

    it('should have rounded-lg class on the Go Home link', () => {
      renderWithProviders(createElement(NotFoundPage));
      const goHomeLink = screen.getByText('Go Home').closest('a');
      expect(goHomeLink?.className).toContain('rounded-lg');
    });

    it('should have border styling on the Dashboard link', () => {
      renderWithProviders(createElement(NotFoundPage));
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink?.className).toContain('border');
    });

    it('should have hover transition-colors on links', () => {
      renderWithProviders(createElement(NotFoundPage));
      const goHomeLink = screen.getByText('Go Home').closest('a');
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(goHomeLink?.className).toContain('transition-colors');
      expect(dashboardLink?.className).toContain('transition-colors');
    });

    it('should have flex layout for the link buttons', () => {
      renderWithProviders(createElement(NotFoundPage));
      const linkContainer = screen.getByText('Go Home').closest('a')?.parentElement;
      expect(linkContainer?.className).toContain('flex');
    });
  });

  describe('Footer Section', () => {
    it('should render footer section', () => {
      renderWithProviders(createElement(NotFoundPage));
      const footer = document.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should render copyright text in footer', () => {
      renderWithProviders(createElement(NotFoundPage));
      expect(screen.getByText(/AstroSaaS/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy with h1', () => {
      renderWithProviders(createElement(NotFoundPage));
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent('Page Not Found');
    });

    it('should have main landmark', () => {
      renderWithProviders(createElement(NotFoundPage));
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should have footer landmark', () => {
      renderWithProviders(createElement(NotFoundPage));
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should have skip link for accessibility', () => {
      renderWithProviders(createElement(NotFoundPage));
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have aria-hidden on decorative icons', () => {
      renderWithProviders(createElement(NotFoundPage));
      const decorativeIcons = document.querySelectorAll('.material-symbols-outlined[aria-hidden="true"]');
      expect(decorativeIcons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive padding on the content area', () => {
      renderWithProviders(createElement(NotFoundPage));
      const paddedContainer = document.querySelector('.px-4');
      expect(paddedContainer).toBeInTheDocument();
    });

    it('should use responsive flex layout for links', () => {
      renderWithProviders(createElement(NotFoundPage));
      const linkContainer = screen.getByText('Go Home').closest('a')?.parentElement;
      expect(linkContainer?.className).toContain('justify-center');
    });
  });

  describe('Brand Styling', () => {
    it('should have bg-primary on the Go Home link', () => {
      renderWithProviders(createElement(NotFoundPage));
      const goHomeLink = screen.getByText('Go Home').closest('a');
      expect(goHomeLink?.className).toContain('bg-primary');
    });

    it('should have text-white on the Go Home link', () => {
      renderWithProviders(createElement(NotFoundPage));
      const goHomeLink = screen.getByText('Go Home').closest('a');
      expect(goHomeLink?.className).toContain('text-white');
    });

    it('should have hover effects on links', () => {
      renderWithProviders(createElement(NotFoundPage));
      const goHomeLink = screen.getByText('Go Home').closest('a');
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(goHomeLink?.className).toContain('hover:');
      expect(dashboardLink?.className).toContain('hover:');
    });
  });
});
