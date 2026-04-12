/**
 * Checkbox Component
 *
 * Accessible checkbox with indeterminate state and custom styling
 * Follows WCAG 2.1 AA guidelines for form controls
 */

import React, { forwardRef, useState, useEffect } from 'react';
import { clsx } from 'clsx';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  indeterminate?: boolean;
  labelPosition?: 'start' | 'end';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      helperText,
      indeterminate = false,
      labelPosition = 'end',
      size = 'md',
      fullWidth = false,
      checked,
      defaultChecked,
      onChange,
      disabled = false,
      id,
      className,
      containerClassName,
      ...props
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = useState(Boolean(defaultChecked));
    const [isIndeterminate, setIsIndeterminate] = useState(indeterminate);

    const checkboxId = id ?? `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${checkboxId}-error`;
    const helperId = `${checkboxId}-helper`;
    const internalRef = React.useRef<HTMLInputElement>(null);

    // Merge refs
    const checkboxRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    const isControlled = checked !== undefined;
    const isChecked = isControlled ?? checked ?? internalChecked;

    // Handle indeterminate state
    useEffect(() => {
      if (checkboxRef && 'current' in checkboxRef && checkboxRef.current) {
        checkboxRef.current.indeterminate = isIndeterminate;
      }
    }, [isIndeterminate, checkboxRef]);

    useEffect(() => {
      setIsIndeterminate(indeterminate);
    }, [indeterminate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsIndeterminate(false);
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    const sizeStyles = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    const labelSizeStyles = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    const wrapperClass = clsx(
      'relative flex items-start',
      labelPosition === 'end' ? 'flex-row' : 'flex-row-reverse',
      fullWidth && 'w-full',
      containerClassName,
    );

    const checkboxClass = clsx(
      'rounded border transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      sizeStyles[size],
      error
        ? 'border-red-300 dark:border-red-700 text-red-600 focus:ring-red-500 checked:bg-red-600'
        : 'border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 checked:bg-indigo-600',
      'dark:checked:bg-indigo-500',
    );

    const labelClass = clsx(
      'select-none',
      labelPosition === 'end' ? 'ml-2' : 'mr-2',
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      error ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300',
      labelSizeStyles[size],
    );

    return (
      <div className={wrapperClass}>
        <div className="flex items-center h-5">
          <input
            ref={checkboxRef}
            id={checkboxId}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
            className={clsx(
              checkboxClass,
              'appearance-none',
              'checked:bg-current',
              'relative cursor-pointer',
              className,
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={
              clsx(error && errorId, helperText && helperId)
                .split(' ')
                .filter(Boolean)
                .join(' ') || undefined
            }
            {...props}
          />

          {/* Custom checkmark icon */}
          <svg
            className={clsx(
              'pointer-events-none absolute',
              'text-white dark:text-gray-900',
              sizeStyles[size],
              'transition-opacity duration-200',
              isChecked || isIndeterminate ? 'opacity-100' : 'opacity-0',
              labelPosition === 'end' ? 'left-0' : 'right-0',
            )}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            {isIndeterminate ? (
              <rect x="6" y="11" width="12" height="2" rx="1" />
            ) : (
              <path
                fillRule="evenodd"
                d="M20.707 5.293a1 1 0 010 1.414l-11 11a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L9 15.586 19.293 5.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </div>

        {label && (
          <label htmlFor={checkboxId} className={clsx(labelClass, 'mt-0.5')}>
            {label}
          </label>
        )}

        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
