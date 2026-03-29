/**
 * useLocalStorage Hook
 *
 * Custom hook for localStorage with type safety and SSR support
 * Handles JSON serialization/deserialization automatically
 */

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get initial value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to localStorage from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key]);

  return [storedValue, setValue, removeValue];
}

// Hook for managing an object in localStorage
export function useLocalStorageObject<T extends Record<string, unknown>>(
  key: string,
  initialValue: T
): [T, (updates: Partial<T>) => void, () => void] {
  const [value, setValue, removeValue] = useLocalStorage<T>(key, initialValue);

  // Update specific fields in the object
  const updateFields = useCallback((updates: Partial<T>) => {
    setValue((prev) => ({ ...prev, ...updates }));
  }, [setValue]);

  return [value, updateFields, removeValue];
}

// Hook for managing an array in localStorage
export function useLocalStorageArray<T>(
  key: string,
  initialValue: T[]
): [T[], {
  addItem: (item: T) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, item: T) => void;
  clear: () => void;
}] {
  const [value, setValue, _removeValue] = useLocalStorage<T[]>(key, initialValue);

  const addItem = useCallback((item: T) => {
    setValue((prev) => [...prev, item]);
  }, [setValue]);

  const removeItem = useCallback((index: number) => {
    setValue((prev) => prev.filter((_, i) => i !== index));
  }, [setValue]);

  const updateItem = useCallback((index: number, item: T) => {
    setValue((prev) => prev.map((v, i) => (i === index ? item : v)));
  }, [setValue]);

  const clear = useCallback(() => {
    setValue([]);
  }, [setValue]);

  return [value, { addItem, removeItem, updateItem, clear }];
}

export default useLocalStorage;
