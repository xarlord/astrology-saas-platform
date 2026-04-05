/**
 * useShortcut Hook
 *
 * WCAG 2.1 AA - Custom Keyboard Shortcuts
 *
 * Provides keyboard shortcut handling with modifier key support,
 * conflict prevention, and accessibility announcements.
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
 */

import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * Modifier keys
 */
export interface Modifiers {
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
}

/**
 * Shortcut definition
 */
export interface ShortcutDefinition extends Modifiers {
  key: string;
  handler: (event: KeyboardEvent) => void;
  description?: string;
  group?: string;
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  allowInInput?: boolean;
}

/**
 * Registered shortcut with ID
 */
export interface RegisteredShortcut extends ShortcutDefinition {
  id: string;
  priority: number;
}

/**
 * Options for useShortcut hook
 */
export interface UseShortcutOptions {
  /** Whether shortcuts are enabled globally */
  enabled?: boolean;
  /** Scope for conflict prevention */
  scope?: string;
  /** Prevent conflicts with other shortcuts */
  preventConflicts?: boolean;
  /** Default preventDefault behavior */
  preventDefault?: boolean;
  /** Default stopPropagation behavior */
  stopPropagation?: boolean;
  /** Allow shortcuts in input fields */
  allowInInput?: boolean;
  /** Target element to attach listener */
  target?: HTMLElement | null;
}

/**
 * Shortcut context for conflict management
 */
interface ShortcutContext {
  shortcuts: Map<string, RegisteredShortcut>;
  activeScope: string | null;
}

const globalShortcutContext: ShortcutContext = {
  shortcuts: new Map(),
  activeScope: null,
};

/**
 * Generate unique ID for shortcuts
 */
let shortcutIdCounter = 0;
function generateShortcutId(): string {
  return `shortcut-${++shortcutIdCounter}`;
}

/**
 * Check if element is an input field
 */
function isInputElement(element: EventTarget | null): boolean {
  if (!(element instanceof HTMLElement)) return false;

  const tagName = element.tagName.toLowerCase();
  const isEditable = element.isContentEditable;
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
  const isEditableDiv = tagName === 'div' && isEditable;

  return isInput || isEditableDiv;
}

/**
 * Create shortcut key string for comparison
 */
function createShortcutKey(key: string, modifiers: Modifiers): string {
  const parts: string[] = [];
  if (modifiers.ctrl) parts.push('ctrl');
  if (modifiers.alt) parts.push('alt');
  if (modifiers.shift) parts.push('shift');
  if (modifiers.meta) parts.push('meta');
  parts.push(key.toLowerCase());
  return parts.join('+');
}

/**
 * Custom hook for handling keyboard shortcuts
 */
export function useShortcut(
  shortcut: ShortcutDefinition | ShortcutDefinition[],
  options: UseShortcutOptions = {},
): { unregister: () => void; isRegistered: boolean } {
  const {
    enabled = true,
    scope,
    preventConflicts = true,
    preventDefault = true,
    stopPropagation = false,
    allowInInput = false,
    target,
  } = options;

  const [isRegistered, setIsRegistered] = useState(false);
  const registeredIdsRef = useRef<string[]>([]);

  // Register shortcuts
  const registerShortcuts = useCallback(() => {
    // Normalize shortcuts to array
    const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];

    const newIds: string[] = [];

    shortcuts.forEach((s) => {
      if (s.enabled === false) return;

      const id = generateShortcutId();
      const key = createShortcutKey(s.key, s);

      // Check for conflicts
      if (preventConflicts && globalShortcutContext.shortcuts.has(key)) {
        const existing = globalShortcutContext.shortcuts.get(key);
        console.warn(
          `Shortcut conflict: "${key}" is already registered (${existing?.description ?? 'no description'}). ` +
            `Use scope to manage multiple shortcuts with the same key.`,
        );
        return;
      }

      // Check scope
      if (
        scope &&
        globalShortcutContext.activeScope &&
        globalShortcutContext.activeScope !== scope
      ) {
        return;
      }

      const registered: RegisteredShortcut = {
        ...s,
        id,
        key: s.key,
        priority: (s.ctrl ?? false) || (s.meta ?? false) ? 10 : 1,
      };

      globalShortcutContext.shortcuts.set(key, registered);
      newIds.push(id);
    });

    registeredIdsRef.current = newIds;
    setIsRegistered(newIds.length > 0);
  }, [shortcut, preventConflicts, scope]);

  // Unregister shortcuts
  const unregister = useCallback(() => {
    registeredIdsRef.current.forEach(() => {
      // Find and remove by id
      globalShortcutContext.shortcuts.forEach((shortcut, key) => {
        if (registeredIdsRef.current.includes(shortcut.id)) {
          globalShortcutContext.shortcuts.delete(key);
        }
      });
    });
    registeredIdsRef.current = [];
    setIsRegistered(false);
  }, []);

  // Keyboard event handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if in input field and not allowed
      if (!allowInInput && isInputElement(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      const eventKey = createShortcutKey(key, {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey,
      });

      const shortcut = globalShortcutContext.shortcuts.get(eventKey);

      if (shortcut && shortcut.enabled !== false) {
        // Check scope
        if (
          scope &&
          globalShortcutContext.activeScope &&
          globalShortcutContext.activeScope !== scope
        ) {
          return;
        }

        // Check individual allowInInput
        if (!shortcut.allowInInput && isInputElement(event.target)) {
          return;
        }

        if (shortcut.preventDefault ?? preventDefault) {
          event.preventDefault();
        }

        if (shortcut.stopPropagation ?? stopPropagation) {
          event.stopPropagation();
        }

        shortcut.handler(event);
      }
    },
    [enabled, allowInInput, scope, preventDefault, stopPropagation],
  );

  // Register on mount, unregister on unmount
  useEffect(() => {
    registerShortcuts();

    return () => {
      unregister();
    };
  }, [registerShortcuts, unregister]);

  // Add/remove event listener
  useEffect(() => {
    if (!enabled) return;

    const targetElement = target ?? document;
    targetElement.addEventListener('keydown', handleKeyDown as EventListener);

    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [enabled, target, handleKeyDown]);

  return { unregister, isRegistered };
}

/**
 * Hook for managing multiple shortcuts with a scope
 */
export function useScopedShortcuts(
  shortcuts: ShortcutDefinition[],
  scope: string,
  options: Omit<UseShortcutOptions, 'scope'> = {},
): { activate: () => void; deactivate: () => void; isActive: boolean } {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive) {
      globalShortcutContext.activeScope = scope;
    }

    return () => {
      if (globalShortcutContext.activeScope === scope) {
        globalShortcutContext.activeScope = null;
      }
    };
  }, [isActive, scope]);

  useShortcut(shortcuts, { ...options, scope, enabled: isActive });

  const activate = useCallback(() => setIsActive(true), []);
  const deactivate = useCallback(() => setIsActive(false), []);

  return { activate, deactivate, isActive };
}

/**
 * Hook for getting all registered shortcuts (for help display)
 */
export function useShortcutsList(group?: string): RegisteredShortcut[] {
  const [shortcuts, setShortcuts] = useState<RegisteredShortcut[]>([]);

  useEffect(() => {
    const allShortcuts = Array.from(globalShortcutContext.shortcuts.values());

    const filtered = group ? allShortcuts.filter((s) => s.group === group) : allShortcuts;

    setShortcuts(filtered);
  }, [group]);

  return shortcuts;
}

/**
 * Common application shortcuts
 */
export const AppShortcuts = {
  // Navigation
  goToDashboard: { key: 'd', ctrl: true, description: 'Go to Dashboard', group: 'navigation' },
  goToCharts: { key: 'c', ctrl: true, description: 'Go to Charts', group: 'navigation' },
  goToCalendar: { key: 'k', ctrl: true, description: 'Go to Calendar', group: 'navigation' },
  goToSettings: { key: ',', ctrl: true, description: 'Go to Settings', group: 'navigation' },
  goBack: { key: '[', ctrl: true, description: 'Go Back', group: 'navigation' },
  goForward: { key: ']', ctrl: true, description: 'Go Forward', group: 'navigation' },

  // Actions
  save: { key: 's', ctrl: true, description: 'Save', group: 'actions' },
  newChart: { key: 'n', ctrl: true, description: 'New Chart', group: 'actions' },
  delete: { key: 'Delete', description: 'Delete', group: 'actions' },
  refresh: { key: 'r', ctrl: true, description: 'Refresh', group: 'actions' },
  search: { key: '/', description: 'Search', group: 'actions' },
  help: { key: '?', shift: true, description: 'Show Help', group: 'actions' },

  // Modal/Dialog
  close: { key: 'Escape', description: 'Close/Cancel', group: 'modal' },
  confirm: { key: 'Enter', description: 'Confirm/Submit', group: 'modal' },

  // View
  toggleSidebar: { key: 'b', ctrl: true, description: 'Toggle Sidebar', group: 'view' },
  toggleFullscreen: { key: 'f', ctrl: true, description: 'Toggle Fullscreen', group: 'view' },
  zoomIn: { key: '=', ctrl: true, description: 'Zoom In', group: 'view' },
  zoomOut: { key: '-', ctrl: true, description: 'Zoom Out', group: 'view' },
} as const;

/**
 * Create shortcut helper
 */
export function createShortcut(
  key: string,
  handler: (event: KeyboardEvent) => void,
  options: Partial<ShortcutDefinition> = {},
): ShortcutDefinition {
  return {
    key,
    handler,
    ...options,
  };
}

export default useShortcut;
