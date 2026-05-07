import { useEffect, useRef, useCallback } from 'react';

/**
 * Focus trap hook for modal/drawer components.
 * Traps Tab/Shift+Tab within the container and handles Escape key.
 *
 * WCAG 2.1 AA: Focus management for overlay content.
 */
export function useFocusTrap(
  isActive: boolean,
  onClose?: () => void,
) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive || !containerRef.current) return;

      // Escape closes
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      // Tab trap
      if (e.key === 'Tab') {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [isActive, onClose]
  );

  // Auto-focus first focusable element when activated
  useEffect(() => {
    if (isActive && containerRef.current) {
      const previouslyFocused = document.activeElement as HTMLElement;

      // Find first focusable element (prefer close button)
      const closeBtn = containerRef.current.querySelector('[aria-label*="Close"]') as HTMLElement;
      const firstFocusable = closeBtn || containerRef.current.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );

      // Delay to allow animation
      const timer = setTimeout(() => {
        firstFocusable?.focus();
      }, 100);

      return () => {
        clearTimeout(timer);
        // Restore focus when deactivated
        previouslyFocused?.focus?.();
      };
    }
  }, [isActive]);

  // Add/remove event listener
  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isActive, handleKeyDown]);

  return containerRef;
}
