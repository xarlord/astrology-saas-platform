/**
 * Calendar Page Component
 * Main page for astrological calendar feature
 */

import React from 'react';
import AstrologicalCalendar from '../components/AstrologicalCalendar';
import { AppLayout } from '../components';

const CalendarPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Astrological Calendar</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track moon phases, retrogrades, and cosmic events
        </p>
      </div>

      <AstrologicalCalendar />
    </AppLayout>
  );
};

export default CalendarPage;
