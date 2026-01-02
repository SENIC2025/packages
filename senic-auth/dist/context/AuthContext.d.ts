import { ReactNode } from 'react';
import { SenicUser, StorageType } from '../utils/types';
interface AuthContextType {
    user: SenicUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => void;
    loginViaPortal: () => void;
    refreshAuth: () => void;
}
/**
 * Hook to access auth context
 */
export declare function useAuth(): AuthContextType;
interface SenicAuthProviderProps {
    children: ReactNode;
    appId: string;
    portalUrl: string;
    supabaseUrl: string;
    callbackPath?: string;
    storageType?: StorageType;
    onLogout?: () => void;
}
export declare function SenicAuthProvider({ children, appId, portalUrl, supabaseUrl, callbackPath, storageType, onLogout, }: SenicAuthProviderProps): JSX.Element;
export {};
//# sourceMappingURL=AuthContext.d.ts.map