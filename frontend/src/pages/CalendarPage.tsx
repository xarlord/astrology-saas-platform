/**
 * Calendar Page
 * Main page for astrological calendar feature
 */

import React from 'react';
import AstrologicalCalendar from '../components/AstrologicalCalendar';
import './CalendarPage.css';

const CalendarPage: React.FC = () => {
  return (
    <div className="calendar-page">
      <div className="page-header">
        <div>
          <h1>Astrological Calendar</h1>
          <p className="subtitle">Track moon phases, retrogrades, and cosmic events</p>
        </div>
      </div>

      <AstrologicalCalendar />
    </div>
  );
};

export default CalendarPage;
