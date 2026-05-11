"use client";
import Link from "next/link";
;
import { CheckCircle2, Sparkles, Users, Zap } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";

const PlatformaCursuriOnline = () => {
  const faqs = [
    {
      question: "Cât de repede pot lansa un curs?",
      answer:
        "În aceeași zi. Încarci lecțiile, publici și trimiți linkul. Nu ai nevoie de setări tehnice complicate.",
    },
    {
      question: "Pot oferi acces fără cont?",
      answer:
        "Da. Poți trimite linkul direct cursantului, iar el poate începe imediat.",
    },
    {
      question: "E potrivită pentru începători?",
      answer:
        "Da. DoCourse e gândită pentru creatori fără experiență tehnică.",
    },
    {
      question: "Pot avea curs gratuit și curs cu plată?",
      answer:
        "Da. Poți începe cu un curs gratuit și adăuga ulterior cursuri cu plată unică.",
    },
    {
      question: "Am nevoie de site separat?",
      answer:
        "Nu. Cursurile au pagini proprii, iar linkul poate fi distribuit direct.",
    },
    {
      question: "Pot activa comunitatea doar pentru anumite cursuri?",
      answer:
        "Da. Comunitatea se activează pentru cursul pe care îl alegi.",
    },
    {
      question: "Cursantul poate vedea cursul pe mobil?",
      answer:
        "Da. Interfața este optimizată pentru mobil și desktop.",
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
                  Platformă cursuri online România
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Platforma simplă pentru cursuri online, fără bătăi de cap
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  DoCourse este gândită pentru creatori români: încărcare rapidă, design curat,
                  comunitate opțională și acces prin link pentru cursanți. Fără tool-uri grele,
                  fără setup complicat, fără costuri care “sar” când începi să vinzi.
                </p>
                
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Fără tehnicalități",
                  text: "Încarci lecțiile, salvezi și trimiți linkul. Atât. Începătorii nu se blochează, iar avansații câștigă timp.",
                  icon: Sparkles,
                },
                {
                  title: "Comunitate dedicată",
                  text: "Activezi o comunitate pentru cursanți, fără membership-uri complicate. Discuțiile rămân lângă curs.",
                  icon: Users,
                },
                {
                  title: "Rapid și clar",
                  text: "Cursantul vede cursul imediat, fără cont dacă vrei. Perfect pentru pilotări și validări rapide.",
                  icon: Zap,
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
            <div className="bg-beige/40 border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-navy mb-4">De ce DoCourse?</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Dacă ai căutat “platformă cursuri online România”, probabil ai găsit soluții scumpe,
                în engleză și greu de setat. DoCourse a fost construită fix pentru partea practică:
                publici rapid și livrezi cursul fără fricțiuni.
              </p>
              <ul className="grid gap-3 md:grid-cols-2 text-sm text-muted-foreground">
                {[
                  "Interfață în română, făcută pentru creatori locali",
                  "Fără taxe ascunse și fără setup complicat",
                  "Link de acces simplu pentru cursanți",
                  "Comunitate și feedback într-un singur loc",
                  "Nu ai nevoie de site separat sau hosting extern",
                  "Potrivit pentru cursuri gratuite sau cu plată unică",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
            </div>
          </section>

          <section className="container mx-auto px-4 pb-16">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <h2 className="text-xl font-semibold text-navy mb-3">Pași detaliați pentru lansare</h2>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Stabilești rezultatul cursului și promisiunea clară.</li>
                  <li>Împarți conținutul în module scurte, ușor de parcurs.</li>
                  <li>Încarci video + resurse și publici cursul.</li>
                  <li>Trimiți linkul cursanților și colectezi feedback.</li>
                </ol>
                
              </div>
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <h2 className="text-xl font-semibold text-navy mb-3">Comparație rapidă</h2>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong className="text-navy">DoCourse:</strong> în română, simplu, acces prin link.</p>
                  <p><strong className="text-navy">Teachable/Kajabi:</strong> în engleză, scump, setup complex.</p>
                  <p><strong className="text-navy">Marketplace:</strong> fără control pe brand și preț.</p>
                </div>
                
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 pb-16">
            <h2 className="text-2xl font-bold text-navy mb-6">Studii de caz rapide</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Coach începător",
                  text: "A lansat un curs gratuit în 48h și a strâns primele 120 de înscrieri.",
                },
                {
                  title: "Psiholog cu experiență",
                  text: "A mutat cursurile din Google Drive și a redus întrebările repetitive cu 40%.",
                },
                {
                  title: "Mentor business",
                  text: "A activat comunitatea și a crescut rata de finalizare a cursului.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-background rounded-2xl border border-border p-6 shadow-card">
                  <h3 className="text-lg font-semibold text-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="container mx-auto px-4 pb-16">
            <div className="bg-background border border-border rounded-2xl p-6 shadow-card">
              <h2 className="text-xl font-semibold text-navy mb-4">Resurse pentru creatori</h2>
              <div className="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
                <Link href="/platforma-simpla-cursuri-online" className="hover:text-gold">
                  Platformă simplă pentru începători
                </Link>
                <Link href="/alternativa-kajabi-ieftina" className="hover:text-gold">
                  Alternativă Kajabi mai ieftină
                </Link>
                <Link href="/platforma-cursuri-coaching" className="hover:text-gold">
                  Platformă pentru coachi & terapeuți
                </Link>
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

export default PlatformaCursuriOnline;
