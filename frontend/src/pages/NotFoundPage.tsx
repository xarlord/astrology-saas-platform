/**
 * 404 Not Found Page
 * "Lost in the Cosmos" theme with floating astronaut and animations
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface MercuryStatus {
  isRetrograde: boolean;
  status: 'Direct' | 'Retrograde';
}

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [mercuryStatus, setMercuryStatus] = useState<MercuryStatus>({
    isRetrograde: false,
    status: 'Direct',
  });

  useEffect(() => {
    // Simple calculation - Mercury is retrograde roughly 3-4 times per year
    // For demo purposes, we'll use a simple date-based check
    // In production, this would call an actual astrology API
    const checkMercuryStatus = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const day = now.getDate();

      // Mercury retrograde periods for 2024-2026 (simplified)
      const retrogradePeriods = [
        // 2024
        { start: new Date(2024, 3, 1), end: new Date(2024, 3, 25) },
        { start: new Date(2024, 7, 5), end: new Date(2024, 7, 28) },
        { start: new Date(2024, 10, 25), end: new Date(2024, 11, 15) },
        // 2025
        { start: new Date(2025, 2, 15), end: new Date(2025, 3, 7) },
        { start: new Date(2025, 6, 18), end: new Date(2025, 7, 11) },
        { start: new Date(2025, 10, 9), end: new Date(2025, 10, 29) },
        // 2026
        { start: new Date(2026, 2, 1), end: new Date(2026, 2, 22) },
        { start: new Date(2026, 6, 15), end: new Date(2026, 7, 8) },
        { start: new Date(2026, 10, 10), end: new Date(2026, 10, 30) },
      ];

      const current = new Date(year, month, day);
      const isRetrograde = retrogradePeriods.some(
        (period) => current >= period.start && current <= period.end,
      );

      setMercuryStatus({
        isRetrograde,
        status: isRetrograde ? 'Retrograde' : 'Direct',
      });
    };

    checkMercuryStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] to-[#141627] font-display text-slate-100 relative overflow-hidden flex flex-col">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Nebula Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cosmic-blue/10 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[100px] rounded-full" />

        {/* Twinkling Stars */}
        <div className="star twinkle-1" />
        <div className="star twinkle-2" />
        <div className="star twinkle-3" />
        <div className="star twinkle-4" />
        <div className="star twinkle-5" />
      </div>

      {/* Main Content Container */}
      <main className="flex-grow flex items-center justify-center relative z-10 px-4 py-12">
        <div className="max-w-[1200px] w-full flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
          {/* Illustration Area */}
          <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center order-2 md:order-1">
            {/* Zodiac Ring Background */}
            <div
              className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-40 animate-drift"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBcQ5HiHT4Kj_hVmlM-tDWAllVBRF6YrZNrjGFnaVdRXcEIfZ8JpGBxZyT7khNYmuIrLVMp3Q9VQ-QEhoeGvORXzrqmxxKxoBCXuwtKYoT0LrNDHQq5LP8V5gcPL47qJGWFPWGe5xQkhgJsCRY3Ki91VqiDZPkk-eWajvSK-5-b9ZronBRgXUnI0_ChOkHB8wcgUl2GxVsfkNRO2U-KHRicVUN50FioMaGP9527IB69BWsVIgPVIYFPHN5rxA_VK6_iEJ-z81gKcHSw")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0B0D17] to-[#141627]/60 mix-blend-multiply" />
            </div>

            {/* Broken Wheel SVG */}
            <svg
              className="absolute w-[110%] h-[110%] text-primary/30 animate-spin-slow"
              fill="none"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="48"
                stroke="currentColor"
                strokeDasharray="4 4"
                strokeWidth="0.5"
              />
              <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.2" />
            </svg>

            {/* Floating Astronaut */}
            <div className="relative w-[80%] h-[80%] animate-float z-20">
              <img
                alt="Astronaut floating in deep space darkness"
                className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(107,61,225,0.4)]"
                style={{
                  WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)',
                  maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)',
                }}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp6S0OQNmT7zYyWZLm488Wxx5xjmWtTy7YvAJywkGVL0zghe12sFviXIBN7kFtoMMQS7ezSKmhIV1a2UhpraarpKCTM6gWRKTpyN32OwgfS7AZPT_ImEY-QB0qUGICUIDn-foC1deSgoW5td8xm4Hcfz1TL-fmJhDpJ-IWRygwHlwTlQEZ-oNXBjmprx82lk_k0rsEhlA_49e09iEn-PYm1qRA-pWMpMU10iXrqY6yMQ-fAfqHWy8vwDxGAvkM-JBhkv0fmjr56tJr"
              />
            </div>

            {/* Floating Debris Particles */}
            <div
              className="absolute top-10 right-10 w-3 h-3 bg-soft-lavender/40 rotate-45 animate-drift"
              style={{ animationDuration: '15s' }}
            />
            <div
              className="absolute bottom-20 left-10 w-2 h-2 bg-cosmic-blue/40 rounded-full animate-drift"
              style={{ animationDuration: '20s', animationDirection: 'reverse' }}
            />
          </div>

          {/* Text Content Area */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left order-1 md:order-2 max-w-lg z-30">
            <h1 className="text-[120px] md:text-[160px] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-primary/50 to-transparent drop-shadow-[0_0_25px_rgba(107,61,225,0.5)] select-none">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight animate-pulse-glow">
              Lost in the Cosmos
            </h2>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed font-light max-w-md">
              The stars couldn't find the page you're looking for. Perhaps Mercury is in retrograde?
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate('/')}
                className="group relative px-8 py-3.5 bg-gradient-to-r from-[#6c3de1] to-[#512da8] rounded-xl text-white font-bold tracking-wide transition-all duration-300 hover:shadow-[0_0_20px_rgba(107,61,225,0.6)] hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12" />
                <span className="relative flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                  Return Home
                </span>
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3.5 rounded-xl text-white font-medium tracking-wide border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="w-full relative z-20 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 opacity-70 hover:opacity-100 transition-opacity duration-300">
          {/* Brand Mark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-deep-space flex items-center justify-center shadow-lg border border-white/10">
              <span className="material-symbols-outlined text-white text-[18px]">auto_awesome</span>
            </div>
            <span className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
              AstroVerse
            </span>
          </div>

          {/* Mercury Status */}
          <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse ${
                mercuryStatus.isRetrograde ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            <span className="text-xs font-medium text-slate-300 tracking-wide">
              Current Mercury Status:{' '}
              <span
                className={mercuryStatus.isRetrograde ? 'text-amber-300' : 'text-white'}
                style={{ fontWeight: 'bold' }}
              >
                {mercuryStatus.status} {mercuryStatus.isRetrograde ? '⚠️' : '✓'}
              </span>
            </span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }

        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -10px); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-drift {
          animation: drift 10s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }

        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle var(--duration, 3s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }

        .twinkle-1 {
          top: 15%;
          left: 10%;
          width: 4px;
          height: 4px;
          --duration: 3s;
          --delay: 0s;
          opacity: 0.6;
        }

        .twinkle-2 {
          top: 25%;
          left: 80%;
          width: 2px;
          height: 2px;
          --duration: 4s;
          --delay: 1s;
          opacity: 0.4;
        }

        .twinkle-3 {
          top: 75%;
          left: 15%;
          width: 4px;
          height: 4px;
          --duration: 5s;
          --delay: 2s;
          background: #A78BFA;
          opacity: 0.5;
        }

        .twinkle-4 {
          top: 60%;
          left: 90%;
          width: 2px;
          height: 2px;
          --duration: 2s;
          --delay: 0.5s;
          opacity: 0.7;
        }

        .twinkle-5 {
          top: 10%;
          left: 50%;
          width: 2px;
          height: 2px;
          --duration: 6s;
          --delay: 3s;
          opacity: 0.3;
        }

        .glass-panel {
          background: rgba(22, 18, 32, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .bg-gradient-to-br from-[#0B0D17] to-[#141627] {
          background-color: #0B0D17;
        }

        .bg-primary {
          background-color: #6b3de1;
        }

        .bg-cosmic-blue {
          background-color: #2563EB;
        }

        .bg-soft-lavender {
          background-color: #A78BFA;
        }

        .text-primary {
          color: #6b3de1;
        }

        .text-slate-100 {
          color: #f1f5f9;
        }

        .text-slate-300 {
          color: #cbd5e1;
        }

        .from-primary {
          --tw-gradient-from: #6b3de1;
        }

        .via-primary-50 {
          --tw-gradient-to: rgb(107 61 225 / 0.5);
        }
      `}</style>
    </div>
  );
}
