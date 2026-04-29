/**
 * Transit Forecast Page
 * Modern transit forecast page with timeline and energy graph
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TransitTimelineCard from '../components/astrology/TransitTimelineCard';
import TransitChart, { TransitDataPoint } from '../components/transit/TransitChart';
import EnergyMeter from '../components/astrology/EnergyMeter';
import { transitService } from '../services/transit.service';
import { chartService } from '../services/chart.service';
import { AppLayout } from '../components/AppLayout';
import { SkeletonLoader, EmptyState } from '../components';
import type { Transit, TransitChart as TransitChartType } from '../services/api.types';

interface Chart {
  id: string;
  name: string;
}

interface TransitEvent {
  id: string;
  date: string;
  time?: string;
  title: string;
  description: string;
  type: 'favorable' | 'challenging' | 'neutral' | 'major';
  impact: 'low' | 'moderate' | 'high';
  tags?: string[];
  orb?: number;
}

interface CurrentTransit {
  planet: string;
  sign: string;
  degree: number;
  retrograde: boolean;
}

/**
 * Transform API Transit type to component TransitEvent type
 */
function transformTransitToEvent(transit: Transit): TransitEvent {
  // Map API impact to component impact
  const mapImpact = (impact?: string): 'low' | 'moderate' | 'high' => {
    if (impact === 'positive') return 'high';
    if (impact === 'negative') return 'moderate';
    return 'low';
  };

  // Map API TransitType to component type
  const mapType = (
    transitType: string,
    impact?: string,
  ): 'favorable' | 'challenging' | 'neutral' | 'major' => {
    if (transitType === 'major') return 'major';
    if (impact === 'positive') return 'favorable';
    if (impact === 'negative') return 'challenging';
    return 'neutral';
  };

  // Generate title from planet and aspect
  const title = transit.title ?? `${transit.planet}${transit.aspect ? ` ${transit.aspect}` : ''}`;

  // Use peak_date or fall back to start_date
  const date = transit.peak_date ?? transit.start_date;

  return {
    id: transit.id,
    date,
    title,
    description: transit.influence?.overall ?? transit.description ?? '',
    type: mapType(transit.type, transit.impact),
    impact: mapImpact(transit.impact),
    tags: transit.aspect ? [transit.aspect] : undefined,
    orb: transit.intensity,
  };
}

/**
 * Generate energy data points from a single energy level
 */
function generateEnergyData(
  energyLevel: number,
  startDate: string,
  endDate: string,
  transits: Transit[],
): TransitDataPoint[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: TransitDataPoint[] = [];

  // Create a map of transit dates for marking major events
  const transitDates = new Map<string, Transit>();
  transits.forEach((t) => {
    const peakDate = t.peak_date || t.start_date;
    if (peakDate) {
      transitDates.set(peakDate.split('T')[0], t);
    }
  });

  // Generate data points for each day
  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const transit = transitDates.get(dateStr);

    // Add some variance to the energy level based on the day
    const dayVariance = Math.sin(current.getDate() / 5) * 10;
    const baseEnergy = Math.max(0, Math.min(100, energyLevel + dayVariance));

    days.push({
      date: dateStr,
      energy: Math.round(baseEnergy),
      isMajorEvent: transit?.type === 'major',
      eventName:
        transit?.title ?? `${transit?.planet}${transit?.aspect ? ` ${transit.aspect}` : ''}`,
      eventDescription: transit?.influence?.overall,
    });

    current.setDate(current.getDate() + 1);
  }

  return days;
}

const TransitForecastPage: React.FC = () => {
  const navigate = useNavigate();
  const [charts, setCharts] = useState<Chart[]>([]);
  const [selectedChartId, setSelectedChartId] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [duration, setDuration] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<TransitEvent[]>([]);
  const [energyData, setEnergyData] = useState<TransitDataPoint[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    majorOnly: false,
    minImpact: 'low' as 'low' | 'moderate' | 'high',
    showFavorable: true,
    showChallenging: true,
    showNeutral: true,
  });
  const [summaryStats, setSummaryStats] = useState({
    totalTransits: 0,
    majorAspects: 0,
    bestDay: { date: '', score: 0 },
    worstDay: { date: '', score: 0 },
  });
  const [currentTransits, setCurrentTransits] = useState<CurrentTransit[]>([]);
  const [loadingCurrentTransits, setLoadingCurrentTransits] = useState(false);

  useEffect(() => {
    void loadCharts();
    void loadCurrentTransits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedChartId) {
      void loadTransits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChartId, startDate, endDate]);

  const loadCharts = async () => {
    try {
      setLoading(true);
      const { charts: loadedCharts } = await chartService.getCharts();
      setCharts(loadedCharts);
      if (loadedCharts.length > 0 && !selectedChartId) {
        setSelectedChartId(loadedCharts[0].id);
      }
    } catch (err) {
      console.error('Error loading charts:', err);
      setError('Failed to load charts');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentTransits = useCallback(async () => {
    try {
      setLoadingCurrentTransits(true);
      const data = await transitService.getTodayTransits();

      // Transform transits to current positions
      const positions: CurrentTransit[] = data.transits.map((transit) => ({
        planet: transit.planet,
        sign: transit.aspect ?? '',
        degree: transit.intensity ?? 0,
        retrograde: false,
      }));

      setCurrentTransits(positions);
    } catch (err) {
      console.error('Error loading current transits:', err);
      // Don't set main error for sidebar - just log it
    } finally {
      setLoadingCurrentTransits(false);
    }
  }, []);

  const loadTransits = async () => {
    if (!selectedChartId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch transit data from API
      const data: TransitChartType = await transitService.calculateTransits(
        selectedChartId,
        startDate,
        endDate,
      );

      // Transform API Transit[] to component TransitEvent[]
      const transitEvents: TransitEvent[] = (data.transits || []).map(transformTransitToEvent);
      setEvents(transitEvents);

      // Generate energy data from the single energy_level value
      const energyPoints = generateEnergyData(
        data.energy_level || 50,
        startDate,
        endDate,
        data.transits || [],
      );
      setEnergyData(energyPoints);

      // Find best and worst days from energy data
      const sortedByEnergy = [...energyPoints].sort((a, b) => b.energy - a.energy);
      const bestDay = sortedByEnergy[0] || { date: '', energy: 0 };
      const worstDay = sortedByEnergy[sortedByEnergy.length - 1] || { date: '', energy: 0 };

      // Calculate summary stats
      setSummaryStats({
        totalTransits: transitEvents.length,
        majorAspects: transitEvents.filter((e) => e.type === 'major').length,
        bestDay: { date: bestDay.date, score: bestDay.energy },
        worstDay: { date: worstDay.date, score: worstDay.energy },
      });
    } catch (err) {
      console.error('Error loading transits:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transit data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDurationChange = (newDuration: 'week' | 'month' | 'quarter' | 'year') => {
    setDuration(newDuration);
    const today = new Date();
    const end = new Date(today);

    switch (newDuration) {
      case 'week':
        end.setDate(end.getDate() + 7);
        break;
      case 'month':
        end.setDate(end.getDate() + 30);
        break;
      case 'quarter':
        end.setDate(end.getDate() + 90);
        break;
      case 'year':
        end.setDate(end.getDate() + 365);
        break;
    }

    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const filteredEvents = events.filter((event) => {
    if (filters.majorOnly && event.type !== 'major') return false;
    if (filters.minImpact === 'moderate' && event.impact === 'low') return false;
    if (filters.minImpact === 'high' && event.impact !== 'high') return false;
    if (!filters.showFavorable && event.type === 'favorable') return false;
    if (!filters.showChallenging && event.type === 'challenging') return false;
    if (!filters.showNeutral && event.type === 'neutral') return false;
    return true;
  });

  if (loading && charts.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <SkeletonLoader variant="card" count={3} />
        </div>
      </AppLayout>
    );
  }

  if (charts.length === 0) {
    return (
      <AppLayout>
        <EmptyState
          icon="🌙"
          title="No charts available"
          description="Transit forecasts require a natal chart. Create your chart first to view your transits."
          actionText="Create Chart"
          onAction={() => navigate('/charts/new')}
          secondaryActionText="Back to Dashboard"
          onSecondaryAction={() => navigate('/dashboard')}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header & Date Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">Transit Forecast</h2>
            <p className="text-slate-400">
              Daily planetary influences for{' '}
              {charts.find((c) => c.id === selectedChartId)?.name ?? 'your chart'}
            </p>
          </div>

          {/* Date Range Toggle */}
          <div
            className="glass-panel p-1 rounded-xl flex items-center"
            data-testid="duration-buttons"
          >
            {(['week', 'month', 'quarter', 'year'] as const).map((d) => (
              <button
                key={d}
                onClick={() => handleDurationChange(d)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  duration === d
                    ? 'bg-primary text-white shadow-[0_0_10px_rgba(107,61,225,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                data-testid={`duration-${d}`}
              >
                {d === 'week'
                  ? 'This Week'
                  : d === 'month'
                    ? 'This Month'
                    : d === 'quarter'
                      ? '3 Months'
                      : 'This Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Selector & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-grow">
            <label className="block text-sm text-slate-400 mb-2">Select Chart</label>
            <select
              value={selectedChartId}
              onChange={(e) => setSelectedChartId(e.target.value)}
              className="w-full px-4 py-2 bg-surface border border-glass-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              data-testid="chart-selector"
            >
              {charts.map((chart) => (
                <option key={chart.id} value={chart.id}>
                  {chart.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 bg-surface border border-glass-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                data-testid="start-date-input"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 bg-surface border border-glass-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                data-testid="end-date-input"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-surface border border-glass-border rounded-lg text-white hover:bg-white/5 transition-colors flex items-center gap-2"
              data-testid="filters-toggle-button"
            >
              <span className="material-symbols-outlined">tune</span>
              Filters
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-6 glass-panel rounded-xl"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.majorOnly}
                      onChange={(e) => setFilters({ ...filters, majorOnly: e.target.checked })}
                      className="rounded bg-surface border-glass-border text-primary focus:ring-primary"
                    />
                    Major aspects only
                  </label>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Minimum Impact</label>
                  <select
                    value={filters.minImpact}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilters({ ...filters, minImpact: value as 'low' | 'moderate' | 'high' });
                    }}
                    className="w-full px-3 py-2 bg-surface border border-glass-border rounded-lg text-white text-sm"
                  >
                    <option value="low">All</option>
                    <option value="moderate">Moderate+</option>
                    <option value="high">High Only</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">Show Types</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.showFavorable}
                        onChange={(e) =>
                          setFilters({ ...filters, showFavorable: e.target.checked })
                        }
                        className="rounded bg-surface border-glass-border text-green-500 focus:ring-green-500"
                      />
                      Favorable
                    </label>
                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.showChallenging}
                        onChange={(e) =>
                          setFilters({ ...filters, showChallenging: e.target.checked })
                        }
                        className="rounded bg-surface border-glass-border text-red-500 focus:ring-red-500"
                      />
                      Challenging
                    </label>
                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.showNeutral}
                        onChange={(e) => setFilters({ ...filters, showNeutral: e.target.checked })}
                        className="rounded bg-surface border-glass-border text-blue-500 focus:ring-blue-500"
                      />
                      Neutral
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
            </div>
            <p className="text-white">Loading transit data...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Timeline & Chart */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Energy Meter */}
                <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-8xl">bolt</span>
                  </div>
                  <div className="flex items-center gap-6 relative z-10">
                    <EnergyMeter
                      value={summaryStats.bestDay.score || 70}
                      size="md"
                      label="Score"
                      aria-label="Daily energy level"
                    />
                    <div>
                      <div className="text-primary text-sm font-bold uppercase tracking-widest mb-1">
                        {summaryStats.bestDay.date
                          ? new Date(summaryStats.bestDay.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Today'}
                      </div>
                      <h3 className="text-2xl font-bold text-white leading-tight">
                        {summaryStats.bestDay.score >= 70
                          ? 'High Energy'
                          : summaryStats.bestDay.score >= 40
                            ? 'Moderate Energy'
                            : 'Low Energy'}
                      </h3>
                      <p className="text-slate-400 text-sm mt-1">
                        {summaryStats.bestDay.score >= 70
                          ? 'Great for initiating new projects'
                          : 'Good for reflection and planning'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="glass-panel rounded-2xl p-6">
                  <h4 className="text-white font-bold mb-4">Forecast Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Total Transits</span>
                      <span className="text-white font-bold">{summaryStats.totalTransits}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Major Aspects</span>
                      <span className="text-accent-gold font-bold">
                        {summaryStats.majorAspects}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Best Day</span>
                      <span className="text-accent-green font-bold">
                        {summaryStats.bestDay.date
                          ? new Date(summaryStats.bestDay.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Most Challenging</span>
                      <span className="text-accent-red font-bold">
                        {summaryStats.worstDay.date
                          ? new Date(summaryStats.worstDay.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Energy Chart */}
              {energyData.length > 0 && (
                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Energy Levels Over Time</h3>
                  <TransitChart
                    data={energyData}
                    height={300}
                    onDataPointClick={(_point) => {
                      /* handle data point click */
                    }}
                  />
                </div>
              )}

              {/* Timeline */}
              <div className="relative pl-4">
                {/* Vertical Glow Line */}
                <div className="absolute left-[27px] top-4 bottom-0 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-transparent shadow-[0_0_15px_rgba(107,61,225,0.5)] z-0"></div>

                {/* Events */}
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block">
                      event_busy
                    </span>
                    <p>No transits match your current filters</p>
                  </div>
                ) : (
                  filteredEvents.map((event, index) => (
                    <div
                      key={event.id ?? index}
                      className="relative z-10 mb-8"
                      data-testid="transit-item"
                    >
                      <TransitTimelineCard
                        time={
                          event.time ??
                          new Date(event.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        }
                        date={event.date}
                        title={event.title}
                        description={event.description}
                        type={event.type}
                        tags={event.tags}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Mini Calendar */}
              <div className="glass-panel rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-bold text-lg">
                    {new Date(startDate).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h4>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-[10px] uppercase text-slate-500 font-bold">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">{/* Calendar days would go here */}</div>
              </div>

              {/* Planetary Positions */}
              <div className="glass-panel rounded-xl p-0 overflow-hidden">
                <div className="p-4 border-b border-white/5">
                  <h4 className="text-white font-bold text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">share</span>
                    Current Transits
                  </h4>
                </div>
                <div className="p-4">
                  {loadingCurrentTransits ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  ) : currentTransits.length > 0 ? (
                    <div className="space-y-3">
                      {currentTransits.map((transit, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-medium">{transit.planet}</span>
                            {transit.retrograde && (
                              <span className="text-xs text-amber-400">R</span>
                            )}
                          </div>
                          <span className="text-slate-400">
                            {transit.sign}{' '}
                            {transit.degree > 0 ? `${transit.degree.toFixed(1)}deg` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No current transit data available.</p>
                  )}
                </div>
              </div>

              {/* Personalized Insight */}
              <div className="glass-panel rounded-xl p-5 border border-primary/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  <h4 className="text-white font-bold">Personalized Insight</h4>
                </div>
                <ul className="space-y-3 mb-6 relative z-10">
                  {events.slice(0, 3).map((event, i) => (
                    <li key={i} className="flex gap-3 items-start text-sm text-slate-300">
                      <span className="text-primary mt-1 text-[10px]">●</span>
                      <span>{event.description}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    const path = `/analysis/${selectedChartId}`;
                    navigate(path);
                  }}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-accent-blue text-white font-bold text-sm shadow-[0_4px_14px_rgba(107,61,225,0.4)] hover:shadow-[0_6px_20px_rgba(107,61,225,0.6)] hover:-translate-y-0.5 transition-all relative z-10"
                >
                  View Full Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TransitForecastPage;
