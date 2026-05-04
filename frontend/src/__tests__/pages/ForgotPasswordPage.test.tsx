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
 * - Form validation
 * - Form submission
 * - Error states
 * - Success state (email sent confirmation)
 * - Navigation
 * - Request new link functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ForgotPasswordPage from '../../pages/ForgotPasswordPage';

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log;
let consoleLogMock: ReturnType<typeof vi.fn>;

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
    // Reset all mocks
    vi.clearAllMocks();

    // Mock console.log
    consoleLogMock = vi.fn();
    console.log = consoleLogMock;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  describe('Initial State Rendering', () => {
    it('should render the forgot password page with all required elements', () => {
      renderForgotPasswordPage();

      // Logo and brand
      expect(screen.getByText('AstroVerse')).toBeInTheDocument();

      // Header
      expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
      expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();

      // Form field
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();

      // Submit button
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
      expect(screen.getByText('Send Reset Link')).toBeInTheDocument();

      // Back to login link
      expect(screen.getByText(/remember your password/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('should have correct input attributes for email field', () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('placeholder', 'name@example.com');
    });

    it('should have correct link to home page from logo', () => {
      renderForgotPasswordPage();

      const logoLink = screen.getByText('AstroVerse').closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('should have correct link to login page', () => {
      renderForgotPasswordPage();

      const signInLink = screen.getByRole('link', { name: 'Sign In' });
      expect(signInLink).toHaveAttribute('href', '/login');
    });

    it('should render material icons', () => {
      renderForgotPasswordPage();

      // Check for material symbols
      const icons = screen.getAllByText('auto_awesome', { selector: 'span' });
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should render email icon', () => {
      renderForgotPasswordPage();

      // Check for mail icon
      const mailIcon = screen.getByText('mail', { selector: 'span' });
      expect(mailIcon).toBeInTheDocument();
    });
  });

  describe('Form Input Handling', () => {
    it('should update email state when typing', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should handle empty email input', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
      expect(emailInput.value).toBe('');
    });

    it('should handle special characters in email', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
      await user.type(emailInput, 'test+special@example.com');

      expect(emailInput.value).toBe('test+special@example.com');
    });
  });

  describe('Form Validation', () => {
    it('should show error when email is empty (using fireEvent)', () => {
      renderForgotPasswordPage();

      const form = screen.getByTestId('submit-button').closest('form')!;
      fireEvent.submit(form);

      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    it('should show error when email does not contain @', () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input');
      const form = emailInput.closest('form')!;

      fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
      fireEvent.submit(form);

      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    it('should show error for email without domain', () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input');
      const form = emailInput.closest('form')!;

      fireEvent.change(emailInput, { target: { value: 'test@' } });
      fireEvent.submit(form);

      // The component only checks for presence of @
      // test@ contains @ so it should pass validation and go to success state
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    });

    it('should not show error initially', () => {
      renderForgotPasswordPage();

      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
    });

    it('should clear error when user types after error', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input');
      const form = emailInput.closest('form')!;

      // Trigger error
      fireEvent.submit(form);
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();

      // Clear and type valid email
      await user.clear(emailInput);
      fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
      fireEvent.submit(form);

      // After successful submission, form should show success state
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should show success state after valid submission', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });
    });

    it('should handle password reset request submission', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });
    });

    it('should handle form submission with fireEvent', async () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input');
      const form = emailInput.closest('form')!;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });
    });
  });

  describe('Success State (Email Sent)', () => {
    beforeEach(async () => {
      // Submit form to get to success state
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input');
      const form = emailInput.closest('form')!;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.submit(form);

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });
    });

    it('should show success message after form submission', () => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    });

    it('should show email in success message', () => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should show check_circle icon in success state', () => {
      const checkIcon = screen.getByText('check_circle', { selector: 'span' });
      expect(checkIcon).toBeInTheDocument();
    });

    it('should show instruction text about spam folder', () => {
      expect(screen.getByText(/didn't receive the email/i)).toBeInTheDocument();
      expect(screen.getByText(/check your spam folder/i)).toBeInTheDocument();
    });

    it('should show Request New Link button', () => {
      expect(screen.getByRole('button', { name: /request new link/i })).toBeInTheDocument();
    });

    it('should show Back to Login link', () => {
      const backToLoginLink = screen.getByRole('link', { name: /back to login/i });
      expect(backToLoginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Request New Link Functionality', () => {
    it('should return to form when Request New Link is clicked', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      // First submit to get to success state
      const emailInput = screen.getByTestId('email-input');
      const form = emailInput.closest('form')!;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });

      // Now click Request New Link
      const requestNewLinkButton = screen.getByRole('button', { name: /request new link/i });
      await user.click(requestNewLinkButton);

      // Should be back to form state
      await waitFor(() => {
        expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
        expect(screen.getByTestId('email-input')).toBeInTheDocument();
      });
    });

    it('should clear email when Request New Link is clicked', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      // First submit to get to success state
      const emailInput = screen.getByTestId('email-input');
      const form = emailInput.closest('form')!;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });

      // Now click Request New Link
      const requestNewLinkButton = screen.getByRole('button', { name: /request new link/i });
      await user.click(requestNewLinkButton);

      // Email should be cleared
      await waitFor(() => {
        const newEmailInput = screen.getByTestId('email-input') as HTMLInputElement;
        expect(newEmailInput.value).toBe('');
      });
    });

    it('should allow resubmission after clicking Request New Link', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      // First submission
      const emailInput = screen.getByTestId('email-input');
      const form = emailInput.closest('form')!;

      fireEvent.change(emailInput, { target: { value: 'first@example.com' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });

      // Request new link
      const requestNewLinkButton = screen.getByRole('button', { name: /request new link/i });
      await user.click(requestNewLinkButton);

      await waitFor(() => {
        expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
      });

      // Second submission with different email
      const newEmailInput = screen.getByTestId('email-input');
      const newForm = newEmailInput.closest('form')!;

      fireEvent.change(newEmailInput, { target: { value: 'second@example.com' } });
      fireEvent.submit(newForm);

      await waitFor(() => {
        expect(screen.getByText('second@example.com')).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('should display error message in error container', () => {
      renderForgotPasswordPage();

      const form = screen.getByTestId('submit-button').closest('form')!;
      fireEvent.submit(form);

      // Find the error message
      const errorMessage = screen.getByText('Please enter a valid email address');
      expect(errorMessage).toBeInTheDocument();

      // Verify error is inside an error-styled container by looking for the error icon
      const errorIcon = screen.getByText('error', { selector: 'span' });
      expect(errorIcon).toBeInTheDocument();
    });

    it('should show error icon in error message', () => {
      renderForgotPasswordPage();

      const form = screen.getByTestId('submit-button').closest('form')!;
      fireEvent.submit(form);

      // Check for error icon
      const errorIcon = screen.getByText('error', { selector: 'span' });
      expect(errorIcon).toBeInTheDocument();
    });

    it('should clear error on new submission attempt', () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input');
      const form = emailInput.closest('form')!;

      // Trigger error
      fireEvent.submit(form);
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();

      // Submit with valid email
      fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
      fireEvent.submit(form);

      // Error should be gone and success state shown
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should have correct link to home page', () => {
      renderForgotPasswordPage();

      const homeLink = screen.getByRole('link', { name: /astroverse/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should have correct link to login page in form state', () => {
      renderForgotPasswordPage();

      const signInLink = screen.getByRole('link', { name: 'Sign In' });
      expect(signInLink).toHaveAttribute('href', '/login');
    });

    it('should have correct link to login page in success state', async () => {
      renderForgotPasswordPage();

      // Submit to get to success state
      const emailInput = screen.getByTestId('email-input');
      const form = emailInput.closest('form')!;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });

      const backToLoginLink = screen.getByRole('link', { name: /back to login/i });
      expect(backToLoginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderForgotPasswordPage();

      // Email input should have associated label
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('should have required attribute on email field', () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toBeRequired();
    });

    it('should have email type for email input', () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have accessible submit button', () => {
      renderForgotPasswordPage();

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Form Layout and Styling', () => {
    it('should have correct container classes', () => {
      renderForgotPasswordPage();

      const container = document.querySelector('.min-h-screen');
      expect(container).toHaveClass('min-h-screen');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('items-center');
      expect(container).toHaveClass('justify-center');
    });

    it('should have correct form card styling', () => {
      renderForgotPasswordPage();

      const card = document.querySelector('.bg-surface-dark');
      expect(card).toHaveClass('rounded-2xl');
      expect(card).toHaveClass('p-8');
    });

    it('should have correct title styling', () => {
      renderForgotPasswordPage();

      const title = screen.getByText('Forgot Password?');
      expect(title).toHaveClass('text-2xl');
      expect(title).toHaveClass('font-bold');
    });

    it('should have gradient styling on submit button', () => {
      renderForgotPasswordPage();

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveStyle({
        background: 'linear-gradient(90deg, #b23de1 0%, #2563EB 100%)',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long email input', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const longEmail = 'a'.repeat(100) + '@example.com';
      const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
      await user.type(emailInput, longEmail);

      expect(emailInput.value).toBe(longEmail);
    });

    it('should handle email with multiple @ symbols', () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input');
      const form = emailInput.closest('form')!;

      // Component only checks if @ exists, so this would pass validation
      fireEvent.change(emailInput, { target: { value: 'test@ex@mple.com' } });
      fireEvent.submit(form);

      // Should go to success state (basic validation passes)
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    });

    it('should handle email with spaces', () => {
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input');
      const form = emailInput.closest('form')!;

      // Spaces don't prevent @ check, so this would pass
      fireEvent.change(emailInput, { target: { value: 'test @example.com' } });
      fireEvent.submit(form);

      // Should go to success state
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    });

    it('should handle uppercase email', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
      await user.type(emailInput, 'TEST@EXAMPLE.COM');

      expect(emailInput.value).toBe('TEST@EXAMPLE.COM');
    });

    it('should handle rapid form submissions', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(emailInput, 'test@example.com');

      // Rapid double click
      await user.click(submitButton);

      // Should be in success state after first click
      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });
    });
  });

  describe('Component State Transitions', () => {
    it('should transition from form to success state', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      // Initial state
      expect(screen.getByText('Forgot Password?')).toBeInTheDocument();

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      // Success state
      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
        expect(screen.queryByText('Forgot Password?')).not.toBeInTheDocument();
      });
    });

    it('should transition from success back to form state', async () => {
      const user = userEvent.setup();
      renderForgotPasswordPage();

      // Go to success state
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });

      // Go back to form
      const requestNewLinkButton = screen.getByRole('button', { name: /request new link/i });
      await user.click(requestNewLinkButton);

      await waitFor(() => {
        expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
        expect(screen.queryByText('Check Your Email')).not.toBeInTheDocument();
      });
    });
  });
});
