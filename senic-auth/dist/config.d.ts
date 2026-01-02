import { SenicAuthConfig } from './utils/types';
/**
 * Initialize SENIC Auth configuration
 */
export declare function initConfig(config: SenicAuthConfig): void;
/**
 * Get configured storage type
 */
export declare function getStorageType(): 'local' | 'session';
/**
 * Get current configuration
 */
export declare function getConfig(): SenicAuthConfig;
/**
 * Get Edge Functions URL from Supabase root URL
 * Package internally appends /functions/v1
 */
export declare function getEdgeFunctionsUrl(): string;
/**
 * Build the redirect URL to auth portal
 */
export declare function buildAuthPortalUrl(state: string): string;
/**
 * Redirect to auth portal for login
 */
export declare function redirectToAuthPortal(): void;
/**
 * Parse hash params from callback URL
 */
export declare function parseCallbackHash(): {
    accessToken: string | null;
    state: string | null;
    error: string | null;
};
//# sourceMappingURL=config.d.ts.map