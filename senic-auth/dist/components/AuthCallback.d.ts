interface AuthCallbackProps {
    /**
     * Custom logo URL (optional)
     */
    logoUrl?: string;
    /**
     * Custom redirect path after successful auth (default: '/')
     */
    redirectTo?: string;
    /**
     * Custom error redirect path (default: '/login')
     */
    errorRedirectTo?: string;
    /**
     * Custom loading component
     */
    LoadingComponent?: React.ComponentType;
    /**
     * Custom error component
     */
    ErrorComponent?: React.ComponentType<{
        error: string;
        onRetry: () => void;
    }>;
}
/**
 * AuthCallback component - handles OAuth callback
 */
export declare function AuthCallback({ logoUrl, redirectTo, errorRedirectTo, LoadingComponent, ErrorComponent, }: AuthCallbackProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AuthCallback.d.ts.map