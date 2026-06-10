import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-base font-semibold text-navy">{title}</h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </section>
);

const PoliticaConfidentialitate = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-3xl">

        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-navy mb-2">
            Politica de Confidențialitate
          </h1>
          <p className="text-sm text-muted-foreground">Ultima actualizare: 10 iunie 2026</p>
        </div>

        <div className="space-y-8">

          <Section title="1. Operatorul de date cu caracter personal">
            <p>
              <strong className="text-foreground">DoChat Marketing Education S.R.L.</strong>, cu sediul în România,
              CUI 43889803, înregistrată la Registrul Comerțului, email:{" "}
              <a href="mailto:contact@docourse.ro" className="text-gold hover:underline">contact@docourse.ro</a>.
            </p>
            <p>
              Prelucrăm datele tale cu caracter personal în conformitate cu Regulamentul (UE) 2016/679 (GDPR)
              și legislația națională aplicabilă.
            </p>
          </Section>

          <Section title="2. Ce date colectăm">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Date de cont:</strong> nume, adresă de email, parolă (criptată)</li>
              <li><strong className="text-foreground">Date de profil:</strong> fotografie de profil, descriere, activitate profesională</li>
              <li><strong className="text-foreground">Date de plată:</strong> procesate exclusiv prin Stripe — nu stocăm date bancare pe serverele noastre</li>
              <li><strong className="text-foreground">Conținut generat:</strong> cursuri, lecții, postări în comunitate, comentarii, mesaje</li>
              <li><strong className="text-foreground">Date tehnice:</strong> adresă IP, tip browser, dispozitiv, sistem de operare</li>
              <li><strong className="text-foreground">Date de utilizare:</strong> paginile accesate, progresul în cursuri, interacțiunile din platformă</li>
            </ul>
          </Section>

          <Section title="3. Scopurile și temeiul juridic al prelucrării">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Executarea contractului</strong> — furnizarea platformei, gestionarea contului, procesarea plăților</li>
              <li><strong className="text-foreground">Interes legitim</strong> — securitate, prevenirea fraudelor, îmbunătățirea serviciilor</li>
              <li><strong className="text-foreground">Obligație legală</strong> — facturare, arhivare conform legislației fiscale</li>
              <li><strong className="text-foreground">Consimțământ</strong> — comunicări de marketing (poți retrage oricând)</li>
            </ul>
          </Section>

          <Section title="4. Perioada de stocare">
            <p>
              Datele de cont sunt păstrate pe durata utilizării platformei și 3 ani după ștergerea contului,
              conform obligațiilor legale. Datele financiare sunt păstrate 10 ani conform legislației fiscale române.
              Datele tehnice (log-uri) sunt păstrate maxim 12 luni.
            </p>
          </Section>

          <Section title="5. Destinatarii datelor">
            <p>Putem transmite date către:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Stripe Inc.</strong> — procesare plăți (SUA, cu garanții GDPR)</li>
              <li><strong className="text-foreground">Supabase Inc.</strong> — infrastructură baze de date (UE/SUA, cu garanții GDPR)</li>
              <li><strong className="text-foreground">Vercel Inc.</strong> — hosting aplicație web (SUA, cu garanții GDPR)</li>
              <li><strong className="text-foreground">Resend Inc.</strong> — trimitere emailuri tranzacționale</li>
              <li><strong className="text-foreground">Autorități publice</strong> — când suntem obligați legal</li>
            </ul>
            <p>Nu vindem datele tale niciunei terțe părți.</p>
          </Section>

          <Section title="6. Drepturile tale (GDPR)">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Dreptul de acces</strong> — poți solicita o copie a datelor tale</li>
              <li><strong className="text-foreground">Dreptul la rectificare</strong> — poți corecta datele inexacte</li>
              <li><strong className="text-foreground">Dreptul la ștergere</strong> — poți solicita ștergerea datelor ("dreptul de a fi uitat")</li>
              <li><strong className="text-foreground">Dreptul la restricționare</strong> — poți limita prelucrarea în anumite condiții</li>
              <li><strong className="text-foreground">Dreptul la portabilitate</strong> — poți primi datele în format structurat</li>
              <li><strong className="text-foreground">Dreptul la opoziție</strong> — poți obiecta față de prelucrarea bazată pe interes legitim</li>
              <li><strong className="text-foreground">Retragerea consimțământului</strong> — pentru prelucrările bazate pe consimțământ</li>
            </ul>
            <p>
              Pentru exercitarea drepturilor, scrie la{" "}
              <a href="mailto:contact@docourse.ro" className="text-gold hover:underline">contact@docourse.ro</a>.
              Răspundem în maxim 30 de zile.
            </p>
          </Section>

          <Section title="7. Securitatea datelor">
            <p>
              Aplicăm măsuri tehnice și organizatorice adecvate: criptare SSL/TLS, autentificare securizată,
              control al accesului, monitorizare continuă și backup regulat. Datele sunt stocate pe servere
              situate în Uniunea Europeană sau cu garanții GDPR echivalente.
            </p>
          </Section>

          <Section title="8. Cookie-uri">
            <p>
              Utilizăm cookie-uri strict necesare pentru funcționarea platformei și, cu consimțământul tău,
              cookie-uri analitice. Consultă{" "}
              <a href="/politica-cookies" className="text-gold hover:underline">Politica de Cookie-uri</a>{" "}
              pentru detalii.
            </p>
          </Section>

          <Section title="9. Modificări ale politicii">
            <p>
              Putem actualiza această politică periodic. Te notificăm prin email sau banner în platformă
              cu cel puțin 14 zile înainte de intrarea în vigoare a modificărilor semnificative.
            </p>
          </Section>

          <Section title="10. Contact și plângeri">
            <p>
              Pentru orice întrebare privind protecția datelor:{" "}
              <a href="mailto:contact@docourse.ro" className="text-gold hover:underline">contact@docourse.ro</a>
            </p>
            <p>
              Dacă consideri că drepturile tale au fost încălcate, poți depune plângere la{" "}
              <strong className="text-foreground">
                Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)
              </strong>:{" "}
              <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                www.dataprotection.ro
              </a>
            </p>
          </Section>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PoliticaConfidentialitate;
