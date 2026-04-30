"use client";
import { Globe, ShieldCheck, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

const PlatformaCursuriDomeniuPropriu = () => {
  const faqs = [
    {
      question: "Pot avea cursul pe domeniul meu?",
      answer: "Da. DoCourse funcționează pe domeniul tău, fără setup complicat.",
    },
    {
      question: "Este nevoie de integrări tehnice?",
      answer: "Nu. Totul este configurat rapid și simplu.",
    },
    {
      question: "Cursanții intră prin link?",
      answer: "Da. Trimiți linkul și cursantul începe imediat.",
    },
  ];

  return (
    <>
      

        <meta
          name="description"
          content="Platformă cursuri pe domeniu propriu: publicare rapidă, acces prin link și brandul tău."
        />
        <meta
          name="keywords"
          content="platforma cursuri pe domeniu propriu, cursuri online domeniu propriu, platforma cursuri online"
        />
        <link rel="canonical" href="https://docourse.ro/platforma-cursuri-domeniu-propriu" />
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
                  Domeniu propriu
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Platformă cursuri pe domeniu propriu, cu brandul tău
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Păstrezi brandul și controlul. Cursanții intră pe domeniul tău și parcurg cursul
                  fără fricțiuni.
                </p>
                
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Brand control",
                  text: "Totul rămâne pe domeniul tău.",
                  icon: Globe,
                },
                {
                  title: "Acces sigur",
                  text: "Livrare rapidă și securizată.",
                  icon: ShieldCheck,
                },
                {
                  title: "Lansare rapidă",
                  text: "Publici cursul și trimiți linkul.",
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

export default PlatformaCursuriDomeniuPropriu;
