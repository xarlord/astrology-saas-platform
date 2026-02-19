/**
 * useFocusTrap Hook
 *
 * WCAG 2.1 AA - Focus Trap for Modals and Drawers
 *
 * Traps keyboard focus within a container element, preventing users from tabbing
 * outside of modals, dialogs, and other overlay components.
 *
 * @see https://www.w3.org/WAI/WCAG21/Techniques/SCR21
 */
import { useEffect, useRef } from 'react';

interface UseFocusTrapOptions {
  /** Whether the focus trap is active */
  active: boolean;
  /** Element to return focus to when trap is deactivated */
  returnFocusRef?: React.RefObject<HTMLElement>;
}

export function useFocusTrap<T extends HTMLElement>({
  active,
  returnFocusRef,
}: UseFocusTrapOptions = { active: true }) {
  const containerRef = useRef<T>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) {
      return;
    }

    // Store the previously focused element
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;

    // Get all focusable elements within the container
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
    };

    // Find first and last focusable elements
    const focusableElements = getFocusableElements();

    if (focusableElements.length === 0) {
      // No focusable elements, make container focusable
      container.tabIndex = -1;
      container.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element
    firstElement.focus();

    // Handle Tab and Shift+Tab keys
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      // If Shift+Tab and focus is on first element, move to last
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      // If Tab and focus is on last element, move to first
      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    // Add event listener
    container.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Return focus to the previous element or specified return element
      const returnElement = returnFocusRef?.current || previousActiveElementRef.current;
      if (returnElement) {
        returnElement.focus();
      }
    };
  }, [active, returnFocusRef]);

  return containerRef;
}

/**
 * Hook to manage focus restoration when a component unmounts
 */
export function useFocusRestoration() {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Store the currently focused element on mount
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Restore focus on unmount
    return () => {
      const previousElement = previousActiveElementRef.current;
      if (previousElement && document.contains(previousElement)) {
        previousElement.focus();
      }
    };
  }, []);
}
