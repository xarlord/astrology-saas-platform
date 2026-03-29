/**
 * Tests for useLocalStorage Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useLocalStorage,
  useLocalStorageObject,
  useLocalStorageArray,
} from '../../hooks/useLocalStorage';

// Create a fresh mock store
const createLocalStorageMock = () => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    store,
  };
};

describe('useLocalStorage', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    // Replace the global localStorage mock from setup with our instance-based one
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should return initial value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('initial');
    });

    it('should return stored value when localStorage has data', () => {
      localStorageMock.store['test-key'] = JSON.stringify('stored');

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('stored');
    });

    it('should update localStorage when value changes', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
      expect(localStorageMock.store['test-key']).toBe(JSON.stringify('updated'));
    });

    it('should support functional updates', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 5));

      act(() => {
        result.current[1]((prev) => prev + 1);
      });

      expect(result.current[0]).toBe(6);
      expect(localStorageMock.store['test-key']).toBe(JSON.stringify(6));
    });

    it('should remove value from localStorage', () => {
      localStorageMock.store['test-key'] = JSON.stringify('stored');

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current[2](); // removeValue
      });

      expect(result.current[0]).toBe('initial');
    });
  });

  describe('error handling', () => {
    it('should handle JSON parse errors gracefully', () => {
      localStorageMock.store['test-key'] = 'invalid-json{';

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('initial');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle localStorage setItem errors', () => {
      const errorMock = createLocalStorageMock();
      errorMock.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      Object.defineProperty(global, 'localStorage', {
        value: errorMock,
        writable: true,
        configurable: true,
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current[1]('updated');
      });

      // Value should still be updated in state
      expect(result.current[0]).toBe('updated');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('type support', () => {
    it('should handle string values', () => {
      const { result } = renderHook(() => useLocalStorage('str-key', 'hello'));

      expect(result.current[0]).toBe('hello');

      act(() => {
        result.current[1]('world');
      });

      expect(result.current[0]).toBe('world');
    });

    it('should handle number values', () => {
      const { result } = renderHook(() => useLocalStorage('num-key', 42));

      expect(result.current[0]).toBe(42);

      act(() => {
        result.current[1](100);
      });

      expect(result.current[0]).toBe(100);
    });

    it('should handle boolean values', () => {
      const { result } = renderHook(() => useLocalStorage('bool-key', false));

      expect(result.current[0]).toBe(false);

      act(() => {
        result.current[1](true);
      });

      expect(result.current[0]).toBe(true);
    });

    it('should handle object values', () => {
      const initial = { name: 'test', count: 0 };
      const { result } = renderHook(() => useLocalStorage('obj-key', initial));

      expect(result.current[0]).toEqual(initial);

      act(() => {
        result.current[1]({ name: 'updated', count: 1 });
      });

      expect(result.current[0]).toEqual({ name: 'updated', count: 1 });
    });

    it('should handle array values', () => {
      const { result } = renderHook(() => useLocalStorage('arr-key', [1, 2, 3]));

      expect(result.current[0]).toEqual([1, 2, 3]);

      act(() => {
        result.current[1]([4, 5, 6]);
      });

      expect(result.current[0]).toEqual([4, 5, 6]);
    });

    it('should handle null values', () => {
      const { result } = renderHook(() =>
        useLocalStorage<string | null>('null-key', null)
      );

      expect(result.current[0]).toBeNull();

      act(() => {
        result.current[1]('not null');
      });

      expect(result.current[0]).toBe('not null');
    });
  });

  describe('storage events', () => {
    it('should sync state across tabs via storage event', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      // Simulate storage event from another tab
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'test-key',
          newValue: JSON.stringify('synced'),
        });
        window.dispatchEvent(storageEvent);
      });

      expect(result.current[0]).toBe('synced');
    });

    it('should ignore storage events for different keys', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'other-key',
          newValue: JSON.stringify('other'),
        });
        window.dispatchEvent(storageEvent);
      });

      expect(result.current[0]).toBe('initial');
    });

    it('should ignore storage events with null newValue', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'test-key',
          newValue: null,
        });
        window.dispatchEvent(storageEvent);
      });

      expect(result.current[0]).toBe('initial');
    });
  });
});

describe('useLocalStorageObject', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should update specific fields', () => {
    interface TestObj {
      name: string;
      count: number;
    }

    const { result } = renderHook(() =>
      useLocalStorageObject<TestObj>('obj-key', { name: 'initial', count: 0 })
    );

    act(() => {
      result.current[1]({ count: 5 });
    });

    expect(result.current[0]).toEqual({ name: 'initial', count: 5 });
  });

  it('should merge multiple updates', () => {
    interface TestObj {
      a: number;
      b: number;
      c: number;
    }

    const { result } = renderHook(() =>
      useLocalStorageObject<TestObj>('obj-key', { a: 1, b: 2, c: 3 })
    );

    act(() => {
      result.current[1]({ a: 10 });
    });

    act(() => {
      result.current[1]({ b: 20 });
    });

    expect(result.current[0]).toEqual({ a: 10, b: 20, c: 3 });
  });

  it('should remove value', () => {
    interface TestObj {
      name: string;
    }

    const { result } = renderHook(() =>
      useLocalStorageObject<TestObj>('obj-key', { name: 'test' })
    );

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toEqual({ name: 'test' });
    expect(localStorageMock.store['obj-key']).toBeUndefined();
  });
});

describe('useLocalStorageArray', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should add items', () => {
    const { result } = renderHook(() => useLocalStorageArray<string>('arr-key', []));

    act(() => {
      result.current[1].addItem('first');
    });

    expect(result.current[0]).toEqual(['first']);

    act(() => {
      result.current[1].addItem('second');
    });

    expect(result.current[0]).toEqual(['first', 'second']);
  });

  it('should remove items by index', () => {
    const { result } = renderHook(() =>
      useLocalStorageArray<string>('arr-key', ['a', 'b', 'c'])
    );

    act(() => {
      result.current[1].removeItem(1);
    });

    expect(result.current[0]).toEqual(['a', 'c']);
  });

  it('should update items by index', () => {
    const { result } = renderHook(() =>
      useLocalStorageArray<string>('arr-key', ['a', 'b', 'c'])
    );

    act(() => {
      result.current[1].updateItem(1, 'B');
    });

    expect(result.current[0]).toEqual(['a', 'B', 'c']);
  });

  it('should clear all items', () => {
    const { result } = renderHook(() =>
      useLocalStorageArray<string>('arr-key', ['a', 'b', 'c'])
    );

    act(() => {
      result.current[1].clear();
    });

    expect(result.current[0]).toEqual([]);
  });

  it('should handle object arrays', () => {
    interface Item {
      id: number;
      name: string;
    }

    const { result } = renderHook(() =>
      useLocalStorageArray<Item>('arr-key', [])
    );

    act(() => {
      result.current[1].addItem({ id: 1, name: 'first' });
    });

    act(() => {
      result.current[1].addItem({ id: 2, name: 'second' });
    });

    expect(result.current[0]).toEqual([
      { id: 1, name: 'first' },
      { id: 2, name: 'second' },
    ]);

    act(() => {
      result.current[1].updateItem(0, { id: 1, name: 'FIRST' });
    });

    expect(result.current[0][0]).toEqual({ id: 1, name: 'FIRST' });
  });
});
