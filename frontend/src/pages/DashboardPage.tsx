/**
 * Dashboard Page — Stitch UI Design
 * Rich dashboard: welcome header, cosmic energy meter, transit highlights,
 * planetary positions, upcoming transits, chart cards, quick actions
 */

import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useCharts, useTodayTransits, useTransitForecast } from '../hooks';
import { deriveHighlights } from '../utils/transitHelpers';
import { SkeletonGrid, SkeletonLoader, EmptyStates, AppLayout } from '../components';

const PLANET_META: Record<string, { icon: string; color: string }> = {
  Sun: { icon: 'sunny', color: 'text-gold' },
  Moon: { icon: 'bedtime', color: 'text-cosmic-blue' },
  Mercury: { icon: 'public', color: 'text-purple-400' },
  Venus: { icon: 'favorite', color: 'text-pink-400' },
  Mars: { icon: 'local_fire_department', color: 'text-red-400' },
  Jupiter: { icon: 'expansion', color: 'text-amber-400' },
  Saturn: { icon: 'hourglass_top', color: 'text-slate-200' },
  Uranus: { icon: 'bolt', color: 'text-cyan-400' },
  Neptune: { icon: 'water', color: 'text-blue-400' },
  Pluto: { icon: 'change_history', color: 'text-rose-400' },
};

function getMoonPhaseInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // Simple moon phase approximation
  const synodicMonth = 29.53059;
  const knownNewMoon = new Date(2000, 0, 6, 18, 14).getTime();
  const diff = (now.getTime() - knownNewMoon) / 86400000;
  const phase = ((diff % synodicMonth) + synodicMonth) % synodicMonth;

  let phaseName = 'New Moon';
  let sign = 'Aries';
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  sign = signs[Math.floor((now.getDate() * 1.3 + now.getMonth() * 2.7) % 12)];

  if (phase < 1.85) phaseName = 'New Moon';
  else if (phase < 7.38) phaseName = 'Waxing Crescent';
  else if (phase < 9.23) phaseName = 'First Quarter';
  else if (phase < 14.77) phaseName = 'Waxing Gibbous';
  else if (phase < 16.61) phaseName = 'Full Moon';
  else if (phase < 22.15) phaseName = 'Waning Gibbous';
  else if (phase < 23.99) phaseName = 'Last Quarter';
  else if (phase < 29.53) phaseName = 'Waning Crescent';

  return { phaseName, sign, dateStr };
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const GRADIENT_PAIRS = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-pink-500 to-rose-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { charts, fetchCharts, isLoading } = useCharts();
  const { data: todayTransits, isFetching: transitsFetching } = useTodayTransits();
  const { data: forecastData } = useTransitForecast('week');
  const transitsLoading = transitsFetching && !todayTransits;

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchCharts();
  }, [isAuthenticated, fetchCharts]);

  const moon = getMoonPhaseInfo();
  const transitPlanets = todayTransits?.transitPlanets;
  const planetEntries: [string, { sign: string; degree: number; longitude: number; speed: number; retrograde: boolean }][] = transitPlanets
    ? Object.entries(transitPlanets).slice(0, 4) as [string, { sign: string; degree: number; longitude: number; speed: number; retrograde: boolean }][]
    : [
        ['Sun', { sign: 'Scorpio', degree: 2.24, longitude: 212, speed: 1, retrograde: false }],
        ['Moon', { sign: 'Taurus', degree: 14.09, longitude: 44, speed: 13, retrograde: false }],
        ['Mercury', { sign: 'Libra', degree: 28.55, longitude: 208, speed: 1, retrograde: false }],
        ['Venus', { sign: 'Virgo', degree: 5.21, longitude: 175, speed: 1, retrograde: false }],
      ];

  const highlights = useMemo(() => deriveHighlights(todayTransits), [todayTransits]);

  const energyScore = useMemo(() => {
    const transits = todayTransits?.transits;
    if (!transits || transits.length === 0) return 50;
    let score = 50;
    for (const t of transits) {
      const orb = Math.abs(t.orb);
      if (orb > 5) continue;
      const weight = Math.max(0, 5 - orb);
      const aspect = t.aspect.toLowerCase();
      if (aspect.includes('trine') || aspect.includes('sextile') || aspect.includes('conjunction')) {
        score += weight * 3;
      } else if (aspect.includes('square') || aspect.includes('opposition')) {
        score -= weight * 2;
      } else {
        score += weight;
      }
    }
    return Math.max(10, Math.min(95, Math.round(score)));
  }, [todayTransits]);

  const energyLabel = energyScore >= 70 ? 'High Vitality' : energyScore >= 40 ? 'Moderate Energy' : 'Low Energy';
  const energyColor = energyScore >= 70 ? 'text-emerald-400' : energyScore >= 40 ? 'text-amber-400' : 'text-rose-400';
  const energyIcon = energyScore >= 70 ? 'trending_up' : energyScore >= 40 ? 'trending_flat' : 'trending_down';

  const cosmicOverview = useMemo(() => {
    if (highlights.length > 0) {
      const top = highlights[0];
      const intensityWord = (top.intensity ?? 5) >= 7 ? 'Intense' : (top.intensity ?? 5) >= 4 ? 'Dynamic' : 'Gentle';
      return `Cosmic Overview: ${intensityWord} energy today. ${top.title} — ${top.description}.`;
    }
    const phase = todayTransits?.moonPhase?.phase;
    if (phase) return `Cosmic Overview: The Moon is in ${phase} phase. A day for reflection and inner alignment.`;
    return `Cosmic Overview: ${moon.phaseName} in ${moon.sign}. Set intentions aligned with the current lunar energy.`;
  }, [highlights, todayTransits, moon]);

  interface ForecastItem {
    badge: string;
    icon: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    month: string;
    day: string;
    name: string;
    desc: string;
  }

  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
  const forecastItems: ForecastItem[] = useMemo(() => {
    if (!forecastData || !Array.isArray(forecastData) || forecastData.length === 0) return [];

    // Flatten TransitReading[] into individual transit entries with date info
    const entries = forecastData.flatMap((reading) =>
      (reading.transits ?? []).map((t) => ({
        date: reading.date,
        type: t.aspect,
        planet1: t.transitPlanet,
        planet2: t.natalPlanet,
        orb: t.orb,
        intensity: Math.max(1, Math.round(10 - Math.abs(t.orb))),
      }))
    );

    if (entries.length === 0) return [];

    const classifyAspect = (type: string) => {
      const t = type.toLowerCase();
      if (t.includes('trine') || t.includes('sextile')) return {
        badge: 'Favorable', icon: 'check_circle', iconColor: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/10', badgeText: 'text-emerald-400', badgeBorder: 'border-emerald-500/20',
      };
      if (t.includes('square') || t.includes('opposition')) return {
        badge: 'Challenging', icon: 'warning', iconColor: 'text-rose-400',
        badgeBg: 'bg-rose-500/10', badgeText: 'text-rose-400', badgeBorder: 'border-rose-500/20',
      };
      return {
        badge: 'Neutral', icon: 'info', iconColor: 'text-blue-400',
        badgeBg: 'bg-blue-500/10', badgeText: 'text-blue-400', badgeBorder: 'border-blue-500/20',
      };
    };

    return entries.slice(0, 4).map((entry) => {
      const d = new Date(entry.date);
      const monthStr = d.toLocaleString('en', { month: 'short' });
      const dayStr = String(d.getDate()).padStart(2, '0');
      const classification = classifyAspect(entry.type);
      return {
        ...classification,
        month: monthStr,
        day: dayStr,
        name: `${entry.planet1} ${entry.type} ${entry.planet2}`,
        desc: `Orb: ${entry.orb.toFixed(1)}° · Intensity: ${entry.intensity}/10`,
      };
    });
  }, [forecastData]);
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

  const majorTransit: ForecastItem | null = forecastItems.length > 0 ? forecastItems[0] : null;

  return (
    <AppLayout>
      <div data-testid="dashboard" className="relative pb-8">
        {/* ===== Welcome Section ===== */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary text-sm font-medium tracking-wider uppercase mb-1">
              <span className="material-symbols-outlined text-base" aria-hidden="true">wb_twilight</span>
              Daily Insights
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight gradient-text">
              Welcome back, {user?.name?.split(' ')[0] ?? 'Traveler'}
            </h1>
            <p className="text-slate-200 text-lg max-w-2xl">
              {cosmicOverview}
            </p>
          </div>

          {/* Moon Phase Card */}
          <div className="flex items-center gap-3 bg-cosmic-card-solid border border-white/15 p-2 pr-5 rounded-2xl shrink-0">
            <div className="bg-surface-light p-2.5 rounded-xl text-yellow-100">
              <span className="material-symbols-outlined" aria-hidden="true">dark_mode</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-200 font-medium uppercase tracking-wide">{moon.dateStr}</span>
              <span className="text-sm font-bold text-white">{moon.phaseName} in {moon.sign}</span>
            </div>
          </div>
        </header>

        {/* ===== Dashboard Grid ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN — Cosmic Weather (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Today's Highlights Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Energy Meter */}
              {transitsLoading ? (
                <div className="glass-panel p-6 rounded-2xl">
                  <SkeletonLoader variant="card" />
                </div>
              ) : (
              <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                <h3 className="text-slate-200 text-sm font-medium mb-2 z-10">Cosmic Energy</h3>
                <div className="relative size-32 z-10">
                  <svg className="text-primary" viewBox="0 0 36 36" aria-hidden="true">
                    <path
                      className="fill-none stroke-white/5"
                      strokeWidth="2.5"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="fill-none stroke-current animate-progress"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={`${energyScore}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold text-white">{energyScore}</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-200">/100</span>
                  </div>
                </div>
                <p className={`text-xs ${energyColor} mt-2 flex items-center gap-1 z-10`}>
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">{energyIcon}</span>
                  {energyLabel}
                </p>
              </div>
              )}
              <div className="md:col-span-2 relative rounded-2xl overflow-hidden p-6 flex flex-col justify-between min-h-[220px]">
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/20 via-cosmic-blue/10 to-transparent" />
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-cosmic-page via-cosmic-page/80 to-transparent" />
                <div className="relative z-10 flex justify-between items-start">
                  <div className="bg-primary/30 backdrop-blur-md px-3 py-1 rounded-lg border border-primary/40 text-xs font-bold text-white uppercase tracking-wider">
                    Major Transit
                  </div>
                </div>
                <div className="relative z-10 mt-auto">
                  <h3 className="text-2xl font-bold text-white mb-1">{majorTransit ? majorTransit.name : 'No major transits today'}</h3>
                  <p className="text-slate-200 text-sm mb-4 line-clamp-2">
                    {majorTransit ? majorTransit.desc : 'The skies are quiet. A good day for rest and reflection.'}
                  </p>
                  <Link
                    to="/transits"
                    className="flex items-center gap-2 text-white text-sm font-semibold hover:gap-3 transition-all group"
                  >
                    Read Forecast
                    <span className="material-symbols-outlined text-lg group-hover:text-primary transition-colors" aria-hidden="true">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Planetary Positions Grid */}
            {transitsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => <SkeletonLoader key={i} variant="card" />)}
              </div>
            ) : (
            <div className="bg-cosmic-card-solid border border-white/15 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Current Positions</h3>
                <Link to="/ephemeris" className="text-xs font-medium text-primary hover:text-lavender transition-colors">
                  View Ephemeris
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {planetEntries.map(([name, pData]) => {
                  const meta = PLANET_META[name] ?? { icon: 'circle', color: 'text-slate-200' };
                  return (
                    <div
                      key={name}
                      role="button"
                      tabIndex={0}
                      aria-label={`${name} in ${pData.sign ?? 'unknown'} at ${pData.degree != null ? pData.degree.toFixed(2) : (pData.longitude ?? 0).toFixed(2)} degrees`}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/ephemeris'); } }}
                      className="bg-cosmic-page/50 border border-white/15 p-4 rounded-xl flex flex-col gap-3 group hover:border-primary/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-200 text-sm font-medium">{name}</span>
                        <span className={`material-symbols-outlined ${meta.color}`} aria-hidden="true">{meta.icon}</span>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-white">{pData.sign ?? '—'}</div>
                        <div className="text-xs text-slate-200 font-mono">
                          {pData.degree != null
                            ? `${pData.degree.toFixed(2)}°`
                            : `${(pData.longitude ?? 0).toFixed(2)}°`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            )}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Upcoming Transits</h3>
                <Link to="/transits" className="text-sm text-slate-200 hover:text-white transition-colors">
                  View All Transits
                </Link>
              </div>
              {transitsLoading ? (
                <div className="space-y-4">
                  {[0, 1, 2].map((i) => <SkeletonLoader key={i} variant="list" />)}
                </div>
              ) : (
              <div className="space-y-4">
                {(forecastItems.length > 0 ? forecastItems : [
                  { month: moon.dateStr.slice(5, 7), day: moon.dateStr.slice(8, 10), name: 'Awaiting forecast data', desc: 'Transit forecast will appear here once available.', icon: 'hourglass_empty' as const, iconColor: 'text-slate-200', badge: 'Pending', badgeBg: 'bg-slate-500/10', badgeText: 'text-slate-200', badgeBorder: 'border-slate-500/20' },
                ]).map((transit) => (
                  <div
                    key={transit.name}
                    role="button"
                    tabIndex={0}
                    aria-label={`${transit.name}: ${transit.desc}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/transits'); } }}
                    className="flex items-center gap-4 p-3 hover:bg-white/15 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-white/15"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[50px] text-center">
                      <span className="text-xs font-bold text-slate-200 uppercase">{transit.month}</span>
                      <span className="text-lg font-bold text-white">{transit.day}</span>
                    </div>
                    <div className="size-10 rounded-full bg-cosmic-card-solid flex items-center justify-center border border-white/15">
                      <span className={`material-symbols-outlined text-xl ${transit.iconColor}`} aria-hidden="true">{transit.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">{transit.name}</h4>
                      <p className="text-slate-200 text-xs">{transit.desc}</p>
                    </div>
                    <span className={`px-2 py-1 ${transit.badgeBg} ${transit.badgeText} text-[10px] font-bold uppercase tracking-wide rounded border ${transit.badgeBorder}`}>
                      {transit.badge}
                    </span>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN — Charts & Quick Actions (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Your Charts Section */}
            <div className="bg-cosmic-card-solid border border-white/15 rounded-2xl p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Your Charts</h3>
                <Link
                  to="/charts/new"
                  className="size-8 rounded-lg bg-white/15 flex items-center justify-center text-slate-200 hover:text-white hover:bg-white/15 transition-all"
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">add</span>
                </Link>
              </div>

              <div className="space-y-4 flex-1">
                {isLoading ? (
                  <SkeletonGrid count={2} />
                ) : charts.length === 0 ? (
                  <EmptyStates.NoCharts onAction={() => navigate('/charts/new')} />
                ) : (
                  <>
                    {charts.slice(0, 3).map((chart, i) => (
                      <div
                        key={chart.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/charts/${chart.id}`)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/charts/${chart.id}`); } }}
                        aria-label={`View chart: ${chart.name}`}
                        data-testid="chart-card"
                        className="bg-cosmic-page p-4 rounded-xl border border-white/15 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-3xl" />
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-full bg-gradient-to-br ${GRADIENT_PAIRS[i % GRADIENT_PAIRS.length]} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                              {getInitials(chart.name)}
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-sm">{chart.name}</h4>
                              <span className="text-[10px] uppercase text-primary font-bold tracking-wide">
                                {chart.type ?? 'Birth Chart'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <span className="bg-surface-light px-2 py-1 rounded text-[10px] text-gold font-medium border border-white/15 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]" aria-hidden="true">sunny</span>
                            {chart.type ?? 'Natal'}
                          </span>
                          <span className="bg-surface-light px-2 py-1 rounded text-[10px] text-slate-200 font-medium border border-white/15 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]" aria-hidden="true">calendar_today</span>
                            {new Date(chart.birth_data?.birth_date ?? chart.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Create New Chart Card */}
                    {charts.length > 0 && (
                      <Link
                        to="/charts/new"
                        className="w-full border border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/15 hover:border-primary/50 transition-all group h-[110px]"
                      >
                        <div className="size-8 rounded-full bg-surface-light flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-slate-200">
                          <span className="material-symbols-outlined text-xl" aria-hidden="true">add</span>
                        </div>
                        <span className="text-sm font-medium text-slate-200 group-hover:text-white">Create New Chart</span>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { to: '/calendar', icon: 'calendar_month', color: 'bg-indigo-500/20 text-indigo-400', title: 'Calendar', desc: 'Events & Phases' },
                { to: '/synastry', icon: 'favorite_border', color: 'bg-pink-500/20 text-pink-400', title: 'Synastry', desc: 'Compatibility' },
                { to: '/lunar-returns', icon: 'refresh', color: 'bg-cyan-500/20 text-cyan-400', title: 'Lunar Returns', desc: 'Monthly Forecast' },
                { to: '/solar-returns', icon: 'light_mode', color: 'bg-amber-500/20 text-amber-400', title: 'Solar Returns', desc: 'Yearly Outlook' },
              ].map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="glass-panel p-4 rounded-xl flex flex-col gap-3 hover:bg-white/15 transition-all group border border-white/15"
                >
                  <div className={`size-10 rounded-lg ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined" aria-hidden="true">{action.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{action.title}</h4>
                    <p className="text-slate-200 text-xs">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
