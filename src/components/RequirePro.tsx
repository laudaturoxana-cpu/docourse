"use client";
import Link from "next/link";
import { Zap, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function RequirePro({ children }: { children: React.ReactNode }) {
  const { profile, isLoading, isAdmin } = useAuth();

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#C9A84C] border-t-transparent rounded-full" />
      </div>
    );
  }

  const hasActive = profile.subscription_active || profile.lifetime_access || profile.beta_tester;
  const isPro = (!!hasActive && profile.plan_type === "pro") || profile.lifetime_access || isAdmin;

  if (!isPro) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center px-4">
        <div className="bg-background border border-border rounded-2xl p-10 max-w-md w-full text-center shadow-soft">
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7 text-gold" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-2">Funcție Pro</h1>
          <p className="text-muted-foreground mb-6">
            Această funcție este disponibilă doar pentru planul <strong>Pro</strong>.
            Fă upgrade pentru a accesa Email Marketing și Sales Pages.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/pricing">
              <Button variant="hero" size="lg" className="w-full gap-2">
                <Zap className="w-4 h-4" /> Upgrade la Pro — 29€/lună
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full">
                Înapoi la Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
