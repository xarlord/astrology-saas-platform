/**
 * Synastry Page
 * Main page for synastry/compatibility feature
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SynastryPage from '../components/SynastryPage';
import { chartService, Chart } from '../services/chart.service';
import AppLayout from '../components/AppLayout';

const SynastryPageWrapper: React.FC = () => {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCharts();
  }, []);

  const loadCharts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { charts } = await chartService.getCharts();
      setCharts(charts);
    } catch (err: any) {
      console.error('Error loading charts:', err);
      setError(err.response?.data?.error || 'Failed to load charts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading charts...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="error-message">{error}</div>
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
