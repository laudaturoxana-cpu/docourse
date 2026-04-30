"use client";
import { GraduationCap, CheckCircle2, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

const PlatformaCursuriEducatori = () => {
  const faqs = [
    {
      question: "Este potrivită pentru educatori?",
      answer: "Da. DoCourse oferă structură clară și livrare rapidă.",
    },
    {
      question: "Pot oferi materiale PDF?",
      answer: "Da. Poți atașa resurse la fiecare lecție.",
    },
    {
      question: "Cursanții au nevoie de cont?",
      answer: "Nu obligatoriu. Poți permite acces prin link.",
    },
  ];

  return (
    <>
      

        <meta
          name="description"
          content="Platformă cursuri online pentru educatori: lecții structurate, resurse PDF și comunitate opțională."
        />
        <meta
          name="keywords"
          content="platforma cursuri educatori, platforma cursuri online educatie, cursuri online profesori"
        />
        <link rel="canonical" href="https://docourse.ro/platforma-cursuri-educatori" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          })}
        </script>
      

      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <section className="bg-gradient-to-b from-beige/60 to-background">
            <div className="container mx-auto px-4 py-16 lg:py-24">
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  Pentru educatori
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Platformă cursuri online pentru educatori
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Creezi lecții structurate, adaugi resurse PDF și livrezi cursul printr-un link simplu.
                </p>
                
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Structură clară",
                  text: "Module scurte, ușor de urmărit.",
                  icon: CheckCircle2,
                },
                {
                  title: "Resurse și fișiere",
                  text: "PDF-uri și materiale de lucru atașate lecțiilor.",
                  icon: GraduationCap,
                },
                {
                  title: "Comunitate opțională",
                  text: "Întrebări și suport într-un singur loc.",
                  icon: Users,
                },
              ].map((item) => (
                <div key={item.title} className="bg-background rounded-2xl border border-border p-6 shadow-card">
                  <item.icon className="w-6 h-6 text-gold mb-3" />
                  <h3 className="text-lg font-semibold text-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="container mx-auto px-4 pb-20">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-navy mb-4">Întrebări frecvente</h2>
              <div className="space-y-4 text-sm text-muted-foreground">
                {faqs.map((faq) => (
                  <div key={faq.question}>
                    <h3 className="font-semibold text-navy">{faq.question}</h3>
                    <p>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <FinalCTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PlatformaCursuriEducatori;
