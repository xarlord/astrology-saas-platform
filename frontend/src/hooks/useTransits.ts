/**
 * useTransits Hook
 *
 * Custom hook for transit calculations
 * Wraps the transit store for easier use in components
 */

import { useCallback } from 'react';
import { useTransitStore } from '../stores';
import type { Transit } from '../services/api.types';

export const useTransits = () => {
  const {
    dateRange,
    transits,
    transitChart,
    energyLevel,
    isLoading,
    error,
    setDateRange,
    loadTransits,
    loadTodayTransits,
    loadTransitCalendar,
    loadTransitForecast,
    clearTransits,
    clearError,
  } = useTransitStore();

  // Load transits for date range
  const handleLoadTransits = useCallback(
    async (chartId: string, startDate: string, endDate: string) => {
      try {
        await loadTransits(chartId, startDate, endDate);
        setDateRange(startDate, endDate);
        return true;
      } catch (error: unknown) {
        return false;
      }
    },
    [loadTransits, setDateRange],
  );

  // Load today's transits
  const handleLoadTodayTransits = useCallback(async () => {
    try {
      await loadTodayTransits();
      return true;
    } catch (error: unknown) {
      return false;
    }
  }, [loadTodayTransits]);

  // Load transit calendar
  const handleLoadTransitCalendar = useCallback(
    async (month: number, year: number) => {
      try {
        await loadTransitCalendar(month, year);
        return true;
      } catch (error: unknown) {
        return false;
      }
    },
    [loadTransitCalendar],
  );

  // Load transit forecast
  const handleLoadTransitForecast = useCallback(
    async (duration: 'week' | 'month' | 'quarter' | 'year') => {
      try {
        await loadTransitForecast(duration);
        return true;
      } catch (error: unknown) {
        return false;
      }
    },
    [loadTransitForecast],
  );

  // Get major transits
  const getMajorTransits = useCallback((): Transit[] => {
    return transits.filter((t) => t.type === 'major');
  }, [transits]);

  // Get minor transits
  const getMinorTransits = useCallback((): Transit[] => {
    return transits.filter((t) => t.type === 'minor');
  }, [transits]);

  // Get transits by planet
  const getTransitsByPlanet = useCallback(
    (planet: string): Transit[] => {
      return transits.filter((t) => t.planet === planet);
    },
    [transits],
  );

  // Get active transits for date
  const getActiveTransitsForDate = useCallback(
    (date: Date): Transit[] => {
      return transits.filter((t) => {
        const start = new Date(t.start_date);
        const end = new Date(t.end_date);
        return date >= start && date <= end;
      });
    },
    [transits],
  );

  // Get energy level label
  const getEnergyLabel = useCallback((): string => {
    if (energyLevel >= 80) return 'High';
    if (energyLevel >= 60) return 'Moderate to High';
    if (energyLevel >= 40) return 'Moderate';
    if (energyLevel >= 20) return 'Low to Moderate';
    return 'Low';
  }, [energyLevel]);

  // Get energy level color
  const getEnergyColor = useCallback((): string => {
    if (energyLevel >= 80) return 'green';
    if (energyLevel >= 60) return 'blue';
    if (energyLevel >= 40) return 'yellow';
    if (energyLevel >= 20) return 'orange';
    return 'red';
  }, [energyLevel]);

  return {
    // State
    dateRange,
    transits,
    transitChart,
    energyLevel,
    isLoading,
    error,

    // Methods
    setDateRange,
    loadTransits: handleLoadTransits,
    loadTodayTransits: handleLoadTodayTransits,
    loadTransitCalendar: handleLoadTransitCalendar,
    loadTransitForecast: handleLoadTransitForecast,
    clearTransits,
    clearError,

    // Computed
    getMajorTransits,
    getMinorTransits,
    getTransitsByPlanet,
    getActiveTransitsForDate,
    getEnergyLabel,
    getEnergyColor,
  };
};

export default useTransits;
