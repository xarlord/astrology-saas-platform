/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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

// Error Message Component with Icon
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

  // Generate unique IDs for accessibility
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
      await login(formData.email, formData.password);
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as { message?: string };
      setErrors({
        email: err.message ?? 'Login failed. Please check your credentials.',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof formData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only validate if the field has a value
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
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-200">
            Sign in to access your charts and readings
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} data-testid="login-form" className="space-y-6">
          {/* Email Field */}
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
                  ${
                    errors.email
                      ? 'ring-red-500 bg-red-900/10'
                      : 'ring-white/10'
                  }
                `}
                placeholder="cosmic.traveler@example.com"
              />
              {errors.email && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 error-icon-wrapper">
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-200 hover:text-slate-200 pointer-events-none"
                aria-hidden="true"
              >
                <div className="w-5 h-5" />
              </button>
            </div>
            {errors.email && <ErrorMessage message={errors.email} id={emailErrorId} />}
          </div>

          {/* Password Field */}
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
                  ${
                    errors.password
                      ? 'ring-red-500 bg-red-900/10'
                      : 'ring-white/10'
                  }
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

            {/* Forgot Password Link */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            data-testid="login-submit"
            className="group relative flex w-full justify-center rounded-xl bg-cosmic-gradient py-3.5 px-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/40 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
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

        {/* Divider */}
        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/15" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-cosmic-page px-3 text-xs font-medium uppercase tracking-wider text-slate-200 rounded-full">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Auth Buttons */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/15 px-3 py-3 text-sm font-medium text-white ring-1 ring-inset ring-white/10 hover:bg-white/15 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.0003 20.45c4.6593 0 8.3604-3.8532 8.1897-8.5082h-8.1897v-3.3444h11.9793c.1251.681.1897 1.3857.1897 2.1154 0 6.627-5.373 12-12 12-6.627 0-12-5.373-12-12s5.373-12 12-12c3.056 0 5.845 1.137 7.973 3.013l-2.585 2.528c-1.397-1.127-3.172-1.805-5.388-1.805-4.615 0-8.356 3.741-8.356 8.356s3.741 8.356 8.356 8.356z" fill="currentColor" />
            </svg>
            <span className="text-sm font-semibold leading-6">Google</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/15 px-3 py-3 text-sm font-medium text-white ring-1 ring-inset ring-white/10 hover:bg-white/15 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13.135 6.05675C13.6215 5.5675 13.922 4.96675 13.922 4.416C13.922 4.281 13.9102 4.1445 13.8765 4.0095C13.2592 4.03275 12.5167 4.39425 12.0622 4.88775C11.649 5.334 11.2935 5.96925 11.2935 6.5415C11.2935 6.69 11.3115 6.8265 11.3325 6.94275C11.9962 6.98925 12.6735 6.61125 13.135 6.05675ZM15.9382 13.881C15.918 15.3562 17.2065 16.1482 17.2725 16.1857C17.229 16.3267 17.025 17.0197 16.533 17.7052C16.11 18.2932 15.666 18.8752 14.976 18.8932C14.286 18.9112 14.07 18.4972 13.248 18.4972C12.426 18.4972 12.18 18.8932 11.532 18.9112C10.878 18.9292 10.374 18.2752 9.9405 17.6872C9.0525 16.4812 8.3745 14.2822 8.3745 12.5122C8.3745 10.9762 9.2025 10.0342 10.74 10.0162C11.406 10.0072 12.042 10.4392 12.45 10.4392C12.852 10.4392 13.632 9.92925 14.814 9.91125C15.312 9.92925 16.596 10.0912 17.316 11.0812C17.256 11.1172 15.9562 11.8372 15.9382 13.881Z" />
            </svg>
            <span className="text-sm font-semibold leading-6">Apple</span>
          </button>
        </div>

        {/* Sign Up Link */}
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

  // Generate unique IDs for accessibility
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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(formData.password)) {
      newErrors.password =
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
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
      await register(formData.name, formData.email, formData.password);
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as { message?: string };
      setErrors({
        email: err.message ?? 'Registration failed. Please try again.',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof formData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only validate if the field has a value
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
      if (value.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(value)) {
        newErrors.password =
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
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
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-sm text-slate-200">
            Start your astrological journey today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} data-testid="register-form" className="space-y-5">
          {/* Name Field */}
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
                  ${
                    errors.name
                      ? 'ring-red-500 bg-red-900/10'
                      : 'ring-white/10'
                  }
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

          {/* Email Field */}
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
                data-testid="register-email-input"
                aria-required="true"
                aria-invalid={errors.email ? 'true' : undefined}
                aria-describedby={errors.email ? emailErrorId : undefined}
                className={`
                  w-full py-3.5 pl-11 pr-12 rounded-xl border-0 bg-cosmic-card-solid text-white ring-1 ring-inset transition-all duration-200 placeholder:text-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary
                  ${
                    errors.email
                      ? 'ring-red-500 bg-red-900/10'
                      : 'ring-white/10'
                  }
                `}
                placeholder="name@example.com"
              />
              {errors.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 error-icon-wrapper">
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
                </div>
              )}
            </div>
            {errors.email && <ErrorMessage message={errors.email} id={emailErrorId} />}
          </div>

          {/* Password Field */}
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
                data-testid="register-password-input"
                aria-required="true"
                aria-invalid={errors.password ? 'true' : undefined}
                aria-describedby={errors.password ? passwordErrorId : undefined}
                className={`
                  w-full py-3.5 pl-11 pr-12 rounded-xl border-0 bg-cosmic-card-solid text-white ring-1 ring-inset transition-all duration-200 placeholder:text-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary
                  ${
                    errors.password
                      ? 'ring-red-500 bg-red-900/10'
                      : 'ring-white/10'
                  }
                `}
                placeholder="Create a password"
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
            {!errors.password && (
              <p className="mt-2 text-xs text-slate-200">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-lavender/60">
                <span className="material-symbols-outlined" aria-hidden="true">lock_reset</span>
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
                  ${
                    errors.confirmPassword
                      ? 'ring-red-500 bg-red-900/10'
                      : 'ring-white/10'
                  }
                `}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 error-icon-wrapper">
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
                </div>
              )}
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

          {/* Terms and Conditions */}
          <div className="flex items-start gap-3 mt-2 px-1">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 rounded border-cosmic-border bg-cosmic-card-solid text-primary focus:ring-primary focus:ring-offset-cosmic-page"
              />
            </div>
            <label htmlFor="terms" className="text-sm text-slate-200">
              I agree to the{' '}
              <Link to="/terms" className="text-primary hover:text-lavender underline underline-offset-2">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:text-lavender underline underline-offset-2">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            data-testid="register-submit"
            className="w-full py-3.5 px-4 bg-cosmic-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating account...
              </span>
            ) : (
              <>
                Create Account
                <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative py-2 mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-cosmic-border/50" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-cosmic-card-solid px-4 text-slate-200">or sign up with</span>
          </div>
        </div>

        {/* Social Auth Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-cosmic-border bg-white/15 hover:bg-white/15 text-white transition-colors duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.0003 20.45c4.6593 0 8.3604-3.8532 8.1897-8.5082h-8.1897v-3.3444h11.9793c.1251.681.1897 1.3857.1897 2.1154 0 6.627-5.373 12-12 12-6.627 0-12-5.373-12-12s5.373-12 12-12c3.056 0 5.845 1.137 7.973 3.013l-2.585 2.528c-1.397-1.127-3.172-1.805-5.388-1.805-4.615 0-8.356 3.741-8.356 8.356s3.741 8.356 8.356 8.356z" fill="currentColor" />
            </svg>
            <span className="text-sm font-medium">Google</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-cosmic-border bg-white/15 hover:bg-white/15 text-white transition-colors duration-200"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            <span className="text-sm font-medium">Apple</span>
          </button>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-slate-200 text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary font-semibold hover:text-white transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
