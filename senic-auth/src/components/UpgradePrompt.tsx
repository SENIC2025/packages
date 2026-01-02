// ============================================================
// UpgradePrompt Component - SENIC Auth Package
// Shows upgrade message when feature is not available
// ============================================================

import { ReactNode } from 'react';
import { useSubscription } from '../hooks/useSubscription';

interface UpgradePromptProps {
  /**
   * Required feature to check
   */
  feature: string;
  /**
   * Children to render if feature is available
   */
  children: ReactNode;
  /**
   * Custom upgrade component (optional)
   */
  UpgradeComponent?: React.ComponentType<{ feature: string; currentPlan: string }>;
  /**
   * Upgrade URL (optional)
   */
  upgradeUrl?: string;
  /**
   * Custom message (optional)
   */
  message?: string;
}

/**
 * Default upgrade component
 */
function DefaultUpgrade({
  feature,
  currentPlan,
  upgradeUrl,
  message,
}: {
  feature: string;
  currentPlan: string;
  upgradeUrl?: string;
  message?: string;
}) {
  const defaultMessage = message || `Upgrade your plan to access ${feature}`;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 text-center">
      <div className="text-blue-600 mb-2">
        <svg
          className="w-12 h-12 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Feature Locked</h3>
      <p className="text-gray-600 mb-4">{defaultMessage}</p>
      <p className="text-sm text-gray-500 mb-4">Current plan: {currentPlan}</p>
      {upgradeUrl && (
        <a
          href={upgradeUrl}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Upgrade Now
        </a>
      )}
    </div>
  );
}

/**
 * UpgradePrompt component - shows upgrade message if feature is not available
 */
export function UpgradePrompt({
  feature,
  children,
  UpgradeComponent,
  upgradeUrl,
  message,
}: UpgradePromptProps) {
  const { hasFeature, plan } = useSubscription();

  // Feature is available - render children
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // Feature not available - show upgrade prompt
  if (UpgradeComponent) {
    return <UpgradeComponent feature={feature} currentPlan={plan || 'free'} />;
  }

  return (
    <DefaultUpgrade
      feature={feature}
      currentPlan={plan || 'free'}
      upgradeUrl={upgradeUrl}
      message={message}
    />
  );
}
