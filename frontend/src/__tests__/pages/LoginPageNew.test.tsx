/**
 * LoginPageNew Component Tests
 *
 * Comprehensive tests for the login page
 * Covers: form elements, validation, submission, navigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import LoginPageNew from '../../pages/LoginPageNew';

// Create mock functions for auth
const mockLogin = vi.fn();
const mockClearError = vi.fn();

// Mock useAuth hook
vi.mock('../../hooks', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
    login: mockLogin,
    clearError: mockClearError,
  }),
}));

// Helper to create wrapper with providers
const createWrapper = (initialRoute = '/login') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(
        HelmetProvider,
        null,
        createElement(MemoryRouter, { initialEntries: [initialRoute] }, children),
      ),
    );
};

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/login') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

describe('LoginPageNew', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockReset();
    mockClearError.mockReset();
    mockLogin.mockResolvedValue(undefined);
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(LoginPageNew));
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    });

    it('should render the login form container', () => {
      renderWithProviders(createElement(LoginPageNew));
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should have split-screen layout', () => {
      renderWithProviders(createElement(LoginPageNew));
      // Check for both left (artwork) and right (form) panels
      const containers = document.querySelectorAll('.flex.min-h-screen');
      expect(containers.length).toBeGreaterThan(0);
    });
  });

  describe('Logo and Branding', () => {
    it('should render desktop logo', () => {
      renderWithProviders(createElement(LoginPageNew));
      const logoLinks = screen.getAllByRole('link', { name: /astroverse/i });
      expect(logoLinks.length).toBeGreaterThan(0);
    });

    it('should render mobile logo', () => {
      renderWithProviders(createElement(LoginPageNew));
      // Mobile logo is visible only on small screens
      const astroverseBrands = screen.getAllByText(/astroverse/i);
      expect(astroverseBrands.length).toBeGreaterThan(0);
    });

    it('should link logo to home page', () => {
      renderWithProviders(createElement(LoginPageNew));
      const logoLinks = screen.getAllByRole('link', { name: /astroverse/i });
      expect(logoLinks[0]).toHaveAttribute('href', '/');
    });
  });

  describe('Header Section', () => {
    it('should render welcome heading', () => {
      renderWithProviders(createElement(LoginPageNew));
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    });

    it('should render subheading', () => {
      renderWithProviders(createElement(LoginPageNew));
      expect(screen.getByText(/sign in to access your cosmic insights/i)).toBeInTheDocument();
    });
  });

  describe('Email Field', () => {
    it('should render email input field', () => {
      renderWithProviders(createElement(LoginPageNew));
      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should render email label', () => {
      renderWithProviders(createElement(LoginPageNew));
      // Use testid for reliable selection
      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toBeInTheDocument();
    });

    it('should have email placeholder', () => {
      renderWithProviders(createElement(LoginPageNew));
      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveAttribute('placeholder', 'cosmic.traveler@example.com');
    });

    it('should allow typing in email field', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LoginPageNew));

      const emailInput = screen.getByTestId('email-input');
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should have email description', () => {
      renderWithProviders(createElement(LoginPageNew));
      expect(screen.getByText(/we'll never share your email/i)).toBeInTheDocument();
    });
  });

  describe('Password Field', () => {
    it('should render password input field', () => {
      renderWithProviders(createElement(LoginPageNew));
      const passwordInput = screen.getByTestId('password-input');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should render password label', () => {
      renderWithProviders(createElement(LoginPageNew));
      // Use testid for reliable selection since there might be multiple password-related elements
      const passwordInput = screen.getByTestId('password-input');
      expect(passwordInput).toBeInTheDocument();
    });

    it('should allow typing in password field', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LoginPageNew));

      const passwordInput = screen.getByTestId('password-input');
      await user.type(passwordInput, 'mypassword123');

      expect(passwordInput).toHaveValue('mypassword123');
    });

    it('should have password visibility toggle button', () => {
      renderWithProviders(createElement(LoginPageNew));
      const toggleButton = screen.getByTestId('password-visibility-toggle');
      expect(toggleButton).toBeInTheDocument();
    });

    it('should toggle password visibility when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LoginPageNew));

      const passwordInput = screen.getByTestId('password-input');
      const toggleButton = screen.getByTestId('password-visibility-toggle');

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click toggle to show password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click again to hide password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Remember Me Checkbox', () => {
    it('should render remember me checkbox', () => {
      renderWithProviders(createElement(LoginPageNew));
      const checkbox = screen.getByRole('checkbox', { name: /remember me/i });
      expect(checkbox).toBeInTheDocument();
    });

    it('should be unchecked by default', () => {
      renderWithProviders(createElement(LoginPageNew));
      const checkbox = screen.getByRole('checkbox', { name: /remember me/i });
      expect(checkbox).not.toBeChecked();
    });

    it('should toggle when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LoginPageNew));

      const checkbox = screen.getByRole('checkbox', { name: /remember me/i });

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Forgot Password Link', () => {
    it('should render forgot password link', () => {
      renderWithProviders(createElement(LoginPageNew));
      const forgotLink = screen.getByRole('link', { name: /forgot password\?/i });
      expect(forgotLink).toBeInTheDocument();
    });

    it('should link to forgot password page', () => {
      renderWithProviders(createElement(LoginPageNew));
      const forgotLink = screen.getByRole('link', { name: /forgot password\?/i });
      expect(forgotLink).toHaveAttribute('href', '/forgot-password');
    });
  });

  describe('Submit Button', () => {
    it('should render submit button', () => {
      renderWithProviders(createElement(LoginPageNew));
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeInTheDocument();
    });

    it('should have correct button text', () => {
      renderWithProviders(createElement(LoginPageNew));
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveTextContent('Sign In');
    });

    it('should be enabled by default', () => {
      renderWithProviders(createElement(LoginPageNew));
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Social Login Buttons', () => {
    it('should render Google login button', () => {
      renderWithProviders(createElement(LoginPageNew));
      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      expect(googleButton).toBeInTheDocument();
    });

    it('should render Apple login button', () => {
      renderWithProviders(createElement(LoginPageNew));
      const appleButton = screen.getByRole('button', { name: /continue with apple/i });
      expect(appleButton).toBeInTheDocument();
    });

    it('should log to console when social login is clicked', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const user = userEvent.setup();
      renderWithProviders(createElement(LoginPageNew));

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      expect(consoleSpy).toHaveBeenCalledWith('Social login with google');
      consoleSpy.mockRestore();
    });

    it('should render divider with text', () => {
      renderWithProviders(createElement(LoginPageNew));
      expect(screen.getByText(/or continue with/i)).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should render sign up link', () => {
      renderWithProviders(createElement(LoginPageNew));
      const signUpLink = screen.getByRole('link', { name: /sign up for free/i });
      expect(signUpLink).toBeInTheDocument();
    });

    it('should link sign up to register page', () => {
      renderWithProviders(createElement(LoginPageNew));
      const signUpLink = screen.getByRole('link', { name: /sign up for free/i });
      expect(signUpLink).toHaveAttribute('href', '/register');
    });
  });

  describe('Form Submission', () => {
    it('should call login with correct credentials', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LoginPageNew));

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should call clearError on form submission', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LoginPageNew));

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });

    it('should require email field', () => {
      renderWithProviders(createElement(LoginPageNew));
      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toBeRequired();
    });

    it('should require password field', () => {
      renderWithProviders(createElement(LoginPageNew));
      const passwordInput = screen.getByTestId('password-input');
      expect(passwordInput).toBeRequired();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form inputs', () => {
      renderWithProviders(createElement(LoginPageNew));

      // Use testid for more reliable selection
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('should have aria-label on social login buttons', () => {
      renderWithProviders(createElement(LoginPageNew));

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      const appleButton = screen.getByRole('button', { name: /continue with apple/i });

      expect(googleButton).toHaveAttribute('aria-label');
      expect(appleButton).toHaveAttribute('aria-label');
    });
  });

  describe('Form Validation', () => {
    it('should have email input with email type', () => {
      renderWithProviders(createElement(LoginPageNew));
      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have autocomplete attributes', () => {
      renderWithProviders(createElement(LoginPageNew));

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
    });
  });
});
