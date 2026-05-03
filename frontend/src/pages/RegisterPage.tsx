/**
 * Register Page — Stitch UI Split-Screen Design
 * Left: cosmic gradient panel with features list + Rumi quote
 * Right: registration form with glass-panel styling
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/dashboard');
    } catch (error: unknown) {
      const err = error as { message?: string };
      setErrors({ email: err.message ?? 'Registration failed. Please try again.' });
    }
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^a-zA-Z\d]/.test(p)) score++;
    return Math.min(4, score);
  };

  const strength = getPasswordStrength();
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-500'];

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-cosmic-page">
      {/* Skip to content */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Left Panel — Brand & Features */}
      <div className="relative w-full lg:w-5/12 xl:w-1/2 flex flex-col p-8 lg:p-12 overflow-hidden bg-gradient-to-br from-cosmic-page via-[#1a103c] to-[#2e1065]">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-cosmic-blue/10 to-transparent opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-cosmic-page/80 via-transparent to-cosmic-page/90 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 mb-12 lg:mb-20">
          <div className="size-10 bg-gradient-to-br from-primary to-cosmic-blue rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(107,61,225,0.5)]">
            <span className="material-symbols-outlined text-white text-2xl" aria-hidden="true">all_inclusive</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">AstroVerse</h2>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-white">
            Unlock the <span className="gradient-text">secrets</span> of the stars
          </h1>
          <p className="text-slate-200 text-lg mb-10 leading-relaxed">
            Join thousands of users discovering their cosmic path with our premium astrological tools.
          </p>

          {/* Feature List */}
          <div className="space-y-4 mb-12">
            {[
              { icon: 'auto_awesome', title: 'Accurate natal chart calculations', desc: 'Precise astronomical data for your unique birth chart.' },
              { icon: 'planet', title: 'Daily planetary transits', desc: 'Real-time updates on how planetary movements affect you.' },
              { icon: 'group', title: 'Relationship synastry reports', desc: 'Deep compatibility analysis for you and your partner.' },
            ].map((feature) => (
              <div key={feature.icon} className="flex items-start gap-4 p-4 rounded-xl bg-white/15 border border-white/15 hover:bg-white/15 transition-colors duration-300">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                  <span className="material-symbols-outlined" aria-hidden="true">{feature.icon}</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{feature.title}</h3>
                  <p className="text-slate-200 text-sm mt-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote Footer */}
        <div className="relative z-10 mt-auto pt-8 border-t border-white/15">
          <blockquote className="text-slate-200 italic text-sm">
            &ldquo;The universe is not outside of you. Look inside yourself; everything that you want, you already are.&rdquo;
            <span className="block text-primary not-italic font-bold mt-2">&ndash; Rumi</span>
          </blockquote>
        </div>
      </div>

      {/* Right Panel — Registration Form */}
      <main id="main-content" tabIndex={-1} className="w-full lg:w-7/12 xl:w-1/2 bg-cosmic-page flex items-center justify-center p-6 lg:p-12 relative">
        {/* Background glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cosmic-blue/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-md z-10">
          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Your Account</h2>
            <p className="text-slate-200">Start your cosmic journey for free. No credit card required.</p>
          </div>

          {/* Form Container — Glass Panel */}
          <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="reg-name" className="text-sm font-medium text-slate-200 ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-200 text-xl" aria-hidden="true">person</span>
                </div>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="block w-full pl-11 pr-4 py-3 bg-cosmic-page/50 border border-cosmic-border rounded-xl text-white placeholder:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs ml-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="reg-email" className="text-sm font-medium text-slate-200 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-200 text-xl" aria-hidden="true">mail</span>
                </div>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="block w-full pl-11 pr-4 py-3 bg-cosmic-page/50 border border-cosmic-border rounded-xl text-white placeholder:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs ml-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="reg-password" className="text-sm font-medium text-slate-200 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-200 text-xl" aria-hidden="true">lock</span>
                </div>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="block w-full pl-11 pr-12 py-3 bg-cosmic-page/50 border border-cosmic-border rounded-xl text-white placeholder:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-slate-200 text-xl hover:text-slate-200">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {/* Strength Meter */}
              {formData.password && (
                <div className="flex gap-2 mt-2 px-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : 'bg-slate-700'}`} />
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-200 px-1">Must contain at least 8 characters</p>
              {errors.password && <p className="text-red-400 text-xs ml-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="reg-confirm" className="text-sm font-medium text-slate-200 ml-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-200 text-xl" aria-hidden="true">lock_reset</span>
                </div>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="block w-full pl-11 pr-4 py-3 bg-cosmic-page/50 border border-cosmic-border rounded-xl text-white placeholder:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs ml-1">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 mt-2 px-1">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 rounded border-cosmic-border bg-cosmic-page/50 text-primary focus:ring-primary focus:ring-offset-cosmic-page"
                />
              </div>
              <label htmlFor="terms" className="text-sm text-slate-200">
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:text-lavender underline underline-offset-2">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary hover:text-lavender underline underline-offset-2">Privacy Policy</Link>.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-cosmic-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : (
                <>
                  Create Account
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cosmic-border/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-cosmic-card-solid px-4 text-slate-200">or sign up with</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-cosmic-border bg-white/15 hover:bg-white/15 text-white transition-colors duration-200"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-cosmic-border bg-white/15 hover:bg-white/15 text-white transition-colors duration-200"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.06 2.77.79 3.49 1.84-3.16 1.76-2.56 5.8.46 6.96-.54 1.58-1.27 3.12-2.54 4.23zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span className="text-sm font-medium">Apple</span>
              </button>
            </div>

            {/* Sign In Link */}
            <div className="text-center mt-6">
              <p className="text-slate-200 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-semibold hover:text-white transition-colors">Sign in</Link>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
