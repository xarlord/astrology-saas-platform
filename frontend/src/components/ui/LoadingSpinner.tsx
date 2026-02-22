/**
 * LoadingSpinner Component
 *
 * Accessible loading spinner with multiple size variants
 * Follows WCAG 2.1 AA guidelines for loading indicators
 */

import React from 'react';
import { clsx } from 'clsx';

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
  label?: string; // Custom aria-label
  fullScreen?: boolean;
}

const sizeClasses = {
  xs: 'h-3 w-3 border-2',
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
  xl: 'h-16 w-16 border-[5px]',
};

const colorClasses = {
  primary: 'border-indigo-600 border-t-transparent',
  secondary: 'border-purple-600 border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-400 border-t-transparent dark:border-gray-600',
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
