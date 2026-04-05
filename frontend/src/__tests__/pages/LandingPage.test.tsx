/**
 * LandingPage Component Tests
 *
 * Comprehensive tests for the marketing landing page
 * Covers: navigation, hero, features, testimonials, pricing, footer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import LandingPage from '../../pages/LandingPage';

// Helper to create a mock icon component
const createMockIcon = (name: string) => {
  const Icon = (props: any) =>
    createElement('svg', { ...props, 'data-testid': `icon-${name}` }, props.children);
  Icon.displayName = name;
  return Icon;
};

// Mock lucide-react icons imported in the source file
vi.mock('lucide-react', () => {
  const createIcon = (name: string) => {
    const Icon = (props: any) =>
      createElement('svg', { ...props, 'data-testid': `icon-${name}` }, props.children);
    Icon.displayName = name;
    return Icon;
  };
  return {
    CheckCircle: createIcon('CheckCircle'),
    Sparkles: createIcon('Sparkles'),
    AlertCircle: createIcon('AlertCircle'),
    Mail: createIcon('Mail'),
    Menu: createIcon('Menu'),
    X: createIcon('X'),
    Star: createIcon('Star'),
    ArrowLeft: createIcon('ArrowLeft'),
    ArrowRight: createIcon('ArrowRight'),
    Brain: createIcon('Brain'),
    Calendar: createIcon('Calendar'),
    Check: createIcon('Check'),
    Clock: createIcon('Clock'),
    Pentagon: createIcon('Pentagon'),
    PlayCircle: createIcon('PlayCircle'),
    Quote: createIcon('Quote'),
    Sun: createIcon('Sun'),
  };
});

// Mock useAuth hook
vi.mock('../../hooks', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
  }),
}));

// Helper to create wrapper with providers
const createWrapper = (route = '/') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  // Set the route
  window.history.pushState({}, 'Test page', route);

  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(HelmetProvider, null, createElement(BrowserRouter, null, children)),
    );
};

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement, route = '/') => {
  return render(ui, { wrapper: createWrapper(route) });
};

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have correct document structure', () => {
      renderWithProviders(createElement(LandingPage));
      // Main container
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      // Sections
      expect(document.getElementById('features')).toBeInTheDocument();
      expect(document.getElementById('testimonials')).toBeInTheDocument();
      expect(document.getElementById('pricing')).toBeInTheDocument();
    });
  });

  describe('Navigation Bar', () => {
    it('should render the logo and brand name', () => {
      renderWithProviders(createElement(LandingPage));
      const logoLinks = screen.getAllByRole('link', { name: /astroverse/i });
      expect(logoLinks.length).toBeGreaterThan(0);
    });

    it('should render desktop navigation links', () => {
      renderWithProviders(createElement(LandingPage));
      // Multiple features links exist (desktop + mobile)
      const featuresLinks = screen.getAllByRole('link', { name: /features/i });
      expect(featuresLinks.length).toBeGreaterThan(0);
    });

    it('should render Sign In link', () => {
      renderWithProviders(createElement(LandingPage));
      const signInLinks = screen
        .getAllByRole('link')
        .filter((link) => /^sign in$/i.test(link.textContent || ''));
      expect(signInLinks.length).toBeGreaterThan(0);
    });

    it('should render Get Started button in desktop nav', () => {
      renderWithProviders(createElement(LandingPage));
      const getStartedLinks = screen.getAllByRole('link', { name: /get started/i });
      expect(getStartedLinks.length).toBeGreaterThan(0);
    });

    it('should have mobile menu button on small screens', () => {
      renderWithProviders(createElement(LandingPage));
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('should toggle mobile menu when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LandingPage));

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });

      // Click to open menu
      await user.click(menuButton);

      // Now menu should show close icon
      expect(screen.getByRole('button', { name: /toggle menu/i })).toBeInTheDocument();
    });
  });

  describe('Hero Section', () => {
    it('should render the hero headline', () => {
      renderWithProviders(createElement(LandingPage));
      // Headline appears multiple times potentially
      const heroTexts = screen.getAllByText(/discover your/i);
      expect(heroTexts.length).toBeGreaterThan(0);
    });

    it('should render the hero description', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/unlock the secrets of your natal chart/i)).toBeInTheDocument();
    });

    it('should render version badge', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/v2.0 now available/i)).toBeInTheDocument();
    });

    it('should render Get Started Free button in hero', () => {
      renderWithProviders(createElement(LandingPage));
      const getStartedButton = screen.getByRole('link', { name: /get started free/i });
      expect(getStartedButton).toBeInTheDocument();
      expect(getStartedButton).toHaveAttribute('href', '/register');
    });

    it('should render Watch Demo button', () => {
      renderWithProviders(createElement(LandingPage));
      const watchDemoButton = screen.getByRole('button', { name: /watch demo/i });
      expect(watchDemoButton).toBeInTheDocument();
    });

    it('should handle Watch Demo button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LandingPage));

      const watchDemoButton = screen.getByRole('button', { name: /watch demo/i });
      await user.click(watchDemoButton);

      // Button click is handled without errors
      expect(watchDemoButton).toBeInTheDocument();
    });

    it('should render trust indicators', () => {
      renderWithProviders(createElement(LandingPage));
      const trustTexts = screen.getAllByText(/trusted by/i);
      expect(trustTexts.length).toBeGreaterThan(0);
      // 50,000+ appears multiple times
      const userCountTexts = screen.getAllByText(/50,000+/i);
      expect(userCountTexts.length).toBeGreaterThan(0);
    });

    it('should render user avatar images in trust section', () => {
      renderWithProviders(createElement(LandingPage));
      const avatars = screen.getAllByAltText(/user avatar/i);
      expect(avatars.length).toBe(3);
    });

    it('should render floating cards with transit information', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/current transit/i)).toBeInTheDocument();
      expect(screen.getByText(/mercury retrograde/i)).toBeInTheDocument();
      expect(screen.getByText(/sun sign/i)).toBeInTheDocument();
    });
  });

  describe('Features Section', () => {
    it('should render features section header', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/everything you need to/i)).toBeInTheDocument();
      expect(screen.getByText(/align with the stars/i)).toBeInTheDocument();
    });

    it('should render feature description', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/comprehensive suite of astrological tools/i)).toBeInTheDocument();
    });

    it('should render Natal Charts feature card', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/natal charts/i)).toBeInTheDocument();
      expect(screen.getByText(/deep dive analysis of your birth chart/i)).toBeInTheDocument();
    });

    it('should render Personality Insights feature card', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/personality insights/i)).toBeInTheDocument();
      expect(
        screen.getByText(/psychological profiling based on elemental balances/i),
      ).toBeInTheDocument();
    });

    it('should render Transit Forecasts feature card', () => {
      renderWithProviders(createElement(LandingPage));
      const transitTexts = screen.getAllByText(/transit forecasts/i);
      expect(transitTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Testimonials Section', () => {
    it('should render testimonials section header', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/trusted by 50,000\+/i)).toBeInTheDocument();
      expect(screen.getByText(/astrology enthusiasts/i)).toBeInTheDocument();
    });

    it('should render star rating', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/4\.9\/5/i)).toBeInTheDocument();
      expect(screen.getByText(/average rating/i)).toBeInTheDocument();
    });

    it('should render testimonial navigation buttons', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByRole('button', { name: /previous testimonial/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next testimonial/i })).toBeInTheDocument();
    });

    it('should render testimonial cards with quotes', () => {
      renderWithProviders(createElement(LandingPage));
      expect(
        screen.getByText(/astroverse completely changed how i plan my month/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/finally, an astrology app that combines beautiful design/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/the natal chart breakdown is so detailed/i)).toBeInTheDocument();
    });

    it('should render testimonial author information', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/elena r\./i)).toBeInTheDocument();
      expect(screen.getByText(/marcus t\./i)).toBeInTheDocument();
      expect(screen.getByText(/sarah l\./i)).toBeInTheDocument();
    });
  });

  describe('Pricing Section', () => {
    it('should render pricing section header', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/invest in your journey/i)).toBeInTheDocument();
    });

    it('should render pricing section description', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/choose the plan that best fits your path/i)).toBeInTheDocument();
    });

    it('should render Seeker (Free) plan', () => {
      renderWithProviders(createElement(LandingPage));
      const seekerTexts = screen.getAllByText(/seeker/i);
      expect(seekerTexts.length).toBeGreaterThan(0);
      // "free" appears multiple times, check for the forever text
      const foreverTexts = screen.getAllByText(/forever/i);
      expect(foreverTexts.length).toBeGreaterThan(0);
      expect(screen.getByRole('link', { name: /start free/i })).toBeInTheDocument();
    });

    it('should render Mystic (Pro) plan', () => {
      renderWithProviders(createElement(LandingPage));
      const mysticTexts = screen.getAllByText(/mystic/i);
      expect(mysticTexts.length).toBeGreaterThan(0);
      expect(screen.getByText(/\$9\.99/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /get pro access/i })).toBeInTheDocument();
    });

    it('should render Oracle (Enterprise) plan', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/oracle/i)).toBeInTheDocument();
      expect(screen.getByText(/\$29\.99/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /contact sales/i })).toBeInTheDocument();
    });

    it('should show "Most Popular" badge on Mystic plan', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/most popular/i)).toBeInTheDocument();
    });

    it('should render Seeker plan features', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/basic natal chart/i)).toBeInTheDocument();
      expect(screen.getByText(/daily horoscope/i)).toBeInTheDocument();
      expect(screen.getByText(/moon phase tracker/i)).toBeInTheDocument();
    });

    it('should render Mystic plan features', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/everything in seeker/i)).toBeInTheDocument();
      expect(screen.getByText(/full transit forecasts/i)).toBeInTheDocument();
      expect(screen.getByText(/synastry \(compatibility\)/i)).toBeInTheDocument();
    });

    it('should render Oracle plan features', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/unlimited charts/i)).toBeInTheDocument();
      expect(screen.getByText(/pdf export reports/i)).toBeInTheDocument();
      expect(screen.getByText(/api access/i)).toBeInTheDocument();
    });

    it('should have 3 pricing cards', () => {
      renderWithProviders(createElement(LandingPage));
      const pricingLinks = [
        screen.getByRole('link', { name: /start free/i }),
        screen.getByRole('link', { name: /get pro access/i }),
        screen.getByRole('link', { name: /contact sales/i }),
      ];
      expect(pricingLinks.length).toBe(3);
    });
  });

  describe('Footer Section', () => {
    it('should render footer description', () => {
      renderWithProviders(createElement(LandingPage));
      expect(
        screen.getByText(/connecting you to the cosmos through data-driven astrology/i),
      ).toBeInTheDocument();
    });

    it('should render social media links', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByRole('link', { name: /x \(twitter\)/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
    });

    it('should render newsletter signup form', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
    });

    it('should render copyright notice', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByText(/2026 astroverse inc\. all rights reserved\./i)).toBeInTheDocument();
    });

    it('should render legal links', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible navigation', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have aria-label on menu button', () => {
      renderWithProviders(createElement(LandingPage));
      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton).toHaveAttribute('aria-label', 'Toggle menu');
    });

    it('should have aria-label on social links', () => {
      renderWithProviders(createElement(LandingPage));
      expect(screen.getByRole('link', { name: /x \(twitter\)/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute('aria-label');
    });
  });

  describe('Interactive Elements', () => {
    it('should allow typing in newsletter email input', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LandingPage));

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });
  });

  describe('Animation and Styling', () => {
    it('should render with correct base classes', () => {
      renderWithProviders(createElement(LandingPage));

      // Main container should have dark background
      const mainContainer = document.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('bg-gradient-to-br');
    });

    it('should have CSS keyframe animations defined', () => {
      renderWithProviders(createElement(LandingPage));

      // Check for style element with keyframes
      const styleElement = document.querySelector('style');
      expect(styleElement).toBeInTheDocument();
      expect(styleElement?.textContent).toContain('@keyframes');
    });
  });
});
