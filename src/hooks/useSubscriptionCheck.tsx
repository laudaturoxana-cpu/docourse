import { useAuth } from '@/hooks/useAuth';

export function useSubscriptionCheck() {
  const { profile, isLoading } = useAuth();

  // Check if user has active subscription (or is beta tester / lifetime)
  const hasActiveSubscription =
    profile?.subscription_active ||
    profile?.beta_tester ||
    profile?.lifetime_access;

  const planType = profile?.plan_type ?? null;
  const isPro = !!hasActiveSubscription && planType === 'pro';

  return {
    hasActiveSubscription: !!hasActiveSubscription,
    planType,
    isPro,
    isLoading,
    profile,
  };
}
