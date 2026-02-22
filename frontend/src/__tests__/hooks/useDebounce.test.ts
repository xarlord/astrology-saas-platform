/**
 * Tests for useDebounce Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from '../../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));

    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Change the value
    rerender({ value: 'changed', delay: 500 });

    // Should still be initial before timeout
    expect(result.current).toBe('initial');

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now should be changed
    expect(result.current).toBe('changed');
  });

  it('should use default delay of 500ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'changed' });

    // Before default delay
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');

    // After default delay
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('changed');
  });

  it('should cancel pending debounce on value change', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // First change
    rerender({ value: 'first', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('initial');

    // Second change before first completes
    rerender({ value: 'second', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('initial'); // Still initial, timer was reset

    // Complete the debounce for second value
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe('second');
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'changed', delay: 200 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('changed');
  });

  it('should work with numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } }
    );

    expect(result.current).toBe(0);

    rerender({ value: 42 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(42);
  });

  it('should work with object values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: { name: 'initial' } } }
    );

    expect(result.current).toEqual({ name: 'initial' });

    const newValue = { name: 'changed' };
    rerender({ value: newValue });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toEqual({ name: 'changed' });
  });

  it('should work with array values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: [1, 2, 3] } }
    );

    expect(result.current).toEqual([1, 2, 3]);

    rerender({ value: [4, 5, 6] });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toEqual([4, 5, 6]);
  });

  it('should work with null and undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: null as string | null } }
    );

    expect(result.current).toBeNull();

    rerender({ value: 'not null' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('not null');

    rerender({ value: null });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBeNull();
  });

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() => useDebounce('test', 500));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should debounce callback execution', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    // Call multiple times quickly
    act(() => {
      result.current('arg1');
      result.current('arg2');
      result.current('arg3');
    });

    // Should not have been called yet
    expect(callback).not.toHaveBeenCalled();

    // Fast-forward
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should have been called only once with the last arguments
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg3');
  });

  it('should use default delay of 500ms', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback));

    act(() => {
      result.current();
    });

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should reset timer on each call', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current('first');
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Call again before timer completes
    act(() => {
      result.current('second');
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('second');
  });

  it('should handle multiple arguments', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current('arg1', 'arg2', 'arg3');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });

  it('should update when callback changes', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, 300),
      { initialProps: { cb: callback1 } }
    );

    // Call with first callback and let it complete
    act(() => {
      result.current();
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // First callback should have been called
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(0);

    // Now change callback and test second call
    rerender({ cb: callback2 });

    act(() => {
      result.current();
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // The new callback should be used for subsequent calls
    expect(callback1).toHaveBeenCalledTimes(1); // Still just 1 from before
    expect(callback2).toHaveBeenCalledTimes(1); // New callback called
  });

  it('should update when delay changes', () => {
    const callback = vi.fn();

    const { result, rerender } = renderHook(
      ({ delay }) => useDebouncedCallback(callback, delay),
      { initialProps: { delay: 500 } }
    );

    act(() => {
      result.current();
    });

    // Change delay
    rerender({ delay: 100 });

    act(() => {
      result.current();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
