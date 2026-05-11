"use client";
import { CheckCircle2, Sparkles, Zap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

const PlatformaSimplaCursuriOnline = () => {
  const faqs = [
    {
      question: "Este potrivită pentru începători?",
      answer: "Da. Interfața este simplă, fără setări tehnice complicate.",
    },
    {
      question: "Cât de repede pot crea primul curs?",
      answer: "În aceeași zi, dacă ai materialele pregătite.",
    },
    {
      question: "Pot trimite cursul prin link?",
      answer: "Da. Cursanții pot intra rapid, fără cont dacă vrei.",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <section className="bg-gradient-to-b from-beige/60 to-background">
            <div className="container mx-auto px-4 py-16 lg:py-24">
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  Platformă simplă pentru cursuri online
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Platforma simplă pentru cursuri online, fără setări complicate
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Dacă ești la început, ai nevoie de o platformă care nu te încurcă. DoCourse îți
                  permite să publici rapid și să livrezi cursul printr-un link simplu.
                </p>
                
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Ușor de folosit",
                  text: "Îți organizezi lecțiile rapid, fără meniuri complicate.",
                  icon: Sparkles,
                },
                {
                  title: "Lansare rapidă",
                  text: "Publici cursul și trimiți linkul în câteva minute.",
                  icon: Zap,
                },
                {
                  title: "Feedback clar",
                  text: "Primești întrebări și răspunsuri direct lângă curs.",
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

          <section className="container mx-auto px-4 pb-16">
            <div className="bg-beige/40 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-navy mb-4">Pentru cine este?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Pentru coachi, terapeuți, mentori și educatori care vor să înceapă fără investiții mari.
              </p>
              
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

export default PlatformaSimplaCursuriOnline;
