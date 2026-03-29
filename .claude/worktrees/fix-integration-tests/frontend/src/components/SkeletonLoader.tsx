/**
 * SkeletonLoader Component
 * Provides animated placeholder content during data loading
 */

import React from 'react';
import './SkeletonLoader.css';

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
    <div className={`skeleton-loader ${className}`} role="status" aria-live="polite" aria-label="Loading content">
      <div className="sr-only">Loading...</div>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </div>
  );
};

// Card Skeleton - matches chart card layout
const SkeletonCard = () => (
  <div className="skeleton-card" aria-hidden="true">
    <div className="skeleton-card-header">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-badge" />
    </div>
    <div className="skeleton-card-body">
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line" />
    </div>
    <div className="skeleton-card-footer">
      <div className="skeleton skeleton-symbol" />
      <div className="skeleton skeleton-symbol" />
      <div className="skeleton skeleton-symbol" />
    </div>
  </div>
);

// List Skeleton - matches transit list layout
const SkeletonList = () => (
  <div className="skeleton-list" aria-hidden="true">
    <div className="skeleton-list-item">
      <div className="skeleton-list-header">
        <div className="skeleton skeleton-symbol-lg" />
        <div className="skeleton skeleton-symbol-lg" />
        <div className="skeleton skeleton-symbol-lg" />
        <div className="skeleton skeleton-badge" />
      </div>
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line-sm" />
    </div>
  </div>
);

// Text Skeleton - generic text placeholder
const SkeletonText = () => (
  <div className="skeleton-text" aria-hidden="true">
    <div className="skeleton skeleton-line" />
    <div className="skeleton skeleton-line" />
    <div className="skeleton skeleton-line-sm" />
  </div>
);

// Calendar Skeleton - matches calendar grid layout
const SkeletonCalendar = () => (
  <div className="skeleton-calendar" aria-hidden="true">
    <div className="skeleton-calendar-header">
      <div className="skeleton skeleton-button" />
      <div className="skeleton skeleton-title-lg" />
      <div className="skeleton skeleton-button" />
    </div>
    <div className="skeleton-calendar-weekdays">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="skeleton skeleton-weekday">{day}</div>
      ))}
    </div>
    <div className="skeleton-calendar-grid">
      {Array.from({ length: 35 }).map((_, index) => (
        <div key={index} className="skeleton skeleton-day" />
      ))}
    </div>
  </div>
);

// Chart Skeleton - matches chart wheel layout
const SkeletonChart = () => (
  <div className="skeleton-chart" aria-hidden="true">
    <div className="skeleton-wheel">
      <div className="skeleton skeleton-circle" />
      <div className="skeleton skeleton-circle-inner" />
    </div>
    <div className="skeleton-positions">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="skeleton-position">
          <div className="skeleton skeleton-planet" />
          <div className="skeleton skeleton-position-value" />
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
