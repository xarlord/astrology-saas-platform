/**
 * Analysis Page Component
 * Displays chart personality analysis with AI-enhanced interpretations
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AIInterpretationToggle, AIInterpretationDisplay } from '../components';
import { PersonalityAnalysis } from '../components';

interface ChartData {
  id: string;
  planets: Array<{
    planet: string;
    sign: string;
    degree: number;
    house: number;
  }>;
  houses: Array<{
    house: number;
    sign: string;
    degree: number;
  }>;
  aspects: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
  }>;
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
        <div className="container mx-auto px-4 py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading chart analysis...</p>
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
          {chartData && <PersonalityAnalysis chartData={chartData} />}
        </div>
      </main>
    </div>
  );
}
