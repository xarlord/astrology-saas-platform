/**
 * Solar Returns Page
 * Main page for solar return feature
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SolarReturnDashboard, SolarReturnChart, SolarReturnInterpretation, RelocationCalculator, BirthdaySharing } from '../components';
import { Calendar, Settings, Share2, ArrowLeft } from 'lucide-react';
import './SolarReturnsPage.css';

interface SolarReturn {
  id: string;
  year: number;
  returnDate: string;
  returnLocation: {
    name: string;
  };
  calculatedData: any;
  interpretation: any;
  isRelocated: boolean;
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
      fetchSolarReturn(parseInt(yearParam));
    }
  }, [yearParam]);

  const fetchSolarReturn = async (year: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/v1/solar-returns/year/${year}`);
      setSelectedReturn(response.data.data);
      setSelectedYear(year);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Solar return doesn't exist, redirect to dashboard
        navigate('/solar-returns');
      } else {
        setError(err.response?.data?.error?.message || 'Failed to load solar return');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async (location: any) => {
    if (!selectedReturn) return null;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `/api/v1/solar-returns/${selectedReturn.id}/recalculate`,
        { location }
      );

      setSelectedReturn(response.data.data);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to recalculate');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSelectYear = (year: number) => {
    navigate(`/solar-returns/${year}`);
    fetchSolarReturn(year);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const renderBreadcrumb = () => {
    return (
      <div className="breadcrumb">
        <button onClick={() => navigate('/solar-returns')} className="back-link">
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {selectedYear && (
          <>
            <span className="separator">/</span>
            <span className="current">Solar Return {selectedYear}</span>
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
      <div className="view-mode-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.mode}
            className={viewMode === tab.mode ? 'active' : ''}
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
    <div className="solar-returns-page">
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
            const solarReturn = selectedReturn;
            // Fetch full details
            axios.get(`/api/v1/solar-returns/${id}`)
              .then(res => {
                setSelectedReturn(res.data.data);
                setSelectedYear(res.data.data.year);
              })
              .catch(err => {
                setError(err.response?.data?.error?.message || 'Failed to load solar return');
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
                  chartData={selectedReturn.calculatedData}
                  year={selectedReturn.year}
                  location={selectedReturn.returnLocation.name}
                  showAspects={true}
                  showHouses={true}
                />
              )}

              {viewMode === 'interpretation' && selectedReturn.interpretation && (
                <SolarReturnInterpretation
                  interpretation={selectedReturn.interpretation}
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
                  onRecalculate={handleRecalculate}
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
