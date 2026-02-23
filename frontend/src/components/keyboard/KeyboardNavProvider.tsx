/**
 * KeyboardNavProvider Component
 *
 * WCAG 2.1 AA - Global Keyboard Navigation Context
 *
 * Provides global keyboard event handling, focus management, and
 * screen reader announcement support for the AstroVerse application.
 *
 * Features:
 * - Global keyboard event coordination
 * - Focus management context
 * - Screen reader announcements
 * - Keyboard shortcut help display
 * - Focus visible detection
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
  useReducer,
} from 'react';
import { clsx } from 'clsx';

// Types
export interface FocusState {
  currentFocus: HTMLElement | null;
  focusHistory: HTMLElement[];
  trappedContainer: HTMLElement | null;
}

export interface KeyboardNavState {
  isKeyboardUser: boolean;
  isNavigating: boolean;
  lastKeyTime: number;
  activeModal: string | null;
  focusState: FocusState;
}

type KeyboardNavAction =
  | { type: 'SET_KEYBOARD_USER'; payload: boolean }
  | { type: 'SET_NAVIGATING'; payload: boolean }
  | { type: 'SET_LAST_KEY_TIME'; payload: number }
  | { type: 'SET_ACTIVE_MODAL'; payload: string | null }
  | { type: 'SET_FOCUS'; payload: HTMLElement | null }
  | { type: 'PUSH_FOCUS_HISTORY'; payload: HTMLElement }
  | { type: 'POP_FOCUS_HISTORY' }
  | { type: 'SET_TRAPPED_CONTAINER'; payload: HTMLElement | null };

interface KeyboardNavContextValue {
  state: KeyboardNavState;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  registerModal: (id: string) => void;
  unregisterModal: (id: string) => void;
  pushFocus: (element: HTMLElement) => void;
  popFocus: () => HTMLElement | null;
  setTrappedContainer: (container: HTMLElement | null) => void;
  getPreviousFocus: () => HTMLElement | null;
  isKeyboardNavigation: () => boolean;
}

// Context
const KeyboardNavContext = createContext<KeyboardNavContextValue | null>(null);

// Initial state
const initialState: KeyboardNavState = {
  isKeyboardUser: false,
  isNavigating: false,
  lastKeyTime: 0,
  activeModal: null,
  focusState: {
    currentFocus: null,
    focusHistory: [],
    trappedContainer: null,
  },
};

// Reducer
function keyboardNavReducer(state: KeyboardNavState, action: KeyboardNavAction): KeyboardNavState {
  switch (action.type) {
    case 'SET_KEYBOARD_USER':
      return { ...state, isKeyboardUser: action.payload };
    case 'SET_NAVIGATING':
      return { ...state, isNavigating: action.payload };
    case 'SET_LAST_KEY_TIME':
      return { ...state, lastKeyTime: action.payload };
    case 'SET_ACTIVE_MODAL':
      return { ...state, activeModal: action.payload };
    case 'SET_FOCUS':
      return {
        ...state,
        focusState: { ...state.focusState, currentFocus: action.payload },
      };
    case 'PUSH_FOCUS_HISTORY':
      return {
        ...state,
        focusState: {
          ...state.focusState,
          focusHistory: [...state.focusState.focusHistory, action.payload],
        },
      };
    case 'POP_FOCUS_HISTORY': {
      const newHistory = [...state.focusState.focusHistory];
      newHistory.pop();
      return {
        ...state,
        focusState: { ...state.focusState, focusHistory: newHistory },
      };
    }
    case 'SET_TRAPPED_CONTAINER':
      return {
        ...state,
        focusState: { ...state.focusState, trappedContainer: action.payload },
      };
    default:
      return state;
  }
}

// Provider props
export interface KeyboardNavProviderProps {
  children: React.ReactNode;
  /** Whether to show keyboard shortcut help on ? key */
  showHelpOnQuestion?: boolean;
  /** Custom class for announcement region */
  announcementClassName?: string;
  /** Whether to add focus-visible polyfill behavior */
  enableFocusVisible?: boolean;
}

/**
 * KeyboardNavProvider Component
 */
export const KeyboardNavProvider: React.FC<KeyboardNavProviderProps> = ({
  children,
  showHelpOnQuestion: _showHelpOnQuestion = true,
  announcementClassName,
  enableFocusVisible = true,
}) => {
  // showHelpOnQuestion is reserved for future keyboard help functionality
  void _showHelpOnQuestion;

  const [state, dispatch] = useReducer(keyboardNavReducer, initialState);
  const [announcements, setAnnouncements] = useState<{ id: number; message: string; priority: 'polite' | 'assertive' }[]>([]);
  const announcementIdRef = useRef(0);
  const keyboardTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Announce message to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const id = ++announcementIdRef.current;
    setAnnouncements((prev) => [...prev, { id, message, priority }]);

    // Clear announcement after it's been read
    setTimeout(() => {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }, 5000);
  }, []);

  // Modal management
  const registerModal = useCallback((id: string) => {
    dispatch({ type: 'SET_ACTIVE_MODAL', payload: id });
  }, []);

  const unregisterModal = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_MODAL', payload: null });
  }, []);

  // Focus management
  const pushFocus = useCallback((element: HTMLElement) => {
    if (state.focusState.currentFocus) {
      dispatch({ type: 'PUSH_FOCUS_HISTORY', payload: state.focusState.currentFocus });
    }
    dispatch({ type: 'SET_FOCUS', payload: element });
  }, [state.focusState.currentFocus]);

  const popFocus = useCallback((): HTMLElement | null => {
    const history = state.focusState.focusHistory;
    const previousFocus = history[history.length - 1] || null;
    dispatch({ type: 'POP_FOCUS_HISTORY' });
    dispatch({ type: 'SET_FOCUS', payload: previousFocus });
    return previousFocus;
  }, [state.focusState.focusHistory]);

  const setTrappedContainer = useCallback((container: HTMLElement | null) => {
    dispatch({ type: 'SET_TRAPPED_CONTAINER', payload: container });
  }, []);

  const getPreviousFocus = useCallback(() => {
    const history = state.focusState.focusHistory;
    return history[history.length - 1] || null;
  }, [state.focusState.focusHistory]);

  const isKeyboardNavigation = useCallback(() => {
    return state.isKeyboardUser;
  }, [state.isKeyboardUser]);

  // Detect keyboard vs mouse navigation
  useEffect(() => {
    if (!enableFocusVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        dispatch({ type: 'SET_KEYBOARD_USER', payload: true });
        dispatch({ type: 'SET_NAVIGATING', payload: true });
        dispatch({ type: 'SET_LAST_KEY_TIME', payload: Date.now() });

        // Clear navigating state after a delay
        if (keyboardTimeoutRef.current) {
          clearTimeout(keyboardTimeoutRef.current);
        }
        keyboardTimeoutRef.current = setTimeout(() => {
          dispatch({ type: 'SET_NAVIGATING', payload: false });
        }, 100);
      }
    };

    const handleMouseDown = () => {
      dispatch({ type: 'SET_KEYBOARD_USER', payload: false });
      dispatch({ type: 'SET_NAVIGATING', payload: false });
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      if (keyboardTimeoutRef.current) {
        clearTimeout(keyboardTimeoutRef.current);
      }
    };
  }, [enableFocusVisible]);

  // Add keyboard-visible class to body
  useEffect(() => {
    if (state.isKeyboardUser) {
      document.body.classList.add('keyboard-navigation');
      document.body.classList.remove('mouse-navigation');
    } else {
      document.body.classList.add('mouse-navigation');
      document.body.classList.remove('keyboard-navigation');
    }
  }, [state.isKeyboardUser]);

  // Track focus changes
  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      dispatch({ type: 'SET_FOCUS', payload: target });
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  // Context value
  const contextValue: KeyboardNavContextValue = {
    state,
    announce,
    registerModal,
    unregisterModal,
    pushFocus,
    popFocus,
    setTrappedContainer,
    getPreviousFocus,
    isKeyboardNavigation,
  };

  return (
    <KeyboardNavContext.Provider value={contextValue}>
      {children}

      {/* Screen reader announcements */}
      <div
        className={clsx('sr-only', announcementClassName)}
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {announcements
          .filter((a) => a.priority === 'polite')
          .map((a) => (
            <span key={a.id}>{a.message}</span>
          ))}
      </div>

      <div
        className={clsx('sr-only', announcementClassName)}
        aria-live="assertive"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {announcements
          .filter((a) => a.priority === 'assertive')
          .map((a) => (
            <span key={a.id}>{a.message}</span>
          ))}
      </div>
    </KeyboardNavContext.Provider>
  );
};

/**
 * Hook to access keyboard navigation context
 */
export function useKeyboardNav(): KeyboardNavContextValue {
  const context = useContext(KeyboardNavContext);
  if (!context) {
    throw new Error('useKeyboardNav must be used within a KeyboardNavProvider');
  }
  return context;
}

/**
 * Hook for screen reader announcements
 */
export function useAnnounce(): (message: string, priority?: 'polite' | 'assertive') => void {
  const { announce } = useKeyboardNav();
  return announce;
}

/**
 * Hook to track if user is navigating with keyboard
 */
export function useIsKeyboardUser(): boolean {
  const { state } = useKeyboardNav();
  return state.isKeyboardUser;
}

/**
 * Component: Skip to main content link
 */
export interface SkipLinkProps {
  targetId?: string;
  className?: string;
  children?: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  className,
  children = 'Skip to main content',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.tabIndex = -1;
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={clsx(
        'skip-link',
        'sr-only focus:not-sr-only',
        'fixed top-4 left-4 z-[100]',
        'px-4 py-2 rounded-lg',
        'bg-primary text-white',
        'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
        'transition-all duration-200',
        'transform -translate-y-full focus:translate-y-0',
        className
      )}
    >
      {children}
    </a>
  );
};

/**
 * Component: Focus lock wrapper for modals
 */
export interface FocusLockProps {
  children: React.ReactNode;
  enabled?: boolean;
  className?: string;
  onEscape?: () => void;
}

export const FocusLock: React.FC<FocusLockProps> = ({
  children,
  enabled = true,
  className,
  onEscape,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setTrappedContainer, getPreviousFocus } = useKeyboardNav();

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    setTrappedContainer(containerRef.current);

    // Focus first focusable element
    const focusable = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    return () => {
      setTrappedContainer(null);
      // Restore focus
      const previousFocus = getPreviousFocus();
      if (previousFocus) {
        previousFocus.focus();
      }
    };
  }, [enabled, setTrappedContainer, getPreviousFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onEscape?.();
      return;
    }

    if (e.key !== 'Tab' || !containerRef.current) return;

    const focusable = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div ref={containerRef} className={className} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
};

/**
 * Component: Visually hidden element (for screen readers)
 */
export interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  as: Component = 'span',
  className,
}) => {
  return (
    <Component
      className={clsx(
        'sr-only',
        {
          'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0':
            true,
          '[clip:rect(0,0,0,0)]': true,
        },
        className
      )}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </Component>
  );
};

/**
 * Higher-order component to add keyboard navigation announcements
 */
export function withKeyboardAnnouncements<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  announcements: {
    onFocus?: string;
    onSelect?: string;
    onAction?: string;
  }
): React.FC<P> {
  const WithKeyboardAnnouncements: React.FC<P> = (props) => {
    const { announce } = useKeyboardNav();

    const handleFocus = () => {
      if (announcements.onFocus) {
        announce(announcements.onFocus);
      }
    };

    return (
      <div onFocus={handleFocus}>
        <WrappedComponent {...props} />
      </div>
    );
  };

  WithKeyboardAnnouncements.displayName = `withKeyboardAnnouncements(${WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'})`;

  return WithKeyboardAnnouncements;
}

export default KeyboardNavProvider;
