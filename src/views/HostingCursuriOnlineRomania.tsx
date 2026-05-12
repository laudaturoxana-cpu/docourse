"use client";
import { Server, CheckCircle2, ShieldCheck, Zap, HardDrive, Globe } from "lucide-react";
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
    {
      question: "Ce tipuri de fișiere pot încărca?",
      answer: "Video MP4, PDF, audio, imagini, documente Word, Excel — orice format.",
    },
    {
      question: "Video-ul se poate descărca de către cursant?",
      answer: "Nu, dacă nu permiți explicit. Conținutul e streamat securizat, fără download.",
    },
    {
      question: "Am nevoie de un cont separat la Vimeo sau YouTube?",
      answer: "Nu. DoCourse gestionează hosting-ul video intern — fără conturi terțe.",
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
                  Hosting cursuri online România
                </p>
                <h1 className="text-3xl lg:text-5xl font-bold text-navy mb-4">
                  Hosting cursuri online în România, fără bătăi de cap
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  DoCourse include hosting complet pentru cursurile tale — video, PDF, audio și
                  orice alt fișier. Încarci conținutul, publici și trimiți linkul cursanților, fără
                  să plătești separat pentru stocare sau server.
                </p>
              </div>
            </div>
          </section>

          {/* Features cards */}
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

          {/* De ce hosting inclus contează */}
          <section className="container mx-auto px-4 pb-16">
            <div className="bg-beige/40 border border-border rounded-2xl p-8 max-w-4xl">
              <h2 className="text-2xl font-bold text-navy mb-4">
                De ce hosting-ul inclus face diferența
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Mulți creatori de cursuri online din România ajung să plătească separat pentru
                hosting video (Vimeo, Wistia), stocare fișiere (Google Drive, Dropbox) și un LMS
                pentru livrare. Costurile se adună rapid și managementul devine complicat. DoCourse
                rezolvă asta printr-un singur abonament care include tot: hosting video securizat,
                stocare fișiere, livrare cursuri și comunitate — fără costuri ascunse.
              </p>
              <div className="grid gap-3 md:grid-cols-2 text-sm text-muted-foreground">
                {[
                  "Hosting video securizat inclus — fără Vimeo sau YouTube",
                  "Stocare fișiere nelimitată pentru PDF, audio și documente",
                  "Stream securizat — video nu poate fi descărcat fără permisiune",
                  "CDN pentru livrare rapidă indiferent de locația cursantului",
                  "Nu ai nevoie de server propriu sau VPS",
                  "Backup automat al conținutului tău",
                  "Fișiere organizate per lecție, ușor de gestionat",
                  "Un singur abonament pentru tot — fără facturi multiple",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Ce poți găzdui */}
          <section className="container mx-auto px-4 pb-16">
            <h2 className="text-2xl font-bold text-navy mb-6">Ce tipuri de conținut poți găzdui</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: HardDrive,
                  title: "Video lecții",
                  text: "Încarci MP4 direct sau legi un video existent. Stream securizat fără download neautorizat.",
                },
                {
                  icon: Server,
                  title: "PDF și documente",
                  text: "Fișe de lucru, prezentări, ghiduri și orice resursă de care are nevoie cursantul.",
                },
                {
                  icon: Zap,
                  title: "Audio și alte fișiere",
                  text: "Meditații ghidate, podcast-uri de curs, spreadsheet-uri — orice format este acceptat.",
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

          {/* Comparatie costuri */}
          <section className="container mx-auto px-4 pb-16">
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
              <div className="bg-background rounded-2xl border border-border p-6 shadow-card">
                <h2 className="text-xl font-semibold text-navy mb-4">Soluție fragmentată</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "Vimeo Pro pentru hosting video: ~20€/lună",
                    "Google Workspace pentru stocare: ~6€/lună",
                    "LMS sau platformă cursuri: ~30€/lună",
                    "Total: 56€/lună + timp de management",
                    "Trei facturi, trei sisteme de logat",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-destructive font-bold mt-0.5">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-background rounded-2xl border border-gold/40 p-6 shadow-gold">
                <Globe className="w-5 h-5 text-gold mb-3" />
                <h2 className="text-xl font-semibold text-navy mb-4">DoCourse all-in-one</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "Hosting video inclus în abonament",
                    "Stocare fișiere inclusă",
                    "Platformă cursuri + comunitate inclusă",
                    "De la 9€/lună — totul într-un singur loc",
                    "Un singur panou de control pentru tot",
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

export default HostingCursuriOnlineRomania;
