import { ReactNode } from 'react';
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
    UpgradeComponent?: React.ComponentType<{
        feature: string;
        currentPlan: string;
    }>;
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
 * UpgradePrompt component - shows upgrade message if feature is not available
 */
export declare function UpgradePrompt({ feature, children, UpgradeComponent, upgradeUrl, message, }: UpgradePromptProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=UpgradePrompt.d.ts.map