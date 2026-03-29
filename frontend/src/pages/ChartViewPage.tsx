/**
 * Chart View Page Component
 */

import { SkeletonLoader, EmptyState, AppLayout } from '../components';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function ChartViewPage() {
  const { chartId } = useParams<{ chartId: string }>();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChart = async () => {
      if (!chartId) return;

      try {
        setIsLoading(true);
        setError(null);
        // TODO: Implement actual chart data fetching
        // For now, simulating loading
        await new Promise(resolve => setTimeout(resolve, 1500));
        setChartData(null); // No chart data yet
      } catch (err) {
        setError('Failed to load chart data');
        console.error('Chart loading error:', err);
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
          onSecondaryAction={() => navigate('/dashboard')}
        />
      ) : !chartData ? (
        <EmptyState
          icon="📊"
          title="Chart not found"
          description="The requested chart could not be found. It may have been deleted or you may not have access to it."
          actionText="Back to Dashboard"
          onAction={() => navigate('/dashboard')}
        />
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Chart Wheel */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Chart Wheel</h3>
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Chart wheel visualization</p>
              </div>
            </div>

            {/* Planetary Positions */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Planetary Positions</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b dark:border-gray-700">
                  <span className="font-medium">Sun</span>
                  <span className="text-gray-600 dark:text-gray-400">Loading...</span>
                </div>
                <div className="flex justify-between py-2 border-b dark:border-gray-700">
                  <span className="font-medium">Moon</span>
                  <span className="text-gray-600 dark:text-gray-400">Loading...</span>
                </div>
                <div className="flex justify-between py-2 border-b dark:border-gray-700">
                  <span className="font-medium">Mercury</span>
                  <span className="text-gray-600 dark:text-gray-400">Loading...</span>
                </div>
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
