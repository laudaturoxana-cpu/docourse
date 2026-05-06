import { useAuth } from '@/hooks/useAuth';

export function useSubscriptionCheck() {
  const { profile, isLoading, isAdmin } = useAuth();

  const hasActiveSubscription = !!(
    profile?.subscription_active ||
    profile?.beta_tester ||
    profile?.lifetime_access
  );

  const planType = profile?.plan_type ?? null;

  // Consistent with RequirePro: lifetime_access and admins are always Pro
  const isPro =
    (hasActiveSubscription && planType === 'pro') ||
    !!profile?.lifetime_access ||
    !!isAdmin;

  return {
    hasActiveSubscription,
    planType,
    isPro,
    isLoading,
    profile,
  };
}
