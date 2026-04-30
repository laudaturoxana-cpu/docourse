"use client";
import { Dumbbell, CheckCircle2, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

const PlatformaCursuriTraineri = () => {
  const faqs = [
    {
      question: "Este potrivită pentru traineri?",
      answer: "Da. Poți livra programe clare și oferi suport cursanților.",
    },
    {
      question: "Pot include fișiere și resurse?",
      answer: "Da. Adaugi PDF-uri și materiale de lucru la lecții.",
    },
    {
      question: "Cursanții au nevoie de cont?",
      answer: "Nu obligatoriu. Poți oferi acces prin link.",
    },
  ];

  return (
    <>
      

        <meta
          name="description"
          content="Platformă cursuri online pentru traineri: publicare rapidă, acces prin link și comunitate opțională."
        />
        <meta
          name="keywords"
          content="platforma cursuri traineri, platforma cursuri online training, cursuri online trainer"
        />
        <link rel="canonical" href="https://docourse.ro/platforma-cursuri-traineri" />
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
                  Pentru traineri
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Platformă cursuri online pentru traineri
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Creezi programe clare, cu lecții scurte și progres vizibil. Cursanții intră prin link,
                  iar comunitatea păstrează întrebările într-un singur loc.
                </p>
                
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Structură clară",
                  text: "Module scurte, progres ușor de urmărit.",
                  icon: CheckCircle2,
                },
                {
                  title: "Suport continuu",
                  text: "Comunitate pentru întrebări și feedback.",
                  icon: Users,
                },
                {
                  title: "Experiență rapidă",
                  text: "Publici cursul și trimiți linkul imediat.",
                  icon: Dumbbell,
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

export default PlatformaCursuriTraineri;
