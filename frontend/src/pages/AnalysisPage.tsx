/* eslint-disable */
/**
 * Analysis Page Component
 * Displays chart personality analysis with AI-enhanced interpretations
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AIInterpretationToggle, AIInterpretationDisplay, SkeletonLoader, EmptyState, AppLayout } from '../components';
import { PersonalityAnalysis } from '../components';
import type { PersonalityAnalysisData, PlanetSignInterpretation, HouseInterpretation, AspectInterpretation as AspectInterp } from '../components/PersonalityAnalysis';
import { useChartAnalysis } from '../hooks';
import { getErrorMessage } from '../utils/errorHandling';

/**
 * Map backend interpretation to frontend component shape.
 * The backend returns full PlanetInSignInterpretation objects (keywords,
 * strengths, challenges, advice) from the 132KB interpretations database.
 * We use them directly — no more empty stubs.
 */
function toPlanetSignInterpretation(
  planet: string,
  signInfo: { sign: string; degree?: number },
  interpretation?: {
    keywords?: string[];
    general?: string;
    strengths?: string[];
    challenges?: string[];
    advice?: string[];
  } | null,
): PlanetSignInterpretation {
  // If the backend returned a full interpretation, use it
  if (interpretation && (interpretation.general || interpretation.strengths?.length)) {
    return {
      planet,
      sign: signInfo.sign,
      keywords: interpretation.keywords ?? [],
      general: interpretation.general ?? `${planet} in ${signInfo.sign}`,
      strengths: interpretation.strengths ?? [],
      challenges: interpretation.challenges ?? [],
      advice: interpretation.advice ?? [],
    };
  }

  // Fallback: minimal info (shouldn't happen if backend data is correct)
  return {
    planet,
    sign: signInfo.sign,
    keywords: [],
    general: `${planet} in ${signInfo.sign}${signInfo.degree ? ` (${signInfo.degree.toFixed(1)}°)` : ''}`,
    strengths: [],
    challenges: [],
    advice: [],
  };
}

export function AnalysisPage() {
  const { chartId } = useParams<{ chartId: string }>();
  const navigate = useNavigate();
  const [aiInterpretation, setAIInterpretation] = useState<Record<string, unknown> | null>(null);

  const {
    data: analysisResult,
    isLoading,
    error,
  } = useChartAnalysis(chartId ?? '');

  const analysis = analysisResult?.analysis ?? null;

  const handleAIInterpretation = (interpretation: Record<string, unknown>) => {
    setAIInterpretation(interpretation);
  };

  /**
   * Transform the raw API PersonalityAnalysis into the shape expected
   * by the PersonalityAnalysis display component (PersonalityAnalysisData).
   *
   * KEY FIX: Use the backend's interpretation objects (which contain
   * keywords, strengths, challenges, advice) instead of empty stubs.
   */
  const buildComponentData = (): PersonalityAnalysisData | null => {
    if (!analysis) return null;

    const overview = analysis.overview;

    // Overview: Sun, Moon, Ascendant — use interpretation objects directly
    const sunSign = toPlanetSignInterpretation(
      'sun',
      { sign: overview.sunSign?.sign ?? 'Unknown', degree: 0 },
      overview.sunSign,
    );
    const moonSign = toPlanetSignInterpretation(
      'moon',
      { sign: overview.moonSign?.sign ?? 'Unknown', degree: 0 },
      overview.moonSign,
    );
    const ascendantSign = overview.ascendantSign
      ? toPlanetSignInterpretation('ascendant', { sign: overview.ascendantSign.sign }, overview.ascendantSign)
      : undefined;

    // Planets in Signs: use the interpretation field from each entry
    const planetsInSigns: PlanetSignInterpretation[] = (analysis.planetsInSigns ?? []).map(
      (p: { planet: string; sign: string; house?: number; interpretation?: any }) =>
        toPlanetSignInterpretation(p.planet, { sign: p.sign }, p.interpretation),
    );

    // Houses: map backend house analysis to frontend shape
    const houses: HouseInterpretation[] = (analysis.houses ?? []).map((h: any) => ({
      house: h.house,
      signOnCusp: h.signOnCusp ?? h.sign ?? '',
      planetsInHouse: h.planetsInHouse ?? [],
      themes: h.themes ?? [],
      interpretation: h.interpretation ?? '',
      advice: h.advice ?? [],
    }));

    // Aspects: use the backend's aspect interpretation data
    const aspects: AspectInterp[] = (analysis.aspects ?? []).map((a: any) => ({
      planet1: a.planet1,
      planet2: a.planet2,
      aspect: a.aspect,
      orb: a.orb,
      harmonious: a.harmonious ?? false,
      keywords: a.keywords ?? [],
      interpretation: a.interpretation ?? `${a.planet1} ${a.aspect} ${a.planet2}`,
      expression: a.expression ?? '',
      advice: a.advice ?? [],
    }));

    // Aspect patterns (Grand Trine, T-Square, etc.)
    const patterns = (analysis.patterns ?? []).length > 0
      ? analysis.patterns.map((p: any) => ({
          type: p.type,
          description: p.description,
          planets: p.planets,
        }))
      : undefined;

    return {
      overview: { sunSign, moonSign, ascendantSign },
      planetsInSigns,
      houses,
      aspects,
      patterns,
    };
  };

  const componentData = analysis ? buildComponentData() : null;

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Personality Analysis</h1>
      </div>

      {isLoading ? (
        <SkeletonLoader variant="text" count={5} />
      ) : error ? (
        <EmptyState
          icon="📊"
          title="Failed to load analysis"
          description={getErrorMessage(error, 'Unable to load personality analysis. Please try again.')}
          actionText="Retry"
          onAction={() => navigate(0)}
          secondaryActionText="Back to Dashboard"
          onSecondaryAction={() => navigate('/dashboard')}
        />
      ) : !componentData ? (
        <EmptyState
          icon="📊"
          title="No chart data available"
          description="Unable to load personality analysis. Please create a chart first."
          actionText="Create Chart"
          onAction={() => navigate('/charts/new')}
          secondaryActionText="Back to Dashboard"
          onSecondaryAction={() => navigate('/dashboard')}
        />
      ) : (
        <>
          {/* AI Toggle Section */}
          <div className="mb-6">
            <AIInterpretationToggle
              chartData={analysis as unknown as Record<string, unknown>}
              onInterpretationGenerated={handleAIInterpretation}
            />
          </div>

          {/* AI Interpretation Display */}
          {aiInterpretation && (
            <div className="mb-6">
              <AIInterpretationDisplay interpretation={aiInterpretation as { ai: boolean; enhanced?: string | Record<string, unknown>; generatedAt?: string; model?: string }} />
            </div>
          )}

          {/* Traditional Analysis */}
          <div className="bg-cosmic-card-solid border border-white/15 rounded-2xl p-6">
            <PersonalityAnalysis data={componentData} />
          </div>
        </>
      )}
    </AppLayout>
  );
}
