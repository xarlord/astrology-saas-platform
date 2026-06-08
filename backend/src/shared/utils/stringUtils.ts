/**
 * Shared String Utilities
 * Common string manipulation helpers used across modules.
 */

/**
 * Capitalize the first letter of a string.
 * Returns an empty string for nullish / empty input.
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
