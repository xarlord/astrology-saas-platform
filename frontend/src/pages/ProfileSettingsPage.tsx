/**
 * ProfileSettingsPage Component
 *
 * Multi-tab profile settings page with:
 * - Profile Settings Tab (avatar, name, email, bio, location)
 * - Account Settings Tab (password, email preferences, notifications, delete account)
 * - Subscription Tab (plan, usage, billing)
 * - Appearance Tab (theme, density, sidebar, animations)
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { TIMEOUTS } from '../utils/constants';

type TabType = 'profile' | 'account' | 'subscription' | 'appearance';

interface FormData {
  fullName: string;
  displayName: string;
  bio: string;
  location: string;
  avatar: string;
}

interface NotificationSettings {
  majorTransits: boolean;
  moonPhases: boolean;
  retrogradeWarnings: boolean;
  dailyHoroscope: boolean;
  weeklyForecast: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  density: 'compact' | 'comfortable' | 'spacious';
  sidebarPosition: 'left' | 'right';
  animations: boolean;
}

export const ProfileSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, isLoading: _isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Profile form data
  const [formData, setFormData] = useState<FormData>({
    fullName: user?.name ?? '',
    displayName: user?.name ?? '',
    bio: (user as { bio?: string })?.bio ?? '',
    location: (user as { location?: string })?.location ?? '',
    avatar: user?.avatar_url ?? '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    majorTransits: true,
    moonPhases: false,
    retrogradeWarnings: true,
    dailyHoroscope: true,
    weeklyForecast: false,
  });

  // Appearance settings
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'dark',
    density: 'comfortable',
    sidebarPosition: 'left',
    animations: true,
  });

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleNotificationChange = useCallback((key: keyof NotificationSettings, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSaveProfile = async () => {
    setSaveStatus('saving');
    try {
      await updateProfile({
        name: formData.fullName,
        // Note: bio and location would need backend support
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), TIMEOUTS.SAVE_STATUS_DURATION_MS);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), TIMEOUTS.SAVE_ERROR_DURATION_MS);
    }
  };

  const _ZODIAC_SYMBOLS: Record<string, string> = {
    Aries: '♈',
    Taurus: '♉',
    Gemini: '♊',
    Cancer: '♋',
    Leo: '♌',
    Virgo: '♍',
    Libra: '♎',
    Scorpio: '♏',
    Sagittarius: '♐',
    Capricorn: '♑',
    Aquarius: '♒',
    Pisces: '♓',
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Personal Info', icon: 'person' },
    { id: 'account' as TabType, label: 'Account', icon: 'lock' },
    { id: 'subscription' as TabType, label: 'Subscription', icon: 'credit_card' },
    { id: 'appearance' as TabType, label: 'Appearance', icon: 'palette' },
  ];

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-card-dark/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="text-primary p-1.5 rounded-lg bg-primary/10">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                AstroVerse
              </span>
            </div>

            {/* Right Nav Actions */}
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="h-8 w-[1px] bg-white/10" />
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => navigate('/profile')}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                    {user?.name ?? 'User'}
                  </p>
                  <p className="text-xs text-slate-500">Pro Member</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">person</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Profile Card */}
        <div className="bg-card-dark/80 backdrop-blur-md rounded-2xl p-6 md:p-8 relative overflow-hidden group">
          {/* Background Decoration */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cosmic-blue/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Avatar Section */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-[3px] bg-gradient-to-tr from-primary via-cosmic-blue to-primary/30 animate-spin-slow relative">
                <div className="w-full h-full rounded-full bg-background-dark p-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-cosmic-blue/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-white">person</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-2 right-2 bg-gold text-background-dark text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2 border-background-dark flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">stars</span>
                <span>PRO</span>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center md:text-left space-y-4 w-full">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    {user?.name ?? 'User'}
                  </h1>
                  <p className="text-slate-400 mt-1 flex items-center justify-center md:justify-start gap-2">
                    <span className="material-symbols-outlined text-[18px]">alternate_email</span>
                    {user?.email ?? 'user@example.com'}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Edit Profile
                </Button>
              </div>

              {/* Zodiac Badges - Placeholder */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                <div className="flex items-center gap-2 bg-surface-dark/50 border border-white/5 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                  <span className="text-lg">♏</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                      Sun
                    </span>
                    <span className="text-sm font-medium text-white">Scorpio</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-surface-dark/50 border border-white/5 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                  <span className="text-lg">♓</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                      Moon
                    </span>
                    <span className="text-sm font-medium text-white">Pisces</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-surface-dark/50 border border-white/5 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                  <span className="text-lg">♌</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                      Rising
                    </span>
                    <span className="text-sm font-medium text-white">Leo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-white/10 overflow-x-auto">
          <nav className="flex space-x-8 min-w-max" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-400 hover:border-slate-300 hover:text-slate-200'
                )}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'profile' && (
              <>
                {/* Personal Details Card */}
                <div className="bg-card-dark/80 backdrop-blur-md rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">badge</span>
                    Basic Information
                  </h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300" htmlFor="fullName">
                          Full Name
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="w-full rounded-xl px-4 py-3 bg-surface-dark/50 border border-white/10 text-slate-100 placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          data-testid="full-name-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300" htmlFor="displayName">
                          Display Name
                        </label>
                        <input
                          id="displayName"
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => handleInputChange('displayName', e.target.value)}
                          className="w-full rounded-xl px-4 py-3 bg-surface-dark/50 border border-white/10 text-slate-100 placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          data-testid="display-name-input"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300" htmlFor="email">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          type="email"
                          value={user?.email ?? ''}
                          disabled
                          className="w-full rounded-xl px-4 py-3 pr-10 bg-surface-dark/50 border border-white/10 text-slate-400 cursor-not-allowed"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-green-500">
                          <span className="material-symbols-outlined text-[20px]">verified</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Your email is verified.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300" htmlFor="bio">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell us about your astrological journey..."
                        className="w-full rounded-xl px-4 py-3 resize-none bg-surface-dark/50 border border-white/10 text-slate-100 placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        data-testid="bio-input"
                      />
                      <p className="text-xs text-slate-500 text-right">
                        {formData.bio.length}/150 characters
                      </p>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => { void handleSaveProfile(); }}
                        isLoading={saveStatus === 'saving'}
                        className="flex items-center gap-2"
                        data-testid="save-profile-button"
                      >
                        <span className="material-symbols-outlined">save</span>
                        {saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'account' && (
              <>
                {/* Account Settings Card */}
                <div className="bg-card-dark/80 backdrop-blur-md rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">lock</span>
                    Security
                  </h2>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-slate-300">Change Password</h3>
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Current password"
                          className="w-full rounded-xl px-4 py-3 bg-surface-dark/50 border border-white/10 text-slate-100 placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                        <input
                          type="password"
                          placeholder="New password"
                          className="w-full rounded-xl px-4 py-3 bg-surface-dark/50 border border-white/10 text-slate-100 placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full rounded-xl px-4 py-3 bg-surface-dark/50 border border-white/10 text-slate-100 placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>
                      <Button variant="primary" size="md">
                        Update Password
                      </Button>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-red-400">Danger Zone</h3>
                      <p className="text-sm text-slate-400">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button variant="danger" size="md">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'subscription' && (
              <>
                {/* Subscription Card */}
                <div className="bg-card-dark/80 backdrop-blur-md rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">credit_card</span>
                    Subscription Details
                  </h2>
                  <div className="space-y-4">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-surface-dark to-background-dark border border-white/5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs font-bold text-gold uppercase tracking-wider mb-1">
                            Current Plan
                          </p>
                          <h3 className="text-2xl font-bold text-white">Pro Plan ✨</h3>
                        </div>
                        <span className="text-lg font-bold text-white">
                          $12<span className="text-sm font-normal text-slate-400">/mo</span>
                        </span>
                      </div>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <span className="material-symbols-outlined text-primary text-[18px]">
                            check_circle
                          </span>
                          <span>Unlimited Transit Charts</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <span className="material-symbols-outlined text-primary text-[18px]">
                            check_circle
                          </span>
                          <span>Synastry Reports</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <span className="material-symbols-outlined text-primary text-[18px]">
                            check_circle
                          </span>
                          <span>Future Forecasts (1 Year)</span>
                        </div>
                      </div>
                      <Button variant="secondary" size="md" fullWidth>
                        Manage Subscription
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'appearance' && (
              <>
                {/* Appearance Card */}
                <div className="bg-card-dark/80 backdrop-blur-md rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">palette</span>
                    Appearance Settings
                  </h2>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-slate-300">Theme</h3>
                      <div className="flex gap-3">
                        {(['light', 'dark', 'system'] as const).map((theme) => (
                          <button
                            key={theme}
                            onClick={() => setAppearance((prev) => ({ ...prev, theme }))}
                            className={clsx(
                              'flex-1 p-4 rounded-xl border transition-all',
                              appearance.theme === theme
                                ? 'border-primary bg-primary/20 text-white'
                                : 'border-white/10 bg-surface-dark/50 text-slate-400 hover:border-white/20'
                            )}
                          >
                            <div className="text-center">
                              <span className="material-symbols-outlined text-2xl mb-1">
                                {theme === 'light' ? 'light_mode' : theme === 'dark' ? 'dark_mode' : 'brightness_4'}
                              </span>
                              <p className="text-xs capitalize">{theme}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-slate-300">Interface Density</h3>
                      <div className="flex gap-3">
                        {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
                          <button
                            key={density}
                            onClick={() => setAppearance((prev) => ({ ...prev, density }))}
                            className={clsx(
                              'flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                              appearance.density === density
                                ? 'border-primary bg-primary/20 text-white'
                                : 'border-white/10 bg-surface-dark/50 text-slate-400 hover:border-white/20'
                            )}
                          >
                            {density}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    <Toggle
                      checked={appearance.animations}
                      onChange={(checked) => setAppearance((prev) => ({ ...prev, animations: checked }))}
                      label="Enable Animations"
                      helperText="Smooth transitions and micro-interactions"
                    />

                    <div className="h-px bg-white/5" />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-slate-300">Sidebar Position</h3>
                      <div className="flex gap-3">
                        {(['left', 'right'] as const).map((position) => (
                          <button
                            key={position}
                            onClick={() => setAppearance((prev) => ({ ...prev, sidebarPosition: position }))}
                            className={clsx(
                              'flex-1 px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-all',
                              appearance.sidebarPosition === position
                                ? 'border-primary bg-primary/20 text-white'
                                : 'border-white/10 bg-surface-dark/50 text-slate-400 hover:border-white/20'
                            )}
                          >
                            {position}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Notifications Card */}
            <div className="bg-card-dark/80 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">notifications_active</span>
                Notification Preferences
              </h2>
              <div className="space-y-5">
                <Toggle
                  checked={notifications.majorTransits}
                  onChange={(checked) => handleNotificationChange('majorTransits', checked)}
                  label="Major Transits"
                  helperText="Get alerted when planets change signs"
                />
                <div className="h-px bg-white/5" />
                <Toggle
                  checked={notifications.moonPhases}
                  onChange={(checked) => handleNotificationChange('moonPhases', checked)}
                  label="Moon Phases"
                  helperText="New and Full Moon reminders"
                />
                <div className="h-px bg-white/5" />
                <Toggle
                  checked={notifications.retrogradeWarnings}
                  onChange={(checked) => handleNotificationChange('retrogradeWarnings', checked)}
                  label="Retrograde Warnings"
                  helperText="Mercury retrograde preparation alerts"
                />
                <div className="h-px bg-white/5" />
                <Toggle
                  checked={notifications.dailyHoroscope}
                  onChange={(checked) => handleNotificationChange('dailyHoroscope', checked)}
                  label="Daily Horoscope"
                  helperText="Receive your daily horoscope every morning"
                />
                <div className="h-px bg-white/5" />
                <Toggle
                  checked={notifications.weeklyForecast}
                  onChange={(checked) => handleNotificationChange('weeklyForecast', checked)}
                  label="Weekly Forecast"
                  helperText="Weekly transit forecast every Sunday"
                />
              </div>
            </div>

            {/* Birth Data Preview Card */}
            <div className="bg-card-dark/80 backdrop-blur-md rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">auto_fix</span>
                Birth Data
              </h2>
              <div className="space-y-4">
                <div className="bg-surface-dark/50 rounded-xl p-4 flex flex-col items-center justify-center border border-white/5 min-h-[180px]">
                  <div className="w-32 h-32 rounded-full border-2 border-primary/30 relative flex items-center justify-center">
                    <div className="absolute inset-0 border border-white/10 rounded-full scale-75" />
                    <div className="absolute inset-0 border border-white/10 rounded-full scale-50" />
                    <div className="w-[1px] h-full bg-white/10 absolute" />
                    <div className="h-[1px] w-full bg-white/10 absolute" />
                  </div>
                  <p className="text-xs text-slate-500 mt-3">Preview based on current data</p>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex gap-3 items-start">
                  <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                    info
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Updating your birth data will recalculate your entire profile, including your "Big Three"
                    and all saved transits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettingsPage;
