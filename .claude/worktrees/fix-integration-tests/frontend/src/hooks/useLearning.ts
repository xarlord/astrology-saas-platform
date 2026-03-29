/**
 * useLearning Hook
 *
 * Custom hook for learning center features
 * Wraps the learning store for easier use in components
 */

import { useCallback, useEffect } from 'react';
import { useLearningStore } from '../stores';
import type { Course, UserProgress } from '../types/api.types';

export const useLearning = (autoLoad = false) => {
  const {
    courses,
    currentCourse,
    currentLesson,
    progress,
    isLoading,
    error,
    loadCourses,
    loadCourse,
    loadProgress,
    loadLessonProgress,
    updateLessonProgress,
    completeLesson,
    setCurrentCourse,
    setCurrentLesson,
    searchCourses,
    clearError,
  } = useLearningStore();

  // Auto-load courses on mount
  useEffect(() => {
    if (autoLoad) {
      void loadCourses();
      void loadProgress();
    }
  }, [autoLoad, loadCourses, loadProgress]);

  // Load course wrapper
  const handleLoadCourse = useCallback(
    async (courseId: string): Promise<boolean> => {
      try {
        await loadCourse(courseId);
        return true;
      } catch {
        return false;
      }
    },
    [loadCourse]
  );

  // Update progress wrapper
  const handleUpdateProgress = useCallback(
    async (lessonId: string, completed: boolean, lastPosition?: number): Promise<boolean> => {
      try {
        await updateLessonProgress(lessonId, completed, lastPosition);
        return true;
      } catch {
        return false;
      }
    },
    [updateLessonProgress]
  );

  // Complete lesson wrapper
  const handleCompleteLesson = useCallback(
    async (lessonId: string): Promise<boolean> => {
      try {
        await completeLesson(lessonId);
        return true;
      } catch {
        return false;
      }
    },
    [completeLesson]
  );

  // Search courses wrapper
  const handleSearchCourses = useCallback(
    async (query: string): Promise<boolean> => {
      try {
        await searchCourses(query);
        return true;
      } catch {
        return false;
      }
    },
    [searchCourses]
  );

  // Get progress for course
  const getCourseProgress = useCallback((courseId: string): UserProgress | undefined => {
    return progress[courseId];
  }, [progress]);

  // Get progress percentage for course
  const getCourseProgressPercentage = useCallback((courseId: string): number => {
    const courseProgress = progress[courseId];
    return courseProgress?.progressPercentage ?? 0;
  }, [progress]);

  // Check if lesson is completed
  const isLessonCompleted = useCallback((lessonId: string): boolean => {
    const lessonProgress = progress[lessonId];
    return lessonProgress?.status === 'completed';
  }, [progress]);

  // Get next lesson in course
  const getNextLesson = useCallback((courseId: string): string | null => {
    const course = courses.find((c) => c.id === courseId);
    if (!course?.lessons?.length) {
      return null;
    }

    const currentIndex = course.lessons.findIndex((l) => l.id === currentLesson);
    if (currentIndex >= 0 && currentIndex < course.lessons.length - 1) {
      return course.lessons[currentIndex + 1].id;
    }

    return null;
  }, [courses, currentLesson]);

  // Get previous lesson in course
  const getPreviousLesson = useCallback((courseId: string): string | null => {
    const course = courses.find((c) => c.id === courseId);
    if (!course?.lessons?.length) {
      return null;
    }

    const currentIndex = course.lessons.findIndex((l) => l.id === currentLesson);
    if (currentIndex > 0) {
      return course.lessons[currentIndex - 1].id;
    }

    return null;
  }, [courses, currentLesson]);

  // Filter courses by category
  const getCoursesByCategory = useCallback((category: string): Course[] => {
    return courses.filter((c) => c.category === category);
  }, [courses]);

  // Filter courses by level
  const getCoursesByLevel = useCallback((level: 'beginner' | 'intermediate' | 'advanced'): Course[] => {
    return courses.filter((c) => c.level === level);
  }, [courses]);

  // Get completed courses
  const getCompletedCourses = useCallback((): Course[] => {
    return courses.filter((c) => {
      const courseProgress = progress[c.id];
      return courseProgress?.completedAt !== undefined;
    });
  }, [courses, progress]);

  // Get in-progress courses
  const getInProgressCourses = useCallback((): Course[] => {
    return courses.filter((c) => {
      const courseProgress = progress[c.id];
      return courseProgress && !courseProgress.completedAt;
    });
  }, [courses, progress]);

  return {
    // State
    courses,
    currentCourse,
    currentLesson,
    progress,
    isLoading,
    error,

    // Methods
    loadCourses,
    loadCourse: handleLoadCourse,
    loadProgress,
    loadLessonProgress,
    updateLessonProgress: handleUpdateProgress,
    completeLesson: handleCompleteLesson,
    setCurrentCourse,
    setCurrentLesson,
    searchCourses: handleSearchCourses,
    clearError,

    // Computed
    getCourseProgress,
    getCourseProgressPercentage,
    isLessonCompleted,
    getNextLesson,
    getPreviousLesson,
    getCoursesByCategory,
    getCoursesByLevel,
    getCompletedCourses,
    getInProgressCourses,
  };
};

export default useLearning;
