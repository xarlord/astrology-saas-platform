import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicPageLayout } from '../components/PublicPageLayout';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PublicPageLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-primary mb-4" style={{ fontSize: '48px' }} aria-hidden="true">
              lock_reset
            </span>
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-slate-200">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {submitted ? (
            <div className="bg-cosmic-card backdrop-blur-md rounded-lg border border-cosmic-border p-6 text-center">
              <span className="material-symbols-outlined text-green-400 mb-4" style={{ fontSize: '48px' }} aria-hidden="true">
                mark_email_read
              </span>
              <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
              <p className="text-slate-200 mb-6">
                If an account exists for {email}, you'll receive a password reset link shortly.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }} aria-hidden="true">arrow_back</span>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-cosmic-card backdrop-blur-md rounded-lg border border-cosmic-border p-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1">
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
                  className="w-full px-4 py-2 border border-cosmic-border bg-white/15 text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Send Reset Link
              </button>
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-slate-200 hover:text-white transition-colors"
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
