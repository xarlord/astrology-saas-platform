/**
 * Today's Transits Page Component
 *
 * Focused view of today's planetary transits. Renders TransitDashboard
 * with only today's data, deriving week/month/highlights from the
 * single day's reading.
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
import { useCharts, useTodayTransits } from '../hooks';
import { getErrorMessage } from '../utils/errorHandling';
import {
  mapReadingToTransit,
  deriveHighlights,
  buildSingleCalendarDay,
} from '../utils/transitHelpers';

export default function TodayTransitsPage() {
  const navigate = useNavigate();
  const { charts, fetchCharts, isLoading: chartsLoading } = useCharts();
  const [selectedTransit, setSelectedTransit] = useState<Transit | null>(null);

  // Ensure charts are loaded so we know whether the user has any.
  useEffect(() => {
    void fetchCharts();
  }, [fetchCharts]);

  const hasCharts = charts.length > 0;
  const hasCalculatedChart = charts.some((c) => c.calculated_data != null);

  // React Query hook -- only enabled when user has a calculated chart.
  const {
    data: todayReading,
    isLoading: todayLoading,
    error: todayError,
  } = useTodayTransits(hasCalculatedChart);

  const errorMessage = todayError
    ? getErrorMessage(todayError, 'Failed to load today\'s transits')
    : null;

  // Build TransitDashboardData from today's reading only.
  const dashboardData: TransitDashboardData | null = useMemo(() => {
    const todayTransits: Transit[] = todayReading
      ? (todayReading.transits ?? []).map((t) => mapReadingToTransit(t, todayReading))
      : [];

    const monthDays: TransitCalendarDay[] = buildSingleCalendarDay(todayReading);

    const highlights: TransitHighlight[] = deriveHighlights(todayReading);

    return {
      today: todayTransits,
      week: todayTransits,
      month: monthDays,
      highlights,
    };
  }, [todayReading]);

  // Loading state -- wait for charts and the primary query.
  const isLoading = chartsLoading || (hasCharts && todayLoading);

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Today's Transits</h1>
        <p className="text-slate-200">
          Current planetary influences on your natal chart
        </p>
      </div>

      {isLoading ? (
        <SkeletonLoader variant="list" count={5} />
      ) : errorMessage ? (
        <EmptyState
          icon={<span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '48px', color: '#ef4444' }}>warning</span>}
          title="Unable to load transits"
          description={errorMessage}
          actionText="Retry"
          onAction={() => window.location.reload()}
        />
      ) : !hasCharts ? (
        <EmptyState
          icon={<span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '48px', color: '#8b5cf6' }}>dark_mode</span>}
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
