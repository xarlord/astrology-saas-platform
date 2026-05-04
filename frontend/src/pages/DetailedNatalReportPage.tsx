/**
 * Detailed Natal Report Page
 *
 * Comprehensive natal chart report with planets, houses, aspects
 * Reference: stitch-UI/desktop/14-detailed-natal-report.html
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Components
import { AppLayout } from '../components';
import { Button } from '../components/ui/Button';
import ElementalBalance from '../components/astrology/ElementalBalance';
import PlanetaryPositionCard from '../components/astrology/PlanetaryPositionCard';
import AspectGrid, { AspectGridData } from '../components/astrology/AspectGrid';

// Types
interface NatalChart {
  id: string;
  name: string;
  birthData: {
    date: string;
    time: string;
    location: string;
  };
  planets: {
    name: string;
    sign: string;
    degree: number;
    house: number;
    element: string;
    modality: string;
  }[];
  aspects: {
    planet1: string;
    planet2: string;
    type: string;
    degree: number;
  }[];
}

// Mock data
const MOCK_NATAL_CHARTS: Record<string, NatalChart> = {
  default: {
    id: 'default',
    name: 'Sarah Mitchell',
    birthData: {
      date: 'January 14, 1992',
      time: '14:42 EST',
      location: 'New York, USA',
    },
    planets: [
      {
        name: 'Sun',
        sign: 'Capricorn',
        degree: 24,
        house: 10,
        element: 'Earth',
        modality: 'Cardinal',
      },
      { name: 'Moon', sign: 'Pisces', degree: 15, house: 4, element: 'Water', modality: 'Mutable' },
      { name: 'Rising', sign: 'Leo', degree: 8, house: 1, element: 'Fire', modality: 'Fixed' },
      {
        name: 'Mercury',
        sign: 'Capricorn',
        degree: 18,
        house: 10,
        element: 'Earth',
        modality: 'Cardinal',
      },
      {
        name: 'Venus',
        sign: 'Sagittarius',
        degree: 22,
        house: 5,
        element: 'Fire',
        modality: 'Mutable',
      },
      { name: 'Mars', sign: 'Scorpio', degree: 12, house: 4, element: 'Water', modality: 'Fixed' },
      { name: 'Jupiter', sign: 'Libra', degree: 5, house: 3, element: 'Air', modality: 'Cardinal' },
    ],
    aspects: [
      { planet1: 'Sun', planet2: 'Moon', type: 'trine', degree: 120 },
      { planet1: 'Sun', planet2: 'Mercury', type: 'conjunction', degree: 6 },
      { planet1: 'Sun', planet2: 'Mars', type: 'square', degree: 88 },
      { planet1: 'Moon', planet2: 'Venus', type: 'sextile', degree: 57 },
      { planet1: 'Moon', planet2: 'Jupiter', type: 'trine', degree: 120 },
    ],
  },
};

const DetailedNatalReportPage: React.FC = () => {
  const { chartId } = useParams<{ chartId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'summary' | 'planets' | 'houses' | 'aspects'>(
    'summary',
  );
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const chart = useMemo(() => {
    return MOCK_NATAL_CHARTS[chartId ?? 'default'] ?? MOCK_NATAL_CHARTS.default;
  }, [chartId]);

  const bigThree = useMemo(() => {
    const sun = chart.planets.find((p) => p.name === 'Sun')!;
    const moon = chart.planets.find((p) => p.name === 'Moon')!;
    const rising = chart.planets.find((p) => p.name === 'Rising')!;
    return { sun, moon, rising };
  }, [chart.planets]);

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Simulate PDF generation
      await new Promise((resolve) => setTimeout(resolve, 3000));
      // In real app, this would call the API to generate PDF
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Natal Report for ${chart.name}`,
          text: 'Check out my astrological natal chart report',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    }
  };

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto px-6 lg:px-20 py-10 flex gap-8">
        {/* Left Content Area */}
        <div className="flex-1 space-y-12">
          {/* Report Header */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2 block">
                  Premium Natal Report
                </span>
                <h2 className="text-4xl font-bold text-white mb-2">{chart.name}</h2>
                <div className="flex flex-wrap items-center gap-4 text-purple-400 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    {chart.birthData.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    {chart.birthData.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {chart.birthData.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="mt-10 flex border-b border-primary/20 gap-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('summary')}
                className={`pb-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'summary'
                    ? 'border-primary text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-purple-400'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">insights</span>
                Summary
              </button>
              <button
                onClick={() => setActiveTab('planets')}
                className={`pb-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'planets'
                    ? 'border-primary text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-purple-400'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">language</span>
                Planets
              </button>
              <button
                onClick={() => setActiveTab('houses')}
                className={`pb-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'houses'
                    ? 'border-primary text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-purple-400'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
                Houses
              </button>
              <button
                onClick={() => setActiveTab('aspects')}
                className={`pb-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === 'aspects'
                    ? 'border-primary text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-purple-400'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                Aspects
              </button>
            </div>
          </motion.section>

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <>
              {/* Big Three Hero Section */}
              <motion.section
                className="bg-white/5 backdrop-blur-sm rounded-xl p-8 overflow-hidden relative border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400">stars</span>
                  The Big Three
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Sun Card */}
                  <PlanetaryPositionCard
                    planet={{
                      name: 'Sun',
                      symbol: '☉',
                      sign: bigThree.sun.sign,
                      degree: 0,
                      minute: 0,
                      house: bigThree.sun.house,
                      element: bigThree.sun.element as 'fire' | 'earth' | 'air' | 'water',
                    }}
                  />
                  {/* Moon Card */}
                  <PlanetaryPositionCard
                    planet={{
                      name: 'Moon',
                      symbol: '☽',
                      sign: bigThree.moon.sign,
                      degree: 0,
                      minute: 0,
                      house: bigThree.moon.house,
                      element: bigThree.moon.element as 'fire' | 'earth' | 'air' | 'water',
                    }}
                  />
                  {/* Rising Card */}
                  <PlanetaryPositionCard
                    planet={{
                      name: 'Rising',
                      symbol: '↑',
                      sign: bigThree.rising.sign,
                      degree: 0,
                      minute: 0,
                      house: bigThree.rising.house,
                      element: bigThree.rising.element as 'fire' | 'earth' | 'air' | 'water',
                    }}
                  />
                </div>
              </motion.section>

              {/* Elemental Balance & Chart Strength */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className="text-lg font-bold text-white mb-6">Elemental Balance</h3>
                  <ElementalBalance fire={35} earth={45} air={10} water={10} />
                </motion.div>
                <motion.div
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 flex flex-col items-center justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                >
                  <span className="material-symbols-outlined text-primary text-5xl mb-4">
                    auto_graph
                  </span>
                  <p className="text-white font-medium text-center">Chart Strength Overview</p>
                  <p className="text-slate-400 text-sm text-center mt-2 px-8">
                    Your chart shows a high concentration of Cardinal energy, indicating a natural
                    drive to start new projects and lead.
                  </p>
                </motion.div>
              </div>

              {/* Planets Breakdown */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-white mb-8">Personal Planets</h3>
                <div className="space-y-6">
                  {chart.planets
                    .filter((p) => ['Venus', 'Mars', 'Mercury', 'Jupiter'].includes(p.name))
                    .map((planet) => (
                      <PlanetaryPositionCard
                        key={planet.name}
                        planet={{
                          name: planet.name,
                          symbol: planet.name.charAt(0),
                          sign: planet.sign,
                          degree: planet.degree || 0,
                          minute: 0,
                          house: planet.house,
                          element: planet.element as 'fire' | 'earth' | 'air' | 'water',
                        }}
                      />
                    ))}
                </div>
              </motion.section>
            </>
          )}

          {/* Planets Tab */}
          {activeTab === 'planets' && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {chart.planets.map((planet) => (
                <PlanetaryPositionCard
                  key={planet.name}
                  planet={{
                    name: planet.name,
                    symbol: planet.name.charAt(0),
                    sign: planet.sign,
                    degree: planet.degree || 0,
                    minute: 0,
                    house: planet.house,
                    element: planet.element as 'fire' | 'earth' | 'air' | 'water',
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* Aspects Tab */}
          {activeTab === 'aspects' && (
            <motion.section
              className="bg-white/5 backdrop-blur-sm rounded-xl p-8 overflow-x-auto border border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-bold text-white mb-6">Aspect Grid Matrix</h3>
              <AspectGrid
                planets={chart.planets.map((p) => p.name)}
                aspects={chart.aspects as unknown as AspectGridData[]}
              />
            </motion.section>
          )}

          {/* Houses Tab */}
          {activeTab === 'houses' && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((houseNum) => {
                const planetsInHouse = chart.planets.filter((p) => p.house === houseNum);
                return (
                  <div
                    key={houseNum}
                    className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-bold">House {houseNum}</h4>
                      <span className="text-xs text-slate-500">
                        {planetsInHouse.length} planets
                      </span>
                    </div>
                    {planetsInHouse.length > 0 ? (
                      <div className="space-y-2">
                        {planetsInHouse.map((planet) => (
                          <div key={planet.name} className="flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-primary text-[16px]">
                              circle
                            </span>
                            <span className="text-slate-300">
                              {planet.name} in {planet.sign}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">Empty house</p>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Right Floating Sidebar */}
        <aside className="w-80 hidden xl:block sticky top-32 h-fit space-y-6">
          <motion.div
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-primary/30 relative overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="absolute -top-4 -right-4 size-20 bg-primary/20 blur-2xl rounded-full"></div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">diamond</span>
              Premium Actions
            </h4>
            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  void handleGeneratePDF();
                }}
                disabled={isGeneratingPDF}
                leftIcon={
                  <span className="material-symbols-outlined text-[18px]">
                    {isGeneratingPDF ? 'downloading' : 'download'}
                  </span>
                }
              >
                {isGeneratingPDF ? 'Generating...' : 'Download PDF Report'}
              </Button>
              <Button
                variant="secondary"
                fullWidth
                leftIcon={<span className="material-symbols-outlined text-[18px]">print</span>}
              >
                Order Printed Chart
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  void handleShare();
                }}
                leftIcon={<span className="material-symbols-outlined text-[18px]">share</span>}
              >
                Share Report
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="bg-primary/10 rounded-lg p-4">
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">
                  Current Transit
                </p>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-400">bolt</span>
                  <div>
                    <p className="text-xs text-white font-bold">Jupiter Retrograde</p>
                    <p className="text-[10px] text-slate-400">May affect career choices.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Upsell Card */}
          <motion.div
            className="rounded-xl overflow-hidden relative group aspect-square"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80"
              alt="Synastry Guide"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-[#0B0D17]/40 to-transparent p-6 flex flex-col justify-end">
              <h5 className="text-white font-bold text-lg mb-1">Synastry Guide</h5>
              <p className="text-slate-300 text-xs mb-4">
                Unlock compatibility secrets for your relationships.
              </p>
              <button
                onClick={() => navigate('/synastry')}
                className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1 group/btn"
              >
                Learn More{' '}
                <span className="material-symbols-outlined text-[14px] group-hover/btn:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </motion.div>
        </aside>
      </main>
    </AppLayout>
  );
};

export default DetailedNatalReportPage;
