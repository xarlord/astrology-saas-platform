import React, { useState } from 'react';
import { useAuth, useCharts } from '../hooks';
import {
  CameraIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  StarIcon,
  SparklesIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { ChartWheel } from './';

// Types based on findings.md
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  timezone: string;
  createdAt: Date;
  subscription: {
    plan: 'free' | 'premium' | 'professional';
    status: 'active' | 'canceled' | 'expired';
    renewalDate?: Date;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    defaultHouseSystem: HouseSystem;
    defaultZodiac: 'tropical' | 'sidereal';
    aspectOrbs: {
      conjunction: number;
      opposition: number;
      trine: number;
      square: number;
      sextile: number;
    };
  };
}

export type HouseSystem = 'placidus' | 'koch' | 'porphyry' | 'whole' | 'equal' | 'topocentric';

export interface Chart {
  id: string;
  userId: string;
  name: string;
  type: 'natal' | 'synastry' | 'composite' | 'transit';
  birthData: {
    date: Date;
    time: string;
    place: {
      name: string;
      latitude: number;
      longitude: number;
      timezone: string;
    };
    timeUnknown: boolean;
  };
  settings: {
    houseSystem: HouseSystem;
    zodiac: 'tropical' | 'sidereal';
    sideralMode?: string;
  };
  calculatedData?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfileProps {
  onEditChart?: (chartId: string) => void;
  onViewChart?: (chartId: string) => void;
  onDeleteChart?: (chartId: string) => void;
}

export function UserProfile({ onEditChart, onViewChart, onDeleteChart }: UserProfileProps) {
  const { user, updateProfile } = useAuth();
  const { charts, deleteChart } = useCharts();

  // Convert User to UserProfile if needed
  const userProfile: UserProfile | undefined = user ? {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar_url || user.avatar,
    createdAt: user.createdAt || new Date(),
    timezone: user.timezone || 'UTC',
    subscription: {
      plan: (user.plan as 'free' | 'premium' | 'professional') || 'free',
      status: 'active',
    },
    preferences: {
      theme: user.preferences?.theme || 'auto',
      defaultHouseSystem: user.preferences?.defaultHouseSystem || 'placidus',
      defaultZodiac: user.preferences?.defaultZodiac || 'tropical',
      aspectOrbs: user.preferences?.aspectOrbs || {
        conjunction: 10,
        opposition: 10,
        trine: 8,
        square: 8,
        sextile: 6,
      },
    },
  } : undefined;

  // Convert service Chart to UserProfile Chart type
  const chartsForDisplay: Chart[] = (charts || []).map(chart => ({
    id: chart.id,
    userId: '', // Not available in service Chart type
    name: chart.name,
    type: (chart.type || 'natal') as 'natal' | 'synastry' | 'composite' | 'transit',
    birthData: {
      date: new Date(chart.birth_date || Date.now()),
      time: chart.birth_time || '00:00',
      place: {
        name: chart.birth_place_name || 'Unknown',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
      },
      timeUnknown: false,
    },
    settings: {
      houseSystem: 'placidus',
      zodiac: 'tropical',
    },
    calculatedData: chart.calculated_data,
    createdAt: new Date(chart.created_at || Date.now()),
    updatedAt: new Date(chart.created_at || Date.now()),
  }));

  const [activeTab, setActiveTab] = useState<'account' | 'charts' | 'preferences' | 'subscription'>('account');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    timezone: user?.timezone || 'UTC',
  });

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: '👤' },
    { id: 'charts' as const, label: 'My Charts', icon: '📊' },
    { id: 'preferences' as const, label: 'Preferences', icon: '⚙️' },
    { id: 'subscription' as const, label: 'Subscription', icon: '💳' },
  ];

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ name: editData.name, timezone: editData.timezone });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleDeleteChart = async (chartId: string) => {
    if (window.confirm('Are you sure you want to delete this chart?')) {
      await deleteChart(chartId);
      onDeleteChart?.(chartId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <ProfileHeader
        user={userProfile}
        isEditing={isEditing}
        editData={editData}
        onEditToggle={() => setIsEditing(!isEditing)}
        onDataChange={setEditData}
        onSave={handleSaveProfile}
      />

      {/* Tabbed Content */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                data-testid={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'account' && !isEditing && <AccountTab user={userProfile} />}
          {activeTab === 'charts' && (
            <ChartsTab
              charts={chartsForDisplay}
              onEditChart={onEditChart}
              onViewChart={onViewChart}
              onDeleteChart={handleDeleteChart}
            />
          )}
          {activeTab === 'preferences' && <PreferencesTab user={userProfile} />}
          {activeTab === 'subscription' && <SubscriptionTab user={userProfile} />}
        </div>
      </div>
    </div>
  );
}

// Profile Header Component
function ProfileHeader({
  user,
  isEditing,
  editData,
  onEditToggle,
  onDataChange,
  onSave,
}: {
  user?: UserProfile;
  isEditing: boolean;
  editData: { name: string; timezone: string };
  onEditToggle: () => void;
  onDataChange: (data: { name: string; timezone: string }) => void;
  onSave: () => void;
}) {
  if (!user) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Change avatar"
            title="Change avatar"
          >
            <CameraIcon className="w-4 h-4 text-indigo-600" />
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
                  className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="profile-timezone-edit" className="sr-only">
                  Edit Timezone
                </label>
                <select
                  id="profile-timezone-edit"
                  value={editData.timezone}
                  onChange={(e) => onDataChange({ ...editData, timezone: e.target.value })}
                  aria-required="true"
                  className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Central European</option>
                  <option value="Asia/Tokyo">Japan</option>
                  <option value="Asia/Singapore">Singapore</option>
                </select>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-white/80">{user.email}</p>
              <p className="text-sm text-white/60 mt-1">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
                onClick={onSave}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
                aria-label="Save"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onEditToggle}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                aria-label="Cancel"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onEditToggle}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              title="Edit profile"
              aria-label="Edit profile"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Account Tab Component
function AccountTab({ user }: { user?: UserProfile }) {
  if (!user) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={user.name}
            disabled
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Email cannot be changed. Contact support for assistance.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timezone
          </label>
          <input
            type="text"
            value={user.timezone}
            disabled
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Member Since
          </label>
          <input
            type="text"
            value={new Date(user.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
            disabled
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
          />
        </div>
      </div>

      {/* Change Password Section */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Security</h4>
        <button type="button" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Change Password
        </button>
      </div>

      {/* Danger Zone */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-medium text-red-600 dark:text-red-400 mb-4">Danger Zone</h4>
        <button type="button" className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">
          Delete My Account
        </button>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          This action cannot be undone. All your data will be permanently deleted.
        </p>
      </div>
    </div>
  );
}

// Charts Tab Component
function ChartsTab({
  charts,
  onEditChart,
  onViewChart,
  onDeleteChart,
}: {
  charts?: Chart[];
  onEditChart?: (chartId: string) => void;
  onViewChart?: (chartId: string) => void;
  onDeleteChart?: (chartId: string) => void;
}) {
  if (!charts || charts.length === 0) {
    return (
      <div className="text-center py-12">
        <StarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No charts yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Create your first natal chart to get started
        </p>
        <button type="button" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <PlusIcon className="w-5 h-5 inline mr-2" />
          Create Your First Chart
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="charts-tab-content">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          My Charts ({charts.length})
        </h3>
        <button type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <PlusIcon className="w-5 h-5" />
          Add New Chart
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charts.map((chart) => (
          <ChartCard
            key={chart.id}
            chart={chart}
            onEdit={() => onEditChart?.(chart.id)}
            onView={() => onViewChart?.(chart.id)}
            onDelete={() => onDeleteChart?.(chart.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Chart Card Component
function ChartCard({
  chart,
  onEdit,
  onView,
  onDelete,
}: {
  chart: Chart;
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Chart Thumbnail */}
      <div className="aspect-square bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-750 flex items-center justify-center p-4">
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <span className="text-sm">Chart Preview</span>
        </div>
      </div>

      {/* Chart Info */}
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{chart.name}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {new Date(chart.birthData.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}{' '}
          • {chart.birthData.place.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
          <span className="capitalize">{chart.settings.houseSystem}</span>
          <span>•</span>
          <span className="capitalize">{chart.settings.zodiac}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          type="button"
          onClick={onView}
          className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          View
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          aria-label="Edit chart"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="px-3 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          aria-label="Delete chart"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Preferences Tab Component
function PreferencesTab({ user }: { user?: UserProfile }) {
  if (!user) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chart Preferences</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Default House System */}
        <div>
          <label htmlFor="house-system" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default House System
          </label>
          <select
            id="house-system"
            defaultValue={user.preferences.defaultHouseSystem}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="placidus">Placidus</option>
            <option value="koch">Koch</option>
            <option value="porphyry">Porphyry</option>
            <option value="whole">Whole Sign</option>
            <option value="equal">Equal</option>
            <option value="topocentric">Topocentric</option>
          </select>
        </div>

        {/* Default Zodiac Type */}
        <div>
          <label htmlFor="zodiac-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Zodiac Type
          </label>
          <select
            id="zodiac-type"
            defaultValue={user.preferences.defaultZodiac}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="tropical">Tropical</option>
            <option value="sidereal">Sidereal</option>
          </select>
        </div>
      </div>

      {/* Aspect Orbs */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Aspect Orb Sensitivity</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label htmlFor="conjunction-orb" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Conjunction/ Opposition
              </label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user.preferences.aspectOrbs.conjunction}°
              </span>
            </div>
            <input
              id="conjunction-orb"
              type="range"
              min="1"
              max="15"
              defaultValue={user.preferences.aspectOrbs.conjunction}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label htmlFor="trine-orb" className="text-sm font-medium text-gray-700 dark:text-gray-300">Trine/ Square</label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user.preferences.aspectOrbs.trine}°
              </span>
            </div>
            <input
              id="trine-orb"
              type="range"
              min="1"
              max="15"
              defaultValue={user.preferences.aspectOrbs.trine}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label htmlFor="sextile-orb" className="text-sm font-medium text-gray-700 dark:text-gray-300">Sextile</label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user.preferences.aspectOrbs.sextile}°
              </span>
            </div>
            <input
              id="sextile-orb"
              type="range"
              min="1"
              max="12"
              defaultValue={user.preferences.aspectOrbs.sextile}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Appearance</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'light', label: 'Light', icon: '☀️' },
              { value: 'dark', label: 'Dark', icon: '🌙' },
              { value: 'auto', label: 'System', icon: '💻' },
            ].map((theme) => (
              <button
                type="button"
                key={theme.value}
                className={`
                  p-4 rounded-lg border-2 text-center transition-all
                  ${
                    user.preferences.theme === theme.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }
                `}
              >
                <div className="text-2xl mb-2">{theme.icon}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{theme.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-6">
        <button type="button" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Save Preferences
        </button>
      </div>
    </div>
  );
}

// Subscription Tab Component
function SubscriptionTab({ user }: { user?: UserProfile }) {
  if (!user) return null;

  const plans = [
    {
      name: 'Free',
      price: '$0/month',
      features: ['3 natal charts', 'Basic personality analysis', 'Daily transits', 'Community support'],
      cta: 'Current Plan',
      disabled: true,
      highlight: false,
    },
    {
      name: 'Premium',
      price: '$9.99/month',
      features: [
        'Unlimited natal charts',
        'Detailed personality analysis',
        'Transit calendar & forecasts',
        'Aspect pattern detection',
        'Priority support',
      ],
      cta: user.subscription.plan === 'premium' ? 'Current Plan' : 'Upgrade',
      disabled: user.subscription.plan === 'premium',
      highlight: true,
    },
    {
      name: 'Professional',
      price: '$29.99/month',
      features: [
        'Everything in Premium',
        'Synastry charts (compatibility)',
        'Composite charts',
        'Transit to transit analysis',
        'PDF chart exports',
        'Dedicated support',
      ],
      cta: user.subscription.plan === 'professional' ? 'Current Plan' : 'Upgrade',
      disabled: user.subscription.plan === 'professional',
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
              Current Plan: {user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)}
            </h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              Status: {user.subscription.status.charAt(0).toUpperCase() + user.subscription.status.slice(1)}
            </p>
            {user.subscription.renewalDate && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                Renews on {new Date(user.subscription.renewalDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
          <SparklesIcon className="w-8 h-8 text-indigo-500" />
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Plans</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Billing History</h4>
        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No billing history available for your account.
          </p>
        </div>
      </div>
    </div>
  );
}

// Plan Card Component
function PlanCard({
  plan,
}: {
  plan: {
    name: string;
    price: string;
    features: string[];
    cta: string;
    disabled: boolean;
    highlight: boolean;
  };
}) {
  return (
    <div
      className={`
        bg-white dark:bg-gray-700 rounded-lg border-2 p-6
        ${plan.highlight ? 'border-indigo-500 shadow-lg' : 'border-gray-200 dark:border-gray-600'}
      `}
    >
      {plan.highlight && (
        <div className="text-center mb-4">
          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-medium rounded-full">
            Most Popular
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
        <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{plan.price}</p>
      </div>
      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={plan.disabled}
        className={`
          w-full py-3 rounded-lg font-medium transition-colors
          ${
            plan.disabled
              ? 'bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : plan.highlight
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500'
          }
        `}
      >
        {plan.cta}
      </button>
    </div>
  );
}
