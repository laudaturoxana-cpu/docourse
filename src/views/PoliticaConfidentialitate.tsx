"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PoliticaConfidentialitate = () => {
  return (
    <>
      

        <meta
          name="description"
          content="Politica de confidențialitate și GDPR DoCourse."
        />
        <link
          rel="canonical"
          href="https://docourse.ro/politica-de-confidentialitate"
        />
      

      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-3xl space-y-8">
            <header className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-navy">
                Politica de confidențialitate (GDPR)
              </h1>
              <p className="text-sm text-muted-foreground">
                Ultima actualizare: 05.01.2026
              </p>
            </header>

            <section className="space-y-4 text-sm text-muted-foreground">
              <p>
                Această politică explică modul în care DoCourse colectează,
                utilizează și protejează datele tale personale, în conformitate
                cu Regulamentul (UE) 2016/679 (GDPR).
              </p>
              <p>
                Operatorul datelor: [NUME COMPANIE], CUI [CUI], Reg. Com.
                [NR REG COM], sediul în [ADRESA], email: contact@docourse.ro.
              </p>
            </section>

            <section className="space-y-4 text-sm text-muted-foreground">
              <h2 className="text-lg font-semibold text-navy">1. Ce date colectăm</h2>
              <p>
                Putem colecta date precum nume, email, informații de plată,
                date tehnice (IP, browser, device) și conținutul încărcat de
                utilizatori.
              </p>
              <h2 className="text-lg font-semibold text-navy">2. Scopuri și temeiuri</h2>
              <p>
                Datele sunt utilizate pentru furnizarea serviciului, suport,
                facturare, securitate și îmbunătățirea platformei. Temeiurile
                includ executarea contractului, obligații legale și interes
                legitim.
              </p>
              <h2 className="text-lg font-semibold text-navy">3. Perioada de stocare</h2>
              <p>
                Păstrăm datele atât timp cât este necesar pentru scopurile
                menționate sau conform obligațiilor legale.
              </p>
              <h2 className="text-lg font-semibold text-navy">4. Drepturile tale</h2>
              <p>
                Ai dreptul de acces, rectificare, ștergere, restricționare,
                portabilitate și opoziție. Pentru exercitare, scrie la
                contact@docourse.ro.
              </p>
              <h2 className="text-lg font-semibold text-navy">5. Parteneri și transferuri</h2>
              <p>
                Putem folosi furnizori de servicii (ex: hosting, plăți) care
                acționează ca persoane împuternicite. Transferurile se fac în
                conformitate cu GDPR.
              </p>
              <h2 className="text-lg font-semibold text-navy">6. Securitate</h2>
              <p>
                Aplicăm măsuri tehnice și organizatorice pentru protecția
                datelor, inclusiv criptare și control al accesului.
              </p>
              <h2 className="text-lg font-semibold text-navy">7. Plângeri</h2>
              <p>
                Dacă consideri că drepturile tale au fost încălcate, poți depune
                plângere la ANSPDCP.
              </p>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PoliticaConfidentialitate;
