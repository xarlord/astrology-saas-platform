/**
 * useKeyboardNavigation Hook
 *
 * WCAG 2.1 AA - Keyboard Navigation Utilities
 *
 * Provides comprehensive keyboard navigation for lists, grids, and interactive elements.
 * Supports arrow keys, Home/End, Page Up/Down, and activation keys.
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Navigation direction types
 */
export type NavigationDirection = 'horizontal' | 'vertical' | 'both' | 'grid';

/**
 * Keyboard navigation options
 */
export interface UseKeyboardNavigationOptions<T = HTMLElement> {
  /** Items to navigate through */
  items: T[];
  /** Currently selected/focused item index */
  selectedIndex?: number;
  /** Callback when selection changes */
  onSelect?: (index: number, item: T) => void;
  /** Callback when item is activated (Enter/Space) */
  onActivate?: (index: number, item: T) => void;
  /** Callback when Escape is pressed */
  onEscape?: () => void;
  /** Navigation direction */
  direction?: NavigationDirection;
  /** Number of columns for grid navigation */
  columns?: number;
  /** Whether navigation is enabled */
  enabled?: boolean;
  /** Whether to loop around at boundaries */
  loop?: boolean;
  /** Whether to skip disabled items */
  skipDisabled?: boolean;
  /** Function to check if an item is disabled */
  isItemDisabled?: (item: T, index: number) => boolean;
  /** Page size for Page Up/Down */
  pageSize?: number;
  /** Whether to focus the item on selection */
  focusOnSelect?: boolean;
}

/**
 * Return type for useKeyboardNavigation
 */
export interface UseKeyboardNavigationReturn {
  /** Currently selected index */
  selectedIndex: number;
  /** Set selected index manually */
  setSelectedIndex: (index: number) => void;
  /** Ref to attach to the container element */
  containerRef: React.RefObject<HTMLElement>;
  /** Props to spread on the container element */
  getContainerProps: (
    props?: React.HTMLAttributes<HTMLElement>,
  ) => React.HTMLAttributes<HTMLElement>;
  /** Props to spread on individual item elements */
  getItemProps: (
    index: number,
    props?: React.HTMLAttributes<HTMLElement>,
  ) => React.HTMLAttributes<HTMLElement>;
  /** Navigate to next item */
  navigateNext: () => void;
  /** Navigate to previous item */
  navigatePrevious: () => void;
  /** Navigate to first item */
  navigateFirst: () => void;
  /** Navigate to last item */
  navigateLast: () => void;
  /** Navigate to page up */
  navigatePageUp: () => void;
  /** Navigate to page down */
  navigatePageDown: () => void;
  /** Activate current item */
  activateCurrent: () => void;
}

/**
 * Custom hook for comprehensive keyboard navigation
 */
export function useKeyboardNavigation<T = HTMLElement>(
  options: UseKeyboardNavigationOptions<T>,
): UseKeyboardNavigationReturn {
  const {
    items,
    selectedIndex: controlledSelectedIndex,
    onSelect,
    onActivate,
    onEscape,
    direction = 'vertical',
    columns = 1,
    enabled = true,
    loop = true,
    skipDisabled = true,
    isItemDisabled,
    pageSize = 10,
    focusOnSelect = true,
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(0);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());

  // Use controlled or internal state
  const selectedIndex = controlledSelectedIndex ?? internalSelectedIndex;
  const setSelectedIndex = useCallback(
    (index: number) => {
      if (controlledSelectedIndex === undefined) {
        setInternalSelectedIndex(index);
      }
      onSelect?.(index, items[index]);
    },
    [controlledSelectedIndex, onSelect, items],
  );

  // Check if item is focusable
  const isFocusable = useCallback(
    (index: number): boolean => {
      if (index < 0 || index >= items.length) return false;
      // If skipDisabled is false or there's no isItemDisabled function, all items are focusable
      if (!skipDisabled || !isItemDisabled) return true;
      return !isItemDisabled(items[index], index);
    },
    [items, skipDisabled, isItemDisabled],
  );

  // Find next focusable index
  const findNextFocusable = useCallback(
    (startIndex: number, direction: 1 | -1): number => {
      // If skipDisabled is false or there's no isItemDisabled function, return startIndex directly
      if (!skipDisabled || !isItemDisabled) return startIndex;

      let index = startIndex;
      const maxIterations = items.length;

      for (let i = 0; i < maxIterations; i++) {
        if (isFocusable(index)) return index;
        index = (index + direction + items.length) % items.length;
      }

      return startIndex;
    },
    [items.length, skipDisabled, isItemDisabled, isFocusable],
  );

  // Navigate to a specific index
  const navigateTo = useCallback(
    (newIndex: number) => {
      const focusableIndex = findNextFocusable(newIndex, newIndex > selectedIndex ? 1 : -1);
      setSelectedIndex(focusableIndex);

      if (focusOnSelect) {
        const itemElement = itemRefs.current.get(focusableIndex);
        itemElement?.focus();
      }
    },
    [findNextFocusable, selectedIndex, setSelectedIndex, focusOnSelect],
  );

  // Navigation functions
  const navigateNext = useCallback(() => {
    let newIndex: number;

    if (direction === 'horizontal' || direction === 'grid') {
      newIndex = selectedIndex + 1;
      if (!loop && newIndex >= items.length) return;
      newIndex = newIndex % items.length;
    } else {
      newIndex = selectedIndex + 1;
      if (!loop && newIndex >= items.length) return;
      newIndex = newIndex % items.length;
    }

    navigateTo(newIndex);
  }, [direction, selectedIndex, items.length, loop, navigateTo]);

  const navigatePrevious = useCallback(() => {
    let newIndex: number;

    if (direction === 'horizontal' || direction === 'grid') {
      newIndex = selectedIndex - 1;
      if (!loop && newIndex < 0) return;
      newIndex = (newIndex + items.length) % items.length;
    } else {
      newIndex = selectedIndex - 1;
      if (!loop && newIndex < 0) return;
      newIndex = (newIndex + items.length) % items.length;
    }

    navigateTo(newIndex);
  }, [direction, selectedIndex, items.length, loop, navigateTo]);

  const navigateFirst = useCallback(() => {
    navigateTo(0);
  }, [navigateTo]);

  const navigateLast = useCallback(() => {
    navigateTo(items.length - 1);
  }, [navigateTo, items.length]);

  const navigatePageUp = useCallback(() => {
    const newIndex = Math.max(0, selectedIndex - pageSize);
    navigateTo(newIndex);
  }, [selectedIndex, pageSize, navigateTo]);

  const navigatePageDown = useCallback(() => {
    const newIndex = Math.min(items.length - 1, selectedIndex + pageSize);
    navigateTo(newIndex);
  }, [selectedIndex, pageSize, items.length, navigateTo]);

  const activateCurrent = useCallback(() => {
    if (isFocusable(selectedIndex)) {
      onActivate?.(selectedIndex, items[selectedIndex]);
    }
  }, [isFocusable, selectedIndex, onActivate, items]);

  // Grid navigation helper
  const navigateGrid = useCallback(
    (key: string) => {
      const row = Math.floor(selectedIndex / columns);
      const col = selectedIndex % columns;
      let newIndex = selectedIndex;

      switch (key) {
        case 'ArrowRight':
          if (col < columns - 1 && selectedIndex + 1 < items.length) {
            newIndex = selectedIndex + 1;
          } else if (loop) {
            newIndex = row * columns;
          }
          break;
        case 'ArrowLeft':
          if (col > 0) {
            newIndex = selectedIndex - 1;
          } else if (loop) {
            newIndex = Math.min(row * columns + columns - 1, items.length - 1);
          }
          break;
        case 'ArrowDown':
          if (selectedIndex + columns < items.length) {
            newIndex = selectedIndex + columns;
          } else if (loop) {
            newIndex = col;
          }
          break;
        case 'ArrowUp':
          if (selectedIndex - columns >= 0) {
            newIndex = selectedIndex - columns;
          } else if (loop) {
            newIndex = Math.min(
              items.length - 1 - ((items.length - 1) % columns) + col,
              items.length - 1,
            );
          }
          break;
      }

      if (newIndex !== selectedIndex) {
        navigateTo(newIndex);
      }
    },
    [columns, selectedIndex, items.length, loop, navigateTo],
  );

  // Keyboard event handler
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent | KeyboardEvent) => {
      if (!enabled) return;

      const { key } = event;

      // Handle grid navigation separately
      if (
        direction === 'grid' &&
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)
      ) {
        event.preventDefault();
        navigateGrid(key);
        return;
      }

      switch (key) {
        case 'ArrowDown':
          if (direction === 'vertical' || direction === 'both') {
            event.preventDefault();
            navigateNext();
          }
          break;
        case 'ArrowUp':
          if (direction === 'vertical' || direction === 'both') {
            event.preventDefault();
            navigatePrevious();
          }
          break;
        case 'ArrowRight':
          if (direction === 'horizontal' || direction === 'both') {
            event.preventDefault();
            navigateNext();
          }
          break;
        case 'ArrowLeft':
          if (direction === 'horizontal' || direction === 'both') {
            event.preventDefault();
            navigatePrevious();
          }
          break;
        case 'Home':
          event.preventDefault();
          navigateFirst();
          break;
        case 'End':
          event.preventDefault();
          navigateLast();
          break;
        case 'PageUp':
          event.preventDefault();
          navigatePageUp();
          break;
        case 'PageDown':
          event.preventDefault();
          navigatePageDown();
          break;
        case 'Enter':
        case ' ':
          if (!isItemDisabled?.(items[selectedIndex], selectedIndex)) {
            event.preventDefault();
            activateCurrent();
          }
          break;
        case 'Escape':
          event.preventDefault();
          onEscape?.();
          break;
      }
    },
    [
      enabled,
      direction,
      navigateNext,
      navigatePrevious,
      navigateFirst,
      navigateLast,
      navigatePageUp,
      navigatePageDown,
      activateCurrent,
      onEscape,
      isItemDisabled,
      items,
      selectedIndex,
      navigateGrid,
    ],
  );

  // Container props
  const getContainerProps = useCallback(
    (props?: React.HTMLAttributes<HTMLElement> & { ref?: React.RefCallback<HTMLElement> }): React.HTMLAttributes<HTMLElement> & { ref?: React.RefCallback<HTMLElement> } => ({
      ...props,
      ref: containerRef as unknown as React.RefCallback<HTMLElement>,
      onKeyDown: (e) => {
        handleKeyDown(e);
        props?.onKeyDown?.(e);
      },
      role: 'listbox',
      'aria-orientation': direction === 'horizontal' ? 'horizontal' : 'vertical',
      tabIndex: 0,
    }),
    [handleKeyDown, direction],
  );

  // Item props
  const getItemProps = useCallback(
    (
      index: number,
      props?: React.HTMLAttributes<HTMLElement>,
    ): React.HTMLAttributes<HTMLElement> & { ref?: React.RefCallback<HTMLElement> } => {
      const disabled = isItemDisabled?.(items[index], index);

      return {
        ...props,
        ref: (el: HTMLElement | null) => {
          if (el) {
            itemRefs.current.set(index, el);
          } else {
            itemRefs.current.delete(index);
          }
        },
        role: 'option',
        tabIndex: index === selectedIndex ? 0 : -1,
        'aria-selected': index === selectedIndex,
        'aria-disabled': disabled,
        onClick: (e) => {
          if (!disabled) {
            navigateTo(index);
            onActivate?.(index, items[index]);
          }
          props?.onClick?.(e);
        },
        onFocus: (e) => {
          if (!disabled) {
            setSelectedIndex(index);
          }
          props?.onFocus?.(e);
        },
      };
    },
    [isItemDisabled, items, selectedIndex, navigateTo, onActivate, setSelectedIndex],
  );

  // Update item refs when items change
  useEffect(() => {
    // Clean up refs for removed items
    const validIndices = new Set(items.map((_, i) => i));
    itemRefs.current.forEach((_, index) => {
      if (!validIndices.has(index)) {
        itemRefs.current.delete(index);
      }
    });
  }, [items]);

  return {
    selectedIndex,
    setSelectedIndex: navigateTo,
    containerRef,
    getContainerProps,
    getItemProps,
    navigateNext,
    navigatePrevious,
    navigateFirst,
    navigateLast,
    navigatePageUp,
    navigatePageDown,
    activateCurrent,
  };
}

/**
 * Type-ahead navigation hook for lists
 */
export interface UseTypeAheadOptions<T> {
  items: T[];
  getKey?: (item: T) => string;
  onMatch?: (index: number, item: T) => void;
  delay?: number;
}

export function useTypeAhead<T>(options: UseTypeAheadOptions<T>) {
  const { items, getKey = (item) => String(item), onMatch, delay = 500 } = options;

  const searchStringRef = useRef('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleKeyPress = useCallback(
    (key: string) => {
      // Update ref immediately (synchronous, no stale closure)
      searchStringRef.current = searchStringRef.current + key.toLowerCase();

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout to clear search string
      timeoutRef.current = setTimeout(() => {
        searchStringRef.current = '';
      }, delay);

      // Find matching item using ref value (always current)
      const matchIndex = items.findIndex((item) =>
        getKey(item).toLowerCase().startsWith(searchStringRef.current),
      );

      if (matchIndex !== -1) {
        onMatch?.(matchIndex, items[matchIndex]);
      }
    },
    [items, getKey, onMatch, delay],
  );

  // Return the ref value for display purposes
  const searchString = searchStringRef.current;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { searchString, handleKeyPress };
}

export default useKeyboardNavigation;
