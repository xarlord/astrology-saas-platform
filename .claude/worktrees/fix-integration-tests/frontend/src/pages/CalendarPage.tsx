/**
 * Calendar Page Component
 *
 * Full astrological calendar with moon phases, transits, and cosmic events
 * Reference: stitch-UI/desktop/05-calendar-page.html
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import { useCalendar } from '../hooks/useCalendar';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

// Components
import CalendarCell from '../components/astrology/CalendarCell';
import { Button } from '../components/ui/Button';

// Types
import type { CalendarEvent, LunarPhase } from '../services/api.types';

// Event type colors
const EVENT_TYPE_COLORS: Record<string, string> = {
  'new-moon': '#C0C0C0',
  'full-moon': '#FFD700',
  'lunar-phase': '#94a3b8',
  'retrograde': '#FF6B6B',
  'eclipse': '#F59E0B',
  'ingress': '#4D96FF',
  'transit': '#6b3de1',
  'aspect': '#a855f7',
  'custom': '#22c55e',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  'new-moon': 'New Moon',
  'full-moon': 'Full Moon',
  'lunar-phase': 'Moon Phase',
  'retrograde': 'Retrograde',
  'eclipse': 'Eclipse',
  'ingress': 'Ingress',
  'transit': 'Transit',
  'aspect': 'Aspect',
  'custom': 'Custom',
};

// Event Detail Panel Component
interface EventDetailPanelProps {
  date: Date | null;
  events: readonly CalendarEvent[];
  lunarPhase?: LunarPhase;
  energyLevel: number;
  onClose: () => void;
  isOpen: boolean;
}

const EventDetailPanel: React.FC<EventDetailPanelProps> = ({
  date,
  events,
  lunarPhase,
  energyLevel,
  onClose,
  isOpen,
}) => {
  if (!date) return null;

  const formatDate = (d: Date): string => {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isToday = (d: Date): boolean => {
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-[#141627] border-l border-[#2f2645] shadow-2xl z-50 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-panel-title"
          >
            <div className="sticky top-0 bg-[#141627]/95 backdrop-blur-md border-b border-[#2f2645] p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 id="event-panel-title" className="text-xl font-bold text-white">
                    {formatDate(date)}
                  </h2>
                  {isToday(date) && (
                    <span className="inline-block px-2 py-1 bg-primary text-white text-xs font-bold rounded mt-1">
                      Today
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Close panel"
                  data-testid="close-event-panel"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Energy Level */}
              {energyLevel > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Daily Cosmic Energy</span>
                      <span className="text-sm font-bold text-white">{energyLevel}%</span>
                    </div>
                    <div className="h-2 bg-[#0B0D17] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-[#8b5cf6]"
                        initial={{ width: 0 }}
                        animate={{ width: `${energyLevel}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Moon Phase */}
              {lunarPhase && (
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Moon Phase
                  </h3>
                  <div className="flex items-center gap-4 p-4 bg-[#0B0D17] rounded-xl border border-white/5">
                    <div className="text-4xl">
                      {lunarPhase.phase === 'new-moon' && '🌑'}
                      {lunarPhase.phase === 'waxing-crescent' && '🌒'}
                      {lunarPhase.phase === 'first-quarter' && '🌓'}
                      {lunarPhase.phase === 'waxing-gibbous' && '🌔'}
                      {lunarPhase.phase === 'full-moon' && '🌕'}
                      {lunarPhase.phase === 'waning-gibbous' && '🌖'}
                      {lunarPhase.phase === 'last-quarter' && '🌗'}
                      {lunarPhase.phase === 'waning-crescent' && '🌘'}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold">
                        {EVENT_TYPE_LABELS[lunarPhase.phase] ?? lunarPhase.phase}
                      </div>
                      <div className="text-sm text-slate-400">
                        {lunarPhase.illumination}% illuminated • {lunarPhase.sign}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Events List */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Events ({events.length})
                </h3>

                {events.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                    <p className="text-sm">No cosmic events today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-[#0B0D17] rounded-xl border border-white/5 hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="size-2 rounded-full mt-2 flex-shrink-0"
                            style={{ backgroundColor: EVENT_TYPE_COLORS[event.event_type] ?? '#6b3de1' }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="text-white font-semibold text-sm truncate">
                                {event.title}
                              </h4>
                              <span
                                className="text-[10px] px-2 py-0.5 rounded whitespace-nowrap"
                                style={{
                                  backgroundColor: `${EVENT_TYPE_COLORS[event.event_type] ?? '#6b3de1'}20`,
                                  color: EVENT_TYPE_COLORS[event.event_type] ?? '#6b3de1',
                                }}
                              >
                                {EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-slate-400 text-xs line-clamp-2">
                                {event.description}
                              </p>
                            )}
                            {event.start_date && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                                {new Date(event.start_date).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Event Button */}
              <Button
                variant="secondary"
                fullWidth
                leftIcon={<span className="material-symbols-outlined">add_circle</span>}
                onClick={() => {/* TODO: Implement add event modal */}}
              >
                Add Personal Event
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Calendar Grid Component
interface CalendarGridProps {
  currentMonth: number;
  currentYear: number;
  selectedDate: Date | null;
  events: readonly CalendarEvent[];
  lunarPhases: readonly LunarPhase[];
  onDateClick: (date: Date) => void;
  filters: {
    moonPhases: boolean;
    transits: boolean;
    retrogrades: boolean;
    eclipses: boolean;
    custom: boolean;
  };
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentMonth,
  currentYear,
  selectedDate,
  events,
  lunarPhases,
  onDateClick,
  filters,
}) => {
  // Get days in month
  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0-6, where 0 = Sunday)
  const getFirstDayOfMonth = (month: number, year: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const today = new Date();

  // Get events for specific date
  const getEventsForDate = useCallback((date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  }, [events]);

  // Get lunar phase for date
  const getLunarPhaseForDate = useCallback((date: Date) => {
    return lunarPhases.find((phase) => {
      const phaseDate = new Date(phase.date);
      return (
        phaseDate.getDate() === date.getDate() &&
        phaseDate.getMonth() === date.getMonth() &&
        phaseDate.getFullYear() === date.getFullYear()
      );
    });
  }, [lunarPhases]);

  // Filter events based on selected filters
  const getFilteredEventsForDate = useCallback((date: Date) => {
    const dayEvents = getEventsForDate(date);
    return dayEvents.filter((event) => {
      if (event.event_type === 'lunar-phase' && !filters.moonPhases) return false;
      if (event.event_type === 'transit' && !filters.transits) return false;
      if (event.event_type === 'retrograde' && !filters.retrogrades) return false;
      if (event.event_type === 'eclipse' && !filters.eclipses) return false;
      if (event.event_type === 'custom' && !filters.custom) return false;
      return true;
    });
  }, [getEventsForDate, filters]);

  // Generate calendar cells
  const cells: React.ReactNode[] = [];

  // Previous month days
  const prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear);
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    cells.push(
      <div
        key={`prev-${i}`}
        className="min-h-[100px] p-2 border-b border-r border-[#2f2645] bg-[#141627]/30 text-slate-600"
        aria-hidden="true"
      >
        <span className="text-sm font-medium">{day}</span>
      </div>
    );
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const isTodayCell =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    const isSelected = selectedDate?.getTime() === date.getTime();
    const dayEvents = getFilteredEventsForDate(date);
    const lunarPhase = getLunarPhaseForDate(date);

    const cellEvents = dayEvents.map((event) => ({
      id: event.id,
      type: event.event_type,
      color: EVENT_TYPE_COLORS[event.event_type] ?? '#6b3de1',
    }));

    // Add lunar phase as event
    if (lunarPhase && filters.moonPhases) {
      cellEvents.push({
        id: `moon-${date.getTime()}`,
        type: lunarPhase.phase.replace(/-/g, '_') as 'new_moon' | 'full_moon' | 'moon_phase', // Convert hyphen to underscore for CalendarEventType
        color: EVENT_TYPE_COLORS[lunarPhase.phase] ?? '#94a3b8',
      });
    }

    cells.push(
      <CalendarCell
        key={day}
        date={day}
        month={currentMonth}
        year={currentYear}
        isToday={isTodayCell}
        isSelected={isSelected}
        events={cellEvents}
        onClick={() => onDateClick(date)}
        aria-label={`${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}${cellEvents.length > 0 ? `, ${cellEvents.length} events` : ''}`}
      />
    );
  }

  // Next month days (to fill the grid)
  const totalCells = firstDay + daysInMonth;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remainingCells; i++) {
    cells.push(
      <div
        key={`next-${i}`}
        className="min-h-[100px] p-2 border-b border-r border-[#2f2645] bg-[#141627]/30 text-slate-600"
        aria-hidden="true"
      >
        <span className="text-sm font-medium">{i}</span>
      </div>
    );
  }

  return (
    <div className="bg-[#141627] rounded-2xl border border-[#2f2645] overflow-hidden shadow-2xl" data-testid="calendar-grid">
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-[#2f2645] bg-[#1a1d2d]" data-testid="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest"
            data-testid={`weekday-${day.toLowerCase()}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Cells */}
      <div className="grid grid-cols-7 auto-rows-fr min-h-[600px] lg:min-h-[700px] bg-[#0B0D17]">
        {cells}
      </div>
    </div>
  );
};

// Main Calendar Page Component
const CalendarPage: React.FC = () => {
  const {
    selectedDate,
    lunarPhases,
    isLoading,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    setSelectedDate,
  } = useCalendar();

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [filters, setFilters] = useState({
    moonPhases: true,
    transits: true,
    retrogrades: true,
    eclipses: true,
    custom: true,
  });

  const currentMonth = selectedDate?.getMonth() ?? new Date().getMonth();
  const currentYear = selectedDate?.getFullYear() ?? new Date().getFullYear();

  // Load events for current month
  // Note: API expects months 1-12, but Date.getMonth() returns 0-11
  const { data: monthEventsResponse } = useCalendarEvents(currentYear, currentMonth + 1, true);
  const monthEvents = useMemo(() => monthEventsResponse?.data ?? [], [monthEventsResponse]);

  // Calculate daily energy level (simplified)
  const getEnergyLevelForDate = useCallback((date: Date): number => {
    const dayEvents = monthEvents.filter((event: CalendarEvent) => {
      const eventDate = new Date(event.start_date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    }) ?? [];

    // Base energy + events
    return Math.min(100, 50 + dayEvents.length * 10);
  }, [monthEvents]);

  // Handle date click
  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setIsPanelOpen(true);
  }, [setSelectedDate]);

  // Handle filter toggle
  const handleFilterToggle = useCallback((filterKey: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  }, []);

  // Get lunar phase for selected date
  const selectedLunarPhase = useMemo(() => {
    if (!selectedDate || !lunarPhases) return undefined;
    return lunarPhases.find((phase) => {
      const phaseDate = new Date(phase.date);
      return (
        phaseDate.getDate() === selectedDate.getDate() &&
        phaseDate.getMonth() === selectedDate.getMonth() &&
        phaseDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [selectedDate, lunarPhases]);

  // Get events for selected date
  const selectedEvents = useMemo(() => {
    if (!selectedDate || !monthEvents) return [];
    return monthEvents.filter((event: CalendarEvent) => {
      const eventDate = new Date(event.start_date);
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [selectedDate, monthEvents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] to-[#141627] text-slate-100">
      {/* Header */}
      <header className="border-b border-[#2f2645] bg-[#141627]/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 text-primary">
              <span className="material-symbols-outlined text-3xl">auto_awesome</span>
            </div>
            <h1 className="text-white text-xl font-bold tracking-tight">AstroVerse</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-[1px] bg-[#2f2645]"></div>
            <div className="size-9 rounded-full bg-gradient-to-br from-primary to-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 max-w-[1600px] mx-auto w-full flex-1 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Calendar */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Header & Controls */}
          <motion.div
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <div className="flex items-center gap-2 text-primary mb-1">
                <span className="material-symbols-outlined text-sm">star</span>
                <span className="text-xs font-bold uppercase tracking-wider">Cosmic Events</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">Astrological Calendar</h2>
              <p className="text-slate-400 text-sm">Track moon phases, retrogrades, and cosmic alignments.</p>
            </div>

            <div className="flex items-center gap-3 bg-[#141627]/50 p-1.5 rounded-xl border border-[#2f2645]">
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-[#141627] hover:bg-[#2f2645] text-white rounded-lg text-sm font-medium transition-colors border border-[#2f2645]"
                data-testid="calendar-today-button"
              >
                Today
              </button>
              <div className="h-6 w-[1px] bg-[#2f2645]"></div>
              <button
                onClick={goToPreviousMonth}
                className="size-9 flex items-center justify-center hover:bg-[#2f2645] rounded-lg text-slate-300 transition-colors"
                aria-label="Previous month"
                data-testid="calendar-prev-month"
              >
                <span className="material-symbols-outlined text-sm">arrow_back_ios_new</span>
              </button>
              <span className="text-white font-bold min-w-[120px] text-center" data-testid="calendar-current-month">
                {selectedDate?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={goToNextMonth}
                className="size-9 flex items-center justify-center hover:bg-[#2f2645] rounded-lg text-slate-300 transition-colors"
                aria-label="Next month"
                data-testid="calendar-next-month"
              >
                <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
              </button>
              <div className="h-6 w-[1px] bg-[#2f2645]"></div>
              <div className="flex bg-[#0B0D17] rounded-lg p-1" data-testid="calendar-view-modes">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                    viewMode === 'month'
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  data-testid="calendar-view-month"
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    viewMode === 'week'
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  data-testid="calendar-view-week"
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  data-testid="calendar-view-list"
                >
                  List
                </button>
              </div>
            </div>
          </motion.div>

          {/* Calendar Grid */}
          {isLoading ? (
            <div className="text-center py-20 text-slate-400">Loading calendar...</div>
          ) : (
            <CalendarGrid
              currentMonth={currentMonth}
              currentYear={currentYear}
              selectedDate={selectedDate}
              events={monthEvents ?? []}
              lunarPhases={lunarPhases ?? []}
              onDateClick={handleDateClick}
              filters={filters}
            />
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          {/* Event Filters */}
          <motion.div
            className="bg-[#141627] rounded-2xl p-6 border border-[#2f2645]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-lg">category</span>
              Event Filters
            </h3>
            <div className="space-y-3">
              {[
                { key: 'moonPhases', label: 'Moon Phases', color: '#FFD700' },
                { key: 'transits', label: 'Transits', color: '#6b3de1' },
                { key: 'retrogrades', label: 'Retrogrades', color: '#FF6B6B' },
                { key: 'eclipses', label: 'Eclipses', color: '#F59E0B' },
                { key: 'custom', label: 'Custom Events', color: '#22c55e' },
              ].map(({ key, label, color }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters[key as keyof typeof filters]}
                    onChange={() => handleFilterToggle(key as keyof typeof filters)}
                    className="w-4 h-4 rounded border-[#2f2645] bg-[#0B0D17] text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <span className="size-2.5 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}66` }}></span>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            className="bg-[#141627] rounded-2xl p-6 border border-[#2f2645] flex flex-col flex-1 min-h-[400px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-lg">event_upcoming</span>
                Upcoming
              </h3>
            </div>

            <div className="space-y-4 flex-1">
              {monthEvents && monthEvents.length > 0 ? (
                monthEvents.slice(0, 5).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="group relative pl-4 border-l-2 border-[#2f2645] hover:border-primary transition-colors pb-1 cursor-pointer"
                    onClick={() => {
                      setSelectedDate(new Date(event.start_date));
                      setIsPanelOpen(true);
                    }}
                  >
                    <div className="absolute -left-[5px] top-0 size-2.5 rounded-full bg-[#141627] border-2 border-slate-600 group-hover:border-primary transition-colors"></div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {new Date(event.start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <h4 className="text-white font-bold text-sm mb-1 group-hover:text-primary transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-slate-400 text-xs line-clamp-2">
                      {event.description}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">No upcoming events</p>
                </div>
              )}
            </div>
          </motion.div>
        </aside>
      </main>

      {/* Event Detail Panel */}
      <EventDetailPanel
        date={selectedDate}
        events={selectedEvents}
        lunarPhase={selectedLunarPhase}
        energyLevel={selectedDate ? getEnergyLevelForDate(selectedDate) : 0}
        onClose={() => setIsPanelOpen(false)}
        isOpen={isPanelOpen}
      />
    </div>
  );
};

export default CalendarPage;
