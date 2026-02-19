/**
 * Chart View Page Component
 */

import { SkeletonLoader, EmptyState } from '../components';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function ChartViewPage() {
  const { chartId } = useParams<{ chartId: string }>();
  const [chartData, setChartData] = useState<any>(null);
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

    loadChart();
  }, [chartId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <a href="/dashboard" className="text-primary-600 hover:text-primary-700">
            ← Back to Dashboard
          </a>
          <h1 className="text-2xl font-bold mt-4">Natal Chart</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Chart Wheel */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Chart Wheel</h2>
            <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart wheel visualization</p>
            </div>
          </div>

          {/* Planetary Positions */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Planetary Positions</h2>
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
              {/* More planets... */}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <a href={`/analysis/${chartId}`} className="btn-primary">
            View Analysis →
          </a>
        </div>
      </main>
    </div>
  );
}
