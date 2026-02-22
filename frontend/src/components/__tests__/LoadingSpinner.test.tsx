/**
 * LoadingSpinner Component Tests
 * Testing spinner sizes, colors, and accessibility
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('rendering', () => {
    it('should render a spinner element', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render with default label "Loading..."', () => {
      render(<LoadingSpinner />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<LoadingSpinner label="Fetching data..." />);
      expect(screen.getByText('Fetching data...')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('should render md size by default', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-8', 'w-8');
    });

    it('should render xs size', () => {
      render(<LoadingSpinner size="xs" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-3', 'w-3');
    });

    it('should render sm size', () => {
      render(<LoadingSpinner size="sm" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-4', 'w-4');
    });

    it('should render lg size', () => {
      render(<LoadingSpinner size="lg" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-12', 'w-12');
    });

    it('should render xl size', () => {
      render(<LoadingSpinner size="xl" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-16', 'w-16');
    });
  });

  describe('colors', () => {
    it('should render primary color by default', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('border-indigo-600');
    });

    it('should render secondary color', () => {
      render(<LoadingSpinner color="secondary" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('border-purple-600');
    });

    it('should render white color', () => {
      render(<LoadingSpinner color="white" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('border-white');
    });

    it('should render gray color', () => {
      render(<LoadingSpinner color="gray" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('border-gray-400');
    });
  });

  describe('fullScreen mode', () => {
    it('should not render full screen by default', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner.parentElement).not.toHaveClass('fixed');
    });

    it('should render full screen overlay when fullScreen is true', () => {
      render(<LoadingSpinner fullScreen />);
      const overlay = screen.getByRole('progressbar');
      expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50');
    });

    it('should have aria-busy in full screen mode', () => {
      render(<LoadingSpinner fullScreen />);
      const overlay = screen.getByRole('progressbar');
      expect(overlay).toHaveAttribute('aria-busy', 'true');
    });

    it('should have correct aria-label in full screen mode', () => {
      render(<LoadingSpinner fullScreen />);
      const overlay = screen.getByRole('progressbar');
      expect(overlay).toHaveAttribute('aria-label', 'Loading content');
    });

    it('should have backdrop blur in full screen mode', () => {
      render(<LoadingSpinner fullScreen />);
      const overlay = screen.getByRole('progressbar');
      expect(overlay).toHaveClass('backdrop-blur-sm');
    });
  });

  describe('custom className', () => {
    it('should accept custom className', () => {
      render(<LoadingSpinner className="custom-spinner" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('custom-spinner');
    });

    it('should merge custom className with default classes', () => {
      render(<LoadingSpinner className="custom-spinner" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('custom-spinner');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('accessibility', () => {
    it('should have role="status"', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-live="polite"', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-label', () => {
      render(<LoadingSpinner label="Loading data" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading data');
    });

    it('should have screen reader text', () => {
      render(<LoadingSpinner label="Loading..." />);
      const srText = screen.getByText('Loading...');
      expect(srText).toHaveClass('sr-only');
    });

    it('should have animate-spin class', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('animate-spin');
    });
  });
});
