"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, ArrowLeft, Share2, Clock } from "lucide-react";
import BlogHeader from "@/components/BlogHeader";
import Footer from "@/components/Footer";
import FinalCTASection from "@/components/home/FinalCTASection";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DOMPurify from "dompurify";

// Conținut static pentru articole
const blogPostsContent: Record<string, {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  keywords: string[];
  metaTitle: string;
  metaDescription: string;
  featuredImage: string;
  featuredImageAlt: string;
  content: string;
}> = {
  "cum-sa-creezi-si-sa-vinzi-curs-online-ghid-complet": {
    title: "Cum să creezi și să vinzi un curs online în 2025 – Ghid complet",
    excerpt: "Află pas cu pas cum să îți transformi expertiza într-un curs online profitabil. De la alegerea temei, la crearea conținutului și vânzarea efectivă – totul într-un singur ghid.",
    date: "23 februarie 2025",
    readTime: "12 min",
    keywords: ["cum să creezi un curs online", "cum să vinzi cursuri online", "platforma cursuri online", "ghid curs online", "cursuri online România"],
    metaTitle: "Cum să creezi și să vinzi un curs online în 2025 – Ghid complet pas cu pas",
    metaDescription: "Ghid complet pentru a crea și vinde cursuri online în România. Află cum să alegi tema, să structurezi conținutul, să stabilești prețul și să lansezi cu succes.",
    featuredImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop",
    featuredImageAlt: "Persoană creând un curs online pe laptop",
    content: `
      <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop" alt="Echipă colaborând la crearea unui curs online" class="w-full h-64 md:h-96 object-cover rounded-2xl mb-8" />

      <p class="text-lg text-muted-foreground mb-8">Ai acumulat experiență într-un domeniu și simți că ai ceva valoros de transmis? Crearea unui curs online poate fi modalitatea perfectă de a-ți monetiza cunoștințele, de a ajunge la mii de oameni și de a construi un venit recurent. În acest ghid complet, îți arăt exact cum să faci asta – pas cu pas, fără complicații tehnice.</p>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">De ce să creezi un curs online în 2025?</h2>

      <p class="mb-4">Piața cursurilor online crește exponențial. Tot mai mulți oameni preferă să învețe de acasă, în ritmul lor, de la experți care au rezultate reale. Asta înseamnă o oportunitate uriașă pentru tine.</p>

      <p class="mb-4"><strong>Avantajele unui curs online:</strong></p>

      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Venit pasiv</strong> – Creezi cursul o dată, îl vinzi de nenumărate ori</li>
        <li><strong>Scalabilitate</strong> – Poți ajunge la sute sau mii de cursanți fără efort suplimentar</li>
        <li><strong>Autoritate</strong> – Te poziționezi ca expert în domeniul tău</li>
        <li><strong>Flexibilitate</strong> – Lucrezi de oriunde, oricând</li>
        <li><strong>Impact</strong> – Ajuți oameni să rezolve probleme reale</li>
      </ul>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Pasul 1: Alege o temă care se vinde</h2>

      <p class="mb-4">Nu orice temă face un curs profitabil. Secretul este să găsești intersecția dintre:</p>

      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Ce știi tu bine</strong> – expertiza ta reală</li>
        <li><strong>Ce vor oamenii să învețe</strong> – cererea din piață</li>
        <li><strong>Ce sunt dispuși să plătească</strong> – valoarea percepută</li>
      </ul>

      <p class="mb-4"><strong>Cum validezi tema?</strong></p>

      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Caută pe Google ce întrebări pun oamenii în domeniul tău</li>
        <li>Verifică grupurile de Facebook și forumurile relevante</li>
        <li>Întreabă direct comunitatea ta (dacă ai una) ce ar vrea să învețe</li>
        <li>Analizează ce cursuri similare există și cum sunt primite</li>
      </ol>

      <div class="bg-beige/50 border border-gold/30 rounded-xl p-6 my-8">
        <p class="font-semibold text-navy mb-2">💡 Sfat profesionist:</p>
        <p class="text-charcoal">Nu încerca să creezi „cursul perfect pentru toată lumea". Cu cât ești mai specific, cu atât atragi oamenii potriviți. „Curs de marketing" e prea vag. „Marketing pe Instagram pentru magazine de handmade" e mult mai bun.</p>
      </div>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Pasul 2: Structurează cursul pentru rezultate</h2>

      <p class="mb-4">Un curs bun nu e despre cât de mult știi tu, ci despre cât de repede poate cursantul să obțină rezultate. Structura face diferența.</p>

      <p class="mb-4"><strong>Formula unei structuri eficiente:</strong></p>

      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li><strong>Modulul de introducere</strong> – Ce vor învăța, ce rezultate vor obține</li>
        <li><strong>Module de conținut</strong> – Împarte materia în 4-8 module logice</li>
        <li><strong>Lecții scurte</strong> – Fiecare lecție: 5-15 minute, o singură idee</li>
        <li><strong>Exerciții practice</strong> – Fiecare modul să aibă aplicație practică</li>
        <li><strong>Modulul final</strong> – Recapitulare și următorii pași</li>
      </ol>

      <p class="mb-4"><strong>Greșeala #1 a începătorilor:</strong> Vor să pună TOT ce știu într-un singur curs. Rezultatul? Cursanții se pierd și abandonează. Mai bine un curs focusat de 2 ore decât unul de 20 de ore unde nimeni nu ajunge la final.</p>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Pasul 3: Creează conținutul (fără perfecționism)</h2>

      <img src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=450&fit=crop" alt="Setup pentru înregistrare video curs online" class="w-full h-48 md:h-64 object-cover rounded-xl mb-6" />

      <p class="mb-4">Aici se blochează majoritatea oamenilor. Perfecționismul este dușmanul progresului. Un curs lansat și îmbunătățit ulterior bate un curs perfect care nu există niciodată.</p>

      <p class="mb-4"><strong>Ce echipament ai nevoie?</strong></p>

      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Cameră</strong> – Telefonul tău e suficient pentru început</li>
        <li><strong>Microfon</strong> – Investește aici! Sunetul prost face oamenii să plece. Un microfon lavalieră de 100-200 lei face minuni</li>
        <li><strong>Lumină</strong> – Lumina naturală sau o lampă ring de bază</li>
        <li><strong>Software</strong> – Loom (gratuit) pentru înregistrare ecran, Canva pentru prezentări</li>
      </ul>

      <p class="mb-4"><strong>Tipuri de lecții care funcționează:</strong></p>

      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Talking head</strong> – Tu vorbești la cameră (conexiune personală)</li>
        <li><strong>Screen share</strong> – Arăți ce faci pe ecran (tutoriale)</li>
        <li><strong>Prezentări</strong> – Slide-uri cu voce peste (explicații conceptuale)</li>
        <li><strong>Mix</strong> – Combinație dintre toate (cel mai eficient)</li>
      </ul>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Pasul 4: Alege platforma potrivită</h2>

      <p class="mb-4">Platforma pe care îți găzduiești cursul influențează direct experiența cursanților și ușurința cu care vinzi. Ai mai multe opțiuni:</p>

      <p class="mb-4"><strong>Opțiuni internaționale:</strong></p>
      <ul class="list-disc pl-6 mb-4 space-y-1">
        <li>Teachable, Kajabi, Thinkific – scumpe, în dolari, complicate</li>
      </ul>

      <p class="mb-4"><strong>Opțiuni locale:</strong></p>
      <ul class="list-disc pl-6 mb-4 space-y-1">
        <li><strong>DoCourse</strong> – platformă românească, simplă, cu prețuri în lei și suport local</li>
      </ul>

      <div class="bg-gold/10 border border-gold/30 rounded-xl p-6 my-8">
        <p class="font-semibold text-navy mb-2">✅ De ce DoCourse?</p>
        <ul class="list-disc pl-6 space-y-1 text-charcoal">
          <li>Interfață în română, suport în română</li>
          <li>Prețuri în lei, fără comisioane ascunse</li>
          <li>Publicare rapidă – poți lansa în câteva ore</li>
          <li>Funcții de comunitate incluse</li>
          <li>Design profesional fără să știi să programezi</li>
        </ul>
      </div>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Pasul 5: Stabilește prețul corect</h2>

      <p class="mb-4">Prețul nu trebuie să reflecte orele de muncă, ci valoarea transformării pe care o oferi.</p>

      <p class="mb-4"><strong>Întrebări care te ajută să stabilești prețul:</strong></p>

      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Cât economisește cursantul în timp/bani aplicând ce învață?</li>
        <li>Cât ar costa o consultanță 1-la-1 cu tine?</li>
        <li>Care e prețul cursurilor similare de pe piață?</li>
        <li>Ce buget are publicul tău țintă?</li>
      </ul>

      <p class="mb-4"><strong>Intervale de preț orientative (România):</strong></p>

      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Mini-curs (1-2 ore)</strong>: 97 - 197 lei</li>
        <li><strong>Curs standard (3-6 ore)</strong>: 297 - 597 lei</li>
        <li><strong>Curs premium (6+ ore + bonusuri)</strong>: 697 - 1.497 lei</li>
        <li><strong>Program complet (curs + coaching)</strong>: 1.500 - 5.000+ lei</li>
      </ul>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Pasul 6: Lansează și promovează</h2>

      <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop" alt="Marketing și promovare cursuri online" class="w-full h-48 md:h-64 object-cover rounded-xl mb-6" />

      <p class="mb-4">Cel mai bun curs din lume nu se vinde singur. Ai nevoie de o strategie de lansare.</p>

      <p class="mb-4"><strong>Strategia de lansare în 3 pași:</strong></p>

      <ol class="list-decimal pl-6 mb-6 space-y-3">
        <li>
          <strong>Pre-lansare (2-4 săptămâni înainte)</strong>
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li>Anunță că lucrezi la curs</li>
            <li>Colectează email-uri (listă de așteptare)</li>
            <li>Oferă sneak-peeks și conținut gratuit relevant</li>
          </ul>
        </li>
        <li>
          <strong>Lansare (5-7 zile)</strong>
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li>Trimite email către listă</li>
            <li>Postează pe social media zilnic</li>
            <li>Oferă un bonus pentru primii cumpărători</li>
          </ul>
        </li>
        <li>
          <strong>Post-lansare (ongoing)</strong>
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li>Colectează testimoniale</li>
            <li>Creează conținut gratuit care atrage în curs</li>
            <li>Fă lansări periodice cu oferte speciale</li>
          </ul>
        </li>
      </ol>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Greșeli frecvente de evitat</h2>

      <ol class="list-decimal pl-6 mb-6 space-y-3">
        <li><strong>Să aștepți să fie perfect</strong> – Lansează versiunea minimă viabilă și îmbunătățește bazat pe feedback</li>
        <li><strong>Să nu validezi ideea</strong> – Vinde cursul înainte să-l creezi complet (pre-vânzare)</li>
        <li><strong>Să ignori marketingul</strong> – 50% din timp ar trebui să meargă în promovare</li>
        <li><strong>Să nu construiești o comunitate</strong> – Cursanții care se simt parte dintr-un grup rămân și cumpără din nou</li>
        <li><strong>Să subapreciezi suportul</strong> – Răspunde la întrebări, fii prezent pentru cursanți</li>
      </ol>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Concluzie: Primul pas e cel mai greu</h2>

      <p class="mb-4">Nu trebuie să fie perfect din prima. Nu trebuie să ai 10.000 de urmăritori. Nu trebuie să fii „cel mai bun" din domeniu.</p>

      <p class="mb-4">Trebuie doar să începi.</p>

      <p class="mb-4">Alege o temă, structurează 5-7 lecții, înregistrează-le cu telefonul, publică-le pe o platformă simplă precum DoCourse, și vezi ce feedback primești.</p>

      <p class="mb-6">Fiecare expert de succes a început exact de unde ești tu acum. Diferența? Ei au făcut primul pas.</p>
    `
  },

  "platforma-simpla-cursuri-online": {
    title: "Platformă simplă pentru cursuri online – Ghid pentru începători",
    excerpt: "Vrei să publici un curs online dar te sperie tehnologia? Descoperă cum să lansezi rapid, fără setări complicate și fără să fii expert în IT.",
    date: "22 februarie 2025",
    readTime: "10 min",
    keywords: ["platformă cursuri online simplă", "cum să publici un curs online", "platformă cursuri pentru începători", "cursuri online fără tehnologie", "publicare curs ușor"],
    metaTitle: "Platformă simplă pentru cursuri online – Ghid complet pentru începători",
    metaDescription: "Caută o platformă simplă pentru cursuri online? Află cum să publici primul curs fără bătăi de cap, în câteva ore, chiar dacă nu te pricepi la tehnologie.",
    featuredImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop",
    featuredImageAlt: "Laptop pe birou cu cafea - platformă simplă cursuri",
    content: `
      <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop" alt="Spațiu de lucru simplu și organizat pentru crearea de cursuri" class="w-full h-64 md:h-96 object-cover rounded-2xl mb-8" />

      <p class="text-lg text-muted-foreground mb-8">„Vreau să fac un curs online, dar nu știu de unde să încep." Dacă ți-ai spus asta vreodată, ești în locul potrivit. Adevărul e că nu ai nevoie de cunoștințe tehnice avansate, de un buget mare sau de luni de pregătire. Ai nevoie doar de o platformă simplă și de curajul de a începe.</p>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">De ce majoritatea creatorilor renunță înainte să înceapă?</h2>

      <p class="mb-4">Ai expertiză valoroasă. Știi lucruri pe care alții ar plăti să le învețe. Dar când vine vorba de „cum să faci un curs online", te lovești de un zid de întrebări tehnice:</p>

      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>„Cum configurez plățile online?"</strong> – Stripe, PayPal, procesatori... pare copleșitor</li>
        <li><strong>„Cum protejez conținutul să nu fie piratat?"</strong> – Îți e teamă că munca ta va fi furată</li>
        <li><strong>„Am nevoie de site propriu? De hosting?"</strong> – Nu știi ce înseamnă și nici nu vrei să afli</li>
        <li><strong>„Ce fac dacă ceva nu funcționează?"</strong> – Ideea de a rămâne blocat fără suport te sperie</li>
      </ul>

      <p class="mb-4">Aceste frici sunt normale. Dar vestea bună? În 2025, tehnologia a evoluat. Există platforme care fac toată treaba complicată în spatele scenei, lăsându-te să te concentrezi pe ceea ce contează: conținutul tău.</p>

      <div class="bg-beige/50 border border-gold/30 rounded-xl p-6 my-8">
        <p class="font-semibold text-navy mb-2">💡 Gândește-te așa:</p>
        <p class="text-charcoal">Nu trebuie să știi cum funcționează un motor pentru a conduce o mașină. La fel, nu trebuie să știi programare pentru a avea un curs online profesional.</p>
      </div>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Ce înseamnă cu adevărat o „platformă simplă"?</h2>

      <p class="mb-4">O platformă simplă nu înseamnă o platformă „limitată" sau „de amatori". Înseamnă o platformă inteligentă, care ascunde complexitatea și îți oferă doar ce ai nevoie.</p>

      <p class="mb-4"><strong>Caracteristicile unei platforme cu adevărat simple:</strong></p>

      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Încarci videoclipuri drag & drop</strong> – Tragi fișierul, îl lași, gata. Fără conversii, fără coduri de embed</li>
        <li><strong>Structurezi cursul vizual</strong> – Module și lecții pe care le aranjezi cum vrei, ca niște cărți de joc</li>
        <li><strong>Plățile sunt integrate</strong> – Nu configurezi tu nimic. Clientul plătește, tu primești banii</li>
        <li><strong>Accesul e automat</strong> – Cursantul primește instant linkul după plată, fără să trimiți tu manual</li>
        <li><strong>Suportul există</strong> – Când ai o problemă, vorbești cu un om real, în limba ta</li>
      </ul>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Cele 3 greșeli fatale ale începătorilor</h2>

      <p class="mb-4">Am văzut sute de creatori blocați în aceste capcane. Nu repeta greșelile lor:</p>

      <ol class="list-decimal pl-6 mb-6 space-y-3">
        <li>
          <strong>Greșeala #1: Aleg platforma „cea mai populară"</strong>
          <p class="mt-2">Teachable, Kajabi, Thinkific – sunt platforme bune, dar sunt făcute pentru piața americană. Prețuri în dolari (care fluctuează), interfață în engleză, suport în alt fus orar. Pentru un creator român care abia începe, sunt overkill.</p>
        </li>
        <li>
          <strong>Greșeala #2: Își construiesc site propriu</strong>
          <p class="mt-2">„O să-mi fac site cu WordPress, e mai ieftin." Două luni mai târziu: încă te lupți cu plugin-uri, teme care nu funcționează, și un site care arată neprofesional. Timpul tău valorează mai mult decât costul unei platforme.</p>
        </li>
        <li>
          <strong>Greșeala #3: Se complică cu automatizări înainte să aibă vânzări</strong>
          <p class="mt-2">Email sequences, funnel-uri cu 17 pași, pixel Facebook, retargeting... Toate astea sunt utile când ai deja clienți. La început, focusul trebuie să fie pe lansare, nu pe optimizare.</p>
        </li>
      </ol>

      <div class="bg-gold/10 border border-gold/30 rounded-xl p-6 my-8">
        <p class="font-semibold text-navy mb-2">✅ Regula de aur:</p>
        <p class="text-charcoal">Lansează simplu, optimizează mai târziu. Un curs live și imperfect bate un curs perfect care nu există.</p>
      </div>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Cum arată publicarea unui curs în 4 pași simpli</h2>

      <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop" alt="Proces simplu de lucru pe laptop" class="w-full h-48 md:h-64 object-cover rounded-xl mb-6" />

      <p class="mb-4">Pe o platformă bine gândită, procesul arată așa:</p>

      <ol class="list-decimal pl-6 mb-6 space-y-3">
        <li>
          <strong>Pasul 1: Creezi contul (2 minute)</strong>
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li>Introduci emailul și o parolă</li>
            <li>Confirmi adresa de email</li>
            <li>Gata, ai cont</li>
          </ul>
        </li>
        <li>
          <strong>Pasul 2: Încarci conținutul (1-3 ore)</strong>
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li>Creezi primul modul („Introducere")</li>
            <li>Încarci videoclipurile prin drag & drop</li>
            <li>Adaugi descrieri scurte la fiecare lecție</li>
            <li>Repeți pentru fiecare modul</li>
          </ul>
        </li>
        <li>
          <strong>Pasul 3: Setezi detaliile (10 minute)</strong>
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li>Titlu și descriere pentru curs</li>
            <li>Prețul (în lei sau euro)</li>
            <li>O imagine de copertă</li>
          </ul>
        </li>
        <li>
          <strong>Pasul 4: Publici (1 clic)</strong>
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li>Apeși „Publică"</li>
            <li>Primești linkul cursului</li>
            <li>Îl trimiți clienților sau îl postezi pe social media</li>
          </ul>
        </li>
      </ol>

      <p class="mb-4"><strong>Asta e tot.</strong> Fără configurări DNS, fără integrări API, fără cod, fără dureri de cap.</p>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">De ce contează să fie o platformă românească?</h2>

      <p class="mb-4">„Dar Teachable e cel mai cunoscut..." – da, în America. Pentru un creator român, o platformă locală oferă avantaje concrete:</p>

      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Interfața în română</strong> – Când butonul scrie „Adaugă lecție" în loc de „Add lesson", nu mai trebuie să ghicești</li>
        <li><strong>Suport în limba ta</strong> – Explici problema și primești răspuns rapid, fără bariere de limbă</li>
        <li><strong>Prețuri în lei</strong> – Știi exact cât plătești. Fără surprize când euro crește</li>
        <li><strong>Facturare conformă</strong> – Facturi valide pentru contabilitatea din România</li>
        <li><strong>Plăți pentru clienți români</strong> – Cursanții tăi pot plăti ușor, fără card internațional obligatoriu</li>
      </ul>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Checklist: Este platforma suficient de simplă pentru tine?</h2>

      <p class="mb-4">Înainte să alegi o platformă, verifică aceste puncte:</p>

      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>☐ Pot încărca un video în mai puțin de 5 minute?</li>
        <li>☐ Pot crea un curs complet fără să citesc documentație tehnică?</li>
        <li>☐ Plățile sunt integrate sau trebuie să configurez Stripe/PayPal separat?</li>
        <li>☐ Există suport în română?</li>
        <li>☐ Pot încerca gratuit înainte să plătesc?</li>
        <li>☐ Prețurile sunt în lei sau în dolari?</li>
      </ul>

      <p class="mb-4">Dacă răspunsul e „da" la toate, ai găsit platforma potrivită pentru tine.</p>

      <div class="bg-gold/10 border border-gold/30 rounded-xl p-6 my-8">
        <p class="font-semibold text-navy mb-2">✅ DoCourse bifează toate aceste criterii</p>
        <p class="text-charcoal mb-3">Platforma a fost creată special pentru creatorii români care vor să publice rapid, fără complicații tehnice.</p>
        <ul class="list-disc pl-6 space-y-1 text-charcoal">
          <li>Interfață 100% în română</li>
          <li>Plăți în lei, integrate direct în platformă</li>
          <li>Suport real, prin chat și email, de la oameni care vorbesc română</li>
          <li>7 zile de test gratuit – fără card</li>
          <li>Publicare în aceeași zi</li>
        </ul>
      </div>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Când NU ai nevoie de o platformă simplă</h2>

      <p class="mb-4">Să fim onești – nu e pentru toată lumea. O platformă simplă nu e cea mai bună alegere dacă:</p>

      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Ai deja mii de cursanți</strong> și nevoi complexe de automatizare avansată</li>
        <li><strong>Ai o echipă tehnică</strong> și vrei control total asupra fiecărui detaliu</li>
        <li><strong>Ai nevoie de certificări acreditate</strong> sau funcții enterprise LMS</li>
        <li><strong>Vinzi predominant internațional</strong> și ai nevoie de integrări specifice piețelor externe</li>
      </ul>

      <p class="mb-4">Dar dacă ești la început, sau ai un business mic-mediu cu focus pe România, simplitatea e cel mai mare avantaj pe care îl poți avea.</p>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Concluzie: Simplu înseamnă mai multe cursuri lansate</h2>

      <p class="mb-4">Fiecare oră petrecută cu setări tehnice e o oră în care nu creezi conținut valoros. Fiecare zi amânată din cauza „tehnologiei" e o zi în care potențialii tăi cursanți învață de la altcineva.</p>

      <p class="mb-4">Nu ai nevoie de cea mai sofisticată platformă din lume. Ai nevoie de una care funcționează, care te lasă să publici azi – nu peste 3 luni.</p>

      <p class="mb-4">Alege o platformă care se dă la o parte și te lasă să faci ce știi tu mai bine: să înveți oameni.</p>

      <p class="mb-6"><strong>Primul pas?</strong> Încearcă gratuit. Încarcă prima lecție. Vezi cât de simplu e. Restul vine de la sine.</p>
    `
  },

  "alternativa-teachable-romania": {
    title: "Alternativa Teachable pentru România – Comparație completă 2025",
    excerpt: "Cauți o alternativă la Teachable pentru piața din România? Compară opțiunile disponibile, prețurile și funcțiile pentru a face alegerea potrivită.",
    date: "21 februarie 2025",
    readTime: "12 min",
    keywords: ["alternativă Teachable România", "Teachable vs DoCourse", "platformă cursuri online România", "Teachable alternativă", "cele mai bune platforme cursuri online"],
    metaTitle: "Alternativa Teachable pentru România – Comparație completă 2025",
    metaDescription: "Compară Teachable cu alternativele locale din România. Află care platformă e mai potrivită pentru creatorii de cursuri online români în 2025.",
    featuredImage: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=630&fit=crop",
    featuredImageAlt: "Comparație platforme cursuri online",
    content: `
      <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=630&fit=crop" alt="Analiză și comparație platforme pe laptop" class="w-full h-64 md:h-96 object-cover rounded-2xl mb-8" />

      <p class="text-lg text-muted-foreground mb-8">Teachable e una dintre cele mai cunoscute platforme pentru cursuri online din lume. Dar e ea cea mai bună alegere pentru un creator din România? În acest ghid detaliat analizăm alternativele disponibile, comparăm prețuri, funcții și experiențe – și te ajutăm să faci alegerea potrivită pentru situația ta specifică.</p>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Ce este Teachable și de ce e atât de popular?</h2>

      <p class="mb-4">Teachable e o platformă americană fondată în 2014, specializată în crearea și vânzarea cursurilor online. A devenit rapidă populară datorită interfeței intuitive și a funcțiilor complete pentru creatori.</p>

      <p class="mb-4"><strong>Ce oferă Teachable:</strong></p>

      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Găzduire cursuri video</strong> – Încarci videoclipuri direct pe platforma lor</li>
        <li><strong>Procesare plăți</strong> – Primești bani prin Stripe sau PayPal</li>
        <li><strong>Pagini de vânzare</strong> – Creezi landing pages pentru cursurile tale</li>
        <li><strong>Integrări</strong> – Se conectează cu Mailchimp, ConvertKit, Zapier etc.</li>
        <li><strong>Comunitate</strong> – Poți crea spații de discuție pentru cursanți</li>
        <li><strong>Analiză</strong> – Dashboard cu statistici despre vânzări și progres</li>
      </ul>

      <p class="mb-4">Pe hârtie, sună perfect. Dar când ești creator român, realitatea e puțin diferită.</p>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Cele 5 probleme majore cu Teachable pentru creatorii români</h2>

      <p class="mb-4">Am vorbit cu zeci de creatori români care au folosit Teachable. Iată ce probleme întâmpină constant:</p>

      <ol class="list-decimal pl-6 mb-6 space-y-4">
        <li>
          <strong>Problema #1: Prețuri în dolari, facturi imprevizibile</strong>
          <p class="mt-2">Planul de bază Teachable costă $59/lună. Dar dolarul fluctuează. Luna trecută plăteai 270 lei, luna asta 290 lei. Pentru un creator la început, aceste variații pot fi stresante.</p>
          <p class="mt-2">În plus, pe planul de bază Teachable ia și 5% comision din fiecare vânzare. Vinzi un curs de 500 lei? 25 lei merg la Teachable, pe lângă abonamentul lunar.</p>
        </li>
        <li>
          <strong>Problema #2: Suport doar în engleză, fus orar american</strong>
          <p class="mt-2">Ai o problemă urgentă la ora 10 dimineața în România? Suportul Teachable doarme – e ora 3 noaptea în New York. Și când răspund, răspund în engleză. Dacă nu ești fluent, comunicarea devine frustrantă.</p>
        </li>
        <li>
          <strong>Problema #3: Facturare complicată pentru contabilitate</strong>
          <p class="mt-2">Facturile vin din SUA. Contabilul tău trebuie să le înregistreze ca servicii din afara UE. Trebuie să calculezi TVA la import de servicii. E posibil, dar adaugă complexitate administrativă.</p>
        </li>
        <li>
          <strong>Problema #4: Plățile în lei sunt dificil de configurat</strong>
          <p class="mt-2">Mulți cursanți români preferă să plătească în lei. Sau prin transfer bancar. Pe Teachable, aceste opțiuni sunt fie inexistente, fie necesită configurări complicate cu procesatori terți.</p>
        </li>
        <li>
          <strong>Problema #5: Funcții avansate pe care nu le folosești</strong>
          <p class="mt-2">Teachable e construit pentru creatori americani cu echipe mari. Are funcții de affiliate marketing avansat, certificări, multiple instructori... Funcții pe care un creator român la început pur și simplu nu le folosește, dar pentru care plătește.</p>
        </li>
      </ol>

      <div class="bg-beige/50 border border-gold/30 rounded-xl p-6 my-8">
        <p class="font-semibold text-navy mb-2">💡 Întrebarea reală:</p>
        <p class="text-charcoal">Nu e vorba dacă Teachable e o platformă bună – e. Întrebarea e: e potrivită pentru TINE, ca creator român, în situația ta actuală?</p>
      </div>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Ce alternative există? Analiza completă</h2>

      <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop" alt="Analiză opțiuni și alternative" class="w-full h-48 md:h-64 object-cover rounded-xl mb-6" />

      <p class="mb-4">Să trecem prin toate opțiunile pe care le ai:</p>

      <h3 class="text-xl font-semibold text-navy mt-8 mb-3">Categoria 1: Platforme internaționale similare</h3>

      <p class="mb-4"><strong>Kajabi ($149/lună)</strong></p>
      <ul class="list-disc pl-6 mb-4 space-y-1">
        <li>Mai scump decât Teachable</li>
        <li>All-in-one: include și email marketing</li>
        <li>Aceleași probleme: dolari, engleză, complexitate</li>
        <li>Recomandat pentru: business-uri mari, $10k+/lună venituri</li>
      </ul>

      <p class="mb-4"><strong>Thinkific ($36-149/lună)</strong></p>
      <ul class="list-disc pl-6 mb-4 space-y-1">
        <li>Similar cu Teachable, puțin mai ieftin</li>
        <li>Are plan gratuit (dar foarte limitat)</li>
        <li>Tot în dolari, tot suport în engleză</li>
        <li>Recomandat pentru: testare, dacă vrei să încerci o platformă internațională</li>
      </ul>

      <p class="mb-4"><strong>Podia ($39/lună)</strong></p>
      <ul class="list-disc pl-6 mb-4 space-y-1">
        <li>Mai simplu decât Teachable</li>
        <li>Bun pentru produse digitale simple</li>
        <li>Mai puține funcții pentru cursuri complexe</li>
        <li>Recomandat pentru: ebook-uri, download-uri, webinarii</li>
      </ul>

      <h3 class="text-xl font-semibold text-navy mt-8 mb-3">Categoria 2: Soluții DIY (Do It Yourself)</h3>

      <p class="mb-4"><strong>WordPress + LearnDash/LifterLMS</strong></p>
      <ul class="list-disc pl-6 mb-4 space-y-1">
        <li>Control total asupra platformei</li>
        <li>Cost inițial mai mic (dar crește cu plugin-urile)</li>
        <li>Necesită cunoștințe tehnice sau dezvoltator</li>
        <li>TU ești responsabil pentru hosting, securitate, backup-uri, update-uri</li>
        <li>Recomandat pentru: cei cu echipă tehnică sau buget pentru dezvoltator</li>
      </ul>

      <p class="mb-4"><strong>Vimeo OTT</strong></p>
      <ul class="list-disc pl-6 mb-4 space-y-1">
        <li>Excelent pentru streaming video</li>
        <li>Nu e făcut pentru cursuri structurate</li>
        <li>Fără sistem de progres, quizuri, certificate</li>
        <li>Recomandat pentru: conținut video tip Netflix, nu cursuri educaționale</li>
      </ul>

      <h3 class="text-xl font-semibold text-navy mt-8 mb-3">Categoria 3: Platforme locale (România)</h3>

      <p class="mb-4"><strong>DoCourse</strong></p>
      <ul class="list-disc pl-6 mb-4 space-y-1">
        <li>Platformă românească, creată pentru creatori locali</li>
        <li>Prețuri în lei, stabile și previzibile</li>
        <li>Suport în română, fus orar local</li>
        <li>Plăți în lei integrate nativ</li>
        <li>Funcții adaptate nevoilor creatorilor români</li>
        <li>Recomandat pentru: creatori români care vând către public românesc</li>
      </ul>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Comparație detaliată: Teachable vs DoCourse</h2>

      <p class="mb-4">Să punem față în față cele două opțiuni:</p>

      <div class="overflow-x-auto my-8">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-beige/50">
              <th class="border border-border p-3 text-left font-semibold text-navy">Criteriu</th>
              <th class="border border-border p-3 text-left font-semibold text-navy">Teachable</th>
              <th class="border border-border p-3 text-left font-semibold text-navy">DoCourse</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-border p-3 font-medium">Preț lunar</td>
              <td class="border border-border p-3">$59+ (~280 lei, variabil)</td>
              <td class="border border-border p-3">Din 99 lei (fix, în lei)</td>
            </tr>
            <tr class="bg-beige/20">
              <td class="border border-border p-3 font-medium">Comision pe vânzări</td>
              <td class="border border-border p-3">5% pe planul Basic</td>
              <td class="border border-border p-3">0%</td>
            </tr>
            <tr>
              <td class="border border-border p-3 font-medium">Limba interfeței</td>
              <td class="border border-border p-3">Engleză</td>
              <td class="border border-border p-3">Română</td>
            </tr>
            <tr class="bg-beige/20">
              <td class="border border-border p-3 font-medium">Suport clienți</td>
              <td class="border border-border p-3">Email în engleză, fus SUA</td>
              <td class="border border-border p-3">Chat + email în română</td>
            </tr>
            <tr>
              <td class="border border-border p-3 font-medium">Plăți în lei</td>
              <td class="border border-border p-3">Necesită configurare extra</td>
              <td class="border border-border p-3">Inclus nativ</td>
            </tr>
            <tr class="bg-beige/20">
              <td class="border border-border p-3 font-medium">Transfer bancar</td>
              <td class="border border-border p-3">Nu</td>
              <td class="border border-border p-3">Da</td>
            </tr>
            <tr>
              <td class="border border-border p-3 font-medium">Facturare</td>
              <td class="border border-border p-3">Din SUA</td>
              <td class="border border-border p-3">Conformă RO</td>
            </tr>
            <tr class="bg-beige/20">
              <td class="border border-border p-3 font-medium">Comunitate cursanți</td>
              <td class="border border-border p-3">Suplimentar</td>
              <td class="border border-border p-3">Inclus</td>
            </tr>
            <tr>
              <td class="border border-border p-3 font-medium">Complexitate setup</td>
              <td class="border border-border p-3">Medie-mare</td>
              <td class="border border-border p-3">Mică</td>
            </tr>
            <tr class="bg-beige/20">
              <td class="border border-border p-3 font-medium">Timp până la lansare</td>
              <td class="border border-border p-3">1-2 săptămâni</td>
              <td class="border border-border p-3">Câteva ore</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Când Teachable E alegerea potrivită</h2>

      <p class="mb-4">Să fim corecți – Teachable nu e o platformă proastă. E excelentă în anumite situații:</p>

      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Vinzi predominant internațional</strong> – Dacă 70%+ din cursanți sunt din SUA/UK/EU vest, Teachable face sens</li>
        <li><strong>Ai venituri mari</strong> – Peste $5000/lună, comisioanele și abonamentul devin neglijabile</li>
        <li><strong>Ai echipă</strong> – Cineva care se ocupă de tehnic, cineva de suport</li>
        <li><strong>Ai nevoie de integrări complexe</strong> – Zapier avansate, affiliate marketing sofisticat</li>
        <li><strong>Ești confortabil în engleză</strong> – Atât tu, cât și cursanții tăi</li>
      </ul>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Când o alternativă locală E alegerea potrivită</h2>

      <p class="mb-4">O platformă românească precum DoCourse e mai bună dacă:</p>

      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Publicul tău e din România</strong> – Vor să plătească în lei, vor suport în română</li>
        <li><strong>Ești la început</strong> – Nu ai nevoie de funcții enterprise pe care nu le folosești</li>
        <li><strong>Bugetul contează</strong> – Fiecare leu economisit e un leu investit în marketing</li>
        <li><strong>Vrei să lansezi rapid</strong> – Fără săptămâni de configurare și tutoriale</li>
        <li><strong>Preferi suport local</strong> – Când ai o problemă, vrei să vorbești cu cineva care înțelege</li>
        <li><strong>Vrei facturare simplă</strong> – Fără bătăi de cap cu contabilitatea</li>
      </ul>

      <div class="bg-gold/10 border border-gold/30 rounded-xl p-6 my-8">
        <p class="font-semibold text-navy mb-2">🎯 Regula de aur:</p>
        <p class="text-charcoal">Alege platforma care se potrivește cu publicul tău ACUM, nu cu publicul pe care SPERI să-l ai peste 5 ani. Poți migra oricând mai târziu.</p>
      </div>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Ghid pas cu pas: Cum migrezi de la Teachable</h2>

      <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop" alt="Proces de migrare și tranziție" class="w-full h-48 md:h-64 object-cover rounded-xl mb-6" />

      <p class="mb-4">Dacă folosești deja Teachable și vrei să faci tranziția, urmează acești pași:</p>

      <ol class="list-decimal pl-6 mb-6 space-y-3">
        <li>
          <strong>Pasul 1: Exportă datele din Teachable</strong>
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li>Lista de cursanți (email-uri, nume)</li>
            <li>Istoricul de vânzări (pentru evidență)</li>
            <li>Videoclipurile (dacă nu le ai deja local)</li>
          </ul>
        </li>
        <li>
          <strong>Pasul 2: Creează cursul pe noua platformă</strong>
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li>Încarcă videoclipurile</li>
            <li>Recreează structura modulelor</li>
            <li>Setează prețul (în lei de data asta!)</li>
          </ul>
        </li>
        <li>
          <strong>Pasul 3: Migrează cursanții existenți</strong>
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li>Trimite email cursanților cu link de acces pe noua platformă</li>
            <li>Oferă-le acces gratuit (au plătit deja)</li>
            <li>Explică beneficiile (interfață în română, suport mai bun)</li>
          </ul>
        </li>
        <li>
          <strong>Pasul 4: Redirecționează traficul</strong>
          <ul class="list-disc pl-6 mt-2 space-y-1">
            <li>Actualizează link-urile de pe site/social media</li>
            <li>Setează redirect de la vechea pagină de vânzare</li>
            <li>Anunță schimbarea pe canalele tale</li>
          </ul>
        </li>
      </ol>

      <p class="mb-4"><strong>Durata totală:</strong> Majoritatea creatorilor finalizează migrarea într-o singură zi.</p>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Întrebări frecvente despre alternativele Teachable</h2>

      <p class="mb-4"><strong>Pot folosi DoCourse dacă am cursanți din străinătate?</strong></p>
      <p class="mb-6">Da, absolut. Platforma suportă plăți în euro și dolari. Diferența e că e OPTIMIZATĂ pentru piața românească – nu exclusivă pentru ea.</p>

      <p class="mb-4"><strong>Ce se întâmplă cu cursanții mei existenți dacă migrez?</strong></p>
      <p class="mb-6">Nu îi pierzi. Le oferi acces pe noua platformă (au plătit deja pentru curs). Majoritatea apreciază upgrade-ul la interfață în română.</p>

      <p class="mb-4"><strong>E DoCourse la fel de profesional ca Teachable?</strong></p>
      <p class="mb-6">Da. Funcționalitățile de bază sunt similare sau superioare. Ce câștigi: simplicitate, suport local, prețuri stabile. Ce nu ai: unele funcții enterprise pe care oricum nu le folosești.</p>

      <p class="mb-4"><strong>Pot încerca înainte să mă decid?</strong></p>
      <p class="mb-6">Da. DoCourse oferă 7 zile de test gratuit, fără a pune cardul. Încarcă un curs, testează totul, și vezi dacă ți se potrivește.</p>

      <h2 class="text-2xl font-bold text-navy mt-10 mb-4">Concluzie: Platforma potrivită pentru situația TA</h2>

      <p class="mb-4">Teachable e o platformă solidă, dovedită, cu milioane de utilizatori. Dar nu e neapărat cea mai bună alegere pentru un creator român care vinde către public românesc.</p>

      <p class="mb-4">Înainte de a te angaja la un abonament în dolari cu suport în engleză, pune-ți aceste întrebări:</p>

      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>De unde sunt majoritatea cursanților mei?</li>
        <li>Cât de confortabil sunt cu interfața în engleză?</li>
        <li>Îmi permit fluctuațiile de curs valutar?</li>
        <li>Am nevoie de funcțiile avansate pe care le plătesc?</li>
      </ul>

      <p class="mb-4">Dacă răspunsurile te îndreaptă către o alternativă locală, nu ezita. Poți oricând să migrezi mai târziu dacă situația se schimbă.</p>

      <p class="mb-6"><strong>Primul pas:</strong> Încearcă gratuit ambele platforme. Compară experiența. Și alege ce funcționează pentru tine și pentru cursanții tăi.</p>
    `
  }
};

const BlogPost = () => {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const post = slug ? blogPostsContent[slug] : null;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          url: url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiat!");
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <BlogHeader />
        <main className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-bold text-navy mb-4">Articol negăsit</h1>
          <p className="text-muted-foreground mb-8">
            Articolul pe care îl cauți nu există sau a fost șters.
          </p>
          <Link href="/blog">
            <Button variant="gold">Înapoi la blog</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-beige/60 to-background">
          <div className="container mx-auto px-4 py-12 lg:py-20 pt-24 lg:pt-32">
            <div className="max-w-3xl mx-auto">
              {/* Back link */}
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-navy mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Înapoi la blog
              </Link>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime} de citit</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-navy mb-4">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg text-muted-foreground">
                {post.excerpt}
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 py-8">
          <article className="max-w-3xl mx-auto">
            <div
              className="prose prose-lg max-w-none prose-headings:text-navy prose-a:text-gold prose-a:no-underline hover:prose-a:underline prose-li:my-1"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, { USE_PROFILES: { html: true } }) }}
            />
          </article>
        </section>

        {/* Share & Keywords */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-b border-border py-6">
            <div className="flex flex-wrap gap-2">
              {post.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="text-sm bg-beige/50 text-muted-foreground px-3 py-1 rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Distribuie
            </Button>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-navy to-navy/90 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">
              Vrei să creezi propriul curs online?
            </h2>
            <p className="text-white/80 mb-6">
              DoCourse te ajută să publici cursuri rapid, simplu și fără complicații tehnice.
            </p>
            <Link href="/">
              <Button variant="gold" size="lg">
                Începe gratuit acum
              </Button>
            </Link>
          </div>
        </section>

        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
