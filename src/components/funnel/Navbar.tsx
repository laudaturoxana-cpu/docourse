import { CALENDLY } from '../../constants/links';

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-[rgba(184,150,90,0.15)] px-4 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <span
          className="text-[#1B2A4A] text-xl"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}
        >
          Roxana Lăudatu
        </span>
        <a
          href={CALENDLY}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#B8965A] text-white px-6 py-2 text-sm tracking-widest uppercase hover:opacity-90 transition rounded"
        >
          Rezervă Zoom gratuit
        </a>
      </div>
    </nav>
  );
}
