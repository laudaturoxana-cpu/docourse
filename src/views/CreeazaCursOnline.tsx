"use client";
import { CheckCircle2, BookOpen, Users, PlayCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

const CreeazaCursOnline = () => {
  const faqs = [
    {
      question: "Cât de lung trebuie să fie un curs?",
      answer:
        "Depinde de rezultat. Pentru început, 60–120 de minute de conținut sunt suficiente.",
    },
    {
      question: "Pot începe cu un curs gratuit?",
      answer:
        "Da. Mulți creatori folosesc un curs scurt gratuit pentru validare și audiență.",
    },
    {
      question: "Am nevoie de echipament profesional?",
      answer:
        "Nu. Un telefon și un microfon decent sunt suficiente pentru primele lecții.",
    },
    {
      question: "Cum structurez modulele?",
      answer:
        "Fiecare modul are un obiectiv clar și 2–5 lecții scurte, ușor de parcurs.",
    },
    {
      question: "Cât durează să public?",
      answer:
        "După ce ai materialele, publicarea durează câteva minute.",
    },
    {
      question: "Cum aleg prețul?",
      answer:
        "Pornește de la rezultatul promis și nivelul de transformare, nu de la numărul de lecții.",
    },
    {
      question: "Cât durează să filmez?",
      answer:
        "Dacă ai outline-ul clar, poți filma 3–5 lecții într-o singură sesiune.",
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
                  Ghid pentru creatori
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Cum să creezi un curs online care se vinde
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Creează un curs clar, ușor de urmat și gata de lansare. În DoCourse îl publici
                  rapid și îl livrezi printr-un link simplu. Ai nevoie doar de structură bună,
                  lecții scurte și o promisiune clară.
                </p>
                
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <h2 className="text-2xl font-bold text-navy mb-8">Pașii esențiali</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  title: "Definește rezultatul cursului",
                  text: "Ce va ști cursantul după? Notează 3 rezultate clare.",
                  icon: CheckCircle2,
                },
                {
                  title: "Structurează modulele",
                  text: "Împarte lecțiile în module scurte și logice.",
                  icon: BookOpen,
                },
                {
                  title: "Adaugă video + resurse",
                  text: "Urcă video, PDF-uri și fișiere de lucru.",
                  icon: PlayCircle,
                },
                {
                  title: "Activează comunitatea",
                  text: "Opțional, creează un spațiu de discuții pentru cursanți.",
                  icon: Users,
                },
              ].map((step) => (
                <div key={step.title} className="bg-background rounded-2xl border border-border p-6 shadow-card">
                  <step.icon className="w-6 h-6 text-gold mb-3" />
                  <h3 className="text-lg font-semibold text-navy mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="container mx-auto px-4 pb-16">
            <div className="bg-background rounded-2xl border border-border p-6 shadow-card max-w-3xl">
              <h2 className="text-xl font-semibold text-navy mb-3">Plan detaliat în 7 pași</h2>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Definește transformarea (ce obține cursantul).</li>
                <li>Scrie outline-ul pe module și lecții.</li>
                <li>Pregătește exemple, template-uri, PDF-uri.</li>
                <li>Filmează lecțiile scurt și clar.</li>
                <li>Urcă materialele și verifică fluxul.</li>
                <li>Trimite linkul la un grup mic pentru feedback.</li>
                <li>Publică oficial și optimizează pe parcurs.</li>
              </ol>
            </div>
          </section>
          <section className="container mx-auto px-4 pb-16">
            <div className="max-w-3xl mb-12">
              <h2 className="text-2xl font-bold text-navy mb-4">Cum arată un curs bine făcut</h2>
              <p className="text-sm text-muted-foreground">
                Un curs bun are o transformare clară, module scurte și lecții cu un singur obiectiv.
                În loc de “tot ce știu despre…”, gândește-l ca un traseu: de la problemă la rezultat.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 mb-10">
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <h3 className="text-lg font-semibold text-navy mb-2">Model rapid de structură</h3>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Introducere + context</li>
                  <li>3–5 module cu progres clar</li>
                  <li>Recapitulare + plan de acțiune</li>
                  <li>Resurse PDF și șabloane</li>
                </ul>
              </div>
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <h3 className="text-lg font-semibold text-navy mb-2">Greșeli de evitat</h3>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Prea mult conținut fără structură</li>
                  <li>Lecții lungi fără un rezultat clar</li>
                  <li>Lansare fără feedback de la 3–5 oameni</li>
                </ul>
              </div>
            </div>
            <div className="bg-navy text-white rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">Vrei să publici în 10 minute?</h2>
              <p className="text-white/80 mb-6">
                DoCourse e făcut pentru creatori care vor să înceapă rapid, fără setup complicat.
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

export default CreeazaCursOnline;
