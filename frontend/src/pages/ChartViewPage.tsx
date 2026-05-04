/**
 * Chart View Page Component
 * Displays a single natal chart with wheel visualization, planetary positions, and analysis link.
 */

import { SkeletonLoader, EmptyState, AppLayout, ChartWheel, ChartWheelLegend } from '../components';
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useChartsStore } from '../store/chartsStore';
import type { ChartData, HouseCusp, Aspect, PlanetData, PlanetPosition } from '../types/chart.types';

const ZODIAC_SIGNS = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];

function signFromDegree(deg: number): string {
  return ZODIAC_SIGNS[Math.floor(((deg % 360) + 360) % 360 / 30)];
}

function degreeToDms(totalDeg: number): { degree: number; minute: number; second: number } {
  const abs = ((totalDeg % 360) + 360) % 360;
  const degree = Math.floor(abs);
  const minFloat = (abs - degree) * 60;
  const minute = Math.floor(minFloat);
  const second = Math.round((minFloat - minute) * 60);
  return { degree, minute, second };
}

interface BackendHouse { cusp: number; size: number }
interface BackendAspect { orb: number; type: string; planet1: string; planet2: string; applying?: boolean; exact?: boolean; harmonious?: boolean }

export default function ChartViewPage() {
  const { id: chartId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentChart, isLoading, error, fetchChart } = useChartsStore();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!chartId) {
      setLocalError('No chart ID provided.');
      return;
    }

    void fetchChart(chartId);
  }, [chartId, fetchChart]);

  // Extract and convert ChartData from the chart's calculated_data
  const { chartData, planetList } = (() => {
    if (!currentChart?.calculated_data) return { chartData: null as ChartData | null, planetList: [] as PlanetPosition[] };
    const calc = currentChart.calculated_data as Record<string, unknown>;
    const hasPlanets = calc.planets !== undefined && calc.planets !== null;
    const hasHouses = Array.isArray(calc.houses);
    const hasAspects = Array.isArray(calc.aspects);
    if (!hasPlanets || !hasHouses || !hasAspects) return { chartData: null as ChartData | null, planetList: [] as PlanetPosition[] };

    // Convert planets
    const rawPlanets = calc.planets as Record<string, PlanetData> | PlanetPosition[];
    const pList: PlanetPosition[] = Array.isArray(rawPlanets)
      ? rawPlanets
      : Object.entries(rawPlanets).map(([name, p]) => ({
          planet: name,
          sign: p.sign,
          degree: p.degree,
          minute: p.minute,
          second: p.second ?? 0,
          house: p.house ?? 0,
          retrograde: p.isRetrograde ?? false,
          latitude: p.latitude ?? 0,
          longitude: p.longitude ?? 0,
          speed: p.speed ?? 0,
        }));

    // Convert houses: backend [{cusp, size}] → frontend [{house, sign, degree, minute, second}]
    const rawHouses = calc.houses as BackendHouse[];
    const houses: HouseCusp[] = rawHouses.map((h, i) => {
      const dms = degreeToDms(h.cusp);
      return {
        house: i + 1,
        sign: signFromDegree(h.cusp),
        ...dms,
      };
    });

    // Convert aspects: backend [{orb, type, planet1, planet2}] → frontend [{degree, minute, orb, ...}]
    const rawAspects = calc.aspects as BackendAspect[];
    const aspects: Aspect[] = rawAspects.map((a) => {
      const orbDms = degreeToDms(a.orb);
      return {
        planet1: a.planet1,
        planet2: a.planet2,
        type: a.type as Aspect['type'],
        degree: orbDms.degree,
        minute: orbDms.minute,
        orb: Math.round(a.orb * 100) / 100,
        applying: a.applying ?? false,
        separating: !a.applying,
      };
    });

    return {
      chartData: { planets: pList, houses, aspects } as ChartData,
      planetList: pList,
    };
  })();

  const displayError = localError ?? error;
  const displayLoading = isLoading && !currentChart;

  // No chart ID at all
  if (!chartId) {
    return (
      <AppLayout>
        <EmptyState
          icon="📊"
          title="No chart specified"
          description="No chart ID was provided in the URL."
          actionText="Back to Dashboard"
          onAction={() => navigate('/dashboard')}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 gradient-text">
          {currentChart ? currentChart.name : 'Natal Chart'}
        </h1>
        {currentChart && (
          <p className="text-slate-200">
            {currentChart.birth_date} &middot; {currentChart.birth_time} &middot;{' '}
            {currentChart.birth_place_name}
          </p>
        )}
      </div>

      {displayLoading ? (
        <SkeletonLoader variant="chart" />
      ) : displayError ? (
        <EmptyState
          icon="⚠️"
          title="Unable to load chart"
          description={displayError}
          actionText="Retry"
          onAction={() => {
            setLocalError(null);
            void fetchChart(chartId);
          }}
          secondaryActionText="Back to Dashboard"
          onSecondaryAction={() => navigate('/dashboard')}
        />
      ) : !currentChart ? (
        <EmptyState
          icon="📊"
          title="Chart not found"
          description="The requested chart could not be found. It may have been deleted or you may not have access to it."
          actionText="Back to Dashboard"
          onAction={() => navigate('/dashboard')}
        />
      ) : !chartData ? (
        <div className="space-y-6">
          {/* Chart exists but hasn't been calculated yet */}
          <EmptyState
            icon="🧮"
            title="Chart not yet calculated"
            description="This chart has been created but not yet calculated. Calculate it to see the full chart wheel and planetary positions."
            actionText="Back to Dashboard"
            onAction={() => navigate('/dashboard')}
          />
          <div className="text-center">
            <Link
              to={`/analysis/${chartId}`}
              className="inline-block bg-cosmic-gradient text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              View Analysis
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Chart Wheel */}
            <div className="bg-cosmic-card-solid border border-white/15 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Chart Wheel</h2>
              <ChartWheel data={chartData} interactive={true} />
              <ChartWheelLegend />
            </div>

            {/* Planetary Positions */}
            <div className="bg-cosmic-card-solid border border-white/15 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Planetary Positions</h2>
              <div className="space-y-2">
                {planetList.map((planet) => (
                  <div
                    key={planet.planet}
                    className="flex justify-between py-2 border-b border-white/15"
                  >
                    <span className="font-medium capitalize">{planet.planet}</span>
                    <span className="text-slate-200">
                      {planet.sign} {planet.degree}&deg;{planet.minute}&apos;{' '}
                      {planet.retrograde && '(R)'}
                    </span>
                  </div>
                ))}
              </div>

              {/* House Cusps */}
              <h2 className="text-xl font-bold mb-4 mt-6">House Cusps</h2>
              <div className="space-y-2">
                {chartData.houses.map((house) => (
                  <div
                    key={house.house}
                    className="flex justify-between py-2 border-b border-white/15"
                  >
                    <span className="font-medium">House {house.house}</span>
                    <span className="text-slate-200 capitalize">
                      {house.sign} {house.degree}&deg;{house.minute}&apos;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link
              to={`/analysis/${chartId}`}
              className="inline-block bg-cosmic-gradient text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              View Analysis
            </Link>
          </div>
        </>
      )}
    </AppLayout>
  );
}
