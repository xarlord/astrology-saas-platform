/**
 * Learning Service Tests
 * Comprehensive tests for learning center API calls
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { learningService } from '../../services/learning.service';
import type { Lesson, Course, UserProgress, LearningPath, ApiResponse } from '../../types/api.types';
import { setupLocalStorageMock } from './utils';

// Helper to create mock axios response
const createMockResponse = <T>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
});

// Mock the api module
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../../services/api';

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('learningService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupLocalStorageMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getLessons', () => {
    const mockLessons: Lesson[] = [
      {
        id: 'lesson-1',
        title: 'Introduction to Astrology',
        description: 'Learn the basics of astrology',
        category: 'basics',
        level: 'beginner',
        duration: 30,
        order: 1,
        prerequisites: [],
        tags: ['basics', 'intro'],
        isPublished: true,
      },
      {
        id: 'lesson-2',
        title: 'Understanding Planets',
        description: 'Learn about planetary influences',
        category: 'planets',
        level: 'intermediate',
        duration: 45,
        order: 2,
        prerequisites: ['lesson-1'],
        tags: ['planets'],
        isPublished: true,
      },
    ];

    it('should fetch all lessons without filters', async () => {
      const response: ApiResponse<Lesson[]> = { success: true, data: mockLessons };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.getLessons();

      expect(mockApi.get).toHaveBeenCalledWith('/learning/lessons', { params: expect.any(URLSearchParams) });
      expect(result).toEqual(mockLessons);
    });

    it('should fetch lessons with category filter', async () => {
      const response: ApiResponse<Lesson[]> = { success: true, data: [mockLessons[0]] };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.getLessons({ category: 'basics' });

      expect(mockApi.get).toHaveBeenCalled();
      const call = mockApi.get.mock.calls[0];
      expect(call[0]).toBe('/learning/lessons');
      expect(result).toHaveLength(1);
    });

    it('should fetch lessons with level filter', async () => {
      const response: ApiResponse<Lesson[]> = { success: true, data: [mockLessons[1]] };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.getLessons({ level: 'intermediate' });

      expect(mockApi.get).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should fetch lessons with tags filter', async () => {
      const response: ApiResponse<Lesson[]> = { success: true, data: mockLessons };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.getLessons({ tags: ['basics', 'planets'] });

      expect(mockApi.get).toHaveBeenCalled();
      expect(result).toEqual(mockLessons);
    });

    it('should handle API error with error field', async () => {
      const response: ApiResponse<Lesson[]> = { success: false, data: [] as Lesson[], error: 'Failed to fetch lessons' };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      await expect(learningService.getLessons()).rejects.toThrow('Failed to fetch lessons');
    });

    it('should handle API error without error field', async () => {
      const response: ApiResponse<Lesson[]> = { success: false, data: [] as Lesson[] };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      await expect(learningService.getLessons()).rejects.toThrow('Failed to get lessons');
    });

    it('should handle non-Error thrown', async () => {
      mockApi.get.mockRejectedValueOnce('Network error');

      await expect(learningService.getLessons()).rejects.toThrow('Failed to get lessons');
    });
  });

  describe('getLesson', () => {
    const mockLesson: Lesson = {
      id: 'lesson-1',
      title: 'Introduction to Astrology',
      description: 'Learn the basics',
      category: 'basics',
      level: 'beginner',
      duration: 30,
      order: 1,
      prerequisites: [],
      tags: ['basics'],
      isPublished: true,
    };

    it('should fetch a specific lesson by ID', async () => {
      const response: ApiResponse<Lesson> = { success: true, data: mockLesson };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.getLesson('lesson-1');

      expect(mockApi.get).toHaveBeenCalledWith('/learning/lessons/lesson-1');
      expect(result).toEqual(mockLesson);
    });

    it('should throw error when lesson not found', async () => {
      const response: ApiResponse<Lesson> = { success: false, data: mockLesson, error: 'Lesson not found' };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      await expect(learningService.getLesson('invalid-id')).rejects.toThrow('Lesson not found');
    });
  });

  describe('getUserProgress', () => {
    const mockProgress: UserProgress[] = [
      {
        userId: 'user-1',
        lessonId: 'lesson-1',
        status: 'completed',
        completedSections: ['section-1', 'section-2'],
        completedQuizzes: ['quiz-1'],
        completedExercises: [],
        quizScores: { 'quiz-1': 90 },
        currentSection: '',
        progressPercentage: 100,
        lastAccessedAt: '2024-01-15T00:00:00Z',
        completedAt: '2024-01-15T00:00:00Z',
      },
    ];

    it('should fetch user progress for all lessons', async () => {
      const response: ApiResponse<UserProgress[]> = { success: true, data: mockProgress };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.getUserProgress();

      expect(mockApi.get).toHaveBeenCalledWith('/learning/progress');
      expect(result).toEqual(mockProgress);
    });

    it('should handle error when fetching progress', async () => {
      const response: ApiResponse<UserProgress[]> = { success: false, data: [], error: 'Unauthorized' };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      await expect(learningService.getUserProgress()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getLessonProgress', () => {
    const mockProgress: UserProgress = {
      userId: 'user-1',
      lessonId: 'lesson-1',
      status: 'in-progress',
      completedSections: ['section-1'],
      completedQuizzes: [],
      completedExercises: [],
      quizScores: {},
      currentSection: 'section-2',
      progressPercentage: 50,
      lastAccessedAt: '2024-01-15T00:00:00Z',
    };

    it('should fetch progress for a specific lesson', async () => {
      const response: ApiResponse<UserProgress> = { success: true, data: mockProgress };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.getLessonProgress('lesson-1');

      expect(mockApi.get).toHaveBeenCalledWith('/learning/progress/lesson-1');
      expect(result).toEqual(mockProgress);
    });
  });

  describe('updateProgress', () => {
    const mockProgress: UserProgress = {
      userId: 'user-1',
      lessonId: 'lesson-1',
      status: 'in-progress',
      completedSections: ['section-1', 'section-2'],
      completedQuizzes: [],
      completedExercises: [],
      quizScores: {},
      currentSection: 'section-3',
      progressPercentage: 66,
      lastAccessedAt: '2024-01-15T00:00:00Z',
    };

    it('should update lesson progress', async () => {
      const response: ApiResponse<UserProgress> = { success: true, data: mockProgress };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.updateProgress({
        lessonId: 'lesson-1',
        sectionId: 'section-2',
      });

      expect(mockApi.post).toHaveBeenCalledWith('/learning/progress', {
        lessonId: 'lesson-1',
        sectionId: 'section-2',
      });
      expect(result).toEqual(mockProgress);
    });

    it('should update progress with quiz score', async () => {
      const response: ApiResponse<UserProgress> = { success: true, data: mockProgress };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      await learningService.updateProgress({
        lessonId: 'lesson-1',
        quizId: 'quiz-1',
        quizScore: 95,
      });

      expect(mockApi.post).toHaveBeenCalledWith('/learning/progress', {
        lessonId: 'lesson-1',
        quizId: 'quiz-1',
        quizScore: 95,
      });
    });
  });

  describe('completeLesson', () => {
    const mockProgress: UserProgress = {
      userId: 'user-1',
      lessonId: 'lesson-1',
      status: 'completed',
      completedSections: ['section-1', 'section-2', 'section-3'],
      completedQuizzes: ['quiz-1'],
      completedExercises: ['exercise-1'],
      quizScores: { 'quiz-1': 100 },
      currentSection: '',
      progressPercentage: 100,
      lastAccessedAt: '2024-01-15T00:00:00Z',
      completedAt: '2024-01-15T00:00:00Z',
    };

    it('should mark lesson as completed', async () => {
      const response: ApiResponse<UserProgress> = { success: true, data: mockProgress };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.completeLesson('lesson-1');

      expect(mockApi.post).toHaveBeenCalledWith('/learning/progress/lesson-1/complete');
      expect(result.status).toBe('completed');
    });

    it('should handle completion error', async () => {
      const response: ApiResponse<UserProgress> = { success: false, data: mockProgress, error: 'Cannot complete lesson' };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      await expect(learningService.completeLesson('lesson-1')).rejects.toThrow('Cannot complete lesson');
    });
  });

  describe('resetLessonProgress', () => {
    const mockProgress: UserProgress = {
      userId: 'user-1',
      lessonId: 'lesson-1',
      status: 'not-started',
      completedSections: [],
      completedQuizzes: [],
      completedExercises: [],
      quizScores: {},
      currentSection: '',
      progressPercentage: 0,
      lastAccessedAt: '2024-01-15T00:00:00Z',
    };

    it('should reset lesson progress', async () => {
      const response: ApiResponse<UserProgress> = { success: true, data: mockProgress };
      mockApi.delete.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.resetLessonProgress('lesson-1');

      expect(mockApi.delete).toHaveBeenCalledWith('/learning/progress/lesson-1');
      expect(result.status).toBe('not-started');
    });
  });

  describe('getLearningPaths', () => {
    const mockPaths: LearningPath[] = [
      {
        id: 'path-1',
        title: 'Astrology Fundamentals',
        description: 'Master the basics of astrology',
        level: 'beginner',
        estimatedDuration: 120,
        lessons: ['lesson-1', 'lesson-2', 'lesson-3'],
        prerequisites: [],
      },
    ];

    it('should fetch all learning paths', async () => {
      const response: ApiResponse<LearningPath[]> = { success: true, data: mockPaths };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.getLearningPaths();

      expect(mockApi.get).toHaveBeenCalledWith('/learning/paths');
      expect(result).toEqual(mockPaths);
    });
  });

  describe('getLearningPath', () => {
    const mockPath: LearningPath = {
      id: 'path-1',
      title: 'Astrology Fundamentals',
      description: 'Master the basics',
      level: 'beginner',
      estimatedDuration: 120,
      lessons: ['lesson-1', 'lesson-2'],
      prerequisites: [],
    };

    it('should fetch a specific learning path', async () => {
      const response: ApiResponse<LearningPath> = { success: true, data: mockPath };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.getLearningPath('path-1');

      expect(mockApi.get).toHaveBeenCalledWith('/learning/paths/path-1');
      expect(result).toEqual(mockPath);
    });
  });

  describe('startLearningPath', () => {
    it('should start a learning path', async () => {
      const response: ApiResponse<void> = { success: true, data: undefined as unknown as void };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      await learningService.startLearningPath('path-1');

      expect(mockApi.post).toHaveBeenCalledWith('/learning/paths/path-1/start');
    });

    it('should handle start error', async () => {
      const response: ApiResponse<void> = { success: false, data: undefined as unknown as void, error: 'Path not found' };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      await expect(learningService.startLearningPath('invalid-id')).rejects.toThrow('Path not found');
    });
  });

  describe('submitQuiz', () => {
    it('should submit quiz answers and return results', async () => {
      const mockResult = { score: 90, passed: true, feedback: ['Great job!', 'Question 3 was incorrect'] };
      const response: ApiResponse<typeof mockResult> = { success: true, data: mockResult };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.submitQuiz('lesson-1', 'quiz-1', { q1: 'a', q2: 'b' });

      expect(mockApi.post).toHaveBeenCalledWith('/learning/lessons/lesson-1/quizzes/quiz-1/submit', {
        answers: { q1: 'a', q2: 'b' },
      });
      expect(result).toEqual(mockResult);
    });

    it('should handle quiz submission with array answers', async () => {
      const mockResult = { score: 75, passed: false, feedback: ['Try again'] };
      const response: ApiResponse<typeof mockResult> = { success: true, data: mockResult };
      mockApi.post.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.submitQuiz('lesson-1', 'quiz-1', { q1: ['a', 'b'] });

      expect(result.passed).toBe(false);
    });
  });

  describe('searchLessons', () => {
    const mockLessons: Lesson[] = [
      {
        id: 'lesson-1',
        title: 'Sun in Aries',
        description: 'Learn about Sun in Aries',
        category: 'signs',
        level: 'intermediate',
        duration: 30,
        order: 1,
        prerequisites: [],
        tags: ['sun', 'aries'],
        isPublished: true,
      },
    ];

    it('should search lessons by query', async () => {
      const response: ApiResponse<Lesson[]> = { success: true, data: mockLessons };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.searchLessons('sun aries');

      expect(mockApi.get).toHaveBeenCalledWith('/learning/lessons/search', { params: { q: 'sun aries' } });
      expect(result).toEqual(mockLessons);
    });

    it('should return empty array for no results', async () => {
      const response: ApiResponse<Lesson[]> = { success: true, data: [] };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.searchLessons('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('getCourses', () => {
    const mockCourses: Course[] = [
      {
        id: 'course-1',
        title: 'Complete Astrology Course',
        description: 'Everything you need to know',
        category: 'basics',
        level: 'beginner',
        duration: 600,
        lessons: [],
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    it('should fetch all courses without filters', async () => {
      const response: ApiResponse<Course[]> = { success: true, data: mockCourses };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.getCourses();

      expect(mockApi.get).toHaveBeenCalledWith('/learning/courses', { params: expect.any(URLSearchParams) });
      expect(result).toEqual(mockCourses);
    });

    it('should fetch courses with filters', async () => {
      const response: ApiResponse<Course[]> = { success: true, data: mockCourses };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.getCourses({ category: 'basics', level: 'beginner' });

      expect(result).toEqual(mockCourses);
    });
  });

  describe('getCourse', () => {
    const mockCourse: Course = {
      id: 'course-1',
      title: 'Complete Astrology Course',
      description: 'Full course description',
      category: 'basics',
      level: 'beginner',
      duration: 600,
      lessons: [],
      createdAt: '2024-01-01T00:00:00Z',
    };

    it('should fetch a specific course by ID', async () => {
      const response: ApiResponse<Course> = { success: true, data: mockCourse };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.getCourse('course-1');

      expect(mockApi.get).toHaveBeenCalledWith('/learning/courses/course-1');
      expect(result).toEqual(mockCourse);
    });

    it('should handle course not found', async () => {
      const response: ApiResponse<Course> = { success: false, data: mockCourse, error: 'Course not found' };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      await expect(learningService.getCourse('invalid-id')).rejects.toThrow('Course not found');
    });
  });

  describe('searchCourses', () => {
    const mockCourses: Course[] = [
      {
        id: 'course-1',
        title: 'Advanced Transits',
        description: 'Deep dive into transits',
        category: 'transits',
        level: 'advanced',
        duration: 300,
        lessons: [],
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    it('should search courses by query', async () => {
      const response: ApiResponse<Course[]> = { success: true, data: mockCourses };
      mockApi.get.mockResolvedValueOnce(createMockResponse(response));

      const result = await learningService.searchCourses('transits');

      expect(mockApi.get).toHaveBeenCalledWith('/learning/courses/search', { params: { q: 'transits' } });
      expect(result).toEqual(mockCourses);
    });
  });
});
