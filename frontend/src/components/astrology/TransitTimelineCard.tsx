/**
 * TransitTimelineCard Component
 * Display transit event with time, type, and impact level
 */

import React from 'react';
import { motion } from 'framer-motion';

export type TransitType = 'favorable' | 'challenging' | 'neutral' | 'major';
export type TransitIconType = 'check_circle' | 'warning' | 'info' | 'star';

export interface TransitTimelineCardProps {
  time: string;
  date?: string;
  title: string;
  description: string;
  type: TransitType;
  icon?: TransitIconType;
  impact?: 'low' | 'moderate' | 'high'; // _impact - reserved for future use
  tags?: string[];
  onClick?: () => void;
  'aria-label'?: string;
}

const TRANSIT_CONFIG: Record<
  TransitType,
  { color: string; bgColor: string; label: string; icon: TransitIconType }
> = {
  favorable: {
    color: '#22c55e',
    bgColor: 'bg-emerald-500/10',
    label: 'Favorable',
    icon: 'check_circle',
  },
  challenging: {
    color: '#ef4444',
    bgColor: 'bg-rose-500/10',
    label: 'Challenging',
    icon: 'warning',
  },
  neutral: { color: '#3b82f6', bgColor: 'bg-blue-500/10', label: 'Neutral', icon: 'info' },
  major: { color: '#fbbf24', bgColor: 'bg-yellow-500/10', label: 'Major', icon: 'star' },
};

const TransitTimelineCard: React.FC<TransitTimelineCardProps> = ({
  time,
  date,
  title,
  description,
  type,
  icon,
  impact: _impact, // Reserved for future use
  tags = [],
  onClick,
  'aria-label': ariaLabel,
}) => {
  const config = TRANSIT_CONFIG[type];
  const iconType = icon ?? config.icon;

  return (
    <motion.div
      className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-white/5"
      onClick={onClick}
      whileHover={{ x: 4 }}
      aria-label={ariaLabel ?? title}
      role="button"
      tabIndex={0}
    >
      {/* Date Column */}
      <div className="flex flex-col items-center justify-center min-w-[50px] text-center">
        {date && (
          <span className="text-xs font-bold text-slate-400 uppercase">
            {new Date(date).toLocaleString('default', { month: 'short' })}
          </span>
        )}
        <span className="text-lg font-bold text-white">
          {date ? new Date(date).getDate() : time}
        </span>
      </div>

      {/* Icon */}
      <div
        className="size-10 rounded-full bg-surface-dark flex items-center justify-center border border-white/10"
        style={{ color: config.color }}
      >
        <span className="material-symbols-outlined text-[20px]">{iconType}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-semibold text-sm group-hover:text-primary transition-colors">
          {title}
        </h4>
        <p className="text-slate-400 text-xs line-clamp-1">{description}</p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Type Badge */}
      <span
        className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded border border-opacity-20 whitespace-nowrap ${config.bgColor}`}
        style={{ color: config.color, borderColor: config.color }}
      >
        {config.label}
      </span>
    </motion.div>
  );
};

export default TransitTimelineCard;
