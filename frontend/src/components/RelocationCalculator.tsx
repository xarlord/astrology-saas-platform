/**
 * Relocation Calculator Component
 * Calculate solar returns for different locations
 */

import React, { useState } from 'react';
import { MapPin, Globe, Search, ArrowRight, Info } from 'lucide-react';
import axios from 'axios';
import './RelocationCalculator.css';

interface Location {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country?: string;
  region?: string;
}

interface SolarReturnData {
  id: string;
  year: number;
  returnDate: string;
  calculatedData: any;
  interpretation: any;
}

interface RelocationCalculatorProps {
  natalChartId: string;
  year: number;
  onRecalculate: (location: Location) => Promise<SolarReturnData>;
}

export const RelocationCalculator: React.FC<RelocationCalculatorProps> = ({
  natalChartId,
  year,
  onRecalculate,
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [originalReturn] = useState<SolarReturnData | null>(null);
  const [relocatedReturn, setRelocatedReturn] = useState<SolarReturnData | null>(null);

  // Popular locations
  const popularLocations: Location[] = [
    { name: 'New York, USA', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
    { name: 'London, UK', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
    { name: 'Paris, France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
    { name: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
    { name: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
    { name: 'Los Angeles, USA', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
  ];

  const handleLocationSelect = async (location: Location) => {
    try {
      setLoading(true);
      setError(null);

      const relocated = await onRecalculate(location);

      setRelocatedReturn(relocated);
      setShowComparison(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to calculate relocated chart');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Use geocoding API (placeholder - would use real geocoding service)
      const response = await axios.get('https://geocoding-api.example.com/search', {
        params: { q: searchQuery },
      });

      setLocations(response.data.results);
    } catch (err) {
      // Fallback to manual entry
      setError('Location search unavailable. Please enter coordinates manually.');
    } finally {
      setLoading(false);
    }
  };

  const getHouseChanges = () => {
    if (!originalReturn || !relocatedReturn) return [];

    const originalSun = originalReturn.calculatedData.planets.find((p: any) => p.planet === 'sun');
    const relocatedSun = relocatedReturn.calculatedData.planets.find((p: any) => p.planet === 'sun');

    if (!originalSun || !relocatedSun) return [];

    return [{
      planet: 'Sun',
      originalHouse: originalSun.house,
      relocatedHouse: relocatedSun.house,
      change: relocatedSun.house - originalSun.house,
    }];
  };

  const getThemeChanges = () => {
    if (!originalReturn?.interpretation || !relocatedReturn?.interpretation) {
      return { added: [], removed: [] };
    }

    const originalThemes = originalReturn.interpretation.themes || [];
    const relocatedThemes = relocatedReturn.interpretation.themes || [];

    return {
      added: relocatedThemes.filter((t: string) => !originalThemes.includes(t)),
      removed: originalThemes.filter((t: string) => !relocatedThemes.includes(t)),
    };
  };

  return (
    <div className="relocation-calculator">
      <div className="calculator-header">
        <div className="header-icon">
          <Globe size={32} />
        </div>
        <div>
          <h2>Solar Return Relocation</h2>
          <p className="subtitle">Calculate your solar return for different locations</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <Info size={20} />
        <p>
          Relocating for your solar return can shift the house placements and themes for your birthday year.
          Choose a location to see how your solar return changes.
        </p>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <h3>Choose a Location</h3>

        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search for a city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={loading || !searchQuery}>
            Search
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}
      </div>

      {/* Popular Locations */}
      <div className="popular-locations">
        <h3>Popular Locations</h3>
        <div className="locations-grid">
          {popularLocations.map((location, index) => (
            <button
              key={index}
              className="location-card"
              onClick={() => handleLocationSelect(location)}
              disabled={loading}
            >
              <MapPin size={20} />
              <span>{location.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison View */}
      {showComparison && relocatedReturn && (
        <div className="comparison-view">
          <h3>Relocation Comparison</h3>

          <div className="comparison-cards">
            {/* Original */}
            <div className="comparison-card original">
              <h4>Original Location</h4>
              <div className="location-details">
                <p><strong>Year:</strong> {year}</p>
                <p><strong>Return Date:</strong> {new Date(originalReturn?.returnDate || '').toLocaleDateString()}</p>
              </div>

              {originalReturn?.interpretation && (
                <div className="themes-preview">
                  <h5>Themes:</h5>
                  <div className="theme-tags">
                    {originalReturn.interpretation.themes.slice(0, 3).map((theme: string, i: number) => (
                      <span key={i} className="theme-tag original">{theme}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Arrow */}
            <div className="comparison-arrow">
              <ArrowRight size={32} />
            </div>

            {/* Relocated */}
            <div className="comparison-card relocated">
              <h4>Relocated Chart</h4>
              <div className="location-details">
                <p><strong>Location:</strong> {selectedLocation?.name}</p>
                <p><strong>Return Date:</strong> {new Date(relocatedReturn.returnDate).toLocaleDateString()}</p>
              </div>

              {relocatedReturn.interpretation && (
                <div className="themes-preview">
                  <h5>Themes:</h5>
                  <div className="theme-tags">
                    {relocatedReturn.interpretation.themes.slice(0, 3).map((theme: string, i: number) => (
                      <span key={i} className="theme-tag relocated">{theme}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* House Changes */}
          <div className="house-changes">
            <h4>House Placement Changes</h4>
            <div className="changes-list">
              {getHouseChanges().map((change, index) => (
                <div key={index} className="house-change">
                  <span className="planet-name">{change.planet}</span>
                  <span className="house-original">House {change.originalHouse}</span>
                  <ArrowRight size={16} />
                  <span className="house-relocated">House {change.relocatedHouse}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Changes */}
          <div className="theme-changes">
            <h4>Theme Changes</h4>

            {getThemeChanges().added.length > 0 && (
              <div className="theme-group added">
                <h5>New Themes:</h5>
                <div className="theme-tags">
                  {getThemeChanges().added.map((theme: string, i: number) => (
                    <span key={i} className="theme-tag added">{theme}</span>
                  ))}
                </div>
              </div>
            )}

            {getThemeChanges().removed.length > 0 && (
              <div className="theme-group removed">
                <h5>Themes No Longer Active:</h5>
                <div className="theme-tags">
                  {getThemeChanges().removed.map((theme: string, i: number) => (
                    <span key={i} className="theme-tag removed">{theme}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="comparison-actions">
            <button onClick={() => setShowComparison(false)} className="secondary-btn">
              Close Comparison
            </button>
            <button onClick={() => window.print()} className="primary-btn">
              Save Relocated Chart
            </button>
          </div>
        </div>
      )}

      {/* Manual Entry */}
      <details className="manual-entry">
        <summary>Enter coordinates manually</summary>
        <form className="manual-form" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const location: Location = {
            name: formData.get('name') as string,
            latitude: parseFloat(formData.get('latitude') as string),
            longitude: parseFloat(formData.get('longitude') as string),
            timezone: formData.get('timezone') as string,
          };
          handleLocationSelect(location);
        }}>
          <div className="form-row">
            <label>Location Name</label>
            <input name="name" type="text" required placeholder="e.g., Paris, France" />
          </div>

          <div className="form-row">
            <label>Latitude</label>
            <input name="latitude" type="number" step="0.0001" required placeholder="e.g., 48.8566" />
          </div>

          <div className="form-row">
            <label>Longitude</label>
            <input name="longitude" type="number" step="0.0001" required placeholder="e.g., 2.3522" />
          </div>

          <div className="form-row">
            <label>Timezone</label>
            <input name="timezone" type="text" required placeholder="e.g., Europe/Paris" />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate Chart'}
          </button>
        </form>
      </details>
    </div>
  );
};

export default RelocationCalculator;
