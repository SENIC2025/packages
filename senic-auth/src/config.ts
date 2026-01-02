// ============================================================
// Configuration - SENIC Auth Package
// ============================================================

import { SenicAuthConfig } from './utils/types';
import { generateState, storeAuthState } from './utils/token';

let _config: SenicAuthConfig | null = null;

/**
 * Initialize SENIC Auth configuration
 */
export function initConfig(config: SenicAuthConfig): void {
  _config = {
    ...config,
    callbackPath: config.callbackPath || '/auth/callback',
    storageType: config.storageType || 'local',
  };
}

/**
 * Get configured storage type
 */
export function getStorageType(): 'local' | 'session' {
  const config = getConfig();
  return config.storageType || 'local';
}

/**
 * Get current configuration
 */
export function getConfig(): SenicAuthConfig {
  if (!_config) {
    throw new Error('[SENIC Auth] Configuration not initialized. Wrap your app with <SenicAuthProvider>');
  }
  return _config;
}

/**
 * Get Edge Functions URL from Supabase root URL
 * Package internally appends /functions/v1
 */
export function getEdgeFunctionsUrl(): string {
  const config = getConfig();
  return `${config.supabaseUrl}/functions/v1`;
}

/**
 * Build the redirect URL to auth portal
 */
export function buildAuthPortalUrl(state: string): string {
  const config = getConfig();
  const redirectUri = `${window.location.origin}${config.callbackPath}`;

  const url = new URL(`${config.portalUrl}/login`);
  url.searchParams.set('app', config.appId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);

  return url.toString();
}

/**
 * Redirect to auth portal for login
 */
export function redirectToAuthPortal(): void {
  const state = generateState();
  storeAuthState(state);

  const authUrl = buildAuthPortalUrl(state);
  window.location.href = authUrl;
}

/**
 * Parse hash params from callback URL
 */
export function parseCallbackHash(): {
  accessToken: string | null;
  state: string | null;
  error: string | null;
} {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);

  return {
    accessToken: params.get('access_token'),
    state: params.get('state'),
    error: params.get('error'),
  };
}
