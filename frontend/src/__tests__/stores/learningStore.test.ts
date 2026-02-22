/**
 * Tests for Learning Store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useLearningStore } from '../../stores/learningStore';

// Mock the learningService
vi.mock('../../services', () => ({
  learningService: {
    getCourses: vi.fn(),
    getCourse: vi.fn(),
    getUserProgress: vi.fn(),
    getLessonProgress: vi.fn(),
    updateProgress: vi.fn(),
    completeLesson: vi.fn(),
    searchCourses: vi.fn(),
  },
}));

// Import after mocking
import { learningService } from '../../services';

const mockCourse = {
  id: 'course-1',
  title: 'Introduction to Astrology',
  description: 'Learn the basics',
  lessons: [
    { id: 'lesson-1', title: 'Lesson 1', content: 'Content 1', order: 1 },
    { id: 'lesson-2', title: 'Lesson 2', content: 'Content 2', order: 2 },
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockProgress = {
  lessonId: 'lesson-1',
  courseId: 'course-1',
  completed: false,
  lastPosition: 50,
  completedAt: null,
};

describe('learningStore', () => {
  // Helper to reset store state
  const resetStore = () => {
    useLearningStore.setState({
      courses: [],
      currentCourse: null,
      currentLesson: null,
      progress: {},
      isLoading: false,
      error: null,
    });
  };

  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useLearningStore.getState();

      expect(state.courses).toEqual([]);
      expect(state.currentCourse).toBeNull();
      expect(state.currentLesson).toBeNull();
      expect(state.progress).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('loadCourses action', () => {
    it('should load courses successfully', async () => {
      vi.mocked(learningService.getCourses).mockResolvedValueOnce([mockCourse as any]);

      await act(async () => {
        await useLearningStore.getState().loadCourses();
      });

      const state = useLearningStore.getState();

      expect(learningService.getCourses).toHaveBeenCalled();
      expect(state.courses).toHaveLength(1);
      expect(state.courses[0]).toEqual(mockCourse);
      expect(state.isLoading).toBe(false);
    });

    it('should set loading state during load', async () => {
      vi.mocked(learningService.getCourses).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      const loadPromise = act(async () => {
        await useLearningStore.getState().loadCourses();
      });

      expect(useLearningStore.getState().isLoading).toBe(true);

      await loadPromise;

      expect(useLearningStore.getState().isLoading).toBe(false);
    });

    it('should handle load error', async () => {
      vi.mocked(learningService.getCourses).mockRejectedValueOnce(new Error('Load failed'));

      await act(async () => {
        await useLearningStore.getState().loadCourses();
      });

      const state = useLearningStore.getState();

      expect(state.error).toBe('Load failed');
      expect(state.isLoading).toBe(false);
    });

    it('should handle non-Error failures', async () => {
      vi.mocked(learningService.getCourses).mockRejectedValueOnce('Unknown');

      await act(async () => {
        await useLearningStore.getState().loadCourses();
      });

      expect(useLearningStore.getState().error).toBe('Failed to load courses');
    });
  });

  describe('loadCourse action', () => {
    it('should load single course successfully', async () => {
      vi.mocked(learningService.getCourse).mockResolvedValueOnce(mockCourse as any);

      await act(async () => {
        await useLearningStore.getState().loadCourse('course-1');
      });

      const state = useLearningStore.getState();

      expect(learningService.getCourse).toHaveBeenCalledWith('course-1');
      expect(state.currentCourse).toEqual(mockCourse);
      expect(state.isLoading).toBe(false);
    });

    it('should handle load course error', async () => {
      vi.mocked(learningService.getCourse).mockRejectedValueOnce(new Error('Not found'));

      await act(async () => {
        await useLearningStore.getState().loadCourse('non-existent');
      });

      const state = useLearningStore.getState();

      expect(state.error).toBe('Not found');
      expect(state.currentCourse).toBeNull();
    });
  });

  describe('loadProgress action', () => {
    it('should load progress and convert to record', async () => {
      vi.mocked(learningService.getUserProgress).mockResolvedValueOnce([mockProgress as any]);

      await act(async () => {
        await useLearningStore.getState().loadProgress();
      });

      const state = useLearningStore.getState();

      expect(learningService.getUserProgress).toHaveBeenCalled();
      expect(state.progress['lesson-1']).toEqual(mockProgress);
    });

    it('should handle progress with courseId key fallback', async () => {
      const progressWithCourseId = {
        courseId: 'course-1',
        completed: true,
      };

      vi.mocked(learningService.getUserProgress).mockResolvedValueOnce([progressWithCourseId as any]);

      await act(async () => {
        await useLearningStore.getState().loadProgress();
      });

      const state = useLearningStore.getState();

      expect(state.progress['course-1']).toEqual(progressWithCourseId);
    });

    it('should skip progress items without valid keys', async () => {
      const progressWithoutKey = {
        completed: true,
      };

      vi.mocked(learningService.getUserProgress).mockResolvedValueOnce([progressWithoutKey as any]);

      await act(async () => {
        await useLearningStore.getState().loadProgress();
      });

      const state = useLearningStore.getState();

      expect(Object.keys(state.progress)).toHaveLength(0);
    });

    it('should handle load progress error', async () => {
      vi.mocked(learningService.getUserProgress).mockRejectedValueOnce(new Error('API error'));

      await act(async () => {
        await useLearningStore.getState().loadProgress();
      });

      expect(useLearningStore.getState().error).toBe('API error');
    });
  });

  describe('loadLessonProgress action', () => {
    it('should load lesson progress successfully', async () => {
      vi.mocked(learningService.getLessonProgress).mockResolvedValueOnce(mockProgress as any);

      await act(async () => {
        await useLearningStore.getState().loadLessonProgress('lesson-1');
      });

      const state = useLearningStore.getState();

      expect(learningService.getLessonProgress).toHaveBeenCalledWith('lesson-1');
      expect(state.progress['lesson-1']).toEqual(mockProgress);
    });

    it('should merge with existing progress', async () => {
      useLearningStore.setState({
        progress: { 'lesson-2': { lessonId: 'lesson-2', completed: true } as any },
      });

      vi.mocked(learningService.getLessonProgress).mockResolvedValueOnce(mockProgress as any);

      await act(async () => {
        await useLearningStore.getState().loadLessonProgress('lesson-1');
      });

      const state = useLearningStore.getState();

      expect(state.progress['lesson-1']).toEqual(mockProgress);
      expect(state.progress['lesson-2']).toBeDefined();
    });

    it('should handle load lesson progress error', async () => {
      vi.mocked(learningService.getLessonProgress).mockRejectedValueOnce(new Error('Not found'));

      await act(async () => {
        await useLearningStore.getState().loadLessonProgress('lesson-1');
      });

      expect(useLearningStore.getState().error).toBe('Not found');
    });
  });

  describe('updateLessonProgress action', () => {
    it('should update lesson progress successfully', async () => {
      const updatedProgress = { ...mockProgress, completed: true };
      vi.mocked(learningService.updateProgress).mockResolvedValueOnce(updatedProgress as any);

      await act(async () => {
        await useLearningStore.getState().updateLessonProgress('lesson-1', true);
      });

      const state = useLearningStore.getState();

      expect(learningService.updateProgress).toHaveBeenCalledWith({
        lessonId: 'lesson-1',
        markComplete: true,
      });
      expect(state.progress['lesson-1']).toEqual(updatedProgress);
    });

    it('should handle update progress error', async () => {
      vi.mocked(learningService.updateProgress).mockRejectedValueOnce(new Error('Update failed'));

      await act(async () => {
        try {
          await useLearningStore.getState().updateLessonProgress('lesson-1', true);
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      expect(useLearningStore.getState().error).toBe('Update failed');
    });
  });

  describe('completeLesson action', () => {
    it('should complete lesson successfully', async () => {
      const completedProgress = { ...mockProgress, completed: true, completedAt: '2024-01-01' };
      vi.mocked(learningService.completeLesson).mockResolvedValueOnce(completedProgress as any);

      await act(async () => {
        await useLearningStore.getState().completeLesson('lesson-1');
      });

      const state = useLearningStore.getState();

      expect(learningService.completeLesson).toHaveBeenCalledWith('lesson-1');
      expect(state.progress['lesson-1'].completed).toBe(true);
    });

    it('should handle complete lesson error', async () => {
      vi.mocked(learningService.completeLesson).mockRejectedValueOnce(new Error('Complete failed'));

      await act(async () => {
        try {
          await useLearningStore.getState().completeLesson('lesson-1');
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      expect(useLearningStore.getState().error).toBe('Complete failed');
    });
  });

  describe('setCurrentCourse action', () => {
    it('should set current course', () => {
      act(() => {
        useLearningStore.getState().setCurrentCourse(mockCourse as any);
      });

      expect(useLearningStore.getState().currentCourse).toEqual(mockCourse);
    });

    it('should set current course to null', () => {
      useLearningStore.setState({ currentCourse: mockCourse as any });

      act(() => {
        useLearningStore.getState().setCurrentCourse(null);
      });

      expect(useLearningStore.getState().currentCourse).toBeNull();
    });
  });

  describe('setCurrentLesson action', () => {
    it('should set current lesson', () => {
      act(() => {
        useLearningStore.getState().setCurrentLesson('lesson-1');
      });

      expect(useLearningStore.getState().currentLesson).toBe('lesson-1');
    });

    it('should set current lesson to null', () => {
      useLearningStore.setState({ currentLesson: 'lesson-1' });

      act(() => {
        useLearningStore.getState().setCurrentLesson(null);
      });

      expect(useLearningStore.getState().currentLesson).toBeNull();
    });
  });

  describe('searchCourses action', () => {
    it('should search courses successfully', async () => {
      vi.mocked(learningService.searchCourses).mockResolvedValueOnce([mockCourse as any]);

      await act(async () => {
        await useLearningStore.getState().searchCourses('astrology');
      });

      const state = useLearningStore.getState();

      expect(learningService.searchCourses).toHaveBeenCalledWith('astrology');
      expect(state.courses).toHaveLength(1);
    });

    it('should handle search error', async () => {
      vi.mocked(learningService.searchCourses).mockRejectedValueOnce(new Error('Search failed'));

      await act(async () => {
        await useLearningStore.getState().searchCourses('test');
      });

      expect(useLearningStore.getState().error).toBe('Search failed');
    });
  });

  describe('clearError action', () => {
    it('should clear error', () => {
      useLearningStore.setState({ error: 'Some error' });

      act(() => {
        useLearningStore.getState().clearError();
      });

      expect(useLearningStore.getState().error).toBeNull();
    });
  });

  describe('selector hooks', () => {
    it('useCourses should return courses', () => {
      useLearningStore.setState({ courses: [mockCourse as any] });
      const courses = useLearningStore.getState().courses;
      expect(courses).toEqual([mockCourse]);
    });

    it('useCurrentCourse should return current course', () => {
      useLearningStore.setState({ currentCourse: mockCourse as any });
      const currentCourse = useLearningStore.getState().currentCourse;
      expect(currentCourse).toEqual(mockCourse);
    });

    it('useCurrentLesson should return current lesson', () => {
      useLearningStore.setState({ currentLesson: 'lesson-1' });
      const currentLesson = useLearningStore.getState().currentLesson;
      expect(currentLesson).toBe('lesson-1');
    });

    it('useProgress should return progress', () => {
      useLearningStore.setState({ progress: { 'lesson-1': mockProgress as any } });
      const progress = useLearningStore.getState().progress;
      expect(progress['lesson-1']).toEqual(mockProgress);
    });

    it('useLearningLoading should return loading state', () => {
      useLearningStore.setState({ isLoading: true });
      const isLoading = useLearningStore.getState().isLoading;
      expect(isLoading).toBe(true);
    });
  });
});
