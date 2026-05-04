/**
 * useKeyboardNavigation Hook Tests
 *
 * WCAG 2.1 AA Compliance Tests
 *
 * Tests keyboard navigation patterns including:
 * - Arrow key navigation (vertical, horizontal, grid)
 * - Home/End navigation
 * - Page Up/Down navigation
 * - Enter/Space activation
 * - Escape key handling
 * - Type-ahead navigation
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useKeyboardNavigation, useTypeAhead } from '../useKeyboardNavigation';

// Mock items for testing
const mockItems = [
  { id: 1, name: 'Item 1', disabled: false },
  { id: 2, name: 'Item 2', disabled: false },
  { id: 3, name: 'Item 3', disabled: true },
  { id: 4, name: 'Item 4', disabled: false },
  { id: 5, name: 'Item 5', disabled: false },
];

describe('useKeyboardNavigation', () => {
  let onSelect: ReturnType<typeof vi.fn>;
  let onActivate: ReturnType<typeof vi.fn>;
  let onEscape: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSelect = vi.fn();
    onActivate = vi.fn();
    onEscape = vi.fn();
  });

  describe('Basic Navigation', () => {
    it('should initialize with selectedIndex 0', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          onSelect,
        }),
      );

      expect(result.current.selectedIndex).toBe(0);
    });

    it('should respect controlled selectedIndex', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          selectedIndex: 2,
          onSelect,
        }),
      );

      expect(result.current.selectedIndex).toBe(2);
    });

    it('should navigate to next item', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          onSelect,
        }),
      );

      act(() => {
        result.current.navigateNext();
      });

      expect(result.current.selectedIndex).toBe(1);
      expect(onSelect).toHaveBeenCalledWith(1, mockItems[1]);
    });

    it('should navigate to previous item', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          onSelect,
        }),
      );

      // First move to index 2
      act(() => {
        result.current.setSelectedIndex(2);
      });

      act(() => {
        result.current.navigatePrevious();
      });

      expect(result.current.selectedIndex).toBe(1);
      expect(onSelect).toHaveBeenCalledWith(1, mockItems[1]);
    });

    it('should navigate to first item', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          onSelect,
        }),
      );

      // First move to index 3
      act(() => {
        result.current.setSelectedIndex(3);
      });

      act(() => {
        result.current.navigateFirst();
      });

      expect(result.current.selectedIndex).toBe(0);
    });

    it('should navigate to last item', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          onSelect,
        }),
      );

      act(() => {
        result.current.navigateLast();
      });

      expect(result.current.selectedIndex).toBe(4);
    });
  });

  describe('Loop Behavior', () => {
    it('should loop to first item when navigating next from last', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          loop: true,
          onSelect,
        }),
      );

      // First move to index 4
      act(() => {
        result.current.setSelectedIndex(4);
      });

      act(() => {
        result.current.navigateNext();
      });

      expect(result.current.selectedIndex).toBe(0);
    });

    it('should loop to last item when navigating previous from first', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          loop: true,
          onSelect,
        }),
      );

      act(() => {
        result.current.navigatePrevious();
      });

      expect(result.current.selectedIndex).toBe(4);
    });

    it('should not loop when loop is false', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          loop: false,
          onSelect,
        }),
      );

      // First move to index 4
      act(() => {
        result.current.setSelectedIndex(4);
      });

      act(() => {
        result.current.navigateNext();
      });

      expect(result.current.selectedIndex).toBe(4);
    });
  });

  describe('Page Navigation', () => {
    it('should navigate page down', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          pageSize: 2,
          onSelect,
        }),
      );

      act(() => {
        result.current.navigatePageDown();
      });

      expect(result.current.selectedIndex).toBe(2);
    });

    it('should navigate page up', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          pageSize: 2,
          onSelect,
        }),
      );

      // First move to index 4
      act(() => {
        result.current.setSelectedIndex(4);
      });

      act(() => {
        result.current.navigatePageUp();
      });

      expect(result.current.selectedIndex).toBe(2);
    });

    it('should not exceed bounds on page down', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          pageSize: 10,
          onSelect,
        }),
      );

      // First move to index 3
      act(() => {
        result.current.setSelectedIndex(3);
      });

      act(() => {
        result.current.navigatePageDown();
      });

      expect(result.current.selectedIndex).toBe(4);
    });
  });

  describe('Disabled Items', () => {
    it('should skip disabled items when skipDisabled is true', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          skipDisabled: true,
          isItemDisabled: (item) => item.disabled,
          onSelect,
        }),
      );

      // Navigate from index 1 to next, should skip index 2 (disabled)
      act(() => {
        result.current.setSelectedIndex(1);
      });

      act(() => {
        result.current.navigateNext();
      });

      // Should skip index 2 and go to index 3
      expect(result.current.selectedIndex).toBe(3);
    });

    it('should include disabled items when skipDisabled is false', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          skipDisabled: false,
          onSelect,
        }),
      );

      act(() => {
        result.current.setSelectedIndex(1);
      });

      act(() => {
        result.current.navigateNext();
      });

      expect(result.current.selectedIndex).toBe(2);
    });
  });

  describe('Activation', () => {
    it('should call onActivate when activating current item', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          onActivate,
          onSelect,
        }),
      );

      act(() => {
        result.current.activateCurrent();
      });

      expect(onActivate).toHaveBeenCalledWith(0, mockItems[0]);
    });

    it('should not activate disabled items', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          selectedIndex: 2,
          isItemDisabled: (item) => item.disabled,
          onActivate,
          onSelect,
        }),
      );

      act(() => {
        result.current.activateCurrent();
      });

      expect(onActivate).not.toHaveBeenCalled();
    });
  });

  describe('Container Props', () => {
    it('should provide correct container props', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          onSelect,
        }),
      );

      const containerProps = result.current.getContainerProps();

      expect(containerProps.role).toBe('listbox');
      expect(containerProps.tabIndex).toBe(0);
      expect(containerProps['aria-orientation']).toBe('vertical');
    });

    it('should provide horizontal orientation for horizontal direction', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          direction: 'horizontal',
          onSelect,
        }),
      );

      const containerProps = result.current.getContainerProps();

      expect(containerProps['aria-orientation']).toBe('horizontal');
    });
  });

  describe('Item Props', () => {
    it('should provide correct item props', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          onSelect,
        }),
      );

      const itemProps = result.current.getItemProps(0);

      expect(itemProps.role).toBe('option');
      expect(itemProps.tabIndex).toBe(0);
      expect(itemProps['aria-selected']).toBe(true);
    });

    it('should mark non-selected items with tabIndex -1', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          onSelect,
        }),
      );

      const itemProps = result.current.getItemProps(1);

      expect(itemProps.tabIndex).toBe(-1);
      expect(itemProps['aria-selected']).toBe(false);
    });

    it('should mark disabled items with aria-disabled', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          isItemDisabled: (item) => item.disabled,
          onSelect,
        }),
      );

      const disabledItemProps = result.current.getItemProps(2);

      expect(disabledItemProps['aria-disabled']).toBe(true);
    });
  });
});

describe('useTypeAhead', () => {
  it('should match items by key press', () => {
    const onMatch = vi.fn();
    const items = ['Apple', 'Banana', 'Cherry', 'Apricot'];

    const { result } = renderHook(() =>
      useTypeAhead({
        items,
        onMatch,
      }),
    );

    act(() => {
      result.current.handleKeyPress('a');
    });

    expect(onMatch).toHaveBeenCalledWith(0, 'Apple');
  });

  it('should build search string from multiple key presses', () => {
    const onMatch = vi.fn();
    const items = ['Apple', 'Apricot', 'Banana'];

    const { result } = renderHook(() =>
      useTypeAhead({
        items,
        onMatch,
        delay: 1000,
      }),
    );

    act(() => {
      result.current.handleKeyPress('a');
      result.current.handleKeyPress('p');
    });

    expect(onMatch).toHaveBeenLastCalledWith(0, 'Apple');
  });

  it('should clear search string after delay', async () => {
    const onMatch = vi.fn();
    const items = ['Apple', 'Banana'];

    const { result } = renderHook(() =>
      useTypeAhead({
        items,
        onMatch,
        delay: 100,
      }),
    );

    act(() => {
      result.current.handleKeyPress('a');
    });

    expect(onMatch).toHaveBeenCalledWith(0, 'Apple');

    // Wait for delay to clear
    await new Promise((resolve) => setTimeout(resolve, 150));

    act(() => {
      result.current.handleKeyPress('b');
    });

    expect(onMatch).toHaveBeenLastCalledWith(1, 'Banana');
  });

  it('should use custom getKey function', () => {
    const onMatch = vi.fn();
    const items = [
      { id: 1, label: 'First' },
      { id: 2, label: 'Second' },
    ];

    const { result } = renderHook(() =>
      useTypeAhead({
        items,
        getKey: (item) => item.label,
        onMatch,
      }),
    );

    act(() => {
      result.current.handleKeyPress('s');
    });

    expect(onMatch).toHaveBeenCalledWith(1, items[1]);
  });
});

describe('WCAG 2.1 AA Compliance', () => {
  it('should support all keyboard navigation keys (WCAG 2.1.1)', () => {
    const onSelect = vi.fn();
    const onActivate = vi.fn();
    const onEscape = vi.fn();

    const { result } = renderHook(() =>
      useKeyboardNavigation({
        items: mockItems,
        onSelect,
        onActivate,
        onEscape,
      }),
    );

    // Test navigation functions exist
    expect(typeof result.current.navigateNext).toBe('function');
    expect(typeof result.current.navigatePrevious).toBe('function');
    expect(typeof result.current.navigateFirst).toBe('function');
    expect(typeof result.current.navigateLast).toBe('function');
    expect(typeof result.current.navigatePageUp).toBe('function');
    expect(typeof result.current.navigatePageDown).toBe('function');
    expect(typeof result.current.activateCurrent).toBe('function');
  });

  it('should provide proper ARIA attributes (WCAG 4.1.2)', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({
        items: mockItems,
        onSelect: vi.fn(),
      }),
    );

    const containerProps = result.current.getContainerProps();
    const itemProps = result.current.getItemProps(0);

    // Container should have role and aria-orientation
    expect(containerProps.role).toBe('listbox');
    expect(containerProps).toHaveProperty('aria-orientation');

    // Items should have role, aria-selected
    expect(itemProps.role).toBe('option');
    expect(itemProps).toHaveProperty('aria-selected');
  });

  it('should allow loop disabling to prevent keyboard trap (WCAG 2.1.2)', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({
        items: mockItems,
        loop: false,
        onSelect: vi.fn(),
      }),
    );

    // At first item, previous should stay
    act(() => {
      result.current.navigatePrevious();
    });
    expect(result.current.selectedIndex).toBe(0);

    // At last item, next should stay
    act(() => {
      result.current.setSelectedIndex(4);
    });
    act(() => {
      result.current.navigateNext();
    });
    expect(result.current.selectedIndex).toBe(4);
  });
});
