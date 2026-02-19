/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { useState, useEffect } from 'react';
import { useCreateChart, useCalculateChart, useCharts } from '../hooks';

// Types
export interface BirthData {
  birthDate: string;
  birthTime: string;
  timeUnknown: boolean;
  birthPlace: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  chartName: string;
  houseSystem: 'placidus' | 'koch' | 'porphyry' | 'whole' | 'equal' | 'topocentric';
  zodiac: 'tropical' | 'sidereal';
  siderealMode?: 'fagan-bradley' | 'lahiri' | 'raman' | 'fassbender';
}

interface BirthDataFormProps {
  onSuccess?: (chartId: string) => void;
  initialData?: Partial<BirthData>;
  submitLabel?: string;
}

const HOUSE_SYSTEMS = [
  { value: 'placidus', label: 'Placidus', description: 'Most commonly used house system' },
  { value: 'koch', label: 'Koch', description: 'Popular in German-speaking countries' },
  { value: 'porphyry', label: 'Porphyry', description: 'Based on equal segments of ecliptic' },
  { value: 'whole', label: 'Whole Sign', description: 'Each house covers entire sign' },
  { value: 'equal', label: 'Equal', description: 'Houses are equal 30° segments' },
  { value: 'topocentric', label: 'Topocentric', description: 'Based on local horizon' },
] as const;

const ZODIAC_TYPES = [
  { value: 'tropical', label: 'Tropical', description: 'Season-based zodiac (Western astrology)' },
  { value: 'sidereal', label: 'Sidereal', description: 'Star-based zodiac (Vedic astrology)' },
] as const;

const SIDEREAL_MODES = [
  { value: 'lahiri', label: 'Lahiri (Chitrapaksha)', description: 'Most popular ayanamsha' },
  { value: 'fagan-bradley', label: 'Fagan-Bradley', description: 'Western sidereal' },
  { value: 'raman', label: 'Raman', description: 'Indian ayanamsha' },
  { value: 'fassbender', label: 'Fassbender', description: 'European ayanamsha' },
] as const;

export function BirthDataForm({
  onSuccess,
  initialData,
  submitLabel = 'Generate Chart'
}: BirthDataFormProps) {
  const [formData, setFormData] = useState<BirthData>({
    birthDate: initialData?.birthDate || '',
    birthTime: initialData?.birthTime || '12:00',
    timeUnknown: initialData?.timeUnknown || false,
    birthPlace: initialData?.birthPlace || '',
    latitude: initialData?.latitude,
    longitude: initialData?.longitude,
    timezone: initialData?.timezone,
    chartName: initialData?.chartName || 'My Natal Chart',
    houseSystem: initialData?.houseSystem || 'placidus',
    zodiac: initialData?.zodiac || 'tropical',
    siderealMode: initialData?.siderealMode || 'lahiri',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BirthData, string>>>({});
  const [placeSuggestions, setPlaceSuggestions] = useState<string[]>([]);
  const [showPlaceSearch, setShowPlaceSearch] = useState(false);

  const createChartMutation = useCreateChart();
  const calculateChartMutation = useCalculateChart();
  const { currentChart } = useCharts();

  // Handle geocoding (place to coordinates)
  const searchPlace = async (query: string) => {
    if (!query || query.length < 3) {
      setPlaceSuggestions([]);
      return;
    }

    try {
      // Using OpenStreetMap Nominatim API (free, no key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&featuretype=city`
      );
      const data = await response.json();

      const suggestions = data.map((item: any) => item.display_name);
      setPlaceSuggestions(suggestions);
      setShowPlaceSearch(true);
    } catch (error) {
      console.error('Place search error:', error);
    }
  };

  // Get coordinates for selected place
  const getPlaceCoordinates = async (placeName: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&limit=1`
      );
      const data = await response.json();

      if (data?.[0]) {
        setFormData((prev) => ({
          ...prev,
          birthPlace: placeName,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        }));
        setShowPlaceSearch(false);
        setPlaceSuggestions([]);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  // Debounced place search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.birthPlace && formData.birthPlace.length >= 3) {
        searchPlace(formData.birthPlace);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.birthPlace]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BirthData, string>> = {};

    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    }

    if (!formData.timeUnknown && !formData.birthTime) {
      newErrors.birthTime = 'Birth time is required (or check "Time unknown")';
    }

    if (!formData.birthPlace) {
      newErrors.birthPlace = 'Birth place is required';
    }

    if (formData.latitude === undefined || formData.longitude === undefined) {
      newErrors.birthPlace = 'Please select a valid place from the suggestions';
    }

    if (!formData.chartName.trim()) {
      newErrors.chartName = 'Chart name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Create chart with birth data - match service format
      const chartData = {
        name: formData.chartName,
        type: 'natal' as const,
        birth_date: formData.birthDate,
        birth_time: formData.timeUnknown ? '00:00' : formData.birthTime,
        birth_time_unknown: formData.timeUnknown,
        birth_place_name: formData.birthPlace,
        birth_latitude: formData.latitude!,
        birth_longitude: formData.longitude!,
        birth_timezone: formData.timezone || 'UTC',
        house_system: formData.houseSystem,
        zodiac: formData.zodiac,
        sidereal_mode: formData.zodiac === 'sidereal' ? formData.siderealMode : undefined,
      };

      await createChartMutation.mutateAsync(chartData);

      // Calculate the chart using the currentChart from the store
      if (currentChart?.id) {
        await calculateChartMutation.mutateAsync(currentChart.id);
        onSuccess?.(currentChart.id);
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      setErrors({
        birthDate: error.message || 'Failed to create chart. Please try again.',
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof BirthData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Date & Time Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Date & Time
        </h3>
        <div className="space-y-4">
          {/* Birth Date */}
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Birth Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.birthDate
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400'
              } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white`}
            />
            {errors.birthDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.birthDate}</p>
            )}
          </div>

          {/* Birth Time */}
          <div>
            <label htmlFor="birthTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Birth Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="birthTime"
              name="birthTime"
              value={formData.birthTime}
              onChange={handleChange}
              disabled={formData.timeUnknown}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.birthTime
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400'
              } disabled:bg-gray-100 dark:disabled:bg-gray-800 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white`}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Exact time is needed for accurate house calculations
            </p>

            {/* Time Unknown Checkbox */}
            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                id="timeUnknown"
                name="timeUnknown"
                checked={formData.timeUnknown}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="timeUnknown" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                I don't know my exact birth time
              </label>
            </div>
            {errors.birthTime && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.birthTime}</p>
            )}
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Location
        </h3>
        <div className="space-y-4">
          <div className="relative">
            <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Birth Place <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="birthPlace"
              name="birthPlace"
              value={formData.birthPlace}
              onChange={handleChange}
              placeholder="Search city or enter coordinates"
              autoComplete="off"
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.birthPlace
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400'
              } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white`}
            />
            {errors.birthPlace && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.birthPlace}</p>
            )}

            {/* Place Suggestions Dropdown */}
            {showPlaceSearch && placeSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                {placeSuggestions.map((place, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => getPlaceCoordinates(place)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    {place}
                  </button>
                ))}
              </div>
            )}

            {/* Display Coordinates if Available */}
            {formData.latitude !== undefined && formData.longitude !== undefined && (
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span>Lat: {formData.latitude.toFixed(4)}</span>
                <span>•</span>
                <span>Lon: {formData.longitude.toFixed(4)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Details Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Chart Details
        </h3>
        <div className="space-y-4">
          {/* Chart Name */}
          <div>
            <label htmlFor="chartName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Chart Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="chartName"
              name="chartName"
              value={formData.chartName}
              onChange={handleChange}
              placeholder="My Natal Chart"
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.chartName
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400'
              } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white`}
            />
            {errors.chartName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.chartName}</p>
            )}
          </div>

          {/* House System Selector */}
          <div>
            <label htmlFor="houseSystem" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              House System
            </label>
            <select
              id="houseSystem"
              name="houseSystem"
              value={formData.houseSystem}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              {HOUSE_SYSTEMS.map((system) => (
                <option key={system.value} value={system.value}>
                  {system.label} - {system.description}
                </option>
              ))}
            </select>
          </div>

          {/* Zodiac Type Selector */}
          <div>
            <label htmlFor="zodiac" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Zodiac Type
            </label>
            <select
              id="zodiac"
              name="zodiac"
              value={formData.zodiac}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              {ZODIAC_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>

            {/* Sidereal Mode (shown only when Sidereal is selected) */}
            {formData.zodiac === 'sidereal' && (
              <div className="mt-3">
                <label htmlFor="siderealMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ayanamsha (Sidereal Calculation Method)
                </label>
                <select
                  id="siderealMode"
                  name="siderealMode"
                  value={formData.siderealMode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                >
                  {SIDEREAL_MODES.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label} - {mode.description}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={createChartMutation.isPending || calculateChartMutation.isPending}
          className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createChartMutation.isPending || calculateChartMutation.isPending
            ? 'Creating Chart...'
            : submitLabel}
        </button>
      </div>
    </form>
  );
}
