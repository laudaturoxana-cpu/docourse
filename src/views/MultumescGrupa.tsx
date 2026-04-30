"use client";
import Navbar from '../components/funnel/Navbar';
import Footer from '../components/funnel/Footer';
import Divider from '../components/funnel/Divider';
import { WHATSAPP, INSTAGRAM } from '../constants/links';

export default function MultumescGrupa() {
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
            Ești pe listă! 🎉
          </h1>
          <p className="text-[#3D4F6B] text-lg mb-8">
            Tocmai ți-am trimis un email de confirmare — verifică și folderul de spam dacă nu îl găsești.
          </p>
          <Divider className="my-8" />
          <h3 className="text-[#1B2A4A] font-medium mb-4">Ce urmează:</h3>
          <ul className="text-left text-[#3D4F6B] text-sm space-y-3 mb-10">
            <li>→ Când deschid oficial înscrierile ești primul anunțat</li>
            <li>→ Dacă ai întrebări scrie-mi direct pe WhatsApp</li>
            <li>→ Urmărește-mă pe Instagram pentru noutăți despre grupă</li>
          </ul>
          <div className="flex flex-col gap-3">
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#B8965A] text-white w-full py-4 text-sm tracking-widest uppercase hover:opacity-90 transition rounded text-center block"
            >
              URMĂREȘTE-MĂ PE INSTAGRAM
            </a>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#B8965A] text-[#B8965A] w-full py-4 text-sm tracking-widest uppercase hover:opacity-90 transition rounded text-center block"
            >
              SCRIE-MI PE WHATSAPP
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
