import { useState } from 'react';
import { useAuth, useCharts } from '../hooks';
import { logger } from '@/utils/logger';
import { ProfileHeader } from './user-profile/ProfileHeader';
import { AccountTab } from './user-profile/AccountTab';
import { ChartsTab } from './user-profile/ChartsTab';
import { PreferencesTab } from './user-profile/PreferencesTab';
import { SubscriptionTab } from './user-profile/SubscriptionTab';
import type { UserProfile, Chart, UserData, UserProfileProps } from './user-profile/types';

// Re-export types for backward compatibility (barrel imports from components/index.ts)
export type { UserProfile as UserProfileType, Chart, HouseSystem } from './user-profile/types';

interface TabConfig {
  id: 'account' | 'charts' | 'preferences' | 'subscription';
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'charts', label: 'My Charts', icon: '📊' },
  { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  { id: 'subscription', label: 'Subscription', icon: '💳' },
];

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      date: new Date(chart.birth_data?.birth_date ?? Date.now()),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      time: chart.birth_data?.birth_time ?? '00:00',
      place: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
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

  // Extract birth coordinates from first chart (natal) for timezone detection
  const birthCoordinates = (charts ?? []).length > 0
    ? (() => {
        const firstChart = charts[0];
        const lat = firstChart.birth_latitude ?? firstChart.birth_data?.birth_latitude;
        const lon = firstChart.birth_longitude ?? firstChart.birth_data?.birth_longitude;
        if (typeof lat === 'number' && typeof lon === 'number') {
          return { latitude: lat, longitude: lon };
        }
        return null;
      })()
    : null;

  const [activeTab, setActiveTab] = useState<'account' | 'charts' | 'preferences' | 'subscription'>('account');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    name: user?.name ?? '',
    timezone: user?.timezone ?? 'UTC',
  });

  const handleSaveProfile = (): void => {
    void (async () => {
      try {
        await updateProfile({ name: editData.name, timezone: editData.timezone });
        setIsEditing(false);
      } catch (error) {
        logger.error('Failed to update profile:', error);
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
        birthCoordinates={birthCoordinates}
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
              const idx = TABS.findIndex((t) => t.id === activeTab);
              if (e.key === 'ArrowRight' && idx < TABS.length - 1) { e.preventDefault(); setActiveTab(TABS[idx + 1].id); }
              if (e.key === 'ArrowLeft' && idx > 0) { e.preventDefault(); setActiveTab(TABS[idx - 1].id); }
            }}
          >
            {TABS.map((tab) => (
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
