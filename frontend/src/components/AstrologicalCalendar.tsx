/**
 * Astrological Calendar Component
 * Displays monthly astrological events (moon phases, retrogrades, eclipses)
 */

import React, { useState } from 'react';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import './AstrologicalCalendar.css';

interface AstrologicalCalendarProps {
  year?: number;
  month?: number;
}

const AstrologicalCalendar: React.FC<AstrologicalCalendarProps> = ({
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(year, month - 1, 1));

  const { data: events, isLoading, error, refetch } = useCalendarEvents(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1
  );

  const getEventForDate = (date: Date) => {
    if (!events) return [];

    return events.data.filter((event) => {
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
      calendar.push(<div key={`empty-${i}`} className="calendar-day empty" />);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventForDate(date);

      calendar.push(
        <div key={day} className="calendar-day">
          <span className="day-number">{day}</span>
          {dayEvents.length > 0 && (
            <div className="day-events">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className={`event-badge ${event.event_type}`}
                  title={event.interpretation}
                >
                  <span className="event-icon">
                    {event.event_type === 'new_moon' && '🌑'}
                    {event.event_type === 'full_moon' && '🌕'}
                    {event.event_type.includes('retrograde') && '⇄'}
                    {(event.event_type.includes('eclipse') && (event.event_type === 'solar_eclipse' ? '🌑' : '🌕'))}
                  </span>
                  {event.event_data?.sign && (
                    <span className="event-sign">
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
      <div className="astrological-calendar">
        <div className="calendar-loading">Loading calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="astrological-calendar">
        <div className="calendar-error">
          Failed to load calendar. Please try again.
        </div>
        <button onClick={() => refetch()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="astrological-calendar">
      <div className="calendar-header">
        <button onClick={goToPreviousMonth} className="nav-button" aria-label="Previous month">
          ← Previous
        </button>

        <div className="calendar-title">
          <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button onClick={goToToday} className="today-button">
            Today
          </button>
        </div>

        <button onClick={goToNextMonth} className="nav-button" aria-label="Next month">
          Next →
        </button>
      </div>

      <div className="calendar-weekdays">
        {weekdays.map((day) => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">{renderCalendar()}</div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span>🌑</span> New Moon
        </div>
        <div className="legend-item">
          <span>🌕</span> Full Moon
        </div>
        <div className="legend-item">
          <span>⇄</span> Retrograde
        </div>
        <div className="legend-item">
          <span>🌑🌕</span> Eclipse
        </div>
      </div>
    </div>
  );
};

export default AstrologicalCalendar;
