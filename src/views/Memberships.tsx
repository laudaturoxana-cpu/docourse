"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
;
import { Crown, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/browser";

interface MembershipPlan {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  price_info: string | null;
  benefits: string | null;
  status: string;
}

const Memberships = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from("membership_plans")
        .select("id, title, slug, short_description, price_info, benefits, status")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPlans(data as MembershipPlan[]);
      }
      setIsLoading(false);
    };

    fetchPlans();
  }, []);

  return (
    <>
      


      

      <div className="min-h-screen flex flex-col bg-beige/30">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-12 lg:py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">Beneficii exclusive</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-navy mb-6">
              Alege planul tău de <span className="text-gold">Membership</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Accesează cursuri premium, resurse exclusive și comunități private. 
              Investește în dezvoltarea ta și fă parte din comunitatea DoCourse.
            </p>
          </div>

          {/* Membership Plans Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
            </div>
          ) : plans.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-12 text-center">
                <Crown className="w-16 h-16 text-gold mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-navy mb-3">
                  Memberships în curând
                </h2>
                <p className="text-muted-foreground">
                  Momentan nu sunt planuri de membership disponibile. 
                  Verifică din nou în curând pentru oferte exclusive!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.map((plan) => {
                const benefits = plan.benefits 
                  ? plan.benefits.split('\n').filter(b => b.trim()) 
                  : [];

                return (
                  <Card 
                    key={plan.id} 
                    className="flex flex-col hover:shadow-xl hover:border-gold/30 transition-all duration-300 group"
                  >
                    <CardHeader className="border-b border-border bg-gradient-to-br from-gold/5 to-transparent">
                      <div className="flex items-center justify-between mb-2">
                        <Crown className="w-8 h-8 text-gold" />
                        <Badge variant="secondary" className="bg-gold/20 text-gold">
                          Popular
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-2xl mb-2">{plan.title}</CardTitle>
                      
                      {plan.short_description && (
                        <CardDescription className="text-base">
                          {plan.short_description}
                        </CardDescription>
                      )}
                      
                      {plan.price_info && (
                        <div className="mt-4">
                          <p className="text-3xl font-bold text-gold">{plan.price_info}</p>
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="flex-1 p-6 space-y-6">
                      {/* Benefits */}
                      {benefits.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-navy flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-gold" />
                            Beneficii incluse
                          </h3>
                          <ul className="space-y-2">
                            {benefits.map((benefit, index) => (
                              <li 
                                key={index} 
                                className="flex items-start gap-2 text-muted-foreground"
                              >
                                <CheckCircle className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* CTA Button */}
                      <Link href={`/membership/${plan.slug}`} className="block">
                        <Button 
                          variant="hero" 
                          className="w-full group-hover:scale-105 transition-transform"
                          size="lg"
                        >
                          Alege acest plan
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Memberships;
