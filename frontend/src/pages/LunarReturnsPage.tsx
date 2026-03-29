/**
 * Lunar Returns Page
 * Main page for lunar return and monthly forecasts feature
 */

import React, { useState } from 'react';
import {
  LunarReturnDashboard,
  LunarChartView,
  LunarForecastView,
  LunarHistoryView,
  AppLayout,
} from '../components';
import { LunarReturnChart, SavedLunarReturn } from '../services/lunarReturn.api';

type ViewMode = 'dashboard' | 'chart' | 'forecast' | 'history';

const LunarReturnsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedChart, setSelectedChart] = useState<LunarReturnChart | null>(null);
  const [selectedReturnDate, setSelectedReturnDate] = useState<Date | undefined>(undefined);

  const handleChartClick = (chart: LunarReturnChart) => {
    setSelectedChart(chart);
    setViewMode('chart');
  };

  const handleSavedReturnClick = (savedReturn: SavedLunarReturn) => {
    const chart: LunarReturnChart = {
      returnDate: new Date(savedReturn.returnDate),
      moonPosition: {
        sign: 'leo',
        degree: 15,
        minute: 30,
        second: 0,
      },
      moonPhase: 'full',
      housePlacement: 1,
      aspects: [],
      theme: savedReturn.theme,
      intensity: savedReturn.intensity,
    };
    handleChartClick(chart);
  };

  const handleForecastClick = () => {
    setViewMode('forecast');
  };

  const handleHistoryClick = () => {
    setViewMode('history');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedChart(null);
    setSelectedReturnDate(undefined);
  };

  const renderViewModeTabs = () => {
    if (viewMode === 'dashboard') return null;

    const tabs: { mode: ViewMode; label: string }[] = [
      { mode: 'dashboard', label: 'Dashboard' },
      { mode: 'forecast', label: 'Forecast' },
      { mode: 'history', label: 'History' },
    ];

    return (
      <div className="flex gap-2.5 mb-5 border-b-2 border-gray-200 dark:border-gray-700 pb-2.5 sm:flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.mode}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === tab.mode
                ? 'bg-indigo-600 text-white'
                : 'bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setViewMode(tab.mode)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">Lunar Returns</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your monthly emotional cycles and forecasts
          </p>
        </div>
        {viewMode !== 'dashboard' && (
          <button
            onClick={handleBackToDashboard}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
          >
            ← Back to Dashboard
          </button>
        )}
      </div>

      {renderViewModeTabs()}

      <div className="min-h-[400px]">
        {viewMode === 'dashboard' && (
          <LunarReturnDashboard
            onChartClick={handleChartClick}
            onForecastClick={handleForecastClick}
            onHistoryClick={handleHistoryClick}
          />
        )}

        {viewMode === 'chart' && selectedChart && (
          <LunarChartView
            chart={selectedChart}
            onBack={handleBackToDashboard}
          />
        )}

        {viewMode === 'forecast' && (
          <LunarForecastView
            returnDate={selectedReturnDate}
            onBack={handleBackToDashboard}
          />
        )}

        {viewMode === 'history' && (
          <LunarHistoryView
            onSelect={handleSavedReturnClick}
            onBack={handleBackToDashboard}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default LunarReturnsPage;
