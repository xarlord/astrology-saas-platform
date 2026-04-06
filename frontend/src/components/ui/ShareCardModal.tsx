/**
 * ShareCardModal Component
 *
 * Modal for selecting and exporting shareable chart cards.
 * Features live template preview, cosmic selection effects, and PNG export.
 *
 * Interaction Design:
 * - Modal opens with scale/fade animation
 * - Template cards have "cosmic glow" on selection
 * - Preview updates with smooth crossfade
 * - Download shows checkmark feedback
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import ShareableChartCard, {
  type ShareableChartCardProps,
  CARD_SIZES,
} from '../chart/ShareableChartCard';

// ============================================================================
// TYPES
// ============================================================================

export type CardTemplate = 'instagram-story' | 'twitter' | 'pinterest' | 'square' | 'daily-insight';

export interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartData: ShareableChartCardProps;
  className?: string;
}

interface TemplateOption {
  id: CardTemplate;
  label: string;
  dimensions: string;
  previewSize: { width: number; height: number };
}

// ============================================================================
// TEMPLATE OPTIONS
// ============================================================================

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'instagram-story',
    label: 'Story',
    dimensions: '9:16',
    previewSize: { width: 108, height: 192 },
  },
  {
    id: 'twitter',
    label: 'Twitter',
    dimensions: '16:9',
    previewSize: { width: 160, height: 90 },
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    dimensions: '2:3',
    previewSize: { width: 120, height: 180 },
  },
  {
    id: 'square',
    label: 'Square',
    dimensions: '1:1',
    previewSize: { width: 140, height: 140 },
  },
  {
    id: 'daily-insight',
    label: 'Insight',
    dimensions: '1.9:1',
    previewSize: { width: 180, height: 94 },
  },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Template preview card with cosmic selection effect */
function TemplatePreview({
  template,
  isSelected,
  onClick,
  chartData,
}: {
  template: TemplateOption;
  isSelected: boolean;
  onClick: () => void;
  chartData: ShareableChartCardProps;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={clsx(
        'relative rounded-xl overflow-hidden transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent',
        isSelected
          ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-[#0B0D17] shadow-lg shadow-purple-500/50'
          : 'ring-1 ring-white/10 hover:ring-white/30 opacity-60 hover:opacity-100',
      )}
      whileHover={{ scale: isSelected ? 1.02 : 1.05 }}
      whileTap={{ scale: 0.98 }}
      style={{
        width: template.previewSize.width,
        height: template.previewSize.height,
      }}
    >
      {/* Mini card preview */}
      <div className="w-full h-full">
        <ShareableChartCard {...chartData} template={template.id} />
      </div>

      {/* Selection glow overlay */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-amber-500/20 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
        <div className="text-[10px] font-medium text-white text-center">
          {template.label}
        </div>
        <div className="text-[8px] text-gray-400 text-center">
          {template.dimensions}
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1.5 right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[12px] text-white">check</span>
        </motion.div>
      )}
    </motion.button>
  );
}

/** Download button with feedback animation */
function DownloadButton({
  state,
  onClick,
  disabled,
}: {
  state: 'idle' | 'rendering' | 'success' | 'error';
  onClick: () => void;
  disabled: boolean;
}) {
  const isSuccess = state === 'success';
  const isError = state === 'error';
  const isRendering = state === 'rendering';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || isRendering}
      className={clsx(
        'flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all',
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#0B0D17]',
        isSuccess
          ? 'bg-green-500 text-white'
          : isError
            ? 'bg-red-500 text-white'
            : 'bg-purple-500 hover:bg-purple-600 text-white disabled:bg-white/10 disabled:text-gray-500',
      )}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {isRendering ? (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="material-symbols-outlined text-[18px]"
          >
            hourglass_empty
          </motion.span>
          <span>Generating...</span>
        </>
      ) : isSuccess ? (
        <>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="material-symbols-outlined text-[18px]"
          >
            check_circle
          </motion.span>
          <span>Downloaded!</span>
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Download PNG</span>
        </>
      )}
    </motion.button>
  );
}

/** Share button for Web Share API */
function ShareButton({
  state,
  onClick,
  disabled,
  hasShareAPI,
}: {
  state: 'idle' | 'rendering' | 'error';
  onClick: () => void;
  disabled: boolean;
  hasShareAPI: boolean;
}) {
  if (!hasShareAPI) return null;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || state === 'rendering'}
      className={clsx(
        'flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all',
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#0B0D17]',
        state === 'error'
          ? 'bg-red-500/20 text-red-400 border border-red-500/50'
          : 'bg-white/10 hover:bg-white/15 text-white border border-white/20 disabled:bg-white/5 disabled:text-gray-500',
      )}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {state === 'rendering' ? (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="material-symbols-outlined text-[18px]"
          >
            hourglass_empty
          </motion.span>
          <span>Generating...</span>
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-[18px]">share</span>
          <span>Share</span>
        </>
      )}
    </motion.button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  chartData,
  className = '',
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>('instagram-story');
  const [exportState, setExportState] = useState<'idle' | 'rendering' | 'success' | 'error'>('idle');
  const [shareState, setShareState] = useState<'idle' | 'rendering' | 'error'>('idle');

  const trapRef = useFocusTrap<HTMLDivElement>({
    active: isOpen,
    onEscape: onClose,
    autoFocusDelay: 150,
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const hiddenCardRef = useRef<HTMLDivElement>(null);

  // Check for Web Share API support
  const hasShareAPI = typeof navigator !== 'undefined' && 'share' in navigator;

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate('instagram-story');
      setExportState('idle');
      setShareState('idle');
    }
  }, [isOpen]);

  // Handle template selection
  const handleTemplateSelect = useCallback((template: CardTemplate) => {
    setSelectedTemplate(template);
    setExportState('idle');
    setShareState('idle');
  }, []);

  // Handle download
  const handleDownload = useCallback(async () => {
    if (!previewRef.current) return;

    setExportState('rendering');

    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;

      // Wait for fonts to be ready
      await document.fonts.ready;

      // Generate PNG at 2x scale for retina displays
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: '#0B0D17',
        logging: false,
        useCORS: true,
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `astroverse-${chartData.name.toLowerCase().replace(/\s+/g, '-')}-${selectedTemplate}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success state briefly
      setExportState('success');
      setTimeout(() => setExportState('idle'), 2000);
    } catch (error) {
      console.error('Failed to generate image:', error);
      setExportState('error');
      setTimeout(() => setExportState('idle'), 3000);
    }
  }, [chartData.name, selectedTemplate]);

  // Handle native share
  const handleShare = useCallback(async () => {
    if (!previewRef.current || !hasShareAPI) return;

    setShareState('rendering');

    try {
      const html2canvas = (await import('html2canvas')).default;
      await document.fonts.ready;

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: '#0B0D17',
        logging: false,
        useCORS: true,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const file = new File(
        [blob],
        `astroverse-${chartData.name}-${selectedTemplate}.png`,
        { type: 'image/png' },
      );

      await navigator.share({
        title: `${chartData.name}'s Birth Chart`,
        text: `Check out ${chartData.name}'s astrological birth chart on AstroVerse!`,
        files: [file],
      });

      // Close modal after successful share
      onClose();
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to share:', error);
        setShareState('error');
        setTimeout(() => setShareState('idle'), 3000);
      }
    }
  }, [chartData.name, selectedTemplate, hasShareAPI, onClose]);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
            variants={backdropVariants}
          />

          {/* Modal */}
          <motion.div
            ref={trapRef}
            className={clsx(
              'relative w-full max-w-4xl rounded-2xl overflow-hidden',
              'bg-gradient-to-br from-[#0B0D17] via-[#141627] to-[#1a1d3a]',
              'backdrop-blur-xl border border-white/10',
              'shadow-2xl shadow-purple-500/20',
              className,
            )}
            variants={modalVariants}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-card-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px] text-purple-400">
                  photo_library
                </span>
                <div>
                  <h2 id="share-card-title" className="text-lg font-semibold text-white">
                    Share Card
                  </h2>
                  <p className="text-xs text-gray-400">
                    Choose a template for <span className="text-purple-400">{chartData.name}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row h-[600px] lg:h-[500px]">
              {/* Left: Template Grid */}
              <div className="lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                  Select Template
                </h3>

                {/* Template Grid */}
                <div
                  className="grid grid-cols-2 gap-3"
                  role="radiogroup"
                  aria-label="Card templates"
                >
                  {TEMPLATE_OPTIONS.map((template) => (
                    <div key={template.id} className="flex flex-col items-center">
                      <TemplatePreview
                        template={template}
                        isSelected={selectedTemplate === template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        chartData={chartData}
                      />
                    </div>
                  ))}
                </div>

                {/* Template Info */}
                <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400">Selected Size</span>
                    <span className="text-xs font-bold text-purple-400">
                      {CARD_SIZES[selectedTemplate].width} × {CARD_SIZES[selectedTemplate].height}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">Aspect Ratio</span>
                    <span className="text-xs font-bold text-white">
                      {CARD_SIZES[selectedTemplate].aspectRatio}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Large Preview */}
              <div className="lg:w-2/3 p-6 flex flex-col">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  Preview
                </h3>

                {/* Preview Area */}
                <div className="flex-1 flex items-center justify-center bg-black/40 rounded-xl p-4 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedTemplate}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="max-w-full max-h-full"
                      style={{
                        maxWidth: '400px',
                        maxHeight: '500px',
                        aspectRatio: CARD_SIZES[selectedTemplate].aspectRatio,
                      }}
                    >
                      <div ref={previewRef} className="w-full h-full">
                        <ShareableChartCard {...chartData} template={selectedTemplate} />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl font-semibold text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <ShareButton
                    state={shareState}
                    onClick={handleShare}
                    disabled={exportState === 'rendering'}
                    hasShareAPI={hasShareAPI}
                  />
                  <DownloadButton
                    state={exportState}
                    onClick={handleDownload}
                    disabled={shareState === 'rendering'}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareCardModal;
