/**
 * Solar Return Dashboard Component
 * Displays list of user's solar returns by year
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

interface SolarReturn {
  id: string;
  year: number;
  returnDate: string;
  returnLocation: {
    name: string;
    latitude: number;
    longitude: number;
  };
  interpretation?: {
    themes: string[];
    keywords: string[];
  };
  isRelocated: boolean;
  createdAt: string;
}

interface SolarReturnDashboardProps {
  onSelectYear?: (year: number) => void;
  onSelectSolarReturn?: (id: string) => void;
}

export const SolarReturnDashboard: React.FC<SolarReturnDashboardProps> = ({
  onSelectYear,
  onSelectSolarReturn,
}) => {
  const [solarReturns, setSolarReturns] = useState<SolarReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'relocated'>('all');
  const [sortBy, setSortBy] = useState<'year' | 'date'>('year');

  const fetchSolarReturns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<{ data: SolarReturn[] }>('/solar-returns/history', {
        params: {
          includeRelocated: filter === 'all',
        },
      });

      setSolarReturns(response.data.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message ?? 'Failed to load solar returns');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void fetchSolarReturns();
  }, [fetchSolarReturns]);

  const handleCalculateNew = useCallback(
    async (year: number) => {
      try {
        // Get default natal chart
        const chartsResponse = await api.get<{ data: { id: string }[] }>('/v1/charts');
        const defaultChart = chartsResponse.data.data[0];

        if (!defaultChart) {
          setError('Please create a natal chart first');
          return;
        }

        // Calculate solar return
        await api.post('/v1/solar-returns/calculate', {
          natalChartId: defaultChart.id,
          year,
        });

        // Refresh list
        await fetchSolarReturns();

        // Call callback if provided
        if (onSelectYear) {
          onSelectYear(year);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to calculate solar return';
        setError(errorMessage);
      }
    },
    [fetchSolarReturns, onSelectYear],
  );

  // Memoized sorted returns
  const sortedReturns = useMemo(() => {
    const sorted = [...solarReturns];

    if (sortBy === 'year') {
      return sorted.sort((a, b) => b.year - a.year);
    } else {
      return sorted.sort(
        (a, b) => new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime(),
      );
    }
  }, [solarReturns, sortBy]);

  // Memoized filtered returns
  const filteredReturns = useMemo(() => {
    return sortedReturns.filter((sr) => filter === 'all' || sr.isRelocated);
  }, [sortedReturns, filter]);

  // Memoized handlers
  const handleFilterChange = useCallback((newFilter: 'all' | 'relocated') => {
    setFilter(newFilter);
  }, []);

  const handleSortChange = useCallback((newSortBy: 'year' | 'date') => {
    setSortBy(newSortBy);
  }, []);

  const handleCardClick = useCallback(
    (id: string) => {
      onSelectSolarReturn?.(id);
    },
    [onSelectSolarReturn],
  );

  const handleCalculateCurrentYear = useCallback(() => {
    void handleCalculateNew(new Date().getFullYear());
  }, [handleCalculateNew]);

  const handleCalculateNextYear = useCallback(() => {
    void handleCalculateNew(new Date().getFullYear() + 1);
  }, [handleCalculateNew]);

  const getThemeColor = useCallback((themes: string[]) => {
    if (themes.length === 0) return '#666';

    const themeColors: Record<string, string> = {
      'Personal empowerment': '#FF6B6B',
      'Financial growth': '#4ECDC4',
      'Intellectual growth': '#45B7D1',
      'Domestic harmony': '#FFA07A',
      'Love affairs': '#FF69B4',
      'Job performance': '#50C878',
      Marriage: '#DDA0DD',
      'Personal metamorphosis': '#9370DB',
      'Spiritual growth': '#E6E6FA',
      'Professional success': '#FFD700',
      'Social networks': '#87CEEB',
      Solitude: '#D3D3D3',
    };

    for (const theme of themes) {
      if (themeColors[theme]) {
        return themeColors[theme];
      }
    }

    return '#666';
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  if (loading) {
    return (
      <div
        role="region"
        aria-label="Solar Return Dashboard"
        aria-busy="true"
        className="flex flex-col items-center justify-center py-16 px-8"
      >
        <div className="w-[50px] h-[50px] border-4 border-gray-200 dark:border-gray-700 border-t-indigo-500 dark:border-t-indigo-400 rounded-full animate-spin mb-4" />
        <p aria-live="polite" className="text-gray-500 dark:text-gray-400">
          Loading your solar returns...
        </p>
      </div>
    );
  }

  return (
    <div role="region" aria-label="Solar Return Dashboard" className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">Your Solar Returns</h2>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Birthday year forecasts and themes</p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"
        >
          {error}
          <button onClick={clearError}>✕</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => handleFilterChange('all')}
          >
            All Returns
          </button>
          <button
            className={filter === 'relocated' ? 'active' : ''}
            onClick={() => handleFilterChange('relocated')}
          >
            Relocated Only
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 dark:text-gray-400">Sort by:</label>
          <select
            title="Sort solar returns"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as 'year' | 'date')}
          >
            <option value="year">Year</option>
            <option value="date">Return Date</option>
          </select>
        </div>

        <button className="calculate-new-btn" onClick={handleCalculateCurrentYear}>
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          Calculate Current Year
        </button>
      </div>

      <div className="solar-returns-grid">
        {filteredReturns.map((solarReturn) => (
          <div
            key={solarReturn.id}
            className="solar-return-card"
            onClick={() => handleCardClick(solarReturn.id)}
            style={{
              borderLeftColor: getThemeColor(solarReturn.interpretation?.themes ?? []),
            }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white m-0">
                {solarReturn.year}
              </h3>
              {solarReturn.isRelocated && (
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  Relocated
                </span>
              )}
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                {new Date(solarReturn.returnDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>

              {solarReturn.returnLocation && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {solarReturn.returnLocation.name}
                </div>
              )}

              {solarReturn.interpretation?.themes && (
                <div className="flex flex-wrap gap-1.5">
                  {solarReturn.interpretation.themes.slice(0, 3).map((theme, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs"
                    >
                      {theme}
                    </span>
                  ))}
                  {solarReturn.interpretation.themes.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-xs">
                      +{solarReturn.interpretation.themes.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {solarReturn.interpretation?.keywords && (
                <div className="flex flex-wrap gap-1.5">
                  {solarReturn.interpretation.keywords.slice(0, 4).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                type="button"
                className="flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600 font-medium"
              >
                View Details
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
              </button>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors"
                title="Share as gift"
              >
                <span className="material-symbols-outlined text-[16px]">redeem</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {solarReturns.length === 0 && !loading && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-[48px] mx-auto text-gray-300 dark:text-gray-600 mb-4">
            calendar_month
          </span>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Solar Returns Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Calculate your first solar return to see your birthday year forecast
          </p>
          <button className="calculate-first-btn" onClick={handleCalculateCurrentYear}>
            Calculate Solar Return for {new Date().getFullYear()}
          </button>
        </div>
      )}

      <div className="text-center pt-4">
        <button className="archive-link" onClick={handleCalculateNextYear}>
          Calculate Next Year &rarr;
        </button>
      </div>
    </div>
  );
};

export default SolarReturnDashboard;
