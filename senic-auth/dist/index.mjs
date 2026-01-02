import { jsx as o, jsxs as g, Fragment as D } from "react/jsx-runtime";
import { createContext as U, useState as P, useEffect as C, useContext as W } from "react";
import { useNavigate as Y, Navigate as Z } from "react-router-dom";
let I = null;
function G(e) {
  I = {
    ...e,
    callbackPath: e.callbackPath || "/auth/callback",
    storageType: e.storageType || "local"
  };
}
function K() {
  return b().storageType || "local";
}
function b() {
  if (!I)
    throw new Error("[SENIC Auth] Configuration not initialized. Wrap your app with <SenicAuthProvider>");
  return I;
}
function R() {
  return `${b().supabaseUrl}/functions/v1`;
}
function Q(e) {
  const t = b(), r = `${window.location.origin}${t.callbackPath}`, n = new URL(`${t.portalUrl}/login`);
  return n.searchParams.set("app", t.appId), n.searchParams.set("redirect_uri", r), n.searchParams.set("state", e), n.toString();
}
function F() {
  const e = q();
  ee(e);
  const t = Q(e);
  window.location.href = t;
}
function X() {
  const e = window.location.hash.substring(1), t = new URLSearchParams(e);
  return {
    accessToken: t.get("access_token"),
    state: t.get("state"),
    error: t.get("error")
  };
}
function N() {
  return K() === "session" ? sessionStorage : localStorage;
}
function $() {
  const t = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency || 0
  ].join("|");
  let r = 0;
  for (let n = 0; n < t.length; n++) {
    const i = t.charCodeAt(n);
    r = (r << 5) - r + i, r = r & r;
  }
  return r.toString(36);
}
function E(e) {
  const t = $(), r = JSON.stringify({ token: e, fingerprint: t });
  N().setItem("senic_auth_token", r);
}
function T() {
  const t = N().getItem("senic_auth_token");
  if (!t) return null;
  try {
    const { token: r, fingerprint: n } = JSON.parse(t);
    return n !== $() ? (console.warn("[SENIC Auth] Token fingerprint mismatch - possible token theft"), w(), null) : r;
  } catch {
    return w(), null;
  }
}
function w() {
  localStorage.removeItem("senic_auth_token"), sessionStorage.removeItem("senic_auth_token");
}
function z(e) {
  try {
    const r = e.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), n = decodeURIComponent(
      atob(r).split("").map((i) => "%" + ("00" + i.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    return JSON.parse(n);
  } catch {
    return null;
  }
}
function M(e) {
  return e.exp * 1e3 < Date.now();
}
function A() {
  const e = T();
  if (!e) return null;
  const t = z(e);
  return t ? M(t) ? (w(), null) : t : null;
}
function q() {
  return crypto.randomUUID();
}
function ee(e) {
  N().setItem("senic_auth_state", e);
}
function te() {
  return N().getItem("senic_auth_state");
}
function j() {
  localStorage.removeItem("senic_auth_state"), sessionStorage.removeItem("senic_auth_state");
}
function ne(e) {
  const t = te();
  return e === t;
}
async function re(e, t) {
  const r = T();
  if (!r)
    return console.warn("[SENIC Auth] No token to refresh"), !1;
  try {
    const n = await fetch(`${e}/exchange-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${r}`
      },
      body: JSON.stringify({ app_id: t })
    });
    if (!n.ok)
      return console.error("[SENIC Auth] Token refresh failed:", n.status), !1;
    const i = await n.json();
    return i.access_token ? (E(i.access_token), console.log("[SENIC Auth] Token refreshed successfully"), !0) : !1;
  } catch (n) {
    return console.error("[SENIC Auth] Token refresh error:", n), !1;
  }
}
async function oe(e, t) {
  const r = T();
  if (!r)
    return { valid: !1, shouldClear: !1 };
  try {
    const n = await fetch(`${e}/exchange-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${r}`
      },
      body: JSON.stringify({ app_id: t })
    });
    if (!n.ok) {
      let s = "unknown";
      try {
        const l = await n.json();
        if (s = l.error || "unknown", l.error === "force_logout")
          return console.warn("[SENIC Auth] Force logout triggered by admin - clearing token"), { valid: !1, shouldClear: !0, reason: "force_logout" };
      } catch {
      }
      return console.warn(`[SENIC Auth] Session validation failed (${s}) - clearing token`), { valid: !1, shouldClear: !0, reason: s };
    }
    const i = await n.json();
    return i.access_token ? (E(i.access_token), { valid: !0, shouldClear: !1 }) : { valid: !1, shouldClear: !0, reason: "no_token_returned" };
  } catch (n) {
    return console.warn("[SENIC Auth] Session validation network error:", n), { valid: !0, shouldClear: !1 };
  }
}
const V = U(void 0);
function S() {
  const e = W(V);
  if (!e)
    throw new Error("useAuth must be used within a SenicAuthProvider");
  return e;
}
function ae(e) {
  return e >= 100 ? "super_admin" : e >= 80 ? "admin" : e >= 60 ? "manager" : e >= 40 ? "editor" : e >= 20 ? "member" : "viewer";
}
function ie(e) {
  return ["starter", "professional", "business", "enterprise"].includes(e) ? e : "starter";
}
function se(e) {
  return ["active", "trialing", "past_due", "canceled", "incomplete"].includes(e) ? e : "active";
}
function we({
  children: e,
  appId: t,
  portalUrl: r,
  supabaseUrl: n,
  callbackPath: i,
  storageType: s,
  onLogout: l
}) {
  G({ appId: t, portalUrl: r, supabaseUrl: n, callbackPath: i, storageType: s });
  const [d, u] = P(null), [k, f] = P(!0), m = (a) => a ? {
    id: a.sub,
    email: a.email,
    name: a.full_name || a.email.split("@")[0],
    displayName: a.full_name || a.email.split("@")[0],
    avatarUrl: a.avatar_url,
    organizationId: a.organization_id,
    organizationName: a.organization_name,
    organizationSlug: a.organization_slug,
    role: ae(a.app_role_level),
    roleLevel: a.app_role_level,
    isOwner: a.is_owner,
    permissions: a.permissions || [],
    enabledModules: a.enabled_modules || [],
    subscriptionPlan: ie(a.subscription_plan),
    subscriptionStatus: se(a.subscription_status),
    planFeatures: a.plan_features || [],
    planLimits: a.plan_limits || {},
    isPlatformAdmin: a.is_platform_admin || !1
  } : null, p = () => {
    try {
      const a = A();
      u(m(a));
    } catch (a) {
      console.error("[SENIC Auth] Error refreshing auth:", a), u(null);
    }
  }, h = async () => {
    try {
      const a = b(), y = R(), { valid: _, shouldClear: v, reason: x } = await oe(y, a.appId);
      if (v)
        console.log(`[SENIC Auth] Session invalid (${x}) - clearing and redirecting to login`), w(), u(null);
      else if (_) {
        const L = A();
        u(m(L));
      }
    } catch (a) {
      console.error("[SENIC Auth] Session validation error:", a);
    } finally {
      f(!1);
    }
  }, B = async () => {
    if (new URLSearchParams(window.location.search).get("verified") === "true") {
      console.log("[SENIC Auth] Detected ?verified=true - refreshing token for updated claims");
      const _ = new URL(window.location.href);
      _.searchParams.delete("verified"), window.history.replaceState({}, "", _.toString());
      try {
        const v = b(), x = R();
        if (await re(x, v.appId)) {
          const H = A();
          u(m(H)), console.log("[SENIC Auth] Token refreshed with updated claims");
        }
      } catch (v) {
        console.error("[SENIC Auth] Failed to refresh token after verification:", v);
      }
    }
  };
  C(() => {
    p(), h(), B();
  }, []), C(() => {
    const y = setInterval(() => {
      d && (console.log("[SENIC Auth] Heartbeat - validating session"), h());
    }, 9e5);
    return () => clearInterval(y);
  }, [d]);
  const J = {
    user: d,
    isAuthenticated: !!d,
    isLoading: k,
    logout: () => {
      w(), u(null), l ? l() : setTimeout(() => {
        F();
      }, 500);
    },
    loginViaPortal: () => {
      F();
    },
    refreshAuth: p
  };
  return /* @__PURE__ */ o(V.Provider, { value: J, children: e });
}
function le() {
  const { user: e, isAuthenticated: t } = S();
  if (!t || !e)
    return {
      plan: null,
      status: null,
      features: [],
      limits: {},
      hasFeature: () => !1,
      checkLimit: () => !1,
      isActive: !1
    };
  const r = (s) => e.planFeatures.includes(s), n = (s, l) => {
    const c = e.planLimits[s];
    return c == null || c === -1 ? !0 : l < c;
  }, i = e.subscriptionStatus === "active" || e.subscriptionStatus === "trialing";
  return {
    plan: e.subscriptionPlan,
    status: e.subscriptionStatus,
    features: e.planFeatures,
    limits: e.planLimits,
    hasFeature: r,
    checkLimit: n,
    isActive: i
  };
}
function ce() {
  const { user: e, isAuthenticated: t } = S();
  if (!t || !e)
    return {
      permissions: [],
      modules: [],
      role: null,
      roleLevel: 100,
      isOwner: !1,
      hasPermission: () => !1,
      hasModule: () => !1,
      canAccess: () => !1,
      isAdminLevel: !1,
      isSuperAdmin: !1
    };
  const r = (c) => e.isOwner || e.role === "super_admin" ? !0 : e.permissions.includes(c), n = (c) => e.isOwner || e.role === "super_admin" ? !0 : e.enabledModules.includes(c), i = (c, d) => {
    const u = r(c);
    return d ? u && n(d) : u;
  }, s = e.role === "admin" || e.role === "super_admin", l = e.role === "super_admin";
  return {
    permissions: e.permissions,
    modules: e.enabledModules,
    role: e.role,
    roleLevel: e.roleLevel,
    isOwner: e.isOwner,
    hasPermission: r,
    hasModule: n,
    canAccess: i,
    isAdminLevel: s,
    isSuperAdmin: l
  };
}
function Se() {
  const { user: e, isLoading: t } = S();
  return {
    /** Whether the current user is a platform admin */
    isPlatformAdmin: (e == null ? void 0 : e.isPlatformAdmin) ?? !1,
    /** Whether authentication is still loading */
    isLoading: t,
    /** Current user object */
    user: e
  };
}
function ue({ logoUrl: e }) {
  return /* @__PURE__ */ o("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ g("div", { className: "text-center", children: [
    e && /* @__PURE__ */ o(
      "img",
      {
        src: e,
        alt: "Logo",
        className: "h-16 mx-auto mb-4 animate-pulse"
      }
    ),
    /* @__PURE__ */ o("p", { className: "text-gray-600", children: "Completing authentication..." })
  ] }) });
}
function de({ error: e, onRetry: t }) {
  return /* @__PURE__ */ o("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ g("div", { className: "bg-white rounded-lg border shadow-lg p-8 max-w-md text-center", children: [
    /* @__PURE__ */ o("h1", { className: "text-xl font-semibold text-gray-800 mb-2", children: "Authentication Failed" }),
    /* @__PURE__ */ o("p", { className: "text-gray-600 mb-6", children: e }),
    /* @__PURE__ */ o(
      "button",
      {
        onClick: t,
        className: "w-full px-4 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors",
        children: "Back to Login"
      }
    )
  ] }) });
}
function ke({
  logoUrl: e,
  redirectTo: t = "/",
  errorRedirectTo: r = "/login",
  LoadingComponent: n,
  ErrorComponent: i
}) {
  const s = Y(), { refreshAuth: l } = S(), [c, d] = P(null);
  C(() => {
    (async () => {
      try {
        const { accessToken: f, state: m, error: p } = X();
        if (p)
          throw new Error(p);
        if (!f)
          throw new Error("No access token received");
        if (!ne(m))
          throw new Error("Invalid state parameter - possible CSRF attack");
        const h = z(f);
        if (!h)
          throw new Error("Invalid token format");
        if (M(h))
          throw new Error("Token has expired");
        if (!h.master_auth)
          throw new Error("Invalid token - not from Master Auth");
        E(f), j(), window.history.replaceState(null, "", window.location.pathname), l(), s(t, { replace: !0 });
      } catch (f) {
        console.error("[SENIC Auth] Callback error:", f), d(f instanceof Error ? f.message : "Authentication failed"), j();
      }
    })();
  }, [s, l, t]);
  const u = () => {
    s(r, { replace: !0 });
  };
  return c ? i ? /* @__PURE__ */ o(i, { error: c, onRetry: u }) : /* @__PURE__ */ o(de, { error: c, onRetry: u }) : n ? /* @__PURE__ */ o(n, {}) : /* @__PURE__ */ o(ue, { logoUrl: e });
}
function O() {
  return /* @__PURE__ */ o("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ g("div", { className: "bg-white rounded-lg border shadow-lg p-8 max-w-md text-center", children: [
    /* @__PURE__ */ o("h1", { className: "text-xl font-semibold text-gray-800 mb-2", children: "Access Denied" }),
    /* @__PURE__ */ o("p", { className: "text-gray-600", children: "You don't have permission to access this resource." })
  ] }) });
}
function fe() {
  return /* @__PURE__ */ o("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ g("div", { className: "text-center", children: [
    /* @__PURE__ */ o("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }),
    /* @__PURE__ */ o("p", { className: "text-gray-600 mt-4", children: "Loading..." })
  ] }) });
}
function ye({
  children: e,
  requirePermission: t,
  requireModule: r,
  redirectTo: n,
  UnauthorizedComponent: i,
  LoadingComponent: s
}) {
  const { isAuthenticated: l, isLoading: c, loginViaPortal: d } = S(), { hasPermission: u, hasModule: k } = ce();
  return c ? s ? /* @__PURE__ */ o(s, {}) : /* @__PURE__ */ o(fe, {}) : l ? t && !u(t) ? i ? /* @__PURE__ */ o(i, {}) : /* @__PURE__ */ o(O, {}) : r && !k(r) ? i ? /* @__PURE__ */ o(i, {}) : /* @__PURE__ */ o(O, {}) : /* @__PURE__ */ o(D, { children: e }) : n ? /* @__PURE__ */ o(Z, { to: n, replace: !0 }) : (d(), null);
}
function he({
  feature: e,
  currentPlan: t,
  upgradeUrl: r,
  message: n
}) {
  const i = n || `Upgrade your plan to access ${e}`;
  return /* @__PURE__ */ g("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 text-center", children: [
    /* @__PURE__ */ o("div", { className: "text-blue-600 mb-2", children: /* @__PURE__ */ o(
      "svg",
      {
        className: "w-12 h-12 mx-auto",
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        children: /* @__PURE__ */ o(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          }
        )
      }
    ) }),
    /* @__PURE__ */ o("h3", { className: "text-lg font-semibold text-gray-800 mb-2", children: "Feature Locked" }),
    /* @__PURE__ */ o("p", { className: "text-gray-600 mb-4", children: i }),
    /* @__PURE__ */ g("p", { className: "text-sm text-gray-500 mb-4", children: [
      "Current plan: ",
      t
    ] }),
    r && /* @__PURE__ */ o(
      "a",
      {
        href: r,
        className: "inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors",
        children: "Upgrade Now"
      }
    )
  ] });
}
function _e({
  feature: e,
  children: t,
  UpgradeComponent: r,
  upgradeUrl: n,
  message: i
}) {
  const { hasFeature: s, plan: l } = le();
  return s(e) ? /* @__PURE__ */ o(D, { children: t }) : r ? /* @__PURE__ */ o(r, { feature: e, currentPlan: l || "free" }) : /* @__PURE__ */ o(
    he,
    {
      feature: e,
      currentPlan: l || "free",
      upgradeUrl: n,
      message: i
    }
  );
}
export {
  ke as AuthCallback,
  ye as ProtectedRoute,
  we as SenicAuthProvider,
  _e as UpgradePrompt,
  Q as buildAuthPortalUrl,
  w as clearToken,
  A as getCurrentUser,
  T as getToken,
  M as isTokenExpired,
  X as parseCallbackHash,
  z as parseJwtPayload,
  F as redirectToAuthPortal,
  E as storeToken,
  S as useAuth,
  ce as usePermissions,
  Se as usePlatformAdmin,
  le as useSubscription
};
//# sourceMappingURL=index.mjs.map
