/**
 * Solar Return Dashboard Component
 * Displays list of user's solar returns by year
 */

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Calendar, MapPin, Gift, TrendingUp } from 'lucide-react';

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

      const response = await api.get('/v1/solar-returns/history', {
        params: {
          includeRelocated: filter === 'all',
        },
      });

      const responseData = response.data as { data: SolarReturn[] };
      setSolarReturns(responseData.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message ?? 'Failed to load solar returns');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void fetchSolarReturns();
  }, [fetchSolarReturns]);

  const handleCalculateNew = async (year: number) => {
    try {
      // Get default natal chart
      const chartsResponse = await api.get('/v1/charts');
      const chartsResponseData = chartsResponse.data as { data: { id: string }[] };
      const defaultChart = chartsResponseData.data[0];

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
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr.response?.data?.error?.message ?? 'Failed to calculate solar return');
    }
  };

  const getSortedReturns = () => {
    const sorted = [...solarReturns];

    if (sortBy === 'year') {
      return sorted.sort((a, b) => b.year - a.year);
    } else {
      return sorted.sort((a, b) =>
        new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime()
      );
    }
  };

  const getThemeColor = (themes: string[]) => {
    if (themes.length === 0) return '#666';

    const themeColors: Record<string, string> = {
      'Personal empowerment': '#FF6B6B',
      'Financial growth': '#4ECDC4',
      'Intellectual growth': '#45B7D1',
      'Domestic harmony': '#FFA07A',
      'Love affairs': '#FF69B4',
      'Job performance': '#50C878',
      'Marriage': '#DDA0DD',
      'Personal metamorphosis': '#9370DB',
      'Spiritual growth': '#E6E6FA',
      'Professional success': '#FFD700',
      'Social networks': '#87CEEB',
      'Solitude': '#D3D3D3',
    };

    for (const theme of themes) {
      if (themeColors[theme]) {
        return themeColors[theme];
      }
    }

    return '#666';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8">
        <div className="w-[50px] h-[50px] border-4 border-gray-200 dark:border-gray-700 border-t-indigo-500 dark:border-t-indigo-400 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading your solar returns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">Your Solar Returns</h2>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Birthday year forecasts and themes</p>
      </div>

      {error && (
        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-2 font-bold hover:text-red-800 dark:hover:text-red-300">&#10005;</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <button
            type="button"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setFilter('all')}
          >
            All Returns
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'relocated'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setFilter('relocated')}
          >
            Relocated Only
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 dark:text-gray-400">Sort by:</label>
          <select
            title="Sort solar returns"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'year' | 'date')}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
          >
            <option value="year">Year</option>
            <option value="date">Return Date</option>
          </select>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
          onClick={() => { void handleCalculateNew(new Date().getFullYear()); }}
        >
          <Calendar size={18} />
          Calculate Current Year
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getSortedReturns()
          .filter((sr) => filter === 'all' || sr.isRelocated)
          .map((solarReturn) => (
          <div
            key={solarReturn.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-l-4"
            onClick={() => onSelectSolarReturn?.(solarReturn.id)}
            style={{
              borderLeftColor: getThemeColor(solarReturn.interpretation?.themes ?? []),
            }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white m-0">{solarReturn.year}</h3>
              {solarReturn.isRelocated && (
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                  <MapPin size={14} />
                  Relocated
                </span>
              )}
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={16} />
                {new Date(solarReturn.returnDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>

              {solarReturn.returnLocation && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin size={16} />
                  {solarReturn.returnLocation.name}
                </div>
              )}

              {solarReturn.interpretation?.themes && (
                <div className="flex flex-wrap gap-1.5">
                  {solarReturn.interpretation.themes.slice(0, 3).map((theme, index) => (
                    <span key={index} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
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
                    <span key={index} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button type="button" className="flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600 font-medium">
                View Details
                <TrendingUp size={16} />
              </button>
              <button type="button" className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors" title="Share as gift">
                <Gift size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {solarReturns.length === 0 && !loading && (
        <div className="text-center py-16">
          <Calendar size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Solar Returns Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Calculate your first solar return to see your birthday year forecast</p>
          <button
            type="button"
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
            onClick={() => { void handleCalculateNew(new Date().getFullYear()); }}
          >
            Calculate Solar Return for {new Date().getFullYear()}
          </button>
        </div>
      )}

      <div className="text-center pt-4">
        <button
          type="button"
          className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
          onClick={() => { void handleCalculateNew(new Date().getFullYear() + 1); }}
        >
          Calculate Next Year &rarr;
        </button>
      </div>
    </div>
  );
};

export default SolarReturnDashboard;
