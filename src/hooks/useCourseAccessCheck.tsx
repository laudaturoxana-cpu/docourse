import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/lib/supabase/browser";
import { FEATURES } from "@/config/features";

interface CourseAccessResult {
  hasAccess: boolean;
  isCreator: boolean;
  isLoading: boolean;
  membershipTitle?: string;
  requiresMembership: boolean;
}

/**
 * Hook to check if the current user has access to a specific course
 * Access is granted if:
 * 1. User is the course creator
 * 2. User has an active membership that includes this course
 */
export const useCourseAccessCheck = (courseId: string | undefined): CourseAccessResult => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [membershipTitle, setMembershipTitle] = useState<string>();
  const [requiresMembership, setRequiresMembership] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!courseId) {
        setIsLoading(false);
        return;
      }

      if (!FEATURES.memberships) {
        setHasAccess(true);
        setRequiresMembership(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Check if user is the creator
        const { data: course } = await supabase
          .from("courses")
          .select("creator_id, profiles!inner(user_id)")
          .eq("id", courseId)
          .single();

        if (course) {
          const creatorUserId = (course.profiles as unknown as { user_id: string }).user_id;
          const userIsCreator = user?.id === creatorUserId;
          setIsCreator(userIsCreator);

          if (userIsCreator) {
            setHasAccess(true);
            setIsLoading(false);
            return;
          }
        }

        // Check if course is included in any membership plans
        const { data: memberships } = await supabase
          .from("membership_plans")
          .select("id, title, includes_courses")
          .contains("includes_courses", [courseId]);

        if (memberships && memberships.length > 0) {
          setRequiresMembership(true);

          if (user) {
            // Check if user has active subscription to any of these memberships
            const membershipIds = memberships.map(m => m.id);
            const { data: subscription } = await supabase
              .from("membership_subscriptions")
              .select("membership_plans(title)")
              .eq("user_id", user.id)
              .in("membership_plan_id", membershipIds)
              .eq("status", "active")
              .limit(1)
              .single();

            if (subscription) {
              const plan = subscription.membership_plans as { title: string } | null;
              setMembershipTitle(plan?.title);
              setHasAccess(true);
            } else {
              setHasAccess(false);
              setMembershipTitle(memberships[0].title);
            }
          } else {
            setHasAccess(false);
            setMembershipTitle(memberships[0].title);
          }
        } else {
          // Course is not part of any membership - for now deny access
          setRequiresMembership(false);
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Error checking course access:", error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [courseId, user]);

  return {
    hasAccess,
    isCreator,
    isLoading,
    membershipTitle,
    requiresMembership,
  };
};
