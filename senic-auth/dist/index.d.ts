export { SenicAuthProvider, useAuth } from './context/AuthContext';
export { useSubscription } from './hooks/useSubscription';
export { usePermissions } from './hooks/usePermissions';
export { usePlatformAdmin } from './hooks/usePlatformAdmin';
export { AuthCallback } from './components/AuthCallback';
export { ProtectedRoute } from './components/ProtectedRoute';
export { UpgradePrompt } from './components/UpgradePrompt';
export type { SenicUser, SenicAuthConfig, UserRole, SubscriptionPlan, SubscriptionStatus, StorageType, MasterAuthToken, SubscriptionInfo, PermissionsInfo, } from './utils/types';
export type { UseSubscriptionReturn } from './hooks/useSubscription';
export type { UsePermissionsReturn } from './hooks/usePermissions';
export { storeToken, getToken, clearToken, parseJwtPayload, isTokenExpired, getCurrentUser, } from './utils/token';
export { redirectToAuthPortal, buildAuthPortalUrl, parseCallbackHash, } from './config';
//# sourceMappingURL=index.d.ts.map