/**
 * Tests for useLearning Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLearning } from '../../hooks/useLearning';
import type { Course, UserProgress, Lesson } from '../../types/api.types';

// Mock course data
const mockLesson1: Lesson = {
  id: 'lesson-1',
  courseId: 'course-1',
  title: 'Introduction to Astrology',
  description: 'Learn the basics',
  category: 'basics',
  level: 'beginner',
  duration: 30,
  order: 1,
  prerequisites: [],
  tags: ['basics', 'beginner'],
  isPublished: true,
};

const mockLesson2: Lesson = {
  id: 'lesson-2',
  courseId: 'course-1',
  title: 'The Zodiac Signs',
  description: 'Learn about zodiac signs',
  category: 'signs',
  level: 'beginner',
  duration: 45,
  order: 2,
  prerequisites: ['lesson-1'],
  tags: ['signs', 'beginner'],
  isPublished: true,
};

const mockLesson3: Lesson = {
  id: 'lesson-3',
  courseId: 'course-1',
  title: 'Advanced Transits',
  description: 'Learn about transits',
  category: 'transits',
  level: 'intermediate',
  duration: 60,
  order: 3,
  prerequisites: ['lesson-1', 'lesson-2'],
  tags: ['transits', 'intermediate'],
  isPublished: true,
};

const mockCourse1: Course = {
  id: 'course-1',
  title: 'Astrology Basics',
  description: 'Learn astrology from scratch',
  category: 'basics',
  level: 'beginner',
  duration: 120,
  lessons: [mockLesson1, mockLesson2, mockLesson3],
  createdAt: '2024-01-01T00:00:00Z',
};

const mockCourse2: Course = {
  id: 'course-2',
  title: 'Advanced Chart Reading',
  description: 'Master chart interpretation',
  category: 'advanced',
  level: 'advanced',
  duration: 180,
  lessons: [],
  createdAt: '2024-01-02T00:00:00Z',
};

const mockCourse3: Course = {
  id: 'course-3',
  title: 'Intermediate Planets',
  description: 'Understanding planetary influences',
  category: 'planets',
  level: 'intermediate',
  duration: 150,
  lessons: [],
  createdAt: '2024-01-03T00:00:00Z',
};

const mockProgress1: UserProgress = {
  userId: 'user-1',
  lessonId: 'lesson-1',
  status: 'completed',
  completedSections: ['section-1'],
  completedQuizzes: [],
  completedExercises: [],
  quizScores: {},
  currentSection: 'section-2',
  progressPercentage: 100,
  lastAccessedAt: '2024-01-15T10:00:00Z',
  completedAt: '2024-01-15T10:30:00Z',
};

const mockProgress2: UserProgress = {
  userId: 'user-1',
  courseId: 'course-3',
  status: 'in-progress',
  completedSections: [],
  completedQuizzes: [],
  completedExercises: [],
  quizScores: {},
  currentSection: 'section-1',
  progressPercentage: 50,
  lastAccessedAt: '2024-01-16T10:00:00Z',
};

// Mock the learning store
const mockLearningStore = {
  courses: [] as Course[],
  currentCourse: null as Course | null,
  currentLesson: null as string | null,
  progress: {} as Record<string, UserProgress>,
  isLoading: false,
  error: null as string | null,
  loadCourses: vi.fn(),
  loadCourse: vi.fn(),
  loadProgress: vi.fn(),
  loadLessonProgress: vi.fn(),
  updateLessonProgress: vi.fn(),
  completeLesson: vi.fn(),
  setCurrentCourse: vi.fn(),
  setCurrentLesson: vi.fn(),
  searchCourses: vi.fn(),
  clearError: vi.fn(),
};

vi.mock('../../stores', () => ({
  useLearningStore: vi.fn((selector?: (state: typeof mockLearningStore) => unknown) => {
    if (selector) {
      return selector(mockLearningStore);
    }
    return mockLearningStore;
  }),
}));

describe('useLearning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLearningStore.courses = [];
    mockLearningStore.currentCourse = null;
    mockLearningStore.currentLesson = null;
    mockLearningStore.progress = {};
    mockLearningStore.isLoading = false;
    mockLearningStore.error = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return learning state from store', () => {
      const { result } = renderHook(() => useLearning(false));

      expect(result.current.courses).toEqual([]);
      expect(result.current.currentCourse).toBeNull();
      expect(result.current.currentLesson).toBeNull();
      expect(result.current.progress).toEqual({});
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return all expected properties', () => {
      const { result } = renderHook(() => useLearning(false));

      // State
      expect(result.current).toHaveProperty('courses');
      expect(result.current).toHaveProperty('currentCourse');
      expect(result.current).toHaveProperty('currentLesson');
      expect(result.current).toHaveProperty('progress');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');

      // Methods
      expect(typeof result.current.loadCourses).toBe('function');
      expect(typeof result.current.loadCourse).toBe('function');
      expect(typeof result.current.loadProgress).toBe('function');
      expect(typeof result.current.loadLessonProgress).toBe('function');
      expect(typeof result.current.updateLessonProgress).toBe('function');
      expect(typeof result.current.completeLesson).toBe('function');
      expect(typeof result.current.setCurrentCourse).toBe('function');
      expect(typeof result.current.setCurrentLesson).toBe('function');
      expect(typeof result.current.searchCourses).toBe('function');
      expect(typeof result.current.clearError).toBe('function');

      // Computed
      expect(typeof result.current.getCourseProgress).toBe('function');
      expect(typeof result.current.getCourseProgressPercentage).toBe('function');
      expect(typeof result.current.isLessonCompleted).toBe('function');
      expect(typeof result.current.getNextLesson).toBe('function');
      expect(typeof result.current.getPreviousLesson).toBe('function');
      expect(typeof result.current.getCoursesByCategory).toBe('function');
      expect(typeof result.current.getCoursesByLevel).toBe('function');
      expect(typeof result.current.getCompletedCourses).toBe('function');
      expect(typeof result.current.getInProgressCourses).toBe('function');
    });
  });

  describe('autoLoad', () => {
    it('should auto-load courses and progress when autoLoad is true', async () => {
      mockLearningStore.loadCourses.mockResolvedValueOnce(undefined);
      mockLearningStore.loadProgress.mockResolvedValueOnce(undefined);

      renderHook(() => useLearning(true));

      await waitFor(() => {
        expect(mockLearningStore.loadCourses).toHaveBeenCalled();
        expect(mockLearningStore.loadProgress).toHaveBeenCalled();
      });
    });

    it('should not auto-load when autoLoad is false', () => {
      renderHook(() => useLearning(false));

      expect(mockLearningStore.loadCourses).not.toHaveBeenCalled();
      expect(mockLearningStore.loadProgress).not.toHaveBeenCalled();
    });

    it('should default to not auto-loading', () => {
      renderHook(() => useLearning());

      expect(mockLearningStore.loadCourses).not.toHaveBeenCalled();
    });
  });

  describe('loadCourse', () => {
    it('should call store loadCourse and return true on success', async () => {
      mockLearningStore.loadCourse.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useLearning(false));

      let loadResult: boolean | undefined;
      await act(async () => {
        loadResult = await result.current.loadCourse('course-1');
      });

      expect(mockLearningStore.loadCourse).toHaveBeenCalledWith('course-1');
      expect(loadResult).toBe(true);
    });

    it('should return false on loadCourse failure', async () => {
      mockLearningStore.loadCourse.mockRejectedValueOnce(new Error('Load failed'));

      const { result } = renderHook(() => useLearning(false));

      let loadResult: boolean | undefined;
      await act(async () => {
        loadResult = await result.current.loadCourse('course-1');
      });

      expect(loadResult).toBe(false);
    });
  });

  describe('updateLessonProgress', () => {
    it('should call store updateLessonProgress and return true on success', async () => {
      mockLearningStore.updateLessonProgress.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useLearning(false));

      let updateResult: boolean | undefined;
      await act(async () => {
        updateResult = await result.current.updateLessonProgress('lesson-1', true, 100);
      });

      expect(mockLearningStore.updateLessonProgress).toHaveBeenCalledWith('lesson-1', true, 100);
      expect(updateResult).toBe(true);
    });

    it('should work without lastPosition parameter', async () => {
      mockLearningStore.updateLessonProgress.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useLearning(false));

      let updateResult: boolean | undefined;
      await act(async () => {
        updateResult = await result.current.updateLessonProgress('lesson-1', true);
      });

      expect(mockLearningStore.updateLessonProgress).toHaveBeenCalledWith(
        'lesson-1',
        true,
        undefined,
      );
      expect(updateResult).toBe(true);
    });

    it('should return false on updateLessonProgress failure', async () => {
      mockLearningStore.updateLessonProgress.mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useLearning(false));

      let updateResult: boolean | undefined;
      await act(async () => {
        updateResult = await result.current.updateLessonProgress('lesson-1', true);
      });

      expect(updateResult).toBe(false);
    });
  });

  describe('completeLesson', () => {
    it('should call store completeLesson and return true on success', async () => {
      mockLearningStore.completeLesson.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useLearning(false));

      let completeResult: boolean | undefined;
      await act(async () => {
        completeResult = await result.current.completeLesson('lesson-1');
      });

      expect(mockLearningStore.completeLesson).toHaveBeenCalledWith('lesson-1');
      expect(completeResult).toBe(true);
    });

    it('should return false on completeLesson failure', async () => {
      mockLearningStore.completeLesson.mockRejectedValueOnce(new Error('Complete failed'));

      const { result } = renderHook(() => useLearning(false));

      let completeResult: boolean | undefined;
      await act(async () => {
        completeResult = await result.current.completeLesson('lesson-1');
      });

      expect(completeResult).toBe(false);
    });
  });

  describe('searchCourses', () => {
    it('should call store searchCourses and return true on success', async () => {
      mockLearningStore.searchCourses.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useLearning(false));

      let searchResult: boolean | undefined;
      await act(async () => {
        searchResult = await result.current.searchCourses('astrology');
      });

      expect(mockLearningStore.searchCourses).toHaveBeenCalledWith('astrology');
      expect(searchResult).toBe(true);
    });

    it('should return false on searchCourses failure', async () => {
      mockLearningStore.searchCourses.mockRejectedValueOnce(new Error('Search failed'));

      const { result } = renderHook(() => useLearning(false));

      let searchResult: boolean | undefined;
      await act(async () => {
        searchResult = await result.current.searchCourses('astrology');
      });

      expect(searchResult).toBe(false);
    });
  });

  describe('getCourseProgress', () => {
    it('should return progress for a course', () => {
      mockLearningStore.progress = { 'course-3': mockProgress2 };

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getCourseProgress('course-3')).toEqual(mockProgress2);
    });

    it('should return undefined for non-existent progress', () => {
      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getCourseProgress('non-existent')).toBeUndefined();
    });
  });

  describe('getCourseProgressPercentage', () => {
    it('should return progress percentage for a course', () => {
      mockLearningStore.progress = { 'course-3': mockProgress2 };

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getCourseProgressPercentage('course-3')).toBe(50);
    });

    it('should return 0 for non-existent progress', () => {
      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getCourseProgressPercentage('non-existent')).toBe(0);
    });
  });

  describe('isLessonCompleted', () => {
    it('should return true for completed lesson', () => {
      mockLearningStore.progress = { 'lesson-1': mockProgress1 };

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.isLessonCompleted('lesson-1')).toBe(true);
    });

    it('should return false for in-progress lesson', () => {
      mockLearningStore.progress = {
        'lesson-2': { ...mockProgress1, lessonId: 'lesson-2', status: 'in-progress' },
      };

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.isLessonCompleted('lesson-2')).toBe(false);
    });

    it('should return false for non-existent lesson progress', () => {
      const { result } = renderHook(() => useLearning(false));

      expect(result.current.isLessonCompleted('non-existent')).toBe(false);
    });
  });

  describe('getNextLesson', () => {
    it('should return next lesson when available', () => {
      mockLearningStore.courses = [mockCourse1];
      mockLearningStore.currentLesson = 'lesson-1';

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getNextLesson('course-1')).toBe('lesson-2');
    });

    it('should return null when on last lesson', () => {
      mockLearningStore.courses = [mockCourse1];
      mockLearningStore.currentLesson = 'lesson-3';

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getNextLesson('course-1')).toBeNull();
    });

    it('should return null when course not found', () => {
      mockLearningStore.courses = [mockCourse1];
      mockLearningStore.currentLesson = 'lesson-1';

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getNextLesson('non-existent')).toBeNull();
    });

    it('should return null when course has no lessons', () => {
      mockLearningStore.courses = [mockCourse2];
      mockLearningStore.currentLesson = null;

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getNextLesson('course-2')).toBeNull();
    });

    it('should return null when no current lesson is set', () => {
      mockLearningStore.courses = [mockCourse1];
      mockLearningStore.currentLesson = null;

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getNextLesson('course-1')).toBeNull();
    });
  });

  describe('getPreviousLesson', () => {
    it('should return previous lesson when available', () => {
      mockLearningStore.courses = [mockCourse1];
      mockLearningStore.currentLesson = 'lesson-2';

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getPreviousLesson('course-1')).toBe('lesson-1');
    });

    it('should return null when on first lesson', () => {
      mockLearningStore.courses = [mockCourse1];
      mockLearningStore.currentLesson = 'lesson-1';

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getPreviousLesson('course-1')).toBeNull();
    });

    it('should return null when course not found', () => {
      mockLearningStore.courses = [mockCourse1];
      mockLearningStore.currentLesson = 'lesson-2';

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getPreviousLesson('non-existent')).toBeNull();
    });

    it('should return null when course has no lessons', () => {
      mockLearningStore.courses = [mockCourse2];
      mockLearningStore.currentLesson = null;

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getPreviousLesson('course-2')).toBeNull();
    });
  });

  describe('getCoursesByCategory', () => {
    it('should filter courses by category', () => {
      mockLearningStore.courses = [mockCourse1, mockCourse2, mockCourse3];

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getCoursesByCategory('basics')).toEqual([mockCourse1]);
      expect(result.current.getCoursesByCategory('advanced')).toEqual([mockCourse2]);
      expect(result.current.getCoursesByCategory('planets')).toEqual([mockCourse3]);
    });

    it('should return empty array when no courses match category', () => {
      mockLearningStore.courses = [mockCourse1];

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getCoursesByCategory('transits')).toEqual([]);
    });

    it('should return empty array when no courses exist', () => {
      mockLearningStore.courses = [];

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getCoursesByCategory('basics')).toEqual([]);
    });
  });

  describe('getCoursesByLevel', () => {
    it('should filter courses by level', () => {
      mockLearningStore.courses = [mockCourse1, mockCourse2, mockCourse3];

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getCoursesByLevel('beginner')).toEqual([mockCourse1]);
      expect(result.current.getCoursesByLevel('advanced')).toEqual([mockCourse2]);
      expect(result.current.getCoursesByLevel('intermediate')).toEqual([mockCourse3]);
    });

    it('should return empty array when no courses match level', () => {
      mockLearningStore.courses = [mockCourse1];

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getCoursesByLevel('advanced')).toEqual([]);
    });
  });

  describe('getCompletedCourses', () => {
    it('should return completed courses', () => {
      mockLearningStore.courses = [mockCourse1, mockCourse3];
      mockLearningStore.progress = {
        'course-1': {
          ...mockProgress1,
          courseId: 'course-1',
          completedAt: '2024-01-15T10:30:00Z',
        },
      };

      const { result } = renderHook(() => useLearning(false));

      const completed = result.current.getCompletedCourses();
      expect(completed).toHaveLength(1);
      expect(completed[0].id).toBe('course-1');
    });

    it('should return empty array when no completed courses', () => {
      mockLearningStore.courses = [mockCourse1, mockCourse3];
      mockLearningStore.progress = {
        'course-3': mockProgress2, // in-progress, not completed
      };

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getCompletedCourses()).toEqual([]);
    });
  });

  describe('getInProgressCourses', () => {
    it('should return in-progress courses', () => {
      mockLearningStore.courses = [mockCourse1, mockCourse3];
      mockLearningStore.progress = {
        'course-3': mockProgress2, // in-progress
      };

      const { result } = renderHook(() => useLearning(false));

      const inProgress = result.current.getInProgressCourses();
      expect(inProgress).toHaveLength(1);
      expect(inProgress[0].id).toBe('course-3');
    });

    it('should not include completed courses', () => {
      mockLearningStore.courses = [mockCourse1, mockCourse3];
      mockLearningStore.progress = {
        'course-1': {
          ...mockProgress1,
          courseId: 'course-1',
          completedAt: '2024-01-15T10:30:00Z',
        },
        'course-3': mockProgress2,
      };

      const { result } = renderHook(() => useLearning(false));

      const inProgress = result.current.getInProgressCourses();
      expect(inProgress).toHaveLength(1);
      expect(inProgress[0].id).toBe('course-3');
    });

    it('should return empty array when no in-progress courses', () => {
      mockLearningStore.courses = [mockCourse1];
      mockLearningStore.progress = {};

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.getInProgressCourses()).toEqual([]);
    });
  });

  describe('utility methods', () => {
    it('should expose loadCourses from store', () => {
      const { result } = renderHook(() => useLearning(false));

      expect(result.current.loadCourses).toBe(mockLearningStore.loadCourses);
    });

    it('should expose loadProgress from store', () => {
      const { result } = renderHook(() => useLearning(false));

      expect(result.current.loadProgress).toBe(mockLearningStore.loadProgress);
    });

    it('should expose loadLessonProgress from store', () => {
      const { result } = renderHook(() => useLearning(false));

      expect(result.current.loadLessonProgress).toBe(mockLearningStore.loadLessonProgress);
    });

    it('should expose setCurrentCourse from store', () => {
      const { result } = renderHook(() => useLearning(false));

      act(() => {
        result.current.setCurrentCourse(mockCourse1);
      });

      expect(mockLearningStore.setCurrentCourse).toHaveBeenCalledWith(mockCourse1);
    });

    it('should expose setCurrentLesson from store', () => {
      const { result } = renderHook(() => useLearning(false));

      act(() => {
        result.current.setCurrentLesson('lesson-1');
      });

      expect(mockLearningStore.setCurrentLesson).toHaveBeenCalledWith('lesson-1');
    });

    it('should expose clearError from store', () => {
      const { result } = renderHook(() => useLearning(false));

      act(() => {
        result.current.clearError();
      });

      expect(mockLearningStore.clearError).toHaveBeenCalled();
    });
  });

  describe('error state', () => {
    it('should expose error from store', () => {
      mockLearningStore.error = 'Failed to load courses';

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.error).toBe('Failed to load courses');
    });
  });

  describe('loading state', () => {
    it('should expose isLoading from store', () => {
      mockLearningStore.isLoading = true;

      const { result } = renderHook(() => useLearning(false));

      expect(result.current.isLoading).toBe(true);
    });
  });
});
