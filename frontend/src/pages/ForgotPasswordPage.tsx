import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicPageLayout } from '../components/PublicPageLayout';
import { authService } from '../services/auth.service';
import { getErrorMessage } from '../utils/errorHandling';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setApiError(getErrorMessage(err, 'Failed to send reset email. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicPageLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-primary mb-4 text-5xl" aria-hidden="true">
              lock_reset
            </span>
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-[var(--color-text-body)]">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {submitted ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-green-400 mb-4 text-5xl" aria-hidden="true">
                mark_email_read
              </span>
              <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
              <p className="text-[var(--color-text-body)] mb-6">
                If an account exists for {email}, you'll receive a password reset link shortly.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_back</span>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={(e) => { void handleSubmit(e); }} className="glass-card rounded-2xl p-8 space-y-5">
              {apiError && (
                <div role="alert" className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">error</span>
                  {apiError}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-required="true"
                  placeholder="you@example.com"
                  className="input"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-cosmic-gradient text-white rounded-xl font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </span>
                ) : 'Send Reset Link'}
              </button>
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-[var(--color-text-body)] hover:text-white transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </PublicPageLayout>
  );
}
