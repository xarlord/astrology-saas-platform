/**
 * Learning Service
 *
 * Handles all learning center API calls
 * Manages lessons, user progress, quizzes, and learning paths
 */

import api from './api';
import type {
  Lesson,
  Course,
  UserProgress,
  LearningPath,
  UpdateProgressRequest,
  ApiResponse,
} from '../types/api.types';

export class LearningService {
  private readonly baseUrl = '/learning';

  /**
   * Get all published lessons
   */
  async getLessons(filters?: {
    category?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
  }): Promise<Lesson[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.level) params.append('level', filters.level);
      if (filters?.tags) filters.tags.forEach((tag) => params.append('tags', tag));

      const response = await api.get<ApiResponse<Lesson[]>>(`${this.baseUrl}/lessons`, { params });

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to get lessons');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get lessons');
    }
  }

  /**
   * Get a specific lesson by ID
   */
  async getLesson(lessonId: string): Promise<Lesson> {
    try {
      const response = await api.get<ApiResponse<Lesson>>(`${this.baseUrl}/lessons/${lessonId}`);

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to get lesson');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get lesson');
    }
  }

  /**
   * Get user's progress for all lessons
   */
  async getUserProgress(): Promise<UserProgress[]> {
    try {
      const response = await api.get<ApiResponse<UserProgress[]>>(`${this.baseUrl}/progress`);

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to get progress');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get progress');
    }
  }

  /**
   * Get progress for a specific lesson
   */
  async getLessonProgress(lessonId: string): Promise<UserProgress> {
    try {
      const response = await api.get<ApiResponse<UserProgress>>(
        `${this.baseUrl}/progress/${lessonId}`,
      );

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to get lesson progress');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get lesson progress');
    }
  }

  /**
   * Update user progress for a lesson
   */
  async updateProgress(request: UpdateProgressRequest): Promise<UserProgress> {
    try {
      const response = await api.post<ApiResponse<UserProgress>>(
        `${this.baseUrl}/progress`,
        request,
      );

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to update progress');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update progress');
    }
  }

  /**
   * Mark a lesson as completed
   */
  async completeLesson(lessonId: string): Promise<UserProgress> {
    try {
      const response = await api.post<ApiResponse<UserProgress>>(
        `${this.baseUrl}/progress/${lessonId}/complete`,
      );

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to complete lesson');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to complete lesson');
    }
  }

  /**
   * Reset progress for a lesson
   */
  async resetLessonProgress(lessonId: string): Promise<UserProgress> {
    try {
      const response = await api.delete<ApiResponse<UserProgress>>(
        `${this.baseUrl}/progress/${lessonId}`,
      );

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to reset progress');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to reset progress');
    }
  }

  /**
   * Get all learning paths
   */
  async getLearningPaths(): Promise<LearningPath[]> {
    try {
      const response = await api.get<ApiResponse<LearningPath[]>>(`${this.baseUrl}/paths`);

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to get learning paths');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get learning paths');
    }
  }

  /**
   * Get a specific learning path
   */
  async getLearningPath(pathId: string): Promise<LearningPath> {
    try {
      const response = await api.get<ApiResponse<LearningPath>>(`${this.baseUrl}/paths/${pathId}`);

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to get learning path');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get learning path');
    }
  }

  /**
   * Start a learning path
   */
  async startLearningPath(pathId: string): Promise<void> {
    try {
      const response = await api.post<ApiResponse<void>>(`${this.baseUrl}/paths/${pathId}/start`);

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to start learning path');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to start learning path');
    }
  }

  /**
   * Submit quiz answers
   */
  async submitQuiz(
    lessonId: string,
    quizId: string,
    answers: Record<string, string | string[]>,
  ): Promise<{ score: number; passed: boolean; feedback: string[] }> {
    try {
      const response = await api.post<
        ApiResponse<{ score: number; passed: boolean; feedback: string[] }>
      >(`${this.baseUrl}/lessons/${lessonId}/quizzes/${quizId}/submit`, {
        answers,
      });

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to submit quiz');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to submit quiz');
    }
  }

  /**
   * Search lessons
   */
  async searchLessons(query: string): Promise<Lesson[]> {
    try {
      const response = await api.get<ApiResponse<Lesson[]>>(`${this.baseUrl}/lessons/search`, {
        params: { q: query },
      });

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to search lessons');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to search lessons');
    }
  }

  /**
   * Get all published courses
   */
  async getCourses(filters?: {
    category?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
  }): Promise<Course[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.level) params.append('level', filters.level);

      const response = await api.get<ApiResponse<Course[]>>(`${this.baseUrl}/courses`, { params });

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to get courses');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get courses');
    }
  }

  /**
   * Get a specific course by ID
   */
  async getCourse(courseId: string): Promise<Course> {
    try {
      const response = await api.get<ApiResponse<Course>>(`${this.baseUrl}/courses/${courseId}`);

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to get course');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get course');
    }
  }

  /**
   * Search courses
   */
  async searchCourses(query: string): Promise<Course[]> {
    try {
      const response = await api.get<ApiResponse<Course[]>>(`${this.baseUrl}/courses/search`, {
        params: { q: query },
      });

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Failed to search courses');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to search courses');
    }
  }
}

// Export singleton instance
export const learningService = new LearningService();
export default learningService;
