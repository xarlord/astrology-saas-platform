/**
 * CosmicIdentityCard Component Tests
 *
 * Tests for the shareable animated Big Three (Sun/Moon/Rising) card
 * designed for Instagram Stories and social sharing.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import CosmicIdentityCard from '../CosmicIdentityCard';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => createElement('div', props, children),
    svg: ({ children, ...props }: any) => createElement('svg', props, children),
    path: ({ children, ...props }: any) => createElement('path', props, children),
    text: ({ children, ...props }: any) => createElement('text', props, children),
    circle: ({ children, ...props }: any) => createElement('circle', props, children),
    g: ({ children, ...props }: any) => createElement('g', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));

const defaultProps = {
  sunSign: 'Gemini',
  moonSign: 'Pisces',
  risingSign: 'Scorpio',
  userName: 'Sefa',
};

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

describe('CosmicIdentityCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the cosmic identity card', () => {
      render(createElement(CosmicIdentityCard, defaultProps));
      expect(screen.getByTestId('cosmic-identity-card')).toBeInTheDocument();
    });

    it('should display Sun sign with symbol', () => {
      render(createElement(CosmicIdentityCard, defaultProps));
      expect(screen.getByText(/Sun/i)).toBeInTheDocument();
      expect(screen.getByText(ZODIAC_SYMBOLS.Gemini)).toBeInTheDocument();
    });

    it('should display Moon sign with symbol', () => {
      render(createElement(CosmicIdentityCard, defaultProps));
      expect(screen.getByText(/Moon/i)).toBeInTheDocument();
      expect(screen.getByText(ZODIAC_SYMBOLS.Pisces)).toBeInTheDocument();
    });

    it('should display Rising sign with symbol', () => {
      render(createElement(CosmicIdentityCard, defaultProps));
      expect(screen.getByText(/Rising/i)).toBeInTheDocument();
      expect(screen.getByText(ZODIAC_SYMBOLS.Scorpio)).toBeInTheDocument();
    });

    it('should display user name', () => {
      render(createElement(CosmicIdentityCard, defaultProps));
      expect(screen.getByText('Sefa')).toBeInTheDocument();
    });

    it('should render cosmic fingerprint SVG pattern', () => {
      render(createElement(CosmicIdentityCard, defaultProps));
      expect(screen.getByTestId('cosmic-fingerprint')).toBeInTheDocument();
    });
  });

  describe('Deterministic Fingerprint', () => {
    it('should generate same fingerprint for same signs', () => {
      const { container: c1 } = render(createElement(CosmicIdentityCard, defaultProps));
      const fp1 = c1.querySelector('[data-testid="cosmic-fingerprint"]')?.innerHTML;

      const { container: c2 } = render(createElement(CosmicIdentityCard, defaultProps));
      const fp2 = c2.querySelector('[data-testid="cosmic-fingerprint"]')?.innerHTML;

      expect(fp1).toBe(fp2);
    });

    it('should generate different fingerprint for different signs', () => {
      const { container: c1 } = render(createElement(CosmicIdentityCard, defaultProps));
      const fp1 = c1.querySelector('[data-testid="cosmic-fingerprint"]')?.innerHTML;

      const altProps = { ...defaultProps, moonSign: 'Aries' };
      const { container: c2 } = render(createElement(CosmicIdentityCard, altProps));
      const fp2 = c2.querySelector('[data-testid="cosmic-fingerprint"]')?.innerHTML;

      expect(fp1).not.toBe(fp2);
    });
  });

  describe('Share', () => {
    it('should have a share button', () => {
      render(createElement(CosmicIdentityCard, defaultProps));
      expect(screen.getByTestId('share-button')).toBeInTheDocument();
    });

    it('should render element badges for each sign', () => {
      render(createElement(CosmicIdentityCard, defaultProps));
      // Gemini = Air, Pisces = Water, Scorpio = Water
      expect(screen.getAllByText(/Water/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Air/i)).toBeInTheDocument();
    });
  });
});
