/**
 * Solar Returns Page
 * Main page for solar return feature
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { SolarReturnDashboard, SolarReturnChart, SolarReturnInterpretation, RelocationCalculator, BirthdaySharing } from '../components';
import { Calendar, Settings, Share2, ArrowLeft } from 'lucide-react';
import './SolarReturnsPage.css';

interface SolarReturnInterpretationData {
  themes?: string[];
  overview?: string;
  sunHouse?: { house: number; interpretation: string };
  moonPhase?: { phase: string; interpretation: string };
  luckyDays?: { date: string; description: string }[];
  challenges?: { description: string; advice: string }[];
  opportunities?: { description: string; timing: string }[];
  advice?: string[];
  keywords?: string[];
  [key: string]: unknown;
}

interface SolarReturnCalculatedData {
  planets?: { planet: string; name: string; sign: string; degree: number; minute: number; house: number; retrograde?: boolean }[];
  houses?: { house: number; sign: string; degree: number; minute: number }[];
  aspects?: { planet1: string; planet2: string; type: string; orb: number; applying: boolean }[];
  ascendant?: { sign: string; degree: number; minute: number };
  mc?: { sign: string; degree: number; minute: number };
  moonPhase?: { phase: string; illumination: number };
  [key: string]: unknown;
}

interface SolarReturn {
  id: string;
  year: number;
  returnDate: string;
  returnLocation: {
    name: string;
  };
  calculatedData: SolarReturnCalculatedData;
  interpretation: SolarReturnInterpretationData;
  isRelocated: boolean;
}

interface RelocationLocation {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country?: string;
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

  // Fetch specific solar return if year is provided
  useEffect(() => {
    if (yearParam) {
      void fetchSolarReturn(parseInt(yearParam));
    }
  }, [yearParam]);

  const fetchSolarReturn = async (year: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<{ data: SolarReturn }>(`/solar-returns/year/${year}`);
      setSelectedReturn(response.data.data);
      setSelectedYear(year);
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { error?: { message?: string } } } };
      if (axiosError.response?.status === 404) {
        // Solar return doesn't exist, redirect to dashboard
        navigate('/solar-returns');
      } else {
        setError(axiosError.response?.data?.error?.message ?? 'Failed to load solar return');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async (location: RelocationLocation): Promise<SolarReturn | null> => {
    if (!selectedReturn) return null;

    try {
      setLoading(true);
      setError(null);

      const response = await api.post<{ data: SolarReturn }>(
        `/solar-returns/${selectedReturn.id}/recalculate`,
        { location }
      );

      setSelectedReturn(response.data.data);
      return response.data.data;
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosError.response?.data?.error?.message ?? 'Failed to recalculate');
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
      <div className="breadcrumb" data-testid="solar-returns-breadcrumb">
        <button onClick={() => navigate('/solar-returns')} className="back-link" data-testid="back-to-dashboard">
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {selectedYear && (
          <>
            <span className="separator">/</span>
            <span className="current" data-testid="current-solar-return-year">Solar Return {selectedYear}</span>
          </>
        )}
      </div>
    );
  };

  const renderViewModeTabs = () => {
    if (!selectedReturn) return null;

    const tabs: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
      { mode: 'chart', label: 'Chart', icon: <Calendar size={18} /> },
      { mode: 'interpretation', label: 'Interpretation', icon: <Calendar size={18} /> },
      { mode: 'relocate', label: 'Relocate', icon: <Settings size={18} /> },
      { mode: 'share', label: 'Share', icon: <Share2 size={18} /> },
    ];

    return (
      <div className="view-mode-tabs" data-testid="solar-returns-view-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.mode}
            className={viewMode === tab.mode ? 'active' : ''}
            onClick={() => handleViewModeChange(tab.mode)}
            data-testid={`solar-returns-view-${tab.mode}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="solar-returns-page" data-testid="solar-returns-page">
      <div className="page-header">
        <div>
          <h1>Solar Returns</h1>
          <p className="subtitle">Your birthday year forecasts and themes</p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {!selectedYear ? (
        <SolarReturnDashboard
          onSelectYear={handleSelectYear}
          onSelectSolarReturn={(id) => {
            // Fetch full details
            void api.get<{ data: SolarReturn }>(`/solar-returns/${id}`)
              .then(res => {
                setSelectedReturn(res.data.data);
                setSelectedYear(res.data.data.year);
              })
              .catch((err: unknown) => {
                const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
                setError(axiosError.response?.data?.error?.message ?? 'Failed to load solar return');
              });
          }}
        />
      ) : (
        <>
          {renderBreadcrumb()}

          {renderViewModeTabs()}

          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          )}

          {!loading && selectedReturn && (
            <div className="view-container">
              {viewMode === 'chart' && selectedReturn.calculatedData && (
                <SolarReturnChart
                  chartData={{
                    planets: (selectedReturn.calculatedData.planets ?? []).map(p => ({
                      planet: p.planet,
                      sign: p.sign,
                      degree: p.degree,
                      minute: p.minute ?? 0,
                      house: p.house,
                      retrograde: p.retrograde ?? false,
                    })),
                    houses: (selectedReturn.calculatedData.houses ?? []).map(h => ({
                      house: (h as { house: number }).house,
                      sign: (h as { sign: string }).sign,
                      degree: (h as { degree: number }).degree,
                      minute: (h as { minute?: number }).minute ?? 0,
                    })),
                    aspects: (selectedReturn.calculatedData.aspects ?? []).map(a => ({
                      planet1: (a as { planet1: string }).planet1,
                      planet2: (a as { planet2: string }).planet2,
                      type: (a as { type: string }).type,
                      orb: (a as { orb: number }).orb,
                      applying: (a as { applying: boolean }).applying,
                    })),
                    ascendant: selectedReturn.calculatedData.ascendant ?? { sign: 'Aries', degree: 0, minute: 0 },
                    mc: selectedReturn.calculatedData.mc ?? { sign: 'Capricorn', degree: 0, minute: 0 },
                    moonPhase: selectedReturn.calculatedData.moonPhase ?? { phase: 'full', illumination: 100 },
                  }}
                  year={selectedReturn.year}
                  location={selectedReturn.returnLocation.name}
                  showAspects={true}
                  showHouses={true}
                />
              )}

              {viewMode === 'interpretation' && selectedReturn.interpretation && (
                <SolarReturnInterpretation
                  interpretation={{
                    themes: selectedReturn.interpretation.themes ?? [],
                    sunHouse: (selectedReturn.interpretation.sunHouse ?? {
                      house: 1,
                      interpretation: 'Your solar return sun focuses on new beginnings.',
                      focus: ['self-expression', 'personal identity'],
                    }) as { house: number; interpretation: string; focus: string[] },
                    moonPhase: (selectedReturn.interpretation.moonPhase ?? {
                      phase: 'Full Moon',
                      interpretation: 'A time of culmination and emotional clarity.',
                      energy: 'High',
                      advice: ['Reflect on achievements', 'Release what no longer serves you'],
                    }) as { phase: string; interpretation: string; energy: string; advice: string[] },
                    luckyDays: (selectedReturn.interpretation.luckyDays ?? []) as unknown as { date: string; reason: string; intensity: number }[],
                    challenges: (selectedReturn.interpretation.challenges ?? []) as unknown as { area: string; description: string; advice: string }[],
                    opportunities: (selectedReturn.interpretation.opportunities ?? []) as unknown as { area: string; description: string; timing: string }[],
                    advice: selectedReturn.interpretation.advice ?? [],
                    keywords: selectedReturn.interpretation.keywords ?? [],
                  }}
                  year={selectedReturn.year}
                  returnDate={selectedReturn.returnDate}
                  onDownload={() => {
                    // Trigger download of interpretation as PDF/text
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
                  onRecalculate={async (location) => {
                    const result = await handleRecalculate({
                      name: location.name,
                      latitude: location.latitude,
                      longitude: location.longitude,
                      timezone: location.timezone,
                    });
                    if (!result) throw new Error('Failed to recalculate');
                    return {
                      id: result.id,
                      year: result.year,
                      returnDate: result.returnDate,
                      calculatedData: {
                        planets: (result.calculatedData.planets ?? []).map(p => ({
                          planet: p.planet,
                          house: p.house,
                          sign: p.sign,
                          longitude: p.degree, // Use degree as longitude approximation
                        })),
                        houses: result.calculatedData.houses ?? [],
                        aspects: result.calculatedData.aspects ?? [],
                      },
                      interpretation: {
                        themes: result.interpretation?.themes ?? [],
                        overview: result.interpretation?.overview,
                      },
                    };
                  }}
                />
              )}

              {viewMode === 'share' && selectedReturn.interpretation && (
                <BirthdaySharing
                  solarReturn={selectedReturn}
                  onShare={() => {
                    // Show success message
                    alert('Solar return shared successfully!');
                  }}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SolarReturnsPage;
