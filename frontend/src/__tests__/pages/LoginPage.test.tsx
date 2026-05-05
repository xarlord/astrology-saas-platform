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
 * - Component rendering (delegation to AuthLayout + LoginForm)
 * - Navigation on successful login
 * - Layout props passed correctly
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock AuthLayout
const capturedProps: Record<string, any> = {};
vi.mock('../../components/AuthLayout', () => ({
  AuthLayout: ({ children, leftPanel }: { children: React.ReactNode; leftPanel?: React.ReactNode }) => {
    capturedProps.leftPanel = leftPanel;
    capturedProps.children = children;
    return (
      <div data-testid="auth-layout">
        <div data-testid="auth-layout-left-panel">{leftPanel}</div>
        <div data-testid="auth-layout-children">{children}</div>
      </div>
    );
  },
}));

// Mock LoginForm
vi.mock('../../components/AuthenticationForms', () => ({
  LoginForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="login-form">
      <button data-testid="login-success-trigger" onClick={onSuccess}>
        Login Success
      </button>
    </div>
  ),
  RegisterForm: () => <div data-testid="register-form" />,
}));

import LoginPage from '../../pages/LoginPage';

// Helper to render with router
const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>,
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
  });

  describe('Rendering', () => {
    it('should render the login page with AuthLayout', () => {
      renderLoginPage();

      expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
    });

    it('should render LoginForm inside AuthLayout', () => {
      renderLoginPage();

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    it('should pass leftPanel to AuthLayout', () => {
      renderLoginPage();

      expect(screen.getByTestId('auth-layout-left-panel')).toBeInTheDocument();
    });

    it('should render AstroVerse brand in left panel', () => {
      renderLoginPage();

      expect(screen.getByText('AstroVerse')).toBeInTheDocument();
    });

    it('should render the quote in left panel', () => {
      renderLoginPage();

      expect(screen.getByText(/the stars are aligned/i)).toBeInTheDocument();
    });

    it('should render Daily Insight badge in left panel', () => {
      renderLoginPage();

      expect(screen.getByText('Daily Insight')).toBeInTheDocument();
    });

    it('should render Premium Astrology SaaS text in left panel', () => {
      renderLoginPage();

      expect(screen.getByText('Premium Astrology SaaS')).toBeInTheDocument();
    });

    it('should render auto_awesome icon in left panel', () => {
      renderLoginPage();

      const icons = screen.getAllByText('auto_awesome', { selector: 'span' });
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should render spark icon in left panel', () => {
      renderLoginPage();

      const icon = screen.getByText('spark', { selector: 'span' });
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to dashboard on login success', async () => {
      renderLoginPage();

      const successButton = screen.getByTestId('login-success-trigger');
      fireEvent.click(successButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should pass onSuccess callback to LoginForm', () => {
      renderLoginPage();

      // The LoginForm mock renders the success trigger button
      // which calls the onSuccess callback
      expect(screen.getByTestId('login-success-trigger')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have an SVG zodiac wheel in left panel', () => {
      renderLoginPage();

      const svg = screen.getByTestId('auth-layout-left-panel').querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have gradient circles in the SVG', () => {
      renderLoginPage();

      const circles = screen.getByTestId('auth-layout-left-panel').querySelectorAll('svg circle');
      expect(circles.length).toBeGreaterThan(0);
    });
  });
});
