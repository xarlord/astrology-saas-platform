/**
 * Welcome Modal
 *
 * Shows on the user's first Dashboard visit after registration.
 * Displays a chart preview (if available) and feature highlights.
 * Dismissed by setting onboardingCompleted in user preferences.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useCharts } from '../hooks';
import { authService } from '../services';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { charts } = useCharts();
  const modalRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Get first chart for preview
  const primaryChart = charts[0];
  const sunSign = primaryChart?.calculated_data?.planets?.find((p) => p.name === 'Sun')?.sign;
  const moonSign = primaryChart?.calculated_data?.planets?.find((p) => p.name === 'Moon')?.sign;
  const risingSign = primaryChart?.calculated_data?.planets?.find(
    (p) => p.name === 'Ascendant' || p.name === 'ASC',
  )?.sign;
  const hasChart = !!primaryChart;

  // Focus trap
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      void handleDismiss();
      return;
    }
    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  // Handle dismiss and mark onboarding complete
  const handleDismiss = async () => {
    try {
      await authService.updatePreferences({
        // Spread existing preferences to avoid overwriting
        ...user?.preferences,
        // Using a custom field for onboarding state
        onboardingCompleted: true,
      } as Record<string, unknown>);
    } catch {
      // Silently fail - also use localStorage as fallback
    }
    // localStorage fallback for onboarding state
    localStorage.setItem('astroscope_onboarding_done', 'true');
    onClose();
  };

  // Setup focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus CTA after a short delay for animation
      const timer = setTimeout(() => ctaRef.current?.focus(), 250);
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const features = [
    { icon: 'bolt', label: 'Daily energy readings', color: 'text-yellow-400 bg-yellow-500/20' },
    {
      icon: 'planet',
      label: 'Planetary transit alerts',
      color: 'text-purple-400 bg-purple-500/20',
    },
    { icon: 'group', label: 'Compatibility insights', color: 'text-pink-400 bg-pink-500/20' },
    { icon: 'calendar_month', label: 'Monthly forecasts', color: 'text-blue-400 bg-blue-500/20' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) void handleDismiss();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div
        ref={modalRef}
        className="bg-surface-dark border border-white/10 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative"
        style={{
          animation: 'welcomeModalIn 200ms ease-out',
        }}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          onClick={() => void handleDismiss()}
          aria-label="Close welcome dialog"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="material-symbols-outlined text-accent-gold text-2xl">
              auto_awesome
            </span>
            <h2 id="welcome-title" className="text-2xl font-bold text-white">
              Welcome to AstroVerse!
            </h2>
          </div>
          <p className="text-slate-400">
            {hasChart
              ? 'Here is a preview of your cosmic blueprint:'
              : 'Your personalized cosmic dashboard awaits.'}
          </p>
        </div>

        {/* Chart Preview */}
        {hasChart ? (
          <div className="bg-[#0B0D17] border border-white/5 rounded-xl p-6 mb-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-cosmic-blue/20 border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-primary">all_inclusive</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {sunSign && (
                <span className="bg-[#1e2136] px-3 py-1.5 rounded-lg text-sm text-white border border-white/5">
                  Sun: {sunSign}
                </span>
              )}
              {moonSign && (
                <span className="bg-[#1e2136] px-3 py-1.5 rounded-lg text-sm text-white border border-white/5">
                  Moon: {moonSign}
                </span>
              )}
              {risingSign && (
                <span className="bg-[#1e2136] px-3 py-1.5 rounded-lg text-sm text-white border border-white/5">
                  Rising: {risingSign}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#0B0D17] border border-white/5 rounded-xl p-6 mb-6 text-center">
            <div
              className="w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #1a103c 0%, #2e1065 50%, #0B0D17 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span className="material-symbols-outlined text-4xl text-slate-400">nightlight</span>
            </div>
            <p className="text-slate-300 text-sm mb-3">
              Complete your birth data to unlock your chart
            </p>
            <button
              className="text-primary text-sm font-medium hover:text-white transition-colors flex items-center gap-1 mx-auto"
              onClick={() => {
                void handleDismiss();
                navigate('/charts/create');
              }}
            >
              Add Birth Data
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mb-6">
          <p className="text-sm text-slate-300 mb-3">Your personalized dashboard includes:</p>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature) => (
              <div key={feature.icon} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <div
                  className={`size-8 rounded-lg flex items-center justify-center ${feature.color}`}
                >
                  <span className="material-symbols-outlined text-[18px]">{feature.icon}</span>
                </div>
                <span className="text-sm text-slate-300">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          ref={ctaRef}
          className="w-full py-3 px-4 text-white font-bold rounded-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(90deg, #b23de1 0%, #2563EB 100%)',
          }}
          onClick={() => {
            void handleDismiss();
            if (!hasChart) {
              navigate('/charts/create');
            }
          }}
          data-testid="welcome-modal-cta"
        >
          <span>{hasChart ? 'Explore My Dashboard' : 'Create My First Chart'}</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          {hasChart
            ? 'You can always create more charts from the "New Chart" button in the sidebar.'
            : 'Step 1 of 2 — Create Your Chart'}
        </p>
      </div>

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes welcomeModalIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
