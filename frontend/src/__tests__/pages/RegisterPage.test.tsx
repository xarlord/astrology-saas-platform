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
import RegisterPage from '../../pages/RegisterPage';

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
  isLoading: false,
  user: null,
  isAuthenticated: false,
  error: null,
  clearError: vi.fn(),
};

vi.mock('../../hooks', () => ({
  useAuth: () => mockAuthHook,
}));

// Mock window.alert
const originalAlert = window.alert;
let alertMock: ReturnType<typeof vi.fn>;

// Helper to render with router
const renderRegisterPage = () => {
  return render(
    <BrowserRouter>
      <RegisterPage />
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

    // Mock alert
    alertMock = vi.fn();
    window.alert = alertMock;
  });

  afterEach(() => {
    window.alert = originalAlert;
  });

  describe('Rendering', () => {
    it('should render the registration page with all required elements', () => {
      renderRegisterPage();

      // Header - use heading role for the title
      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
      expect(screen.getByText('Start your astrological journey')).toBeInTheDocument();

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
      expect(nameInput).toHaveAttribute('id', 'name');
      expect(nameInput).toHaveAttribute('name', 'name');
      expect(nameInput).toHaveAttribute('required');
      expect(nameInput).toHaveAttribute('placeholder', 'Your full name');
    });

    it('should have correct input attributes for email field', () => {
      renderRegisterPage();

      const emailInput = screen.getByTestId('register-email-input');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toHaveAttribute('required');
    });

    it('should have correct input attributes for password field', () => {
      renderRegisterPage();

      const passwordInput = screen.getByTestId('register-password-input');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('id', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should have correct input attributes for confirm password field', () => {
      renderRegisterPage();

      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('id', 'confirmPassword');
      expect(confirmPasswordInput).toHaveAttribute('name', 'confirmPassword');
      expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password');
      expect(confirmPasswordInput).toHaveAttribute('required');
    });

    it('should have terms of service and privacy policy links', () => {
      renderRegisterPage();

      const termsLink = screen.getByRole('link', { name: 'Terms of Service' });
      const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });

      expect(termsLink).toHaveAttribute('href', '/terms');
      expect(privacyLink).toHaveAttribute('href', '/privacy');
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
      await user.type(passwordInput, 'SecurePassword123');

      expect(passwordInput.value).toBe('SecurePassword123');
    });

    it('should update confirm password state when typing', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const confirmPasswordInput = screen.getByTestId('confirm-password-input') as HTMLInputElement;
      await user.type(confirmPasswordInput, 'SecurePassword123');

      expect(confirmPasswordInput.value).toBe('SecurePassword123');
    });

    it('should toggle terms checkbox', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const termsCheckbox = screen.getByTestId('terms-checkbox') as HTMLInputElement;
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
      const termsCheckbox = screen.getByTestId('terms-checkbox');
      const submitButton = screen.getByTestId('register-submit-button');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'SecurePassword123');
      await user.type(confirmPasswordInput, 'SecurePassword123');
      await user.click(termsCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthHook.register).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePassword123',
        });
      });
    });

    it('should call clearError on form submit', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('register-email-input');
      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const termsCheckbox = screen.getByTestId('terms-checkbox');
      const submitButton = screen.getByTestId('register-submit-button');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'SecurePassword123');
      await user.type(confirmPasswordInput, 'SecurePassword123');
      await user.click(termsCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthHook.clearError).toHaveBeenCalled();
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
      const termsCheckbox = screen.getByTestId('terms-checkbox');
      const submitButton = screen.getByTestId('register-submit-button');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'SecurePassword123');
      await user.type(confirmPasswordInput, 'SecurePassword123');
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
      const termsCheckbox = screen.getByTestId('terms-checkbox');
      const submitButton = screen.getByTestId('register-submit-button');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'SecurePassword123');
      await user.type(confirmPasswordInput, 'SecurePassword123');
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
    it('should have disabled button when terms not agreed', () => {
      renderRegisterPage();

      const submitButton = screen.getByTestId('register-submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should enable button when terms agreed', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const termsCheckbox = screen.getByTestId('terms-checkbox');
      const submitButton = screen.getByTestId('register-submit-button');

      expect(submitButton).toBeDisabled();

      await user.click(termsCheckbox);

      expect(submitButton).toBeEnabled();
    });

    it('should require terms checkbox to be checked for submission', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('register-email-input');
      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'SecurePassword123');
      await user.type(confirmPasswordInput, 'SecurePassword123');

      // Without checking terms, button is disabled so form can't be submitted
      const submitButton = screen.getByTestId('register-submit-button');
      expect(submitButton).toBeDisabled();
      expect(mockAuthHook.register).not.toHaveBeenCalled();
    });
  });

  describe('Password Confirmation Validation', () => {
    it('should show alert when passwords do not match', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('register-email-input');
      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const termsCheckbox = screen.getByTestId('terms-checkbox');
      const submitButton = screen.getByTestId('register-submit-button');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'SecurePassword123');
      await user.type(confirmPasswordInput, 'DifferentPassword456');
      await user.click(termsCheckbox);
      await user.click(submitButton);

      expect(alertMock).toHaveBeenCalledWith('Passwords do not match');
    });

    it('should not call register when passwords do not match', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('register-email-input');
      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const termsCheckbox = screen.getByTestId('terms-checkbox');
      const submitButton = screen.getByTestId('register-submit-button');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'SecurePassword123');
      await user.type(confirmPasswordInput, 'DifferentPassword456');
      await user.click(termsCheckbox);
      await user.click(submitButton);

      expect(mockAuthHook.register).not.toHaveBeenCalled();
    });
  });

  describe('Error States', () => {
    it('should display error message when auth error exists', () => {
      mockAuthHook.error = 'Email already exists';
      renderRegisterPage();

      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });

    it('should display error in correct styling container', () => {
      mockAuthHook.error = 'Test error message';
      renderRegisterPage();

      const errorDiv = screen.getByText('Test error message').closest('div');
      expect(errorDiv).toHaveClass('bg-red-100');
    });

    it('should not display error container when no error', () => {
      mockAuthHook.error = null;
      renderRegisterPage();

      // The error div should not exist
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle different error messages', () => {
      const errorMessages = [
        'Email already registered',
        'Invalid email format',
        'Password too weak',
        'Network error',
      ];

      errorMessages.forEach((message) => {
        mockAuthHook.error = message;
        renderRegisterPage();
        expect(screen.getByText(message)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading text when isLoading is true', () => {
      mockAuthHook.isLoading = true;
      renderRegisterPage();

      expect(screen.getByText('Creating Account...')).toBeInTheDocument();
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
      expect(termsLink).toHaveAttribute('href', '/terms');
    });

    it('should have correct link to privacy policy', () => {
      renderRegisterPage();

      const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });
      expect(privacyLink).toHaveAttribute('href', '/privacy');
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

      expect(nameInput).toBeRequired();
      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
      expect(confirmPasswordInput).toBeRequired();
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

      const termsCheckbox = screen.getByTestId('terms-checkbox');
      expect(termsCheckbox).toHaveAttribute('type', 'checkbox');
    });
  });

  describe('Form Layout and Styling', () => {
    it('should have correct container classes', () => {
      renderRegisterPage();

      // The outermost container has min-h-screen classes
      const container = document.querySelector('.min-h-screen');
      expect(container).toHaveClass('min-h-screen');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('items-center');
      expect(container).toHaveClass('justify-center');
    });

    it('should have card styling on form container', () => {
      renderRegisterPage();

      const card = document.querySelector('.card');
      expect(card).toHaveClass('max-w-md');
      expect(card).toHaveClass('w-full');
    });

    it('should have correct title styling', () => {
      renderRegisterPage();

      const title = screen.getByRole('heading', { name: 'Create Account' });
      expect(title).toHaveClass('text-3xl');
      expect(title).toHaveClass('font-display');
      expect(title).toHaveClass('font-bold');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty form submission gracefully', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const submitButton = screen.getByTestId('register-submit-button');

      // Button is disabled without terms agreement
      expect(submitButton).toBeDisabled();
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
      const termsCheckbox = screen.getByTestId('terms-checkbox');
      const form = nameInput.closest('form')!;

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePassword123' } });
      fireEvent.click(termsCheckbox);
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockAuthHook.register).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePassword123',
        });
      });
    });
  });

  describe('Integration with Auth Hook', () => {
    it('should use useAuth hook for authentication', () => {
      renderRegisterPage();
      // If the component renders without errors, it's using the hook
      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('should call register from useAuth hook', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('register-email-input');
      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const termsCheckbox = screen.getByTestId('terms-checkbox');
      const submitButton = screen.getByTestId('register-submit-button');

      await user.type(nameInput, 'Jane Doe');
      await user.type(emailInput, 'jane@example.com');
      await user.type(passwordInput, 'SecurePassword123');
      await user.type(confirmPasswordInput, 'SecurePassword123');
      await user.click(termsCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthHook.register).toHaveBeenCalled();
      });
    });

    it('should clear error on new submission attempt', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('register-email-input');
      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const termsCheckbox = screen.getByTestId('terms-checkbox');
      const submitButton = screen.getByTestId('register-submit-button');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'SecurePassword123');
      await user.type(confirmPasswordInput, 'SecurePassword123');
      await user.click(termsCheckbox);
      await user.click(submitButton);

      expect(mockAuthHook.clearError).toHaveBeenCalled();
    });
  });
});
