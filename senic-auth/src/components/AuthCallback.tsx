// ============================================================
// AuthCallback Component - SENIC Auth Package
// Handles redirect from Master Auth Portal
// ============================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  parseJwtPayload,
  storeToken,
  isTokenExpired,
  verifyState,
  clearAuthState,
} from '../utils/token';
import { parseCallbackHash } from '../config';

interface AuthCallbackProps {
  /**
   * Custom logo URL (optional)
   */
  logoUrl?: string;
  /**
   * Custom redirect path after successful auth (default: '/')
   */
  redirectTo?: string;
  /**
   * Custom error redirect path (default: '/login')
   */
  errorRedirectTo?: string;
  /**
   * Custom loading component
   */
  LoadingComponent?: React.ComponentType;
  /**
   * Custom error component
   */
  ErrorComponent?: React.ComponentType<{ error: string; onRetry: () => void }>;
}

/**
 * Default loading component
 */
function DefaultLoading({ logoUrl }: { logoUrl?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo"
            className="h-16 mx-auto mb-4 animate-pulse"
          />
        )}
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}

/**
 * Default error component
 */
function DefaultError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg border shadow-lg p-8 max-w-md text-center">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Authentication Failed</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="w-full px-4 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

/**
 * AuthCallback component - handles OAuth callback
 */
export function AuthCallback({
  logoUrl,
  redirectTo = '/',
  errorRedirectTo = '/login',
  LoadingComponent,
  ErrorComponent,
}: AuthCallbackProps) {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse hash params
        const { accessToken, state, error: callbackError } = parseCallbackHash();

        // Check for errors
        if (callbackError) {
          throw new Error(callbackError);
        }

        // Verify we have a token
        if (!accessToken) {
          throw new Error('No access token received');
        }

        // Verify state (CSRF protection)
        if (!verifyState(state)) {
          throw new Error('Invalid state parameter - possible CSRF attack');
        }

        // Parse and validate token
        const payload = parseJwtPayload(accessToken);
        if (!payload) {
          throw new Error('Invalid token format');
        }

        if (isTokenExpired(payload)) {
          throw new Error('Token has expired');
        }

        // Verify it's a Master Auth token
        if (!payload.master_auth) {
          throw new Error('Invalid token - not from Master Auth');
        }

        // Store the token
        storeToken(accessToken);

        // Clear auth state
        clearAuthState();

        // Clear the hash from URL (security)
        window.history.replaceState(null, '', window.location.pathname);

        // Refresh AuthContext to pick up the new token
        refreshAuth();

        // Navigate to destination
        navigate(redirectTo, { replace: true });
      } catch (err) {
        console.error('[SENIC Auth] Callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        clearAuthState();
      }
    };

    handleCallback();
  }, [navigate, refreshAuth, redirectTo]);

  const handleRetry = () => {
    navigate(errorRedirectTo, { replace: true });
  };

  if (error) {
    if (ErrorComponent) {
      return <ErrorComponent error={error} onRetry={handleRetry} />;
    }
    return <DefaultError error={error} onRetry={handleRetry} />;
  }

  if (LoadingComponent) {
    return <LoadingComponent />;
  }

  return <DefaultLoading logoUrl={logoUrl} />;
}
