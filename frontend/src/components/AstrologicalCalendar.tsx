/**
 * Astrological Calendar Component
 * Displays monthly astrological events (moon phases, retrogrades, eclipses)
 */

/* eslint-disable @typescript-eslint/no-misused-promises */

import React, { useState } from 'react';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { SkeletonLoader, EmptyState } from './';

interface AstrologicalCalendarProps {
  year?: number;
  month?: number;
  moonOnly?: boolean;
}

const eventBadgeClasses: Record<string, string> = {
  new_moon: 'bg-indigo-500/20 text-indigo-300',
  full_moon: 'bg-red-500/20 text-red-400',
  mercury_retrograde: 'bg-red-500/20 text-red-400 font-semibold',
  venus_retrograde: 'bg-red-500/20 text-red-400 font-semibold',
  mars_retrograde: 'bg-red-500/20 text-red-400 font-semibold',
  jupiter_retrograde: 'bg-amber-500/20 text-amber-400 font-semibold',
  saturn_retrograde: 'bg-amber-500/20 text-amber-400 font-semibold',
  solar_eclipse: 'bg-red-500/20 text-red-400 font-semibold border-2 border-red-500/20',
  lunar_eclipse: 'bg-red-500/20 text-red-400 font-semibold border-2 border-red-500/20',
};

const AstrologicalCalendar: React.FC<AstrologicalCalendarProps> = ({
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
  moonOnly = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(year, month - 1, 1));
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: Date; events: any[] } | null>(null);

  const { data: events, isLoading, error, refetch } = useCalendarEvents(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1
  );

  // Filter events based on moonOnly prop
  const filteredEvents = React.useMemo(() => {
    if (!events || !Array.isArray(events)) return [];
    if (!moonOnly) return events;
    return events.filter((event) =>
      ['new_moon', 'full_moon', 'first_quarter', 'last_quarter', 'lunar_eclipse', 'solar_eclipse', 'supermoon', 'blue_moon'].includes(event.event_type)
    );
  }, [events, moonOnly]);

  const getEventForDate = (date: Date) => {
    if (!filteredEvents || !Array.isArray(filteredEvents)) return [];

    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.event_date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const renderCalendar = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const calendar = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push(<div key={`empty-${i}`} className="bg-cosmic-card-solid/30 min-h-[100px] sm:min-h-[80px]" />);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventForDate(date);

      calendar.push(
        <div
          key={day}
          className="bg-cosmic-card-solid min-h-[100px] sm:min-h-[80px] p-2 sm:p-1 relative transition-colors hover:bg-white/15 border border-white/15 cursor-pointer"
          onClick={() => {
            const dayEvts = getEventForDate(date);
            setSelectedDayEvents(dayEvts.length > 0 ? { date, events: dayEvts } : null);
          }}
        >
          <span className="font-semibold text-slate-200 text-sm sm:text-xs block mb-1">{day}</span>
          {dayEvents.length > 0 && (
            <div className="flex flex-col gap-0.5">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className={`inline-flex items-center text-[11px] sm:text-[9px] py-0.5 px-1 rounded bg-amber-500/20 cursor-help transition-transform hover:scale-105 whitespace-nowrap ${eventBadgeClasses[event.event_type] || ''}`}
                  title={event.interpretation}
                >
                  <span className="mr-1 text-sm sm:text-xs">
                    {event.event_type === 'new_moon' && '\u{1F311}'}
                    {event.event_type === 'full_moon' && '\u{1F315}'}
                    {event.event_type.includes('retrograde') && '\u21C4'}
                    {(event.event_type.includes('eclipse') && (event.event_type === 'solar_eclipse' ? '\u{1F311}' : '\u{1F315}'))}
                  </span>
                  {typeof event.event_data?.sign === 'string' && (
                    <span className="text-[10px] font-semibold ml-1 uppercase tracking-wide">
                      {capitalize(event.event_data.sign)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return calendar;
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return (
      <div className="max-w-[800px] mx-auto p-5 sm:p-2.5">
        <div className="glass-panel rounded-xl p-6">
          <SkeletonLoader variant="calendar" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[800px] mx-auto p-5 sm:p-2.5">
        <div className="glass-panel rounded-xl p-6">
          <EmptyState
            icon="\u{1F4C5}"
            title="Unable to load calendar"
            description="We encountered an error loading the astrological calendar. Please check your connection and try again."
            actionText="Retry"
            onAction={() => refetch()}
          />
        </div>
      </div>
    );
  }

  if (!events || !Array.isArray(events) || events.length === 0) {
    return (
      <div className="max-w-[800px] mx-auto p-5 sm:p-2.5">
        <div className="glass-panel rounded-xl p-6">
          <EmptyState
            icon="\u{1F319}"
            title="No events this month"
            description={`There are no major astrological events scheduled for ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}. Check adjacent months for upcoming moon phases, retrogrades, and eclipses.`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto p-5 sm:p-2.5">
      <div className="flex justify-between items-center mb-5 gap-4 sm:flex-col sm:gap-2.5">
        <button type="button" onClick={goToPreviousMonth} className="py-2 px-4 bg-primary text-white border-none rounded-xl cursor-pointer text-sm transition-colors hover:bg-primary/90 sm:w-full" aria-label="Previous month">
          ← Previous
        </button>

        <div className="text-center flex-1 sm:flex-none">
          <h2 className="m-0 text-white">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button type="button" onClick={goToToday} className="ml-2.5 py-1.5 px-3 bg-primary text-white border-none rounded-xl cursor-pointer text-sm transition-colors hover:bg-primary/90">
            Today
          </button>
        </div>

        <button type="button" onClick={goToNextMonth} className="py-2 px-4 bg-primary text-white border-none rounded-xl cursor-pointer text-sm transition-colors hover:bg-primary/90 sm:w-full" aria-label="Next month">
          Next →
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/15 bg-cosmic-card-solid/50">
          {weekdays.map((day) => (
            <div key={day} className="text-center font-semibold text-slate-200 py-3 text-xs uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-cosmic-border/30">
          {renderCalendar()}
        </div>
      </div>

      <div className="flex gap-5 mt-5 p-4 glass-panel rounded-xl flex-wrap sm:flex-col sm:gap-2.5">
        <div className="flex items-center gap-1.5 text-sm text-slate-200">
          <span className="text-lg">{'\u{1F311}'}</span> New Moon
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-200">
          <span className="text-lg">{'\u{1F315}'}</span> Full Moon
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-200">
          <span className="text-lg">{'\u21C4'}</span> Retrograde
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-200">
          <span className="text-lg">{'\u{1F311}\u{1F315}'}</span> Eclipse
        </div>
      </div>

      {/* Day event popup */}
      {selectedDayEvents && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4" onClick={() => setSelectedDayEvents(null)}>
          <div className="modal-content max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {selectedDayEvents.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <button type="button"
                onClick={() => setSelectedDayEvents(null)}
                className="p-2 hover:bg-white/15 rounded-lg text-slate-200 hover:text-white transition-colors"
                aria-label="Close"
              >
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>
            <div className="space-y-3">
              {selectedDayEvents.events.map((event: any) => (
                <div key={event.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">
                      {event.event_type === 'new_moon' ? '🌑' : event.event_type === 'full_moon' ? '🌕' : event.event_type.includes('retrograde') ? '↔' : event.event_type.includes('eclipse') ? '🌑' : '✨'}
                    </span>
                    <span className="font-medium text-white capitalize">{event.event_type.replace(/_/g, ' ')}</span>
                  </div>
                  {event.event_data?.sign && (
                    <p className="text-sm text-slate-300">in {capitalize(event.event_data.sign)}</p>
                  )}
                  {event.interpretation && (
                    <p className="text-sm text-slate-400 mt-1">{event.interpretation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AstrologicalCalendar;
