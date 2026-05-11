"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CreditCard, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "sonner";

export function SubscriptionRequired() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isPastDue, setIsPastDue] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  useEffect(() => {
    if (!user) return;
    (supabase.from("membership_subscriptions" as Parameters<typeof supabase.from>[0]) as ReturnType<typeof supabase.from>)
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "past_due")
      .limit(1)
      .then(({ data }: { data: { status: string }[] | null }) => {
        if (data && data.length > 0) setIsPastDue(true);
      });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleOpenPortal = async () => {
    if (!user?.email) return;
    setIsLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { email: user.email },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data?.error || "No portal URL");
      }
    } catch {
      toast.error("Nu s-a putut deschide portalul Stripe. Încearcă din nou sau contactează suportul.");
    } finally {
      setIsLoadingPortal(false);
    }
  };

  if (isPastDue) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl border border-destructive/30 p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-3">Plata a eșuat</h1>
          <p className="text-muted-foreground mb-6">
            Ultima ta plată nu a putut fi procesată. Accesul la platformă este suspendat temporar.
            Actualizează metoda de plată pentru a relua accesul imediat.
          </p>
          <div className="space-y-3">
            <Button
              className="w-full bg-gold hover:bg-gold/90 text-navy font-semibold"
              onClick={handleOpenPortal}
              disabled={isLoadingPortal}
            >
              {isLoadingPortal ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Se deschide...</>
              ) : (
                <><CreditCard className="w-4 h-4 mr-2" />Actualizează metoda de plată</>
              )}
            </Button>
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Deconectare
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Problemă? Contactează-ne la{" "}
            <a href="mailto:contact@docourse.ro" className="underline">contact@docourse.ro</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-beige/30 flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl border border-border p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-3">Abonament necesar</h1>
          <p className="text-muted-foreground mb-6">
            Pentru a accesa dashboard-ul și a crea cursuri, ai nevoie de un abonament activ.
            Primele 7 zile sunt gratuite, fără nicio taxă.
          </p>
          <div className="space-y-3">
            <Link href="/pricing">
              <Button className="w-full bg-gold hover:bg-gold/90 text-navy font-semibold">
                Activează abonamentul — 7 zile gratuit
              </Button>
            </Link>
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Deconectare
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
