import { useState } from "react";
import { CreditCard, UserPlus, BookPlus, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import PlanSelectionDialog from "./PlanSelectionDialog";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "1",
    icon: CreditCard,
    title: "Activezi abonamentul",
    description: "Plătești rapid prin Stripe. 7 zile gratuit, fără nicio taxă.",
    color: "gold"
  },
  {
    number: "2",
    icon: UserPlus,
    title: "Îți creezi contul de Creator",
    description: "Completezi numele, emailul și parola.",
    color: "navy"
  },
  {
    number: "3",
    icon: BookPlus,
    title: "Îți creezi cursul",
    description: "Adaugi module, lecții, video-uri, PDF-uri, audio, orice. Alegi cum dai acces cursanților și lansezi. Gata.",
    color: "sky"
  },
];

const HowItWorksSection = () => {
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const { ref: headerRef, inView: headerIn } = useInView();
  const { ref: stepsRef, inView: stepsIn } = useInView();
  const { ref: ctaRef, inView: ctaIn } = useInView();

  return (
    <section id="cum-functioneaza" className="py-20 md:py-32 bg-navy text-primary-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div
            ref={headerRef}
            className={cn(
              "text-center mb-16 transition-all duration-700 ease-out",
              headerIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold/20 text-gold text-sm font-medium mb-4">
              Cum funcționează
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              3 pași simpli pentru a-ți lansa{" "}
              <span className="text-gold">cursul în DoCourse</span>
            </h2>
          </div>

          {/* Steps */}
          <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={cn(
                  "relative transition-all duration-700 ease-out",
                  stepsIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                )}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-gold/50 to-transparent -translate-x-1/2 z-0" />
                )}
                
                <div className="relative bg-navy-light/50 backdrop-blur rounded-2xl p-8 border border-primary-foreground/10 hover:border-gold/30 transition-all duration-300 group">
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gold text-navy font-bold text-lg flex items-center justify-center shadow-gold">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                    <step.icon className="w-8 h-8 text-gold" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 text-primary-foreground">{step.title}</h3>
                  <p className="text-beige/70 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            ref={ctaRef}
            className={cn(
              "text-center transition-all duration-700 ease-out",
              ctaIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            <Button 
              variant="gold" 
              size="xl" 
              className="group"
              onClick={() => setShowPlanDialog(true)}
            >
              Începe acum
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      <PlanSelectionDialog 
        open={showPlanDialog} 
        onOpenChange={setShowPlanDialog} 
      />
    </section>
  );
};

export default HowItWorksSection;