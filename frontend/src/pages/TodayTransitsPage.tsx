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
import type { TransitReading } from '../services/transit.service';
import { getErrorMessage } from '../utils/errorHandling';

/**
 * Map a raw TransitReading transit to a Transit object expected by
 * TransitDashboard.
 */
function mapReadingToTransit(
  r: TransitReading['transits'][number],
  reading: TransitReading,
): Transit {
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
 * Build a single-day TransitCalendarDay[] from today's reading.
 */
function buildSingleCalendarDay(
  reading: TransitReading | undefined,
): TransitCalendarDay[] {
  if (!reading) return [];

  const dateStr = reading.date.split('T')[0];
  const transits: Transit[] = reading.transits.map((t) => mapReadingToTransit(t, reading));

  return [
    {
      date: dateStr ?? reading.date,
      hasMajorTransit: reading.transits.some((t) => Math.abs(t.orb) <= 2),
      hasMoonPhase: false,
      hasEclipse: false,
      transits,
    },
  ];
}

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
      ? todayReading.transits.map((t) => mapReadingToTransit(t, todayReading))
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
        <h2 className="text-3xl font-bold mb-2">Today's Transits</h2>
        <p className="text-slate-400">
          Current planetary influences on your natal chart
        </p>
      </div>

      {isLoading ? (
        <SkeletonLoader variant="list" count={5} />
      ) : errorMessage ? (
        <EmptyState
          icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ef4444' }}>warning</span>}
          title="Unable to load transits"
          description={errorMessage}
          actionText="Retry"
          onAction={() => window.location.reload()}
        />
      ) : !hasCharts ? (
        <EmptyState
          icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#8b5cf6' }}>dark_mode</span>}
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
