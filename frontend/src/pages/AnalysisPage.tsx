/**
 * Analysis Page Component
 * Displays chart personality analysis with AI-enhanced interpretations
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AIInterpretationToggle,
  AIInterpretationDisplay,
  SkeletonLoader,
  EmptyState,
  AppLayout,
} from '../components';
import { PersonalityAnalysis } from '../components';
import { analysisService } from '../services/analysis.service';
import type { PersonalityAnalysisResponse } from '../services/analysis.service';
import type { PersonalityAnalysisData } from '../components/PersonalityAnalysis';

/** Fallback interpretation for missing sign data */
function fallbackInterpretation(planet: string, sign: string) {
  return {
    planet,
    sign,
    keywords: [],
    general: `${planet} in ${sign}`,
    strengths: [],
    challenges: [],
    advice: [],
  };
}

/** Map API response to PersonalityAnalysisData shape expected by component */
function mapAnalysisToComponentData(
  analysis: PersonalityAnalysisResponse,
): PersonalityAnalysisData {
  return {
    overview: {
      sunSign: analysis.overview.sunSign ?? fallbackInterpretation('sun', 'unknown'),
      moonSign: analysis.overview.moonSign ?? fallbackInterpretation('moon', 'unknown'),
      ...(analysis.overview.ascendantSign && { ascendantSign: analysis.overview.ascendantSign }),
    },
    planetsInSigns: analysis.planetsInSigns.map((p) => p.interpretation),
    houses: analysis.houses.map((h) => ({
      house: h.house,
      signOnCusp: h.signOnCusp,
      planetsInHouse: h.planetsInHouse,
      themes: h.themes,
      interpretation: h.interpretation,
      advice: h.advice,
    })),
    aspects: analysis.aspects.map((a) => ({
      planet1: a.planet1,
      planet2: a.planet2,
      aspect: a.aspect,
      orb: a.orb,
      harmonious: a.harmonious ?? false,
      keywords: a.keywords,
      interpretation: a.interpretation,
      expression: a.expression,
      advice: a.advice,
    })),
    patterns: analysis.patterns?.map((p) => ({
      type: p.type,
      description: p.description,
      planets: p.planets,
    })),
  };
}

export default function AnalysisPage() {
  const { chartId } = useParams<{ chartId: string }>();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<PersonalityAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiInterpretation, setAIInterpretation] = useState<{
    interpretation: string;
    ai: boolean;
    source: string;
  } | null>(null);

  useEffect(() => {
    if (!chartId) return;

    let cancelled = false;

    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        const { analysis } = await analysisService.getPersonalityAnalysis(chartId);

        if (!cancelled) {
          setAnalysisData(mapAnalysisToComponentData(analysis));
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load personality analysis';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchAnalysis();
    return () => {
      cancelled = true;
    };
  }, [chartId]);

  const handleAIInterpretation = (interpretation: {
    interpretation: string;
    ai: boolean;
    source: string;
  }) => {
    setAIInterpretation(interpretation);
  };

  if (loading) {
    return (
      <AppLayout>
        <h2 className="text-3xl font-bold mb-6">Personality Analysis</h2>
        <SkeletonLoader variant="text" count={5} />
      </AppLayout>
    );
  }

  if (error || !analysisData) {
    return (
      <AppLayout>
        <h2 className="text-3xl font-bold mb-6">Personality Analysis</h2>
        <EmptyState
          icon="📊"
          title={error ? 'Failed to load analysis' : 'No chart data available'}
          description={error ?? 'Unable to load personality analysis. Please create a chart first.'}
          actionText="Create Chart"
          onAction={() => navigate('/charts/new')}
          secondaryActionText="Back to Dashboard"
          onSecondaryAction={() => navigate('/dashboard')}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <h2 className="text-3xl font-bold mb-6">Personality Analysis</h2>

      {/* AI Toggle Section */}
      <div className="mb-6">
        <AIInterpretationToggle
          chartData={{ chartId: chartId!, birthData: analysisData }}
          onInterpretationGenerated={handleAIInterpretation}
        />
      </div>

      {/* AI Interpretation Display */}
      {aiInterpretation && (
        <div className="mb-6">
          <AIInterpretationDisplay interpretation={aiInterpretation} />
        </div>
      )}

      {/* Traditional Analysis */}
      <div className="card">
        <PersonalityAnalysis data={analysisData} />
      </div>
    </AppLayout>
  );
}
