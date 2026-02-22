/**
 * UI Components Barrel Export
 *
 * Centralized exports for all base UI components
 * Import from this file for cleaner imports
 */

// Button
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

// Input
export { Input } from './Input';
export type { InputProps, InputType } from './Input';

// Select
export { Select } from './Select';
export type { SelectProps, SelectOption, SelectGroup } from './Select';

// Checkbox
export { Checkbox } from './Checkbox';
export type { CheckboxProps } from './Checkbox';

// Toggle (Switch)
export { Toggle } from './Toggle';
export type { ToggleProps } from './Toggle';

// Badge
export { Badge, DotBadge, CountBadge } from './Badge';
export type { BadgeProps, DotBadgeProps, CountBadgeProps, BadgeVariant, BadgeSize } from './Badge';

// Modal
export { Modal } from './Modal';
export type { ModalProps } from './Modal';

// Toast
export { Toast } from './Toast';
export type { ToastProps } from './Toast';

// Alert
export { Alert } from './Alert';
export type { AlertProps, AlertVariant } from './Alert';

// Loading Spinner
export { LoadingSpinner } from './LoadingSpinner';
export type { LoadingSpinnerProps } from './LoadingSpinner';

// Skeleton Screen
export {
  SkeletonText,
  SkeletonCircle,
  SkeletonRect,
  SkeletonCard,
  SkeletonChartWheel,
  SkeletonTable,
  SkeletonCalendar,
  SkeletonList,
  SkeletonForm,
} from './SkeletonScreen';
export type {
  SkeletonProps,
  SkeletonTextProps,
  SkeletonCircleProps,
  SkeletonRectProps,
  SkeletonTableProps,
  SkeletonListProps,
} from './SkeletonScreen';

// Error Boundary
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
export type { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary';
