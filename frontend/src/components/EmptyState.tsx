/**
 * EmptyState Component
 * Provides consistent empty state UI with icon, message, and CTA
 */

import React from 'react';
import './EmptyState.css';

export interface EmptyStateProps {
  /**
   * Icon or emoji to display
   * @default "📭"
   */
  icon?: string | React.ReactNode;

  /**
   * Main heading text
   */
  title: string;

  /**
   * Optional description text
   */
  description?: string;

  /**
   * Optional call-to-action button text
   */
  actionText?: string;

  /**
   * Optional action button click handler
   */
  onAction?: () => void;

  /**
   * Size variant
   * @default "medium"
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Optional secondary action
   */
  secondaryActionText?: string;

  /**
   * Secondary action click handler
   */
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  actionText,
  onAction,
  size = 'medium',
  className = '',
  secondaryActionText,
  onSecondaryAction,
}) => {
  const sizeClasses = {
    small: 'empty-state-sm',
    medium: 'empty-state-md',
    large: 'empty-state-lg',
  };

  return (
    <div className={`empty-state ${sizeClasses[size]} ${className}`} role="status" aria-live="polite">
      <div className="empty-state-content">
        {/* Icon */}
        <div className="empty-state-icon" aria-hidden="true">
          {typeof icon === 'string' ? (
            <span className="empty-state-emoji">{icon}</span>
          ) : (
            icon
          )}
        </div>

        {/* Title */}
        <h3 className="empty-state-title">{title}</h3>

        {/* Description */}
        {description && (
          <p className="empty-state-description">{description}</p>
        )}

        {/* Actions */}
        {(actionText || secondaryActionText) && (
          <div className="empty-state-actions">
            {actionText && onAction && (
              <button
                onClick={onAction}
                className="btn-primary empty-state-action-primary"
              >
                {actionText}
              </button>
            )}
            {secondaryActionText && onSecondaryAction && (
              <button
                onClick={onSecondaryAction}
                className="btn-secondary empty-state-action-secondary"
              >
                {secondaryActionText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Pre-configured empty states for common use cases
export const EmptyStates = {
  // No charts
  NoCharts: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon="✨"
      title="No charts yet"
      description="Create your first natal chart to get started with your astrological journey"
      actionText="Create Your First Chart"
      {...props}
    />
  ),

  // No transits
  NoTransits: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon="🌙"
      title="No major transits today"
      description="The cosmos is relatively quiet. Check back later for upcoming astrological events."
      {...props}
    />
  ),

  // No calendar events
  NoCalendarEvents: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon="📅"
      title="No events this month"
      description="There are no major astrological events scheduled for this month."
      {...props}
    />
  ),

  // No search results
  NoSearchResults: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon="🔍"
      title="No results found"
      description="Try adjusting your search terms or filters to find what you're looking for."
      {...props}
    />
  ),

  // Error state
  Error: (props: Omit<EmptyStateProps, 'icon' | 'title'>) => (
    <EmptyState
      icon="⚠️"
      title="Something went wrong"
      description="We encountered an error loading your data. Please try again."
      actionText="Retry"
      {...props}
    />
  ),

  // Network error
  NetworkError: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon="🌐"
      title="Connection error"
      description="Unable to connect to the server. Please check your internet connection and try again."
      actionText="Retry"
      {...props}
    />
  ),

  // Not found
  NotFound: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon="🤷"
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
      actionText="Go to Dashboard"
      {...props}
    />
  ),

  // No analyses
  NoAnalyses: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon="📊"
      title="No analyses yet"
      description="Generate your first astrological analysis to discover insights about your chart."
      actionText="Generate Analysis"
      {...props}
    />
  ),

  // No reminders
  NoReminders: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon="🔔"
      title="No reminders set"
      description="Set up reminders for important astrological events so you never miss them."
      actionText="Set Reminder"
      {...props}
    />
  ),
};
