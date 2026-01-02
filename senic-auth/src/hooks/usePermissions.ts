// ============================================================
// usePermissions Hook - SENIC Auth Package
// Access permissions, modules, and role information
// ============================================================

import { useAuth } from '../context/AuthContext';
import { UserRole } from '../utils/types';

export interface UsePermissionsReturn {
  permissions: string[];
  modules: string[];
  role: UserRole | null;
  roleLevel: number;
  isOwner: boolean;
  hasPermission: (permission: string) => boolean;
  hasModule: (module: string) => boolean;
  canAccess: (permission: string, module?: string) => boolean;
  isAdminLevel: boolean;
  isSuperAdmin: boolean;
}

/**
 * Hook to access permissions and role information
 */
export function usePermissions(): UsePermissionsReturn {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return {
      permissions: [],
      modules: [],
      role: null,
      roleLevel: 100,
      isOwner: false,
      hasPermission: () => false,
      hasModule: () => false,
      canAccess: () => false,
      isAdminLevel: false,
      isSuperAdmin: false,
    };
  }

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    // Owners and super_admins have all permissions
    if (user.isOwner || user.role === 'super_admin') return true;
    return user.permissions.includes(permission);
  };

  /**
   * Check if user has access to a specific module
   */
  const hasModule = (module: string): boolean => {
    // Owners and super_admins have all modules
    if (user.isOwner || user.role === 'super_admin') return true;
    return user.enabledModules.includes(module);
  };

  /**
   * Check if user can access a resource (permission + optional module)
   */
  const canAccess = (permission: string, module?: string): boolean => {
    const hasRequiredPermission = hasPermission(permission);
    if (!module) return hasRequiredPermission;
    return hasRequiredPermission && hasModule(module);
  };

  /**
   * Check if user is admin level (admin or super_admin)
   */
  const isAdminLevel = user.role === 'admin' || user.role === 'super_admin';

  /**
   * Check if user is super admin
   */
  const isSuperAdmin = user.role === 'super_admin';

  return {
    permissions: user.permissions,
    modules: user.enabledModules,
    role: user.role,
    roleLevel: user.roleLevel,
    isOwner: user.isOwner,
    hasPermission,
    hasModule,
    canAccess,
    isAdminLevel,
    isSuperAdmin,
  };
}
