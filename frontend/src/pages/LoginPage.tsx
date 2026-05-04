import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { LoginForm } from '../components/AuthenticationForms';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      leftPanel={
        <>
          {/* Background gradient */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/20 via-cosmic-blue/10 to-transparent opacity-80" />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-cosmic-page via-cosmic-page/40 to-transparent" />

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
        </>
      }
    >
      <LoginForm onSuccess={() => navigate('/dashboard')} />
    </AuthLayout>
  );
}
