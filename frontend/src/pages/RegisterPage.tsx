import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { RegisterForm } from '../components/AuthenticationForms';

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      leftPanel={
        <>
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-cosmic-blue/10 to-transparent opacity-60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-cosmic-page/80 via-transparent to-cosmic-page/90 pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12 lg:mb-20">
              <div className="size-10 bg-gradient-to-br from-primary to-cosmic-blue rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(107,61,225,0.5)]">
                <span className="material-symbols-outlined text-white text-2xl" aria-hidden="true">all_inclusive</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">AstroVerse</h2>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center max-w-lg">
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
            <div className="mt-auto pt-8 border-t border-white/15">
              <blockquote className="text-slate-200 italic text-sm">
                &ldquo;The universe is not outside of you. Look inside yourself; everything that you want, you already are.&rdquo;
                <span className="block text-primary not-italic font-bold mt-2">&ndash; Rumi</span>
              </blockquote>
            </div>
          </div>
        </>
      }
    >
      <RegisterForm onSuccess={() => navigate('/dashboard')} />
    </AuthLayout>
  );
}
