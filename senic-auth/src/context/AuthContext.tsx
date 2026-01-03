// ============================================================
// Auth Context - SENIC Auth Package
// Main authentication provider with user state management
// ============================================================

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SenicUser, SenicAuthConfig, UserRole, SubscriptionPlan, SubscriptionStatus, StorageType } from '../utils/types';
import { getCurrentUser, clearToken, refreshTokenFromServer, validateSessionWithServer } from '../utils/token';
import { initConfig, redirectToAuthPortal, getEdgeFunctionsUrl, getConfig } from '../config';

// ============================================================
// Types
// ============================================================

interface AuthContextType {
  user: SenicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  loginViaPortal: () => void;
  refreshAuth: () => void;
}

// ============================================================
// Context
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SenicAuthProvider');
  }
  return context;
}

// ============================================================
// Helpers
// ============================================================

/**
 * Map role level to UserRole enum
 * Levels: super_admin=100, admin=80, manager=60, editor=40, member=20, viewer=10
 */
function mapRoleLevelToRole(level: number): UserRole {
  if (level >= 100) return 'super_admin';
  if (level >= 80) return 'admin';
  if (level >= 60) return 'manager';
  if (level >= 40) return 'editor';
  if (level >= 20) return 'member';
  return 'viewer';
}

/**
 * Map subscription plan string to typed enum
 */
function mapSubscriptionPlan(plan: string): SubscriptionPlan {
  const validPlans: SubscriptionPlan[] = ['starter', 'professional', 'business', 'enterprise'];
  return validPlans.includes(plan as SubscriptionPlan)
    ? (plan as SubscriptionPlan)
    : 'starter';
}

/**
 * Map subscription status string to typed enum
 */
function mapSubscriptionStatus(status: string): SubscriptionStatus {
  const validStatuses: SubscriptionStatus[] = ['active', 'trialing', 'past_due', 'canceled', 'incomplete'];
  return validStatuses.includes(status as SubscriptionStatus)
    ? (status as SubscriptionStatus)
    : 'active';
}

// ============================================================
// Provider
// ============================================================

interface SenicAuthProviderProps {
  children: ReactNode;
  appId: string;
  portalUrl: string;
  supabaseUrl: string;
  callbackPath?: string;
  storageType?: StorageType; // 'local' (default) or 'session' (for banking/payment apps)
  onLogout?: () => void;
}

export function SenicAuthProvider({
  children,
  appId,
  portalUrl,
  supabaseUrl,
  callbackPath,
  storageType,
  onLogout,
}: SenicAuthProviderProps) {
  // Initialize config SYNCHRONOUSLY before any hooks run
  // This ensures config is ready before AuthCallback or any other component tries to use it
  // Previously this was in useEffect which caused a race condition on callback page
  const configRef = { appId, portalUrl, supabaseUrl, callbackPath, storageType };
  initConfig(configRef);

  const [user, setUser] = useState<SenicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Build SenicUser from MasterAuthToken
   * Field names must match what exchange-token edge function returns
   */
  const buildUser = (masterAuthUser: ReturnType<typeof getCurrentUser>): SenicUser | null => {
    if (!masterAuthUser) return null;

    return {
      id: masterAuthUser.sub,
      email: masterAuthUser.email,
      name: masterAuthUser.full_name || masterAuthUser.email.split('@')[0],
      displayName: masterAuthUser.full_name || masterAuthUser.email.split('@')[0],
      avatarUrl: masterAuthUser.avatar_url,
      organizationId: masterAuthUser.organization_id,
      organizationName: masterAuthUser.organization_name,
      organizationSlug: masterAuthUser.organization_slug,
      role: mapRoleLevelToRole(masterAuthUser.app_role_level),
      roleLevel: masterAuthUser.app_role_level,
      isOwner: masterAuthUser.is_owner,
      permissions: masterAuthUser.permissions || [],
      enabledModules: masterAuthUser.enabled_modules || [],
      subscriptionPlan: mapSubscriptionPlan(masterAuthUser.subscription_plan),
      subscriptionStatus: mapSubscriptionStatus(masterAuthUser.subscription_status),
      planFeatures: masterAuthUser.plan_features || [],
      planLimits: masterAuthUser.plan_limits || {},
      isPlatformAdmin: masterAuthUser.is_platform_admin || false,
    };
  };

  /**
   * Refresh auth state from stored token (local only, no server call)
   */
  const refreshAuth = () => {
    try {
      const masterAuthUser = getCurrentUser();
      setUser(buildUser(masterAuthUser));
    } catch (error) {
      console.error('[SENIC Auth] Error refreshing auth:', error);
      setUser(null);
    }
  };

  /**
   * Validate session with server on mount
   * SECURITY: Ensures user still exists in database (catches deleted/revoked users)
   */
  const validateSession = async () => {
    try {
      const config = getConfig();
      const edgeFunctionsUrl = getEdgeFunctionsUrl();

      const { valid, shouldClear, reason } = await validateSessionWithServer(edgeFunctionsUrl, config.appId);

      if (shouldClear) {
        console.log(`[SENIC Auth] Session invalid (${reason}) - clearing and redirecting to login`);
        clearToken();
        setUser(null);
      } else if (valid) {
        // Refresh user from potentially updated token
        const masterAuthUser = getCurrentUser();
        setUser(buildUser(masterAuthUser));
      }
    } catch (error) {
      console.error('[SENIC Auth] Session validation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle ?verified=true - refresh token to get updated claims
   */
  const handleVerifiedParam = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');

    if (verified === 'true') {
      console.log('[SENIC Auth] Detected ?verified=true - refreshing token for updated claims');

      // Clean URL by removing the param
      const url = new URL(window.location.href);
      url.searchParams.delete('verified');
      window.history.replaceState({}, '', url.toString());

      // Refresh token from server to get updated claims (e.g., is_verified = true)
      try {
        const config = getConfig();
        const edgeFunctionsUrl = getEdgeFunctionsUrl();
        const success = await refreshTokenFromServer(edgeFunctionsUrl, config.appId);

        if (success) {
          // Reload user from new token
          const masterAuthUser = getCurrentUser();
          setUser(buildUser(masterAuthUser));
          console.log('[SENIC Auth] Token refreshed with updated claims');
        }
      } catch (error) {
        console.error('[SENIC Auth] Failed to refresh token after verification:', error);
      }
    }
  };

  // Initialize on mount - validate session with server
  useEffect(() => {
    // First do a quick local check to show UI faster
    refreshAuth();

    // Then validate with server (catches deleted/revoked users)
    validateSession();

    // Handle ?verified=true if present
    handleVerifiedParam();
  }, []);

  // Periodic session validation (heartbeat)
  // SECURITY: Catches deleted users, revoked tokens, and breaking changes
  // even when user leaves browser tab open for extended periods
  useEffect(() => {
    const HEARTBEAT_INTERVAL = 15 * 60 * 1000; // 15 minutes

    const interval = setInterval(() => {
      // Only validate if user appears to be logged in
      if (user) {
        console.log('[SENIC Auth] Heartbeat - validating session');
        validateSession();
      }
    }, HEARTBEAT_INTERVAL);

    return () => clearInterval(interval);
  }, [user]);

  /**
   * Redirect to auth portal for login
   */
  const loginViaPortal = () => {
    redirectToAuthPortal();
  };

  /**
   * Logout - clear token and optionally redirect
   */
  const logout = () => {
    clearToken();
    setUser(null);

    // Call custom logout handler if provided
    if (onLogout) {
      onLogout();
    } else {
      // Default: redirect to portal
      setTimeout(() => {
        redirectToAuthPortal();
      }, 500);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    loginViaPortal,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
