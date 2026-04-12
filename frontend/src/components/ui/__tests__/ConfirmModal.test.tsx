/**
 * ConfirmModal Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmModal } from '../ConfirmModal';

describe('ConfirmModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    message: 'This action cannot be undone.',
    itemName: 'My Natal Chart',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render nothing when isOpen is false', () => {
      render(<ConfirmModal {...mockProps} isOpen={false} />);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('should render the modal when isOpen is true', () => {
      render(<ConfirmModal {...mockProps} />);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('should display default title', () => {
      render(<ConfirmModal {...mockProps} />);
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    });

    it('should display custom title', () => {
      render(<ConfirmModal {...mockProps} title="Delete Item?" />);
      expect(screen.getByText('Delete Item?')).toBeInTheDocument();
    });

    it('should display item name in message', () => {
      render(<ConfirmModal {...mockProps} />);
      expect(screen.getByText(/My Natal Chart/)).toBeInTheDocument();
    });

    it('should display warning message', () => {
      render(<ConfirmModal {...mockProps} />);
      // The warning appears in multiple places, use getAllByText
      expect(screen.getAllByText(/This action cannot be undone/).length).toBeGreaterThan(0);
    });

    it('should render close button', () => {
      render(<ConfirmModal {...mockProps} />);
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    it('should display confirmation instruction', () => {
      render(<ConfirmModal {...mockProps} />);
      // Check for the label using the 'for' attribute
      const label = document.querySelector('label[for="confirm-input"]');
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain('DELETE');
    });
  });

  describe('Confirmation Input', () => {
    it('should have confirmation input field', () => {
      render(<ConfirmModal {...mockProps} />);
      expect(screen.getByPlaceholderText('DELETE')).toBeInTheDocument();
    });

    it('should start with empty input', () => {
      render(<ConfirmModal {...mockProps} />);
      const input = screen.getByPlaceholderText('DELETE') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should update input value on change', () => {
      render(<ConfirmModal {...mockProps} />);

      const input = screen.getByPlaceholderText('DELETE');
      fireEvent.change(input, { target: { value: 'DEL' } });

      expect(input).toHaveValue('DEL');
    });

    it('should show green border when DELETE is typed', () => {
      render(<ConfirmModal {...mockProps} />);

      const input = screen.getByPlaceholderText('DELETE');
      fireEvent.change(input, { target: { value: 'DELETE' } });

      expect(input).toHaveClass('border-green-500/50');
    });
  });

  describe('Confirm Button State', () => {
    it('should have disabled confirm button initially', () => {
      render(<ConfirmModal {...mockProps} />);
      const confirmButton = screen.getByText('Delete Forever').closest('button');
      expect(confirmButton).toBeDisabled();
    });

    it('should enable confirm button when DELETE is typed', () => {
      render(<ConfirmModal {...mockProps} />);

      const input = screen.getByPlaceholderText('DELETE');
      fireEvent.change(input, { target: { value: 'DELETE' } });

      const confirmButton = screen.getByText('Delete Forever').closest('button');
      expect(confirmButton).not.toBeDisabled();
    });

    it('should remain disabled if input does not match exactly', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...mockProps} />);

      const input = screen.getByPlaceholderText('DELETE');
      await user.type(input, 'delete'); // lowercase

      const confirmButton = screen.getByText('Delete Forever').closest('button');
      expect(confirmButton).toBeDisabled();
    });

    it('should use custom confirmation string', () => {
      render(<ConfirmModal {...mockProps} confirmationString="CONFIRM" />);

      expect(screen.getByPlaceholderText('CONFIRM')).toBeInTheDocument();
      // Check for CONFIRM in the label (it's in a span)
      const confirmLabels = screen.getAllByText('CONFIRM');
      expect(confirmLabels.length).toBeGreaterThan(0);

      const input = screen.getByPlaceholderText('CONFIRM');
      fireEvent.change(input, { target: { value: 'CONFIRM' } });

      const confirmButton = screen.getByText('Delete Forever').closest('button');
      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...mockProps} />);

      await user.click(screen.getByLabelText('Close modal'));
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...mockProps} />);

      await user.click(screen.getByText('Cancel'));
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...mockProps} />);

      const backdrop = screen.getByRole('alertdialog').parentElement?.firstChild;
      if (backdrop) {
        await user.click(backdrop as Element);
        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should call onConfirm when confirm button is clicked after typing DELETE', () => {
      render(<ConfirmModal {...mockProps} />);

      const input = screen.getByPlaceholderText('DELETE');
      fireEvent.change(input, { target: { value: 'DELETE' } });

      fireEvent.click(screen.getByText('Delete Forever'));
      expect(mockProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onClose after successful confirm', async () => {
      render(<ConfirmModal {...mockProps} />);

      const input = screen.getByPlaceholderText('DELETE');
      fireEvent.change(input, { target: { value: 'DELETE' } });

      fireEvent.click(screen.getByText('Delete Forever'));

      await waitFor(() => {
        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close on Escape key', () => {
      render(<ConfirmModal {...mockProps} />);

      const dialog = screen.getByRole('alertdialog');
      fireEvent.keyDown(dialog, { key: 'Escape' });
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should confirm on Enter key when input is correct', () => {
      render(<ConfirmModal {...mockProps} />);

      const input = screen.getByPlaceholderText('DELETE');
      fireEvent.change(input, { target: { value: 'DELETE' } });

      fireEvent.keyDown(document, { key: 'Enter' });
      expect(mockProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should not confirm on Enter key when input is incorrect', () => {
      render(<ConfirmModal {...mockProps} />);

      fireEvent.keyDown(document, { key: 'Enter' });
      expect(mockProps.onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Additional Option', () => {
    it('should not show additional option by default', () => {
      render(<ConfirmModal {...mockProps} />);
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('should show additional option when enabled', () => {
      render(
        <ConfirmModal
          {...mockProps}
          showAdditionalOption
          additionalOptionLabel="Also delete transit history"
        />,
      );
      expect(screen.getByText('Also delete transit history')).toBeInTheDocument();
    });

    it('should call onAdditionalOptionChange when checkbox is toggled', async () => {
      const user = userEvent.setup();
      const onAdditionalOptionChange = vi.fn();
      render(
        <ConfirmModal
          {...mockProps}
          showAdditionalOption
          onAdditionalOptionChange={onAdditionalOptionChange}
        />,
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onAdditionalOptionChange).toHaveBeenCalledWith(true);
    });

    it('should reflect additionalOptionChecked state', () => {
      render(<ConfirmModal {...mockProps} showAdditionalOption additionalOptionChecked />);

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('Variants', () => {
    it('should apply danger variant styles by default', () => {
      render(<ConfirmModal {...mockProps} />);
      // Modal should have red shadow for danger variant
      const modal = screen.getByRole('alertdialog');
      expect(modal).toHaveClass('shadow-red-500/20');
    });

    it('should apply warning variant styles', () => {
      render(<ConfirmModal {...mockProps} variant="warning" />);
      const modal = screen.getByRole('alertdialog');
      expect(modal).toHaveClass('shadow-yellow-500/20');
    });
  });

  describe('Loading State', () => {
    it('should show loading state when isLoading is true', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...mockProps} />);

      // Type DELETE to enable button
      const input = screen.getByPlaceholderText('DELETE');
      await user.type(input, 'DELETE');

      // Re-render with isLoading
      render(<ConfirmModal {...mockProps} isLoading />);

      expect(screen.getByText('Deleting...')).toBeInTheDocument();
    });

    it('should disable buttons when isLoading', () => {
      render(<ConfirmModal {...mockProps} isLoading />);

      const cancelButton = screen.getByText('Cancel').closest('button');
      const closeButton = screen.getByLabelText('Close modal');

      expect(cancelButton).toBeDisabled();
      expect(closeButton).toBeDisabled();
    });
  });

  describe('Custom Confirm Text', () => {
    it('should display custom confirm text', () => {
      render(<ConfirmModal {...mockProps} confirmText="Remove Forever" />);
      expect(screen.getByText('Remove Forever')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(<ConfirmModal {...mockProps} />);
      const dialog = screen.getByRole('alertdialog');

      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('should have accessible confirmation input', () => {
      render(<ConfirmModal {...mockProps} />);
      const input = screen.getByPlaceholderText('DELETE');
      expect(input).toHaveAttribute('id', 'confirm-input');
    });

    it('should focus input on open', async () => {
      render(<ConfirmModal {...mockProps} />);

      await waitFor(() => {
        const input = screen.getByPlaceholderText('DELETE');
        expect(input).toHaveFocus();
      });
    });
  });

  describe('Message Display', () => {
    it('should display message without item name', () => {
      render(<ConfirmModal {...mockProps} itemName={undefined} />);
      expect(screen.getByText(mockProps.message)).toBeInTheDocument();
    });

    it('should display item name with message', () => {
      render(<ConfirmModal {...mockProps} />);
      // Should show "Are you sure you want to delete "My Natal Chart"?"
      expect(screen.getByText(/My Natal Chart/)).toBeInTheDocument();
    });
  });
});
