"use client";
import Navbar from '../components/funnel/Navbar';
import Footer from '../components/funnel/Footer';
import Divider from '../components/funnel/Divider';
import { WHATSAPP, DOCOURSE } from '../constants/links';

export default function MultumescTutorial() {
  return (
    <div className="font-sans">
      <Navbar />
      <section className="min-h-screen bg-[#F3EDE1] flex items-center justify-center py-20 px-4">
        <div className="max-w-lg mx-auto text-center w-full">
          <svg
            className="w-16 h-16 mx-auto mb-6"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="32" cy="32" r="32" fill="#22c55e" />
            <path
              d="M20 32l9 9 15-18"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1
            className="text-[#1B2A4A] text-4xl mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Accesul tău e pe drum! 🎉
          </h1>
          <p className="text-[#3D4F6B] text-lg mb-8">
            Tocmai ți-am trimis pe email linkul de acces la demo. Verifică inbox-ul — și folderul de spam dacă nu îl găsești în câteva minute.
          </p>
          <Divider className="my-8" />
          <p className="text-[#1B2A4A] font-medium mb-4">Între timp — intră în comunitate:</p>
          <ul className="text-left text-[#3D4F6B] text-sm space-y-2 mb-8">
            <li>→ Noutăți din zona AI</li>
            <li>→ Prompturi testate de mine</li>
            <li>→ Tips despre branding online</li>
            <li>→ Primul anunțat când deschid grupa</li>
          </ul>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-white rounded-lg p-6 border border-[rgba(184,150,90,0.2)]">
              <h3 className="text-[#1B2A4A] font-medium mb-2">Intră în comunitate</h3>
              <p className="text-[#3D4F6B] text-sm mb-4">Acces gratuit — te aștept acolo</p>
              <a
                href={DOCOURSE}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#B8965A] text-white w-full py-3 text-sm tracking-widest uppercase hover:opacity-90 transition rounded text-center block"
              >
                INTRU ÎN COMUNITATE
              </a>
            </div>
            <div className="bg-white rounded-lg p-6 border border-[rgba(184,150,90,0.2)]">
              <h3 className="text-[#1B2A4A] font-medium mb-2">Ai întrebări?</h3>
              <p className="text-[#3D4F6B] text-sm mb-4">Scrie-mi direct — răspund personal</p>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#B8965A] text-[#B8965A] w-full py-3 text-sm tracking-widest uppercase hover:opacity-90 transition rounded text-center block"
              >
                SCRIE-MI PE WHATSAPP
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
