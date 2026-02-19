/**
 * AI Interpretation Display Component
 * Shows AI-enhanced interpretations with special formatting
 */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import './AIInterpretationDisplay.css';

interface AIInterpretationDisplayProps {
  interpretation: {
    ai: boolean;
    enhanced?: string | Record<string, any>;
    generatedAt?: string;
    model?: string;
  };
}

export const AIInterpretationDisplay: React.FC<AIInterpretationDisplayProps> = ({
  interpretation,
}) => {
  if (!interpretation || !interpretation.ai) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStructuredContent = (content: Record<string, any>) => {
    return (
      <div className="ai-structured">
        {Object.entries(content).map(([key, value]) => (
          <div key={key} className="ai-section">
            <h4 className="ai-section-title">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <div className="ai-section-content">
              {typeof value === 'string' ? (
                <p>{value}</p>
              ) : Array.isArray(value) ? (
                <ul>
                  {value.map((item, i) => (
                    <li key={i}>
                      {typeof item === 'string' ? item : JSON.stringify(item)}
                    </li>
                  ))}
                </ul>
              ) : typeof value === 'object' && value !== null ? (
                renderStructuredContent(value)
              ) : (
                <span>{String(value)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="ai-interpretation-display">
      <div className="ai-header">
        <div className="ai-badge">
          <Sparkles size={16} />
          <span>AI-Enhanced</span>
        </div>
        <div className="ai-meta">
          {interpretation.generatedAt && (
            <span className="ai-timestamp">
              Generated {formatDate(interpretation.generatedAt)}
            </span>
          )}
          {interpretation.model && (
            <span className="ai-model">{interpretation.model}</span>
          )}
        </div>
      </div>

      {interpretation.enhanced && (
        <div className="ai-content">
          {typeof interpretation.enhanced === 'string' ? (
            <p className="ai-text">{interpretation.enhanced}</p>
          ) : typeof interpretation.enhanced === 'object' ? (
            renderStructuredContent(interpretation.enhanced)
          ) : null}
        </div>
      )}

      <div className="ai-footer">
        <AlertCircle size={14} />
        <small>
          AI interpretations are generated using GPT-4 and may vary. Use as guidance alongside traditional astrological wisdom.
        </small>
      </div>
    </div>
  );
};

export default AIInterpretationDisplay;
