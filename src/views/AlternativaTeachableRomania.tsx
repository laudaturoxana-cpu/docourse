"use client";
import { CheckCircle2, XCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

const AlternativaTeachableRomania = () => {
  const faqs = [
    {
      question: "De ce să aleg DoCourse în loc de Teachable?",
      answer:
        "DoCourse e în română, are setup simplu și e gândit pentru piața locală.",
    },
    {
      question: "Pot migra cursurile existente?",
      answer:
        "Da. Poți urca lecțiile și resursele direct și trimiți linkul nou cursanților.",
    },
    {
      question: "Am nevoie de integrare complexă?",
      answer:
        "Nu. Cursul poate fi livrat prin link, fără setări tehnice avansate.",
    },
    {
      question: "Pot păstra comunitatea?",
      answer:
        "Da. Comunitatea e inclusă și se activează simplu, lângă curs.",
    },
    {
      question: "Am nevoie de echipă tehnică?",
      answer:
        "Nu. Poți publica singur cursul și îl livrezi prin link.",
    },
    {
      question: "Pot începe cu un curs gratuit?",
      answer:
        "Da. E o metodă bună pentru validare și primele înscrieri.",
    },
  ];

  return (
    <>
      

        <meta
          name="description"
          content="Cauți o alternativă Teachable în România? DoCourse este simplu, în română și adaptat pieței locale."
        />
        <meta
          name="keywords"
          content="alternativa teachable romania, platforma cursuri online romania, platforma simpla cursuri online"
        />
        <link rel="canonical" href="https://docourse.ro/alternativa-teachable-romania" />
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
                  Alternative Teachable
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Alternativa Teachable în România: DoCourse
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Teachable e bun, dar scump și în engleză. DoCourse este făcut pentru creatorii
                  români: simplu, clar și fără suprastructură. Dacă vrei să pornești rapid, fără
                  abonamente mari și fără setări complicate, ai alternativa potrivită.
                </p>
                
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <h2 className="text-xl font-semibold text-navy mb-4">Teachable</h2>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    "Interfață în engleză",
                    "Prețuri mari în USD",
                    "Curba de învățare abruptă",
                    "Setări multe, greu de pornit rapid",
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
                    "Totul în română",
                    "Gândit pentru piața locală",
                    "Creezi cursul în câteva minute",
                    "Acces prin link + comunitate opțională",
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

          <section className="container mx-auto px-4 pb-16">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <h2 className="text-xl font-semibold text-navy mb-3">Pași de migrare</h2>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Exportă lista de lecții și resurse.</li>
                  <li>Încarcă video și fișiere în DoCourse.</li>
                  <li>Testează cursul și trimite linkul nou.</li>
                </ol>
                
              </div>
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <h2 className="text-xl font-semibold text-navy mb-3">Studiu de caz rapid</h2>
                <p className="text-sm text-muted-foreground">
                  Un creator de coaching a migrat un curs de pe Teachable în 2 zile. A redus costurile
                  lunare și a crescut rata de finalizare după ce a activat comunitatea.
                </p>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 pb-20">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-navy mb-4">De ce creatorii români aleg DoCourse</h2>
              <p className="text-sm text-muted-foreground mb-6">
                În România, costurile și timpul de implementare sunt critice. DoCourse elimină
                barierele: interfață în română, configurare rapidă și acces prin link pentru cursanți.
              </p>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-navy">Preț adaptat pieței locale</h3>
                  <p>
                    Nu plătești abonamente mari în USD. Începi cu ce ai și crești gradual.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-navy">Lansare rapidă</h3>
                  <p>
                    Încarci lecțiile, publici și trimiți linkul. Nu ai nevoie de echipe tehnice.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-navy">Comunitate inclusă</h3>
                  <p>
                    Dacă vrei suport activ pentru cursanți, activezi comunitatea cu un click.
                  </p>
                </div>
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

export default AlternativaTeachableRomania;
