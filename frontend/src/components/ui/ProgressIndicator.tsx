/**
 * ProgressIndicator Component
 *
 * Linear and circular progress indicators for loading states
 * Follows WCAG 2.1 AA guidelines for progress indicators
 *
 * Design Specs (Section 2 - Loading States):
 * - Linear Progress: Height 4px, Primary gradient, Shimmer effect
 * - Circular Progress: Used for chart calculation progress, Shows percentage, Size 120px centered
 */

import React from 'react';
import { clsx } from 'clsx';

// ============================================================================
// Linear Progress Indicator
// ============================================================================

export interface LinearProgressProps {
  /** Progress value from 0 to 100 */
  value?: number;
  /** Whether the progress is indeterminate */
  indeterminate?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /** Show percentage label */
  showLabel?: boolean;
  /** Label position */
  labelPosition?: 'top' | 'bottom' | 'none';
  /** Custom label text */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

const linearSizeClasses = {
  sm: 'h-1',
  md: 'h-1', // 4px as per spec
  lg: 'h-2',
};

const linearColorClasses = {
  primary: 'bg-gradient-to-r from-primary-500 to-primary-600',
  secondary: 'bg-gradient-to-r from-purple-500 to-purple-600',
  success: 'bg-gradient-to-r from-success to-success-light',
  warning: 'bg-gradient-to-r from-warning to-warning-light',
  error: 'bg-gradient-to-r from-error to-error-light',
};

export const LinearProgress: React.FC<LinearProgressProps> = ({
  value = 0,
  indeterminate = false,
  size = 'md',
  color = 'primary',
  showLabel = false,
  labelPosition = 'top',
  label,
  className,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const displayLabel = label ?? `${Math.round(clampedValue)}%`;

  return (
    <div
      className={clsx('w-full', className)}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={indeterminate ? 'Loading...' : `Progress: ${clampedValue}%`}
    >
      {showLabel && labelPosition === 'top' && (
        <div className="flex justify-between mb-1 text-sm text-gray-600 dark:text-gray-400">
          <span>{displayLabel}</span>
        </div>
      )}

      <div
        className={clsx(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
          linearSizeClasses[size],
        )}
      >
        {indeterminate ? (
          <div
            className={clsx(
              'h-full w-full',
              linearColorClasses[color],
              'animate-[shimmer_2s_linear_infinite]',
              'bg-[length:200%_100%]',
            )}
            style={{
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
              backgroundSize: '200% 100%',
            }}
          />
        ) : (
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-300 ease-out',
              linearColorClasses[color],
            )}
            style={{ width: `${clampedValue}%` }}
          />
        )}
      </div>

      {showLabel && labelPosition === 'bottom' && (
        <div className="flex justify-between mt-1 text-sm text-gray-600 dark:text-gray-400">
          <span>{displayLabel}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Circular Progress Indicator
// ============================================================================

export interface CircularProgressProps {
  /** Progress value from 0 to 100 */
  value?: number;
  /** Whether the progress is indeterminate */
  indeterminate?: boolean;
  /** Size in pixels (diameter) */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Color variant */
  color?: 'primary' | 'secondary' | 'white';
  /** Show percentage in center */
  showValue?: boolean;
  /** Custom label to show in center */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

const circularColorClasses = {
  primary: {
    track: 'stroke-gray-200 dark:stroke-gray-700',
    progress: 'stroke-primary-500',
    text: 'text-primary-600 dark:text-primary-400',
  },
  secondary: {
    track: 'stroke-gray-200 dark:stroke-gray-700',
    progress: 'stroke-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
  },
  white: {
    track: 'stroke-white/20',
    progress: 'stroke-white',
    text: 'text-white',
  },
};

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value = 0,
  indeterminate = false,
  size = 120, // 120px as per spec for chart calculation
  strokeWidth = 8,
  color = 'primary',
  showValue = false,
  label,
  className,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedValue / 100) * circumference;

  const colors = circularColorClasses[color];
  const displayLabel = label ?? (showValue ? `${Math.round(clampedValue)}%` : undefined);

  return (
    <div
      className={clsx('relative inline-flex items-center justify-center', className)}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={indeterminate ? 'Loading...' : `Progress: ${clampedValue}%`}
      style={{ width: size, height: size }}
    >
      <svg
        className={clsx('transform -rotate-90', indeterminate && 'animate-spin')}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          className={colors.track}
          fill="none"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress */}
        <circle
          className={clsx(
            colors.progress,
            'transition-all duration-300 ease-out',
            indeterminate && 'opacity-75',
          )}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={indeterminate ? circumference * 0.75 : offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>

      {/* Center content */}
      {(showValue || label) && !indeterminate && (
        <div className={clsx('absolute inset-0 flex items-center justify-center', colors.text)}>
          <span className="text-lg font-semibold">{displayLabel}</span>
        </div>
      )}

      {/* Screen reader text */}
      <span className="sr-only">{indeterminate ? 'Loading...' : `${clampedValue}% complete`}</span>
    </div>
  );
};

// ============================================================================
// ProgressIndicator (Unified Component)
// ============================================================================

export interface ProgressIndicatorProps {
  /** Type of progress indicator */
  type?: 'linear' | 'circular';
  /** Progress value from 0 to 100 */
  value?: number;
  /** Whether the progress is indeterminate */
  indeterminate?: boolean;
  /** Size variant for linear: sm/md/lg, or size in pixels for circular */
  size?: 'sm' | 'md' | 'lg' | number;
  /** Color variant */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white';
  /** Show label/percentage */
  showLabel?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  type = 'linear',
  value = 0,
  indeterminate = false,
  size = 'md',
  color = 'primary',
  showLabel = false,
  className,
}) => {
  if (type === 'circular') {
    return (
      <CircularProgress
        value={value}
        indeterminate={indeterminate}
        size={typeof size === 'number' ? size : 120}
        color={color as 'primary' | 'secondary' | 'white'}
        showValue={showLabel}
        className={className}
      />
    );
  }

  return (
    <LinearProgress
      value={value}
      indeterminate={indeterminate}
      size={size as 'sm' | 'md' | 'lg'}
      color={color as 'primary' | 'secondary' | 'success' | 'warning' | 'error'}
      showLabel={showLabel}
      className={className}
    />
  );
};

export default ProgressIndicator;
