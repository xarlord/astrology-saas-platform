/**
 * Transit Page Component
 */

import { SkeletonLoader, EmptyState, AppLayout } from '../components';
import { useCharts } from '../hooks';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TransitPage() {
  const navigate = useNavigate();
  const { isLoading: _chartsLoading } = useCharts();
  const [transitData, setTransitData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTransits = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // TODO: Implement actual transit data fetching
        await new Promise(resolve => setTimeout(resolve, 1500));
        setTransitData(null);
      } catch (err) {
        setError('Failed to load transit data');
        console.error('Transit loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void loadTransits();
  }, []);

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Transit Forecast</h2>
      </div>

      {isLoading ? (
        <SkeletonLoader variant="list" count={5} />
      ) : error ? (
        <EmptyState
          icon="⚠️"
          title="Unable to load transits"
          description={error}
          actionText="Retry"
          onAction={() => window.location.reload()}
        />
      ) : !transitData ? (
        <EmptyState
          icon="🌙"
          title="No transit data available"
          description="Transit calculations require a natal chart. Please create a chart first to view your transits."
          actionText="Create Chart"
          onAction={() => navigate('/charts/new')}
          secondaryActionText="Go to Dashboard"
          onSecondaryAction={() => navigate('/dashboard')}
        />
      ) : (
        <div className="card">
          <p className="text-gray-600 dark:text-gray-400">Transit content will be displayed here.</p>
        </div>
      )}
    </AppLayout>
  );
}
