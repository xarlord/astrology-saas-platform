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
}

const eventBadgeClasses: Record<string, string> = {
  new_moon: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  full_moon: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  mercury_retrograde: 'bg-red-100 text-red-600 font-semibold dark:bg-red-900/30 dark:text-red-400',
  venus_retrograde: 'bg-red-100 text-red-600 font-semibold dark:bg-red-900/30 dark:text-red-400',
  mars_retrograde: 'bg-red-100 text-red-600 font-semibold dark:bg-red-900/30 dark:text-red-400',
  jupiter_retrograde:
    'bg-amber-100 text-amber-600 font-semibold dark:bg-amber-900/30 dark:text-amber-400',
  saturn_retrograde:
    'bg-amber-100 text-amber-600 font-semibold dark:bg-amber-900/30 dark:text-amber-400',
  solar_eclipse:
    'bg-red-200 text-red-800 font-semibold border-2 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-500',
  lunar_eclipse:
    'bg-red-200 text-red-800 font-semibold border-2 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-500',
};

const AstrologicalCalendar: React.FC<AstrologicalCalendarProps> = ({
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(year, month - 1, 1));

  const {
    data: events,
    isLoading,
    error,
    refetch,
  } = useCalendarEvents(currentDate.getFullYear(), currentDate.getMonth() + 1);

  const getEventForDate = (date: Date) => {
    if (!events) return [];

    return events.data.filter((event) => {
      if (!event.event_date) return false;
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
      calendar.push(
        <div
          key={`empty-${i}`}
          className="bg-gray-50 dark:bg-gray-800/50 min-h-[100px] sm:min-h-[80px]"
        />,
      );
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventForDate(date);

      calendar.push(
        <div
          key={day}
          className="bg-white dark:bg-gray-800 min-h-[100px] sm:min-h-[80px] p-2 sm:p-1 relative transition-colors hover:bg-gray-50 dark:hover:bg-gray-750"
        >
          <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-xs block mb-1">
            {day}
          </span>
          {dayEvents.length > 0 && (
            <div className="flex flex-col gap-0.5">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className={`inline-flex items-center text-[11px] sm:text-[9px] py-0.5 px-1 rounded bg-amber-100 dark:bg-amber-900/30 cursor-help transition-transform hover:scale-105 hover:shadow-sm whitespace-nowrap ${eventBadgeClasses[event.event_type] || ''}`}
                  title={event.interpretation}
                >
                  <span className="mr-1 text-sm sm:text-xs">
                    {event.event_type === 'new_moon' && '\u{1F311}'}
                    {event.event_type === 'full_moon' && '\u{1F315}'}
                    {event.event_type.includes('retrograde') && '\u21C4'}
                    {event.event_type.includes('eclipse') &&
                      (event.event_type === 'solar_eclipse' ? '\u{1F311}' : '\u{1F315}')}
                  </span>
                  {(event.event_data as { sign?: string } | null)?.sign && (
                    <span className="event-sign">
                      {capitalize((event.event_data as { sign?: string }).sign!)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>,
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
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return (
      <div className="max-w-[800px] mx-auto p-5 sm:p-2.5">
        <SkeletonLoader variant="calendar" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[800px] mx-auto p-5 sm:p-2.5">
        <EmptyState
          icon="\u{1F4C5}"
          title="Unable to load calendar"
          description="We encountered an error loading the astrological calendar. Please check your connection and try again."
          actionText="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  if (!events || events.data.length === 0) {
    return (
      <div className="max-w-[800px] mx-auto p-5 sm:p-2.5">
        <EmptyState
          icon="\u{1F319}"
          title="No events this month"
          description={`There are no major astrological events scheduled for ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}. Check adjacent months for upcoming moon phases, retrogrades, and eclipses.`}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto p-5 sm:p-2.5">
      <div className="flex justify-between items-center mb-5 gap-4 sm:flex-col sm:gap-2.5">
        <button
          onClick={goToPreviousMonth}
          className="py-2 px-4 bg-indigo-500 text-white border-none rounded-md cursor-pointer text-sm transition-colors hover:bg-indigo-600 sm:w-full"
          aria-label="Previous month"
        >
          \u2190 Previous
        </button>

        <div className="text-center flex-1 sm:flex-none">
          <h2 className="m-0 text-gray-800 dark:text-gray-200">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToToday}
            className="ml-2.5 py-1.5 px-3 bg-indigo-500 text-white border-none rounded-md cursor-pointer text-sm transition-colors hover:bg-indigo-600"
          >
            Today
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="py-2 px-4 bg-indigo-500 text-white border-none rounded-md cursor-pointer text-sm transition-colors hover:bg-indigo-600 sm:w-full"
          aria-label="Next month"
        >
          Next \u2192
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px mb-2.5">
        {weekdays.map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-gray-500 dark:text-gray-400 py-2.5 text-sm sm:text-xs sm:py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700">
        {renderCalendar()}
      </div>

      <div className="flex gap-5 mt-5 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex-wrap sm:flex-col sm:gap-2.5">
        <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
          <span className="text-lg">{'\u{1F311}'}</span> New Moon
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
          <span className="text-lg">{'\u{1F315}'}</span> Full Moon
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
          <span className="text-lg">{'\u21C4'}</span> Retrograde
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
          <span className="text-lg">{'\u{1F311}\u{1F315}'}</span> Eclipse
        </div>
      </div>
    </div>
  );
};

export default AstrologicalCalendar;
