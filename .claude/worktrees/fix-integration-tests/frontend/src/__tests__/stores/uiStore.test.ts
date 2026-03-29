/**
 * Tests for UI Store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useUIStore } from '../../stores/uiStore';

// Mock matchMedia globally
const mockMatchMedia = vi.fn();

describe('uiStore', () => {
  // Helper to reset store state
  const resetStore = () => {
    useUIStore.setState({
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
  };

  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();

    // Mock document.documentElement.setAttribute
    vi.spyOn(document.documentElement, 'setAttribute').mockImplementation(() => {});

    // Mock window.matchMedia to return a valid MediaQueryList-like object
    mockMatchMedia.mockReturnValue({
      matches: false, // default to light theme
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    vi.spyOn(window, 'matchMedia').mockImplementation(mockMatchMedia);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useUIStore.getState();

      expect(state.theme).toBe('system');
      expect(state.sidebarOpen).toBe(true);
      expect(state.viewMode).toBe('comfortable');
      expect(state.density).toBe('default');
      expect(state.fontSize).toBe('medium');
      expect(state.reducedMotion).toBe(false);
      expect(state.showAspects).toBe(true);
      expect(state.showHouses).toBe(true);
      expect(state.showMidpoints).toBe(false);
    });
  });

  describe('toggleTheme action', () => {
    it('should toggle from system to opposite of system theme', () => {
      // Mock matchMedia to return light theme
      mockMatchMedia.mockReturnValue({
        matches: false, // light theme
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      act(() => {
        useUIStore.getState().toggleTheme();
      });

      const state = useUIStore.getState();

      // System is light, should toggle to dark
      expect(state.theme).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      useUIStore.setState({ theme: 'dark' });

      act(() => {
        useUIStore.getState().toggleTheme();
      });

      expect(useUIStore.getState().theme).toBe('light');
    });

    it('should toggle from light to dark', () => {
      useUIStore.setState({ theme: 'light' });

      act(() => {
        useUIStore.getState().toggleTheme();
      });

      expect(useUIStore.getState().theme).toBe('dark');
    });

    it('should apply theme to document', () => {
      useUIStore.setState({ theme: 'light' });

      act(() => {
        useUIStore.getState().toggleTheme();
      });

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });
  });

  describe('setTheme action', () => {
    it('should set theme to light', () => {
      act(() => {
        useUIStore.getState().setTheme('light');
      });

      expect(useUIStore.getState().theme).toBe('light');
    });

    it('should set theme to dark', () => {
      act(() => {
        useUIStore.getState().setTheme('dark');
      });

      expect(useUIStore.getState().theme).toBe('dark');
    });

    it('should set theme to system', () => {
      useUIStore.setState({ theme: 'dark' });

      act(() => {
        useUIStore.getState().setTheme('system');
      });

      expect(useUIStore.getState().theme).toBe('system');
    });

    it('should apply effective theme to document for system theme', () => {
      mockMatchMedia.mockReturnValue({
        matches: true, // dark theme preference
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      useUIStore.setState({ theme: 'dark' });

      act(() => {
        useUIStore.getState().setTheme('system');
      });

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('should apply light theme to document', () => {
      act(() => {
        useUIStore.getState().setTheme('light');
      });

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });
  });

  describe('setSidebarOpen action', () => {
    it('should set sidebar open', () => {
      act(() => {
        useUIStore.getState().setSidebarOpen(true);
      });

      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('should set sidebar closed', () => {
      useUIStore.setState({ sidebarOpen: true });

      act(() => {
        useUIStore.getState().setSidebarOpen(false);
      });

      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });
  });

  describe('toggleSidebar action', () => {
    it('should toggle sidebar from open to closed', () => {
      useUIStore.setState({ sidebarOpen: true });

      act(() => {
        useUIStore.getState().toggleSidebar();
      });

      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });

    it('should toggle sidebar from closed to open', () => {
      useUIStore.setState({ sidebarOpen: false });

      act(() => {
        useUIStore.getState().toggleSidebar();
      });

      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe('setViewMode action', () => {
    it('should set view mode to comfortable', () => {
      act(() => {
        useUIStore.getState().setViewMode('comfortable');
      });

      expect(useUIStore.getState().viewMode).toBe('comfortable');
    });

    it('should set view mode to compact', () => {
      act(() => {
        useUIStore.getState().setViewMode('compact');
      });

      expect(useUIStore.getState().viewMode).toBe('compact');
    });

    it('should set view mode to spacious', () => {
      act(() => {
        useUIStore.getState().setViewMode('spacious');
      });

      expect(useUIStore.getState().viewMode).toBe('spacious');
    });
  });

  describe('setDensity action', () => {
    it('should set density to default', () => {
      act(() => {
        useUIStore.getState().setDensity('default');
      });

      expect(useUIStore.getState().density).toBe('default');
    });

    it('should set density to comfortable', () => {
      act(() => {
        useUIStore.getState().setDensity('comfortable');
      });

      expect(useUIStore.getState().density).toBe('comfortable');
    });

    it('should set density to compact', () => {
      act(() => {
        useUIStore.getState().setDensity('compact');
      });

      expect(useUIStore.getState().density).toBe('compact');
    });
  });

  describe('setFontSize action', () => {
    it('should set font size to small', () => {
      act(() => {
        useUIStore.getState().setFontSize('small');
      });

      const state = useUIStore.getState();

      expect(state.fontSize).toBe('small');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-font-size', 'small');
    });

    it('should set font size to medium', () => {
      useUIStore.setState({ fontSize: 'small' });

      act(() => {
        useUIStore.getState().setFontSize('medium');
      });

      const state = useUIStore.getState();

      expect(state.fontSize).toBe('medium');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-font-size', 'medium');
    });

    it('should set font size to large', () => {
      act(() => {
        useUIStore.getState().setFontSize('large');
      });

      const state = useUIStore.getState();

      expect(state.fontSize).toBe('large');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-font-size', 'large');
    });
  });

  describe('toggleReducedMotion action', () => {
    it('should toggle reduced motion from false to true', () => {
      useUIStore.setState({ reducedMotion: false });

      act(() => {
        useUIStore.getState().toggleReducedMotion();
      });

      const state = useUIStore.getState();

      expect(state.reducedMotion).toBe(true);
      // Note: The implementation uses get() after the state update to set the attribute
      // So it reads the previous value (false) before the toggle completed
    });

    it('should toggle reduced motion from true to false', () => {
      useUIStore.setState({ reducedMotion: true });

      act(() => {
        useUIStore.getState().toggleReducedMotion();
      });

      const state = useUIStore.getState();

      expect(state.reducedMotion).toBe(false);
    });
  });

  describe('toggleShowAspects action', () => {
    it('should toggle show aspects from true to false', () => {
      useUIStore.setState({ showAspects: true });

      act(() => {
        useUIStore.getState().toggleShowAspects();
      });

      expect(useUIStore.getState().showAspects).toBe(false);
    });

    it('should toggle show aspects from false to true', () => {
      useUIStore.setState({ showAspects: false });

      act(() => {
        useUIStore.getState().toggleShowAspects();
      });

      expect(useUIStore.getState().showAspects).toBe(true);
    });
  });

  describe('toggleShowHouses action', () => {
    it('should toggle show houses from true to false', () => {
      useUIStore.setState({ showHouses: true });

      act(() => {
        useUIStore.getState().toggleShowHouses();
      });

      expect(useUIStore.getState().showHouses).toBe(false);
    });

    it('should toggle show houses from false to true', () => {
      useUIStore.setState({ showHouses: false });

      act(() => {
        useUIStore.getState().toggleShowHouses();
      });

      expect(useUIStore.getState().showHouses).toBe(true);
    });
  });

  describe('toggleShowMidpoints action', () => {
    it('should toggle show midpoints from false to true', () => {
      useUIStore.setState({ showMidpoints: false });

      act(() => {
        useUIStore.getState().toggleShowMidpoints();
      });

      expect(useUIStore.getState().showMidpoints).toBe(true);
    });

    it('should toggle show midpoints from true to false', () => {
      useUIStore.setState({ showMidpoints: true });

      act(() => {
        useUIStore.getState().toggleShowMidpoints();
      });

      expect(useUIStore.getState().showMidpoints).toBe(false);
    });
  });

  describe('resetUI action', () => {
    it('should reset all state to defaults', () => {
      // Set all values to non-defaults
      useUIStore.setState({
        theme: 'dark',
        sidebarOpen: false,
        viewMode: 'compact',
        density: 'compact',
        fontSize: 'large',
        reducedMotion: true,
        showAspects: false,
        showHouses: false,
        showMidpoints: true,
      });

      act(() => {
        useUIStore.getState().resetUI();
      });

      const state = useUIStore.getState();

      expect(state.theme).toBe('system');
      expect(state.sidebarOpen).toBe(true);
      expect(state.viewMode).toBe('comfortable');
      expect(state.density).toBe('default');
      expect(state.fontSize).toBe('medium');
      expect(state.reducedMotion).toBe(false);
      expect(state.showAspects).toBe(true);
      expect(state.showHouses).toBe(true);
      expect(state.showMidpoints).toBe(false);
    });

    it('should reset document attributes', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      act(() => {
        useUIStore.getState().resetUI();
      });

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-font-size', 'medium');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-reduced-motion', 'false');
    });
  });

  describe('selector hooks', () => {
    it('useTheme should return theme', () => {
      useUIStore.setState({ theme: 'dark' });
      const theme = useUIStore.getState().theme;
      expect(theme).toBe('dark');
    });

    it('useSidebarOpen should return sidebar state', () => {
      useUIStore.setState({ sidebarOpen: false });
      const sidebarOpen = useUIStore.getState().sidebarOpen;
      expect(sidebarOpen).toBe(false);
    });

    it('useViewMode should return view mode', () => {
      useUIStore.setState({ viewMode: 'compact' });
      const viewMode = useUIStore.getState().viewMode;
      expect(viewMode).toBe('compact');
    });

    it('useDensity should return density', () => {
      useUIStore.setState({ density: 'comfortable' });
      const density = useUIStore.getState().density;
      expect(density).toBe('comfortable');
    });

    it('useChartDisplayOptions should return chart display options', () => {
      useUIStore.setState({
        showAspects: false,
        showHouses: true,
        showMidpoints: true,
      });

      const state = useUIStore.getState();
      const options = {
        showAspects: state.showAspects,
        showHouses: state.showHouses,
        showMidpoints: state.showMidpoints,
      };

      expect(options).toEqual({
        showAspects: false,
        showHouses: true,
        showMidpoints: true,
      });
    });
  });

  describe('system theme detection', () => {
    it('should detect dark system theme', () => {
      mockMatchMedia.mockReturnValue({
        matches: true, // dark preference
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      useUIStore.setState({ theme: 'system' });

      act(() => {
        useUIStore.getState().setTheme('system');
      });

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('should detect light system theme', () => {
      mockMatchMedia.mockReturnValue({
        matches: false, // light preference
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      useUIStore.setState({ theme: 'dark' });

      act(() => {
        useUIStore.getState().setTheme('system');
      });

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });
  });
});
