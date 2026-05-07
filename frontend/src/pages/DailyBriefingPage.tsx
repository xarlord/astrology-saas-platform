/**
 * Daily Briefing Page Component
 *
 * Mobile-first daily astrological briefing layout shown after login.
 * Displays moon phase, daily theme, top transits, notification preferences,
 * and energy overview in a scrollable single-column layout.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// Hooks
import { useAuth } from '../hooks/useAuth';
import { useTodayTransits } from '../hooks';

// Components
import { AppLayout } from '../components';
import MoonPhaseCard from '../components/astrology/MoonPhaseCard';
import TransitTimelineCard from '../components/astrology/TransitTimelineCard';
import type { MoonPhaseType } from '../components/astrology/MoonPhaseCard';
import type { TransitType } from '../components/astrology/TransitTimelineCard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MoonPhaseData {
  phase: MoonPhaseType;
  illumination: number;
  sign: string;
}

const DEFAULT_MOON_PHASE: MoonPhaseData = {
  phase: 'new',
  illumination: 0,
  sign: 'Aries',
};

interface DailyThemeData {
  title: string;
  transit: string;
  description: string;
}

const DEFAULT_DAILY_THEME: DailyThemeData = {
  title: 'Daily Transit Overview',
  transit: '',
  description: 'Check your transits for today\'s cosmic weather.',
};

interface TransitCardData {
  time: string;
  title: string;
  description: string;
  type: TransitType;
  tags: string[];
}

const DEFAULT_TRANSITS: TransitCardData[] = [];

interface EnergyBarData {
  label: string;
  value: number;
  color: string;
}

const DEFAULT_ENERGY: EnergyBarData[] = [
  { label: 'Physical', value: 50, color: 'bg-emerald-500' },
  { label: 'Emotional', value: 50, color: 'bg-blue-500' },
  { label: 'Mental', value: 50, color: 'bg-amber-400' },
  { label: 'Spiritual', value: 50, color: 'bg-purple-500' },
];

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Aries Season';
  if (month >= 5 && month <= 7) return 'Cancer Season';
  if (month >= 8 && month <= 10) return 'Libra Season';
  return 'Capricorn Season';
}

const CURRENT_SEASON = getCurrentSeason();

// ---------------------------------------------------------------------------
// Priority Areas (static defaults — will be derived from transit scores)
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

const PRIORITY_AREAS: PriorityArea[] = [
  {
    key: 'love',
    label: 'Love',
    icon: 'favorite',
    score: 50,
    trend: 'stable',
    accentBg: 'bg-pink-500/10',
    accentText: 'text-pink-400',
  },
  {
    key: 'career',
    label: 'Career',
    icon: 'work',
    score: 50,
    trend: 'stable',
    accentBg: 'bg-amber-500/10',
    accentText: 'text-amber-400',
  },
  {
    key: 'health',
    label: 'Health',
    icon: 'self_improvement',
    score: 50,
    trend: 'stable',
    accentBg: 'bg-emerald-500/10',
    accentText: 'text-emerald-400',
  },
  {
    key: 'growth',
    label: 'Growth',
    icon: 'school',
    score: 50,
    trend: 'stable',
    accentBg: 'bg-blue-500/10',
    accentText: 'text-blue-400',
  },
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

  // Fetch real transit data
  const { data: transitData, isLoading } = useTodayTransits();

  // Derive moon phase from transit data
  const moonPhase: MoonPhaseData = useMemo(() => {
    if (!transitData?.moonPhase) return DEFAULT_MOON_PHASE;
    return {
      phase: transitData.moonPhase.phase as MoonPhaseType,
      illumination: Math.round(transitData.moonPhase.illumination),
      sign: 'Moon',
    };
  }, [transitData]);

  // Derive daily theme from major aspects
  const dailyTheme: DailyThemeData = useMemo(() => {
    if (!transitData?.majorAspects?.length) return DEFAULT_DAILY_THEME;
    const top = transitData.majorAspects[0];
    return {
      title: `${top.planet1} ${top.type} ${top.planet2}`,
      transit: `${top.planet1} ${top.type} ${top.planet2}`,
      description: `Active transit with ${top.orb.toFixed(1)}° orb.`,
    };
  }, [transitData]);

  // Derive transit cards from major aspects
  const transitCards: TransitCardData[] = useMemo(() => {
    if (!transitData?.majorAspects?.length) return DEFAULT_TRANSITS;
    return transitData.majorAspects.slice(0, 5).map((a) => ({
      time: 'Today',
      title: `${a.planet1} ${a.type} ${a.planet2}`,
      description: `${a.applying ? 'Applying' : 'Separating'} aspect with ${a.orb.toFixed(1)}° orb.`,
      type: (['trine', 'sextile'].includes(a.type) ? 'favorable' : ['square', 'opposition'].includes(a.type) ? 'challenging' : 'major') as TransitType,
      tags: [a.planet1, a.planet2],
    }));
  }, [transitData]);

  const energyData = DEFAULT_ENERGY;

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

      <div
        ref={scrollRef}
        className="max-w-[860px] mx-auto px-4 sm:px-6 py-6 pb-24 overflow-y-auto max-h-[calc(100vh-4rem)]"
      >
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
            {PRIORITY_AREAS.map((area) => (
              <div
                key={area.key}
                className={`${area.accentBg} bg-[#141627]/70 backdrop-blur-md border border-white/10 rounded-xl p-4 min-w-[90px] min-h-[100px] flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform cursor-default`}
              >
                <span className={`material-symbols-outlined text-[24px] ${area.accentText}`}>
                  {area.icon}
                </span>
                <span className="text-xs text-slate-400 mt-1">{area.label}</span>
                <span className={`text-xl font-bold ${scoreColor(area.score)}`}>{area.score}</span>
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
        <motion.div
          initial="hidden"
          animate="visible"
          custom={4}
          variants={cardVariants}
          data-testid="briefing-transits-heading"
        >
          <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">trending_up</span>
            Top Transits Today
          </h2>
        </motion.div>

        <div className="space-y-2 mb-6" data-testid="briefing-transits-list">
          {transitCards.map((transit) => (
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
              <span className="material-symbols-outlined text-[18px] text-primary">
                notifications
              </span>
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
              <span className="material-symbols-outlined text-[18px] text-primary">
                monitor_heart
              </span>
              <h2 className="text-white font-bold text-sm">Energy Overview</h2>
            </div>
            <div className="space-y-3">
              {energyData.map((bar) => (
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
            <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">
              arrow_forward
            </span>
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
