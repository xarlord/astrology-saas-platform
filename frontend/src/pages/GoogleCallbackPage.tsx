/**
 * Google OAuth Callback Page
 *
 * Handles the redirect from Google after OAuth authentication.
 * Extracts the id_token from the URL hash and completes the login.
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { handleOAuthCallback } from '../services/auth.service';

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const socialLoginWithToken = useAuthStore((s) => s.socialLoginWithToken);
  const setLoading = useAuthStore((s) => s.setLoading);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const idToken = handleOAuthCallback();

    if (idToken) {
      setLoading(true);
      // Import authService directly to use socialLoginWithToken
      import('../services/auth.service').then(({ authService }) => {
        authService.socialLoginWithToken(idToken)
          .then((response) => {
            const { user, accessToken } = response;
            useAuthStore.setState({
              user,
              token: accessToken,
              isAuthenticated: true,
              isLoading: false,
            });
            navigate('/dashboard', { replace: true });
          })
          .catch((err) => {
            console.error('Google login failed:', err);
            useAuthStore.setState({
              error: err instanceof Error ? err.message : 'Google login failed',
              isLoading: false,
            });
            navigate('/login', { replace: true });
          });
      });
    } else {
      // No token found — redirect to login
      navigate('/login', { replace: true });
    }
  }, [navigate, socialLoginWithToken, setLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cosmic-page">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing Google Sign-In...</p>
      </div>
    </div>
  );
}
