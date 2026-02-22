/**
 * Badge Component
 *
 * Small status indicator with multiple variants, sizes, and dot option
 * Fully accessible with proper ARIA attributes
 */

import React from 'react';
import { clsx, type ClassValue } from 'clsx';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children?: React.ReactNode;
  dot?: boolean;
  icon?: React.ReactNode;
  count?: number;
  maxCount?: number;
  className?: string;
  fullWidth?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  dot = false,
  icon,
  count,
  maxCount = 99,
  className,
  fullWidth = false,
}) => {
  const variantStyles: Record<BadgeVariant, ClassValue> = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700',
    primary: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
  };

  const sizeStyles: Record<BadgeSize, ClassValue> = {
    sm: 'px-2 py-0.5 text-xs font-medium rounded',
    md: 'px-2.5 py-0.5 text-sm font-medium rounded-md',
    lg: 'px-3 py-1 text-base font-medium rounded-lg',
  };

  const dotSizeStyles: Record<BadgeSize, ClassValue> = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  const iconSizeStyles: Record<BadgeSize, string> = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // Display count with max
  const displayCount = count !== undefined && count > maxCount ? `${maxCount}+` : count;

  const badgeClass = clsx(
    'inline-flex items-center justify-center gap-1.5 border',
    'transition-colors duration-200',
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && 'w-full',
    className
  );

  const dotColorClass: Record<BadgeVariant, string> = {
    default: 'bg-gray-500',
    primary: 'bg-indigo-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  return (
    <span
      className={badgeClass}
      role="status"
      aria-label={typeof children === 'string' ? children : 'Badge'}
    >
      {dot && (
        <span
          className={clsx(
            'rounded-full',
            dotSizeStyles[size],
            dotColorClass[variant]
          )}
          aria-hidden="true"
        />
      )}

      {icon && (
        <span className={clsx(iconSizeStyles[size])} aria-hidden="true">
          {icon}
        </span>
      )}

      {count !== undefined && (
        <span className="font-semibold" aria-label={`${count} items`}>
          {displayCount}
        </span>
      )}

      {children && <span>{children}</span>}
    </span>
  );
};

// DotBadge - simplified badge with just a dot
export interface DotBadgeProps {
  variant?: BadgeVariant;
  size?: Exclude<BadgeSize, 'lg'>;
  className?: string;
  ariaLabel?: string;
}

export const DotBadge: React.FC<DotBadgeProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  ariaLabel = 'Status indicator',
}) => {
  const dotColorClass: Record<BadgeVariant, string> = {
    default: 'bg-gray-500',
    primary: 'bg-indigo-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  const dotSizeStyles: Record<BadgeSize, string> = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  return (
    <span
      className={clsx(
        'relative flex h-3 w-3',
        className
      )}
      role="status"
      aria-label={ariaLabel}
    >
      <span
        className={clsx(
          'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
          dotColorClass[variant]
        )}
        aria-hidden="true"
      />
      <span
        className={clsx(
          'relative inline-flex rounded-full',
          dotSizeStyles[size],
          dotColorClass[variant]
        )}
        aria-hidden="true"
      />
    </span>
  );
};

// CountBadge - numeric badge for notifications
export interface CountBadgeProps {
  count: number;
  maxCount?: number;
  variant?: BadgeVariant;
  size?: Exclude<BadgeSize, 'lg'>;
  showZero?: boolean;
  className?: string;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  maxCount = 99,
  variant = 'danger',
  size = 'sm',
  showZero = false,
  className,
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count;

  return (
    <Badge
      variant={variant}
      size={size}
      count={count}
      maxCount={maxCount}
      className={clsx('min-w-[1.25rem] h-5', className)}
    >
      {displayCount}
    </Badge>
  );
};

export default Badge;
