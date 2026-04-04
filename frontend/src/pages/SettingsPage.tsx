/**
 * Settings Page Component
 * User preferences: profile info, display options, notifications
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../hooks';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}

function ToggleSwitch({ enabled, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && (
          <p className="text-sm text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
          enabled
            ? 'bg-green-500'
            : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

interface SettingsSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ icon, title, children }: SettingsSectionProps) {
  return (
    <div className="bg-[#141627]/70 backdrop-blur-md rounded-xl border border-[#2f2645]">
      <div className="px-6 py-4 border-b border-white/[0.08] flex items-center gap-3">
        <div className="p-1.5 bg-white/10 rounded-lg">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="px-6 py-2 divide-y divide-white/[0.06]">
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updatePreferences } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Initialize dark mode from document class on mount
  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  // Initialize notification preferences from user data if available
  useEffect(() => {
    if (user?.preferences) {
      const prefs = user.preferences;
      if (typeof prefs.pushNotifications === 'boolean') {
        setPushNotifications(prefs.pushNotifications);
      }
      if (typeof prefs.emailNotifications === 'boolean') {
        setEmailNotifications(prefs.emailNotifications);
      }
    }
  }, [user?.preferences]);

  const handleDarkModeChange = (enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSave = async () => {
    try {
      await updatePreferences({
        darkMode,
        pushNotifications,
        emailNotifications,
      });
      setSaveMessage('Settings saved successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage('Failed to save settings');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
        <p className="text-slate-400">
          Manage your preferences and account settings
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Section */}
        <SettingsSection
          icon={<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>}
          title="Profile"
        >
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Display Name</p>
                <p className="text-sm font-medium text-white mt-0.5">
                  {user?.name ?? 'Not signed in'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-400">Email</p>
              <p className="text-sm font-medium text-white mt-0.5">
                {user?.email ?? 'Not available'}
              </p>
            </div>
          </div>
          <div className="py-4 flex items-center justify-between">
            <p className="text-sm font-medium text-white">
              Edit profile
            </p>
            <button onClick={() => navigate('/profile')} className="flex items-center gap-1 text-sm text-violet-300 hover:text-violet-200 cursor-pointer">
              Go to Profile
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </button>
          </div>
        </SettingsSection>

        {/* Display Section */}
        <SettingsSection
          icon={<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>light_mode</span>}
          title="Display"
        >
          <ToggleSwitch
            enabled={darkMode}
            onChange={handleDarkModeChange}
            label="Dark Mode"
            description="Switch between light and dark theme"
          />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection
          icon={<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>}
          title="Notifications"
        >
          <ToggleSwitch
            enabled={pushNotifications}
            onChange={setPushNotifications}
            label="Push Notifications"
            description="Receive push notifications for transit alerts and reminders"
          />
          <ToggleSwitch
            enabled={emailNotifications}
            onChange={setEmailNotifications}
            label="Email Notifications"
            description="Receive email updates about significant astrological events"
          />
        </SettingsSection>

        {/* Save Button */}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={() => void handleSave()}
            className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Save Settings
          </button>
          {saveMessage && (
            <span
              className={`text-sm font-medium ${
                saveMessage.includes('success')
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
              role="status"
              aria-live="polite"
            >
              {saveMessage}
            </span>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
