/**
 * useTransits Hook
 *
 * Custom hook for transit calculations
 * Wraps the transit store for easier use in components
 */

import { useCallback } from 'react';
import { useTransitStore } from '../stores';
import type { NormalizedTransit } from '../services/transit.service';

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
      } catch {
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
    } catch {
      return false;
    }
  }, [loadTodayTransits]);

  // Load transit calendar
  const handleLoadTransitCalendar = useCallback(
    async (month: number, year: number) => {
      try {
        await loadTransitCalendar(month, year);
        return true;
      } catch {
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
      } catch {
        return false;
      }
    },
    [loadTransitForecast],
  );

  // Get major transits (tight orb = major)
  const getMajorTransits = useCallback((): NormalizedTransit[] => {
    return transits.filter((t) => Math.abs(t.orb) <= 2);
  }, [transits]);

  // Get minor transits (wider orb)
  const getMinorTransits = useCallback((): NormalizedTransit[] => {
    return transits.filter((t) => Math.abs(t.orb) > 2);
  }, [transits]);

  // Get transits by planet
  const getTransitsByPlanet = useCallback(
    (planet: string): NormalizedTransit[] => {
      return transits.filter((t) => t.transitPlanet === planet || t.natalPlanet === planet);
    },
    [transits],
  );

  // Get all transits (no date filtering available on NormalizedTransit)
  const getActiveTransitsForDate = useCallback(
    (_date: Date): NormalizedTransit[] => {
      return transits;
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
