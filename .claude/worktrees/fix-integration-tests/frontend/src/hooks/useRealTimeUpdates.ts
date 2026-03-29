/**
 * useRealTimeUpdates Hook
 *
 * WebSocket connection management with auto-reconnect,
 * connection status tracking, and subscription management.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
}

export interface RealTimeUpdateOptions {
  /** WebSocket URL */
  url: string;
  /** Auto-connect on mount (default: true) */
  autoConnect?: boolean;
  /** Enable auto-reconnect (default: true) */
  autoReconnect?: boolean;
  /** Initial reconnect delay in ms (default: 1000) */
  reconnectDelay?: number;
  /** Maximum reconnect delay in ms (default: 30000) */
  maxReconnectDelay?: number;
  /** Maximum reconnect attempts (default: 10) */
  maxReconnectAttempts?: number;
  /** Connection timeout in ms (default: 10000) */
  connectionTimeout?: number;
  /** Heartbeat interval in ms (default: 30000) */
  heartbeatInterval?: number;
  /** Callback when connection opens */
  onOpen?: () => void;
  /** Callback when connection closes */
  onClose?: (event: CloseEvent) => void;
  /** Callback on connection error */
  onError?: (error: Event) => void;
  /** Callback when message is received */
  onMessage?: (message: WebSocketMessage) => void;
  /** Subscriptions to manage */
  subscriptions?: string[];
}

export interface RealTimeUpdateState {
  /** Current connection status */
  status: ConnectionStatus;
  /** Whether connected */
  isConnected: boolean;
  /** Number of reconnect attempts */
  reconnectAttempts: number;
  /** Last error message */
  error: string | null;
  /** Last message received */
  lastMessage: WebSocketMessage | null;
  /** Active subscriptions */
  subscriptions: Set<string>;
}

export interface RealTimeUpdateActions {
  /** Connect to WebSocket */
  connect: () => void;
  /** Disconnect from WebSocket */
  disconnect: () => void;
  /** Send a message */
  send: <T>(type: string, payload: T) => boolean;
  /** Subscribe to a channel */
  subscribe: (channel: string) => void;
  /** Unsubscribe from a channel */
  unsubscribe: (channel: string) => void;
  /** Reconnect manually */
  reconnect: () => void;
}

const DEFAULT_RECONNECT_DELAY = 1000;
const DEFAULT_MAX_RECONNECT_DELAY = 30000;
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 10;
const DEFAULT_CONNECTION_TIMEOUT = 10000;
const DEFAULT_HEARTBEAT_INTERVAL = 30000;

/**
 * Custom hook for WebSocket real-time updates
 *
 * @example
 * ```tsx
 * const [state, actions] = useRealTimeUpdates({
 *   url: 'wss://api.example.com/ws',
 *   subscriptions: ['transits', 'moon-phases'],
 *   onMessage: (msg) => {
 *     if (msg.type === 'transit-update') {
 *       updateTransits(msg.payload);
 *     }
 *   }
 * });
 * ```
 */
export function useRealTimeUpdates(
  options: RealTimeUpdateOptions
): [RealTimeUpdateState, RealTimeUpdateActions] {
  const {
    url,
    autoConnect = true,
    autoReconnect = true,
    reconnectDelay = DEFAULT_RECONNECT_DELAY,
    maxReconnectDelay = DEFAULT_MAX_RECONNECT_DELAY,
    maxReconnectAttempts = DEFAULT_MAX_RECONNECT_ATTEMPTS,
    connectionTimeout = DEFAULT_CONNECTION_TIMEOUT,
    heartbeatInterval = DEFAULT_HEARTBEAT_INTERVAL,
    onOpen,
    onClose,
    onError,
    onMessage,
    subscriptions: initialSubscriptions = [],
  } = options;

  const [state, setState] = useState<RealTimeUpdateState>({
    status: 'disconnected',
    isConnected: false,
    reconnectAttempts: 0,
    error: null,
    lastMessage: null,
    subscriptions: new Set(initialSubscriptions),
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  /**
   * Clear all timers
   */
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  /**
   * Calculate exponential backoff delay
   */
  const getReconnectDelay = useCallback(
    (attempt: number): number => {
      const delay = reconnectDelay * Math.pow(2, attempt);
      return Math.min(delay, maxReconnectDelay);
    },
    [reconnectDelay, maxReconnectDelay]
  );

  /**
   * Start heartbeat to keep connection alive
   */
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, heartbeatInterval);
  }, [heartbeatInterval]);

  /**
   * Handle incoming messages
   */
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const message: WebSocketMessage = JSON.parse(event.data as string);

        setState((prev) => ({
          ...prev,
          lastMessage: message,
        }));

        // Handle pong response
        if (message.type === 'pong') {
          return;
        }

        onMessage?.(message);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    },
    [onMessage]
  );

  /**
   * Handle connection open
   */
  const handleOpen = useCallback(() => {
    clearTimers();

    setState((prev) => ({
      ...prev,
      status: 'connected',
      isConnected: true,
      reconnectAttempts: 0,
      error: null,
    }));

    // Re-subscribe to channels
    state.subscriptions.forEach((channel) => {
      wsRef.current?.send(
        JSON.stringify({ type: 'subscribe', channel })
      );
    });

    startHeartbeat();
    onOpen?.();
  }, [clearTimers, state.subscriptions, startHeartbeat, onOpen]);

  /**
   * Handle connection close
   */
  const handleClose = useCallback(
    (event: CloseEvent) => {
      clearTimers();

      setState((prev) => ({
        ...prev,
        status: 'disconnected',
        isConnected: false,
      }));

      onClose?.(event);

      // Attempt reconnect if not intentionally closed
      if (
        autoReconnect &&
        mountedRef.current &&
        state.reconnectAttempts < maxReconnectAttempts &&
        !event.wasClean
      ) {
        setState((prev) => ({
          ...prev,
          status: 'reconnecting',
          reconnectAttempts: prev.reconnectAttempts + 1,
        }));

        const delay = getReconnectDelay(state.reconnectAttempts);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            connect();
          }
        }, delay);
      }
    },
    // Note: 'connect' is intentionally excluded to avoid circular dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      autoReconnect,
      maxReconnectAttempts,
      state.reconnectAttempts,
      clearTimers,
      onClose,
      getReconnectDelay,
    ]
  );

  /**
   * Handle connection error
   */
  const handleError = useCallback(
    (event: Event) => {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'WebSocket connection error',
      }));

      onError?.(event);
    },
    [onError]
  );

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    // Don't connect if already connecting or connected
    if (
      wsRef.current?.readyState === WebSocket.CONNECTING ||
      wsRef.current?.readyState === WebSocket.OPEN
    ) {
      return;
    }

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    setState((prev) => ({
      ...prev,
      status: 'connecting',
      error: null,
    }));

    try {
      wsRef.current = new WebSocket(url);
      wsRef.current.onopen = handleOpen;
      wsRef.current.onclose = handleClose;
      wsRef.current.onerror = handleError;
      wsRef.current.onmessage = handleMessage;

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (
          wsRef.current?.readyState === WebSocket.CONNECTING &&
          mountedRef.current
        ) {
          wsRef.current.close();
          setState((prev) => ({
            ...prev,
            status: 'error',
            error: 'Connection timeout',
          }));
        }
      }, connectionTimeout);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to connect',
      }));
    }
  }, [
    url,
    connectionTimeout,
    handleOpen,
    handleClose,
    handleError,
    handleMessage,
  ]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    clearTimers();

    setState((prev) => ({
      ...prev,
      status: 'disconnecting',
    }));

    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      status: 'disconnected',
      isConnected: false,
    }));
  }, [clearTimers]);

  /**
   * Send a message
   */
  const send = useCallback(<T,>(type: string, payload: T): boolean => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected');
      return false;
    }

    try {
      wsRef.current.send(
        JSON.stringify({
          type,
          payload,
          timestamp: Date.now(),
        })
      );
      return true;
    } catch (err) {
      console.error('Failed to send WebSocket message:', err);
      return false;
    }
  }, []);

  /**
   * Subscribe to a channel
   */
  const subscribe = useCallback(
    (channel: string) => {
      setState((prev) => {
        const newSubscriptions = new Set(prev.subscriptions);
        newSubscriptions.add(channel);
        return { ...prev, subscriptions: newSubscriptions };
      });

      // Send subscription if connected
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: 'subscribe', channel })
        );
      }
    },
    []
  );

  /**
   * Unsubscribe from a channel
   */
  const unsubscribe = useCallback(
    (channel: string) => {
      setState((prev) => {
        const newSubscriptions = new Set(prev.subscriptions);
        newSubscriptions.delete(channel);
        return { ...prev, subscriptions: newSubscriptions };
      });

      // Send unsubscription if connected
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: 'unsubscribe', channel })
        );
      }
    },
    []
  );

  /**
   * Manual reconnect
   */
  const reconnect = useCallback(() => {
    disconnect();
    setState((prev) => ({
      ...prev,
      reconnectAttempts: 0,
    }));
    setTimeout(connect, 100);
  }, [disconnect, connect]);

  // Auto-connect on mount
  useEffect(() => {
    mountedRef.current = true;

    if (autoConnect) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      clearTimers();
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
        wsRef.current = null;
      }
    };
  }, [autoConnect, connect, clearTimers]);

  return [
    state,
    {
      connect,
      disconnect,
      send,
      subscribe,
      unsubscribe,
      reconnect,
    },
  ];
}

export default useRealTimeUpdates;
