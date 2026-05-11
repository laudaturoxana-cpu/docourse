"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Zap, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
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

interface PlanSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PlanType = "starter" | "pro";
type BillingPeriod = "monthly" | "annual";

const PlanSelectionDialog = ({ open, onOpenChange }: PlanSelectionDialogProps) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("starter");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const prices = {
    starter: { monthly: 9, annual: 90 },
    pro: { monthly: 29, annual: 290 },
  };

  const savings = prices.starter.monthly * 12 - prices.starter.annual;

  const handleContinue = async () => {
    setLoading(true);
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Eroare. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-navy">
            Alege planul tău
          </DialogTitle>
          <DialogDescription className="text-center">
            7 zile gratuit pentru ambele planuri. Anulezi oricând.
          </DialogDescription>
        </DialogHeader>

        {/* Billing toggle */}
        <div className="flex justify-center mt-2">
          <div className="inline-flex items-center bg-muted rounded-full p-1">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                billingPeriod === "monthly"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground"
              )}
            >
              Lunar
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all relative",
                billingPeriod === "annual"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground"
              )}
            >
              Anual
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-gold text-navy text-[10px] font-bold rounded-full">
                -{savings}€
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-3 py-2">
          {/* Starter */}
          <button
            onClick={() => setSelectedPlan("starter")}
            className={cn(
              "w-full p-4 rounded-xl border-2 text-left transition-all",
              selectedPlan === "starter"
                ? "border-gold bg-gold/5 shadow-md"
                : "border-border hover:border-gold/50"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Starter</div>
                <div className="text-sm text-muted-foreground">Tot ce ai nevoie să lansezi cursuri</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-navy">
                  {billingPeriod === "monthly" ? `${prices.starter.monthly}€` : `${prices.starter.annual}€`}
                </div>
                <div className="text-xs text-muted-foreground">
                  /{billingPeriod === "monthly" ? "lună" : "an"}
                </div>
              </div>
            </div>
            {selectedPlan === "starter" && (
              <ul className="mt-3 space-y-1.5 border-t border-gold/20 pt-3">
                {STARTER_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-foreground">
                    <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </button>

          {/* Pro */}
          <button
            onClick={() => setSelectedPlan("pro")}
            className={cn(
              "w-full p-4 rounded-xl border-2 text-left transition-all relative",
              selectedPlan === "pro"
                ? "border-gold bg-gold/5 shadow-md"
                : "border-border hover:border-gold/50"
            )}
          >
            <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-gold text-navy text-xs font-bold rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" /> Popular
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Pro</div>
                <div className="text-sm text-muted-foreground">Starter + sales page AI și vânzări</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-navy">
                  {billingPeriod === "monthly" ? `${prices.pro.monthly}€` : `${prices.pro.annual}€`}
                </div>
                <div className="text-xs text-muted-foreground">
                  /{billingPeriod === "monthly" ? "lună" : "an"}
                </div>
              </div>
            </div>
            {selectedPlan === "pro" && (
              <ul className="mt-3 space-y-1.5 border-t border-gold/20 pt-3">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </button>
        </div>

        <Button
          variant="hero"
          size="lg"
          className="w-full group"
          onClick={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Se procesează...</>
          ) : (
            <>Începe 7 zile gratuit <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" /></>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Plată securizată prin Stripe • Anulezi oricând • Fără comisioane
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default PlanSelectionDialog;
