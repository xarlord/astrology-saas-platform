/**
 * SkeletonScreen Component
 *
 * Loading placeholder components that match the structure of actual content
 * Reduces perceived load time and provides visual feedback
 * Fully accessible with proper ARIA attributes
 */

import React from 'react';
import { clsx } from 'clsx';

// Base skeleton pulse animation
const skeletonBase = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

export interface SkeletonProps {
  className?: string;
  count?: number;
}

// Text line skeleton
export interface SkeletonTextProps extends SkeletonProps {
  lines?: number;
  width?: string | string[];
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  width = '100%',
  className,
}) => {
  const widths: string[] = Array.isArray(width) ? width : Array(lines).fill(width) as string[];

  return (
    <div className={clsx('space-y-2', className)} role="status" aria-live="polite">
      <span className="sr-only">Loading text content...</span>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={clsx(skeletonBase, 'h-4')}
          style={{ width: widths[i] ?? '100%' }}
        />
      ))}
    </div>
  );
};

// Circle/avatar skeleton
export interface SkeletonCircleProps {
  size?: number; // pixels
  className?: string;
}

export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({
  size = 40,
  className,
}) => (
  <div
    className={clsx(skeletonBase, 'rounded-full', className)}
    style={{ width: size, height: size }}
    role="status"
    aria-label="Loading avatar"
  />
);

// Image/rectangular skeleton
export interface SkeletonRectProps {
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
  className?: string;
}

export const SkeletonRect: React.FC<SkeletonRectProps> = ({
  width = '100%',
  height = 200,
  aspectRatio,
  className,
}) => (
  <div
    className={clsx(skeletonBase, className)}
    style={{
      width: typeof width === 'number' ? `${width}px` : width,
      height: aspectRatio ? undefined : (typeof height === 'number' ? `${height}px` : height),
      aspectRatio,
    }}
    role="status"
    aria-label="Loading image"
  />
);

// Card skeleton
export const SkeletonCard: React.FC<SkeletonProps> = ({ className }) => (
  <div
    className={clsx('bg-white dark:bg-gray-800 rounded-lg shadow p-4', className)}
    role="status"
    aria-label="Loading card"
  >
    <div className="flex items-center space-x-4 mb-4">
      <SkeletonCircle size={48} />
      <div className="flex-1">
        <SkeletonText lines={2} width={['60%', '40%']} />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

// Chart wheel skeleton
export const SkeletonChartWheel: React.FC<SkeletonProps> = ({ className }) => (
  <div
    className={clsx('flex items-center justify-center p-8', className)}
    role="status"
    aria-label="Loading chart wheel"
  >
    <div
      className={clsx(skeletonBase, 'rounded-full')}
      style={{ width: 400, height: 400 }}
    />
  </div>
);

// Table skeleton
export interface SkeletonTableProps extends SkeletonProps {
  rows?: number;
  columns?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className,
}) => (
  <div className={clsx('space-y-3', className)} role="status" aria-label="Loading table">
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={`header-${i}`} className={clsx(skeletonBase, 'h-6 flex-1')} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div
            key={`cell-${rowIndex}-${colIndex}`}
            className={clsx(skeletonBase, 'h-10 flex-1')}
          />
        ))}
      </div>
    ))}
  </div>
);

// Calendar skeleton
export const SkeletonCalendar: React.FC<SkeletonProps> = ({ className }) => (
  <div className={clsx('bg-white dark:bg-gray-800 rounded-lg shadow p-6', className)}>
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <div className={clsx(skeletonBase, 'h-8 w-48')} />
      <div className="flex space-x-2">
        <div className={clsx(skeletonBase, 'h-10 w-10 rounded')} />
        <div className={clsx(skeletonBase, 'h-10 w-10 rounded')} />
      </div>
    </div>
    {/* Days of week */}
    <div className="grid grid-cols-7 gap-2 mb-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className={clsx(skeletonBase, 'h-8')} />
      ))}
    </div>
    {/* Calendar grid */}
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className={clsx(skeletonBase, 'h-24 rounded')} />
      ))}
    </div>
    <span className="sr-only">Loading calendar...</span>
  </div>
);

// List skeleton
export interface SkeletonListProps extends SkeletonProps {
  items?: number;
  showAvatar?: boolean;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  showAvatar = true,
  className,
}) => (
  <div className={clsx('space-y-4', className)} role="status" aria-label="Loading list">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        {showAvatar && <SkeletonCircle size={40} />}
        <div className="flex-1">
          <SkeletonText lines={2} width={['70%', '50%']} />
        </div>
      </div>
    ))}
  </div>
);

// Form skeleton
export const SkeletonForm: React.FC<SkeletonProps> = ({ className }) => (
  <div className={clsx('space-y-6', className)} role="status" aria-label="Loading form">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <div className={clsx(skeletonBase, 'h-5 w-1/4')} />
        <div className={clsx(skeletonBase, 'h-10 w-full')} />
      </div>
    ))}
  </div>
);
