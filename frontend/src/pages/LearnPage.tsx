/**
 * Learn Page — Comprehensive Astrology Education Module
 * Sections: Planets, Houses, Aspects, Transits, Glossary
 * UX: Search, filter by difficulty, learning path, progress tracking, expandable cards
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import {
  planets,
  houses,
  aspects,
  transitIntro,
  transitCategories,
  transitFormula,
  transitExamples,
  glossary,
} from '../data/learn';
import type {
  DifficultyLevel,
  LearnSection,
  PlanetCard,
  HouseCard,
  AspectCard,
  GlossaryEntry,
  LearningPathStep,
} from '../data/learn/types';

// ────────────────────────────────────────────
// Learning Path
// ────────────────────────────────────────────
const learningPath: LearningPathStep[] = [
  { id: 'lp-overview', title: 'Start Here', section: 'overview', order: 0, description: 'Welcome and overview of astrology fundamentals.' },
  { id: 'lp-planets', title: 'Planets', section: 'planets', order: 1, description: 'The celestial bodies that shape your chart.' },
  { id: 'lp-houses', title: 'Houses', section: 'houses', order: 2, description: 'Twelve domains of life experience.' },
  { id: 'lp-aspects', title: 'Aspects', section: 'aspects', order: 3, description: 'Angular relationships between planets.' },
  { id: 'lp-transits', title: 'Transits', section: 'transits', order: 4, description: 'How current planetary movements interact with your chart.' },
  { id: 'lp-glossary', title: 'Glossary', section: 'glossary', order: 5, description: 'Key astrological terms and definitions.' },
];

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────
const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  beginner: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};

const SECTION_ICONS: Record<LearnSection, string> = {
  overview: 'school',
  planets: 'auto_awesome',
  signs: 'star',
  houses: 'grid_view',
  aspects: 'hexagon',
  transits: 'motion_photos_on',
  reading: 'menu_book',
  glossary: 'book_5',
};

const SECTION_TITLES: Record<LearnSection, string> = {
  overview: 'Learning Path',
  planets: 'The Planets',
  signs: 'The Signs',
  houses: 'The Houses',
  aspects: 'The Aspects',
  transits: 'Understanding Transits',
  reading: 'Chart Reading',
  glossary: 'Glossary',
};

const SECTION_SUBTITLES: Record<LearnSection, string> = {
  overview: 'Your journey into astrology starts here',
  planets: 'The celestial bodies that shape your chart',
  signs: 'The twelve zodiac signs and their qualities',
  houses: 'Twelve domains of life experience',
  aspects: 'Angular relationships between planets',
  transits: 'How current planetary movements activate your chart',
  reading: 'How to read and interpret a birth chart',
  glossary: 'Key astrological terms and definitions',
};

const SECTION_COLORS: Record<LearnSection, string> = {
  overview: '#6366f1',
  planets: '#f59e0b',
  signs: '#f97316',
  houses: '#10b981',
  aspects: '#3b82f6',
  transits: '#8b5cf6',
  reading: '#06b6d4',
  glossary: '#ec4899',
};

// ────────────────────────────────────────────
// Sub-Components
// ────────────────────────────────────────────

function DifficultyBadge({ level }: { level: DifficultyLevel }) {
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
      style={{
        backgroundColor: `${DIFFICULTY_COLORS[level]}20`,
        color: DIFFICULTY_COLORS[level],
      }}
    >
      {DIFFICULTY_LABELS[level]}
    </span>
  );
}

function InfoBlock({ label, children, icon }: { label: string; children: React.ReactNode; icon?: string }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon && <span className="material-symbols-outlined text-sm opacity-70" aria-hidden="true">{icon}</span>}
        <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">{label}</h5>
      </div>
      <div className="text-sm text-slate-200 leading-relaxed">{children}</div>
    </div>
  );
}

function QuestionList({ questions }: { questions: string[] }) {
  return (
    <ul className="space-y-1.5">
      {questions.map((q, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
          <span className="text-primary mt-0.5 flex-shrink-0">•</span>
          <span>{q}</span>
        </li>
      ))}
    </ul>
  );
}

function ExpandableCard({
  id,
  title,
  subtitle,
  accentColor,
  difficulty,
  completedTopics,
  onToggleComplete,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  accentColor: string;
  difficulty?: DifficultyLevel;
  completedTopics: Set<string>;
  onToggleComplete: (id: string) => void;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isCompleted = completedTopics.has(id);

  return (
    <div className={`glass-panel rounded-2xl border overflow-hidden transition-colors ${isCompleted ? 'border-green-500/30' : 'border-white/15'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/10 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-1 h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-white truncate">{title}</h4>
              {difficulty && <DifficultyBadge level={difficulty} />}
              {isCompleted && (
                <span className="material-symbols-outlined text-green-400 text-base" aria-label="Completed">check_circle</span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-slate-200 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        <span className="material-symbols-outlined text-slate-200 flex-shrink-0 text-xl" aria-hidden="true">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0">
          <div className="border-t border-white/[0.08] pt-4">
            {children}
            <div className="mt-4 pt-3 border-t border-white/[0.05] flex justify-end">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleComplete(id); }}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  isCompleted
                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {isCompleted ? '✓ Completed' : 'Mark as Completed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────
// Section Renderers
// ────────────────────────────────────────────

function _PlanetSection({ completedTopics, onToggleComplete }: { completedTopics: Set<string>; onToggleComplete: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {planets.map((p: PlanetCard) => (
        <ExpandableCard
          key={p.id}
          id={p.id}
          title={`${p.symbol} ${p.name}`}
          accentColor={p.color}
          difficulty={p.difficulty}
          completedTopics={completedTopics}
          onToggleComplete={onToggleComplete}
        >
          <InfoBlock label="Core Function" icon="stars">
            {p.coreFunction}
          </InfoBlock>
          <InfoBlock label="Psychological Meaning" icon="psychology">
            {p.psychologicalMeaning}
          </InfoBlock>
          <InfoBlock label="In a Birth Chart" icon="person">
            {p.inBirthChart}
          </InfoBlock>
          <InfoBlock label="In Transit" icon="motion_photos_on">
            {p.inTransit}
          </InfoBlock>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-3">
              <h5 className="text-xs font-semibold text-green-400 mb-1">Healthy Expression</h5>
              <p className="text-xs text-slate-200">{p.healthyExpression}</p>
            </div>
            <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
              <h5 className="text-xs font-semibold text-red-400 mb-1">Difficult Expression</h5>
              <p className="text-xs text-slate-200">{p.difficultExpression}</p>
            </div>
          </div>
          {p.practicalExample && (
            <InfoBlock label="Practical Example" icon="lightbulb">
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                {p.practicalExample}
              </div>
            </InfoBlock>
          )}
          {p.commonMisconception && (
            <InfoBlock label="Common Misconception" icon="warning">
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                {p.commonMisconception}
              </div>
            </InfoBlock>
          )}
          <InfoBlock label="Interpretation Questions" icon="help">
            <QuestionList questions={p.interpretationQuestions} />
          </InfoBlock>
          <InfoBlock label="Beginner Tip" icon="tips_and_updates">
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 italic">
              {p.beginnerTip}
            </div>
          </InfoBlock>
        </ExpandableCard>
      ))}
    </div>
  );
}

function _HouseSection({ completedTopics, onToggleComplete }: { completedTopics: Set<string>; onToggleComplete: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {houses.map((h: HouseCard) => (
        <ExpandableCard
          key={h.id}
          id={h.id}
          title={`House ${h.number} — ${h.title}`}
          accentColor={h.accentColor}
          difficulty={h.difficulty}
          completedTopics={completedTopics}
          onToggleComplete={onToggleComplete}
        >
          <InfoBlock label="Main Theme" icon="category">
            {h.mainTheme}
          </InfoBlock>
          <InfoBlock label="Psychological Meaning" icon="psychology">
            {h.psychologicalMeaning}
          </InfoBlock>
          <InfoBlock label="Life Areas" icon="dashboard">
            <div className="flex flex-wrap gap-1.5">
              {h.lifeAreas.map((area, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-slate-200">{area}</span>
              ))}
            </div>
          </InfoBlock>
          <InfoBlock label="What Planets Here Emphasize" icon="auto_awesome">
            {h.whatPlanetsEmphasize}
          </InfoBlock>
          <InfoBlock label="Transit Meaning" icon="motion_photos_on">
            {h.transitMeaning}
          </InfoBlock>
          {h.practicalExample && (
            <InfoBlock label="Practical Example" icon="lightbulb">
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                {h.practicalExample}
              </div>
            </InfoBlock>
          )}
          <InfoBlock label="Common Misconception" icon="warning">
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
              {h.commonMisconception}
            </div>
          </InfoBlock>
          <InfoBlock label="Interpretation Questions" icon="help">
            <QuestionList questions={h.interpretationQuestions} />
          </InfoBlock>
          {h.beginnerTip && (
            <InfoBlock label="Beginner Tip" icon="tips_and_updates">
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 italic">
                {h.beginnerTip}
              </div>
            </InfoBlock>
          )}
        </ExpandableCard>
      ))}
    </div>
  );
}

function _AspectSection({ completedTopics, onToggleComplete }: { completedTopics: Set<string>; onToggleComplete: (id: string) => void }) {
  const natureColor = (nature: string) => {
    if (nature === 'Harmonious') return '#22c55e';
    if (nature === 'Challenging') return '#ef4444';
    return '#f59e0b';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {aspects.map((a: AspectCard) => (
        <ExpandableCard
          key={a.id}
          id={a.id}
          title={`${a.symbol} ${a.name} (${a.angle})`}
          subtitle={a.nature}
          accentColor={a.accentColor}
          difficulty={a.difficulty}
          completedTopics={completedTopics}
          onToggleComplete={onToggleComplete}
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${natureColor(a.nature)}20`,
                color: natureColor(a.nature),
              }}
            >
              {a.nature}
            </span>
          </div>
          <InfoBlock label="Meaning" icon="info">
            {a.meaning}
          </InfoBlock>
          <InfoBlock label="Psychological Function" icon="psychology">
            {a.psychologicalFunction}
          </InfoBlock>
          <InfoBlock label="How It Appears in Real Life" icon="visibility">
            {a.howItAppearsInRealLife}
          </InfoBlock>
          <InfoBlock label="How to Interpret in a Birth Chart" icon="person">
            {a.howToInterpretInBirthChart}
          </InfoBlock>
          {a.practicalExample && (
            <InfoBlock label="Practical Example" icon="lightbulb">
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                {a.practicalExample}
              </div>
            </InfoBlock>
          )}
          {a.interpretationTip && (
            <InfoBlock label="Interpretation Tip" icon="tips_and_updates">
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 italic">
                {a.interpretationTip}
              </div>
            </InfoBlock>
          )}
          <InfoBlock label="Common Misconception" icon="warning">
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
              {a.commonMisconception}
            </div>
          </InfoBlock>
          <InfoBlock label="Beginner Tip" icon="tips_and_updates">
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 italic">
              {a.beginnerTip}
            </div>
          </InfoBlock>
        </ExpandableCard>
      ))}
    </div>
  );
}

function TransitSection({ completedTopics, onToggleComplete }: { completedTopics: Set<string>; onToggleComplete: (id: string) => void }) {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="glass-panel rounded-2xl border border-white/15 p-6">
        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{transitIntro}</p>
      </div>

      {/* Transit Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {transitCategories.map((cat) => (
          <div key={cat.id} className="glass-panel rounded-2xl border border-white/15 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-lg" aria-hidden="true" style={{ color: cat.speed === 'fast' ? '#22c55e' : cat.speed === 'social' ? '#f59e0b' : '#ef4444' }}>
                {cat.speed === 'fast' ? 'speed' : cat.speed === 'social' ? 'groups' : 'public'}
              </span>
              <h4 className="font-semibold text-white">{cat.name}</h4>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {cat.planets.map((planet) => (
                <span key={planet} className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-slate-200">{planet}</span>
              ))}
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{cat.description}</p>
          </div>
        ))}
      </div>

      {/* Formula */}
      <div className="glass-panel rounded-2xl border border-primary/20 p-6 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">function</span>
          <h4 className="font-semibold text-white">{transitFormula.label}</h4>
        </div>
        <div className="text-center py-3 px-4 bg-white/5 rounded-xl mb-3">
          <code className="text-primary font-mono text-sm">{transitFormula.formula}</code>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">{transitFormula.description}</p>
      </div>

      {/* Examples */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-lg" aria-hidden="true" style={{ color: '#8b5cf6' }}>topic</span>
          <h4 className="font-semibold text-white">Transit Examples</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transitExamples.map((ex) => (
            <ExpandableCard
              key={ex.id}
              id={ex.id}
              title={ex.title}
              accentColor="#8b5cf6"
              difficulty={ex.difficulty}
              completedTopics={completedTopics}
              onToggleComplete={onToggleComplete}
            >
              <InfoBlock label="Meaning" icon="info">
                {ex.meaning}
              </InfoBlock>
            </ExpandableCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function GlossarySection({ searchQuery }: { searchQuery: string }) {
  const filtered = useMemo(() => {
    if (!searchQuery) return glossary;
    const q = searchQuery.toLowerCase();
    return glossary.filter(
      (g: GlossaryEntry) =>
        g.term.toLowerCase().includes(q) ||
        g.definition.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {filtered.map((g: GlossaryEntry) => (
        <div key={g.id} className="glass-panel rounded-2xl border border-white/15 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-lg" aria-hidden="true" style={{ color: SECTION_COLORS.glossary }}>book_5</span>
            <h4 className="font-semibold text-white">{g.term}</h4>
            <DifficultyBadge level={g.difficulty} />
          </div>
          <p className="text-sm text-slate-200 leading-relaxed mb-3">{g.definition}</p>
          {g.practicalExample && (
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-3">
              <h5 className="text-xs font-semibold text-primary mb-1">Example</h5>
              <p className="text-xs text-slate-200">{g.practicalExample}</p>
            </div>
          )}
          {g.relatedTerms && g.relatedTerms.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400">Related:</span>
              {g.relatedTerms.map((rt) => (
                <span key={rt} className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-slate-300">{rt}</span>
              ))}
            </div>
          )}
        </div>
      ))}
      {filtered.length === 0 && (
        <div className="col-span-full text-center py-8 text-slate-400">
          No glossary terms match "{searchQuery}"
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────
// Progress helpers (localStorage)
// ────────────────────────────────────────────
const STORAGE_KEY = 'astroverse-learn-progress';

function loadProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr: string[] = JSON.parse(raw) as string[];
      return new Set(arr);
    }
  } catch {
    // ignore
  }
  return new Set();
}

function saveProgress(completed: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  } catch {
    // ignore
  }
}

// ────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────
export default function LearnPage() {
  const [activeSection, setActiveSection] = useState<LearnSection>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'all'>('all');
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(loadProgress);

  // Persist progress
  useEffect(() => {
    saveProgress(completedTopics);
  }, [completedTopics]);

  const toggleComplete = useCallback((id: string) => {
    setCompletedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Total topics count
  const totalTopics = useMemo(
    () => planets.length + houses.length + aspects.length + transitExamples.length,
    []
  );
  const completedCount = useMemo(
    () =>
      [...completedTopics].filter((id) =>
        planets.some((p) => p.id === id) ||
        houses.some((h) => h.id === id) ||
        aspects.some((a) => a.id === id) ||
        transitExamples.some((t) => t.id === id)
      ).length,
    [completedTopics]
  );
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  // Filtered data for search (applies to planets, houses, aspects)
  const filteredPlanets = useMemo(() => {
    let data = planets;
    if (difficultyFilter !== 'all') data = data.filter((p) => p.difficulty === difficultyFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter((p) => p.name.toLowerCase().includes(q) || p.coreFunction.toLowerCase().includes(q));
    }
    return data;
  }, [difficultyFilter, searchQuery]);

  const filteredHouses = useMemo(() => {
    let data = houses;
    if (difficultyFilter !== 'all') data = data.filter((h) => h.difficulty === difficultyFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter((h) => h.title.toLowerCase().includes(q) || h.mainTheme.toLowerCase().includes(q));
    }
    return data;
  }, [difficultyFilter, searchQuery]);

  const filteredAspects = useMemo(() => {
    let data = aspects;
    if (difficultyFilter !== 'all') data = data.filter((a) => a.difficulty === difficultyFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter((a) => a.name.toLowerCase().includes(q) || a.meaning.toLowerCase().includes(q));
    }
    return data;
  }, [difficultyFilter, searchQuery]);

  // Suggested next lesson
  const suggestedNext = useMemo(() => {
    const allSections: LearnSection[] = ['planets', 'houses', 'aspects', 'transits'];
    for (const sec of allSections) {
      const items =
        sec === 'planets' ? planets :
        sec === 'houses' ? houses :
        sec === 'aspects' ? aspects :
        transitExamples;
      const incomplete = items.find((item) => !completedTopics.has(item.id));
      if (incomplete) {
        return { section: sec, title: 'name' in incomplete ? (incomplete as PlanetCard).name : (incomplete as { title: string }).title };
      }
    }
    return null;
  }, [completedTopics]);

  const sectionTabs: LearnSection[] = ['overview', 'planets', 'houses', 'aspects', 'transits', 'glossary'];

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <span className="material-symbols-outlined text-primary" aria-hidden="true" style={{ fontSize: '22px' }}>menu_book</span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Learn Astrology</h1>
            <p className="text-slate-200 mt-1">
              Comprehensive guide to planets, houses, aspects, transits & more
            </p>
          </div>
          {/* Progress */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-400">Progress</p>
              <p className="text-sm font-semibold text-white">{completedCount}/{totalTopics} topics</p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#6366f1" strokeWidth="3"
                  strokeDasharray={`${progressPercent} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" aria-hidden="true">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, terms, concepts..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
              aria-label="Search learn topics"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficultyFilter(level)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  difficultyFilter === level
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-transparent'
                }`}
              >
                {level === 'all' ? 'All Levels' : DIFFICULTY_LABELS[level]}
              </button>
            ))}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex overflow-x-auto gap-1 pb-2 scrollbar-hide">
          {sectionTabs.map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeSection === sec
                  ? 'text-white border'
                  : 'text-slate-300 bg-white/5 hover:bg-white/10 border border-transparent'
              }`}
              style={activeSection === sec ? { backgroundColor: `${SECTION_COLORS[sec]}20`, borderColor: `${SECTION_COLORS[sec]}40`, color: SECTION_COLORS[sec] } : {}}
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">{SECTION_ICONS[sec]}</span>
              {SECTION_TITLES[sec]}
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      {activeSection === 'overview' && (
        <section>
          {/* Welcome */}
          <div className="glass-panel rounded-2xl border border-white/15 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-2">Welcome to AstroVerse Learn</h2>
            <p className="text-sm text-slate-200 leading-relaxed mb-4">
              Astrology is a symbolic language that describes the relationship between the cosmos and human experience.
              This guide will take you from complete beginner to confident chart interpreter.
              Each section builds on the last — follow the path or jump to any topic that interests you.
            </p>
            {suggestedNext && (
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">arrow_forward</span>
                <div>
                  <p className="text-xs text-slate-400">Continue Learning</p>
                  <button
                    onClick={() => setActiveSection(suggestedNext.section)}
                    className="text-sm font-semibold text-primary hover:underline cursor-pointer"
                  >
                    {suggestedNext.title} →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Learning Path */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Suggested Learning Path</h3>
            <div className="space-y-3">
              {learningPath.map((step, idx) => {
                const sectionItems =
                  step.section === 'planets' ? planets :
                  step.section === 'houses' ? houses :
                  step.section === 'aspects' ? aspects :
                  step.section === 'transits' ? transitExamples :
                  step.section === 'glossary' ? glossary :
                  [];
                const done = sectionItems.length > 0
                  ? sectionItems.filter((item) => completedTopics.has(item.id)).length
                  : 0;
                const total = sectionItems.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveSection(step.section)}
                    className="w-full flex items-center gap-4 p-4 glass-panel rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-left cursor-pointer"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${SECTION_COLORS[step.section]}20` }}
                    >
                      <span className="material-symbols-outlined text-lg" aria-hidden="true" style={{ color: SECTION_COLORS[step.section] }}>
                        {SECTION_ICONS[step.section]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-mono">{idx + 1}</span>
                        <h4 className="font-semibold text-white">{step.title}</h4>
                        {pct === 100 && total > 0 && (
                          <span className="material-symbols-outlined text-green-400 text-base" aria-label="Section complete">check_circle</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{step.description}</p>
                      {total > 0 && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: SECTION_COLORS[step.section] }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400">{done}/{total}</span>
                        </div>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-slate-400 flex-shrink-0" aria-hidden="true">chevron_right</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Planets', count: planets.length, color: '#f59e0b' },
              { label: 'Houses', count: houses.length, color: '#10b981' },
              { label: 'Aspects', count: aspects.length, color: '#3b82f6' },
              { label: 'Glossary', count: glossary.length, color: '#ec4899' },
            ].map((stat) => (
              <div key={stat.label} className="glass-panel rounded-xl border border-white/10 p-4 text-center">
                <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.count}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeSection === 'planets' && (
        <section>
          <SectionHeader section="planets" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPlanets.map((p: PlanetCard) => (
              <ExpandableCard
                key={p.id}
                id={p.id}
                title={`${p.symbol} ${p.name}`}
                accentColor={p.color}
                difficulty={p.difficulty}
                completedTopics={completedTopics}
                onToggleComplete={toggleComplete}
              >
                <InfoBlock label="Core Function" icon="stars">{p.coreFunction}</InfoBlock>
                <InfoBlock label="Psychological Meaning" icon="psychology">{p.psychologicalMeaning}</InfoBlock>
                <InfoBlock label="In a Birth Chart" icon="person">{p.inBirthChart}</InfoBlock>
                <InfoBlock label="In Transit" icon="motion_photos_on">{p.inTransit}</InfoBlock>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-3">
                    <h5 className="text-xs font-semibold text-green-400 mb-1">Healthy Expression</h5>
                    <p className="text-xs text-slate-200">{p.healthyExpression}</p>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                    <h5 className="text-xs font-semibold text-red-400 mb-1">Difficult Expression</h5>
                    <p className="text-xs text-slate-200">{p.difficultExpression}</p>
                  </div>
                </div>
                {p.practicalExample && (
                  <InfoBlock label="Practical Example" icon="lightbulb">
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">{p.practicalExample}</div>
                  </InfoBlock>
                )}
                {p.commonMisconception && (
                  <InfoBlock label="Common Misconception" icon="warning">
                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">{p.commonMisconception}</div>
                  </InfoBlock>
                )}
                <InfoBlock label="Interpretation Questions" icon="help">
                  <QuestionList questions={p.interpretationQuestions} />
                </InfoBlock>
                <InfoBlock label="Beginner Tip" icon="tips_and_updates">
                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 italic">{p.beginnerTip}</div>
                </InfoBlock>
              </ExpandableCard>
            ))}
          </div>
          {filteredPlanets.length === 0 && <EmptyState query={searchQuery} />}
        </section>
      )}

      {activeSection === 'houses' && (
        <section>
          <SectionHeader section="houses" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredHouses.map((h: HouseCard) => (
              <ExpandableCard
                key={h.id}
                id={h.id}
                title={`House ${h.number} — ${h.title}`}
                accentColor={h.accentColor}
                difficulty={h.difficulty}
                completedTopics={completedTopics}
                onToggleComplete={toggleComplete}
              >
                <InfoBlock label="Main Theme" icon="category">{h.mainTheme}</InfoBlock>
                <InfoBlock label="Psychological Meaning" icon="psychology">{h.psychologicalMeaning}</InfoBlock>
                <InfoBlock label="Life Areas" icon="dashboard">
                  <div className="flex flex-wrap gap-1.5">
                    {h.lifeAreas.map((area, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-slate-200">{area}</span>
                    ))}
                  </div>
                </InfoBlock>
                <InfoBlock label="What Planets Here Emphasize" icon="auto_awesome">{h.whatPlanetsEmphasize}</InfoBlock>
                <InfoBlock label="Transit Meaning" icon="motion_photos_on">{h.transitMeaning}</InfoBlock>
                {h.practicalExample && (
                  <InfoBlock label="Practical Example" icon="lightbulb">
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">{h.practicalExample}</div>
                  </InfoBlock>
                )}
                <InfoBlock label="Common Misconception" icon="warning">
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">{h.commonMisconception}</div>
                </InfoBlock>
                <InfoBlock label="Interpretation Questions" icon="help">
                  <QuestionList questions={h.interpretationQuestions} />
                </InfoBlock>
                {h.beginnerTip && (
                  <InfoBlock label="Beginner Tip" icon="tips_and_updates">
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 italic">{h.beginnerTip}</div>
                  </InfoBlock>
                )}
              </ExpandableCard>
            ))}
          </div>
          {filteredHouses.length === 0 && <EmptyState query={searchQuery} />}
        </section>
      )}

      {activeSection === 'aspects' && (
        <section>
          <SectionHeader section="aspects" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAspects.map((a: AspectCard) => (
              <ExpandableCard
                key={a.id}
                id={a.id}
                title={`${a.symbol} ${a.name} (${a.angle})`}
                subtitle={a.nature}
                accentColor={a.accentColor}
                difficulty={a.difficulty}
                completedTopics={completedTopics}
                onToggleComplete={toggleComplete}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${a.accentColor}20`,
                      color: a.accentColor,
                    }}
                  >
                    {a.nature}
                  </span>
                </div>
                <InfoBlock label="Meaning" icon="info">{a.meaning}</InfoBlock>
                <InfoBlock label="Psychological Function" icon="psychology">{a.psychologicalFunction}</InfoBlock>
                <InfoBlock label="How It Appears in Real Life" icon="visibility">{a.howItAppearsInRealLife}</InfoBlock>
                <InfoBlock label="How to Interpret in a Birth Chart" icon="person">{a.howToInterpretInBirthChart}</InfoBlock>
                {a.practicalExample && (
                  <InfoBlock label="Practical Example" icon="lightbulb">
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">{a.practicalExample}</div>
                  </InfoBlock>
                )}
                {a.interpretationTip && (
                  <InfoBlock label="Interpretation Tip" icon="tips_and_updates">
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 italic">{a.interpretationTip}</div>
                  </InfoBlock>
                )}
                <InfoBlock label="Common Misconception" icon="warning">
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">{a.commonMisconception}</div>
                </InfoBlock>
                <InfoBlock label="Beginner Tip" icon="tips_and_updates">
                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 italic">{a.beginnerTip}</div>
                </InfoBlock>
              </ExpandableCard>
            ))}
          </div>
          {filteredAspects.length === 0 && <EmptyState query={searchQuery} />}
        </section>
      )}

      {activeSection === 'transits' && (
        <section>
          <SectionHeader section="transits" />
          <TransitSection completedTopics={completedTopics} onToggleComplete={toggleComplete} />
        </section>
      )}

      {activeSection === 'glossary' && (
        <section>
          <SectionHeader section="glossary" />
          <GlossarySection searchQuery={searchQuery} />
        </section>
      )}
    </AppLayout>
  );
}

// ────────────────────────────────────────────
// Small Shared UI
// ────────────────────────────────────────────
function SectionHeader({ section }: { section: LearnSection }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="material-symbols-outlined text-xl" aria-hidden="true" style={{ color: SECTION_COLORS[section] }}>
        {SECTION_ICONS[section]}
      </span>
      <h3 className="text-xl font-bold text-white">{SECTION_TITLES[section]}</h3>
      <span className="text-sm text-slate-200 ml-2">{SECTION_SUBTITLES[section]}</span>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="col-span-full text-center py-12">
      <span className="material-symbols-outlined text-4xl text-slate-500 mb-2" aria-hidden="true">search_off</span>
      <p className="text-slate-400">No results found for "{query}"</p>
      <p className="text-sm text-slate-500 mt-1">Try a different search term or filter</p>
    </div>
  );
}
