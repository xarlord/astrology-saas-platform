/**
 * Modal Component Tests
 * Testing modal dialog, focus trap, keyboard navigation, and accessibility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../ui/Modal';

describe('Modal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  afterEach(() => {
    // Clean up any open modals
    document.body.style.overflow = '';
    document.body.removeAttribute('aria-hidden');
  });

  describe('rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={mockOnClose}>
          Modal content
        </Modal>,
      );
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          Modal content
        </Modal>,
      );
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('should render with title', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Modal Title">
          Content
        </Modal>,
      );
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });

    it('should render with footer', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} footer={<button>Footer Button</button>}>
          Content
        </Modal>,
      );
      expect(screen.getByText('Footer Button')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('should render md size by default', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          Content
        </Modal>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.querySelector('.max-w-lg')).toBeInTheDocument();
    });

    it('should render sm size', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} size="sm">
          Content
        </Modal>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.querySelector('.max-w-md')).toBeInTheDocument();
    });

    it('should render lg size', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} size="lg">
          Content
        </Modal>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.querySelector('.max-w-2xl')).toBeInTheDocument();
    });

    it('should render xl size', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} size="xl">
          Content
        </Modal>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.querySelector('.max-w-4xl')).toBeInTheDocument();
    });

    it('should render full size', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} size="full">
          Content
        </Modal>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.querySelector('.max-w-full')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('should render default variant by default', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          Content
        </Modal>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.querySelector('.bg-white')).toBeInTheDocument();
    });

    it('should render danger variant', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} variant="danger">
          Content
        </Modal>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.querySelector('.border-red-500')).toBeInTheDocument();
    });

    it('should render success variant', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} variant="success">
          Content
        </Modal>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.querySelector('.border-green-500')).toBeInTheDocument();
    });
  });

  describe('close button', () => {
    it('should show close button by default', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Title">
          Content
        </Modal>,
      );
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    it('should hide close button when showCloseButton is false', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} showCloseButton={false}>
          Content
        </Modal>,
      );
      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });

    it('should call onClose when close button clicked', async () => {
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Title">
          Content
        </Modal>,
      );

      await user.click(screen.getByLabelText('Close modal'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('overlay click', () => {
    it('should close on overlay click by default', async () => {
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          Content
        </Modal>,
      );

      // Click on the overlay (backdrop)
      const overlay = screen.getByRole('dialog').querySelector('.absolute.inset-0');
      if (overlay) {
        await user.click(overlay);
      }

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close on overlay click when closeOnOverlayClick is false', async () => {
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={mockOnClose} closeOnOverlayClick={false}>
          Content
        </Modal>,
      );

      const overlay = screen.getByRole('dialog').querySelector('.absolute.inset-0');
      if (overlay) {
        await user.click(overlay);
      }

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not close when clicking modal content', async () => {
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <button>Content Button</button>
        </Modal>,
      );

      await user.click(screen.getByText('Content Button'));
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('should close on Escape key by default', async () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          Content
        </Modal>,
      );

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close on Escape when closeOnEscape is false', async () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} closeOnEscape={false}>
          Content
        </Modal>,
      );

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('focus management', () => {
    it('should focus close button by default', async () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Title">
          Content
        </Modal>,
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Close modal')).toHaveFocus();
      });
    });

    it('should restore focus to previous element on close', async () => {
      const previousButton = document.createElement('button');
      previousButton.textContent = 'Previous';
      document.body.appendChild(previousButton);
      previousButton.focus();

      const { rerender } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          Content
        </Modal>,
      );

      rerender(
        <Modal isOpen={false} onClose={mockOnClose}>
          Content
        </Modal>,
      );

      await waitFor(() => {
        expect(previousButton).toHaveFocus();
      });

      document.body.removeChild(previousButton);
    });
  });

  describe('body scroll lock', () => {
    it('should lock body scroll when open', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          Content
        </Modal>,
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when closed', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          Content
        </Modal>,
      );

      rerender(
        <Modal isOpen={false} onClose={mockOnClose}>
          Content
        </Modal>,
      );

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('accessibility', () => {
    it('should have role="dialog"', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          Content
        </Modal>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal="true"', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          Content
        </Modal>,
      );
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby when title is provided', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Modal Title">
          Content
        </Modal>,
      );
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should have aria-describedby', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          Content
        </Modal>,
      );
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-describedby', 'modal-description');
    });

    it('should hide backdrop from screen readers', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          Content
        </Modal>,
      );
      const backdrop = screen.getByRole('dialog').querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should accept custom className on modal', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} className="custom-modal">
          Content
        </Modal>,
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.querySelector('.custom-modal')).toBeInTheDocument();
    });

    it('should accept contentClassName', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} contentClassName="custom-content">
          Content
        </Modal>,
      );
      expect(screen.getByText('Content')).toHaveClass('custom-content');
    });
  });
});
