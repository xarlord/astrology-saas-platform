/**
 * ChartCard Component
 *
 * Displays chart summary with Big Three badges, hover action buttons,
 * and click to view details functionality
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import type { Chart } from '../../services/api.types';

export interface ChartCardProps {
  chart: Chart;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
  className?: string;
}

const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

const ELEMENT_COLORS: Record<string, string> = {
  fire: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  earth: 'bg-green-500/20 text-green-400 border-green-500/30',
  air: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  water: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const TAG_COLORS: Record<string, string> = {
  Self: 'bg-primary/10 text-primary',
  Family: 'bg-cosmic-blue/10 text-cosmic-blue',
  Friends: 'bg-green-500/10 text-green-400',
  Clients: 'bg-purple-500/10 text-purple-400',
  Default: 'bg-slate-800 text-slate-400',
};

export const ChartCard: React.FC<ChartCardProps> = ({ chart, onDelete, onShare, className }) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleClick = () => {
    navigate(`/charts/${chart.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      onDelete?.(chart.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/charts/${chart.id}/edit`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(chart.id);
  };

  // Get Big Three from chart data
  // positions is an array, so we need to find the planets
  const getPlanetSign = (planetName: string): string => {
    if (!chart.positions) return 'Unknown';
    const planet = chart.positions.find((p) => p.name.toLowerCase() === planetName.toLowerCase());
    return planet?.sign ?? 'Unknown';
  };

  const sunSign = getPlanetSign('Sun');
  const moonSign = getPlanetSign('Moon');
  const risingSign = getPlanetSign('Ascendant');

  const sunSymbol = ZODIAC_SYMBOLS[sunSign.toLowerCase()] ?? '?';
  const moonSymbol = ZODIAC_SYMBOLS[moonSign.toLowerCase()] ?? '?';
  const risingSymbol = ZODIAC_SYMBOLS[risingSign.toLowerCase()] ?? '?';

  // Format date
  const formattedDate = chart.birthData?.birthDate
    ? new Date(chart.birthData.birthDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown date';

  const location = chart.birthData?.birthPlace ?? 'Unknown location';

  // Get chart icon based on type
  const getChartIcon = () => {
    if (chart.tags?.includes('Default')) return 'star';
    if (chart.tags?.includes('Family')) return 'favorite';
    if (chart.tags?.includes('Friends')) return 'group';
    if (chart.tags?.includes('Clients')) return 'work';
    return 'wb_sunny';
  };

  const chartIcon = getChartIcon();
  const primaryTag = chart.tags?.find((tag) => TAG_COLORS[tag]) ?? chart.tags?.[0];
  const _tagColor = primaryTag ? TAG_COLORS[primaryTag] : TAG_COLORS.Default;

  return (
    <div
      className={clsx(
        'group relative bg-card-dark rounded-2xl border border-slate-800 p-6',
        'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20',
        'transition-all duration-300 cursor-pointer',
        className,
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`View ${chart.name}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={clsx(
            'w-14 h-14 rounded-2xl flex items-center justify-center border transition-all',
            ELEMENT_COLORS[chart.element?.toLowerCase() ?? 'fire'],
          )}
        >
          <span className="material-symbols-outlined text-3xl">{chartIcon}</span>
        </div>

        {/* Hover Actions */}
        <div className={clsx('flex gap-1 transition-opacity', 'opacity-0 group-hover:opacity-100')}>
          <button
            onClick={handleEdit}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
            aria-label="Edit chart"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button
            onClick={(e) => {
              void handleShare(e);
            }}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
            aria-label="Share chart"
          >
            <span className="material-symbols-outlined text-lg">share</span>
          </button>
          <button
            onClick={(e) => {
              void handleDelete(e);
            }}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showDeleteConfirm
                ? 'bg-red-500 text-white'
                : 'hover:bg-red-500/20 text-slate-400 hover:text-red-400',
            )}
            aria-label={showDeleteConfirm ? 'Confirm delete' : 'Delete chart'}
          >
            <span className="material-symbols-outlined text-lg">
              {showDeleteConfirm ? 'check' : 'delete'}
            </span>
          </button>
        </div>
      </div>

      {/* Chart Info */}
      <div className="space-y-1 mb-6">
        <h3 className="text-xl font-bold text-slate-100 group-hover:text-primary transition-colors">
          {chart.name}
        </h3>
        <p className="text-sm text-slate-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">calendar_month</span>
          {formattedDate} • {location}
        </p>
      </div>

      {/* Big Three */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/50 border border-slate-800/50">
          <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Sun</span>
          <span className="text-xs font-bold text-cosmic-gold">
            {sunSymbol} {sunSign.slice(0, 3)}
          </span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/50 border border-slate-800/50">
          <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Moon</span>
          <span className="text-xs font-bold text-slate-300">
            {moonSymbol} {moonSign.slice(0, 3)}
          </span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/50 border border-slate-800/50">
          <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Rising</span>
          <span className="text-xs font-bold text-slate-300">
            {risingSymbol} {risingSign.slice(0, 3)}
          </span>
        </div>
      </div>

      {/* Tags */}
      {chart.tags && chart.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chart.tags.map((tag) => (
            <span
              key={tag}
              className={clsx(
                'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                TAG_COLORS[tag] ?? TAG_COLORS.Default,
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-red-500/90 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <p className="text-white font-bold mb-2">Delete chart?</p>
            <p className="text-white/80 text-sm mb-4">This cannot be undone</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  void handleDelete(e);
                }}
                className="px-4 py-2 bg-white hover:bg-white/90 rounded-lg text-red-600 text-sm font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartCard;
