/**
 * RegisterPageNew Component Tests
 *
 * Comprehensive tests for the registration page
 * Covers: form elements, validation, password strength, submission
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegisterPageNew from '../../pages/RegisterPageNew';

// Create mock functions for auth
const mockRegister = vi.fn();
const mockClearError = vi.fn();

// Mock useAuth hook
vi.mock('../../hooks', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
    register: mockRegister,
    clearError: mockClearError,
  }),
}));

// Helper to create wrapper with providers
const createWrapper = (initialRoute = '/register') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, { initialEntries: [initialRoute] }, children),
    );
};

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/register') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

describe('RegisterPageNew', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegister.mockReset();
    mockClearError.mockReset();
    mockRegister.mockResolvedValue(undefined);
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(RegisterPageNew));
      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    });

    it('should have split-screen layout', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const containers = document.querySelectorAll('.flex.min-h-screen');
      expect(containers.length).toBeGreaterThan(0);
    });
  });

  describe('Logo and Branding', () => {
    it('should render the logo', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const logoLinks = screen.getAllByRole('link', { name: /astroverse/i });
      expect(logoLinks.length).toBeGreaterThan(0);
    });

    it('should link logo to home page', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const logoLink = screen.getByRole('link', { name: /astroverse home/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });
  });

  describe('Header Section', () => {
    it('should render form heading', () => {
      renderWithProviders(createElement(RegisterPageNew));
      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    });

    it('should render subheading', () => {
      renderWithProviders(createElement(RegisterPageNew));
      expect(screen.getByText(/start your cosmic journey for free/i)).toBeInTheDocument();
    });

    it('should render step indicator', () => {
      renderWithProviders(createElement(RegisterPageNew));
      expect(screen.getByText(/step 1 of 2/i)).toBeInTheDocument();
    });
  });

  describe('Name Field', () => {
    it('should render name input field', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const nameInput = screen.getByTestId('name-input');
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveAttribute('type', 'text');
    });

    it('should render name label', () => {
      renderWithProviders(createElement(RegisterPageNew));
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    it('should allow typing in name field', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(RegisterPageNew));

      const nameInput = screen.getByTestId('name-input');
      await user.type(nameInput, 'John Doe');

      expect(nameInput).toHaveValue('John Doe');
    });

    it('should be required', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const nameInput = screen.getByTestId('name-input');
      expect(nameInput).toBeRequired();
    });
  });

  describe('Email Field', () => {
    it('should render email input field', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const emailInput = screen.getByTestId('register-email-input');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should render email label', () => {
      renderWithProviders(createElement(RegisterPageNew));
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('should allow typing in email field', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(RegisterPageNew));

      const emailInput = screen.getByTestId('register-email-input');
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should be required', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const emailInput = screen.getByTestId('register-email-input');
      expect(emailInput).toBeRequired();
    });
  });

  describe('Password Field', () => {
    it('should render password input field', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const passwordInput = screen.getByTestId('register-password-input');
      expect(passwordInput).toBeInTheDocument();
    });

    it('should be required', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const passwordInput = screen.getByTestId('register-password-input');
      expect(passwordInput).toBeRequired();
    });

    it('should have password visibility toggle', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const toggleButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('aria-label')?.includes('Show password'));
      expect(toggleButtons.length).toBeGreaterThan(0);
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(RegisterPageNew));

      const passwordInput = screen.getByTestId('register-password-input');
      const toggleButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('aria-label')?.includes('password'));
      const passwordToggle = toggleButtons[0];

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click toggle to show password
      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Password Strength Meter', () => {
    it('should not show strength meter when password is empty', () => {
      renderWithProviders(createElement(RegisterPageNew));
      expect(screen.queryByText(/password strength/i)).not.toBeInTheDocument();
    });

    it('should show "Weak" for short passwords', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(RegisterPageNew));

      const passwordInput = screen.getByTestId('register-password-input');
      await user.type(passwordInput, 'abc');

      expect(screen.getByText(/weak/i)).toBeInTheDocument();
    });

    it('should show strength for longer passwords', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(RegisterPageNew));

      const passwordInput = screen.getByTestId('register-password-input');
      await user.type(passwordInput, 'VeryStrongPassword123!@#');

      expect(screen.getByText(/very strong/i)).toBeInTheDocument();
    });

    it('should show 4 strength indicator bars', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(RegisterPageNew));

      const passwordInput = screen.getByTestId('register-password-input');
      await user.type(passwordInput, 'test');

      // Should have 4 bars for strength indicator
      const bars = document.querySelectorAll('.h-1.flex-1.rounded-full');
      expect(bars.length).toBe(4);
    });
  });

  describe('Confirm Password Field', () => {
    it('should render confirm password input field', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    it('should render confirm password label', () => {
      renderWithProviders(createElement(RegisterPageNew));
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('should be required', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      expect(confirmPasswordInput).toBeRequired();
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(RegisterPageNew));

      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');

      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'different456');

      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it('should not show error when passwords match', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(RegisterPageNew));

      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');

      await user.type(passwordInput, 'Password123!');
      await user.type(confirmPasswordInput, 'Password123!');

      expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
    });
  });

  describe('Terms Checkbox', () => {
    it('should render terms checkbox', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const checkbox = screen.getByTestId('terms-checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should be unchecked by default', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const checkbox = screen.getByTestId('terms-checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should toggle when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(RegisterPageNew));

      const checkbox = screen.getByTestId('terms-checkbox');

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should render terms and privacy links', () => {
      renderWithProviders(createElement(RegisterPageNew));
      expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
    });
  });

  describe('Submit Button', () => {
    it('should render submit button', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const submitButton = screen.getByTestId('register-submit-button');
      expect(submitButton).toBeInTheDocument();
    });

    it('should be disabled when terms not agreed', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const submitButton = screen.getByTestId('register-submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should be disabled when passwords do not match', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(RegisterPageNew));

      const passwordInput = screen.getByTestId('register-password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const checkbox = screen.getByTestId('terms-checkbox');

      await user.type(passwordInput, 'Password123!');
      await user.type(confirmPasswordInput, 'different');
      await user.click(checkbox);

      const submitButton = screen.getByTestId('register-submit-button');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Social Login Buttons', () => {
    it('should render Google login button', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      expect(googleButton).toBeInTheDocument();
    });

    it('should render Apple login button', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const appleButton = screen.getByRole('button', { name: /continue with apple/i });
      expect(appleButton).toBeInTheDocument();
    });

    it('should handle social login button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(RegisterPageNew));

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      // Button click is handled without errors
      expect(googleButton).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should render sign in link', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const signInLinks = screen
        .getAllByRole('link')
        .filter((link) => /sign in/i.test(link.textContent || ''));
      expect(signInLinks.length).toBeGreaterThan(0);
    });

    it('should link sign in to login page', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const signInLinks = screen
        .getAllByRole('link')
        .filter((link) => link.getAttribute('href') === '/login');
      expect(signInLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Feature Cards', () => {
    it('should render feature cards in left panel', () => {
      renderWithProviders(createElement(RegisterPageNew));
      expect(screen.getByText(/accurate natal chart calculations/i)).toBeInTheDocument();
      expect(screen.getByText(/daily planetary transits/i)).toBeInTheDocument();
      expect(screen.getByText(/relationship synastry reports/i)).toBeInTheDocument();
    });
  });

  describe('Quote Footer', () => {
    it('should render inspirational quote', () => {
      renderWithProviders(createElement(RegisterPageNew));
      expect(screen.getByText(/the universe is not outside of you/i)).toBeInTheDocument();
    });

    it('should render quote author', () => {
      renderWithProviders(createElement(RegisterPageNew));
      expect(screen.getByText(/rumi/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form inputs', () => {
      renderWithProviders(createElement(RegisterPageNew));

      // Use testid for more reliable selection
      expect(screen.getByTestId('name-input')).toBeInTheDocument();
      expect(screen.getByTestId('register-email-input')).toBeInTheDocument();
    });

    it('should have aria-label on social login buttons', () => {
      renderWithProviders(createElement(RegisterPageNew));

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      const appleButton = screen.getByRole('button', { name: /continue with apple/i });

      expect(googleButton).toHaveAttribute('aria-label');
      expect(appleButton).toHaveAttribute('aria-label');
    });

    it('should have aria-label on logo link', () => {
      renderWithProviders(createElement(RegisterPageNew));
      const logoLink = screen.getByRole('link', { name: /astroverse home/i });
      expect(logoLink).toHaveAttribute('aria-label', 'AstroVerse home');
    });
  });

  describe('CSS Animations', () => {
    it('should have keyframe animations defined', () => {
      renderWithProviders(createElement(RegisterPageNew));

      const styleElement = document.querySelector('style');
      expect(styleElement).toBeInTheDocument();
      expect(styleElement?.textContent).toContain('@keyframes shine');
    });
  });
});
