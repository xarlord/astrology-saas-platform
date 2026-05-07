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
  });

  describe('Rendering', () => {
    it('should render the registration page with all required elements', () => {
      renderRegisterPage();

      // Header - use heading role for the title
      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
      expect(screen.getByText('Start your astrological journey today')).toBeInTheDocument();

      // Form fields
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

      // Terms checkbox
      expect(screen.getByLabelText(/terms of service/i)).toBeInTheDocument();

      // Submit button
      expect(screen.getByTestId('register-submit')).toBeInTheDocument();

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
      expect(nameInput).toHaveAttribute('aria-required', 'true');
      expect(nameInput).toHaveAttribute('placeholder', 'Your full name');
    });

    it('should have correct input attributes for email field', () => {
      renderRegisterPage();

      const emailInput = screen.getByTestId('register-email-input');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toHaveAttribute('aria-required', 'true');
    });

    it('should have correct input attributes for password field', () => {
      renderRegisterPage();

      const passwordInput = screen.getByTestId('register-password-input');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('id', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');
      expect(passwordInput).toHaveAttribute('aria-required', 'true');
    });

    it('should have correct input attributes for confirm password field', () => {
      renderRegisterPage();

      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('id', 'confirmPassword');
      expect(confirmPasswordInput).toHaveAttribute('name', 'confirmPassword');
      expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password');
      expect(confirmPasswordInput).toHaveAttribute('aria-required', 'true');
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
      const submitButton = screen.getByTestId('register-submit');

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
      const submitButton = screen.getByTestId('register-submit');

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
      const submitButton = screen.getByTestId('register-submit');

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
      const submitButton = screen.getByTestId('register-submit');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'SecurePassword123!');
      await user.type(confirmPasswordInput, 'DifferentPassword456!');
      await user.click(termsCheckbox);
      await user.click(submitButton);

      // The form's validate() should show "Passwords do not match"
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
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
      const submitButton = screen.getByTestId('register-submit');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'SecurePassword123!');
      await user.type(confirmPasswordInput, 'DifferentPassword456!');
      await user.click(termsCheckbox);
      await user.click(submitButton);

      expect(mockAuthHook.register).not.toHaveBeenCalled();
    });
  });

  describe('Error States', () => {
    it('should display validation error when submitting empty form', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      // Must check the terms checkbox (HTML required) so the form submit actually fires
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByTestId('register-submit');

      await user.click(termsCheckbox);
      await user.click(submitButton);

      // Form validation shows errors for required fields
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('should not display error container when no validation errors', () => {
      renderRegisterPage();

      // The error message should not exist
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('should display error for short name', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByTestId('register-submit');

      await user.type(nameInput, 'J');
      await user.click(termsCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    it('should display error for invalid email', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const emailInput = screen.getByTestId('register-email-input');
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByTestId('register-submit');

      await user.type(emailInput, 'invalid-email');
      await user.click(termsCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading text when isLoading is true', () => {
      mockAuthHook.isLoading = true;
      renderRegisterPage();

      expect(screen.getByText('Creating account...')).toBeInTheDocument();
    });

    it('should show normal text when isLoading is false', () => {
      mockAuthHook.isLoading = false;
      renderRegisterPage();

      // Button text when not loading
      const submitButton = screen.getByTestId('register-submit');
      expect(submitButton).toHaveTextContent('Create Account');
    });

    it('should disable submit button when loading', () => {
      mockAuthHook.isLoading = true;
      renderRegisterPage();

      const submitButton = screen.getByTestId('register-submit');
      expect(submitButton).toBeDisabled();
    });

    it('should have disabled styling when button is disabled', () => {
      mockAuthHook.isLoading = true;
      renderRegisterPage();

      const submitButton = screen.getByTestId('register-submit');
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

    it('should have aria-required attribute on required fields', () => {
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('register-email-input');
      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');

      expect(nameInput).toHaveAttribute('aria-required', 'true');
      expect(emailInput).toHaveAttribute('aria-required', 'true');
      expect(passwordInput).toHaveAttribute('aria-required', 'true');
      expect(confirmPasswordInput).toHaveAttribute('aria-required', 'true');
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

      // Use the heading specifically to avoid matching the button text
      const heading = screen.getByRole('heading', { name: 'Create Account' });
      const card = heading.closest('div.glass-panel');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-2xl');
    });

    it('should have correct title styling', () => {
      renderRegisterPage();

      const title = screen.getByRole('heading', { name: 'Create Account' });
      expect(title).toHaveClass('text-3xl');
      expect(title).toHaveClass('font-bold');
      expect(title).toHaveClass('text-white');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty form submission gracefully', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      // Must check the terms checkbox (HTML required) so the form submit actually fires
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByTestId('register-submit');

      await user.click(termsCheckbox);
      await user.click(submitButton);

      // Validation errors should appear
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
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
      const form = nameInput.closest('form')!;

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePassword123!' } });
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
      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('should call register from useAuth hook', async () => {
      const user = userEvent.setup();
      renderRegisterPage();

      const nameInput = screen.getByTestId('name-input');
      const emailInput = screen.getByTestId('register-email-input');
      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByTestId('register-submit');

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
