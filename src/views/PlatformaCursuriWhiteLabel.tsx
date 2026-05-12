"use client";
import { Paintbrush, ShieldCheck, CheckCircle2, Globe, Users, Building2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

const PlatformaCursuriWhiteLabel = () => {
  const faqs = [
    {
      question: "Ce înseamnă white label?",
      answer: "Platforma apare sub brandul tău, cu identitatea ta vizuală.",
    },
    {
      question: "Pot folosi domeniul meu?",
      answer: "Da. Platforma poate rula pe domeniul tău.",
    },
    {
      question: "Este complicat de setat?",
      answer: "Nu. Totul este gândit simplu, fără integrări grele.",
    },
    {
      question: "Pot livra cursuri pentru clienții mei sub brandul meu?",
      answer: "Da. Creezi cursuri și le livrezi clienților tăi, iar aceștia văd doar brandul tău.",
    },
    {
      question: "Ce elemente vizuale pot personaliza?",
      answer: "Logo-ul, culorile, domeniul și certificatele — totul reflectă identitatea ta vizuală.",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          {/* Hero */}
          <section className="bg-gradient-to-b from-beige/60 to-background">
            <div className="container mx-auto px-4 py-16 lg:py-24">
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  White label eLearning România
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Platformă cursuri white label România
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Brandul tău în față, infrastructura DoCourse în spate. Cursanții tăi văd
                  identitatea ta vizuală — logo, culori, domeniu propriu — fără nicio urmă a
                  platformei din spate.
                </p>
              </div>
            </div>
          </section>

          {/* Features cards */}
          <section className="container mx-auto px-4 py-16">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Brand complet",
                  text: "Totul sub identitatea ta vizuală.",
                  icon: Paintbrush,
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

          {/* Ce este white label */}
          <section className="container mx-auto px-4 pb-16">
            <div className="bg-beige/40 border border-border rounded-2xl p-8 max-w-4xl">
              <h2 className="text-2xl font-bold text-navy mb-4">
                Ce înseamnă o platformă white label pentru cursuri online
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                O platformă white label de cursuri online înseamnă că folosești infrastructura
                DoCourse, dar cursanții tăi văd exclusiv brandul tău. Logo-ul tău, culorile tale,
                domeniul tău. Ideal pentru agentii de training, companii care livrează cursuri de
                corporate learning, consultanți care vând programe sub brand propriu sau orice
                creator care vrea o academie online cu identitate vizuală completă.
              </p>
              <div className="grid gap-3 md:grid-cols-2 text-sm text-muted-foreground">
                {[
                  "Platformă de cursuri cu logo și culori proprii",
                  "Domeniu propriu — cursuri.brandultau.ro",
                  "Certificatele includ brandul tău, nu DoCourse",
                  "Potrivit pentru agentii de training din România",
                  "Ideal pentru companii cu training corporate intern",
                  "Livezi cursuri pentru clienți sub brandul tău",
                  "Fără nicio mențiune DoCourse vizibilă pentru cursant",
                  "Infrastructură SaaS — fără costuri de dezvoltare",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Cine folosește */}
          <section className="container mx-auto px-4 pb-16">
            <h2 className="text-2xl font-bold text-navy mb-6">Cine folosește white label</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Building2,
                  title: "Agentii de training",
                  text: "Livrezi cursuri corporate pentru clienți diferiți sub brandul agenției tale, fără să construiești o platformă de la zero.",
                },
                {
                  icon: Users,
                  title: "Companii cu training intern",
                  text: "Onboardezi angajații și livrezi programe de formare sub brandul companiei, cu acces controlat per departament.",
                },
                {
                  icon: Globe,
                  title: "Creatori cu academie proprie",
                  text: "Construiești o academie online cu identitate completă — fără ca publicul să știe că platforma e DoCourse.",
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

          {/* Comparatie white label vs standard */}
          <section className="container mx-auto px-4 pb-16">
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <h2 className="text-xl font-semibold text-navy mb-4">Platformă standard</h2>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    "URL: docourse.ro/cursuri",
                    "Cursantul vede brandul DoCourse",
                    "Potrivit pentru lansare rapidă individuală",
                    "Ideal dacă brandul platformei nu contează",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-background rounded-2xl border border-gold/40 p-6 shadow-gold">
                <Paintbrush className="w-5 h-5 text-gold mb-3" />
                <h2 className="text-xl font-semibold text-navy mb-4">White label</h2>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    "URL: cursuri.brandultau.ro",
                    "Cursantul vede exclusiv brandul tău",
                    "Ideal pentru academii și agentii de training",
                    "Construiești un produs de educație cu identitate proprie",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
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

export default PlatformaCursuriWhiteLabel;
