/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in component tree
 * Displays fallback UI and provides error recovery options
 * Follows React error boundary best practices
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert } from './Alert';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: (string | number | boolean)[];
  resetOnPropsChange?: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // logErrorToService(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && (resetOnPropsChange ?? prevProps.resetKeys !== resetKeys)) {
      if (resetKeys && prevProps.resetKeys) {
        const hasResetKeyChanged = resetKeys.some((key, index) => key !== prevProps.resetKeys![index]);

        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div
          className="min-h-[400px] flex items-center justify-center p-4"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="max-w-md w-full">
            <Alert variant="error" title="Something went wrong">
              <div className="space-y-4">
                <p className="text-sm">
                  {error?.message ?? 'An unexpected error occurred. Please try refreshing the page.'}
                </p>

                {process.env.NODE_ENV === 'development' && error && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium mb-2">
                      Error Details
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  </details>
                )}

                <div className="flex space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={this.resetErrorBoundary}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.href = '/'}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            </Alert>
          </div>
        </div>
      );
    }

    return children;
  }
}

// Functional wrapper component with hooks
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName ?? Component.name})`;

  return WrappedComponent;
};

export default ErrorBoundary;
