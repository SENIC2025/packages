// ============================================================
// Platform Admin Hook - SENIC Auth Package
// ============================================================

import { useAuth } from '../context/AuthContext';

/**
 * Hook to check if current user is a Platform Admin
 *
 * Platform Admin = super_admin role (level 100) + member of 'senic' organization
 *
 * Uses the is_platform_admin claim from JWT which is set by the
 * custom_access_token_hook in Master Auth database.
 */
export function usePlatformAdmin() {
  const { user, isLoading } = useAuth();

  return {
    /** Whether the current user is a platform admin */
    isPlatformAdmin: user?.isPlatformAdmin ?? false,
    /** Whether authentication is still loading */
    isLoading,
    /** Current user object */
    user,
  };
}

export type UsePlatformAdminReturn = ReturnType<typeof usePlatformAdmin>;
