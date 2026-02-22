/**
 * CalendarView Component
 * Displays monthly astrological calendar with event badges
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCalendarMonth } from '../services/calendar.service';
import { CalendarMonth as CalendarMonthType, AstrologicalEvent } from '../types/calendar.types';
import { DailyWeatherModal } from './DailyWeatherModal';
import { INTENSITY_THRESHOLDS, EVENT_COLORS } from '../utils/constants';
import '../styles/CalendarView.css';

// Helper to convert API response to CalendarMonth type
function convertToCalendarMonth(response: Awaited<ReturnType<typeof getCalendarMonth>>): CalendarMonthType {
  return {
    month: response.meta.month,
    year: response.meta.year,
    events: response.data.map(event => ({
      id: event.id,
      eventType: event.event_type as 'aspect' | 'moon_phase' | 'planetary_motion' | 'eclipse' | 'ingress',
      eventName: event.event_type,
      startDate: (event.event_date ?? new Date()).toString(),
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
  }, [currentMonth, currentYear]);

  useEffect(() => {
    void fetchCalendarData();
  }, [fetchCalendarData]);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 1) {
        setCurrentYear((y) => y - 1);
        return 12;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 12) {
        setCurrentYear((y) => y + 1);
        return 1;
      }
      return prev + 1;
    });
  }, []);

  const handleToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today.getMonth() + 1);
    setCurrentYear(today.getFullYear());
  }, []);

  const handleDateClick = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const handleEventClick = useCallback((event: AstrologicalEvent) => {
    onEventClick?.(event);
  }, [onEventClick]);

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
    if (intensity >= INTENSITY_THRESHOLDS.HIGH_MAX) return EVENT_COLORS.HIGH_INTENSITY; // yellow/orange - high intensity
    if (intensity <= INTENSITY_THRESHOLDS.CHALLENGING_MAX) return EVENT_COLORS.CHALLENGING; // red - challenging
    return EVENT_COLORS.NEUTRAL; // green - favorable
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
        <button onClick={() => void fetchCalendarData()} className="btn-retry">
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
                        handleEventClick(event);
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
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default CalendarView;
