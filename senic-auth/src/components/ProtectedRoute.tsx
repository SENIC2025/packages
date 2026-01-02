// ============================================================
// ProtectedRoute Component - SENIC Auth Package
// Guards routes and redirects if not authenticated
// ============================================================

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';

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
 * Default unauthorized component
 */
function DefaultUnauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg border shadow-lg p-8 max-w-md text-center">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access this resource.</p>
      </div>
    </div>
  );
}

/**
 * Default loading component
 */
function DefaultLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading...</p>
      </div>
    </div>
  );
}

/**
 * ProtectedRoute component - guards routes based on authentication and permissions
 */
export function ProtectedRoute({
  children,
  requirePermission,
  requireModule,
  redirectTo,
  UnauthorizedComponent,
  LoadingComponent,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, loginViaPortal } = useAuth();
  const { hasPermission, hasModule } = usePermissions();

  // Show loading state
  if (isLoading) {
    if (LoadingComponent) {
      return <LoadingComponent />;
    }
    return <DefaultLoading />;
  }

  // Not authenticated - redirect to portal or custom path
  if (!isAuthenticated) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    // Redirect to portal
    loginViaPortal();
    return null;
  }

  // Check permission if required
  if (requirePermission && !hasPermission(requirePermission)) {
    if (UnauthorizedComponent) {
      return <UnauthorizedComponent />;
    }
    return <DefaultUnauthorized />;
  }

  // Check module if required
  if (requireModule && !hasModule(requireModule)) {
    if (UnauthorizedComponent) {
      return <UnauthorizedComponent />;
    }
    return <DefaultUnauthorized />;
  }

  // All checks passed - render children
  return <>{children}</>;
}
