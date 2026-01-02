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
    sub: string;
    email: string;
    exp: number;
    iat: number;
    role: string;
    aud: string;
    full_name: string;
    avatar_url: string;
    organization_id: string;
    organization_slug: string;
    organization_name: string;
    application_id: string;
    application_slug: string;
    app_role: string;
    app_role_level: number;
    is_owner: boolean;
    permissions: string[];
    enabled_modules: string[];
    subscription_plan: string;
    subscription_status: string;
    plan_features: string[];
    plan_limits: Record<string, number>;
    is_platform_admin: boolean;
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
    supabaseUrl: string;
    callbackPath?: string;
    storageType?: StorageType;
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
//# sourceMappingURL=types.d.ts.map