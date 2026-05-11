"use client";
import { Star, Quote } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

// Testimoniale reale de la creatori
const testimonials = [
  {
    id: 1,
    name: "Krisztina Szabo",
    role: "Creatoare de cursuri online",
    content: "Îmi place foarte mult cum e gândită platforma. Chiar și pentru noi, care suntem poate mai puțin tehnice, e foarte ușor de folosit urmând pașii. Am încărcat cu ușurință și materiale PDF și video. Mi-a plăcut și că pot să încarc o imagine de background astfel încât să fac și vizual atractive modulele.",
    rating: 5,
    avatar: null,
  },
  {
    id: 2,
    name: "C. P.",
    role: "Creatoare de cursuri online",
    content: "Am reușit să creez și comunitate. Merge super și e foarte intuitivă. Îmi place că pașii sunt foarte ușor de urmați, fără complicații. Funcționează bine!",
    rating: 5,
    avatar: null,
  },
];

const TestimonialsSection = () => {
  const { ref: headerRef, inView: headerIn } = useInView();
  const { ref: cardsRef, inView: cardsIn } = useInView();

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={headerRef}
          className={cn(
            "text-center mb-12 transition-all duration-700 ease-out",
            headerIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <p className="text-sm uppercase tracking-wider text-gold font-semibold mb-3">
            Ce spun creatorii
          </p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-4">
            Povești de la creatori ca tine
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descoperă cum alți profesioniști și-au transformat expertiza în cursuri online de succes.
          </p>
        </div>

        <div ref={cardsRef} className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={cn(
                "bg-white border border-border rounded-2xl p-6 shadow-card hover:shadow-medium hover:-translate-y-1 transition-all duration-300",
                cardsIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${index * 120}ms`, transitionDuration: "700ms" }}
            >
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-beige flex items-center justify-center flex-shrink-0">
                  {testimonial.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-navy">
                      {testimonial.name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Name and role */}
                <div>
                  <h3 className="font-semibold text-navy">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-gold text-gold"
                  />
                ))}
              </div>

              {/* Quote */}
              <div className="relative">
                <Quote className="absolute -top-1 -left-1 w-6 h-6 text-beige" />
                <p className="text-charcoal/80 pl-6 leading-relaxed">
                  {testimonial.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Peste <span className="font-semibold text-navy">50+ creatori</span> din România folosesc DoCourse
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
