import { useState, useEffect, useCallback, useRef } from 'react';
import { useCreateChart, useCalculateChart } from '../hooks';
import { useChartsStore } from '../store/chartsStore';

// Error Message Component with Icon
interface ErrorMessageProps {
  message: string;
  id?: string;
}

function ErrorMessage({ message, id }: ErrorMessageProps) {
  return (
    <p id={id} className="error-message" role="alert" aria-live="assertive">
      <span className="material-symbols-outlined error-icon" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
      <span className="error-text">{message}</span>
    </p>
  );
}
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
  useTrueAngles: boolean;
}

interface BirthDataFormProps {
  onSuccess?: (chartId: string) => void;
  initialData?: Partial<BirthData>;
  submitLabel?: string;
}

const HOUSE_SYSTEMS = [
  { value: 'whole', label: 'Whole Sign', description: 'Each sign = one house (recommended)' },
  { value: 'placidus', label: 'Placidus', description: 'Time-based house system' },
  { value: 'koch', label: 'Koch', description: 'Popular in German-speaking countries' },
  { value: 'porphyry', label: 'Porphyry', description: 'Based on equal segments of ecliptic' },
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
    birthDate: initialData?.birthDate ?? '',
    birthTime: initialData?.birthTime ?? '12:00',
    timeUnknown: initialData?.timeUnknown ?? false,
    birthPlace: initialData?.birthPlace ?? '',
    latitude: initialData?.latitude,
    longitude: initialData?.longitude,
    timezone: initialData?.timezone,
    chartName: initialData?.chartName ?? 'My Natal Chart',
    houseSystem: initialData?.houseSystem ?? 'whole',
    zodiac: initialData?.zodiac ?? 'tropical',
    siderealMode: initialData?.siderealMode ?? 'lahiri',
    useTrueAngles: initialData?.useTrueAngles ?? true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BirthData, string>>>({});
  const [placeSuggestions, setPlaceSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [showPlaceSearch, setShowPlaceSearch] = useState(false);
  const placeInputRef = useRef<HTMLInputElement>(null);

  // Generate unique IDs for accessibility
  const birthDateErrorId = 'birthDate-error';
  const birthTimeErrorId = 'birthTime-error';
  const birthTimeDescId = 'birthTime-desc';
  const birthPlaceErrorId = 'birthPlace-error';
  const chartNameErrorId = 'chartName-error';

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const createChartMutation = useCreateChart();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const calculateChartMutation = useCalculateChart();

  // Handle geocoding — routed through backend proxy (avoids CORS/rate-limit issues with direct Nominatim calls)
  const searchPlace = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setPlaceSuggestions([]);
      setShowPlaceSearch(false);
      return;
    }

    try {
      const apiBase = import.meta.env.VITE_API_URL ?? '';
      const response = await fetch(
        `${apiBase}/api/v1/location/autocomplete?input=${encodeURIComponent(query)}`,
      );

      if (!response.ok) {
        setPlaceSuggestions([]);
        return;
      }

      const result = await response.json() as {
        predictions: { description: string; lat?: number; lon?: number; mainText?: string; secondaryText?: string }[];
      };

      const predictions = result.predictions ?? [];
      if (predictions.length > 0) {
        // Map backend prediction format to the component's expected format
        const mapped = predictions.map((p) => ({
          display_name: p.description,
          lat: String(p.lat ?? 0),
          lon: String(p.lon ?? 0),
        }));
        setPlaceSuggestions(mapped);
        setShowPlaceSearch(true);
      } else {
        setPlaceSuggestions([]);
        setShowPlaceSearch(false);
      }
    } catch (error) {
      console.error('Place search error:', error);
      setPlaceSuggestions([]);
      setShowPlaceSearch(false);
    }
  }, []);

  // Select a place from suggestions — coordinates already available
  const selectPlace = useCallback(async (place: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    
    // Auto-detect timezone from coordinates
    let timezone: string | undefined;
    try {
      const apiBase = import.meta.env.VITE_API_URL ?? '';
      const tzResp = await fetch(
        `${apiBase}/api/v1/location/timezone?lat=${lat}&lon=${lon}`,
      );
      if (tzResp.ok) {
        const tzData = await tzResp.json() as { data?: { timezone?: string } };
        timezone = tzData.data?.timezone;
      }
    } catch {
      // fallback: compute rough timezone from longitude
      const offset = Math.round(lon / 15);
      timezone = offset >= 0 ? `Etc/GMT+${offset}` : `Etc/GMT${offset}`;
    }

    setFormData((prev) => ({
      ...prev,
      birthPlace: place.display_name.split(',').slice(0, 3).join(',').trim(),
      latitude: lat,
      longitude: lon,
      timezone: timezone ?? prev.timezone,
    }));
    setShowPlaceSearch(false);
    setPlaceSuggestions([]);
  }, []);

  // Debounced place search
  useEffect(() => {
    if (!formData.birthPlace || formData.birthPlace.length < 2) {
      setPlaceSuggestions([]);
      setShowPlaceSearch(false);
      return;
    }

    const timer = setTimeout(() => {
      void searchPlace(formData.birthPlace);
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.birthPlace, searchPlace]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (placeInputRef.current && !placeInputRef.current.contains(e.target as Node)) {
        setShowPlaceSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        birth_timezone: formData.timezone ?? 'UTC',
        house_system: formData.houseSystem,
        zodiac: formData.zodiac,
        sidereal_mode: formData.zodiac === 'sidereal' ? formData.siderealMode : undefined,
        use_true_angles: formData.useTrueAngles,
      };

      await createChartMutation.mutateAsync(chartData);

      // Read currentChart directly from the store to avoid stale closure
      const chart = useChartsStore.getState().currentChart;
      if (chart?.id) {
        await calculateChartMutation.mutateAsync(chart.id);
        onSuccess?.(chart.id);
      }
    } catch (error: unknown) {
      console.error('Form submission error:', error);
      const err = error as { message?: string };
      setErrors({
        birthDate: err.message ?? 'Failed to create chart. Please try again.',
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
    <form
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit} className="space-y-8">
      {/* Date & Time Section */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Date & Time
        </h3>
        <div className="space-y-4">
          {/* Birth Date */}
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-slate-200">
              Birth Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                aria-required="true"
                aria-invalid={errors.birthDate ? 'true' : undefined}
                aria-describedby={errors.birthDate ? birthDateErrorId : undefined}
                className={`mt-1 block w-full rounded-lg pr-10 ${
                  errors.birthDate
                    ? 'input-error border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-900/10'
                    : 'border-cosmic-border focus:border-primary focus:ring-primary'
                } ring-1 ring-inset ring-white/10 bg-cosmic-card-solid px-3 py-2 text-white transition-colors`}
              />
              {errors.birthDate && (
                <div className="error-icon-wrapper">
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
                </div>
              )}
            </div>
            {errors.birthDate && <ErrorMessage message={errors.birthDate} id={birthDateErrorId} />}
          </div>

          {/* Birth Time */}
          <div>
            <label htmlFor="birthTime" className="block text-sm font-medium text-slate-200">
              Birth Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="time"
                id="birthTime"
                name="birthTime"
                value={formData.birthTime}
                onChange={handleChange}
                disabled={formData.timeUnknown}
                aria-required={!formData.timeUnknown ? 'true' : 'false'}
                aria-invalid={errors.birthTime ? 'true' : undefined}
                aria-describedby={errors.birthTime ? birthTimeErrorId : birthTimeDescId}
                className={`mt-1 block w-full rounded-lg pr-10 ${
                  errors.birthTime
                    ? 'input-error border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-900/10'
                    : 'border-cosmic-border focus:border-primary focus:ring-primary'
                } disabled:bg-white/[0.02] ring-1 ring-inset ring-white/10 bg-cosmic-card-solid px-3 py-2 text-white transition-colors`}
              />
              {errors.birthTime && (
                <div className="error-icon-wrapper">
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
                </div>
              )}
            </div>
            <p id={birthTimeDescId} className="mt-1 text-xs text-slate-200">
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
                className="h-4 w-4 rounded border-cosmic-border text-primary focus:ring-primary"
              />
              <label htmlFor="timeUnknown" className="ml-2 text-sm text-slate-200">
                I don't know my exact birth time
              </label>
            </div>
            {errors.birthTime && <ErrorMessage message={errors.birthTime} id={birthTimeErrorId} />}
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Location
        </h3>
        <div className="space-y-4">
          <div className="relative" ref={placeInputRef}>
            <label htmlFor="birthPlace" className="block text-sm font-medium text-slate-200">
              Birth Place <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="birthPlace"
                name="birthPlace"
                value={formData.birthPlace}
                onChange={handleChange}
                placeholder="Start typing a city name..."
                autoComplete="off"
                aria-required="true"
                aria-invalid={errors.birthPlace ? 'true' : undefined}
                aria-describedby={errors.birthPlace ? birthPlaceErrorId : undefined}
                aria-expanded={showPlaceSearch}
                aria-autocomplete="list"
                aria-controls="place-suggestions"
                className={`mt-1 block w-full rounded-lg pr-10 ${
                  errors.birthPlace
                    ? 'input-error border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-900/10'
                    : 'border-cosmic-border focus:border-primary focus:ring-primary'
                } ring-1 ring-inset ring-white/10 bg-cosmic-card-solid px-3 py-2 text-white transition-colors`}
              />
              {errors.birthPlace && (
                <div className="error-icon-wrapper">
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
                </div>
              )}
            </div>
            {errors.birthPlace && <ErrorMessage message={errors.birthPlace} id={birthPlaceErrorId} />}

            {/* Place Suggestions Dropdown */}
            {showPlaceSearch && placeSuggestions.length > 0 && (
              <div
                id="place-suggestions"
                role="listbox"
                className="absolute z-50 mt-1 w-full rounded-lg shadow-2xl max-h-60 overflow-auto border border-cosmic-border"
                style={{ backgroundColor: '#1a1d2e' }}
              >
                {placeSuggestions.map((place, index) => (
                  <button
                    key={index}
                    type="button"
                    role="option"
                    onClick={() => { void selectPlace(place); }}
                    className="w-full text-left px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-slate-500 text-base" aria-hidden="true">
                      location_on
                    </span>
                    <span className="truncate">
                      {place.display_name.split(',').slice(0, 3).join(',').trim()}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Display Coordinates if Available */}
            {formData.latitude !== undefined && formData.longitude !== undefined && (
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-200">
                <span>Lat: {formData.latitude.toFixed(4)}</span>
                <span>•</span>
                <span>Lon: {formData.longitude.toFixed(4)}</span>
                {formData.timezone && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-300" title="Auto-detected IANA timezone (handles historical DST)">
                      🕐 {formData.timezone}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Details Section */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Chart Details
        </h3>
        <div className="space-y-4">
          {/* Chart Name */}
          <div>
            <label htmlFor="chartName" className="block text-sm font-medium text-slate-200">
              Chart Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="chartName"
                name="chartName"
                value={formData.chartName}
                onChange={handleChange}
                placeholder="My Natal Chart"
                aria-required="true"
                aria-invalid={errors.chartName ? 'true' : undefined}
                aria-describedby={errors.chartName ? chartNameErrorId : undefined}
                className={`mt-1 block w-full rounded-lg pr-10 ${
                  errors.chartName
                    ? 'input-error border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-900/10'
                    : 'border-cosmic-border focus:border-primary focus:ring-primary'
                } ring-1 ring-inset ring-white/10 bg-cosmic-card-solid px-3 py-2 text-white transition-colors`}
              />
              {errors.chartName && (
                <div className="error-icon-wrapper">
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
                </div>
              )}
            </div>
            {errors.chartName && <ErrorMessage message={errors.chartName} id={chartNameErrorId} />}
          </div>

          {/* House System Selector */}
          <div>
            <label htmlFor="houseSystem" className="block text-sm font-medium text-slate-200">
              House System
            </label>
            <select
              id="houseSystem"
              name="houseSystem"
              value={formData.houseSystem}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-cosmic-border ring-1 ring-inset ring-white/10 bg-cosmic-card-solid px-3 py-2 text-white focus:border-primary focus:ring-primary"
            >
              {HOUSE_SYSTEMS.map((system) => (
                <option key={system.value} value={system.value}>
                  {system.label} - {system.description}
                </option>
              ))}
            </select>
          </div>

          {/* Angle Calculation Toggle */}
          <div>
            <label htmlFor="useTrueAngles" className="block text-sm font-medium text-slate-200">
              Angle Calculation
            </label>
            <select
              id="useTrueAngles"
              name="useTrueAngles"
              value={formData.useTrueAngles ? 'true' : 'mean'}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  useTrueAngles: e.target.value === 'true',
                }));
              }}
              className="mt-1 block w-full rounded-lg border-cosmic-border ring-1 ring-inset ring-white/10 bg-cosmic-card-solid px-3 py-2 text-white focus:border-primary focus:ring-primary"
            >
              <option value="true">True Angles (with nutation correction)</option>
              <option value="mean">Mean Angles (fixed obliquity)</option>
            </select>
            <p className="mt-1 text-xs text-slate-200">
              True angles account for the date-specific Earth axial tilt; Mean uses fixed 23.44°
            </p>
          </div>

          {/* Zodiac Type Selector */}
          <div>
            <label htmlFor="zodiac" className="block text-sm font-medium text-slate-200">
              Zodiac Type
            </label>
            <select
              id="zodiac"
              name="zodiac"
              value={formData.zodiac}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-cosmic-border ring-1 ring-inset ring-white/10 bg-cosmic-card-solid px-3 py-2 text-white focus:border-primary focus:ring-primary"
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
                <label htmlFor="siderealMode" className="block text-sm font-medium text-slate-200">
                  Ayanamsha (Sidereal Calculation Method)
                </label>
                <select
                  id="siderealMode"
                  name="siderealMode"
                  value={formData.siderealMode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-cosmic-border ring-1 ring-inset ring-white/10 bg-cosmic-card-solid px-3 py-2 text-white focus:border-primary focus:ring-primary"
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
          className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createChartMutation.isPending || calculateChartMutation.isPending
            ? 'Creating Chart...'
            : submitLabel}
        </button>
      </div>
    </form>
  );
}
