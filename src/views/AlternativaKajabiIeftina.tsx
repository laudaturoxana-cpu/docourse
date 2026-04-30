"use client";
import { CheckCircle2, XCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

const AlternativaKajabiIeftina = () => {
  const faqs = [
    {
      question: "Este DoCourse o alternativă reală la Kajabi?",
      answer: "Da, dacă vrei o platformă mai simplă și mai accesibilă pentru România.",
    },
    {
      question: "Am nevoie de funnel-uri complexe?",
      answer: "Nu. Pentru cursuri, ai nevoie de publicare rapidă și livrare clară.",
    },
    {
      question: "Pot păstra comunitatea și suportul?",
      answer: "Da. Comunitatea este inclusă și ușor de activat.",
    },
  ];

  return (
    <>
      

        <meta
          name="description"
          content="Cauți alternativa Kajabi mai ieftină? DoCourse este simplu, în română și adaptat pieței locale."
        />
        <meta
          name="keywords"
          content="alternativa kajabi mai ieftina, alternativa kajabi romania, platforma cursuri online"
        />
        <link rel="canonical" href="https://docourse.ro/alternativa-kajabi-ieftina" />
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
                  Alternativa Kajabi
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Alternativa Kajabi mai ieftină pentru România
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Kajabi e puternic, dar costisitor și complex. DoCourse îți oferă ceea ce ai nevoie
                  pentru cursuri: publicare rapidă, acces prin link și comunitate opțională.
                </p>
                
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <h2 className="text-xl font-semibold text-navy mb-4">Kajabi</h2>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    "Prețuri mari pentru piața RO",
                    "Setări complexe pentru cursuri simple",
                    "Mult marketing, puțin focus pe livrare",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-destructive mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-background rounded-2xl border border-gold/40 p-6 shadow-gold">
                <h2 className="text-xl font-semibold text-navy mb-4">DoCourse</h2>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    "Preț adaptat pentru România",
                    "Interfață simplă, fără supraîncărcare",
                    "Acces rapid pentru cursanți",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
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

export default AlternativaKajabiIeftina;
