// ============================================================
// useSubscription Hook - SENIC Auth Package
// Access subscription plan, features, and limits
// ============================================================

import { useAuth } from '../context/AuthContext';
import { SubscriptionPlan, SubscriptionStatus } from '../utils/types';

export interface UseSubscriptionReturn {
  plan: SubscriptionPlan | null;
  status: SubscriptionStatus | null;
  features: string[];
  limits: Record<string, number>;
  hasFeature: (feature: string) => boolean;
  checkLimit: (limitKey: string, currentValue: number) => boolean;
  isActive: boolean;
}

/**
 * Hook to access subscription information
 */
export function useSubscription(): UseSubscriptionReturn {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return {
      plan: null,
      status: null,
      features: [],
      limits: {},
      hasFeature: () => false,
      checkLimit: () => false,
      isActive: false,
    };
  }

  /**
   * Check if user has a specific feature
   */
  const hasFeature = (feature: string): boolean => {
    return user.planFeatures.includes(feature);
  };

  /**
   * Check if current value is within limit
   * Returns true if within limit or no limit exists
   */
  const checkLimit = (limitKey: string, currentValue: number): boolean => {
    const limit = user.planLimits[limitKey];
    if (limit === undefined || limit === null) return true; // No limit = unlimited
    if (limit === -1) return true; // -1 = unlimited
    return currentValue < limit;
  };

  /**
   * Check if subscription is active
   */
  const isActive = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';

  return {
    plan: user.subscriptionPlan,
    status: user.subscriptionStatus,
    features: user.planFeatures,
    limits: user.planLimits,
    hasFeature,
    checkLimit,
    isActive,
  };
}
