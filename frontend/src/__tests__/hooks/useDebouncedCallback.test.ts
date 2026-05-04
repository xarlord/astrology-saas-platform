/**
 * Tests for useDebouncedCallback Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';

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
    const { result } = renderHook(() => useDebouncedCallback(callback, { delay: 300 }));

    act(() => {
      result.current('arg1');
      result.current('arg2');
      result.current('arg3');
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg3');
  });

  it('should use default delay of 300ms', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback));

    act(() => {
      result.current();
    });

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should support leading edge execution', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(callback, { delay: 300, leading: true }),
    );

    act(() => {
      result.current('first');
    });

    // Leading edge should call immediately
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('first');

    // Subsequent calls should be debounced
    act(() => {
      result.current('second');
      result.current('third');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Trailing edge (default)
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('third');
  });

  it('should support disabling trailing edge', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(callback, { delay: 300, leading: true, trailing: false }),
    );

    act(() => {
      result.current('first');
    });

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // No trailing call
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should support maxWait option', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(callback, { delay: 100, maxWait: 250 }),
    );

    // Call multiple times, each within the delay
    act(() => {
      result.current('arg1');
    });

    act(() => {
      vi.advanceTimersByTime(50);
      result.current('arg2');
    });

    act(() => {
      vi.advanceTimersByTime(50);
      result.current('arg3');
    });

    // Not yet called
    expect(callback).not.toHaveBeenCalled();

    // Continue calling past maxWait
    act(() => {
      vi.advanceTimersByTime(50);
      result.current('arg4');
    });

    // Now maxWait should trigger
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalled();
  });

  it('should provide cancel method', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, { delay: 300 }));

    act(() => {
      result.current('arg');
    });

    // Cancel before timer completes
    act(() => {
      result.current.cancel();
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should provide flush method', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, { delay: 300 }));

    act(() => {
      result.current('arg');
    });

    // Flush before timer completes
    act(() => {
      result.current.flush();
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg');

    // Timer should be cleared
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should provide pending method', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, { delay: 300 }));

    expect(result.current.pending()).toBe(false);

    act(() => {
      result.current('arg');
    });

    expect(result.current.pending()).toBe(true);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.pending()).toBe(false);
  });

  it('should handle multiple arguments', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, { delay: 300 }));

    act(() => {
      result.current('arg1', 'arg2', 'arg3');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });

  it('should reset timer on each call', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, { delay: 300 }));

    act(() => {
      result.current('first');
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(callback).not.toHaveBeenCalled();

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

  it('should handle callback changes', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { result, rerender } = renderHook(({ cb }) => useDebouncedCallback(cb, { delay: 300 }), {
      initialProps: { cb: callback1 },
    });

    act(() => {
      result.current();
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback1).toHaveBeenCalledTimes(1);

    rerender({ cb: callback2 });

    act(() => {
      result.current();
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should handle delay changes', () => {
    const callback = vi.fn();

    const { result, rerender } = renderHook(
      ({ delay }) => useDebouncedCallback(callback, { delay }),
      { initialProps: { delay: 500 } },
    );

    act(() => {
      result.current();
    });

    rerender({ delay: 100 });

    act(() => {
      result.current();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle both leading and trailing disabled', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(callback, { delay: 300, leading: false, trailing: false }),
    );

    act(() => {
      result.current('arg');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // With both disabled, callback should never be called
    expect(callback).not.toHaveBeenCalled();
  });

  it('should only call leading once per debounce cycle', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(callback, { delay: 300, leading: true, trailing: false }),
    );

    act(() => {
      result.current('first');
      result.current('second');
      result.current('third');
    });

    // Only leading call
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('first');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // No trailing call
    expect(callback).toHaveBeenCalledTimes(1);

    // New cycle
    act(() => {
      result.current('new-cycle');
    });

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('new-cycle');
  });
});
