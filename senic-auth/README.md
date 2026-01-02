# @senic/auth

Centralized authentication and authorization package for SENIC applications.

## Features

- **Secure Token Management**: Browser fingerprinting, sessionStorage, automatic expiry checking
- **React Context Integration**: Easy-to-use hooks for auth state
- **Permission System**: Fine-grained permission and module access control
- **Subscription Management**: Plan features and limits from JWT
- **Protected Routes**: Built-in route guards
- **TypeScript**: Full type safety
- **Zero Dependencies**: Only peer dependencies on React and React Router

## Installation

```bash
npm install @senic/auth
```

### Peer Dependencies

```bash
npm install react react-dom react-router-dom
```

## Quick Start

### 1. Wrap Your App

```tsx
import { SenicAuthProvider } from '@senic/auth';

function App() {
  return (
    <SenicAuthProvider
      appId="impacthub"
      portalUrl="https://auth.senic.com"
      callbackPath="/auth/callback" // optional, defaults to /auth/callback
    >
      <YourApp />
    </SenicAuthProvider>
  );
}
```

### 2. Add Auth Callback Route

```tsx
import { AuthCallback } from '@senic/auth';
import { Routes, Route } from 'react-router-dom';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      {/* other routes */}
    </Routes>
  );
}
```

### 3. Use Auth in Components

```tsx
import { useAuth } from '@senic/auth';

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.displayName}!</h1>
      <p>Email: {user.email}</p>
      <p>Organization: {user.organizationName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Hooks

### useAuth

Access authentication state and methods.

```tsx
import { useAuth } from '@senic/auth';

const {
  user,           // SenicUser | null
  isAuthenticated,// boolean
  isLoading,      // boolean
  logout,         // () => void
  loginViaPortal, // () => void
  refreshAuth,    // () => void
} = useAuth();
```

**User Object:**
```typescript
interface SenicUser {
  id: string;
  email: string;
  name: string;
  displayName: string;
  avatarUrl?: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: UserRole;
  roleLevel: number;
  isOwner: boolean;
  permissions: string[];
  enabledModules: string[];
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  planFeatures: string[];
  planLimits: Record<string, number>;
}
```

### useSubscription

Access subscription plan, features, and limits.

```tsx
import { useSubscription } from '@senic/auth';

const {
  plan,           // 'starter' | 'professional' | 'business' | 'enterprise'
  status,         // 'active' | 'trialing' | 'past_due' | 'canceled'
  features,       // string[]
  limits,         // Record<string, number>
  hasFeature,     // (feature: string) => boolean
  checkLimit,     // (limit: string, current: number) => boolean
  isActive,       // boolean
} = useSubscription();

// Examples
if (hasFeature('advanced_reports')) {
  // Show advanced reports UI
}

if (!checkLimit('max_assessments', currentCount)) {
  // Show upgrade prompt
}
```

### usePermissions

Access permissions, modules, and role information.

```tsx
import { usePermissions } from '@senic/auth';

const {
  permissions,    // string[]
  modules,        // string[]
  role,           // UserRole
  roleLevel,      // number
  isOwner,        // boolean
  hasPermission,  // (permission: string) => boolean
  hasModule,      // (module: string) => boolean
  canAccess,      // (permission: string, module?: string) => boolean
  isAdminLevel,   // boolean
  isSuperAdmin,   // boolean
} = usePermissions();

// Examples
if (hasPermission('assessments.delete')) {
  // Show delete button
}

if (hasModule('esg-assessment')) {
  // Show ESG module
}

if (canAccess('reports.export', 'advanced-reports')) {
  // Show export with advanced reports module
}
```

## Components

### AuthCallback

Handles the OAuth callback from the auth portal. Drop this into your `/auth/callback` route.

```tsx
import { AuthCallback } from '@senic/auth';

// Basic usage
<Route path="/auth/callback" element={<AuthCallback />} />

// With custom options
<AuthCallback
  logoUrl="/logo.png"
  redirectTo="/dashboard"
  errorRedirectTo="/login"
  LoadingComponent={CustomLoading}
  ErrorComponent={CustomError}
/>
```

**Props:**
- `logoUrl?: string` - Custom logo to show while loading
- `redirectTo?: string` - Where to redirect after success (default: `/`)
- `errorRedirectTo?: string` - Where to redirect on error (default: `/login`)
- `LoadingComponent?: ComponentType` - Custom loading component
- `ErrorComponent?: ComponentType<{ error: string; onRetry: () => void }>` - Custom error component

### ProtectedRoute

Guards routes based on authentication and permissions.

```tsx
import { ProtectedRoute } from '@senic/auth';

// Require authentication only
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

// Require permission
<Route
  path="/admin"
  element={
    <ProtectedRoute requirePermission="admin.access">
      <AdminPanel />
    </ProtectedRoute>
  }
/>

// Require module
<Route
  path="/esg"
  element={
    <ProtectedRoute requireModule="esg-assessment">
      <ESGAssessment />
    </ProtectedRoute>
  }
/>

// Custom unauthorized component
<ProtectedRoute
  requirePermission="admin.access"
  UnauthorizedComponent={Custom403}
>
  <AdminPanel />
</ProtectedRoute>
```

**Props:**
- `children: ReactNode` - Content to render if authorized
- `requirePermission?: string` - Required permission
- `requireModule?: string` - Required module
- `redirectTo?: string` - Custom redirect path
- `UnauthorizedComponent?: ComponentType` - Custom unauthorized component
- `LoadingComponent?: ComponentType` - Custom loading component

### UpgradePrompt

Shows upgrade message when a feature is not available in the current plan.

```tsx
import { UpgradePrompt } from '@senic/auth';

<UpgradePrompt feature="advanced_reports">
  <AdvancedReportsPanel />
</UpgradePrompt>

// With custom upgrade URL
<UpgradePrompt
  feature="api_access"
  upgradeUrl="https://senic.com/pricing"
  message="API access is available on Business plans and above"
>
  <APISettings />
</UpgradePrompt>

// With custom upgrade component
<UpgradePrompt
  feature="custom_branding"
  UpgradeComponent={CustomUpgradePrompt}
>
  <BrandingSettings />
</UpgradePrompt>
```

**Props:**
- `feature: string` - Required feature to check
- `children: ReactNode` - Content to render if feature is available
- `UpgradeComponent?: ComponentType<{ feature: string; currentPlan: string }>` - Custom upgrade component
- `upgradeUrl?: string` - URL to upgrade page
- `message?: string` - Custom message

## Advanced Usage

### Custom Logout Handler

```tsx
<SenicAuthProvider
  appId="impacthub"
  portalUrl="https://auth.senic.com"
  onLogout={() => {
    // Custom logout logic
    analytics.track('User Logged Out');
    navigate('/goodbye');
  }}
>
  <App />
</SenicAuthProvider>
```

### Manual Token Management

```tsx
import {
  storeToken,
  getToken,
  clearToken,
  parseJwtPayload,
  isTokenExpired,
  getCurrentUser,
} from '@senic/auth';

// Get current token
const token = getToken();

// Parse token payload
const payload = parseJwtPayload(token);

// Check if expired
if (isTokenExpired(payload)) {
  // Handle expiry
}

// Get current user from token
const user = getCurrentUser();
```

### Building Custom Auth Flow

```tsx
import { redirectToAuthPortal, buildAuthPortalUrl } from '@senic/auth';

// Redirect to portal
redirectToAuthPortal();

// Or build URL manually
const state = crypto.randomUUID();
const authUrl = buildAuthPortalUrl(state);
window.location.href = authUrl;
```

## Security Features

### Browser Fingerprinting

Tokens are bound to the browser that received them using a fingerprint based on:
- User agent
- Language
- Screen dimensions
- Color depth
- Timezone
- Hardware concurrency

If a token is stolen and used in a different browser, it will be rejected.

### Session Storage

Tokens are stored in `sessionStorage` (not `localStorage`):
- Cleared when browser/tab closes
- Not accessible across tabs
- More secure than localStorage

### Automatic Expiry

Tokens are automatically checked for expiry on every read. Expired tokens are cleared and user is logged out.

### CSRF Protection

State parameter is used to prevent CSRF attacks during OAuth flow.

## TypeScript Support

Full TypeScript support with comprehensive type definitions.

```typescript
import type {
  SenicUser,
  SenicAuthConfig,
  UserRole,
  SubscriptionPlan,
  SubscriptionStatus,
  MasterAuthToken,
  UseSubscriptionReturn,
  UsePermissionsReturn,
} from '@senic/auth';
```

## Complete Example

```tsx
import { StrictMode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  SenicAuthProvider,
  AuthCallback,
  ProtectedRoute,
  useAuth,
  useSubscription,
  usePermissions,
} from '@senic/auth';

function Dashboard() {
  const { user } = useAuth();
  const { plan, hasFeature } = useSubscription();
  const { hasModule } = usePermissions();

  return (
    <div>
      <h1>Welcome, {user.displayName}!</h1>
      <p>Plan: {plan}</p>
      {hasFeature('advanced_reports') && <AdvancedReports />}
      {hasModule('esg-assessment') && <ESGModule />}
    </div>
  );
}

function App() {
  return (
    <StrictMode>
      <BrowserRouter>
        <SenicAuthProvider
          appId="impacthub"
          portalUrl="https://auth.senic.com"
        >
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requirePermission="admin.access">
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </SenicAuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

export default App;
```

## Building

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch mode (for development)
npm run dev

# Type check
npm run type-check

# Clean build directory
npm run clean
```

## License

MIT

## Author

SENIC
