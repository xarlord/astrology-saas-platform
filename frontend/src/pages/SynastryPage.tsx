/**
 * Synastry Page
 * Main page for synastry/compatibility feature
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SynastryPage from '../components/SynastryPage';
import { chartService, Chart } from '../services/chart.service';
import { AppLayout } from '../components/AppLayout';
import { SkeletonLoader, EmptyState } from '../components';

const SynastryPageWrapper: React.FC = () => {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    void loadCharts();
  }, []);

  const loadCharts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { charts } = await chartService.getCharts();
      setCharts(charts);
    } catch (err: unknown) {
      console.error('Error loading charts:', err);
      const errorObj = err as { response?: { data?: { error?: string } } };
      setError(errorObj.response?.data?.error ?? 'Failed to load charts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <SkeletonLoader variant="card" count={2} />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <EmptyState
          icon="⚠️"
          title="Unable to load charts"
          description={error}
          actionText="Retry"
          onAction={() => { void loadCharts(); }}
        />
      </AppLayout>
    );
  }

  if (charts.length === 0) {
    return (
      <AppLayout>
        <EmptyState
          icon="💫"
          title="No charts available"
          description="You need at least two charts to compare compatibility. Create your charts first."
          actionText="Create Chart"
          onAction={() => navigate('/charts/new')}
          secondaryActionText="Back to Dashboard"
          onSecondaryAction={() => navigate('/dashboard')}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SynastryPage charts={charts} />
    </AppLayout>
  );
};

export default SynastryPageWrapper;
