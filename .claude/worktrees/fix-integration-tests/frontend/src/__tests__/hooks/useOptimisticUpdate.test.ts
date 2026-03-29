/**
 * Tests for useOptimisticUpdate Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOptimisticUpdate } from '../../hooks/useOptimisticUpdate';

describe('useOptimisticUpdate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const createMockOptions = (overrides = {}) => ({
    currentValue: 'initial',
    updateFn: vi.fn().mockResolvedValue(undefined),
    maxRetries: 3,
    retryDelay: 1000,
    ...overrides,
  });

  it('should initialize with current value', () => {
    const options = createMockOptions();
    const { result } = renderHook(() => useOptimisticUpdate(options));

    const [state] = result.current;

    expect(state.value).toBe('initial');
    expect(state.isUpdating).toBe(false);
    expect(state.isOptimistic).toBe(false);
    expect(state.pendingCount).toBe(0);
    expect(state.error).toBeNull();
  });

  it('should optimistically update value', async () => {
    let resolveUpdate: () => void;
    const updateFn = vi.fn().mockImplementation(
      () => new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      })
    );
    const options = createMockOptions({ updateFn });

    const { result } = renderHook(() => useOptimisticUpdate(options));

    // Start update
    act(() => {
      result.current[1].update('new-value');
    });

    // Check optimistic state before promise resolves
    const stateDuringUpdate = result.current[0];
    expect(stateDuringUpdate.value).toBe('new-value');
    expect(stateDuringUpdate.isOptimistic).toBe(true);

    // Resolve the promise
    await act(async () => {
      resolveUpdate!();
      await Promise.resolve();
    });
  });

  it('should confirm value after successful update', async () => {
    const updateFn = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    const options = createMockOptions({ updateFn, onSuccess });

    const { result } = renderHook(() => useOptimisticUpdate(options));

    await act(async () => {
      await result.current[1].update('new-value');
    });

    const [state] = result.current;

    expect(state.value).toBe('new-value');
    expect(state.isOptimistic).toBe(false);
    expect(state.isUpdating).toBe(false);
    expect(onSuccess).toHaveBeenCalledWith('new-value');
  });

  it('should use returned value from updateFn', async () => {
    const updateFn = vi.fn().mockResolvedValue('server-value');
    const options = createMockOptions({ updateFn });

    const { result } = renderHook(() => useOptimisticUpdate(options));

    await act(async () => {
      await result.current[1].update('client-value');
    });

    const [state] = result.current;

    // Should use server-returned value
    expect(state.value).toBe('server-value');
  });

  it('should rollback on failure', async () => {
    const updateFn = vi.fn().mockRejectedValue(new Error('Update failed'));
    const onError = vi.fn();
    const onRollback = vi.fn();
    const options = createMockOptions({
      updateFn,
      onError,
      onRollback,
      maxRetries: 0, // No retries
    });

    const { result } = renderHook(() => useOptimisticUpdate(options));

    await act(async () => {
      await result.current[1].update('new-value');
    });

    const [state] = result.current;

    // Should rollback to initial value
    expect(state.value).toBe('initial');
    expect(state.isOptimistic).toBe(false);
    expect(onError).toHaveBeenCalled();
    expect(onRollback).toHaveBeenCalledWith('initial');
  });

  it('should provide clearError method', async () => {
    const updateFn = vi.fn().mockRejectedValue(new Error('Error'));
    const options = createMockOptions({ updateFn, maxRetries: 0 });

    const { result } = renderHook(() => useOptimisticUpdate(options));

    await act(async () => {
      await result.current[1].update('new-value');
    });

    expect(result.current[0].error).not.toBeNull();

    act(() => {
      result.current[1].clearError();
    });

    expect(result.current[0].error).toBeNull();
  });

  it('should provide reset method', async () => {
    const options = createMockOptions({ currentValue: 'initial' });

    const { result, rerender } = renderHook(
      ({ currentValue }) => useOptimisticUpdate({ ...options, currentValue }),
      { initialProps: { currentValue: 'initial' } }
    );

    // Update value
    await act(async () => {
      await result.current[1].update('new-value');
    });

    // Change current value prop
    rerender({ currentValue: 'updated-prop' });

    // Reset to current value
    act(() => {
      result.current[1].reset();
    });

    expect(result.current[0].value).toBe('updated-prop');
    expect(result.current[0].isUpdating).toBe(false);
    expect(result.current[0].isOptimistic).toBe(false);
  });

  it('should track pending count for concurrent updates', async () => {
    const resolvers: (() => void)[] = [];
    const updateFn = vi.fn().mockImplementation(
      () => new Promise<void>((resolve) => {
        resolvers.push(resolve);
      })
    );
    const options = createMockOptions({ updateFn });

    const { result } = renderHook(() => useOptimisticUpdate(options));

    // Start two updates
    act(() => {
      result.current[1].update('value1');
      result.current[1].update('value2');
    });

    // Both should be pending
    expect(result.current[0].pendingCount).toBe(2);

    // Resolve first
    await act(async () => {
      resolvers[0]();
      await Promise.resolve();
    });

    // One pending remaining
    expect(result.current[0].pendingCount).toBe(1);

    // Resolve second
    await act(async () => {
      resolvers[1]();
      await Promise.resolve();
    });

    expect(result.current[0].pendingCount).toBe(0);
  });

  it('should use custom isEqual function', async () => {
    const isEqual = vi.fn((a, b) => JSON.stringify(a) === JSON.stringify(b));
    const updateFn = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useOptimisticUpdate({
        currentValue: { x: 0, y: 0 },
        updateFn,
        isEqual,
      })
    );

    await act(async () => {
      await result.current[1].update({ x: 1, y: 1 });
    });

    expect(isEqual).toHaveBeenCalled();
    expect(result.current[0].value).toEqual({ x: 1, y: 1 });
  });

  it('should track retries remaining on failure', async () => {
    const updateFn = vi.fn().mockRejectedValue(new Error('Error'));
    const options = createMockOptions({ updateFn, maxRetries: 3, retryDelay: 5000 });

    const { result } = renderHook(() => useOptimisticUpdate(options));

    act(() => {
      result.current[1].update('new-value');
    });

    // After first attempt
    await act(async () => {
      await Promise.resolve();
    });

    // Should have started retry countdown
    expect(result.current[0].retriesRemaining).toBeLessThan(3);
  });
});
