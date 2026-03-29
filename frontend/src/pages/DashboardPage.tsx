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
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{chart.name}</h3>
                  <span className="text-xs bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 px-2 py-1 rounded">
                    {chart.type}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>📅 {new Date(chart.birth_date).toLocaleDateString()}</p>
                  <p>📍 {chart.birth_place_name}</p>
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
              className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center min-h-[200px]"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">➕</div>
                <p className="font-medium text-gray-600 dark:text-gray-400">Create New Chart</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
