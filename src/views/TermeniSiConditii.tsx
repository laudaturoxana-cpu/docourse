"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermeniSiConditii = () => {
  return (
    <>
      

        <meta
          name="description"
          content="Termenii și condițiile de utilizare DoCourse."
        />
        <link rel="canonical" href="https://docourse.ro/termeni-si-conditii" />
      

      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-3xl space-y-8">
            <header className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-navy">
                Termeni și condiții
              </h1>
              <p className="text-sm text-muted-foreground">
                Ultima actualizare: 05.01.2026
              </p>
            </header>

            <section className="space-y-4 text-sm text-muted-foreground">
              <p>
                Acești termeni și condiții reglementează utilizarea platformei
                DoCourse și a serviciilor oferite. Prin accesarea sau utilizarea
                platformei, confirmi că ai citit și acceptat acești termeni.
              </p>
              <p>
                Operatorul platformei: [NUME COMPANIE], CUI [CUI], Reg. Com.
                [NR REG COM], sediul în [ADRESA], email:
                contact@docourse.ro. Te rugăm să ne furnizezi aceste date pentru
                completare.
              </p>
            </section>

            <section className="space-y-4 text-sm text-muted-foreground">
              <h2 className="text-lg font-semibold text-navy">1. Cont și acces</h2>
              <p>
                Pentru anumite funcționalități este necesar un cont. Ești
                responsabil pentru menținerea confidențialității datelor de
                autentificare și pentru activitățile derulate în cont.
              </p>
              <h2 className="text-lg font-semibold text-navy">2. Abonamente și plată</h2>
              <p>
                Serviciile pot fi oferite pe bază de abonament. Detaliile de
                preț, perioada de facturare și condițiile de încetare sunt
                prezentate în pagina de prețuri.
              </p>
              <h2 className="text-lg font-semibold text-navy">3. Drepturi și obligații</h2>
              <p>
                Utilizatorul este responsabil pentru conținutul încărcat și
                pentru respectarea legislației aplicabile. DoCourse poate
                suspenda accesul în cazul încălcării acestor termeni.
              </p>
              <h2 className="text-lg font-semibold text-navy">4. Proprietate intelectuală</h2>
              <p>
                Conținutul platformei și marca DoCourse sunt protejate de
                drepturi de autor. Este interzisă copierea sau reproducerea fără
                acord scris.
              </p>
              <h2 className="text-lg font-semibold text-navy">5. Limitarea răspunderii</h2>
              <p>
                Platforma este oferită „ca atare". Nu garantăm lipsa erorilor
                sau disponibilitatea permanentă. Răspunderea este limitată în
                măsura permisă de lege.
              </p>
              <h2 className="text-lg font-semibold text-navy">6. Modificări</h2>
              <p>
                Ne rezervăm dreptul de a modifica acești termeni. Orice
                modificare va fi publicată pe această pagină.
              </p>
              <h2 className="text-lg font-semibold text-navy">7. Contact</h2>
              <p>
                Pentru întrebări legate de termeni, ne poți scrie la
                contact@docourse.ro.
              </p>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default TermeniSiConditii;
