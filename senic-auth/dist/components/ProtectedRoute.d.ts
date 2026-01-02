import { ReactNode } from 'react';
interface ProtectedRouteProps {
    /**
     * Children to render if authenticated
     */
    children: ReactNode;
    /**
     * Required permission (optional)
     */
    requirePermission?: string;
    /**
     * Required module (optional)
     */
    requireModule?: string;
    /**
     * Redirect path if not authenticated (default: redirects to portal)
     */
    redirectTo?: string;
    /**
     * Custom component to show when not authorized (optional)
     */
    UnauthorizedComponent?: React.ComponentType;
    /**
     * Custom loading component (optional)
     */
    LoadingComponent?: React.ComponentType;
}
/**
 * ProtectedRoute component - guards routes based on authentication and permissions
 */
export declare function ProtectedRoute({ children, requirePermission, requireModule, redirectTo, UnauthorizedComponent, LoadingComponent, }: ProtectedRouteProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=ProtectedRoute.d.ts.map