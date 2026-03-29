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

interface TransitData {
  // Placeholder interface - expand as needed
  id?: string;
  date?: string;
  transits?: unknown[];
}

export default function TransitPage() {
  useCharts(); // Initialize charts store (auto-loads charts)
  const [transitData, setTransitData] = useState<TransitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ensure charts are loaded so we know whether the user has any.
  useEffect(() => {
    void fetchCharts();
  }, [fetchCharts]);

  const hasCharts = charts.length > 0;

  // Current month/year for calendar queries
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // React Query hooks -- only enabled when user has charts.
  const {
    data: todayReading,
    isLoading: todayLoading,
    error: todayError,
  } = useTodayTransits(hasCharts);

  const {
    data: weekReadings,
    isLoading: weekLoading,
    error: weekError,
  } = useTransitForecast('week', hasCharts);

  const {
    data: calendarReadings,
    isLoading: calendarLoading,
    error: calendarError,
  } = useTransitCalendar(currentMonth, currentYear, hasCharts);

  // Aggregate error from any query
  const queryError =
    todayError ?? weekError ?? calendarError;
  const errorMessage = queryError ? getErrorMessage(queryError, 'Failed to load transit data') : null;

  // Build TransitDashboardData from raw readings
  const dashboardData: TransitDashboardData | null = useMemo(() => {
    const todayTransits: Transit[] = todayReading
      ? todayReading.transits.map((t) => mapReadingToTransit(t, todayReading))
      : [];

    const weekTransits: Transit[] = weekReadings
      ? weekReadings.flatMap((r) => r.transits.map((t) => mapReadingToTransit(t, r)))
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

    void loadTransits();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] to-[#141627] text-slate-100">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-4 py-4">
            <a href="/dashboard" className="text-primary-600 hover:text-primary-700">
              ← Back to Dashboard
            </a>
            <h1 className="text-2xl font-bold mt-4">Transit Forecast</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <SkeletonLoader variant="list" count={5} />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] to-[#141627] text-slate-100">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-4 py-4">
            <a href="/dashboard" className="text-primary-600 hover:text-primary-700">
              ← Back to Dashboard
            </a>
            <h1 className="text-2xl font-bold mt-4">Transit Forecast</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <EmptyState
            icon="⚠️"
            title="Unable to load transits"
            description={error}
            actionText="Retry"
            onAction={() => window.location.reload()}
          />
        </main>
      </div>
    );
  }

  if (!transitData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] to-[#141627] text-slate-100">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-4 py-4">
            <a href="/dashboard" className="text-primary-600 hover:text-primary-700">
              ← Back to Dashboard
            </a>
            <h1 className="text-2xl font-bold mt-4">Transit Forecast</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <EmptyState
            icon="🌙"
            title="No transit data available"
            description="Transit calculations require a natal chart. Please create a chart first to view your transits."
            actionText="Create Chart"
            onAction={() => window.location.href = '/charts/new'}
            secondaryActionText="Go to Dashboard"
            onSecondaryAction={() => window.location.href = '/dashboard'}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] to-[#141627] text-slate-100">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <a href="/dashboard" className="text-primary-600 hover:text-primary-700">
            ← Back to Dashboard
          </a>
          <h1 className="text-2xl font-bold mt-4">Transit Forecast</h1>
        </div>
      </header>

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
