/**
 * UI Store
 *
 * Manages global UI state and preferences
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type ViewMode = 'comfortable' | 'compact' | 'spacious';
type Density = 'default' | 'comfortable' | 'compact';

interface UIState {
  // State
  theme: Theme;
  sidebarOpen: boolean;
  viewMode: ViewMode;
  density: Density;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  showAspects: boolean;
  showHouses: boolean;
  showMidpoints: boolean;

  // Actions
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setViewMode: (mode: ViewMode) => void;
  setDensity: (density: Density) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  toggleReducedMotion: () => void;
  toggleShowAspects: () => void;
  toggleShowHouses: () => void;
  toggleShowMidpoints: () => void;
  resetUI: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getEffectiveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        theme: 'system',
        sidebarOpen: true,
        viewMode: 'comfortable',
        density: 'default',
        fontSize: 'medium',
        reducedMotion: false,
        showAspects: true,
        showHouses: true,
        showMidpoints: false,

        // Toggle theme
        toggleTheme: () => {
          const currentTheme = get().theme;
          let newTheme: Theme;

          if (currentTheme === 'system') {
            newTheme = getSystemTheme() === 'dark' ? 'light' : 'dark';
          } else {
            newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          }

          set({ theme: newTheme });

          // Apply theme to document
          if (typeof document !== 'undefined') {
            const effectiveTheme = getEffectiveTheme(newTheme);
            document.documentElement.setAttribute('data-theme', effectiveTheme);
          }
        },

        // Set theme
        setTheme: (theme: Theme) => {
          set({ theme });

          // Apply theme to document
          if (typeof document !== 'undefined') {
            const effectiveTheme = getEffectiveTheme(theme);
            document.documentElement.setAttribute('data-theme', effectiveTheme);
          }
        },

        // Set sidebar open state
        setSidebarOpen: (open: boolean) => {
          set({ sidebarOpen: open });
        },

        // Toggle sidebar
        toggleSidebar: () => {
          set((state) => ({ sidebarOpen: !state.sidebarOpen }));
        },

        // Set view mode
        setViewMode: (mode: ViewMode) => {
          set({ viewMode: mode });
        },

        // Set density
        setDensity: (density: Density) => {
          set({ density });
        },

        // Set font size
        setFontSize: (size: 'small' | 'medium' | 'large') => {
          set({ fontSize: size });

          // Apply font size to document
          if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-font-size', size);
          }
        },

        // Toggle reduced motion
        toggleReducedMotion: () => {
          set((state) => ({ reducedMotion: !state.reducedMotion }));

          // Apply to document
          if (typeof document !== 'undefined') {
            const newValue = !get().reducedMotion;
            document.documentElement.setAttribute('data-reduced-motion', String(newValue));
          }
        },

        // Toggle show aspects
        toggleShowAspects: () => {
          set((state) => ({ showAspects: !state.showAspects }));
        },

        // Toggle show houses
        toggleShowHouses: () => {
          set((state) => ({ showHouses: !state.showHouses }));
        },

        // Toggle show midpoints
        toggleShowMidpoints: () => {
          set((state) => ({ showMidpoints: !state.showMidpoints }));
        },

        // Reset UI to defaults
        resetUI: () => {
          set({
            theme: 'system',
            sidebarOpen: true,
            viewMode: 'comfortable',
            density: 'default',
            fontSize: 'medium',
            reducedMotion: false,
            showAspects: true,
            showHouses: true,
            showMidpoints: false,
          });

          // Reset document attributes
          if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', getSystemTheme());
            document.documentElement.setAttribute('data-font-size', 'medium');
            document.documentElement.setAttribute('data-reduced-motion', 'false');
          }
        },
      }),
      {
        name: 'ui-storage',
        // Persist all UI state
      },
    ),
    { name: 'UIStore' },
  ),
);

// Selector hooks for optimized re-renders
export const useTheme = () => useUIStore((state) => state.theme);
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen);
export const useViewMode = () => useUIStore((state) => state.viewMode);
export const useDensity = () => useUIStore((state) => state.density);
export const useChartDisplayOptions = () =>
  useUIStore((state) => ({
    showAspects: state.showAspects,
    showHouses: state.showHouses,
    showMidpoints: state.showMidpoints,
  }));

export default useUIStore;
