"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, BookOpen, LogOut, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import PlanSelectionDialog from "@/components/home/PlanSelectionDialog";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "sonner";

export default function SubscriptionRequired() {
  const { profile, user, signOut } = useAuth();
  const router = useRouter();
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleReactivate = async () => {
    // Dacă știm planul anterior → mergem direct la Stripe fără dialog
    const planType = profile?.plan_type || "starter";
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-platform-checkout", {
        body: {
          planType,
          billingPeriod: "monthly",
          userId: user?.id || null,
          userEmail: user?.email || null,
          cancelUrl: `${window.location.origin}/subscription-required`,
        },
      });
      if (data?.error) { toast.error(data.error); return; }
      if (error) { toast.error("Eroare. Încearcă din nou."); return; }
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Eroare. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      

      

      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b px-6 py-4 flex items-center justify-between">
          <Logo />
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Deconectează-te
          </Button>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-8 h-8 text-gold" />
            </div>

            <h1 className="text-2xl font-bold text-navy mb-3">
              Abonamentul tău a expirat
            </h1>
            <p className="text-muted-foreground mb-2">
              Salut{profile?.full_name ? `, ${profile.full_name}` : ""}! Contul tău și toate cursurile tale sunt în siguranță.
            </p>
            <p className="text-muted-foreground mb-8">
              Reactivează abonamentul ca să accesezi din nou platforma.
            </p>

            <div className="bg-muted/50 rounded-xl p-4 mb-8 flex items-center gap-3 text-left">
              <BookOpen className="w-5 h-5 text-gold shrink-0" />
              <p className="text-sm text-muted-foreground">
                Cursurile, studenții și toate datele tale sunt păstrate. Nu se pierde nimic.
              </p>
            </div>

            <Button
              className="w-full bg-gold hover:bg-gold/90 text-navy font-bold text-base py-6 mb-3"
              onClick={handleReactivate}
              disabled={loading}
            >
              <Zap className="w-5 h-5 mr-2" />
              {loading ? "Se procesează..." : `Reactivează abonamentul${profile?.plan_type ? ` (${profile.plan_type === "pro" ? "Pro" : "Starter"})` : ""}`}
            </Button>

            <button
              className="text-xs text-muted-foreground underline mb-3"
              onClick={() => setShowPlanDialog(true)}
            >
              Schimbă planul
            </button>

            <p className="text-xs text-muted-foreground">
              Plată securizată prin Stripe • Anulezi oricând
            </p>
          </div>
        </main>
      </div>

      <PlanSelectionDialog open={showPlanDialog} onOpenChange={setShowPlanDialog} />
    </>
  );
}
