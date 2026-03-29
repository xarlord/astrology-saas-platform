/**
 * InlineError Component
 *
 * Form validation error display for inline field errors
 * Follows WCAG 2.1 AA guidelines for form error announcements
 *
 * Design Specs (Section 3 - Error States):
 * - Inline Field Errors: Display below input fields with warning icon
 * - Form-Level Errors: Summary of all errors with bullet list
 */

import React from 'react';
import { clsx } from 'clsx';

// ============================================================================
// InlineError Component
// ============================================================================

export interface InlineErrorProps {
  /** Error message to display */
  message?: string;
  /** Field ID this error is associated with */
  fieldId?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the error icon */
  showIcon?: boolean;
  /** Custom icon */
  icon?: React.ReactNode;
}

const sizeClasses = {
  sm: 'text-xs mt-1',
  md: 'text-sm mt-1.5',
  lg: 'text-base mt-2',
};

const iconSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
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
);

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  fieldId,
  size = 'md',
  className,
  showIcon = true,
  icon,
}) => {
  if (!message) {
    return null;
  }

  const errorId = fieldId ? `${fieldId}-error` : undefined;

  return (
    <div
      id={errorId}
      className={clsx(
        'flex items-start gap-1.5 text-error dark:text-error-light',
        sizeClasses[size],
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {showIcon && (
        <span className="flex-shrink-0 mt-0.5">
          {icon ?? <WarningIcon className={iconSizeClasses[size]} />}
        </span>
      )}
      <span className="flex-1">{message}</span>
    </div>
  );
};

// ============================================================================
// FormErrorSummary Component
// ============================================================================

export interface FormErrorSummaryProps {
  /** Array of error messages */
  errors?: string[];
  /** Title for the error summary */
  title?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Callback when error item is clicked (for focusing field) */
  onErrorClick?: (index: number, error: string) => void;
  /** Field IDs corresponding to errors (for focusing) */
  fieldIds?: string[];
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  errors = [],
  title,
  size = 'md',
  className,
  onErrorClick,
  fieldIds = [],
}) => {
  if (errors.length === 0) {
    return null;
  }

  const titleClasses = {
    sm: 'text-xs font-medium',
    md: 'text-sm font-medium',
    lg: 'text-base font-medium',
  };

  const itemClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const bulletSize = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  };

  const defaultTitle = title ?? `Please fix ${errors.length} ${errors.length === 1 ? 'error' : 'errors'}:`;

  return (
    <div
      className={clsx(
        'rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4',
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start gap-2">
        <WarningIcon className={clsx('flex-shrink-0 text-error mt-0.5', size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5')} />
        <div className="flex-1">
          <h4 className={clsx('text-error dark:text-error-light mb-2', titleClasses[size])}>
            {defaultTitle}
          </h4>
          <ul className={clsx('space-y-1', itemClasses[size])}>
            {errors.map((error, index) => (
              <li key={index} className="flex items-start gap-2">
                <span
                  className={clsx(
                    'flex-shrink-0 rounded-full bg-error mt-1.5',
                    bulletSize[size]
                  )}
                  aria-hidden="true"
                />
                <span
                  className={clsx(
                    'text-error dark:text-error-light',
                    onErrorClick && 'cursor-pointer hover:underline'
                  )}
                  onClick={() => onErrorClick?.(index, error)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onErrorClick?.(index, error);
                    }
                  }}
                  tabIndex={onErrorClick ? 0 : undefined}
                  role={onErrorClick ? 'button' : undefined}
                  aria-label={onErrorClick ? `Focus ${fieldIds[index] ?? 'field'} with error: ${error}` : undefined}
                >
                  {error}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FieldError Component (Combines Input with Error)
// ============================================================================

export interface FieldErrorProps {
  /** Field name/label */
  name: string;
  /** Error message */
  error?: string;
  /** Touch state */
  touched?: boolean;
  /** Field ID */
  fieldId?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({
  error,
  touched,
  fieldId,
  size = 'md',
  className,
}) => {
  // Only show error if field is touched and has error
  if (!error || (touched !== undefined && !touched)) {
    return null;
  }

  return (
    <InlineError
      message={error}
      fieldId={fieldId}
      size={size}
      className={className}
    />
  );
};

export default InlineError;
