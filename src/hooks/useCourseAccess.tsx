import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/browser";
import { useAuth } from "./useAuth";
import { FEATURES } from "@/config/features";

interface CourseAccessResult {
  isLoading: boolean;
  hasAccess: boolean;
  requiresMembership: boolean;
  requiredPlan?: {
    id: string;
    title: string;
    slug: string;
    price_info: string | null;
  };
}

export const useCourseAccess = (courseId: string | undefined) => {
  const { user } = useAuth();
  const [accessResult, setAccessResult] = useState<CourseAccessResult>({
    isLoading: true,
    hasAccess: false,
    requiresMembership: false,
  });

  useEffect(() => {
    const checkAccess = async () => {
      if (!courseId) {
        setAccessResult({
          isLoading: false,
          hasAccess: false,
          requiresMembership: false,
        });
        return;
      }

      if (!FEATURES.memberships) {
        setAccessResult({
          isLoading: false,
          hasAccess: true,
          requiresMembership: false,
        });
        return;
      }

      // Check if course is included in any membership plan
      const { data: plans, error: plansError } = await supabase
        .from("membership_plans")
        .select("id, title, slug, price_info, includes_courses")
        .eq("status", "active")
        .contains("includes_courses", [courseId]);

      if (plansError) {
        console.error("Error checking membership plans:", plansError);
        setAccessResult({
          isLoading: false,
          hasAccess: true, // Allow access on error to avoid blocking
          requiresMembership: false,
        });
        return;
      }

      // If course is not in any plan, allow free access
      if (!plans || plans.length === 0) {
        setAccessResult({
          isLoading: false,
          hasAccess: true,
          requiresMembership: false,
        });
        return;
      }

      // Course requires membership - check if user has active subscription
      if (!user) {
        // User not logged in, show first required plan
        setAccessResult({
          isLoading: false,
          hasAccess: false,
          requiresMembership: true,
          requiredPlan: {
            id: plans[0].id,
            title: plans[0].title,
            slug: plans[0].slug,
            price_info: plans[0].price_info,
          },
        });
        return;
      }

      // Check if user has active subscription to any of these plans
      const planIds = plans.map((p) => p.id);
      const { data: subscriptions, error: subsError } = await supabase
        .from("membership_subscriptions")
        .select("membership_plan_id, status")
        .eq("user_id", user.id)
        .in("membership_plan_id", planIds)
        .eq("status", "active");

      if (subsError) {
        console.error("Error checking subscriptions:", subsError);
        setAccessResult({
          isLoading: false,
          hasAccess: true, // Allow access on error
          requiresMembership: false,
        });
        return;
      }

      // User has active subscription - grant access
      if (subscriptions && subscriptions.length > 0) {
        setAccessResult({
          isLoading: false,
          hasAccess: true,
          requiresMembership: true,
        });
        return;
      }

      // User logged in but no active subscription
      setAccessResult({
        isLoading: false,
        hasAccess: false,
        requiresMembership: true,
        requiredPlan: {
          id: plans[0].id,
          title: plans[0].title,
          slug: plans[0].slug,
          price_info: plans[0].price_info,
        },
      });
    };

    checkAccess();
  }, [courseId, user]);

  return accessResult;
};
