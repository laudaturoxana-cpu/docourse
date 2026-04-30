"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function SubscriptionRequired() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

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
