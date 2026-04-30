"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Crown, ArrowRight, Sparkles, Gift, Users } from "lucide-react";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/browser";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface MembershipData {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  price_info: string | null;
  benefits: string | null;
  includes_resources: string | null;
  has_stripe_checkout: boolean;
  creator_name: string;
  trial_days?: number | null;
}

interface MemberPreview {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

const PublicMembership = () => {
  const _params = useParams<{ slug: string }>();
  const slug = _params?.slug;
  const router = useRouter();
  const { user } = useAuth();
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [members, setMembers] = useState<MemberPreview[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchMembership = async () => {
      if (!slug) return;

      try {
        // Use RPC function to get safe public membership data (hides sensitive Stripe/creator data)
        const { data, error } = await (supabase as any)
          .rpc("get_public_membership", { _slug: slug });

        if (error) throw error;
        if (!data || data.length === 0) throw new Error("Membership not found");
        
        setMembership(data[0] as MembershipData);

        // Fetch members for social proof
        const { data: subscriptions, count } = await supabase
          .from("membership_subscriptions")
          .select("user_id, profiles!inner(id, full_name, avatar_url)", { count: 'exact' })
          .eq("membership_plan_id", data[0].id)
          .eq("status", "active")
          .limit(5);

        if (subscriptions) {
          const memberPreviews: MemberPreview[] = subscriptions.map((sub) => {
            const profile = sub.profiles as unknown as { id: string; full_name: string; avatar_url: string | null };
            return {
              id: profile.id,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
            };
          });
          setMembers(memberPreviews);
          setMemberCount(count || 0);
        }
      } catch (error) {
        console.error("Error fetching membership:", error);
        toast.error("Membership plan not found");
      } finally {
        setLoading(false);
      }
    };

    fetchMembership();
  }, [slug]);

  const handleFreeJoin = async () => {
    if (!membership) return;

    if (!user) {
      // Redirect to login with return URL
      toast.info("Te rugăm să te autentifici pentru a te alătura");
      router.push(`/login?redirect=/membership/${slug}`);
      return;
    }

    setJoining(true);
    try {
      // Check if already subscribed
      const { data: existing } = await supabase
        .from("membership_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("membership_plan_id", membership.id)
        .eq("status", "active")
        .single();

      if (existing) {
        toast.info("Ești deja membru al acestui plan!");
        router.push("/my-memberships");
        return;
      }

      // Create free subscription
      const { error } = await (supabase as any)
        .from("membership_subscriptions")
        .insert({
          user_id: user.id,
          membership_plan_id: membership.id,
          status: "active",
        });

      if (error) throw error;

      toast.success("Te-ai alăturat cu succes!");
      router.push("/my-memberships");
    } catch (error) {
      console.error("Error joining:", error);
      toast.error("Nu s-a putut finaliza înscrierea");
    } finally {
      setJoining(false);
    }
  };

  const handlePaidJoin = async () => {
    if (!membership?.has_stripe_checkout || !user) {
      if (!user) {
        toast.info("Loghează-te pentru a începe trial-ul gratuit");
        router.push(`/login?redirect=/membership/${slug}`);
      }
      return;
    }

    const trialDays = membership.trial_days ?? 7;

    setJoining(true);
    try {
      // Price ID is now fetched server-side for security
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          membershipPlanId: membership.id,
          successUrl: `${window.location.origin}/membership-thank-you?session_id={CHECKOUT_SESSION_ID}&plan_id=${membership.id}`,
          cancelUrl: `${window.location.origin}/membership/${slug}`,
          customerEmail: user.email,
          trialDays
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Eroare la crearea checkout-ului. Te rugăm să încerci din nou.");
    } finally {
      setJoining(false);
    }
  };

  const isFree = !membership?.has_stripe_checkout;
  const trialDays = !isFree ? (membership.trial_days ?? 7) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-beige/30 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!membership) {
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
            <h1 className="text-3xl font-bold text-navy mb-4">Membership Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This membership plan doesn't exist or is no longer active.
            </p>
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const benefits = membership.benefits?.split('\n').filter(b => b.trim()) || [];
  const resources = membership.includes_resources?.split('\n').filter(r => r.trim()) || [];

  return (
    <>
      


      

      <div className="min-h-screen bg-beige/30 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-background sticky top-0 z-50 backdrop-blur-sm bg-background/95">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Contul meu
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-navy via-navy/95 to-navy/90 text-white py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 text-gold mb-6">
                {isFree ? (
                  <>
                    <Gift className="w-4 h-4" />
                    <span className="text-sm font-medium">Membership Gratuit</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-medium">Premium Membership</span>
                  </>
                )}
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                {membership.title}
              </h1>

              {membership.short_description && (
                <p className="text-xl lg:text-2xl text-white/90 mb-8">
                  {membership.short_description}
                </p>
              )}

              {isFree ? (
                <div className="inline-flex items-baseline gap-2 mb-8">
                  <Badge className="bg-green-500 text-white text-2xl px-6 py-2">
                    GRATUIT
                  </Badge>
                </div>
              ) : membership.price_info && (
                <div className="mb-8">
                  <div className="inline-flex items-baseline gap-2">
                    <span className="text-5xl lg:text-6xl font-bold text-gold">
                      {membership.price_info}
                    </span>
                  </div>
                  {trialDays > 0 && (
                    <p className="text-white/80 text-sm mt-3">
                      Încearcă gratuit {trialDays} {trialDays === 1 ? "zi" : "zile"}. 
                      {" "}Prima plată are loc după perioada de trial și poți anula oricând.
                    </p>
                  )}
                </div>
              )}

              <Button
                size="lg"
                className={`font-bold text-lg px-8 py-6 h-auto group ${
                  isFree
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gold hover:bg-gold/90 text-navy"
                }`}
                onClick={isFree ? handleFreeJoin : handlePaidJoin}
                disabled={joining}
              >
                {isFree ? (
                  <>
                    <Gift className="mr-2 h-5 w-5" />
                    {joining ? "Se procesează..." : "Alătură-te gratuit"}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    {joining ? "Se procesează..." : "Începe trial-ul gratuit"}
                  </>
                )}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Social Proof - Member Count */}
              {memberCount > 0 && (
                <div className="mt-8 flex flex-col items-center gap-3">
                  <div className="flex -space-x-3">
                    {members.map((member, idx) => (
                      <div
                        key={member.id}
                        className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gold/20"
                        style={{ zIndex: members.length - idx }}
                      >
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gold text-sm font-bold">
                            {member.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))}
                    {memberCount > 5 && (
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-navy flex items-center justify-center text-white text-xs font-bold">
                        +{memberCount - 5}
                      </div>
                    )}
                  </div>
                  <p className="text-white/80 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      <strong className="text-white">{memberCount}</strong> {memberCount === 1 ? 'membru' : 'membri'} s-au alăturat deja
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="flex-1 py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Description */}
                <div>
                  <h2 className="text-3xl font-bold text-navy mb-6">
                    Despre membership
                  </h2>
                  
                  {membership.description && (
                    <div className="prose prose-lg text-muted-foreground mb-8">
                      {membership.description.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-4">{paragraph}</p>
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <p>Creat de <span className="font-medium text-navy">{membership.creator_name}</span></p>
                  </div>
                </div>

                {/* Benefits Card */}
                <div>
                  <Card className="border-2 border-gold/20 bg-background shadow-lg sticky top-24">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-2 mb-6">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isFree ? "bg-green-100" : "bg-gold/10"}`}>
                          {isFree ? (
                            <Gift className="w-6 h-6 text-green-600" />
                          ) : (
                            <Crown className="w-6 h-6 text-gold" />
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-navy">
                          Ce primești
                        </h3>
                      </div>

                      {benefits.length > 0 && (
                        <div className="space-y-4 mb-8">
                          {benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isFree ? "bg-green-100" : "bg-gold/10"}`}>
                                <Check className={`w-4 h-4 ${isFree ? "text-green-600" : "text-gold"}`} />
                              </div>
                              <p className="text-muted-foreground">{benefit}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {resources.length > 0 && (
                        <div className="pt-6 border-t border-border">
                          <h4 className="font-semibold text-navy mb-4">
                            Resurse incluse
                          </h4>
                          <div className="space-y-3">
                            {resources.map((resource, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded bg-sky/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Check className="w-3 h-3 text-sky" />
                                </div>
                                <p className="text-sm text-muted-foreground">{resource}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        size="lg"
                        className={`w-full mt-8 font-bold ${
                          isFree 
                            ? "bg-green-500 hover:bg-green-600 text-white" 
                            : "bg-navy hover:bg-navy/90 text-white"
                        }`}
                        onClick={isFree ? handleFreeJoin : handlePaidJoin}
                        disabled={joining}
                      >
                        {isFree ? (
                          <>
                            {joining ? "Se procesează..." : "Alătură-te gratuit"}
                          </>
                        ) : (
                          <>
                            {joining ? "Se procesează..." : "Începe trial-ul gratuit"}
                          </>
                        )}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>

                      <p className="text-xs text-center text-muted-foreground mt-4">
                        {isFree
                          ? "Accesul este complet gratuit"
                          : trialDays > 0
                            ? `Trial gratuit de ${trialDays} ${trialDays === 1 ? "zi" : "zile"}. Plata este procesată securizat prin Stripe după perioada de trial.`
                            : "Plata securizată prin Stripe"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PublicMembership;
