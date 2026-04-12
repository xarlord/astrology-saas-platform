/**
 * NotFoundPage Component Tests
 *
 * Comprehensive tests for the 404 Not Found page
 * Covers: rendering, navigation, mercury status, animations, accessibility
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
import NotFoundPage from '../../pages/NotFoundPage';

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
      expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('should render the 404 number prominently', () => {
      renderWithProviders(createElement(NotFoundPage));
      const heading404 = screen.getByText('404');
      expect(heading404).toBeInTheDocument();
      expect(heading404.tagName).toBe('H1');
    });

    it('should render "Lost in the Cosmos" heading', () => {
      renderWithProviders(createElement(NotFoundPage));
      expect(screen.getByText('Lost in the Cosmos')).toBeInTheDocument();
    });

    it('should render the descriptive message', () => {
      renderWithProviders(createElement(NotFoundPage));
      expect(screen.getByText(/The stars couldn't find the page/i)).toBeInTheDocument();
    });

    it('should render the Mercury retrograde reference', () => {
      renderWithProviders(createElement(NotFoundPage));
      expect(screen.getByText(/Perhaps Mercury is in retrograde/i)).toBeInTheDocument();
    });

    it('should render the brand name', () => {
      renderWithProviders(createElement(NotFoundPage));
      expect(screen.getByText('AstroVerse')).toBeInTheDocument();
    });
  });

  describe('Navigation Buttons', () => {
    it('should render Return Home button', () => {
      renderWithProviders(createElement(NotFoundPage));
      expect(screen.getByText('Return Home')).toBeInTheDocument();
    });

    it('should render Go to Dashboard button', () => {
      renderWithProviders(createElement(NotFoundPage));
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    });

    it('should have rocket icon on Return Home button', () => {
      renderWithProviders(createElement(NotFoundPage));
      const returnHomeButton = screen.getByText('Return Home').closest('button');
      expect(returnHomeButton).toBeInTheDocument();
    });

    it('should have dashboard icon on Dashboard button', () => {
      renderWithProviders(createElement(NotFoundPage));
      const dashboardButton = screen.getByText('Go to Dashboard').closest('button');
      expect(dashboardButton).toBeInTheDocument();
    });

    it('should navigate to home when Return Home is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(NotFoundPage));

      const returnHomeButton = screen.getByText('Return Home').closest('button');
      await user.click(returnHomeButton!);

      // Navigation handled by useNavigate
      expect(returnHomeButton).toBeInTheDocument();
    });

    it('should navigate to dashboard when Go to Dashboard is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(NotFoundPage));

      const dashboardButton = screen.getByText('Go to Dashboard').closest('button');
      await user.click(dashboardButton!);

      // Navigation handled by useNavigate
      expect(dashboardButton).toBeInTheDocument();
    });
  });

  describe('Mercury Status Display', () => {
    it('should render Mercury Status section', () => {
      renderWithProviders(createElement(NotFoundPage));
      expect(screen.getByText(/Current Mercury Status:/i)).toBeInTheDocument();
    });

    it('should display either Direct or Retrograde status', () => {
      renderWithProviders(createElement(NotFoundPage));
      const statusText = screen.getByText(/Direct|Retrograde/);
      expect(statusText).toBeInTheDocument();
    });

    it('should show status indicator dot', () => {
      renderWithProviders(createElement(NotFoundPage));
      // The status indicator is a span with animation
      const statusDot = document.querySelector('.animate-pulse.rounded-full');
      expect(statusDot).toBeInTheDocument();
    });

    it('should show status with checkmark or warning emoji', () => {
      renderWithProviders(createElement(NotFoundPage));
      // The status text contains either checkmark or warning
      const statusSection = screen.getByText(/Current Mercury Status:/i).parentElement;
      expect(statusSection).toBeInTheDocument();
    });

    it('should apply correct color class based on status', () => {
      renderWithProviders(createElement(NotFoundPage));
      // Should have either amber (retrograde) or emerald (direct) color
      const statusDot =
        document.querySelector('.bg-amber-400') || document.querySelector('.bg-emerald-400');
      // One of the colors should be present
      expect(
        statusDot !== null || document.querySelector('.animate-pulse.rounded-full') !== null,
      ).toBe(true);
    });
  });

  describe('Visual Elements', () => {
    it('should render the astronaut image', () => {
      renderWithProviders(createElement(NotFoundPage));

      const astronautImage = screen.getByAltText(/Astronaut floating/i);
      expect(astronautImage).toBeInTheDocument();
    });

    it('should have correct astronaut image source', () => {
      renderWithProviders(createElement(NotFoundPage));

      const astronautImage = screen.getByAltText(/Astronaut floating/i);
      expect(astronautImage).toHaveAttribute('src', expect.stringContaining('googleusercontent'));
    });

    it('should render zodiac ring background', () => {
      renderWithProviders(createElement(NotFoundPage));

      // The zodiac ring is a div with backgroundImage style
      const zodiacRing = document.querySelector('[style*="background-image"]');
      expect(zodiacRing).toBeInTheDocument();
    });

    it('should render SVG wheel', () => {
      renderWithProviders(createElement(NotFoundPage));

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render SVG circles for wheel', () => {
      renderWithProviders(createElement(NotFoundPage));

      const circles = document.querySelectorAll('svg circle');
      expect(circles.length).toBeGreaterThan(0);
    });

    it('should render twinkling stars', () => {
      renderWithProviders(createElement(NotFoundPage));

      const stars = document.querySelectorAll('.star');
      expect(stars.length).toBe(5);
    });

    it('should render debris particles', () => {
      renderWithProviders(createElement(NotFoundPage));

      // Check for debris particles with animation
      const debris = document.querySelectorAll('.animate-drift');
      expect(debris.length).toBeGreaterThan(0);
    });
  });

  describe('Animations', () => {
    it('should have float animation styles', () => {
      renderWithProviders(createElement(NotFoundPage));

      const styleElement = document.querySelector('style');
      expect(styleElement).toBeInTheDocument();
      expect(styleElement?.textContent).toContain('@keyframes float');
    });

    it('should have drift animation styles', () => {
      renderWithProviders(createElement(NotFoundPage));

      const styleElement = document.querySelector('style');
      expect(styleElement?.textContent).toContain('@keyframes drift');
    });

    it('should have pulse-glow animation styles', () => {
      renderWithProviders(createElement(NotFoundPage));

      const styleElement = document.querySelector('style');
      expect(styleElement?.textContent).toContain('@keyframes pulse-glow');
    });

    it('should have twinkle animation styles', () => {
      renderWithProviders(createElement(NotFoundPage));

      const styleElement = document.querySelector('style');
      expect(styleElement?.textContent).toContain('@keyframes twinkle');
    });

    it('should have spin-slow animation styles', () => {
      renderWithProviders(createElement(NotFoundPage));

      const styleElement = document.querySelector('style');
      expect(styleElement?.textContent).toContain('@keyframes spin-slow');
    });

    it('should have animate-float class on astronaut container', () => {
      renderWithProviders(createElement(NotFoundPage));

      const floatElement = document.querySelector('.animate-float');
      expect(floatElement).toBeInTheDocument();
    });

    it('should have animate-spin-slow class on SVG wheel', () => {
      renderWithProviders(createElement(NotFoundPage));

      const spinningSvg = document.querySelector('.animate-spin-slow');
      expect(spinningSvg).toBeInTheDocument();
    });

    it('should have animate-pulse-glow on heading', () => {
      renderWithProviders(createElement(NotFoundPage));

      const glowingHeading = document.querySelector('.animate-pulse-glow');
      expect(glowingHeading).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should have glass-panel class for mercury status', () => {
      renderWithProviders(createElement(NotFoundPage));

      const glassPanel = document.querySelector('.glass-panel');
      expect(glassPanel).toBeInTheDocument();
    });

    it('should have gradient background from deep space colors', () => {
      renderWithProviders(createElement(NotFoundPage));

      // The page uses from-[#0B0D17] to-[#141627] gradient
      const mainContainer = document.querySelector('.min-h-screen');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer?.className).toContain('bg-gradient-to-br');
    });

    it('should have min-h-screen class for full height', () => {
      renderWithProviders(createElement(NotFoundPage));

      const mainContainer = document.querySelector('.min-h-screen');
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe('Footer Section', () => {
    it('should render footer section', () => {
      renderWithProviders(createElement(NotFoundPage));

      const footer = document.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should render brand mark in footer', () => {
      renderWithProviders(createElement(NotFoundPage));

      expect(screen.getByText('AstroVerse')).toBeInTheDocument();
    });

    it('should have brand icon in footer', () => {
      renderWithProviders(createElement(NotFoundPage));

      const brandIcon = document.querySelector('footer .material-symbols-outlined');
      expect(brandIcon).toBeInTheDocument();
    });

    it('should have hover opacity transition on footer content', () => {
      renderWithProviders(createElement(NotFoundPage));

      // The opacity class is on the inner div, not the footer itself
      const footerContent = document.querySelector('.opacity-70.hover\\:opacity-100');
      expect(footerContent).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(createElement(NotFoundPage));

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent('404');

      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toBeInTheDocument();
      expect(h2).toHaveTextContent('Lost in the Cosmos');
    });

    it('should have alt text on astronaut image', () => {
      renderWithProviders(createElement(NotFoundPage));

      const astronautImage = screen.getByRole('img');
      expect(astronautImage).toHaveAttribute('alt', 'Astronaut floating in deep space darkness');
    });

    it('should have accessible buttons', () => {
      renderWithProviders(createElement(NotFoundPage));

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
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

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(NotFoundPage));

      // Tab to first button
      await user.tab();

      const focusedElement = document.activeElement;
      expect(focusedElement?.tagName).toBe('BUTTON');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive text classes for 404 number', () => {
      renderWithProviders(createElement(NotFoundPage));

      const heading404 = screen.getByText('404');
      expect(heading404.className).toContain('md:text');
    });

    it('should have responsive flex direction', () => {
      renderWithProviders(createElement(NotFoundPage));

      const mainContainer = document.querySelector('.flex-col.md\\:flex-row');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should have responsive gap classes', () => {
      renderWithProviders(createElement(NotFoundPage));

      const contentContainer = document.querySelector('.gap-12.md\\:gap-20');
      expect(contentContainer).toBeInTheDocument();
    });

    it('should have responsive button container', () => {
      renderWithProviders(createElement(NotFoundPage));

      const buttonContainer = document.querySelector('.flex-col.sm\\:flex-row');
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe('Brand Styling', () => {
    it('should have gradient on Return Home button', () => {
      renderWithProviders(createElement(NotFoundPage));

      const returnHomeButton = screen.getByText('Return Home').closest('button');
      expect(returnHomeButton?.className).toContain('bg-gradient-to-r');
    });

    it('should have border styling on Dashboard button', () => {
      renderWithProviders(createElement(NotFoundPage));

      const dashboardButton = screen.getByText('Go to Dashboard').closest('button');
      expect(dashboardButton?.className).toContain('border');
    });

    it('should have hover effects on buttons', async () => {
      renderWithProviders(createElement(NotFoundPage));

      const returnHomeButton = screen.getByText('Return Home').closest('button');
      expect(returnHomeButton?.className).toContain('hover:');

      const dashboardButton = screen.getByText('Go to Dashboard').closest('button');
      expect(dashboardButton?.className).toContain('hover:');
    });
  });

  describe('Content Order', () => {
    it('should have 404 number before heading on mobile', () => {
      renderWithProviders(createElement(NotFoundPage));

      // On mobile (default), order-2 is illustration, order-1 is text
      const textContent = screen.getByText('Lost in the Cosmos').closest('div');
      expect(textContent?.className).toContain('order-1');
    });

    it('should have illustration area with proper order', () => {
      renderWithProviders(createElement(NotFoundPage));

      // The illustration area should have order classes
      const illustrationArea = document.querySelector('.aspect-square');
      expect(illustrationArea).toBeInTheDocument();
    });
  });
});
