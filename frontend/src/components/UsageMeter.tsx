/**
 * UsageMeter Component
 * Displays chart storage usage with visual progress bar and tier information
 *
 * @requirement UI-USAGE-001
 */

import React from 'react';

export type Tier = 'free' | 'pro' | 'premium';
export type WarningLevel = 'none' | 'warning' | 'limit';

export interface UsageMeterProps {
  currentCount: number;
  limit: number;
  tier: Tier;
  onUpgradeClick?: () => void;
  className?: string;
}

const TIER_CONFIG: Record<Tier, { name: string; color: string; features: string[] }> = {
  free: {
    name: 'Free',
    color: '#6b7280',
    features: ['3 natal charts', 'Basic transits', 'Limited interpretations'],
  },
  pro: {
    name: 'Pro',
    color: '#8b5cf6',
    features: ['25 charts', 'Full transits', 'Synastry', 'PDF exports'],
  },
  premium: {
    name: 'Premium',
    color: '#f59e0b',
    features: ['1000 charts', 'All features', 'Solar/Lunar returns', 'Priority support'],
  },
};

/**
 * Calculate usage percentage
 */
function calculatePercentage(current: number, limit: number): number {
  if (limit === 0) return 100;
  return Math.min(Math.round((current / limit) * 100), 100);
}

/**
 * Determine warning level based on percentage
 */
function getWarningLevel(percentage: number): WarningLevel {
  if (percentage >= 100) return 'limit';
  if (percentage >= 80) return 'warning';
  return 'none';
}

/**
 * Get progress bar color based on warning level
 */
function getProgressColor(level: WarningLevel): string {
  switch (level) {
    case 'limit':
      return '#ef4444'; // Red
    case 'warning':
      return '#f59e0b'; // Amber/Yellow
    default:
      return '#22c55e'; // Green
  }
}

/**
 * UsageMeter Component
 */
export const UsageMeter: React.FC<UsageMeterProps> = ({
  currentCount,
  limit,
  tier,
  onUpgradeClick,
  className = '',
}) => {
  const tierConfig = TIER_CONFIG[tier];
  const percentage = calculatePercentage(currentCount, limit);
  const warningLevel = getWarningLevel(percentage);
  const progressColor = getProgressColor(warningLevel);
  const isAtLimit = warningLevel === 'limit';
  const isAtWarning = warningLevel === 'warning';

  return (
    <div
      className={`bg-white/5 dark:bg-black/20 rounded-xl p-5 border border-white/10 ${className}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:flex-row flex-col sm:items-start gap-2">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[16px]"
            style={{ color: tierConfig.color }}
            aria-hidden="true"
          >
            emoji_events
          </span>
          <span className="font-semibold text-sm" style={{ color: tierConfig.color }}>
            {tierConfig.name} Plan
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-white/70">
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
            bar_chart
          </span>
          <span>
            {currentCount} / {limit} charts
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="flex items-center gap-3 mb-3 sm:flex-row flex-col sm:items-stretch"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Storage usage: ${percentage}%`}
      >
        <div className="flex-1 h-2 bg-white/10 rounded overflow-hidden">
          <div
            className="h-full rounded transition-all duration-300"
            style={{
              width: `${percentage}%`,
              backgroundColor: progressColor,
            }}
          />
        </div>
        <span
          className="text-sm font-semibold min-w-[40px] sm:text-right text-left"
          style={{ color: progressColor }}
        >
          {percentage}%
        </span>
      </div>

      {/* Warning/Limit Messages */}
      {isAtWarning && (
        <div
          className="flex items-center gap-2 py-2.5 px-3 rounded-md text-[13px] mb-3 bg-amber-500/15 text-amber-400 border border-amber-500/30 flex-wrap"
          role="alert"
        >
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
            warning
          </span>
          <span>Approaching storage limit</span>
          {onUpgradeClick && (
            <button
              className="ml-auto sm:ml-auto ml-0 mt-0 sm:mt-0 bg-transparent border-none text-inherit underline cursor-pointer p-0 hover:opacity-80 sm:w-auto w-full sm:text-left text-center sm:bg-transparent bg-white/10 sm:py-0 py-1.5 sm:px-0 px-3 sm:rounded-none rounded sm:no-underline underline"
              onClick={onUpgradeClick}
              aria-label="Upgrade plan for more storage"
            >
              Upgrade
            </button>
          )}
        </div>
      )}

      {isAtLimit && (
        <div
          className="flex items-center gap-2 py-2.5 px-3 rounded-md text-[13px] mb-3 bg-red-500/15 text-red-400 border border-red-500/30 flex-wrap"
          role="alert"
        >
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
            warning
          </span>
          <span>Storage limit reached</span>
          {onUpgradeClick && (
            <button
              className="ml-auto sm:ml-auto ml-0 mt-0 sm:mt-0 bg-transparent border-none text-inherit underline cursor-pointer p-0 hover:opacity-80 sm:w-auto w-full sm:text-left text-center sm:bg-transparent bg-white/10 sm:py-0 py-1.5 sm:px-0 px-3 sm:rounded-none rounded sm:no-underline underline"
              onClick={onUpgradeClick}
              aria-label="Upgrade plan to create more charts"
            >
              Upgrade to create more
            </button>
          )}
        </div>
      )}

      {/* Tier Features */}
      <div className="pt-3 border-t border-white/[0.08]">
        <span className="text-xs text-white/50 block mb-2">Plan includes:</span>
        <ul className="list-none p-0 m-0 flex flex-wrap gap-1.5 gap-x-3">
          {tierConfig.features.map((feature, index) => (
            <li
              key={index}
              className="text-xs text-white/70 relative pl-3.5 before:content-['\2713'] before:absolute before:left-0 before:text-green-500"
            >
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UsageMeter;
