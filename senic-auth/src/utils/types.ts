// ============================================================
// Core Types - SENIC Auth Package
// ============================================================

/**
 * User roles with hierarchical levels
 */
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'editor' | 'member' | 'viewer';

/**
 * Subscription plans
 */
export type SubscriptionPlan = 'starter' | 'professional' | 'business' | 'enterprise';

/**
 * Subscription status
 */
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';

/**
 * JWT token payload from Master Auth
 * Field names MUST match what exchange-token edge function returns
 */
export interface MasterAuthToken {
  // Standard JWT claims
  sub: string;
  email: string;
  exp: number;
  iat: number;
  role: string;
  aud: string;

  // User info
  full_name: string;
  avatar_url: string;

  // Organization info (from exchange-token)
  organization_id: string;
  organization_slug: string;
  organization_name: string;

  // Application info
  application_id: string;
  application_slug: string;

  // Role info (from exchange-token)
  app_role: string;
  app_role_level: number;
  is_owner: boolean;

  // Permissions & modules
  permissions: string[];
  enabled_modules: string[];

  // Subscription info
  subscription_plan: string;
  subscription_status: string;
  plan_features: string[];
  plan_limits: Record<string, number>;

  // Platform admin flag (SENIC org super_admin)
  is_platform_admin: boolean;

  // Marker
  master_auth: boolean;
}

/**
 * User object exposed to applications
 */
export interface SenicUser {
  id: string;
  email: string;
  name: string;
  displayName: string;
  avatarUrl?: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: UserRole;
  roleLevel: number;
  isOwner: boolean;
  permissions: string[];
  enabledModules: string[];
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  planFeatures: string[];
  planLimits: Record<string, number>;
  isPlatformAdmin: boolean;
}

/**
 * Storage type for auth tokens
 * - 'local': localStorage - persists across tabs/browser restart (default, better UX)
 * - 'session': sessionStorage - clears on browser close (more secure, for banking/payment apps)
 */
export type StorageType = 'local' | 'session';

/**
 * Configuration for SENIC Auth
 */
export interface SenicAuthConfig {
  appId: string;
  portalUrl: string;
  supabaseUrl: string; // Root Supabase URL (e.g., https://xxx.supabase.co)
  callbackPath?: string; // defaults to '/auth/callback'
  storageType?: StorageType; // defaults to 'local'
}

/**
 * Subscription information
 */
export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  features: string[];
  limits: Record<string, number>;
}

/**
 * Permissions information
 */
export interface PermissionsInfo {
  permissions: string[];
  modules: string[];
  role: UserRole;
  roleLevel: number;
  isOwner: boolean;
}
