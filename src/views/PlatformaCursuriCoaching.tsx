"use client";
import { HeartHandshake, CheckCircle2, Users, Zap, BookOpen, BarChart2 } from "lucide-react";
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
    {
      question: "Pot combina sesiuni live cu materiale self-paced?",
      answer: "Da. Încarci înregistrările după fiecare sesiune și cursantul le parcurge în ritmul lui.",
    },
    {
      question: "Cum gestionez mai multe programe simultan?",
      answer: "Fiecare program este un curs separat, cu comunitate proprie și acces controlat.",
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
                  Platformă cursuri coaching online
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Platformă cursuri online pentru coachi și mentori
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Creezi programe clare, cu module și lecții. Cursanții intră prin link, comunitatea
                  păstrează întrebările centralizat, iar tu livrezi fără să fii prins în WhatsApp
                  toată ziua.
                </p>
              </div>
            </div>
          </section>

          {/* Features cards */}
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

          {/* De ce DoCourse pentru coaching */}
          <section className="container mx-auto px-4 pb-16">
            <div className="bg-beige/40 border border-border rounded-2xl p-8 max-w-4xl">
              <h2 className="text-2xl font-bold text-navy mb-4">
                De ce coachii români aleg DoCourse
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Dacă livrezi programe de coaching online, știi că provocarea nu e conținutul — e
                livrarea. Cursanții pierd materialele prin email, întrebările se pierd în grupuri de
                WhatsApp, iar tu ajungi să răspunzi la aceleași întrebări de zeci de ori. DoCourse
                rezolvă exact asta: un singur loc pentru program, materiale și comunitate.
              </p>
              <div className="grid gap-3 md:grid-cols-2 text-sm text-muted-foreground">
                {[
                  "Vinde programe de coaching online fără comisioane",
                  "Livrare self-paced — cursantul progresează în ritmul lui",
                  "Comunitate inclusă lângă fiecare program",
                  "Acces prin link — fără cont obligatoriu pentru cursant",
                  "Materiale video, PDF și resurse într-un singur loc",
                  "Potrivit pentru coaching individual și programe de grup",
                  "Progres vizibil pentru coach și pentru cursant",
                  "Fără costuri tehnice suplimentare — hosting inclus",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tipuri de programe */}
          <section className="container mx-auto px-4 pb-16">
            <h2 className="text-2xl font-bold text-navy mb-6">
              Ce tipuri de programe poți livra
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: BookOpen,
                  title: "Program self-paced",
                  text: "Încarci modulele, cursantul parcurge în ritmul lui. Ideal pentru coaching de viață, mindset sau business.",
                },
                {
                  icon: Users,
                  title: "Program de grup",
                  text: "Combini materiale înregistrate cu o comunitate activă. Cursanții se susțin reciproc între sesiuni.",
                },
                {
                  icon: Zap,
                  title: "Mini-curs de validare",
                  text: "Lansezi rapid un program scurt pentru a testa audiența înainte de a construi programul complet.",
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

          {/* Cum funcționează */}
          <section className="container mx-auto px-4 pb-16">
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <h2 className="text-xl font-semibold text-navy mb-3">Cum îți lansezi programul</h2>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Structurezi programul în module clare cu un obiectiv per modul.</li>
                  <li>Încarci video-urile, PDF-urile și exercițiile pentru fiecare lecție.</li>
                  <li>Activezi comunitatea dacă vrei suport între sesiuni.</li>
                  <li>Trimiți linkul cursanților — intră direct, fără fricțiuni.</li>
                  <li>Monitorizezi progresul și ajustezi conținutul pe parcurs.</li>
                </ol>
              </div>
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <BarChart2 className="w-6 h-6 text-gold mb-3" />
                <h2 className="text-xl font-semibold text-navy mb-3">Rezultate tipice</h2>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-navy">Întrebări repetitive reduse cu 40–60%.</strong>{" "}
                    Comunitatea organizează răspunsurile, cursanții se ajută reciproc.
                  </p>
                  <p>
                    <strong className="text-navy">Lansare în 1–2 zile.</strong>{" "}
                    Fără setup tehnic, fără dezvoltatori, fără costuri de infrastructură.
                  </p>
                  <p>
                    <strong className="text-navy">Rată de finalizare mai mare.</strong>{" "}
                    Progresul vizibil și comunitatea activă mențin cursantul motivat.
                  </p>
                </div>
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

export default PlatformaCursuriCoaching;
