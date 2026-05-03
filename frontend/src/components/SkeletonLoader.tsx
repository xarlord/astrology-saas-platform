/**
 * SkeletonLoader Component
 * Provides animated placeholder content during data loading
 */

import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'text' | 'calendar' | 'chart';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
  count = 1,
  className = '',
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return <SkeletonCard />;
      case 'list':
        return <SkeletonList />;
      case 'text':
        return <SkeletonText />;
      case 'calendar':
        return <SkeletonCalendar />;
      case 'chart':
        return <SkeletonChart />;
      default:
        return <SkeletonCard />;
    }
  };

  return (
    <div className={className} role="status" aria-live="polite" aria-label="Loading content">
      <span className="sr-only">Loading...</span>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </div>
  );
};

// Card Skeleton - matches chart card layout
const shimmerBar = 'bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded';

const SkeletonCard = () => (
  <div className="glass-panel rounded-2xl p-6" aria-hidden="true">
    <div className="flex justify-between items-center mb-4">
      <div className={`${shimmerBar} w-3/5 h-6`} />
      <div className={`${shimmerBar} w-12 h-6`} />
    </div>
    <div className="mb-4">
      <div className={`${shimmerBar} w-full h-4 mb-2`} />
      <div className={`${shimmerBar} w-full h-4 mb-2`} />
    </div>
    <div className="flex gap-2 pt-4 border-t border-white/[0.08]">
      <div className={`${shimmerBar} rounded-full w-8 h-8`} />
      <div className={`${shimmerBar} rounded-full w-8 h-8`} />
      <div className={`${shimmerBar} rounded-full w-8 h-8`} />
    </div>
  </div>
);

// List Skeleton - matches transit list layout
const SkeletonList = () => (
  <div aria-hidden="true">
    <div className="glass-panel rounded-2xl p-4 mb-3">
      <div className="flex items-center gap-3 mb-3">
        <div className={`${shimmerBar} rounded-full w-10 h-10`} />
        <div className={`${shimmerBar} rounded-full w-10 h-10`} />
        <div className={`${shimmerBar} rounded-full w-10 h-10`} />
        <div className={`${shimmerBar} w-12 h-6`} />
      </div>
      <div className={`${shimmerBar} w-full h-4 mb-2`} />
      <div className={`${shimmerBar} w-[70%] h-3`} />
    </div>
  </div>
);

// Text Skeleton - generic text placeholder
const SkeletonText = () => (
  <div aria-hidden="true">
    <div className={`${shimmerBar} w-full h-4 mb-2`} />
    <div className={`${shimmerBar} w-full h-4 mb-2`} />
    <div className={`${shimmerBar} w-[70%] h-3`} />
  </div>
);

// Calendar Skeleton - matches calendar grid layout
const SkeletonCalendar = () => (
  <div className="glass-panel rounded-2xl p-6" aria-hidden="true">
    <div className="flex justify-between items-center mb-6">
      <div className={`${shimmerBar} rounded-md w-24 h-10`} />
      <div className={`${shimmerBar} w-48 h-8`} />
      <div className={`${shimmerBar} rounded-md w-24 h-10`} />
    </div>
    <div className="grid grid-cols-7 gap-2 mb-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="bg-white/15 rounded text-center p-2 text-sm font-medium text-slate-200">{day}</div>
      ))}
    </div>
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 35 }).map((_, index) => (
        <div key={index} className={`${shimmerBar} aspect-square`} />
      ))}
    </div>
  </div>
);

// Chart Skeleton - matches chart wheel layout
const SkeletonChart = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" aria-hidden="true">
    <div className="aspect-square bg-white/15 rounded-lg flex items-center justify-center relative">
      <div className={`${shimmerBar} rounded-full absolute w-4/5 h-4/5`} />
      <div className={`${shimmerBar} rounded-full absolute w-3/5 h-3/5`} />
    </div>
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex justify-between items-center py-3 border-b border-white/[0.06]">
          <div className={`${shimmerBar} w-24 h-4`} />
          <div className={`${shimmerBar} w-32 h-4`} />
        </div>
      ))}
    </div>
  </div>
);

// Grid Skeleton - for dashboard card grid
export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonLoader key={index} variant="card" />
    ))}
  </div>
);
