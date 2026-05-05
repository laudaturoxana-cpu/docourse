import Link from "next/link";
import Image from "next/image";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-navy text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <Logo size="lg" className="[&_span]:text-primary-foreground [&_.text-gold]:text-gold" />
            </div>
            <p className="text-beige/80 max-w-md leading-relaxed">
              Platforma românească all-in-one pentru creatori de cursuri online. 
              Simplu. Profesional. Fără bătăi de cap.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gold mb-4">Platformă</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-beige/80 hover:text-gold transition-colors">
                  Acasă
                </Link>
              </li>
              <li>
                <a href="#cum-functioneaza" className="text-beige/80 hover:text-gold transition-colors">
                  Cum funcționează
                </a>
              </li>
              <li>
                <a href="#pret" className="text-beige/80 hover:text-gold transition-colors">
                  Prețuri
                </a>
              </li>
              <li>
                <Link href="/blog" className="text-beige/80 hover:text-gold transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gold mb-4">Suport</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-beige/80 hover:text-gold transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a href="mailto:contact@docourse.ro" className="text-beige/80 hover:text-gold transition-colors">
                  contact@docourse.ro
                </a>
              </li>
              <li>
                <Link href="/login" className="text-beige/80 hover:text-gold transition-colors">
                  Autentificare
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/termeni-si-conditii" className="text-beige/80 hover:text-gold transition-colors">
                  Termeni și condiții
                </Link>
              </li>
              <li>
                <Link href="/politica-de-confidentialitate" className="text-beige/80 hover:text-gold transition-colors">
                  Politica de confidențialitate (GDPR)
                </Link>
              </li>
              <li>
                <Link href="/politica-cookies" className="text-beige/80 hover:text-gold transition-colors">
                  Politica cookies
                </Link>
              </li>
              <li>
                <Link href="/anpc-sol" className="text-beige/80 hover:text-gold transition-colors">
                  ANPC și SOL
                </Link>
              </li>
            </ul>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="https://anpc.ro/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center"
              >
                <Image
                  src="/legal/anpc-sal.svg"
                  alt="ANPC - Soluționarea alternativă a litigiilor"
                  width={120}
                  height={56}
                  className="h-14 w-auto rounded-md bg-white"
                />
              </a>
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center"
              >
                <Image
                  src="/legal/odr-sol.svg"
                  alt="Soluționarea online a litigiilor (ODR)"
                  width={120}
                  height={56}
                  className="h-14 w-auto rounded-md bg-white"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-navy-light">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-beige/60 text-sm">
              © 2026 DoCourse. Toate drepturile rezervate.
            </p>
            <p className="text-beige/60 text-sm">
              Creat cu 💛 în România
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
