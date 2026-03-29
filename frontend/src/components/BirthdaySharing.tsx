/**
 * Birthday Sharing Component
 * Share solar return readings as gifts
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import React, { useState } from 'react';
import { Gift, Mail, Link, Copy, Check, Share2, Calendar, Lock } from 'lucide-react';
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

// @ts-expect-error - SharedLink interface reserved for future use
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
    to: recipientEmail || '',
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
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Gift size={24} className="text-purple-600" />
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">Solar Return Reading for {year}</h3>
            <p className="text-sm text-gray-500">
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
              <h4 className="font-medium text-gray-700 mb-1">Themes for {year}:</h4>
              <div className="flex flex-wrap gap-2">
                {interpretation.themes?.slice(0, 4).map((theme: string, i: number) => (
                  <span key={i} className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">{theme}</span>
              ))}
              {interpretation.themes && interpretation.themes.length > 4 && (
                <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-600">+{interpretation.themes.length - 4} more</span>
              )}
            </div>
            </div>

            {interpretation.sunHouse && (
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Your Focus:</h4>
                <p className="text-sm text-gray-600">{interpretation.sunHouse.interpretation.slice(0, 150)}...</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="flex items-center gap-2 text-xs text-gray-400">
            <Lock size={14} />
            This is a gift from a friend who cares about your journey.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Gift size={32} className="text-purple-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-800">Share as Gift</h2>
          <p className="text-sm text-gray-500">Send this solar return reading to someone special</p>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Preview</h3>
        {getShareablePreview()}
      </div>

      {/* Success Message */}
      {success && !generatedLink && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 mb-4">
          <Check size={20} className="text-green-600 flex-shrink-0" />
          <div>
            <strong className="text-green-800">Success!</strong>
            <p className="text-sm text-green-700">{shareMethod === 'email' ? 'Email sent successfully!' : 'Link generated!'}</p>
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
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 mb-4 text-red-700">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 font-bold">✕</button>
        </div>
      )}

      {/* Share Method Selection */}
      {!success && (
        <>
          <div className="flex gap-2 mb-6">
            <button
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                shareMethod === 'link'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setShareMethod('link')}
            >
              <Link size={18} />
              Share Link
            </button>
            <button
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                shareMethod === 'email'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setShareMethod('email')}
            >
              <Mail size={18} />
              Send Email
            </button>
          </div>

          {/* Link Sharing */}
          {shareMethod === 'link' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Link Settings</h3>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Link Expiration</label>
                <select
                  value={linkSettings.expiresIn}
                  onChange={(e) => setLinkSettings({ ...linkSettings, expiresIn: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Maximum Accesses</label>
                <select
                  value={linkSettings.maxAccesses}
                  onChange={(e) => setLinkSettings({ ...linkSettings, maxAccesses: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
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
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="requirePassword" className="text-sm text-gray-700">Require password</label>
              </div>

              {linkSettings.requirePassword && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={linkSettings.password}
                    onChange={(e) => setLinkSettings({ ...linkSettings, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              )}

              <button
                onClick={handleGenerateLink}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Share2 size={18} />
                {loading ? 'Generating...' : 'Generate Link'}
              </button>

              {generatedLink && (
                <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <label htmlFor="share-link-input" className="block text-sm font-medium text-gray-700">Your Share Link:</label>
                  <div className="flex gap-2">
                    <input
                      id="share-link-input"
                      type="text"
                      value={generatedLink}
                      readOnly
                      title="Generated share link"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                    />
                    <button onClick={handleCopyLink} className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                      {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <div className="space-y-1 text-xs text-gray-500">
                    <p className="flex items-center gap-1"><Calendar size={14} /> Expires: {linkSettings.expiresIn} days</p>
                    <p className="flex items-center gap-1"><Lock size={14} /> Max accesses: {linkSettings.maxAccesses === 999 ? 'Unlimited' : linkSettings.maxAccesses}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email Sharing */}
          {shareMethod === 'email' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Email Settings</h3>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Recipient Email</label>
                <input
                  type="email"
                  value={emailSettings.to}
                  onChange={(e) => setEmailSettings({ ...emailSettings, to: e.target.value })}
                  placeholder="friend@example.com"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  value={emailSettings.subject}
                  onChange={(e) => setEmailSettings({ ...emailSettings, subject: e.target.value })}
                  placeholder="Your Solar Return Reading"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Personal Message</label>
                <textarea
                  value={emailSettings.message}
                  onChange={(e) => setEmailSettings({ ...emailSettings, message: e.target.value })}
                  placeholder="Add a personal message..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeChart"
                  checked={emailSettings.includeChart}
                  onChange={(e) => setEmailSettings({ ...emailSettings, includeChart: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="includeChart" className="text-sm text-gray-700">Include chart visualization</label>
              </div>

              <button
                onClick={handleSendEmail}
                disabled={loading || !emailSettings.to}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail size={18} />
                {loading ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BirthdaySharing;
