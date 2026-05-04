/**
 * ReminderSettings Component
 * Form for setting up astrological event reminders
 */

import React, { useState } from 'react';

import { ReminderFormData, UserReminder } from '../types/calendar.types';
import { setReminder } from '../services/calendar.service';

interface ReminderSettingsProps {
  onSave?: (reminder: UserReminder) => void;
  existingReminder?: UserReminder;
}

export function ReminderSettings({ onSave: _onSave, existingReminder }: ReminderSettingsProps) {
  const [formData, setFormData] = useState<ReminderFormData>({
    eventType: existingReminder?.eventType ?? 'all',
    reminderType: existingReminder?.reminderType ?? 'email',
    reminderAdvanceHours: existingReminder?.reminderAdvanceHours ?? [24],
    isActive: existingReminder?.isActive ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // TODO: Implement actual API call for reminder settings
      await setReminder('event-id', new Date());
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message ?? 'Failed to save reminder settings');
    } finally {
      setLoading(false);
    }
  };

  const handleEventTypeChange = (eventType: string) => {
    setFormData((prev) => ({ ...prev, eventType }));
  };

  const handleReminderTypeChange = (reminderType: 'email' | 'push') => {
    setFormData((prev) => ({ ...prev, reminderType }));
  };

  const handleAdvanceHoursToggle = (hours: number) => {
    setFormData((prev) => {
      const hoursSet = new Set(prev.reminderAdvanceHours);
      if (hoursSet.has(hours)) {
        hoursSet.delete(hours);
      } else {
        hoursSet.add(hours);
      }
      return {
        ...prev,
        reminderAdvanceHours: Array.from(hoursSet).sort((a, b) => a - b),
      };
    });
  };

  const eventTypes = [
    { value: 'all', label: 'All Events', description: 'Get notified for all astrological events' },
    {
      value: 'major-transits',
      label: 'Major Transits Only',
      description: 'Only significant transits to your natal chart',
    },
    {
      value: 'retrogrades',
      label: 'Retrogrades',
      description: 'Planetary retrograde periods',
    },
    {
      value: 'eclipses',
      label: 'Eclipses',
      description: 'Solar and lunar eclipses',
    },
  ];

  const advanceHoursOptions = [
    { value: 1, label: '1 hour before' },
    { value: 24, label: '1 day before' },
    { value: 72, label: '3 days before' },
    { value: 168, label: '1 week before' },
  ];

  return (
    <div className="max-w-[600px] mx-auto p-6 sm:p-4 glass-panel rounded-2xl">
      <div className="flex gap-4 mb-8 items-start sm:flex-col sm:items-center sm:text-center">
        <div className="w-12 h-12 flex items-center justify-center bg-primary/15 text-primary rounded-xl shrink-0">
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '24px' }}>notifications</span>
        </div>
        <div>
          <h2 className="m-0 mb-1 text-2xl font-semibold text-white">Event Reminders</h2>
          <p className="m-0 text-sm text-slate-200">Get notified about important astrological events</p>
        </div>
      </div>

      <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-6">
        {/* Event Type Selection */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-slate-200">Which events?</label>
          <div className="flex flex-col gap-2">
            {eventTypes.map((type) => (
              <label
                key={type.value}
                className={`flex p-3 border-2 border-white/15 rounded-lg cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-white/15 ${formData.eventType === type.value ? '!border-primary !bg-primary/10' : ''}`}
              >
                <input
                  type="radio"
                  name="eventType"
                  value={type.value}
                  checked={formData.eventType === type.value}
                  onChange={(e) => handleEventTypeChange(e.target.value)}
                  className="mr-3 accent-primary"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white mb-0.5">{type.label}</div>
                  <div className="text-xs text-slate-200">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Reminder Type */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-slate-200">How would you like to be notified?</label>
          <div className="flex gap-3 sm:flex-col">
            <label
              className={`flex-1 flex flex-col items-center gap-2 p-4 border-2 border-white/15 rounded-lg cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-white/15 ${formData.reminderType === 'email' ? '!border-primary !bg-primary/10 !text-primary' : ''}`}
            >
              <input
                type="radio"
                name="reminderType"
                value="email"
                checked={formData.reminderType === 'email'}
                onChange={() => handleReminderTypeChange('email')}
                className="hidden"
              />
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px' }}>mail</span>
              <span className="text-sm font-medium">Email</span>
            </label>

            <label
              className={`flex-1 flex flex-col items-center gap-2 p-4 border-2 border-white/15 rounded-lg cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-white/15 ${formData.reminderType === 'push' ? '!border-primary !bg-primary/10 !text-primary' : ''}`}
            >
              <input
                type="radio"
                name="reminderType"
                value="push"
                checked={formData.reminderType === 'push'}
                onChange={() => handleReminderTypeChange('push')}
                className="hidden"
              />
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px' }}>smartphone</span>
              <span className="text-sm font-medium">Push Notification</span>
            </label>
          </div>
        </div>

        {/* Advance Timing */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-slate-200">When should we remind you?</label>
          <div className="flex flex-col gap-2">
            {advanceHoursOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center justify-between p-3 border-2 border-white/15 rounded-lg cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-white/15 ${formData.reminderAdvanceHours.includes(option.value) ? '!border-emerald-500 !bg-emerald-500/10' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={formData.reminderAdvanceHours.includes(option.value)}
                  onChange={() => handleAdvanceHoursToggle(option.value)}
                  className="mr-3 w-[18px] h-[18px] accent-emerald-500"
                />
                <span className="flex-1 text-sm text-slate-200">{option.label}</span>
                {formData.reminderAdvanceHours.includes(option.value) && (
                  <span className="material-symbols-outlined text-emerald-500 shrink-0" aria-hidden="true" style={{ fontSize: '16px' }}>check</span>
                )}
              </label>
            ))}
          </div>
          <div className="flex items-start gap-1.5 px-3 py-2 bg-amber-500/10 border-l-[3px] border-amber-500 rounded text-[13px] text-amber-300 leading-snug">
            <span className="material-symbols-outlined shrink-0 mt-0.5" aria-hidden="true" style={{ fontSize: '14px' }}>info</span>
            <span>Select multiple timing options to receive reminders at different intervals</span>
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="hidden"
            />
            <span className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${formData.isActive ? 'bg-primary' : 'bg-white/20'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${formData.isActive ? 'translate-x-6' : ''}`}></span>
            </span>
            <span className="text-sm font-medium text-slate-200">
              Enable reminders {formData.isActive ? 'ON' : 'OFF'}
            </span>
          </label>
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm">
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px' }}>check</span>
            <span>Reminder settings saved successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">{error}</div>}

        {/* Submit Button */}
        <div className="flex justify-end pt-2 border-t border-white/15 mt-2 sm:justify-stretch">
          <button type="submit" className="px-6 py-3 bg-primary text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed sm:w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReminderSettings;
