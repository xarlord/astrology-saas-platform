/**
 * Error Handling Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../errorHandling';

describe('errorHandling', () => {
  describe('getErrorMessage', () => {
    it('should extract error message from API error response', () => {
      const err = {
        response: {
          data: {
            error: {
              message: 'Invalid credentials',
            },
          },
        },
      };

      expect(getErrorMessage(err, 'Fallback message')).toBe('Invalid credentials');
    });

    it('should return fallback message when error has no response', () => {
      const err = {
        message: 'Network error',
      };

      expect(getErrorMessage(err, 'Fallback message')).toBe('Fallback message');
    });

    it('should return fallback message when response data is missing', () => {
      const err = {
        response: {},
      };

      expect(getErrorMessage(err, 'Fallback message')).toBe('Fallback message');
    });

    it('should return fallback message when error object is missing', () => {
      expect(getErrorMessage(null, 'Fallback message')).toBe('Fallback message');
      expect(getErrorMessage(undefined, 'Fallback message')).toBe('Fallback message');
    });

    it('should return fallback message when error object structure is incomplete', () => {
      const err = {
        response: {
          data: {},
        },
      };

      expect(getErrorMessage(err, 'Fallback message')).toBe('Fallback message');
    });

    it('should return fallback message for plain Error objects', () => {
      const err = new Error('Standard error');
      expect(getErrorMessage(err, 'Fallback message')).toBe('Fallback message');
    });

    it('should handle empty string fallback', () => {
      const err = {
        response: {
          data: {
            error: {
              message: 'API error',
            },
          },
        },
      };

      expect(getErrorMessage(err, '')).toBe('API error');
    });
  });
});
