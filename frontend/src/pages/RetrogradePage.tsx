/**
 * Retrograde Tracker Page Component
 *
 * Displays planetary retrogrades using the TransitCalendar component
 * with showRetrogrades enabled. Transforms TransitReading data from the
 * transit service into the TransitCalendar's Transit format.
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransitCalendar } from '../components/TransitCalendar';
import type { Transit as CalendarTransit } from '../components/TransitCalendar';
import { AppLayout, SkeletonLoader, EmptyState } from '../components';
import { useCharts, useTransitCalendar } from '../hooks';
import type { TransitReading } from '../services/transit.service';
import { getErrorMessage } from '../utils/errorHandling';

/**
 * Outer planets that can retrograde (beyond the Sun/Moon which never do).
 */
const RETROGRADE_PLANETS = new Set([
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
]);

/**
 * Transform TransitReading[] from the transit service into the
 * TransitCalendar component's Transit[] format.
 */
function mapToCalendarTransits(readings: TransitReading[]): CalendarTransit[] {
  const transits: CalendarTransit[] = [];
  for (const reading of readings) {
    for (const t of (reading.transits ?? [])) {
      transits.push({
        date: reading.date,
        planet: t.transitPlanet,
        sign: '',
        degree: Math.abs(t.orb),
        retrograde: RETROGRADE_PLANETS.has(t.transitPlanet),
        aspect: t.aspect,
        aspectPlanet: t.natalPlanet,
      });
    }
  }
  return transits;
}

export default function RetrogradePage() {
  const navigate = useNavigate();
  const { charts, fetchCharts, isLoading: chartsLoading } = useCharts();

  // Current month/year for the calendar query
  const now = new Date();
  const [currentMonth] = useState(now.getMonth() + 1);
  const [currentYear] = useState(now.getFullYear());

  // Ensure charts are loaded so we know whether the user has any.
  useEffect(() => {
    void fetchCharts();
  }, [fetchCharts]);

  const hasCharts = charts.length > 0;
  const hasCalculatedChart = charts.some((c) => c.calculated_data != null);

  // React Query hook -- only enabled when user has a calculated chart.
  const {
    data: calendarReadings,
    isLoading: calendarLoading,
    error: calendarError,
  } = useTransitCalendar(currentMonth, currentYear, hasCalculatedChart);

  const errorMessage = calendarError
    ? getErrorMessage(calendarError, 'Failed to load retrograde data')
    : null;

  // Map raw TransitReading[] to TransitCalendar's Transit[] format.
  const transits: CalendarTransit[] = useMemo(
    () => (calendarReadings ? mapToCalendarTransits(calendarReadings) : []),
    [calendarReadings],
  );

  // Loading state -- wait for charts and the primary query.
  const isLoading = chartsLoading || (hasCharts && calendarLoading);

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Retrograde Tracker</h1>
        <p className="text-slate-200">
          Monitor planetary retrogrades and their influence
        </p>
      </div>

      {isLoading ? (
        <SkeletonLoader variant="list" count={5} />
      ) : errorMessage ? (
        <EmptyState
          icon={<span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '48px', color: '#ef4444' }}>warning</span>}
          title="Unable to load retrograde data"
          description={errorMessage}
          actionText="Retry"
          onAction={() => window.location.reload()}
        />
      ) : !hasCharts ? (
        <EmptyState
          icon={<span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '48px', color: '#8b5cf6' }}>dark_mode</span>}
          title="No retrograde data available"
          description="Retrograde tracking requires a natal chart. Please create a chart first to view retrograde information."
          actionText="Create Chart"
          onAction={() => navigate('/charts/new')}
          secondaryActionText="Go to Dashboard"
          onSecondaryAction={() => navigate('/dashboard')}
        />
      ) : (
        <TransitCalendar
          transits={transits}
          showRetrogrades={true}
        />
      )}
    </AppLayout>
  );
}
