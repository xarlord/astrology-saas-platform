/**
 * Login Page — Stitch UI Split-Screen Design
 * Left: cosmic artwork panel with zodiac wheel + quote
 * Right: login form with glass-panel styling
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen w-full flex-row bg-cosmic-page">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>

      {/* Left Panel — Cosmic Artwork */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between overflow-hidden bg-cosmic-page">
        {/* Background gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/20 via-cosmic-blue/10 to-transparent opacity-80" />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-cosmic-page via-cosmic-page/40 to-transparent" />

        {/* Content */}
        <div className="relative z-20 flex h-full flex-col justify-between p-12 xl:p-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 border border-white/15">
              <span className="material-symbols-outlined text-gold text-2xl" aria-hidden="true">auto_awesome</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">AstroVerse</span>
          </div>

          {/* Central Zodiac Wheel SVG */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 pointer-events-none animate-float">
            <svg fill="none" height="400" viewBox="0 0 400 400" width="400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="200" cy="200" r="198" stroke="url(#paint0_linear)" strokeDasharray="8 8" strokeWidth="1" />
              <circle cx="200" cy="200" r="150" stroke="url(#paint0_linear)" strokeWidth="1" />
              <circle cx="200" cy="200" r="100" stroke="url(#paint0_linear)" strokeDasharray="4 4" strokeWidth="0.5" />
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear" x1="200" x2="200" y1="0" y2="400">
                  <stop stopColor="#A78BFA" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#2563EB" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Bottom Quote */}
          <div className="max-w-md">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/15 px-3 py-1 text-xs font-medium text-lavender">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">spark</span>
              <span>Daily Insight</span>
            </div>
            <blockquote className="text-3xl font-medium leading-tight text-white lg:text-4xl">
              &ldquo;The stars are aligned for your journey.&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-gold to-transparent" />
              <p className="text-sm font-light text-slate-200">Premium Astrology SaaS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <main id="main-content" tabIndex={-1} className="flex w-full flex-1 flex-col justify-center bg-cosmic-page px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
            </div>
            <span className="text-2xl font-bold text-white">AstroVerse</span>
          </div>

          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">Welcome Back</h1>
            <p className="text-lavender/80">Sign in to access your cosmic insights</p>
          </div>

          {/* Form Container — Glass Panel */}
          <div className="glass-panel rounded-2xl p-8 shadow-2xl shadow-primary/5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
                const password = (form.elements.namedItem('password') as HTMLInputElement)?.value;
                if (email && password) {
                  void login(email, password).then(() => navigate('/dashboard'));
                }
              }}
              className="space-y-6"
            >
              {/* Email Field */}
              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-200">
                  Email
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-lavender/60">
                    <span className="material-symbols-outlined" aria-hidden="true">mail</span>
                  </div>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="cosmic.traveler@example.com"
                    className="block w-full rounded-xl border-0 bg-cosmic-card-solid py-3.5 pl-11 pr-4 text-white ring-1 ring-inset ring-white/10 placeholder:text-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-200">
                  Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-lavender/60">
                    <span className="material-symbols-outlined" aria-hidden="true">lock</span>
                  </div>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="block w-full rounded-xl border-0 bg-cosmic-card-solid py-3.5 pl-11 pr-4 text-white ring-1 ring-inset ring-white/10 placeholder:text-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-cosmic-card-solid text-primary focus:ring-primary focus:ring-offset-cosmic-page"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-200">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-lavender hover:text-white transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center rounded-xl bg-cosmic-gradient py-3.5 px-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/40 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in...' : (
                    <>
                      Sign In
                      <span className="material-symbols-outlined ml-2 text-lg transition-transform group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative mt-8">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/15" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-cosmic-page px-3 text-xs font-medium uppercase tracking-wider text-slate-200 rounded-full">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/15 px-3 py-3 text-sm font-medium text-white ring-1 ring-inset ring-white/10 hover:bg-white/15 transition-colors"
              >
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M12.0003 20.45c4.6593 0 8.3604-3.8532 8.1897-8.5082h-8.1897v-3.3444h11.9793c.1251.681.1897 1.3857.1897 2.1154 0 6.627-5.373 12-12 12-6.627 0-12-5.373-12-12s5.373-12 12-12c3.056 0 5.845 1.137 7.973 3.013l-2.585 2.528c-1.397-1.127-3.172-1.805-5.388-1.805-4.615 0-8.356 3.741-8.356 8.356s3.741 8.356 8.356 8.356z" fill="currentColor" />
                </svg>
                <span className="text-sm font-semibold leading-6">Google</span>
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/15 px-3 py-3 text-sm font-medium text-white ring-1 ring-inset ring-white/10 hover:bg-white/15 transition-colors"
              >
                <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.135 6.05675C13.6215 5.5675 13.922 4.96675 13.922 4.416C13.922 4.281 13.9102 4.1445 13.8765 4.0095C13.2592 4.03275 12.5167 4.39425 12.0622 4.88775C11.649 5.334 11.2935 5.96925 11.2935 6.5415C11.2935 6.69 11.3115 6.8265 11.3325 6.94275C11.9962 6.98925 12.6735 6.61125 13.135 6.05675ZM15.9382 13.881C15.918 15.3562 17.2065 16.1482 17.2725 16.1857C17.229 16.3267 17.025 17.0197 16.533 17.7052C16.11 18.2932 15.666 18.8752 14.976 18.8932C14.286 18.9112 14.07 18.4972 13.248 18.4972C12.426 18.4972 12.18 18.8932 11.532 18.9112C10.878 18.9292 10.374 18.2752 9.9405 17.6872C9.0525 16.4812 8.3745 14.2822 8.3745 12.5122C8.3745 10.9762 9.2025 10.0342 10.74 10.0162C11.406 10.0072 12.042 10.4392 12.45 10.4392C12.852 10.4392 13.632 9.92925 14.814 9.91125C15.312 9.92925 16.596 10.0912 17.316 11.0812C17.256 11.1172 15.9562 11.8372 15.9382 13.881Z" />
                </svg>
                <span className="text-sm font-semibold leading-6">Apple</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-10 text-center text-sm text-slate-200">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold leading-6 text-primary hover:text-lavender transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
