     1|/**
     2| * Transit Forecast Page
     3| * Modern transit forecast page with timeline and energy graph
     4| */
     5|
     6|import React, { useState, useEffect, useCallback } from 'react';
     7|import { motion, AnimatePresence } from 'framer-motion';
     8|import { useNavigate } from 'react-router-dom';
     9|import TransitTimelineCard from '../components/astrology/TransitTimelineCard';
    10|import TransitChart, { TransitDataPoint } from '../components/transit/TransitChart';
    11|import EnergyMeter from '../components/astrology/EnergyMeter';
    12|import { transitService } from '../services/transit.service';
    13|import { chartService } from '../services/chart.service';
    14|import { AppLayout } from '../components/AppLayout';
    15|import { SkeletonLoader, EmptyState } from '../components';
    16|import type { TransitReading, NormalizedTransit } from '../services/transit.service';
    17|
    18|interface Chart {
    19|  id: string;
    20|  name: string;
    21|}
    22|
    23|interface TransitEvent {
    24|  id: string;
    25|  date: string;
    26|  time?: string;
    27|  title: string;
    28|  description: string;
    29|  type: 'favorable' | 'challenging' | 'neutral' | 'major';
    30|  impact: 'low' | 'moderate' | 'high';
    31|  tags?: string[];
    32|  orb?: number;
    33|}
    34|
    35|interface CurrentTransit {
    36|  planet: string;
    37|  sign: string;
    38|  degree: number;
    39|  retrograde: boolean;
    40|}
    41|
    42|/**
    43| * Transform NormalizedTransit to component TransitEvent type
    44| */
    45|function transformTransitToEvent(transit: NormalizedTransit, fallbackDate: string, index: number): TransitEvent {
    46|  // Compute intensity from orb (lower orb = tighter aspect = higher intensity)
    47|  const intensity = Math.max(1, Math.round(10 - transit.orb));
    48|
    49|  // Map intensity to component impact
    50|  const mapImpact = (): 'low' | 'moderate' | 'high' => {
    51|    if (intensity >= 7) return 'high';
    52|    if (intensity >= 4) return 'moderate';
    53|    return 'low';
    54|  };
    55|
    56|  // Classify aspect type
    57|  const harmoniousAspects = ['trine', 'sextile', 'conjunction'];
    58|  const challengingAspects = ['square', 'opposition', 'quincunx'];
    59|  const mapType = (): 'favorable' | 'challenging' | 'neutral' | 'major' => {
    60|    if (intensity >= 8) return 'major';
    61|    if (harmoniousAspects.some((a) => transit.aspect.toLowerCase().includes(a))) return 'favorable';
    62|    if (challengingAspects.some((a) => transit.aspect.toLowerCase().includes(a))) return 'challenging';
    63|    return 'neutral';
    64|  };
    65|
    66|  const title = `${transit.transitPlanet} ${transit.aspect} ${transit.natalPlanet}`;
    67|
    68|  return {
    69|    id: `transit-${index}`,
    70|    date: fallbackDate,
    71|    title,
    72|    description: `${transit.transitPlanet} forms a ${transit.aspect} with ${transit.natalPlanet} (orb: ${transit.orb.toFixed(1)})`,
    73|    type: mapType(),
    74|    impact: mapImpact(),
    75|    tags: transit.aspect ? [transit.aspect] : undefined,
    76|    orb: transit.orb,
    77|  };
    78|}
    79|
    80|/**
    81| * Generate energy data points from a single energy level
    82| */
    83|function generateEnergyData(
    84|  energyLevel: number,
    85|  startDate: string,
    86|  endDate: string,
    87|): TransitDataPoint[] {
    88|  const start = new Date(startDate);
    89|  const end = new Date(endDate);
    90|  const days: TransitDataPoint[] = [];
    91|
    92|  // Generate data points for each day
    93|  const current = new Date(start);
    94|  while (current <= end) {
    95|    const dateStr = current.toISOString().split('T')[0];
    96|
    97|    // Add some variance to the energy level based on the day
    98|    const dayVariance = Math.sin(current.getDate() / 5) * 10;
    99|    const baseEnergy = Math.max(0, Math.min(100, energyLevel + dayVariance));
   100|
   101|    days.push({
   102|      date: dateStr,
   103|      energy: Math.round(baseEnergy),
   104|      isMajorEvent: false,
   105|    });
   106|
   107|    current.setDate(current.getDate() + 1);
   108|  }
   109|
   110|  return days;
   111|}
   112|
   113|const TransitForecastPage: React.FC = () => {
   114|  const navigate = useNavigate();
   115|  const [charts, setCharts] = useState<Chart[]>([]);
   116|  const [selectedChartId, setSelectedChartId] = useState('');
   117|  const [startDate, setStartDate] = useState(() => {
   118|    const today = new Date();
   119|    return today.toISOString().split('T')[0];
   120|  });
   121|  const [endDate, setEndDate] = useState(() => {
   122|    const date = new Date();
   123|    date.setDate(date.getDate() + 30);
   124|    return date.toISOString().split('T')[0];
   125|  });
   126|  const [duration, setDuration] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
   127|  const [loading, setLoading] = useState(false);
   128|  const [error, setError] = useState<string | null>(null);
   129|  const [events, setEvents] = useState<TransitEvent[]>([]);
   130|  const [energyData, setEnergyData] = useState<TransitDataPoint[]>([]);
   131|  const [showFilters, setShowFilters] = useState(false);
   132|  const [filters, setFilters] = useState({
   133|    majorOnly: false,
   134|    minImpact: 'low' as 'low' | 'moderate' | 'high',
   135|    showFavorable: true,
   136|    showChallenging: true,
   137|    showNeutral: true,
   138|  });
   139|  const [summaryStats, setSummaryStats] = useState({
   140|    totalTransits: 0,
   141|    majorAspects: 0,
   142|    bestDay: { date: '', score: 0 },
   143|    worstDay: { date: '', score: 0 },
   144|  });
   145|  const [currentTransits, setCurrentTransits] = useState<CurrentTransit[]>([]);
   146|  const [loadingCurrentTransits, setLoadingCurrentTransits] = useState(false);
   147|
   148|  useEffect(() => {
   149|    void loadCharts();
   150|    void loadCurrentTransits();
   151|    // eslint-disable-next-line react-hooks/exhaustive-deps
   152|  }, []);
   153|
   154|  useEffect(() => {
   155|    if (selectedChartId) {
   156|      void loadTransits();
   157|    }
   158|    // eslint-disable-next-line react-hooks/exhaustive-deps
   159|  }, [selectedChartId, startDate, endDate]);
   160|
   161|  const loadCharts = async () => {
   162|    try {
   163|      setLoading(true);
   164|      const { charts: loadedCharts } = await chartService.getCharts();
   165|      setCharts(loadedCharts);
   166|      if (loadedCharts.length > 0 && !selectedChartId) {
   167|        setSelectedChartId(loadedCharts[0].id);
   168|      }
   169|    } catch (err) {
   170|      console.error('Error loading charts:', err);
   171|      setError('Failed to load charts');
   172|    } finally {
   173|      setLoading(false);
   174|    }
   175|  };
   176|
   177|  const loadCurrentTransits = useCallback(async () => {
   178|    try {
   179|      setLoadingCurrentTransits(true);
   180|      const data = await transitService.getTodayTransits();
   181|
   182|      // Transform transits to current positions
   183|      const positions: CurrentTransit[] = (data.transits ?? []).map((transit) => ({
   184|        planet: transit.transitPlanet,
   185|        sign: transit.aspect ?? '',
   186|        degree: transit.orb,
   187|        retrograde: false,
   188|      }));
   189|
   190|      setCurrentTransits(positions);
   191|    } catch (err) {
   192|      console.error('Error loading current transits:', err);
   193|      // Don't set main error for sidebar - just log it
   194|    } finally {
   195|      setLoadingCurrentTransits(false);
   196|    }
   197|  }, []);
   198|
   199|  const loadTransits = async () => {
   200|    if (!selectedChartId) return;
   201|
   202|    try {
   203|      setLoading(true);
   204|      setError(null);
   205|
   206|      // Fetch transit data from API
   207|      const data: TransitReading = await transitService.calculateTransits(
   208|        selectedChartId,
   209|        startDate,
   210|        endDate,
   211|      );
   212|
   213|      // Transform NormalizedTransit[] to component TransitEvent[]
   214|      const transits = data.transits ?? [];
   215|      const transitEvents: TransitEvent[] = transits.map((t, i) =>
   216|        transformTransitToEvent(t, data.date ?? startDate, i),
   217|      );
   218|      setEvents(transitEvents);
   219|
   220|      // Generate energy data
   221|      const energyPoints = generateEnergyData(
   222|        50,
   223|        startDate,
   224|        endDate,
   225|      );
   226|      setEnergyData(energyPoints);
   227|
   228|      // Find best and worst days from energy data
   229|      const sortedByEnergy = [...energyPoints].sort((a, b) => b.energy - a.energy);
   230|      const bestDay = sortedByEnergy[0] || { date: '', energy: 0 };
   231|      const worstDay = sortedByEnergy[sortedByEnergy.length - 1] || { date: '', energy: 0 };
   232|
   233|      // Calculate summary stats
   234|      setSummaryStats({
   235|        totalTransits: transitEvents.length,
   236|        majorAspects: transitEvents.filter((e) => e.type === 'major').length,
   237|        bestDay: { date: bestDay.date, score: bestDay.energy },
   238|        worstDay: { date: worstDay.date, score: worstDay.energy },
   239|      });
   240|    } catch (err) {
   241|      console.error('Error loading transits:', err);
   242|      const errorMessage = err instanceof Error ? err.message : 'Failed to load transit data';
   243|      setError(errorMessage);
   244|    } finally {
   245|      setLoading(false);
   246|    }
   247|  };
   248|
   249|  const handleDurationChange = (newDuration: 'week' | 'month' | 'quarter' | 'year') => {
   250|    setDuration(newDuration);
   251|    const today = new Date();
   252|    const end = new Date(today);
   253|
   254|    switch (newDuration) {
   255|      case 'week':
   256|        end.setDate(end.getDate() + 7);
   257|        break;
   258|      case 'month':
   259|        end.setDate(end.getDate() + 30);
   260|        break;
   261|      case 'quarter':
   262|        end.setDate(end.getDate() + 90);
   263|        break;
   264|      case 'year':
   265|        end.setDate(end.getDate() + 365);
   266|        break;
   267|    }
   268|
   269|    setStartDate(today.toISOString().split('T')[0]);
   270|    setEndDate(end.toISOString().split('T')[0]);
     default:
       break;
   271|  };
   272|
   273|  const filteredEvents = events.filter((event) => {
   274|    if (filters.majorOnly && event.type !== 'major') return false;
   275|    if (filters.minImpact === 'moderate' && event.impact === 'low') return false;
   276|    if (filters.minImpact === 'high' && event.impact !== 'high') return false;
   277|    if (!filters.showFavorable && event.type === 'favorable') return false;
   278|    if (!filters.showChallenging && event.type === 'challenging') return false;
   279|    if (!filters.showNeutral && event.type === 'neutral') return false;
   280|    return true;
   281|  });
   282|
   283|  if (loading && charts.length === 0) {
   284|    return (
   285|      <AppLayout>
   286|        <div className="flex flex-col items-center justify-center min-h-[60vh]">
   287|          <SkeletonLoader variant="card" count={3} />
   288|        </div>
   289|      </AppLayout>
   290|    );
   291|  }
   292|
   293|  if (charts.length === 0) {
   294|    return (
   295|      <AppLayout>
   296|        <EmptyState
   297|          icon="🌙"
   298|          title="No charts available"
   299|          description="Transit forecasts require a natal chart. Create your chart first to view your transits."
   300|          actionText="Create Chart"
   301|          onAction={() => navigate('/charts/new')}
   302|          secondaryActionText="Back to Dashboard"
   303|          onSecondaryAction={() => navigate('/dashboard')}
   304|        />
   305|      </AppLayout>
   306|    );
   307|  }
   308|
   309|  return (
   310|    <AppLayout>
   311|      <div className="max-w-7xl mx-auto px-6 py-8">
   312|        {/* Header & Date Toggle */}
   313|        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
   314|          <div>
   315|            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Transit Forecast</h1>
   316|            <p className="text-slate-400">
   317|              Daily planetary influences for{' '}
   318|              {charts.find((c) => c.id === selectedChartId)?.name ?? 'your chart'}
   319|            </p>
   320|          </div>
   321|
   322|          {/* Date Range Toggle */}
   323|          <div
   324|            className="glass-panel p-1 rounded-xl flex items-center"
   325|            data-testid="duration-buttons"
   326|          >
   327|            {(['week', 'month', 'quarter', 'year'] as const).map((d) => (
   328|              <button
   329|                key={d}
   330|                onClick={() => handleDurationChange(d)}
   331|                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
   332|                  duration === d
   333|                    ? 'bg-primary text-white shadow-[0_0_10px_rgba(107,61,225,0.4)]'
   334|                    : 'text-slate-400 hover:text-white'
   335|                }`}
   336|                data-testid={`duration-${d}`}
   337|              >
   338|                {d === 'week'
   339|                  ? 'This Week'
   340|                  : d === 'month'
   341|                    ? 'This Month'
   342|                    : d === 'quarter'
   343|                      ? '3 Months'
   344|                      : 'This Year'}
   345|              </button>
   346|            ))}
   347|          </div>
   348|        </div>
   349|
   350|        {/* Chart Selector & Filters */}
   351|        <div className="flex flex-col md:flex-row gap-4 mb-8">
   352|          <div className="flex-grow">
   353|            <label className="block text-sm text-slate-400 mb-2">Select Chart</label>
   354|            <select
   355|              value={selectedChartId}
   356|              onChange={(e) => setSelectedChartId(e.target.value)}
   357|              className="w-full px-4 py-2 bg-surface border border-glass-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
   358|              data-testid="chart-selector"
   359|            >
   360|              {charts.map((chart) => (
   361|                <option key={chart.id} value={chart.id}>
   362|                  {chart.name}
   363|                </option>
   364|              ))}
   365|            </select>
   366|          </div>
   367|
   368|          <div className="flex gap-4 items-end">
   369|            <div>
   370|              <label className="block text-sm text-slate-400 mb-2">Start Date</label>
   371|              <input
   372|                type="date"
   373|                value={startDate}
   374|                onChange={(e) => setStartDate(e.target.value)}
   375|                className="px-4 py-2 bg-surface border border-glass-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
   376|                data-testid="start-date-input"
   377|              />
   378|            </div>
   379|            <div>
   380|              <label className="block text-sm text-slate-400 mb-2">End Date</label>
   381|              <input
   382|                type="date"
   383|                value={endDate}
   384|                onChange={(e) => setEndDate(e.target.value)}
   385|                className="px-4 py-2 bg-surface border border-glass-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
   386|                data-testid="end-date-input"
   387|              />
   388|            </div>
   389|          </div>
   390|
   391|          <div className="flex items-end">
   392|            <button
   393|              onClick={() => setShowFilters(!showFilters)}
   394|              className="px-4 py-2 bg-surface border border-glass-border rounded-lg text-white hover:bg-white/5 transition-colors flex items-center gap-2"
   395|              data-testid="filters-toggle-button"
   396|            >
   397|              <span className="material-symbols-outlined">tune</span>
   398|              Filters
   399|            </button>
   400|          </div>
   401|        </div>
   402|
   403|        {/* Filter Panel */}
   404|        <AnimatePresence>
   405|          {showFilters && (
   406|            <motion.div
   407|              initial={{ opacity: 0, height: 0 }}
   408|              animate={{ opacity: 1, height: 'auto' }}
   409|              exit={{ opacity: 0, height: 0 }}
   410|              className="mb-8 p-6 glass-panel rounded-xl"
   411|            >
   412|              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
   413|                <div>
   414|                  <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
   415|                    <input
   416|                      type="checkbox"
   417|                      checked={filters.majorOnly}
   418|                      onChange={(e) => setFilters({ ...filters, majorOnly: e.target.checked })}
   419|                      className="rounded bg-surface border-glass-border text-primary focus:ring-primary"
   420|                    />
   421|                    Major aspects only
   422|                  </label>
   423|                </div>
   424|
   425|                <div>
   426|                  <label className="block text-sm text-slate-400 mb-2">Minimum Impact</label>
   427|                  <select
   428|                    value={filters.minImpact}
   429|                    onChange={(e) => {
   430|                      const value = e.target.value;
   431|                      setFilters({ ...filters, minImpact: value as 'low' | 'moderate' | 'high' });
   432|                    }}
   433|                    className="w-full px-3 py-2 bg-surface border border-glass-border rounded-lg text-white text-sm"
   434|                  >
   435|                    <option value="low">All</option>
   436|                    <option value="moderate">Moderate+</option>
   437|                    <option value="high">High Only</option>
   438|                  </select>
   439|                </div>
   440|
   441|                <div className="col-span-2">
   442|                  <label className="block text-sm text-slate-400 mb-2">Show Types</label>
   443|                  <div className="flex gap-4">
   444|                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
   445|                      <input
   446|                        type="checkbox"
   447|                        checked={filters.showFavorable}
   448|                        onChange={(e) =>
   449|                          setFilters({ ...filters, showFavorable: e.target.checked })
   450|                        }
   451|                        className="rounded bg-surface border-glass-border text-green-500 focus:ring-green-500"
   452|                      />
   453|                      Favorable
   454|                    </label>
   455|                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
   456|                      <input
   457|                        type="checkbox"
   458|                        checked={filters.showChallenging}
   459|                        onChange={(e) =>
   460|                          setFilters({ ...filters, showChallenging: e.target.checked })
   461|                        }
   462|                        className="rounded bg-surface border-glass-border text-red-500 focus:ring-red-500"
   463|                      />
   464|                      Challenging
   465|                    </label>
   466|                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
   467|                      <input
   468|                        type="checkbox"
   469|                        checked={filters.showNeutral}
   470|                        onChange={(e) => setFilters({ ...filters, showNeutral: e.target.checked })}
   471|                        className="rounded bg-surface border-glass-border text-blue-500 focus:ring-blue-500"
   472|                      />
   473|                      Neutral
   474|                    </label>
   475|                  </div>
   476|                </div>
   477|              </div>
   478|            </motion.div>
   479|          )}
   480|        </AnimatePresence>
   481|
   482|        {/* Error */}
   483|        <AnimatePresence>
   484|          {error && (
   485|            <motion.div
   486|              initial={{ opacity: 0, y: -10 }}
   487|              animate={{ opacity: 1, y: 0 }}
   488|              exit={{ opacity: 0, y: -10 }}
   489|              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
   490|            >
   491|              {error}
   492|            </motion.div>
   493|          )}
   494|        </AnimatePresence>
   495|
   496|        {/* Loading */}
   497|        {loading && events.length === 0 && (
   498|          <div className="flex flex-col items-center justify-center py-20">
   499|            <div className="relative w-16 h-16 mb-4">
   500|              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
   501|