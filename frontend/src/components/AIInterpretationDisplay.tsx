/**
 * AI Interpretation Display Component
 * Shows AI-enhanced interpretations with special formatting
 */

import React from 'react';

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
  if (!interpretation?.ai) {
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
          <div
            key={key}
            className="border-b border-gray-200 dark:border-gray-600 pb-4 last:border-b-0 last:pb-0"
          >
            <h4 className="text-base font-semibold text-gray-600 dark:text-gray-300 m-0 mb-2 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <div className="text-gray-500 dark:text-gray-400 leading-relaxed [&_ul]:m-0 [&_ul]:pl-6 [&_li]:mb-1">
              {typeof value === 'string' ? (
                <p>{value}</p>
              ) : Array.isArray(value) ? (
                <ul>
                  {value.map((item, i) => (
                    <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
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
    <div
      role="article"
      aria-label="AI-enhanced interpretation"
      className="bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-4 sm:p-6 my-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start gap-2 mb-4">
        <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-full font-semibold text-sm shadow-[0_2px_8px_rgba(102,126,234,0.3)] w-full sm:w-auto justify-center">
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          <span>AI-Enhanced</span>
        </div>
        <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap flex-col sm:flex-row">
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
        <div
          aria-live="polite"
          className="bg-white dark:bg-gray-700 p-4 rounded-lg mb-4 border border-gray-200 dark:border-gray-600"
        >
          {typeof interpretation.enhanced === 'string' ? (
            <p className="leading-relaxed text-gray-900 dark:text-gray-200 m-0 text-base">
              {interpretation.enhanced}
            </p>
          ) : typeof interpretation.enhanced === 'object' ? (
            renderStructuredContent(interpretation.enhanced)
          ) : null}
        </div>
      )}

      <div className="flex items-start gap-2 p-3 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-md text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
        <span className="material-symbols-outlined text-[14px] shrink-0 mt-0.5">error_outline</span>
        <small className="flex-1">
          AI interpretations are generated using GPT-4 and may vary. Use as guidance alongside
          traditional astrological wisdom.
        </small>
      </div>
    </div>
  );
};

export default AIInterpretationDisplay;
