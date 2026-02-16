/**
 * Dashboard Page Component
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useCharts } from '../hooks';
import { PlanetSymbol } from '../components';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { charts, fetchCharts, isLoading } = useCharts();

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchCharts();
  }, [isAuthenticated, fetchCharts]);

  const handleLogout = async () => {
    try {
      await useAuth().logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary-600">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome back, {user?.name}
            </p>
          </div>
          <nav className="flex gap-4 items-center">
            <button
              onClick={() => navigate('/charts/new')}
              className="btn-primary"
            >
              + New Chart
            </button>
            <button
              onClick={() => navigate('/transits')}
              className="btn-secondary"
            >
              Today's Transits
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Your Charts</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage your natal charts
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : charts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No charts yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first natal chart to get started
            </p>
            <button onClick={() => navigate('/charts/new')} className="btn-primary">
              Create Your First Chart
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charts.map((chart) => (
              <div
                key={chart.id}
                onClick={() => navigate(`/charts/${chart.id}`)}
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
                      {Object.keys(chart.calculated_data.planets || {}).slice(0, 3).map((planet) => (
                        <PlanetSymbol key={planet} planet={planet} size="sm" />
                      ))}
                      <span className="text-xs text-gray-400">
                        +{Object.keys(chart.calculated_data.planets || {}).length - 3} more
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
      </main>
    </div>
  );
}
