import React from 'react';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  retry: () => void;
}

/**
 * Error Fallback Component
 *
 * Displays a user-friendly error message when an error boundary
 * catches an error. Provides options to retry the action or
 * navigate back to the home page.
 *
 * Features cosmic theme consistent with the AstroVerse design.
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, retry }) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 shadow-2xl p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Oops! Something went wrong
        </h1>

        {/* Error Message */}
        <p className="text-purple-200 text-center mb-6">
          We encountered an unexpected error. Don't worry, your data is safe.
        </p>

        {/* Technical Details (collapsible in production) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <details className="mb-6">
            <summary className="text-sm text-purple-300 cursor-pointer hover:text-purple-200 transition-colors">
              Technical Details
            </summary>
            <div className="mt-2 p-3 bg-black/30 rounded-lg">
              <p className="text-xs text-red-300 font-mono break-words">{error.message}</p>
              {error.stack && (
                <pre className="text-xs text-red-400/70 font-mono mt-2 overflow-x-auto whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={retry}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>

        {/* Help Text */}
        <p className="text-purple-300/60 text-xs text-center mt-6">
          If this problem persists, please contact support
        </p>
      </div>
    </div>
  );
};

export default ErrorFallback;
