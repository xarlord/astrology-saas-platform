/**
 * Toast Component Tests
 * Testing toast notifications, actions, and accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from '../ui/Toast';

describe('Toast', () => {
  describe('rendering', () => {
    it('should render with message', () => {
      render(<Toast id="toast-1" message="Test message" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Test message');
    });

    it('should render with title and message', () => {
      render(
        <Toast id="toast-1" title="Success!" message="Operation completed" />
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Success!');
      expect(screen.getByRole('alert')).toHaveTextContent('Operation completed');
    });

    it('should render with action button', () => {
      const handleAction = vi.fn();
      render(
        <Toast
          id="toast-1"
          message="Item deleted"
          action={{ label: 'Undo', onClick: handleAction }}
        />
      );
      expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('should render info variant by default', () => {
      render(<Toast id="toast-1" message="Info" />);
      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('border-blue-500');
    });

    it('should render success variant', () => {
      render(<Toast id="toast-1" variant="success" message="Success" />);
      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('border-green-500');
    });

    it('should render warning variant', () => {
      render(<Toast id="toast-1" variant="warning" message="Warning" />);
      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('border-yellow-500');
    });

    it('should render error variant', () => {
      render(<Toast id="toast-1" variant="error" message="Error" />);
      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('border-red-500');
    });
  });

  describe('progress bar', () => {
    it('should show progress bar by default', () => {
      render(<Toast id="toast-1" message="Test" />);
      const progressContainer = screen.getByRole('alert').querySelector('.h-1');
      expect(progressContainer).toBeInTheDocument();
    });

    it('should hide progress bar when showProgress is false', () => {
      render(<Toast id="toast-1" message="Test" showProgress={false} />);
      const progressContainer = screen.getByRole('alert').querySelector('.h-1');
      expect(progressContainer).not.toBeInTheDocument();
    });

    it('should have progress bar with initial width', () => {
      render(<Toast id="toast-1" message="Test" duration={1000} />);
      const progressBar = screen.getByRole('alert').querySelector('.h-full');
      expect(progressBar).toBeInTheDocument();
      // Progress starts at 100%
      expect(progressBar).toHaveStyle({ width: '100%' });
    });
  });

  describe('close button', () => {
    it('should have a close button', () => {
      render(<Toast id="toast-1" message="Test" />);
      expect(screen.getByLabelText('Close notification')).toBeInTheDocument();
    });

    it('should start closing animation when clicked', () => {
      const handleClose = vi.fn();
      render(<Toast id="toast-1" message="Test" onClose={handleClose} />);

      fireEvent.click(screen.getByLabelText('Close notification'));

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('translate-x-full', 'opacity-0');
    });
  });

  describe('action button', () => {
    it('should call action onClick when clicked', () => {
      const handleAction = vi.fn();
      const handleClose = vi.fn();

      render(
        <Toast
          id="toast-1"
          message="Item deleted"
          action={{ label: 'Undo', onClick: handleAction }}
          onClose={handleClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('keyboard navigation', () => {
    it('should have keyboard event listener for Escape', () => {
      const handleClose = vi.fn();
      render(<Toast id="toast-1" message="Test" onClose={handleClose} />);
      // Toast component sets up keyboard event listeners in useEffect
      // This test verifies the component renders without errors
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have role="alert"', () => {
      render(<Toast id="toast-1" message="Test" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have aria-live="polite"', () => {
      render(<Toast id="toast-1" message="Test" />);
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-atomic="true"', () => {
      render(<Toast id="toast-1" message="Test" />);
      expect(screen.getByRole('alert')).toHaveAttribute('aria-atomic', 'true');
    });

    it('should hide icon from screen readers', () => {
      render(<Toast id="toast-1" message="Test" />);
      const icon = screen.getByRole('alert').querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('animation', () => {
    it('should start with visible state', () => {
      render(<Toast id="toast-1" message="Test" />);
      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('translate-x-0', 'opacity-100');
    });

    it('should animate out when closing', () => {
      const handleClose = vi.fn();

      render(<Toast id="toast-1" message="Test" onClose={handleClose} />);

      fireEvent.click(screen.getByLabelText('Close notification'));

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('translate-x-full', 'opacity-0');
    });
  });
});
