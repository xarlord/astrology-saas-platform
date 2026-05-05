/**
 * AI Interpretation Display Component
 * Shows AI-enhanced interpretations with special formatting
 */

import React from 'react';
import { TextGenerateEffect } from './effects';

interface AIInterpretationDisplayProps {
  interpretation: {
    ai: boolean;
    enhanced?: string | Record<string, unknown>;
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

  const renderStructuredContent = (content: Record<string, unknown>) => {
    return (
      <div className="flex flex-col gap-4">
        {Object.entries(content).map(([key, value]) => (
          <div key={key} className="border-b border-cosmic-border pb-4 last:border-b-0 last:pb-0">
            <h4 className="text-base font-semibold text-slate-200 m-0 mb-2 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <div className="text-slate-200 leading-relaxed [&_ul]:m-0 [&_ul]:pl-6 [&_li]:mb-1">
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
                renderStructuredContent(value as Record<string, unknown>)
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
    <div role="article" aria-label="AI-enhanced interpretation" className="bg-cosmic-card backdrop-blur-md border border-cosmic-border rounded-xl p-4 sm:p-6 my-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start gap-2 mb-4">
        <div className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-full font-semibold text-sm w-full sm:w-auto justify-center">
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '16px' }}>auto_awesome</span>
          <span>AI-Enhanced</span>
        </div>
        <div className="flex gap-4 text-sm text-slate-200 flex-wrap flex-col sm:flex-row">
          {interpretation.generatedAt && (
            <span className="flex items-center gap-1">
              Generated {formatDate(interpretation.generatedAt)}
            </span>
          )}
          {interpretation.model && (
            <span className="flex items-center gap-1">{interpretation.model}</span>
          )}
        </div>
      </div>

      {interpretation.enhanced && (
        <div aria-live="polite" className="bg-white/15 p-4 rounded-lg mb-4 border border-cosmic-border">
          {typeof interpretation.enhanced === 'string' ? (
            <p className="leading-relaxed text-white m-0 text-base"><TextGenerateEffect text={interpretation.enhanced} duration={30} /></p>
          ) : typeof interpretation.enhanced === 'object' ? (
            renderStructuredContent(interpretation.enhanced)
          ) : null}
        </div>
      )}

      <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-md text-slate-200 text-sm leading-relaxed">
        <span className="material-symbols-outlined shrink-0 mt-0.5" aria-hidden="true" style={{ fontSize: '14px' }}>error</span>
        <small className="flex-1">
          AI interpretations are generated using GPT-4 and may vary. Use as guidance alongside traditional astrological wisdom.
        </small>
      </div>
    </div>
  );
};

export default AIInterpretationDisplay;
