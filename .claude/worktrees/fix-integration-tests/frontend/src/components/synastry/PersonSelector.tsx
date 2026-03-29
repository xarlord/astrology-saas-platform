/**
 * PersonSelector Component
 * Allows selection of two charts for synastry comparison
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface Chart {
  id: string;
  name: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  sunSign?: string;
  moonSign?: string;
  ascendantSign?: string;
}

export interface PersonSelectorProps {
  charts: Chart[];
  chart1Id: string;
  chart2Id: string;
  onChart1Change: (id: string) => void;
  onChart2Change: (id: string) => void;
  onSwap?: () => void;
  onCreateNew?: () => void;
  'aria-label'?: string;
}

const getAvatarColor = (index: number): string => {
  const colors = [
    'from-primary to-primary-dark',
    'from-secondary to-pink-600',
    'from-accent-blue to-blue-600',
    'from-accent-teal to-teal-600',
  ];
  return colors[index % colors.length];
};

const PersonSelector: React.FC<PersonSelectorProps> = ({
  charts,
  chart1Id,
  chart2Id,
  onChart1Change,
  onChart2Change,
  onSwap,
  onCreateNew,
  'aria-label': ariaLabel = 'Person selector for synastry comparison',
}) => {
  const chart1 = charts.find((c) => c.id === chart1Id);
  const chart2 = charts.find((c) => c.id === chart2Id);

  const renderPersonCard = (
    chart: Chart | undefined,
    selectedId: string,
    onChange: (id: string) => void,
    personNumber: 1 | 2,
    colorTheme: 'primary' | 'secondary'
  ) => {
    const borderColor = colorTheme === 'primary' ? 'border-primary/30' : 'border-secondary/30';
    const hoverBorder = colorTheme === 'primary' ? 'hover:border-primary/50' : 'hover:border-secondary/50';
    const glowColor = colorTheme === 'primary' ? 'shadow-glow' : 'shadow-glow-pink';

    return (
      <div className="relative z-10 group">
        <motion.div
          className={`bg-card-glass backdrop-blur-xl border border-glass-border rounded-2xl p-6 flex flex-col items-center gap-4 ${borderColor} ${hoverBorder} transition-all duration-300 ${glowColor}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: personNumber * 0.1 }}
        >
          {/* Avatar */}
          <div className="relative">
            <div className={`w-24 h-24 rounded-full border-2 ${borderColor} p-1`}>
              {chart ? (
                <div
                  className={`w-full h-full rounded-full bg-gradient-to-br ${getAvatarColor(
                    charts.indexOf(chart)
                  )} flex items-center justify-center text-white text-3xl font-bold`}
                >
                  {chart.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-surface/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-slate-500">person</span>
                </div>
              )}
            </div>
          </div>

          {/* Chart Selection */}
          <div className="w-full">
            <select
              value={selectedId}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-4 py-2 bg-surface/50 border border-glass-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
              aria-label={`Select person ${personNumber}`}
            >
              <option value="">Select a chart...</option>
              {charts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chart Details */}
          {chart && (
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">{chart.name}</h3>
              {chart.birthDate && (
                <p className="text-slate-400 text-sm">
                  {new Date(chart.birthDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {chart.birthTime && ` • ${chart.birthTime}`}
                  {chart.birthPlace && ` • ${chart.birthPlace}`}
                </p>
              )}

              {/* Zodiac Signs */}
              <div className="flex gap-2 mt-3 justify-center flex-wrap">
                {chart.sunSign && (
                  <div className="px-3 py-1 rounded-full bg-surface border border-glass-border flex items-center gap-1 text-xs">
                    <span className="text-accent-gold material-symbols-outlined text-sm">light_mode</span>
                    {chart.sunSign}
                  </div>
                )}
                {chart.moonSign && (
                  <div className="px-3 py-1 rounded-full bg-surface border border-glass-border flex items-center gap-1 text-xs">
                    <span className="text-slate-300 material-symbols-outlined text-sm">dark_mode</span>
                    {chart.moonSign}
                  </div>
                )}
                {chart.ascendantSign && (
                  <div className="px-3 py-1 rounded-full bg-surface border border-glass-border flex items-center gap-1 text-xs">
                    <span className="text-slate-300 material-symbols-outlined text-sm">arrow_upward</span>
                    {chart.ascendantSign}
                  </div>
                )}
              </div>
            </div>
          )}

          {!chart && onCreateNew && (
            <button
              onClick={onCreateNew}
              className="text-primary text-sm hover:text-white transition-colors underline"
            >
              Or create new chart
            </button>
          )}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center mb-16 relative" aria-label={ariaLabel}>
      {/* Cosmic Beam Background */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent -translate-y-1/2 z-0 hidden lg:block" />

      {/* Person 1 */}
      {renderPersonCard(chart1, chart1Id, onChart1Change, 1, 'primary')}

      {/* Swap Button */}
      {onSwap && (
        <div className="relative z-20 flex justify-center">
          <motion.button
            onClick={onSwap}
            className="relative group cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Swap persons"
          >
            <div className="absolute inset-0 bg-primary blur-xl rounded-full opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center border-4 border-background-dark shadow-2xl group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-white text-4xl">swap_horiz</span>
            </div>
          </motion.button>
        </div>
      )}

      {/* Person 2 */}
      {renderPersonCard(chart2, chart2Id, onChart2Change, 2, 'secondary')}
    </div>
  );
};

export default PersonSelector;
