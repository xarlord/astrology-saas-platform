/**
 * Learning Center Page
 *
 * Educational hub with courses, learning paths, knowledge base, and latest lessons
 * Reference: stitch-UI/desktop/16-learning-center.html
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Components
import { Button } from '../components/ui/Button';

// Types
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  status: 'in-progress' | 'locked' | 'not-started';
}

interface Lesson {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
  type: 'video' | 'article';
}

interface KnowledgeCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  topics: number;
  items: string[];
}

// Mock data
const CURRENT_COURSE: Course = {
  id: 'master-houses',
  title: 'New Course: Master the Houses',
  description: 'Deep dive into the 12 celestial houses. Understand how the positions of planets define specific life areas, from personal identity to public legacy.',
  thumbnail: 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=800&q=80',
  progress: 20,
  totalLessons: 12,
  completedLessons: 2,
  duration: '4.5 Hours',
  status: 'in-progress',
};

const LEARNING_PATHS: Course[] = [
  {
    id: 'astrology-101',
    title: 'Astrology 101: The Basics',
    description: 'Learn the planets, signs, and the core language of the cosmos.',
    thumbnail: '',
    progress: 67,
    totalLessons: 12,
    completedLessons: 8,
    duration: '4.5 Hours',
    status: 'in-progress',
  },
  {
    id: 'intermediate-aspects',
    title: 'Intermediate: Aspects & Transits',
    description: 'Understand the geometric relationships between planets in motion.',
    thumbnail: '',
    progress: 0,
    totalLessons: 15,
    completedLessons: 0,
    duration: '6.2 Hours',
    status: 'locked',
  },
  {
    id: 'advanced-synastry',
    title: 'Advanced: Synastry & Electional',
    description: 'Master relationship charts and timing for major life events.',
    thumbnail: '',
    progress: 0,
    totalLessons: 20,
    completedLessons: 0,
    duration: '8.0 Hours',
    status: 'locked',
  },
  {
    id: 'professional-astrologer',
    title: 'The Professional Astrologer',
    description: 'Certification course for those looking to practice professionally.',
    thumbnail: '',
    progress: 0,
    totalLessons: 25,
    completedLessons: 0,
    duration: '12.5 Hours',
    status: 'locked',
  },
];

const KNOWLEDGE_BASE: KnowledgeCategory[] = [
  {
    id: 'planets',
    title: 'Planets',
    icon: 'brightness_high',
    color: 'text-blue-400 bg-blue-400/10',
    topics: 12,
    items: [
      'The Sun: Your Core Identity',
      'The Moon: Emotions & Subconscious',
      'Mercury: Communication Style',
    ],
  },
  {
    id: 'zodiac',
    title: 'Zodiac Signs',
    icon: 'star',
    color: 'text-amber-400 bg-amber-400/10',
    topics: 8,
    items: [
      'The 12 Signs & Their Archetypes',
      'Modalities: Cardinal, Fixed, Mutable',
      'The Four Elements in Astrology',
    ],
  },
  {
    id: 'houses',
    title: 'Houses',
    icon: 'grid_view',
    color: 'text-purple-400 bg-purple-400/10',
    topics: 10,
    items: [
      'Angular Houses: Action & Initiation',
      'Succedent Houses: Stability',
      'Cadent Houses: Adaptation',
    ],
  },
  {
    id: 'aspects',
    title: 'Aspects',
    icon: 'change_history',
    color: 'text-green-400 bg-green-400/10',
    topics: 15,
    items: [
      'Conjunctions: Fusion of Energy',
      'Squares: Dynamic Tension',
      'Trines: Natural Flow',
    ],
  },
];

const LATEST_LESSONS: Lesson[] = [
  {
    id: 'mercury-retrograde',
    title: 'Mercury in Retrograde: The Complete Guide',
    thumbnail: 'https://images.unsplash.com/photo-1614730341194-75c60740a2d3?w=200&q=80',
    duration: '12 Min',
    category: 'Planets',
    type: 'video',
  },
  {
    id: 'trines-sextiles',
    title: 'Understanding Trines & Sextiles',
    thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=200&q=80',
    duration: '5 Min',
    category: 'Aspects',
    type: 'article',
  },
  {
    id: 'midheaven',
    title: 'The Midheaven: Your Professional Legacy',
    thumbnail: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=200&q=80',
    duration: '18 Min',
    category: 'Houses',
    type: 'video',
  },
];

const LearningCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPaths = useMemo(() => {
    if (!searchQuery) return LEARNING_PATHS;
    return LEARNING_PATHS.filter(path =>
      path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleCourseClick = (courseId: string) => {
    navigate(`/learning/courses/${courseId}`);
  };

  const handleLessonClick = (lessonId: string) => {
    navigate(`/learning/lessons/${lessonId}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/learning/categories/${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] to-[#141627] text-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0B0D17]/80 border-b border-primary/20 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">The AstroVerse Academy</h1>
              <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">Premium Learning Hub</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-12 hidden md:block">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                type="text"
                placeholder="Search cosmic secrets (e.g., 'What is a Square aspect?')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-sm"
                aria-label="Search courses and lessons"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-400 hover:text-primary transition-colors text-sm font-medium"
            >
              Dashboard
            </button>
            <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-slate-300">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-[#0B0D17]"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* Hero Card - Current Course */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="rounded-xl overflow-hidden flex flex-col md:flex-row relative group cursor-pointer border border-white/10"
            onClick={() => handleCourseClick(CURRENT_COURSE.id)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"></div>
            <div className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden relative">
              <img
                src={CURRENT_COURSE.thumbnail}
                alt={CURRENT_COURSE.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17]/80 to-transparent flex items-end p-6">
                <span className="bg-primary/20 backdrop-blur-md text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/30 uppercase tracking-tighter">
                  Current Path
                </span>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-between bg-white/5 backdrop-blur-sm">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{CURRENT_COURSE.title}</h2>
                <p className="text-slate-400 max-w-lg mb-8">{CURRENT_COURSE.description}</p>
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-medium">Your Progress</span>
                    <span className="text-primary font-bold">{CURRENT_COURSE.progress}% Complete</span>
                  </div>
                  <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(129,61,225,0.6)] transition-all duration-500"
                      style={{ width: `${CURRENT_COURSE.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCourseClick(CURRENT_COURSE.id);
                  }}
                  leftIcon={<span className="material-symbols-outlined text-[18px]">play_arrow</span>}
                >
                  Resume Learning
                </Button>
                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCourseClick(CURRENT_COURSE.id);
                  }}
                >
                  View Syllabus
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Learning Paths */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">route</span>
              <h3 className="text-xl font-bold text-white">Your Learning Paths</h3>
            </div>
            <button className="text-sm text-primary font-semibold hover:underline">
              See all paths
            </button>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 scroll-smooth">
            {filteredPaths.map((path) => (
              <div
                key={path.id}
                className={`min-w-[320px] rounded-xl p-6 border-l-4 cursor-pointer transition-all hover:bg-white/5 ${
                  path.status === 'in-progress'
                    ? 'bg-white/5 backdrop-blur-sm border-l-primary'
                    : 'bg-white/5 backdrop-blur-sm border-l-slate-700 opacity-70'
                }`}
                onClick={() => handleCourseClick(path.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`p-2 rounded-lg ${
                      path.status === 'in-progress' ? 'bg-primary/10 text-primary' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      {path.status === 'locked' ? 'lock' : 'school'}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                      path.status === 'in-progress'
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}
                  >
                    {path.status === 'in-progress' ? 'In Progress' : 'Locked'}
                  </span>
                </div>
                <h4 className="text-white font-bold mb-2">{path.title}</h4>
                <p className="text-slate-500 text-sm mb-6">{path.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    {path.duration}
                  </div>
                  <span>
                    {path.completedLessons}/{path.totalLessons} Lessons
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Knowledge Base Grid */}
          <div className="lg:col-span-2">
            <motion.div
              className="flex items-center gap-2 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="material-symbols-outlined text-primary">auto_stories</span>
              <h3 className="text-xl font-bold text-white">Knowledge Base</h3>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {KNOWLEDGE_BASE.map((category) => (
                <div
                  key={category.id}
                  className="bg-white/5 backdrop-blur-sm p-6 rounded-xl hover:bg-white/10 transition-all cursor-pointer group border border-white/10"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${category.color}`}>
                      <span className="material-symbols-outlined text-3xl">{category.icon}</span>
                    </div>
                    <h4 className="text-white font-bold text-lg">{category.title}</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-400">
                    {category.items.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 hover:text-white transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                    <span className="text-xs text-primary font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Browse {category.topics} more{' '}
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: Latest Lessons & Community */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">new_releases</span>
                <h3 className="text-xl font-bold text-white">Latest Lessons</h3>
              </div>
              <div className="space-y-4">
                {LATEST_LESSONS.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex gap-4 group cursor-pointer"
                    onClick={() => handleLessonClick(lesson.id)}
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={lesson.thumbnail}
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h5 className="text-sm font-bold text-white line-clamp-2 hover:text-primary transition-colors">
                          {lesson.title}
                        </h5>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                          <span>
                            {lesson.type === 'video' ? 'Video' : 'Article'} • {lesson.duration}
                          </span>
                          <span className="text-slate-700">•</span>
                          <span>{lesson.category}</span>
                        </div>
                      </div>
                      <button className="text-slate-500 hover:text-primary transition-colors flex justify-start">
                        <span className="material-symbols-outlined text-sm">bookmark</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2 rounded-lg border border-white/5 text-slate-400 text-xs font-bold hover:bg-white/5 transition-colors uppercase tracking-widest">
                View All Lessons
              </button>
            </motion.div>

            {/* Community CTA */}
            <motion.div
              className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 overflow-hidden relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
              <div className="relative z-10">
                <h4 className="text-white font-bold text-lg mb-2">Join the Cosmic Discussion</h4>
                <p className="text-slate-400 text-sm mb-6">
                  Connect with 15k+ fellow astrology students in our private community forum.
                </p>
                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={<span className="material-symbols-outlined text-[18px]">forum</span>}
                >
                  Enter Student Forum
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearningCenterPage;
