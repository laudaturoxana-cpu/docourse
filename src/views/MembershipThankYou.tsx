"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Sparkles, Crown, ArrowRight, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "sonner";

const MembershipThankYou = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const [processing, setProcessing] = useState(true);
  const [subscriptionActivated, setSubscriptionActivated] = useState(false);
  const [membershipTitle, setMembershipTitle] = useState<string>("");

  useEffect(() => {
    const activateSubscription = async () => {
      const sessionId = searchParams?.get("session_id");
      
      if (!sessionId) {
        toast.error("Invalid payment session");
        setProcessing(false);
        return;
      }

      // Așteaptă user să fie logat
      if (!user) {
        setProcessing(false);
        return;
      }

      try {
        // Verifică dacă subscription-ul există deja pentru acest session
        const { data: existingSubscription } = await (supabase as any)
          .from("membership_subscriptions")
          .select("id, membership_plans(title)")
          .eq("stripe_session_id", sessionId)
          .single();

        if (existingSubscription) {
          // Subscription deja activat
          setSubscriptionActivated(true);
          const membershipPlan = existingSubscription.membership_plans as { title?: string } | null;
          setMembershipTitle(membershipPlan?.title || "Premium Membership");
          setProcessing(false);
          return;
        }

        // Caută membership plan ID din session_id stored în URL sau query params
        const planId = searchParams?.get("plan_id");
        
        if (!planId) {
          toast.error("Membership plan not found");
          setProcessing(false);
          return;
        }

        // Obține detalii membership plan
        const { data: plan, error: planError } = await supabase
          .from("membership_plans")
          .select("id, title")
          .eq("id", planId)
          .single();

        if (planError || !plan) {
          toast.error("Membership plan not found");
          setProcessing(false);
          return;
        }

        // Creează subscription nou
        const { data: newSubscription, error: subscriptionError } = await (supabase as any)
          .from("membership_subscriptions")
          .insert({
            user_id: user.id,
            membership_plan_id: plan.id,
            stripe_session_id: sessionId,
            status: "active",
          })
          .select()
          .single();

        if (subscriptionError) {
          console.error("Error creating subscription:", subscriptionError);
          toast.error("Failed to activate membership: " + subscriptionError.message);
          setProcessing(false);
          return;
        }

        setMembershipTitle(plan.title);
        setSubscriptionActivated(true);
        toast.success("Membership activated successfully! 🎉");
        setProcessing(false);
      } catch (error) {
        console.error("Error activating subscription:", error);
        toast.error("An error occurred while activating your membership");
        setProcessing(false);
      }
    };

    if (user) {
      activateSubscription();
    }
  }, [user, searchParams]);

  if (processing) {
    return (
      <div className="min-h-screen bg-beige/30 flex flex-col">
        <header className="border-b border-border bg-background">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Logo size="md" />
            </Link>
          </div>
        </header>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-gold animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-navy mb-2">
              Procesăm plata ta...
            </h2>
            <p className="text-muted-foreground">
              Activăm membership-ul tău. Te rugăm să aștepți.
            </p>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        

        

        <div className="min-h-screen bg-beige/30 flex flex-col">
          <header className="border-b border-border bg-background">
            <div className="container mx-auto px-4 py-4">
              <Link href="/">
                <Logo size="md" />
              </Link>
            </div>
          </header>
          
          <main className="flex-1 flex items-center justify-center py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center">
                <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-8">
                  <CheckCircle className="w-12 h-12 text-gold" />
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-bold text-navy mb-4">
                  Plata a fost procesată cu succes!
                </h1>
                
                <p className="text-lg text-muted-foreground mb-8">
                  Pentru a finaliza activarea membership-ului tău, te rugăm să te loghezi sau să creezi un cont.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}>
                    <Button size="lg" variant="hero" className="w-full sm:w-auto">
                      <Crown className="mr-2 h-5 w-5" />
                      Loghează-te pentru a activa
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      

      

      <div className="min-h-screen bg-beige/30 flex flex-col">
        <header className="border-b border-border bg-background">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Logo size="md" />
            </Link>
          </div>
        </header>
        
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="border-2 border-gold/20 bg-background shadow-xl">
                <CardContent className="p-8 lg:p-12">
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold to-gold/70 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <CheckCircle className="w-14 h-14 text-white" />
                    </div>
                    
                    <h1 className="text-3xl lg:text-4xl font-bold text-navy mb-4">
                      Bun venit la {membershipTitle || "Premium Membership"}!
                    </h1>
                    
                    <p className="text-lg text-muted-foreground mb-2">
                      Plata ta a fost procesată cu succes și membership-ul tău a fost activat.
                    </p>
                    
                    <p className="text-muted-foreground">
                      Acum ai acces complet la toate beneficiile membership-ului tău.
                    </p>
                  </div>

                  {subscriptionActivated && (
                    <div className="bg-gold/5 border border-gold/20 rounded-xl p-6 mb-8">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-navy mb-2">
                            Ce urmează?
                          </h3>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>✓ Verifică email-ul pentru confirmarea plății</li>
                            <li>✓ Accesează dashboard-ul pentru a vedea membership-ul tău</li>
                            <li>✓ Explorează toate beneficiile incluse</li>
                            <li>✓ Dacă ai început cu un trial gratuit, prima plată va avea loc după terminarea acestuia. Poți vedea toate detaliile în secțiunea „Abonamente active”.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      className="flex-1 bg-navy hover:bg-navy/90 text-white"
                      onClick={() => router.push("/dashboard")}
                    >
                      Mergi la Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push("/")}
                    >
                      Înapoi la Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default MembershipThankYou;
