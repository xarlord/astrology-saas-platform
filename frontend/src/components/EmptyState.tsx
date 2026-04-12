/**
 * EmptyState Component
 * Provides consistent empty state UI with icon, message, and CTA
 */

import React from 'react';

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

const containerSizeClasses = {
  small: 'p-8 px-4',
  medium: 'p-12 px-6',
  large: 'p-16 px-8',
};

const emojiSizeClasses = {
  small: 'text-4xl',
  medium: 'text-7xl',
  large: 'text-8xl',
};

const titleSizeClasses = {
  small: 'text-base',
  medium: 'text-xl',
  large: 'text-2xl',
};

const descriptionSizeClasses = {
  small: 'text-[0.8125rem] mb-4',
  medium: 'text-sm mb-6',
  large: 'text-base mb-8',
};

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
  return (
    <div
      className={`flex items-center justify-center text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 ${containerSizeClasses[size]} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="max-w-sm">
        {/* Icon */}
        <div className="mb-6 flex justify-center items-center" aria-hidden="true">
          {typeof icon === 'string' ? (
            <span className={`${emojiSizeClasses[size]} leading-none block`}>{icon}</span>
          ) : (
            icon
          )}
        </div>

        {/* Title */}
        <h3
          className={`${titleSizeClasses[size]} font-bold text-gray-900 dark:text-gray-50 mb-3 leading-snug`}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p
            className={`${descriptionSizeClasses[size]} text-gray-500 dark:text-gray-400 leading-relaxed`}
          >
            {description}
          </p>
        )}

        {/* Actions */}
        {(actionText ?? secondaryActionText) && (
          <div className="empty-state-actions">
            {actionText && onAction && (
              <button
                onClick={onAction}
                className="px-5 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 border-none whitespace-nowrap bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-px hover:shadow-[0_4px_6px_-1px_rgba(79,70,229,0.2)] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-400"
              >
                {actionText}
              </button>
            )}
            {secondaryActionText && onSecondaryAction && (
              <button
                onClick={onSecondaryAction}
                className="px-5 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 whitespace-nowrap bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:border-gray-500 dark:focus-visible:outline-indigo-400"
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
