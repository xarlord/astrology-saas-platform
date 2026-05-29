/* eslint-disable @typescript-eslint/no-misused-promises */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';

interface LoginFormProps {
  onSuccess?: () => void;
}

interface RegisterFormProps {
  onSuccess?: () => void;
}

interface ErrorMessageProps {
  message: string;
  id?: string;
}

function ErrorMessage({ message, id }: ErrorMessageProps) {
  return (
    <p id={id} data-testid="error-message" className="error-message" role="alert" aria-live="assertive">
      <span className="material-symbols-outlined error-icon" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
      <span className="error-text">{message}</span>
    </p>
  );
}

// ==================== LOGIN FORM ====================
export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);

  const emailErrorId = 'email-error';
  const passwordErrorId = 'password-error';

  const validate = () => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await login({ email: formData.email, password: formData.password });
      onSuccess?.();
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { error?: { message?: string } }; message?: string }; message?: string };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message = axiosErr?.response?.data?.error?.message ?? axiosErr?.response?.data?.error ?? axiosErr?.message ?? 'Login failed. Please check your credentials.';
      setErrors({ email: typeof message === 'string' ? message : 'Login failed' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof formData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (name === 'email' && value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else if (name === 'password' && value) {
      if (value.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-panel rounded-2xl p-8 shadow-2xl shadow-primary/5">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-200">
            Sign in to access your charts and readings
          </p>
        </div>

        <form onSubmit={handleSubmit} data-testid="login-form" className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-lavender/60">
                <span className="material-symbols-outlined" aria-hidden="true">mail</span>
              </div>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                data-testid="email-input"
                aria-required="true"
                aria-invalid={errors.email ? 'true' : undefined}
                aria-describedby={errors.email ? emailErrorId : undefined}
                className={`
                  w-full py-3.5 pl-11 pr-12 rounded-xl border-0 bg-cosmic-card-solid text-white ring-1 ring-inset transition-all duration-200 placeholder:text-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary
                  ${errors.email ? 'ring-red-500 bg-red-900/10' : 'ring-white/10'}
                `}
                placeholder="cosmic.traveler@example.com"
              />
              {errors.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 error-icon-wrapper">
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
                </div>
              )}
            </div>
            {errors.email && <ErrorMessage message={errors.email} id={emailErrorId} />}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-lavender/60">
                <span className="material-symbols-outlined" aria-hidden="true">lock</span>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                data-testid="password-input"
                aria-required="true"
                aria-invalid={errors.password ? 'true' : undefined}
                aria-describedby={errors.password ? passwordErrorId : undefined}
                className={`
                  w-full py-3.5 pl-11 pr-12 rounded-xl border-0 bg-cosmic-card-solid text-white ring-1 ring-inset transition-all duration-200 placeholder:text-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary
                  ${errors.password ? 'ring-red-500 bg-red-900/10' : 'ring-white/10'}
                `}
                placeholder="Enter your password"
              />
              {errors.password && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 error-icon-wrapper">
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-200 hover:text-slate-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility_off</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                )}
              </button>
            </div>
            {errors.password && <ErrorMessage message={errors.password} id={passwordErrorId} />}

            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                data-testid="forgot-password-link"
                className="text-sm font-medium text-lavender hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            data-testid="login-submit"
            className="group relative flex w-full justify-center rounded-xl bg-cosmic-gradient py-3.5 px-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/40 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              <>
                Sign In
                <span className="material-symbols-outlined ml-2 text-lg transition-transform group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-200">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            data-testid="signup-link"
            className="font-semibold text-primary hover:text-lavender transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

// ==================== REGISTER FORM ====================
export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const nameErrorId = 'name-error';
  const emailErrorId = 'email-error';
  const passwordErrorId = 'password-error';
  const confirmPasswordErrorId = 'confirmPassword-error';

  const validate = () => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 12) {
      newErrors.password = 'Password must be at least 12 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await register({ name: formData.name, email: formData.email, password: formData.password });
      onSuccess?.();
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { error?: { message?: string } }; message?: string }; message?: string };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message = axiosErr?.response?.data?.error?.message ?? axiosErr?.response?.data?.error ?? axiosErr?.message ?? 'Registration failed. Please try again.';
      setErrors({ email: typeof message === 'string' ? message : 'Registration failed' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof formData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (name === 'name' && value) {
      if (!value.trim() || value.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
    } else if (name === 'email' && value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else if (name === 'password' && value) {
      if (value.length < 12) {
        newErrors.password = 'Password must be at least 12 characters';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/.test(value)) {
        newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';
      }
    } else if (name === 'confirmPassword' && value && formData.password) {
      if (formData.password !== value) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-panel rounded-2xl p-8 shadow-2xl shadow-primary/5">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-sm text-slate-200">
            Start your astrological journey today
          </p>
        </div>

        <form onSubmit={handleSubmit} data-testid="register-form" className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-lavender/60">
                <span className="material-symbols-outlined" aria-hidden="true">person</span>
              </div>
              <input
                type="text"
                id="name"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                data-testid="name-input"
                aria-required="true"
                aria-invalid={errors.name ? 'true' : undefined}
                aria-describedby={errors.name ? nameErrorId : undefined}
                className={`
                  w-full py-3.5 pl-11 pr-12 rounded-xl border-0 bg-cosmic-card-solid text-white ring-1 ring-inset transition-all duration-200 placeholder:text-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary
                  ${errors.name ? 'ring-red-500 bg-red-900/10' : 'ring-white/10'}
                `}
                placeholder="Your full name"
              />
              {errors.name && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 error-icon-wrapper">
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
                </div>
              )}
            </div>
            {errors.name && <ErrorMessage message={errors.name} id={nameErrorId} />}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-lavender/60">
                <span className="material-symbols-outlined" aria-hidden="true">mail</span>
              </div>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                data-testid="email-input"
                aria-required="true"
                aria-invalid={errors.email ? 'true' : undefined}
                aria-describedby={errors.email ? emailErrorId : undefined}
                className={`
                  w-full py-3.5 pl-11 pr-12 rounded-xl border-0 bg-cosmic-card-solid text-white ring-1 ring-inset transition-all duration-200 placeholder:text-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary
                  ${errors.email ? 'ring-red-500 bg-red-900/10' : 'ring-white/10'}
                `}
                placeholder="cosmic.traveler@example.com"
              />
              {errors.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 error-icon-wrapper">
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
                </div>
              )}
            </div>
            {errors.email && <ErrorMessage message={errors.email} id={emailErrorId} />}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-lavender/60">
                <span className="material-symbols-outlined" aria-hidden="true">lock</span>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                data-testid="password-input"
                aria-required="true"
                aria-invalid={errors.password ? 'true' : undefined}
                aria-describedby={errors.password ? passwordErrorId : undefined}
                className={`
                  w-full py-3.5 pl-11 pr-12 rounded-xl border-0 bg-cosmic-card-solid text-white ring-1 ring-inset transition-all duration-200 placeholder:text-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary
                  ${errors.password ? 'ring-red-500 bg-red-900/10' : 'ring-white/10'}
                `}
                placeholder="Min 12 chars, upper/lower/number/special"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-200 hover:text-slate-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility_off</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                )}
              </button>
            </div>
            {errors.password && <ErrorMessage message={errors.password} id={passwordErrorId} />}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-lavender/60">
                <span className="material-symbols-outlined" aria-hidden="true">lock</span>
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                data-testid="confirm-password-input"
                aria-required="true"
                aria-invalid={errors.confirmPassword ? 'true' : undefined}
                aria-describedby={errors.confirmPassword ? confirmPasswordErrorId : undefined}
                className={`
                  w-full py-3.5 pl-11 pr-12 rounded-xl border-0 bg-cosmic-card-solid text-white ring-1 ring-inset transition-all duration-200 placeholder:text-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary
                  ${errors.confirmPassword ? 'ring-red-500 bg-red-900/10' : 'ring-white/10'}
                `}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-200 hover:text-slate-200"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility_off</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                )}
              </button>
            </div>
            {errors.confirmPassword && <ErrorMessage message={errors.confirmPassword} id={confirmPasswordErrorId} />}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            data-testid="register-submit"
            className="group relative flex w-full justify-center rounded-xl bg-cosmic-gradient py-3.5 px-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/40 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : (
              <>
                Create Account
                <span className="material-symbols-outlined ml-2 text-lg transition-transform group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-200">
          Already have an account?{' '}
          <Link
            to="/login"
            data-testid="login-link"
            className="font-semibold text-primary hover:text-lavender transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
