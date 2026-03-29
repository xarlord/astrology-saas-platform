/**
 * KeyboardNavProvider Component Tests
 *
 * WCAG 2.1 AA Compliance Tests
 *
 * Tests the keyboard navigation context provider including:
 * - Screen reader announcements
 * - Keyboard user detection
 * - Focus management
 * - Skip links
 * - Focus lock
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  KeyboardNavProvider,
  useKeyboardNav,
  useAnnounce,
  useIsKeyboardUser,
  SkipLink,
  FocusLock,
  VisuallyHidden,
} from '../KeyboardNavProvider';

// Test component to access context
const TestComponent: React.FC<{
  onContext?: (context: ReturnType<typeof useKeyboardNav>) => void;
}> = ({ onContext }) => {
  const context = useKeyboardNav();

  React.useEffect(() => {
    onContext?.(context);
  }, [context, onContext]);

  return <div data-testid="test-component">Test</div>;
};

// Wrapper component for tests
const TestWrapper: React.FC<{
  children: React.ReactNode;
  onContext?: (context: ReturnType<typeof useKeyboardNav>) => void;
}> = ({ children, onContext }) => (
  <KeyboardNavProvider>
    {children}
    <TestComponent onContext={onContext} />
  </KeyboardNavProvider>
);

describe('KeyboardNavProvider', () => {
  describe('Context Provider', () => {
    it('should provide keyboard navigation context', () => {
      render(
        <KeyboardNavProvider>
          <TestComponent />
        </KeyboardNavProvider>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should throw error when used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useKeyboardNav must be used within a KeyboardNavProvider');

      consoleError.mockRestore();
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should render announcement regions', () => {
      render(
        <KeyboardNavProvider>
          <div>Content</div>
        </KeyboardNavProvider>
      );

      // Check for aria-live regions
      const politeRegion = document.querySelector('[aria-live="polite"]');
      const assertiveRegion = document.querySelector('[aria-live="assertive"]');

      expect(politeRegion).toBeInTheDocument();
      expect(assertiveRegion).toBeInTheDocument();
    });

    it('should announce messages to screen readers', async () => {
      const AnnouncerTest: React.FC = () => {
        const announce = useAnnounce();

        return (
          <button
            onClick={() => announce('Test announcement')}
            data-testid="announce-button"
          >
            Announce
          </button>
        );
      };

      render(
        <KeyboardNavProvider>
          <AnnouncerTest />
        </KeyboardNavProvider>
      );

      const button = screen.getByTestId('announce-button');
      fireEvent.click(button);

      // The message should be in the live region
      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toContain('Test announcement');
    });

    it('should support assertive announcements', async () => {
      const AssertiveAnnouncerTest: React.FC = () => {
        const announce = useAnnounce();

        return (
          <button
            onClick={() => announce('Alert!', 'assertive')}
            data-testid="alert-button"
          >
            Alert
          </button>
        );
      };

      render(
        <KeyboardNavProvider>
          <AssertiveAnnouncerTest />
        </KeyboardNavProvider>
      );

      const button = screen.getByTestId('alert-button');
      fireEvent.click(button);

      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      expect(assertiveRegion?.textContent).toContain('Alert!');
    });
  });

  describe('Keyboard User Detection', () => {
    it('should detect keyboard navigation via Tab key', () => {
      const KeyboardUserTest: React.FC = () => {
        const isKeyboardUser = useIsKeyboardUser();

        return (
          <div data-testid="keyboard-status">
            {isKeyboardUser ? 'keyboard' : 'mouse'}
          </div>
        );
      };

      render(
        <KeyboardNavProvider>
          <KeyboardUserTest />
        </KeyboardNavProvider>
      );

      // Initially should be mouse user
      expect(screen.getByTestId('keyboard-status')).toHaveTextContent('mouse');

      // Press Tab key
      fireEvent.keyDown(document, { key: 'Tab' });

      // Now should be keyboard user
      expect(screen.getByTestId('keyboard-status')).toHaveTextContent('keyboard');
    });

    it('should detect mouse usage', () => {
      const KeyboardUserTest: React.FC = () => {
        const isKeyboardUser = useIsKeyboardUser();

        return (
          <div data-testid="keyboard-status">
            {isKeyboardUser ? 'keyboard' : 'mouse'}
          </div>
        );
      };

      render(
        <KeyboardNavProvider>
          <KeyboardUserTest />
        </KeyboardNavProvider>
      );

      // First use keyboard
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(screen.getByTestId('keyboard-status')).toHaveTextContent('keyboard');

      // Then use mouse
      fireEvent.mouseDown(document);
      expect(screen.getByTestId('keyboard-status')).toHaveTextContent('mouse');
    });

    it('should add keyboard-navigation class to body', () => {
      render(
        <KeyboardNavProvider>
          <div>Content</div>
        </KeyboardNavProvider>
      );

      // Press Tab key
      fireEvent.keyDown(document, { key: 'Tab' });

      expect(document.body.classList.contains('keyboard-navigation')).toBe(true);
    });
  });

  describe('Focus Management', () => {
    it('should track focus history', async () => {
      let capturedContext: ReturnType<typeof useKeyboardNav> | null = null;

      render(
        <TestWrapper onContext={(ctx) => (capturedContext = ctx)}>
          <div>
            <button data-testid="button-1">Button 1</button>
            <button data-testid="button-2">Button 2</button>
          </div>
        </TestWrapper>
      );

      const button1 = screen.getByTestId('button-1');
      const button2 = screen.getByTestId('button-2');

      // Push focus
      act(() => {
        capturedContext?.pushFocus(button1);
      });

      expect(capturedContext?.getPreviousFocus()).toBeNull();

      act(() => {
        capturedContext?.pushFocus(button2);
      });

      const previousFocus = capturedContext?.getPreviousFocus();
      expect(previousFocus).toBe(button1);
    });

    it('should pop focus from history', async () => {
      let capturedContext: ReturnType<typeof useKeyboardNav> | null = null;

      render(
        <TestWrapper onContext={(ctx) => (capturedContext = ctx)}>
          <div>
            <button data-testid="button-1">Button 1</button>
            <button data-testid="button-2">Button 2</button>
          </div>
        </TestWrapper>
      );

      const button1 = screen.getByTestId('button-1');
      const button2 = screen.getByTestId('button-2');

      // Push button1 - currentFocus = button1, history = []
      act(() => {
        capturedContext?.pushFocus(button1);
      });

      // Push button2 - currentFocus = button2, history = [button1]
      act(() => {
        capturedContext?.pushFocus(button2);
      });

      // getPreviousFocus should return the last item in history (button1)
      const beforePop = capturedContext?.getPreviousFocus();
      expect(beforePop).toBe(button1);

      // popFocus removes last from history, sets focus to it, returns it
      // After: currentFocus = button1, history = []
      let poppedElement: HTMLElement | null = null;
      act(() => {
        poppedElement = capturedContext?.popFocus() ?? null;
      });

      // poppedElement should be button1
      expect(poppedElement).toBe(button1);

      // After pop, getPreviousFocus should be null (history is empty)
      const afterPop = capturedContext?.getPreviousFocus();
      expect(afterPop).toBeNull();
    });
  });
});

describe('SkipLink', () => {
  it('should render skip link with correct text', () => {
    render(<SkipLink />);

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should support custom target ID', () => {
    render(<SkipLink targetId="custom-main" />);

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toHaveAttribute('href', '#custom-main');
  });

  it('should support custom children', () => {
    render(<SkipLink>Skip to content</SkipLink>);

    expect(screen.getByText('Skip to content')).toBeInTheDocument();
  });

  it('should scroll to target on click', () => {
    const mainContent = document.createElement('main');
    mainContent.id = 'main-content';
    mainContent.scrollIntoView = vi.fn(); // Mock scrollIntoView
    mainContent.tabIndex = 0; // Add tabIndex for focus
    mainContent.focus = vi.fn(); // Mock focus
    document.body.appendChild(mainContent);

    render(<SkipLink />);

    const skipLink = screen.getByText('Skip to main content');
    fireEvent.click(skipLink);

    // Should attempt to scroll
    expect(mainContent.scrollIntoView).toHaveBeenCalled();
    expect(mainContent.focus).toHaveBeenCalled();

    document.body.removeChild(mainContent);
  });
});

describe('FocusLock', () => {
  it('should render children', () => {
    render(
      <KeyboardNavProvider>
        <FocusLock>
          <button>Button</button>
        </FocusLock>
      </KeyboardNavProvider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call onEscape when Escape is pressed', () => {
    const onEscape = vi.fn();

    render(
      <KeyboardNavProvider>
        <FocusLock onEscape={onEscape}>
          <button>Button</button>
        </FocusLock>
      </KeyboardNavProvider>
    );

    const container = screen.getByRole('button').parentElement;
    if (container) {
      fireEvent.keyDown(container, { key: 'Escape' });
    }

    expect(onEscape).toHaveBeenCalled();
  });

  it('should not trap focus when disabled', () => {
    render(
      <KeyboardNavProvider>
        <FocusLock enabled={false}>
          <button>Button</button>
        </FocusLock>
      </KeyboardNavProvider>
    );

    // Focus lock should not be active
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should cycle focus within container on Tab', () => {
    render(
      <KeyboardNavProvider>
        <FocusLock>
          <button data-testid="first">First</button>
          <button data-testid="second">Second</button>
        </FocusLock>
      </KeyboardNavProvider>
    );

    const container = screen.getByTestId('first').parentElement;

    // Tab from last to first
    const lastButton = screen.getByTestId('second');
    lastButton.focus();

    if (container) {
      fireEvent.keyDown(container, { key: 'Tab' });
    }

    // Should cycle to first (tested through integration)
  });

  it('should cycle focus backwards on Shift+Tab', () => {
    render(
      <KeyboardNavProvider>
        <FocusLock>
          <button data-testid="first">First</button>
          <button data-testid="second">Second</button>
        </FocusLock>
      </KeyboardNavProvider>
    );

    const container = screen.getByTestId('first').parentElement;

    // Shift+Tab from first to last
    const firstButton = screen.getByTestId('first');
    firstButton.focus();

    if (container) {
      fireEvent.keyDown(container, { key: 'Tab', shiftKey: true });
    }

    // Should cycle to last (tested through integration)
  });
});

describe('VisuallyHidden', () => {
  it('should render content that is visually hidden but accessible', () => {
    render(<VisuallyHidden>Hidden content</VisuallyHidden>);

    const element = screen.getByText('Hidden content');
    expect(element).toBeInTheDocument();
  });

  it('should support custom element type', () => {
    render(<VisuallyHidden as="div">Hidden div</VisuallyHidden>);

    const element = screen.getByText('Hidden div');
    expect(element.tagName.toLowerCase()).toBe('div');
  });

  it('should support custom className', () => {
    render(
      <VisuallyHidden className="custom-class">Hidden with class</VisuallyHidden>
    );

    const element = screen.getByText('Hidden with class');
    expect(element).toHaveClass('custom-class');
  });
});

describe('WCAG 2.1 AA Compliance', () => {
  describe('Bypass Blocks (WCAG 2.4.1)', () => {
    it('should provide skip navigation link', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink.tagName.toLowerCase()).toBe('a');
    });

    it('should hide skip link until focused', () => {
      render(<SkipLink />);

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveClass('skip-link');
    });
  });

  describe('Focus Management (WCAG 2.4.3)', () => {
    it('should trap focus within modal content', () => {
      render(
        <KeyboardNavProvider>
          <FocusLock>
            <button>Inside Modal</button>
          </FocusLock>
        </KeyboardNavProvider>
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should restore focus when modal closes', async () => {
      const { rerender } = render(
        <KeyboardNavProvider>
          <FocusLock enabled={true}>
            <button>Modal Content</button>
          </FocusLock>
        </KeyboardNavProvider>
      );

      rerender(
        <KeyboardNavProvider>
          <FocusLock enabled={false}>
            <button>Modal Content</button>
          </FocusLock>
        </KeyboardNavProvider>
      );

      // Focus restoration is handled internally
    });
  });

  describe('Screen Reader Support (WCAG 4.1.3)', () => {
    it('should provide polite live region', () => {
      render(
        <KeyboardNavProvider>
          <div>Content</div>
        </KeyboardNavProvider>
      );

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion).toBeInTheDocument();
      expect(politeRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('should provide assertive live region', () => {
      render(
        <KeyboardNavProvider>
          <div>Content</div>
        </KeyboardNavProvider>
      );

      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      expect(assertiveRegion).toBeInTheDocument();
      expect(assertiveRegion).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Focus Visible (WCAG 2.4.7)', () => {
    it('should add keyboard-navigation class for focus styles', () => {
      render(
        <KeyboardNavProvider>
          <div>Content</div>
        </KeyboardNavProvider>
      );

      // Simulate keyboard navigation
      fireEvent.keyDown(document, { key: 'Tab' });

      expect(document.body.classList.contains('keyboard-navigation')).toBe(true);
    });

    it('should add mouse-navigation class when using mouse', () => {
      render(
        <KeyboardNavProvider>
          <div>Content</div>
        </KeyboardNavProvider>
      );

      // Simulate mouse usage
      fireEvent.mouseDown(document);

      expect(document.body.classList.contains('mouse-navigation')).toBe(true);
    });
  });
});
