/**
 * Analysis Page Component
 * Displays chart personality analysis with AI-enhanced interpretations
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AIInterpretationToggle, AIInterpretationDisplay, SkeletonLoader, EmptyState, AppLayout } from '../components';
import { PersonalityAnalysis } from '../components';
import type { PersonalityAnalysisData } from '../components/PersonalityAnalysis';
import { useChartAnalysis } from '../hooks';
import { getErrorMessage } from '../utils/errorHandling';

/**
 * Build a PlanetSignInterpretation from minimal API data (sign name only).
 * The API returns SignInfo { sign, degree } which lacks interpretation text,
 * so we provide empty defaults that the component can render gracefully.
 */
function toPlanetSignInterpretation(planet: string, signInfo: { sign: string; degree: number }) {
  return {
    planet,
    sign: signInfo.sign,
    keywords: [],
    general: `${planet} in ${signInfo.sign} (${signInfo.degree.toFixed(1)} degrees)`,
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
   */
  const buildComponentData = (): PersonalityAnalysisData | null => {
    if (!analysis) return null;

    return {
      overview: {
        sunSign: toPlanetSignInterpretation('sun', analysis.overview.sunSign),
        moonSign: toPlanetSignInterpretation('moon', analysis.overview.moonSign),
        ascendantSign: toPlanetSignInterpretation('ascendant', analysis.overview.ascendant),
      },
      planetsInSigns: (analysis.planetsInSigns ?? []).map((p) => toPlanetSignInterpretation(p.planet, p)),
      houses: [],
      aspects: (analysis.majorAspects ?? []).map((a) => ({
        planet1: a.planet1,
        planet2: a.planet2,
        aspect: a.aspect,
        orb: a.orb,
        harmonious: false,
        keywords: [],
        interpretation: `${a.planet1} ${a.aspect} ${a.planet2}`,
        expression: '',
        advice: [],
      })),
      patterns: analysis.chartPattern
        ? [{ type: analysis.chartPattern.name, description: analysis.chartPattern.description, planets: [] }]
        : undefined,
    };
  };

  const componentData = analysis ? buildComponentData() : null;

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Personality Analysis</h2>
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
          <div className="card">
            <PersonalityAnalysis data={componentData} />
          </div>
        </>
      )}
    </AppLayout>
  );
}
