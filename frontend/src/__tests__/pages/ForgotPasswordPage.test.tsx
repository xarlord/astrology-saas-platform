/**
 * ForgotPasswordPage Component Tests
 *
 * Tests for the Forgot Password page component covering:
 * - Component rendering
 * - Form input handling
 * - Form submission via authService
 * - Error states
 * - Success state (email sent confirmation)
 * - Navigation links
 * - Accessibility
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { createElement } from 'react';
import { createElement as h } from 'react';

// Mock authService before importing the component
vi.mock('../../services/auth.service', () => ({
  authService: {
    forgotPassword: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock errorHandling utility
vi.mock('../../utils/errorHandling', () => ({
  getErrorMessage: vi.fn((_err, fallback) => fallback),
}));

// Import after mocks
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage';
import { authService } from '../../services/auth.service';

// Helper to render with router
const renderForgotPasswordPage = () => {
  return render(
    createElement(
      MemoryRouter,
      null,
      createElement(ForgotPasswordPage),
    ),
  );
};

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.forgotPassword).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State Rendering', () => {
    it('should render the reset password page with all required elements', () => {
      renderForgotPasswordPage();

      // Header
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByText(/Enter your email and we'll send you a reset link/i)).toBeInTheDocument();

      // Form field
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();

      // Submit button
      expect(screen.getByText('Send Reset Link')).toBeInTheDocument();

      // Back to login link
      expect(screen.getByText(/Back to Login/i)).toBeInTheDocument();
    });

    it('should have correct input attributes for email field', () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');
    });

    it('should render the lock_reset icon', () => {
      renderForgotPasswordPage();

      const icon = screen.getByText('lock_reset');
      expect(icon).toBeInTheDocument();
    });

    it('should render material symbols with correct class', () => {
      renderForgotPasswordPage();

      const materialIcons = document.querySelectorAll('.material-symbols-outlined');
      expect(materialIcons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Form Input Handling', () => {
    it('should update email state when typing', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should start with empty email input', () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      expect(emailInput.value).toBe('');
    });

    it('should handle special characters in email', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      await user.type(emailInput, 'test+special@example.com');

      expect(emailInput.value).toBe('test+special@example.com');
    });
  });

  describe('Form Submission', () => {
    it('should call authService.forgotPassword on valid submission', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('should show success state after valid submission', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Check your email')).toBeInTheDocument();
      });
    });

    it('should show submitted email in success message', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/test@example\.com/)).toBeInTheDocument();
      });
    });

    it('should show mark_email_read icon in success state', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('mark_email_read')).toBeInTheDocument();
      });
    });

    it('should show "Check your email" heading in success state', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 2, name: /check your email/i })).toBeInTheDocument();
      });
    });

    it('should handle form submission with fireEvent', async () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const form = emailInput.closest('form')!;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('should show loading state during submission', async () => {
      // Make forgotPassword hang to observe loading state
      vi.mocked(authService.forgotPassword).mockReturnValue(new Promise(() => {}));

      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      expect(screen.getByText('Sending...')).toBeInTheDocument();
    });

    it('should disable button during submission', async () => {
      // Make forgotPassword hang to observe disabled state
      vi.mocked(authService.forgotPassword).mockReturnValue(new Promise(() => {}));

      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error States', () => {
    it('should display error message when API call fails', async () => {
      vi.mocked(authService.forgotPassword).mockRejectedValue(new Error('Server error'));

      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should show error icon in error message', async () => {
      vi.mocked(authService.forgotPassword).mockRejectedValue(new Error('Server error'));

      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        const errorIcon = screen.getByText('error');
        expect(errorIcon).toBeInTheDocument();
      });
    });

    it('should clear error on new submission attempt', async () => {
      // First call fails, second succeeds
      vi.mocked(authService.forgotPassword)
        .mockRejectedValueOnce(new Error('Server error'))
        .mockResolvedValueOnce(undefined);

      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Submit again
      await user.click(submitButton);

      // Error should be gone and success state shown
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByText('Check your email')).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    it('should show Back to Login link in success state', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        const backToLoginLinks = screen.getAllByRole('link', { name: /back to login/i });
        expect(backToLoginLinks.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should have login link pointing to /login in success state', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        const backToLoginLinks = screen.getAllByRole('link', { name: /back to login/i });
        const successLink = backToLoginLinks.find(link => link.closest('.glass-card'));
        expect(successLink).toHaveAttribute('href', '/login');
      });
    });

    it('should show instruction text about email', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/If an account exists for/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Links', () => {
    it('should have Back to Login link in form state', () => {
      renderForgotPasswordPage();

      const backToLoginLinks = screen.getAllByRole('link', { name: /back to login/i });
      expect(backToLoginLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('should have login link pointing to /login in form state', () => {
      renderForgotPasswordPage();

      const backToLoginLinks = screen.getAllByRole('link', { name: /back to login/i });
      expect(backToLoginLinks[0]).toHaveAttribute('href', '/login');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderForgotPasswordPage();

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('should have required attribute on email field', () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toBeRequired();
    });

    it('should have email type for email input', () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have aria-hidden on decorative icons', () => {
      renderForgotPasswordPage();

      const decorativeIcons = document.querySelectorAll('.material-symbols-outlined[aria-hidden="true"]');
      expect(decorativeIcons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long email input', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const longEmail = 'a'.repeat(100) + '@example.com';
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      await user.type(emailInput, longEmail);

      expect(emailInput.value).toBe(longEmail);
    });

    it('should handle uppercase email', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      await user.type(emailInput, 'TEST@EXAMPLE.COM');

      expect(emailInput.value).toBe('TEST@EXAMPLE.COM');
    });
  });

  describe('Component State Transitions', () => {
    it('should transition from form to success state', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      // Initial state
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByText('Send Reset Link')).toBeInTheDocument();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      // Success state
      await waitFor(() => {
        expect(screen.getByText('Check your email')).toBeInTheDocument();
        expect(screen.queryByText('Send Reset Link')).not.toBeInTheDocument();
      });
    });
  });

  describe('Layout and Styling', () => {
    it('should have glass-card class on the form', () => {
      renderForgotPasswordPage();

      const card = document.querySelector('.glass-card');
      expect(card).toBeInTheDocument();
    });

    it('should have max-w-md class for form width', () => {
      renderForgotPasswordPage();

      const container = document.querySelector('.max-w-md');
      expect(container).toBeInTheDocument();
    });

    it('should have rounded-2xl class on the form card', () => {
      renderForgotPasswordPage();

      const card = document.querySelector('.rounded-2xl');
      expect(card).toBeInTheDocument();
    });

    it('should have the cosmic-gradient on submit button', () => {
      renderForgotPasswordPage();

      const submitButton = screen.getByText('Send Reset Link').closest('button');
      expect(submitButton?.className).toContain('bg-cosmic-gradient');
    });

    it('should have input class on the email input', () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveClass('input');
    });
  });
});
