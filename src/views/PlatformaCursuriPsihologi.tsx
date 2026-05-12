"use client";
import { HeartHandshake, CheckCircle2, Users, BookOpen, ShieldCheck, GraduationCap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

const PlatformaCursuriPsihologi = () => {
  const faqs = [
    {
      question: "Este potrivită pentru psihologi și terapeuți?",
      answer: "Da. Poți crea cursuri structurate și oferi suport clar cursanților.",
    },
    {
      question: "Pot livra programe de grup?",
      answer: "Da. Comunitatea ajută la întrebări între sesiuni.",
    },
    {
      question: "Cursanții au nevoie de cont?",
      answer: "Nu obligatoriu. Poți permite acces prin link.",
    },
    {
      question: "Pot atașa materiale PDF și fișe de lucru la lecții?",
      answer: "Da. Fiecare lecție poate conține video, PDF, audio sau orice tip de fișier.",
    },
    {
      question: "Pot proteja conținutul astfel încât să nu fie distribuit neautorizat?",
      answer: "Da. Accesul este controlat prin link sau cont, iar conținutul nu poate fi descărcat fără permisiune.",
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
                  Platformă cursuri psihologi și terapeuți
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Platformă cursuri online pentru psihologi și terapeuți
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Transformi expertiza clinică în programe online clare. Materiale structurate,
                  comunitate organizată și acces simplu — fără tehnicalități care te distrag de la
                  ceea ce contează.
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
                  title: "Comunitate controlată",
                  text: "Suport centralizat, fără mesaje pierdute.",
                  icon: Users,
                },
                {
                  title: "Experiență empatică",
                  text: "Livrare calmă, fără tehnicalități care obosesc.",
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

          {/* De ce psihologii aleg DoCourse */}
          <section className="container mx-auto px-4 pb-16">
            <div className="bg-beige/40 border border-border rounded-2xl p-8 max-w-4xl">
              <h2 className="text-2xl font-bold text-navy mb-4">
                De ce psihologii și terapeuții din România aleg DoCourse
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Ca psiholog sau terapeut, ai cunoștințe valoroase pe care pacienții și clienții tăi
                le caută. Cursurile online îți permit să ajungi la mai mulți oameni, fără să
                multiplici sesiunile individuale. DoCourse a fost gândit pentru exact acest scenariu:
                publici un program structurat, îl livrezi printr-un link și comunitatea organizează
                suportul — fără să fie nevoie de o echipă tehnică.
              </p>
              <div className="grid gap-3 md:grid-cols-2 text-sm text-muted-foreground">
                {[
                  "Cursuri de psihologie online structurate în module clare",
                  "Materiale PDF, fișe de lucru și exerciții atașate lecțiilor",
                  "Acces securizat — conținut protejat, fără download neautorizat",
                  "Comunitate pentru suport între sesiuni sau între module",
                  "Potrivit pentru formare continuă și cursuri psihoeducaționale",
                  "Programe de grup cu suport în comunitate dedicată",
                  "Platformă în română, fără bariera limbii",
                  "Fără comisioane la vânzări, cost fix lunar",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tipuri de cursuri */}
          <section className="container mx-auto px-4 pb-16">
            <h2 className="text-2xl font-bold text-navy mb-6">
              Ce poți livra prin DoCourse
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: BookOpen,
                  title: "Cursuri psihoeducaționale",
                  text: "Informații psihologice structurate pentru publicul larg — anxietate, atașament, parenting, comunicare.",
                },
                {
                  icon: GraduationCap,
                  title: "Formare profesională continuă",
                  text: "Module de formare pentru colegi — tehnici terapeutice, evaluare psihologică, intervenție în criză.",
                },
                {
                  icon: Users,
                  title: "Programe de grup",
                  text: "Workshop-uri sau programe terapeutice de grup cu materiale structurate și comunitate privată.",
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

          {/* Cum structurezi + Confidențialitate */}
          <section className="container mx-auto px-4 pb-16">
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <h2 className="text-xl font-semibold text-navy mb-3">Cum structurezi un curs de psihologie</h2>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Stabilești publicul — pacienți, colegi sau publicul larg.</li>
                  <li>Împarți conținutul în module tematice de 3–5 lecții scurte.</li>
                  <li>Adaugi video explicativ + fișe de lucru PDF la fiecare lecție.</li>
                  <li>Activezi comunitatea dacă vrei interacțiune sau grup de suport.</li>
                  <li>Publici și trimiți linkul prin email sau rețele sociale.</li>
                </ol>
              </div>
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <ShieldCheck className="w-6 h-6 text-gold mb-3" />
                <h2 className="text-xl font-semibold text-navy mb-3">Confidențialitate și control</h2>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-navy">Acces controlat.</strong>{" "}
                    Tu decizi cine poate accesa cursul — link public, link privat sau cont cu parolă.
                  </p>
                  <p>
                    <strong className="text-navy">Conținut protejat.</strong>{" "}
                    Video-urile nu pot fi descărcate fără permisiune — materialele rămân la tine.
                  </p>
                  <p>
                    <strong className="text-navy">GDPR compliant.</strong>{" "}
                    Platforma respectă reglementările europene de protecție a datelor.
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

export default PlatformaCursuriPsihologi;
