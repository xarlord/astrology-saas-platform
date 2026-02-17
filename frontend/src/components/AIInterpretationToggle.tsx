/**
 * AI Interpretation Toggle Component
 * Allows users to enable/disable AI enhancements
 */

import React, { useState } from 'react';
import { useAIInterpretation } from '../hooks/useAIInterpretation';
import { Sparkles, Info } from 'lucide-react';
import './AIInterpretationToggle.css';

interface AIInterpretationToggleProps {
  onInterpretationGenerated?: (interpretation: any) => void;
  chartData?: any;
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
        onInterpretationGenerated(interpretation);
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
    <div className="ai-toggle-container">
      <div className="ai-toggle-header">
        <div className="ai-toggle-title">
          <Sparkles className="ai-icon" size={18} />
          <span>AI-Enhanced Interpretations</span>
        </div>
        <button
          className="ai-info-button"
          onClick={() => setShowInfo(!showInfo)}
          aria-label="Toggle AI info"
        >
          <Info size={16} />
        </button>
      </div>

      {showInfo && (
        <div className="ai-toggle-info">
          <p>
            Enable AI to generate personalized, nuanced interpretations powered by GPT-4.
            AI enhances the rule-based readings with deeper insights and specific guidance.
          </p>
          <p className="ai-note">
            <small>Note: AI interpretations take longer to generate and use API credits.</small>
          </p>
        </div>
      )}

      <div className="ai-toggle-controls">
        <label className="ai-toggle-switch">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            disabled={isGenerating}
            aria-label="Enable AI interpretations"
          />
          <span className="ai-toggle-slider"></span>
        </label>
        <span className="ai-toggle-status">
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      {error && (
        <div className="ai-toggle-error">
          Failed to generate AI interpretation. Using rule-based instead.
        </div>
      )}

      {isGenerating && (
        <div className="ai-toggle-loading">
          <div className="ai-spinner"></div>
          <span>Generating AI interpretation...</span>
        </div>
      )}

      {enabled && !isGenerating && (
        <div className="ai-toggle-usage">
          <small>API credits will be used</small>
        </div>
      )}
    </div>
  );
};
