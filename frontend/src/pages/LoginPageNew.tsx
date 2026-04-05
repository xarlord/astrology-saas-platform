/**
 * Login Page Component
 *
 * Split-screen login page with cosmic artwork and form
 * Matches design from stitch-UI/desktop/02-login-page.html
 */

import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import { Helmet } from 'react-helmet-async';
import {
  Sparkles,
  AlertCircle,
  Mail,
  Eye,
  EyeOff,
  Lock,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

export default function LoginPageNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });
      // Redirect to the page they were trying to access, or dashboard by default
      const from =
        (location.state as { from?: { pathname?: string } })?.from?.pathname ?? '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    // Social login will be implemented later
    console.log(`Social login with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] to-[#141627] font-display text-slate-100 antialiased overflow-hidden">
      <Helmet>
        <title>Sign In — AstroVerse</title>
      </Helmet>
      {/* WCAG 2.1 AA - Skip Navigation Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <main id="main-content">
        <div className="flex min-h-screen w-full flex-col lg:flex-row">
          {/* Left Panel: Cosmic Artwork */}
          <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between overflow-hidden bg-[#05060e]">
            {/* Background Image */}
            <div
              className="absolute inset-0 z-0 bg-cover bg-center opacity-80"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAFUYNfRXz-Nk3HeobGsgSRlxfbh85-ieQ8R_5HJFse7CNKqILYpFD5Z637egp63hqZpXmoR24kViIHTDMv8Sy_w4pGc9vqLBDUg_UMCcTdid09PKWw21JRvceFTQ3OQW48BU6xFrlDv6BgcFcnlBSA2tVqwx-wvSxqs7eCXKPgWT2RJY19tTHRdM7lHh6DCfUsDMIT48SeVBkf0f4YaZxvzSSn-gdkoziUORrJUPFYLUZ8nJQdo3i7zwdRT45Xv4NXVfpO8d810jFd')`,
              }}
              aria-hidden="true"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0B0D17] via-[#0B0D17]/40 to-transparent"></div>

            {/* Content */}
            <div className="relative z-20 flex h-full flex-col justify-between p-12 xl:p-16">
              {/* Logo Area */}
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">AstroVerse</span>
              </Link>

              {/* Central Visual Element (Abstract Zodiac Wheel) */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 pointer-events-none animate-float"
                aria-hidden="true"
              >
                <svg
                  fill="none"
                  height="400"
                  viewBox="0 0 400 400"
                  width="400"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      id="wheelGradient"
                      x1="200"
                      x2="200"
                      y1="0"
                      y2="400"
                    >
                      <stop stopColor="#A78BFA" stopOpacity="0.8"></stop>
                      <stop offset="1" stopColor="#2563EB" stopOpacity="0.1"></stop>
                    </linearGradient>
                  </defs>
                  <circle
                    cx="200"
                    cy="200"
                    r="198"
                    stroke="url(#wheelGradient)"
                    strokeDasharray="8 8"
                    strokeWidth="1"
                  ></circle>
                  <circle
                    cx="200"
                    cy="200"
                    r="150"
                    stroke="url(#wheelGradient)"
                    strokeWidth="1"
                  ></circle>
                  <circle
                    cx="200"
                    cy="200"
                    r="100"
                    stroke="url(#wheelGradient)"
                    strokeDasharray="4 4"
                    strokeWidth="0.5"
                  ></circle>
                </svg>
              </div>

              {/* Bottom Quote */}
              <div className="max-w-md">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-primary-200 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Daily Insight</span>
                </div>
                <blockquote className="text-3xl font-medium leading-tight text-white lg:text-4xl">
                  "The stars are aligned for your journey."
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-px w-12 bg-gradient-to-r from-amber-400 to-transparent"></div>
                  <p className="text-sm font-light text-slate-400">Premium Astrology SaaS</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Login Form */}
          <div className="flex w-full flex-1 flex-col justify-center bg-gradient-to-br from-[#0B0D17] to-[#141627] px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
            <div className="mx-auto w-full max-w-[420px]">
              {/* Mobile Logo (visible only on small screens) */}
              <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-white">AstroVerse</span>
              </Link>

              {/* Header */}
              <div className="mb-10 text-center lg:text-left">
                <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">Welcome Back</h1>
                <p className="text-primary-200/80">Sign in to access your cosmic insights</p>
              </div>

              {/* Error Display */}
              {error && (
                <div
                  className="mb-6 p-4 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-200"
                  role="alert"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* Form Container */}
              <div
                className="rounded-2xl p-8 shadow-2xl shadow-primary/5"
                style={{
                  background: 'rgba(22, 18, 33, 0.4)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSubmit(e);
                  }}
                >
                  {/* Email Field */}
                  <div>
                    <label
                      className="mb-2 block text-sm font-medium text-slate-200"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-primary-200/60">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        className="block w-full rounded-xl border-0 bg-surface-dark py-3.5 pl-11 pr-4 text-white ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all duration-200"
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="cosmic.traveler@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-describedby="email-description"
                        data-testid="email-input"
                      />
                    </div>
                    <p id="email-description" className="mt-1 text-xs text-slate-500">
                      We'll never share your email with anyone else.
                    </p>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      className="mb-2 block text-sm font-medium text-slate-200"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-primary-200/60">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        className="block w-full rounded-xl border-0 bg-surface-dark py-3.5 pl-11 pr-12 text-white ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all duration-200"
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-describedby="password-description"
                        data-testid="password-input"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-slate-300 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        data-testid="password-visibility-toggle"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        className="h-4 w-4 rounded border-white/20 bg-surface-dark text-primary focus:ring-primary focus:ring-offset-background-dark"
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <label className="ml-2 block text-sm text-slate-300" htmlFor="remember-me">
                        Remember me
                      </label>
                    </div>
                    <div className="text-sm">
                      <Link
                        className="font-medium text-primary-200 hover:text-white transition-colors"
                        to="/forgot-password"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      className="group relative flex w-full justify-center rounded-xl py-3.5 px-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/40 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      style={{
                        background: 'linear-gradient(135deg, #6b3de1 0%, #2563EB 100%)',
                      }}
                      type="submit"
                      data-testid="submit-button"
                      disabled={isLoading}
                    >
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        {isLoading && <RefreshCw className="w-6 h-6" />}
                      </span>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </form>

                {/* Divider */}
                <div className="relative mt-8">
                  <div aria-hidden="true" className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-gradient-to-br from-[#0B0D17] to-[#141627] px-3 text-xs font-medium uppercase tracking-wider text-slate-500 rounded-full">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Logins */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <button
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/5 px-3 py-3 text-sm font-medium text-white ring-1 ring-inset ring-white/10 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0D17]"
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    aria-label="Continue with Google"
                  >
                    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M12.0003 20.45c4.6593 0 8.3604-3.8532 8.1897-8.5082h-8.1897v-3.3444h11.9793c.1251.681.1897 1.3857.1897 2.1154 0 6.627-5.373 12-12 12-6.627 0-12-5.373-12-12s5.373-12 12-12c3.056 0 5.845 1.137 7.973 3.013l-2.585 2.528c-1.397-1.127-3.172-1.805-5.388-1.805-4.615 0-8.356 3.741-8.356 8.356s3.741 8.356 8.356 8.356z"
                        fill="currentColor"
                      ></path>
                    </svg>
                    <span className="text-sm font-semibold leading-6">Google</span>
                  </button>
                  <button
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/5 px-3 py-3 text-sm font-medium text-white ring-1 ring-inset ring-white/10 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0D17]"
                    type="button"
                    onClick={() => handleSocialLogin('apple')}
                    aria-label="Continue with Apple"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M13.135 6.05675C13.6215 5.5675 13.922 4.96675 13.922 4.416C13.922 4.281 13.9102 4.1445 13.8765 4.0095C13.2592 4.03275 12.5167 4.39425 12.0622 4.88775C11.649 5.334 11.2935 5.96925 11.2935 6.5415C11.2935 6.69 11.3115 6.8265 11.3325 6.94275C11.9962 6.98925 12.6735 6.61125 13.135 6.05675ZM15.9382 13.881C15.918 15.3562 17.2065 16.1482 17.2725 16.1857C17.229 16.3267 17.025 17.0197 16.533 17.7052C16.11 18.2932 15.666 18.8752 14.976 18.8932C14.286 18.9112 14.07 18.4972 13.248 18.4972C12.426 18.4972 12.18 18.8932 11.532 18.9112C10.878 18.9292 10.374 18.2752 9.9405 17.6872C9.0525 16.4812 8.3745 14.2822 8.3745 12.5122C8.3745 10.9762 9.2025 10.0342 10.74 10.0162C11.406 10.0072 12.042 10.4392 12.45 10.4392C12.852 10.4392 13.632 9.92925 14.814 9.91125C15.312 9.92925 16.596 10.0912 17.316 11.0812C17.256 11.1172 15.9562 11.8372 15.9382 13.881Z"></path>
                    </svg>
                    <span className="text-sm font-semibold leading-6">Apple</span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <p className="mt-10 text-center text-sm text-slate-400">
                Don't have an account?
                <Link
                  className="font-semibold leading-6 text-primary hover:text-primary-200 transition-colors ml-1"
                  to="/register"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
