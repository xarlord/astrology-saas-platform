/**
 * Moon Calendar Page Component
 *
 * Simple wrapper around the AstrologicalCalendar component for tracking
 * lunar phases, eclipses, and moon-related events.
 */

import React from 'react';
import AstrologicalCalendar from '../components/AstrologicalCalendar';
import { AppLayout } from '../components';

const MoonCalendarPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Moon Calendar</h2>
        <p className="text-slate-400">
          Track lunar phases, eclipses, and moon-related events
        </p>
      </div>

      <AstrologicalCalendar />
    </AppLayout>
  );
};

export default MoonCalendarPage;
