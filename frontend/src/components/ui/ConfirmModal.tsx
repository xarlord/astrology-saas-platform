/**
 * ConfirmModal Component
 *
 * Delete confirmation modal with:
 * - Warning icon and message
 * - Text input confirmation (type "DELETE")
 * - Cancel and Confirm buttons
 *
 * Features glassmorphism theme and Framer Motion animations
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: string;
  itemName?: string;
  confirmText?: string;
  confirmationString?: string;
  variant?: 'danger' | 'warning';
  showAdditionalOption?: boolean;
  additionalOptionLabel?: string;
  additionalOptionChecked?: boolean;
  onAdditionalOptionChange?: (checked: boolean) => void;
  isLoading?: boolean;
  className?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message,
  itemName,
  confirmText = 'Delete Forever',
  confirmationString = 'DELETE',
  variant = 'danger',
  showAdditionalOption = false,
  additionalOptionLabel = 'Also delete related items',
  additionalOptionChecked = false,
  onAdditionalOptionChange,
  isLoading = false,
  className,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap for WCAG 2.1 AA compliance
  const trapRef = useFocusTrap<HTMLDivElement>({
    active: isOpen,
    onEscape: onClose,
    autoFocusDelay: 150,
  });

  const isConfirmed = inputValue === confirmationString;

  // Handle confirm
  const handleConfirm = useCallback(async () => {
    if (!isConfirmed || isSubmitting || isLoading) return;

    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Error handling is done by the parent component
    } finally {
      setIsSubmitting(false);
    }
  }, [isConfirmed, isSubmitting, isLoading, onConfirm, onClose]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  // Handle additional option change
  const handleAdditionalOptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onAdditionalOptionChange?.(e.target.checked);
    },
    [onAdditionalOptionChange],
  );

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      // Small delay to ensure modal is rendered
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // Handle Enter key for quick confirm (Escape handled by useFocusTrap)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Enter' && isConfirmed && !isSubmitting && !isLoading) {
        void handleConfirm();
      }
    },
    [isOpen, isConfirmed, isSubmitting, isLoading, handleConfirm],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180, transition: { type: 'spring', stiffness: 200, damping: 15 } },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { type: 'spring', stiffness: 200, damping: 15 },
    },
  } as const;

  const variantStyles = {
    danger: {
      icon: 'text-red-500 bg-red-500/10',
      input: 'border-red-500/30 focus:ring-red-500 focus:border-red-500',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      iconColor: 'text-red-500',
    },
    warning: {
      icon: 'text-yellow-500 bg-yellow-500/10',
      input: 'border-yellow-500/30 focus:ring-yellow-500 focus:border-yellow-500',
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      iconColor: 'text-yellow-500',
    },
  };

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={trapRef}
            className={clsx(
              'relative w-full max-w-md rounded-2xl overflow-hidden',
              'bg-gradient-to-br from-gray-900/95 to-gray-800/95',
              'backdrop-blur-xl border border-white/10',
              'shadow-2xl',
              variant === 'danger' && 'shadow-red-500/20',
              variant === 'warning' && 'shadow-yellow-500/20',
              className,
            )}
            variants={modalVariants}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-description"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <motion.div
                  className={clsx('p-2 rounded-full', styles.icon)}
                  variants={iconVariants}
                >
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                </motion.div>
                <h2 id="confirm-modal-title" className="text-lg font-semibold text-white">
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting || isLoading}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Warning Message */}
              <div id="confirm-modal-description">
                <p className="text-gray-300">
                  {itemName ? (
                    <>
                      Are you sure you want to delete{' '}
                      <span className="font-medium text-white">&quot;{itemName}&quot;</span>?
                    </>
                  ) : (
                    message
                  )}
                </p>
                {itemName && <p className="mt-2 text-sm text-gray-400">{message}</p>}
              </div>

              {/* Additional warning */}
              <div className="flex items-start space-x-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <span className={clsx('material-symbols-outlined text-[20px] mt-0.5 flex-shrink-0', styles.iconColor)}>warning</span>
                <p className="text-sm text-red-300">
                  This action cannot be undone. All associated data will be permanently removed.
                </p>
              </div>

              {/* Additional Option Checkbox */}
              {showAdditionalOption && (
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={additionalOptionChecked}
                      onChange={handleAdditionalOptionChange}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 rounded border border-gray-600 bg-gray-800 peer-checked:bg-purple-500 peer-checked:border-purple-500 transition-colors group-hover:border-gray-500">
                      {additionalOptionChecked && (
                        <svg
                          className="w-full h-full text-white p-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {additionalOptionLabel}
                  </span>
                </label>
              )}

              {/* Confirmation Input */}
              <div>
                <label
                  htmlFor="confirm-input"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Type{' '}
                  <span className="font-mono font-bold text-red-400">{confirmationString}</span> to
                  confirm:
                </label>
                <input
                  ref={inputRef}
                  id="confirm-input"
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={confirmationString}
                  disabled={isSubmitting || isLoading}
                  className={clsx(
                    'w-full px-4 py-3 rounded-lg',
                    'bg-gray-800/50 border-2',
                    'text-white placeholder-gray-500 font-mono',
                    'focus:outline-none focus:ring-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-all duration-200',
                    isConfirmed ? 'border-green-500/50 focus:ring-green-500' : styles.input,
                  )}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck="false"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-white/10 bg-gray-900/50">
              <div className="sr-only" aria-live="polite" role="status">
                {isConfirmed && 'Confirmation text entered. Delete button is now enabled.'}
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting || isLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                ref={confirmButtonRef}
                onClick={() => void handleConfirm()}
                disabled={!isConfirmed || isSubmitting || isLoading}
                className={clsx(
                  'flex items-center px-4 py-2 rounded-lg text-white text-sm font-medium',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-all duration-200',
                  styles.button,
                )}
              >
                {isSubmitting || isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px] mr-1.5">delete</span>
                    {confirmText}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
