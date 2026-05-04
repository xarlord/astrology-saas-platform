/**
 * Solar Return Dashboard Component
 * Displays list of user's solar returns by year
 */

import React, { useState, useEffect, useCallback } from 'react';
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
      <div role="region" aria-label="Solar Return Dashboard" aria-busy="true" className="flex flex-col items-center justify-center py-16 px-8">
        <div className="w-[50px] h-[50px] border-4 border-white/15 border-t-primary rounded-full animate-spin mb-4" />
        <p aria-live="polite" className="text-slate-200">Loading your solar returns...</p>
      </div>
    );
  }

  return (
    <div role="region" aria-label="Solar Return Dashboard" className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white m-0">Your Solar Returns</h2>
        <p className="mt-1 text-slate-200">Birthday year forecasts and themes</p>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between p-4 bg-red-500/20 text-red-400 rounded-lg">
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-2 font-bold hover:text-red-300">&#10005;</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <button
            type="button"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-white/15 text-slate-200 hover:bg-white/15'
            }`}
            onClick={() => setFilter('all')}
          >
            All Returns
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'relocated'
                ? 'bg-primary text-white'
                : 'bg-white/15 text-slate-200 hover:bg-white/15'
            }`}
            onClick={() => setFilter('relocated')}
          >
            Relocated Only
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-200">Sort by:</label>
          <select
            title="Sort solar returns"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'year' | 'date')}
            className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/15 text-sm text-slate-200 focus:outline-none focus:border-primary"
          >
            <option value="year">Year</option>
            <option value="date">Return Date</option>
          </select>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          onClick={() => { void handleCalculateNew(new Date().getFullYear()); }}
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>calendar_today</span>
          Calculate Current Year
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getSortedReturns()
          .filter((sr) => filter === 'all' || sr.isRelocated)
          .map((solarReturn) => (
          <div
            key={solarReturn.id}
            className="glass-panel rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-l-4"
            onClick={() => onSelectSolarReturn?.(solarReturn.id)}
            style={{
              borderLeftColor: getThemeColor(solarReturn.interpretation?.themes ?? []),
            }}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/15">
              <h3 className="text-xl font-bold text-white m-0">{solarReturn.year}</h3>
              {solarReturn.isRelocated && (
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '14px' }}>location_on</span>
                  Relocated
                </span>
              )}
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '16px' }}>calendar_today</span>
                {new Date(solarReturn.returnDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>

              {solarReturn.returnLocation && (
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '16px' }}>location_on</span>
                  {solarReturn.returnLocation.name}
                </div>
              )}

              {solarReturn.interpretation?.themes && (
                <div className="flex flex-wrap gap-1.5">
                  {solarReturn.interpretation.themes.slice(0, 3).map((theme, index) => (
                    <span key={index} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                      {theme}
                    </span>
                  ))}
                  {solarReturn.interpretation.themes.length > 3 && (
                    <span className="px-2 py-0.5 bg-white/15 text-slate-200 rounded-full text-xs">
                      +{solarReturn.interpretation.themes.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {solarReturn.interpretation?.keywords && (
                <div className="flex flex-wrap gap-1.5">
                  {solarReturn.interpretation.keywords.slice(0, 4).map((keyword, index) => (
                    <span key={index} className="px-2 py-0.5 bg-white/15 text-slate-200 rounded text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t border-white/15 bg-white/15">
              <button type="button" className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium">
                View Details
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '16px' }}>trending_up</span>
              </button>
              <button type="button" className="p-2 text-slate-200 hover:text-pink-500 hover:bg-pink-500/20 rounded-lg transition-colors" title="Share as gift">
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '16px' }}>card_giftcard</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {solarReturns.length === 0 && !loading && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined mx-auto text-slate-200 mb-4" aria-hidden="true" style={{ fontSize: '48px' }}>calendar_today</span>
          <h3 className="text-xl font-semibold text-white mb-2">No Solar Returns Yet</h3>
          <p className="text-slate-200 mb-6">Calculate your first solar return to see your birthday year forecast</p>
          <button
            type="button"
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            onClick={() => { void handleCalculateNew(new Date().getFullYear()); }}
          >
            Calculate Solar Return for {new Date().getFullYear()}
          </button>
        </div>
      )}

      <div className="text-center pt-4">
        <button
          type="button"
          className="text-primary hover:text-primary/80 font-medium transition-colors"
          onClick={() => { void handleCalculateNew(new Date().getFullYear() + 1); }}
        >
          Calculate Next Year &rarr;
        </button>
      </div>
    </div>
  );
};

export default SolarReturnDashboard;
