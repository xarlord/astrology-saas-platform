/**
 * Chart View Page Component
 * Displays a single natal chart with wheel visualization, planetary positions, and analysis link.
 */

import { SkeletonLoader, EmptyState, ChartWheel, AppLayout } from '../components';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chartService } from '../services';
import { ShareCardModal } from '../components/chart/ShareCardModal';
import type { PlanetPosition, CalculatedChartData, Chart } from '../services/api.types';
import type {
  ChartData,
  PlanetPosition as WheelPlanetPosition,
  HouseCusp as WheelHouseCusp,
  Aspect as WheelAspect,
} from '../components/ChartWheel';

// Convert API's CalculatedChartData to ChartWheel's ChartData format
function toWheelData(data: CalculatedChartData): ChartData {
  return {
    planets: data.planets.map(
      (p): WheelPlanetPosition => ({
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
      }),
    ),
    houses: data.houses.map(
      (h): WheelHouseCusp => ({
        house: h.house,
        sign: h.sign,
        degree: h.longitude % 30,
        minute: 0,
        second: 0,
      }),
    ),
    aspects: data.aspects.map(
      (a): WheelAspect => ({
        planet1: a.planet1,
        planet2: a.planet2,
        type: a.type as WheelAspect['type'],
        degree: a.degree,
        minute: 0,
        orb: a.orb,
        applying: a.applying,
        separating: !a.applying,
      }),
    ),
  };
}

export default function ChartViewPage() {
  const { chartId } = useParams<{ chartId: string }>();
  const [chartData, setChartData] = useState<Chart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    const loadChart = async () => {
      if (!chartId) return;

      try {
        setIsLoading(true);
        setError(null);
        const { chart } = await chartService.getChart(chartId);
        setChartData(chart);
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosError.response?.data?.error?.message ?? 'Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    };

    void loadChart();
  }, [chartId]);

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Natal Chart</h2>
      </div>

      {isLoading ? (
        <SkeletonLoader variant="chart" />
      ) : error ? (
        <EmptyState
          icon="⚠️"
          title="Unable to load chart"
          description={error}
          actionText="Retry"
          onAction={() => window.location.reload()}
          secondaryActionText="Back to Dashboard"
          onSecondaryAction={() => {
            window.location.href = '/dashboard';
          }}
        />
      ) : !chartData ? (
        <EmptyState
          icon="📊"
          title="Chart not found"
          description="The requested chart could not be found. It may have been deleted or you may not have access to it."
          actionText="Back to Dashboard"
          onAction={() => {
            window.location.href = '/dashboard';
          }}
        />
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Chart Wheel */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Chart Wheel</h3>
              <div className="aspect-square flex items-center justify-center">
                {chartData.calculated_data ? (
                  <ChartWheel
                    data={toWheelData(chartData.calculated_data)}
                  />
                ) : (
                  <p className="text-gray-500">Chart wheel visualization</p>
                )}
              </div>
            </div>

            {/* Planetary Positions */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Planetary Positions</h3>
              <div className="space-y-2" data-testid="planetary-positions">
                {chartData.calculated_data?.planets?.map((planet: PlanetPosition) => (
                  <div
                    key={planet.planet}
                    className="flex justify-between py-2 border-b dark:border-gray-700"
                  >
                    <span className="font-medium">{planet.planet}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {planet.sign} {planet.degree}°{planet.minute}'
                    </span>
                  </div>
                )) ?? <p className="text-gray-500">No planetary data available</p>}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Link
              to={`/analysis/${chartId}`}
              className="btn-primary"
              data-testid="view-analysis-link"
            >
              View Analysis
            </Link>
            <Link
              to={`/charts/${chartId}/edit`}
              className="btn-secondary"
              data-testid="edit-chart-link"
            >
              Edit Chart
            </Link>
            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="btn-secondary flex items-center gap-2"
              data-testid="share-card-btn"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              Share Card
            </button>
          </div>

          <ShareCardModal
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            chartId={chartId ?? ''}
            chartName={chartData?.name}
          />
        </>
      )}
    </AppLayout>
  );
}
