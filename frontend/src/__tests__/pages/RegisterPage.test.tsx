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
 * - Component rendering (delegation to AuthLayout + RegisterForm)
 * - Navigation on successful registration
 * - Layout props passed correctly
 */

import { render, screen, fireEvent } from '@testing-library/react';
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
vi.mock('../../components/AuthLayout', () => ({
  AuthLayout: ({ children, leftPanel }: { children: React.ReactNode; leftPanel?: React.ReactNode }) => (
    <div data-testid="auth-layout">
      <div data-testid="auth-layout-left-panel">{leftPanel}</div>
      <div data-testid="auth-layout-children">{children}</div>
    </div>
  ),
}));

// Mock AuthenticationForms
vi.mock('../../components/AuthenticationForms', () => ({
  LoginForm: () => <div data-testid="login-form" />,
  RegisterForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="register-form">
      <button data-testid="register-success-trigger" onClick={onSuccess} type="button">
        Register Success
      </button>
    </div>
  ),
}));

import RegisterPage from '../../pages/RegisterPage';

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
    vi.clearAllMocks();
    mockNavigate.mockReset();
  });

  describe('Rendering', () => {
    it('should render the register page with AuthLayout', () => {
      renderRegisterPage();

      expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
    });

    it('should render RegisterForm inside AuthLayout', () => {
      renderRegisterPage();

      expect(screen.getByTestId('register-form')).toBeInTheDocument();
    });

    it('should pass leftPanel to AuthLayout', () => {
      renderRegisterPage();

      expect(screen.getByTestId('auth-layout-left-panel')).toBeInTheDocument();
    });

    it('should render AstroVerse brand in left panel', () => {
      renderRegisterPage();

      expect(screen.getByText('AstroVerse')).toBeInTheDocument();
    });

    it('should render the heading with secrets in left panel', () => {
      renderRegisterPage();

      expect(screen.getByText(/unlock the/i)).toBeInTheDocument();
      expect(screen.getByText('secrets')).toBeInTheDocument();
    });

    it('should render feature descriptions in left panel', () => {
      renderRegisterPage();

      expect(screen.getByText('Accurate natal chart calculations')).toBeInTheDocument();
      expect(screen.getByText('Daily planetary transits')).toBeInTheDocument();
      expect(screen.getByText('Relationship synastry reports')).toBeInTheDocument();
    });

    it('should render the Rumi quote in left panel', () => {
      renderRegisterPage();

      expect(screen.getByText(/Rumi/)).toBeInTheDocument();
    });

    it('should render feature icons in left panel', () => {
      renderRegisterPage();

      const icons = screen.getAllByText('auto_awesome', { selector: 'span' });
      expect(icons.length).toBeGreaterThan(0);
      expect(screen.getByText('planet', { selector: 'span' })).toBeInTheDocument();
      expect(screen.getByText('group', { selector: 'span' })).toBeInTheDocument();
    });

    it('should render all_inclusive icon for logo', () => {
      renderRegisterPage();

      expect(screen.getByText('all_inclusive', { selector: 'span' })).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to dashboard on register success', () => {
      renderRegisterPage();

      const successButton = screen.getByTestId('register-success-trigger');
      fireEvent.click(successButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should pass onSuccess callback to RegisterForm', () => {
      renderRegisterPage();

      expect(screen.getByTestId('register-success-trigger')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should render join text in left panel', () => {
      renderRegisterPage();

      expect(screen.getByText(/join thousands/i)).toBeInTheDocument();
    });

    it('should render feature descriptions', () => {
      renderRegisterPage();

      expect(screen.getByText(/precise astronomical data/i)).toBeInTheDocument();
      expect(screen.getByText(/real-time updates/i)).toBeInTheDocument();
      expect(screen.getByText(/deep compatibility analysis/i)).toBeInTheDocument();
    });
  });
});
