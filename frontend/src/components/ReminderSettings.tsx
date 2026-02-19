/**
 * ReminderSettings Component
 * Form for setting up astrological event reminders
 */

import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Check, Info } from 'lucide-react';
import { ReminderFormData, UserReminder } from '../types/calendar.types';
import { setReminder } from '../services/calendar.service';
import '../styles/ReminderSettings.css';

interface ReminderSettingsProps {
  onSave?: (reminder: UserReminder) => void;
  existingReminder?: UserReminder;
}

export function ReminderSettings({ onSave, existingReminder }: ReminderSettingsProps) {
  const [formData, setFormData] = useState<ReminderFormData>({
    eventType: existingReminder?.eventType || 'all',
    reminderType: existingReminder?.reminderType || 'email',
    reminderAdvanceHours: existingReminder?.reminderAdvanceHours || [24],
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
      const response = await setReminder('event-id', new Date());
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save reminder settings');
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
    <div className="reminder-settings">
      <div className="settings-header">
        <div className="header-icon">
          <Bell size={24} />
        </div>
        <div>
          <h2>Event Reminders</h2>
          <p>Get notified about important astrological events</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="reminder-form">
        {/* Event Type Selection */}
        <div className="form-section">
          <label className="form-label">Which events?</label>
          <div className="event-type-options">
            {eventTypes.map((type) => (
              <label
                key={type.value}
                className={`event-type-option ${formData.eventType === type.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="eventType"
                  value={type.value}
                  checked={formData.eventType === type.value}
                  onChange={(e) => handleEventTypeChange(e.target.value)}
                />
                <div className="option-content">
                  <div className="option-title">{type.label}</div>
                  <div className="option-description">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Reminder Type */}
        <div className="form-section">
          <label className="form-label">How would you like to be notified?</label>
          <div className="reminder-type-options">
            <label
              className={`reminder-type-option ${formData.reminderType === 'email' ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="reminderType"
                value="email"
                checked={formData.reminderType === 'email'}
                onChange={() => handleReminderTypeChange('email')}
              />
              <Mail size={20} />
              <span>Email</span>
            </label>

            <label
              className={`reminder-type-option ${formData.reminderType === 'push' ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="reminderType"
                value="push"
                checked={formData.reminderType === 'push'}
                onChange={() => handleReminderTypeChange('push')}
              />
              <Smartphone size={20} />
              <span>Push Notification</span>
            </label>
          </div>
        </div>

        {/* Advance Timing */}
        <div className="form-section">
          <label className="form-label">When should we remind you?</label>
          <div className="advance-hours-options">
            {advanceHoursOptions.map((option) => (
              <label
                key={option.value}
                className={`advance-hours-option ${formData.reminderAdvanceHours.includes(option.value) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={formData.reminderAdvanceHours.includes(option.value)}
                  onChange={() => handleAdvanceHoursToggle(option.value)}
                />
                <span>{option.label}</span>
                {formData.reminderAdvanceHours.includes(option.value) && (
                  <Check size={16} className="check-icon" />
                )}
              </label>
            ))}
          </div>
          <div className="form-hint">
            <Info size={14} />
            <span>Select multiple timing options to receive reminders at different intervals</span>
          </div>
        </div>

        {/* Active Toggle */}
        <div className="form-section">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">
              Enable reminders {formData.isActive ? 'ON' : 'OFF'}
            </span>
          </label>
        </div>

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <Check size={20} />
            <span>Reminder settings saved successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReminderSettings;
