"use client";
import { Wallet, CheckCircle2, Zap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

const PlatformaCursuriIeftina = () => {
  const faqs = [
    {
      question: "Ce înseamnă platformă ieftină?",
      answer: "Costuri mici și fără taxe ascunse. Plătești doar pentru ce folosești.",
    },
    {
      question: "Pot începe cu buget mic?",
      answer: "Da. Poți valida cu un curs gratuit sau cu plată unică.",
    },
    {
      question: "E potrivită pentru începători?",
      answer: "Da. Totul e simplu și rapid de setat.",
    },
  ];

  return (
    <>
      

        <meta
          name="description"
          content="Platformă cursuri online ieftină pentru România: publicare rapidă, acces prin link și comunitate opțională."
        />
        <meta
          name="keywords"
          content="platforma cursuri online ieftina, platforma cursuri online Romania, creare cursuri online"
        />
        <link rel="canonical" href="https://docourse.ro/platforma-cursuri-online-ieftina" />
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
                  Platformă cursuri online ieftină
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Platformă cursuri online ieftină, fără costuri ascunse
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Începi rapid, fără investiții mari. DoCourse îți permite să publici cursul și să-l
                  livrezi prin link, cu opțiuni clare pentru creștere.
                </p>
                
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Buget eficient",
                  text: "Fără abonamente mari în USD.",
                  icon: Wallet,
                },
                {
                  title: "Lansare rapidă",
                  text: "Publici cursul și trimiți linkul în câteva minute.",
                  icon: Zap,
                },
                {
                  title: "Rezultate clare",
                  text: "Conținut organizat și ușor de urmărit.",
                  icon: CheckCircle2,
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

export default PlatformaCursuriIeftina;
