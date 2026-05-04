/**
 * Birthday Sharing Component
 * Share solar return readings as gifts
 */

import React, { useState } from 'react';
import api from '../services/api';

interface SolarReturnInterpretation {
  themes?: string[];
  sunHouse?: { interpretation: string };
  [key: string]: unknown;
}

interface SolarReturnData {
  id: string;
  year: number;
  returnDate: string;
  interpretation: SolarReturnInterpretation;
}

interface _SharedLink {
  id: string;
  url: string;
  expiresAt: string;
  accessCount: number;
  maxAccesses: number;
}

interface BirthdaySharingProps {
  solarReturn: SolarReturnData;
  recipientEmail?: string;
  onShare?: () => void;
}

export const BirthdaySharing: React.FC<BirthdaySharingProps> = ({
  solarReturn,
  recipientEmail,
  onShare,
}) => {
  const [shareMethod, setShareMethod] = useState<'link' | 'email'>('link');
  const [linkSettings, setLinkSettings] = useState({
    expiresIn: '30', // days
    maxAccesses: 10,
    requirePassword: false,
    password: '',
  });
  const [emailSettings, setEmailSettings] = useState({
    to: recipientEmail ?? '',
    subject: `Your Solar Return Reading for ${solarReturn.year}`,
    message: `I thought you'd enjoy seeing your solar return reading for ${solarReturn.year}. This astrological forecast highlights the themes and energies for your birthday year.`,
    includeChart: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post(`/v1/solar-returns/${solarReturn.id}/share`, {
        type: 'link',
        expiresInDays: parseInt(linkSettings.expiresIn),
        maxAccesses: linkSettings.maxAccesses,
        requirePassword: linkSettings.requirePassword,
        password: linkSettings.password,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      setGeneratedLink(response.data.data.url);
      setSuccess(true);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      setError(errorObj.response?.data?.error?.message ?? 'Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setLoading(true);
      setError(null);

      await api.post(`/v1/solar-returns/${solarReturn.id}/share/email`, {
        to: emailSettings.to,
        subject: emailSettings.subject,
        message: emailSettings.message,
        includeChart: emailSettings.includeChart,
      });

      setSuccess(true);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string } } } };
      setError(errorObj.response?.data?.error?.message ?? 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (generatedLink) {
      try {
        await navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const getShareablePreview = () => {
    const { interpretation, year, returnDate } = solarReturn;

    return (
      <div className="rounded-xl border border-cosmic-border bg-white/15 p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-primary" aria-hidden="true" style={{ fontSize: '24px' }}>card_giftcard</span>
          <div>
            <h3 className="font-semibold text-slate-200 text-lg">Solar Return Reading for {year}</h3>
            <p className="text-sm text-slate-200">
              {new Date(returnDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {interpretation && (
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-slate-200 mb-1">Themes for {year}:</h4>
              <div className="flex flex-wrap gap-2">
                {interpretation.themes?.slice(0, 4).map((theme: string, i: number) => (
                  <span key={i} className="inline-block rounded-full bg-primary/20 px-3 py-1 text-sm text-primary">{theme}</span>
              ))}
              {interpretation.themes && interpretation.themes.length > 4 && (
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-sm text-slate-200">+{interpretation.themes.length - 4} more</span>
              )}
            </div>
            </div>

            {interpretation.sunHouse && (
              <div>
                <h4 className="font-medium text-slate-200 mb-1">Your Focus:</h4>
                <p className="text-sm text-slate-200">{interpretation.sunHouse.interpretation.slice(0, 150)}...</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-cosmic-border">
          <p className="flex items-center gap-2 text-xs text-slate-200">
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '14px' }}>lock</span>
            This is a gift from a friend who cares about your journey.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div role="region" aria-label="Birthday Sharing" className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary" aria-hidden="true" style={{ fontSize: '32px' }}>card_giftcard</span>
        <div>
          <h2 className="text-xl font-bold text-slate-200">Share as Gift</h2>
          <p className="text-sm text-slate-200">Send this solar return reading to someone special</p>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Preview</h3>
        {getShareablePreview()}
      </div>

      {/* Success Message */}
      {success && !generatedLink && (
        <div aria-live="polite" className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 mb-4">
          <span className="material-symbols-outlined text-green-400 flex-shrink-0" aria-hidden="true" style={{ fontSize: '20px' }}>check</span>
          <div>
            <strong className="text-green-300">Success!</strong>
            <p className="text-sm text-green-400">{shareMethod === 'email' ? 'Email sent successfully!' : 'Link generated!'}</p>
          </div>
          <button
            onClick={() => {
              setSuccess(false);
              if (onShare) onShare();
            }}
            className="ml-auto rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 mb-4 text-red-400">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300 font-bold">✕</button>
        </div>
      )}

      {/* Share Method Selection */}
      {!success && (
        <>
          <div className="flex gap-2 mb-6">
            <button
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                shareMethod === 'link'
                  ? 'bg-primary text-white'
                  : 'bg-white/15 text-slate-200 hover:bg-white/15'
              }`}
              onClick={() => setShareMethod('link')}
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>link</span>
              Share Link
            </button>
            <button
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                shareMethod === 'email'
                  ? 'bg-primary text-white'
                  : 'bg-white/15 text-slate-200 hover:bg-white/15'
              }`}
              onClick={() => setShareMethod('email')}
            >
              <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>mail</span>
              Send Email
            </button>
          </div>

          {/* Link Sharing */}
          {shareMethod === 'link' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Link Settings</h3>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-200">Link Expiration</label>
                <select
                  value={linkSettings.expiresIn}
                  onChange={(e) => setLinkSettings({ ...linkSettings, expiresIn: e.target.value })}
                  aria-label="Link expiration period"
                  className="w-full rounded-lg border border-cosmic-border bg-cosmic-card px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-200">Maximum Accesses</label>
                <select
                  value={linkSettings.maxAccesses}
                  onChange={(e) => setLinkSettings({ ...linkSettings, maxAccesses: parseInt(e.target.value) })}
                  aria-label="Maximum number of accesses"
                  className="w-full rounded-lg border border-cosmic-border bg-cosmic-card px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={1}>1 time</option>
                  <option value={5}>5 times</option>
                  <option value={10}>10 times</option>
                  <option value={25}>25 times</option>
                  <option value={999}>Unlimited</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requirePassword"
                  checked={linkSettings.requirePassword}
                  onChange={(e) => setLinkSettings({ ...linkSettings, requirePassword: e.target.checked })}
                  className="h-4 w-4 rounded border-cosmic-border text-primary focus:ring-primary"
                />
                <label htmlFor="requirePassword" className="text-sm text-slate-200">Require password</label>
              </div>

              {linkSettings.requirePassword && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-200">Password</label>
                  <input
                    type="password"
                    value={linkSettings.password}
                    onChange={(e) => setLinkSettings({ ...linkSettings, password: e.target.value })}
                    placeholder="Enter password"
                    aria-required="true"
                    aria-label="Share link password"
                    className="w-full rounded-lg border border-cosmic-border bg-cosmic-card px-3 py-2 text-sm text-white placeholder:text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}

              <button
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={handleGenerateLink}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>share</span>
                <span aria-live="polite">{loading ? 'Generating...' : 'Generate Link'}</span>
              </button>

              {generatedLink && (
                <div className="space-y-3 rounded-xl border border-cosmic-border bg-white/15 p-4">
                  <label htmlFor="share-link-input" className="block text-sm font-medium text-slate-200">Your Share Link:</label>
                  <div className="flex gap-2">
                    <input
                      id="share-link-input"
                      type="text"
                      value={generatedLink}
                      readOnly
                      title="Generated share link"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="flex-1 rounded-lg border border-cosmic-border bg-cosmic-card px-3 py-2 text-sm text-white"
                    />
                    {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                    <button onClick={handleCopyLink} className="flex items-center gap-1 rounded-lg border border-cosmic-border bg-cosmic-card px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/15 transition-colors">
                      {copied ? <span className="material-symbols-outlined text-green-400" aria-hidden="true" style={{ fontSize: '18px' }}>check</span> : <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>content_copy</span>}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <div className="space-y-1 text-xs text-slate-200">
                    <p className="flex items-center gap-1"><span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '14px' }}>calendar_today</span> Expires: {linkSettings.expiresIn} days</p>
                    <p className="flex items-center gap-1"><span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '14px' }}>lock</span> Max accesses: {linkSettings.maxAccesses === 999 ? 'Unlimited' : linkSettings.maxAccesses}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email Sharing */}
          {shareMethod === 'email' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Email Settings</h3>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-200">Recipient Email</label>
                <input
                  type="email"
                  value={emailSettings.to}
                  onChange={(e) => setEmailSettings({ ...emailSettings, to: e.target.value })}
                  placeholder="friend@example.com"
                  aria-required="true"
                  aria-label="Recipient email address"
                  required
                  className="w-full rounded-lg border border-cosmic-border bg-cosmic-card px-3 py-2 text-sm text-white placeholder:text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-200">Subject</label>
                <input
                  type="text"
                  value={emailSettings.subject}
                  onChange={(e) => setEmailSettings({ ...emailSettings, subject: e.target.value })}
                  placeholder="Your Solar Return Reading"
                  className="w-full rounded-lg border border-cosmic-border bg-cosmic-card px-3 py-2 text-sm text-white placeholder:text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-200">Personal Message</label>
                <textarea
                  value={emailSettings.message}
                  onChange={(e) => setEmailSettings({ ...emailSettings, message: e.target.value })}
                  placeholder="Add a personal message..."
                  rows={4}
                  className="w-full rounded-lg border border-cosmic-border bg-cosmic-card px-3 py-2 text-sm text-white placeholder:text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeChart"
                  checked={emailSettings.includeChart}
                  onChange={(e) => setEmailSettings({ ...emailSettings, includeChart: e.target.checked })}
                  className="h-4 w-4 rounded border-cosmic-border text-primary focus:ring-primary"
                />
                <label htmlFor="includeChart" className="text-sm text-slate-200">Include chart visualization</label>
              </div>

              <button
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={handleSendEmail}
                disabled={loading || !emailSettings.to}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: '18px' }}>mail</span>
                <span aria-live="polite">{loading ? 'Sending...' : 'Send Email'}</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BirthdaySharing;
