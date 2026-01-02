// ============================================================
// Token Management - SENIC Auth Package
// Handles secure token storage with browser fingerprinting
// ============================================================

import { MasterAuthToken } from './types';
import { getStorageType } from '../config';

/**
 * Get the appropriate storage based on configuration
 */
function getStorage(): Storage {
  return getStorageType() === 'session' ? sessionStorage : localStorage;
}

/**
 * Generate browser fingerprint for token binding
 * SECURITY: Binds token to this specific browser instance
 */
function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency || 0,
  ];

  // Simple hash function
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Store Master Auth token with browser binding
 * SECURITY:
 * - Storage type configurable (localStorage or sessionStorage)
 * - Fingerprint binding: token only valid in this browser
 */
export function storeToken(token: string): void {
  const fingerprint = generateFingerprint();
  const boundToken = JSON.stringify({ token, fingerprint });
  getStorage().setItem('senic_auth_token', boundToken);
}

/**
 * Get stored Master Auth token (with fingerprint verification)
 * Returns null if fingerprint doesn't match (stolen token detection)
 */
export function getToken(): string | null {
  const storage = getStorage();
  const stored = storage.getItem('senic_auth_token');
  if (!stored) return null;

  try {
    const { token, fingerprint } = JSON.parse(stored);

    // SECURITY: Verify token was issued to this browser
    if (fingerprint !== generateFingerprint()) {
      console.warn('[SENIC Auth] Token fingerprint mismatch - possible token theft');
      clearToken();
      return null;
    }

    return token;
  } catch {
    // Invalid format - clear it
    clearToken();
    return null;
  }
}

/**
 * Clear Master Auth token
 */
export function clearToken(): void {
  // Clear from both storages to handle storage type changes
  localStorage.removeItem('senic_auth_token');
  sessionStorage.removeItem('senic_auth_token');
}

/**
 * Parse JWT payload (without verification - already verified by edge function)
 */
export function parseJwtPayload(token: string): MasterAuthToken | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: MasterAuthToken): boolean {
  return token.exp * 1000 < Date.now();
}

/**
 * Get current user from stored token
 */
export function getCurrentUser(): MasterAuthToken | null {
  const token = getToken();
  if (!token) return null;

  const payload = parseJwtPayload(token);
  if (!payload) return null;

  if (isTokenExpired(payload)) {
    clearToken();
    return null;
  }

  return payload;
}

/**
 * Generate a random state for CSRF protection
 */
export function generateState(): string {
  return crypto.randomUUID();
}

/**
 * Store auth state for CSRF verification
 * Uses same storage as token (localStorage or sessionStorage based on config)
 */
export function storeAuthState(state: string): void {
  // Use same storage as token for consistency
  getStorage().setItem('senic_auth_state', state);
}

/**
 * Get stored auth state
 */
export function getAuthState(): string | null {
  return getStorage().getItem('senic_auth_state');
}

/**
 * Clear auth state from storage
 */
export function clearAuthState(): void {
  // Clear from both storages to handle storage type changes
  localStorage.removeItem('senic_auth_state');
  sessionStorage.removeItem('senic_auth_state');
}

/**
 * Verify state matches what we stored (CSRF protection)
 */
export function verifyState(state: string | null): boolean {
  const savedState = getAuthState();
  return state === savedState;
}

/**
 * Refresh token by calling exchange-token endpoint
 * Used when user verifies email and needs updated claims
 */
export async function refreshTokenFromServer(
  edgeFunctionsUrl: string,
  appId: string
): Promise<boolean> {
  const currentToken = getToken();
  if (!currentToken) {
    console.warn('[SENIC Auth] No token to refresh');
    return false;
  }

  try {
    const response = await fetch(`${edgeFunctionsUrl}/exchange-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`,
      },
      body: JSON.stringify({ app_id: appId }),
    });

    if (!response.ok) {
      console.error('[SENIC Auth] Token refresh failed:', response.status);
      return false;
    }

    const data = await response.json();
    if (data.access_token) {
      storeToken(data.access_token);
      console.log('[SENIC Auth] Token refreshed successfully');
      return true;
    }

    return false;
  } catch (error) {
    console.error('[SENIC Auth] Token refresh error:', error);
    return false;
  }
}

/**
 * Validate session with server
 * SECURITY: Called on app mount to ensure user still exists in database
 * Catches: deleted users, revoked access, deactivated accounts, force logout
 */
export async function validateSessionWithServer(
  edgeFunctionsUrl: string,
  appId: string
): Promise<{ valid: boolean; shouldClear: boolean; reason?: string }> {
  const currentToken = getToken();
  if (!currentToken) {
    // No token = not logged in (valid state, no need to clear)
    return { valid: false, shouldClear: false };
  }

  try {
    const response = await fetch(`${edgeFunctionsUrl}/exchange-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`,
      },
      body: JSON.stringify({ app_id: appId }),
    });

    if (!response.ok) {
      // Parse error to get specific reason
      let reason = 'unknown';
      try {
        const errorData = await response.json();
        reason = errorData.error || 'unknown';

        // Handle specific error codes
        if (errorData.error === 'force_logout') {
          console.warn('[SENIC Auth] Force logout triggered by admin - clearing token');
          return { valid: false, shouldClear: true, reason: 'force_logout' };
        }
      } catch {
        // Failed to parse error response
      }

      console.warn(`[SENIC Auth] Session validation failed (${reason}) - clearing token`);
      return { valid: false, shouldClear: true, reason };
    }

    const data = await response.json();
    if (data.access_token) {
      // Refresh the token while we're at it (get latest claims)
      storeToken(data.access_token);
      return { valid: true, shouldClear: false };
    }

    return { valid: false, shouldClear: true, reason: 'no_token_returned' };
  } catch (error) {
    // Network error - don't clear token (might be offline)
    console.warn('[SENIC Auth] Session validation network error:', error);
    return { valid: true, shouldClear: false };
  }
}
