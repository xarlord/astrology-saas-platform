/**
 * Synastry Store
 *
 * Manages compatibility comparisons and synastry calculations
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  compareCharts,
  getCompatibility,
  generateCompatibilityReport,
} from '../services/synastry.api';
import type { CompatibilityScores, SynastryAspect } from '../services/synastry.api';
import type { Chart } from '../services/api.types';

interface SynastryState {
  // State
  person1: Chart | null;
  person2: Chart | null;
  score: number; // 0-100
  breakdown: CompatibilityScores | null;
  aspects: SynastryAspect[] | null;
  comparison: {
    chart1_id: string;
    chart2_id: string;
    overall_compatibility: number;
    breakdown: CompatibilityScores;
    aspects: SynastryAspect[];
    theme_analysis: Record<string, string | undefined>;
  } | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPersons: (person1: Chart | null, person2: Chart | null) => void;
  compare: (chart1Id: string, chart2Id: string) => Promise<void>;
  getCompatibility: (chart1Id: string, chart2Id: string) => Promise<void>;
  generateFullReport: (chart1Id: string, chart2Id: string) => Promise<void>;
  clear: () => void;
  clearError: () => void;
}

export const useSynastryStore = create<SynastryState>()(
  devtools((set) => ({
    // Initial state
    person1: null,
    person2: null,
    score: 0,
    breakdown: null,
    aspects: null,
    comparison: null,
    isLoading: false,
    error: null,

    // Set persons
    setPersons: (person1: Chart | null, person2: Chart | null) => {
      set({ person1, person2 });
    },

    // Compare charts
    compare: async (chart1Id: string, chart2Id: string) => {
      set({ isLoading: true, error: null });
      try {
        const result = await compareCharts(chart1Id, chart2Id);

        set({
          comparison: {
            chart1_id: chart1Id,
            chart2_id: chart2Id,
            overall_compatibility: result.overallCompatibility,
            breakdown: {
              romantic: 0,
              communication: 0,
              values: 0,
              emotional: 0,
              intellectual: 0,
              spiritual: 0,
              overall: result.overallCompatibility,
            },
            aspects: result.synastryAspects,
            theme_analysis: {
              romantic: result.relationshipTheme,
            },
          },
          aspects: result.synastryAspects,
          score: result.overallCompatibility,
          isLoading: false,
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to compare charts';
        set({
          error: errorMessage,
          isLoading: false,
        });
        throw error;
      }
    },

    // Get compatibility scores
    getCompatibility: async (chart1Id: string, chart2Id: string) => {
      set({ isLoading: true, error: null });
      try {
        const result = await getCompatibility(chart1Id, chart2Id, true);

        set({
          score: result.scores.overall,
          breakdown: result.scores,
          isLoading: false,
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to calculate compatibility';
        set({
          error: errorMessage,
          isLoading: false,
        });
        throw error;
      }
    },

    // Generate full compatibility report
    generateFullReport: async (chart1Id: string, chart2Id: string) => {
      set({ isLoading: true, error: null });
      try {
        const result = await generateCompatibilityReport(chart1Id, chart2Id);

        set({
          comparison: {
            chart1_id: chart1Id,
            chart2_id: chart2Id,
            overall_compatibility: result.scores.overall,
            breakdown: result.scores,
            aspects: [],
            theme_analysis: {},
          },
          score: result.scores.overall,
          breakdown: result.scores,
          isLoading: false,
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
        set({
          error: errorMessage,
          isLoading: false,
        });
        throw error;
      }
    },

    // Clear state
    clear: () => {
      set({
        person1: null,
        person2: null,
        score: 0,
        breakdown: null,
        aspects: null,
        comparison: null,
        error: null,
      });
    },

    // Clear error
    clearError: () => set({ error: null }),
  })),
);

// Selector hooks for optimized re-renders
export const useSynastryPersons = () =>
  useSynastryStore((state) => ({
    person1: state.person1,
    person2: state.person2,
  }));
export const useSynastryScore = () => useSynastryStore((state) => state.score);
export const useSynastryBreakdown = () => useSynastryStore((state) => state.breakdown);
export const useSynastryComparison = () => useSynastryStore((state) => state.comparison);
export const useSynastryLoading = () => useSynastryStore((state) => state.isLoading);

export default useSynastryStore;
