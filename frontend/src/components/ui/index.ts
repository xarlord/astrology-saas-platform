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
export { Alert, AlertTitle, AlertDescription, AlertAction } from './Alert';
export type { AlertProps, AlertVariant, AlertSize } from './Alert';

// Loading Spinner
export { LoadingSpinner } from './LoadingSpinner';
export type { LoadingSpinnerProps } from './LoadingSpinner';

// Progress Indicator
export { ProgressIndicator, LinearProgress, CircularProgress } from './ProgressIndicator';
export type {
  ProgressIndicatorProps,
  LinearProgressProps,
  CircularProgressProps,
} from './ProgressIndicator';

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

// Inline Error
export { InlineError, FormErrorSummary, FieldError } from './InlineError';
export type { InlineErrorProps, FormErrorSummaryProps, FieldErrorProps } from './InlineError';

// Network Error
export { OfflineBanner, ApiErrorPage, ConnectionStatus } from './NetworkError';
export type {
  OfflineBannerProps,
  ApiErrorPageProps,
  ApiErrorCode,
  ConnectionStatusProps,
} from './NetworkError';

// Error Recovery
export {
  RetryButton,
  ErrorRecoveryActions,
  ReportIssueButton,
  RefreshButton,
} from './ErrorRecovery';
export type {
  RetryButtonProps,
  ErrorRecoveryActionsProps,
  ErrorType,
  ReportIssueButtonProps,
  RefreshButtonProps,
} from './ErrorRecovery';

// Error Boundary
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
export type { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary';

// Card
export { Card } from './Card';
export type {
  CardProps,
  CardVariant,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
} from './Card';

// Tabs
export { Tabs, TabList, Tab, TabPanel, TabPanels } from './Tabs';
export type {
  TabsProps,
  TabsOrientation,
  TabProps,
  TabPanelProps,
  TabListProps,
  TabPanelsProps,
} from './Tabs';

// Tooltip
export { Tooltip } from './Tooltip';
export type { TooltipProps, TooltipPosition, TooltipTheme } from './Tooltip';

// Dropdown
export { Dropdown } from './Dropdown';
export type {
  DropdownProps,
  DropdownTriggerProps,
  DropdownMenuProps,
  DropdownItemProps,
  DropdownDividerProps,
} from './Dropdown';

// Avatar
export { Avatar, AvatarGroup } from './Avatar';
export type { AvatarProps, AvatarSize, AvatarStatus, AvatarGroupProps } from './Avatar';

// Video Modal
export { VideoModal } from './VideoModal';
export type { VideoModalProps, VideoChapter, TranscriptEntry } from './VideoModal';

// Share Modal
export { ShareModal } from './ShareModal';
export type { ShareModalProps, ShareVisibility } from './ShareModal';

// Confirm Modal
export { ConfirmModal } from './ConfirmModal';
export type { ConfirmModalProps } from './ConfirmModal';
