"use client";
import { Users, MessageSquare, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

const PlatformaCursuriComunitate = () => {
  const faqs = [
    {
      question: "Comunitatea e obligatorie?",
      answer:
        "Nu. O activezi doar dacă vrei suport și discuții între cursanți.",
    },
    {
      question: "Pot avea acces fără cont?",
      answer:
        "Da. Cursanții pot accesa comunitatea prin link, fără cont, dacă alegi.",
    },
    {
      question: "Ce tip de curs beneficiază cel mai mult?",
      answer:
        "Cursurile avansate, programele de grup și training-urile cu suport continuu.",
    },
    {
      question: "Pot folosi în paralel un grup Facebook?",
      answer:
        "Poți, dar comunitatea DoCourse păstrează totul lângă curs și oferă context.",
    },
    {
      question: "Comunitatea ajută la finalizarea cursului?",
      answer:
        "Da. Întrebările și răspunsurile cresc claritatea și motivația cursanților.",
    },
    {
      question: "Se poate dezactiva ulterior?",
      answer:
        "Da. Comunitatea este opțională și poate fi oprită oricând.",
    },
  ];

  return (
    <>
      

        <meta
          name="description"
          content="Platformă cursuri cu comunitate pentru creatori: curs + spațiu de discuții într-un singur loc. DoCourse pentru România."
        />
        <meta
          name="keywords"
          content="platforma cursuri cu comunitate, curs online cu comunitate, comunitate cursanti online"
        />
        <link rel="canonical" href="https://docourse.ro/platforma-cursuri-cu-comunitate" />
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
                  Curs + comunitate
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Platformă cursuri cu comunitate, într-un singur loc
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Cursanții tăi intră rapid în comunitate, discută și primesc suport. Tu păstrezi
                  totul organizat, fără alte tool-uri. Comunitatea crește retenția și crește rata de
                  finalizare a cursului.
                </p>
                
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Discuții centralizate",
                  text: "Toate întrebările și răspunsurile lângă curs. Cursanții nu se pierd în alte platforme.",
                  icon: MessageSquare,
                },
                {
                  title: "Comunitate controlată",
                  text: "Tu decizi când activezi comunitatea și cine vede. Poți începe cu acces liber.",
                  icon: Users,
                },
                {
                  title: "Acces simplu",
                  text: "Un singur link pentru curs + comunitate. Rapid pentru tine, ușor pentru cursant.",
                  icon: ShieldCheck,
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
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <h2 className="text-xl font-semibold text-navy mb-3">Comparație rapidă</h2>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong className="text-navy">Grup Facebook:</strong> conversații pierdute, fără context de lecție.</p>
                  <p><strong className="text-navy">Comunitate DoCourse:</strong> totul lângă curs, ușor de urmărit.</p>
                </div>
                
              </div>
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <h2 className="text-xl font-semibold text-navy mb-3">Studiu de caz rapid</h2>
                <p className="text-sm text-muted-foreground">
                  Un trainer de business a activat comunitatea și a redus întrebările 1:1,
                  crescând rata de finalizare a cursului cu 20%.
                </p>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 pb-20">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-navy mb-4">Când ai nevoie de comunitate?</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Dacă lucrezi cu cursanți care au întrebări frecvente, comunitatea reduce suportul
                1:1 și îți crește engagement-ul. Pentru programe de grup, este aproape obligatorie.
              </p>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-navy">Cursuri avansate</h3>
                  <p>
                    Oamenii au nevoie de clarificări. Comunitatea devine spațiul principal pentru suport.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-navy">Programe cu rezultate</h3>
                  <p>
                    Când urmărești progres, discuțiile sunt parte din experiență.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-navy">Lansări repetitive</h3>
                  <p>
                    Întrebările se repetă. Comunitatea păstrează răspunsurile la îndemână.
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

export default PlatformaCursuriComunitate;
