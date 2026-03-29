/**
 * Chart View Page Component
 * Displays a single natal chart with wheel visualization, planetary positions, and analysis link.
 */

import { SkeletonLoader, EmptyState, AppLayout, ChartWheel, ChartWheelLegend } from '../components';
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useChartsStore } from '../store/chartsStore';
import type { ChartData } from '../types/chart.types';

export default function ChartViewPage() {
  const { chartId } = useParams<{ chartId: string }>();
  const navigate = useNavigate();
  const { currentChart, isLoading, error, fetchChart } = useChartsStore();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!chartId) {
      setLocalError('No chart ID provided.');
      return;
    }

    void fetchChart(chartId);
  }, [chartId, fetchChart]);

  // Extract ChartData from the chart's calculated_data, or fall back to null
  const chartData: ChartData | null = (() => {
    if (!currentChart?.calculated_data) return null;
    const calc = currentChart.calculated_data;
    // Validate that calculated_data has the expected shape
    if (
      Array.isArray(calc.planets) &&
      Array.isArray(calc.houses) &&
      Array.isArray(calc.aspects)
    ) {
      return calc as unknown as ChartData;
    }
    return null;
  })();

  const displayError = localError ?? error;
  const displayLoading = isLoading && !currentChart;

  // No chart ID at all
  if (!chartId) {
    return (
      <AppLayout>
        <EmptyState
          icon="📊"
          title="No chart specified"
          description="No chart ID was provided in the URL."
          actionText="Back to Dashboard"
          onAction={() => navigate('/dashboard')}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          {currentChart ? currentChart.name : 'Natal Chart'}
        </h2>
        {currentChart && (
          <p className="text-gray-600 dark:text-gray-400">
            {currentChart.birth_date} &middot; {currentChart.birth_time} &middot;{' '}
            {currentChart.birth_place_name}
          </p>
        )}
      </div>

      {displayLoading ? (
        <SkeletonLoader variant="chart" />
      ) : displayError ? (
        <EmptyState
          icon="⚠️"
          title="Unable to load chart"
          description={displayError}
          actionText="Retry"
          onAction={() => {
            setLocalError(null);
            void fetchChart(chartId);
          }}
          secondaryActionText="Back to Dashboard"
          onSecondaryAction={() => navigate('/dashboard')}
        />
      ) : !currentChart ? (
        <EmptyState
          icon="📊"
          title="Chart not found"
          description="The requested chart could not be found. It may have been deleted or you may not have access to it."
          actionText="Back to Dashboard"
          onAction={() => navigate('/dashboard')}
        />
      ) : !chartData ? (
        <div className="space-y-6">
          {/* Chart exists but hasn't been calculated yet */}
          <EmptyState
            icon="🧮"
            title="Chart not yet calculated"
            description="This chart has been created but not yet calculated. Calculate it to see the full chart wheel and planetary positions."
            actionText="Back to Dashboard"
            onAction={() => navigate('/dashboard')}
          />
          <div className="text-center">
            <Link to={`/analysis/${chartId}`} className="btn-primary">
              View Analysis
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Chart Wheel */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Chart Wheel</h3>
              <ChartWheel data={chartData} interactive={true} />
              <ChartWheelLegend />
            </div>

            {/* Planetary Positions */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Planetary Positions</h3>
              <div className="space-y-2">
                {chartData.planets.map((planet) => (
                  <div
                    key={planet.planet}
                    className="flex justify-between py-2 border-b dark:border-gray-700"
                  >
                    <span className="font-medium capitalize">{planet.planet}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {planet.sign} {planet.degree}&deg;{planet.minute}&apos;{' '}
                      {planet.retrograde && '(R)'}
                    </span>
                  </div>
                ))}
              </div>

              {/* House Cusps */}
              <h3 className="text-xl font-bold mb-4 mt-6">House Cusps</h3>
              <div className="space-y-2">
                {chartData.houses.map((house) => (
                  <div
                    key={house.house}
                    className="flex justify-between py-2 border-b dark:border-gray-700"
                  >
                    <span className="font-medium">House {house.house}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {house.sign} {house.degree}&deg;{house.minute}&apos;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link to={`/analysis/${chartId}`} className="btn-primary">
              View Analysis
            </Link>
          </div>
        </>
      )}
    </AppLayout>
  );
}
