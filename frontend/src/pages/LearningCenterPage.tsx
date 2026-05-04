/**
 * Learning Center Page
 *
 * Educational hub with courses, learning paths, knowledge base, and latest lessons
 * Reference: stitch-UI/desktop/16-learning-center.html
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Components
import { Button } from '../components/ui/Button';
import { AppLayout } from '../components';

// Hooks
import { useLearning } from '../hooks/useLearning';

// Types
import type { Course, Lesson } from '../types/api.types';

interface KnowledgeCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  topics: number;
  items: string[];
}

// Static knowledge base categories (these are reference topics, not dynamic data)
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
    items: ['Conjunctions: Fusion of Energy', 'Squares: Dynamic Tension', 'Trines: Natural Flow'],
  },
];

const LearningCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Use the learning hook with autoLoad enabled
  const {
    courses,
    isLoading,
    error,
    searchCourses,
    getCourseProgressPercentage,
    getInProgressCourses,
  } = useLearning(true);

  // Get current course (first in-progress course, or first course if none in progress)
  const currentCourse = useMemo(() => {
    const inProgress = getInProgressCourses();
    return inProgress.length > 0 ? inProgress[0] : courses[0];
  }, [courses, getInProgressCourses]);

  // Derive latest lessons from courses
  const latestLessons = useMemo(() => {
    const allLessons: (Lesson & { courseTitle?: string })[] = [];
    courses.forEach((course) => {
      if (course.lessons) {
        course.lessons.forEach((lesson) => {
          allLessons.push({ ...lesson, courseTitle: course.title });
        });
      }
    });
    // Sort by creation or order and take first 3
    return allLessons.slice(0, 3);
  }, [courses]);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        void searchCourses(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchCourses]);

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [courses, searchQuery]);

  // Get course status based on progress
  const getCourseStatus = useCallback(
    (course: Course): 'in-progress' | 'locked' | 'not-started' => {
      const progress = getCourseProgressPercentage(course.id);
      if (progress > 0) return 'in-progress';
      // For now, all courses are unlocked. In future, could check prerequisites
      return 'not-started';
    },
    [getCourseProgressPercentage],
  );

  // Format duration
  const formatDuration = useCallback((minutes: number): string => {
    if (minutes < 60) return `${minutes} Min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}.${Math.round(mins / 6)} Hours` : `${hours} Hours`;
  }, []);

  const handleCourseClick = (courseId: string) => {
    navigate(`/learning/courses/${courseId}`);
  };

  const handleLessonClick = (lessonId: string) => {
    navigate(`/learning/lessons/${lessonId}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/learning/categories/${categoryId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-slate-400">Loading courses...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-center max-w-md px-6">
            <span className="material-symbols-outlined text-5xl text-red-400">error</span>
            <h2 className="text-xl font-bold text-white">Failed to Load Courses</h2>
            <p className="text-slate-400">{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Search Bar */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-6">
        <div className="flex-1 max-w-xl">
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
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* Hero Card - Current Course */}
        {currentCourse && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="rounded-xl overflow-hidden flex flex-col md:flex-row relative group cursor-pointer border border-white/10"
              onClick={() => handleCourseClick(currentCourse.id)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"></div>
              <div className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden relative bg-white/5">
                {currentCourse.thumbnailUrl ? (
                  <img
                    src={currentCourse.thumbnailUrl}
                    alt={currentCourse.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-blue-500/20">
                    <span className="material-symbols-outlined text-6xl text-primary/50">
                      school
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17]/80 to-transparent flex items-end p-6">
                  <span className="bg-primary/20 backdrop-blur-md text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/30 uppercase tracking-tighter">
                    Current Path
                  </span>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between bg-white/5 backdrop-blur-sm">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{currentCourse.title}</h2>
                  <p className="text-slate-400 max-w-lg mb-8">{currentCourse.description}</p>
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Your Progress</span>
                      <span className="text-primary font-bold">
                        {getCourseProgressPercentage(currentCourse.id)}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(129,61,225,0.6)] transition-all duration-500"
                        style={{ width: `${getCourseProgressPercentage(currentCourse.id)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(currentCourse.id);
                    }}
                    leftIcon={
                      <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    }
                  >
                    Resume Learning
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(currentCourse.id);
                    }}
                  >
                    View Syllabus
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>
        )}

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
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-4xl text-slate-500 mb-4">school</span>
              <p className="text-slate-400">No courses available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4 scroll-smooth">
              {filteredCourses.map((course) => {
                const status = getCourseStatus(course);
                const progress = getCourseProgressPercentage(course.id);
                return (
                  <div
                    key={course.id}
                    className={`min-w-0 rounded-xl p-6 border-l-4 cursor-pointer transition-all hover:bg-white/5 ${
                      status === 'in-progress'
                        ? 'bg-white/5 backdrop-blur-sm border-l-primary'
                        : 'bg-white/5 backdrop-blur-sm border-l-slate-700 opacity-70'
                    }`}
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={`p-2 rounded-lg ${
                          status === 'in-progress'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {status === 'locked' ? 'lock' : 'school'}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                          status === 'in-progress'
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}
                      >
                        {status === 'in-progress'
                          ? 'In Progress'
                          : status === 'locked'
                            ? 'Locked'
                            : 'Not Started'}
                      </span>
                    </div>
                    <h4 className="text-white font-bold mb-2">{course.title}</h4>
                    <p className="text-slate-500 text-sm mb-6">{course.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {formatDuration(course.duration)}
                      </div>
                      <span>{course.lessons?.length || 0} Lessons</span>
                    </div>
                    {progress > 0 && (
                      <div className="mt-4">
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-primary mt-1 inline-block">
                          {progress}% complete
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${category.color}`}
                    >
                      <span className="material-symbols-outlined text-3xl">{category.icon}</span>
                    </div>
                    <h4 className="text-white font-bold text-lg">{category.title}</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-400">
                    {category.items.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 hover:text-white transition-colors"
                      >
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
                {latestLessons.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">
                    No lessons available yet.
                  </p>
                ) : (
                  latestLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex gap-4 group cursor-pointer"
                      onClick={() => handleLessonClick(lesson.id)}
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                        {lesson.videoUrl ? (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-blue-500/20 relative">
                            <span className="material-symbols-outlined text-2xl text-white/80">
                              play_circle
                            </span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                            <span className="material-symbols-outlined text-2xl text-white/80">
                              article
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h5 className="text-sm font-bold text-white line-clamp-2 hover:text-primary transition-colors">
                            {lesson.title}
                          </h5>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                            <span>
                              {lesson.videoUrl ? 'Video' : 'Article'} -{' '}
                              {formatDuration(lesson.duration)}
                            </span>
                            <span className="text-slate-700">-</span>
                            <span>{lesson.category}</span>
                          </div>
                        </div>
                        <button className="text-slate-500 hover:text-primary transition-colors flex justify-start">
                          <span className="material-symbols-outlined text-sm">bookmark</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
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
    </AppLayout>
  );
};

export default LearningCenterPage;
