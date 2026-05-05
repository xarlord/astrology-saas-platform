/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ForgotPasswordPage Component Tests
 *
 * Tests for the Forgot Password page component covering:
 * - Component rendering
 * - Form input handling
 * - Form submission and success state
 * - Error states
 * - Navigation
 * - Accessibility
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock PublicPageLayout before importing the page component
vi.mock('../../components/PublicPageLayout', () => ({
  PublicPageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock auth service
vi.mock('../../services/auth.service', () => ({
  authService: { forgotPassword: vi.fn().mockResolvedValue({}) },
}));

// Import the mocked service for test assertions
import { authService } from '../../services/auth.service';
const mockedForgotPassword = authService.forgotPassword as ReturnType<typeof vi.fn>;

// Mock errorHandling utility
vi.mock('../../utils/errorHandling', () => ({
  getErrorMessage: (_err: unknown, fallback: string) => fallback,
}));

import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage';

// Helper to render with router
const renderForgotPasswordPage = () => {
  return render(
    <BrowserRouter>
      <ForgotPasswordPage />
    </BrowserRouter>,
  );
};

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedForgotPassword.mockResolvedValue({});
  });

  describe('Initial State Rendering', () => {
    it('should render the forgot password page with all required elements', () => {
      renderForgotPasswordPage();

      // Header
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByText(/enter your email/i)).toBeInTheDocument();

      // Form field
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();

      // Submit button
      expect(screen.getByText('Send Reset Link')).toBeInTheDocument();

      // Back to login link
      expect(screen.getByText('Back to Login')).toBeInTheDocument();
    });

    it('should have correct input attributes for email field', () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');
    });

    it('should render lock_reset icon', () => {
      renderForgotPasswordPage();

      const lockIcon = screen.getByText('lock_reset', { selector: 'span' });
      expect(lockIcon).toBeInTheDocument();
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

    it('should handle empty email input', () => {
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
    it('should show success state after valid submission', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
    });

    it('should handle form submission with fireEvent', async () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const form = emailInput.closest('form')!;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
    });

    it('should call authService.forgotPassword with email', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedForgotPassword).toHaveBeenCalledWith('test@example.com');
      });
    });
  });

  describe('Success State (Email Sent)', () => {
    it('should show success message after form submission', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
    });

    it('should show email in success message', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
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
        const icon = screen.getByText('mark_email_read', { selector: 'span' });
        expect(icon).toBeInTheDocument();
      });
    });

    it('should show Back to Login link in success state', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        const backToLoginLink = screen.getByRole('link', { name: /back to login/i });
        expect(backToLoginLink).toHaveAttribute('href', '/login');
      });
    });
  });

  describe('Error States', () => {
    it('should display error message when API fails', async () => {
      mockedForgotPassword.mockRejectedValueOnce(new Error('API error'));

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
      mockedForgotPassword.mockRejectedValueOnce(new Error('API error'));

      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        const errorIcon = screen.getByText('error', { selector: 'span' });
        expect(errorIcon).toBeInTheDocument();
      });
    });

    it('should clear error on new submission attempt', async () => {
      mockedForgotPassword.mockRejectedValueOnce(new Error('API error'));

      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      // Trigger error
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Submit again (succeeds this time)
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation Links', () => {
    it('should have correct link to login page in form state', () => {
      renderForgotPasswordPage();

      const signInLink = screen.getByRole('link', { name: /back to login/i });
      expect(signInLink).toHaveAttribute('href', '/login');
    });

    it('should have correct link to login page in success state', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        const backToLoginLink = screen.getByRole('link', { name: /back to login/i });
        expect(backToLoginLink).toHaveAttribute('href', '/login');
      });
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

    it('should have submit type on submit button', () => {
      renderForgotPasswordPage();

      const submitButton = screen.getByText('Send Reset Link');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should have aria-required on email input', () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('aria-required', 'true');
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

    it('should disable submit button while submitting', async () => {
      // Make forgotPassword hang to test loading state
      mockedForgotPassword.mockReturnValue(new Promise(() => {}));

      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Sending...')).toBeInTheDocument();
      });
    });
  });

  describe('Component State Transitions', () => {
    it('should transition from form to success state', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      // Initial state
      expect(screen.getByText('Reset Password')).toBeInTheDocument();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByText('Send Reset Link');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      // Success state
      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
        // "Reset Password" heading is always rendered (outside conditional)
      });
    });
  });
});
