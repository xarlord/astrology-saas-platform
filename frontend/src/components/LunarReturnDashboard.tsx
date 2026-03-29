/**
 * Lunar Return Dashboard Component
 * Main dashboard showing current lunar return and countdown
 */

import React, { useState, useEffect } from 'react';
import { LunarReturnChart, getCurrentLunarReturn, getNextLunarReturn, calculateLunarReturnChart } from '@/services/lunarReturn.api';
import { INTENSITY_THRESHOLDS } from '../utils/constants';
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
    void loadData();
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
    } catch (err) {
      console.error('Error loading lunar return data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load lunar return data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const _getIntensityColor = (intensity: number): string => {
    if (intensity <= INTENSITY_THRESHOLDS.LOW_MAX) return 'low';
    if (intensity <= INTENSITY_THRESHOLDS.MEDIUM_MAX) return 'medium';
    if (intensity <= INTENSITY_THRESHOLDS.HIGH_MAX) return 'high';
    return 'extreme';
  };

  const _getMoonPhaseIcon = (phase: string): string => {
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
    return icons[phase] ?? '🌙';
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto p-5">
        <div className="py-10 text-center text-gray-400 text-lg">Loading lunar return data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lunar-return-dashboard">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => void loadData()} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-5">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl text-gray-800 mb-2">Lunar Return Dashboard</h2>
        <p className="text-gray-400">Your monthly emotional forecast</p>
      </div>

      {/* Countdown Card */}
      {currentReturn && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 rounded-2xl shadow-lg shadow-indigo-500/30 mb-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-2xl m-0">Next Lunar Return</h3>
            <span className="text-5xl">🌙</span>
          </div>
          <div className="text-center py-5">
            <div className="flex flex-col items-center mb-4">
              <span className="text-8xl font-bold leading-none">{currentReturn.daysUntil}</span>
              <span className="text-xl opacity-90 mt-2">days until return</span>
            </div>
            <div className="text-2xl font-medium opacity-95">
              {new Date(currentReturn.returnDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-white/20">
            <p className="opacity-90 leading-relaxed m-0">
              Your lunar return occurs when the moon returns to its natal position,
              marking a new emotional cycle.
            </p>
          </div>
        </div>
      )}

      {/* Natal Moon Info */}
      {nextReturn && (
        <div className="bg-white p-6 rounded-xl shadow-sm shadow-black/10 mb-6">
          <h3 className="m-0 mb-4 text-gray-800">Your Natal Moon</h3>
          <div className="flex gap-3 items-center mb-4">
            <span className="text-2xl font-bold text-indigo-500 capitalize">{nextReturn.natalMoon.sign}</span>
            <span className="text-xl text-gray-500">
              {nextReturn.natalMoon.degree}&deg; {nextReturn.natalMoon.minute}&apos;&quot;
            </span>
          </div>
          <p className="text-gray-500 leading-relaxed m-0">
            The moon&apos;s position at your birth determines when your emotional cycles
            reset. Each lunar return brings new opportunities for growth.
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 mb-8">
        <button onClick={onForecastClick} type="button" className="flex items-center gap-3 p-5 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-200 bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30">
          <span className="text-2xl">📊</span>
          <span>View Monthly Forecast</span>
        </button>
        <button onClick={onChartClick && (() => {
          if (currentReturn) {
            void calculateLunarReturnChart(currentReturn.returnDate)
              .then(onChartClick)
              .catch(console.error);
          }
        })} type="button" className="flex items-center gap-3 p-5 border-2 border-indigo-500 rounded-xl text-base font-semibold cursor-pointer transition-all duration-200 bg-white text-indigo-500 hover:bg-indigo-50">
          <span className="text-2xl">🌗</span>
          <span>View Return Chart</span>
        </button>
        <button onClick={onHistoryClick} type="button" className="flex items-center gap-3 p-5 border-2 border-gray-300 rounded-xl text-base font-semibold cursor-pointer transition-all duration-200 bg-white text-gray-500 hover:bg-gray-50">
          <span className="text-2xl">📚</span>
          <span>View History</span>
        </button>
      </div>

      {/* Info Section */}
      <div className="mt-8">
        <h3 className="text-center mb-6 text-gray-800">About Lunar Returns</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
          <div className="bg-white p-6 rounded-xl text-center shadow-sm shadow-black/10">
            <span className="text-4xl block mb-3">🔄</span>
            <h4 className="my-2 text-gray-800">Every 27.3 Days</h4>
            <p className="text-gray-500 leading-relaxed m-0">The moon returns to its natal position approximately monthly, starting a new emotional cycle.</p>
          </div>
          <div className="bg-white p-6 rounded-xl text-center shadow-sm shadow-black/10">
            <span className="text-4xl block mb-3">🏠</span>
            <h4 className="my-2 text-gray-800">House Placement</h4>
            <p className="text-gray-500 leading-relaxed m-0">The house shows which life area will be highlighted emotionally this month.</p>
          </div>
          <div className="bg-white p-6 rounded-xl text-center shadow-sm shadow-black/10">
            <span className="text-4xl block mb-3">🌓</span>
            <h4 className="my-2 text-gray-800">Moon Phase</h4>
            <p className="text-gray-500 leading-relaxed m-0">The phase at your return influences the emotional tone and energy of the month.</p>
          </div>
          <div className="bg-white p-6 rounded-xl text-center shadow-sm shadow-black/10">
            <span className="text-4xl block mb-3">💫</span>
            <h4 className="my-2 text-gray-800">Intensity</h4>
            <p className="text-gray-500 leading-relaxed m-0">Some months are more emotionally charged than others based on aspects and phase.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LunarReturnDashboard;
