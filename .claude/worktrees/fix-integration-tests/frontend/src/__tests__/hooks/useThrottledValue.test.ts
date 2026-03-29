/**
 * Tests for useThrottledValue Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThrottledValue, useThrottledValues } from '../../hooks/useThrottledValue';

describe('useThrottledValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() =>
      useThrottledValue('initial', { interval: 100 })
    );

    const [throttledValue] = result.current;
    expect(throttledValue).toBe('initial');
  });

  it('should throttle rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottledValue(value, { interval: 100 }),
      { initialProps: { value: 'initial' } }
    );

    // First update after initial render - should be throttled
    rerender({ value: 'update1' });

    // Should be throttled (within 100ms)
    expect(result.current[0]).toBe('initial');

    // Advance time
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current[0]).toBe('update1');
  });

  it('should update immediately when interval has passed', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottledValue(value, { interval: 100 }),
      { initialProps: { value: 'initial' } }
    );

    // First update - throttled
    rerender({ value: 'update1' });

    // Advance past interval
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current[0]).toBe('update1');

    // Next update after interval should be throttled at first
    rerender({ value: 'update2' });
    expect(result.current[0]).toBe('update1');

    // Then update after delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current[0]).toBe('update2');
  });

  it('should provide flush method', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottledValue(value, { interval: 100 }),
      { initialProps: { value: 'initial' } }
    );

    // Trigger update - throttled
    rerender({ value: 'update1' });
    rerender({ value: 'update2' });
    expect(result.current[0]).toBe('initial');

    // Flush pending update
    act(() => {
      result.current[1](); // flush
    });

    expect(result.current[0]).toBe('update2');
  });

  it('should provide cancel method', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottledValue(value, { interval: 100 }),
      { initialProps: { value: 'initial' } }
    );

    // Trigger update - throttled
    rerender({ value: 'update1' });
    expect(result.current[0]).toBe('initial');

    // Cancel pending update
    act(() => {
      result.current[2](); // cancel
    });

    // Advance time - should not update
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current[0]).toBe('initial');
  });

  it('should call onThrottled callback', () => {
    const onThrottled = vi.fn();

    const { result, rerender } = renderHook(
      ({ value }) => useThrottledValue(value, { interval: 100, onThrottled }),
      { initialProps: { value: 'initial' } }
    );

    // Trigger throttled update
    rerender({ value: 'update1' });

    expect(onThrottled).toHaveBeenCalledWith('update1');
  });

  it('should work with numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottledValue(value, { interval: 100 }),
      { initialProps: { value: 0 } }
    );

    expect(result.current[0]).toBe(0);

    rerender({ value: 1 });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current[0]).toBe(1);
  });

  it('should work with object values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottledValue(value, { interval: 100 }),
      { initialProps: { value: { x: 0, y: 0 } } }
    );

    rerender({ value: { x: 10, y: 10 } });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current[0]).toEqual({ x: 10, y: 10 });
  });

  it('should use default interval of 100ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottledValue(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'update1' });
    rerender({ value: 'update2' });

    // Before 100ms
    act(() => {
      vi.advanceTimersByTime(99);
    });
    expect(result.current[0]).toBe('initial');

    // After 100ms
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current[0]).toBe('update2');
  });
});

describe('useThrottledValues', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should throttle multiple values together', () => {
    const { result, rerender } = renderHook(
      ({ values }) => useThrottledValues(values, { interval: 100 }),
      { initialProps: { values: { x: 0, y: 0 } } }
    );

    expect(result.current[0]).toEqual({ x: 0, y: 0 });

    // Throttled update
    rerender({ values: { x: 10, y: 10 } });
    expect(result.current[0]).toEqual({ x: 0, y: 0 });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current[0]).toEqual({ x: 10, y: 10 });
  });

  it('should provide flush and cancel methods', () => {
    const { result, rerender } = renderHook(
      ({ values }) => useThrottledValues(values, { interval: 100 }),
      { initialProps: { values: { x: 0, y: 0 } } }
    );

    rerender({ values: { x: 10, y: 10 } });
    rerender({ values: { x: 20, y: 20 } });

    // Test flush
    act(() => {
      result.current[1](); // flush
    });
    expect(result.current[0]).toEqual({ x: 20, y: 20 });
  });

  it('should return initial values on mount', () => {
    const { result } = renderHook(
      ({ values }) => useThrottledValues(values, { interval: 100 }),
      { initialProps: { values: { x: 0, y: 0 } } }
    );

    // Initial mount - should use initial values
    expect(result.current[0]).toEqual({ x: 0, y: 0 });
  });
});
