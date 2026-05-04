/**
 * Solar Returns Page
 * Main page for solar return feature
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { SolarReturnDashboard, SolarReturnChart, SolarReturnInterpretation, RelocationCalculator, BirthdaySharing, AppLayout } from '../components';

interface RelocationLocation {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface SolarReturn {
  id: string;
  year: number;
  returnDate: string;
  returnLocation: {
    name: string;
  };
  calculatedData: Record<string, unknown>;
  interpretation: Record<string, unknown>;
  isRelocated: boolean;
}

interface SolarReturnApiResponse {
  data: SolarReturn;
}

type ViewMode = 'dashboard' | 'chart' | 'interpretation' | 'relocate' | 'share';

export const SolarReturnsPage: React.FC = () => {
  const { year: yearParam } = useParams();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedYear, setSelectedYear] = useState<number | null>(yearParam ? parseInt(yearParam) : null);
  const [selectedReturn, setSelectedReturn] = useState<SolarReturn | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  const fetchSolarReturn = useCallback(async (year: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<SolarReturnApiResponse>(`/v1/solar-returns/year/${year}`);
      setSelectedReturn(response.data.data);
      setSelectedYear(year);
    } catch (err: unknown) {
      const apiErr = err as { response?: { status?: number; data?: { error?: { message?: string } } } };
      if (apiErr.response?.status === 404) {
        navigate('/solar-returns');
      } else {
        setError(apiErr.response?.data?.error?.message ?? 'Failed to load solar return');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (yearParam) {
      void fetchSolarReturn(parseInt(yearParam));
    }
  }, [yearParam, fetchSolarReturn]);

  const handleRecalculate = async (location: RelocationLocation): Promise<SolarReturn | null> => {
    if (!selectedReturn) return null;

    try {
      setLoading(true);
      setError(null);

      const response = await api.post<SolarReturnApiResponse>(
        `/v1/solar-returns/${selectedReturn.id}/recalculate`,
        { location }
      );

      setSelectedReturn(response.data.data);
      return response.data.data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(apiErr.response?.data?.error?.message ?? 'Failed to recalculate');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSelectYear = (year: number) => {
    navigate(`/solar-returns/${year}`);
    void fetchSolarReturn(year);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const renderBreadcrumb = () => {
    return (
      <div className="flex items-center gap-2 mb-4 text-sm">
        <button
          onClick={() => navigate('/solar-returns')}
          className="flex items-center gap-1 text-primary/80 hover:text-primary"
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>arrow_back</span>
          Back to Dashboard
        </button>

        {selectedYear && (
          <>
            <span className="text-slate-200">/</span>
            <span className="text-slate-200">Solar Return {selectedYear}</span>
          </>
        )}
      </div>
    );
  };

  const renderViewModeTabs = () => {
    if (!selectedReturn) return null;

    const tabs: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
      { mode: 'chart', label: 'Chart', icon: <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>calendar_today</span> },
      { mode: 'interpretation', label: 'Interpretation', icon: <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>calendar_today</span> },
      { mode: 'relocate', label: 'Relocate', icon: <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>settings</span> },
      { mode: 'share', label: 'Share', icon: <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>share</span> },
    ];

    return (
      <div
        role="tablist"
        aria-label="Solar return view mode"
        className="flex gap-2.5 mb-5 border-b-2 border-white/15 pb-2.5"
        onKeyDown={(e) => {
          const idx = tabs.findIndex((t) => t.mode === viewMode);
          if (e.key === 'ArrowRight' && idx < tabs.length - 1) { e.preventDefault(); handleViewModeChange(tabs[idx + 1].mode); }
          if (e.key === 'ArrowLeft' && idx > 0) { e.preventDefault(); handleViewModeChange(tabs[idx - 1].mode); }
        }}
      >
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.mode}
            role="tab"
            id={`solar-tab-${tab.mode}`}
            aria-selected={viewMode === tab.mode}
            aria-controls="solar-tabpanel"
            tabIndex={viewMode === tab.mode ? 0 : -1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              viewMode === tab.mode
                ? 'bg-primary text-white'
                : 'bg-transparent text-slate-200 hover:bg-white/15 hover:text-white'
            }`}
            onClick={() => handleViewModeChange(tab.mode)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Solar Returns</h1>
        <p className="text-slate-200">
          Your birthday year forecasts and themes
        </p>
      </div>

      {error && (
        <div role="alert" aria-live="assertive" className="mb-4 p-3 bg-red-900/30 text-red-400 rounded-xl text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-2" aria-label="Dismiss error">✕</button>
        </div>
      )}

      {shareSuccess && (
        <div role="status" aria-live="polite" className="mb-4 p-3 bg-green-900/30 text-green-400 rounded-xl text-sm">
          Solar return shared successfully!
        </div>
      )}

      {!selectedYear ? (
        <SolarReturnDashboard
          onSelectYear={handleSelectYear}
          onSelectSolarReturn={(id) => {
            void api.get<SolarReturnApiResponse>(`/v1/solar-returns/${id}`)
              .then(res => {
                setSelectedReturn(res.data.data);
                setSelectedYear(res.data.data.year);
              })
              .catch((err: unknown) => {
                const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
                setError(apiErr.response?.data?.error?.message ?? 'Failed to load solar return');
              });
          }}
        />
      ) : (
        <>
          {renderBreadcrumb()}
          {renderViewModeTabs()}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-200">Loading...</p>
            </div>
          )}

          {!loading && selectedReturn && (
            <div role="tabpanel" id="solar-tabpanel" aria-labelledby={`solar-tab-${viewMode}`} className="min-h-[400px]">
              {viewMode === 'chart' && selectedReturn.calculatedData && (
                <SolarReturnChart
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                  chartData={selectedReturn.calculatedData as any}
                  year={selectedReturn.year}
                  location={selectedReturn.returnLocation.name}
                  showAspects={true}
                  showHouses={true}
                />
              )}

              {viewMode === 'interpretation' && selectedReturn.interpretation && (
                <SolarReturnInterpretation
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                  interpretation={selectedReturn.interpretation as any}
                  year={selectedReturn.year}
                  returnDate={selectedReturn.returnDate}
                  onDownload={() => {
                    const blob = new Blob([JSON.stringify(selectedReturn.interpretation, null, 2)], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `solar-return-${selectedReturn.year}-interpretation.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  onShare={() => handleViewModeChange('share')}
                />
              )}

              {viewMode === 'relocate' && (
                <RelocationCalculator
                  natalChartId={selectedReturn.id}
                  year={selectedReturn.year}
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                  onRecalculate={handleRecalculate as any}
                />
              )}

              {viewMode === 'share' && selectedReturn.interpretation && (
                <BirthdaySharing
                  solarReturn={selectedReturn}
                  onShare={() => {
                    setShareSuccess(true);
                    setTimeout(() => setShareSuccess(false), 3000);
                  }}
                />
              )}
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default SolarReturnsPage;
