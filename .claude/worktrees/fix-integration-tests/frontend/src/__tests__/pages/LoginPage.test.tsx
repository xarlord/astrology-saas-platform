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
 * LoginPage Component Tests
 *
 * Tests for the Login page component covering:
 * - Component rendering
 * - Form validation
 * - Form submission
 * - Error states
 * - Loading states
 * - Navigation
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';

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
  login: vi.fn(),
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
const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    mockAuthHook.login.mockReset();
    mockAuthHook.clearError.mockReset();
    mockNavigate.mockReset();

    // Set default behavior
    mockAuthHook.login.mockResolvedValue(true);
    mockAuthHook.isLoading = false;
    mockAuthHook.error = null;
  });

  describe('Rendering', () => {
    it('should render the login page with all required elements', () => {
      renderLoginPage();

      // Header
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to access your charts')).toBeInTheDocument();

      // Form fields
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

      // Remember me checkbox
      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();

      // Forgot password link
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();

      // Submit button
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

      // Sign up link
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });

    it('should have correct input attributes for email field', () => {
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');
    });

    it('should have correct input attributes for password field', () => {
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/^password$/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('id', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should have correct link to forgot password page', () => {
      renderLoginPage();

      const forgotLink = screen.getByText(/forgot password/i);
      expect(forgotLink).toHaveAttribute('href', '/forgot-password');
    });

    it('should have correct link to register page', () => {
      renderLoginPage();

      const signUpLink = screen.getByText('Sign up').closest('a');
      expect(signUpLink).toHaveAttribute('href', '/register');
    });
  });

  describe('Form Input Handling', () => {
    it('should update email state when typing', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password state when typing', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      await user.type(passwordInput, 'mypassword123');

      expect(passwordInput.value).toBe('mypassword123');
    });

    it('should toggle remember me checkbox', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const rememberCheckbox = screen.getByLabelText(/remember me/i) as HTMLInputElement;
      expect(rememberCheckbox.checked).toBe(false);

      await user.click(rememberCheckbox);
      expect(rememberCheckbox.checked).toBe(true);

      await user.click(rememberCheckbox);
      expect(rememberCheckbox.checked).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should call login with correct credentials on submit', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthHook.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should call clearError on form submit', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthHook.clearError).toHaveBeenCalled();
      });
    });

    it('should navigate to dashboard on successful login', async () => {
      const user = userEvent.setup();
      mockAuthHook.login.mockResolvedValue(true);
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should not navigate on login failure', async () => {
      const user = userEvent.setup();
      mockAuthHook.login.mockRejectedValue(new Error('Invalid credentials'));
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthHook.login).toHaveBeenCalled();
      });

      // Navigate should not be called on failure
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle form submission with fireEvent', async () => {
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const form = emailInput.closest('form')!;

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockAuthHook.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });
  });

  describe('Error States', () => {
    it('should display error message when auth error exists', () => {
      mockAuthHook.error = 'Invalid email or password';
      renderLoginPage();

      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });

    it('should display error in correct styling container', () => {
      mockAuthHook.error = 'Test error message';
      renderLoginPage();

      const errorDiv = screen.getByText('Test error message').closest('div');
      expect(errorDiv).toHaveClass('bg-red-100');
    });

    it('should not display error container when no error', () => {
      mockAuthHook.error = null;
      renderLoginPage();

      // The error div should not exist
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should handle different error messages', () => {
      const errorMessages = [
        'Invalid credentials',
        'Account locked',
        'Too many attempts',
        'Network error',
      ];

      errorMessages.forEach((message) => {
        mockAuthHook.error = message;
        renderLoginPage();
        expect(screen.getByText(message)).toBeInTheDocument();
        // Cleanup is handled by afterEach in setup
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading text when isLoading is true', () => {
      mockAuthHook.isLoading = true;
      renderLoginPage();

      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });

    it('should show normal text when isLoading is false', () => {
      mockAuthHook.isLoading = false;
      renderLoginPage();

      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('should disable submit button when loading', () => {
      mockAuthHook.isLoading = true;
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /signing in/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when not loading', () => {
      mockAuthHook.isLoading = false;
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeEnabled();
    });

    it('should have disabled styling when button is disabled', () => {
      mockAuthHook.isLoading = true;
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /signing in/i });
      expect(submitButton).toHaveClass('disabled:opacity-50');
      expect(submitButton).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('Navigation Links', () => {
    it('should have correct link to forgot password', () => {
      renderLoginPage();

      const forgotLink = screen.getByRole('link', { name: /forgot password/i });
      expect(forgotLink).toHaveAttribute('href', '/forgot-password');
    });

    it('should have correct link to register page', () => {
      renderLoginPage();

      const signUpLink = screen.getByRole('link', { name: 'Sign up' });
      expect(signUpLink).toHaveAttribute('href', '/register');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderLoginPage();

      // All inputs should have associated labels
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    });

    it('should have required attribute on required fields', () => {
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    it('should have email type for email input', () => {
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have password type for password input', () => {
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/^password$/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Layout and Styling', () => {
    it('should have correct container classes', () => {
      renderLoginPage();

      // The outermost container has min-h-screen classes
      const container = document.querySelector('.min-h-screen');
      expect(container).toHaveClass('min-h-screen');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('items-center');
      expect(container).toHaveClass('justify-center');
    });

    it('should have card styling on form container', () => {
      renderLoginPage();

      const card = screen.getByText('Welcome Back').closest('div')?.parentElement;
      expect(card).toHaveClass('max-w-md');
      expect(card).toHaveClass('w-full');
      expect(card).toHaveClass('card');
    });

    it('should have correct title styling', () => {
      renderLoginPage();

      const title = screen.getByText('Welcome Back');
      expect(title).toHaveClass('text-3xl');
      expect(title).toHaveClass('font-display');
      expect(title).toHaveClass('font-bold');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty form submission gracefully', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Form has required fields, so submission should be blocked by browser
      // The login function should not be called
      expect(mockAuthHook.login).not.toHaveBeenCalled();
    });

    it('should handle special characters in email', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      await user.type(emailInput, 'test+special@example.com');

      expect(emailInput.value).toBe('test+special@example.com');
    });

    it('should handle special characters in password', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      await user.type(passwordInput, 'P@$$w0rd!#$%');

      expect(passwordInput.value).toBe('P@$$w0rd!#$%');
    });

    it('should handle very long email input', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const longEmail = 'a'.repeat(100) + '@example.com';
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      await user.type(emailInput, longEmail);

      expect(emailInput.value).toBe(longEmail);
    });

    it('should handle very long password input', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const longPassword = 'a'.repeat(100);
      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      await user.type(passwordInput, longPassword);

      expect(passwordInput.value).toBe(longPassword);
    });
  });

  describe('Integration with Auth Hook', () => {
    it('should use useAuth hook for authentication', () => {
      renderLoginPage();
      // If the component renders without errors, it's using the hook
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('should call login from useAuth hook', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'user@test.com');
      await user.type(passwordInput, 'securePassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAuthHook.login).toHaveBeenCalled();
      });
    });

    it('should clear error on new submission attempt', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(mockAuthHook.clearError).toHaveBeenCalled();
    });
  });
});
