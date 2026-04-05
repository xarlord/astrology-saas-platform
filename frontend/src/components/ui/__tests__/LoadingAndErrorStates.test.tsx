/**
 * Loading and Error States Components Test Suite
 *
 * Tests for ProgressIndicator, InlineError, NetworkError, and ErrorRecovery components
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Components under test
import {
  LinearProgress,
  CircularProgress,
  ProgressIndicator,
  InlineError,
  FormErrorSummary,
  FieldError,
  OfflineBanner,
  ApiErrorPage,
  ConnectionStatus,
  RetryButton,
  ErrorRecoveryActions,
  ReportIssueButton,
  RefreshButton,
} from '../index';

// ============================================================================
// ProgressIndicator Tests
// ============================================================================

describe('LinearProgress Component', () => {
  it('renders with default props', () => {
    render(<LinearProgress />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders with a specific value', () => {
    render(<LinearProgress value={50} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '50');
    expect(progress).toHaveAttribute('aria-label', 'Progress: 50%');
  });

  it('clamps value to valid range', () => {
    const { rerender } = render(<LinearProgress value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');

    rerender(<LinearProgress value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('shows label when showLabel is true', () => {
    render(<LinearProgress value={75} showLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows custom label', () => {
    render(<LinearProgress value={50} showLabel label="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders indeterminate state', () => {
    render(<LinearProgress indeterminate />);
    const progress = screen.getByRole('progressbar');
    expect(progress).not.toHaveAttribute('aria-valuenow');
    expect(progress).toHaveAttribute('aria-label', 'Loading...');
  });

  it('applies different sizes', () => {
    const { rerender } = render(<LinearProgress size="sm" />);
    expect(screen.getByRole('progressbar').querySelector('div')).toHaveClass('h-1');

    rerender(<LinearProgress size="lg" />);
    expect(screen.getByRole('progressbar').querySelector('div')).toHaveClass('h-2');
  });

  it('applies different colors', () => {
    const { rerender, container } = render(<LinearProgress color="primary" value={50} />);
    // The progress bar fill is the nested div inside the track
    const progressBar = container.querySelector('.bg-gradient-to-r');
    expect(progressBar).toHaveClass('from-primary-500');

    rerender(<LinearProgress color="success" value={50} />);
    const progressBar2 = container.querySelector('.bg-gradient-to-r');
    expect(progressBar2).toHaveClass('from-success');
  });

  it('applies custom className', () => {
    render(<LinearProgress className="custom-class" />);
    expect(screen.getByRole('progressbar')).toHaveClass('custom-class');
  });
});

describe('CircularProgress Component', () => {
  it('renders with default props', () => {
    render(<CircularProgress />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders with a specific value and shows percentage', () => {
    render(<CircularProgress value={60} showValue />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60');
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    render(<CircularProgress size={200} value={50} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveStyle({ width: '200px', height: '200px' });
  });

  it('renders indeterminate state with animation', () => {
    render(<CircularProgress indeterminate />);
    const svg = screen.getByRole('progressbar').querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });

  it('shows custom label in center', () => {
    render(<CircularProgress value={50} label="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies different colors', () => {
    const { rerender } = render(<CircularProgress color="primary" value={50} />);
    expect(screen.getByRole('progressbar').querySelector('circle:nth-child(2)')).toHaveClass(
      'stroke-primary-500',
    );

    rerender(<CircularProgress color="white" value={50} />);
    expect(screen.getByRole('progressbar').querySelector('circle:nth-child(2)')).toHaveClass(
      'stroke-white',
    );
  });
});

describe('ProgressIndicator Component (Unified)', () => {
  it('renders linear progress by default', () => {
    render(<ProgressIndicator value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders circular progress when type is circular', () => {
    render(<ProgressIndicator type="circular" value={50} showLabel />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});

// ============================================================================
// InlineError Tests
// ============================================================================

describe('InlineError Component', () => {
  it('renders error message', () => {
    render(<InlineError message="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not render when message is empty', () => {
    const { container } = render(<InlineError message="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('associates with field via fieldId', () => {
    render(<InlineError message="Invalid email" fieldId="email" />);
    const error = screen.getByRole('alert');
    expect(error).toHaveAttribute('id', 'email-error');
  });

  it('shows warning icon by default', () => {
    render(<InlineError message="Error" />);
    const svg = screen.getByRole('alert').querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    render(<InlineError message="Error" showIcon={false} />);
    const svg = screen.getByRole('alert').querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('applies different sizes', () => {
    const { rerender } = render(<InlineError message="Error" size="sm" />);
    expect(screen.getByRole('alert')).toHaveClass('text-xs');

    rerender(<InlineError message="Error" size="lg" />);
    expect(screen.getByRole('alert')).toHaveClass('text-base');
  });
});

describe('FormErrorSummary Component', () => {
  const errors = ['Email is required', 'Password too short', 'Must accept terms'];

  it('renders list of errors', () => {
    render(<FormErrorSummary errors={errors} />);
    expect(screen.getByText('Please fix 3 errors:')).toBeInTheDocument();
    errors.forEach((error) => {
      expect(screen.getByText(error)).toBeInTheDocument();
    });
  });

  it('does not render when no errors', () => {
    const { container } = render(<FormErrorSummary errors={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders custom title', () => {
    render(<FormErrorSummary errors={errors} title="Validation failed:" />);
    expect(screen.getByText('Validation failed:')).toBeInTheDocument();
  });

  it('handles singular error count', () => {
    render(<FormErrorSummary errors={['One error']} />);
    expect(screen.getByText('Please fix 1 error:')).toBeInTheDocument();
  });

  it('calls onErrorClick when error is clicked', async () => {
    const handleClick = vi.fn();
    render(
      <FormErrorSummary
        errors={errors}
        onErrorClick={handleClick}
        fieldIds={['email', 'password', 'terms']}
      />,
    );

    await userEvent.click(screen.getByText('Email is required'));
    expect(handleClick).toHaveBeenCalledWith(0, 'Email is required');
  });
});

describe('FieldError Component', () => {
  it('renders error when touched is true', () => {
    render(<FieldError error="Required field" touched />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('does not render when touched is false', () => {
    const { container } = render(<FieldError error="Required field" touched={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders when touched is undefined (always show)', () => {
    render(<FieldError error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });
});

// ============================================================================
// NetworkError Tests
// ============================================================================

describe('OfflineBanner Component', () => {
  it('renders when offline', () => {
    render(<OfflineBanner isOffline />);
    expect(screen.getByText(/You're offline/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('does not render when online', () => {
    const { container } = render(<OfflineBanner isOffline={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows retry button and calls onRetry', async () => {
    const handleRetry = vi.fn();
    render(<OfflineBanner isOffline onRetry={handleRetry} />);

    await userEvent.click(screen.getByText('Retry Connection'));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during retry', () => {
    render(<OfflineBanner isOffline onRetry={() => {}} isRetrying />);
    expect(screen.getByText('Retrying...')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<OfflineBanner isOffline message="No internet connection" />);
    expect(screen.getByText('No internet connection')).toBeInTheDocument();
  });

  it('can be dismissed', async () => {
    const handleDismiss = vi.fn();
    render(<OfflineBanner isOffline dismissible onDismiss={handleDismiss} />);

    await userEvent.click(screen.getByLabelText('Dismiss offline notification'));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('ApiErrorPage Component', () => {
  it('renders error code and message', () => {
    render(<ApiErrorPage errorCode={404} />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Not Found')).toBeInTheDocument();
  });

  it('renders custom title and message', () => {
    render(<ApiErrorPage errorCode={500} title="Custom Error" message="Custom error message" />);
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('renders primary action button', async () => {
    const handleClick = vi.fn();
    render(
      <ApiErrorPage errorCode={500} primaryAction={{ label: 'Try Again', onClick: handleClick }} />,
    );

    await userEvent.click(screen.getByText('Try Again'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders secondary action button', async () => {
    const handleClick = vi.fn();
    render(
      <ApiErrorPage
        errorCode={404}
        primaryAction={{ label: 'Go Back', onClick: () => {} }}
        secondaryAction={{ label: 'Go Home', onClick: handleClick }}
      />,
    );

    await userEvent.click(screen.getByText('Go Home'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state on primary action', () => {
    render(
      <ApiErrorPage
        errorCode={500}
        primaryAction={{ label: 'Try Again', onClick: () => {}, isLoading: true }}
      />,
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders different error codes', () => {
    const { rerender } = render(<ApiErrorPage errorCode={401} />);
    expect(screen.getByText('Unauthorized')).toBeInTheDocument();

    rerender(<ApiErrorPage errorCode={403} />);
    expect(screen.getByText('Access Forbidden')).toBeInTheDocument();

    rerender(<ApiErrorPage errorCode={503} />);
    expect(screen.getByText('Service Unavailable')).toBeInTheDocument();
  });
});

describe('ConnectionStatus Component', () => {
  it('shows connected status', () => {
    render(<ConnectionStatus isConnected />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('shows offline status', () => {
    render(<ConnectionStatus isConnected={false} />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('shows reconnecting status', () => {
    render(<ConnectionStatus isReconnecting />);
    expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
  });

  it('shows last connected time', () => {
    const lastConnected = new Date('2024-01-15T10:30:00');
    render(<ConnectionStatus isConnected={false} lastConnected={lastConnected} />);
    expect(screen.getByText(/last seen/)).toBeInTheDocument();
  });
});

// ============================================================================
// ErrorRecovery Tests
// ============================================================================

describe('RetryButton Component', () => {
  it('renders retry button', () => {
    render(<RetryButton onRetry={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('calls onRetry when clicked', async () => {
    const handleRetry = vi.fn();
    render(<RetryButton onRetry={handleRetry} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<RetryButton onRetry={() => {}} isLoading />);
    expect(screen.getByText('Retrying...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables after max retries', () => {
    render(<RetryButton onRetry={() => {}} retryCount={3} maxRetries={3} />);
    expect(screen.getByText('Max retries reached')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies different variants', () => {
    const { rerender } = render(<RetryButton onRetry={() => {}} variant="primary" />);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-600');

    rerender(<RetryButton onRetry={() => {}} variant="secondary" />);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-100');

    rerender(<RetryButton onRetry={() => {}} variant="ghost" />);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');
  });

  it('applies different sizes', () => {
    const { rerender } = render(<RetryButton onRetry={() => {}} size="sm" />);
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5');

    rerender(<RetryButton onRetry={() => {}} size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3');
  });
});

describe('ErrorRecoveryActions Component', () => {
  it('renders default actions for error type', () => {
    render(<ErrorRecoveryActions errorType="network" />);
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('renders primary action with custom handler', async () => {
    const handleClick = vi.fn();
    render(<ErrorRecoveryActions errorType="500" primaryAction={{ onClick: handleClick }} />);

    await userEvent.click(screen.getByText('Retry'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders secondary action when provided', () => {
    render(
      <ErrorRecoveryActions
        errorType="404"
        secondaryAction={{ label: 'Go Home', onClick: () => {} }}
      />,
    );
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('applies vertical direction', () => {
    render(<ErrorRecoveryActions errorType="unknown" direction="vertical" />);
    expect(screen.getByRole('group')).toHaveClass('flex-col');
  });
});

describe('ReportIssueButton Component', () => {
  it('renders report button', () => {
    render(<ReportIssueButton />);
    expect(screen.getByText('Report Issue')).toBeInTheDocument();
  });

  it('calls onReport and shows confirmation', async () => {
    const handleReport = vi.fn();
    render(<ReportIssueButton onReport={handleReport} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleReport).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Reported!')).toBeInTheDocument();
  });

  it('logs error details to console', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const errorDetails = {
      code: '500',
      message: 'Server error',
      url: '/api/data',
    };

    render(<ReportIssueButton errorDetails={errorDetails} />);
    fireEvent.click(screen.getByRole('button'));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Reporting issue:',
      expect.objectContaining({
        code: '500',
        message: 'Server error',
        url: '/api/data',
      }),
    );

    consoleSpy.mockRestore();
  });
});

describe('RefreshButton Component', () => {
  it('renders icon-only refresh button', () => {
    render(<RefreshButton onRefresh={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByLabelText('Refresh')).toBeInTheDocument();
  });

  it('renders with label when showLabel is true', () => {
    render(<RefreshButton onRefresh={() => {}} showLabel />);
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('calls onRefresh when clicked', async () => {
    const handleRefresh = vi.fn();
    render(<RefreshButton onRefresh={handleRefresh} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<RefreshButton onRefresh={() => {}} isLoading showLabel />);
    expect(screen.getByText('Refreshing...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('spins icon when loading', () => {
    render(<RefreshButton onRefresh={() => {}} isLoading />);
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });
});

// ============================================================================
// Accessibility Tests
// ============================================================================

describe('Accessibility', () => {
  it('LinearProgress has proper ARIA attributes', () => {
    render(<LinearProgress value={50} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(progress).toHaveAttribute('aria-valuenow', '50');
  });

  it('InlineError has proper ARIA attributes', () => {
    render(<InlineError message="Error message" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  it('ApiErrorPage has proper ARIA attributes', () => {
    render(<ApiErrorPage errorCode={500} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('RetryButton has aria-busy when loading', () => {
    render(<RetryButton onRetry={() => {}} isLoading />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('FormErrorSummary has aria-live assertive', () => {
    render(<FormErrorSummary errors={['Error']} />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });
});
