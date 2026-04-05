/**
 * Daily Briefing Page Component
 *
 * Mobile-first daily astrological briefing layout shown after login.
 * Displays moon phase, daily theme, top transits, notification preferences,
 * and energy overview in a scrollable single-column layout.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// Hooks
import { useAuth } from '../hooks/useAuth';

// Components
import { AppLayout } from '../components';
import MoonPhaseCard from '../components/astrology/MoonPhaseCard';
import TransitTimelineCard from '../components/astrology/TransitTimelineCard';
import type { MoonPhaseType } from '../components/astrology/MoonPhaseCard';
import type { TransitType } from '../components/astrology/TransitTimelineCard';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

interface MoonPhaseData {
  phase: MoonPhaseType;
  illumination: number;
  sign: string;
}

const MOCK_MOON_PHASE: MoonPhaseData = {
  phase: 'waxing-gibbous',
  illumination: 72,
  sign: 'Taurus',
};

interface DailyThemeData {
  title: string;
  transit: string;
  description: string;
}

const MOCK_DAILY_THEME: DailyThemeData = {
  title: 'Embrace Change',
  transit: 'Uranus trine Sun',
  description:
    'invites innovation and breakthroughs. A powerful day to lean into the unexpected and let curiosity lead.',
};

interface TransitCardData {
  time: string;
  title: string;
  description: string;
  type: TransitType;
  tags: string[];
}

const MOCK_TRANSITS: TransitCardData[] = [
  {
    time: 'Today',
    title: 'Venus in Pisces',
    description:
      'Heightened romance and creativity. Sensitivity is amplified across relationships.',
    type: 'favorable',
    tags: ['Love', 'Creativity'],
  },
  {
    time: 'Today',
    title: 'Mars in Gemini',
    description: 'Mental energy peaks today. Communication is sharp and persuasive.',
    type: 'major',
    tags: ['Communication', 'Energy'],
  },
  {
    time: 'Tonight',
    title: 'Neptune in Pisces',
    description: 'Dreamy intuition. Boundaries soften — trust your inner voice.',
    type: 'challenging',
    tags: ['Intuition', 'Boundaries'],
  },
];

interface EnergyBarData {
  label: string;
  value: number;
  color: string;
}

const MOCK_ENERGY: EnergyBarData[] = [
  { label: 'Physical', value: 72, color: 'bg-emerald-500' },
  { label: 'Emotional', value: 65, color: 'bg-blue-500' },
  { label: 'Mental', value: 80, color: 'bg-amber-400' },
  { label: 'Spiritual', value: 58, color: 'bg-purple-500' },
];

const CURRENT_SEASON = 'Aries Season';

// ---------------------------------------------------------------------------
// Priority Areas mock data
// ---------------------------------------------------------------------------

interface PriorityArea {
  key: string;
  label: string;
  icon: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  accentBg: string;
  accentText: string;
}

const MOCK_PRIORITY_AREAS: PriorityArea[] = [
  { key: 'love', label: 'Love', icon: 'favorite', score: 82, trend: 'up', accentBg: 'bg-pink-500/10', accentText: 'text-pink-400' },
  { key: 'career', label: 'Career', icon: 'work', score: 65, trend: 'stable', accentBg: 'bg-amber-500/10', accentText: 'text-amber-400' },
  { key: 'health', label: 'Health', icon: 'self_improvement', score: 74, trend: 'up', accentBg: 'bg-emerald-500/10', accentText: 'text-emerald-400' },
  { key: 'growth', label: 'Growth', icon: 'school', score: 58, trend: 'down', accentBg: 'bg-blue-500/10', accentText: 'text-blue-400' },
];

const scoreColor = (s: number): string => {
  if (s >= 75) return 'text-emerald-400';
  if (s >= 50) return 'text-amber-400';
  return 'text-red-400';
};

const trendIcon = (t: PriorityArea['trend']): string => {
  if (t === 'up') return 'trending_up';
  if (t === 'down') return 'trending_down';
  return 'trending_flat';
};

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cardVariants: Record<string, any> = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.1, ease: 'easeOut' },
  }),
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DailyBriefingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMarkedViewed = useRef(false);

  const [moonPhase] = useState<MoonPhaseData>(MOCK_MOON_PHASE);
  const [dailyTheme] = useState<DailyThemeData>(MOCK_DAILY_THEME);

  // Notification toggle states
  const [notifications, setNotifications] = useState({
    dailyBriefing: true,
    transitAlerts: true,
    fullMoon: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Mark briefing as viewed for today
  const markBriefingViewed = useCallback(() => {
    if (hasMarkedViewed.current) return;
    hasMarkedViewed.current = true;
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('dailyBriefingLastViewed', today);
  }, []);

  // Dwell tracking: 30s timer + scroll-to-bottom detection
  useEffect(() => {
    // Start 30s dwell timer
    dwellTimerRef.current = setTimeout(() => {
      markBriefingViewed();
    }, 30_000);

    // Scroll-to-bottom detection
    const container = scrollRef.current;
    const handleScroll = () => {
      if (!container) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        markBriefingViewed();
      }
    };

    container?.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [markBriefingViewed]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <AppLayout>
      <Helmet>
        <title>Daily Briefing � AstroVerse</title>
      </Helmet>

      <div ref={scrollRef} className="max-w-[860px] mx-auto px-4 sm:px-6 py-6 pb-24 overflow-y-auto max-h-[calc(100vh-4rem)]">
        {/* ---- Top Bar ---- */}
        <motion.nav
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          data-testid="briefing-top-nav"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm"
            data-testid="briefing-back-button"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </button>

          <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
            <span className="material-symbols-outlined text-[18px] text-primary">auto_awesome</span>
            Briefing
          </span>
        </motion.nav>

        {/* ---- Welcome ---- */}
        <motion.header
          className="mb-8"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={cardVariants}
          data-testid="briefing-welcome"
        >
          <h1 className="text-2xl font-bold text-white leading-tight">
            {greeting()}, {user?.name ?? 'Stargazer'}
          </h1>
          <p className="text-primary font-medium mt-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">light_mode</span>
            {CURRENT_SEASON}
          </p>
        </motion.header>

        {/* ---- Moon Phase Card ---- */}
        <motion.div
          className="mb-5"
          initial="hidden"
          animate="visible"
          custom={1}
          variants={cardVariants}
        >
          <MoonPhaseCard
            phase={moonPhase.phase}
            illumination={moonPhase.illumination}
            sign={moonPhase.sign}
            size="sm"
            showAnimation={true}
          />
        </motion.div>

        {/* ---- Daily Theme Card ---- */}
        <motion.section
          aria-label="Daily theme"
          className="bg-gradient-to-br from-primary/10 via-[#141627]/70 to-purple-900/20 backdrop-blur-md border border-primary/20 rounded-2xl p-5 mb-5"
          initial="hidden"
          animate="visible"
          custom={2}
          variants={cardVariants}
          data-testid="briefing-daily-theme"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[18px] text-primary">star</span>
            <h2 className="text-slate-300 text-sm font-semibold uppercase tracking-wide">
              Today&apos;s Theme
            </h2>
          </div>
          <h3 className="text-white text-lg font-bold">{dailyTheme.title}</h3>
          <p className="text-primary text-sm font-medium mt-0.5">{dailyTheme.transit}</p>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">{dailyTheme.description}</p>
        </motion.section>

        {/* ---- Priority Areas ---- */}
        <motion.section
          aria-label="Priority areas"
          className="mb-5"
          initial="hidden"
          animate="visible"
          custom={3}
          variants={cardVariants}
        >
          <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Priority Areas
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {MOCK_PRIORITY_AREAS.map((area) => (
              <div
                key={area.key}
                className={`${area.accentBg} bg-[#141627]/70 backdrop-blur-md border border-white/10 rounded-xl p-4 min-w-[90px] min-h-[100px] flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform cursor-default`}
              >
                <span className={`material-symbols-outlined text-[24px] ${area.accentText}`}>
                  {area.icon}
                </span>
                <span className="text-xs text-slate-400 mt-1">{area.label}</span>
                <span className={`text-xl font-bold ${scoreColor(area.score)}`}>
                  {area.score}
                </span>
                <span
                  className={`material-symbols-outlined text-sm ${scoreColor(area.score)}`}
                  aria-label={area.trend}
                >
                  {trendIcon(area.trend)}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ---- Top Transits Section ---- */}
        <motion.div initial="hidden" animate="visible" custom={4} variants={cardVariants} data-testid="briefing-transits-heading">
          <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">trending_up</span>
            Top Transits Today
          </h2>
        </motion.div>

        <div className="space-y-2 mb-6" data-testid="briefing-transits-list">
          {MOCK_TRANSITS.map((transit) => (
            <TransitTimelineCard
              key={transit.title}
              time={transit.time}
              title={transit.title}
              description={transit.description}
              type={transit.type}
              tags={transit.tags}
              onClick={() => navigate('/transits')}
            />
          ))}
        </div>

        {/* ---- Desktop 2-col: Notification Prefs + Energy ---- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Notification Preferences */}
          <motion.section
            aria-label="Notification preferences"
            className="bg-[#141627]/70 backdrop-blur-md border border-white/10 rounded-2xl p-5"
            initial="hidden"
            animate="visible"
            custom={7}
            variants={cardVariants}
            data-testid="briefing-notification-prefs"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-primary">notifications</span>
              <h2 className="text-white font-bold text-sm">Notification Preferences</h2>
            </div>
            <div className="space-y-3">
              {(
                [
                  { key: 'dailyBriefing' as const, label: 'Daily briefing' },
                  { key: 'transitAlerts' as const, label: 'Transit alerts' },
                  { key: 'fullMoon' as const, label: 'Full moon' },
                ] as const
              ).map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-3">
                  <span className="text-slate-300 text-sm">{item.label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications[item.key]}
                    aria-label={item.label}
                    onClick={() => toggleNotification(item.key)}
                    data-testid={`briefing-toggle-${item.key}`}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#141627] ${
                      notifications[item.key] ? 'bg-primary' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Energy Overview */}
          <motion.section
            aria-label="Energy overview"
            className="bg-[#141627]/70 backdrop-blur-md border border-white/10 rounded-2xl p-5"
            initial="hidden"
            animate="visible"
            custom={8}
            variants={cardVariants}
            data-testid="briefing-energy-overview"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-primary">monitor_heart</span>
              <h2 className="text-white font-bold text-sm">Energy Overview</h2>
            </div>
            <div className="space-y-3">
              {MOCK_ENERGY.map((bar) => (
                <div key={bar.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 text-sm">{bar.label}</span>
                    <span className="text-slate-400 text-xs font-medium tabular-nums">
                      {bar.value}%
                    </span>
                  </div>
                  <div
                    className="h-2 w-full rounded-full bg-[#0B0D17]"
                    role="progressbar"
                    aria-valuenow={bar.value}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${bar.label} energy: ${bar.value}%`}
                  >
                    <motion.div
                      className={`h-2 rounded-full ${bar.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.value}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* ---- Navigation CTAs ---- */}
        <motion.section
          className="flex flex-col sm:flex-row gap-3 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        >
          <button
            onClick={() => navigate('/transits')}
            className="flex-1 flex items-center justify-center gap-2 bg-[#141627]/70 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3.5 text-slate-300 hover:text-white hover:border-primary/40 transition-all group"
            data-testid="briefing-view-transits"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">trending_up</span>
            <span className="font-semibold text-sm">View Full Transit Details</span>
            <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 rounded-2xl px-5 py-3.5 text-white font-semibold text-sm transition-colors"
            data-testid="briefing-go-dashboard"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Go to Dashboard
          </button>
        </motion.section>

        {/* ---- Footer Brand ---- */}
        <motion.footer
          className="text-center py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <p className="text-slate-500 text-sm flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
            AstroVerse
          </p>
        </motion.footer>
      </div>
    </AppLayout>
  );
};

export default DailyBriefingPage;
