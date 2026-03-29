/**
 * ChartCreationWizardPage Component
 *
 * 3-step wizard for creating new charts:
 * - Step 1: Personal Details (name, tags, notes)
 * - Step 2: Birth Data (date, time, location with map)
 * - Step 3: Settings (chart type, house system, zodiac)
 *
 * Features live preview panel with mini chart wheel
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useCharts } from '../hooks/useCharts';
import type { BirthData as APIBirthData } from '../services/api.types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { CustomDatePicker } from '../components/form/CustomDatePicker';

type WizardStep = 1 | 2 | 3;

interface PersonalDetails {
  name: string;
  tags: string[];
  notes: string;
}

interface BirthData {
  date: Date | undefined;
  time: string;
  unknownTime: boolean;
  location: string;
  latitude: number;
  longitude: number;
}

interface ChartSettings {
  chartType: 'natal' | 'synastry' | 'composite' | 'transit';
  houseSystem: 'placidus' | 'koch' | 'porphyry' | 'whole-sign';
  zodiacType: 'tropical' | 'sidereal';
  isDefault: boolean;
}

const TAG_OPTIONS = ['Self', 'Family', 'Friend', 'Client', 'Other'];

const CHART_TYPES = [
  { value: 'natal', label: 'Natal Chart', description: 'Your birth chart' },
  { value: 'synastry', label: 'Synastry', description: 'Relationship compatibility' },
  { value: 'composite', label: 'Composite', description: 'Combined relationship chart' },
  { value: 'transit', label: 'Transit', description: 'Current planetary influences' },
] as const;

const HOUSE_SYSTEMS = [
  { value: 'placidus', label: 'Placidus', description: 'Most common house system' },
  { value: 'koch', label: 'Koch', description: 'Equal houses from MC' },
  { value: 'porphyry', label: 'Porphyry', description: 'Equal house cusps' },
  { value: 'whole-sign', label: 'Whole Sign', description: 'Each sign is a house' },
] as const;

export const ChartCreationWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { createChart, isLoading } = useCharts();

  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    name: '',
    tags: [],
    notes: '',
  });

  const [birthData, setBirthData] = useState<BirthData>({
    date: undefined,
    time: '',
    unknownTime: false,
    location: '',
    latitude: 0,
    longitude: 0,
  });

  const [chartSettings, setChartSettings] = useState<ChartSettings>({
    chartType: 'natal',
    houseSystem: 'placidus',
    zodiacType: 'tropical',
    isDefault: false,
  });

  // Validation
  const isStepValid = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return personalDetails.name.trim().length > 0;
      case 2:
        return (
          birthData.date !== undefined &&
          (birthData.unknownTime || birthData.time.trim().length > 0) &&
          birthData.location.trim().length > 0
        );
      case 3:
        return true;
      default:
        return false;
    }
  }, [currentStep, personalDetails, birthData]);

  const handleNext = useCallback(() => {
    if (isStepValid() && currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  }, [isStepValid, currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    } else {
      navigate('/charts');
    }
  }, [currentStep, navigate]);

  const handleSubmit = useCallback(async () => {
    if (!isStepValid()) return;

    try {
      await createChart({
        name: personalDetails.name,
        birthDate: birthData.date?.toISOString().split('T')[0] ?? '',
        birthTime: birthData.unknownTime ? '' : birthData.time,
        birthPlace: birthData.location,
        latitude: birthData.latitude,
        longitude: birthData.longitude,
        timezone: 'UTC',
        // Note: chartType, houseSystem, zodiacType, tags, notes would need to be handled separately
        // or the BirthData type extended to include them
      } as unknown as APIBirthData);

      navigate('/charts');
    } catch (error) {
      console.error('Failed to create chart:', error);
    }
  }, [isStepValid, personalDetails.name, birthData.date, birthData.unknownTime, birthData.time, birthData.location, birthData.latitude, birthData.longitude, createChart, navigate]);

  const toggleTag = (tag: string) => {
    setPersonalDetails((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (currentStep === 3) {
          void handleSubmit();
        } else {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isStepValid, handleSubmit, handleNext]);

  const STEPS = [
    { number: 1, title: 'Birth Details', icon: 'person' },
    { number: 2, title: 'Location', icon: 'location_on' },
    { number: 3, title: 'Options', icon: 'settings' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] to-[#141627] flex flex-col overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card-dark/80 backdrop-blur-md z-50 px-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 text-primary flex items-center justify-center bg-primary/10 rounded-lg">
            <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
          </div>
          <h1 className="text-white text-xl font-bold tracking-tight">AstroVerse</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 transition-colors text-sm font-medium">
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span className="hidden sm:inline">Help</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 flex-col pt-20 pb-6 px-4 sm:px-8 h-screen max-h-screen overflow-hidden">
        {/* Step Indicator */}
        <div className="w-full max-w-4xl mx-auto mb-8 mt-4">
          <div className="flex items-center justify-between relative">
            {/* Line background */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-white/10 -z-10 rounded-full" />

            {STEPS.map((step, index) => (
              <React.Fragment key={step.number}>
                {/* Step Circle */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={clsx(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                      currentStep === step.number
                        ? 'bg-primary border-primary shadow-[0_0_15px_rgba(107,61,225,0.5)] ring-4 ring-primary/20'
                        : currentStep > step.number
                        ? 'bg-primary border-primary'
                        : 'bg-surface-dark border-white/20 opacity-50'
                    )}
                  >
                    {currentStep > step.number ? (
                      <span className="material-symbols-outlined text-white text-[20px]">check</span>
                    ) : (
                      <span
                        className={clsx(
                          'material-symbols-outlined',
                          currentStep === step.number ? 'text-white text-[20px]' : 'text-slate-400 text-[16px]'
                        )}
                      >
                        {step.icon}
                      </span>
                    )}
                  </div>
                  <span
                    className={clsx(
                      'text-xs font-medium',
                      currentStep === step.number ? 'text-white' : 'text-slate-400'
                    )}
                  >
                    {step.title}
                  </span>
                </div>

                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={clsx(
                      'flex-1 h-[2px] mx-2',
                      currentStep > step.number ? 'bg-primary' : 'bg-white/10'
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Wizard Layout */}
        <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto w-full flex-1 min-h-0">
          {/* LEFT: Form Card */}
          <div className="flex-1 flex flex-col bg-card-dark/80 backdrop-blur-md rounded-2xl overflow-hidden">
            <div className="p-8 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">Create New Chart</h2>
                <span className="text-2xl animate-pulse">✨</span>
              </div>
              <p className="text-slate-400 text-sm">
                {currentStep === 1 && 'Enter the name and tags for this chart.'}
                {currentStep === 2 && 'Enter the birth details. Precision is key for an accurate reading.'}
                {currentStep === 3 && 'Configure chart calculation settings.'}
              </p>
            </div>

            <div className="px-8 py-4 flex flex-col gap-6 overflow-y-auto">
              {/* Step 1: Personal Details */}
              {currentStep === 1 && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-slate-300 text-sm font-medium ml-1">Chart Name</label>
                    <Input
                      type="text"
                      value={personalDetails.name}
                      onChange={(e) =>
                        setPersonalDetails((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g. John's Natal Chart"
                      className="h-14"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-slate-300 text-sm font-medium ml-1">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {TAG_OPTIONS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={clsx(
                            'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                            personalDetails.tags.includes(tag)
                              ? 'bg-primary/20 border-primary text-white'
                              : 'bg-surface-dark/50 border-white/10 text-slate-400 hover:border-white/20'
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-slate-300 text-sm font-medium ml-1">Notes (Optional)</label>
                    <textarea
                      value={personalDetails.notes}
                      onChange={(e) =>
                        setPersonalDetails((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      placeholder="Add any additional notes..."
                      rows={4}
                      className="w-full rounded-xl px-4 py-3 bg-surface-dark/50 border border-white/10 text-slate-100 placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                    />
                  </div>
                </>
              )}

              {/* Step 2: Birth Data */}
              {currentStep === 2 && (
                <>
                  <div className="flex flex-col gap-4">
                    <CustomDatePicker
                      value={birthData.date}
                      onChange={(date) => setBirthData((prev) => ({ ...prev, date }))}
                      placeholder="Select date of birth"
                    />

                    {!birthData.unknownTime && (
                      <div className="flex flex-col gap-2">
                        <label className="text-slate-300 text-sm font-medium ml-1">Time of Birth</label>
                        <Input
                          type="time"
                          value={birthData.time}
                          onChange={(e) =>
                            setBirthData((prev) => ({ ...prev, time: e.target.value }))
                          }
                          className="h-14"
                        />
                      </div>
                    )}

                    <Checkbox
                      checked={birthData.unknownTime}
                      onChange={(e) =>
                        setBirthData((prev) => ({ ...prev, unknownTime: e.target.checked }))
                      }
                      label="Time unknown"
                      helperText="Will use noon as default time"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-slate-300 text-sm font-medium ml-1">Birth Location</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined">
                        location_on
                      </span>
                      <input
                        type="text"
                        value={birthData.location}
                        onChange={(e) =>
                          setBirthData((prev) => ({ ...prev, location: e.target.value }))
                        }
                        placeholder="Enter city, country"
                        className="w-full pl-12 pr-4 py-4 h-14 rounded-xl bg-surface-dark/50 border border-white/10 text-slate-100 placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex gap-3 items-start">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      info
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className="text-slate-200 text-sm font-medium">
                        Why is birth time important?
                      </p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Accurate birth time is essential for precise house calculations and rising sign
                        determination. If unknown, a Noon chart will be used.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Settings */}
              {currentStep === 3 && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-slate-300 text-sm font-medium ml-1">Chart Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {CHART_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setChartSettings((prev) => ({ ...prev, chartType: type.value }))
                          }
                          className={clsx(
                            'p-4 rounded-xl border text-left transition-all',
                            chartSettings.chartType === type.value
                              ? 'bg-primary/20 border-primary text-white'
                              : 'bg-surface-dark/50 border-white/10 text-slate-400 hover:border-white/20'
                          )}
                        >
                          <p className="font-semibold text-sm">{type.label}</p>
                          <p className="text-xs opacity-70 mt-1">{type.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-slate-300 text-sm font-medium ml-1">House System</label>
                    <div className="grid grid-cols-2 gap-3">
                      {HOUSE_SYSTEMS.map((system) => (
                        <button
                          key={system.value}
                          type="button"
                          onClick={() =>
                            setChartSettings((prev) => ({ ...prev, houseSystem: system.value }))
                          }
                          className={clsx(
                            'p-4 rounded-xl border text-left transition-all',
                            chartSettings.houseSystem === system.value
                              ? 'bg-primary/20 border-primary text-white'
                              : 'bg-surface-dark/50 border-white/10 text-slate-400 hover:border-white/20'
                          )}
                        >
                          <p className="font-semibold text-sm">{system.label}</p>
                          <p className="text-xs opacity-70 mt-1">{system.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-slate-300 text-sm font-medium ml-1">Zodiac Type</label>
                    <div className="flex gap-3">
                      {(['tropical', 'sidereal'] as const).map((zodiac) => (
                        <button
                          key={zodiac}
                          type="button"
                          onClick={() =>
                            setChartSettings((prev) => ({ ...prev, zodiacType: zodiac }))
                          }
                          className={clsx(
                            'flex-1 px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-all',
                            chartSettings.zodiacType === zodiac
                              ? 'bg-primary/20 border-primary text-white'
                              : 'bg-surface-dark/50 border-white/10 text-slate-400 hover:border-white/20'
                          )}
                        >
                          {zodiac}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Checkbox
                    checked={chartSettings.isDefault}
                    onChange={(e) =>
                      setChartSettings((prev) => ({ ...prev, isDefault: e.target.checked }))
                    }
                    label="Set as default chart"
                    helperText="This will be your primary chart for calculations"
                  />
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="mt-auto p-8 pt-4 flex items-center justify-between border-t border-white/5">
              <Button variant="ghost" size="md" onClick={handleBack}>
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </Button>

              <div className="flex items-center gap-4">
                <span className="hidden md:block text-xs text-slate-500">
                  Press <span className="font-mono bg-white/10 px-1 py-0.5 rounded text-slate-300">
                    ⌘ Enter
                  </span>{' '}
                  to continue
                </span>
                {currentStep < 3 ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    rightIcon={<span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
                  >
                    Next: {currentStep === 1 ? 'Location' : 'Options'}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => { void handleSubmit(); }}
                    disabled={!isStepValid() || isLoading}
                    isLoading={isLoading}
                    leftIcon={<span className="material-symbols-outlined text-[20px]">auto_awesome</span>}
                  >
                    Generate Chart
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Preview Panel */}
          <div className="w-full lg:w-80 bg-card-dark/80 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-6 hidden md:flex sticky top-0 self-start">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-sm tracking-wide uppercase opacity-80">
                Chart Preview
              </h3>
              {birthData.date && (
                <div className="bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">sunny</span>
                  Calculating...
                </div>
              )}
            </div>

            {/* Mini Chart Wheel */}
            <div className="relative aspect-square w-full rounded-full border border-white/10 flex items-center justify-center bg-gradient-to-br from-[#0B0D17] to-[#141627]/30 overflow-hidden group">
              {/* SVG Wheel */}
              <svg
                className="w-full h-full p-2 opacity-40 animate-[spin_60s_linear_infinite]"
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" fill="none" r="48" stroke="#333" strokeWidth="0.5" />
                <circle cx="50" cy="50" fill="none" r="35" stroke="#333" strokeWidth="0.5" />
                <circle cx="50" cy="50" fill="none" r="15" stroke="#6b3de1" strokeWidth="0.5" />
                <path d="M50 2 L50 98 M2 50 L98 50 M16 16 L84 84 M16 84 L84 16" stroke="#333" strokeWidth="0.2" />
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0B0D17] to-[#141627] border border-white/10 flex items-center justify-center mb-1 shadow-lg z-10">
                  <span className="material-symbols-outlined text-primary text-[32px]">public</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  {birthData.location ? birthData.location : 'Location needed'}
                </p>
              </div>
            </div>

            {/* Data Preview */}
            <div className="space-y-3">
              <div className="h-px w-full bg-white/10" />

              {personalDetails.name && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">badge</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-slate-400">Name</p>
                    <p className="text-sm text-white font-medium">{personalDetails.name}</p>
                  </div>
                </div>
              )}

              {birthData.date && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">event</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-slate-400">Date</p>
                    <p className="text-sm text-white font-medium">
                      {birthData.date.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {!personalDetails.name && !birthData.date && (
                <>
                  <div className="flex items-center gap-3 opacity-50">
                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400 text-[16px]">badge</span>
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="h-2 w-16 bg-white/10 rounded-full" />
                      <div className="h-3 w-24 bg-white/5 rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 opacity-50">
                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400 text-[16px]">event</span>
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="h-2 w-12 bg-white/10 rounded-full" />
                      <div className="h-3 w-20 bg-white/5 rounded-full" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-auto bg-primary/5 rounded-lg p-3 border border-primary/10">
              <div className="flex gap-2">
                <div className="text-primary">
                  <span className="material-symbols-outlined text-[18px]">stars</span>
                </div>
                <p className="text-[11px] text-primary/80 leading-tight">
                  Entering data will update the chart preview in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChartCreationWizardPage;
