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
export declare function usePermissions(): UsePermissionsReturn;
//# sourceMappingURL=usePermissions.d.ts.map