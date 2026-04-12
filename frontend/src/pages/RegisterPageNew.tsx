/**
 * Register Page Component
 *
 * Split-screen registration page with password strength meter
 * Matches design from stitch-UI/desktop/03-registration-page.html
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks';

// Password strength calculator
const calculatePasswordStrength = (
  password: string,
): { strength: number; label: string; color: string } => {
  if (!password) {
    return { strength: 0, label: '', color: 'bg-slate-700' };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { strength: 1, label: 'Weak', color: 'bg-red-500' };
  } else if (score === 2) {
    return { strength: 2, label: 'Fair', color: 'bg-orange-500' };
  } else if (score === 3) {
    return { strength: 3, label: 'Good', color: 'bg-yellow-500' };
  } else if (score === 4) {
    return { strength: 4, label: 'Strong', color: 'bg-green-500' };
  } else {
    return { strength: 5, label: 'Very Strong', color: 'bg-emerald-500' };
  }
};

export default function RegisterPageNew() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = calculatePasswordStrength(password);
  const passwordsMatch = confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!agreeToTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    // Social login will be implemented later
    void provider;
  };

  return (
    <div className="font-display bg-gradient-to-br from-[#0B0D17] to-[#141627] text-slate-100 min-h-screen flex flex-col selection:bg-primary selection:text-white overflow-x-hidden">
      <div className="flex flex-col lg:flex-row min-h-screen w-full">
        {/* Left Panel: Brand & Features */}
        <div
          className="relative w-full lg:w-5/12 xl:w-1/2 flex flex-col p-8 lg:p-12 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0B0D17 0%, #1a103c 50%, #2e1065 100%)',
          }}
        >
          {/* Decorative Background Elements */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&auto=format&fit=crop&w=2342&q=80')`,
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background-dark/80 via-transparent to-background-dark/90 pointer-events-none"></div>

          {/* Logo */}
          <Link
            to="/"
            className="relative z-10 flex items-center gap-3 mb-12 lg:mb-20"
            aria-label="AstroVerse home"
          >
            <div className="size-10 bg-gradient-to-br from-primary to-cosmic-blue rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(178,61,225,0.5)]">
              <span className="material-symbols-outlined text-white text-2xl">all_inclusive</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">AstroVerse</h2>
          </Link>

          {/* Main Content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Unlock the{' '}
              <span
                className="animated-gradient-text"
                style={{
                  background: 'linear-gradient(to right, #b23de1, #F5A623, #2563EB)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  backgroundSize: '200% auto',
                  animation: 'shine 5s linear infinite',
                }}
              >
                secrets
              </span>{' '}
              of the stars
            </h1>
            <p className="text-slate-300 text-lg mb-10 leading-relaxed">
              Join thousands of users discovering their cosmic path with our premium astrological
              tools.
            </p>

            {/* Feature List */}
            <div className="space-y-6 mb-12">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    Accurate natal chart calculations
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Precise astronomical data for your unique birth chart.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                  <span className="material-symbols-outlined">planet</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Daily planetary transits</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Real-time updates on how planetary movements affect you.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Relationship synastry reports</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Deep compatibility analysis for you and your partner.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Footer */}
          <div className="relative z-10 mt-auto pt-8 border-t border-white/10">
            <blockquote className="text-slate-400 italic text-sm">
              "The universe is not outside of you. Look inside yourself; everything that you want,
              you already are."
              <span className="block text-primary not-italic font-bold mt-2">– Rumi</span>
            </blockquote>
          </div>
        </div>

        {/* Right Panel: Registration Form */}
        <div className="w-full lg:w-7/12 xl:w-1/2 bg-gradient-to-br from-[#0B0D17] to-[#141627] flex items-center justify-center p-6 lg:p-12 relative">
          {/* Background glows */}
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"
            aria-hidden="true"
          ></div>
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cosmic-blue/10 rounded-full blur-[80px] pointer-events-none"
            aria-hidden="true"
          ></div>

          <div className="w-full max-w-md z-10">
            {/* Step Indicator */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold shadow-[0_0_10px_rgba(178,61,225,0.4)]">
                  1
                </span>
                <span className="text-sm text-slate-400 font-medium">Step 1 of 2</span>
              </div>
              <a className="text-sm text-slate-400 hover:text-white transition-colors" href="#">
                Help?
              </a>
            </div>

            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Create Your Account</h2>
              <p className="text-slate-400">
                Start your cosmic journey for free. No credit card required.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div
                className="mb-6 p-4 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-200"
                role="alert"
              >
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base mt-0.5">error</span>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form
              className="rounded-2xl p-8 space-y-5"
              style={{
                background: 'rgba(19, 21, 36, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              }}
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit(e);
              }}
            >
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="fullname">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-500 text-[20px]">
                      person
                    </span>
                  </div>
                  <input
                    className="block w-full pl-11 pr-4 py-3 bg-gradient-to-br from-[#0B0D17] to-[#141627]/50 border border-slate-700 rounded-full text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    id="fullname"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="name-input"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-500 text-[20px]">
                      mail
                    </span>
                  </div>
                  <input
                    className="block w-full pl-11 pr-4 py-3 bg-gradient-to-br from-[#0B0D17] to-[#141627]/50 border border-slate-700 rounded-full text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="register-email-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-500 text-[20px]">
                      lock
                    </span>
                  </div>
                  <input
                    className="block w-full pl-11 pr-12 py-3 bg-gradient-to-br from-[#0B0D17] to-[#141627]/50 border border-slate-700 rounded-full text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="register-password-input"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-slate-500 hover:text-slate-300"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>

                {/* Strength Meter */}
                {password && (
                  <>
                    <div className="flex gap-2 mt-2 px-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            level <= passwordStrength.strength
                              ? passwordStrength.color
                              : 'bg-slate-700'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 px-1 flex items-center gap-2">
                      {passwordStrength.label && (
                        <>
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${passwordStrength.color}`}
                          ></span>
                          Password strength: {passwordStrength.label}
                        </>
                      )}
                    </p>
                  </>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-300 ml-1"
                  htmlFor="confirm-password"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-500 text-[20px]">
                      lock_reset
                    </span>
                  </div>
                  <input
                    className={`block w-full pl-11 pr-12 py-3 bg-gradient-to-br from-[#0B0D17] to-[#141627]/50 border rounded-full text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                      confirmPassword && !passwordsMatch
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-slate-700'
                    }`}
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    data-testid="confirm-password-input"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-slate-500 hover:text-slate-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-400 px-1 flex items-center gap-1" role="alert">
                    <span className="material-symbols-outlined text-sm">error</span>
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 mt-2 px-1">
                <div className="flex items-center h-5">
                  <input
                    className="w-4 h-4 rounded border-slate-600 bg-gradient-to-br from-[#0B0D17] to-[#141627]/50 text-primary focus:ring-primary focus:ring-offset-background-dark"
                    id="terms"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    required
                    data-testid="terms-checkbox"
                  />
                </div>
                <label className="text-sm text-slate-400" htmlFor="terms">
                  I agree to the{' '}
                  <a
                    className="text-primary hover:text-primary-dark underline underline-offset-2"
                    href="#"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    className="text-primary hover:text-primary-dark underline underline-offset-2"
                    href="#"
                  >
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              {/* Submit Button */}
              <button
                className="w-full py-3.5 px-4 text-white font-bold rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: 'linear-gradient(90deg, #b23de1 0%, #2563EB 100%)',
                }}
                type="submit"
                disabled={isLoading || !agreeToTerms || !passwordsMatch}
                data-testid="register-submit-button"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-surface-dark px-4 text-slate-400">or sign up with</span>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-slate-700 bg-white/5 hover:bg-white/10 text-white transition-colors duration-200"
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  aria-label="Continue with Google"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    ></path>
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    ></path>
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    ></path>
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium">Google</span>
                </button>
                <button
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-slate-700 bg-white/5 hover:bg-white/10 text-white transition-colors duration-200"
                  type="button"
                  onClick={() => handleSocialLogin('apple')}
                  aria-label="Continue with Apple"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.06 2.77.79 3.49 1.84-3.16 1.76-2.56 5.8 .46 6.96-.54 1.58-1.27 3.12-2.54 4.23zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"></path>
                  </svg>
                  <span className="text-sm font-medium">Apple</span>
                </button>
              </div>

              {/* Footer Link */}
              <div className="text-center mt-6">
                <p className="text-slate-400 text-sm">
                  Already have an account?{' '}
                  <Link
                    className="text-primary font-semibold hover:text-white transition-colors"
                    to="/login"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }
      `}</style>
    </div>
  );
}
