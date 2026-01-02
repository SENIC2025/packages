/**
 * Hook to check if current user is a Platform Admin
 *
 * Platform Admin = super_admin role (level 100) + member of 'senic' organization
 *
 * Uses the is_platform_admin claim from JWT which is set by the
 * custom_access_token_hook in Master Auth database.
 */
export declare function usePlatformAdmin(): {
    /** Whether the current user is a platform admin */
    isPlatformAdmin: boolean;
    /** Whether authentication is still loading */
    isLoading: boolean;
    /** Current user object */
    user: import("..").SenicUser | null;
};
export type UsePlatformAdminReturn = ReturnType<typeof usePlatformAdmin>;
//# sourceMappingURL=usePlatformAdmin.d.ts.map