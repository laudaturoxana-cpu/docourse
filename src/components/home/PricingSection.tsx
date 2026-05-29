"use client";
import { Check, ArrowRight, Sparkles, Gift, Zap, Star } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useInView";

const starterFeatures = [
  "Cursuri nelimitate",
  "Comunitate inclusă",
  "Membrii comunității → adăugați automat în lista ta",
  "Lecții nelimitate",
  "Fișiere nelimitate — video, audio, PDF, orice",
  "Acces public sau privat",
  "Acces programat pe date",
  "Parcurgere secvențială",
  "Dashboard pentru cursanți",
  "URL-uri personalizabile",
  "Suport în română",
  "0% comision din vânzările tale",
];

const proFeatures = [
  "Tot ce include Starter",
  "Email marketing — liste nelimitate de abonați",
  "Campanii email direct din platformă",
  "Sales page generat cu AI (Gemini)",
  "Buton de plată Stripe pe sales page",
  "Funnel complet: pagină captură + pagină mulțumire",
  "Lead magnet gratuit conectat la lista ta",
  "Statistici vânzări avansate",
  "Suport prioritar",
];

const PricingSection = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const { ref: headerRef, inView: headerIn } = useInView();
  const { ref: cardsRef, inView: cardsIn } = useInView();

  const prices = {
    starter: { monthly: 9, annual: 90 },
    pro: { monthly: 29, annual: 290 },
  };

  const savings = prices.starter.monthly * 12 - prices.starter.annual;

  return (
    <section id="pret" className="py-24 md:py-36 bg-beige/30">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes priceGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(201,168,76,0.4); }
          50% { text-shadow: 0 0 40px rgba(201,168,76,0.8), 0 0 80px rgba(201,168,76,0.3); }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0), 0 20px 60px -10px rgba(28,42,58,0.4); }
          50% { box-shadow: 0 0 30px 2px rgba(201,168,76,0.2), 0 20px 60px -10px rgba(28,42,58,0.5); }
        }
        .shimmer-badge {
          background: linear-gradient(90deg, #C9A84C 0%, #f0d080 40%, #C9A84C 60%, #f0d080 100%);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .pro-glow { animation: borderGlow 3s ease-in-out infinite; }
        .price-glow { animation: priceGlow 2.5s ease-in-out infinite; }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div
            ref={headerRef}
            className={cn(
              "text-center mb-12 md:mb-16 transition-all duration-700 ease-out",
              headerIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium mb-4">
              <Gift className="w-4 h-4" />
              7 zile gratuit
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy mb-6">
              Prețuri <span className="text-gold">simple și transparente</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Fără comisioane din vânzările tale. Testează 7 zile gratuit, anulezi oricând.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center bg-muted rounded-full p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all",
                  billingPeriod === 'monthly'
                    ? "bg-navy text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Lunar
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all relative",
                  billingPeriod === 'annual'
                    ? "bg-navy text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Anual
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-gold text-navy text-xs font-bold rounded-full">
                  -{savings}€
                </span>
              </button>
            </div>
          </div>

          {/* Plan cards */}
          <div
            ref={cardsRef}
            className="grid md:grid-cols-2 gap-6 md:gap-8 items-start"
          >

            {/* Starter */}
            <div className={cn(
              "bg-background rounded-3xl border-2 border-border shadow-sm overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-1 hover:shadow-medium",
              cardsIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              <div className="bg-navy p-6 text-center">
                <h3 className="text-xl font-bold text-primary-foreground mb-1">Starter</h3>
                <p className="text-beige/70 text-sm">Cursuri nelimitate + comunitate, fără comisioane</p>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="text-center mb-6">
                  {billingPeriod === 'monthly' ? (
                    <>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-navy">{prices.starter.monthly}€</span>
                        <span className="text-muted-foreground">/lună</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">După 7 zile gratuit</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-navy">{prices.starter.annual}€</span>
                        <span className="text-muted-foreground">/an</span>
                      </div>
                      <p className="text-sm text-gold font-medium mt-1">
                        {(prices.starter.annual / 12).toFixed(2)}€/lună • Economisești {savings}€
                      </p>
                    </>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {starterFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-gold" />
                      </div>
                      <span className="text-charcoal">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/pricing">
                  <Button variant="outline" size="lg" className="w-full group border-navy text-navy hover:bg-navy hover:text-white">
                    Începe 7 zile gratuit
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pro */}
            {/* Outer wrapper: no overflow-hidden, makes room for badge above */}
            <div className={cn(
              "relative pt-5 transition-all duration-500 delay-150",
              cardsIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              {/* Badge — outside the card so it never gets clipped */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-gold shadow-gold">
                <Star className="w-3.5 h-3.5 text-navy fill-navy flex-shrink-0" />
                <span className="text-navy text-xs font-black tracking-wide uppercase whitespace-nowrap">Cel mai popular</span>
                <Star className="w-3.5 h-3.5 text-navy fill-navy flex-shrink-0" />
              </div>

              {/* Inner card — overflow-hidden safe, badge nu mai e înăuntru */}
              <div className="relative rounded-3xl overflow-hidden flex flex-col pro-glow">
                {/* Dark gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1C2A3A] via-[#1a2535] to-[#0f1820]" />
                {/* Gold border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-gold/50 pointer-events-none" />
                {/* Subtle gold glow top */}
                <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
                  style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, hsl(38 52% 62%) 0%, transparent 65%)" }}
                />

                {/* Header */}
                <div className="relative z-10 px-8 pt-8 pb-6 text-center border-b border-gold/20">
                  <h3 className="text-2xl font-black text-white mb-1">Pro</h3>
                  <p className="text-beige/50 text-sm">Email marketing + AI + funnel — tot ecosistemul tău</p>
                </div>

                {/* Price */}
                <div className="relative z-10 px-8 py-6 text-center">
                  {billingPeriod === 'monthly' ? (
                    <>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-6xl font-black text-white price-glow">{prices.pro.monthly}€</span>
                        <span className="text-beige/50 text-lg">/lună</span>
                      </div>
                      <p className="text-sm text-beige/40 mt-2">După 7 zile gratuit</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-6xl font-black text-white price-glow">{prices.pro.annual}€</span>
                        <span className="text-beige/50 text-lg">/an</span>
                      </div>
                      <p className="text-sm mt-2">
                        <span className="shimmer-badge font-semibold">
                          {(prices.pro.annual / 12).toFixed(2)}€/lună — economisești bani
                        </span>
                      </p>
                    </>
                  )}
                </div>

                {/* Features */}
                <div className="relative z-10 px-8 pb-8 flex flex-col">
                  <ul className="space-y-3.5 mb-8">
                    {proFeatures.map((f, i) => (
                      <li key={f} className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                          <Zap className="w-3 h-3 text-gold" />
                        </div>
                        <span className={cn(
                          "font-medium",
                          i === 0 ? "text-beige/60 italic text-xs" : "text-beige/90"
                        )}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/pricing">
                    <Button
                      variant="gold"
                      size="lg"
                      className="w-full group text-base font-bold py-6 shadow-gold hover:shadow-[0_8px_30px_-4px_rgba(201,168,76,0.6)] transition-shadow"
                    >
                      <Sparkles className="mr-2 w-5 h-5" />
                      Începe 7 zile gratuit
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              Plată securizată prin Stripe • Anulezi oricând • Fără comisioane din vânzările tale
            </p>
            <p className="mt-2 text-muted-foreground">
              Ai întrebări? Scrie-ne la{" "}
              <a href="mailto:contact@docourse.ro" className="text-sky hover:text-sky-light underline">
                contact@docourse.ro
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
