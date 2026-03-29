/**
 * Relocation Calculator Component
 * Calculate solar returns for different locations
 */

import React, { useState } from 'react';
import { MapPin, Globe, Search, ArrowRight, Info } from 'lucide-react';
import axios from 'axios';

interface Location {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country?: string;
  region?: string;
}

interface SolarReturnInterpretation {
  themes: string[];
  overview?: string;
}

interface SolarReturnCalculatedData {
  planets: { planet: string; house: number; sign: string; longitude: number }[];
  houses?: unknown[];
  aspects?: unknown[];
}

interface SolarReturnData {
  id: string;
  year: number;
  returnDate: string;
  calculatedData: SolarReturnCalculatedData;
  interpretation: SolarReturnInterpretation;
}

interface RelocationCalculatorProps {
  natalChartId: string;
  year: number;
  onRecalculate: (location: Location) => Promise<SolarReturnData>;
}

interface GeocodingResponse {
  results: Location[];
}

interface HouseChange {
  planet: string;
  originalHouse: number;
  relocatedHouse: number;
  change: number;
}

interface ThemeChanges {
  added: string[];
  removed: string[];
}

export const RelocationCalculator: React.FC<RelocationCalculatorProps> = ({
  year,
  onRecalculate,
}) => {
  const [_locations, setLocations] = useState<Location[]>([]);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message :
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Failed to calculate relocated chart';
      setError(errorMessage);
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
      const response = await axios.get<GeocodingResponse>('https://geocoding-api.example.com/search', {
        params: { q: searchQuery },
      });

      setLocations((response.data as { results: Location[] }).results);
    } catch (err) {
      // Fallback to manual entry
      setError('Location search unavailable. Please enter coordinates manually.');
    } finally {
      setLoading(false);
    }
  };

  const getHouseChanges = (): HouseChange[] => {
    if (!originalReturn || !relocatedReturn) return [];

    const originalSun = originalReturn.calculatedData.planets.find((p) => p.planet === 'sun');
    const relocatedSun = relocatedReturn.calculatedData.planets.find((p) => p.planet === 'sun');

    if (!originalSun || !relocatedSun) return [];

    return [{
      planet: 'Sun',
      originalHouse: originalSun.house,
      relocatedHouse: relocatedSun.house,
      change: relocatedSun.house - originalSun.house,
    }];
  };

  const getThemeChanges = (): ThemeChanges => {
    if (!originalReturn?.interpretation || !relocatedReturn?.interpretation) {
      return { added: [], removed: [] };
    }

    const originalThemes: string[] = originalReturn.interpretation.themes || [];
    const relocatedThemes: string[] = relocatedReturn.interpretation.themes || [];

    return {
      added: relocatedThemes.filter((t) => !originalThemes.includes(t)),
      removed: originalThemes.filter((t) => !relocatedThemes.includes(t)),
    };
  };

  const themesAdded = getThemeChanges().added;
  const themesRemoved = getThemeChanges().removed;

  return (
    <div className="p-8 max-w-[1000px] mx-auto md:p-4" role="region" aria-label="Relocation Calculator">
      <div className="flex items-center gap-6 mb-8 md:flex-col md:text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl flex items-center justify-center text-white">
          <Globe size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Solar Return Relocation</h2>
          <p className="text-gray-500 dark:text-gray-400 text-base">Calculate your solar return for different locations</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg py-4 px-5 flex gap-3 items-start mb-8">
        <Info size={20} className="text-emerald-700 shrink-0 mt-0.5" />
        <p className="text-emerald-700 text-[0.925rem] leading-relaxed m-0">
          Relocating for your solar return can shift the house placements and themes for your birthday year.
          Choose a location to see how your solar return changes.
        </p>
      </div>

      {/* Search Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Choose a Location</h3>

        <div className="flex gap-3 items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-sm">
          <Search size={20} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search for a city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') void handleSearch(); }}
          />
          <button onClick={() => void handleSearch()} disabled={loading || !searchQuery}>
            Search
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md py-3 px-4 mt-4 flex justify-between items-center text-red-700 text-sm" role="alert">
            {error}
            <button onClick={() => setError(null)} className="bg-transparent border-none text-xl cursor-pointer p-0 ml-2">✕</button>
          </div>
        )}
      </div>

      {/* Popular Locations */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Popular Locations</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 md:grid-cols-1" aria-label="Popular locations">
          {popularLocations.map((location, index) => (
            <button
              key={index}
              className="location-card"
              onClick={() => { void handleLocationSelect(location); }}
              disabled={loading}
            >
              <MapPin size={20} className="text-indigo-500 shrink-0" />
              <span className="text-sm text-gray-800 dark:text-gray-200">{location.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison View */}
      {showComparison && relocatedReturn && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-8 mt-8" aria-live="polite">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Relocation Comparison</h3>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-8 md:grid-cols-1">
            {/* Original */}
            <div className="comparison-card original">
              <h4>Original Location</h4>
              <div className="location-details">
                <p><strong>Year:</strong> {year}</p>
                <p><strong>Return Date:</strong> {new Date(originalReturn?.returnDate ?? '').toLocaleDateString()}</p>
              </div>

              {originalReturn?.interpretation && (
                <div className="themes-preview">
                  <h5>Themes:</h5>
                  <div className="theme-tags">
                    {originalReturn.interpretation.themes.slice(0, 3).map((theme, i: number) => (
                      <span key={i} className="theme-tag original">{theme}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Arrow */}
            <div className="flex justify-center text-indigo-500 md:rotate-90 md:my-2 md:mx-auto">
              <ArrowRight size={32} />
            </div>

            {/* Relocated */}
            <div className="border-2 border-indigo-500 rounded-lg p-5">
              <h4 className="text-lg font-semibold mb-4 text-indigo-500">Relocated Chart</h4>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong>Location:</strong> {selectedLocation?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2"><strong>Return Date:</strong> {new Date(relocatedReturn.returnDate).toLocaleDateString()}</p>
              </div>

              {relocatedReturn.interpretation && (
                <div className="themes-preview">
                  <h5>Themes:</h5>
                  <div className="theme-tags">
                    {relocatedReturn.interpretation.themes.slice(0, 3).map((theme, i: number) => (
                      <span key={i} className="theme-tag relocated">{theme}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* House Changes */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">House Placement Changes</h4>
            <div className="flex flex-col gap-3">
              {getHouseChanges().map((change, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <span className="font-semibold text-gray-800 dark:text-gray-200 min-w-[80px]">{change.planet}</span>
                  <span className="text-gray-500 dark:text-gray-400">House {change.originalHouse}</span>
                  <ArrowRight size={16} />
                  <span className="text-indigo-500 font-semibold">House {change.relocatedHouse}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Changes */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Theme Changes</h4>

            {getThemeChanges().added.length > 0 && (
              <div className="theme-group added">
                <h5>New Themes:</h5>
                <div className="theme-tags">
                  {getThemeChanges().added.map((theme, i: number) => (
                    <span key={i} className="theme-tag added">{theme}</span>
                  ))}
                </div>
              </div>
            )}

            {getThemeChanges().removed.length > 0 && (
              <div className="theme-group removed">
                <h5>Themes No Longer Active:</h5>
                <div className="theme-tags">
                  {getThemeChanges().removed.map((theme, i: number) => (
                    <span key={i} className="theme-tag removed">{theme}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-600 md:flex-col">
            <button
              onClick={() => setShowComparison(false)}
              className="py-3 px-6 rounded-lg font-semibold cursor-pointer transition-all duration-200 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 border border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 md:w-full"
            >
              Close Comparison
            </button>
            <button
              onClick={() => window.print()}
              className="py-3 px-6 rounded-lg font-semibold cursor-pointer transition-all duration-200 bg-indigo-500 text-white border-none hover:bg-indigo-600 md:w-full"
            >
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
          void handleLocationSelect(location);
        }}>
          <div className="form-row">
            <label>Location Name</label>
            <input name="name" type="text" required placeholder="e.g., Paris, France" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Latitude</label>
            <input name="latitude" type="number" step="0.0001" required aria-required="true" placeholder="e.g., 48.8566" className="py-2.5 px-2.5 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 dark:bg-gray-700" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Longitude</label>
            <input name="longitude" type="number" step="0.0001" required aria-required="true" placeholder="e.g., 2.3522" className="py-2.5 px-2.5 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 dark:bg-gray-700" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Timezone</label>
            <input name="timezone" type="text" required aria-required="true" placeholder="e.g., Europe/Paris" className="py-2.5 px-2.5 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10 dark:bg-gray-700" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-500 text-white border-none py-3 px-6 rounded-lg font-semibold cursor-pointer justify-self-start transition-colors duration-200 hover:not-disabled:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Calculating...' : 'Calculate Chart'}
          </button>
        </form>
      </details>
    </div>
  );
};

export default RelocationCalculator;
