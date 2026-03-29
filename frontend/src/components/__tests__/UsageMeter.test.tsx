/**
 * UsageMeter Component Tests
 * Tests for chart storage usage display component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsageMeter, Tier } from '../UsageMeter';

describe('UsageMeter', () => {
  const defaultProps = {
    currentCount: 1,
    limit: 3,
    tier: 'free' as Tier,
    onUpgradeClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with correct count display', () => {
      render(<UsageMeter {...defaultProps} currentCount={2} limit={3} />);

      expect(screen.getByText('2 / 3 charts')).toBeInTheDocument();
    });

    it('should display correct tier name', () => {
      render(<UsageMeter {...defaultProps} tier="pro" />);

      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
    });

    it('should display Premium tier correctly', () => {
      render(<UsageMeter {...defaultProps} tier="premium" />);

      expect(screen.getByText('Premium Plan')).toBeInTheDocument();
    });

    it('should display Free tier correctly', () => {
      render(<UsageMeter {...defaultProps} tier="free" />);

      expect(screen.getByText('Free Plan')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should show green progress bar at 33%', () => {
      render(<UsageMeter {...defaultProps} currentCount={1} limit={3} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '33');
    });

    it('should show 50% at half usage', () => {
      render(<UsageMeter {...defaultProps} currentCount={15} limit={30} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    it('should show 100% at limit', () => {
      render(<UsageMeter {...defaultProps} currentCount={3} limit={3} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('should cap at 100% even when over limit', () => {
      render(<UsageMeter {...defaultProps} currentCount={5} limit={3} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('Warning States', () => {
    it('should not show warning at 50%', () => {
      render(<UsageMeter {...defaultProps} currentCount={15} limit={30} />);

      expect(screen.queryByText('Approaching storage limit')).not.toBeInTheDocument();
      expect(screen.queryByText('Storage limit reached')).not.toBeInTheDocument();
    });

    it('should show warning at 80%', () => {
      render(<UsageMeter {...defaultProps} currentCount={24} limit={30} />);

      expect(screen.getByText('Approaching storage limit')).toBeInTheDocument();
    });

    it('should show warning at 99%', () => {
      render(<UsageMeter {...defaultProps} currentCount={29} limit={30} />);

      expect(screen.getByText('Approaching storage limit')).toBeInTheDocument();
    });

    it('should show limit reached at 100%', () => {
      render(<UsageMeter {...defaultProps} currentCount={3} limit={3} />);

      expect(screen.getByText('Storage limit reached')).toBeInTheDocument();
      expect(screen.queryByText('Approaching storage limit')).not.toBeInTheDocument();
    });
  });

  describe('Upgrade Prompts', () => {
    it('should show upgrade button when approaching limit', () => {
      render(<UsageMeter {...defaultProps} currentCount={25} limit={30} />);

      const upgradeButton = screen.getByText('Upgrade');
      expect(upgradeButton).toBeInTheDocument();
    });

    it('should show upgrade button at limit', () => {
      render(<UsageMeter {...defaultProps} currentCount={3} limit={3} />);

      const upgradeButton = screen.getByText('Upgrade to create more');
      expect(upgradeButton).toBeInTheDocument();
    });

    it('should call onUpgradeClick when upgrade clicked', () => {
      const onUpgradeClick = vi.fn();
      render(<UsageMeter {...defaultProps} currentCount={25} limit={30} onUpgradeClick={onUpgradeClick} />);

      const upgradeButton = screen.getByText('Upgrade');
      fireEvent.click(upgradeButton);

      expect(onUpgradeClick).toHaveBeenCalledTimes(1);
    });

    it('should not show upgrade button when not needed', () => {
      render(<UsageMeter {...defaultProps} currentCount={10} limit={30} />);

      expect(screen.queryByText('Upgrade')).not.toBeInTheDocument();
    });
  });

  describe('Tier Features', () => {
    it('should display Free tier features', () => {
      render(<UsageMeter {...defaultProps} tier="free" />);

      expect(screen.getByText('3 natal charts')).toBeInTheDocument();
      expect(screen.getByText('Basic transits')).toBeInTheDocument();
    });

    it('should display Pro tier features', () => {
      render(<UsageMeter {...defaultProps} tier="pro" />);

      expect(screen.getByText('25 charts')).toBeInTheDocument();
      expect(screen.getByText('Synastry')).toBeInTheDocument();
    });

    it('should display Premium tier features', () => {
      render(<UsageMeter {...defaultProps} tier="premium" />);

      expect(screen.getByText('1000 charts')).toBeInTheDocument();
      expect(screen.getByText('Priority support')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have progressbar role', () => {
      render(<UsageMeter {...defaultProps} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should have correct aria attributes', () => {
      render(<UsageMeter {...defaultProps} currentCount={2} limit={3} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '67');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-label', 'Storage usage: 67%');
    });

    it('should have alert role for warning', () => {
      render(<UsageMeter {...defaultProps} currentCount={25} limit={30} />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Approaching storage limit');
    });

    it('should have accessible upgrade button label', () => {
      render(<UsageMeter {...defaultProps} currentCount={25} limit={30} />);

      const upgradeButton = screen.getByLabelText('Upgrade plan for more storage');
      expect(upgradeButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero limit gracefully', () => {
      render(<UsageMeter {...defaultProps} currentCount={0} limit={0} />);

      expect(screen.getByText('0 / 0 charts')).toBeInTheDocument();
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('should handle zero current count', () => {
      render(<UsageMeter {...defaultProps} currentCount={0} limit={3} />);

      expect(screen.getByText('0 / 3 charts')).toBeInTheDocument();
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('should apply custom className', () => {
      render(<UsageMeter {...defaultProps} className="custom-class" />);

      const container = screen.getByRole('progressbar').closest('.usage-meter');
      expect(container).toHaveClass('custom-class');
    });

    it('should work without onUpgradeClick', () => {
      render(<UsageMeter {...defaultProps} currentCount={25} limit={30} onUpgradeClick={undefined} />);

      // Should still show warning
      expect(screen.getByText('Approaching storage limit')).toBeInTheDocument();
      // But no upgrade button
      expect(screen.queryByText('Upgrade')).not.toBeInTheDocument();
    });
  });
});
