/**
 * Transit Page Component
 *
 * Connects to the real transit API via React Query hooks and renders
 * the TransitDashboard with fetched data. Shows an EmptyState prompting
 * the user to create a chart when none exist.
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SkeletonLoader,
  EmptyState,
  AppLayout,
  TransitDashboard,
  TransitDetailModal,
} from '../components';
import type {
  Transit,
  TransitHighlight,
  TransitCalendarDay,
  TransitDashboardData,
} from '../components/TransitDashboard';
import {
  useCharts,
  useTodayTransits,
  useTransitForecast,
  useTransitCalendar,
} from '../hooks';
import { getErrorMessage } from '../utils/errorHandling';
import {
  mapReadingToTransit,
  deriveHighlights,
  buildCalendarDays,
} from '../utils/transitHelpers';

export default function TransitPage() {
  const navigate = useNavigate();
  const { charts, fetchCharts, isLoading: chartsLoading } = useCharts();
  const [selectedTransit, setSelectedTransit] = useState<Transit | null>(null);

  // Ensure charts are loaded so we know whether the user has any.
  useEffect(() => {
    void fetchCharts();
  }, [fetchCharts]);

  const hasCharts = charts.length > 0;
  const hasCalculatedChart = charts.some((c) => c.calculated_data != null);

  // Current month/year for calendar queries
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // React Query hooks -- only enabled when user has charts.
  const {
    data: todayReading,
    isLoading: todayLoading,
    error: todayError,
  } = useTodayTransits(hasCalculatedChart);

  const {
    data: weekReadings,
    isLoading: weekLoading,
    error: weekError,
  } = useTransitForecast('week', hasCalculatedChart);

  const {
    data: calendarReadings,
    isLoading: calendarLoading,
    error: calendarError,
  } = useTransitCalendar(currentMonth, currentYear, hasCalculatedChart);

  // Aggregate error from any query
  const queryError =
    todayError ?? weekError ?? calendarError;
  const errorMessage = queryError ? getErrorMessage(queryError, 'Failed to load transit data') : null;

  // Build TransitDashboardData from raw readings
  const dashboardData: TransitDashboardData | null = useMemo(() => {
    const todayTransits: Transit[] = todayReading
      ? (todayReading.transits ?? []).map((t) => mapReadingToTransit(t, todayReading))
      : [];

    const weekTransits: Transit[] = weekReadings
      ? weekReadings.flatMap((r) => (r.transits ?? []).map((t) => mapReadingToTransit(t, r)))
      : [];

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

  // Loading state -- wait for charts and at least the primary query.
  const isLoading = chartsLoading || (hasCharts && (todayLoading || weekLoading || calendarLoading));

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Current Transits</h1>
        <p className="text-slate-200">
          Real-time planetary transits affecting your natal chart
        </p>
      </div>

      {isLoading ? (
        <SkeletonLoader variant="list" count={5} />
      ) : errorMessage ? (
        <EmptyState
          icon="⚠️"
          title="Unable to load transits"
          description={errorMessage}
          actionText="Retry"
          onAction={() => window.location.reload()}
        />
      ) : !hasCharts ? (
        <EmptyState
          icon="🌙"
          title="No transit data available"
          description="Transit calculations require a natal chart. Please create a chart first to view your transits."
          actionText="Create Chart"
          onAction={() => navigate('/charts/new')}
          secondaryActionText="Go to Dashboard"
          onSecondaryAction={() => navigate('/dashboard')}
        />
      ) : dashboardData ? (
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
      ) : null}
    </AppLayout>
  );
}
