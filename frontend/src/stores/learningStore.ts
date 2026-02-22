/**
 * Learning Store
 *
 * Manages learning center courses, lessons, and progress
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { learningService } from '../services';
import type { Course, UserProgress } from '../types/api.types';

interface LearningState {
  // State
  courses: Course[];
  currentCourse: Course | null;
  currentLesson: string | null;
  progress: Record<string, UserProgress>;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadCourses: () => Promise<void>;
  loadCourse: (courseId: string) => Promise<void>;
  loadProgress: () => Promise<void>;
  loadLessonProgress: (lessonId: string) => Promise<void>;
  updateLessonProgress: (
    lessonId: string,
    completed: boolean,
    lastPosition?: number
  ) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;
  setCurrentCourse: (course: Course | null) => void;
  setCurrentLesson: (lessonId: string | null) => void;
  searchCourses: (query: string) => Promise<void>;
  clearError: () => void;
}

export const useLearningStore = create<LearningState>()(
  devtools((set) => ({
    // Initial state
    courses: [],
    currentCourse: null,
    currentLesson: null,
    progress: {},
    isLoading: false,
    error: null,

    // Load all courses
    loadCourses: async () => {
      set({ isLoading: true, error: null });
      try {
        const courses = await learningService.getCourses();
        set({
          courses,
          isLoading: false,
        });
      } catch (error: unknown) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load courses',
          isLoading: false,
        });
      }
    },

    // Load single course
    loadCourse: async (courseId: string) => {
      set({ isLoading: true, error: null });
      try {
        const course = await learningService.getCourse(courseId);
        set({
          currentCourse: course,
          isLoading: false,
        });
      } catch (error: unknown) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load course',
          isLoading: false,
        });
      }
    },

    // Load all progress
    loadProgress: async () => {
      set({ isLoading: true, error: null });
      try {
        const progressList = await learningService.getUserProgress();

        // Convert array to record
        const progressRecord: Record<string, UserProgress> = {};
        progressList.forEach((p) => {
          const key = p.lessonId ?? p.courseId;
          if (key) {
            progressRecord[key] = p;
          }
        });

        set({
          progress: progressRecord,
          isLoading: false,
        });
      } catch (error: unknown) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load progress',
          isLoading: false,
        });
      }
    },

    // Load lesson progress
    loadLessonProgress: async (lessonId: string) => {
      set({ isLoading: true, error: null });
      try {
        const lessonProgress = await learningService.getLessonProgress(lessonId);

        set((state) => ({
          progress: {
            ...state.progress,
            [lessonId]: lessonProgress,
          },
          isLoading: false,
        }));
      } catch (error: unknown) {
        set({
          error: error instanceof Error ? error.message : 'Failed to load lesson progress',
          isLoading: false,
        });
      }
    },

    // Update lesson progress
    updateLessonProgress: async (lessonId: string, completed: boolean, _lastPosition?: number) => {
      set({ isLoading: true, error: null });
      try {
        const updatedProgress = await learningService.updateProgress({
          lessonId,
          markComplete: completed,
        });

        set((state) => ({
          progress: {
            ...state.progress,
            [lessonId]: updatedProgress,
          },
          isLoading: false,
        }));
      } catch (error: unknown) {
        set({
          error: error instanceof Error ? error.message : 'Failed to update progress',
          isLoading: false,
        });
        throw error;
      }
    },

    // Complete lesson
    completeLesson: async (lessonId: string) => {
      set({ isLoading: true, error: null });
      try {
        const updatedProgress = await learningService.completeLesson(lessonId);

        set((state) => ({
          progress: {
            ...state.progress,
            [lessonId]: updatedProgress,
          },
          isLoading: false,
        }));
      } catch (error: unknown) {
        set({
          error: error instanceof Error ? error.message : 'Failed to complete lesson',
          isLoading: false,
        });
        throw error;
      }
    },

    // Set current course
    setCurrentCourse: (course: Course | null) => {
      set({ currentCourse: course });
    },

    // Set current lesson
    setCurrentLesson: (lessonId: string | null) => {
      set({ currentLesson: lessonId });
    },

    // Search courses
    searchCourses: async (query: string) => {
      set({ isLoading: true, error: null });
      try {
        const courses = await learningService.searchCourses(query);
        set({
          courses,
          isLoading: false,
        });
      } catch (error: unknown) {
        set({
          error: error instanceof Error ? error.message : 'Failed to search courses',
          isLoading: false,
        });
      }
    },

    // Clear error
    clearError: () => set({ error: null }),
  }))
);

// Selector hooks for optimized re-renders
export const useCourses = () => useLearningStore((state) => state.courses);
export const useCurrentCourse = () => useLearningStore((state) => state.currentCourse);
export const useCurrentLesson = () => useLearningStore((state) => state.currentLesson);
export const useProgress = () => useLearningStore((state) => state.progress);
export const useLearningLoading = () => useLearningStore((state) => state.isLoading);

export default useLearningStore;
