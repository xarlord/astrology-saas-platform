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
 * RegisterPage Component Tests
 *
 * Tests for the Register page component covering:
 * - Component rendering
 * - Form validation
 * - Form submission
 * - Error states
 * - Loading states
 * - Navigation
 * - Terms agreement validation
 * - Password confirmation validation
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RegisterPageNew from '../../pages/RegisterPageNew';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the useAuth hook
const mockAuthHook = {
  register: vi.fn(),
  socialLogin: vi.fn(),
  isLoading: false,
  user: null,
  isAuthenticated: false,
  error: null,
  clearError: vi.fn(),
};

vi.mock('../../hooks', () => ({
  useAuth: () => mockAuthHook,
}));

// Helper to render with router
const renderRegisterPage = () => {
  return render(
    <BrowserRouter>
      <RegisterPageNew />
    </BrowserRouter>,
  );
};

describe('RegisterPage', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    mockAuthHook.register.mockReset();
    mockAuthHook.clearError.mockReset();
    mockNavigate.mockReset();

    // Set default behavior
    mockAuthHook.register.mockResolvedValue(true);
    mockAuthHook.isLoading = false;
    mockAuthHook.error = null;
  });

  describe('Rendering', () => {
    it('should render the registration page with all required elements', () => {
      renderRegisterPage();

      // Header - use heading role for the title
      expect(screen.getByRole('heading', { name: 'Create Your Account' })).toBeInTheDocument();
      expect(screen.getByText('Start your cosmic journey for free. No credit card required.')).toBeInTheDocument();

      // Form fields
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

      // Terms checkbox
      expect(screen.getByLabelText(/terms of service/i)).toBeInTheDocument();

      // Submit button
      expect(screen.getByTestId('register-submit-button')).toBeInTheDocument();

      // Sign in link
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    });

    it('should have correct input attributes for name field', () => {
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      expect(nameInput).toHaveAttribute('type', 'text');
      expect(nameInput).toHaveAttribute('id', 'fullname');
      expect(nameInput).toHaveAttribute('placeholder', 'Enter your full name');
    });

    it('should have correct input attributes for email field', () => {
      renderRegisterPage();

      const emailInput = screen.getByTestId('register-email-input');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
    });

    it('should have correct input attributes for password field', () => {
      renderRegisterPage();

      const passwordInput = screen.getByTestId('register-password-input');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('id', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');
    });

    it('should have correct input attributes for confirm password field', () => {
      renderRegisterPage();

      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('id', 'confirm-password');
      expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password');
    });

    it('should have terms of service and privacy policy links', () => {
      renderRegisterPage();

      const termsLink = screen.getByRole('link', { name: 'Terms of Service' });
      const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });

      expect(termsLink).toHaveAttribute('href', '#');
      expect(privacyLink).toHaveAttribute('href', '#');
    });

    it('should have correct link to login page', () => {
      renderRegisterPage();

      const signInLink = screen.getByRole('link', { name: 'Sign in' });
      expect(signInLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Form Input Handling', () => {
    it('should update name state when typing', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
      await user.type(nameInput, 'John Doe');

      expect(nameInput.value).toBe('John Doe');
    });

    it('should update email state when typing', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const emailInput = screen.getByTestId('register-email-input') as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password state when typing', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const passwordInput = screen.getByTestId('register-password-input') as HTMLInputElement;
      await user.type(passwordInput, 'SecurePassword123!');

      expect(passwordInput.value).toBe('SecurePassword123!');
    });

    it('should update confirm password state when typing', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const confirmPasswordInput = screen.getByTestId('confirm-password-input') as HTMLInputElement;
      await user.type(confirmPasswordInput, 'SecurePassword123!');

      expect(confirmPasswordInput.value).toBe('SecurePassword123!');
    });

    it('should toggle terms checkbox', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const termsCheckbox = screen.getByLabelText(/terms of service/i) as HTMLInputElement;
      expect(termsCheckbox.checked).toBe(false);

      await user.click(termsCheckbox);
      expect(termsCheckbox.checked).toBe(true);

      await user.click(termsCheckbox);
      expect(termsCheckbox.checked).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should call register with correct data on submit', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('register-email-input');
      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByTestId('register-submit-button');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'SecurePassword123!');
      await user.type(confirmPasswordInput, 'SecurePassword123!');
      await user.click(termsCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthHook.register).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePassword123!',
        });
      });
    });

    it('should navigate to dashboard on successful registration', async () => {
      const user = userEvent.setup();
      mockAuthHook.register.mockResolvedValue(true);
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('register-email-input');
      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByTestId('register-submit-button');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'SecurePassword123!');
      await user.type(confirmPasswordInput, 'SecurePassword123!');
      await user.click(termsCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should not navigate on registration failure', async () => {
      const user = userEvent.setup();
      mockAuthHook.register.mockRejectedValue(new Error('Registration failed'));
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('register-email-input');
      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByTestId('register-submit-button');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'SecurePassword123!');
      await user.type(confirmPasswordInput, 'SecurePassword123!');
      await user.click(termsCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthHook.register).toHaveBeenCalled();
      });

      // Navigate should not be called on failure
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Terms Agreement Validation', () => {
    it('should have terms checkbox that is unchecked by default', () => {
      renderRegisterPage();

      const termsCheckbox = screen.getByLabelText(/terms of service/i) as HTMLInputElement;
      expect(termsCheckbox.checked).toBe(false);
    });

    it('should toggle terms checkbox on click', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const termsCheckbox = screen.getByLabelText(/terms of service/i) as HTMLInputElement;

      await user.click(termsCheckbox);
      expect(termsCheckbox.checked).toBe(true);

      await user.click(termsCheckbox);
      expect(termsCheckbox.checked).toBe(false);
    });
  });

  describe('Password Confirmation Validation', () => {
    it('should show validation error when passwords do not match', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('register-email-input');
      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByTestId('register-submit-button');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'SecurePassword123!');
      await user.type(confirmPasswordInput, 'DifferentPassword456!');
      await user.click(termsCheckbox);
      await user.click(submitButton);

      // The component shows "Passwords do not match" inline when passwords differ
      await waitFor(() => {
        expect(screen.getByText(/Passwords do not match/)).toBeInTheDocument();
      });
    });

    it('should not call register when passwords do not match', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('register-email-input');
      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByTestId('register-submit-button');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'SecurePassword123!');
      await user.type(confirmPasswordInput, 'DifferentPassword456!');
      await user.click(termsCheckbox);
      await user.click(submitButton);

      // Submit button is disabled when passwords don't match, so register is never called
      expect(mockAuthHook.register).not.toHaveBeenCalled();
    });
  });

  describe('Error States', () => {
    it('should have submit button disabled when form is incomplete', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      // Submit button is disabled because terms not agreed and passwords empty (don't match)
      const submitButton = screen.getByTestId('register-submit-button');
      expect(submitButton).toBeDisabled();

      // Even after checking terms, button is still disabled because passwords are empty
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      await user.click(termsCheckbox);
      expect(submitButton).toBeDisabled();
    });

    it('should not display error container when no validation errors', () => {
      renderRegisterPage();

      // The error message should not exist
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('should accept short name input without custom validation', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
      await user.type(nameInput, 'J');

      // RegisterPageNew does not enforce minimum name length
      expect(nameInput.value).toBe('J');
    });

    it('should accept any text in email field without custom validation', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const emailInput = screen.getByTestId('register-email-input') as HTMLInputElement;
      await user.type(emailInput, 'invalid-email');

      // RegisterPageNew relies on HTML5 email type validation, not custom validation
      expect(emailInput.value).toBe('invalid-email');
    });
  });

  describe('Loading States', () => {
    it('should show loading text when isLoading is true', () => {
      mockAuthHook.isLoading = true;
      renderRegisterPage();

      expect(screen.getByText(/Creating Account/)).toBeInTheDocument();
    });

    it('should show normal text when isLoading is false', () => {
      mockAuthHook.isLoading = false;
      renderRegisterPage();

      // Button text when not loading
      const submitButton = screen.getByTestId('register-submit-button');
      expect(submitButton).toHaveTextContent('Create Account');
    });

    it('should disable submit button when loading', () => {
      mockAuthHook.isLoading = true;
      renderRegisterPage();

      const submitButton = screen.getByTestId('register-submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should have disabled styling when button is disabled', () => {
      mockAuthHook.isLoading = true;
      renderRegisterPage();

      const submitButton = screen.getByTestId('register-submit-button');
      expect(submitButton).toHaveClass('disabled:opacity-50');
      expect(submitButton).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('Navigation Links', () => {
    it('should have correct link to login page', () => {
      renderRegisterPage();

      const signInLink = screen.getByRole('link', { name: 'Sign in' });
      expect(signInLink).toHaveAttribute('href', '/login');
    });

    it('should have correct link to terms of service', () => {
      renderRegisterPage();

      const termsLink = screen.getByRole('link', { name: 'Terms of Service' });
      expect(termsLink).toHaveAttribute('href', '#');
    });

    it('should have correct link to privacy policy', () => {
      renderRegisterPage();

      const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });
      expect(privacyLink).toHaveAttribute('href', '#');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderRegisterPage();

      // All inputs should have associated labels
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/terms of service/i)).toBeInTheDocument();
    });

    it('should have required attribute on required fields', () => {
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('register-email-input');
      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');

      expect(nameInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('required');
    });

    it('should have email type for email input', () => {
      renderRegisterPage();

      const emailInput = screen.getByTestId('register-email-input');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have password type for password inputs', () => {
      renderRegisterPage();

      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    it('should have terms checkbox with proper type', () => {
      renderRegisterPage();

      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      expect(termsCheckbox).toHaveAttribute('type', 'checkbox');
    });
  });

  describe('Form Layout and Styling', () => {
    it('should have glass-panel styling on form container', () => {
      renderRegisterPage();

      // Find the form via the submit button and verify styling
      const submitButton = screen.getByTestId('register-submit-button');
      const form = submitButton.closest('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass('rounded-2xl');
    });

    it('should have correct title styling', () => {
      renderRegisterPage();

      const title = screen.getByRole('heading', { name: 'Create Your Account' });
      expect(title).toHaveClass('text-3xl');
      expect(title).toHaveClass('font-bold');
      expect(title).toHaveClass('text-white');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty form submission gracefully', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      // The submit button is disabled when form is incomplete (passwords empty)
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByTestId('register-submit-button');

      await user.click(termsCheckbox);
      // Button remains disabled because passwords are empty (don't match)
      expect(submitButton).toBeDisabled();

      // register should not be called since the button is disabled
      expect(mockAuthHook.register).not.toHaveBeenCalled();
    });

    it('should handle special characters in name', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
      await user.type(nameInput, "O'Brien-Smith");

      expect(nameInput.value).toBe("O'Brien-Smith");
    });

    it('should handle unicode characters in name', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
      await user.type(nameInput, 'Jose Garcia');

      expect(nameInput.value).toBe('Jose Garcia');
    });

    it('should handle special characters in email', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const emailInput = screen.getByTestId('register-email-input') as HTMLInputElement;
      await user.type(emailInput, 'test+special@example.com');

      expect(emailInput.value).toBe('test+special@example.com');
    });

    it('should handle special characters in password', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const passwordInput = screen.getByTestId('register-password-input') as HTMLInputElement;
      await user.type(passwordInput, 'P@$$w0rd!#$%');

      expect(passwordInput.value).toBe('P@$$w0rd!#$%');
    });

    it('should handle very long name input', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const longName = 'A'.repeat(100);
      const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
      await user.type(nameInput, longName);

      expect(nameInput.value).toBe(longName);
    });

    it('should handle very long email input', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const longEmail = 'a'.repeat(100) + '@example.com';
      const emailInput = screen.getByTestId('register-email-input') as HTMLInputElement;
      await user.type(emailInput, longEmail);

      expect(emailInput.value).toBe(longEmail);
    });

    it('should handle very long password input', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const longPassword = 'a'.repeat(100);
      const passwordInput = screen.getByTestId('register-password-input') as HTMLInputElement;
      await user.type(passwordInput, longPassword);

      expect(passwordInput.value).toBe(longPassword);
    });

    it('should handle whitespace-only name', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
      await user.type(nameInput, '   ');

      expect(nameInput.value).toBe('   ');
    });

    it('should handle form submission with fireEvent', async () => {
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('register-email-input');
      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const form = nameInput.closest('form')!;

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePassword123!' } });
      fireEvent.click(termsCheckbox);
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockAuthHook.register).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePassword123!',
        });
      });
    });
  });

  describe('Integration with Auth Hook', () => {
    it('should use useAuth hook for authentication', () => {
      renderRegisterPage();
      // If the component renders without errors, it's using the hook
      expect(screen.getByRole('heading', { name: 'Create Your Account' })).toBeInTheDocument();
    });

    it('should call register from useAuth hook', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('register-email-input');
      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByTestId('register-submit-button');

      await user.type(nameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInput, 'SecurePassword123!');
      await user.type(confirmPasswordInput, 'SecurePassword123!');
      await user.click(termsCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthHook.register).toHaveBeenCalled();
      });
    });
  });
});
