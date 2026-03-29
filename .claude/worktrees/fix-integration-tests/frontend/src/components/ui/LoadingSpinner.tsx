/**
 * LoadingSpinner Component
 *
 * Accessible loading spinner with multiple size variants
 * Follows WCAG 2.1 AA guidelines for loading indicators
 *
 * Design Specs (Section 2 - Loading States):
 * - Sizes: sm (16px inline), md (32px default), lg (48px page), xl (64px full screen)
 * - Colors: Primary (#8B5CF6 cosmic purple), Secondary (#6366F1 indigo), White (#FFFFFF)
 */

import React from 'react';
import { clsx } from 'clsx';

export interface LoadingSpinnerProps {
  /** Size variant per design specs */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant per design specs */
  color?: 'primary' | 'secondary' | 'white';
  /** Additional CSS classes */
  className?: string;
  /** Custom aria-label */
  label?: string;
  /** Whether to show as fullscreen overlay */
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',   // 16px - inline loading
  md: 'h-8 w-8 border-[3px]', // 32px - default
  lg: 'h-12 w-12 border-4',   // 48px - page loading
  xl: 'h-16 w-16 border-[5px]', // 64px - full screen
};

const colorClasses = {
  primary: 'border-primary-500 border-t-transparent', // #8B5CF6 cosmic purple
  secondary: 'border-indigo-500 border-t-transparent', // #6366F1 indigo
  white: 'border-white border-t-transparent',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  label = 'Loading...',
  fullScreen = false,
}) => {
  const spinner = (
    <div
      className={clsx(
        'inline-block rounded-full animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
        role="progressbar"
        aria-busy="true"
        aria-label="Loading content"
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
