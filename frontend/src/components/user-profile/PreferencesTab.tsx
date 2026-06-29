import type { UserProfile } from './types';
import { uiStorage } from '../../utils/uiStorage';

export interface PreferencesTabProps {
  user?: UserProfile;
}

export function PreferencesTab({ user }: PreferencesTabProps) {
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
          <label htmlFor="label-theme-light" className="block text-sm font-medium text-slate-200 mb-2">
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
                id={theme.value === 'light' ? 'label-theme-light' : undefined}
                aria-checked={user.preferences.theme === theme.value}
                onClick={() => {
                  const root = document.documentElement;
                  if (theme.value === 'light') {
                    root.classList.remove('dark');
                    root.classList.add('light');
                  } else if (theme.value === 'dark') {
                    root.classList.remove('light');
                    root.classList.add('dark');
                  } else {
                    // auto — follow system
                    root.classList.remove('light', 'dark');
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      root.classList.add('dark');
                      } else {
                      root.classList.add('light');
                      }
                      }
                      uiStorage.setItem('theme', theme.value);
                }}
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
