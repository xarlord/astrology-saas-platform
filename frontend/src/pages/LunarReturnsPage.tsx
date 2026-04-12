/**
 * LunarReturnsPage Component
 *
 * Lunar returns and monthly forecasts with:
 * - Chart selector for choosing natal chart
 * - Date picker for selecting month
 * - Results display with all lunar returns
 * - Interpretation panel with themes and rituals
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useCharts } from '../hooks/useCharts';
import { Button } from '../components/ui/Button';
import { AppLayout } from '../components';
import {
  getNextLunarReturn,
  getLunarMonthForecast,
  getLunarReturnHistory,
  type LunarMonthForecast,
  type SavedLunarReturn,
} from '../services/lunarReturn.api';

interface LunarReturn {
  date: Date;
  moonSign: string;
  moonDegree: number;
  moonMinute: number;
  house: number;
  illumination: number;
  phase: string;
  intensity: number;
}

interface LifeAreaImpact {
  area: string;
  icon: string;
  status: 'positive' | 'neutral' | 'negative';
}

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
};

export const LunarReturnsPage: React.FC = () => {
  const _navigate = useNavigate();
  const { charts } = useCharts();

  const [selectedChartId, setSelectedChartId] = useState<string>('');
  const [selectedMonth, _setSelectedMonth] = useState(new Date());
  const [journalEntries, setJournalEntries] = useState({
    emotions: '',
    home: '',
    intention: '',
  });

  // API state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLunarReturn, setCurrentLunarReturn] = useState<LunarReturn | null>(null);
  const [forecast, setForecast] = useState<LunarMonthForecast | null>(null);
  const [pastReturns, setPastReturns] = useState<SavedLunarReturn[]>([]);

  // Fetch lunar return data from API
  const fetchLunarData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch next lunar return and history in parallel
      const [nextReturnData, historyData] = await Promise.allSettled([
        getNextLunarReturn(),
        getLunarReturnHistory(1, 10),
      ]);

      // Process next return
      if (nextReturnData.status === 'fulfilled') {
        const { nextReturn, natalMoon } = nextReturnData.value;
        setCurrentLunarReturn({
          date: new Date(nextReturn),
          moonSign: natalMoon.sign,
          moonDegree: natalMoon.degree,
          moonMinute: natalMoon.minute,
          house: 4, // Default, would come from chart calculation
          illumination: 50, // Default
          phase: 'Waxing', // Default
          intensity: 70, // Default
        });
      }

      // Process history
      if (historyData.status === 'fulfilled') {
        const returns = historyData.value.returns || [];
        const now = new Date();
        // Add computed properties for timeline display
        const processedReturns = returns.map((ret) => ({
          ...ret,
          date: new Date(ret.returnDate),
          status:
            new Date(ret.returnDate) < now
              ? ('past' as const)
              : new Date(ret.returnDate).toDateString() === now.toDateString()
                ? ('current' as const)
                : ('future' as const),
          sign: ret.theme || ret.emotionalTheme || 'Unknown',
        }));
        setPastReturns(processedReturns);
      }

      // Try to fetch monthly forecast
      try {
        const forecastData = await getLunarMonthForecast(new Date());
        setForecast(forecastData);
      } catch {
        // Forecast is optional, use defaults
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load lunar return data';
      setError(errorMessage);
      // Set fallback data
      setCurrentLunarReturn({
        date: new Date(),
        moonSign: 'Pisces',
        moonDegree: 15,
        moonMinute: 32,
        house: 4,
        illumination: 72,
        phase: 'Waxing Gibbous',
        intensity: 72,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    void fetchLunarData();
  }, [fetchLunarData]);

  // Set first chart as selected when charts load
  useEffect(() => {
    if (charts.length > 0 && !selectedChartId) {
      setSelectedChartId(charts[0].id);
    }
  }, [charts, selectedChartId]);

  // Generate forecast themes from API data
  const forecastThemes = forecast
    ? [
        {
          id: 1,
          title: forecast.emotionalTheme || 'Emotional Renewal',
          icon: 'water_drop',
          color: 'pisces-teal',
          description: forecast.theme || 'A time for emotional growth and reflection.',
          dominant: true,
        },
        ...(forecast.actionAdvice || []).slice(0, 2).map((advice, idx) => ({
          id: idx + 2,
          title: advice.slice(0, 30) || 'Focus Area',
          icon: 'lightbulb',
          color: 'primary',
          description: advice,
          dominant: false,
        })),
      ]
    : [];

  // Generate life areas from predictions
  const lifeAreas: LifeAreaImpact[] = forecast?.predictions?.map((p) => ({
    area: p.category.charAt(0).toUpperCase() + p.category.slice(1),
    icon:
      p.category === 'relationships'
        ? 'favorite'
        : p.category === 'career'
          ? 'work'
          : p.category === 'finances'
            ? 'payments'
            : p.category === 'health'
              ? 'fitness_center'
              : p.category === 'spirituality'
                ? 'self_improvement'
                : 'brush',
    status: p.likelihood > 70 ? 'positive' : p.likelihood > 40 ? 'neutral' : ('negative' as const),
  })) ?? [
    { area: 'Relationships', icon: 'favorite', status: 'positive' as const },
    { area: 'Career', icon: 'work', status: 'neutral' as const },
    { area: 'Finances', icon: 'payments', status: 'neutral' as const },
    { area: 'Health', icon: 'fitness_center', status: 'positive' as const },
    { area: 'Spirituality', icon: 'self_improvement', status: 'positive' as const },
    { area: 'Creativity', icon: 'brush', status: 'positive' as const },
  ];

  const timeRemaining = useMemo(() => {
    if (!currentLunarReturn) return { days: 0, hours: 0, minutes: 0 };
    const now = new Date();
    const diff = new Date(currentLunarReturn.date).getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days: Math.max(0, days), hours: Math.max(0, hours), minutes: Math.max(0, minutes) };
  }, [currentLunarReturn]);

  const getStatusColor = (status: LifeAreaImpact['status']) => {
    switch (status) {
      case 'positive':
        return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
      case 'negative':
        return 'bg-slate-600';
      case 'neutral':
        return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <AppLayout data-testid="lunar-returns-page">
      <main className="flex-1 w-full max-w-[1280px] mx-auto p-6 md:p-8 flex flex-col gap-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            <span className="ml-3 text-slate-400">Loading lunar return data...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            <p>{error}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => void fetchLunarData()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Content - only show when not loading */}
        {!loading && currentLunarReturn && (
          <>
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary mb-1">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Current Cycle</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  Lunar Return in {currentLunarReturn.moonSign}
                </h2>
                <p className="text-slate-400 mt-2 max-w-2xl text-lg">
                  Cycle of{' '}
                  {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  {' • '}
                  Emotional Renewal & Intuition
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" size="md" className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  Past Cycles
                </Button>
                <Button variant="primary" size="md" className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">share</span>
                  Share Chart
                </Button>
              </div>
            </header>

            {/* Hero Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Lunar Return Hero Card */}
              <div className="lg:col-span-8 bg-surface-dark/70 backdrop-blur-md rounded-2xl p-8 relative overflow-hidden">
                {/* Background ambient glow */}
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                  <div className="flex-1 space-y-6">
                    <div>
                      <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">
                        Time Remaining in Phase
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 font-display tabular-nums">
                          {timeRemaining.days}
                          <span className="text-lg text-slate-500 mx-1">d</span>{' '}
                          {timeRemaining.hours}
                          <span className="text-lg text-slate-500 mx-1">h</span>{' '}
                          {timeRemaining.minutes}
                          <span className="text-lg text-slate-500 mx-1">m</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white font-medium">Cycle Progress</span>
                        <span className="text-primary font-bold">35%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-cosmic-blue w-[35%] rounded-full shadow-[0_0_15px_rgba(107,61,225,0.5)]" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <div className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06B6D4]" />
                        <span className="text-xs font-medium text-slate-200">
                          Moon in {currentLunarReturn.moonSign}
                        </span>
                      </div>
                      <div className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs text-primary">
                          brightness_6
                        </span>
                        <span className="text-xs font-medium text-slate-200">
                          {currentLunarReturn.phase}
                        </span>
                      </div>
                      <div className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs text-yellow-400">
                          light_mode
                        </span>
                        <span className="text-xs font-medium text-slate-200">
                          {currentLunarReturn.illumination}% Illumination
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Moon */}
                  <div className="relative w-48 h-48 md:w-56 md:h-56 flex-shrink-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] animate-pulse" />
                    <svg
                      className="w-full h-full drop-shadow-[0_0_15px_rgba(168,135,253,0.5)]"
                      viewBox="0 0 100 100"
                    >
                      <circle cx="50" cy="50" fill="#1e1b2e" r="45" />
                      <path
                        d="M50 5 A45 45 0 1 1 50 95 A30 45 0 1 0 50 5 Z"
                        fill="url(#moonGradient)"
                      />
                      <defs>
                        <linearGradient id="moonGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                          <stop offset="0%" style={{ stopColor: '#4a3b75', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#a887fd', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Chart Analysis Module */}
              <div className="lg:col-span-4 bg-surface-dark/70 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-white">Chart Analysis</h3>
                  <div className="flex flex-col items-end">
                    <span className="text-3xl font-bold text-primary">
                      {currentLunarReturn.intensity}
                      <span className="text-lg text-slate-500 font-normal">/100</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Intensity Score
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Mini Wheel SVG */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" fill="none" r="45" stroke="#2d214a" strokeWidth="1" />
                      <circle
                        cx="50"
                        cy="50"
                        fill="none"
                        r="45"
                        stroke="#a887fd"
                        strokeDasharray={`${(currentLunarReturn.intensity / 100) * 283} 283`}
                        strokeWidth="4"
                      />
                      <line stroke="#2d214a" strokeWidth="1" x1="50" x2="50" y1="5" y2="95" />
                      <line stroke="#2d214a" strokeWidth="1" x1="5" x2="95" y1="50" y2="50" />
                      <circle cx="50" cy="50" fill="#151023" r="30" stroke="#2d214a" />
                      <text
                        alignmentBaseline="central"
                        fill="white"
                        fontSize="16"
                        textAnchor="middle"
                        transform="rotate(90 50 50)"
                        x="50"
                        y="50"
                      >
                        {ZODIAC_SYMBOLS[currentLunarReturn.moonSign] || '?'}
                      </text>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-slate-400">Key Placement</div>
                    <div className="text-xl font-bold text-white">
                      {currentLunarReturn.moonSign} {currentLunarReturn.moonDegree}°
                      {currentLunarReturn.moonMinute}&apos;
                    </div>
                    <div className="text-sm text-cyan-400 font-medium">
                      {currentLunarReturn.house}
                      {currentLunarReturn.house === 1
                        ? 'st'
                        : currentLunarReturn.house === 2
                          ? 'nd'
                          : currentLunarReturn.house === 3
                            ? 'rd'
                            : 'th'}{' '}
                      House of Home
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">
                    Key Aspects
                  </p>
                  {[
                    { aspect: 'Moon Trine Venus', type: 'Harmony', color: 'green' },
                    { aspect: 'Moon Square Mars', type: 'Tension', color: 'red' },
                    { aspect: 'Moon Sextile Jupiter', type: 'Support', color: 'blue' },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={clsx(
                            'w-6 h-6 rounded flex items-center justify-center material-symbols-outlined text-sm',
                            item.color === 'green' && 'bg-green-500/20 text-green-400',
                            item.color === 'red' && 'bg-red-500/20 text-red-400',
                            item.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                          )}
                        >
                          {item.type === 'Harmony'
                            ? 'change_history'
                            : item.type === 'Tension'
                              ? 'square'
                              : 'emergency'}
                        </span>
                        <span className="text-sm text-slate-200">{item.aspect}</span>
                      </div>
                      <span
                        className={clsx(
                          'text-xs font-bold px-2 py-0.5 rounded',
                          item.color === 'green' && 'bg-green-500/10 text-green-400',
                          item.color === 'red' && 'bg-red-500/10 text-red-400',
                          item.color === 'blue' && 'bg-blue-500/10 text-blue-400',
                        )}
                      >
                        {item.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Forecast Themes */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  Forecast Themes
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {forecastThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className="bg-surface-dark border border-white/5 p-5 rounded-xl hover:border-primary/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={clsx(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          theme.color === 'pisces-teal' && 'bg-cyan-400/20 text-cyan-400',
                          theme.color === 'primary' && 'bg-primary/20 text-primary',
                          theme.color === 'cosmic-blue' && 'bg-cosmic-blue/20 text-cosmic-blue',
                        )}
                      >
                        <span className="material-symbols-outlined">{theme.icon}</span>
                      </div>
                      {theme.dominant && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/5 px-2 py-1 rounded">
                          Dominant
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                      {theme.title}
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{theme.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Life Areas Grid */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <h3 className="text-xl font-bold text-white">Life Areas Impact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {lifeAreas.map((area, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-surface-dark/50 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">
                          {area.icon}
                        </span>
                        <span className="text-sm font-medium text-slate-200">{area.area}</span>
                      </div>
                      <span className={clsx('w-2 h-2 rounded-full', getStatusColor(area.status))} />
                    </div>
                  ))}
                </div>

                {/* History Timeline */}
                <div className="mt-4 p-6 rounded-xl border border-white/5 bg-surface-dark/30">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Past Returns
                    </h4>
                    <a className="text-xs text-primary hover:underline cursor-pointer">
                      View All History
                    </a>
                  </div>
                  <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute top-[22px] left-0 right-0 h-[1px] bg-white/10 z-0" />
                    <div className="flex justify-between relative z-10 overflow-x-auto pb-2 gap-8">
                      {pastReturns.map((ret, index) => (
                        <div key={index} className="flex flex-col items-center gap-3 min-w-[100px]">
                          <div
                            className={clsx(
                              'w-3 h-3 rounded-full',
                              ret.status === 'current'
                                ? 'bg-primary shadow-[0_0_8px_rgba(168,135,253,0.8)]'
                                : ret.status === 'past'
                                  ? 'bg-surface-dark border-2 border-slate-600'
                                  : 'bg-surface-dark border-2 border-white/20',
                            )}
                          />
                          <div className="text-center">
                            <div
                              className={clsx(
                                'text-xs font-bold',
                                ret.status === 'current' ? 'text-primary' : 'text-slate-400',
                                ret.status === 'future' && 'text-slate-600',
                              )}
                            >
                              {(ret.date ?? ret.returnDate).toLocaleDateString('en-US', {
                                month: 'short',
                                year: '2-digit',
                              })}
                            </div>
                            <div
                              className={clsx(
                                'text-[10px] mt-1',
                                ret.status === 'current' ? 'text-primary/80' : 'text-slate-500',
                                ret.status === 'future' && 'text-slate-700',
                              )}
                            >
                              {ret.sign}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rituals & Journal */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Rituals */}
                <div className="bg-gradient-to-br from-surface-dark to-background-dark p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <span className="material-symbols-outlined text-6xl">spa</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-cyan-400">diamond</span>
                    Recommended Rituals
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex gap-3 items-start">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                      <div>
                        <h5 className="text-sm font-bold text-slate-200">Salt Bath Cleansing</h5>
                        <p className="text-xs text-slate-400 mt-1">
                          Use Epsom salts and lavender to purify emotional stagnation.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                      <div>
                        <h5 className="text-sm font-bold text-slate-200">Dream Journaling</h5>
                        <p className="text-xs text-slate-400 mt-1">
                          Keep a notebook by your bed. Your subconscious is loud right now.
                        </p>
                      </div>
                    </li>
                  </ul>
                  <button className="w-full mt-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white uppercase tracking-wider transition-colors">
                    View Ritual Guide
                  </button>
                </div>

                {/* Journal Prompts */}
                <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 flex flex-col h-full">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                    Reflections
                  </h3>
                  <div className="space-y-4 flex-1">
                    {[
                      { label: 'What emotions have surfaced recently?', key: 'emotions' },
                      { label: 'Where do you feel most at home?', key: 'home' },
                      { label: 'One intention for this cycle:', key: 'intention' },
                    ].map((prompt) => (
                      <div key={prompt.key} className="group">
                        <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                          {prompt.label}
                        </label>
                        <input
                          type="text"
                          value={journalEntries[prompt.key as keyof typeof journalEntries]}
                          onChange={(e) =>
                            setJournalEntries((prev) => ({ ...prev, [prompt.key]: e.target.value }))
                          }
                          placeholder="Type your thoughts..."
                          className="w-full bg-gradient-to-br from-[#0B0D17] to-[#141627] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </AppLayout>
  );
};

export default LunarReturnsPage;
