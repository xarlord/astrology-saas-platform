/**
 * useKeyboardShortcuts Hook
 *
 * Custom hook for handling keyboard shortcuts
 * Supports key combinations and modifier keys
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: {
    enabled?: boolean;
    preventDefault?: boolean;
    stopPropagation?: boolean;
  } = {}
) {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = false,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcuts) {
        const keyMatch =
          event.key.toLowerCase() === shortcut.key.toLowerCase() ||
          event.code === shortcut.key;

        const ctrlMatch = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
        const shiftMatch = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
        const altMatch = shortcut.altKey === undefined || event.altKey === shortcut.altKey;
        const metaMatch = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          if (preventDefault) {
            event.preventDefault();
          }

          if (stopPropagation) {
            event.stopPropagation();
          }

          shortcut.handler(event);
          break;
        }
      }
    },
    [shortcuts, enabled, preventDefault, stopPropagation]
  );

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, enabled]);

  return shortcuts;
}

/**
 * useKeyboardShortcut Hook
 *
 * Simplified hook for a single keyboard shortcut
 */
export function useKeyboardShortcut(
  key: string,
  handler: (event: KeyboardEvent) => void,
  options: {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    enabled?: boolean;
    preventDefault?: boolean;
  } = {}
) {
  const {
    ctrlKey,
    shiftKey,
    altKey,
    metaKey,
    enabled = true,
    preventDefault = true,
  } = options;

  useKeyboardShortcuts(
    [
      {
        key,
        ctrlKey,
        shiftKey,
        altKey,
        metaKey,
        handler,
      },
    ],
    { enabled, preventDefault }
  );
}

// Common keyboard shortcuts
export const CommonShortcuts = {
  save: { key: 's', ctrlKey: true, description: 'Save' },
  open: { key: 'o', ctrlKey: true, description: 'Open' },
  new: { key: 'n', ctrlKey: true, description: 'New' },
  find: { key: 'f', ctrlKey: true, description: 'Find' },
  undo: { key: 'z', ctrlKey: true, description: 'Undo' },
  redo: { key: 'y', ctrlKey: true, description: 'Redo' },
  refresh: { key: 'r', ctrlKey: true, description: 'Refresh' },
  close: { key: 'w', ctrlKey: true, description: 'Close' },
  help: { key: '?', description: 'Help' },
  escape: { key: 'Escape', description: 'Cancel/Close' },
};

export default useKeyboardShortcuts;
