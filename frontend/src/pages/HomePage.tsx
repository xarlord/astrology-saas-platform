/**
 * Home / Landing Page — Stitch UI Design
 * Full premium landing: glassmorphism nav, starfield hero, features,
 * testimonials, pricing, and bottom CTA
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-cosmic-page text-slate-100 font-sans antialiased overflow-x-hidden">
      {/* Skip to content */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* ===== Navigation ===== */}
      <nav className="fixed top-0 w-full z-50 glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="size-9 bg-gradient-to-br from-primary to-cosmic-blue rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-2xl" aria-hidden="true">auto_awesome</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">AstroVerse</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-200 hover:text-white transition-colors">Features</a>
              <a href="#testimonials" className="text-sm font-medium text-slate-200 hover:text-white transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm font-medium text-slate-200 hover:text-white transition-colors">Pricing</a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-white hover:text-primary transition-colors">Sign In</Link>
              <Link
                to="/register"
                className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_0_15px_rgba(107,61,225,0.3)] hover:shadow-[0_0_25px_rgba(107,61,225,0.5)] btn-glow"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                className="text-slate-200 hover:text-white"
                aria-label="Open navigation menu"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="material-symbols-outlined" aria-hidden="true">menu</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-cosmic-card-solid backdrop-blur-md border-l border-cosmic-border transform transition-transform duration-300 ease-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between p-6 border-b border-cosmic-border">
          <span className="text-lg font-bold text-white">Menu</span>
          <button
            type="button"
            className="text-slate-200 hover:text-white"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <div className="flex flex-col p-6 gap-1">
          <a
            href="#features"
            className="px-4 py-3 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#testimonials"
            className="px-4 py-3 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Testimonials
          </a>
          <a
            href="#pricing"
            className="px-4 py-3 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </a>
          <div className="my-4 border-t border-cosmic-border" />
          <Link
            to="/login"
            className="px-4 py-3 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="mt-2 w-full text-center bg-cosmic-gradient text-white py-3 rounded-xl font-semibold btn-glow"
            onClick={() => setMobileMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>

      <main id="main-content" tabIndex={-1}>
        {/* ===== Hero Section ===== */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden stars-bg">
          {/* Nebula Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] nebula-bg opacity-60 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="text-center lg:text-left space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="text-xs font-medium text-secondary-200 uppercase tracking-wider">Now Available</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] bg-gradient-to-r from-white via-purple-100 to-slate-400 bg-clip-text text-transparent drop-shadow-lg">
                  Discover Your <br />
                  <span className="text-primary text-glow text-fill-primary">Cosmic Blueprint</span>
                </h1>

                <p className="text-lg lg:text-xl text-slate-200 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                  Unlock the secrets of your natal chart with AI-powered insights and hyper-personalized transit forecasts. Align your life with the stars.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                  <Link
                    to="/register"
                    className="btn-glow flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-xl text-base font-bold tracking-wide"
                  >
                    Get Started Free
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white border border-cosmic-border hover:border-primary/50 hover:bg-white/15 backdrop-blur-sm transition-all group"
                  >
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform" aria-hidden="true">play_circle</span>
                    Watch Demo
                  </Link>
                </div>
              </div>

              {/* Hero Illustration — Chart Wheel SVG */}
              <div className="hidden lg:flex justify-center items-center">
                <div className="relative animate-float">
                  <svg fill="none" height="500" viewBox="0 0 500 500" width="500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="250" cy="250" r="240" stroke="url(#heroGrad)" strokeDasharray="12 8" strokeWidth="1" />
                    <circle cx="250" cy="250" r="200" stroke="url(#heroGrad)" strokeWidth="1.5" />
                    <circle cx="250" cy="250" r="160" stroke="url(#heroGrad)" strokeDasharray="6 6" strokeWidth="0.5" />
                    <circle cx="250" cy="250" r="120" stroke="url(#heroGrad)" strokeWidth="1" />
                    <circle cx="250" cy="250" r="80" stroke="url(#heroGrad)" strokeDasharray="4 4" strokeWidth="0.5" />
                    {/* Zodiac symbols at positions */}
                    {['Ari','Tau','Gem','Can','Leo','Vir','Lib','Sco','Sag','Cap','Aqu','Psc'].map((sign, i) => {
                      const angle = (i * 30 - 90) * Math.PI / 180;
                      const x = 250 + 220 * Math.cos(angle);
                      const y = 250 + 220 * Math.sin(angle);
                      return (
                        <text key={sign} x={x} y={y} fill="#A78BFA" fontSize="12" textAnchor="middle" dominantBaseline="central" fontFamily="Space Grotesk" fontWeight="600">{sign}</text>
                      );
                    })}
                    {/* Planet dots */}
                    {[
                      { cx: 250, cy: 170, color: '#FFD700' },
                      { cx: 310, cy: 250, color: '#C0C0C0' },
                      { cx: 190, cy: 230, color: '#FF69B4' },
                      { cx: 280, cy: 320, color: '#FF0000' },
                      { cx: 220, cy: 300, color: '#FFA500' },
                    ].map((p, i) => (
                      <circle key={i} cx={p.cx} cy={p.cy} r="5" fill={p.color} opacity="0.8" />
                    ))}
                    <defs>
                      <linearGradient gradientUnits="userSpaceOnUse" id="heroGrad" x1="250" x2="250" y1="0" y2="500">
                        <stop stopColor="#A78BFA" stopOpacity="0.8" />
                        <stop offset="1" stopColor="#2563EB" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Glow behind chart */}
                  <div className="absolute inset-0 -z-10 bg-primary/20 rounded-full blur-[80px]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Features Section ===== */}
        <section id="features" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-4">Everything You Need</h2>
              <p className="text-slate-200 text-lg max-w-2xl mx-auto">Powerful tools to explore your astrological profile</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: 'auto_awesome',
                  gradient: 'from-purple-500 to-indigo-600',
                  title: 'Natal Charts',
                  desc: 'High-precision calculations using Swiss Ephemeris for accurate birth chart generation.',
                },
                {
                  icon: 'psychology',
                  gradient: 'from-blue-500 to-cyan-600',
                  title: 'Personality Insights',
                  desc: 'Deep AI-powered analysis of planetary positions, houses, and aspects in your chart.',
                },
                {
                  icon: 'nights_stay',
                  gradient: 'from-amber-500 to-orange-600',
                  title: 'Transit Forecasts',
                  desc: 'Real-time predictions with personalized guidance based on current planetary movements.',
                },
                {
                  icon: 'group',
                  gradient: 'from-pink-500 to-rose-600',
                  title: 'Synastry Reports',
                  desc: 'Detailed compatibility analysis comparing two birth charts for relationship insights.',
                },
                {
                  icon: 'dark_mode',
                  gradient: 'from-indigo-500 to-violet-600',
                  title: 'Lunar & Solar Returns',
                  desc: 'Annual forecasts based on solar and lunar return charts for key life themes.',
                },
                {
                  icon: 'calendar_month',
                  gradient: 'from-emerald-500 to-teal-600',
                  title: 'Astrological Calendar',
                  desc: 'Track moon phases, retrogrades, eclipses, and significant planetary events.',
                },
              ].map((feature) => (
                <div
                  key={feature.icon}
                  className="glass-card rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300 group"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined text-white text-2xl" aria-hidden="true">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-200">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Testimonials Section ===== */}
        <section id="testimonials" className="py-24 relative">
          <div className="absolute inset-0 nebula-bg opacity-30 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-4">Loved by Stargazers</h2>
              <p className="text-slate-200 text-lg">What our community says about AstroVerse</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "The natal chart accuracy is incredible. I've compared it with professional readings and it matches perfectly.",
                  name: 'Sarah M.',
                  role: 'Astrology Enthusiast',
                  color: 'from-indigo-500 to-purple-600',
                },
                {
                  quote: "The daily transit notifications have helped me understand patterns in my life I never noticed before.",
                  name: 'James K.',
                  role: 'Premium Member',
                  color: 'from-pink-500 to-rose-600',
                },
                {
                  quote: "The synastry report with my partner was spot-on. It helped us understand our relationship dynamics better.",
                  name: 'Elena R.',
                  role: 'Relationship Coach',
                  color: 'from-blue-500 to-cyan-600',
                },
              ].map((testimonial) => (
                <div key={testimonial.name} className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...new Array<number>(5)].map((_, i) => (
                      <span key={i} className="text-gold text-sm" aria-hidden="true">star</span>
                    ))}
                    <span className="sr-only">5 out of 5 stars</span>
                  </div>
                  <p className="text-slate-200 mb-6 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold text-sm`}>
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-slate-200 text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Pricing Section ===== */}
        <section id="pricing" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-4">Simple Pricing</h2>
              <p className="text-slate-200 text-lg">Choose the plan that fits your cosmic journey</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: 'Free',
                  price: '$0',
                  period: 'forever',
                  features: ['1 Natal Chart', 'Basic Transits', 'Moon Phase Calendar', 'Daily Horoscope'],
                  cta: 'Get Started',
                  featured: false,
                },
                {
                  name: 'Pro',
                  price: '$9.99',
                  period: '/month',
                  features: ['Unlimited Charts', 'Advanced Transit Forecasts', 'Synastry Reports', 'Solar & Lunar Returns', 'Personality Analysis', 'Priority Support'],
                  cta: 'Start Free Trial',
                  featured: true,
                },
                {
                  name: 'Enterprise',
                  price: '$29.99',
                  period: '/month',
                  features: ['Everything in Pro', 'API Access', 'Bulk Chart Generation', 'White-label Options', 'Dedicated Support', 'Custom Integrations'],
                  cta: 'Contact Us',
                  featured: false,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-8 flex flex-col ${
                    plan.featured
                      ? 'glass-panel border-2 border-primary/30 shadow-lg shadow-primary/10'
                      : 'glass-card'
                  }`}
                >
                  {plan.featured && (
                    <div className="inline-flex self-start items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold mb-4">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-slate-200 text-sm ml-1">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-200">
                        <span className="material-symbols-outlined text-green-400 text-lg" aria-hidden="true">check_circle</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className={`w-full py-3 px-4 rounded-xl text-center font-semibold transition-all duration-200 ${
                      plan.featured
                        ? 'bg-cosmic-gradient text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5'
                        : 'bg-white/15 text-white ring-1 ring-inset ring-white/10 hover:bg-white/15'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Bottom CTA Section ===== */}
        <section className="py-24 relative">
          <div className="absolute inset-0 nebula-bg opacity-40 pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl lg:text-5xl font-bold gradient-text mb-6">
              Ready to Discover Your Stars?
            </h2>
            <p className="text-slate-200 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of users who have unlocked their cosmic potential. Start your free journey today.
            </p>
            <Link
              to="/register"
              className="btn-glow inline-flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-xl text-lg font-bold shadow-[0_0_25px_rgba(107,61,225,0.4)]"
            >
              Get Started Free
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-white/15 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-gradient-to-br from-primary to-cosmic-blue rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg" aria-hidden="true">auto_awesome</span>
              </div>
              <span className="text-lg font-bold text-white">AstroVerse</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-200">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/features" className="hover:text-white transition-colors">Features</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
            <p className="text-sm text-slate-200">&copy; 2026 AstroVerse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
