"use client";
import { HeartHandshake, CheckCircle2, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

const PlatformaCursuriPsihologi = () => {
  const faqs = [
    {
      question: "Este potrivită pentru psihologi și terapeuți?",
      answer: "Da. Poți crea cursuri structurate și oferi suport clar cursanților.",
    },
    {
      question: "Pot livra programe de grup?",
      answer: "Da. Comunitatea ajută la întrebări între sesiuni.",
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
          content="Platformă cursuri online pentru psihologi și terapeuți: publicare rapidă, acces prin link și comunitate opțională."
        />
        <meta
          name="keywords"
          content="platforma cursuri psihologi, cursuri online terapeuti, platforma cursuri online Romania"
        />
        <link rel="canonical" href="https://docourse.ro/platforma-cursuri-psihologi" />
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
                  Pentru psihologi & terapeuți
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Platformă cursuri online pentru psihologi și terapeuți
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Creezi programe clare, cu module și lecții. Cursanții intră prin link, iar comunitatea
                  păstrează întrebările într-un singur loc.
                </p>
                
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Structură clară",
                  text: "Module scurte și progres vizibil pentru cursant.",
                  icon: CheckCircle2,
                },
                {
                  title: "Comunitate controlată",
                  text: "Suport centralizat, fără mesaje pierdute.",
                  icon: Users,
                },
                {
                  title: "Experiență empatică",
                  text: "Livrare calmă, fără tehnicalități care obosesc.",
                  icon: HeartHandshake,
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

export default PlatformaCursuriPsihologi;
