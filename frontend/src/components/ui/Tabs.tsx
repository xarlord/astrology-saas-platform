/**
 * Tabs Component
 *
 * Tab navigation with horizontal/vertical variants and animated indicator
 * Supports controlled and uncontrolled modes
 */

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export type TabsOrientation = 'horizontal' | 'vertical';

// Context for tab state
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  orientation: TabsOrientation;
  registerTab: (id: string, ref: HTMLButtonElement) => void;
  unregisterTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within a Tabs component');
  }
  return context;
};

// Tabs container
export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  orientation?: TabsOrientation;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onChange,
  orientation = 'horizontal',
  children,
  className,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const tabsRef = useRef<Map<string, HTMLButtonElement>>(new Map());

  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : internalValue;

  const setActiveTab = (tab: string) => {
    if (!isControlled) {
      setInternalValue(tab);
    }
    onChange?.(tab);
  };

  const registerTab = (id: string, ref: HTMLButtonElement) => {
    tabsRef.current.set(id, ref);
  };

  const unregisterTab = (id: string) => {
    tabsRef.current.delete(id);
  };

  return (
    <TabsContext.Provider
      value={{ activeTab, setActiveTab, orientation, registerTab, unregisterTab }}
    >
      <div
        className={clsx(orientation === 'vertical' && 'flex gap-4', className)}
        aria-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// Tab list container
export interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabList: React.FC<TabListProps> = ({ children, className }) => {
  const { orientation } = useTabsContext();

  return (
    <div
      className={clsx(
        'relative',
        orientation === 'horizontal'
          ? 'flex border-b border-gray-200 dark:border-gray-700'
          : 'flex flex-col border-l border-gray-200 dark:border-gray-700',
        className,
      )}
      role="tablist"
    >
      <TabIndicator />
      {children}
    </div>
  );
};

// Tab indicator (animated underline/sideline)
const TabIndicator: React.FC = () => {
  const { activeTab, orientation } = useTabsContext();
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This effect would normally track tab positions
    // For simplicity, CSS transitions handle the animation
  }, [activeTab]);

  if (!activeTab) return null;

  return (
    <motion.div
      ref={indicatorRef}
      className={clsx(
        'absolute bg-primary-500',
        orientation === 'horizontal' ? 'bottom-0 h-0.5 w-full' : 'left-0 w-0.5 h-8',
      )}
      layoutId="tab-indicator"
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  );
};

// Individual tab
export interface TabProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ value, children, disabled = false, className, icon }) => {
  const { activeTab, setActiveTab, orientation, registerTab, unregisterTab } = useTabsContext();
  const tabRef = useRef<HTMLButtonElement>(null);
  const isSelected = activeTab === value;

  useEffect(() => {
    if (tabRef.current) {
      registerTab(value, tabRef.current);
    }
    return () => unregisterTab(value);
  }, [value, registerTab, unregisterTab]);

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      ref={tabRef}
      role="tab"
      aria-selected={isSelected}
      aria-disabled={disabled}
      tabIndex={isSelected ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={clsx(
        'relative px-4 py-2 text-sm font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        orientation === 'horizontal' ? 'mr-1' : 'mb-1 text-left pl-4',
        isSelected
          ? 'text-primary-600 dark:text-primary-400'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <span className="relative z-10 flex items-center gap-2">
        {icon && <span className="w-4 h-4">{icon}</span>}
        {children}
      </span>
      {isSelected && (
        <motion.div
          className={clsx(
            'absolute bg-primary-500',
            orientation === 'horizontal'
              ? 'bottom-0 left-0 right-0 h-0.5'
              : 'left-0 top-0 bottom-0 w-0.5',
          )}
          layoutId="active-tab-indicator"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );
};

// Tab panel
export interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  keepMounted?: boolean;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  value,
  children,
  className,
  keepMounted = false,
}) => {
  const { activeTab } = useTabsContext();
  const isSelected = activeTab === value;

  if (!isSelected && !keepMounted) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      aria-hidden={!isSelected}
      hidden={!isSelected}
      className={clsx('py-4', isSelected ? 'block' : 'hidden', className)}
      tabIndex={0}
    >
      <AnimatePresence mode="wait">
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Tab panels container
export interface TabPanelsProps {
  children: React.ReactNode;
  className?: string;
}

export const TabPanels: React.FC<TabPanelsProps> = ({ children, className }) => {
  const { orientation } = useTabsContext();

  return (
    <div className={clsx('flex-1', orientation === 'vertical' && 'min-w-0', className)}>
      {children}
    </div>
  );
};

export default Tabs;
