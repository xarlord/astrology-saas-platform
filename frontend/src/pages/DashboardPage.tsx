/**
 * Dashboard Page Component
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useCharts } from '../hooks';
import { PlanetSymbol, SkeletonGrid, EmptyStates, AppLayout } from '../components';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { charts, fetchCharts, isLoading } = useCharts();

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchCharts();
  }, [isAuthenticated, fetchCharts]);

  return (
    <AppLayout>
      <div data-testid="dashboard">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Your Charts</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name}. Create and manage your natal charts.
          </p>
        </div>

        {isLoading ? (
          <SkeletonGrid count={3} />
        ) : charts.length === 0 ? (
          <EmptyStates.NoCharts
            onAction={() => navigate('/charts/new')}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="chart-list">
            {charts.map((chart) => (
              <div
                key={chart.id}
                onClick={() => navigate(`/charts/${chart.id}`)}
                data-testid="chart-card"
                className="bg-[#141627]/70 backdrop-blur-md rounded-xl border border-[#2f2645] hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{chart.name}</h3>
                  <span className="text-xs bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 px-2 py-1 rounded">
                    {chart.type}
                  </span>
                </div>
                <div className="text-sm text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">calendar_today</span>
                    {new Date(chart.birth_date).toLocaleDateString()}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">location_on</span>
                    {chart.birth_place_name}
                  </p>
                </div>
                {chart.calculated_data && (
                  <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <div className="flex gap-2 flex-wrap">
                      {Object.keys((chart.calculated_data as Record<string, Record<string, unknown>>).planets ?? {}).slice(0, 3).map((planet) => (
                        <PlanetSymbol key={planet} planet={planet} size="sm" />
                      ))}
                      <span className="text-xs text-gray-400">
                        +{Object.keys((chart.calculated_data as Record<string, Record<string, unknown>>).planets ?? {}).length - 3} more
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add New Chart Card */}
            <div
              onClick={() => navigate('/charts/new')}
              className="bg-transparent rounded-xl hover:bg-white/5 transition-colors cursor-pointer border-2 border-dashed border-[#2f2645] flex items-center justify-center min-h-[200px]"
            >
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }} aria-hidden="true">add</span>
                </div>
                <p className="font-medium text-slate-300">Create New Chart</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
