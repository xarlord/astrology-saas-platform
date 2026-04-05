/**
 * Daily Briefing Page Component
 *
 * Mobile-first daily astrological briefing layout shown after login.
 * Displays moon phase, daily theme, top transits, notification preferences,
 * and energy overview in a scrollable single-column layout.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
  Star,
  TrendingUp,
  Bell,
  Activity,
} from 'lucide-react';

// Hooks
import { useAuth } from '../hooks/useAuth';

// Components
import { AppLayout } from '../components';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

interface MoonPhaseData {
  icon: string;
  phase: string;
  illumination: number;
  sign: string;
  keywords: string[];
}

const MOCK_MOON_PHASE: MoonPhaseData = {
  icon: 'dark_mode',
  phase: 'Waxing Gibbous',
  illumination: 72,
  sign: 'Taurus',
  keywords: ['calming', 'sensual', 'grounded'],
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

type TransitBadge = 'favorable' | 'challenging' | 'major';

interface TransitCardData {
  planet: string;
  sign: string;
  description: string;
  badge: TransitBadge;
  emoji: string;
}

const MOCK_TRANSITS: TransitCardData[] = [
  {
    planet: 'Venus',
    sign: 'Pisces',
    description:
      'Heightened romance and creativity. Sensitivity is amplified across relationships.',
    badge: 'favorable',
    emoji: 'star',
  },
  {
    planet: 'Mars',
    sign: 'Gemini',
    description: 'Mental energy peaks today. Communication is sharp and persuasive.',
    badge: 'major',
    emoji: 'bolt',
  },
  {
    planet: 'Neptune',
    sign: 'Pisces',
    description: 'Dreamy intuition. Boundaries soften � trust your inner voice.',
    badge: 'challenging',
    emoji: 'water',
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
// Badge color helper
// ---------------------------------------------------------------------------

const badgeStyles: Record<TransitBadge, string> = {
  favorable: 'bg-emerald-500/20 text-emerald-300',
  challenging: 'bg-amber-500/20 text-amber-300',
  major: 'bg-primary/30 text-white',
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

      <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-6 pb-24">
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
            <ArrowLeft className="w-[18px] h-[18px]" />
            Back
          </button>

          <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
            <Sparkles className="w-[18px] h-[18px] text-primary" />
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
            <Sun className="w-4 h-4" />
            {CURRENT_SEASON}
          </p>
        </motion.header>

        {/* ---- Moon Phase Card ---- */}
        <motion.section
          aria-label="Moon phase"
          className="bg-[#141627]/70 backdrop-blur-md border border-white/10 rounded-2xl p-5 mb-5"
          initial="hidden"
          animate="visible"
          custom={1}
          variants={cardVariants}
          data-testid="briefing-moon-phase"
        >
          <div className="flex items-start gap-4">
            <Moon className="w-10 h-10 text-yellow-100" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-lg leading-tight">{moonPhase.phase}</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                {moonPhase.illumination}% illumination
              </p>
              <p className="text-slate-300 text-sm mt-0.5">Moon in {moonPhase.sign}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {moonPhase.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="bg-[#1e2136] text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full border border-white/5"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

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
            <Star className="w-[18px] h-[18px] text-primary" />
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
            <TrendingUp className="w-[18px] h-[18px] text-primary" />
            Top Transits Today
          </h2>
        </motion.div>

        <div className="space-y-3 mb-6" data-testid="briefing-transits-list">
          {MOCK_TRANSITS.map((transit, i) => (
            <motion.section
              key={transit.planet}
              aria-label={`${transit.planet} transit`}
              className="bg-[#141627]/70 backdrop-blur-md border border-white/10 rounded-2xl p-4"
              initial="hidden"
              animate="visible"
              custom={4 + i}
              variants={cardVariants}
              data-testid={`briefing-transit-${transit.planet.toLowerCase()}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-slate-300" />
                    <span className="text-white font-bold text-sm">{transit.planet}</span>
                    <ArrowRight className="w-5 h-5" />
                    <span className="text-white font-bold text-sm">{transit.sign}</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                    {transit.description}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    badgeStyles[transit.badge]
                  }`}
                >
                  {transit.badge}
                </span>
              </div>
            </motion.section>
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
              <Bell className="w-[18px] h-[18px] text-primary" />
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
              <Activity className="w-[18px] h-[18px] text-primary" />
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

        {/* ---- Footer Brand ---- */}
        <motion.footer
          className="text-center py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <p className="text-slate-500 text-sm flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-primary" />
            AstroVerse
          </p>
        </motion.footer>
      </div>
    </AppLayout>
  );
};

export default DailyBriefingPage;
