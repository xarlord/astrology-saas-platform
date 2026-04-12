/**
 * Input Component
 *
 * Accessible text input with label, error states, and icon support
 * Follows WCAG 2.1 AA guidelines for form inputs
 */

import React, { forwardRef, useState } from 'react';
import { clsx } from 'clsx';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'tel' | 'url';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftIconClickable?: boolean;
  rightIconClickable?: boolean;
  onLeftIconClick?: () => void;
  onRightIconClick?: () => void;
  floatingLabel?: boolean;
  fullWidth?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      leftIconClickable = false,
      rightIconClickable = false,
      onLeftIconClick,
      onRightIconClick,
      floatingLabel = false,
      fullWidth = true,
      type = 'text',
      id,
      className,
      containerClassName,
      value,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(Boolean(value));

    const inputId = id ?? `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(Boolean(e.target.value));
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      props.onChange?.(e);
    };

    const wrapperClass = clsx('relative', fullWidth && 'w-full', containerClassName);

    const inputClass = clsx(
      'block w-full rounded-md border',
      'bg-white dark:bg-gray-800',
      'text-gray-900 dark:text-gray-100',
      'placeholder-gray-400 dark:placeholder-gray-500',
      'transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      // Error state
      error
        ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500 pr-10'
        : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500',
      // Icon padding
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      leftIcon && rightIcon && 'px-10',
      className,
    );

    const labelClass = clsx(
      'block text-sm font-medium mb-1.5',
      error ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300',
    );

    const floatingLabelClass = clsx(
      'absolute left-3 transition-all duration-200 pointer-events-none',
      leftIcon && 'left-10',
      'bg-white dark:bg-gray-800 px-1',
      // Position
      (isFocused || hasValue) && floatingLabel
        ? '-top-2.5 text-xs'
        : 'top-1/2 -translate-y-1/2 text-sm',
      // Colors
      error
        ? 'text-red-600 dark:text-red-400'
        : isFocused
          ? 'text-indigo-600 dark:text-indigo-400'
          : 'text-gray-500 dark:text-gray-400',
    );

    return (
      <div className={wrapperClass}>
        {label && !floatingLabel && (
          <label htmlFor={inputId} className={labelClass}>
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className={clsx(
                'absolute left-3 top-1/2 -translate-y-1/2',
                leftIconClickable ? 'cursor-pointer' : 'pointer-events-none',
              )}
              onClick={leftIconClickable ? onLeftIconClick : undefined}
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            id={inputId}
            className={clsx(inputClass, floatingLabel && 'pt-5 pb-2')}
            aria-invalid={Boolean(error)}
            aria-describedby={
              clsx(error && errorId, helperText && helperId)
                .split(' ')
                .filter(Boolean)
                .join(' ') || undefined
            }
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {floatingLabel && label && (
            <label htmlFor={inputId} className={floatingLabelClass}>
              {label}
            </label>
          )}

          {rightIcon && (
            <div
              className={clsx(
                'absolute right-3 top-1/2 -translate-y-1/2',
                rightIconClickable ? 'cursor-pointer' : 'pointer-events-none',
              )}
              onClick={rightIconClickable ? onRightIconClick : undefined}
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}

          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

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

Input.displayName = 'Input';

export default Input;
