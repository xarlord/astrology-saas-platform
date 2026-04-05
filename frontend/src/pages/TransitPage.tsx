/**
 * Transit Page Component
 *
 * Connects to the real transit API via React Query hooks and renders
 * the TransitDashboard with fetched data. Shows an EmptyState prompting
 * the user to create a chart when none exist.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, AppLayout, TransitDashboard, TransitDetailModal } from '../components';
import type {
  Transit as TransitType,
  TransitHighlight,
  TransitCalendarDay,
  TransitDashboardData,
} from '../components/TransitDashboard';
import { useTodayTransits, useTransitForecast, useTransitCalendar } from '../hooks';
import type { TransitReading } from '../services/transit.service';
import { getErrorMessage } from '../utils/errorHandling';

/**
 * Map a raw TransitReading transit to a Transit object expected by
 * TransitDashboard.
 */
function mapReadingToTransit(
  r: TransitReading['transits'][number],
  reading: TransitReading,
): TransitType {
  return {
    transitingPlanet: r.transitPlanet,
    natalPlanet: r.natalPlanet,
    type: r.aspect,
    orb: r.orb,
    applying: r.orb > 0,
    startDate: reading.date,
    endDate: reading.date,
    peakDate: reading.date,
    intensity: Math.max(1, Math.min(10, Math.round(10 - Math.abs(r.orb)))),
    interpretation: {
      general: `${r.transitPlanet} ${r.aspect} ${r.natalPlanet}`,
      themes: [],
      advice: { positive: [], challenges: [], suggestions: [] },
    },
  };
}

/**
 * Derive highlights from today's reading -- the most intense transits
 * are treated as highlights.
 */
function deriveHighlights(reading: TransitReading | undefined): TransitHighlight[] {
  if (!reading) return [];

  return reading.transits
    .filter((t) => Math.abs(t.orb) <= 2)
    .map((t) => ({
      type: 'major-transit' as const,
      title: `${t.transitPlanet} ${t.aspect} ${t.natalPlanet}`,
      date: reading.date,
      description: `${t.transitPlanet} forms a ${t.aspect} with your natal ${t.natalPlanet}`,
      intensity: Math.max(1, Math.min(10, Math.round(10 - Math.abs(t.orb)))),
    }));
}

/**
 * Build TransitCalendarDay[] from a TransitReading[] for a given month/year.
 */
function buildCalendarDays(
  readings: TransitReading[],
  year: number,
  month: number,
): TransitCalendarDay[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const readingByDate = new Map<string, TransitReading>();
  for (const r of readings) {
    const key = r.date.split('T')[0];
    if (key) readingByDate.set(key, r);
  }

  const days: TransitCalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const reading = readingByDate.get(dateStr);
    days.push({
      date: dateStr,
      hasMajorTransit: reading ? reading.transits.some((t) => Math.abs(t.orb) <= 2) : false,
      hasMoonPhase: false,
      hasEclipse: false,
      transits: reading ? reading.transits.map((t) => mapReadingToTransit(t, reading)) : undefined,
    });
  }
  return days;
}

export default function TransitPage() {
  const navigate = useNavigate();
  const [selectedTransit, setSelectedTransit] = useState<TransitType | null>(null);

  // Current month/year for calendar queries
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // React Query hooks
  const { data: todayReading, error: todayError } = useTodayTransits(true);

  const { data: weekReadings, error: weekError } = useTransitForecast('week', true);

  const { data: calendarReadings, error: calendarError } = useTransitCalendar(
    currentMonth,
    currentYear,
    true,
  );

  // Aggregate error from any query
  const queryError = todayError ?? weekError ?? calendarError;
  const errorMessage = queryError
    ? getErrorMessage(queryError, 'Failed to load transit data')
    : null;

  // Build TransitDashboardData from raw readings
  const dashboardData: TransitDashboardData | null = useMemo(() => {
    const todayTransits: TransitType[] = todayReading
      ? todayReading.transits.map((t) => mapReadingToTransit(t, todayReading))
      : [];

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
    const weekTransits: TransitType[] = weekReadings
      ? weekReadings.flatMap((r: TransitReading) =>
          r.transits.map((t) => mapReadingToTransit(t, r)),
        )
      : [];
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */

    const monthDays: TransitCalendarDay[] = calendarReadings
      ? buildCalendarDays(calendarReadings, currentYear, currentMonth)
      : [];

    const highlights: TransitHighlight[] = deriveHighlights(todayReading);

    return {
      today: todayTransits,
      week: weekTransits,
      month: monthDays,
      highlights,
    };
  }, [todayReading, weekReadings, calendarReadings, currentYear, currentMonth]);

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Transit Forecast</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Current and upcoming planetary influences
        </p>
      </div>

      {errorMessage ? (
        <EmptyState
          icon="⚠️"
          title="Unable to load transits"
          description={errorMessage}
          actionText="Retry"
          onAction={() => window.location.reload()}
        />
      ) : !dashboardData ? (
        <EmptyState
          icon="🌙"
          title="No transit data available"
          description="Transit calculations require a natal chart. Please create a chart first to view your transits."
          actionText="Create Chart"
          onAction={() => navigate('/charts/new')}
          secondaryActionText="Go to Dashboard"
          onSecondaryAction={() => navigate('/dashboard')}
        />
      ) : (
        <>
          <TransitDashboard
            data={dashboardData}
            onTransitClick={(transit) => setSelectedTransit(transit)}
          />
          {selectedTransit && (
            <TransitDetailModal
              transit={selectedTransit}
              onClose={() => setSelectedTransit(null)}
            />
          )}
        </>
      )}
    </AppLayout>
  );
}
