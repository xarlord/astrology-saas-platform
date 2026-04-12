/**
 * Birth Data Step - Step 2 of Registration Onboarding
 *
 * Collects birth date, time, and place for natal chart generation.
 * Split-screen layout matches Step 1 (RegisterPageNew) for visual continuity.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import { chartService } from '../services';
import type { BirthData } from '../services';

interface GeoResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function BirthDataStep() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form state
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [birthPlace, setBirthPlace] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [timezone, setTimezone] = useState('UTC');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [placeSelected, setPlaceSelected] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced city search via Nominatim
  const searchCity = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&featuretype=city`,
        { headers: { 'Accept-Language': 'en' } },
      );
      const data = (await response.json()) as GeoResult[];
      setSearchResults(data);
      setShowDropdown(data.length > 0);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handlePlaceInput = (value: string) => {
    setBirthPlace(value);
    setPlaceSelected(false);
    setLatitude(null);
    setLongitude(null);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => void searchCity(value), 300);
  };

  const selectPlace = (result: GeoResult) => {
    const cityPart = result.display_name.split(',')[0];
    setBirthPlace(cityPart);
    setLatitude(parseFloat(result.lat));
    setLongitude(parseFloat(result.lon));
    setTimezone('UTC'); // Will be resolved server-side
    setPlaceSelected(true);
    setShowDropdown(false);
  };

  // Validate form
  const isValid = birthDate && birthPlace && latitude !== null && longitude !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const chartData: BirthData = {
        name: `${user?.name ?? 'My'} Birth Chart`,
        type: 'natal',
        birth_date: birthDate,
        birth_time: timeUnknown ? '12:00' : birthTime,
        birth_time_unknown: timeUnknown,
        birth_place_name: birthPlace,
        birth_latitude: latitude,
        birth_longitude: longitude,
        birth_timezone: timezone,
        house_system: 'placidus',
        zodiac: 'tropical',
      };

      const { chart } = await chartService.createChart(chartData);

      // Calculate the chart
      await chartService.calculateChart(chart.id);

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chart. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="font-display bg-gradient-to-br from-[#0B0D17] to-[#141627] text-slate-100 min-h-screen flex flex-col selection:bg-primary selection:text-white overflow-x-hidden">
      <div className="flex flex-col lg:flex-row min-h-screen w-full">
        {/* Left Panel: Brand & Features (same as Step 1) */}
        <div
          className="hidden lg:flex relative w-full lg:w-5/12 xl:w-1/2 flex-col p-8 lg:p-12 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0B0D17 0%, #1a103c 50%, #2e1065 100%)',
          }}
        >
          {/* Decorative Background */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&auto=format&fit=crop&w=2342&q=80')`,
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background-dark/80 via-transparent to-background-dark/90 pointer-events-none" />

          {/* Logo */}
          <Link
            to="/"
            className="relative z-10 flex items-center gap-3 mb-12 lg:mb-20"
            aria-label="AstroVerse home"
          >
            <div className="size-10 bg-gradient-to-br from-primary to-cosmic-blue rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(178,61,225,0.5)]">
              <span className="material-symbols-outlined text-white text-2xl">all_inclusive</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">AstroVerse</h2>
          </Link>

          {/* Main Content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Almost{' '}
              <span
                style={{
                  background: 'linear-gradient(to right, #b23de1, #F5A623, #2563EB)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                there
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-10 leading-relaxed">
              Your birth details allow us to create your unique natal chart — the foundation for all
              your cosmic insights.
            </p>

            {/* Feature List */}
            <div className="space-y-6 mb-12">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Personalized natal chart</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Precise planetary positions based on your exact birth data.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                  <span className="material-symbols-outlined">insights</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Daily cosmic guidance</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Transits and aspects tailored to your unique chart.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                  <span className="material-symbols-outlined">encrypted</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Private and secure</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Your birth data is encrypted and never shared with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Footer */}
          <div className="relative z-10 mt-auto pt-8 border-t border-white/10">
            <blockquote className="text-slate-400 italic text-sm">
              "The cosmos is within us. We are made of star-stuff."
              <span className="block text-primary not-italic font-bold mt-2">– Carl Sagan</span>
            </blockquote>
          </div>
        </div>

        {/* Right Panel: Birth Data Form */}
        <div className="w-full lg:w-7/12 xl:w-1/2 bg-gradient-to-br from-[#0B0D17] to-[#141627] flex items-center justify-center p-6 lg:p-12 relative">
          {/* Background glows */}
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cosmic-blue/10 rounded-full blur-[80px] pointer-events-none"
            aria-hidden="true"
          />

          <div className="w-full max-w-md z-10">
            {/* Step Indicator */}
            <div
              className="flex justify-between items-center mb-8"
              role="group"
              aria-label="Registration progress"
            >
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold border border-primary/30">
                  <span className="material-symbols-outlined text-base">check</span>
                </span>
                <div className="w-8 h-0.5 bg-primary" aria-hidden="true" />
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold shadow-[0_0_10px_rgba(178,61,225,0.4)]"
                  aria-current="step"
                >
                  2
                </span>
                <span className="text-sm text-slate-400 font-medium">Step 2 of 2</span>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Tell us your birth details</h2>
              <p className="text-slate-400">
                Unlock your cosmic blueprint with your date, time, and place of birth.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div
                className="mb-6 p-4 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-200"
                role="alert"
              >
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base mt-0.5">error</span>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form
              className="rounded-2xl p-8 space-y-5"
              style={{
                background: 'rgba(19, 21, 36, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              }}
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit(e);
              }}
            >
              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="birth-date">
                  Date of Birth <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-500 text-[20px]">
                      calendar_today
                    </span>
                  </div>
                  <input
                    className="block w-full pl-11 pr-4 py-3 bg-gradient-to-br from-[#0B0D17] to-[#141627]/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    id="birth-date"
                    type="date"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    min="1900-01-01"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    data-testid="birth-date-input"
                  />
                </div>
              </div>

              {/* Time of Birth */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="birth-time">
                  Time of Birth <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-500 text-[20px]">
                      schedule
                    </span>
                  </div>
                  <input
                    className={`block w-full pl-11 pr-4 py-3 bg-gradient-to-br from-[#0B0D17] to-[#141627]/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                      timeUnknown ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    id="birth-time"
                    type="time"
                    value={timeUnknown ? '12:00' : birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    disabled={timeUnknown}
                    aria-disabled={timeUnknown}
                    data-testid="birth-time-input"
                  />
                </div>
                <p className="text-xs text-slate-500 ml-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Default: noon if time unknown
                </p>
              </div>

              {/* Unknown Time Checkbox */}
              <div className="flex items-center gap-3 px-1">
                <input
                  className="w-4 h-4 rounded border-slate-600 bg-gradient-to-br from-[#0B0D17] to-[#141627]/50 text-primary focus:ring-primary"
                  id="time-unknown"
                  type="checkbox"
                  checked={timeUnknown}
                  onChange={(e) => {
                    setTimeUnknown(e.target.checked);
                    if (e.target.checked) setBirthTime('12:00');
                  }}
                  data-testid="time-unknown-checkbox"
                />
                <label className="text-sm text-slate-400" htmlFor="time-unknown">
                  I don't know my birth time
                </label>
              </div>

              {/* Place of Birth */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="birth-place">
                  Place of Birth <span className="text-red-400">*</span>
                </label>
                <div className="relative" ref={dropdownRef}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-500 text-[20px]">
                      {isSearching
                        ? 'hourglass_top'
                        : placeSelected
                          ? 'check_circle'
                          : 'location_on'}
                    </span>
                  </div>
                  <input
                    className={`block w-full pl-11 pr-4 py-3 bg-gradient-to-br from-[#0B0D17] to-[#141627]/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                      placeSelected ? 'border-emerald-500/50' : 'border-slate-700'
                    }`}
                    id="birth-place"
                    type="text"
                    required
                    placeholder="Start typing a city..."
                    value={birthPlace}
                    onChange={(e) => handlePlaceInput(e.target.value)}
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-autocomplete="list"
                    aria-controls="city-results"
                    data-testid="birth-place-input"
                  />

                  {/* Autocomplete Dropdown */}
                  {showDropdown && searchResults.length > 0 && (
                    <div
                      id="city-results"
                      role="listbox"
                      className="absolute z-50 w-full mt-1 bg-[#1a1d2e] border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto"
                    >
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          type="button"
                          role="option"
                          className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                          onClick={() => selectPlace(result)}
                        >
                          <span className="material-symbols-outlined text-slate-500 text-base">
                            location_on
                          </span>
                          <span className="truncate">
                            {result.display_name.split(',').slice(0, 3).join(',')}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 py-3 px-4 text-slate-400 font-medium rounded-lg border border-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
                  type="button"
                  onClick={handleSkip}
                  data-testid="skip-birth-data-button"
                >
                  Skip
                </button>
                <button
                  className="flex-[2] py-3 px-4 text-white font-bold rounded-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: 'linear-gradient(90deg, #b23de1 0%, #2563EB 100%)',
                  }}
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  aria-busy={isSubmitting}
                  data-testid="generate-chart-button"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">
                        refresh
                      </span>
                      Generating Chart...
                    </>
                  ) : (
                    <>
                      <span>Generate Chart</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>

              {/* Privacy Assurance */}
              <div className="flex items-center gap-2 justify-center pt-2">
                <span className="material-symbols-outlined text-xs text-slate-500">lock</span>
                <span className="text-xs text-slate-500">
                  Your data is encrypted and never shared.
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
