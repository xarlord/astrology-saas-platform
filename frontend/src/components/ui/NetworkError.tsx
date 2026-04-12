/**
 * NetworkError Component
 *
 * Offline banner and API error page components
 * Follows WCAG 2.1 AA guidelines for error announcements
 *
 * Design Specs (Section 3 - Error States):
 * - Offline Banner: Shows when user is offline with retry option
 * - API Error Page: Full-page error display for API failures
 */

import React from 'react';
import { clsx } from 'clsx';

// ============================================================================
// OfflineBanner Component
// ============================================================================

export interface OfflineBannerProps {
  /** Whether the app is offline */
  isOffline?: boolean;
  /** Callback for retry button */
  onRetry?: () => void;
  /** Whether retry is in progress */
  isRetrying?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom message */
  message?: string;
  /** Position of the banner */
  position?: 'top' | 'bottom';
  /** Whether the banner can be dismissed */
  dismissible?: boolean;
  /** Callback when banner is dismissed */
  onDismiss?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline = false,
  onRetry,
  isRetrying = false,
  className,
  message = "You're offline. Some features may be unavailable.",
  position = 'top',
  dismissible = false,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isOffline || !isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div
      className={clsx(
        'fixed left-0 right-0 z-50',
        position === 'top' ? 'top-0' : 'bottom-0',
        'bg-yellow-500 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100',
        'px-4 py-3',
        'animate-slide-in',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label="Offline status"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Offline Icon */}
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
          <span className="text-sm font-medium">{message}</span>
        </div>

        <div className="flex items-center gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className={clsx(
                'px-3 py-1 text-sm font-medium rounded-md',
                'bg-yellow-600 dark:bg-yellow-700 hover:bg-yellow-700 dark:hover:bg-yellow-800',
                'focus:outline-none focus:ring-2 focus:ring-yellow-800',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors',
              )}
              aria-busy={isRetrying}
            >
              {isRetrying ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
                  <span>Retrying...</span>
                </span>
              ) : (
                'Retry Connection'
              )}
            </button>
          )}

          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className={clsx(
                'p-1 rounded-md',
                'hover:bg-yellow-600 dark:hover:bg-yellow-700',
                'focus:outline-none focus:ring-2 focus:ring-yellow-800',
              )}
              aria-label="Dismiss offline notification"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ApiErrorPage Component
// ============================================================================

export type ApiErrorCode = 400 | 401 | 403 | 404 | 500 | 502 | 503 | 504 | 'unknown';

export interface ApiErrorPageProps {
  /** HTTP error code */
  errorCode?: ApiErrorCode;
  /** Custom title */
  title?: string;
  /** Custom message */
  message?: string;
  /** Primary action button */
  primaryAction?: {
    label: string;
    onClick: () => void;
    isLoading?: boolean;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Additional CSS classes */
  className?: string;
  /** Whether to show illustration */
  showIllustration?: boolean;
}

const errorContent: Record<ApiErrorCode, { title: string; message: string }> = {
  400: {
    title: 'Bad Request',
    message: 'The request could not be understood. Please check your input and try again.',
  },
  401: {
    title: 'Unauthorized',
    message: 'Your session has expired. Please log in again to continue.',
  },
  403: {
    title: 'Access Forbidden',
    message: "You don't have permission to access this resource.",
  },
  404: {
    title: 'Not Found',
    message: "The page or resource you're looking for doesn't exist.",
  },
  500: {
    title: 'Something went wrong',
    message: "We're having trouble loading this page. Our team has been notified.",
  },
  502: {
    title: 'Bad Gateway',
    message: 'There was a problem connecting to our servers. Please try again.',
  },
  503: {
    title: 'Service Unavailable',
    message: "We're currently performing maintenance. Please check back soon.",
  },
  504: {
    title: 'Gateway Timeout',
    message: 'The request took too long to complete. Please try again.',
  },
  unknown: {
    title: 'Unknown Error',
    message: 'An unexpected error occurred. Please try again.',
  },
};

export const ApiErrorPage: React.FC<ApiErrorPageProps> = ({
  errorCode = 500,
  title,
  message,
  primaryAction,
  secondaryAction,
  className,
  showIllustration = true,
}) => {
  const content = errorContent[errorCode] ?? errorContent.unknown;
  const displayTitle = title ?? content.title;
  const displayMessage = message ?? content.message;

  return (
    <div
      className={clsx('min-h-[400px] flex items-center justify-center p-8', className)}
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md w-full text-center">
        {/* Error Code Illustration */}
        {showIllustration && (
          <div className="mb-6">
            <div
              className={clsx(
                'inline-flex items-center justify-center',
                'w-32 h-32 rounded-full',
                'bg-gradient-to-br from-primary-100 to-primary-200',
                'dark:from-primary-900/30 dark:to-primary-800/30',
              )}
            >
              <span
                className={clsx(
                  'text-5xl font-bold',
                  'text-primary-600 dark:text-primary-400',
                  'font-display',
                )}
                aria-hidden="true"
              >
                {typeof errorCode === 'number' ? errorCode : '!'}
              </span>
            </div>
          </div>
        )}

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 font-display">
          {displayTitle}
        </h2>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">{displayMessage}</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              disabled={primaryAction.isLoading}
              className={clsx(
                'w-full sm:w-auto px-6 py-3 rounded-lg font-medium',
                'bg-primary-600 text-white',
                'hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors',
              )}
              aria-busy={primaryAction.isLoading}
            >
              {primaryAction.isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
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
                  <span>Loading...</span>
                </span>
              ) : (
                primaryAction.label
              )}
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className={clsx(
                'w-full sm:w-auto px-6 py-3 rounded-lg font-medium',
                'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
                'hover:bg-gray-200 dark:hover:bg-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
                'transition-colors',
              )}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ConnectionStatus Component (for use in components)
// ============================================================================

export interface ConnectionStatusProps {
  /** Whether connected */
  isConnected?: boolean;
  /** Whether currently reconnecting */
  isReconnecting?: boolean;
  /** Last connected time */
  lastConnected?: Date;
  /** Additional CSS classes */
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected = true,
  isReconnecting = false,
  lastConnected,
  className,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={clsx(
        'flex items-center gap-2 text-sm',
        isConnected ? 'text-success dark:text-success-light' : 'text-error dark:text-error-light',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span
        className={clsx(
          'w-2 h-2 rounded-full',
          isConnected ? 'bg-success animate-pulse' : 'bg-error',
          isReconnecting && 'animate-pulse',
        )}
        aria-hidden="true"
      />
      <span>
        {isReconnecting
          ? 'Reconnecting...'
          : isConnected
            ? 'Connected'
            : lastConnected
              ? `Offline (last seen ${formatTime(lastConnected)})`
              : 'Offline'}
      </span>
    </div>
  );
};

export default OfflineBanner;
