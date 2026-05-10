/**
 * OnboardingFlow Component Tests
 *
 * Tests for the cinematic first-time onboarding experience.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import OnboardingFlow from '../OnboardingFlow';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => createElement('div', props, children),
    button: ({ children, ...props }: any) => createElement('button', props, children),
    canvas: ({ children, ...props }: any) => createElement('canvas', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));

const mockOnComplete = vi.fn();

const defaultProps = {
  onComplete: mockOnComplete,
};

describe('OnboardingFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the onboarding container', () => {
      render(createElement(OnboardingFlow, defaultProps));
      expect(screen.getByTestId('onboarding-flow')).toBeInTheDocument();
    });

    it('should start at step 1 (birthday)', () => {
      render(createElement(OnboardingFlow, defaultProps));
      expect(screen.getByTestId('step-birthday')).toBeInTheDocument();
    });

    it('should show progress indicator', () => {
      render(createElement(OnboardingFlow, defaultProps));
      expect(screen.getByTestId('onboarding-progress')).toBeInTheDocument();
    });

    it('should show step counter', () => {
      render(createElement(OnboardingFlow, defaultProps));
      expect(screen.getByText(/1\s*\/\s*3/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should advance to step 2 when Next clicked', () => {
      render(createElement(OnboardingFlow, defaultProps));
      const nextBtn = screen.getByTestId('next-step-btn');
      fireEvent.click(nextBtn);
      expect(screen.getByTestId('step-location')).toBeInTheDocument();
    });

    it('should advance to step 3 (reveal)', () => {
      render(createElement(OnboardingFlow, defaultProps));
      fireEvent.click(screen.getByTestId('next-step-btn')); // step 2
      fireEvent.click(screen.getByTestId('next-step-btn')); // step 3
      expect(screen.getByTestId('step-reveal')).toBeInTheDocument();
    });

    it('should call onComplete when finish button clicked', () => {
      render(createElement(OnboardingFlow, defaultProps));
      fireEvent.click(screen.getByTestId('next-step-btn')); // step 2
      fireEvent.click(screen.getByTestId('next-step-btn')); // step 3
      fireEvent.click(screen.getByTestId('finish-btn'));
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('should allow going back to previous step', () => {
      render(createElement(OnboardingFlow, defaultProps));
      fireEvent.click(screen.getByTestId('next-step-btn')); // step 2
      expect(screen.getByTestId('step-location')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('prev-step-btn')); // back to step 1
      expect(screen.getByTestId('step-birthday')).toBeInTheDocument();
    });
  });

  describe('Birthday Step', () => {
    it('should render date input', () => {
      render(createElement(OnboardingFlow, defaultProps));
      expect(screen.getByTestId('birthday-input')).toBeInTheDocument();
    });

    it('should render time input', () => {
      render(createElement(OnboardingFlow, defaultProps));
      expect(screen.getByTestId('birthtime-input')).toBeInTheDocument();
    });
  });

  describe('Location Step', () => {
    it('should render location input', () => {
      render(createElement(OnboardingFlow, defaultProps));
      fireEvent.click(screen.getByTestId('next-step-btn'));
      expect(screen.getByTestId('location-input')).toBeInTheDocument();
    });

    it('should offer auto-detect location button', () => {
      render(createElement(OnboardingFlow, defaultProps));
      fireEvent.click(screen.getByTestId('next-step-btn'));
      expect(screen.getByTestId('auto-detect-btn')).toBeInTheDocument();
    });
  });

  describe('Reveal Step', () => {
    it('should show completion message', () => {
      render(createElement(OnboardingFlow, defaultProps));
      fireEvent.click(screen.getByTestId('next-step-btn')); // step 2
      fireEvent.click(screen.getByTestId('next-step-btn')); // step 3
      expect(screen.getByText(/Your cosmic blueprint/i)).toBeInTheDocument();
    });
  });
});
