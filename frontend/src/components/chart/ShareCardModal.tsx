/**
 * ShareCardModal Component
 *
 * Modal for generating and sharing chart cards.
 * Lets users pick a template, select planets, customize insight text,
 * then generates a card via the backend API and offers sharing options.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import { Modal } from '../ui/Modal';
import { cardService } from '@/services/card.service';
import type {
  CardTemplate,
  CardPlanet,
  GeneratedCard,
  CardStyle,
  CardColorTheme,
} from '@/types/card.types';
import { CARD_TEMPLATES, CARD_STYLES, CARD_COLOR_THEMES } from '@/types/card.types';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartId: string;
  chartName?: string;
}

const DEFAULT_PLANETS: CardPlanet[] = ['sun', 'moon', 'ascendant'];

const ALL_PLANETS: { id: CardPlanet; label: string }[] = [
  { id: 'sun', label: 'Sun' },
  { id: 'moon', label: 'Moon' },
  { id: 'ascendant', label: 'Rising' },
  { id: 'mercury', label: 'Mercury' },
  { id: 'venus', label: 'Venus' },
  { id: 'mars', label: 'Mars' },
  { id: 'jupiter', label: 'Jupiter' },
  { id: 'saturn', label: 'Saturn' },
  { id: 'uranus', label: 'Uranus' },
  { id: 'neptune', label: 'Neptune' },
  { id: 'pluto', label: 'Pluto' },
  { id: 'north_node', label: 'North Node' },
  { id: 'chiron', label: 'Chiron' },
];

type Step = 'configure' | 'generating' | 'ready';

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  chartId,
  chartName,
}) => {
  const [step, setStep] = useState<Step>('configure');
  const [template, setTemplate] = useState<CardTemplate>('instagram_story');
  const [selectedPlanets, setSelectedPlanets] = useState<CardPlanet[]>(DEFAULT_PLANETS);
  const [insightText, setInsightText] = useState('');
  const [showInsight, setShowInsight] = useState(true);
  const [generatedCard, setGeneratedCard] = useState<GeneratedCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // New state for style presets and color themes
  const [selectedStyle, setSelectedStyle] = useState<CardStyle>('cosmic');
  const [selectedColorTheme, setSelectedColorTheme] = useState<CardColorTheme>('midnight_purple');

  // Rate limiting state
  const [rateLimit, setRateLimit] = useState<{
    count: number;
    limit: number;
    remaining: number;
    resetAt: string;
  } | null>(null);

  // Load rate limit status when modal opens
  useEffect(() => {
    if (isOpen) {
      cardService
        .getRateLimitStatus()
        .then(setRateLimit)
        .catch(() => {
          // If rate limit endpoint doesn't exist yet, set default
          setRateLimit({ count: 0, limit: 10, remaining: 10, resetAt: '' });
        });
    }
  }, [isOpen]);

  const handlePlanetToggle = useCallback((planet: CardPlanet) => {
    setSelectedPlanets((prev) => {
      if (prev.includes(planet)) {
        if (prev.length <= 3) return prev; // minimum 3
        return prev.filter((p) => p !== planet);
      }
      if (prev.length >= 5) return prev; // maximum 5
      return [...prev, planet];
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    try {
      setStep('generating');
      setError(null);
      const card = await cardService.generateCard({
        chart_id: chartId,
        template,
        style: selectedStyle,
        color_theme: selectedColorTheme,
        planet_placements: selectedPlanets,
        show_insight: showInsight,
        insight_text: insightText || undefined,
      });
      setGeneratedCard(card);
      // Update rate limit after generation
      const updatedRateLimit = await cardService.getRateLimitStatus().catch(() => rateLimit);
      setRateLimit(updatedRateLimit);
      setStep('ready');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to generate card. Please try again.';
      setError(message);
      setStep('configure');
    }
  }, [
    chartId,
    template,
    selectedStyle,
    selectedColorTheme,
    selectedPlanets,
    showInsight,
    insightText,
    rateLimit,
  ]);

  const handleCopyLink = useCallback(async () => {
    if (!generatedCard) return;
    const shareUrl = `${window.location.origin}/share/${generatedCard.share_token}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [generatedCard]);

  const handleDownload = useCallback(() => {
    if (!generatedCard?.image_url) return;
    const link = document.createElement('a');
    link.href = generatedCard.image_url;
    link.download = `${chartName ?? 'chart'}-card.png`;
    link.click();
  }, [generatedCard, chartName]);

  const handleWebShare = useCallback(async () => {
    if (!generatedCard || !navigator.share) return;
    const currentShareUrl = `${window.location.origin}/share/${generatedCard.share_token}`;
    try {
      await navigator.share({
        title: generatedCard.og_title || 'My Astrology Chart',
        text: generatedCard.og_description || 'Check out my cosmic placements!',
        url: currentShareUrl,
      });
    } catch {
      // User cancelled or share failed
    }
  }, [generatedCard]);

  const handleTwitterShare = useCallback(() => {
    const text = encodeURIComponent(generatedCard?.og_title ?? 'My Astrology Chart');
    const currentShareUrl = generatedCard
      ? `${window.location.origin}/share/${generatedCard.share_token}`
      : '';
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(currentShareUrl)}`,
      '_blank',
      'noopener',
    );
  }, [generatedCard]);

  const handleWhatsAppShare = useCallback(() => {
    const currentShareUrl = generatedCard
      ? `${window.location.origin}/share/${generatedCard.share_token}`
      : '';
    const text = encodeURIComponent(
      `${generatedCard?.og_title ?? 'My Astrology Chart'} ${currentShareUrl}`,
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
  }, [generatedCard]);

  const handleFacebookShare = useCallback(() => {
    const currentShareUrl = generatedCard
      ? `${window.location.origin}/share/${generatedCard.share_token}`
      : '';
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentShareUrl)}`,
      '_blank',
      'noopener',
    );
  }, [generatedCard]);

  const handleInstagramShare = useCallback(() => {
    // Instagram doesn't have a direct web share API
    // Download the image and prompt user to share manually
    if (generatedCard?.image_url) {
      handleDownload();
      alert('Image downloaded! Open Instagram and share this image from your gallery.');
    } else {
      alert(
        'Please wait for the card image to be generated, then download and share to Instagram.',
      );
    }
  }, [generatedCard, handleDownload]);

  const handleClose = useCallback(() => {
    setStep('configure');
    setGeneratedCard(null);
    setError(null);
    setInsightText('');
    setShowInsight(true);
    setSelectedPlanets(DEFAULT_PLANETS);
    setTemplate('instagram_story');
    setSelectedStyle('cosmic');
    setSelectedColorTheme('midnight_purple');
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Shareable Card"
      size="lg"
      footer={
        step === 'configure' ? (
          <button
            type="button"
            onClick={() => void handleGenerate()}
            className="flex items-center px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] mr-2">auto_awesome</span>
            Generate Card
          </button>
        ) : step === 'ready' ? (
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
          >
            Done
          </button>
        ) : undefined
      }
    >
      {step === 'configure' && (
        <div className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Rate Limiting UI */}
          {rateLimit && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">speed</span>
                <span>
                  Daily generations: {rateLimit.count}/{rateLimit.limit}
                </span>
              </div>
              <div className="text-xs text-blue-500 dark:text-blue-400">
                {rateLimit.remaining} remaining today
              </div>
            </div>
          )}

          {/* Style Preset Picker */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Choose Style
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {CARD_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  className={clsx(
                    'flex flex-col items-center p-4 rounded-lg border-2 transition-all text-center',
                    selectedStyle === style.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                  )}
                >
                  <span className="text-2xl mb-2">{style.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {style.label}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1">{style.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Theme Picker */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Choose Color Theme
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {CARD_COLOR_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedColorTheme(theme.id)}
                  className={clsx(
                    'flex flex-col items-center p-3 rounded-lg border-2 transition-all text-center',
                    selectedColorTheme === theme.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-full mb-2"
                    style={{ background: theme.gradient }}
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {theme.label}
                  </span>
                  <span className="text-[10px] text-gray-500">{theme.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Template Picker */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Choose Template
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {CARD_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={clsx(
                    'flex flex-col items-center p-3 rounded-lg border-2 transition-all text-center',
                    template === t.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                  )}
                >
                  <span className="text-xl mb-1">{t.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {t.label}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {t.width}x{t.height}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Planet Placements */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Planet Placements
              <span className="text-gray-500 ml-1">(3-5 planets)</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {ALL_PLANETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePlanetToggle(p.id)}
                  disabled={!selectedPlanets.includes(p.id) && selectedPlanets.length >= 5}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    selectedPlanets.includes(p.id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Insight Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cosmic Insight
              </h3>
              <label className="flex items-center gap-2 text-xs text-gray-500">
                <input
                  type="checkbox"
                  checked={showInsight}
                  onChange={(e) => setShowInsight(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Show on card
              </label>
            </div>
            {showInsight && (
              <textarea
                value={insightText}
                onChange={(e) => setInsightText(e.target.value)}
                placeholder="Leave empty for AI-generated insight..."
                rows={2}
                maxLength={200}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            )}
          </div>
        </div>
      )}

      {step === 'generating' && (
        <div className="flex flex-col items-center justify-center py-12">
          <span className="material-symbols-outlined text-[48px] text-purple-500 animate-spin mb-4">
            progress_activity
          </span>
          <p className="text-gray-600 dark:text-gray-400">Generating your card...</p>
          <p className="text-xs text-gray-500 mt-1">This may take a few seconds</p>
        </div>
      )}

      {step === 'ready' && generatedCard && (
        <div className="space-y-6">
          {/* Card Preview */}
          <div className="flex justify-center">
            {generatedCard.image_url ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
                <img
                  src={generatedCard.image_url}
                  alt={`${chartName ?? 'Chart'} shareable card`}
                  className="max-w-full max-h-[400px] object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500">
                <span className="material-symbols-outlined text-[48px] mb-2">image</span>
                <p className="text-sm">Image is being processed...</p>
                <p className="text-xs mt-1">Your share link is ready below</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Copy share link */}
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 truncate font-mono">
                {window.location.origin}/share/{generatedCard.share_token}
              </div>
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className={clsx(
                  'flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white',
                )}
              >
                {copied ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] mr-1.5">check</span>
                    Copied
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px] mr-1.5">
                      content_copy
                    </span>
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Download button */}
            {generatedCard.image_url && (
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center justify-center w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] mr-2">download</span>
                Download Image
              </button>
            )}

            {/* Web Share API (mobile) */}
            {typeof navigator.share === 'function' && (
              <button
                type="button"
                onClick={() => void handleWebShare()}
                className="flex items-center justify-center w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] mr-2">share</span>
                Share via...
              </button>
            )}

            {/* Social share buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleFacebookShare}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] text-sm font-medium transition-colors"
              >
                <span className="text-base">f</span>
                Facebook
              </button>
              <button
                type="button"
                onClick={handleInstagramShare}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-[#833AB4]/20 via-[#FD1D1D]/20 to-[#F77737]/20 hover:from-[#833AB4]/30 hover:via-[#FD1D1D]/30 hover:to-[#F77737]/30 text-[#E1306C] text-sm font-medium transition-colors"
              >
                <span className="text-base">📷</span>
                Instagram
              </button>
              <button
                type="button"
                onClick={handleTwitterShare}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] text-sm font-medium transition-colors"
              >
                <span className="text-base">𝕏</span>
                Twitter / X
              </button>
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-sm font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ShareCardModal;
