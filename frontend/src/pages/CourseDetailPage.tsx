/**
 * Course Detail Page
 *
 * Detailed view of a course with video player, syllabus, and progress tracking
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Components
import { Button } from '../components/ui/Button';
import { AppLayout } from '../components';
import VideoPlayer from '../components/media/VideoPlayer';

// Store & Services
import { useLearningStore } from '../stores/learningStore';
import { learningService } from '../services';

// Types
interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  completed: boolean;
  description: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  modules: Module[];
  thumbnail: string;
}

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { currentCourse, isLoading, error: storeError, loadCourse } = useLearningStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string>('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'lessons' | 'resources'>('lessons');

  // Load course data from API
  useEffect(() => {
    if (id) {
      void loadCourse(id);
    }
  }, [id, loadCourse]);

  // Transform API course data to local Course shape when loaded
  useEffect(() => {
    if (currentCourse) {
      const apiLessons = currentCourse.lessons ?? [];
      // Group lessons into a single module since API has flat lesson list
      const modules: Module[] = [
        {
          id: `${currentCourse.id}-module-1`,
          title: currentCourse.title,
          lessons: apiLessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            duration: lesson.duration ? `${Math.floor(lesson.duration / 60)}:${String(lesson.duration % 60).padStart(2, '0')}` : '0:00',
            videoUrl: lesson.videoUrl,
            completed: lesson.completed ?? false,
            description: lesson.description,
          })),
        },
      ];

      const transformed: Course = {
        id: currentCourse.id,
        title: currentCourse.title,
        description: currentCourse.description,
        instructor: 'AstroVerse Instructor',
        duration: currentCourse.duration ? `${(currentCourse.duration / 60).toFixed(1)} hours` : '0 hours',
        difficulty: currentCourse.level === 'beginner' ? 'Beginner' : currentCourse.level === 'advanced' ? 'Advanced' : 'Intermediate',
        modules,
        thumbnail: currentCourse.thumbnailUrl ?? 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=800&q=80',
      };

      setCourse(transformed);

      // Set first lesson as current
      const firstLesson = modules[0]?.lessons[0];
      if (firstLesson) {
        setCurrentLessonId(firstLesson.id);
      }
      // Expand first module by default
      setExpandedModules(new Set([modules[0]?.id]));
    }
  }, [currentCourse]);

  const currentLesson = useMemo(() => {
    if (!course) return null;
    for (const module of course.modules) {
      const lesson = module.lessons.find((l) => l.id === currentLessonId);
      if (lesson) return lesson;
    }
    return null;
  }, [course, currentLessonId]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleLessonClick = (lessonId: string) => {
    setCurrentLessonId(lessonId);
  };

  const handleMarkComplete = useCallback((lessonId: string) => {
    if (!course) return;
    // Optimistically update local state
    const updatedModules = course.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, completed: !lesson.completed } : lesson,
      ),
    }));
    setCourse({ ...course, modules: updatedModules });
    // Persist to API
    void learningService.completeLesson(lessonId);
  }, [course]);

  const handleNextLesson = () => {
    if (!course || !currentLesson) return;
    let found = false;
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (found) {
          setCurrentLessonId(lesson.id);
          return;
        }
        if (lesson.id === currentLessonId) {
          found = true;
        }
      }
    }
  };

  const handlePreviousLesson = () => {
    if (!course || !currentLesson) return;
    const lessons: { lesson: Lesson; moduleId: string }[] = [];
    course.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        lessons.push({ lesson, moduleId: module.id });
      });
    });

    for (let i = lessons.length - 1; i >= 0; i--) {
      if (lessons[i].lesson.id === currentLessonId && i > 0) {
        setCurrentLessonId(lessons[i - 1].lesson.id);
        return;
      }
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading course...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!course) {
    return (
      <AppLayout>
        <div className="text-center">
          {storeError && <p className="text-red-400 mb-2">{storeError}</p>}
          <p className="text-slate-400 mb-4">Course not found</p>
          <Button variant="primary" onClick={() => navigate('/learning')}>
            Back to Learning Center
          </Button>
        </div>
      </AppLayout>
    );
  }

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.completed).length,
    0,
  );
  const _progress = Math.round((completedLessons / totalLessons) * 100);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Video Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <motion.div
              className="bg-[#141627] rounded-xl overflow-hidden border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {currentLesson?.videoUrl ? (
                <VideoPlayer
                  src={currentLesson.videoUrl}
                  title={currentLesson.title}
                  poster={course.thumbnail}
                  onProgress={(progress) => {
                    // Track progress every 10%
                    const percent = progress.percentage;
                    if (Math.floor(percent) % 10 === 0 && Math.floor(percent) > 0) {
                      // Progress update: ${Math.floor(percent)}%
                    }
                  }}
                  onComplete={() => {
                    if (currentLesson && !currentLesson.completed) {
                      void handleMarkComplete(currentLesson.id);
                    }
                  }}
                />
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-primary mb-4">
                      play_circle
                    </span>
                    <p className="text-white font-bold">Video Coming Soon</p>
                  </div>
                </div>
              )}

              {/* Video Controls */}
              <div className="p-6 border-t border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{currentLesson?.title}</h2>
                    <p className="text-slate-400">{currentLesson?.description}</p>
                  </div>
                  {currentLesson && (
                    <button
                      onClick={() => {
                        void handleMarkComplete(currentLesson.id);
                      }}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        currentLesson.completed
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {currentLesson.completed ? 'check_circle' : 'check_circle_outline'}
                      </span>
                      {currentLesson.completed ? 'Completed' : 'Mark Complete'}
                    </button>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <Button
                    variant="secondary"
                    onClick={handlePreviousLesson}
                    disabled={
                      !currentLesson || course.modules[0].lessons[0].id === currentLesson.id
                    }
                    leftIcon={
                      <span className="material-symbols-outlined text-[18px]">skip_previous</span>
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNextLesson}
                    rightIcon={
                      <span className="material-symbols-outlined text-[18px]">skip_next</span>
                    }
                  >
                    Next Lesson
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Resources Section */}
            <motion.div
              className="bg-[#141627] rounded-xl p-6 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Course Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Course Workbook', type: 'PDF', size: '2.4 MB' },
                  { title: 'House Reference Chart', type: 'PDF', size: '1.1 MB' },
                  { title: 'Aspect Cheat Sheet', type: 'PDF', size: '0.8 MB' },
                  { title: 'Practice Worksheets', type: 'ZIP', size: '5.2 MB' },
                ].map((resource, index) => (
                  <button
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                  >
                    <div className="size-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                      <span className="material-symbols-outlined">picture_as_pdf</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium text-sm">{resource.title}</p>
                      <p className="text-slate-500 text-xs">
                        {resource.type} • {resource.size}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">download</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Course Content */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-[#141627] rounded-xl border border-white/10 sticky top-24"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Tabs */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setActiveTab('lessons')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'lessons'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Lessons
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'resources'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Resources
                </button>
              </div>

              {/* Lessons List */}
              {activeTab === 'lessons' && (
                <div className="max-h-[600px] overflow-y-auto">
                  {course.modules.map((module, _moduleIndex) => (
                    <div key={module.id} className="border-b border-white/5">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`material-symbols-outlined text-sm transition-transform ${
                              expandedModules.has(module.id) ? 'rotate-90' : ''
                            }`}
                          >
                            expand_more
                          </span>
                          <div className="text-left">
                            <p className="text-white font-medium text-sm">{module.title}</p>
                            <p className="text-xs text-slate-500">
                              {module.lessons.filter((l) => l.completed).length}/
                              {module.lessons.length} completed
                            </p>
                          </div>
                        </div>
                      </button>

                      {expandedModules.has(module.id) && (
                        <div className="pb-4 px-4 space-y-2">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonClick(lesson.id)}
                              className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                                currentLessonId === lesson.id
                                  ? 'bg-primary/20 border border-primary/30'
                                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
                              }`}
                            >
                              <div
                                className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                  lesson.completed
                                    ? 'bg-green-500/20 text-green-400'
                                    : currentLessonId === lesson.id
                                      ? 'bg-primary text-white'
                                      : 'bg-white/10 text-slate-400'
                                }`}
                              >
                                {lesson.completed ? (
                                  <span className="material-symbols-outlined text-[14px]">
                                    check
                                  </span>
                                ) : (
                                  lessonIndex + 1
                                )}
                              </div>
                              <div className="flex-1 text-left">
                                <p
                                  className={`text-sm font-medium ${
                                    currentLessonId === lesson.id ? 'text-white' : 'text-slate-300'
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-slate-500">{lesson.duration}</p>
                              </div>
                              {lesson.videoUrl && (
                                <span className="material-symbols-outlined text-slate-500 text-[18px]">
                                  play_circle
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Resources Tab */}
              {activeTab === 'resources' && (
                <div className="p-4">
                  <p className="text-sm text-slate-400 mb-4">Additional learning materials</p>
                  <div className="space-y-3">
                    {[
                      { name: 'Recommended Reading', icon: 'menu_book' },
                      { name: 'External Links', icon: 'link' },
                      { name: 'Glossary', icon: 'list' },
                      { name: 'FAQ', icon: 'help' },
                    ].map((item, index) => (
                      <button
                        key={index}
                        className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-3"
                      >
                        <span className="material-symbols-outlined text-slate-400">
                          {item.icon}
                        </span>
                        <span className="text-sm text-white">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CourseDetailPage;
