/**
 * ErrorRecovery Component
 *
 * Retry buttons and recovery actions for error states
 * Follows WCAG 2.1 AA guidelines for accessible error recovery
 *
 * Design Specs (Section 3 - Error States):
 * - Error Recovery Actions table with Primary and Secondary actions per error type
 */

import React from 'react';
import { clsx } from 'clsx';

// ============================================================================
// RetryButton Component
// ============================================================================

export interface RetryButtonProps {
  /** Callback when retry is clicked */
  onRetry: () => void;
  /** Whether retry is in progress */
  isLoading?: boolean;
  /** Button label */
  label?: string;
  /** Loading label */
  loadingLabel?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Number of retry attempts made */
  retryCount?: number;
  /** Max retry attempts before disabling */
  maxRetries?: number;
  /** Time to wait before enabling retry again (ms) */
  cooldownMs?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether button is disabled */
  disabled?: boolean;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  isLoading = false,
  label = 'Try Again',
  loadingLabel = 'Retrying...',
  variant = 'primary',
  size = 'md',
  retryCount = 0,
  maxRetries = 3,
  cooldownMs = 0,
  className,
  disabled = false,
}) => {
  const [isCoolingDown, setIsCoolingDown] = React.useState(false);
  const [cooldownRemaining, setCooldownRemaining] = React.useState(0);

  const isDisabled =
    disabled || isLoading || isCoolingDown || (maxRetries > 0 && retryCount >= maxRetries);

  const handleClick = () => {
    if (isDisabled) return;

    onRetry();

    if (cooldownMs > 0) {
      setIsCoolingDown(true);
      setCooldownRemaining(Math.ceil(cooldownMs / 1000));

      const interval = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsCoolingDown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const variantClasses = {
    primary: ['bg-primary-600 text-white', 'hover:bg-primary-700 focus:ring-primary-500'],
    secondary: [
      'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      'hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-gray-500',
    ],
    ghost: [
      'bg-transparent text-primary-600 dark:text-primary-400',
      'hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500',
    ],
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const getButtonLabel = () => {
    if (isLoading) return loadingLabel;
    if (isCoolingDown) return `Wait ${cooldownRemaining}s`;
    if (maxRetries > 0 && retryCount >= maxRetries) return 'Max retries reached';
    return label;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors',
        ...variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      aria-busy={isLoading}
      aria-label={`${label}${retryCount > 0 ? ` (attempt ${retryCount + 1})` : ''}`}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      )}
      {getButtonLabel()}
    </button>
  );
};

// ============================================================================
// ErrorRecoveryActions Component
// ============================================================================

export type ErrorType =
  | 'network'
  | '401'
  | '403'
  | '404'
  | '500'
  | 'validation'
  | 'timeout'
  | 'unknown';

export interface ErrorRecoveryActionsProps {
  /** Type of error */
  errorType?: ErrorType;
  /** Primary action override */
  primaryAction?: {
    label?: string;
    onClick: () => void;
    isLoading?: boolean;
  };
  /** Secondary action override */
  secondaryAction?: {
    label?: string;
    onClick: () => void;
  };
  /** Additional CSS classes */
  className?: string;
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
}

const defaultActions: Record<
  ErrorType,
  { primary: { label: string }; secondary: { label: string } }
> = {
  network: {
    primary: { label: 'Retry' },
    secondary: { label: 'Go Offline Mode' },
  },
  '401': {
    primary: { label: 'Login Again' },
    secondary: { label: 'Contact Support' },
  },
  '403': {
    primary: { label: 'Request Access' },
    secondary: { label: 'Go Home' },
  },
  '404': {
    primary: { label: 'Go Back' },
    secondary: { label: 'Search' },
  },
  '500': {
    primary: { label: 'Retry' },
    secondary: { label: 'Report Issue' },
  },
  validation: {
    primary: { label: 'Fix Fields' },
    secondary: { label: 'Reset Form' },
  },
  timeout: {
    primary: { label: 'Retry' },
    secondary: { label: 'Go Back' },
  },
  unknown: {
    primary: { label: 'Try Again' },
    secondary: { label: 'Go Home' },
  },
};

export const ErrorRecoveryActions: React.FC<ErrorRecoveryActionsProps> = ({
  errorType = 'unknown',
  primaryAction,
  secondaryAction,
  className,
  direction = 'horizontal',
  size = 'md',
}) => {
  const defaults = defaultActions[errorType];

  const primaryLabel = primaryAction?.label ?? defaults.primary.label;
  const secondaryLabel = secondaryAction?.label ?? defaults.secondary.label;

  const handlePrimaryRetry = (): void => {
    primaryAction?.onClick();
  };

  return (
    <div
      className={clsx(
        'flex gap-3',
        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className,
      )}
      role="group"
      aria-label="Error recovery actions"
    >
      <RetryButton
        onRetry={primaryAction?.onClick ?? handlePrimaryRetry}
        isLoading={primaryAction?.isLoading}
        label={primaryLabel}
        variant="primary"
        size={size}
      />

      {secondaryAction && (
        <button
          type="button"
          onClick={secondaryAction.onClick}
          className={clsx(
            'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
            'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
            'hover:bg-gray-200 dark:hover:bg-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
            'transition-colors',
            size === 'sm' && 'px-3 py-1.5 text-sm',
            size === 'md' && 'px-4 py-2 text-sm',
            size === 'lg' && 'px-6 py-3 text-base',
          )}
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  );
};

// ============================================================================
// ReportIssueButton Component
// ============================================================================

export interface ReportIssueButtonProps {
  /** Callback when report is clicked */
  onReport?: () => void;
  /** Pre-filled error details */
  errorDetails?: {
    code?: string;
    message?: string;
    timestamp?: Date;
    url?: string;
  };
  /** Button label */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

export const ReportIssueButton: React.FC<ReportIssueButtonProps> = ({
  onReport,
  errorDetails,
  label = 'Report Issue',
  size = 'sm',
  className,
}) => {
  const [isReported, setIsReported] = React.useState(false);

  const handleClick = () => {
    // In a real app, this would send the error details to a logging service
    void { ...errorDetails, reportedAt: new Date().toISOString() };

    setIsReported(true);
    onReport?.();

    // Reset after 3 seconds
    setTimeout(() => {
      setIsReported(false);
    }, 3000);
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isReported}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md',
        'text-gray-500 dark:text-gray-400',
        'hover:text-gray-700 dark:hover:text-gray-300',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors',
        sizeClasses[size],
        className,
      )}
      aria-live="polite"
    >
      {isReported ? (
        <>
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Reported!</span>
        </>
      ) : (
        <>
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

// ============================================================================
// RefreshButton Component (Simple refresh without retry count)
// ============================================================================

export interface RefreshButtonProps {
  /** Callback when refresh is clicked */
  onRefresh: () => void;
  /** Whether refresh is in progress */
  isLoading?: boolean;
  /** Button label (shown only when not loading) */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Show label or just icon */
  showLabel?: boolean;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  isLoading = false,
  label = 'Refresh',
  size = 'md',
  className,
  showLabel = false,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  if (!showLabel) {
    return (
      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className={clsx(
          'inline-flex items-center justify-center rounded-full',
          'text-gray-500 dark:text-gray-400',
          'hover:text-gray-700 dark:hover:text-gray-300',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors',
          sizeClasses[size],
          className,
        )}
        aria-label={isLoading ? 'Refreshing...' : label}
        aria-busy={isLoading}
      >
        <svg
          className={clsx(iconSizes[size], isLoading && 'animate-spin')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={isLoading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'text-gray-600 dark:text-gray-400',
        'hover:text-gray-900 dark:hover:text-gray-200',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        className,
      )}
      aria-busy={isLoading}
    >
      <svg
        className={clsx(iconSizes[size], isLoading && 'animate-spin')}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      {isLoading ? 'Refreshing...' : label}
    </button>
  );
};

export default RetryButton;
