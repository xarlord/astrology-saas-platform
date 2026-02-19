/**
 * Analysis Page Component
 * Displays chart personality analysis with AI-enhanced interpretations
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AIInterpretationToggle, AIInterpretationDisplay, SkeletonLoader, EmptyState } from '../components';
import { PersonalityAnalysis } from '../components';

interface ChartData {
  id: string;
  planets: {
    planet: string;
    sign: string;
    degree: number;
    house: number;
  }[];
  houses: {
    house: number;
    sign: string;
    degree: number;
  }[];
  aspects: {
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
  }[];
}

export default function AnalysisPage() {
  const { chartId } = useParams<{ chartId: string }>();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInterpretation, setAIInterpretation] = useState<any>(null);

  useEffect(() => {
    // TODO: Fetch chart data from API
    // For now, using placeholder data
    setChartData({
      id: chartId || '1',
      planets: [
        { planet: 'sun', sign: 'aries', degree: 15, house: 1 },
        { planet: 'moon', sign: 'taurus', degree: 10, house: 2 },
      ],
      houses: [
        { house: 1, sign: 'aries', degree: 0 },
        { house: 2, sign: 'taurus', degree: 30 },
      ],
      aspects: [
        { planet1: 'sun', planet2: 'moon', type: 'trine', orb: 5 },
      ],
    });
    setLoading(false);
  }, [chartId]);

  const handleAIInterpretation = (interpretation: any) => {
    setAIInterpretation(interpretation);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-4 py-4">
            <a href="/dashboard" className="text-primary-600 hover:text-primary-700">
              ← Back to Dashboard
            </a>
            <h1 className="text-2xl font-bold mt-4">Personality Analysis</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <SkeletonLoader variant="text" count={5} />
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-4 py-4">
            <a href="/dashboard" className="text-primary-600 hover:text-primary-700">
              ← Back to Dashboard
            </a>
            <h1 className="text-2xl font-bold mt-4">Personality Analysis</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            icon="📊"
            title="No chart data available"
            description="Unable to load personality analysis. Please create a chart first."
            actionText="Create Chart"
            onAction={() => window.location.href = '/charts/new'}
            secondaryActionText="Back to Dashboard"
            onSecondaryAction={() => window.location.href = '/dashboard'}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <a href={`/charts/${chartId}`} className="text-primary-600 hover:text-primary-700">
            ← Back to Chart
          </a>
          <h1 className="text-2xl font-bold mt-4">Personality Analysis</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* AI Toggle Section */}
        <div className="mb-6">
          <AIInterpretationToggle
            chartData={chartData}
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
          {chartData && (
            <PersonalityAnalysis
              data={{
                overview: {
                  sunSign: {
                    planet: 'sun',
                    sign: chartData.planets.find(p => p.planet === 'sun')?.sign || 'aries',
                    keywords: ['core identity', 'vitality', 'self-expression'],
                    general: 'Your Sun sign represents your core identity and life purpose.',
                    strengths: ['Leadership', 'Confidence', 'Creativity'],
                    challenges: ['Ego', 'Stubbornness', 'Impatience'],
                    advice: ['Embrace your natural leadership abilities', 'Practice patience with others'],
                  },
                  moonSign: {
                    planet: 'moon',
                    sign: chartData.planets.find(p => p.planet === 'moon')?.sign || 'taurus',
                    keywords: ['emotions', 'intuition', 'inner needs'],
                    general: 'Your Moon sign reveals your emotional nature and inner world.',
                    strengths: ['Emotional intelligence', 'Nurturing', 'Intuition'],
                    challenges: ['Moodiness', 'Sensitivity', 'Insecurity'],
                    advice: ['Honor your emotional needs', 'Create a safe home environment'],
                  },
                },
                planetsInSigns: chartData.planets.map(p => ({
                  planet: p.planet,
                  sign: p.sign,
                  keywords: [`${p.planet} in ${p.sign}`, 'energy', 'expression'],
                  general: `${p.planet.charAt(0).toUpperCase() + p.planet.slice(1)} in ${p.sign.charAt(0).toUpperCase() + p.sign.slice(1)}`,
                  strengths: ['Expressive', 'Dynamic'],
                  challenges: ['Impulsive', 'Restless'],
                  advice: ['Channel your energy constructively'],
                })),
                houses: chartData.houses.map(h => ({
                  house: h.house,
                  signOnCusp: h.sign,
                  planetsInHouse: chartData.planets.filter(p => p.house === h.house).map(p => p.planet),
                  themes: [`${h.sign.charAt(0).toUpperCase() + h.sign.slice(1)} themes`],
                  interpretation: `House ${h.house} in ${h.sign.charAt(0).toUpperCase() + h.sign.slice(1)}`,
                  advice: ['Focus on this area of life'],
                })),
                aspects: chartData.aspects.map(a => ({
                  planet1: a.planet1,
                  planet2: a.planet2,
                  aspect: a.type,
                  orb: a.orb,
                  harmonious: ['trine', 'sextile'].includes(a.type),
                  keywords: [a.type, 'aspect'],
                  interpretation: `${a.planet1} ${a.type} ${a.planet2}`,
                  expression: 'This aspect influences your personality',
                  advice: ['Work with this energy consciously'],
                })),
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
