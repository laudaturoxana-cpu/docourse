"use client";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import PlanSelectionDialog from "./PlanSelectionDialog";

const FinalCTASection = () => {
  const [showPlanDialog, setShowPlanDialog] = useState(false);

  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Începe astăzi
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy mb-6 leading-tight">
            Construiește-ți afacerea din{" "}
            <span className="text-gold">cunoașterea ta</span>.
          </h2>

          <p className="text-xl text-charcoal/80 mb-10 leading-relaxed">
            Cursuri profesionale, o comunitate angajată și email marketing pentru a rămâne conectat cu audiența ta —
            totul fără comisioane din vânzările tale.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              variant="hero" 
              size="xl" 
              className="group"
              onClick={() => setShowPlanDialog(true)}
            >
              Activează abonamentul
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Fără contract
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Anulezi oricând
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              0% comision
            </div>
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

export default FinalCTASection;
