/**
 * Toast Component
 *
 * Temporary notification messages with auto-dismiss
 * Fully accessible with keyboard navigation and screen reader support
 */

import React, { useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { AlertVariant } from './Alert';

export interface ToastProps {
  id: string;
  variant?: AlertVariant;
  title?: string;
  message: string;
  duration?: number; // milliseconds
  onClose?: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  showProgress?: boolean;
}

const variantStyles = {
  info: 'bg-white dark:bg-gray-800 border-l-4 border-blue-500',
  success: 'bg-white dark:bg-gray-800 border-l-4 border-green-500',
  warning: 'bg-white dark:bg-gray-800 border-l-4 border-yellow-500',
  error: 'bg-white dark:bg-gray-800 border-l-4 border-red-500',
};

const iconMap = {
  info: (
    <svg
      className="w-5 h-5 text-blue-500"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  success: (
    <svg
      className="w-5 h-5 text-green-500"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg
      className="w-5 h-5 text-yellow-500"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg
      className="w-5 h-5 text-red-500"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

export const Toast: React.FC<ToastProps> = React.memo(
  ({
    id,
    variant = 'info',
    title,
    message,
    duration = 5000,
    onClose,
    action,
    showProgress = true,
  }) => {
    const [progress, setProgress] = React.useState(100);
    const [isPaused, setIsPaused] = React.useState(false);
    const [isVisible, setIsVisible] = React.useState(false);

    // Auto-dismiss timer
    useEffect(() => {
      setIsVisible(true);

      if (!isPaused) {
        const interval = 50; // Update every 50ms
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
          setProgress((prev) => {
            if (prev <= 0) {
              handleClose();
              return 0;
            }
            return prev - step;
          });
        }, interval);

        return () => clearInterval(timer);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- handleClose is stable via useCallback
    }, [duration, isPaused]);

    const handleClose = useCallback(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.(id);
      }, 200); // Wait for exit animation
    }, [id, onClose]);

    const handleAction = useCallback(() => {
      action?.onClick();
      handleClose();
    }, [action, handleClose]);

    // Handle escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [handleClose]);

    return (
      <div
        className={clsx(
          'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg',
          'transform transition-all duration-200 ease-in-out',
          variantStyles[variant],
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        )}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0" aria-hidden="true">
              {iconMap[variant]}
            </div>

            <div className="ml-3 flex-1">
              {title && (
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
              )}
              <p className={clsx('text-sm text-gray-500 dark:text-gray-400', title && 'mt-1')}>
                {message}
              </p>

              {action && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleAction}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
                  >
                    {action.label}
                  </button>
                </div>
              )}
            </div>

            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Close notification"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {showProgress && (
            <div className="mt-2" aria-hidden="true">
              <div className="overflow-hidden h-1 rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={clsx(
                    'h-full transition-all ease-linear',
                    variant === 'error' && 'bg-red-500',
                    variant === 'warning' && 'bg-yellow-500',
                    variant === 'success' && 'bg-green-500',
                    variant === 'info' && 'bg-blue-500',
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

Toast.displayName = 'Toast';

export default Toast;
