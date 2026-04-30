"use client";
import { useState } from 'react';
import Navbar from '../components/funnel/Navbar';
import Footer from '../components/funnel/Footer';
import FormInscriere from '../components/funnel/FormInscriere';
import Divider from '../components/funnel/Divider';
import BadgeUrgenta from '../components/funnel/BadgeUrgenta';
import { useFadeIn } from '../hooks/useFadeIn';
import { WHATSAPP, INSTAGRAM } from '../constants/links';

const saptamani = [
  {
    titlu: 'Săptămâna 1: Brandul tău',
    descriere: 'Cine ești, pentru cine lucrezi și cum te diferențiezi. Clarificăm mesajul de bază înainte să scriem o virgulă pe site.',
  },
  {
    titlu: 'Săptămâna 2: Mesajul tău',
    descriere: 'Cum vorbești despre ceea ce faci — în cuvintele tale, pentru oamenii tăi. Scriem împreună textele cheie.',
  },
  {
    titlu: 'Săptămâna 3: Arhitectura site-ului',
    descriere: 'Structura site-ului, paginile cheie, ce conținut merge unde și de ce. Planul complet înainte de construcție.',
  },
  {
    titlu: 'Săptămâna 4: Construcția site-ului',
    descriere: 'Construim efectiv site-ul tău cu AI — live, în timp real. La finalul sesiunii ai prima versiune funcțională.',
  },
  {
    titlu: 'Săptămâna 5: Detaliile care fac diferența',
    descriere: 'Texte, imagini, micro-copy, SEO de bază. Tot ce transformă un site „ok" într-unul care convinge.',
  },
  {
    titlu: 'Săptămâna 6: Live',
    descriere: 'Lansare, feedback colectiv, ajustări finale. Ieși din sesiune cu site-ul live și cu încrederea că îl poți gestiona singur.',
  },
];

const faqItems = [
  {
    intrebare: 'Când începe programa?',
    raspuns:
      'Deschid o nouă grupă în curând. Când te înscrii pe lista de așteptare ești primul anunțat cu data exactă și condițiile de early bird.',
  },
  {
    intrebare: 'Trebuie să știu tehnică?',
    raspuns:
      'Nu. Construim cu AI și cu instrumente care nu necesită cunoștințe tehnice. Dacă știi să scrii un email, știi destul.',
  },
  {
    intrebare: 'Pot participa dacă nu am niciun site momentan?',
    raspuns:
      'Da, de fapt e mai simplu așa. Construim de la zero — fără să trebuiască să „dezfacem" ceva existent.',
  },
  {
    intrebare: 'Ce se întâmplă dacă nu pot la o sesiune live?',
    raspuns:
      'Fiecare sesiune e înregistrată și o primești în maximum 24 de ore. Nu pierzi nimic.',
  },
  {
    intrebare: 'Cât durează accesul la înregistrări?',
    raspuns: 'Ai acces permanent la înregistrările grupei tale. Nu există limită de timp.',
  },
  {
    intrebare: 'Care e diferența față de un curs online?',
    raspuns:
      'Lucrez cu tine, nu îți explic teoretic. Sesiunile sunt live, pe Zoom, și lucrăm pe brandul și site-ul tău specific. Nu urmărești lecții — construim împreună.',
  },
];

function FadeSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, fadeClass } = useFadeIn();
  return (
    <div ref={ref} className={`${fadeClass} ${className}`}>
      {children}
    </div>
  );
}

export default function Grupa() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="font-sans">
      <Navbar />

      {/* SECȚIUNEA 1 — HERO */}
      <section className="bg-[#F3EDE1] py-20 px-4">
        <FadeSection className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <BadgeUrgenta text="⚡ Early Bird — Primii 5 plătesc 450 EUR în loc de 500 EUR. 3 locuri rămase." />
          </div>
          <h1
            className="text-[#1B2A4A] text-4xl md:text-5xl leading-tight text-center mb-6"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700 }}
          >
            Brandul și site-ul tău profesional construit cu AI — în 6 săptămâni, împreună cu un grup de oameni ca tine.
          </h1>
          <p className="text-[#3D4F6B] text-lg text-center mb-8">
            Pentru coaches, terapeuți și consultanți cu clienți activi — care știu că online nu îi reprezintă și vor să schimbe asta fără să o facă singuri.
          </p>
          <FormInscriere
            redirectTo="/multumesc-grupa"
            ctaText="REZERVĂ-MI LOCUL — INTRU PE LISTĂ"
          />
          <p className="text-sm text-[#3D4F6B] text-center mt-3">
            Nu plătești nimic acum. Când deschid înscrierile ești primul anunțat.
          </p>
        </FadeSection>
      </section>

      {/* SECȚIUNEA 2 — DUREREA */}
      <section className="bg-[#1B2A4A] py-20 px-4">
        <FadeSection className="max-w-2xl mx-auto text-center">
          <h2
            className="text-[#F3EDE1] text-3xl md:text-4xl mb-8"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Știi senzația asta?
          </h2>
          <p className="text-[rgba(243,237,225,0.8)] text-lg leading-relaxed whitespace-pre-line">
            {`Trimiți pe cineva pe site-ul tău și te rogi să nu se uite prea atent.

Sau mai rău — nu ai niciun site și când te caută cineva serios, nu găsește nimic.

Ai clienți buni. Rezultate reale. Dar online parcă nu exiști.

Și știi că asta te costă — chiar dacă nu știi exact cât.

Ai mai încercat poate. Wix. WordPress. ChatGPT. Te-ai blocat și ai abandonat. Sau ai plătit o agenție și acum depinzi de ei pentru orice virgulă.`}
          </p>
          <Divider className="my-8" />
          <p className="text-[#F3EDE1] font-medium text-xl">
            Există o altă cale. Și nu trebuie să o faci singur.
          </p>
        </FadeSection>
      </section>

      {/* SECȚIUNEA 3 — CE ESTE */}
      <section className="bg-[#F3EDE1] py-20 px-4">
        <FadeSection className="max-w-2xl mx-auto text-center">
          <h2
            className="text-[#1B2A4A] text-3xl md:text-4xl mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Brand + Site cu AI în 6 săptămâni.
          </h2>
          <Divider className="my-6" />
          <p className="text-[#3D4F6B] text-lg leading-relaxed">
            Un program de mentorat în grup unde construim împreună — fiecare participant pleacă cu brandul și site-ul lui live la finalul săptămânii 6.
            <br /><br />
            Nu teorie. Nu tutoriale de urmărit singur. Sesiuni live pe Zoom în care lucrăm efectiv, în timp real.
          </p>
        </FadeSection>
      </section>

      {/* SECȚIUNEA 4 — CE PRIMEȘTI */}
      <section className="bg-white py-20 px-4">
        <FadeSection>
          <h2
            className="text-center text-[#1B2A4A] text-3xl mb-12"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Ce primești în cele 6 săptămâni
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Card 1 */}
            <div className="bg-[#F3EDE1] rounded-lg p-8 border border-[rgba(184,150,90,0.2)]">
              <svg className="w-8 h-8 text-[#B8965A] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" />
                <path d="M8 21h8M12 17v4" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h3 className="text-[#1B2A4A] font-medium mb-2">6 sesiuni live pe Zoom</h3>
              <p className="text-[#3D4F6B] text-sm">Câte 2 ore săptămânal — lucrăm direct pe brandul și site-ul tău</p>
            </div>
            {/* Card 2 */}
            <div className="bg-[#F3EDE1] rounded-lg p-8 border border-[rgba(184,150,90,0.2)]">
              <svg className="w-8 h-8 text-[#B8965A] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="7" r="4" strokeWidth="2" />
              </svg>
              <h3 className="text-[#1B2A4A] font-medium mb-2">Comunitate privată DoCoure</h3>
              <p className="text-[#3D4F6B] text-sm">Întrebări, feedback, conectare cu grupul pe toată durata programului</p>
            </div>
            {/* Card 3 */}
            <div className="bg-[#F3EDE1] rounded-lg p-8 border border-[rgba(184,150,90,0.2)]">
              <svg className="w-8 h-8 text-[#B8965A] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <polygon points="10,8 16,12 10,16" fill="currentColor" />
              </svg>
              <h3 className="text-[#1B2A4A] font-medium mb-2">Înregistrările sesiunilor</h3>
              <p className="text-[#3D4F6B] text-sm">Dacă nu poți live la o sesiune — o recuperezi oricând</p>
            </div>
            {/* Card 4 */}
            <div className="bg-[#F3EDE1] rounded-lg p-8 border border-[rgba(184,150,90,0.2)]">
              <svg className="w-8 h-8 text-[#B8965A] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" strokeWidth="2" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h3 className="text-[#1B2A4A] font-medium mb-2">Roxana prezentă constant</h3>
              <p className="text-[#3D4F6B] text-sm">În fiecare sesiune și în comunitate pe toată durata programului</p>
            </div>
          </div>
        </FadeSection>
      </section>

      {/* SECȚIUNEA 5 — STRUCTURA */}
      <section className="bg-[#F3EDE1] py-20 px-4">
        <FadeSection>
          <h2
            className="text-center text-[#1B2A4A] text-3xl mb-12"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Cum arată cele 6 săptămâni
          </h2>
          <div className="max-w-xl mx-auto">
            {saptamani.map((s, i) => (
              <div key={i} className="flex items-start gap-4 mb-6">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-[#B8965A] mt-1" />
                  {i < saptamani.length - 1 && (
                    <div className="w-px flex-1 bg-[#B8965A] mt-1 min-h-[2rem]" />
                  )}
                </div>
                <div className="pb-2">
                  <h3 className="text-[#1B2A4A] font-medium mb-1">{s.titlu}</h3>
                  <p className="text-[#3D4F6B] text-sm">{s.descriere}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeSection>
      </section>

      {/* SECȚIUNEA 6 — EARLY BIRD */}
      <section className="bg-[#1B2A4A] py-20 px-4">
        <FadeSection className="max-w-lg mx-auto text-center">
          <BadgeUrgenta text="3 locuri early bird rămase" />
          <div className="mt-8 mb-8">
            <p className="text-[rgba(243,237,225,0.5)] line-through text-2xl">500 EUR</p>
            <p
              className="text-[#B8965A] text-5xl font-bold"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              450 EUR
            </p>
            <p className="text-[rgba(243,237,225,0.7)] text-sm mt-1">primii 5 participanți</p>
          </div>
          <FormInscriere
            redirectTo="/multumesc-grupa"
            ctaText="REZERVĂ-MI LOCUL EARLY BIRD"
          />
          <p className="text-[rgba(243,237,225,0.6)] text-sm mt-3">Nu plătești nimic acum.</p>
        </FadeSection>
      </section>

      {/* SECȚIUNEA 7 — PENTRU CINE */}
      <section className="bg-[#F3EDE1] py-20 px-4">
        <FadeSection>
          <h2
            className="text-center text-[#1B2A4A] text-3xl mb-12"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Pentru cine e acest program
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-8 border border-[rgba(184,150,90,0.2)]">
              <h3 className="text-[#1B2A4A] mb-4 font-medium">Este pentru tine dacă:</h3>
              <ul className="text-[#3D4F6B] text-sm leading-relaxed space-y-3">
                <li>✅ Ești coach, terapeut sau consultant cu clienți activi</li>
                <li>✅ Vrei să ai un online care să te reprezinte cu adevărat</li>
                <li>✅ Ești dispus să investești 2 ore pe săptămână timp de 6 săptămâni</li>
                <li>✅ Vrei să înveți să îți gestionezi singur site-ul după aceea</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-8 border border-[rgba(184,150,90,0.2)]">
              <h3 className="text-[#1B2A4A] mb-4 font-medium">Nu este pentru tine dacă:</h3>
              <ul className="text-[#3D4F6B] text-sm leading-relaxed space-y-3">
                <li>❌ Ești la început și nu ai niciun client încă</li>
                <li>❌ Vrei un site ieftin „de probă" fără să investești în el</li>
                <li>❌ Nu ești dispus să lucrezi efectiv în sesiuni</li>
              </ul>
            </div>
          </div>
        </FadeSection>
      </section>

      {/* SECȚIUNEA 8 — TESTIMONIALE */}
      <section className="bg-white py-20 px-4">
        <FadeSection>
          <h2
            className="text-center text-[#1B2A4A] text-3xl mb-12"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Ce spun cei care au trecut prin program
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                initiale: 'DI',
                quote: 'Mi-era teamă că va fi tehnic și complicat. A fost exact invers. Roxana știe să facă simplu ceea ce pare imposibil.',
                nume: 'Diana Ionescu',
                rol: 'Coach de carieră',
                site: 'dianaionescu.ro',
              },
              {
                initiale: 'SA',
                quote: 'Am ieșit din grupă cu site-ul live și cu claritate despre mesajul meu. Două lucruri pe care le amânasem ani de zile.',
                nume: 'Simona Andrei',
                rol: 'Psihoterapeut',
                site: 'simonaandrei.ro',
              },
              {
                initiale: 'CC',
                quote: 'Valoarea nu e în site — e în tot ce s-a clarificat în minte în timp ce construiam. Recomand oricui.',
                nume: 'Cristina Constantin',
                rol: 'Consultant HR',
                site: 'cristinaconstantin.ro',
              },
            ].map((t, i) => (
              <div key={i} className="bg-[#F3EDE1] rounded-lg p-8 border border-[rgba(184,150,90,0.2)]">
                <div className="w-16 h-16 bg-[#1B2A4A] rounded-full flex items-center justify-center text-[#F3EDE1] text-lg font-medium mb-4">
                  {t.initiale}
                </div>
                <p className="text-[#3D4F6B] italic text-sm leading-relaxed mb-4" style={{ fontFamily: "'Jost', system-ui, sans-serif" }}>
                  „{t.quote}"
                </p>
                <Divider className="my-4" />
                <p className="text-[#1B2A4A] font-medium text-sm">{t.nume}</p>
                <p className="text-[#B8965A] text-xs">{t.rol} · {t.site}</p>
              </div>
            ))}
          </div>
        </FadeSection>
      </section>

      {/* SECȚIUNEA 9 — DESPRE ROXANA */}
      <section className="bg-[#F3EDE1] py-20 px-4">
        <FadeSection className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-[#1B2A4A] rounded-lg aspect-square flex items-center justify-center text-[#F3EDE1] text-lg">
              Foto Roxana
            </div>
            <div>
              <h2
                className="text-[#1B2A4A] text-3xl mb-6"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Cine sunt eu
              </h2>
              <p className="text-[#3D4F6B] leading-relaxed mb-4">
                Bună, sunt Roxana.
              </p>
              <p className="text-[#3D4F6B] leading-relaxed mb-4">
                Am construit roxanalaudatu.ro și am ajutat peste 190 de antreprenori și profesioniști să aibă un online care îi reprezintă.
              </p>
              <p className="text-[#3D4F6B] leading-relaxed mb-4">
                Nu am ajuns aici prin teorie — am ajuns prin a face: site-uri, branduri, strategii de conținut pentru oameni care aveau clienți buni și un online care nu îi reprezenta.
              </p>
              <p className="text-[#3D4F6B] leading-relaxed">
                Cred că fiecare om care lucrează profesional merită un online la fel de profesional ca munca lui. Și cred că asta nu ar trebui să necesite o agenție scumpă, ani de experiență tehnică sau un buget de marketing.
              </p>
              <div className="flex gap-8 mt-8">
                {[
                  { nr: '190+', label: 'clienți' },
                  { nr: '5+', label: 'ani experiență' },
                  { nr: '7 zile', label: 'de la zero la live' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p
                      className="text-[#B8965A] text-3xl font-bold"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {stat.nr}
                    </p>
                    <p className="text-[#1B2A4A] text-sm font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeSection>
      </section>

      {/* SECȚIUNEA 10 — FAQ */}
      <section className="bg-white py-20 px-4">
        <FadeSection>
          <h2
            className="text-center text-[#1B2A4A] text-3xl mb-12"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Întrebări frecvente
          </h2>
          <div className="max-w-2xl mx-auto">
            {faqItems.map((item, i) => (
              <div key={i} className="border-b border-[rgba(184,150,90,0.2)] py-4">
                <button
                  onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                  className="flex justify-between items-center w-full text-left"
                >
                  <span className="text-[#1B2A4A] font-medium">{item.intrebare}</span>
                  <svg
                    className={`w-5 h-5 text-[#B8965A] transition-transform duration-300 flex-shrink-0 ml-4 ${activeIndex === i ? 'rotate-180' : 'rotate-0'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeIndex === i && (
                  <p className="text-[#3D4F6B] text-sm leading-relaxed pt-3">{item.raspuns}</p>
                )}
              </div>
            ))}
          </div>
        </FadeSection>
      </section>

      {/* SECȚIUNEA 11 — CTA FINAL */}
      <section className="bg-[#1B2A4A] py-20 px-4">
        <FadeSection className="max-w-lg mx-auto text-center">
          <h2
            className="text-[#F3EDE1] text-3xl mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Dacă te-ai recunoscut — pasul următor e simplu.
          </h2>
          <p className="text-[rgba(243,237,225,0.7)] mb-8">
            Rezervă-ți locul pe lista de așteptare. Nu plătești nimic acum. Când deschid — ești primul.
          </p>
          <BadgeUrgenta text="⚡ Primii 5 — 450 EUR" />
          <div className="mt-6">
            <FormInscriere
              redirectTo="/multumesc-grupa"
              ctaText="REZERVĂ-MI LOCUL — INTRU PE LISTĂ"
            />
          </div>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#B8965A] text-sm mt-4 block underline underline-offset-2"
          >
            Sau scrie-mi direct pe WhatsApp
          </a>
        </FadeSection>
      </section>

      <Footer />
    </div>
  );
}
