/**
 * Calendar Store
 *
 * Manages calendar state, events, and view preferences
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { calendarService } from '../services';
import type { CalendarEvent, LunarPhase } from '../services/api.types';

type ViewMode = 'month' | 'week' | 'day' | 'list';

interface CalendarState {
  // State
  viewMode: ViewMode;
  selectedDate: Date;
  events: CalendarEvent[];
  lunarPhases: LunarPhase[];
  isLoading: boolean;
  error: string | null;
  filters: {
    eventTypes: string[];
    showGlobal: boolean;
    showPersonal: boolean;
  };

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setSelectedDate: (date: Date) => void;
  loadEvents: (year: number, month: number) => Promise<void>;
  loadLunarPhases: (year: number, month: number) => Promise<void>;
  createEvent: (event: Partial<CalendarEvent>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  setFilters: (filters: Partial<CalendarState['filters']>) => void;
  clearError: () => void;
}

export const useCalendarStore = create<CalendarState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        viewMode: 'month',
        selectedDate: new Date(),
        events: [],
        lunarPhases: [],
        isLoading: false,
        error: null,
        filters: {
          eventTypes: [],
          showGlobal: true,
          showPersonal: true,
        },

        // Set view mode
        setViewMode: (mode: ViewMode) => {
          set({ viewMode: mode });
        },

        // Set selected date
        setSelectedDate: (date: Date) => {
          set({ selectedDate: date });
        },

        // Load events for month
        loadEvents: async (year: number, month: number) => {
          set({ isLoading: true, error: null });
          try {
            const response = await calendarService.getMonthEvents(
              year,
              month,
              get().filters.showGlobal
            );

            // Filter events based on filters
            const filteredEvents = response.data.filter((event) => {
              if (get().filters.eventTypes.length === 0) return true;
              return event.type && get().filters.eventTypes.includes(event.type);
            });

            set({
              events: filteredEvents,
              isLoading: false,
            });
          } catch (error: unknown) {
            set({
              error: error instanceof Error ? error.message : 'Failed to load events',
              isLoading: false,
            });
          }
        },

        // Load lunar phases for month
        loadLunarPhases: async (year: number, month: number) => {
          set({ isLoading: true, error: null });
          try {
            const response = await calendarService.getMonthEvents(year, month, true);

            // Filter for lunar phase events
            const lunarPhases: LunarPhase[] = response.data
              .filter((event) => event.event_type === 'lunar-phase')
              .map((event) => ({
                date: event.event_date ? new Date(event.event_date).toISOString() : new Date().toISOString(),
                phase: (event.event_data as { phase?: string })?.phase ?? 'unknown',
                illumination: (event.event_data as { illumination?: number })?.illumination ?? 0,
                sign: (event.event_data as { sign?: string })?.sign ?? '',
                degree: (event.event_data as { degree?: number })?.degree ?? 0,
                influence: event.interpretation ?? '',
              }));

            set({
              lunarPhases,
              isLoading: false,
            });
          } catch (error: unknown) {
            set({
              error: error instanceof Error ? error.message : 'Failed to load lunar phases',
              isLoading: false,
            });
          }
        },

        // Create event
        createEvent: async (event: Partial<CalendarEvent>) => {
          set({ isLoading: true, error: null });
          try {
            const response = await calendarService.createCustomEvent({
              event_type: event.type ?? 'custom',
              event_date: event.startDate ? new Date(event.startDate) : new Date(),
              end_date: event.endDate ? new Date(event.endDate) : undefined,
              event_data: event.metadata,
              interpretation: event.description,
            });

            set((state) => ({
              events: [...state.events, response.data],
              isLoading: false,
            }));
          } catch (error: unknown) {
            set({
              error: error instanceof Error ? error.message : 'Failed to create event',
              isLoading: false,
            });
            throw error;
          }
        },

        // Update event
        updateEvent: async (id: string, updates: Partial<CalendarEvent>) => {
          set({ isLoading: true, error: null });
          try {
            const response = await calendarService.updateEvent(id, updates);

            set((state) => ({
              events: state.events.map((e) => (e.id === id ? response.data : e)),
              isLoading: false,
            }));
          } catch (error: unknown) {
            set({
              error: error instanceof Error ? error.message : 'Failed to update event',
              isLoading: false,
            });
            throw error;
          }
        },

        // Delete event
        deleteEvent: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            await calendarService.deleteEvent(id);

            set((state) => ({
              events: state.events.filter((e) => e.id !== id),
              isLoading: false,
            }));
          } catch (error: unknown) {
            set({
              error: error instanceof Error ? error.message : 'Failed to delete event',
              isLoading: false,
            });
            throw error;
          }
        },

        // Set filters
        setFilters: (filters: Partial<CalendarState['filters']>) => {
          set((state) => ({
            filters: { ...state.filters, ...filters },
          }));
        },

        // Clear error
        clearError: () => set({ error: null }),
      }),
      {
        name: 'calendar-storage',
        partialize: (state) => ({
          viewMode: state.viewMode,
          filters: state.filters,
        }),
      }
    ),
    { name: 'CalendarStore' }
  )
);

// Selector hooks for optimized re-renders
export const useCalendarViewMode = () => useCalendarStore((state) => state.viewMode);
export const useCalendarSelectedDate = () => useCalendarStore((state) => state.selectedDate);
export const useCalendarEvents = () => useCalendarStore((state) => state.events);
export const useLunarPhases = () => useCalendarStore((state) => state.lunarPhases);
export const useCalendarLoading = () => useCalendarStore((state) => state.isLoading);

export default useCalendarStore;
