/**
 * Landing Page Component
 *
 * Marketing landing page with hero, features, pricing, testimonials, and footer
 * Matches design from stitch-UI/desktop/01-landing-page.html
 */

import { Link } from "react-router-dom";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  CheckCircle,
  Sparkles,
  Menu,
  X,
  Star,
  ArrowLeft,
  ArrowRight,
  Brain,
  Calendar,
  Check,
  Clock,
  Pentagon,
  PlayCircle,
  Quote,
  Sun,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] to-[#141627] text-slate-100 font-display antialiased overflow-x-hidden">
      <Helmet>
        <title>AstroVerse — Discover Your Cosmic Blueprint</title>
      </Helmet>
      {/* WCAG 2.1 AA - Skip Navigation Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-gradient-to-br from-[#0B0D17] to-[#141627]/85 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="size-8 text-primary animate-pulse">
                <Pentagon className="w-10 h-10" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                AstroVerse
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Pricing
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-white hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_0_15px_rgba(123,59,227,0.3)] hover:shadow-[0_0_25px_rgba(123,59,227,0.5)]"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-300 hover:text-white p-2"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gradient-to-br from-[#0B0D17] to-[#141627]/95 backdrop-blur-lg border-t border-white/5">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#features"
                className="block px-3 py-2 text-slate-300 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="block px-3 py-2 text-slate-300 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                className="block px-3 py-2 text-slate-300 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <div className="pt-3 border-t border-white/10 space-y-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-slate-300 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 bg-primary text-white rounded-lg text-center font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main id="main-content">
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-[#0B0D17] to-[#141627]">
          {/* Stars Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B0D17] to-[#141627]">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage: `
                radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px),
                radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px),
                radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 3px)
              `,
                backgroundSize: "550px 550px, 350px 350px, 250px 250px",
                backgroundPosition: "0 0, 40px 60px, 130px 270px",
              }}
            />
          </div>

          {/* Nebula Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] opacity-60 pointer-events-none">
            <div
              className="w-full h-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(123, 59, 227, 0.15) 0%, rgba(11, 13, 23, 0) 50%)",
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="text-center lg:text-left space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-xs font-medium text-primary-200 uppercase tracking-wider">
                    v2.0 Now Available
                  </span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-slate-400 drop-shadow-lg">
                    Discover Your
                  </span>
                  <br />
                  <span
                    className="text-primary"
                    style={{ textShadow: "0 0 20px rgba(123, 59, 227, 0.5)" }}
                  >
                    Cosmic Blueprint
                  </span>
                </h1>

                <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                  Unlock the secrets of your natal chart with AI-powered
                  insights and hyper-personalized transit forecasts. Align your
                  life with the stars.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-xl text-base font-bold tracking-wide transition-all hover:scale-105"
                    style={{
                      boxShadow: "0 0 20px rgba(123, 59, 227, 0.4)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 0 30px rgba(123, 59, 227, 0.6)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 0 20px rgba(123, 59, 227, 0.4)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white border border-slate-700 hover:border-primary/50 hover:bg-white/5 backdrop-blur-sm transition-all group"
                    onClick={() => {
                      // Video modal would go here
                      console.log("Open video modal");
                    }}
                  >
                    <PlayCircle className="w-5 h-5" />
                    Watch Demo
                  </button>
                </div>

                <div className="pt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500">
                  <div className="flex -space-x-2">
                    <img
                      alt="User Avatar"
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-background-dark"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiNT-ipFXLCwACXlAnyX9g6kDBhT4MiS_799zyc2g8ybMXAUUGLuMyquG12cm6ABFGdjWCRMtaEZMfLQiiD7435v0aFOJp1eLZ0-IzoFWJwnOkVEsMK1yazpfbRPW7nr2_DIQ3J9sxmuW2Vtdyc8DhI1S5vZDlur2k3S-ozbweq23E0jGhCNWvTdYoDyH6ry7eiRGF9K2b9qBp5lg8UUXGh9eGddjvk_1IQwZ8sZUnxPKd2gBNeLR_oA7a-7HccWxHEgyyKrjez3u7"
                    />
                    <img
                      alt="User Avatar"
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-background-dark"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsxOUZOuRyHQu36eBm1mnhAnWotNFYoXgoOTlV3-iDr1AAANEMRRjtqtcNGN1dVXSVnPyrhq5btQBCLs2wUeEFWTDunhEALMwQR5YDVFUIErVZ8eGYgVl6yT35ua1w_ptFmH4tGwEfO-GuG-6yLxKfVbmqMigFv5dEM1FbVRa-rfWW7QZ3Mh2tHWAmqSeHyRPyhhZRV05f9pdjnKz0r4XtA-K654N37bqIJYiRhuqzoVbEa_3YiPyiDqys8omUHxtBL39dTl0q06-n"
                    />
                    <img
                      alt="User Avatar"
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-background-dark"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMk58smEaqkR_FzG21stmfTnhknIkFjd6bwmw2Xh3rXHzgEZ9Kme3LY6alpUyFu3W6KvouEHLGrRzft4zyfnyhzSkWhzTaRtSQoQ38rPxAyvEirB_OyKVT89UFd3ndT4uZkmnYfbpsO9y7OzzxOoN8waxjBCOdbRC_mJJargEJ6-ucKrUtVqfecuoOW6NyDdhG7FjKxkXoDQEC2xN8EipKj7APfH2WTqZGKE5O4BhzIresABcFtCFWe5UCjg7OH4rXVZ9tYc0BcF-f"
                    />
                  </div>
                  <p>
                    Trusted by{" "}
                    <span className="text-white font-semibold">50,000+</span>{" "}
                    enthusiasts
                  </p>
                </div>
              </div>

              {/* Hero Image/Visual */}
              <div className="relative lg:h-[600px] flex items-center justify-center">
                {/* Background Glow */}
                <div className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>

                {/* 3D Wheel Representation */}
                <div
                  className="relative w-full aspect-square max-w-[600px]"
                  style={{ animation: "spin 60s linear infinite" }}
                >
                  <div
                    className="absolute inset-0 opacity-90 drop-shadow-[0_0_30px_rgba(123,59,227,0.4)]"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBCTsCxWCP1swyyZf1EW6u7OsmMeqKYbb4othgBcP_TtMrDmCE7NKYOgHlWMZnDHKvw8lWAM1StrywzIuT_KRsNEedt_TDzofWGUGCOW-pR7_QUae9UV7mQTRnEosC3woL7co6fiHer9JUm8dBJ4XNE0Fv0NGaAZw2yIhxt9v5pbQRUjSlxP6qtsFuJUUcTXbwSuliR31-mr3thFvd2Tikk4uam8MzgJ00-Exc1aPvwnFZefFTcVsErD9_bWl8udMRAL_FUuCC7AYtA')`,
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      maskImage:
                        "radial-gradient(circle, black 60%, transparent 100%)",
                      WebkitMaskImage:
                        "radial-gradient(circle, black 60%, transparent 100%)",
                      mixBlendMode: "screen",
                    }}
                  />
                </div>

                {/* Floating Card Overlay 1 */}
                <div
                  className="absolute top-1/4 right-0 p-4 rounded-xl border-l-4 border-l-primary backdrop-blur-md"
                  style={{
                    background: "rgba(19, 22, 37, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                    animation: "bounce 4s infinite",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg text-primary">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">
                        Current Transit
                      </p>
                      <p className="font-bold text-white">Mercury Retrograde</p>
                    </div>
                  </div>
                </div>

                {/* Floating Card Overlay 2 */}
                <div
                  className="absolute bottom-1/4 left-0 p-4 rounded-xl border-l-4 border-l-accent-gold backdrop-blur-md"
                  style={{
                    background: "rgba(19, 22, 37, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                    animation: "bounce 5s infinite",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-accent-gold/20 p-2 rounded-lg text-accent-gold">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">
                        Sun Sign
                      </p>
                      <p className="font-bold text-white">Leo (Fire)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          className="py-24 relative bg-gradient-to-br from-[#0B0D17] to-[#141627]"
          id="features"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-3">
                Features
              </h2>
              <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Everything You Need to <br />
                Align with the Stars
              </h3>
              <p className="text-slate-400 text-lg">
                Our comprehensive suite of astrological tools helps you navigate
                life's cosmic currents with precision.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div
                className="group p-8 rounded-2xl hover:border-primary/50 transition-colors relative overflow-hidden"
                style={{
                  background: "rgba(19, 22, 37, 0.6)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ transitionDuration: "300ms" }}
                ></div>
                <div className="relative z-10">
                  <div
                    className="w-14 h-14 bg-surface-dark rounded-xl flex items-center justify-center border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-300"
                    style={{ boxShadow: "0 0 15px rgba(123, 59, 227, 0.1)" }}
                  >
                    <Clock className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">
                    Natal Charts
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Deep dive analysis of your birth chart with precise
                    planetary positions calculated to the second.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div
                className="group p-8 rounded-2xl hover:border-primary/50 transition-colors relative overflow-hidden"
                style={{
                  background: "rgba(19, 22, 37, 0.6)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ transitionDuration: "300ms" }}
                ></div>
                <div className="relative z-10">
                  <div
                    className="w-14 h-14 bg-surface-dark rounded-xl flex items-center justify-center border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-300"
                    style={{ boxShadow: "0 0 15px rgba(123, 59, 227, 0.1)" }}
                  >
                    <Brain className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">
                    Personality Insights
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Psychological profiling based on elemental balances and
                    modalities. Understand your true self.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div
                className="group p-8 rounded-2xl hover:border-primary/50 transition-colors relative overflow-hidden"
                style={{
                  background: "rgba(19, 22, 37, 0.6)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ transitionDuration: "300ms" }}
                ></div>
                <div className="relative z-10">
                  <div
                    className="w-14 h-14 bg-surface-dark rounded-xl flex items-center justify-center border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-300"
                    style={{ boxShadow: "0 0 15px rgba(123, 59, 227, 0.1)" }}
                  >
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">
                    Transit Forecasts
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Predictive planning tools to navigate retrogrades and
                    transits. Know when to act and when to pause.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-24 relative overflow-hidden" id="testimonials">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px]"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Trusted by 50,000+ <br />
                  Astrology Enthusiasts
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex text-accent-gold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <span className="text-white font-bold text-lg">4.9/5</span>
                  <span className="text-slate-500 text-sm ml-2">
                    Average Rating
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-white hover:bg-surface-dark transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors"
                  style={{ boxShadow: "0 0 15px rgba(123, 59, 227, 0.2)" }}
                  aria-label="Next testimonial"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Testimonial 1 */}
              <div
                className="p-6 rounded-xl flex flex-col justify-between h-full"
                style={{
                  background: "rgba(19, 22, 37, 0.6)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div>
                  <div className="text-primary mb-4">
                    <Quote className="w-10 h-10" />
                  </div>
                  <p className="text-slate-300 text-lg leading-relaxed mb-6">
                    "AstroVerse completely changed how I plan my month. The
                    transit accuracy is scary good! I feel so much more
                    aligned."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <img
                    alt="Elena R."
                    className="size-10 rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjmOX8On5c0sHF3HWyOOIybQWDtbT_Zfy_CE4jQZO29fVu9ZaufncaQamtgctpTOhrjrYSyPvbDf3LpG2VZIIi7LvCOHAkZno2xoDpnNQ24Bw1ReTtylDK_02Fnn0-DRqcQSvOvDUBIt_A-M8cE9iiR7Vwqhs6S5Lgga1X7QfZ8qMl51pUrWtqGXsMpTdEjHm3Igvch_yk2OOzNKIc_HwPVX9BYfLjp0dJ2_YuCHwIIK2mmGFzRyuAH5fy8J6vv6amP9zbg_RfCMId"
                  />
                  <div>
                    <p className="text-white font-semibold text-sm">Elena R.</p>
                    <p className="text-slate-500 text-xs">
                      Professional Astrologer
                    </p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div
                className="p-6 rounded-xl flex flex-col justify-between h-full"
                style={{
                  background: "rgba(19, 22, 37, 0.6)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div>
                  <div className="text-primary mb-4">
                    <Quote className="w-10 h-10" />
                  </div>
                  <p className="text-slate-300 text-lg leading-relaxed mb-6">
                    "Finally, an astrology app that combines beautiful design
                    with deep data. Highly recommend the Pro plan for detailed
                    reports."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <img
                    alt="Marcus T."
                    className="size-10 rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzgXONST5iDpipGxC8sINf6t5KxJVEqciK1adWFABCS6SBSBiyTfqzHvZzXiugyUYBHMGzba9QfgFXyga6k2F7d7Lz0gHzlWYpNXDjYssPva7r5qxeTibbHZJpYvB9SyhxiDa14vS97PsOQolQFB9XxqkaGEu9LB8SUnF5Pyi-tVbJctDcrVOZp5BxdHq0KGxZuShtdPs99pPYhBp3GMmjVC54wZm_MaxuKn5HK7K-vYRqyLH2SGGr5YsEUFv0JBW-FsGjeMVq6oQF"
                  />
                  <div>
                    <p className="text-white font-semibold text-sm">
                      Marcus T.
                    </p>
                    <p className="text-slate-500 text-xs">
                      AstroVerse Pro User
                    </p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div
                className="p-6 rounded-xl flex flex-col justify-between h-full"
                style={{
                  background: "rgba(19, 22, 37, 0.6)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div>
                  <div className="text-primary mb-4">
                    <Quote className="w-10 h-10" />
                  </div>
                  <p className="text-slate-300 text-lg leading-relaxed mb-6">
                    "The natal chart breakdown is so detailed, it felt like a
                    professional reading. The UI is absolutely stunning."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <img
                    alt="Sarah L."
                    className="size-10 rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxl1fXODoPxcHqQVyg452TrRfJ7bdeuHqoO-u5HxZZ11yJ5zHfdlg2KnfzLpjqZZhXpq9tBspxemVQpIwBQ46_vc_pSWQOqgQuawLk871kxbKZGRxmFcEs3Cpy0-kR64CpmPMW-uYSU13PGWeOYqhY-fpnEWhi62qEIcRBEdaK5RBZ3NNbr8Ss3BKM5-DhEWaIOwNF607KLjvVF4-IV5kRLh1XC6LbfhgEEPKhol0QnxM3fE2brM3qee9RfP0WN3lGMO_OZR9BMqr"
                  />
                  <div>
                    <p className="text-white font-semibold text-sm">Sarah L.</p>
                    <p className="text-slate-500 text-xs">Enthusiast</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-[#0F111E]" id="pricing">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Invest in Your Journey
              </h2>
              <p className="text-slate-400 text-lg">
                Choose the plan that best fits your path to self-discovery.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
              {/* Free Plan */}
              <div
                className="rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-colors"
                style={{
                  background: "rgba(19, 22, 37, 0.6)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  Seeker
                </h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-white">Free</span>
                  <span className="text-slate-500 ml-2">/forever</span>
                </div>
                <p className="text-slate-400 text-sm mb-6 h-10">
                  Perfect for getting started with your basic natal placement.
                </p>
                <Link
                  to="/register"
                  className="w-full block text-center py-3 px-4 rounded-lg bg-surface-dark text-white hover:bg-slate-700 font-semibold mb-8 transition-colors"
                >
                  Start Free
                </Link>
                <ul className="space-y-4 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5" />
                    Basic Natal Chart
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5" />
                    Daily Horoscope
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5" />
                    Moon Phase Tracker
                  </li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div
                className="relative rounded-2xl p-8 border border-primary z-10 scale-105"
                style={{
                  background: "rgba(19, 22, 37, 0.6)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 0 40px rgba(123, 59, 227, 0.2)",
                }}
              >
                <div className="absolute top-0 right-0 left-0 -mt-4 flex justify-center">
                  <span className="bg-primary text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Mystic
                </h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-white">$9.99</span>
                  <span className="text-slate-500 ml-2">/mo</span>
                </div>
                <p className="text-slate-300 text-sm mb-6 h-10">
                  Unlock deep insights and predictive transit tools.
                </p>
                <Link
                  to="/register"
                  className="w-full block text-center py-3 px-4 rounded-lg bg-primary text-white hover:bg-primary-dark font-semibold mb-8 transition-all"
                  style={{
                    boxShadow: "0 0 20px rgba(123, 59, 227, 0.4)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 30px rgba(123, 59, 227, 0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 20px rgba(123, 59, 227, 0.4)";
                  }}
                >
                  Get Pro Access
                </Link>
                <ul className="space-y-4 text-sm text-white font-medium">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    Everything in Seeker
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    Full Transit Forecasts
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    Synastry (Compatibility)
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    Personality Reports
                  </li>
                </ul>
              </div>

              {/* Enterprise Plan */}
              <div
                className="rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-colors"
                style={{
                  background: "rgba(19, 22, 37, 0.6)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  Oracle
                </h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-white">$29.99</span>
                  <span className="text-slate-500 ml-2">/mo</span>
                </div>
                <p className="text-slate-400 text-sm mb-6 h-10">
                  For professional astrologers and deep researchers.
                </p>
                <Link
                  to="/register"
                  className="w-full block text-center py-3 px-4 rounded-lg bg-surface-dark text-white hover:bg-slate-700 font-semibold mb-8 transition-colors"
                >
                  Contact Sales
                </Link>
                <ul className="space-y-4 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5" />
                    Everything in Mystic
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5" />
                    Unlimited Charts
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5" />
                    PDF Export Reports
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5" />
                    API Access
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
      </main>
      <footer className="bg-gradient-to-br from-[#0B0D17] to-[#141627] border-t border-white/5 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Pentagon className="w-8 h-8" />
                <span className="text-2xl font-bold text-white">
                  AstroVerse
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-6 max-w-xs">
                Connecting you to the cosmos through data-driven astrology.
                Discover your purpose today.
              </p>
              <div className="flex gap-4">
                <a
                  className="w-10 h-10 rounded-full bg-surface-dark flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary transition-all"
                  href="#"
                  aria-label="X (Twitter)"
                >
                  <span className="font-bold text-xs">X</span>
                </a>
                <a
                  className="w-10 h-10 rounded-full bg-surface-dark flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary transition-all"
                  href="#"
                  aria-label="Instagram"
                >
                  <span className="font-bold text-xs">IG</span>
                </a>
                <a
                  className="w-10 h-10 rounded-full bg-surface-dark flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary transition-all"
                  href="#"
                  aria-label="LinkedIn"
                >
                  <span className="font-bold text-xs">LI</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="#features"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary transition-colors"
                    href="#pricing"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    API
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Integration
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    About
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Blog
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Careers
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Stay Aligned</h4>
              <p className="text-xs text-slate-500 mb-4">
                Subscribe to our newsletter for weekly transit updates.
              </p>
              <form
                className="flex flex-col gap-2"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  className="bg-surface-dark border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Enter your email"
                  type="email"
                />
                <button
                  className="bg-primary hover:bg-primary-dark text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
                  type="submit"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2026 AstroVerse Inc. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <a className="hover:text-white transition-colors" href="#">
                Privacy Policy
              </a>
              <a className="hover:text-white transition-colors" href="#">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
