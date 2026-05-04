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
      className={`flex items-center justify-center text-center glass-panel rounded-2xl ${containerSizeClasses[size]} ${className}`}
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
        <h3 className={`${titleSizeClasses[size]} font-bold text-white mb-3 leading-snug`}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className={`${descriptionSizeClasses[size]} text-slate-200 leading-relaxed`}>
            {description}
          </p>
        )}

        {/* Actions */}
        {(actionText ?? secondaryActionText) && (
          <div className="flex flex-col gap-3 items-center sm:flex-row sm:justify-center">
            {actionText && onAction && (
              <button
                onClick={onAction}
                className="px-5 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 border-none whitespace-nowrap bg-primary text-white hover:bg-primary/90 hover:-translate-y-px hover:shadow-primary/10 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {actionText}
              </button>
            )}
            {secondaryActionText && onSecondaryAction && (
              <button
                onClick={onSecondaryAction}
                className="px-5 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 whitespace-nowrap bg-white/15 text-white border border-white/15 hover:bg-white/15 hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
// eslint-disable-next-line react-refresh/only-export-components
export const EmptyStates = {
  // No charts
  NoCharts: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#f59e0b' }}>auto_awesome</span>}
      title="No charts yet"
      description="Create your first natal chart to get started with your astrological journey"
      actionText="Create Your First Chart"
      {...props}
    />
  ),

  // No transits
  NoTransits: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#8b5cf6' }}>dark_mode</span>}
      title="No major transits today"
      description="The cosmos is relatively quiet. Check back later for upcoming astrological events."
      {...props}
    />
  ),

  // No calendar events
  NoCalendarEvents: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#6366f1' }}>calendar_month</span>}
      title="No events this month"
      description="There are no major astrological events scheduled for this month."
      {...props}
    />
  ),

  // No search results
  NoSearchResults: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94a3b8' }}>search</span>}
      title="No results found"
      description="Try adjusting your search terms or filters to find what you're looking for."
      {...props}
    />
  ),

  // Error state
  Error: (props: Omit<EmptyStateProps, 'icon' | 'title'>) => (
    <EmptyState
      icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ef4444' }}>warning</span>}
      title="Something went wrong"
      description="We encountered an error loading your data. Please try again."
      actionText="Retry"
      {...props}
    />
  ),

  // Network error
  NetworkError: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ef4444' }}>wifi_off</span>}
      title="Connection error"
      description="Unable to connect to the server. Please check your internet connection and try again."
      actionText="Retry"
      {...props}
    />
  ),

  // Not found
  NotFound: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94a3b8' }}>help</span>}
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
      actionText="Go to Dashboard"
      {...props}
    />
  ),

  // No analyses
  NoAnalyses: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#6366f1' }}>analytics</span>}
      title="No analyses yet"
      description="Generate your first astrological analysis to discover insights about your chart."
      actionText="Generate Analysis"
      {...props}
    />
  ),

  // No reminders
  NoReminders: (props: Omit<EmptyStateProps, 'icon' | 'title' | 'description'>) => (
    <EmptyState
      icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#f59e0b' }}>notifications</span>}
      title="No reminders set"
      description="Set up reminders for important astrological events so you never miss them."
      actionText="Set Reminder"
      {...props}
    />
  ),
};
