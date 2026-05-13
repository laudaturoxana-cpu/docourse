import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_active, lifetime_access, beta_tester, role")
    .eq("id", user.id)
    .single();

  // Allow access only if profile exists and subscription is active
  const hasAccess =
    profile?.subscription_active ||
    profile?.lifetime_access ||
    profile?.beta_tester;

  if (!profile || !hasAccess) {
    redirect("/subscription-required");
  }

  return <>{children}</>;
}
