/**
 * Share Card Page
 * Public page for viewing a shared chart card by share token.
 * No authentication required.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { cardService } from '@/services/card.service';
import type { PublicCard, CardOGMetadata } from '@/types/card.types';
import { CARD_TEMPLATES } from '@/types/card.types';

export default function ShareCardPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [card, setCard] = useState<PublicCard | null>(null);
  const [ogMeta, setOgMeta] = useState<CardOGMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!shareToken) return;

    const loadCard = async () => {
      try {
        setIsLoading(true);
        const [cardData, ogData] = await Promise.all([
          cardService.getPublicCard(shareToken),
          cardService.getCardOGMetadata(shareToken).catch(() => null),
        ]);
        setCard(cardData);
        setOgMeta(ogData);
      } catch {
        setError('This card could not be found or has been removed.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadCard();
  }, [shareToken]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    if (!card?.image_url) return;
    const link = document.createElement('a');
    link.href = card.image_url;
    link.download = 'astroverse-card.png';
    link.click();
  };

  const templateInfo = card ? CARD_TEMPLATES.find((t) => t.id === card.template) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0D17] to-[#141627] text-white">
      {/* WCAG 2.1 AA - Skip Navigation Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      {/* OG Meta Tags for social previews */}
      {ogMeta && (
        <Helmet>
          <title>{ogMeta.title}</title>
          <meta name="description" content={ogMeta.description} />
          <meta property="og:title" content={ogMeta.title} />
          <meta property="og:description" content={ogMeta.description} />
          <meta property="og:url" content={ogMeta.url} />
          <meta property="og:type" content="website" />
          {ogMeta.imageUrl && (
            <>
              <meta property="og:image" content={ogMeta.imageUrl} />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={ogMeta.title} />
              <meta name="twitter:description" content={ogMeta.description} />
              <meta name="twitter:image" content={ogMeta.imageUrl} />
            </>
          )}
        </Helmet>
      )}
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span className="material-symbols-outlined text-[20px] text-purple-400">
              auto_awesome
            </span>
            <span className="font-semibold">AstroVerse</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleCopyLink()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors"
            >
              {copied ? (
                <>
                  <span className="material-symbols-outlined text-[14px] text-green-400">
                    check
                  </span>
                  <span className="text-green-400">Copied</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {card?.image_url && (
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">download</span>
                Download
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Loading card...</p>
          </div>
        ) : (error ?? !card) ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🌟</div>
            <h1 className="text-xl font-semibold mb-2">Card Not Found</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <Link
              to="/"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-medium transition-colors"
            >
              Go to AstroVerse
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Template badge */}
            {templateInfo && (
              <div className="mb-4 px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400">
                {templateInfo.icon} {templateInfo.label} &bull; {templateInfo.width}x
                {templateInfo.height}
              </div>
            )}

            {/* Card image */}
            {card.image_url ? (
              <div className="rounded-lg overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10">
                <img
                  src={card.image_url}
                  alt="Shared astrology chart card"
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 rounded-lg border border-white/10 bg-white/5">
                <span className="material-symbols-outlined text-[48px] text-purple-400 mb-4">
                  auto_awesome
                </span>
                <p className="text-gray-400">Card image is being generated</p>
                <p className="text-xs text-gray-500 mt-1">Check back in a moment</p>
              </div>
            )}

            {/* Insight text */}
            {card.show_insight && card.insight_text && (
              <div className="mt-6 max-w-lg text-center">
                <p className="text-sm italic text-gray-400">"{card.insight_text}"</p>
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-3">Get your own cosmic insights</p>
              <Link
                to={card?.referral_code ? `/register?ref=${card.referral_code}` : '/register'}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                Create Your Chart
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
