import { MasterAuthToken } from './types';
/**
 * Store Master Auth token with browser binding
 * SECURITY:
 * - Storage type configurable (localStorage or sessionStorage)
 * - Fingerprint binding: token only valid in this browser
 */
export declare function storeToken(token: string): void;
/**
 * Get stored Master Auth token (with fingerprint verification)
 * Returns null if fingerprint doesn't match (stolen token detection)
 */
export declare function getToken(): string | null;
/**
 * Clear Master Auth token
 */
export declare function clearToken(): void;
/**
 * Parse JWT payload (without verification - already verified by edge function)
 */
export declare function parseJwtPayload(token: string): MasterAuthToken | null;
/**
 * Check if token is expired
 */
export declare function isTokenExpired(token: MasterAuthToken): boolean;
/**
 * Get current user from stored token
 */
export declare function getCurrentUser(): MasterAuthToken | null;
/**
 * Generate a random state for CSRF protection
 */
export declare function generateState(): string;
/**
 * Store auth state for CSRF verification
 * Uses same storage as token (localStorage or sessionStorage based on config)
 */
export declare function storeAuthState(state: string): void;
/**
 * Get stored auth state
 */
export declare function getAuthState(): string | null;
/**
 * Clear auth state from storage
 */
export declare function clearAuthState(): void;
/**
 * Verify state matches what we stored (CSRF protection)
 */
export declare function verifyState(state: string | null): boolean;
/**
 * Refresh token by calling exchange-token endpoint
 * Used when user verifies email and needs updated claims
 */
export declare function refreshTokenFromServer(edgeFunctionsUrl: string, appId: string): Promise<boolean>;
/**
 * Validate session with server
 * SECURITY: Called on app mount to ensure user still exists in database
 * Catches: deleted users, revoked access, deactivated accounts, force logout
 */
export declare function validateSessionWithServer(edgeFunctionsUrl: string, appId: string): Promise<{
    valid: boolean;
    shouldClear: boolean;
    reason?: string;
}>;
//# sourceMappingURL=token.d.ts.map