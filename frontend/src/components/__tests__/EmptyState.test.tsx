/**
 * EmptyState Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState, EmptyStates } from '../EmptyState';

describe('EmptyState', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(
        <EmptyState
          title="No data"
          description="There is no data to display"
        />
      );

      expect(screen.getByText('No data')).toBeInTheDocument();
      expect(screen.getByText('There is no data to display')).toBeInTheDocument();
    });

    it('renders with emoji icon', () => {
      render(<EmptyState title="Test" icon="📭" />);

      expect(screen.getByText('📭')).toBeInTheDocument();
    });

    it('renders with custom React node icon', () => {
      const CustomIcon = () => <span data-testid="custom-icon">⭐</span>;
      render(<EmptyState title="Test" icon={<CustomIcon />} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('renders primary action button', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="Test"
          actionText="Click me"
          onAction={handleClick}
        />
      );

      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
    });

    it('renders secondary action button', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="Test"
          secondaryActionText="Secondary"
          onSecondaryAction={handleClick}
        />
      );

      const button = screen.getByRole('button', { name: 'Secondary' });
      expect(button).toBeInTheDocument();
    });

    it('renders both action buttons', () => {
      const primaryClick = vi.fn();
      const secondaryClick = vi.fn();
      render(
        <EmptyState
          title="Test"
          actionText="Primary"
          onAction={primaryClick}
          secondaryActionText="Secondary"
          onSecondaryAction={secondaryClick}
        />
      );

      expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('renders small size', () => {
      const { container } = render(
        <EmptyState title="Test" size="small" />
      );

      expect(container.querySelector('[role="status"]')?.className).toContain('p-8');
    });

    it('renders medium size (default)', () => {
      const { container } = render(
        <EmptyState title="Test" size="medium" />
      );

      expect(container.querySelector('[role="status"]')?.className).toContain('p-12');
    });

    it('renders large size', () => {
      const { container } = render(
        <EmptyState title="Test" size="large" />
      );

      expect(container.querySelector('[role="status"]')?.className).toContain('p-16');
    });
  });

  describe('Interactions', () => {
    it('calls onAction when primary button is clicked', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="Test"
          actionText="Primary"
          onAction={handleClick}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Primary' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onSecondaryAction when secondary button is clicked', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="Test"
          secondaryActionText="Secondary"
          onSecondaryAction={handleClick}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Secondary' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has role="status" attribute', () => {
      const { container } = render(<EmptyState title="Test" />);
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it('has aria-live="polite" for screen readers', () => {
      const { container } = render(<EmptyState title="Test" />);
      const emptyState = container.querySelector('[role="status"]');
      expect(emptyState).toHaveAttribute('aria-live', 'polite');
    });

    it('icons have aria-hidden to prevent screen reader announcement', () => {
      const { container } = render(<EmptyState title="Test" icon="📭" />);
      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <EmptyState title="Test" className="custom-class" />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('renders title with correct styling', () => {
      const { container } = render(<EmptyState title="Test Title" />);
      const title = container.querySelector('h3');
      expect(title).toBeInTheDocument();
      expect(title?.textContent).toBe('Test Title');
    });

    it('renders description with correct styling', () => {
      const { container } = render(
        <EmptyState title="Test" description="Test description" />
      );

      const description = container.querySelector('p');
      expect(description).toBeInTheDocument();
      expect(description?.textContent).toBe('Test description');
    });
  });
});

describe('EmptyStates Pre-configured', () => {
  describe('NoCharts', () => {
    it('renders with correct content', () => {
      const handleClick = vi.fn();
      render(<EmptyStates.NoCharts onAction={handleClick} />);

      expect(screen.getByText('auto_awesome')).toBeInTheDocument();
      expect(screen.getByText('No charts yet')).toBeInTheDocument();
      expect(screen.getByText(/Create your first natal chart/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Your First Chart' })).toBeInTheDocument();
    });

    it('calls onAction when button clicked', () => {
      const handleClick = vi.fn();
      render(<EmptyStates.NoCharts onAction={handleClick} />);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('NoTransits', () => {
    it('renders with correct content', () => {
      render(<EmptyStates.NoTransits />);

      expect(screen.getByText('dark_mode')).toBeInTheDocument();
      expect(screen.getByText('No major transits today')).toBeInTheDocument();
      expect(screen.getByText(/The cosmos is relatively quiet/)).toBeInTheDocument();
    });
  });

  describe('NoCalendarEvents', () => {
    it('renders with correct content', () => {
      render(<EmptyStates.NoCalendarEvents />);

      expect(screen.getByText('calendar_month')).toBeInTheDocument();
      expect(screen.getByText('No events this month')).toBeInTheDocument();
    });
  });

  describe('NoSearchResults', () => {
    it('renders with correct content', () => {
      render(<EmptyStates.NoSearchResults />);

      expect(screen.getByText('search')).toBeInTheDocument();
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  describe('Error', () => {
    it('renders with correct content', () => {
      const handleClick = vi.fn();
      render(<EmptyStates.Error onAction={handleClick} />);

      expect(screen.getByText('warning')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });
  });

  describe('NetworkError', () => {
    it('renders with correct content', () => {
      render(<EmptyStates.NetworkError />);

      expect(screen.getByText('wifi_off')).toBeInTheDocument();
      expect(screen.getByText('Connection error')).toBeInTheDocument();
      expect(screen.getByText(/Unable to connect to the server/)).toBeInTheDocument();
    });
  });

  describe('NotFound', () => {
    it('renders with correct content', () => {
      render(<EmptyStates.NotFound />);

      expect(screen.getByText('help')).toBeInTheDocument();
      expect(screen.getByText('Page not found')).toBeInTheDocument();
    });
  });

  describe('NoAnalyses', () => {
    it('renders with correct content', () => {
      render(<EmptyStates.NoAnalyses />);

      expect(screen.getByText('analytics')).toBeInTheDocument();
      expect(screen.getByText('No analyses yet')).toBeInTheDocument();
    });
  });

  describe('NoReminders', () => {
    it('renders with correct content', () => {
      render(<EmptyStates.NoReminders />);

      expect(screen.getByText('notifications')).toBeInTheDocument();
      expect(screen.getByText('No reminders set')).toBeInTheDocument();
    });
  });
});
