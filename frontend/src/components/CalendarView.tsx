/**
 * CalendarView Component
 * Displays monthly astrological calendar with event badges
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCalendarMonth } from '../services/calendar.service';
import { CalendarMonth as CalendarMonthType, AstrologicalEvent } from '../types/calendar.types';
import { DailyWeatherModal } from './DailyWeatherModal';
import '../styles/CalendarView.css';

// Helper to convert API response to CalendarMonth type
function convertToCalendarMonth(response: Awaited<ReturnType<typeof getCalendarMonth>>): CalendarMonthType {
  return {
    month: response.meta.month,
    year: response.meta.year,
    events: response.data.map(event => ({
      id: event.id,
      eventType: event.event_type as any,
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

  useEffect(() => {
    fetchCalendarData();
  }, [currentMonth, currentYear]);

  const fetchCalendarData = async () => {
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
  };

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
      <div className="calendar-view loading">
        <div className="spinner"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar-view error">
        <p>{error}</p>
        <button onClick={fetchCalendarData} className="btn-retry">
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
    <div className="calendar-view">
      {/* Header */}
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="btn-nav" aria-label="Previous month">
          <ChevronLeft size={20} />
        </button>

        <h2>
          {monthNames[currentMonth - 1]} {currentYear}
        </h2>

        <button onClick={handleNextMonth} className="btn-nav" aria-label="Next month">
          <ChevronRight size={20} />
        </button>
      </div>

      {!isCurrentMonth && (
        <div className="calendar-today">
          <button onClick={handleToday} className="btn-today">
            Today
          </button>
        </div>
      )}

      {/* Day names header */}
      <div className="calendar-day-names">
        {dayNames.map((day) => (
          <div key={day} className="day-name">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDay }).map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day empty"></div>
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
              className={`calendar-day ${isToday ? 'today' : ''} ${events.length > 0 ? 'has-events' : ''}`}
              onClick={() => handleDateClick(date)}
            >
              <span className="day-number">{day}</span>

              {events.length > 0 && (
                <div className="event-badges">
                  {events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="event-badge"
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
                    <div className="event-more">+{events.length - 3}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#10B981' }}></div>
          <span>Favorable</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#F59E0B' }}></div>
          <span>Moderate</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#EF4444' }}></div>
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
