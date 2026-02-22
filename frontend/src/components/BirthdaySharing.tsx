/**
 * Birthday Sharing Component
 * Share solar return readings as gifts
 */

import React, { useState } from 'react';
import { Gift, Mail, Link, Copy, Check, Share2, Calendar, Lock } from 'lucide-react';
import axios from 'axios';
import { TIMEOUTS } from '../utils/constants';
import './BirthdaySharing.css';

interface SolarReturnData {
  id: string;
  year: number;
  returnDate: string;
  interpretation: {
    themes?: string[];
    sunHouse?: { interpretation: string };
    [key: string]: unknown;
  };
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

      const response = await axios.post<{ data: { url: string } }>(`/api/v1/solar-returns/${solarReturn.id}/share`, {
        type: 'link',
        expiresInDays: parseInt(linkSettings.expiresIn),
        maxAccesses: linkSettings.maxAccesses,
        requirePassword: linkSettings.requirePassword,
        password: linkSettings.password,
      });

      setGeneratedLink(response.data.data.url);
      setSuccess(true);
    } catch (err) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message ?? 'Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setLoading(true);
      setError(null);

      await axios.post(`/api/v1/solar-returns/${solarReturn.id}/share/email`, {
        to: emailSettings.to,
        subject: emailSettings.subject,
        message: emailSettings.message,
        includeChart: emailSettings.includeChart,
      });

      setSuccess(true);
    } catch (err) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message ?? 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (generatedLink) {
      try {
        await navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), TIMEOUTS.COPY_FEEDBACK_DURATION_MS);
      } catch (err) {
        const error = err as Error;
        console.error('Failed to copy link:', error.message);
      }
    }
  };

  const getShareablePreview = () => {
    const { interpretation, year, returnDate } = solarReturn;

    return (
      <div className="share-preview">
        <div className="preview-header">
          <Gift size={24} />
          <div>
            <h3>Solar Return Reading for {year}</h3>
            <p className="preview-date">
              {new Date(returnDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {interpretation && (
          <div className="preview-content">
            <div className="preview-section">
              <h4>Themes for {year}:</h4>
              <div className="preview-themes">
                {interpretation.themes?.slice(0, 4).map((theme: string, i: number) => (
                  <span key={i} className="preview-theme-tag">{theme}</span>
                ))}
              {(interpretation.themes?.length ?? 0) > 4 && (
                <span className="preview-more">+{(interpretation.themes?.length ?? 0) - 4} more</span>
              )}
              </div>
            </div>

            {interpretation.sunHouse && (
              <div className="preview-section">
                <h4>Your Focus:</h4>
                <p className="preview-text">{interpretation.sunHouse.interpretation.slice(0, 150)}...</p>
              </div>
            )}
          </div>
        )}

        <div className="preview-footer">
          <p className="preview-note">
            <Lock size={14} />
            This is a gift from a friend who cares about your journey.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="birthday-sharing">
      <div className="sharing-header">
        <Gift size={32} />
        <div>
          <h2>Share as Gift</h2>
          <p className="subtitle">Send this solar return reading to someone special</p>
        </div>
      </div>

      {/* Preview */}
      <div className="sharing-preview">
        <h3>Preview</h3>
        {getShareablePreview()}
      </div>

      {/* Success Message */}
      {success && !generatedLink && (
        <div className="success-message">
          <Check size={20} />
          <div>
            <strong>Success!</strong>
            <p>{shareMethod === 'email' ? 'Email sent successfully!' : 'Link generated!'}</p>
          </div>
          <button onClick={() => {
            setSuccess(false);
            if (onShare) onShare();
          }}>
            Done
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Share Method Selection */}
      {!success && (
        <>
          <div className="share-method-tabs">
            <button
              className={shareMethod === 'link' ? 'active' : ''}
              onClick={() => setShareMethod('link')}
            >
              <Link size={18} />
              Share Link
            </button>
            <button
              className={shareMethod === 'email' ? 'active' : ''}
              onClick={() => setShareMethod('email')}
            >
              <Mail size={18} />
              Send Email
            </button>
          </div>

          {/* Link Sharing */}
          {shareMethod === 'link' && (
            <div className="sharing-form">
              <h3>Link Settings</h3>

              <div className="form-group">
                <label>Link Expiration</label>
                <select
                  value={linkSettings.expiresIn}
                  onChange={(e) => setLinkSettings({ ...linkSettings, expiresIn: e.target.value })}
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>

              <div className="form-group">
                <label>Maximum Accesses</label>
                <select
                  value={linkSettings.maxAccesses}
                  onChange={(e) => setLinkSettings({ ...linkSettings, maxAccesses: parseInt(e.target.value) })}
                >
                  <option value={1}>1 time</option>
                  <option value={5}>5 times</option>
                  <option value={10}>10 times</option>
                  <option value={25}>25 times</option>
                  <option value={999}>Unlimited</option>
                </select>
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="requirePassword"
                  checked={linkSettings.requirePassword}
                  onChange={(e) => setLinkSettings({ ...linkSettings, requirePassword: e.target.checked })}
                />
                <label htmlFor="requirePassword">Require password</label>
              </div>

              {linkSettings.requirePassword && (
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={linkSettings.password}
                    onChange={(e) => setLinkSettings({ ...linkSettings, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
              )}

              <button
                onClick={() => void handleGenerateLink()}
                disabled={loading}
                className="generate-link-btn"
              >
                <Share2 size={18} />
                {loading ? 'Generating...' : 'Generate Link'}
              </button>

              {generatedLink && (
                <div className="generated-link">
                  <label>Your Share Link:</label>
                  <div className="link-display">
                    <input
                      type="text"
                      value={generatedLink}
                      readOnly
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button onClick={() => void handleCopyLink()} className="copy-btn">
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <div className="link-info">
                    <p><Calendar size={14} /> Expires: {linkSettings.expiresIn} days</p>
                    <p><Lock size={14} /> Max accesses: {linkSettings.maxAccesses === 999 ? 'Unlimited' : linkSettings.maxAccesses}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email Sharing */}
          {shareMethod === 'email' && (
            <div className="sharing-form">
              <h3>Email Settings</h3>

              <div className="form-group">
                <label>Recipient Email</label>
                <input
                  type="email"
                  value={emailSettings.to}
                  onChange={(e) => setEmailSettings({ ...emailSettings, to: e.target.value })}
                  placeholder="friend@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={emailSettings.subject}
                  onChange={(e) => setEmailSettings({ ...emailSettings, subject: e.target.value })}
                  placeholder="Your Solar Return Reading"
                />
              </div>

              <div className="form-group">
                <label>Personal Message</label>
                <textarea
                  value={emailSettings.message}
                  onChange={(e) => setEmailSettings({ ...emailSettings, message: e.target.value })}
                  placeholder="Add a personal message..."
                  rows={4}
                />
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="includeChart"
                  checked={emailSettings.includeChart}
                  onChange={(e) => setEmailSettings({ ...emailSettings, includeChart: e.target.checked })}
                />
                <label htmlFor="includeChart">Include chart visualization</label>
              </div>

              <button
                onClick={() => void handleSendEmail()}
                disabled={loading || !emailSettings.to}
                className="send-email-btn"
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
