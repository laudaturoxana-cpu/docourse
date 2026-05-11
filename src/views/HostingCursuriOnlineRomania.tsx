"use client";
import { Server, CheckCircle2, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

const HostingCursuriOnlineRomania = () => {
  const faqs = [
    {
      question: "DoCourse include hosting?",
      answer: "Da. Nu ai nevoie de servicii externe pentru găzduirea cursului.",
    },
    {
      question: "Este sigur pentru fișiere și video?",
      answer: "Da. Fișierele sunt livrate securizat, iar cursantul are acces rapid.",
    },
    {
      question: "Pot distribui linkul direct?",
      answer: "Da. Cursantul intră prin link, fără setup tehnic.",
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
                  Hosting cursuri online România
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Hosting cursuri online în România, fără bătăi de cap
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  DoCourse oferă hosting complet pentru cursurile tale. Încarci conținutul, publici
                  și trimiți linkul cursanților, fără alte servicii externe.
                </p>
                
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Găzduire inclusă",
                  text: "Nu ai nevoie de hosting separat.",
                  icon: Server,
                },
                {
                  title: "Acces securizat",
                  text: "Fișierele sunt livrate rapid și sigur.",
                  icon: ShieldCheck,
                },
                {
                  title: "Publicare rapidă",
                  text: "Trimiți linkul și cursantul începe imediat.",
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

export default HostingCursuriOnlineRomania;
