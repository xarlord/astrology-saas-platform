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
      <div
        role="tablist"
        aria-label="Lunar return view mode"
        className="flex gap-2.5 mb-5 border-b-2 border-white/15 pb-2.5 sm:flex-wrap"
        onKeyDown={(e) => {
          const idx = tabs.findIndex((t) => t.mode === viewMode);
          if (e.key === 'ArrowRight' && idx < tabs.length - 1) { e.preventDefault(); setViewMode(tabs[idx + 1].mode); }
          if (e.key === 'ArrowLeft' && idx > 0) { e.preventDefault(); setViewMode(tabs[idx - 1].mode); }
        }}
      >
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.mode}
            role="tab"
            id={`lunar-tab-${tab.mode}`}
            aria-selected={viewMode === tab.mode}
            aria-controls="lunar-tabpanel"
            tabIndex={viewMode === tab.mode ? 0 : -1}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              viewMode === tab.mode
                ? 'bg-primary text-white'
                : 'bg-transparent text-slate-200 hover:bg-white/15 hover:text-white'
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
          <h1 className="text-3xl font-bold mb-2 gradient-text">Lunar Returns</h1>
          <p className="text-slate-200">
            Your monthly emotional cycles and forecasts
          </p>
        </div>
        {viewMode !== 'dashboard' && (
          <button
            onClick={handleBackToDashboard}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition-colors"
          >
            ← Back to Dashboard
          </button>
        )}
      </div>

      {renderViewModeTabs()}

      <div role="tabpanel" id="lunar-tabpanel" aria-labelledby={`lunar-tab-${viewMode}`} className="min-h-[400px]">
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
