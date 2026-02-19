/**
 * Lunar Return Dashboard Component
 * Main dashboard showing current lunar return and countdown
 */

import React, { useState, useEffect } from 'react';
import { LunarReturnChart, getCurrentLunarReturn, getNextLunarReturn, calculateLunarReturnChart } from '@/services/lunarReturn.api';
import './LunarReturn.css';

interface LunarReturnDashboardProps {
  onChartClick?: (chart: LunarReturnChart) => void;
  onForecastClick?: () => void;
  onHistoryClick?: () => void;
}

const LunarReturnDashboard: React.FC<LunarReturnDashboardProps> = ({
  onChartClick,
  onForecastClick,
  onHistoryClick,
}) => {
  const [loading, setLoading] = useState(true);
  const [currentReturn, setCurrentReturn] = useState<{
    returnDate: Date;
    daysUntil: number;
  } | null>(null);
  const [nextReturn, setNextReturn] = useState<{
    nextReturn: Date;
    natalMoon: { sign: string; degree: number; minute: number; second: number };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [currentData, nextData] = await Promise.all([
        getCurrentLunarReturn(),
        getNextLunarReturn(),
      ]);

      setCurrentReturn(currentData);
      setNextReturn(nextData);
    } catch (err: any) {
      console.error('Error loading lunar return data:', err);
      setError(err.response?.data?.error || 'Failed to load lunar return data');
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (intensity: number): string => {
    if (intensity <= 3) return 'low';
    if (intensity <= 6) return 'medium';
    if (intensity <= 8) return 'high';
    return 'extreme';
  };

  const getMoonPhaseIcon = (phase: string): string => {
    const icons: Record<string, string> = {
      'new': '🌑',
      'waxing-crescent': '🌒',
      'first-quarter': '🌓',
      'waxing-gibbous': '🌔',
      'full': '🌕',
      'waning-gibbous': '🌖',
      'last-quarter': '🌗',
      'waning-crescent': '🌘',
    };
    return icons[phase] || '🌙';
  };

  if (loading) {
    return (
      <div className="lunar-return-dashboard">
        <div className="loading-spinner">Loading lunar return data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lunar-return-dashboard">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lunar-return-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h2>Lunar Return Dashboard</h2>
        <p className="subtitle">Your monthly emotional forecast</p>
      </div>

      {/* Countdown Card */}
      {currentReturn && (
        <div className="countdown-card">
          <div className="countdown-header">
            <h3>Next Lunar Return</h3>
            <span className="moon-icon">🌙</span>
          </div>
          <div className="countdown-content">
            <div className="days-until">
              <span className="number">{currentReturn.daysUntil}</span>
              <span className="label">days until return</span>
            </div>
            <div className="return-date">
              {new Date(currentReturn.returnDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
          <div className="countdown-footer">
            <p>
              Your lunar return occurs when the moon returns to its natal position,
              marking a new emotional cycle.
            </p>
          </div>
        </div>
      )}

      {/* Natal Moon Info */}
      {nextReturn && (
        <div className="natal-moon-card">
          <h3>Your Natal Moon</h3>
          <div className="moon-position">
            <span className="sign">{nextReturn.natalMoon.sign}</span>
            <span className="degree">
              {nextReturn.natalMoon.degree}° {nextReturn.natalMoon.minute}'"
            </span>
          </div>
          <p className="description">
            The moon's position at your birth determines when your emotional cycles
            reset. Each lunar return brings new opportunities for growth.
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={onForecastClick} className="action-button primary">
          <span className="icon">📊</span>
          <span>View Monthly Forecast</span>
        </button>
        <button onClick={onChartClick && (() => {
          // Calculate chart for next return
          if (currentReturn) {
            calculateLunarReturnChart(currentReturn.returnDate)
              .then(onChartClick)
              .catch(console.error);
          }
        })} className="action-button secondary">
          <span className="icon">🌗</span>
          <span>View Return Chart</span>
        </button>
        <button onClick={onHistoryClick} className="action-button tertiary">
          <span className="icon">📚</span>
          <span>View History</span>
        </button>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h3>About Lunar Returns</h3>
        <div className="info-grid">
          <div className="info-card">
            <span className="icon">🔄</span>
            <h4>Every 27.3 Days</h4>
            <p>The moon returns to its natal position approximately monthly, starting a new emotional cycle.</p>
          </div>
          <div className="info-card">
            <span className="icon">🏠</span>
            <h4>House Placement</h4>
            <p>The house shows which life area will be highlighted emotionally this month.</p>
          </div>
          <div className="info-card">
            <span className="icon">🌓</span>
            <h4>Moon Phase</h4>
            <p>The phase at your return influences the emotional tone and energy of the month.</p>
          </div>
          <div className="info-card">
            <span className="icon">💫</span>
            <h4>Intensity</h4>
            <p>Some months are more emotionally charged than others based on aspects and phase.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LunarReturnDashboard;
