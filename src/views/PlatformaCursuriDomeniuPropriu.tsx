"use client";
import { Globe, ShieldCheck, CheckCircle2, Paintbrush, Zap, Link } from "lucide-react";
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
    {
      question: "Ce apare în URL-ul cursantului — docourse.ro sau domeniul meu?",
      answer: "Domeniul tău. Cursanții văd brandul tău, nu DoCourse în bara de adrese.",
    },
    {
      question: "Am nevoie de hosting separat pentru domeniu?",
      answer: "Nu. DoCourse gestionează hosting-ul, tu furnizezi doar domeniul.",
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
                  Cursuri online pe domeniu propriu
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Platformă cursuri pe domeniu propriu, cu brandul tău
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Cursanții tăi văd domeniul tău în browser, nu docourse.ro. Brandul tău în față,
                  infrastructura DoCourse în spate. Profesional și fără costuri de dezvoltare.
                </p>
              </div>
            </div>
          </section>

          {/* Features cards */}
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

          {/* De ce domeniu propriu */}
          <section className="container mx-auto px-4 pb-16">
            <div className="bg-beige/40 border border-border rounded-2xl p-8 max-w-4xl">
              <h2 className="text-2xl font-bold text-navy mb-4">
                De ce contează să livrezi pe domeniu propriu
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Când cursantul tău primește un link care arată ca <em>cursuri.brandultau.ro</em> în
                loc de <em>docourse.ro/cursuri</em>, percepe imediat o experiență mai profesională și
                mai de încredere. Domeniul propriu înseamnă că platforma ta de cursuri online pare
                construită special pentru brandul tău — chiar dacă în spate funcționează DoCourse.
                Ideal pentru coachi, traineri, școli online și companii care livrează training.
              </p>
              <div className="grid gap-3 md:grid-cols-2 text-sm text-muted-foreground">
                {[
                  "URL-ul cursantului arată brandul tău, nu DoCourse",
                  "Crește percepția de profesionalism și încredere",
                  "Potrivit pentru școli online cu identitate proprie",
                  "Ideal pentru companii care livrează training intern",
                  "Custom domain fără costuri de dezvoltare web",
                  "Certificatele pot include domeniul tău personalizat",
                  "Hosting inclus — nu ai nevoie de server separat",
                  "Configurare simplă, fără echipă tehnică",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Cum funcționează */}
          <section className="container mx-auto px-4 pb-16">
            <h2 className="text-2xl font-bold text-navy mb-6">Cum configurezi domeniul propriu</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Globe,
                  title: "1. Ai un domeniu",
                  text: "Folosești un domeniu pe care îl deții deja sau înregistrezi unul nou — .ro, .com sau orice altă extensie.",
                },
                {
                  icon: Link,
                  title: "2. Conectezi domeniul",
                  text: "Configurezi un CNAME simplu în panoul de control al domeniului, care îl redirecționează spre platforma ta.",
                },
                {
                  icon: Zap,
                  title: "3. Publici cursul",
                  text: "Cursanții tăi accesează direct domeniul tău. Totul apare sub brandul tău, fără nicio urmă vizibilă de DoCourse.",
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

          {/* Comparație */}
          <section className="container mx-auto px-4 pb-16">
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <h2 className="text-xl font-semibold text-navy mb-4">Fără domeniu propriu</h2>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    "URL: docourse.ro/cursuri — brandul tău nu e vizibil",
                    "Cursanții văd o platformă generică",
                    "Mai greu de poziționat ca academie proprie",
                    "Percepție mai puțin profesională",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-destructive font-bold mt-0.5">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-background rounded-2xl border border-gold/40 p-6 shadow-gold">
                <Paintbrush className="w-5 h-5 text-gold mb-3" />
                <h2 className="text-xl font-semibold text-navy mb-4">Cu domeniu propriu</h2>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    "URL: cursuri.brandultau.ro — identitate completă",
                    "Cursanții intră pe platforma ta de cursuri online",
                    "Construiești un brand de educație independent",
                    "Percepție de academie online profesională",
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

export default PlatformaCursuriDomeniuPropriu;
