/**
 * AI Interpretation Toggle Component
 * Allows users to enable/disable AI enhancements
 */

/* eslint-disable @typescript-eslint/no-floating-promises */

import React, { useState } from 'react';
import { useAIInterpretation } from '../hooks/useAIInterpretation';


interface AIInterpretationToggleProps {
  onInterpretationGenerated?: (interpretation: Record<string, unknown>) => void;
  chartData?: Record<string, unknown>;
}

export const AIInterpretationToggle: React.FC<AIInterpretationToggleProps> = ({
  onInterpretationGenerated,
  chartData,
}) => {
  const { isAvailable, generateNatal, isGenerating, error } = useAIInterpretation();
  const [enabled, setEnabled] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  if (!isAvailable) {
    return null;
  }

  const handleGenerate = async () => {
    if (!enabled || !chartData) return;

    try {
      const interpretation = await generateNatal(chartData);

      if (onInterpretationGenerated) {
        onInterpretationGenerated(interpretation as unknown as Record<string, unknown>);
      }
    } catch (err) {
      console.error('AI generation failed:', err);
    }
  };

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    if (checked && chartData) {
      handleGenerate();
    }
  };

  return (
    <div role="region" aria-label="AI interpretation controls" aria-busy={isGenerating} className="bg-gradient-to-r from-primary/20 to-cosmic-blue/20 backdrop-blur-md border border-primary/20 rounded-xl p-5 text-white mb-5">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 font-semibold text-base">
          <span className="material-symbols-outlined animate-pulse" aria-hidden="true" style={{ fontSize: '18px' }}>auto_awesome</span>
          <span>AI-Enhanced Interpretations</span>
        </div>
        <button
          type="button"
          className="bg-white/20 border-none rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center text-white cursor-pointer transition-colors hover:bg-white/30"
          onClick={() => setShowInfo(!showInfo)}
          aria-label="Toggle AI info"
        >
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '16px' }}>info</span>
        </button>
      </div>

      {showInfo && (
        <div className="bg-white/15 rounded-lg p-3 mb-3 text-sm leading-relaxed">
          <p className="m-0 mb-2 last:m-0">
            Enable AI to generate personalized, nuanced interpretations powered by GPT-4.
            AI enhances the rule-based readings with deeper insights and specific guidance.
          </p>
          <p className="m-0 opacity-90 italic">
            <small>Note: AI interpretations take longer to generate and use API credits.</small>
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center min-w-[44px] min-h-[44px]">
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => handleToggle(!enabled)}
            disabled={isGenerating}
            aria-label="Enable AI interpretations"
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              enabled ? 'bg-white/150' : 'bg-white/30'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full transition-transform duration-300 ${
                enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <span className="text-sm font-medium">
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      {error && (
        <div role="alert" className="bg-red-500/20 border border-red-500/50 rounded-md py-2 px-3 mt-3 text-[13px]">
          Failed to generate AI interpretation. Using rule-based instead.
        </div>
      )}

      {isGenerating && (
        <div className="flex items-center gap-2.5 mt-3 text-sm">
          <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Generating AI interpretation...</span>
        </div>
      )}

      {enabled && !isGenerating && (
        <div className="mt-3 opacity-80">
          <small>API credits will be used</small>
        </div>
      )}
    </div>
  );
};
