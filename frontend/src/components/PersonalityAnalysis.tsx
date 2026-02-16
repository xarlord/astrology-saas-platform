import React from 'react'} from 'react';
import { PlanetSymbol, ZodiacBadge } from './';

// Types based on findings.md
export interface PlanetSignInterpretation {
  planet: string;
  sign: string;
  keywords: string[];
  general: string;
  strengths: string[];
  challenges: string[];
  advice: string[];
}

export interface HouseInterpretation {
  house: number;
  signOnCusp: string;
  planetsInHouse: string[];
  themes: string[];
  interpretation: string;
  advice: string[];
}

export interface AspectInterpretation {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  harmonious: boolean;
  keywords: string[];
  interpretation: string;
  expression: string;
  advice: string[];
}

export interface PersonalityAnalysisData {
  overview: {
    sunSign: PlanetSignInterpretation;
    moonSign: PlanetSignInterpretation;
    ascendantSign?: PlanetSignInterpretation;
  };
  planetsInSigns: PlanetSignInterpretation[];
  houses: HouseInterpretation[];
  aspects: AspectInterpretation[];
  patterns?: {
    type: string;
    description: string;
    planets: string[];
  }[];
}

interface PersonalityAnalysisProps {
  data: PersonalityAnalysisData;
}

export function PersonalityAnalysis({ data }: PersonalityAnalysisProps) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'planets' | 'houses' | 'aspects'>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'planets' as const, label: 'Planets in Signs', icon: '🪐' },
    { id: 'houses' as const, label: 'Houses', icon: '🏠' },
    { id: 'aspects' as const, label: 'Aspects', icon: '✨' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'planets' && <PlanetsTab data={data} />}
        {activeTab === 'houses' && <HousesTab data={data} />}
        {activeTab === 'aspects' && <AspectsTab data={data} />}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ data }: { data: PersonalityAnalysisData }) {
  return (
    <div className="space-y-6">
      {/* Core Identity - Sun */}
      <SummaryCard
        title="Core Identity"
        icon={<PlanetSymbol planet="sun" size="lg" />}
        accentColor="amber"
      >
        <PlanetInterpretationContent interpretation={data.overview.sunSign} />
      </SummaryCard>

      {/* Emotional Nature - Moon */}
      <SummaryCard
        title="Emotional Nature"
        icon={<PlanetSymbol planet="moon" size="lg" />}
        accentColor="slate"
      >
        <PlanetInterpretationContent interpretation={data.overview.moonSign} />
      </SummaryCard>

      {/* Ascendant (if available) */}
      {data.overview.ascendantSign && (
        <SummaryCard
          title="Outer Personality"
          icon={<span className="text-2xl">⇧</span>}
          accentColor="indigo"
        >
          <PlanetInterpretationContent interpretation={data.overview.ascendantSign} />
        </SummaryCard>
      )}
    </div>
  );
}

// Planets Tab Component
function PlanetsTab({ data }: { data: PersonalityAnalysisData }) {
  const [expandedPlanet, setExpandedPlanet] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      {data.planetsInSigns.map((item) => (
        <PlanetAccordion
          key={`${item.planet}-${item.sign}`}
          interpretation={item}
          isExpanded={expandedPlanet === item.planet}
          onToggle={() =>
            setExpandedPlanet(expandedPlanet === item.planet ? null : item.planet)
          }
        />
      ))}
    </div>
  );
}

// Houses Tab Component
function HousesTab({ data }: { data: PersonalityAnalysisData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.houses.map((house) => (
        <HouseCard key={house.house} house={house} />
      ))}
    </div>
  );
}

// Aspects Tab Component
function AspectsTab({ data }: { data: PersonalityAnalysisData }) {
  const aspectsByType = data.aspects.reduce((acc, aspect) => {
    if (!acc[aspect.aspect]) {
      acc[aspect.aspect] = [];
    }
    acc[aspect.aspect].push(aspect);
    return acc;
  }, {} as Record<string, AspectInterpretation[]>);

  return (
    <div className="space-y-6">
      {/* Aspect Patterns */}
      {data.patterns && data.patterns.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Aspect Patterns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.patterns.map((pattern, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4"
              >
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                  {pattern.type}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {pattern.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {pattern.planets.map((planet) => (
                    <PlanetSymbol key={planet} planet={planet} size="sm" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aspects by Type */}
      {Object.entries(aspectsByType).map(([aspectType, aspects]) => (
        <div key={aspectType}>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 capitalize flex items-center gap-2">
            <span className="text-xl">{getAspectSymbol(aspectType)}</span>
            {aspectType}s
          </h4>
          <div className="space-y-3">
            {aspects.map((aspect, index) => (
              <AspectCard key={index} aspect={aspect} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Sub-components

function SummaryCard({
  title,
  icon,
  accentColor,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  accentColor: 'amber' | 'slate' | 'indigo';
  children: React.ReactNode;
}) {
  const colorClasses = {
    amber: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800',
    slate: 'from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-slate-200 dark:border-slate-800',
    indigo: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[accentColor]} rounded-lg border p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function PlanetInterpretationContent({
  interpretation,
}: {
  interpretation: PlanetSignInterpretation;
}) {
  return (
    <div className="space-y-4">
      {/* Sign Badge */}
      <div className="flex items-center gap-2">
        <ZodiacBadge sign={interpretation.sign} size="lg" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          <PlanetSymbol planet={interpretation.planet} size="sm" /> in{' '}
          {interpretation.sign.charAt(0).toUpperCase() + interpretation.sign.slice(1)}
        </span>
      </div>

      {/* Keywords */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keywords</h4>
        <div className="flex flex-wrap gap-2">
          {interpretation.keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* General Interpretation */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Interpretation
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {interpretation.general}
        </p>
      </div>

      {/* Strengths and Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
            Strengths
          </h4>
          <ul className="space-y-1">
            {interpretation.strengths.map((strength, index) => (
              <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-2">
            Challenges
          </h4>
          <ul className="space-y-1">
            {interpretation.challenges.map((challenge, index) => (
              <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">!</span>
                {challenge}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Advice */}
      {interpretation.advice && interpretation.advice.length > 0 && (
        <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-2">
            Guidance
          </h4>
          <ul className="space-y-1">
            {interpretation.advice.map((item, index) => (
              <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <span className="text-indigo-500">💡</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PlanetAccordion({
  interpretation,
  isExpanded,
  onToggle,
}: {
  interpretation: PlanetSignInterpretation;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <PlanetSymbol planet={interpretation.planet} size="md" />
          <div className="text-left">
            <div className="font-medium text-gray-900 dark:text-white">
              {interpretation.planet.charAt(0).toUpperCase() + interpretation.planet.slice(1)} in{' '}
              {interpretation.sign.charAt(0).toUpperCase() + interpretation.sign.slice(1)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {interpretation.keywords.slice(0, 3).join(' • ')}
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
          <PlanetInterpretationContent interpretation={interpretation} />
        </div>
      )}
    </div>
  );
}

function HouseCard({ house }: { house: HouseInterpretation }) {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 rounded-full text-indigo-600 dark:text-indigo-300 font-bold text-sm">
          {house.house}
        </span>
        <ZodiacBadge sign={house.signOnCusp} size="md" />
      </div>

      {/* Planets in House */}
      {house.planetsInHouse.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {house.planetsInHouse.map((planet) => (
            <PlanetSymbol key={planet} planet={planet} size="sm" />
          ))}
        </div>
      )}

      {/* Themes */}
      {house.themes && house.themes.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {house.themes.map((theme, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
            >
              {theme}
            </span>
          ))}
        </div>
      )}

      {/* Interpretation */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{house.interpretation}</p>

      {/* Advice */}
      {house.advice && house.advice.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-500">
          <span className="font-medium">Advice:</span> {house.advice[0]}
        </div>
      )}
    </div>
  );
}

function AspectCard({ aspect }: { aspect: AspectInterpretation }) {
  return (
    <div
      className={`bg-white dark:bg-gray-700 rounded-lg border p-4 ${
        aspect.harmonious
          ? 'border-green-200 dark:border-green-800'
          : 'border-orange-200 dark:border-orange-800'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1">
          <PlanetSymbol planet={aspect.planet1} size="sm" />
          <span className={`text-lg ${aspect.harmonious ? 'text-green-600' : 'text-orange-600'}`}>
            {getAspectSymbol(aspect.aspect)}
          </span>
          <PlanetSymbol planet={aspect.planet2} size="sm" />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Orb: {aspect.orb}°
        </span>
      </div>

      {/* Keywords */}
      {aspect.keywords && aspect.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {aspect.keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-600 dark:text-gray-400">{aspect.interpretation}</p>

      {aspect.expression && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic">
          Expression: {aspect.expression}
        </p>
      )}
    </div>
  );
}

// Helper functions
function getAspectSymbol(aspect: string): string {
  const symbols: Record<string, string> = {
    conjunction: '☌',
    opposition: '☍',
    trine: '△',
    square: '□',
    sextile: '⚹',
    quincunx: '⚻',
    'semi-sextile': '⚺',
  };
  return symbols[aspect] || aspect;
}
