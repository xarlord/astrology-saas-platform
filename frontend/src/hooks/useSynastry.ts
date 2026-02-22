/**
 * useSynastry Hook
 *
 * Custom hook for compatibility features
 * Wraps the synastry store for easier use in components
 */

import { useCallback } from 'react';
import { useSynastryStore } from '../stores';
import type { Chart } from '../services/api.types';

export const useSynastry = () => {
  const {
    person1,
    person2,
    score,
    breakdown,
    comparison,
    aspects,
    isLoading,
    error,
    setPersons,
    compare,
    getCompatibility,
    generateFullReport,
    clear,
    clearError,
  } = useSynastryStore();

  // Set persons wrapper
  const handleSetPersons = useCallback((p1: Chart | null, p2: Chart | null) => {
    setPersons(p1, p2);
  }, [setPersons]);

  // Compare charts wrapper
  const handleCompare = useCallback(
    async (chart1Id: string, chart2Id: string): Promise<boolean> => {
      try {
        await compare(chart1Id, chart2Id);
        return true;
      } catch (error: unknown) {
        return false;
      }
    },
    [compare]
  );

  // Get compatibility wrapper
  const handleGetCompatibility = useCallback(
    async (chart1Id: string, chart2Id: string): Promise<boolean> => {
      try {
        await getCompatibility(chart1Id, chart2Id);
        return true;
      } catch (error: unknown) {
        return false;
      }
    },
    [getCompatibility]
  );

  // Generate full report wrapper
  const handleGenerateFullReport = useCallback(
    async (chart1Id: string, chart2Id: string): Promise<boolean> => {
      try {
        await generateFullReport(chart1Id, chart2Id);
        return true;
      } catch (error: unknown) {
        return false;
      }
    },
    [generateFullReport]
  );

  // Get score label
  const getScoreLabel = useCallback((): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Challenging';
    return 'Difficult';
  }, [score]);

  // Get score color
  const getScoreColor = useCallback((): string => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'yellow';
    if (score >= 20) return 'orange';
    return 'red';
  }, [score]);

  // Get compatibility level
  const getCompatibilityLevel = useCallback((): 'high' | 'medium' | 'low' => {
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }, [score]);

  // Get highest compatibility area
  const getHighestArea = useCallback((): string | null => {
    if (!breakdown) return null;

    const areas = [
      { name: 'Romance', value: breakdown.romantic },
      { name: 'Communication', value: breakdown.communication },
      { name: 'Values', value: breakdown.values },
      { name: 'Emotional', value: breakdown.emotional },
      { name: 'Intellectual', value: breakdown.intellectual },
    ];

    const highest = areas.reduce((prev, current) =>
      prev.value > current.value ? prev : current
    );

    return highest.name;
  }, [breakdown]);

  // Get lowest compatibility area
  const getLowestArea = useCallback((): string | null => {
    if (!breakdown) return null;

    const areas = [
      { name: 'Romance', value: breakdown.romantic },
      { name: 'Communication', value: breakdown.communication },
      { name: 'Values', value: breakdown.values },
      { name: 'Emotional', value: breakdown.emotional },
      { name: 'Intellectual', value: breakdown.intellectual },
    ];

    const lowest = areas.reduce((prev, current) =>
      prev.value < current.value ? prev : current
    );

    return lowest.name;
  }, [breakdown]);

  // Check if both persons selected
  const isReady = useCallback((): boolean => {
    return !!(person1 && person2);
  }, [person1, person2]);

  return {
    // State
    person1,
    person2,
    score,
    breakdown,
    comparison,
    aspects,
    isLoading,
    error,

    // Methods
    setPersons: handleSetPersons,
    compare: handleCompare,
    getCompatibility: handleGetCompatibility,
    generateFullReport: handleGenerateFullReport,
    clear,
    clearError,

    // Computed
    getScoreLabel,
    getScoreColor,
    getCompatibilityLevel,
    getHighestArea,
    getLowestArea,
    isReady,
  };
};

export default useSynastry;
