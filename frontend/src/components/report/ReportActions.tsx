/**
 * Report Actions Component
 *
 * Floating sidebar with PDF download, print, share, and other report actions
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useNotifications } from '../../hooks/useNotifications';

// Types
interface ReportActionsProps {
  onDownloadPDF?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onOrderPrint?: () => void;
  isGeneratingPDF?: boolean;
  currentTransit?: {
    title: string;
    description: string;
  };
}

const ReportActions: React.FC<ReportActionsProps> = ({
  onDownloadPDF,
  onPrint,
  onShare,
  onOrderPrint,
  isGeneratingPDF = false,
  currentTransit,
}) => {
  const [showTransit, setShowTransit] = useState(true);
  const { success } = useNotifications();

  const handleShare = () => {
    if (typeof navigator.share === 'function' && onShare) {
      onShare();
    } else {
      // Fallback for browsers that don't support Web Share API
      void navigator.clipboard.writeText(window.location.href);
      success('Link copied to clipboard!', 'Share');
    }
  };

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-primary/30 relative overflow-hidden sticky top-32"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute -top-4 -right-4 size-20 bg-primary/20 blur-2xl rounded-full"></div>

      <h4 className="text-white font-bold mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">diamond</span>
        Premium Actions
      </h4>

      <div className="space-y-3">
        <Button
          variant="primary"
          fullWidth
          onClick={onDownloadPDF}
          disabled={isGeneratingPDF}
          leftIcon={
            <span className="material-symbols-outlined text-[18px]">
              {isGeneratingPDF ? 'downloading' : 'download'}
            </span>
          }
        >
          {isGeneratingPDF ? 'Generating...' : 'Download PDF Report'}
        </Button>

        {onOrderPrint && (
          <Button
            variant="secondary"
            fullWidth
            onClick={onOrderPrint}
            leftIcon={<span className="material-symbols-outlined text-[18px]">print</span>}
          >
            Order Printed Chart
          </Button>
        )}

        {onPrint && (
          <Button
            variant="secondary"
            fullWidth
            onClick={onPrint}
            leftIcon={<span className="material-symbols-outlined text-[18px]">print</span>}
          >
            Print Report
          </Button>
        )}

        <Button
          variant="secondary"
          fullWidth
          onClick={() => {
            void handleShare();
          }}
          leftIcon={<span className="material-symbols-outlined text-[18px]">share</span>}
        >
          Share Report
        </Button>
      </div>

      {/* Current Transit Card */}
      {currentTransit && showTransit && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="bg-primary/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                Current Transit
              </p>
              <button
                onClick={() => setShowTransit(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-400">bolt</span>
              <div>
                <p className="text-xs text-white font-bold">{currentTransit.title}</p>
                <p className="text-[10px] text-slate-400">{currentTransit.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ReportActions;
