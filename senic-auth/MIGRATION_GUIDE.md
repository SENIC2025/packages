# Migration Guide: ImpactHub to @senic/auth

This guide shows how to migrate the ImpactHub application from local auth implementation to the centralized `@senic/auth` package.

## Overview

The `@senic/auth` package extracts all authentication and authorization logic from ImpactHub into a reusable npm package. This provides:

1. **Centralized Auth Logic** - One source of truth for all SENIC apps
2. **Type Safety** - Full TypeScript support
3. **Reusability** - Use in any SENIC React application
4. **Security** - Browser fingerprinting, token management, CSRF protection
5. **Maintainability** - Update auth logic in one place, all apps benefit

## Installation

### Step 1: Install the Package

```bash
# From ImpactHub root directory
cd /Users/nihadalic/Documents/Projects/stefan/ImpactHub

# Install the local package
npm install ./packages/senic-auth
```

This will add `@senic/auth` to your `package.json` dependencies.

## Migration Steps

### Step 2: Update App.tsx

**Before:**
```tsx
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* routes */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

**After:**
```tsx
import { SenicAuthProvider } from '@senic/auth';

function App() {
  return (
    <SenicAuthProvider
      appId="impacthub"
      portalUrl={import.meta.env.VITE_MASTER_AUTH_PORTAL_URL}
    >
      <Router>
        <Routes>
          {/* routes */}
        </Routes>
      </Router>
    </SenicAuthProvider>
  );
}
```

### Step 3: Update AuthCallback Page

**Before:**
```tsx
// src/pages/AuthCallback.tsx
import { useAuth } from '@/contexts/AuthContext';
import { parseCallbackHash, /* ... */ } from '@/lib/masterAuth';

export default function AuthCallback() {
  const { refreshAuth } = useAuth();
  // ... complex callback logic
}
```

**After:**
```tsx
// src/pages/AuthCallback.tsx
import { AuthCallback } from '@senic/auth';

export default function AuthCallbackPage() {
  return (
    <AuthCallback
      logoUrl="/senic-icon-transparent.png"
      redirectTo="/"
      errorRedirectTo="/login"
    />
  );
}
```

### Step 4: Update Components Using Auth

**Before:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.displayName}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**After:**
```tsx
import { useAuth } from '@senic/auth';

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.displayName}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**Change:** Only the import path changes. The API is identical.

### Step 5: Update Subscription Checks

**Before:**
```tsx
import { useSubscription } from '@/contexts/AuthContext';

function FeatureComponent() {
  const { hasFeature } = useSubscription();

  if (!hasFeature('advanced_reports')) {
    return <div>Upgrade to access this feature</div>;
  }

  return <AdvancedReports />;
}
```

**After:**
```tsx
import { UpgradePrompt } from '@senic/auth';

function FeatureComponent() {
  return (
    <UpgradePrompt
      feature="advanced_reports"
      upgradeUrl="https://senic.com/pricing"
    >
      <AdvancedReports />
    </UpgradePrompt>
  );
}

// Or using the hook directly:
import { useSubscription } from '@senic/auth';

function FeatureComponent() {
  const { hasFeature } = useSubscription();

  if (!hasFeature('advanced_reports')) {
    return <div>Upgrade to access this feature</div>;
  }

  return <AdvancedReports />;
}
```

### Step 6: Update Permission Checks

**Before:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function AdminPanel() {
  const { hasPermission, hasModule } = useAuth();

  if (!hasPermission('admin.access')) {
    return <div>Access denied</div>;
  }

  return <AdminContent />;
}
```

**After:**
```tsx
import { usePermissions } from '@senic/auth';

function AdminPanel() {
  const { hasPermission, hasModule } = usePermissions();

  if (!hasPermission('admin.access')) {
    return <div>Access denied</div>;
  }

  return <AdminContent />;
}

// Or use ProtectedRoute:
import { ProtectedRoute } from '@senic/auth';

<Route path="/admin" element={
  <ProtectedRoute requirePermission="admin.access">
    <AdminPanel />
  </ProtectedRoute>
} />
```

### Step 7: Update Login/Logout Logic

**Before:**
```tsx
import { useAuth } from '@/contexts/AuthContext';
import { redirectToAuthPortal } from '@/lib/masterAuth';

function LoginPage() {
  const handleLogin = () => {
    redirectToAuthPortal();
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

**After:**
```tsx
import { useAuth } from '@senic/auth';

function LoginPage() {
  const { loginViaPortal } = useAuth();

  return <button onClick={loginViaPortal}>Login</button>;
}
```

## Import Path Changes

### Old Imports → New Imports

| Old | New |
|-----|-----|
| `import { useAuth } from '@/contexts/AuthContext'` | `import { useAuth } from '@senic/auth'` |
| `import { useSubscription } from '@/contexts/AuthContext'` | `import { useSubscription } from '@senic/auth'` |
| `import { redirectToAuthPortal } from '@/lib/masterAuth'` | `import { useAuth } from '@senic/auth'` then use `loginViaPortal()` |
| `import { getCurrentMasterAuthUser } from '@/lib/masterAuth'` | `import { getCurrentUser } from '@senic/auth'` |
| `import { MasterAuthToken } from '@/lib/masterAuth'` | `import type { MasterAuthToken } from '@senic/auth'` |

## Files That Can Be Removed

After migration is complete and tested, these files can be removed:

1. ❌ `src/lib/masterAuth.ts` - All logic moved to package
2. ❌ `src/contexts/AuthContext.tsx` - Replaced by `@senic/auth`
3. ❌ `src/pages/AuthCallback.tsx` - Use `<AuthCallback />` component instead

**Important:** Don't delete these files until you've fully migrated and tested!

## New Features Available

### 1. ProtectedRoute Component

```tsx
import { ProtectedRoute } from '@senic/auth';

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// With permission check
<Route path="/admin" element={
  <ProtectedRoute requirePermission="admin.access">
    <AdminPanel />
  </ProtectedRoute>
} />

// With module check
<Route path="/esg" element={
  <ProtectedRoute requireModule="esg-assessment">
    <ESGAssessment />
  </ProtectedRoute>
} />
```

### 2. UpgradePrompt Component

```tsx
import { UpgradePrompt } from '@senic/auth';

<UpgradePrompt
  feature="advanced_reports"
  upgradeUrl="https://senic.com/pricing"
  message="Advanced reports are available on Business plans and above"
>
  <AdvancedReportsPanel />
</UpgradePrompt>
```

### 3. usePermissions Hook

```tsx
import { usePermissions } from '@senic/auth';

const {
  permissions,
  modules,
  role,
  roleLevel,
  isOwner,
  hasPermission,
  hasModule,
  canAccess,
  isAdminLevel,
  isSuperAdmin,
} = usePermissions();
```

## Testing the Migration

### 1. Verify Auth Flow

```bash
# Start development server
npm run dev

# Test these flows:
1. Login via portal (redirects to /auth/callback)
2. Callback completes successfully
3. User object is populated
4. Protected routes work
5. Permission checks work
6. Logout works
```

### 2. Check Console for Errors

Look for:
- ❌ Import errors (wrong paths)
- ❌ Type errors (missing types)
- ❌ Runtime errors (missing properties)

### 3. Verify Security Features

```typescript
// In browser console after login:
sessionStorage.getItem('senic_auth_token')
// Should return a JSON object with token + fingerprint

// Try copying token to different browser
// Should be rejected with fingerprint mismatch warning
```

## Rollback Plan

If something goes wrong:

### Quick Rollback
```bash
# Remove the package
npm uninstall @senic/auth

# Revert import changes
git checkout src/

# Clear any built files
npm run clean
npm install
```

### Gradual Migration
Keep both implementations running side-by-side:
- Use `@senic/auth` for new features
- Keep old implementation for existing features
- Migrate piece by piece
- Remove old implementation when confident

## Benefits After Migration

1. ✅ **Cleaner codebase** - Auth logic centralized
2. ✅ **Type safety** - Full TypeScript support
3. ✅ **Reusability** - Use in other SENIC apps
4. ✅ **Better components** - ProtectedRoute, UpgradePrompt, etc.
5. ✅ **Easier testing** - Import from package, not local files
6. ✅ **Updates in one place** - Fix auth bug once, all apps benefit

## Next Steps

1. Install the package
2. Update imports (use Find & Replace)
3. Test thoroughly
4. Remove old files
5. Commit changes
6. Deploy

## Questions?

See full documentation in:
- `packages/senic-auth/README.md` - Complete API reference
- `packages/senic-auth/PACKAGE_SUMMARY.md` - Build details

## Example Migration Commit

```bash
# After migration is complete:
git add .
git commit -m "feat: migrate to @senic/auth package

- Replace local auth implementation with @senic/auth package
- Update all imports from @/contexts/AuthContext to @senic/auth
- Replace AuthCallback page with <AuthCallback /> component
- Add ProtectedRoute components for auth guards
- Remove deprecated src/lib/masterAuth.ts and src/contexts/AuthContext.tsx

All existing functionality preserved with identical API.
New features: ProtectedRoute, UpgradePrompt, usePermissions hook."
```
