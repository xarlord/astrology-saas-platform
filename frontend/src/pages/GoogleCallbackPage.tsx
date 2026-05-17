/**
 * Google OAuth Callback Page
 *
 * Handles the redirect from Google after OAuth authentication.
 * Google OAuth2 implicit flow puts id_token in the URL hash fragment.
 * This page extracts it and sends it to the opener window via postMessage.
 *
 * URL format after Google redirect:
 * /auth/google-callback#access_token=...&id_token=...&token_type=Bearer&expires_in=3599
 */

import { useEffect, useRef } from 'react';

export default function GoogleCallbackPage() {
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    // Extract id_token from URL hash fragment
    const hash = window.location.hash.substring(1); // Remove leading #
    const params = new URLSearchParams(hash);

    const idToken = params.get('id_token');
    const error = params.get('error');

    if (error) {
      // Send error to opener
      if (window.opener) {
        window.opener.postMessage(
          { type: 'google-oauth-error', error: error },
          window.location.origin,
        );
      }
      // Close popup
      window.close();
      return;
    }

    if (idToken) {
      // Send id_token to the opener window
      if (window.opener) {
        window.opener.postMessage(
          { type: 'google-oauth-success', idToken },
          window.location.origin,
        );
      }
      // Close popup
      window.close();
      return;
    }

    // No token and no error — something went wrong
    if (window.opener) {
      window.opener.postMessage(
        { type: 'google-oauth-error', error: 'No ID token received from Google' },
        window.location.origin,
      );
    }
    window.close();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cosmic-page">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing Google Sign-In...</p>
      </div>
    </div>
  );
}
