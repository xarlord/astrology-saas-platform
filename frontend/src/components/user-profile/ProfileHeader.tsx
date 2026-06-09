import { useState, useCallback } from 'react';
import locationService from '@/services/location.service';
import { APP_LOCALE } from '../../utils/constants';
import type { UserProfile } from './types';

// Common IANA timezones for the fallback manual select
const COMMON_TIMEZONES = [
  { value: 'Pacific/Honolulu', label: 'Hawaii (UTC-10)' },
  { value: 'America/Anchorage', label: 'Alaska (UTC-9)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8)' },
  { value: 'America/Denver', label: 'Mountain Time (UTC-7)' },
  { value: 'America/Chicago', label: 'Central Time (UTC-6)' },
  { value: 'America/New_York', label: 'Eastern Time (UTC-5)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
  { value: 'Atlantic/Reykjavik', label: 'Iceland (UTC+0)' },
  { value: 'Europe/London', label: 'London (UTC+0/+1)' },
  { value: 'Europe/Paris', label: 'Paris / CET (UTC+1)' },
  { value: 'Europe/Istanbul', label: 'Istanbul (UTC+3)' },
  { value: 'Europe/Moscow', label: 'Moscow (UTC+3)' },
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4)' },
  { value: 'Asia/Karachi', label: 'Karachi (UTC+5)' },
  { value: 'Asia/Kolkata', label: 'India (UTC+5:30)' },
  { value: 'Asia/Dhaka', label: 'Dhaka (UTC+6)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (UTC+7)' },
  { value: 'Asia/Shanghai', label: 'China (UTC+8)' },
  { value: 'Asia/Singapore', label: 'Singapore (UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Japan (UTC+9)' },
  { value: 'Asia/Seoul', label: 'Korea (UTC+9)' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+10/+11)' },
  { value: 'Pacific/Auckland', label: 'Auckland (UTC+12/+13)' },
  { value: 'UTC', label: 'UTC' },
];

export interface ProfileHeaderProps {
  user?: UserProfile;
  isEditing: boolean;
  editData: { name: string; timezone: string };
  onEditToggle: () => void;
  onDataChange: (data: { name: string; timezone: string }) => void;
  onSave: () => void;
  birthCoordinates?: { latitude: number; longitude: number } | null;
}

export function ProfileHeader({
  user,
  isEditing,
  editData,
  onEditToggle,
  onDataChange,
  onSave,
  birthCoordinates,
}: ProfileHeaderProps) {
  const [detectingTimezone, setDetectingTimezone] = useState(false);
  const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  const handleDetectTimezone = useCallback(async () => {
    if (!birthCoordinates) return;
    setDetectingTimezone(true);
    setDetectionError(null);
    try {
      const tz = await locationService.getTimezone(
        birthCoordinates.latitude,
        birthCoordinates.longitude,
      );
      setDetectedTimezone(tz);
      onDataChange({ ...editData, timezone: tz });
    } catch {
      setDetectionError('Could not detect timezone from birth location.');
    } finally {
      setDetectingTimezone(false);
    }
  }, [birthCoordinates, editData, onDataChange]);

  if (!user) return null;

  return (
    <div className="glass-panel rounded-2xl relative overflow-hidden p-6 text-white">
      {/* Background Decoration */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cosmic-blue/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-primary via-cosmic-blue to-primary/30 relative">
            <div className="w-full h-full rounded-full bg-cosmic-page p-1">
              <div className="w-full h-full rounded-full bg-cosmic-card-solid flex items-center justify-center text-3xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Change avatar"
            title="Change avatar"
          >
            <span className="material-symbols-outlined text-4xl text-primary" aria-hidden="true">photo_camera</span>
          </button>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label htmlFor="profile-name-edit" className="sr-only">
                  Edit Display Name
                </label>
                <input
                  type="text"
                  id="profile-name-edit"
                  data-testid="profile-name-edit"
                  value={editData.name}
                  onChange={(e) => onDataChange({ ...editData, name: e.target.value })}
                  aria-required="true"
                  className="px-4 py-2 rounded-xl bg-cosmic-card-solid border border-white/15 text-white placeholder:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Your name"
                />
              </div>

              {/* Timezone: auto-detect + manual fallback */}
              <div className="space-y-2">
                {/* Detected timezone display */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-slate-200">Timezone:</span>
                  {editData.timezone && editData.timezone !== 'UTC' && !editData.timezone.startsWith('UTC') && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/15 text-primary text-sm font-medium">
                      <span className="material-symbols-outlined text-4xl" aria-hidden="true">language</span>
                      {editData.timezone}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => { void handleDetectTimezone(); }}
                    disabled={detectingTimezone || !birthCoordinates}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/15 border border-white/15 text-slate-200 hover:bg-white/20 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title={birthCoordinates ? 'Detect timezone from your birth location' : 'No birth location data available'}
                  >
                    <span className="material-symbols-outlined text-4xl" aria-hidden="true">
                      {detectingTimezone ? 'hourglass_empty' : 'my_location'}
                    </span>
                    {detectingTimezone ? 'Detecting…' : 'Detect from birth location'}
                  </button>
                </div>

                {detectionError && (
                  <p className="text-xs text-red-400">{detectionError}</p>
                )}
                {detectedTimezone && !detectionError && (
                  <p className="text-xs text-green-400">
                    ✓ Detected: {detectedTimezone}
                  </p>
                )}

                {/* Fallback manual select */}
                <div>
                  <label htmlFor="profile-timezone-edit" className="sr-only">
                    Timezone
                  </label>
                  <select
                    id="profile-timezone-edit"
                    value={COMMON_TIMEZONES.some(tz => tz.value === editData.timezone) ? editData.timezone : '__custom__'}
                    onChange={(e) => {
                      if (e.target.value !== '__custom__') {
                        onDataChange({ ...editData, timezone: e.target.value });
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-cosmic-card-solid border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="__custom__" disabled style={{ background: '#1a1c2e', color: '#fff' }}>
                      {editData.timezone} (current)
                    </option>
                    {COMMON_TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value} style={{ background: '#1a1c2e', color: '#fff' }}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-200/60">
                    Or pick manually from common timezones above
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold gradient-text">{user.name}</h1>
              <p className="text-slate-200">{user.email}</p>
              <p className="text-sm text-slate-200 mt-1">
                Timezone: <span className="text-primary">{user.timezone}</span>
              </p>
              <p className="text-sm text-slate-200 mt-1">
                Member since {new Date(user.createdAt).toLocaleDateString(APP_LOCALE, { month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        {/* Edit Button */}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => { void onSave(); }}
                className="px-4 py-2 bg-cosmic-gradient text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity"
                aria-label="Save"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onEditToggle}
                className="p-2 bg-white/15 border border-white/15 rounded-xl hover:bg-white/15 transition-colors"
                aria-label="Cancel"
              >
                <span className="material-symbols-outlined text-4xl" aria-hidden="true">close</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onEditToggle}
              className="p-2 bg-white/15 border border-white/15 rounded-xl hover:bg-white/15 transition-colors"
              title="Edit profile"
              aria-label="Edit profile"
            >
              <span className="material-symbols-outlined text-4xl" aria-hidden="true">edit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
