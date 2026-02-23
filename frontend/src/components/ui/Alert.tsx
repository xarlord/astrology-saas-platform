/**
 * Alert Component
 *
 * Accessible alert banners for displaying important messages
 * Follows WCAG 2.1 AA guidelines for alert regions
 *
 * Design Specs (Section 3 - Error States):
 * - Types: error (red), warning (yellow), info (blue), success (green)
 * - Sizes: sm (compact inline), md (standard), lg (page-level)
 */

import React from 'react';
import { clsx } from 'clsx';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';
export type AlertSize = 'sm' | 'md' | 'lg';

export interface AlertProps {
  /** Alert type variant */
  variant?: AlertVariant;
  /** Alert size */
  size?: AlertSize;
  /** Optional title */
  title?: string;
  /** Alert content */
  children: React.ReactNode;
  /** Callback when dismissed */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether alert can be dismissed */
  dismissible?: boolean;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
}

const variantStyles = {
  info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
  success: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
  error: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
};

const sizeStyles = {
  sm: 'p-2.5 text-xs',
  md: 'p-4 text-sm',
  lg: 'p-6 text-base',
};

const iconMap = {
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  size = 'md',
  title,
  children,
  onClose,
  className,
  dismissible = false,
  action,
}) => {
  const [isClosing, setIsClosing] = React.useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 200); // Match animation duration
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const titleSizeClasses = {
    sm: 'text-xs font-medium',
    md: 'text-sm font-medium',
    lg: 'text-base font-medium',
  };

  return (
    <div
      className={clsx(
        'rounded-lg border',
        'transition-all duration-200',
        variantStyles[variant],
        sizeStyles[size],
        isClosing && 'opacity-0 scale-95',
        className
      )}
      role="alert"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="flex">
        <div className="flex-shrink-0" aria-hidden="true">
          {React.cloneElement(iconMap[variant] as React.ReactElement, {
            className: iconSizeClasses[size]
          })}
        </div>

        <div className="ml-3 flex-1">
          {title && (
            <h3 className={clsx('mb-1', titleSizeClasses[size])}>{title}</h3>
          )}
          <div>{children}</div>

          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className={clsx(
                'mt-2 inline-flex items-center font-medium',
                'underline hover:no-underline',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 rounded',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base',
                variant === 'error' && 'focus:ring-red-500',
                variant === 'warning' && 'focus:ring-yellow-500',
                variant === 'success' && 'focus:ring-green-500',
                variant === 'info' && 'focus:ring-blue-500'
              )}
            >
              {action.label}
            </button>
          )}
        </div>

        {dismissible && onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={handleClose}
              className={clsx(
                'inline-flex rounded-md p-1.5',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                variant === 'error' && 'hover:bg-red-100 dark:hover:bg-red-900/30 focus:ring-red-600',
                variant === 'warning' && 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30 focus:ring-yellow-600',
                variant === 'success' && 'hover:bg-green-100 dark:hover:bg-green-900/30 focus:ring-green-600',
                variant === 'info' && 'hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:ring-blue-600'
              )}
              aria-label="Dismiss alert"
            >
              <svg
                className={clsx(iconSizeClasses[size])}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-components for structured alert content
export const AlertTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <h3 className={clsx('font-medium mb-1', className)}>{children}</h3>;

export const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={clsx('text-sm opacity-90', className)}>{children}</div>;

export const AlertAction: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}> = ({ children, onClick, className }) => (
  <button
    type="button"
    onClick={onClick}
    className={clsx(
      'mt-2 inline-flex items-center px-3 py-1.5 rounded-md',
      'text-sm font-medium',
      'bg-current/10 hover:bg-current/20',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      className
    )}
  >
    {children}
  </button>
);

export default Alert;
