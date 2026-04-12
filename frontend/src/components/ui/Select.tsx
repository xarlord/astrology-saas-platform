/**
 * Select Component
 *
 * Accessible select dropdown with search, multi-select, and keyboard navigation
 * Follows WCAG 2.1 AA guidelines for form controls
 */

import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps {
  id?: string;
  label?: string;
  options: SelectOption[] | SelectGroup[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  fullWidth?: boolean;
  className?: string;
  containerClassName?: string;
  virtualized?: boolean;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      id,
      label,
      options,
      value: controlledValue,
      defaultValue,
      onChange,
      placeholder = 'Select an option',
      error,
      helperText,
      disabled = false,
      multiple = false,
      searchable = false,
      fullWidth = true,
      className,
      containerClassName,
    },
    ref,
  ) => {
    const selectId = id ?? `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;
    const listboxId = `${selectId}-listbox`;

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [internalValue, setInternalValue] = useState<string | string[]>(
      defaultValue ?? (multiple ? [] : ''),
    );

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);

    // Normalize options to groups format
    const groupedOptions: SelectGroup[] = React.useMemo(() => {
      const hasGroups = options.some(
        (opt) => 'group' in opt || ('label' in opt && 'options' in opt),
      );

      if (hasGroups) {
        return options as SelectGroup[];
      }

      return [{ label: '', options: options as SelectOption[] }];
    }, [options]);

    // Flatten options for searching
    const flatOptions: SelectOption[] = React.useMemo(() => {
      return groupedOptions.flatMap((group) => group.options);
    }, [groupedOptions]);

    // Filter options based on search
    const filteredGroups: SelectGroup[] = React.useMemo(() => {
      if (!searchQuery) return groupedOptions;

      return groupedOptions
        .map((group) => ({
          ...group,
          options: group.options.filter((opt) =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter((group) => group.options.length > 0);
    }, [groupedOptions, searchQuery]);

    // Get display value
    const getDisplayValue = useCallback(() => {
      if (multiple) {
        const values = Array.isArray(value) ? value : [];
        return values
          .map((v) => flatOptions.find((opt) => opt.value === v)?.label)
          .filter(Boolean)
          .join(', ');
      }
      return flatOptions.find((opt) => opt.value === value)?.label ?? '';
    }, [value, multiple, flatOptions]);

    // Handle select
    const handleSelect = useCallback(
      (optionValue: string) => {
        let newValue: string | string[];

        if (multiple) {
          const values = Array.isArray(value) ? value : [];
          newValue = values.includes(optionValue)
            ? values.filter((v) => v !== optionValue)
            : [...values, optionValue];
        } else {
          newValue = optionValue;
          setIsOpen(false);
        }

        if (!isControlled) {
          setInternalValue(newValue);
        }
        onChange?.(newValue);
      },
      [value, multiple, isControlled, onChange],
    );

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
          case 'Enter':
          case ' ':
            if (isOpen && highlightedIndex >= 0) {
              e.preventDefault();
              const filteredFlat = filteredGroups.flatMap((g) => g.options);
              handleSelect(filteredFlat[highlightedIndex].value);
            } else {
              setIsOpen(!isOpen);
            }
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (!isOpen) {
              setIsOpen(true);
            } else {
              const filteredFlat = filteredGroups.flatMap((g) => g.options);
              setHighlightedIndex((prev) => (prev < filteredFlat.length - 1 ? prev + 1 : prev));
            }
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (isOpen) {
              setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
            }
            break;
          case 'Escape':
            setIsOpen(false);
            break;
          case 'Tab':
            setIsOpen(false);
            break;
        }
      },
      [disabled, isOpen, highlightedIndex, filteredGroups, handleSelect],
    );

    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Scroll highlighted option into view
    useEffect(() => {
      if (isOpen && highlightedIndex >= 0 && optionsRef.current) {
        const options = optionsRef.current.querySelectorAll('[role="option"]');
        const highlighted = options[highlightedIndex] as HTMLElement;
        highlighted?.scrollIntoView({ block: 'nearest' });
      }
    }, [highlightedIndex, isOpen]);

    const wrapperClass = clsx('relative', fullWidth && 'w-full', containerClassName);

    const triggerClass = clsx(
      'relative w-full cursor-pointer rounded-md border',
      'bg-white dark:bg-gray-800',
      'text-gray-900 dark:text-gray-100',
      'transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      error
        ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500',
      className,
    );

    return (
      <div ref={containerRef} className={wrapperClass}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}

        <div ref={ref} className="relative">
          {/* Trigger button */}
          <div
            id={selectId}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-labelledby={`${selectId}-label`}
            aria-controls={listboxId}
            aria-invalid={Boolean(error)}
            aria-describedby={
              clsx(error && errorId, helperText && helperId)
                .split(' ')
                .filter(Boolean)
                .join(' ') || undefined
            }
            className={clsx(triggerClass, 'min-h-[38px] px-3 py-2')}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={handleKeyDown}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <span className={clsx('block truncate', !getDisplayValue() && 'text-gray-400')}>
              {getDisplayValue() || placeholder}
            </span>

            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className={clsx(
                  'h-5 w-5 text-gray-400 transition-transform',
                  isOpen && 'rotate-180',
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div
              ref={optionsRef}
              id={listboxId}
              role="listbox"
              aria-multiselectable={multiple}
              className={clsx(
                'absolute z-10 mt-1 w-full rounded-md shadow-lg',
                'bg-white dark:bg-gray-800',
                'border border-gray-200 dark:border-gray-700',
                'max-h-60 overflow-auto',
              )}
            >
              {/* Search input */}
              {searchable && (
                <div className="sticky top-0 z-10 p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>
              )}

              {/* Options */}
              {filteredGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {group.label && (
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                      {group.label}
                    </div>
                  )}
                  {group.options.map((option, optionIndex) => {
                    const isSelected = multiple
                      ? Array.isArray(value) && value.includes(option.value)
                      : value === option.value;
                    const index =
                      filteredGroups
                        .slice(0, groupIndex)
                        .reduce((acc, g) => acc + g.options.length, 0) + optionIndex;

                    return (
                      <div
                        key={option.value}
                        role="option"
                        aria-selected={isSelected}
                        className={clsx(
                          'relative cursor-pointer select-none py-2 pl-3 pr-9',
                          'transition-colors duration-150',
                          (highlightedIndex === index ||
                            (optionIndex === 0 && groupIndex === 0 && highlightedIndex === -1)) &&
                            'bg-gray-100 dark:bg-gray-700',
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                            : 'text-gray-900 dark:text-gray-100',
                          option.disabled && 'opacity-50 cursor-not-allowed',
                        )}
                        onClick={() => !option.disabled && handleSelect(option.value)}
                      >
                        <span className="block truncate">{option.label}</span>

                        {isSelected && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <svg
                              className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {filteredGroups.every((g) => g.options.length === 0) && (
                <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No options found
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
