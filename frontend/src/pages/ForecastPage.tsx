/**
 * Transit Forecast Page Component
 *
 * Week/month-ahead transit forecast view. Uses useTransitForecast as the
 * primary data source and also fetches today's transits and calendar data
 * for a complete TransitDashboard experience.
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
import { useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '../utils/errorHandling';
import {
  mapReadingToTransit,
  deriveHighlights,
  buildCalendarDays,
} from '../utils/transitHelpers';

export default function ForecastPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
    data: monthReadings,
    isLoading: monthLoading,
    error: monthError,
  } = useTransitForecast('month', hasCalculatedChart);

  const {
    data: calendarReadings,
    isLoading: calendarLoading,
    error: calendarError,
  } = useTransitCalendar(currentMonth, currentYear, hasCalculatedChart);

  // Aggregate error from any query
  const queryError = todayError ?? monthError ?? calendarError;
  const errorMessage = queryError
    ? getErrorMessage(queryError, 'Failed to load transit forecast')
    : null;

  // Build TransitDashboardData from raw readings
  const dashboardData: TransitDashboardData | null = useMemo(() => {
    const todayTransits: Transit[] = todayReading
      ? (todayReading.transits ?? []).map((t) => mapReadingToTransit(t, todayReading))
      : [];

    const monthTransits: Transit[] = monthReadings
      ? monthReadings.flatMap((r) => (r.transits ?? []).map((t) => mapReadingToTransit(t, r)))
      : [];

    const monthDays: TransitCalendarDay[] = calendarReadings
      ? buildCalendarDays(calendarReadings, currentYear, currentMonth)
      : [];

    const highlights: TransitHighlight[] = deriveHighlights(todayReading);

    return {
      today: todayTransits,
      week: monthTransits,
      month: monthDays,
      highlights,
    };
  }, [todayReading, monthReadings, calendarReadings, currentYear, currentMonth]);

  // Loading state -- wait for charts and at least the primary query.
  const isLoading = chartsLoading || (hasCharts && (todayLoading || monthLoading || calendarLoading));

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Transit Forecast</h1>
        <p className="text-slate-200">
          Planetary influences affecting your chart in the coming weeks
        </p>
      </div>

      {isLoading ? (
        <SkeletonLoader variant="list" count={5} />
      ) : errorMessage ? (
        <EmptyState
          icon="⚠️"
          title="Unable to load forecast"
          description={errorMessage}
          actionText="Retry"
          onAction={() => void queryClient.invalidateQueries({ queryKey: ['transits'] })}
        />
      ) : !hasCharts ? (
        <EmptyState
          icon="🌙"
          title="No transit data available"
          description="Transit forecasts require a natal chart. Please create a chart first to view your forecast."
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
