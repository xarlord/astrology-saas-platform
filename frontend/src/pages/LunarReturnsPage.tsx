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
} from '../components';
import { LunarReturnChart } from '../services/lunarReturn.api';
import './LunarReturnsPage.css';

type ViewMode = 'dashboard' | 'chart' | 'forecast' | 'history';

const LunarReturnsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedChart, setSelectedChart] = useState<LunarReturnChart | null>(null);
  const [selectedReturnDate, setSelectedReturnDate] = useState<Date | undefined>(undefined);

  const handleChartClick = (chart: LunarReturnChart) => {
    setSelectedChart(chart);
    setViewMode('chart');
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

    const tabs: Array<{ mode: ViewMode; label: string }> = [
      { mode: 'dashboard', label: 'Dashboard' },
      { mode: 'forecast', label: 'Forecast' },
      { mode: 'history', label: 'History' },
    ];

    return (
      <div className="view-mode-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.mode}
            className={viewMode === tab.mode ? 'active' : ''}
            onClick={() => setViewMode(tab.mode)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="lunar-returns-page">
      <div className="page-header">
        <div>
          <h1>Lunar Returns</h1>
          <p className="subtitle">Your monthly emotional cycles and forecasts</p>
        </div>
        {viewMode !== 'dashboard' && (
          <button onClick={handleBackToDashboard} className="back-button">
            ← Back to Dashboard
          </button>
        )}
      </div>

      {renderViewModeTabs()}

      <div className="view-container">
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
            onChartClick={handleChartClick}
            onBack={handleBackToDashboard}
          />
        )}
      </div>
    </div>
  );
};

export default LunarReturnsPage;
