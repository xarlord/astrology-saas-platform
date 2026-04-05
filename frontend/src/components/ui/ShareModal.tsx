/**
 * ShareModal Component
 *
 * Share modal for charts and reports with:
 * - Public/private link toggle
 * - Copy link functionality
 * - Social sharing buttons
 * - QR code option
 *
 * Features glassmorphism theme and Framer Motion animations
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { GlobeAltIcon, LockClosedIcon, KeyIcon } from '@heroicons/react/24/outline';

export type ShareVisibility = 'public' | 'private' | 'password';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  shareUrl: string;
  itemType?: 'chart' | 'report' | 'transit';
  onVisibilityChange?: (visibility: ShareVisibility) => void;
  onPasswordSet?: (password: string) => void;
  onExpiryChange?: (expiry: string) => void;
  className?: string;
}

interface SocialButton {
  name: string;
  icon: React.ReactNode;
  color: string;
  getUrl: (url: string, title: string) => string;
}

const socialButtons: SocialButton[] = [
  {
    name: 'Twitter',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: 'hover:bg-black hover:text-white',
    getUrl: (url, title) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Facebook',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: 'hover:bg-[#1877F2] hover:text-white',
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'WhatsApp',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    color: 'hover:bg-[#25D366] hover:text-white',
    getUrl: (url, title) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`,
  },
  {
    name: 'Email',
    icon: <span className="material-symbols-outlined text-[20px]">mail</span>,
    color: 'hover:bg-gray-600 hover:text-white',
    getUrl: (url, title) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent('Check this out: ' + url)}`,
  },
  {
    name: 'SMS',
    icon: <span className="material-symbols-outlined text-[20px]">chat_bubble</span>,
    color: 'hover:bg-green-600 hover:text-white',
    getUrl: (url, title) => `sms:?body=${encodeURIComponent(title + ' ' + url)}`,
  },
];

const expiryOptions = [
  { label: '1 hour', value: '1h' },
  { label: '24 hours', value: '24h' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: 'Never', value: 'never' },
];

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  shareUrl,
  itemType = 'chart',
  onVisibilityChange,
  onPasswordSet,
  onExpiryChange,
  className,
}) => {
  const [visibility, setVisibility] = useState<ShareVisibility>('public');
  const [password, setPassword] = useState('');
  const [expiry, setExpiry] = useState('7d');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showExpiryDropdown, setShowExpiryDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Save the element that opened the modal before it opens
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen && triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  // Focus trap for WCAG 2.1 AA compliance
  const trapRef = useFocusTrap<HTMLDivElement>({
    active: isOpen,
    onEscape: onClose,
    autoFocusDelay: 150,
  });

  // Handle visibility change
  const handleVisibilityChange = useCallback(
    (newVisibility: ShareVisibility) => {
      setVisibility(newVisibility);
      onVisibilityChange?.(newVisibility);
    },
    [onVisibilityChange],
  );

  // Handle copy link
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      if (inputRef.current) {
        inputRef.current.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }, [shareUrl]);

  // Handle social share
  const handleSocialShare = useCallback(
    (social: SocialButton) => {
      const url = social.getUrl(shareUrl, title);
      window.open(url, '_blank', 'width=600,height=400');
    },
    [shareUrl, title],
  );

  // Handle expiry change
  const handleExpiryChange = useCallback(
    (newExpiry: string) => {
      setExpiry(newExpiry);
      onExpiryChange?.(newExpiry);
      setShowExpiryDropdown(false);
    },
    [onExpiryChange],
  );

  // Handle password change
  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      onPasswordSet?.(e.target.value);
    },
    [onPasswordSet],
  );

  // Focus trap handles Escape and initial focus via useFocusTrap

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

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
              'shadow-2xl shadow-purple-500/20',
              className,
            )}
            variants={modalVariants}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[20px] text-purple-400">share</span>
                <h2 id="share-modal-title" className="text-lg font-semibold text-white">
                  Share {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Link Settings */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Link Settings</h3>
                <div
                  className="space-y-2"
                  role="radiogroup"
                  aria-label="Link visibility"
                  onKeyDown={(e) => {
                    const options: ShareVisibility[] = ['public', 'private', 'password'];
                    const idx = options.indexOf(visibility);
                    let nextIdx: number;
                    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                      e.preventDefault();
                      nextIdx = (idx + 1) % options.length;
                    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                      e.preventDefault();
                      nextIdx = (idx - 1 + options.length) % options.length;
                    } else {
                      return;
                    }
                    handleVisibilityChange(options[nextIdx]);
                    const radios = (e.currentTarget as HTMLElement).querySelectorAll('[role="radio"]');
                    (radios[nextIdx] as HTMLElement)?.focus();
                  }}
                >
                  {/* Public */}
                  <button
                    role="radio"
                    aria-checked={visibility === 'public'}
                    tabIndex={visibility === 'public' ? 0 : -1}
                    onClick={() => handleVisibilityChange('public')}
                    className={clsx(
                      'flex items-center w-full p-3 rounded-lg border transition-all',
                      visibility === 'public'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10',
                    )}
                  >
                    <GlobeAltIcon
                      className={clsx(
                        'w-5 h-5 mr-3',
                        visibility === 'public' ? 'text-purple-400' : 'text-gray-400',
                      )}
                    />
                    <div className="text-left">
                      <p
                        className={clsx(
                          'text-sm font-medium',
                          visibility === 'public' ? 'text-white' : 'text-gray-300',
                        )}
                      >
                        Public
                      </p>
                      <p className="text-xs text-gray-500">Anyone with the link can view</p>
                    </div>
                    <div
                      className={clsx(
                        'ml-auto w-4 h-4 rounded-full border-2',
                        visibility === 'public'
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-500',
                      )}
                    >
                      {visibility === 'public' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Private */}
                  <button
                    role="radio"
                    aria-checked={visibility === 'private'}
                    tabIndex={visibility === 'private' ? 0 : -1}
                    onClick={() => handleVisibilityChange('private')}
                    className={clsx(
                      'flex items-center w-full p-3 rounded-lg border transition-all',
                      visibility === 'private'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10',
                    )}
                  >
                    <LockClosedIcon
                      className={clsx(
                        'w-5 h-5 mr-3',
                        visibility === 'private' ? 'text-purple-400' : 'text-gray-400',
                      )}
                    />
                    <div className="text-left">
                      <p
                        className={clsx(
                          'text-sm font-medium',
                          visibility === 'private' ? 'text-white' : 'text-gray-300',
                        )}
                      >
                        Private
                      </p>
                      <p className="text-xs text-gray-500">Requires login to view</p>
                    </div>
                    <div
                      className={clsx(
                        'ml-auto w-4 h-4 rounded-full border-2',
                        visibility === 'private'
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-500',
                      )}
                    >
                      {visibility === 'private' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Password Protected */}
                  <button
                    role="radio"
                    aria-checked={visibility === 'password'}
                    tabIndex={visibility === 'password' ? 0 : -1}
                    onClick={() => handleVisibilityChange('password')}
                    className={clsx(
                      'flex items-center w-full p-3 rounded-lg border transition-all',
                      visibility === 'password'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10',
                    )}
                  >
                    <KeyIcon
                      className={clsx(
                        'w-5 h-5 mr-3',
                        visibility === 'password' ? 'text-purple-400' : 'text-gray-400',
                      )}
                    />
                    <div className="text-left flex-1">
                      <p
                        className={clsx(
                          'text-sm font-medium',
                          visibility === 'password' ? 'text-white' : 'text-gray-300',
                        )}
                      >
                        Password Protected
                      </p>
                      <p className="text-xs text-gray-500">Requires password to view</p>
                    </div>
                    <div
                      className={clsx(
                        'ml-auto w-4 h-4 rounded-full border-2',
                        visibility === 'password'
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-500',
                      )}
                    >
                      {visibility === 'password' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Password Input */}
                  <AnimatePresence>
                    {visibility === 'password' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <input
                          type="text"
                          value={password}
                          onChange={handlePasswordChange}
                          placeholder="Enter password"
                          aria-label="Share link password"
                          className="w-full mt-2 px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Share Link */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Share Link</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <span className="material-symbols-outlined text-[16px] text-gray-500 absolute left-3 top-1/2 -translate-y-1/2">link</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={shareUrl}
                      readOnly
                      aria-label="Share link URL"
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-800 border border-white/10 text-white text-sm truncate focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    onClick={() => void handleCopy()}
                    className={clsx(
                      'flex items-center px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white',
                    )}
                  >
                    {copied ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] mr-1.5">check</span>
                        Copied
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px] mr-1.5">content_copy</span>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Sharing */}
              <div>
                <div className="flex items-center mb-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="px-3 text-sm text-gray-500">or share via</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="flex justify-center space-x-2">
                  {socialButtons.map((social) => (
                    <button
                      key={social.name}
                      onClick={() => handleSocialShare(social)}
                      className={clsx(
                        'p-3 rounded-full bg-white/5 text-gray-400 transition-all',
                        social.color,
                      )}
                      aria-label={`Share on ${social.name}`}
                    >
                      {social.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Code Option */}
              <div>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="flex items-center justify-between w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300"
                >
                  <span className="flex items-center">
                    <span className="material-symbols-outlined text-[20px] mr-2 text-purple-400">qr_code_2</span>
                    Show QR Code
                  </span>
                  <span className="text-xs text-gray-500">For mobile scanning</span>
                </button>

                <AnimatePresence>
                  {showQR && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-4 rounded-lg bg-white flex items-center justify-center">
                        {/* Placeholder for QR code - in real implementation, use a QR library */}
                        <div
                          className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center"
                          role="img"
                          aria-label="QR code for sharing"
                        >
                          <span className="material-symbols-outlined text-[96px] text-gray-300" aria-hidden="true">qr_code_2</span>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 text-center">
                        Scan with your phone camera to open
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Expiry Setting */}
              <div className="relative">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="flex items-center text-sm text-gray-300">
                    <span className="material-symbols-outlined text-[16px] mr-2 text-gray-500">schedule</span>
                    Link expires:
                  </span>
                  <button
                    onClick={() => setShowExpiryDropdown(!showExpiryDropdown)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {expiryOptions.find((opt) => opt.value === expiry)?.label}
                  </button>
                </div>

                <AnimatePresence>
                  {showExpiryDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-0 right-0 mb-1 p-1 rounded-lg bg-gray-800 border border-white/10 shadow-xl"
                      role="listbox"
                      aria-label="Link expiry"
                      onKeyDown={(e) => {
                        const idx = expiryOptions.findIndex((o) => o.value === expiry);
                        let nextIdx: number;
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          nextIdx = (idx + 1) % expiryOptions.length;
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          nextIdx = (idx - 1 + expiryOptions.length) % expiryOptions.length;
                        } else {
                          return;
                        }
                        handleExpiryChange(expiryOptions[nextIdx].value);
                        const opts = (e.currentTarget as HTMLElement).querySelectorAll('[role="option"]');
                        (opts[nextIdx] as HTMLElement)?.focus();
                      }}
                    >
                      {expiryOptions.map((option) => (
                        <button
                          key={option.value}
                          role="option"
                          aria-selected={expiry === option.value}
                          tabIndex={expiry === option.value ? 0 : -1}
                          onClick={() => handleExpiryChange(option.value)}
                          className={clsx(
                            'w-full px-3 py-2 text-left text-sm rounded transition-colors',
                            expiry === option.value
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'text-gray-300 hover:bg-white/5',
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-white/10 bg-gray-900/50">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleCopy()}
                className="flex items-center px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] mr-1.5">content_copy</span>
                Copy Link
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
