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
export declare function useSubscription(): UseSubscriptionReturn;
//# sourceMappingURL=useSubscription.d.ts.map