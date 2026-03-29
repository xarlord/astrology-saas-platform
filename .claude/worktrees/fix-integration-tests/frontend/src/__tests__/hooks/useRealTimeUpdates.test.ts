/**
 * Tests for useRealTimeUpdates Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState: number = MockWebSocket.CONNECTING;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  sentMessages: string[] = [];

  constructor(url: string) {
    this.url = url;
    // Simulate async connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 0);
  }

  send(data: string): void {
    this.sentMessages.push(data);
  }

  close(code = 1000, reason = ''): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close', { code, reason, wasClean: true }));
  }

  simulateMessage(data: unknown): void {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }));
  }

  simulateError(): void {
    this.onerror?.(new Event('error'));
  }
}

// Replace global WebSocket
vi.stubGlobal('WebSocket', MockWebSocket);

describe('useRealTimeUpdates', () => {
  let mockWs: MockWebSocket | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    mockWs = null;

    // Capture WebSocket instance
    const OriginalMockWebSocket = MockWebSocket;
    vi.stubGlobal('WebSocket', class extends OriginalMockWebSocket {
      constructor(url: string) {
        super(url);
        mockWs = this;
      }
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    mockWs = null;
  });

  const defaultOptions = {
    url: 'wss://test.example.com/ws',
    autoConnect: false,
  };

  it('should initialize with disconnected status', () => {
    const { result } = renderHook(() =>
      useRealTimeUpdates({ ...defaultOptions, autoConnect: false })
    );

    expect(result.current[0].status).toBe('disconnected');
    expect(result.current[0].isConnected).toBe(false);
    expect(result.current[0].reconnectAttempts).toBe(0);
    expect(result.current[0].error).toBeNull();
  });

  it('should auto-connect when autoConnect is true', async () => {
    const { result } = renderHook(() =>
      useRealTimeUpdates({ ...defaultOptions, autoConnect: true })
    );

    expect(result.current[0].status).toBe('connecting');

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current[0].status).toBe('connected');
    expect(result.current[0].isConnected).toBe(true);
  });

  it('should connect manually', async () => {
    const { result } = renderHook(() =>
      useRealTimeUpdates({ ...defaultOptions, autoConnect: false })
    );

    expect(result.current[0].status).toBe('disconnected');

    act(() => {
      result.current[1].connect();
    });

    expect(result.current[0].status).toBe('connecting');

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current[0].status).toBe('connected');
  });

  it('should disconnect manually', async () => {
    const { result } = renderHook(() =>
      useRealTimeUpdates({ ...defaultOptions, autoConnect: true })
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current[0].isConnected).toBe(true);

    act(() => {
      result.current[1].disconnect();
    });

    expect(result.current[0].status).toBe('disconnected');
    expect(result.current[0].isConnected).toBe(false);
  });

  it('should send messages when connected', async () => {
    const { result } = renderHook(() =>
      useRealTimeUpdates({ ...defaultOptions, autoConnect: true })
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    let sent: boolean;
    act(() => {
      sent = result.current[1].send('test-type', { data: 'test' });
    });

    expect(sent!).toBe(true);
    expect(mockWs?.sentMessages).toContainEqual(
      expect.stringContaining('"type":"test-type"')
    );
  });

  it('should not send messages when disconnected', () => {
    const { result } = renderHook(() =>
      useRealTimeUpdates({ ...defaultOptions, autoConnect: false })
    );

    const sent = result.current[1].send('test-type', { data: 'test' });
    expect(sent).toBe(false);
  });

  it('should receive messages', async () => {
    const onMessage = vi.fn();

    const { result } = renderHook(() =>
      useRealTimeUpdates({ ...defaultOptions, autoConnect: true, onMessage })
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const testMessage = {
      type: 'update',
      payload: { data: 'test' },
      timestamp: Date.now(),
    };

    act(() => {
      mockWs?.simulateMessage(testMessage);
    });

    expect(result.current[0].lastMessage).toEqual(testMessage);
    expect(onMessage).toHaveBeenCalledWith(testMessage);
  });

  it('should manage subscriptions', async () => {
    const { result } = renderHook(() =>
      useRealTimeUpdates({
        ...defaultOptions,
        autoConnect: true,
        subscriptions: ['channel1'],
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current[0].subscriptions.has('channel1')).toBe(true);

    act(() => {
      result.current[1].subscribe('channel2');
    });

    expect(result.current[0].subscriptions.has('channel2')).toBe(true);

    act(() => {
      result.current[1].unsubscribe('channel1');
    });

    expect(result.current[0].subscriptions.has('channel1')).toBe(false);
  });

  it('should handle connection errors', async () => {
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useRealTimeUpdates({
        ...defaultOptions,
        autoConnect: true,
        autoReconnect: false,
        onError,
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    act(() => {
      mockWs?.simulateError();
    });

    expect(result.current[0].status).toBe('error');
    expect(onError).toHaveBeenCalled();
  });

  it('should call onOpen callback', async () => {
    const onOpen = vi.fn();

    renderHook(() =>
      useRealTimeUpdates({
        ...defaultOptions,
        autoConnect: true,
        onOpen,
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    expect(onOpen).toHaveBeenCalled();
  });

  it('should call onClose callback', async () => {
    const onClose = vi.fn();

    const { result } = renderHook(() =>
      useRealTimeUpdates({
        ...defaultOptions,
        autoConnect: true,
        onClose,
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    act(() => {
      result.current[1].disconnect();
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('should manually reconnect', async () => {
    const { result } = renderHook(() =>
      useRealTimeUpdates({ ...defaultOptions, autoConnect: true })
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current[0].isConnected).toBe(true);

    act(() => {
      result.current[1].reconnect();
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current[0].reconnectAttempts).toBe(0);
  });

  it('should clear error on successful connection', async () => {
    const { result } = renderHook(() =>
      useRealTimeUpdates({
        ...defaultOptions,
        autoConnect: true,
        autoReconnect: false,
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    // Trigger error
    act(() => {
      mockWs?.simulateError();
    });

    expect(result.current[0].error).toBe('WebSocket connection error');

    // Reconnect
    act(() => {
      result.current[1].reconnect();
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current[0].error).toBeNull();
  });
});
