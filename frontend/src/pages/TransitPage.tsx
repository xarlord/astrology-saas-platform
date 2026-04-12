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
import type { Transit as ApiTransit } from '../services/api.types';
import { getErrorMessage } from '../utils/errorHandling';

/**
 * Map an API Transit to the component Transit shape expected by TransitDashboard.
 */
function mapApiTransit(t: ApiTransit): TransitType {
  return {
    transitingPlanet: t.planet,
    natalPlanet: '',
    type: t.type,
    orb: 0,
    applying: false,
    startDate: t.start_date,
    endDate: t.end_date,
    peakDate: t.peak_date,
    intensity: t.intensity,
    interpretation: {
      general: t.influence?.overall ?? `${t.planet} transit`,
      themes: [],
      advice: { positive: [], challenges: [], suggestions: [] },
    },
  };
}

/**
 * Derive highlights from API Transit[] -- the most intense transits
 * are treated as highlights.
 */
function deriveHighlights(transits: ApiTransit[] | undefined): TransitHighlight[] {
  if (!transits) return [];

  return transits
    .filter((t) => t.intensity >= 7)
    .map((t) => ({
      type: 'major-transit' as const,
      title: t.title ?? `${t.planet} transit`,
      date: t.peak_date,
      description: t.description ?? t.influence?.overall ?? `${t.planet} transit`,
      intensity: t.intensity,
    }));
}

/**
 * Build TransitCalendarDay[] from API Transit[] for a given month/year.
 */
function buildCalendarDays(
  transits: ApiTransit[],
  year: number,
  month: number,
): TransitCalendarDay[] {
  const daysInMonth = new Date(year, month, 0).getDate();

  // Group transits by peak_date (date only)
  const transitsByDate = new Map<string, ApiTransit[]>();
  for (const t of transits) {
    const key = t.peak_date.split('T')[0];
    if (key) {
      const arr = transitsByDate.get(key) ?? [];
      arr.push(t);
      transitsByDate.set(key, arr);
    }
  }

  const days: TransitCalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayTransits = transitsByDate.get(dateStr);
    days.push({
      date: dateStr,
      hasMajorTransit: dayTransits ? dayTransits.some((t) => t.intensity >= 7) : false,
      hasMoonPhase: false,
      hasEclipse: false,
      transits: dayTransits ? dayTransits.map(mapApiTransit) : undefined,
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

  // Build TransitDashboardData from raw API responses
  const dashboardData: TransitDashboardData | null = useMemo(() => {
    const todayTransits: TransitType[] = todayReading
      ? todayReading.transits.map(mapApiTransit)
      : [];

    const weekTransits: TransitType[] = weekReadings
      ? weekReadings.transits.map(mapApiTransit)
      : [];

    const monthDays: TransitCalendarDay[] = calendarReadings
      ? buildCalendarDays(calendarReadings.transits, currentYear, currentMonth)
      : [];

    const highlights: TransitHighlight[] = deriveHighlights(todayReading?.transits);

    return {
      today: todayTransits,
      week: weekTransits,
      month: monthDays,
      highlights,
    };
  }, [todayReading, weekReadings, calendarReadings, currentYear, currentMonth]);

  return (
    <AppLayout>
      <div className="mb-8" data-testid="transit-page-header">
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
          data-testid="transit-error-state"
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
          data-testid="transit-empty-state"
        />
      ) : (
        <>
          <TransitDashboard
            data={dashboardData}
            onTransitClick={(transit) => setSelectedTransit(transit)}
            data-testid="transit-dashboard"
          />
          {selectedTransit && (
            <TransitDetailModal
              transit={selectedTransit}
              onClose={() => setSelectedTransit(null)}
              data-testid="transit-detail-modal"
            />
          )}
        </>
      )}
    </AppLayout>
  );
}
