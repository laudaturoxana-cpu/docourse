import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/browser";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface MembershipPlan {
  id: string;
  creator_id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  stripe_checkout_url: string | null;
  stripe_price_id: string | null;
  price_info: string | null;
  benefits: string | null;
  includes_resources: string | null;
  includes_courses: string[] | null;
  community_group_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// Subscriber view of membership plan (excludes Stripe internals)
export interface SubscribedMembershipPlan {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  benefits: string | null;
  includes_resources: string | null;
  includes_courses: string[] | null;
  price_monthly: number | null;
  price_annual: number | null;
  trial_days: number;
  status: string;
  creator_id: string;
  community_group_id: string | null;
  created_at: string;
}

export interface MembershipSubscription {
  id: string;
  user_id: string;
  membership_plan_id: string;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
  membership_plan?: SubscribedMembershipPlan;
}

export const useMembership = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's membership plans (for creators)
  const { data: membershipPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ["membershipPlans", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .eq("creator_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MembershipPlan[];
    },
    enabled: !!profile?.id,
  });

  // Fetch user's subscriptions (for students) - uses RPC to avoid exposing Stripe data
  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ["membershipSubscriptions", profile?.user_id],
    queryFn: async () => {
      if (!profile?.user_id) return [];

      // Get subscriptions via secure RPC function (excludes Stripe identifiers)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: subs, error: subsError } = await (supabase as any)
        .rpc("get_user_subscriptions", { _user_id: profile.user_id });

      if (subsError) throw subsError;

      // Get membership plan details via secure RPC function
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: plans, error: plansError } = await (supabase as any)
        .rpc("get_subscribed_membership_plans", { _user_id: profile.user_id });

      if (plansError) throw plansError;

      // Join subscriptions with their plans
      const plansMap = new Map((plans || []).map((p: SubscribedMembershipPlan) => [p.id, p]));
      
      // Sort by created_at descending
      const sortedSubs = (subs || []).sort((a: { created_at: string }, b: { created_at: string }) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      return sortedSubs.map((sub: { membership_plan_id: string }) => ({
        ...sub,
        membership_plan: plansMap.get(sub.membership_plan_id)
      })) as MembershipSubscription[];
    },
    enabled: !!profile?.user_id,
  });

  // Create membership plan
  const createPlanMutation = useMutation({
    mutationFn: async (planData: {
      title: string;
      slug: string;
      description?: string | null;
      short_description?: string | null;
      stripe_checkout_url?: string | null;
      price_info?: string | null;
      benefits?: string | null;
      includes_resources?: string | null;
      includes_courses?: string[] | null;
      status: string;
    }) => {
      if (!profile?.id) throw new Error("Profile not found");

      const { data, error } = await supabase
        .from("membership_plans")
        .insert([{
          ...planData,
          creator_id: profile.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membershipPlans"] });
      toast.success("Membership plan created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create membership plan: " + error.message);
    },
  });

  // Update membership plan
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, ...planData }: Partial<MembershipPlan> & { id: string }) => {
      const { data, error } = await supabase
        .from("membership_plans")
        .update(planData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membershipPlans"] });
      toast.success("Membership plan updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update membership plan: " + error.message);
    },
  });

  // Delete membership plan
  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("membership_plans")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membershipPlans"] });
      toast.success("Membership plan deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete membership plan: " + error.message);
    },
  });

  // Get public membership by slug using RPC function (safe for public access)
  const getPublicMembership = async (slug: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .rpc("get_public_membership", { _slug: slug });

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Membership not found");
    return data[0];
  };

  return {
    membershipPlans,
    isLoadingPlans,
    subscriptions,
    isLoadingSubscriptions,
    createPlan: createPlanMutation.mutate,
    updatePlan: updatePlanMutation.mutate,
    deletePlan: deletePlanMutation.mutate,
    getPublicMembership,
  };
};
