/**
 * Solar Return Dashboard Component
 * Displays list of user's solar returns by year
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Gift, TrendingUp } from 'lucide-react';
import './SolarReturnDashboard.css';

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

      const response = await axios.get<{ data: SolarReturn[] }>('/api/v1/solar-returns/history', {
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

  const handleCalculateNew = useCallback(async (year: number) => {
    try {
      // Get default natal chart
      const chartsResponse = await axios.get<{ data: { id: string }[] }>('/api/v1/charts');
      const defaultChart = chartsResponse.data.data[0];

      if (!defaultChart) {
        setError('Please create a natal chart first');
        return;
      }

      // Calculate solar return
      await axios.post('/api/v1/solar-returns/calculate', {
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate solar return';
      setError(errorMessage);
    }
  }, [fetchSolarReturns, onSelectYear]);

  // Memoized sorted returns
  const sortedReturns = useMemo(() => {
    const sorted = [...solarReturns];

    if (sortBy === 'year') {
      return sorted.sort((a, b) => b.year - a.year);
    } else {
      return sorted.sort((a, b) =>
        new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime()
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

  const handleCardClick = useCallback((id: string) => {
    onSelectSolarReturn?.(id);
  }, [onSelectSolarReturn]);

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
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  if (loading) {
    return (
      <div className="solar-return-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading your solar returns...</p>
      </div>
    );
  }

  return (
    <div className="solar-return-dashboard">
      <div className="dashboard-header">
        <h2>Your Solar Returns</h2>
        <p className="subtitle">Birthday year forecasts and themes</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={clearError}>✕</button>
        </div>
      )}

      <div className="dashboard-controls">
        <div className="filters">
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

        <div className="sort-controls">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as 'year' | 'date')}
          >
            <option value="year">Year</option>
            <option value="date">Return Date</option>
          </select>
        </div>

        <button
          className="calculate-new-btn"
          onClick={handleCalculateCurrentYear}
        >
          <Calendar size={18} />
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
            <div className="card-header">
              <h3>{solarReturn.year}</h3>
              {solarReturn.isRelocated && (
                <span className="relocated-badge">
                  <MapPin size={14} />
                  Relocated
                </span>
              )}
            </div>

            <div className="card-content">
              <div className="return-date">
                <Calendar size={16} />
                {new Date(solarReturn.returnDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>

              {solarReturn.returnLocation && (
                <div className="location">
                  <MapPin size={16} />
                  {solarReturn.returnLocation.name}
                </div>
              )}

              {solarReturn.interpretation?.themes && (
                <div className="themes">
                  {solarReturn.interpretation.themes.slice(0, 3).map((theme, index) => (
                    <span key={index} className="theme-tag">
                      {theme}
                    </span>
                  ))}
                  {solarReturn.interpretation.themes.length > 3 && (
                    <span className="theme-count">
                      +{solarReturn.interpretation.themes.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {solarReturn.interpretation?.keywords && (
                <div className="keywords">
                  {solarReturn.interpretation.keywords.slice(0, 4).map((keyword, index) => (
                    <span key={index} className="keyword-tag">
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="card-footer">
              <button className="view-btn">
                View Details
                <TrendingUp size={16} />
              </button>
              <button className="gift-btn" title="Share as gift">
                <Gift size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {solarReturns.length === 0 && !loading && (
        <div className="empty-state">
          <Calendar size={48} />
          <h3>No Solar Returns Yet</h3>
          <p>Calculate your first solar return to see your birthday year forecast</p>
          <button
            className="calculate-first-btn"
            onClick={handleCalculateCurrentYear}
          >
            Calculate Solar Return for {new Date().getFullYear()}
          </button>
        </div>
      )}

      <div className="dashboard-footer">
        <button
          className="archive-link"
          onClick={handleCalculateNextYear}
        >
          Calculate Next Year →
        </button>
      </div>
    </div>
  );
};

export default SolarReturnDashboard;
