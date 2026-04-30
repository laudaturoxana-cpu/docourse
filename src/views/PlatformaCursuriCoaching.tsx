"use client";
import { HeartHandshake, CheckCircle2, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

const PlatformaCursuriCoaching = () => {
  const faqs = [
    {
      question: "Este potrivită pentru coachi și terapeuți?",
      answer: "Da. Poți crea cursuri structurate și oferi suport prin comunitate.",
    },
    {
      question: "Pot livra programe de grup?",
      answer: "Da. Comunitatea ajută la întrebări și suport între sesiuni.",
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
          content="Platformă cursuri online pentru coachi, psihologi și mentori. Publici rapid, livrezi prin link și activezi comunitatea."
        />
        <meta
          name="keywords"
          content="platforma cursuri coaching, platforma cursuri pentru coachi, cursuri online psihologi"
        />
        <link rel="canonical" href="https://docourse.ro/platforma-cursuri-coaching" />
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
                  Pentru coachi și mentori
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Platformă cursuri online pentru coachi și psihologi
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Creezi programe clare, cu module și lecții. Cursanții intră prin link, iar comunitatea
                  îți păstrează întrebările într-un singur loc.
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
                  title: "Comunitate activă",
                  text: "Întrebările se adună lângă curs, nu în mesaje separate.",
                  icon: Users,
                },
                {
                  title: "Experiență empatică",
                  text: "Cursantul simte sprijin constant fără să te copleșească.",
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

export default PlatformaCursuriCoaching;
