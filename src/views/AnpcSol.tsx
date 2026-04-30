"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AnpcSol = () => {
  return (
    <>
      

        <meta
          name="description"
          content="Informații ANPC și Soluționarea Alternativă a Litigiilor (SOL)."
        />
        <link rel="canonical" href="https://docourse.ro/anpc-sol" />
      

      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-3xl space-y-8">
            <header className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-navy">
                ANPC și Soluționarea Alternativă a Litigiilor (SOL)
              </h1>
              <p className="text-sm text-muted-foreground">
                Ultima actualizare: 05.01.2026
              </p>
            </header>

            <section className="space-y-4 text-sm text-muted-foreground">
              <p>
                Conform legislației în vigoare, consumatorii au dreptul de a
                apela la modalități alternative de soluționare a litigiilor
                (SAL/SOL) cu operatorii economici.
              </p>
              <p>
                ANPC:{" "}
                <a
                  className="text-gold hover:underline"
                  href="https://anpc.ro/"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://anpc.ro/
                </a>
              </p>
              <p>
                Platforma SOL (ODR) a Comisiei Europene:{" "}
                <a
                  className="text-gold hover:underline"
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
              </p>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default AnpcSol;
