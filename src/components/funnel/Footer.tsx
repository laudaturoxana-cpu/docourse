import { INSTAGRAM, WHATSAPP } from '../../constants/links';

export default function Footer() {
  return (
    <footer className="bg-[#1B2A4A] py-8 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-[#F3EDE1] text-sm mb-3">roxanalaudatu.ro | © 2026</p>
        <div className="flex items-center justify-center gap-6">
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F3EDE1] text-sm hover:text-[#B8965A] transition"
          >
            Instagram
          </a>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F3EDE1] text-sm hover:text-[#B8965A] transition"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
