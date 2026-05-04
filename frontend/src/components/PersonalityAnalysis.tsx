import React from 'react';
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
    <div className="glass-panel rounded-2xl">
      {/* Tab Navigation */}
      <div className="border-b border-white/15">
        <nav className="flex -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-200 hover:text-slate-200 hover:border-white/15'
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
          <h3 className="text-lg font-semibold text-white mb-4">
            Aspect Patterns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.patterns.map((pattern, index) => (
              <div
                key={index}
                className="bg-white/15 rounded-lg border border-white/15 p-4"
              >
                <h4 className="font-semibold text-slate-200 mb-2">
                  {pattern.type}
                </h4>
                <p className="text-sm text-slate-200 mb-2">
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
          <h4 className="font-semibold text-white mb-3 capitalize flex items-center gap-2">
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
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    slate: 'from-slate-500/10 to-slate-500/5 border-cosmic-border/20',
    indigo: 'from-primary/10 to-violet-500/10 border-primary/20',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[accentColor]} rounded-lg border p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0">{icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
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
        <span className="text-sm text-slate-200">
          <PlanetSymbol planet={interpretation.planet} size="sm" /> in{' '}
          {interpretation.sign.charAt(0).toUpperCase() + interpretation.sign.slice(1)}
        </span>
      </div>

      {/* Keywords */}
      <div>
        <h4 className="text-sm font-medium text-slate-200 mb-2">Keywords</h4>
        <div className="flex flex-wrap gap-2">
          {interpretation.keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/15 rounded-full text-xs text-slate-200"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* General Interpretation */}
      <div>
        <h4 className="text-sm font-medium text-slate-200 mb-2">
          Interpretation
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed">
          {interpretation.general}
        </p>
      </div>

      {/* Strengths and Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-green-400 mb-2">
            Strengths
          </h4>
          <ul className="space-y-1">
            {interpretation.strengths.map((strength, index) => (
              <li key={index} className="text-xs text-slate-200 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium text-orange-400 mb-2">
            Challenges
          </h4>
          <ul className="space-y-1">
            {interpretation.challenges.map((challenge, index) => (
              <li key={index} className="text-xs text-slate-200 flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">!</span>
                {challenge}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Advice */}
      {interpretation.advice && interpretation.advice.length > 0 && (
        <div className="bg-white/15 rounded-lg p-3">
          <h4 className="text-sm font-medium text-primary mb-2">
            Guidance
          </h4>
          <ul className="space-y-1">
            {interpretation.advice.map((item, index) => (
              <li key={index} className="text-xs text-slate-200 flex items-start gap-2">
                <span className="text-primary">💡</span>
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
    <div className="border border-white/15 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-cosmic-card/70 backdrop-blur-md hover:bg-white/15 transition-colors"
      >
        <div className="flex items-center gap-3">
          <PlanetSymbol planet={interpretation.planet} size="md" />
          <div className="text-left">
            <div className="font-medium text-white">
              {interpretation.planet.charAt(0).toUpperCase() + interpretation.planet.slice(1)} in{' '}
              {interpretation.sign.charAt(0).toUpperCase() + interpretation.sign.slice(1)}
            </div>
            <div className="text-xs text-slate-200">
              {interpretation.keywords.slice(0, 3).join(' • ')}
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-slate-200 transition-transform ${
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
        <div className="p-4 bg-white/15 border-t border-white/15">
          <PlanetInterpretationContent interpretation={interpretation} />
        </div>
      )}
    </div>
  );
}

function HouseCard({ house }: { house: HouseInterpretation }) {
  return (
    <div className="bg-white/15 rounded-lg border border-white/15 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full text-primary font-bold text-sm">
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
              className="px-2 py-0.5 bg-white/15 rounded text-xs text-slate-200"
            >
              {theme}
            </span>
          ))}
        </div>
      )}

      {/* Interpretation */}
      <p className="text-sm text-slate-200 mb-3">{house.interpretation}</p>

      {/* Advice */}
      {house.advice && house.advice.length > 0 && (
        <div className="text-xs text-slate-200">
          <span className="font-medium">Advice:</span> {house.advice[0]}
        </div>
      )}
    </div>
  );
}

function AspectCard({ aspect }: { aspect: AspectInterpretation }) {
  return (
    <div
      className={`bg-white/15 rounded-lg border p-4 ${
        aspect.harmonious
          ? 'border-green-500/20'
          : 'border-orange-500/20'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1">
          <PlanetSymbol planet={aspect.planet1} size="sm" />
          <span className={`text-lg ${aspect.harmonious ? 'text-green-400' : 'text-orange-400'}`}>
            {getAspectSymbol(aspect.aspect)}
          </span>
          <PlanetSymbol planet={aspect.planet2} size="sm" />
        </div>
        <span className="text-xs text-slate-200">
          Orb: {aspect.orb}°
        </span>
      </div>

      {/* Keywords */}
      {aspect.keywords && aspect.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {aspect.keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-white/15 rounded text-xs text-slate-200"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-slate-200">{aspect.interpretation}</p>

      {aspect.expression && (
        <p className="text-xs text-slate-200 mt-2 italic">
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
