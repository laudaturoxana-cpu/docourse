"use client";
import { useState } from "react";
import { Check, Zap, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "sonner";

const STARTER_FEATURES = [
  "Cursuri nelimitate",
  "Lecții nelimitate",
  "Fișiere nelimitate — video, audio, PDF, orice",
  "Acces public sau privat",
  "Acces programat pe date",
  "Parcurgere secvențială",
  "Dashboard pentru cursanți",
  "Comunitate inclusă",
  "URL-uri personalizabile",
  "Suport în română",
  "Fără comisioane la vânzări",
];

const PRO_FEATURES = [
  "Tot ce include Starter",
  "Sales page generat cu AI (Gemini)",
  "Buton de plată Stripe pe sales page",
  "Sau link Calendly / WhatsApp",
  "Statistici vânzări avansate",
  "Suport prioritar",
];

export default function Pricing() {
  const { user, isLoading: authLoading } = useAuth();
  const { planType, hasActiveSubscription } = useSubscriptionCheck();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const prices = {
    starter: { monthly: "9€", annual: "90€" },
    pro: { monthly: "29€", annual: "290€" },
  };

  const handleCheckout = async (selectedPlan: "starter" | "pro") => {
    if (hasActiveSubscription && planType === selectedPlan) {
      toast.info("Ești deja pe acest plan.");
      return;
    }

    setLoadingPlan(selectedPlan);
    try {
      const { data, error } = await supabase.functions.invoke("create-platform-checkout", {
        body: {
          planType: selectedPlan,
          billingPeriod,
          userId: user?.id || null,
          userEmail: user?.email || null,
          // successUrl left empty — function decides based on userId
          cancelUrl: `${window.location.origin}/pricing`,
        },
      });

      if (data?.error) {
        toast.error(data.error);
        return;
      }
      if (error) {
        toast.error("Eroare la inițierea plății. Încearcă din nou.");
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err?.message || "Eroare. Încearcă din nou.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (plan: "starter" | "pro") =>
    hasActiveSubscription && planType === plan;

  // Never block — if subscription seems active but user tries to pay, let Stripe handle it
  const btnDisabled = (plan: "starter" | "pro") =>
    loadingPlan !== null;

  const btnLabel = (plan: "starter" | "pro") => {
    if (loadingPlan === plan) return <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Se procesează...</>;
    if (isCurrentPlan(plan)) return <>Reactivează abonamentul <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>;
    return <>Începe 7 zile gratuit <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>;
  };

  return (
    <>
      


      

      <Header />

      <main className="min-h-screen bg-background pt-32 pb-16 px-4">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-navy mb-4">Prețuri simple și transparente</h1>
            <p className="text-muted-foreground text-lg">
              Fără comisioane din vânzările tale. Primele 7 zile sunt gratuite.
            </p>

            <div className="inline-flex items-center gap-3 mt-8 bg-muted rounded-full p-1">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  billingPeriod === "monthly"
                    ? "bg-background text-foreground shadow"
                    : "text-muted-foreground"
                }`}
              >
                Lunar
              </button>
              <button
                onClick={() => setBillingPeriod("annual")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  billingPeriod === "annual"
                    ? "bg-background text-foreground shadow"
                    : "text-muted-foreground"
                }`}
              >
                Anual
                <span className="ml-2 text-xs bg-gold text-navy px-2 py-0.5 rounded-full font-semibold">-17%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* Starter */}
            <div className={`rounded-2xl border-2 p-8 flex flex-col ${
              isCurrentPlan("starter") ? "border-gold ring-2 ring-gold" : "border-border"
            }`}>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-navy mb-1">Starter</h2>
                <p className="text-muted-foreground text-sm">Tot ce ai nevoie să îți lansezi cursurile.</p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-navy">{prices.starter[billingPeriod]}</span>
                  <span className="text-muted-foreground">/{billingPeriod === "monthly" ? "lună" : "an"}</span>
                </div>
                <p className="text-sm text-gold font-medium mt-1">7 zile gratuit — cardul se solicită la înscriere</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {STARTER_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-gold flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full group"
                variant={isCurrentPlan("starter") ? "outline" : "default"}
                disabled={btnDisabled("starter")}
                onClick={() => handleCheckout("starter")}
              >
                {btnLabel("starter")}
              </Button>
            </div>

            {/* Pro */}
            <div className={`rounded-2xl border-2 p-8 flex flex-col relative overflow-hidden ${
              isCurrentPlan("pro") ? "border-gold ring-2 ring-gold" : "border-gold bg-gold/5"
            }`}>
              <div className="absolute top-4 right-4">
                <span className="bg-gold text-navy text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Popular
                </span>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-navy mb-1">Pro</h2>
                <p className="text-muted-foreground text-sm">Sales page cu AI și unelte de vânzare incluse.</p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-navy">{prices.pro[billingPeriod]}</span>
                  <span className="text-muted-foreground">/{billingPeriod === "monthly" ? "lună" : "an"}</span>
                </div>
                <p className="text-sm text-gold font-medium mt-1">7 zile gratuit — cardul se solicită la înscriere</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Sparkles className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full group bg-gold hover:bg-gold/90 text-navy font-semibold"
                disabled={btnDisabled("pro")}
                onClick={() => handleCheckout("pro")}
              >
                {btnLabel("pro")}
              </Button>
            </div>

          </div>

          <p className="text-center text-muted-foreground text-sm mt-10">
            Plată securizată prin Stripe • Anulezi oricând • Fără comisioane
          </p>
        </div>
      </main>
    </>
  );
}
