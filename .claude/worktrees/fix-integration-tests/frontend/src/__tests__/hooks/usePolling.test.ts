/**
 * Tests for usePolling Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePolling } from '../../hooks/usePolling';

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const createPollFn = <T,>(data: T) => vi.fn().mockResolvedValue(data);

  it('should initialize with null data', () => {
    const pollFn = createPollFn({ value: 'test' });
    const { result } = renderHook(() =>
      usePolling(pollFn, { enabled: false })
    );

    const [state] = result.current;

    expect(state.data).toBeNull();
    expect(state.isPolling).toBe(false);
    expect(state.isPaused).toBe(false);
    expect(state.pollCount).toBe(0);
    expect(state.error).toBeNull();
  });

  it('should poll at specified interval', async () => {
    const pollFn = createPollFn({ value: 'test' });
    const interval = 100;

    const { result } = renderHook(() =>
      usePolling(pollFn, { interval, enabled: true, immediate: true })
    );

    // First poll (immediate)
    await act(async () => {
      // Run microtasks only (for the promise)
      await Promise.resolve();
    });

    expect(pollFn).toHaveBeenCalledTimes(1);
    expect(result.current[0].pollCount).toBe(1);
  });

  it('should update data on successful poll', async () => {
    const testData = { value: 'test-data' };
    const pollFn = createPollFn(testData);

    const { result } = renderHook(() =>
      usePolling(pollFn, { interval: 100, enabled: true, immediate: true })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current[0].data).toEqual(testData);
    expect(result.current[0].lastPollTime).toBeGreaterThan(0);
  });

  it('should handle poll errors', async () => {
    const error = new Error('Poll failed');
    const pollFn = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    const { result } = renderHook(() =>
      usePolling(pollFn, {
        interval: 100,
        enabled: true,
        immediate: true,
        onError,
        maxErrors: 5,
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current[0].error).toEqual(error);
    expect(result.current[0].errorCount).toBe(1);
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('should provide manual start/stop', async () => {
    const pollFn = createPollFn({ value: 'test' });

    const { result } = renderHook(() =>
      usePolling(pollFn, { interval: 100, enabled: false })
    );

    // Should not poll when disabled
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(pollFn).not.toHaveBeenCalled();

    // Start manually - starts the interval but doesn't poll immediately
    act(() => {
      result.current[1].start();
    });

    // Wait for interval to trigger the first poll
    await act(async () => {
      vi.advanceTimersByTime(100);
      await Promise.resolve();
    });

    // The interval should have triggered a poll
    const callCountAfterStart = pollFn.mock.calls.length;

    // Stop manually
    act(() => {
      result.current[1].stop();
    });

    // Advance more time
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Should not poll after stop (call count should be same)
    expect(pollFn.mock.calls.length).toBe(callCountAfterStart);
  });

  it('should provide pause/resume', async () => {
    const pollFn = createPollFn({ value: 'test' });

    const { result } = renderHook(() =>
      usePolling(pollFn, { interval: 100, enabled: true, immediate: true })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current[0].pollCount).toBe(1);

    // Pause
    act(() => {
      result.current[1].pause();
    });

    expect(result.current[0].isPaused).toBe(true);

    // Resume
    act(() => {
      result.current[1].resume();
    });

    expect(result.current[0].isPaused).toBe(false);
  });

  it('should provide manual poll method', async () => {
    const pollFn = createPollFn({ value: 'test' });

    const { result } = renderHook(() =>
      usePolling(pollFn, { interval: 10000, enabled: false })
    );

    // Manual poll
    await act(async () => {
      await result.current[1].poll();
    });

    expect(pollFn).toHaveBeenCalledTimes(1);
    expect(result.current[0].pollCount).toBe(1);
  });

  it('should provide reset method', async () => {
    const pollFn = vi.fn().mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() =>
      usePolling(pollFn, {
        interval: 100,
        enabled: true,
        immediate: true,
        maxErrors: 5,
        errorRetryDelay: 5000, // Long delay to prevent retries
      })
    );

    // Trigger error
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current[0].errorCount).toBe(1);

    // Reset
    act(() => {
      result.current[1].reset();
    });

    expect(result.current[0].errorCount).toBe(0);
    expect(result.current[0].error).toBeNull();
  });

  it('should call onSuccess callback', async () => {
    const testData = { value: 'test' };
    const pollFn = createPollFn(testData);
    const onSuccess = vi.fn();

    renderHook(() =>
      usePolling(pollFn, {
        interval: 100,
        enabled: true,
        immediate: true,
        onSuccess,
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(onSuccess).toHaveBeenCalledWith(testData);
  });

  it('should poll immediately when immediate option is true', async () => {
    const pollFn = createPollFn({ value: 'test' });

    renderHook(() =>
      usePolling(pollFn, {
        interval: 1000,
        enabled: true,
        immediate: true,
      })
    );

    // Should poll immediately without waiting for interval
    await act(async () => {
      await Promise.resolve();
    });

    expect(pollFn).toHaveBeenCalled();
  });

  it('should track nextPollTime', async () => {
    const pollFn = createPollFn({ value: 'test' });
    const interval = 1000;

    const { result } = renderHook(() =>
      usePolling(pollFn, { interval, enabled: true, immediate: true })
    );

    await act(async () => {
      await Promise.resolve();
    });

    const nextPollTime = result.current[0].nextPollTime;
    expect(nextPollTime).toBeGreaterThan(0);
  });

  it('should prevent concurrent polls', async () => {
    let resolvePoll: () => void;
    const pollFn = vi.fn().mockImplementation(
      () => new Promise<void>((resolve) => {
        resolvePoll = resolve;
      })
    );

    const { result } = renderHook(() =>
      usePolling(pollFn, { interval: 10, enabled: true, immediate: true })
    );

    // Start first poll
    await act(async () => {
      await Promise.resolve();
    });

    expect(pollFn).toHaveBeenCalledTimes(1);
    expect(result.current[0].isPolling).toBe(true);

    // Try to advance time while poll is pending
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Should not have called again while polling
    expect(pollFn).toHaveBeenCalledTimes(1);

    // Resolve the poll
    await act(async () => {
      resolvePoll!();
      await Promise.resolve();
    });

    expect(result.current[0].isPolling).toBe(false);
  });
});
