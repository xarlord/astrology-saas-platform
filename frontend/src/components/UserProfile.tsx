import { useState } from 'react';
import { useAuth, useCharts } from '../hooks';
import { EmptyState } from './EmptyState';

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
  calculatedData?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfileProps {
  onEditChart?: (chartId: string) => void;
  onViewChart?: (chartId: string) => void;
  onDeleteChart?: (chartId: string) => void;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  avatar?: string;
  createdAt?: Date;
  timezone?: string;
  plan?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    defaultHouseSystem?: HouseSystem;
    defaultZodiac?: 'tropical' | 'sidereal';
    aspectOrbs?: {
      conjunction: number;
      opposition: number;
      trine: number;
      square: number;
      sextile: number;
    };
  };
}

export function UserProfile({ onEditChart, onViewChart, onDeleteChart }: UserProfileProps) {
  const { user, updateProfile } = useAuth();
  const { charts, deleteChart } = useCharts();

  // Convert User to UserProfile if needed
  const typedUser = user as UserData | null;
  const userProfile: UserProfile | undefined = typedUser ? {
    id: typedUser.id,
    email: typedUser.email,
    name: typedUser.name,
    avatar: typedUser.avatar_url ?? typedUser.avatar,
    createdAt: typedUser.createdAt ?? new Date(),
    timezone: typedUser.timezone ?? 'UTC',
    subscription: {
      plan: (typedUser.plan as 'free' | 'premium' | 'professional') ?? 'free',
      status: 'active',
    },
    preferences: {
      theme: typedUser.preferences?.theme ?? 'auto',
      defaultHouseSystem: typedUser.preferences?.defaultHouseSystem ?? 'placidus',
      defaultZodiac: typedUser.preferences?.defaultZodiac ?? 'tropical',
      aspectOrbs: typedUser.preferences?.aspectOrbs ?? {
        conjunction: 10,
        opposition: 10,
        trine: 8,
        square: 8,
        sextile: 6,
      },
    },
  } : undefined;

  // Convert service Chart to UserProfile Chart type
  const chartsForDisplay: Chart[] = (charts ?? []).map(chart => ({
    id: chart.id,
    userId: '', // Not available in service Chart type
    name: chart.name,
    type: (chart.type ?? 'natal') as 'natal' | 'synastry' | 'composite' | 'transit',
    birthData: {
      date: new Date(chart.birth_data?.birth_date ?? Date.now()),
      time: chart.birth_data?.birth_time ?? '00:00',
      place: {
        name: chart.birth_data?.birth_place_name ?? 'Unknown',
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
    calculatedData: chart.calculated_data as Record<string, unknown> | undefined,
    createdAt: new Date(chart.created_at ?? Date.now()),
    updatedAt: new Date(chart.created_at ?? Date.now()),
  }));

  const [activeTab, setActiveTab] = useState<'account' | 'charts' | 'preferences' | 'subscription'>('account');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    name: user?.name ?? '',
    timezone: user?.timezone ?? 'UTC',
  });

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: '👤' },
    { id: 'charts' as const, label: 'My Charts', icon: '📊' },
    { id: 'preferences' as const, label: 'Preferences', icon: '⚙️' },
    { id: 'subscription' as const, label: 'Subscription', icon: '💳' },
  ];

  const handleSaveProfile = (): void => {
    void (async () => {
      try {
        await updateProfile({ name: editData.name, timezone: editData.timezone });
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update profile:', error);
      }
    })();
  };

  const handleDeleteChart = (chartId: string): void => {
    setDeleteTarget(chartId);
  };

  const confirmDelete = (): void => {
    if (deleteTarget) {
      void deleteChart(deleteTarget);
      onDeleteChart?.(deleteTarget);
      setDeleteTarget(null);
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
      <div className="mt-6 glass-panel rounded-2xl">
        {/* Tab Navigation */}
        <div className="border-b border-white/15">
          <nav
            role="tablist"
            aria-label="Profile sections"
            className="flex overflow-x-auto"
            onKeyDown={(e) => {
              const idx = tabs.findIndex((t) => t.id === activeTab);
              if (e.key === 'ArrowRight' && idx < tabs.length - 1) { e.preventDefault(); setActiveTab(tabs[idx + 1].id); }
              if (e.key === 'ArrowLeft' && idx > 0) { e.preventDefault(); setActiveTab(tabs[idx - 1].id); }
            }}
          >
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                role="tab"
                id={`profile-tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls="profile-tabpanel"
                tabIndex={activeTab === tab.id ? 0 : -1}
                data-testid={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-200 hover:text-white hover:border-white/15'
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
        <div role="tabpanel" id="profile-tabpanel" aria-labelledby={`profile-tab-${activeTab}`} className="p-6">
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

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          aria-describedby="delete-confirm-desc"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          <div className="bg-cosmic-card border border-cosmic-border rounded-lg p-6 max-w-sm mx-4">
            <h3 id="delete-confirm-title" className="text-lg font-semibold text-white mb-2">Delete Chart</h3>
            <p id="delete-confirm-desc" className="text-slate-200 text-sm mb-6">
              Are you sure you want to delete this chart? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-white/15 text-slate-200 border border-cosmic-border rounded-lg hover:bg-white/15 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                autoFocus
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
            <span className="material-symbols-outlined text-primary" aria-hidden="true" style={{ fontSize: '16px' }}>photo_camera</span>
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
              <div>
                <label htmlFor="profile-timezone-edit" className="sr-only">
                  Edit Timezone
                </label>
                <select
                  id="profile-timezone-edit"
                  value={editData.timezone}
                  onChange={(e) => onDataChange({ ...editData, timezone: e.target.value })}
                  aria-required="true"
                  className="px-4 py-2 rounded-xl bg-cosmic-card-solid border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
              <h1 className="text-2xl font-bold gradient-text">{user.name}</h1>
              <p className="text-slate-200">{user.email}</p>
              <p className="text-sm text-slate-200 mt-1">
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
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px' }}>close</span>
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
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px' }}>edit</span>
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
      <h3 className="text-lg font-semibold text-white">Account Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="account-name" className="block text-sm font-medium text-slate-200 mb-2">
            Display Name
          </label>
          <input
            id="account-name"
            type="text"
            value={user.name}
            disabled
            className="w-full px-4 py-2 rounded-xl border border-white/15 bg-cosmic-card-solid text-white disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="account-email" className="block text-sm font-medium text-slate-200 mb-2">
            Email Address
          </label>
          <input
            id="account-email"
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-2 rounded-xl border border-white/15 bg-cosmic-card-solid text-white disabled:opacity-60"
          />
          <p className="mt-1 text-xs text-slate-200">
            Email cannot be changed. Contact support for assistance.
          </p>
        </div>

        <div>
          <label htmlFor="account-timezone" className="block text-sm font-medium text-slate-200 mb-2">
            Timezone
          </label>
          <input
            id="account-timezone"
            type="text"
            value={user.timezone}
            disabled
            className="w-full px-4 py-2 rounded-xl border border-white/15 bg-cosmic-card-solid text-white disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
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
            className="w-full px-4 py-2 rounded-xl border border-white/15 bg-cosmic-card-solid text-white disabled:opacity-60"
          />
        </div>
      </div>

      {/* Change Password Section */}
      <div className="pt-6 border-t border-white/15">
        <h4 className="text-md font-medium text-white mb-4">Security</h4>
        <button type="button" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          Change Password
        </button>
      </div>

      {/* Danger Zone */}
      <div className="pt-6 border-t border-white/15">
        <h4 className="text-md font-medium text-red-400 mb-4">Danger Zone</h4>
        <button type="button" className="px-4 py-2 border border-red-800 text-red-400 rounded-lg hover:bg-red-900/20 transition-colors">
          Delete My Account
        </button>
        <p className="mt-2 text-xs text-slate-200">
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
        <EmptyState
          icon="auto_awesome"
          title="No charts yet"
          description="Create your first natal chart to get started"
          actionText="Create Your First Chart"
          onAction={() => window.location.href = '/charts/new'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="charts-tab-content">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          My Charts ({charts.length})
        </h3>
        <button type="button" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '20px' }}>add</span>
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
    <div className="bg-white/15 rounded-lg border border-white/15 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Chart Thumbnail */}
      <div className="aspect-square bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center p-4">
        <div className="w-full h-full flex items-center justify-center text-slate-200">
          <span className="text-sm">Chart Preview</span>
        </div>
      </div>

      {/* Chart Info */}
      <div className="p-4">
        <h4 className="font-semibold text-white mb-1">{chart.name}</h4>
        <p className="text-sm text-slate-200 mb-2">
          {new Date(chart.birthData.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}{' '}
          • {chart.birthData.place.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-200">
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
          className="flex-1 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          View
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="px-3 py-2 border border-white/15 text-slate-200 text-sm font-medium rounded-lg hover:bg-white/15 transition-colors"
          aria-label="Edit chart"
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '16px' }}>edit</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="px-3 py-2 border border-red-800 text-red-400 text-sm font-medium rounded-lg hover:bg-red-900/20 transition-colors"
          aria-label="Delete chart"
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '16px' }}>delete</span>
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
      <h3 className="text-lg font-semibold text-white">Chart Preferences</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Default House System */}
        <div>
          <label htmlFor="house-system" className="block text-sm font-medium text-slate-200 mb-2">
            Default House System
          </label>
          <select
            id="house-system"
            defaultValue={user.preferences.defaultHouseSystem}
            className="w-full px-4 py-2 rounded-lg border border-white/15 bg-white/15 text-white focus:border-primary focus:ring-primary"
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
          <label htmlFor="zodiac-type" className="block text-sm font-medium text-slate-200 mb-2">
            Default Zodiac Type
          </label>
          <select
            id="zodiac-type"
            defaultValue={user.preferences.defaultZodiac}
            className="w-full px-4 py-2 rounded-lg border border-white/15 bg-white/15 text-white focus:border-primary focus:ring-primary"
          >
            <option value="tropical">Tropical</option>
            <option value="sidereal">Sidereal</option>
          </select>
        </div>
      </div>

      {/* Aspect Orbs */}
      <div className="pt-6 border-t border-white/15">
        <h4 className="text-md font-medium text-white mb-4">Aspect Orb Sensitivity</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label htmlFor="conjunction-orb" className="text-sm font-medium text-slate-200">
                Conjunction/ Opposition
              </label>
              <span className="text-sm text-slate-200">
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
              <label htmlFor="trine-orb" className="text-sm font-medium text-slate-200">Trine/ Square</label>
              <span className="text-sm text-slate-200">
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
              <label htmlFor="sextile-orb" className="text-sm font-medium text-slate-200">Sextile</label>
              <span className="text-sm text-slate-200">
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
      <div className="pt-6 border-t border-white/15">
        <h4 className="text-md font-medium text-white mb-4">Appearance</h4>
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Theme
          </label>
          <div
            role="radiogroup"
            aria-label="Theme"
            className="grid grid-cols-3 gap-4"
            onKeyDown={(e) => {
              const themes = ['light', 'dark', 'auto'];
              const idx = themes.indexOf(user.preferences.theme);
              if (e.key === 'ArrowRight' && idx < themes.length - 1) { e.preventDefault(); user.preferences.theme = themes[idx + 1] as 'auto' | 'light' | 'dark'; }
              if (e.key === 'ArrowLeft' && idx > 0) { e.preventDefault(); user.preferences.theme = themes[idx - 1] as 'auto' | 'light' | 'dark'; }
            }}
          >
            {[
              { value: 'light', label: 'Light', icon: '☀️' },
              { value: 'dark', label: 'Dark', icon: '🌙' },
              { value: 'auto', label: 'System', icon: '💻' },
            ].map((theme) => (
              <button
                type="button"
                key={theme.value}
                role="radio"
                aria-checked={user.preferences.theme === theme.value}
                className={`
                  p-4 rounded-lg border-2 text-center transition-all
                  ${
                    user.preferences.theme === theme.value
                      ? 'border-primary bg-primary/10'
                      : 'border-white/15 hover:border-cosmic-border'
                  }
                `}
              >
                <div className="text-2xl mb-2">{theme.icon}</div>
                <div className="text-sm font-medium text-white">{theme.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-6">
        <button type="button" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
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
      <div className="bg-gradient-to-r from-primary/10 to-violet-500/10 rounded-lg p-6 border border-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">
              Current Plan: {user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)}
            </h3>
            <p className="text-sm text-primary">
              Status: {user.subscription.status.charAt(0).toUpperCase() + user.subscription.status.slice(1)}
            </p>
            {user.subscription.renewalDate && (
              <p className="text-xs text-primary mt-1">
                Renews on {new Date(user.subscription.renewalDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
          <span className="material-symbols-outlined text-primary" aria-hidden="true" style={{ fontSize: '32px' }}>auto_awesome</span>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Available Plans</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="pt-6 border-t border-white/15">
        <h4 className="text-lg font-semibold text-white mb-4">Billing History</h4>
        <div className="bg-white/15 rounded-lg p-6 text-center">
          <p className="text-slate-200 text-sm">
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
        bg-white/15 rounded-lg border-2 p-6
        ${plan.highlight ? 'border-primary shadow-lg' : 'border-white/15'}
      `}
    >
      {plan.highlight && (
        <div className="text-center mb-4">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            Most Popular
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-3xl font-bold text-primary">{plan.price}</p>
      </div>
      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-slate-200">
            <span className="material-symbols-outlined text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" style={{ fontSize: '20px' }}>check</span>
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
              ? 'bg-white/15 text-slate-200 cursor-not-allowed'
              : plan.highlight
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-white/15 border border-white/15 text-slate-200 hover:bg-white/15'
          }
        `}
      >
        {plan.cta}
      </button>
    </div>
  );
}
