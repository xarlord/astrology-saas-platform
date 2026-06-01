/**
 * Visual Demo Page — Phase 2 Component Showcase
 *
 * Standalone page that renders all Phase 2 components with mock data
 * for screenshot and video capture.
 */

import React from 'react';

// Mock the theme

// ─── TimeTravelSlider (inline mock) ───────────────────────────────
const TimeTravelSliderDemo: React.FC = () => {
  const [dayOffset, setDayOffset] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);

  const startDate = new Date('2026-01-01');
  const _endDate = new Date('2026-12-31');
  const totalDays = 365;
  const currentDate = new Date(startDate.getTime() + dayOffset * 86400000);

  // Month ticks
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f0f2e 0%, #1a1a3e 100%)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>🕐 Time Travel</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '4px 0 0' }}>
            Scrub through planetary movements
          </p>
        </div>
        <div style={{
          background: 'rgba(107,61,225,0.2)',
          border: '1px solid rgba(107,61,225,0.4)',
          borderRadius: '12px',
          padding: '8px 16px',
          color: '#a78bfa',
          fontSize: '14px',
          fontWeight: '600',
        }}>
          {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Slider Track */}
      <div style={{ position: 'relative', height: '48px', marginBottom: '12px' }}>
        {/* Month labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', top: 0, width: '100%' }}>
          {months.map((m, i) => (
            <span key={i} style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>{m}</span>
          ))}
        </div>
        {/* Track */}
        <div style={{
          position: 'absolute', top: '24px', width: '100%', height: '6px',
          background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden',
        }}>
          <div style={{
            width: `${(dayOffset / totalDays) * 100}%`, height: '100%',
            background: 'linear-gradient(90deg, #6b3de1, #a78bfa)', borderRadius: '3px',
            transition: 'width 0.1s ease',
          }} />
        </div>
        {/* Thumb */}
        <div style={{
          position: 'absolute', top: '18px', left: `${(dayOffset / totalDays) * 100}%`,
          transform: 'translateX(-50%)',
          width: '20px', height: '20px', borderRadius: '50%',
          background: '#6b3de1', border: '3px solid #fff',
          boxShadow: '0 0 12px rgba(107,61,225,0.6)',
          transition: 'left 0.1s ease',
        }} />
      </div>

      <input
        type="range"
        min={0} max={totalDays} value={dayOffset}
        onChange={(e) => setDayOffset(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#6b3de1', marginBottom: '12px' }}
      />

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setIsPlaying(!isPlaying)} style={{
          background: isPlaying ? 'rgba(239,68,68,0.2)' : 'rgba(107,61,225,0.2)',
          border: `1px solid ${isPlaying ? 'rgba(239,68,68,0.4)' : 'rgba(107,61,225,0.4)'}`,
          borderRadius: '12px', padding: '8px 20px', color: isPlaying ? '#ef4444' : '#a78bfa',
          cursor: 'pointer', fontSize: '14px', fontWeight: '600',
        }}>
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[0.5, 1, 2, 5].map((s) => (
            <button key={s} onClick={() => setSpeed(s)} style={{
              background: speed === s ? 'rgba(107,61,225,0.3)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${speed === s ? 'rgba(107,61,225,0.5)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '8px', padding: '4px 10px', color: speed === s ? '#a78bfa' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer', fontSize: '12px',
            }}>
              {s}x
            </button>
          ))}
        </div>

        <button onClick={() => setDayOffset(130)} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', padding: '8px 16px', color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer', fontSize: '13px',
        }}>
          Now
        </button>
      </div>
    </div>
  );
};

// ─── TransitOverlay (inline mock) ─────────────────────────────────
const TransitOverlayDemo: React.FC = () => {
  // SVG chart wheel with transit overlay
  const natalPlanets = [
    { name: 'Sun', angle: 79, color: '#FFD700' },
    { name: 'Moon', angle: 320, color: '#C0C0C0' },
    { name: 'Mercury', angle: 55, color: '#90EE90' },
    { name: 'Venus', angle: 100, color: '#FF69B4' },
    { name: 'Mars', angle: 200, color: '#FF4444' },
    { name: 'Jupiter', angle: 260, color: '#DDA0DD' },
  ];

  const transitPlanets = [
    { name: '☉', angle: 85, color: '#FFD700', isConjunct: true },
    { name: '☽', angle: 318, color: '#C0C0C0', isConjunct: true },
    { name: '☿', angle: 150, color: '#90EE90', isConjunct: false },
    { name: '♀', angle: 95, color: '#FF69B4', isConjunct: true },
    { name: '♂', angle: 310, color: '#FF4444', isConjunct: false },
  ];

  const cx = 180, cy = 180, natalR = 130, transitR = 165;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f0f2e 0%, #1a1a3e 100%)',
      borderRadius: '16px', padding: '24px',
      border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center',
    }}>
      <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
        🔮 Transit Overlay
      </h3>
      <svg width="360" height="360" viewBox="0 0 360 360">
        {/* Natal ring */}
        <circle cx={cx} cy={cy} r={natalR} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        {/* Transit ring */}
        <circle cx={cx} cy={cy} r={transitR} fill="none" stroke="rgba(107,61,225,0.4)" strokeWidth="2" strokeDasharray="4 4" />

        {/* Zodiac signs around */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30 + 15) * Math.PI / 180;
          const r = 150;
          const x = cx + r * Math.sin(angle);
          const y = cy - r * Math.cos(angle);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              fill="rgba(255,255,255,0.25)" fontSize="10">
              {['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'][i]}
            </text>
          );
        })}

        {/* Natal planets (inner ring) */}
        {natalPlanets.map((p, i) => {
          const rad = (p.angle - 90) * Math.PI / 180;
          const x = cx + natalR * Math.cos(rad);
          const y = cy + natalR * Math.sin(rad);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="8" fill={p.color} opacity="0.8" />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                fill="#000" fontSize="8" fontWeight="bold">{p.name[0]}</text>
            </g>
          );
        })}

        {/* Transit planets (outer ring) */}
        {transitPlanets.map((p, i) => {
          const rad = (p.angle - 90) * Math.PI / 180;
          const x = cx + transitR * Math.cos(rad);
          const y = cy + transitR * Math.sin(rad);
          return (
            <g key={i}>
              {p.isConjunct && (
                <circle cx={x} cy={y} r="14" fill="none" stroke={p.color} strokeWidth="2" opacity="0.6">
                  <animate attributeName="r" values="10;18;10" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={y} r="10" fill={p.color} opacity="0.6" />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                fill="#fff" fontSize="12">{p.name}</text>
            </g>
          );
        })}

        {/* Conjunction lines */}
        {transitPlanets.filter(p => p.isConjunct).map((p, i) => {
          const nRad = (natalPlanets.find(np => np.color === p.color)?.angle ?? 0) - 90;
          const tRad = p.angle - 90;
          const x1 = cx + natalR * Math.cos(nRad * Math.PI / 180);
          const y1 = cy + natalR * Math.sin(nRad * Math.PI / 180);
          const x2 = cx + transitR * Math.cos(tRad * Math.PI / 180);
          const y2 = cy + transitR * Math.sin(tRad * Math.PI / 180);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={p.color} strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />
          );
        })}

        <text x={cx} y={20} textAnchor="middle" fill="rgba(107,61,225,0.6)" fontSize="10">TRANSIT</text>
        <text x={cx} y={cy + natalR + 16} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10">NATAL</text>
      </svg>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '8px' }}>
        ✦ Pulsing = conjunction with natal planet
      </p>
    </div>
  );
};

// ─── CosmicIdentityCard (inline mock) ──────────────────────────────
const CosmicIdentityCardDemo: React.FC = () => {
  const [_isAnimating, _setIsAnimating] = React.useState(true);
  const signs = [
    { label: 'Sun', sign: 'Gemini', emoji: '♊', element: 'Air', color: '#60a5fa' },
    { label: 'Moon', sign: 'Pisces', emoji: '♓', element: 'Water', color: '#818cf8' },
    { label: 'Rising', sign: 'Scorpio', emoji: '♏', element: 'Water', color: '#f87171' },
  ];

  return (
    <div style={{
      width: '360px', height: '480px', borderRadius: '20px', overflow: 'hidden',
      background: 'linear-gradient(135deg, rgba(127,29,29,0.8), rgba(30,27,75,0.8), rgba(30,58,138,0.8))',
      border: '1px solid rgba(255,255,255,0.1)', position: 'relative',
      boxShadow: '0 25px 50px rgba(0,0,0,0.5)', margin: '0 auto',
    }}>
      {/* Stars background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${1 + (i % 3)}px`, height: `${1 + (i % 3)}px`,
            borderRadius: '50%', background: 'white',
            top: `${(i * 7.3) % 100}%`, left: `${(i * 13.7) % 100}%`,
            opacity: 0.1 + (i % 5) * 0.1,
            animation: `twinkle ${2 + (i % 3)}s infinite alternate`,
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '32px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h3 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '4px', marginBottom: '8px' }}>
          YOUR COSMIC IDENTITY
        </h3>
        <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>
          ✨ Sefa ✨
        </h2>

        {/* Big Three */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          {signs.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${s.color}33, ${s.color}11)`,
                border: `2px solid ${s.color}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', marginBottom: '8px',
                boxShadow: `0 0 20px ${s.color}22`,
              }}>
                {s.emoji}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '2px' }}>{s.label}</div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{s.sign}</div>
              <div style={{
                fontSize: '9px', padding: '2px 8px', borderRadius: '10px',
                background: `${s.color}22`, color: `${s.color}`,
                display: 'inline-block', marginTop: '2px',
              }}>
                {s.element}
              </div>
            </div>
          ))}
        </div>

        {/* Fingerprint pattern */}
        <svg width="200" height="60" viewBox="0 0 200 60">
          {Array.from({ length: 12 }, (_, i) => {
            const y = 30 + Math.sin(i * 0.8) * 15;
            return (
              <circle key={i} cx={10 + i * 16} cy={y} r="3"
                fill={['#FFD700', '#C0C0C0', '#90EE90', '#FF69B4', '#FF4444', '#DDA0DD',
                  '#FFA500', '#4169E1', '#00CED1', '#FF6347', '#9370DB', '#3CB371'][i]}
                opacity="0.6" />
            );
          })}
          <line x1="10" y1="30" x2="190" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          {Array.from({ length: 11 }, (_, i) => {
            const y1 = 30 + Math.sin(i * 0.8) * 15;
            const y2 = 30 + Math.sin((i + 1) * 0.8) * 15;
            return (
              <line key={i} x1={10 + i * 16} y1={y1} x2={10 + (i + 1) * 16} y2={y2}
                stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            );
          })}
        </svg>

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginTop: '16px' }}>
          astroverse.app
        </p>
      </div>
    </div>
  );
};

// ─── OnboardingFlow (inline mock) ─────────────────────────────────
const OnboardingFlowDemo: React.FC = () => {
  const [step, _setStep] = React.useState(2); // Show reveal step

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f0f2e 0%, #1a1a3e 100%)',
      borderRadius: '16px', padding: '32px 24px',
      border: '1px solid rgba(255,255,255,0.1)', maxWidth: '400px', margin: '0 auto',
    }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            height: '4px', flex: 1, borderRadius: '2px',
            background: i <= step ? '#6b3de1' : 'rgba(255,255,255,0.1)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textAlign: 'center', marginBottom: '16px' }}>
        {step + 1} / 3
      </p>

      {/* Step content */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          Your cosmic blueprint is ready
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '32px' }}>
          We&apos;ve calculated your unique astrological profile
        </p>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(107,61,225,0.2)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '40px', margin: '0 auto 16px',
          boxShadow: '0 0 30px rgba(107,61,225,0.3)',
        }}>
          ✨
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px' }}>
          June 15, 1995
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '4px' }}>
          Istanbul, Turkey
        </p>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
        <button style={{
          background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)',
          fontSize: '14px', cursor: 'pointer', padding: '12px 24px',
        }}>← Back</button>
        <button style={{
          background: 'linear-gradient(90deg, #6b3de1, #8b5cf6)',
          border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold',
          fontSize: '14px', cursor: 'pointer', padding: '12px 28px',
          boxShadow: '0 4px 20px rgba(107,61,225,0.5)',
        }}>Reveal My Chart ✨</button>
      </div>
    </div>
  );
};

// ─── Main Demo Page ────────────────────────────────────────────────
const VisualDemo: React.FC = () => {
  return (
    <div style={{
      background: '#0a0a1a',
      minHeight: '100vh',
      padding: '40px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          color: '#fff', fontSize: '32px', fontWeight: 'bold',
          textAlign: 'center', marginBottom: '8px',
        }}>
          AstroVerse — Phase 2 Visual Showcase
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.4)', fontSize: '14px',
          textAlign: 'center', marginBottom: '48px',
        }}>
          Time-Travel Slider • Transit Overlay • Cosmic ID Card • Onboarding
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* TimeTravelSlider */}
          <section>
            <TimeTravelSliderDemo />
          </section>

          {/* TransitOverlay */}
          <section>
            <TransitOverlayDemo />
          </section>

          {/* CosmicIdentityCard */}
          <section style={{ display: 'flex', justifyContent: 'center' }}>
            <CosmicIdentityCardDemo />
          </section>

          {/* Onboarding */}
          <section>
            <OnboardingFlowDemo />
          </section>
        </div>
      </div>
    </div>
  );
};

export default VisualDemo;
