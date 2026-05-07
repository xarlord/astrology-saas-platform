/**
 * Solar Return Annual Report Page
 *
 * Detailed annual forecast based on solar return chart
 * Reference: stitch-UI/desktop/17-solar-return-annual-report.html
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Components
import { AppLayout } from '../components';
import { Button } from '../components/ui/Button';

// Hooks & Services
import { usePDFGeneration, generateReportFilename } from '../hooks/usePDFGeneration';
import api from '../services/api';

// Types
interface MonthlyData {
  month: string;
  powerDate?: string;
  challengeDate?: string;
  energy: 'high' | 'medium' | 'low';
}

interface SolarReturnData {
  year: number;
  theme: string;
  description: string;
  sunHouse: number;
  sunSign: string;
  yearlyRuler: string;
  crucialAspect: string;
  ascendant: string;
  monthlyData: MonthlyData[];
}

const DEFAULT_SOLAR_DATA: SolarReturnData = {
  year: new Date().getFullYear(),
  theme: 'Personal Expansion',
  description:
    'This year marks a monumental shift in your personal evolution. As the Sun returns to the exact degree of your birth, it illuminates your sector of growth and wisdom, promising a twelve-month period defined by breaking boundaries and seeking higher truths.',
  sunHouse: 9,
  sunSign: 'Pisces',
  yearlyRuler: 'Jupiter',
  crucialAspect: 'Sun Conjunct Midheaven',
  ascendant: 'Leo',
  monthlyData: [
    { month: 'MAY', powerDate: 'May 14', energy: 'high' },
    { month: 'JUN', energy: 'medium' },
    { month: 'JUL', challengeDate: 'Jul 28', energy: 'low' },
    { month: 'AUG', energy: 'low' },
    { month: 'SEP', powerDate: 'Sep 22', energy: 'high' },
    { month: 'OCT', energy: 'medium' },
    { month: 'NOV', challengeDate: 'Nov 11', energy: 'low' },
    { month: 'DEC', energy: 'medium' },
    { month: 'JAN', powerDate: 'Jan 05', energy: 'high' },
    { month: 'FEB', energy: 'medium' },
    { month: 'MAR', energy: 'medium' },
    { month: 'APR', energy: 'medium' },
  ],
};

/**
 * Transform raw API solar return data into the SolarReturnData shape.
 */
function transformSolarReturn(apiData: Record<string, unknown>): SolarReturnData {
  const calculatedData = apiData.calculatedData as Record<string, unknown> | undefined;
  const interpretation = apiData.interpretation as Record<string, unknown> | undefined;
  const positions = (calculatedData?.positions ?? []) as { planet: string; sign: string; house: number }[];
  const aspects = (calculatedData?.aspects ?? []) as { planet1: string; planet2: string; type: string }[];
  const themes = interpretation?.themes as string[] | undefined;
  const luckyDays = interpretation?.luckyDays as { date: string; description: string }[] | undefined;

  const year = (apiData.year as number) ?? new Date().getFullYear();
  const sunPosition = positions.find((p) => p.planet === 'Sun');

  // Build monthly data from lucky days or default
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthlyData: MonthlyData[] = monthNames.map((month, idx) => {
    const lucky = luckyDays?.find((d) => {
      const dMonth = new Date(d.date).getMonth();
      return dMonth === idx;
    });
    return {
      month,
      powerDate: lucky ? new Date(lucky.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : undefined,
      energy: lucky ? 'high' : 'medium',
    };
  });

  return {
    year,
    theme: Array.isArray(themes) && themes.length > 0 ? themes[0] : 'Personal Expansion',
    description: (interpretation?.overview as string) ?? DEFAULT_SOLAR_DATA.description,
    sunHouse: sunPosition?.house ?? DEFAULT_SOLAR_DATA.sunHouse,
    sunSign: sunPosition?.sign ?? DEFAULT_SOLAR_DATA.sunSign,
    yearlyRuler: DEFAULT_SOLAR_DATA.yearlyRuler,
    crucialAspect: aspects.length > 0 ? `${aspects[0].planet1} ${aspects[0].type} ${aspects[0].planet2}` : DEFAULT_SOLAR_DATA.crucialAspect,
    ascendant: (calculatedData?.ascendant as string | undefined)?.split(' ')[0] ?? DEFAULT_SOLAR_DATA.ascendant,
    monthlyData: monthlyData.length > 0 ? monthlyData : DEFAULT_SOLAR_DATA.monthlyData,
  };
}

const INTERPRETATIONS = {
  career: {
    title: 'Career & Purpose',
    icon: 'work',
    color: 'bg-amber-400/10 text-amber-400',
    content:
      'Your professional landscape is undergoing a radical transformation. The placement of the Solar Midheaven suggests that you are ready to step into a leadership role that aligns more closely with your personal ethics. Look for opportunities between September and January to pitch high-stakes projects or ask for significant advancements.',
  },
  love: {
    title: 'Love & Social Life',
    icon: 'favorite',
    color: 'bg-purple-400/10 text-purple-400',
    content:
      'Social dynamics will shift as you prioritize deep intellectual connections over surface-level interactions. Existing relationships may undergo testing, leading to greater authenticity and depth.',
  },
  health: {
    title: 'Health & Vitality',
    icon: 'vital_signs',
    color: 'bg-orange-400/10 text-orange-400',
    content:
      'Focus on routine and mental health as a foundation for physical stamina this year. The Solar Return chart emphasizes the need for balance between activity and rest.',
  },
};

const SolarReturnAnnualReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [_isLoadingSolar, setIsLoadingSolar] = useState(false);
  const [_solarError, setSolarError] = useState<string | null>(null);
  const [rawSolarReturn, setRawSolarReturn] = useState<Record<string, unknown> | null>(null);

  // PDF generation hook
  const {
    isGenerating: isGeneratingPDF,
    generateReport,
    downloadReport,
  } = usePDFGeneration();

  // Fetch solar return data from API
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      try {
        setIsLoadingSolar(true);
        setSolarError(null);
        const response = await api.get<{ data: Record<string, unknown> }>(`/solar-returns/${id}`);
        if (!cancelled && response.data?.data) {
          setRawSolarReturn(response.data.data);
        }
      } catch (err) {
        if (!cancelled) {
          setSolarError(err instanceof Error ? err.message : 'Failed to load solar return data');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSolar(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const solarData = useMemo<SolarReturnData>(() => {
    if (rawSolarReturn) {
      return transformSolarReturn(rawSolarReturn);
    }
    return DEFAULT_SOLAR_DATA;
  }, [rawSolarReturn]);

  const toggleAccordion = (key: string) => {
    setActiveAccordion((prev) => (prev === key ? null : key));
  };

  const handleGeneratePDF = async () => {
    const filename = generateReportFilename('solar-return', `solar-return-${solarData.year}`);
    const result = await generateReport(
      {
        reportType: 'solar-return',
        title: `Solar Return Report ${solarData.year}`,
        subtitle: `Year of ${solarData.theme}`,
      },
      {
        solarReturn: {
          id: '',
          chartId: '',
          year: solarData.year,
          returnDate: `${solarData.year}-01-01T00:00:00Z`,
          solarReturnChart: {
            chart: {
              id: '',
              userId: '',
              name: `Solar Return ${solarData.year}`,
              type: 'solar-return',
              birthData: {
                name: `Solar Return ${solarData.year}`,
                birthDate: `${solarData.year}-01-01`,
                birthTime: '00:00',
                birthPlace: 'Unknown',
                latitude: 0,
                longitude: 0,
                timezone: 'UTC',
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isDefault: false,
            },
            positions: [],
            aspects: [],
            houses: [],
          },
          analysis: { overview: solarData.description, themes: [solarData.theme] },
          themes: [solarData.theme],
          createdAt: new Date().toISOString(),
        } as unknown as import('../types/api.types').SolarReturnResponse,
        chartName: `Solar Return ${solarData.year}`,
      },
    );
    if (result.success) {
      downloadReport(filename);
    }
  };

  return (
    <AppLayout>
      {/* Background Decorative Elements */}
      <div className="fixed top-1/4 -left-64 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="fixed bottom-1/4 -right-64 w-[600px] h-[600px] bg-amber-400/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>

      <main className="pb-20 px-4 md:px-10 max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <motion.header
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-amber-400">wb_sunny</span>
              <span className="text-amber-400 font-bold tracking-widest text-sm uppercase">
                Annual Forecast
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Solar Return Report {solarData.year}
            </h2>
            <p className="text-slate-400 mt-2 text-lg">
              Your birthday chart and annual forecast for the year ahead.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              leftIcon={<span className="material-symbols-outlined text-[18px]">archive</span>}
              onClick={() => navigate('/solar-returns')}
            >
              View Archive
            </Button>
            <Button
              variant="primary"
              leftIcon={<span className="material-symbols-outlined text-[18px]">download</span>}
              onClick={() => void handleGeneratePDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </motion.header>

        {/* Hero Section: Yearly Theme */}
        <motion.section
          className="bg-white/5 backdrop-blur-sm rounded-xl p-8 md:p-12 relative overflow-hidden group border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/10 blur-[100px] rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full"></div>
          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="flex justify-center md:justify-start order-2 md:order-1">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <div className="absolute inset-0 bg-amber-400/20 blur-3xl animate-pulse"></div>
                <img
                  src="https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&q=80"
                  alt="Solar Theme"
                  className="w-full h-full object-cover rounded-full shadow-2xl shadow-amber-400/20 border-4 border-amber-400/30"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[120px] text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]">
                    light_mode
                  </span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div>
                <span className="text-amber-400 font-bold text-sm tracking-widest uppercase mb-2 block">
                  The Yearly Theme
                </span>
                <h3 className="text-4xl md:text-6xl font-black text-white leading-[1.1]">
                  The Year of {solarData.theme}
                </h3>
              </div>
              <div className="space-y-4 text-slate-300 text-lg leading-relaxed">
                <p>{solarData.description}</p>
              </div>
              <button className="text-amber-400 font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                Read Full Executive Summary{' '}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </motion.section>

        {/* Chart Comparison Section */}
        <motion.section
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-bold text-white">
              Chart Comparison: Natal vs. Solar Return
            </h3>
            <span className="text-slate-400 text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">info</span>
              Swipe to compare details
            </span>
          </div>
          <div className="relative flex flex-col md:flex-row gap-6 items-center">
            {/* Natal Chart Card */}
            <div className="flex-1 w-full bg-white/5 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center gap-6 border-l-4 border-slate-500">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                Natal Birth Chart
              </p>
              <div className="w-64 h-64 md:w-80 md:h-80 relative rounded-full border-2 border-slate-700/50 flex items-center justify-center bg-black/20">
                <img
                  src="https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&q=80"
                  alt="Natal Chart Wheel"
                  className="w-full h-full object-cover rounded-full opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[100px] text-slate-500/30">
                    auto_awesome
                  </span>
                </div>
              </div>
              <p className="text-center text-slate-300 text-sm">Fixed positions at time of birth</p>
            </div>

            {/* Central Badge */}
            <div className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-20">
              <div className="bg-amber-400 text-[#0B0D17] px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(251,191,36,0.4)] flex flex-col items-center border-4 border-[#0B0D17]">
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-80">
                  Solar Return Ascendant
                </span>
                <span className="text-2xl font-black">{solarData.ascendant} RISING</span>
                <span className="material-symbols-outlined text-sm">king_bed</span>
              </div>
            </div>

            {/* Solar Return Chart Card */}
            <div className="flex-1 w-full bg-white/5 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center gap-6 border-r-4 border-amber-400">
              <p className="text-amber-400 font-bold uppercase tracking-widest text-xs">
                Solar Return {solarData.year} Chart
              </p>
              <div className="w-64 h-64 md:w-80 md:h-80 relative rounded-full border-2 border-amber-400/30 flex items-center justify-center bg-amber-400/5">
                <img
                  src="https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&q=80"
                  alt="Solar Return Chart Wheel"
                  className="w-full h-full object-cover rounded-full opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[100px] text-amber-400/40">
                    flare
                  </span>
                </div>
              </div>
              <p className="text-center text-slate-300 text-sm">
                Annual celestial alignment for current year
              </p>
            </div>
          </div>
        </motion.section>

        {/* Key Placements Grid */}
        <motion.section
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Solar House */}
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl space-y-4 hover:border-amber-400/50 transition-colors group border border-white/10">
            <div className="w-12 h-12 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-400 mb-6">
              <span className="material-symbols-outlined">home</span>
            </div>
            <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              The Solar House
            </h4>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                Sun in the {solarData.sunHouse}th House
              </p>
              <p className="text-amber-400 font-medium">Horizon Expansion</p>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your vital energy is focused on travel, higher learning, and spiritual philosophy. A
              prime year for academic pursuits or international ventures.
            </p>
          </div>

          {/* Yearly Ruler */}
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl space-y-4 hover:border-purple-400/50 transition-colors group border border-white/10">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
              <span className="material-symbols-outlined">stars</span>
            </div>
            <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              Yearly Ruler
            </h4>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{solarData.yearlyRuler}</p>
              <p className="text-purple-400 font-medium">Benevolent Growth</p>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Jupiter acts as your personal advocate this year, magnifying abundance in whichever
              house it currently transits. Focus on "Yes" as your default.
            </p>
          </div>

          {/* Crucial Aspect */}
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl space-y-4 hover:border-orange-400/50 transition-colors group border border-white/10">
            <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 mb-6">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              Crucial Aspect
            </h4>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">{solarData.crucialAspect}</p>
              <p className="text-orange-400 font-medium">Public Peak</p>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              A rare alignment signaling a professional peak. Your visibility is at an all-time
              high; the world is watching your career moves closely.
            </p>
          </div>
        </motion.section>

        {/* Annual Timeline */}
        <motion.section
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-white px-2">Annual 12-Month Timeline</h3>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 overflow-x-auto border border-white/10">
            <div className="flex min-w-[1000px] relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2"></div>
              {/* Month Nodes */}
              <div className="flex justify-between w-full relative z-10">
                {solarData.monthlyData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center gap-4 group">
                    <span className="text-xs font-bold text-slate-500 group-hover:text-amber-400 transition-colors">
                      {data.month}
                    </span>
                    {data.powerDate ? (
                      <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-[#0B0D17] shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                        <span className="material-symbols-outlined text-sm font-bold">star</span>
                      </div>
                    ) : data.challengeDate ? (
                      <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center text-slate-400 border border-white/10">
                        <span className="material-symbols-outlined text-sm">dark_mode</span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-white/20 mt-3.5"></div>
                    )}
                    {data.powerDate && (
                      <div className="text-center">
                        <p className="text-[10px] text-amber-400 font-bold uppercase">Power Date</p>
                        <p className="text-[9px] text-slate-400">{data.powerDate}</p>
                      </div>
                    )}
                    {data.challengeDate && (
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Challenge</p>
                        <p className="text-[9px] text-slate-500">{data.challengeDate}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Detailed Interpretations: Accordions */}
        <motion.section
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-white px-2 mb-6">Detailed Interpretations</h3>
          {Object.entries(INTERPRETATIONS).map(([key, data]) => (
            <div
              key={key}
              className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10"
            >
              <button
                onClick={() => toggleAccordion(key)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg ${data.color} flex items-center justify-center`}
                  >
                    <span className="material-symbols-outlined">{data.icon}</span>
                  </div>
                  <span className="text-lg font-bold text-white">{data.title}</span>
                </div>
                <span
                  className={`material-symbols-outlined text-slate-500 transition-transform ${
                    activeAccordion === key ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>
              {activeAccordion === key && (
                <div className="p-6 pt-0 text-slate-400 leading-relaxed border-t border-white/5">
                  {data.content}
                </div>
              )}
            </div>
          ))}
        </motion.section>

        {/* Final Actions Bar */}
        <motion.section
          className="flex flex-wrap items-center justify-center gap-6 py-10 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <button
            onClick={() => navigate('/solar-returns')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
              compare_arrows
            </span>
            <span className="font-bold">Compare with Previous Year</span>
          </button>
          <button className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors group">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
              calendar_add_on
            </span>
            <span className="font-bold">Add Power Dates to Calendar</span>
          </button>
          <div className="w-px h-6 bg-white/20 hidden md:block"></div>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            BOOK CONSULTATION FOR THIS REPORT
          </Button>
        </motion.section>
      </main>
    </AppLayout>
  );
};

export default SolarReturnAnnualReportPage;
