import { Users, BookOpen, Mic, Brain, Briefcase, GraduationCap, Stethoscope } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

const personas = [
  { icon: BookOpen, label: "Creatori de cursuri" },
  { icon: Mic, label: "Coachi" },
  { icon: GraduationCap, label: "Traineri" },
  { icon: Brain, label: "Psihologi" },
  { icon: Briefcase, label: "Consultanți" },
  { icon: Stethoscope, label: "Terapeuți" },
  { icon: Users, label: "Oricine predă online" },
];

const ForWhoSection = () => {
  const { ref: headerRef, inView: headerIn } = useInView();
  const { ref: gridRef, inView: gridIn } = useInView();
  const { ref: cardRef, inView: cardIn } = useInView();

  return (
    <section id="pentru-cine" className="py-14 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div
            ref={headerRef}
            className={cn(
              "text-center mb-16 transition-all duration-700 ease-out",
              headerIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium mb-4">
              Pentru cine este DoCourse
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy mb-6">
              Creatori de cursuri. Coachi. Traineri. Psihologi. Consultanți. Terapeuți.{" "}
              <span className="text-gold">Oricine predă online.</span>
            </h2>
          </div>

          {/* Personas grid */}
          <div
            ref={gridRef}
            className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12"
          >
            {personas.map((persona, index) => (
              <div
                key={persona.label}
                className={cn(
                  "w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)] group flex items-center gap-3 p-4 rounded-xl bg-beige/50 border border-border hover:bg-beige hover:border-gold/30 transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5 cursor-default",
                  gridIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                )}
                style={{ transitionDelay: `${index * 60}ms`, transitionDuration: "600ms", transitionTimingFunction: "ease-out" }}
              >
                <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center group-hover:bg-gold/10 transition-colors flex-shrink-0">
                  <persona.icon className="w-5 h-5 text-navy group-hover:text-gold transition-colors" />
                </div>
                <span className="font-medium text-charcoal text-sm leading-tight">{persona.label}</span>
              </div>
            ))}
          </div>

          {/* Description card */}
          <div
            ref={cardRef}
            className={cn(
              "relative bg-card rounded-2xl p-8 md:p-10 shadow-card border border-border overflow-hidden transition-all duration-700 ease-out",
              cardIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {/* Animated top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/0 via-gold to-gold/0" />
            {/* Background decoration */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

            <p className="text-lg md:text-xl text-charcoal leading-relaxed relative">
              DoCourse este făcut pentru profesioniștii care vor să livreze cursuri online{" "}
              <span className="font-semibold text-navy">fără să se piardă în tehnic</span>.
              Fără Drive, foldere, linkuri împrăștiate și cursanți confuzi.
            </p>
            <p className="text-lg md:text-xl text-charcoal leading-relaxed mt-4 relative">
              Indiferent dacă ești la primul curs sau ai deja experiență cu alte platforme — ai acum un{" "}
              <span className="text-gold font-semibold">spațiu profesionist</span>, în română, construit din feedback real de la creatori ca tine.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForWhoSection;
