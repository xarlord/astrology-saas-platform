/**
 * Modal Component
 *
 * Accessible modal dialog with focus trap, keyboard navigation, and ARIA support
 * Follows WAI-ARIA Modal Dialog Pattern and WCAG 2.1 AA guidelines
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { clsx } from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'danger' | 'success';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  contentClassName?: string;
  footer?: React.ReactNode;
  initialFocus?: 'close-button' | 'first-input' | 'none';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full m-4',
};

const variantStyles = {
  default: 'bg-white dark:bg-gray-800',
  danger: 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500',
  success: 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  contentClassName,
  footer,
  initialFocus = 'close-button',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  // Store the element that had focus before modal opened
  useEffect(() => {
    if (isOpen && !previouslyFocusedElement.current) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Get all focusable elements within modal
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'details:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    );
  }, []);

  // Focus trap handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // If shift + tab on first element, focus last
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
        // If tab on last element, focus first
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [closeOnEscape, getFocusableElements, onClose]
  );

  // Set initial focus
  useEffect(() => {
    if (isOpen && modalRef.current) {
      focusableElementsRef.current = getFocusableElements();

      const focusElement = () => {
        if (initialFocus === 'close-button' && closeButtonRef.current) {
          closeButtonRef.current.focus();
        } else if (initialFocus === 'first-input' && focusableElementsRef.current.length > 0) {
          focusableElementsRef.current[0].focus();
        }
      };

      // Small delay to ensure modal is rendered
      const timeoutId = setTimeout(focusElement, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, initialFocus, getFocusableElements]);

  // Add/remove event listeners and manage body scroll
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('aria-hidden', 'false');

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        document.body.removeAttribute('aria-hidden');

        // Restore focus to previously focused element
        if (previouslyFocusedElement.current) {
          previouslyFocusedElement.current.focus();
          previouslyFocusedElement.current = null;
        }
      };
    }
  }, [isOpen, handleKeyDown]);

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby="modal-description"
    >
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        ref={modalRef}
        className={clsx(
          'relative w-full rounded-lg shadow-xl',
          'transform transition-all',
          'max-h-[90vh] overflow-hidden flex flex-col',
          sizeClasses[size],
          variantStyles[variant],
          className
        )}
      >
        {/* Header */}
        {(Boolean(title ?? '') || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-gray-900 dark:text-gray-100"
              >
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="ml-4 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          id="modal-description"
          className={clsx(
            'flex-1 overflow-y-auto p-6',
            contentClassName
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Modal.Header subcomponent
interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ children, className }) => (
  <div className={clsx('p-6 border-b border-gray-200 dark:border-gray-700', className)}>
    {children}
  </div>
);

// Type assertion for subcomponent assignment
(Modal as React.FC<ModalProps> & { Header: React.FC<ModalHeaderProps> }).Header = ModalHeader;

// Modal.Body subcomponent
interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

const ModalBody: React.FC<ModalBodyProps> = ({ children, className }) => (
  <div className={clsx('flex-1 overflow-y-auto p-6', className)}>
    {children}
  </div>
);

(Modal as React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Body: React.FC<ModalBodyProps>;
  Footer: React.FC<ModalFooterProps>;
}).Body = ModalBody;

// Modal.Footer subcomponent
interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className,
  align = 'right',
}) => (
  <div
    className={clsx(
      'flex items-center border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50',
      align === 'left' && 'justify-start',
      align === 'center' && 'justify-center',
      align === 'right' && 'justify-end space-x-3',
      className
    )}
  >
    {children}
  </div>
);

(Modal as React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Body: React.FC<ModalBodyProps>;
  Footer: React.FC<ModalFooterProps>;
}).Footer = ModalFooter;

export default Modal;
