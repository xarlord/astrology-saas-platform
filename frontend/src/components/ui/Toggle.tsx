/**
 * Toggle Component (Switch)
 *
 * Accessible toggle switch with animation and ARIA support
 * Follows WCAG 2.1 AA guidelines for form controls
 */

import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';

export interface ToggleProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'size' | 'onChange' | 'checked'
> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  labelPosition?: 'start' | 'end' | 'top' | 'bottom';
  fullWidth?: boolean;
  className?: string;
  containerClassName?: string;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked = false,
      onChange,
      label,
      helperText,
      error,
      disabled = false,
      size = 'md',
      labelPosition = 'end',
      fullWidth = false,
      className,
      containerClassName,
      ...props
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const toggleId = `toggle-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${toggleId}-error`;
    const helperId = `${toggleId}-helper`;

    const isControlled = controlledChecked !== undefined;
    const isChecked = isControlled ? controlledChecked : internalChecked;

    const toggleSizeStyles = {
      sm: {
        track: 'w-9 h-5',
        thumb: 'w-3 h-3 translate-x-0.5',
        thumbChecked: 'translate-x-4',
      },
      md: {
        track: 'w-11 h-6',
        thumb: 'w-4 h-4 translate-x-0.5',
        thumbChecked: 'translate-x-5',
      },
      lg: {
        track: 'w-14 h-8',
        thumb: 'w-5 h-5 translate-x-1',
        thumbChecked: 'translate-x-6.5',
      },
    };

    const handleChange = useCallback(() => {
      if (disabled) return;

      const newChecked = !isChecked;
      if (!isControlled) {
        setInternalChecked(newChecked);
      }
      onChange?.(newChecked);
    }, [disabled, isChecked, isControlled, onChange]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleChange();
      }
    };

    // Keyboard interaction
    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const activeElement = document.activeElement;
          if (activeElement && activeElement.getAttribute('role') === 'switch') {
            e.preventDefault();
            handleChange();
          }
        }
      };

      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }, [isChecked, disabled, handleChange]);

    const wrapperClass = clsx(
      'relative flex items-center',
      (labelPosition === 'start' || labelPosition === 'end') && 'gap-3',
      labelPosition === 'top' && 'flex-col gap-1',
      labelPosition === 'bottom' && 'flex-col-reverse gap-1',
      fullWidth && 'w-full',
      containerClassName,
    );

    const switchClass = clsx(
      'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
      'transition-colors duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      toggleSizeStyles[size].track,
      isChecked ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700',
      error && !isChecked && 'border-red-500',
    );

    const thumbClass = clsx(
      'pointer-events-none inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out',
      toggleSizeStyles[size].thumb,
      isChecked ? toggleSizeStyles[size].thumbChecked : toggleSizeStyles[size].thumb,
    );

    const labelClass = clsx(
      'text-sm font-medium',
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      error ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300',
    );

    return (
      <div className={wrapperClass}>
        {(labelPosition === 'start' || labelPosition === 'top') && label && (
          <label
            htmlFor={toggleId}
            className={labelClass}
            onClick={(e) => {
              if (!disabled) {
                e.preventDefault();
                handleChange();
              }
            }}
          >
            {label}
          </label>
        )}

        <button
          ref={ref}
          id={toggleId}
          type="button"
          role="switch"
          aria-checked={isChecked}
          aria-disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={
            clsx(error && errorId, helperText && helperId)
              .split(' ')
              .filter(Boolean)
              .join(' ') || undefined
          }
          aria-label={label}
          disabled={disabled}
          className={clsx(switchClass, className)}
          onClick={handleChange}
          onKeyDown={handleKeyDown}
          {...props}
        >
          <span className={thumbClass} aria-hidden="true" />
        </button>

        {(labelPosition === 'end' || labelPosition === 'bottom') && label && (
          <label
            htmlFor={toggleId}
            className={labelClass}
            onClick={(e) => {
              if (!disabled) {
                e.preventDefault();
                handleChange();
              }
            }}
          >
            {label}
          </label>
        )}

        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Toggle.displayName = 'Toggle';

export default Toggle;
