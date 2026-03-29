/**
 * Chart View Page Component
 * Displays a single natal chart with wheel visualization, planetary positions, and analysis link.
 */

import { SkeletonLoader, EmptyState, ChartWheel } from '../components';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chartService } from '../services';
import type { Chart, PlanetPosition, CalculatedChartData } from '../services/api.types';
import type { ChartData, PlanetPosition as WheelPlanetPosition, HouseCusp as WheelHouseCusp, Aspect as WheelAspect } from '../components/ChartWheel';

// Convert API's CalculatedChartData to ChartWheel's ChartData format
function toWheelData(data: CalculatedChartData): ChartData {
  return {
    planets: data.planets.map((p): WheelPlanetPosition => ({
      planet: p.planet,
      sign: p.sign,
      degree: p.degree,
      minute: p.minute,
      second: 0, // API doesn't provide seconds
      house: p.house,
      retrograde: p.retrograde,
      latitude: p.latitude,
      longitude: p.longitude,
      speed: p.speed,
    })),
    houses: data.houses.map((h): WheelHouseCusp => ({
      house: h.house,
      sign: h.sign,
      degree: h.longitude % 30,
      minute: 0,
      second: 0,
    })),
    aspects: data.aspects.map((a): WheelAspect => ({
      planet1: a.planet1,
      planet2: a.planet2,
      type: a.type as WheelAspect['type'],
      degree: a.degree,
      minute: 0,
      orb: a.orb,
      applying: a.applying,
      separating: !a.applying,
    })),
  };
}

export default function ChartViewPage() {
  const { chartId } = useParams<{ chartId: string }>();
  const [chartData, setChartData] = useState<Chart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chartId) {
      setLocalError('No chart ID provided.');
      return;
    }

      try {
        setIsLoading(true);
        setError(null);
        const { chart } = await chartService.getChart(chartId);
        setChartData(chart);
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosError.response?.data?.error?.message ?? 'Failed to load chart data');
        console.error('Chart loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void loadChart();
  }, [chartId]);

  const displayError = localError ?? error;
  const displayLoading = isLoading && !currentChart;

  // No chart ID at all
  if (!chartId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] to-[#141627] text-slate-100">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-4 py-4">
            <a href="/dashboard" className="text-primary-600 hover:text-primary-700">
              ← Back to Dashboard
            </a>
            <h1 className="text-2xl font-bold mt-4">Natal Chart</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <SkeletonLoader variant="chart" />
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
            <h1 className="text-2xl font-bold mt-4">Natal Chart</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <EmptyState
            icon="⚠️"
            title="Unable to load chart"
            description={error}
            actionText="Retry"
            onAction={() => window.location.reload()}
            secondaryActionText="Back to Dashboard"
            onSecondaryAction={() => window.location.href = '/dashboard'}
          />
        </main>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] to-[#141627] text-slate-100">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-4 py-4">
            <a href="/dashboard" className="text-primary-600 hover:text-primary-700">
              ← Back to Dashboard
            </a>
            <h1 className="text-2xl font-bold mt-4">Natal Chart</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <EmptyState
            icon="📊"
            title="Chart not found"
            description="The requested chart could not be found. It may have been deleted or you may not have access to it."
            actionText="Back to Dashboard"
            onAction={() => window.location.href = '/dashboard'}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] to-[#141627] text-slate-100">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-2">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold mt-4" data-testid="chart-name">{chartData?.name || 'Natal Chart'}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1" data-testid="chart-info">
            Born {chartData?.birth_data?.birth_date} at {chartData?.birth_data?.birth_time} in {chartData?.birth_data?.birth_place_name}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {chartData?.calculated_data ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Chart Wheel */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Chart Wheel</h2>
              <div className="aspect-square flex items-center justify-center">
                <ChartWheel
                  data={toWheelData(chartData.calculated_data)}
                />
              </div>
            </div>

            {/* Planetary Positions */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Planetary Positions</h2>
              <div className="space-y-2" data-testid="planetary-positions">
                {chartData.calculated_data.planets?.map((planet: PlanetPosition) => (
                  <div key={planet.planet} className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="font-medium">{planet.planet}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {planet.sign} {planet.degree}°{planet.minute}'
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon="📊"
            title="Chart not calculated"
            description="This chart hasn't been calculated yet. Click the button below to generate your natal chart."
            actionText="Calculate Chart"
            onAction={() => {
              void (async () => {
                try {
                  setIsLoading(true);
                  await chartService.calculateChart(chartId!);
                  const { chart } = await chartService.getChart(chartId!);
                  setChartData(chart);
                } catch (err) {
                  setError('Failed to calculate chart');
                } finally {
                  setIsLoading(false);
                }
              })();
            }}
            secondaryActionText="Back to Dashboard"
            onSecondaryAction={() => window.location.href = '/dashboard'}
          />
        )}

        <div className="mt-8 flex gap-4">
          <Link
            to={`/analysis/${chartId}`}
            className="btn-primary"
            data-testid="view-analysis-link"
          >
            View Analysis →
          </Link>
          <Link
            to={`/charts/${chartId}/edit`}
            className="btn-secondary"
            data-testid="edit-chart-link"
          >
            Edit Chart
          </Link>
        </div>
      </main>
    </div>
  );
}
