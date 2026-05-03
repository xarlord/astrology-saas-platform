/**
 * CalendarView Component
 * Displays monthly astrological calendar with event badges
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */

import { useState, useEffect, useCallback } from 'react';

import { getCalendarMonth } from '../services/calendar.service';
import { CalendarMonth as CalendarMonthType, AstrologicalEvent } from '../types/calendar.types';
import { DailyWeatherModal } from './DailyWeatherModal';

// Helper to convert API response to CalendarMonth type
function convertToCalendarMonth(response: Awaited<ReturnType<typeof getCalendarMonth>>): CalendarMonthType {
  return {
    month: response.meta.month,
    year: response.meta.year,
    events: response.data.map(event => ({
      id: event.id,
      eventType: event.event_type as AstrologicalEvent['eventType'],
      eventName: event.event_type,
      startDate: event.event_date.toString(),
      endDate: event.end_date?.toString(),
      intensity: 5,
      isGlobal: event.user_id === null,
      createdAt: new Date().toISOString(),
    })),
    dailyWeather: {},
  };
}

interface CalendarViewProps {
  initialMonth?: number;
  initialYear?: number;
  onEventClick?: (event: AstrologicalEvent) => void;
}

export function CalendarView({
  initialMonth = new Date().getMonth() + 1,
  initialYear = new Date().getFullYear(),
  onEventClick,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [calendarData, setCalendarData] = useState<CalendarMonthType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCalendarMonth(currentYear, currentMonth);
      const calendarMonth = convertToCalendarMonth(response);
      setCalendarData(calendarMonth);
    } catch (err) {
      setError('Failed to load calendar. Please try again.');
      console.error('Error fetching calendar:', err);
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    void fetchCalendarData();
  }, [fetchCalendarData]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth() + 1);
    setCurrentYear(today.getFullYear());
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };

  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number): number => {
    return new Date(year, month - 1, 1).getDay();
  };

  const getEventsForDate = (date: string): AstrologicalEvent[] => {
    if (!calendarData) return [];
    const dailyWeather = calendarData.dailyWeather[date];
    if (!dailyWeather) return [];

    return [...dailyWeather.globalEvents, ...dailyWeather.personalTransits];
  };

  const getEventColor = (intensity: number): string => {
    if (intensity >= 8) return '#F59E0B'; // yellow/orange - high intensity
    if (intensity <= 4) return '#EF4444'; // red - challenging
    return '#10B981'; // green - favorable
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

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto p-5 md:p-3 glass-panel rounded-2xl flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-cosmic-border border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-200">Loading calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[1200px] mx-auto p-5 md:p-3 glass-panel rounded-2xl flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-slate-200">{error}</p>
        <button type="button" onClick={fetchCalendarData} className="px-5 py-2.5 bg-primary text-white border-none rounded-lg cursor-pointer text-sm font-medium transition-colors duration-200 hover:bg-primary/90">
          Retry
        </button>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const today = new Date();
  const isCurrentMonth =
    currentMonth === today.getMonth() + 1 && currentYear === today.getFullYear();

  return (
    <div className="w-full max-w-[1200px] mx-auto p-5 md:p-3 glass-panel rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={handlePrevMonth} className="flex items-center justify-center w-10 h-10 border border-white/15 bg-transparent rounded-lg cursor-pointer transition-all duration-200 text-slate-200 hover:bg-white/15 hover:border-primary hover:text-primary" aria-label="Previous month">
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px' }}>chevron_left</span>
        </button>

        <h2 className="m-0 text-2xl md:text-lg font-semibold text-white">
          {monthNames[currentMonth - 1]} {currentYear}
        </h2>

        <button type="button" onClick={handleNextMonth} className="flex items-center justify-center w-10 h-10 border border-white/15 bg-transparent rounded-lg cursor-pointer transition-all duration-200 text-slate-200 hover:bg-white/15 hover:border-primary hover:text-primary" aria-label="Next month">
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px' }}>chevron_right</span>
        </button>
      </div>

      {!isCurrentMonth && (
        <div className="flex justify-center mb-4">
          <button type="button" onClick={handleToday} className="px-4 py-2 bg-primary text-white border-none rounded-md cursor-pointer text-sm font-medium transition-colors duration-200 hover:bg-primary/90">
            Today
          </button>
        </div>
      )}

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-[1px] mb-2">
        {dayNames.map((day) => (
          <div key={day} className="p-3 text-center text-xs font-semibold text-slate-200 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-[1px] bg-white/15 border border-white/15 rounded-xl overflow-hidden">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDay }).map((_, index) => (
          <div key={`empty-${index}`} className="bg-white/[0.03] min-h-[100px] md:min-h-[70px] cursor-default"></div>
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const date = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const events = getEventsForDate(date);
          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() + 1 &&
            currentYear === today.getFullYear();

          return (
            <div
              key={day}
              className={`bg-cosmic-card-solid/70 min-h-[100px] md:min-h-[70px] p-2 md:p-1 cursor-pointer transition-colors duration-200 relative hover:bg-white/15 ${isToday ? '!bg-primary/10' : ''}`}
              onClick={() => handleDateClick(date)}
            >
              <span className={`text-sm md:text-xs font-medium text-slate-200 mb-1 inline-block w-7 h-7 md:w-6 md:h-6 leading-7 md:leading-6 text-center ${isToday ? 'bg-primary text-white rounded-full w-7 h-7 md:w-6 md:h-6 flex items-center justify-center !text-white !leading-none' : ''}`}>{day}</span>

              {events.length > 0 && (
                <div className="flex flex-col gap-0.5 mt-1">
                  {events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs md:text-[10px] py-0.5 px-1.5 md:px-1 rounded text-white whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer transition-transform duration-200 hover:scale-105"
                      style={{ backgroundColor: getEventColor(event.intensity) }}
                      title={event.eventName}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      {event.eventType === 'retrograde' && '⇆'}
                      {event.eventType === 'eclipse' && '🌑'}
                      {event.eventType === 'moon-phase' && '🌙'}
                      {event.eventType === 'ingress' && '✨'}
                      {event.eventType === 'transit' && '⭐'}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="text-[11px] text-slate-200 px-1.5 py-0.5">+{events.length - 3}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-6 md:flex-wrap md:gap-3 mt-4 p-3 bg-white/[0.03] rounded-xl">
        <div className="flex items-center gap-2 text-[13px] text-slate-200">
          <div className="w-4 h-4 rounded border border-black/10" style={{ backgroundColor: '#10B981' }}></div>
          <span>Favorable</span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-slate-200">
          <div className="w-4 h-4 rounded border border-black/10" style={{ backgroundColor: '#F59E0B' }}></div>
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-slate-200">
          <div className="w-4 h-4 rounded border border-black/10" style={{ backgroundColor: '#EF4444' }}></div>
          <span>Challenging</span>
        </div>
      </div>

      {/* Daily Weather Modal */}
      {selectedDate && calendarData && (
        <DailyWeatherModal
          date={selectedDate}
          weather={calendarData.dailyWeather[selectedDate]}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

export default CalendarView;
