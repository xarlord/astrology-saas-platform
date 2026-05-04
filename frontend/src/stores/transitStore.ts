/**
 * Transit Store
 *
 * Manages transit calculations and forecasts
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { transitService } from '../services';
import type { TransitReading, NormalizedTransit } from '../services/transit.service';

interface TransitState {
  // State
  dateRange: {
    start: string;
    end: string;
  } | null;
  transits: NormalizedTransit[];
  transitChart: TransitReading | null;
  energyLevel: number; // 0-100
  isLoading: boolean;
  error: string | null;

  // Actions
  setDateRange: (start: string, end: string) => void;
  loadTransits: (chartId: string, startDate: string, endDate: string) => Promise<void>;
  loadTodayTransits: () => Promise<void>;
  loadTransitCalendar: (month: number, year: number) => Promise<void>;
  loadTransitForecast: (duration: 'week' | 'month' | 'quarter' | 'year') => Promise<void>;
  clearTransits: () => void;
  clearError: () => void;
}

export const useTransitStore = create<TransitState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        dateRange: null,
        transits: [],
        transitChart: null,
        energyLevel: 50,
        isLoading: false,
        error: null,

        // Set date range
        setDateRange: (start: string, end: string) => {
          set({ dateRange: { start, end } });
        },

        // Load transits for date range
        loadTransits: async (chartId: string, startDate: string, endDate: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await transitService.calculateTransits(chartId, startDate, endDate);

            set({
              transits: response.transits ?? [],
              dateRange: { start: startDate, end: endDate },
              energyLevel: 50,
              transitChart: response,
              isLoading: false,
            });
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to load transits';
            set({
              error: message,
              isLoading: false,
            });
            throw error;
          }
        },

        // Load today's transits
        loadTodayTransits: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await transitService.getTodayTransits();

            set({
              transits: response.transits ?? [],
              energyLevel: 50,
              isLoading: false,
            });
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : "Failed to load today's transits";
            set({
              error: message,
              isLoading: false,
            });
            throw error;
          }
        },

        // Load transit calendar
        loadTransitCalendar: async (month: number, year: number) => {
          set({ isLoading: true, error: null });
          try {
            const response = await transitService.getTransitCalendar(month, year);

            // response is TransitReading[] — collect transits from all days
            const allTransits = response.flatMap((reading) => reading.transits ?? []);

            set({
              transits: allTransits,
              isLoading: false,
            });
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : 'Failed to load transit calendar';
            set({
              error: message,
              isLoading: false,
            });
            throw error;
          }
        },

        // Load transit forecast
        loadTransitForecast: async (duration: 'week' | 'month' | 'quarter' | 'year') => {
          set({ isLoading: true, error: null });
          try {
            const response = await transitService.getTransitForecast(duration);

            // response is TransitReading[] — collect transits from all forecast entries
            const allTransits = response.flatMap((reading) => reading.transits ?? []);

            set({
              transits: allTransits,
              energyLevel: 50,
              isLoading: false,
            });
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : 'Failed to load transit forecast';
            set({
              error: message,
              isLoading: false,
            });
            throw error;
          }
        },

        // Clear transits
        clearTransits: () => {
          set({
            transits: [],
            transitChart: null,
            dateRange: null,
            energyLevel: 50,
          });
        },

        // Clear error
        clearError: () => set({ error: null }),
      }),
      {
        name: 'transit-storage',
        partialize: (state) => ({
          dateRange: state.dateRange,
        }),
      },
    ),
    { name: 'TransitStore' },
  ),
);

// Selector hooks for optimized re-renders
export const useTransits = () => useTransitStore((state) => state.transits);
export const useTransitChart = () => useTransitStore((state) => state.transitChart);
export const useEnergyLevel = () => useTransitStore((state) => state.energyLevel);
export const useTransitLoading = () => useTransitStore((state) => state.isLoading);

export default useTransitStore;
