"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PoliticaCookies = () => {
  return (
    <>
      

        <meta
          name="description"
          content="Politica de utilizare a cookie-urilor DoCourse."
        />
        <link rel="canonical" href="https://docourse.ro/politica-cookies" />
      

      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-3xl space-y-8">
            <header className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-navy">
                Politica cookies
              </h1>
              <p className="text-sm text-muted-foreground">
                Ultima actualizare: 05.01.2026
              </p>
            </header>

            <section className="space-y-4 text-sm text-muted-foreground">
              <p>
                Această politică explică modul în care utilizăm cookie-uri și
                tehnologii similare pentru a îmbunătăți experiența ta pe
                DoCourse.
              </p>
            </section>

            <section className="space-y-4 text-sm text-muted-foreground">
              <h2 className="text-lg font-semibold text-navy">1. Ce sunt cookie-urile</h2>
              <p>
                Cookie-urile sunt fișiere mici stocate în browserul tău pentru a
                reține preferințe și a asigura funcționalități esențiale.
              </p>
              <h2 className="text-lg font-semibold text-navy">2. Tipuri de cookie-uri</h2>
              <p>
                Folosim cookie-uri strict necesare, de performanță și
                funcționalitate. Nu folosim cookie-uri de marketing fără
                consimțământ explicit.
              </p>
              <h2 className="text-lg font-semibold text-navy">3. Controlul cookie-urilor</h2>
              <p>
                Poți gestiona sau șterge cookie-urile din setările browserului.
                Limitarea cookie-urilor poate afecta funcționalitatea site-ului.
              </p>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PoliticaCookies;
