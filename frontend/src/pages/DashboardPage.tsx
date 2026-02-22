/**
 * Dashboard Page Component
 *
 * Main dashboard with energy meters, moon phase, recent charts, and transits
 * Reference: stitch-UI/desktop/04-dashboard.html
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Hooks
import { useAuth } from '../hooks/useAuth';
import { useCharts } from '../hooks/useCharts';
import { useTransits } from '../hooks/useTransits';

// Components
import EnergyMeter from '../components/astrology/EnergyMeter';
import TransitTimelineCard from '../components/astrology/TransitTimelineCard';
import { Button } from '../components/ui/Button';

// Mock daily quote data
const DAILY_QUOTES = [
  { text: "The stars don't dictate your fate, they illuminate the path you choose.", author: "Cosmic Wisdom" },
  { text: "Today's cosmic energy supports new beginnings and bold decisions.", author: "AstroGuide" },
  { text: "Trust your intuition - the Moon's position enhances your inner knowing.", author: "Lunar Insight" },
  { text: "Mercury's alignment brings clarity to communication and thought.", author: "Mercury Messenger" },
];

const getZodiacSymbol = (sign: string): string => {
  const symbols: Record<string, string> = {
    Aries: 'sunny', Taurus: 'dark_mode', Gemini: 'bedtime',
    Cancer: 'water_drop', Leo: 'whatshot', Virgo: 'spa',
    Libra: 'balance', Scorpio: 'scorpion', Sagittarius: 'explore',
    Capricorn: 'terrain', Aquarius: 'air', Pisces: 'waves'
  };
  return symbols[sign] ?? 'circle';
};

// Energy level calculation helper
const calculateEnergyLevels = (transitsCount: number): {
  physical: number;
  emotional: number;
  mental: number;
  spiritual: number;
} => {
  // Simplified calculation - in production, use actual astrology algorithms
  const baseEnergy = 50;
  const transitBonus = transitsCount * 5;

  return {
    physical: Math.min(100, baseEnergy + transitBonus + Math.floor(Math.random() * 20)),
    emotional: Math.min(100, baseEnergy + transitBonus + Math.floor(Math.random() * 20)),
    mental: Math.min(100, baseEnergy + transitBonus + Math.floor(Math.random() * 20)),
    spiritual: Math.min(100, baseEnergy + transitBonus + Math.floor(Math.random() * 20)),
  };
};

// Dashboard Page Component
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { charts, isLoading: chartsLoading } = useCharts();
  const { transits, loadTodayTransits, isLoading: transitsLoading } = useTransits();

  const [energyLevels, setEnergyLevels] = useState({
    physical: 72,
    emotional: 65,
    mental: 80,
    spiritual: 58,
  });

  const [dailyQuote] = useState(() =>
    DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)]
  );

  const [moonPhase] = useState({
    phase: 'waxing-gibbous' as const,
    illumination: 72,
    sign: 'Taurus',
  });

  useEffect(() => {
    // Load today's transits
    void loadTodayTransits();
  }, [loadTodayTransits]);

  // Calculate energy levels based on transits
  useEffect(() => {
    const levels = calculateEnergyLevels(transits.length);
    setEnergyLevels(levels);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transits.length]);

  // Get recent charts (first 3)
  const recentCharts = useMemo(() => charts.slice(0, 3), [charts]);

  // Get upcoming transits (first 5)
  const upcomingTransits = useMemo(() => transits.slice(0, 5), [transits]);

  // Get moon sign from first chart
  const moonSign = useMemo(() => {
    if (recentCharts[0]?.calculated_data?.planets) {
      const moon = recentCharts[0].calculated_data.planets.find((p: { name: string }) => p.name === 'Moon');
      return moon?.sign ?? 'Taurus';
    }
    return 'Taurus';
  }, [recentCharts]);

  const handleCreateChart = () => navigate('/charts/new');
  const handleViewCalendar = () => navigate('/calendar');
  const handleSynastry = () => navigate('/synastry');
  const handleChartClick = (chartId: string) => navigate(`/charts/${chartId}`);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarGradient = (index: number): string => {
    const gradients = [
      'from-indigo-500 to-purple-600',
      'from-slate-700 to-slate-800',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-600',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] to-[#141627] text-slate-100">
      {/* Header */}
      <header className="border-b border-[#2f2645] bg-[#141627]/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 bg-gradient-to-br from-primary to-[#8b5cf6] rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">AstroVerse</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              onClick={handleCreateChart}
              leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}
              data-testid="new-chart-header-button"
            >
              New Chart
            </Button>
            <div className="relative group">
              <button
                className="flex items-center gap-3 pl-2 cursor-pointer group-hover:opacity-80 transition-opacity"
                aria-label="User menu"
              >
                <div
                  className="size-10 rounded-full bg-cover bg-center border-2 border-white/10 group-hover:border-primary transition-colors"
                  style={{ backgroundImage: user?.avatar_url ? `url(${user.avatar_url})` : undefined }}
                >
                  {!user?.avatar_url && (
                    <div className={`size-full rounded-full bg-gradient-to-br ${getAvatarGradient(0)} flex items-center justify-center text-white text-xs font-bold`}>
                      {getInitials(user?.name ?? 'User')}
                    </div>
                  )}
                </div>
              </button>
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-[#1a1d2e] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white">{user?.name ?? 'User'}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email ?? ''}</p>
                  </div>
                  <button
                    onClick={() => { void handleLogout(); }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                    data-testid="logout-button"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8 pb-20">
        {/* Welcome Section */}
        <motion.header
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary text-sm font-medium tracking-wider uppercase mb-1">
              <span className="material-symbols-outlined text-[16px]">wb_twilight</span>
              Daily Insights
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Welcome back, {user?.name ?? 'Stargazer'} ✨
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl">
              {dailyQuote.text}
            </p>
            {dailyQuote.author && (
              <p className="text-sm text-slate-500 italic">— {dailyQuote.author}</p>
            )}
          </div>

          {/* Moon Phase Display */}
          <div className="flex items-center gap-3 bg-[#141627] border border-white/10 p-2 pr-5 rounded-2xl">
            <div className="bg-[#1e2136] p-2.5 rounded-xl text-yellow-100">
              <span className="material-symbols-outlined">dark_mode</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-sm font-bold text-white">
                {moonPhase.phase.replace('-', ' ')} in {moonSign}
              </span>
            </div>
          </div>
        </motion.header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Cosmic Weather (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Energy Meters Row */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {[
                { key: 'physical', label: 'Physical', value: energyLevels.physical, color: '#22c55e' },
                { key: 'emotional', label: 'Emotional', value: energyLevels.emotional, color: '#3b82f6' },
                { key: 'mental', label: 'Mental', value: energyLevels.mental, color: '#fbbf24' },
                { key: 'spiritual', label: 'Spiritual', value: energyLevels.spiritual, color: '#a855f7' },
              ].map((energy) => (
                <div
                  key={energy.key}
                  className="bg-[#141627]/70 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group hover:bg-[#1e2136]/70 transition-colors"
                >
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                  <h3 className="text-slate-300 text-xs font-medium mb-2 z-10">{energy.label}</h3>
                  <div className="relative z-10">
                    <EnergyMeter
                      value={energy.value}
                      size="sm"
                      label={energy.label}
                      showValue={true}
                      aria-label={`${energy.label} energy: ${energy.value}%`}
                    />
                  </div>
                  <p
                    className={`text-xs mt-2 flex items-center gap-1 z-10 ${
                      energy.value >= 70 ? 'text-emerald-400' :
                      energy.value >= 40 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {energy.value >= 70 ? 'trending_up' : energy.value >= 40 ? 'remove' : 'trending_down'}
                    </span>
                    {energy.value >= 70 ? 'High' : energy.value >= 40 ? 'Moderate' : 'Low'}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Highlight Card - Major Transit */}
            <motion.div
              className="relative rounded-2xl overflow-hidden p-6 flex flex-col justify-between min-h-[220px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              data-testid="major-transit-card"
            >
              <div className="absolute inset-0 z-0 bg-cover bg-center opacity-40" style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=1200&q=80")'
              }}></div>
              <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0B0D17] via-[#0B0D17]/80 to-transparent"></div>

              <div className="relative z-10 flex justify-between items-start">
                <div className="bg-primary/30 backdrop-blur-md px-3 py-1 rounded-lg border border-primary/40 text-xs font-bold text-white uppercase tracking-wider">
                  Major Transit
                </div>
              </div>

              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {upcomingTransits[0]?.title ?? 'Venus enters Pisces'}
                </h3>
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                  {upcomingTransits[0]?.description ?? 'A time of heightened sensitivity and romantic idealism. Creativity flows effortlessly under this transit.'}
                </p>
                <button className="flex items-center gap-2 text-white text-sm font-semibold hover:gap-3 transition-all group">
                  Read Forecast
                  <span className="material-symbols-outlined text-[18px] group-hover:text-primary transition-colors">arrow_forward</span>
                </button>
              </div>
            </motion.div>

            {/* Upcoming Transits */}
            <motion.div
              className="bg-[#141627]/70 backdrop-blur-md border border-white/10 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Upcoming Transits</h3>
                <button
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                  onClick={() => navigate('/transits')}
                  data-testid="view-all-transits-button"
                >
                  View All Transits
                </button>
              </div>

              <div className="space-y-4">
                {transitsLoading ? (
                  <div className="text-center py-8 text-slate-400">Loading transits...</div>
                ) : upcomingTransits.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">No upcoming transits</div>
                ) : (
                  upcomingTransits.map((transit, index) => (
                    <TransitTimelineCard
                      key={transit.id ?? index}
                      time={transit.start_date ? new Date(transit.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}
                      date={transit.start_date}
                      title={transit.title ?? 'Transit Event'}
                      description={transit.description ?? ''}
                      type={transit.type === 'major' ? 'major' : transit.impact === 'positive' ? 'favorable' : transit.impact === 'negative' ? 'challenging' : 'neutral'}
                      onClick={() => navigate('/transits')}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Charts & Quick Actions (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Your Charts Section */}
            <motion.div
              className="bg-[#141627] border border-white/10 rounded-2xl p-6 flex flex-col h-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Your Charts</h3>
                <button className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <span className="material-symbols-outlined text-[18px]">search</span>
                </button>
              </div>

              <div className="space-y-4 flex-1" data-testid="chart-list">
                {chartsLoading ? (
                  <div className="text-center py-8 text-slate-400">Loading charts...</div>
                ) : recentCharts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-4">No charts yet</p>
                    <Button
                      variant="primary"
                      onClick={handleCreateChart}
                      fullWidth
                      data-testid="create-first-chart-button"
                    >
                      Create Your First Chart
                    </Button>
                  </div>
                ) : (
                  <>
                    {recentCharts.map((chart, index) => (
                      <div
                        key={chart.id}
                        onClick={() => handleChartClick(chart.id)}
                        data-testid={`chart-card-${chart.id}`}
                        className="bg-[#0B0D17] p-4 rounded-xl border border-white/5 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-3xl"></div>

                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-full bg-gradient-to-br ${getAvatarGradient(index)} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                              {getInitials(chart.name)}
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-sm" data-testid={`chart-name-${chart.id}`}>{chart.name}</h4>
                              <span className="text-[10px] uppercase text-primary font-bold tracking-wide" data-testid={`chart-type-${chart.id}`}>
                                {chart.type ?? 'Birth Chart'}
                              </span>
                            </div>
                          </div>
                          <button className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`edit-chart-${chart.id}`}>
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {chart.calculated_data?.planets?.slice(0, 3).map((planet: { sign: string; name: string }) => (
                            <span
                              key={planet.name}
                              className="bg-[#1e2136] px-2 py-1 rounded text-[10px] text-slate-300 font-medium border border-white/5 flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[10px]">
                                {getZodiacSymbol(planet.sign)}
                              </span>
                              {planet.sign}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Create New Card */}
                    <button
                      onClick={handleCreateChart}
                      data-testid="create-new-chart-button"
                      className="w-full border border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-primary/50 transition-all group h-[110px]"
                    >
                      <div className="size-8 rounded-full bg-[#1e2136] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-slate-400">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                      </div>
                      <span className="text-sm font-medium text-slate-400 group-hover:text-white">
                        Create New Chart
                      </span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>

            {/* Quick Actions Grid */}
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <button
                onClick={handleViewCalendar}
                data-testid="calendar-quick-action"
                className="bg-[#141627]/70 backdrop-blur-md p-4 rounded-xl flex flex-col gap-3 hover:bg-white/10 transition-all group border border-white/5"
              >
                <div className="size-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <div className="text-left">
                  <h4 className="text-white font-bold text-sm">Calendar</h4>
                  <p className="text-slate-500 text-xs">Events & Phases</p>
                </div>
              </button>

              <button
                onClick={handleSynastry}
                data-testid="synastry-quick-action"
                className="bg-[#141627]/70 backdrop-blur-md p-4 rounded-xl flex flex-col gap-3 hover:bg-white/10 transition-all group border border-white/5"
              >
                <div className="size-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined">favorite_border</span>
                </div>
                <div className="text-left">
                  <h4 className="text-white font-bold text-sm">Synastry</h4>
                  <p className="text-slate-500 text-xs">Compatibility</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/lunar-returns')}
                data-testid="lunar-returns-quick-action"
                className="bg-[#141627]/70 backdrop-blur-md p-4 rounded-xl flex flex-col gap-3 hover:bg-white/10 transition-all group border border-white/5"
              >
                <div className="size-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined">refresh</span>
                </div>
                <div className="text-left">
                  <h4 className="text-white font-bold text-sm">Lunar Returns</h4>
                  <p className="text-slate-500 text-xs">Monthly Forecast</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/solar-returns')}
                data-testid="solar-returns-quick-action"
                className="bg-[#141627]/70 backdrop-blur-md p-4 rounded-xl flex flex-col gap-3 hover:bg-white/10 transition-all group border border-white/5"
              >
                <div className="size-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined">light_mode</span>
                </div>
                <div className="text-left">
                  <h4 className="text-white font-bold text-sm">Solar Returns</h4>
                  <p className="text-slate-500 text-xs">Yearly Outlook</p>
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
