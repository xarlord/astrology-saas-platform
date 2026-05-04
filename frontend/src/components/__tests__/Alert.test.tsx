/**
 * Alert Component Tests
 * Testing alert variants, dismissibility, and accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from '../ui/Alert';

describe('Alert', () => {
  describe('rendering', () => {
    it('should render with children', () => {
      render(<Alert>Alert message</Alert>);
      expect(screen.getByRole('alert')).toHaveTextContent('Alert message');
    });

    it('should render with title', () => {
      render(<Alert title="Warning Title">Alert description</Alert>);
      expect(screen.getByRole('heading', { name: 'Warning Title' })).toBeInTheDocument();
    });

    it('should render title and children', () => {
      render(<Alert title="Title">Description text</Alert>);
      expect(screen.getByRole('alert')).toHaveTextContent('Title');
      expect(screen.getByRole('alert')).toHaveTextContent('Description text');
    });
  });

  describe('variants', () => {
    it('should render info variant by default', () => {
      render(<Alert>Info message</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-blue-50');
    });

    it('should render success variant', () => {
      render(<Alert variant="success">Success message</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-green-50');
    });

    it('should render warning variant', () => {
      render(<Alert variant="warning">Warning message</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-yellow-50');
    });

    it('should render error variant', () => {
      render(<Alert variant="error">Error message</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-red-50');
    });
  });

  describe('dismissible', () => {
    it('should not show close button by default', () => {
      render(<Alert>Non-dismissible</Alert>);
      expect(screen.queryByLabelText('Dismiss alert')).not.toBeInTheDocument();
    });

    it('should show close button when dismissible and onClose provided', () => {
      render(
        <Alert dismissible onClose={() => {}}>
          Dismissible
        </Alert>,
      );
      expect(screen.getByLabelText('Dismiss alert')).toBeInTheDocument();
    });

    it('should not show close button when dismissible but no onClose', () => {
      render(<Alert dismissible>Dismissible</Alert>);
      expect(screen.queryByLabelText('Dismiss alert')).not.toBeInTheDocument();
    });

    it('should start closing animation when close button clicked', () => {
      const handleClose = vi.fn();

      render(
        <Alert dismissible onClose={handleClose}>
          Dismissible
        </Alert>,
      );

      fireEvent.click(screen.getByLabelText('Dismiss alert'));

      // Should start closing animation
      expect(screen.getByRole('alert')).toHaveClass('opacity-0');
    });
  });

  describe('accessibility', () => {
    it('should have role="alert"', () => {
      render(<Alert>Alert</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have aria-live="assertive" for error variant', () => {
      render(<Alert variant="error">Error</Alert>);
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have aria-live="polite" for non-error variants', () => {
      render(<Alert variant="info">Info</Alert>);
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-atomic="true"', () => {
      render(<Alert>Alert</Alert>);
      expect(screen.getByRole('alert')).toHaveAttribute('aria-atomic', 'true');
    });

    it('should hide icon from screen readers', () => {
      render(<Alert>Alert</Alert>);
      const icon = screen.getByRole('alert').querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('icons', () => {
    it('should render info icon for info variant', () => {
      render(<Alert variant="info">Info</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert.querySelector('svg')).toBeInTheDocument();
    });

    it('should render success icon for success variant', () => {
      render(<Alert variant="success">Success</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert.querySelector('svg')).toBeInTheDocument();
    });

    it('should render warning icon for warning variant', () => {
      render(<Alert variant="warning">Warning</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert.querySelector('svg')).toBeInTheDocument();
    });

    it('should render error icon for error variant', () => {
      render(<Alert variant="error">Error</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should accept custom className', () => {
      render(<Alert className="custom-alert">Alert</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('custom-alert');
    });

    it('should merge custom className with default classes', () => {
      render(<Alert className="custom-alert">Alert</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-alert');
      expect(alert).toHaveClass('rounded-lg');
    });
  });

  describe('animation', () => {
    it('should have transition classes', () => {
      render(<Alert>Alert</Alert>);
      expect(screen.getByRole('alert')).toHaveClass('transition-all');
    });

    it('should apply closing animation when dismissing', () => {
      const handleClose = vi.fn();

      render(
        <Alert dismissible onClose={handleClose}>
          Dismissible
        </Alert>,
      );

      fireEvent.click(screen.getByLabelText('Dismiss alert'));
      expect(screen.getByRole('alert')).toHaveClass('opacity-0', 'scale-95');
    });
  });
});
