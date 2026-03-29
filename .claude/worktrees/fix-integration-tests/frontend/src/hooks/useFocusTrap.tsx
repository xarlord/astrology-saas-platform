/**
 * useFocusTrap Hook
 *
 * WCAG 2.1 AA - Focus Trap for Modals and Drawers
 *
 * Traps keyboard focus within a container element, preventing users from tabbing
 * outside of modals, dialogs, and other overlay components.
 *
 * Features:
 * - Focus trap within container
 * - Focus restoration on close
 * - Support for nested traps
 * - Auto-focus first focusable element
 * - Announcements for screen readers
 *
 * @see https://www.w3.org/WAI/WCAG21/Techniques/SCR21
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Focusable element selectors
 */
const FOCUSABLE_SELECTORS = [
  'a[href]:not([disabled])',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
  'details summary',
].join(', ');

/**
 * Options for useFocusTrap hook
 */
export interface UseFocusTrapOptions {
  /** Whether the focus trap is active */
  active: boolean;
  /** Element to return focus to when trap is deactivated */
  returnFocusRef?: React.RefObject<HTMLElement>;
  /** Whether to auto-focus first element on activation */
  autoFocus?: boolean;
  /** Delay before auto-focus (ms) */
  autoFocusDelay?: number;
  /** Selector for initial focus element */
  initialFocusSelector?: string;
  /** Whether to allow escape key to deactivate */
  escapeDeactivates?: boolean;
  /** Callback when escape is pressed */
  onEscape?: () => void;
  /** Callback when focus trap is activated */
  onActivate?: () => void;
  /** Callback when focus trap is deactivated */
  onDeactivate?: () => void;
  /** Whether to prevent scrolling when trap is active */
  preventScroll?: boolean;
  /** Whether to pause other focus traps (for nested modals) */
  pauseOtherTraps?: boolean;
}

/**
 * Focus trap manager for handling nested traps
 */
class FocusTrapManager {
  private static instance: FocusTrapManager;
  private trapStack: {
    id: string;
    container: HTMLElement;
    previousFocus: HTMLElement | null;
  }[] = [];

  static getInstance(): FocusTrapManager {
    if (!FocusTrapManager.instance) {
      FocusTrapManager.instance = new FocusTrapManager();
    }
    return FocusTrapManager.instance;
  }

  push(id: string, container: HTMLElement, previousFocus: HTMLElement | null): void {
    // Pause the previous trap
    if (this.trapStack.length > 0) {
      const current = this.trapStack[this.trapStack.length - 1];
      current.container.setAttribute('data-focus-trap-paused', 'true');
    }

    this.trapStack.push({ id, container, previousFocus });
    container.setAttribute('data-focus-trap-active', 'true');
  }

  pop(id: string): HTMLElement | null {
    const index = this.trapStack.findIndex((trap) => trap.id === id);
    if (index === -1) return null;

    const removed = this.trapStack.splice(index, 1)[0];
    removed.container.removeAttribute('data-focus-trap-active');
    removed.container.removeAttribute('data-focus-trap-paused');

    // Resume the previous trap
    if (this.trapStack.length > 0) {
      const current = this.trapStack[this.trapStack.length - 1];
      current.container.removeAttribute('data-focus-trap-paused');
    }

    return removed.previousFocus;
  }

  isTopTrap(id: string): boolean {
    if (this.trapStack.length === 0) return false;
    return this.trapStack[this.trapStack.length - 1].id === id;
  }

  getTopContainer(): HTMLElement | null {
    if (this.trapStack.length === 0) return null;
    return this.trapStack[this.trapStack.length - 1].container;
  }
}

let trapIdCounter = 0;

/**
 * Custom hook for trapping focus within a container
 */
export function useFocusTrap<T extends HTMLElement>(
  options: UseFocusTrapOptions = { active: true }
): React.RefObject<T> {
  const {
    active,
    returnFocusRef,
    autoFocus = true,
    autoFocusDelay = 0,
    initialFocusSelector,
    escapeDeactivates = true,
    onEscape,
    onActivate,
    onDeactivate,
    preventScroll = false,
    pauseOtherTraps = true,
  } = options;

  const containerRef = useRef<T>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const trapIdRef = useRef<string>(`focus-trap-${++trapIdCounter}`);
  const managerRef = useRef<FocusTrapManager>(FocusTrapManager.getInstance());

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const elements = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    );

    // Filter out elements that are not visible
    return elements.filter((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }, []);

  // Focus first element or element matching selector
  const focusInitialElement = useCallback(() => {
    if (!containerRef.current) return;

    let elementToFocus: HTMLElement | null = null;

    // Try initial focus selector first
    if (initialFocusSelector) {
      elementToFocus = containerRef.current.querySelector(initialFocusSelector);
    }

    // Fall back to first focusable element
    if (!elementToFocus) {
      const focusableElements = getFocusableElements();
      elementToFocus = focusableElements[0] ?? null;
    }

    // Make container focusable if no focusable elements
    if (!elementToFocus) {
      containerRef.current.tabIndex = -1;
      elementToFocus = containerRef.current;
    }

    if (elementToFocus) {
      elementToFocus.focus({ preventScroll });
    }
  }, [initialFocusSelector, getFocusableElements, preventScroll]);

  // Handle Tab and Shift+Tab keys
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!containerRef.current) return;

      // Check if this is the top trap (for nested traps)
      if (pauseOtherTraps && !managerRef.current.isTopTrap(trapIdRef.current)) {
        return;
      }

      // Handle Escape key
      if (event.key === 'Escape') {
        if (escapeDeactivates) {
          event.preventDefault();
          onEscape?.();
        }
        return;
      }

      // Handle Tab key
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // If Shift+Tab and focus is on first element, move to last
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus({ preventScroll });
        return;
      }

      // If Tab and focus is on last element, move to first
      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus({ preventScroll });
      }
    },
    [escapeDeactivates, onEscape, getFocusableElements, preventScroll, pauseOtherTraps]
  );

  // Activate/deactivate focus trap
  useEffect(() => {
    if (!active || !containerRef.current) return;

    // Store the previously focused element
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Register with manager
    if (pauseOtherTraps) {
      managerRef.current.push(
        trapIdRef.current,
        containerRef.current,
        previousActiveElementRef.current
      );
    }

    // Call onActivate callback
    onActivate?.();

    // Auto-focus with optional delay
    if (autoFocus) {
      if (autoFocusDelay > 0) {
        const timeoutId = setTimeout(focusInitialElement, autoFocusDelay);
        return () => clearTimeout(timeoutId);
      } else {
        // Use requestAnimationFrame for immediate focus
        requestAnimationFrame(focusInitialElement);
      }
    }

    // Add event listener
    const container = containerRef.current;
    container.addEventListener('keydown', handleKeyDown);

    // Capture ref values at cleanup setup time
    const manager = managerRef.current;
    const trapId = trapIdRef.current;
    const returnFocusElement = returnFocusRef?.current;

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Unregister from manager
      if (pauseOtherTraps) {
        const previousFocus = manager.pop(trapId);

        // Call onDeactivate callback
        onDeactivate?.();

        // Restore focus to the previous element or specified return element
        const returnElement = returnFocusElement ?? previousFocus ?? previousActiveElementRef.current;
        if (returnElement && document.contains(returnElement)) {
          returnElement.focus({ preventScroll });
        }
      } else {
        onDeactivate?.();

        const returnElement = returnFocusElement ?? previousActiveElementRef.current;
        if (returnElement && document.contains(returnElement)) {
          returnElement.focus({ preventScroll });
        }
      }
    };
  }, [
    active,
    autoFocus,
    autoFocusDelay,
    handleKeyDown,
    focusInitialElement,
    onActivate,
    onDeactivate,
    returnFocusRef,
    preventScroll,
    pauseOtherTraps,
  ]);

  return containerRef;
}

/**
 * Hook to manage focus restoration when a component unmounts
 */
export function useFocusRestoration(
  shouldRestore = true
): React.RefObject<HTMLElement | null> {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!shouldRestore) return;

    // Store the currently focused element on mount
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Restore focus on unmount
    return () => {
      const previousElement = previousActiveElementRef.current;
      if (previousElement && document.contains(previousElement)) {
        // Use requestAnimationFrame to ensure focus is restored after React cleanup
        requestAnimationFrame(() => {
          previousElement.focus();
        });
      }
    };
  }, [shouldRestore]);

  return returnFocusRef;
}

/**
 * Hook to announce messages to screen readers
 */
export function useAnnouncer(): {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  AnnouncerRegion: React.FC;
} {
  const [politeMessages, setPoliteMessages] = useState<string[]>([]);
  const [assertiveMessages, setAssertiveMessages] = useState<string[]>([]);
  const messageIdRef = useRef(0);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const id = ++messageIdRef.current;
    const messageWithId = `${id}:${message}`;

    if (priority === 'assertive') {
      setAssertiveMessages((prev) => [...prev, messageWithId]);
      // Clear after announcement
      setTimeout(() => {
        setAssertiveMessages((prev) => prev.filter((m) => m !== messageWithId));
      }, 1000);
    } else {
      setPoliteMessages((prev) => [...prev, messageWithId]);
      // Clear after announcement
      setTimeout(() => {
        setPoliteMessages((prev) => prev.filter((m) => m !== messageWithId));
      }, 1000);
    }
  }, []);

  const AnnouncerRegion = useCallback(() => {
    return (
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
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
        {politeMessages.map((msg) => (
          <span key={msg.split(':')[0]}>{msg.split(':').slice(1).join(':')}</span>
        ))}
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [politeMessages.join(',')]);

  const AssertiveRegion = useCallback(() => {
    return (
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
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
        {assertiveMessages.map((msg) => (
          <span key={msg.split(':')[0]}>{msg.split(':').slice(1).join(':')}</span>
        ))}
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assertiveMessages.join(',')]);

  return { announce, AnnouncerRegion: () => (
    <>
      <AnnouncerRegion />
      <AssertiveRegion />
    </>
  )};
}

/**
 * Hook to manage roving tabindex pattern
 */
export function useRovingTabIndex(
  items: HTMLElement[],
  options: {
    orientation?: 'horizontal' | 'vertical';
    loop?: boolean;
    onSelectionChange?: (index: number) => void;
  } = {}
): {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  getTabIndex: (index: number) => number;
  handleKeyDown: (event: React.KeyboardEvent) => void;
} {
  const { orientation = 'vertical', loop = true, onSelectionChange } = options;
  const [currentIndex, setCurrentIndex] = useState(0);

  const getTabIndex = useCallback(
    (index: number) => (index === currentIndex ? 0 : -1),
    [currentIndex]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      let newIndex = currentIndex;

      const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
      const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';

      switch (event.key) {
        case nextKey:
          event.preventDefault();
          if (loop) {
            newIndex = (currentIndex + 1) % items.length;
          } else {
            newIndex = Math.min(currentIndex + 1, items.length - 1);
          }
          break;
        case prevKey:
          event.preventDefault();
          if (loop) {
            newIndex = (currentIndex - 1 + items.length) % items.length;
          } else {
            newIndex = Math.max(currentIndex - 1, 0);
          }
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = items.length - 1;
          break;
        default:
          return;
      }

      if (newIndex !== currentIndex && items[newIndex]) {
        setCurrentIndex(newIndex);
        items[newIndex].focus();
        onSelectionChange?.(newIndex);
      }
    },
    [currentIndex, items, loop, orientation, onSelectionChange]
  );

  return { currentIndex, setCurrentIndex, getTabIndex, handleKeyDown };
}

export default useFocusTrap;
