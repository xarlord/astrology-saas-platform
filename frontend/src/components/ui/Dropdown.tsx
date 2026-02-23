/**
 * Dropdown Component
 *
 * Dropdown menu with trigger button, menu items with icons,
 * keyboard navigation, and click outside to close
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// Context for dropdown state
interface DropdownContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown component');
  }
  return context;
};

export interface DropdownProps {
  children: ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export const Dropdown: React.FC<DropdownProps> & {
  Trigger: React.FC<DropdownTriggerProps>;
  Menu: React.FC<DropdownMenuProps>;
  Item: React.FC<DropdownItemProps>;
  Divider: React.FC<DropdownDividerProps>;
} = ({ children, className, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      onOpenChange?.(newState);
      return newState;
    });
  }, [onOpenChange]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, close]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, close]);

  return (
    <DropdownContext.Provider value={{ isOpen, toggle, close }}>
      <div ref={containerRef} className={clsx('relative inline-block', className)}>
        {typeof children === 'function'
          ? (children as (props: { isOpen: boolean; toggle: () => void }) => ReactNode)({ isOpen, toggle })
          : children}
      </div>
    </DropdownContext.Provider>
  );
};

// Trigger component
export interface DropdownTriggerProps {
  children: React.ReactNode | ((props: { isOpen: boolean; toggle: () => void }) => React.ReactNode);
  asChild?: boolean;
  className?: string;
}

const DropdownTrigger: React.FC<DropdownTriggerProps> = ({
  children,
  asChild = false,
  className,
}) => {
  const { isOpen, toggle } = useDropdownContext();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
      onClick: handleClick,
      'aria-expanded': isOpen,
      'aria-haspopup': true,
    });
  }

  return (
    <div
      data-dropdown-trigger
      onClick={handleClick}
      className={className}
      aria-expanded={isOpen}
      aria-haspopup
    >
      {typeof children === 'function' ? children({ isOpen, toggle }) : children}
    </div>
  );
};

Dropdown.Trigger = DropdownTrigger;

// Menu component
export interface DropdownMenuProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'right';
  width?: 'auto' | 'sm' | 'md' | 'lg';
}

const menuWidths = {
  auto: 'min-w-[max-content]',
  sm: 'w-40',
  md: 'w-56',
  lg: 'w-72',
};

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  className,
  align = 'left',
  width = 'md',
}) => {
  const { isOpen, close } = useDropdownContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Get all focusable items
  const getFocusableItems = useCallback(() => {
    if (!menuRef.current) return [];
    return Array.from(
      menuRef.current.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([disabled])'
      )
    );
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = getFocusableItems();

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && items[focusedIndex]) {
            items[focusedIndex].click();
          }
          break;
        case 'Tab':
          close();
          break;
      }
    },
    [focusedIndex, getFocusableItems, close]
  );

  // Focus item when index changes
  useEffect(() => {
    const items = getFocusableItems();
    if (items[focusedIndex]) {
      items[focusedIndex].focus();
    }
  }, [focusedIndex, getFocusableItems]);

  // Reset focus index when menu opens
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          className={clsx(
            'absolute z-50 mt-2 py-1',
            'bg-white dark:bg-gray-800',
            'rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10',
            'focus:outline-none',
            align === 'left' ? 'left-0' : 'right-0',
            menuWidths[width],
            className
          )}
          role="menu"
          aria-orientation="vertical"
          onKeyDown={handleKeyDown}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

Dropdown.Menu = DropdownMenu;

// Item component
export interface DropdownItemProps {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  className?: string;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  icon,
  onClick,
  disabled = false,
  danger = false,
  className,
}) => {
  const { close } = useDropdownContext();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    close();
  };

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={clsx(
        'w-full px-4 py-2 text-left text-sm flex items-center gap-3',
        'transition-colors duration-150',
        'focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700',
        disabled && 'opacity-50 cursor-not-allowed',
        danger && !disabled && 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
        !danger && !disabled && 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700',
        className
      )}
      tabIndex={-1}
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  );
};

Dropdown.Item = DropdownItem;

// Divider component
export interface DropdownDividerProps {
  className?: string;
}

const DropdownDivider: React.FC<DropdownDividerProps> = ({ className }) => (
  <div
    className={clsx('my-1 h-px bg-gray-200 dark:bg-gray-700', className)}
    role="separator"
  />
);

Dropdown.Divider = DropdownDivider;

export default Dropdown;
